// Global Ursa Speech Coordination & Mic Ownership Lock
// Guarantees strictly ONE active SpeechRecognition instance across the entire application,
// eliminating race conditions, mic thrashing / cycling loops, and browser InvalidStateError.

export type MicOwner = 'copilot' | 'modal' | 'none';

type MicStateListener = (owner: MicOwner) => void;

class UrsaSpeechLockManager {
  private currentOwner: MicOwner = 'none';
  private listeners: Set<MicStateListener> = new Set();
  private abortController: AbortController | null = null;
  private consecutiveErrors = 0;
  private lastErrorTime = 0;

  /**
   * Current active holder of microphone recognition
   */
  public getOwner(): MicOwner {
    return this.currentOwner;
  }

  public isBusy(): boolean {
    return this.currentOwner !== 'none';
  }

  /**
   * Request microphone lock for an owner.
   * If a lower-priority owner holds the mic, it can be yielded.
   * 'modal' (active doubt speaking) has higher priority than 'copilot' (wake word).
   */
  public acquire(requester: 'copilot' | 'modal'): boolean {
    if (this.currentOwner === requester) {
      return true;
    }

    if (this.currentOwner === 'none') {
      this.currentOwner = requester;
      this.notify();
      return true;
    }

    // Modal takes precedence over background copilot
    if (requester === 'modal' && this.currentOwner === 'copilot') {
      this.currentOwner = 'modal';
      this.notify();
      return true;
    }

    // Copilot cannot steal from modal while modal is actively recording user
    return false;
  }

  /**
   * Release microphone lock if held by this owner
   */
  public release(owner: MicOwner): void {
    if (this.currentOwner === owner) {
      this.currentOwner = 'none';
      this.notify();
    }
  }

  /**
   * Force release all owners
   */
  public forceReleaseAll(): void {
    this.currentOwner = 'none';
    this.notify();
  }

  /**
   * Record errors to calculate backoff if browser speech recognition is thrashing
   */
  public recordError(): number {
    const now = Date.now();
    if (now - this.lastErrorTime < 4000) {
      this.consecutiveErrors++;
    } else {
      this.consecutiveErrors = 1;
    }
    this.lastErrorTime = now;
    // Exponential backoff: min 600ms, max 5000ms
    return Math.min(5000, 400 + Math.pow(2, Math.min(this.consecutiveErrors, 5)) * 100);
  }

  public resetErrors(): void {
    this.consecutiveErrors = 0;
  }

  public subscribe(listener: MicStateListener): () => void {
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
    };
  }

  private notify(): void {
    const owner = this.currentOwner;
    this.listeners.forEach((fn) => {
      try {
        fn(owner);
      } catch (e) {
        console.warn('Speech lock listener error:', e);
      }
    });
  }
}

export const speechLock = new UrsaSpeechLockManager();

/**
 * Safely dismantles a SpeechRecognition instance by stripping all event listeners
 * BEFORE aborting it, strictly preventing the browser from triggering phantom 'onend'
 * or 'onerror' loops that restart speech recognition in an infinite cycle.
 */
export function safelyDestroySpeechRecognition(recognition: any): void {
  if (!recognition) return;
  try {
    recognition.onstart = null;
    recognition.onaudiostart = null;
    recognition.onspeechstart = null;
    recognition.onsoundstart = null;
    recognition.onresult = null;
    recognition.onerror = null;
    recognition.onend = null;
    recognition.onaudioend = null;
    recognition.onspeechend = null;
    recognition.onsoundend = null;
    recognition.abort();
  } catch (err) {
    // Ignore abort errors on already-stopped instances
  }
}
