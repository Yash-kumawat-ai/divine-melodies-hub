import { Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, Heart, Loader2 } from 'lucide-react';
import BhajanCard from '@/components/BhajanCard';
import { useLikedBhajans } from '@/hooks/useLikedBhajans';
import { useLanguage } from '@/hooks/useLanguage';
import { Button } from '@/components/ui/button';
import { getContentUrl } from '@/lib/contentUrls';

export default function LikedBhajansPage() {
  const { user, likedBhajans, loading } = useLikedBhajans();
  const { t, language } = useLanguage();
  const isHi = language === 'hi';
  const navigate = useNavigate();

  return (
    <div className="container mx-auto max-w-6xl px-4 py-6 pb-24 md:pb-12">
      <div className="mb-6 flex items-center gap-3">
        <button
          type="button"
          onClick={() => navigate(-1)}
          className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-border bg-card hover:bg-accent transition-colors cursor-pointer"
          aria-label={t('back')}
        >
          <ArrowLeft className="h-5 w-5 text-foreground" />
        </button>
        <div>
          <h1 className="font-display text-2xl font-bold text-foreground">
            {isHi ? "मेरे पसंदीदा भजन" : t('likedBhajans')}
          </h1>
          <p className="text-xs text-muted-foreground">
            {likedBhajans.length} {isHi ? "भजन सहेजे गए" : t('savedToFavorites')}
          </p>
        </div>
      </div>

      {!user ? (
        <div className="rounded-2xl border border-dashed border-border p-12 text-center max-w-md mx-auto bg-card">
          <Heart className="w-12 h-12 text-red-500/40 mx-auto mb-3" />
          <p className="text-sm font-semibold text-muted-foreground">{t('signInToLike')}</p>
          <Button asChild className="mt-4 rounded-xl bg-[#5C1D0C] dark:bg-[#E8B15C] text-white dark:text-black font-bold">
            <Link to="/auth/login">{t('login')}</Link>
          </Button>
        </div>
      ) : loading ? (
        <div className="flex items-center justify-center py-16">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      ) : likedBhajans.length === 0 ? (
        <div className="text-center py-16 bg-card border rounded-2xl p-8 max-w-md mx-auto">
          <div className="w-12 h-12 rounded-full bg-red-100 dark:bg-red-950/40 text-red-500 flex items-center justify-center mx-auto mb-3">
            <Heart className="w-6 h-6" />
          </div>
          <h3 className="text-lg font-bold text-foreground mb-1">
            {isHi ? "कोई पसंदीदा भजन नहीं" : t('noLikedBhajans')}
          </h3>
          <p className="text-xs text-muted-foreground mb-4">
            {isHi ? "किसी भी भजन पर दिल ❤️ का बटन दबाकर यहाँ सहेजें" : t('noLikedBhajans')}
          </p>
          <Button asChild variant="outline" className="rounded-xl border-[#5C1D0C] text-[#5C1D0C] dark:border-[#E8B15C] dark:text-[#E8B15C]">
            <Link to="/all-bhajans">{isHi ? "भजन खोजें" : t('browse')}</Link>
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
          {likedBhajans.map((bhajan) => (
            <div key={bhajan.id} className="min-w-0">
              <BhajanCard
                bhajan={bhajan}
                onCardClick={(b) => navigate(getContentUrl(b))}
              />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
