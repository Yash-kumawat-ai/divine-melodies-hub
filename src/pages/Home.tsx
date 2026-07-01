import { motion, useInView } from 'framer-motion';
import { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Upload, Search, Users, ShieldCheck, Star, Headphones, ArrowRight, Landmark, Sun, Trophy, Gift } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { SEO } from '@/components/SEO';
import { HeroSection } from '@/components/HeroSection';
import { PromotionalCarousel } from '@/components/PromotionalCarousel';
import SearchBar from '@/components/SearchBar';
import DeityGrid from '@/components/DeityGrid';
import BhajanCard from '@/components/BhajanCard';
import { bhajans as staticBhajans } from '@/data/bhajans';
import { generateBhajanSlug } from '@/lib/slugUtils';
import { supabase } from '@/lib/supabaseClient';
import { useAuth } from '@/hooks/useAuth';
import { useLanguage } from '@/hooks/useLanguage';
import { useBhajanCounts } from '@/hooks/useBhajanCounts';
import { usePresence } from '@/hooks/usePresence';
import { toast } from 'sonner';
import hanumanCommunityBanner from '@/pages/images/hanuman_community_banner_high_quality.webp';
// Feature card images
import panchangImg from '@/pages/images/panchang_spiritual_icon.webp';
import meditationImg from '@/pages/images/meditation_spiritual_icon.webp';
import templeImg from '@/pages/images/temple_icon.webp';
import krishnaAIImg from '@/pages/images/devrishi_narad_icon.webp';
import lyricsImg from '@/pages/images/bhajan_lyrics_icon.webp';
import aartiImg from '@/pages/images/live_aarti_icon.webp';
import posterImg from '@/pages/images/poster_high_quality.webp';
import wallpaperImg from '@/pages/images/dev_wallpaper_high_quality.webp';
import communityImg from '@/pages/images/bhakti_samuday_high_quality.webp';
import naamJapImg from '@/pages/images/naam_jap_high_quality.webp';
import bhajansImg from '@/pages/images/bhajan_sangrah_high_quality(1).webp';
import darshImg from '@/pages/images/darshan_high_quality.webp';

