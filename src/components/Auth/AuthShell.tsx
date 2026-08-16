import { ReactNode, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Languages, ChevronDown, X, LogIn, UserPlus } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import ramJiLoginWebp from '@/pages/images/ram ji login.webp';
import ramJiLoginHdWebp from '@/pages/images/ram_ji_login_hd.webp';
import omSvg from '@/pages/images/om.svg';
import { languageOptions } from '@/constants/languageOptions';
import { useLanguage } from '@/hooks/useLanguage';

interface AuthShellProps {
  mode: 'login' | 'signup';
  children: ReactNode;
}

const shellContent = {
  login: {
    title: 'प्रभु के चरणों में आपका स्वागत है',
    subtitle: 'जहाँ हर नाम में भक्ति है, हर भजन में शांति है।',
    loginBtn: 'लॉग इन',
    signupBtn: 'साइन अप',
    guideline: 'आगे बढ़कर आप राघवम् के सेवा नियमों एवं पावन नीतियों से सहमत होते हैं।',
    home: 'मुख्य पृष्ठ पर लौटें',
    language: 'भाषा',
  },
  loginEn: {
    title: 'Welcome to the Feet of the Divine',
    subtitle: 'Where every name carries devotion, and every bhajan brings peace.',
    loginBtn: 'Log In',
    signupBtn: 'Sign Up',
    guideline: 'By continuing, you agree to Raghavam’s terms and privacy policy.',
    home: 'Return to Home',
    language: 'Language',
  },
  signup: {
    title: 'अपनी साधना यात्रा आरंभ करें',
    subtitle: 'जहाँ हर नाम में भक्ति है, हर भजन में शांति है।',
    loginBtn: 'लॉग इन',
    signupBtn: 'साइन अप',
    guideline: 'आगे बढ़कर आप राघवम् के सेवा नियमों एवं पावन नीतियों से सहमत होते हैं।',
    home: 'मुख्य पृष्ठ पर लौटें',
    language: 'भाषा',
  },
  signupEn: {
    title: 'Begin Your Sadhana Journey',
    subtitle: 'Where every name carries devotion, and every bhajan brings peace.',
    loginBtn: 'Log In',
    signupBtn: 'Sign Up',
    guideline: 'By continuing, you agree to Raghavam’s terms and privacy policy.',
    home: 'Return to Home',
    language: 'Language',
  },
};

function OmSymbol({ className = '' }: { className?: string }) {
  return (
    <div className={`mx-auto flex items-center justify-center ${className}`}>
      <img
        src={omSvg}
        alt="Om Divine Symbol"
        className="h-10 w-10 sm:h-12 sm:w-12 object-contain"
      />
    </div>
  );
}

