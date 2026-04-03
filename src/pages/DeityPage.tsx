import { useParams, Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import BhajanCard from "@/components/BhajanCard";
import { getDeityBySlug, getBhajansByDeity } from "@/data/bhajans";

export default function DeityPage() {
  const { slug } = useParams<{ slug: string }>();
  const deity = getDeityBySlug(slug || "");
  const bhajanList = deity ? getBhajansByDeity(deity.id) : [];

  if (!deity) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="container mx-auto max-w-4xl px-4 py-20 text-center">
          <p className="text-2xl text-muted-foreground">Deity not found</p>
          <Link to="/" className="text-primary underline mt-4 inline-block">Go Home</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <section className="py-12 px-4">
        <div className="container mx-auto max-w-6xl">
          <Link to="/" className="inline-flex items-center gap-2 text-muted-foreground hover:text-primary transition-colors mb-8 touch-target">
            <ArrowLeft className="w-5 h-5" /> Back
          </Link>
          <div className="text-center mb-12">
            <span className="text-6xl block mb-4">{deity.emoji}</span>
            <h1 className="font-display text-4xl font-bold text-foreground">{deity.name}</h1>
            <p className="hindi-text text-2xl text-muted-foreground mt-1">{deity.nameHindi}</p>
            <p className="text-muted-foreground mt-2">{deity.description}</p>
            <p className="text-sm text-muted-foreground mt-1">{bhajanList.length} bhajans</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {bhajanList.map((b) => (
              <BhajanCard key={b.id} bhajan={b} />
            ))}
          </div>
          {bhajanList.length === 0 && (
            <p className="text-center text-muted-foreground text-lg py-10">
              No bhajans available yet for {deity.name}. Check back soon!
            </p>
          )}
        </div>
      </section>
      <Footer />
    </div>
  );
}
