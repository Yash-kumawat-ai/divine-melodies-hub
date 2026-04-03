import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { deities } from "@/data/bhajans";

export default function DeityGrid() {
  return (
    <section className="py-16 px-4">
      <div className="container mx-auto max-w-6xl">
        <h2 className="font-display text-3xl md:text-4xl font-bold text-center mb-3 text-foreground">
          Browse by Deity
        </h2>
        <p className="text-center text-muted-foreground text-lg mb-10 hindi-text">
          देवता के अनुसार भजन खोजें
        </p>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
          {deities.map((deity, i) => (
            <motion.div
              key={deity.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.08, duration: 0.4 }}
            >
              <Link
                to={`/deity/${deity.slug}`}
                className="group block rounded-xl bg-card p-6 shadow-temple hover:shadow-lg transition-all duration-300 hover:-translate-y-1 text-center touch-target"
              >
                <span className="text-5xl block mb-3">{deity.emoji}</span>
                <h3 className="font-display text-xl font-semibold text-foreground group-hover:text-primary transition-colors">
                  {deity.name}
                </h3>
                <p className="hindi-text text-lg text-muted-foreground mt-1">{deity.nameHindi}</p>
                <p className="text-sm text-muted-foreground mt-2">{deity.bhajanCount} bhajans</p>
              </Link>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
