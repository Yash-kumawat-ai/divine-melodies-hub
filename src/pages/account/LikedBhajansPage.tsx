import { Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, Heart } from 'lucide-react';
import BhajanCard from '@/components/BhajanCard';
import { useLikedBhajans } from '@/hooks/useLikedBhajans';
import { useLanguage } from '@/hooks/useLanguage';
import { Button } from '@/components/ui/button';

export default function LikedBhajansPage() {
  const { user, likedBhajans } = useLikedBhajans();
  const { t } = useLanguage();
  const navigate = useNavigate();

  return (
    <div className="container mx-auto max-w-4xl px-4 py-4 pb-24 md:pb-8">
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
          <Heart className="h-5 w-5 fill-red-500 text-red-500" />
          <h1 className="font-display text-xl font-bold text-foreground">{t('likedBhajans')}</h1>
        </div>
      </div>

      {!user ? (
        <div className="rounded-2xl border border-dashed border-border p-8 text-center">
          <p className="text-muted-foreground">{t('signInToLike')}</p>
          <Button asChild className="mt-4 rounded-xl">
            <Link to="/auth/login">{t('login')}</Link>
          </Button>
        </div>
      ) : likedBhajans.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-border p-8 text-center">
          <p className="text-muted-foreground">{t('noLikedBhajans')}</p>
          <Button asChild variant="outline" className="mt-4 rounded-xl">
            <Link to="/all-bhajans">{t('browse')}</Link>
          </Button>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2">
          {likedBhajans.map((bhajan) => (
            <BhajanCard key={bhajan.id} bhajan={bhajan} />
          ))}
        </div>
      )}
    </div>
  );
}
