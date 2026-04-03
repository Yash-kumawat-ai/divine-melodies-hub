import { useSearchParams, Link } from "react-router-dom";
import { ArrowLeft, Search as SearchIcon } from "lucide-react";
import { useState, useMemo } from "react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import BhajanCard from "@/components/BhajanCard";
import { searchBhajans, bhajans } from "@/data/bhajans";

export default function SearchPage() {
  const [searchParams] = useSearchParams();
  const initialQuery = searchParams.get("q") || "";
  const [query, setQuery] = useState(initialQuery);

  const results = useMemo(() => {
    if (!query.trim()) return bhajans;
    return searchBhajans(query);
  }, [query]);

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <section className="py-12 px-4">
        <div className="container mx-auto max-w-6xl">
          <Link to="/" className="inline-flex items-center gap-2 text-muted-foreground hover:text-primary transition-colors mb-8 touch-target">
            <ArrowLeft className="w-5 h-5" /> Home
          </Link>

          <div className="relative max-w-2xl mx-auto mb-10">
            <SearchIcon className="absolute left-5 top-1/2 -translate-y-1/2 w-6 h-6 text-muted-foreground" />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search bhajans..."
              className="w-full pl-14 pr-6 py-5 rounded-2xl bg-card text-foreground text-lg border border-border shadow-temple focus:outline-none focus:ring-2 focus:ring-primary/50 touch-target"
              autoFocus
            />
          </div>

          <p className="text-muted-foreground mb-6 text-center">
            {results.length} {results.length === 1 ? "bhajan" : "bhajans"} found
            {query.trim() && <> for "<span className="text-foreground font-medium">{query}</span>"</>}
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {results.map((b) => (
              <BhajanCard key={b.id} bhajan={b} />
            ))}
          </div>

          {results.length === 0 && (
            <p className="text-center text-muted-foreground text-lg py-10 hindi-text">
              कोई भजन नहीं मिला • No bhajans found. Try a different search.
            </p>
          )}
        </div>
      </section>
      <Footer />
    </div>
  );
}
