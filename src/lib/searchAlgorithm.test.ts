import { describe, expect, it } from 'vitest';
import {
  bhajanMatchesQuery,
  getFlexibleSearchTokens,
  naradSearchBhajans,
  normalizeSearchText,
  smartSearchBhajans,
} from './searchAlgorithm';

const chupChapBhajan = {
  id: 1,
  title: 'Chup Chap Baithe',
  titleHindi: 'चुप चाप बैठे सरकार हो',
  singerName: 'Sanjay Mittal',
  composerName: '',
  lyricsHindi: 'चुप चाप बैठे',
  lyricsTransliteration: '',
  tags: ['devotional'],
};

const gharPadharoBhajan = {
  id: 10,
  title: 'Ghar Mein Padharo Gajanan Ji',
  titleHindi: 'घर में पधारो गजानंद जी मेरे घर में पधारो',
  singerName: 'Nova Spiritual India',
  lyricsHindi: '',
  lyricsTransliteration: 'Ghar Mein Padharo Gajanan Ji',
  tags: [],
};

const unrelatedBhajans = [
  {
    id: 2,
    title: 'Hanuman Chalisa',
    titleHindi: 'हनुमान चालीसा',
    singerName: 'Hariharan',
    lyricsHindi: 'श्री गुरु चरण',
    lyricsTransliteration: '',
    tags: [],
  },
  {
    id: 3,
    title: 'Jai Ganesh Deva',
    titleHindi: 'जय गणेश देवा',
    singerName: 'Anuradha Paudwal',
    lyricsHindi: 'सुख करता',
    lyricsTransliteration: '',
    tags: [],
  },
  {
    id: 4,
    title: 'Naukri pe rakhe baithe',
    titleHindi: 'नौकरी पे रख ले बैठे',
    singerName: 'Shekhar',
    lyricsHindi: 'नौकरी पे',
    lyricsTransliteration: '',
    tags: [],
  },
];

