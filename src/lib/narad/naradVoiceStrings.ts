/** Narad voice UI — Unicode escapes avoid source encoding corruption. */

export const NARAD_HI = {
  listening: "\u0938\u0941\u0928 \u0930\u0939\u093e \u0939\u0942\u0901\u2026 \u092c\u094b\u0932\u093f\u090f",
  speakPrompt: "\u092c\u094b\u0932\u093f\u090f\u2026",
  askNarad: "Ask Narad",
  transcriptHint: "\u0906\u092a\u0915\u0940 \u0906\u0935\u093e\u091c\u093c \u092f\u0939\u093e\u0901 \u0926\u093f\u0916\u0947\u0917\u0940\u2026",
  thinking: "\u0938\u094b\u091a \u0930\u0939\u093e \u0939\u0942\u0901\u2026",
  speaking: "\u091c\u0935\u093e\u092c \u0926\u0947 \u0930\u0939\u093e \u0939\u0942\u0901\u2026",
  heardYou: "\u0938\u0941\u0928 \u0932\u093f\u092f\u093e",
  speakAgain: "Speak again",
  openChat: "Open full chat",
  stopListening: "Stop",
  muteVoice: "Mute voice",
  unmuteVoice: "Unmute voice",
  repeatAnswer: "Repeat",
  retry: "Try again",
  english: "English",
  hindi: "\u0939\u093f\u0902\u0926\u0940",
  noSpeech: "\u0915\u094b\u0908 \u0906\u0935\u093e\u091c\u093c \u0928\u0939\u0940\u0902 \u0938\u0941\u0928\u0940\u0964 \u092b\u093f\u0930 \u0938\u0947 \u0915\u094b\u0936\u093f\u0936 \u0915\u0930\u0947\u0902\u0964",
  privacyTitle: "Microphone for Narad",
  privacyBody:
    "Your voice is converted to text in your browser only. Hari Kirtan does not record or store audio. You can type instead anytime.",
  privacyOk: "Continue",
  micFallback: "Type your question below",
  typeInstead: "Type",
  sendText: "Send",
  voiceUnsupported: "Voice is not supported in this browser. Please use Type to ask.",
} as const;

export const NARAD_VOICE_ERRORS: Record<string, string> = {
  "no-speech": NARAD_HI.noSpeech,
  "no-match":
    "\u0938\u092e\u091d \u0928\u0939\u0940\u0902 \u0906\u092f\u093e\u0964 \u0927\u0940\u0930\u0947 \u0914\u0930 \u0938\u093e\u092b\u093c \u092c\u094b\u0932\u0915\u0930 \u092b\u093f\u0930 \u0915\u094b\u0936\u093f\u0936 \u0915\u0930\u0947\u0902\u0964",
  "audio-capture":
    "\u092e\u093e\u0907\u0915\u094d\u0930\u094b\u092b\u094b\u0928 \u0938\u0947 \u0906\u0935\u093e\u091c\u093c \u0928\u0939\u0940\u0902 \u092e\u093f\u0932 \u0930\u0939\u0940\u0964",
  network: "\u0928\u0947\u091f\u0935\u0930\u094d\u0915 \u0938\u0947 \u091c\u0941\u0921\u093c\u0928\u0947 \u092e\u0947\u0902 \u0938\u092e\u0938\u094d\u092f\u093e\u0964",
  "permission-denied":
    "Microphone permission is blocked. Allow mic in the browser address bar, then try again.",
  "not-allowed":
    "Microphone permission is blocked. Allow mic in the browser address bar, then try again.",
};

export const PRIVACY_STORAGE_KEY = "hari_kirtan_narad_mic_privacy_v1";
