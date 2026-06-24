import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  ArrowLeft, 
  Share2, 
  Download, 
  Sparkles, 
  User as UserIcon, 
  Camera, 
  Smartphone, 
  Flame, 
  Lock, 
  ChevronLeft, 
  ChevronRight, 
  X, 
  Volume2, 
  VolumeX,
  Bell,
  Heart,
  BookOpen,
  Search,
  Check,
  Lightbulb
} from "lucide-react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useLanguage } from "@/hooks/useLanguage";
import { useAuth } from "@/hooks/useAuth";
import { useBhajanModalOpen } from "@/hooks/useBhajanModalOpen";
import { toast } from "sonner";
import { playMeditationBell, playCompletionChime } from "@/lib/meditation/meditationBell";

// ─── LOCAL DEITY IMAGES IMPORTS ───────────────────────────────────
import shreeRamImg from "./images/shree_ram_ultra_hd.webp";
import shivVerticalImg from "./images/shiv_vertical_wallpaper.webp";
import hanumanImg from "./images/Hanumanji_HD_WebP.webp";
import ganeshImg from "./images/ganesh.webp";
import krishnaImg from "./images/krishna main.webp";
import lakshmiImg from "./images/red_lotus_lossless.webp";
import salasarBalajiImg from "./images/salasar_balaji desktop.webp";

// Wallpapers
import kashiVishwanathImg from "./images/kashi vishwanath.webp";
import shivTempleHdImg from "./images/shiv_temple_hd.webp";
import shivWallpaperImg from "./images/shiv_wallpaper.webp";
import deityRamImg from "./images/deity-ram.webp";
import radhaKrishnaImg from "./images/radha_krishna_hd mayapur tv.webp";
import krishnaMobileImg from "./images/krishna_mobile_wallpaper.webp";
import shyamMandirImg from "./images/shyam_mandir_desktop_hd.webp";
import litDiyaImg from "./images/lit_diya.png";

// ─── SYNTHESIZED MEDITATIVE TANPURA DRONE ─────────────────────────
class TempleDrone {
  private ctx: AudioContext | null = null;
  private oscs: OscillatorNode[] = [];
  private gain: GainNode | null = null;

  start() {
    try {
      const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioContextClass) return;
      this.ctx = new AudioContextClass();
      
      this.gain = this.ctx.createGain();
      this.gain.gain.setValueAtTime(0, this.ctx.currentTime);
      this.gain.gain.linearRampToValueAtTime(0.05, this.ctx.currentTime + 1.2); // soft ambient volume
      this.gain.connect(this.ctx.destination);

      // Deep meditative tanpura base drone
      // C#3 root frequency (138.59 Hz)
      const baseFreq = 138.59;
      const harmonyRatios = [1, 1.5, 2, 3]; // Root, Perfect Fifth, Octave, Octave Perfect Fifth
      
      harmonyRatios.forEach((ratio, idx) => {
        if (!this.ctx || !this.gain) return;
        const osc = this.ctx.createOscillator();
        osc.type = idx === 0 ? "triangle" : "sine"; // triangle for base warmth, sine for high harmonics
        osc.frequency.value = baseFreq * ratio;
        
        // Chorus detuning
        osc.detune.value = (Math.random() - 0.5) * 6;

        // Swelling slow volume LFO
        const lfo = this.ctx.createOscillator();
        lfo.frequency.value = 0.12 + Math.random() * 0.08;
        const lfoGain = this.ctx.createGain();
        lfoGain.gain.value = 0.01;
        
        lfo.connect(lfoGain);
        lfoGain.connect(osc.frequency);
        
        lfo.start();
        osc.connect(this.gain);
        osc.start();
        
        this.oscs.push(osc);
        this.oscs.push(lfo as any);
      });
    } catch (e) {
      console.error("AudioContext initialization failed", e);
    }
  }

  stop() {
    try {
      if (this.gain && this.ctx) {
        const now = this.ctx.currentTime;
        this.gain.gain.setValueAtTime(this.gain.gain.value, now);
        this.gain.gain.linearRampToValueAtTime(0, now + 0.8);
        setTimeout(() => {
          this.oscs.forEach(osc => {
            try { osc.stop(); } catch(_) {}
          });
          try { this.ctx?.close(); } catch(_) {}
          this.ctx = null;
          this.oscs = [];
          this.gain = null;
        }, 900);
      }
    } catch(e) {}
  }
}

// ─── DATA MODELS ──────────────────────────────────────────────────
interface DailyDarshan {
  id: string;
  deity: string;
  deityHindi: string;
  imageUrl: string;
  templeName: string;
  templeNameHindi: string;
  quote: string;
  quoteHindi: string;
}

const DAILY_DARSHANS: Record<number, DailyDarshan> = {
  0: { // Sunday
    id: "sun-ram",
    deity: "Lord Rama",
    deityHindi: "श्री राम",
    imageUrl: shreeRamImg,
    templeName: "Ayodhya Ram Mandir",
    templeNameHindi: "अयोध्या राम मंदिर",
    quote: "May Lord Rama bless you with righteousness, character, and eternal peace.",
    quoteHindi: "श्री राम आपको धर्म, चरित्र और परम शांति का आशीर्वाद प्रदान करें।"
  },
  1: { // Monday
    id: "mon-shiva",
    deity: "Lord Shiva",
    deityHindi: "भगवान शिव",
    imageUrl: shivVerticalImg,
    templeName: "Kashi Vishwanath Temple",
    templeNameHindi: "काशी विश्वनाथ मंदिर",
    quote: "May Lord Shiva dissolve all your troubles and bless you with deep calm and meditation.",
    quoteHindi: "भगवान शिव आपके सभी संकटों को दूर करें और आपको शांत मन व ध्यान प्रदान करें।"
  },
  2: { // Tuesday
    id: "tue-hanuman",
    deity: "Lord Hanuman",
    deityHindi: "हनुमान जी",
    imageUrl: hanumanImg,
    templeName: "Salasar Balaji Dham",
    templeNameHindi: "सालासर बालाजी धाम",
    quote: "May Hanuman Ji remove all obstacles and bless you with strength, courage, and true devotion.",
    quoteHindi: "हनुमान जी आपके मार्ग के सभी विघ्नों को दूर कर आपको बल, साहस और भक्ति प्रदान करें।"
  },
  3: { // Wednesday
    id: "wed-ganesha",
    deity: "Lord Ganesha",
    deityHindi: "गणेश जी",
    imageUrl: ganeshImg,
    templeName: "Siddhivinayak Temple",
    templeNameHindi: "सिद्धिविनायक मंदिर",
    quote: "May Lord Ganesha remove all obstacles and grant you wisdom, success, and prosperity.",
    quoteHindi: "गणेश जी आपके सभी संकटों को हरें और आपको बुद्धि, ऋद्धि-सिद्धि और सौभाग्य प्रदान करें।"
  },
  4: { // Thursday
    id: "thu-krishna",
    deity: "Lord Krishna",
    deityHindi: "श्री कृष्ण",
    imageUrl: krishnaImg,
    templeName: "Banke Bihari Temple",
    templeNameHindi: "बांके बिहारी मंदिर",
    quote: "May Lord Krishna fill your life with love, joy, playfulness, and pure devotion.",
    quoteHindi: "श्री कृष्ण आपके जीवन को प्रेम, आनंद, दिव्य लीला और विशुद्ध भक्ति से सराबोर कर दें।"
  },
  5: { // Friday
    id: "fri-lakshmi",
    deity: "Mata Lakshmi",
    deityHindi: "माता लक्ष्मी",
    imageUrl: lakshmiImg,
    templeName: "Mahalakshmi Temple",
    templeNameHindi: "महालक्ष्मी मंदिर",
    quote: "May Mata Lakshmi bless your home with prosperity, abundance, health, and peace.",
    quoteHindi: "माता लक्ष्मी आपके घर को सुख, समृद्धि, अच्छे स्वास्थ्य और शांति से परिपूर्ण करें।"
  },
  6: { // Saturday
    id: "sat-hanuman",
    deity: "Lord Hanuman",
    deityHindi: "हनुमान जी",
    imageUrl: salasarBalajiImg,
    templeName: "Sankat Mochan Temple",
    templeNameHindi: "संकट मोचन मंदिर",
    quote: "May Hanuman Ji guard you against negative energy and bless you with peace and wisdom.",
    quoteHindi: "हनुमान जी नकारात्मक ऊर्जा से आपकी रक्षा करें और आपको शांति और विवेक का आशीर्वाद दें।"
  }
};

interface DevotionalWallpaper {
  id: string;
  deity: string;
  name: string;
  nameHindi: string;
  imageUrl: string;
  tier: "free" | "devotee" | "mahabhakt";
}

const WALLPAPERS_LIST: DevotionalWallpaper[] = [
  { id: "wp-shiva-1", deity: "Shiva", name: "Kashi Vishwanath Jyotirlinga", nameHindi: "काशी विश्वनाथ ज्योतिर्लिंग", imageUrl: kashiVishwanathImg, tier: "free" },
  { id: "wp-shiva-2", deity: "Shiva", name: "Shiv Temple Darshan", nameHindi: "शिव मंदिर दर्शन", imageUrl: shivTempleHdImg, tier: "free" },
  { id: "wp-shiva-3", deity: "Shiva", name: "Meditating Shiva", nameHindi: "ध्यानमग्न शिव", imageUrl: shivWallpaperImg, tier: "free" },
  { id: "wp-ram-1", deity: "Rama", name: "Shree Ram Darshan", nameHindi: "श्री राम दर्शन", imageUrl: deityRamImg, tier: "free" },
  { id: "wp-ram-2", deity: "Rama", name: "Shree Ram Darbar HD", nameHindi: "श्री राम दरबार एचडी", imageUrl: shreeRamImg, tier: "free" },
  { id: "wp-krishna-1", deity: "Krishna", name: "Banke Bihari Devotion", nameHindi: "बांके बिहारी भक्ति", imageUrl: krishnaImg, tier: "free" },
  { id: "wp-krishna-2", deity: "Krishna", name: "Radha Krishna Mayapur", nameHindi: "राधा कृष्ण मायापुर", imageUrl: radhaKrishnaImg, tier: "free" },
  { id: "wp-krishna-3", deity: "Krishna", name: "Krishna Mobile Wallpaper", nameHindi: "कृष्ण मोबाइल वॉलपेपर", imageUrl: krishnaMobileImg, tier: "free" },
  { id: "wp-hanuman-1", deity: "Hanuman", name: "Hanumanji HD Portrait", nameHindi: "हनुमानजी एचडी पोर्ट्रेट", imageUrl: hanumanImg, tier: "free" },
  { id: "wp-shyam-1", deity: "Khatu Shyam", name: "Shyam Mandir Desktop", nameHindi: "श्याम मंदिर डेस्कटॉप", imageUrl: shyamMandirImg, tier: "free" }
];

interface DevotionalLiveWallpaper {
  id: string;
  deity: string;
  name: string;
  nameHindi: string;
  thumbnailUrl: string;
  effect: "petals" | "aura" | "flame" | "shimmer";
  tier: "free" | "devotee" | "mahabhakt";
}

const LIVE_WALLPAPERS_LIST: DevotionalLiveWallpaper[] = [
  { id: "live-krishna-1", deity: "Krishna", name: "Vrindavan Raas Leela", nameHindi: "वृंदावन रास लीला सजीव", thumbnailUrl: radhaKrishnaImg, effect: "petals", tier: "free" },
  { id: "live-shiva-1", deity: "Shiva", name: "Kailash Meditating Shiva", nameHindi: "कैलाश ध्यानमग्न शिव सजीव", thumbnailUrl: shivWallpaperImg, effect: "aura", tier: "free" },
  { id: "live-ram-1", deity: "Rama", name: "Ayodhya Mandir Deepotsav", nameHindi: "अयोध्या मंदिर दीपोत्सव सजीव", thumbnailUrl: deityRamImg, effect: "flame", tier: "free" },
  { id: "live-hanuman-1", deity: "Hanuman", name: "Anjaneya Shaurya Darshan", nameHindi: "आंजनेय शौर्य दर्शन सजीव", thumbnailUrl: hanumanImg, effect: "shimmer", tier: "free" }
];

interface Petal {
  id: number;
  x: number; // percentage
  delay: number; // seconds
  duration: number; // seconds
  size: number; // pixels
  emoji: string;
}

const WEEKDAYS = [
  { dayNum: 0, label: "Sun", labelHi: "रवि", deity: "Rama" },
  { dayNum: 1, label: "Mon", labelHi: "सोम", deity: "Shiva" },
  { dayNum: 2, label: "Tue", labelHi: "मंगल", deity: "Hanuman" },
  { dayNum: 3, label: "Wed", labelHi: "बुध", deity: "Ganesha" },
  { dayNum: 4, label: "Thu", labelHi: "गुरु", deity: "Krishna" },
  { dayNum: 5, label: "Fri", labelHi: "शुक्र", deity: "Lakshmi" },
  { dayNum: 6, label: "Sat", labelHi: "शनि", deity: "Hanuman" },
];

const MoreIcon = ({ className = "w-5 h-5" }: { className?: string }) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <circle cx="12" cy="12" r="1.5" fill="currentColor" />
    <circle cx="12" cy="5" r="1.5" fill="currentColor" />
    <circle cx="12" cy="19" r="1.5" fill="currentColor" />
  </svg>
);

// Custom Download Icon SVG
const CustomDownloadIcon = ({ className = "w-5 h-5" }: { className?: string }) => (
  <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className={className} style={{ width: '1.25rem', height: '1.25rem', display: 'inline-block' }}>
    <path d="M5.625 15C5.625 14.5858 5.28921 14.25 4.875 14.25C4.46079 14.25 4.125 14.5858 4.125 15H5.625ZM4.875 16H4.125H4.875ZM19.275 15C19.275 14.5858 18.9392 14.25 18.525 14.25C18.1108 14.25 17.775 14.25 17.775 15H19.275ZM11.1086 15.5387C10.8539 15.8653 10.9121 16.3366 11.2387 16.5914C11.5653 16.8461 12.0366 16.7879 12.2914 16.4613ZM16.1914 11.4613C16.4461 11.1347 16.3879 10.6634 16.0613 10.4086C15.7347 10.1539 15.2634 10.2121 15.0086 10.5387L16.1914 11.4613ZM11.1086 16.4613C11.3634 16.7879 11.8347 16.8461 12.1613 16.5914C12.4879 16.3366 12.5461 15.8653 12.2914 15.5387L11.1086 16.4613ZM8.39138 10.5387C8.13662 10.2121 7.66533 10.1539 7.33873 10.4086C7.01212 10.6634 6.95387 11.1347 7.20862 11.4613L8.39138 10.5387ZM10.95 16C10.95 16.4142 11.2858 16.75 11.7 16.75C12.1142 16.75 12.45 16.4142 12.45 16H10.95ZM12.45 5C12.45 4.58579 12.1142 4.25 11.7 4.25C11.2858 4.25 10.95 4.58579 10.95 5H12.45ZM4.125 15V16H5.625V15H4.125ZM4.125 16C4.125 18.0531 5.75257 19.75 7.8 19.75V18.25C6.61657 18.25 5.625 17.2607 5.625 16H4.125ZM7.8 19.75H15.6V18.25H7.8V19.75ZM15.6 19.75C17.6474 19.75 19.275 18.0531 19.275 16H17.775C17.775 17.2607 16.7834 18.25 15.6 18.25V19.75ZM19.275 16V15H17.775V16H19.275ZM12.2914 16.4613L16.1914 11.4613L15.0086 10.5387L11.1086 15.5387L12.2914 16.4613ZM12.2914 15.5387L8.39138 10.5387L7.20862 11.4613L11.1086 16.4613L12.2914 15.5387ZM12.45 16V5H10.95V16H12.45Z" fill="currentColor"/>
  </svg>
);

// ─── LIVE WALLPAPERS PARTICLE OVERLAYS ────────────────────────────
const PetalsOverlay = () => {
  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden z-10">
      {[...Array(6)].map((_, i) => (
        <div
          key={i}
          className="absolute text-sm select-none"
          style={{
            left: `${15 + i * 16}%`,
            top: `-20px`,
            animation: `fall linear infinite`,
            animationDelay: `${i * 1.5}s`,
            animationDuration: `${5 + i * 2}s`,
            opacity: 0.8
          }}
        >
          🌸
        </div>
      ))}
    </div>
  );
};

const AuraOverlay = () => {
  return (
    <div 
      className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(251,191,36,0.22)_0%,transparent_70%)] pointer-events-none z-10 animate-pulse"
      style={{ animationDuration: "3s" }}
    />
  );
};

const FlameOverlay = () => {
  return (
    <div 
      className="absolute inset-x-0 bottom-0 top-[40%] bg-gradient-to-t from-orange-500/15 via-orange-500/5 to-transparent pointer-events-none z-10 animate-pulse"
      style={{ animationDuration: "1.2s" }}
    />
  );
};

const ShimmerOverlay = () => {
  return (
    <div 
      className="absolute inset-0 bg-[linear-gradient(45deg,transparent_20%,rgba(255,255,255,0.08)_50%,transparent_80%)] pointer-events-none z-10 bg-[length:200%_200%] animate-shimmer"
      style={{ animationDuration: "2.5s" }}
    />
  );
};

