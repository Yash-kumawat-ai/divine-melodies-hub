export interface SongSuggestion {
  id: string;
  title: string;
  artist: string;
  album?: string;
  artworkUrl?: string;
}

export interface LyricsResult {
  lyrics: string;
  source: 'lrclib-get' | 'lrclib-search' | 'lyrics-ovh';
  normalizedTitle: string;
  normalizedArtist: string;
}

interface ItunesTrack {
  trackId?: number;
  trackName?: string;
  artistName?: string;
  collectionName?: string;
  artworkUrl100?: string;
}

interface ItunesSearchResponse {
  results?: ItunesTrack[];
}

interface LrcLibSong {
  id: number;
  trackName: string;
  artistName: string;
  albumName?: string;
  plainLyrics?: string;
  syncedLyrics?: string;
}

const FEATURED_PATTERN = /\b(feat\.?|ft\.?|featuring)\b.*/i;
const TRAILING_TAG_PATTERN = /\s*-\s*(official|video|lyrics|audio|remix|live|version).*$/i;

function normalizeText(text: string): string {
  return text
    .replace(FEATURED_PATTERN, '')
    .replace(TRAILING_TAG_PATTERN, '')
    .replace(/[([][^)\]]*[)\]]/g, '')
    .replace(/["'`]/g, '')
    .replace(/\s+/g, ' ')
    .trim();
}

function uniqueNonEmpty(values: string[]): string[] {
  return [...new Set(values.map((v) => v.trim()).filter(Boolean))];
}

function buildTitleVariants(title: string): string[] {
  const base = normalizeText(title);
  const variants = [
    base,
    base.replace(/\s+\|\s+.*/g, ''),
    base.replace(/\s+-\s+.*/g, ''),
  ];
  return uniqueNonEmpty(variants);
}

function buildArtistVariants(artist: string): string[] {
  const base = normalizeText(artist);
  const variants = [
    base,
    base.replace(/\s*&\s*.*/g, ''),
    base.replace(/,.*$/g, ''),
    base.replace(/\sand\s.*/gi, ''),
  ];
  return uniqueNonEmpty(variants);
}

function isLyricsUsable(text: string | null | undefined): text is string {
  return Boolean(text && text.trim().length >= 25);
}

function scoreLrcLibCandidate(candidate: LrcLibSong, title: string, artist: string): number {
  const normalizedTitle = normalizeText(title).toLowerCase();
  const normalizedArtist = normalizeText(artist).toLowerCase();
  const candidateTitle = normalizeText(candidate.trackName || '').toLowerCase();
  const candidateArtist = normalizeText(candidate.artistName || '').toLowerCase();

  let score = 0;
  if (candidateTitle === normalizedTitle) score += 5;
  if (candidateArtist === normalizedArtist) score += 5;
  if (candidateTitle.includes(normalizedTitle) || normalizedTitle.includes(candidateTitle)) score += 3;
  if (candidateArtist.includes(normalizedArtist) || normalizedArtist.includes(candidateArtist)) score += 3;
  if (isLyricsUsable(candidate.plainLyrics) || isLyricsUsable(candidate.syncedLyrics)) score += 2;
  return score;
}

export async function searchGlobalSongs(query: string): Promise<SongSuggestion[]> {
  const q = query.trim();
  if (!q) return [];

  const response = await fetch(
    `https://itunes.apple.com/search?media=music&entity=song&limit=15&term=${encodeURIComponent(q)}`
  );

  if (!response.ok) {
    throw new Error('Unable to fetch song suggestions right now.');
  }

  const data = (await response.json()) as ItunesSearchResponse;
  const unique = new Set<string>();

  return (data.results || [])
    .map((track) => {
      const title = track.trackName || '';
      const artist = track.artistName || '';
      const key = `${title.toLowerCase()}-${artist.toLowerCase()}`;
      if (!title || !artist || unique.has(key)) return null;
      unique.add(key);

      return {
        id: String(track.trackId || key),
        title,
        artist,
        album: track.collectionName || '',
        artworkUrl: track.artworkUrl100 || '',
      } as SongSuggestion;
    })
    .filter(Boolean) as SongSuggestion[];
}

async function fetchFromLrcLib(title: string, artist: string): Promise<string | null> {
  const titleVariants = buildTitleVariants(title);
  const artistVariants = buildArtistVariants(artist);

  for (const titleVariant of titleVariants) {
    for (const artistVariant of artistVariants) {
      try {
        const response = await fetch(
          `https://lrclib.net/api/get?track_name=${encodeURIComponent(titleVariant)}&artist_name=${encodeURIComponent(artistVariant)}`
        );

        if (!response.ok) continue;

        const data = (await response.json()) as LrcLibSong;
        const lyrics = data.plainLyrics || data.syncedLyrics || null;
        if (isLyricsUsable(lyrics)) {
          return lyrics;
        }
      } catch {
        // Continue trying variants.
      }
    }
  }

  return null;
}

async function fetchFromLrcLibSearch(title: string, artist: string): Promise<string | null> {
  const query = `${normalizeText(title)} ${normalizeText(artist)}`.trim();
  if (!query) return null;

  try {
    const response = await fetch(`https://lrclib.net/api/search?q=${encodeURIComponent(query)}`);
    if (!response.ok) return null;

    const candidates = ((await response.json()) as LrcLibSong[]) || [];
    if (!Array.isArray(candidates) || candidates.length === 0) return null;

    const ranked = [...candidates].sort(
      (a, b) => scoreLrcLibCandidate(b, title, artist) - scoreLrcLibCandidate(a, title, artist)
    );

    for (const candidate of ranked.slice(0, 5)) {
      const lyrics = candidate.plainLyrics || candidate.syncedLyrics || null;
      if (isLyricsUsable(lyrics)) {
        return lyrics;
      }
    }
  } catch {
    return null;
  }

  return null;
}

async function fetchFromLyricsOvh(title: string, artist: string): Promise<string | null> {
  const titleVariants = buildTitleVariants(title);
  const artistVariants = buildArtistVariants(artist);

  for (const titleVariant of titleVariants) {
    for (const artistVariant of artistVariants) {
      try {
        const response = await fetch(
          `https://api.lyrics.ovh/v1/${encodeURIComponent(artistVariant)}/${encodeURIComponent(titleVariant)}`
        );

        if (!response.ok) continue;

        const data = (await response.json()) as { lyrics?: string };
        if (isLyricsUsable(data.lyrics)) {
          return data.lyrics;
        }
      } catch {
        // Continue trying variants.
      }
    }
  }

  return null;
}

export async function fetchGlobalLyrics(title: string, artist: string): Promise<string> {
  const result = await fetchGlobalLyricsWithSource(title, artist);
  return result.lyrics;
}

export async function fetchGlobalLyricsWithSource(title: string, artist: string): Promise<LyricsResult> {
  const normalizedTitle = normalizeText(title);
  const normalizedArtist = normalizeText(artist);

  const lrcLyrics = await fetchFromLrcLib(title, artist);
  if (isLyricsUsable(lrcLyrics)) {
    return {
      lyrics: lrcLyrics,
      source: 'lrclib-get',
      normalizedTitle,
      normalizedArtist,
    };
  }

  const lrcSearchLyrics = await fetchFromLrcLibSearch(title, artist);
  if (isLyricsUsable(lrcSearchLyrics)) {
    return {
      lyrics: lrcSearchLyrics,
      source: 'lrclib-search',
      normalizedTitle,
      normalizedArtist,
    };
  }

  const ovhLyrics = await fetchFromLyricsOvh(title, artist);
  if (isLyricsUsable(ovhLyrics)) {
    return {
      lyrics: ovhLyrics,
      source: 'lyrics-ovh',
      normalizedTitle,
      normalizedArtist,
    };
  }

  throw new Error('Lyrics not found for this song yet. Try another result or a cleaner title.');
}
