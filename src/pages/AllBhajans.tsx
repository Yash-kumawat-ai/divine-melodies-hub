import React, { useState, useEffect, useMemo } from 'react';
import { motion } from 'framer-motion';
import { Search, Filter, X } from 'lucide-react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import BhajanCard from '@/components/BhajanCard';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Loader2 } from 'lucide-react';
import { queryUserUploads } from '@/lib/supabaseQueries';
import { generateBhajanSlug } from '@/lib/slugUtils';

interface UserBhajan {
  id: string;
  title: string;
  title_hindi: string;
  deity_id: number;
  singer_name: string;
  composer_name?: string;
  lyrics_hindi: string;
  language: string;
  occasion: string[];
  mood_tags: string[];
  average_rating: number;
  play_count: number;
  youtube_url?: string;
}

interface FilterState {
  language: string;
  occasion: string;
  mood: string;
  minRating: string;
  sortBy: string;
  search: string;
}

const LANGUAGES = ['All', 'Hindi', 'Sanskrit', 'English', 'Transliteration'];
const OCCASIONS = ['All', 'Morning', 'Evening', 'Meditation', 'Worship', 'Festival'];
const MOODS = ['All', 'Peaceful', 'Energizing', 'Devotional', 'Celebratory', 'Meditative'];
const SORT_OPTIONS = [
  { value: 'latest', label: 'Latest' },
  { value: 'most-played', label: 'Most Played' },
  { value: 'highest-rated', label: 'Highest Rated' },
];