// ─── PHONE CONTAINER MOCKUP ───────────────────────────────────────
const PhoneFrame = ({ imageUrl, previewMode = "lock", effect }: { imageUrl: string; previewMode?: "lock" | "home"; effect?: string }) => {
  const { language } = useLanguage();
  const isHi = language === "hi";

  const [time, setTime] = useState("09:41");
  const [dateStr, setDateStr] = useState("");

  useEffect(() => {
    const date = new Date();
    const options: Intl.DateTimeFormatOptions = { weekday: 'long', day: 'numeric', month: 'short' };
    const locale = isHi ? 'hi-IN' : 'en-US';
    setDateStr(date.toLocaleDateString(locale, options));
    
    const interval = setInterval(() => {
      const d = new Date();
      const hrs = String(d.getHours()).padStart(2, '0');
      const mins = String(d.getMinutes()).padStart(2, '0');
      setTime(`${hrs}:${mins}`);
    }, 60000);
    return () => clearInterval(interval);
  }, [isHi]);

  return (
    <div 
      className="relative w-[115px] h-[237px] md:w-[200px] md:h-[412px] select-none flex-shrink-0 rounded-[20px] md:rounded-[36px]"
      style={{ boxShadow: "0 20px 50px rgba(0, 0, 0, 0.45)" }}
    >
      {/* Wallpaper Image (Behind bezel) */}
      <div 
        className="absolute rounded-[16px] md:rounded-[28px] overflow-hidden bg-black z-0"
        style={{ top: '1.4%', bottom: '1.4%', left: '2.8%', right: '2.8%' }}
      >
        <img
          src={imageUrl}
          alt="Phone wallpaper screen"
          className="w-full h-full object-cover select-none pointer-events-none"
        />

        {/* Live Wallpaper Effects */}
        {effect === "petals" && <PetalsOverlay />}
        {effect === "aura" && <AuraOverlay />}
        {effect === "flame" && <FlameOverlay />}
        {effect === "shimmer" && <ShimmerOverlay />}

        {/* Screen Content Overlays */}
        {previewMode === "lock" ? (
          <div className="absolute inset-0 flex flex-col justify-between p-2 md:p-4 pb-3 md:pb-6 text-white font-sans z-10">
            {/* Date & Time */}
            <div className="flex flex-col items-center mt-3 md:mt-7 space-y-0.5 drop-shadow-[0_2px_8px_rgba(0,0,0,0.5)]">
              <span className="text-[5px] md:text-[8px] font-bold tracking-wide uppercase">{dateStr || "Tuesday, 21 May"}</span>
              <span className="text-lg md:text-3xl font-extrabold font-sans tracking-tight leading-none">{time}</span>
            </div>

            {/* Bottom Widgets */}
            <div className="flex flex-col items-center gap-2 md:gap-4 mt-auto">
              <div className="flex justify-between w-full px-1 md:px-2">
                {/* Flashlight */}
                <div className="w-5 h-5 md:w-8 md:h-8 rounded-full bg-black/40 backdrop-blur-md flex items-center justify-center text-white/90 shadow-lg border border-white/5 active:scale-90 transition-transform">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="w-2.5 h-2.5 md:w-4 md:h-4">
                    <path d="M18 6h-2M15 2h-6a2 2 0 00-2 2v2h10V4a2 2 0 00-2-2zM6 10h12v9a3 3 0 01-3 3H9a3 3 0 01-3-3v-9zM12 13v3" />
                  </svg>
                </div>
                {/* Camera */}
                <div className="w-5 h-5 md:w-8 md:h-8 rounded-full bg-black/40 backdrop-blur-md flex items-center justify-center text-white/90 shadow-lg border border-white/5 active:scale-90 transition-transform">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="w-2.5 h-2.5 md:w-4 md:h-4">
                    <path d="M23 19a2 2 0 01-2 2H3a2 2 0 01-2-2V8a2 2 0 012-2h4l2-3h6l2 3h4a2 2 0 012 2zM12 17a4 4 0 100-8 4 4 0 000 8z" />
                  </svg>
                </div>
              </div>

              {/* Home indicator bar */}
              <div className="w-10 md:w-16 h-[1.5px] md:h-[3.5px] bg-white/80 rounded-full drop-shadow-md" />
            </div>
          </div>
        ) : (
          <div className="absolute inset-0 flex flex-col justify-end p-2 md:p-3 pb-3 md:pb-6 text-white z-10">
            {/* App Grid */}
            <div className="grid grid-cols-4 gap-x-1.5 gap-y-2 px-1 mt-4 md:mt-8">
              {[
                { label: "दर्शन", icon: "🕉" },
                { label: "पूजा", icon: "🔱" },
                { label: "आरती", icon: "🔔" },
                { label: "मंत्र", icon: "📿" },
                { label: "कथा", icon: "📖" },
                { label: "संगीत", icon: "🎵" },
                { label: "गैलरी", icon: "🖼" },
                { label: "सेटिंग्स", icon: "⚙" }
              ].map((app, idx) => (
                <div key={idx} className="flex flex-col items-center gap-0.5">
                  <div className="w-4 h-4 md:w-7 md:h-7 rounded-[3px] md:rounded-[7px] bg-white/20 backdrop-blur-xs border border-white/10 flex items-center justify-center text-[8px] md:text-sm shadow-sm hover:bg-white/35 transition-colors">
                    {app.icon}
                  </div>
                  <span className="text-[4px] md:text-[7px] font-sans font-medium text-white/95 truncate max-w-[18px] md:max-w-[32px] tracking-tight">
                    {app.label}
                  </span>
                </div>
              ))}
            </div>

            {/* Google Search Pill */}
            <div className="w-[90%] py-1 md:py-1.5 px-2 md:px-3 rounded-full bg-black/45 backdrop-blur-lg border border-white/10 flex items-center gap-1 shadow-lg drop-shadow-md mx-auto mt-auto mb-2">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" className="w-1.5 md:w-3 h-1.5 md:h-3 text-white/70">
                <circle cx="11" cy="11" r="8" />
                <path d="m21 21-4.3-4.3" />
              </svg>
              <span className="text-[5px] md:text-[8px] font-sans font-bold text-white/70 tracking-wide">
                {isHi ? "खोजें..." : "Search..."}
              </span>
            </div>

            {/* Bottom App Dock */}
            <div className="w-[90%] mx-auto bg-white/15 backdrop-blur-md rounded-md md:rounded-xl p-0.5 md:p-1 flex justify-around border border-white/10 mb-1">
              {["🕉", "🔱", "🔔", "📿"].map((icon, idx) => (
                <div key={idx} className="w-3.5 h-3.5 md:w-6 md:h-6 rounded-[3px] md:rounded-[6px] bg-white/25 flex items-center justify-center text-[7px] md:text-xs shadow-xs">
                  {icon}
                </div>
              ))}
            </div>

            {/* Home indicator bar */}
            <div className="w-10 md:w-16 h-[1.5px] md:h-[3.5px] bg-white/80 rounded-full mx-auto drop-shadow-md" />
          </div>
        )}
      </div>

      {/* Phone Bezel SVG Frame Overlay */}
      <svg
        viewBox="0 0 361.74 745.52"
        className="absolute inset-0 w-full h-full pointer-events-none z-20 drop-shadow-[0_15px_40px_rgba(0,0,0,0.8)]"
        xmlns="http://www.w3.org/2000/svg"
        xmlSpace="preserve"
        style={{
          shapeRendering: "geometricPrecision",
          textRendering: "geometricPrecision",
          imageRendering: "optimizeQuality",
          fillRule: "evenodd",
          clipRule: "evenodd",
        }}
      >
        <defs>
          <style type="text/css">
            {`
              .fil2 {fill:black}
              .fil0 {fill:#070707}
              .fil5 {fill:#122735}
              .fil1 {fill:#151515}
              .fil4 {fill:#38383A}
              .fil3 {fill:#B1B1B1}
            `}
          </style>
        </defs>
        <g id="Layer_x0020_1">
          <metadata id="CorelCorpID_0Corel-Layer" />
          <path className="fil0" d="M354.84 694.31c0.04,4.56 -1.36,10.48 -2.64,14.25 -1.02,3 -2.39,5.89 -4.09,8.57l-7.33 9.6c-0.65,0.66 -1.14,0.69 -1.75,1.33l-1.07 1.05c-0.48,0.36 -0.19,0.2 -0.61,0.54l-6.28 4.27c-0.92,0.68 -4.53,2.44 -5.65,2.81 -3.1,1.03 -6.53,2.38 -9.89,2.77 -1.24,0.14 -2.65,0.46 -3.75,0.51 -1.36,0.06 -2.59,0.05 -4,0.05l-245.13 0c-5.35,0 -11.12,0.42 -16.04,-0.74 -2.43,-0.57 -4.51,-0.9 -6.69,-1.72 -3.48,-1.31 -6.15,-2.73 -9.28,-4.39 -1.22,-0.65 -3.13,-2.1 -3.95,-2.75 -0.03,-0.03 -0.08,-0.06 -0.11,-0.09 -0.03,-0.02 -0.07,-0.06 -0.1,-0.09l-1.37 -1.13c-0.03,-0.03 -0.07,-0.07 -0.09,-0.1 -0.03,-0.03 -0.07,-0.07 -0.1,-0.09l-1.01 -0.71c-0.32,-0.29 -0.64,-0.77 -0.98,-1.12 -1.02,-1.05 -2.35,-1.96 -3.16,-3.19l-3.64 -4.82c-4.79,-7.5 -7.89,-15.41 -7.88,-25.76l0 -608.58c0,-11.21 -0.18,-22.57 0,-33.76 0.12,-7.31 1.91,-13.62 5.08,-19.99l6.82 -10.09c0.29,-0.32 0.79,-0.66 1.13,-0.99 0.96,-0.94 2.16,-2.49 3.19,-3.14l1.81 -1.46c0.03,-0.03 0.07,-0.07 0.1,-0.09l0.42 -0.35c0.03,-0.02 0.08,-0.06 0.11,-0.08l0.44 -0.32c0.03,-0.02 0.08,-0.06 0.11,-0.08l2.37 -1.67c0.5,-0.42 -0.01,-0.09 0.68,-0.46l2.72 -1.54c5.33,-2.57 8.3,-3.47 14.18,-4.85 3.85,-0.9 11.68,-0.52 16.21,-0.52l236.67 0c8.03,0 15.34,-0.38 22.75,2.45 1.07,0.41 1.97,0.75 3.05,1.18 2.17,0.86 6.77,3.29 8.44,4.62 0.03,0.02 0.07,0.06 0.1,0.09l3.79 2.94c0.91,0.81 0.44,0.58 1.76,1.5 0.4,0.28 0.7,0.65 1.08,1.03l2.94 3.42c0.34,0.36 0.14,0.14 0.44,0.52l3.63 5.41c0.23,0.34 0.07,0.07 0.24,0.32l1.5 2.73c3.12,6.57 4.81,12.85 4.85,20.49 0.19,33.83 0,67.67 0,101.51l0 473.25c0,22.45 -0.2,45.11 -0.01,67.47zm-337.37 -677.78c8.87,-8.65 18.54,-14.77 35.7,-15.98 5.75,-0.4 19.23,-0.34 25.62,-0.34l206.87 0.1c7.99,0 17.34,-0.3 24.82,0.85 7.23,1.11 13.83,3.12 20.06,5.89 12.58,5.6 19.71,14.51 24.41,27.11 1.26,3.37 2.01,6.55 2.74,10.12 0.54,2.68 0.93,5.83 1.15,8.6l-0.12 2.98c-0.01,-9.39 -3.51,-19.66 -8.28,-27.39 -3.07,-4.97 -9.12,-11.23 -14.14,-14.5 -0.68,-0.44 -1.23,-0.88 -1.92,-1.33l-6.23 -3.41c-7.83,-4.09 -22.02,-7.38 -31.16,-7.39l-243.4 -0.38c-7.36,-0.01 -14.78,2.34 -20.65,5.03 -8.91,4.09 -13.02,8.68 -15.49,10.07zm-16.54 75.98c-1.57,0.67 -0.69,3.77 -0.66,6.67l-0 15.78c-0.28,7 -0.95,6.66 2.68,6.68l-0 34.28c-3.46,0.03 -2.87,-0.44 -2.85,6.13 0.01,2.27 0.17,4.31 0.17,6.73 0,12.41 0.16,25.92 -0.18,38.25 -0.05,1.94 -0.23,1.44 0.65,2.57l2.21 0 -0 13.6c-1.46,-0 -2.23,-0.51 -2.74,0.55 -0.45,0.94 0.05,9.16 0.05,10.57l0 29.22c0,2.56 -0.16,4.64 -0.17,7.11 -0.04,6.62 -0.59,6.11 2.85,6.12 -0.15,139.17 -0,278.37 0,417.54 0,15.5 5.36,26.01 14.03,35.66 0.4,0.45 0.81,0.83 1.25,1.25 5.2,5.04 12.34,9.3 19.45,11.7 5.96,2.01 11.43,2.52 18.44,2.52l62.48 -0.05c13.87,0 27.87,-0.19 41.72,0 6.98,0.09 13.97,0.05 20.96,0.05 6.84,0 13.96,0.19 20.76,-0.03 6.85,-0.22 14.06,-0.02 20.96,-0.02l83.63 0.05c12.46,0 22.34,-2.28 32.31,-9.41 2.32,-1.66 6.61,-5.23 8.22,-7.35 0.43,-0.56 0.84,-0.92 1.25,-1.45 6.86,-8.85 11.68,-18.52 11.67,-32.54l0 -291.98c0,-55.65 0.16,-111.32 -0,-166.96 2.2,0 1.59,-1.49 1.59,-3.54 0,-1.73 0.02,-3.46 0.01,-5.19 -0.01,-3.48 -0.17,-6.77 -0.17,-10.38l0 -41.9c0,-3.58 0.16,-6.96 0.17,-10.38 0.01,-1.73 -0.01,-3.46 -0.01,-5.19 0.01,-4.24 -0.27,-2.43 -1.6,-3.46l0 -94.76c0,-12.08 0.52,-21.71 -5.17,-32.7 -3.19,-6.16 -5.31,-8.9 -9.92,-13.73 -1.4,-1.47 -1.66,-1.46 -2.52,-2.29 -0.83,-0.8 -1.74,-1.5 -2.66,-2.15l-5.7 -3.72c-1.05,-0.62 -1.97,-1.03 -3.07,-1.55 -7.67,-3.66 -14.86,-4.8 -23.65,-4.8l-245.71 0c-12.16,-0 -20.93,-0.1 -31.97,5.91 -6.07,3.3 -6.55,4.25 -11.09,7.95l-3.46 3.65c-4.96,6.09 -8.51,12.02 -10.61,20.15 -1.56,6.04 -1.61,10.51 -1.61,17.13 0,12.57 0.01,25.14 -0,37.7l-2.02 0.02z" />
          <path className="fil1" d="M352.17 695.66c-0.7,8.07 -3.7,16.42 -8.46,22.87 -1.67,2.26 -2.85,3.6 -4.81,5.56 -2.55,2.55 -3.75,3.61 -6.8,5.69 -0.85,0.58 -1.67,1.13 -2.6,1.63 -13.23,7.14 -19.43,6.32 -35.57,6.32l-234.36 0c-5.74,0 -10.12,-0.26 -15.07,-1.65 -4.03,-1.12 -8.59,-3.05 -11.68,-5.05 -6.84,-4.43 -12.61,-9.92 -16.48,-17.14 -5.35,-10 -5.7,-16.62 -5.7,-27.86l0 -619.53c0,-5.37 -0.3,-11.67 0.16,-16.91 1.67,-18.78 14.47,-32.81 28.38,-38.43 10.17,-4.11 18.01,-3.46 29.99,-3.46l234.36 0c10.79,0 18.8,1.87 26.71,6.73 6.76,4.15 12.39,9.99 16.44,17.18 5.18,9.21 5.67,17.21 5.67,27.78l0 619.53c0,5.37 0.26,11.58 -0.19,16.72zm2.67 -1.35c-0.19,-22.36 0.01,-45.02 0.01,-67.47l0 -473.25c0,-33.83 0.19,-67.67 -0,-101.51 -0.04,-7.64 -1.73,-13.92 -4.85,-20.49l-1.5 -2.73c-0.18,-0.26 -0.01,0.02 -0.24,-0.32l-3.63 -5.41c-0.3,-0.39 -0.09,-0.17 -0.44,-0.52l-2.94 -3.42c-0.38,-0.38 -0.67,-0.75 -1.08,-1.03 -1.32,-0.93 -0.85,-0.7 -1.76,-1.5l-3.79 -2.94c-0.03,-0.03 -0.07,-0.06 -0.1,-0.09 -1.68,-1.34 -6.27,-3.76 -8.44,-4.62 -1.08,-0.43 -1.98,-0.77 -3.05,-1.18 -7.41,-2.82 -14.72,-2.45 -22.75,-2.45l-236.67 0c-4.53,0 -12.35,-0.38 -16.21,0.52 -5.87,1.38 -8.84,2.28 -14.18,4.85l-2.72 1.54c-0.68,0.37 -0.18,0.03 -0.68,0.46l-2.37 1.67c-0.03,0.02 -0.08,0.06 -0.11,0.08l-0.44 0.32c-0.03,0.02 -0.08,0.06 -0.11,0.08l-0.42 0.35c-0.03,0.03 -0.07,0.07 -0.1,0.09l-1.81 1.46c-1.03,0.66 -2.24,2.21 -3.19,3.14 -0.34,0.33 -0.84,0.68 -1.13,0.99l-6.82 10.09c-3.16,6.37 -4.95,12.68 -5.08,19.99 -0.19,11.19 -0,22.55 -0,33.76l0 608.58c-0.01,10.35 3.09,18.26 7.88,25.76l3.64 4.82c0.81,1.24 2.14,2.14 3.16,3.19 0.34,0.35 0.66,0.83 0.98,1.12l1.01 0.71c0.03,0.03 0.07,0.07 0.1,0.09 0.03,0.03 0.07,0.07 0.09,0.1l1.37 1.13c0.03,0.03 0.07,0.06 0.1,0.09 0.03,0.03 0.08,0.06 0.11,0.09 0.82,0.65 2.73,2.1 3.95,2.75 3.13,1.66 5.79,3.08 9.28,4.39 2.18,0.82 4.26,1.15 6.69,1.72 4.92,1.15 10.7,0.74 16.04,0.74l245.13 0c1.41,-0 2.64,0.01 4,-0.05 1.1,-0.04 2.51,-0.36 3.75,-0.51 3.37,-0.39 6.79,-1.74 9.89,-2.77 1.13,-0.37 4.73,-2.13 5.65,-2.81l6.28 -4.27c0.42,-0.34 0.13,-0.18 0.61,-0.54l1.07 -1.05c0.61,-0.64 1.11,-0.66 1.75,-1.33l7.33 -9.6c1.7,-2.68 3.07,-5.57 4.09,-8.57 1.28,-3.76 2.68,-9.69 2.64,-14.25z" />
          <path className="fil2" d="M204.14 26.24c0.58,-2.17 3.87,-3.61 6.06,-3.26l1.02 0.35c2.1,0.33 5.44,3.45 3.19,8.05 -0.45,0.92 -1.27,1.69 -2.3,2.18 -1.09,0.52 -2.4,0.75 -3.71,0.52 -1.75,-0.31 -3.3,-1.35 -3.95,-2.69 -0.8,-1.65 -1.19,-3.55 -0.31,-5.15zm-57.19 -10.95c-13.53,2.24 -15.25,19.52 -3.76,24.91 3.76,1.77 8.61,1.23 13.27,1.23l43.83 0c9.24,0 18.27,1.9 23.45,-5.48 4.63,-6.6 2.57,-15.82 -5.05,-19.54 -3.66,-1.79 -8.8,-1.22 -13.4,-1.22 -2.01,0 -56.24,-0.25 -58.35,0.1z" />
          <path className="fil3" d="M17.47 16.53c2.47,-1.39 6.58,-5.98 15.49,-10.07 5.87,-2.69 13.29,-5.04 20.65,-5.03l243.4 0.38c9.14,0.01 23.33,3.3 31.16,7.39l6.23 3.41c0.69,0.45 1.24,0.89 1.92,1.33 5.02,3.27 11.08,9.53 14.14,14.5 4.77,7.73 8.27,18 8.28,27.39l0.12 -2.98c-0.22,-2.76 -0.61,-5.91 -1.15,-8.6 -0.72,-3.57 -1.48,-6.74 -2.74,-10.12 -4.71,-12.6 -11.83,-21.5 -24.41,-27.11 -6.23,-2.77 -12.83,-4.78 -20.06,-5.89 -7.48,-1.15 -16.83,-0.85 -24.82,-0.85l-206.87 -0.1c-6.39,0 -19.88,-0.06 -25.62,0.34 -17.16,1.21 -26.84,7.33 -35.7,15.98z" />
          <path className="fil4" d="M204.14 26.24c-0.88,1.6 -0.49,3.51 0.31,5.15 0.65,1.35 2.2,2.39 3.95,2.69 1.3,0.23 2.61,0 3.71,-0.52 1.03,-0.49 1.85,-1.26 2.3,-2.18 2.25,-4.6 -1.09,-7.72 -3.19,-8.05l-0.49 0.15 0.74 0.92c-0.26,0.8 -0.08,0.08 -0.48,0.78 2.04,0.53 1.8,4.5 1.06,4.43l-0.26 -0.02c-0.62,-0.18 -0.12,-0.51 -1.17,-0.38 -0.41,0.8 -0.22,0.84 0.16,1.24l0.38 0.38c-2.49,1.05 -4.42,0.2 -4.84,-2.14 -0.42,0.83 -0.78,0.28 -1.09,-0.17l-0.31 0.74c-0.03,-0.04 -0.08,-0.09 -0.1,-0.11 -0.02,-0.02 -0.07,-0.08 -0.1,-0.11 -0.03,-0.03 -0.07,-0.07 -0.1,-0.1 -0.03,-0.03 -0.07,-0.07 -0.1,-0.1 -0.95,-1.06 -0.15,-1.93 -0.38,-2.62z" />
          <path className="fil5" d="M204.14 26.24c0.23,0.69 -0.57,1.56 0.38,2.62 0.03,0.03 0.07,0.07 0.1,0.1 0.03,0.03 0.07,0.07 0.1,0.1 0.03,0.03 0.08,0.08 0.1,0.11 0.02,0.02 0.07,0.07 0.1,0.11l0.31 -0.74c0.32,0.44 0.67,1 1.09,0.17 0.42,2.34 2.35,3.19 4.84,2.14l-0.38 -0.38c-0.38,-0.4 -0.57,-0.44 -0.16,-1.24 1.05,-0.13 0.55,0.19 1.17,0.38l0.26 0.02c0.75,0.07 0.99,-3.9 -1.06,-4.43 0.4,-0.71 0.22,0.02 0.48,-0.78l-0.74 -0.92 0.49 -0.15 -1.02 -0.35c-2.2,-0.35 -5.48,1.08 -6.06,3.26z" />
        </g>
      </svg>
    </div>
  );
};

