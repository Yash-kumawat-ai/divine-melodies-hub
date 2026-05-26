import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Search } from "lucide-react";
import { motion } from "framer-motion";
import VoiceSearchButton from "./VoiceSearchButton";
import { useLanguage } from "@/hooks/useLanguage";

export default function SearchBar() {
  const [query, setQuery] = useState("");
  const navigate = useNavigate();
  const { t } = useLanguage();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      navigate(`/search?q=${encodeURIComponent(query.trim())}`);
    }
  };

  const handleVoiceResult = (transcript: string) => {
    setQuery(transcript);
    navigate(`/search?q=${encodeURIComponent(transcript)}`);
  };

  return (
    <motion.form
      onSubmit={handleSearch}
      className="w-full max-w-2xl mx-auto"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.3 }}
    >
      <div className="relative flex items-center">
        <Search className="absolute left-5 w-6 h-6 text-muted-foreground" />
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder={t('searchBhajansOrSingersPlaceholder')}
          className="w-full pl-14 pr-16 py-5 rounded-2xl bg-card text-foreground text-lg border border-border shadow-temple focus:outline-none focus:ring-2 focus:ring-primary/50 placeholder:text-muted-foreground touch-target"
        />
        <div className="absolute right-4 top-1/2 -translate-y-1/2">
          <VoiceSearchButton onResult={handleVoiceResult} />
        </div>
      </div>
      <p className="text-center text-sm text-muted-foreground mt-3 hindi-text">
        {t('searchHint')}
      </p>
    </motion.form>
  );
}
