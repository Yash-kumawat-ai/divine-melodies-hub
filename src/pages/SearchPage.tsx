import { useSearchParams, Link } from "react-router-dom";
import { Search as SearchIcon, Music2, Globe2, BookText, Loader2, Youtube, ExternalLink, PlayCircle, MessageSquare } from "lucide-react";
import { useState, useMemo, useEffect } from "react";
import { motion } from "framer-motion";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import BhajanCard from "@/components/BhajanCard";
import { bhajans, deities } from "@/data/bhajans";
import { smartSearchBhajans } from "@/lib/searchAlgorithm";
import { generateBhajanSlug } from "@/lib/slugUtils";
import { supabase } from "@/integrations/supabase/client";
import { useDeities } from "@/hooks/useDeities";
import { useLyricsFallback } from "@/hooks/useLyricsFallback";
import { useAssistantContext } from "@/hooks/useAssistantContext";
import { fetchGlobalLyricsWithSource, LyricsResult, searchGlobalSongs, SongSuggestion } from "@/lib/globalLyrics";
import { buildYouTubeEmbedUrl, searchYouTubeVideos, YouTubeVideoResult } from "@/lib/youtubeSearch";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface UserBhajan {
  id: string;
  user_id: string;
  title: string;
  title_hindi: string;
  deity_id: number;
  singer_name: string;
  composer_name?: string;
  image_url?: string;
  youtube_url?: string;
  lyrics_hindi: string;
  created_at: string;
  status: string;
}