const PinkLotusSvg = ({ className = "w-5 h-5", fill = "#ec4899" }: { className?: string; fill?: string }) => (
  <svg className={className} viewBox="0 0 1006.6461 574.1317" fill={fill} xmlns="http://www.w3.org/2000/svg">
    <g>
      <g id="XMLID_1_">
        <g>
          <path d="M329.5415,301.24c0.38,0.23,0.6,0.73,1.21,1.52c-7.56-0.79-14.12-3.51-20.77-5.83c-21.73-7.59-42.91-16.29-62.15-29.27c-22.42-15.12-40.16-34.46-52.55-58.39c-15.73-30.4-23.02-62.64-18.8-97c0.15-1.16,0.27-2.31,0.36-3.47c0.43-5.77,2.32-7.41,8.01-6.47c9.21,1.52,18.29,3.52,27.04,6.94c18.85,7.38,36.73,16.55,52.48,29.4c5.18,4.24,10.01,9.03,15,15.53c-8.73-3.63-16.16-6.82-23.66-9.82c-15.52-6.21-31.65-10.15-48.12-12.87c-3.71-0.61-4.97,0.1-4.83,4.12c1.3,38.95,14.69,73.19,40.68,102.11c20.24,22.53,45.65,38.61,71.17,54.4C319.5715,295.21,324.5815,298.19,329.5415,301.24z"/>
          <path d="M247.2815,285.15c0.21,0.12,0.23,0.55,0.36,0.91c-1.36,1.3-3.13,0.88-4.68,0.9c-20.87,0.32-41.61-0.68-61.94-5.92c-27.02-6.95-48.38-31.11-46.48-62.21c0.73-11.96,1.22-23.91,3.28-35.74c0.28-1.59-0.16-3.59,1.93-4.17c2.25-0.63,3.18,1.23,4.27,2.7c16.92,22.92,34.76,45.08,53.56,66.49c13.19,15.02,28.75,26.67,46.65,35.35C245.2715,283.96,246.2915,284.54,247.2815,285.15z"/>
          <path d="M239.3115,468.6c1.12,0.04,2.23,0.32,4.08,0.6c-2.91,2.43-5.83,3.18-8.67,3.65c-37.13,6.26-74.16,8.54-110.72-3.46c-17.82-5.85-33.02-16.34-48.06-27.18c-10.95-7.88-19.91-17.58-27.78-28.44c-2.05-2.83-2.25-4.41,1.47-6.2c17.62-8.51,35.86-15.1,55.08-18.86c1.32-0.26,2.92-0.8,3.58,0.7c0.7,1.6-1.09,2.23-2.02,3c-7.48,6.11-15.02,12.15-22.54,18.21c-1.69,1.36-3.05,2.44-0.43,4.52c26.44,21.04,55.44,36.9,88.86,43.55C194.3615,463.11,216.5815,467.62,239.3115,468.6z"/>
          <path d="M458.3115,410.22c-3.14,0-4.84-1.47-6.48-2.66c-16.27-11.85-34.23-20.7-52.63-28.49c-18.02-7.62-37.13-11.68-56.54-14.1c-32.75-4.08-65.7-5.67-98.57-8.19c-18.94-1.45-36.7-7.6-54.22-14.74c-13.97-5.7-27-12.91-39.54-21.16c-1.37-0.9-3.01-3.1-4.65-1.79c-1.89,1.52-0.28,3.78,0.48,5.51c7.21,16.46,18.09,30.65,27.97,45.48c21.69,32.55,51.42,54.52,88.07,67.39c15.99,5.62,32.67,7.78,49.51,8.92c13.61,0.93,27.21,1.97,40.83,0.97c-34.47,9.47-68.88,12.16-104.25,4.61c-35.76-7.64-65.47-25.3-90.65-50.71c-32.98-33.28-49.45-74.02-50.83-120.86c-0.18-5.99-0.44-11.99,0.29-17.97c0.12-0.96,0.49-1.9,0.99-3.73c5.63,5.87,11.11,11.05,16.64,16.17c18.53,17.15,40.56,25.57,65.52,27.23c31.57,2.09,63.18,3.89,94.47,8.88c24.34,3.88,48.72,7.54,72.43,14.6c14.66,4.36,27.12,12.86,38.99,21.92c21,16.03,38.74,35.53,56.11,55.32C454.1915,405.02,455.9815,407.36,458.3115,410.22z"/>
          <path d="M473.6615,424.59c-3.08,4.04-6.38,5.79-9.29,7.96c-2.93,2.18-5.93,4.31-9.06,6.21c-20.79,12.6-41.69,25-63.4,36.02c-13,6.6-26.69,10.22-41.08,11.61c-2.49,0.24-4.98,0.47-7.46,0.79c-1.09,0.14-2.57-0.09-2.89,1.35c-0.26,1.13,0.94,1.66,1.7,2.25c10.57,8.34,22.24,14.38,35.18,18.4c28.92,8.96,52.69-1.67,74.43-19.23c15.13-12.23,26.89-27.67,38.02-43.54c0.65-0.92,1.36-1.8,2.7-3.56c2.85,16.82-0.73,31.24-9.46,44.32c-11.65,17.45-25.24,33.01-43.61,43.95c-13.02,7.75-27.38,11.17-41.94,13.88c-31.22,5.79-59.27-3.52-85.74-19.18c-9.49-5.61-16.99-13.46-22.35-23.1c-4.28-7.7-7.98-15.73-12.03-23.56c-1.81-3.5-0.82-4.85,3.03-4.85c9.49-0.01,18.99-0.02,28.49-0.27c27.41-0.72,53.7-7.22,79.64-15.55c27.64-8.87,54.5-19.66,80.78-31.94C470.3515,426.07,471.4015,425.61,473.6615,424.59z"/>
          <path d="M728.8215,472.99c1.8,2.47-1.02,5.39-2.5099,7.5c-13,18.35-25.66,37.26-45.04,49.59c-18.94,12.06-39.87,18.26-62.61,17.32c-9.49-0.39-19.02-0.17-28.39-1.89c-23.45-4.29-42-17.05-57.92-34.12c-10.16-10.89-17.42-23.52-21.2-38c-2.73-10.48-0.93-20.82,1.16-31.61c2.54,0.94,4.37,2.36,5.19,4.28c6.12,14.22,17.8199,23.86,27.9399,34.87c17.23,18.76,38.4,26.31,63.64,24.92c15.85-0.87,31.2-2.66,45.27-10.53c1.38-0.77,3.78-1.07,3.49-2.99c-0.27-1.8-2.59-1.83-4.18-2.12c-31.07-5.68-58.59-19.26-84.31-37.17c-11.52-8.02-22.53-16.57-32.75-26.16c-0.82-0.77-1.97-1.34-1.85-3.65c5.61,2.02,11.05,3.78,16.33,5.92c25.01,10.1,49.44,21.68,74.92,30.6c30.81,10.78,62.29,17.17,95.1899,12.6C723.7715,471.99,727.4215,471.08,728.8215,472.99z"/>
          <path d="M765.8915,470.94c-0.91-0.28-1.8-0.65-2.7-0.98c0.02-0.45,0.04-0.9,0.05-1.34c6.75-0.49,13.5-1.07,20.25-1.44c29.3-1.61,57.81-7.3,85.54-16.77c15-5.12,27.47-14.9,40.65-23.31c5.8-3.7,10.68-8.48,15.78-13.01c3.01-2.68,2.85-4.77-0.25-7.22c-7.69-6.11-15.27-12.37-22.88-18.57c-1.27-1.03-2.78-1.85-3.57-3.92c1.82-0.72,3.4-0.08,5.06,0.41c18.65,5.5,35.59,14.95,53.17,22.93c2.68,1.21,4.15,2.59,1.7,5.59c-10.65,13.03-21.2,26.07-34.23,36.95c-22.33,18.63-48.64,27.13-76.89,28.59C820.1315,480.27,792.5715,479.14,765.8915,470.94z"/>
          <path d="M911.3415,251.38c2.31,0.84,1.26,3.84,1.16,5.85c-1.84,38.58-11.09,74.9-32.11,107.84c-17.11,26.82-38.36,49.57-65.35,66.35c-25.28,15.73-52.84,24.65-83.01,25.8c-18.46,0.71-36.58-0.01-54.57-4.12c-0.81-0.18-1.63-0.37-2.41-0.64c-0.26-0.09-0.43-0.44-0.99-1.04c9.78-1.07,19.24-2.3,28.73-3.12c33.6-2.89,63.66-15.19,90.95-34.48c11.23-7.94,19.85-18.69,28.42-29.35c12.08-15.02,21.19-31.88,30.53-48.6c1.94-3.48,4.52-6.63,5.53-10.6c0.25-0.95,0.69-2.02-0.39-2.68c-0.91-0.57-1.48,0.4-2.12,0.84c-26.35,17.74-56.04,26.34-86.75,32.71c-30.32,6.29-60.98,8.24-91.78,9.44c-40.43,1.58-77.93,13.14-112.75,33.6c-4.1,2.41-8.26,4.72-12.38,7.08c-0.29-0.34-0.58-0.67-0.86-1c8.11-10.49,16.57-20.65,26.08-29.98c21.3-20.88,47.33-34.3,73.66-47.22c19.56-9.59,40.77-12.79,62.07-15.97c31.37-4.68,63.1-4.51,94.55-8.06c16.98-1.91,33.76-4.97,49.28-12.07c19.22-8.78,36.29-20.9,50.4-36.88C908.4715,253.68,909.3015,250.63,911.3415,251.38z"/>
          <path d="M881.6415,180.38c0.16,11.45,2.06,22.84-0.03,34.36c-1.45,7.99-0.48,16.25-1.56,24.38c-2.59,19.45-14.46,31.25-31.05,39.8c-17.88,9.22-36.98,9.9-56.4,9.42c-9.48-0.24-18.96-0.06-28.44-0.12c-1.57-0.01-3.27,0.6-4.96-0.67c4.44-5.73,11.41-7.16,17.22-10.28c19.89-10.67,38.77-22.54,54.43-39.15c17.17-18.22,32.12-38.13,46.23-58.73c0.79-1.14,1.08-3.3,2.94-2.84C881.6715,176.96,881.6215,178.98,881.6415,180.38z"/>
          <path d="M674.7515,304.57c9.84-6.31,20.78-10.09,30.43-16.31c21.37-13.77,43.46-26.65,61.97-44.33c18.27-17.45,31.36-38.49,38.32-62.8c-3.65-12.76-5.56-26.03-5.5-39.47c-0.02-3.94-1.33-4.86-5.19-5.07c-20.45-1.12-39.54,4.27-58.32,11.44c-1.46,0.55-2.83,1.77-4.98,0.96c7.92-8.73,17.94-13.9,28.1-18.73c18.63-8.85,37.3-17.62,56.7-24.72c1.71-0.63,3.42-1.3,5.17-1.81c7.97-2.37,8.03-2.36,9.32,6.25c6.94,46.28-4.22,87.07-36.77,121.42c-19.96,21.07-43.75,36.64-69.58,49.54c-19.12,9.55-39.02,16.97-59.29,23.53C675.7115,304.61,675.2115,304.54,674.7515,304.57z"/>
          <path d="M616.9015,326.04c-0.42,0.26-0.86,0.53-1.33,0.67c-0.2599,0.07-0.6-0.12-1.77-0.4c6.91-9.09,13.54-17.94,20.31-26.69c14.59-18.88,28.46-38.25,37.86-60.33c7.34-17.25,11.97-35.41,13.64-54.02c1.59-17.72-2.6-34.77-10.06-50.87c-8.21-17.72-17.99-34.55-29.73-50.19c-1.89-2.52-4.09-4.81-6.21-7.15c-6.57-7.26-6.66-7.4-15.49-2.74c-11.77,6.2-23.33,12.79-35.35,20.74c3.21-10.29,8.87-17.77,14.24-25.31c9.83-13.82,19.89-27.46,32.04-39.43c2.42-2.38,4.56-2.66,6.88-0.8c12.18,9.77,25.81,18.14,34.07,31.93c12.71,21.17,23.8199,43.08,29.5099,67.41c3.51,14.99,5.88,30.1,6.2401,45.45c0.48,20.47-4.21,40.06-12.34,58.7C682.0115,272.9,653.7815,303.35,616.9015,326.04z"/>
          <path d="M633.7515,205.47c4.5699,27.76,0.25,54.9-12.66,80.11c-14.77,28.85-32.55,55.78-54.04,80.16c-6.38,7.25-13.71,13.47-21.18,19.62c2.78-5.01,6.89-8.99,10.25-13.52c9-12.15,14.77-26.01,21.7599-39.22c14.33-27.1,18.76-56.32,18.08-86.53c-0.32-14.12-3.91-27.6-9.68-40.5c-9.77-21.81-23.6-40.91-39.37-58.67c-10.95-12.33-22.56-24.04-34.59-35.32c-2.79-2.63-4.79-2.7-7.55-0.19c-18.31,16.7-37.76,32.28-54.17,50.89c-24.8,28.12-39.87,60.71-39.33,98.85c0.41,28.73,8.1,55.65,22.24,81c10.5,18.81,23.29,35.6,37.86,51.24c0.33,0.36,0.6,0.77,0.9,1.16c-19.47-13.31-35.19-30.28-48.33-49.69c-8.3-12.26-17.77-23.82-24.4-37.09c-7.04-14.09-16.24-27.39-18.78-43.34c-3.16-19.91-5.48-39.98-1.87-60.07c2.34-13.08,7.75-25.26,14.66-36.43c12.08-19.53,25.13-38.53,41.97-54.4c16.58-15.63,34.57-29.62,52.58-43.56c5.65-4.37,11.5-8.5,16.99-13.07c2.27-1.89,3.88-1.75,6.17-0.38c13.03,7.8,25.41,16.49,36.99,26.31c17.53,14.86,35.71,29.14,49.52,47.73C614.5715,153.15,629.1115,177.3,633.7515,205.47z"/>
          <path d="M425.2615,95.03c-10.95-4.1-20.48-10.54-30.5-16.06c-14.3-7.88-10.05-9.1-21.71,3.01c-20.46,21.26-35.23,46.16-43.98,74.07c-12.15,38.73-5.17,75.02,18.04,108.18c8.4,12,17.26,23.65,25.18,36c4.56,7.11,10.36,13.42,15.48,20.18c1.12,1.49,2.73,2.88,2.71,5.58c-7.02-3.13-12.43-8.07-18.02-12.54c-21.1-16.9-39.1-36.39-51.76-60.69c-7.65-14.67-14.97-29.16-17.97-45.7c-4.17-23.03-3.1-45.56,2.91-68.13c10.11-37.93,27.93-71.71,53.41-101.5c3.02-3.53,6.25-6.9,10.03-9.7c1.31-0.97,2.16-1.75,3.74-0.26C393.7815,47.24,411.6815,69.4,425.2615,95.03z"/>
        </g>
      </g>
    </g>
  </svg>
);

