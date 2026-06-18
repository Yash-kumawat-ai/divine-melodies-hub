import React from "react";
import { Image, ArrowLeft, Sparkles } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useLanguage } from "@/hooks/useLanguage";

export default function WallpaperPage() {
  const navigate = useNavigate();
  const { language } = useLanguage();
  const isHi = language === "hi";

  const t = {
    title: isHi ? "दिव्य वॉलपेपर्स" : "Divine Wallpapers",
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
    <div className="min-h-screen bg-background py-12 px-4">
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
        <div className="text-center space-y-3">
          <div className="mx-auto w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center">
            <Image className="w-8 h-8 text-primary" />
          </div>
          <h1 className="font-display text-3xl md:text-5xl font-bold tracking-tight text-foreground">
            {t.title}
          </h1>
          <p className="text-sm md:text-base text-muted-foreground max-w-md mx-auto leading-relaxed">
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
