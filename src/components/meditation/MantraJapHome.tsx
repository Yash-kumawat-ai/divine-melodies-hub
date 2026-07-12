import { useState, useMemo, useCallback, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Flame,
  Play,
  ArrowLeft,
  Bell,
  Clock3,
  Flower2,
  Sparkles,
  Plus,
  X,
  TrendingUp,
  Timer,
  RotateCcw,
  ChevronRight,
  Heart,
  ChevronDown,
  Check,
  UserRound,
  Sun,
  Target,
  Wind,
  Trash2,
  Trophy,
} from "lucide-react";
import { useLanguage } from "@/hooks/useLanguage";
import { useTheme } from "@/hooks/useTheme";
import { useSearchParams, useNavigate } from "react-router-dom";
import { useMantraJapa, resolveMantraImage } from "@/hooks/useMantraJapa";
import JapaCounter from "@/components/devotion/JapaCounter";
import MantraDetailView from "./MantraDetailView";
import MantraSetupView from "./MantraSetupView";
import meditationDesktopBg from "@/pages/images/meditation_desktop_wallpaper.webp";
import devotionalBackground from "@/pages/images/devotional_background.webp";
import omShivayaImg from "@/pages/images/om_shivaya_high_quality.webp";
import type { Mantra } from "@/lib/mantraJapa/mantraJapaApi";

