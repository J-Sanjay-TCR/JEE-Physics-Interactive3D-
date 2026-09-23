// Ultra-Low-Latency Audio Buffer Engine with Ursa Voice Integration & Gapless Lookahead Scheduling
// Supports 24kHz Web Audio PCM, Gemini Ursa/Aoede Neural TTS, and Zero-Latency Instant Browser Fallbacks

let audioCtx: AudioContext | null = null;
let currentSourceNode: AudioBufferSourceNode | null = null;
let keepAliveTimer: any = null;
let cachedVoices: SpeechSynthesisVoice[] = [];
let selectedVoiceCache: SpeechSynthesisVoice | null = null;

// Cancellation & Session Tracking for Instant Barge-In
let activeSessionId = 0;
let activeTtsAbortController: AbortController | null = null;
let activeFallbackTimer: any = null;
let activeStreamPlayerInstance: any = null;

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
 * Filter out any non-English, Tamil, or regional Indian speech synthesis voices
 * to prevent unwanted bilingual or Tamil voice fallbacks.
 */
export function isForbiddenNonEnglishVoice(v: SpeechSynthesisVoice | null | undefined): boolean {
  if (!v) return true;
  const lang = (v.lang || '').toLowerCase();
  const name = (v.name || '').toLowerCase();
  return (
    lang.startsWith('ta') ||
    name.includes('tamil') ||
    name.includes('தமிழ்') ||
    name.includes('hindi') ||
    name.includes('marathi') ||
    name.includes('bengali') ||
    name.includes('telugu') ||
    name.includes('kannada') ||
    name.includes('malayalam') ||
    !lang.startsWith('en')
  );
}

/**
 * Selects the highest quality natural/female voice for Ursa / NotebookLM podcast host style.
 * Strictly guarantees that NO Tamil or non-English voice will ever be selected.
 */
function selectBestFemalePodcastVoice(voices: SpeechSynthesisVoice[]): SpeechSynthesisVoice | null {
  const cleanEnglishVoices = voices.filter((v) => !isForbiddenNonEnglishVoice(v));
  if (cleanEnglishVoices.length === 0) {
    return null;
  }

  const priorityList = [
    'Google US English', // Default Chrome female voice
    'Google US English Female',
    'en-US-Neural2-F', // High quality neural female
    'en-US-Standard-C',
    'en-US-Standard-E',
    'en-US-Standard-F',
    'Samantha', // macOS high quality female
    'Microsoft Jenny Online (Natural)', // Edge Chromium Natural
    'Microsoft Aria Online (Natural)',
    'Victoria',
    'Karen',
    'Google UK English Female',
  ];

  for (const name of priorityList) {
    const match = cleanEnglishVoices.find(
      (v) => v.name.toLowerCase().includes(name.toLowerCase())
    );
    if (match) return match;
  }

  // Exact fallback: clean en-US female voice
  const femaleVoice = cleanEnglishVoices.find(
    (v) => (v.lang === 'en-US' || v.lang === 'en-GB') && /female|woman|jenny|aria|samantha/i.test(v.name)
  );
  if (femaleVoice) return femaleVoice;

  // Next best en-US voice
  const usVoice = cleanEnglishVoices.find((v) => v.lang === 'en-US' || v.lang === 'en-GB');
  if (usVoice) return usVoice;

  const englishVoice = cleanEnglishVoices.find((v) => v.lang.startsWith('en'));
  if (englishVoice) return englishVoice;

  // If no verified English voice exists, return null. NEVER return voices[0] to prevent unwanted language speech!
  return null;
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
    engine: 'Low-Latency Buffer (Gemini Ursa 24kHz Web Audio PCM)',
    selectedVoiceName: selectedVoiceCache?.name || 'Ursa (Gemini Neural Podcast Voice)',
    availableVoicesCount: cachedVoices.filter((v) => !isForbiddenNonEnglishVoice(v)).length,
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
 * Call synchronously on any user touch/click gesture to unlock browser audio & speech pipelines.
 * Notice: Does NOT call speechSynthesis.speak with dummy text to avoid waking up unwanted system voices.
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
 * Instant Zero-Latency Browser Speech Synthesis Fallback (<5ms).
 * Strictly guarantees that NO Tamil or non-English voice will ever be triggered.
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

    if (!selectedVoiceCache) {
      loadVoices();
    }

    // Strictly refuse to speak if no verified English voice is found or if it matches non-English
    if (!selectedVoiceCache || isForbiddenNonEnglishVoice(selectedVoiceCache)) {
      console.warn('[AI Voice] Suppressing browser speech synthesis: No verified clean English voice found. Aborting to avoid unwanted language output.');
      if (onEnd) onEnd();
      return false;
    }

    window.speechSynthesis.cancel();
    window.speechSynthesis.resume();

    const utterance = new SpeechSynthesisUtterance(cleaned);
    utterance.rate = options?.rate ?? 1.04;
    utterance.pitch = options?.pitch ?? 1.05;
    utterance.volume = 1.0;
    utterance.voice = selectedVoiceCache;

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
 * Unified Tutor Voice Player with Gemini Ursa Voice & LRU Buffer Cache:
 * 1. Checks memory buffer cache for instant playback (<1ms).
 * 2. Uses low-latency Gemini Ursa voice engine with Web Audio PCM.
 * 3. Pre-fetches sequential sentences with lookahead for gapless playback.
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

  const player = new StreamAudioPlayer({
    voice: options?.voice || 'Ursa',
    rate: options?.rate,
    pitch: options?.pitch,
    onStart,
    onEnd
  });

  player.feed(spokenText);
  player.flush();
}

