import { ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { Sparkles } from 'lucide-react';
import shivDesktop from '@/pages/images/shiv_wallpaper.webp';
import shivMobile from '@/pages/images/shiv_vertical_wallpaper.webp';

interface AuthShellProps {
  mode: 'login' | 'signup';
  children: ReactNode;
}

const shellContent = {
  login: {
    eyebrow: 'Sacred Editorial',
    heading: 'Return To Your Riyaz',
    body: 'Continue your bhajan journey with your saved uploads, devotion tools, and AI guidance.',
  },
  signup: {
    eyebrow: 'Sacred Editorial',
    heading: 'Begin Your Sacred Account',
    body: 'Create your space to upload bhajans, organize deity collections, and share lyrics with the community.',
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
  const content = shellContent[mode];

  return (
    <div className="relative min-h-[100svh] overflow-hidden bg-[#061323]">
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
                <p>By continuing, you agree to our sacred community guidelines.</p>
                <p className="mt-2">
                  <Link className="font-semibold text-[#E6C27A] hover:text-[#FFD98A]" to="/">
                    Return to Home
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
