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
    <div className="w-full mt-[16px] flex flex-col select-none z-10">
      {/* Unified Card Container with Mandala Backdrop & Warm Premium Beige Tone */}
      <div 
        className="relative w-full p-3 pt-2.5 pb-2 rounded-[24px] bg-[#FFFDF6] dark:bg-[#1E1710] border border-[#EAD7C3] dark:border-zinc-800/80 shadow-[0_6px_14px_rgba(95,72,38,0.04)] flex flex-col items-center overflow-hidden"
      >
        {/* Adjusted Mandala Watermark Background at Bottom-Right Corner */}
        <div className="absolute right-[-20px] bottom-[-20px] w-32 h-32 pointer-events-none select-none z-0 overflow-hidden opacity-[0.09] dark:opacity-[0.04]">
          <img 
            src={mandalaSvg} 
            alt="Mandala decoration" 
            className="w-full h-full object-contain filter sepia saturate-[2.5] hue-rotate-[12deg] brightness-[0.93]" 
          />
        </div>
        {/* Adjusted Mandala Watermark Background at Bottom-Left Corner */}
        <div className="absolute left-[-20px] bottom-[-20px] w-32 h-32 pointer-events-none select-none z-0 overflow-hidden opacity-[0.09] dark:opacity-[0.04]">
          <img 
            src={mandalaSvg} 
            alt="Mandala decoration" 
            className="w-full h-full object-contain filter sepia saturate-[2.5] hue-rotate-[12deg] brightness-[0.93] rotate-90" 
          />
        </div>

        {/* Content wrapper with relative z-10 to stay above mandala */}
        <div className="relative z-10 w-full flex flex-col items-center">
          
          {/* Main Row: Doha & Info on the left, Vertical Divider, Buttons Card Panel on the right */}
          <div className="w-full flex flex-row items-stretch gap-2.5 mt-0.5">
            
            {/* Left Spacer to keep the Doha centered */}
            <div className="w-[54px] xs:w-[60px] shrink-0 hidden xs:block" />

            {/* Left Column: Title, Doha, and Source */}
            <div className="flex-1 flex flex-col items-center justify-center py-0.5">
              
              {/* Header Row with Lotuses flanking the title in the center */}
              <div className="w-full flex items-center justify-center gap-2 mb-1.5 px-1">
                <img 
                  src={abhijitMuhuratLotus} 
                  alt="Lotus" 
                  className="w-3.5 h-3.5 object-contain select-none pointer-events-none opacity-80" 
                />
                <span className="text-[#651317] dark:text-[#E6C46A] font-serif text-[13px] xs:text-[14px] font-extrabold tracking-wide text-center">
                  ✦ {isHi ? "आज की राम वाणी" : "Today's Ram Vani"} ✦
                </span>
                <img 
                  src={abhijitMuhuratLotus} 
                  alt="Lotus" 
                  className="w-3.5 h-3.5 object-contain select-none pointer-events-none opacity-80" 
                />
              </div>

              {/* Doha Text */}
              <div className="flex flex-col items-center justify-center gap-1.5 w-full my-0.5">
                {currentDoha.doha.map((line, idx) => (
                  <p 
                    key={idx} 
                    className="text-[#3A2412] dark:text-[#F3E2C8] font-serif font-extrabold text-center select-text leading-relaxed text-[16px] xs:text-[18px] sm:text-xl px-1 break-keep"
                  >
                    {line.trim()}
                  </p>
                ))}
              </div>

              {/* Source Author */}
              <span className="text-[#7B6048] dark:text-stone-400 font-serif text-[11px] xs:text-[11.5px] italic mt-1 select-text text-center">
                — {currentDoha.source.trim()}
              </span>

            </div>

            {/* Vertical Divider Line that separates Doha and Buttons */}
            <div className="w-[1px] bg-[#EAD7C3]/50 dark:bg-zinc-800/50 self-stretch my-1 shrink-0" />

            {/* Right Column: Premium Buttons Card Panel */}
            <div className="flex flex-col items-center justify-center gap-2 pl-0.5 pr-0.5 shrink-0 py-0.5 w-[54px] xs:w-[60px]">
              
              {/* Meaning Toggle Card Button */}
              <button
                onClick={() => setShowMeaning(!showMeaning)}
                className={`flex flex-col items-center justify-center w-[54px] h-[54px] xs:w-[60px] xs:h-[60px] rounded-[16px] border transition-all active:scale-95 ${
                  showMeaning 
                    ? 'border-[#651317] bg-[rgba(212,164,55,0.12)] text-[#651317] shadow-sm' 
                    : 'border-[#D9C6A8] bg-[#FFFDF8] dark:bg-[#1E1710]/50 dark:border-zinc-800/90 text-[#651317] hover:border-[#651317]/40 shadow-[0_2px_6px_rgba(74,14,18,0.02)]'
                }`}
              >
                <BookOpen className="w-[18px] h-[18px] xs:w-[20px] xs:h-[20px] stroke-[2]" />
                <span className="text-[8px] xs:text-[9px] font-bold text-[#7B6048] dark:text-stone-300 mt-0.5 select-none whitespace-nowrap">
                  {isHi ? "अर्थ" : "Meaning"}
                </span>
              </button>

              {/* Copy Card Button */}
              <button
                onClick={handleCopy}
                className={`flex flex-col items-center justify-center w-[54px] h-[54px] xs:w-[60px] xs:h-[60px] rounded-[16px] border transition-all active:scale-95 ${
                  isCopied 
                    ? 'border-green-600 bg-green-500/5 text-green-600 shadow-sm' 
                    : 'border-[#D9C6A8] bg-[#FFFDF8] dark:bg-[#1E1710]/50 dark:border-zinc-800/90 text-[#651317] hover:border-[#651317]/40 shadow-[0_2px_6px_rgba(74,14,18,0.02)]'
                }`}
              >
                {isCopied ? (
                  <Check className="w-[18px] h-[18px] xs:w-[20px] xs:h-[20px] stroke-[2] text-green-600" />
                ) : (
                  <Copy className="w-[18px] h-[18px] xs:w-[20px] xs:h-[20px] stroke-[2]" />
                )}
                <span className="text-[8px] xs:text-[9px] font-bold text-[#7B6048] dark:text-stone-300 mt-0.5 select-none whitespace-nowrap">
                  {isCopied ? (isHi ? "कॉपी हुआ" : "Copied!") : (isHi ? "कॉपी" : "Copy")}
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
