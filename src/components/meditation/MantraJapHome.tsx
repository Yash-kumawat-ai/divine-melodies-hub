import { useState, useMemo, useCallback, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Play,
  ArrowLeft,
  Bell,
  Sparkles,
  Plus,
  X,
  TrendingUp,
  RotateCcw,
  ChevronRight,
  Heart,
  ChevronDown,
  UserRound,
  Sun,
  Target,
  Trash2,
  Trophy,
  Menu,
} from "lucide-react";
import { useLanguage } from "@/hooks/useLanguage";
import { useTheme } from "@/hooks/useTheme";
import { useSearchParams, useNavigate } from "react-router-dom";
import { useMantraJapa, resolveMantraImage } from "@/hooks/useMantraJapa";
import MantraDetailView from "./MantraDetailView";
import MantraSetupView from "./MantraSetupView";
import { cn } from "@/lib/utils";
import mantraJapBanner from "@/pages/images/mantra_jap_banner.webp";
import type { Mantra } from "@/lib/mantraJapa/mantraJapaApi";

// Gold lotus mark (matches MeditationPracticeHome)
const LotusMark = ({ className = "w-5 h-4" }: { className?: string }) => (
  <svg className={className} viewBox="0 0 48 28" fill="none" aria-hidden>
    <path
      d="M24 26c-3-4.5-8-8.5-12.5-11C16 12 20.5 9 24 4c3.5 5 8 8 12.5 11C32 17.5 27 21.5 24 26Z"
      fill="#D9A441"
      opacity="0.85"
    />
    <path
      d="M24 24c-2-3-5.5-5.5-9-7.5C18 14.5 21 12 24 8c3 4 6 6.5 9 8.5C29.5 18.5 26 21 24 24Z"
      fill="#F5C15C"
      opacity="0.9"
    />
  </svg>
);

// Custom Yogi SVG Icon
const YogiIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" {...props}>
    <circle cx="12" cy="5.5" r="2.5" />
    <path d="M12 8v8" />
    <path d="M5 12c2 1 4 1.5 7 1.5s5-.5 7-1.5" />
    <path d="M5 12L8 15c2.5 1 5.5 1 8 0l3-3" />
    <path d="M6 19c2-1 4-1.5 6-1.5s4 .5 6 1.5" />
    <path d="M3 20.5h18" />
  </svg>
);

type MantraJapHomeProps = {
  onBack: () => void;
};

// Custom Icons
const MalaIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" {...props}>
    <circle cx="12" cy="10" r="6" strokeDasharray="3 3" />
    <circle cx="12" cy="17" r="1.5" fill="currentColor" />
    <path d="M11 18.5l1 1.5 1-1.5" />
  </svg>
);

const ConcentricCirclesIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" {...props}>
    <circle cx="12" cy="12" r="9" strokeOpacity="0.3" />
    <circle cx="12" cy="12" r="6" strokeOpacity="0.6" />
    <circle cx="12" cy="12" r="3" fill="currentColor" />
  </svg>
);

const japaStepsData = [
  {
    num: 1,
    icon: YogiIcon,
    titleHi: "स्थान चुनें",
    titleEn: "Choose a Place",
    descHi: "शांत और स्वच्छ जगह चुनें जहाँ आप आराम से बैठ सकें।",
    descEn: "Select a quiet, clean spot where you can sit comfortably."
  },
  {
    num: 2,
    icon: ConcentricCirclesIcon,
    titleHi: "संकल्प लें",
    titleEn: "Take a Resolve",
    descHi: "अपना संकल्प स्पष्ट करें और मन को एकाग्र करें।",
    descEn: "Clarify your intention and focus your mind."
  },
  {
    num: 3,
    icon: MalaIcon,
    titleHi: "जाप प्रारंभ करें",
    titleEn: "Start Chanting",
    descHi: "माला की एक-एक मनका पर मंत्र का जाप करें।",
    descEn: "Chant the mantra on each bead of your mala."
  },
  {
    num: 4,
    icon: TrendingUp,
    titleHi: "नियमित अभ्यास करें",
    titleEn: "Practice Regularly",
    descHi: "रोज़ाना अभ्यास से ही श्रेष्ठ परिणाम मिलते हैं।",
    descEn: "Consistent daily practice yields the best results."
  }
];

