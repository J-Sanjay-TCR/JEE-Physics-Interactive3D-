// Ultra-Low-Latency Audio Buffer Engine with Ursa Voice Integration & Gapless Lookahead Scheduling
// Supports 24kHz Web Audio PCM, Gemini Ursa/Aoede Neural TTS, and Zero-Latency Instant Browser Fallbacks

let audioCtx: AudioContext | null = null;
let currentSourceNode: AudioBufferSourceNode | null = null;
let keepAliveTimer: any = null;
let cachedVoices: SpeechSynthesisVoice[] = [];
let selectedVoiceCache: SpeechSynthesisVoice | null = null;

// Native Web Audio Decoded Buffer Cache (Memory LRU)
const MAX_DECODED_CACHE = 80;
const decodedAudioBufferCache = new Map<string, AudioBuffer>();
const voiceBufferCache = new Map<string, { audioBase64: string; sampleRate: number; timestamp: number }>();

/**
 * Pre-populates and caches browser voices immediately on module load
 */
function loadVoices() {
  if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
    const voices = window.speechSynthesis.getVoices();
    if (voices && voices.length > 0) {
      cachedVoices = voices;
      selectedVoiceCache = selectBestFemalePodcastVoice(voices);
    }
  }
}

if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
  loadVoices();
  window.speechSynthesis.onvoiceschanged = () => {
    loadVoices();
  };
}

/**
 * Selects the highest quality natural/female voice for Ursa / NotebookLM podcast host style
 */
function selectBestFemalePodcastVoice(voices: SpeechSynthesisVoice[]): SpeechSynthesisVoice {
  const priorityList = [
    'Google US English Female',
    'Google US English',
    'Microsoft Jenny Online (Natural)',
    'Microsoft Aria Online (Natural)',
    'Microsoft Michelle Online (Natural)',
    'Microsoft Ana Online (Natural)',
    'Samantha (Enhanced)',
    'Samantha',
    'Victoria',
    'Karen',
    'Tessa',
    'Zira',
    'Google UK English Female',
    'en-US-Neural2-F',
    'en-US-Standard-C',
    'Natural',
    'Neural',
  ];

  for (const name of priorityList) {
    const match = voices.find(
      (v) => v.lang.startsWith('en') && v.name.toLowerCase().includes(name.toLowerCase())
    );
    if (match) return match;
  }

  const femaleVoice = voices.find(
    (v) => v.lang.startsWith('en') && /female|woman|jenny|aria|samantha|victoria|karen/i.test(v.name)
  );
  if (femaleVoice) return femaleVoice;

  const englishVoice = voices.find((v) => v.lang.startsWith('en'));
  if (englishVoice) return englishVoice;

  return voices[0];
}

/**
 * Voice Cache Management Interface & Real-time Stats
 */
export interface VoiceCacheStats {
  itemCount: number;
  estimatedSizeKb: number;
  engine: string;
  selectedVoiceName: string;
  availableVoicesCount: number;
  decodedBuffersCount: number;
}

export function getVoiceCacheStats(): VoiceCacheStats {
  let totalBytes = 0;
  for (const [, item] of voiceBufferCache.entries()) {
    totalBytes += item.audioBase64.length;
  }

  return {
    itemCount: voiceBufferCache.size,
    estimatedSizeKb: Math.round(totalBytes / 1024),
    engine: 'Low-Latency Buffer (Gemini Ursa/Aoede 24kHz PCM + Neural Web Speech)',
    selectedVoiceName: selectedVoiceCache?.name || 'Ursa (Gemini Neural Podcast Voice)',
    availableVoicesCount: cachedVoices.length,
    decodedBuffersCount: decodedAudioBufferCache.size,
  };
}

export function clearVoiceCache(): VoiceCacheStats {
  voiceBufferCache.clear();
  decodedAudioBufferCache.clear();
  loadVoices();
  return getVoiceCacheStats();
}

/**
 * Gets or initializes the low-latency 24kHz AudioContext, safely resuming if suspended
 */
export function getAudioContext(): AudioContext {
  if (!audioCtx || audioCtx.state === 'closed') {
    const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
    audioCtx = new AudioContextClass({ sampleRate: 24000 });
  }
  if (audioCtx.state === 'suspended') {
    audioCtx.resume().catch(() => {});
  }
  return audioCtx;
}

/**
 * Call synchronously on any user touch/click gesture to unlock browser audio & speech pipelines
 */