// Pink Lotus SVG Component
const PinkLotusSvg = ({ className = "w-6 h-6", fill = "#ec4899", opacity = 0.95 }: { className?: string; fill?: string; opacity?: number }) => (
  <svg className={className} viewBox="0 0 1006.6461 574.1317" fill={fill} style={{ opacity }} xmlns="http://www.w3.org/2000/svg">
    <g>
      <g id="XMLID_1_">
        <g>
          <path d="M329.5415,301.24c0.38,0.23,0.6,0.73,1.21,1.52c-7.56-0.79-14.12-3.51-20.77-5.83c-21.73-7.59-42.91-16.29-62.15-29.27c-22.42-15.12-40.16-34.46-52.55-58.39c-15.73-30.4-23.02-62.64-18.8-97c0.15-1.16,0.27-2.31,0.36-3.47c0.43-5.77,2.32-7.41,8.01-6.47c9.21,1.52,18.29,3.52,27.04,6.94c18.85,7.38,36.73,16.55,52.48,29.4c5.18,4.24,10.01,9.03,15,15.53c-8.73-3.63-16.16-6.82-23.66-9.82c-15.52-6.21-31.65-10.15-48.12-12.87c-3.71-0.61-4.97,0.1-4.83,4.12c1.3,38.95,14.69,73.19,40.68,102.11c20.24,22.53,45.65,38.61,71.17,54.4c21.84,13.56,26.85,16.54,31.81,19.59z"/>
          <path d="M247.2815,285.15c0.21,0.12,0.23,0.55,0.36,0.91c-1.36,1.3-3.13,0.88-4.68,0.9c-20.87,0.32-41.61-0.68-61.94-5.92c-27.02-6.95-48.38-31.11-46.48-62.21c0.73-11.96,1.22-23.91,3.28-35.74c0.28-1.59-0.16-3.59,1.93-4.17c2.25-0.63,3.18,1.23,4.27,2.7c16.92,22.92,34.76,45.08,53.56,66.49c13.19,15.02,28.75,26.67,46.65,35.35c19.34,9.39,20.36,9.97,21.35,10.58z"/>
          <path d="M239.3115,468.6c1.12,0.04,2.23,0.32,4.08,0.6c-2.91,2.43-5.83,3.18-8.67,3.65c-37.13,6.26-74.16,8.54-110.72-3.46c-17.82-5.85-33.02-16.34-48.06-27.18c-10.95-7.88-19.91-17.58-27.78-28.44c-2.05-2.83-2.25-4.41,1.47-6.2c17.62-8.51,35.86-15.1,55.08-18.86c1.32-0.26,2.92-0.8,3.58,0.7c0.7,1.6-1.09,2.23-2.02,3c-7.48,6.11-15.02,12.15-22.54,18.21c-1.69,1.36-3.05,2.44-0.43,4.52c26.44,21.04,55.44,36.9,88.86,43.55c22.15,4.41,44.37,8.92,67.1,9.9z"/>
          <path d="M458.3115,410.22c-3.14,0-4.84-1.47-6.48-2.66c-16.27-11.85-34.23-20.7-52.63-28.49c-18.02-7.62-37.13-11.68-56.54-14.1c-32.75-4.08-65.7-5.67-98.57-8.19c-18.94-1.45-36.7-7.6-54.22-14.74c-13.97-5.7-27-12.91-39.54-21.16c-1.37-0.9-3.01-3.1-4.65-1.79c-1.89,1.52-0.28,3.78,0.48,5.51c7.21,16.46,18.09,30.65,27.97,45.48c21.69,32.55,51.42,54.52,88.07,67.39c15.99,5.62,32.67,7.78,49.51,8.92c13.61,0.93,27.21,1.97,40.83,0.97c-34.47,9.47-68.88,12.16-104.25,4.61c-35.76-7.64-65.47-25.3-90.65-50.71c-32.98-33.28-49.45-74.02-50.83-120.86c-0.18-5.99-0.44-11.99,0.29-17.97c0.12-0.96,0.49-1.9,0.99-3.73c5.63,5.87,11.11,11.05,16.64,16.17c18.53,17.15,40.56,25.57,65.52,27.23c31.57,2.09,63.18,3.89,94.47,8.88c24.34,3.88,48.72,7.54,72.43,14.6c14.66,4.36,27.12,12.86,38.99,21.92c21,16.03,38.74,35.53,56.11,55.32c1.78,2.02,3.57,4.36,5.9,7.22z"/>
          <path d="M473.6615,424.59c-3.08,4.04-6.38,5.79-9.29,7.96c-2.93,2.18-5.93,4.31-9.06,6.21c-20.79,12.6-41.69,25-63.4,36.02c-13,6.6-26.69,10.22-41.08,11.61c-2.49,0.24-4.98,0.47-7.46,0.79c-1.09,0.14-2.57-0.09-2.89,1.35c-0.26,1.13,0.94,1.66,1.7,2.25c10.57,8.34,22.24,14.38,35.18,18.4c28.92,8.96,52.69-1.67,74.43-19.23c15.13-12.23,26.89-27.67,38.02-43.54c0.65-0.92,1.36-1.8,2.7-3.56c2.85,16.82-0.73,31.24-9.46,44.32c-11.65,17.45-25.24,33.01-43.61,43.95c-13.02,7.75-27.38,11.17-41.94,13.88c-31.22,5.79-59.27-3.52-85.74-19.18c-9.49-5.61-16.99-13.46-22.35-23.1c-4.28-7.7-7.98-15.73-12.03-23.56c-1.81-3.5-0.82-4.85,3.03-4.85c9.49-0.01,18.99-0.02,28.49-0.27c27.41-0.72,53.7-7.22,79.64-15.55c27.64-8.87,54.5-19.66,80.78-31.94c8.41-3.89,9.46-4.35,11.72-5.37z"/>
          <path d="M728.8215,472.99c1.8,2.47-1.02,5.39-2.5099,7.5c-13,18.35-25.66,37.26-45.04,49.59c-18.94,12.06-39.87,18.26-62.61,17.32c-9.49-0.39-19.02-0.17-28.39-1.89c-23.45-4.29-42-17.05-57.92-34.12c-10.16-10.89-17.42-23.52-21.2-38c-2.73-10.48-0.93-20.82,1.16-31.61c2.54,0.94,4.37,2.36,5.19,4.28c6.12,14.22,17.8199,23.86,27.9399,34.87c17.23,18.76,38.4,26.31,63.64,24.92c15.85-0.87,31.2-2.66,45.27-10.53c1.38-0.77,3.78-1.07,3.49-2.99c-0.27-1.8-2.59-1.83-4.18-2.12c-31.07-5.68-58.59-19.26-84.31-37.17c-11.52-8.02-22.53-16.57-32.75-26.16c-0.82-0.77-1.97-1.34-1.85-3.65c5.61,2.02,11.05,3.78,16.33,5.92c25.01,10.1,49.44,21.68,74.92,30.6c30.81,10.78,62.29,17.17,95.1899,12.6c28.58-3.98,32.23-4.89,33.63-2.98z"/>
          <path d="M765.8915,470.94c-0.91-0.28-1.8-0.65-2.7-0.98c0.02-0.45,0.04-0.9,0.05-1.34c6.75-0.49,13.5-1.07,20.25-1.44c29.3-1.61,57.81-7.3,85.54-16.77c15-5.12,27.47-14.9,40.65-23.31c5.8-3.7,10.68-8.48,15.78-13.01c3.01-2.68,2.85-4.77-0.25-7.22c-7.69-6.11-15.27-12.37-22.88-18.57c-1.27-1.03-2.78-1.85-3.57-3.92c1.82-0.72,3.4-0.08,5.06,0.41c18.65,5.5,35.59,14.95,53.17,22.93c2.68,1.21,4.15,2.59,1.7,5.59c-10.65,13.03-21.2,26.07-34.23,36.95c-22.33,18.63-48.64,27.13-76.89,28.59c-26.78,1.38-54.34,0.25-81.02-7.95z"/>
          <path d="M911.3415,251.38c2.31,0.84,1.26,3.84,1.16,5.85c-1.84,38.58-11.09,74.9-32.11,107.84c-17.11,26.82-38.36,49.57-65.35,66.35c-25.28,15.73-52.84,24.65-83.01,25.8c-18.46,0.71-36.58-0.01-54.57-4.12c-0.81-0.18-1.63-0.37-2.41-0.64c-0.26-0.09-0.43-0.44-0.99-1.04c9.78-1.07,19.24-2.3,28.73-3.12c33.6-2.89,63.66-15.19,90.95-34.48c11.23-7.94,19.85-18.69,28.42-29.35c12.08-15.02,21.19-31.88,30.53-48.6c1.94-3.48,4.52-6.63,5.53-10.6c0.25-0.95,0.69-2.02-0.39-2.68c-0.91-0.57-1.48,0.4-2.12,0.84c-26.35,17.74-56.04,26.34-86.75,32.71c-30.32,6.29-60.98,8.24-91.78,9.44c-40.43,1.58-77.93,13.14-112.75,33.6c-4.1,2.41-8.26,4.72-12.38,7.08c-0.29-0.34-0.58-0.67-0.86-1c8.11-10.49,16.57-20.65,26.08-29.98c21.3-20.88,47.33-34.3,73.66-47.22c19.56-9.59,40.77-12.79,62.07-15.97c31.37-4.68,63.1-4.51,94.55-8.06c16.98-1.91,33.76-4.97,49.28-12.07c19.22-8.78,36.29-20.9,50.4-36.88c14.73-16.7 15.56-19.75 17.6-19z"/>
          <path d="M881.6415,180.38c0.16,11.45,2.06,22.84-0.03,34.36c-1.45,7.99-0.48,16.25-1.56,24.38c-2.59,19.45-14.46,31.25-31.05,39.8c-17.88,9.22-36.98,9.9-56.4,9.42c-9.48-0.24-18.96-0.06-28.44-0.12c-1.57-0.01-3.27,0.6-4.96-0.67c4.44-5.73,11.41-7.16,17.22-10.28c19.89-10.67,38.77-22.54,54.43-39.15c17.17-18.22,32.12-38.13,46.23-58.73c0.79-1.14,1.08-3.3,2.94-2.84c2.93,0.72,2.88,2.74,2.9,4.14z"/>
          <path d="M674.7515,304.57c9.84-6.31,20.78-10.09,30.43-16.31c21.37-13.77,43.46-26.65,61.97-44.33c18.27-17.45,31.36-38.49,38.32-62.8c-3.65-12.76-5.56-26.03-5.5-39.47c-0.02-3.94-1.33-4.86-5.19-5.07c-20.45-1.12-39.54,4.27-58.32,11.44c-1.46,0.55-2.83,1.77-4.98,0.96c7.92-8.73,17.94-13.9,28.1-18.73c18.63-8.85,37.3-17.62,56.7-24.72c1.71-0.63,3.42-1.3,5.17-1.81c7.97-2.37,8.03-2.36,9.32,6.25c6.94,46.28-4.22,87.07-36.77,121.42c-19.96,21.07-43.75,36.64-69.58,49.54c-19.12,9.55-39.02,16.97-59.29,23.53c-0.9,0.29-1.4-.04-1.86-0.01z"/>
          <path d="M616.9015,326.04c-0.42,0.26-0.86,0.53-1.33,0.67c-0.2599,0.07-0.6-0.12-1.77-0.4c6.91-9.09,13.54-17.94,20.31-26.69c14.59-18.88,28.46-38.25,37.86-60.33c7.34-17.25,11.97-35.41,13.64-54.02c1.59-17.72-2.6-34.77-10.06-50.87c-8.21-17.72-17.99-34.55-29.73-50.19c-1.89-2.52-4.09-4.81-6.21-7.15c-6.57-7.26-6.66-7.4-15.49-2.74c-11.77,6.2-23.33,12.79-35.35,20.74c3.21-10.29,8.87-17.77,14.24-25.31c9.83-13.82,19.89-27.46,32.04-39.43c2.42-2.38,4.56-2.66,6.88-0.8c12.18,9.77,25.81,18.14,34.07,31.93c12.71,21.17,23.8199,43.08,29.5099,67.41c3.51,14.99,5.88,30.1,6.2401,45.45c0.48,20.47-4.21,40.06-12.34,58.7c-8.12,18.59-36.35,49.04-73.23,71.73z"/>
          <path d="M633.7515,205.47c4.5699,27.76,0.25,54.9-12.66,80.11c-14.77,28.85-32.55,55.78-54.04,80.16c-6.38,7.25-13.71,13.47-21.18,19.62c2.78-5.01,6.89-8.99,10.25-13.52c9-12.15,14.77-26.01,21.7599-39.22c14.33-27.1,18.76-56.32,18.08-86.53c-0.32-14.12-3.91-27.6-9.68-40.5c-9.77-21.81-23.6-40.91-39.37-58.67c-10.95-12.33-22.56-24.04-34.59-35.32c-2.79-2.63-4.79-2.7-7.55-0.19c-18.31,16.7-37.76,32.28-54.17,50.89c-24.8,28.12-39.87,60.71-39.33,98.85c0.41,28.73,8.1,55.65,22.24,81c10.5,18.81,23.29,35.6,37.86,51.24c0.33,0.36,0.6,0.77,0.9,1.16c-19.47-13.31-35.19-30.28-48.33-49.69c-8.3-12.26-17.77-23.82-24.4-37.09c-7.04-14.09-16.24-27.39-18.78-43.34c-3.16-19.91-5.48-39.98-1.87-60.07c2.34-13.08,7.75-25.26,14.66-36.43c12.08-19.53,25.13-38.53,41.97-54.4c16.58-15.63,34.57-29.62,52.58-43.56c5.65-4.37,11.5-8.5,16.99-13.07c2.27-1.89,3.88-1.75,6.17-0.38c13.03,7.8,25.41,16.49,36.99,26.31c17.53,14.86,35.71,29.14,49.52,47.73c24.62,33.02,39.16,57.17,43.8,85.34z"/>
          <path d="M425.2615,95.03c-10.95-4.1-20.48-10.54-30.5-16.06c-14.3-7.88-10.05-9.1-21.71,3.01c-20.46,21.26-35.23,46.16-43.98,74.07c-12.15,38.73-5.17,75.02,18.04,108.18c8.4,12,17.26,23.65,25.18,36c4.56,7.11,10.36,13.42,15.48,20.18c1.12,1.49,2.73,2.88,2.71,5.58c-7.02-3.13-12.43-8.07-18.02-12.54c-21.1-16.9-39.1-36.39-51.76-60.69c-7.65-14.67-14.97-29.16-17.97-45.7c-4.17-23.03-3.1-45.56,2.91-68.13c10.11-37.93,27.93-71.71,53.41-101.5c3.02-3.53,6.25-6.9,10.03-9.7c1.31-0.97,2.16-1.75,3.74-0.26c13.56,25.61,31.46,47.77,45.04,73.4z"/>
        </g>
      </g>
    </g>
  </svg>
);

