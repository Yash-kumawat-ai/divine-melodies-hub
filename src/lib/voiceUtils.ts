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

function isLocalSecureOrigin() {
  if (typeof window === 'undefined') return false;
  return ['localhost', '127.0.0.1', '[::1]'].includes(window.location.hostname);
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

function getMediaErrorMessage(error: unknown): string {
  const name = (error as { name?: string })?.name || error;

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
    return { ok: false, error: 'Microphone requires HTTPS or localhost. Open the site with HTTPS and try again.' };
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
    const name = (error as { name?: string })?.name;
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
      onEnd?.();
      return;
    }

    this.transcript = '';
    this.isListening = false;

    // Listen for speech
    (this.recognition as any).onresult = (event: SpeechRecognitionEvent) => {
      let interim = '';

      for (let i = event.resultIndex; i < event.results.length; i++) {
        const transcript = event.results[i][0].transcript;

        if (event.results[i].isFinal) {
          this.transcript += transcript + ' ';
        } else {
          interim += transcript;
        }
      }

      // Call callback with combined transcript and final flag
      const combined = this.transcript + interim;
      const isFinal = event.results[event.results.length - 1].isFinal;
      onTranscript(combined, isFinal);
    };

    (this.recognition as any).onerror = (event: any) => {
      const errorMessage = this.getErrorMessage(event.error);
      console.error('Voice error:', event.error, errorMessage);
      this.isListening = false;
      onError?.(errorMessage);
    };

    (this.recognition as any).onstart = () => {
      this.isListening = true;
      onStart?.();
    };

    (this.recognition as any).onend = () => {
      console.log('Voice recognition ended');
      this.isListening = false;
      onEnd?.();
    };

    try {
      this.recognition.start();
    } catch (err) {
      console.error('Error starting recognition:', err);
      this.isListening = false;
      onError?.('Failed to start listening');
    }
  }

  /**
   * Stop listening
   */
  public stopListening() {
    if (this.recognition && this.isListening) {
      this.recognition.stop();
      this.isListening = false;
    }
  }

  /**
   * Get user-friendly error message
   */
  private getErrorMessage(error: string): string {
    const messages: { [key: string]: string } = {
      'no-speech': 'कोई आवाज नहीं सुनी गई। कृपया फिर से कोशिश करें।',
      'audio-capture': 'माइक्रोफोन से आवाज नहीं मिल रही। कृपया अपना इनपुट डिवाइस जांचें।',
      'network': 'नेटवर्क से जुड़ने में समस्या।',
      'service-not-allowed': 'वॉइस सेवा अभी उपलब्ध नहीं है।',
      'bad-grammar': 'समझने में समस्या हुई।',
      'permission-denied': 'कृपया माइक्रोफोन की अनुमति दें।',
      'not-allowed': 'Microphone permission is blocked. Click the lock icon in the address bar, allow microphone access, then try again.',
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

    utterance.onerror = (error: SpeechSynthesisErrorEvent) => {
      console.error('Speech synthesis error:', error);
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
  const SpeechRecognition = getSpeechRecognitionConstructor();
  return {
    recognition: !!SpeechRecognition,
    synthesis: typeof window !== 'undefined' && !!window.speechSynthesis,
  };
}
