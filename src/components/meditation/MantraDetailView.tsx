import React, { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { Check, Play, Pause, Headphones } from "lucide-react";
import { useLanguage } from "@/hooks/useLanguage";
import { useTheme } from "@/hooks/useTheme";
import { cn } from "@/lib/utils";
import type { Mantra, JapTotal } from "@/lib/mantraJapa/mantraJapaApi";
import { SEO } from "@/components/SEO";

const japaStepsData = [
  {
    num: 1,
    titleHi: "आराम से बैठें",
    titleEn: "Sit Comfortably",
    descHi: "रीढ़ सीधी रखें, शरीर ढीला छोड़ें, और शांत स्थान चुनें।",
    descEn: "Keep your spine straight, relax the body, and choose a quiet spot.",
  },
  {
    num: 2,
    titleHi: "मन को स्थिर करें",
    titleEn: "Settle Your Focus",
    descHi: "कुछ क्षण मौन रहें और ध्यान को मंत्र पर लाएँ।",
    descEn: "Pause briefly in silence and bring your attention to the mantra.",
  },
  {
    num: 3,
    titleHi: "अर्थ पर ध्यान दें",
    titleEn: "Focus On The Meaning",
    descHi: "मंत्र के दिव्य अर्थ को समझें और हृदय में महसूस करें।",
    descEn: "Understand the sacred meaning and feel it in your heart.",
  },
  {
    num: 4,
    titleHi: "धीरे-धीरे जप करें",
    titleEn: "Chant Slowly",
    descHi: "स्पष्ट उच्चारण करें और माला या काउंटर से गिनती रखें।",
    descEn: "Pronounce clearly and count with a mala or the digital counter.",
  },
];

const commonMistakes = [
  { hi: "बहुत तेज़ी से जप करना", en: "Chanting too fast" },
  { hi: "काम या अन्य बातों के बारे में सोचना", en: "Thinking about work or other things" },
  { hi: "जप करते समय फोन का उपयोग करना", en: "Using phone while chanting" },
  { hi: "बिना समझे यंत्रवत् जप करना", en: "Chanting without understanding" },
];

type MantraDetail = {
  meaningHindi: string;
  meaningEnglish: string;
  whyChantHindi: string[];
  whyChantEnglish: string[];
  mantraTextHindi?: string;
  transliteration?: string;
};

const MANTRA_DETAILS: Record<string, MantraDetail> = {
  om: {
    mantraTextHindi: "ॐ",
    transliteration: "Om / Aum",
    meaningHindi: "ॐ सृष्टि की मूल ध्वनि है, जो ब्रह्मांड की चेतना और परम सत्य का प्रतीक है।",
    meaningEnglish:
      "Om is the primordial sound of the universe, representing cosmic consciousness and absolute truth.",
    whyChantHindi: [
      "मन को स्थिर और शांत किया जा सकता है",
      "एकाग्रता और फोकस बढ़ता है",
      "आत्मा और परमात्मा से जुड़ाव गहरा होता है",
      "शरीर की ऊर्जा संतुलित होती है",
    ],
    whyChantEnglish: [
      "Stabilizes and calms the mind",
      "Increases focus and concentration",
      "Deepens connection with the soul and Divine",
      "Balances bodily energies",
    ],
  },
  om_namah_shivaya: {
    mantraTextHindi: "ॐ नमः शिवाय",
    transliteration: "Om Namah Shivaya",
    meaningHindi: "मैं भगवान शिव को नमन करता हूं, जो समस्त चेतना के स्रोत हैं।",
    meaningEnglish: "I bow to Lord Shiva, the source of all consciousness.",
    whyChantHindi: [
      "मन को शांति मिलती है",
      "तनाव और मानसिक थकान कम होती है",
      "आत्मविश्वास और साहस बढ़ता है",
      "आध्यात्मिक विकास होता है",
    ],
    whyChantEnglish: [
      "Calms the mind and releases stress",
      "Reduces anxiety and mental fatigue",
      "Boosts confidence and inner courage",
      "Promotes spiritual advancement",
    ],
  },
  mahamrityunjaya: {
    mantraTextHindi:
      "ॐ त्र्यम्बकं यजामहे सुगन्धिं पुष्टिवर्धनम्।\nउर्वारुकमिव बन्धनान् मृत्योर्मुक्षीय मामृतात्॥",
    transliteration:
      "Om Tryambakam Yajamahe Sugandhim Pushti-Vardhanam\nUrvarukamiva Bandhanan Mrityor Mukshiya Maamritat",
    meaningHindi:
      "हम त्रिनेत्रधारी भगवान शिव की आराधना करते हैं, जो सुगंधमय हैं और सबका पोषण करते हैं। जैसे ककड़ी अपनी बेल से अलग होकर मुक्त होती है, वैसे ही वे हमें मृत्यु के बंधन से मुक्त करें और अमरता प्रदान करें।",
    meaningEnglish:
      "We worship the three-eyed Lord Shiva, who is fragrant and nourishes all. Just as a cucumber is freed from its bond to the vine, may He liberate us from death and grant us immortality.",
    whyChantHindi: [
      "रोग और भय से मुक्ति मिलती है",
      "दीर्घायु और स्वास्थ्य की प्राप्ति होती है",
      "मृत्यु के भय से मुक्ति मिलती है",
      "कठिन समस्याओं से रक्षा होती है",
    ],
    whyChantEnglish: [
      "Provides relief from ailments and fears",
      "Bestows long life and good health",
      "Removes the deep fear of death",
      "Shields you from severe calamities",
    ],
  },
  hare_krishna: {
    mantraTextHindi: "हरे कृष्ण हरे कृष्ण, कृष्ण कृष्ण हरे हरे।\nहरे राम हरे राम, राम राम हरे हरे॥",
    transliteration:
      "Hare Krishna Hare Krishna, Krishna Krishna Hare Hare\nHare Rama Hare Rama, Rama Rama Hare Hare",
    meaningHindi:
      "हे भगवान कृष्ण और राम, मैं आपकी शरण लेता हूं। यह मंत्र भगवान को प्रेमपूर्वक पुकारने और उनकी कृपा प्राप्त करने का माध्यम है।",
    meaningEnglish:
      "O Lord Krishna and Lord Rama, I take shelter in you. This mahamantra is a way to lovingly call upon the Divine and receive grace.",
    whyChantHindi: [
      "मन में आनंद और प्रेम का संचार होता है",
      "नकारात्मक विचारों से मुक्ति मिलती है",
      "भक्ति भाव और श्रद्धा बढ़ती है",
      "आत्मा को शुद्धि और शांति मिलती है",
    ],
    whyChantEnglish: [
      "Infuses joy and love into the heart",
      "Frees the mind from negative thinking",
      "Enhances devotional feelings and faith",
      "Purifies the soul and brings inner peace",
    ],
  },
  radhe_radhe: {
    mantraTextHindi: "राधे राधे",
    transliteration: "Radhe Radhe",
    meaningHindi:
      "राधा रानी का नाम जप, प्रेम, समर्पण और भक्ति की पराकाष्ठा का प्रतीक है। यह जप कृष्ण-प्रेम और निःस्वार्थ भक्ति की भावना जगाता है।",
    meaningEnglish:
      "Chanting Radha Rani's name symbolizes the peak of divine love and surrender. It awakens selfless devotion and love for Lord Krishna.",
    whyChantHindi: [
      "हृदय में प्रेम और करुणा बढ़ती है",
      "रिश्तों में मधुरता आती है",
      "मन की कठोरता दूर होती है",
      "भक्ति भाव गहरा होता है",
    ],
    whyChantEnglish: [
      "Awakens love and compassion in the heart",
      "Brings sweetness and harmony to relationships",
      "Softens the mind's rigidness",
      "Deepens the mood of devotion",
    ],
  },
  jai_shree_ram: {
    mantraTextHindi: "जय श्री राम",
    transliteration: "Jai Shree Ram",
    meaningHindi:
      "भगवान राम की जय हो — यह मंत्र मर्यादा, धर्म, सत्य और साहस के आदर्श पुरुष श्री राम के प्रति श्रद्धा और विजय भाव का उच्चारण है।",
    meaningEnglish:
      "Victory to Lord Rama — this mantra honors श्री राम as the embodiment of righteousness, truth, and courage.",
    whyChantHindi: [
      "आत्मबल और साहस बढ़ता है",
      "धर्म और सत्य के मार्ग पर चलने की प्रेरणा मिलती है",
      "बाधाओं और भय से मुक्ति मिलती है",
      "मन में अनुशासन और संयम आता है",
    ],
    whyChantEnglish: [
      "Enhances willpower and inner courage",
      "Inspires walking the path of truth and righteousness",
      "Provides relief from obstacles and fears",
      "Brings discipline and self-restraint to the mind",
    ],
  },
  om_namo_narayanaya: {
    mantraTextHindi: "ॐ नमो नारायणाय",
    transliteration: "Om Namo Narayanaya",
    meaningHindi: "मैं भगवान नारायण (विष्णु) को नमन करता हूं, जो सृष्टि के पालनहार और संरक्षक हैं।",
    meaningEnglish: "I bow to Lord Narayana (Vishnu), the preserver and protector of the universe.",
    whyChantHindi: [
      "जीवन में स्थिरता और संतुलन आता है",
      "आर्थिक और मानसिक सुरक्षा का भाव बढ़ता है",
      "बाधाओं का निवारण होता है",
      "शांति और संतोष की अनुभूति होती है",
    ],
    whyChantEnglish: [
      "Brings stability and balance to life",
      "Enhances feelings of security and mental peace",
      "Helps clear life's obstacles",
      "Grants deep satisfaction and contentment",
    ],
  },
  gayatri: {
    mantraTextHindi: "ॐ भूर्भुवः स्वः तत्सवितुर्वरेण्यं।\nभर्गो देवस्य धीमहि धियो यो नः प्रचोदयात्॥",
    transliteration:
      "Om Bhur Bhuvah Svah Tat Savitur Varenyam\nBhargo Devasya Dhimahi Dhiyo Yo Nah Pracodayat",
    meaningHindi:
      "हम उस तेजस्वी, दिव्य सूर्य देवता (सविता) का ध्यान करते हैं, जो पृथ्वी, अंतरिक्ष और स्वर्ग में व्याप्त हैं। वे हमारी बुद्धि को प्रकाशित और प्रेरित करें।",
    meaningEnglish:
      "We meditate on the glowing solar deity (Savitr) who pervades the earth, sky, and heavens. May He illumine and inspire our intellect.",
    whyChantHindi: [
      "बुद्धि और एकाग्रता तेज होती है",
      "ज्ञान और विवेक की प्राप्ति होती है",
      "नकारात्मकता का नाश होता है",
      "आत्मिक प्रकाश और स्पष्टता मिलती है",
    ],
    whyChantEnglish: [
      "Sharpens intellect and concentration",
      "Brings wisdom and discernment",
      "Destroys negativity",
      "Grants spiritual light and mental clarity",
    ],
  },
};

function getMantraDetailsKey(mantra: Mantra): string {
  const name = (mantra.name_english || "").trim();
  if (name === "Om Chanting") return "om";
  if (name === "Om Namah Shivaya") return "om_namah_shivaya";
  if (name === "Mahamrityunjaya Mantra") return "mahamrityunjaya";
  if (name === "Hare Krishna Mahamantra") return "hare_krishna";
  if (name === "Radhe Radhe") return "radhe_radhe";
  if (name === "Jai Shree Ram") return "jai_shree_ram";
  if (name === "Om Namo Narayanaya") return "om_namo_narayanaya";
  if (name === "Gayatri Mantra") return "gayatri";

  const nameLower = name.toLowerCase();
  if (nameLower.includes("shiva") || nameLower.includes("shivaya")) return "om_namah_shivaya";
  if (nameLower.includes("mrityunjaya")) return "mahamrityunjaya";
  if (nameLower.includes("krishna")) return "hare_krishna";
  if (nameLower.includes("radhe")) return "radhe_radhe";
  if (nameLower.includes("ram") || nameLower.includes("rama")) return "jai_shree_ram";
  if (nameLower.includes("narayanaya")) return "om_namo_narayanaya";
  if (nameLower.includes("gayatri")) return "gayatri";

  return "om";
}

type MantraDetailViewProps = {
  mantra: Mantra;
  image: string | undefined;
  stats: JapTotal | undefined;
  onBack: () => void;
  onStartJapa: () => void;
};

export default function MantraDetailView({
  mantra,
  image,
  stats,
  onStartJapa,
}: MantraDetailViewProps) {
  const { language } = useLanguage();
  const isHi = language === "hi";
  const { theme } = useTheme();
  const isDark = theme === "dark";

  const [isPlaying, setIsPlaying] = useState(false);
  const audioCtxRef = useRef<AudioContext | null>(null);
  const oscillatorRef = useRef<OscillatorNode | null>(null);
  const gainNodeRef = useRef<GainNode | null>(null);

  const detailsKey = getMantraDetailsKey(mantra);
  const detail = MANTRA_DETAILS[detailsKey] || MANTRA_DETAILS.om;

  const totalChants = stats?.total_chants ?? 0;
  const currentStreak = stats?.current_streak ?? 0;
  const totalSessions = stats?.total_sessions ?? 0;

  const stopAudio = () => {
    if (oscillatorRef.current && gainNodeRef.current && audioCtxRef.current) {
      const ctx = audioCtxRef.current;
      const osc = oscillatorRef.current;
      const gain = gainNodeRef.current;

      try {
        gain.gain.setValueAtTime(gain.gain.value, ctx.currentTime);
        gain.gain.linearRampToValueAtTime(0.01, ctx.currentTime + 0.3);

        setTimeout(() => {
          try {
            osc.stop();
            if ((osc as any).subOsc) {
              (osc as any).subOsc.stop();
            }
          } catch {
            /* ignore */
          }
        }, 350);
      } catch {
        try {
          osc.stop();
        } catch {
          /* ignore */
        }
      }

      oscillatorRef.current = null;
      gainNodeRef.current = null;
    }
    setIsPlaying(false);
  };

  useEffect(() => {
    return () => {
      stopAudio();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const startAudio = () => {
    try {
      if (!audioCtxRef.current) {
        audioCtxRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
      }

      const ctx = audioCtxRef.current;
      if (ctx.state === "suspended") {
        ctx.resume();
      }

      const osc = ctx.createOscillator();
      osc.type = "sine";
      osc.frequency.setValueAtTime(136.1, ctx.currentTime);

      const osc2 = ctx.createOscillator();
      osc2.type = "sine";
      osc2.frequency.setValueAtTime(136.1 * 1.5, ctx.currentTime);

      const gainNode = ctx.createGain();
      const gainNode2 = ctx.createGain();
      const masterGain = ctx.createGain();

      gainNode.gain.setValueAtTime(0.4, ctx.currentTime);
      gainNode2.gain.setValueAtTime(0.15, ctx.currentTime);
      masterGain.gain.setValueAtTime(0.01, ctx.currentTime);
      masterGain.gain.linearRampToValueAtTime(0.3, ctx.currentTime + 0.5);

      osc.connect(gainNode);
      osc2.connect(gainNode2);
      gainNode.connect(masterGain);
      gainNode2.connect(masterGain);
      masterGain.connect(ctx.destination);

      osc.start();
      osc2.start();

      oscillatorRef.current = osc;
      gainNodeRef.current = masterGain;
      (osc as any).subOsc = osc2;

      setIsPlaying(true);
    } catch (err) {
      console.error("Web Audio API not supported or failed:", err);
    }
  };

  const handlePlayToggle = () => {
    if (isPlaying) stopAudio();
    else startAudio();
  };

  const whyItems = isHi ? detail.whyChantHindi : detail.whyChantEnglish;
  const sacredText = detail.mantraTextHindi || (isHi ? mantra.name_hindi : mantra.name_english);
  const transliteration = detail.transliteration || mantra.name_english;

  return (
    <div
      className={cn(
        "relative flex flex-col h-full min-h-0 overflow-hidden transition-colors duration-300",
        isDark ? "text-amber-50 bg-[#0c0a08]" : "text-[#3A2418] bg-[#FAF6EE]"
      )}
    >
      <SEO
        title={isHi ? mantra.name_hindi : mantra.name_english}
        description={isHi ? detail.meaningHindi : detail.meaningEnglish}
        image={image}
        url={
          typeof window !== "undefined"
            ? `${window.location.origin}/meditation?practice=mantra_jap_home&mantraId=${mantra.id}`
            : `/meditation?practice=mantra_jap_home&mantraId=${mantra.id}`
        }
        lang={isHi ? "hi" : "en"}
      />
      {!isDark && (
        <div
          className="absolute inset-0 -z-20 pointer-events-none"
          style={{
            background: "linear-gradient(180deg, #FFFDF8 0%, #FAF6EE 45%, #F5EDE0 100%)",
          }}
        />
      )}

      <div className="flex-1 min-h-0 overflow-y-auto overflow-x-hidden">
        <div className="mx-auto max-w-5xl px-4 lg:px-6 mt-4 md:mt-5 pb-6 md:pb-8 space-y-4 md:space-y-5">
          <motion.section
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.25 }}
            className="relative w-full h-[220px] sm:h-[240px] md:h-[300px] lg:h-[340px] overflow-hidden rounded-[24px] border border-[#E8D8C4] dark:border-stone-700 flex flex-col justify-end px-5 sm:px-8 pt-5 pb-5 sm:pt-6 sm:pb-6 shadow-[0_8px_24px_rgba(42,18,15,0.08)] dark:shadow-[0_8px_24px_rgba(0,0,0,0.5)]"
          >
            <div className="absolute inset-0 z-0 overflow-hidden rounded-[inherit]">
              {image ? (
                <img
                  src={image}
                  alt=""
                  width={1024}
                  height={1024}
                  loading="eager"
                  decoding="async"
                  className="w-full h-full object-cover object-[center_25%] md:object-[center_28%]"
                />
              ) : (
                <div className="w-full h-full bg-[#2a1210] flex items-center justify-center">
                  <span className="text-6xl md:text-7xl font-display text-[#F5C15C]/80">ॐ</span>
                </div>
              )}
              {/* Clean gradient scrim for great text contrast */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/45 to-transparent" />
              <div className="absolute inset-0 bg-gradient-to-r from-black/60 via-black/25 to-transparent" />
            </div>

            <div className="relative z-10 max-w-xl md:max-w-2xl text-left">
              <p className="text-[#F5C15C] font-bold tracking-[0.18em] text-[10.5px] sm:text-xs uppercase mb-1">
                {isHi ? "मंत्र साधना" : "Mantra Sadhana"}
              </p>
              <h1 className="text-xl sm:text-2xl md:text-3xl font-display font-bold text-white leading-tight drop-shadow-sm">
                {isHi ? mantra.name_hindi : mantra.name_english}
              </h1>
              <p className="text-white/85 text-xs sm:text-sm mt-0.5 font-medium drop-shadow-xs">
                {isHi ? mantra.name_english : mantra.name_hindi}
              </p>
              <p className="mt-2 text-xs text-white/80 font-medium tabular-nums flex flex-wrap items-center gap-x-0 gap-y-0.5">
                <span>
                  <span className="text-[#F5C15C] font-bold">{totalChants.toLocaleString()}</span>
                  {isHi ? " कुल जाप" : " total"}
                </span>
                <span className="mx-2 text-white/35">·</span>
                <span>
                  <span className="text-[#F5C15C] font-bold">{currentStreak}</span>
                  {isHi ? " दिन स्ट्रीक" : "-day streak"}
                </span>
                <span className="mx-2 text-white/35">·</span>
                <span>
                  <span className="text-[#F5C15C] font-bold">{totalSessions}</span>
                  {isHi ? " सत्र" : " sessions"}
                </span>
              </p>
            </div>
          </motion.section>

          {/* Sacred text */}
          <section className="bg-[#FFFDF8] dark:bg-stone-900 border border-[#E8D8C4] dark:border-stone-700 rounded-2xl p-5 sm:p-6 md:p-8 text-center space-y-3 md:space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-[#651317] dark:text-amber-300">
              {isHi ? "मूल मंत्र एवं लिप्यांतरण" : "Sacred Text & Transliteration"}
            </h3>
            <p className="font-display text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold text-[#3A2418] dark:text-amber-50 leading-relaxed whitespace-pre-line">
              {sacredText}
            </p>
            <p className="text-sm md:text-base font-medium text-[#786252] dark:text-stone-400 italic whitespace-pre-line">
              {transliteration}
            </p>
            <p className="text-sm md:text-[15px] leading-relaxed text-[#3A2418]/90 dark:text-stone-300 max-w-3xl mx-auto pt-1">
              {isHi ? detail.meaningHindi : detail.meaningEnglish}
            </p>
          </section>

          {/* Why + Listen — stacked mobile, side-by-side desktop */}
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4 md:gap-6 items-stretch">
            <section className="md:col-span-3 bg-[#FFFDF8] dark:bg-stone-900 border border-[#E8D8C4] dark:border-stone-700 rounded-2xl p-5 sm:p-6 md:p-7 space-y-4 h-full">
              <h3 className="text-xs font-bold uppercase tracking-wider text-[#651317] dark:text-amber-300">
                {isHi ? "क्यों जप करें" : "Why Chant"}
              </h3>
              <ul className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-1 lg:grid-cols-2 gap-3 md:gap-3.5">
                {whyItems.map((item, idx) => (
                  <li key={idx} className="flex items-start gap-3">
                    <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-[#FAF0E4] dark:bg-amber-500/15 border border-[#E8D8C4] dark:border-amber-500/30 text-[#651317] dark:text-amber-300">
                      <Check className="w-3 h-3 stroke-[3px]" />
                    </span>
                    <span className="text-sm font-medium leading-relaxed text-[#3A2418] dark:text-stone-200">
                      {item}
                    </span>
                  </li>
                ))}
              </ul>
            </section>

            <section className="md:col-span-2 bg-[#FFFDF8] dark:bg-stone-900 border border-[#E8D8C4] dark:border-stone-700 rounded-2xl p-5 sm:p-6 md:p-7 flex flex-col items-center justify-center text-center space-y-3 min-h-[180px] md:min-h-0 h-full">
              <h3 className="text-xs font-bold uppercase tracking-wider text-[#651317] dark:text-amber-300 flex items-center gap-2">
                <Headphones className="w-3.5 h-3.5" />
                {isHi ? "मंत्र सुनें" : "Listen to Mantra"}
              </h3>
              <p className="text-xs text-[#786252] dark:text-stone-400 font-medium">
                {isHi ? "शुद्ध उच्चारण सुनें" : "Listen to pure pronunciation"}
              </p>
              <button
                type="button"
                onClick={handlePlayToggle}
                className="flex h-14 w-14 md:h-16 md:w-16 items-center justify-center rounded-full bg-[#651317] hover:bg-[#4f0f12] text-white shadow-[0_8px_24px_rgba(101,19,23,0.35)] active:scale-95 transition-all"
                aria-label={isPlaying ? "Pause" : "Play"}
              >
                {isPlaying ? (
                  <Pause className="w-6 h-6 fill-current" />
                ) : (
                  <Play className="w-6 h-6 fill-current translate-x-[1px]" />
                )}
              </button>
              <span className="text-xs font-semibold text-[#786252] dark:text-stone-400">
                {isHi ? mantra.name_hindi : mantra.name_english}
              </span>
            </section>
          </div>

          {/* How to practice */}
          <section className="bg-[#FFFDF8] dark:bg-stone-900 border border-[#E8D8C4] dark:border-stone-700 rounded-2xl p-5 sm:p-6 md:p-8 space-y-5 md:space-y-6">
            <div className="text-center space-y-1">
              <h3 className="text-base sm:text-lg md:text-xl font-display font-bold text-[#651317] dark:text-amber-300">
                {isHi ? "अभ्यास कैसे करें" : "How To Practice"}
              </h3>
              <p className="text-xs md:text-sm text-[#786252] dark:text-stone-400 font-medium">
                {isHi
                  ? "सर्वश्रेष्ठ अनुभव के लिए इन चरणों का पालन करें"
                  : "Follow these steps for the best experience"}
              </p>
            </div>

            <ol className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-5">
              {japaStepsData.map((step) => (
                <li key={step.num} className="flex items-start gap-3.5 text-left">
                  <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full border border-[#E8D8C4] dark:border-amber-500/30 bg-[#FAF0E4] dark:bg-amber-500/10 text-[#651317] dark:text-amber-300 font-display font-bold text-xs">
                    {step.num}
                  </span>
                  <div className="min-w-0 pt-0.5">
                    <h4 className="font-display font-bold text-sm sm:text-base text-[#3A2418] dark:text-amber-50">
                      {isHi ? step.titleHi : step.titleEn}
                    </h4>
                    <p className="text-sm mt-0.5 leading-relaxed text-[#786252] dark:text-stone-400">
                      {isHi ? step.descHi : step.descEn}
                    </p>
                  </div>
                </li>
              ))}
            </ol>

            <div className="border-t border-[#E8D8C4]/80 dark:border-stone-800 pt-5 md:pt-6 space-y-3">
              <h4 className="text-sm md:text-base font-display font-bold text-[#651317] dark:text-amber-300">
                {isHi ? "सामान्य गलतियाँ" : "Common Mistakes"}
              </h4>
              <ul className="grid grid-cols-1 md:grid-cols-2 gap-2.5 md:gap-3">
                {commonMistakes.map((mistake, idx) => (
                  <li key={idx} className="flex items-start gap-2.5">
                    <span className="mt-0.5 text-[#651317] dark:text-amber-400 text-xs font-bold">✕</span>
                    <span className="text-sm font-medium text-[#3A2418] dark:text-stone-300">
                      {isHi ? mistake.hi : mistake.en}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          </section>
        </div>
      </div>

      {/* Sticky CTA */}
      <section className="shrink-0 z-30 border-t border-[#E8D8C4] dark:border-stone-800 bg-[#FAF6EE]/95 dark:bg-[#0c0a08]/95 backdrop-blur-md">
        <div className="mx-auto max-w-5xl px-4 lg:px-6 pt-3 pb-4 md:pt-4 md:pb-5">
          <button
            type="button"
            onClick={onStartJapa}
            className="flex w-full md:max-w-md md:mx-auto items-center justify-center gap-2.5 rounded-full bg-[#651317] hover:bg-[#4f0f12] text-white font-bold px-8 py-3.5 text-sm sm:text-base active:scale-95 transition-all shadow-[0_8px_24px_rgba(101,19,23,0.35)]"
            onPointerEnter={() => {
              void import("@/components/meditation/PremiumJapaCounter");
            }}
          >
            <span className="font-display text-lg leading-none">ॐ</span>
            <span>{isHi ? "जप प्रारंभ करें" : "Start Japa"}</span>
          </button>
        </div>
      </section>
    </div>
  );
}