export default function SearchPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const initialQuery = searchParams.get("q") || "";
  const initialDeity = searchParams.get("deity") || "";
  const [query, setQuery] = useState(initialQuery);
  const [globalQuery, setGlobalQuery] = useState(initialQuery);
  const [globalSuggestions, setGlobalSuggestions] = useState<SongSuggestion[]>([]);
  const [selectedSong, setSelectedSong] = useState<SongSuggestion | null>(null);
  const [globalLyrics, setGlobalLyrics] = useState('');
  const [globalLyricsSource, setGlobalLyricsSource] = useState('');
  const [globalLoading, setGlobalLoading] = useState(false);
  const [globalLyricsLoading, setGlobalLyricsLoading] = useState(false);
  const [globalError, setGlobalError] = useState('');
  const [youtubeQuery, setYoutubeQuery] = useState(initialQuery);
  const [youtubeResults, setYoutubeResults] = useState<YouTubeVideoResult[]>([]);
  const [youtubeLoading, setYoutubeLoading] = useState(false);
  const [youtubeError, setYoutubeError] = useState('');
  const [selectedVideo, setSelectedVideo] = useState<YouTubeVideoResult | null>(null);
  const [isYouTubePlayerOpen, setIsYouTubePlayerOpen] = useState(false);
  const [activeMode, setActiveMode] = useState<'bhajans' | 'global' | 'youtube'>('bhajans');
  const [selectedDeity, setSelectedDeity] = useState(initialDeity);
  const [userBhajans, setUserBhajans] = useState<UserBhajan[]>([]);
  const [loadingUserBhajans, setLoadingUserBhajans] = useState(true);
  const { deities: allDeities, loading: deitiesLoading } = useDeities();
  
  // Lyrics fallback orchestration
  const lyricsFallback = useLyricsFallback();
  const [showFallbackLyrics, setShowFallbackLyrics] = useState(false);
  
  // Assistant context management
  const { setContext: setAssistantContext } = useAssistantContext();

  useEffect(() => {
    const run = async () => {
      const q = globalQuery.trim();
      if (q.length < 2) {
        setGlobalSuggestions([]);
        return;
      }

      setGlobalLoading(true);
      setGlobalError('');
      try {
        const results = await searchGlobalSongs(q);
        setGlobalSuggestions(results);
      } catch (error: any) {
        setGlobalError(error.message || 'Unable to search songs right now.');
      } finally {
        setGlobalLoading(false);
      }
    };

    const timer = setTimeout(run, 350);
    return () => clearTimeout(timer);
  }, [globalQuery]);

  useEffect(() => {
    const run = async () => {
      const q = youtubeQuery.trim();
      if (q.length < 2) {
        setYoutubeResults([]);
        setYoutubeError('');
        return;
      }

      setYoutubeLoading(true);
      setYoutubeError('');
      try {
        const results = await searchYouTubeVideos(q);
        setYoutubeResults(results);
      } catch (error: any) {
        setYoutubeError(error.message || 'Unable to search YouTube right now.');
      } finally {
        setYoutubeLoading(false);
      }
    };

    const timer = setTimeout(run, 350);
    return () => clearTimeout(timer);
  }, [youtubeQuery]);

  // Fetch user uploads on mount
  useEffect(() => {
    const fetchUserBhajans = async () => {
      try {
        const { data, error } = await supabase
          .from('user_uploads')
          .select('*')
          .eq('status', 'approved')
          .order('created_at', { ascending: false });

        if (error) {
          console.error('Error fetching user bhajans:', error);
        } else if (data) {
          setUserBhajans(data as UserBhajan[]);
        }
      } catch (err) {
        console.error('Error fetching user bhajans:', err);
      } finally {
        setLoadingUserBhajans(false);
      }
    };

    fetchUserBhajans();
  }, []);

  // Trigger lyrics fallback when local results are empty
  useEffect(() => {
    if (activeMode === 'bhajans' && query.trim() && results.length === 0) {
      lyricsFallback.searchLyrics(query);
      setShowFallbackLyrics(true);
    } else {
      setShowFallbackLyrics(false);
    }
  }, [results.length, query, activeMode]);

  const results = useMemo(() => {
    // Keep a stable source key so React list keys are always unique.
    const staticBhajans = bhajans.map((b) => ({
      ...b,
      source: 'static' as const,
      sourceKey: String(b.id),
    }));

    const uploadedBhajans = userBhajans.map((ub, index) => ({
      id: bhajans.length + index + 1,
      slug: generateBhajanSlug(ub.title),
      title: ub.title,
      titleHindi: ub.title_hindi,
      deityId: ub.deity_id,
      singerName: ub.singer_name,
      composerName: ub.composer_name || '',
      youtubeUrl: ub.youtube_url || '',
      lyricsHindi: ub.lyrics_hindi,
      lyricsTransliteration: '',
      playCount: 0,
      rating: 0,
      tags: [],
      featured: false,
      source: 'user' as const,
      sourceKey: ub.id,
    }));

    const combinedBhajans = [...staticBhajans, ...uploadedBhajans];

    let filtered = combinedBhajans;

    if (selectedDeity) {
      filtered = filtered.filter(b => {
        // Find the deity by matching slug
        const matchingDeity = allDeities.find(d => {
          if (d.isCustom) {
            // For custom deities, use name-based slug
            const deitySlug = d.name.toLowerCase().replace(/\s+/g, '-');
            return deitySlug === selectedDeity;
          } else {
            // For preset deities, use the slug from static data
            const presetDeity = deities.find(pd => pd.id === d.id);
            return presetDeity?.slug === selectedDeity;
          }
        });

        // Check if bhajan matches the selected deity ID
        if (matchingDeity && matchingDeity.id) {
          return b.deityId === matchingDeity.id;
        }
        return false;
      });
    }

    if (query.trim()) {
      filtered = smartSearchBhajans(query, filtered);
    }

    return filtered;
  }, [query, selectedDeity, userBhajans, allDeities]);

  const handleDeityFilter = (slug: string) => {
    setSelectedDeity(slug === selectedDeity ? "" : slug);
  };

  const handleSelectSong = async (song: SongSuggestion) => {
    setSelectedSong(song);
    setGlobalLyrics('');
    setGlobalLyricsSource('');
    setGlobalError('');
    setGlobalLyricsLoading(true);

    try {
      const result: LyricsResult = await fetchGlobalLyricsWithSource(song.title, song.artist);
      setGlobalLyrics(result.lyrics);
      setGlobalLyricsSource(result.source);
    } catch (error: any) {
      setGlobalError(error.message || 'Lyrics not available for this selection.');
    } finally {
      setGlobalLyricsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />

      {/* Hero Section */}
      <section className="bg-gradient-warm py-12 px-4">
        <div className="container mx-auto max-w-5xl text-center">
          <motion.h1
            className="font-display text-4xl md:text-5xl font-bold text-foreground mb-4"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            All Bhajans
          </motion.h1>
          <motion.p
            className="text-lg text-muted-foreground max-w-2xl mx-auto mb-8"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.1 }}
          >
            Browse our collection of sacred songs, stotrams, and mantras. Find the lyrics and meaning for your daily devotion.
          </motion.p>
        </div>
      </section>

      {/* Search and Filter Section */}
      <section className="py-12 px-4">
        <div className="container mx-auto max-w-5xl">
          <motion.div
            className="flex flex-wrap items-center gap-3 mb-8"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.18 }}
          >
            <button
              onClick={() => setActiveMode('bhajans')}
              className={`inline-flex items-center gap-2 px-4 py-2 rounded-full border transition-all ${
                activeMode === 'bhajans'
                  ? 'bg-primary text-primary-foreground border-primary'
                  : 'bg-card text-foreground border-border hover:border-primary'
              }`}
            >
              <BookText className="w-4 h-4" /> Bhajans In App
            </button>
            <button
              onClick={() => setActiveMode('global')}
              className={`inline-flex items-center gap-2 px-4 py-2 rounded-full border transition-all ${
                activeMode === 'global'
                  ? 'bg-primary text-primary-foreground border-primary'
                  : 'bg-card text-foreground border-border hover:border-primary'
              }`}
            >
              <Globe2 className="w-4 h-4" /> Global Song Lyrics
            </button>
            <button
              onClick={() => setActiveMode('youtube')}
              className={`inline-flex items-center gap-2 px-4 py-2 rounded-full border transition-all ${
                activeMode === 'youtube'
                  ? 'bg-primary text-primary-foreground border-primary'
                  : 'bg-card text-foreground border-border hover:border-primary'
              }`}
            >
              <Youtube className="w-4 h-4" /> YouTube Discovery
            </button>
          </motion.div>

          {/* Search Bar */}
          <motion.div
            className="relative mb-10"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <SearchIcon className="absolute left-5 top-1/2 -translate-y-1/2 w-6 h-6 text-muted-foreground" />
            <input
              type="text"
              value={activeMode === 'bhajans' ? query : activeMode === 'global' ? globalQuery : youtubeQuery}
              onChange={(e) => {
                if (activeMode === 'bhajans') {
                  setQuery(e.target.value);
                } else if (activeMode === 'global') {
                  setGlobalQuery(e.target.value);
                } else {
                  setYoutubeQuery(e.target.value);
                }
              }}
              placeholder={
                activeMode === 'bhajans'
                  ? 'Search by title or tags...'
                  : activeMode === 'global'
                    ? 'Search any song in the world (title, artist)...'
                    : 'Search bhajans and songs on YouTube...'
              }
              className="w-full pl-14 pr-6 py-4 rounded-2xl bg-card text-foreground text-lg border border-border shadow-temple focus:outline-none focus:ring-2 focus:ring-primary/50 touch-target"
              autoFocus
            />
          </motion.div>

          {activeMode === 'bhajans' ? (
            <>
              {/* Deity Filter */}
              <motion.div
                className="mb-12"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
              >
                <div className="flex items-center gap-3 mb-6">
                  <span className="text-primary font-semibold text-lg">⚡ FILTER BY DEITY</span>
                </div>
                <div className="flex flex-wrap gap-3">
                  <button
                    onClick={() => setSelectedDeity("")}
                    className={`px-6 py-2 rounded-full font-medium transition-all touch-target ${
                      !selectedDeity
                        ? "bg-primary text-primary-foreground shadow-lg"
                        : "bg-card text-foreground border border-border hover:border-primary"
                    }`}
                  >
                    All
                  </button>
                  {allDeities.map((deity) => {
                    const deitySlug = deity.isCustom
                      ? deity.name.toLowerCase().replace(/\s+/g, '-')
                      : (deities.find(d => d.id === deity.id)?.slug || deity.name.toLowerCase());

                    return (
                      <button
                        key={`${deity.isCustom ? 'custom' : 'preset'}-${deity.id}`}
                        onClick={() => handleDeityFilter(deitySlug)}
                        className={`px-6 py-2 rounded-full font-medium transition-all touch-target ${
                          selectedDeity === deitySlug
                            ? "bg-primary text-primary-foreground shadow-lg"
                            : "bg-card text-foreground border border-border hover:border-primary"
                        }`}
                      >
                        {deity.name}
                      </button>
                    );
                  })}
                </div>
              </motion.div>

              <motion.div
                className="mb-8"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.4 }}
              >
                <h2 className="font-display text-3xl font-bold text-foreground mb-2">
                  Results
                </h2>
                <p className="text-muted-foreground">
                  <span className="text-primary font-semibold">{results.length} found</span>
                  {query.trim() && (
                    <> for "<span className="text-foreground font-medium">{query}</span>"</>
                  )}
                </p>
              </motion.div>

              {results.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {results.map((bhajan, index) => (
                    <motion.div
                      key={`${bhajan.source}-${bhajan.sourceKey}`}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.4 + index * 0.05 }}
                    >
                      <BhajanCard bhajan={bhajan} />
                    </motion.div>
                  ))}
                </div>
              ) : (
                <motion.div
                  className="space-y-6"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                >
                  {/* No local results message */}
                  <div className="text-center py-12">
                    <p className="text-muted-foreground text-lg hindi-text mb-4">
                      कोई भजन नहीं मिला • No bhajans found
                    </p>
                    <p className="text-muted-foreground mb-8">
                      Try a different search or filter by another deity
                    </p>
                  </div>

                  {/* Fallback lyrics section */}
                  {showFallbackLyrics && (
                    <motion.div
                      className="bg-gradient-warm/5 border border-primary/30 rounded-2xl p-8"
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                    >
                      <div className="flex items-center gap-3 mb-6">
                        <BookText className="w-6 h-6 text-primary" />
                        <h3 className="font-display text-2xl font-semibold text-foreground">
                          Search Results from External Sources
                        </h3>
                      </div>

                      {lyricsFallback.isLoading ? (
                        <div className="flex items-center justify-center py-12 gap-3">
                          <Loader2 className="w-6 h-6 animate-spin text-primary" />
                          <span className="text-muted-foreground">Searching lyrics databases...</span>
                        </div>
                      ) : lyricsFallback.error ? (
                        <div className="bg-destructive/10 border border-destructive/30 rounded-lg p-4 mb-4">
                          <p className="text-sm text-destructive">{lyricsFallback.error}</p>
                        </div>
                      ) : lyricsFallback.result?.lyrics ? (
                        <div className="space-y-4">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="text-sm text-muted-foreground">
                              Source:
                            </span>
                            <span className="px-3 py-1 rounded-full bg-primary/10 text-primary text-sm font-medium">
                              {lyricsFallback.result.source?.toUpperCase() || 'Unknown'}
                            </span>
                            {lyricsFallback.result.confidence && (
                              <span className="text-xs text-muted-foreground">
                                Match: {Math.round(lyricsFallback.result.confidence * 100)}%
                              </span>
                            )}
                            {lyricsFallback.result.cached && (
                              <span className="px-2 py-1 rounded text-xs bg-amber-500/10 text-amber-700 dark:text-amber-400">
                                📦 Cached
                              </span>
                            )}
                          </div>
                          <pre className="whitespace-pre-wrap text-sm leading-relaxed max-h-[400px] overflow-y-auto p-4 rounded-xl bg-muted/50 font-sans">
                            {lyricsFallback.result.lyrics}
                          </pre>
                        </div>
                      ) : (
                        <p className="text-muted-foreground text-center py-8">
                          No lyrics found in external sources. Try a different search or ask the Bhajan Assistant.
                        </p>
                      )}

                      {/* Assistant handoff suggestion */}
                      {lyricsFallback.showAssistantSuggestion && (
                        <motion.div
                          className="mt-6 p-4 bg-primary/5 border border-primary/30 rounded-lg flex items-start gap-3"
                          initial={{ opacity: 0, y: 5 }}
                          animate={{ opacity: 1, y: 0 }}
                        >
                          <MessageSquare className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                          <div className="flex-1">
                            <p className="text-sm font-medium text-foreground mb-2">
                              💡 Can't find what you're looking for?
                            </p>
                            <p className="text-xs text-muted-foreground mb-3">
                              Ask the Bhajan Assistant for personalized recommendations or help finding specific songs.
                            </p>
                            <button
                              onClick={() => {
                                // Set context for assistant
                                if (lyricsFallback.result) {
                                  setAssistantContext({
                                    searchQuery: query,
                                    searchResults: lyricsFallback.result.source
                                      ? [{
                                          title: lyricsFallback.result.title || query,
                                          source: lyricsFallback.result.source,
                                          confidence: lyricsFallback.result.confidence,
                                        }]
                                      : undefined,
                                  });
                                } else {
                                  setAssistantContext({
                                    searchQuery: query,
                                  });
                                }
                                // Open assistant
                                const fab = document.querySelector('[aria-label="Open AI assistant"]');
                                if (fab) (fab as HTMLElement).click();
                              }}
                              className="inline-flex items-center gap-2 text-xs px-3 py-1.5 rounded-full bg-primary text-primary-foreground hover:bg-primary/90 transition-colors"
                            >
                              <MessageSquare className="w-3.5 h-3.5" />
                              Ask Assistant
                            </button>
                          </div>
                        </motion.div>
                      )}
                    </motion.div>
                  )}
                </motion.div>
              )}
            </>
          ) : activeMode === 'global' ? (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <div className="bg-card border border-border rounded-2xl p-5">
                <div className="flex items-center gap-2 mb-4">
                  <Music2 className="w-5 h-5 text-primary" />
                  <h2 className="font-display text-2xl font-semibold">Song Results</h2>
                </div>
                {globalLoading ? (
                  <div className="py-8 flex items-center justify-center">
                    <Loader2 className="w-6 h-6 animate-spin text-primary" />
                  </div>
                ) : globalSuggestions.length > 0 ? (
                  <div className="space-y-2 max-h-[520px] overflow-y-auto pr-1">
                    {globalSuggestions.map((song) => (
                      <button
                        key={song.id}
                        onClick={() => handleSelectSong(song)}
                        className={`w-full text-left p-3 rounded-xl border transition-colors ${
                          selectedSong?.id === song.id
                            ? 'border-primary bg-primary/5'
                            : 'border-border hover:border-primary/60'
                        }`}
                      >
                        <p className="font-semibold text-foreground">{song.title}</p>
                        <p className="text-sm text-muted-foreground">{song.artist}</p>
                        {song.album && (
                          <p className="text-xs text-muted-foreground mt-1">Album: {song.album}</p>
                        )}
                      </button>
                    ))}
                  </div>
                ) : (
                  <p className="text-muted-foreground py-6">
                    Search for any song name to get suggestions.
                  </p>
                )}
              </div>

              <div className="bg-card border border-border rounded-2xl p-5">
                <div className="flex items-center gap-2 mb-4">
                  <BookText className="w-5 h-5 text-primary" />
                  <h2 className="font-display text-2xl font-semibold">Lyrics</h2>
                </div>

                {selectedSong && (
                  <div className="mb-3 space-y-1">
                    <p className="text-sm text-muted-foreground">
                      Showing: <span className="text-foreground font-medium">{selectedSong.title}</span> by {selectedSong.artist}
                    </p>
                    {globalLyricsSource && (
                      <p className="text-xs text-muted-foreground">Source: {globalLyricsSource}</p>
                    )}
                  </div>
                )}

                {globalLyricsLoading ? (
                  <div className="py-10 flex items-center justify-center">
                    <Loader2 className="w-6 h-6 animate-spin text-primary" />
                  </div>
                ) : globalError ? (
                  <p className="text-sm text-destructive bg-destructive/10 rounded-lg p-3">{globalError}</p>
                ) : globalLyrics ? (
                  <pre className="whitespace-pre-wrap text-base leading-relaxed max-h-[520px] overflow-y-auto p-3 rounded-xl bg-muted/50">
                    {globalLyrics}
                  </pre>
                ) : (
                  <p className="text-muted-foreground py-6">
                    Pick a song from the left side to load lyrics.
                  </p>
                )}
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <div className="bg-card border border-border rounded-2xl p-5">
                <div className="flex items-center gap-2 mb-4">
                  <Youtube className="w-5 h-5 text-primary" />
                  <h2 className="font-display text-2xl font-semibold">YouTube Results</h2>
                </div>
                {youtubeLoading ? (
                  <div className="py-8 flex items-center justify-center">
                    <Loader2 className="w-6 h-6 animate-spin text-primary" />
                  </div>
                ) : youtubeError ? (
                  <div className="space-y-3">
                    <p className="text-sm text-destructive bg-destructive/10 rounded-lg p-3">{youtubeError}</p>
                    {youtubeQuery.trim().length >= 2 && (
                      <a
                        href={`https://www.youtube.com/results?search_query=${encodeURIComponent(youtubeQuery.trim())}`}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-2 px-3 py-1.5 text-sm rounded-full border border-border hover:border-primary"
                      >
                        <ExternalLink className="w-4 h-4" /> Open search directly on YouTube
                      </a>
                    )}
                  </div>
                ) : youtubeResults.length > 0 ? (
                  <div className="space-y-3 max-h-[520px] overflow-y-auto pr-1">
                    {youtubeResults.map((video) => (
                      <div
                        key={video.id}
                        className={`p-3 rounded-xl border transition-colors ${
                          selectedVideo?.id === video.id
                            ? 'border-primary bg-primary/5'
                            : 'border-border hover:border-primary/60'
                        }`}
                      >
                        <button
                          onClick={() => setSelectedVideo(video)}
                          className="w-full text-left"
                        >
                          <p className="font-semibold text-foreground line-clamp-2">{video.title}</p>
                          <p className="text-sm text-muted-foreground mt-1">{video.channel}</p>
                          <div className="text-xs text-muted-foreground mt-1 flex gap-3">
                            {video.duration && <span>{video.duration}</span>}
                            {video.viewsText && <span>{video.viewsText}</span>}
                          </div>
                        </button>
                        <div className="mt-3 flex flex-wrap gap-2">
                          <button
                            onClick={() => {
                              setSelectedVideo(video);
                              setIsYouTubePlayerOpen(true);
                            }}
                            className="inline-flex items-center gap-2 px-3 py-1.5 text-sm rounded-full bg-primary text-primary-foreground"
                          >
                            <PlayCircle className="w-4 h-4" /> Play
                          </button>
                          <a
                            href={`https://www.youtube.com/watch?v=${video.id}`}
                            target="_blank"
                            rel="noreferrer"
                            className="inline-flex items-center gap-2 px-3 py-1.5 text-sm rounded-full border border-border hover:border-primary"
                          >
                            <ExternalLink className="w-4 h-4" /> Open on YouTube
                          </a>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="py-6 space-y-3">
                    <p className="text-muted-foreground">
                      Search a bhajan or song name to discover YouTube videos.
                    </p>
                    {youtubeQuery.trim().length >= 2 && (
                      <a
                        href={`https://www.youtube.com/results?search_query=${encodeURIComponent(youtubeQuery.trim())}`}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-2 px-3 py-1.5 text-sm rounded-full border border-border hover:border-primary"
                      >
                        <ExternalLink className="w-4 h-4" /> Open search directly on YouTube
                      </a>
                    )}
                  </div>
                )}
              </div>

              <div className="bg-card border border-border rounded-2xl p-5">
                <div className="flex items-center gap-2 mb-4">
                  <Music2 className="w-5 h-5 text-primary" />
                  <h2 className="font-display text-2xl font-semibold">Playback Info</h2>
                </div>

                <div className="text-sm text-muted-foreground space-y-2">
                  <p>
                    Local uploaded audio is ad-free.
                  </p>
                  <p>
                    YouTube videos may include ads controlled by YouTube.
                  </p>
                </div>

                {selectedVideo ? (
                  <div className="mt-6 space-y-3">
                    <p className="font-semibold text-foreground">{selectedVideo.title}</p>
                    <p className="text-sm text-muted-foreground">{selectedVideo.channel}</p>
                    <button
                      onClick={() => setIsYouTubePlayerOpen(true)}
                      className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary text-primary-foreground"
                    >
                      <PlayCircle className="w-4 h-4" /> Play Selected Video
                    </button>
                  </div>
                ) : (
                  <p className="text-muted-foreground py-6">
                    Choose any result from the left to play here.
                  </p>
                )}
              </div>
            </div>
          )}

          <Dialog open={isYouTubePlayerOpen} onOpenChange={setIsYouTubePlayerOpen}>
            <DialogContent className="sm:max-w-3xl">
              <DialogHeader>
                <DialogTitle className="font-display text-xl">
                  {selectedVideo?.title || 'YouTube Playback'}
                </DialogTitle>
              </DialogHeader>
              <div className="aspect-video w-full overflow-hidden rounded-lg border border-border">
                {selectedVideo ? (
                  <iframe
                    src={buildYouTubeEmbedUrl(selectedVideo.id)}
                    title={`YouTube player for ${selectedVideo.title}`}
                    className="h-full w-full"
                    allow="autoplay; encrypted-media; picture-in-picture"
                    allowFullScreen
                  />
                ) : null}
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </section>

      <Footer />
    </div>
  );
}