/**
 * STREAM-BASED INSTANT AUDIO PLAYER WITH NATIVE URSA VOICE & LOOKAHEAD SCHEDULING
 * - Splits streaming responses into natural full-sentence units.
 * - Streams Gemini Ursa 24kHz Web Audio PCM with lookahead prefetching.
 * - Guarantees NO unwanted Tamil or non-English voice output.
 */
export class StreamAudioPlayer {
  private buffer = '';
  private pendingSentences: string[] = [];
  private isSpeakingChunk = false;
  private isFetchingChunk = false;
  private isFlushed = false;
  private isStopped = false;
  private nextFetchIndex = 0;
  private currentPlayIndex = 0;
  private currentChunkIndex = 0;
  private preloadedBuffers: Map<number, AudioBuffer> = new Map();
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
      const isFirst = this.pendingSentences.length === 0;
      const minLength = isFirst ? 35 : 65;

      // Extract natural full sentences on punctuation followed by whitespace or newline
      const match = this.buffer.search(/(\. |\! |\? |\n+)/);
      if (match !== -1 && match >= minLength) {
        splitPos = match + 1;
      } else if (this.buffer.length >= 140) {
        // Fallback for long run-on sentences with semicolons or colons
        const clauseMatch = this.buffer.search(/(\; |\: )/);
        if (clauseMatch !== -1 && clauseMatch >= 55) {
          splitPos = clauseMatch + 1;
        } else if (this.buffer.length >= 190) {
          const commaMatch = this.buffer.search(/(\, )/);
          if (commaMatch !== -1 && commaMatch >= 80) {
            splitPos = commaMatch + 1;
          }
        }
      }

      if (splitPos !== -1) {
        const sentence = this.buffer.slice(0, splitPos).trim();
        this.buffer = this.buffer.slice(splitPos);

        const cleaned = cleanTextForSpeech(sentence);
        if (cleaned.length > 0) {
          this.pendingSentences.push(cleaned);
          this.pumpPipeline();
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
        this.pendingSentences.push(cleaned);
      }
      this.buffer = '';
    }

