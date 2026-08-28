import React, { useState, useEffect, useRef, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { PhysicsConcept } from '../../types';
import {
  Bot,
  Sparkles,
  Send,
  X,
  Zap,
  BookOpen,
  Check,
  Copy,
  LogOut,
  Layers,
  Calculator,
  Lightbulb,
  AlertTriangle,
  AlertCircle,
  RefreshCw,
  Mic,
  MicOff,
  Volume2,
  VolumeX,
  Globe,
  BrainCircuit,
  ExternalLink,
  Database,
  Trash2,
} from 'lucide-react';
import { MathMarkdown } from './MathMarkdown';
import { Latex } from './Latex';
import { getConceptDerivation } from '../../data/conceptDerivations';
import {
  playPcmBase64,
  speakWithBrowser,
  stopAllAudio,
  triggerBargeIn,
  playTutorVoice,
  unlockAudio,
  StreamAudioPlayer,
  getVoiceCacheStats,
  clearVoiceCache,
  VoiceCacheStats,
} from '../../utils/audioPlayer';
import { AudioWaveformVisualizer } from './AudioWaveformVisualizer';

interface WebSource {
  title: string;
  uri: string;
}

interface Message {
  role: 'user' | 'assistant';
  text: string;
  isVoiceInput?: boolean;
  thinkingModeActive?: boolean;
  webSources?: WebSource[];
}

interface AiPhysicsTutorModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentConcept: PhysicsConcept;
  currentParams: Record<string, number>;
}

