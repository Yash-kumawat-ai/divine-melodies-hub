import React from 'react';
import { Link } from 'react-router-dom';
import { 
  Heart, 
  Shield, 
  ChevronRight, 
  Headphones, 
  Mic, 
  Calendar, 
  Users, 
  Sparkles, 
  BookOpen,
  Music,
  Flame,
  Upload,
  Star,
  MessageSquare,
  Landmark,
} from 'lucide-react';
import { useLanguage } from '@/hooks/useLanguage';
import { useBhajanCounts } from '@/hooks/useBhajanCounts';
import { useHomePublicStats } from '@/hooks/useHomeDashboardQueries';
import raghavamLogo from '@/pages/images/svg/raghavam logo4 more better.svg';

export default function Footer() {
  const { language } = useLanguage();
  const isHi = language === 'hi';

  // Non-blocking cached stats with graceful static fallbacks
  const { totalCount: totalBhajanCount } = useBhajanCounts();
  const { data: publicStats } = useHomePublicStats();
  const displayedBhajanCount = totalBhajanCount > 0 ? totalBhajanCount : 1000;
  const displayedArtistCount = (publicStats?.artists ?? 0) > 0 ? publicStats!.artists : 50;

  return (
    <footer 
      className="bg-[#FFFDF8] dark:bg-[#0e0a07] text-[#32251E] dark:text-[#FAF6EE] border-t border-[#E8D8C4] dark:border-stone-800 pt-12 pb-[calc(5.5rem+env(safe-area-inset-bottom))] md:pb-12 relative overflow-hidden transition-colors duration-300 w-full"
      style={{ contentVisibility: 'auto', containIntrinsicSize: '0 450px' }}
    >
      {/* Decorative divine glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[120px] bg-amber-500/5 rounded-full blur-[100px] pointer-events-none" />

      <div className="container mx-auto max-w-6xl px-4 sm:px-6 relative z-10 space-y-12">
        
        {/* 1. Brand & Mission Header */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-6 pb-8 border-b border-[#E8D8C4]/60 dark:border-stone-800">
          <div className="flex items-center gap-4 text-center sm:text-left">
            <Link to="/" className="relative group shrink-0 inline-flex items-center justify-center">
              <div className="absolute inset-0 bg-amber-400/20 rounded-full blur-md group-hover:blur-lg transition-all" />
              <img
                src={raghavamLogo}
                alt="Raghavam Devotional Logo"
                width={56}
                height={56}
                loading="lazy"
                decoding="async"
                className="w-14 h-14 object-contain relative z-10 transition-transform group-hover:scale-105 filter drop-shadow-sm"
              />
            </Link>
            <div className="space-y-0.5">
              <Link to="/" className="inline-block">
                <h2 className="font-serif text-2xl sm:text-3xl font-bold tracking-tight text-[#4A1516] dark:text-[#E8B15C]">
                  राघवम् • Raghavam
                </h2>
              </Link>
              <p className="text-xs sm:text-sm text-[#786252] dark:text-stone-400 font-medium">
                {isHi
                  ? 'भक्ति, भजन एवं सनातन साधना का पावन डिजिटल संग्रह'
                  : 'Preserving Sacred Bhajans, Aarti & Sanatan Sadhana'}
              </p>
            </div>
          </div>

          {/* Social Devotional Hub */}
          <div className="flex items-center gap-3">
            {/* Telegram */}
            <a
              href="https://t.me/raghavam"
              target="_blank"
              rel="noopener noreferrer"
              className="w-10 h-10 rounded-full border border-sky-500/30 bg-sky-500/5 flex items-center justify-center text-sky-600 dark:text-sky-400 hover:bg-sky-500 hover:text-white transition-all hover:scale-105 shadow-2xs cursor-pointer"
              aria-label="Telegram"
              title="Telegram"
            >
              <svg viewBox="0 0 24 24" className="w-4 h-4 fill-current">
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm4.64 6.8c-.15 1.58-.8 5.42-1.13 7.19-.14.75-.42 1-.68 1.03-.58.05-1.02-.38-1.58-.75-.88-.58-1.38-.94-2.23-1.5-.99-.65-.35-1.01.22-1.59.15-.15 2.71-2.48 2.76-2.69.01-.03.01-.14-.07-.2-.08-.06-.19-.04-.27-.02-.11.02-1.93 1.23-5.46 3.62-.51.35-.98.53-1.39.51-.46-.01-1.33-.26-1.98-.47-.8-.26-1.43-.4-1.37-.85.03-.23.35-.47.96-.72 3.76-1.63 6.27-2.71 7.54-3.21 3.58-1.44 4.32-1.69 4.81-1.7.11 0 .35.03.5.15.13.1.17.25.19.35-.01.07.01.23.01.29z"/>
              </svg>
            </a>

            {/* WhatsApp */}
            <a
              href="https://chat.whatsapp.com/"
              target="_blank"
              rel="noopener noreferrer"
              className="w-10 h-10 rounded-full border border-emerald-500/30 bg-emerald-500/5 flex items-center justify-center text-emerald-600 dark:text-emerald-400 hover:bg-emerald-500 hover:text-white transition-all hover:scale-105 shadow-2xs cursor-pointer"
              aria-label="WhatsApp"
              title="WhatsApp"
            >
              <svg viewBox="0 0 24 24" className="w-4 h-4 fill-current">
                <path d="M12.004 0C5.378 0 .004 5.374.004 12.001c0 2.112.55 4.17 1.6 6.002L.004 24l6.168-1.616a11.93 11.93 0 005.832 1.517c6.627 0 12-5.374 12-12.001 0-3.203-1.247-6.212-3.513-8.479A11.916 11.916 0 0012.004 0zm6.59 16.994c-.287.808-1.437 1.482-1.996 1.57-.492.077-1.127.143-3.29-.757-2.764-1.15-4.524-3.957-4.66-4.14-.136-.182-1.107-1.472-1.107-2.812 0-1.34.702-1.997.95-2.259.248-.261.545-.327.727-.327.182 0 .364.005.52.012.162.007.38-.062.593.45.213.514.728 1.777.79 1.902.063.125.104.27.02.437-.083.167-.125.27-.25.416-.124.146-.26.326-.37.438-.124.124-.254.26-.11.51.144.25.639 1.053 1.371 1.704.94.838 1.733 1.097 1.981 1.222.248.125.396.104.545-.062.15-.167.639-.74.809-.99.17-.25.34-.208.57-.124.23.083 1.455.686 1.705.811.25.125.416.187.478.291.063.104.063.604-.224 1.412z"/>
              </svg>
            </a>

            {/* YouTube */}
            <a
              href="https://youtube.com"
              target="_blank"
              rel="noopener noreferrer"
              className="w-10 h-10 rounded-full border border-red-500/30 bg-red-500/5 flex items-center justify-center text-red-600 dark:text-red-400 hover:bg-red-500 hover:text-white transition-all hover:scale-105 shadow-2xs cursor-pointer"
              aria-label="YouTube"
              title="YouTube"
            >
              <svg viewBox="0 0 24 24" className="w-4 h-4 fill-current">
                <path d="M23.498 6.163a3.003 3.003 0 00-2.11-2.11C19.53 3.545 12 3.545 12 3.545s-7.53 0-9.388.508a3.003 3.003 0 00-2.11 2.11C0 8.017 0 12 0 12s0 3.983.502 5.837a3.003 3.003 0 002.11 2.11c1.858.508 9.388.508 9.388.508s7.53 0 9.388-.508a3.003 3.003 0 002.11-2.11C24 15.983 24 12 24 12s0-3.983-.502-5.837zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
              </svg>
            </a>
          </div>
        </div>

        {/* 2. Semantic 4-Column Navigation Grid (Clean, Lightweight Headings) */}
        <nav aria-label="Footer Navigation" className="grid grid-cols-2 md:grid-cols-4 gap-8 sm:gap-6">
          
          {/* Column 1: Bhajans & Music */}
          <div className="space-y-3">
            <h3 className="text-xs sm:text-sm font-bold uppercase tracking-wider text-[#651317] dark:text-amber-300 flex items-center gap-1.5">
              <Music className="w-4 h-4" />
              <span>{isHi ? 'भजन व संगीत' : 'Bhajans & Music'}</span>
            </h3>
            <ul className="space-y-2 text-xs sm:text-sm text-[#543D2B] dark:text-stone-300" role="list">
              <li>
                <Link to="/all-bhajans" className="hover:text-[#651317] dark:hover:text-amber-300 transition-colors flex items-center gap-1">
                  <ChevronRight className="w-3 h-3 opacity-40" />
                  <span>{isHi ? 'सभी भजन संग्रह' : 'All Bhajans'}</span>
                </Link>
              </li>
              <li>
                <Link to="/aarti" className="hover:text-[#651317] dark:hover:text-amber-300 transition-colors flex items-center gap-1">
                  <ChevronRight className="w-3 h-3 opacity-40" />
                  <span>{isHi ? 'आरती संग्रह' : 'Aarti Collection'}</span>
                </Link>
              </li>
              <li>
                <Link to="/chalisa" className="hover:text-[#651317] dark:hover:text-amber-300 transition-colors flex items-center gap-1">
                  <ChevronRight className="w-3 h-3 opacity-40" />
                  <span>{isHi ? 'चालीसा व पाठ' : 'Chalisa & Paath'}</span>
                </Link>
              </li>
              <li>
                <Link to="/recent-bhajans" className="hover:text-[#651317] dark:hover:text-amber-300 transition-colors flex items-center gap-1">
                  <ChevronRight className="w-3 h-3 opacity-40" />
                  <span>{isHi ? 'नवीन भजन' : 'Recent Bhajans'}</span>
                </Link>
              </li>
              <li>
                <Link to="/katha" className="hover:text-[#651317] dark:hover:text-amber-300 transition-colors flex items-center gap-1">
                  <ChevronRight className="w-3 h-3 opacity-40" />
                  <span>{isHi ? 'कथा व प्रवचन' : 'Katha & Discourse'}</span>
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 2: Sanatan Sadhana */}
          <div className="space-y-3">
            <h3 className="text-xs sm:text-sm font-bold uppercase tracking-wider text-[#651317] dark:text-amber-300 flex items-center gap-1.5">
              <Sparkles className="w-4 h-4" />
              <span>{isHi ? 'सनातन साधना' : 'Sanatan Sadhana'}</span>
            </h3>
            <ul className="space-y-2 text-xs sm:text-sm text-[#543D2B] dark:text-stone-300" role="list">
              <li>
                <Link to="/meditation" className="hover:text-[#651317] dark:hover:text-amber-300 transition-colors flex items-center gap-1">
                  <ChevronRight className="w-3 h-3 opacity-40" />
                  <span>{isHi ? 'मंत्र जाप साधना' : 'Mantra Japa'}</span>
                </Link>
              </li>
              <li>
                <Link to="/panchang" className="hover:text-[#651317] dark:hover:text-amber-300 transition-colors flex items-center gap-1">
                  <ChevronRight className="w-3 h-3 opacity-40" />
                  <span>{isHi ? 'दैनिक पंचांग व मुहूर्त' : 'Daily Panchang'}</span>
                </Link>
              </li>
              <li>
                <Link to="/temple" className="hover:text-[#651317] dark:hover:text-amber-300 transition-colors flex items-center gap-1">
                  <ChevronRight className="w-3 h-3 opacity-40" />
                  <span>{isHi ? 'मंदिर दर्शन' : 'Temple Darshan'}</span>
                </Link>
              </li>
              <li>
                <Link to="/wallpaper" className="hover:text-[#651317] dark:hover:text-amber-300 transition-colors flex items-center gap-1">
                  <ChevronRight className="w-3 h-3 opacity-40" />
                  <span>{isHi ? 'दिव्य वॉलपेपर' : 'Devotional Wallpapers'}</span>
                </Link>
              </li>
              <li>
                <Link to="/narad-ai" className="hover:text-[#651317] dark:hover:text-amber-300 transition-colors flex items-center gap-1">
                  <ChevronRight className="w-3 h-3 opacity-40" />
                  <span>{isHi ? 'नारद एआई सहायक' : 'Narad AI Assistant'}</span>
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 3: Satsang Community */}
          <div className="space-y-3">
            <h3 className="text-xs sm:text-sm font-bold uppercase tracking-wider text-[#651317] dark:text-amber-300 flex items-center gap-1.5">
              <Users className="w-4 h-4" />
              <span>{isHi ? 'सत्संग समुदाय' : 'Community'}</span>
            </h3>
            <ul className="space-y-2 text-xs sm:text-sm text-[#543D2B] dark:text-stone-300" role="list">
              <li>
                <Link to="/community" className="hover:text-[#651317] dark:hover:text-amber-300 transition-colors flex items-center gap-1">
                  <ChevronRight className="w-3 h-3 opacity-40" />
                  <span>{isHi ? 'सत्संग समूह' : 'Devotee Groups'}</span>
                </Link>
              </li>
              <li>
                <Link to="/upload-bhajan" className="hover:text-[#651317] dark:hover:text-amber-300 transition-colors flex items-center gap-1">
                  <ChevronRight className="w-3 h-3 opacity-40" />
                  <span>{isHi ? 'भजन अपलोड करें' : 'Upload Bhajan'}</span>
                </Link>
              </li>
              <li>
                <Link to="/about" className="hover:text-[#651317] dark:hover:text-amber-300 transition-colors flex items-center gap-1">
                  <ChevronRight className="w-3 h-3 opacity-40" />
                  <span>{isHi ? 'स्वयंसेवक बनें' : 'Volunteer'}</span>
                </Link>
              </li>
              <li>
                <Link to="/poster-maker" className="hover:text-[#651317] dark:hover:text-amber-300 transition-colors flex items-center gap-1">
                  <ChevronRight className="w-3 h-3 opacity-40" />
                  <span>{isHi ? 'पोस्टर मेकर' : 'Poster Maker'}</span>
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 4: Trust & Policies */}
          <div className="space-y-3">
            <h3 className="text-xs sm:text-sm font-bold uppercase tracking-wider text-[#651317] dark:text-amber-300 flex items-center gap-1.5">
              <Shield className="w-4 h-4" />
              <span>{isHi ? 'संस्थान व नीतियां' : 'Trust & Legal'}</span>
            </h3>
            <ul className="space-y-2 text-xs sm:text-sm text-[#543D2B] dark:text-stone-300" role="list">
              <li>
                <Link to="/about" className="hover:text-[#651317] dark:hover:text-amber-300 transition-colors flex items-center gap-1">
                  <ChevronRight className="w-3 h-3 opacity-40" />
                  <span>{isHi ? 'हमारे बारे में' : 'About Us'}</span>
                </Link>
              </li>
              <li>
                <Link to="/privacy" className="hover:text-[#651317] dark:hover:text-amber-300 transition-colors flex items-center gap-1">
                  <ChevronRight className="w-3 h-3 opacity-40" />
                  <span>{isHi ? 'गोपनीयता नीति' : 'Privacy Policy'}</span>
                </Link>
              </li>
              <li>
                <Link to="/terms" className="hover:text-[#651317] dark:hover:text-amber-300 transition-colors flex items-center gap-1">
                  <ChevronRight className="w-3 h-3 opacity-40" />
                  <span>{isHi ? 'सेवा की शर्तें' : 'Terms of Service'}</span>
                </Link>
              </li>
              <li>
                <Link to="/dmca" className="hover:text-[#651317] dark:hover:text-amber-300 transition-colors flex items-center gap-1">
                  <ChevronRight className="w-3 h-3 opacity-40" />
                  <span>{isHi ? 'कॉपीराइट एवं DMCA' : 'DMCA & Copyright'}</span>
                </Link>
              </li>
              <li>
                <Link to="/account/support" className="hover:text-[#651317] dark:hover:text-amber-300 transition-colors flex items-center gap-1">
                  <ChevronRight className="w-3 h-3 opacity-40" />
                  <span>{isHi ? 'सहायता केंद्र' : 'Support & Contact'}</span>
                </Link>
              </li>
            </ul>
          </div>

        </nav>

        {/* 3. Devotional Stats Strip */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 p-4 rounded-2xl bg-[#FAF2E8]/60 dark:bg-stone-900/60 border border-[#E8D8C4] dark:border-stone-800 text-center">
          <div className="space-y-0.5">
            <p className="font-serif text-lg sm:text-xl font-bold text-[#651317] dark:text-amber-300">
              {displayedBhajanCount.toLocaleString()}+
            </p>
            <p className="text-[11px] font-semibold text-[#786252] dark:text-stone-400">
              {isHi ? 'भक्ति भजन' : 'Sacred Bhajans'}
            </p>
          </div>

          <div className="space-y-0.5">
            <p className="font-serif text-lg sm:text-xl font-bold text-[#651317] dark:text-amber-300">
              {displayedArtistCount.toLocaleString()}+
            </p>
            <p className="text-[11px] font-semibold text-[#786252] dark:text-stone-400">
              {isHi ? 'भजन गायक' : 'Vocalists & Artists'}
            </p>
          </div>

          <div className="space-y-0.5">
            <p className="font-serif text-lg sm:text-xl font-bold text-[#651317] dark:text-amber-300">
              {isHi ? 'दैनिक' : 'Daily'}
            </p>
            <p className="text-[11px] font-semibold text-[#786252] dark:text-stone-400">
              {isHi ? 'पंचांग व मुहूर्त' : 'Panchang & Muhurat'}
            </p>
          </div>

          <div className="space-y-0.5">
            <p className="font-serif text-lg sm:text-xl font-bold text-[#651317] dark:text-amber-300">
              100%
            </p>
            <p className="text-[11px] font-semibold text-[#786252] dark:text-stone-400">
              {isHi ? 'भक्त समुदाय संचालित' : 'Community Driven'}
            </p>
          </div>
        </div>

        {/* 4. Copyright & Trust Bottom Bar */}
        <div className="pt-4 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-[#786252] dark:text-stone-400 border-t border-[#E8D8C4]/60 dark:border-stone-800">
          <p>© 2026 Raghavam. {isHi ? 'सर्वाधिकार सुरक्षित।' : 'All rights reserved.'}</p>
          <div className="flex items-center gap-1 text-[11px]">
            <span>{isHi ? 'भक्ति एवं प्रेम से निर्मित' : 'Crafted with Devotion'}</span>
            <Heart className="w-3.5 h-3.5 text-rose-500 fill-rose-500" />
          </div>
        </div>

      </div>
    </footer>
  );
}
