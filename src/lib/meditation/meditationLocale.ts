import type { MeditationPractice } from "@/lib/meditation/meditationTypes";
import type { SupportedLanguage } from "@/hooks/useLanguage";

type Locale = "en" | "hi";

type MeditationCopy = {
  entry: {
    mantra: { label: string; desc: string };
    breath: { label: string; desc: string };
    sleep: { label: string; desc: string };
    focus: { label: string; desc: string };
  };
  home: {
    badge: string;
    title: string;
    subtitle: string;
    minutes: string;
    streak: string;
    sessions: string;
    beginJapa: string;
    continueSuffix: string;
    quickPause: string;
    deityJourneys: string;
    chooseNaam: string;
    mantraDesc: string;
    guidedDesc: string;
    practiceNote: string;
    practiceNoteBody: string;
  };
  session: {
    sankalp: string;
    sankalpPlaceholder: string;
    skip: string;
  };
  controls: {
    begin: string;
    resume: string;
    pause: string;
    listening: string;
    tapOrVoice: string;
    complete: string;
    countJapa: string;
    voiceStop: string;
    voiceStart: string;
    done: string;
    voiceUnavailable: string;
    open: string;
    minute: string;
    custom: string;
    ambience: string;
    endEarly: string;
    reducedMotion: string;
    highContrast: string;
    endBell: string;
    back: string;
    hide: string;
    show: string;
  };
  ambience: Record<string, string>;
  complete: {
    title: string;
    shanti: string;
    minutesSuffix: string;
    streakSuffix: string;
    moodQuestion: string;
    reflection: string;
    reflectionPlaceholder: string;
    close: string;
    moods: string[];
  };
  practiceTitles: Record<string, string>;
};

