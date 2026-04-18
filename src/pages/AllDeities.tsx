import { Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { motion } from "framer-motion";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { deities } from "@/data/bhajans";
import { useDeities } from "@/hooks/useDeities";
import { generateDeitySlug } from "@/lib/slugUtils";
import { Loader2 } from "lucide-react";
import { useLanguage } from "@/hooks/useLanguage";

export default function AllDeities() {
  const { deities: allDeities, loading } = useDeities();
  const { t } = useLanguage();

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <section className="py-12 px-4">
        <div className="container mx-auto max-w-6xl">
          <Link 
            to="/" 
            className="inline-flex items-center gap-2 text-muted-foreground hover:text-primary transition-colors mb-8 touch-target"
          >
            <ArrowLeft className="w-5 h-5" /> {t('back')}
          </Link>

          <div className="text-center mb-12">
            <h1 className="font-display text-4xl md:text-5xl font-bold text-foreground mb-3">
              {t('allDeities')}
            </h1>
            <p className="text-lg text-muted-foreground hindi-text">
              {t('allDeitiesSubtitle')}
            </p>
          </div>

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
                    <div className="text-5xl block mb-3 flex items-center justify-center h-40 overflow-hidden">
                      {deity.imageUrl ? (
                        <img 
                          src={deity.imageUrl} 
                          alt={deity.name}
                          className="w-full h-full object-cover rounded-lg"
                        />
                      ) : (
                        <span>{deity.emoji}</span>
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
                  </Link>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </section>
      <Footer />
    </div>
  );
}
