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

const SpeechRecognition = window.SpeechRecognition || (window as any).webkitSpeechRecognition;

export class VoiceManager {
  private recognition: any;
  private isListening = false;
  private transcript = '';
  private language: 'hi' | 'en' = 'hi';

  constructor(language: 'hi' | 'en' = 'hi') {
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
  public startListening(
    onTranscript: (text: string, isFinal: boolean) => void,
    onError?: (error: string) => void,
    onEnd?: () => void
  ) {
    if (!this.recognition) {
      const msg = 'Speech Recognition not supported in this browser';
      onError?.(msg);
      return;
    }

    this.transcript = '';
    this.isListening = true;

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
      onError?.(errorMessage);
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
      'audio-capture': 'माइक्रोफोन एक्सेस नहीं दिया गया।',
      'network': 'नेटवर्क से जुड़ने में समस्या।',
      'service-not-allowed': 'वॉइस सेवा अभी उपलब्ध नहीं है।',
      'bad-grammar': 'समझने में समस्या हुई।',
      'permission-denied': 'कृपया माइक्रोफोन की अनुमति दें।',
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
  private synthesis: SpeechSynthesis;
  private isSpeaking = false;

  constructor() {
    this.synthesis = window.speechSynthesis;
  }

  /**
   * Speak text in Hindi/English
   */
  public speak(text: string, language: 'hi' | 'en' = 'hi') {
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
    this.synthesis.cancel();
    this.isSpeaking = false;
  }

  /**
   * Pause speaking
   */
  public pause() {
    this.synthesis.pause();
  }

  /**
   * Resume speaking
   */
  public resume() {
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
  return {
    recognition: !!SpeechRecognition,
    synthesis: !!window.speechSynthesis,
  };
}