const COPY: Record<Locale, MeditationCopy> = {
  en: {
    entry: {
      mantra: { label: "Mantra Japa", desc: "Sacred names - mala count" },
      breath: { label: "Pranayama", desc: "Steady breath practice" },
      sleep: { label: "Sleep Dhyan", desc: "Dim mandala - soft rest" },
      focus: { label: "Sankalp", desc: "Clarity - gentle bell" },
    },
    home: {
      badge: "Dhyan Mandir",
      title: "Sit. Chant. Return.",
      subtitle: "A quiet space for japa, breath, rest, and sankalp with devotional sound and soft mandala focus.",
      minutes: "Minutes",
      streak: "Streak",
      sessions: "Sessions",
      beginJapa: "Begin Mantra Japa",
      continueSuffix: "Continue",
      quickPause: "2 minute meditation",
      deityJourneys: "Deity journeys",
      chooseNaam: "Choose a naam",
      mantraDesc: "Naam japa with gentle focus",
      guidedDesc: "A calm guided practice",
      practiceNote: "Practice note",
      practiceNoteBody: "Begin softly, keep the phone still, and let the mantra carry the rhythm. This is devotional practice, not medical advice.",
    },
    session: {
      sankalp: "Sankalp",
      sankalpPlaceholder: "Write your intention for this session...",
      skip: "Skip",
    },
    controls: {
      begin: "Begin",
      resume: "Resume",
      pause: "Pause",
      listening: "Listening for japa",
      tapOrVoice: "Tap or use voice",
      complete: "Complete",
      countJapa: "Count japa",
      voiceStop: "Stop voice counting",
      voiceStart: "Start voice counting",
      done: "done",
      voiceUnavailable: "Voice count is unavailable here. Manual count still works.",
      open: "Open",
      minute: "min",
      custom: "Custom",
      ambience: "Ambience",
      endEarly: "End session early",
      reducedMotion: "Reduced motion",
      highContrast: "High contrast",
      endBell: "End bell",
      back: "Back",
      hide: "Hide",
      show: "Show",
    },
    ambience: {
      tanpura: "Tanpura",
      bell: "Bell",
      rain: "Rain",
      river: "River",
      flute: "Flute",
      silence: "Silence",
    },
    complete: {
      title: "Session Complete",
      shanti: "Hari Om - Shanti",
      minutesSuffix: "mindful min",
      streakSuffix: "day streak",
      moodQuestion: "How do you feel?",
      reflection: "Reflection (optional)",
      reflectionPlaceholder: "A quiet thought from your practice...",
      close: "Close",
      moods: ["Peaceful", "Grateful", "Energized", "Calm", "Devotional"],
    },
    practiceTitles: {
      mantra_shiva: "Om Namah Shivaya",
      mantra_krishna: "Hare Krishna",
      mantra_radhe: "Radhe Radhe",
      mantra_ram: "Jai Shree Ram",
      mantra_narayana: "Om Namo Narayanaya",
      sleep_rest: "Sleep Dhyan",
      focus_clarity: "Focus Sankalp",
      quick_two: "2-Minute Pause",
    },
  },
  hi: {
    entry: {
      mantra: { label: "मंत्र जप", desc: "पवित्र नाम - माला गिनती" },
      breath: { label: "प्राणायाम", desc: "शांत श्वास अभ्यास" },
      sleep: { label: "निद्रा ध्यान", desc: "मंद मंडल - कोमल विश्राम" },
      focus: { label: "संकल्प", desc: "एकाग्रता - मधुर घंटी" },
    },
    home: {
      badge: "ध्यान मंदिर",
      title: "बैठें। जप करें। लौटें।",
      subtitle: "जप, श्वास, विश्राम और संकल्प के लिए शांत स्थान, भक्ति ध्वनि और कोमल मंडल ध्यान के साथ।",
      minutes: "मिनट",
      streak: "लगातार दिन",
      sessions: "सत्र",
      beginJapa: "मंत्र जप शुरू करें",
      continueSuffix: "जारी रखें",
      quickPause: "2 मिनट ध्यान",
      deityJourneys: "देव यात्रा",
      chooseNaam: "नाम चुनें",
      mantraDesc: "कोमल ध्यान के साथ नाम जप",
      guidedDesc: "शांत निर्देशित अभ्यास",
      practiceNote: "अभ्यास संदेश",
      practiceNoteBody: "धीरे शुरू करें, फोन स्थिर रखें, और मंत्र को अपनी लय बनाने दें। यह भक्ति अभ्यास है, चिकित्सा सलाह नहीं।",
    },
    session: {
      sankalp: "संकल्प",
      sankalpPlaceholder: "इस सत्र के लिए अपना संकल्प लिखें...",
      skip: "छोड़ें",
    },
    controls: {
      begin: "शुरू करें",
      resume: "जारी रखें",
      pause: "विराम",
      listening: "जप सुन रहा है",
      tapOrVoice: "टैप करें या बोलकर जप करें",
      complete: "पूर्ण",
      countJapa: "जप गिनें",
      voiceStop: "वॉइस गिनती रोकें",
      voiceStart: "वॉइस गिनती शुरू करें",
      done: "पूर्ण",
      voiceUnavailable: "यहां वॉइस गिनती उपलब्ध नहीं है। मैनुअल गिनती चालू है।",
      open: "खुला",
      minute: "मिनट",
      custom: "अपना",
      ambience: "ध्वनि",
      endEarly: "सत्र समाप्त करें",
      reducedMotion: "कम गति",
      highContrast: "अधिक कंट्रास्ट",
      endBell: "अंतिम घंटी",
      back: "वापस",
      hide: "छिपाएं",
      show: "दिखाएं",
    },
    ambience: {
      tanpura: "तानपुरा",
      bell: "घंटी",
      rain: "वर्षा",
      river: "नदी",
      flute: "बांसुरी",
      silence: "मौन",
    },
    complete: {
      title: "सत्र पूर्ण",
      shanti: "हरि ॐ - शांति",
      minutesSuffix: "ध्यान मिनट",
      streakSuffix: "दिन लगातार",
      moodQuestion: "आप कैसा महसूस कर रहे हैं?",
      reflection: "अनुभव लिखें (वैकल्पिक)",
      reflectionPlaceholder: "अभ्यास से जुड़ा कोई शांत विचार...",
      close: "बंद करें",
      moods: ["शांत", "कृतज्ञ", "ऊर्जावान", "स्थिर", "भक्तिमय"],
    },
    practiceTitles: {
      mantra_shiva: "ॐ नमः शिवाय",
      mantra_krishna: "हरे कृष्ण",
      mantra_radhe: "राधे राधे",
      mantra_ram: "जय श्री राम",
      mantra_narayana: "ॐ नमो नारायणाय",
      sleep_rest: "निद्रा ध्यान",
      focus_clarity: "संकल्प ध्यान",
      quick_two: "2 मिनट ध्यान",
    },
  },
};

function locale(language: SupportedLanguage): Locale {
  return language === "hi" ? "hi" : "en";
}

export function getMeditationCopy(language: SupportedLanguage): MeditationCopy {
  return COPY[locale(language)];
}

export function getMeditationPracticeTitle(practice: MeditationPractice, language: SupportedLanguage): string {
  return getMeditationCopy(language).practiceTitles[practice.id] ?? practice.title;
}