export const AiPhysicsTutorModal: React.FC<AiPhysicsTutorModalProps> = ({
  isOpen,
  onClose,
  currentConcept,
  currentParams,
}) => {
  const [tutorTab, setTutorTab] = useState<'chat' | 'derivation' | 'shortcuts'>('chat');
  const [question, setQuestion] = useState('');
  const [loading, setLoading] = useState(false);
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);

  // Advanced Mode Switches
  const [thinkingMode, setThinkingMode] = useState<boolean>(true); // Default ON for deep JEE Advanced reasoning
  const [enableWebSearch, setEnableWebSearch] = useState<boolean>(true); // Access external data from the web
  const [autoVoiceResponse, setAutoVoiceResponse] = useState<boolean>(true); // Auto-speak when voice asked
  const [voiceTone, setVoiceTone] = useState<'friendly' | 'coach'>('friendly');
  const [voiceSpeed, setVoiceSpeed] = useState<number>(1.03);

  // Voice Recording & Dual-Engine Speech Recognition State
  const [isRecording, setIsRecording] = useState<boolean>(false);
  const [isTranscribing, setIsTranscribing] = useState<boolean>(false);
  const [audioLevel, setAudioLevel] = useState<number>(0);
  const [speechError, setSpeechError] = useState<string | null>(null);

  const recognitionRef = useRef<any>(null);
  const isManuallyStoppedRef = useRef<boolean>(true);
  const restartTimerRef = useRef<any>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const micStreamRef = useRef<MediaStream | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const animFrameRef = useRef<number | null>(null);
  const accumulatedTranscriptRef = useRef<string>('');
  const speechSilenceTimerRef = useRef<any>(null);

  // Audio Playback & Voice Cache State
  const [playingMessageIndex, setPlayingMessageIndex] = useState<number | null>(null);
  const [isGeneratingVoice, setIsGeneratingVoice] = useState<boolean>(false);
  const [showVoiceCacheModal, setShowVoiceCacheModal] = useState<boolean>(false);
  const [voiceCacheStats, setVoiceCacheStats] = useState<VoiceCacheStats>(getVoiceCacheStats());
  const activeStreamPlayerRef = useRef<StreamAudioPlayer | null>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

  // Instant Barge-In State & Feedback
  const [isBargeInActive, setIsBargeInActive] = useState<boolean>(false);
  const [bargeInReason, setBargeInReason] = useState<string>('Voice Interrupted');
  const bargeInTimerRef = useRef<any>(null);

  const refreshCacheStats = () => {
    setVoiceCacheStats(getVoiceCacheStats());
  };

  const handleClearCache = () => {
    const updated = clearVoiceCache();
    setVoiceCacheStats(updated);
  };

  const inputRef = useRef<HTMLInputElement>(null);
  const chatBottomRef = useRef<HTMLDivElement>(null);

  /**
   * Instant Barge-In Interruption Handler (<0.5ms)
   * Instantly stops audio playback, cancels speech synthesis, halts lookahead queues,
   * aborts ongoing streaming requests, and resets SpeechRecognition object state when
   * a user starts speaking over the tutor.
   */
  const handleBargeIn = (reason = 'user_interrupted') => {
    let wasActive = false;

    // 1. Immediately kill running StreamAudioPlayer instance
    if (activeStreamPlayerRef.current) {
      try {
        activeStreamPlayerRef.current.stop();
      } catch (e) {}
      activeStreamPlayerRef.current = null;
      wasActive = true;
    }

    // 2. Clear playing message highlight
    if (playingMessageIndex !== null) {
      wasActive = true;
      setPlayingMessageIndex(null);
    }

    if (isGeneratingVoice) {
      wasActive = true;
      setIsGeneratingVoice(false);
    }

    // 3. Cut off all Web Audio buffers and browser speech synthesis synchronously
    triggerBargeIn();

    // 4. Abort in-flight streaming fetch if still streaming tokens
    if (abortControllerRef.current) {
      try {
        abortControllerRef.current.abort();
      } catch (e) {}
      abortControllerRef.current = null;
      setLoading(false);
      wasActive = true;
    }

    // 5. Reset SpeechRecognition object state if user interrupted while speaking over tutor
    // This purges any audio bleed / echo from tutor's speaker output and begins listening cleanly
    if (reason === 'live_voice_interruption' || reason === 'interrupt_button') {
      if (!isManuallyStoppedRef.current && recognitionRef.current) {
        try {
          recognitionRef.current.abort();
        } catch (e) {}
        accumulatedTranscriptRef.current = '';
        setQuestion('');
      }
    }

    // 6. Provide responsive visual feedback to user
    if (wasActive) {
      setIsBargeInActive(true);
      const readableReason =
        reason === 'live_voice_interruption'
          ? '⚡ Spoken Voice Interruption: Tutor paused to listen!'
          : reason === 'interrupt_button'
          ? '⚡ Tutor Interrupted: Ready for your next doubt'
          : reason === 'typing_input'
          ? '⚡ Typing Interruption: Audio paused'
          : '⚡ Tutor Interrupted';

      setBargeInReason(readableReason);

      if (bargeInTimerRef.current) clearTimeout(bargeInTimerRef.current);
      bargeInTimerRef.current = setTimeout(() => {
        setIsBargeInActive(false);
      }, 2600);
    }
  };

  // Clean up mic streams and audio analysers safely
  const cleanupMicStreams = () => {
    if (animFrameRef.current) {
      cancelAnimationFrame(animFrameRef.current);
      animFrameRef.current = null;
    }
    if (restartTimerRef.current) {
      clearTimeout(restartTimerRef.current);
      restartTimerRef.current = null;
    }
    if (speechSilenceTimerRef.current) {
      clearTimeout(speechSilenceTimerRef.current);
      speechSilenceTimerRef.current = null;
    }
    if (micStreamRef.current) {
      micStreamRef.current.getTracks().forEach((track) => {
        try {
          track.stop();
        } catch (e) {}
      });
      micStreamRef.current = null;
    }
    if (audioContextRef.current && audioContextRef.current.state !== 'closed') {
      try {
        audioContextRef.current.close();
      } catch (e) {}
      audioContextRef.current = null;
    }
    analyserRef.current = null;
    setAudioLevel(0);
  };

  /**
   * Helper to detect if speech is a trailing incomplete clause or filler sound
   */
  const isIncompleteFragment = (text: string): boolean => {
    const trimmed = text.trim().toLowerCase();
    if (!trimmed) return true;

    // Single filler noises
    const singleFillers = ['uh', 'um', 'ah', 'oh', 'er', 'hmm', 'huh', 'a', 'the', 'so', 'ok', 'okay', 'like'];
    const words = trimmed.split(/\s+/);
    if (words.length === 1 && singleFillers.includes(words[0])) {
      return true;
    }

    // Trailing open connectors or prepositions where user is mid-thought
    const trailingConnectors = [
      'and', 'or', 'but', 'because', 'what if', 'so', 'where', 'if', 'when', 'with',
      'like', 'calculate', 'derivative of', 'integral of', 'in', 'at', 'to', 'for',
      'then', 'since', 'which', 'that', 'how to', 'why is', 'such as', 'is', 'are',
      'the', 'a', 'an', 'of', 'as', 'than', 'into', 'about', 'from', 'between', 'during'
    ];

    const lastWord = words[words.length - 1];
    const lastTwoWords = words.slice(-2).join(' ');

    if (trailingConnectors.includes(lastWord) || trailingConnectors.includes(lastTwoWords)) {
      return true;
    }

    return false;
  };

  /**
   * Computes dynamic debounce delay in ms based on sentence completeness
   */
  const getDebounceDelayForSpeech = (text: string): number => {
    const trimmed = text.trim();
    if (!trimmed) return 2500;

    const words = trimmed.split(/\s+/);

    // If terminated with punctuation marks (?, ., !), the student has concluded their sentence
    if (/[?.!]$/.test(trimmed)) {
      return 1500;
    }

    // If it's a trailing fragment or very short query (<= 2 words), allow extra pause time
    if (isIncompleteFragment(trimmed) || words.length <= 2) {
      return 3000;
    }

    // Standard complete statement threshold
    return 2200;
  };

  /**
   * Schedules debounced speech finalization to avoid processing partial sentence fragments
   */
  const scheduleDebouncedSpeechProcessing = (transcript: string) => {
    if (isManuallyStoppedRef.current) return;

    if (speechSilenceTimerRef.current) {
      clearTimeout(speechSilenceTimerRef.current);
      speechSilenceTimerRef.current = null;
    }

    const trimmed = transcript.trim();
    if (!trimmed || trimmed.length < 2) return;

    const delay = getDebounceDelayForSpeech(trimmed);

    speechSilenceTimerRef.current = setTimeout(() => {
      if (!isManuallyStoppedRef.current && accumulatedTranscriptRef.current.trim().length > 1) {
        const candidate = accumulatedTranscriptRef.current.trim();
        // If trailing connector detected after delay, extend once if student might still speak
        if (isIncompleteFragment(candidate) && candidate.split(/\s+/).length <= 2) {
          // Give one more brief grace window before stopping or waiting for manual submit
          return;
        }
        stopVoiceRecording(true);
      }
    }, delay);
  };

  /**
   * Stop voice recording and process speech input with dual-engine fallback
   */
  const stopVoiceRecording = async (shouldSend = true) => {
    isManuallyStoppedRef.current = true;
    setIsRecording(false);

    if (restartTimerRef.current) {
      clearTimeout(restartTimerRef.current);
      restartTimerRef.current = null;
    }

    if (speechSilenceTimerRef.current) {
      clearTimeout(speechSilenceTimerRef.current);
      speechSilenceTimerRef.current = null;
    }

    // 1. Stop SpeechRecognition engine
    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch (e) {}
      recognitionRef.current = null;
    }

    // 2. Stop MediaRecorder engine and capture audio blobs
    let recordedAudioBlob: Blob | null = null;
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      try {
        await new Promise<void>((resolve) => {
          if (!mediaRecorderRef.current) return resolve();
          mediaRecorderRef.current.onstop = () => {
            if (audioChunksRef.current.length > 0) {
              recordedAudioBlob = new Blob(audioChunksRef.current, {
                type: mediaRecorderRef.current?.mimeType || 'audio/webm',
              });
            }
            resolve();
          };
          mediaRecorderRef.current.stop();
        });
      } catch (e) {
        console.warn('Error stopping MediaRecorder:', e);
      }
    }
    mediaRecorderRef.current = null;

    // Cleanup mic stream
    cleanupMicStreams();

    if (!shouldSend) return;

    const speechText = accumulatedTranscriptRef.current.trim();

    // Verify speech text has meaningful content (not just a single noise artifact)
    if (speechText.length > 1) {
      const words = speechText.split(/\s+/);
      const isSingleFiller = words.length === 1 && ['uh', 'um', 'ah', 'oh', 'a', 'the'].includes(words[0].toLowerCase());
      if (!isSingleFiller) {
        setQuestion(speechText);
        handleSend(speechText, true);
        accumulatedTranscriptRef.current = '';
        return;
      }
    }

    // If Web Speech API had no result or failed, fallback to Gemini Multimodal Audio Transcriber
    if (recordedAudioBlob && (recordedAudioBlob as Blob).size > 500) {
      setIsTranscribing(true);
      setSpeechError(null);

      try {
        const reader = new FileReader();
        const base64Promise = new Promise<string>((resolve, reject) => {
          reader.onloadend = () => resolve(reader.result as string);
          reader.onerror = reject;
          reader.readAsDataURL(recordedAudioBlob as Blob);
        });

        const dataUrl = await base64Promise;
        const res = await fetch('/api/ai/transcribe', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            audioBase64: dataUrl,
            mimeType: (recordedAudioBlob as Blob).type || 'audio/webm',
          }),
        });

        if (res.ok) {
          const data = await res.json();
          if (data.transcript && data.transcript.trim()) {
            const finalTranscript = data.transcript.trim();
            setQuestion(finalTranscript);
            handleSend(finalTranscript, true);
            accumulatedTranscriptRef.current = '';
            setIsTranscribing(false);
            return;
          }
        }
      } catch (err) {
        console.error('Error during fallback audio transcription:', err);
      } finally {
        setIsTranscribing(false);
      }
    }

    // If no speech was detected
    if (!speechText) {
      setSpeechError('No speech detected. Please speak closer to your microphone or type your question.');
      setTimeout(() => setSpeechError(null), 4000);
    }
  };

  /**
   * Initializes and binds Web Speech API recognition instance with resilient error recovery
   * and automatic restart loop listeners.
   */
  const bindSpeechRecognitionInstance = () => {
    if (isManuallyStoppedRef.current) return;

    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (!SpeechRecognition) {
      console.warn('[Web Speech API] SpeechRecognition not natively supported on this browser.');
      return;
    }

    try {
      if (recognitionRef.current) {
        try {
          recognitionRef.current.abort();
        } catch (e) {}
        recognitionRef.current = null;
      }

      const recognition = new SpeechRecognition();
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = 'en-US';
      recognition.maxAlternatives = 1;

      recognition.onstart = () => {
        setIsRecording(true);
        setSpeechError(null);
      };

      // Native audio and speech onset events for instant barge-in
      recognition.onaudiostart = () => {
        if (playingMessageIndex !== null || isGeneratingVoice) {
          handleBargeIn('live_voice_interruption');
        }
      };

      recognition.onspeechstart = () => {
        if (playingMessageIndex !== null || isGeneratingVoice) {
          handleBargeIn('live_voice_interruption');
        }
      };

      recognition.onsoundstart = () => {
        if (playingMessageIndex !== null || isGeneratingVoice) {
          handleBargeIn('live_voice_interruption');
        }
      };

      recognition.onresult = (event: any) => {
        if (playingMessageIndex !== null || isGeneratingVoice) {
          handleBargeIn('live_voice_interruption');
        }

        let interimTranscript = '';
        let finalTranscript = '';

        for (let i = 0; i < event.results.length; i++) {
          const res = event.results[i];
          if (res.isFinal) {
            finalTranscript += res[0].transcript + ' ';
          } else {
            interimTranscript += res[0].transcript;
          }
        }

        const combined = (finalTranscript + interimTranscript).trim();

        if (combined) {
          accumulatedTranscriptRef.current = combined;
          setQuestion(combined);

          // Intelligent debounced processing: wait for user to conclude their thought or sentence
          scheduleDebouncedSpeechProcessing(combined);
        }
      };

      // Error handler with restart loop resilience
      recognition.onerror = (event: any) => {
        const err = event.error;
        console.warn('[Web Speech API] Recognition error encountered:', err);

        if (err === 'not-allowed' || err === 'service-not-allowed') {
          setSpeechError('Microphone permission blocked. Please allow microphone access in your browser settings.');
          isManuallyStoppedRef.current = true;
          setIsRecording(false);
          cleanupMicStreams();
        } else if (err === 'audio-capture') {
          setSpeechError('No microphone detected or audio capture is unavailable.');
          isManuallyStoppedRef.current = true;
          setIsRecording(false);
          cleanupMicStreams();
        } else if (err === 'no-speech') {
          // Benign silence event: listener loop will continue in onend
        } else if (err === 'aborted') {
          // Triggered during barge-in reset or tab switch: listener loop handles restart if active
        } else if (err === 'network') {
          console.warn('[Web Speech API] Network transient issue. Retrying in listener loop...');
        }
      };

      // End event listener to restart listener loop seamlessly
      recognition.onend = () => {
        if (!isManuallyStoppedRef.current) {
          if (restartTimerRef.current) clearTimeout(restartTimerRef.current);
          restartTimerRef.current = setTimeout(() => {
            if (!isManuallyStoppedRef.current) {
              try {
                recognition.start();
              } catch (restartErr: any) {
                // If the recognition instance is in an unrecoverable state, re-instantiate cleanly
                if (restartErr.name !== 'InvalidStateError') {
                  bindSpeechRecognitionInstance();
                }
              }
            }
          }, 60);
        }
      };

      recognitionRef.current = recognition;
      recognition.start();
    } catch (recErr: any) {
      console.warn('[Web Speech API] Could not start SpeechRecognition instance:', recErr);
    }
  };

  /**
   * Starts microphone capture, initializes live audio meter, and runs dual speech engines
   */
  const startVoiceRecording = async () => {
    isManuallyStoppedRef.current = false;
    handleBargeIn('mic_activated');
    unlockAudio();

    setSpeechError(null);
    accumulatedTranscriptRef.current = '';
    audioChunksRef.current = [];

    try {
      // 1. Explicitly request and bind user microphone stream
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
        },
      });
      micStreamRef.current = stream;

      // 2. Setup Web Audio Analyser for Realtime Volume Meter & Live Barge-In VAD
      try {
        const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
        const audioCtx = new AudioCtx();
        audioContextRef.current = audioCtx;
        const source = audioCtx.createMediaStreamSource(stream);
        const analyser = audioCtx.createAnalyser();
        analyser.fftSize = 256;
        source.connect(analyser);
        analyserRef.current = analyser;

        const dataArray = new Uint8Array(analyser.frequencyBinCount);
        let consecutiveVoiceFrames = 0;

        const updateAudioMeter = () => {
          if (!analyserRef.current) return;
          analyserRef.current.getByteFrequencyData(dataArray);

          let sum = 0;
          for (let i = 0; i < dataArray.length; i++) {
            sum += dataArray[i];
          }
          const average = sum / dataArray.length;
          const normalized = Math.min(100, Math.round((average / 128) * 100));
          setAudioLevel(normalized);

          // Live Voice Activity Detection for Barge-In while AI is speaking
          if (normalized > 18) {
            consecutiveVoiceFrames++;
            if (consecutiveVoiceFrames >= 2) {
              if (playingMessageIndex !== null || isGeneratingVoice) {
                handleBargeIn('live_voice_interruption');
              }
              // If user is vocalizing and there is pending transcript, refresh debounce to prevent cutoffs
              if (accumulatedTranscriptRef.current && accumulatedTranscriptRef.current.trim().length > 1) {
                scheduleDebouncedSpeechProcessing(accumulatedTranscriptRef.current);
              }
            }
          } else {
            consecutiveVoiceFrames = 0;
          }

          animFrameRef.current = requestAnimationFrame(updateAudioMeter);
        };
        updateAudioMeter();
      } catch (audioErr) {
        console.warn('Could not initialize audio visualizer analyser:', audioErr);
      }

      // 3. Initialize MediaRecorder for high-accuracy fallback recording
      try {
        const options = MediaRecorder.isTypeSupported('audio/webm;codecs=opus')
          ? { mimeType: 'audio/webm;codecs=opus' }
          : MediaRecorder.isTypeSupported('audio/mp4')
          ? { mimeType: 'audio/mp4' }
          : undefined;

        const mediaRecorder = new MediaRecorder(stream, options);
        mediaRecorder.ondataavailable = (event) => {
          if (event.data && event.data.size > 0) {
            audioChunksRef.current.push(event.data);
          }
        };
        mediaRecorderRef.current = mediaRecorder;
        mediaRecorder.start(250); // Slice chunks every 250ms
      } catch (mrErr) {
        console.warn('MediaRecorder not available or supported:', mrErr);
      }

      // 4. Initialize Web Speech API Recognition with listener loop
      bindSpeechRecognitionInstance();

      setIsRecording(true);
    } catch (err: any) {
      console.error('Error accessing microphone:', err);
      if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError') {
        setSpeechError('Microphone permission blocked. Please allow microphone access in your browser settings.');
      } else {
        setSpeechError('Could not connect to microphone. Please check your audio device.');
      }
      cleanupMicStreams();
      setIsRecording(false);
      isManuallyStoppedRef.current = true;
    }
  };

  /**
   * Toggle Voice Recording state
   */
  const toggleVoiceRecording = () => {
    if (isRecording) {
      stopVoiceRecording(true);
    } else {
      startVoiceRecording();
    }
  };

  // Derivation data for active concept
  const derivation = useMemo(() => {
    return getConceptDerivation(currentConcept.id);
  }, [currentConcept.id]);

  // Initial welcome greeting - NotebookLM Female Podcast Host Persona
  const initialGreeting = useMemo(() => {
    const formulasList = currentConcept.formulas
      .slice(0, 2)
      .map((f) => `$$\\mathbf{${f.name}:} \\quad ${f.latex}$$`)
      .join('\n\n');

    return `Oh wow, hey there! Welcome to the Deep Dive on **${currentConcept.title}**! Let's unpack the physics together so you get 100% crystal-clear clarity.

### 📐 Master Formula:
${formulasList}

💡 **What do you want to explore first?**
- *"Right, so why does this formula actually work in real life?"*
- *"What's the #1 trap that catches almost everyone in JEE on this topic?"*
- *"Give me a 30-second shortcut to crack numerical questions here."*
- *"Derive the calculus step-by-step with real-life analogies."*

Hit **Voice Doubt** to speak or tap **Interrupt** anytime while I'm speaking!`;
  }, [currentConcept]);

  const [messages, setMessages] = useState<Message[]>([
    {
      role: 'assistant',
      text: initialGreeting,
    },
  ]);

  // Reset messages when concept changes
  useEffect(() => {
    setMessages([
      {
        role: 'assistant',
        text: initialGreeting,
      },
    ]);
  }, [initialGreeting]);

  // Cleanup audio, recording & body scroll lock on unmount or close
  useEffect(() => {
    if (!isOpen) {
      handleBargeIn('modal_closed');
      stopVoiceRecording(false);
      cleanupMicStreams();
    } else {
      // Prevent background scrolling when AI tutor is open
      const originalOverflow = document.body.style.overflow;
      document.body.style.overflow = 'hidden';

      const focusTimer = setTimeout(() => {
        inputRef.current?.focus();
      }, 300);

      return () => {
        clearTimeout(focusTimer);
        document.body.style.overflow = originalOverflow;
      };
    }
  }, [isOpen]);

  // Handle Escape key
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  // Focus input
  useEffect(() => {
    if (isOpen && tutorTab === 'chat') {
      setTimeout(() => {
        inputRef.current?.focus();
      }, 100);
    }
  }, [isOpen, tutorTab]);

  // Scroll to bottom on message
  useEffect(() => {
    if (isOpen && tutorTab === 'chat') {
      chatBottomRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, loading, isOpen, tutorTab]);

  // Play voice response for a message with Gemini Ursa Neural Podcast Voice
  const playVoiceResponse = async (text: string, msgIndex: number) => {
    if (playingMessageIndex === msgIndex) {
      handleBargeIn('voice_play_toggle');
      return;
    }

    unlockAudio();
    handleBargeIn('play_voice_start');
    setPlayingMessageIndex(msgIndex);
    setIsGeneratingVoice(true);

    try {
      await playTutorVoice(
        text,
        () => {
          setIsGeneratingVoice(false);
          setPlayingMessageIndex(msgIndex);
        },
        () => {
          setIsGeneratingVoice(false);
          setPlayingMessageIndex(null);
          refreshCacheStats();
        },
        { voice: 'Ursa', rate: voiceSpeed, pitch: 1.05 }
      );
    } catch (err) {
      console.error('Error playing tutor voice:', err);
      setIsGeneratingVoice(false);
      setPlayingMessageIndex(null);
    }
  };

  const quickPrompts = [
    `Right, so why does this formula actually work in real life?`,
    `What's the #1 trap that catches almost everyone in JEE on this topic?`,
    `Give me a 30-second shortcut to crack questions on this topic`,
    `Derive core equations step-by-step with real-life analogies`,
    `Who founded this app, and what is its aim & motto?`,
    `What are the full specifications & features of this app?`,
  ];

  const handleSend = async (customText?: string, wasVoiceInput = false) => {
    const textToSend = customText || question;
    if (!textToSend.trim() || loading) return;

    // Barge-in: cut off any playing audio or stream immediately
    handleBargeIn('new_question');
    unlockAudio();
    setTutorTab('chat');

    const userMsg: Message = { role: 'user', text: textToSend, isVoiceInput: wasVoiceInput };
    const assistantMsgIndex = messages.length + 1;

    // Placeholder assistant message for live real-time token streaming
    const initialAssistantMsg: Message = {
      role: 'assistant',
      text: '',
      thinkingModeActive: thinkingMode,
    };

    const newMessages: Message[] = [...messages, userMsg, initialAssistantMsg];
    setMessages(newMessages);
    setQuestion('');
    setLoading(true);

    const shouldPlayVoice = wasVoiceInput || autoVoiceResponse;
    let streamPlayer: StreamAudioPlayer | null = null;

    if (shouldPlayVoice) {
      setPlayingMessageIndex(assistantMsgIndex);
      setIsGeneratingVoice(true);
      streamPlayer = new StreamAudioPlayer({
        voice: 'Ursa',
        rate: voiceSpeed,
        pitch: 1.05,
        onStart: () => {
          setIsGeneratingVoice(false);
          setPlayingMessageIndex(assistantMsgIndex);
        },
        onEnd: () => {
          setIsGeneratingVoice(false);
          setPlayingMessageIndex(null);
          activeStreamPlayerRef.current = null;
          refreshCacheStats();
        },
      });
      activeStreamPlayerRef.current = streamPlayer;
    }

    let finalText = '';

    // Create abort controller for in-flight cancellation
    const abortController = new AbortController();
    abortControllerRef.current = abortController;

    try {
      const response = await fetch('/api/ai/ask-stream', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        signal: abortController.signal,
        body: JSON.stringify({
          question: textToSend,
          conceptTitle: currentConcept.title,
          currentParams,
          thinkingMode,
          enableWebSearch,
          isVoiceInput: wasVoiceInput,
        }),
      });

      if (!response.ok || !response.body) {
        throw new Error('Streaming response failed');
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let accumulatedText = '';
      let webSources: WebSource[] = [];
      let buffer = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n');
        buffer = lines.pop() || '';

        for (const line of lines) {
          const trimmed = line.trim();
          if (trimmed.startsWith('data: ')) {
            try {
              const parsed = JSON.parse(trimmed.slice(6));
              if (parsed.chunk) {
                accumulatedText += parsed.chunk;
                if (streamPlayer) {
                  streamPlayer.feed(parsed.chunk);
                }
                setMessages((prev) => {
                  const copy = [...prev];
                  const lastIdx = copy.length - 1;
                  if (copy[lastIdx] && copy[lastIdx].role === 'assistant') {
                    copy[lastIdx] = {
                      ...copy[lastIdx],
                      text: accumulatedText,
                    };
                  }
                  return copy;
                });
              }
              if (parsed.webSources && parsed.webSources.length > 0) {
                webSources = parsed.webSources;
              }
              if (parsed.done) {
                if (parsed.fullText && !accumulatedText) {
                  accumulatedText = parsed.fullText;
                  if (streamPlayer) {
                    streamPlayer.feed(parsed.fullText);
                  }
                }
              }
            } catch (e) {
              // Ignore partial chunk JSON errors
            }
          }
        }
      }

      finalText = accumulatedText || generateFallbackResponse(textToSend, currentConcept, derivation, currentParams);

      // Finalize message with complete text and sources
      setMessages((prev) => {
        const copy = [...prev];
        const lastIdx = copy.length - 1;
        if (copy[lastIdx] && copy[lastIdx].role === 'assistant') {
          copy[lastIdx] = {
            ...copy[lastIdx],
            text: finalText,
            webSources: webSources.length > 0 ? webSources : copy[lastIdx].webSources,
          };
        }
        return copy;
      });
    } catch (err: any) {
      if (err.name === 'AbortError' || err.message?.includes('aborted')) {
        // User intentionally barged in; do not treat as failure
        return;
      }
      console.error('Error during streaming:', err);
      if (streamPlayer) {
        streamPlayer.stop();
        activeStreamPlayerRef.current = null;
        setPlayingMessageIndex(null);
        setIsGeneratingVoice(false);
      }
      finalText = generateFallbackResponse(textToSend, currentConcept, derivation, currentParams);
      setMessages((prev) => {
        const copy = [...prev];
        const lastIdx = copy.length - 1;
        if (copy[lastIdx] && copy[lastIdx].role === 'assistant') {
          copy[lastIdx] = {
            role: 'assistant',
            text: finalText,
          };
        } else {
          copy.push({ role: 'assistant', text: finalText });
        }
        return copy;
      });
      if (shouldPlayVoice && finalText) {
        playVoiceResponse(finalText, assistantMsgIndex);
      }
    } finally {
      abortControllerRef.current = null;
      setLoading(false);
      if (streamPlayer) {
        streamPlayer.flush();
      }
    }
  };

  const handleCopy = (text: string, idx: number) => {
    navigator.clipboard.writeText(text);
    setCopiedIndex(idx);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2, ease: 'easeOut' }}
          onClick={(e) => {
            if (e.target === e.currentTarget) {
              onClose();
            }
          }}
          className="fixed inset-0 z-[100] flex items-center justify-center p-0 sm:p-4 bg-black/95 backdrop-blur-3xl overflow-hidden pointer-events-auto"
          role="dialog"
          aria-modal="true"
          aria-labelledby="ai-tutor-title"
          onMouseDown={(e) => e.stopPropagation()}
          onTouchStart={(e) => e.stopPropagation()}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.96, y: 12 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.97, y: 8 }}
            transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
            onClick={(e) => e.stopPropagation()}
            className="bg-[#0D0F18] border-0 sm:border-2 sm:border-cyan-500/30 rounded-none sm:rounded-2xl w-full max-w-4xl flex flex-col h-[100dvh] sm:h-[92vh] max-h-[100dvh] shadow-2xl overflow-hidden cursor-default text-zinc-200 select-text touch-auto relative"
          >
            {/* Header: Title, Model Badge & Exit */}
            <div className="p-3 sm:p-4 border-b border-white/[0.08] flex items-center justify-between bg-[#141522] gap-2 flex-wrap sm:flex-nowrap">
              <div className="flex items-center gap-2.5 sm:gap-3 min-w-0">
                <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-gradient-to-tr from-cyan-500 via-indigo-500 to-purple-600 flex items-center justify-center text-white shadow-md shadow-cyan-500/20 shrink-0">
                  <Bot className="w-5 h-5" />
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h3 id="ai-tutor-title" className="text-sm sm:text-base font-bold text-white truncate">
                      JEE Physics AI Tutor & Reasoning Engine
                    </h3>
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-cyan-500/15 text-cyan-300 border border-cyan-500/30 flex items-center gap-1">
                      <Zap className="w-3 h-3 text-cyan-400" />
                      Gemini 3.7 Flash
                    </span>
                  </div>
                  <p className="text-[11px] sm:text-xs text-zinc-400 truncate">
                    Active Apparatus: <span className="text-cyan-300 font-semibold">{currentConcept.title}</span> ({currentConcept.topic})
                  </p>
                </div>
              </div>

              {/* Header Controls: Waveform & Exit Button */}
              <div className="flex items-center gap-2 shrink-0">
                {/* Waveform Visualizer in Header */}
                <AudioWaveformVisualizer
                  isPlaying={playingMessageIndex !== null}
                  isStreaming={loading && autoVoiceResponse}
                  voiceName="Ursa"
                  size="sm"
                  showLabel={true}
                  className="hidden md:inline-flex"
                />

                <button
                  onClick={onClose}
                  className="px-3 py-1.5 rounded-xl text-xs font-bold bg-rose-500/15 hover:bg-rose-500/25 text-rose-300 hover:text-rose-200 border border-rose-500/30 flex items-center gap-1.5 transition shadow-xs active:scale-95 min-h-[36px]"
                  title="Close AI Tutor (Esc)"
                  aria-label="Exit AI Tutor"
                >
                  <X className="w-4 h-4 text-rose-400" />
                  <span className="hidden sm:inline font-semibold">Exit Tutor</span>
                  <span className="px-1 py-0.2 rounded bg-rose-500/20 text-[10px] font-mono">Esc</span>
                </button>
              </div>
            </div>

            {/* Smart Feature Control Bar: Thinking Mode, Web Search, Voice Feedback Switches */}
            <div className="px-3.5 sm:px-4 py-2 bg-[#0A0B10] border-b border-white/[0.08] flex items-center justify-between gap-2 flex-wrap text-xs">
              <div className="flex items-center gap-2 flex-wrap">
                {/* 1. Thinking Mode Toggle */}
                <button
                  onClick={() => setThinkingMode(!thinkingMode)}
                  className={`px-2.5 py-1.5 rounded-xl font-bold transition flex items-center gap-1.5 border min-h-[32px] ${
                    thinkingMode
                      ? 'bg-gradient-to-r from-purple-500/20 to-indigo-500/20 text-purple-200 border-purple-500/40 shadow-xs shadow-purple-500/10'
                      : 'bg-white/[0.03] text-zinc-400 border-white/[0.06] hover:text-zinc-200'
                  }`}
                  title={thinkingMode ? 'Thinking Mode is ON (Deep Step-by-Step JEE Advanced Reasoning)' : 'Enable Thinking Mode'}
                >
                  <BrainCircuit className={`w-3.5 h-3.5 ${thinkingMode ? 'text-purple-400 animate-pulse' : 'text-zinc-500'}`} />
                  <span>Thinking Mode</span>
                  <span
                    className={`px-1.5 py-0.2 rounded text-[9px] font-extrabold uppercase ${
                      thinkingMode ? 'bg-purple-500/30 text-purple-300' : 'bg-zinc-800 text-zinc-400'
                    }`}
                  >
                    {thinkingMode ? 'ON' : 'OFF'}
                  </span>
                </button>

                {/* 2. Web Search Grounding Toggle */}
                <button
                  onClick={() => setEnableWebSearch(!enableWebSearch)}
                  className={`px-2.5 py-1.5 rounded-xl font-bold transition flex items-center gap-1.5 border min-h-[32px] ${
                    enableWebSearch
                      ? 'bg-cyan-500/20 text-cyan-200 border-cyan-500/40 shadow-xs shadow-cyan-500/10'
                      : 'bg-white/[0.03] text-zinc-400 border-white/[0.06] hover:text-zinc-200'
                  }`}
                  title={enableWebSearch ? 'Web Search is ON (Fetches live JEE syllabus & physical data)' : 'Enable Web Search Grounding'}
                >
                  <Globe className={`w-3.5 h-3.5 ${enableWebSearch ? 'text-cyan-400' : 'text-zinc-500'}`} />
                  <span>Web Data</span>
                  <span
                    className={`px-1.5 py-0.2 rounded text-[9px] font-extrabold uppercase ${
                      enableWebSearch ? 'bg-cyan-500/30 text-cyan-300' : 'bg-zinc-800 text-zinc-400'
                    }`}
                  >
                    {enableWebSearch ? 'ON' : 'OFF'}
                  </span>
                </button>

                {/* 3. Auto Voice Response Toggle */}
                <button
                  onClick={() => setAutoVoiceResponse(!autoVoiceResponse)}
                  className={`px-2.5 py-1.5 rounded-xl font-semibold transition hidden sm:flex items-center gap-1.5 border min-h-[32px] ${
                    autoVoiceResponse
                      ? 'bg-emerald-500/15 text-emerald-200 border-emerald-500/30'
                      : 'bg-white/[0.03] text-zinc-400 border-white/[0.06]'
                  }`}
                  title="Auto-speak voice answers when doubt is asked via microphone"
                >
                  <Volume2 className={`w-3.5 h-3.5 ${autoVoiceResponse ? 'text-emerald-400' : 'text-zinc-500'}`} />
                  <span>Voice Replies</span>
                </button>

                {/* 4. Voice Speed & Tone Selector */}
                <div className="hidden lg:flex items-center gap-1.5 pl-1 border-l border-white/[0.1]">
                  <button
                    onClick={() => {
                      const nextSpeed = voiceSpeed === 1.03 ? 1.15 : voiceSpeed === 1.15 ? 0.95 : 1.03;
                      setVoiceSpeed(nextSpeed);
                    }}
                    className="px-2 py-1 rounded-lg text-[11px] font-bold bg-white/[0.05] hover:bg-white/[0.1] text-zinc-300 border border-white/[0.08] transition"
                    title="Toggle speech pace (Normal / Fast / Steady)"
                  >
                    Speed: {voiceSpeed === 1.03 ? '1.0x' : voiceSpeed === 1.15 ? '1.15x' : '0.95x'}
                  </button>

                  <button
                    onClick={() => {
                      unlockAudio();
                      const sampleText = "Hey there! I'm your JEE Physics AI tutor powered by Ursa voice. Let's unpack the equations and conquer your doubts with deep intuitive clarity!";
                      playTutorVoice(
                        sampleText,
                        () => setSpeechError(null),
                        () => {},
                        { voice: 'Ursa', rate: voiceSpeed, pitch: 1.05 }
                      ).catch(() => {});
                    }}
                    className="px-2 py-1 rounded-lg text-[11px] font-semibold bg-cyan-500/15 hover:bg-cyan-500/25 text-cyan-300 border border-cyan-500/40 transition flex items-center gap-1"
                    title="Test Gemini Ursa Voice for AI Tutor"
                  >
                    <Volume2 className="w-3 h-3 text-cyan-400" />
                    <span>Test Ursa</span>
                  </button>

                  {/* 5. Voice Cache Management Button */}
                  <button
                    onClick={() => {
                      refreshCacheStats();
                      setShowVoiceCacheModal(true);
                    }}
                    className="px-2 py-1 rounded-lg text-[11px] font-semibold bg-indigo-500/15 hover:bg-indigo-500/25 text-indigo-300 border border-indigo-500/30 transition flex items-center gap-1"
                    title="Manage Audio Cache & Voice Performance"
                  >
                    <Database className="w-3 h-3 text-indigo-400" />
                    <span>Cache ({voiceCacheStats.itemCount})</span>
                  </button>
                </div>
              </div>

              {/* Speech Error Banner if any */}
              {speechError && (
                <div className="text-[11px] text-rose-400 font-medium flex items-center gap-1 bg-rose-950/40 px-2 py-0.5 rounded-lg border border-rose-500/30 truncate max-w-[280px]">
                  <AlertCircle className="w-3 h-3 shrink-0" />
                  <span className="truncate">{speechError}</span>
                </div>
              )}
            </div>

            {/* Mode Selector Tabs */}
            <div className="px-4 py-2 bg-[#0C0D14] border-b border-white/[0.06] flex items-center justify-between gap-2 overflow-x-auto no-scrollbar">
              <div className="flex items-center gap-1.5">
                <button
                  onClick={() => setTutorTab('chat')}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 min-h-[34px] touch-manipulation ${
                    tutorTab === 'chat'
                      ? 'bg-cyan-500 text-slate-950 font-bold shadow-xs'
                      : 'text-zinc-400 hover:text-zinc-200 bg-white/[0.04]'
                  }`}
                >
                  <Bot className="w-3.5 h-3.5" />
                  <span>AI Doubt Chat</span>
                </button>

                <button
                  onClick={() => setTutorTab('derivation')}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 min-h-[34px] touch-manipulation ${
                    tutorTab === 'derivation'
                      ? 'bg-gradient-to-r from-indigo-500 to-cyan-500 text-white font-bold shadow-xs'
                      : 'text-zinc-400 hover:text-zinc-200 bg-white/[0.04]'
                  }`}
                >
                  <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                  <span>Calculus Derivation</span>
                </button>

                <button
                  onClick={() => setTutorTab('shortcuts')}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 min-h-[34px] touch-manipulation ${
                    tutorTab === 'shortcuts'
                      ? 'bg-amber-500 text-slate-950 font-bold shadow-xs'
                      : 'text-zinc-400 hover:text-zinc-200 bg-white/[0.04]'
                  }`}
                >
                  <Lightbulb className="w-3.5 h-3.5" />
                  <span>JEE Shortcuts & Traps</span>
                </button>
              </div>

              <span className="text-[10px] text-zinc-500 hidden md:inline font-mono">
                KaTeX Math & Gemini TTS Active
              </span>
            </div>

            {/* Quick Suggestion Chips (when in Chat mode) */}
            {tutorTab === 'chat' && (
              <div className="px-3.5 sm:px-4 py-2 bg-[#0E0F17] border-b border-white/[0.06] flex items-center gap-2 overflow-x-auto no-scrollbar">
                <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-500 shrink-0 flex items-center gap-1">
                  <Sparkles className="w-3 h-3 text-amber-400" />
                  Suggestions:
                </span>
                {quickPrompts.map((prompt, idx) => (
                  <button
                    key={idx}
                    onClick={() => {
                      handleBargeIn('suggestion_clicked');
                      handleSend(prompt);
                    }}
                    disabled={loading}
                    className="px-2.5 py-1 rounded-lg text-[11px] font-medium bg-[#161724] hover:bg-cyan-500/15 text-zinc-300 hover:text-cyan-300 border border-white/[0.06] hover:border-cyan-500/30 whitespace-nowrap transition shrink-0 min-h-[28px] touch-manipulation"
                  >
                    {prompt}
                  </button>
                ))}
              </div>
            )}

            {/* Main Content Area */}
            {tutorTab === 'chat' && (
              <div className="flex-1 p-3.5 sm:p-4 overflow-y-auto space-y-4 bg-[#090A0E] pb-6 sm:pb-8">
                {messages.map((msg, idx) => {
                  const isPlayingThis = playingMessageIndex === idx;

                  return (
                    <div
                      key={idx}
                      className={`flex flex-col ${msg.role === 'user' ? 'items-end' : 'items-start'}`}
                    >
                      <div
                        className={`max-w-[95%] sm:max-w-[88%] rounded-2xl px-3.5 sm:px-4 py-3 text-xs leading-relaxed ${
                          msg.role === 'user'
                            ? 'bg-gradient-to-r from-cyan-600 to-blue-600 text-white rounded-br-none shadow-md font-medium'
                            : 'bg-[#12131F] text-zinc-200 border border-white/[0.08] rounded-bl-none shadow-lg'
                        }`}
                      >
                        {/* Assistant Header with Voice Playback & Copy Buttons */}
                        {msg.role === 'assistant' && (
                          <div className="flex items-center justify-between gap-2 mb-2 pb-1.5 border-b border-white/[0.08] text-[10px] text-zinc-400 flex-wrap">
                            <div className="flex items-center gap-1.5 flex-wrap">
                              <span className="font-semibold text-cyan-400 flex items-center gap-1">
                                <Bot className="w-3 h-3" /> AI Physics Tutor
                              </span>

                              {/* Thinking Mode Tag */}
                              {msg.thinkingModeActive && (
                                <span className="px-1.5 py-0.2 rounded text-[9px] font-bold bg-purple-500/20 text-purple-300 border border-purple-500/30 flex items-center gap-0.5">
                                  <BrainCircuit className="w-2.5 h-2.5" /> Deep Reasoning
                                </span>
                              )}
                            </div>

                            <div className="flex items-center gap-1.5 flex-wrap">
                              {/* Animated Waveform when message is actively speaking */}
                              {isPlayingThis && (
                                <AudioWaveformVisualizer
                                  isPlaying={true}
                                  voiceName="Ursa"
                                  size="sm"
                                  showLabel={false}
                                  className="py-0.5 px-2 bg-amber-500/10 border-amber-500/30"
                                />
                              )}

                              {/* Voice Listen Button */}
                              <button
                                onClick={() => playVoiceResponse(msg.text, idx)}
                                className={`px-2 py-0.8 rounded-lg text-[10px] font-bold transition flex items-center gap-1 border min-h-[26px] ${
                                  isPlayingThis
                                    ? 'bg-amber-400 text-slate-950 border-amber-400 shadow-xs'
                                    : 'bg-white/[0.06] hover:bg-white/[0.1] text-zinc-300 hover:text-white border-white/[0.08]'
                                }`}
                                title={isPlayingThis ? 'Stop Voice Audio' : 'Play Voice Response (Gemini TTS)'}
                              >
                                {isPlayingThis ? (
                                  <>
                                    <VolumeX className="w-3 h-3" />
                                    <span>Stop Voice</span>
                                  </>
                                ) : (
                                  <>
                                    <Volume2 className="w-3 h-3 text-cyan-400" />
                                    <span>{isGeneratingVoice && isPlayingThis ? 'Synthesizing...' : 'Voice Read'}</span>
                                  </>
                                )}
                              </button>

                              {/* Copy Button */}
                              <button
                                onClick={() => handleCopy(msg.text, idx)}
                                title="Copy response"
                                className="hover:text-white transition flex items-center gap-1 p-1 rounded hover:bg-white/[0.08]"
                              >
                                {copiedIndex === idx ? (
                                  <Check className="w-3 h-3 text-emerald-400" />
                                ) : (
                                  <Copy className="w-3 h-3" />
                                )}
                                <span className="hidden xs:inline">{copiedIndex === idx ? 'Copied' : 'Copy'}</span>
                              </button>
                            </div>
                          </div>
                        )}

                        {/* User Voice Input Badge */}
                        {msg.role === 'user' && msg.isVoiceInput && (
                          <div className="flex items-center gap-1 text-[10px] text-cyan-200 mb-1 opacity-90">
                            <Mic className="w-3 h-3" />
                            <span>Spoken via Microphone</span>
                          </div>
                        )}

                        {/* High-fidelity MathMarkdown rendering */}
                        <MathMarkdown content={msg.text} />

                        {/* Grounded Web Sources Citations if present */}
                        {msg.webSources && msg.webSources.length > 0 && (
                          <div className="mt-3 pt-2 border-t border-white/[0.08]">
                            <div className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider mb-1.5 flex items-center gap-1">
                              <Globe className="w-3 h-3 text-cyan-400" />
                              Web References & Verified Data:
                            </div>
                            <div className="flex flex-wrap gap-1.5">
                              {msg.webSources.map((source, sIdx) => (
                                <a
                                  key={sIdx}
                                  href={source.uri}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="px-2 py-0.8 rounded-md bg-[#181928] hover:bg-cyan-500/20 text-[10px] text-cyan-300 hover:text-cyan-200 border border-white/[0.06] hover:border-cyan-500/30 flex items-center gap-1 transition truncate max-w-[240px]"
                                  title={source.uri}
                                >
                                  <span className="truncate">{source.title}</span>
                                  <ExternalLink className="w-2.5 h-2.5 shrink-0 text-zinc-400" />
                                </a>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}

                {/* Loading state with Thinking Mode indicator */}
                {loading && (
                  <div className="flex items-center gap-3 text-xs text-cyan-300 bg-[#121322] p-3.5 rounded-2xl w-fit border border-cyan-500/30 shadow-lg animate-pulse">
                    <Zap className="w-4 h-4 animate-spin text-cyan-400" />
                    <span>
                      {thinkingMode
                        ? '🧠 Engaging Deep Thinking Mode & JEE Advanced derivation...'
                        : 'Querying Gemini Physics Model...'}
                    </span>
                  </div>
                )}
                <div ref={chatBottomRef} className="h-4 sm:h-6 shrink-0" />
              </div>
            )}

            {/* Tab 2: Full Calculus Derivation View */}
            {tutorTab === 'derivation' && (
              <div className="flex-1 p-3.5 sm:p-5 overflow-y-auto space-y-4 bg-[#090A0E]">
                <div className="p-4 rounded-2xl bg-[#131426] border border-indigo-500/30 space-y-2">
                  <div className="flex items-center justify-between">
                    <h4 className="text-sm font-bold text-zinc-100 flex items-center gap-2">
                      <Sparkles className="w-4 h-4 text-amber-400" />
                      {derivation.title}
                    </h4>
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                      Step-by-Step Calculus
                    </span>
                  </div>
                  <p className="text-xs text-zinc-300">
                    <span className="font-semibold text-zinc-100">Governing Law:</span> {derivation.coreLaw}
                  </p>
                </div>

                {/* Steps */}
                <div className="space-y-3">
                  {derivation.steps.map((s) => (
                    <div
                      key={s.stepNumber}
                      className="p-3.5 sm:p-4 rounded-2xl bg-[#11121C] border border-white/[0.08] space-y-2.5"
                    >
                      <div className="flex items-center gap-2">
                        <span className="w-6 h-6 rounded-lg bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 flex items-center justify-center text-xs font-bold">
                          {s.stepNumber}
                        </span>
                        <h5 className="text-xs font-bold text-zinc-200">{s.title}</h5>
                      </div>
                      <div className="py-2.5 px-3 rounded-xl bg-[#161726] border border-white/[0.06] text-center overflow-x-auto">
                        <Latex math={s.latex} displayMode className="text-cyan-200 font-mono text-xs sm:text-sm" />
                      </div>
                      <p className="text-[12px] text-zinc-400 leading-relaxed">{s.explanation}</p>
                    </div>
                  ))}
                </div>

                {/* Final Result */}
                <div className="p-4 rounded-2xl bg-[#131422] border border-cyan-500/30 space-y-2">
                  <div className="text-xs font-bold text-cyan-300 uppercase tracking-wider">
                    Final Result Formulation:
                  </div>
                  <div className="py-3 px-4 rounded-xl bg-[#0B0C12] border border-cyan-500/20 text-center overflow-x-auto">
                    <Latex math={derivation.finalResultLatex} displayMode className="text-cyan-300 font-mono text-sm" />
                  </div>
                </div>
              </div>
            )}

            {/* Tab 3: JEE Shortcuts & Traps */}
            {tutorTab === 'shortcuts' && (
              <div className="flex-1 p-3.5 sm:p-5 overflow-y-auto space-y-4 bg-[#090A0E]">
                {/* Shortcuts */}
                <div className="p-4 rounded-2xl bg-[#11121B] border border-emerald-500/25 space-y-3">
                  <div className="text-xs font-bold text-emerald-400 uppercase tracking-wider flex items-center gap-1.5">
                    <Lightbulb className="w-4 h-4 text-amber-400" />
                    <span>High-Yield JEE Shortcuts & Ratios</span>
                  </div>
                  <ul className="space-y-2">
                    {currentConcept.jeeMain.keyShortcuts.map((sc, idx) => (
                      <li
                        key={idx}
                        className="p-3 rounded-xl bg-[#151624] border border-emerald-500/20 text-xs text-zinc-300 leading-relaxed flex items-start gap-2"
                      >
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 mt-1.5 shrink-0" />
                        <span>{sc}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Traps */}
                <div className="p-4 rounded-2xl bg-[#11121B] border border-rose-500/25 space-y-3">
                  <div className="text-xs font-bold text-rose-400 uppercase tracking-wider flex items-center gap-1.5">
                    <AlertTriangle className="w-4 h-4 text-rose-400" />
                    <span>Negative Marking Exam Traps</span>
                  </div>
                  <ul className="space-y-2">
                    {currentConcept.jeeMain.trapAlerts.map((trap, idx) => (
                      <li
                        key={idx}
                        className="p-3 rounded-xl bg-[#181116] border border-rose-500/20 text-xs text-rose-200/90 leading-relaxed flex items-start gap-2"
                      >
                        <span className="w-1.5 h-1.5 rounded-full bg-rose-400 mt-1.5 shrink-0" />
                        <span>{trap}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            )}

            {/* Speech Permission or Network Error Banner */}
            {speechError && (
              <div className="px-4 py-2 bg-rose-950/90 border-t border-rose-500/50 flex items-center justify-between gap-2 text-xs text-rose-200">
                <div className="flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0" />
                  <span>{speechError}</span>
                </div>
                <button
                  onClick={() => setSpeechError(null)}
                  className="px-2 py-0.5 rounded bg-rose-500/20 hover:bg-rose-500/40 text-rose-200 text-[10px] font-bold"
                >
                  Dismiss
                </button>
              </div>
            )}

            {/* AI Transcribing in Progress with Gemini */}
            {isTranscribing && (
              <div className="px-4 py-2 bg-gradient-to-r from-cyan-950/90 via-indigo-950/90 to-purple-950/90 border-t border-cyan-500/50 flex items-center justify-center gap-2 text-xs text-cyan-200 animate-pulse">
                <Zap className="w-4 h-4 text-cyan-400 animate-spin" />
                <span className="font-bold">Transcribing your voice doubt with Gemini Multimodal Model...</span>
              </div>
            )}

            {/* Voice Recording Listening Banner with Realtime Audio Meter */}
            {isRecording && (
              <div className="px-4 py-2 bg-gradient-to-r from-emerald-950/90 via-teal-950/90 to-cyan-950/90 border-t border-emerald-500/50 flex items-center justify-between gap-2 text-xs text-emerald-200">
                <div className="flex items-center gap-2.5 min-w-0">
                  <AudioWaveformVisualizer
                    isListening={true}
                    audioLevel={audioLevel}
                    size="sm"
                    showLabel={false}
                    className="py-0.5 px-2 bg-emerald-900/40 border-emerald-500/40"
                  />
                  <div className="flex flex-col min-w-0">
                    <span className="font-bold flex items-center gap-1.5 text-emerald-300">
                      <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                      Listening to your doubt...
                    </span>
                    <span className="text-[11px] text-zinc-300 truncate">
                      {accumulatedTranscriptRef.current || 'Speak naturally (JEE queries, derivations, doubts)...'}
                    </span>
                  </div>
                </div>
                <div className="flex items-center gap-1.5 shrink-0">
                  <button
                    onClick={() => stopVoiceRecording(false)}
                    className="px-2.5 py-1.5 rounded-lg bg-white/[0.08] hover:bg-white/[0.15] text-zinc-300 font-bold text-[11px] transition"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={() => stopVoiceRecording(true)}
                    className="px-3 py-1.5 rounded-lg bg-gradient-to-r from-emerald-500 to-teal-500 text-slate-950 font-black text-[11px] hover:brightness-110 transition shadow-md shadow-emerald-500/20"
                  >
                    Done & Send
                  </button>
                </div>
              </div>
            )}

            {/* Active Voice Playing & Single Clear Barge-In Banner */}
            {(playingMessageIndex !== null || isGeneratingVoice) && !isRecording && (
              <div className="px-3.5 sm:px-4 py-2 bg-gradient-to-r from-amber-950/80 via-indigo-950/80 to-cyan-950/80 border-t border-amber-500/40 flex items-center justify-between gap-2 text-xs text-amber-200 shadow-md">
                <div className="flex items-center gap-2 min-w-0">
                  <AudioWaveformVisualizer
                    isPlaying={true}
                    voiceName="Ursa"
                    size="sm"
                    showLabel={false}
                    className="py-0.5 px-2 bg-amber-900/40 border-amber-500/40 shrink-0"
                  />
                  <div className="flex flex-col min-w-0">
                    <span className="font-semibold text-zinc-200 flex items-center gap-1.5 truncate">
                      <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse shrink-0" />
                      Tutor speaking • <span className="text-amber-300 font-bold">Ursa Voice</span>
                    </span>
                    <span className="text-[10px] text-zinc-400 hidden sm:inline">
                      Speak, type, or tap Interrupt at any point
                    </span>
                  </div>
                </div>
                <div className="flex items-center shrink-0">
                  <button
                    onClick={() => handleBargeIn('interrupt_button')}
                    className="px-3.5 py-1.5 rounded-xl bg-amber-500/20 hover:bg-rose-500/30 text-amber-300 hover:text-rose-200 border border-amber-500/40 hover:border-rose-500/50 font-bold text-xs transition flex items-center gap-1.5 active:scale-95 shadow-sm min-h-[36px] touch-manipulation"
                    title="Stop tutor speech (Interrupt)"
                    aria-label="Interrupt Tutor Speech"
                  >
                    <VolumeX className="w-4 h-4 text-amber-400" />
                    <span>Interrupt</span>
                  </button>
                </div>
              </div>
            )}

            {/* Barge-In Notification Pill */}
            {isBargeInActive && (
              <div className="px-4 py-1.5 bg-gradient-to-r from-cyan-950/90 to-indigo-950/90 border-t border-cyan-500/40 flex items-center justify-center gap-2 text-xs text-cyan-200 animate-bounce">
                <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
                <span className="font-bold">{bargeInReason}</span>
              </div>
            )}

            {/* Doubts Typing Panel - Bottom Footer for mobile & desktop with high-contrast accessibility */}
            <div className="shrink-0 p-2.5 sm:p-3.5 border-t border-white/[0.08] bg-[#0E1018] shadow-2xl pb-[max(0.75rem,env(safe-area-inset-bottom))] z-30">
              {/* Panel Identifier Pill */}
              <div className="flex items-center justify-between gap-2 mb-1.5 px-0.5">
                <div className="flex items-center gap-1.5 text-[10px] sm:text-[11px] font-bold text-cyan-300 uppercase tracking-wider">
                  <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
                  <span>Doubts Typing Panel</span>
                  <span className="text-zinc-400 font-normal lowercase hidden sm:inline">(type question or speak)</span>
                </div>
                <div className="flex items-center gap-2 text-[10px] text-zinc-400">
                  <span className="text-emerald-400 font-medium hidden sm:inline">● Instant Barge-in Active</span>
                  <span>Voice: <span className="text-cyan-300 font-semibold">Gemini Ursa</span></span>
                </div>
              </div>

              <div className="flex items-center gap-1.5 sm:gap-2">
                {/* Exit Button */}
                <button
                  onClick={onClose}
                  type="button"
                  className="px-2.5 sm:px-3 py-2 rounded-xl bg-white/[0.06] hover:bg-rose-500/20 text-zinc-400 hover:text-rose-200 text-xs font-bold border border-white/[0.08] hover:border-rose-500/30 transition flex items-center gap-1.5 shrink-0 active:scale-95 min-h-[44px] min-w-[44px] justify-center"
                  title="Exit AI Tutor Panel (Esc)"
                  aria-label="Exit AI Tutor"
                >
                  <LogOut className="w-4 h-4 rotate-180 text-rose-400" />
                  <span className="hidden md:inline">Exit</span>
                </button>

                {/* Microphone Voice Doubt Button with Barge-In */}
                <button
                  type="button"
                  onClick={toggleVoiceRecording}
                  disabled={isTranscribing}
                  className={`p-2.5 sm:px-3.5 sm:py-2.5 rounded-xl font-bold transition flex items-center gap-1.5 shrink-0 min-h-[44px] min-w-[44px] justify-center touch-manipulation active:scale-95 border ${
                    isRecording
                      ? 'bg-rose-500 text-white border-rose-400 shadow-lg shadow-rose-500/30 animate-pulse'
                      : isTranscribing
                      ? 'bg-cyan-900/50 text-cyan-300 border-cyan-500/30'
                      : 'bg-gradient-to-r from-emerald-500/20 to-teal-500/20 hover:from-emerald-500/30 hover:to-teal-500/30 text-emerald-300 border-emerald-500/40 shadow-xs'
                  }`}
                  title={isRecording ? 'Stop Recording' : 'Ask doubt via Voice (Microphone - Instant Barge-in)'}
                  aria-label="Use Microphone for Voice Doubt"
                >
                  {isRecording ? (
                    <MicOff className="w-4 h-4" />
                  ) : isTranscribing ? (
                    <Zap className="w-4 h-4 animate-spin text-cyan-400" />
                  ) : (
                    <Mic className="w-4 h-4 text-emerald-400" />
                  )}
                  <span className="text-xs hidden sm:inline">
                    {isRecording ? 'Listening...' : isTranscribing ? 'Transcribing...' : 'Voice Doubt'}
                  </span>
                </button>

                {/* Text Input with auto-scroll on focus & typing barge-in */}
                <div className="relative flex-1 flex items-center min-w-0">
                  <input
                    ref={inputRef}
                    type="text"
                    placeholder={
                      isRecording
                        ? '🎙️ Listening to your microphone...'
                        : '💬 Tap here to type your physics doubt or question...'
                    }
                    value={question}
                    onChange={(e) => {
                      if (playingMessageIndex !== null || loading) {
                        handleBargeIn('typing_input');
                      }
                      setQuestion(e.target.value);
                    }}
                    onFocus={() => {
                      setTimeout(() => {
                        chatBottomRef.current?.scrollIntoView({ behavior: 'smooth' });
                      }, 200);
                    }}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && !e.shiftKey) {
                        e.preventDefault();
                        handleSend();
                      } else if (playingMessageIndex !== null || loading) {
                        handleBargeIn('key_down_typing');
                      }
                    }}
                    disabled={loading || isRecording || isTranscribing}
                    className="w-full pl-3.5 pr-9 py-2.5 sm:py-3 bg-[#07080E] border-2 border-cyan-500/40 rounded-xl text-xs sm:text-sm text-zinc-100 placeholder-zinc-400 focus:outline-none focus:border-cyan-300 focus:ring-2 focus:ring-cyan-500/40 transition min-h-[46px] font-medium"
                    autoComplete="off"
                  />
                  {question.length > 0 && !loading && (
                    <button
                      type="button"
                      onClick={() => {
                        setQuestion('');
                        inputRef.current?.focus();
                      }}
                      className="absolute right-2.5 p-1.5 rounded-full text-zinc-400 hover:text-white bg-white/[0.1] hover:bg-white/[0.2] transition"
                      title="Clear input"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>

                {/* Send Button */}
                <button
                  onClick={() => handleSend()}
                  disabled={loading || !question.trim() || isRecording || isTranscribing}
                  className="px-3.5 sm:px-5 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-indigo-600 hover:from-cyan-400 hover:to-indigo-500 disabled:opacity-40 text-slate-950 font-black transition shadow-lg shadow-cyan-600/30 flex items-center gap-1.5 shrink-0 min-h-[46px] touch-manipulation active:scale-95"
                  title="Send Question to AI Tutor"
                >
                  <Send className="w-4 h-4 fill-current" />
                  <span className="text-xs hidden sm:inline font-bold">Ask AI</span>
                </button>
              </div>
            </div>
          </motion.div>

          {/* Voice Cache Management Modal */}
          <AnimatePresence>
            {showVoiceCacheModal && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 z-[110] bg-black/80 backdrop-blur-md flex items-center justify-center p-4"
                onClick={() => setShowVoiceCacheModal(false)}
              >
                <motion.div
                  initial={{ scale: 0.95, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 0.95, opacity: 0 }}
                  onClick={(e) => e.stopPropagation()}
                  className="bg-[#121320] border border-indigo-500/30 rounded-3xl p-5 sm:p-6 w-full max-w-md shadow-2xl space-y-4"
                >
                  <div className="flex items-center justify-between border-b border-white/[0.08] pb-3">
                    <div className="flex items-center gap-2.5">
                      <div className="p-2 rounded-xl bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                        <Database className="w-5 h-5" />
                      </div>
                      <div>
                        <h4 className="text-sm font-bold text-white">Voice Cache & Audio Engine</h4>
                        <p className="text-[11px] text-zinc-400">Zero-Latency Speech Synthesis Management</p>
                      </div>
                    </div>
                    <button
                      onClick={() => setShowVoiceCacheModal(false)}
                      className="p-1.5 rounded-lg bg-white/[0.05] hover:bg-white/[0.1] text-zinc-400 hover:text-white transition"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>

                  {/* Audio Waveform Live Preview */}
                  <div className="p-3.5 bg-[#0a0b12] rounded-2xl border border-white/[0.06] flex items-center justify-between">
                    <div>
                      <span className="text-xs font-bold text-zinc-200 block">Audio Stream Waveform</span>
                      <span className="text-[10px] text-zinc-400">Real-time dynamic voice synthesis</span>
                    </div>
                    <AudioWaveformVisualizer
                      isPlaying={playingMessageIndex !== null}
                      isStreaming={loading}
                      voiceName="Ursa"
                      size="sm"
                    />
                  </div>

                  {/* Cache Statistics Grid */}
                  <div className="grid grid-cols-2 gap-2.5 text-xs">
                    <div className="p-3 bg-[#0e0f18] rounded-xl border border-white/[0.06] space-y-1">
                      <span className="text-[10px] uppercase font-bold text-zinc-400">Cached Audio Clips</span>
                      <p className="text-base font-black text-cyan-300 font-mono">{voiceCacheStats.itemCount} items</p>
                    </div>
                    <div className="p-3 bg-[#0e0f18] rounded-xl border border-white/[0.06] space-y-1">
                      <span className="text-[10px] uppercase font-bold text-zinc-400">Estimated Buffer Size</span>
                      <p className="text-base font-black text-indigo-300 font-mono">{voiceCacheStats.estimatedSizeKb} KB</p>
                    </div>
                  </div>

                  <div className="p-3 bg-[#0e0f18] rounded-xl border border-white/[0.06] text-xs space-y-1.5">
                    <div className="flex justify-between text-zinc-300">
                      <span className="text-zinc-400">Selected Voice:</span>
                      <span className="font-semibold text-cyan-300 truncate max-w-[200px]">{voiceCacheStats.selectedVoiceName}</span>
                    </div>
                    <div className="flex justify-between text-zinc-300">
                      <span className="text-zinc-400">System Voices:</span>
                      <span className="font-semibold text-zinc-200">{voiceCacheStats.availableVoicesCount} available</span>
                    </div>
                    <div className="flex justify-between text-zinc-300">
                      <span className="text-zinc-400">Audio Pipeline:</span>
                      <span className="font-semibold text-emerald-400">Instant Streaming (&lt;10ms)</span>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2 pt-2">
                    <button
                      onClick={handleClearCache}
                      className="flex-1 py-2.5 rounded-xl bg-rose-500/15 hover:bg-rose-500/25 text-rose-300 border border-rose-500/30 text-xs font-bold transition flex items-center justify-center gap-1.5"
                    >
                      <Trash2 className="w-4 h-4 text-rose-400" />
                      <span>Clear Voice Cache</span>
                    </button>
                    <button
                      onClick={() => {
                        unlockAudio();
                        const sampleText = "Voice cache operational! All physics equations ready for instant audio narration.";
                        playTutorVoice(
                          sampleText,
                          () => refreshCacheStats(),
                          () => refreshCacheStats(),
                          { voice: 'Ursa', rate: voiceSpeed, pitch: 1.05 }
                        ).catch(() => {});
                      }}
                      className="flex-1 py-2.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 text-xs font-black transition flex items-center justify-center gap-1.5 shadow-md shadow-cyan-500/20"
                    >
                      <Volume2 className="w-4 h-4 fill-current" />
                      <span>Test Synthesis</span>
                    </button>
                  </div>
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

// Robust offline formula & derivation fallback generator (Casual & Friendly IITian Mentor Tone)
function generateFallbackResponse(
  query: string,
  concept: PhysicsConcept,
  derivation: any,
  params: Record<string, number>
): string {
  const isGeneralInfo = /founder|founded|who made|who built|creator|aim|motto|specification|features|about this app|overview/i.test(query);
  const isDerivation = /derive|derivation|calculus|proof|step/i.test(query);
  const isShortcut = /shortcut|trick|trap|mistake/i.test(query);

  if (isGeneralInfo) {
    return `### Hey buddy! Here's everything about our Lab:

