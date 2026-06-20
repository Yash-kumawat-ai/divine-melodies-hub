import { useNavigate } from "react-router-dom";
import { ChevronLeft } from "lucide-react";
import { useLanguage } from "@/hooks/useLanguage";
import { SEO } from "@/components/SEO";

export default function JoinCommunityPage() {
  const navigate = useNavigate();
  const { language } = useLanguage();
  const isHi = language === "hi";

  return (
    <div className="min-h-screen bg-[#fdfbf7] dark:bg-[#0c0a08] text-stone-900 dark:text-stone-100 transition-colors pb-16">
      <SEO 
        title={isHi ? "कम्युनिटी से जुड़ें - राघवन" : "Join Community - Raghavam"}
        description="राघवन कम्युनिटी से जुड़ें"
      />

      {/* ─── HEADER BAR ────────────────────────────────────────── */}
      <header className="sticky top-0 z-30 bg-[#fdfbf7]/90 dark:bg-[#0c0a08]/90 backdrop-blur-md border-b border-amber-500/10 px-4 py-3.5 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate(-1)}
            className="w-10 h-10 rounded-full border border-amber-500/20 bg-amber-50/40 dark:bg-stone-900/40 hover:bg-amber-100/50 dark:hover:bg-stone-850 flex items-center justify-center text-amber-600 dark:text-amber-400 active:scale-95 transition-all shrink-0"
            aria-label="Back"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <span className="font-display text-xl font-bold tracking-tight text-amber-900 dark:text-amber-100">
            {isHi ? "कम्युनिटी से जुड़ें" : "Join Community"}
          </span>
        </div>
      </header>

      {/* Blank Page Content Area */}
      <div className="max-w-4xl mx-auto px-4 mt-12 flex flex-col items-center justify-center min-h-[50vh]">
        {/* Intentionally left blank per user request */}
      </div>
    </div>
  );
}