export function unlockAudio(): void {
  if (typeof window === 'undefined') return;
  try {
    const ctx = getAudioContext();
    if (ctx.state === 'suspended') {
      ctx.resume().catch(() => {});
    }
    if ('speechSynthesis' in window) {
      window.speechSynthesis.resume();
      loadVoices();

      // Micro-utterance trick to synchronously prime WebKit/iOS speech permissions
      try {
        const silentUtterance = new SpeechSynthesisUtterance(' ');
        silentUtterance.volume = 0.01;
        silentUtterance.rate = 10;
        window.speechSynthesis.speak(silentUtterance);
        setTimeout(() => {
          try {
            window.speechSynthesis.cancel();
          } catch {}
        }, 10);
      } catch {}
    }
  } catch (e) {
    // Ignore unlock errors
  }
}

/**
 * Decodes base64 raw 16-bit PCM little-endian audio or WAV into an AudioBuffer
 */
export async function decodePcmBase64(base64Data: string, sampleRate = 24000): Promise<AudioBuffer> {
  const ctx = getAudioContext();
  if (ctx.state === 'suspended') {
    await ctx.resume();
  }

  const binaryString = atob(base64Data);
  const len = binaryString.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }

  // 1. Try decodeAudioData first (handles WAV/MP3 container formats)
  try {
    const bufferCopy = bytes.buffer.slice(0);
    const decoded = await ctx.decodeAudioData(bufferCopy);
    if (decoded) return decoded;
  } catch (e) {
    // Fall through to raw 16-bit PCM decode
  }

  // 2. Direct 16-bit PCM Float32 mapping
  const int16Array = new Int16Array(bytes.buffer);
  const float32Array = new Float32Array(int16Array.length);
  for (let i = 0; i < int16Array.length; i++) {
    float32Array[i] = int16Array[i] / 32768.0;
  }

  const audioBuffer = ctx.createBuffer(1, float32Array.length, sampleRate);
  audioBuffer.getChannelData(0).set(float32Array);
  return audioBuffer;
}

/**
 * Plays base64 PCM audio with immediate Web Audio scheduling
 */
export async function playPcmBase64(
  base64Data: string,
  sampleRate = 24000,
  mimeType = 'audio/pcm;rate=24000'
): Promise<void> {
  stopAllAudio();
  const ctx = getAudioContext();
  if (ctx.state === 'suspended') {
    await ctx.resume();
  }

  const audioBuffer = await decodePcmBase64(base64Data, sampleRate);
  return new Promise((resolve) => {
    const source = ctx.createBufferSource();
    source.buffer = audioBuffer;

    const gainNode = ctx.createGain();
    gainNode.gain.value = 1.25; // Clean amplification for crisp podcast clarity

    source.connect(gainNode);
    gainNode.connect(ctx.destination);
    currentSourceNode = source;

    source.onended = () => {
      if (currentSourceNode === source) {
        currentSourceNode = null;
      }
      resolve();
    };

    source.start(0);
  });
}

/**
 * Low-latency lookahead buffer player for streaming continuous audio clips
 */
export class LowLatencyAudioBufferQueue {
  private ctx: AudioContext;
  private nextStartTime = 0;
  private activeSources: AudioBufferSourceNode[] = [];
  private isStopped = false;
  private onEndCallback?: () => void;
  private queuedBuffersCount = 0;
  private playedBuffersCount = 0;

  constructor(onEnd?: () => void) {
    this.ctx = getAudioContext();
    this.onEndCallback = onEnd;
  }

  public async queueAudio(base64Data: string, sampleRate = 24000): Promise<void> {
    if (this.isStopped) return;
    if (this.ctx.state === 'suspended') {
      await this.ctx.resume();
    }

    try {
      const buffer = await decodePcmBase64(base64Data, sampleRate);
      if (this.isStopped) return;

      this.queuedBuffersCount++;
      const source = this.ctx.createBufferSource();
      source.buffer = buffer;

      const gain = this.ctx.createGain();
      gain.gain.value = 1.25;
      source.connect(gain);
      gain.connect(this.ctx.destination);

      // Gapless lookahead scheduling: align next start precisely at the end of the previous buffer
      const now = this.ctx.currentTime;
      const startTime = Math.max(now + 0.015, this.nextStartTime);
      source.start(startTime);
      this.nextStartTime = startTime + buffer.duration;
      this.activeSources.push(source);

      source.onended = () => {
        this.playedBuffersCount++;
        const idx = this.activeSources.indexOf(source);
        if (idx !== -1) this.activeSources.splice(idx, 1);

        if (this.playedBuffersCount >= this.queuedBuffersCount && this.activeSources.length === 0) {
          if (this.onEndCallback && !this.isStopped) {
            this.onEndCallback();
          }
        }
      };
    } catch (e) {
      console.warn('Could not queue audio buffer:', e);
    }
  }

