import { Link } from "react-router-dom";
import { LazyMotion, domAnimation, m } from "framer-motion";
import { deities } from "@/data/bhajans";
import { getDeityUrl } from "@/lib/deityUrls";
import { ChevronRight } from "lucide-react";
import { useLanguage } from "@/hooks/useLanguage";
import { useBhajanCounts } from "@/hooks/useBhajanCounts";

export default function DeityGrid() {
  const { t, language } = useLanguage();
  const { getDeityCount } = useBhajanCounts();
  const displayDeities = deities.slice(0, 4); // Show only first 4 deities
  
  return (
    <LazyMotion features={domAnimation}>
    <section className="py-16 px-4">
      <div className="container mx-auto max-w-6xl">
        <h2 className="font-display text-3xl md:text-4xl font-bold text-center mb-3 text-foreground">
          {t('browseByDeity')}
        </h2>
        <p className="text-center text-muted-foreground text-lg mb-10 hindi-text">
          {t('devotionalSongs')}
        </p>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
          {displayDeities.map((deity, i) => (
            <m.div
              key={deity.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.08, duration: 0.4 }}
            >
              <Link
                to={getDeityUrl(deity)}
                className="group block rounded-xl bg-card p-6 shadow-temple hover:shadow-lg transition-all duration-300 hover:-translate-y-1 text-center touch-target"
              >
                <div className="relative mx-auto mb-3 aspect-[4/5] w-full max-h-[11rem] overflow-hidden rounded-xl bg-muted sm:max-h-[12.5rem]">
                  {deity.imageUrl ? (
                    <img
                      src={deity.imageUrl}
                      alt={deity.name}
                      className="h-full w-full object-cover object-center"
                      width={240}
                      height={300}
                      loading="lazy"
                      decoding="async"
                    />
                  ) : (
                    <span className="flex h-full w-full items-center justify-center text-5xl">{deity.emoji}</span>
                  )}
                </div>
                <h3 className="font-display text-xl font-semibold text-foreground group-hover:text-primary transition-colors">
                  {language === 'hi' ? deity.nameHindi : deity.name}
                </h3>
                {language === 'hi' ? (
                  deity.name && <p className="text-sm text-muted-foreground mt-1">{deity.name}</p>
                ) : (
                  deity.nameHindi && <p className="hindi-text text-lg text-muted-foreground mt-1">{deity.nameHindi}</p>
                )}
                <p className="text-sm text-muted-foreground mt-2">{getDeityCount(deity.id)} {t('bhajansCount')}</p>
              </Link>
            </m.div>
          ))}
        </div>
        
        {/* See More Button */}
        {deities.length > 4 && (
          <div className="text-center mt-10">
            <Link
              to="/all-deities"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-primary text-primary-foreground font-medium hover:bg-primary/90 transition-all touch-target"
            >
              {t('allDeities')}
              <ChevronRight className="w-5 h-5" />
            </Link>
          </div>
        )}
      </div>
    </section>
    </LazyMotion>
  );
}
