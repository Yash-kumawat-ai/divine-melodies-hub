/**
 * Voice Utilities for Web Speech API
 * Handles speech-to-text and text-to-speech for elderly users
 */

export interface SpeechRecognitionEvent extends Event {
  results: SpeechRecognitionResultList;
  resultIndex: number;
}

export interface SpeechRecognitionResultList {
  [index: number]: SpeechRecognitionResult;
  length: number;
}

export interface SpeechRecognitionResult {
  [index: number]: SpeechRecognitionAlternative;
  isFinal: boolean;
  length: number;
}

export interface SpeechRecognitionAlternative {
  transcript: string;
  confidence: number;
}

function getSpeechRecognitionConstructor() {
  if (typeof window === 'undefined') return null;
  return (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition || null;
}

function isPrivateLanHost(hostname: string): boolean {
  const parts = hostname.split('.');
  if (parts.length !== 4) return false;
  const octets = parts.map((p) => Number.parseInt(p, 10));
  if (octets.some((n) => Number.isNaN(n) || n < 0 || n > 255)) return false;
  if (octets[0] === 10) return true;
  if (octets[0] === 192 && octets[1] === 168) return true;
  if (octets[0] === 172 && octets[1] >= 16 && octets[1] <= 31) return true;
  return false;
}

function isLocalSecureOrigin() {
  if (typeof window === 'undefined') return false;
  const host = window.location.hostname;
  return ['localhost', '127.0.0.1', '[::1]'].includes(host) || isPrivateLanHost(host);
}

const MICROPHONE_POLICY_BLOCKED_MESSAGE =
  'This site blocked microphone access in its security settings. Reload after updating the site.';

function isMicrophoneBlockedByDocumentPolicy(): boolean {
  if (typeof document === 'undefined') return false;
  const policy = (
    document as Document & {
      permissionsPolicy?: { allowsFeature: (feature: string) => boolean };
    }
  ).permissionsPolicy;
  return !!policy && !policy.allowsFeature('microphone');
}

async function hasAudioInputDevice(): Promise<boolean> {
  if (!navigator.mediaDevices?.enumerateDevices) return true;
  try {
    const devices = await navigator.mediaDevices.enumerateDevices();
    return devices.some((device) => device.kind === 'audioinput');
  } catch {
    return true;
  }
}

function getMediaErrorName(error: unknown): string {
  if (error instanceof DOMException || error instanceof Error) {
    return error.name;
  }
  if (typeof error === 'string') {
    return error;
  }
  return (error as { name?: string })?.name ?? '';
}

function getMediaErrorMessage(error: unknown): string {
  const name = getMediaErrorName(error);

  if (name === 'NotAllowedError' || name === 'PermissionDeniedError') {
    return 'Microphone permission is blocked. Click the lock icon in the address bar, allow microphone access, then try again.';
  }

  if (name === 'NotFoundError' || name === 'DevicesNotFoundError') {
    if (isMicrophoneBlockedByDocumentPolicy()) {
      return MICROPHONE_POLICY_BLOCKED_MESSAGE;
    }
    return 'No microphone was found. Connect or enable a microphone in system/browser settings, then try again.';
  }

  if (name === 'NotReadableError' || name === 'TrackStartError') {
    return 'The microphone is being used by another app or is not readable. Close other apps using it and try again.';
  }

  if (name === 'SecurityError') {
    return 'Microphone access is blocked by browser security settings.';
  }

  return 'Microphone access failed. Check browser permission and selected input device, then try again.';
}

async function ensureMicrophoneAccess(): Promise<{ ok: true } | { ok: false; error: string }> {
  if (typeof window === 'undefined' || typeof navigator === 'undefined') {
    return { ok: false, error: 'Voice input is available only in a browser.' };
  }

  if (!window.isSecureContext && !isLocalSecureOrigin()) {
    return {
      ok: false,
      error:
        'Microphone needs a secure connection. Use http://localhost:8080 on this PC, or https:// on your phone.',
    };
  }

  // On http://192.168.x.x the mic preflight (getUserMedia) is blocked; speech recognition can still work.
  if (!window.isSecureContext && isLocalSecureOrigin()) {
    return { ok: true };
  }

  if (!navigator.mediaDevices?.getUserMedia) {
    return { ok: false, error: 'This browser does not support microphone access.' };
  }

  if (isMicrophoneBlockedByDocumentPolicy()) {
    return { ok: false, error: MICROPHONE_POLICY_BLOCKED_MESSAGE };
  }

  try {
    if (navigator.permissions?.query) {
      try {
        const permission = await navigator.permissions.query({ name: 'microphone' as PermissionName });
        if (permission.state === 'denied') {
          return {
            ok: false,
            error: 'Microphone permission is blocked. Click the lock icon in the address bar, allow microphone access, then try again.',
          };
        }
      } catch {
        // Some browsers do not expose microphone permission through Permissions API.
      }
    }

    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    stream.getTracks().forEach((track) => track.stop());
    return { ok: true };
  } catch (error) {
    const name = getMediaErrorName(error);
    if (
      (name === 'NotFoundError' || name === 'DevicesNotFoundError') &&
      !isMicrophoneBlockedByDocumentPolicy()
    ) {
      const hasMic = await hasAudioInputDevice();
      if (!hasMic) {
        return {
          ok: false,
          error:
            'No microphone was found. Connect or enable a microphone in system/browser settings, then try again.',
        };
      }
      return {
        ok: false,
        error:
          'Microphone access failed. Check your browser default input device and site microphone permission, then try again.',
      };
    }
    return { ok: false, error: getMediaErrorMessage(error) };
  }
}

export class VoiceManager {
  private recognition: any;
  private isListening = false;
  private transcript = '';
  private language: 'hi' | 'en' = 'hi';

  constructor(language: 'hi' | 'en' = 'hi') {
    const SpeechRecognition = getSpeechRecognitionConstructor();
    if (!SpeechRecognition) {
      console.warn('Speech Recognition API not supported in this browser');
      return;
    }

    this.language = language;
    this.recognition = new SpeechRecognition();
    this.setupRecognition();
  }

  private setupRecognition() {
    if (!this.recognition) return;

    // Set language to Hindi or English
    this.recognition.lang = this.language === 'hi' ? 'hi-IN' : 'en-IN';
    this.recognition.continuous = false;
    this.recognition.interimResults = true;
    this.recognition.maxAlternatives = 1;
  }

  /** Stop an in-flight session so start() does not throw InvalidStateError. */
  private resetRecognitionSession() {
    if (!this.recognition) return;
    try {
      if (typeof this.recognition.abort === 'function') {
        this.recognition.abort();
      } else {
        this.recognition.stop();
      }
    } catch {
      // No active session — safe to ignore.
    }
    this.isListening = false;
  }

  /**
   * Start listening for voice input
   */
  public async startListening(
    onTranscript: (text: string, isFinal: boolean) => void,
    onError?: (error: string) => void,
    onStart?: () => void,
    onEnd?: () => void
  ) {
    if (!this.recognition) {
      const msg = 'Speech Recognition not supported in this browser';
      onError?.(msg);
      return;
    }

    const microphoneAccess = await ensureMicrophoneAccess();
    if (microphoneAccess.ok !== true) {
      this.isListening = false;
      onError?.(microphoneAccess.error);
      onEnd?.(); // Mic denied before a session starts — safe to call directly.
      return;
    }

    this.resetRecognitionSession();
    this.transcript = '';
    this.isListening = false;

    let sessionEnded = false;
    const endOnce = () => {
      if (sessionEnded) return;
      sessionEnded = true;
      this.isListening = false;
      onEnd?.();
    };

    this.recognition.onresult = (event: SpeechRecognitionEvent) => {
      let interim = '';

      for (let i = event.resultIndex; i < event.results.length; i++) {
        const result = event.results[i];
        const transcript = result[0]?.transcript ?? '';

        if (result.isFinal) {
          this.transcript += transcript + ' ';
        } else {
          interim += transcript;
        }
      }

      const combined = (this.transcript + interim).trim();
      const lastResult =
        event.results.length > 0 ? event.results[event.results.length - 1] : null;
      const isFinal = lastResult?.isFinal ?? false;
      onTranscript(combined, isFinal);
    };

    this.recognition.onerror = (event: Event & { error?: string }) => {
      const code = event.error ?? 'unknown';
      this.isListening = false;

      if (code === 'aborted') {
        endOnce();
        return;
      }

      const errorMessage = this.getErrorMessage(code);
      console.error('Voice error:', code, errorMessage);
      onError?.(errorMessage);
      endOnce();
    };

    this.recognition.onstart = () => {
      this.isListening = true;
      onStart?.();
    };

    this.recognition.onend = () => {
      endOnce();
    };

    try {
      this.recognition.start();
    } catch (err) {
      const name = getMediaErrorName(err);
      if (name === 'InvalidStateError') {
        this.resetRecognitionSession();
        try {
          this.recognition.start();
          return;
        } catch (retryErr) {
          console.error('Error restarting recognition:', retryErr);
        }
      }
      console.error('Error starting recognition:', err);
      this.isListening = false;
      onError?.('Failed to start listening. Wait a moment and try again.');
      endOnce();
    }
  }

  /**
   * Stop listening
   */
  public stopListening() {
    if (!this.recognition) return;
    try {
      if (this.isListening) {
        this.recognition.stop();
      } else if (typeof this.recognition.abort === 'function') {
        this.recognition.abort();
      }
    } catch {
      // ignore
    }
    this.isListening = false;
  }

  /**
   * Get user-friendly error message
   */
  private getErrorMessage(error: string): string {
    const messages: Record<string, string> = {
      'no-speech': 'कोई आवाज नहीं सुनी गई। कृपया फिर से कोशिश करें।',
      'no-match': 'समझ नहीं आया। कृपया साफ़ और धीरे बोलकर फिर कोशिश करें।',
      'audio-capture':
        'माइक्रोफोन से आवाज नहीं मिल रही। कृपया अपना इनपुट डिवाइस जांचें।',
      network: 'नेटवर्क से जुड़ने में समस्या।',
      'service-not-allowed': 'वॉइस सेवा अभी उपलब्ध नहीं है।',
      'bad-grammar': 'समझने में समस्या हुई।',
      'language-not-supported': 'यह भाषा इस ब्राउज़र में समर्थित नहीं है।',
      'permission-denied':
        'Microphone permission is blocked. Click the lock icon in the address bar, allow microphone access, then try again.',
      'not-allowed':
        'Microphone permission is blocked. Click the lock icon in the address bar, allow microphone access, then try again.',
    };

    return messages[error] || `त्रुटि: ${error}। फिर से कोशिश करें।`;
  }

  /**
   * Get final transcript
   */
  public getTranscript(): string {
    return this.transcript.trim();
  }

  /**
   * Reset transcript
   */
  public resetTranscript() {
    this.transcript = '';
  }
}

/**
 * Text-to-Speech for elderly users
 */
export class TextToSpeech {
  private synthesis: SpeechSynthesis | null;
  private isSpeaking = false;

  constructor() {
    this.synthesis = typeof window !== 'undefined' ? window.speechSynthesis : null;
  }

  /**
   * Speak text in Hindi/English
   */
  public speak(text: string, language: 'hi' | 'en' = 'hi') {
    if (!this.synthesis || typeof window === 'undefined') return;
    // Cancel any ongoing speech
    if (this.isSpeaking) {
      this.synthesis.cancel();
    }

    const utterance = new SpeechSynthesisUtterance(text);

    // Set language
    utterance.lang = language === 'hi' ? 'hi-IN' : 'en-IN';

    // Elderly-friendly settings: slower, louder
    utterance.rate = 0.8; // Slower speech
    utterance.pitch = 1.0;
    utterance.volume = 1.0; // Maximum volume

    utterance.onstart = () => {
      this.isSpeaking = true;
    };

    utterance.onend = () => {
      this.isSpeaking = false;
    };

    utterance.onerror = (event: SpeechSynthesisErrorEvent) => {
      if (event.error === 'interrupted' || event.error === 'canceled') return;
      console.error('Speech synthesis error:', event);
      this.isSpeaking = false;
    };

    this.synthesis.speak(utterance);
  }

  /**
   * Stop speaking
   */
  public stop() {
    if (!this.synthesis) return;
    this.synthesis.cancel();
    this.isSpeaking = false;
  }

  /**
   * Pause speaking
   */
  public pause() {
    if (!this.synthesis) return;
    this.synthesis.pause();
  }

  /**
   * Resume speaking
   */
  public resume() {
    if (!this.synthesis) return;
    this.synthesis.resume();
  }

  /**
   * Check if currently speaking
   */
  public getIsSpeaking(): boolean {
    return this.isSpeaking;
  }
}

/**
 * Check browser support for voice features
 */
export function checkVoiceSupport(): {
  recognition: boolean;
  synthesis: boolean;
} {
  if (typeof window === 'undefined') {
    return { recognition: false, synthesis: false };
  }
  const SpeechRecognition = getSpeechRecognitionConstructor();
  return {
    recognition: !!SpeechRecognition,
    synthesis: !!window.speechSynthesis,
  };
}
