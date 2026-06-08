import React from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Landmark, Music2, Sparkles } from "lucide-react";
import { useLanguage } from "@/hooks/useLanguage";
import { motion } from "framer-motion";

export default function AartiPage() {
  const { language: lang } = useLanguage();
  const navigate = useNavigate();

  const text = {
    title: lang === 'hi' ? 'आरती संग्रह' : 'Aarti Collection',
    back: lang === 'hi' ? 'पीछे जाएं' : 'Go Back',
    comingSoon: lang === 'hi' ? 'आरती संग्रह जल्द ही आ रहा है...' : 'Aarti collection coming soon...',
    subtitle: lang === 'hi' ? 'देवताओं की दिव्य आरतियां' : 'Divine Aartis of Deities'
  };

  return (
    <div className="min-h-screen bg-[#0a0705] text-amber-50 p-4 md:p-8">
      <div className="max-w-4xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex items-center justify-between gap-4">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 transition-colors"
          >
            <ArrowLeft className="h-5 w-5" />
            <span>{text.back}</span>
          </button>
        </div>

        <div className="space-y-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center gap-4"
          >
            <div className="p-3 rounded-2xl bg-orange-500/10 border border-orange-500/20 text-orange-400">
              <Sparkles className="h-8 w-8" />
            </div>
            <div>
              <h1 className="text-3xl font-display font-bold">{text.title}</h1>
              <p className="text-amber-200/60">{text.subtitle}</p>
            </div>
          </motion.div>

          {/* Placeholder Content */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="mt-12 flex flex-col items-center justify-center p-12 rounded-[2.5rem] border border-white/5 bg-white/[0.02] backdrop-blur-xl"
          >
            <div className="p-6 rounded-full bg-orange-500/5 mb-6">
              <Landmark className="h-12 w-12 text-orange-500/40" />
            </div>
            <p className="text-xl font-medium text-amber-100/40">{text.comingSoon}</p>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
