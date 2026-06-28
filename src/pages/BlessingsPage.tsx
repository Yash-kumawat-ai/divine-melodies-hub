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
  Lightbulb,
  RotateCcw,
  Move,
  Maximize2,
  RotateCw
} from "lucide-react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useLanguage } from "@/hooks/useLanguage";
import { useAuth } from "@/hooks/useAuth";
import { useBhajanModalOpen } from "@/hooks/useBhajanModalOpen";
import { toast } from "sonner";
import { playMeditationBell, playCompletionChime } from "@/lib/meditation/meditationBell";
import { getFontFamily, getCanvasFont, wrapTextAndGetLines, fitTextToWidth, fitMultiLineText, getPosterTypography } from "@/utils/typography";
import { ImageCropModal } from "@/components/ImageCropModal";
import { cn } from "@/lib/utils";

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
import khatuShyamHdImg from "./images/khatu_shyam_hd.webp";

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
            try { osc.stop(); } catch(_) { /* ignore stop error */ }
          });
          try { this.ctx?.close(); } catch(_) { /* ignore close error */ }
          this.ctx = null;
          this.oscs = [];
          this.gain = null;
        }, 900);
      }
    } catch(e) { /* ignore top-level stop error */ }
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
  category: "todays" | "festival" | "suprabhat" | "quotes";
}

const WALLPAPERS_LIST: DevotionalWallpaper[] = [
  { id: "wp-shiva-1", deity: "Shiva", name: "Kashi Vishwanath Jyotirlinga", nameHindi: "काशी विश्वनाथ ज्योतिर्लिंग", imageUrl: kashiVishwanathImg, tier: "free", category: "todays" },
  { id: "wp-shiva-2", deity: "Shiva", name: "Shiv Temple Darshan", nameHindi: "शिव मंदिर दर्शन", imageUrl: shivTempleHdImg, tier: "free", category: "todays" },
  { id: "wp-shiva-3", deity: "Shiva", name: "Meditating Shiva", nameHindi: "ध्यानमग्न शिव", imageUrl: shivWallpaperImg, tier: "free", category: "todays" },
  { id: "wp-ram-1", deity: "Rama", name: "Shree Ram Darshan", nameHindi: "श्री राम दर्शन", imageUrl: deityRamImg, tier: "free", category: "todays" },
  { id: "wp-ram-2", deity: "Rama", name: "Shree Ram Darbar HD", nameHindi: "श्री राम दरबार एचडी", imageUrl: shreeRamImg, tier: "free", category: "festival" },
  { id: "wp-krishna-1", deity: "Krishna", name: "Banke Bihari Devotion", nameHindi: "बांके बिहारी भक्ति", imageUrl: krishnaImg, tier: "free", category: "festival" },
  { id: "wp-krishna-2", deity: "Krishna", name: "Radha Krishna Mayapur", nameHindi: "राधा कृष्ण मायापुर", imageUrl: radhaKrishnaImg, tier: "free", category: "suprabhat" },
  { id: "wp-krishna-3", deity: "Krishna", name: "Krishna Mobile Wallpaper", nameHindi: "कृष्ण मोबाइल वॉलपेपर", imageUrl: krishnaMobileImg, tier: "free", category: "quotes" },
  { id: "wp-hanuman-1", deity: "Hanuman", name: "Hanumanji HD Portrait", nameHindi: "हनुमानजी एचडी पोर्ट्रेट", imageUrl: hanumanImg, tier: "free", category: "suprabhat" },
  { id: "wp-shyam-1", deity: "Khatu Shyam", name: "Shyam Mandir Desktop", nameHindi: "श्याम मंदिर डेस्कटॉप", imageUrl: shyamMandirImg, tier: "free", category: "quotes" }
];

interface DevotionalLiveWallpaper {
  id: string;
  deity: string;
  name: string;
  nameHindi: string;
  thumbnailUrl: string;
  effect: "petals" | "aura" | "flame" | "shimmer";
  tier: "free" | "devotee" | "mahabhakt";
  category: "todays" | "festival" | "suprabhat" | "quotes";
}

const LIVE_WALLPAPERS_LIST: DevotionalLiveWallpaper[] = [
  { id: "live-krishna-1", deity: "Krishna", name: "Vrindavan Raas Leela", nameHindi: "वृंदावन रास लीला सजीव", thumbnailUrl: radhaKrishnaImg, effect: "petals", tier: "free", category: "festival" },
  { id: "live-shiva-1", deity: "Shiva", name: "Kailash Meditating Shiva", nameHindi: "कैलाश ध्यानमग्न शिव सजीव", thumbnailUrl: shivWallpaperImg, effect: "aura", tier: "free", category: "todays" },
  { id: "live-ram-1", deity: "Rama", name: "Ayodhya Mandir Deepotsav", nameHindi: "अयोध्या मंदिर दीपोत्सव सजीव", thumbnailUrl: deityRamImg, effect: "flame", tier: "free", category: "festival" },
  { id: "live-hanuman-1", deity: "Hanuman", name: "Anjaneya Shaurya Darshan", nameHindi: "आंजनेय शौर्य दर्शन सजीव", thumbnailUrl: hanumanImg, effect: "shimmer", tier: "free", category: "todays" }
];

const WALLPAPER_SECTIONS = [
  { key: "todays", name: "Today's Specials", nameHindi: "आज के विशेष", icon: "✨" },
  { key: "festival", name: "Festival Specials", nameHindi: "उत्सव पावन वॉलपेपर", icon: "🎉" },
  { key: "suprabhat", name: "Suprabhat / Morning", nameHindi: "सुप्रभात पावन स्मरण", icon: "☀️" },
  { key: "quotes", name: "Mantras & Quotes", nameHindi: "मंत्र और दिव्य सुविचार", icon: "📜" }
] as const;

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

export interface PosterTemplate {
  id: string;
  title: string;
  titleHindi: string;
  subtitle: string;
  subtitleHindi: string;
  category: "todays" | "festival" | "good_morning";
  imageUrl: string;
  photoPosition: {
    x: number;
    y: number;
    radius: number;
  };
  namePosition: {
    x: number;
    y: number;
  };
  quote: string;
  quoteHindi: string;
  allowShapeChange?: boolean;
  defaultShape?: "circle" | "square" | "rounded-square" | "oval";
}

