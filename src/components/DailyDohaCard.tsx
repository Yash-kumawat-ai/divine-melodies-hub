import { useState, useEffect } from 'react';
import { Heart, Copy, RotateCw, Check, BookOpen } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { supabase } from '@/lib/supabaseClient';
import { useLanguage } from '@/hooks/useLanguage';
import abhijitMuhuratLotus from '@/pages/images/abhijit muhrat.webp';
import hanumanBg from '@/pages/images/hanuman_hd (2).webp';

interface DohaItem {
  id: number;
  title: string;
  source: string;
  doha: string[];
  meaning: string;
  category: string;
  likes: number;
}

const FALLBACK_DOHAS: DohaItem[] = [
  {
    id: 1,
    title: "राम नाम की लूट है",
    source: "लोकप्रिय",
    doha: ["राम नाम की लूट है, लूट सके तो लूट।", "... जब प्राण जाएंगे छूट॥"],
    meaning: "श्रीराम का नाम सबसे अमूल्य धन है, जिसे हर व्यक्ति बिना किसी मूल्य के प्राप्त कर सकता है। जीवन रहते हुए भगवान का स्मरण कर लेना चाहिए, क्योंकि मृत्यु के समय पश्चाताप करने का अवसर नहीं मिलता।",
    category: "भक्ति",
    likes: 124
  },
  {
    id: 2,
    title: "गोस्वामी तुलसीदास",
    source: "रामचरितमानस",
    doha: ["श्रीगुरु चरण सरोज रज, निज मन मुकुर सुधारि।", "बरनउँ रघुबर बिमल जसु, जो दायक फल चारि॥"],
    meaning: "गुरु के चरणों की धूल से अपने मन रूपी दर्पण को निर्मल करके, मैं भगवान श्रीराम के पवित्र यश का वर्णन करता हूँ, जो धर्म, अर्थ, काम और मोक्ष—इन चारों पुरुषार्थों की प्राप्ति कराते हैं।",
    category: "भक्ति",
    likes: 98
  },
  {
    id: 3,
    title: "राम भक्ति",
    source: "रामचरितमानस",
    doha: ["सियाराममय सब जग जानी।", "करउँ प्रणाम जोरि जुग पानी॥"],
    meaning: "मैं सम्पूर्ण संसार में सीताराम का ही स्वरूप देखता हूँ। इसलिए मैं सभी प्राणियों और समस्त सृष्टि को आदरपूर्वक प्रणाम करता हूँ।",
    category: "भक्ति",
    likes: 156
  },
  {
    id: 4,
    title: "सुंदर एवं शांतिदायक",
    source: "रामचरितमानस",
    doha: ["रामहि केवल प्रेम पियारा।", "जानि लेहु जो जाननिहारा॥"],
    meaning: "भगवान श्रीराम को केवल सच्चा प्रेम और निष्कपट भक्ति ही प्रिय है। धन, पद या बाहरी आडंबर से अधिक उनका हृदय प्रेम से प्रसन्न होता है।",
    category: "भक्ति",
    likes: 87
  },
  {
    id: 5,
    title: "दैनिक प्रेरणा",
    source: "रामचरितमानस",
    doha: ["परहित सरिस धरम नहि भाई।", "पर पीड़ा सम नहि अधमाई॥"],
    meaning: "दूसरों का कल्याण करना सबसे बड़ा धर्म है और किसी को कष्ट पहुँचाना सबसे बड़ा पाप है। यही सच्चे धर्म का सार है।",
    category: "जीवन मूल्य",
    likes: 112
  },
  {
    id: 6,
    title: "शांत एवं जीवनोपयोगी",
    source: "रामचरितमानस",
    doha: ["मन कर्म वचन राम पद नेहा।", "होइहि सफल जनम संदेहा॥"],
    meaning: "जो व्यक्ति अपने मन, वचन और कर्म से भगवान श्रीराम के चरणों में प्रेम रखता है, उसका जीवन निश्चित रूप से सफल और सार्थक हो जाता है।",
    category: "भक्ति",
    likes: 74
  },
  {
    id: 7,
    title: "भक्तिपूर्ण",
    source: "रामचरितमानस",
    doha: ["राम नाम मणि दीप धरु, जीह देहरी द्वार।", "तुलसी भीतर बाहेरहुँ, जौं चाहसि उजियार॥"],
    meaning: "यदि जीवन में आंतरिक और बाहरी प्रकाश चाहते हो, तो अपनी वाणी पर श्रीराम के नाम का दीपक सदैव जलाए रखो। राम नाम जीवन को ज्ञान, शांति और प्रकाश से भर देता है।",
    category: "भक्ति",
    likes: 143
  },
  {
    id: 8,
    title: "श्रीराम स्तुति",
    source: "रामचरितमानस",
    doha: ["श्रीरामचन्द्र कृपालु भजु मन।", "वरण भवभय दारुणम्॥"],
    meaning: "हे मन! दयालु श्रीराम का भजन करो। वे संसार के दुख, भय और मोह का नाश करने वाले तथा अपने भक्तों पर असीम कृपा बरसाने वाले हैं।",
    category: "स्तुति",
    likes: 215
  },
  {
    id: 9,
    title: "प्रेरणादायक",
    source: "लोकप्रिय",
    doha: ["राम से बड़ा न कोई नाम।", "राम बिना अधूरा हर काम॥"],
    meaning: "भगवान श्रीराम का नाम जीवन को सही दिशा, शक्ति और शांति प्रदान करता है। उनके स्मरण से प्रत्येक कार्य शुभ और सफल बनने की प्रेरणा मिलती है।",
    category: "प्रेरणा",
    likes: 189
  }
];

