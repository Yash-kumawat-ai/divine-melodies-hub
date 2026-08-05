import React from "react";
import { ArrowLeft, Sparkles } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useLanguage } from "@/hooks/useLanguage";
import meditationSvg from "./images/meditation svg.svg";

export default function WallpaperPage() {
  const navigate = useNavigate();
  const { language } = useLanguage();
  const isHi = language === "hi";

  const t = {
    title: isHi ? "आध्यात्मिक वॉलपेपर" : "Adhyatmic Wallpaper",
    subtitle: isHi 
      ? "अपने मोबाइल और डेस्कटॉप के लिए सुंदर आध्यात्मिक वॉलपेपर डाउनलोड करें" 
      : "Download beautiful spiritual wallpapers for your phone and desktop",
    comingSoon: isHi ? "जल्द ही आ रहा है" : "Coming Soon",
    message: isHi
      ? "हम आपके लिए उच्च-गुणवत्ता वाले दिव्य वॉलपेपर्स का एक संग्रह तैयार कर रहे हैं। कृपया जुड़े रहें!"
      : "We are curating a collection of high-resolution, premium devotional wallpapers. Stay tuned!",
    back: isHi ? "पीछे जाएं" : "Go Back",
  };

  return (
    <div className="min-h-screen bg-background py-12 px-4 select-none">
      <div className="container mx-auto max-w-4xl space-y-8">
        {/* Back Button */}
        <div>
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-card border border-border hover:bg-muted/50 transition-colors text-sm font-medium"
          >
            <ArrowLeft className="h-4 w-4 text-primary" />
            <span>{t.back}</span>
          </button>
        </div>

        {/* Header */}
        <div className="text-center space-y-2 flex flex-col items-center">
          <div className="w-12 h-12 rounded-full bg-card border border-amber-500/30 p-2 flex items-center justify-center shadow-sm">
            <img src={meditationSvg} alt="Meditation" className="w-7 h-7 object-contain" />
          </div>
          <h1 className="font-serif text-3xl md:text-5xl font-black tracking-tight text-foreground text-center">
            {t.title}
          </h1>
          <p className="text-sm md:text-base text-muted-foreground max-w-md mx-auto text-center leading-relaxed font-medium">
            {t.subtitle}
          </p>
        </div>

        {/* Premium Blank Placeholder Area */}
        <div className="relative overflow-hidden rounded-3xl border border-primary/15 bg-gradient-to-br from-amber-50/50 via-card to-orange-50/30 p-8 md:p-16 text-center shadow-temple max-w-xl mx-auto dark:from-amber-950/10 dark:via-card dark:to-orange-950/10">
          <div className="absolute -right-12 -bottom-12 h-40 w-40 bg-primary/5 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute -left-12 -top-12 h-40 w-40 bg-secondary/5 rounded-full blur-3xl pointer-events-none" />
          
          <div className="space-y-4 relative z-10">
            <div className="inline-flex items-center gap-1.5 rounded-full bg-primary/15 px-3 py-1 text-xs font-semibold text-primary">
              <Sparkles className="w-3.5 h-3.5 animate-pulse" />
              <span>{t.comingSoon}</span>
            </div>
            <p className="text-sm md:text-base text-muted-foreground leading-relaxed">
              {t.message}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