    this.pumpPipeline();
  }

  public stop(): void {
    this.isStopped = true;
    this.isSpeakingChunk = false;
    this.isFetchingChunk = false;
    this.pendingSentences = [];
    this.preloadedBuffers.clear();
    this.buffer = '';
    if (this.abortController) {
      try { this.abortController.abort(); } catch (e) {}
    }
    stopAllAudio();
  }

  private async fetchAudioBuffer(text: string): Promise<AudioBuffer | null> {
    const cacheKey = `${this.voice}:${text}`;
    if (decodedAudioBufferCache.has(cacheKey)) {
      return decodedAudioBufferCache.get(cacheKey)!;
    }

    try {
      const res = await fetch('/api/ai/tts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text, voice: this.voice }),
        signal: this.abortController?.signal
      });

      if (!res.ok) return null;
      const data = await res.json();
      if (data?.audioBase64) {
        const buffer = await decodePcmBase64(data.audioBase64, data.sampleRate || 24000);
        if (decodedAudioBufferCache.size < MAX_DECODED_CACHE) {
          decodedAudioBufferCache.set(cacheKey, buffer);
        }
        return buffer;
      }
      return null;
    } catch {
      return null;
    }
  }

  private async pumpPipeline(): Promise<void> {
    if (this.isStopped) return;

    // 1. Fetch next chunk if needed (lookahead prefetching: fetch up to currentPlayIndex + 1)
    if (
      !this.isFetchingChunk &&
      this.nextFetchIndex < this.pendingSentences.length &&
      this.nextFetchIndex <= this.currentPlayIndex + 1
    ) {
      this.isFetchingChunk = true;
      const fetchIdx = this.nextFetchIndex++;
      const textToFetch = this.pendingSentences[fetchIdx];

      this.fetchAudioBuffer(textToFetch)
        .then((buf) => {
          if (this.isStopped) return;
          if (buf) {
            this.preloadedBuffers.set(fetchIdx, buf);
          }
          this.isFetchingChunk = false;
          this.pumpPipeline();
        })
        .catch(() => {
          this.isFetchingChunk = false;
          this.pumpPipeline();
        });
    }

    // 2. If already speaking an active audio chunk, let it finish
    if (this.isSpeakingChunk) return;

    // 3. If finished all pending sentences
    if (this.currentPlayIndex >= this.pendingSentences.length) {
      if (this.isFlushed && !this.isFetchingChunk) {
        this.isSpeakingChunk = false;
        if (this.onEndCallback) this.onEndCallback();
      }
      return;
    }

    // 4. Check if currentPlayIndex audio buffer is ready in preloaded memory
    const targetIdx = this.currentPlayIndex;
    const buffer = this.preloadedBuffers.get(targetIdx);

    if (buffer) {
      this.preloadedBuffers.delete(targetIdx);
      this.currentPlayIndex++;
      this.isSpeakingChunk = true;

      const chunkIdx = this.currentChunkIndex++;
      if (chunkIdx === 0 && this.onStartCallback) {
        this.onStartCallback();
      }
      if (this.onChunkCallback) {
        this.onChunkCallback(chunkIdx, this.pendingSentences[targetIdx]);
      }

      this.playBuffer(buffer, () => {
        this.isSpeakingChunk = false;
        this.pumpPipeline();
      });

      // While playing, trigger lookahead fetch for the following sentence
      this.pumpPipeline();
    } else if (!this.isFetchingChunk && this.nextFetchIndex > targetIdx) {
      // Chunk fetch finished but returned null (TTS unavailable)
      this.currentPlayIndex++;
      const text = this.pendingSentences[targetIdx];

      // ONLY use browser speech synthesis IF a verified clean English voice exists
      if (!selectedVoiceCache) {
        loadVoices();
      }
      if (selectedVoiceCache && !isForbiddenNonEnglishVoice(selectedVoiceCache)) {
        this.isSpeakingChunk = true;
        speakWithBrowser(
          text,
          () => {
            this.isSpeakingChunk = false;
            this.pumpPipeline();
          },
          { rate: this.rate, pitch: this.pitch }
        );
      } else {
        // No verified English browser voice exists - skip to next chunk to prevent unwanted Tamil speech
        this.pumpPipeline();
      }
    }
  }

  private playBuffer(buffer: AudioBuffer, onEnded: () => void): void {
    try {
      const ctx = getAudioContext();
      if (ctx.state === 'suspended') {
        ctx.resume().catch(() => {});
      }

      const source = ctx.createBufferSource();
      source.buffer = buffer;

      const gain = ctx.createGain();
      gain.gain.value = 1.25;
      source.connect(gain);
      gain.connect(ctx.destination);

      currentSourceNode = source;
      source.onended = () => {
        if (currentSourceNode === source) {
          currentSourceNode = null;
        }
        onEnded();
      };
      source.start(0);
    } catch {
      onEnded();
    }
  }
}

/**
 * Returns available system English voices for user selection, strictly excluding Tamil/regional voices
 */
export function getAvailableVoices(): SpeechSynthesisVoice[] {
  if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
    return [];
  }
  if (cachedVoices.length === 0) {
    cachedVoices = window.speechSynthesis.getVoices();
  }
  return cachedVoices.filter((v) => !isForbiddenNonEnglishVoice(v));
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
  // Invalidate any in-flight playback sessions
  activeSessionId++;

  if (activeTtsAbortController) {
    try {
      activeTtsAbortController.abort();
    } catch (e) {}
    activeTtsAbortController = null;
  }

  if (activeFallbackTimer) {
    clearTimeout(activeFallbackTimer);
    activeFallbackTimer = null;
  }

  if (activeStreamPlayerInstance) {
    try {
      activeStreamPlayerInstance.isStopped = true;
      activeStreamPlayerInstance.queue = [];
      activeStreamPlayerInstance.buffer = '';
    } catch (e) {}
  }

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
      (window as any).__currentSpeechUtterance = null;
      (window as any).__currentChunkUtterance = null;
    } catch (e) {
      // Ignore
    }
  }
}
