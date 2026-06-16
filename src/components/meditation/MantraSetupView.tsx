import React, { useState, useMemo } from "react";
import { motion } from "framer-motion";
import {
  ArrowLeft,
  PenSquare,
  Sparkles,
  Heart,
  Activity,
  Users,
  Star,
  Clock,
  Mic,
  Headphones,
  Info,
  ChevronRight,
} from "lucide-react";
import { useLanguage } from "@/hooks/useLanguage";
import type { Mantra } from "@/lib/mantraJapa/mantraJapaApi";

// ─── CUSTOM GOLD ICONS ───────────────────────────────────────────
const MalaIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.0" strokeLinecap="round" strokeLinejoin="round" {...props}>
    <circle cx="12" cy="10" r="6" strokeDasharray="3 3" />
    <circle cx="12" cy="17" r="1.5" fill="currentColor" />
    <path d="M11 18.5l1 1.5 1-1.5" />
  </svg>
);

const LotusIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" {...props}>
    <path d="M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10z" className="opacity-5" />
    <path d="M12 6c1.5-2.5 4-3.5 6-3.5 1.5 3.5-.5 7-6 10-5.5-3-7.5-6.5-6-10 2 0 4.5 1 6 3.5z" />
    <path d="M12 12.5c2.5-1.5 5.5-2 7.5-.5.5 3-2 6-7.5 7-5.5-1-8-4-7.5-7 2-1.5 5-.5 7.5.5z" />
    <path d="M12 12v9" />
  </svg>
);

const TouchIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" {...props}>
    <path d="M12 12V4a1.5 1.5 0 0 1 3 0v8M9 13V7.5a1.5 1.5 0 0 1 3 0V12" />
    <path d="M6 14.5V11a1.5 1.5 0 0 1 3 0v2.5" />
    <path d="M15 11.5a1.5 1.5 0 0 1 3 0v4a5.5 5.5 0 0 1-11 0V14" />
    <circle cx="13.5" cy="2" r="1.5" className="text-amber-500 fill-current" />
    <path d="M10 2.5a2.5 2.5 0 0 1 7 0" strokeDasharray="1 1" />
  </svg>
);

const OmSymbol = (props: React.SVGProps<SVGSVGElement>) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" {...props}>
    <path d="M6 10c0-2.5 2-4.5 4.5-4.5S15 7.5 15 10c0 4-5 5-5 8h7" />
    <path d="M13 5.5a2.5 2.5 0 0 1 4 0" />
    <circle cx="14.5" cy="2.5" r="1" fill="currentColor" />
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
  }) => void;
};