export default function DailyDohaCard() {
  const { language } = useLanguage();
  const isHi = language === 'hi';

  const [dohas, setDohas] = useState<DohaItem[]>(FALLBACK_DOHAS);
  const [currentDoha, setCurrentDoha] = useState<DohaItem>(FALLBACK_DOHAS[2]); // Default to item index 2 (Ram Bhakti)
  const [likedIds, setLikedIds] = useState<number[]>([]);
  const [isCopied, setIsCopied] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [showMeaning, setShowMeaning] = useState(false);

  // Load Liked Dohas from LocalStorage and fetch from Database
  useEffect(() => {
    const storedLikes = localStorage.getItem('liked-dohas');
    if (storedLikes) {
      try {
        setLikedIds(JSON.parse(storedLikes));
      } catch (e) {
        console.error("Failed to parse liked dohas from localStorage", e);
      }
    }

    async function fetchDohas() {
      try {
        const { data, error } = await supabase
          .from('daily_dohas')
          .select('*')
          .order('id', { ascending: true });

        if (error) throw error;

        if (data && data.length > 0) {
          const formattedData: DohaItem[] = data.map((item: any) => ({
            id: Number(item.id),
            title: item.title || '',
            source: item.source || '',
            doha: Array.isArray(item.doha) ? item.doha : [String(item.doha)],
            meaning: item.meaning || '',
            category: item.category || '',
            likes: Number(item.likes || 0)
          }));
          setDohas(formattedData);
          
          const randomIndex = Math.floor(Math.random() * formattedData.length);
          setCurrentDoha(formattedData[randomIndex]);
        }
      } catch (err) {
        console.warn("Could not load dohas from database, using offline fallback:", err);
        const randomIndex = Math.floor(Math.random() * FALLBACK_DOHAS.length);
        setCurrentDoha(FALLBACK_DOHAS[randomIndex]);
      }
    }

    fetchDohas();
  }, []);

  const handleReload = () => {
    setIsRefreshing(true);
    setShowMeaning(false);
    setTimeout(() => {
      const remainingDohas = dohas.filter(d => d.id !== currentDoha.id);
      const listToPick = remainingDohas.length > 0 ? remainingDohas : dohas;
      const randomIndex = Math.floor(Math.random() * listToPick.length);
      setCurrentDoha(listToPick[randomIndex]);
      setIsRefreshing(false);
    }, 450);
  };

  const handleCopy = () => {
    const textToCopy = `${currentDoha.doha.join('\n')}\n— ${currentDoha.source}`;
    navigator.clipboard.writeText(textToCopy).then(() => {
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2000);
    }).catch(err => {
      console.error("Could not copy doha text", err);
    });
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.85, duration: 0.6 }}
      className="relative w-[92%] max-w-[360px] md:max-w-[540px] mx-auto md:mx-0 mt-6 md:mt-8 p-5 md:p-8 rounded-[22px] border border-amber-500/20 shadow-[0_20px_50px_rgba(0,0,0,0.85)] select-none text-center overflow-hidden"
    >
      {/* Background Image Layer */}
      <div 
        className="absolute inset-0 z-0 bg-cover bg-[80%_center] hover:scale-105"
        style={{ 
          backgroundImage: `url(${hanumanBg})`,
          transition: 'transform 10s ease-out'
        }}
      />
      {/* Dark overlay for text readability */}
      <div className="absolute inset-0 z-0 bg-gradient-to-b from-[#140a05]/75 via-[#180c06]/60 to-[#140a05]/80 backdrop-blur-[0.5px]" />

      {/* Ornate corners */}
      <div className="absolute top-3 left-3 w-5 h-5 border-t-2 border-l-2 border-amber-500/40 rounded-tl-md pointer-events-none z-10" />
      <div className="absolute top-3 right-3 w-5 h-5 border-t-2 border-r-2 border-amber-500/40 rounded-tr-md pointer-events-none z-10" />
      <div className="absolute bottom-3 left-3 w-5 h-5 border-b-2 border-l-2 border-amber-500/40 rounded-bl-md pointer-events-none z-10" />
      <div className="absolute bottom-3 right-3 w-5 h-5 border-b-2 border-r-2 border-amber-500/40 rounded-br-md pointer-events-none z-10" />

      {/* Ornate diamonds in bottom corners */}
      <div className="absolute bottom-5 left-5 text-amber-500/30 text-xs hidden md:block">◆</div>
      <div className="absolute bottom-5 right-5 text-amber-500/30 text-xs hidden md:block">◆</div>

      {/* TOP HEADER BADGE WITH LOTUS FLOWERS */}
      <div className="relative z-10 flex items-center justify-center gap-3.5 mb-5 mt-1">
        <img 
          src={abhijitMuhuratLotus} 
          alt="Lotus" 
          className="w-6 h-6 md:w-8 md:h-8 object-contain drop-shadow-[0_2px_8px_rgba(244,114,182,0.6)] animate-pulse"
        />
        <div className="px-5 py-1 bg-[#1e0e07]/90 border border-amber-500/30 rounded-full shadow-[0_4px_12px_rgba(0,0,0,0.5)]">
          <span className="text-amber-300 font-serif text-[10px] md:text-xs tracking-widest font-black uppercase flex items-center gap-1.5 whitespace-nowrap">
            <span>✦</span> {isHi ? "आज की राम वाणी" : "Today's Ram Vani"} <span>✦</span>
          </span>
        </div>
        <img 
          src={abhijitMuhuratLotus} 
          alt="Lotus" 
          className="w-6 h-6 md:w-8 md:h-8 object-contain drop-shadow-[0_2px_8px_rgba(244,114,182,0.6)] animate-pulse"
        />
      </div>

      {/* CONTENT AREA */}
      <div className="my-3 min-h-[90px] flex flex-col justify-center items-center relative z-10">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentDoha.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.3 }}
            className="flex flex-col items-center justify-center w-full"
          >
            {/* Doha lines */}
            <div className="flex flex-col items-center justify-center gap-1.5 w-full">
              {currentDoha.doha.map((line, idx) => (
                <p 
                  key={idx} 
                  className="text-amber-100/95 font-serif text-sm sm:text-base md:text-lg font-bold tracking-wide drop-shadow-[0_2px_4px_rgba(0,0,0,0.9)] break-keep select-text text-center leading-relaxed"
                >
                  {line}
                </p>
              ))}
            </div>

            {/* Source */}
            <span className="text-amber-400/80 font-serif text-[10px] md:text-xs italic mt-2.5 select-none tracking-wider drop-shadow-md">
              — {currentDoha.source}
            </span>

            {/* Meaning details panel (Always rendered to reserve space and prevent layout shifts) */}
            {currentDoha.meaning && (
              <div className="w-full flex flex-col items-center">
                <div
                  className="w-full transition-opacity duration-300 ease-in-out"
                  style={{
                    opacity: showMeaning ? 1 : 0,
                    pointerEvents: showMeaning ? 'auto' : 'none',
                  }}
                >
                  <p className="text-[11px] md:text-xs text-stone-300/95 leading-relaxed font-sans max-w-[92%] mx-auto mt-2.5 border-t border-amber-500/10 pt-2.5 text-center select-text">
                    <strong className="text-amber-400/90 font-serif mr-1">{isHi ? "अर्थ:" : "Meaning:"}</strong>
                    {currentDoha.meaning}
                  </p>
                </div>
              </div>
            )}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* ACTIONS FOOTER */}
      <div className="flex items-center justify-center gap-2 mt-4 relative z-10">
        <span className="text-amber-500/20 text-xs hidden md:inline mr-2">◆</span>
        
        {/* Toggle Meaning Button */}
        <button
          onClick={() => setShowMeaning(!showMeaning)}
          className="flex items-center gap-1.5 px-3 py-1.5 border border-amber-500/20 hover:border-amber-500/40 rounded-xl text-[10px] md:text-xs font-bold text-amber-300/90 hover:text-amber-300 hover:bg-amber-500/10 cursor-pointer transition-all duration-300 active:scale-95 select-none"
        >
          <BookOpen className="w-3.5 h-3.5 text-amber-400/90" />
          <span>{showMeaning ? (isHi ? "अर्थ छुपाएं" : "Hide Meaning") : (isHi ? "अर्थ देखें" : "View Meaning")}</span>
        </button>

        {/* Copy Button */}
        <button
          onClick={handleCopy}
          className={`flex items-center gap-1.5 px-3 py-1.5 border rounded-xl text-[10px] md:text-xs font-bold cursor-pointer transition-all duration-300 active:scale-95 select-none ${
            isCopied
              ? 'bg-green-500/10 border-green-500/40 text-green-400'
              : 'border-amber-500/20 text-amber-100/90 hover:border-amber-500/40 hover:bg-amber-500/10'
          }`}
        >
          {isCopied ? <Check className="w-3.5 h-3.5 text-green-400" /> : <Copy className="w-3.5 h-3.5 text-amber-400/90" />}
          <span>{isCopied ? (isHi ? "कॉपी किया" : "Copied!") : (isHi ? "कॉपी करें" : "Copy")}</span>
        </button>

        {/* Small Refresh Button */}
        <button
          onClick={handleReload}
          disabled={isRefreshing}
          className="flex items-center justify-center w-8 h-8 border border-amber-500/20 rounded-xl text-amber-300/90 cursor-pointer hover:border-amber-500/40 hover:bg-amber-500/10 transition-all duration-300 active:scale-95 select-none disabled:opacity-50"
          title={isHi ? "एक और दोहा" : "Another Doha"}
        >
          <RotateCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin' : ''}`} />
        </button>

        <span className="text-amber-500/20 text-xs hidden md:inline ml-2">◆</span>
      </div>
    </motion.div>
  );
}
