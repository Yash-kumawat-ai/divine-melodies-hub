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
      <div className="relative flex items-center bg-white dark:bg-[#1E1710] border border-orange-200/50 dark:border-zinc-800/80 rounded-full shadow-[0_8px_30px_rgba(0,0,0,0.06)] dark:shadow-[0_8px_30px_rgba(0,0,0,0.3)] focus-within:border-orange-500/50 focus-within:ring-2 focus-within:ring-orange-500/10 transition-all duration-300 p-1.5 pl-6 pr-2">
        <Search className="w-5 h-5 text-[#FF6A00] shrink-0 mr-3 select-none" />
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder={t('searchBhajansOrSingersPlaceholder')}
          className="w-full bg-transparent border-0 outline-none focus:outline-none focus:ring-0 text-foreground text-base md:text-lg placeholder:text-muted-foreground/60 py-2.5"
        />
        <VoiceSearchButton onResult={handleVoiceResult} />
      </div>
      <p className="text-center text-sm text-muted-foreground mt-3 hindi-text">
        {t('searchHint')}
      </p>
    </motion.form>
  );
}
