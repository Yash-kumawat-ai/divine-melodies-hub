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
      className={`mx-auto flex h-14 w-14 items-center justify-center rounded-full border border-[#E6C27A]/40 bg-[#0A1830]/60 shadow-[0_0_28px_rgba(255,217,138,0.2)] sm:h-16 sm:w-16 ${className}`}
    >
      <span className="font-display text-2xl text-[#FFD98A] drop-shadow-[0_0_12px_rgba(255,217,138,0.45)] sm:text-3xl">
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

  useEffect(() => {
    if (mode === 'login' || mode === 'signup') {
      setLanguage('hi');
    }
  }, [mode, setLanguage]);

  return (
    <div className="relative min-h-[100svh] overflow-hidden bg-[#061323]">
      <div className="absolute right-4 top-4 z-30 sm:right-6 sm:top-6">
        <label className="sr-only" htmlFor="auth-language">
          {content.language}
        </label>
        <div className="flex items-center gap-2 rounded-full border border-[#E6C27A]/30 bg-[#0A1830]/80 px-3 py-2 text-[#E6C27A] shadow-lg shadow-black/30 backdrop-blur-xl">
          <Languages className="h-4 w-4" />
          <select
            id="auth-language"
            value={language}
            onChange={(event) => setLanguage(event.target.value as typeof language)}
            className="bg-transparent text-xs font-semibold uppercase tracking-wide text-[#FFD98A] outline-none"
            aria-label={content.language}
          >
            {languageOptions.map((option) => (
              <option key={option.code} value={option.code} className="bg-[#0A1830] text-white">
                {option.label}
              </option>
            ))}
          </select>
        </div>
      </div>
      <div className="relative z-10 flex min-h-[100svh] flex-col lg:grid lg:min-h-[100svh] lg:grid-cols-2">
        {/* Login card — bottom floating on mobile, left panel on desktop */}
        <div className="relative order-2 mt-auto w-full px-4 pb-6 pt-0 lg:order-1 lg:mt-0 lg:flex lg:min-h-[100svh] lg:items-center lg:justify-center lg:bg-gradient-to-br lg:from-[#061323] lg:via-[#0A1830] lg:to-[#061323] lg:px-10 lg:py-10">
          <div className="pointer-events-none absolute inset-y-0 left-0 hidden w-1/2 bg-[radial-gradient(circle_at_25%_30%,rgba(230,194,122,0.07),transparent_50%)] lg:block" />

          <div className="relative w-full max-w-md">
            <div className="relative -mt-10 overflow-hidden rounded-t-[1.75rem] rounded-b-2xl border border-[#E6C27A]/30 bg-[#0A1830]/80 p-6 shadow-[0_-16px_48px_rgba(0,0,0,0.45),0_24px_64px_-12px_rgba(0,0,0,0.55)] backdrop-blur-2xl sm:p-7 lg:mt-0 lg:rounded-2xl lg:shadow-[0_24px_64px_-12px_rgba(0,0,0,0.6)]">
              {/* Temple arch accent */}
              <div className="pointer-events-none absolute -top-px left-1/2 h-7 w-28 -translate-x-1/2 rounded-b-[1.75rem] border-b border-x border-[#E6C27A]/20 bg-[#0A1830]/90" />

              <OmSymbol className="mb-5" />
              {children}
              <div className="mt-6 border-t border-[#E6C27A]/15 pt-4 text-center text-xs text-[#B5BFD0]">
                <p>{content.guideline}</p>
                <p className="mt-2">
                  <Link className="font-semibold text-[#E6C27A] hover:text-[#FFD98A]" to="/">
                    {content.home}
                  </Link>
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Artwork — top on mobile, full-bleed right panel on desktop */}
        <div className="relative order-1 h-[58svh] shrink-0 overflow-hidden lg:order-2 lg:sticky lg:top-0 lg:h-[100svh] lg:min-h-[100svh]">
          {/* Mobile wallpaper */}
          <img
            src={shivMobile}
            alt=""
            className="absolute inset-0 h-full w-full object-cover object-center lg:hidden"
            fetchPriority="high"
            loading="eager"
          />
          <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-black/30 via-black/10 to-[#061323]/95 lg:hidden" />

          {/* Desktop wallpaper — fills entire right column */}
          <img
            src={shivDesktop}
            alt=""
            className="absolute inset-0 hidden h-full w-full object-cover object-center lg:block"
            fetchPriority="high"
            loading="eager"
          />
          <div className="pointer-events-none absolute inset-0 hidden bg-gradient-to-l from-[#061323]/30 via-transparent to-transparent lg:block" />

          <div className="relative z-10 flex h-full flex-col justify-between p-6 sm:p-8 lg:justify-end lg:p-12 lg:pb-14">
            <p className="inline-flex w-fit items-center gap-2 rounded-full border border-[#E6C27A]/30 bg-black/25 px-4 py-1 text-[10px] font-semibold uppercase tracking-[0.18em] text-[#E6C27A] backdrop-blur-md lg:hidden">
              <Sparkles className="h-3.5 w-3.5" />
              {content.eyebrow}
            </p>

            {mode === 'signup' && (
              <div className="hidden lg:block">
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
