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
} from "lucide-react";
import { useLanguage } from "@/hooks/useLanguage";
import { useMantraJapa, resolveMantraImage } from "@/hooks/useMantraJapa";
import JapaCounter from "@/components/devotion/JapaCounter";
import meditationDesktopBg from "@/pages/images/meditation_desktop_wallpaper.webp";
import type { Mantra } from "@/lib/mantraJapa/mantraJapaApi";

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

export default function MantraJapHome({ onBack }: MantraJapHomeProps) {
  const { language } = useLanguage();
  const isHi = language === "hi";

  const {
    mantras,
    mantrasLoading,
    stats,
    mantraTotalsMap,
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
    if (!isGuest) {
      const total = mantraTotalsMap[m.id];
      return {
        chants: total?.total_chants ?? 0,
        lastDate: getRelativeDateString(total?.last_session_at ?? null),
      };
    }
    // Guest: lookup by legacy id
    const legacyId = LEGACY_MANTRA_MAP[m.name_english];
    const stat = legacyId ? guestMantraStats[legacyId] : null;
    return {
      chants: stat?.totalChants ?? 0,
      lastDate: getRelativeDateString(stat?.lastChantedAt ?? null),
    };
  }, [isGuest, mantraTotalsMap, guestMantraStats, getRelativeDateString]);

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
      <div className="mx-auto max-w-7xl px-4 lg:px-8 mt-6 space-y-8">

        {/* ── TOP LAYOUT: 2-column on desktop ─────────────────── */}
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6 items-stretch">

          {/* ─ LEFT: Hero + Stats (3/5 on desktop) ─────────── */}
          <div className="lg:col-span-3 space-y-6 flex flex-col">

            {/* HERO SECTION */}
            <section className="relative min-h-[200px] lg:min-h-[260px] flex-grow overflow-hidden rounded-3xl border border-white/10 shadow-xl shadow-black/40 group flex flex-col justify-between p-6 lg:p-8">
              <div className="absolute inset-0 z-0">
                <img
                  src={meditationDesktopBg}
                  alt="Sunset Meditation"
                  className="w-full h-full object-cover opacity-35 object-center transition-transform group-hover:scale-105"
                  style={{ transitionDuration: '12s' }}
                />
                <div className="absolute inset-0 bg-gradient-to-r from-black/90 via-black/50 to-transparent" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-transparent to-black/30" />
              </div>

              <div className="relative z-10 flex items-start justify-between gap-4">
                <div className="space-y-1">
                  <p className="text-[13px] lg:text-sm font-bold text-amber-400/80 uppercase tracking-widest">
                    {copy.heroTitle}
                  </p>
                  <h2 className="text-4xl lg:text-6xl font-display font-bold text-white tracking-tight tabular-nums">
                    {stats.todayChants}
                    <span className="text-xl lg:text-3xl text-white/50 font-normal"> / {japaTarget}</span>
                  </h2>
                </div>

                {/* Target Pills */}
                <div className="flex items-center gap-1 bg-black/60 p-0.5 rounded-xl border border-white/10 shadow-lg shrink-0">
                  {[108, 1008].map((t) => (
                    <button
                      key={t}
                      onClick={() => handleTargetChange(t)}
                      className={`text-[11px] lg:text-xs px-2.5 lg:px-3 py-1 lg:py-1.5 rounded-lg font-bold transition-all ${
                        japaTarget === t && !isCustomMode
                          ? "bg-gradient-to-r from-orange-500 to-amber-500 text-white shadow-md shadow-orange-500/10"
                          : "text-white/40 hover:text-white/70"
                      }`}
                    >
                      {t}
                    </button>
                  ))}
                  <button
                    onClick={() => {
                      const val = prompt(
                        isHi ? "कस्टम संख्या दर्ज करें:" : "Enter custom target count:",
                        String(japaTarget)
                      );
                      if (val) {
                        const num = parseInt(val, 10);
                        if (!isNaN(num) && num > 0) handleTargetChange(num, true);
                      }
                    }}
                    className={`text-[11px] lg:text-xs px-2.5 lg:px-3 py-1 lg:py-1.5 rounded-lg font-bold transition-all ${
                      isCustomMode
                        ? "bg-gradient-to-r from-orange-500 to-amber-500 text-white shadow-md"
                        : "text-white/40 hover:text-white/70"
                    }`}
                  >
                    {isCustomMode ? `${japaTarget}` : isHi ? "कस्टम" : "Custom"}
                  </button>
                </div>
              </div>

              {/* Progress bar */}
              <div className="relative z-10 mt-4">
                <div className="h-1.5 w-full rounded-full bg-white/10 overflow-hidden">
                  <motion.div
                    className="h-full rounded-full bg-gradient-to-r from-orange-500 to-amber-400"
                    initial={{ width: 0 }}
                    animate={{ width: `${Math.min((stats.todayChants / japaTarget) * 100, 100)}%` }}
                    transition={{ duration: 1, ease: "easeOut" }}
                  />
                </div>
              </div>

              <div className="relative z-10 mt-4 flex items-center justify-between gap-4">
                <button
                  onClick={handleContinueLastSession}
                  disabled={mantras.length === 0}
                  className="inline-flex items-center gap-2 bg-gradient-to-r from-orange-500 to-amber-600 hover:from-orange-600 hover:to-amber-700 disabled:opacity-40 active:scale-98 text-white font-bold text-[13px] lg:text-sm px-5 lg:px-6 py-2.5 lg:py-3 rounded-full shadow-lg shadow-orange-500/20 transition-all duration-300"
                >
                  <Play className="w-4 h-4 fill-current" />
                  <span>{copy.continueBtn}</span>
                </button>

                {stats.currentStreak > 0 && (
                  <div className="flex items-center gap-1.5 text-orange-400/80">
                    <Flame className="w-4 h-4" />
                    <span className="text-sm font-bold">{stats.currentStreak} {isHi ? "दिन" : "days"}</span>
                  </div>
                )}
              </div>
            </section>

            {/* STATS SECTION */}
            <section className="space-y-3">
              <h3 className="text-[13px] lg:text-sm font-bold uppercase tracking-wider text-amber-200/50">
                {copy.sadhanaTitle}
              </h3>
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 lg:gap-4">
                {copy.stats.map((stat, idx) => {
                  const Icon = stat.icon;
                  return (
                    <motion.div
                      key={idx}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: idx * 0.08 }}
                      className="bg-[#130d0a]/60 border border-white/5 rounded-2xl p-4 lg:p-5 flex flex-col justify-between min-h-[92px] lg:min-h-[110px] hover:border-orange-500/10 transition-colors"
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-[13px] lg:text-sm font-medium text-white/40">{stat.label}</span>
                        <Icon className="w-5 h-5 lg:w-6 lg:h-6 text-orange-400 shrink-0" />
                      </div>
                      <p className="text-xl lg:text-2xl font-bold text-white tracking-tight mt-3">
                        {statValues[idx]}
                      </p>
                    </motion.div>
                  );
                })}
              </div>
            </section>
          </div>

          {/* ─ RIGHT: Sankalp (2/5 on desktop) ────────────── */}
          <div className="lg:col-span-2 h-full">
            <section className="bg-[#130d0a]/60 border border-orange-500/10 rounded-[2rem] p-6 lg:p-8 h-full flex flex-col justify-between gap-6 relative overflow-hidden shadow-xl">
              <div className="absolute -top-12 -left-12 w-32 h-32 bg-orange-500/[0.03] rounded-full blur-3xl pointer-events-none" />

              <div className="flex-1 space-y-4 relative z-10 flex flex-col justify-between h-full">
                <div className="space-y-4">
                  <div>
                    <h3 className="text-[13px] lg:text-sm font-bold uppercase tracking-wider text-amber-200/50 flex items-center gap-1.5">
                      <Sparkles className="w-4 h-4 text-orange-400 shrink-0" />
                      <span>{copy.sankalpTitle}</span>
                    </h3>
                    <p className="text-xs lg:text-[13px] text-white/40 mt-0.5 font-medium">
                      {isHi ? "मंत्र जाप शुरू करने के लिए अपना संकल्प चुनें या लिखें:" : "Select or write your intention to begin:"}
                    </p>
                  </div>

                  {/* Sankalp Chips */}
                  <div className="flex flex-wrap gap-2">
                    {effectiveSankalpas.map((s, idx) => {
                      const isSelected = s.is_active || s.text === activeSankalpText;
                      return (
                        <div
                          key={`sankalp-${idx}`}
                          onClick={() => handleSelectSankalp(s)}
                          className={`text-xs lg:text-[13px] px-3.5 py-2 rounded-full border transition-all active:scale-95 cursor-pointer flex items-center gap-2 ${
                            isSelected
                              ? "border-orange-500/50 bg-orange-500/10 text-orange-300 font-semibold"
                              : "border-white/5 bg-white/[0.02] text-white/50 hover:bg-white/[0.05] hover:text-white/75"
                          }`}
                        >
                          <span>{s.text}</span>
                          {s.is_custom && (
                            <button
                              onClick={(e) => handleDeleteCustomSankalp(e, s)}
                              className="text-white/20 hover:text-red-400 rounded-full p-0.5 hover:bg-white/10 shrink-0"
                            >
                              <X className="w-3 h-3" />
                            </button>
                          )}
                        </div>
                      );
                    })}
                  </div>

                  {/* Write custom Sankalp */}
                  <div className="flex items-center gap-2 bg-black/45 rounded-xl border border-white/5 p-1.5">
                    <input
                      type="text"
                      value={newSankalpText}
                      onChange={(e) => setNewSankalpText(e.target.value)}
                      onKeyDown={(e) => { if (e.key === "Enter") handleAddCustomSankalp(); }}
                      placeholder={isHi ? "अपना खुद का संकल्प लिखें..." : "Write your own custom intention..."}
                      className="flex-1 bg-transparent px-3 py-1.5 text-xs lg:text-sm text-white placeholder-white/30 focus:outline-none"
                    />
                    <button
                      onClick={handleAddCustomSankalp}
                      disabled={!newSankalpText.trim()}
                      className="h-8 px-3 rounded-lg bg-orange-500 hover:bg-orange-600 disabled:opacity-40 disabled:hover:bg-orange-500 text-white text-xs font-bold transition flex items-center gap-1 shrink-0"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>{isHi ? "जोड़ें" : "Add"}</span>
                    </button>
                  </div>
                </div>

                {/* Start session with Sankalp */}
                <div className="pt-4 border-t border-white/5 flex items-center justify-between gap-4 mt-auto">
                  <p className="text-[11px] lg:text-xs text-white/30 truncate max-w-[160px]" title={activeSankalpText}>
                    {isHi ? "सक्रिय: " : "Active: "}<span className="text-orange-400/80 font-medium">{activeSankalpText}</span>
                  </p>
                  <button
                    onClick={handleStartJapaWithSankalp}
                    disabled={mantras.length === 0}
                    className="bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 disabled:opacity-40 active:scale-98 text-white font-bold text-xs lg:text-sm px-4 lg:px-5 py-2 lg:py-2.5 rounded-xl shadow-lg shadow-orange-500/10 transition-all flex items-center gap-1 shrink-0"
                  >
                    <Play className="w-3.5 h-3.5 fill-current" />
                    <span>{isHi ? "जाप शुरू करें" : "Start Japa"}</span>
                  </button>
                </div>
              </div>
            </section>
          </div>
        </div>

        {/* ── MANTRA CARDS LIST ────────────────────────────────── */}
        <section className="space-y-4 pt-4">
          <div className="flex items-center justify-between">
            <h3 className="text-[13px] lg:text-sm font-bold uppercase tracking-wider text-amber-200/50">
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
            /* Desktop: grid layout; Mobile: horizontal scroll */
            <div className="hidden lg:grid lg:grid-cols-4 xl:grid-cols-5 gap-4">
              {mantras.map((m) => {
                const cardData = getMantraCardData(m);
                const image = resolveMantraImage(m);
                return (
                  <motion.button
                    key={m.id}
                    onClick={() => setActiveMantra(m)}
                    whileHover={{ y: -4 }}
                    className="group flex flex-col overflow-hidden rounded-2xl border border-white/5 bg-[#120a06]/40 text-left shadow-lg transition hover:border-orange-500/20 hover:bg-black/45"
                  >
                    <div className="relative aspect-square w-full overflow-hidden bg-black/40">
                      {image ? (
                        <img src={image} alt="" className="h-full w-full object-cover transition duration-500 group-hover:scale-105" />
                      ) : (
                        <div className="h-full w-full bg-gradient-to-br from-amber-950/80 via-orange-950/50 to-stone-950 flex items-center justify-center">
                          <Sparkles className="w-8 h-8 text-orange-500/20" />
                        </div>
                      )}
                      <div className="absolute inset-0 bg-gradient-to-t from-black via-black/30 to-transparent" />
                      <div className="absolute top-2.5 left-2.5 h-6 w-6 rounded-full bg-black/40 border border-white/5 flex items-center justify-center text-[10px] text-orange-400 font-display">ॐ</div>
                    </div>
                    <div className="p-4 flex flex-col justify-between flex-1">
                      <p className="line-clamp-2 text-sm font-bold text-amber-50 leading-tight group-hover:text-orange-400 transition-colors">
                        {isHi ? m.name_hindi : m.name_english}
                      </p>
                      <div className="mt-3 space-y-0.5">
                        <p className="text-[11px] text-white/40 leading-none">
                          {copy.lastChanted} <span className="font-bold text-white/60">{cardData.chants.toLocaleString()}</span>
                        </p>
                        <p className="text-[10px] text-white/30 truncate">
                          {copy.lastDateLabel} {cardData.lastDate}
                        </p>
                      </div>
                    </div>
                  </motion.button>
                );
              })}
            </div>
          )}

          {/* Mobile: horizontal scroll */}
          <div className="flex gap-4 overflow-x-auto pb-4 lg:hidden [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
            {mantras.map((m) => {
              const cardData = getMantraCardData(m);
              const image = resolveMantraImage(m);
              return (
                <button
                  key={m.id}
                  onClick={() => setActiveMantra(m)}
                  className="group flex w-[140px] shrink-0 flex-col overflow-hidden rounded-2xl border border-white/5 bg-[#120a06]/40 text-left shadow-lg transition active:scale-[0.98] hover:border-orange-500/20 hover:bg-black/45"
                >
                  <div className="relative aspect-square w-full overflow-hidden bg-black/40">
                    {image ? (
                      <img src={image} alt="" className="h-full w-full object-cover transition duration-500 group-hover:scale-105" />
                    ) : (
                      <div className="h-full w-full bg-gradient-to-br from-amber-950/80 via-orange-950/50 to-stone-950 flex items-center justify-center">
                        <Sparkles className="w-8 h-8 text-orange-500/20" />
                      </div>
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-black via-black/30 to-transparent" />
                    <div className="absolute top-2.5 left-2.5 h-6 w-6 rounded-full bg-black/40 border border-white/5 flex items-center justify-center text-[10px] text-orange-400 font-display">ॐ</div>
                  </div>
                  <div className="p-3.5 flex flex-col justify-between flex-1">
                    <p className="line-clamp-2 text-[13px] font-bold text-amber-50 leading-tight group-hover:text-orange-400 transition-colors">
                      {isHi ? m.name_hindi : m.name_english}
                    </p>
                    <div className="mt-2.5 space-y-0.5">
                      <p className="text-[11px] text-white/40 leading-none">
                        {copy.lastChanted} <span className="font-bold text-white/60">{cardData.chants.toLocaleString()}</span>
                      </p>
                      <p className="text-[10px] text-white/30 truncate">
                        {copy.lastDateLabel} {cardData.lastDate}
                      </p>
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </section>
      </div>

      {/* ─── ACTIVE JAPA COUNTER MODAL ──────────────────────────── */}
      <AnimatePresence>
        {activeMantra && (
          <JapaCounter
            mantraLabel={isHi ? activeMantra.name_hindi : activeMantra.name_english}
            deitySlug={activeMantra.deity || "shiva"}
            targetCount={japaTarget}
            mantraId={activeMantra.id}
            initialSankalp={activeSankalpText}
            onClose={() => setActiveMantra(null)}
            onComplete={() => {
              // Complete via hook
              completeSession({
                mantraId: activeMantra.id,
                mantraLabel: activeMantra.name_english,
                sankalp: activeSankalpText,
                targetCount: japaTarget,
                actualCount: japaTarget,
                durationSeconds: Math.round(japaTarget * 1.5),
              });
              refresh();
              setTimeout(() => setActiveMantra(null), 1200);
            }}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
