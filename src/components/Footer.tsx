import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  Heart, 
  Shield, 
  ChevronRight, 
  Headphones, 
  Mic, 
  Calendar, 
  Users, 
  Compass, 
  Flower2, 
  Home, 
  Music, 
  Flame, 
  Upload, 
  Star, 
  MessageSquare, 
  Sparkles, 
  BookOpen 
} from 'lucide-react';
import { useLanguage } from '@/hooks/useLanguage';
import { useBhajanCounts } from '@/hooks/useBhajanCounts';
import { bhajans as staticBhajans } from '@/data/bhajans';
import { supabase } from '@/lib/supabaseClient';

// Local translation dictionary to support Hindi and English beautifully
const footerDict = {
  en: {
    connectWithUs: "Connect with Us",
    explore: "Explore",
    community: "Community",
    sadhana: "Sadhana",
    home: "Home",
    bhajans: "Bhajans",
    mantraJapa: "Mantra Japa",
    aarti: "Aarti",
    panchang: "Panchang",
    uploadBhajan: "Upload Bhajan",
    becomeArtist: "Become Artist",
    becomeVolunteer: "Become Volunteer",
    sendSuggestions: "Send Suggestions",
    meditationSadhana: "Meditation & Sadhana",
    mantraCollection: "Mantra Collection",
    vratFestivals: "Vrat & Festivals",
    kathaDiscourse: "Katha & Discourse",
    bhajansStat: "Bhajans",
    artistsStat: "Artists",
    dailyStat: "Daily",
    panchangStat: "Panchang",
    communityLedStat: "Community",
    drivenStat: "Led",
    privacyPolicy: "Privacy Policy",
    termsOfService: "Terms of Service",
    copyright: "Copyright",
    contactUs: "Contact Us",
    rightsReserved: "All rights reserved.",
    tagline: "Preserving devotion, one bhajan at a time.",
    desc: "The largest community-driven collection of Hindu devotional music."
  },
  hi: {
    connectWithUs: "हमसे जुड़ें",
    explore: "खोजें",
    community: "समुदाय",
    sadhana: "साधना",
    home: "होम",
    bhajans: "भजन",
    mantraJapa: "मंत्र जाप",
    aarti: "आरती",
    panchang: "पंचांग",
    uploadBhajan: "भजन अपलोड करें",
    becomeArtist: "कलाकार बनें",
    becomeVolunteer: "स्वयंसेवक बनें",
    sendSuggestions: "सुझाव भेजें",
    meditationSadhana: "ध्यान एवं साधना",
    mantraCollection: "मंत्र संग्रह",
    vratFestivals: "व्रत एवं त्योहार",
    kathaDiscourse: "कथा एवं प्रवचन",
    bhajansStat: "भजन",
    artistsStat: "कलाकार",
    dailyStat: "दैनिक",
    panchangStat: "पंचांग",
    communityLedStat: "समुदाय द्वारा",
    drivenStat: "संचालित",
    privacyPolicy: "गोपनीयता नीति",
    termsOfService: "सेवा की शर्तें",
    copyright: "कॉपीराइट",
    contactUs: "संपर्क करें",
    rightsReserved: "सर्वाधिकार सुरक्षित।",
    tagline: "एक-एक भजन से भक्ति को संरक्षित करना।",
    desc: "हिंदू भक्ति संगीत का सबसे बड़ा समुदाय-संचालित संग्रह।"
  }
};

