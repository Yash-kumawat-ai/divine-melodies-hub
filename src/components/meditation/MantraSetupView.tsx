import React, { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowLeft,
  ArrowRight,
  Sparkles,
  Heart,
  Activity,
  Users,
  Star,
  Clock,
  Mic,
  ChevronDown,
  Bell,
  Target,
  Menu,
  Flame,
  Check,
} from "lucide-react";
import { useLanguage } from "@/hooks/useLanguage";
import { useAuth } from "@/hooks/useAuth";
import { useTheme } from "@/hooks/useTheme";
import type { Mantra } from "@/lib/mantraJapa/mantraJapaApi";
import { fetchGroups } from "@/lib/naamSangh/naamSanghApi";
import meditationHighQuality from "@/pages/images/meditation_high_quality.webp";
import omShivayaImg from "@/pages/images/om_shivaya_high_quality.webp";
import meditationSpiritualIcon from "@/pages/images/meditation_spiritual_icon.webp";
import { resolveMantraImage } from "@/hooks/useMantraJapa";

// ─── SVG ICONS ───────────────────────────────────────────────────
const MalaIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.0" strokeLinecap="round" strokeLinejoin="round" {...props}>
    <circle cx="12" cy="10" r="6" strokeDasharray="3 3" />
    <circle cx="12" cy="17" r="1.5" fill="currentColor" />
    <path d="M11 18.5l1 1.5 1-1.5" />
  </svg>
);

const LotusIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" {...props}>
    <path d="M12 6c1.5-2.5 4-3.5 6-3.5 1.5 3.5-.5 7-6 10-5.5-3-7.5-6.5-6-10 2 0 4.5 1 6 3.5z" fill="currentColor" opacity="0.9" />
    <path d="M12 12.5c2.5-1.5 5.5-2 7.5-.5.5 3-2 6-7.5 7-5.5-1-8-4-7.5-7 2-1.5 5-.5 7.5.5z" fill="currentColor" opacity="0.7" />
    <path d="M12 12v8" />
  </svg>
);

const GoldLeafIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg viewBox="0 0 60 60" fill="none" {...props}>
    <path
      d="M20 38 C10 30, 10 15, 25 10 C35 20, 32 32, 20 38 Z"
      fill="#4a3610"
      opacity="0.85"
    />
    <path
      d="M38 38 C48 30, 48 15, 33 10 C23 20, 26 32, 38 38 Z"
      fill="#5c4314"
      opacity="0.9"
    />
    <path
      d="M29 38 L29 50"
      stroke="#5c4314"
      strokeWidth="2.5"
      strokeLinecap="round"
    />
  </svg>
);

const YogiMeditationGraphic = () => (
  <svg viewBox="0 0 120 120" fill="none" className="w-28 h-28 sm:w-32 sm:h-32">
    <defs>
      <radialGradient id="yogiGlow" cx="50%" cy="50%" r="50%">
        <stop offset="0%" stopColor="#d97706" stopOpacity="0.4" />
        <stop offset="70%" stopColor="#b45309" stopOpacity="0.1" />
        <stop offset="100%" stopColor="#000000" stopOpacity="0" />
      </radialGradient>
    </defs>
    
    {/* Outer dashed ring with gold glow */}
    <circle cx="60" cy="60" r="48" fill="url(#yogiGlow)" />
    <circle cx="60" cy="60" r="44" stroke="#7a5a18" strokeWidth="1" strokeDasharray="3 3" />
    
    {/* Yogi head & torso silhouette */}
    <g fill="#070503">
      {/* Head */}
      <circle cx="60" cy="38" r="7" />
      {/* Curved shoulders & torso dome */}
      <path d="M 60 47 C 46 48, 36 58, 34 76 L 34 88 C 34 90, 86 90, 86 88 L 86 76 C 84 58, 74 48, 60 47 Z" />
    </g>

    {/* Glowing ॐ in center */}
    <text
      x="60"
      y="72"
      textAnchor="middle"
      fill="#fef3c7"
      fontSize="15"
      fontWeight="bold"
      fontFamily="serif"
      style={{ filter: "drop-shadow(0px 0px 4px rgba(251, 191, 36, 0.9))" }}
    >
      ॐ
    </text>
  </svg>
);