export default function BlessingsPage() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const { language } = useLanguage();
  const { profile } = useAuth();
  const { setBhajanModalOpen } = useBhajanModalOpen();
  const isHi = language === "hi";

  const userTier = profile?.subscription_tier || "free";

  // Today's deity resolution
  const todayDay = new Date().getDay();
  const todayDarshan = DAILY_DARSHANS[todayDay] || DAILY_DARSHANS[1];

  // UI state variables
  const tabParam = searchParams.get("tab");
  const [activeTab, setActiveTab] = useState<"maker" | "wallpapers" | "saved">(
    () => (tabParam === "maker" || tabParam === "wallpapers" || tabParam === "saved") ? tabParam : "wallpapers"
  );

  const [showLivePreviewModal, setShowLivePreviewModal] = useState<string | null>(null);
  const [showPreviewModal, setShowPreviewModal] = useState<string | null>(null);
  const [shareModalData, setShareModalData] = useState<{ url: string; title: string; text: string; wpName?: string } | null>(null);
  const [copiedState, setCopiedState] = useState(false);

  useEffect(() => {
    setSearchParams(prev => {
      const next = new URLSearchParams(prev);
      if (next.get("tab") !== activeTab) {
        next.set("tab", activeTab);
      }
      return next;
    });
  }, [activeTab, setSearchParams]);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "instant" });
  }, [activeTab]);

  // Synchronize URL search params with open preview modals on mount/URL change
  useEffect(() => {
    const wpId = searchParams.get("wpId");
    if (wpId) {
      if (wpId.startsWith("live-")) {
        const wp = LIVE_WALLPAPERS_LIST.find((w) => w.id === wpId);
        if (wp && showLivePreviewModal !== wpId) {
          setShowLivePreviewModal(wpId);
          setShowPreviewModal(null);
        }
      } else {
        const wp = WALLPAPERS_LIST.find((w) => w.id === wpId);
        if (wp && showPreviewModal !== wpId) {
          setShowPreviewModal(wpId);
          setShowLivePreviewModal(null);
        }
      }
    }
  }, [searchParams]);

  // Synchronize open modals with URL search params when modals are opened/closed
  useEffect(() => {
    setSearchParams(prev => {
      const next = new URLSearchParams(prev);
      const openId = showPreviewModal || showLivePreviewModal;
      if (openId) {
        if (next.get("wpId") !== openId) {
          next.set("wpId", openId);
        }
      } else {
        if (next.has("wpId")) {
          next.delete("wpId");
        }
      }
      return next;
    });
  }, [showPreviewModal, showLivePreviewModal, setSearchParams]);

  const [userName, setUserName] = useState("");
  const [blessingType, setBlessingType] = useState<"self" | "parents" | "family" | "friends" | "universal">("self");
  const [userPhoto, setUserPhoto] = useState<string | null>(null);
  const [selectedTemplate, setSelectedTemplate] = useState<"golden" | "crimson" | "peacock" | "white">("golden");
  const [generationType, setGenerationType] = useState<"status" | "square">("status");
  const [savedBlessings, setSavedBlessings] = useState<string[]>([]);
  const [streakCount, setStreakCount] = useState(0);
  const [completedDates, setCompletedDates] = useState<string[]>([]);
  const [selectedDeityFilter, setSelectedDeityFilter] = useState<string | null>(null);
  const [wallpaperType, setWallpaperType] = useState<'static' | 'live'>('static');
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [showPremiumTplModal, setShowPremiumTplModal] = useState<string | null>(null);

  // Phone Mockup Preview Settings
  const [previewMode, setPreviewMode] = useState<"lock" | "home">("lock");
  const touchStartX = useRef<number | null>(null);

  // Saved wallpapers in local collection
  const [savedWallpapers, setSavedWallpapers] = useState<string[]>(() => {
    try {
      const stored = localStorage.getItem("hk_saved_wallpapers");
      return stored ? JSON.parse(stored) : [];
    } catch (_) {
      return [];
    }
  });

  const toggleSaveWallpaper = (id: string) => {
    const isSaved = savedWallpapers.includes(id);
    let updated;
    if (isSaved) {
      updated = savedWallpapers.filter(wId => wId !== id);
      toast.success(isHi ? "संग्रह से हटा दिया गया!" : "Removed from collection!");
    } else {
      updated = [...savedWallpapers, id];
      toast.success(isHi ? "संग्रह में सहेजा गया!" : "Saved to collection!");
    }
    setSavedWallpapers(updated);
    localStorage.setItem("hk_saved_wallpapers", JSON.stringify(updated));
  };

  // Search filtering logic
  const filteredWallpapers = React.useMemo(() => {
    let list = WALLPAPERS_LIST;
    if (selectedDeityFilter) {
      if (selectedDeityFilter === "Radha") {
        list = WALLPAPERS_LIST.filter(wp => wp.id === "wp-krishna-2" || wp.deity === "Krishna");
      } else {
        list = WALLPAPERS_LIST.filter(wp => wp.deity === selectedDeityFilter);
      }
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      list = list.filter(wp => 
        wp.name.toLowerCase().includes(q) || 
        wp.nameHindi.includes(q) || 
        wp.deity.toLowerCase().includes(q)
      );
    }
    return list;
  }, [selectedDeityFilter, searchQuery]);

  const filteredLiveWallpapers = React.useMemo(() => {
    let list = LIVE_WALLPAPERS_LIST;
    if (selectedDeityFilter) {
      if (selectedDeityFilter === "Radha") {
        list = LIVE_WALLPAPERS_LIST.filter(wp => wp.id === "live-krishna-1" || wp.deity === "Krishna");
      } else {
        list = LIVE_WALLPAPERS_LIST.filter(wp => wp.deity === selectedDeityFilter);
      }
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      list = list.filter(wp => 
        wp.name.toLowerCase().includes(q) || 
        wp.nameHindi.includes(q) || 
        wp.deity.toLowerCase().includes(q)
      );
    }
    return list;
  }, [selectedDeityFilter, searchQuery]);

  // Swiping navigation handlers
  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
  };

  const handleTouchEnd = (e: React.TouchEvent, list: any[], currentId: string, setCurrentId: (id: string) => void) => {
    if (touchStartX.current === null) return;
    const diffX = touchStartX.current - e.changedTouches[0].clientX;
    touchStartX.current = null;

    if (Math.abs(diffX) < 50) return; // threshold

    const idx = list.findIndex(w => w.id === currentId);
    if (idx === -1) return;

    if (diffX > 0) {
      // swipe left -> next
      const nextIdx = (idx + 1) % list.length;
      setCurrentId(list[nextIdx].id);
    } else {
      // swipe right -> prev
      const prevIdx = (idx - 1 + list.length) % list.length;
      setCurrentId(list[prevIdx].id);
    }
  };

  // Navigations next/prev arrows
  const navigateWallpaper = (dir: 'next' | 'prev', list: any[], currentId: string, setCurrentId: (id: string) => void) => {
    const idx = list.findIndex(w => w.id === currentId);
    if (idx === -1) return;
    if (dir === 'next') {
      const nextIdx = (idx + 1) % list.length;
      setCurrentId(list[nextIdx].id);
    } else {
      const prevIdx = (idx - 1 + list.length) % list.length;
      setCurrentId(list[prevIdx].id);
    }
  };

  const getDeityEmoji = (deity: string) => {
    switch (deity) {
      case "Shiva": return "🔱";
      case "Rama": return "🏹";
      case "Krishna": return "🪈";
      case "Hanuman": return "🔥";
      case "Ganesha": return "🪷";
      case "Lakshmi": return "🪷";
      default: return "🕉️";
    }
  };

  const getDeityHindi = (deity: string) => {
    switch (deity) {
      case "Shiva": return "शिव";
      case "Rama": return "राम";
      case "Krishna": return "कृष्ण";
      case "Hanuman": return "हनुमान";
      case "Ganesha": return "गणेश";
      case "Lakshmi": return "लक्ष्मी";
      default: return deity;
    }
  };

  // Prevent background scrolling
  useEffect(() => {
    const hasDocument = typeof document !== "undefined";
    const body = hasDocument ? document.body : null;
    const docEl = hasDocument ? document.documentElement : null;

    if (showPreviewModal || showLivePreviewModal || showPremiumTplModal) {
      if (body) body.style.overflow = "hidden";
      if (docEl) docEl.style.overflow = "hidden";
    } else {
      if (body) body.style.overflow = "";
      if (docEl) docEl.style.overflow = "";
    }
    return () => {
      if (body) body.style.overflow = "";
      if (docEl) docEl.style.overflow = "";
    };
  }, [showPreviewModal, showLivePreviewModal, showPremiumTplModal]);

  // Wire modal visibility to app context to hide FAB Narad assistant
  useEffect(() => {
    setBhajanModalOpen(!!(showPreviewModal || showLivePreviewModal || showPremiumTplModal));
    return () => setBhajanModalOpen(false);
  }, [showPreviewModal, showLivePreviewModal, showPremiumTplModal, setBhajanModalOpen]);

  // Refs
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const droneRef = useRef<TempleDrone | null>(null);

  // Initial load
  useEffect(() => {
    try {
      const stored = localStorage.getItem("hk_saved_blessings_v2");
      if (stored) setSavedBlessings(JSON.parse(stored));

      const storedDates = localStorage.getItem("hk_completed_dates_v1");
      if (storedDates) setCompletedDates(JSON.parse(storedDates));

      const lastDate = localStorage.getItem("hk_streak_date_v1");
      const currentStreak = Number(localStorage.getItem("hk_streak_count_v1") || "0");
      const todayString = new Date().toISOString().split("T")[0];

      if (lastDate === todayString) {
        setStreakCount(currentStreak);
      } else {
        const yesterday = new Date();
        yesterday.setDate(yesterday.getDate() - 1);
        const yesterdayString = yesterday.toISOString().split("T")[0];
        
        if (lastDate === yesterdayString) {
          setStreakCount(currentStreak);
        } else {
          setStreakCount(currentStreak > 0 ? currentStreak : 0);
        }
      }
    } catch (_) {}

    droneRef.current = new TempleDrone();
    return () => {
      droneRef.current?.stop();
    };
  }, []);

  // Compute current week's dates (Sunday to Saturday)
  const getWeekDates = () => {
    const current = new Date();
    const first = current.getDate() - current.getDay();
    const week = [];
    for (let i = 0; i < 7; i++) {
      const tempDate = new Date(current.getFullYear(), current.getMonth(), first + i);
      week.push(tempDate.toISOString().split("T")[0]);
    }
    return week;
  };
  const weekDates = getWeekDates();
  const todayDateString = new Date().toISOString().split("T")[0];

  // Complete Nitya Sadhana activity
  const completeTodaySadhana = () => {
    const todayStr = new Date().toISOString().split("T")[0];
    if (completedDates.includes(todayStr)) return; // Already done

    const newDates = [...completedDates, todayStr];
    setCompletedDates(newDates);
    localStorage.setItem("hk_completed_dates_v1", JSON.stringify(newDates));

    // Calculate/update streak
    let currentStreak = Number(localStorage.getItem("hk_streak_count_v1") || "0");
    const lastDate = localStorage.getItem("hk_streak_date_v1");
    
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayString = yesterday.toISOString().split("T")[0];

    if (lastDate === yesterdayString || currentStreak === 0 || lastDate === null) {
      currentStreak += 1;
    } else if (lastDate !== todayStr) {
      currentStreak = 1; // broken
    }

    setStreakCount(currentStreak);
    localStorage.setItem("hk_streak_count_v1", String(currentStreak));
    localStorage.setItem("hk_streak_date_v1", todayStr);

    toast.success(
      isHi 
        ? `दैनिक दर्शन पूर्ण! साधना सूत्र +1 दिन (${currentStreak} दिन streak) 🪔` 
        : `Nitya Darshan Complete! Sadhana streak +1 (${currentStreak} days streak) 🪔`
    );
  };

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          setUserPhoto(event.target.result as string);
          toast.success(isHi ? "फ़ोटो अपलोड की गई!" : "Photo uploaded successfully!");
        }
      };
      reader.readAsDataURL(file);
    }
  };

  // Helper check for premium themes
  const isTemplatePremium = (tpl: string) => {
    if (tpl === "crimson" && userTier === "free") return true;
    if (tpl === "peacock" && userTier !== "mahabhakt") return true;
    return false;
  };

  // Render corners in canvas
  const drawCanvasCorners = (ctx: CanvasRenderingContext2D, w: number, h: number, pad: number, color: string) => {
    const size = 32;
    const drawCornerArc = (x: number, y: number) => {
      ctx.fillStyle = color;
      ctx.beginPath();
      ctx.arc(x, y, 6, 0, Math.PI * 2);
      ctx.fill();
    };

    ctx.strokeStyle = color;
    ctx.lineWidth = 4;
    
    // Top Left
    ctx.beginPath();
    ctx.moveTo(pad, pad + size);
    ctx.lineTo(pad, pad);
    ctx.lineTo(pad + size, pad);
    ctx.stroke();
    drawCornerArc(pad + 8, pad + 8);

    // Top Right
    ctx.beginPath();
    ctx.moveTo(w - pad, pad + size);
    ctx.lineTo(w - pad, pad);
    ctx.lineTo(w - pad - size, pad);
    ctx.stroke();
    drawCornerArc(w - pad - 8, pad + 8);

    // Bottom Left
    ctx.beginPath();
    ctx.moveTo(pad, h - pad - size);
    ctx.lineTo(pad, h - pad);
    ctx.lineTo(pad + size, h - pad);
    ctx.stroke();
    drawCornerArc(pad + 8, h - pad - 8);

    // Bottom Right
    ctx.beginPath();
    ctx.moveTo(w - pad, h - pad - size);
    ctx.lineTo(w - pad, h - pad);
    ctx.lineTo(w - pad - size, h - pad);
    ctx.stroke();
    drawCornerArc(w - pad - 8, h - pad - 8);
  };

  // Core Canvas Rendering Engine
  const compileBlessingCard = (): Promise<string> => {
    return new Promise((resolve, reject) => {
      const canvas = canvasRef.current;
      if (!canvas) {
        toast.error("Graphics compiler not initialized.");
        return reject("No canvas context");
      }
      const ctx = canvas.getContext("2d");
      if (!ctx) return reject("No 2d context");

      const tpl = selectedTemplate;
      const aspect = generationType; // vertical/square
      
      const w = 1080;
      const h = aspect === "square" ? 1080 : 1920;
      canvas.width = w;
      canvas.height = h;

      // Draw backdrop base
      ctx.fillStyle = "#120603";
      ctx.fillRect(0, 0, w, h);

      // Load Deity Image
      const deityImg = new Image();
      deityImg.crossOrigin = "anonymous";
      deityImg.src = todayDarshan.imageUrl;
      
      deityImg.onload = () => {
        const imageRatio = deityImg.width / deityImg.height;
        const canvasRatio = w / h;
        let drawWidth = w;
        let drawHeight = h;
        let drawX = 0;
        let drawY = 0;

        if (imageRatio > canvasRatio) {
          drawWidth = h * imageRatio;
          drawX = (w - drawWidth) / 2;
        } else {
          drawHeight = w / imageRatio;
          drawY = (h - drawHeight) / 2;
        }

        ctx.drawImage(deityImg, drawX, drawY, drawWidth, drawHeight);

        // Apply theme color gradients overlay
        const grad = ctx.createLinearGradient(0, h * 0.2, 0, h);
        if (tpl === "crimson") {
          grad.addColorStop(0, "rgba(22, 5, 8, 0.15)");
          grad.addColorStop(0.6, "rgba(55, 10, 18, 0.82)");
          grad.addColorStop(1, "rgba(24, 4, 8, 0.98)");
        } else if (tpl === "peacock") {
          grad.addColorStop(0, "rgba(2, 18, 16, 0.15)");
          grad.addColorStop(0.6, "rgba(4, 44, 40, 0.84)");
          grad.addColorStop(1, "rgba(2, 20, 18, 0.98)");
        } else if (tpl === "white") {
          grad.addColorStop(0, "rgba(255, 255, 255, 0.04)");
          grad.addColorStop(0.55, "rgba(22, 28, 45, 0.78)");
          grad.addColorStop(1, "rgba(10, 15, 30, 0.96)");
        } else { // golden
          grad.addColorStop(0, "rgba(18, 8, 4, 0.15)");
          grad.addColorStop(0.5, "rgba(28, 12, 4, 0.82)");
          grad.addColorStop(1, "rgba(15, 5, 2, 0.98)");
        }
        ctx.fillStyle = grad;
        ctx.fillRect(0, 0, w, h);

        // Draw Borders
        const borderPadding = aspect === "square" ? 22 : 36;
        if (tpl === "golden") {
          ctx.strokeStyle = "#fbbf24";
          ctx.lineWidth = aspect === "square" ? 18 : 28;
          ctx.strokeRect(ctx.lineWidth / 2, ctx.lineWidth / 2, w - ctx.lineWidth, h - ctx.lineWidth);
          
          ctx.strokeStyle = "rgba(255, 255, 255, 0.15)";
          ctx.lineWidth = 2;
          ctx.strokeRect(borderPadding, borderPadding, w - borderPadding * 2, h - borderPadding * 2);
          drawCanvasCorners(ctx, w, h, borderPadding, "#fbbf24");
        } else if (tpl === "crimson") {
          ctx.strokeStyle = "#b91c1c"; // deep crimson
          ctx.lineWidth = aspect === "square" ? 18 : 28;
          ctx.strokeRect(ctx.lineWidth / 2, ctx.lineWidth / 2, w - ctx.lineWidth, h - ctx.lineWidth);
          
          ctx.strokeStyle = "#fbbf24";
          ctx.lineWidth = 3;
          ctx.strokeRect(borderPadding, borderPadding, w - borderPadding * 2, h - borderPadding * 2);
          drawCanvasCorners(ctx, w, h, borderPadding, "#fbbf24");
        } else if (tpl === "peacock") {
          ctx.strokeStyle = "#0f766e"; // peacock teal
          ctx.lineWidth = aspect === "square" ? 18 : 28;
          ctx.strokeRect(ctx.lineWidth / 2, ctx.lineWidth / 2, w - ctx.lineWidth, h - ctx.lineWidth);
          
          ctx.strokeStyle = "#f59e0b";
          ctx.lineWidth = 3;
          ctx.strokeRect(borderPadding, borderPadding, w - borderPadding * 2, h - borderPadding * 2);
          drawCanvasCorners(ctx, w, h, borderPadding, "#fbbf24");
        } else if (tpl === "white") {
          ctx.strokeStyle = "#94a3b8"; // clean silver
          ctx.lineWidth = aspect === "square" ? 12 : 20;
          ctx.strokeRect(ctx.lineWidth / 2, ctx.lineWidth / 2, w - ctx.lineWidth, h - ctx.lineWidth);
          
          ctx.strokeStyle = "rgba(255, 255, 255, 0.2)";
          ctx.lineWidth = 2;
          ctx.strokeRect(borderPadding, borderPadding, w - borderPadding * 2, h - borderPadding * 2);
          drawCanvasCorners(ctx, w, h, borderPadding, "#cbd5e1");
        }

        // Render Typography (Title Header)
        ctx.textAlign = "center";
        ctx.fillStyle = "#ffffff";
        ctx.font = `bold ${aspect === "square" ? "42px" : "48px"} serif`;
        ctx.fillText(isHi ? "🙏 आज का दिव्य दर्शन 🙏" : "🙏 Today's Daily Darshan 🙏", w / 2, aspect === "square" ? 95 : 170);

        ctx.fillStyle = tpl === "white" ? "#cbd5e1" : "#fbbf24";
        ctx.font = `italic ${aspect === "square" ? "26px" : "32px"} Georgia, serif`;
        const activeDeity = isHi ? todayDarshan.deityHindi : todayDarshan.deity;
        const activeTemple = isHi ? todayDarshan.templeNameHindi : todayDarshan.templeName;
        ctx.fillText(`${activeDeity} • ${activeTemple}`, w / 2, aspect === "square" ? 140 : 225);

        // Devotee photo rendering or Om glyph symbol
        const hasPhoto = !!userPhoto;
        const radius = aspect === "square" ? 170 : 210; // avatar dimensions
        const avatarSize = aspect === "square" ? 310 : 450;
        const centerX = w / 2;

        const drawQuoteBlock = () => {
          // Render Quote Content
          ctx.textAlign = "center";
          ctx.fillStyle = "#ffffff";
          ctx.font = `italic ${aspect === "square" ? "30px" : "36px"} Georgia, serif`;
          
          const rawQuote = isHi ? todayDarshan.quoteHindi : todayDarshan.quote;
          const words = rawQuote.split(" ");
          let currentLine = "";
          const lines = [];
          const maxLineWidth = w - 180;
          const lineHeight = aspect === "square" ? 44 : 52;

          for (let i = 0; i < words.length; i++) {
            const testLine = currentLine + words[i] + " ";
            const metrics = ctx.measureText(testLine);
            if (metrics.width > maxLineWidth && i > 0) {
              lines.push(currentLine);
              currentLine = words[i] + " ";
            } else {
              currentLine = testLine;
            }
          }
          lines.push(currentLine);

          let startY = aspect === "square" ? 560 : 880;
          lines.slice(0, 3).forEach((lineText) => {
            ctx.fillText(lineText.trim(), w / 2, startY);
            startY += lineHeight;
          });

          // Devotee Personalization Name Banner
          let personalizedName = "";
          const cleanedName = userName.trim();
          
          if (cleanedName) {
            if (blessingType === "parents") {
              personalizedName = isHi ? `${cleanedName} एवं माता-पिता हेतु आशीर्वाद` : `Blessings for ${cleanedName} & Parents`;
            } else if (blessingType === "family") {
              personalizedName = isHi ? `${cleanedName} एवं सपरिवार हेतु आशीर्वाद` : `Blessings for ${cleanedName} & Family`;
            } else if (blessingType === "friends") {
              personalizedName = isHi ? `${cleanedName} एवं मित्रों हेतु आशीर्वाद` : `Blessings for ${cleanedName} & Friends`;
            } else if (blessingType === "universal") {
              personalizedName = isHi ? `सर्वे भवन्तु सुखिनः (द्वारा: ${cleanedName})` : `Peace & Blessings for All (by ${cleanedName})`;
            } else {
              personalizedName = isHi ? `${cleanedName} जी हेतु आशीर्वाद` : `Blessings for ${cleanedName}`;
            }
          } else {
            if (blessingType === "parents") personalizedName = isHi ? "माता-पिता हेतु दिव्य आशीर्वाद" : "Divine Blessings for Parents";
            else if (blessingType === "family") personalizedName = isHi ? "परिवार हेतु दिव्य आशीर्वाद" : "Divine Blessings for Family";
            else if (blessingType === "friends") personalizedName = isHi ? "प्रिय मित्रों हेतु दिव्य आशीर्वाद" : "Divine Blessings for Friends";
            else if (blessingType === "universal") personalizedName = isHi ? "सर्वे भवन्तु सुखिनः (विश्व शांति)" : "Peace & Blessings for All";
            else personalizedName = isHi ? "हरि भक्त हेतु दिव्य आशीर्वाद" : "Divine Blessings for Devotee";
          }

          const bannerY = aspect === "square" ? 760 : 1240;
          ctx.fillStyle = "rgba(251, 191, 36, 0.08)";
          ctx.strokeStyle = "rgba(251, 191, 36, 0.25)";
          ctx.lineWidth = 3;
          ctx.font = `bold ${aspect === "square" ? "34px" : "40px"} serif`;
          
          const textWidth = ctx.measureText(personalizedName).width;
          const rectWidth = Math.min(w - 200, textWidth + 80);
          
          ctx.beginPath();
          // Draw rounded rectangle for text border banner
          ctx.roundRect(w / 2 - rectWidth / 2, bannerY - 48, rectWidth, 76, 16);
          ctx.fill();
          ctx.stroke();

          ctx.fillStyle = tpl === "white" ? "#e2e8f0" : "#fbbf24";
          ctx.fillText(personalizedName, w / 2, bannerY + 4);

          // Add clean watermark at bottom
          ctx.fillStyle = "rgba(255, 255, 255, 0.35)";
          ctx.font = `bold ${aspect === "square" ? "18px" : "24px"} sans-serif`;
          ctx.fillText("✨ Created with Raghavam", w / 2, h - (aspect === "square" ? 50 : 100));

          // Complete Promise with png data url
          resolve(canvas.toDataURL("image/png"));
        };

        if (hasPhoto) {
          const avatarImg = new Image();
          avatarImg.src = userPhoto;
          avatarImg.onload = () => {
            ctx.save();
            ctx.beginPath();
            ctx.arc(centerX, avatarSize, radius / 2, 0, Math.PI * 2);
            ctx.closePath();
            ctx.clip();

            const avatarRatio = avatarImg.width / avatarImg.height;
            let cropW = radius;
            let cropH = radius;
            let cropX = centerX - radius / 2;
            let cropY = avatarSize - radius / 2;

            if (avatarRatio > 1) {
              cropW = radius * avatarRatio;
              cropX = centerX - cropW / 2;
            } else {
              cropH = radius / avatarRatio;
              cropY = avatarSize - cropH / 2;
            }

            ctx.drawImage(avatarImg, cropX, cropY, cropW, cropH);
            ctx.restore();

            // Avatar border
            ctx.strokeStyle = tpl === "white" ? "#cbd5e1" : "#fbbf24";
            ctx.lineWidth = 4;
            ctx.beginPath();
            ctx.arc(centerX, avatarSize, radius / 2, 0, Math.PI * 2);
            ctx.stroke();

            drawQuoteBlock();
          };
          avatarImg.onerror = () => {
            drawQuoteBlock();
          };
        } else {
          // Fallback glyph
          ctx.fillStyle = tpl === "white" ? "rgba(203, 213, 225, 0.12)" : "rgba(251, 191, 36, 0.12)";
          ctx.beginPath();
          ctx.arc(centerX, avatarSize, 60, 0, Math.PI * 2);
          ctx.fill();

          ctx.fillStyle = tpl === "white" ? "#e2e8f0" : "#fbbf24";
          ctx.font = "bold 56px serif";
          ctx.fillText("ॐ", centerX, avatarSize + 18);

          drawQuoteBlock();
        }
      };

      deityImg.onerror = (err) => reject(err);
    });
  };

  const handleDownloadSadhana = async () => {
    if (isTemplatePremium(selectedTemplate)) {
      setShowPremiumTplModal(selectedTemplate);
      return;
    }

    try {
      toast.info(isHi ? "छवि तैयार की जा रही है..." : "Generating blessing card...");
      const dataUrl = await compileBlessingCard();
      
      const link = document.createElement("a");
      link.download = `${todayDarshan.deity.replace(/\\s+/g, "_")}_Daily_Blessing.png`;
      link.href = dataUrl;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      saveBlessingToGallery(dataUrl);
      completeTodaySadhana();
      toast.success(isHi ? "आशीर्वाद कार्ड गैलरी में सेव हो गया!" : "Blessing downloaded & saved locally!");
    } catch (e) {
      console.error(e);
      toast.error(isHi ? "डाउनलोड करने में विफल" : "Failed to compile image.");
    }
  };

  const copyTextToClipboard = async (text: string): Promise<boolean> => {
    if (navigator.clipboard && window.isSecureContext) {
      try {
        await navigator.clipboard.writeText(text);
        return true;
      } catch (err) {
        console.warn("navigator.clipboard.writeText failed, using fallback:", err);
      }
    }
    // Legacy fallback using textarea
    try {
      const textArea = document.createElement("textarea");
      textArea.value = text;
      textArea.style.position = "fixed";
      textArea.style.left = "-999999px";
      textArea.style.top = "-999999px";
      document.body.appendChild(textArea);
      textArea.focus();
      textArea.select();
      const success = document.execCommand("copy");
      document.body.removeChild(textArea);
      return !!success;
    } catch (err) {
      console.error("Legacy copy fallback failed:", err);
      return false;
    }
  };

  const handleShareSadhana = async () => {
    if (isTemplatePremium(selectedTemplate)) {
      setShowPremiumTplModal(selectedTemplate);
      return;
    }

    try {
      toast.info(isHi ? "साझा करने के लिए छवि तैयार हो रही है..." : "Compiling image to share...");
      const dataUrl = await compileBlessingCard();
      const response = await fetch(dataUrl);
      const blob = await response.blob();
      const file = new File([blob], "Raghavam_Blessing.png", { type: "image/png" });

      if (navigator.canShare && navigator.canShare({ files: [file] })) {
        await navigator.share({
          files: [file],
          title: isHi ? `${todayDarshan.deityHindi} दर्शन` : `${todayDarshan.deity} Darshan`,
          text: isHi 
            ? `राघवम् से प्राप्त करें आज का ${todayDarshan.deityHindi} आशीर्वाद दर्शन।` 
            : `Receive today's divine ${todayDarshan.deity} blessing from Raghavam.`
        });
        completeTodaySadhana();
        toast.success(isHi ? "सफलतापूर्वक साझा किया गया!" : "Shared successfully!");
      } else {
        // Fallback clipboard copy and download
        await copyTextToClipboard(window.location.href);
        toast.info(isHi ? "शेयर लिंक क्लिपबोर्ड पर कॉपी हो गया! इमेज डाउनलोड की जा रही है।" : "Web share unsupported on this browser. Link copied! Saving image to device.");
        handleDownloadSadhana();
      }
    } catch (e) {
      console.error("Sharing failed", e);
      handleDownloadSadhana();
    }
  };

  const saveBlessingToGallery = (dataUrl: string) => {
    try {
      const updated = [dataUrl, ...savedBlessings].slice(0, 16);
      setSavedBlessings(updated);
      localStorage.setItem("hk_saved_blessings_v2", JSON.stringify(updated));
    } catch (_) {}
  };

  const handleWallpaperAction = (wp: DevotionalWallpaper) => {
    setShowPreviewModal(wp.id);
  };

  const handleLiveWallpaperAction = (wp: DevotionalLiveWallpaper) => {
    setShowLivePreviewModal(wp.id);
  };

  const handleDownloadWallpaper = (wp: DevotionalWallpaper) => {
    toast.info(isHi ? "वॉलपेपर डाउनलोड हो रहा है..." : "Downloading wallpaper...");
    const link = document.createElement("a");
    link.download = `${wp.name.replace(/\\s+/g, "_")}_HD.webp`;
    link.href = wp.imageUrl;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    completeTodaySadhana();
    toast.success(isHi ? "वॉलपेपर डाउनलोड हो गया!" : "Wallpaper downloaded!");
  };

  const handleDownloadLiveWallpaper = (wp: DevotionalLiveWallpaper) => {
    toast.info(isHi ? "सजीव वॉलपेपर (Live Wallpaper) डाउनलोड हो रहा है..." : "Downloading Live Wallpaper...");
    const link = document.createElement("a");
    link.download = `${wp.name.replace(/\\s+/g, "_")}_Live.webp`;
    link.href = wp.thumbnailUrl;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    completeTodaySadhana();
    toast.success(isHi ? "सजीव वॉलपेपर डाउनलोड हो गया! इसे लाइव वॉलपेपर के रूप में सेट करें।" : "Live wallpaper downloaded! Apply it as your motion background.");
  };

  const handleShareWallpaper = async (wp: any) => {
    const link = `${window.location.origin}/wallpaper?tab=wallpapers&wpId=${wp.id}`;
    const imageUrl = wp.imageUrl || wp.thumbnailUrl;
    const title = isHi ? `भक्ति वॉलपेपर - ${wp.nameHindi}` : `Devotional Wallpaper - ${wp.name}`;
    const text = isHi 
      ? `चेक करें यह पावन मोबाइल वॉलपेपर: ${wp.nameHindi}\n${link}` 
      : `Check out this devotional mobile wallpaper: ${wp.name}\n${link}`;

    // Try native share first
    if (navigator.share) {
      try {
        let file: File | null = null;
        if (imageUrl) {
          try {
            toast.info(isHi ? "साझा करने के लिए छवि तैयार हो रही है..." : "Compiling image to share...");
            const response = await fetch(imageUrl);
            const blob = await response.blob();
            let extension = "jpg";
            if (blob.type) {
              const mimeParts = blob.type.split("/");
              if (mimeParts.length === 2) {
                extension = mimeParts[1];
              }
            } else {
              extension = imageUrl.split('.').pop()?.split('?')[0] || "jpg";
            }
            const filename = `${wp.name.replace(/\s+/g, "_")}.${extension}`;
            file = new File([blob], filename, { type: blob.type || "image/jpeg" });
          } catch (fetchErr) {
            console.warn("Could not fetch image for native share", fetchErr);
          }
        }

        // Check if we can share the file
        if (file && navigator.canShare && navigator.canShare({ files: [file] })) {
          await navigator.share({
            files: [file],
            title,
            text,
          });
          toast.success(isHi ? "वॉलपेपर शेयर किया गया!" : "Wallpaper shared successfully!");
          return;
        } else {
          // If file sharing is not supported/fetch failed, fall back to link sharing
          const linkShareData = {
            title,
            text: isHi 
              ? `चेक करें यह पावन मोबाइल वॉलपेपर: ${wp.nameHindi}` 
              : `Check out this devotional mobile wallpaper: ${wp.name}`,
            url: link,
          };
          if (navigator.canShare && navigator.canShare(linkShareData)) {
            await navigator.share(linkShareData);
            toast.success(isHi ? "वॉलपेपर शेयर किया गया!" : "Wallpaper shared successfully!");
            return;
          }
        }
      } catch (err: any) {
        if (err.name === "AbortError") {
          toast.info(isHi ? "साझा करना रद्द किया गया" : "Sharing cancelled");
          return;
        }
        console.warn("Native share failed, showing custom share options sheet", err);
      }
    }

    // Fallback: Open our custom share drawer/modal
    setShareModalData({
      url: link,
      title,
      text: isHi 
        ? `चेक करें यह पावन मोबाइल वॉलपेपर: ${wp.nameHindi}` 
        : `Check out this devotional mobile wallpaper: ${wp.name}`,
      wpName: isHi ? wp.nameHindi : wp.name
    });
  };

  const navigateToPricing = () => {
    setShowPreviewModal(null);
    setShowLivePreviewModal(null);
    setShowPremiumTplModal(null);
    navigate("/pricing");
  };

  // Interactive Puja Seva Actions
  const [isBellRinging, setIsBellRinging] = useState(false);
  const [isDiyaLit, setIsDiyaLit] = useState(false);
  const [petals, setPetals] = useState<Petal[]>([]);
  const [isAudioPlaying, setIsAudioPlaying] = useState(false);

  const ringBell = () => {
    setIsBellRinging(true);
    playMeditationBell();
    setTimeout(() => setIsBellRinging(false), 900);
  };

  const toggleDiya = () => {
    setIsDiyaLit(!isDiyaLit);
    if (!isDiyaLit) {
      playCompletionChime();
    }
  };

  const showerFlowers = () => {
    const emojis = ["🌸", "🌹", "🌼", "💐", "🌺", "🌻"];
    const activeEmoji = emojis[Math.floor(Math.random() * emojis.length)];
    const list: Petal[] = [];
    for (let i = 0; i < 15; i++) {
      list.push({
        id: Date.now() + i + Math.random(),
        x: Math.random() * 100,
        delay: Math.random() * 0.5,
        duration: 3 + Math.random() * 2,
        size: 16 + Math.random() * 20,
        emoji: activeEmoji
      });
    }
    setPetals(list);
    setTimeout(() => setPetals([]), 5500);
  };

  const toggleAmbientTanpura = () => {
    if (isAudioPlaying) {
      droneRef.current?.stop();
      setIsAudioPlaying(false);
    } else {
      droneRef.current?.start();
      setIsAudioPlaying(true);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#180a06] via-[#0d0502] to-[#120603] text-amber-100 flex flex-col font-serif select-none relative overflow-x-hidden">
      
      {/* Dynamic Falling Petals Shower */}
      {petals.map((p) => (
        <span
          key={p.id}
          className="fixed pointer-events-none z-50 animate-petal text-xl select-none"
          style={{
            left: `${p.x}%`,
            animationDelay: `${p.delay}s`,
            animationDuration: `${p.duration}s`,
            fontSize: `${p.size}px`,
            top: "-50px"
          }}
        >
          {p.emoji}
        </span>
      ))}

      <style>{`
        @keyframes fall {
          0% { transform: translateY(-50px) rotate(0deg); opacity: 1; }
          90% { opacity: 1; }
          100% { transform: translateY(105vh) rotate(360deg); opacity: 0; }
        }
        .animate-petal {
          animation: fall linear forwards;
        }
        @keyframes flame-flicker {
          0%, 100% { transform: scale(1) rotate(-1deg); filter: drop-shadow(0 0 3px rgba(251, 146, 60, 0.7)) drop-shadow(0 0 8px rgba(251, 191, 36, 0.5)); }
          50% { transform: scale(1.08) rotate(2deg); filter: drop-shadow(0 0 6px rgba(251, 146, 60, 0.9)) drop-shadow(0 0 14px rgba(251, 191, 36, 0.7)); }
        }
        .animate-flame {
          animation: flame-flicker 0.15s ease-in-out infinite;
        }
        .scrollbar-none::-webkit-scrollbar {
          display: none !important;
        }
        .scrollbar-none {
          -ms-overflow-style: none !important;
          scrollbar-width: none !important;
        }
        @keyframes shimmer-move {
          0% { background-position: -200% 0; }
          100% { background-position: 200% 0; }
        }
        .animate-shimmer {
          background-size: 200% 200%;
          animation: shimmer-move 4s ease-in-out infinite;
        }
      `}</style>

      {/* Compiler Hidden Canvas */}
      <canvas ref={canvasRef} className="hidden" />

      {/* ─── HEADER BAR ─────────────────────────────────────────────── */}
      {activeTab === "wallpapers" ? (
        <header className="sticky top-0 z-40 bg-[#0d0502]/95 backdrop-blur-md border-b border-amber-950/10 px-4 py-3 flex items-center justify-between w-full select-none">
          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate("/")}
              className="flex h-10 w-10 items-center justify-center rounded-full bg-black/30 border border-amber-900/20 text-amber-400 active:scale-95 transition-all hover:bg-amber-950/30"
            >
              <ArrowLeft className="w-5 h-5 text-amber-400" />
            </button>
            <div className="text-left">
              <h1 className="font-serif text-lg font-black text-amber-100 leading-none">
                {isHi ? "वॉलपेपर" : "Wallpapers"}
              </h1>
              <span className="font-sans text-[10px] text-amber-200/40 block mt-1.5 font-medium leading-none">
                {isHi ? "अपने मोबाइल को दिव्यता से सजाएँ" : "Decorate your mobile with divinity"}
              </span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => navigate("/pricing")}
              className="flex items-center gap-1.5 bg-[#fbbf24]/10 border border-[#fbbf24]/30 rounded-full px-3 py-1.5 font-sans text-xs font-black text-[#fbbf24] shadow-sm hover:bg-[#fbbf24]/25 active:scale-95 transition-all"
            >
              <Sparkles className="w-3.5 h-3.5 fill-current animate-pulse text-[#fbbf24]" />
              <span>{isHi ? "महाभक्त" : "Mahabhakt"}</span>
            </button>
            <button
              onClick={() => setIsSearchOpen(!isSearchOpen)}
              className="flex h-10 w-10 items-center justify-center rounded-full bg-black/30 border border-amber-900/20 text-amber-400 active:scale-95 transition-all hover:bg-amber-950/30"
            >
              <Search className="w-5 h-5 text-amber-400" />
            </button>
          </div>
        </header>
      ) : (
        <header className="sticky top-0 z-40 bg-[#160a06]/90 backdrop-blur-md border-b border-amber-950/20 px-4 py-3.5 flex items-center justify-between w-full">
          <button
            onClick={() => navigate("/")}
            className="flex h-10 w-10 items-center justify-center rounded-full bg-black/40 border border-amber-500/10 hover:bg-amber-500/10 text-amber-100 active:scale-95 transition-all focus:outline-none"
          >
            <ArrowLeft className="w-5 h-5 text-amber-400" />
          </button>
          <div className="text-center">
            <h1 className="font-serif text-base md:text-lg font-black text-amber-400 uppercase tracking-widest flex items-center gap-1.5 justify-center leading-none">
              <Sparkles className="w-4 h-4 text-amber-400 fill-current animate-pulse" />
              {isHi ? "नित्य दर्शन व आशीर्वाद" : "Nitya Darshan & Blessings"}
            </h1>
            <span className="font-sans text-[10px] text-amber-200/40 uppercase tracking-wider block mt-0.5 leading-none">
              Raghavam Devotional Hub
            </span>
          </div>
          <div className="flex items-center gap-1.5 bg-amber-500/10 border border-amber-500/20 rounded-full px-3 py-1.5 font-sans text-xs font-black text-amber-400 shadow-inner">
            <Flame className="w-3.5 h-3.5 text-orange-500 fill-current animate-bounce" />
            <span>{streakCount} {isHi ? "दिन साधना" : "Days Streak"}</span>
          </div>
        </header>
      )}

      {/* ─── TAB NAVIGATION SWITCHER ───────────────────────────────── */}
      <div className="w-full max-w-md mx-auto px-4 mt-4 select-none">
        <nav className="bg-[#120704]/70 p-1.5 rounded-full border border-amber-950/40 flex items-center shadow-lg">
          <button
            onClick={() => setActiveTab("maker")}
            className={`flex-1 py-2 rounded-full font-sans text-[11px] font-black uppercase tracking-wider transition-all duration-300 flex items-center justify-center gap-1 focus:outline-none ${
              activeTab === "maker"
                ? "bg-gradient-to-r from-amber-500 to-amber-600 text-black shadow-md"
                : "text-amber-200/60 hover:text-amber-200"
            }`}
          >
            <span>✨</span>
            <span>{isHi ? "आशीर्वाद पत्र" : "Blessing Patra"}</span>
          </button>
          <button
            onClick={() => setActiveTab("wallpapers")}
            className={`flex-1 py-2 rounded-full font-sans text-[11px] font-black uppercase tracking-wider transition-all duration-300 flex items-center justify-center gap-1 focus:outline-none ${
              activeTab === "wallpapers"
                ? "bg-gradient-to-r from-amber-500 to-amber-600 text-black shadow-md"
                : "text-amber-200/60 hover:text-amber-200"
            }`}
          >
            <span>📱</span>
            <span>{isHi ? "वॉलपेपर" : "Wallpapers"}</span>
          </button>
          <button
            onClick={() => setActiveTab("saved")}
            className={`flex-1 py-2 rounded-full font-sans text-[11px] font-black uppercase tracking-wider transition-all duration-300 flex items-center justify-center gap-1 focus:outline-none ${
              activeTab === "saved"
                ? "bg-gradient-to-r from-amber-500 to-amber-600 text-black shadow-md"
                : "text-amber-200/60 hover:text-amber-200"
            }`}
          >
            <span>📖</span>
            <span>{isHi ? "डायरी" : "Diary"}</span>
          </button>
        </nav>
      </div>

      {/* ─── MAIN CONTENT ────────────────────────────────────────── */}
      <main className="flex-1 w-full max-w-4xl mx-auto px-4 py-5 pb-24 relative z-10 flex flex-col items-center">
        
        {/* ========================================================= */}
        {/* TAB 1: DIVINE BLESSINGS LETTER PATRA GENERATOR            */}
        {/* ========================================================= */}
        {activeTab === "maker" && (
          <div className="w-full space-y-6 flex flex-col items-center animate-fade-in">
            {/* Title Description */}
            <div className="text-center">
              <h2 className="font-serif text-base font-bold text-amber-400">
                {isHi ? "दिव्य आशीर्वाद पत्र निर्माण" : "Create Divine Blessing Card"}
              </h2>
              <p className="text-xs text-amber-200/60 font-sans mt-1">
                {isHi ? "स्वयं अथवा परिवार के लिए आज का पावन आशीर्वाद पत्र तैयार करें और व्हाट्सएप पर साझा करें" : "Personalize daily blessings and share sacred cards on your WhatsApp Status"}
              </p>
            </div>

            {/* Config Card options layout */}
            <div className="w-full bg-[#1b0d07]/40 border border-amber-950/30 rounded-3xl p-5 shadow-2xl flex flex-col gap-4">
              
              {/* Devotee Input */}
              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] text-amber-200/50 uppercase tracking-widest font-sans font-black">
                  {isHi ? "श्रद्धालु / भक्त का नाम" : "Devotee Name (Will appear on card)"}
                </label>
                <input
                  type="text"
                  placeholder={isHi ? "उदा. राजेश कुमार" : "e.g., Rajesh Kumar"}
                  value={userName}
                  onChange={(e) => setUserName(e.target.value)}
                  className="bg-black/40 border border-amber-500/15 focus:border-amber-500/45 rounded-xl px-4 py-3 text-xs text-amber-100 focus:outline-none placeholder:text-amber-200/20 tracking-wide font-sans font-medium"
                />
              </div>

              {/* Blessing Recipient target */}
              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] text-amber-200/50 uppercase tracking-widest font-sans font-black">
                  {isHi ? "आशीर्वाद किसके लिए है?" : "Who is this blessing for?"}
                </label>
                <div className="grid grid-cols-2 gap-1.5 font-sans text-xs">
                  {[
                    { key: "self", hi: "मेरे स्वयं हेतु", en: "Personal" },
                    { key: "parents", hi: "माता-पिता हेतु", en: "For Parents" },
                    { key: "family", hi: "सपरिवार हेतु", en: "For Family" },
                    { key: "friends", hi: "मित्रों हेतु", en: "For Friends" },
                    { key: "universal", hi: "सर्व कल्याण (सभी)", en: "Universal Peace" }
                  ].map((opt) => (
                    <button
                      key={opt.key}
                      onClick={() => setBlessingType(opt.key as any)}
                      className={`py-2 px-3 rounded-xl border text-center transition-all truncate ${
                        blessingType === opt.key 
                          ? "border-amber-500 bg-amber-500/10 text-amber-400 font-black" 
                          : "border-amber-500/10 bg-black/25 text-amber-200/60"
                      }`}
                    >
                      {isHi ? opt.hi : opt.en}
                    </button>
                  ))}
                </div>
              </div>

              {/* Custom Image Avatar Attachment */}
              <div className="flex items-center justify-between bg-black/25 border border-amber-950/20 rounded-2xl p-3 select-none">
                <div className="flex items-center gap-3">
                  <div className="w-11 h-11 rounded-full bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400 relative overflow-hidden">
                    {userPhoto ? (
                      <img src={userPhoto} alt="devotee avatar" className="w-full h-full object-cover" />
                    ) : (
                      <UserIcon className="w-5 h-5 opacity-70" />
                    )}
                  </div>
                  <div className="flex flex-col text-left">
                    <span className="text-[9px] text-amber-200/40 font-bold uppercase tracking-wider font-sans leading-none">
                      Custom Avatar
                    </span>
                    <span className="text-xs text-amber-200 font-bold mt-1.5 leading-none">
                      {userPhoto 
                        ? (isHi ? "फ़ोटो सफलतापूर्वक संलग्न" : "Custom Photo Attached") 
                        : (isHi ? "अपनी फोटो जोड़ें (वैकल्पिक)" : "Add your photo (optional)")}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-1.5">
                  {userPhoto && (
                    <button
                      onClick={() => setUserPhoto(null)}
                      className="px-2.5 py-1.5 border border-red-500/20 bg-red-500/5 hover:bg-red-500/10 text-red-400 text-[9px] uppercase tracking-widest font-sans font-black rounded-lg transition-all focus:outline-none"
                    >
                      {isHi ? "हटाएं" : "Remove"}
                    </button>
                  )}
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    className="px-3 py-1.5 border border-amber-500/30 bg-amber-500/5 hover:bg-amber-500/10 text-amber-400 text-[9px] uppercase tracking-widest font-sans font-black rounded-lg transition-all focus:outline-none"
                  >
                    {userPhoto ? (isHi ? "बदलें" : "Change") : (isHi ? "चुनें" : "Upload")}
                  </button>
                  <input
                    type="file"
                    ref={fileInputRef}
                    accept="image/*"
                    onChange={handlePhotoUpload}
                    className="hidden"
                  />
                </div>
              </div>

              {/* Temple Border Themes selector */}
              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] text-amber-200/50 uppercase tracking-widest font-sans font-black">
                  {isHi ? "मंदिर गर्भगृह बॉर्डर पैक (Themes)" : "Sacred Garbhagriha Border Themes"}
                </label>
                <div className="grid grid-cols-2 gap-2 font-sans text-[11px]">
                  {[
                    { key: "golden", hi: "गर्भगृह स्वर्ण (Free)", en: "Garbhagriha Gold", tier: "free" },
                    { key: "white", hi: "सात्विक रजत (Free)", en: "Sattvik White", tier: "free" },
                    { key: "crimson", hi: "काशी सिंदूरी (Devotee)", en: "Kashi Crimson", tier: "devotee" },
                    { key: "peacock", hi: "वृंदावन मयूर (Mahabhakt)", en: "Vrindavan Peacock", tier: "mahabhakt" }
                  ].map((tpl) => {
                    const isLocked = isTemplatePremium(tpl.key);
                    return (
                      <button
                        key={tpl.key}
                        onClick={() => setSelectedTemplate(tpl.key as any)}
                        className={`py-3 px-2 rounded-xl border text-center transition-all flex items-center justify-center gap-1 focus:outline-none ${
                          selectedTemplate === tpl.key 
                            ? "border-amber-500 bg-amber-500/10 text-amber-400 font-black" 
                            : "border-amber-500/10 bg-black/25 text-amber-200/60"
                        }`}
                      >
                        {isLocked && <Lock className="w-3 h-3 text-amber-500/60" />}
                        <span>{isHi ? tpl.hi : tpl.en}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Aspect Ratio layout switcher */}
              <div className="flex flex-col gap-1.5 border-t border-amber-950/20 pt-4">
                <label className="text-[10px] text-amber-200/50 uppercase tracking-widest font-sans font-black flex items-center justify-between">
                  <span>{isHi ? "शेयरिंग लेआउट आकार" : "Sharing Layout Ratio"}</span>
                  <span className="text-amber-500 text-[8px] bg-amber-500/10 px-2 py-0.5 rounded-full font-black">
                    {isHi ? "व्हाट्सएप स्टेटस हेतु अनुशंसित" : "Recommended for WhatsApp Status"}
                  </span>
                </label>
                <div className="flex gap-2.5 font-sans text-xs">
                  <button
                    onClick={() => setGenerationType("status")}
                    className={`flex-1 py-3 rounded-xl border transition-all flex items-center justify-center gap-1.5 focus:outline-none ${
                      generationType === "status" 
                        ? "border-amber-500 bg-amber-500/10 text-amber-400 font-black" 
                        : "border-amber-500/10 bg-black/25 text-amber-200/60"
                    }`}
                  >
                    <Smartphone className="w-4 h-4" />
                    <span>{isHi ? "स्टेटस (9:16)" : "Vertical Story (9:16)"}</span>
                  </button>
                  <button
                    onClick={() => setGenerationType("square")}
                    className={`flex-1 py-3 rounded-xl border transition-all flex items-center justify-center gap-1.5 focus:outline-none ${
                      generationType === "square" 
                        ? "border-amber-500 bg-amber-500/10 text-amber-400 font-black" 
                        : "border-amber-500/10 bg-black/25 text-amber-200/60"
                    }`}
                  >
                    <span>⬜</span>
                    <span>{isHi ? "स्क्वायर (1:1)" : "Square Post (1:1)"}</span>
                  </button>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-2 border-t border-amber-950/20 pt-4 mt-2">
                <button
                  onClick={handleShareSadhana}
                  className="flex-1 py-3.5 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-black font-sans font-black text-xs uppercase tracking-widest rounded-xl transition-all active:scale-[0.97] flex items-center justify-center gap-1.5 shadow-md focus:outline-none"
                >
                  <Share2 className="w-4 h-4 text-black" />
                  <span>{isHi ? "व्हाट्सएप पर शेयर" : "Share on WhatsApp"}</span>
                </button>
                <button
                  onClick={handleDownloadSadhana}
                  className="px-4.5 py-3.5 border border-amber-500/20 bg-black/20 hover:bg-amber-500/10 text-amber-300 font-sans font-black text-xs uppercase tracking-widest rounded-xl transition-all active:scale-[0.97] flex items-center justify-center gap-1.5 focus:outline-none"
                >
                  <Download className="w-4 h-4 text-amber-450" />
                </button>
              </div>

              <p className="text-[9px] font-sans text-amber-200/30 text-center tracking-wider">
                {isHi ? "✨ आशीर्वाद पत्र के निचले हिस्से में सूक्ष्म वॉटरमार्क संलग्न रहेगा।" : "✨ A subtle watermark will be included at the bottom of the card."}
              </p>
            </div>

            {/* Interactive Puja Seva Tray panel */}
            <div className="w-full bg-gradient-to-b from-[#1b0a05] to-[#0e0402] border border-amber-950/25 rounded-3xl p-5 shadow-xl flex flex-col gap-4 text-center mt-3 select-none">
              <div>
                <h3 className="font-serif text-sm font-bold text-amber-400">
                  {isHi ? "सजीव मंदिर सेवा (Virtual Puja Room)" : "Virtual Temple Room (Interactive)"}
                </h3>
                <p className="text-[10px] text-amber-200/40 font-sans leading-relaxed mt-1">
                  {isHi ? "आरती करें, पुष्प वर्षा करें और तानपुरा भक्तिमय धुन के साथ ध्यान मग्न हों" : "Light the Diya, ring the temple bell, offer fresh flower showers, and listen to the meditation tanpura drone"}
                </p>
              </div>

              <div className="grid grid-cols-4 gap-2 text-center text-[10px] font-sans font-black uppercase tracking-wider text-amber-200">
                {/* Bell */}
                <button
                  onClick={ringBell}
                  className={`p-3 border rounded-2xl flex flex-col items-center justify-center gap-2 transition-all active:scale-90 ${
                    isBellRinging ? "bg-amber-500/10 border-amber-500 text-amber-400" : "bg-black/20 border-amber-500/10 text-amber-300/80 hover:bg-amber-950/20"
                  }`}
                >
                  <span className={`text-2xl leading-none ${isBellRinging ? "animate-bounce" : ""}`}>🔔</span>
                  <span className="text-[9px]">{isHi ? "घंटी" : "Bell"}</span>
                </button>

                {/* Diya */}
                <button
                  onClick={toggleDiya}
                  className={`p-3 border rounded-2xl flex flex-col items-center justify-center gap-2 transition-all active:scale-90 relative overflow-hidden ${
                    isDiyaLit ? "bg-amber-500/15 border-amber-500 text-amber-400" : "bg-black/20 border-amber-500/10 text-amber-300/80 hover:bg-amber-950/20"
                  }`}
                >
                  <div className="w-7 h-7 relative flex items-center justify-center">
                    {isDiyaLit ? (
                      <>
                        <span className="text-2xl leading-none z-10 animate-flame">🔥</span>
                        <img src={litDiyaImg} alt="diya base" className="w-6 h-6 absolute bottom-0 object-contain z-0 opacity-80" />
                      </>
                    ) : (
                      <span className="text-xl opacity-60 leading-none">🪔</span>
                    )}
                  </div>
                  <span className="text-[9px]">{isHi ? "दीपक" : "Diya"}</span>
                </button>

                {/* Flower Shower */}
                <button
                  onClick={showerFlowers}
                  className="p-3 border bg-black/20 border-amber-500/10 text-amber-300/80 rounded-2xl flex flex-col items-center justify-center gap-2 transition-all hover:bg-amber-950/20 active:scale-90"
                >
                  <span className="text-2xl leading-none">🌸</span>
                  <span className="text-[9px]">{isHi ? "पुष्प" : "Flowers"}</span>
                </button>

                {/* Tanpura loop */}
                <button
                  onClick={toggleAmbientTanpura}
                  className={`p-3 border rounded-2xl flex flex-col items-center justify-center gap-2 transition-all active:scale-90 ${
                    isAudioPlaying ? "bg-amber-500/10 border-amber-500 text-amber-400" : "bg-black/20 border-amber-500/10 text-amber-300/80 hover:bg-amber-950/20"
                  }`}
                >
                  <span className={`text-2xl leading-none ${isAudioPlaying ? "animate-pulse" : "opacity-60"}`}>🪈</span>
                  <span className="text-[9px]">{isHi ? "तानपुरा" : "Tanpura"}</span>
                </button>
              </div>
            </div>

            {/* साधना पंचांग Weekly Calendar Dashboard */}
            <div className="w-full bg-[#1b0a05]/40 border border-amber-950/30 rounded-3xl p-5 shadow-2xl flex flex-col gap-3.5 select-none">
              <div className="flex justify-between items-center">
                <span className="text-[10px] uppercase font-sans font-black tracking-widest text-amber-200/50">
                  {isHi ? "साधना पंचांग (Weekly Sadhana Calendar)" : "Sadhana Calendar (Weekly Progress)"}
                </span>
                <span className="text-[9px] text-amber-500 font-sans font-black uppercase">
                  {isHi ? "नित्य साधना दर्शन सूत्र" : "Nitya Sadhana Streak"}
                </span>
              </div>

              <div className="grid grid-cols-7 gap-1.5 font-sans">
                {WEEKDAYS.map((w) => {
                  // Resolve dates
                  const currentYear = new Date().getFullYear();
                  const currentMonth = new Date().getMonth();
                  const sundayOffset = new Date().getDate() - new Date().getDay();
                  const targetDate = new Date(currentYear, currentMonth, sundayOffset + w.dayNum);
                  const dateStr = targetDate.toISOString().split("T")[0];
                  
                  const isDone = completedDates.includes(dateStr);
                  const isToday = dateStr === todayDateString;

                  return (
                    <div 
                      key={w.dayNum} 
                      className={`py-2 border rounded-xl flex flex-col items-center justify-center gap-1.5 transition-all duration-300 ${
                        isDone 
                          ? "bg-amber-500/10 border-amber-500/40 text-amber-400 shadow-md"
                          : isToday 
                          ? "bg-black/40 border-amber-500/25 text-amber-300/90 shadow-inner scale-102"
                          : "bg-black/20 border-amber-500/5 text-stone-500"
                      }`}
                    >
                      <span className="text-[9px] font-black uppercase tracking-wider">{isHi ? w.labelHi : w.label}</span>
                      <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-black ${
                        isDone ? "bg-amber-500 text-black shadow" : "bg-black/35 text-amber-200/40 border border-amber-500/10"
                      }`}>
                        {isDone ? "✓" : targetDate.getDate()}
                      </div>
                      <span className="text-[7.5px] font-black text-amber-500/60 leading-none truncate max-w-full">
                        {isHi ? getDeityHindi(w.deity) : w.deity}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* ========================================================= */}
        {/* TAB 2: WALLPAPERS GALLERY WITH CATEGORIES & MOCKUPS       */}
        {/* ========================================================= */}
        {activeTab === "wallpapers" && (
          <div className="w-full flex flex-col items-center animate-fade-in select-none">
            
            {/* Wallpaper category selector tab */}
            <div className="w-full max-w-xs mx-auto mb-7 px-4">
              <div className="bg-[#120704]/40 p-1.5 rounded-full border border-amber-950/20 flex items-center shadow-lg">
                <button
                  onClick={() => setWallpaperType("static")}
                  className={`flex-1 py-2.5 rounded-full font-sans text-xs font-black uppercase tracking-wider transition-all duration-300 flex items-center justify-center gap-2 focus:outline-none ${
                    wallpaperType === "static"
                      ? "bg-[#fbbf24]/10 border border-[#fbbf24]/30 text-[#fbbf24] shadow-md font-black"
                      : "text-amber-200/40 hover:text-amber-200/70"
                  }`}
                >
                  <Smartphone className="w-3.5 h-3.5" />
                  <span>{isHi ? "स्थिर (Static)" : "Static"}</span>
                </button>
                <button
                  onClick={() => setWallpaperType("live")}
                  className={`flex-1 py-2.5 rounded-full font-sans text-xs font-black uppercase tracking-wider transition-all duration-300 flex items-center justify-center gap-2 focus:outline-none ${
                    wallpaperType === "live"
                      ? "bg-[#fbbf24]/10 border border-[#fbbf24]/30 text-[#fbbf24] shadow-md font-black"
                      : "text-amber-200/40 hover:text-amber-200/70"
                  }`}
                >
                  <Flame className="w-3.5 h-3.5" />
                  <span>{isHi ? "सजीव (Live)" : "Live"}</span>
                </button>
              </div>
            </div>

            {/* Search Input bar */}
            {isSearchOpen && (
              <div className="w-full max-w-md mx-auto px-1 mb-6 animate-fade-in">
                <div className="relative">
                  <input
                    type="text"
                    placeholder={isHi ? "वॉलपेपर खोजें..." : "Search wallpapers..."}
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full bg-black/45 border border-amber-500/20 focus:border-amber-500/45 rounded-full py-3 pl-5 pr-11 text-xs text-amber-100 placeholder:text-amber-200/20 focus:outline-none tracking-wide font-sans font-medium"
                  />
                  {searchQuery ? (
                    <button
                      onClick={() => setSearchQuery("")}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-amber-400 hover:text-amber-200 focus:outline-none"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  ) : (
                    <Search className="absolute right-4.5 top-1/2 -translate-y-1/2 text-amber-500/30 w-4 h-4" />
                  )}
                </div>
              </div>
            )}

            {/* A. STATIC WALLPAPERS TAB */}
            {wallpaperType === "static" && (
              <div className="w-full flex flex-col items-center space-y-9 animate-fade-in">
                {/* Deity Filter chips */}
                <div className="w-full flex flex-col">
                  <div className="flex items-center justify-between w-full mb-3.5 px-1">
                    <h3 className="font-serif text-xs sm:text-sm font-black text-amber-100 uppercase tracking-widest flex items-center gap-2">
                      <span className="text-amber-500">🕉️</span>
                      {isHi ? "देवता चुनें" : "Choose Deity"}
                    </h3>
                    <button
                      onClick={() => setSelectedDeityFilter(null)}
                      className="font-sans text-[10px] font-bold text-amber-500/80 hover:text-amber-400 flex items-center gap-1 active:scale-95 transition-all"
                    >
                      <span>{isHi ? "सभी देखें" : "View All"}</span>
                      <span>&gt;</span>
                    </button>
                  </div>

                  <div className="flex items-center gap-6 overflow-x-auto pb-4 pt-1 scrollbar-none justify-start w-full scroll-smooth">
                    {[
                      { id: null, name: "सभी", nameEn: "All", isIcon: true, symbol: "🕉️", image: "" },
                      { id: "Shiva", name: "शिव", nameEn: "Shiva", isIcon: false, symbol: "", image: shivWallpaperImg },
                      { id: "Rama", name: "राम", nameEn: "Ram", isIcon: false, symbol: "", image: deityRamImg },
                      { id: "Krishna", name: "कृष्ण", nameEn: "Krishna", isIcon: false, symbol: "", image: krishnaImg },
                      { id: "Hanuman", name: "हनुमान", nameEn: "Hanuman", isIcon: false, symbol: "", image: hanumanImg },
                      { id: "Radha", name: "राधा", nameEn: "Radha", isIcon: false, symbol: "", image: radhaKrishnaImg },
                      { id: "Khatu Shyam", name: "श्याम", nameEn: "Shyam", isIcon: false, symbol: "", image: shyamMandirImg }
                    ].map((deity) => {
                      const isActive = selectedDeityFilter === deity.id;
                      const hasImg = !deity.isIcon;
                      return (
                        <button
                          key={deity.id ?? "all"}
                          onClick={() => setSelectedDeityFilter(deity.id)}
                          className="flex flex-col items-center gap-2 outline-none focus:outline-none focus:ring-0 focus-visible:outline-none focus-visible:ring-0 transition-all active:scale-95 shrink-0 group"
                        >
                          <div className={`w-12 h-12 relative transition-all duration-300 flex items-center justify-center border-2 ${
                            hasImg ? "rounded-full" : "rounded-2xl"
                          } ${
                            isActive 
                              ? "border-amber-400 bg-gradient-to-tr from-amber-500/35 to-orange-500/20 ring-4 ring-amber-500/25 scale-105 shadow-[0_0_10px_rgba(245,158,11,0.4)]"
                              : hasImg 
                              ? "border-amber-950/40 bg-[#1b0a05] hover:border-amber-500/30"
                              : "border-amber-950/30 bg-[#1b0a05] text-amber-500/70 hover:border-amber-500/30"
                          }`}>
                            {deity.isIcon ? (
                              <span className={`text-lg transition-transform group-hover:scale-110 ${isActive ? "text-amber-300" : "text-amber-500/60 font-black"}`}>
                                {deity.symbol}
                              </span>
                            ) : (
                              <img src={deity.image} alt={deity.nameEn} className="w-full h-full object-cover rounded-full pointer-events-none" />
                            )}
                            {isActive && (
                              <span className="absolute bottom-0 right-0 w-3 h-3 bg-amber-500 rounded-full border border-[#0d0502] flex items-center justify-center shadow-md animate-pulse">
                                <span className="w-1.5 h-1.5 bg-[#0d0502] rounded-full" />
                              </span>
                            )}
                          </div>
                          <span className={`text-[10px] font-bold tracking-wide transition-colors ${
                            isActive ? "text-amber-400 font-extrabold" : "text-stone-400 group-hover:text-stone-200"
                          }`}>
                            {isHi ? deity.name : deity.nameEn}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Recommended static wallpaper (shows only when no filters) */}
                {!selectedDeityFilter && !searchQuery && (
                  <div className="w-full flex flex-col">
                    <div className="flex items-center justify-between w-full mb-3.5 px-1">
                      <h3 className="font-serif text-xs sm:text-sm font-black text-amber-100 uppercase tracking-widest flex items-center gap-2">
                        <span className="text-amber-500">✨</span>
                        {isHi ? "आज का दिव्य वॉलपेपर" : "Today's Divine Recommendation"}
                      </h3>
                      <button
                        onClick={() => {
                          const tomorrowIdx = (todayDay + 1) % 7;
                          const tomorrowDeity = WEEKDAYS[tomorrowIdx].deity;
                          toast.info(isHi ? `कल का पावन दर्शन: ${getDeityHindi(tomorrowDeity)}` : `Tomorrow's Blessing: ${tomorrowDeity}`);
                        }}
                        className="font-sans text-[10px] font-bold text-amber-500/80 hover:text-amber-400 flex items-center gap-1 active:scale-95 transition-all"
                      >
                        <Volume2 className="w-3.5 h-3.5 text-amber-500" />
                        <span>{isHi ? "कल देखें" : "See Tomorrow"}</span>
                      </button>
                    </div>

                    <div className="w-full bg-[#1b0d07]/40 border border-amber-950/20 rounded-2xl p-2.5 relative flex flex-col group overflow-hidden shadow-2xl">
                      <div className="w-full aspect-[16/9] rounded-xl overflow-hidden relative">
                        <img 
                          src={shivWallpaperImg} 
                          alt="Today's Recommended Wallpaper" 
                          className="w-full h-full object-cover group-hover:scale-103 transition-transform duration-700 pointer-events-none" 
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/30 to-transparent flex flex-col justify-end p-5 text-left">
                          <div className="flex justify-between items-end w-full">
                            <div>
                              <h4 className="font-serif text-base sm:text-lg font-bold text-amber-100">
                                {isHi ? "महादेव ध्यान" : "Mahadev Meditation"}
                              </h4>
                              <p className="text-[11px] font-sans text-amber-200/60 mt-1 font-semibold">
                                {isHi ? "शिव ही सत्य है, शिव ही अनंत है।" : "Shiva is the truth, Shiva is infinite."}
                              </p>
                            </div>
                            <button
                              onClick={() => {
                                const targetWp = WALLPAPERS_LIST.find(wp => wp.id === "wp-shiva-3") || WALLPAPERS_LIST[2];
                                handleWallpaperAction(targetWp);
                              }}
                              className="px-4 py-2 bg-white text-black hover:bg-amber-100 rounded-full font-sans text-[10px] font-black uppercase tracking-wider transition-all active:scale-95 flex items-center gap-1.5 shadow-lg shadow-black/40"
                            >
                              <Download className="w-3.5 h-3.5 text-black" />
                              <span>{isHi ? "डाउनलोड" : "Download"}</span>
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Popular Wallpaper Grid list */}
                <div className="w-full flex flex-col">
                  <div className="flex items-center justify-between w-full mb-4 px-1">
                    <h3 className="font-serif text-xs sm:text-sm font-black text-amber-100 uppercase tracking-widest flex items-center gap-2">
                      <span className="text-amber-500">🔥</span>
                      {isHi ? "लोकप्रिय वॉलपेपर" : "Popular Wallpapers"}
                    </h3>
                    <span className="text-[10px] font-bold font-sans text-amber-200/30">
                      {filteredWallpapers.length} {isHi ? "परिणाम" : "items"}
                    </span>
                  </div>

                  {filteredWallpapers.length === 0 ? (
                    <div className="w-full py-16 border border-dashed border-amber-900/20 rounded-2xl flex flex-col items-center justify-center text-stone-500 font-sans text-xs gap-2">
                      <span>📭</span>
                      <span>{isHi ? "कोई वॉलपेपर नहीं मिला।" : "No wallpapers found matching query."}</span>
                    </div>
                  ) : (
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-6 w-full">
                      {filteredWallpapers.map((wp) => (
                        <div
                          key={wp.id}
                          className="bg-stone-950/20 border border-amber-955/15 rounded-2xl p-1.5 relative flex flex-col group overflow-hidden cursor-pointer hover:border-amber-500/30 active:scale-[0.98] transition-all"
                          onClick={() => handleWallpaperAction(wp)}
                        >
                          <div className="w-full aspect-[2/3] rounded-xl overflow-hidden relative">
                            <img 
                              src={wp.imageUrl} 
                              alt={wp.name} 
                              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 pointer-events-none" 
                            />
                            
                            {/* Overlay detail label */}
                            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/10 to-transparent opacity-0 group-hover:opacity-100 transition-all duration-300 flex flex-col justify-end p-3 text-left">
                              <span className="text-[7px] font-sans font-black text-amber-400 uppercase tracking-widest leading-none">
                                {wp.deity}
                              </span>
                              <h4 className="font-serif text-[11px] font-bold text-white mt-1 leading-tight truncate">
                                {isHi ? wp.nameHindi : wp.name}
                              </h4>
                            </div>

                            {/* Download Action Float Trigger */}
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleWallpaperAction(wp);
                              }}
                              className="absolute bottom-2.5 right-2.5 w-8.5 h-8.5 rounded-full bg-white hover:bg-amber-100 text-black flex items-center justify-center shadow-lg active:scale-90 transition-transform focus:outline-none"
                            >
                              <Download className="w-3.5 h-3.5 text-black" />
                            </button>

                            {/* Free Tag Label */}
                            <span className="absolute top-2 right-2 text-[8px] font-sans font-black uppercase tracking-widest px-2 py-0.5 rounded-full bg-[#fbbf24]/10 border border-[#fbbf24]/30 text-[#fbbf24]">
                              {wp.tier}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Call Out banner */}
                <div className="w-full bg-gradient-to-r from-amber-500/10 via-amber-500/15 to-orange-500/10 border border-amber-500/20 rounded-2xl p-5 flex items-center justify-between shadow-xl mt-4 select-none">
                  <div className="flex items-center gap-3.5">
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center text-black shadow-md shrink-0">
                      <Sparkles className="w-6 h-6 text-black fill-current animate-pulse" />
                    </div>
                    <div className="text-left">
                      <h4 className="font-serif text-sm font-bold text-amber-200">
                        {isHi ? "महाभक्त प्रीमियम कलेक्शन" : "Mahabhakt Premium Collection"}
                      </h4>
                      <p className="text-[10px] font-sans text-amber-200/60 mt-0.5 font-semibold leading-none">
                        108+ Exclusive Wallpapers
                      </p>
                      <p className="text-[9px] font-sans text-amber-200/40 mt-1.5 leading-none">
                        {isHi ? "एचडी गुणवत्ता • विज्ञापन-मुक्त • प्रीमियम अनुभव" : "HD Quality • Ad-Free • Premium Experience"}
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => navigate("/pricing")}
                    className="px-4 py-2.5 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-black font-sans text-[10px] font-black uppercase tracking-widest rounded-xl transition-all active:scale-95 flex items-center gap-1 shadow-md shrink-0 cursor-pointer"
                  >
                    <span>{isHi ? "एक्सप्लोर करें" : "Explore Now"}</span>
                    <span className="font-bold">→</span>
                  </button>
                </div>
              </div>
            )}

            {/* B. LIVE WALLPAPERS TAB */}
            {wallpaperType === "live" && (
              <div className="w-full flex flex-col items-center space-y-9 animate-fade-in">
                {/* Categories Live Deity filter */}
                <div className="w-full flex flex-col">
                  <div className="flex items-center justify-between w-full mb-3.5 px-1">
                    <h3 className="font-serif text-xs sm:text-sm font-black text-amber-100 tracking-widest uppercase flex items-center gap-2">
                      <span className="text-amber-500">🕉️</span>
                      {isHi ? "सजीव देवता दर्शन" : "Live Deity Categories"}
                    </h3>
                    <button
                      onClick={() => setSelectedDeityFilter(null)}
                      className="font-sans text-[10px] font-bold text-amber-500/80 hover:text-amber-400 flex items-center gap-1 active:scale-95 transition-all"
                    >
                      <span>{isHi ? "सभी देखें" : "View All"}</span>
                      <span>&gt;</span>
                    </button>
                  </div>

                  <div className="flex items-center gap-6 overflow-x-auto pb-4 pt-1 scrollbar-none justify-start w-full scroll-smooth">
                    {[
                      { id: null, name: "सभी", nameEn: "All", isIcon: true, symbol: "🕉️", image: "" },
                      { id: "Shiva", name: "शिव", nameEn: "Shiva", isIcon: false, symbol: "", image: shivWallpaperImg },
                      { id: "Rama", name: "राम", nameEn: "Ram", isIcon: false, symbol: "", image: deityRamImg },
                      { id: "Krishna", name: "कृष्ण", nameEn: "Krishna", isIcon: false, symbol: "", image: krishnaImg },
                      { id: "Hanuman", name: "हनुमान", nameEn: "Hanuman", isIcon: false, symbol: "", image: hanumanImg }
                    ].map((deity) => {
                      const isActive = selectedDeityFilter === deity.id;
                      const hasImg = !deity.isIcon;
                      return (
                        <button
                          key={deity.id ?? "all"}
                          onClick={() => setSelectedDeityFilter(deity.id)}
                          className="flex flex-col items-center gap-2 outline-none focus:outline-none focus:ring-0 focus-visible:outline-none focus-visible:ring-0 transition-all active:scale-95 shrink-0 group"
                        >
                          <div className={`w-12 h-12 relative transition-all duration-300 flex items-center justify-center border-2 ${
                            hasImg ? "rounded-full" : "rounded-2xl"
                          } ${
                            isActive 
                              ? "border-amber-400 bg-gradient-to-tr from-amber-500/35 to-orange-500/20 ring-4 ring-amber-500/25 scale-105 shadow-[0_0_10px_rgba(245,158,11,0.4)]"
                              : hasImg 
                              ? "border-amber-950/40 bg-[#1b0a05] hover:border-amber-500/30"
                              : "border-amber-950/30 bg-[#1b0a05] text-amber-500/70 hover:border-amber-500/30"
                          }`}>
                            {deity.isIcon ? (
                              <span className={`text-lg transition-transform group-hover:scale-110 ${isActive ? "text-amber-300" : "text-amber-500/60 font-black"}`}>
                                {deity.symbol}
                              </span>
                            ) : (
                              <img src={deity.image} alt={deity.nameEn} className="w-full h-full object-cover rounded-full pointer-events-none" />
                            )}
                            {isActive && (
                              <span className="absolute bottom-0 right-0 w-3 h-3 bg-amber-500 rounded-full border border-[#0d0502] flex items-center justify-center shadow-md">
                                <span className="w-1.5 h-1.5 bg-[#0d0502] rounded-full" />
                              </span>
                            )}
                          </div>
                          <span className={`text-[10px] font-bold tracking-wide transition-colors ${
                            isActive ? "text-amber-400 font-extrabold" : "text-stone-400 group-hover:text-stone-200"
                          }`}>
                            {isHi ? deity.name : deity.nameEn}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Today's Recommended Live Leela */}
                {!selectedDeityFilter && !searchQuery && (
                  <div className="w-full flex flex-col">
                    <div className="flex items-center justify-between w-full mb-3.5 px-1">
                      <h3 className="font-serif text-xs sm:text-sm font-black text-amber-100 tracking-widest uppercase flex items-center gap-2">
                        <span className="text-amber-500">🌌</span>
                        {isHi ? "आज की दिव्य सजीव लीला" : "Today's Living Darshan recommendation"}
                      </h3>
                      <span className="text-[9px] font-sans text-amber-500 bg-amber-500/10 px-2 py-0.5 rounded-full font-black animate-pulse">
                        {isHi ? "सक्रिय तानपुरा धुन" : "Tanpura Drone Active"}
                      </span>
                    </div>

                    <div className="w-full bg-gradient-to-b from-[#211009] to-[#0f0604] border border-[#fbbf24]/20 rounded-2xl p-2.5 relative flex flex-col group overflow-hidden shadow-2xl">
                      <div className="w-full aspect-[16/9] rounded-xl overflow-hidden relative">
                        {/* Interactive glow effect */}
                        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(251,191,36,0.18)_0%,transparent_70%)] animate-pulse" style={{ animationDuration: '4s' }} />
                        <img 
                          src={radhaKrishnaImg} 
                          alt="Vrindavan Leela Live Recommendation" 
                          className="w-full h-full object-cover scale-102 animate-pulse pointer-events-none" 
                          style={{ animationDuration: '6s' }}
                        />

                        {/* Floating live particle overlay */}
                        <div className="absolute inset-0 pointer-events-none overflow-hidden">
                          <div className="absolute top-[-10px] left-[20%] text-xs opacity-50 animate-bounce">🌸</div>
                          <div className="absolute top-[-5px] left-[50%] text-xs opacity-40 animate-bounce" style={{ animationDelay: '1.2s' }}>🌼</div>
                          <div className="absolute top-[-15px] left-[80%] text-xs opacity-60 animate-bounce" style={{ animationDelay: '0.6s' }}>🌸</div>
                        </div>

                        <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/30 to-transparent flex flex-col justify-end p-5 text-left">
                          <div className="flex justify-between items-end w-full">
                            <div>
                              <span className="text-[8px] font-sans font-black text-amber-400 uppercase tracking-widest px-2 py-0.5 rounded bg-black/60 border border-amber-500/20 mb-2 inline-block">
                                Vrindavan Live
                              </span>
                              <h4 className="font-serif text-base sm:text-lg font-bold text-amber-100">
                                {isHi ? "राधा-कृष्ण दिव्य रास" : "Radha-Krishna Divine Raas"}
                              </h4>
                              <p className="text-[11px] font-sans text-amber-200/60 mt-1 font-semibold">
                                {isHi ? "पुष्प वर्षा एवं दिव्य आभा मंडल के साथ..." : "With slow shower of divine petals and aura glow..."}
                              </p>
                            </div>
                            <button
                              onClick={() => handleLiveWallpaperAction(LIVE_WALLPAPERS_LIST[0])}
                              className="px-4 py-2 bg-white text-black hover:bg-amber-100 rounded-full font-sans text-[10px] font-black uppercase tracking-wider transition-all active:scale-95 flex items-center gap-1.5 shadow-lg shadow-black/40"
                            >
                              <Sparkles className="w-3.5 h-3.5 text-black fill-current animate-spin" style={{ animationDuration: '3s' }} />
                              <span>{isHi ? "सजीव प्रीव्यू" : "Preview Live"}</span>
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Live Backdrops Grid list */}
                <div className="w-full flex flex-col">
                  <div className="flex items-center justify-between w-full mb-4 px-1">
                    <h3 className="font-serif text-xs sm:text-sm font-black text-amber-100 uppercase tracking-widest flex items-center gap-2">
                      <span className="text-amber-500">🎬</span>
                      {isHi ? "सजीव वॉलपेपर गैलरी" : "Living Darshan Feed"}
                    </h3>
                    <span className="text-[10px] font-bold font-sans text-amber-200/30">
                      {filteredLiveWallpapers.length} {isHi ? "लाइव वॉलपेपर" : "Live backdrops"}
                    </span>
                  </div>

                  {filteredLiveWallpapers.length === 0 ? (
                    <div className="w-full py-16 border border-dashed border-amber-900/20 rounded-2xl flex flex-col items-center justify-center text-stone-500 font-sans text-xs gap-2">
                      <span>📭</span>
                      <span>{isHi ? "कोई लाइव वॉलपेपर नहीं मिला।" : "No live wallpapers found matching query."}</span>
                    </div>
                  ) : (
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-6 w-full">
                      {filteredLiveWallpapers.map((wp) => (
                        <div
                          key={wp.id}
                          className="bg-stone-950/20 border border-amber-955/15 rounded-2xl p-1.5 relative flex flex-col group overflow-hidden cursor-pointer hover:border-amber-500/30 active:scale-[0.98] transition-all"
                          onClick={() => handleLiveWallpaperAction(wp)}
                        >
                          <div className="w-full aspect-[2/3] rounded-xl overflow-hidden relative">
                            {/* Live effects preview */}
                            {wp.effect === "aura" && (
                              <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(251,191,36,0.18)_0%,transparent_75%)] pointer-events-none z-10 animate-pulse" style={{ animationDuration: '2.5s' }} />
                            )}
                            {wp.effect === "shimmer" && (
                              <div className="absolute inset-0 bg-[linear-gradient(45deg,transparent_20%,rgba(255,255,255,0.08)_50%,transparent_80%)] pointer-events-none z-10 bg-[length:200%_200%] animate-shimmer" style={{ animationDuration: '2.5s' }} />
                            )}
                            {wp.effect === "flame" && (
                              <div className="absolute inset-0 bg-gradient-to-t from-orange-500/10 via-transparent to-transparent pointer-events-none z-10 animate-pulse" style={{ animationDuration: '1.5s' }} />
                            )}

                            <img 
                              src={wp.thumbnailUrl} 
                              alt={wp.name} 
                              className="w-full h-full object-cover scale-102 group-hover:scale-106 transition-transform duration-500 pointer-events-none" 
                            />
                            
                            {/* Motion Tag */}
                            <div className="absolute top-2.5 left-2.5 z-10 flex gap-1">
                              <span className="text-[7px] font-sans font-black uppercase tracking-widest px-1.5 py-0.5 rounded bg-black/60 border border-amber-500/20 text-amber-400">
                                {wp.effect}
                              </span>
                            </div>

                            {/* Details overlay */}
                            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/10 to-transparent opacity-0 group-hover:opacity-100 transition-all duration-300 flex flex-col justify-end p-3 text-left z-10">
                              <span className="text-[7px] font-sans font-black text-amber-400 uppercase tracking-widest leading-none">
                                {wp.deity}
                              </span>
                              <h4 className="font-serif text-[11px] font-bold text-white mt-1 leading-tight truncate">
                                {isHi ? wp.nameHindi : wp.name}
                              </h4>
                            </div>

                            {/* Download Action button */}
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleLiveWallpaperAction(wp);
                              }}
                              className="absolute bottom-2.5 right-2.5 w-8.5 h-8.5 rounded-full bg-white hover:bg-amber-100 text-black flex items-center justify-center shadow-lg active:scale-90 transition-transform focus:outline-none z-20"
                            >
                              <Sparkles className="w-5 h-5 text-black fill-current animate-pulse" />
                            </button>

                            {/* Tier Tag label */}
                            <span className="absolute top-2 right-2 text-[8px] font-sans font-black uppercase tracking-widest px-2 py-0.5 rounded-full bg-[#fbbf24]/10 border border-[#fbbf24]/30 text-[#fbbf24] z-10">
                              {wp.tier}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Help tip card */}
                <div className="w-full bg-[#1b0d07]/40 border border-amber-950/20 rounded-2xl p-4 flex flex-col items-center gap-2 select-none">
                  <span className="text-xs text-amber-400">
                    💡 {isHi ? "सजीव वॉलपेपर कैसे लगाएं?" : "How to Apply Live Wallpapers?"}
                  </span>
                  <p className="text-[9px] font-sans text-amber-200/50 text-center tracking-wide leading-relaxed max-w-md">
                    {isHi 
                      ? "सजीव वॉलपेपर डाउनलोड करने पर आपको एक एचडी मोशन जिफ/वेबपी प्राप्त होगी। आप इसे किसी भी तृतीय-पक्ष लाइव वॉलपेपर लॉन्चर की सहायता से अपने एंड्रॉइड या आईओएस लॉकस्क्रीन पर सेट कर सकते हैं।" 
                      : "Downloading a live wallpaper grants you an HD motion webp/gif file. You can apply it directly to your lock screen using any standard live wallpaper settings on Android or iOS."}
                  </p>
                </div>
              </div>
            )}
          </div>
        )}

        {/* ========================================================= */}
        {/* TAB 3: MY SAVED GALLERY DIARY                             */}
        {/* ========================================================= */}
        {activeTab === "saved" && (
          <div className="w-full space-y-5 flex flex-col items-center animate-fade-in">
            {/* Title / Description */}
            <div className="text-center">
              <h2 className="font-serif text-base font-bold text-amber-400">
                {isHi ? "मेरी पावन साधना गैलरी" : "My Sadhana Diary"}
              </h2>
              <p className="text-xs text-amber-200/60 font-sans mt-1">
                {isHi ? "आपके द्वारा पूर्व में सहेजे गए दैनिक आशीर्वाद पत्र" : "Revisit your personalized cards saved on this device"}
              </p>
            </div>

            {savedBlessings.length === 0 ? (
              <div className="w-full border border-dashed border-amber-900/30 rounded-3xl p-10 flex flex-col items-center justify-center text-center gap-3">
                <BookOpen className="w-8 h-8 text-amber-500/30" />
                <p className="text-xs text-amber-200/40 font-sans">
                  {isHi ? "अभी तक कोई आशीर्वाद पत्र संग्रहित नहीं है।" : "Your spiritual diary is empty."}
                </p>
                <button
                  onClick={() => setActiveTab("maker")}
                  className="px-4 py-2 border border-amber-500/20 hover:bg-amber-500/10 text-amber-300 font-sans font-black text-[10px] uppercase tracking-widest rounded-lg transition-all active:scale-95"
                >
                  {isHi ? "आशीर्वाद पत्र बनाएं" : "Create Blessing Now"}
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3.5 w-full select-none">
                {savedBlessings.map((url, idx) => (
                  <div
                    key={idx}
                    className="bg-[#1b0d07]/40 border border-amber-950/20 rounded-2xl p-1.5 relative group overflow-hidden"
                  >
                    <img src={url} alt="saved card" className="w-full h-auto rounded-xl pointer-events-none" />
                    
                    {/* Hover controls overlay */}
                    <div className="absolute inset-0 bg-black/65 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                      <button
                        onClick={async () => {
                          try {
                            const res = await fetch(url);
                            const blob = await res.blob();
                            const file = new File([blob], `Blessing_${idx}.png`, { type: "image/png" });
                            if (navigator.share) {
                              await navigator.share({ files: [file] });
                            } else {
                              const link = document.createElement("a");
                              link.download = `Sadhana_Blessing_${idx}.png`;
                              link.href = url;
                              link.click();
                            }
                          } catch (_) {}
                        }}
                        className="w-10 h-10 rounded-full bg-amber-500 text-black flex items-center justify-center hover:scale-105 active:scale-95 transition-transform focus:outline-none"
                      >
                        <Share2 className="w-5 h-5 text-black" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </main>

      {/* ========================================================= */}
      {/* ─── NEW SIDE-BY-SIDE PREMIUM WALLPAPER PREVIEW MODAL ─── */}
      {/* ========================================================= */}
      <AnimatePresence>
        {showPreviewModal && (() => {
          const wp = WALLPAPERS_LIST.find((w) => w.id === showPreviewModal);
          if (!wp) return null;
          return (
            <>
              {/* Wallpaper Background (dimmed) */}
              <div className="fixed inset-0 z-[121] select-none pointer-events-none overflow-hidden">
                <img
                  src={wp.imageUrl}
                  alt=""
                  className="w-full h-full object-cover scale-105 filter brightness-[0.65] transition-all duration-300"
                />
              </div>

              {/* Click-to-close Overlay */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setShowPreviewModal(null)}
                className="fixed inset-0 bg-black/30 backdrop-blur-xs z-[122] select-none cursor-pointer"
              />

              {/* Top Bar Controls */}
              <div className="fixed top-5 inset-x-5 flex justify-between items-center z-[140] select-none">
                <button
                  onClick={() => setShowPreviewModal(null)}
                  className="w-10 h-10 rounded-full bg-black/40 backdrop-blur-md border border-white/10 flex items-center justify-center text-white hover:bg-black/60 transition-colors cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleShareWallpaper(wp)}
                    className="w-10 h-10 rounded-full bg-black/40 backdrop-blur-md border border-white/10 flex items-center justify-center text-white hover:bg-black/60 transition-colors cursor-pointer"
                  >
                    <Share2 className="w-4.5 h-4.5" />
                  </button>
                  <button className="w-10 h-10 rounded-full bg-black/40 backdrop-blur-md border border-white/10 flex items-center justify-center text-white hover:bg-black/60 transition-colors cursor-pointer">
                    <MoreIcon className="w-4.5 h-4.5" />
                  </button>
                </div>
              </div>



              {/* Reconstructed Side-by-side Modal Frame */}
              <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 50 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 50 }}
                transition={{ type: "spring", damping: 25, stiffness: 185 }}
                style={{ backgroundColor: "rgba(20, 10, 5, 0.75)" }}
                className="fixed bottom-[10%] left-[4%] right-[4%] max-w-sm md:max-w-2xl mx-auto backdrop-blur-xl border border-amber-500/20 rounded-[2rem] p-4 md:p-6 shadow-[0_20px_50px_rgba(0,0,0,0.9)] z-[130] flex flex-row items-center justify-between overflow-visible"
              >
                
                {/* 1. LEFT SIDE: Info & CTA Card details */}
                <div className="w-[55%] flex flex-col justify-between self-stretch py-1 gap-2 md:gap-3.5 select-none text-left">
                  <div className="space-y-3.5 md:space-y-5">
                    {/* Header title */}
                    <div className="space-y-1">
                      <h2 className="text-base md:text-2xl font-black font-hindi text-amber-100 leading-tight">
                        {isHi ? wp.nameHindi : wp.name}
                      </h2>
                    </div>

                    {/* Toggle Pills Selection (Home screen vs Lock screen) - Segmented Control */}
                    <div className="flex bg-stone-950/60 border border-amber-500/10 rounded-full p-0.5 max-w-[240px] select-none font-sans text-[10px] md:text-xs">
                      <button
                        onClick={() => setPreviewMode("lock")}
                        className={`flex-1 flex items-center justify-center gap-1 py-1.5 px-2 md:px-3.5 rounded-full transition-all duration-200 cursor-pointer ${
                          previewMode === "lock"
                            ? "bg-amber-500 text-stone-950 font-bold shadow-md"
                            : "bg-transparent text-amber-200/50 hover:text-amber-200"
                        }`}
                      >
                        <Lock className="w-3 h-3" />
                        <span>{isHi ? "लॉक" : "Lock"}</span>
                      </button>
                      <button
                        onClick={() => setPreviewMode("home")}
                        className={`flex-1 flex items-center justify-center gap-1 py-1.5 px-2 md:px-3.5 rounded-full transition-all duration-200 cursor-pointer ${
                          previewMode === "home"
                            ? "bg-amber-500 text-stone-950 font-bold shadow-md"
                            : "bg-transparent text-amber-200/50 hover:text-amber-200"
                        }`}
                      >
                        <Smartphone className="w-3 h-3" />
                        <span>{isHi ? "होम" : "Home"}</span>
                      </button>
                    </div>
                  </div>

                  {/* Actions CTA buttons container at bottom */}
                  <div className="space-y-2 mt-4 md:mt-0 select-none">
                    <button
                      onClick={() => handleDownloadWallpaper(wp)}
                      className="w-full py-2 md:py-3.5 bg-gradient-to-r from-amber-400 via-orange-500 to-amber-500 hover:from-amber-500 hover:to-orange-600 text-stone-950 font-sans font-black text-[9px] md:text-xs uppercase tracking-widest rounded-xl md:rounded-2xl transition-all active:scale-[0.96] flex items-center justify-center gap-1.5 focus:outline-none shadow-[0_4px_12px_rgba(245,158,11,0.25)] border border-amber-400/20 cursor-pointer"
                    >
                      <Download className="w-4 h-4 text-stone-950" />
                      <span>{isHi ? "डाउनलोड" : "Download"}</span>
                    </button>
                    
                    <button
                      onClick={() => toggleSaveWallpaper(wp.id)}
                      className="w-full py-1.5 md:py-2.5 border border-amber-500/30 hover:border-amber-500/50 bg-black/30 hover:bg-black/50 text-amber-400 font-sans font-black text-[9px] md:text-xs uppercase tracking-widest rounded-xl md:rounded-2xl transition-all active:scale-[0.96] flex items-center justify-center gap-1.5 focus:outline-none cursor-pointer"
                    >
                      <Heart className={`w-4 h-4 ${savedWallpapers.includes(wp.id) ? "fill-amber-500 text-amber-500" : "text-amber-400"}`} />
                      <span>
                        {savedWallpapers.includes(wp.id) 
                          ? (isHi ? "सहेजा गया" : "Saved") 
                          : (isHi ? "सहेजें" : "Save")}
                      </span>
                    </button>
                  </div>
                </div>

                {/* 2. RIGHT SIDE: Realistic Phone Mockup panel */}
                <div 
                  className="w-[42%] flex items-center justify-center relative overflow-visible self-stretch"
                  onTouchStart={handleTouchStart}
                  onTouchEnd={(e) => handleTouchEnd(e, WALLPAPERS_LIST, wp.id, setShowPreviewModal)}
                >
                  <div className="absolute -top-20 md:-top-36 z-30 transition-transform active:scale-[0.98]">
                    <PhoneFrame imageUrl={wp.imageUrl} previewMode={previewMode} />
                  </div>
                </div>
              </motion.div>

              {/* Swipe Help instruction at absolute bottom */}
              <div className="fixed bottom-4 inset-x-0 flex items-center justify-center gap-1 text-[9px] uppercase tracking-widest font-sans text-amber-200/55 pointer-events-none select-none z-[131]">
                <span className="text-amber-500/60">❈</span>
                <span>👆 {isHi ? "स्वाइप करें और वॉलपेपर देखें" : "Swipe to change"}</span>
                <span className="text-amber-500/60">❈</span>
              </div>
            </>
          );
        })()}
      </AnimatePresence>

      {/* ========================================================= */}
      {/* ─── NEW PREMIUM LIVE WALLPAPER PREVIEW MODAL ───────────── */}
      {/* ========================================================= */}
      <AnimatePresence>
        {showLivePreviewModal && (() => {
          const wp = LIVE_WALLPAPERS_LIST.find((w) => w.id === showLivePreviewModal);
          if (!wp) return null;
          return (
            <>
              {/* Wallpaper Background (dimmed) */}
              <div className="fixed inset-0 z-[121] select-none pointer-events-none overflow-hidden">
                <img
                  src={wp.thumbnailUrl}
                  alt=""
                  className="w-full h-full object-cover scale-105 filter brightness-[0.65] transition-all duration-300"
                />
              </div>

              {/* Click-to-close Overlay */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setShowLivePreviewModal(null)}
                className="fixed inset-0 bg-black/30 backdrop-blur-xs z-[122] select-none cursor-pointer"
              />

              {/* Top Bar Controls */}
              <div className="fixed top-5 inset-x-5 flex justify-between items-center z-[140] select-none">
                <button
                  onClick={() => setShowLivePreviewModal(null)}
                  className="w-10 h-10 rounded-full bg-black/40 backdrop-blur-md border border-white/10 flex items-center justify-center text-white hover:bg-black/60 transition-colors cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleShareWallpaper(wp)}
                    className="w-10 h-10 rounded-full bg-black/40 backdrop-blur-md border border-white/10 flex items-center justify-center text-white hover:bg-black/60 transition-colors cursor-pointer"
                  >
                    <Share2 className="w-4.5 h-4.5" />
                  </button>
                  <button className="w-10 h-10 rounded-full bg-black/40 backdrop-blur-md border border-white/10 flex items-center justify-center text-white hover:bg-black/60 transition-colors cursor-pointer">
                    <MoreIcon className="w-4.5 h-4.5" />
                  </button>
                </div>
              </div>



              {/* Side-by-side Modal Frame */}
              <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 50 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 50 }}
                transition={{ type: "spring", damping: 25, stiffness: 185 }}
                style={{ backgroundColor: "rgba(20, 10, 5, 0.75)" }}
                className="fixed bottom-[10%] left-[4%] right-[4%] max-w-sm md:max-w-2xl mx-auto backdrop-blur-xl border border-amber-500/20 rounded-[2rem] p-4 md:p-6 shadow-[0_20px_50px_rgba(0,0,0,0.9)] z-[130] flex flex-row items-center justify-between overflow-visible"
              >
                
                {/* 1. LEFT SIDE: Info & CTA */}
                <div className="w-[55%] flex flex-col justify-between self-stretch py-1 gap-2 md:gap-3.5 select-none text-left">
                  <div className="space-y-3.5 md:space-y-5">
                    {/* Header title */}
                    <div className="space-y-1">
                      <h2 className="text-base md:text-2xl font-black font-hindi text-amber-100 leading-tight flex items-center gap-2">
                        <span className="truncate">{isHi ? wp.nameHindi : wp.name}</span>
                        <span className="px-1 py-0.5 rounded bg-amber-500/20 border border-amber-500/30 text-amber-400 text-[7px] md:text-[9px] font-sans font-bold uppercase tracking-wider leading-none">
                          {wp.effect}
                        </span>
                      </h2>
                    </div>

                    {/* Toggle Pills Selection - Segmented Control */}
                    <div className="flex bg-stone-950/60 border border-amber-500/10 rounded-full p-0.5 max-w-[240px] select-none font-sans text-[10px] md:text-xs">
                      <button
                        onClick={() => setPreviewMode("lock")}
                        className={`flex-1 flex items-center justify-center gap-1 py-1.5 px-2 md:px-3.5 rounded-full transition-all duration-200 cursor-pointer ${
                          previewMode === "lock"
                            ? "bg-amber-500 text-stone-950 font-bold shadow-md"
                            : "bg-transparent text-amber-200/50 hover:text-amber-200"
                        }`}
                      >
                        <Lock className="w-3 h-3" />
                        <span>{isHi ? "लॉक" : "Lock"}</span>
                      </button>
                      <button
                        onClick={() => setPreviewMode("home")}
                        className={`flex-1 flex items-center justify-center gap-1 py-1.5 px-2 md:px-3.5 rounded-full transition-all duration-200 cursor-pointer ${
                          previewMode === "home"
                            ? "bg-amber-500 text-stone-950 font-bold shadow-md"
                            : "bg-transparent text-amber-200/50 hover:text-amber-200"
                        }`}
                      >
                        <Smartphone className="w-3 h-3" />
                        <span>{isHi ? "होम" : "Home"}</span>
                      </button>
                    </div>
                  </div>

                  {/* Actions CTA buttons container at bottom */}
                  <div className="space-y-2 mt-4 md:mt-0 select-none">
                    <button
                      onClick={() => handleDownloadLiveWallpaper(wp)}
                      className="w-full py-2 md:py-3.5 bg-gradient-to-r from-amber-400 via-orange-500 to-amber-500 hover:from-amber-500 hover:to-orange-600 text-stone-950 font-sans font-black text-[9px] md:text-xs uppercase tracking-widest rounded-xl md:rounded-2xl transition-all active:scale-[0.96] flex items-center justify-center gap-1.5 focus:outline-none shadow-[0_4px_12px_rgba(245,158,11,0.25)] border border-amber-400/20 cursor-pointer"
                    >
                      <CustomDownloadIcon className="w-4 h-4 text-stone-950" />
                      <span>{isHi ? "डाउनलोड" : "Download"}</span>
                    </button>
                    
                    <button
                      onClick={() => toggleSaveWallpaper(wp.id)}
                      className="w-full py-1.5 md:py-2.5 border border-amber-500/30 hover:border-amber-500/50 bg-black/30 hover:bg-black/50 text-amber-400 font-sans font-black text-[9px] md:text-xs uppercase tracking-widest rounded-xl md:rounded-2xl transition-all active:scale-[0.96] flex items-center justify-center gap-1.5 focus:outline-none cursor-pointer"
                    >
                      <Heart className={`w-4 h-4 ${savedWallpapers.includes(wp.id) ? "fill-amber-500 text-amber-500" : "text-amber-400"}`} />
                      <span>
                        {savedWallpapers.includes(wp.id) 
                          ? (isHi ? "सहेजा गया" : "Saved") 
                          : (isHi ? "सहेजें" : "Save")}
                      </span>
                    </button>
                  </div>
                </div>

                {/* 2. RIGHT SIDE: Phone Mockup panel */}
                <div 
                  className="w-[42%] flex items-center justify-center relative overflow-visible self-stretch"
                  onTouchStart={handleTouchStart}
                  onTouchEnd={(e) => handleTouchEnd(e, LIVE_WALLPAPERS_LIST, wp.id, setShowLivePreviewModal)}
                >
                  <div className="absolute -top-20 md:-top-36 z-30 transition-transform active:scale-[0.98]">
                    <PhoneFrame imageUrl={wp.thumbnailUrl} previewMode={previewMode} effect={wp.effect} />
                  </div>
                </div>
              </motion.div>

              {/* Swipe Help instruction at absolute bottom */}
              <div className="fixed bottom-4 inset-x-0 flex items-center justify-center gap-1 text-[9px] uppercase tracking-widest font-sans text-amber-200/55 pointer-events-none select-none z-[131]">
                <span className="text-amber-500/60">❈</span>
                <span>👆 {isHi ? "स्वाइप करें और वॉलपेपर देखें" : "Swipe to change"}</span>
                <span className="text-amber-500/60">❈</span>
              </div>
            </>
          );
        })()}
      </AnimatePresence>

      {/* ─── PREMIUM TEMPLATE UPGRADE MODAL ──────────────────────────── */}
      <AnimatePresence>
        {showPremiumTplModal && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowPremiumTplModal(null)}
              className="fixed inset-0 bg-black/90 z-[120] backdrop-blur-md"
            />
            {/* Modal */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 25 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 25 }}
              className="fixed inset-x-4 top-[25%] max-w-sm mx-auto bg-gradient-to-b from-[#1c0d06] to-[#0e0502] border border-amber-500/25 rounded-3xl p-6 shadow-2xl z-[130] flex flex-col items-center text-center gap-4"
            >
              <div className="w-14 h-14 rounded-full bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400">
                <Lock className="w-6 h-6 text-amber-400 animate-pulse" />
              </div>

              <div className="space-y-1">
                <h3 className="font-serif text-base font-black text-amber-400 uppercase tracking-widest">
                  {isHi ? "गर्भगृह थीम अनलॉक करें" : "Unlock Garbhagriha Theme"}
                </h3>
                <p className="text-xs text-amber-200/60 font-sans leading-relaxed">
                  {isHi 
                    ? `इस मंदिर थीम को अनलॉक करने के लिए अपग्रेड करें। काशी सिंदूरी और वृंदावन मयूर थीम प्रीमियम सदस्यों के लिए उपलब्ध हैं।`
                    : `Upgrade your membership to use premium borders. Premium themes are reserved for Devotee and Mahabhakt tiers.`}
                </p>
              </div>

              <div className="w-full flex flex-col gap-2.5 mt-2">
                <button
                  onClick={navigateToPricing}
                  className="w-full py-3.5 bg-gradient-to-r from-amber-500 to-amber-600 text-black font-sans font-black text-xs uppercase tracking-widest rounded-xl transition-all active:scale-[0.96] flex items-center justify-center gap-1.5 focus:outline-none"
                >
                  <Sparkles className="w-4 h-4 text-black fill-current" />
                  <span>{isHi ? "अभी अनलॉक करें" : "Upgrade Membership"}</span>
                </button>
                
                <button
                  onClick={() => setShowPremiumTplModal(null)}
                  className="w-full py-2.5 border border-amber-500/10 bg-black/30 text-amber-300 font-sans font-black text-[9px] uppercase tracking-widest rounded-xl transition-all active:scale-[0.96] focus:outline-none"
                >
                  {isHi ? "वापस जाएं" : "Close"}
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* ─── CUSTOM SHARE SHEET MODAL ──────────────────────────── */}
      <AnimatePresence>
        {shareModalData && (() => {
          const handleShareOption = (platform: "whatsapp" | "telegram" | "email" | "copy") => {
            const encodedText = encodeURIComponent(`${shareModalData.text}\n${shareModalData.url}`);
            if (platform === "whatsapp") {
              const url = `https://api.whatsapp.com/send?text=${encodedText}`;
              window.open(url, "_blank", "noopener,noreferrer");
            } else if (platform === "telegram") {
              const url = `https://t.me/share/url?url=${encodeURIComponent(shareModalData.url)}&text=${encodeURIComponent(shareModalData.text)}`;
              window.open(url, "_blank", "noopener,noreferrer");
            } else if (platform === "email") {
              const url = `mailto:?subject=${encodeURIComponent(shareModalData.title)}&body=${encodedText}`;
              window.open(url, "_blank", "noopener,noreferrer");
            } else if (platform === "copy") {
              copyTextToClipboard(shareModalData.url).then((success) => {
                if (success) {
                  setCopiedState(true);
                  toast.success(isHi ? "लिंक क्लिपबोर्ड पर कॉपी की गई!" : "Link copied to clipboard!");
                  setTimeout(() => setCopiedState(false), 2000);
                } else {
                  toast.error(isHi ? "लिंक कॉपी करने में विफल" : "Failed to copy link");
                }
              });
            }
          };

          return (
            <>
              {/* Backdrop */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setShareModalData(null)}
                className="fixed inset-0 bg-black/75 z-[150] backdrop-blur-sm"
              />
              
              {/* Drawer Container */}
              <motion.div
                initial={{ opacity: 0, y: "100%" }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: "100%" }}
                transition={{ type: "spring", damping: 25, stiffness: 200 }}
                className="fixed inset-x-0 bottom-0 max-w-md mx-auto bg-gradient-to-b from-[#1c0d06] to-[#0e0502] border-t border-amber-500/30 rounded-t-[2.5rem] p-6 shadow-[0_-15px_40px_rgba(0,0,0,0.8)] z-[160] select-none flex flex-col gap-5 pb-8 md:bottom-auto md:top-[30%] md:rounded-[2rem] md:border"
              >
                {/* Drag handle / Indicator on mobile */}
                <div className="w-12 h-1 bg-amber-500/20 rounded-full mx-auto md:hidden" />

                <div className="flex justify-between items-center">
                  <h3 className="font-serif text-lg font-black text-amber-400 uppercase tracking-widest">
                    {isHi ? "साझा करें" : "Share Wallpaper"}
                  </h3>
                  <button
                    onClick={() => setShareModalData(null)}
                    className="w-8 h-8 rounded-full bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/20 flex items-center justify-center text-amber-400 transition-colors"
                  >
                    <X className="w-4.5 h-4.5" />
                  </button>
                </div>

                <div className="text-left py-1">
                  <span className="text-[10px] uppercase font-sans font-black text-amber-500/60 tracking-wider">
                    {isHi ? "वॉलपेपर का नाम" : "Wallpaper"}
                  </span>
                  <p className="font-serif text-sm font-bold text-amber-100 truncate mt-0.5">
                    {shareModalData.wpName || (isHi ? "पावन वॉलपेपर" : "Spiritual Wallpaper")}
                  </p>
                </div>

                {/* Share Options Grid */}
                <div className="grid grid-cols-2 gap-3.5">
                  {/* WhatsApp */}
                  <button
                    onClick={() => handleShareOption("whatsapp")}
                    className="flex items-center gap-3 p-3.5 rounded-2xl bg-gradient-to-br from-emerald-500/10 to-emerald-600/5 hover:from-emerald-500/15 hover:to-emerald-600/10 border border-emerald-500/25 hover:border-emerald-500/40 text-emerald-400 font-sans font-semibold text-xs transition-all active:scale-[0.97] cursor-pointer"
                  >
                    <div className="w-9 h-9 rounded-xl bg-emerald-500/15 border border-emerald-500/25 flex items-center justify-center text-emerald-400">
                      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946C.06 5.348 5.397.01 12.008.01c3.202.001 6.212 1.246 8.477 3.514 2.266 2.268 3.507 5.28 3.505 8.484-.004 6.657-5.34 11.997-11.953 11.997-2.005-.001-3.973-.502-5.724-1.457L0 24zm6.59-4.846c1.6.95 3.188 1.449 4.825 1.451 5.436 0 9.86-4.37 9.864-9.799.002-2.63-1.023-5.101-2.885-6.965C16.59 1.977 14.113.951 12.008.951c-5.442 0-9.866 4.372-9.87 9.802 0 1.714.463 3.39 1.337 4.888l-.99 3.613 3.762-.97zm10.967-7.416c-.365-.18-2.164-1.057-2.499-1.179-.333-.124-.577-.186-.819.177-.243.363-.938 1.179-1.15 1.423-.21.244-.422.271-.787.09-3.57-1.782-4.73-2.614-6.47-5.625-.455-.783.455-.726 1.3-2.399.143-.285.072-.533-.036-.713-.108-.18-.819-1.974-1.122-2.705-.296-.715-.597-.619-.819-.631-.213-.011-.456-.013-.7-.013-.243 0-.639.09-1.004.495-.365.407-1.393 1.343-1.393 3.275 0 1.931 1.402 3.8 1.605 4.07.203.27 2.76 4.17 6.67 5.86 2.44 1.05 3.96 1.1 5.36.89 1.25-.19 2.499-.95 2.85-1.9.35-.95.35-1.76.24-1.93-.11-.17-.4-.27-.765-.45z"/>
                      </svg>
                    </div>
                    <span className="font-sans tracking-wide text-stone-100 hover:text-white">WhatsApp</span>
                  </button>

                  {/* Telegram */}
                  <button
                    onClick={() => handleShareOption("telegram")}
                    className="flex items-center gap-3 p-3.5 rounded-2xl bg-gradient-to-br from-sky-500/10 to-sky-600/5 hover:from-sky-500/15 hover:to-sky-600/10 border border-sky-500/25 hover:border-sky-500/40 text-sky-400 font-sans font-semibold text-xs transition-all active:scale-[0.97] cursor-pointer"
                  >
                    <div className="w-9 h-9 rounded-xl bg-sky-500/15 border border-sky-500/25 flex items-center justify-center text-sky-400">
                      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M12 0C5.37 0 0 5.37 0 12s5.37 12 12 12 12-5.37 12-12S18.63 0 12 0zm5.89 7.82l-2.02 9.53c-.15.68-.56.85-1.13.53l-3.08-2.27-1.48 1.43c-.16.16-.3.3-.62.3l.22-3.13 5.7-5.15c.25-.22-.05-.35-.38-.13l-7.05 4.44-3.04-.95c-.66-.21-.67-.66.14-.97l11.88-4.58c.55-.2 1.03.13.88.94z"/>
                      </svg>
                    </div>
                    <span className="font-sans tracking-wide text-stone-100 hover:text-white">Telegram</span>
                  </button>

                  {/* Email */}
                  <button
                    onClick={() => handleShareOption("email")}
                    className="flex items-center gap-3 p-3.5 rounded-2xl bg-gradient-to-br from-amber-500/10 to-amber-600/5 hover:from-amber-500/15 hover:to-amber-600/10 border border-amber-500/20 hover:border-amber-500/35 text-amber-400 font-sans font-semibold text-xs transition-all active:scale-[0.97] cursor-pointer"
                  >
                    <div className="w-9 h-9 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                        <rect width="20" height="16" x="2" y="4" rx="2" />
                        <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
                      </svg>
                    </div>
                    <span className="font-sans tracking-wide text-stone-100 hover:text-white">{isHi ? "ईमेल" : "Email"}</span>
                  </button>

                  {/* Copy Link */}
                  <button
                    onClick={() => handleShareOption("copy")}
                    className="flex items-center gap-3 p-3.5 rounded-2xl bg-gradient-to-br from-amber-500/10 to-orange-500/5 hover:from-amber-500/15 hover:to-orange-500/10 border border-amber-500/20 hover:border-amber-500/35 text-amber-400 font-sans font-semibold text-xs transition-all active:scale-[0.97] cursor-pointer"
                  >
                    <div className="w-9 h-9 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400">
                      {copiedState ? (
                        <Check className="w-5 h-5 text-amber-400" />
                      ) : (
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                          <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
                          <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
                        </svg>
                      )}
                    </div>
                    <span className="font-sans tracking-wide text-stone-100 hover:text-white">
                      {copiedState ? (isHi ? "कॉपी हो गया!" : "Copied!") : (isHi ? "लिंक कॉपी करें" : "Copy Link")}
                    </span>
                  </button>
                </div>
              </motion.div>
            </>
          );
        })()}
      </AnimatePresence>

    </div>
  );
}