describe('searchAlgorithm', () => {
  it('normalizes spaced and unspaced Hindi the same way', () => {
    expect(normalizeSearchText('चुप चाप')).toBe(normalizeSearchText('चुपचाप'));
  });

  it('finds bhajan when query has no space between Hindi words', () => {
    const results = smartSearchBhajans('चुपचाप', [chupChapBhajan, ...unrelatedBhajans]);
    expect(results.some((b) => b.id === 1)).toBe(true);
    expect(results.some((b) => b.id === 2)).toBe(false);
  });

  it('does not split short Latin queries into noisy tokens', () => {
    const tokens = getFlexibleSearchTokens('bethe');
    expect(tokens).not.toContain('he');
    expect(tokens).toContain('bethe');
  });

  it('excludes unrelated bhajans for vague Latin query "bethe"', () => {
    const results = smartSearchBhajans('bethe', unrelatedBhajans);
    expect(results.every((b) => b.id === 4)).toBe(true);
    expect(results).toHaveLength(1);
  });

  it('excludes unrelated bhajans for "sawaree" unless title matches', () => {
    const results = smartSearchBhajans('sawaree', unrelatedBhajans);
    expect(results).toHaveLength(0);
  });

  it('matches baithe/bethe style titles', () => {
    expect(bhajanMatchesQuery(unrelatedBhajans[2], 'baithe')).toBe(true);
    expect(bhajanMatchesQuery(unrelatedBhajans[2], 'bethe')).toBe(true);
  });

  it('narad search finds Hindi title matches like the search bar', () => {
    const results = naradSearchBhajans('चुपचाप', [chupChapBhajan, ...unrelatedBhajans]);
    expect(results.some((b) => b.id === 1)).toBe(true);
    expect(results.some((b) => b.id === 2)).toBe(false);
  });

  it('narad search rejects vague 3-letter Latin queries without title match', () => {
    const results = naradSearchBhajans('Ghr', unrelatedBhajans);
    expect(results).toHaveLength(0);
  });

  it('narad search does not return unrelated bhajans for "sawaree"', () => {
    const results = naradSearchBhajans('sawaree', [chupChapBhajan, ...unrelatedBhajans]);
    expect(results).toHaveLength(0);
  });

  it('narad search finds Hindi title from Hinglish "Ghr me padharo"', () => {
    const shyamBhajan = {
      id: 11,
      title: 'Dekhu Jidhar Udhar',
      titleHindi: 'देखूं जिधर उधर ही मेरे श्याम का नजारा',
      singerName: 'Traditional',
      lyricsHindi: '',
      lyricsTransliteration: '',
      tags: [],
    };
    const results = naradSearchBhajans('Ghr me padharo', [gharPadharoBhajan, shyamBhajan, ...unrelatedBhajans]);
    expect(results.some((b) => b.id === 10)).toBe(true);
    expect(results.some((b) => b.id === 11)).toBe(false);
  });

  it('debugs Mor Chadi search', () => {
    const morChadiBhajan = {
      id: 100000,
      slug: 'mor-chadi-lehrai-re-rasiya-o-sanwara-mor-chadi-lehrai-re-bhaktidarshanjaipur',
      title: 'मोर छड़ी लहराई रे रसिया ओ सांवरा...Mor Chadi Lehrai re ||  BHAKTIDARSHANJAIPUR',
      titleHindi: 'मोर छड़ी लहराई रे रसिया ओ सांवरा.',
      deityId: 0,
      singerName: 'Bhakti Darshan Jaipur',
      composerName: '',
      youtubeUrl: '',
      lyricsHindi: '',
      lyricsTransliteration: '',
      playCount: 0,
      rating: 0,
      tags: [],
      featured: false,
    };
    const results = naradSearchBhajans('मोर छड़ी लहराई', [morChadiBhajan]);
    console.log('TEST RESULT BHAJAN:', results);
    expect(results).toHaveLength(1);
  });

  it('falls back to partial title matching if no exact or fuzzy match is found', () => {
    const morChadiBhajan = {
      id: 100000,
      slug: 'mor-chadi-lehrai-re-rasiya-o-sanwara-mor-chadi-lehrai-re-bhaktidarshanjaipur',
      title: 'मोर छड़ी लहराई रे रसिया ओ सांवरा...Mor Chadi Lehrai re ||  BHAKTIDARSHANJAIPUR',
      titleHindi: 'मोर छड़ी लहराई रे रसिया ओ सांवरा.',
      deityId: 0,
      singerName: 'Bhakti Darshan Jaipur',
      composerName: '',
      youtubeUrl: '',
      lyricsHindi: '',
      lyricsTransliteration: '',
      playCount: 0,
      rating: 0,
      tags: [],
      featured: false,
    };
    const results = naradSearchBhajans('मोर चढ़ी', [morChadiBhajan]);
    expect(results).toHaveLength(1);
    expect(results[0].id).toBe(100000);
  });

  it('narad search matches smartSearch ranking when the catalog scorer finds hits', () => {
    const source = [chupChapBhajan, ...unrelatedBhajans];
    const smart = smartSearchBhajans('चुपचाप', source);
    const narad = naradSearchBhajans('चुपचाप', source);
    expect(narad.map((b) => b.id)).toEqual(smart.map((b) => b.id));
  });

  it('narad search keeps aarti titles findable like the main search bar', () => {
    const aarti = {
      id: 21,
      title: 'Om Jai Jagdish Hare',
      titleHindi: 'ॐ जय जगदीश हरे',
      singerName: 'Traditional',
      lyricsHindi: '',
      lyricsTransliteration: 'Om Jai Jagdish Hare Aarti',
      tags: ['aarti'],
    };
    const smart = smartSearchBhajans('om jai jagdish aarti', [aarti, ...unrelatedBhajans]);
    const narad = naradSearchBhajans('om jai jagdish aarti', [aarti, ...unrelatedBhajans]);
    expect(smart.some((b) => b.id === 21) || narad.some((b) => b.id === 21)).toBe(true);
    expect(narad.some((b) => b.id === 21)).toBe(true);
  });

  it('ranks Baglamukhi Aarti first for "baglamukhi aarti" and handles "arti" synonym', () => {
    const baglamukhiAarti = {
      id: 50,
      slug: 'maa-baglamukhi-aarti',
      title: 'Maa Baglamukhi Aarti',
      titleHindi: 'माँ बगलामुखी की आरती',
      singerName: 'Anuradha Paudwal',
      composerName: 'Traditional',
      lyricsHindi: 'जय बगलामुखी माता',
      search_aliases: ['baglamukhi arti', 'pitambara aarti'],
    };

    const results = smartSearchBhajans('baglamukhi aarti', [
      ...unrelatedBhajans,
      baglamukhiAarti,
      chupChapBhajan,
    ]);

    expect(results.length).toBeGreaterThan(0);
    expect(results[0].id).toBe(50);

    const artiResults = smartSearchBhajans('baglamukhi arti', [
      ...unrelatedBhajans,
      baglamukhiAarti,
    ]);
    expect(artiResults[0].id).toBe(50);
  });

  it('returns Hanuman Chalisa first for "hanuman chalisa"', () => {
    const results = smartSearchBhajans('hanuman chalisa', [
      chupChapBhajan,
      ...unrelatedBhajans,
    ]);
    expect(results[0].id).toBe(2);
  });

  it('does not match Krishna or unrelated items when searching "balaji" unless in title/aliases', () => {
    const krishnaBhajan = {
      id: 70,
      title: 'Achyutam Keshavam',
      titleHindi: 'अच्युतम् केशवम्',
      singerName: 'Madhav',
      composerName: '',
      lyricsHindi: 'कृष्ण दामोदरम्',
    };

    const salasarBalaji = {
      id: 71,
      title: 'Salasar Balaji Aarti',
      titleHindi: 'सालासर बालाजी आरती',
      singerName: 'Lakhbir Singh Lakha',
      composerName: '',
      lyricsHindi: 'जय सालासर बालाजी',
      search_aliases: ['balaji aarti'],
    };

    const results = smartSearchBhajans('balaji', [krishnaBhajan, salasarBalaji]);
    expect(results.some((b) => b.id === 70)).toBe(false);
    expect(results.some((b) => b.id === 71)).toBe(true);
  });

  it('matches bhajan by composer name when queried', () => {
    const ramBhajan = {
      id: 80,
      title: 'Shri Ramachandra Kripalu Bhajman',
      titleHindi: 'श्री रामचंद्र कृपालु भजुमन',
      singerName: 'Lata Mangeshkar',
      composerName: 'Goswami Tulsidas',
      lyricsHindi: 'श्री रामचंद्र कृपालु भजुमन हरण भवभय दारुणम्',
    };

    const results = smartSearchBhajans('Tulsidas', [
      ...unrelatedBhajans,
      ramBhajan,
    ]);
    expect(results.some((b) => b.id === 80)).toBe(true);
    expect(results[0].id).toBe(80);
  });
});