export default function MantraJapHome({ onBack }: MantraJapHomeProps) {
  const { language } = useLanguage();
  const isHi = language === "hi";
  const { theme } = useTheme();
  const isDark = theme === "dark";
  const navigate = useNavigate();

  const {
    mantras,
    mantrasLoading,
    stats,
    mantraTotalsMap,
    todaySessions,
    sankalpas,
    isGuest,
    completeSession,
    addSankalp,
    activateSankalp,
    deleteSankalpFn,
    refresh,
    addCustomMantra,
    deleteCustomMantra,
  } = useMantraJapa();

  // ─── Local UI State ────────────────────────────────────────────
  const [selectedMantraForDetail, setSelectedMantraForDetail] = useState<Mantra | null>(null);
  const [showSetup, setShowSetup] = useState(false);
  const [searchParams, setSearchParams] = useSearchParams();
  const [showAddMantraModal, setShowAddMantraModal] = useState(false);
  const [customMantraHindi, setCustomMantraHindi] = useState("");
  const [customMantraEnglish, setCustomMantraEnglish] = useState("");

  const urlMantraId = searchParams.get("mantraId");
  const urlShowSetup = searchParams.get("showSetup") === "true";

  useEffect(() => {
    if (urlMantraId && mantras.length > 0) {
      const found = mantras.find((m) => m.id === urlMantraId);
      if (found) {
        setSelectedMantraForDetail(found);
        setShowSetup(urlShowSetup);
      }
    } else {
      setSelectedMantraForDetail(null);
      setShowSetup(false);
    }
  }, [urlMantraId, urlShowSetup, mantras]);

  const [isBeginnerOpen, setIsBeginnerOpen] = useState(true);
  const [japaTarget, setJapaTarget] = useState<number>(() => {
    return Number(localStorage.getItem("hari_kirtan_japa_target_v1") || "108");
  });
  const [isCustomMode, setIsCustomMode] = useState<boolean>(() => {
    const saved = Number(localStorage.getItem("hari_kirtan_japa_target_v1") || "108");
    return saved !== 108 && saved !== 1008;
  });

  // ─── Sankalp local state ───────────────────────────────────────
  const [newSankalpText, setNewSankalpText] = useState("");

  // For guest mode, keep sankalps in local state
  const [localSankalpList, setLocalSankalpList] = useState<string[]>(() => {
    try {
      return JSON.parse(localStorage.getItem("hari_kirtan_custom_sankalps_v1") || "[]");
    } catch { return []; }
  });
  const [localActiveSankalp, setLocalActiveSankalp] = useState<string>(() => {
    return localStorage.getItem("hari_kirtan_active_sankalp_v1") || "";
  });

  const presetSankalps = useMemo(() => {
    return isHi
      ? ["मानसिक शांति और एकाग्रता", "सकारात्मक ऊर्जा और स्वास्थ्य", "ईश्वर भक्ति और मोक्ष"]
      : ["Inner Peace & Focus", "Positive Energy & Health", "Divine Devotion & Faith"];
  }, [isHi]);

  // Determine effective sankalpas and active
  const effectiveSankalpas = useMemo(() => {
    if (isGuest) {
      return [
        ...presetSankalps.map((t) => ({ id: t, text: t, is_custom: false, is_active: localActiveSankalp === t })),
        ...localSankalpList.map((t) => ({ id: t, text: t, is_custom: true, is_active: localActiveSankalp === t })),
      ];
    }
    // For authed users, combine presets with DB sankalpas
    const dbSankalpIds = new Set(sankalpas.map((s) => s.text));
    const presets = presetSankalps
      .filter((t) => !dbSankalpIds.has(t))
      .map((t) => ({ id: t, text: t, is_custom: false, is_active: false }));
    const dbItems = sankalpas.map((s) => ({
      id: s.id,
      text: s.text,
      is_custom: s.is_custom,
      is_active: s.is_active,
    }));
    return [...presets, ...dbItems];
  }, [isGuest, presetSankalps, sankalpas, localSankalpList, localActiveSankalp]);

  const activeSankalpText = useMemo(() => {
    const active = effectiveSankalpas.find((s) => s.is_active);
    if (active) return active.text;
    if (isGuest && localActiveSankalp) return localActiveSankalp;
    return presetSankalps[0];
  }, [effectiveSankalpas, isGuest, localActiveSankalp, presetSankalps]);

  // ─── Handlers ──────────────────────────────────────────────────
  const handleTargetChange = useCallback((target: number, isCustom = false) => {
    setJapaTarget(target);
    setIsCustomMode(isCustom);
    localStorage.setItem("hari_kirtan_japa_target_v1", String(target));
  }, []);

  const handleSelectSankalp = useCallback(async (item: { id: string; text: string }) => {
    if (isGuest) {
      setLocalActiveSankalp(item.text);
      localStorage.setItem("hari_kirtan_active_sankalp_v1", item.text);
    } else {
      await activateSankalp(item.id);
    }
  }, [isGuest, activateSankalp]);

  const handleAddCustomSankalp = useCallback(async () => {
    const text = newSankalpText.trim();
    if (!text) return;
    if (isGuest) {
      if (!localSankalpList.includes(text)) {
        const updated = [text, ...localSankalpList].slice(0, 10);
        setLocalSankalpList(updated);
        localStorage.setItem("hari_kirtan_custom_sankalps_v1", JSON.stringify(updated));
      }
      setLocalActiveSankalp(text);
      localStorage.setItem("hari_kirtan_active_sankalp_v1", text);
    } else {
      await addSankalp(text);
    }
    setNewSankalpText("");
  }, [newSankalpText, isGuest, localSankalpList, addSankalp]);

  const handleDeleteCustomSankalp = useCallback(async (e: React.MouseEvent, item: { id: string; text: string }) => {
    e.stopPropagation();
    if (isGuest) {
      const updated = localSankalpList.filter((s) => s !== item.text);
      setLocalSankalpList(updated);
      localStorage.setItem("hari_kirtan_custom_sankalps_v1", JSON.stringify(updated));
      if (localActiveSankalp === item.text) {
        setLocalActiveSankalp(presetSankalps[0]);
        localStorage.setItem("hari_kirtan_active_sankalp_v1", presetSankalps[0]);
      }
    } else {
      await deleteSankalpFn(item.id);
    }
  }, [isGuest, localSankalpList, localActiveSankalp, presetSankalps, deleteSankalpFn]);

  const handleStartJapaWithSankalp = useCallback(() => {
    // Find the most recently chanted mantra, or default to first
    if (mantras.length === 0) return;
    let best: Mantra | null = null;
    let newestTime = 0;
    mantras.forEach((m) => {
      const total = mantraTotalsMap[m.id];
      if (total?.last_session_at) {
        const t = new Date(total.last_session_at).getTime();
        if (t > newestTime) { newestTime = t; best = m; }
      }
    });
    const target = best || mantras[0];
    setSearchParams({
      practice: "mantra_japa_counter",
      mantraId: target.id,
      targetCount: String(japaTarget),
      practiceMode: "mala",
      sankalp: activeSankalpText,
    });
  }, [mantras, mantraTotalsMap, japaTarget, activeSankalpText, setSearchParams]);

  const handleContinueLastSession = handleStartJapaWithSankalp;

  // ─── Relative date helper ─────────────────────────────────────
  const getRelativeDateString = useCallback((isoString: string | null) => {
    if (!isoString) return isHi ? "कभी नहीं" : "Never";
    const date = new Date(isoString);
    const now = new Date();
    const getLocal = (d: Date) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
    const dateStr = getLocal(date);
    const nowStr = getLocal(now);
    if (dateStr === nowStr) return isHi ? "आज" : "Today";
    const yesterday = new Date(now);
    yesterday.setDate(now.getDate() - 1);
    if (dateStr === getLocal(yesterday)) return isHi ? "कल" : "Yesterday";
    const diffDays = Math.ceil(Math.abs(now.getTime() - date.getTime()) / 86400000);
    return isHi ? `${diffDays} दिन पहले` : `${diffDays} days ago`;
  }, [isHi]);

  // Guest-mode mantra stats for cards (use localStorage)
  const guestMantraStats = useMemo(() => {
    if (!isGuest) return {};
    try {
      return JSON.parse(localStorage.getItem("hari_kirtan_mantra_stats_v1") || "{}");
    } catch { return {}; }
  }, [isGuest]);

  // Legacy mantra id mapping for guest mode
  const LEGACY_MANTRA_MAP: Record<string, string> = {
    "Om Chanting": "om",
    "Om Namah Shivaya": "om_namah_shivaya",
    "Mahamrityunjaya Mantra": "mahamrityunjaya",
    "Hare Krishna Mahamantra": "hare_krishna",
    "Radhe Radhe": "radhe_radhe",
    "Jai Shree Ram": "jai_shree_ram",
    "Om Namo Narayanaya": "om_namo_narayanaya",
    "Gayatri Mantra": "gayatri",
  };

  // Get chant data for a mantra card
  const getMantraCardData = useCallback((m: Mantra) => {
    // 1. Calculate today's chants for this mantra
    let todayChants = 0;
    if (isGuest) {
      if (typeof window !== 'undefined') {
        const logsRaw = localStorage.getItem("hari_kirtan_meditation_logs_v1");
        if (logsRaw) {
          try {
            const logs = JSON.parse(logsRaw) as any[];
            const today = new Date().toISOString().slice(0, 10);
            todayChants = logs
              .filter((l: any) => l.completed && l.completedAt?.slice(0, 10) === today && (l.mantraId === m.id || l.mantra === m.name_english))
              .reduce((sum: number, l: any) => sum + (l.japaCount || 0), 0);
          } catch { /* ignore */ }
        }
      }
    } else {
      todayChants = todaySessions
        .filter((s) => s.mantra_id === m.id && s.completed)
        .reduce((sum, s) => sum + s.actual_count, 0);
    }

    // 2. Lifetime & Streak
    if (!isGuest) {
      const total = mantraTotalsMap[m.id];
      return {
        today: todayChants,
        chants: total?.total_chants ?? 0,
        streak: total?.current_streak ?? 0,
        lastDate: getRelativeDateString(total?.last_session_at ?? null),
      };
    }

    // Guest: lookup by legacy id
    const legacyId = LEGACY_MANTRA_MAP[m.name_english];
    const stat = legacyId ? guestMantraStats[legacyId] : null;
    return {
      today: todayChants,
      chants: stat?.totalChants ?? 0,
      streak: (stat?.totalChants ?? 0) > 0 ? stats.currentStreak : 0,
      lastDate: getRelativeDateString(stat?.lastChantedAt ?? null),
    };
  }, [isGuest, mantraTotalsMap, guestMantraStats, todaySessions, stats.currentStreak, getRelativeDateString]);

  // Find the last chanted mantra ID
  const lastChantedMantraId = useMemo(() => {
    if (mantras.length === 0) return null;
    if (isGuest) {
      let bestLegacyId: string | null = null;
      let newestTime = 0;
      Object.entries(guestMantraStats).forEach(([legacyId, stat]: [string, any]) => {
        if (stat?.lastChantedAt) {
          const t = new Date(stat.lastChantedAt).getTime();
          if (t > newestTime) { newestTime = t; bestLegacyId = legacyId; }
        }
      });
      if (bestLegacyId) {
        const m = mantras.find((m) => LEGACY_MANTRA_MAP[m.name_english] === bestLegacyId);
        if (m) return m.id;
      }
      return mantras[0]?.id;
    }
    
    let bestId: string | null = null;
    let newestTime = 0;
    mantras.forEach((m) => {
      const total = mantraTotalsMap[m.id];
      if (total?.last_session_at) {
        const t = new Date(total.last_session_at).getTime();
        if (t > newestTime) { newestTime = t; bestId = m.id; }
      }
    });
    return bestId || mantras[0]?.id;
  }, [mantras, mantraTotalsMap, isGuest, guestMantraStats]);

  // ─── Copy ──────────────────────────────────────────────────────
  const copy = {
    title: isHi ? "मंत्र जाप" : "Mantra Japa",
    selectTitle: isHi ? "मंत्र चुनें और जप शुरू करें" : "Select Mantra & Start",
  };

  // ─── Render ────────────────────────────────────────────────────
  if (selectedMantraForDetail) {
    return (
      <div className="flex flex-col h-full min-h-0 flex-1 relative">
        <MantraDetailView
          mantra={selectedMantraForDetail}
          image={resolveMantraImage(selectedMantraForDetail)}
          stats={mantraTotalsMap[selectedMantraForDetail.id]}
          onBack={() => {
            const returnUrl = searchParams.get("returnUrl");
            if (returnUrl) {
              navigate(returnUrl);
              return;
            }
            const gId = searchParams.get("groupId");
            if (gId) {
              navigate(-1);
              return;
            }
            setSelectedMantraForDetail(null);
            setShowSetup(false);
            setSearchParams({
              practice: "mantra_jap_home",
            });
          }}
          onStartJapa={() => {
            const gId = searchParams.get("groupId");
            const retUrl = searchParams.get("returnUrl");
            setShowSetup(true);
            setSearchParams({
              practice: "mantra_jap_home",
              mantraId: selectedMantraForDetail.id,
              showSetup: "true",
              ...(gId ? { groupId: gId } : {}),
              ...(retUrl ? { returnUrl: retUrl } : {}),
            });
          }}
        />

        {/* Devotional Setup Pop-up Modal */}
        <AnimatePresence>
          {showSetup && (
            <MantraSetupView
              mantra={selectedMantraForDetail}
              initialGroupId={searchParams.get("groupId")}
              onBack={() => {
                const returnUrl = searchParams.get("returnUrl");
                const gId = searchParams.get("groupId");
                setShowSetup(false);
                setSearchParams({
                  practice: "mantra_jap_home",
                  mantraId: selectedMantraForDetail.id,
                  ...(gId ? { groupId: gId } : {}),
                  ...(returnUrl ? { returnUrl: returnUrl } : {}),
                });
              }}
              onStartJapa={(opts) => {
                const gId = opts.groupId || searchParams.get("groupId");
                const retUrl = searchParams.get("returnUrl");
                setSearchParams({
                  practice: "mantra_japa_counter",
                  mantraId: selectedMantraForDetail.id,
                  targetCount: String(opts.targetCount),
                  practiceMode: opts.practiceMode,
                  sankalp: opts.sankalpText,
                  ...(gId ? { groupId: String(gId) } : {}),
                  ...(retUrl ? { returnUrl: retUrl } : {}),
                });
              }}
            />
          )}
        </AnimatePresence>
      </div>
    );
  }

  return (
    <div
      className={cn(
        "relative flex flex-col h-full overflow-hidden transition-colors duration-300",
        isDark ? "text-amber-50 bg-[#0c0a08]" : "text-[#3A2418] bg-[#FAF6EE]"
      )}
    >
      {!isDark && (
        <div
          className="absolute inset-0 -z-20 pointer-events-none"
          style={{
            background: "linear-gradient(180deg, #FFFDF8 0%, #FAF6EE 45%, #F5EDE0 100%)",
          }}
        />
      )}

<<<<<<< HEAD
      {/* ─── HEADER ─────────────────────────────────────────────── */}
      <header className={`sticky top-0 z-40 px-4 py-3 flex items-center justify-between border-b transition-colors duration-300 ${
        isDark
          ? 'bg-[#080504]/95 backdrop-blur-md border-amber-900/20 shadow-sm'
          : 'bg-[#FCF7F0]/95 backdrop-blur-md border-amber-200/40 shadow-sm'
      }`}>
        <div className="flex items-center gap-3">
=======
      {/* Header */}
      <header className="sticky top-0 z-40 px-4 py-3 flex items-center justify-between border-b bg-[#FAF6EE]/95 dark:bg-[#0c0a08]/95 backdrop-blur-md border-[#E8D8C4] dark:border-stone-800">
        <div className="flex items-center gap-2.5 min-w-0">
>>>>>>> 204ef2c9e68891bf2462ec61d56da7fe76d72670
          <button
            type="button"
            onClick={onBack}
<<<<<<< HEAD
            className="text-stone-800 dark:text-stone-200 hover:opacity-75 active:scale-95 transition-opacity"
            aria-label="Back"
          >
            <ArrowLeft className="w-6 h-6 stroke-[2.2]" />
          </button>
          <div>
            <h1 className="font-serif font-extrabold text-lg sm:text-xl tracking-tight leading-tight text-stone-900 dark:text-amber-100">
              {isHi ? "जप साधना" : "Japa Sadhana"}
=======
            className="flex items-center justify-center h-9 w-9 rounded-full border border-[#E8D8C4] dark:border-stone-700 bg-[#FFFDF8] dark:bg-stone-900 text-[#651317] dark:text-amber-300 active:scale-95 transition-all shrink-0"
            aria-label="Back"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <div className="flex items-center gap-1.5 min-w-0">
            <h1 className="text-base sm:text-lg font-bold font-display tracking-tight text-[#651317] dark:text-amber-100 truncate leading-normal py-0.5">
              {copy.title}
>>>>>>> 204ef2c9e68891bf2462ec61d56da7fe76d72670
            </h1>
            <p className="text-[11px] text-stone-500 dark:text-stone-400 font-medium leading-none mt-0.5">
              {isHi ? "मंत्रों का अभ्यास, मन की शांति, आत्मा से जुड़ाव" : "Mantra practice, peace of mind, soul connection"}
            </p>
          </div>
        </div>
<<<<<<< HEAD
        <div className="flex items-center gap-3">
          {isGuest && (
            <span className={`text-[10px] px-2.5 py-0.5 rounded-full border font-bold ${
              isDark ? 'bg-amber-900/30 text-amber-300 border-amber-700/40' : 'bg-amber-100 text-amber-700 border-amber-300/60'
            }`}>
=======
        <div className="flex items-center gap-1.5 shrink-0">
          {isGuest && (
            <span className="text-[10px] px-2.5 py-1 rounded-full border border-[#E8D8C4] bg-[#FAF0E4] text-[#651317] font-bold dark:bg-amber-500/15 dark:border-amber-500/40 dark:text-amber-300">
>>>>>>> 204ef2c9e68891bf2462ec61d56da7fe76d72670
              {isHi ? "अतिथि" : "Guest"}
            </span>
          )}
          <button
            type="button"
            onClick={() => navigate("/leaderboard")}
<<<<<<< HEAD
            className="text-stone-700 dark:text-amber-400 hover:opacity-75 active:scale-95 transition-opacity"
            title={isHi ? "लीडरबोर्ड" : "Leaderboard"}
          >
            <Trophy className="w-5 h-5 stroke-[2]" />
=======
            className="h-9 w-9 rounded-full border border-[#E8D8C4] dark:border-stone-700 bg-[#FFFDF8] dark:bg-stone-900 flex items-center justify-center text-[#651317] dark:text-amber-300 active:scale-95 transition-all"
            title={isHi ? "लीडरबोर्ड" : "Leaderboard"}
          >
            <Trophy className="w-4 h-4" />
          </button>
          <button
            type="button"
            className="h-9 w-9 rounded-full border border-[#E8D8C4] dark:border-stone-700 bg-[#FFFDF8] dark:bg-stone-900 flex items-center justify-center text-[#651317] dark:text-amber-300/80 transition-all"
            aria-label="Notifications"
          >
            <Bell className="w-4 h-4" />
>>>>>>> 204ef2c9e68891bf2462ec61d56da7fe76d72670
          </button>
        </div>
      </header>

      <div className="flex-1 overflow-y-auto overflow-x-hidden pb-8">
        <div className="mx-auto max-w-5xl px-4 lg:px-6 mt-4 space-y-5">
          {/* Hero Banner — Full Size Artwork with Harmonious Spiritual Typography */}
          <section className="relative overflow-hidden rounded-[24px] border border-[#E8D8C4] dark:border-amber-500/20 shadow-[0_10px_30px_rgba(42,18,15,0.08)] dark:shadow-[0_12px_36px_rgba(0,0,0,0.5)] min-h-[220px] sm:min-h-[250px] md:min-h-[280px] flex flex-col justify-center">
            <div className="absolute inset-0 z-0 select-none pointer-events-none overflow-hidden">
              <img
                src={mantraJapBanner}
                alt="Mantra Japa Sacred Banner"
                className="w-full h-full object-cover object-center sm:object-[center_35%] transition-transform duration-700 hover:scale-[1.02]"
              />
              {/* Soft, light directional overlay — keeping image bright, golden & vibrant */}
              <div className="absolute inset-0 bg-gradient-to-r from-black/55 via-black/25 to-transparent" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/35 via-transparent to-transparent" />
            </div>

            <div className="relative z-10 px-5 py-6 sm:px-8 sm:py-8 text-left max-w-xl">
              <p className="text-[#F5C15C] font-bold tracking-[0.18em] text-xs uppercase mb-2">
                {isHi ? "दैनिक साधना" : "Daily Sadhana"}
              </p>
              <h2 className="text-2xl sm:text-3xl md:text-4xl font-display font-bold text-white tracking-tight leading-tight">
                {isHi ? "मंत्र जाप साधना" : "Mantra Japa Sadhana"}
              </h2>
              <p className="mt-1.5 sm:mt-2 text-xs sm:text-sm md:text-base text-white/85 font-medium leading-relaxed max-w-md">
                {isHi
                  ? "नियमित मंत्र जाप से मन शांत, एकाग्र और आध्यात्मिक ऊर्जा से परिपूर्ण होता है।"
                  : "Daily sacred chanting calms the mind, sharpens focus, and awakens divine peace."}
              </p>
              <div className="mt-4 sm:mt-5 flex flex-wrap items-center gap-3 sm:gap-4">
                <button
                  type="button"
                  onClick={() =>
                    document.getElementById("mantra-list")?.scrollIntoView({ behavior: "smooth" })
                  }
                  className="inline-flex items-center justify-center gap-2.5 rounded-full bg-[#651317] hover:bg-[#4f0f12] text-white h-11 px-6 text-sm font-bold active:scale-95 transition-all shadow-[0_8px_24px_rgba(101,19,23,0.35)] cursor-pointer"
                >
                  <Play className="h-4 w-4 fill-current stroke-none" />
                  <span>{isHi ? "मंत्र चुनें व जप करें" : "Choose Mantra & Start"}</span>
                </button>
                <button
                  type="button"
                  onClick={() =>
                    document.getElementById("japa-benefits")?.scrollIntoView({ behavior: "smooth" })
                  }
                  className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-full bg-black/35 hover:bg-black/50 backdrop-blur-md border border-white/20 hover:border-white/40 text-xs sm:text-sm font-semibold text-white/90 hover:text-white transition-all cursor-pointer"
                >
                  <span>{isHi ? "इसके लाभ देखें" : "Explore Benefits"}</span>
                  <span className="text-[#F5C15C]">→</span>
                </button>
              </div>
            </div>
          </section>

          {/* Mantra list */}
          <section id="mantra-list" className="space-y-3.5 scroll-mt-24">
            <div className="flex items-center justify-between gap-3">
              <h3 className="text-sm sm:text-base font-bold flex items-center gap-2 text-[#651317] dark:text-amber-300">
                <Sparkles className="w-4 h-4 shrink-0 text-[#651317] dark:text-amber-400" />
                <span className="leading-snug">{copy.selectTitle}</span>
              </h3>
              <div className="flex items-center gap-2 shrink-0">
                <button
                  type="button"
                  onClick={() => setShowAddMantraModal(true)}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-[#E8D8C4] dark:border-stone-700 bg-[#FFFDF8] dark:bg-stone-900 text-[#651317] dark:text-amber-300 text-xs font-bold hover:bg-[#FAF0E4] active:scale-95 transition-all"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>{isHi ? "नया मंत्र" : "Add Mantra"}</span>
                </button>
                {mantrasLoading && (
                  <span className="text-[11px] animate-pulse text-[#786252]">
                    {isHi ? "लोड हो रहा है..." : "Loading..."}
                  </span>
                )}
              </div>
            </div>

            {mantras.length === 0 && !mantrasLoading ? (
              <div className="text-center py-12 bg-[#FFFDF8] dark:bg-stone-900 border border-[#E8D8C4] dark:border-stone-700 rounded-2xl">
                <p className="text-[#786252] text-sm">
                  {isHi
                    ? "मंत्र लोड नहीं हो सके। कृपया पुनः प्रयास करें।"
                    : "Could not load mantras. Please check your connection."}
                </p>
                <button
                  type="button"
                  onClick={refresh}
                  className="mt-4 text-[#651317] dark:text-amber-400 text-xs font-bold hover:underline inline-flex items-center gap-1 mx-auto"
                >
                  <RotateCcw className="w-3 h-3" /> {isHi ? "पुनः लोड करें" : "Retry"}
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full">
                {mantras.map((m) => {
                  const cardData = getMantraCardData(m);
                  const image = resolveMantraImage(m);
                  const isLastChanted = m.id === lastChantedMantraId;

                  return (
                    <motion.div
                      key={m.id}
                      onClick={() => {
                        setSelectedMantraForDetail(m);
                        setSearchParams({
                          practice: "mantra_jap_home",
                          mantraId: m.id,
                        });
                      }}
                      whileHover={{ y: -2 }}
                      role="button"
                      tabIndex={0}
                      onKeyDown={(e) => {
                        if (e.key === "Enter" || e.key === " ") {
                          e.preventDefault();
                          setSelectedMantraForDetail(m);
                          setSearchParams({
                            practice: "mantra_jap_home",
                            mantraId: m.id,
                          });
                        }
                      }}
                      className={cn(
                        "group relative w-full flex items-center rounded-2xl border p-4 sm:p-5 text-left cursor-pointer transition-all overflow-hidden",
                        "bg-[#FFFDF8] dark:bg-stone-900 border-[#E8D8C4] dark:border-stone-700 hover:border-[#651317]/40 dark:hover:border-amber-500/40",
                        isLastChanted && "bg-[#651317]/[0.06] dark:bg-amber-500/10"
                      )}
                    >
                      {isLastChanted && (
                        <span className="absolute left-0 top-0 bottom-0 w-[3px] bg-[#651317] dark:bg-amber-400" />
                      )}

                      <div className="relative h-14 w-14 sm:h-16 sm:w-16 shrink-0 overflow-hidden rounded-full border border-[#E8D8C4] dark:border-stone-600 bg-[#FAF0E4] dark:bg-stone-800 flex items-center justify-center mr-4">
                        {image ? (
                          <img
                            src={image}
                            alt=""
                            className="h-full w-full object-cover transition duration-300 group-hover:scale-105"
                          />
                        ) : (
                          <span className="text-xl font-display text-[#651317] dark:text-amber-300">ॐ</span>
                        )}
                      </div>

                      <div className="flex-1 min-w-0">
                        <h4 className="font-display text-base sm:text-[17px] font-bold leading-tight text-[#3A2418] dark:text-amber-50 truncate">
                          {isHi ? m.name_hindi : m.name_english}
                        </h4>
                        <p className="text-[11px] sm:text-xs font-medium mt-0.5 truncate text-[#786252] dark:text-stone-400">
                          {m.name_english}
                        </p>
                        <div className="mt-2.5 flex items-center gap-5 sm:gap-8 w-full">
                          <div>
                            <p className="text-sm font-bold tabular-nums text-[#651317] dark:text-amber-300">
                              {cardData.today}
                            </p>
                            <p className="text-[9px] font-bold uppercase tracking-wider mt-0.5 text-[#786252]">
                              {isHi ? "आज" : "Today"}
                            </p>
                          </div>
                          <div>
                            <p className="text-sm font-bold tabular-nums text-[#3A2418] dark:text-amber-100">
                              {cardData.chants.toLocaleString()}
                            </p>
                            <p className="text-[9px] font-bold uppercase tracking-wider mt-0.5 text-[#786252]">
                              {isHi ? "कुल" : "Total"}
                            </p>
                          </div>
                          <div>
                            <p className="text-sm font-bold tabular-nums text-[#3A2418] dark:text-amber-100">
                              {cardData.streak}d
                            </p>
                            <p className="text-[9px] font-bold uppercase tracking-wider mt-0.5 text-[#786252]">
                              {isHi ? "दिन" : "Streak"}
                            </p>
                          </div>
                        </div>
                      </div>

                      <div className="shrink-0 flex items-center gap-1 pl-1">
                        {m.id.startsWith("custom-") && (
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              if (
                                confirm(
                                  isHi
                                    ? "क्या आप इस मंत्र को हटाना चाहते हैं?"
                                    : "Are you sure you want to delete this mantra?"
                                )
                              ) {
                                deleteCustomMantra(m.id);
                              }
                            }}
                            className="p-2 text-red-600/70 hover:text-red-700 hover:bg-red-50 rounded-xl transition-all active:scale-95 z-20"
                            title={isHi ? "मंत्र हटाएं" : "Delete Mantra"}
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                        <ChevronRight className="w-5 h-5 text-[#E8D8C4] group-hover:text-[#651317] dark:text-stone-600 dark:group-hover:text-amber-400 transition-colors" />
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            )}
          </section>

          {/* Beginners guide */}
          <div className="max-w-3xl mx-auto w-full">
            <section className="w-full bg-[#FFFDF8] dark:bg-stone-900 border border-[#E8D8C4] dark:border-stone-700 rounded-2xl overflow-hidden">
              <button
                type="button"
                onClick={() => setIsBeginnerOpen(!isBeginnerOpen)}
                className="w-full flex items-center justify-between p-5 hover:bg-[#FAF0E4]/50 dark:hover:bg-stone-800/50 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-[#E8D8C4] dark:border-stone-700 bg-[#FAF0E4] dark:bg-amber-500/10 text-[#651317] dark:text-amber-300">
                    <UserRound className="w-5 h-5" />
                  </div>
                  <h3 className="text-base font-bold text-left text-[#651317] dark:text-amber-100">
                    {isHi ? "शुरुआती साधकों के लिए" : "For Beginners"}
                  </h3>
                </div>
                <motion.div
                  animate={{ rotate: isBeginnerOpen ? 180 : 0 }}
                  transition={{ duration: 0.2 }}
                  className="text-[#651317] dark:text-amber-400"
                >
                  <ChevronDown className="w-5 h-5" />
                </motion.div>
              </button>

              <AnimatePresence initial={false}>
                {isBeginnerOpen && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.28, ease: "easeInOut" }}
                    className="border-t border-[#E8D8C4]/80 dark:border-stone-800"
                  >
                    <div className="p-5 space-y-3.5">
                      {[
                        {
                          hi: "एक मंत्र चुनें और नियमित समय तय करें",
                          en: "Choose one mantra and set a fixed daily time.",
                        },
                        {
                          hi: "शुरुआत 11, 21 या 108 जाप से करें",
                          en: "Start with 11, 21, or 108 chants.",
                        },
                        {
                          hi: "प्रतिदिन एक ही समय पर अभ्यास करें",
                          en: "Practice at the same time every day.",
                        },
                        {
                          hi: "भक्ति, विश्वास और निरंतरता बनाए रखें",
                          en: "Maintain devotion, faith, and consistency.",
                        },
                      ].map((item, idx) => (
                        <div key={idx} className="flex items-start gap-3">
                          <LotusMark className="w-4 h-3 shrink-0 mt-1.5" />
                          <span className="text-sm font-medium leading-relaxed text-[#3A2418] dark:text-stone-200">
                            {isHi ? item.hi : item.en}
                          </span>
                        </div>
                      ))}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </section>
          </div>

          {/* Benefits */}
          <section id="japa-benefits" className="space-y-5 scroll-mt-24 pb-2">
            <h3 className="text-base md:text-lg font-bold text-center flex items-center justify-center gap-2 text-[#651317] dark:text-amber-300">
              <span className="text-[#D9A441]">—◆—</span>
              {isHi ? "मंत्र जाप के लाभ" : "Benefits of Mantra Japa"}
              <span className="text-[#D9A441]">—◆—</span>
            </h3>

            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
              {[
                {
                  icon: YogiIcon,
                  titleHi: "मानसिक शांति",
                  titleEn: "Mental Peace",
                  descHi: "मन के विचार शांत होते हैं और तनाव कम होता है।",
                  descEn: "Calms thoughts, eases the mind, and reduces daily stress.",
                },
                {
                  icon: Target,
                  titleHi: "एकाग्रता में वृद्धि",
                  titleEn: "Enhanced Focus",
                  descHi: "एकाग्रता, स्मरण शक्ति और ध्यान की क्षमता बढ़ती है।",
                  descEn: "Improves concentration, memory retention, and focus.",
                },
                {
                  icon: Sun,
                  titleHi: "सकारात्मक ऊर्जा",
                  titleEn: "Positive Energy",
                  descHi: "नकारात्मकता दूर होती है और सकारात्मक ऊर्जा मिलती है।",
                  descEn: "Dispels negative vibes and fills you with positive energy.",
                },
                {
                  icon: Heart,
                  titleHi: "आध्यात्मिक उन्नति",
                  titleEn: "Spiritual Growth",
                  descHi: "ईश्वर से जुड़ाव गहरा होता है और आध्यात्मिक विकास होता है।",
                  descEn: "Deepens connection with the divine and triggers inner growth.",
                },
              ].map((card, idx) => (
                <div
                  key={idx}
                  className="bg-[#FFFDF8] dark:bg-stone-900 border border-[#E8D8C4] dark:border-stone-700 rounded-2xl p-3.5 sm:p-5 flex flex-col items-center text-center space-y-2.5 transition-all hover:-translate-y-0.5"
                >
                  <div className="flex h-11 w-11 sm:h-12 sm:w-12 items-center justify-center rounded-2xl border border-[#E8D8C4] dark:border-stone-700 bg-[#FAF0E4] dark:bg-amber-500/10 text-[#651317] dark:text-amber-300">
                    <card.icon className="w-5 h-5 sm:w-6 sm:h-6" />
                  </div>
                  <div className="space-y-1">
                    <h4 className="font-bold text-[13px] sm:text-sm text-[#3A2418] dark:text-amber-50 leading-snug">
                      {isHi ? card.titleHi : card.titleEn}
                    </h4>
                    <p className="text-[10px] sm:text-xs leading-relaxed text-[#786252] dark:text-stone-400">
                      {isHi ? card.descHi : card.descEn}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </section>
        </div>
      </div>

      {/* Add custom mantra modal */}
      <AnimatePresence>
        {showAddMantraModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="relative w-full max-w-md overflow-hidden rounded-2xl border border-[#E8D8C4] dark:border-stone-700 bg-[#FFFDF8] dark:bg-stone-900 p-6 shadow-2xl"
            >
              <button
                type="button"
                onClick={() => {
                  setShowAddMantraModal(false);
                  setCustomMantraHindi("");
                  setCustomMantraEnglish("");
                }}
                className="absolute top-4 right-4 p-2 rounded-full text-[#786252] hover:bg-[#FAF0E4] dark:hover:bg-stone-800 transition-all"
              >
                <X className="w-4 h-4" />
              </button>

              <div className="flex items-center gap-2.5 mb-6">
                <LotusMark className="w-5 h-4 shrink-0" />
                <h3 className="text-lg font-bold font-display text-[#651317] dark:text-amber-100">
                  {isHi ? "अपना मंत्र जोड़ें" : "Add Custom Mantra"}
                </h3>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider mb-1.5 text-[#651317] dark:text-amber-300/90">
                    {isHi ? "मंत्र (हिंदी में)" : "Mantra (in Hindi)"}
                  </label>
                  <input
                    type="text"
                    value={customMantraHindi}
                    onChange={(e) => setCustomMantraHindi(e.target.value)}
                    placeholder={isHi ? "उदा. ॐ नमः शिवाय" : "e.g., ॐ नमः शिवाय"}
                    className="w-full px-4 py-3 border border-[#E8D8C4] dark:border-stone-700 rounded-xl focus:outline-none focus:border-[#651317] dark:focus:border-amber-500 bg-white dark:bg-stone-800 text-[#3A2418] dark:text-amber-50 placeholder:text-[#786252]/60 text-sm"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider mb-1.5 text-[#651317] dark:text-amber-300/90">
                    {isHi ? "मंत्र (अंग्रेजी/अनुवाद)" : "Mantra (in English/Transliteration)"}
                  </label>
                  <input
                    type="text"
                    value={customMantraEnglish}
                    onChange={(e) => setCustomMantraEnglish(e.target.value)}
                    placeholder={isHi ? "उदा. Om Namah Shivaya" : "e.g., Om Namah Shivaya"}
                    className="w-full px-4 py-3 border border-[#E8D8C4] dark:border-stone-700 rounded-xl focus:outline-none focus:border-[#651317] dark:focus:border-amber-500 bg-white dark:bg-stone-800 text-[#3A2418] dark:text-amber-50 placeholder:text-[#786252]/60 text-sm"
                  />
                </div>

                <div className="pt-2 flex gap-3">
                  <button
                    type="button"
                    onClick={() => {
                      setShowAddMantraModal(false);
                      setCustomMantraHindi("");
                      setCustomMantraEnglish("");
                    }}
                    className="flex-1 py-3 border border-[#E8D8C4] dark:border-stone-700 rounded-xl text-sm font-bold bg-[#FAF0E4] dark:bg-stone-800 text-[#3A2418] dark:text-amber-100 active:scale-95 transition-all"
                  >
                    {isHi ? "रद्द करें" : "Cancel"}
                  </button>
                  <button
                    type="button"
                    onClick={async () => {
                      const hin = customMantraHindi.trim();
                      const eng = customMantraEnglish.trim();
                      if (!hin || !eng) {
                        alert(isHi ? "कृपया दोनों फ़ील्ड भरें।" : "Please fill in both fields.");
                        return;
                      }
                      addCustomMantra(hin, eng);
                      setShowAddMantraModal(false);
                      setCustomMantraHindi("");
                      setCustomMantraEnglish("");
                    }}
                    className="flex-1 py-3 rounded-xl text-sm font-bold bg-[#651317] hover:bg-[#4f0f12] text-white active:scale-95 transition-all"
                  >
                    {isHi ? "जोड़ें" : "Add Mantra"}
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