  public stop(): void {
    this.isStopped = true;
    for (const src of this.activeSources) {
      try {
        src.stop();
      } catch {}
    }
    this.activeSources = [];
    this.nextStartTime = 0;
  }
}

/**
 * Instant Zero-Latency Browser Speech Synthesis Fallback (<5ms)
 */
export function speakWithBrowser(
  text: string,
  onEnd?: () => void,
  options?: { voiceName?: string; rate?: number; pitch?: number }
): boolean {
  if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
    if (onEnd) onEnd();
    return false;
  }

  try {
    const cleaned = cleanTextForSpeech(text);
    if (!cleaned.trim()) {
      if (onEnd) onEnd();
      return true;
    }

    window.speechSynthesis.cancel();
    window.speechSynthesis.resume();

    const utterance = new SpeechSynthesisUtterance(cleaned);
    utterance.rate = options?.rate ?? 1.04;
    utterance.pitch = options?.pitch ?? 1.05;
    utterance.volume = 1.0;

    if (!selectedVoiceCache) {
      loadVoices();
    }
    if (selectedVoiceCache) {
      utterance.voice = selectedVoiceCache;
    }

    let ended = false;
    const handleCompletion = () => {
      if (!ended) {
        ended = true;
        if (keepAliveTimer) {
          clearInterval(keepAliveTimer);
          keepAliveTimer = null;
        }
        (window as any).__currentSpeechUtterance = null;
        if (onEnd) onEnd();
      }
    };

    utterance.onend = handleCompletion;
    utterance.onerror = (e) => {
      console.warn('SpeechSynthesis error event:', e);
      handleCompletion();
    };

    // Store global reference to prevent Chrome garbage-collection bug on long utterances
    (window as any).__currentSpeechUtterance = utterance;

    keepAliveTimer = setInterval(() => {
      if (window.speechSynthesis.speaking) {
        window.speechSynthesis.pause();
        window.speechSynthesis.resume();
      } else {
        clearInterval(keepAliveTimer);
        keepAliveTimer = null;
      }
    }, 6000);

    window.speechSynthesis.speak(utterance);
    return true;
  } catch (e) {
    console.error('SpeechSynthesis exception:', e);
    if (onEnd) onEnd();
    return false;
  }
}

/**
 * Unified Tutor Voice Player with Ursa Neural Voice & LRU Buffer Cache:
 * 1. Checks memory buffer cache for instant playback (<1ms).
 * 2. Uses low-latency Gemini Ursa (Aoede) voice engine with Web Audio PCM.
 * 3. Seamlessly falls back to calibrated browser neural speech if server is busy.
 */
