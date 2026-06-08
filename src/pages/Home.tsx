import { motion, useInView } from 'framer-motion';
import { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Upload, Search, Users, ShieldCheck, Star, Headphones, ArrowRight, Landmark } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { SEO } from '@/components/SEO';
import { HeroSection } from '@/components/HeroSection';
import SearchBar from '@/components/SearchBar';
import DeityGrid from '@/components/DeityGrid';
import BhajanCard from '@/components/BhajanCard';
import { bhajans as staticBhajans } from '@/data/bhajans';
import { generateBhajanSlug } from '@/lib/slugUtils';
import { supabase } from '@/lib/supabaseClient';
import { useAuth } from '@/hooks/useAuth';
import { useLanguage } from '@/hooks/useLanguage';
import { useBhajanCounts } from '@/hooks/useBhajanCounts';
import { toast } from 'sonner';

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
  const navigate = useNavigate();
  const [userBhajans, setUserBhajans] = useState<UserBhajan[]>([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({ bhajans: 0, artists: 0, listeners: 0 });

  const features = [
    { icon: Upload, title: t('uploadAndShare'), desc: t('uploadAndShareDesc') },
    { icon: Search, title: t('discoverBhajans'), desc: t('discoverBhajansDesc') },
    { icon: Users, title: t('communityDriven'), desc: t('communityDrivenDesc') },
    { icon: ShieldCheck, title: t('curatedQuality'), desc: t('curatedQualityDesc') },
  ];

  const testimonials = [
    { name: 'Priya Sharma', city: 'Jaipur', initials: 'PS', quote: 'Hari Kirtan has the most complete collection of bhajans I have found online. I use it every morning for my puja.' },
    { name: 'Ramesh Kumar', city: 'Varanasi', initials: 'RK', quote: 'I uploaded my grandfather\'s rare bhajans here. It feels wonderful to know they will be preserved for future generations.' },
    { name: 'Anjali Gupta', city: 'Mumbai', initials: 'AG', quote: 'The lyrics are accurate and easy to read. My children now sing along during our evening aarti thanks to this platform.' },
  ];

  useEffect(() => {
    const fetchData = async () => {
      try {
        const { count } = await (supabase as any).from('user_profiles').select('id', { count: 'exact', head: true });
        setStats({
          bhajans: totalBhajanCount,
          artists: Math.max(50, count ?? 0),
          listeners: Math.max(1000, (count ?? 0) * 10),
        });
      } catch {
        setStats({ bhajans: totalBhajanCount || staticBhajans.length, artists: 50, listeners: 1000 });
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

    fetchData();
    fetchBhajans();
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
        title="Hari Kirtan - Indian Bhajans & Devotional Songs"
        description="Discover, share, and preserve Hindu devotional music. Explore bhajans for Krishna, Shiva, Hanuman, Rama and more."
      />

      <HeroSection />

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
            {t('whyHariKirtan')}
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
