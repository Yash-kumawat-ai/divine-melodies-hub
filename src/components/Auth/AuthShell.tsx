import { ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { Sparkles } from 'lucide-react';
import dhyaanLogo from '@/assets/dhyaan-logo.png';

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

export default function AuthShell({ mode, children }: AuthShellProps) {
  const content = shellContent[mode];
  const sacredBackground = `linear-gradient(145deg,rgba(12,21,49,0.62) 0%,rgba(15,23,42,0.52) 35%,rgba(217,119,6,0.4) 100%), url('/auth-sacred-bg.jpg'), url(${dhyaanLogo})`;

  return (
    <div className="relative min-h-screen overflow-hidden bg-gradient-to-b from-slate-900 via-slate-950 to-slate-950 px-4 py-6 sm:py-10">
      <div className="pointer-events-none absolute -left-20 top-16 h-64 w-64 rounded-full bg-orange-500/10 blur-3xl" />
      <div className="pointer-events-none absolute -right-16 bottom-10 h-72 w-72 rounded-full bg-orange-500/5 blur-3xl" />

      <div className="relative mx-auto grid min-h-[92vh] w-full max-w-6xl overflow-hidden rounded-3xl border border-orange-200/60 bg-white/75 shadow-[0_28px_80px_-28px_rgba(146,64,14,0.35)] backdrop-blur-xl lg:grid-cols-[1.1fr_0.9fr]">
        <aside
          className="relative flex flex-col justify-between overflow-hidden p-8 text-orange-50 sm:p-10 lg:p-12"
          style={{
            backgroundImage: sacredBackground,
            backgroundSize: 'cover, cover, cover',
            backgroundPosition: 'center, center, center',
          }}
        >
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_15%_20%,rgba(255,255,255,0.22),transparent_35%),radial-gradient(circle_at_85%_80%,rgba(120,53,15,0.38),transparent_50%)]" />
          <div className="relative z-10">
            <p className="inline-flex items-center gap-2 rounded-full border border-white/35 bg-white/10 px-4 py-1 text-xs font-semibold uppercase tracking-[0.18em]">
              <Sparkles className="h-3.5 w-3.5" />
              {content.eyebrow}
            </p>
          </div>

          <div className="relative z-10 space-y-4">
            <h1 className="text-4xl font-semibold leading-tight sm:text-5xl">
              {content.heading}
            </h1>
            <p className="max-w-md text-base text-orange-100/95 sm:text-lg">
              {content.body}
            </p>
            <div className="grid max-w-md grid-cols-2 gap-3 pt-4 text-xs uppercase tracking-[0.14em] text-orange-100/90 sm:text-sm">
              <span className="rounded-xl border border-white/30 bg-white/10 px-3 py-2 text-center">Bhajan Uploads</span>
              <span className="rounded-xl border border-white/30 bg-white/10 px-3 py-2 text-center">AI Support</span>
              <span className="rounded-xl border border-white/30 bg-white/10 px-3 py-2 text-center">Secure Login</span>
              <span className="rounded-xl border border-white/30 bg-white/10 px-3 py-2 text-center">Community Share</span>
            </div>
          </div>

          <p className="relative z-10 text-xs font-medium uppercase tracking-[0.16em] text-orange-100/85">
            Crafted for chanting, lyrics, and timeless devotion.
          </p>
        </aside>

        <main className="relative flex items-center justify-center bg-gradient-to-b from-slate-900 via-slate-950 to-slate-950 p-5 sm:p-8 lg:p-10">
          <div className="w-full max-w-md rounded-2xl border border-orange-500/30 bg-slate-800/50 backdrop-blur-sm p-6 shadow-[0_18px_40px_-22px_rgba(249,115,22,0.3)] sm:p-7">
            {children}
            <div className="mt-6 border-t border-orange-500/20 pt-4 text-center text-xs text-slate-400">
              <p>By continuing, you agree to our sacred community guidelines.</p>
              <p className="mt-2">
                <Link className="font-semibold hover:text-orange-400" to="/">
                  Return to Home
                </Link>
              </p>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}