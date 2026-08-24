import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { TrendingUp, BarChart3 } from 'lucide-react';
import BhajanCard from '@/components/BhajanCard';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { supabase } from '@/integrations/supabase/client';
import { Loader2 } from 'lucide-react';
import { getTrendingBhajans, queryUserUploads } from '@/lib/supabaseQueries';
import { mapUserUploadToBhajan } from '@/lib/mapUserUpload';

interface UserBhajan {
  id: string;
  title: string;
  title_hindi: string;
  slug?: string;
  deity_id: number;
  singer_name: string;
  composer_name?: string;
  lyrics_hindi: string;
  play_count: number;
  average_rating: number;
  created_at: string;
  youtube_url?: string;
  search_aliases?: string[] | string;
  content_type?: string;
}

const PERIOD_OPTIONS = [
  { value: 'hourly', label: 'Last Hour', hours: 1 },
  { value: 'daily', label: 'Last 24 Hours', hours: 24 },
  { value: 'weekly', label: 'Last 7 Days', hours: 168 },
  { value: 'all-time', label: 'All Time', hours: Infinity },
];

export const TrendingPage = () => {
  const navigate = useNavigate();
  const [bhajans, setBhajans] = useState<UserBhajan[]>([]);
  const [loading, setLoading] = useState(true);
  const [activePeriod, setActivePeriod] = useState('daily');

  useEffect(() => {
    fetchTrendingBhajans();
  }, [activePeriod]);

  const fetchTrendingBhajans = async () => {
    try {
      setLoading(true);

      const query = getTrendingBhajans(activePeriod);
      const { data, error } = await query;

      if (error) throw error;
      setBhajans((data || []) as UserBhajan[]);
    } catch (err) {
      console.error('Error fetching trending bhajans:', err);
    } finally {
      setLoading(false);
    }
  };

  const renderBhajanList = (bhajans: UserBhajan[]) => {
    if (bhajans.length === 0) {
      return (
        <div className="text-center py-12">
          <TrendingUp className="w-12 h-12 text-muted-foreground mx-auto mb-4 opacity-50" />
          <p className="text-muted-foreground">No trending bhajans for this period</p>
        </div>
      );
    }

    return (
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
        {bhajans.map((bhajan, index) => (
          <motion.div
            key={bhajan.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
            className="relative"
          >
            {/* Rank Badge */}
            <div className="absolute top-2 left-2 z-10 bg-gradient-to-br from-saffron-600 to-orange-600 text-white rounded-full w-12 h-12 flex items-center justify-center font-bold text-lg shadow-lg">
              {index + 1}
            </div>

            <BhajanCard
              bhajan={mapUserUploadToBhajan(bhajan)}
              onCardClick={(b) => navigate(`/bhajan/${b.slug}`)}
            />

            {/* Stats */}
            <div className="mt-3 p-2 bg-card rounded border border-border text-center">
              <p className="text-xs text-muted-foreground">
                {bhajan.play_count?.toLocaleString() || 0} plays
              </p>
              {bhajan.average_rating > 0 && (
                <p className="text-xs text-yellow-600">
                  ⭐ {bhajan.average_rating.toFixed(1)}/5
                </p>
              )}
            </div>
          </motion.div>
        ))}
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-background">

      {/* Hero Section */}
      <section className="py-12 px-4 bg-gradient-warm">
        <div className="container mx-auto max-w-6xl">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center"
          >
            <div className="flex items-center justify-center gap-3 mb-4">
              <TrendingUp className="w-8 h-8 text-saffron-600" />
              <BarChart3 className="w-8 h-8 text-orange-600" />
            </div>
            <h1 className="font-display text-4xl md:text-5xl font-bold text-foreground mb-3">
              Trending <span className="text-gradient-saffron">Bhajans</span>
            </h1>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Discover the most popular devotional music right now
            </p>
          </motion.div>
        </div>
      </section>

      {/* Charts Section */}
      <section className="py-12 px-4">
        <div className="container mx-auto max-w-6xl">
          <Tabs value={activePeriod} onValueChange={setActivePeriod} className="w-full">
            <TabsList className="grid w-full grid-cols-2 md:grid-cols-4 mb-8">
              {PERIOD_OPTIONS.map((option) => (
                <TabsTrigger key={option.value} value={option.value}>
                  {option.label}
                </TabsTrigger>
              ))}
            </TabsList>

            {PERIOD_OPTIONS.map((option) => (
              <TabsContent key={option.value} value={option.value} className="space-y-6">
                {loading ? (
                  <div className="flex justify-center items-center py-20">
                    <Loader2 className="w-8 h-8 animate-spin text-saffron-600" />
                  </div>
                ) : (
                  renderBhajanList(bhajans)
                )}
              </TabsContent>
            ))}
          </Tabs>
        </div>
      </section>

    </div>
  );
};

export default TrendingPage;