export default function MantraSetupView({
  mantra,
  onBack,
  onStartJapa,
}: MantraSetupViewProps) {
  const { language } = useLanguage();
  const isHi = language === "hi";

  // ─── STATE ──────────────────────────────────────────────────────
  const [selectedSankalpIndex, setSelectedSankalpIndex] = useState(0);
  const [customSankalp, setCustomSankalp] = useState("");
  const [targetCount, setTargetCount] = useState(108);
  const [practiceMode, setPracticeMode] = useState<"mala" | "tap" | "voice" | "guided">("mala");

  // ─── OPTIONS CONFIGURATION ──────────────────────────────────────
  const sankalpOptions = useMemo(() => [
    {
      id: "inner_peace",
      labelHi: "मानसिक शांति",
      labelEn: "Inner Peace",
      subHi: "मन शांत और एकाग्र करना",
      subEn: "Calm and center the mind",
      icon: LotusIcon,
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
      subEn: "Protection and prosperity",
      icon: Users,
    },
    {
      id: "spiritual",
      labelHi: "आध्यात्मिक विकास",
      labelEn: "Spiritual Growth",
      subHi: "चेतना और आत्मज्ञान का उदय",
      subEn: "Rising consciousness",
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
      subEn: "Removal of obstacles",
      icon: Star,
    },
  ], []);

  const goalOptions = useMemo(() => [
    { count: 27, labelHi: "चौथाई माला", labelEn: "Quarter Mala", shortHi: "१/४ माला", shortEn: "1/4 Mala", estMin: 2 },
    { count: 54, labelHi: "आधी माला", labelEn: "Half Mala", shortHi: "१/२ माला", shortEn: "1/2 Mala", estMin: 4 },
    {
      count: 108,
      labelHi: "एक माला",
      labelEn: "One Mala",
      shortHi: "१ माला",
      shortEn: "1 Mala",
      estMin: 8,
      recommended: true,
    },
    { count: 216, labelHi: "दो माला", labelEn: "Two Malas", shortHi: "२ माला", shortEn: "2 Malas", estMin: 16 },
    { count: 1008, labelHi: "दस माला", labelEn: "Ten Malas", shortHi: "१० माला", shortEn: "10 Malas", estMin: 75 },
  ], []);

  const modeOptions = useMemo(() => [
    {
      id: "mala",
      labelHi: "पारंपरिक माला",
      labelEn: "Traditional Mala",
      subHi: "असली या वर्चुअल माला",
      subEn: "Real or virtual mala count",
      icon: MalaIcon,
    },
    {
      id: "tap",
      labelHi: "टैप काउंटर",
      labelEn: "Tap Counter",
      subHi: "स्क्रीन पर टैप करें",
      subEn: "Tap on screen to count",
      icon: TouchIcon,
    },
    {
      id: "voice",
      labelHi: "ध्वनि काउंटर",
      labelEn: "Voice Counter",
      subHi: "माइक से स्वचालित गिनती",
      subEn: "Automatic counting via mic",
      icon: Mic,
    },
    {
      id: "guided",
      labelHi: "मार्गदर्शित मोड",
      labelEn: "Guided Mode",
      subHi: "ऑडियो के साथ जाप",
      subEn: "Chant with audio guide",
      icon: Headphones,
    },
  ], []);

  // Compute values for practice summary
  const currentSankalpText = useMemo(() => {
    if (selectedSankalpIndex === -1 && customSankalp.trim()) {
      return customSankalp.trim();
    }
    const selected = sankalpOptions[selectedSankalpIndex] || sankalpOptions[0];
    return isHi ? selected.labelHi : selected.labelEn;
  }, [customSankalp, selectedSankalpIndex, sankalpOptions, isHi]);

  const currentModeText = useMemo(() => {
    const matched = modeOptions.find((m) => m.id === practiceMode);
    return matched ? (isHi ? matched.labelHi : matched.labelEn) : "";
  }, [practiceMode, modeOptions, isHi]);

  const currentGoalText = useMemo(() => {
    const matched = goalOptions.find((g) => g.count === targetCount);
    const textPart = matched ? (isHi ? matched.labelHi : matched.labelEn) : "";
    return `${targetCount} ${isHi ? "जाप" : "Chants"} (${textPart})`;
  }, [targetCount, goalOptions, isHi]);

  const currentEstTime = useMemo(() => {
    const matched = goalOptions.find((g) => g.count === targetCount);
    return matched ? matched.estMin : Math.round(targetCount * 0.07);
  }, [targetCount, goalOptions]);

  const handleBegin = () => {
    onStartJapa({
      sankalpText: currentSankalpText,
      targetCount,
      practiceMode,
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#090506] via-[#0c0608] to-[#040205] text-brand-cream/90 font-sans relative overflow-x-hidden pb-16 select-none">
      {/* Decorative watermarked background mandala */}
      <div className="absolute top-0 right-[-100px] md:right-0 w-[400px] h-[400px] opacity-[0.07] pointer-events-none text-amber-500">
        <svg className="w-full h-full animate-[spin_180s_linear_infinite]" viewBox="0 0 100 100">
          <circle cx="50" cy="50" r="45" fill="none" stroke="currentColor" strokeWidth="0.5" strokeDasharray="3 3" />
          <circle cx="50" cy="50" r="35" fill="none" stroke="currentColor" strokeWidth="0.3" />
          <circle cx="50" cy="50" r="25" fill="none" stroke="currentColor" strokeWidth="0.5" />
          <path d="M50 5 L50 95 M5 50 L95 50 M18 18 L82 82 M18 82 L82 18" stroke="currentColor" strokeWidth="0.2" />
        </svg>
      </div>

      <div className="max-w-2xl mx-auto px-4 pt-6 relative z-10 space-y-6">
        
        {/* ─── HEADER ─────────────────────────────────────────────── */}
        <div className="flex items-center gap-4 relative">
          <button
            onClick={onBack}
            className="w-10 h-10 rounded-full border border-amber-500/20 bg-black/40 hover:bg-black/70 flex items-center justify-center text-amber-400/90 active:scale-95 transition-all shrink-0"
            aria-label="Go back"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>

          {/* Diya Decoration & Title Section */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-400 to-orange-600 flex items-center justify-center text-black shadow-lg">
              <OmSymbol className="w-6 h-6 stroke-[2.2]" />
            </div>
            <div>
              <h1 className="font-display font-black text-xl md:text-2xl text-amber-400 tracking-wide leading-tight">
                {isHi ? "जप साधना प्रारंभ करें" : "Start Your Jap"}
              </h1>
              <p className="text-[10px] md:text-xs text-brand-cream/55 font-semibold">
                {isHi ? "अपना संकल्प चुनें और अभ्यास शुरू करें" : "Set your intention and begin your practice"}
              </p>
            </div>
          </div>
        </div>

        {/* ─── SECTION 1: SET YOUR SANKALP ─────────────────────── */}
        <div className="bg-[#12090b]/85 border border-white/5 rounded-3xl p-5 shadow-xl relative overflow-hidden backdrop-blur-md">
          <div className="absolute inset-0 bg-gradient-to-tr from-amber-500/[0.01] to-transparent pointer-events-none" />
          
          <div className="flex items-center gap-3 mb-4">
            <span className="w-6 h-6 rounded-full bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-xs font-black text-amber-400 shrink-0">1</span>
            <div>
              <h2 className="font-display font-bold text-base text-amber-300">
                {isHi ? "अपना संकल्प चुनें (Set Your Intention)" : "Set Your Intention"}
              </h2>
              <p className="text-[10px] text-brand-cream/50 mt-0.5">
                {isHi ? "आज आप यह अभ्यास क्यों कर रहे हैं?" : "Why are you doing this practice today?"}
              </p>
            </div>
          </div>

          {/* Grid of Sankalpa options */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {sankalpOptions.map((opt, idx) => {
              const Icon = opt.icon;
              const isSelected = selectedSankalpIndex === idx && !customSankalp.trim();
              return (
                <button
                  key={opt.id}
                  onClick={() => {
                    setSelectedSankalpIndex(idx);
                    setCustomSankalp(""); // Clear custom when preset clicked
                  }}
                  className={`relative flex flex-col items-center justify-center p-3 rounded-2xl border transition-all duration-300 group text-center h-28 ${
                    isSelected
                      ? "bg-gradient-to-br from-amber-500/15 via-orange-600/5 to-black/50 border-amber-400 shadow-[0_4px_16px_rgba(245,158,11,0.2)] scale-[1.02]"
                      : "bg-black/30 border-white/5 hover:border-amber-500/20 hover:bg-amber-500/[0.01]"
                  }`}
                >
                  {isSelected && (
                    <div className="absolute top-2 right-2 w-4.5 h-4.5 rounded-full bg-gradient-to-r from-amber-400 to-orange-500 flex items-center justify-center shadow">
                      <svg className="w-2.5 h-2.5 text-black stroke-[3.5]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                  )}
                  <Icon className={`w-6 h-6 mb-2 transition-all group-hover:scale-115 ${
                    isSelected ? "text-amber-400 filter drop-shadow-[0_0_8px_rgba(245,158,11,0.5)]" : "text-amber-500/50"
                  }`} />
                  
                  <span className={`text-xs font-bold tracking-wide transition-colors block ${
                    isSelected ? "text-amber-300" : "text-brand-cream/80"
                  }`}>
                    {isHi ? opt.labelHi : opt.labelEn}
                  </span>
                  
                  <span className="text-[8px] text-white/35 group-hover:text-white/50 transition-colors mt-1 max-w-[95%] leading-normal font-medium block">
                    {isHi ? opt.subHi : opt.subEn}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Custom Intention - Always visible */}
          <div className="mt-4 pt-4 border-t border-white/5 space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-[11px] font-bold text-amber-400/80 flex items-center gap-1.5 ml-1">
                <PenSquare className="w-3.5 h-3.5 text-amber-500" />
                {isHi ? "स्वयं का संकल्प लिखें (वैकल्पिक)" : "Custom intention / Sankalp (Optional)"}
              </label>
              {customSankalp.trim() && (
                <button
                  onClick={() => {
                    setCustomSankalp("");
                    setSelectedSankalpIndex(0); // Reset to first preset
                  }}
                  className="text-[9px] text-amber-500/80 hover:text-amber-400 font-bold tracking-wider uppercase"
                >
                  {isHi ? "साफ़ करें" : "Clear"}
                </button>
              )}
            </div>
            <div className="relative">
              <input
                type="text"
                value={customSankalp}
                onChange={(e) => {
                  setCustomSankalp(e.target.value);
                  setSelectedSankalpIndex(-1); // Deselect presets
                }}
                placeholder={isHi ? "जैसे: मन की शांति, एकाग्रता, परिवार का कल्याण..." : "e.g., Peace of mind, focus, family health..."}
                maxLength={80}
                className={`w-full bg-black/40 border rounded-xl px-3.5 py-3 text-sm text-brand-cream placeholder-white/20 outline-none transition-all pr-10 ${
                  selectedSankalpIndex === -1 && customSankalp.trim()
                    ? "border-amber-500/60 bg-amber-500/[0.02]"
                    : "border-white/5 hover:border-white/10 focus:border-amber-500/30"
                }`}
              />
              <PenSquare className={`w-4 h-4 absolute right-3.5 top-3.5 transition-colors ${
                selectedSankalpIndex === -1 && customSankalp.trim() ? "text-amber-400" : "text-white/25"
              }`} />
            </div>
          </div>
        </div>

        {/* ─── SECTION 2: CHOOSE CHANT GOAL ─────────────────────── */}
        <div className="bg-[#12090b]/85 border border-white/5 rounded-3xl p-5 shadow-xl relative backdrop-blur-md">
          <div className="flex items-center gap-3 mb-4">
            <span className="w-6 h-6 rounded-full bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-xs font-black text-amber-400 shrink-0">2</span>
            <div>
              <h2 className="font-display font-bold text-base text-amber-300">
                {isHi ? "जाप लक्ष्य चुनें (Choose Your Chant Goal)" : "Choose Your Chant Goal"}
              </h2>
              <p className="text-[10px] text-brand-cream/50 mt-0.5">
                {isHi ? "आप कितने मंत्रों का जाप करना चाहते हैं?" : "How many chants would you like to do?"}
              </p>
            </div>
          </div>

          {/* Goal Grid - Single row 5 columns */}
          <div className="grid grid-cols-5 gap-2 md:gap-3">
            {goalOptions.map((opt) => {
              const isSelected = targetCount === opt.count;
              return (
                <button
                  key={opt.count}
                  onClick={() => setTargetCount(opt.count)}
                  className={`relative flex flex-col justify-between py-3 px-1.5 rounded-2xl border text-center transition-all duration-300 group ${
                    isSelected
                      ? "bg-gradient-to-br from-amber-500/15 via-orange-600/5 to-black/50 border-amber-400 shadow-[0_4px_16px_rgba(245,158,11,0.2)] scale-[1.02]"
                      : "bg-black/30 border-white/5 hover:border-amber-500/20 hover:bg-black/40"
                  }`}
                >
                  <div className="mt-1 space-y-0.5">
                    <span className={`block font-display font-black text-lg md:text-xl lg:text-2xl transition-colors ${
                      isSelected ? "text-amber-400" : "text-brand-cream/90"
                    }`}>
                      {opt.count}
                    </span>
                    <span className="block text-[8px] md:text-[9px] text-brand-cream/45 uppercase font-bold tracking-wider leading-none">
                      {isHi ? opt.shortHi : opt.shortEn}
                    </span>
                  </div>

                  <div className="mt-2.5 pt-1.5 border-t border-white/5 flex flex-col items-center justify-center">
                    <span className="block text-[8px] font-bold text-amber-500/70 leading-none">
                      {isHi ? `${opt.estMin} मि.` : `~${opt.estMin}m`}
                    </span>
                    {opt.recommended && (
                      <div className="mt-1 px-1 py-0.5 rounded-full bg-amber-500/10 border border-amber-500/25 text-amber-400 text-[6px] md:text-[8px] font-black uppercase tracking-wider scale-95 leading-none">
                        {isHi ? "उत्तम" : "Rec."}
                      </div>
                    )}
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* ─── SECTION 3: CHOOSE PRACTICE MODE ─────────────────── */}
        <div className="bg-[#12090b]/85 border border-white/5 rounded-3xl p-5 shadow-xl relative backdrop-blur-md">
          <div className="flex items-center gap-3 mb-4">
            <span className="w-6 h-6 rounded-full bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-xs font-black text-amber-400 shrink-0">3</span>
            <div>
              <h2 className="font-display font-bold text-base text-amber-300">
                {isHi ? "अभ्यास मोड चुनें (Choose Practice Mode)" : "Choose Practice Mode"}
              </h2>
              <p className="text-[10px] text-brand-cream/50 mt-0.5">
                {isHi ? "आप अपने मंत्रों की गिनती किस प्रकार करना चाहते हैं?" : "How would you like to count your chants?"}
              </p>
            </div>
          </div>

          {/* Mode Options Grid - 2x2 on mobile, 4x1 on desktop */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {modeOptions.map((opt) => {
              const Icon = opt.icon;
              const isSelected = practiceMode === opt.id;
              return (
                <button
                  key={opt.id}
                  onClick={() => setPracticeMode(opt.id as any)}
                  className={`relative flex flex-col items-center p-3 rounded-2xl border text-center transition-all duration-300 group justify-between h-32 ${
                    isSelected
                      ? "bg-gradient-to-br from-amber-500/15 via-orange-600/5 to-black/50 border-amber-400 shadow-[0_4px_16px_rgba(245,158,11,0.2)] scale-[1.02]"
                      : "bg-black/30 border-white/5 hover:border-amber-500/20 hover:bg-black/40"
                  }`}
                >
                  {isSelected && (
                    <div className="absolute top-1.5 right-1.5 w-4 h-4 rounded-full bg-amber-500 flex items-center justify-center">
                      <svg className="w-2.5 h-2.5 text-black stroke-[3.5]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                  )}
                  
                  <div className={`w-11 h-11 rounded-xl flex items-center justify-center shrink-0 transition-all mx-auto mt-1 ${
                    isSelected ? "bg-amber-500/20 text-amber-400" : "bg-black/50 text-amber-500/60"
                  }`}>
                    <Icon className="w-5.5 h-5.5" />
                  </div>
                  
                  <div className="w-full">
                    <h4 className={`text-[11px] md:text-xs font-bold transition-colors block ${
                      isSelected ? "text-amber-300" : "text-brand-cream/90"
                    }`}>
                      {isHi ? opt.labelHi : opt.labelEn}
                    </h4>
                    <p className="text-[8px] text-white/35 mt-0.5 max-w-[95%] leading-normal mx-auto font-medium block">
                      {isHi ? opt.subHi : opt.subEn}
                    </p>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* ─── YOUR PRACTICE SUMMARY ──────────────────────────── */}
        <div className="bg-gradient-to-r from-[#160d11] to-[#0b0507] border border-amber-500/20 rounded-3xl p-5 shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 inset-x-0 h-[1.5px] bg-gradient-to-r from-transparent via-amber-500/40 to-transparent" />
          
          <h3 className="font-display font-bold text-xs text-amber-400/90 uppercase tracking-widest text-center mb-4 flex items-center justify-center gap-2">
            <span className="h-[1px] w-8 bg-gradient-to-r from-transparent to-amber-500/40" />
            {isHi ? "आपकी साधना का विवरण" : "Your Practice Summary"}
            <span className="h-[1px] w-8 bg-gradient-to-l from-transparent to-amber-500/40" />
          </h3>

          {/* Grid layout */}
          <div className="grid grid-cols-1 sm:grid-cols-12 gap-5 items-center">
            
            {/* Stats block (cols 1-7 on desktop) */}
            <div className="sm:col-span-8 grid grid-cols-2 md:grid-cols-4 gap-2.5">
              
              {/* 1. Sankalp */}
              <div className="flex flex-col items-center text-center p-2 rounded-2xl bg-black/45 border border-white/5 min-w-0">
                <div className="w-8 h-8 rounded-full bg-amber-500/5 flex items-center justify-center text-amber-500 mb-1 border border-amber-500/10">
                  <LotusIcon className="w-4 h-4" />
                </div>
                <span className="text-[7.5px] text-white/35 font-bold uppercase tracking-wider">
                  {isHi ? "संकल्प" : "Sankalp"}
                </span>
                <span className="text-[10px] font-bold text-amber-300 truncate w-full mt-0.5">
                  {currentSankalpText}
                </span>
              </div>

              {/* 2. Mode */}
              <div className="flex flex-col items-center text-center p-2 rounded-2xl bg-black/45 border border-white/5 min-w-0">
                <div className="w-8 h-8 rounded-full bg-amber-500/5 flex items-center justify-center text-amber-500 mb-1 border border-amber-500/10">
                  {practiceMode === "mala" && <MalaIcon className="w-4 h-4" />}
                  {practiceMode === "tap" && <TouchIcon className="w-4.5 h-4.5" />}
                  {practiceMode === "voice" && <Mic className="w-4 h-4" />}
                  {practiceMode === "guided" && <Headphones className="w-4 h-4" />}
                </div>
                <span className="text-[7.5px] text-white/35 font-bold uppercase tracking-wider">
                  {isHi ? "विधि" : "Mode"}
                </span>
                <span className="text-[10px] font-bold text-amber-300 truncate w-full mt-0.5">
                  {currentModeText}
                </span>
              </div>

              {/* 3. Goal */}
              <div className="flex flex-col items-center text-center p-2 rounded-2xl bg-black/45 border border-white/5 min-w-0">
                <div className="w-8 h-8 rounded-full bg-amber-500/5 flex items-center justify-center text-amber-400 mb-1 border border-amber-500/10 font-display font-black text-xs">
                  {targetCount}
                </div>
                <span className="text-[7.5px] text-white/35 font-bold uppercase tracking-wider">
                  {isHi ? "जाप लक्ष्य" : "Goal"}
                </span>
                <span className="text-[10px] font-bold text-amber-300 truncate w-full mt-0.5">
                  {targetCount} {isHi ? "जाप" : "Chants"}
                </span>
              </div>

              {/* 4. Est. Time */}
              <div className="flex flex-col items-center text-center p-2 rounded-2xl bg-black/45 border border-white/5 min-w-0">
                <div className="w-8 h-8 rounded-full bg-amber-500/5 flex items-center justify-center text-amber-500 mb-1 border border-amber-500/10">
                  <Clock className="w-4 h-4" />
                </div>
                <span className="text-[7.5px] text-white/35 font-bold uppercase tracking-wider">
                  {isHi ? "अवधि" : "Est. Time"}
                </span>
                <span className="text-[10px] font-bold text-amber-300 truncate w-full mt-0.5">
                  {isHi ? `~${currentEstTime} मि.` : `~${currentEstTime} mins`}
                </span>
              </div>

            </div>

            {/* Visual Image block (cols 8-12 on desktop) */}
            <div className="sm:col-span-4 relative rounded-2xl overflow-hidden border border-white/5 h-24 sm:h-28 bg-black/50 flex items-center justify-center group shrink-0">
              <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/35 to-transparent z-10" />
              <div className="absolute inset-0 bg-amber-500/[0.02] animate-pulse z-0" />
              
              <div className="relative w-full h-full flex items-center justify-center">
                {/* Mala */}
                <img
                  src="/images/mala.png"
                  alt="Jap Mala"
                  className="w-28 h-auto object-contain absolute left-[15px] bottom-[-10px] opacity-70 filter drop-shadow-[0_4px_6px_rgba(0,0,0,0.6)] rotate-[15deg] group-hover:scale-105 transition-transform duration-700"
                />
                {/* Diya */}
                <img
                  src="/images/diya-brass.png"
                  alt="Brass Diya"
                  className="w-16 h-16 object-contain absolute right-4 bottom-1.5 z-20 filter drop-shadow-[0_0_12px_rgba(245,158,11,0.35)] group-hover:scale-105 transition-transform duration-700"
                />
                {/* Flame */}
                <div className="absolute right-[2.9rem] bottom-[3.3rem] w-1.5 h-3.5 z-30 pointer-events-none">
                  <div className="w-full h-full rounded-full bg-gradient-to-t from-orange-600 via-amber-400 to-yellow-100 blur-[1px] animate-pulse scale-y-110 origin-bottom" />
                </div>
              </div>

              <div className="absolute bottom-2 left-3 z-20 flex items-center gap-1 text-[8px] font-black text-amber-400/80 tracking-widest uppercase">
                <Sparkles className="w-2.5 h-2.5 text-amber-400" />
                {isHi ? "साधना पथ" : "SADHANA PATH"}
              </div>
            </div>

          </div>
        </div>

        {/* ─── BEGIN MANTRA JAP GOLD BUTTON ────────────────────── */}
        <button
          onClick={handleBegin}
          className="w-full relative overflow-hidden group flex items-center justify-between bg-gradient-to-r from-amber-400 via-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 active:scale-98 text-black font-black text-sm md:text-base py-4 px-6 rounded-2xl shadow-[0_12px_32px_rgba(249,115,22,0.3)] border border-amber-300/35 transition-all duration-300 uppercase tracking-widest"
        >
          {/* Shine effect */}
          <div className="absolute inset-0 w-1/2 h-full bg-white/20 skew-x-[-30deg] translate-x-[-150%] group-hover:translate-x-[250%] transition-transform duration-1000 ease-out" />
          
          <div className="flex items-center gap-2">
            <LotusIcon className="w-5 h-5 text-black stroke-[2.2]" />
            <span>
              {isHi ? "मंत्र जाप प्रारंभ करें" : "Begin Mantra Jap"}
            </span>
          </div>
          
          <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
        </button>

      </div>
    </div>
  );
}
