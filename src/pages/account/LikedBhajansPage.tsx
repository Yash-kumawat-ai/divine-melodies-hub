import { Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, Heart, Loader2 } from 'lucide-react';
import BhajanCard from '@/components/BhajanCard';
import { useLikedBhajans } from '@/hooks/useLikedBhajans';
import { useLanguage } from '@/hooks/useLanguage';
import { Button } from '@/components/ui/button';

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
        <div className="flex items-center gap-2">
          <Heart className="h-6 w-6 fill-red-500 text-red-500" />
          <h1 className="font-serif text-2xl md:text-3xl font-bold text-foreground">
            {isHi ? "पसंदीदा भजन" : t('likedBhajans')}
          </h1>
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
        <div className="flex items-center justify-center py-20">
          <Loader2 className="w-8 h-8 animate-spin text-[#5C1D0C] dark:text-[#E8B15C]" />
        </div>
      ) : likedBhajans.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-border p-12 text-center max-w-md mx-auto bg-card">
          <Heart className="w-12 h-12 text-muted-foreground/30 mx-auto mb-3" />
          <h3 className="text-lg font-bold text-foreground mb-1">
            {isHi ? "कोई पसंदीदा भजन नहीं" : "No Liked Bhajans"}
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
                onCardClick={(b) => navigate(`/bhajan/${b.slug}`)}
              />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
