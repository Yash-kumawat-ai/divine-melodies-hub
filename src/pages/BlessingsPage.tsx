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
  Music, 
  Check, 
  X, 
  Volume2, 
  VolumeX,
  Bell,
  Heart,
  Award,
  BookOpen
} from "lucide-react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useLanguage } from "@/hooks/useLanguage";
import { useAuth } from "@/hooks/useAuth";
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
  { id: "wp-shiva-2", deity: "Shiva", name: "Shiv Temple Darshan", nameHindi: "शिव मंदिर दर्शन", imageUrl: shivTempleHdImg, tier: "devotee" },
  { id: "wp-shiva-3", deity: "Shiva", name: "Meditating Shiva", nameHindi: "ध्यानमग्न शिव", imageUrl: shivWallpaperImg, tier: "mahabhakt" },
  { id: "wp-ram-1", deity: "Rama", name: "Shree Ram Darshan", nameHindi: "श्री राम दर्शन", imageUrl: deityRamImg, tier: "free" },
  { id: "wp-ram-2", deity: "Rama", name: "Shree Ram Darbar HD", nameHindi: "श्री राम दरबार एचडी", imageUrl: shreeRamImg, tier: "devotee" },
  { id: "wp-krishna-1", deity: "Krishna", name: "Banke Bihari Devotion", nameHindi: "बांके बिहारी भक्ति", imageUrl: krishnaImg, tier: "free" },
  { id: "wp-krishna-2", deity: "Krishna", name: "Radha Krishna Mayapur", nameHindi: "राधा कृष्ण मायापुर", imageUrl: radhaKrishnaImg, tier: "mahabhakt" },
  { id: "wp-krishna-3", deity: "Krishna", name: "Krishna Mobile Wallpaper", nameHindi: "कृष्ण मोबाइल वॉलपेपर", imageUrl: krishnaMobileImg, tier: "devotee" },
  { id: "wp-hanuman-1", deity: "Hanuman", name: "Hanumanji HD Portrait", nameHindi: "हनुमानजी एचडी पोर्ट्रेट", imageUrl: hanumanImg, tier: "free" },
  { id: "wp-shyam-1", deity: "Khatu Shyam", name: "Shyam Mandir Desktop", nameHindi: "श्याम मंदिर डेस्कटॉप", imageUrl: shyamMandirImg, tier: "mahabhakt" }
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

