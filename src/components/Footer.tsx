import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Heart, Github, Twitter, Youtube, Instagram, Send } from 'lucide-react';
import { supabase } from '@/lib/supabaseClient';
import { newsletterSchema } from '@/lib/validation';
import { toast } from 'sonner';
import dhyaanLogo from '@/assets/dhyaan-logo.png';
import { useLanguage } from '@/hooks/useLanguage';

export default function Footer() {
  const [email, setEmail] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const { t } = useLanguage();

  const handleNewsletter = async (e: React.FormEvent) => {
    e.preventDefault();
    const result = newsletterSchema.safeParse({ email });
    if (!result.success) {
      toast.error(result.error.issues[0].message);
      return;
    }
    setSubmitting(true);
    try {
      const { error } = await (supabase as any)
        .from('newsletter_subscribers')
        .insert([{ email: result.data.email }]);
      if (error) {
        if (error.code === '23505') {
          toast.info('You are already subscribed!');
        } else {
          toast.error('Failed to subscribe. Please try again.');
        }
      } else {
        toast.success('Subscribed! You will receive updates.');
        setEmail('');
      }
    } catch {
      toast.error('Something went wrong.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <footer className="bg-brand-dark text-brand-cream/80 border-t border-brand-saffron/10 mt-0">
      <div className="container mx-auto max-w-6xl px-4 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10 mb-12">
          <div className="lg:col-span-2">
            <Link to="/" className="flex items-center gap-2 mb-4">
              <img src={dhyaanLogo} alt="Hari Kirtan" className="w-10 h-10" width={40} height={40} />
              <span className="font-display text-xl text-brand-cream">Hari Kirtan</span>
            </Link>
            <p className="text-sm leading-relaxed mb-6 max-w-xs">
              {t('footerDescription')}
            </p>
            <form onSubmit={handleNewsletter} className="flex gap-2 max-w-xs">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder={t('emailForUpdates')}
                className="flex-1 h-10 rounded-lg border border-brand-saffron/20 bg-brand-brown/50 px-3 text-sm text-brand-cream placeholder:text-brand-cream/40 focus:outline-none focus:ring-2 focus:ring-brand-saffron/50"
              />
              <button
                type="submit"
                disabled={submitting}
                className="h-10 px-3 rounded-lg bg-brand-saffron text-white text-sm font-medium hover:bg-brand-saffron/90 transition-colors disabled:opacity-50"
              >
                <Send className="w-4 h-4" />
              </button>
            </form>
          </div>

          <div>
            <h4 className="font-display text-sm font-bold text-brand-cream mb-4 uppercase tracking-wider">{t('explore')}</h4>
            <ul className="space-y-2.5 text-sm">
              <li><Link to="/" className="hover:text-brand-saffron transition-colors">{t('home')}</Link></li>
              <li><Link to="/all-bhajans" className="hover:text-brand-saffron transition-colors">{t('browse')}</Link></li>
              <li><Link to="/recent-bhajans" className="hover:text-brand-saffron transition-colors">{t('recent')}</Link></li>
              <li><Link to="/search" className="hover:text-brand-saffron transition-colors">{t('search')}</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="font-display text-sm font-bold text-brand-cream mb-4 uppercase tracking-wider">{t('community')}</h4>
            <ul className="space-y-2.5 text-sm">
              <li><Link to="/upload-bhajan" className="hover:text-brand-saffron transition-colors">{t('upload')}</Link></li>
              <li><Link to="/blog" className="hover:text-brand-saffron transition-colors">{t('blog')}</Link></li>
              <li><Link to="/about" className="hover:text-brand-saffron transition-colors">{t('about')}</Link></li>
              <li><Link to="/pricing" className="hover:text-brand-saffron transition-colors">{t('pricing')}</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="font-display text-sm font-bold text-brand-cream mb-4 uppercase tracking-wider">{t('legal')}</h4>
            <ul className="space-y-2.5 text-sm">
              <li><Link to="/privacy" className="hover:text-brand-saffron transition-colors">{t('privacyPolicy')}</Link></li>
              <li><Link to="/terms" className="hover:text-brand-saffron transition-colors">{t('termsOfService')}</Link></li>
              <li><Link to="/cookies" className="hover:text-brand-saffron transition-colors">{t('cookiePolicy')}</Link></li>
            </ul>
          </div>
        </div>

        <div className="border-t border-brand-saffron/10 pt-8 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-xs text-brand-cream/50">
            &copy; {new Date().getFullYear()} Hari Kirtan. {t('madeWithDevotion')}{' '}
            <Heart className="w-3 h-3 inline text-brand-saffron" />
          </p>
          <div className="flex items-center gap-4">
            <a href="https://twitter.com" target="_blank" rel="noopener noreferrer" aria-label="Twitter" className="text-brand-cream/40 hover:text-brand-saffron transition-colors">
              <Twitter className="w-4 h-4" />
            </a>
            <a href="https://youtube.com" target="_blank" rel="noopener noreferrer" aria-label="YouTube" className="text-brand-cream/40 hover:text-brand-saffron transition-colors">
              <Youtube className="w-4 h-4" />
            </a>
            <a href="https://instagram.com" target="_blank" rel="noopener noreferrer" aria-label="Instagram" className="text-brand-cream/40 hover:text-brand-saffron transition-colors">
              <Instagram className="w-4 h-4" />
            </a>
            <a href="https://github.com" target="_blank" rel="noopener noreferrer" aria-label="GitHub" className="text-brand-cream/40 hover:text-brand-saffron transition-colors">
              <Github className="w-4 h-4" />
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
