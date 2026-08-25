import { useState, useMemo, useCallback, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Play,
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
} from "lucide-react";
import { useLanguage } from "@/hooks/useLanguage";
import { useTheme } from "@/hooks/useTheme";
import { useSearchParams, useNavigate, Link } from "react-router-dom";
import { useMantraJapa, resolveMantraImage, DEITY_OPTIONS } from "@/hooks/useMantraJapa";
import MantraDetailView from "./MantraDetailView";
import MantraSetupView from "./MantraSetupView";
import { cn } from "@/lib/utils";
import mantraJapBanner from "@/pages/images/mantra_jap_banner.webp";
import type { Mantra } from "@/lib/mantraJapa/mantraJapaApi";
import { SEO } from "@/components/SEO";
import { prefetchMantraImage } from "@/lib/prefetchMeditation";
import MeditationTopBar from "./MeditationTopBar";
import {
  getMantraCanonicalPath,
  getMantraCanonicalUrl,
  getPersonalMantraPath,
} from "@/lib/mantraJapa/mantraSlugs";

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
    personalMantras,
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
    addPersonalMantra,
    deletePersonalMantra,
  } = useMantraJapa();

  // ─── Local UI State ────────────────────────────────────────────
  const [selectedMantraForDetail, setSelectedMantraForDetail] = useState<Mantra | null>(null);
  const [showSetup, setShowSetup] = useState(false);
  const [searchParams] = useSearchParams();
  const [showAddMantraModal, setShowAddMantraModal] = useState(false);
  const [customMantraHindi, setCustomMantraHindi] = useState("");
  const [customMantraEnglish, setCustomMantraEnglish] = useState("");
  const [selectedDeity, setSelectedDeity] = useState<string>("om");
  const [mantraToDelete, setMantraToDelete] = useState<PersonalMantra | null>(null);
  const [modalError, setModalError] = useState<string | null>(null);

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
    navigate(getMantraCanonicalPath(target.slug));
  }, [mantras, mantraTotalsMap, navigate]);

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

  const copy = {
    title: isHi ? "मंत्र जाप" : "Mantra Japa",
    selectTitle: isHi ? "मंत्र चुनें और जप शुरू करें" : "Select Mantra & Start",
  };

  const handleChromeBack = () => {
    if (!selectedMantraForDetail) {
      onBack();
      return;
    }
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
  };

  const handleShare = () => {
    const url = selectedMantraForDetail
      ? getMantraCanonicalUrl(selectedMantraForDetail.slug)
      : (typeof window !== "undefined" ? `${window.location.origin}/meditation/mantra-japa` : "https://raghavam.com/meditation/mantra-japa");
    const title = selectedMantraForDetail
      ? isHi
        ? selectedMantraForDetail.name_hindi
        : selectedMantraForDetail.name_english
      : copy.title;
    if (navigator.share) {
      navigator.share({ title, url, text: title }).catch(() => {});
    } else {
      void navigator.clipboard.writeText(url);
    }
  };

  const barTitle = selectedMantraForDetail
    ? isHi
      ? selectedMantraForDetail.name_hindi
      : selectedMantraForDetail.name_english
    : copy.title;

  return (
    <div
      className={cn(
        "relative flex flex-col h-full min-h-0 flex-1 overflow-hidden transition-colors duration-300",
        isDark ? "text-amber-50 bg-[#0c0a08]" : "text-[#3A2418] bg-[#FAF6EE]"
      )}
    >
      <SEO
        title={
          selectedMantraForDetail
            ? isHi
              ? selectedMantraForDetail.name_hindi
              : selectedMantraForDetail.name_english
            : isHi
              ? "मंत्र जाप साधना"
              : "Mantra Japa Sadhana"
        }
        description={
          isHi
            ? "मंत्र चुनें और माला या ध्वनि से जप करें। नियमित जाप से मन शांत और एकाग्र होता है।"
            : "Choose a mantra and chant with mala or voice. Daily japa calms the mind and sharpens focus."
        }
        image={mantraJapBanner}
        url={
          selectedMantraForDetail
            ? getMantraCanonicalUrl(selectedMantraForDetail.slug)
            : (typeof window !== "undefined" ? `${window.location.origin}/meditation/mantra-japa` : "https://raghavam.com/meditation/mantra-japa")
        }
        lang={isHi ? "hi" : "en"}
      />
      <MeditationTopBar
        title={barTitle}
        onBack={handleChromeBack}
        onShare={handleShare}
        onTrophy={selectedMantraForDetail ? undefined : () => navigate("/leaderboard")}
        trailing={
          isGuest ? (
            <span className="text-[10px] px-2 py-1 rounded-full border border-[#E8D8C4] bg-[#FAF0E4] text-[#651317] font-bold dark:bg-amber-500/15 dark:border-amber-500/40 dark:text-amber-300">
              {isHi ? "अतिथि" : "Guest"}
            </span>
          ) : null
        }
      />

      {selectedMantraForDetail ? (
        <div className="flex flex-col h-full min-h-0 flex-1 relative">
          <MantraDetailView
            mantra={selectedMantraForDetail}
            image={resolveMantraImage(selectedMantraForDetail)}
            stats={mantraTotalsMap[selectedMantraForDetail.id]}
            onBack={handleChromeBack}
            onStartJapa={() => {
              setShowSetup(true);
            }}
          />
          <AnimatePresence>
            {showSetup && (
              <MantraSetupView
                mantra={selectedMantraForDetail}
                initialGroupId={searchParams.get("groupId")}
                onBack={() => {
                  setShowSetup(false);
                }}
                onStartJapa={(opts) => {
                  const gId = opts.groupId || searchParams.get("groupId");
                  const retUrl = searchParams.get("returnUrl");
                  void import("@/components/meditation/PremiumJapaCounter");
                  navigate(getMantraCanonicalPath(selectedMantraForDetail.slug), {
                    state: {
                      groupId: gId || undefined,
                      returnUrl: retUrl || undefined,
                      targetCount: opts.targetCount,
                      practiceMode: opts.practiceMode,
                      sankalpText: opts.sankalpText,
                    },
                  });
                }}
              />
            )}
          </AnimatePresence>
        </div>
      ) : (
        <>
      {!isDark && (
        <div
          className="absolute inset-0 -z-20 pointer-events-none"
          style={{
            background: "linear-gradient(180deg, #FFFDF8 0%, #FAF6EE 45%, #F5EDE0 100%)",
          }}
        />
      )}

      <div className="flex-1 overflow-y-auto overflow-x-hidden pb-8">
        <div className="mx-auto max-w-5xl px-4 lg:px-6 mt-4 space-y-5">
          <section className="relative w-full h-[220px] sm:h-[240px] md:h-[300px] lg:h-[340px] overflow-hidden rounded-[24px] border border-[#E8D8C4] dark:border-amber-500/20 shadow-[0_10px_30px_rgba(42,18,15,0.08)] dark:shadow-[0_12px_36px_rgba(0,0,0,0.5)] flex flex-col justify-end">
            <div className="absolute inset-0 z-0 select-none pointer-events-none overflow-hidden rounded-[inherit]">
              <img
                src={mantraJapBanner}
                alt="Mantra Japa Sacred Banner"
                width={1971}
                height={798}
                loading="eager"
                decoding="async"
                className="w-full h-full object-cover object-[72%_center] md:object-[center_38%]"
              />
              {/* Soft, light directional overlay — keeping image bright, golden & vibrant */}
              <div className="absolute inset-0 bg-gradient-to-r from-black/55 via-black/25 to-transparent" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/35 via-transparent to-transparent" />
            </div>

            <h1 className="sr-only">{copy.title}</h1>
            <div className="relative z-10 px-5 pt-5 pb-6 sm:px-8 sm:pt-6 sm:pb-8 text-left max-w-xl md:max-w-lg">
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
          <section id="mantra-list" className="space-y-3.5 scroll-mt-4">
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
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-5 w-full">
                {mantras.map((m) => {
                  const cardData = getMantraCardData(m);
                  const image = resolveMantraImage(m);

                  return (
                    <motion.div
                      key={m.id}
                      onClick={() => {
                        navigate(getMantraCanonicalPath(m.slug));
                      }}
                      onPointerEnter={() => prefetchMantraImage(image)}
                      whileHover={{ y: -2 }}
                      role="button"
                      tabIndex={0}
                      onKeyDown={(e) => {
                        if (e.key === "Enter" || e.key === " ") {
                          e.preventDefault();
                          navigate(getMantraCanonicalPath(m.slug));
                        }
                      }}
                      className={cn(
                        "group relative w-full flex items-center rounded-2xl border p-4 sm:p-5 text-left cursor-pointer transition-all overflow-hidden",
                        "bg-[#FFFDF8] dark:bg-stone-900 border-[#E8D8C4] dark:border-stone-700 hover:border-[#651317]/40 dark:hover:border-amber-500/40"
                      )}
                    >
                      <div className="relative h-14 w-14 sm:h-16 sm:w-16 shrink-0 overflow-hidden rounded-full border border-[#E8D8C4] dark:border-stone-600 bg-[#FAF0E4] dark:bg-stone-800 flex items-center justify-center mr-4">
                        {image ? (
                          <img
                            src={image}
                            alt=""
                            width={480}
                            height={480}
                            loading="lazy"
                            decoding="async"
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
                        <ChevronRight className="w-5 h-5 text-[#E8D8C4] group-hover:text-[#651317] dark:text-stone-600 dark:group-hover:text-amber-400 transition-colors" />
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            )}
          </section>

          {/* Personal Mantras Section (Private) */}
          {personalMantras.length > 0 && (
            <section className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="flex h-6 w-6 items-center justify-center rounded-lg bg-[#651317]/10 dark:bg-amber-500/15 text-[#651317] dark:text-amber-300">
                    <Sparkles className="w-3.5 h-3.5" />
                  </span>
                  <h3 className="font-display font-bold text-lg text-[#3A2418] dark:text-amber-100">
                    {isHi ? "व्यक्तिगत मंत्र" : "My Personal Mantras"}
                  </h3>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-5 w-full">
                {personalMantras.map((pm) => {
                  const pmImage = resolveMantraImage(pm);
                  return (
                    <motion.div
                      key={pm.id}
                      onClick={() => {
                        navigate(getPersonalMantraPath(pm.id));
                      }}
                      onPointerEnter={() => prefetchMantraImage(pmImage)}
                      whileHover={{ y: -2 }}
                      role="button"
                      tabIndex={0}
                      onKeyDown={(e) => {
                        if (e.key === "Enter" || e.key === " ") {
                          e.preventDefault();
                          navigate(getPersonalMantraPath(pm.id));
                        }
                      }}
                      className={cn(
                        "group relative w-full flex items-center rounded-2xl border p-4 sm:p-5 text-left cursor-pointer transition-all overflow-hidden",
                        "bg-[#FFFDF8] dark:bg-stone-900 border-[#E8D8C4] dark:border-stone-700 hover:border-[#651317]/40 dark:hover:border-amber-500/40"
                      )}
                    >
                      <div className="relative h-14 w-14 sm:h-16 sm:w-16 shrink-0 overflow-hidden rounded-full border border-[#E8D8C4] dark:border-stone-600 bg-[#FAF0E4] dark:bg-stone-800 flex items-center justify-center mr-4">
                        <img
                          src={pmImage}
                          alt=""
                          width={480}
                          height={480}
                          loading="lazy"
                          decoding="async"
                          className="h-full w-full object-cover transition duration-300 group-hover:scale-105"
                        />
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <h4 className="font-display text-base sm:text-[17px] font-bold leading-tight text-[#3A2418] dark:text-amber-50 truncate">
                            {isHi ? pm.name_hindi : pm.name_english}
                          </h4>
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#FAF0E4] dark:bg-stone-800 text-[#651317] dark:text-amber-300 border border-[#E8D8C4] dark:border-stone-700">
                            {isHi ? "व्यक्तिगत" : "Personal"}
                          </span>
                        </div>
                        <p className="text-[11px] sm:text-xs font-medium mt-0.5 truncate text-[#786252] dark:text-stone-400">
                          {pm.name_english}
                        </p>
                      </div>

                      <div className="shrink-0 flex items-center gap-1 pl-1">
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            setMantraToDelete(pm);
                          }}
                          className="p-2 text-red-600/70 hover:text-red-700 hover:bg-red-50 dark:hover:bg-stone-800 rounded-xl transition-all active:scale-95 z-20"
                          title={isHi ? "मंत्र हटाएं" : "Delete Mantra"}
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                        <ChevronRight className="w-5 h-5 text-[#E8D8C4] group-hover:text-[#651317] dark:text-stone-600 dark:group-hover:text-amber-400 transition-colors" />
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            </section>
          )}

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
                          en: "Choose a mantra and set a fixed daily time",
                        },
                        {
                          hi: "शांत स्थान पर बैठें और मन को शांत रखें",
                          en: "Sit in a calm place with quiet focus",
                        },
                        {
                          hi: "आरंभ में 108 जप का लक्ष्य रखें",
                          en: "Start with a target of 108 chants",
                        },
                        {
                          hi: "प्रतिदिन नियमपूर्वक जप करने से ध्यान गहरा होता है",
                          en: "Daily consistency deepens focus and spiritual strength",
                        },
                      ].map((item, idx) => (
                        <div key={idx} className="flex items-start gap-3">
                          <div className="h-2 w-2 rounded-full bg-[#651317] dark:bg-amber-400 mt-1.5 shrink-0" />
                          <p className="text-xs sm:text-sm text-[#3A2418] dark:text-stone-300">
                            {isHi ? item.hi : item.en}
                          </p>
                        </div>
                      ))}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </section>
          </div>

          {/* Bottom subtle note */}
          <div className="text-center py-6">
            <p className="text-[11px] font-medium tracking-wide text-[#786252] dark:text-stone-400">
              {isHi
                ? "ॐ श्री गुरुभ्यो नमः • राघवं साधना केंद्र"
                : "Om Shri Gurubhyo Namaha • Raghavam Sadhana Hub"}
            </p>
          </div>
        </div>
      </div>

      {/* Delete Personal Mantra Confirmation Modal */}
      <AnimatePresence>
        {mantraToDelete && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              className="w-full max-w-sm bg-[#FFFDF8] dark:bg-stone-900 border border-[#E8D8C4] dark:border-stone-700 rounded-2xl p-6 shadow-2xl space-y-4 text-center"
            >
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400">
                <Trash2 className="w-6 h-6" />
              </div>

              <div className="space-y-1.5">
                <h3 className="font-display font-bold text-lg text-[#3A2418] dark:text-amber-100">
                  {isHi ? "मंत्र हटाएं?" : "Delete Personal Mantra?"}
                </h3>
                <p className="text-xs text-[#786252] dark:text-stone-400 leading-relaxed">
                  {isHi
                    ? `क्या आप वाकई "${mantraToDelete.name_hindi || mantraToDelete.name_english}" को अपनी सूची से हटाना चाहते हैं? यह क्रिया वापस नहीं ली जा सकती।`
                    : `Are you sure you want to remove "${mantraToDelete.name_english || mantraToDelete.name_hindi}" from your mantras? This action cannot be undone.`}
                </p>
              </div>

              <div className="pt-2 flex gap-3">
                <button
                  type="button"
                  onClick={() => setMantraToDelete(null)}
                  className="flex-1 py-2.5 border border-[#E8D8C4] dark:border-stone-700 rounded-xl text-xs font-bold bg-[#FAF0E4] dark:bg-stone-800 text-[#3A2418] dark:text-amber-100 active:scale-95 transition-all"
                >
                  {isHi ? "रद्द करें" : "Cancel"}
                </button>
                <button
                  type="button"
                  onClick={async () => {
                    const id = mantraToDelete.id;
                    setMantraToDelete(null);
                    await deletePersonalMantra(id);
                  }}
                  className="flex-1 py-2.5 rounded-xl text-xs font-bold bg-red-600 hover:bg-red-700 text-white active:scale-95 transition-all shadow-sm"
                >
                  {isHi ? "हटाएं" : "Delete"}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Add Custom Mantra Modal */}
      <AnimatePresence>
        {showAddMantraModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              className="w-full max-w-md bg-[#FFFDF8] dark:bg-stone-900 border border-[#E8D8C4] dark:border-stone-700 rounded-2xl p-6 shadow-2xl space-y-4"
            >
              <div className="flex items-center justify-between border-b border-[#E8D8C4]/60 dark:border-stone-800 pb-3">
                <h3 className="font-display font-bold text-lg text-[#651317] dark:text-amber-100 flex items-center gap-2">
                  <LotusMark className="w-5 h-4" />
                  {isHi ? "नया व्यक्तिगत मंत्र जोड़ें" : "Add Personal Mantra"}
                </h3>
                <button
                  type="button"
                  onClick={() => {
                    setShowAddMantraModal(false);
                    setModalError(null);
                  }}
                  className="p-1 rounded-lg text-[#786252] hover:bg-[#FAF0E4] dark:hover:bg-stone-800"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {modalError && (
                <div className="p-2.5 rounded-xl bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800/40 text-red-700 dark:text-red-300 text-xs font-medium text-center">
                  {modalError}
                </div>
              )}

              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider mb-1.5 text-[#651317] dark:text-amber-300/90">
                    {isHi ? "मंत्र (हिंदी में)" : "Mantra (in Hindi)"}
                  </label>
                  <input
                    type="text"
                    value={customMantraHindi}
                    onChange={(e) => {
                      setCustomMantraHindi(e.target.value);
                      if (modalError) setModalError(null);
                    }}
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
                    onChange={(e) => {
                      setCustomMantraEnglish(e.target.value);
                      if (modalError) setModalError(null);
                    }}
                    placeholder={isHi ? "उदा. Om Namah Shivaya" : "e.g., Om Namah Shivaya"}
                    className="w-full px-4 py-3 border border-[#E8D8C4] dark:border-stone-700 rounded-xl focus:outline-none focus:border-[#651317] dark:focus:border-amber-500 bg-white dark:bg-stone-800 text-[#3A2418] dark:text-amber-50 placeholder:text-[#786252]/60 text-sm"
                  />
                </div>

                {/* Deity / Divine Form Picker */}
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider mb-2 text-[#651317] dark:text-amber-300/90">
                    {isHi ? "भगवान चुनें" : "Select Deity"}
                  </label>
                  <div className="grid grid-cols-3 gap-2.5 max-h-52 overflow-y-auto pr-1 p-0.5">
                    {DEITY_OPTIONS.map((d) => {
                      const isSelected = selectedDeity === d.id;
                      return (
                        <button
                          key={d.id}
                          type="button"
                          onClick={() => setSelectedDeity(d.id)}
                          className={cn(
                            "flex flex-col items-center justify-center gap-1.5 p-2.5 sm:p-3 rounded-2xl border text-center transition-all min-h-[92px]",
                            isSelected
                              ? "border-[#651317] dark:border-amber-400 bg-[#FAF0E4] dark:bg-amber-500/15 ring-2 ring-[#651317]/20 dark:ring-amber-400/30 shadow-sm"
                              : "border-[#E8D8C4] dark:border-stone-700 bg-white/70 dark:bg-stone-800/80 hover:border-amber-400/60"
                          )}
                        >
                          <div className="relative h-11 w-11 shrink-0 overflow-hidden rounded-full border border-[#E8D8C4] dark:border-stone-600 bg-[#FAF0E4] dark:bg-stone-700 flex items-center justify-center">
                            <img
                              src={d.image}
                              alt={d.nameEn}
                              className="h-full w-full object-cover"
                            />
                          </div>
                          <span className="text-[11px] sm:text-xs font-semibold leading-tight text-[#3A2418] dark:text-amber-100 break-words text-center">
                            {isHi ? d.nameHi : d.nameEn}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div className="pt-2 flex gap-3">
                  <button
                    type="button"
                    onClick={() => {
                      setShowAddMantraModal(false);
                      setCustomMantraHindi("");
                      setCustomMantraEnglish("");
                      setSelectedDeity("om");
                      setModalError(null);
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
                        setModalError(isHi ? "कृपया दोनों फ़ील्ड भरें।" : "Please fill in both fields.");
                        return;
                      }
                      await addPersonalMantra({ name_hindi: hin, name_english: eng, deity: selectedDeity });
                      setShowAddMantraModal(false);
                      setCustomMantraHindi("");
                      setCustomMantraEnglish("");
                      setSelectedDeity("om");
                      setModalError(null);
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
        </>
      )}
    </div>
  );
}
