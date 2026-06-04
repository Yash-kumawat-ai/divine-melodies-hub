import type { LocalizedText } from './panchang';

export type PanchangMetaPlaceholders = {
  vikramSamvat: LocalizedText;
  paksha: LocalizedText;
  ayan: LocalizedText;
  ritu: LocalizedText;
  maas: LocalizedText;
  suryaRashi: LocalizedText;
  chandraRashi: LocalizedText;
};

export type PanchangMuhuratTile = {
  id: string;
  title: LocalizedText;
  time: string;
};

export type PanchangKaryaLists = {
  shubh: LocalizedText[];
  ashubh: LocalizedText[];
};

export const panchangMetaPlaceholders: PanchangMetaPlaceholders = {
  vikramSamvat: { en: 'Vikram Samvat 2083', hi: 'विक्रम संवत 2083' },
  paksha: { en: 'Shukla Paksha', hi: 'शुक्ल पक्ष' },
  ayan: { en: 'Uttarayan', hi: 'उत्तरायण' },
  ritu: { en: 'Grishma', hi: 'ग्रीष्म' },
  maas: { en: 'Vaishakh', hi: 'वैशाख' },
  suryaRashi: { en: 'Vrishabha', hi: 'वृषभ' },
  chandraRashi: { en: 'Kanya', hi: 'कन्या' },
};

export const panchangMuhuratTiles: PanchangMuhuratTile[] = [
  {
    id: 'abhijit',
    title: { en: 'Abhijit Muhurat', hi: 'अभिजीत मुहूर्त' },
    time: '11:52 AM - 12:46 PM',
  },
  {
    id: 'vijay',
    title: { en: 'Vijay Muhurat', hi: 'विजय मुहूर्त' },
    time: '02:30 PM - 03:24 PM',
  },
  {
    id: 'godhuli',
    title: { en: 'Godhuli Muhurat', hi: 'गोधूलि मुहूर्त' },
    time: '07:10 PM - 07:31 PM',
  },
  {
    id: 'brahma',
    title: { en: 'Brahma Muhurat', hi: 'ब्रह्म मुहूर्त' },
    time: '04:04 AM - 04:44 AM',
  },
];

export const panchangKaryaLists: PanchangKaryaLists = {
  shubh: [
    { en: 'Puja & path', hi: 'पूजा पाठ' },
    { en: 'Griha pravesh', hi: 'गृह प्रवेश' },
    { en: 'New work start', hi: 'नवीन कार्य प्रारंभ' },
    { en: 'Vehicle purchase', hi: 'वाहन क्रय' },
    { en: 'Education work', hi: 'शिक्षा कार्य' },
  ],
  ashubh: [
    { en: 'Marriage', hi: 'विवाह' },
    { en: 'Travel (west)', hi: 'यात्रा (दिशा: पश्चिम)' },
    { en: 'Loan or debt', hi: 'ऋण निवेश' },
    { en: 'Hair cutting', hi: 'बाल मुंडन' },
    { en: 'Land purchase', hi: 'भूमि खरीद' },
  ],
};
