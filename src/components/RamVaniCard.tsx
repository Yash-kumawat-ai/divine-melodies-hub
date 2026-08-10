import { useState, useEffect } from 'react';
import { Copy, Check, BookOpen } from 'lucide-react';
import { useLanguage } from '@/hooks/useLanguage';
import { supabase } from '@/lib/supabaseClient';
import { cn } from '@/lib/utils';

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

interface RamVaniCardProps {
  className?: string;
}

export function RamVaniCard({ className }: RamVaniCardProps) {
  const { language } = useLanguage();
  const isHi = language === 'hi';

  const getDailyFallbackDoha = () => {
    const dayOfYear = Math.floor((Date.now() - new Date(new Date().getFullYear(), 0, 0).getTime()) / 86400000);
    return FALLBACK_DOHAS[dayOfYear % FALLBACK_DOHAS.length];
  };

  const [currentDoha, setCurrentDoha] = useState<DohaItem>(() => {
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
        const { data } = await supabase.from('daily_dohas').select('*');
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
          localStorage.setItem('daily_doha_cache', JSON.stringify(selected));
          localStorage.setItem('daily_doha_cache_date', new Date().toDateString());
        }
      } catch {
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
    <div className={cn('w-full mt-2.5 h-full flex flex-col select-none z-10', className)}>
      {/* Fixed-width card: meaning grows downward only; actions are out of doha flow */}
      <div className="relative w-full h-full flex flex-col rounded-[20px] bg-[#FFFDF6] dark:bg-[#1E1710] border border-[#EAD7C3] dark:border-zinc-800/80 shadow-[0_6px_14px_rgba(95,72,38,0.04)] overflow-hidden isolate">
        {/* Decorative mandalas stay in the header band only (do not ride the meaning expand) */}
        <div className="pointer-events-none absolute inset-x-0 top-0 h-[120px] overflow-hidden z-0">
          <div className="absolute right-[-20px] top-[40px] w-28 h-28 md:w-32 md:h-32 select-none opacity-[0.09] dark:opacity-[0.04]">
            <img src={mandalaSvg} alt="" className="w-full h-full object-contain filter sepia saturate-[2.5] hue-rotate-[12deg] brightness-[0.93]" />
          </div>
          <div className="absolute left-[-20px] top-[40px] w-28 h-28 md:w-32 md:h-32 select-none opacity-[0.09] dark:opacity-[0.04]">
            <img src={mandalaSvg} alt="" className="w-full h-full object-contain filter sepia saturate-[2.5] hue-rotate-[12deg] brightness-[0.93] rotate-90" />
          </div>
        </div>

        <div className="relative z-10 px-3 pt-2 pb-2">
          <div className="flex items-center justify-center gap-2 mb-1.5 px-1">
            <img src={abhijitMuhuratLotus} alt="" className="w-3.5 h-3.5 object-contain opacity-80" />
            <span className="text-[#651317] dark:text-[#E6C46A] font-serif text-[13px] md:text-[14px] font-extrabold tracking-wide text-center">
              ✦ {isHi ? 'आज की राम वाणी' : "Today's Ram Vani"} ✦
            </span>
            <img src={abhijitMuhuratLotus} alt="" className="w-3.5 h-3.5 object-contain opacity-80" />
          </div>

          {/* Doha stays visually centered; action buttons sit absolutely on the right */}
          <div className="relative min-h-[112px] pr-[60px]">
            <div className="flex flex-col items-center justify-center text-center py-1 px-1 sm:px-2">
              <div className="flex flex-col items-center gap-0.5 w-full max-w-[340px] mx-auto">
                {currentDoha.doha.map((line, idx) => (
                  <p
                    key={idx}
                    className="hindi-text text-[#3A2412] dark:text-[#F3E2C8] font-bold text-center select-text leading-snug text-[15px] sm:text-[16px] md:text-[17px] break-keep"
                  >
                    {line.trim()}
                  </p>
                ))}
              </div>
              <span className="hindi-text text-[#7B6048] dark:text-stone-400 text-[11px] italic mt-1 select-text text-center">
                — {currentDoha.source.trim()}
              </span>
            </div>

            <div className="absolute top-0 right-0 flex flex-col items-center gap-1.5 w-[52px]">
              <button
                type="button"
                onClick={() => setShowMeaning((v) => !v)}
                className={cn(
                  'flex flex-col items-center justify-center w-[52px] h-[52px] rounded-[12px] border transition-all active:scale-95',
                  showMeaning
                    ? 'border-[#651317] bg-[rgba(212,164,55,0.12)] text-[#651317] shadow-sm'
                    : 'border-[#D9C6A8] bg-[#FFFDF8] dark:bg-[#1E1710]/50 dark:border-zinc-800/90 text-[#651317] hover:border-[#651317]/40',
                )}
              >
                <BookOpen className="w-4 h-4 stroke-[2]" />
                <span className="text-[8px] font-bold text-[#7B6048] dark:text-stone-300 mt-0.5 leading-none">
                  {isHi ? 'अर्थ' : 'Meaning'}
                </span>
              </button>

              <button
                type="button"
                onClick={handleCopy}
                className={cn(
                  'flex flex-col items-center justify-center w-[52px] h-[52px] rounded-[12px] border transition-all active:scale-95',
                  isCopied
                    ? 'border-green-600 bg-green-500/5 text-green-600 shadow-sm'
                    : 'border-[#D9C6A8] bg-[#FFFDF8] dark:bg-[#1E1710]/50 dark:border-zinc-800/90 text-[#651317] hover:border-[#651317]/40',
                )}
              >
                {isCopied ? (
                  <Check className="w-4 h-4 stroke-[2] text-green-600" />
                ) : (
                  <Copy className="w-4 h-4 stroke-[2]" />
                )}
                <span className="text-[8px] font-bold text-[#7B6048] dark:text-stone-300 mt-0.5 leading-none">
                  {isCopied ? (isHi ? 'कॉपी हुआ' : 'Copied') : (isHi ? 'कॉपी' : 'Copy')}
                </span>
              </button>
            </div>
          </div>

          <div
            className={cn(
              'grid transition-[grid-template-rows] duration-300 ease-out',
              showMeaning ? 'grid-rows-[1fr] mt-1.5' : 'grid-rows-[0fr] mt-0',
            )}
          >
            <div className="overflow-hidden min-h-0">
              <div className="border-t border-[#EAD7C3]/60 dark:border-zinc-800/40 pt-2 px-1 pb-0">
                <p className="hindi-text text-[13px] md:text-[14px] text-[#543D2B] dark:text-stone-300 leading-relaxed text-center select-text max-h-28 md:max-h-32 overflow-y-auto">
                  <strong className="text-[#651317] dark:text-[#E6C46A] font-serif mr-1 not-italic">
                    {isHi ? 'अर्थ:' : 'Meaning:'}
                  </strong>
                  {currentDoha.meaning.trim()}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default RamVaniCard;