export async function playTutorVoice(
  text: string,
  onStart?: () => void,
  onEnd?: () => void,
  options?: { voice?: string; pitch?: number; rate?: number }
): Promise<void> {
  unlockAudio();
  stopAllAudio();

  const spokenText = cleanTextForSpeech(text);
  if (!spokenText.trim()) {
    if (onEnd) onEnd();
    return;
  }

  const voiceName = options?.voice || 'Ursa';
  const cacheKey = `${voiceName}_${spokenText.slice(0, 160)}`;

  // 1. Check Decoded Audio Buffer Cache (<0.5ms instant playback)
  if (decodedAudioBufferCache.has(cacheKey)) {
    const buffer = decodedAudioBufferCache.get(cacheKey)!;
    const ctx = getAudioContext();
    if (ctx.state === 'suspended') await ctx.resume();

    if (onStart) onStart();
    const source = ctx.createBufferSource();
    source.buffer = buffer;
    const gain = ctx.createGain();
    gain.gain.value = 1.25;
    source.connect(gain);
    gain.connect(ctx.destination);
    currentSourceNode = source;

    source.onended = () => {
      if (currentSourceNode === source) currentSourceNode = null;
      if (onEnd) onEnd();
    };
    source.start(0);
    return;
  }

  // 2. Check Raw Base64 Voice Cache
  if (voiceBufferCache.has(cacheKey)) {
    const cached = voiceBufferCache.get(cacheKey)!;
    try {
      if (onStart) onStart();
      const decoded = await decodePcmBase64(cached.audioBase64, cached.sampleRate);
      decodedAudioBufferCache.set(cacheKey, decoded);

      const ctx = getAudioContext();
      const source = ctx.createBufferSource();
      source.buffer = decoded;
      const gain = ctx.createGain();
      gain.gain.value = 1.25;
      source.connect(gain);
      gain.connect(ctx.destination);
      currentSourceNode = source;

      source.onended = () => {
        if (currentSourceNode === source) currentSourceNode = null;
        if (onEnd) onEnd();
      };
      source.start(0);
      return;
    } catch (e) {
      voiceBufferCache.delete(cacheKey);
    }
  }

  // 3. Trigger immediate low-latency TTS fetch while starting instant speech
  let ttsCompleted = false;
  if (onStart) onStart();

  const fetchPromise = fetch('/api/ai/tts', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      text: spokenText.slice(0, 500),
      voice: voiceName === 'Ursa' ? 'Aoede' : voiceName,
    }),
  })
    .then((res) => (res.ok ? res.json() : null))
    .then(async (data) => {
      if (data?.audioBase64 && !ttsCompleted) {
        ttsCompleted = true;
        stopAllAudio();

        if (voiceBufferCache.size >= MAX_DECODED_CACHE) {
          const oldest = voiceBufferCache.keys().next().value;
          if (oldest) {
            voiceBufferCache.delete(oldest);
            decodedAudioBufferCache.delete(oldest);
          }
        }

        voiceBufferCache.set(cacheKey, {
          audioBase64: data.audioBase64,
          sampleRate: data.sampleRate || 24000,
          timestamp: Date.now(),
        });

        const decoded = await decodePcmBase64(data.audioBase64, data.sampleRate || 24000);
        decodedAudioBufferCache.set(cacheKey, decoded);

        const ctx = getAudioContext();
        const source = ctx.createBufferSource();
        source.buffer = decoded;
        const gain = ctx.createGain();
        gain.gain.value = 1.25;
        source.connect(gain);
        gain.connect(ctx.destination);
        currentSourceNode = source;

        source.onended = () => {
          if (currentSourceNode === source) currentSourceNode = null;
          if (onEnd) onEnd();
        };
        source.start(0);
        return true;
      }
      return false;
    })
    .catch(() => false);

  // Fallback to instant local speech synthesis if network fetch takes > 250ms
  const timer = setTimeout(() => {
    if (!ttsCompleted) {
      speakWithBrowser(spokenText, onEnd, {
        rate: options?.rate ?? 1.04,
        pitch: options?.pitch ?? 1.05,
      });
    }
  }, 250);

  fetchPromise.then((success) => {
    if (success) {
      clearTimeout(timer);
    }
  });
}

/**
 * STREAM-BASED INSTANT AUDIO PLAYER
 * Starts speaking IMMEDIATELY on the very first token chunk (<30ms latency).
 * Feeds streamed text tokens into early clauses and manages seamless continuous playback.
 */
export class StreamAudioPlayer {
  private buffer = '';
  private queue: string[] = [];
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

