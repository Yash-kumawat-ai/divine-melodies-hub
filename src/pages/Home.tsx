import { motion, useInView } from 'framer-motion';
import { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Upload, Search, Users, ShieldCheck, Star, Headphones, ArrowRight, Landmark, Sun, Trophy, Gift } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { SEO } from '@/components/SEO';
import { HeroSection } from '@/components/HeroSection';
import { PromotionalCarousel } from '@/components/PromotionalCarousel';
import SearchBar from '@/components/SearchBar';
import DeityGrid from '@/components/DeityGrid';
import BhajanCard from '@/components/BhajanCard';
import { bhajans as staticBhajans } from '@/data/bhajans';
import { generateBhajanSlug } from '@/lib/slugUtils';
import { supabase } from '@/lib/supabaseClient';
import { useAuth } from '@/hooks/useAuth';
import { useLanguage } from '@/hooks/useLanguage';
import { useBhajanCounts } from '@/hooks/useBhajanCounts';
import { usePresence } from '@/hooks/usePresence';
import { toast } from 'sonner';
import hanumanCommunityBanner from '@/pages/images/hanuman_community_banner_high_quality.webp';

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

function AnimatedCounter({ target, label }: { target: number; label: string }) {
  const [count, setCount] = useState(0);
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: '-50px' });

  useEffect(() => {
    if (!inView) return;
    let start = 0;
    const duration = 1500;
    const step = Math.max(1, Math.floor(target / (duration / 16)));
    const timer = setInterval(() => {
      start += step;
      if (start >= target) {
        setCount(target);
        clearInterval(timer);
      } else {
        setCount(start);
      }
    }, 16);
    return () => clearInterval(timer);
  }, [inView, target]);

  return (
    <div ref={ref} className="text-center">
      <p className="text-3xl md:text-4xl font-bold font-display text-brand-saffron tabular-nums">
        {count.toLocaleString()}+
      </p>
      <p className="text-sm text-muted-foreground mt-1">{label}</p>
    </div>
  );
}

