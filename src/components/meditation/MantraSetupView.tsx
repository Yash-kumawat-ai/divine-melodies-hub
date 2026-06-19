import React, { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowLeft,
  ArrowRight,
  PenSquare,
  Sparkles,
  Heart,
  Activity,
  Users,
  Star,
  Clock,
  Mic,
  Headphones,
  Info,
  ChevronRight,
  ChevronDown,
  Bell,
  User,
  Target,
} from "lucide-react";
import { useLanguage } from "@/hooks/useLanguage";
import { useAuth } from "@/hooks/useAuth";
import type { Mantra } from "@/lib/mantraJapa/mantraJapaApi";
import meditationHighQuality from "@/pages/images/meditation_high_quality.webp";

// ─── CUSTOM GOLD ICONS ───────────────────────────────────────────
const MalaIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.0" strokeLinecap="round" strokeLinejoin="round" {...props}>
    <circle cx="12" cy="10" r="6" strokeDasharray="3 3" />
    <circle cx="12" cy="17" r="1.5" fill="currentColor" />
    <path d="M11 18.5l1 1.5 1-1.5" />
  </svg>
);

const LotusIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" {...props}>
    <path d="M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10z" className="opacity-5" />
    <path d="M12 6c1.5-2.5 4-3.5 6-3.5 1.5 3.5-.5 7-6 10-5.5-3-7.5-6.5-6-10 2 0 4.5 1 6 3.5z" />
    <path d="M12 12.5c2.5-1.5 5.5-2 7.5-.5.5 3-2 6-7.5 7-5.5-1-8-4-7.5-7 2-1.5 5-.5 7.5.5z" />
    <path d="M12 12v9" />
  </svg>
);

const TouchIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" {...props}>
    <path d="M12 12V4a1.5 1.5 0 0 1 3 0v8M9 13V7.5a1.5 1.5 0 0 1 3 0V12" />
    <path d="M6 14.5V11a1.5 1.5 0 0 1 3 0v2.5" />
    <path d="M15 11.5a1.5 1.5 0 0 1 3 0v4a5.5 5.5 0 0 1-11 0V14" />
    <circle cx="13.5" cy="2" r="1.5" className="text-amber-500 fill-current" />
    <path d="M10 2.5a2.5 2.5 0 0 1 7 0" strokeDasharray="1 1" />
  </svg>
);

const OmSymbol = (props: React.SVGProps<SVGSVGElement>) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" {...props}>
    <path d="M6 10c0-2.5 2-4.5 4.5-4.5S15 7.5 15 10c0 4-5 5-5 8h7" />
    <path d="M13 5.5a2.5 2.5 0 0 1 4 0" />
    <circle cx="14.5" cy="2.5" r="1" fill="currentColor" />
  </svg>
);

const ShieldCrossIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" {...props}>
    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
    <path d="M12 8v8M9 12h6" />
  </svg>
);

