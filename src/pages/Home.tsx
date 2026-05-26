import { motion, useInView } from 'framer-motion';
import { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Upload, Search, Users, ShieldCheck, Star, Headphones, ArrowRight, Landmark, CalendarDays } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { SEO } from '@/components/SEO';
import dhyaanLogo from '@/assets/dhyaan-logo.png';
import exploreButtonArt from '@/assets/explore-button.png';
import SearchBar from '@/components/SearchBar';
import DeityGrid from '@/components/DeityGrid';
import BhajanCard from '@/components/BhajanCard';
import { bhajans as staticBhajans } from '@/data/bhajans';
import { generateBhajanSlug } from '@/lib/slugUtils';
import { supabase } from '@/lib/supabaseClient';
import { useAuth } from '@/hooks/useAuth';
import { useLanguage } from '@/hooks/useLanguage';
import { toast } from 'sonner';
import PanchangShortcut from '@/components/panchang/PanchangShortcut';

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
        const [uploadsRes, _] = await Promise.all([
          (supabase as any).from('user_uploads').select('id', { count: 'exact', head: true }).eq('status', 'approved'),
          (supabase as any).from('user_profiles').select('id', { count: 'exact', head: true }),
        ]);
        setStats({
          bhajans: (uploadsRes.count ?? 0) + staticBhajans.length,
          artists: Math.max(50, _.count ?? 0),
          listeners: Math.max(1000, (_.count ?? 0) * 10),
        });
      } catch {
        setStats({ bhajans: staticBhajans.length, artists: 50, listeners: 1000 });
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
  }, []);

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

      <PanchangShortcut />

      {/* Hero */}
      <section className="relative overflow-hidden bg-gradient-to-br from-brand-dark via-brand-brown to-brand-dark py-20 md:py-32 px-4">
        <img
          src={dhyaanLogo}
          alt=""
          aria-hidden="true"
          className="absolute right-[-10%] top-[-20%] w-[500px] opacity-[0.06] animate-float pointer-events-none select-none"
          width={500}
          height={500}
          loading="lazy"
        />
        <div className="container mx-auto max-w-4xl text-center relative z-10">
          <motion.h1
            className="font-display text-4xl md:text-6xl font-bold text-brand-cream mb-4"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            {t('discoverThe')} <span className="text-brand-saffron">{t('divine')}</span>
          </motion.h1>
          {language !== 'hi' && (
            <motion.p
              className="font-hindi text-2xl md:text-3xl text-brand-cream/70 mb-2"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.15 }}
            >
              हरि कीर्तन
            </motion.p>
          )}
          <motion.p
            className="text-lg text-brand-cream/60 mb-10 max-w-xl mx-auto"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.25 }}
          >
            {t('heroSubtitle')}
          </motion.p>
          <motion.div
            className="flex flex-col sm:flex-row items-center justify-center gap-3 mb-8"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.35 }}
          >
            <Button asChild size="lg" className="bg-brand-saffron hover:bg-brand-saffron/90 text-white font-semibold px-8 h-12 text-base rounded-xl">
              <Link to="/all-bhajans" className="inline-flex max-w-full flex-wrap items-center justify-center gap-2">
                <img
                  src={exploreButtonArt}
                  alt=""
                  className="h-7 w-auto max-w-[140px] object-contain object-left shrink-0"
                  width={140}
                  height={28}
                />
                <span>{t('browseBhajans')}</span>
              </Link>
            </Button>
            <Button
              size="lg"
              variant="outline"
              onClick={handleUploadClick}
              className="border-brand-cream/20 text-brand-cream hover:bg-brand-cream/10 px-8 h-12 text-base rounded-xl"
            >
              <Upload className="w-5 h-5 mr-2" />
              {t('uploadYours')}
            </Button>
            <Button
              asChild
              size="lg"
              variant="outline"
              className="border-brand-cream/20 text-brand-cream hover:bg-brand-cream/10 px-8 h-12 text-base rounded-xl"
            >
              <Link to="/temple">
                <Landmark className="w-5 h-5 mr-2" />
                {t('temple')}
              </Link>
            </Button>
          </motion.div>
          <SearchBar />
        </div>
      </section>

      {/* Panchang entry */}
      <section id="panchang-calendar" className="relative overflow-hidden bg-gradient-to-b from-background via-amber-50/45 to-background px-4 py-12 dark:via-amber-950/15 sm:py-16">
        <div className="container relative mx-auto max-w-5xl">
          <motion.div
            initial={{ opacity: 0, y: 18 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-80px' }}
            className="overflow-hidden rounded-[1.5rem] border border-amber-300/35 bg-card/90 shadow-[0_18px_70px_rgba(245,158,11,0.14)] backdrop-blur"
          >
            <div className="grid gap-0 md:grid-cols-[1fr_0.72fr]">
              <div className="p-5 sm:p-7 lg:p-8">
                <span className="inline-flex items-center gap-2 rounded-full border border-amber-300/40 bg-amber-500/10 px-3 py-1 text-xs font-bold text-amber-700 dark:text-amber-200">
                  <CalendarDays className="h-3.5 w-3.5" />
                  {isHi ? 'आज का पंचांग' : 'Today Panchang'}
                </span>
                <h2 className="mt-4 font-display text-2xl font-bold leading-tight text-foreground sm:text-3xl">
                  {isHi ? 'तिथि, नक्षत्र, राहु काल और पर्व एक अलग सुंदर पेज में देखें' : 'Open tithi, nakshatra, Rahu Kaal, and festivals in a dedicated page'}
                </h2>
                <p className="mt-3 max-w-2xl text-sm leading-relaxed text-muted-foreground sm:text-base">
                  {isHi
                    ? 'पंचांग डेटा रोज सुबह कैश JSON से दिखता है। वेबसाइट पर आने वाले भक्त VedAstro API को सीधे कॉल नहीं करते।'
                    : 'Panchang data is served from the daily cached JSON. Visitors never call the VedAstro API directly.'}
                </p>
                <div className="mt-5 flex flex-col gap-3 sm:flex-row">
                  <Button asChild size="lg" className="h-12 rounded-full bg-brand-saffron px-6 text-white shadow-lg shadow-amber-500/20 hover:bg-brand-saffron/90">
                    <Link to="/panchang">
                      <CalendarDays className="mr-2 h-5 w-5" />
                      {isHi ? 'पंचांग खोलें' : 'Open Panchang'}
                    </Link>
                  </Button>
                  <Button asChild size="lg" variant="outline" className="h-12 rounded-full border-amber-300/40 px-6">
                    <Link to="/all-bhajans">
                      <Search className="mr-2 h-5 w-5" />
                      {isHi ? 'भजन खोजें' : 'Find Bhajans'}
                    </Link>
                  </Button>
                </div>
              </div>
              <div className="flex min-h-52 items-center justify-center border-t border-amber-300/20 bg-[radial-gradient(circle_at_center,rgba(245,158,11,0.22),transparent_62%)] p-5 md:border-l md:border-t-0">
                <div className="text-center">
                  <div className="mx-auto flex h-24 w-24 items-center justify-center rounded-full border border-amber-300/40 bg-white/65 text-5xl font-bold text-amber-600 shadow-inner dark:bg-white/10 dark:text-amber-200">
                    ॐ
                  </div>
                  <p className="mt-4 text-sm font-semibold text-foreground">
                    {isHi ? 'मोबाइल टैब से भी तुरंत उपलब्ध' : 'Available from the mobile tab'}
                  </p>
                  <p className="mt-1 text-xs text-muted-foreground">
                    {isHi ? 'डिफ़ॉल्ट क्षेत्र: जयपुर' : 'Default zone: Jaipur'}
                  </p>
                </div>
              </div>
            </div>
          </motion.div>
          {/*
                <div>
                  <p className="text-xs font-bold uppercase tracking-[0.18em] text-muted-foreground">
                    {isHi ? 'भजन' : 'Bhajan'}
                  </p>
                  <h3 className="font-display text-xl font-bold text-foreground">
                    {isHi ? 'आज के पर्व के भजन' : 'Bhajans for today'}
                  </h3>
                </div>
              </div>
              <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
                {isHi
                  ? 'जल्द ही पंचांग के अनुसार भजन और आरती सुझाव यहाँ दिखेंगे।'
                  : 'Festival-aware bhajan and aarti recommendations will appear here soon.'}
              </p>
              <Button asChild className="mt-4 rounded-full bg-brand-saffron text-white hover:bg-brand-saffron/90">
                <Link to="/all-bhajans">{isHi ? 'भजन देखें' : 'Explore bhajans'}</Link>
              </Button>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-80px' }}
              className="relative overflow-hidden rounded-[1.5rem] border border-amber-300/25 bg-[linear-gradient(145deg,rgba(245,158,11,0.16),rgba(255,255,255,0.7))] p-5 dark:bg-[linear-gradient(145deg,rgba(245,158,11,0.12),rgba(26,16,6,0.85))]"
            >
              <div className="absolute right-4 top-4 text-5xl text-amber-500/10">ॐ</div>
              <div className="relative flex items-center gap-3">
                <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-white/65 text-amber-700 dark:bg-white/10 dark:text-amber-200">
                  <ImageIcon className="h-5 w-5" />
                </span>
                <div>
                  <p className="text-xs font-bold uppercase tracking-[0.18em] text-amber-700 dark:text-amber-300">
                    {todaysPanchang.darshan.title[isHi ? 'hi' : 'en']}
                  </p>
                  <h3 className="font-display text-xl font-bold text-foreground">
                    {isHi ? 'शांत दर्शन स्थान' : 'Sacred darshan space'}
                  </h3>
                </div>
              </div>
              <div className="relative mt-4 flex min-h-40 items-center justify-center rounded-2xl border border-amber-300/25 bg-gradient-to-br from-amber-100/70 via-orange-50 to-white text-center dark:from-amber-950/35 dark:via-orange-950/25 dark:to-black/20">
                <div>
                  <p className="font-display text-4xl text-amber-600/70 dark:text-amber-200/70">दीप</p>
                  <p className="mt-2 max-w-xs px-4 text-sm text-muted-foreground">
                    {todaysPanchang.darshan.subtitle[isHi ? 'hi' : 'en']}
                  </p>
                </div>
              </div>
            </motion.div>
          </div>
          */}
        </div>
      </section>

      {/* Stats Bar */}
      <section className="py-10 px-4 bg-card border-y border-border">
        <div className="container mx-auto max-w-3xl grid grid-cols-3 gap-6">
          <AnimatedCounter target={stats.bhajans} label={t('bhajans')} />
          <AnimatedCounter target={stats.artists} label={t('artists')} />
          <AnimatedCounter target={stats.listeners} label={t('listeners')} />
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