export default function Footer() {
  const { language } = useLanguage();
  const [showScroll, setShowScroll] = useState(false);

  const { totalCount: totalBhajanCount } = useBhajanCounts();
  const [artistCount, setArtistCount] = useState(() => {
    return new Set(staticBhajans.map(b => b.singerName.trim()).filter(Boolean)).size;
  });

  useEffect(() => {
    let active = true;
    const fetchArtistCount = async () => {
      try {
        const { data: uploadSingers } = await (supabase as any)
          .from('user_uploads')
          .select('singer_name')
          .or('status.eq.approved,status.is.null');

        if (!active) return;

        const uniqueSingers = new Set(staticBhajans.map(b => b.singerName.trim()).filter(Boolean));
        if (uploadSingers) {
          uploadSingers.forEach((row: any) => {
            if (row.singer_name) {
              uniqueSingers.add(row.singer_name.trim());
            }
          });
        }
        setArtistCount(uniqueSingers.size);
      } catch (err) {
        console.error('Error fetching artist count in footer:', err);
      }
    };

    void fetchArtistCount();
    return () => {
      active = false;
    };
  }, [totalBhajanCount]);

  // Safely get local translations
  const l = footerDict[language === 'hi' ? 'hi' : 'en'];

  useEffect(() => {
    const checkScroll = () => {
      if (!showScroll && window.scrollY > 400) {
        setShowScroll(true);
      } else if (showScroll && window.scrollY <= 400) {
        setShowScroll(false);
      }
    };
    window.addEventListener('scroll', checkScroll);
    return () => window.removeEventListener('scroll', checkScroll);
  }, [showScroll]);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <footer className="bg-[#0b0705] text-brand-cream/80 border-t border-brand-saffron/10 mt-0 pt-16 pb-[calc(5.75rem+env(safe-area-inset-bottom))] md:pb-12 relative overflow-hidden">
      {/* Decorative background glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[500px] h-[150px] bg-brand-saffron/5 rounded-full blur-[100px] pointer-events-none"></div>

      <div className="container mx-auto max-w-6xl px-4 relative z-10">
        
        {/* Top Header Block: Logo & Temple Silhouette */}
        <div className="flex flex-col md:flex-row items-center justify-between gap-8 mb-10">
          <div className="text-center md:text-left">
            <Link to="/" className="flex items-center justify-center md:justify-start gap-3 mb-4 group">
              <img 
                src="/brand-logo.webp" 
                alt="Hari Kirtan Logo" 
                className="w-12 h-12 object-contain transition-transform group-hover:rotate-12 duration-300 filter drop-shadow-[0_0_8px_rgba(217,119,6,0.2)]" 
                width={48} 
                height={48} 
              />
              <span className="font-display text-2xl font-bold text-brand-cream tracking-wide">Hari Kirtan</span>
            </Link>
            <p className="text-brand-saffron font-display font-medium text-base mb-1.5 leading-snug">
              {l.tagline}
            </p>
            <p className="text-sm text-brand-cream/60 max-w-md leading-relaxed">
              {l.desc}
            </p>
          </div>

          {/* Temple Silhouette SVG Graphics */}
          <div className="w-full max-w-[280px] h-32 md:block hidden opacity-40 hover:opacity-60 transition-opacity duration-300">
            <svg viewBox="0 0 300 120" className="w-full h-full text-brand-saffron fill-current">
              <defs>
                <radialGradient id="sun-glow" cx="50%" cy="100%" r="80%">
                  <stop offset="0%" stopColor="rgba(217, 119, 6, 0.4)" />
                  <stop offset="60%" stopColor="rgba(217, 119, 6, 0.05)" />
                  <stop offset="100%" stopColor="rgba(0, 0, 0, 0)" />
                </radialGradient>
              </defs>
              {/* Glowing Sun */}
              <circle cx="150" cy="100" r="35" fill="url(#sun-glow)" />
              <circle cx="150" cy="95" r="14" fill="rgba(217, 119, 6, 0.12)" stroke="rgba(217, 119, 6, 0.3)" strokeWidth="0.75" />
              
              {/* Back Temples */}
              <path d="M 90,120 L 90,105 L 94,95 L 98,82 L 102,68 L 105,82 L 109,95 L 113,105 L 113,120 Z" fill="rgba(217, 119, 6, 0.08)" />
              <path d="M 187,120 L 187,105 L 191,95 L 195,82 L 199,68 L 202,82 L 206,95 L 210,105 L 210,120 Z" fill="rgba(217, 119, 6, 0.08)" />
              
              {/* Center Temple (Shikhara structure with flag) */}
              <path d="M 130,120 L 130,95 L 135,80 L 140,65 L 146,45 L 150,30 L 154,45 L 160,65 L 165,80 L 170,95 L 170,120 Z" fill="rgba(217, 119, 6, 0.18)" />
              <line x1="150" y1="30" x2="150" y2="12" stroke="rgba(217, 119, 6, 0.5)" strokeWidth="1" />
              <path d="M 150,12 L 162,17 L 150,22 Z" fill="rgba(217, 119, 6, 0.5)" />

              {/* Side Small Silhouettes */}
              <path d="M 60,120 L 60,112 L 63,106 L 66,98 L 68,106 L 71,112 L 71,120 Z" fill="rgba(217, 119, 6, 0.05)" />
              <path d="M 230,120 L 230,112 L 233,106 L 236,98 L 238,106 L 241,112 L 241,120 Z" fill="rgba(217, 119, 6, 0.05)" />

              {/* Birds */}
              <path d="M 75,45 Q 79,42 82,45 Q 85,42 88,45 Q 85,46 82,45 Q 79,46 75,45 Z" fill="rgba(217, 119, 6, 0.2)" />
              <path d="M 220,38 Q 223,35 226,38 Q 229,35 232,38 Q 229,39 226,38 Q 223,39 220,38 Z" fill="rgba(217, 119, 6, 0.2)" />
              <path d="M 205,25 Q 207,23 209,25 Q 211,23 213,25 Q 211,26 209,25 Q 207,26 205,25 Z" fill="rgba(217, 119, 6, 0.2)" />
            </svg>
          </div>
        </div>

        {/* Social Media Section */}
        <div className="mb-10">
          <div className="flex items-center justify-center gap-4 mb-6">
            <div className="h-[1px] flex-1 bg-gradient-to-r from-transparent via-brand-saffron/20 to-brand-saffron/40"></div>
            <span className="text-brand-saffron font-display text-sm font-semibold tracking-wider flex items-center gap-1">
              ✦ {l.connectWithUs} ✦
            </span>
            <div className="h-[1px] flex-1 bg-gradient-to-l from-transparent via-brand-saffron/20 to-brand-saffron/40"></div>
          </div>

          <div className="flex items-center justify-center gap-10">
            {/* Telegram */}
            <div className="flex flex-col items-center gap-1.5 group">
              <a 
                href="https://t.me/harikirtan" 
                target="_blank" 
                rel="noopener noreferrer"
                className="w-12 h-12 rounded-full border border-sky-500/20 bg-sky-950/10 flex items-center justify-center text-sky-400 transition-all duration-300 hover:bg-sky-500 hover:text-white hover:border-sky-500 hover:shadow-[0_0_15px_rgba(56,189,248,0.45)] hover:scale-105"
                aria-label="Telegram"
              >
                <svg viewBox="0 0 24 24" className="w-5 h-5 fill-current">
                  <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm4.64 6.8c-.15 1.58-.8 5.42-1.13 7.19-.14.75-.42 1-.68 1.03-.58.05-1.02-.38-1.58-.75-.88-.58-1.38-.94-2.23-1.5-.99-.65-.35-1.01.22-1.59.15-.15 2.71-2.48 2.76-2.69.01-.03.01-.14-.07-.2-.08-.06-.19-.04-.27-.02-.11.02-1.93 1.23-5.46 3.62-.51.35-.98.53-1.39.51-.46-.01-1.33-.26-1.98-.47-.8-.26-1.43-.4-1.37-.85.03-.23.35-.47.96-.72 3.76-1.63 6.27-2.71 7.54-3.21 3.58-1.44 4.32-1.69 4.81-1.7.11 0 .35.03.5.15.13.1.17.25.19.35-.01.07.01.23.01.29z"/>
                </svg>
              </a>
              <span className="text-xs text-brand-cream/50 group-hover:text-brand-cream transition-colors">Telegram</span>
            </div>

            {/* WhatsApp */}
            <div className="flex flex-col items-center gap-1.5 group">
              <a 
                href="https://chat.whatsapp.com/" 
                target="_blank" 
                rel="noopener noreferrer"
                className="w-12 h-12 rounded-full border border-emerald-500/20 bg-emerald-950/10 flex items-center justify-center text-emerald-400 transition-all duration-300 hover:bg-emerald-500 hover:text-white hover:border-emerald-500 hover:shadow-[0_0_15px_rgba(16,185,129,0.45)] hover:scale-105"
                aria-label="WhatsApp"
              >
                <svg viewBox="0 0 24 24" className="w-5 h-5 fill-current">
                  <path d="M12.004 0C5.378 0 .004 5.374.004 12.001c0 2.112.55 4.17 1.6 6.002L.004 24l6.168-1.616a11.93 11.93 0 005.832 1.517c6.627 0 12-5.374 12-12.001 0-3.203-1.247-6.212-3.513-8.479A11.916 11.916 0 0012.004 0zm6.59 16.994c-.287.808-1.437 1.482-1.996 1.57-.492.077-1.127.143-3.29-.757-2.764-1.15-4.524-3.957-4.66-4.14-.136-.182-1.107-1.472-1.107-2.812 0-1.34.702-1.997.95-2.259.248-.261.545-.327.727-.327.182 0 .364.005.52.012.162.007.38-.062.593.45.213.514.728 1.777.79 1.902.063.125.104.27.02.437-.083.167-.125.27-.25.416-.124.146-.26.326-.37.438-.124.124-.254.26-.11.51.144.25.639 1.053 1.371 1.704.94.838 1.733 1.097 1.981 1.222.248.125.396.104.545-.062.15-.167.639-.74.809-.99.17-.25.34-.208.57-.124.23.083 1.455.686 1.705.811.25.125.416.187.478.291.063.104.063.604-.224 1.412z"/>
                </svg>
              </a>
              <span className="text-xs text-brand-cream/50 group-hover:text-brand-cream transition-colors">WhatsApp</span>
            </div>

            {/* YouTube */}
            <div className="flex flex-col items-center gap-1.5 group">
              <a 
                href="https://youtube.com" 
                target="_blank" 
                rel="noopener noreferrer"
                className="w-12 h-12 rounded-full border border-red-500/20 bg-red-950/10 flex items-center justify-center text-red-400 transition-all duration-300 hover:bg-red-500 hover:text-white hover:border-red-500 hover:shadow-[0_0_15px_rgba(239,68,68,0.45)] hover:scale-105"
                aria-label="YouTube"
              >
                <svg viewBox="0 0 24 24" className="w-5 h-5 fill-current">
                  <path d="M23.498 6.163a3.003 3.003 0 00-2.11-2.11C19.53 3.545 12 3.545 12 3.545s-7.53 0-9.388.508a3.003 3.003 0 00-2.11 2.11C0 8.017 0 12 0 12s0 3.983.502 5.837a3.003 3.003 0 002.11 2.11c1.858.508 9.388.508 9.388.508s7.53 0 9.388-.508a3.003 3.003 0 002.11-2.11C24 15.983 24 12 24 12s0-3.983-.502-5.837zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
                </svg>
              </a>
              <span className="text-xs text-brand-cream/50 group-hover:text-brand-cream transition-colors">YouTube</span>
            </div>
          </div>
        </div>

        {/* Three Grid Themed Link Columns */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
          
          {/* Card 1: Explore (Amber Theme) */}
          <div className="rounded-2xl border border-amber-500/10 bg-gradient-to-b from-[#16100d] to-[#0d0a08] p-5 shadow-lg transition-all duration-300 hover:border-amber-500/35 hover:shadow-[0_4px_25px_rgba(245,158,11,0.05)]">
            <h4 className="font-display text-base font-bold text-amber-500/95 mb-4 flex items-center justify-between pb-2 border-b border-amber-500/10">
              <span className="flex items-center gap-2">
                <Compass className="w-5 h-5" />
                {l.explore}
              </span>
              <span className="text-amber-500/80 text-sm">🪷</span>
            </h4>
            <ul className="space-y-1">
              {[
                { label: l.home, href: "/", icon: <Home className="w-4 h-4" /> },
                { label: l.bhajans, href: "/all-bhajans", icon: <Music className="w-4 h-4" /> },
                { label: l.mantraJapa, href: "/meditation", icon: <span className="font-display text-xs font-semibold w-4 h-4 flex items-center justify-center border border-amber-500/30 rounded-full bg-amber-500/10 text-amber-500">ॐ</span> },
                { label: l.aarti, href: "/live-aarti", icon: <Flame className="w-4 h-4" /> },
                { label: l.panchang, href: "/panchang", icon: <Calendar className="w-4 h-4" /> },
              ].map((item, idx) => (
                <li key={idx}>
                  <Link 
                    to={item.href} 
                    className="group flex items-center justify-between py-2 px-1 rounded-lg text-sm text-brand-cream/70 hover:text-brand-cream hover:bg-amber-500/5 transition-all"
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-brand-cream/40 group-hover:text-amber-500 transition-colors">
                        {item.icon}
                      </span>
                      <span className="font-medium">{item.label}</span>
                    </div>
                    <ChevronRight className="w-4 h-4 text-brand-cream/20 group-hover:text-amber-500 group-hover:translate-x-1 transition-all" />
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Card 2: Community (Emerald Theme) */}
          <div className="rounded-2xl border border-emerald-500/10 bg-gradient-to-b from-[#0d1410] to-[#080d0a] p-5 shadow-lg transition-all duration-300 hover:border-emerald-500/35 hover:shadow-[0_4px_25px_rgba(16,185,129,0.05)]">
            <h4 className="font-display text-base font-bold text-emerald-500/95 mb-4 flex items-center justify-between pb-2 border-b border-emerald-500/10">
              <span className="flex items-center gap-2">
                <Users className="w-5 h-5" />
                {l.community}
              </span>
              <span className="text-emerald-500/80 text-sm">👥</span>
            </h4>
            <ul className="space-y-1">
              {[
                { label: l.uploadBhajan, href: "/upload-bhajan", icon: <Upload className="w-4 h-4" /> },
                { label: l.becomeArtist, href: "/upload-bhajan", icon: <Star className="w-4 h-4" /> },
                { label: l.becomeVolunteer, href: "/about", icon: <Heart className="w-4 h-4" /> },
                { label: l.sendSuggestions, href: "/account/support", icon: <MessageSquare className="w-4 h-4" /> },
              ].map((item, idx) => (
                <li key={idx}>
                  <Link 
                    to={item.href} 
                    className="group flex items-center justify-between py-2 px-1 rounded-lg text-sm text-brand-cream/70 hover:text-brand-cream hover:bg-emerald-500/5 transition-all"
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-brand-cream/40 group-hover:text-emerald-500 transition-colors">
                        {item.icon}
                      </span>
                      <span className="font-medium">{item.label}</span>
                    </div>
                    <ChevronRight className="w-4 h-4 text-brand-cream/20 group-hover:text-emerald-500 group-hover:translate-x-1 transition-all" />
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Card 3: Sadhana (Purple Theme) */}
          <div className="rounded-2xl border border-purple-500/10 bg-gradient-to-b from-[#130d17] to-[#0a080d] p-5 shadow-lg transition-all duration-300 hover:border-purple-500/35 hover:shadow-[0_4px_25px_rgba(168,85,247,0.05)]">
            <h4 className="font-display text-base font-bold text-purple-500/95 mb-4 flex items-center justify-between pb-2 border-b border-purple-500/10">
              <span className="flex items-center gap-2">
                <Flower2 className="w-5 h-5" />
                {l.sadhana}
              </span>
              <span className="text-purple-500/80 text-sm">🧘</span>
            </h4>
            <ul className="space-y-1">
              {[
                { label: l.meditationSadhana, href: "/meditation", icon: <Sparkles className="w-4 h-4" /> },
                { label: l.mantraCollection, href: "/meditation", icon: <span className="font-display text-xs font-semibold w-4 h-4 flex items-center justify-center border border-purple-500/30 rounded-full bg-purple-500/10 text-purple-500">ॐ</span> },
                { label: l.vratFestivals, href: "/panchang", icon: <Calendar className="w-4 h-4" /> },
                { label: l.kathaDiscourse, href: "/blog", icon: <BookOpen className="w-4 h-4" /> },
              ].map((item, idx) => (
                <li key={idx}>
                  <Link 
                    to={item.href} 
                    className="group flex items-center justify-between py-2 px-1 rounded-lg text-sm text-brand-cream/70 hover:text-brand-cream hover:bg-purple-500/5 transition-all"
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-brand-cream/40 group-hover:text-purple-500 transition-colors">
                        {item.icon}
                      </span>
                      <span className="font-medium">{item.label}</span>
                    </div>
                    <ChevronRight className="w-4 h-4 text-brand-cream/20 group-hover:text-purple-500 group-hover:translate-x-1 transition-all" />
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Stats Row */}
        <div className="grid grid-cols-3 md:grid-cols-5 items-center justify-center gap-4 md:gap-6 py-6 border-t border-b border-brand-saffron/10 mb-10">
          {/* Stat 1: Bhajans */}
          <div className="flex flex-col items-center text-center col-start-1 row-start-1">
            <Headphones className="w-5 h-5 text-brand-saffron mb-1.5 opacity-80" />
            <span className="font-display font-bold text-brand-cream text-sm md:text-base">{totalBhajanCount.toLocaleString()}+</span>
            <span className="text-xs text-brand-cream/50 font-medium">{l.bhajansStat}</span>
          </div>

          {/* Stat 2: Artists */}
          <div className="flex flex-col items-center text-center col-start-1 row-start-2 md:col-start-2 md:row-start-1">
            <Mic className="w-5 h-5 text-brand-saffron mb-1.5 opacity-80" />
            <span className="font-display font-bold text-brand-cream text-sm md:text-base">{artistCount.toLocaleString()}+</span>
            <span className="text-xs text-brand-cream/50 font-medium">{l.artistsStat}</span>
          </div>

          {/* Center: Om Mandala */}
          <div className="flex flex-col items-center justify-center col-start-2 row-start-1 row-span-2 md:col-start-3 md:row-span-1 md:row-start-1">
            <div className="relative flex items-center justify-center w-16 h-16 md:w-20 md:h-20">
              <div className="absolute inset-0 bg-brand-saffron/5 rounded-full blur-lg animate-pulse"></div>
              <img 
                src="/mandala-logo.png" 
                alt="Om Mandala" 
                className="w-full h-full object-contain animate-spin-slow filter drop-shadow-[0_0_8px_rgba(217,119,6,0.35)] hover:scale-105 transition-transform duration-300 cursor-pointer" 
              />
            </div>
          </div>

          {/* Stat 3: Panchang */}
          <div className="flex flex-col items-center text-center col-start-3 row-start-1 md:col-start-4 md:row-start-1">
            <Calendar className="w-5 h-5 text-brand-saffron mb-1.5 opacity-80" />
            <span className="font-display font-bold text-brand-cream text-sm md:text-base">{l.dailyStat}</span>
            <span className="text-xs text-brand-cream/50 font-medium">{l.panchangStat}</span>
          </div>

          {/* Stat 4: Community Led */}
          <div className="flex flex-col items-center text-center col-start-3 row-start-2 md:col-start-5 md:row-start-1">
            <Users className="w-5 h-5 text-brand-saffron mb-1.5 opacity-80" />
            <span className="font-display font-bold text-brand-cream text-sm md:text-base">{l.communityLedStat}</span>
            <span className="text-xs text-brand-cream/50 font-medium">{l.drivenStat}</span>
          </div>
        </div>

        {/* Bottom Bar: Links and Copyright */}
        <div className="border-t border-brand-saffron/10 pt-8 flex flex-col items-center justify-center gap-3">
          <div className="flex flex-wrap items-center justify-center gap-x-4 gap-y-2 text-sm text-brand-cream/70">
            <Link to="/privacy" className="hover:text-brand-saffron transition-colors flex items-center gap-1.5">
              <Shield className="w-4 h-4 text-brand-saffron" />
              {l.privacyPolicy}
            </Link>
            <span className="text-brand-saffron/20">|</span>
            <Link to="/terms" className="hover:text-brand-saffron transition-colors">{l.termsOfService}</Link>
            <span className="text-brand-saffron/20">|</span>
            <Link to="/privacy" className="hover:text-brand-saffron transition-colors">{l.copyright}</Link>
            <span className="text-brand-saffron/20">|</span>
            <Link to="/account/support" className="hover:text-brand-saffron transition-colors">{l.contactUs}</Link>
          </div>
          <div className="flex items-center gap-1.5 text-xs text-brand-cream/40 mt-1">
            <span>© 2026 Hari Kirtan. {l.rightsReserved}</span>
            <Heart className="w-3.5 h-3.5 text-brand-saffron fill-current inline-block" />
          </div>
        </div>

      </div>

      {/* Floating Om Scroll-to-Top Button */}
      <button
        onClick={scrollToTop}
        className={`fixed bottom-6 right-6 z-40 w-11 h-11 rounded-full bg-gradient-to-br from-[#1c120c] to-[#0b0705] border border-brand-saffron/40 flex items-center justify-center text-brand-saffron font-display text-lg font-bold transition-all duration-300 shadow-[0_0_15px_rgba(217,119,6,0.3)] hover:shadow-[0_0_20px_rgba(217,119,6,0.65)] hover:border-brand-saffron hover:scale-110 active:scale-95 ${
          showScroll ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10 pointer-events-none'
        }`}
        aria-label="Scroll to Top"
      >
        ॐ
      </button>
    </footer>
  );
}
