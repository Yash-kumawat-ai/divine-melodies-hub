import { Link } from "react-router-dom";
import { Menu, X, Search } from "lucide-react";
import { useState } from "react";

export default function Header() {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 bg-background/80 backdrop-blur-lg border-b border-border">
      <div className="container mx-auto max-w-6xl px-4 flex items-center justify-between h-16 md:h-20">
        <Link to="/" className="flex items-center gap-2">
          <span className="text-2xl">🙏</span>
          <span className="font-display text-xl md:text-2xl font-bold text-gradient-saffron">
            Bhajan Sangrah
          </span>
        </Link>

        <nav className="hidden md:flex items-center gap-8 text-base font-medium">
          <Link to="/" className="text-foreground hover:text-primary transition-colors">Home</Link>
          <Link to="/search?q=" className="text-foreground hover:text-primary transition-colors">Browse</Link>
          <Link to="/search?q=" className="text-muted-foreground hover:text-primary transition-colors">
            <Search className="w-5 h-5" />
          </Link>
        </nav>

        <button
          className="md:hidden p-2 touch-target"
          onClick={() => setMenuOpen(!menuOpen)}
          aria-label="Toggle menu"
        >
          {menuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      {menuOpen && (
        <div className="md:hidden border-t border-border bg-background px-4 py-4 space-y-3">
          <Link to="/" onClick={() => setMenuOpen(false)} className="block py-3 text-lg font-medium text-foreground">Home</Link>
          <Link to="/search?q=" onClick={() => setMenuOpen(false)} className="block py-3 text-lg font-medium text-foreground">Browse All</Link>
        </div>
      )}
    </header>
  );
}
