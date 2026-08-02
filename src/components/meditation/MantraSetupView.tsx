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
  Mic,
  ChevronRight,
  User,
} from "lucide-react";
import { useLanguage } from "@/hooks/useLanguage";
import { useAuth } from "@/hooks/useAuth";
import { useTheme } from "@/hooks/useTheme";
import type { Mantra } from "@/lib/mantraJapa/mantraJapaApi";
import { fetchGroups } from "@/lib/naamSangh/naamSanghApi";
import devotionalBackground from "@/pages/images/devotional_background_high_quality(1).webp";
import omSvg from "@/pages/images/om.svg";

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

const ShieldCrossIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" {...props}>
    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
    <path d="M12 8v8M9 12h6" />
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
  const [isGroupSheetOpen, setIsGroupSheetOpen] = useState(false);
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
  const sankalpOptions = useMemo(() => [
    { id: "inner_peace", labelHi: "मानसिक शांति", labelEn: "Inner Peace", subHi: "मन शांत और एकाग्र करना", subEn: "Calm and center the mind", icon: LotusIcon },
    { id: "healing", labelHi: "स्वास्थ्य और कल्याण", labelEn: "Health & Healing", subHi: "शारीरिक और मानसिक आरोग्यता", subEn: "Physical and mental wellness", icon: Activity },
    { id: "family", labelHi: "परिवार कल्याण", labelEn: "Family Wellbeing", subHi: "प्रियजनों की समृद्धि व सुरक्षा", subEn: "Protection and prosperity", icon: Users },
    { id: "spiritual", labelHi: "आध्यात्मिक विकास", labelEn: "Spiritual Growth", subHi: "चेतना और आत्मज्ञान का उदय", subEn: "Rising consciousness", icon: Sparkles },
    { id: "gratitude", labelHi: "कृतज्ञता", labelEn: "Gratitude", subHi: "संसार के प्रति आभार जताना", subEn: "Thankfulness to universe", icon: Heart },
    { id: "success", labelHi: "सफलता", labelEn: "Success", subHi: "कार्य में बाधाओं का नाश", subEn: "Removal of obstacles", icon: Star },
  ], []);

  const goalOptions = useMemo(() => [
    { count: 27, labelHi: "चौथाई माला", labelEn: "Quarter Mala", estMin: 2 },
    { count: 54, labelHi: "आधी माला", labelEn: "Half Mala", estMin: 4 },
    { count: 108, labelHi: "एक माला", labelEn: "One Mala", estMin: 8, recommended: true },
    { count: 216, labelHi: "दो माला", labelEn: "Two Malas", estMin: 16 },
    { count: 1008, labelHi: "दस माला", labelEn: "Ten Malas", estMin: 75 },
  ], []);

  const currentSankalpText = useMemo(() => {
    if (selectedSankalpIndex === -1 && customSankalp.trim()) return customSankalp.trim();
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

  const selectedGroupName = useMemo(() => {
    if (!selectedGroupId) return isHi ? "व्यक्तिगत" : "Personal";
    const found = userGroups.find((g) => g.id === selectedGroupId);
    return found ? found.name : isHi ? "समूह" : "Group";
  }, [selectedGroupId, userGroups, isHi]);

  const sheetClass = isDark
    ? "bg-[#140b07] border-amber-500/20 text-brand-cream shadow-[0_-8px_32px_rgba(245,158,11,0.15)]"
    : "bg-[#FFFDF8] border-[#E8D8C4] text-[#33140A] shadow-2xl";
  const sheetTitle = isDark ? "text-amber-400" : "text-[#591A0D]";

  return (
    <div
      className={`relative min-h-screen w-full font-sans select-none overflow-y-auto pb-24 pt-4 px-4 scrollbar-none ${
        isDark ? "bg-[#090506] text-[#fbf6f0]" : "bg-[#FAF5E8] text-[#33140A]"
      }`}
    >
      <div className="fixed inset-0 pointer-events-none select-none -z-10">
        <div
          className={`absolute inset-0 bg-gradient-to-b ${
            isDark
              ? "from-black/60 via-[#090506]/90 to-[#090506]"
              : "from-[#FAF5E8]/40 via-[#FAF5E8]/90 to-[#FAF5E8]"
          }`}
        />
      </div>

      <div className="max-w-md mx-auto relative z-10 flex flex-col items-center">
        {/* Top Header Bar with Back Button */}
        <div className="w-full flex items-center justify-between mb-3 relative">
          <button
            onClick={onBack}
            className={`w-10 h-10 rounded-full border flex items-center justify-center active:scale-95 transition-all shadow-sm ${
              isDark
                ? "border-amber-500/20 bg-black/40 text-amber-400 hover:bg-black/60"
                : "border-[#E8D8C4] bg-[#FFFDF8] text-[#591A0D] hover:bg-[#FAF5E8]"
            }`}
            aria-label="Go back"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
        </div>

        {/* TOP HERO IMAGE BANNER CARD (Full Opacity Crisp Image with Om Icon) */}
        <div className="relative w-full rounded-[24px] overflow-hidden shadow-md border border-[#E8D8C4] dark:border-amber-500/30 mb-6 p-6 flex flex-col items-center justify-center text-center select-none min-h-[160px]">
          {/* Full opacity crisp background image with no dark blur or fade */}
          <img
            src={devotionalBackground}
            alt="Devotional Background"
            className="absolute inset-0 w-full h-full object-cover object-center opacity-100"
          />

          {/* Crisp Glass Box for text to keep image 100% un-faded & text 100% readable */}
          <div className="relative z-10 flex flex-col items-center px-4 py-3 rounded-2xl bg-[#FFFDF8]/80 dark:bg-black/60 backdrop-blur-sm border border-amber-500/20 shadow-sm max-w-[90%]">
            <div className="w-13 h-13 rounded-full bg-[#FFFDF8] dark:bg-[#1f120c] border border-[#E8D8C4] dark:border-amber-500/40 flex items-center justify-center mb-2 shadow-sm">
              <img src={omSvg} alt="Om" className="w-7 h-7 object-contain" />
            </div>
            <h1 className={`font-serif text-2xl md:text-3xl font-black tracking-wide leading-none ${isDark ? "text-amber-300" : "text-[#591A0D]"}`}>
              {isHi ? "जप साधना" : "Japa Sadhana"}
            </h1>
            <p className={`text-xs md:text-sm font-medium mt-1 ${isDark ? "text-amber-100/90" : "text-[#786252]"}`}>
              {isHi ? "अपनी साधना चुनें और आज से आरंभ करें" : "Set your intention and begin practice"}
            </p>
          </div>
        </div>

        {/* UNIFIED OPTION GROUP CARD */}
        <div
          className={`w-full rounded-[24px] border overflow-hidden shadow-sm mb-6 ${
            isDark
              ? "bg-[#120a06]/90 border-amber-500/25 shadow-black/40"
              : "bg-[#FFFDF8] border-[#E8D8C4] shadow-[0_8px_24px_rgba(89,26,13,0.05)]"
          }`}
        >
          {/* Row 1: Intention / Sankalp */}
          <button
            type="button"
            onClick={() => setIsSankalpSheetOpen(true)}
            className={`w-full flex items-center justify-between p-4 transition-all text-left cursor-pointer active:bg-amber-500/5 ${
              isDark ? "hover:bg-amber-500/5" : "hover:bg-[#FAF5E8]/60"
            }`}
          >
            <div className="flex items-center gap-3.5 min-w-0">
              <div
                className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 text-base ${
                  isDark ? "bg-amber-500/10 text-amber-300" : "bg-[#FAF5E8] text-[#591A0D]"
                }`}
              >
                🌸
              </div>
              <div className="min-w-0">
                <span
                  className={`text-[10px] font-bold uppercase tracking-wider block leading-none ${
                    isDark ? "text-amber-500/70" : "text-[#786252]"
                  }`}
                >
                  {isHi ? "लक्ष्य" : "Intention"}
                </span>
                <span
                  className={`text-sm md:text-base font-extrabold block truncate mt-1 ${
                    isDark ? "text-amber-100" : "text-[#591A0D]"
                  }`}
                >
                  {currentSankalpText}
                </span>
              </div>
            </div>
            <ChevronRight className={`w-5 h-5 shrink-0 ${isDark ? "text-amber-500/60" : "text-[#786252]"}`} />
          </button>

          {/* Divider */}
          <div className={`h-px mx-4 ${isDark ? "bg-white/10" : "bg-[#E8D8C4]/60"}`} />

          {/* Row 2: Target Count / Goal */}
          <button
            type="button"
            onClick={() => setIsGoalSheetOpen(true)}
            className={`w-full flex items-center justify-between p-4 transition-all text-left cursor-pointer active:bg-amber-500/5 ${
              isDark ? "hover:bg-amber-500/5" : "hover:bg-[#FAF5E8]/60"
            }`}
          >
            <div className="flex items-center gap-3.5 min-w-0">
              <div
                className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 text-base ${
                  isDark ? "bg-amber-500/10 text-amber-300" : "bg-[#FAF5E8] text-[#591A0D]"
                }`}
              >
                📿
              </div>
              <div className="min-w-0">
                <span
                  className={`text-[10px] font-bold uppercase tracking-wider block leading-none ${
                    isDark ? "text-amber-500/70" : "text-[#786252]"
                  }`}
                >
                  {isHi ? "संख्या" : "Mantra Count"}
                </span>
                <span
                  className={`text-sm md:text-base font-extrabold block truncate mt-1 ${
                    isDark ? "text-amber-100" : "text-[#591A0D]"
                  }`}
                >
                  {targetCount} {isHi ? "मंत्र" : "Mantras"}{" "}
                  <span className="text-xs font-normal opacity-75">
                    ({currentEstTime} {isHi ? "मिनट" : "min"})
                  </span>
                </span>
              </div>
            </div>
            <ChevronRight className={`w-5 h-5 shrink-0 ${isDark ? "text-amber-500/60" : "text-[#786252]"}`} />
          </button>

          {/* Divider */}
          <div className={`h-px mx-4 ${isDark ? "bg-white/10" : "bg-[#E8D8C4]/60"}`} />

          {/* Row 3: Group Destination */}
          <button
            type="button"
            onClick={() => setIsGroupSheetOpen(true)}
            className={`w-full flex items-center justify-between p-4 transition-all text-left cursor-pointer active:bg-amber-500/5 ${
              isDark ? "hover:bg-amber-500/5" : "hover:bg-[#FAF5E8]/60"
            }`}
          >
            <div className="flex items-center gap-3.5 min-w-0">
              <div
                className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 text-base ${
                  isDark ? "bg-amber-500/10 text-amber-300" : "bg-[#FAF5E8] text-[#591A0D]"
                }`}
              >
                👥
              </div>
              <div className="min-w-0">
                <span
                  className={`text-[10px] font-bold uppercase tracking-wider block leading-none ${
                    isDark ? "text-amber-500/70" : "text-[#786252]"
                  }`}
                >
                  {isHi ? "समूह" : "Group Destination"}
                </span>
                <span
                  className={`text-sm md:text-base font-extrabold block truncate mt-1 ${
                    isDark ? "text-amber-100" : "text-[#591A0D]"
                  }`}
                >
                  {selectedGroupName}
                </span>
              </div>
            </div>

            <ChevronRight className={`w-5 h-5 shrink-0 ${isDark ? "text-amber-500/60" : "text-[#786252]"}`} />
          </button>
        </div>

        {/* METHOD SELECTION SECTION */}
        <div className="w-full mb-6">
          <h3
            className={`font-serif font-extrabold text-sm md:text-base mb-3 text-left ${
              isDark ? "text-amber-400" : "text-[#591A0D]"
            }`}
          >
            {isHi ? "विधि चुनें" : "Select Practice Method"}
          </h3>

          <div className="grid grid-cols-2 gap-4 w-full">
            <button
              type="button"
              onClick={() => setPracticeMode("mala")}
              className={`relative flex flex-col items-center justify-center py-5 px-4 rounded-[20px] border-2 transition-all text-center select-none cursor-pointer ${
                practiceMode === "mala"
                  ? isDark
                    ? "border-amber-500 bg-amber-500/10 text-amber-300 shadow-[0_0_14px_rgba(245,158,11,0.2)]"
                    : "border-[#591A0D] bg-[#591A0D]/5 text-[#591A0D] shadow-sm font-black"
                  : isDark
                  ? "border-stone-800 bg-[#120a06] text-stone-400 hover:border-amber-500/20"
                  : "border-[#E8D8C4] bg-[#FFFDF8] text-[#786252] hover:bg-[#FAF5E8]"
              }`}
            >
              <MalaIcon
                className={`w-8 h-8 mb-2 transition-transform group-hover:scale-105 ${
                  practiceMode === "mala" ? "text-amber-600 dark:text-amber-500" : "text-stone-400"
                }`}
              />
              <span className="text-sm font-extrabold block">{isHi ? "माला जप" : "Mala Jap"}</span>
              {practiceMode === "mala" && (
                <div
                  className={`absolute top-2.5 right-2.5 w-5 h-5 rounded-full flex items-center justify-center text-xs font-black ${
                    isDark ? "bg-amber-500 text-black" : "bg-[#591A0D] text-white"
                  }`}
                >
                  ✓
                </div>
              )}
            </button>

            <button
              type="button"
              onClick={() => setPracticeMode("voice")}
              className={`relative flex flex-col items-center justify-center py-5 px-4 rounded-[20px] border-2 transition-all text-center select-none cursor-pointer ${
                practiceMode === "voice"
                  ? isDark
                    ? "border-amber-500 bg-amber-500/10 text-amber-300 shadow-[0_0_14px_rgba(245,158,11,0.2)]"
                    : "border-[#591A0D] bg-[#591A0D]/5 text-[#591A0D] shadow-sm font-black"
                  : isDark
                  ? "border-stone-800 bg-[#120a06] text-stone-400 hover:border-amber-500/20"
                  : "border-[#E8D8C4] bg-[#FFFDF8] text-[#786252] hover:bg-[#FAF5E8]"
              }`}
            >
              <Mic
                className={`w-8 h-8 mb-2 transition-transform group-hover:scale-105 ${
                  practiceMode === "voice" ? "text-amber-600 dark:text-amber-500 animate-pulse" : "text-stone-400"
                }`}
              />
              <span className="text-sm font-extrabold block">{isHi ? "स्वर जप" : "Voice Jap"}</span>
              {practiceMode === "voice" && (
                <div
                  className={`absolute top-2.5 right-2.5 w-5 h-5 rounded-full flex items-center justify-center text-xs font-black ${
                    isDark ? "bg-amber-500 text-black" : "bg-[#591A0D] text-white"
                  }`}
                >
                  ✓
                </div>
              )}
            </button>
          </div>
        </div>

        {/* INLINE DETAILS SUMMARY LINE */}
        <div
          className={`flex items-center justify-center gap-2.5 text-xs md:text-sm font-bold mt-4 mb-2 ${
            isDark ? "text-amber-300" : "text-[#591A0D]"
          }`}
        >
          <span>
            📿 {targetCount} {isHi ? "मंत्र" : "Mantras"}
          </span>
          <span>•</span>
          <span>
            ⏱ {currentEstTime} {isHi ? "मिनट" : "min"}
          </span>
          <span>•</span>
          <span>
            📿 {practiceMode === "voice" ? (isHi ? "स्वर जप" : "Voice Jap") : isHi ? "माला जप" : "Mala Jap"}
          </span>
        </div>

        {/* PRIMARY CTA BUTTON */}
        <div className="w-full my-4">
          <button
            type="button"
            onClick={handleBegin}
            className={`w-full h-16 font-black px-6 rounded-2xl flex items-center justify-between transition-all duration-300 group cursor-pointer active:scale-95 shadow-[0_10px_30px_rgba(89,26,13,0.3)] ${
              isDark
                ? "bg-gradient-to-r from-[#D4A53A] to-[#B8860B] text-[#1A120B] hover:from-[#c4952a] hover:to-[#a77505] border border-[#E6C46A]/50 shadow-[0_10px_30px_rgba(212,165,58,0.3)]"
                : "bg-gradient-to-r from-[#591A0D] to-[#3B0E07] text-[#FFFDF8] hover:from-[#451309] hover:to-[#2b0a05] border border-[#591A0D]"
            }`}
          >
            <div className="flex items-center gap-3">
              <span className="text-2xl font-serif leading-none drop-shadow-md">ॐ</span>
              <span className="text-base md:text-lg tracking-wide font-extrabold">
                {isHi ? "जप प्रारम्भ करें" : "Begin Sadhana"}
              </span>
            </div>
            <div
              className={`w-10 h-10 rounded-xl flex items-center justify-center border transition-all ${
                isDark
                  ? "bg-black/20 border-black/10 group-hover:bg-black/30"
                  : "bg-white/15 border-white/20 group-hover:bg-white/25"
              }`}
            >
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform text-current" />
            </div>
          </button>
        </div>

        {/* BOTTOM CAPTION */}
        <p
          className={`text-[10px] font-bold uppercase tracking-wider flex items-center gap-1.5 justify-center mb-8 ${
            isDark ? "text-amber-500/50" : "text-[#786252]/80"
          }`}
        >
          <ShieldCrossIcon className="w-3.5 h-3.5 text-amber-500/60" />
          {isHi ? "आपकी साधना सुरक्षित रहेगी" : "Your Sadhana is Secure & Private"}
        </p>
      </div>

      <AnimatePresence>
        {/* Sankalpa Selection Sheet */}
        {isSankalpSheetOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsSankalpSheetOpen(false)}
              className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[99]"
            />
            <motion.div
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 220 }}
              className={`fixed bottom-0 left-0 right-0 max-w-md mx-auto border-t rounded-t-[28px] p-6 pb-12 z-[100] ${sheetClass}`}
            >
              <div className="w-12 h-1 bg-stone-800/80 rounded-full mx-auto mb-5" />
              <h3 className={`text-base font-bold mb-4 flex items-center gap-2 ${sheetTitle}`}>
                🌸 {isHi ? "संकल्प का चयन करें" : "Select Intention (Sankalpa)"}
              </h3>
              <div className="space-y-2 max-h-[250px] overflow-y-auto pr-1">
                {sankalpOptions.map((opt, idx) => {
                  const isSelected = selectedSankalpIndex === idx;
                  const Icon = opt.icon;
                  return (
                    <button
                      key={opt.id}
                      type="button"
                      onClick={() => {
                        setSelectedSankalpIndex(idx);
                        setIsSankalpSheetOpen(false);
                      }}
                      className={`w-full flex items-center justify-between p-3 rounded-2xl transition-all border text-left ${
                        isSelected
                          ? isDark
                            ? "bg-amber-950/20 border-amber-500/50 text-amber-300 shadow-md shadow-amber-950/30"
                            : "bg-[#591A0D]/10 border-[#591A0D] text-[#591A0D] shadow-sm font-black"
                          : isDark
                          ? "bg-stone-950/40 border-stone-850 text-stone-300 hover:bg-stone-900/30"
                          : "bg-stone-50 border-stone-200 text-stone-600 hover:bg-stone-100"
                      }`}
                    >
                      <div className="flex items-center gap-3 text-left">
                        <div
                          className={`p-2 rounded-xl ${
                            isSelected
                              ? isDark
                                ? "bg-amber-500/20 text-amber-400"
                                : "bg-[#591A0D]/15 text-[#591A0D]"
                              : isDark
                              ? "bg-stone-900 text-stone-400"
                              : "bg-stone-100 text-stone-500"
                          }`}
                        >
                          <Icon className="w-4 h-4" />
                        </div>
                        <div>
                          <div
                            className={`font-bold text-xs ${
                              isSelected ? "" : isDark ? "text-stone-300" : "text-stone-850"
                            }`}
                          >
                            {isHi ? opt.labelHi : opt.labelEn}
                          </div>
                          <div className="text-[10px] opacity-60 mt-0.5">
                            {isHi ? opt.subHi : opt.subEn}
                          </div>
                        </div>
                      </div>
                      {isSelected && <span className="text-amber-500 font-bold text-sm">✓</span>}
                    </button>
                  );
                })}
              </div>
              <div className="mt-4 pt-4 border-t border-stone-800/40">
                <label className="text-[10px] font-bold uppercase tracking-wider block mb-1.5 opacity-70">
                  {isHi ? "या अपना custom संकल्प लिखें" : "Or type custom intention"}
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={customSankalp}
                    onChange={(e) => {
                      setCustomSankalp(e.target.value);
                      if (e.target.value.trim()) setSelectedSankalpIndex(-1);
                    }}
                    placeholder={isHi ? "जैसे: परीक्षा में सफलता, स्वास्थ्य..." : "e.g., Exam success..."}
                    className={`flex-1 px-3 py-2 text-xs rounded-xl border font-semibold outline-none transition-all ${
                      isDark
                        ? "bg-black/40 border-stone-800 focus:border-amber-500/50 text-white"
                        : "bg-white border-stone-200 focus:border-orange-500 text-stone-900"
                    }`}
                  />
                  {customSankalp.trim() && (
                    <button
                      type="button"
                      onClick={() => {
                        setSelectedSankalpIndex(-1);
                        setIsSankalpSheetOpen(false);
                      }}
                      className="px-4 py-2 bg-amber-500 text-stone-950 font-bold text-xs rounded-xl"
                    >
                      {isHi ? "चुनें" : "Set"}
                    </button>
                  )}
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {isGoalSheetOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsGoalSheetOpen(false)}
              className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[99]"
            />
            <motion.div
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 220 }}
              className={`fixed bottom-0 left-0 right-0 max-w-md mx-auto border-t rounded-t-[28px] p-6 pb-12 z-[100] ${sheetClass}`}
            >
              <div className="w-12 h-1 bg-stone-800/80 rounded-full mx-auto mb-5" />
              
              <h3 className={`text-base font-bold mb-4 flex items-center gap-2 ${sheetTitle}`}>
                🎯 {isHi ? "मंत्र संख्या का चयन करें" : "Select Target Count"}
              </h3>
              
              <div className="space-y-2 max-h-[250px] overflow-y-auto pr-1">
                {goalOptions.map((g) => {
                  const isSelected = targetCount === g.count;
                  return (
                    <button
                      key={g.count}
                      type="button"
                      onClick={() => {
                        setTargetCount(g.count);
                        setIsGoalSheetOpen(false);
                      }}
                      className={`w-full flex items-center justify-between p-3.5 rounded-2xl transition-all border text-left ${
                        isSelected
                          ? isDark
                            ? "bg-amber-950/20 border-amber-500/50 text-amber-300 shadow-md shadow-amber-950/30"
                            : "bg-[#591A0D]/10 border-[#591A0D] text-[#591A0D] shadow-sm font-black"
                          : isDark
                          ? "bg-stone-950/40 border-stone-850 text-stone-300 hover:bg-stone-900/30"
                          : "bg-stone-50 border-stone-200 text-stone-600 hover:bg-stone-100"
                      }`}
                    >
                      <div className="flex items-center gap-3 text-left">
                        <div
                          className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-black ${
                            isSelected
                              ? isDark
                                ? "bg-amber-500/20 text-amber-400"
                                : "bg-[#591A0D]/15 text-[#591A0D]"
                              : isDark
                              ? "bg-stone-900 text-stone-400"
                              : "bg-stone-100 text-stone-500"
                          }`}
                        >
                          {g.count}
                        </div>
                        <div>
                          <div
                            className={`font-bold text-xs ${
                              isSelected ? "" : isDark ? "text-stone-300" : "text-stone-850"
                            }`}
                          >
                            {isHi ? g.labelHi : g.labelEn}
                          </div>
                          <div className="text-[10px] text-stone-500">
                            {isHi ? `अनुमानित समय: ~${g.estMin} मिनट` : `Est. Time: ~${g.estMin} min`}
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        {g.recommended && (
                          <span className="text-[8px] bg-amber-500/10 text-amber-400 border border-amber-500/20 px-2 py-0.5 rounded-full font-bold uppercase tracking-wider">
                            {isHi ? "अनुशंसित" : "Recommended"}
                          </span>
                        )}
                        {isSelected && (
                          <div className="w-4.5 h-4.5 rounded-full bg-amber-500/20 border border-amber-500 flex items-center justify-center text-[10px] text-amber-400 font-bold">
                            ✓
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

      {/* Group Bottom Sheet */}
      <AnimatePresence>
        {isGroupSheetOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsGroupSheetOpen(false)}
              className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[99]"
            />
            <motion.div
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 220 }}
              className={`fixed bottom-0 left-0 right-0 max-w-md mx-auto border-t rounded-t-[28px] p-6 pb-12 z-[100] ${sheetClass}`}
            >
              <div className="w-12 h-1 bg-stone-800/80 rounded-full mx-auto mb-5" />

              <h3 className={`text-base font-bold mb-4 flex items-center gap-2 ${sheetTitle}`}>
                👥 {isHi ? "साधना गंतव्य (समूह)" : "Select Group Destination"}
              </h3>

              <div className="space-y-2 max-h-[250px] overflow-y-auto pr-1">
                {/* Personal Option */}
                <button
                  type="button"
                  onClick={() => {
                    setSelectedGroupId(null);
                    setIsGroupSheetOpen(false);
                  }}
                  className={`w-full flex items-center justify-between p-3.5 rounded-2xl transition-all border ${
                    selectedGroupId === null
                      ? isDark
                        ? "bg-amber-950/20 border-amber-500/50 text-amber-300 shadow-md shadow-amber-950/30"
                        : "bg-[#591A0D]/10 border-[#591A0D] text-[#591A0D] shadow-sm font-black"
                      : isDark
                      ? "bg-stone-950/40 border-stone-850 text-stone-300 hover:bg-stone-900/30"
                      : "bg-stone-50 border-stone-200 text-stone-600 hover:bg-stone-100"
                  }`}
                >
                  <div className="flex items-center gap-3 text-left">
                    <div className={`p-2 rounded-xl ${selectedGroupId === null ? (isDark ? "bg-amber-500/20 text-amber-400" : "bg-[#591A0D]/15 text-[#591A0D]") : (isDark ? "bg-stone-900 text-stone-400" : "bg-stone-100 text-stone-500")}`}>
                      <User className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="font-bold text-xs">{isHi ? "व्यक्तिगत साधना" : "Personal Sadhana"}</div>
                      <div className="text-[10px] opacity-60">{isHi ? "केवल आपके प्रोफाइल में रिकॉर्ड होगी" : "Recorded in your profile"}</div>
                    </div>
                  </div>
                  {selectedGroupId === null && <span className="text-amber-500 font-bold text-sm">✓</span>}
                </button>

                {/* User Groups */}
                {userGroups.map((g) => {
                  const isSelected = selectedGroupId === g.id;
                  return (
                    <button
                      key={g.id}
                      type="button"
                      onClick={() => {
                        setSelectedGroupId(g.id);
                        setIsGroupSheetOpen(false);
                      }}
                      className={`w-full flex items-center justify-between p-3.5 rounded-2xl transition-all border ${
                        isSelected
                          ? isDark
                            ? "bg-amber-950/20 border-amber-500/50 text-amber-300 shadow-md shadow-amber-950/30"
                            : "bg-[#591A0D]/10 border-[#591A0D] text-[#591A0D] shadow-sm font-black"
                          : isDark
                          ? "bg-stone-950/40 border-stone-850 text-stone-300 hover:bg-stone-900/30"
                          : "bg-stone-50 border-stone-200 text-stone-600 hover:bg-stone-100"
                      }`}
                    >
                      <div className="flex items-center gap-3 text-left">
                        <div className={`p-2 rounded-xl ${isSelected ? (isDark ? "bg-amber-500/20 text-amber-400" : "bg-[#591A0D]/15 text-[#591A0D]") : (isDark ? "bg-stone-900 text-stone-400" : "bg-stone-100 text-stone-500")}`}>
                          <Users className="w-4 h-4" />
                        </div>
                        <div>
                          <div className="font-bold text-xs">{g.name}</div>
                          <div className="text-[10px] opacity-60">{isHi ? "समूह में आहुति दें" : "Contribute to group"}</div>
                        </div>
                      </div>
                      {isSelected && <span className="text-amber-500 font-bold text-sm">✓</span>}
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