export default function BlessingsPage() {
  const navigate = useNavigate();
  const { language } = useLanguage();
  const { profile } = useAuth();
  const isHi = language === "hi";

  const userTier = profile?.subscription_tier || "free";

  // Today's deity resolution
  const todayDay = new Date().getDay();
  const todayDarshan = DAILY_DARSHANS[todayDay] || DAILY_DARSHANS[1];

  // UI state variables
  const [searchParams, setSearchParams] = useSearchParams();
  const tabParam = searchParams.get("tab");
  const [activeTab, setActiveTab] = useState<"maker" | "wallpapers" | "saved">(() => {
    if (tabParam === "maker" || tabParam === "wallpapers" || tabParam === "saved") {
      return tabParam;
    }
    return "wallpapers"; // Default to wallpapers for /wallpaper page
  });

  useEffect(() => {
    setSearchParams({ tab: activeTab });
  }, [activeTab, setSearchParams]);
  const [userName, setUserName] = useState("");
  const [blessingType, setBlessingType] = useState<"self" | "parents" | "family" | "friends" | "universal">("self");
  const [userPhoto, setUserPhoto] = useState<string | null>(null);
  const [selectedTemplate, setSelectedTemplate] = useState<"golden" | "crimson" | "peacock" | "white">("golden");
  const [generationType, setGenerationType] = useState<"status" | "square">("status"); // vertical is recommended for WhatsApp status
  const [savedBlessings, setSavedBlessings] = useState<string[]>([]);
  const [streakCount, setStreakCount] = useState(0);
  const [completedDates, setCompletedDates] = useState<string[]>([]);
  
  // Interactive Puja Seva states
  const [isBellRinging, setIsBellRinging] = useState(false);
  const [isDiyaLit, setIsDiyaLit] = useState(false);
  const [petals, setPetals] = useState<Petal[]>([]);
  const [isAudioPlaying, setIsAudioPlaying] = useState(false);
  
  // Modals & Navigation hooks
  const [showPreviewModal, setShowPreviewModal] = useState<string | null>(null);
  const [showPremiumTplModal, setShowPremiumTplModal] = useState<string | null>(null);

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
      currentStreak = 1;
    }

    setStreakCount(currentStreak);
    localStorage.setItem("hk_streak_count_v1", String(currentStreak));
    localStorage.setItem("hk_streak_date_v1", todayStr);

    playCompletionChime(0.4);
    toast.success(
      isHi 
        ? `दैनिक दर्शन पूर्ण! साधना सूत्र +1 दिन (${currentStreak} दिन streak) 🪔`
        : `Nitya Darshan Complete! Sadhana streak +1 (${currentStreak} days streak) 🪔`
    );
  };

  // ─── PUJA SEVA TRIGGERS ──────────────────────────────────────────
  const triggerBell = () => {
    setIsBellRinging(true);
    playMeditationBell(0.5);
    setTimeout(() => setIsBellRinging(false), 900);
    completeTodaySadhana();
  };

  const toggleDiya = () => {
    setIsDiyaLit(!isDiyaLit);
    if (!isDiyaLit) {
      playCompletionChime(0.3);
      toast.success(isHi ? "प्रसन्नता! आपने मंदिर दीप जला दिया है।" : "Beautiful! You have lit the temple lamp.");
      completeTodaySadhana();
    }
  };

  const triggerFlowers = () => {
    playMeditationBell(0.3);
    const emojis = ["🌸", "🌼", "🌹", "🏵️", "🌺"];
    const newPetals = Array.from({ length: 25 }).map((_, i) => ({
      id: Date.now() + i,
      x: Math.random() * 100,
      delay: Math.random() * 1.5,
      duration: 3.5 + Math.random() * 2.5,
      size: 18 + Math.random() * 16,
      emoji: emojis[Math.floor(Math.random() * emojis.length)]
    }));

    setPetals((prev) => [...prev, ...newPetals]);
    setTimeout(() => {
      setPetals((prev) => prev.filter(p => !newPetals.includes(p)));
    }, 7000);

    completeTodaySadhana();
  };

  const toggleAudio = () => {
    if (isAudioPlaying) {
      droneRef.current?.stop();
      setIsAudioPlaying(false);
    } else {
      droneRef.current?.start();
      setIsAudioPlaying(true);
      toast.info(isHi ? "मंत्र और तानपुरा ध्वनि आरंभ" : "Ambient tanpura & mantra drone active");
    }
  };

  // Image Upload handler
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

  // Premium lock check helper
  const isTemplateLocked = (tpl: "golden" | "crimson" | "peacock" | "white") => {
    if (tpl === "crimson" && userTier === "free") return true;
    if (tpl === "peacock" && userTier !== "mahabhakt") return true;
    return false;
  };

  // Helper to draw custom corner ornaments on canvas
  const drawCornerOrnaments = (ctx: CanvasRenderingContext2D, w: number, h: number, offset: number, color: string) => {
    ctx.strokeStyle = color;
    ctx.lineWidth = 4;
    const size = 32;
    
    const drawDot = (cx: number, cy: number) => {
      ctx.fillStyle = color;
      ctx.beginPath();
      ctx.arc(cx, cy, 6, 0, Math.PI * 2);
      ctx.fill();
    };

    // Top-left
    ctx.beginPath();
    ctx.moveTo(offset, offset + size);
    ctx.lineTo(offset, offset);
    ctx.lineTo(offset + size, offset);
    ctx.stroke();
    drawDot(offset + 8, offset + 8);
    
    // Top-right
    ctx.beginPath();
    ctx.moveTo(w - offset, offset + size);
    ctx.lineTo(w - offset, offset);
    ctx.lineTo(w - offset - size, offset);
    ctx.stroke();
    drawDot(w - offset - 8, offset + 8);
    
    // Bottom-left
    ctx.beginPath();
    ctx.moveTo(offset, h - offset - size);
    ctx.lineTo(offset, h - offset);
    ctx.lineTo(offset + size, h - offset);
    ctx.stroke();
    drawDot(offset + 8, h - offset - 8);
    
    // Bottom-right
    ctx.beginPath();
    ctx.moveTo(w - offset, h - offset - size);
    ctx.lineTo(w - offset, h - offset);
    ctx.lineTo(w - offset - size, h - offset);
    ctx.stroke();
    drawDot(w - offset - 8, h - offset - 8);
  };

  // ─── CANVAS CARD COMPILER ────────────────────────────────────────
  const generateImage = (tplOverride?: typeof selectedTemplate, formatOverride?: typeof generationType): Promise<string> => {
    return new Promise((resolve, reject) => {
      const canvas = canvasRef.current;
      if (!canvas) {
        toast.error("Graphics compiler not initialized.");
        return reject("No canvas context");
      }

      const ctx = canvas.getContext("2d");
      if (!ctx) return reject("No 2d context");

      const tpl = tplOverride || selectedTemplate;
      const format = formatOverride || generationType;
      
      const W = 1080;
      const H = format === "square" ? 1080 : 1920; // 9:16 vertical ratio for WhatsApp status
      canvas.width = W;
      canvas.height = H;

      // Dark blank loading slate
      ctx.fillStyle = "#120603";
      ctx.fillRect(0, 0, W, H);

      // Load background deity image
      const bgImg = new Image();
      bgImg.crossOrigin = "anonymous";
      bgImg.src = todayDarshan.imageUrl;

      bgImg.onload = () => {
        // Draw covered deity background
        const bgAspect = bgImg.width / bgImg.height;
        const canvasAspect = W / H;
        let drawW = W;
        let drawH = H;
        let ox = 0;
        let oy = 0;

        if (bgAspect > canvasAspect) {
          drawW = H * bgAspect;
          ox = (W - drawW) / 2;
        } else {
          drawH = W / bgAspect;
          oy = (H - drawH) / 2;
        }

        ctx.drawImage(bgImg, ox, oy, drawW, drawH);

        // Draw vignette gradient mask
        const vignette = ctx.createLinearGradient(0, H * 0.2, 0, H);
        if (tpl === "crimson") {
          vignette.addColorStop(0, "rgba(22, 5, 8, 0.15)");
          vignette.addColorStop(0.6, "rgba(55, 10, 18, 0.82)");
          vignette.addColorStop(1, "rgba(24, 4, 8, 0.98)");
        } else if (tpl === "peacock") {
          vignette.addColorStop(0, "rgba(2, 18, 16, 0.15)");
          vignette.addColorStop(0.6, "rgba(4, 44, 40, 0.84)");
          vignette.addColorStop(1, "rgba(2, 20, 18, 0.98)");
        } else if (tpl === "white") {
          vignette.addColorStop(0, "rgba(255, 255, 255, 0.04)");
          vignette.addColorStop(0.55, "rgba(22, 28, 45, 0.78)");
          vignette.addColorStop(1, "rgba(10, 15, 30, 0.96)");
        } else { // golden
          vignette.addColorStop(0, "rgba(18, 8, 4, 0.15)");
          vignette.addColorStop(0.5, "rgba(28, 12, 4, 0.82)");
          vignette.addColorStop(1, "rgba(15, 5, 2, 0.98)");
        }
        ctx.fillStyle = vignette;
        ctx.fillRect(0, 0, W, H);

        // Draw decorative framing borders
        const borderOffset = format === "square" ? 22 : 36;
        if (tpl === "golden") {
          ctx.strokeStyle = "#fbbf24";
          ctx.lineWidth = format === "square" ? 18 : 28;
          ctx.strokeRect(ctx.lineWidth / 2, ctx.lineWidth / 2, W - ctx.lineWidth, H - ctx.lineWidth);
          
          ctx.strokeStyle = "rgba(255, 255, 255, 0.15)";
          ctx.lineWidth = 2;
          ctx.strokeRect(borderOffset, borderOffset, W - borderOffset * 2, H - borderOffset * 2);
          drawCornerOrnaments(ctx, W, H, borderOffset, "#fbbf24");
        } else if (tpl === "crimson") {
          ctx.strokeStyle = "#b91c1c"; // deep red
          ctx.lineWidth = format === "square" ? 18 : 28;
          ctx.strokeRect(ctx.lineWidth / 2, ctx.lineWidth / 2, W - ctx.lineWidth, H - ctx.lineWidth);
          
          ctx.strokeStyle = "#fbbf24"; // gold inner border
          ctx.lineWidth = 3;
          ctx.strokeRect(borderOffset, borderOffset, W - borderOffset * 2, H - borderOffset * 2);
          drawCornerOrnaments(ctx, W, H, borderOffset, "#fbbf24");
        } else if (tpl === "peacock") {
          ctx.strokeStyle = "#0f766e"; // emerald teal
          ctx.lineWidth = format === "square" ? 18 : 28;
          ctx.strokeRect(ctx.lineWidth / 2, ctx.lineWidth / 2, W - ctx.lineWidth, H - ctx.lineWidth);
          
          ctx.strokeStyle = "#f59e0b"; // gold inner border
          ctx.lineWidth = 3;
          ctx.strokeRect(borderOffset, borderOffset, W - borderOffset * 2, H - borderOffset * 2);
          drawCornerOrnaments(ctx, W, H, borderOffset, "#fbbf24");
        } else if (tpl === "white") {
          ctx.strokeStyle = "#94a3b8"; // slate
          ctx.lineWidth = format === "square" ? 12 : 20;
          ctx.strokeRect(ctx.lineWidth / 2, ctx.lineWidth / 2, W - ctx.lineWidth, H - ctx.lineWidth);
          
          ctx.strokeStyle = "rgba(255, 255, 255, 0.2)";
          ctx.lineWidth = 2;
          ctx.strokeRect(borderOffset, borderOffset, W - borderOffset * 2, H - borderOffset * 2);
          drawCornerOrnaments(ctx, W, H, borderOffset, "#cbd5e1");
        }

        // Draw sacred headers
        ctx.textAlign = "center";
        ctx.fillStyle = "#ffffff";
        ctx.font = `bold ${format === "square" ? "42px" : "48px"} serif`;
        ctx.fillText(
          isHi ? `🙏 आज का दिव्य दर्शन 🙏` : `🙏 Today's Daily Darshan 🙏`, 
          W / 2, 
          format === "square" ? 95 : 170
        );

        ctx.fillStyle = tpl === "white" ? "#cbd5e1" : "#fbbf24";
        ctx.font = `italic ${format === "square" ? "26px" : "32px"} Georgia, serif`;
        const deityTitle = isHi ? todayDarshan.deityHindi : todayDarshan.deity;
        const templeTitle = isHi ? todayDarshan.templeNameHindi : todayDarshan.templeName;
        ctx.fillText(
          `${deityTitle} • ${templeTitle}`, 
          W / 2, 
          format === "square" ? 140 : 225
        );

        // Circular custom devotee photo frame
        const hasPhoto = !!userPhoto;
        const sizeAvatar = format === "square" ? 170 : 210;
        const avatarY = format === "square" ? 310 : 450;
        const avatarX = W / 2;

        const drawQuotesAndNames = () => {
          // Wrapped blessing quote
          ctx.textAlign = "center";
          ctx.fillStyle = "#ffffff";
          ctx.font = `italic ${format === "square" ? "30px" : "36px"} Georgia, serif`;
          
          const textQuote = isHi ? todayDarshan.quoteHindi : todayDarshan.quote;
          const words = textQuote.split(" ");
          let phrase = "";
          const lines = [];
          const maxTextWidth = W - 180;
          const heightLine = format === "square" ? 44 : 52;

          for (let n = 0; n < words.length; n++) {
            const testPhrase = phrase + words[n] + " ";
            const metrics = ctx.measureText(testPhrase);
            if (metrics.width > maxTextWidth && n > 0) {
              lines.push(phrase);
              phrase = words[n] + " ";
            } else {
              phrase = testPhrase;
            }
          }
          lines.push(phrase);

          let currentY = format === "square" ? 560 : 880;
          lines.slice(0, 3).forEach((line) => {
            ctx.fillText(line.trim(), W / 2, currentY);
            currentY += heightLine;
          });

          // Blessing Target Banner
          let bannerText = "";
          if (userName.trim()) {
            const name = userName.trim();
            if (blessingType === "parents") {
              bannerText = isHi ? `${name} एवं माता-पिता हेतु आशीर्वाद` : `Blessings for ${name} & Parents`;
            } else if (blessingType === "family") {
              bannerText = isHi ? `${name} एवं सपरिवार हेतु आशीर्वाद` : `Blessings for ${name} & Family`;
            } else if (blessingType === "friends") {
              bannerText = isHi ? `${name} एवं मित्रों हेतु आशीर्वाद` : `Blessings for ${name} & Friends`;
            } else if (blessingType === "universal") {
              bannerText = isHi ? `सर्वे भवन्तु सुखिनः (द्वारा: ${name})` : `Peace & Blessings for All (by ${name})`;
            } else {
              bannerText = isHi ? `${name} जी हेतु आशीर्वाद` : `Blessings for ${name}`;
            }
          } else {
            if (blessingType === "parents") {
              bannerText = isHi ? "माता-पिता हेतु दिव्य आशीर्वाद" : "Divine Blessings for Parents";
            } else if (blessingType === "family") {
              bannerText = isHi ? "परिवार हेतु दिव्य आशीर्वाद" : "Divine Blessings for Family";
            } else if (blessingType === "friends") {
              bannerText = isHi ? "प्रिय मित्रों हेतु दिव्य आशीर्वाद" : "Divine Blessings for Friends";
            } else if (blessingType === "universal") {
              bannerText = isHi ? "सर्वे भवन्तु सुखिनः (विश्व शांति)" : "Peace & Blessings for All";
            } else {
              bannerText = isHi ? "हरि भक्त हेतु दिव्य आशीर्वाद" : "Divine Blessings for Devotee";
            }
          }

          // Render Golden Text Box
          const nameY = format === "square" ? 760 : 1240;
          ctx.fillStyle = "rgba(251, 191, 36, 0.08)";
          ctx.strokeStyle = "rgba(251, 191, 36, 0.25)";
          ctx.lineWidth = 3;
          ctx.font = `bold ${format === "square" ? "34px" : "40px"} serif`;
          const textW = ctx.measureText(bannerText).width;
          const boxW = Math.min(W - 200, textW + 80);

          ctx.beginPath();
          ctx.roundRect(W / 2 - boxW / 2, nameY - 48, boxW, 76, 16);
          ctx.fill();
          ctx.stroke();

          ctx.fillStyle = tpl === "white" ? "#e2e8f0" : "#fbbf24";
          ctx.fillText(bannerText, W / 2, nameY + 4);

          // Render Diya indicator on card if user enabled virtual diya
          if (isDiyaLit) {
            const diyaImage = new Image();
            diyaImage.src = litDiyaImg;
            diyaImage.onload = () => {
              const dw = format === "square" ? 120 : 150;
              const dh = format === "square" ? 90 : 112;
              const dx = W / 2 - dw / 2;
              const dy = format === "square" ? 850 : 1380;
              ctx.drawImage(diyaImage, dx, dy, dw, dh);
              
              // Draw Watermark attribution at bottom
              ctx.fillStyle = "rgba(255, 255, 255, 0.35)";
              ctx.font = `bold ${format === "square" ? "18px" : "24px"} sans-serif`;
              ctx.fillText("✨ Created with Raghavam", W / 2, H - (format === "square" ? 50 : 100));

              resolve(canvas.toDataURL("image/png"));
            };
            diyaImage.onerror = () => {
              ctx.fillStyle = "rgba(255, 255, 255, 0.35)";
              ctx.font = `bold ${format === "square" ? "18px" : "24px"} sans-serif`;
              ctx.fillText("✨ Created with Raghavam", W / 2, H - (format === "square" ? 50 : 100));
              resolve(canvas.toDataURL("image/png"));
            };
          } else {
            // Draw Watermark attribution at bottom without Diya
            ctx.fillStyle = "rgba(255, 255, 255, 0.35)";
            ctx.font = `bold ${format === "square" ? "18px" : "24px"} sans-serif`;
            ctx.fillText("✨ Created with Raghavam", W / 2, H - (format === "square" ? 50 : 100));

            resolve(canvas.toDataURL("image/png"));
          }
        };

        if (hasPhoto) {
          const userImg = new Image();
          userImg.src = userPhoto!;
          userImg.onload = () => {
            ctx.save();
            ctx.beginPath();
            ctx.arc(avatarX, avatarY, sizeAvatar / 2, 0, Math.PI * 2);
            ctx.closePath();
            ctx.clip();

            const aspect = userImg.width / userImg.height;
            let uw = sizeAvatar;
            let uh = sizeAvatar;
            let ux = avatarX - sizeAvatar / 2;
            let uy = avatarY - sizeAvatar / 2;

            if (aspect > 1) {
              uw = sizeAvatar * aspect;
              ux = avatarX - uw / 2;
            } else {
              uh = sizeAvatar / aspect;
              uy = avatarY - uh / 2;
            }

            ctx.drawImage(userImg, ux, uy, uw, uh);
            ctx.restore();

            // Circular golden border
            ctx.strokeStyle = tpl === "white" ? "#cbd5e1" : "#fbbf24";
            ctx.lineWidth = 4;
            ctx.beginPath();
            ctx.arc(avatarX, avatarY, sizeAvatar / 2, 0, Math.PI * 2);
            ctx.stroke();

            drawQuotesAndNames();
          };
          userImg.onerror = () => drawQuotesAndNames();
        } else {
          // Default OM medallion
          ctx.fillStyle = tpl === "white" ? "rgba(203, 213, 225, 0.12)" : "rgba(251, 191, 36, 0.12)";
          ctx.beginPath();
          ctx.arc(avatarX, avatarY, 60, 0, Math.PI * 2);
          ctx.fill();

          ctx.fillStyle = tpl === "white" ? "#e2e8f0" : "#fbbf24";
          ctx.font = "bold 56px serif";
          ctx.fillText("ॐ", avatarX, avatarY + 18);
          drawQuotesAndNames();
        }
      };

      bgImg.onerror = (err) => reject(err);
    });
  };

  // Trigger file download locally
  const handleDownload = async () => {
    // Intercept premium locks
    if (isTemplateLocked(selectedTemplate)) {
      setShowPremiumTplModal(selectedTemplate);
      return;
    }

    try {
      toast.info(isHi ? "छवि तैयार की जा रही है..." : "Generating blessing card...");
      const dataUrl = await generateImage();
      
      const link = document.createElement("a");
      link.download = `${todayDarshan.deity.replace(/\s+/g, "_")}_Daily_Blessing.png`;
      link.href = dataUrl;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      // Save locally to history
      saveCardLocally(dataUrl);
      completeTodaySadhana();
      toast.success(isHi ? "आशीर्वाद कार्ड गैलरी में सेव हो गया!" : "Blessing downloaded & saved locally!");
    } catch (err) {
      console.error(err);
      toast.error(isHi ? "डाउनलोड करने में विफल" : "Failed to compile image.");
    }
  };

  // WhatsApp / Web Share trigger
  const handleShare = async () => {
    // Intercept premium locks
    if (isTemplateLocked(selectedTemplate)) {
      setShowPremiumTplModal(selectedTemplate);
      return;
    }

    try {
      toast.info(isHi ? "साझा करने के लिए छवि तैयार हो रही है..." : "Compiling image to share...");
      const dataUrl = await generateImage();

      const res = await fetch(dataUrl);
      const blob = await res.blob();
      const file = new File([blob], "Raghavam_Blessing.png", { type: "image/png" });

      if (navigator.canShare && navigator.canShare({ files: [file] })) {
        await navigator.share({
          files: [file],
          title: isHi ? `${todayDarshan.deityHindi} दर्शन` : `${todayDarshan.deity} Darshan`,
          text: isHi 
            ? `राघवम् से प्राप्त करें आज का ${todayDarshan.deityHindi} आशीर्वाद दर्शन।` 
            : `Receive today's divine ${todayDarshan.deity} blessing from Raghavam.`,
        });
        completeTodaySadhana();
        toast.success(isHi ? "सफलतापूर्वक साझा किया गया!" : "Shared successfully!");
      } else {
        // Fallback: Copy to clipboard and download
        navigator.clipboard.writeText(window.location.href);
        toast.info(
          isHi 
            ? "शेयर लिंक क्लिपबोर्ड पर कॉपी हो गया! इमेज डाउनलोड की जा रही है।" 
            : "Web share unsupported on this browser. Link copied! Saving image to device."
        );
        handleDownload();
      }
    } catch (err) {
      console.error("Sharing failed", err);
      handleDownload();
    }
  };

  const saveCardLocally = (url: string) => {
    try {
      const newList = [url, ...savedBlessings].slice(0, 16); // keep 16
      setSavedBlessings(newList);
      localStorage.setItem("hk_saved_blessings_v2", JSON.stringify(newList));
    } catch (_) {}
  };

  // Wallpaper download
  const handleWallpaperAction = (wp: DevotionalWallpaper) => {
    const isLocked = wp.tier !== "free" && userTier === "free";
    if (isLocked) {
      setShowPreviewModal(wp.id);
    } else {
      toast.info(isHi ? "वॉलपेपर डाउनलोड हो रहा है..." : "Downloading wallpaper...");
      const link = document.createElement("a");
      link.download = `${wp.name.replace(/\s+/g, "_")}_HD.webp`;
      link.href = wp.imageUrl;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      completeTodaySadhana();
      toast.success(isHi ? "वॉलपेपर डाउनलोड हो गया!" : "Wallpaper downloaded!");
    }
  };

  const navigateToPricing = () => {
    setShowPreviewModal(null);
    setShowPremiumTplModal(null);
    navigate("/pricing");
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#180a06] via-[#0d0502] to-[#120603] text-amber-100 flex flex-col font-serif select-none relative overflow-x-hidden">
      
      {/* ─── FLOWER PETALS OVERLAY ────────────────────────────────────── */}
      {petals.map((petal) => (
        <span
          key={petal.id}
          className="fixed pointer-events-none z-50 animate-petal text-xl select-none"
          style={{
            left: `${petal.x}%`,
            animationDelay: `${petal.delay}s`,
            animationDuration: `${petal.duration}s`,
            fontSize: `${petal.size}px`,
            top: `-50px`,
          }}
        >
          {petal.emoji}
        </span>
      ))}
      
      <style>{`
        @keyframes fall {
          0% {
            transform: translateY(-50px) rotate(0deg);
            opacity: 1;
          }
          90% {
            opacity: 1;
          }
          100% {
            transform: translateY(105vh) rotate(360deg);
            opacity: 0;
          }
        }
        .animate-petal {
          animation: fall linear forwards;
        }

        @keyframes flame-flicker {
          0%, 100% { 
            transform: scale(1) rotate(-1deg); 
            filter: drop-shadow(0 0 3px rgba(251, 146, 60, 0.7)) drop-shadow(0 0 8px rgba(251, 191, 36, 0.5)); 
          }
          50% { 
            transform: scale(1.08) rotate(2deg); 
            filter: drop-shadow(0 0 6px rgba(251, 146, 60, 0.9)) drop-shadow(0 0 14px rgba(251, 191, 36, 0.7)); 
          }
        }
        .animate-flame {
          animation: flame-flicker 0.15s ease-in-out infinite;
        }
      `}</style>

      {/* ─── HIDDEN CANVAS ────────────────────────────────────────────── */}
      <canvas ref={canvasRef} className="hidden" />

      {/* ─── HEADER BAR ───────────────────────────────────────────────── */}
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

        {/* Sadhana Streak Badge */}
        <div className="flex items-center gap-1.5 bg-amber-500/10 border border-amber-500/20 rounded-full px-3 py-1.5 font-sans text-xs font-black text-amber-400 shadow-inner">
          <Flame className="w-3.5 h-3.5 text-orange-500 fill-current animate-bounce" />
          <span>{streakCount} {isHi ? "दिन साधना" : "Days Streak"}</span>
        </div>
      </header>

      {/* ─── NAVIGATION TABS ─────────────────────────────────────────── */}
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

      {/* ─── MAIN DYNAMIC CONTENT CONTAINER ─────────────────────────── */}
      <main className="flex-1 w-full max-w-md mx-auto px-4 py-5 pb-24 relative z-10 flex flex-col items-center">
        


        {/* ========================================================= */}
        {/* SECTION 2: BLESSING PATRA MAKER (PERSONALIZATION & SHARE) */}
        {/* ========================================================= */}
        {activeTab === "maker" && (
          <div className="w-full space-y-6 flex flex-col items-center animate-fade-in">
            
            {/* Title / Description */}
            <div className="text-center">
              <h2 className="font-serif text-base font-bold text-amber-400">
                {isHi ? "दिव्य आशीर्वाद पत्र निर्माण" : "Create Divine Blessing Card"}
              </h2>
              <p className="text-xs text-amber-200/60 font-sans mt-1">
                {isHi 
                  ? "स्वयं अथवा परिवार के लिए आज का पावन आशीर्वाद पत्र तैयार करें और व्हाट्सएप पर साझा करें"
                  : "Personalize daily blessings and share sacred cards on your WhatsApp Status"}
              </p>
            </div>

            {/* PERSONALIZATION FORM WIDGET */}
            <div className="w-full bg-[#1b0d07]/40 border border-amber-950/30 rounded-3xl p-5 shadow-2xl flex flex-col gap-4">
              
              {/* Name field */}
              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] text-amber-200/50 uppercase tracking-widest font-sans font-black">
                  {isHi ? "श्रद्धालु / भक्त का नाम" : "Devotee Name (Will appear on card)"}
                </label>
                <input
                  type="text"
                  placeholder={isHi ? "उदा. राजेश कुमार" : "e.g., Rajesh Kumar"}
                  value={userName}
                  onChange={(e) => setUserName(e.target.value)}
                  className="bg-black/40 border border-amber-500/15 focus:border-amber-500/40 rounded-xl px-4 py-3 text-xs text-amber-100 focus:outline-none placeholder:text-amber-200/20 tracking-wide font-sans font-medium"
                />
              </div>

              {/* Target Selector */}
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
                    { key: "universal", hi: "सर्व कल्याण (सभी)", en: "Universal Peace" },
                  ].map((target) => (
                    <button
                      key={target.key}
                      onClick={() => setBlessingType(target.key as any)}
                      className={`py-2 px-3 rounded-xl border text-center transition-all truncate ${
                        blessingType === target.key 
                          ? "border-amber-500 bg-amber-500/10 text-amber-400 font-black" 
                          : "border-amber-500/10 bg-black/25 text-amber-200/60"
                      }`}
                    >
                      {isHi ? target.hi : target.en}
                    </button>
                  ))}
                </div>
              </div>

              {/* Devotee Photo Uploader Widget */}
              <div className="flex items-center justify-between bg-black/25 border border-amber-950/20 rounded-2xl p-3 select-none">
                <div className="flex items-center gap-3">
                  <div className="w-11 h-11 rounded-full bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400 relative overflow-hidden">
                    {userPhoto ? (
                      <img src={userPhoto} alt="devotee avatar" className="w-full h-full object-cover" />
                    ) : (
                      <Camera className="w-5 h-5 opacity-70" />
                    )}
                  </div>
                  <div className="flex flex-col text-left">
                    <span className="text-[9px] text-amber-200/40 font-bold uppercase tracking-wider font-sans leading-none">Custom Avatar</span>
                    <span className="text-xs text-amber-200 font-bold mt-1.5 leading-none">
                      {userPhoto ? (isHi ? "फ़ोटो सफलतापूर्वक संलग्न" : "Custom Photo Attached") : (isHi ? "अपनी फोटो जोड़ें (वैकल्पिक)" : "Add your photo (optional)")}
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

              {/* Border templates style selector */}
              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] text-amber-200/50 uppercase tracking-widest font-sans font-black">
                  {isHi ? "मंदिर गर्भगृह बॉर्डर पैक (Themes)" : "Sacred Garbhagriha Border Themes"}
                </label>
                <div className="grid grid-cols-2 gap-2 font-sans text-[11px]">
                  {[
                    { key: "golden", hi: "गर्भगृह स्वर्ण (Free)", en: "Garbhagriha Gold", tier: "free" },
                    { key: "white", hi: "सात्विक रजत (Free)", en: "Sattvik White", tier: "free" },
                    { key: "crimson", hi: "काशी सिंदूरी (Devotee)", en: "Kashi Crimson", tier: "devotee" },
                    { key: "peacock", hi: "वृंदावन मयूर (Mahabhakt)", en: "Vrindavan Peacock", tier: "mahabhakt" },
                  ].map((tpl) => {
                    const locked = isTemplateLocked(tpl.key as any);
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
                        {locked && <Lock className="w-3 h-3 text-amber-500/60" />}
                        <span>{isHi ? tpl.hi : tpl.en}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Layout format: 9:16 vertical recommended for WhatsApp Status */}
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

              {/* ACTION: SHARE & COMPILE */}
              <div className="flex gap-2 border-t border-amber-950/20 pt-4 mt-2">
                <button
                  onClick={handleShare}
                  className="flex-1 py-3.5 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-black font-sans font-black text-xs uppercase tracking-widest rounded-xl transition-all active:scale-[0.97] flex items-center justify-center gap-1.5 shadow-md focus:outline-none"
                >
                  <Share2 className="w-4 h-4 text-black" />
                  <span>{isHi ? "व्हाट्सएप पर शेयर" : "Share on WhatsApp"}</span>
                </button>
                
                <button
                  onClick={handleDownload}
                  className="px-4.5 py-3.5 border border-amber-500/20 bg-black/20 hover:bg-amber-500/10 text-amber-300 font-sans font-black text-xs uppercase tracking-widest rounded-xl transition-all active:scale-[0.97] flex items-center justify-center gap-1.5 focus:outline-none"
                >
                  <Download className="w-4 h-4 text-amber-400" />
                </button>
              </div>

              {/* Watermark Notice */}
              <p className="text-[9px] font-sans text-amber-200/30 text-center tracking-wider">
                {isHi ? "✨ आशीर्वाद पत्र के निचले हिस्से में सूक्ष्म वॉटरमार्क संलग्न रहेगा।" : "✨ A subtle watermark will be included at the bottom of the card."}
              </p>
            </div>
          </div>
        )}

        {/* ========================================================= */}
        {/* SECTION 3: HD WALLPAPERS GRID                             */}
        {/* ========================================================= */}
        {activeTab === "wallpapers" && (
          <div className="w-full space-y-5 flex flex-col items-center animate-fade-in">
            
            {/* Title / Description */}
            <div className="text-center">
              <h2 className="font-serif text-base font-bold text-amber-400">
                {isHi ? "पावन देव एचडी वॉलपेपर" : "HD Devotional Wallpapers"}
              </h2>
              <p className="text-xs text-amber-200/60 font-sans mt-1">
                {isHi ? "अपने मोबाइल हेतु पावन दिव्य पृष्ठभूमि (Backdrops) डाउनलोड करें" : "Adorn your screen with premium high-resolution backdrops"}
              </p>
            </div>

            {/* Wallpapers grid */}
            <div className="grid grid-cols-2 gap-4 w-full">
              {WALLPAPERS_LIST.map((wp) => {
                const locked = wp.tier !== "free" && userTier === "free";
                return (
                  <div
                    key={wp.id}
                    className="bg-[#1b0d07]/40 border border-amber-950/20 rounded-2xl p-2 relative flex flex-col group select-none"
                  >
                    {/* Thumbnail Frame */}
                    <div className="w-full h-48 rounded-xl overflow-hidden relative">
                      <img 
                        src={wp.imageUrl} 
                        alt={wp.name} 
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 pointer-events-none" 
                      />
                      
                      {/* Locked cover mask */}
                      {locked && (
                        <div className="absolute inset-0 bg-black/65 flex items-center justify-center text-amber-400">
                          <div className="bg-black/60 border border-amber-500/20 p-2.5 rounded-full backdrop-blur-xs flex items-center justify-center">
                            <Lock className="w-5 h-5 text-amber-500" />
                          </div>
                        </div>
                      )}

                      {/* Tier Tag label */}
                      <span className={`absolute top-2 right-2 text-[8px] font-sans font-black uppercase tracking-widest px-2 py-0.5 rounded-full border shadow-sm ${
                        wp.tier === "free" 
                          ? "bg-green-500/10 border-green-500/30 text-green-400" 
                          : wp.tier === "devotee" 
                          ? "bg-amber-500/10 border-amber-500/30 text-amber-400"
                          : "bg-red-500/10 border-red-500/30 text-red-400"
                      }`}>
                        {wp.tier}
                      </span>
                    </div>

                    {/* Metadata details */}
                    <div className="mt-3 text-left px-1 flex-1 flex flex-col justify-between">
                      <div>
                        <h4 className="font-serif text-xs font-bold text-amber-100/90 truncate leading-tight">
                          {isHi ? wp.nameHindi : wp.name}
                        </h4>
                        <span className="text-[9px] font-sans font-bold text-amber-500/70 uppercase tracking-widest leading-none block mt-1">
                          {wp.deity}
                        </span>
                      </div>

                      <button
                        onClick={() => handleWallpaperAction(wp)}
                        className={`w-full mt-3.5 py-2.5 rounded-xl text-[10px] font-sans font-black uppercase tracking-widest transition-all active:scale-[0.95] flex items-center justify-center gap-1 focus:outline-none ${
                          locked 
                            ? "bg-amber-500/10 border border-amber-500/20 text-amber-400"
                            : "bg-gradient-to-r from-amber-500/80 to-amber-600/80 text-black font-black"
                        }`}
                      >
                        {locked ? (
                          <>
                            <Lock className="w-3.5 h-3.5" />
                            <span>Unlock HD</span>
                          </>
                        ) : (
                          <>
                            <Download className="w-3.5 h-3.5 text-black" />
                            <span>Download</span>
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* ========================================================= */}
        {/* SECTION 4: MY SAVED GALLERY DIARY                        */}
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
              <div className="grid grid-cols-2 gap-3.5 w-full select-none">
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
                        <Share2 className="w-4.5 h-4.5 text-black" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

      </main>

      {/* ─── WALLPAPER LOCKED PREVIEW MODAL ───────────────────────────── */}
      <AnimatePresence>
        {showPreviewModal && (() => {
          const wp = WALLPAPERS_LIST.find((w) => w.id === showPreviewModal);
          if (!wp) return null;
          return (
            <>
              {/* Backdrop */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setShowPreviewModal(null)}
                className="fixed inset-0 bg-black/90 z-[120] backdrop-blur-md"
              />
              {/* Modal Card Frame */}
              <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 25 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 25 }}
                transition={{ type: "spring", duration: 0.38 }}
                className="fixed inset-x-4 top-[8%] bottom-[8%] max-w-sm mx-auto bg-gradient-to-b from-[#1b0c06] to-[#0d0502] border border-amber-500/25 rounded-3xl p-5 shadow-2xl z-[130] flex flex-col justify-between overflow-hidden"
              >
                {/* Header title */}
                <div className="flex justify-between items-center w-full">
                  <h3 className="font-serif text-xs font-black text-amber-400 uppercase tracking-widest">
                    🔓 {wp.tier} {isHi ? "वॉलपेपर प्रीव्यू" : "Tier Wallpaper"}
                  </h3>
                  <button
                    onClick={() => setShowPreviewModal(null)}
                    className="w-8 h-8 rounded-full border border-amber-500/10 hover:border-amber-500/30 bg-black/40 flex items-center justify-center text-amber-200 focus:outline-none"
                  >
                    <X className="w-4 h-4 text-amber-400" />
                  </button>
                </div>

                {/* Smartphone Device Frame Mock */}
                <div className="flex-1 w-full max-w-[200px] mx-auto my-4 rounded-[1.8rem] border-[4px] border-[#381f12] overflow-hidden relative shadow-2xl aspect-[9/16] bg-black/50">
                  <img src={wp.imageUrl} alt="preview" className="w-full h-full object-cover pointer-events-none" />
                  
                  {/* Gate overlay */}
                  <div className="absolute inset-0 bg-black/60 backdrop-blur-[1px] flex flex-col items-center justify-center p-4 text-center">
                    <Lock className="w-8 h-8 text-amber-400 animate-bounce" />
                    <span className="text-[10px] font-sans font-black text-amber-400 uppercase tracking-widest mt-3 block leading-none">
                      {isHi ? "सदस्यता आवश्यक है" : "Premium Required"}
                    </span>
                    <span className="text-[8px] text-white/55 font-sans mt-2 max-w-[125px] block leading-normal">
                      {isHi ? `अनलॉक करने हेतु '${wp.tier}' सदस्य बनें` : `Upgrade to '${wp.tier}' tier to download this backdrop`}
                    </span>
                  </div>
                </div>

                {/* Premium routing triggers */}
                <div className="w-full flex flex-col gap-2 mt-1 select-none">
                  <button
                    onClick={navigateToPricing}
                    className="w-full py-3 bg-gradient-to-r from-amber-500 to-amber-600 text-black font-sans font-black text-xs uppercase tracking-widest rounded-xl transition-all active:scale-[0.96] shadow-[0_4px_16px_rgba(245,158,11,0.25)] flex items-center justify-center gap-1.5 focus:outline-none"
                  >
                    <Sparkles className="w-4 h-4 text-black fill-current" />
                    <span>{isHi ? "अभी अपग्रेड करें (Upgrade)" : "Become Mahabhakt"}</span>
                  </button>
                  
                  <button
                    onClick={() => setShowPreviewModal(null)}
                    className="w-full py-2.5 border border-amber-500/10 bg-black/30 text-amber-300 font-sans font-black text-[9px] uppercase tracking-widest rounded-xl transition-all active:scale-[0.96] focus:outline-none"
                  >
                    {isHi ? "वापस जाएं" : "Cancel"}
                  </button>
                </div>
              </motion.div>
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

    </div>
  );
}
