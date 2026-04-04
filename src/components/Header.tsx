import { Link, useNavigate } from "react-router-dom";
import { Menu, X, Search, Upload, LogOut } from "lucide-react";
import { useState } from "react";
import { useAuth } from "@/hooks/useAuth";

export default function Header() {
  const [menuOpen, setMenuOpen] = useState(false);
  const { user, signOut } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await signOut();
    navigate('/');
  };

  return (
    <header className="sticky top-0 z-50 bg-background/80 backdrop-blur-lg border-b border-border">
      <div className="container mx-auto px-4 flex items-center justify-between h-16 md:h-20">
        <Link to="/" className="flex items-center gap-2 flex-shrink-0">
          <span className="text-2xl md:text-3xl font-display font-bold">
            <span className="text-gradient-saffron">ॐ</span>
          </span>
          <span className="font-display text-lg md:text-xl font-bold text-foreground hidden sm:inline">
            Bhajan Sandhya
          </span>
        </Link>

        <nav className="hidden md:flex items-center gap-8 text-base font-medium">
          <Link to="/" className="text-foreground hover:text-primary transition-colors">Home</Link>
          <Link to="/search" className="text-foreground hover:text-primary transition-colors">All Bhajans</Link>
          <Link
            to="/upload-bhajan"
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-primary/10 text-primary hover:bg-primary hover:text-primary-foreground transition-colors"
          >
            <Upload className="w-4 h-4" />
            Upload
          </Link>
          <Link to="/search?q=" className="text-muted-foreground hover:text-primary transition-colors p-2">
            <Search className="w-5 h-5" />
          </Link>
          {user && (
            <button
              onClick={handleLogout}
              className="flex items-center gap-2 text-muted-foreground hover:text-destructive transition-colors p-2"
            >
              <LogOut className="w-5 h-5" />
            </button>
          )}
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
          <Link to="/search" onClick={() => setMenuOpen(false)} className="block py-3 text-lg font-medium text-foreground">All Bhajans</Link>
          <Link to="/upload-bhajan" onClick={() => setMenuOpen(false)} className="block py-3 text-lg font-medium text-primary flex items-center gap-2">
            <Upload className="w-4 h-4" />
            Upload Bhajan
          </Link>
          {user && (
            <button
              onClick={() => {
                handleLogout();
                setMenuOpen(false);
              }}
              className="block py-3 text-lg font-medium text-destructive w-full text-left"
            >
              Logout
            </button>
          )}
        </div>
      )}
    </header>
  );
}