export default function Home() {
  const { t, language } = useLanguage();
  const isHi = language === 'hi';
  const { user } = useAuth();
  const { totalCount: totalBhajanCount } = useBhajanCounts();
  const { onlineCount } = usePresence();
  const navigate = useNavigate();
  const [userBhajans, setUserBhajans] = useState<UserBhajan[]>([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({ bhajans: 0, artists: 0, devotees: 0 });
  const [communityStats, setCommunityStats] = useState({ members: 0, totalJaps: 0, todayParticipants: 0 });

  const features = [
    { icon: Upload, title: t('uploadAndShare'), desc: t('uploadAndShareDesc') },
    { icon: Search, title: t('discoverBhajans'), desc: t('discoverBhajansDesc') },
    { icon: Users, title: t('communityDriven'), desc: t('communityDrivenDesc') },
    { icon: ShieldCheck, title: t('curatedQuality'), desc: t('curatedQualityDesc') },
  ];

  const testimonials = isHi ? [
    { name: 'प्रिया शर्मा', city: 'जयपुर', initials: 'PS', quote: 'राघवम् में भजनों का सबसे संपूर्ण संग्रह है जो मुझे ऑनलाइन मिला है। मैं अपनी सुबह की पूजा के लिए हर दिन इसका उपयोग करती हूँ।' },
    { name: 'रमेश कुमार', city: 'वाराणसी', initials: 'RK', quote: 'मैंने यहाँ अपने दादाजी के दुर्लभ भजन अपलोड किए हैं। यह जानकर बहुत अच्छा लगता है कि वे आने वाली पीढ़ियों के लिए सुरक्षित रहेंगे।' },
    { name: 'अंजलि गुप्ता', city: 'मुंबई', initials: 'AG', quote: 'भजन के बोल बिल्कुल सटीक और पढ़ने में आसान हैं। इस प्लेटफॉर्म की मदद से अब मेरे बच्चे भी शाम की आरती में साथ गाते हैं।' }
  ] : [
    { name: 'Priya Sharma', city: 'Jaipur', initials: 'PS', quote: 'Raghavam has the most complete collection of bhajans I have found online. I use it every morning for my puja.' },
    { name: 'Ramesh Kumar', city: 'Varanasi', initials: 'RK', quote: 'I uploaded my grandfather\'s rare bhajans here. It feels wonderful to know they will be preserved for future generations.' },
    { name: 'Anjali Gupta', city: 'Mumbai', initials: 'AG', quote: 'The lyrics are accurate and easy to read. My children now sing along during our evening aarti thanks to this platform.' },
  ];

  useEffect(() => {
    const fetchData = async () => {
      try {
        const { count: profileCount } = await (supabase as any)
          .from('user_profiles')
          .select('id', { count: 'exact', head: true });

        const { data: uploadSingers } = await (supabase as any)
          .from('user_uploads')
          .select('singer_name')
          .or('status.eq.approved,status.is.null');

        const uniqueSingers = new Set(staticBhajans.map(b => b.singerName.trim()).filter(Boolean));
        if (uploadSingers) {
          uploadSingers.forEach((row: any) => {
            if (row.singer_name) {
              uniqueSingers.add(row.singer_name.trim());
            }
          });
        }

        setStats({
          bhajans: totalBhajanCount,
          artists: uniqueSingers.size,
          devotees: profileCount ?? 0,
        });
      } catch (err) {
        console.error('Error fetching dynamic stats:', err);
        const uniqueSingers = new Set(staticBhajans.map(b => b.singerName.trim()).filter(Boolean));
        setStats({
          bhajans: totalBhajanCount || staticBhajans.length,
          artists: uniqueSingers.size,
          devotees: 0,
        });
      }
    };

    const fetchBhajans = async () => {
      try {
        const { data, error } = await (supabase as any)
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

    const fetchCommunityStats = async () => {
      try {
        // Total registered members
        const { count: memberCount } = await (supabase as any)
          .from('user_profiles')
          .select('id', { count: 'exact', head: true });

        // Total chants and last session date across all users
        const { data: japTotals } = await (supabase as any)
          .from('user_jap_totals')
          .select('user_id, total_chants, last_session_at');

        let totalJaps = 0;
        let todayCount = 0;

        if (japTotals) {
          totalJaps = japTotals.reduce(
            (sum: number, row: any) => sum + (Number(row.total_chants) || 0), 0
          );

          const todayStart = new Date();
          todayStart.setHours(0, 0, 0, 0);

          const activeTodayUserIds = new Set(
            japTotals
              .filter((row: any) => row.last_session_at && new Date(row.last_session_at) >= todayStart)
              .map((row: any) => row.user_id)
          );
          todayCount = activeTodayUserIds.size;
        }

        setCommunityStats({
          members: memberCount ?? 0,
          totalJaps,
          todayParticipants: todayCount,
        });
      } catch (err) {
        console.error('Error fetching community stats:', err);
        setCommunityStats({
          members: 0,
          totalJaps: 0,
          todayParticipants: 0,
        });
      }
    };

    fetchData();
    fetchBhajans();
    fetchCommunityStats();
  }, [totalBhajanCount]);

  const handleUploadClick = () => {
    if (!user) {
      toast.info(language === 'hi' ? 'कृपया भजन अपलोड करने के लिए लॉग इन करें' : 'Please log in to upload bhajans');
      navigate('/auth/login?redirect=/upload-bhajan');
      return;
    }
    navigate('/upload-bhajan');
  };

  return (
    <div>
      <SEO
        title="Raghavam - Indian Bhajans & Devotional Songs"
        description="Discover, share, and preserve Hindu devotional music. Explore bhajans for Krishna, Shiva, Hanuman, Rama and more."
      />

      <HeroSection stats={stats} />

      {/* Promotional Banner Carousel */}
      <PromotionalCarousel />

      {/* ── Hanuman Bhakt Community Banner Poster ── */}
      <section className="px-4 py-6 md:py-10">
        <div className="container mx-auto max-w-5xl">
          <motion.div
            initial={{ opacity: 0, y: 28 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-60px' }}
            transition={{ duration: 0.55, ease: 'easeOut' }}
            className="relative overflow-hidden rounded-[1.75rem] md:rounded-[2.25rem] border border-amber-500/20 group hover:border-amber-500/40 transition-all duration-500 aspect-[16/9] md:aspect-[21/9] w-full"
            style={{
              backgroundImage: `url(${hanumanCommunityBanner})`,
              backgroundSize: 'cover',
              backgroundPosition: 'center',
              boxShadow: '0 20px 50px rgba(0,0,0,0.65), inset 0 1px 0 rgba(255,255,255,0.05)',
            }}
          >
            {/* Clickable link covering the whole banner (except the button) */}
            <Link to="/community" className="absolute inset-0 z-10 cursor-pointer">
              <span className="sr-only">{isHi ? 'समुदाय में शामिल हों' : 'Join Community'}</span>
            </Link>

            {/* CTA Button centered at the bottom of the poster */}
            <div className="absolute bottom-4 md:bottom-8 left-1/2 -translate-x-1/2 z-20 w-auto px-4 text-center">
              <Link
                to="/community"
                className="inline-flex items-center justify-center gap-2 px-6 py-3 md:px-8 md:py-3.5 rounded-xl font-sans font-black text-xs md:text-sm uppercase tracking-widest text-stone-950 transition-all hover:scale-[1.04] active:scale-95 shadow-[0_6px_24px_rgba(234,88,12,0.45)] border border-amber-400/20"
                style={{
                  background: 'linear-gradient(135deg, #f5a623 0%, #e67c00 100%)',
                }}
              >
                <span>🪷</span>
                <span>{isHi ? 'समुदाय में शामिल हों' : 'Join Now'}</span>
                <ArrowRight className="w-4 h-4 text-stone-950" />
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Deity Grid */}
      <DeityGrid />

      {/* Community Bhajans */}
      {!loading && userBhajans.length > 0 && (
        <section className="py-16 px-4 bg-background">
          <div className="container mx-auto max-w-6xl">
            <h2 className="font-display text-3xl md:text-4xl font-bold text-center mb-3 text-foreground">
              {t('communityBhajans')}
            </h2>
            <p className="text-center text-muted-foreground text-lg mb-10">
              {t('sharedByOurCommunity')}
            </p>
            <div className="mb-10 flex justify-center">
              <Button asChild variant="outline" className="rounded-full px-6">
                <Link to="/all-bhajans">{isHi ? 'और देखें' : 'View more'}</Link>
              </Button>
            </div>
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
                return <BhajanCard key={bhajan.id} bhajan={convertedBhajan} />;
              })}
            </div>
          </div>
        </section>
      )}

      {/* Features */}
      <section className="py-20 px-4 bg-card/30">
        <div className="container mx-auto max-w-5xl">
          <h2 className="font-display text-3xl md:text-4xl font-bold text-center mb-12 text-foreground">
            {t('whyRaghavam')}
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((f) => (
              <motion.div
                key={f.title}
                className="rounded-2xl border border-border bg-card p-6 text-center hover:border-brand-saffron/30 transition-colors"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-50px' }}
              >
                <div className="w-12 h-12 rounded-xl bg-brand-saffron/10 flex items-center justify-center mx-auto mb-4">
                  <f.icon className="w-6 h-6 text-brand-saffron" />
                </div>
                <h3 className="font-display text-lg font-bold text-foreground mb-2">{f.title}</h3>
                <p className="text-sm text-muted-foreground">{f.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-20 px-4 bg-background">
        <div className="container mx-auto max-w-5xl">
          <h2 className="font-display text-3xl md:text-4xl font-bold text-center mb-12 text-foreground">
            {t('lovedByDevotees')}
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {testimonials.map((item) => (
              <motion.div
                key={item.name}
                className="rounded-2xl border border-border bg-card p-6"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-50px' }}
              >
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-full bg-brand-saffron/10 flex items-center justify-center font-bold text-brand-saffron text-sm">
                    {item.initials}
                  </div>
                  <div>
                    <p className="font-semibold text-foreground text-sm">{item.name}</p>
                    <p className="text-xs text-muted-foreground">{item.city}</p>
                  </div>
                </div>
                <div className="flex gap-0.5 mb-3">
                  {[1, 2, 3, 4, 5].map((s) => (
                    <Star key={s} className="w-4 h-4 fill-brand-gold text-brand-gold" />
                  ))}
                </div>
                <p className="text-sm text-muted-foreground leading-relaxed">"{item.quote}"</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Banner */}
      <section className="py-20 px-4 bg-gradient-to-r from-brand-saffron to-brand-gold">
        <div className="container mx-auto max-w-3xl text-center">
          <Headphones className="w-12 h-12 text-white/80 mx-auto mb-4" />
          <h2 className="font-display text-3xl md:text-4xl font-bold text-white mb-4">
            {t('joinThousands')}
          </h2>
          <p className="text-white/80 text-lg mb-8 max-w-lg mx-auto">
            {t('joinThousandsSubtitle')}
          </p>
          <Button asChild size="lg" className="bg-white text-brand-saffron hover:bg-brand-cream font-bold px-8 h-12 text-base rounded-xl">
            <Link to="/auth/signup">
              {t('getStartedFree')}
              <ArrowRight className="w-5 h-5 ml-2" />
            </Link>
          </Button>
        </div>
      </section>

    </div>
  );
}
