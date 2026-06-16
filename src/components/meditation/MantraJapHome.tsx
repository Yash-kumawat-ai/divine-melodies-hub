import { useState, useMemo, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Flame,
  Play,
  ArrowLeft,
  Bell,
  Clock3,
  Flower2,
  Sparkles,
  Plus,
  X,
  TrendingUp,
  Timer,
  RotateCcw,
  ChevronRight,
  Heart,
  ChevronDown,
  Check,
  UserRound,
  Sun,
  Target,
  Wind,
} from "lucide-react";
import { useLanguage } from "@/hooks/useLanguage";
import { useMantraJapa, resolveMantraImage } from "@/hooks/useMantraJapa";
import JapaCounter from "@/components/devotion/JapaCounter";
import MantraDetailView from "./MantraDetailView";
import MantraSetupView from "./MantraSetupView";
import PremiumJapaCounter from "./PremiumJapaCounter";
import meditationDesktopBg from "@/pages/images/meditation_desktop_wallpaper.webp";
import diyaAndMalaImg from "@/pages/images/diya_and_mala.jpg";
import type { Mantra } from "@/lib/mantraJapa/mantraJapaApi";

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
  } = useMantraJapa();

  // ─── Local UI State ────────────────────────────────────────────
  const [activeMantra, setActiveMantra] = useState<Mantra | null>(null);
  const [selectedMantraForDetail, setSelectedMantraForDetail] = useState<Mantra | null>(null);
  const [showSetup, setShowSetup] = useState(false);
  const [setupConfig, setSetupConfig] = useState<{
    sankalpText: string;
    targetCount: number;
    practiceMode: "mala" | "tap" | "voice" | "guided";
  } | null>(null);
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
    setActiveMantra(best || mantras[0]);
  }, [mantras, mantraTotalsMap]);

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
    heroTitle: isHi ? "आज का जप" : "Today's Japa",
    continueBtn: isHi ? "पिछला सत्र जारी रखें" : "Continue Last Session",
    sadhanaTitle: isHi ? "आपकी साधना" : "Your Sadhana",
    stats: [
      { label: isHi ? "कुल जाप" : "Total Chants", icon: MalaIcon },
      { label: isHi ? "दिन की streak" : "Days Streak", icon: Flame },
      { label: isHi ? "मालाएं पूरी" : "Malas Completed", icon: Flower2 },
      { label: isHi ? "आज का कुल" : "Today's Total", icon: ConcentricCirclesIcon },
    ],
    selectTitle: isHi ? "मंत्र चुनें और जप शुरू करें" : "Select Mantra & Start",
    sankalpTitle: isHi ? "आपका संकल्प" : "Your Sankalp / Intention",
    lastChanted: isHi ? "जाप किए" : "Chants:",
    lastDateLabel: isHi ? "अंतिम" : "Last:",
  };

  const statValues = [
    stats.totalChants.toLocaleString(),
    String(stats.currentStreak),
    String(stats.totalMalas),
    String(stats.todayChants),
  ];

  // ─── Render ────────────────────────────────────────────────────
  if (selectedMantraForDetail) {
    return (
      <>
        {showSetup ? (
          <MantraSetupView
            mantra={selectedMantraForDetail}
            onBack={() => setShowSetup(false)}
            onStartJapa={(opts) => {
              setSetupConfig(opts);
              setActiveMantra(selectedMantraForDetail);
            }}
          />
        ) : (
          <MantraDetailView
            mantra={selectedMantraForDetail}
            image={resolveMantraImage(selectedMantraForDetail)}
            stats={mantraTotalsMap[selectedMantraForDetail.id]}
            onBack={() => setSelectedMantraForDetail(null)}
            onStartJapa={() => setShowSetup(true)}
          />
        )}
        <AnimatePresence>
          {activeMantra && (
            <PremiumJapaCounter
              mantra={activeMantra}
              sankalpText={setupConfig?.sankalpText || activeSankalpText}
              targetCount={setupConfig?.targetCount || japaTarget}
              practiceMode={setupConfig?.practiceMode || "mala"}
              onClose={() => setActiveMantra(null)}
              onComplete={(actualCount, durationSeconds) => {
                completeSession({
                  mantraId: activeMantra.id,
                  mantraLabel: activeMantra.name_english,
                  sankalp: setupConfig?.sankalpText || activeSankalpText,
                  targetCount: setupConfig?.targetCount || japaTarget,
                  actualCount: actualCount,
                  durationSeconds: durationSeconds,
                });
                refresh();
                setActiveMantra(null);
                setShowSetup(false);
                setSelectedMantraForDetail(null);
              }}
            />
          )}
        </AnimatePresence>
      </>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#080504] via-[#0c0608] to-[#050306] pb-28 text-amber-50 lg:pb-12">
      <div className="pointer-events-none fixed inset-0 -z-10 bg-[radial-gradient(ellipse_80%_50%_at_50%_-10%,rgba(251,146,60,0.1),transparent)]" />

      {/* ─── HEADER ─────────────────────────────────────────────── */}
      <header className="sticky top-0 z-40 bg-[#080504]/90 backdrop-blur-md border-b border-white/5 px-4 py-4 lg:py-5 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button
            onClick={onBack}
            className="flex items-center justify-center h-10 w-10 rounded-full hover:bg-white/5 active:scale-95 text-amber-100 transition-all"
            aria-label="Back"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div className="flex items-center gap-2">
            <span className="text-xl lg:text-2xl text-orange-400 font-display">ॐ</span>
            <h1 className="text-lg lg:text-xl font-bold font-display text-white tracking-wide">
              {copy.title}
            </h1>
          </div>
        </div>
        <div className="flex items-center gap-3">
          {isGuest && (
            <span className="text-[10px] px-2 py-1 rounded-full bg-orange-500/10 text-orange-400 border border-orange-500/20 font-medium">
              {isHi ? "अतिथि" : "Guest"}
            </span>
          )}
          <button className="h-10 w-10 rounded-full hover:bg-white/5 flex items-center justify-center text-amber-100/70">
            <Bell className="w-5 h-5" />
          </button>
        </div>
      </header>

      {/* ─── MAIN CONTENT ───────────────────────────────────────── */}
      <div className="mx-auto max-w-7xl px-4 lg:px-8 mt-6 space-y-12">

        {/* HERO BANNER SECTION */}
        <section className="relative overflow-hidden rounded-[2rem] border border-amber-500/10 bg-gradient-to-b from-[#180f0a] to-[#0d0705] p-6 md:p-8 lg:p-10 shadow-2xl shadow-black/80">
          <div className="absolute -top-20 -left-20 w-64 h-64 bg-orange-500/5 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute -bottom-20 -right-20 w-64 h-64 bg-amber-500/5 rounded-full blur-3xl pointer-events-none" />

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            {/* Col 1: Title & Subtitle */}
            <div className="lg:col-span-4 flex flex-col items-center lg:items-start text-center lg:text-left space-y-4">
              <div className="relative flex h-20 w-20 items-center justify-center rounded-3xl bg-amber-500/10 border border-amber-500/25 text-amber-400 font-display text-4xl font-bold shadow-[0_0_30px_rgba(245,158,11,0.15)] animate-pulse">
                <span>ॐ</span>
              </div>
              <h2 className="text-3xl md:text-4xl lg:text-5xl font-display font-bold text-white tracking-wide">
                {isHi ? "मंत्र जाप" : "Mantra Japa"}
              </h2>
              <div className="w-full max-w-xs h-[1px] bg-gradient-to-r from-transparent via-amber-500/30 to-transparent lg:via-amber-500/30 lg:to-transparent" />
              <p className="text-amber-400/80 font-medium text-xs md:text-sm tracking-widest leading-relaxed">
                {isHi ? "—» ध्वनि से ध्यान, ध्यान से शांति, शांति से परमात्मा «—" : "—» Sound to meditation, meditation to peace, peace to Divine «—"}
              </p>
              <div className="text-amber-500/40 text-lg">🪷</div>
            </div>

            {/* Col 2: Why Japa & Action Buttons */}
            <div className="lg:col-span-5 space-y-6 text-center lg:text-left">
              <div className="space-y-3">
                <h3 className="text-lg md:text-xl font-bold text-amber-400 flex items-center justify-center lg:justify-start gap-2">
                  <span className="text-amber-600">❖</span>
                  {isHi ? "मंत्र जाप क्यों करें?" : "Why do Mantra Japa?"}
                  <span className="text-amber-600">❖</span>
                </h3>
                <p className="text-amber-100/70 text-sm md:text-base leading-relaxed font-light">
                  {isHi
                    ? "मंत्रों में अपार शक्ति होती है। नियमित मंत्र जाप से मन शांत होता है, चित्त एकाग्र होता है और जीवन में सकारात्मक ऊर्जा का संचार होता है। यह हमारी आध्यात्मिक यात्रा को गहराई देता है और हमें ईश्वर के और निकट लाता है।"
                    : "Mantras hold immense power. Regular chanting calms the mind, sharpens focus, and fills life with positive energy. It deepens our spiritual journey and brings us closer to the Divine."}
                </p>
              </div>

              <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start pt-2">
                <button
                  onClick={() => document.getElementById("japa-benefits")?.scrollIntoView({ behavior: "smooth" })}
                  className="group flex items-center justify-center gap-3 rounded-2xl bg-amber-500/10 border border-amber-500/20 px-6 py-3 text-sm font-bold text-amber-400 hover:bg-amber-500/20 hover:border-amber-500/40 active:scale-95 transition-all duration-300"
                >
                  <Heart className="h-4 w-4 text-amber-400 group-hover:scale-110 transition-transform" />
                  <span>{isHi ? "इसके लाभ" : "Its Benefits"}</span>
                </button>
              </div>
            </div>

            {/* Col 3: Beautiful Diya and Mala image */}
            <div className="lg:col-span-3 flex justify-center">
              <div className="relative w-64 h-48 md:w-72 md:h-56 lg:w-full lg:h-52 rounded-2xl overflow-hidden border border-amber-500/10 shadow-[0_15px_30px_rgba(0,0,0,0.5)] group/hero-img">
                <img
                  src={diyaAndMalaImg}
                  alt="Diya and Mala"
                  className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-700"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent pointer-events-none" />
              </div>
            </div>
          </div>
        </section>

        {/* ── MANTRA CARDS LIST ────────────────────────────────── */}
        <section className="space-y-6">
          <div className="flex items-center justify-between border-b border-white/5 pb-3">
            <h3 className="text-lg lg:text-xl font-bold text-amber-400 flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-amber-500" />
              {copy.selectTitle}
            </h3>
            {mantrasLoading && (
              <span className="text-[11px] text-white/30 animate-pulse">{isHi ? "लोड हो रहा है..." : "Loading..."}</span>
            )}
          </div>

          {mantras.length === 0 && !mantrasLoading ? (
            <div className="text-center py-12">
              <p className="text-white/30 text-sm">{isHi ? "मंत्र लोड नहीं हो सके। कृपया पुनः प्रयास करें।" : "Could not load mantras. Please check your connection."}</p>
              <button onClick={refresh} className="mt-4 text-orange-400 text-xs hover:underline flex items-center gap-1 mx-auto">
                <RotateCcw className="w-3 h-3" /> {isHi ? "पुनः लोड करें" : "Retry"}
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full">
              {mantras.map((m) => {
                const cardData = getMantraCardData(m);
                const image = resolveMantraImage(m);
                const isLastChanted = m.id === lastChantedMantraId;

                return (
                  <motion.button
                    key={m.id}
                    onClick={() => setSelectedMantraForDetail(m)}
                    whileHover={{ y: -2 }}
                    className={`group relative w-full flex items-center rounded-[1.5rem] border p-5 text-left shadow-lg transition-all duration-300 ${
                      isLastChanted
                        ? "border-amber-500/60 bg-[#1a110d]/90 shadow-[0_0_20px_rgba(245,158,11,0.15)]"
                        : "border-white/5 bg-[#120a06]/40 hover:border-orange-500/20 hover:bg-black/45"
                    }`}
                  >
                    {/* Left side: Circular avatar of the deity */}
                    <div className={`relative h-16 w-16 sm:h-20 sm:w-20 shrink-0 overflow-hidden rounded-full border bg-black/40 flex items-center justify-center shadow-inner mr-5 transition-colors duration-300 ${
                      isLastChanted ? "border-amber-500/50" : "border-white/5"
                    }`}>
                      {image ? (
                        <img
                          src={image}
                          alt=""
                          className="h-full w-full object-cover transition duration-300 group-hover:scale-105"
                        />
                      ) : (
                        <span className="text-2xl text-orange-400 font-display">ॐ</span>
                      )}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/25 to-transparent" />
                    </div>

                    {/* Middle: Name details and stats row */}
                    <div className="flex-1 min-w-0">
                      <div>
                        <h4 className="font-serif text-base sm:text-[18px] font-bold text-white group-hover:text-orange-400 transition-colors leading-tight">
                          {isHi ? m.name_hindi : m.name_english}
                        </h4>
                        <p className="text-[11px] sm:text-[12px] text-white/40 font-medium mt-0.5 truncate">
                          {m.name_english}
                        </p>
                      </div>

                      {/* Stats row */}
                      <div className="mt-3 flex items-center gap-6 sm:gap-10 w-full">
                        <div>
                          <p className="text-sm sm:text-base font-bold text-amber-500">{cardData.today}</p>
                          <p className="text-[9px] sm:text-[10px] text-white/30 font-bold uppercase tracking-wider mt-0.5">{isHi ? "आज" : "Today"}</p>
                        </div>
                        <div>
                          <p className="text-sm sm:text-base font-bold text-white/90">{cardData.chants.toLocaleString()}</p>
                          <p className="text-[9px] sm:text-[10px] text-white/30 font-bold uppercase tracking-wider mt-0.5">{isHi ? "कुल" : "Lifetime"}</p>
                        </div>
                        <div>
                          <p className="text-sm sm:text-base font-bold text-white/90">{cardData.streak}d</p>
                          <p className="text-[9px] sm:text-[10px] text-white/30 font-bold uppercase tracking-wider mt-0.5">{isHi ? "दिन" : "Streak"}</p>
                        </div>
                      </div>
                    </div>

                    {/* Right side: arrow indicator */}
                    <div className="shrink-0 flex items-center justify-center px-1">
                      <ChevronRight className="w-5 h-5 text-white/20 group-hover:text-orange-400 transition-colors" />
                    </div>
                  </motion.button>
                );
              })}
            </div>
          )}
        </section>

        {/* BEGINNERS GUIDE */}
        <div className="max-w-3xl mx-auto w-full">
          {/* Column: शुरुआती साधकों के लिए */}
          <section className="w-full">
            <div className="bg-[#130d0a]/60 backdrop-blur-xl border border-amber-500/10 rounded-[2rem] overflow-hidden shadow-xl">
              {/* Header */}
              <button
                onClick={() => setIsBeginnerOpen(!isBeginnerOpen)}
                className="w-full flex items-center justify-between p-6 hover:bg-white/[0.02] active:bg-white/[0.04] transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-400">
                    <UserRound className="w-5 h-5" />
                  </div>
                  <h3 className="text-base md:text-lg font-bold text-white text-left">
                    {isHi ? "शुरुआती साधकों के लिए" : "For Beginners"}
                  </h3>
                </div>
                <motion.div
                  animate={{ rotate: isBeginnerOpen ? 180 : 0 }}
                  transition={{ duration: 0.2 }}
                  className="text-amber-400"
                >
                  <ChevronDown className="w-5 h-5" />
                </motion.div>
              </button>

              {/* Collapsible Content */}
              <AnimatePresence initial={false}>
                {isBeginnerOpen && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.3, ease: "easeInOut" }}
                    className="border-t border-white/5 relative"
                  >
                    <div className="p-6 space-y-4 relative z-10 max-w-[75%]">
                      {/* Checklist items */}
                      {[
                        isHi ? "एक मंत्र चुनें और नियमित समय तय करें" : "Choose one mantra and set a fixed daily time.",
                        isHi ? "शुरुआत 11, 21 या 108 जाप से करें" : "Start with 11, 21, or 108 chants.",
                        isHi ? "प्रतिदिन एक ही समय पर अभ्यास करें" : "Practice at the same time every day.",
                        isHi ? "भक्ति, विश्वास और निरंतरता बनाए रखें" : "Maintain devotion, faith, and consistency.",
                      ].map((item, idx) => (
                        <div key={idx} className="flex items-start gap-3">
                          <div className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-500 mt-0.5">
                            <Check className="w-3 h-3 stroke-[3px]" />
                          </div>
                          <span className="text-xs md:text-sm text-amber-100/70 font-medium leading-tight">
                            {item}
                          </span>
                        </div>
                      ))}
                    </div>

                    {/* Decorative Diya / Mandala absolute background on the right */}
                    <div className="absolute right-0 bottom-0 top-0 w-[30%] opacity-20 md:opacity-40 flex items-center justify-center pointer-events-none select-none overflow-hidden">
                      <div className="relative w-36 h-36 flex items-center justify-center">
                        {/* Mandala outline */}
                        <div className="absolute inset-0 rounded-full border border-dashed border-amber-500/30 animate-[spin_60s_linear_infinite]" />
                        <div className="absolute inset-4 rounded-full border border-amber-500/20" />
                        {/* Small diya representation */}
                        <div className="absolute bottom-4 text-amber-500 text-3xl animate-bounce">🕯️</div>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </section>
        </div>

        {/* FULL WIDTH ROW: मंत्र जाप के लाभ */}
        <section id="japa-benefits" className="space-y-6 scroll-mt-24">
          <h3 className="text-lg md:text-xl font-bold text-amber-400 text-center flex items-center justify-center gap-2">
            <span className="text-amber-600">—◆—</span>
            {isHi ? "मंत्र जाप के लाभ" : "Benefits of Mantra Japa"}
            <span className="text-amber-600">—◆—</span>
          </h3>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6">
            {/* Card 1: Mental Peace */}
            <div className="bg-[#130d0a]/60 backdrop-blur-xl border border-white/5 hover:border-amber-500/20 rounded-[1.25rem] sm:rounded-[1.5rem] p-3.5 sm:p-6 flex flex-col items-center text-center space-y-2.5 sm:space-y-4 transition-all duration-300 hover:-translate-y-1 shadow-lg group">
              <div className="flex h-11 w-11 sm:h-14 sm:w-14 items-center justify-center rounded-2xl bg-amber-500/5 border border-amber-500/20 text-amber-400 shadow-[0_0_15px_rgba(245,158,11,0.05)] group-hover:bg-amber-500/10 group-hover:border-amber-500/30 transition-all">
                <YogiIcon className="w-5 h-5 sm:w-7 sm:h-7" />
              </div>
              <div className="space-y-1.5 sm:space-y-2">
                <h4 className="font-bold text-white text-[13px] leading-snug sm:text-base group-hover:text-amber-400 transition-colors">
                  {isHi ? "मानसिक शांति" : "Mental Peace"}
                </h4>
                <p className="text-[10px] sm:text-xs md:text-sm text-amber-100/50 leading-relaxed">
                  {isHi ? "मन के विचार शांत होते हैं और तनाव कम होता है।" : "Calms thoughts, eases the mind, and reduces daily stress."}
                </p>
              </div>
            </div>

            {/* Card 2: Enhanced Focus */}
            <div className="bg-[#130d0a]/60 backdrop-blur-xl border border-white/5 hover:border-amber-500/20 rounded-[1.25rem] sm:rounded-[1.5rem] p-3.5 sm:p-6 flex flex-col items-center text-center space-y-2.5 sm:space-y-4 transition-all duration-300 hover:-translate-y-1 shadow-lg group">
              <div className="flex h-11 w-11 sm:h-14 sm:w-14 items-center justify-center rounded-2xl bg-amber-500/5 border border-amber-500/20 text-amber-400 shadow-[0_0_15px_rgba(245,158,11,0.05)] group-hover:bg-amber-500/10 group-hover:border-amber-500/30 transition-all">
                <Target className="w-5 h-5 sm:w-7 sm:h-7" />
              </div>
              <div className="space-y-1.5 sm:space-y-2">
                <h4 className="font-bold text-white text-[13px] leading-snug sm:text-base group-hover:text-amber-400 transition-colors">
                  {isHi ? "एकाग्रता में वृद्धि" : "Enhanced Focus"}
                </h4>
                <p className="text-[10px] sm:text-xs md:text-sm text-amber-100/50 leading-relaxed">
                  {isHi ? "एकाग्रता, स्मरण शक्ति और ध्यान की क्षमता बढ़ती है।" : "Improves concentration, memory retention, and focus."}
                </p>
              </div>
            </div>

            {/* Card 3: Positive Energy */}
            <div className="bg-[#130d0a]/60 backdrop-blur-xl border border-white/5 hover:border-amber-500/20 rounded-[1.25rem] sm:rounded-[1.5rem] p-3.5 sm:p-6 flex flex-col items-center text-center space-y-2.5 sm:space-y-4 transition-all duration-300 hover:-translate-y-1 shadow-lg group">
              <div className="flex h-11 w-11 sm:h-14 sm:w-14 items-center justify-center rounded-2xl bg-amber-500/5 border border-amber-500/20 text-amber-400 shadow-[0_0_15px_rgba(245,158,11,0.05)] group-hover:bg-amber-500/10 group-hover:border-amber-500/30 transition-all">
                <Sun className="w-5 h-5 sm:w-7 sm:h-7" />
              </div>
              <div className="space-y-1.5 sm:space-y-2">
                <h4 className="font-bold text-white text-[13px] leading-snug sm:text-base group-hover:text-amber-400 transition-colors">
                  {isHi ? "सकारात्मक ऊर्जा" : "Positive Energy"}
                </h4>
                <p className="text-[10px] sm:text-xs md:text-sm text-amber-100/50 leading-relaxed">
                  {isHi ? "नकारात्मकता दूर होती है और सकारात्मक ऊर्जा मिलती है।" : "Dispels negative vibes and fills you with positive energy."}
                </p>
              </div>
            </div>

            {/* Card 4: Spiritual Growth */}
            <div className="bg-[#130d0a]/60 backdrop-blur-xl border border-white/5 hover:border-amber-500/20 rounded-[1.25rem] sm:rounded-[1.5rem] p-3.5 sm:p-6 flex flex-col items-center text-center space-y-2.5 sm:space-y-4 transition-all duration-300 hover:-translate-y-1 shadow-lg group">
              <div className="flex h-11 w-11 sm:h-14 sm:w-14 items-center justify-center rounded-2xl bg-amber-500/5 border border-amber-500/20 text-amber-400 shadow-[0_0_15px_rgba(245,158,11,0.05)] group-hover:bg-amber-500/10 group-hover:border-amber-500/30 transition-all">
                <Heart className="w-5 h-5 sm:w-7 sm:h-7" />
              </div>
              <div className="space-y-1.5 sm:space-y-2">
                <h4 className="font-bold text-white text-[13px] leading-snug sm:text-base group-hover:text-amber-400 transition-colors">
                  {isHi ? "आध्यात्मिक उन्नति" : "Spiritual Growth"}
                </h4>
                <p className="text-[10px] sm:text-xs md:text-sm text-amber-100/50 leading-relaxed">
                  {isHi ? "ईश्वर से जुड़ाव गहरा होता है और आध्यात्मिक विकास होता है।" : "Deepens connection with the divine and triggers inner growth."}
                </p>
              </div>
            </div>
          </div>
        </section>

      </div>

      {/* ─── ACTIVE JAPA COUNTER MODAL ──────────────────────────── */}
      <AnimatePresence>
        {activeMantra && (
          <PremiumJapaCounter
            mantra={activeMantra}
            sankalpText={setupConfig?.sankalpText || activeSankalpText}
            targetCount={setupConfig?.targetCount || japaTarget}
            practiceMode={setupConfig?.practiceMode || "mala"}
            onClose={() => setActiveMantra(null)}
            onComplete={(actualCount, durationSeconds) => {
              completeSession({
                mantraId: activeMantra.id,
                mantraLabel: activeMantra.name_english,
                sankalp: setupConfig?.sankalpText || activeSankalpText,
                targetCount: setupConfig?.targetCount || japaTarget,
                actualCount: actualCount,
                durationSeconds: durationSeconds,
              });
              refresh();
              setActiveMantra(null);
            }}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
