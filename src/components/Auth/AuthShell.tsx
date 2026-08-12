import { ReactNode, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Languages, Sparkles } from 'lucide-react';
import shivDesktop from '@/pages/images/shiv_wallpaper.webp';
import shivMobile from '@/pages/images/shiv_vertical_wallpaper.webp';
import { languageOptions } from '@/constants/languageOptions';
import { useLanguage } from '@/hooks/useLanguage';

interface AuthShellProps {
  mode: 'login' | 'signup';
  children: ReactNode;
}
const shellContent = {
  login: {
    eyebrow: 'Sacred Editorial',
    heading: 'Return To Your Riyaz',
    body: 'Continue your bhajan journey with your saved uploads, devotion tools, and AI guidance.',
    guideline: 'By continuing, you agree to our sacred community guidelines.',
    home: 'Return to Home',
    language: 'Language',
  },
  loginHi: {
    eyebrow: 'पवित्र अनुभव',
    heading: 'अपने रियाज में लौटें',
    body: 'अपने सेव किए गए अपलोड, भक्ति टूल्स और AI सहायता के साथ आगे बढ़ें।',
    guideline: 'आगे बढ़कर आप हमारी पवित्र समुदाय दिशानिर्देशों से सहमत होते हैं।',
    home: 'होम पर लौटें',
    language: 'भाषा',
  },
  signup: {
    eyebrow: 'Sacred Editorial',
    heading: 'Begin Your Sacred Account',
    body: 'Create your space to upload bhajans, organize deity collections, and share lyrics with the community.',
    guideline: 'By continuing, you agree to our sacred community guidelines.',
    home: 'Return to Home',
    language: 'Language',
  },
  signupHi: {
    eyebrow: 'पवित्र अनुभव',
    heading: 'अपना पवित्र खाता बनाएं',
    body: 'भजन अपलोड करने, देवता संग्रह व्यवस्थित करने और समुदाय के साथ गीत साझा करने के लिए अपना स्थान बनाएं।',
    guideline: 'आगे बढ़कर आप हमारी पवित्र समुदाय दिशानिर्देशों से सहमत होते हैं।',
    home: 'होम पर लौटें',
    language: 'भाषा',
  },
};

function OmSymbol({ className = '' }: { className?: string }) {
  return (
    <div
      className={`mx-auto flex h-14 w-14 items-center justify-center rounded-full border border-[#EAD7C3] dark:border-[#E6C27A]/40 bg-[#FFF5EA] dark:bg-[#0A1830]/60 shadow-[0_0_28px_rgba(224,109,20,0.1)] dark:shadow-[0_0_28px_rgba(255,217,138,0.2)] sm:h-16 sm:w-16 ${className}`}
    >
      <span className="font-display text-2xl text-[#E06D14] dark:text-[#FFD98A] drop-shadow-[0_0_12px_rgba(224,109,20,0.2)] dark:drop-shadow-[0_0_12px_rgba(255,217,138,0.45)] sm:text-3xl">
        ॐ
      </span>
    </div>
  );
}

