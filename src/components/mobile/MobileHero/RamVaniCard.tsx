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
  const [currentDoha, setCurrentDoha] = useState<DohaItem>(FALLBACK_DOHAS[0]);
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
            title: item.title || '',
            source: item.source || '',
            doha: Array.isArray(item.doha) ? item.doha : [String(item.doha)],
            meaning: item.meaning || '',
            category: item.category || ''
          }));
          const dayOfYear = Math.floor((Date.now() - new Date(new Date().getFullYear(), 0, 0).getTime()) / 86400000);
          setCurrentDoha(formatted[dayOfYear % formatted.length]);
        }
      } catch (err) {
        const dayOfYear = Math.floor((Date.now() - new Date(new Date().getFullYear(), 0, 0).getTime()) / 86400000);
        setCurrentDoha(FALLBACK_DOHAS[dayOfYear % FALLBACK_DOHAS.length]);
      }
    }
    fetchDoha();
  }, []);

  const handleCopy = () => {
    const textToCopy = `${currentDoha.doha.join('\n')}\n— ${currentDoha.source}`;
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
        {/* Adjusted Mandala Watermark Background for Maximum Premium Contrast */}
        <div className="absolute right-[-12px] bottom-[-12px] w-36 h-36 pointer-events-none select-none z-0 overflow-hidden opacity-[0.11] dark:opacity-[0.05]">
          <img 
            src={mandalaSvg} 
            alt="Mandala decoration" 
            className="w-full h-full object-contain filter sepia saturate-[2.5] hue-rotate-[12deg] brightness-[0.93]" 
          />
        </div>

        {/* Content wrapper with relative z-10 to stay above mandala */}
        <div className="relative z-10 w-full flex flex-col items-center">
          
          {/* Header Row with Lotuses flanking the title in the center */}
          <div className="w-full flex items-center justify-center gap-3.5 mb-2 px-2">
            <img 
              src={abhijitMuhuratLotus} 
              alt="Lotus" 
              className="w-5 h-5 object-contain select-none pointer-events-none" 
            />
            <span className="text-[#E06D14] font-serif text-[15.5px] xs:text-[17px] font-extrabold tracking-wide">
              ✦ {isHi ? "आज की राम वाणी" : "Today's Ram Vani"} ✦
            </span>
            <img 
              src={abhijitMuhuratLotus} 
              alt="Lotus" 
              className="w-5 h-5 object-contain select-none pointer-events-none" 
            />
          </div>

          {/* Quote Lines (Doha) */}
          <div className="flex flex-col items-center justify-center gap-1.5 w-full my-1">
            {currentDoha.doha.map((line, idx) => (
              <p 
                key={idx} 
                className="text-[#3A2412] dark:text-[#F3E2C8] font-serif font-bold text-center select-text leading-relaxed text-[15px] xs:text-[16.5px] sm:text-base"
              >
                {line}
              </p>
            ))}
          </div>

          {/* Source Author */}
          <span className="text-amber-700/85 dark:text-amber-500/80 font-serif text-xs xs:text-[13px] italic mt-1.5 select-text">
            — {currentDoha.source}
          </span>

          {/* Action Buttons Row at the bottom */}
          <div className="flex flex-row justify-center gap-12 mt-3 w-full">
            
            {/* Meaning Toggle Button */}
            <button
              onClick={() => setShowMeaning(!showMeaning)}
              className="flex flex-col items-center group active:scale-95 transition-transform"
            >
              <div className={`w-[38px] h-[38px] rounded-full flex items-center justify-center border transition-all ${
                showMeaning 
                  ? 'border-[#E06D14] bg-[#E06D14]/10 text-[#E06D14]' 
                  : 'border-[#F3DFCD] bg-[#FFF5EA] dark:bg-[#1E1710]/40 text-[#E06D14] hover:border-[#E06D14]'
              }`}>
                <BookOpen className="w-4.5 h-4.5" />
              </div>
              <span className="text-[9.5px] font-bold text-[#543D2B] dark:text-stone-300 mt-1 select-text">
                {isHi ? "अर्थ देखें" : "View Meaning"}
              </span>
            </button>

            {/* Copy Button */}
            <button
              onClick={handleCopy}
              className="flex flex-col items-center group active:scale-95 transition-transform"
            >
              <div className={`w-[38px] h-[38px] rounded-full flex items-center justify-center border transition-all ${
                isCopied 
                  ? 'border-green-500 bg-green-500/10 text-green-500' 
                  : 'border-[#F3DFCD] bg-[#FFF5EA] dark:bg-[#1E1710]/40 text-[#E06D14] hover:border-[#E06D14]'
              }`}>
                {isCopied ? <Check className="w-4.5 h-4.5" /> : <Copy className="w-4.5 h-4.5" />}
              </div>
              <span className="text-[9.5px] font-bold text-[#543D2B] dark:text-stone-300 mt-1 select-text">
                {isCopied ? (isHi ? "कॉपी हुआ" : "Copied!") : (isHi ? "कॉपी करें" : "Copy")}
              </span>
            </button>
            
          </div>
        </div>

        {/* Expandable Meaning details inside the card */}
        <AnimatePresence>
          {showMeaning && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.18, ease: "easeOut" }}
              className="overflow-hidden w-full mt-3 border-t border-[#EAD7C3]/50 dark:border-zinc-800/40 pt-3 relative z-10"
            >
              <p className="text-[13px] xs:text-[14px] text-[#543D2B] dark:text-stone-300 leading-relaxed text-center select-text px-1">
                <strong className="text-[#E06D14] font-serif mr-1">{isHi ? "अर्थ:" : "Meaning:"}</strong>
                {currentDoha.meaning}
              </p>
            </motion.div>
          )}
        </AnimatePresence>

      </div>
    </div>
  );
}
