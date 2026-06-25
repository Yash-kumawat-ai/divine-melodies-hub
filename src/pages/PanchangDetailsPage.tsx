import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { 
  ArrowLeft, 
  CalendarDays, 
  Clock, 
  Info, 
  Sparkles, 
  CheckCircle2, 
  XCircle, 
  TriangleAlert, 
  Sun, 
  Moon, 
  MapPin, 
  ArrowRight,
  ShieldCheck,
  Star
} from "lucide-react";
import { useLanguage } from "@/hooks/useLanguage";
import { motion } from "framer-motion";
import { loadPanchang } from "@/lib/panchang/loadPanchang";
import { todayInIndia, type PanchangData } from "@/lib/panchang/types";
import { getZoneFromBrowser, ZONES } from "@/utils/panchangZone";
import { computeShubhAshubhKarya } from "@/utils/shubhKaryaEngine";
import { panchangMuhuratTiles } from "@/data/panchangTemple";
import { cn } from "@/lib/utils";

export default function PanchangDetailsPage() {
  const { language: lang } = useLanguage();
  const navigate = useNavigate();
  const [panchang, setPanchang] = useState<PanchangData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchPanchang() {
      const zone = await getZoneFromBrowser();
      const result = await loadPanchang(zone.name);
      if (result?.data) {
        setPanchang(result.data);
      }
      setLoading(false);
    }
    fetchPanchang();
  }, []);

  const parsePanchangTime = (timeStr?: string): { start: Date; end: Date } | null => {
    if (!timeStr || !timeStr.includes('-')) return null;
    const [startPart, endPart] = timeStr.split('-').map(s => s.trim());
    const parseSingle = (part: string) => {
      const match = part.match(/(\d+):(\d+)\s*(AM|PM)/i);
      if (!match) return null;
      const [_, hours, minutes, ampm] = match;
      let h = parseInt(hours);
      if (ampm.toUpperCase() === 'PM' && h < 12) h += 12;
      if (ampm.toUpperCase() === 'AM' && h === 12) h = 0;
      const d = new Date();
      d.setHours(h, parseInt(minutes), 0, 0);
      return d;
    };
    const start = parseSingle(startPart);
    const end = parseSingle(endPart);
    if (!start || !end) return null;
    return { start, end };
  };

  const checkTimeInWindow = (windowStr?: string): boolean => {
    const window = parsePanchangTime(windowStr);
    if (!window) return false;
    const now = new Date();
    return now >= window.start && now <= window.end;
  };

  const getVaraIndex = (varaStr?: string): number => {
    if (!varaStr) return new Date().getDay();
    const map: Record<string, number> = {
      'Sunday': 0, 'Ravivaar': 0, 'Somvaar': 1, 'Monday': 1,
      'Tuesday': 2, 'Mangalvaar': 2, 'Wednesday': 3, 'Budhvaar': 3,
      'Thursday': 4, 'Guruvaar': 4, 'Friday': 5, 'Shukravaar': 5,
      'Saturday': 6, 'Shanivaar': 6
    };
    return map[varaStr] ?? new Date().getDay();
  };

  const dynamicKarya = panchang ? computeShubhAshubhKarya({
    tithiNumber: panchang.tithi_number || 1,
    varaIndex: getVaraIndex(panchang.vara),
    nakshatraName: panchang.nakshatra?.split(' ')[0] || '',
    isRahuKaal: checkTimeInWindow(panchang.rahu_kaal),
    isAbhijitMuhurat: checkTimeInWindow(panchang.abhijit_muhurat || panchangMuhuratTiles.find(t => t.id === 'abhijit')?.time),
    isBrahmaKaal: checkTimeInWindow(panchang.brahma_muhurat),
  }) : null;

  const text = {
    title: lang === 'hi' ? 'आज का शुभ-अशुभ कार्य' : "Today's Shubh-Ashubh Karya",
    subtitle: lang === 'hi' ? 'पंचांग के आधार पर आज के शुभ और अशुभ कार्य तथा उनके कारण' : 'Auspicious and inauspicious tasks based on today\'s Panchang and their reasons',
    viewDetails: lang === 'hi' ? 'पंचांग विवरण देखें' : 'View Panchang Details',
    shubhKarya: lang === 'hi' ? 'शुभ कार्य (करें)' : 'Auspicious (Do)',
    ashubhKarya: lang === 'hi' ? 'अशुभ कार्य (न करें)' : 'Inauspicious (Avoid)',
    karya: lang === 'hi' ? 'कार्य' : 'Task',
    whyShubh: lang === 'hi' ? 'क्यों शुभ है?' : 'Why Auspicious?',
    whyAshubh: lang === 'hi' ? 'क्यों अशुभ है?' : 'Why Inauspicious?',
    specialNote: lang === 'hi' ? 'यह जानकारी तिथि, वार, नक्षत्र, राहु काल और अभिजित मुहूर्त के आधार पर बनाई गई है। व्यक्तिगत कुंडली के अनुसार परिणाम भिन्न हो सकते हैं।' : 'This information is based on Tithi, Vara, Nakshatra, Rahu Kaal and Abhijit Muhurat. Results may vary according to individual horoscopes.',
    specialSuggestion: lang === 'hi' ? 'विशेष सुझाव' : 'Special Suggestion',
    suggestionText: lang === 'hi' ? 'राहु काल में नए कार्य, यात्रा, सौदे, महत्वपूर्ण निर्णय और निवेश से बचें। अभिजित मुहूर्त में किए गए शुभ कार्य का फल कई गुना होता है। सर्वोत्तम परिणाम के लिए अपनी जन्म कुंडली के अनुसार मुहूर्त अवश्य मिलाएं।' : 'Avoid new tasks, travel, deals, important decisions and investments during Rahu Kaal. Auspicious tasks done in Abhijit Muhurat give manifold results. For best results, consult your birth chart.',
    tithi: lang === 'hi' ? 'तिथि' : 'Tithi',
    vara: lang === 'hi' ? 'वार' : 'Vara',
    nakshatra: lang === 'hi' ? 'नक्षत्र' : 'Nakshatra',
    rahuKaal: lang === 'hi' ? 'राहु काल' : 'Rahu Kaal',
    abhijit: lang === 'hi' ? 'अभिजित मुहूर्त' : 'Abhijit Muhurat',
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-brand-cream flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-brand-saffron"></div>
      </div>
    );
  }

  const formattedDate = panchang ? new Intl.DateTimeFormat(lang === 'hi' ? 'hi-IN' : 'en-IN', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  }).format(new Date(`${panchang.date}T00:00:00`)) : '';

  return (
    <div className="min-h-screen bg-[#FFFBF7] dark:bg-[#0a0705] text-brand-brown dark:text-brand-cream pb-12 transition-colors duration-300">
      {/* Decorative Header Area */}
      <div className="w-full bg-white dark:bg-black/20 border-b border-brand-saffron/10 pt-8 pb-12 px-4 relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-brand-saffron/30 to-transparent" />
        
        <div className="max-w-6xl mx-auto text-center relative z-10">
          <div className="flex items-center justify-center gap-4 mb-4">
            <div className="h-[1px] w-12 bg-brand-saffron/30" />
            <span className="text-brand-saffron text-2xl">ॐ</span>
            <h1 className="text-3xl md:text-5xl font-display font-bold text-brand-brown dark:text-white tracking-tight">
              {text.title}
            </h1>
            <span className="text-brand-saffron text-2xl">ॐ</span>
            <div className="h-[1px] w-12 bg-brand-saffron/30" />
          </div>
          <p className="text-brand-brown/60 dark:text-brand-cream/60 text-base md:text-lg mb-8 max-w-2xl mx-auto">
            {text.subtitle}
          </p>

          <button
            onClick={() => navigate('/panchang')}
            className="inline-flex items-center gap-2 px-6 py-2.5 rounded-full border border-brand-saffron/20 bg-brand-saffron/5 text-brand-saffron font-bold text-sm hover:bg-brand-saffron/10 transition-all"
          >
            {text.viewDetails}
            <ArrowRight className="h-4 w-4" />
          </button>
        </div>

        {/* Ornament backgrounds */}
        <div className="absolute top-4 left-4 opacity-5 pointer-events-none">
          <img src="/mandala-logo.png" alt="" className="w-48 h-48 animate-spin-slow" />
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 -mt-6">
        {/* Info Bar */}
        <div className="bg-white dark:bg-zinc-900/80 backdrop-blur-md rounded-2xl shadow-sm border border-brand-saffron/5 dark:border-white/5 p-4 flex flex-col md:flex-row items-center justify-between gap-4 mb-6">
          <div className="flex items-center gap-3 text-brand-brown/80 dark:text-brand-cream/90 font-bold text-sm">
            <CalendarDays className="h-5 w-5 text-brand-saffron" />
            <span>{formattedDate}</span>
            <span className="hidden md:block w-px h-4 bg-brand-brown/10 dark:bg-white/10 mx-2" />
            <span className="text-brand-brown/60 dark:text-brand-cream/50">{panchang?.paksha} {panchang?.tithi}, विक्रम संवत 2082</span>
          </div>
          <div className="flex items-center gap-2 text-brand-brown/60 dark:text-brand-cream/40 text-sm">
            <MapPin className="h-4 w-4 text-brand-saffron/60" />
            <span>जयपुर, राजस्थान, भारत</span>
          </div>
        </div>

        {/* 5 Main Info Cards */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-3 mb-6">
          {[
            { label: text.tithi, value: panchang?.tithi, icon: Moon, color: 'text-purple-600 dark:text-purple-400', bg: 'bg-purple-50 dark:bg-purple-900/20' },
            { label: text.vara, value: panchang?.vara, icon: Sun, color: 'text-blue-600 dark:text-blue-400', bg: 'bg-blue-50 dark:bg-blue-900/20', sub: '(मंगल देव)' },
            { label: text.nakshatra, value: panchang?.nakshatra, icon: Star, color: 'text-amber-600 dark:text-amber-400', bg: 'bg-amber-50 dark:bg-amber-900/20', sub: 'आज का नक्षत्र' },
            { label: text.rahuKaal, value: panchang?.rahu_kaal, icon: TriangleAlert, color: 'text-rose-600 dark:text-rose-400', bg: 'bg-rose-50 dark:bg-rose-900/20', sub: 'आज का राहु काल' },
            { label: text.abhijit, value: panchang?.abhijit_muhurat || '11:48 AM - 12:35 PM', icon: Sparkles, color: 'text-emerald-600 dark:text-emerald-400', bg: 'bg-emerald-50 dark:bg-emerald-900/20', sub: 'आज का अभिजित मुहूर्त' },
          ].map((card, idx) => (
            <div key={idx} className="bg-white dark:bg-zinc-900/50 rounded-2xl p-4 border border-brand-saffron/5 dark:border-white/5 shadow-sm text-center flex flex-col items-center justify-center transition-all hover:scale-[1.02]">
              <p className="text-[10px] font-bold uppercase tracking-widest text-brand-brown/40 dark:text-brand-cream/30 mb-2">{card.label}</p>
              <h3 className={cn("text-lg font-bold mb-2", card.color)}>{card.value}</h3>
              <div className={cn("w-10 h-10 rounded-full flex items-center justify-center mb-2", card.bg)}>
                <card.icon className={cn("h-5 w-5", card.color)} />
              </div>
              <p className="text-[10px] text-brand-brown/50 dark:text-brand-cream/40">{card.sub}</p>
            </div>
          ))}
        </div>

        {/* Note Bar */}
        <div className="bg-amber-50/50 dark:bg-amber-900/10 border border-amber-200/30 dark:border-amber-700/20 rounded-xl p-4 flex gap-3 items-start mb-8">
          <Info className="h-5 w-5 text-amber-500 dark:text-amber-400 shrink-0 mt-0.5" />
          <p className="text-xs md:text-sm text-amber-800/70 dark:text-amber-200/60 leading-relaxed">
            {text.specialNote}
          </p>
        </div>

        {/* Tables Section */}
        <div className="grid lg:grid-cols-2 gap-8 mb-12">
          {/* Shubh Karya Table */}
          <div className="bg-white dark:bg-zinc-900/40 rounded-[2rem] border border-emerald-100 dark:border-emerald-900/20 overflow-hidden shadow-sm">
            <div className="bg-emerald-50/50 dark:bg-emerald-900/20 px-6 py-4 border-b border-emerald-100 dark:border-emerald-900/20 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <CheckCircle2 className="h-6 w-6 text-emerald-500 dark:text-emerald-400" />
                <h2 className="text-xl font-bold text-emerald-800 dark:text-emerald-100">{text.shubhKarya}</h2>
              </div>
              <Sparkles className="h-5 w-5 text-emerald-200 dark:text-emerald-800/40" />
            </div>
            
            <div className="p-0">
              <table className="w-full table-fixed text-left">
                <thead>
                  <tr className="bg-emerald-50/20 dark:bg-emerald-900/10 text-[10px] uppercase tracking-widest text-emerald-800/40 dark:text-emerald-100/30">
                    <th className="w-[38%] px-3 py-3 font-bold sm:px-6">{text.karya}</th>
                    <th className="px-3 py-3 font-bold sm:px-6">{text.whyShubh}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-emerald-50 dark:divide-emerald-900/10">
                  {dynamicKarya?.shubhKarya.map((item, idx) => (
                    <tr key={idx} className="hover:bg-emerald-50/10 dark:hover:bg-emerald-900/5 transition-colors">
                      <td className="px-3 py-3 align-top sm:px-6 sm:py-4">
                        <div className="flex items-start gap-2 sm:items-center sm:gap-3">
                          <div className="w-7 h-7 shrink-0 rounded-lg bg-emerald-50 dark:bg-emerald-900/30 flex items-center justify-center text-emerald-600 dark:text-emerald-400 sm:w-8 sm:h-8">
                            <Sparkles className="h-4 w-4" />
                          </div>
                          <span className="font-bold text-brand-brown dark:text-brand-cream text-sm md:text-base break-words">{item.name}</span>
                        </div>
                      </td>
                      <td className="px-3 py-3 align-top sm:px-6 sm:py-4">
                        <span className="inline-block max-w-full px-2.5 py-1 rounded-full bg-emerald-100/50 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300 text-xs font-medium break-words whitespace-normal">
                          {item.reason}
                        </span>
                      </td>
                    </tr>
                  ))}
                  {/* Special Abhijit Row */}
                  <tr className="bg-emerald-50/30 dark:bg-emerald-900/10">
                    <td colSpan={2} className="px-3 py-4 sm:px-6">
                      <div className="flex items-center gap-3 text-emerald-800 dark:text-emerald-200">
                        <Sun className="h-5 w-5 text-emerald-500 dark:text-emerald-400" />
                        <p className="text-xs font-bold leading-relaxed opacity-80">
                          अभिजित मुहूर्त ({panchang?.abhijit_muhurat || '11:48 AM - 12:35 PM'}) के दौरान किए गए कार्य विशेष रूप से फलदायी होते हैं।
                        </p>
                      </div>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          {/* Ashubh Karya Table */}
          <div className="bg-white dark:bg-zinc-900/40 rounded-[2rem] border border-rose-100 dark:border-rose-900/20 overflow-hidden shadow-sm">
            <div className="bg-rose-50/50 dark:bg-rose-900/20 px-6 py-4 border-b border-rose-100 dark:border-rose-900/20 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <XCircle className="h-6 w-6 text-rose-500 dark:text-rose-400" />
                <h2 className="text-xl font-bold text-rose-800 dark:text-rose-100">{text.ashubhKarya}</h2>
              </div>
              <Sparkles className="h-5 w-5 text-rose-200 dark:text-rose-800/40" />
            </div>

            <div className="p-0">
              <table className="w-full table-fixed text-left">
                <thead>
                  <tr className="bg-rose-50/20 dark:bg-rose-900/10 text-[10px] uppercase tracking-widest text-rose-800/40 dark:text-rose-100/30">
                    <th className="w-[38%] px-3 py-3 font-bold sm:px-6">{text.karya}</th>
                    <th className="px-3 py-3 font-bold sm:px-6">{text.whyAshubh}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-rose-50 dark:divide-rose-900/10">
                  {dynamicKarya?.ashubhKarya.map((item, idx) => (
                    <tr key={idx} className="hover:bg-rose-50/10 dark:hover:bg-rose-900/5 transition-colors">
                      <td className="px-3 py-3 align-top sm:px-6 sm:py-4">
                        <div className="flex items-start gap-2 sm:items-center sm:gap-3">
                          <div className="w-7 h-7 shrink-0 rounded-lg bg-rose-50 dark:bg-rose-900/30 flex items-center justify-center text-rose-600 dark:text-rose-400 sm:w-8 sm:h-8">
                            <XCircle className="h-4 w-4" />
                          </div>
                          <span className="font-bold text-brand-brown dark:text-brand-cream text-sm md:text-base break-words">{item.name}</span>
                        </div>
                      </td>
                      <td className="px-3 py-3 align-top sm:px-6 sm:py-4">
                        <span className="inline-block max-w-full px-2.5 py-1 rounded-full bg-rose-100/50 dark:bg-rose-900/30 text-rose-700 dark:text-rose-300 text-xs font-medium break-words whitespace-normal">
                          {item.reason}
                        </span>
                      </td>
                    </tr>
                  ))}
                  {/* Special Rahu Row */}
                  <tr className="bg-rose-50/30 dark:bg-rose-900/10">
                    <td colSpan={2} className="px-3 py-4 sm:px-6">
                      <div className="flex items-center gap-3 text-rose-800 dark:text-rose-200">
                        <TriangleAlert className="h-5 w-5 text-rose-500 dark:text-rose-400" />
                        <p className="text-xs font-bold leading-relaxed opacity-80">
                          राहु काल ({panchang?.rahu_kaal}) के दौरान कोई भी महत्वपूर्ण कार्य शुरू न करें।
                        </p>
                      </div>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Special Suggestion Footer */}
        <div className="bg-white dark:bg-zinc-900/60 rounded-[2rem] border border-brand-saffron/10 dark:border-white/10 p-6 md:p-8 shadow-sm relative overflow-hidden">
          <div className="flex items-start gap-4 relative z-10">
            <div className="w-10 h-10 rounded-full bg-brand-saffron/10 dark:bg-brand-saffron/20 flex items-center justify-center shrink-0">
              <Star className="h-6 w-6 text-brand-saffron" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-brand-brown dark:text-white mb-3">{text.specialSuggestion}</h3>
              <p className="text-sm md:text-base text-brand-brown/70 dark:text-brand-cream/60 leading-relaxed">
                {text.suggestionText}
              </p>
            </div>
          </div>
          
          {/* Background decoration */}
          <div className="absolute bottom-[-20%] right-[-5%] opacity-[0.03] dark:opacity-[0.01] pointer-events-none">
            <img src="/mandala-logo.png" alt="" className="w-64 h-64" />
          </div>
        </div>
      </div>
    </div>
  );
}