- **Founder & Master Architect**: Engineered & founded by **Sanjay.J** for all students aiming for top ranks in **JEE Main & Advanced**.
- **Aim & Mission**: Say goodbye to blind memorization! We bring physics to life through interactive 3D simulations, real-time vector graphs, and rigorous step-by-step calculus proofs.
- **Motto**: *"Visualizing Physics, Mastering JEE"*

---

### ⚙️ What's packed inside:
1. **18 Complete JEE Chapters** (Mechanics, Electrodynamics, Optics, Thermodynamics, Modern Physics).
2. **Interactive 3D Virtual Lab** (Rotate, zoom, tweak parameters, and watch forces update in real-time).
3. **Publication-Grade PDF Formula Compendiums** (Downloadable vector cheat sheets with exam traps and shortcuts).
4. **AI Doubt Solver & Spoken Voice Tutor** (Fast, friendly, and crystal-clear doubt resolution).`;
  }

  if (isDerivation) {
    const stepsMarkdown = derivation.steps
      .map(
        (s: any) => `### Step ${s.stepNumber}: ${s.title}
$$${s.latex}$$
${s.explanation}`
      )
      .join('\n\n');

    return `### Alright buddy! Let's derive this step-by-step for ${concept.title}:
**Governing Law:** ${derivation.coreLaw}

${stepsMarkdown}

### 🏁 Final Result:
$$${derivation.finalResultLatex}$$

> **Pro-Tip for JEE:** ${derivation.jeeInsight}`;
  }

  if (isShortcut) {
    const shortcuts = concept.jeeMain.keyShortcuts.map((s) => `- ${s}`).join('\n');
    const traps = concept.jeeMain.trapAlerts.map((t) => `> **Exam Trap:** ${t}`).join('\n\n');

    return `### ⚡ High-Yield JEE Shortcuts & Traps for ${concept.title}:
${shortcuts}

${traps}

### 📐 Master Formula:
$$${concept.formulas[0]?.latex || ''}$$`;
  }

  const paramStrings = Object.entries(params)
    .map(([k, v]) => `\`${k} = ${v}\``)
    .join(', ');

  return `### Hey friend! Here is the quick conceptual breakdown for ${concept.title}:
Under your current lab settings (${paramStrings}):

### 📐 Governing Formula:
$$${concept.formulas[0]?.latex || ''}$$
${concept.formulas[0]?.explanation || ''}

### 🚀 Physical Intuition:
${concept.description}

> **Pro-Tip:** Always verify unit consistency in SI units before applying formulas in JEE exams!`;
}
