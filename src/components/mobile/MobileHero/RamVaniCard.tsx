import { useState, useEffect } from 'react';
import { Copy, Check, BookOpen } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useLanguage } from '@/hooks/useLanguage';
import { supabase } from '@/lib/supabaseClient';

import abhijitMuhuratLotus from '@/pages/images/abhijit muhrat.webp';
import mandalaSvg from '@/pages/images/mandala.svg';

interface DohaItem {
  id: number;
  title: string;
  source: string;
  doha: string[];
  meaning: string;
  category: string;
}

const FALLBACK_DOHAS: DohaItem[] = [
  {
    id: 1,
    title: "राम नाम की लूट है",
    source: "लोकप्रिय",
    doha: ["राम नाम की लूट है, लूट सके तो लूट ।", "अंत काल पछताएगा, जब प्राण जाएंगे छूट ॥"],
    meaning: "श्रीराम का नाम सबसे अमूल्य धन है, जिसे हर व्यक्ति बिना किसी मूल्य के प्राप्त कर सकता है। जीवन रहते हुए भगवान का स्मरण कर लेना चाहिए, क्योंकि मृत्यु के समय पश्चाताप करने का अवसर नहीं मिलता।",
    category: "भक्ति",
  },
  {
    id: 2,
    title: "गोस्वामी तुलसीदास",
    source: "रामचरितमानस",
    doha: ["श्रीगुरु चरण सरोज रज, निज मन मुकुर सुधारि ।", "बरनउँ रघुबर बिमल जसु, जो दायक फल चारि ॥"],
    meaning: "गुरु के चरणों की धूल से अपने मन रूपी दर्पण को निर्मल करके, मैं भगवान श्रीराम के पवित्र यश का वर्णन करता हूँ, जो धर्म, अर्थ, काम और मोक्ष—इन चारों पुरुषार्थों की प्राप्ति कराते हैं।",
    category: "भक्ति",
  },
  {
    id: 3,
    title: "राम भक्ति",
    source: "रामचरितमानस",
    doha: ["सियाराममय सब जग जानी ।", "करउँ प्रणाम जोरि जुग पानी ॥"],
    meaning: "मैं सम्पूर्ण संसार में सीताराम का ही स्वरूप देखता हूँ। इसलिए मैं सभी प्राणियों और समस्त सृष्टि को आदरपूर्वक प्रणाम करता हूँ।",
    category: "भक्ति",
  }
];