export default function AuthShell({ mode, children }: AuthShellProps) {
  const { language, setLanguage } = useLanguage();
  const isHindi = language === 'hi';
  const content =
    mode === 'login' && isHindi
      ? shellContent.loginHi
      : mode === 'signup' && isHindi
        ? shellContent.signupHi
        : shellContent[mode];
  return (
    <div className="relative min-h-screen bg-[#FAF6EE] dark:bg-[#0C0907] text-stone-900 dark:text-stone-100 overflow-x-hidden">
      {/* Background ambient wallpaper */}
      <img
        src={shivDesktop}
        alt="Lord Shiva Sacred Wallpaper"
        className="absolute inset-0 hidden md:block h-full w-full object-cover object-center z-0 opacity-20 filter brightness-90 contrast-105 pointer-events-none"
        fetchpriority="high"
        loading="eager"
      />
      <div className="pointer-events-none absolute inset-0 hidden md:block bg-gradient-to-r from-[#FAF6EE] via-[#FAF6EE]/90 to-transparent dark:from-[#0C0907] dark:via-[#0C0907]/90 z-0" />

      {/* Language Selector */}
      <div className="absolute right-4 top-4 z-30 sm:right-8 sm:top-6">
        <label className="sr-only" htmlFor="auth-language">
          {content.language}
        </label>
        <div className="flex items-center gap-2 rounded-full border border-[#E8D8C4] dark:border-amber-500/30 bg-[#FAF0E4]/90 dark:bg-stone-900/90 px-3.5 py-2 text-[#651317] dark:text-amber-300 shadow-md backdrop-blur-md">
          <Languages className="h-4 w-4" />
          <select
            id="auth-language"
            value={language}
            onChange={(event) => setLanguage(event.target.value as typeof language)}
            className="bg-transparent text-xs font-extrabold uppercase tracking-wide text-[#651317] dark:text-amber-300 outline-none"
            aria-label={content.language}
          >
            {languageOptions.map((option) => (
              <option key={option.code} value={option.code} className="bg-white dark:bg-stone-900 text-stone-900 dark:text-white">
                {option.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Mobile Top Header Banner Image */}
      <div className="relative h-[22vh] sm:h-[26vh] w-full overflow-hidden md:hidden z-0">
        <img
          src={shivMobile}
          alt="Deity Wallpaper"
          className="w-full h-full object-cover object-top"
          fetchpriority="high"
          loading="eager"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-black/10 to-[#FAF6EE] dark:to-[#0C0907]" />
      </div>

      {/* Main Container Layout */}
      <div className="relative z-10 flex min-h-[calc(100vh-22vh)] md:min-h-screen flex-col justify-center px-4 pb-32 pt-2 md:py-12 md:px-8 max-w-6xl mx-auto">
        <div className="w-full md:grid md:grid-cols-12 md:gap-8 lg:gap-12 md:items-center">
          
          {/* Left Column: Form Card */}
          <div className="md:col-span-6 lg:col-span-6">
            <div className="relative overflow-hidden rounded-[2.25rem] border border-[#E8D8C4] dark:border-amber-500/25 bg-[#FFFDF8]/95 dark:bg-[#140F0A]/95 p-6 sm:p-9 shadow-2xl backdrop-blur-2xl">
              {/* Temple Arch Header Line */}
              <div className="pointer-events-none absolute top-0 left-1/2 h-1.5 w-32 -translate-x-1/2 rounded-b-full bg-[#651317] dark:bg-amber-400 opacity-90" />

              <OmSymbol className="mb-4 mt-1" />
              {children}
              
              <div className="mt-5 border-t border-[#E8D8C4] dark:border-stone-800 pt-4 text-center text-xs text-stone-500 dark:text-stone-400 font-medium space-y-2">
                <p>{content.guideline}</p>
                <p>
                  <Link className="font-extrabold text-[#651317] dark:text-amber-400 hover:underline" to="/">
                    ← {content.home}
                  </Link>
                </p>
              </div>
            </div>
          </div>

          {/* Right Column: Desktop Sacred Showcase Banner */}
          <div className="hidden md:flex md:col-span-6 lg:col-span-6 flex-col justify-between relative overflow-hidden rounded-[2.25rem] border border-[#E8D8C4]/80 dark:border-amber-500/20 bg-gradient-to-br from-[#3A0A0E] via-[#5C1317] to-[#200507] p-8 lg:p-10 text-white min-h-[560px] shadow-2xl">
            <img
              src={shivDesktop}
              alt="Deity Artwork"
              className="absolute inset-0 h-full w-full object-cover object-center opacity-30 filter contrast-110Mix-blend-overlay"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[#200507]/95 via-transparent to-[#3A0A0E]/40" />

            <div className="relative z-10">
              <span className="inline-flex items-center gap-2 rounded-full border border-amber-400/40 bg-black/40 px-4 py-1.5 text-xs font-extrabold tracking-widest uppercase text-amber-300 backdrop-blur-md shadow-xs">
                <Sparkles className="h-3.5 w-3.5" />
                {content.eyebrow}
              </span>
            </div>

            <div className="relative z-10 space-y-4 my-auto py-6">
              <h1 className="text-3xl lg:text-4xl font-black font-display leading-tight text-amber-100 drop-shadow-md">
                {content.heading}
              </h1>
              <p className="text-sm lg:text-base text-amber-200/80 font-medium leading-relaxed max-w-md">
                {content.body}
              </p>

              <div className="grid grid-cols-2 gap-2.5 pt-4 text-xs font-extrabold uppercase tracking-wider text-amber-200/90">
                <div className="rounded-xl border border-amber-400/20 bg-black/30 px-3.5 py-2.5 text-center backdrop-blur-md">
                  🎵 Bhajan Uploads
                </div>
                <div className="rounded-xl border border-amber-400/20 bg-black/30 px-3.5 py-2.5 text-center backdrop-blur-md">
                  🤖 Kirtan AI Assistance
                </div>
                <div className="rounded-xl border border-amber-400/20 bg-black/30 px-3.5 py-2.5 text-center backdrop-blur-md">
                  📿 Japa & Meditation
                </div>
                <div className="rounded-xl border border-amber-400/20 bg-black/30 px-3.5 py-2.5 text-center backdrop-blur-md">
                  🚩 Satsang Community
                </div>
              </div>
            </div>

            <div className="relative z-10 border-t border-amber-400/20 pt-4 text-[11px] font-bold uppercase tracking-widest text-amber-300/70">
              Divine Melodies Hub • Chanting, Lyrics & Timeless Devotion
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
