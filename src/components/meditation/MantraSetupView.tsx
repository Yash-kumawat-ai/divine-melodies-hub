import React, { useState, useMemo, useEffect } from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  X,
  Sparkles,
  Heart,
  Activity,
  Users,
  Star,
  ChevronRight,
  Check,
  Play,
} from "lucide-react";
import { useLanguage } from "@/hooks/useLanguage";
import { useAuth } from "@/hooks/useAuth";
import { useTheme } from "@/hooks/useTheme";
import { cn } from "@/lib/utils";
import type { Mantra } from "@/lib/mantraJapa/mantraJapaApi";
import { fetchGroups } from "@/lib/naamSangh/naamSanghApi";
import prayingSvg from "@/pages/images/svg/praying-svgrepo-com.svg";
import groupUsersSvg from "@/pages/images/svg/group-of-users-svgrepo-com.svg";
import voiceRadioSvg from "@/pages/images/svg/voice-radio-svgrepo-com.svg";
import malasSvg from "@/pages/images/svg/malas.svg";

// Module-level group cache to ensure instant, zero-delay rendering of Dedication
let cachedUserGroups: any[] = [];
let isFetchingGroups = false;

const LotusIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" {...props}>
    <path d="M12 6c1.5-2.5 4-3.5 6-3.5 1.5 3.5-.5 7-6 10-5.5-3-7.5-6.5-6-10 2 0 4.5 1 6 3.5z" />
    <path d="M12 12.5c2.5-1.5 5.5-2 7.5-.5.5 3-2 6-7.5 7-5.5-1-8-4-7.5-7 2-1.5 5-.5 7.5.5z" />
    <path d="M12 12v9" />
  </svg>
);

type PracticeMode = "mala" | "voice";

export type MantraSetupViewProps = {
  mantra: Mantra;
  onBack: () => void;
  onStartJapa: (options: {
    sankalpText: string;
    targetCount: number;
    practiceMode: PracticeMode;
    groupId?: string | null;
  }) => void;
  initialGroupId?: string | null;
};

const brandIconWell =
  "bg-[#FAF0E4] border-[#E8D8C4] text-[#651317] dark:bg-amber-500/15 dark:border-amber-500/30 dark:text-amber-300";