export function RamVaniCard() {
  const { language } = useLanguage();
  const isHi = language === 'hi';
  
  // Calculate daily fallback doha helper to prevent loading flashes
  const getDailyFallbackDoha = () => {
    const dayOfYear = Math.floor((Date.now() - new Date(new Date().getFullYear(), 0, 0).getTime()) / 86400000);
    return FALLBACK_DOHAS[dayOfYear % FALLBACK_DOHAS.length];
  };

  const [currentDoha, setCurrentDoha] = useState<DohaItem>(() => {
    // Try to read from localStorage daily cache to prevent flashes on reload
    try {
      const cached = localStorage.getItem('daily_doha_cache');
      const cacheDate = localStorage.getItem('daily_doha_cache_date');
      const todayStr = new Date().toDateString();
      if (cached && cacheDate === todayStr) {
        return JSON.parse(cached);
      }
    } catch (e) {
      console.warn("Failed to load cached doha", e);
    }
    return getDailyFallbackDoha();
  });
  
  const [isCopied, setIsCopied] = useState(false);
  const [showMeaning, setShowMeaning] = useState(false);

  useEffect(() => {
    async function fetchDoha() {
      try {
        const { data } = await supabase
          .from('daily_dohas')
          .select('*');
        if (data && data.length > 0) {
          const formatted: DohaItem[] = data.map((item: any) => ({
            id: Number(item.id),
            title: (item.title || '').trim(),
            source: (item.source || '').trim(),
            doha: Array.isArray(item.doha) 
              ? item.doha.map((line: string) => line.trim()) 
              : [String(item.doha).trim()],
            meaning: (item.meaning || '').trim(),
            category: (item.category || '').trim()
          }));
          const dayOfYear = Math.floor((Date.now() - new Date(new Date().getFullYear(), 0, 0).getTime()) / 86400000);
          const selected = formatted[dayOfYear % formatted.length];
          setCurrentDoha(selected);
          
          // Cache it for today to prevent page refresh flashes
          localStorage.setItem('daily_doha_cache', JSON.stringify(selected));
          localStorage.setItem('daily_doha_cache_date', new Date().toDateString());
        }
      } catch (err) {
        const dayOfYear = Math.floor((Date.now() - new Date(new Date().getFullYear(), 0, 0).getTime()) / 86400000);
        setCurrentDoha(FALLBACK_DOHAS[dayOfYear % FALLBACK_DOHAS.length]);
      }
    }
    fetchDoha();
  }, []);

  const handleCopy = () => {
    const textToCopy = `${currentDoha.doha.map(line => line.trim()).join('\n')}\n— ${currentDoha.source.trim()}`;
    navigator.clipboard.writeText(textToCopy).then(() => {
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2000);
    });
  };

  return (
    <div className="w-full mt-[20px] flex flex-col select-none z-10">
      {/* Unified Card Container with Mandala Backdrop & Warm Premium Beige Tone */}
      <div 
        className="relative w-full p-4 pt-3.5 pb-3 rounded-[24px] bg-[#FFFDF6] dark:bg-[#1E1710] border border-[#EAD7C3] dark:border-zinc-800/80 shadow-[0_12px_30px_rgba(95,72,38,0.06)] flex flex-col items-center overflow-hidden"
      >
        {/* Adjusted Mandala Watermark Background at Bottom-Right Corner */}
        <div className="absolute right-[-16px] bottom-[-16px] w-36 h-36 pointer-events-none select-none z-0 overflow-hidden opacity-[0.12] dark:opacity-[0.05]">
          <img 
            src={mandalaSvg} 
            alt="Mandala decoration" 
            className="w-full h-full object-contain filter sepia saturate-[2.5] hue-rotate-[12deg] brightness-[0.93]" 
          />
        </div>
        {/* Adjusted Mandala Watermark Background at Bottom-Left Corner */}
        <div className="absolute left-[-16px] bottom-[-16px] w-36 h-36 pointer-events-none select-none z-0 overflow-hidden opacity-[0.12] dark:opacity-[0.05]">
          <img 
            src={mandalaSvg} 
            alt="Mandala decoration" 
            className="w-full h-full object-contain filter sepia saturate-[2.5] hue-rotate-[12deg] brightness-[0.93] rotate-90" 
          />
        </div>

        {/* Content wrapper with relative z-10 to stay above mandala */}
        <div className="relative z-10 w-full flex flex-col items-center">
          
          {/* Main Row: Doha & Info on the left, Vertical Divider, Buttons Card Panel on the right */}
          <div className="w-full flex flex-row items-stretch gap-3 mt-0.5 min-h-[110px]">
            
            {/* Left Spacer to keep the Doha centered */}
            <div className="w-[66px] xs:w-[76px] shrink-0 hidden xs:block" />

            {/* Left Column: Title, Doha, and Source */}
            <div className="flex-1 flex flex-col items-center justify-center py-1">
              
              {/* Header Row with Lotuses flanking the title in the center */}
              <div className="w-full flex items-center justify-center gap-3 mb-2 px-2">
                <img 
                  src={abhijitMuhuratLotus} 
                  alt="Lotus" 
                  className="w-4 h-4 xs:w-4.5 xs:h-4.5 object-contain select-none pointer-events-none opacity-80" 
                />
                <span className="text-[#E06D14] font-serif text-[14px] xs:text-[16px] font-extrabold tracking-wide text-center">
                  ✦ {isHi ? "आज की राम वाणी" : "Today's Ram Vani"} ✦
                </span>
                <img 
                  src={abhijitMuhuratLotus} 
                  alt="Lotus" 
                  className="w-4 h-4 xs:w-4.5 xs:h-4.5 object-contain select-none pointer-events-none opacity-80" 
                />
              </div>

              {/* Doha Text */}
              <div className="flex flex-col items-center justify-center gap-1.5 w-full my-1">
                {currentDoha.doha.map((line, idx) => (
                  <p 
                    key={idx} 
                    className="text-[#3A2412] dark:text-[#F3E2C8] font-serif font-bold text-center select-text leading-relaxed text-[13px] xs:text-[15px] sm:text-base px-2 break-keep"
                  >
                    {line.trim()}
                  </p>
                ))}
              </div>

              {/* Source Author */}
              <span className="text-amber-700/85 dark:text-amber-500/80 font-serif text-[11px] xs:text-[12px] italic mt-1.5 select-text text-center">
                — {currentDoha.source.trim()}
              </span>

            </div>

            {/* Vertical Divider Line that separates Doha and Buttons */}
            <div className="w-[1px] bg-[#EAD7C3]/65 dark:bg-zinc-800/65 self-stretch my-2 shrink-0" />

            {/* Right Column: Premium Buttons Card Panel */}
            <div className="flex flex-col items-center justify-center gap-2.5 pl-1 pr-0.5 shrink-0 py-1 w-[66px] xs:w-[76px]">
              
              {/* Meaning Toggle Card Button */}
              <button
                onClick={() => setShowMeaning(!showMeaning)}
                className={`flex flex-col items-center justify-center w-[66px] h-[66px] xs:w-[76px] xs:h-[76px] rounded-2xl border transition-all active:scale-95 ${
                  showMeaning 
                    ? 'border-[#E06D14] bg-[#E06D14]/5 dark:bg-[#E06D14]/15 text-[#E06D14] shadow-sm' 
                    : 'border-[#F3DFCD] bg-[#FFFDFC]/90 dark:bg-[#1E1710]/50 dark:border-zinc-800/90 text-[#E06D14] hover:border-[#E06D14]/40 shadow-[0_2px_8px_rgba(95,72,38,0.03)]'
                }`}
              >
                <BookOpen className="w-[20px] h-[20px] xs:w-[24px] xs:h-[24px] stroke-[1.75]" />
                <span className="text-[8.5px] xs:text-[9.5px] font-bold text-[#543D2B] dark:text-stone-300 mt-1 select-none whitespace-nowrap">
                  {isHi ? "अर्थ देखें" : "View Meaning"}
                </span>
              </button>

              {/* Copy Card Button */}
              <button
                onClick={handleCopy}
                className={`flex flex-col items-center justify-center w-[66px] h-[66px] xs:w-[76px] xs:h-[76px] rounded-2xl border transition-all active:scale-95 ${
                  isCopied 
                    ? 'border-green-500 bg-green-500/5 dark:bg-green-500/15 text-green-600 dark:text-green-400 shadow-sm' 
                    : 'border-[#F3DFCD] bg-[#FFFDFC]/90 dark:bg-[#1E1710]/50 dark:border-zinc-800/90 text-[#E06D14] hover:border-[#E06D14]/40 shadow-[0_2px_8px_rgba(95,72,38,0.03)]'
                }`}
              >
                {isCopied ? (
                  <Check className="w-[20px] h-[20px] xs:w-[24px] xs:h-[24px] stroke-[1.75] text-green-600 dark:text-green-400" />
                ) : (
                  <Copy className="w-[20px] h-[20px] xs:w-[24px] xs:h-[24px] stroke-[1.75]" />
                )}
                <span className="text-[8.5px] xs:text-[9.5px] font-bold text-[#543D2B] dark:text-stone-300 mt-1 select-none whitespace-nowrap">
                  {isCopied ? (isHi ? "कॉपी हुआ" : "Copied!") : (isHi ? "कॉपी करें" : "Copy")}
                </span>
              </button>

            </div>

          </div>
        </div>

        {/* Meaning details panel (Conditionally rendered to collapse card space when hidden) */}
        {showMeaning && (
          <div
            className="w-full mt-3 border-t border-[#EAD7C3]/50 dark:border-zinc-800/40 pt-3 relative z-10 animate-fadeIn"
          >
            <p className="text-[13px] xs:text-[14px] text-[#543D2B] dark:text-stone-300 leading-relaxed text-center select-text px-1">
              <strong className="text-[#E06D14] font-serif mr-1">{isHi ? "अर्थ:" : "Meaning:"}</strong>
              {currentDoha.meaning.trim()}
            </p>
          </div>
        )}

      </div>
    </div>
  );
}
