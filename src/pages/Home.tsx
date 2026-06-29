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
import hanumanImg from '@/assets/deities/hanuman_high_quality.webp';

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

      {/* Promotional Banner Carousel (Now at the top of the screen) */}
      <PromotionalCarousel />

      <HeroSection stats={stats} />

      {/* ── Hanuman Bhakt Community Banner Card (Dark Mode) ── */}
      <section className="px-4 py-6 md:py-10">
        <div className="container mx-auto max-w-5xl">
          <motion.div
            initial={{ opacity: 0, y: 28 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-60px' }}
            transition={{ duration: 0.55, ease: 'easeOut' }}
            className="relative overflow-hidden rounded-[1.75rem] md:rounded-[2.25rem]"
            style={{
              background: 'linear-gradient(135deg, #110804 0%, #1c0f06 40%, #130c08 100%)',
              border: '1px solid rgba(200,120,20,0.22)',
              boxShadow: '0 8px 40px rgba(0,0,0,0.55), 0 0 0 1px rgba(200,120,20,0.1)',
            }}
          >
            {/* Background glow */}
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_30%_50%,rgba(180,90,10,0.18),transparent_65%)] pointer-events-none" />
            {/* OM watermark */}
            <div className="absolute right-4 top-0 bottom-0 flex items-center pointer-events-none select-none opacity-[0.04]">
              <span className="text-[240px] md:text-[300px] font-serif text-amber-400 leading-none">ॐ</span>
            </div>

            <div className="relative flex flex-col md:flex-row items-stretch">

              {/* ── Hanuman Ji Image ── — blended into card via blurred backdrop + crisp center */}
              <div
                className="flex-shrink-0 w-full md:w-[260px] lg:w-[300px] relative overflow-hidden bg-stone-950 flex items-center justify-center border-b md:border-b-0 md:border-r border-amber-500/10"
                style={{ minHeight: '220px' }}
              >
                {/* Blurred backdrop copy to fill left and right bars */}
                <img
                  src={hanumanImg}
                  alt=""
                  className="absolute inset-0 w-full h-full object-cover select-none opacity-30 blur-md scale-110 pointer-events-none"
                  draggable={false}
                />
                
                {/* Crisp centered Hanuman portrait */}
                <img
                  src={hanumanImg}
                  alt="Hanumanji"
                  className="relative mx-auto h-full w-auto max-w-full object-contain select-none opacity-90 filter brightness-[0.75] contrast-[1.1] saturate-[0.95] drop-shadow-[0_4px_16px_rgba(0,0,0,0.6)] z-10"
                  draggable={false}
                  style={{ maxHeight: '380px' }}
                />

                {/* Overlays to blend image container with the card background */}
                {/* Top fade */}
                <div className="absolute top-0 inset-x-0 h-16 bg-gradient-to-b from-[#110804] to-transparent pointer-events-none z-20" />
                {/* Bottom fade */}
                <div className="absolute bottom-0 inset-x-0 h-20 bg-gradient-to-t from-[#1c0f06] to-transparent pointer-events-none z-20" />
                {/* Left fade */}
                <div className="absolute inset-y-0 left-0 w-16 bg-gradient-to-r from-[#110804] to-transparent pointer-events-none z-20" />
                {/* Right fade */}
                <div className="absolute inset-y-0 right-0 w-20 bg-gradient-to-l from-[#1c0f06] to-transparent pointer-events-none z-20" />
              </div>

              {/* ── Content ── */}
              <div className="flex-1 px-5 pb-7 pt-5 md:pt-8 md:pr-8 flex flex-col gap-4.5 text-left">

                {/* Live online badge */}
                <div className="flex items-center gap-2 self-start">
                  <span className="inline-flex items-center gap-2 bg-gradient-to-r from-emerald-500/15 via-green-500/5 to-transparent border border-emerald-500/25 text-emerald-400 text-[11px] font-bold px-3.5 py-1.5 rounded-full shadow-[0_2px_12px_rgba(16,185,129,0.1)] tracking-wide backdrop-blur-xs select-none">
                    <span className="relative flex h-2 w-2">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                    </span>
                    {isHi
                      ? `${onlineCount.toLocaleString('hi')} भक्त ऑनलाइन`
                      : `${onlineCount.toLocaleString()} ${onlineCount === 1 ? 'devotee' : 'devotees'} online`}
                  </span>
                </div>

                {/* Heading */}
                <div>
                  <h2 className="font-display text-[26px] md:text-[34px] lg:text-[38px] font-black leading-tight text-transparent bg-clip-text bg-gradient-to-r from-amber-200 via-amber-100 to-amber-300">
                    {isHi ? 'हमारे ' : 'Join Our '}
                    <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-400 via-amber-400 to-orange-500 font-extrabold drop-shadow-[0_2px_10px_rgba(245,158,11,0.25)]">
                      {isHi ? 'हनुमान भक्त' : 'Hanuman Bhakt'}
                    </span>
                    {isHi ? ' समुदाय से जुड़ें' : ' Community'}
                  </h2>
                  <div className="flex items-center gap-2 mt-2">
                    <span className="flex-1 max-w-[50px] h-[1px] bg-gradient-to-r from-transparent to-amber-500/40" />
                    <span className="text-amber-500 text-sm animate-pulse">🌸</span>
                    <span className="flex-1 max-w-[50px] h-[1px] bg-gradient-to-l from-transparent to-amber-500/40" />
                  </div>
                  <p className="text-amber-100/70 text-[13px] md:text-[14px] mt-2.5 leading-relaxed max-w-md font-medium tracking-wide">
                    {isHi
                      ? 'भक्तों से जुड़ें, साथ जाप करें, चुनौतियों में भाग लें और भक्ति में आगे बढ़ें।'
                      : 'Connect with devotees, chant together, join challenges and grow in devotion.'}
                  </p>
                </div>

                {/* 4 feature pills */}
                <div className="grid grid-cols-4 gap-2.5">
                  {[
                    { icon: Sun, label: isHi ? 'दैनिक\nप्रेरणा' : 'Daily\nInspiration' },
                    { icon: Trophy, label: isHi ? 'भक्ति\nचुनौती' : 'Bhakti\nChallenges' },
                    { icon: Users, label: isHi ? 'समूह\nजाप' : 'Group\nJap' },
                    { icon: Gift, label: isHi ? 'दिव्य\nपुरस्कार' : 'Divine\nRewards' },
                  ].map((item, i) => (
                    <motion.div
                      key={i}
                      initial={{ opacity: 0, y: 10 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      whileHover={{ scale: 1.04, y: -2, border: '1px solid rgba(245,158,11,0.45)' }}
                      viewport={{ once: true }}
                      transition={{ type: "spring", stiffness: 400, damping: 15 }}
                      className="flex flex-col items-center justify-center gap-2 bg-[#1b1008]/40 border border-amber-500/10 rounded-2xl py-3.5 px-1.5 cursor-pointer shadow-[inset_0_1px_1px_rgba(255,255,255,0.02)] transition-all duration-200"
                    >
                      <div className="w-9 h-9 rounded-xl bg-amber-500/10 flex items-center justify-center text-amber-400 transition-colors border border-amber-500/10">
                        <item.icon className="w-4.5 h-4.5 text-amber-400 filter drop-shadow-[0_2px_4px_rgba(245,158,11,0.2)]" />
                      </div>
                      <span className="text-[9px] font-black text-amber-200/80 uppercase tracking-widest text-center leading-tight whitespace-pre-line">{item.label}</span>
                    </motion.div>
                  ))}
                </div>

                {/* Dynamic stats row + CTA */}
                <div className="flex flex-col lg:flex-row items-stretch gap-3.5 mt-2">
                  {/* Stats */}
                  <div className="flex-1 flex items-center justify-around bg-stone-950/80 border border-amber-500/10 rounded-2xl px-4 py-3.5 gap-1.5 shadow-[inset_0_1px_3px_rgba(0,0,0,0.6)]">
                    <div className="flex items-center gap-2.5">
                      <div className="p-1 rounded-lg bg-amber-500/5 border border-amber-500/10">
                        <Users className="w-3.5 h-3.5 text-amber-400 flex-shrink-0" />
                      </div>
                      <div className="text-left">
                        <p className="text-[14px] font-black text-transparent bg-clip-text bg-gradient-to-b from-amber-100 to-amber-300 leading-none tabular-nums">
                          {communityStats.members.toLocaleString()}
                        </p>
                        <p className="text-[9px] text-amber-200/50 font-bold uppercase tracking-wider mt-1">{isHi ? 'सदस्य' : 'Members'}</p>
                      </div>
                    </div>
                    <div className="w-px h-8 bg-amber-500/15" />
                    
                    <div className="flex items-center gap-2.5">
                      <div className="p-1 rounded-lg bg-amber-500/5 border border-amber-500/10">
                        <span className="text-amber-400 text-xs flex-shrink-0 leading-none">📿</span>
                      </div>
                      <div className="text-left">
                        <p className="text-[14px] font-black text-transparent bg-clip-text bg-gradient-to-b from-amber-100 to-amber-300 leading-none tabular-nums">
                          {communityStats.totalJaps >= 10000000
                            ? `${(communityStats.totalJaps / 10000000).toFixed(1)} Cr`
                            : communityStats.totalJaps >= 100000
                            ? `${(communityStats.totalJaps / 100000).toFixed(1)} L`
                            : communityStats.totalJaps.toLocaleString()}
                        </p>
                        <p className="text-[9px] text-amber-200/50 font-bold uppercase tracking-wider mt-1">{isHi ? 'नाम जाप' : 'Naam Japs'}</p>
                      </div>
                    </div>
                    <div className="w-px h-8 bg-amber-500/15" />
                    
                    <div className="flex items-center gap-2.5">
                      <div className="p-1 rounded-lg bg-amber-500/5 border border-amber-500/10">
                        <span className="text-amber-400 text-xs flex-shrink-0 leading-none">🔥</span>
                      </div>
                      <div className="text-left">
                        <p className="text-[14px] font-black text-transparent bg-clip-text bg-gradient-to-b from-amber-100 to-amber-300 leading-none tabular-nums">
                          {communityStats.todayParticipants.toLocaleString()}
                        </p>
                        <p className="text-[9px] text-amber-200/50 font-bold uppercase tracking-wider mt-1">{isHi ? 'आज सक्रिय' : 'Today Active'}</p>
                      </div>
                    </div>
                  </div>

                  {/* CTA */}
                  <Link
                    to="/community"
                    className="flex-shrink-0 flex items-center justify-center gap-2 px-6 py-3.5 rounded-2xl font-sans font-black text-xs uppercase tracking-widest text-stone-950 transition-all hover:scale-[1.03] active:scale-95 border border-amber-400/20 shadow-[0_4px_24px_rgba(234,88,12,0.35)]"
                    style={{
                      background: 'linear-gradient(135deg, #f5a623 0%, #e67c00 100%)',
                    }}
                  >
                    <span>🪷</span>
                    <span>{isHi ? 'समुदाय में शामिल हों' : 'Join Community'}</span>
                    <ArrowRight className="w-4 h-4 text-stone-950" />
                  </Link>
                </div>

                {/* Trust badges */}
                <div className="flex items-center justify-center gap-3 text-[10px] text-amber-200/35 font-bold uppercase tracking-widest select-none">
                  <span className="flex items-center gap-1"><ShieldCheck className="w-3.5 h-3.5 text-amber-500/70" />{isHi ? 'सुरक्षित' : 'Safe'}</span>
                  <span className="text-amber-500/40">•</span>
                  <span>{isHi ? 'सकारात्मक' : 'Positive'}</span>
                  <span className="text-amber-500/40">•</span>
                  <span>{isHi ? 'आध्यात्मिक' : 'Spiritual'}</span>
                </div>
              </div>
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