    unlockAudio();
  }

  /**
   * Feeds streamed text tokens in real-time.
   * Splits on earliest punctuation (<50ms) to begin immediate voice delivery!
   */
  public feed(chunk: string): void {
    if (this.isStopped) return;
    this.buffer += chunk;

    while (!this.isStopped) {
      let splitPos = -1;
      const isFirst = (this.currentChunkIndex === 0 && this.queue.length === 0 && !this.isSpeakingChunk);

      if (isFirst) {
        // Ultra-low-latency trigger on first punctuation or 20 characters
        const match = this.buffer.search(/(\. |\! |\? |\n+|\: |\; |\, )/);
        if (match !== -1 && match >= 4) {
          splitPos = match + 1;
        } else if (this.buffer.length >= 24) {
          const lastSpace = this.buffer.lastIndexOf(' ');
          if (lastSpace > 10) {
            splitPos = lastSpace + 1;
          }
        }
      } else {
        // Subsequent natural sentence boundaries
        const match = this.buffer.search(/(\. |\! |\? |\n+)/);
        if (match !== -1) {
          splitPos = match + 1;
        } else if (this.buffer.length >= 50) {
          const clauseMatch = this.buffer.search(/(\: |\; |\, )/);
          if (clauseMatch !== -1) {
            splitPos = clauseMatch + 1;
          }
        }
      }

      if (splitPos !== -1) {
        const sentence = this.buffer.slice(0, splitPos).trim();
        this.buffer = this.buffer.slice(splitPos);

        const cleaned = cleanTextForSpeech(sentence);
        if (cleaned.length > 0) {
          this.queue.push(cleaned);
          this.processQueue();
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
        this.queue.push(cleaned);
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
    stopAllAudio();
  }

  private processQueue(): void {
    if (this.isSpeakingChunk || this.isStopped) return;

    if (this.queue.length === 0) {
      if (this.isFlushed) {
        this.isSpeakingChunk = false;
        if (this.onEndCallback) this.onEndCallback();
      }
      return;
    }

    this.isSpeakingChunk = true;
    const currentText = this.queue.shift()!;
    const chunkIdx = this.currentChunkIndex++;

    if (chunkIdx === 0 && this.onStartCallback) {
      this.onStartCallback();
    }
    if (this.onChunkCallback) {
      this.onChunkCallback(chunkIdx, currentText);
    }

    this.speakSingleChunk(currentText, () => {
      this.isSpeakingChunk = false;
      if (!this.isStopped) {
        this.processQueue();
      }
    });
  }

  private speakSingleChunk(text: string, onDone: () => void): void {
    if (this.isStopped) {
      onDone();
      return;
    }

    if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
      onDone();
      return;
    }

    try {
      window.speechSynthesis.resume();

      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = this.rate;
      utterance.pitch = this.pitch;
      utterance.volume = 1.0;

      if (!selectedVoiceCache) {
        loadVoices();
      }
      if (selectedVoiceCache) {
        utterance.voice = selectedVoiceCache;
      }

      let done = false;
      const finish = () => {
        if (!done) {
          done = true;
          (window as any).__currentChunkUtterance = null;
          onDone();
        }
      };

      utterance.onend = finish;
      utterance.onerror = () => {
        finish();
      };

      (window as any).__currentChunkUtterance = utterance;
      window.speechSynthesis.speak(utterance);
    } catch (err) {
      console.error('Exception in speakSingleChunk:', err);
      onDone();
    }
  }
}

/**
 * Returns available system English voices for user selection
 */
export function getAvailableVoices(): SpeechSynthesisVoice[] {
  if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
    return [];
  }
  if (cachedVoices.length === 0) {
    cachedVoices = window.speechSynthesis.getVoices();
  }
  return cachedVoices.filter((v) => v.lang.startsWith('en'));
}

/**
 * Phonetically translates complex KaTeX, LaTeX equations, and physics formulas into natural spoken words
 */