// Custom Yogi SVG Icon
const YogiIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" {...props}>
    <circle cx="12" cy="5.5" r="2.5" />
    <path d="M12 8v8" />
    <path d="M5 12c2 1 4 1.5 7 1.5s5-.5 7-1.5" />
    <path d="M5 12L8 15c2.5 1 5.5 1 8 0l3-3" />
    <path d="M6 19c2-1 4-1.5 6-1.5s4 .5 6 1.5" />
    <path d="M3 20.5h18" />
  </svg>
);

type MantraJapHomeProps = {
  onBack: () => void;
};

// Custom Icons
const MalaIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" {...props}>
    <circle cx="12" cy="10" r="6" strokeDasharray="3 3" />
    <circle cx="12" cy="17" r="1.5" fill="currentColor" />
    <path d="M11 18.5l1 1.5 1-1.5" />
  </svg>
);

const ConcentricCirclesIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" {...props}>
    <circle cx="12" cy="12" r="9" strokeOpacity="0.3" />
    <circle cx="12" cy="12" r="6" strokeOpacity="0.6" />
    <circle cx="12" cy="12" r="3" fill="currentColor" />
  </svg>
);

const japaStepsData = [
  {
    num: 1,
    icon: YogiIcon,
    titleHi: "स्थान चुनें",
    titleEn: "Choose a Place",
    descHi: "शांत और स्वच्छ जगह चुनें जहाँ आप आराम से बैठ सकें।",
    descEn: "Select a quiet, clean spot where you can sit comfortably."
  },
  {
    num: 2,
    icon: ConcentricCirclesIcon,
    titleHi: "संकल्प लें",
    titleEn: "Take a Resolve",
    descHi: "अपना संकल्प स्पष्ट करें और मन को एकाग्र करें।",
    descEn: "Clarify your intention and focus your mind."
  },
  {
    num: 3,
    icon: MalaIcon,
    titleHi: "जाप प्रारंभ करें",
    titleEn: "Start Chanting",
    descHi: "माला की एक-एक मनका पर मंत्र का जाप करें।",
    descEn: "Chant the mantra on each bead of your mala."
  },
  {
    num: 4,
    icon: TrendingUp,
    titleHi: "नियमित अभ्यास करें",
    titleEn: "Practice Regularly",
    descHi: "रोज़ाना अभ्यास से ही श्रेष्ठ परिणाम मिलते हैं।",
    descEn: "Consistent daily practice yields the best results."
  }
];

