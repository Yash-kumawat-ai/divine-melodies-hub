export type LocalizedText = {
  en: string;
  hi: string;
};

export type PanchangInfo = {
  tithi: LocalizedText;
  nakshatra: LocalizedText;
  sunrise: string;
  sunset: string;
  paksha: LocalizedText;
  rahuKaal: string;
  festival: LocalizedText;
  mantra: {
    title: LocalizedText;
    text: LocalizedText;
    meaning: LocalizedText;
  };
  darshan: {
    title: LocalizedText;
    subtitle: LocalizedText;
  };
};

export const todaysPanchang: PanchangInfo = {
  tithi: { en: 'Ekadashi', hi: 'एकादशी' },
  nakshatra: { en: 'Rohini', hi: 'रोहिणी' },
  sunrise: '5:42 AM',
  sunset: '6:55 PM',
  paksha: { en: 'Shukla Paksha', hi: 'शुक्ल पक्ष' },
  rahuKaal: '7:18 AM - 8:56 AM',
  festival: { en: 'Mohini Ekadashi', hi: 'मोहिनी एकादशी' },
  mantra: {
    title: { en: 'Daily Mantra', hi: 'आज का मंत्र' },
    text: { en: 'Om Namo Bhagavate Vasudevaya', hi: 'ॐ नमो भगवते वासुदेवाय' },
    meaning: {
      en: 'A peaceful invocation to Lord Vishnu for clarity, devotion, and protection.',
      hi: 'भगवान विष्णु की शरण, शांति, भक्ति और संरक्षण के लिए पवित्र स्मरण।',
    },
  },
  darshan: {
    title: { en: 'Daily Darshan', hi: 'आज का दर्शन' },
    subtitle: {
      en: 'A calm sacred image space ready for live darshan integration.',
      hi: 'लाइव दर्शन जोड़ने के लिए एक शांत पवित्र स्थान।',
    },
  },
};