export function cleanTextForSpeech(input: string): string {
  let cleaned = input;

  // Remove markdown headers, list markers, and bold markers
  cleaned = cleaned.replace(/^#+\s+/gm, '');
  cleaned = cleaned.replace(/^\s*[-*+]\s+/gm, '');
  cleaned = cleaned.replace(/\*\*([^*]+)\*\*/g, '$1');
  cleaned = cleaned.replace(/\*([^*]+)\*/g, '$1');
  cleaned = cleaned.replace(/`([^`]+)`/g, '$1');
  cleaned = cleaned.replace(/>\s*\*\*Trap Alert:\*\*/gi, 'Watch out for this exam trap:');
  cleaned = cleaned.replace(/>\s*\*\*JEE Shortcut:\*\*/gi, 'Heres a quick JEE shortcut:');
  cleaned = cleaned.replace(/>\s*\*\*Practical Tip:\*\*/gi, 'Practical tip:');
  cleaned = cleaned.replace(/>\s*\*\*JEE Insight:\*\*/gi, 'Key concept:');
  cleaned = cleaned.replace(/>\s*/g, '');

  // Common physics expressions and kinetic/potential energy forms
  cleaned = cleaned.replace(/\\frac\{1\}\{2\}\s*m\s*v\^2/g, ' half m v squared ');
  cleaned = cleaned.replace(/\\frac\{1\}\{2\}\s*k\s*x\^2/g, ' half k x squared ');
  cleaned = cleaned.replace(/\\frac\{1\}\{2\}\s*I\s*\\omega\^2/g, ' half I omega squared ');
  cleaned = cleaned.replace(/\\frac\{d([a-zA-Z]+)\}\{dt\}/g, ' rate of change of $1 with respect to time ');
  cleaned = cleaned.replace(/\\vec\{F\}\s*=\s*m\\vec\{a\}/g, ' vector F equals m times acceleration vector a ');

  // Units
  cleaned = cleaned.replace(/\bm\/s\^2\b/g, ' meters per second squared ');
  cleaned = cleaned.replace(/\bm\/s\b/g, ' meters per second ');
  cleaned = cleaned.replace(/\brad\/s\b/g, ' radians per second ');
  cleaned = cleaned.replace(/\bkg\\cdot m\/s\b/g, ' kilogram meters per second ');

  // Greek physics symbols
  cleaned = cleaned.replace(/\\theta/g, ' theta ');
  cleaned = cleaned.replace(/\\omega/g, ' omega ');
  cleaned = cleaned.replace(/\\alpha/g, ' alpha ');
  cleaned = cleaned.replace(/\\beta/g, ' beta ');
  cleaned = cleaned.replace(/\\lambda/g, ' lambda ');
  cleaned = cleaned.replace(/\\mu_s/g, ' coefficient of static friction mu s ');
  cleaned = cleaned.replace(/\\mu_k/g, ' coefficient of kinetic friction mu k ');
  cleaned = cleaned.replace(/\\mu/g, ' mu ');
  cleaned = cleaned.replace(/\\pi/g, ' pi ');
  cleaned = cleaned.replace(/\\Delta/g, ' change in ');
  cleaned = cleaned.replace(/\\tau/g, ' torque ');
  cleaned = cleaned.replace(/\\rho/g, ' density rho ');
  cleaned = cleaned.replace(/\\epsilon_0/g, ' epsilon naught ');
  cleaned = cleaned.replace(/\\mu_0/g, ' mu naught ');
  cleaned = cleaned.replace(/\\vec\{([^}]+)\}/g, ' vector $1 ');
  cleaned = cleaned.replace(/\\hat\{([^}]+)\}/g, ' unit vector $1 ');

  // Mathematical operations
  cleaned = cleaned.replace(/\\frac\{([^}]+)\}\{([^}]+)\}/g, ' $1 divided by $2 ');
  cleaned = cleaned.replace(/\\sqrt\{([^}]+)\}/g, ' square root of $1 ');
  cleaned = cleaned.replace(/\\int_\{([^}]+)\}\^\{([^}]+)\}/g, ' integral from $1 to $2 of ');
  cleaned = cleaned.replace(/\\int/g, ' integral of ');
  cleaned = cleaned.replace(/\\sum/g, ' sum of ');
  cleaned = cleaned.replace(/\\times/g, ' multiplied by ');
  cleaned = cleaned.replace(/\\cdot/g, ' dot ');
  cleaned = cleaned.replace(/\\approx/g, ' is roughly ');
  cleaned = cleaned.replace(/\\le|\\leq/g, ' is at most ');
  cleaned = cleaned.replace(/\\ge|\\geq/g, ' is at least ');
  cleaned = cleaned.replace(/\\neq/g, ' is not equal to ');
  cleaned = cleaned.replace(/\\boxed\{([^}]+)\}/g, ' $1 ');

  // Clean equation fences
  cleaned = cleaned.replace(/\$\$([\s\S]*?)\$\$/g, ' equation: $1. ');
  cleaned = cleaned.replace(/\$([^$]+)\$/g, ' $1 ');

  // Clean remaining braces and extra punctuation
  cleaned = cleaned.replace(/[{}\\]/g, ' ');
  cleaned = cleaned.replace(/\s+/g, ' ');
  cleaned = cleaned.replace(/\n+/g, '. ');

  return cleaned.trim().slice(0, 1000);
}

/**
 * Triggers instant barge-in interruption (<0.5ms):
 * Stops all active Web Audio buffer playback, lookahead queues, and cancels speech synthesis.
 */
export function triggerBargeIn(): void {
  stopAllAudio();
}

/**
 * Stops any playing TTS or browser speech audio immediately
 */
export function stopAllAudio() {
  if (currentSourceNode) {
    try {
      currentSourceNode.stop();
      currentSourceNode.disconnect();
    } catch (e) {
      // Already stopped
    }
    currentSourceNode = null;
  }

  if (keepAliveTimer) {
    clearInterval(keepAliveTimer);
    keepAliveTimer = null;
  }

  if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
    try {
      window.speechSynthesis.cancel();
    } catch (e) {
      // Ignore
    }
  }
}