export default function AuthShell({ mode, children }: AuthShellProps) {
  const { language, setLanguage } = useLanguage();
  const navigate = useNavigate();
  const [isMobileModalOpen, setIsMobileModalOpen] = useState(true);
  const isHindi = language === 'hi';
  const content = isHindi
    ? mode === 'login' ? shellContent.login : shellContent.signup
    : mode === 'login' ? shellContent.loginEn : shellContent.signupEn;

  const handleOpenLogin = () => {
    if (mode !== 'login') {
      navigate('/auth/login');
    }
    setIsMobileModalOpen(true);
  };

  const handleOpenSignup = () => {
    if (mode !== 'signup') {
      navigate('/auth/signup');
    }
    setIsMobileModalOpen(true);
  };

  return (
    <div className="relative min-h-screen bg-[#F6EFE5] dark:bg-[#0C0907] text-stone-900 dark:text-stone-100 overflow-x-hidden selection:bg-[#6B1D16] selection:text-white">
      
      {/* ================= DESKTOP BACKGROUND ARTWORK (FULL COVER - ZERO WHITESPACE) ================= */}
      <div className="pointer-events-none fixed inset-0 hidden md:block z-0 overflow-hidden bg-[#F6EFE5] dark:bg-[#0C0907]">
        {/* Full Desktop Cover Image: ram ji login.webp (100% full screen cover with zero top/bottom whitespace) */}
        <img
          src={ramJiLoginWebp}
          alt="Lord Ram Devotional Desktop Cover"
          className="absolute inset-0 h-full w-full object-cover object-top md:object-[center_top] filter brightness-100 contrast-100"
          fetchpriority="high"
          loading="eager"
        />
      </div>

      {/* ================= FLOATING LANGUAGE SELECTOR ================= */}
      <div className="absolute right-4 top-4 z-40 sm:right-8 sm:top-6">
        <label className="sr-only" htmlFor="auth-language">
          {content.language}
        </label>
        <div className="relative flex items-center rounded-full border border-[#E2D6C7] dark:border-amber-500/30 bg-white dark:bg-stone-900 px-3.5 py-1.5 text-[#5C1615] dark:text-amber-300 shadow-md transition-all hover:border-[#6B1D16]/50">
          <Languages className="h-4 w-4 shrink-0 text-[#6B1D16] dark:text-amber-400 mr-1.5" />
          <select
            id="auth-language"
            value={language}
            onChange={(event) => setLanguage(event.target.value as typeof language)}
            className="bg-transparent text-xs font-bold tracking-wide text-[#5C1615] dark:text-amber-300 outline-none cursor-pointer pr-4 appearance-none"
            aria-label={content.language}
          >
            {languageOptions.map((option) => (
              <option key={option.code} value={option.code} className="bg-white dark:bg-stone-900 text-stone-900 dark:text-white font-medium">
                {option.label}
              </option>
            ))}
          </select>
          <ChevronDown className="h-3.5 w-3.5 shrink-0 text-[#6B1D16] dark:text-amber-400 absolute right-3 pointer-events-none" />
        </div>
      </div>

      {/* ================= DESKTOP LAYOUT (MD & UP) ================= */}
      {/* Positioned on Left side with optimal width auth card */}
      <div className="hidden md:flex relative z-10 min-h-screen flex-col justify-center items-start px-6 lg:px-14 xl:pl-20 max-w-7xl mx-auto w-full py-6 md:py-10">
        <div className="w-full max-w-[350px] md:max-w-[440px] lg:max-w-[460px]">
          
          {/* Simple Solid White Auth Card */}
          <div className="relative overflow-hidden rounded-[1.75rem] border border-[#E2D6C7] dark:border-stone-800 bg-white dark:bg-[#140F0A] p-5 sm:p-6 md:p-7 shadow-2xl">
            {/* Temple Arch Header Top Bar */}
            <div className="pointer-events-none absolute top-0 left-1/2 h-1.2 w-20 -translate-x-1/2 rounded-b-full bg-[#6B1D16] dark:bg-amber-400 opacity-90" />

            <OmSymbol className="mb-3 mt-0.5" />
            {children}
            
            {/* Footer Terms & Navigation */}
            <div className="mt-3.5 border-t border-[#E2D6C7]/80 dark:border-stone-800/80 pt-3 text-center text-xs text-[#7A6455] dark:text-stone-400 font-medium space-y-1">
              <p className="leading-snug text-[10.5px]">{content.guideline}</p>
              <p>
                <Link className="font-bold text-[#6B1D16] dark:text-amber-400 hover:underline inline-flex items-center gap-1 transition-colors text-[11.5px]" to="/">
                  ← {content.home}
                </Link>
              </p>
            </div>
          </div>

        </div>
      </div>

      {/* ================= MOBILE LAYOUT (SM & BELOW) ================= */}
      {/* 1. Fully Fixed Full-Screen Ram Ji Image background */}
      <div className="md:hidden fixed inset-0 z-0 overflow-hidden bg-black">
        <img
          src={ramJiLoginHdWebp}
          alt="Lord Ram Mobile Devotional Artwork"
          className="w-full h-full object-cover object-[center_top] filter brightness-[0.98]"
          fetchpriority="high"
          loading="eager"
        />
        {/* Ethereal dark gradient overlay for text readability */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/30 to-black/90" />

        {/* Floating Mobile Welcome View (visible when modal sheet is closed) */}
        <div className="absolute inset-0 z-10 flex flex-col justify-end p-6 pb-12 text-center text-white">
          <div className="mb-6 space-y-2 max-w-sm mx-auto">
            <div className="mx-auto flex items-center justify-center mb-3">
              <img
                src="/images/om white.svg"
                alt="Om Divine Symbol"
                className="h-10 w-10 sm:h-12 sm:w-12 object-contain drop-shadow-md"
              />
            </div>
            <h1 className="font-serif font-black text-2xl sm:text-3xl text-amber-100 drop-shadow-md leading-snug">
              {content.title}
            </h1>
            <p className="text-xs sm:text-sm text-amber-200/90 font-medium leading-relaxed drop-shadow-xs">
              {content.subtitle}
            </p>
          </div>

          {/* Mobile Action Buttons: Simple Labels "लॉग इन" and "साइन अप" */}
          <div className="flex flex-col gap-3 max-w-xs mx-auto w-full">
            <button
              type="button"
              onClick={handleOpenLogin}
              className="w-full h-12 rounded-2xl bg-gradient-to-r from-[#96281D] to-[#7A1F17] text-white font-extrabold text-base shadow-lg flex items-center justify-center gap-2 border border-amber-400/30 active:scale-95 transition-all"
            >
              <LogIn className="w-4.5 h-4.5" />
              <span>{isHindi ? 'लॉग इन' : 'Log In'}</span>
            </button>

            <button
              type="button"
              onClick={handleOpenSignup}
              className="w-full h-12 rounded-2xl bg-white/20 backdrop-blur-md text-white border border-white/40 font-extrabold text-base shadow-md flex items-center justify-center gap-2 active:scale-95 transition-all"
            >
              <UserPlus className="w-4.5 h-4.5 text-amber-300" />
              <span>{isHindi ? 'साइन अप' : 'Sign Up'}</span>
            </button>

            <Link to="/" className="text-xs text-amber-200/80 font-semibold pt-2 hover:underline">
              ← {content.home}
            </Link>
          </div>
        </div>
      </div>

      {/* 2. Interactive Mobile Pop-up Sheet / Modal */}
      <AnimatePresence>
        {isMobileModalOpen && (
          <div className="md:hidden fixed inset-0 z-50 flex items-end justify-center">
            {/* Backdrop click to dismiss modal */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsMobileModalOpen(false)}
              className="absolute inset-0 bg-black/60"
            />

            {/* Solid White Pop-up Sheet Container */}
            <motion.div
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 220 }}
              className="relative z-10 w-full max-h-[86vh] overflow-y-auto rounded-t-[2.5rem] border-t border-[#E2D6C7] dark:border-stone-800 bg-white dark:bg-[#140F0A] p-5 sm:p-6 shadow-[0_-16px_50px_rgba(0,0,0,0.5)]"
            >
              {/* Drag Handle & Close Button Header */}
              <div className="flex items-center justify-between pb-3 mb-2 border-b border-[#E2D6C7]/60 dark:border-stone-800">
                <div className="w-12 h-1 bg-stone-300 dark:bg-stone-700 rounded-full mx-auto" />
                <button
                  type="button"
                  onClick={() => setIsMobileModalOpen(false)}
                  className="absolute right-4 top-4 p-1.5 rounded-full bg-stone-100 dark:bg-stone-800 text-stone-600 dark:text-stone-300 hover:bg-stone-200 transition-colors"
                  aria-label="Close form"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <OmSymbol className="mb-3" />
              {children}

              {/* Footer Guidelines */}
              <div className="mt-4 border-t border-[#E2D6C7]/80 dark:border-stone-800/80 pt-3.5 text-center text-xs text-[#7A6455] dark:text-stone-400 font-medium space-y-1.5">
                <p className="leading-relaxed text-[11px]">{content.guideline}</p>
                <button
                  type="button"
                  onClick={() => setIsMobileModalOpen(false)}
                  className="font-bold text-[#6B1D16] dark:text-amber-400 hover:underline text-xs"
                >
                  ← प्रभु दर्शन चित्र पर लौटें
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}