const LotusFlowerSvg = ({ className = "w-6 h-6", color = "#ec4899" }: { className?: string; color?: string }) => (
  <svg className={className} viewBox="0 0 1006.6461 574.1317" fill={color}>
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

const ManualJapaGraphic = () => (
  <svg className="w-full h-full" viewBox="0 0 160 160" fill="none" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <radialGradient id="malaGlow" cx="50%" cy="50%" r="50%" fx="50%" fy="50%">
        <stop offset="0%" stopColor="#f59e0b" stopOpacity="0.25" />
        <stop offset="60%" stopColor="#b45309" stopOpacity="0.05" />
        <stop offset="100%" stopColor="#000000" stopOpacity="0" />
      </radialGradient>
      
      <radialGradient id="beadGold" cx="35%" cy="35%" r="65%">
        <stop offset="0%" stopColor="#fef3c7" />
        <stop offset="30%" stopColor="#f59e0b" />
        <stop offset="85%" stopColor="#b45309" />
        <stop offset="100%" stopColor="#78350f" />
      </radialGradient>

      <linearGradient id="tasselGrad" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stopColor="#ef4444" />
        <stop offset="40%" stopColor="#dc2626" />
        <stop offset="100%" stopColor="#991b1b" />
      </linearGradient>

      <radialGradient id="tasselGold" cx="30%" cy="30%" r="70%">
        <stop offset="0%" stopColor="#fef3c7" />
        <stop offset="40%" stopColor="#fbbf24" />
        <stop offset="100%" stopColor="#92400e" />
      </radialGradient>
    </defs>

    <circle cx="80" cy="80" r="68" fill="url(#malaGlow)" />
    <circle cx="80" cy="80" r="54" stroke="#f59e0b" strokeWidth="1" strokeOpacity="0.2" strokeDasharray="3 3" />
    
    <path d="M40 100 C 40 50, 120 50, 120 100" stroke="#f59e0b" strokeWidth="0.8" strokeOpacity="0.12" />
    <path d="M48 100 C 48 58, 112 58, 112 100" stroke="#f59e0b" strokeWidth="0.8" strokeOpacity="0.08" />
    <path d="M56 100 C 56 66, 104 66, 104 100" stroke="#f59e0b" strokeWidth="0.8" strokeOpacity="0.05" />
    <line x1="30" y1="100" x2="130" y2="100" stroke="#f59e0b" strokeWidth="0.8" strokeOpacity="0.15" />
    
    <g filter="drop-shadow(0px 4px 8px rgba(0,0,0,0.5))">
      <path d="M 80 32 C 108 32, 120 56, 120 80 C 120 104, 100 120, 80 120 C 60 120, 40 104, 40 80 C 40 56, 52 32, 80 32 Z" stroke="#78350f" strokeWidth="1.5" strokeOpacity="0.4" />
      
      <circle cx="80" cy="32" r="5.5" fill="url(#beadGold)" />
      <circle cx="94" cy="34" r="5.5" fill="url(#beadGold)" />
      <circle cx="107" cy="40" r="5.5" fill="url(#beadGold)" />
      <circle cx="116" cy="50" r="5.5" fill="url(#beadGold)" />
      <circle cx="121" cy="62" r="5.5" fill="url(#beadGold)" />
      <circle cx="122" cy="75" r="5.5" fill="url(#beadGold)" />
      <circle cx="119" cy="88" r="5.5" fill="url(#beadGold)" />
      <circle cx="112" cy="100" r="5.5" fill="url(#beadGold)" />
      <circle cx="102" cy="109" r="5.5" fill="url(#beadGold)" />
      <circle cx="91" cy="115" r="5.5" fill="url(#beadGold)" />
      
      <circle cx="66" cy="34" r="5.5" fill="url(#beadGold)" />
      <circle cx="53" cy="40" r="5.5" fill="url(#beadGold)" />
      <circle cx="44" cy="50" r="5.5" fill="url(#beadGold)" />
      <circle cx="39" cy="62" r="5.5" fill="url(#beadGold)" />
      <circle cx="38" cy="75" r="5.5" fill="url(#beadGold)" />
      <circle cx="41" cy="88" r="5.5" fill="url(#beadGold)" />
      <circle cx="48" cy="100" r="5.5" fill="url(#beadGold)" />
      <circle cx="58" cy="109" r="5.5" fill="url(#beadGold)" />
      <circle cx="69" cy="115" r="5.5" fill="url(#beadGold)" />
      
      <circle cx="80" cy="119" r="7" fill="url(#tasselGold)" />
      <circle cx="80" cy="129" r="4.5" fill="url(#tasselGold)" />
      
      <path d="M 77 133 L 73 150 C 73 152, 75 154, 78 154 L 82 154 C 85 154, 87 152, 87 150 L 83 133 Z" fill="url(#tasselGrad)" />
      <path d="M 78 133 C 78 135, 82 135, 82 133" stroke="#fbbf24" strokeWidth="1.5" />
    </g>
  </svg>
);

const VoiceJapaGraphic = () => (
  <svg className="w-full h-full" viewBox="0 0 160 160" fill="none" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <radialGradient id="voiceGlow" cx="50%" cy="50%" r="50%" fx="50%" fy="50%">
        <stop offset="0%" stopColor="#f59e0b" stopOpacity="0.25" />
        <stop offset="60%" stopColor="#b45309" stopOpacity="0.05" />
        <stop offset="100%" stopColor="#000000" stopOpacity="0" />
      </radialGradient>

      <linearGradient id="micMetal" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0%" stopColor="#fef3c7" />
        <stop offset="40%" stopColor="#fbbf24" />
        <stop offset="70%" stopColor="#d97706" />
        <stop offset="100%" stopColor="#78350f" />
      </linearGradient>
    </defs>

    <circle cx="80" cy="80" r="68" fill="url(#voiceGlow)" />
    <circle cx="80" cy="80" r="54" stroke="#f59e0b" strokeWidth="1" strokeOpacity="0.2" strokeDasharray="3 3" />

    {/* Stylized flute silhouettes */}
    <g transform="translate(48, 20) scale(0.65)" opacity="0.3">
      <path d="M 32 40 C 35 32, 45 32, 48 40 C 47 43, 44 45, 42 48 C 45 49, 48 51, 48 55 C 47 62, 38 65, 35 58 C 30 65, 20 62, 22 55 C 22 51, 25 49, 28 48 C 26 45, 23 43, 22 40 Z" fill="#fbbf24" />
      <path d="M 45 20 C 50 10, 60 15, 52 28 C 48 24, 46 22, 45 20 Z" fill="#fbbf24" />
      <circle cx="48" cy="22" r="2" fill="#ea580c" />
      <path d="M 35 48 C 33 50, 31 52, 30 55 C 28 60, 31 65, 35 68 C 39 65, 42 60, 40 55 Z" fill="#fbbf24" stroke="#d97706" strokeWidth="1" />
      <rect x="5" y="58" width="60" height="3" rx="1.5" fill="#f59e0b" transform="rotate(-15 35 58)" />
      <circle cx="28" cy="61" r="3.5" fill="#fbbf24" />
      <circle cx="42" cy="57" r="3.5" fill="#fbbf24" />
    </g>

    <g stroke="#f59e0b" strokeWidth="1.8" strokeLinecap="round" opacity="0.65">
      <path d="M 46 65 A 18 18 0 0 0 46 95" strokeOpacity="0.4" />
      <path d="M 39 58 A 28 28 0 0 0 39 102" strokeOpacity="0.6" />
      <path d="M 32 51 A 38 38 0 0 0 32 109" strokeOpacity="0.3" />

      <path d="M 114 65 A 18 18 0 0 1 114 95" strokeOpacity="0.4" />
      <path d="M 121 58 A 28 28 0 0 1 121 102" strokeOpacity="0.6" />
      <path d="M 128 51 A 38 38 0 0 1 128 109" strokeOpacity="0.3" />
    </g>

    <g filter="drop-shadow(0px 4px 8px rgba(0,0,0,0.55))">
      <rect x="68" y="45" width="24" height="36" rx="12" fill="url(#micMetal)" stroke="#78350f" strokeWidth="1" />
      <line x1="68" y1="57" x2="92" y2="57" stroke="#78350f" strokeWidth="0.8" strokeOpacity="0.6" />
      <line x1="68" y1="69" x2="92" y2="69" stroke="#78350f" strokeWidth="0.8" strokeOpacity="0.6" />
      <line x1="80" y1="45" x2="80" y2="81" stroke="#78350f" strokeWidth="0.8" strokeOpacity="0.6" />

      <path d="M 60 69 C 60 92, 100 92, 100 69" stroke="url(#micMetal)" strokeWidth="4.5" strokeLinecap="round" />
      
      <rect x="77" y="86" width="6" height="15" fill="url(#micMetal)" stroke="#78350f" strokeWidth="0.5" />
      
      <path d="M 64 101 L 96 101" stroke="url(#micMetal)" strokeWidth="4.5" strokeLinecap="round" />
    </g>
  </svg>
);

// ─── TYPES ───────────────────────────────────────────────────────
type MantraSetupViewProps = {
  mantra: Mantra;
  onBack: () => void;
  onStartJapa: (options: {
    sankalpText: string;
    targetCount: number;
    practiceMode: "mala" | "tap" | "voice" | "guided";
  }) => void;
};

export default function MantraSetupView({
  mantra,
  onBack,
  onStartJapa,
}: MantraSetupViewProps) {
  const { language } = useLanguage();
  const isHi = language === "hi";

  // ─── STATE ──────────────────────────────────────────────────────
  const [selectedSankalpIndex, setSelectedSankalpIndex] = useState(0);
  const [customSankalp, setCustomSankalp] = useState("");
  const [targetCount, setTargetCount] = useState(108);
  const [practiceMode, setPracticeMode] = useState<"mala" | "tap" | "voice" | "guided">("mala");
  const [isSankalpSheetOpen, setIsSankalpSheetOpen] = useState(false);
  const [isGoalSheetOpen, setIsGoalSheetOpen] = useState(false);

  // ─── OPTIONS CONFIGURATION ──────────────────────────────────────
  const sankalpOptions = useMemo(() => [
    {
      id: "inner_peace",
      labelHi: "मानसिक शांति",
      labelEn: "Inner Peace",
      subHi: "मन शांत और एकाग्र करना",
      subEn: "Calm and center the mind",
      icon: LotusIcon,
    },
    {
      id: "healing",
      labelHi: "स्वास्थ्य और कल्याण",
      labelEn: "Health & Healing",
      subHi: "शारीरिक और मानसिक आरोग्यता",
      subEn: "Physical and mental wellness",
      icon: Activity,
    },
    {
      id: "family",
      labelHi: "परिवार कल्याण",
      labelEn: "Family Wellbeing",
      subHi: "प्रियजनों की समृद्धि व सुरक्षा",
      subEn: "Protection and prosperity",
      icon: Users,
    },
    {
      id: "spiritual",
      labelHi: "आध्यात्मिक विकास",
      labelEn: "Spiritual Growth",
      subHi: "चेतना और आत्मज्ञान का उदय",
      subEn: "Rising consciousness",
      icon: Sparkles,
    },
    {
      id: "gratitude",
      labelHi: "कृतज्ञता",
      labelEn: "Gratitude",
      subHi: "संसार के प्रति आभार जताना",
      subEn: "Thankfulness to universe",
      icon: Heart,
    },
    {
      id: "success",
      labelHi: "सफलता",
      labelEn: "Success",
      subHi: "कार्य में बाधाओं का नाश",
      subEn: "Removal of obstacles",
      icon: Star,
    },
  ], []);

  const goalOptions = useMemo(() => [
    { count: 27, labelHi: "चौथाई माला", labelEn: "Quarter Mala", shortHi: "१/४ माला", shortEn: "1/4 Mala", estMin: 2 },
    { count: 54, labelHi: "आधी माला", labelEn: "Half Mala", shortHi: "१/२ माला", shortEn: "1/2 Mala", estMin: 4 },
    {
      count: 108,
      labelHi: "एक माला",
      labelEn: "One Mala",
      shortHi: "१ माला",
      shortEn: "1 Mala",
      estMin: 8,
      recommended: true,
    },
    { count: 216, labelHi: "दो माला", labelEn: "Two Malas", shortHi: "२ माला", shortEn: "2 Malas", estMin: 16 },
    { count: 1008, labelHi: "दस माला", labelEn: "Ten Malas", shortHi: "१० माला", shortEn: "10 Malas", estMin: 75 },
  ], []);

  // Compute values for practice summary
  const currentSankalpText = useMemo(() => {
    if (selectedSankalpIndex === -1 && customSankalp.trim()) {
      return customSankalp.trim();
    }
    const selected = sankalpOptions[selectedSankalpIndex] || sankalpOptions[0];
    return isHi ? selected.labelHi : selected.labelEn;
  }, [customSankalp, selectedSankalpIndex, sankalpOptions, isHi]);

  const currentEstTime = useMemo(() => {
    const matched = goalOptions.find((g) => g.count === targetCount);
    return matched ? matched.estMin : Math.round(targetCount * 0.07);
  }, [targetCount, goalOptions]);

  const handleBegin = () => {
    onStartJapa({
      sankalpText: currentSankalpText,
      targetCount,
      practiceMode,
    });
  };

  return (
    <div className="h-full w-full bg-gradient-to-b from-[#090506] via-[#0c0608] to-[#040205] text-brand-cream/90 font-sans relative select-none flex flex-col md:justify-center overflow-y-auto overflow-x-hidden md:overflow-hidden scrollbar-hide pb-4 pt-1 md:py-8">
      {/* Decorative watermarked background mandala */}
      <div className="absolute top-0 right-[-100px] md:right-0 w-[400px] h-[400px] md:w-[600px] md:h-[600px] opacity-[0.04] pointer-events-none text-amber-500 z-0">
        <svg className="w-full h-full animate-[spin_180s_linear_infinite]" viewBox="0 0 100 105">
          <circle cx="50" cy="50" r="45" fill="none" stroke="currentColor" strokeWidth="0.5" strokeDasharray="3 3" />
          <circle cx="50" cy="50" r="35" fill="none" stroke="currentColor" strokeWidth="0.3" />
          <circle cx="50" cy="50" r="25" fill="none" stroke="currentColor" strokeWidth="0.5" />
          <path d="M50 5 L50 95 M5 50 L95 50 M18 18 L82 82 M18 82 L82 18" stroke="currentColor" strokeWidth="0.2" />
        </svg>
      </div>

      <div className="w-full max-w-md md:max-w-5xl mx-auto px-4 relative z-10 flex-grow flex flex-col md:grid md:grid-cols-12 md:gap-8 justify-between md:justify-center md:items-stretch h-full overflow-y-auto overflow-x-hidden md:overflow-hidden scrollbar-hide pb-2 pt-1 md:py-0">
        
        {/* ─── LEFT COLUMN (HEADER & HERO) ────────────────────────── */}
        <div className="md:col-span-5 flex flex-col justify-between space-y-3 md:space-y-4 h-full">
          
          {/* HEADER BAR */}
          <div className="flex items-center justify-between relative py-1 flex-shrink-0">
            <div className="flex items-center gap-3">
              <button
                onClick={onBack}
                className="w-10 h-10 rounded-full border border-amber-500/20 bg-black/40 hover:bg-black/60 flex items-center justify-center text-amber-400 active:scale-95 transition-all shrink-0"
                aria-label="Go back"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
              <div className="flex items-center gap-2">
                <div className="text-amber-500/90 filter drop-shadow-[0_0_8px_rgba(245,158,11,0.3)] shrink-0">
                  <svg className="w-7 h-7" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12 2.69l.79.88c1.33 1.48 2.67 3.32 2.67 4.93 0 2.21-1.79 4-4 4s-4-1.79-4-4c0-1.61 1.34-3.45 2.67-4.93l.79-.88zm0 18.62l.53-.1c1.82-.36 3.47-1.5 4.41-3.1 1.25-2.13 1.06-4.85-.47-6.78l-.47-.58-2.67 2.67v5.3l-.93.59c-.27.17-.61.1-.8-.16l-.6-.82-2.67-2.67v5.3l.53.1c1.82.36 3.47 1.5 4.41 3.1.2.34.28.73.23 1.12z" />
                  </svg>
                </div>
                <div className="min-w-0">
                  <h1 className="font-display font-black text-sm md:text-base text-amber-400 tracking-wide leading-none">
                    {isHi ? "जप साधना" : "Japa Sadhana"}
                  </h1>
                  <p className="text-[9px] text-brand-cream/50 mt-1 truncate">
                    {isHi ? "अपनी साधना चुनें और आज से आरंभ करें" : "Set your intention and begin practice"}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* HERO SECTION */}
          <div className="relative h-44 md:h-auto md:flex-grow rounded-[28px] overflow-hidden border border-amber-500/15 shadow-lg shadow-amber-950/25 flex-shrink-0 flex flex-col justify-end">
            <img
              src={meditationHighQuality}
              alt="Divine Meditation Scene"
              className="absolute inset-0 w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-stone-950 via-stone-950/45 to-transparent" />
            <div className="absolute inset-0 bg-radial-gradient from-amber-500/10 via-transparent to-transparent pointer-events-none" />
            
            <div className="absolute top-4 right-4 opacity-[0.12] w-20 h-20 md:w-36 md:h-36 text-amber-400 pointer-events-none animate-[spin_120s_linear_infinite]">
              <LotusIcon className="w-full h-full" />
            </div>
            
            <div className="absolute inset-0 p-4 md:p-6 flex flex-col justify-end">
              <span className="text-[9px] md:text-xs font-extrabold text-amber-400 uppercase tracking-widest bg-amber-500/10 border border-amber-500/25 px-2.5 py-0.5 rounded-full w-fit mb-1 md:mb-2 flex items-center gap-1">
                <span>ॐ</span> {isHi ? "आज की साधना" : "Today's Sadhana"}
              </span>
              <h2 className="text-base md:text-2xl font-serif font-black text-amber-100 tracking-wide flex items-center gap-2">
                {isHi ? mantra.name_hindi : mantra.name_english}
              </h2>
              <p className="text-[9px] md:text-xs text-brand-cream/65 mt-0.5 md:mt-2 leading-relaxed max-w-[95%]">
                {isHi 
                  ? "हर मंत्र के साथ अपने मन को शांत करें और ईश्वर से जुड़ें।" 
                  : "Calm your mind with every chant and align with the divine energies."}
              </p>
            </div>
          </div>
        </div>

        {/* ─── RIGHT COLUMN (CONFIGURATION & ACTIONS) ──────────────── */}
        <div className="md:col-span-7 flex flex-col justify-between space-y-3 md:space-y-4 h-full md:justify-center md:py-2">
          
          {/* SACRED CONFIGURATION CARD */}
          <div className="bg-gradient-to-b from-[#1b110b] to-[#120a06] border border-amber-500/20 rounded-[28px] p-3.5 md:p-6 shadow-[0_12px_36px_rgba(24,12,6,0.5)] space-y-3 md:space-y-4 relative flex-shrink-0">
            <div className="absolute -inset-px bg-gradient-to-b from-amber-500/10 to-transparent rounded-[28px] -z-10 pointer-events-none" />

            {/* SANKALP DROPDOWN */}
            <div className="space-y-1 md:space-y-1.5">
              <label className="text-[9px] md:text-[10px] font-bold uppercase tracking-wider text-amber-500/70 block">
                {isHi ? "संकल्प" : "Sankalpa (Intention)"}
              </label>
              <button
                onClick={() => setIsSankalpSheetOpen(true)}
                className="w-full flex items-center justify-between p-2.5 md:p-3 bg-[#0d0704]/90 border border-amber-500/10 hover:border-amber-500/25 rounded-2xl active:scale-[0.99] transition-all text-left"
              >
                <div className="flex items-center gap-3 md:gap-4">
                  <span className="text-sm md:text-base">🌸</span>
                  <div>
                    <div className="text-[9px] md:text-[10px] text-stone-500 font-semibold uppercase tracking-wider">
                      {isHi ? "संकल्प" : "Intention"}
                    </div>
                    <div className="text-xs md:text-sm font-bold text-amber-100 mt-0.5 truncate max-w-[220px] md:max-w-[340px]">
                      {currentSankalpText}
                    </div>
                  </div>
                </div>
                <ChevronDown className="w-4 h-4 text-amber-500/60" />
              </button>
            </div>

            {/* GOAL DROPDOWN */}
            <div className="space-y-1 md:space-y-1.5">
              <label className="text-[9px] md:text-[10px] font-bold uppercase tracking-wider text-amber-500/70 block">
                {isHi ? "लक्ष्य" : "Goal (Target count)"}
              </label>
              <button
                onClick={() => setIsGoalSheetOpen(true)}
                className="w-full flex items-center justify-between p-2.5 md:p-3 bg-[#0d0704]/90 border border-amber-500/10 hover:border-amber-500/25 rounded-2xl active:scale-[0.99] transition-all text-left"
              >
                <div className="flex items-center gap-3 md:gap-4">
                  <span className="text-sm md:text-base">🎯</span>
                  <div>
                    <div className="text-[9px] md:text-[10px] text-stone-500 font-semibold uppercase tracking-wider">
                      {isHi ? "मंत्र संख्या" : "Mantra Count"}
                    </div>
                    <div className="text-xs md:text-sm font-bold text-amber-100 mt-0.5">
                      {targetCount} {isHi ? "मंत्र" : "Mantras"} <span className="text-[9px] md:text-[10px] font-normal text-stone-400">({currentEstTime} {isHi ? "मिनट" : "min"})</span>
                    </div>
                  </div>
                </div>
                <ChevronDown className="w-4 h-4 text-amber-500/60" />
              </button>
            </div>

            {/* PRACTICE MODE (2 Segmented Cards) */}
            <div className="space-y-1.5 md:space-y-2">
              <label className="text-[9px] md:text-[10px] font-bold uppercase tracking-wider text-amber-500/70 block">
                {isHi ? "विधि" : "Practice Mode"}
              </label>
              <div className="grid grid-cols-2 gap-3.5 w-full">
                {/* Mala Jap */}
                <button
                  onClick={() => setPracticeMode("mala")}
                  className={`w-full flex flex-col items-center justify-center py-3.5 px-3 md:py-4 md:px-5 rounded-xl border transition-all text-center relative overflow-hidden group select-none ${
                    practiceMode === "mala"
                      ? "bg-amber-950/20 border-amber-500 text-amber-300 shadow-[0_0_12px_rgba(245,158,11,0.15)]"
                      : "bg-[#0d0704]/60 border-stone-850 text-stone-400 hover:border-amber-500/20"
                  }`}
                >
                  <MalaIcon className={`w-6 h-6 md:w-6.5 md:h-6.5 mb-1.5 transition-transform group-hover:scale-105 ${
                    practiceMode === "mala" ? "text-amber-400 animate-[pulse_3s_infinite]" : "text-stone-500"
                  }`} />
                  <span className="text-xs md:text-sm font-bold block">{isHi ? "माला जप" : "Mala Jap"}</span>
                  <span className="text-[8px] md:text-[9px] opacity-60 block mt-0.5">{isHi ? "Traditional Counting" : "Traditional Counting"}</span>
                  {practiceMode === "mala" && (
                    <div className="absolute top-1.5 right-1.5 w-3.5 h-3.5 rounded-full bg-amber-500 flex items-center justify-center text-[7px] md:text-[8px] text-[#1c120c] font-black">
                      ✓
                    </div>
                  )}
                </button>

                {/* Voice Jap */}
                <button
                  onClick={() => setPracticeMode("voice")}
                  className={`w-full flex flex-col items-center justify-center py-3.5 px-3 md:py-4 md:px-5 rounded-xl border transition-all text-center relative overflow-hidden group select-none ${
                    practiceMode === "voice"
                      ? "bg-amber-950/20 border-amber-500 text-amber-300 shadow-[0_0_12px_rgba(245,158,11,0.15)]"
                      : "bg-[#0d0704]/60 border-stone-850 text-stone-400 hover:border-amber-500/20"
                  }`}
                >
                  <Mic className={`w-5.5 h-5.5 md:w-6 md:h-6 mb-2 transition-transform group-hover:scale-105 ${
                    practiceMode === "voice" ? "text-amber-400 animate-pulse" : "text-stone-500"
                  }`} />
                  <span className="text-xs md:text-sm font-bold block">{isHi ? "स्वर जप" : "Voice Jap"}</span>
                  <span className="text-[8px] md:text-[9px] opacity-60 block mt-0.5">{isHi ? "Automatic Counting" : "Automatic Counting"}</span>
                  {practiceMode === "voice" && (
                    <div className="absolute top-1.5 right-1.5 w-3.5 h-3.5 rounded-full bg-amber-500 flex items-center justify-center text-[7px] md:text-[8px] text-[#1c120c] font-black">
                      ✓
                    </div>
                  )}
                </button>
              </div>
            </div>
          </div>

          {/* LIVE SUMMARY CARD */}
          <div className="bg-[#0c0604]/80 border border-amber-500/10 rounded-2xl p-2.5 md:p-4 shadow-md shadow-black/20 flex-shrink-0">
            <h4 className="text-[8px] md:text-[9px] font-bold uppercase tracking-wider text-amber-500/50 mb-1 md:mb-2 text-center">
              {isHi ? "आपका अभ्यास" : "Your Practice Details"}
            </h4>
            <div className="grid grid-cols-4 gap-0.5 text-center divide-x divide-stone-800">
              <div className="px-1 min-w-0">
                <span className="text-[7.5px] md:text-[8.5px] block text-stone-500 uppercase tracking-wider font-bold">🌸 Sankalp</span>
                <span className="text-[9.5px] md:text-xs font-bold text-amber-100 block truncate mt-0.5">
                  {currentSankalpText}
                </span>
              </div>
              <div className="px-1 min-w-0">
                <span className="text-[7.5px] md:text-[8.5px] block text-stone-500 uppercase tracking-wider font-bold">📿 Method</span>
                <span className="text-[9.5px] md:text-xs font-bold text-amber-100 block truncate mt-0.5">
                  {practiceMode === "voice" ? (isHi ? "स्वर जप" : "Voice Japa") : (isHi ? "माला जप" : "Mala Japa")}
                </span>
              </div>
              <div className="px-1 min-w-0">
                <span className="text-[7.5px] md:text-[8.5px] block text-stone-500 uppercase tracking-wider font-bold">🔢 Count</span>
                <span className="text-[9.5px] md:text-xs font-bold text-amber-100 block truncate mt-0.5">
                  {targetCount}
                </span>
              </div>
              <div className="px-1 min-w-0">
                <span className="text-[7.5px] md:text-[8.5px] block text-stone-500 uppercase tracking-wider font-bold">⏱ Time</span>
                <span className="text-[9.5px] md:text-xs font-bold text-amber-100 block truncate mt-0.5">
                  {currentEstTime} {isHi ? "मिनट" : "min"}
                </span>
              </div>
            </div>
          </div>

          {/* CTA START BUTTON */}
          <div className="pt-1.5 pb-2 w-full flex flex-col items-center gap-2 flex-shrink-0">
            <button
              onClick={handleBegin}
              className="w-[90%] md:w-full h-14 md:h-16 bg-gradient-to-r from-amber-500 via-orange-500 to-red-650 hover:from-amber-600 hover:to-red-750 active:scale-[0.98] text-stone-950 font-black px-6 rounded-2xl flex items-center justify-between shadow-[0_6px_24px_rgba(245,158,11,0.3)] transition-all duration-300 border border-amber-400/20 group cursor-pointer"
            >
              <div className="flex items-center gap-3">
                <span className="text-xl md:text-2xl font-serif text-[#1c120c] leading-none drop-shadow-md">ॐ</span>
                <span className="text-sm md:text-base tracking-wide font-extrabold text-[#1c120c]">
                  {isHi ? "जप प्रारम्भ करें" : "Begin Sadhana"}
                </span>
              </div>
              <div className="flex items-center gap-1 bg-[#1c120c]/10 px-2.5 py-1 rounded-xl border border-white/5 group-hover:bg-[#1c120c]/20 transition-all">
                <ArrowRight className="w-4 h-4 md:w-5 md:h-5 text-[#1c120c] group-hover:translate-x-1 transition-transform" />
              </div>
            </button>

            <p className="text-[8px] md:text-[9px] text-white/30 font-bold uppercase tracking-wider flex items-center gap-1.5 justify-center">
              <ShieldCrossIcon className="w-3 h-3 md:w-3.5 md:h-3.5 text-amber-500/40" />
              {isHi ? "आपकी साधना सुरक्षित और निजी है" : "Your Sadhana is Secure & Private"}
            </p>
          </div>
        </div>

      </div>

      {/* ─── BOTTOM SHEETS ──────────────────────────────────────── */}
      <AnimatePresence>
        {isSankalpSheetOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsSankalpSheetOpen(false)}
              className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50"
            />
            {/* Bottom Sheet Container */}
            <motion.div
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 220 }}
              className="fixed bottom-0 left-0 right-0 max-w-md mx-auto bg-[#140b07] border-t border-amber-500/20 rounded-t-[28px] p-6 pb-8 z-50 text-brand-cream shadow-[0_-8px_32px_rgba(245,158,11,0.15)]"
            >
              {/* Drag handle */}
              <div className="w-12 h-1 bg-stone-850 rounded-full mx-auto mb-5" />
              
              <h3 className="text-base font-bold text-amber-400 mb-4 flex items-center gap-2">
                🌸 {isHi ? "संकल्प का चयन करें" : "Select Intention (Sankalpa)"}
              </h3>
              
              {/* List of options */}
              <div className="space-y-2 max-h-[250px] overflow-y-auto pr-1">
                {sankalpOptions.map((opt, idx) => {
                  const isSelected = selectedSankalpIndex === idx;
                  const Icon = opt.icon;
                  return (
                    <button
                      key={opt.id}
                      onClick={() => {
                        setSelectedSankalpIndex(idx);
                        setIsSankalpSheetOpen(false);
                      }}
                      className={`w-full flex items-center justify-between p-3 rounded-2xl transition-all border ${
                        isSelected
                          ? "bg-amber-950/20 border-amber-500/50 text-amber-300 shadow-md shadow-amber-950/30"
                          : "bg-stone-950/40 border-stone-850 text-stone-300 hover:bg-stone-900/30"
                      }`}
                    >
                      <div className="flex items-center gap-3 text-left">
                        <div className={`p-2 rounded-xl ${isSelected ? "bg-amber-500/20 text-amber-400" : "bg-stone-900 text-stone-400"}`}>
                          <Icon className="w-4 h-4" />
                        </div>
                        <div>
                          <div className="font-bold text-xs">{isHi ? opt.labelHi : opt.labelEn}</div>
                          <div className="text-[10px] text-stone-500">{isHi ? opt.subHi : opt.subEn}</div>
                        </div>
                      </div>
                      {isSelected && (
                        <div className="w-4.5 h-4.5 rounded-full bg-amber-500/20 border border-amber-500 flex items-center justify-center text-[10px] text-amber-400">
                          ✓
                        </div>
                      )}
                    </button>
                  );
                })}
              </div>

              {/* Custom Sankalpa Input */}
              <div className="mt-4 pt-4 border-t border-stone-850">
                <label className="block text-[10px] font-bold uppercase tracking-wider text-stone-500 mb-2">
                  {isHi ? "या अपना स्वयं का संकल्प लिखें:" : "Or write a custom Sankalpa:"}
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={customSankalp}
                    onChange={(e) => {
                      setCustomSankalp(e.target.value);
                      setSelectedSankalpIndex(-1); // custom sankalpa
                    }}
                    placeholder={isHi ? "उदा. सुख और समृद्धि..." : "e.g. Health and Prosperity..."}
                    className="flex-1 bg-stone-950/60 border border-stone-850 focus:border-amber-500/40 focus:outline-none rounded-xl px-4 py-2.5 text-xs text-brand-cream placeholder-stone-700"
                  />
                  {customSankalp.trim() && selectedSankalpIndex === -1 && (
                    <button
                      onClick={() => setIsSankalpSheetOpen(false)}
                      className="bg-amber-500 hover:bg-amber-600 active:scale-95 text-stone-950 font-bold px-4 rounded-xl text-xs transition-all"
                    >
                      {isHi ? "लागू करें" : "Apply"}
                    </button>
                  )}
                </div>
              </div>
            </motion.div>
          </>
        )}
        
        {isGoalSheetOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsGoalSheetOpen(false)}
              className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50"
            />
            {/* Bottom Sheet Container */}
            <motion.div
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 220 }}
              className="fixed bottom-0 left-0 right-0 max-w-md mx-auto bg-[#140b07] border-t border-amber-500/20 rounded-t-[28px] p-6 pb-8 z-50 text-brand-cream shadow-[0_-8px_32px_rgba(245,158,11,0.15)]"
            >
              {/* Drag handle */}
              <div className="w-12 h-1 bg-stone-850 rounded-full mx-auto mb-5" />
              
              <h3 className="text-base font-bold text-amber-400 mb-4 flex items-center gap-2">
                🎯 {isHi ? "लक्ष्य (मंत्र संख्या) का चयन करें" : "Select Goal Count"}
              </h3>
              
              {/* List of Goal options */}
              <div className="space-y-2 max-h-[250px] overflow-y-auto pr-1">
                {goalOptions.map((opt) => {
                  const isSelected = targetCount === opt.count;
                  return (
                    <button
                      key={opt.count}
                      onClick={() => {
                        setTargetCount(opt.count);
                        setIsGoalSheetOpen(false);
                      }}
                      className={`w-full flex items-center justify-between p-3.5 rounded-2xl transition-all border ${
                        isSelected
                          ? "bg-amber-950/20 border-amber-500/50 text-amber-300 shadow-md shadow-amber-950/30"
                          : "bg-stone-950/40 border-stone-850 text-stone-300 hover:bg-stone-900/30"
                      }`}
                    >
                      <div className="flex items-center gap-3 text-left">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-black ${
                          isSelected ? "bg-amber-500/20 text-amber-400" : "bg-stone-900 text-stone-400"
                        }`}>
                          {opt.count}
                        </div>
                        <div>
                          <div className="font-bold text-xs">
                            {isHi ? opt.labelHi : opt.labelEn}
                          </div>
                          <div className="text-[10px] text-stone-500">
                            {isHi ? `अनुमानित समय: ~${opt.estMin} मिनट` : `Est. Time: ~${opt.estMin} min`}
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        {opt.recommended && (
                          <span className="text-[8px] bg-amber-500/10 text-amber-400 border border-amber-500/20 px-2 py-0.5 rounded-full font-bold uppercase tracking-wider">
                            {isHi ? "अनुशंसित" : "Recommended"}
                          </span>
                        )}
                        {isSelected && (
                          <div className="w-4.5 h-4.5 rounded-full bg-amber-500/20 border border-amber-500 flex items-center justify-center text-[10px] text-amber-400">
                            ✓
                          </div>
                        )}
                      </div>
                    </button>
                  );
                })}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

    </div>
  );
}
