import { useParams, Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { useState, useEffect } from "react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import BhajanCard from "@/components/BhajanCard";
import { getDeityBySlug, getBhajansByDeity } from "@/data/bhajans";
import { generateDeitySlug, generateBhajanSlug } from "@/lib/slugUtils";
import { supabase } from "@/integrations/supabase/client";
import { Loader2 } from "lucide-react";

interface CustomDeity {
  id: number;
  name: string;
  emoji: string;
  description?: string;
}

interface UserBhajan {
  id: string;
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

export default function DeityPage() {
  const { slug } = useParams<{ slug: string }>();
  const [customDeity, setCustomDeity] = useState<CustomDeity | null>(null);
  const [userBhajans, setUserBhajans] = useState<UserBhajan[]>([]);
  const [loading, setLoading] = useState(true);

  // Get static deity
  const staticDeity = getDeityBySlug(slug || "");
  const staticBhajanList = staticDeity ? getBhajansByDeity(staticDeity.id) : [];

  // Fetch custom deity and user bhajans if not found in static
  useEffect(() => {
    const fetchCustomDeityAndBhajans = async () => {
      try {
        if (staticDeity) {
          // Fetch user bhajans for this deity
          const { data: bhajansData } = await supabase
            .from('user_uploads')
            .select('*')
            .eq('status', 'approved')
            .eq('deity_id', staticDeity.id);

          if (bhajansData) {
            setUserBhajans(bhajansData as UserBhajan[]);
          }
        } else {
          // Try to fetch custom deities and find by slug match
          const { data: allCustomDeities, error } = await supabase
            .from('custom_deities')
            .select('*');

          if (!error && allCustomDeities && allCustomDeities.length > 0) {
            // Generate slug from deity name the same way as in AllDeities
            const matchedDeity = allCustomDeities.find(d => {
              const deitySlug = generateDeitySlug(d.name);
              return deitySlug === slug;
            });

            if (matchedDeity) {
              setCustomDeity(matchedDeity);
              
              // Fetch user bhajans for this custom deity
              const { data: bhajansData } = await supabase
                .from('user_uploads')
                .select('*')
                .eq('status', 'approved')
                .eq('deity_id', matchedDeity.id);

              if (bhajansData) {
                setUserBhajans(bhajansData as UserBhajan[]);
              }
            }
          }
        }
      } catch (err) {
        console.error('Error fetching deity data:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchCustomDeityAndBhajans();
  }, [slug, staticDeity]);

  const deity = staticDeity || customDeity;

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!deity) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="container mx-auto max-w-4xl px-4 py-20 text-center">
          <p className="text-2xl text-muted-foreground">Deity not found</p>
          <Link to="/all-deities" className="text-primary underline mt-4 inline-block">See All Deities</Link>
        </div>
        <Footer />
      </div>
    );
  }

  const mappedUserBhajans = userBhajans.map((ub, index) => ({
    id: (staticDeity ? staticBhajanList.length : 0) + index + 1,
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
    source: 'user',
    sourceKey: ub.id,
  }));

  // Show static + uploaded songs for static deities, and uploaded songs for custom deities.
  const combinedBhajans = staticDeity
    ? [
        ...staticBhajanList.map((b) => ({ ...b, source: 'static', sourceKey: String(b.id) })),
        ...mappedUserBhajans,
      ]
    : mappedUserBhajans;

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <section className="py-12 px-4">
        <div className="container mx-auto max-w-6xl">
          <Link 
            to={staticDeity ? "/" : "/all-deities"} 
            className="inline-flex items-center gap-2 text-muted-foreground hover:text-primary transition-colors mb-8 touch-target"
          >
            <ArrowLeft className="w-5 h-5" /> Back
          </Link>
          <div className="text-center mb-12">
            <span className="text-6xl block mb-4">{deity.emoji}</span>
            <h1 className="font-display text-4xl font-bold text-foreground">{deity.name}</h1>
            {staticDeity && (
              <p className="hindi-text text-2xl text-muted-foreground mt-1">{staticDeity.nameHindi}</p>
            )}
            <p className="text-muted-foreground mt-2">{deity.description}</p>
            <p className="text-sm text-muted-foreground mt-1">
              {combinedBhajans.length} bhajans
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {combinedBhajans.map((b: any) => (
              <BhajanCard key={`${b.source}-${b.sourceKey}`} bhajan={b} />
            ))}
          </div>
          {combinedBhajans.length === 0 && (
            <p className="text-center text-muted-foreground text-lg py-10">
              No bhajans available yet for {deity.name}. Check back soon!
            </p>
          )}
        </div>
      </section>
      <Footer />
    </div>
  );
}