export const POSTER_TEMPLATES: PosterTemplate[] = [
  {
    id: "poster-shyam-1",
    title: "Khatu Shyam Poster",
    titleHindi: "जय श्री श्याम",
    subtitle: "Poster",
    subtitleHindi: "हारे का सहारा",
    category: "todays",
    imageUrl: khatuShyamHdImg,
    photoPosition: { x: 540, y: 1380, radius: 110 },
    namePosition: { x: 540, y: 1560 },
    quote: "Baba Shyam will bless your day",
    quoteHindi: "बाबा श्याम की कृपा आप पर सदा बनी रहे",
    allowShapeChange: true,
    defaultShape: "circle"
  },
  {
    id: "poster-hanuman-1",
    title: "Hanuman Poster",
    titleHindi: "जय बजरंग बली",
    subtitle: "Poster",
    subtitleHindi: "संकट मोचन",
    category: "todays",
    imageUrl: hanumanImg,
    photoPosition: { x: 540, y: 1380, radius: 110 },
    namePosition: { x: 540, y: 1560 },
    quote: "Lord Hanuman will protect you",
    quoteHindi: "हनुमान जी आपके सभी संकट दूर करें",
    allowShapeChange: true,
    defaultShape: "circle"
  },
  {
    id: "poster-krishna-1",
    title: "Radhe Radhe Poster",
    titleHindi: "राधे राधे",
    subtitle: "Poster",
    subtitleHindi: "राधे राधे",
    category: "todays",
    imageUrl: radhaKrishnaImg,
    photoPosition: { x: 540, y: 1380, radius: 110 },
    namePosition: { x: 540, y: 1560 },
    quote: "May Radha Krishna bless you",
    quoteHindi: "राधा कृष्ण का पावन आशीर्वाद",
    allowShapeChange: true,
    defaultShape: "circle"
  },
  {
    id: "poster-morning-1",
    title: "Surya Dev Morning",
    titleHindi: "सुप्रभात सूर्य देव",
    subtitle: "Morning",
    subtitleHindi: "शुभ प्रभात",
    category: "good_morning",
    imageUrl: shreeRamImg,
    photoPosition: { x: 540, y: 1380, radius: 110 },
    namePosition: { x: 540, y: 1560 },
    quote: "Wishing you a positive and blessed morning",
    quoteHindi: "ॐ सूर्याय नमः। आपका आज का दिन मंगलमय हो।",
    allowShapeChange: true,
    defaultShape: "circle"
  },
  {
    id: "poster-fest-1",
    title: "Janmashtami Special",
    titleHindi: "जन्माष्टमी विशेष",
    subtitle: "26 Aug",
    subtitleHindi: "26 अगस्त",
    category: "festival",
    imageUrl: krishnaMobileImg,
    photoPosition: { x: 540, y: 1380, radius: 110 },
    namePosition: { x: 540, y: 1560 },
    quote: "Happy Janmashtami",
    quoteHindi: "कृष्ण जन्माष्टमी की पावन शुभकामनाएं",
    allowShapeChange: true,
    defaultShape: "circle"
  },
  {
    id: "poster-fest-2",
    title: "Ganesh Chaturthi",
    titleHindi: "गणेश चतुर्थी",
    subtitle: "7 Sep",
    subtitleHindi: "7 सितम्बर",
    category: "festival",
    imageUrl: ganeshImg,
    photoPosition: { x: 540, y: 1380, radius: 110 },
    namePosition: { x: 540, y: 1560 },
    quote: "Ganpati Bappa Morya",
    quoteHindi: "गणपति बाप्पा मोरया",
    allowShapeChange: true,
    defaultShape: "circle"
  },
  {
    id: "poster-fest-3",
    title: "Navratri Special",
    titleHindi: "नवरात्रि विशेष",
    subtitle: "3 Oct",
    subtitleHindi: "3 अक्टूबर",
    category: "festival",
    imageUrl: shivVerticalImg,
    photoPosition: { x: 540, y: 1380, radius: 110 },
    namePosition: { x: 540, y: 1560 },
    quote: "Shubh Navratri",
    quoteHindi: "नवरात्रि की हार्दिक शुभकामनाएं",
    allowShapeChange: true,
    defaultShape: "circle"
  }
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

// ─── POSTER LIKE BUTTON ────────────────────────────────────────────
const PosterLikeButton = ({ 
  posterId, 
  isLiked, 
  onToggle 
}: { 
  posterId: string; 
  isLiked: boolean; 
  onToggle: () => void; 
}) => {
  const [burst, setBurst] = React.useState(false);
  const [showConfetti, setShowConfetti] = React.useState(false);

  const handleToggle = (e: React.MouseEvent) => {
    e.stopPropagation();
    const next = !isLiked;
    if (next) {
      setBurst(true);
      setShowConfetti(true);
      setTimeout(() => setBurst(false), 550);
      setTimeout(() => setShowConfetti(false), 600);
    }
    onToggle();
  };

  return (
    <div className="relative" style={{ userSelect: 'none' }}>
      {/* Premium circular Confetti Burst */}
      {isLiked && showConfetti && (
        <div className="absolute inset-0 pointer-events-none flex items-center justify-center" style={{ zIndex: 50 }}>
          {Array.from({ length: 8 }).map((_, i) => (
            <div
              key={i}
              className="absolute w-1.5 h-1.5 rounded-full"
              style={{
                background: i % 2 === 0 ? '#f43f5e' : '#fbbf24',
                boxShadow: i % 2 === 0 ? '0 0 6px rgba(244,63,94,0.8)' : '0 0 6px rgba(251,191,36,0.8)',
                animation: 'hk-dot-burst 0.55s cubic-bezier(0.1, 0.8, 0.3, 1) forwards',
                ['--angle' as any]: `${i * 45}deg`,
              }}
            />
          ))}
        </div>
      )}
      <button
        onClick={handleToggle}
        className="flex items-center justify-center cursor-pointer focus:outline-none transition-all duration-300"
        style={{
          width: 36,
          height: 36,
          borderRadius: '50%',
          background: isLiked ? 'rgba(244, 63, 94, 0.18)' : 'rgba(15, 7, 3, 0.65)',
          backdropFilter: 'blur(8px)',
          border: isLiked ? '1px solid rgba(244, 63, 94, 0.5)' : '1px solid rgba(251, 191, 36, 0.25)',
          boxShadow: isLiked 
            ? '0 0 12px rgba(244, 63, 94, 0.4), inset 0 1px 1px rgba(255,255,255,0.1)' 
            : '0 4px 10px rgba(0,0,0,0.45)',
          transform: burst ? 'scale(1.2)' : 'scale(1)',
        }}
        onMouseEnter={e => {
          e.currentTarget.style.transform = 'scale(1.08)';
          if (isLiked) {
            e.currentTarget.style.boxShadow = '0 0 16px rgba(244, 63, 94, 0.6), inset 0 1px 1px rgba(255,255,255,0.1)';
          } else {
            e.currentTarget.style.border = '1px solid rgba(251, 191, 36, 0.45)';
          }
        }}
        onMouseLeave={e => {
          e.currentTarget.style.transform = 'scale(1)';
          if (isLiked) {
            e.currentTarget.style.boxShadow = '0 0 12px rgba(244, 63, 94, 0.4), inset 0 1px 1px rgba(255,255,255,0.1)';
          } else {
            e.currentTarget.style.border = '1px solid rgba(251, 191, 36, 0.25)';
          }
        }}
      >
        <svg
          viewBox="0 0 24 24"
          fill={isLiked ? "#f43f5e" : "none"}
          stroke={isLiked ? "#f43f5e" : "rgba(255, 255, 255, 0.9)"}
          strokeWidth="2.5"
          className={`w-4 h-4 transition-all duration-300 ${burst ? 'hk-animate-heart-bounce' : ''}`}
          style={{
            filter: isLiked ? 'drop-shadow(0 0 4px rgba(244,63,94,0.65))' : 'none',
          }}
        >
          <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
        </svg>
      </button>
      <style>{`
        @keyframes hk-heart-bounce {
          0% { transform: scale(1); }
          30% { transform: scale(1.4); }
          60% { transform: scale(0.9); }
          100% { transform: scale(1); }
        }
        @keyframes hk-dot-burst {
          0% {
            transform: rotate(var(--angle)) translateY(0px) scale(1);
            opacity: 1;
          }
          40% {
            opacity: 1;
          }
          100% {
            transform: rotate(var(--angle)) translateY(22px) scale(0);
            opacity: 0;
          }
        }
        .hk-animate-heart-bounce {
          animation: hk-heart-bounce 0.5s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards;
        }
      `}</style>
    </div>
  );
};

// Subcomponent: Dedicated Devotee Poster Editor (New Flow mockup)
interface BlessingsPosterEditorProps {
  isOpen: boolean;
  onClose: () => void;
  poster: PosterTemplate;
  userPhoto: string;
  initialZoom: number;
  initialFrameScale: number;
  initialOffsetX: number;
  initialOffsetY: number;
  initialShape: "circle" | "square" | "rounded-square" | "oval";
  initialRotation?: number;
  onSave: (settings: { zoom: number; frameScale: number; offsetX: number; offsetY: number; shape: "circle" | "square" | "rounded-square" | "oval"; rotation: number }) => void;
  language: string;
}

function BlessingsPosterEditor({
  isOpen,
  onClose,
  poster,
  userPhoto,
  initialZoom,
  initialFrameScale,
  initialOffsetX,
  initialOffsetY,
  initialShape,
  initialRotation = 0,
  onSave,
  language
}: BlessingsPosterEditorProps) {
  const isHi = language === "hi";
  
  // State variables for editor values
  const [shape, setShape] = useState(initialShape);
  const [frameScale, setFrameScale] = useState(initialFrameScale);
  const [offsetX, setOffsetX] = useState(initialOffsetX);
  const [offsetY, setOffsetY] = useState(initialOffsetY);
  const [photoZoom, setPhotoZoom] = useState(initialZoom);
  const [photoOffsetX, setPhotoOffsetX] = useState(0);
  const [photoOffsetY, setPhotoOffsetY] = useState(0);
  const [rotation, setRotation] = useState(initialRotation);
  
  const [activeTab, setActiveTab] = useState<"shape" | "move" | "resize" | "rotate" | "reset">("shape");
  const [bgLoaded, setBgLoaded] = useState(false);
  const [userLoaded, setUserLoaded] = useState(false);

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const isPointerDown = useRef(false);
  const activePointerId = useRef<number | null>(null);
  
  // Interaction action state: tl, tr, bl, br (corners), rot (rotate), move-frame, move-photo, none
  const activeAction = useRef<"tl" | "tr" | "bl" | "br" | "rot" | "move-frame" | "move-photo" | "none">("none");
  const dragStartX = useRef(0);
  const dragStartY = useRef(0);
  const touchStartDist = useRef(0);

  // Initial values before a drag action starts
  const dragStartValues = useRef({
    ox: 0, oy: 0,
    pox: 0, poy: 0,
    fs: 1.0,
    rot: 0,
    r: 100
  });

  const bgImgRef = useRef<HTMLImageElement | null>(null);
  const userImgRef = useRef<HTMLImageElement | null>(null);

  // Sync state values when modal is opened
  useEffect(() => {
    if (isOpen) {
      setShape(initialShape);
      setFrameScale(initialFrameScale);
      setOffsetX(initialOffsetX);
      setOffsetY(initialOffsetY);
      setPhotoZoom(initialZoom);
      setPhotoOffsetX(0);
      setPhotoOffsetY(0);
      setRotation(initialRotation);
      setActiveTab("shape");
      activePointerId.current = null;
      isPointerDown.current = false;
      activeAction.current = "none";
    }
  }, [isOpen, initialZoom, initialFrameScale, initialOffsetX, initialOffsetY, initialShape, initialRotation]);

  // Load resources
  useEffect(() => {
    if (!isOpen) return;

    setBgLoaded(false);
    setUserLoaded(false);

    const bg = new Image();
    bg.crossOrigin = "anonymous";
    bg.src = poster.imageUrl;
    bg.onload = () => {
      bgImgRef.current = bg;
      setBgLoaded(true);
    };

    const user = new Image();
    user.src = userPhoto;
    user.onload = () => {
      userImgRef.current = user;
      setUserLoaded(true);
    };
  }, [poster, userPhoto, isOpen]);

  // Point rotation helper
  const rotatePoint = (x: number, y: number, cx: number, cy: number, angleRad: number) => {
    const cos = Math.cos(angleRad);
    const sin = Math.sin(angleRad);
    const dx = x - cx;
    const dy = y - cy;
    return {
      x: cx + dx * cos - dy * sin,
      y: cy + dx * sin + dy * cos
    };
  };

  // Paint loop
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !bgImgRef.current || !userImgRef.current) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const w = bgImgRef.current.naturalWidth || 1080;
    const h = bgImgRef.current.naturalHeight || 1920;
    canvas.width = w;
    canvas.height = h;

    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = "high";

    // 1. Draw Background
    ctx.drawImage(bgImgRef.current, 0, 0, w, h);

    // 2. Draw Devotee Photo Layer
    const photoX = poster.photoPosition.x + offsetX;
    const photoY = poster.photoPosition.y + offsetY;
    const radius = poster.photoPosition.radius * frameScale;

    ctx.save();
    // Translate and rotate around the shape center
    ctx.translate(photoX, photoY);
    ctx.rotate(rotation);

    ctx.beginPath();
    if (shape === "circle") {
      ctx.arc(0, 0, radius, 0, Math.PI * 2);
    } else if (shape === "square") {
      ctx.rect(-radius, -radius, radius * 2, radius * 2);
    } else if (shape === "rounded-square") {
      const r = radius * 2 * 0.15;
      ctx.roundRect(-radius, -radius, radius * 2, radius * 2, r);
    } else if (shape === "oval") {
      ctx.ellipse(0, 0, radius, radius * 1.33, 0, 0, Math.PI * 2);
    }
    ctx.closePath();
    ctx.clip();

    const targetW = radius * 2;
    const targetH = radius * 2;
    const baseScale = Math.max(targetW / userImgRef.current.width, targetH / userImgRef.current.height);
    const DW = userImgRef.current.width * baseScale * photoZoom;
    const DH = userImgRef.current.height * baseScale * photoZoom;
    // Apply devotee photo pan offsets in the local rotated space
    const drawX = -DW / 2 + photoOffsetX;
    const drawY = -DH / 2 + photoOffsetY;

    ctx.drawImage(userImgRef.current, drawX, drawY, DW, DH);
    ctx.restore();

    // 3. Gold border outline
    ctx.save();
    ctx.translate(photoX, photoY);
    ctx.rotate(rotation);
    ctx.strokeStyle = "#fbbf24";
    ctx.lineWidth = 6;
    ctx.beginPath();
    if (shape === "circle") {
      ctx.arc(0, 0, radius, 0, Math.PI * 2);
    } else if (shape === "square") {
      ctx.rect(-radius, -radius, radius * 2, radius * 2);
    } else if (shape === "rounded-square") {
      const r = radius * 2 * 0.15;
      ctx.roundRect(-radius, -radius, radius * 2, radius * 2, r);
    } else if (shape === "oval") {
      ctx.ellipse(0, 0, radius, radius * 1.33, 0, 0, Math.PI * 2);
    }
    ctx.closePath();
    ctx.stroke();
    ctx.restore();

    // 4. Rectangular dashed border outline (Corner handles guide box)
    ctx.save();
    ctx.translate(photoX, photoY);
    ctx.rotate(rotation);
    ctx.strokeStyle = "rgba(255, 255, 255, 0.7)";
    ctx.lineWidth = 3;
    ctx.setLineDash([8, 6]);
    ctx.strokeRect(-radius, -radius, radius * 2, radius * 2);
    ctx.restore();

    // 5. Draw rotate handle connector line
    const topCenter = rotatePoint(photoX, photoY - radius, photoX, photoY, rotation);
    const rotHandle = rotatePoint(photoX, photoY - radius - 45, photoX, photoY, rotation);
    ctx.strokeStyle = "#fbbf24";
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(topCenter.x, topCenter.y);
    ctx.lineTo(rotHandle.x, rotHandle.y);
    ctx.stroke();

    // 6. Draw rotate handle dot (gold icon circle)
    ctx.fillStyle = "#ffffff";
    ctx.strokeStyle = "#fbbf24";
    ctx.lineWidth = 3.5;
    ctx.beginPath();
    ctx.arc(rotHandle.x, rotHandle.y, 14, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    // 7. Draw corner handles (Top-Left, Top-Right, Bottom-Left, Bottom-Right)
    const corners = [
      rotatePoint(photoX - radius, photoY - radius, photoX, photoY, rotation), // TL
      rotatePoint(photoX + radius, photoY - radius, photoX, photoY, rotation), // TR
      rotatePoint(photoX - radius, photoY + radius, photoX, photoY, rotation), // BL
      rotatePoint(photoX + radius, photoY + radius, photoX, photoY, rotation)  // BR
    ];

    corners.forEach(pt => {
      ctx.fillStyle = "#ffffff";
      ctx.strokeStyle = "#fbbf24";
      ctx.lineWidth = 3.5;
      ctx.beginPath();
      ctx.arc(pt.x, pt.y, 14, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
    });

  }, [bgLoaded, userLoaded, shape, frameScale, offsetX, offsetY, photoZoom, photoOffsetX, photoOffsetY, rotation, poster]);

  // Pointer gesture down
  const handlePointerDown = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (activePointerId.current !== null) return;
    const canvas = canvasRef.current;
    if (!canvas) return;

    canvas.setPointerCapture(e.pointerId);
    activePointerId.current = e.pointerId;
    isPointerDown.current = true;

    // Convert screen coordinates to canvas space
    const rect = canvas.getBoundingClientRect();
    const clickX = ((e.clientX - rect.left) / rect.width) * canvas.width;
    const clickY = ((e.clientY - rect.top) / rect.height) * canvas.height;

    dragStartX.current = clickX;
    dragStartY.current = clickY;

    // Current coordinates
    const photoX = poster.photoPosition.x + offsetX;
    const photoY = poster.photoPosition.y + offsetY;
    const radius = poster.photoPosition.radius * frameScale;

    // Detect click targets
    const rotHandle = rotatePoint(photoX, photoY - radius - 45, photoX, photoY, rotation);
    const corners = {
      tl: rotatePoint(photoX - radius, photoY - radius, photoX, photoY, rotation),
      tr: rotatePoint(photoX + radius, photoY - radius, photoX, photoY, rotation),
      bl: rotatePoint(photoX - radius, photoY + radius, photoX, photoY, rotation),
      br: rotatePoint(photoX + radius, photoY + radius, photoX, photoY, rotation)
    };

    // Store starting values for delta calculations
    dragStartValues.current = {
      ox: offsetX, oy: offsetY,
      pox: photoOffsetX, poy: photoOffsetY,
      fs: frameScale,
      rot: rotation,
      r: radius
    };

    // Check rotate handle
    if (Math.hypot(clickX - rotHandle.x, clickY - rotHandle.y) < 32) {
      activeAction.current = "rot";
      return;
    }
    // Check corner handles
    if (Math.hypot(clickX - corners.tl.x, clickY - corners.tl.y) < 32) { activeAction.current = "tl"; return; }
    if (Math.hypot(clickX - corners.tr.x, clickY - corners.tr.y) < 32) { activeAction.current = "tr"; return; }
    if (Math.hypot(clickX - corners.bl.x, clickY - corners.bl.y) < 32) { activeAction.current = "bl"; return; }
    if (Math.hypot(clickX - corners.br.x, clickY - corners.br.y) < 32) { activeAction.current = "br"; return; }

    // Check shape body
    const distToCenter = Math.hypot(clickX - photoX, clickY - photoY);
    if (distToCenter < radius) {
      // If template is fixed, always drag the photo inside. 
      // If flexible: move-shape in Move tab, move-photo-inside in Shape/Resize tabs
      if (!poster.allowShapeChange) {
        activeAction.current = "move-photo";
      } else if (activeTab === "move") {
        activeAction.current = "move-frame";
      } else {
        activeAction.current = "move-photo";
      }
    } else {
      activeAction.current = "none";
    }
  };

  // Pointer gesture move
  const handlePointerMove = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (!isPointerDown.current || e.pointerId !== activePointerId.current || !canvasRef.current) return;

    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const clickX = ((e.clientX - rect.left) / rect.width) * canvas.width;
    const clickY = ((e.clientY - rect.top) / rect.height) * canvas.height;

    const photoX = poster.photoPosition.x + offsetX;
    const photoY = poster.photoPosition.y + offsetY;
    const baseRadius = poster.photoPosition.radius;

    const dx = clickX - dragStartX.current;
    const dy = clickY - dragStartY.current;

    const action = activeAction.current;
    const startVal = dragStartValues.current;

    if (action === "move-frame") {
      // Reposition circle frame center
      setOffsetX(startVal.ox + dx);
      setOffsetY(startVal.oy + dy);
    } else if (action === "move-photo") {
      // Pan photo inside shape
      setPhotoOffsetX(startVal.pox + dx);
      setPhotoOffsetY(startVal.poy + dy);
    } else if (action === "rot") {
      // Calculate angle from center to current pointer
      const angle = Math.atan2(clickY - photoY, clickX - photoX);
      // Offset by +PI/2 because rotate handle is at top center (-PI/2)
      setRotation(angle + Math.PI / 2);
    } else if (["tl", "tr", "bl", "br"].includes(action)) {
      // Resize frame radius based on distance from center
      const currentDist = Math.hypot(clickX - photoX, clickY - photoY);
      // Ratio of new distance relative to base corner distance
      const newRadius = currentDist / Math.sqrt(2);
      const newScale = newRadius / baseRadius;
      setFrameScale(Math.max(0.4, Math.min(2.5, newScale)));
    }
  };

  // Pointer gesture up
  const handlePointerUp = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (e.pointerId === activePointerId.current) {
      isPointerDown.current = false;
      activePointerId.current = null;
      activeAction.current = "none";
      canvasRef.current?.releasePointerCapture(e.pointerId);
    }
  };

  // Wheel zoom
  const handleWheel = (e: React.WheelEvent<HTMLCanvasElement>) => {
    const delta = -e.deltaY * 0.001;
    if (activeTab === "resize" || !poster.allowShapeChange) {
      setPhotoZoom(prev => Math.max(0.8, Math.min(3.0, prev + delta)));
    } else {
      setFrameScale(prev => Math.max(0.5, Math.min(2.5, prev + delta)));
    }
  };

  // Pinch zoom (Mobile)
  const handleTouchStart = (e: React.TouchEvent<HTMLCanvasElement>) => {
    if (e.touches.length === 2) {
      const dist = Math.sqrt(
        Math.pow(e.touches[0].clientX - e.touches[1].clientX, 2) +
        Math.pow(e.touches[0].clientY - e.touches[1].clientY, 2)
      );
      touchStartDist.current = dist;
    }
  };

  const handleTouchMove = (e: React.TouchEvent<HTMLCanvasElement>) => {
    if (e.touches.length === 2 && touchStartDist.current > 0) {
      e.preventDefault();
      const dist = Math.sqrt(
        Math.pow(e.touches[0].clientX - e.touches[1].clientX, 2) +
        Math.pow(e.touches[0].clientY - e.touches[1].clientY, 2)
      );
      const ratio = dist / touchStartDist.current;
      const zoomDelta = (ratio - 1) * 0.35;
      
      if (activeTab === "resize" || !poster.allowShapeChange) {
        setPhotoZoom(prev => Math.max(0.8, Math.min(3.0, prev * (1 + zoomDelta))));
      } else {
        setFrameScale(prev => Math.max(0.5, Math.min(2.5, prev * (1 + zoomDelta))));
      }
      touchStartDist.current = dist;
    }
  };

  const handleResetAll = () => {
    setShape(poster.defaultShape || "circle");
    setFrameScale(1.0);
    setOffsetX(0);
    setOffsetY(0);
    setPhotoZoom(1.0);
    setPhotoOffsetX(0);
    setPhotoOffsetY(0);
    setRotation(0);
  };

  // Double tap to reset photo
  const lastTap = useRef(0);
  const handleDoubleTap = () => {
    const now = Date.now();
    if (now - lastTap.current < 300) {
      setPhotoZoom(1.0);
      setPhotoOffsetX(0);
      setPhotoOffsetY(0);
    }
    lastTap.current = now;
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[250] flex flex-col bg-[#070200] text-stone-200 select-none">
      
      {/* ─── 1. TOP BAR ─── */}
      <div className="h-14 border-b border-white/5 bg-[#0a0200] flex items-center justify-between px-4 shrink-0">
        <button 
          onClick={onClose}
          className="w-10 h-10 rounded-full flex items-center justify-center text-stone-300 hover:text-white hover:bg-white/5 active:scale-95 transition-all cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>
        <span className="font-sans font-black text-sm uppercase tracking-widest text-stone-300">
          {isHi ? "एडिट करें" : "Edit Poster"}
        </span>
        <button 
          onClick={() => onSave({ zoom: photoZoom, frameScale, offsetX, offsetY, shape, rotation })}
          className="px-5 py-1.5 rounded-lg bg-[#e8960a] hover:bg-[#c97c04] text-[#1a0500] font-sans font-black text-xs uppercase tracking-wider shadow-lg active:scale-95 transition-all cursor-pointer"
        >
          {isHi ? "पूरा करें" : "Done"}
        </button>
      </div>

      {/* ─── 2. MIDDLE VIEWPORT ─── */}
      <div className="flex-1 min-h-0 flex items-center justify-center p-4 bg-black/40 relative">
        {(!bgLoaded || !userLoaded) && (
          <div className="absolute inset-0 flex items-center justify-center bg-stone-950/80 z-10">
            <div className="w-8 h-8 rounded-full border-2 border-brand-saffron border-t-transparent animate-spin" />
          </div>
        )}
        <div 
          onClick={handleDoubleTap}
          className="h-full w-auto max-h-full max-w-full rounded-2xl overflow-hidden shadow-2xl border border-white/10 relative"
          style={{ aspectRatio: "9/16", touchAction: "none" }}
        >
          <canvas
            ref={canvasRef}
            onPointerDown={handlePointerDown}
            onPointerMove={handlePointerMove}
            onPointerUp={handlePointerUp}
            onPointerCancel={handlePointerUp}
            onWheel={handleWheel}
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            className="w-full h-full block bg-[#0c0503] cursor-grab select-none"
          />
        </div>
      </div>

      {/* ─── 3. BOTTOM PANEL ─── */}
      <div className="border-t border-white/5 bg-[#0a0200] shrink-0">
        
        {/* TAB LIST BAR */}
        <div className="grid grid-cols-5 border-b border-white/5">
          {[
            { id: "shape", label: isHi ? "शेप" : "Shape", icon: <CircleIcon /> },
            { id: "move", label: isHi ? "ड्रैग" : "Move", icon: <Move className="w-4 h-4" /> },
            { id: "resize", label: isHi ? "रीसाइज" : "Resize", icon: <Maximize2 className="w-4 h-4" /> },
            { id: "rotate", label: isHi ? "रोटेट" : "Rotate", icon: <RotateCw className="w-4 h-4" /> },
            { id: "reset", label: isHi ? "रीसेट" : "Reset", icon: <RotateCcw className="w-4 h-4" /> }
          ].map(tab => {
            const isTabActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => {
                  if (tab.id === "reset") {
                    handleResetAll();
                  } else {
                    setActiveTab(tab.id as any);
                  }
                }}
                className={cn(
                  "flex flex-col items-center justify-center gap-1.5 py-3 border-b-2 text-[10px] font-sans font-black uppercase tracking-widest transition-all cursor-pointer",
                  isTabActive
                    ? "border-amber-500 bg-amber-500/10 text-amber-400"
                    : "border-transparent text-stone-400 hover:text-stone-200"
                )}
              >
                {tab.icon}
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* ACTIVE PANEL CONTENT */}
        <div className="p-5 space-y-4 min-h-[170px] bg-[#0c0300]">
          
          {/* shape panel */}
          {activeTab === "shape" && (
            <div className="space-y-4">
              {poster.allowShapeChange ? (
                <div className="space-y-2">
                  <span className="text-[10px] text-stone-400 font-bold uppercase tracking-wider block text-left">
                    {isHi ? "आकार चुनें" : "Shape Options"}
                  </span>
                  <div className="grid grid-cols-4 gap-2">
                    {[
                      { id: "circle", label: isHi ? "गोल" : "Circle" },
                      { id: "square", label: isHi ? "चौकोर" : "Square" },
                      { id: "rounded-square", label: isHi ? "सॉफ्ट" : "Rounded" },
                      { id: "oval", label: isHi ? "ओवल" : "Oval" },
                    ].map((s) => (
                      <button
                        key={s.id}
                        onClick={() => setShape(s.id as any)}
                        className={cn(
                          "py-2 rounded-xl border text-[10px] font-black uppercase tracking-wider transition-all cursor-pointer select-none",
                          shape === s.id
                            ? "bg-amber-500/15 border-amber-500 text-amber-300"
                            : "bg-transparent border-white/5 hover:border-white/20 text-stone-400 hover:text-stone-200"
                        )}
                      >
                        {s.label}
                      </button>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="py-2 text-stone-400 text-xs font-semibold italic text-center">
                  {isHi ? "इस थीम का आकार लॉक है" : "Shape is locked for this template."}
                </div>
              )}
            </div>
          )}

          {/* move panel (fine nudge arrow keys) */}
          {activeTab === "move" && (
            <div className="flex flex-col items-center gap-2">
              <span className="text-[10px] text-stone-400 font-bold uppercase tracking-wider block text-center mb-1">
                {isHi ? "पोजीशन फाइन-ट्यूनिंग" : "Fine-Tune Position"}
              </span>
              <div className="flex flex-col items-center gap-1.5">
                <button 
                  onClick={() => setOffsetY(prev => prev - 2)}
                  className="w-10 h-8 rounded-lg bg-white/5 hover:bg-white/10 flex items-center justify-center text-amber-400 border border-white/5 cursor-pointer active:scale-90"
                >
                  ▲
                </button>
                <div className="flex gap-4">
                  <button 
                    onClick={() => setOffsetX(prev => prev - 2)}
                    className="w-10 h-8 rounded-lg bg-white/5 hover:bg-white/10 flex items-center justify-center text-amber-400 border border-white/5 cursor-pointer active:scale-90"
                  >
                    ◀
                  </button>
                  <button 
                    onClick={() => { setOffsetX(0); setOffsetY(0); }}
                    className="px-2.5 h-8 rounded-lg bg-white/5 flex items-center justify-center text-[10px] text-stone-300 font-black uppercase tracking-wider border border-white/5 cursor-pointer"
                  >
                    Center
                  </button>
                  <button 
                    onClick={() => setOffsetX(prev => prev + 2)}
                    className="w-10 h-8 rounded-lg bg-white/5 hover:bg-white/10 flex items-center justify-center text-amber-400 border border-white/5 cursor-pointer active:scale-90"
                  >
                    ▶
                  </button>
                </div>
                <button 
                  onClick={() => setOffsetY(prev => prev + 2)}
                  className="w-10 h-8 rounded-lg bg-white/5 hover:bg-white/10 flex items-center justify-center text-amber-400 border border-white/5 cursor-pointer active:scale-90"
                >
                  ▼
                </button>
              </div>
            </div>
          )}

          {/* resize panel */}
          {activeTab === "resize" && (
            <div className="space-y-4">
              {poster.allowShapeChange && (
                <div className="space-y-1 text-left">
                  <div className="flex justify-between text-[10px] text-stone-400 font-bold uppercase tracking-wider">
                    <span>{isHi ? "फ्रेम का आकार बदलें" : "Adjust Circle Size"}</span>
                    <span className="font-sans text-amber-400">{frameScale.toFixed(2)}x</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => setFrameScale(prev => Math.max(0.4, prev - 0.05))}
                      className="w-6 h-6 rounded bg-white/5 hover:bg-white/10 flex items-center justify-center text-xs font-bold text-amber-300 cursor-pointer"
                    >
                      -
                    </button>
                    <input
                      type="range"
                      min="0.4"
                      max="2.5"
                      step="0.05"
                      value={frameScale}
                      onChange={(e) => setFrameScale(parseFloat(e.target.value))}
                      className="flex-1 accent-amber-500 cursor-pointer h-1 bg-stone-900 rounded-lg appearance-none"
                    />
                    <button
                      onClick={() => setFrameScale(prev => Math.min(2.5, prev + 0.05))}
                      className="w-6 h-6 rounded bg-white/5 hover:bg-white/10 flex items-center justify-center text-xs font-bold text-amber-300 cursor-pointer"
                    >
                      +
                    </button>
                  </div>
                </div>
              )}

              <div className="space-y-1 text-left">
                <div className="flex justify-between text-[10px] text-stone-400 font-bold uppercase tracking-wider">
                  <span>{isHi ? "फोटो ज़ूम बदलें" : "Zoom Photo"}</span>
                  <span className="font-sans text-amber-400">{photoZoom.toFixed(2)}x</span>
                </div>
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => setPhotoZoom(prev => Math.max(0.8, prev - 0.05))}
                    className="w-6 h-6 rounded bg-white/5 hover:bg-white/10 flex items-center justify-center text-xs font-bold text-amber-300 cursor-pointer"
                  >
                    -
                  </button>
                  <input
                    type="range"
                    min="0.8"
                    max="3.0"
                    step="0.05"
                    value={photoZoom}
                    onChange={(e) => setPhotoZoom(parseFloat(e.target.value))}
                    className="flex-1 accent-amber-500 cursor-pointer h-1 bg-stone-900 rounded-lg appearance-none"
                  />
                  <button
                    onClick={() => setPhotoZoom(prev => Math.min(3.0, prev + 0.05))}
                    className="w-6 h-6 rounded bg-white/5 hover:bg-white/10 flex items-center justify-center text-xs font-bold text-amber-300 cursor-pointer"
                  >
                    +
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* rotate panel */}
          {activeTab === "rotate" && (
            <div className="space-y-3 text-left">
              <div className="flex justify-between text-[10px] text-stone-400 font-bold uppercase tracking-wider">
                <span>{isHi ? "फ्रेम रोटेशन" : "Frame Rotation"}</span>
                <span className="font-sans text-amber-400">{Math.round((rotation * 180) / Math.PI)}°</span>
              </div>
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setRotation(prev => prev - (5 * Math.PI) / 180)}
                  className="w-6 h-6 rounded bg-white/5 hover:bg-white/10 flex items-center justify-center text-xs font-bold text-amber-300 cursor-pointer"
                >
                  ↺
                </button>
                <input
                  type="range"
                  min={-Math.PI}
                  max={Math.PI}
                  step={0.05}
                  value={rotation}
                  onChange={(e) => setRotation(parseFloat(e.target.value))}
                  className="flex-1 accent-amber-500 cursor-pointer h-1 bg-stone-900 rounded-lg appearance-none"
                />
                <button
                  onClick={() => setRotation(prev => prev + (5 * Math.PI) / 180)}
                  className="w-6 h-6 rounded bg-white/5 hover:bg-white/10 flex items-center justify-center text-xs font-bold text-amber-300 cursor-pointer"
                >
                  ↻
                </button>
              </div>
            </div>
          )}

          {/* Adjust Photo Inside Helper Row */}
          <div className="border-t border-white/5 pt-3.5 space-y-2">
            <span className="text-[9px] text-stone-500 font-black uppercase tracking-wider block text-left">
              {isHi ? "फोटो एडजस्ट करें" : "Adjust Photo Inside"}
            </span>
            <div className="grid grid-cols-3 gap-2">
              <div className="bg-white/5 rounded-xl p-2.5 flex flex-col items-center justify-center gap-1.5 border border-white/5">
                <svg className="w-5 h-5 text-amber-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M15 3h6v6M9 21H3v-6M21 3l-7 7M3 21l7-7"/></svg>
                <span className="text-[9px] font-sans font-black uppercase text-stone-300 text-center tracking-wide leading-tight">
                  {isHi ? "ड्रैग करें" : "Drag to Move"}
                </span>
              </div>
              <div className="bg-white/5 rounded-xl p-2.5 flex flex-col items-center justify-center gap-1.5 border border-white/5">
                <svg className="w-5 h-5 text-amber-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3M11 8v6M8 11h6"/></svg>
                <span className="text-[9px] font-sans font-black uppercase text-stone-300 text-center tracking-wide leading-tight">
                  {isHi ? "पिंच ज़ूम" : "Pinch to Zoom"}
                </span>
              </div>
              <div className="bg-white/5 rounded-xl p-2.5 flex flex-col items-center justify-center gap-1.5 border border-white/5">
                <svg className="w-5 h-5 text-amber-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="m15 18-2 2-2-2M9 6l2-2 2 2M11 4v16"/></svg>
                <span className="text-[9px] font-sans font-black uppercase text-stone-300 text-center tracking-wide leading-tight">
                  {isHi ? "डबल टैप रीसेट" : "Double Tap Reset"}
                </span>
              </div>
            </div>
          </div>

          {/* Reset All Button */}
          <button
            onClick={handleResetAll}
            className="w-full flex items-center justify-center gap-1.5 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-[10px] font-black text-amber-400 border border-amber-500/20 transition-all active:scale-98 cursor-pointer select-none"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>{isHi ? "सब कुछ रीसेट करें" : "Reset All Settings"}</span>
          </button>
        </div>
      </div>
    </div>
  );
}

// Subcomponent: Mini Circle Helper Icon for shape tab
const CircleIcon = () => (
  <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
    <circle cx="12" cy="12" r="9" />
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
      className="relative w-[145px] h-[298px] md:w-[230px] md:h-[474px] select-none flex-shrink-0 rounded-[24px] md:rounded-[40px]"
      style={{ boxShadow: "0 25px 60px rgba(0, 0, 0, 0.55)" }}
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

const compressAndResizeImage = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (event) => {
      if (!event.target?.result) {
        reject(new Error("File read error"));
        return;
      }
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement("canvas");
        const MAX_WIDTH = 400;
        const MAX_HEIGHT = 400;
        let width = img.width;
        let height = img.height;

        if (width > height) {
          if (width > MAX_WIDTH) {
            height *= MAX_WIDTH / width;
            width = MAX_WIDTH;
          }
        } else {
          if (height > MAX_HEIGHT) {
            width *= MAX_HEIGHT / height;
            height = MAX_HEIGHT;
          }
        }

        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext("2d");
        if (!ctx) {
          reject(new Error("Canvas context error"));
          return;
        }
        ctx.drawImage(img, 0, 0, width, height);
        const compressed = canvas.toDataURL("image/jpeg", 0.7);
        resolve(compressed);
      };
      img.onerror = () => {
        reject(new Error("Image load error"));
      };
      img.src = event.target.result as string;
    };
    reader.onerror = () => {
      reject(new Error("FileReader error"));
    };
    reader.readAsDataURL(file);
  });
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
  const [isCardVisible, setIsCardVisible] = useState(true);

  useEffect(() => {
    if (showPreviewModal || showLivePreviewModal) {
      setIsCardVisible(true);
    }
  }, [showPreviewModal, showLivePreviewModal]);

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

  const [userName, setUserName] = useState<string>(() => {
    return localStorage.getItem("hk_profile_name") || "";
  });
  const [blessingType, setBlessingType] = useState<"self" | "parents" | "family" | "friends" | "universal">("self");
  const [userPhoto, setUserPhoto] = useState<string | null>(() => {
    return localStorage.getItem("hk_profile_photo") || null;
  });
  const [selectedPoster, setSelectedPoster] = useState<PosterTemplate | null>(null);
  const [showProfileEdit, setShowProfileEdit] = useState(false);
  const [showSetupSheet, setShowSetupSheet] = useState(false);
  const [compiledPosterUrl, setCompiledPosterUrl] = useState<string | null>(null);
  const [posterPreviewUrl, setPosterPreviewUrl] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<"all" | "todays" | "festival" | "good_morning" | "goodmorning" | "more">("all");
  const [showPosterShareModal, setShowPosterShareModal] = useState(false);
  const [tempName, setTempName] = useState("");
  const [tempPhoto, setTempPhoto] = useState<string | null>(null);
  const [posterZoom, setPosterZoom] = useState<number>(1.0);
  const [posterFrameScale, setPosterFrameScale] = useState<number>(1.0);
  const [posterOffsetX, setPosterOffsetX] = useState<number>(0);
  const [posterOffsetY, setPosterOffsetY] = useState<number>(0);
  const [posterShape, setPosterShape] = useState<"circle" | "square" | "rounded-square" | "oval">("circle");
  const [posterRotation, setPosterRotation] = useState<number>(0);
  const [isEditingPhoto, setIsEditingPhoto] = useState<boolean>(false);
  const [showEditorModal, setShowEditorModal] = useState<boolean>(false);
  const [posterActiveTab, setPosterActiveTab] = useState<"shape" | "move" | "resize" | "rotate" | "reset">("shape");
  const [posterNameOffsetX, setPosterNameOffsetX] = useState<number>(0);
  const [posterNameOffsetY, setPosterNameOffsetY] = useState<number>(0);
  const [posterNameScale, setPosterNameScale] = useState<number>(1.0);
  const [posterNameRotation, setPosterNameRotation] = useState<number>(0);
  const [posterNameShape, setPosterNameShape] = useState<"circle" | "square" | "rounded-square" | "oval">("rounded-square");
  const [editingElement, setEditingElement] = useState<"photo" | "name">("photo");
  const [cropModalOpen, setCropModalOpen] = useState(false);
  const [cropImageSrc, setCropImageSrc] = useState<string | null>(null);
  const [cropTarget, setCropTarget] = useState<'temp' | 'user'>('temp');

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
  const posterScrollContainerRef = useRef<HTMLDivElement>(null);
  const wasPosterOpen = useRef(false);
  const scrollTimeoutRef = useRef<number | null>(null);
  const [hasScrolledPosterToInitial, setHasScrolledPosterToInitial] = useState(false);
  const [showScrollHint, setShowScrollHint] = useState(false);

  // Saved wallpapers in local collection
  const [savedWallpapers, setSavedWallpapers] = useState<string[]>(() => {
    try {
      const stored = localStorage.getItem("hk_saved_wallpapers");
      return stored ? JSON.parse(stored) : [];
    } catch (_) {
      return [];
    }
  });

  const [savedSubTab, setSavedSubTab] = useState<"posters" | "liked">("posters");
  const [likedPosterIds, setLikedPosterIds] = useState<string[]>(() => {
    try {
      return JSON.parse(localStorage.getItem('hk_liked_posters') || '[]');
    } catch (_) {
      return [];
    }
  });

  const [likedWallpaperIds, setLikedWallpaperIds] = useState<string[]>(() => {
    try {
      return JSON.parse(localStorage.getItem('hk_liked_wallpapers') || '[]');
    } catch (_) {
      return [];
    }
  });

  const toggleLike = React.useCallback((posterId: string) => {
    setLikedPosterIds(prev => {
      const next = prev.includes(posterId)
        ? prev.filter(id => id !== posterId)
        : [...prev, posterId];
      try {
        localStorage.setItem('hk_liked_posters', JSON.stringify(next));
      } catch (_) {}
      return next;
    });
  }, []);

  const toggleLikeWallpaper = React.useCallback((wpId: string) => {
    setLikedWallpaperIds(prev => {
      const next = prev.includes(wpId)
        ? prev.filter(id => id !== wpId)
        : [...prev, wpId];
      try {
        localStorage.setItem('hk_liked_wallpapers', JSON.stringify(next));
      } catch (_) {}
      return next;
    });
  }, []);

  useEffect(() => {
    if (activeTab === "saved") {
      try {
        setLikedPosterIds(JSON.parse(localStorage.getItem('hk_liked_posters') || '[]'));
        setLikedWallpaperIds(JSON.parse(localStorage.getItem('hk_liked_wallpapers') || '[]'));
      } catch (_) {}
    }
  }, [activeTab, selectedPoster]);

  const likedPosters = React.useMemo(() => {
    return POSTER_TEMPLATES.filter(tpl => likedPosterIds.includes(tpl.id));
  }, [likedPosterIds]);

  const likedWallpapers = React.useMemo(() => {
    const staticLiked = WALLPAPERS_LIST.filter(wp => likedWallpaperIds.includes(wp.id));
    const liveLiked = LIVE_WALLPAPERS_LIST.filter(wp => likedWallpaperIds.includes(wp.id));
    return { staticLiked, liveLiked };
  }, [likedWallpaperIds]);

  useEffect(() => {
    if (showSetupSheet) {
      setTempName(userName);
      setTempPhoto(userPhoto);
    }
  }, [showSetupSheet, userName, userPhoto]);

  useEffect(() => {
    try {
      localStorage.setItem("hk_profile_name", userName);
    } catch (err) {
      console.error("Failed to save profile name to localStorage", err);
    }
  }, [userName]);

  useEffect(() => {
    if (userPhoto) {
      try {
        localStorage.setItem("hk_profile_photo", userPhoto);
      } catch (err) {
        console.error("Failed to save profile photo to localStorage", err);
      }
    } else {
      localStorage.removeItem("hk_profile_photo");
    }
  }, [userPhoto]);

  useEffect(() => {
    if (selectedPoster) {
      compilePoster(selectedPoster, generationType)
        .then((url) => setCompiledPosterUrl(url))
        .catch((err) => console.error("Poster compile error", err));
    } else {
      setCompiledPosterUrl(null);
    }
  }, [selectedPoster, userName, userPhoto, generationType, posterZoom, posterOffsetX, posterOffsetY, posterShape]);

  useEffect(() => {
    if (selectedPoster) {
      const defaultShape = selectedPoster.defaultShape || "circle";
      setPosterShape(defaultShape);
      setPosterZoom(1.0);
      setPosterOffsetX(0);
      setPosterOffsetY(0);
    }
  }, [selectedPoster]);

  // Synchronize vertical scrolling with selected poster template inside the modal
  useEffect(() => {
    if (selectedPoster) {
      if (!hasScrolledPosterToInitial) {
        const timer = setTimeout(() => {
          const element = document.getElementById(`poster-card-${selectedPoster.id}`);
          if (element) {
            element.scrollIntoView({ behavior: "auto", block: "center", inline: "nearest" });
            setHasScrolledPosterToInitial(true);
          }
        }, 30);
        return () => clearTimeout(timer);
      }
    } else {
      setHasScrolledPosterToInitial(false);
    }
  }, [selectedPoster, hasScrolledPosterToInitial]);

  // Show vertical scroll hint overlay briefly when modal is opened (only once ever!)
  useEffect(() => {
    if (selectedPoster) {
      const hasSeen = localStorage.getItem("hk_seen_poster_scroll_hint");
      if (!hasSeen && !wasPosterOpen.current) {
        setShowScrollHint(true);
        const timer = setTimeout(() => {
          setShowScrollHint(false);
          localStorage.setItem("hk_seen_poster_scroll_hint", "true");
        }, 2200);
        wasPosterOpen.current = true;
        return () => clearTimeout(timer);
      }
    } else {
      wasPosterOpen.current = false;
      setShowScrollHint(false);
    }
  }, [selectedPoster]);

  const handlePosterScroll = (e: React.UIEvent<HTMLDivElement>) => {
    if (!hasScrolledPosterToInitial) return;
    const container = e.currentTarget;
    const scrollTop = container.scrollTop;
    const cardHeight = container.clientHeight;
    if (cardHeight === 0) return;

    if (scrollTimeoutRef.current) {
      window.clearTimeout(scrollTimeoutRef.current);
    }

    scrollTimeoutRef.current = window.setTimeout(() => {
      const index = Math.round(scrollTop / cardHeight);
      if (index >= 0 && index < POSTER_TEMPLATES.length) {
        const activePoster = POSTER_TEMPLATES[index];
        setSelectedPoster((curr) => {
          if (curr && activePoster.id !== curr.id) {
            return activePoster;
          }
          return curr;
        });
      }
    }, 120);
  };

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

    if (showPreviewModal || showLivePreviewModal || showPremiumTplModal || !!selectedPoster) {
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
  }, [showPreviewModal, showLivePreviewModal, showPremiumTplModal, selectedPoster]);

  // Wire modal visibility to app context to hide FAB Narad assistant
  useEffect(() => {
    setBhajanModalOpen(!!(showPreviewModal || showLivePreviewModal || showPremiumTplModal || selectedPoster));
    return () => setBhajanModalOpen(false);
  }, [showPreviewModal, showLivePreviewModal, showPremiumTplModal, selectedPoster, setBhajanModalOpen]);

  // Refs
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const profileEditFileInputRef = useRef<HTMLInputElement | null>(null);
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
    } catch (_) { /* ignore localstorage error */ }

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
      (async () => {
        const canvas = canvasRef.current;
        if (!canvas) {
          toast.error("Graphics compiler not initialized.");
          return reject("No canvas context");
        }
        const ctx = canvas.getContext("2d");
        if (!ctx) return reject("No 2d context");

      // Load fonts using Font Loading API to guarantee exact layout matches
      try {
        if (language === 'hi' || language === 'mr') {
          await document.fonts.load("bold 60px 'Tiro Devanagari Hindi'");
          await document.fonts.load("bold 56px 'Noto Sans Devanagari'");
          await document.fonts.load("normal 34px 'Noto Sans Devanagari'");
          await document.fonts.load("bold 34px 'Noto Sans Devanagari'");
        } else if (language === 'gu') {
          await document.fonts.load("bold 60px 'Noto Sans Gujarati'");
          await document.fonts.load("normal 34px 'Noto Sans Gujarati'");
          await document.fonts.load("bold 34px 'Noto Sans Gujarati'");
        } else if (language === 'bn') {
          await document.fonts.load("bold 60px 'Noto Sans Bengali'");
          await document.fonts.load("normal 34px 'Noto Sans Bengali'");
          await document.fonts.load("bold 34px 'Noto Sans Bengali'");
        } else if (language === 'ta') {
          await document.fonts.load("bold 60px 'Noto Sans Tamil'");
          await document.fonts.load("normal 34px 'Noto Sans Tamil'");
          await document.fonts.load("bold 34px 'Noto Sans Tamil'");
        } else {
          await document.fonts.load("bold 60px 'Faculty Glyphic'");
          await document.fonts.load("bold 56px 'Inter'");
          await document.fonts.load("normal 34px 'Inter'");
          await document.fonts.load("bold 34px 'Inter'");
        }
        await document.fonts.ready;
      } catch (err) {
        console.warn("Font loading API error, falling back:", err);
      }

      // Configure anti-aliasing and sharpness
      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = "high";

      const tpl = selectedTemplate;
      const aspect = generationType; // vertical/square
      
      const w = 1080;
      const h = aspect === "square" ? 1080 : 1920;
      canvas.width = w;
      canvas.height = h;

      // Draw backdrop base
      ctx.fillStyle = "#120603";
      ctx.fillRect(0, 0, w, h);

      const isPoster = !!selectedPoster;
      const bgImgSrc = isPoster ? selectedPoster.imageUrl : todayDarshan.imageUrl;

      // Load Image
      const deityImg = new Image();
      deityImg.crossOrigin = "anonymous";
      deityImg.src = bgImgSrc;
      
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
        if (isPoster) {
          // Dark overlay for posters so user name/photo stand out
          grad.addColorStop(0, "rgba(10, 5, 2, 0.05)");
          grad.addColorStop(0.5, "rgba(15, 6, 2, 0.35)");
          grad.addColorStop(0.85, "rgba(15, 6, 2, 0.85)");
          grad.addColorStop(1, "rgba(10, 3, 1, 0.98)");
        } else {
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
        }
        ctx.fillStyle = grad;
        ctx.fillRect(0, 0, w, h);

        // Draw Borders
        const borderPadding = aspect === "square" ? 22 : 36;
        if (!isPoster) {
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
        } else {
          // Minimal borders for poster layout
          ctx.strokeStyle = "rgba(251, 191, 36, 0.2)";
          ctx.lineWidth = 6;
          ctx.strokeRect(3, 3, w - 6, h - 6);
        }

        // Fetch poster typography layout settings
        const posterTypography = getPosterTypography(language, aspect, isPoster);

        // Render Typography (Title Header)
        const headerTitle = isPoster 
          ? (isHi ? selectedPoster.titleHindi : selectedPoster.title)
          : (isHi ? "🙏 आज का दिव्य दर्शन 🙏" : "🙏 Today's Daily Darshan 🙏");
        const headerSub = isPoster
          ? (isHi ? selectedPoster.subtitleHindi : selectedPoster.subtitle)
          : (isHi ? `${todayDarshan.deityHindi} • ${todayDarshan.templeNameHindi}` : `${todayDarshan.deity} • ${todayDarshan.templeName}`);

        // Configure high-contrast drop shadow for headers to ensure legibility
        ctx.shadowColor = "rgba(0, 0, 0, 0.85)";
        ctx.shadowBlur = 8;
        ctx.shadowOffsetX = 0;
        ctx.shadowOffsetY = 3;

        ctx.textAlign = "center";
        ctx.fillStyle = "#ffffff";
        ctx.font = `bold ${posterTypography.titleSize}px ${posterTypography.titleFont}`;
        ctx.fillText(headerTitle, w / 2, aspect === "square" ? 95 : 170);

        ctx.fillStyle = tpl === "white" ? "#cbd5e1" : "#fbbf24";
        ctx.font = `normal ${posterTypography.subtitleSize}px ${posterTypography.subtitleFont}`;
        ctx.fillText(headerSub, w / 2, aspect === "square" ? 140 : 225);

        // Reset shadow
        ctx.shadowBlur = 0;
        ctx.shadowOffsetX = 0;
        ctx.shadowOffsetY = 0;

        // Devotee photo rendering scale coordinates
        const scaleY = aspect === "square" ? (1080 / 1920) : 1;
        const hasPhoto = !!userPhoto;
        const radius = isPoster
          ? selectedPoster.photoPosition.radius * 2
          : (aspect === "square" ? 170 : 210);
        const avatarSize = isPoster
          ? selectedPoster.photoPosition.y * scaleY
          : (aspect === "square" ? 310 : 450);
        const centerX = isPoster ? selectedPoster.photoPosition.x : w / 2;

        const drawQuoteBlock = () => {
          const personalizedName = userName.trim() ? userName.trim() : (isHi ? "हरि भक्त" : "Devotee");
          const bannerY = isPoster
            ? selectedPoster.namePosition.y * scaleY
            : (aspect === "square" ? 760 : 1240);

          if (isPoster) {
            // Draw a beautiful glassmorphic devotee banner for posters
            const isWhiteTheme = tpl === "white";
            ctx.fillStyle = isWhiteTheme ? "rgba(15, 23, 42, 0.85)" : "rgba(12, 5, 2, 0.85)";
            ctx.strokeStyle = isWhiteTheme ? "rgba(203, 213, 225, 0.5)" : "rgba(251, 191, 36, 0.5)";
            ctx.lineWidth = 3;
            ctx.textBaseline = "middle";

            const resolvedFontString = fitTextToWidth(
              ctx,
              personalizedName,
              w - 240, // maximum width limit
              posterTypography.nameSize,
              posterTypography.nameFont,
              'bold'
            );
            ctx.font = resolvedFontString;

            const fontSizeMatch = resolvedFontString.match(/(\d+)px/);
            const fontSize = fontSizeMatch ? parseInt(fontSizeMatch[1], 10) : posterTypography.nameSize;

            const nameWidth = ctx.measureText(personalizedName).width;
            const bannerW = nameWidth + 80;
            const bannerH = fontSize + 32;
            const bannerX = w / 2 - bannerW / 2;
            const rectY = bannerY - bannerH / 2;

            // Clear shadow for banner background
            ctx.shadowBlur = 0;
            ctx.shadowOffsetX = 0;
            ctx.shadowOffsetY = 0;

            ctx.beginPath();
            ctx.roundRect(bannerX, rectY, bannerW, bannerH, 16);
            ctx.fill();
            ctx.stroke();

            // Set high-contrast text shadow for devotee name
            ctx.shadowColor = "rgba(0, 0, 0, 0.95)";
            ctx.shadowBlur = 8;
            ctx.shadowOffsetX = 0;
            ctx.shadowOffsetY = 3;

            ctx.fillStyle = isWhiteTheme ? "#ffffff" : "#fbbf24";
            ctx.fillText(personalizedName, w / 2, bannerY);
            
            // Reset textBaseline and shadow
            ctx.textBaseline = "alphabetic";
            ctx.shadowBlur = 0;
            ctx.shadowOffsetX = 0;
            ctx.shadowOffsetY = 0;

            // Render quote below name using fitMultiLineText
            ctx.fillStyle = "#ffffff";
            const rawQuote = isHi ? selectedPoster.quoteHindi : selectedPoster.quote;
            const quoteFont = `normal ${posterTypography.quoteSize}px ${posterTypography.quoteFont}`;
            const quoteCenterY = bannerY + (aspect === "square" ? 90 : 130);
            
            // Set text shadow for quote
            ctx.shadowColor = "rgba(0, 0, 0, 0.85)";
            ctx.shadowBlur = 8;
            ctx.shadowOffsetX = 0;
            ctx.shadowOffsetY = 2;

            const quoteLines = fitMultiLineText(
              ctx,
              rawQuote,
              w - 180,
              quoteCenterY,
              posterTypography.lineHeight,
              language,
              quoteFont,
              2
            );

            quoteLines.forEach((line) => {
              ctx.fillText(line.text, w / 2, line.y);
            });

            // Reset shadow
            ctx.shadowBlur = 0;
            ctx.shadowOffsetX = 0;
            ctx.shadowOffsetY = 0;
          } else {
            // Draw original quote block using fitMultiLineText
            ctx.textAlign = "center";
            ctx.fillStyle = "#ffffff";
            
            // Set shadow for quote
            ctx.shadowColor = "rgba(0, 0, 0, 0.85)";
            ctx.shadowBlur = 8;
            ctx.shadowOffsetX = 0;
            ctx.shadowOffsetY = 2;

            const rawQuote = isHi ? todayDarshan.quoteHindi : todayDarshan.quote;
            const quoteFont = `normal ${aspect === "square" ? 30 : 36}px ${posterTypography.quoteFont}`;
            const quoteCenterY = aspect === "square" ? 620 : 980;
            
            const quoteLines = fitMultiLineText(
              ctx,
              rawQuote,
              w - 180,
              quoteCenterY,
              aspect === "square" ? 44 : 52,
              language,
              quoteFont,
              3
            );

            quoteLines.forEach((line) => {
              ctx.fillText(line.text, w / 2, line.y);
            });

            // Reset shadow
            ctx.shadowBlur = 0;
            ctx.shadowOffsetX = 0;
            ctx.shadowOffsetY = 0;

            // Devotee Personalization Name Banner
            let bannerText = "";
            const cleanedName = userName.trim();
            if (cleanedName) {
              if (blessingType === "parents") {
                bannerText = isHi ? `${cleanedName} एवं माता-पिता हेतु आशीर्वाद` : `Blessings for ${cleanedName} & Parents`;
              } else if (blessingType === "family") {
                bannerText = isHi ? `${cleanedName} एवं सपरिवार हेतु आशीर्वाद` : `Blessings for ${cleanedName} & Family`;
              } else if (blessingType === "friends") {
                bannerText = isHi ? `${cleanedName} एवं मित्रों हेतु आशीर्वाद` : `Blessings for ${cleanedName} & Friends`;
              } else if (blessingType === "universal") {
                bannerText = isHi ? `सर्वे भवन्तु सुखिनः (द्वारा: ${cleanedName})` : `Peace & Blessings for All (by ${cleanedName})`;
              } else {
                bannerText = isHi ? `${cleanedName} जी हेतु आशीर्वाद` : `Blessings for ${cleanedName}`;
              }
            } else {
              if (blessingType === "parents") bannerText = isHi ? "माता-पिता हेतु दिव्य आशीर्वाद" : "Divine Blessings for Parents";
              else if (blessingType === "family") bannerText = isHi ? "परिवार हेतु दिव्य आशीर्वाद" : "Divine Blessings for Family";
              else if (blessingType === "friends") bannerText = isHi ? "प्रिय मित्रों हेतु दिव्य आशीर्वाद" : "Divine Blessings for Friends";
              else if (blessingType === "universal") bannerText = isHi ? "सर्वे भवन्तु सुखिनः (विश्व शांति)" : "Peace & Blessings for All";
              else bannerText = isHi ? "हरि भक्त हेतु दिव्य आशीर्वाद" : "Divine Blessings for Devotee";
            }

            // Draw clean glassmorphic banner for devotee
            const isWhiteTheme = tpl === "white";
            ctx.fillStyle = isWhiteTheme ? "rgba(15, 23, 42, 0.85)" : "rgba(12, 5, 2, 0.85)";
            ctx.strokeStyle = isWhiteTheme ? "rgba(203, 213, 225, 0.5)" : "rgba(251, 191, 36, 0.5)";
            ctx.lineWidth = 3;
            
            // Limit name banner size using fitTextToWidth
            const targetFontSize = aspect === "square" ? 34 : 40;
            const resolvedFontString = fitTextToWidth(
              ctx,
              bannerText,
              w - 240,
              targetFontSize,
              posterTypography.nameFont,
              'bold'
            );
            ctx.font = resolvedFontString;

            const fontSizeMatch = resolvedFontString.match(/(\d+)px/);
            const fontSize = fontSizeMatch ? parseInt(fontSizeMatch[1], 10) : targetFontSize;
            
            const textWidth = ctx.measureText(bannerText).width;
            const rectWidth = textWidth + 80;
            const bannerH = fontSize + 32;
            const rectX = w / 2 - rectWidth / 2;
            const rectY = bannerY - bannerH / 2;
            
            ctx.beginPath();
            ctx.roundRect(rectX, rectY, rectWidth, bannerH, 16);
            ctx.fill();
            ctx.stroke();

            // Set high-contrast text shadow for devotee name
            ctx.shadowColor = "rgba(0, 0, 0, 0.95)";
            ctx.shadowBlur = 8;
            ctx.shadowOffsetX = 0;
            ctx.shadowOffsetY = 3;

            ctx.fillStyle = isWhiteTheme ? "#ffffff" : "#fbbf24";
            ctx.textBaseline = "middle";
            ctx.fillText(bannerText, w / 2, bannerY);

            // Reset textBaseline and shadow
            ctx.textBaseline = "alphabetic";
            ctx.shadowBlur = 0;
            ctx.shadowOffsetX = 0;
            ctx.shadowOffsetY = 0;
          }

          // Add clean watermark at bottom (slightly larger, shadow supported)
          ctx.fillStyle = "rgba(255, 255, 255, 0.6)";
          ctx.font = `bold ${aspect === "square" ? 22 : 26}px ${posterTypography.subtitleFont}`;
          ctx.shadowColor = "rgba(0, 0, 0, 0.6)";
          ctx.shadowBlur = 4;
          ctx.shadowOffsetY = 1;
          ctx.fillText("✨ Created with Raghavam", w / 2, h - (aspect === "square" ? 60 : 100));

          // Reset shadow
          ctx.shadowBlur = 0;
          ctx.shadowOffsetY = 0;

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
          ctx.arc(centerX, avatarSize, radius / 2, 0, Math.PI * 2);
          ctx.fill();

          ctx.fillStyle = tpl === "white" ? "#e2e8f0" : "#fbbf24";
          ctx.font = getCanvasFont(language, aspect === "square" ? 42 : 56, 'heading', true);
          ctx.fillText("ॐ", centerX, avatarSize + (aspect === "square" ? 14 : 18));

          drawQuoteBlock();
        }
      };

      deityImg.onerror = (err) => reject(err);
      })().catch(reject);
    });
  };

  const drawPlaceholderOm = (ctx: CanvasRenderingContext2D, x: number, y: number, r: number) => {
    ctx.fillStyle = "rgba(251, 191, 36, 0.15)";
    ctx.beginPath();
    ctx.arc(x, y, r, 0, Math.PI * 2);
    ctx.fill();

    ctx.strokeStyle = "#fbbf24";
    ctx.lineWidth = 6;
    ctx.beginPath();
    ctx.arc(x, y, r, 0, Math.PI * 2);
    ctx.stroke();

    ctx.fillStyle = "#fbbf24";
    ctx.font = getCanvasFont(language, 80, 'heading', true);
    ctx.textAlign = "center";
    ctx.fillText("ॐ", x, y + 25);
  };

  const compilePoster = (poster: PosterTemplate, aspect: "status" | "square"): Promise<string> => {
    return new Promise((resolve, reject) => {
      (async () => {
        const canvas = canvasRef.current;
        if (!canvas) {
          toast.error("Graphics compiler not initialized.");
          return reject("No canvas context");
        }
        const ctx = canvas.getContext("2d");
        if (!ctx) return reject("No 2d context");

      // Load fonts using Font Loading API to guarantee exact layout matches
      try {
        if (language === 'hi' || language === 'mr') {
          await document.fonts.load("bold 60px 'Tiro Devanagari Hindi'");
          await document.fonts.load("bold 56px 'Noto Sans Devanagari'");
          await document.fonts.load("normal 34px 'Noto Sans Devanagari'");
          await document.fonts.load("bold 34px 'Noto Sans Devanagari'");
        } else if (language === 'gu') {
          await document.fonts.load("bold 60px 'Noto Sans Gujarati'");
          await document.fonts.load("normal 34px 'Noto Sans Gujarati'");
          await document.fonts.load("bold 34px 'Noto Sans Gujarati'");
        } else if (language === 'bn') {
          await document.fonts.load("bold 60px 'Noto Sans Bengali'");
          await document.fonts.load("normal 34px 'Noto Sans Bengali'");
          await document.fonts.load("bold 34px 'Noto Sans Bengali'");
        } else if (language === 'ta') {
          await document.fonts.load("bold 60px 'Noto Sans Tamil'");
          await document.fonts.load("normal 34px 'Noto Sans Tamil'");
          await document.fonts.load("bold 34px 'Noto Sans Tamil'");
        } else {
          await document.fonts.load("bold 60px 'Faculty Glyphic'");
          await document.fonts.load("bold 56px 'Inter'");
          await document.fonts.load("normal 34px 'Inter'");
          await document.fonts.load("bold 34px 'Inter'");
        }
        await document.fonts.ready;
      } catch (err) {
        console.warn("Font loading API error, falling back:", err);
      }

      // Configure anti-aliasing and sharpness
      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = "high";

      const w = 1080;
      const h = aspect === "square" ? 1080 : 1920;
      canvas.width = w;
      canvas.height = h;

      // Draw black background
      ctx.fillStyle = "#0c0503";
      ctx.fillRect(0, 0, w, h);

      // Load Template Image
      const templateImg = new Image();
      templateImg.crossOrigin = "anonymous";
      templateImg.src = poster.imageUrl;

      templateImg.onload = () => {
        // Draw template image with cover aspect ratio
        const imageRatio = templateImg.width / templateImg.height;
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

        ctx.drawImage(templateImg, drawX, drawY, drawWidth, drawHeight);

        // If aspect is square, shift coordinates relative to crop centering
        const photoX = poster.photoPosition.x;
        let photoY = poster.photoPosition.y;
        const nameX = poster.namePosition.x;
        let nameY = poster.namePosition.y;

        if (aspect === "square") {
          const yOffset = 420;
          photoY = Math.max(100, Math.min(980, photoY - yOffset));
          nameY = Math.max(150, Math.min(1030, nameY - yOffset));
        }

        const radius = poster.photoPosition.radius;

        const posterTypography = getPosterTypography(language, aspect, true);

        const drawNameText = () => {
          ctx.save();
          
          const finalNameX = nameX + posterNameOffsetX;
          const finalNameY = nameY + posterNameOffsetY;
          
          // Translate, rotate, and scale around the name banner center
          ctx.translate(finalNameX, finalNameY);
          ctx.rotate(posterNameRotation);
          ctx.scale(posterNameScale, posterNameScale);
          
          ctx.textAlign = "center";
          ctx.textBaseline = "middle";

          const displayName = userName.trim() ? userName : (isHi ? "भक्त" : "Devotee");

          // Fit text size dynamically using fitTextToWidth
          const resolvedFontString = fitTextToWidth(
            ctx,
            displayName,
            w - 240, // max width limit for safety
            posterTypography.nameSize,
            posterTypography.nameFont,
            'bold'
          );
          ctx.font = resolvedFontString;
          
          const fontSizeMatch = resolvedFontString.match(/(\d+)px/);
          const fontSize = fontSizeMatch ? parseInt(fontSizeMatch[1], 10) : posterTypography.nameSize;

          const nameWidth = ctx.measureText(displayName).width;
          const bannerW = nameWidth + 80;
          const bannerH = fontSize + 32;
          const bannerX = -bannerW / 2;
          const bannerY = -bannerH / 2;

          // Clear shadow for banner background
          ctx.shadowBlur = 0;
          ctx.shadowOffsetX = 0;
          ctx.shadowOffsetY = 0;

          // Rich dark glassmorphic style
          ctx.fillStyle = "rgba(12, 5, 2, 0.85)";
          ctx.strokeStyle = "rgba(251, 191, 36, 0.5)";
          ctx.lineWidth = 3;
          ctx.beginPath();
          
          // Custom corner radius based on posterNameShape setting
          const nameRadius = 
            posterNameShape === "circle" || posterNameShape === "oval"
              ? bannerH / 2 // perfect capsule
              : posterNameShape === "square"
              ? 0
              : 16; // rounded-square
              
          ctx.roundRect(bannerX, bannerY, bannerW, bannerH, nameRadius);
          ctx.fill();
          ctx.stroke();

          // Set high-contrast text shadow for devotee name
          ctx.shadowColor = "rgba(0, 0, 0, 0.95)";
          ctx.shadowBlur = 8;
          ctx.shadowOffsetX = 0;
          ctx.shadowOffsetY = 3;

          ctx.fillStyle = "#fbbf24";
          // Draw text centered at translated 0,0 origin
          ctx.fillText(displayName, 0, 0);

          ctx.restore();

          // Watermark - slightly larger and shadow supported
          ctx.save();
          ctx.textAlign = "center";
          ctx.textBaseline = "middle";
          ctx.fillStyle = "rgba(255, 255, 255, 0.6)";
          ctx.font = `bold 24px ${posterTypography.subtitleFont}`;
          ctx.shadowColor = "rgba(0, 0, 0, 0.6)";
          ctx.shadowBlur = 4;
          ctx.shadowOffsetY = 1;
          ctx.fillText("✨ Created with Raghavam", w / 2, h - 60);
          ctx.restore();

          resolve(canvas.toDataURL("image/png"));
        };

        if (userPhoto) {
          const avatarImg = new Image();
          avatarImg.crossOrigin = "anonymous";
          avatarImg.src = userPhoto;
          avatarImg.onload = () => {
            ctx.save();
            
            const isFlexible = poster.allowShapeChange;
            const finalCX = isFlexible ? (photoX + posterOffsetX) : photoX;
            const finalCY = isFlexible ? (photoY + posterOffsetY) : photoY;
            const finalRadius = isFlexible ? (radius * posterFrameScale) : radius;

            // Translate and rotate around the shape center
            ctx.translate(finalCX, finalCY);
            ctx.rotate(posterRotation);

            // Mask clip shape
            ctx.beginPath();
            if (posterShape === "circle") {
              ctx.arc(0, 0, finalRadius, 0, Math.PI * 2);
            } else if (posterShape === "square") {
              ctx.rect(-finalRadius, -finalRadius, finalRadius * 2, finalRadius * 2);
            } else if (posterShape === "rounded-square") {
              const r = finalRadius * 2 * 0.15;
              ctx.roundRect(-finalRadius, -finalRadius, finalRadius * 2, finalRadius * 2, r);
            } else if (posterShape === "oval") {
              ctx.ellipse(0, 0, finalRadius, finalRadius * 1.33, 0, 0, Math.PI * 2);
            }
            ctx.closePath();
            ctx.clip();

            const targetW = finalRadius * 2;
            const targetH = finalRadius * 2;

            const userZoom = posterZoom;
            const userOffsetX = isFlexible ? 0 : posterOffsetX;
            const userOffsetY = isFlexible ? 0 : posterOffsetY;

            const baseScale = Math.max(targetW / avatarImg.width, targetH / avatarImg.height);
            const DW = avatarImg.width * baseScale * userZoom;
            const DH = avatarImg.height * baseScale * userZoom;
            const drawX = -DW / 2 + userOffsetX;
            const drawY = -DH / 2 + userOffsetY;

            ctx.drawImage(avatarImg, drawX, drawY, DW, DH);
            ctx.restore();

            // Gold border matching active shape
            ctx.save();
            ctx.translate(finalCX, finalCY);
            ctx.rotate(posterRotation);
            ctx.strokeStyle = "#fbbf24";
            ctx.lineWidth = 6;
            ctx.beginPath();
            if (posterShape === "circle") {
              ctx.arc(0, 0, finalRadius, 0, Math.PI * 2);
            } else if (posterShape === "square") {
              ctx.rect(-finalRadius, -finalRadius, finalRadius * 2, finalRadius * 2);
            } else if (posterShape === "rounded-square") {
              const r = finalRadius * 2 * 0.15;
              ctx.roundRect(-finalRadius, -finalRadius, finalRadius * 2, finalRadius * 2, r);
            } else if (posterShape === "oval") {
              ctx.ellipse(0, 0, finalRadius, finalRadius * 1.33, 0, 0, Math.PI * 2);
            }
            ctx.closePath();
            ctx.stroke();
            ctx.restore();

            drawNameText();
          };
          avatarImg.onerror = () => {
            drawPlaceholderOm(ctx, photoX, photoY, radius);
            drawNameText();
          };
        } else {
          drawPlaceholderOm(ctx, photoX, photoY, radius);
          drawNameText();
        }
      };

      templateImg.onerror = (err) => reject(err);
      })().catch(reject);
    });
  };

  const handleDownloadPoster = async () => {
    if (!selectedPoster) return;
    try {
      toast.info(isHi ? "छवि तैयार की जा रही है..." : "Generating poster...");
      const dataUrl = await compilePoster(selectedPoster, generationType);
      
      const link = document.createElement("a");
      link.download = `${selectedPoster.title.replace(/\s+/g, "_")}_Personalized.png`;
      link.href = dataUrl;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      saveBlessingToGallery(dataUrl);
      completeTodaySadhana();
      toast.success(isHi ? "पावन पोस्टर सेव हो गया!" : "Spiritual poster saved successfully!");
    } catch (e) {
      console.error(e);
      toast.error(isHi ? "डाउनलोड करने में विफल" : "Failed to compile poster image.");
    }
  };

  const handleSharePosterNative = async () => {
    if (!selectedPoster) return;
    try {
      toast.info(isHi ? "साझा करने के लिए छवि तैयार हो रही है..." : "Compiling image to share...");
      const dataUrl = await compilePoster(selectedPoster, generationType);
      const response = await fetch(dataUrl);
      const blob = await response.blob();
      const file = new File([blob], `${selectedPoster.title.replace(/\s+/g, "_")}.png`, { type: "image/png" });

      if (navigator.canShare && navigator.canShare({ files: [file] })) {
        await navigator.share({
          files: [file],
          title: isHi ? `${selectedPoster.titleHindi}` : `${selectedPoster.title}`,
          text: isHi 
            ? `राघवम् से प्राप्त करें आज का ${selectedPoster.titleHindi} पावन आशीर्वाद।` 
            : `Receive today's divine ${selectedPoster.title} blessing from Raghavam.`
        });
        completeTodaySadhana();
      } else {
        await copyTextToClipboard(window.location.origin);
        toast.info(isHi ? "लिंक कॉपी हो गया! पोस्टर डाउनलोड हो रहा है।" : "Sharing unsupported. Copying link & downloading image.");
        handleDownloadPoster();
      }
    } catch (e) {
      console.error(e);
      toast.error(isHi ? "साझा करने में विफल" : "Failed to share poster.");
    }
  };


  const handleDownloadSadhana = async () => {
    if (isTemplatePremium(selectedTemplate)) {
      setShowPremiumTplModal(selectedTemplate);
      return;
    }

    try {
      toast.info(isHi ? "छवि तैयार की जा रही है..." : "Generating poster...");
      const dataUrl = await compileBlessingCard();
      
      const link = document.createElement("a");
      const filename = selectedPoster
        ? `${selectedPoster.title.replace(/\s+/g, "_")}_Personalized.png`
        : `${todayDarshan.deity.replace(/\s+/g, "_")}_Daily_Poster.png`;
      link.download = filename;
      link.href = dataUrl;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      saveBlessingToGallery(dataUrl);
      completeTodaySadhana();
      toast.success(isHi ? "पोस्टर गैलरी में सेव हो गया!" : "Poster downloaded & saved locally!");
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
    } catch (_) { /* ignore localstorage error */ }
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
              <span className="font-sans text-[10px] text-amber-200 block mt-1.5 font-semibold leading-none">
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
            <h1 className={`font-serif text-base md:text-lg font-black text-amber-400 uppercase flex items-center gap-1.5 justify-center leading-none ${isHi ? '' : 'tracking-widest'}`}>
              <Sparkles className="w-4 h-4 text-amber-400 fill-current animate-pulse" />
              {isHi ? "नित्य दर्शन व आशीर्वाद" : "Nitya Darshan & Blessings"}
            </h1>
            <span className="font-sans text-[10px] text-amber-200 uppercase tracking-wider block mt-0.5 leading-none font-bold">
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
            className={`flex-1 py-2 rounded-full font-sans text-[11px] font-black uppercase transition-all duration-300 flex items-center justify-center gap-1 focus:outline-none ${isHi ? '' : 'tracking-wider'} ${
              activeTab === "maker"
                ? "bg-gradient-to-r from-amber-500 to-amber-600 text-black shadow-md"
                : "text-amber-200/85 hover:text-amber-200"
            }`}
          >
            <span>✨</span>
            <span>{isHi ? "पोस्टर" : "Posters"}</span>
          </button>
          <button
            onClick={() => setActiveTab("wallpapers")}
            className={`flex-1 py-2 rounded-full font-sans text-[11px] font-black uppercase transition-all duration-300 flex items-center justify-center gap-1 focus:outline-none ${isHi ? '' : 'tracking-wider'} ${
              activeTab === "wallpapers"
                ? "bg-gradient-to-r from-amber-500 to-amber-600 text-black shadow-md"
                : "text-amber-200/85 hover:text-amber-200"
            }`}
          >
            <span>📱</span>
            <span>{isHi ? "वॉलपेपर" : "Wallpapers"}</span>
          </button>
          <button
            onClick={() => setActiveTab("saved")}
            className={`flex-1 py-2 rounded-full font-sans text-[11px] font-black uppercase transition-all duration-300 flex items-center justify-center gap-1 focus:outline-none ${isHi ? '' : 'tracking-wider'} ${
              activeTab === "saved"
                ? "bg-gradient-to-r from-amber-500 to-amber-600 text-black shadow-md"
                : "text-amber-200/85 hover:text-amber-200"
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
          <div className="w-full space-y-6 flex flex-col items-center animate-fade-in select-none">
            {/* SCREEN 1: BROWSE FEED */}
            <div className="w-full space-y-6 flex flex-col items-center animate-fade-in">
                
                {/* Good Morning Greeting Header */}
                <div 
                  className="w-full rounded-3xl p-5 text-left flex items-center gap-4 relative overflow-hidden transition-all duration-300 hover:shadow-xl hover:shadow-amber-500/5 border border-amber-500/20 group/card"
                  style={{
                    background: 'linear-gradient(135deg, rgba(32,13,5,0.9) 0%, rgba(20,7,3,0.95) 50%, rgba(12,3,1,0.98) 100%)',
                    boxShadow: '0 8px 32px rgba(0,0,0,0.6)'
                  }}
                >
                  {/* Glow orbs */}
                  <div className="absolute -top-10 -right-10 w-40 h-40 bg-amber-500/10 rounded-full blur-3xl pointer-events-none animate-pulse duration-4000" />
                  <div className="absolute -bottom-10 -left-10 w-32 h-32 bg-orange-600/8 rounded-full blur-3xl pointer-events-none" />
                  
                  {/* Avatar circle */}
                  <div 
                    onClick={() => setShowSetupSheet(true)}
                    className="w-14 h-14 rounded-full border-2 border-amber-500/40 hover:border-amber-400 bg-stone-950/80 flex items-center justify-center overflow-hidden shrink-0 shadow-lg shadow-amber-500/10 transition-all hover:scale-105 active:scale-95 cursor-pointer relative group"
                  >
                    {userPhoto ? (
                      <img src={userPhoto} alt="devotee" className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300" />
                    ) : (
                      <span className="text-2xl font-serif text-amber-500">ॐ</span>
                    )}
                    <div className="absolute inset-0 bg-black/45 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity duration-200">
                      <Camera className="w-3.5 h-3.5 text-amber-300" />
                    </div>
                  </div>
                  
                  <div className="flex flex-col min-w-0 z-10">
                    <span className={`text-[9px] uppercase font-sans font-black text-amber-500 leading-none mb-1.5 ${isHi ? '' : 'tracking-widest'}`}>
                      {isHi ? "आज का आशीर्वाद" : "Today's Blessing"}
                    </span>
                    <h2 
                      onClick={() => setShowSetupSheet(true)}
                      className="font-serif text-base font-bold text-amber-100 leading-tight flex items-center gap-1.5 cursor-pointer hover:text-amber-200 transition-colors"
                    >
                      <span>{isHi ? "शुभ प्रभात," : "Jai Shri Ram 🙏"}</span> 
                      <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-400 via-orange-300 to-amber-200 drop-shadow-sm font-black">
                        {userName || (isHi ? "हरि भक्त" : "Devotee")}
                      </span>
                    </h2>
                    <p className="text-[10px] text-amber-200 font-sans leading-tight mt-1 font-medium">
                      {isHi ? "ॐ नमः शिवाय। दिन मंगलमय हो ✨" : "May your day be filled with peace ✨"}
                    </p>
                  </div>

                  {/* Edit/Setup profile button */}
                  <button
                    onClick={() => setShowSetupSheet(true)}
                    className={`ml-auto shrink-0 px-3 py-1.5 bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30 text-amber-400 rounded-lg font-sans text-[9px] font-black uppercase transition-all z-10 flex items-center gap-1 active:scale-95 cursor-pointer ${isHi ? '' : 'tracking-wider'}`}
                  >
                    <UserIcon className="w-3 h-3" />
                    <span>{userName ? (isHi ? "बदलें" : "Edit") : (isHi ? "जोड़ें" : "Setup")}</span>
                  </button>
                </div>

                {/* Featured Hero Card — Cinematic */}
                {(() => {
                  const heroPoster = POSTER_TEMPLATES.find(p => p.id === "poster-shyam-1") || POSTER_TEMPLATES[0];
                  return (
                    <div className="w-full rounded-[2rem] overflow-hidden relative shadow-[0_20px_60px_rgba(0,0,0,0.7)] cursor-pointer group flex flex-col md:flex-row md:h-[380px]" style={{border: '1px solid rgba(245,158,11,0.18)'}} onClick={() => setSelectedPoster(heroPoster)}>
                      {/* Left: Image Container */}
                      <div className="w-full aspect-[3/4] md:aspect-auto md:w-1/2 md:h-full relative overflow-hidden shrink-0">
                        <img src={heroPoster.imageUrl} alt={heroPoster.title} className="w-full h-full object-cover group-hover:scale-[1.03] transition-transform duration-700" />
                        
                        {/* Top label */}
                        <div className="absolute top-4 left-4 flex items-center gap-2">
                          <span className={`px-2.5 py-1 rounded-full text-[8px] md:text-[9px] font-black uppercase font-sans ${isHi ? '' : 'tracking-widest'}`} style={{background: 'rgba(251,191,36,0.15)', border: '1px solid rgba(251,191,36,0.35)', color: '#fbbf24'}}>
                            ✨ {isHi ? "आज का विशेष" : "Today's Featured"}
                          </span>
                        </div>
                      </div>

                      {/* Right/Overlay: Details and action */}
                      <div className="absolute inset-x-0 bottom-0 p-5 md:relative md:inset-auto md:w-1/2 md:h-full md:p-8 flex flex-col justify-end md:justify-between hero-card-overlay">
                        {/* Group devotee row & quote for better flex spacing on desktop */}
                        <div className="flex flex-col text-left gap-1 md:gap-4">
                          {/* Devotee row */}
                          <div className="flex items-center gap-2.5 mb-2 md:mb-0">
                            <div className="w-9 h-9 md:w-11 md:h-11 rounded-full overflow-hidden shrink-0" style={{border: '1.5px solid rgba(251,191,36,0.55)', boxShadow: '0 0 8px rgba(251,191,36,0.25)'}}>
                              {userPhoto ? (
                                <img src={userPhoto} alt="devotee" className="w-full h-full object-cover" />
                              ) : (
                                <div className="w-full h-full bg-stone-900 flex items-center justify-center"><span className="text-sm md:text-base font-serif text-amber-500">ॐ</span></div>
                              )}
                            </div>
                            <div className="flex flex-col min-w-0">
                              <span className={`text-[9px] md:text-[10px] font-sans font-black text-amber-500/90 uppercase leading-none ${isHi ? '' : 'tracking-widest'}`}>{isHi ? "पावन पोस्टर" : "Sacred Poster"}</span>
                              <span className="text-xs md:text-sm font-serif font-black text-amber-300 truncate leading-tight drop-shadow mt-0.5">
                                {userName || (isHi ? "हरि भक्त" : "Devotee")}
                              </span>
                            </div>
                          </div>
                          
                          <p className="text-[10px] md:text-xs font-serif italic text-amber-200 line-clamp-2 md:line-clamp-none leading-relaxed mb-4 md:mb-0 font-medium">
                            {isHi ? heroPoster.quoteHindi : heroPoster.quote}
                          </p>
                        </div>

                        {/* Action row */}
                        <div className="flex items-center justify-between gap-3 text-left">
                          <div className="flex flex-col min-w-0">
                            <span className="font-serif text-sm md:text-base font-bold text-amber-200 leading-tight truncate">{isHi ? heroPoster.titleHindi : heroPoster.title}</span>
                            <span className="text-[9px] md:text-[10px] font-sans text-amber-500/80 font-bold leading-none mt-1">{isHi ? "बाबा श्याम आशीर्वाद" : "Khatu Shyam Blessings"}</span>
                          </div>
                          <button
                            onClick={(e) => { e.stopPropagation(); setSelectedPoster(heroPoster); }}
                            className={`shrink-0 px-4 py-2.5 md:px-5 md:py-3 font-sans font-black text-[9px] md:text-[10px] uppercase rounded-xl transition-all active:scale-[0.97] flex items-center gap-1.5 cursor-pointer ${isHi ? '' : 'tracking-widest'}`}
                            style={{background: 'linear-gradient(135deg, #f59e0b, #d97706)', color: '#1a0a02', boxShadow: '0 4px 16px rgba(245,158,11,0.35)'}}
                          >
                            <Sparkles className="w-3.5 h-3.5" />
                            <span>{isHi ? "अपना बनाएं" : "Create Mine"}</span>
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })()}

                {/* Categories Bar Row */}
                <div className="w-full flex items-center justify-start md:justify-center gap-2.5 md:gap-4 overflow-x-auto py-1.5 scrollbar-none">
                  {[
                    { key: "all", label: isHi ? "सभी" : "For You", emoji: "❤️" },
                    { key: "todays", label: isHi ? "आज के" : "Today's", emoji: "🌅" },
                    { key: "good_morning", label: isHi ? "सुप्रभात" : "Morning", emoji: "☀️" },
                    { key: "festival", label: isHi ? "पर्व" : "Festival", emoji: "🎉" },
                    { key: "more", label: isHi ? "और" : "More", emoji: "✨" }
                  ].map((cat) => {
                    const isActive = selectedCategory === cat.key;
                    return (
                      <button
                        key={cat.key}
                        onClick={() => {
                          if (cat.key === "more") {
                            toast.info(isHi ? "शीघ्र ही और पोस्टर उपलब्ध होंगे!" : "More templates coming soon!");
                          } else {
                            setSelectedCategory(cat.key as any);
                          }
                        }}
                        className={`py-2 px-4 rounded-full font-sans text-[10px] md:text-[11px] font-black uppercase transition-all duration-300 flex items-center gap-1.5 shrink-0 focus:outline-none cursor-pointer ${isHi ? '' : 'tracking-wider'}`}
                        style={isActive ? {
                          background: 'linear-gradient(135deg, rgba(251,191,36,0.2) 0%, rgba(217,119,6,0.12) 100%)',
                          border: '1px solid rgba(251,191,36,0.4)',
                          color: '#fbbf24',
                          boxShadow: '0 2px 12px rgba(251,191,36,0.15)'
                        } : {
                          background: 'rgba(0,0,0,0.3)',
                          border: '1px solid rgba(120,60,10,0.15)',
                          color: 'rgba(217,180,140,0.85)'
                        }}
                      >
                        <span className="text-xs">{cat.emoji}</span>
                        <span>{cat.label}</span>
                      </button>
                    );
                  })}
                </div>

                {/* Section grids of templates */}
                <div className="w-full space-y-7">
                  
                  {/* Section 1: Today's Blessings */}
                  {(selectedCategory === "all" || selectedCategory === "todays") && (
                    <div className="space-y-3.5 text-left">
                      <div className="flex items-center gap-2">
                        <span className="text-amber-500 text-xs">🌅</span>
                        <h3 className={`font-serif text-xs font-black uppercase text-amber-400 ${isHi ? '' : 'tracking-widest'}`}>
                          {isHi ? "आज के पावन पोस्टर" : "Today's Sacred Posters"}
                        </h3>
                      </div>
                      <div className="flex flex-row overflow-x-auto gap-4 pb-3.5 pt-1 w-full scrollbar-none snap-x snap-mandatory">
                        {POSTER_TEMPLATES.filter(p => p.category === "todays").map((tpl) => (
                          <div
                            key={tpl.id}
                            onClick={() => setSelectedPoster(tpl)}
                            className="rounded-2xl flex flex-col gap-0 relative cursor-pointer overflow-hidden group transition-transform duration-300 hover:scale-[1.02] active:scale-[0.98] shrink-0 snap-start w-[140px] sm:w-[160px] md:w-[180px]"
                            style={{background: 'rgba(15,7,3,0.7)', border: '1px solid rgba(120,60,10,0.25)', boxShadow: '0 4px 20px rgba(0,0,0,0.5)'}}
                          >
                            <div className="w-full aspect-[9/16] rounded-2xl overflow-hidden relative">
                              <img src={tpl.imageUrl} alt={tpl.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                              {/* Gradient overlay */}
                              <div className="absolute inset-0" style={{background: 'linear-gradient(to top, rgba(5,2,1,0.92) 0%, rgba(5,2,1,0.4) 40%, transparent 70%)'}} />
                              {/* Personalized bottom row */}
                              <div className="absolute inset-x-0 bottom-0 p-2.5 md:p-3 flex flex-col gap-1.5 md:gap-2">
                                <div className="flex items-center gap-1.5">
                                  <div className="w-6 h-6 md:w-7 md:h-7 rounded-full overflow-hidden shrink-0" style={{border: '1px solid rgba(251,191,36,0.5)'}}>
                                    {userPhoto ? (
                                      <img src={userPhoto} alt="devotee" className="w-full h-full object-cover" />
                                    ) : (
                                      <div className="w-full h-full bg-stone-900 flex items-center justify-center"><span className="text-[7px] md:text-[8px] text-amber-500 font-bold">ॐ</span></div>
                                    )}
                                  </div>
                                  <span className="text-[9px] md:text-[10px] font-serif font-black text-amber-400 truncate drop-shadow-lg">
                                    {userName || (isHi ? "हरि भक्त" : "Devotee")}
                                  </span>
                                </div>
                                <p className="text-[7.5px] md:text-[8.5px] font-serif italic text-amber-200 line-clamp-2 leading-tight font-medium">
                                  {isHi ? tpl.quoteHindi : tpl.quote}
                                </p>
                              </div>
                              {/* Like Button Overlay */}
                              <div className="absolute top-2.5 left-2.5 z-30">
                                <PosterLikeButton
                                  posterId={tpl.id}
                                  isLiked={likedPosterIds.includes(tpl.id)}
                                  onToggle={() => toggleLike(tpl.id)}
                                />
                              </div>
                            </div>
                            <div className="px-2.5 py-2.5">
                              <span className="font-serif text-[11px] md:text-xs font-bold text-amber-200 truncate block">
                                {isHi ? tpl.titleHindi : tpl.title}
                              </span>
                              <span className={`text-[8px] md:text-[9px] font-sans text-amber-500 font-bold uppercase block mt-0.5 ${isHi ? '' : 'tracking-wider'}`}>
                                {isHi ? tpl.subtitleHindi : tpl.subtitle}
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Section 2: Festival Specials */}
                  {(selectedCategory === "all" || selectedCategory === "festival") && (
                    <div className="space-y-3.5 text-left">
                      <div className="flex items-center gap-2">
                        <span className="text-amber-500 text-xs">🎉</span>
                        <h3 className={`font-serif text-xs font-black uppercase text-amber-400 ${isHi ? '' : 'tracking-widest'}`}>
                          {isHi ? "उत्सव एवं विशेष पर्व पोस्टर" : "Festival Special Posters"}
                        </h3>
                      </div>
                      <div className="flex flex-row overflow-x-auto gap-4 pb-3.5 pt-1 w-full scrollbar-none snap-x snap-mandatory">
                        {POSTER_TEMPLATES.filter(p => p.category === "festival").map((tpl) => (
                          <div
                            key={tpl.id}
                            onClick={() => setSelectedPoster(tpl)}
                            className="rounded-2xl flex flex-col gap-0 relative cursor-pointer overflow-hidden group transition-transform duration-300 hover:scale-[1.02] active:scale-[0.98] shrink-0 snap-start w-[140px] sm:w-[160px] md:w-[180px]"
                            style={{background: 'rgba(15,7,3,0.7)', border: '1px solid rgba(120,60,10,0.25)', boxShadow: '0 4px 20px rgba(0,0,0,0.5)'}}
                          >
                            <div className="w-full aspect-[9/16] rounded-2xl overflow-hidden relative">
                              <img src={tpl.imageUrl} alt={tpl.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                              <div className="absolute inset-0" style={{background: 'linear-gradient(to top, rgba(5,2,1,0.92) 0%, rgba(5,2,1,0.4) 40%, transparent 70%)'}} />
                              <div className="absolute inset-x-0 bottom-0 p-2.5 md:p-3 flex flex-col gap-1.5 md:gap-2">
                                <div className="flex items-center gap-1.5">
                                  <div className="w-6 h-6 md:w-7 md:h-7 rounded-full overflow-hidden shrink-0" style={{border: '1px solid rgba(251,191,36,0.5)'}}>
                                    {userPhoto ? (
                                      <img src={userPhoto} alt="devotee" className="w-full h-full object-cover" />
                                    ) : (
                                      <div className="w-full h-full bg-stone-900 flex items-center justify-center"><span className="text-[7px] md:text-[8px] text-amber-500 font-bold">ॐ</span></div>
                                    )}
                                  </div>
                                  <span className="text-[9px] md:text-[10px] font-serif font-black text-amber-400 truncate drop-shadow-lg">
                                    {userName || (isHi ? "हरि भक्त" : "Devotee")}
                                  </span>
                                </div>
                                <p className="text-[7.5px] md:text-[8.5px] font-serif italic text-amber-200 line-clamp-2 leading-tight font-medium">
                                  {isHi ? tpl.quoteHindi : tpl.quote}
                                </p>
                              </div>
                              {/* Like Button Overlay */}
                              <div className="absolute top-2.5 left-2.5 z-30">
                                <PosterLikeButton
                                  posterId={tpl.id}
                                  isLiked={likedPosterIds.includes(tpl.id)}
                                  onToggle={() => toggleLike(tpl.id)}
                                />
                              </div>
                            </div>
                            <div className="px-2.5 py-2.5">
                              <span className="font-serif text-[11px] md:text-xs font-bold text-amber-200 truncate block">{isHi ? tpl.titleHindi : tpl.title}</span>
                              <span className={`text-[8px] md:text-[9px] font-sans text-amber-500 font-bold uppercase block mt-0.5 ${isHi ? '' : 'tracking-wider'}`}>{isHi ? tpl.subtitleHindi : tpl.subtitle}</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Section 3: Morning Specials */}
                  {(selectedCategory === "all" || selectedCategory === "good_morning") && (
                    <div className="space-y-3.5 text-left">
                      <div className="flex items-center gap-2">
                        <span className="text-amber-500 text-xs">☀️</span>
                        <h3 className={`font-serif text-xs font-black uppercase text-amber-400 ${isHi ? '' : 'tracking-widest'}`}>
                          {isHi ? "सुप्रभात दर्शन पोस्टर" : "Morning Special Posters"}
                        </h3>
                      </div>
                      <div className="flex flex-row overflow-x-auto gap-4 pb-3.5 pt-1 w-full scrollbar-none snap-x snap-mandatory">
                        {POSTER_TEMPLATES.filter(p => p.category === "good_morning").map((tpl) => (
                          <div
                            key={tpl.id}
                            onClick={() => setSelectedPoster(tpl)}
                            className="rounded-2xl flex flex-col gap-0 relative cursor-pointer overflow-hidden group transition-transform duration-300 hover:scale-[1.02] active:scale-[0.98] shrink-0 snap-start w-[140px] sm:w-[160px] md:w-[180px]"
                            style={{background: 'rgba(15,7,3,0.7)', border: '1px solid rgba(120,60,10,0.25)', boxShadow: '0 4px 20px rgba(0,0,0,0.5)'}}
                          >
                            <div className="w-full aspect-[9/16] rounded-2xl overflow-hidden relative">
                              <img src={tpl.imageUrl} alt={tpl.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                              <div className="absolute inset-0" style={{background: 'linear-gradient(to top, rgba(5,2,1,0.92) 0%, rgba(5,2,1,0.4) 40%, transparent 70%)'}} />
                              <div className="absolute inset-x-0 bottom-0 p-2.5 md:p-3 flex flex-col gap-1.5 md:gap-2">
                                <div className="flex items-center gap-1.5">
                                  <div className="w-6 h-6 md:w-7 md:h-7 rounded-full overflow-hidden shrink-0" style={{border: '1px solid rgba(251,191,36,0.5)'}}>
                                    {userPhoto ? (
                                      <img src={userPhoto} alt="devotee" className="w-full h-full object-cover" />
                                    ) : (
                                      <div className="w-full h-full bg-stone-900 flex items-center justify-center"><span className="text-[7px] md:text-[8px] text-amber-500 font-bold">ॐ</span></div>
                                    )}
                                  </div>
                                  <span className="text-[9px] md:text-[10px] font-serif font-black text-amber-400 truncate drop-shadow-lg">
                                    {userName || (isHi ? "हरि भक्त" : "Devotee")}
                                  </span>
                                </div>
                                <p className="text-[7.5px] md:text-[8.5px] font-serif italic text-amber-200 line-clamp-2 leading-tight font-medium">
                                  {isHi ? tpl.quoteHindi : tpl.quote}
                                </p>
                              </div>
                              {/* Like Button Overlay */}
                              <div className="absolute top-2.5 left-2.5 z-30">
                                <PosterLikeButton
                                  posterId={tpl.id}
                                  isLiked={likedPosterIds.includes(tpl.id)}
                                  onToggle={() => toggleLike(tpl.id)}
                                />
                              </div>
                            </div>
                            <div className="px-2.5 py-2.5">
                              <span className="font-serif text-[11px] md:text-xs font-bold text-amber-200 truncate block">{isHi ? tpl.titleHindi : tpl.title}</span>
                              <span className={`text-[8px] md:text-[9px] font-sans text-amber-500 font-bold uppercase block mt-0.5 ${isHi ? '' : 'tracking-wider'}`}>{isHi ? tpl.subtitleHindi : tpl.subtitle}</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                </div>


              </div>
            </div>
          )}

        {/* ========================================================= */}
        {/* TAB 2: WALLPAPERS GALLERY WITH CATEGORIES & MOCKUPS       */}
        {/* ========================================================= */}
        {activeTab === "wallpapers" && (
          <div className="w-full flex flex-col items-center animate-fade-in select-none">

            {/* ── Static / Live toggle ── */}
            <div className="w-full max-w-xs mx-auto mb-7 px-4">
              <div className="p-1 rounded-full flex items-center shadow-lg" style={{background:"rgba(18,7,4,0.6)",border:"1px solid rgba(120,60,10,0.25)"}}>
                <button
                  onClick={() => setWallpaperType("static")}
                  className={`flex-1 py-2.5 rounded-full font-sans text-xs font-black uppercase transition-all duration-300 flex items-center justify-center gap-2 focus:outline-none ${isHi ? '' : 'tracking-wider'} ${
                    wallpaperType === "static"
                      ? "text-[#fbbf24] shadow-md"
                      : "text-amber-200/75 hover:text-amber-200"
                  }`}
                  style={wallpaperType==="static"?{background:"rgba(251,191,36,0.12)",border:"1px solid rgba(251,191,36,0.35)"}:{}}
                >
                  <Smartphone className="w-3.5 h-3.5" />
                  <span>{isHi ? "स्थिर (STATIC)" : "Static"}</span>
                </button>
                <button
                  onClick={() => setWallpaperType("live")}
                  className={`flex-1 py-2.5 rounded-full font-sans text-xs font-black uppercase transition-all duration-300 flex items-center justify-center gap-2 focus:outline-none ${isHi ? '' : 'tracking-wider'} ${
                    wallpaperType === "live"
                      ? "text-[#fbbf24] shadow-md"
                      : "text-amber-200/75 hover:text-amber-200"
                  }`}
                  style={wallpaperType==="live"?{background:"rgba(251,191,36,0.12)",border:"1px solid rgba(251,191,36,0.35)"}:{}}
                >
                  <Flame className="w-3.5 h-3.5" />
                  <span>{isHi ? "सजीव (LIVE)" : "Live"}</span>
                </button>
              </div>
            </div>

            {/* Search bar */}
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
                    <button onClick={() => setSearchQuery("")} className="absolute right-4 top-1/2 -translate-y-1/2 text-amber-400 hover:text-amber-200 focus:outline-none">
                      <X className="w-4 h-4" />
                    </button>
                  ) : (
                    <Search className="absolute right-4.5 top-1/2 -translate-y-1/2 text-amber-500/30 w-4 h-4" />
                  )}
                </div>
              </div>
            )}

            {/* ══════════════════════════════════════════ */}
            {/* A. STATIC WALLPAPERS                      */}
            {/* ══════════════════════════════════════════ */}
            {wallpaperType === "static" && (
              <div className="w-full flex flex-col items-center space-y-8 animate-fade-in">

                {/* Deity chips */}
                <div className="w-full flex flex-col">
                  <div className="flex items-center justify-between w-full mb-4 px-0.5">
                    <h3 className="font-serif text-sm font-black text-amber-100 flex items-center gap-2">
                      <span>🕉️</span>
                      {isHi ? "देवता चुनें" : "Choose Deity"}
                    </h3>
                    <button
                      onClick={() => setSelectedDeityFilter(null)}
                      className="font-sans text-[11px] font-bold text-amber-500 hover:text-amber-400 flex items-center gap-0.5 active:scale-95 transition-all"
                    >
                      {isHi ? "सभी देखें" : "View All"} <span className="ml-0.5 text-base leading-none" style={{lineHeight:1}}>›</span>
                    </button>
                  </div>
                  <div className="flex items-start gap-5 overflow-x-auto pb-3 pt-1.5 scrollbar-none w-full justify-start sm:justify-center px-1">
                    {[
                      { id: null,          name:"सभी",    nameEn:"All",    isIcon:true,  symbol:"🕉️", image:"" },
                      { id:"Shiva",        name:"शिव",    nameEn:"Shiva",  isIcon:false, symbol:"",   image:shivWallpaperImg },
                      { id:"Rama",         name:"राम",    nameEn:"Ram",    isIcon:false, symbol:"",   image:deityRamImg },
                      { id:"Krishna",      name:"कृष्ण",  nameEn:"Krishna",isIcon:false, symbol:"",   image:krishnaImg },
                      { id:"Hanuman",      name:"हनुमान", nameEn:"Hanuman",isIcon:false, symbol:"",   image:hanumanImg },
                      { id:"Radha",        name:"राधा",   nameEn:"Radha",  isIcon:false, symbol:"",   image:radhaKrishnaImg },
                      { id:"Khatu Shyam",  name:"श्याम",  nameEn:"Shyam",  isIcon:false, symbol:"",   image:shyamMandirImg },
                    ].map((deity) => {
                      const isActive = selectedDeityFilter === deity.id;
                      return (
                        <button
                          key={deity.id ?? "all"}
                          onClick={() => setSelectedDeityFilter(deity.id)}
                          className="flex flex-col items-center gap-2 outline-none focus:outline-none transition-all active:scale-95 shrink-0"
                        >
                          {/* Ring wrapper */}
                          <div style={{
                            width:54, height:54, borderRadius:"50%",
                            padding: isActive ? 2.5 : 0,
                            background: isActive ? "linear-gradient(135deg,#f59e0b,#fbbf24,#d97706)" : "transparent",
                            transition:"all 0.25s ease",
                            position:"relative",
                          }}>
                            <div style={{
                              width:"100%", height:"100%", borderRadius:"50%",
                              overflow:"hidden", background:"#1b0a05",
                              border: isActive ? "2px solid #0d0502" : "2px solid rgba(120,60,10,0.35)",
                              display:"flex", alignItems:"center", justifyContent:"center",
                              boxShadow: isActive ? "0 0 18px rgba(251,191,36,0.5)" : "0 2px 8px rgba(0,0,0,0.5)",
                              transition:"all 0.25s ease",
                            }}>
                              {deity.isIcon ? (
                                <span style={{fontSize:22, filter: isActive ? "drop-shadow(0 0 5px #fbbf24)" : "none"}}>{deity.symbol}</span>
                              ) : (
                                <img src={deity.image} alt={deity.nameEn}
                                  style={{width:"100%",height:"100%",objectFit:"cover",
                                    transform: isActive ? "scale(1.08)" : "scale(1)",
                                    transition:"transform 0.3s ease"}}
                                />
                              )}
                            </div>
                            {/* Checkmark badge */}
                            {isActive && (
                              <span style={{
                                position:"absolute", bottom:-2, right:-2,
                                width:18, height:18, borderRadius:"50%",
                                background:"linear-gradient(135deg,#f59e0b,#fbbf24)",
                                border:"2px solid #0d0502",
                                display:"flex", alignItems:"center", justifyContent:"center",
                                boxShadow:"0 1px 4px rgba(0,0,0,0.5)", zIndex:10,
                              }}>
                                <svg viewBox="0 0 24 24" fill="none" stroke="#000" strokeWidth="4.5" strokeLinecap="round" strokeLinejoin="round" style={{width:10,height:10}}>
                                  <polyline points="20 6 9 17 4 12"/>
                                </svg>
                              </span>
                            )}
                          </div>
                          <span style={{
                            fontSize:10, fontWeight: isActive ? 800 : 600,
                            color: isActive ? "#fbbf24" : "rgba(181,140,100,0.85)",
                            transition:"color 0.2s", letterSpacing: isHi ? "normal" : "0.03em", lineHeight:1,
                          }}>
                            {isHi ? deity.name : deity.nameEn}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>


                {/* Wallpaper Sections */}
                <div className="w-full flex flex-col space-y-8">
                  {filteredWallpapers.length === 0 ? (
                    <div className="w-full py-16 border border-dashed border-amber-900/20 rounded-2xl flex flex-col items-center justify-center text-stone-500 font-sans text-xs gap-2">
                      <span>📭</span>
                      <span>{isHi ? "कोई वॉलपेपर नहीं मिला।" : "No wallpapers found."}</span>
                    </div>
                  ) : (
                    WALLPAPER_SECTIONS.map((sec) => {
                      const sectionItems = filteredWallpapers.filter(wp => wp.category === sec.key);
                      if (sectionItems.length === 0) return null;

                      return (
                        <div key={sec.key} className="w-full space-y-3.5 text-left mb-6">
                          <div className="flex items-center justify-between w-full mb-2 px-0.5">
                            <div className="flex items-center gap-2">
                              <span className="text-amber-500 text-xs">{sec.icon}</span>
                              <h3 className={`font-serif text-xs font-black uppercase text-amber-400 ${isHi ? '' : 'tracking-widest'}`}>
                                {isHi ? sec.nameHindi : sec.name}
                              </h3>
                            </div>
                          </div>

                          <div className="flex flex-row overflow-x-auto gap-4 pb-3.5 pt-1 w-full scrollbar-none snap-x snap-mandatory justify-start px-1">
                            {sectionItems.map((wp) => (
                              <div
                                key={wp.id}
                                className="rounded-2xl flex flex-col gap-0 relative cursor-pointer overflow-hidden group transition-transform duration-300 hover:scale-[1.02] active:scale-[0.98] shrink-0 snap-start w-[140px] sm:w-[160px] md:w-[180px]"
                                style={{background: 'rgba(15,7,3,0.7)', border: '1px solid rgba(120,60,10,0.25)', boxShadow: '0 4px 20px rgba(0,0,0,0.5)'}}
                                onClick={() => handleWallpaperAction(wp)}
                              >
                                <div className="w-full aspect-[9/16] rounded-2xl overflow-hidden relative">
                                  <img src={wp.imageUrl} alt={wp.name}
                                    className="w-full h-full object-cover group-hover:scale-[1.07] transition-all duration-500 pointer-events-none brightness-[0.88] contrast-[1.03] group-hover:brightness-100 group-hover:contrast-100"/>
                                  {/* Cinematic gradient */}
                                  <div className="absolute inset-0" style={{background:"linear-gradient(to top, rgba(10,4,2,0.96) 0%, rgba(10,4,2,0.5) 35%, rgba(10,4,2,0.05) 70%, transparent 100%)"}}/>

                                  {/* Like Button Overlay */}
                                  <div className="absolute top-2.5 left-2.5 z-30">
                                    <PosterLikeButton
                                      posterId={wp.id}
                                      isLiked={likedWallpaperIds.includes(wp.id)}
                                      onToggle={() => toggleLikeWallpaper(wp.id)}
                                    />
                                  </div>

                                  {/* Tier badge */}
                                  <div className="absolute top-2.5 right-2.5 px-2 py-0.5 rounded-full z-10"
                                    style={{fontSize:8,fontWeight:900,fontFamily:"sans-serif",textTransform:"uppercase",letterSpacing:"0.08em",
                                      background:wp.tier==="premium"?"linear-gradient(135deg,rgba(251,191,36,0.3),rgba(217,119,6,0.25))":"rgba(0,0,0,0.55)",
                                      border:wp.tier==="premium"?"1px solid rgba(251,191,36,0.5)":"1px solid rgba(251,191,36,0.25)",
                                      color:"#fbbf24",
                                      backdropFilter:"blur(2px)"}}>
                                    {wp.tier === "premium" ? "👑 Pro" : "Free"}
                                  </div>

                                  {/* Download button */}
                                  <button
                                    onClick={(e)=>{e.stopPropagation();handleDownloadWallpaper(wp);}}
                                    className="absolute bottom-2.5 right-2.5 flex items-center justify-center transition-all duration-250 active:scale-90 focus:outline-none z-15 shadow-md"
                                    style={{width:32,height:32,borderRadius:"50%",background:"rgba(0,0,0,0.65)",border:"1.5px solid rgba(251,191,36,0.45)",boxShadow:"0 2px 10px rgba(0,0,0,0.4)"}}
                                    onMouseEnter={e=>{
                                      (e.currentTarget as HTMLButtonElement).style.background="linear-gradient(135deg,#f59e0b,#d97706)";
                                      (e.currentTarget as HTMLButtonElement).style.borderColor="#fbbf24";
                                      (e.currentTarget as HTMLButtonElement).style.boxShadow="0 0 8px rgba(251,191,36,0.5)";
                                    }}
                                    onMouseLeave={e=>{
                                      (e.currentTarget as HTMLButtonElement).style.background="rgba(0,0,0,0.65)";
                                      (e.currentTarget as HTMLButtonElement).style.borderColor="rgba(251,191,36,0.45)";
                                      (e.currentTarget as HTMLButtonElement).style.boxShadow="none";
                                    }}
                                  >
                                    <svg viewBox="0 0 24 24" fill="none" stroke="#fbbf24" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{width:12,height:12}}>
                                      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
                                      <polyline points="7 10 12 15 17 10"/>
                                      <line x1="12" y1="15" x2="12" y2="3"/>
                                    </svg>
                                  </button>
                                </div>

                                {/* Details footer outside card image wrapper */}
                                <div className="px-2.5 py-2.5 text-left">
                                  <span className="inline-block bg-amber-950/80 border border-amber-500/30 px-1.5 py-0.5 rounded text-[7.5px] font-sans font-black text-amber-300 tracking-wide w-fit leading-none mb-0.5 shadow-sm backdrop-blur-[2px]">
                                    {isHi
                                      ? (wp.deity==="Shiva"?"शिव":wp.deity==="Rama"?"राम":wp.deity==="Krishna"?"कृष्ण":wp.deity==="Hanuman"?"हनुमान":wp.deity==="Radha"?"राधा":wp.deity)
                                      : wp.deity}
                                  </span>
                                  <h4 style={{fontFamily:"serif",fontSize:11,fontWeight:800,color:"rgba(255,251,235,0.95)",lineHeight:1.2}} className="line-clamp-1 block mt-0.5">
                                    {isHi ? wp.nameHindi : wp.name}
                                  </h4>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>

                {/* Premium upsell banner */}
                <div className="w-full rounded-2xl p-5 flex items-center justify-between shadow-xl"
                  style={{background:"linear-gradient(135deg,rgba(251,191,36,0.08),rgba(217,119,6,0.12),rgba(251,191,36,0.06))",border:"1px solid rgba(251,191,36,0.2)"}}>
                  <div className="flex items-center gap-3.5">
                    <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center text-black shadow-md shrink-0">
                      <Sparkles className="w-5 h-5 text-black fill-current animate-pulse"/>
                    </div>
                    <div className="text-left">
                      <h4 className="font-serif text-sm font-bold text-amber-200">{isHi?"महाभक्त प्रीमियम":"Mahabhakt Premium"}</h4>
                      <p className="text-[10px] font-sans text-amber-200/85 mt-0.5 font-semibold">108+ Exclusive Wallpapers</p>
                      <p className="text-[9px] font-sans text-amber-200/70 mt-1">{isHi?"एचडी • विज्ञापन-मुक्त • प्रीमियम":"HD Quality • Ad-Free • Premium"}</p>
                    </div>
                  </div>
                  <button
                    onClick={()=>navigate("/pricing")}
                    className={`px-4 py-2.5 font-sans text-[10px] font-black uppercase rounded-xl transition-all active:scale-95 flex items-center gap-1 shadow-md shrink-0 cursor-pointer ${isHi ? '' : 'tracking-widest'}`}
                    style={{background:"linear-gradient(135deg,#f59e0b,#d97706)",color:"#1a0a02"}}
                  >
                    <span>{isHi?"देखें":"Explore"}</span><span>→</span>
                  </button>
                </div>
              </div>
            )}

            {/* ══════════════════════════════════════════ */}
            {/* B. LIVE WALLPAPERS                        */}
            {/* ══════════════════════════════════════════ */}
            {wallpaperType === "live" && (
              <div className="w-full flex flex-col items-center space-y-8 animate-fade-in">

                {/* Live Deity chips */}
                <div className="w-full flex flex-col">
                  <div className="flex items-center justify-between w-full mb-4 px-0.5">
                    <h3 className="font-serif text-sm font-black text-amber-100 flex items-center gap-2">
                      <span>🕉️</span>
                      {isHi ? "सजीव देवता दर्शन" : "Live Deity Feed"}
                    </h3>
                    <button onClick={()=>setSelectedDeityFilter(null)} className="font-sans text-[11px] font-bold text-amber-500 hover:text-amber-400 flex items-center gap-0.5 active:scale-95 transition-all">
                      {isHi?"सभी देखें":"View All"} <span className="ml-0.5 text-base leading-none" style={{lineHeight:1}}>›</span>
                    </button>
                  </div>
                  <div className="flex items-start gap-5 overflow-x-auto pb-3 pt-1.5 scrollbar-none w-full justify-start sm:justify-center px-1">
                    {[
                      { id:null,     name:"सभी",    nameEn:"All",    isIcon:true,  symbol:"🕉️", image:"" },
                      { id:"Shiva",  name:"शिव",    nameEn:"Shiva",  isIcon:false, symbol:"",   image:shivWallpaperImg },
                      { id:"Rama",   name:"राम",    nameEn:"Ram",    isIcon:false, symbol:"",   image:deityRamImg },
                      { id:"Krishna",name:"कृष्ण",  nameEn:"Krishna",isIcon:false, symbol:"",   image:krishnaImg },
                      { id:"Hanuman",name:"हनुमान", nameEn:"Hanuman",isIcon:false, symbol:"",   image:hanumanImg },
                    ].map((deity) => {
                      const isActive = selectedDeityFilter === deity.id;
                      return (
                        <button key={deity.id??"all"} onClick={()=>setSelectedDeityFilter(deity.id)}
                          className="flex flex-col items-center gap-2 outline-none focus:outline-none transition-all active:scale-95 shrink-0">
                          <div style={{width:54,height:54,borderRadius:"50%",padding:isActive?2.5:0,background:isActive?"linear-gradient(135deg,#f59e0b,#fbbf24,#d97706)":"transparent",transition:"all 0.25s ease",position:"relative"}}>
                            <div style={{width:"100%",height:"100%",borderRadius:"50%",overflow:"hidden",background:"#1b0a05",border:isActive?"2px solid #0d0502":"2px solid rgba(120,60,10,0.35)",display:"flex",alignItems:"center",justifyContent:"center",boxShadow:isActive?"0 0 18px rgba(251,191,36,0.5)":"0 2px 8px rgba(0,0,0,0.5)",transition:"all 0.25s ease"}}>
                              {deity.isIcon ? (
                                <span style={{fontSize:22,filter:isActive?"drop-shadow(0 0 5px #fbbf24)":"none"}}>{deity.symbol}</span>
                              ) : (
                                <img src={deity.image} alt={deity.nameEn} style={{width:"100%",height:"100%",objectFit:"cover",transform:isActive?"scale(1.08)":"scale(1)",transition:"transform 0.3s ease"}}/>
                              )}
                            </div>
                            {isActive && (
                              <span style={{position:"absolute",bottom:-2,right:-2,width:18,height:18,borderRadius:"50%",background:"linear-gradient(135deg,#f59e0b,#fbbf24)",border:"2px solid #0d0502",display:"flex",alignItems:"center",justifyContent:"center",zIndex:10}}>
                                <svg viewBox="0 0 24 24" fill="none" stroke="#000" strokeWidth="4.5" strokeLinecap="round" strokeLinejoin="round" style={{width:10,height:10}}><polyline points="20 6 9 17 4 12"/></svg>
                              </span>
                            )}
                          </div>
                          <span style={{fontSize:10,fontWeight:isActive?800:600,color:isActive?"#fbbf24":"rgba(181,140,100,0.85)",transition:"color 0.2s",letterSpacing:isHi?"normal":"0.03em",lineHeight:1}}>
                            {isHi?deity.name:deity.nameEn}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Today's live recommendation */}
                {!selectedDeityFilter && !searchQuery && (
                  <div className="w-full flex flex-col">
                    <div className="flex items-center justify-between w-full mb-4 px-0.5">
                      <h3 className="font-serif text-sm font-black text-amber-100 flex items-center gap-2">
                        <span>🌌</span>
                        {isHi?"आज की दिव्य सजीव लीला":"Today's Living Darshan"}
                      </h3>
                      <span className="text-[9px] font-sans text-amber-500 bg-amber-500/10 px-2 py-0.5 rounded-full font-black animate-pulse">{isHi?"लाइव":"Live"}</span>
                    </div>
                    <div className="w-full rounded-2xl overflow-hidden relative cursor-pointer group"
                      style={{border:"1px solid rgba(251,191,36,0.15)",boxShadow:"0 8px 40px rgba(0,0,0,0.7)"}}
                      onClick={()=>handleLiveWallpaperAction(LIVE_WALLPAPERS_LIST[0])}>
                      <div className="w-full aspect-[16/9] relative overflow-hidden flex items-center justify-center bg-black/60">
                        {/* Blurred background backup */}
                        <img src={radhaKrishnaImg} alt=""
                          className="absolute inset-0 w-full h-full object-cover filter blur-md opacity-35 scale-110 pointer-events-none" />
                        
                        {/* Central portrait wallpaper image (Fully seen!) */}
                        <div className="h-full aspect-[9/16] relative z-10 overflow-hidden shadow-2xl">
                          <img src={radhaKrishnaImg} alt="Vrindavan Leela"
                            className="w-full h-full object-cover scale-[1.02] group-hover:scale-[1.07] transition-transform duration-700 pointer-events-none"/>
                        </div>
                        
                        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(251,191,36,0.1)_0%,transparent_75%)] animate-pulse z-10" style={{animationDuration:"4s"}}/>
                        
                        <div className="absolute inset-0 pointer-events-none z-12 overflow-hidden">
                          <div className="absolute top-2 left-[20%] text-sm opacity-40 animate-bounce">🌸</div>
                          <div className="absolute top-3 left-[55%] text-sm opacity-30 animate-bounce" style={{animationDelay:"1.2s"}}>🌼</div>
                          <div className="absolute top-1 left-[80%] text-sm opacity-45 animate-bounce" style={{animationDelay:"0.6s"}}>🌸</div>
                        </div>
                        <div className="absolute inset-0 z-15" style={{background:"linear-gradient(to top,rgba(5,2,1,0.96) 0%,rgba(5,2,1,0.45) 40%,transparent 100%)"}}/>
                        <div className="absolute inset-x-0 bottom-0 p-4 flex items-end justify-between z-20">
                          <div className="flex flex-col gap-1.5 text-left">
                            <span className="inline-block px-2 py-0.5 bg-amber-500/20 border border-amber-500/40 rounded text-[7px] font-sans font-black text-amber-300 tracking-wider w-fit leading-none mb-0.5 uppercase shadow-sm">
                              Vrindavan Live
                            </span>
                            <h4 className="font-serif text-base md:text-lg font-black text-transparent bg-clip-text bg-gradient-to-r from-amber-200 to-amber-100 leading-tight">
                              {isHi?"राधा-कृष्ण दिव्य रास":"Radha-Krishna Divine Raas"}
                            </h4>
                            <p style={{fontSize:9}} className="text-amber-200/75 italic">{isHi?"पुष्प वर्षा एवं दिव्य आभा के साथ...":"With divine petals & aura glow..."}</p>
                          </div>
                          <button onClick={(e)=>{e.stopPropagation();handleLiveWallpaperAction(LIVE_WALLPAPERS_LIST[0]);}}
                            className={`shrink-0 px-4 py-2 rounded-full font-sans text-[10px] font-black uppercase flex items-center gap-1.5 transition-all active:scale-95 ${isHi ? '' : 'tracking-wide'}`}
                            style={{background:"rgba(255,255,255,0.92)",color:"#0d0502",boxShadow:"0 4px 14px rgba(0,0,0,0.4)"}}>
                            <Sparkles className="w-3.5 h-3.5 fill-current animate-spin" style={{animationDuration:"3s"}}/>
                            <span>{isHi?"प्रीव्यू":"Preview"}</span>
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Live gallery sections */}
                <div className="w-full flex flex-col space-y-8">
                  {filteredLiveWallpapers.length === 0 ? (
                    <div className="w-full py-16 border border-dashed border-amber-900/20 rounded-2xl flex flex-col items-center justify-center text-stone-500 font-sans text-xs gap-2">
                      <span>📭</span><span>{isHi?"कोई लाइव वॉलपेपर नहीं मिला।":"No live wallpapers found."}</span>
                    </div>
                  ) : (
                    WALLPAPER_SECTIONS.map((sec) => {
                      const sectionItems = filteredLiveWallpapers.filter(wp => wp.category === sec.key);
                      if (sectionItems.length === 0) return null;

                      return (
                        <div key={sec.key} className="w-full space-y-3.5 text-left mb-6">
                          <div className="flex items-center justify-between w-full mb-2 px-0.5">
                            <div className="flex items-center gap-2">
                              <span className="text-amber-500 text-xs">🎬 {sec.icon}</span>
                              <h3 className={`font-serif text-xs font-black uppercase text-amber-400 ${isHi ? '' : 'tracking-widest'}`}>
                                {isHi ? `${sec.nameHindi} (सजीव)` : `${sec.name} (Live)`}
                              </h3>
                            </div>
                          </div>

                          <div className="flex flex-row overflow-x-auto gap-4 pb-3.5 pt-1 w-full scrollbar-none snap-x snap-mandatory justify-start px-1">
                            {sectionItems.map((wp) => (
                              <div key={wp.id}
                                className="rounded-2xl flex flex-col gap-0 relative cursor-pointer overflow-hidden group transition-transform duration-300 hover:scale-[1.02] active:scale-[0.98] shrink-0 snap-start w-[140px] sm:w-[160px] md:w-[180px]"
                                style={{background: 'rgba(15,7,3,0.7)', border: '1px solid rgba(120,60,10,0.25)', boxShadow: '0 4px 20px rgba(0,0,0,0.5)'}}
                                onClick={()=>handleLiveWallpaperAction(wp)}>
                                <div className="w-full aspect-[9/16] rounded-2xl overflow-hidden relative">
                                  {wp.effect==="aura" && <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(251,191,36,0.18)_0%,transparent_75%)] pointer-events-none z-10 animate-pulse" style={{animationDuration:"2.5s"}}/>}
                                  {wp.effect==="shimmer" && <div className="absolute inset-0 bg-[linear-gradient(45deg,transparent_20%,rgba(255,255,255,0.08)_50%,transparent_80%)] pointer-events-none z-10 animate-shimmer"/>}
                                  {wp.effect==="flame" && <div className="absolute inset-0 bg-gradient-to-t from-orange-500/10 via-transparent to-transparent pointer-events-none z-10 animate-pulse" style={{animationDuration:"1.5s"}}/>}
                                  <img src={wp.thumbnailUrl} alt={wp.name}
                                    className="w-full h-full object-cover group-hover:scale-[1.07] transition-all duration-500 pointer-events-none brightness-[0.88] contrast-[1.03] group-hover:brightness-100 group-hover:contrast-100"/>
                                  <div className="absolute inset-0" style={{background:"linear-gradient(to top, rgba(10,4,2,0.96) 0%, rgba(10,4,2,0.5) 35%, rgba(10,4,2,0.05) 70%, transparent 100%)"}}/>
                                  
                                  {/* Like Button Overlay */}
                                  <div className="absolute top-2.5 left-2.5 z-30">
                                    <PosterLikeButton
                                      posterId={wp.id}
                                      isLiked={likedWallpaperIds.includes(wp.id)}
                                      onToggle={() => toggleLikeWallpaper(wp.id)}
                                    />
                                  </div>

                                  {/* Effect tag */}
                                  <div className="absolute top-[42px] left-2.5 z-10">
                                    <span style={{fontSize:7,fontWeight:900,textTransform:"uppercase",letterSpacing:"0.1em",padding:"2px 6px",borderRadius:4,background:"rgba(0,0,0,0.6)",border:"1px solid rgba(251,191,36,0.25)",color:"#fbbf24"}}>{wp.effect}</span>
                                  </div>
                                  
                                  {/* Tier */}
                                  <div className="absolute top-2.5 right-2.5 px-2 py-0.5 rounded-full z-10"
                                    style={{fontSize:8,fontWeight:900,textTransform:"uppercase",letterSpacing:"0.08em",
                                      background:wp.tier==="premium"?"linear-gradient(135deg,rgba(251,191,36,0.3),rgba(217,119,6,0.25))":"rgba(0,0,0,0.55)",
                                      border:wp.tier==="premium"?"1px solid rgba(251,191,36,0.5)":"1px solid rgba(251,191,36,0.25)",
                                      color:"#fbbf24",
                                      backdropFilter:"blur(2px)"}}>
                                    {wp.tier==="premium"?"👑 Pro":"Free"}
                                  </div>

                                  {/* Action button */}
                                  <button onClick={(e)=>{e.stopPropagation();handleLiveWallpaperAction(wp);}}
                                    className="absolute bottom-2.5 right-2.5 flex items-center justify-center transition-all duration-250 active:scale-90 focus:outline-none z-20 shadow-md"
                                    style={{width:32,height:32,borderRadius:"50%",background:"rgba(0,0,0,0.65)",border:"1.5px solid rgba(251,191,36,0.45)",boxShadow:"0 2px 10px rgba(0,0,0,0.4)"}}
                                    onMouseEnter={e=>{(e.currentTarget as HTMLButtonElement).style.background="linear-gradient(135deg,#f59e0b,#d97706)";(e.currentTarget as HTMLButtonElement).style.borderColor="#fbbf24";(e.currentTarget as HTMLButtonElement).style.boxShadow="0 0 8px rgba(251,191,36,0.5)";}}
                                    onMouseLeave={e=>{(e.currentTarget as HTMLButtonElement).style.background="rgba(0,0,0,0.65)";(e.currentTarget as HTMLButtonElement).style.borderColor="rgba(251,191,36,0.45)";(e.currentTarget as HTMLButtonElement).style.boxShadow="none";}}>
                                    <Sparkles className="w-3.5 h-3.5 text-amber-400 fill-current"/>
                                  </button>
                                </div>

                                {/* Details footer outside card image wrapper */}
                                <div className="px-2.5 py-2.5 text-left">
                                  <span className="inline-block bg-amber-950/80 border border-amber-500/30 px-1.5 py-0.5 rounded text-[7.5px] font-sans font-black text-amber-300 tracking-wide w-fit leading-none mb-0.5 shadow-sm backdrop-blur-[2px]">
                                    {isHi?(wp.deity==="Shiva"?"शिव":wp.deity==="Rama"?"राम":wp.deity==="Krishna"?"कृष्ण":wp.deity==="Hanuman"?"हनुमान":wp.deity):wp.deity}
                                  </span>
                                  <h4 style={{fontFamily:"serif",fontSize:11,fontWeight:800,color:"rgba(255,251,235,0.95)",lineHeight:1.2}} className="line-clamp-1 block mt-0.5">
                                    {isHi?wp.nameHindi:wp.name}
                                  </h4>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>

                {/* How-to tip */}
                <div className="w-full rounded-2xl p-4 flex flex-col items-center gap-2"
                  style={{background:"rgba(27,13,7,0.4)",border:"1px solid rgba(120,60,10,0.2)"}}>
                  <span className="text-xs text-amber-400">💡 {isHi?"सजीव वॉलपेपर कैसे लगाएं?":"How to Apply Live Wallpapers?"}</span>
                  <p className="text-[9px] font-sans text-amber-200/85 text-center tracking-wide leading-relaxed max-w-md">
                    {isHi
                      ? "सजीव वॉलपेपर डाउनलोड करने पर एचडी मोशन जिफ/वेबपी प्राप्त होगी। किसी भी लाइव वॉलपेपर लॉन्चर की सहायता से इसे अपने लॉकस्क्रीन पर सेट करें।"
                      : "Downloading a live wallpaper grants you an HD motion webp/gif. Apply it to your lock screen using any live wallpaper settings on Android or iOS."}
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
              <p className="text-xs text-amber-200/85 font-sans mt-1 font-medium">
                {isHi ? "आपके द्वारा पूर्व में सहेजे गए दैनिक पोस्टर" : "Revisit your personalized posters saved on this device"}
              </p>
            </div>

            {/* Sub-tab selection within Saved tab */}
            <div className="flex bg-stone-950/65 border border-amber-950/20 rounded-full p-0.5 max-w-xs w-full select-none font-sans text-xs mb-2">
              <button
                onClick={() => setSavedSubTab("posters")}
                className={`flex-1 flex items-center justify-center gap-1.5 py-2 px-4 rounded-full transition-all duration-200 cursor-pointer focus:outline-none ${
                  savedSubTab === "posters"
                    ? "bg-[#fbbf24] text-stone-950 font-bold shadow-md"
                    : "bg-transparent text-amber-200/80 hover:text-amber-200"
                }`}
              >
                <span>{isHi ? "सहेजे गए" : "Saved"}</span>
                <span className="text-[10px] opacity-75">({savedBlessings.length})</span>
              </button>
              <button
                onClick={() => setSavedSubTab("liked")}
                className={`flex-1 flex items-center justify-center gap-1.5 py-2 px-4 rounded-full transition-all duration-200 cursor-pointer focus:outline-none ${
                  savedSubTab === "liked"
                    ? "bg-[#fbbf24] text-stone-950 font-bold shadow-md"
                    : "bg-transparent text-amber-200/80 hover:text-amber-200"
                }`}
              >
                <span>{isHi ? "पसंदीदा" : "Liked"}</span>
                <span className="text-[10px] opacity-75">({likedPosters.length + likedWallpaperIds.length})</span>
              </button>
            </div>

            {/* A. SAVED POSTERS DIARY */}
            {savedSubTab === "posters" && (
              savedBlessings.length === 0 ? (
                <div className="w-full border border-dashed border-amber-900/30 rounded-3xl p-10 flex flex-col items-center justify-center text-center gap-3">
                  <BookOpen className="w-8 h-8 text-amber-500/30" />
                  <p className="text-xs text-amber-200/85 font-sans">
                    {isHi ? "अभी तक कोई पोस्टर संग्रहित नहीं है।" : "Your saved posters diary is empty."}
                  </p>
                  <button
                    onClick={() => setActiveTab("maker")}
                    className={`px-4 py-2 border border-amber-500/20 hover:bg-amber-500/10 text-amber-300 font-sans font-black text-[10px] uppercase rounded-lg transition-all active:scale-95 cursor-pointer ${isHi ? '' : 'tracking-widest'}`}
                  >
                    {isHi ? "पोस्टर बनाएं" : "Create Poster Now"}
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3.5 w-full select-none">
                  {savedBlessings.map((url, idx) => (
                    <div
                      key={idx}
                      className="bg-[#1b0d07]/40 border border-amber-950/20 rounded-2xl p-1.5 relative group overflow-hidden"
                      style={{ boxShadow: "0 6px 20px rgba(0,0,0,0.4)" }}
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
                            } catch (_) { /* ignore share error */ }
                          }}
                          className="w-10 h-10 rounded-full bg-amber-500 text-black flex items-center justify-center hover:scale-105 active:scale-95 transition-transform focus:outline-none cursor-pointer"
                        >
                          <Share2 className="w-5 h-5 text-black" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )
            )}

            {/* B. LIKED DESIGNS GALLERY SECTION */}
            {savedSubTab === "liked" && (
              likedPosters.length === 0 && likedWallpapers.staticLiked.length === 0 && likedWallpapers.liveLiked.length === 0 ? (
                <div className="w-full border border-dashed border-amber-900/30 rounded-3xl p-10 flex flex-col items-center justify-center text-center gap-3">
                  <Heart className="w-8 h-8 text-amber-500/30 animate-pulse" />
                  <p className="text-xs text-amber-200/85 font-sans leading-relaxed whitespace-pre-line">
                    {isHi 
                      ? "पसंदीदा सूची अभी खाली है।\nपोस्टर या वॉलपेपर को ❤️ आइकन दबाकर पसंदीदा बनाएं।" 
                      : "Your liked list is empty. Mark posters or wallpapers with ❤️ to see them here."}
                  </p>
                  <button
                    onClick={() => setActiveTab("maker")}
                    className={`px-4 py-2 border border-amber-500/20 hover:bg-amber-500/10 text-amber-300 font-sans font-black text-[10px] uppercase rounded-lg transition-all active:scale-95 cursor-pointer ${isHi ? '' : 'tracking-widest'}`}
                  >
                    {isHi ? "पोस्टर गैलरी देखें" : "Explore Posters"}
                  </button>
                </div>
              ) : (
                <div className="w-full space-y-8 text-left">
                  {/* 1. Liked Posters */}
                  {likedPosters.length > 0 && (
                    <div className="space-y-3">
                      <h3 className="font-serif text-xs font-black uppercase text-amber-400 flex items-center gap-2 border-b border-amber-500/20 pb-2 tracking-wider">
                        <span>✨</span>
                        {isHi ? "पसंदीदा पोस्टर" : "Liked Posters"}
                      </h3>
                      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3.5 w-full">
                        {likedPosters.map((tpl) => (
                          <div
                            key={tpl.id}
                            onClick={() => setSelectedPoster(tpl)}
                            className="bg-[#1b0d07]/40 border border-amber-500/10 hover:border-amber-500/35 rounded-2xl p-2 cursor-pointer group active:scale-[0.97] transition-all duration-300"
                            style={{ boxShadow: "0 6px 20px rgba(0,0,0,0.5)" }}
                          >
                            <div className="w-full aspect-[9/16] relative rounded-xl overflow-hidden mb-2">
                              <img
                                src={tpl.imageUrl}
                                alt={isHi ? tpl.titleHindi : tpl.title}
                                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 pointer-events-none"
                              />
                              {/* Hover Overlay */}
                              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                <span style={{ fontSize: 10, fontWeight: 900, textTransform: "uppercase", letterSpacing: "0.08em" }} className="px-3 py-1.5 bg-[#fbbf24] text-stone-950 rounded-lg font-sans">
                                  {isHi ? "बनाएं" : "Customize"}
                                </span>
                              </div>
                              {/* Like Button Overlay */}
                              <div className="absolute top-2.5 left-2.5 z-30">
                                <PosterLikeButton
                                  posterId={tpl.id}
                                  isLiked={likedPosterIds.includes(tpl.id)}
                                  onToggle={() => toggleLike(tpl.id)}
                                />
                              </div>
                            </div>
                            <div className="text-left px-1">
                              <h4 className="font-serif text-[11px] font-bold text-amber-100 leading-tight truncate">
                                {isHi ? tpl.titleHindi : tpl.title}
                              </h4>
                              <span style={{ fontSize: 8, color: "rgba(251,191,36,0.85)", fontWeight: 700, textTransform: "uppercase", letterSpacing: isHi ? "normal" : "0.04em", display: "block", marginTop: 2 }}>
                                {tpl.category}
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* 2. Liked Static Wallpapers */}
                  {likedWallpapers.staticLiked.length > 0 && (
                    <div className="space-y-3">
                      <h3 className="font-serif text-xs font-black uppercase text-amber-400 flex items-center gap-2 border-b border-amber-500/20 pb-2 tracking-wider">
                        <span>📱</span>
                        {isHi ? "पसंदीदा वॉलपेपर" : "Liked Wallpapers"}
                      </h3>
                      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3.5 w-full">
                        {likedWallpapers.staticLiked.map((wp) => (
                          <div
                            key={wp.id}
                            className="rounded-2xl flex flex-col gap-0 relative cursor-pointer overflow-hidden group transition-transform duration-300 hover:scale-[1.02] active:scale-[0.98] w-full"
                            style={{background: 'rgba(15,7,3,0.7)', border: '1px solid rgba(120,60,10,0.25)', boxShadow: '0 4px 20px rgba(0,0,0,0.5)'}}
                            onClick={() => handleWallpaperAction(wp)}
                          >
                            <div className="w-full aspect-[9/16] rounded-2xl overflow-hidden relative">
                              <img src={wp.imageUrl} alt={wp.name}
                                className="w-full h-full object-cover group-hover:scale-[1.07] transition-all duration-500 pointer-events-none brightness-[0.88] contrast-[1.03] group-hover:brightness-100 group-hover:contrast-100"/>
                              {/* Cinematic gradient */}
                              <div className="absolute inset-0" style={{background:"linear-gradient(to top, rgba(10,4,2,0.96) 0%, rgba(10,4,2,0.5) 35%, rgba(10,4,2,0.05) 70%, transparent 100%)"}}/>

                              {/* Like Button Overlay */}
                              <div className="absolute top-2.5 left-2.5 z-30">
                                <PosterLikeButton
                                  posterId={wp.id}
                                  isLiked={likedWallpaperIds.includes(wp.id)}
                                  onToggle={() => toggleLikeWallpaper(wp.id)}
                                />
                              </div>

                              {/* Tier badge */}
                              <div className="absolute top-2.5 right-2.5 px-2 py-0.5 rounded-full z-10"
                                style={{fontSize:8,fontWeight:900,fontFamily:"sans-serif",textTransform:"uppercase",letterSpacing:"0.08em",
                                  background:wp.tier==="premium"?"linear-gradient(135deg,rgba(251,191,36,0.3),rgba(217,119,6,0.25))":"rgba(0,0,0,0.55)",
                                  border:wp.tier==="premium"?"1px solid rgba(251,191,36,0.5)":"1px solid rgba(251,191,36,0.25)",
                                  color:"#fbbf24",
                                  backdropFilter:"blur(2px)"}}>
                                {wp.tier === "premium" ? "👑 Pro" : "Free"}
                              </div>

                              {/* Download button */}
                              <button
                                onClick={(e)=>{e.stopPropagation();handleDownloadWallpaper(wp);}}
                                className="absolute bottom-2.5 right-2.5 flex items-center justify-center transition-all duration-250 active:scale-90 focus:outline-none z-15 shadow-md"
                                style={{width:32,height:32,borderRadius:"50%",background:"rgba(0,0,0,0.65)",border:"1.5px solid rgba(251,191,36,0.45)",boxShadow:"0 2px 10px rgba(0,0,0,0.4)"}}
                                onMouseEnter={e=>{
                                  (e.currentTarget as HTMLButtonElement).style.background="linear-gradient(135deg,#f59e0b,#d97706)";
                                  (e.currentTarget as HTMLButtonElement).style.borderColor="#fbbf24";
                                  (e.currentTarget as HTMLButtonElement).style.boxShadow="0 0 8px rgba(251,191,36,0.5)";
                                }}
                                onMouseLeave={e=>{
                                  (e.currentTarget as HTMLButtonElement).style.background="rgba(0,0,0,0.65)";
                                  (e.currentTarget as HTMLButtonElement).style.borderColor="rgba(251,191,36,0.45)";
                                  (e.currentTarget as HTMLButtonElement).style.boxShadow="none";
                                }}
                              >
                                <svg viewBox="0 0 24 24" fill="none" stroke="#fbbf24" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{width:12,height:12}}>
                                  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
                                  <polyline points="7 10 12 15 17 10"/>
                                  <line x1="12" y1="15" x2="12" y2="3"/>
                                </svg>
                              </button>
                            </div>

                            {/* Bottom text */}
                            <div className="px-2.5 py-2.5 text-left">
                              <span className="inline-block bg-amber-950/80 border border-amber-500/30 px-1.5 py-0.5 rounded text-[7.5px] font-sans font-black text-amber-300 tracking-wide w-fit leading-none mb-0.5 shadow-sm backdrop-blur-[2px]">
                                {isHi
                                  ? (wp.deity==="Shiva"?"शिव":wp.deity==="Rama"?"राम":wp.deity==="Krishna"?"कृष्ण":wp.deity==="Hanuman"?"हनुमान":wp.deity==="Radha"?"राधा":wp.deity)
                                  : wp.deity}
                              </span>
                              <h4 style={{fontFamily:"serif",fontSize:11,fontWeight:800,color:"rgba(255,251,235,0.95)",lineHeight:1.2}} className="line-clamp-1 block mt-0.5">
                                {isHi ? wp.nameHindi : wp.name}
                              </h4>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* 3. Liked Live Wallpapers */}
                  {likedWallpapers.liveLiked.length > 0 && (
                    <div className="space-y-3">
                      <h3 className="font-serif text-xs font-black uppercase text-amber-400 flex items-center gap-2 border-b border-amber-500/20 pb-2 tracking-wider">
                        <span>🎬</span>
                        {isHi ? "पसंदीदा सजीव वॉलपेपर" : "Liked Live Wallpapers"}
                      </h3>
                      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3.5 w-full">
                        {likedWallpapers.liveLiked.map((wp) => (
                          <div
                            key={wp.id}
                            className="rounded-2xl flex flex-col gap-0 relative cursor-pointer overflow-hidden group transition-transform duration-300 hover:scale-[1.02] active:scale-[0.98] w-full"
                            style={{background: 'rgba(15,7,3,0.7)', border: '1px solid rgba(120,60,10,0.25)', boxShadow: '0 4px 20px rgba(0,0,0,0.5)'}}
                            onClick={() => handleWallpaperAction(wp)}
                          >
                            <div className="w-full aspect-[9/16] rounded-2xl overflow-hidden relative">
                              {wp.effect==="aura" && <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(251,191,36,0.18)_0%,transparent_75%)] pointer-events-none z-10 animate-pulse" style={{animationDuration:"2.5s"}}/>}
                              {wp.effect==="shimmer" && <div className="absolute inset-0 bg-[linear-gradient(45deg,transparent_20%,rgba(255,255,255,0.08)_50%,transparent_80%)] pointer-events-none z-10 animate-shimmer"/>}
                              {wp.effect==="flame" && <div className="absolute inset-0 bg-gradient-to-t from-orange-500/10 via-transparent to-transparent pointer-events-none z-10 animate-pulse" style={{animationDuration:"1.5s"}}/>}
                              <img src={wp.thumbnailUrl} alt={wp.name}
                                className="w-full h-full object-cover group-hover:scale-[1.07] transition-all duration-500 pointer-events-none brightness-[0.88] contrast-[1.03] group-hover:brightness-100 group-hover:contrast-100"/>
                              <div className="absolute inset-0" style={{background:"linear-gradient(to top, rgba(10,4,2,0.96) 0%, rgba(10,4,2,0.5) 35%, rgba(10,4,2,0.05) 70%, transparent 100%)"}}/>
                              
                              {/* Like Button Overlay */}
                              <div className="absolute top-2.5 left-2.5 z-30">
                                <PosterLikeButton
                                  posterId={wp.id}
                                  isLiked={likedWallpaperIds.includes(wp.id)}
                                  onToggle={() => toggleLikeWallpaper(wp.id)}
                                />
                              </div>

                              {/* Effect tag */}
                              <div className="absolute top-[42px] left-2.5 z-10">
                                <span style={{fontSize:7,fontWeight:900,textTransform:"uppercase",letterSpacing:"0.1em",padding:"2px 6px",borderRadius:4,background:"rgba(0,0,0,0.6)",border:"1px solid rgba(251,191,36,0.25)",color:"#fbbf24"}}>{wp.effect}</span>
                              </div>

                              {/* Tier badge */}
                              <div className="absolute top-2.5 right-2.5 px-2 py-0.5 rounded-full z-10"
                                style={{fontSize:8,fontWeight:900,textTransform:"uppercase",letterSpacing:"0.08em",
                                  background:wp.tier==="premium"?"linear-gradient(135deg,rgba(251,191,36,0.3),rgba(217,119,6,0.25))":"rgba(0,0,0,0.55)",
                                  border:wp.tier==="premium"?"1px solid rgba(251,191,36,0.5)":"1px solid rgba(251,191,36,0.25)",
                                  color:"#fbbf24",
                                  backdropFilter:"blur(2px)"}}>
                                {wp.tier === "premium" ? "👑 Pro" : "Free"}
                              </div>

                              {/* Action button */}
                              <button onClick={(e)=>{e.stopPropagation();handleLiveWallpaperAction(wp);}}
                                className="absolute bottom-2.5 right-2.5 flex items-center justify-center transition-all duration-250 active:scale-90 focus:outline-none z-20 shadow-md"
                                style={{width:32,height:32,borderRadius:"50%",background:"rgba(0,0,0,0.65)",border:"1.5px solid rgba(251,191,36,0.45)",boxShadow:"0 2px 10px rgba(0,0,0,0.4)"}}
                                onMouseEnter={e=>{(e.currentTarget as HTMLButtonElement).style.background="linear-gradient(135deg,#f59e0b,#d97706)";(e.currentTarget as HTMLButtonElement).style.borderColor="#fbbf24";(e.currentTarget as HTMLButtonElement).style.boxShadow="0 0 8px rgba(251,191,36,0.5)";}}
                                onMouseLeave={e=>{(e.currentTarget as HTMLButtonElement).style.background="rgba(0,0,0,0.65)";(e.currentTarget as HTMLButtonElement).style.borderColor="rgba(251,191,36,0.45)";(e.currentTarget as HTMLButtonElement).style.boxShadow="none";}}>
                                <Sparkles className="w-3.5 h-3.5 text-amber-400 fill-current"/>
                              </button>
                            </div>

                            {/* Bottom text */}
                            <div className="px-2.5 py-2.5 text-left">
                              <span className="inline-block bg-amber-950/80 border border-amber-500/30 px-1.5 py-0.5 rounded text-[7.5px] font-sans font-black text-amber-300 tracking-wide w-fit leading-none mb-0.5 shadow-sm backdrop-blur-[2px]">
                                {isHi?(wp.deity==="Shiva"?"शिव":wp.deity==="Rama"?"राम":wp.deity==="Krishna"?"कृष्ण":wp.deity==="Hanuman"?"हनुमान":wp.deity):wp.deity}
                              </span>
                              <h4 style={{fontFamily:"serif",fontSize:11,fontWeight:800,color:"rgba(255,251,235,0.95)",lineHeight:1.2}} className="line-clamp-1 block mt-0.5">
                                {isHi?wp.nameHindi:wp.name}
                              </h4>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )
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
              {/* Wallpaper Background (full screen / dim overlay based on isCardVisible) */}
              <div className="fixed inset-0 z-[121] select-none pointer-events-none overflow-hidden">
                <img
                  src={wp.imageUrl}
                  alt=""
                  className={`w-full h-full object-cover transition-all duration-500 ${
                    isCardVisible ? "scale-105 filter brightness-[0.85] blur-xs" : "scale-100 filter brightness-100 blur-none"
                  }`}
                />
              </div>

              {/* Click-to-close Overlay (when card is visible, clicking outside hides the card) */}
              {isCardVisible && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  onClick={() => setIsCardVisible(false)}
                  className="fixed inset-0 bg-black/15 backdrop-blur-xs z-[122] select-none cursor-pointer"
                />
              )}

              {/* Tap to bring card back (when card is hidden) */}
              {!isCardVisible && (
                <div 
                  onClick={() => setIsCardVisible(true)}
                  className="fixed inset-0 z-[122] cursor-pointer"
                />
              )}

              {/* Top Bar Controls (always visible, does not convert to anything else) */}
              <div className="fixed top-5 inset-x-5 flex justify-between items-center z-[140] select-none">
                <button
                  onClick={() => setShowPreviewModal(null)}
                  className="w-10 h-10 rounded-full bg-black/40 backdrop-blur-md border border-white/10 flex items-center justify-center text-white hover:bg-black/60 transition-all duration-300 cursor-pointer shadow-lg active:scale-95 z-[141]"
                >
                  <X className="w-5 h-5" />
                </button>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleShareWallpaper(wp)}
                    className="w-10 h-10 rounded-full bg-black/40 backdrop-blur-md border border-white/10 flex items-center justify-center text-white hover:bg-black/60 transition-all duration-300 cursor-pointer shadow-lg active:scale-95 z-[141]"
                  >
                    <Share2 className="w-4.5 h-4.5" />
                  </button>
                </div>
              </div>

              {/* Reconstructed Side-by-side Modal Frame */}
              <AnimatePresence>
                {isCardVisible && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95, y: 50 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95, y: 50 }}
                    transition={{ type: "spring", damping: 25, stiffness: 185 }}
                    style={{ backgroundColor: "rgba(20, 10, 5, 0.75)" }}
                    className="fixed bottom-[8%] left-[4%] right-[4%] max-w-[430px] md:max-w-3xl mx-auto backdrop-blur-xl border border-amber-500/20 rounded-[2rem] p-6 md:p-8 min-h-[220px] md:min-h-[380px] shadow-[0_25px_60px_rgba(0,0,0,0.95)] z-[130] flex flex-row items-center justify-between overflow-visible"
                  >
                    {/* Card close button (cross button inside card, top left) */}
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setShowPreviewModal(null);
                      }}
                      className="absolute top-4 left-4 w-7 h-7 md:w-8 md:h-8 rounded-full bg-black/40 border border-white/10 hover:border-amber-500/40 hover:bg-black/60 flex items-center justify-center text-white/70 hover:text-amber-400 transition-all active:scale-90 cursor-pointer z-40"
                    >
                      <X className="w-4 h-4" />
                    </button>
                    
                    {/* 1. LEFT SIDE: Info & CTA Card details */}
                    <div className="w-[55%] flex flex-col justify-between self-stretch pt-7 md:pt-5 pb-1 gap-2 md:gap-3.5 select-none text-left">
                      <div className="space-y-3.5 md:space-y-5">
                        {/* Header title */}
                        <div className="space-y-2">
                          <span className="inline-block px-2 py-0.5 bg-amber-500/10 border border-amber-500/35 rounded text-[7px] md:text-[9px] font-sans font-black text-amber-400 uppercase tracking-widest leading-none shadow-sm backdrop-blur-[2px]">
                            {isHi
                              ? (wp.deity==="Shiva"?"शिव":wp.deity==="Rama"?"राम":wp.deity==="Krishna"?"कृष्ण":wp.deity==="Hanuman"?"हनुमान":wp.deity==="Radha"?"राधा":wp.deity)
                              : wp.deity}
                          </span>
                          <h2 className="text-base md:text-2xl font-serif font-black text-transparent bg-clip-text bg-gradient-to-r from-amber-200 via-amber-100 to-amber-300 leading-tight">
                            {isHi ? wp.nameHindi : wp.name}
                          </h2>
                          <p className="text-[9px] md:text-xs font-sans text-amber-200/60 font-medium leading-normal">
                            {isHi 
                              ? `रागघवम् गैलरी का पावन ${wp.tier === "premium" ? "प्रीमियम" : "मुफ़्त"} वॉलपेपर`
                              : `Sacred ${wp.tier === "premium" ? "Premium" : "Free"} mobile wallpaper from Raghavam gallery`}
                          </p>
                        </div>

                        {/* Toggle Pills Selection (Home screen vs Lock screen) - Segmented Control */}
                        <div className="flex bg-stone-950/60 border border-amber-500/10 rounded-full p-0.5 max-w-[240px] select-none font-sans text-[10px] md:text-xs">
                          <button
                            onClick={() => setPreviewMode("lock")}
                            className={`flex-1 flex items-center justify-center gap-1 py-1.5 px-2 md:px-3.5 rounded-full transition-all duration-200 cursor-pointer ${
                              previewMode === "lock"
                                ? "bg-amber-500 text-stone-950 font-bold shadow-md"
                                : "bg-transparent text-amber-200/80 hover:text-amber-200"
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
                                : "bg-transparent text-amber-200/80 hover:text-amber-200"
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
                      <div className="absolute -top-12 md:-top-20 z-30 transition-transform active:scale-[0.98]">
                        <PhoneFrame imageUrl={wp.imageUrl} previewMode={previewMode} />
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Swipe Help instruction at absolute bottom */}
              {isCardVisible && (
                <div className="fixed bottom-4 inset-x-0 flex items-center justify-center gap-1 text-[9px] uppercase tracking-widest font-sans text-amber-200/85 pointer-events-none select-none z-[131] font-semibold">
                  <span className="text-amber-500/80">❈</span>
                  <span>👆 {isHi ? "स्वाइप करें और वॉलपेपर देखें" : "Swipe to change"}</span>
                  <span className="text-amber-500/80">❈</span>
                </div>
              )}
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
              {/* Wallpaper Background (full screen / dim overlay based on isCardVisible) */}
              <div className="fixed inset-0 z-[121] select-none pointer-events-none overflow-hidden">
                <img
                  src={wp.thumbnailUrl}
                  alt=""
                  className={`w-full h-full object-cover transition-all duration-500 ${
                    isCardVisible ? "scale-105 filter brightness-[0.85] blur-xs" : "scale-100 filter brightness-100 blur-none"
                  }`}
                />
              </div>

              {/* Click-to-close Overlay (when card is visible, clicking outside hides the card) */}
              {isCardVisible && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  onClick={() => setIsCardVisible(false)}
                  className="fixed inset-0 bg-black/15 backdrop-blur-xs z-[122] select-none cursor-pointer"
                />
              )}

              {/* Tap to bring card back (when card is hidden) */}
              {!isCardVisible && (
                <div 
                  onClick={() => setIsCardVisible(true)}
                  className="fixed inset-0 z-[122] cursor-pointer"
                />
              )}

              {/* Top Bar Controls (always visible, does not convert to anything else) */}
              <div className="fixed top-5 inset-x-5 flex justify-between items-center z-[140] select-none">
                <button
                  onClick={() => setShowLivePreviewModal(null)}
                  className="w-10 h-10 rounded-full bg-black/40 backdrop-blur-md border border-white/10 flex items-center justify-center text-white hover:bg-black/60 transition-all duration-300 cursor-pointer shadow-lg active:scale-95 z-[141]"
                >
                  <X className="w-5 h-5" />
                </button>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleShareWallpaper(wp)}
                    className="w-10 h-10 rounded-full bg-black/40 backdrop-blur-md border border-white/10 flex items-center justify-center text-white hover:bg-black/60 transition-all duration-300 cursor-pointer shadow-lg active:scale-95 z-[141]"
                  >
                    <Share2 className="w-4.5 h-4.5" />
                  </button>
                </div>
              </div>

              {/* Side-by-side Modal Frame */}
              <AnimatePresence>
                {isCardVisible && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95, y: 50 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95, y: 50 }}
                    transition={{ type: "spring", damping: 25, stiffness: 185 }}
                    style={{ backgroundColor: "rgba(20, 10, 5, 0.75)" }}
                    className="fixed bottom-[8%] left-[4%] right-[4%] max-w-[430px] md:max-w-3xl mx-auto backdrop-blur-xl border border-amber-500/20 rounded-[2rem] p-6 md:p-8 min-h-[220px] md:min-h-[380px] shadow-[0_25px_60px_rgba(0,0,0,0.95)] z-[130] flex flex-row items-center justify-between overflow-visible"
                  >
                    {/* Card close button (cross button inside card, top left) */}
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setShowLivePreviewModal(null);
                      }}
                      className="absolute top-4 left-4 w-7 h-7 md:w-8 md:h-8 rounded-full bg-black/40 border border-white/10 hover:border-amber-500/40 hover:bg-black/60 flex items-center justify-center text-white/70 hover:text-amber-400 transition-all active:scale-90 cursor-pointer z-40"
                    >
                      <X className="w-4 h-4" />
                    </button>
                    
                    {/* 1. LEFT SIDE: Info & CTA */}
                    <div className="w-[55%] flex flex-col justify-between self-stretch pt-7 md:pt-5 pb-1 gap-2 md:gap-3.5 select-none text-left">
                      <div className="space-y-3.5 md:space-y-5">
                        {/* Header title */}
                        <div className="space-y-2">
                          <div className="flex flex-wrap items-center gap-1.5">
                            <span className="inline-block px-2 py-0.5 bg-amber-500/15 border border-amber-500/35 rounded text-[7px] md:text-[9px] font-sans font-black text-amber-400 uppercase tracking-widest leading-none shadow-sm backdrop-blur-[2px]">
                              {isHi
                                ? (wp.deity==="Shiva"?"शिव":wp.deity==="Rama"?"राम":wp.deity==="Krishna"?"कृष्ण":wp.deity==="Hanuman"?"हनुमान":wp.deity)
                                : wp.deity}
                            </span>
                            <span className="inline-block px-2 py-0.5 bg-orange-500/15 border border-orange-500/35 rounded text-[7px] md:text-[9px] font-sans font-black text-orange-400 uppercase tracking-widest leading-none shadow-sm backdrop-blur-[2px]">
                              {wp.effect}
                            </span>
                          </div>
                          <h2 className="text-base md:text-2xl font-serif font-black text-transparent bg-clip-text bg-gradient-to-r from-amber-200 via-amber-100 to-amber-300 leading-tight">
                            {isHi ? wp.nameHindi : wp.name}
                          </h2>
                          <p className="text-[9px] md:text-xs font-sans text-amber-200/60 font-medium leading-normal">
                            {isHi 
                              ? `रागघवम् गैलरी का पावन सजीव ${wp.tier === "premium" ? "प्रीमियम" : "मुफ़्त"} वॉलपेपर`
                              : `Sacred ${wp.tier === "premium" ? "Premium" : "Free"} live wallpaper from Raghavam gallery`}
                          </p>
                        </div>

                        {/* Toggle Pills Selection - Segmented Control */}
                        <div className="flex bg-stone-950/60 border border-amber-500/10 rounded-full p-0.5 max-w-[240px] select-none font-sans text-[10px] md:text-xs">
                          <button
                            onClick={() => setPreviewMode("lock")}
                            className={`flex-1 flex items-center justify-center gap-1 py-1.5 px-2 md:px-3.5 rounded-full transition-all duration-200 cursor-pointer ${
                              previewMode === "lock"
                                ? "bg-amber-500 text-stone-950 font-bold shadow-md"
                                : "bg-transparent text-amber-200/80 hover:text-amber-200"
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
                                : "bg-transparent text-amber-200/80 hover:text-amber-200"
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
                      <div className="absolute -top-12 md:-top-20 z-30 transition-transform active:scale-[0.98]">
                        <PhoneFrame imageUrl={wp.thumbnailUrl} previewMode={previewMode} effect={wp.effect} />
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Swipe Help instruction at absolute bottom */}
              {isCardVisible && (
                <div className="fixed bottom-4 inset-x-0 flex items-center justify-center gap-1 text-[9px] uppercase tracking-widest font-sans text-amber-200/85 pointer-events-none select-none z-[131] font-semibold">
                  <span className="text-amber-500/80">❈</span>
                  <span>👆 {isHi ? "स्वाइप करें और वॉलपेपर देखें" : "Swipe to change"}</span>
                  <span className="text-amber-500/80">❈</span>
                </div>
              )}
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
                <p className="text-xs text-amber-200/85 font-sans leading-relaxed font-semibold">
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
                  <span className="text-[10px] uppercase font-sans font-black text-amber-500/90 tracking-wider">
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

      {/* ─── SCREEN 3: FIRST-TIME SETUP BOTTOM SHEET ─── */}
      <AnimatePresence>
        {showSetupSheet && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowSetupSheet(false)}
              className="fixed inset-0 bg-black/75 z-[150] backdrop-blur-sm"
            />

            {/* Bottom Sheet Drawer Container */}
            <motion.div
              initial={{ opacity: 0, y: "100%" }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: "100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="fixed inset-x-0 bottom-0 max-w-md mx-auto bg-gradient-to-b from-[#1c0d06] to-[#0e0502] border-t border-amber-500/30 rounded-t-[2.5rem] p-6 shadow-[0_-15px_40px_rgba(0,0,0,0.8)] z-[160] flex flex-col gap-6 pb-8 md:bottom-auto md:top-[25%] md:rounded-[2rem] md:border text-stone-200"
            >
              {/* Drag handle */}
              <div className="w-12 h-1 bg-amber-500/20 rounded-full mx-auto md:hidden" />

              <div className="flex justify-between items-center">
                <h3 className="font-serif text-lg font-black text-amber-400 uppercase tracking-widest">
                  {isHi ? "प्रोफ़ाइल सेटअप" : "Create My Version"}
                </h3>
                <button
                  onClick={() => setShowSetupSheet(false)}
                  className="w-8 h-8 rounded-full bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/20 flex items-center justify-center text-amber-400 transition-colors"
                >
                  <X className="w-4.5 h-4.5" />
                </button>
              </div>

              {/* Upload Photo section */}
              <div className="flex flex-col items-center gap-3">
                <div className="relative w-28 h-28 rounded-full border-2 border-amber-500/50 bg-stone-900/60 overflow-hidden flex items-center justify-center shadow-lg group">
                  {tempPhoto ? (
                    <img src={tempPhoto} alt="Preview avatar" className="w-full h-full object-cover" />
                  ) : (
                    <UserIcon className="w-12 h-12 text-amber-500/30" />
                  )}

                  {/* Upload overlay trigger */}
                  <button 
                    onClick={(e) => {
                      e.preventDefault();
                      if (fileInputRef.current) {
                        fileInputRef.current.value = "";
                      }
                      fileInputRef.current?.click();
                    }}
                    className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer text-white"
                  >
                    <Camera className="w-6 h-6 text-white" />
                  </button>

                  {/* Camera float overlay */}
                  <button
                    onClick={(e) => {
                      e.preventDefault();
                      if (fileInputRef.current) {
                        fileInputRef.current.value = "";
                      }
                      fileInputRef.current?.click();
                    }}
                    className="absolute bottom-1 right-1 w-7 h-7 rounded-full bg-amber-500 border border-stone-950 flex items-center justify-center text-stone-950 shadow active:scale-90 transition-transform cursor-pointer"
                  >
                    <Camera className="w-3.5 h-3.5" />
                  </button>
                </div>
                <span className="text-[10px] uppercase font-sans font-black text-amber-500/90 tracking-wider">
                  {isHi ? "श्रद्धालु चित्र अपलोड करें" : "Upload Devotee Photo"}
                </span>

                {/* Hidden File Input */}
                <input 
                  type="file" 
                  ref={fileInputRef} 
                  accept="image/*" 
                  className="hidden" 
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) {
                      const reader = new FileReader();
                      reader.onload = (event) => {
                        if (event.target?.result) {
                          setCropImageSrc(event.target.result as string);
                          setCropTarget('temp');
                          setCropModalOpen(true);
                        }
                      };
                      reader.readAsDataURL(file);
                    }
                  }}
                />
              </div>

              {/* Name Input section */}
              <div className="space-y-1.5 text-left">
                <label className="text-[10px] uppercase font-sans font-black text-amber-500/90 tracking-wider">
                  {isHi ? "आपका नाम" : "Your Name"}
                </label>
                <div className="relative">
                  <div className="absolute left-4 top-1/2 -translate-y-1/2 text-amber-500/70">
                    <UserIcon className="w-4 h-4" />
                  </div>
                  <input
                    type="text"
                    maxLength={30}
                    placeholder={isHi ? "नाम दर्ज करें..." : "Enter your name..."}
                    value={tempName}
                    onChange={(e) => setTempName(e.target.value)}
                    className="w-full bg-black/45 border border-amber-500/20 focus:border-amber-500/45 rounded-xl py-3 pl-11 pr-16 text-xs text-amber-100 placeholder:text-amber-200/85 focus:outline-none tracking-wide font-sans font-medium"
                  />
                  <span className="absolute right-4 top-1/2 -translate-y-1/2 text-[9px] font-sans text-amber-500/80 font-bold">
                    {tempName.length}/30
                  </span>
                </div>
              </div>

              {/* Submit CTA */}
              <div className="space-y-4">
                <button
                  onClick={() => {
                    const finalName = tempName.trim();
                    if (!finalName) {
                      toast.error(isHi ? "कृपया अपना नाम दर्ज करें!" : "Please enter your name!");
                      return;
                    }
                    if (!tempPhoto) {
                      toast.error(isHi ? "कृपया एक पावन चित्र अपलोड करें!" : "Please upload profile photo!");
                      return;
                    }
                    setUserName(finalName);
                    setUserPhoto(tempPhoto);
                    try {
                      localStorage.setItem("hk_profile_name", finalName);
                      localStorage.setItem("hk_profile_photo", tempPhoto);
                    } catch (err) {
                      console.error("Failed to save profile details to localStorage", err);
                    }
                    setShowSetupSheet(false);
                    toast.success(isHi ? "प्रोफ़ाइल सफलतापूर्वक सहेज ली गई!" : "Profile details saved successfully!");
                  }}
                  disabled={!tempName.trim() || !tempPhoto}
                  className={`w-full py-3.5 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 disabled:from-stone-800 disabled:to-stone-900 disabled:text-stone-500 disabled:cursor-not-allowed text-stone-950 font-sans font-black text-xs uppercase rounded-xl transition-all active:scale-[0.97] flex items-center justify-center gap-1.5 shadow-md cursor-pointer ${isHi ? '' : 'tracking-widest'}`}
                >
                  <Check className="w-4 h-4" />
                  <span>{isHi ? "प्रोफ़ाइल सहेजें" : "Save Profile"}</span>
                </button>

                <p className="text-[9.5px] font-sans text-emerald-400/80 flex items-center justify-center gap-1.5 leading-none">
                  <span>🛡️</span>
                  <span>{isHi ? "आपकी जानकारी पूर्णतः सुरक्षित है" : "Your profile is safe & secure"}</span>
                </p>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* ─── POSTER STUDIO MODAL ─── */}
      <AnimatePresence>
        {selectedPoster && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => { setSelectedPoster(null); setShowProfileEdit(false); }}
              className="fixed inset-0 z-[120]"
              style={{ background: "rgba(10,3,1,0.94)", backdropFilter: "blur(18px)" }}
            />

            {/* Modal */}
            <div className="fixed inset-0 z-[130] flex items-center justify-center pointer-events-none">
              <motion.div
                initial={{ opacity: 0, scale: 0.96 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.96 }}
                transition={{ duration: 0.22, ease: [0.25, 0.1, 0.25, 1] }}
                className="pointer-events-auto w-full max-w-[420px] flex flex-col"
                style={{
                  height: "100dvh",
                  maxHeight: 860,
                  background: "transparent",
                  overflow: "hidden",
                }}
              >
                {/* ── TOP: Close button + Poster card ── */}
                <div
                  className="flex-1 min-h-0 flex flex-col items-center justify-end relative"
                  style={{ padding: "16px 12px 8px" }}
                >
                  {/* Close button — top right, larger for accessibility */}
                  <button
                    onClick={() => { setSelectedPoster(null); setShowProfileEdit(false); }}
                    className="absolute top-4 right-4 z-50 flex items-center justify-center cursor-pointer shadow-lg active:scale-95"
                    style={{
                      width: 40, height: 40, borderRadius: "50%",
                      background: "rgba(0,0,0,0.65)",
                      border: "1px solid rgba(251,191,36,0.35)",
                      color: "#fbbf24",
                      transition: "transform 0.2s, opacity 0.2s",
                    }}
                    onMouseEnter={e => (e.currentTarget.style.transform="scale(1.08)")}
                    onMouseLeave={e => (e.currentTarget.style.transform="scale(1)")}
                  >
                    <X className="w-5 h-5" />
                  </button>

                  {/* Scrollable container of poster cards - Vertical snap scrolling */}
                  <div
                    ref={posterScrollContainerRef}
                    onScroll={handlePosterScroll}
                    className={`w-full flex flex-col snap-y snap-mandatory scrollbar-none gap-0 ${isEditingPhoto ? "overflow-y-hidden touch-none" : "overflow-y-auto"}`}
                    style={{
                      height: "calc(100dvh - 190px)",
                      maxHeight: "calc(100dvh - 190px)",
                      opacity: hasScrolledPosterToInitial ? 1 : 0,
                      transition: "opacity 0.12s ease-in-out",
                    }}
                  >
                    {POSTER_TEMPLATES.map((tpl) => {
                      const isActive = selectedPoster.id === tpl.id;
                      
                      // Calculate relative coordinate percentages matching 1080x1920 canvas
                      const isFlexible = tpl.allowShapeChange;
                      const CX_tpl = isFlexible ? (tpl.photoPosition.x + (isActive ? posterOffsetX : 0)) : tpl.photoPosition.x;
                      const CY_tpl = isFlexible ? (tpl.photoPosition.y + (isActive ? posterOffsetY : 0)) : tpl.photoPosition.y;
                      const R_tpl = isFlexible ? (tpl.photoPosition.radius * (isActive ? posterFrameScale : 1.0)) : tpl.photoPosition.radius;

                      const photoLeft = `${(CX_tpl / 1080) * 100}%`;
                      const photoTop = `${(CY_tpl / 1920) * 100}%`;
                      const avatarWidthPercent = `${((R_tpl * 2) / 1080) * 100}%`;
                      const nameLeft = `${((tpl.namePosition.x + (isActive ? posterNameOffsetX : 0)) / 1080) * 100}%`;
                      const nameTop = `${((tpl.namePosition.y + (isActive ? posterNameOffsetY : 0)) / 1920) * 100}%`;

                      return (
                        <div
                          key={tpl.id}
                          id={`poster-card-${tpl.id}`}
                          className="snap-center shrink-0 w-full h-full flex items-center justify-center relative select-none"
                          style={{ scrollSnapStop: "always", height: "100%" }}
                        >
                          <div
                            className="relative overflow-hidden"
                            style={{
                              aspectRatio: "9/16",
                              width: "100%",
                              height: "100%",
                              maxWidth: 390,
                              maxHeight: "100%",
                              borderRadius: 18,
                              boxShadow: "0 16px 48px rgba(0,0,0,0.85)",
                              background: "#120603",
                            }}
                          >
                            {/* Like Button Overlay - Top Left of each card (preventing overlap with modal close button at top-right) */}
                            <div className="absolute top-4 left-4 z-40">
                              <PosterLikeButton
                                posterId={tpl.id}
                                isLiked={likedPosterIds.includes(tpl.id)}
                                onToggle={() => toggleLike(tpl.id)}
                              />
                            </div>
                            {/* Template base background image */}
                            <img
                              src={tpl.imageUrl}
                              alt={isHi ? tpl.titleHindi : tpl.title}
                              style={{
                                width: "100%",
                                height: "100%",
                                objectFit: "cover",
                                display: "block",
                              }}
                              className="pointer-events-none"
                            />

                            {/* Live CSS Avatar Overlay (Instant, no flickering, no image swapping!) */}
                            {(() => {
                              const shapeForTpl = isActive ? posterShape : (tpl.defaultShape || "circle");
                              const zoomForTpl = isActive ? posterZoom : 1.0;
                              const offsetXForTpl = isActive ? posterOffsetX : 0;
                              const offsetYForTpl = isActive ? posterOffsetY : 0;

                              const computedBorderRadius = 
                                shapeForTpl === "circle" || shapeForTpl === "oval"
                                  ? "50%"
                                  : shapeForTpl === "square"
                                  ? "0px"
                                  : "15%"; // rounded-square

                              const isEditable = isActive && isEditingPhoto;
                              const isPhotoSelected = isEditable && editingElement === "photo";

                              return (
                                <div
                                  className={`absolute overflow-hidden flex items-center justify-center ${isEditable ? 'cursor-grab select-none active:cursor-grabbing touch-none z-[120]' : ''}`}
                                  style={{
                                    left: photoLeft,
                                    top: photoTop,
                                    width: avatarWidthPercent,
                                    aspectRatio: shapeForTpl === "oval" ? "3/4" : "1/1",
                                    transform: `translate(-50%, -50%) rotate(${isActive ? posterRotation : 0}rad)`,
                                    borderRadius: computedBorderRadius,
                                    border: isPhotoSelected 
                                      ? "2px dashed #fbbf24" 
                                      : isEditable 
                                      ? "1.5px dashed rgba(251, 191, 36, 0.4)" 
                                      : "1.5px solid #fbbf24",
                                    background: "#1b0a05",
                                    boxShadow: isPhotoSelected 
                                      ? "0 0 0 2px rgba(251, 191, 36, 0.4), 0 0 24px rgba(251, 191, 36, 0.95)"
                                      : "0 4px 12px rgba(0,0,0,0.6)",
                                  }}
                                  // Drag handlers for in-place frame movement
                                  onPointerDown={isEditable ? (e) => {
                                    e.stopPropagation();
                                    setEditingElement("photo");
                                    e.currentTarget.setPointerCapture(e.pointerId);
                                    (e.currentTarget as any)._dragStart = {
                                      x: e.clientX,
                                      y: e.clientY,
                                      ox: posterOffsetX,
                                      oy: posterOffsetY
                                    };
                                  } : undefined}
                                  onPointerMove={isEditable ? (e) => {
                                    const data = (e.currentTarget as any)._dragStart;
                                    if (!data) return;
                                    const rect = e.currentTarget.parentElement?.getBoundingClientRect();
                                    if (!rect) return;
                                    // Scale mouse/touch move delta values to match the 1080px canvas coordinates
                                    const scale = 1080 / rect.width;
                                    const dx = (e.clientX - data.x) * scale;
                                    const dy = (e.clientY - data.y) * scale;
                                    setPosterOffsetX(data.ox + dx);
                                    setPosterOffsetY(data.oy + dy);
                                  } : undefined}
                                  onPointerUp={isEditable ? (e) => {
                                    delete (e.currentTarget as any)._dragStart;
                                    e.currentTarget.releasePointerCapture(e.pointerId);
                                  } : undefined}
                                  onPointerCancel={isEditable ? (e) => {
                                    delete (e.currentTarget as any)._dragStart;
                                    e.currentTarget.releasePointerCapture(e.pointerId);
                                  } : undefined}
                                  // Mouse wheel scale adjustments
                                  onWheel={isEditable ? (e) => {
                                    e.preventDefault();
                                    const delta = -e.deltaY * 0.001;
                                    if (tpl.allowShapeChange) {
                                      setPosterFrameScale(prev => Math.max(0.5, Math.min(2.5, prev + delta)));
                                    } else {
                                      setPosterZoom(prev => Math.max(0.8, Math.min(3.0, prev + delta)));
                                    }
                                  } : undefined}
                                >
                                  {userPhoto ? (
                                    <img 
                                      src={userPhoto} 
                                      alt="devotee" 
                                      style={{
                                        width: "100%",
                                        height: "100%",
                                        objectFit: "cover",
                                        transform: isFlexible 
                                          ? `scale(${zoomForTpl})` 
                                          : `scale(${zoomForTpl}) translate(${(offsetXForTpl / (tpl.photoPosition.radius * 2)) * 100}%, ${(offsetYForTpl / (tpl.photoPosition.radius * 2)) * 100}%)`,
                                        transformOrigin: "center center",
                                      }} 
                                      className="pointer-events-none"
                                    />
                                  ) : (
                                    <span style={{ fontSize: "min(3.5vw, 22px)", fontFamily: "serif", color: "#fbbf24", fontWeight: "bold" }}>ॐ</span>
                                  )}

                                  {/* White handle dots on the frame edges matching image-1782636742188.png */}
                                  {isEditable && (
                                    <>
                                      <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 w-3.5 h-3.5 bg-white border-2 border-amber-500 rounded-full shadow-lg pointer-events-none z-50 animate-pulse" />
                                      <div className="absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-1/2 w-3.5 h-3.5 bg-white border-2 border-amber-500 rounded-full shadow-lg pointer-events-none z-50 animate-pulse" />
                                      <div className="absolute left-0 top-1/2 -translate-x-1/2 -translate-y-1/2 w-3.5 h-3.5 bg-white border-2 border-amber-500 rounded-full shadow-lg pointer-events-none z-50 animate-pulse" />
                                      <div className="absolute right-0 top-1/2 translate-x-1/2 -translate-y-1/2 w-3.5 h-3.5 bg-white border-2 border-amber-500 rounded-full shadow-lg pointer-events-none z-50 animate-pulse" />
                                    </>
                                  )}
                                </div>
                              );
                            })()}

                            {/* Live CSS Name Banner Overlay */}
                            {(() => {
                              const isNameEditable = isActive && isEditingPhoto;
                              const isNameSelected = isNameEditable && editingElement === "name";

                              const computedNameBorderRadius = 
                                (isActive ? posterNameShape : "rounded-square") === "circle" || (isActive ? posterNameShape : "rounded-square") === "oval"
                                  ? "999px"
                                  : (isActive ? posterNameShape : "rounded-square") === "square"
                                  ? "0px"
                                  : "12px";

                              return (
                                <div
                                  className={`absolute flex items-center justify-center whitespace-nowrap ${isNameEditable ? 'cursor-grab select-none active:cursor-grabbing touch-none z-[120]' : ''}`}
                                  style={{
                                    left: nameLeft,
                                    top: nameTop,
                                    transform: `translate(-50%, -50%) scale(${isActive ? posterNameScale : 1.0}) rotate(${isActive ? posterNameRotation : 0}rad)`,
                                    background: "rgba(12, 5, 2, 0.85)",
                                    border: isNameSelected 
                                      ? "2px dashed #fbbf24" 
                                      : isNameEditable
                                      ? "1.5px dashed rgba(251, 191, 36, 0.5)"
                                      : "1.5px solid rgba(251, 191, 36, 0.5)",
                                    borderRadius: computedNameBorderRadius,
                                    padding: "4px min(4vw, 16px)",
                                    boxShadow: isNameSelected
                                      ? "0 0 0 2px rgba(251, 191, 36, 0.4), 0 0 24px rgba(251, 191, 36, 0.95)"
                                      : "0 6px 16px rgba(0,0,0,0.7)",
                                    transition: "border 0.2s, box-shadow 0.2s",
                                  }}
                                  onPointerDown={isNameEditable ? (e) => {
                                    e.stopPropagation();
                                    setEditingElement("name");
                                    e.currentTarget.setPointerCapture(e.pointerId);
                                    (e.currentTarget as any)._dragStart = {
                                      x: e.clientX,
                                      y: e.clientY,
                                      ox: posterNameOffsetX,
                                      oy: posterNameOffsetY
                                    };
                                  } : undefined}
                                  onPointerMove={isNameEditable ? (e) => {
                                    const data = (e.currentTarget as any)._dragStart;
                                    if (!data) return;
                                    const rect = e.currentTarget.parentElement?.getBoundingClientRect();
                                    if (!rect) return;
                                    const scale = 1080 / rect.width;
                                    const dx = (e.clientX - data.x) * scale;
                                    const dy = (e.clientY - data.y) * scale;
                                    setPosterNameOffsetX(data.ox + dx);
                                    setPosterNameOffsetY(data.oy + dy);
                                  } : undefined}
                                  onPointerUp={isNameEditable ? (e) => {
                                    delete (e.currentTarget as any)._dragStart;
                                    e.currentTarget.releasePointerCapture(e.pointerId);
                                  } : undefined}
                                  onPointerCancel={isNameEditable ? (e) => {
                                    delete (e.currentTarget as any)._dragStart;
                                    e.currentTarget.releasePointerCapture(e.pointerId);
                                  } : undefined}
                                  onWheel={isNameSelected ? (e) => {
                                    e.preventDefault();
                                    const delta = -e.deltaY * 0.001;
                                    setPosterNameScale(prev => Math.max(0.5, Math.min(2.5, prev + delta)));
                                  } : undefined}
                                >
                                  <span
                                    style={{
                                      fontFamily: "serif",
                                      fontWeight: 800,
                                      color: "#fbbf24",
                                      fontSize: "min(3.2vw, 16px)",
                                      letterSpacing: isHi ? "normal" : "0.02em",
                                    }}
                                  >
                                    {userName.trim() ? userName : (isHi ? "भक्त" : "Devotee")}
                                  </span>

                                  {isNameSelected && (
                                    <>
                                      <div className="absolute top-0 left-0 -translate-x-1/2 -translate-y-1/2 w-2 h-2 bg-white border border-amber-500 rounded-full shadow-md pointer-events-none z-50" />
                                      <div className="absolute top-0 right-0 translate-x-1/2 -translate-y-1/2 w-2 h-2 bg-white border border-amber-500 rounded-full shadow-md pointer-events-none z-50" />
                                      <div className="absolute bottom-0 left-0 -translate-x-1/2 translate-y-1/2 w-2 h-2 bg-white border border-amber-500 rounded-full shadow-md pointer-events-none z-50" />
                                      <div className="absolute bottom-0 right-0 translate-x-1/2 translate-y-1/2 w-2 h-2 bg-white border border-amber-500 rounded-full shadow-md pointer-events-none z-50" />
                                    </>
                                  )}
                                </div>
                              );
                            })()}
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {/* Onboarding Swipe Tutorial Hint - Floating indicators on left and right sides */}
                  <AnimatePresence>
                    {showScrollHint && (
                      <>
                        {/* Right side floating chevron pill */}
                        <motion.div
                          initial={{ opacity: 0, x: 20 }}
                          animate={{ opacity: 1, x: 0 }}
                          exit={{ opacity: 0, x: 20 }}
                          transition={{ duration: 0.3 }}
                          className="absolute right-6 top-1/2 -translate-y-1/2 z-40 pointer-events-none flex flex-col items-center gap-1.5"
                          style={{
                            background: "rgba(12, 5, 2, 0.7)",
                            border: "1px solid rgba(251, 191, 36, 0.4)",
                            borderRadius: "20px",
                            padding: "12px 6px",
                            boxShadow: "0 8px 24px rgba(0,0,0,0.6)",
                          }}
                        >
                          <motion.div
                            animate={{ y: [-5, 5, -5] }}
                            transition={{ repeat: Infinity, duration: 1.2, ease: "easeInOut" }}
                            className="flex flex-col items-center gap-2"
                          >
                            <svg className="w-3 h-3 text-amber-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="3.5">
                              <path strokeLinecap="round" strokeLinejoin="round" d="M5 15l7-7 7 7" />
                            </svg>
                            <div className="w-1 h-3 bg-amber-400/40 rounded-full" />
                            <svg className="w-3 h-3 text-amber-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="3.5">
                              <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                            </svg>
                          </motion.div>
                        </motion.div>

                        {/* Left side floating scroll text badge */}
                        <motion.div
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          exit={{ opacity: 0, x: -20 }}
                          transition={{ duration: 0.3 }}
                          className="absolute left-6 top-1/2 -translate-y-1/2 z-40 pointer-events-none"
                          style={{
                            background: "rgba(12, 5, 2, 0.7)",
                            border: "1px solid rgba(251, 191, 36, 0.4)",
                            borderRadius: "12px",
                            padding: "6px 10px",
                            boxShadow: "0 8px 24px rgba(0,0,0,0.6)",
                          }}
                        >
                          <span
                            className="font-sans font-black text-[9px] uppercase tracking-widest text-amber-300 whitespace-nowrap block"
                            style={{ textShadow: "0 1px 3px rgba(0,0,0,0.8)" }}
                          >
                            ↕️ {isHi ? "स्क्रॉल करें" : "Scroll"}
                          </span>
                        </motion.div>
                      </>
                    )}
                  </AnimatePresence>
                </div>

                {/* ── BOTTOM: Control panel ── */}
                <div
                  className="shrink-0 w-full flex flex-col"
                  style={{ background: "#0c0300", paddingTop: 0 }}
                >
                  {isEditingPhoto ? (
                    <div className="flex flex-col w-full bg-[#0c0300]" style={{ paddingTop: 0 }}>
                      
                      {/* 1. TITLE / INDICATOR ROW */}
                      <div className="flex justify-between items-center px-4 py-3 border-b border-white/5">
                        <div className="flex flex-col text-left">
                          <span style={{ fontSize: 13, fontFamily: "serif", fontWeight: 800, color: "#fbbf24", letterSpacing: "0.02em" }}>
                            {isHi ? "तस्वीर और नाम एडजस्ट करें" : "Adjust Photo & Name"}
                          </span>
                          <span style={{ fontSize: 9, fontFamily: "sans-serif", color: "rgba(255,255,255,0.4)" }}>
                            {isHi ? "लेयर चुनें और उंगली से ड्रैग करें" : "Select layer and drag directly"}
                          </span>
                        </div>
                        <button
                          onClick={() => {
                            setPosterZoom(1.0);
                            setPosterFrameScale(1.0);
                            setPosterOffsetX(0);
                            setPosterOffsetY(0);
                            setPosterShape(selectedPoster.defaultShape || "circle");
                            setPosterRotation(0);
                            setPosterNameOffsetX(0);
                            setPosterNameOffsetY(0);
                            setPosterNameScale(1.0);
                            setPosterNameRotation(0);
                            setPosterNameShape("rounded-square");
                          }}
                          className="px-2.5 py-1 rounded-lg bg-white/5 text-[10px] font-sans font-bold text-amber-300 uppercase tracking-wider hover:bg-white/10 active:scale-95 transition-all"
                        >
                          🔄 {isHi ? "रीसेट" : "Reset"}
                        </button>
                      </div>

                      {/* 2. LAYER SELECTOR (Photo vs Name toggle) */}
                      <div className="grid grid-cols-2 gap-1.5 px-4 py-2 border-b border-white/5 bg-[#0a0200]">
                        <button
                          onClick={() => setEditingElement("photo")}
                          className={cn(
                            "py-2 rounded-xl text-[10px] font-black uppercase tracking-wider transition-all cursor-pointer select-none",
                            editingElement === "photo"
                              ? "bg-amber-500 text-stone-950 shadow-lg shadow-amber-500/10"
                              : "bg-white/5 hover:bg-white/10 text-stone-300"
                          )}
                        >
                          📷 {isHi ? "तस्वीर (Photo)" : "Photo Layer"}
                        </button>
                        <button
                          onClick={() => setEditingElement("name")}
                          className={cn(
                            "py-2 rounded-xl text-[10px] font-black uppercase tracking-wider transition-all cursor-pointer select-none",
                            editingElement === "name"
                              ? "bg-amber-500 text-stone-950 shadow-lg shadow-amber-500/10"
                              : "bg-white/5 hover:bg-white/10 text-stone-300"
                          )}
                        >
                          ✍️ {isHi ? "नाम (Name)" : "Name Layer"}
                        </button>
                      </div>

                      {/* 3. TAB LIST BAR */}
                      <div className="grid grid-cols-5 border-b border-white/5 bg-[#0a0200]">
                        {[
                          { id: "shape", label: isHi ? "शेप" : "Shape", icon: <CircleIcon /> },
                          { id: "move", label: isHi ? "ड्रैग" : "Move", icon: <Move className="w-3.5 h-3.5" /> },
                          { id: "resize", label: isHi ? "रीसाइज" : "Resize", icon: <Maximize2 className="w-3.5 h-3.5" /> },
                          { id: "rotate", label: isHi ? "रोटेट" : "Rotate", icon: <RotateCw className="w-3.5 h-3.5" /> },
                          { id: "reset", label: isHi ? "रीसेट" : "Reset", icon: <RotateCcw className="w-3.5 h-3.5" /> }
                        ].map(tab => {
                          const isTabActive = posterActiveTab === tab.id;
                          return (
                            <button
                              key={tab.id}
                              onClick={() => {
                                if (tab.id === "reset") {
                                  if (editingElement === "photo") {
                                    setPosterZoom(1.0);
                                    setPosterFrameScale(1.0);
                                    setPosterOffsetX(0);
                                    setPosterOffsetY(0);
                                    setPosterShape(selectedPoster.defaultShape || "circle");
                                    setPosterRotation(0);
                                  } else {
                                    setPosterNameOffsetX(0);
                                    setPosterNameOffsetY(0);
                                    setPosterNameScale(1.0);
                                    setPosterNameRotation(0);
                                    setPosterNameShape("rounded-square");
                                  }
                                } else {
                                  setPosterActiveTab(tab.id as any);
                                }
                              }}
                              className={cn(
                                "flex flex-col items-center justify-center gap-1 py-2.5 border-b-2 text-[9px] font-sans font-black uppercase tracking-wider transition-all cursor-pointer",
                                isTabActive
                                  ? "border-amber-500 bg-amber-500/10 text-amber-400"
                                  : "border-transparent text-stone-400 hover:text-stone-200"
                              )}
                            >
                              {tab.icon}
                              <span>{tab.label}</span>
                            </button>
                          );
                        })}
                      </div>

                      {/* 4. ACTIVE PANEL CONTENT */}
                      <div className="p-4 space-y-4 bg-[#0c0300]">
                        
                        {/* Real-time name text editor */}
                        {editingElement === "name" && (
                          <div className="space-y-1 text-left border-b border-white/5 pb-3">
                            <span className="text-[10px] text-stone-400 font-bold uppercase tracking-wider block">
                              {isHi ? "नाम बदलें" : "Edit Name Text"}
                            </span>
                            <div className="relative">
                              <input
                                type="text"
                                maxLength={30}
                                placeholder={isHi ? "अपना नाम लिखें..." : "Type your name..."}
                                value={userName}
                                onChange={(e) => setUserName(e.target.value)}
                                className="w-full bg-black/45 border border-amber-500/20 focus:border-amber-500/45 rounded-xl py-2 px-3 text-xs text-amber-100 placeholder:text-amber-200/40 focus:outline-none tracking-wide font-sans font-medium"
                              />
                              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[9px] font-sans text-amber-500/80 font-bold">
                                {userName.length}/30
                              </span>
                            </div>
                          </div>
                        )}
                        
                        {/* shape panel */}
                        {posterActiveTab === "shape" && (
                          <div className="space-y-3">
                            {editingElement === "photo" ? (
                              <div className="space-y-1.5 text-left">
                                <span className="text-[10px] text-stone-400 font-bold uppercase tracking-wider block">
                                  {isHi ? "फोटो का आकार चुनें" : "Select Photo Shape"}
                                </span>
                                <div className="grid grid-cols-4 gap-1.5">
                                  {[
                                    { id: "circle", label: isHi ? "गोल" : "Circle" },
                                    { id: "square", label: isHi ? "चौकोर" : "Square" },
                                    { id: "rounded-square", label: isHi ? "सॉफ्ट" : "Rounded" },
                                    { id: "oval", label: isHi ? "ओवल" : "Oval" },
                                  ].map((s) => (
                                    <button
                                      key={s.id}
                                      onClick={() => setPosterShape(s.id as any)}
                                      className={cn(
                                        "py-1.5 rounded-lg border text-[9px] font-black uppercase tracking-wider transition-all cursor-pointer select-none",
                                        posterShape === s.id
                                          ? "bg-amber-500/15 border-amber-500 text-amber-300"
                                          : "bg-transparent border-white/5 hover:border-white/20 text-stone-400 hover:text-stone-200"
                                      )}
                                    >
                                      {s.label}
                                    </button>
                                  ))}
                                </div>
                              </div>
                            ) : (
                              <div className="space-y-1.5 text-left">
                                <span className="text-[10px] text-stone-400 font-bold uppercase tracking-wider block">
                                  {isHi ? "नाम पट्टी का आकार चुनें" : "Select Name Plate Shape"}
                                </span>
                                <div className="grid grid-cols-4 gap-1.5">
                                  {[
                                    { id: "circle", label: isHi ? "कैप्सूल" : "Capsule" },
                                    { id: "square", label: isHi ? "चौकोर" : "Square" },
                                    { id: "rounded-square", label: isHi ? "सॉफ्ट" : "Rounded" },
                                    { id: "oval", label: isHi ? "अंडाकार" : "Oval" },
                                  ].map((s) => (
                                    <button
                                      key={s.id}
                                      onClick={() => setPosterNameShape(s.id as any)}
                                      className={cn(
                                        "py-1.5 rounded-lg border text-[9px] font-black uppercase tracking-wider transition-all cursor-pointer select-none",
                                        posterNameShape === s.id
                                          ? "bg-amber-500/15 border-amber-500 text-amber-300"
                                          : "bg-transparent border-white/5 hover:border-white/20 text-stone-400 hover:text-stone-200"
                                      )}
                                    >
                                      {s.label}
                                    </button>
                                  ))}
                                </div>
                              </div>
                            )}
                          </div>
                        )}

                        {/* move panel (fine nudge arrows) */}
                        {posterActiveTab === "move" && (
                          <div className="flex flex-col items-center gap-1.5">
                            <span className="text-[9px] text-stone-400 font-bold uppercase tracking-wider block text-center mb-0.5">
                              {isHi ? `${editingElement === "photo" ? "फोटो" : "नाम"} पोजीशन फाइन-ट्यूनिंग` : `Fine-Tune ${editingElement === "photo" ? "Photo" : "Name"} Position`}
                            </span>
                            <div className="flex flex-col items-center gap-1">
                              <button 
                                onClick={() => {
                                  if (editingElement === "photo") setPosterOffsetY(prev => prev - 2);
                                  else setPosterNameOffsetY(prev => prev - 2);
                                }}
                                className="w-9 h-7 rounded-lg bg-white/5 hover:bg-white/10 flex items-center justify-center text-amber-400 border border-white/5 cursor-pointer active:scale-90"
                              >
                                ▲
                              </button>
                              <div className="flex gap-3">
                                <button 
                                  onClick={() => {
                                    if (editingElement === "photo") setPosterOffsetX(prev => prev - 2);
                                    else setPosterNameOffsetX(prev => prev - 2);
                                  }}
                                  className="w-9 h-7 rounded-lg bg-white/5 hover:bg-white/10 flex items-center justify-center text-amber-400 border border-white/5 cursor-pointer active:scale-90"
                                >
                                  ◀
                                </button>
                                <button 
                                  onClick={() => {
                                    if (editingElement === "photo") {
                                      setPosterOffsetX(0);
                                      setPosterOffsetY(0);
                                    } else {
                                      setPosterNameOffsetX(0);
                                      setPosterNameOffsetY(0);
                                    }
                                  }}
                                  className="px-2 h-7 rounded-lg bg-white/5 flex items-center justify-center text-[9px] text-stone-300 font-black uppercase tracking-wider border border-white/5 cursor-pointer"
                                >
                                  Center
                                </button>
                                <button 
                                  onClick={() => {
                                    if (editingElement === "photo") setPosterOffsetX(prev => prev + 2);
                                    else setPosterNameOffsetX(prev => prev + 2);
                                  }}
                                  className="w-9 h-7 rounded-lg bg-white/5 hover:bg-white/10 flex items-center justify-center text-amber-400 border border-white/5 cursor-pointer active:scale-90"
                                >
                                  ▶
                                </button>
                              </div>
                              <button 
                                onClick={() => {
                                  if (editingElement === "photo") setPosterOffsetY(prev => prev + 2);
                                  else setPosterNameOffsetY(prev => prev + 2);
                                }}
                                className="w-9 h-7 rounded-lg bg-white/5 hover:bg-white/10 flex items-center justify-center text-amber-400 border border-white/5 cursor-pointer active:scale-90"
                              >
                                ▼
                              </button>
                            </div>
                          </div>
                        )}

                        {/* resize panel */}
                        {posterActiveTab === "resize" && (
                          <div className="space-y-3">
                            {editingElement === "photo" ? (
                              <>
                                <div className="space-y-1 text-left">
                                  <div className="flex justify-between text-[10px] text-stone-400 font-bold uppercase tracking-wider">
                                    <span>{isHi ? "फ्रेम का आकार बदलें" : "Adjust Circle Size"}</span>
                                    <span className="font-sans text-amber-400">{posterFrameScale.toFixed(2)}x</span>
                                  </div>
                                  <div className="flex items-center gap-3">
                                    <button
                                      onClick={() => setPosterFrameScale(prev => Math.max(0.5, prev - 0.05))}
                                      className="w-6 h-6 rounded bg-white/5 hover:bg-white/10 flex items-center justify-center text-xs font-bold text-amber-300 cursor-pointer"
                                    >
                                      -
                                    </button>
                                    <input
                                      type="range"
                                      min="0.5"
                                      max="2.5"
                                      step="0.05"
                                      value={posterFrameScale}
                                      onChange={(e) => setPosterFrameScale(parseFloat(e.target.value))}
                                      className="flex-1 accent-amber-500 cursor-pointer h-1 bg-stone-900 rounded-lg appearance-none"
                                    />
                                    <button
                                      onClick={() => setPosterFrameScale(prev => Math.min(2.5, prev + 0.05))}
                                      className="w-6 h-6 rounded bg-white/5 hover:bg-white/10 flex items-center justify-center text-xs font-bold text-amber-300 cursor-pointer"
                                    >
                                      +
                                    </button>
                                  </div>
                                </div>

                                <div className="space-y-1 text-left">
                                  <div className="flex justify-between text-[10px] text-stone-400 font-bold uppercase tracking-wider">
                                    <span>{isHi ? "फोटो ज़ूम बदलें" : "Zoom Photo"}</span>
                                    <span className="font-sans text-amber-400">{posterZoom.toFixed(2)}x</span>
                                  </div>
                                  <div className="flex items-center gap-3">
                                    <button
                                      onClick={() => setPosterZoom(prev => Math.max(0.8, prev - 0.05))}
                                      className="w-6 h-6 rounded bg-white/5 hover:bg-white/10 flex items-center justify-center text-xs font-bold text-amber-300 cursor-pointer"
                                    >
                                      -
                                    </button>
                                    <input
                                      type="range"
                                      min="0.8"
                                      max="3.0"
                                      step="0.05"
                                      value={posterZoom}
                                      onChange={(e) => setPosterZoom(parseFloat(e.target.value))}
                                      className="flex-1 accent-amber-500 cursor-pointer h-1 bg-stone-900 rounded-lg appearance-none"
                                    />
                                    <button
                                      onClick={() => setPosterZoom(prev => Math.min(3.0, prev + 0.05))}
                                      className="w-6 h-6 rounded bg-white/5 hover:bg-white/10 flex items-center justify-center text-xs font-bold text-amber-300 cursor-pointer"
                                    >
                                      +
                                    </button>
                                  </div>
                                </div>
                              </>
                            ) : (
                              <div className="space-y-1 text-left">
                                <div className="flex justify-between text-[10px] text-stone-400 font-bold uppercase tracking-wider">
                                  <span>{isHi ? "नाम का आकार बदलें" : "Adjust Name Scale"}</span>
                                  <span className="font-sans text-amber-400">{posterNameScale.toFixed(2)}x</span>
                                </div>
                                <div className="flex items-center gap-3">
                                  <button
                                    onClick={() => setPosterNameScale(prev => Math.max(0.5, prev - 0.05))}
                                    className="w-6 h-6 rounded bg-white/5 hover:bg-white/10 flex items-center justify-center text-xs font-bold text-amber-300 cursor-pointer"
                                  >
                                    -
                                  </button>
                                  <input
                                    type="range"
                                    min="0.5"
                                    max="2.5"
                                    step="0.05"
                                    value={posterNameScale}
                                    onChange={(e) => setPosterNameScale(parseFloat(e.target.value))}
                                    className="flex-1 accent-amber-500 cursor-pointer h-1 bg-stone-900 rounded-lg appearance-none"
                                  />
                                  <button
                                    onClick={() => setPosterNameScale(prev => Math.min(2.5, prev + 0.05))}
                                    className="w-6 h-6 rounded bg-white/5 hover:bg-white/10 flex items-center justify-center text-xs font-bold text-amber-300 cursor-pointer"
                                  >
                                    +
                                  </button>
                                </div>
                              </div>
                            )}
                          </div>
                        )}

                        {/* rotate panel */}
                        {posterActiveTab === "rotate" && (
                          <div className="space-y-2.5 text-left">
                            <div className="flex justify-between text-[10px] text-stone-400 font-bold uppercase tracking-wider">
                              <span>{isHi ? `${editingElement === "photo" ? "फ्रेम" : "नाम"} रोटेशन` : `${editingElement === "photo" ? "Frame" : "Name"} Rotation`}</span>
                              <span className="font-sans text-amber-400">
                                {Math.round(((editingElement === "photo" ? posterRotation : posterNameRotation) * 180) / Math.PI)}°
                              </span>
                            </div>
                            <div className="flex items-center gap-3">
                              <button
                                onClick={() => {
                                  if (editingElement === "photo") setPosterRotation(prev => prev - (5 * Math.PI) / 180);
                                  else setPosterNameRotation(prev => prev - (5 * Math.PI) / 180);
                                }}
                                className="w-6 h-6 rounded bg-white/5 hover:bg-white/10 flex items-center justify-center text-xs font-bold text-amber-300 cursor-pointer"
                              >
                                ↺
                              </button>
                              <input
                                type="range"
                                min={-Math.PI}
                                max={Math.PI}
                                step={0.05}
                                value={editingElement === "photo" ? posterRotation : posterNameRotation}
                                onChange={(e) => {
                                  if (editingElement === "photo") setPosterRotation(parseFloat(e.target.value));
                                  else setPosterNameRotation(parseFloat(e.target.value));
                                }}
                                className="flex-1 accent-amber-500 cursor-pointer h-1 bg-stone-900 rounded-lg appearance-none"
                              />
                              <button
                                onClick={() => {
                                  if (editingElement === "photo") setPosterRotation(prev => prev + (5 * Math.PI) / 180);
                                  else setPosterNameRotation(prev => prev + (5 * Math.PI) / 180);
                                }}
                                className="w-6 h-6 rounded bg-white/5 hover:bg-white/10 flex items-center justify-center text-xs font-bold text-amber-300 cursor-pointer"
                              >
                                ↻
                              </button>
                            </div>
                          </div>
                        )}

                        {/* Action buttons done / cancel */}
                        <div className="flex gap-2 pt-2 border-t border-white/5">
                          <button
                            onClick={() => {
                              setIsEditingPhoto(false);
                            }}
                            className="flex-1 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-xs font-bold text-stone-300 uppercase tracking-wider cursor-pointer"
                          >
                            {isHi ? "रद्द करें" : "Cancel"}
                          </button>
                          <button
                            onClick={async () => {
                              setIsEditingPhoto(false);
                              if (selectedPoster) {
                                try {
                                  const url = await compilePoster(selectedPoster, generationType);
                                  setCompiledPosterUrl(url);
                                } catch (err) {
                                  console.error("Error updating compiler poster:", err);
                                }
                              }
                            }}
                            className="flex-1 py-2.5 rounded-xl bg-gradient-to-r from-orange-500 to-amber-500 text-stone-950 font-black text-xs uppercase tracking-wider shadow-lg shadow-orange-500/10 cursor-pointer"
                          >
                            {isHi ? "पूर्ण (Done)" : "Done"}
                          </button>
                        </div>

                      </div>
                    </div>
                  ) : (
                    <>
                      {/* Profile row + compact like */}
                      <div className="flex items-center justify-between" style={{ padding: "10px 16px 8px" }}>
                        {/* Left: Avatar + name + edit */}
                        <button
                          onClick={() => setShowProfileEdit(true)}
                          className="flex items-center cursor-pointer"
                          style={{ gap: 10, transition: "opacity 0.2s", background: "none", border: "none", padding: 0 }}
                          onMouseEnter={e => (e.currentTarget.style.opacity="0.8")}
                          onMouseLeave={e => (e.currentTarget.style.opacity="1")}
                        >
                          {/* Avatar — 56px, 1px gold ring */}
                          <div style={{
                            width: 56, height: 56, borderRadius: "50%",
                            border: "1px solid rgba(251,191,36,0.5)",
                            background: "#1b0a05",
                            overflow: "hidden",
                            display: "flex", alignItems: "center", justifyContent: "center",
                            flexShrink: 0,
                          }}>
                            {userPhoto ? (
                              <img src={userPhoto} alt="devotee" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                            ) : (
                              <span style={{ fontSize: 20, fontFamily: "serif", color: "rgba(251,191,36,0.55)" }}>ॐ</span>
                            )}
                          </div>
                          <div className="flex flex-col text-left">
                            <span style={{ fontSize: 10, fontFamily: "sans-serif", fontWeight: 600, color: "rgba(255,200,120,0.85)", lineHeight: 1, marginBottom: 4, letterSpacing: "0.04em" }}>
                              {isHi ? "श्रद्धालु" : "Devotee"}
                            </span>
                            <span style={{ fontSize: 16, fontFamily: "serif", fontWeight: 800, color: "#fef3c7", lineHeight: 1.1, letterSpacing: isHi ? "normal" : "0.01em" }}>
                              {userName.trim() || (isHi ? "हरि भक्त" : "Devotee")}
                            </span>
                            <span style={{ fontSize: 10, fontFamily: "sans-serif", fontWeight: 600, color: "rgba(251,191,36,0.85)", marginTop: 3 }}>
                              {isHi ? "बदलने के लिए टैप करें ›" : "Tap to edit ›"}
                            </span>
                          </div>
                        </button>
                      </div>

                      {userPhoto && (
                        <div style={{ padding: "0 16px 8px" }}>
                          <button
                            onClick={() => setIsEditingPhoto(true)}
                            className="w-full flex items-center justify-center gap-1.5 cursor-pointer shadow-md hover:scale-[1.01] active:scale-98"
                            style={{
                              height: 40,
                              borderRadius: 14,
                              background: "rgba(251,191,36,0.1)",
                              border: "1px solid rgba(251,191,36,0.3)",
                              color: "#fbbf24",
                              fontSize: 12,
                              fontFamily: "sans-serif",
                              fontWeight: 700,
                              letterSpacing: "0.02em",
                              transition: "all 0.2s",
                            }}
                          >
                            🎨 {isHi ? "पोस्टर एडिट करें" : "Edit That Poster"}
                          </button>
                        </div>
                      )}

                      {/* Hairline divider */}
                      <div style={{ height: "0.5px", background: "rgba(255,255,255,0.06)", margin: "0 16px 8px" }} />

                      {/* Action buttons row — equal height, 18px radius */}
                      <div className="flex items-stretch gap-2" style={{ padding: "0 16px 20px" }}>
                        {/* Download — outlined secondary */}
                        <button
                          onClick={handleDownloadPoster}
                          disabled={!compiledPosterUrl}
                          className="flex-1 flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-40"
                          style={{
                            height: 48,
                            borderRadius: 18,
                            background: "transparent",
                            border: "1.5px solid rgba(251,191,36,0.28)",
                            color: "rgba(251,191,36,0.85)",
                            fontSize: 12,
                            fontFamily: "sans-serif",
                            fontWeight: 700,
                            letterSpacing: "0.04em",
                            transition: "transform 0.2s ease, opacity 0.2s",
                          }}
                          onMouseDown={e => (e.currentTarget.style.transform="scale(0.98)")}
                          onMouseUp={e => (e.currentTarget.style.transform="scale(1)")}
                          onMouseLeave={e => (e.currentTarget.style.transform="scale(1)")}
                        >
                          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ width: 16, height: 16 }}>
                            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
                            <polyline points="7 10 12 15 17 10"/>
                            <line x1="12" y1="15" x2="12" y2="3"/>
                          </svg>
                          <span>{!compiledPosterUrl ? (isHi ? "तैयार हो रहा है..." : "Preparing...") : (isHi ? "डाउनलोड" : "Download")}</span>
                        </button>

                        {/* Share — filled primary */}
                        <button
                          onClick={() => setShowPosterShareModal(true)}
                          disabled={!compiledPosterUrl}
                          className="flex-[1.4] flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-40"
                          style={{
                            height: 48,
                            borderRadius: 18,
                            background: "linear-gradient(135deg, #e8960a 0%, #c97c04 100%)",
                            color: "#1a0500",
                            fontSize: 13,
                            fontFamily: "sans-serif",
                            fontWeight: 800,
                            letterSpacing: "0.02em",
                            transition: "transform 0.2s ease",
                          }}
                          onMouseDown={e => (e.currentTarget.style.transform="scale(0.98)")}
                          onMouseUp={e => (e.currentTarget.style.transform="scale(1)")}
                          onMouseLeave={e => (e.currentTarget.style.transform="scale(1)")}
                        >
                          <Share2 className="w-4 h-4" />
                          <span>{isHi ? "साझा करें" : "Share"}</span>
                        </button>
                      </div>
                    </>
                  )}
                </div>
              </motion.div>
            </div>
          </>
        )}
      </AnimatePresence>

      {/* ─── PROFILE EDIT BOTTOM SHEET ─── */}
      <AnimatePresence>
        {showProfileEdit && selectedPoster && (
          <>
            {/* Dim backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowProfileEdit(false)}
              className="fixed inset-0 z-[155]"
              style={{ background: "rgba(0,0,0,0.6)", backdropFilter: "blur(4px)" }}
            />
            {/* Sheet */}
            <motion.div
              initial={{ y: "100%", opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: "100%", opacity: 0 }}
              transition={{ type: "spring", damping: 30, stiffness: 260 }}
              className="fixed inset-x-0 bottom-0 z-[160] pointer-events-auto"
              style={{
                background: "linear-gradient(180deg, #120603 0%, #0a0200 100%)",
                borderTop: "1px solid rgba(251,191,36,0.25)",
                borderRadius: "28px 28px 0 0",
                padding: "8px 20px 32px",
                boxShadow: "0 -20px 60px rgba(0,0,0,0.8)",
              }}
            >
              {/* Drag handle */}
              <div className="flex justify-center pt-2 pb-4">
                <div style={{ width: 36, height: 4, borderRadius: 2, background: "rgba(251,191,36,0.25)" }} />
              </div>

              {/* Header */}
              <div className="flex items-center justify-between mb-5">
                <span style={{ fontSize: 14, fontFamily: "serif", fontWeight: 800, color: "#fef3c7", letterSpacing: "0.02em" }}>
                  {isHi ? "प्रोफ़ाइल बदलें" : "Edit Profile"}
                </span>
                <button
                  onClick={() => setShowProfileEdit(false)}
                  className="flex items-center justify-center active:scale-95 transition-all cursor-pointer"
                  style={{ width: 32, height: 32, borderRadius: "50%", background: "rgba(251,191,36,0.1)", border: "1px solid rgba(251,191,36,0.25)", color: "#fbbf24" }}
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Name input */}
              <div className="mb-5">
                <label style={{ fontSize: 10, fontFamily: "sans-serif", fontWeight: 900, textTransform: "uppercase", letterSpacing: "0.12em", color: "#fbbf24", display: "block", marginBottom: 8 }}>
                  {isHi ? "आपका नाम" : "Your Name"}
                </label>
                <div className="relative">
                  <UserIcon className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-amber-500/70" />
                  <input
                    type="text"
                    maxLength={30}
                    placeholder={isHi ? "अपना नाम दर्ज करें..." : "Enter your name..."}
                    value={userName}
                    onChange={(e) => setUserName(e.target.value)}
                    autoFocus
                    className="w-full focus:outline-none tracking-wide placeholder:text-amber-200/80"
                    style={{
                      background: "rgba(0,0,0,0.5)",
                      border: "1px solid rgba(251,191,36,0.25)",
                      borderRadius: 14,
                      padding: "13px 48px 13px 40px",
                      fontSize: 15,
                      fontFamily: "serif",
                      fontWeight: 600,
                      color: "#fef3c7",
                    }}
                  />
                  <span style={{ position: "absolute", right: 14, top: "50%", transform: "translateY(-50%)", fontSize: 9, color: "rgba(251,191,36,0.8)", fontWeight: 700 }}>
                    {userName.length}/30
                  </span>
                </div>
              </div>

              {/* Photo upload */}
              <div className="mb-6">
                <label style={{ fontSize: 10, fontFamily: "sans-serif", fontWeight: 900, textTransform: "uppercase", letterSpacing: "0.12em", color: "#fbbf24", display: "block", marginBottom: 8 }}>
                  {isHi ? "श्रद्धालु चित्र" : "Devotee Photo"}
                </label>
                <div className="flex items-center gap-3" style={{ background: "rgba(0,0,0,0.4)", border: "1px solid rgba(251,191,36,0.15)", borderRadius: 14, padding: "12px 14px" }}>
                  <div style={{ width: 46, height: 46, borderRadius: "50%", border: "2px solid rgba(251,191,36,0.45)", background: "#1b0a05", overflow: "hidden", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, boxShadow: "0 0 10px rgba(251,191,36,0.2)" }}>
                    {userPhoto ? <img src={userPhoto} alt="devotee" style={{ width: "100%", height: "100%", objectFit: "cover" }} /> : <span style={{ fontFamily: "serif", color: "rgba(251,191,36,0.55)", fontSize: 20 }}>ॐ</span>}
                  </div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <button
                      onClick={(e) => {
                        e.preventDefault();
                        if (profileEditFileInputRef.current) {
                          profileEditFileInputRef.current.value = "";
                        }
                        profileEditFileInputRef.current?.click();
                      }}
                      className="flex items-center gap-1.5 active:scale-95 transition-all cursor-pointer"
                      style={{ padding: "8px 14px", borderRadius: 10, background: "rgba(251,191,36,0.12)", border: "1px solid rgba(251,191,36,0.3)", color: "#fbbf24", fontSize: 11, fontFamily: "sans-serif", fontWeight: 900, textTransform: "uppercase", letterSpacing: "0.08em" }}
                    >
                      <Camera className="w-4 h-4" />
                      <span>{userPhoto ? (isHi ? "बदलें" : "Change") : (isHi ? "अपलोड करें" : "Upload Photo")}</span>
                    </button>
                    {userPhoto && (
                      <button
                        onClick={() => setUserPhoto(null)}
                        className="active:scale-95 transition-all cursor-pointer"
                        style={{ padding: "8px 14px", borderRadius: 10, background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.3)", color: "#f87171", fontSize: 11, fontFamily: "sans-serif", fontWeight: 900, textTransform: "uppercase" }}
                      >
                        {isHi ? "हटाएं" : "Remove"}
                      </button>
                    )}
                  </div>
                  <input type="file" ref={profileEditFileInputRef} accept="image/*" className="hidden"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) {
                        const reader = new FileReader();
                        reader.onload = (event) => {
                          if (event.target?.result) {
                            setCropImageSrc(event.target.result as string);
                            setCropTarget('user');
                            setCropModalOpen(true);
                          }
                        };
                        reader.readAsDataURL(file);
                      }
                    }}
                  />
                </div>
              </div>

              {/* Save button */}
              <button
                onClick={() => setShowProfileEdit(false)}
                className="w-full active:scale-[0.98] transition-all cursor-pointer flex items-center justify-center gap-2"
                style={{ padding: "15px", borderRadius: 16, background: "linear-gradient(135deg,#f59e0b,#d97706)", color: "#1a0500", fontSize: 14, fontFamily: "sans-serif", fontWeight: 900, textTransform: "uppercase", letterSpacing: "0.1em", boxShadow: "0 4px 20px rgba(245,158,11,0.35)" }}
              >
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" style={{ width: 16, height: 16 }}><polyline points="20 6 9 17 4 12"/></svg>
                <span>{isHi ? "सहेजें" : "Save Profile"}</span>
              </button>
            </motion.div>
          </>
        )}
      </AnimatePresence>



      {/* ─── SCREEN 5: SHARE TARGET BOTTOM SHEET ─── */}
      <AnimatePresence>
        {showPosterShareModal && selectedPoster && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowPosterShareModal(false)}
              className="fixed inset-0 bg-black/75 z-[150] backdrop-blur-sm"
            />

            {/* Bottom Sheet Drawer Container */}
            <motion.div
              initial={{ opacity: 0, y: "100%" }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: "100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="fixed inset-x-0 bottom-0 max-w-md mx-auto bg-gradient-to-b from-[#1c0d06] to-[#0e0502] border-t border-amber-500/30 rounded-t-[2.5rem] p-6 shadow-[0_-15px_40px_rgba(0,0,0,0.8)] z-[160] flex flex-col gap-5 pb-8 md:bottom-auto md:top-[30%] md:rounded-[2rem] md:border text-stone-200"
            >
              {/* Drag handle */}
              <div className="w-12 h-1 bg-amber-500/20 rounded-full mx-auto md:hidden" />

              <div className="flex justify-between items-center">
                <h3 className="font-serif text-base font-black text-amber-400 uppercase tracking-widest">
                  {isHi ? "पोस्टर साझा करें" : "Share Your Poster"}
                </h3>
                <button
                  onClick={() => setShowPosterShareModal(false)}
                  className="w-8 h-8 rounded-full bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/20 flex items-center justify-center text-amber-400 transition-colors"
                >
                  <X className="w-4.5 h-4.5" />
                </button>
              </div>

              {/* Social Channels Row */}
              <div className="flex justify-around items-center py-4 px-2 select-none">
                {/* WhatsApp */}
                <button
                  onClick={handleSharePosterNative}
                  className="flex flex-col items-center gap-2 group cursor-pointer"
                >
                  <div className="w-12 h-12 rounded-2xl bg-emerald-500/15 border border-emerald-500/20 text-emerald-400 flex items-center justify-center shadow transition-transform group-hover:scale-105 active:scale-95">
                    <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946C.06 5.348 5.397.01 12.008.01c3.202.001 6.212 1.246 8.477 3.514 2.266 2.268 3.507 5.28 3.505 8.484-.004 6.657-5.34 11.997-11.953 11.997-2.005-.001-3.973-.502-5.724-1.457L0 24zm6.59-4.846c1.6.95 3.188 1.449 4.825 1.451 5.436 0 9.86-4.37 9.864-9.799.002-2.63-1.023-5.101-2.885-6.965C16.59 1.977 14.113.951 12.008.951c-5.442 0-9.866 4.372-9.87 9.802 0 1.714.463 3.39 1.337 4.888l-.99 3.613 3.762-.97zm10.967-7.416c-.365-.18-2.164-1.057-2.499-1.179-.333-.124-.577-.186-.819.177-.243.363-.938 1.179-1.15 1.423-.21.244-.422.271-.787.09-3.57-1.782-4.73-2.614-6.47-5.625-.455-.783.455-.726 1.3-2.399.143-.285.072-.533-.036-.713-.108-.18-.819-1.974-1.122-2.705-.296-.715-.597-.619-.819-.631-.213-.011-.456-.013-.7-.013-.243 0-.639.09-1.004.495-.365.407-1.393 1.343-1.393 3.275 0 1.931 1.402 3.8 1.605 4.07.203.27 2.76 4.17 6.67 5.86 2.44 1.05 3.96 1.1 5.36.89 1.25-.19 2.499-.95 2.85-1.9.35-.95.35-1.76.24-1.93-.11-.17-.4-.27-.765-.45z"/>
                    </svg>
                  </div>
                  <span className="text-[9px] font-sans font-bold tracking-wide text-stone-300">WhatsApp</span>
                </button>

                {/* Instagram */}
                <button
                  onClick={() => {
                    toast.info(isHi ? "इंस्टाग्राम स्टोरी हेतु पोस्टर डाउनलोड हो रहा है!" : "Downloading poster for Instagram story!");
                    handleDownloadPoster();
                  }}
                  className="flex flex-col items-center gap-2 group cursor-pointer"
                >
                  <div className="w-12 h-12 rounded-2xl bg-pink-500/15 border border-pink-500/20 text-pink-400 flex items-center justify-center shadow transition-transform group-hover:scale-105 active:scale-95">
                    <svg className="w-5.5 h-5.5" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.051.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z"/>
                    </svg>
                  </div>
                  <span className="text-[9px] font-sans font-bold tracking-wide text-stone-300">Instagram</span>
                </button>

                {/* Facebook */}
                <button
                  onClick={handleSharePosterNative}
                  className="flex flex-col items-center gap-2 group cursor-pointer"
                >
                  <div className="w-12 h-12 rounded-2xl bg-blue-600/15 border border-blue-600/20 text-blue-400 flex items-center justify-center shadow transition-transform group-hover:scale-105 active:scale-95">
                    <svg className="w-5.5 h-5.5" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                    </svg>
                  </div>
                  <span className="text-[9px] font-sans font-bold tracking-wide text-stone-300">Facebook</span>
                </button>

                {/* More */}
                <button
                  onClick={handleSharePosterNative}
                  className="flex flex-col items-center gap-2 group cursor-pointer"
                >
                  <div className="w-12 h-12 rounded-2xl bg-stone-500/15 border border-stone-500/20 text-stone-400 flex items-center justify-center shadow transition-transform group-hover:scale-105 active:scale-95">
                    <MoreIcon className="w-5.5 h-5.5" />
                  </div>
                  <span className="text-[9px] font-sans font-bold tracking-wide text-stone-300">{isHi ? "अन्य" : "More"}</span>
                </button>
              </div>

              {/* Direct Download CTA */}
              <div className="w-full flex flex-col gap-2.5 mt-2">
                <button
                  onClick={handleDownloadPoster}
                  className="w-full py-3.5 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-stone-950 font-sans font-black text-xs uppercase tracking-widest rounded-xl transition-all active:scale-[0.97] flex items-center justify-center gap-1.5 focus:outline-none shadow-md cursor-pointer"
                >
                  <Download className="w-4 h-4 text-stone-950" />
                  <span>{isHi ? "पावन पोस्टर डाउनलोड करें" : "Download HD Poster"}</span>
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      <ImageCropModal
        isOpen={cropModalOpen}
        imageSrc={cropImageSrc}
        onClose={() => {
          setCropModalOpen(false);
          setCropImageSrc(null);
        }}
        isHi={isHi}
        onCropComplete={(croppedBase64) => {
          setCropModalOpen(false);
          setCropImageSrc(null);
          if (cropTarget === 'temp') {
            setTempPhoto(croppedBase64);
          } else {
            setUserPhoto(croppedBase64);
            toast.success(isHi ? "फोटो अपलोड हो गई!" : "Photo uploaded!");
          }
        }}
      />

      {showEditorModal && selectedPoster && userPhoto && (
        <BlessingsPosterEditor
          isOpen={showEditorModal}
          onClose={() => setShowEditorModal(false)}
          poster={selectedPoster}
          userPhoto={userPhoto}
          initialZoom={posterZoom}
          initialFrameScale={posterFrameScale}
          initialOffsetX={posterOffsetX}
          initialOffsetY={posterOffsetY}
          initialShape={posterShape}
          initialRotation={posterRotation}
          onSave={async ({ zoom, frameScale, offsetX, offsetY, shape, rotation }) => {
            setPosterZoom(zoom);
            setPosterFrameScale(frameScale);
            setPosterOffsetX(offsetX);
            setPosterOffsetY(offsetY);
            setPosterShape(shape);
            setPosterRotation(rotation);
            setShowEditorModal(false);
            
            // Recompile poster URL in background
            if (selectedPoster) {
              try {
                const url = await compilePoster(selectedPoster, generationType);
                setCompiledPosterUrl(url);
              } catch (err) {
                console.error("Error updating compiler poster:", err);
              }
            }
          }}
          language={language}
        />
      )}

    </div>
  );
}
