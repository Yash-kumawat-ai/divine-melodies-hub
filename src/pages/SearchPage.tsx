import { useSearchParams, Link } from "react-router-dom";
import { ArrowLeft, Search as SearchIcon } from "lucide-react";
import { useState, useMemo } from "react";
import { motion } from "framer-motion";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import BhajanCard from "@/components/BhajanCard";
import { searchBhajans, bhajans, deities } from "@/data/bhajans";

export default function SearchPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const initialQuery = searchParams.get("q") || "";
  const initialDeity = searchParams.get("deity") || "";
  const [query, setQuery] = useState(initialQuery);
  const [selectedDeity, setSelectedDeity] = useState(initialDeity);

  const results = useMemo(() => {
    let filtered = bhajans;

    if (selectedDeity) {
      const deity = deities.find(d => d.slug === selectedDeity);
      if (deity) {
        filtered = filtered.filter(b => b.deityId === deity.id);
      }
    }

    if (query.trim()) {
      filtered = searchBhajans(query, filtered);
    }

    return filtered;
  }, [query, selectedDeity]);

  const handleDeityFilter = (slug: string) => {
    setSelectedDeity(slug === selectedDeity ? "" : slug);
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />

      {/* Hero Section */}
      <section className="bg-gradient-warm py-12 px-4">
        <div className="container mx-auto max-w-5xl text-center">
          <motion.h1
            className="font-display text-4xl md:text-5xl font-bold text-foreground mb-4"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            All Bhajans
          </motion.h1>
          <motion.p
            className="text-lg text-muted-foreground max-w-2xl mx-auto mb-8"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.1 }}
          >
            Browse our collection of sacred songs, stotrams, and mantras. Find the lyrics and meaning for your daily devotion.
          </motion.p>
        </div>
      </section>

      {/* Search and Filter Section */}
      <section className="py-12 px-4">
        <div className="container mx-auto max-w-5xl">
          {/* Search Bar */}
          <motion.div
            className="relative mb-10"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <SearchIcon className="absolute left-5 top-1/2 -translate-y-1/2 w-6 h-6 text-muted-foreground" />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search by title or tags..."
              className="w-full pl-14 pr-6 py-4 rounded-2xl bg-card text-foreground text-lg border border-border shadow-temple focus:outline-none focus:ring-2 focus:ring-primary/50 touch-target"
              autoFocus
            />
          </motion.div>

          {/* Deity Filter */}
          <motion.div
            className="mb-12"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <div className="flex items-center gap-3 mb-6">
              <span className="text-primary font-semibold text-lg">⚡ FILTER BY DEITY</span>
            </div>
            <div className="flex flex-wrap gap-3">
              <button
                onClick={() => setSelectedDeity("")}
                className={`px-6 py-2 rounded-full font-medium transition-all touch-target ${
                  !selectedDeity
                    ? "bg-primary text-primary-foreground shadow-lg"
                    : "bg-card text-foreground border border-border hover:border-primary"
                }`}
              >
                All
              </button>
              {deities.map((deity) => (
                <button
                  key={deity.id}
                  onClick={() => handleDeityFilter(deity.slug)}
                  className={`px-6 py-2 rounded-full font-medium transition-all touch-target ${
                    selectedDeity === deity.slug
                      ? "bg-primary text-primary-foreground shadow-lg"
                      : "bg-card text-foreground border border-border hover:border-primary"
                  }`}
                >
                  {deity.name}
                </button>
              ))}
            </div>
          </motion.div>

          {/* Results Header */}
          <motion.div
            className="mb-8"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
          >
            <h2 className="font-display text-3xl font-bold text-foreground mb-2">
              Results
            </h2>
            <p className="text-muted-foreground">
              <span className="text-primary font-semibold">{results.length} found</span>
              {query.trim() && (
                <> for "<span className="text-foreground font-medium">{query}</span>"</>
              )}
            </p>
          </motion.div>

          {/* Results Grid */}
          {results.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {results.map((bhajan, index) => (
                <motion.div
                  key={bhajan.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 + index * 0.05 }}
                >
                  <BhajanCard bhajan={bhajan} />
                </motion.div>
              ))}
            </div>
          ) : (
            <motion.div
              className="text-center py-16"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
            >
              <p className="text-muted-foreground text-lg hindi-text mb-4">
                कोई भजन नहीं मिला • No bhajans found
              </p>
              <p className="text-muted-foreground">
                Try a different search or filter by another deity
              </p>
            </motion.div>
          )}
        </div>
      </section>

      <Footer />
    </div>
  );
}
