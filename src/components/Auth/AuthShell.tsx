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
    <div className="relative min-h-[100svh] overflow-hidden bg-[#FCF6E8] dark:bg-[#061323]">
      {/* Desktop wallpaper — covers the entire desktop site */}
      <img
        src={shivDesktop}
        alt=""
        className="absolute inset-0 hidden md:block h-full w-full object-cover z-0"
        style={{ objectPosition: '45% center' }}
        fetchpriority="high"
        loading="eager"
      />
      {/* Dark gradient overlay on the left to ensure high readability for login form */}
      <div className="pointer-events-none absolute inset-0 hidden md:block bg-gradient-to-r from-black/85 via-black/40 to-transparent z-0" />

      {/* Language Selector */}
      <div className="absolute right-4 top-4 z-30 sm:right-6 sm:top-6">
        <label className="sr-only" htmlFor="auth-language">
          {content.language}
        </label>
        <div className="flex items-center gap-2 rounded-full border border-[#EAD7C3] dark:border-[#E6C27A]/30 bg-[#FFF5EA]/90 dark:bg-[#0A1830]/80 px-3 py-2 text-[#E06D14] dark:text-[#E6C27A] shadow-lg shadow-black/5 dark:shadow-black/30 backdrop-blur-xl">
          <Languages className="h-4 w-4" />
          <select
            id="auth-language"
            value={language}
            onChange={(event) => setLanguage(event.target.value as typeof language)}
            className="bg-transparent text-xs font-semibold uppercase tracking-wide text-[#E06D14] dark:text-[#FFD98A] outline-none"
            aria-label={content.language}
          >
            {languageOptions.map((option) => (
              <option key={option.code} value={option.code} className="bg-white dark:bg-[#0A1830] text-[#3A2412] dark:text-white">
                {option.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Main Content Layout Grid */}
      <div className="relative z-10 flex min-h-[100svh] flex-col md:grid md:min-h-[100svh] md:grid-cols-2">
        {/* Left Column: Login card container */}
        <div className="relative order-2 mt-auto w-full px-4 pb-6 pt-0 md:order-1 md:mt-0 md:flex md:min-h-[100svh] md:items-center md:justify-center lg:bg-transparent md:px-10 md:py-10">
          <div className="pointer-events-none absolute inset-y-0 left-0 hidden w-1/2 bg-[radial-gradient(circle_at_25%_30%,rgba(230,194,122,0.07),transparent_50%)] md:block" />

          <div className="relative w-full max-w-md">
            <div className="relative -mt-10 overflow-hidden rounded-t-[1.75rem] rounded-b-2xl border border-[#EAD7C3] dark:border-[#E6C27A]/30 bg-[#FFFDFC]/90 dark:bg-[#0A1830]/80 p-6 shadow-[0_-16px_48px_rgba(95,72,38,0.06),0_24px_64px_-12px_rgba(95,72,38,0.08)] dark:shadow-[0_-16px_48px_rgba(0,0,0,0.45),0_24px_64px_-12px_rgba(0,0,0,0.55)] backdrop-blur-2xl sm:p-7 md:mt-0 md:rounded-2xl md:shadow-[0_24px_64px_-12px_rgba(95,72,38,0.08)] dark:shadow-[0_24px_64px_-12px_rgba(0,0,0,0.6)]">
              {/* Temple arch accent */}
              <div className="pointer-events-none absolute -top-px left-1/2 h-7 w-28 -translate-x-1/2 rounded-b-[1.75rem] border-b border-x border-[#EAD7C3] dark:border-[#E6C27A]/20 bg-[#FFFDFC]/95 dark:bg-[#0A1830]/90" />

              <OmSymbol className="mb-5" />
              {children}
              <div className="mt-6 border-t border-[#EAD7C3] dark:border-[#E6C27A]/15 pt-4 text-center text-xs text-[#543D2B]/85 dark:text-[#B5BFD0]">
                <p>{content.guideline}</p>
                <p className="mt-2">
                  <Link className="font-semibold text-[#E06D14] dark:text-[#E6C27A] hover:text-[#E06D14]/80 dark:hover:text-[#FFD98A]" to="/">
                    {content.home}
                  </Link>
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Transparent placeholder letting wallpaper show through on desktop */}
        <div className="relative order-1 h-[58svh] shrink-0 overflow-hidden md:order-2 md:sticky md:top-0 md:h-[100svh] md:min-h-[100svh] lg:bg-transparent">
          {/* Mobile wallpaper — only visible on mobile at the top */}
          <img
            src={shivMobile}
            alt=""
            className="absolute inset-0 h-full w-full object-cover object-center md:hidden"
            fetchpriority="high"
            loading="eager"
          />
          <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-black/30 via-black/10 to-[#061323]/95 md:hidden" />

          {/* Details & description layout on desktop overlay */}
          <div className="relative z-10 flex h-full flex-col justify-between p-6 sm:p-8 md:justify-end md:p-12 md:pb-14">
            <p className="inline-flex w-fit items-center gap-2 rounded-full border border-[#E6C27A]/30 bg-black/25 px-4 py-1 text-[10px] font-semibold uppercase tracking-[0.18em] text-[#E6C27A] backdrop-blur-md md:hidden">
              <Sparkles className="h-3.5 w-3.5" />
              {content.eyebrow}
            </p>

            {mode === 'signup' && (
              <div className="hidden md:block">
                <p className="inline-flex items-center gap-2 rounded-full border border-[#E6C27A]/30 bg-black/25 px-4 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-[#E6C27A] backdrop-blur-md">
                  <Sparkles className="h-3.5 w-3.5" />
                  {content.eyebrow}
                </p>
                <div className="mt-6 max-w-md space-y-4">
                  <h1 className="text-4xl font-semibold leading-tight text-white drop-shadow-lg sm:text-5xl">
                    {content.heading}
                  </h1>
                  <p className="text-base text-[#B5BFD0] sm:text-lg">{content.body}</p>
                  <div className="grid max-w-md grid-cols-2 gap-3 pt-2 text-xs uppercase tracking-[0.14em] text-[#B5BFD0] sm:text-sm">
                    <span className="rounded-xl border border-[#E6C27A]/25 bg-black/20 px-3 py-2 text-center backdrop-blur-sm">
                      Bhajan Uploads
                    </span>
                    <span className="rounded-xl border border-[#E6C27A]/25 bg-black/20 px-3 py-2 text-center backdrop-blur-sm">
                      AI Support
                    </span>
                    <span className="rounded-xl border border-[#E6C27A]/25 bg-black/20 px-3 py-2 text-center backdrop-blur-sm">
                      Secure Login
                    </span>
                    <span className="rounded-xl border border-[#E6C27A]/25 bg-black/20 px-3 py-2 text-center backdrop-blur-sm">
                      Community Share
                    </span>
                  </div>
                </div>
                <p className="mt-8 text-xs font-medium uppercase tracking-[0.16em] text-[#B5BFD0]/80">
                  Crafted for chanting, lyrics, and timeless devotion.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
