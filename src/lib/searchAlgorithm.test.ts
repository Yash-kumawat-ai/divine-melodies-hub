import { describe, expect, it } from 'vitest';
import {
  bhajanMatchesQuery,
  getFlexibleSearchTokens,
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
});
