import { useParams, Link, useNavigate } from "react-router-dom";
import { useCallback, useEffect, useState } from "react";
import BhajanCard from "@/components/BhajanCard";
import { getDeityBySlug, getBhajansByDeity } from "@/data/bhajans";
import { generateDeitySlug, generateBhajanSlug } from "@/lib/slugUtils";
import { mapUserUploadToBhajan } from "@/lib/mapUserUpload";
import { supabase } from "@/integrations/supabase/client";
import { SEO } from "@/components/SEO";
import { getPublicSiteUrl } from "@/lib/env";

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
  const navigate = useNavigate();
  const { slug } = useParams<{ slug: string }>();
  const [customDeity, setCustomDeity] = useState<CustomDeity | null>(null);
  const [userBhajans, setUserBhajans] = useState<UserBhajan[]>([]);
  const [loading, setLoading] = useState(true);

  // Get static deity
  const staticDeity = getDeityBySlug(slug || "");
  const staticBhajanList = staticDeity ? getBhajansByDeity(staticDeity.id) : [];

  const fetchCustomDeityAndBhajans = useCallback(async () => {
    try {
      if (staticDeity) {
        const { data: bhajansData } = await supabase
          .from('user_uploads')
          .select('*')
          .eq('status', 'approved')
          .eq('deity_id', staticDeity.id);

        setUserBhajans((bhajansData ?? []) as UserBhajan[]);
        return;
      }

      const { data: allCustomDeities, error } = await supabase
        .from('custom_deities')
        .select('*');

      if (!error && allCustomDeities && allCustomDeities.length > 0) {
        const matchedDeity = allCustomDeities.find(d => {
          const deitySlug = generateDeitySlug(d.name);
          return deitySlug === slug;
        });

        if (matchedDeity) {
          setCustomDeity(matchedDeity as CustomDeity);

          const { data: bhajansData } = await supabase
            .from('user_uploads')
            .select('*')
            .eq('status', 'approved')
            .eq('deity_id', matchedDeity.id);

          setUserBhajans((bhajansData ?? []) as UserBhajan[]);
        }
      }
    } catch (err) {
      console.error('Error fetching deity data:', err);
    } finally {
      setLoading(false);
    }
  }, [slug, staticDeity]);

  useEffect(() => {
    let cancelled = false;
    void fetchCustomDeityAndBhajans();

    const channel = (supabase as any)
      .channel(`deity-bhajans-${slug || 'unknown'}`)
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'user_uploads' },
        () => {
          if (!cancelled) {
            void fetchCustomDeityAndBhajans();
          }
        },
      )
      .subscribe();

    return () => {
      cancelled = true;
      try {
        channel.unsubscribe();
        void (supabase as any).removeChannel(channel);
      } catch {
        // Ignore WebSocket cleanup errors (React StrictMode)
      }
    };
  }, [fetchCustomDeityAndBhajans, slug]);

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
        <div className="container mx-auto max-w-4xl px-4 py-20 text-center">
          <p className="text-2xl text-muted-foreground">Deity not found</p>
          <Link to="/all-deities" className="text-primary underline mt-4 inline-block">See All Deities</Link>
        </div>
      </div>
    );
  }

  const mappedUserBhajans = userBhajans.map((ub) =>
    mapUserUploadToBhajan(ub, customDeity ? [customDeity] : undefined)
  );

  // Show static + uploaded songs for static deities, and uploaded songs for custom deities.
  const combinedBhajans = staticDeity
    ? [
        ...staticBhajanList.map((b) => ({ ...b, source: 'static', sourceKey: String(b.id) })),
        ...mappedUserBhajans,
      ]
    : mappedUserBhajans;

  const seoTitle = staticDeity
    ? `${staticDeity.nameHindi} (${staticDeity.name}) के प्रसिद्ध भजन एवं आरती - Raghavam`
    : `${deity.name} Bhajans & Aartis - Raghavam`;

  const seoDescription = `Listen to sacred devotional bhajans, aartis, and chalisa dedicated to ${deity.name}${staticDeity ? ` (${staticDeity.nameHindi})` : ''} on Raghavam. Explore lyrics, audio, and videos.`;
  const baseUrl = getPublicSiteUrl();
  const canonicalUrl = `${baseUrl}/deity/${slug}`;

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    name: `${deity.name} Bhajans`,
    description: seoDescription,
    url: canonicalUrl,
    mainEntity: {
      '@type': 'ItemList',
      itemListElement: combinedBhajans.slice(0, 15).map((b: any, idx: number) => ({
        '@type': 'ListItem',
        position: idx + 1,
        name: b.title,
        url: `${baseUrl}/bhajan/${b.slug || b.id}`,
      })),
    },
  };

  return (
    <div>
      <SEO
        title={seoTitle}
        description={seoDescription}
        url={canonicalUrl}
        image={staticDeity?.imageUrl || `${baseUrl}/og-image.jpg`}
        type="website"
        lang="hi"
        jsonLd={jsonLd}
      />
      <section className="py-12 px-4">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-12">
            {staticDeity?.imageUrl ? (
              <img
                src={staticDeity.imageUrl}
                alt={deity.name}
                className="mx-auto mb-4 block h-auto max-h-[min(22rem,65vh)] w-full max-w-[16rem] rounded-2xl object-cover object-center shadow-lg sm:max-w-[18rem]"
              />
            ) : (
              <span className="text-6xl block mb-4">{deity.emoji}</span>
            )}
            <h1 className="font-display text-4xl font-bold text-foreground">{deity.name}</h1>
            {staticDeity && (
              <p className="hindi-text text-2xl text-muted-foreground mt-1">{staticDeity.nameHindi}</p>
            )}
            <p className="text-muted-foreground mt-2">{deity.description}</p>
            <p className="text-sm text-muted-foreground mt-1">
              {combinedBhajans.length} bhajans
            </p>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
            {combinedBhajans.map((b: any) => (
              <BhajanCard
                key={`${b.source}-${b.sourceKey}`}
                bhajan={b}
                onCardClick={(selected) => navigate(`/bhajan/${selected.slug}`)}
              />
            ))}
          </div>
          {combinedBhajans.length === 0 && (
            <p className="text-center text-muted-foreground text-lg py-10">
              No bhajans available yet for {deity.name}. Check back soon!
            </p>
          )}
        </div>
      </section>
    </div>
  );
}
