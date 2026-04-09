import { useParams, Link } from "react-router-dom";
import { ArrowLeft, Play, Star, Share2 } from "lucide-react";
import { motion } from "framer-motion";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { bhajans, getDeityById } from "@/data/bhajans";
import { generateBhajanSlug } from "@/lib/slugUtils";
import { supabase } from "@/integrations/supabase/client";
import { useState, useEffect } from "react";
import { Loader2 } from "lucide-react";

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

export default function BhajanPage() {
  const { slug } = useParams<{ slug: string }>();
  const [userBhajan, setUserBhajan] = useState<UserBhajan | null>(null);
  const [loadingUser, setLoadingUser] = useState(true);
  const [showTransliteration, setShowTransliteration] = useState(false);

  const staticBhajan = bhajans.find((b) => b.slug === slug);

  // Fetch user bhajans to find matching slug
  useEffect(() => {
    const fetchUserBhajan = async () => {
      try {
        const { data, error } = await supabase
          .from('user_uploads')
          .select('*')
          .eq('status', 'approved')
          .order('created_at', { ascending: false });

        if (!error && data) {
          // Find matching bhajan by slug
          const matched = data.find(
            (b: UserBhajan) => generateBhajanSlug(b.title) === slug
          );
          setUserBhajan(matched || null);
        }
      } catch (err) {
        console.error('Error fetching user bhajan:', err);
      } finally {
        setLoadingUser(false);
      }
    };

    // Only fetch if not found in static bhajans
    if (!staticBhajan) {
      fetchUserBhajan();
    } else {
      setLoadingUser(false);
    }
  }, [slug, staticBhajan]);

  const bhajan = staticBhajan || userBhajan;

  if (loadingUser) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!bhajan) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="container mx-auto max-w-4xl px-4 py-20 text-center">
          <p className="text-2xl text-muted-foreground">Bhajan not found</p>
          <Link to="/" className="text-primary underline mt-4 inline-block">Go Home</Link>
        </div>
      </div>
    );
  }

  const deity = staticBhajan 
    ? getDeityById(staticBhajan.deityId)
    : getDeityById((bhajan as UserBhajan).deity_id);

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({ title: bhajan.title, url: window.location.href });
    } else {
      navigator.clipboard.writeText(window.location.href);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <section className="py-12 px-4">
        <div className="container mx-auto max-w-3xl">
          <Link to={deity ? `/deity/${deity.slug}` : "/"} className="inline-flex items-center gap-2 text-muted-foreground hover:text-primary transition-colors mb-8 touch-target">
            <ArrowLeft className="w-5 h-5" /> Back
          </Link>

          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
            {/* Header */}
            <div className={`h-2 rounded-t-xl ${deity?.colorClass ?? 'bg-primary'}`} />
            <div className="bg-card rounded-b-xl shadow-temple p-6 md:p-10 mb-8">
              <div className="flex items-center gap-2 mb-3">
                <span className="text-xl">{deity?.emoji}</span>
                <Link to={deity ? `/deity/${deity.slug}` : "/"} className="text-sm font-medium text-muted-foreground hover:text-primary">
                  {deity?.name}
                </Link>
              </div>
              <h1 className="font-display text-3xl md:text-4xl font-bold text-foreground">{bhajan.title}</h1>
              <p className="hindi-text text-2xl text-muted-foreground mt-1">{staticBhajan ? bhajan.titleHindi : (bhajan as UserBhajan).title_hindi}</p>
              <p className="text-muted-foreground mt-3">by {staticBhajan ? bhajan.singerName : (bhajan as UserBhajan).singer_name}</p>
              <div className="flex items-center gap-4 mt-4 text-sm text-muted-foreground">
                {staticBhajan && (
                  <>
                    <span className="flex items-center gap-1"><Play className="w-4 h-4" /> {(bhajan.playCount / 1000).toFixed(0)}K plays</span>
                    <span className="flex items-center gap-1"><Star className="w-4 h-4 fill-secondary text-secondary" /> {bhajan.rating.toFixed(1)}</span>
                  </>
                )}
                <button onClick={handleShare} className="flex items-center gap-1 hover:text-primary transition-colors touch-target">
                  <Share2 className="w-4 h-4" /> Share
                </button>
              </div>

              {/* Tags */}
              {staticBhajan && bhajan.tags && (
                <div className="flex flex-wrap gap-2 mt-4">
                  {bhajan.tags.map((tag) => (
                    <span key={tag} className="px-3 py-1 rounded-full bg-muted text-sm text-muted-foreground capitalize">
                      {tag}
                    </span>
                  ))}
                </div>
              )}
            </div>

            {/* Lyrics Toggle */}
            {staticBhajan && (
              <div className="flex gap-2 mb-6">
                <button
                  onClick={() => setShowTransliteration(false)}
                  className={`px-5 py-3 rounded-xl text-base font-medium transition-colors touch-target ${
                    !showTransliteration ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground hover:bg-muted/80'
                  }`}
                >
                  हिन्दी Lyrics
                </button>
                <button
                  onClick={() => setShowTransliteration(true)}
                  className={`px-5 py-3 rounded-xl text-base font-medium transition-colors touch-target ${
                    showTransliteration ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground hover:bg-muted/80'
                  }`}
                >
                  Transliteration
                </button>
              </div>
            )}

            {/* Lyrics */}
            <div className="bg-card rounded-xl shadow-temple p-6 md:p-10">
              <pre className={`whitespace-pre-wrap leading-relaxed text-xl ${
                !showTransliteration && staticBhajan ? 'hindi-text text-foreground' : 'font-body text-foreground'
              }`}>
                {staticBhajan 
                  ? (showTransliteration ? bhajan.lyricsTransliteration : bhajan.lyricsHindi)
                  : (bhajan as UserBhajan).lyrics_hindi
                }
              </pre>
            </div>
          </motion.div>
        </div>
      </section>
      <Footer />
    </div>
  );
}
