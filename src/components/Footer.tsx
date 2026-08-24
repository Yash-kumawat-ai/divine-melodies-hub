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
  BookOpen,
  ChevronDown
} from 'lucide-react';
import { useLanguage } from '@/hooks/useLanguage';
import { useBhajanCounts } from '@/hooks/useBhajanCounts';
import { useHomePublicStats } from '@/hooks/useHomeDashboardQueries';
import { cn } from '@/lib/utils';
import devotionalBg from '@/pages/images/devotional_background (1).webp';

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
    dmca: "DMCA",
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
    dmca: "डीएमसीए",
    copyright: "कॉपीराइट",
    contactUs: "संपर्क करें",
    rightsReserved: "सर्वाधिकार सुरक्षित।",
    tagline: "एक-एक भजन से भक्ति को संरक्षित करना।",
    desc: "हिंदू भक्ति संगीत का सबसे बड़ा समुदाय-संचालित संग्रह।"
  }
};

export default function Footer() {
  const { language } = useLanguage();
  const [activeSection, setActiveSection] = useState<'explore' | 'community' | 'sadhana' | null>(null);

  const exploreOpen = activeSection === 'explore';
  const communityOpen = activeSection === 'community';
  const sadhanaOpen = activeSection === 'sadhana';

  // Non-blocking cached stats with graceful static fallbacks
  const { totalCount: totalBhajanCount } = useBhajanCounts();
  const { data: publicStats } = useHomePublicStats();
  const displayedBhajanCount = totalBhajanCount > 0 ? totalBhajanCount : 1000;
  const displayedArtistCount = (publicStats?.artists ?? 0) > 0 ? publicStats!.artists : 50;

  // Safely get local translations
  const l = footerDict[language === 'hi' ? 'hi' : 'en'];

  return (
    <footer 
      className="bg-[#FFFDF8] dark:bg-background text-foreground border-t border-[#EFE4D7] dark:border-zinc-800 mt-0 pt-10 pb-[calc(5.75rem+env(safe-area-inset-bottom))] md:pb-12 relative overflow-hidden transition-colors duration-300 w-full"
      style={{ contentVisibility: 'auto', containIntrinsicSize: '0 450px' }}
    >
      {/* Decorative background glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[500px] h-[150px] bg-primary/5 rounded-full blur-[100px] pointer-events-none" />

      <div className="container mx-auto max-w-6xl px-4 relative z-10">
        
        {/* Brand Banner using devotional_background (1).webp with Single Raghavam Title */}
        <div className="relative overflow-hidden rounded-3xl border border-[#E8D8C4] dark:border-zinc-800 shadow-md mb-8 min-h-[160px] flex items-center justify-center">
          <img
            src={devotionalBg}
            alt="Raghavam Devotional Background"
            width={1600}
            height={400}
            loading="lazy"
            decoding="async"
            className="absolute inset-0 w-full h-full object-cover object-bottom"
          />
          {/* Natural soft overlay */}
          <div className="absolute inset-0 bg-gradient-to-b from-white/35 via-white/15 to-[#FFFDF8]/85 dark:from-black/60 dark:via-black/75 dark:to-black/90" />

          <div className="relative z-10 p-6 sm:p-8 text-center flex flex-col items-center justify-center">
            {/* Single Raghavam Title */}
            <Link to="/" className="inline-block group mb-1.5">
              <h2 className="font-serif text-3xl sm:text-4xl md:text-5xl font-black tracking-wide text-[#4A1516] dark:text-[#E8B15C] drop-shadow-sm group-hover:scale-105 transition-transform">
                Raghavam
              </h2>
            </Link>

            {/* Tagline & Subtitle */}
            <p className="text-[#6A2C2A] dark:text-amber-200 font-serif font-bold text-base sm:text-lg mb-1 max-w-xl">
              {l.tagline}
            </p>
            <p className="text-[#5C3026] dark:text-stone-300 text-xs sm:text-sm font-semibold max-w-md leading-relaxed">
              {l.desc}
            </p>
          </div>
        </div>

        {/* Social Media Section */}
        <div className="mb-10">
          <div className="flex items-center justify-center gap-4 mb-6">
            <div className="h-[1px] flex-1 bg-gradient-to-r from-transparent via-primary/20 to-primary/40" />
            <span className="text-primary font-display text-sm font-semibold tracking-wider flex items-center gap-1">
              ✦ {l.connectWithUs} ✦
            </span>
            <div className="h-[1px] flex-1 bg-gradient-to-l from-transparent via-primary/20 to-primary/40" />
          </div>

          <div className="flex items-center justify-center gap-10">
            {/* Telegram */}
            <div className="flex flex-col items-center gap-1.5 group">
              <a 
                href="https://t.me/raghavam" 
                target="_blank" 
                rel="noopener noreferrer"
                className="w-12 h-12 rounded-full border border-sky-500/30 bg-sky-500/5 flex items-center justify-center text-sky-500 transition-all duration-300 hover:bg-sky-500 hover:text-white hover:border-sky-500 hover:shadow-[0_0_15px_rgba(56,189,248,0.45)] hover:scale-105 cursor-pointer"
                aria-label="Telegram"
              >
                <svg viewBox="0 0 24 24" className="w-5 h-5 fill-current">
                  <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm4.64 6.8c-.15 1.58-.8 5.42-1.13 7.19-.14.75-.42 1-.68 1.03-.58.05-1.02-.38-1.58-.75-.88-.58-1.38-.94-2.23-1.5-.99-.65-.35-1.01.22-1.59.15-.15 2.71-2.48 2.76-2.69.01-.03.01-.14-.07-.2-.08-.06-.19-.04-.27-.02-.11.02-1.93 1.23-5.46 3.62-.51.35-.98.53-1.39.51-.46-.01-1.33-.26-1.98-.47-.8-.26-1.43-.4-1.37-.85.03-.23.35-.47.96-.72 3.76-1.63 6.27-2.71 7.54-3.21 3.58-1.44 4.32-1.69 4.81-1.7.11 0 .35.03.5.15.13.1.17.25.19.35-.01.07.01.23.01.29z"/>
                </svg>
              </a>
              <span className="text-xs text-muted-foreground group-hover:text-foreground transition-colors">Telegram</span>
            </div>

            {/* WhatsApp */}
            <div className="flex flex-col items-center gap-1.5 group">
              <a 
                href="https://chat.whatsapp.com/" 
                target="_blank" 
                rel="noopener noreferrer"
                className="w-12 h-12 rounded-full border border-emerald-500/30 bg-emerald-500/5 flex items-center justify-center text-emerald-600 dark:text-emerald-400 transition-all duration-300 hover:bg-emerald-500 hover:text-white hover:border-emerald-500 hover:shadow-[0_0_15px_rgba(16,185,129,0.45)] hover:scale-105 cursor-pointer"
                aria-label="WhatsApp"
              >
                <svg viewBox="0 0 24 24" className="w-5 h-5 fill-current">
                  <path d="M12.004 0C5.378 0 .004 5.374.004 12.001c0 2.112.55 4.17 1.6 6.002L.004 24l6.168-1.616a11.93 11.93 0 005.832 1.517c6.627 0 12-5.374 12-12.001 0-3.203-1.247-6.212-3.513-8.479A11.916 11.916 0 0012.004 0zm6.59 16.994c-.287.808-1.437 1.482-1.996 1.57-.492.077-1.127.143-3.29-.757-2.764-1.15-4.524-3.957-4.66-4.14-.136-.182-1.107-1.472-1.107-2.812 0-1.34.702-1.997.95-2.259.248-.261.545-.327.727-.327.182 0 .364.005.52.012.162.007.38-.062.593.45.213.514.728 1.777.79 1.902.063.125.104.27.02.437-.083.167-.125.27-.25.416-.124.146-.26.326-.37.438-.124.124-.254.26-.11.51.144.25.639 1.053 1.371 1.704.94.838 1.733 1.097 1.981 1.222.248.125.396.104.545-.062.15-.167.639-.74.809-.99.17-.25.34-.208.57-.124.23.083 1.455.686 1.705.811.25.125.416.187.478.291.063.104.063.604-.224 1.412z"/>
                </svg>
              </a>
              <span className="text-xs text-muted-foreground group-hover:text-foreground transition-colors">WhatsApp</span>
            </div>

            {/* YouTube */}
            <div className="flex flex-col items-center gap-1.5 group">
              <a 
                href="https://youtube.com" 
                target="_blank" 
                rel="noopener noreferrer"
                className="w-12 h-12 rounded-full border border-red-500/30 bg-red-500/5 flex items-center justify-center text-red-500 transition-all duration-300 hover:bg-red-500 hover:text-white hover:border-red-500 hover:shadow-[0_0_15px_rgba(239,68,68,0.45)] hover:scale-105 cursor-pointer"
                aria-label="YouTube"
              >
                <svg viewBox="0 0 24 24" className="w-5 h-5 fill-current">
                  <path d="M23.498 6.163a3.003 3.003 0 00-2.11-2.11C19.53 3.545 12 3.545 12 3.545s-7.53 0-9.388.508a3.003 3.003 0 00-2.11 2.11C0 8.017 0 12 0 12s0 3.983.502 5.837a3.003 3.003 0 002.11 2.11c1.858.508 9.388.508 9.388.508s7.53 0 9.388-.508a3.003 3.003 0 002.11-2.11C24 15.983 24 12 24 12s0-3.983-.502-5.837zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
                </svg>
              </a>
              <span className="text-xs text-muted-foreground group-hover:text-foreground transition-colors">YouTube</span>
            </div>
          </div>
        </div>

        {/* Semantic Navigation Section with Pure CSS Transitions (Zero Framer-Motion Overhead) */}
        <nav aria-label="Footer Navigation" className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-10 items-start">
          
          {/* Explore Section */}
          <div className="flex flex-col">
            <button 
              type="button"
              onClick={() => setActiveSection(exploreOpen ? null : 'explore')}
              className={cn(
                "w-full flex items-center justify-between p-5 rounded-2xl border transition-all duration-200 group text-left cursor-pointer",
                exploreOpen 
                  ? "border-amber-500 bg-amber-500/10 dark:bg-[#1b130e] shadow-[0_0_15px_rgba(245,158,11,0.15)]" 
                  : "border-amber-500/20 bg-amber-500/5 dark:bg-[#140e0b] hover:bg-amber-500/10 dark:hover:bg-[#1b130e] hover:border-amber-500/50 hover:shadow-[0_0_10px_rgba(245,158,11,0.08)]"
              )}
            >
              <div className="flex items-center gap-3.5">
                <Compass className={cn("w-6 h-6 text-amber-500 transition-transform duration-200", exploreOpen ? "scale-110 rotate-45" : "group-hover:scale-110")} />
                <span className="font-display text-lg font-bold text-amber-600 dark:text-amber-500">{l.explore}</span>
              </div>
              <ChevronDown className={cn("w-5 h-5 text-amber-500/60 transition-transform duration-200", exploreOpen ? "text-amber-500 rotate-180" : "group-hover:text-amber-500")} />
            </button>

            {exploreOpen && (
              <div className="mt-2.5 p-4 rounded-2xl border border-amber-500/15 bg-amber-500/5 dark:bg-[#140e0b]/60 shadow-inner animate-in fade-in-50 duration-200">
                <ul className="space-y-1" role="list">
                  {[
                    { label: l.home, href: "/", icon: <Home className="w-4 h-4" /> },
                    { label: l.bhajans, href: "/all-bhajans", icon: <Music className="w-4 h-4" /> },
                    { label: l.mantraJapa, href: "/meditation", icon: <span className="font-display text-xs font-semibold w-4 h-4 flex items-center justify-center border border-amber-500/30 rounded-full bg-amber-500/10 text-amber-600 dark:text-amber-500">ॐ</span> },
                    { label: l.aarti, href: "/live-aarti", icon: <Flame className="w-4 h-4" /> },
                    { label: l.panchang, href: "/panchang", icon: <Calendar className="w-4 h-4" /> },
                  ].map((item, idx) => (
                    <li key={idx}>
                      <Link 
                        to={item.href} 
                        onClick={() => setActiveSection(null)}
                        className="group flex items-center justify-between py-2.5 px-3 rounded-xl text-sm text-foreground/75 hover:text-foreground hover:bg-amber-500/8 transition-all"
                      >
                        <div className="flex items-center gap-3">
                          <span className="text-muted-foreground group-hover:text-amber-500 transition-colors">
                            {item.icon}
                          </span>
                          <span className="font-medium">{item.label}</span>
                        </div>
                        <ChevronRight className="w-4 h-4 text-muted-foreground/40 group-hover:text-amber-500 group-hover:translate-x-1 transition-all" />
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>

          {/* Community Section */}
          <div className="flex flex-col">
            <button 
              type="button"
              onClick={() => setActiveSection(communityOpen ? null : 'community')}
              className={cn(
                "w-full flex items-center justify-between p-5 rounded-2xl border transition-all duration-200 group text-left cursor-pointer",
                communityOpen 
                  ? "border-emerald-500 bg-emerald-500/10 dark:bg-[#0f1712] shadow-[0_0_15px_rgba(16,185,129,0.15)]" 
                  : "border-emerald-500/20 bg-emerald-500/5 dark:bg-[#0c120f] hover:bg-emerald-500/10 dark:hover:bg-[#0f1712] hover:border-emerald-500/50 hover:shadow-[0_0_10px_rgba(16,185,129,0.08)]"
              )}
            >
              <div className="flex items-center gap-3.5">
                <Users className={cn("w-6 h-6 text-emerald-600 dark:text-emerald-500 transition-transform duration-200", communityOpen ? "scale-110 rotate-6" : "group-hover:scale-110")} />
                <span className="font-display text-lg font-bold text-emerald-600 dark:text-emerald-500">{l.community}</span>
              </div>
              <ChevronDown className={cn("w-5 h-5 text-emerald-500/60 transition-transform duration-200", communityOpen ? "text-emerald-500 rotate-180" : "group-hover:text-emerald-500")} />
            </button>

            {communityOpen && (
              <div className="mt-2.5 p-4 rounded-2xl border border-emerald-500/15 bg-emerald-500/5 dark:bg-[#0c120f]/60 shadow-inner animate-in fade-in-50 duration-200">
                <ul className="space-y-1" role="list">
                  {[
                    { label: l.uploadBhajan, href: "/upload-bhajan", icon: <Upload className="w-4 h-4" /> },
                    { label: l.becomeArtist, href: "/upload-bhajan", icon: <Star className="w-4 h-4" /> },
                    { label: l.becomeVolunteer, href: "/about", icon: <Heart className="w-4 h-4" /> },
                    { label: l.sendSuggestions, href: "/account/support", icon: <MessageSquare className="w-4 h-4" /> },
                  ].map((item, idx) => (
                    <li key={idx}>
                      <Link 
                        to={item.href} 
                        onClick={() => setActiveSection(null)}
                        className="group flex items-center justify-between py-2.5 px-3 rounded-xl text-sm text-foreground/75 hover:text-foreground hover:bg-emerald-500/8 transition-all"
                      >
                        <div className="flex items-center gap-3">
                          <span className="text-muted-foreground group-hover:text-emerald-500 transition-colors">
                            {item.icon}
                          </span>
                          <span className="font-medium">{item.label}</span>
                        </div>
                        <ChevronRight className="w-4 h-4 text-muted-foreground/40 group-hover:text-emerald-500 group-hover:translate-x-1 transition-all" />
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>

          {/* Sadhana Section */}
          <div className="flex flex-col">
            <button 
              type="button"
              onClick={() => setActiveSection(sadhanaOpen ? null : 'sadhana')}
              className={cn(
                "w-full flex items-center justify-between p-5 rounded-2xl border transition-all duration-200 group text-left cursor-pointer",
                sadhanaOpen 
                  ? "border-purple-500 bg-purple-500/10 dark:bg-[#160f1b] shadow-[0_0_15px_rgba(168,85,247,0.15)]" 
                  : "border-purple-500/20 bg-purple-500/5 dark:bg-[#110c14] hover:bg-purple-500/10 dark:hover:bg-[#160f1b] hover:border-purple-500/50 hover:shadow-[0_0_10px_rgba(168,85,247,0.08)]"
              )}
            >
              <div className="flex items-center gap-3.5">
                <Flower2 className={cn("w-6 h-6 text-purple-600 dark:text-purple-500 transition-transform duration-200", sadhanaOpen ? "scale-110 rotate-12" : "group-hover:scale-110")} />
                <span className="font-display text-lg font-bold text-purple-600 dark:text-purple-500">{l.sadhana}</span>
              </div>
              <ChevronDown className={cn("w-5 h-5 text-purple-500/60 transition-transform duration-200", sadhanaOpen ? "text-purple-500 rotate-180" : "group-hover:text-purple-500")} />
            </button>

            {sadhanaOpen && (
              <div className="mt-2.5 p-4 rounded-2xl border border-purple-500/15 bg-purple-500/5 dark:bg-[#110c14]/60 shadow-inner animate-in fade-in-50 duration-200">
                <ul className="space-y-1" role="list">
                  {[
                    { label: l.meditationSadhana, href: "/meditation", icon: <Sparkles className="w-4 h-4" /> },
                    { label: l.mantraCollection, href: "/meditation", icon: <span className="font-display text-xs font-semibold w-4 h-4 flex items-center justify-center border border-purple-500/30 rounded-full bg-purple-500/10 text-purple-600 dark:text-purple-500">ॐ</span> },
                    { label: l.vratFestivals, href: "/panchang", icon: <Calendar className="w-4 h-4" /> },
                    { label: l.kathaDiscourse, href: "/blog", icon: <BookOpen className="w-4 h-4" /> },
                  ].map((item, idx) => (
                    <li key={idx}>
                      <Link 
                        to={item.href} 
                        onClick={() => setActiveSection(null)}
                        className="group flex items-center justify-between py-2.5 px-3 rounded-xl text-sm text-foreground/75 hover:text-foreground hover:bg-purple-500/8 transition-all"
                      >
                        <div className="flex items-center gap-3">
                          <span className="text-muted-foreground group-hover:text-purple-500 transition-colors">
                            {item.icon}
                          </span>
                          <span className="font-medium">{item.label}</span>
                        </div>
                        <ChevronRight className="w-4 h-4 text-muted-foreground/40 group-hover:text-purple-500 group-hover:translate-x-1 transition-all" />
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </nav>

        {/* Stats Row with Stable Non-Zero Geometry */}
        <div className="grid grid-cols-3 md:grid-cols-5 items-center justify-center gap-4 md:gap-6 py-6 border-t border-b border-primary/10 mb-10">
          {/* Stat 1: Bhajans */}
          <div className="flex flex-col items-center text-center col-start-1 row-start-1">
            <Headphones className="w-5 h-5 text-primary mb-1.5 opacity-80" />
            <span className="font-display font-bold text-foreground text-sm md:text-base">
              <span className="inline-block min-w-[3ch] text-center">{displayedBhajanCount.toLocaleString()}</span>+
            </span>
            <span className="text-xs text-muted-foreground font-medium">{l.bhajansStat}</span>
          </div>

          {/* Stat 2: Artists */}
          <div className="flex flex-col items-center text-center col-start-1 row-start-2 md:col-start-2 md:row-start-1">
            <Mic className="w-5 h-5 text-primary mb-1.5 opacity-80" />
            <span className="font-display font-bold text-foreground text-sm md:text-base">
              <span className="inline-block min-w-[2ch] text-center">{displayedArtistCount.toLocaleString()}</span>+
            </span>
            <span className="text-xs text-muted-foreground font-medium">{l.artistsStat}</span>
          </div>

          {/* Center: Om Mandala */}
          <div className="flex flex-col items-center justify-center col-start-2 row-start-1 row-span-2 md:col-start-3 md:row-span-1 md:row-start-1">
            <div className="relative flex items-center justify-center w-16 h-16 md:w-20 md:h-20">
              <div className="absolute inset-0 bg-primary/5 rounded-full blur-lg animate-pulse" />
              <img 
                src="/mandala-logo.png" 
                alt="Om Mandala" 
                width={80}
                height={80}
                loading="lazy"
                decoding="async"
                className="w-full h-full object-contain animate-spin-slow filter drop-shadow-[0_0_8px_rgba(217,119,6,0.35)] hover:scale-105 transition-transform duration-300 cursor-pointer" 
              />
            </div>
          </div>

          {/* Stat 3: Panchang */}
          <div className="flex flex-col items-center text-center col-start-3 row-start-1 md:col-start-4 md:row-start-1">
            <Calendar className="w-5 h-5 text-primary mb-1.5 opacity-80" />
            <span className="font-display font-bold text-foreground text-sm md:text-base">{l.dailyStat}</span>
            <span className="text-xs text-muted-foreground font-medium">{l.panchangStat}</span>
          </div>

          {/* Stat 4: Community Led */}
          <div className="flex flex-col items-center text-center col-start-3 row-start-2 md:col-start-5 md:row-start-1">
            <Users className="w-5 h-5 text-primary mb-1.5 opacity-80" />
            <span className="font-display font-bold text-foreground text-sm md:text-base">{l.communityLedStat}</span>
            <span className="text-xs text-muted-foreground font-medium">{l.drivenStat}</span>
          </div>
        </div>

        {/* Bottom Bar: Links and Copyright */}
        <div className="border-t border-primary/10 pt-8 flex flex-col items-center justify-center gap-3">
          <div className="flex flex-wrap items-center justify-center gap-x-4 gap-y-2 text-sm text-muted-foreground">
            <Link to="/privacy" className="hover:text-primary transition-colors flex items-center gap-1.5">
              <Shield className="w-4 h-4 text-[#7A2D28] dark:text-[#E8B15C]" />
              {l.privacyPolicy}
            </Link>
            <span className="text-primary/20">|</span>
            <Link to="/terms" className="hover:text-primary transition-colors">{l.termsOfService}</Link>
            <span className="text-primary/20">|</span>
            <Link to="/dmca" className="hover:text-primary transition-colors">{l.dmca}</Link>
            <span className="text-primary/20">|</span>
            <Link to="/privacy" className="hover:text-primary transition-colors">{l.copyright}</Link>
            <span className="text-primary/20">|</span>
            <Link to="/account/support" className="hover:text-primary transition-colors">{l.contactUs}</Link>
          </div>
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground/70 mt-1">
            <span>© 2026 Raghavam. {l.rightsReserved}</span>
            <Heart className="w-3.5 h-3.5 text-red-500 fill-current inline-block" />
          </div>
        </div>

      </div>
    </footer>
  );
}