export default function MantraSetupView({
  mantra,
  onBack,
  onStartJapa,
  initialGroupId,
}: MantraSetupViewProps) {
  const { language } = useLanguage();
  const isHi = language === "hi";
  const { theme } = useTheme();
  const isDark = theme === "dark";

  const [selectedSankalpIndex, setSelectedSankalpIndex] = useState(0);
  const [customSankalp, setCustomSankalp] = useState("");
  const [targetCount, setTargetCount] = useState(108);
  const [practiceMode, setPracticeMode] = useState<PracticeMode>("mala");
  const [isSankalpSheetOpen, setIsSankalpSheetOpen] = useState(false);
  const [isGroupSheetOpen, setIsGroupSheetOpen] = useState(false);
  const [userGroups, setUserGroups] = useState<any[]>(() => cachedUserGroups);
  const [selectedGroupId, setSelectedGroupId] = useState<string | null>(() => initialGroupId || null);

  const { user } = useAuth();

  useEffect(() => {
    const origOverflow = document.body.style.overflow;
    const origTouchAction = document.body.style.touchAction;
    
    document.body.style.overflow = "hidden";
    document.body.style.touchAction = "none";
    
    return () => {
      document.body.style.overflow = origOverflow;
      document.body.style.touchAction = origTouchAction;
    };
  }, []);

  React.useEffect(() => {
    if (initialGroupId) setSelectedGroupId(initialGroupId);
  }, [initialGroupId]);

  React.useEffect(() => {
    if (isFetchingGroups) return;
    isFetchingGroups = true;
    fetchGroups(user?.id)
      .then((groups) => {
        if (groups) {
          cachedUserGroups = groups;
          setUserGroups(groups);
        }
      })
      .finally(() => {
        isFetchingGroups = false;
      });
  }, [user?.id]);

  const sankalpOptions = useMemo(
    () => [
      { id: "inner_peace", labelHi: "मानसिक शांति", labelEn: "Inner Peace", subHi: "मन शांत और एकाग्र करना", subEn: "Calm and center the mind", icon: LotusIcon },
      { id: "healing", labelHi: "स्वास्थ्य और कल्याण", labelEn: "Health & Healing", subHi: "शारीरिक और मानसिक आरोग्यता", subEn: "Physical and mental wellness", icon: Activity },
      { id: "family", labelHi: "परिवार कल्याण", labelEn: "Family Wellbeing", subHi: "प्रियजनों की समृद्धि व सुरक्षा", subEn: "Protection and prosperity", icon: Users },
      { id: "spiritual", labelHi: "आध्यात्मिक विकास", labelEn: "Spiritual Growth", subHi: "चेतना और आत्मज्ञान का उदय", subEn: "Rising consciousness", icon: Sparkles },
      { id: "gratitude", labelHi: "कृतज्ञता", labelEn: "Gratitude", subHi: "संसार के प्रति आभार जताना", subEn: "Thankfulness to universe", icon: Heart },
      { id: "success", labelHi: "सफलता", labelEn: "Success", subHi: "कार्य में बाधाओं का नाश", subEn: "Removal of obstacles", icon: Star },
    ],
    []
  );

  const goalOptions = useMemo(
    () => [
      { count: 27, labelHi: "1/4 माला", labelEn: "1/4 Mala", estMin: 2 },
      { count: 54, labelHi: "1/2 माला", labelEn: "1/2 Mala", estMin: 4 },
      { count: 108, labelHi: "1 माला", labelEn: "1 Mala", estMin: 8, recommended: true },
      { count: 216, labelHi: "2 माला", labelEn: "2 Malas", estMin: 16 },
      { count: 1008, labelHi: "10 माला", labelEn: "10 Malas", estMin: 75 },
    ],
    []
  );

  const currentSankalpText = useMemo(() => {
    if (selectedSankalpIndex === -1 && customSankalp.trim()) return customSankalp.trim();
    const selected = sankalpOptions[selectedSankalpIndex] || sankalpOptions[0];
    return isHi ? selected.labelHi : selected.labelEn;
  }, [customSankalp, selectedSankalpIndex, sankalpOptions, isHi]);

  const currentEstTime = useMemo(() => {
    const matched = goalOptions.find((g) => g.count === targetCount);
    return matched ? matched.estMin : Math.round(targetCount * 0.07);
  }, [targetCount, goalOptions]);

  const handleBegin = () => {
    onStartJapa({
      sankalpText: currentSankalpText,
      targetCount,
      practiceMode,
      groupId: selectedGroupId,
    });
  };

  const selectedGroupName = useMemo(() => {
    if (!selectedGroupId) return isHi ? "व्यक्तिगत साधना" : "Personal Sadhana";
    const found = userGroups.find((g) => g.id === selectedGroupId);
    return found ? found.name : isHi ? "समूह" : "Group";
  }, [selectedGroupId, userGroups, isHi]);

  const sheetOption = (selected: boolean) =>
    cn(
      "w-full flex items-center justify-between p-3.5 rounded-2xl transition-all border cursor-pointer",
      selected
        ? "bg-[#651317]/10 border-[#651317] text-[#651317] dark:bg-amber-500/15 dark:border-amber-500/50 dark:text-amber-200 font-bold"
        : "bg-[#FFFDF8] border-[#E8D8C4] text-[#3A2418] hover:bg-[#FAF0E4]/50 dark:bg-stone-950/50 dark:border-stone-800 dark:text-stone-200 dark:hover:bg-stone-900/40"
    );

  const sheetPanel =
    "fixed bottom-0 left-0 right-0 max-w-lg mx-auto border-t rounded-t-[28px] p-6 pb-12 max-h-[85vh] overflow-y-auto z-[350] bg-[#FFFDF8] border-[#E8D8C4] text-[#3A2418] shadow-2xl dark:bg-[#140b07] dark:border-stone-700 dark:text-amber-50";

  return createPortal(
    <div className="fixed inset-0 z-[300] flex items-center justify-center p-3 sm:p-4 overflow-hidden touch-none select-none overscroll-none">
      {/* Backdrop completely absorbs all clicks and touch gestures */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.1 }}
        onClick={onBack}
        onTouchMove={(e) => e.preventDefault()}
        className="absolute inset-0 bg-black/65 backdrop-blur-xs z-0"
      />

      <motion.div
        initial={{ opacity: 0, scale: 0.96 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.96 }}
        transition={{ duration: 0.12 }}
        onClick={(e) => e.stopPropagation()}
        className="relative w-full max-w-lg bg-[#FAF6EE] dark:bg-[#120a06] border border-[#E8D8C4] dark:border-amber-500/30 rounded-[28px] shadow-[0_20px_60px_rgba(0,0,0,0.6)] overflow-hidden my-auto max-h-[min(92vh,720px)] flex flex-col z-10 overscroll-contain select-text"
      >
        <div className="flex items-center justify-between px-4 py-3 border-b border-[#E8D8C4] dark:border-stone-800 bg-[#FFFDF8] dark:bg-[#180E09] shrink-0">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-10 h-10 rounded-full border border-[#E8D8C4] dark:border-amber-500/30 bg-[#FFFDF8] dark:bg-stone-900 flex items-center justify-center shrink-0">
              <span className="font-hindi text-[22px] leading-none text-[#651317] dark:text-amber-300" style={{ fontFamily: '"Noto Sans Devanagari", sans-serif' }}>ॐ</span>
            </div>
            <div className="min-w-0 text-left">
              <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-[#651317] dark:text-amber-300 leading-none mb-1">
                {isHi ? "दैनिक जप साधना" : "Daily Japa Sadhana"}
              </p>
              <h2 className="text-base sm:text-lg font-semibold text-[#651317] dark:text-amber-100 truncate leading-tight">
                {isHi ? mantra.name_hindi : mantra.name_english}
              </h2>
            </div>
          </div>

          <button
            type="button"
            onClick={onBack}
            className="h-11 w-11 rounded-full border border-[#E8D8C4] dark:border-stone-700 bg-[#FFFDF8] dark:bg-stone-900 text-[#651317] dark:text-amber-300 flex items-center justify-center hover:bg-[#FAF0E4] dark:hover:bg-stone-800 active:scale-95 transition-all cursor-pointer shrink-0 ml-2"
            aria-label="Close"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="overflow-y-auto p-3 sm:p-4 space-y-3 text-left overscroll-contain touch-pan-y flex-1">
          {/* Practice Method Selection */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold uppercase tracking-wider text-[#651317] dark:text-amber-300">
              {isHi ? "विधि चुनें" : "Select Method"}
            </label>
            <div className="grid grid-cols-2 gap-2.5">
              {/* Mala Japa */}
              <button
                type="button"
                onClick={() => setPracticeMode("mala")}
                className={cn(
                  "relative flex items-center gap-3 p-3 sm:p-3.5 rounded-2xl border transition-all text-left cursor-pointer active:scale-[0.98]",
                  practiceMode === "mala"
                    ? "border-[#651317] bg-[#651317]/10 text-[#651317] dark:border-amber-500 dark:bg-amber-500/15 dark:text-amber-200 shadow-xs"
                    : "border-[#E8D8C4] bg-[#FFFDF8] text-[#786252] hover:bg-[#FAF0E4]/60 dark:border-stone-700 dark:bg-stone-900/50 dark:text-stone-300"
                )}
              >
                <div className="w-9 h-9 sm:w-10 sm:h-10 shrink-0 flex items-center justify-center">
                  <img src={malasSvg} alt="Mala" width={40} height={40} decoding="async" className="w-full h-full object-contain drop-shadow-xs" />
                </div>
                <div className="min-w-0">
                  <span className="text-xs sm:text-sm font-bold block leading-normal py-0.5">
                    {isHi ? "माला जप" : "Mala Jap"}
                  </span>
                  <span className="text-[10.5px] opacity-75 block mt-0.5">
                    {isHi ? "मनका स्पर्श" : "Bead touch"}
                  </span>
                </div>
                {practiceMode === "mala" && (
                  <span className="absolute top-2.5 right-2.5 w-4 h-4 rounded-full bg-[#651317] dark:bg-amber-500 text-white dark:text-black flex items-center justify-center shadow-xs">
                    <Check className="w-2.5 h-2.5 stroke-[3px]" />
                  </span>
                )}
              </button>

              {/* Voice Japa */}
              <button
                type="button"
                onClick={() => setPracticeMode("voice")}
                className={cn(
                  "relative flex items-center gap-3 p-3 sm:p-3.5 rounded-2xl border transition-all text-left cursor-pointer active:scale-[0.98]",
                  practiceMode === "voice"
                    ? "border-[#651317] bg-[#651317]/10 text-[#651317] dark:border-amber-500 dark:bg-amber-500/15 dark:text-amber-200 shadow-xs"
                    : "border-[#E8D8C4] bg-[#FFFDF8] text-[#786252] hover:bg-[#FAF0E4]/60 dark:border-stone-700 dark:bg-stone-900/50 dark:text-stone-300"
                )}
              >
                <div className="w-8 h-8 sm:w-9 sm:h-9 shrink-0 flex items-center justify-center p-0.5">
                  <img src={voiceRadioSvg} alt="Voice" width={40} height={40} decoding="async" className="w-full h-full object-contain dark:invert drop-shadow-xs" />
                </div>
                <div className="min-w-0">
                  <span className="text-xs sm:text-sm font-bold block leading-normal py-0.5">
                    {isHi ? "स्वर जप" : "Voice Jap"}
                  </span>
                  <span className="text-[10.5px] opacity-75 block mt-0.5">
                    {isHi ? "ध्वनि पहचान" : "Chant detection"}
                  </span>
                </div>
                {practiceMode === "voice" && (
                  <span className="absolute top-2.5 right-2.5 w-4 h-4 rounded-full bg-[#651317] dark:bg-amber-500 text-white dark:text-black flex items-center justify-center shadow-xs">
                    <Check className="w-2.5 h-2.5 stroke-[3px]" />
                  </span>
                )}
              </button>
            </div>
          </div>

          {/* Target Count Selection (Balanced, clearly visible star badge) */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold uppercase tracking-wider text-[#651317] dark:text-amber-300">
                {isHi ? "जप संख्या (माला)" : "Mantra Count (Mala)"}
              </label>
              <span className="text-xs font-semibold text-[#786252] dark:text-stone-400">
                ~<span style={{ fontVariantNumeric: "lining-nums tabular-nums", fontFamily: "Inter, ui-sans-serif, system-ui, sans-serif" }}>{currentEstTime}</span>{" "}
                {isHi ? "मिनट अनुमानित" : "min estimated"}
              </span>
            </div>
            <div className="grid grid-cols-5 gap-2 pt-1">
              {goalOptions.map((g) => {
                const isSelected = targetCount === g.count;
                return (
                  <button
                    key={g.count}
                    type="button"
                    onClick={() => setTargetCount(g.count)}
                    className={cn(
                      "relative flex flex-col items-center justify-center py-2.5 px-1.5 rounded-2xl border transition-all cursor-pointer active:scale-95 text-center min-h-[60px]",
                      isSelected
                        ? "bg-[#651317] text-white border-[#651317] dark:bg-amber-500 dark:text-black dark:border-amber-400 font-bold shadow-sm"
                        : "bg-[#FFFDF8] dark:bg-stone-900 border-[#E8D8C4] dark:border-stone-700 text-[#3A2418] dark:text-stone-300 hover:border-amber-400"
                    )}
                  >
                    <span
                      className="text-base font-semibold leading-none font-sans tabular-nums lining-nums"
                      style={{ fontVariantNumeric: "lining-nums tabular-nums", fontFamily: "Inter, ui-sans-serif, system-ui, sans-serif" }}
                    >
                      {g.count}
                    </span>
                    <span className="text-[11px] font-medium leading-normal mt-1 opacity-90">
                      {isHi ? g.labelHi : g.labelEn}
                    </span>
                    {g.recommended && (
                      <span
                        className={cn(
                          "absolute -top-2.5 right-1 px-1.5 py-0.5 rounded-full text-[9px] font-black tracking-tight shadow-md flex items-center gap-0.5 z-10 border",
                          isSelected
                            ? "bg-amber-300 text-[#651317] border-[#651317]/20"
                            : "bg-amber-400 text-stone-950 border-white/80 dark:border-stone-900"
                        )}
                      >
                        <Star className="w-2.5 h-2.5 fill-current" />
                        <span>{isHi ? "मुख्य" : "Best"}</span>
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Sankalp / Intention Picker */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold uppercase tracking-wider text-[#651317] dark:text-amber-300">
              {isHi ? "शुभ संकल्प" : "Intention (Sankalp)"}
            </label>
            <button
              type="button"
              onClick={() => setIsSankalpSheetOpen(true)}
              className="w-full flex items-center justify-between p-3.5 rounded-2xl bg-[#FFFDF8] dark:bg-stone-900 border border-[#E8D8C4] dark:border-stone-700 text-left hover:bg-[#FAF0E4]/50 dark:hover:bg-stone-800/50 transition-all cursor-pointer shadow-2xs"
            >
              <div className="flex items-center gap-3 min-w-0">
                <div className={cn("w-9 h-9 rounded-full flex items-center justify-center shrink-0 border p-2", brandIconWell)}>
                  <img src={prayingSvg} alt="" width={16} height={16} decoding="async" className="w-4 h-4 object-contain" />
                </div>
                <div className="min-w-0">
                  <span className="text-sm font-bold block text-[#651317] dark:text-amber-200 leading-normal py-0.5">
                    {currentSankalpText}
                  </span>
                  <span className="text-xs text-[#786252] dark:text-stone-400 block mt-0.5">
                    {isHi ? "संकल्प बदलने के लिए टैप करें" : "Tap to change intention"}
                  </span>
                </div>
              </div>
              <ChevronRight className="w-4 h-4 text-[#786252] dark:text-stone-500 shrink-0" />
            </button>
          </div>

          {/* Group Dedication Picker (Zero lag / always seamless) */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold uppercase tracking-wider text-[#651317] dark:text-amber-300">
              {isHi ? "समर्पण गंतव्य" : "Dedication"}
            </label>
            <button
              type="button"
              onClick={() => setIsGroupSheetOpen(true)}
              className="w-full flex items-center justify-between p-3.5 rounded-2xl bg-[#FFFDF8] dark:bg-stone-900 border border-[#E8D8C4] dark:border-stone-700 text-left hover:bg-[#FAF0E4]/50 dark:hover:bg-stone-800/50 transition-all cursor-pointer shadow-2xs"
            >
              <div className="flex items-center gap-3 min-w-0">
                <div className={cn("w-9 h-9 rounded-full flex items-center justify-center shrink-0 border p-2", brandIconWell)}>
                  <img src={groupUsersSvg} alt="" width={16} height={16} decoding="async" className="w-4 h-4 object-contain" />
                </div>
                <div className="min-w-0">
                  <span className="text-sm font-bold block text-[#651317] dark:text-amber-200 leading-normal py-0.5">
                    {selectedGroupName}
                  </span>
                  <span className="text-xs text-[#786252] dark:text-stone-400 block mt-0.5">
                    {userGroups.length > 0
                      ? isHi
                        ? "व्यक्तिगत या समूह चुनें"
                        : "Personal or group dedication"
                      : isHi
                        ? "व्यक्तिगत साधना (कोई समूह नहीं)"
                        : "Personal devotion"}
                  </span>
                </div>
              </div>
              <ChevronRight className="w-4 h-4 text-[#786252] dark:text-stone-500 shrink-0" />
            </button>
          </div>
        </div>

        {/* Modal Sticky Footer (Always fully accessible & on top) */}
        <div className="p-3 sm:p-4 border-t border-[#E8D8C4] dark:border-stone-800 bg-[#FFFDF8] dark:bg-[#180E09] shrink-0 space-y-3">
          <div className="flex items-center justify-between text-xs text-[#786252] dark:text-stone-400 px-1 font-medium">
            <span>
              <strong
                className="text-[#651317] dark:text-amber-300 font-semibold font-sans tabular-nums lining-nums"
                style={{ fontVariantNumeric: "lining-nums tabular-nums", fontFamily: "Inter, ui-sans-serif, system-ui, sans-serif" }}
              >
                {targetCount}
              </strong>{" "}
              {isHi ? "मंत्र" : "mantras"}
            </span>
            <span>·</span>
            <span>
              ~<strong className="text-[#651317] dark:text-amber-300 font-bold">{currentEstTime}</strong> {isHi ? "मिनट" : "min"}
            </span>
            <span>·</span>
            <span className="font-bold text-[#651317] dark:text-amber-300">
              {practiceMode === "voice" ? (isHi ? "स्वर जप" : "Voice Jap") : isHi ? "माला जप" : "Mala Jap"}
            </span>
          </div>

          <button
            type="button"
            onClick={handleBegin}
            onPointerEnter={() => {
              void import("@/components/meditation/PremiumJapaCounter");
            }}
            className="w-full flex items-center justify-center gap-2.5 rounded-full bg-[#651317] hover:bg-[#4f0f12] text-white font-bold h-12 text-sm sm:text-base active:scale-95 transition-all shadow-[0_6px_20px_rgba(101,19,23,0.4)] border border-amber-400/30 cursor-pointer"
          >
            <Play className="w-4 h-4 fill-current stroke-none text-amber-300" />
            <span>{isHi ? "साधना प्रारंभ करें" : "Begin Sadhana"}</span>
          </button>
        </div>
      </motion.div>

      {/* Sankalp Sheet Modal */}
      <AnimatePresence>
        {isSankalpSheetOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsSankalpSheetOpen(false)}
              onTouchMove={(e) => e.preventDefault()}
              className="fixed inset-0 bg-black/55 z-[340] backdrop-blur-xs"
            />
            <motion.div
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 220 }}
              className={sheetPanel}
            >
              <div className="w-12 h-1 bg-[#E8D8C4] dark:bg-stone-700 rounded-full mx-auto mb-4" />
              <h3 className="text-base font-display font-bold mb-3 text-[#651317] dark:text-amber-300 text-left">
                {isHi ? "संकल्प का चयन करें" : "Select Intention"}
              </h3>

              <div className="space-y-2 max-h-[240px] overflow-y-auto pr-1">
                {sankalpOptions.map((opt, idx) => {
                  const isSelected = selectedSankalpIndex === idx;
                  const Icon = opt.icon;
                  return (
                    <button
                      key={opt.id}
                      type="button"
                      onClick={() => {
                        setSelectedSankalpIndex(idx);
                        setCustomSankalp("");
                        setIsSankalpSheetOpen(false);
                      }}
                      className={sheetOption(isSelected)}
                    >
                      <div className="flex items-center gap-3 text-left">
                        <div className={cn("p-2 rounded-xl border", brandIconWell)}>
                          <Icon className="w-4 h-4" />
                        </div>
                        <div>
                          <div className="font-bold text-xs sm:text-sm text-[#651317] dark:text-amber-200 leading-normal py-0.5">
                            {isHi ? opt.labelHi : opt.labelEn}
                          </div>
                          <div className="text-[11px] font-medium text-[#786252] dark:text-stone-400 mt-0.5">
                            {isHi ? opt.subHi : opt.subEn}
                          </div>
                        </div>
                      </div>
                      {isSelected && (
                        <span className="w-5 h-5 rounded-full bg-[#651317] dark:bg-amber-500 text-white dark:text-black flex items-center justify-center shadow-xs">
                          <Check className="w-3 h-3 stroke-[3px]" />
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>

              <div className="mt-4 pt-3 border-t border-[#E8D8C4] dark:border-stone-800 text-left">
                <label className="text-[11px] font-bold uppercase tracking-wider block mb-1.5 text-[#651317] dark:text-amber-400">
                  {isHi ? "या अपना संकल्प लिखें" : "Or type custom intention"}
                </label>
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    if (customSankalp.trim()) {
                      setSelectedSankalpIndex(-1);
                      setIsSankalpSheetOpen(false);
                    }
                  }}
                  className="flex gap-2"
                >
                  <input
                    type="text"
                    value={customSankalp}
                    onChange={(e) => setCustomSankalp(e.target.value)}
                    placeholder={isHi ? "उदा. परीक्षा में सफलता..." : "e.g. Inner peace..."}
                    className="flex-1 px-3.5 py-2 text-xs sm:text-sm rounded-xl border border-[#E8D8C4] dark:border-stone-700 bg-white dark:bg-stone-900 text-[#3A2418] dark:text-amber-100 focus:outline-none focus:border-[#651317] dark:focus:border-amber-400"
                  />
                  <button
                    type="submit"
                    disabled={!customSankalp.trim()}
                    className="px-4 py-2 rounded-xl bg-[#651317] text-white text-xs sm:text-sm font-bold disabled:opacity-50 active:scale-95 transition-all cursor-pointer"
                  >
                    {isHi ? "जोड़ें" : "Set"}
                  </button>
                </form>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Group Destination Sheet */}
      <AnimatePresence>
        {isGroupSheetOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsGroupSheetOpen(false)}
              onTouchMove={(e) => e.preventDefault()}
              className="fixed inset-0 bg-black/55 z-[340] backdrop-blur-xs"
            />
            <motion.div
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 220 }}
              className={sheetPanel}
            >
              <div className="w-12 h-1 bg-[#E8D8C4] dark:bg-stone-700 rounded-full mx-auto mb-4" />
              <h3 className="text-base font-display font-bold mb-3 text-[#651317] dark:text-amber-300 text-left">
                {isHi ? "समर्पण गंतव्य चुनें" : "Select Dedication"}
              </h3>

              <div className="space-y-2 max-h-[260px] overflow-y-auto pr-1">
                {/* Personal Option */}
                <button
                  type="button"
                  onClick={() => {
                    setSelectedGroupId(null);
                    setIsGroupSheetOpen(false);
                  }}
                  className={sheetOption(selectedGroupId === null)}
                >
                  <div className="flex items-center gap-3 text-left">
                    <div className={cn("p-2 rounded-xl border", brandIconWell)}>
                      <Sparkles className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="font-bold text-xs sm:text-sm text-[#651317] dark:text-amber-200 leading-normal py-0.5">
                        {isHi ? "व्यक्तिगत साधना" : "Personal Sadhana"}
                      </div>
                      <div className="text-[11px] font-medium text-[#786252] dark:text-stone-400 mt-0.5">
                        {isHi ? "जाप केवल आपकी व्यक्तिगत प्रोफाइल में जुड़ेगा" : "Logged to your personal profile"}
                      </div>
                    </div>
                  </div>
                  {selectedGroupId === null && (
                    <span className="w-5 h-5 rounded-full bg-[#651317] dark:bg-amber-500 text-white dark:text-black flex items-center justify-center shadow-xs">
                      <Check className="w-3 h-3 stroke-[3px]" />
                    </span>
                  )}
                </button>

                {/* Group Options */}
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
                      className={sheetOption(isSelected)}
                    >
                      <div className="flex items-center gap-3 text-left">
                        <div className={cn("p-2 rounded-xl border", brandIconWell)}>
                          <Users className="w-4 h-4" />
                        </div>
                        <div>
                          <div className="font-bold text-xs sm:text-sm text-[#651317] dark:text-amber-200 leading-normal py-0.5">
                            {g.name}
                          </div>
                          <div className="text-[11px] font-medium text-[#786252] dark:text-stone-400 mt-0.5">
                            {isHi ? "समूह के सामूहिक जाप में जुड़ेगा" : "Dedicate to group total"}
                          </div>
                        </div>
                      </div>
                      {isSelected && (
                        <span className="w-5 h-5 rounded-full bg-[#651317] dark:bg-amber-500 text-white dark:text-black flex items-center justify-center shadow-xs">
                          <Check className="w-3 h-3 stroke-[3px]" />
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>,
    document.body
  );
}
