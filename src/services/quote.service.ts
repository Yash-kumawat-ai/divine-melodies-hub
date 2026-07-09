/** Daily devotional quotes for the DivineThoughtCard */
export interface DivineQuote {
  text: string;
  language: 'hi' | 'en';
  source?: string;
}

const DAILY_QUOTES: DivineQuote[] = [
  { text: 'राम नाम से बड़ा कोई सहारा नहीं।', language: 'hi', source: 'Ramayana' },
  { text: 'जो राम को रटे, सो राम हो जाए।', language: 'hi' },
  { text: 'हरि नाम लेत कुछ लागत नाहीं।', language: 'hi', source: 'Kabir Doha' },
  { text: 'मन चंगा तो कठौती में गंगा।', language: 'hi', source: 'Ravidas' },
  { text: 'भज मन राम चरन सुखदाई।', language: 'hi' },
  { text: 'In chanting the Lord\'s name lies the greatest peace.', language: 'en' },
  { text: 'Devotion is the purest form of love — it asks nothing, it gives everything.', language: 'en' },
  { text: 'श्रद्धा से भक्ति और भक्ति से मुक्ति।', language: 'hi' },
  { text: 'जब तक सास चले, राम नाम रे।', language: 'hi' },
  { text: 'करम प्रधान विश्व रची राखा।', language: 'hi', source: 'Ramcharitmanas' },
];

/**
 * Returns today's divine quote, rotating daily based on date.
 */
export function getDailyQuote(): DivineQuote {
  const dayOfYear = Math.floor(
    (Date.now() - new Date(new Date().getFullYear(), 0, 0).getTime()) / 86_400_000,
  );
  return DAILY_QUOTES[dayOfYear % DAILY_QUOTES.length];
}
