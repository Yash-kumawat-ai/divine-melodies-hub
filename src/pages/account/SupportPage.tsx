import { Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, HelpCircle, Mail, Info } from 'lucide-react';
import { useLanguage } from '@/hooks/useLanguage';

export default function SupportPage() {
  const { t } = useLanguage();
  const navigate = useNavigate();

  return (
    <div className="container mx-auto max-w-lg px-4 py-4 pb-24 md:pb-8">
      <div className="mb-6 flex items-center gap-3">
        <button
          type="button"
          onClick={() => navigate(-1)}
          className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-border bg-card"
          aria-label={t('back')}
        >
          <ArrowLeft className="h-5 w-5" />
        </button>
        <div className="flex items-center gap-2">
          <HelpCircle className="h-5 w-5 text-primary" />
          <h1 className="font-display text-xl font-bold text-foreground">{t('supportTitle')}</h1>
        </div>
      </div>

      <p className="mb-6 text-sm leading-relaxed text-muted-foreground">{t('supportIntro')}</p>

      <div className="space-y-3">
        <a
          href="mailto:support@harikirtan.com"
          className="flex min-h-[52px] items-center gap-3 rounded-2xl border border-border/80 bg-card px-4 py-3 shadow-sm"
        >
          <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
            <Mail className="h-5 w-5" />
          </span>
          <span>
            <span className="block text-sm font-semibold text-foreground">{t('contactSupport')}</span>
            <span className="text-xs text-muted-foreground">support@harikirtan.com</span>
          </span>
        </a>

        <Link
          to="/about"
          className="flex min-h-[52px] items-center gap-3 rounded-2xl border border-border/80 bg-card px-4 py-3 shadow-sm"
        >
          <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
            <Info className="h-5 w-5" />
          </span>
          <span className="text-sm font-semibold text-foreground">{t('about')}</span>
        </Link>

        <Link
          to="/pricing"
          className="flex min-h-[52px] items-center gap-3 rounded-2xl border border-border/80 bg-card px-4 py-3 shadow-sm"
        >
          <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
            <HelpCircle className="h-5 w-5" />
          </span>
          <span className="text-sm font-semibold text-foreground">{t('viewPlans')}</span>
        </Link>
      </div>
    </div>
  );
}