// ─── TYPES ───────────────────────────────────────────────────────
type MantraSetupViewProps = {
  mantra: Mantra;
  onBack: () => void;
  onStartJapa: (options: {
    sankalpText: string;
    targetCount: number;
    practiceMode: "mala" | "tap" | "voice" | "guided";
    groupId?: string | null;
  }) => void;
  todayCompletedCount?: number;
};

export default function MantraSetupView({
  mantra,
  onBack,
  onStartJapa,
  todayCompletedCount = 48,
}: MantraSetupViewProps) {
  const { language } = useLanguage();
  const isHi = language === "hi";
  const { theme } = useTheme();
  const isDark = theme === "dark";

  // ─── STATE ──────────────────────────────────────────────────────
  const [selectedSankalpIndex, setSelectedSankalpIndex] = useState(0);
  const [customSankalp, setCustomSankalp] = useState("");
  const [targetCount, setTargetCount] = useState(108);
  const [practiceMode, setPracticeMode] = useState<"mala" | "tap" | "voice" | "guided">("mala");
  const [isSankalpSheetOpen, setIsSankalpSheetOpen] = useState(false);
  const [isGoalSheetOpen, setIsGoalSheetOpen] = useState(false);
  const [userGroups, setUserGroups] = useState<any[]>([]);
  const [selectedGroupId, setSelectedGroupId] = useState<string | null>(null);

  const { user } = useAuth();

  React.useEffect(() => {
    if (user?.id) {
      fetchGroups(user.id).then((groups) => {
        const joined = groups.filter((g) => g.is_member);
        setUserGroups(joined);
      });
    }
  }, [user?.id]);

  // ─── OPTIONS CONFIGURATION ──────────────────────────────────────
  const sankalpOptions = useMemo(
    () => [
      {
        id: "inner_peace",
        labelHi: "मानसिक शांति",
        labelEn: "Inner Peace",
        subHi: "मन को शांत कर सकारात्मक ऊर्जा का संचार करें",
        subEn: "Calm and center the mind with positive energy",
        icon: Target,
      },
      {
        id: "healing",
        labelHi: "स्वास्थ्य और कल्याण",
        labelEn: "Health & Healing",
        subHi: "शारीरिक और मानसिक आरोग्यता",
        subEn: "Physical and mental wellness",
        icon: Activity,
      },
      {
        id: "family",
        labelHi: "परिवार कल्याण",
        labelEn: "Family Wellbeing",
        subHi: "प्रियजनों की समृद्धि व सुरक्षा",
        subEn: "Protection and prosperity for loved ones",
        icon: Users,
      },
      {
        id: "spiritual",
        labelHi: "आध्यात्मिक विकास",
        labelEn: "Spiritual Growth",
        subHi: "चेतना और आत्मज्ञान का उदय",
        subEn: "Rising consciousness and divine realization",
        icon: Sparkles,
      },
      {
        id: "gratitude",
        labelHi: "कृतज्ञता",
        labelEn: "Gratitude",
        subHi: "संसार के प्रति आभार जताना",
        subEn: "Thankfulness to universe",
        icon: Heart,
      },
      {
        id: "success",
        labelHi: "सफलता",
        labelEn: "Success",
        subHi: "कार्य में बाधाओं का नाश",
        subEn: "Removal of all obstacles",
        icon: Star,
      },
    ],
    []
  );

  const goalOptions = useMemo(
    () => [
      { count: 27, labelHi: "चौथाई माला", labelEn: "Quarter Mala", estMin: 2 },
      { count: 54, labelHi: "आधी माला", labelEn: "Half Mala", estMin: 4 },
      { count: 108, labelHi: "एक माला", labelEn: "One Mala", estMin: 8, recommended: true },
      { count: 216, labelHi: "दो माला", labelEn: "Two Malas", estMin: 16 },
      { count: 1008, labelHi: "दस माला", labelEn: "Ten Malas", estMin: 75 },
    ],
    []
  );

  // Compute values for practice summary
  const currentSankalpText = useMemo(() => {
    if (selectedSankalpIndex === -1 && customSankalp.trim()) {
      return customSankalp.trim();
    }
    const selected = sankalpOptions[selectedSankalpIndex] || sankalpOptions[0];
    return isHi ? selected.labelHi : selected.labelEn;
  }, [customSankalp, selectedSankalpIndex, sankalpOptions, isHi]);

  const currentSankalpSub = useMemo(() => {
    if (selectedSankalpIndex === -1) {
      return isHi ? "आपका व्यक्तिगत संकल्प" : "Your custom intention";
    }
    const selected = sankalpOptions[selectedSankalpIndex] || sankalpOptions[0];
    return isHi ? selected.subHi : selected.subEn;
  }, [selectedSankalpIndex, sankalpOptions, isHi]);

  const currentEstTime = useMemo(() => {
    const matched = goalOptions.find((g) => g.count === targetCount);
    return matched ? matched.estMin : Math.max(1, Math.round(targetCount * 0.075));
  }, [targetCount, goalOptions]);

  const progressPercent = useMemo(() => {
    return Math.min(100, Math.round((todayCompletedCount / targetCount) * 100));
  }, [todayCompletedCount, targetCount]);

  const handleBegin = () => {
    onStartJapa({
      sankalpText: currentSankalpText,
      targetCount,
      practiceMode,
      groupId: selectedGroupId,
    });
  };

  // Theme-aware container styles matching image exactly
  const pageBgClass = isDark
    ? "bg-[#0c0806] text-stone-100"
    : "bg-[#FCF7F0] text-stone-900";

  const cardBgClass = isDark
    ? "bg-[#18110b] border-amber-900/30 text-stone-100 shadow-lg shadow-black/40"
    : "bg-white border-stone-100/80 text-stone-900 shadow-sm";

  const softCardBgClass = isDark
    ? "bg-[#140d08] border-amber-900/20 text-stone-100"
    : "bg-[#FFFBF6] border-orange-100/70 text-stone-900";

  const heroImage = useMemo(() => {
    return meditationSpiritualIcon || resolveMantraImage(mantra) || omShivayaImg || meditationHighQuality;
  }, [mantra]);

  return (
    <div className={`min-h-full w-full ${pageBgClass} font-sans select-none flex flex-col items-center justify-start pb-8 pt-2 px-3 sm:px-4 transition-colors duration-300`}>
      <div className="w-full max-w-md mx-auto space-y-3.5 sm:space-y-4">
        
        {/* ─── 1. TOP HEADER BAR ───────────────────────────────────── */}
        <header className="flex items-center justify-between py-2 px-1 w-full">
          <div className="flex items-center gap-3">
            <button
              onClick={onBack}
              className="text-stone-800 dark:text-stone-200 hover:opacity-75 active:scale-95 transition-opacity"
              aria-label="Back"
            >
              <ArrowLeft className="w-6 h-6 stroke-[2.2]" />
            </button>
            <div>
              <h1 className="font-serif font-extrabold text-lg sm:text-xl tracking-tight leading-tight text-stone-900 dark:text-amber-100">
                {isHi ? "जप साधना" : "Japa Sadhana"}
              </h1>
              <p className="text-[11px] text-stone-500 dark:text-stone-400 font-medium leading-none mt-0.5">
                {isHi ? "मंत्रों का अभ्यास, मन की शांति, आत्मा से जुड़ाव" : "Mantra practice, peace of mind, soul connection"}
              </p>
            </div>
          </div>
        </header>

        {/* ─── 2. HERO BANNER CARD ─────────────────────────────────── */}
        <section className="relative h-44 sm:h-48 rounded-[24px] overflow-hidden shadow-xl bg-black border border-stone-900 flex items-center justify-between p-5">
          {/* Background Shivji image with gradient overlay */}
          <div className="absolute inset-0 -z-10">
            <img
              src={heroImage}
              alt="Shivji Meditation"
              className="w-full h-full object-cover opacity-45"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-black via-black/85 to-transparent" />
          </div>

          {/* Top right gold leaf graphic */}
          <div className="absolute top-3.5 right-4 w-12 h-12 text-[#5c4314] pointer-events-none">
            <GoldLeafIcon className="w-full h-full" />
          </div>

          {/* Left content: Badge top left, Title bottom left */}
          <div className="flex flex-col justify-between h-full z-10 py-0.5">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#1c0f07]/90 border border-[#4a2608] text-[#e06810] text-xs font-semibold w-fit shadow-sm">
              <Flame className="w-3.5 h-3.5 fill-[#e06810] text-[#e06810]" />
              <span>{isHi ? "आज की साधना" : "Today's Sadhana"}</span>
            </div>

            <div>
              <h2 className="text-2xl sm:text-3xl font-serif font-black text-white tracking-wide leading-tight drop-shadow-md">
                {isHi ? mantra.name_hindi : mantra.name_english}
              </h2>
            </div>
          </div>

          {/* Right side: Shivji image in framed circular avatar */}
          <div className="relative z-10 flex items-center justify-center shrink-0">
            <div className="relative w-24 h-24 sm:w-28 sm:h-28 rounded-full p-0.5 border border-amber-500/50 shadow-lg shadow-amber-500/20 bg-black/60">
              <div className="absolute -inset-1 rounded-full border border-dashed border-amber-500/60 pointer-events-none animate-[spin_60s_linear_infinite]" />
              <img
                src={heroImage}
                alt="Shivji"
                className="w-full h-full object-cover rounded-full"
              />
            </div>
          </div>
        </section>

        {/* ─── 3. SANKALP & GOAL CARD ──────────────────────────────── */}
        <section
          onClick={() => setIsSankalpSheetOpen(true)}
          className={`rounded-[24px] p-4 sm:p-4.5 ${cardBgClass} flex items-center justify-between cursor-pointer hover:shadow-md transition-all duration-200 border`}
        >
          {/* Left side: Intention (संकल्प) */}
          <div className="flex items-center gap-3 flex-1 min-w-0 pr-2">
            <div className="w-11 h-11 rounded-full bg-orange-100/80 dark:bg-amber-950/60 border border-orange-200/60 dark:border-amber-700/40 flex items-center justify-center text-orange-600 dark:text-amber-400 shrink-0">
              <Target className="w-5.5 h-5.5 stroke-[2.2]" />
            </div>
            <div className="min-w-0 flex-1">
              <div className="text-orange-600 dark:text-amber-400 font-extrabold text-[11px] uppercase tracking-wider">
                {isHi ? "संकल्प" : "Sankalpa"}
              </div>
              <div className="text-stone-900 dark:text-stone-100 font-extrabold text-sm sm:text-base leading-tight truncate mt-0.5">
                {currentSankalpText}
              </div>
              <div className="text-stone-500 dark:text-stone-400 text-[11px] font-medium leading-tight truncate mt-0.5">
                {currentSankalpSub}
              </div>
            </div>
          </div>

          {/* Vertical Divider Line */}
          <div className="w-[1px] h-12 bg-stone-200/80 dark:bg-stone-800 shrink-0 mx-2" />

          {/* Right side: Goal & Time (108 मंत्र / 8 मिनट) */}
          <div
            onClick={(e) => {
              e.stopPropagation();
              setIsGoalSheetOpen(true);
            }}
            className="flex items-center gap-2 shrink-0 pl-1"
          >
            <div className="w-9 h-9 rounded-full bg-gradient-to-br from-amber-500 to-orange-500 text-white flex items-center justify-center shadow-md shadow-orange-500/20 shrink-0">
              <LotusIcon className="w-4.5 h-4.5 fill-white stroke-none" />
            </div>
            <div>
              <div className="text-stone-900 dark:text-stone-100 font-bold text-xs leading-tight">
                {targetCount} {isHi ? "मंत्र" : "Mantras"}
              </div>
              <div className="text-stone-500 dark:text-stone-400 text-[11px] font-medium mt-0.5">
                {currentEstTime} {isHi ? "मिनट" : "min"}
              </div>
            </div>
            <ChevronDown className="w-4 h-4 text-orange-500 dark:text-amber-400 ml-0.5 shrink-0" />
          </div>
        </section>

        {/* ─── GROUP SELECTOR (IF USER BELONGS TO GROUPS) ───────────── */}
        {user && userGroups.length > 0 && (
          <div className={`rounded-2xl p-3 ${cardBgClass} border flex items-center justify-between text-xs font-bold`}>
            <span className="text-stone-500 dark:text-stone-400">
              {isHi ? "👥 समूह में जप दर्ज करें:" : "👥 Log Japa For Group:"}
            </span>
            <select
              value={selectedGroupId || ""}
              onChange={(e) => setSelectedGroupId(e.target.value || null)}
              className="bg-orange-50 dark:bg-stone-900 border border-orange-200 dark:border-amber-700/40 rounded-xl px-3 py-1.5 font-bold text-orange-700 dark:text-amber-300 focus:outline-none cursor-pointer"
            >
              <option value="">{isHi ? "व्यक्तिगत साधना" : "Personal Sadhana"}</option>
              {userGroups.map((g) => (
                <option key={g.id} value={g.id}>
                  {g.name}
                </option>
              ))}
            </select>
          </div>
        )}

        {/* ─── 4. SECTION HEADER: जप विधि ──────────────────────────── */}
        <div className="flex items-center justify-center my-3">
          <div className="flex-1 h-[1px] bg-gradient-to-r from-transparent via-amber-300/70 to-amber-300/70 dark:via-amber-700/40" />
          <div className="w-1.5 h-1.5 rounded-full bg-amber-500 mx-2 shrink-0" />
          <h3 className="font-serif font-extrabold text-stone-900 dark:text-amber-100 text-sm tracking-wide mx-1">
            {isHi ? "जप विधि" : "Jap Method"}
          </h3>
          <div className="w-1.5 h-1.5 rounded-full bg-amber-500 mx-2 shrink-0" />
          <div className="flex-1 h-[1px] bg-gradient-to-l from-transparent via-amber-300/70 to-amber-300/70 dark:via-amber-700/40" />
        </div>

        {/* ─── 5. METHOD SELECTOR BUTTONS ──────────────────────────── */}
        <div className="grid grid-cols-2 gap-3 my-2">
          {/* Button 1: स्वर जप (Voice Jap) */}
          <button
            onClick={() => setPracticeMode("voice")}
            className={`h-12 px-3 rounded-full font-bold text-sm transition-all duration-200 flex items-center justify-center gap-1.5 ${
              practiceMode === "voice"
                ? "bg-[#5c1d0c] hover:bg-[#4a170a] text-white shadow-md shadow-[#5c1d0c]/25"
                : isDark
                ? "bg-[#18110b] border border-stone-800 text-stone-300 hover:bg-stone-900"
                : "bg-white border border-stone-200 text-stone-700 hover:bg-stone-50"
            }`}
          >
            <Mic className="w-4 h-4 shrink-0 translate-y-0" />
            <span className="leading-none tracking-wide translate-y-px">{isHi ? "स्वर जप" : "Voice Jap"}</span>
            {practiceMode === "voice" && (
              <div className="w-4 h-4 rounded-full bg-white text-[#5c1d0c] flex items-center justify-center shrink-0">
                <Check className="w-2.5 h-2.5" strokeWidth={3} />
              </div>
            )}
          </button>

          {/* Button 2: माला जप (Mala Jap) */}
          <button
            onClick={() => setPracticeMode("mala")}
            className={`h-12 px-3 rounded-full font-bold text-sm transition-all duration-200 flex items-center justify-center gap-1.5 ${
              practiceMode === "mala"
                ? "bg-[#5c1d0c] hover:bg-[#4a170a] text-white shadow-md shadow-[#5c1d0c]/25"
                : isDark
                ? "bg-[#18110b] border border-stone-800 text-stone-300 hover:bg-stone-900"
                : "bg-white border border-stone-200 text-stone-700 hover:bg-stone-50"
            }`}
          >
            <MalaIcon className="w-4 h-4 shrink-0 translate-y-0" />
            <span className="leading-none tracking-wide translate-y-px">{isHi ? "माला जप" : "Mala Jap"}</span>
            {practiceMode === "mala" && (
              <div className="w-4 h-4 rounded-full bg-white text-[#5c1d0c] flex items-center justify-center shrink-0">
                <Check className="w-2.5 h-2.5" strokeWidth={3} />
              </div>
            )}
          </button>
        </div>

        {/* ─── 6. SUMMARY CARD ─────────────────────────────────────── */}
        <section className={`rounded-2xl p-4 ${softCardBgClass} shadow-sm border`}>
          <div className="grid grid-cols-3 divide-x divide-stone-200/80 dark:divide-stone-800 text-center">
            {/* Col 1: Jap Method */}
            <div className="px-2">
              <div className="w-9 h-9 rounded-full bg-[#5c1d0c]/10 dark:bg-amber-950/60 text-[#5c1d0c] dark:text-amber-400 mx-auto mb-1.5 flex items-center justify-center">
                <MalaIcon className="w-5 h-5" />
              </div>
              <div className="text-stone-400 dark:text-stone-500 font-bold text-[10px] uppercase tracking-wider">
                {isHi ? "जप विधि" : "Method"}
              </div>
              <div className="text-stone-900 dark:text-stone-100 font-extrabold text-xs sm:text-sm mt-0.5 truncate">
                {practiceMode === "voice" ? (isHi ? "स्वर जप" : "Voice Jap") : (isHi ? "माला जप" : "Mala Jap")}
              </div>
            </div>

            {/* Col 2: Mantra Count */}
            <div className="px-2">
              <div className="w-9 h-9 rounded-full bg-[#5c1d0c]/10 dark:bg-amber-950/60 text-[#5c1d0c] dark:text-amber-400 mx-auto mb-1.5 flex items-center justify-center">
                <span className="font-serif font-black text-base leading-none">ॐ</span>
              </div>
              <div className="text-stone-400 dark:text-stone-500 font-bold text-[10px] uppercase tracking-wider">
                {isHi ? "मंत्र संख्या" : "Mantra Count"}
              </div>
              <div className="text-stone-900 dark:text-stone-100 font-extrabold text-xs sm:text-sm mt-0.5 truncate">
                {targetCount}
              </div>
            </div>

            {/* Col 3: Time */}
            <div className="px-2">
              <div className="w-9 h-9 rounded-full bg-[#5c1d0c]/10 dark:bg-amber-950/60 text-[#5c1d0c] dark:text-amber-400 mx-auto mb-1.5 flex items-center justify-center">
                <Clock className="w-4.5 h-4.5" />
              </div>
              <div className="text-stone-400 dark:text-stone-500 font-bold text-[10px] uppercase tracking-wider">
                {isHi ? "समय" : "Time"}
              </div>
              <div className="text-stone-900 dark:text-stone-100 font-extrabold text-xs sm:text-sm mt-0.5 truncate">
                {currentEstTime} {isHi ? "मिनट" : "min"}
              </div>
            </div>
          </div>
        </section>

        {/* ─── 7. PROGRESS CARD ────────────────────────────────────── */}
        <section className={`rounded-2xl p-4 ${cardBgClass} shadow-sm border space-y-2.5`}>
          <div className="flex items-center justify-between text-xs sm:text-sm font-extrabold">
            <span className="text-stone-900 dark:text-stone-100">
              {isHi ? "आज की प्रगति" : "Today's Progress"}
            </span>
            <span className="text-stone-500 dark:text-stone-400 font-bold">
              {todayCompletedCount} / {targetCount} {isHi ? "मंत्र" : "Mantras"}
            </span>
          </div>

          {/* Rounded Progress Bar */}
          <div className="w-full h-6 bg-[#5c1d0c]/10 dark:bg-amber-950/50 rounded-full relative overflow-hidden flex items-center justify-center">
            <div
              className="h-full bg-[#5c1d0c] rounded-full absolute left-0 top-0 transition-all duration-500"
              style={{ width: `${progressPercent}%` }}
            />
            <span className="text-[#5c1d0c] dark:text-amber-300 font-black text-xs relative z-10">
              {progressPercent}%
            </span>
          </div>
        </section>

        {/* ─── 8. MAIN CTA START BUTTON ────────────────────────────── */}
        <div className="pt-1">
          <button
            onClick={handleBegin}
            className="w-full h-14 bg-[#5c1d0c] hover:bg-[#4a170a] text-white rounded-full px-5 font-bold shadow-xl shadow-[#5c1d0c]/30 flex items-center gap-3 transition-all active:scale-[0.98] cursor-pointer group"
          >
            <span className="text-2xl font-serif font-black text-white/95 leading-none shrink-0">ॐ</span>
            <span className="flex-1 text-center text-sm sm:text-base font-bold tracking-wide leading-snug">
              {isHi ? "जप प्रारम्भ करें" : "Begin Japa Practice"}
            </span>
            <div className="w-9 h-9 rounded-full bg-white text-[#5c1d0c] flex items-center justify-center shadow-md shrink-0 group-hover:scale-105 transition-transform">
              <ArrowRight className="w-4.5 h-4.5 stroke-[2.5]" />
            </div>
          </button>
        </div>

        {/* ─── 9. FOOTER QUOTE ─────────────────────────────────────── */}
        <footer className="flex items-center justify-center gap-1.5 text-center pt-2 pb-4 px-2">
          <span className="text-orange-500 text-xl font-serif font-black">“</span>
          <p className="text-stone-600 dark:text-stone-400 font-bold text-xs sm:text-sm">
            {isHi
              ? "यह जप मन को शुद्ध करता है और आत्मा को शक्ति देता है"
              : "This japa purifies the mind and empowers the soul"}
          </p>
          <span className="text-orange-500 text-xl font-serif font-black">”</span>
        </footer>

      </div>

      {/* ─── BOTTOM SHEETS ──────────────────────────────────────── */}
      <AnimatePresence>
        {/* Sankalpa Selection Sheet */}
        {isSankalpSheetOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsSankalpSheetOpen(false)}
              className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50"
            />
            <motion.div
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 220 }}
              className={`fixed bottom-0 left-0 right-0 max-w-md mx-auto border-t rounded-t-[28px] p-6 pb-8 z-50 ${
                isDark ? "bg-[#160e0a] border-amber-900/40 text-stone-100" : "bg-white border-stone-200 text-stone-900"
              }`}
            >
              <div className="w-12 h-1 bg-stone-300 dark:bg-stone-700 rounded-full mx-auto mb-5" />
              
              <h3 className="text-base font-bold mb-4 flex items-center gap-2 text-orange-600 dark:text-amber-400">
                🌸 {isHi ? "संकल्प का चयन करें" : "Select Intention (Sankalpa)"}
              </h3>
              
              <div className="space-y-2 max-h-[260px] overflow-y-auto pr-1">
                {sankalpOptions.map((opt, idx) => {
                  const isSelected = selectedSankalpIndex === idx;
                  const Icon = opt.icon;
                  return (
                    <button
                      key={opt.id}
                      onClick={() => {
                        setSelectedSankalpIndex(idx);
                        setIsSankalpSheetOpen(false);
                      }}
                      className={`w-full flex items-center justify-between p-3 rounded-2xl transition-all border text-left ${
                        isSelected
                          ? "bg-orange-50 dark:bg-amber-950/40 border-orange-400 dark:border-amber-600 text-orange-850 dark:text-amber-300"
                          : "bg-stone-50 dark:bg-stone-900/50 border-stone-200 dark:border-stone-800 text-stone-700 dark:text-stone-300"
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div className={`p-2 rounded-xl ${isSelected ? "bg-orange-100 text-orange-700 dark:bg-amber-900/50 dark:text-amber-300" : "bg-stone-100 text-stone-500 dark:bg-stone-800"}`}>
                          <Icon className="w-4 h-4" />
                        </div>
                        <div>
                          <div className="font-bold text-xs">{isHi ? opt.labelHi : opt.labelEn}</div>
                          <div className="text-[10px] text-stone-500">{isHi ? opt.subHi : opt.subEn}</div>
                        </div>
                      </div>
                      {isSelected && (
                        <div className="w-4.5 h-4.5 rounded-full bg-orange-500 text-white flex items-center justify-center text-[10px]">
                          ✓
                        </div>
                      )}
                    </button>
                  );
                })}
              </div>

              {/* Custom Sankalpa Input */}
              <div className="mt-4 pt-4 border-t border-stone-200 dark:border-stone-800">
                <label className="block text-[10px] font-bold uppercase tracking-wider text-stone-500 mb-2">
                  {isHi ? "या अपना स्वयं का संकल्प लिखें:" : "Or write a custom Sankalpa:"}
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={customSankalp}
                    onChange={(e) => {
                      setCustomSankalp(e.target.value);
                      setSelectedSankalpIndex(-1);
                    }}
                    placeholder={isHi ? "उदा. सुख और समृद्धि..." : "e.g. Health and Prosperity..."}
                    className="flex-1 focus:outline-none rounded-xl px-4 py-2.5 text-xs bg-stone-50 dark:bg-stone-900 border border-stone-300 dark:border-stone-700 focus:border-orange-500 text-stone-900 dark:text-stone-100 placeholder-stone-400"
                  />
                  {customSankalp.trim() && selectedSankalpIndex === -1 && (
                    <button
                      onClick={() => setIsSankalpSheetOpen(false)}
                      className="active:scale-95 font-bold px-4 rounded-xl text-xs bg-[#5c1d0c] hover:bg-[#4a170a] text-white shadow-sm"
                    >
                      {isHi ? "लागू करें" : "Apply"}
                    </button>
                  )}
                </div>
              </div>
            </motion.div>
          </>
        )}

        {/* Goal Count Selection Sheet */}
        {isGoalSheetOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsGoalSheetOpen(false)}
              className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50"
            />
            <motion.div
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 220 }}
              className={`fixed bottom-16 left-0 right-0 max-w-md mx-auto border border-b-0 rounded-t-[28px] p-6 pb-4 z-50 ${
                isDark ? "bg-[#160e0a] border-amber-900/40 text-stone-100" : "bg-white border-stone-200 text-stone-900"
              }`}
            >
              <div className="w-12 h-1 bg-stone-300 dark:bg-stone-700 rounded-full mx-auto mb-5" />
              
              <h3 className="text-base font-bold mb-4 flex items-center gap-2 text-orange-600 dark:text-amber-400">
                🎯 {isHi ? "लक्ष्य (मंत्र संख्या) का चयन करें" : "Select Goal Count"}
              </h3>
              
              <div className="space-y-2 max-h-[250px] overflow-y-auto pr-1 pb-3">
                {goalOptions.map((opt) => {
                  const isSelected = targetCount === opt.count;
                  return (
                    <button
                      key={opt.count}
                      onClick={() => {
                        setTargetCount(opt.count);
                        setIsGoalSheetOpen(false);
                      }}
                      className={`w-full flex items-center justify-between p-3.5 rounded-2xl transition-all border text-left ${
                        isSelected
                          ? "bg-[#5c1d0c]/10 dark:bg-[#5c1d0c]/20 border-[#5c1d0c]/60 dark:border-[#5c1d0c]/70 text-stone-900 dark:text-stone-100"
                          : "bg-stone-50 dark:bg-stone-900/50 border-stone-200 dark:border-stone-800 text-stone-700 dark:text-stone-300"
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div className={`min-w-[2.5rem] h-8 px-1.5 rounded-xl flex items-center justify-center text-xs font-black tabular-nums leading-none ${
                          isSelected ? "bg-[#5c1d0c] text-white" : "bg-stone-200 dark:bg-stone-800 text-stone-700 dark:text-stone-300"
                        }`}>
                          {opt.count}
                        </div>
                        <div>
                          <div className="font-bold text-xs">
                            {isHi ? opt.labelHi : opt.labelEn}
                          </div>
                          <div className="text-[10px] text-stone-500">
                            {isHi ? `अनुमानित समय: ~${opt.estMin} मिनट` : `Est. Time: ~${opt.estMin} min`}
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        {opt.recommended && (
                          <span className="text-[9px] bg-[#5c1d0c] text-white border border-[#5c1d0c] px-2 py-0.5 rounded-full font-bold">
                            {isHi ? "अनुशंसित" : "Recommended"}
                          </span>
                        )}
                        {isSelected && (
                          <div className="w-5 h-5 rounded-full bg-[#5c1d0c] text-white flex items-center justify-center">
                            <Check className="w-3 h-3" strokeWidth={3} />
                          </div>
                        )}
                      </div>
                    </button>
                  );
                })}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