export const AllBhajans = () => {
  const [bhajans, setBhajans] = useState<UserBhajan[]>([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState<FilterState>({
    language: 'All',
    occasion: 'All',
    mood: 'All',
    minRating: '0',
    sortBy: 'latest',
    search: '',
  });

  useEffect(() => {
    fetchBhajans();
  }, []);

  const fetchBhajans = async () => {
    try {
      setLoading(true);
      const { data, error } = await queryUserUploads({ orderBy: 'created_at' });

      if (error) throw error;
      setBhajans((data || []) as UserBhajan[]);
    } catch (err) {
      console.error('Error fetching bhajans:', err);
    } finally {
      setLoading(false);
    }
  };

  // Apply filters and search
  const filteredBhajans = useMemo(() => {
    let results = [...bhajans];

    // Search filter
    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      results = results.filter(
        (b) =>
          b.title.toLowerCase().includes(searchLower) ||
          b.singer_name.toLowerCase().includes(searchLower) ||
          b.title_hindi.includes(filters.search)
      );
    }

    // Language filter
    if (filters.language !== 'All') {
      results = results.filter((b) => b.language === filters.language);
    }

    // Occasion filter
    if (filters.occasion !== 'All') {
      results = results.filter((b) =>
        b.occasion?.includes(filters.occasion)
      );
    }

    // Mood filter
    if (filters.mood !== 'All') {
      results = results.filter((b) =>
        b.mood_tags?.includes(filters.mood)
      );
    }

    // Rating filter
    const minRating = parseFloat(filters.minRating);
    if (minRating > 0) {
      results = results.filter((b) => b.average_rating >= minRating);
    }

    // Sort
    switch (filters.sortBy) {
      case 'most-played':
        results.sort((a, b) => (b.play_count || 0) - (a.play_count || 0));
        break;
      case 'highest-rated':
        results.sort((a, b) => (b.average_rating || 0) - (a.average_rating || 0));
        break;
      case 'latest':
      default:
        // Already sorted by creation date from fetch
        break;
    }

    return results;
  }, [bhajans, filters]);

  const handleFilterChange = (key: keyof FilterState, value: string) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
  };

  const resetFilters = () => {
    setFilters({
      language: 'All',
      occasion: 'All',
      mood: 'All',
      minRating: '0',
      sortBy: 'latest',
      search: '',
    });
  };

  const isFiltered = Object.values(filters).some(
    (f) => f !== 'All' && f !== '0' && f !== 'latest' && f !== ''
  );

  return (
    <div className="min-h-screen bg-background">
      <Header />

      {/* Hero Section */}
      <section className="py-12 px-4 bg-gradient-warm">
        <div className="container mx-auto max-w-6xl">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center"
          >
            <h1 className="font-display text-4xl md:text-5xl font-bold text-foreground mb-3">
              Browse All <span className="text-gradient-saffron">Bhajans</span>
            </h1>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Explore our complete collection of devotional music — filtered by language,
              occasion, mood, and more
            </p>
          </motion.div>
        </div>
      </section>

      {/* Filters Section */}
      <section className="sticky top-16 z-40 bg-background/95 backdrop-blur border-b border-border py-4 px-4">
        <div className="container mx-auto max-w-6xl space-y-4">
          {/* Search Bar */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search bhajans or singers..."
              value={filters.search}
              onChange={(e) => handleFilterChange('search', e.target.value)}
              className="pl-10"
            />
          </div>

          {/* Filter Controls */}
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
            <Select value={filters.language} onValueChange={(v) => handleFilterChange('language', v)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {LANGUAGES.map((lang) => (
                  <SelectItem key={lang} value={lang}>
                    {lang}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={filters.occasion} onValueChange={(v) => handleFilterChange('occasion', v)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {OCCASIONS.map((occ) => (
                  <SelectItem key={occ} value={occ}>
                    {occ}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={filters.mood} onValueChange={(v) => handleFilterChange('mood', v)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {MOODS.map((mood) => (
                  <SelectItem key={mood} value={mood}>
                    {mood}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={filters.sortBy} onValueChange={(v) => handleFilterChange('sortBy', v)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {SORT_OPTIONS.map((opt) => (
                  <SelectItem key={opt.value} value={opt.value}>
                    {opt.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={filters.minRating} onValueChange={(v) => handleFilterChange('minRating', v)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="0">All Ratings</SelectItem>
                <SelectItem value="3">3+ Stars</SelectItem>
                <SelectItem value="4">4+ Stars</SelectItem>
                <SelectItem value="5">5 Stars</SelectItem>
              </SelectContent>
            </Select>

            {isFiltered && (
              <Button
                variant="outline"
                size="sm"
                onClick={resetFilters}
                className="gap-2"
              >
                <X className="w-4 h-4" />
                Clear
              </Button>
            )}
          </div>

          {/* Results Count */}
          <div className="text-sm text-muted-foreground">
            Showing {filteredBhajans.length} of {bhajans.length} bhajans
          </div>
        </div>
      </section>

      {/* Results Section */}
      <section className="py-12 px-4">
        <div className="container mx-auto max-w-6xl">
          {loading ? (
            <div className="flex justify-center items-center py-20">
              <Loader2 className="w-8 h-8 animate-spin text-saffron-600" />
            </div>
          ) : filteredBhajans.length === 0 ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center py-20"
            >
              <Filter className="w-12 h-12 text-muted-foreground mx-auto mb-4 opacity-50" />
              <h3 className="text-lg font-semibold mb-2">No bhajans found</h3>
              <p className="text-muted-foreground">
                Try adjusting your filters or search terms
              </p>
            </motion.div>
          ) : (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6"
            >
              {filteredBhajans.map((bhajan) => (
                <BhajanCard
                  key={bhajan.id}
                  bhajan={{
                    id: parseInt(bhajan.id),
                    slug: generateBhajanSlug(bhajan.title),
                    title: bhajan.title,
                    titleHindi: bhajan.title_hindi,
                    deityId: bhajan.deity_id,
                    singerName: bhajan.singer_name,
                    composerName: bhajan.composer_name || '',
                    youtubeUrl: bhajan.youtube_url || '',
                    lyricsHindi: bhajan.lyrics_hindi,
                    lyricsTransliteration: '',
                    playCount: bhajan.play_count || 0,
                    rating: bhajan.average_rating || 0,
                    tags: bhajan.mood_tags || [],
                    featured: false,
                  }}
                />
              ))}
            </motion.div>
          )}
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default AllBhajans;