export default function MantraJapHome({ onBack }: MantraJapHomeProps) {
  const { language } = useLanguage();
  const isHi = language === "hi";
  const { theme } = useTheme();
  const isDark = theme === "dark";
  const navigate = useNavigate();

  const {
    mantras,
    mantrasLoading,
    stats,
    mantraTotalsMap,
    todaySessions,
    sankalpas,
    isGuest,
    completeSession,
    addSankalp,
    activateSankalp,
    deleteSankalpFn,
    refresh,
    addCustomMantra,
    deleteCustomMantra,
  } = useMantraJapa();

  // ─── Local UI State ────────────────────────────────────────────
  const [selectedMantraForDetail, setSelectedMantraForDetail] = useState<Mantra | null>(null);
  const [showSetup, setShowSetup] = useState(false);
  const [searchParams, setSearchParams] = useSearchParams();
  const [showAddMantraModal, setShowAddMantraModal] = useState(false);
  const [customMantraHindi, setCustomMantraHindi] = useState("");
  const [customMantraEnglish, setCustomMantraEnglish] = useState("");

  const urlMantraId = searchParams.get("mantraId");
  const urlShowSetup = searchParams.get("showSetup") === "true";

  useEffect(() => {
    if (urlMantraId && mantras.length > 0) {
      const found = mantras.find((m) => m.id === urlMantraId);
      if (found) {
        setSelectedMantraForDetail(found);
        setShowSetup(urlShowSetup);
      }
    } else {
      setSelectedMantraForDetail(null);
      setShowSetup(false);
    }
  }, [urlMantraId, urlShowSetup, mantras]);

  const [isBeginnerOpen, setIsBeginnerOpen] = useState(true);
  const [japaTarget, setJapaTarget] = useState<number>(() => {
    return Number(localStorage.getItem("hari_kirtan_japa_target_v1") || "108");
  });
  const [isCustomMode, setIsCustomMode] = useState<boolean>(() => {
    const saved = Number(localStorage.getItem("hari_kirtan_japa_target_v1") || "108");
    return saved !== 108 && saved !== 1008;
  });

  // ─── Sankalp local state ───────────────────────────────────────
  const [newSankalpText, setNewSankalpText] = useState("");

  // For guest mode, keep sankalps in local state
  const [localSankalpList, setLocalSankalpList] = useState<string[]>(() => {
    try {
      return JSON.parse(localStorage.getItem("hari_kirtan_custom_sankalps_v1") || "[]");
    } catch { return []; }
  });
  const [localActiveSankalp, setLocalActiveSankalp] = useState<string>(() => {
    return localStorage.getItem("hari_kirtan_active_sankalp_v1") || "";
  });

  const presetSankalps = useMemo(() => {
    return isHi
      ? ["मानसिक शांति और एकाग्रता", "सकारात्मक ऊर्जा और स्वास्थ्य", "ईश्वर भक्ति और मोक्ष"]
      : ["Inner Peace & Focus", "Positive Energy & Health", "Divine Devotion & Faith"];
  }, [isHi]);

  // Determine effective sankalpas and active
  const effectiveSankalpas = useMemo(() => {
    if (isGuest) {
      return [
        ...presetSankalps.map((t) => ({ id: t, text: t, is_custom: false, is_active: localActiveSankalp === t })),
        ...localSankalpList.map((t) => ({ id: t, text: t, is_custom: true, is_active: localActiveSankalp === t })),
      ];
    }
    // For authed users, combine presets with DB sankalpas
    const dbSankalpIds = new Set(sankalpas.map((s) => s.text));
    const presets = presetSankalps
      .filter((t) => !dbSankalpIds.has(t))
      .map((t) => ({ id: t, text: t, is_custom: false, is_active: false }));
    const dbItems = sankalpas.map((s) => ({
      id: s.id,
      text: s.text,
      is_custom: s.is_custom,
      is_active: s.is_active,
    }));
    return [...presets, ...dbItems];
  }, [isGuest, presetSankalps, sankalpas, localSankalpList, localActiveSankalp]);

  const activeSankalpText = useMemo(() => {
    const active = effectiveSankalpas.find((s) => s.is_active);
    if (active) return active.text;
    if (isGuest && localActiveSankalp) return localActiveSankalp;
    return presetSankalps[0];
  }, [effectiveSankalpas, isGuest, localActiveSankalp, presetSankalps]);

  // ─── Handlers ──────────────────────────────────────────────────
  const handleTargetChange = useCallback((target: number, isCustom = false) => {
    setJapaTarget(target);
    setIsCustomMode(isCustom);
    localStorage.setItem("hari_kirtan_japa_target_v1", String(target));
  }, []);

  const handleSelectSankalp = useCallback(async (item: { id: string; text: string }) => {
    if (isGuest) {
      setLocalActiveSankalp(item.text);
      localStorage.setItem("hari_kirtan_active_sankalp_v1", item.text);
    } else {
      await activateSankalp(item.id);
    }
  }, [isGuest, activateSankalp]);

  const handleAddCustomSankalp = useCallback(async () => {
    const text = newSankalpText.trim();
    if (!text) return;
    if (isGuest) {
      if (!localSankalpList.includes(text)) {
        const updated = [text, ...localSankalpList].slice(0, 10);
        setLocalSankalpList(updated);
        localStorage.setItem("hari_kirtan_custom_sankalps_v1", JSON.stringify(updated));
      }
      setLocalActiveSankalp(text);
      localStorage.setItem("hari_kirtan_active_sankalp_v1", text);
    } else {
      await addSankalp(text);
    }
    setNewSankalpText("");
  }, [newSankalpText, isGuest, localSankalpList, addSankalp]);

  const handleDeleteCustomSankalp = useCallback(async (e: React.MouseEvent, item: { id: string; text: string }) => {
    e.stopPropagation();
    if (isGuest) {
      const updated = localSankalpList.filter((s) => s !== item.text);
      setLocalSankalpList(updated);
      localStorage.setItem("hari_kirtan_custom_sankalps_v1", JSON.stringify(updated));
      if (localActiveSankalp === item.text) {
        setLocalActiveSankalp(presetSankalps[0]);
        localStorage.setItem("hari_kirtan_active_sankalp_v1", presetSankalps[0]);
      }
    } else {
      await deleteSankalpFn(item.id);
    }
  }, [isGuest, localSankalpList, localActiveSankalp, presetSankalps, deleteSankalpFn]);

  const handleStartJapaWithSankalp = useCallback(() => {
    // Find the most recently chanted mantra, or default to first
    if (mantras.length === 0) return;
    let best: Mantra | null = null;
    let newestTime = 0;
    mantras.forEach((m) => {
      const total = mantraTotalsMap[m.id];
      if (total?.last_session_at) {
        const t = new Date(total.last_session_at).getTime();
        if (t > newestTime) { newestTime = t; best = m; }
      }
    });
    const target = best || mantras[0];
    setSearchParams({
      practice: "mantra_japa_counter",
      mantraId: target.id,
      targetCount: String(japaTarget),
      practiceMode: "mala",
      sankalp: activeSankalpText,
    });
  }, [mantras, mantraTotalsMap, japaTarget, activeSankalpText, setSearchParams]);

  const handleContinueLastSession = handleStartJapaWithSankalp;

  // ─── Relative date helper ─────────────────────────────────────
  const getRelativeDateString = useCallback((isoString: string | null) => {
    if (!isoString) return isHi ? "कभी नहीं" : "Never";
    const date = new Date(isoString);
    const now = new Date();
    const getLocal = (d: Date) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
    const dateStr = getLocal(date);
    const nowStr = getLocal(now);
    if (dateStr === nowStr) return isHi ? "आज" : "Today";
    const yesterday = new Date(now);
    yesterday.setDate(now.getDate() - 1);
    if (dateStr === getLocal(yesterday)) return isHi ? "कल" : "Yesterday";
    const diffDays = Math.ceil(Math.abs(now.getTime() - date.getTime()) / 86400000);
    return isHi ? `${diffDays} दिन पहले` : `${diffDays} days ago`;
  }, [isHi]);

  // Guest-mode mantra stats for cards (use localStorage)
  const guestMantraStats = useMemo(() => {
    if (!isGuest) return {};
    try {
      return JSON.parse(localStorage.getItem("hari_kirtan_mantra_stats_v1") || "{}");
    } catch { return {}; }
  }, [isGuest]);

  // Legacy mantra id mapping for guest mode
  const LEGACY_MANTRA_MAP: Record<string, string> = {
    "Om Chanting": "om",
    "Om Namah Shivaya": "om_namah_shivaya",
    "Mahamrityunjaya Mantra": "mahamrityunjaya",
    "Hare Krishna Mahamantra": "hare_krishna",
    "Radhe Radhe": "radhe_radhe",
    "Jai Shree Ram": "jai_shree_ram",
    "Om Namo Narayanaya": "om_namo_narayanaya",
    "Gayatri Mantra": "gayatri",
  };

  // Get chant data for a mantra card
  const getMantraCardData = useCallback((m: Mantra) => {
    // 1. Calculate today's chants for this mantra
    let todayChants = 0;
    if (isGuest) {
      if (typeof window !== 'undefined') {
        const logsRaw = localStorage.getItem("hari_kirtan_meditation_logs_v1");
        if (logsRaw) {
          try {
            const logs = JSON.parse(logsRaw) as any[];
            const today = new Date().toISOString().slice(0, 10);
            todayChants = logs
              .filter((l: any) => l.completed && l.completedAt?.slice(0, 10) === today && (l.mantraId === m.id || l.mantra === m.name_english))
              .reduce((sum: number, l: any) => sum + (l.japaCount || 0), 0);
          } catch { /* ignore */ }
        }
      }
    } else {
      todayChants = todaySessions
        .filter((s) => s.mantra_id === m.id && s.completed)
        .reduce((sum, s) => sum + s.actual_count, 0);
    }

    // 2. Lifetime & Streak
    if (!isGuest) {
      const total = mantraTotalsMap[m.id];
      return {
        today: todayChants,
        chants: total?.total_chants ?? 0,
        streak: total?.current_streak ?? 0,
        lastDate: getRelativeDateString(total?.last_session_at ?? null),
      };
    }

    // Guest: lookup by legacy id
    const legacyId = LEGACY_MANTRA_MAP[m.name_english];
    const stat = legacyId ? guestMantraStats[legacyId] : null;
    return {
      today: todayChants,
      chants: stat?.totalChants ?? 0,
      streak: (stat?.totalChants ?? 0) > 0 ? stats.currentStreak : 0,
      lastDate: getRelativeDateString(stat?.lastChantedAt ?? null),
    };
  }, [isGuest, mantraTotalsMap, guestMantraStats, todaySessions, stats.currentStreak, getRelativeDateString]);

  // Find the last chanted mantra ID
  const lastChantedMantraId = useMemo(() => {
    if (mantras.length === 0) return null;
    if (isGuest) {
      let bestLegacyId: string | null = null;
      let newestTime = 0;
      Object.entries(guestMantraStats).forEach(([legacyId, stat]: [string, any]) => {
        if (stat?.lastChantedAt) {
          const t = new Date(stat.lastChantedAt).getTime();
          if (t > newestTime) { newestTime = t; bestLegacyId = legacyId; }
        }
      });
      if (bestLegacyId) {
        const m = mantras.find((m) => LEGACY_MANTRA_MAP[m.name_english] === bestLegacyId);
        if (m) return m.id;
      }
      return mantras[0]?.id;
    }
    
    let bestId: string | null = null;
    let newestTime = 0;
    mantras.forEach((m) => {
      const total = mantraTotalsMap[m.id];
      if (total?.last_session_at) {
        const t = new Date(total.last_session_at).getTime();
        if (t > newestTime) { newestTime = t; bestId = m.id; }
      }
    });
    return bestId || mantras[0]?.id;
  }, [mantras, mantraTotalsMap, isGuest, guestMantraStats]);

  // ─── Copy ──────────────────────────────────────────────────────
  const copy = {
    title: isHi ? "मंत्र जाप" : "Mantra Japa",
    heroTitle: isHi ? "आज का जप" : "Today's Japa",
    continueBtn: isHi ? "पिछला सत्र जारी रखें" : "Continue Last Session",
    sadhanaTitle: isHi ? "आपकी साधना" : "Your Sadhana",
    stats: [
      { label: isHi ? "कुल जाप" : "Total Chants", icon: MalaIcon },
      { label: isHi ? "दिन की streak" : "Days Streak", icon: Flame },
      { label: isHi ? "मालाएं पूरी" : "Malas Completed", icon: Flower2 },
      { label: isHi ? "आज का कुल" : "Today's Total", icon: ConcentricCirclesIcon },
    ],
    selectTitle: isHi ? "मंत्र चुनें और जप शुरू करें" : "Select Mantra & Start",
    sankalpTitle: isHi ? "आपका संकल्प" : "Your Sankalp / Intention",
    lastChanted: isHi ? "जाप किए" : "Chants:",
    lastDateLabel: isHi ? "अंतिम" : "Last:",
  };

  const statValues = [
    stats.totalChants.toLocaleString(),
    String(stats.currentStreak),
    String(stats.totalMalas),
    String(stats.todayChants),
  ];

  // ─── Render ────────────────────────────────────────────────────
  if (selectedMantraForDetail) {
    return (
      <>
        {showSetup ? (
          <MantraSetupView
            mantra={selectedMantraForDetail}
            onBack={() => {
              setShowSetup(false);
              setSearchParams({
                practice: "mantra_jap_home",
                mantraId: selectedMantraForDetail.id,
              });
            }}
            onStartJapa={(opts) => {
              setSearchParams({
                practice: "mantra_japa_counter",
                mantraId: selectedMantraForDetail.id,
                targetCount: String(opts.targetCount),
                practiceMode: opts.practiceMode,
                sankalp: opts.sankalpText,
              });
            }}
          />
        ) : (
          <MantraDetailView
            mantra={selectedMantraForDetail}
            image={resolveMantraImage(selectedMantraForDetail)}
            stats={mantraTotalsMap[selectedMantraForDetail.id]}
            onBack={() => {
              setSelectedMantraForDetail(null);
              setShowSetup(false);
              setSearchParams({
                practice: "mantra_jap_home",
              });
            }}
            onStartJapa={() => {
              setSearchParams({
                practice: "mantra_jap_home",
                mantraId: selectedMantraForDetail.id,
                showSetup: "true",
              });
            }}
          />
        )}
      </>
    );
  }

  return (
    <div className={`relative flex flex-col h-full overflow-hidden transition-colors duration-300 ${isDark ? 'text-amber-50' : 'text-stone-800 bg-[#FDF8F2]'}`}>
      {/* Full-screen Background Layer */}
      {isDark && (
        <div className="absolute inset-0 -z-20 select-none pointer-events-none">
          <img 
            src={devotionalBackground} 
            alt="Page Background" 
            className="w-full h-full object-cover object-center opacity-10" 
          />
          <div className="absolute inset-0 bg-gradient-to-b from-[#080504] via-[#0c0608] to-[#050306] opacity-92" />
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_50%_at_50%_-10%,rgba(251,146,60,0.08),transparent)]" />
        </div>
      )}
      {!isDark && (
        <div className="absolute inset-0 -z-20 select-none pointer-events-none">
          <div className="absolute inset-0 bg-gradient-to-br from-[#FDF8F2] via-[#FFF7ED] to-[#FDF4E7]" />
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_70%_40%_at_50%_0%,rgba(251,146,60,0.07),transparent)]" />
        </div>
      )}

      {/* ─── HEADER ─────────────────────────────────────────────── */}
      <header className={`sticky top-0 z-40 px-4 py-3.5 lg:py-4 flex items-center justify-between border-b transition-colors duration-300 ${
        isDark
          ? 'bg-[#1a1008]/95 backdrop-blur-md border-amber-900/20 shadow-[0_2px_12px_rgba(0,0,0,0.4)]'
          : 'bg-[#FDF3E3]/95 backdrop-blur-md border-amber-300/40 shadow-[0_2px_12px_rgba(214,152,74,0.12)]'
      }`}>
        <div className="flex items-center gap-3">
          <button
            onClick={onBack}
            className={`flex items-center justify-center h-10 w-10 rounded-full active:scale-95 transition-all ${
              isDark ? 'hover:bg-amber-900/30 text-amber-200' : 'hover:bg-amber-200/60 text-amber-800'
            }`}
            aria-label="Back"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div className="flex items-center gap-2">
            <span className={`text-2xl lg:text-2xl font-display ${
              isDark ? 'text-amber-400' : 'text-amber-700'
            }`}>ॐ</span>
            <h1 className={`text-xl lg:text-2xl font-bold font-display tracking-wide ${
              isDark ? 'text-amber-100' : 'text-amber-900'
            }`}>
              {copy.title}
            </h1>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {isGuest && (
            <span className={`text-[10px] px-2.5 py-1 rounded-full border font-bold ${
              isDark ? 'bg-amber-900/30 text-amber-300 border-amber-700/40' : 'bg-amber-100 text-amber-700 border-amber-300/60'
            }`}>
              {isHi ? "अतिथि" : "Guest"}
            </span>
          )}
          <button
            onClick={() => navigate("/leaderboard")}
            className={`h-10 w-10 rounded-full flex items-center justify-center active:scale-95 transition-all ${
              isDark ? 'hover:bg-amber-900/30 text-amber-400 hover:text-amber-300' : 'hover:bg-amber-200/60 text-amber-700 hover:text-amber-900'
            }`}
            title={isHi ? "लीडरबोर्ड" : "Leaderboard"}
          >
            <Trophy className="w-5 h-5" />
          </button>
          <button className={`h-10 w-10 rounded-full flex items-center justify-center transition-all ${
            isDark ? 'hover:bg-amber-900/30 text-amber-300/70' : 'hover:bg-amber-200/60 text-amber-700'
          }`}>
            <Bell className="w-5 h-5" />
          </button>
        </div>
      </header>

      {/* ─── MAIN CONTENT ───────────────────────────────────────── */}
      <div className="flex-1 overflow-y-auto overflow-x-hidden pb-6">
        <div className="mx-auto max-w-7xl px-4 lg:px-8 mt-6 space-y-12">

        {/* HERO BANNER SECTION */}
        <section className={`relative overflow-hidden rounded-[2rem] border p-6 md:p-8 lg:p-10 shadow-xl transition-all duration-300 ${
          isDark
            ? 'border-amber-500/10 shadow-black/80'
            : 'border-amber-300/40 shadow-amber-200/60'
        }`}>
          
          {/* Background Image Layer */}
          <div className="absolute inset-0 z-0 select-none pointer-events-none">
            <img 
              src={devotionalBackground} 
              alt="Devotional Background" 
              className="w-full h-full object-cover object-center" 
            />
            {isDark ? (
              <>
                <div className="absolute inset-0 bg-[#0c0705]/82 backdrop-blur-[0.5px]" />
                <div className="absolute inset-0 bg-gradient-to-b from-[#0c0705]/30 via-transparent to-[#0c0705]/95" />
              </>
            ) : (
              <>
                <div className="absolute inset-0 bg-white/85 backdrop-blur-[1px]" />
                <div className="absolute inset-0 bg-gradient-to-b from-amber-50/60 via-white/40 to-amber-50/80" />
              </>
            )}
          </div>

          <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            {/* Col 1: Title & Subtitle */}
            <div className="lg:col-span-5 flex flex-col items-center lg:items-start text-center lg:text-left space-y-4">
              <div className={`relative flex h-20 w-20 items-center justify-center rounded-full border-2 overflow-hidden shadow-[0_4px_20px_rgba(245,158,11,0.25)] select-none ${
                isDark ? 'border-amber-500/30 bg-black' : 'border-amber-400/50 bg-amber-50'
              }`}>
                <img 
                  src={omShivayaImg} 
                  alt="Om Shivaya" 
                  className="w-full h-full object-cover" 
                />
              </div>
              <h2 className={`text-3xl md:text-4xl lg:text-5xl font-display font-bold tracking-wide ${
                isDark ? 'text-white drop-shadow-[0_2px_8px_rgba(0,0,0,0.95)]' : 'text-amber-900 drop-shadow-none'
              }`}>
                {isHi ? "मंत्र जाप" : "Mantra Japa"}
              </h2>
              <div className={`w-full max-w-xs h-[1px] bg-gradient-to-r from-transparent to-transparent ${
                isDark ? 'via-amber-500/30' : 'via-amber-400/50'
              }`} />
              <p className={`font-bold text-xs md:text-sm tracking-widest leading-relaxed ${
                isDark ? 'text-amber-400 drop-shadow-[0_1.5px_3px_rgba(0,0,0,0.9)]' : 'text-amber-700'
              }`}>
                {isHi ? "—» ध्वनि से ध्यान, ध्यान से शांति, शांति से परमात्मा «—" : "—» Sound to meditation, meditation to peace, peace to Divine «—"}
              </p>
              <div className="flex justify-center w-full lg:justify-start">
                <PinkLotusSvg className="w-8 h-6 shrink-0" fill="#ec4899" opacity={0.95} />
              </div>
            </div>

            {/* Col 2: Why Japa & Action Buttons */}
            <div className="lg:col-span-7 space-y-6 text-center lg:text-left">
              <div className="space-y-3">
                <h3 className={`text-lg md:text-xl font-bold flex items-center justify-center lg:justify-start gap-2 ${
                  isDark ? 'text-amber-300 drop-shadow-md' : 'text-amber-800'
                }`}>
                  <span className={isDark ? 'text-amber-600' : 'text-amber-500'}>❖</span>
                  {isHi ? "मंत्र जाप क्यों करें?" : "Why do Mantra Japa?"}
                  <span className={isDark ? 'text-amber-600' : 'text-amber-500'}>❖</span>
                </h3>
                <p className={`text-sm md:text-base leading-relaxed font-semibold ${
                  isDark ? 'text-stone-100/90 drop-shadow-[0_1px_2px_rgba(0,0,0,0.95)]' : 'text-stone-700'
                }`}>
                  {isHi
                    ? "मंत्रों में अपार शक्ति होती है। नियमित मंत्र जाप से मन शांत होता है, चित्त एकाग्र होता है और जीवन में सकारात्मक ऊर्जा का संचार होता है। यह हमारी आध्यात्मिक यात्रा को गहराई देता है और हमें ईश्वर के और निकट लाता है।"
                    : "Mantras hold immense power. Regular chanting calms the mind, sharpens focus, and fills life with positive energy. It deepens our spiritual journey and brings us closer to the Divine."}
                </p>
              </div>

              <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start pt-2">
                <button
                  onClick={() => document.getElementById("japa-benefits")?.scrollIntoView({ behavior: "smooth" })}
                  className={`group flex items-center justify-center gap-3 rounded-2xl border px-6 py-3 text-sm font-bold active:scale-95 transition-all duration-300 ${
                    isDark
                      ? 'bg-amber-500/10 border-amber-500/25 text-amber-300 hover:bg-amber-500/20 hover:border-amber-500/45'
                      : 'bg-amber-100 border-amber-300/60 text-amber-800 hover:bg-amber-200 hover:border-amber-400'
                  }`}
                >
                  <Heart className={`h-4 w-4 group-hover:scale-110 transition-transform ${
                    isDark ? 'text-amber-300' : 'text-amber-700'
                  }`} />
                  <span>{isHi ? "इसके लाभ" : "Its Benefits"}</span>
                </button>
              </div>
            </div>
          </div>
        </section>

        {/* ── MANTRA CARDS LIST ────────────────────────────────── */}
        <section className="space-y-6">
          <div className={`flex items-center justify-between border-b pb-3 ${
            isDark ? 'border-white/5' : 'border-amber-200/50'
          }`}>
            <h3 className={`text-lg lg:text-xl font-bold flex items-center gap-2 ${
              isDark ? 'text-amber-400' : 'text-amber-800'
            }`}>
              <Sparkles className={`w-5 h-5 ${isDark ? 'text-amber-500' : 'text-amber-600'}`} />
              {copy.selectTitle}
            </h3>
            <div className="flex items-center gap-3">
              <button
                onClick={() => setShowAddMantraModal(true)}
                className={`flex items-center gap-1.5 px-3 py-1.5 border rounded-xl text-xs font-bold active:scale-95 transition-all duration-300 ${
                  isDark
                    ? 'bg-amber-500/10 border-amber-500/30 text-amber-400 hover:bg-amber-500/20 hover:border-amber-500/50'
                    : 'bg-amber-100 border-amber-300/60 text-amber-800 hover:bg-amber-200 hover:border-amber-400'
                }`}
              >
                <Plus className="w-3.5 h-3.5" />
                <span>{isHi ? "नया मंत्र" : "Add Mantra"}</span>
              </button>
              {mantrasLoading && (
                <span className={`text-[11px] animate-pulse ${isDark ? 'text-white/30' : 'text-stone-400'}`}>{isHi ? "लोड हो रहा है..." : "Loading..."}</span>
              )}
            </div>
          </div>

          {mantras.length === 0 && !mantrasLoading ? (
            <div className="text-center py-12">
              <p className="text-white/30 text-sm">{isHi ? "मंत्र लोड नहीं हो सके। कृपया पुनः प्रयास करें।" : "Could not load mantras. Please check your connection."}</p>
              <button onClick={refresh} className="mt-4 text-orange-400 text-xs hover:underline flex items-center gap-1 mx-auto">
                <RotateCcw className="w-3 h-3" /> {isHi ? "पुनः लोड करें" : "Retry"}
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full">
              {mantras.map((m) => {
                const cardData = getMantraCardData(m);
                const image = resolveMantraImage(m);
                const isLastChanted = m.id === lastChantedMantraId;

                return (
                  <motion.div
                    key={m.id}
                    onClick={() => {
                      setSelectedMantraForDetail(m);
                      setSearchParams({
                        practice: "mantra_jap_home",
                        mantraId: m.id,
                      });
                    }}
                    whileHover={{ y: -2 }}
                    role="button"
                    tabIndex={0}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" || e.key === " ") {
                        e.preventDefault();
                        setSelectedMantraForDetail(m);
                        setSearchParams({
                          practice: "mantra_jap_home",
                          mantraId: m.id,
                        });
                      }
                    }}
                    className={`group relative w-full flex items-center rounded-[1.5rem] border p-5 text-left cursor-pointer transition-all duration-300 ${
                      isDark
                        ? isLastChanted
                          ? 'border-amber-500/60 bg-[#1a110d]/90 shadow-[0_0_20px_rgba(245,158,11,0.15)] shadow-lg'
                          : 'border-white/5 bg-[#120a06]/40 hover:border-orange-500/20 hover:bg-black/45 shadow-lg'
                        : isLastChanted
                          ? 'border-amber-400/70 bg-amber-50 shadow-[0_4px_20px_rgba(245,158,11,0.18)] shadow-md'
                          : 'border-stone-200/80 bg-white hover:border-amber-300 hover:bg-amber-50/60 shadow-md hover:shadow-amber-200/50'
                    }`}
                  >
                    {/* Left side: Circular avatar of the deity */}
                    <div className={`relative h-16 w-16 sm:h-20 sm:w-20 shrink-0 overflow-hidden rounded-full border flex items-center justify-center shadow-inner mr-5 transition-colors duration-300 ${
                      isDark
                        ? isLastChanted ? 'border-amber-500/50 bg-black/40' : 'border-white/5 bg-black/40'
                        : isLastChanted ? 'border-amber-400/60 bg-amber-100/60' : 'border-stone-200 bg-stone-50'
                    }`}>
                      {image ? (
                        <img
                          src={image}
                          alt=""
                          className="h-full w-full object-cover transition duration-300 group-hover:scale-105"
                        />
                      ) : (
                        <span className={`text-2xl font-display ${isDark ? 'text-orange-400' : 'text-orange-500'}`}>ॐ</span>
                      )}
                      <div className={`absolute inset-0 bg-gradient-to-t ${
                        isDark ? 'from-black/25 to-transparent' : 'from-amber-900/10 to-transparent'
                      }`} />
                    </div>

                    {/* Middle: Name details and stats row */}
                    <div className="flex-1 min-w-0">
                      <div>
                        <h4 className={`font-serif text-base sm:text-[18px] font-bold leading-tight transition-colors ${
                          isDark
                            ? 'text-white group-hover:text-orange-400'
                            : isLastChanted
                              ? 'text-amber-900 group-hover:text-amber-700'
                              : 'text-stone-800 group-hover:text-amber-800'
                        }`}>
                          {isHi ? m.name_hindi : m.name_english}
                        </h4>
                        <p className={`text-[11px] sm:text-[12px] font-medium mt-0.5 truncate ${
                          isDark ? 'text-white/40' : isLastChanted ? 'text-amber-700/70' : 'text-stone-500'
                        }`}>
                          {m.name_english}
                        </p>
                      </div>

                      {/* Stats row */}
                      <div className="mt-3 flex items-center gap-6 sm:gap-10 w-full">
                        <div>
                          <p className={`text-sm sm:text-base font-bold ${isDark ? 'text-amber-500' : 'text-amber-600'}`}>{cardData.today}</p>
                          <p className={`text-[9px] sm:text-[10px] font-bold uppercase tracking-wider mt-0.5 ${isDark ? 'text-white/30' : 'text-stone-400'}`}>{isHi ? "आज" : "Today"}</p>
                        </div>
                        <div>
                          <p className={`text-sm sm:text-base font-bold ${isDark ? 'text-white/90' : 'text-stone-700'}`}>{cardData.chants.toLocaleString()}</p>
                          <p className={`text-[9px] sm:text-[10px] font-bold uppercase tracking-wider mt-0.5 ${isDark ? 'text-white/30' : 'text-stone-400'}`}>{isHi ? "कुल" : "Lifetime"}</p>
                        </div>
                        <div>
                          <p className={`text-sm sm:text-base font-bold ${isDark ? 'text-white/90' : 'text-stone-700'}`}>{cardData.streak}d</p>
                          <p className={`text-[9px] sm:text-[10px] font-bold uppercase tracking-wider mt-0.5 ${isDark ? 'text-white/30' : 'text-stone-400'}`}>{isHi ? "दिन" : "Streak"}</p>
                        </div>
                      </div>
                    </div>

                    {/* Right side: arrow indicator or delete button */}
                    <div className="shrink-0 flex items-center justify-center px-1 gap-2">
                      {m.id.startsWith("custom-") && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            if (confirm(isHi ? "क्या आप इस मंत्र को हटाना चाहते हैं?" : "Are you sure you want to delete this mantra?")) {
                              deleteCustomMantra(m.id);
                            }
                          }}
                          className="p-2 text-red-500/70 hover:text-red-100 hover:bg-red-500/80 rounded-xl transition-all active:scale-95 z-20"
                          title={isHi ? "मंत्र हटाएं" : "Delete Mantra"}
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                      <ChevronRight className={`w-5 h-5 transition-colors ${
                        isDark ? 'text-white/20 group-hover:text-orange-400' : 'text-stone-300 group-hover:text-amber-600'
                      }`} />
                    </div>
                  </motion.div>
                );
              })}
            </div>
          )}
        </section>

        {/* BEGINNERS GUIDE */}
        <div className="max-w-3xl mx-auto w-full">
          <section className="w-full">
            <div className={`relative backdrop-blur-xl border rounded-[2rem] overflow-hidden shadow-xl transition-all duration-300 ${
              isDark
                ? 'bg-[#130d0a]/60 border-amber-500/15 shadow-black/50'
                : 'bg-white border-amber-200/70 shadow-amber-100/80'
            }`}>
              
              {/* Background only in dark */}
              {isDark && (
                <div className="absolute inset-0 z-0 select-none pointer-events-none">
                  <img 
                    src={devotionalBackground} 
                    alt="Devotional Background" 
                    className="w-full h-full object-cover object-center opacity-30" 
                  />
                  <div className="absolute inset-0 bg-[#0c0705]/85" />
                </div>
              )}

              {/* Header */}
              <button
                onClick={() => setIsBeginnerOpen(!isBeginnerOpen)}
                className={`relative z-10 w-full flex items-center justify-between p-6 transition-colors ${
                  isDark ? 'hover:bg-white/[0.02] active:bg-white/[0.04]' : 'hover:bg-amber-50/60 active:bg-amber-100/60'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className={`flex h-10 w-10 items-center justify-center rounded-xl border ${
                    isDark ? 'bg-amber-500/10 border-amber-500/25 text-amber-400' : 'bg-amber-100 border-amber-300/60 text-amber-700'
                  }`}>
                    <UserRound className="w-5 h-5" />
                  </div>
                  <h3 className={`text-base md:text-lg font-bold text-left tracking-wide ${
                    isDark ? 'text-white drop-shadow-[0_1px_2px_rgba(0,0,0,0.5)]' : 'text-amber-900'
                  }`}>
                    {isHi ? "शुरुआती साधकों के लिए" : "For Beginners"}
                  </h3>
                </div>
                <motion.div
                  animate={{ rotate: isBeginnerOpen ? 180 : 0 }}
                  transition={{ duration: 0.2 }}
                  className={isDark ? 'text-amber-400' : 'text-amber-600'}
                >
                  <ChevronDown className="w-5 h-5" />
                </motion.div>
              </button>

              {/* Collapsible Content */}
              <AnimatePresence initial={false}>
                {isBeginnerOpen && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.3, ease: "easeInOut" }}
                    className={`border-t relative ${
                      isDark ? 'border-white/5' : 'border-amber-200/50'
                    }`}
                  >
                    <div className="p-6 space-y-4.5 relative z-10 max-w-[80%] sm:max-w-[75%]">
                      {[
                        {
                          hi: "🧘 एक मंत्र चुनें और नियमित समय तय करें ✨",
                          en: "🧘 Choose one mantra and set a fixed daily time. ✨",
                        },
                        {
                          hi: "📿 शुरुआत 11, 21 या 108 जाप से करें 🌸",
                          en: "📿 Start with 11, 21, or 108 chants. 🌸",
                        },
                        {
                          hi: "⏰ प्रतिदिन एक ही समय पर अभ्यास करें 💫",
                          en: "⏰ Practice at the same time every day. 💫",
                        },
                        {
                          hi: "❤️ भक्ति, विश्वास और निरंतरता बनाए रखें 🕉️",
                          en: "❤️ Maintain devotion, faith, and consistency. 🕉️",
                        }
                      ].map((item, idx) => (
                        <div key={idx} className="flex items-start gap-4 py-0.5">
                          <PinkLotusSvg className="w-5 h-3 shrink-0 mt-1.5" fill="#ec4899" opacity={0.95} />
                          <span className={`text-sm sm:text-base md:text-[17px] font-bold leading-relaxed ${
                            isDark ? 'text-white drop-shadow-[0_1px_3px_rgba(0,0,0,0.95)]' : 'text-stone-700'
                          }`}>
                            {isHi ? item.hi : item.en}
                          </span>
                        </div>
                      ))}
                    </div>

                    {/* Decorative right side ornament */}
                    <div className="absolute right-0 bottom-0 top-0 w-[25%] opacity-30 md:opacity-50 flex items-center justify-center pointer-events-none select-none overflow-hidden">
                      <div className="relative w-36 h-36 flex items-center justify-center">
                        <div className={`absolute inset-0 rounded-full border border-dashed ${
                          isDark ? 'border-amber-500/20' : 'border-amber-400/30'
                        }`} />
                        <div className={`absolute inset-4 rounded-full border ${
                          isDark ? 'border-amber-500/15' : 'border-amber-400/20'
                        }`} />
                        <div className="absolute flex items-center justify-center">
                          <PinkLotusSvg className="w-10 h-8 shrink-0" fill="#fbbf24" opacity={0.9} />
                        </div>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </section>
        </div>

        {/* FULL WIDTH ROW: मंत्र जाप के लाभ */}
        <section id="japa-benefits" className="space-y-6 scroll-mt-24">
          <h3 className={`text-lg md:text-xl font-bold text-center flex items-center justify-center gap-2 ${
            isDark ? 'text-amber-400' : 'text-amber-800'
          }`}>
            <span className={isDark ? 'text-amber-600' : 'text-amber-500'}>—◆—</span>
            {isHi ? "मंत्र जाप के लाभ" : "Benefits of Mantra Japa"}
            <span className={isDark ? 'text-amber-600' : 'text-amber-500'}>—◆—</span>
          </h3>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6">
            {[
              { icon: YogiIcon, titleHi: "मानसिक शांति", titleEn: "Mental Peace", descHi: "मन के विचार शांत होते हैं और तनाव कम होता है।", descEn: "Calms thoughts, eases the mind, and reduces daily stress." },
              { icon: Target, titleHi: "एकाग्रता में वृद्धि", titleEn: "Enhanced Focus", descHi: "एकाग्रता, स्मरण शक्ति और ध्यान की क्षमता बढ़ती है।", descEn: "Improves concentration, memory retention, and focus." },
              { icon: Sun, titleHi: "सकारात्मक ऊर्जा", titleEn: "Positive Energy", descHi: "नकारात्मकता दूर होती है और सकारात्मक ऊर्जा मिलती है।", descEn: "Dispels negative vibes and fills you with positive energy." },
              { icon: Heart, titleHi: "आध्यात्मिक उन्नति", titleEn: "Spiritual Growth", descHi: "ईश्वर से जुड़ाव गहरा होता है और आध्यात्मिक विकास होता है।", descEn: "Deepens connection with the divine and triggers inner growth." },
            ].map((card, idx) => (
              <div key={idx} className={`backdrop-blur-xl border rounded-[1.25rem] sm:rounded-[1.5rem] p-3.5 sm:p-6 flex flex-col items-center text-center space-y-2.5 sm:space-y-4 transition-all duration-300 hover:-translate-y-1 shadow-lg group ${
                isDark
                  ? 'bg-[#130d0a]/60 border-white/5 hover:border-amber-500/20'
                  : 'bg-white border-stone-200/80 hover:border-amber-300 hover:shadow-amber-100/80'
              }`}>
                <div className={`flex h-11 w-11 sm:h-14 sm:w-14 items-center justify-center rounded-2xl border transition-all ${
                  isDark
                    ? 'bg-amber-500/5 border-amber-500/20 text-amber-400 shadow-[0_0_15px_rgba(245,158,11,0.05)] group-hover:bg-amber-500/10 group-hover:border-amber-500/30'
                    : 'bg-amber-100 border-amber-200/80 text-amber-700 group-hover:bg-amber-200 group-hover:border-amber-300'
                }`}>
                  <card.icon className="w-5 h-5 sm:w-7 sm:h-7" />
                </div>
                <div className="space-y-1.5 sm:space-y-2">
                  <h4 className={`font-bold text-[13px] leading-snug sm:text-base transition-colors ${
                    isDark ? 'text-white group-hover:text-amber-400' : 'text-stone-800 group-hover:text-amber-700'
                  }`}>
                    {isHi ? card.titleHi : card.titleEn}
                  </h4>
                  <p className={`text-[10px] sm:text-xs md:text-sm leading-relaxed ${
                    isDark ? 'text-amber-100/50' : 'text-stone-500'
                  }`}>
                    {isHi ? card.descHi : card.descEn}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </section>

        </div>{/* end max-w inner */}
      </div>{/* end scrollable */}

      {/* ─── ADD CUSTOM MANTRA MODAL ────────────────────────────── */}
      <AnimatePresence>
        {showAddMantraModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fade-in">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className={`relative w-full max-w-md overflow-hidden rounded-3xl border p-6 shadow-2xl ${isDark ? "border-amber-500/20 bg-gradient-to-b from-[#180f0a] to-[#0a0503]" : "border-stone-200 bg-white"}`}
            >
              {/* Close Button */}
              <button
                onClick={() => {
                  setShowAddMantraModal(false);
                  setCustomMantraHindi("");
                  setCustomMantraEnglish("");
                }}
                className={`absolute top-4 right-4 p-2 rounded-full transition-all ${isDark ? "text-white/40 hover:text-white/80 hover:bg-white/5" : "text-stone-400 hover:text-stone-800 hover:bg-stone-100"}`}
              >
                <X className="w-4 h-4" />
              </button>

              <div className="flex items-center gap-2.5 mb-6">
                <PinkLotusSvg className="w-5 h-3 shrink-0" fill="#ec4899" opacity={0.95} />
                <h3 className={`text-lg font-bold font-display ${isDark ? "text-white" : "text-stone-900"}`}>
                  {isHi ? "अपना मंत्र जोड़ें" : "Add Custom Mantra"}
                </h3>
              </div>

              <div className="space-y-4">
                <div>
                  <label className={`block text-xs font-bold uppercase tracking-wider mb-1.5 ${isDark ? "text-amber-400/80" : "text-orange-700"}`}>
                    {isHi ? "मंत्र (हिंदी में)" : "Mantra (in Hindi)"}
                  </label>
                  <input
                    type="text"
                    value={customMantraHindi}
                    onChange={(e) => setCustomMantraHindi(e.target.value)}
                    placeholder={isHi ? "उदा. ॐ नमः शिवाय" : "e.g., ॐ नमः शिवाय"}
                    className={`w-full px-4 py-3 border rounded-xl focus:outline-none transition-all text-sm ${isDark ? "bg-black/40 border-white/10 text-white placeholder-white/20 focus:border-amber-500/50" : "bg-stone-50 border-stone-300 text-stone-900 placeholder-stone-400 focus:border-orange-500"}`}
                  />
                </div>

                <div>
                  <label className={`block text-xs font-bold uppercase tracking-wider mb-1.5 ${isDark ? "text-amber-400/80" : "text-orange-700"}`}>
                    {isHi ? "मंत्र (अंग्रेजी/अनुवाद)" : "Mantra (in English/Transliteration)"}
                  </label>
                  <input
                    type="text"
                    value={customMantraEnglish}
                    onChange={(e) => setCustomMantraEnglish(e.target.value)}
                    placeholder={isHi ? "उदा. Om Namah Shivaya" : "e.g., Om Namah Shivaya"}
                    className={`w-full px-4 py-3 border rounded-xl focus:outline-none transition-all text-sm ${isDark ? "bg-black/40 border-white/10 text-white placeholder-white/20 focus:border-amber-500/50" : "bg-stone-50 border-stone-300 text-stone-900 placeholder-stone-400 focus:border-orange-500"}`}
                  />
                </div>

                <div className="pt-2 flex gap-3">
                  <button
                    onClick={() => {
                      setShowAddMantraModal(false);
                      setCustomMantraHindi("");
                      setCustomMantraEnglish("");
                    }}
                    className={`flex-1 py-3 border rounded-xl text-sm font-bold active:scale-95 transition-all ${isDark ? "bg-white/5 hover:bg-white/10 border-white/5 text-white/80" : "bg-stone-100 hover:bg-stone-200 border-stone-200 text-stone-755 text-stone-700"}`}
                  >
                    {isHi ? "रद्द करें" : "Cancel"}
                  </button>
                  <button
                    onClick={async () => {
                      const hin = customMantraHindi.trim();
                      const eng = customMantraEnglish.trim();
                      if (!hin || !eng) {
                        alert(isHi ? "कृपया दोनों फ़ील्ड भरें।" : "Please fill in both fields.");
                        return;
                      }
                      addCustomMantra(hin, eng);
                      setShowAddMantraModal(false);
                      setCustomMantraHindi("");
                      setCustomMantraEnglish("");
                    }}
                    className={`flex-1 py-3 rounded-xl text-sm font-bold active:scale-95 transition-all ${isDark ? "bg-amber-500 hover:bg-amber-600 text-black" : "bg-orange-500 hover:bg-orange-600 text-white"}`}
                  >
                    {isHi ? "जोड़ें" : "Add Mantra"}
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}
