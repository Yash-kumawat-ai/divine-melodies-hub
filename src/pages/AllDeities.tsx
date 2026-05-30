import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { useDeities } from "@/hooks/useDeities";
import { generateDeitySlug } from "@/lib/slugUtils";
import { Loader2 } from "lucide-react";
import { useLanguage } from "@/hooks/useLanguage";
import { useBhajanCounts } from "@/hooks/useBhajanCounts";

export default function AllDeities() {
  const { deities: allDeities, loading } = useDeities();
  const { t } = useLanguage();
  const { getDeityCount } = useBhajanCounts();

  return (
    <div className="min-h-screen bg-background">
      <section className="py-12 px-4">
        <div className="container mx-auto max-w-6xl">
          <motion.div className="text-center mb-12">
            <h1 className="font-display text-4xl md:text-5xl font-bold text-foreground mb-3">
              {t('allDeities')}
            </h1>
            <p className="text-lg text-muted-foreground hindi-text">
              {t('allDeitiesSubtitle')}
            </p>
          </motion.div>

          {loading ? (
            <div className="flex items-center justify-center py-16">
              <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
              {allDeities.map((deity, i) => (
                <motion.div
                  key={`${deity.isCustom ? 'custom' : 'preset'}-${deity.id}`}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05, duration: 0.4 }}
                >
                  <Link
                    to={`/deity/${generateDeitySlug(deity.name)}`}
                    className="group block rounded-xl bg-card p-6 shadow-temple hover:shadow-lg transition-all duration-300 hover:-translate-y-1 text-center touch-target"
                  >
                    <div className="relative mx-auto mb-3 aspect-[4/5] w-full max-h-[11rem] overflow-hidden rounded-xl bg-muted sm:max-h-[12.5rem]">
                      {deity.imageUrl ? (
                        <img
                          src={deity.imageUrl}
                          alt={deity.name}
                          className="h-full w-full object-cover object-center"
                        />
                      ) : (
                        <span className="flex h-full w-full items-center justify-center text-5xl">{deity.emoji}</span>
                      )}
                    </div>
                    <h3 className="font-display text-lg font-semibold text-foreground group-hover:text-primary transition-colors">
                      {deity.name}
                    </h3>
                    {deity.isCustom && (
                      <span className="inline-block text-xs px-2 py-1 bg-primary/20 text-primary rounded-full mt-2">
                        {t('new')}
                      </span>
                    )}
                    {typeof deity.id === 'number' && (
                      <p className="mt-2 text-sm text-muted-foreground">
                        {getDeityCount(deity.id)} {t('bhajansCount')}
                      </p>
                    )}
                  </Link>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