interface UserBhajan {
  id: string;
  user_id: string;
  title: string;
  title_hindi: string;
  deity_id: number;
  singer_name: string;
  composer_name?: string;
  image_url?: string;
  youtube_url?: string;
  lyrics_hindi: string;
  created_at: string;
  status: string;
}

function AnimatedCounter({ target, label }: { target: number; label: string }) {
  const [count, setCount] = useState(0);
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: '-50px' });

  useEffect(() => {
    if (!inView) return;
    let start = 0;
    const duration = 1500;
    const step = Math.max(1, Math.floor(target / (duration / 16)));
    const timer = setInterval(() => {
      start += step;
      if (start >= target) {
        setCount(target);
        clearInterval(timer);
      } else {
        setCount(start);
      }
    }, 16);
    return () => clearInterval(timer);
  }, [inView, target]);

  return (
    <div ref={ref} className="text-center">
      <p className="text-3xl md:text-4xl font-bold font-display text-brand-saffron tabular-nums">
        {count.toLocaleString()}+
      </p>
      <p className="text-sm text-muted-foreground mt-1">{label}</p>
    </div>
  );
}

const DevotionalDivider = ({ language }: { language: string }) => {
  const isHi = language === 'hi';
  return (
    <div className="w-full relative overflow-hidden py-1 select-none my-1 shrink-0">
      <style dangerouslySetInnerHTML={{__html: `
        @keyframes devMarquee {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
        .dev-marquee-track {
          animation: devMarquee 20s linear infinite;
        }
      `}} />
      
      {/* Top Dotted Line */}
      <div className="w-full border-t border-dotted border-[#D8A35A]/50" />

      {/* Marquee Content */}
      <div className="my-1.5 w-full overflow-hidden flex relative z-10">
        <div className="flex whitespace-nowrap dev-marquee-track gap-4 shrink-0 pr-4">
          {Array.from({ length: 24 }).map((_, i) => (
            <div key={i} className="flex items-center gap-4 shrink-0">
              <span className="text-[#E8B15C]/90 font-semibold tracking-wide text-sm md:text-[18px]">
                {isHi ? 'राम' : 'RAM'}
              </span>
              <span className="text-[#D8A35A]/60 text-[10px] font-serif">✦</span>
            </div>
          ))}
          {/* Duplicate track for seamless infinite looping */}
          {Array.from({ length: 24 }).map((_, i) => (
            <div key={`dup-${i}`} className="flex items-center gap-4 shrink-0" aria-hidden="true">
              <span className="text-[#E8B15C]/90 font-semibold tracking-wide text-sm md:text-[18px]">
                {isHi ? 'राम' : 'RAM'}
              </span>
              <span className="text-[#D8A35A]/60 text-[10px] font-serif">✦</span>
            </div>
          ))}
        </div>
      </div>

      {/* Bottom Dotted Line */}
      <div className="w-full border-t border-dotted border-[#D8A35A]/50" />
    </div>
  );
};

