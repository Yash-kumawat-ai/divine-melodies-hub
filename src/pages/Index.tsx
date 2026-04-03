import { motion } from "framer-motion";
import heroMandala from "@/assets/hero-mandala.png";
import SearchBar from "@/components/SearchBar";
import DeityGrid from "@/components/DeityGrid";
import BhajanCard from "@/components/BhajanCard";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { getFeaturedBhajans } from "@/data/bhajans";

const Index = () => {
  const featured = getFeaturedBhajans();

  return (
    <div className="min-h-screen bg-background">
      <Header />

      {/* Hero */}
      <section className="relative overflow-hidden bg-gradient-warm py-20 md:py-28 px-4">
        <img
          src={heroMandala}
          alt=""
          className="absolute right-[-10%] top-[-20%] w-[500px] opacity-10 animate-float pointer-events-none select-none"
          width={500}
          height={500}
          aria-hidden="true"
        />
        <div className="container mx-auto max-w-4xl text-center relative z-10">
          <motion.h1
            className="font-display text-4xl md:text-5xl font-bold text-foreground mb-3"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <span className="text-gradient-saffron">Bhajan Sangrah</span>
          </motion.h1>
          <motion.p
            className="hindi-text text-2xl md:text-3xl text-foreground/80 mb-2"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.15 }}
          >
            भजन संग्रह
          </motion.p>
          <motion.p
            className="text-lg text-muted-foreground mb-10 max-w-xl mx-auto"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.25 }}
          >
            Your complete devotional music collection — lyrics, audio & more
          </motion.p>
          <SearchBar />
        </div>
      </section>

      {/* Deity Grid */}
      <DeityGrid />

      {/* Featured Bhajans */}
      <section className="py-16 px-4 bg-card/50">
        <div className="container mx-auto max-w-6xl">
          <h2 className="font-display text-3xl md:text-4xl font-bold text-center mb-3 text-foreground">
            Featured Bhajans
          </h2>
          <p className="text-center text-muted-foreground text-lg mb-10 hindi-text">
            लोकप्रिय भजन
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {featured.map((bhajan) => (
              <BhajanCard key={bhajan.id} bhajan={bhajan} />
            ))}
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Index;
