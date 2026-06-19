import { motion } from "framer-motion";
import { useState, useEffect } from "react";
import SearchBar from "@/components/SearchBar";
import DeityGrid from "@/components/DeityGrid";
import BhajanCard from "@/components/BhajanCard";
import { getFeaturedBhajans } from "@/data/bhajans";
import { generateBhajanSlug } from "@/lib/slugUtils";
import { supabase } from "@/integrations/supabase/client";
import { Loader2 } from "lucide-react";
import { useLanguage } from "@/hooks/useLanguage";

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

const Index = () => {
  const { t, language } = useLanguage();
  const featured = getFeaturedBhajans();
  const [userBhajans, setUserBhajans] = useState<UserBhajan[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUserBhajans = async () => {
      try {
        const { data, error } = await supabase
          .from('user_uploads')
          .select('*')
          .eq('status', 'approved')
          .order('created_at', { ascending: false })
          .limit(6);

        if (error) throw error;
        if (data) setUserBhajans(data as UserBhajan[]);
      } catch (err) {
        console.error('Error fetching user bhajans:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchUserBhajans();
  }, []);

  return (
    <div className="min-h-screen bg-background">

      {/* Hero */}
      <section className="relative overflow-hidden bg-gradient-warm py-20 md:py-28 px-4">
        <div className="container mx-auto max-w-4xl text-center relative z-10">
          <motion.h1
            className="font-display text-4xl md:text-5xl font-bold text-foreground mb-3"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <span className="text-gradient-saffron">{t('bhajansSandhya')}</span>
          </motion.h1>
          {language !== 'hi' && (
          <motion.p
            className="hindi-text text-2xl md:text-3xl text-foreground/80 mb-2"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.15 }}
          >
            राघवम्
          </motion.p>
          )}
          <motion.p
            className="text-lg text-muted-foreground mb-10 max-w-xl mx-auto"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.25 }}
          >
            {t('completeDevotionalMusic')}
          </motion.p>
          <SearchBar />
        </div>
      </section>

      {/* Deity Grid */}
      <DeityGrid />


      {/* Featured Bhajans */}
      <section className="py-16 px-4 bg-card/50">
        <div className="container mx-auto max-w-6xl">
          <h2 className="font-display text-3xl md:text-4xl font-bold text-center mb-3 text-foreground">
            {t('featuredBhajans')}
          </h2>
          <p className="text-center text-muted-foreground text-lg mb-10 hindi-text">
            {t('popularBhajans')}
          </p>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
            {featured.map((bhajan) => (
              <BhajanCard key={bhajan.id} bhajan={bhajan} />
            ))}
          </div>
        </div>
      </section>

      {/* Community Bhajans */}
      {!loading && userBhajans.length > 0 && (
        <section className="py-16 px-4 bg-background">
          <div className="container mx-auto max-w-6xl">
            <h2 className="font-display text-3xl md:text-4xl font-bold text-center mb-3 text-foreground">
              {t('communityBhajans')}
            </h2>
            <p className="text-center text-muted-foreground text-lg mb-10 hindi-text">
              {t('sharedByOurCommunity')}
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {userBhajans.map((bhajan) => {
                const convertedBhajan = {
                  id: parseInt(bhajan.id),
                  slug: generateBhajanSlug(bhajan.title),
                  title: bhajan.title,
                  titleHindi: bhajan.title_hindi,
                  deityId: bhajan.deity_id,
                  singerName: bhajan.singer_name,
                  composerName: bhajan.composer_name || '',
                  lyricsHindi: bhajan.lyrics_hindi,
                  lyricsTransliteration: '',
                  youtubeUrl: bhajan.youtube_url || '',
                  playCount: 0,
                  rating: 0,
                  tags: [],
                  featured: false,
                };

                return (
                  <BhajanCard key={bhajan.id} bhajan={convertedBhajan} />
                );
              })}
            </div>
          </div>
        </section>
      )}

    </div>
  );
};

export default Index;
