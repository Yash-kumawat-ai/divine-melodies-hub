import { useParams, Link } from "react-router-dom";
import { Loader2, Play, Star, Share2 } from "lucide-react";
import { motion } from "framer-motion";
import { bhajans, getDeityById } from "@/data/bhajans";
import { generateBhajanSlug, formatBhajanDisplayTitle } from "@/lib/slugUtils";
import { resolveBhajanYouTubePlayback } from "@/lib/youtubeEmbedPopup";
import { useYouTubePlayer } from "@/hooks/useYouTubePlayer";
import { supabase } from "@/integrations/supabase/client";
import { useState, useEffect } from "react";
import { toast } from "sonner";

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
  const [playOpening, setPlayOpening] = useState(false);
  const { openPlayer } = useYouTubePlayer();

  const staticBhajan = bhajans.find((b) => b.slug === slug);

  useEffect(() => {
    const fetchUserBhajan = async () => {
      try {
        const { data, error } = await supabase
          .from('user_uploads')
          .select('*')
          .eq('status', 'approved')
          .order('created_at', { ascending: false });

        if (!error && data) {
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
      <div>
        <div className="container mx-auto max-w-4xl px-4 py-20 text-center">
          <p className="text-2xl text-muted-foreground">Bhajan not found</p>
          <Link to="/" className="text-primary underline mt-4 inline-block">Go Home</Link>
        </div>
      </div>
    );
  }

  const isStatic = Boolean(staticBhajan);
  const userBhajanData = !isStatic ? (bhajan as UserBhajan) : null;
  const deity = isStatic
    ? getDeityById(staticBhajan!.deityId)
    : getDeityById(userBhajanData?.deity_id || 0);

  const display = {
    title: bhajan.title,
    titleHindi: isStatic ? staticBhajan!.titleHindi : (userBhajanData?.title_hindi || bhajan.title),
    singerName: isStatic ? staticBhajan!.singerName : (userBhajanData?.singer_name || "Unknown"),
    composerName: isStatic ? (staticBhajan!.composerName || "") : (userBhajanData?.composer_name || ""),
    youtubeUrl: isStatic ? staticBhajan!.youtubeUrl : userBhajanData?.youtube_url,
    lyricsHindi: isStatic ? staticBhajan!.lyricsHindi : (userBhajanData?.lyrics_hindi || ""),
    lyricsTransliteration: isStatic ? staticBhajan!.lyricsTransliteration : "",
    imageUrl: isStatic ? staticBhajan!.imageUrl : userBhajanData?.image_url,
    playCount: isStatic ? staticBhajan!.playCount : 0,
    rating: isStatic ? staticBhajan!.rating : 0,
    tags: isStatic ? staticBhajan!.tags : [],
  };

  const lyricsText = display.lyricsHindi;
  const hasUploadedImage = Boolean(display.imageUrl);
  const hasOnlyUrlInLyrics = /^https?:\/\//i.test((lyricsText || '').trim());
  const canShowTransliteration = display.lyricsTransliteration.trim().length > 0;

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({ title: bhajan.title, url: window.location.href });
    } else {
      navigator.clipboard.writeText(window.location.href);
    }
  };

  const handlePlay = async () => {
    if (playOpening) return;
    setPlayOpening(true);
    try {
      const playback = await resolveBhajanYouTubePlayback({
        videoEmbedId: staticBhajan?.videoEmbedId,
        youtubeUrl: display.youtubeUrl,
        title: display.title,
        singerName: display.singerName,
      });

      if (playback) {
        openPlayer(playback);
        return;
      }

      toast.error("Could not load the video. Please try again.");
    } finally {
      setPlayOpening(false);
    }
  };

  return (
    <div>
      <section className="py-12 px-4">
        <div className="container mx-auto max-w-3xl">
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
            <div className={`h-2 rounded-t-xl ${deity?.colorClass ?? 'bg-primary'}`} />
            <div className="bg-card rounded-b-xl shadow-temple p-6 md:p-10 mb-8">
              <div className="flex items-center gap-2 mb-3">
                <span className="text-xl">{deity?.emoji}</span>
                <Link to={deity ? `/deity/${deity.slug}` : "/"} className="text-sm font-medium text-muted-foreground hover:text-primary">
                  {deity?.name}
                </Link>
              </div>
              <h1 className="font-display text-2xl sm:text-3xl md:text-4xl font-bold text-foreground break-words [overflow-wrap:anywhere]">{formatBhajanDisplayTitle(display.title)}</h1>
              <p className="hindi-text text-xl sm:text-2xl text-muted-foreground mt-1 break-words [overflow-wrap:anywhere]">{formatBhajanDisplayTitle(display.titleHindi)}</p>
              <p className="text-muted-foreground mt-3 break-words">by {display.singerName}</p>
              <div className="flex items-center gap-4 mt-4 text-sm text-muted-foreground">
                {display.playCount > 0 && (
                  <>
                    <span className="flex items-center gap-1"><Play className="w-4 h-4" /> {(display.playCount / 1000).toFixed(0)}K plays</span>
                    <span className="flex items-center gap-1"><Star className="w-4 h-4 fill-secondary text-secondary" /> {display.rating.toFixed(1)}</span>
                  </>
                )}
                <button
                  type="button"
                  onClick={handlePlay}
                  disabled={playOpening}
                  className="flex items-center gap-1 hover:text-primary transition-colors touch-target disabled:opacity-60"
                >
                  {playOpening ? <Loader2 className="w-4 h-4 animate-spin" /> : <Play className="w-4 h-4" />}
                  Play
                </button>
                <button onClick={handleShare} className="flex items-center gap-1 hover:text-primary transition-colors touch-target">
                  <Share2 className="w-4 h-4" /> Share
                </button>
              </div>

              {display.tags.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-4">
                  {display.tags.map((tag) => (
                    <span key={tag} className="px-3 py-1 rounded-full bg-muted text-sm text-muted-foreground capitalize">
                      {tag}
                    </span>
                  ))}
                </div>
              )}
            </div>

            {canShowTransliteration && (
              <div className="flex gap-2 mb-6">
                <button
                  onClick={() => setShowTransliteration(false)}
                  className={`px-5 py-3 rounded-xl text-base font-medium transition-colors touch-target ${
                    !showTransliteration ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground hover:bg-muted/80'
                  }`}
                >
                  Hindi Lyrics
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

            {hasUploadedImage && (
              <div className="bg-card rounded-xl shadow-temple p-6 md:p-10 mb-6">
                <p className="text-sm font-semibold text-muted-foreground mb-4">Lyrics Image</p>
                <img
                  src={display.imageUrl}
                  alt={`Lyrics for ${display.title}`}
                  className="w-full rounded-lg border border-border"
                  loading="lazy"
                />
              </div>
            )}

            <div className="bg-card rounded-xl shadow-temple p-6 md:p-10">
              {hasOnlyUrlInLyrics ? (
                <p className="text-muted-foreground text-lg">
                  Lyrics text is not available for this upload yet.
                </p>
              ) : (
                <pre className={`whitespace-pre-wrap leading-relaxed text-xl ${
                  !showTransliteration ? 'hindi-text text-foreground' : 'font-body text-foreground'
                }`}>
                  {showTransliteration && canShowTransliteration
                    ? display.lyricsTransliteration
                    : display.lyricsHindi}
                </pre>
              )}
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
}
