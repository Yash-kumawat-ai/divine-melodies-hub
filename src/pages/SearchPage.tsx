import { useSearchParams, Link } from "react-router-dom";
import { Search as SearchIcon, Music2, Globe2, BookText, Loader2 } from "lucide-react";
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
import { fetchGlobalLyricsWithSource, LyricsResult, searchGlobalSongs, SongSuggestion } from "@/lib/globalLyrics";

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
  const [activeMode, setActiveMode] = useState<'bhajans' | 'global'>('bhajans');
  const [selectedDeity, setSelectedDeity] = useState(initialDeity);
  const [userBhajans, setUserBhajans] = useState<UserBhajan[]>([]);
  const [loadingUserBhajans, setLoadingUserBhajans] = useState(true);
  const { deities: allDeities, loading: deitiesLoading } = useDeities();

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
              value={activeMode === 'bhajans' ? query : globalQuery}
              onChange={(e) => {
                if (activeMode === 'bhajans') {
                  setQuery(e.target.value);
                } else {
                  setGlobalQuery(e.target.value);
                }
              }}
              placeholder={
                activeMode === 'bhajans'
                  ? 'Search by title or tags...'
                  : 'Search any song in the world (title, artist)...'
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
                  className="text-center py-16"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                >
                  <p className="text-muted-foreground text-lg hindi-text mb-4">
                    कोई भजन नहीं मिला • No bhajans found
                  </p>
                  <p className="text-muted-foreground">
                    Try a different search or filter by another deity
                  </p>
                </motion.div>
              )}
            </>
          ) : (
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
          )}
        </div>
      </section>

      <Footer />
    </div>
  );
}
