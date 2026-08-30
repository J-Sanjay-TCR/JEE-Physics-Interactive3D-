export class StreamAudioPlayer {
  private buffer = '';
  private queue: { text: string, audioPromise: Promise<AudioBuffer | null> }[] = [];
  private isSpeakingChunk = false;
  private isFlushed = false;
  private isStopped = false;
  private currentChunkIndex = 0;
  private rate: number;
  private pitch: number;
  private voice: string;
  private onStartCallback?: () => void;
  private onChunkCallback?: (chunkIndex: number, text: string) => void;
  private onEndCallback?: () => void;
  private abortController: AbortController | null = null;

  constructor(options?: {
    voice?: string;
    rate?: number;
    pitch?: number;
    onStart?: () => void;
    onChunk?: (chunkIndex: number, text: string) => void;
    onEnd?: () => void;
  }) {
    this.voice = options?.voice || 'Ursa';
    this.rate = options?.rate ?? 1.04;
    this.pitch = options?.pitch ?? 1.05;
    this.onStartCallback = options?.onStart;
    this.onChunkCallback = options?.onChunk;
    this.onEndCallback = options?.onEnd;
    this.abortController = new AbortController();

    activeStreamPlayerInstance = this;
    unlockAudio();
  }

  public feed(chunk: string): void {
    if (this.isStopped) return;
    this.buffer += chunk;

    while (!this.isStopped) {
      let splitPos = -1;
      const isFirst = (this.currentChunkIndex === 0 && this.queue.length === 0 && !this.isSpeakingChunk);

      if (isFirst) {
        const match = this.buffer.search(/(\. |\! |\? |\n+|\: |\; |\, )/);
        if (match !== -1 && match >= 4) {
          splitPos = match + 1;
        } else if (this.buffer.length >= 24) {
          const lastSpace = this.buffer.lastIndexOf(' ');
          if (lastSpace > 10) splitPos = lastSpace + 1;
        }
      } else {
        const match = this.buffer.search(/(\. |\! |\? |\n+)/);
        if (match !== -1) {
          splitPos = match + 1;
        } else if (this.buffer.length >= 50) {
          const clauseMatch = this.buffer.search(/(\: |\; |\, )/);
          if (clauseMatch !== -1) splitPos = clauseMatch + 1;
        }
      }

      if (splitPos !== -1) {
        const sentence = this.buffer.slice(0, splitPos).trim();
        this.buffer = this.buffer.slice(splitPos);

        const cleaned = cleanTextForSpeech(sentence);
        if (cleaned.length > 0) {
          this.enqueueChunk(cleaned);
        }
      } else {
        break;
      }
    }
  }

  public flush(): void {
    if (this.isStopped) return;
    this.isFlushed = true;

    if (this.buffer.trim().length > 0) {
      const cleaned = cleanTextForSpeech(this.buffer.trim());
      if (cleaned.length > 0) {
        this.enqueueChunk(cleaned);
      }
      this.buffer = '';
    }

    this.processQueue();
  }

  public stop(): void {
    this.isStopped = true;
    this.isSpeakingChunk = false;
    this.queue = [];
    this.buffer = '';
    if (this.abortController) {
      try { this.abortController.abort(); } catch(e) {}
    }
    stopAllAudio();
  }
  
  private enqueueChunk(text: string) {
    const voiceName = this.voice === 'Ursa' ? 'Aoede' : this.voice;
    const promise = fetch('/api/ai/tts', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text, voice: voiceName }),
      signal: this.abortController?.signal
    })
    .then(res => res.ok ? res.json() : null)
    .then(async data => {
      if (data?.audioBase64) {
         return await decodePcmBase64(data.audioBase64, data.sampleRate || 24000);
      }
      return null;
    })
    .catch(() => null);
    
    this.queue.push({ text, audioPromise: promise });
    this.processQueue();
  }

  private async processQueue(): Promise<void> {
    if (this.isSpeakingChunk || this.isStopped) return;

    if (this.queue.length === 0) {
      if (this.isFlushed) {
        this.isSpeakingChunk = false;
        if (this.onEndCallback) this.onEndCallback();
      }
      return;
    }

    this.isSpeakingChunk = true;
    const item = this.queue.shift()!;
    const chunkIdx = this.currentChunkIndex++;

    if (chunkIdx === 0 && this.onStartCallback) {
      this.onStartCallback();
    }
    if (this.onChunkCallback) {
      this.onChunkCallback(chunkIdx, item.text);
    }

    const buffer = await item.audioPromise;
    if (this.isStopped) return;
    
    if (buffer) {
      try {
        const ctx = getAudioContext();
        if (ctx.state === 'suspended') await ctx.resume();
        const source = ctx.createBufferSource();
        source.buffer = buffer;
        const gain = ctx.createGain();
        gain.gain.value = 1.25;
        source.connect(gain);
        gain.connect(ctx.destination);
        
        currentSourceNode = source;
        source.onended = () => {
          if (currentSourceNode === source) currentSourceNode = null;
          this.isSpeakingChunk = false;
          if (!this.isStopped) this.processQueue();
        };
        source.start(0);
      } catch (e) {
        this.speakBrowserFallback(item.text, () => {
          this.isSpeakingChunk = false;
          if (!this.isStopped) this.processQueue();
        });
      }
    } else {
      this.speakBrowserFallback(item.text, () => {
        this.isSpeakingChunk = false;
        if (!this.isStopped) this.processQueue();
      });
    }
  }

  private speakBrowserFallback(text: string, onDone: () => void): void {
    if (this.isStopped || typeof window === 'undefined' || !('speechSynthesis' in window)) {
      onDone();
      return;
    }
    try {
      window.speechSynthesis.resume();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = this.rate;
      utterance.pitch = this.pitch;
      utterance.volume = 1.0;
      if (!selectedVoiceCache) loadVoices();
      if (selectedVoiceCache) utterance.voice = selectedVoiceCache;
      let done = false;
      const finish = () => {
        if (!done) { done = true; (window as any).__currentChunkUtterance = null; onDone(); }
      };
      utterance.onend = finish;
      utterance.onerror = finish;
      (window as any).__currentChunkUtterance = utterance;
      window.speechSynthesis.speak(utterance);
    } catch (err) {
      onDone();
    }
  }
}