export default function Home() {
  const { t, language } = useLanguage();
  const isHi = language === 'hi';
  const { user } = useAuth();
  const { totalCount: totalBhajanCount } = useBhajanCounts();
  const { onlineCount } = usePresence();
  const navigate = useNavigate();
  const [userBhajans, setUserBhajans] = useState<UserBhajan[]>([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({ bhajans: 0, artists: 0, devotees: 0 });
  const [communityStats, setCommunityStats] = useState({ members: 0, totalJaps: 0, todayParticipants: 0 });

  const features = [
    {
      img: panchangImg,
      emoji: "📅",
      title: isHi ? "पंचांग" : "Panchang",
      subtitle: isHi ? "तिथि · नक्षत्र · मुहूर्त" : "Tithi · Nakshatra · Muhurta",
      desc: isHi ? "आज का पंचांग देखें" : "Check today's Hindu calendar",
      accent: "from-sky-600 to-blue-800",
      glow: "59,130,246",
      route: "/panchang",
    },
    {
      img: meditationImg,
      emoji: "🧘",
      title: isHi ? "ध्यान" : "Meditation",
      subtitle: isHi ? "मन की शांति" : "Peace of Mind",
      desc: isHi ? "ध्यान गाइडेड सेशन" : "Guided meditation sessions",
      accent: "from-violet-600 to-purple-900",
      glow: "139,92,246",
      route: "/meditation",
    },
    {
      img: templeImg,
      emoji: "🛕",
      title: isHi ? "मंदिर" : "Temples",
      subtitle: isHi ? "पवित्र स्थान" : "Sacred Pilgrimages",
      desc: isHi ? "भारत के प्रसिद्ध मंदिर" : "Famous temples of India",
      accent: "from-amber-600 to-orange-900",
      glow: "245,158,11",
      route: "/temple",
    },
    {
      img: krishnaAIImg,
      emoji: "🤖",
      title: isHi ? "कृष्णा एआई" : "Krishna AI",
      subtitle: isHi ? "दिव्य संवाद" : "Divine Conversation",
      desc: isHi ? "एआई से भक्ति ज्ञान पाएं" : "Get devotional wisdom from AI",
      accent: "from-emerald-600 to-teal-900",
      glow: "16,185,129",
      route: "/kirtan-ai",
    },
    {
      img: lyricsImg,
      emoji: "🎼",
      title: isHi ? "गीत व बोल" : "Bhajan Lyrics",
      subtitle: isHi ? "संपूर्ण भजन संग्रह" : "Complete lyric library",
      desc: isHi ? "हजारों भजनों के बोल" : "Lyrics for thousands of bhajans",
      accent: "from-rose-600 to-pink-900",
      glow: "244,63,94",
      route: "/all-bhajans",
    },
    {
      img: aartiImg,
      emoji: "🔔",
      title: isHi ? "लाइव आरती" : "Live Aarti",
      subtitle: isHi ? "प्रतिदिन आरती" : "Daily morning & evening",
      desc: isHi ? "सुबह–शाम की आरती" : "Participate in live aarti",
      accent: "from-yellow-500 to-amber-800",
      glow: "234,179,8",
      route: "/live-aarti",
    },
  ];

  const testimonials = isHi ? [
    { name: 'प्रिया शर्मा', city: 'जयपुर', initials: 'PS', quote: 'राघवम् में भजनों का सबसे संपूर्ण संग्रह है जो मुझे ऑनलाइन मिला है। मैं अपनी सुबह की पूजा के लिए हर दिन इसका उपयोग करती हूँ।' },
    { name: 'रमेश कुमार', city: 'वाराणसी', initials: 'RK', quote: 'मैंने यहाँ अपने दादाजी के दुर्लभ भजन अपलोड किए हैं। यह जानकर बहुत अच्छा लगता है कि वे आने वाली पीढ़ियों के लिए सुरक्षित रहेंगे।' },
    { name: 'अंजलि गुप्ता', city: 'मुंबई', initials: 'AG', quote: 'भजन के बोल बिल्कुल सटीक और पढ़ने में आसान हैं। इस प्लेटफॉर्म की मदद से अब मेरे बच्चे भी शाम की आरती में साथ गाते हैं।' }
  ] : [
    { name: 'Priya Sharma', city: 'Jaipur', initials: 'PS', quote: 'Raghavam has the most complete collection of bhajans I have found online. I use it every morning for my puja.' },
    { name: 'Ramesh Kumar', city: 'Varanasi', initials: 'RK', quote: 'I uploaded my grandfather\'s rare bhajans here. It feels wonderful to know they will be preserved for future generations.' },
    { name: 'Anjali Gupta', city: 'Mumbai', initials: 'AG', quote: 'The lyrics are accurate and easy to read. My children now sing along during our evening aarti thanks to this platform.' },
  ];

  useEffect(() => {
    const fetchData = async () => {
      try {
        const { count: profileCount } = await (supabase as any)
          .from('user_profiles')
          .select('id', { count: 'exact', head: true });

        const { data: uploadSingers } = await (supabase as any)
          .from('user_uploads')
          .select('singer_name')
          .or('status.eq.approved,status.is.null');

        const uniqueSingers = new Set(staticBhajans.map(b => b.singerName.trim()).filter(Boolean));
        if (uploadSingers) {
          uploadSingers.forEach((row: any) => {
            if (row.singer_name) {
              uniqueSingers.add(row.singer_name.trim());
            }
          });
        }

        setStats({
          bhajans: totalBhajanCount,
          artists: uniqueSingers.size,
          devotees: profileCount ?? 0,
        });
      } catch (err) {
        console.error('Error fetching dynamic stats:', err);
        const uniqueSingers = new Set(staticBhajans.map(b => b.singerName.trim()).filter(Boolean));
        setStats({
          bhajans: totalBhajanCount || staticBhajans.length,
          artists: uniqueSingers.size,
          devotees: 0,
        });
      }
    };

    const fetchBhajans = async () => {
      try {
        const { data, error } = await (supabase as any)
          .from('user_uploads')
          .select('*')
          .eq('status', 'approved')
          .order('created_at', { ascending: false })
          .limit(6);
        if (error) throw error;
        if (data) setUserBhajans(data as UserBhajan[]);
      } catch (err) {
        console.error('Error fetching user bhajans:', err);
      } finally {
        setLoading(false);
      }
    };

    const fetchCommunityStats = async () => {
      try {
        // Total registered members
        const { count: memberCount } = await (supabase as any)
          .from('user_profiles')
          .select('id', { count: 'exact', head: true });

        // Total chants and last session date across all users
        const { data: japTotals } = await (supabase as any)
          .from('user_jap_totals')
          .select('user_id, total_chants, last_session_at');

        let totalJaps = 0;
        let todayCount = 0;

        if (japTotals) {
          totalJaps = japTotals.reduce(
            (sum: number, row: any) => sum + (Number(row.total_chants) || 0), 0
          );

          const todayStart = new Date();
          todayStart.setHours(0, 0, 0, 0);

          const activeTodayUserIds = new Set(
            japTotals
              .filter((row: any) => row.last_session_at && new Date(row.last_session_at) >= todayStart)
              .map((row: any) => row.user_id)
          );
          todayCount = activeTodayUserIds.size;
        }

        setCommunityStats({
          members: memberCount ?? 0,
          totalJaps,
          todayParticipants: todayCount,
        });
      } catch (err) {
        console.error('Error fetching community stats:', err);
        setCommunityStats({
          members: 0,
          totalJaps: 0,
          todayParticipants: 0,
        });
      }
    };

    fetchData();
    fetchBhajans();
    fetchCommunityStats();
  }, [totalBhajanCount]);

  const handleUploadClick = () => {
    if (!user) {
      toast.info(language === 'hi' ? 'कृपया भजन अपलोड करने के लिए लॉग इन करें' : 'Please log in to upload bhajans');
      navigate('/auth/login?redirect=/upload-bhajan');
      return;
    }
    navigate('/upload-bhajan');
  };

  return (
    <div>
      <SEO
        title="Raghavam - Indian Bhajans & Devotional Songs"
        description="Discover, share, and preserve Hindu devotional music. Explore bhajans for Krishna, Shiva, Hanuman, Rama and more."
      />

      <HeroSection stats={stats} />
      <DevotionalDivider language={language} />

      {/* ── ALL FEATURES — Square Image Grid (separate from hero) ── */}
      <section className="bg-background py-8 md:py-12 px-3 md:px-6">
        <div className="container mx-auto max-w-6xl">
          {/* Section title */}
          <div className="text-center mb-6 md:mb-8">
            <h2 className="font-serif text-2xl md:text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-amber-200 via-orange-100 to-amber-300">
              {isHi ? 'राघवम् की विशेषताएं' : 'Explore Features'}
            </h2>
            <p className="text-amber-200/40 font-sans text-sm mt-1">
              {isHi ? 'सब कुछ एक जगह — भजन से पंचांग तक' : 'Everything in one place — bhajans to panchang'}
            </p>
          </div>

          {/* Grid — 4-column layout on mobile, 6-column on desktop */}
          <div className="grid grid-cols-4 md:grid-cols-6 gap-2 md:gap-4">
            {([
              { label: isHi ? 'भजन' : 'Bhajans', path: '/all-bhajans' },
              { label: isHi ? 'आरती' : 'Live Aarti', path: '/live-aarti' },
              { label: isHi ? 'पंचांग' : 'Panchang', path: '/panchang' },
              { label: isHi ? 'ध्यान' : 'Meditation', path: '/meditation' },
              { label: isHi ? 'मंदिर' : 'Temples', path: '/temple' },
              { label: isHi ? 'कृष्णा AI' : 'Krishna AI', path: '/kirtan-ai' },
              { label: isHi ? 'गीत बोल' : 'Lyrics', path: '/all-bhajans' },
              { label: isHi ? 'वॉलपेपर' : 'Wallpapers', path: '/wallpaper' },
              { label: isHi ? 'पोस्टर' : 'Posters', path: '/wallpaper?tab=maker' },
              { label: isHi ? 'नाम जप' : 'Japa Counter', path: '/meditation?practice=mantra_jap_home' },
              { label: isHi ? 'समुदाय' : 'Community', path: '/community' },
              { label: isHi ? 'दर्शन' : 'Darshan', path: '/search' },
            ]).map((item, i) => (
              <motion.button
                key={item.label}
                onClick={() => navigate(item.path)}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-30px' }}
                transition={{ delay: i * 0.04, duration: 0.35 }}
                className="group relative aspect-square rounded-2xl md:rounded-3xl overflow-hidden border border-amber-500/10 hover:border-amber-500/50 bg-gradient-to-b from-[#140a05] to-[#0c0502] hover:from-[#1b0e06] hover:to-[#120702] transition-all duration-300 hover:scale-[1.05] hover:-translate-y-1 cursor-pointer flex flex-col items-center justify-center p-3 text-center shadow-[0_6px_20px_rgba(0,0,0,0.55)] hover:shadow-[0_12px_36px_rgba(249,115,22,0.15)] active:scale-[0.97] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-400/60"
              >
                {/* Label (Centered inside card) */}
                <span
                  className="block text-center text-[9px] sm:text-xs md:text-[15px] font-serif font-black uppercase tracking-[0.06em] md:tracking-[0.12em] text-amber-200/90 group-hover:text-amber-300 transition-colors duration-300 leading-normal"
                >
                  {item.label}
                </span>
                
                {/* Micro gold indicator dot */}
                <span className="w-1 h-1 bg-amber-500/40 group-hover:bg-amber-500 rounded-full mt-2 transition-colors duration-300" />
              </motion.button>
            ))}
          </div>
        </div>
      </section>

      {/* Promotional Banner Carousel */}
      <PromotionalCarousel />
      <DevotionalDivider language={language} />

      {/* ── Hanuman Bhakt Community Banner Poster ── */}
      <section className="px-0 py-6 md:py-10">
        <div className="container mx-auto max-w-5xl px-0 sm:px-4">
          <motion.div
            initial={{ opacity: 0, y: 28 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-60px' }}
            transition={{ duration: 0.55, ease: 'easeOut' }}
            className="relative overflow-hidden w-full rounded-none sm:rounded-2xl"
          >
            {/* The actual poster image - scales naturally without cropping */}
            <img
              src={hanumanCommunityBanner}
              alt="Hanuman Bhakt Community"
              className="w-full h-auto block"
            />

            {/* Clickable link covering the whole banner (except the button) */}
            <Link to="/community" className="absolute inset-0 z-10 cursor-pointer">
              <span className="sr-only">{isHi ? 'शामिल हों' : 'Join Now'}</span>
            </Link>

            {/* CTA Button in the bottom-right corner of the poster */}
            <div className="absolute bottom-[4%] right-[4%] z-20 w-auto">
              <Link
                to="/community"
                className="inline-flex items-center justify-center gap-1.5 px-3 py-1.5 md:px-5 md:py-2 rounded-lg font-sans font-black text-[9px] md:text-xs uppercase tracking-widest text-stone-950 transition-all hover:scale-[1.04] active:scale-95 shadow-[0_4px_16px_rgba(234,88,12,0.4)]"
                style={{
                  background: 'linear-gradient(135deg, #f5a623 0%, #e67c00 100%)',
                }}
              >
                <PinkLotusSvg className="w-3.5 h-3.5 md:w-4.5 md:h-4.5" />
                <span>{isHi ? 'शामिल हों' : 'Join Now'}</span>
                <ArrowRight className="w-3.5 h-3.5 md:w-4 h-4 text-stone-950" />
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Deity Grid */}
      <DeityGrid />
      <DevotionalDivider language={language} />

      {/* Community Bhajans */}
      {!loading && userBhajans.length > 0 && (
        <section className="py-16 px-4 bg-background">
          <div className="container mx-auto max-w-6xl">
            <h2 className="font-display text-3xl md:text-4xl font-bold text-center mb-3 text-foreground">
              {t('communityBhajans')}
            </h2>
            <p className="text-center text-muted-foreground text-lg mb-10">
              {t('sharedByOurCommunity')}
            </p>
            <div className="mb-10 flex justify-center">
              <Button asChild variant="outline" className="rounded-full px-6">
                <Link to="/all-bhajans">{isHi ? 'और देखें' : 'View more'}</Link>
              </Button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {userBhajans.map((bhajan) => {
                const convertedBhajan = {
                  id: parseInt(bhajan.id),
                  slug: generateBhajanSlug(bhajan.title),
                  title: bhajan.title,
                  titleHindi: bhajan.title_hindi,
                  deityId: bhajan.deity_id,
                  singerName: bhajan.singer_name,
                  composerName: bhajan.composer_name || '',
                  lyricsHindi: bhajan.lyrics_hindi,
                  lyricsTransliteration: '',
                  youtubeUrl: bhajan.youtube_url || '',
                  playCount: 0,
                  rating: 0,
                  tags: [],
                  featured: false,
                };
                return <BhajanCard key={bhajan.id} bhajan={convertedBhajan} />;
              })}
            </div>
          </div>
        </section>
      )}

      {/* Features */}
      <section className="py-20 px-4 bg-background relative overflow-hidden">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-amber-500/5 rounded-full blur-3xl" />
          <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-orange-500/5 rounded-full blur-3xl" />
        </div>
        <div className="container mx-auto max-w-6xl relative">
          {/* Section Header */}
          <div className="text-center mb-12">
            <span className="inline-block px-4 py-1.5 mb-4 rounded-full text-xs font-black uppercase tracking-widest font-sans border border-amber-500/30 bg-amber-500/10 text-amber-400">
              {isHi ? "राघवम् की विशेषताएं" : "Platform Features"}
            </span>
            <h2 className="font-serif text-4xl md:text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-amber-200 via-orange-100 to-amber-300 mb-3">
              {isHi ? "सब कुछ एक जगह" : "Everything You Need"}
            </h2>
            <p className="text-amber-200/45 font-sans text-base md:text-lg max-w-xl mx-auto">
              {isHi ? "भक्ति की संपूर्ण डिजिटल यात्रा" : "Your complete digital devotion journey"}
            </p>
          </div>

          {/* 3 x 2 Feature Grid with real images */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 md:gap-5">
            {features.map((f, i) => (
              <motion.div
                key={f.title}
                onClick={() => navigate(f.route)}
                className="relative group cursor-pointer rounded-3xl overflow-hidden border border-white/8 hover:border-white/18 transition-all duration-500 hover:scale-[1.03] select-none"
                style={{ boxShadow: `0 0 0 0 rgba(${f.glow},0)` }}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-40px' }}
                transition={{ delay: i * 0.07, duration: 0.4 }}
                whileHover={{ boxShadow: `0 16px 48px rgba(${f.glow},0.22)` }}
              >
                {/* Image top half */}
                <div className="relative w-full aspect-square">
                  {/* Image fills the full card */}
                  <img
                    src={f.img}
                    alt={f.title}
                    className="absolute inset-0 w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-700"
                  />
                  {/* Gradient overlay — dark at bottom for text contrast */}
                  <div className={`absolute inset-0 bg-gradient-to-t ${f.accent} opacity-60 group-hover:opacity-70 transition-opacity duration-500`} />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-black/10" />

                  {/* Glow top-right */}
                  <div
                    className="absolute -top-4 -right-4 w-24 h-24 rounded-full opacity-30 blur-xl group-hover:opacity-50 transition-opacity duration-500"
                    style={{ backgroundColor: `rgb(${f.glow})` }}
                  />

                  {/* Emoji badge top-left */}
                  <div
                    className="absolute top-3 left-3 w-9 h-9 md:w-11 md:h-11 rounded-xl flex items-center justify-center text-base md:text-xl shadow-lg border border-white/15 backdrop-blur-sm"
                    style={{ backgroundColor: `rgba(${f.glow},0.35)` }}
                  >
                    {f.emoji}
                  </div>

                  {/* Arrow icon top-right — appears on hover */}
                  <div
                    className="absolute top-3 right-3 w-7 h-7 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300 backdrop-blur-sm border border-white/20"
                    style={{ backgroundColor: `rgba(${f.glow},0.5)` }}
                  >
                    <ArrowRight className="w-3.5 h-3.5 text-white" />
                  </div>

                  {/* Text — overlaid at bottom of image */}
                  <div className="absolute bottom-0 left-0 right-0 p-3 md:p-4">
                    <p className="text-[9px] md:text-[10px] font-black uppercase tracking-widest font-sans text-white/55 mb-0.5">{f.subtitle}</p>
                    <h3 className="font-serif text-sm md:text-lg font-black text-white leading-tight drop-shadow-[0_2px_8px_rgba(0,0,0,0.8)]">{f.title}</h3>
                    <p className="text-[9px] md:text-[11px] font-sans text-white/50 leading-snug mt-1 hidden md:block">{f.desc}</p>
                  </div>

                  {/* Bottom shimmer edge on hover */}
                  <div
                    className="absolute bottom-0 left-0 right-0 h-0.5 opacity-0 group-hover:opacity-100 transition-opacity duration-500"
                    style={{ background: `linear-gradient(to right, transparent, rgb(${f.glow}), transparent)` }}
                  />
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>
      <DevotionalDivider language={language} />

      {/* Testimonials */}
      <section className="py-20 px-4 bg-background">
        <div className="container mx-auto max-w-5xl">
          <h2 className="font-display text-3xl md:text-4xl font-bold text-center mb-12 text-foreground">
            {t('lovedByDevotees')}
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {testimonials.map((item) => (
              <motion.div
                key={item.name}
                className="rounded-2xl border border-border bg-card p-6"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-50px' }}
              >
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-full bg-brand-saffron/10 flex items-center justify-center font-bold text-brand-saffron text-sm">
                    {item.initials}
                  </div>
                  <div>
                    <p className="font-semibold text-foreground text-sm">{item.name}</p>
                    <p className="text-xs text-muted-foreground">{item.city}</p>
                  </div>
                </div>
                <div className="flex gap-0.5 mb-3">
                  {[1, 2, 3, 4, 5].map((s) => (
                    <Star key={s} className="w-4 h-4 fill-brand-gold text-brand-gold" />
                  ))}
                </div>
                <p className="text-sm text-muted-foreground leading-relaxed">"{item.quote}"</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Banner */}
      <section className="py-20 px-4 bg-gradient-to-r from-brand-saffron to-brand-gold">
        <div className="container mx-auto max-w-3xl text-center">
          <Headphones className="w-12 h-12 text-white/80 mx-auto mb-4" />
          <h2 className="font-display text-3xl md:text-4xl font-bold text-white mb-4">
            {t('joinThousands')}
          </h2>
          <p className="text-white/80 text-lg mb-8 max-w-lg mx-auto">
            {t('joinThousandsSubtitle')}
          </p>
          <Button asChild size="lg" className="bg-white text-brand-saffron hover:bg-brand-cream font-bold px-8 h-12 text-base rounded-xl">
            <Link to="/auth/signup">
              {t('getStartedFree')}
              <ArrowRight className="w-5 h-5 ml-2" />
            </Link>
          </Button>
        </div>
      </section>

    </div>
  );
}
