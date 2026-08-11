import { useState, useEffect } from 'react';
import { BookOpen, Copy, Check } from 'lucide-react';
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
    source: "रामचरितमानस / लोकप्रिय",
    doha: ["राम नाम की लूट है, लूट सके तो लूट ।", "अंत काल पछताएगा, जब प्राण जाएंगे छूट ॥"],
    meaning: "श्रीराम का नाम सबसे अमूल्य धन है, जिसे हर व्यक्ति निष्काम भाव से प्राप्त कर सकता है। जीवन में हरि स्मरण ही परम सत्य है।",
    category: "भक्ति",
  },
  {
    id: 2,
    title: "गोस्वामी तुलसीदास",
    source: "रामचरितमानस",
    doha: ["श्रीगुरु चरण सरोज रज, निज मन मुकुर सुधारि ।", "बरनउँ रघुबर बिमल जसु, जो दायक फल चारि ॥"],
    meaning: "गुरु के चरणों की धूल से अपने मन रूपी दर्पण को निर्मल करके, भगवान श्रीराम के पवित्र यश का वर्णन करते हैं।",
    category: "भक्ति",
  },
  {
    id: 3,
    title: "राम भक्ति",
    source: "रामचरितमानस",
    doha: ["सियाराममय सब जग जानी ।", "करउँ प्रणाम जोरि जुग पानी ॥"],
    meaning: "सम्पूर्ण संसार में सीताराम का ही दिव्य स्वरूप निहित है। समस्त सृष्टि को आदरपूर्वक प्रणाम करते हैं।",
    category: "भक्ति",
  }
];

interface RamVaniCardProps {
  className?: string;
}

/** Desktop Ram Vani — styled to match FeatureConceptCard height and bottom CTA layout cleanly. */
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

  const [showMeaning, setShowMeaning] = useState(false);
  const [isCopied, setIsCopied] = useState(false);

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
        setCurrentDoha(getDailyFallbackDoha());
      }
    }
    fetchDoha();
  }, []);

  const handleCopy = (e: React.MouseEvent) => {
    e.stopPropagation();
    const textToCopy = `${currentDoha.doha.map(line => line.trim()).join('\n')}\n— ${currentDoha.source.trim()}`;
    navigator.clipboard.writeText(textToCopy).then(() => {
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2000);
    });
  };

  return (
    <div className={cn('w-full h-full flex flex-col select-none z-10', className)}>
      <div className="relative flex-1 flex flex-col rounded-[20px] bg-[#FFFDF6] dark:bg-[#1E1710] border border-[#EAD7C3] dark:border-zinc-800/80 shadow-[0_6px_14px_rgba(95,72,38,0.04)] overflow-hidden">
        {/* Full corner mandalas */}
        <img
          src={mandalaSvg}
          alt=""
          aria-hidden="true"
          className="pointer-events-none absolute left-2 top-8 w-16 h-16 object-contain opacity-[0.12] dark:opacity-[0.06] z-0 filter sepia saturate-[2.5] hue-rotate-[12deg] brightness-[0.93]"
        />
        <img
          src={mandalaSvg}
          alt=""
          aria-hidden="true"
          className="pointer-events-none absolute right-2 top-8 w-16 h-16 object-contain opacity-[0.12] dark:opacity-[0.06] z-0 rotate-90 filter sepia saturate-[2.5] hue-rotate-[12deg] brightness-[0.93]"
        />

        <div className="relative z-10 flex flex-col flex-1 px-3.5 pt-2.5 pb-3">
          {/* Header */}
          <div className="flex items-center justify-center gap-2 mb-2 px-1 relative">
            <img src={abhijitMuhuratLotus} alt="" className="w-3.5 h-3.5 object-contain opacity-80 shrink-0" />
            <span className="text-[#651317] dark:text-[#E6C46A] font-serif text-[13px] md:text-[14px] font-extrabold tracking-wide text-center leading-none">
              ✦ {isHi ? 'आज की राम वाणी' : "Today's Ram Vani"} ✦
            </span>
            <img src={abhijitMuhuratLotus} alt="" className="w-3.5 h-3.5 object-contain opacity-80 shrink-0" />

            {/* Copy Icon Button at top right */}
            <button
              type="button"
              onClick={handleCopy}
              title={isHi ? "कॉपी करें" : "Copy"}
              className="absolute right-0 top-1/2 -translate-y-1/2 p-1 rounded-lg text-[#7B6048] hover:text-[#651317] dark:text-stone-400 dark:hover:text-[#E6C46A] hover:bg-[#EAD7C3]/30 transition-colors"
            >
              {isCopied ? <Check className="w-3.5 h-3.5 text-green-600" /> : <Copy className="w-3.5 h-3.5" />}
            </button>
          </div>

          {/* Middle Row Content */}
          <div className="flex items-center gap-3 flex-1 min-h-[112px]">
            {!showMeaning ? (
              <div className="flex-1 min-w-0 flex flex-col items-center justify-center text-center px-1 py-1">
                <div className="flex flex-col items-center gap-1 w-full">
                  {currentDoha.doha.map((line, idx) => (
                    <p
                      key={idx}
                      className="hindi-text text-[#3A2412] dark:text-[#F3E2C8] font-extrabold text-center leading-snug text-[14px] sm:text-[15px] break-keep"
                    >
                      {line.trim()}
                    </p>
                  ))}
                </div>
                <div className="flex items-center justify-center gap-2 mt-1.5">
                  <span className="hindi-text text-[#7B6048] dark:text-stone-400 text-[11px] italic">
                    — {currentDoha.source.trim()}
                  </span>
                  <span className="inline-flex items-center rounded-full px-2 py-0.5 text-[9.5px] font-bold text-[#651317] dark:text-[#E6C46A] bg-[rgba(101,19,23,0.08)] dark:bg-[rgba(230,196,106,0.12)]">
                    {isHi ? "रामवाणी" : "Ram Vani"}
                  </span>
                </div>
              </div>
            ) : (
              <div className="flex-1 min-w-0 flex flex-col items-center justify-center text-center p-2.5 rounded-xl bg-[#FFF8EF] dark:bg-[#24190F]/80 border border-[#EAD7C3]/60 dark:border-zinc-800/80">
                <p className="hindi-text text-[12.5px] sm:text-[13px] text-[#543D2B] dark:text-stone-300 leading-relaxed text-center select-text w-full">
                  <strong className="text-[#651317] dark:text-[#E6C46A] font-serif mr-1 not-italic">
                    {isHi ? 'अर्थ:' : 'Meaning:'}
                  </strong>
                  {currentDoha.meaning.trim()}
                </p>
              </div>
            )}
          </div>

          {/* Bottom Full-width CTA Button matching FeatureConceptCard */}
          <button
            type="button"
            onClick={() => setShowMeaning(!showMeaning)}
            className="btn-royal-secondary mt-2.5 w-full h-10 rounded-xl !px-3 text-[12px] sm:text-sm font-semibold gap-1.5 !bg-[#FFFDF8] hover:!bg-[#FFF8EF] dark:!bg-[#24190F]"
          >
            <BookOpen className="!w-3.5 !h-3.5 shrink-0 text-[#651317] dark:text-[#E6C46A]" />
            <span className="truncate">
              {showMeaning
                ? (isHi ? 'दोहा देखें' : 'View Doha')
                : (isHi ? 'अर्थ देखें' : 'View Meaning')}
            </span>
          </button>
        </div>
      </div>
    </div>
  );
}

export default RamVaniCard;


