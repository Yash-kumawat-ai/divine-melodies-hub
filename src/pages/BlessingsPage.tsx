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
  ChevronUp,
  ChevronDown,
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
  RotateCw,
  Trash2,
  Circle,
  Square,
  Eye,
  EyeOff,
  Plus,
  Type
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
import type { DailyDarshan, DevotionalWallpaper, DevotionalLiveWallpaper, Petal, PosterTemplate, BlessingsPosterEditorProps } from "./Blessings";
import { DAILY_DARSHANS, WALLPAPERS_LIST, LIVE_WALLPAPERS_LIST, WALLPAPER_SECTIONS, WEEKDAYS, POSTER_TEMPLATES, MoreIcon, CustomDownloadIcon, CircleIcon, PosterLikeButton, WallpaperLikeButton, PetalsOverlay, AuraOverlay, FlameOverlay, ShimmerOverlay, PhoneFrame } from "./Blessings";
import Moveable from "react-moveable";

// ─── LOCAL IMAGES STILL USED DIRECTLY IN THIS FILE ────────────────
import litDiyaImg from "./images/lit_diya.png";
import shivWallpaperImg from "./images/shiv_wallpaper.webp";
import deityRamImg from "./images/deity-ram.webp";
import krishnaImg from "./images/krishna main.webp";
import hanumanImg from "./images/Hanumanji_HD_WebP.webp";
import radhaKrishnaImg from "./images/radha_krishna_hd mayapur tv.webp";
import shyamMandirImg from "./images/shyam_mandir_desktop_hd.webp";
import mandalaGoldImg from "./images/mandala-gold.svg";
import mandalaBeigeImg from "./images/mandala-beige.svg";
import devotionalHeaderBg from "./images/devotional_background_high_quality(1).webp";
import omSvg from "./images/om.svg";

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

// ─── CONSTANTS & DATA ── (extracted to ./Blessings/constants.ts) ───
// PosterTemplate exported from ./Blessings/types.ts
export type { PosterTemplate } from "./Blessings/types";
export { POSTER_TEMPLATES } from "./Blessings/constants";

// ─── POSTER LIKE BUTTON ── (extracted to ./Blessings/components/PosterLikeButton.tsx) ───


// Subcomponent: Dedicated Devotee Poster Editor (New Flow mockup)
// BlessingsPosterEditorProps interface is in ./Blessings/types.ts

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
          className="px-5 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 text-stone-950 font-sans font-bold text-xs uppercase tracking-wider shadow-lg active:scale-95 transition-all cursor-pointer flex items-center gap-1.5"
        >
          <Check className="w-4 h-4" />
          <span>{isHi ? "संपन्न" : "Done"}</span>
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
            { id: "shape", label: isHi ? "आकार" : "Shape", icon: <Circle className="w-4 h-4" /> },
            { id: "move", label: isHi ? "खिसकाएं" : "Move", icon: <Move className="w-4 h-4" /> },
            { id: "resize", label: isHi ? "आकार बदलें" : "Resize", icon: <Maximize2 className="w-4 h-4" /> },
            { id: "rotate", label: isHi ? "घुमाएं" : "Rotate", icon: <RotateCw className="w-4 h-4" /> },
            { id: "reset", label: isHi ? "पुनः सेट" : "Reset", icon: <RotateCcw className="w-4 h-4" /> }
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
                  "flex flex-col items-center justify-center gap-1.5 py-3 border-b-2 text-xs font-semibold tracking-wide transition-all cursor-pointer select-none",
                  isTabActive
                    ? "border-amber-500 bg-amber-500/10 text-amber-400 font-bold"
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
                  <span className="text-xs text-stone-400 font-bold uppercase tracking-wider block text-left">
                    {isHi ? "तस्वीर का आकार चुनें" : "Shape Options"}
                  </span>
                  <div className="grid grid-cols-4 gap-2">
                    {[
                      { id: "circle", label: isHi ? "वृत्ताकार" : "Circle", icon: <Circle className="w-3.5 h-3.5" /> },
                      { id: "square", label: isHi ? "वर्गाकार" : "Square", icon: <Square className="w-3.5 h-3.5" /> },
                      { id: "rounded-square", label: isHi ? "मुड़ा वर्गाकार" : "Rounded", icon: <Square className="w-3.5 h-3.5 rounded-sm" /> },
                      { id: "oval", label: isHi ? "दीर्घवृत्ताकार" : "Oval", icon: <Circle className="w-3.5 h-3.5 scale-x-125" /> },
                    ].map((s) => (
                      <button
                        key={s.id}
                        onClick={() => setShape(s.id as any)}
                        className={cn(
                          "py-2 px-1 rounded-xl border border-[#651317] text-xs font-bold transition-all cursor-pointer select-none flex items-center justify-center gap-1.5",
                          shape === s.id
                            ? "bg-amber-500/20 border-amber-500 text-amber-300 font-extrabold shadow-sm"
                            : "bg-transparent border-[#651317] hover:border-amber-500/40 text-stone-300 hover:text-white"
                        )}
                      >
                        {s.icon}
                        <span>{s.label}</span>
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
              <span className="text-xs text-stone-400 font-bold uppercase tracking-wider block text-center mb-1">
                {isHi ? "स्थान सूक्ष्म समायोजन" : "Fine-Tune Position"}
              </span>
              <div className="flex flex-col items-center gap-1.5">
                <button 
                  onClick={() => setOffsetY(prev => prev - 2)}
                  className="w-10 h-8 rounded-lg bg-white/5 hover:bg-white/10 flex items-center justify-center text-amber-400 border border-[#651317] cursor-pointer active:scale-90"
                >
                  <ChevronUp className="w-4 h-4" />
                </button>
                <div className="flex gap-4">
                  <button 
                    onClick={() => setOffsetX(prev => prev - 2)}
                    className="w-10 h-8 rounded-lg bg-white/5 hover:bg-white/10 flex items-center justify-center text-amber-400 border border-[#651317] cursor-pointer active:scale-90"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                  <button 
                    onClick={() => { setOffsetX(0); setOffsetY(0); }}
                    className="px-3 h-8 rounded-lg bg-white/5 flex items-center justify-center text-xs text-stone-300 font-bold uppercase tracking-wider border border-[#651317] cursor-pointer"
                  >
                    {isHi ? "मध्य में" : "Center"}
                  </button>
                  <button 
                    onClick={() => setOffsetX(prev => prev + 2)}
                    className="w-10 h-8 rounded-lg bg-white/5 hover:bg-white/10 flex items-center justify-center text-amber-400 border border-[#651317] cursor-pointer active:scale-90"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
                <button 
                  onClick={() => setOffsetY(prev => prev + 2)}
                  className="w-10 h-8 rounded-lg bg-white/5 hover:bg-white/10 flex items-center justify-center text-amber-400 border border-[#651317] cursor-pointer active:scale-90"
                >
                  <ChevronDown className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {/* resize panel */}
          {activeTab === "resize" && (
            <div className="space-y-4">
              {poster.allowShapeChange && (
                <div className="space-y-1 text-left">
                  <div className="flex justify-between text-xs text-stone-400 font-bold uppercase tracking-wider">
                    <span>{isHi ? "फ़्रेम का आकार" : "Adjust Circle Size"}</span>
                    <span className="font-sans text-amber-400">{frameScale.toFixed(2)}x</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => setFrameScale(prev => Math.max(0.4, prev - 0.05))}
                      className="w-6 h-6 rounded bg-white/5 hover:bg-white/10 flex items-center justify-center text-xs font-bold text-amber-300 border border-[#651317] cursor-pointer"
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
                      className="w-6 h-6 rounded bg-white/5 hover:bg-white/10 flex items-center justify-center text-xs font-bold text-amber-300 border border-[#651317] cursor-pointer"
                    >
                      +
                    </button>
                  </div>
                </div>
              )}

              <div className="space-y-1 text-left">
                <div className="flex justify-between text-xs text-stone-400 font-bold uppercase tracking-wider">
                  <span>{isHi ? "तस्वीर का ज़ूम" : "Zoom Photo"}</span>
                  <span className="font-sans text-amber-400">{photoZoom.toFixed(2)}x</span>
                </div>
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => setPhotoZoom(prev => Math.max(0.8, prev - 0.05))}
                    className="w-6 h-6 rounded bg-white/5 hover:bg-white/10 flex items-center justify-center text-xs font-bold text-amber-300 border border-[#651317] cursor-pointer"
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
                    className="w-6 h-6 rounded bg-white/5 hover:bg-white/10 flex items-center justify-center text-xs font-bold text-amber-300 border border-[#651317] cursor-pointer"
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
              <div className="flex justify-between text-xs text-stone-400 font-bold uppercase tracking-wider">
                <span>{isHi ? "तस्वीर घुमाएं" : "Frame Rotation"}</span>
                <span className="font-sans text-amber-400">{Math.round((rotation * 180) / Math.PI)}°</span>
              </div>
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setRotation(prev => prev - (5 * Math.PI) / 180)}
                  className="w-6 h-6 rounded bg-white/5 hover:bg-white/10 flex items-center justify-center text-xs font-bold text-amber-300 border border-[#651317] cursor-pointer"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
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
                  className="w-6 h-6 rounded bg-white/5 hover:bg-white/10 flex items-center justify-center text-xs font-bold text-amber-300 border border-[#651317] cursor-pointer"
                >
                  <RotateCw className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          )}

          {/* Adjust Photo Inside Helper Row */}
          <div className="border-t border-white/5 pt-3.5 space-y-2">
            <span className="text-xs text-stone-400 font-bold uppercase tracking-wider block text-left">
              {isHi ? "तस्वीर समायोजन निर्देश" : "Adjust Photo Inside"}
            </span>
            <div className="grid grid-cols-3 gap-2">
              <div className="bg-white/5 rounded-xl p-2.5 flex flex-col items-center justify-center gap-1.5 border border-[#651317]">
                <svg className="w-5 h-5 text-amber-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M15 3h6v6M9 21H3v-6M21 3l-7 7M3 21l7-7"/></svg>
                <span className="text-xs font-sans font-bold text-stone-300 text-center tracking-wide leading-tight">
                  {isHi ? "स्थान बदलें" : "Drag to Move"}
                </span>
              </div>
              <div className="bg-white/5 rounded-xl p-2.5 flex flex-col items-center justify-center gap-1.5 border border-[#651317]">
                <svg className="w-5 h-5 text-amber-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3M11 8v6M8 11h6"/></svg>
                <span className="text-xs font-sans font-bold text-stone-300 text-center tracking-wide leading-tight">
                  {isHi ? "पिंच ज़ूम" : "Pinch to Zoom"}
                </span>
              </div>
              <div className="bg-white/5 rounded-xl p-2.5 flex flex-col items-center justify-center gap-1.5 border border-[#651317]">
                <svg className="w-5 h-5 text-amber-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="m15 18-2 2-2-2M9 6l2-2 2 2M11 4v16"/></svg>
                <span className="text-xs font-sans font-bold text-stone-300 text-center tracking-wide leading-tight">
                  {isHi ? "डबल टैप रीसेट" : "Double Tap Reset"}
                </span>
              </div>
            </div>
          </div>

          {/* Reset All Button - Colorless with maroon border */}
          <button
            onClick={handleResetAll}
            className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl bg-transparent hover:bg-white/5 text-xs font-bold text-stone-300 border border-[#651317] transition-all active:scale-98 cursor-pointer select-none"
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
// ─── LIVE WALLPAPER OVERLAYS ── (extracted to ./Blessings/components/Overlays.tsx) ───
// PetalsOverlay, AuraOverlay, FlameOverlay, ShimmerOverlay

// ─── PHONE CONTAINER MOCKUP ── (extracted to ./Blessings/components/PhoneFrame.tsx) ───


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

  const [isDark, setIsDark] = useState(() => document.documentElement.classList.contains('dark'));
  useEffect(() => {
    const observer = new MutationObserver(() => {
      setIsDark(document.documentElement.classList.contains('dark'));
    });
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] });
    return () => observer.disconnect();
  }, []);

  const userTier = (profile as any)?.subscription_tier || "free";

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
  const previousSelectedPosterRef = useRef<PosterTemplate | null>(null);
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
  const [hidePhotoFrame, setHidePhotoFrame] = useState(false);
  const [posterRotation, setPosterRotation] = useState<number>(0);
  const [isEditingPhoto, setIsEditingPhoto] = useState<boolean>(false);
  const [showEditorModal, setShowEditorModal] = useState<boolean>(false);
  const [posterActiveTab, setPosterActiveTab] = useState<"shape" | "move" | "resize" | "rotate" | "reset">("shape");
  const [posterNameOffsetX, setPosterNameOffsetX] = useState<number>(0);
  const [posterNameOffsetY, setPosterNameOffsetY] = useState<number>(0);
  const [posterNameScale, setPosterNameScale] = useState<number>(1.0);
  const [posterNameRotation, setPosterNameRotation] = useState<number>(0);
  const [posterNameShape, setPosterNameShape] = useState<"circle" | "square" | "rounded-square" | "oval">("rounded-square");
  const [extraTextBoxes, setExtraTextBoxes] = useState<Array<{ id: string; text: string; offsetX: number; offsetY: number; scale: number; rotation: number; shape: "circle" | "square" | "rounded-square" | "oval" }>>([]);
  const [editingElement, setEditingElement] = useState<string>("photo");

  const posterCardRef = useRef<HTMLDivElement>(null);
  const photoLayerRef = useRef<HTMLDivElement>(null);
  const nameLayerRef = useRef<HTMLDivElement>(null);
  const boxLayerRefs = useRef<Record<string, HTMLDivElement | null>>({});

  const handleAddTextBox = () => {
    const newId = `text_${Date.now()}`;
    const newBox = {
      id: newId,
      text: "",
      offsetX: 0,
      offsetY: (extraTextBoxes.length + 1) * 45,
      scale: 1.0,
      rotation: 0,
      shape: "rounded-square" as const,
    };
    setExtraTextBoxes(prev => [...prev, newBox]);
    setEditingElement(newId);
  };

  const handleRemoveTextBox = (id: string) => {
    setExtraTextBoxes(prev => prev.filter(b => b.id !== id));
    if (editingElement === id) {
      setEditingElement("name");
    }
  };

  const handleUpdateCustomTextBox = (id: string, updates: Partial<{ text: string; offsetX: number; offsetY: number; scale: number; rotation: number; shape: "circle" | "square" | "rounded-square" | "oval" }>) => {
    setExtraTextBoxes(prev => prev.map(b => b.id === id ? { ...b, ...updates } : b));
  };
  const [cropModalOpen, setCropModalOpen] = useState(false);
  const [cropImageSrc, setCropImageSrc] = useState<string | null>(null);
  const [cropTarget, setCropTarget] = useState<'temp' | 'user'>('temp');

  const [selectedTemplate, setSelectedTemplate] = useState<"golden" | "crimson" | "peacock" | "white">("golden");
  const [generationType, setGenerationType] = useState<"status" | "square">("status");
  const [savedBlessings, setSavedBlessings] = useState<string[]>([]);
  const [streakCount, setStreakCount] = useState(0);
  const [completedDates, setCompletedDates] = useState<string[]>([]);
  const [selectedDeityFilter, setSelectedDeityFilter] = useState<string | null>(
    () => {
      const deityParam = searchParams.get("deity");
      if (deityParam) {
        const norm = deityParam.toLowerCase();
        if (norm === "shiva" || norm === "shiv") return "Shiva";
        if (norm === "krishna") return "Krishna";
        if (norm === "hanuman") return "Hanuman";
        if (norm === "rama" || norm === "ram") return "Rama";
        if (norm === "ganesh" || norm === "ganesha") return "Ganesha";
        return deityParam;
      }
      return null;
    }
  );
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
  }, [selectedPoster, userName, userPhoto, generationType, posterZoom, posterOffsetX, posterOffsetY, posterShape, posterFrameScale, posterRotation, posterNameOffsetX, posterNameOffsetY, posterNameScale, posterNameRotation, posterNameShape, extraTextBoxes, hidePhotoFrame]);

  useEffect(() => {
    if (selectedPoster && !previousSelectedPosterRef.current) {
      // Only reset when the modal first OPENS (null → poster), not when scrolling between posters
      const defaultShape = selectedPoster.defaultShape || "circle";
      setPosterShape(defaultShape);
      setPosterZoom(1.0);
      setPosterOffsetX(0);
      setPosterOffsetY(0);
    }
    previousSelectedPosterRef.current = selectedPoster;
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
      if (index >= 0 && index < filteredPosterTemplates.length) {
        const activePoster = filteredPosterTemplates[index];
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
    const isSaved = likedWallpaperIds.includes(id);
    let updated;
    if (isSaved) {
      updated = likedWallpaperIds.filter(wId => wId !== id);
      toast.success(isHi ? "पसंदीदा से हटा दिया गया!" : "Removed from favorites!");
    } else {
      updated = [...likedWallpaperIds, id];
      toast.success(isHi ? "पसंदीदा में जोड़ा गया!" : "Added to favorites!");
    }
    setLikedWallpaperIds(updated);
    localStorage.setItem("hk_liked_wallpapers", JSON.stringify(updated));
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

  const filteredPosterTemplates = React.useMemo(() => {
    let list = POSTER_TEMPLATES;
    if (selectedDeityFilter) {
      const name = selectedDeityFilter.toLowerCase();
      const matches = POSTER_TEMPLATES.filter((tpl) => {
        // Shiva mapping
        if (name === "shiva" || name === "shiv") {
          return (
            tpl.title.toLowerCase().includes("shiva") ||
            tpl.title.toLowerCase().includes("shiv") ||
            tpl.titleHindi.includes("शिव") ||
            tpl.imageUrl.toLowerCase().includes("shiv")
          );
        }
        // Krishna mapping
        if (name === "krishna" || name === "radha") {
          return (
            tpl.title.toLowerCase().includes("krishna") ||
            tpl.title.toLowerCase().includes("radha") ||
            tpl.titleHindi.includes("कृष्ण") ||
            tpl.titleHindi.includes("राधा") ||
            tpl.imageUrl.toLowerCase().includes("krishna") ||
            tpl.imageUrl.toLowerCase().includes("radha")
          );
        }
        // Hanuman mapping
        if (name === "hanuman" || name === "balaji") {
          return (
            tpl.title.toLowerCase().includes("hanuman") ||
            tpl.title.toLowerCase().includes("balaji") ||
            tpl.titleHindi.includes("हनुमान") ||
            tpl.titleHindi.includes("बजरंग") ||
            tpl.imageUrl.toLowerCase().includes("hanuman") ||
            tpl.imageUrl.toLowerCase().includes("balaji")
          );
        }
        // Ram mapping
        if (name === "rama" || name === "ram") {
          return (
            tpl.title.toLowerCase().includes("ram") ||
            tpl.titleHindi.includes("राम") ||
            tpl.imageUrl.toLowerCase().includes("ram")
          );
        }
        // Ganesh mapping
        if (name === "ganesh" || name === "ganesha") {
          return (
            tpl.title.toLowerCase().includes("ganesh") ||
            tpl.titleHindi.includes("गणेश") ||
            tpl.imageUrl.toLowerCase().includes("ganesh")
          );
        }
        return (
          tpl.title.toLowerCase().includes(name) ||
          (tpl.titleHindi && tpl.titleHindi.toLowerCase().includes(name)) ||
          tpl.imageUrl.toLowerCase().includes(name)
        );
      });
      // Fallback to all if no deity specific matches are found
      if (matches.length > 0) {
        list = matches;
      }
    }
    return list;
  }, [selectedDeityFilter]);

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

  const drawPlaceholderOm = (
    ctx: CanvasRenderingContext2D, 
    cx: number, 
    cy: number, 
    r: number, 
    shape: string = "circle", 
    rot: number = 0
  ) => {
    ctx.save();
    ctx.translate(cx, cy);
    ctx.rotate(rot);

    ctx.fillStyle = isDark ? "rgba(20, 8, 4, 0.85)" : "#FFFDF8";
    ctx.strokeStyle = isDark ? "#fbbf24" : "#651317";
    ctx.lineWidth = 4.5;
    ctx.beginPath();

    if (shape === "circle") {
      ctx.arc(0, 0, r, 0, Math.PI * 2);
    } else if (shape === "square") {
      ctx.rect(-r, -r, r * 2, r * 2);
    } else if (shape === "rounded-square") {
      ctx.roundRect(-r, -r, r * 2, r * 2, r * 2 * 0.15);
    } else if (shape === "oval") {
      ctx.ellipse(0, 0, r, r * 1.33, 0, 0, Math.PI * 2);
    }
    ctx.fill();
    ctx.stroke();

    const omImg = new Image();
    omImg.src = omSvg;
    const size = r * 1.1;
    if (omImg.complete && omImg.naturalWidth > 0) {
      ctx.drawImage(omImg, -size / 2, -size / 2, size, size);
    } else {
      omImg.onload = () => {
        ctx.drawImage(omImg, -size / 2, -size / 2, size, size);
      };
      ctx.fillStyle = isDark ? "#fbbf24" : "#651317";
      ctx.font = "bold 80px serif";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText("ॐ", 0, 0);
    }
    ctx.restore();
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

          const displayName = userName.trim() ? userName : (isHi ? "आपका नाम..." : "Your Name...");

          // Match CSS preview proportions (3.2vw on 390px preview -> 35px on 1080px canvas)
          const targetFontSize = 35;
          ctx.font = `800 ${targetFontSize}px serif, "Tiro Devanagari Hindi", "Noto Sans Devanagari", sans-serif`;
          
          const nameWidth = ctx.measureText(displayName).width;
          const bannerW = nameWidth + 86;
          const bannerH = targetFontSize + 22;
          const bannerX = -bannerW / 2;
          const bannerY = -bannerH / 2;

          ctx.shadowBlur = 0;
          ctx.shadowOffsetX = 0;
          ctx.shadowOffsetY = 0;

          // Adaptive glassmorphic style
          ctx.fillStyle = isDark ? "rgba(12, 5, 2, 0.88)" : "rgba(255, 253, 248, 0.95)";
          ctx.strokeStyle = isDark ? "rgba(251, 191, 36, 0.5)" : "#651317";
          ctx.lineWidth = 4;
          ctx.beginPath();
          
          // Custom corner radius matching preview (12px on 390px card = 33px in canvas scale)
          const nameRadius = 
            posterNameShape === "circle" || posterNameShape === "oval"
              ? bannerH / 2
              : posterNameShape === "square"
              ? 0
              : 33;
              
          ctx.roundRect(bannerX, bannerY, bannerW, bannerH, nameRadius);
          ctx.fill();
          ctx.stroke();

          // Set high-contrast text shadow for devotee name
          ctx.shadowColor = isDark ? "rgba(0, 0, 0, 0.95)" : "rgba(255, 255, 255, 0.8)";
          ctx.shadowBlur = isDark ? 6 : 3;
          ctx.shadowOffsetX = 0;
          ctx.shadowOffsetY = 1;

          ctx.fillStyle = isDark ? "#fbbf24" : "#651317";
          ctx.fillText(displayName, 0, 0);

          ctx.restore();

          // Draw all extra text boxes
          extraTextBoxes.forEach(box => {
            if (!box.text.trim()) return;
            ctx.save();
            const finalX = nameX + posterNameOffsetX + box.offsetX;
            const finalY = nameY + posterNameOffsetY + box.offsetY;
            
            ctx.translate(finalX, finalY);
            ctx.rotate(box.rotation);
            ctx.scale(box.scale, box.scale);
            
            ctx.textAlign = "center";
            ctx.textBaseline = "middle";

            const boxFontSize = 32; // Matches CSS preview 3.0vw (~32px on 1080 canvas)
            ctx.font = `800 ${boxFontSize}px serif, "Tiro Devanagari Hindi", "Noto Sans Devanagari", sans-serif`;

            const bW = ctx.measureText(box.text).width + 80;
            const bH = boxFontSize + 22;
            const bX = -bW / 2;
            const bY = -bH / 2;

            ctx.shadowBlur = 0;
            ctx.fillStyle = isDark ? "rgba(12, 5, 2, 0.88)" : "rgba(255, 253, 248, 0.95)";
            ctx.strokeStyle = isDark ? "rgba(251, 191, 36, 0.5)" : "#651317";
            ctx.lineWidth = 4;
            ctx.beginPath();
            
            const boxRadius = 
              box.shape === "circle" || box.shape === "oval"
                ? bH / 2
                : box.shape === "square"
                ? 0
                : 30; // Matches CSS 12px on 390px card
                
            ctx.roundRect(bX, bY, bW, bH, boxRadius);
            ctx.fill();
            ctx.stroke();

            ctx.fillStyle = isDark ? "#fbbf24" : "#651317";
            ctx.fillText(box.text, 0, 0);

            ctx.restore();
          });

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
            
            const finalCX = photoX + posterOffsetX;
            const finalCY = photoY + posterOffsetY;
            const finalRadius = radius * posterFrameScale;

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
            const targetH = posterShape === "oval" ? finalRadius * 2.66 : finalRadius * 2;

            const userZoom = posterZoom;
            const baseScale = Math.max(targetW / avatarImg.width, targetH / avatarImg.height);
            const DW = avatarImg.width * baseScale * userZoom;
            const DH = avatarImg.height * baseScale * userZoom;
            const drawX = -DW / 2;
            const drawY = -DH / 2;

            ctx.drawImage(avatarImg, drawX, drawY, DW, DH);
            ctx.restore();

            // Border matching active shape and preview style
            ctx.save();
            ctx.translate(finalCX, finalCY);
            ctx.rotate(posterRotation);
            ctx.strokeStyle = isDark ? "#fbbf24" : "#651317";
            ctx.lineWidth = 4.5;
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
            const finalCX = photoX + posterOffsetX;
            const finalCY = photoY + posterOffsetY;
            const finalRadius = radius * posterFrameScale;
            drawPlaceholderOm(ctx, finalCX, finalCY, finalRadius, posterShape, posterRotation);
            drawNameText();
          };
        } else {
          const finalCX = photoX + posterOffsetX;
          const finalCY = photoY + posterOffsetY;
          const finalRadius = radius * posterFrameScale;
          drawPlaceholderOm(ctx, finalCX, finalCY, finalRadius, posterShape, posterRotation);
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
    <div className="min-h-screen bg-gradient-to-b from-[#FAF8F4] via-[#FAF8F4] to-[#FAF8F4] text-[#2B1F18] dark:from-[#180a06] dark:via-[#0d0502] dark:to-[#120603] dark:text-amber-100 flex flex-col font-serif select-none relative overflow-x-hidden">
      
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
        <header className={cn("sticky top-0 z-40 backdrop-blur-md px-4 py-3 flex items-center justify-between w-full select-none border-b", isDark ? "bg-[#0d0502]/95 border-amber-950/10" : "bg-[#FAF8F4]/95 border-[#EFE5DA]/60")}>
          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate("/")}
              className={cn("flex h-10 w-10 items-center justify-center rounded-full active:scale-95 transition-all border", isDark ? "bg-black/30 border-amber-900/20 text-amber-400 hover:bg-amber-950/30" : "bg-[#FFFFFF] border-[#EFE5DA] text-[#D88A15] hover:bg-[#FAF8F4]")}
            >
              <ArrowLeft className={cn("w-5 h-5", isDark ? "text-amber-400" : "text-[#D88A15]")} />
            </button>
            <div className="text-left">
              <h1 className={cn("font-serif text-lg font-black leading-none", isDark ? "text-amber-100" : "text-[#2B1F18]")}>
                {isHi ? "वॉलपेपर" : "Wallpapers"}
              </h1>
              <span className={cn("font-sans text-[10px] block mt-1.5 font-semibold leading-none", isDark ? "text-amber-200" : "text-[#8A7A6B]")}>
                {isHi ? "अपने मोबाइल को दिव्यता से सजाएँ" : "Decorate your mobile with divinity"}
              </span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => navigate("/pricing")}
              className={cn("flex items-center gap-1.5 border rounded-full px-3 py-1.5 font-sans text-xs font-black shadow-sm active:scale-95 transition-all", isDark ? "bg-[#fbbf24]/10 border-[#fbbf24]/30 text-[#fbbf24] hover:bg-[#fbbf24]/25" : "bg-[#D88A15]/10 border-[#D88A15]/30 text-[#D88A15] hover:bg-[#D88A15]/20")}
            >
              <Sparkles className="w-3.5 h-3.5 fill-current animate-pulse text-[#fbbf24]" />
              <span>{isHi ? "महाभक्त" : "Mahabhakt"}</span>
            </button>
            <button
              onClick={() => setIsSearchOpen(!isSearchOpen)}
              className={cn("flex h-10 w-10 items-center justify-center rounded-full active:scale-95 transition-all border", isDark ? "bg-black/30 border-amber-900/20 text-amber-400 hover:bg-amber-950/30" : "bg-[#FFFFFF] border-[#EFE5DA] text-[#D88A15] hover:bg-[#FAF8F4]")}
            >
              <Search className={cn("w-5 h-5", isDark ? "text-amber-400" : "text-[#D88A15]")} />
            </button>
          </div>
        </header>
      ) : activeTab === "maker" ? (
        selectedPoster ? null : (
          <header className={cn("relative z-40 px-4 pt-5 pb-4 flex flex-col items-center justify-center w-full border-b select-none overflow-hidden transition-colors", isDark ? "bg-[#140804] border-amber-950/20" : "bg-[#FFFDF8] border-[#EAD7C3]/80")}>
            {/* Background image overlay */}
            <div 
              className="absolute inset-0 pointer-events-none opacity-30 dark:opacity-15 bg-cover bg-left-top bg-no-repeat mix-blend-multiply dark:mix-blend-screen"
              style={{ backgroundImage: `url(${devotionalHeaderBg})` }}
            />
            
            <div className="relative z-10 flex items-center justify-between w-full max-w-4xl">
              {/* Left: Circular Back button */}
              <button
                onClick={() => navigate("/")}
                className={cn(
                  "flex h-10 w-10 items-center justify-center rounded-full active:scale-95 transition-all focus:outline-none border shadow-sm shrink-0",
                  isDark ? "bg-black/50 border-amber-500/20 text-amber-400 hover:bg-black/70" : "bg-white/90 border-[#EAD7C3] text-[#D88A15] hover:bg-white"
                )}
              >
                <ArrowLeft className="w-5 h-5 text-[#D88A15]" />
              </button>

              {/* Center: Title & Subtitle */}
              <div className="text-center flex-1 px-3 flex flex-col items-center justify-center">
                <h1 className={cn("font-serif text-xl sm:text-2xl font-black flex items-center gap-2 justify-center leading-tight tracking-wide", isDark ? "text-amber-300" : "text-[#651317]")}>
                  <span className="text-xl sm:text-2xl">🪔</span>
                  <span>{isHi ? "भक्तिमय पोस्टर" : "Devotional Posters"}</span>
                </h1>
                <p className={cn("font-sans text-xs sm:text-sm font-semibold block mt-1 leading-tight", isDark ? "text-amber-200/80" : "text-[#786252]")}>
                  {isHi ? "हर अवसर के लिए सुंदर धार्मिक पोस्टर" : "Beautiful spiritual posters for every occasion"}
                </p>
              </div>

              {/* Right: Empty spacer for symmetry (1 din sadhana removed!) */}
              <div className="w-10 h-10 shrink-0" />
            </div>
          </header>
        )
      ) : (
        <header className={cn("sticky top-0 z-40 backdrop-blur-md px-4 py-3.5 flex items-center justify-between w-full border-b", isDark ? "bg-[#160a06]/90 border-amber-950/20" : "bg-[#FAF8F4]/95 border-[#EFE5DA]/60")}>
          <button
            onClick={() => navigate("/")}
            className={cn("flex h-10 w-10 items-center justify-center rounded-full active:scale-95 transition-all focus:outline-none border", isDark ? "bg-black/40 border-amber-500/10 hover:bg-amber-500/10 text-amber-100" : "bg-white/70 border-[#EAD7C3]/80 text-[#B27A1C] hover:bg-[#FCF6E8]/30")}
          >
            <ArrowLeft className="w-5 h-5 text-amber-400" />
          </button>
          <div className="text-center">
            <h1 className={cn("font-serif text-base md:text-lg font-black uppercase flex items-center gap-1.5 justify-center leading-none", isHi ? "" : "tracking-widest", isDark ? "text-amber-400" : "text-[#2B1F18]")}>
              <Sparkles className="w-4 h-4 text-amber-400 fill-current animate-pulse" />
              {isHi ? "नित्य दर्शन व आशीर्वाद" : "Nitya Darshan & Blessings"}
            </h1>
            <span className={cn("font-sans text-[10px] uppercase tracking-wider block mt-0.5 leading-none font-bold", isDark ? "text-amber-200" : "text-[#8A7A6B]")}>
              Raghavam Devotional Hub
            </span>
          </div>
          <div className="w-10 h-10 shrink-0" />
        </header>
      )}

      {/* ─── TAB NAVIGATION SWITCHER ───────────────────────────────── */}
      <div className="w-full max-w-md mx-auto px-4 mt-4 select-none">
        <nav className={cn("p-1.5 rounded-full border flex items-center shadow-md transition-colors", isDark ? "bg-[#120704]/80 border-amber-950/40" : "bg-[#FFFDF8] border-[#EAD7C3]")}>
          <button
            onClick={() => {
              setActiveTab("maker");
              window.scrollTo({ top: 0, behavior: "smooth" });
            }}
            className={cn(
              "flex-1 py-2.5 rounded-full font-sans text-[11px] font-black uppercase transition-all duration-300 flex items-center justify-center gap-1.5 focus:outline-none cursor-pointer active:scale-95 shadow-sm",
              isHi ? '' : 'tracking-wider',
              activeTab === "maker"
                ? isDark
                  ? "bg-gradient-to-r from-amber-500 to-amber-600 text-stone-950 shadow-amber-500/20"
                  : "bg-gradient-to-r from-[#651317] to-[#8B1E24] text-white shadow-red-900/20"
                : isDark
                  ? "text-amber-200/80 hover:text-amber-200"
                  : "text-[#543D2B] hover:text-[#651317]"
            )}
          >
            <span>✨</span>
            <span>{isHi ? "पोस्टर" : "Posters"}</span>
          </button>
          <button
            onClick={() => {
              setActiveTab("wallpapers");
              window.scrollTo({ top: 0, behavior: "smooth" });
            }}
            className={cn(
              "flex-1 py-2.5 rounded-full font-sans text-[11px] font-black uppercase transition-all duration-300 flex items-center justify-center gap-1.5 focus:outline-none cursor-pointer active:scale-95 shadow-sm",
              isHi ? '' : 'tracking-wider',
              activeTab === "wallpapers"
                ? isDark
                  ? "bg-gradient-to-r from-amber-500 to-amber-600 text-stone-950 shadow-amber-500/20"
                  : "bg-gradient-to-r from-[#651317] to-[#8B1E24] text-white shadow-red-900/20"
                : isDark
                  ? "text-amber-200/80 hover:text-amber-200"
                  : "text-[#543D2B] hover:text-[#651317]"
            )}
          >
            <span>📱</span>
            <span>{isHi ? "वॉलपेपर" : "Wallpapers"}</span>
          </button>
          <button
            onClick={() => {
              setActiveTab("saved");
              window.scrollTo({ top: 0, behavior: "smooth" });
            }}
            className={cn(
              "flex-1 py-2.5 rounded-full font-sans text-[11px] font-black uppercase transition-all duration-300 flex items-center justify-center gap-1.5 focus:outline-none cursor-pointer active:scale-95 shadow-sm",
              isHi ? '' : 'tracking-wider',
              activeTab === "saved"
                ? isDark
                  ? "bg-gradient-to-r from-amber-500 to-amber-600 text-stone-950 shadow-amber-500/20"
                  : "bg-gradient-to-r from-[#651317] to-[#8B1E24] text-white shadow-red-900/20"
                : isDark
                  ? "text-amber-200/80 hover:text-amber-200"
                  : "text-[#543D2B] hover:text-[#651317]"
            )}
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
                  className={cn("w-full rounded-3xl p-5 text-left flex items-center gap-4 relative overflow-hidden transition-all duration-300 hover:shadow-xl border group/card", isDark ? "border-amber-500/20 hover:shadow-amber-500/5" : "border-[#EFE5DA] hover:shadow-[#D88A15]/5")}
                  style={{
                    background: isDark ? 'linear-gradient(135deg, rgba(32,13,5,0.9) 0%, rgba(20,7,3,0.95) 50%, rgba(12,3,1,0.98) 100%)' : '#FFFFFF',
                    boxShadow: isDark ? '0 8px 32px rgba(0,0,0,0.6)' : '0 8px 30px rgba(239, 229, 218, 0.2)'
                  }}
                >
                  {/* Glow orbs */}
                  <div className="absolute -top-10 -right-10 w-40 h-40 bg-amber-500/10 rounded-full blur-3xl pointer-events-none animate-pulse duration-4000" />
                  <div className="absolute -bottom-10 -left-10 w-32 h-32 bg-orange-600/8 rounded-full blur-3xl pointer-events-none" />
                  
                  {/* Avatar circle */}
                  <div 
                    onClick={() => setShowSetupSheet(true)}
                    className={cn(
                      "w-14 h-14 rounded-full flex items-center justify-center overflow-hidden shrink-0 shadow-lg transition-all hover:scale-105 active:scale-95 cursor-pointer relative group border-2",
                      isDark 
                        ? "bg-stone-950/80 border-amber-500/40 hover:border-amber-400 shadow-amber-500/10" 
                        : "bg-[#FFFDF8] border-[#D4A437] hover:border-[#651317] shadow-stone-400/20"
                    )}
                  >
                    {userPhoto ? (
                      <img src={userPhoto} alt="devotee" className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300" />
                    ) : (
                      <span className={cn("text-2xl font-serif font-black flex items-center justify-center leading-none", isDark ? "text-amber-400" : "text-[#651317]")}>ॐ</span>
                    )}
                    <div className="absolute inset-0 bg-black/45 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity duration-200">
                      <Camera className="w-3.5 h-3.5 text-amber-300" />
                    </div>
                  </div>
                  
                  <div className="flex flex-col min-w-0 z-10">
                    <span className={cn(`text-[9px] uppercase font-sans font-black leading-none mb-1.5 ${isHi ? '' : 'tracking-widest'}`, isDark ? "text-amber-500" : "text-[#651317]")}>
                      {isHi ? "आज का आशीर्वाद" : "Today's Blessing"}
                    </span>
                    <h2 
                      onClick={() => setShowSetupSheet(true)}
                      className={cn("font-serif text-base font-bold leading-tight flex items-center gap-1.5 cursor-pointer transition-colors", isDark ? "text-amber-100 hover:text-amber-200" : "text-[#3A2418] hover:text-[#651317]")}
                    >
                      <span>{isHi ? "शुभ प्रभात," : "Jai Shri Ram 🙏"}</span> 
                      <span className={cn("text-transparent bg-clip-text bg-gradient-to-r drop-shadow-sm font-black", isDark ? "from-amber-400 via-orange-300 to-amber-200" : "from-[#651317] via-[#8B1E24] to-[#651317]")}>
                        {userName || (isHi ? "हरि भक्त" : "Devotee")}
                      </span>
                    </h2>
                    <p className={cn("text-[10px] font-sans leading-tight mt-1 font-medium", isDark ? "text-amber-200/80" : "text-[#786252]")}>
                      {isHi ? "ॐ नमः शिवाय। दिन मंगलमय हो ✨" : "May your day be filled with peace ✨"}
                    </p>
                  </div>

                  {/* Edit/Setup profile button — fixed button style */}
                  <button
                    onClick={() => setShowSetupSheet(true)}
                    className={cn(
                      "ml-auto shrink-0 px-3.5 py-2 rounded-xl font-sans text-[10px] font-black uppercase transition-all z-10 flex items-center gap-1.5 active:scale-95 cursor-pointer shadow-md",
                      isHi ? "" : "tracking-wider",
                      isDark 
                        ? "bg-gradient-to-r from-amber-500 to-amber-600 text-stone-950 shadow-amber-500/20" 
                        : "bg-gradient-to-r from-[#651317] to-[#8B1E24] text-white shadow-red-900/20"
                    )}
                  >
                    <UserIcon className="w-3.5 h-3.5" />
                    <span>{userName ? (isHi ? "बदलें" : "Edit") : (isHi ? "जोड़ें" : "Setup")}</span>
                  </button>
                </div>

                {/* Featured Hero Card — Cinematic */}
                {(() => {
                  const heroPoster = filteredPosterTemplates.find(p => p.id === "poster-shyam-1") || filteredPosterTemplates[0];
                  return (
                    <div className={cn("w-full rounded-[2rem] overflow-hidden relative cursor-pointer group flex flex-col md:flex-row md:h-[380px] border shadow-xl", isDark ? "border-amber-500/20 shadow-black/80" : "border-[#EAD7C3] shadow-stone-900/10 bg-white")} onClick={() => setSelectedPoster(heroPoster)}>
                      {/* Left: Image Container */}
                      <div className="w-full aspect-[3/4] md:aspect-auto md:w-1/2 md:h-full relative overflow-hidden shrink-0">
                        <img src={heroPoster.imageUrl} alt={heroPoster.title} className="w-full h-full object-cover group-hover:scale-[1.03] transition-transform duration-700" />
                        
                        {/* Top label */}
                        <div className="absolute top-4 left-4 flex items-center gap-2 z-20">
                          <span className={cn("px-3 py-1 rounded-full text-[8px] md:text-[9px] font-black uppercase font-sans border backdrop-blur-md shadow-md", isHi ? '' : 'tracking-widest', isDark ? "bg-amber-500/20 border-amber-500/40 text-amber-300" : "bg-black/40 border-white/20 text-white")}>
                            ✨ {isHi ? "आज का विशेष" : "Today's Featured"}
                          </span>
                        </div>
                      </div>

                      {/* Right/Overlay: Details and action — text in WHITE over poster background */}
                      <div className="absolute inset-x-0 bottom-0 p-5 md:relative md:inset-auto md:w-1/2 md:h-full md:p-8 flex flex-col justify-end md:justify-between hero-card-overlay bg-gradient-to-t from-black/90 via-black/60 to-transparent md:bg-none">
                        {/* Group devotee row & quote */}
                        <div className="flex flex-col text-left gap-1 md:gap-4">
                          {/* Devotee row */}
                          <div className="flex items-center gap-2.5 mb-2 md:mb-0">
                            <div className="w-9 h-9 md:w-11 md:h-11 rounded-full overflow-hidden shrink-0 border-2 border-amber-400/80 shadow-md">
                              {userPhoto ? (
                                <img src={userPhoto} alt="devotee" className="w-full h-full object-cover" />
                              ) : (
                                <div className={cn("w-full h-full flex items-center justify-center font-serif text-sm md:text-base font-bold", isDark ? "bg-stone-900 text-amber-400" : "bg-[#FFFDF8] text-[#651317]")}>ॐ</div>
                              )}
                            </div>
                            <div className="flex flex-col min-w-0">
                              <span className={cn("text-[9px] md:text-[10px] font-sans font-black uppercase leading-none tracking-wider text-amber-300 drop-shadow", isHi ? "" : "tracking-widest")}>{isHi ? "पावन पोस्टर" : "Sacred Poster"}</span>
                              <span className="text-xs md:text-sm font-serif font-black truncate leading-tight text-white drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)] mt-0.5">
                                {userName || (isHi ? "हरि भक्त" : "Devotee")}
                              </span>
                            </div>
                          </div>
                          
                          {/* Quote text in WHITE */}
                          <p className="text-[10px] md:text-xs font-serif italic line-clamp-2 md:line-clamp-none leading-relaxed mb-4 md:mb-0 font-medium text-stone-100 drop-shadow-[0_1px_3px_rgba(0,0,0,0.9)]">
                            {isHi ? heroPoster.quoteHindi : heroPoster.quote}
                          </p>
                        </div>

                        {/* Action row — title in WHITE */}
                        <div className="flex items-center justify-between gap-3 text-left">
                          <div className="flex flex-col min-w-0">
                            <span className="font-serif text-sm md:text-base font-black leading-tight truncate text-white drop-shadow-[0_2px_4px_rgba(0,0,0,0.9)]">{isHi ? heroPoster.titleHindi : heroPoster.title}</span>
                            <span className="text-[9px] md:text-[10px] font-sans font-bold leading-none mt-1 text-amber-300 drop-shadow">{isHi ? "बाबा श्याम आशीर्वाद" : "Khatu Shyam Blessings"}</span>
                          </div>
                          <button
                            onClick={(e) => { e.stopPropagation(); setSelectedPoster(heroPoster); }}
                            className={cn(
                              "shrink-0 px-4 py-2.5 md:px-5 md:py-3 font-sans font-black text-[9.5px] md:text-[11px] uppercase rounded-xl transition-all active:scale-[0.97] flex items-center gap-1.5 cursor-pointer shadow-lg",
                              isHi ? '' : 'tracking-widest',
                              isDark 
                                ? "bg-gradient-to-r from-amber-500 to-amber-600 text-stone-950 shadow-amber-500/20" 
                                : "bg-gradient-to-r from-[#651317] to-[#8B1E24] text-white shadow-red-900/30"
                            )}
                          >
                            <Sparkles className="w-3.5 h-3.5" />
                            <span>{isHi ? "अपना बनाएं" : "Create Mine"}</span>
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })()}

                {/* Categories Bar Row — Fixed Button Styling */}
                <div className="w-full flex items-center justify-start md:justify-center gap-2.5 md:gap-3.5 overflow-x-auto py-1.5 scrollbar-none">
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
                        className={cn(
                          "py-2 px-4 rounded-xl font-sans text-[10px] md:text-[11px] font-black uppercase transition-all duration-200 flex items-center gap-1.5 shrink-0 cursor-pointer active:scale-95 shadow-sm border",
                          isHi ? '' : 'tracking-wider',
                          isActive
                            ? isDark
                              ? "bg-gradient-to-r from-amber-500 to-amber-600 border-amber-400 text-stone-950 shadow-amber-500/20"
                              : "bg-gradient-to-r from-[#651317] to-[#8B1E24] border-[#651317] text-white shadow-red-900/20"
                            : isDark
                              ? "bg-stone-900/60 border-amber-500/15 text-stone-300 hover:bg-stone-800"
                              : "bg-white border-[#EAD7C3] text-[#543D2B] hover:bg-[#FCF6E8]"
                        )}
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
                        <h3 className={cn("font-serif text-xs font-black uppercase", isHi ? '' : 'tracking-widest', isDark ? "text-amber-400" : "text-[#B27A1C]")}>
                          {isHi ? "आज के पावन पोस्टर" : "Today's Sacred Posters"}
                        </h3>
                      </div>
                      <div className="flex flex-row overflow-x-auto gap-4 pb-3.5 pt-1 w-full scrollbar-none snap-x snap-mandatory">
                        {filteredPosterTemplates.filter(p => p.category === "todays").map((tpl) => (
                          <div
                            key={tpl.id}
                            onClick={() => setSelectedPoster(tpl)}
                            className="rounded-2xl flex flex-col gap-0 relative cursor-pointer overflow-hidden group transition-transform duration-300 hover:scale-[1.02] active:scale-[0.98] shrink-0 snap-start w-[140px] sm:w-[160px] md:w-[180px]"
                            style={{
                                  background: isDark ? 'rgba(15,7,3,0.7)' : 'rgba(255,255,255,0.75)',
                                  border: isDark ? '1px solid rgba(120,60,10,0.25)' : '1px solid rgba(188,138,83,0.25)',
                                  boxShadow: isDark ? '0 4px 20px rgba(0,0,0,0.5)' : '0 4px 20px rgba(188,138,83,0.1)'
                                }}
                          >
                            <div className="w-full aspect-[9/16] rounded-2xl overflow-hidden relative">
                              <img src={tpl.imageUrl} alt={tpl.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                              {/* Gradient overlay */}
                              <div className="absolute inset-0" style={{background: 'linear-gradient(to top, rgba(5,2,1,0.92) 0%, rgba(5,2,1,0.4) 40%, transparent 70%)'}} />
                              {/* Personalized bottom row */}
                              <div className="absolute inset-x-0 bottom-0 p-2.5 md:p-3 flex flex-col gap-1.5 md:gap-2">
                                <div className="flex items-center gap-1.5">
                                  <div className="w-6 h-6 md:w-7 md:h-7 rounded-full overflow-hidden shrink-0 border border-amber-400/80">
                                    {userPhoto ? (
                                      <img src={userPhoto} alt="devotee" className="w-full h-full object-cover" />
                                    ) : (
                                      <div className={cn("w-full h-full flex items-center justify-center font-serif text-[7px] md:text-[8px] font-bold", isDark ? "bg-stone-900 text-amber-500" : "bg-[#FFFDF8] text-[#651317]")}>ॐ</div>
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
                              <span className={cn("font-serif text-[11px] md:text-xs font-bold truncate block", isDark ? "text-amber-200" : "text-[#543D2B]")}>
                                {isHi ? tpl.titleHindi : tpl.title}
                              </span>
                              <span className={cn("text-[8px] md:text-[9px] font-sans font-bold uppercase block mt-0.5", isHi ? "" : "tracking-wider", isDark ? "text-amber-500" : "text-[#651317]")}>
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
                        <h3 className={cn("font-serif text-xs font-black uppercase", isHi ? '' : 'tracking-widest', isDark ? "text-amber-400" : "text-[#651317]")}>
                          {isHi ? "उत्सव एवं विशेष पर्व पोस्टर" : "Festival Special Posters"}
                        </h3>
                      </div>
                      <div className="flex flex-row overflow-x-auto gap-4 pb-3.5 pt-1 w-full scrollbar-none snap-x snap-mandatory">
                        {filteredPosterTemplates.filter(p => p.category === "festival").map((tpl) => (
                          <div
                            key={tpl.id}
                            onClick={() => setSelectedPoster(tpl)}
                            className="rounded-2xl flex flex-col gap-0 relative cursor-pointer overflow-hidden group transition-transform duration-300 hover:scale-[1.02] active:scale-[0.98] shrink-0 snap-start w-[140px] sm:w-[160px] md:w-[180px]"
                            style={{
                                  background: isDark ? 'rgba(15,7,3,0.7)' : 'rgba(255,255,255,0.75)',
                                  border: isDark ? '1px solid rgba(120,60,10,0.25)' : '1px solid rgba(188,138,83,0.25)',
                                  boxShadow: isDark ? '0 4px 20px rgba(0,0,0,0.5)' : '0 4px 20px rgba(188,138,83,0.1)'
                                }}
                          >
                            <div className="w-full aspect-[9/16] rounded-2xl overflow-hidden relative">
                              <img src={tpl.imageUrl} alt={tpl.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                              <div className="absolute inset-0" style={{background: 'linear-gradient(to top, rgba(5,2,1,0.92) 0%, rgba(5,2,1,0.4) 40%, transparent 70%)'}} />
                              <div className="absolute inset-x-0 bottom-0 p-2.5 md:p-3 flex flex-col gap-1.5 md:gap-2">
                                <div className="flex items-center gap-1.5">
                                  <div className="w-6 h-6 md:w-7 md:h-7 rounded-full overflow-hidden shrink-0 border border-amber-400/80">
                                    {userPhoto ? (
                                      <img src={userPhoto} alt="devotee" className="w-full h-full object-cover" />
                                    ) : (
                                      <div className={cn("w-full h-full flex items-center justify-center font-serif text-[7px] md:text-[8px] font-bold", isDark ? "bg-stone-900 text-amber-500" : "bg-[#FFFDF8] text-[#651317]")}>ॐ</div>
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
                              <span className={cn("font-serif text-[11px] md:text-xs font-bold truncate block", isDark ? "text-amber-200" : "text-[#543D2B]")}>{isHi ? tpl.titleHindi : tpl.title}</span>
                              <span className={cn("text-[8px] md:text-[9px] font-sans font-bold uppercase block mt-0.5", isHi ? '' : 'tracking-wider', isDark ? "text-amber-500" : "text-[#651317]")}>{isHi ? tpl.subtitleHindi : tpl.subtitle}</span>
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
                        <h3 className={cn("font-serif text-xs font-black uppercase", isHi ? '' : 'tracking-widest', isDark ? "text-amber-400" : "text-[#651317]")}>
                          {isHi ? "सुप्रभात दर्शन पोस्टर" : "Morning Special Posters"}
                        </h3>
                      </div>
                      <div className="flex flex-row overflow-x-auto gap-4 pb-3.5 pt-1 w-full scrollbar-none snap-x snap-mandatory">
                        {filteredPosterTemplates.filter(p => p.category === "good_morning").map((tpl) => (
                          <div
                            key={tpl.id}
                            onClick={() => setSelectedPoster(tpl)}
                            className="rounded-2xl flex flex-col gap-0 relative cursor-pointer overflow-hidden group transition-transform duration-300 hover:scale-[1.02] active:scale-[0.98] shrink-0 snap-start w-[140px] sm:w-[160px] md:w-[180px]"
                            style={{
                                  background: isDark ? 'rgba(15,7,3,0.7)' : 'rgba(255,255,255,0.75)',
                                  border: isDark ? '1px solid rgba(120,60,10,0.25)' : '1px solid rgba(188,138,83,0.25)',
                                  boxShadow: isDark ? '0 4px 20px rgba(0,0,0,0.5)' : '0 4px 20px rgba(188,138,83,0.1)'
                                }}
                          >
                            <div className="w-full aspect-[9/16] rounded-2xl overflow-hidden relative">
                              <img src={tpl.imageUrl} alt={tpl.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                              <div className="absolute inset-0" style={{background: 'linear-gradient(to top, rgba(5,2,1,0.92) 0%, rgba(5,2,1,0.4) 40%, transparent 70%)'}} />
                              <div className="absolute inset-x-0 bottom-0 p-2.5 md:p-3 flex flex-col gap-1.5 md:gap-2">
                                <div className="flex items-center gap-1.5">
                                  <div className="w-6 h-6 md:w-7 md:h-7 rounded-full overflow-hidden shrink-0 border border-amber-400/80">
                                    {userPhoto ? (
                                      <img src={userPhoto} alt="devotee" className="w-full h-full object-cover" />
                                    ) : (
                                      <div className={cn("w-full h-full flex items-center justify-center font-serif text-[7px] md:text-[8px] font-bold", isDark ? "bg-stone-900 text-amber-500" : "bg-[#FFFDF8] text-[#651317]")}>ॐ</div>
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
        {activeTab === "wallpapers" && (() => {
          const renderDevotionalCard = (wp, index, isLive) => {
            return (
              <div
                key={wp.id}
                onClick={() => isLive ? handleLiveWallpaperAction(wp) : handleWallpaperAction(wp)}
                className={cn(
                  "rounded-2xl overflow-hidden relative cursor-pointer group transition-transform duration-300 hover:scale-[1.02] active:scale-[0.98] shadow-sm w-full border",
                  isDark 
                    ? "bg-[#150703]/80 border-[#2a120b]/35 shadow-black/50" 
                    : "bg-[#FFFFFF] border-[#EFE5DA]/60 shadow-[#EFE5DA]/15"
                )}
              >
                {/* Image wrapper */}
                <div className="w-full overflow-hidden relative aspect-[3/4]">
                  {isLive && wp.effect === "aura" && <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(251,191,36,0.18)_0%,transparent_75%)] pointer-events-none z-10 animate-pulse" style={{animationDuration:"2.5s"}}/>}
                  {isLive && wp.effect === "shimmer" && <div className="absolute inset-0 bg-[linear-gradient(45deg,transparent_20%,rgba(255,255,255,0.08)_50%,transparent_80%)] pointer-events-none z-10 animate-shimmer"/>}
                  {isLive && wp.effect === "flame" && <div className="absolute inset-0 bg-gradient-to-t from-orange-500/10 via-transparent to-transparent pointer-events-none z-10 animate-pulse" style={{animationDuration:"1.5s"}}/>}
                  
                  <img 
                    src={isLive ? wp.thumbnailUrl : wp.imageUrl} 
                    alt={wp.name}
                    className="w-full h-full object-cover group-hover:scale-[1.05] transition-all duration-500 pointer-events-none brightness-[0.9] group-hover:brightness-100"
                  />
                  {/* Subtle overlay gradient */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent pointer-events-none" />

                  {/* Floating Like control (bottom left) */}
                  <div className="absolute bottom-2.5 left-2.5 z-30">
                    <WallpaperLikeButton
                      wpId={wp.id}
                      isLiked={likedWallpaperIds.includes(wp.id)}
                      onToggle={() => toggleLikeWallpaper(wp.id)}
                      likesCount={likedWallpaperIds.includes(wp.id) ? 1 : 0}
                    />
                  </div>

                  {/* Floating Download/Preview control (bottom right) */}
                  {isLive ? (
                    <button
                      onClick={(e)=>{e.stopPropagation();handleLiveWallpaperAction(wp);}}
                      className="absolute bottom-2.5 right-2.5 flex items-center justify-center transition-all duration-200 active:scale-90 focus:outline-none z-30 shadow-md"
                      style={{
                        width: 32,
                        height: 32,
                        borderRadius: "50%",
                        background: "rgba(0,0,0,0.6)",
                        border: "1px solid rgba(255,255,255,0.3)",
                      }}
                    >
                      <Sparkles className="w-3.5 h-3.5 text-amber-400 fill-current"/>
                    </button>
                  ) : (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDownloadWallpaper(wp);
                      }}
                      className="absolute bottom-2.5 right-2.5 flex items-center justify-center transition-all duration-200 active:scale-90 focus:outline-none z-30 shadow-md"
                      style={{
                        width: 32,
                        height: 32,
                        borderRadius: "50%",
                        background: "rgba(0,0,0,0.6)",
                        border: "1px solid rgba(255,255,255,0.3)",
                      }}
                    >
                      <svg viewBox="0 0 24 24" fill="none" stroke="#FFFFFF" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{width:13,height:13}}>
                        <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
                        <polyline points="7 10 12 15 17 10"/>
                        <line x1="12" y1="15" x2="12" y2="3"/>
                      </svg>
                    </button>
                  )}

                  {/* Effect tag (Live only) */}
                  {isLive && (
                    <div className="absolute top-[42px] left-2.5 z-10">
                      <span style={{
                        fontSize: 7, fontWeight: 900, textTransform: "uppercase", letterSpacing: "0.1em",
                        padding: "2px 6px", borderRadius: 4, background: "rgba(0,0,0,0.6)",
                        border: "1px solid rgba(251,191,36,0.25)", color: "#fbbf24"
                      }}>{wp.effect}</span>
                    </div>
                  )}

                  {/* Premium Badge (top right) */}
                  <div 
                    className="absolute top-2.5 right-2.5 px-2 py-0.5 rounded-full z-10 text-[8px] font-black uppercase font-sans tracking-wider"
                    style={{
                      background: wp.tier !== "free" ? "#D88A15" : "rgba(0,0,0,0.55)",
                      color: wp.tier !== "free" ? "#FFFFFF" : "#fbbf24",
                      border: wp.tier !== "free" ? "1px solid #D88A15" : "1px solid rgba(251,191,36,0.25)"
                    }}
                  >
                    {wp.tier !== "free" ? "👑 Pro" : "Free"}
                  </div>
                </div>
              </div>
            );
          };

          return (
            <div className="w-full flex flex-col items-center animate-fade-in select-none">

              {/* ── Static / Live toggle ── */}
              <div className="w-full max-w-xs mx-auto mb-7 px-4">
                <div className="p-1 rounded-full flex items-center shadow-lg border" style={{background: isDark ? "rgba(18,7,4,0.6)" : "#FFFFFF", border: isDark ? "1px solid rgba(120,60,10,0.25)" : "1px solid #EFE5DA"}}>
                  <button
                    onClick={() => setWallpaperType("static")}
                    className={`flex-1 py-2.5 rounded-full font-sans text-xs font-black uppercase transition-all duration-300 flex items-center justify-center gap-2 focus:outline-none ${isHi ? '' : 'tracking-wider'} ${
                      wallpaperType === "static"
                        ? (isDark ? "text-[#fbbf24] shadow-md" : "text-[#D88A15] shadow-md")
                        : (isDark ? "text-amber-200/75 hover:text-amber-200" : "text-[#8A7A6B] hover:text-[#2B1F18]")
                    }`}
                    style={wallpaperType==="static"?(isDark ? {background:"rgba(251,191,36,0.12)",border:"1px solid rgba(251,191,36,0.35)"} : {background:"rgba(216, 138, 21, 0.1)",border:"1px solid rgba(216, 138, 21, 0.25)"}):{}}
                  >
                    <Smartphone className="w-3.5 h-3.5" />
                    <span>{isHi ? "स्थिर (STATIC)" : "Static"}</span>
                  </button>
                  <button
                    onClick={() => setWallpaperType("live")}
                    className={`flex-1 py-2.5 rounded-full font-sans text-xs font-black uppercase transition-all duration-300 flex items-center justify-center gap-2 focus:outline-none ${isHi ? '' : 'tracking-wider'} ${
                      wallpaperType === "live"
                        ? (isDark ? "text-[#fbbf24] shadow-md" : "text-[#D88A15] shadow-md")
                        : (isDark ? "text-amber-200/75 hover:text-amber-200" : "text-[#8A7A6B] hover:text-[#2B1F18]")
                    }`}
                    style={wallpaperType==="live"?(isDark ? {background:"rgba(251,191,36,0.12)",border:"1px solid rgba(251,191,36,0.35)"} : {background:"rgba(216, 138, 21, 0.1)",border:"1px solid rgba(216, 138, 21, 0.25)"}):{}}
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
                      className={cn("w-full rounded-full py-3 pl-5 pr-11 text-xs focus:outline-none tracking-wide font-sans font-medium border", isDark ? "bg-black/45 border-amber-500/20 focus:border-amber-500/45 text-amber-100 placeholder:text-amber-200/20" : "bg-[#FFFFFF] border-[#EFE5DA] focus:border-[#D88A15]/50 text-[#2B1F18] placeholder-[#8A7A6B]/40")}
                    />
                    {searchQuery ? (
                      <button onClick={() => setSearchQuery("")} className={cn("absolute right-4 top-1/2 -translate-y-1/2 focus:outline-none", isDark ? "text-amber-400 hover:text-amber-200" : "text-[#D88A15] hover:text-[#2B1F18]")}>
                        <X className="w-4 h-4" />
                      </button>
                    ) : (
                      <Search className={cn("absolute right-4.5 top-1/2 -translate-y-1/2 w-4 h-4", isDark ? "text-amber-500/30" : "text-[#D88A15]/35")} />
                    )}
                  </div>
                </div>
              )}

              {/* ══════════════════════════════════════════ */}
              {/* A. STATIC WALLPAPERS                      */}
              {/* ══════════════════════════════════════════ */}
              {wallpaperType === "static" && (
                <div className="w-full flex flex-col items-center space-y-6 animate-fade-in">

                  {/* Deity chips */}
                  <div className="w-full flex flex-col">
                    <div className="flex items-center justify-between w-full mb-3 px-0.5">
                      <h3 className={cn("font-serif text-sm font-black flex items-center gap-2", isDark ? "text-amber-100" : "text-[#2B1F18]")}>
                        <span>🕉️</span>
                        {isHi ? "देवता चुनें" : "Choose Deity"}
                      </h3>
                      <button
                        onClick={() => setSelectedDeityFilter(null)}
                        className={cn("font-sans text-[11px] font-bold flex items-center gap-0.5 active:scale-95 transition-all", isDark ? "text-amber-500 hover:text-amber-400" : "text-[#8A7A6B] hover:text-[#2B1F18]")}
                      >
                        {isHi ? "सभी देखें" : "View All"} <span className="ml-0.5 text-base leading-none" style={{lineHeight:1}}>›</span>
                      </button>
                    </div>
                    <div className="flex items-start gap-1.5 overflow-x-auto pb-3 pt-1.5 scrollbar-none w-full justify-start sm:justify-center px-1">
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
                            className={cn(
                              "w-[92px] h-[132px] flex flex-col items-center justify-between p-2 pb-3.5 rounded-2xl transition-all duration-300 relative shrink-0 outline-none focus:outline-none group",
                              isActive
                                ? "bg-[#FFFDF9] border-2 border-[#D89B1F] -translate-y-[3px] shadow-[0_4px_16px_rgba(216,155,31,0.22)]"
                                : (isDark 
                                    ? "bg-[#1f0f08]/90 border border-amber-900/30 shadow-sm" 
                                    : "bg-[#FFFDF9] border border-[#E9D7B3] shadow-sm shadow-[#E9D7B3]/10 hover:-translate-y-[1px]")
                            )}
                          >
                            {/* Centering container for watermark and crop */}
                            <div className="relative w-[78px] h-[78px] flex items-center justify-center shrink-0">
                              {/* Mandala Watermark */}
                              <img 
                                src={isActive ? mandalaGoldImg : mandalaBeigeImg} 
                                alt="" 
                                className={cn(
                                  "absolute w-[78px] h-[78px] top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none transition-all duration-700 select-none",
                                  isActive 
                                    ? "opacity-[0.88] scale-110 rotate-[25deg]" 
                                    : "opacity-[0.45] scale-100 rotate-0 group-hover:rotate-[15deg] group-hover:opacity-[0.62]"
                                )} 
                              />
                              
                              {/* Centered 62px circular image crop */}
                              <div className={cn("relative z-10 w-[62px] h-[62px] rounded-full overflow-hidden flex items-center justify-center bg-white shadow-inner transition-all", isActive ? "border-2 border-[#D89B1F]" : "border-2 border-[#E9D7B3]")}>
                                {deity.isIcon ? (
                                  <span className={cn("text-2xl transition-transform duration-300", isActive ? "scale-110" : "")}>{deity.symbol}</span>
                                ) : (
                                  <img 
                                    src={deity.image} 
                                    alt={deity.nameEn}
                                    className={cn("w-full h-full object-cover transition-transform duration-500", isActive ? "scale-110" : "group-hover:scale-105")}
                                  />
                                )}
                              </div>
                            </div>

                            {/* Deity name */}
                            <span className={cn(
                              "relative z-10 text-[15px] font-bold font-serif text-center leading-tight tracking-wide mt-2.5 pb-0.5",
                              isActive
                                ? (isDark ? "text-amber-300" : "text-[#D89B1F]")
                                : (isDark ? "text-amber-200/80" : "text-[#2B1F18]")
                            )}>
                              {isHi ? deity.name : deity.nameEn}
                            </span>

                            {/* Selected gold check badge */}
                            {isActive && (
                              <span className="absolute -top-1.5 -right-1.5 w-[18px] h-[18px] rounded-full bg-[#D89B1F] flex items-center justify-center shadow-md z-20 border border-white">
                                <svg viewBox="0 0 24 24" fill="none" stroke="#FFFFFF" strokeWidth="4.5" strokeLinecap="round" strokeLinejoin="round" className="w-[10px] h-[10px]">
                                  <polyline points="20 6 9 17 4 12"/>
                                </svg>
                              </span>
                            )}
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
                          <div key={sec.key} className="w-full space-y-3.5 text-left mb-4">
                            <div className="flex items-center justify-between w-full mb-1 px-0.5">
                              <div className="flex items-center gap-1.5">
                                <span className="text-[#D88A15] text-xs">✨</span>
                                <h3 className={cn("font-serif text-sm font-black uppercase", isDark ? "text-amber-400" : "text-[#2B1F18]")}>
                                  {isHi ? sec.nameHindi : sec.name}
                                </h3>
                              </div>
                              <button
                                onClick={() => setSelectedDeityFilter(null)}
                                className={cn("font-sans text-[11px] font-bold flex items-center gap-0.5 active:scale-95 transition-all", isDark ? "text-amber-500 hover:text-amber-400" : "text-[#8A7A6B] hover:text-[#2B1F18]")}
                              >
                                {isHi ? "सभी देखें" : "See All"} <span className="ml-1 text-sm font-black">→</span>
                              </button>
                            </div>

                            {/* 2-Column Equal Grid with Thin Gap */}
                            <div className="grid grid-cols-2 gap-2 w-full">
                              {sectionItems.map((wp, idx) => renderDevotionalCard(wp, idx, false))}
                            </div>
                          </div>
                        );
                      })
                    )}
                  </div>

                  {/* Premium upsell banner */}
                  <div className="w-full rounded-[20px] p-5 flex items-center justify-between shadow-md"
                    style={{
                      background: isDark ? "linear-gradient(135deg,rgba(251,191,36,0.08),rgba(217,119,6,0.12))" : "#FFFFFF",
                      border: isDark ? "1px solid rgba(251,191,36,0.2)" : "1px solid #EFE5DA"
                    }}>
                    <div className="flex items-center gap-3.5">
                      <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center text-black shadow-md shrink-0">
                        <Sparkles className="w-5 h-5 text-black fill-current animate-pulse"/>
                      </div>
                      <div className="text-left">
                        <h4 className={cn("font-serif text-sm font-bold", isDark ? "text-amber-200" : "text-[#2B1F18]")}>{isHi?"महाभक्त प्रीमियम":"Mahabhakt Premium"}</h4>
                        <p className={cn("text-[10px] font-sans mt-0.5 font-semibold", isDark ? "text-amber-200/85" : "text-[#8A7A6B]")}>108+ Exclusive Wallpapers</p>
                        <p className={cn("text-[9px] font-sans mt-1", isDark ? "text-amber-200/70" : "text-[#8A7A6B]/70")}>{isHi?"एचडी • विज्ञापन-मुक्त • प्रीमियम":"HD Quality • Ad-Free • Premium"}</p>
                      </div>
                    </div>
                    <button
                      onClick={()=>navigate("/pricing")}
                      className={`px-4 py-2.5 font-sans text-[10px] font-black uppercase rounded-xl transition-all active:scale-95 flex items-center gap-1 shadow-md shrink-0 cursor-pointer ${isHi ? '' : 'tracking-widest'}`}
                      style={{background:"linear-gradient(135deg,#D88A15,#D88A15)",color:"#FFFFFF"}}
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
                <div className="w-full flex flex-col items-center space-y-6 animate-fade-in">

                  {/* Live Deity chips */}
                  <div className="w-full flex flex-col">
                    <div className="flex items-center justify-between w-full mb-3 px-0.5">
                      <h3 className={cn("font-serif text-sm font-black flex items-center gap-2", isDark ? "text-amber-100" : "text-[#2B1F18]")}>
                        <span>🕉️</span>
                        {isHi ? "सजीव देवता दर्शन" : "Live Deity Feed"}
                      </h3>
                      <button onClick={()=>setSelectedDeityFilter(null)} className={cn("font-sans text-[11px] font-bold flex items-center gap-0.5 active:scale-95 transition-all", isDark ? "text-amber-500 hover:text-amber-400" : "text-[#8A7A6B] hover:text-[#2B1F18]")}>
                        {isHi?"सभी देखें":"View All"} <span className="ml-0.5 text-base leading-none" style={{lineHeight:1}}>›</span>
                      </button>
                    </div>
                    <div className="flex items-start gap-1.5 overflow-x-auto pb-3 pt-1.5 scrollbar-none w-full justify-start sm:justify-center px-1">
                      {[
                        { id:null,     name:"सभी",    nameEn:"All",    isIcon:true,  symbol:"🕉️", image:"" },
                        { id:"Shiva",  name:"शिव",    nameEn:"Shiva",  isIcon:false, symbol:"",   image:shivWallpaperImg },
                        { id:"Rama",   name:"राम",    nameEn:"Ram",    isIcon:false, symbol:"",   image:deityRamImg },
                        { id:"Krishna",name:"कृष्ण",  nameEn:"Krishna",isIcon:false, symbol:"",   image:krishnaImg },
                        { id:"Hanuman",name:"हनुमान", nameEn:"Hanuman",isIcon:false, symbol:"",   image:hanumanImg },
                      ].map((deity) => {
                        const isActive = selectedDeityFilter === deity.id;
                        return (
                          <button
                            key={deity.id ?? "all"}
                            onClick={() => setSelectedDeityFilter(deity.id)}
                            className={cn(
                              "w-[92px] h-[132px] flex flex-col items-center justify-between p-2 pb-3.5 rounded-2xl transition-all duration-300 relative shrink-0 outline-none focus:outline-none group",
                              isActive
                                ? "bg-[#FFFDF9] border-2 border-[#D89B1F] -translate-y-[3px] shadow-[0_4px_16px_rgba(216,155,31,0.22)]"
                                : (isDark 
                                    ? "bg-[#1f0f08]/90 border border-amber-900/30 shadow-sm" 
                                    : "bg-[#FFFDF9] border border-[#E9D7B3] shadow-sm shadow-[#E9D7B3]/10 hover:-translate-y-[1px]")
                            )}
                          >
                            {/* Centering container for watermark and crop */}
                            <div className="relative w-[78px] h-[78px] flex items-center justify-center shrink-0">
                              {/* Mandala Watermark */}
                              <img 
                                src={isActive ? mandalaGoldImg : mandalaBeigeImg} 
                                alt="" 
                                className={cn(
                                  "absolute w-[78px] h-[78px] top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none transition-all duration-700 select-none",
                                  isActive 
                                    ? "opacity-[0.88] scale-110 rotate-[25deg]" 
                                    : "opacity-[0.45] scale-100 rotate-0 group-hover:rotate-[15deg] group-hover:opacity-[0.62]"
                                )} 
                              />
                              
                              {/* Centered 62px circular image crop */}
                              <div className={cn("relative z-10 w-[62px] h-[62px] rounded-full overflow-hidden flex items-center justify-center bg-white shadow-inner transition-all", isActive ? "border-2 border-[#D89B1F]" : "border-2 border-[#E9D7B3]")}>
                                {deity.isIcon ? (
                                  <span className={cn("text-2xl transition-transform duration-300", isActive ? "scale-110" : "")}>{deity.symbol}</span>
                                ) : (
                                  <img 
                                    src={deity.image} 
                                    alt={deity.nameEn}
                                    className={cn("w-full h-full object-cover transition-transform duration-500", isActive ? "scale-110" : "group-hover:scale-105")}
                                  />
                                )}
                              </div>
                            </div>

                            {/* Deity name */}
                            <span className={cn(
                              "relative z-10 text-[15px] font-bold font-serif text-center leading-tight tracking-wide mt-2.5 pb-0.5",
                              isActive
                                ? (isDark ? "text-amber-300" : "text-[#D89B1F]")
                                : (isDark ? "text-amber-200/80" : "text-[#2B1F18]")
                            )}>
                              {isHi ? deity.name : deity.nameEn}
                            </span>

                            {/* Selected gold check badge */}
                            {isActive && (
                              <span className="absolute -top-1.5 -right-1.5 w-[18px] h-[18px] rounded-full bg-[#D89B1F] flex items-center justify-center shadow-md z-20 border border-white">
                                <svg viewBox="0 0 24 24" fill="none" stroke="#FFFFFF" strokeWidth="4.5" strokeLinecap="round" strokeLinejoin="round" className="w-[10px] h-[10px]">
                                  <polyline points="20 6 9 17 4 12"/>
                                </svg>
                              </span>
                            )}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Today's live recommendation */}
                  {!selectedDeityFilter && !searchQuery && (
                    <div className="w-full flex flex-col">
                      <div className="flex items-center justify-between w-full mb-3 px-0.5">
                        <h3 className={cn("font-serif text-sm font-black flex items-center gap-2", isDark ? "text-amber-100" : "text-[#2B1F18]")}>
                          <span>🌌</span>
                          {isHi?"आज की दिव्य सजीव लीला":"Today's Living Darshan"}
                        </h3>
                        <span className="text-[9px] font-sans text-white bg-[#D88A15] px-2 py-0.5 rounded-full font-black animate-pulse">{isHi?"लाइव":"Live"}</span>
                      </div>
                      <div className="w-full rounded-[20px] overflow-hidden relative cursor-pointer group"
                        style={{
                          border: isDark ? "1px solid rgba(251,191,36,0.15)" : "1px solid #EFE5DA",
                          boxShadow: isDark ? "0 8px 40px rgba(0,0,0,0.7)" : "0 8px 30px rgba(239,229,218,0.25)"
                        }}
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
                          <div key={sec.key} className="w-full space-y-3.5 text-left mb-4">
                            <div className="flex items-center justify-between w-full mb-1 px-0.5">
                              <div className="flex items-center gap-1.5">
                                <span className="text-[#D88A15] text-xs">🎬</span>
                                <h3 className={cn("font-serif text-sm font-black uppercase", isDark ? "text-amber-400" : "text-[#2B1F18]")}>
                                  {isHi ? sec.nameHindi : sec.name}
                                </h3>
                              </div>
                              <button
                                onClick={() => setSelectedDeityFilter(null)}
                                className={cn("font-sans text-[11px] font-bold flex items-center gap-0.5 active:scale-95 transition-all", isDark ? "text-amber-500 hover:text-amber-400" : "text-[#8A7A6B] hover:text-[#2B1F18]")}
                              >
                                {isHi ? "सभी देखें" : "See All"} <span className="ml-1 text-sm font-black">→</span>
                              </button>
                            </div>

                            {/* 2-Column Equal Grid with Thin Gap */}
                            <div className="grid grid-cols-2 gap-2 w-full">
                              {sectionItems.map((wp, idx) => renderDevotionalCard(wp, idx, true))}
                            </div>
                          </div>
                        );
                      })
                    )}
                  </div>

                  {/* How-to tip */}
                  <div className="w-full rounded-[20px] p-4 flex flex-col items-center gap-2"
                    style={{
                      background: isDark ? "rgba(27,13,7,0.4)" : "#FFFFFF",
                      border: isDark ? "1px solid rgba(120,60,10,0.2)" : "1px solid #EFE5DA"
                    }}>
                    <span className={cn("text-xs", isDark ? "text-amber-400" : "text-[#D88A15]")}>💡 {isHi?"सजीव वॉलपेपर कैसे लगाएं?":"How to Apply Live Wallpapers?"}</span>
                    <p className={cn("text-[9px] font-sans text-center tracking-wide leading-relaxed max-w-md", isDark ? "text-amber-200/85" : "text-[#8A7A6B]")}>
                      {isHi
                        ? "सजीव वॉलपेपर डाउनलोड करने पर एचडी मोशन जिफ/वेबपी प्राप्त होगी। किसी भी लाइव वॉलपेपर लॉन्चर की सहायता से इसे अपने लॉकस्क्रीन पर सेट करें।"
                        : "Downloading a live wallpaper grants you an HD motion webp/gif. Apply it to your lock screen using any live wallpaper settings on Android or iOS."}
                    </p>
                  </div>
                </div>
              )}
            </div>
          );
        })()}        {/* ========================================================= */}
        {/* TAB 3: MY SAVED GALLERY DIARY                             */}
        {/* ========================================================= */}
        {activeTab === "saved" && (
          <div className="w-full space-y-5 flex flex-col items-center animate-fade-in">
            {/* Title / Description */}
            <div className="text-center">
              <h2 className={cn("font-serif text-base font-bold", isDark ? "text-amber-400" : "text-[#B27A1C]")}>
                {isHi ? "मेरी पावन साधना गैलरी" : "My Sadhana Diary"}
              </h2>
              <p className={cn("text-xs font-sans mt-1 font-medium", isDark ? "text-amber-200/85" : "text-[#8C6D53]")}>
                {isHi ? "आपके द्वारा पूर्व में सहेजे गए दैनिक पोस्टर" : "Revisit your personalized posters saved on this device"}
              </p>
            </div>

            {/* Sub-tab selection within Saved tab */}
            <div className={cn("flex rounded-full p-1 max-w-xs w-full select-none font-sans text-xs mb-2 border shadow-sm", isDark ? "bg-[#120704]/80 border-amber-950/40" : "bg-[#FFFDF8] border-[#EAD7C3]")}>
              <button
                onClick={() => setSavedSubTab("posters")}
                className={cn(
                  "flex-1 flex items-center justify-center gap-1.5 py-2 px-4 rounded-full transition-all duration-200 cursor-pointer focus:outline-none font-black uppercase text-[10px]",
                  savedSubTab === "posters"
                    ? isDark
                      ? "bg-gradient-to-r from-amber-500 to-amber-600 text-stone-950 shadow-md"
                      : "bg-gradient-to-r from-[#651317] to-[#8B1E24] text-white shadow-md"
                    : isDark ? "bg-transparent text-amber-200/80 hover:text-amber-200" : "bg-transparent text-[#543D2B] hover:text-[#651317]"
                )}
              >
                <span>{isHi ? "सहेजे गए" : "Saved"}</span>
                <span className="text-[10px] opacity-75">({savedBlessings.length})</span>
              </button>
              <button
                onClick={() => setSavedSubTab("liked")}
                className={cn(
                  "flex-1 flex items-center justify-center gap-1.5 py-2 px-4 rounded-full transition-all duration-200 cursor-pointer focus:outline-none font-black uppercase text-[10px]",
                  savedSubTab === "liked"
                    ? isDark
                      ? "bg-gradient-to-r from-amber-500 to-amber-600 text-stone-950 shadow-md"
                      : "bg-gradient-to-r from-[#651317] to-[#8B1E24] text-white shadow-md"
                    : isDark ? "bg-transparent text-amber-200/80 hover:text-amber-200" : "bg-transparent text-[#543D2B] hover:text-[#651317]"
                )}
              >
                <span>{isHi ? "पसंदीदा" : "Liked"}</span>
                <span className="text-[10px] opacity-75">({likedPosters.length + likedWallpaperIds.length})</span>
              </button>
            </div>

            {/* A. SAVED POSTERS DIARY */}
            {savedSubTab === "posters" && (
              savedBlessings.length === 0 ? (
                <div className={cn("w-full border border-dashed rounded-3xl p-10 flex flex-col items-center justify-center text-center gap-3", isDark ? "border-amber-900/30" : "border-[#EAD7C3]")}>
                  <BookOpen className="w-8 h-8 text-amber-500/30" />
                  <p className={cn("text-xs font-sans", isDark ? "text-amber-200/85" : "text-[#8C6D53]")}>
                    {isHi ? "अभी तक कोई पोस्टर संग्रहित नहीं है।" : "Your saved posters diary is empty."}
                  </p>
                  <button
                    onClick={() => setActiveTab("maker")}
                    className={cn("px-4 py-2 border font-sans font-black text-[10px] uppercase rounded-lg transition-all active:scale-95 cursor-pointer", isHi ? "" : "tracking-widest", isDark ? "border-amber-500/20 hover:bg-amber-500/10 text-amber-300" : "border-[#B27A1C]/30 hover:bg-[#B27A1C]/10 text-[#B27A1C]")}
                  >
                    {isHi ? "पोस्टर बनाएं" : "Create Poster Now"}
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3.5 w-full select-none">
                  {savedBlessings.map((url, idx) => (
                    <div
                      key={idx}
                      className={cn("border rounded-2xl p-1.5 relative group overflow-hidden", isDark ? "bg-[#1b0d07]/40 border-amber-950/20" : "bg-white/70 border-[#EAD7C3]/60")}
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
                      <h3 className={cn("font-serif text-xs font-black uppercase flex items-center gap-2 border-b pb-2 tracking-wider", isDark ? "text-amber-400 border-amber-500/20" : "text-[#B27A1C] border-[#EAD7C3]")}>
                        <span>✨</span>
                        {isHi ? "पसंदीदा पोस्टर" : "Liked Posters"}
                      </h3>
                      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3.5 w-full">
                        {likedPosters.map((tpl) => (
                          <div
                            key={tpl.id}
                            onClick={() => setSelectedPoster(tpl)}
                            className={cn("border p-2 cursor-pointer group active:scale-[0.97] transition-all duration-300 rounded-2xl", isDark ? "bg-[#1b0d07]/40 border-amber-500/10 hover:border-amber-500/35" : "bg-white/70 border-[#EAD7C3]/60 hover:border-[#B27A1C]/45")}
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
                              <span style={{ fontSize: 8, color: isDark ? "rgba(251,191,36,0.85)" : "#B27A1C", fontWeight: 700, textTransform: "uppercase", letterSpacing: isHi ? "normal" : "0.04em", display: "block", marginTop: 2 }}>
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
                            style={{
                                  background: isDark ? 'rgba(15,7,3,0.7)' : 'rgba(255,255,255,0.75)',
                                  border: isDark ? '1px solid rgba(120,60,10,0.25)' : '1px solid rgba(188,138,83,0.25)',
                                  boxShadow: isDark ? '0 4px 20px rgba(0,0,0,0.5)' : '0 4px 20px rgba(188,138,83,0.1)'
                                }}
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
                                  background:wp.tier!=="free"?"linear-gradient(135deg,rgba(251,191,36,0.3),rgba(217,119,6,0.25))":"rgba(0,0,0,0.55)",
                                  border:wp.tier!=="free"?"1px solid rgba(251,191,36,0.5)":"1px solid rgba(251,191,36,0.25)",
                                  color:"#fbbf24",
                                  backdropFilter:"blur(2px)"}}>
                                {wp.tier !== "free" ? "👑 Pro" : "Free"}
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
                              <span className={cn("inline-block px-1.5 py-0.5 rounded text-[7.5px] font-sans font-black tracking-wide w-fit leading-none mb-0.5 shadow-sm backdrop-blur-[2px]", isDark ? "bg-amber-950/80 border border-amber-500/30 text-amber-300" : "bg-[#B27A1C]/10 border border-[#B27A1C]/30 text-[#B27A1C]")}>
                                {isHi
                                  ? (wp.deity==="Shiva"?"शिव":wp.deity==="Rama"?"राम":wp.deity==="Krishna"?"कृष्ण":wp.deity==="Hanuman"?"हनुमान":wp.deity==="Radha"?"राधा":wp.deity)
                                  : wp.deity}
                              </span>
                              <h4 style={{fontFamily:"serif",fontSize:11,fontWeight:800,color: isDark ? "rgba(255,251,235,0.95)" : "#543D2B",lineHeight:1.2}} className="line-clamp-1 block mt-0.5">
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
                            style={{
                                  background: isDark ? 'rgba(15,7,3,0.7)' : 'rgba(255,255,255,0.75)',
                                  border: isDark ? '1px solid rgba(120,60,10,0.25)' : '1px solid rgba(188,138,83,0.25)',
                                  boxShadow: isDark ? '0 4px 20px rgba(0,0,0,0.5)' : '0 4px 20px rgba(188,138,83,0.1)'
                                }}
                            onClick={() => handleLiveWallpaperAction(wp)}
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
                                  background:wp.tier!=="free"?"linear-gradient(135deg,rgba(251,191,36,0.3),rgba(217,119,6,0.25))":"rgba(0,0,0,0.55)",
                                  border:wp.tier!=="free"?"1px solid rgba(251,191,36,0.5)":"1px solid rgba(251,191,36,0.25)",
                                  color:"#fbbf24",
                                  backdropFilter:"blur(2px)"}}>
                                {wp.tier !== "free" ? "👑 Pro" : "Free"}
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
                              <span className={cn("inline-block px-1.5 py-0.5 rounded text-[7.5px] font-sans font-black tracking-wide w-fit leading-none mb-0.5 shadow-sm backdrop-blur-[2px]", isDark ? "bg-amber-950/80 border border-amber-500/30 text-amber-300" : "bg-[#B27A1C]/10 border border-[#B27A1C]/30 text-[#B27A1C]")}>
                                {isHi?(wp.deity==="Shiva"?"शिव":wp.deity==="Rama"?"राम":wp.deity==="Krishna"?"कृष्ण":wp.deity==="Hanuman"?"हनुमान":wp.deity):wp.deity}
                              </span>
                              <h4 style={{fontFamily:"serif",fontSize:11,fontWeight:800,color: isDark ? "rgba(255,251,235,0.95)" : "#543D2B",lineHeight:1.2}} className="line-clamp-1 block mt-0.5">
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
                    style={{ backgroundColor: isDark ? "rgba(20, 10, 5, 0.85)" : "rgba(255, 253, 248, 0.95)" }}
                    className={`fixed bottom-[8%] left-[25px] w-[90%] max-w-[430px] md:max-w-[500px] md:left-1/2 md:-translate-x-1/2 backdrop-blur-xl border rounded-[2rem] p-5 z-[130] flex flex-row items-center justify-between overflow-visible transition-colors duration-300 ${
                      isDark 
                        ? "border-amber-500/20 shadow-[0_25px_60px_rgba(0,0,0,0.95)]" 
                        : "border-[#EAD7C3] shadow-[0_20px_50px_rgba(84,61,43,0.18)]"
                    }`}
                  >
                    {/* Card close button */}
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setShowPreviewModal(null);
                      }}
                      className={`absolute top-4 left-4 w-7 h-7 md:w-8 md:h-8 rounded-full border flex items-center justify-center transition-all active:scale-90 cursor-pointer z-40 ${
                        isDark
                          ? "bg-black/40 border-white/10 text-white/70 hover:text-amber-400 hover:bg-black/60"
                          : "bg-black/5 border-[#EAD7C3] text-[#543D2B]/70 hover:text-[#B27A1C] hover:bg-black/10"
                      }`}
                    >
                      <X className="w-4 h-4" />
                    </button>
                    
                    {/* 1. LEFT SIDE: Info & CTA Card details */}
                    <div className="w-[55%] flex flex-col justify-between self-stretch pt-5 pb-1 gap-3.5 select-none text-left">
                      <div className="space-y-4 md:space-y-5">
                        {/* Header title */}
                        <div className="space-y-2">
                          <span className={`inline-block px-2 py-0.5 border rounded text-[7px] md:text-[9px] font-sans font-black uppercase tracking-widest leading-none shadow-sm backdrop-blur-[2px] ${
                            isDark
                              ? "bg-amber-500/10 border-amber-500/35 text-amber-400"
                              : "bg-[#651317]/10 border-[#651317]/25 text-[#651317]"
                          }`}>
                            {isHi
                              ? (wp.deity==="Shiva"?"शिव":wp.deity==="Rama"?"राम":wp.deity==="Krishna"?"कृष्ण":wp.deity==="Hanuman"?"हनुमान":wp.deity==="Radha"?"राधा":wp.deity)
                              : wp.deity}
                          </span>
                          <h2 className={`text-base md:text-2xl font-serif font-black leading-tight ${
                            isDark 
                              ? "text-transparent bg-clip-text bg-gradient-to-r from-amber-200 via-amber-100 to-amber-300" 
                              : "text-[#3A2418]"
                          }`}>
                            {isHi ? wp.nameHindi : wp.name}
                          </h2>
                          <p className={`text-[9px] md:text-xs font-sans font-medium leading-normal ${
                            isDark ? "text-amber-200/60" : "text-[#786252]"
                          }`}>
                            {isHi 
                              ? `रागघवम् गैलरी का पावन ${wp.tier !== "free" ? "प्रीमियम" : "मुफ़्त"} वॉलपेपर`
                              : `Sacred ${wp.tier !== "free" ? "Premium" : "Free"} mobile wallpaper from Raghavam gallery`}
                          </p>
                        </div>

                        {/* Toggle Pills Selection (Home screen vs Lock screen) - Segmented Control */}
                        <div className={`flex border rounded-full p-0.5 max-w-[240px] select-none font-sans text-[10px] md:text-xs ${
                          isDark ? "bg-stone-950/60 border-amber-500/10" : "bg-[#F4EAD8]/80 border-[#EAD7C3]"
                        }`}>
                          <button
                            onClick={() => setPreviewMode("lock")}
                            className={`flex-1 flex items-center justify-center gap-1 py-1.5 px-2 md:px-3.5 rounded-full transition-all duration-200 cursor-pointer ${
                              previewMode === "lock"
                                ? isDark
                                  ? "bg-amber-500 text-stone-950 font-bold shadow-md"
                                  : "bg-[#651317] text-white font-bold shadow-md"
                                : isDark
                                  ? "bg-transparent text-amber-200/80 hover:text-amber-200"
                                  : "bg-transparent text-[#786252] hover:text-[#3A2418]"
                            }`}
                          >
                            <Lock className="w-3 h-3" />
                            <span>{isHi ? "लॉक" : "Lock"}</span>
                          </button>
                          <button
                            onClick={() => setPreviewMode("home")}
                            className={`flex-1 flex items-center justify-center gap-1 py-1.5 px-2 md:px-3.5 rounded-full transition-all duration-200 cursor-pointer ${
                              previewMode === "home"
                                ? isDark
                                  ? "bg-amber-500 text-stone-950 font-bold shadow-md"
                                  : "bg-[#651317] text-white font-bold shadow-md"
                                : isDark
                                  ? "bg-transparent text-amber-200/80 hover:text-amber-200"
                                  : "bg-transparent text-[#786252] hover:text-[#3A2418]"
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
                          className={`w-full py-2 md:py-3.5 font-sans font-black text-[9px] md:text-xs uppercase tracking-widest rounded-xl md:rounded-2xl transition-all active:scale-[0.96] flex items-center justify-center gap-1.5 focus:outline-none cursor-pointer border ${
                            isDark
                              ? "bg-gradient-to-r from-amber-400 via-orange-500 to-amber-500 hover:from-amber-500 hover:to-orange-600 text-stone-950 shadow-[0_4px_12px_rgba(245,158,11,0.25)] border-amber-400/20"
                              : "bg-gradient-to-r from-[#651317] via-[#7D191E] to-[#651317] hover:from-[#7D191E] hover:to-[#651317] text-white shadow-[0_4px_12px_rgba(101,19,23,0.25)] border-[#651317]/20"
                          }`}
                        >
                          <Download className={`w-4 h-4 ${isDark ? "text-stone-950" : "text-white"}`} />
                          <span>{isHi ? "डाउनलोड" : "Download"}</span>
                        </button>
                        
                        <button
                          onClick={() => toggleSaveWallpaper(wp.id)}
                          className={`w-full py-1.5 md:py-2.5 font-sans font-black text-[9px] md:text-xs uppercase tracking-widest rounded-xl md:rounded-2xl transition-all active:scale-[0.96] flex items-center justify-center gap-1.5 focus:outline-none cursor-pointer border ${
                            isDark
                              ? "border-amber-500/30 hover:border-amber-500/50 bg-black/30 hover:bg-black/50 text-amber-400"
                              : "border-[#651317]/30 hover:border-[#651317]/50 bg-[#F4EAD8]/60 hover:bg-[#F4EAD8] text-[#651317]"
                          }`}
                        >
                          <Heart className={`w-4 h-4 ${likedWallpaperIds.includes(wp.id) ? (isDark ? "fill-amber-500 text-amber-500" : "fill-[#651317] text-[#651317]") : (isDark ? "text-amber-400" : "text-[#651317]")}`} />
                          <span>
                            {likedWallpaperIds.includes(wp.id) 
                              ? (isHi ? "सहेजा गया" : "Saved") 
                              : (isHi ? "सहेजें" : "Save")}
                          </span>
                        </button>
                      </div>
                    </div>

                    {/* 2. RIGHT SIDE: Realistic Phone Mockup panel */}
                    <div 
                      className="w-[42%] flex items-center justify-center relative overflow-visible"
                      onTouchStart={handleTouchStart}
                      onTouchEnd={(e) => handleTouchEnd(e, WALLPAPERS_LIST, wp.id, setShowPreviewModal)}
                    >
                      <div className="absolute -top-10 -right-6 md:-top-16 md:-right-8 z-30 transition-transform active:scale-[0.98]">
                        <PhoneFrame imageUrl={wp.imageUrl} previewMode={previewMode} />
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Swipe Help instruction at absolute bottom */}
              {isCardVisible && (
                <div className={`fixed bottom-4 inset-x-0 flex items-center justify-center gap-1 text-[9px] uppercase tracking-widest font-sans pointer-events-none select-none z-[131] font-semibold ${
                  isDark ? "text-amber-200/85" : "text-[#543D2B]/85"
                }`}>
                  <span className={isDark ? "text-amber-500/80" : "text-[#651317]/80"}>❈</span>
                  <span>👆 {isHi ? "स्वाइप करें और वॉलपेपर देखें" : "Swipe to change"}</span>
                  <span className={isDark ? "text-amber-500/80" : "text-[#651317]/80"}>❈</span>
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
                    style={{ backgroundColor: isDark ? "rgba(20, 10, 5, 0.85)" : "rgba(255, 253, 248, 0.95)" }}
                    className={`fixed bottom-[8%] left-1/2 -translate-x-1/2 w-[90%] max-w-[430px] md:max-w-[500px] backdrop-blur-xl border rounded-[2rem] p-5 z-[130] flex flex-row items-center justify-between overflow-visible transition-colors duration-300 ${
                      isDark 
                        ? "border-amber-500/20 shadow-[0_25px_60px_rgba(0,0,0,0.95)]" 
                        : "border-[#EAD7C3] shadow-[0_20px_50px_rgba(84,61,43,0.18)]"
                    }`}
                  >
                    {/* Card close button */}
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setShowLivePreviewModal(null);
                      }}
                      className={`absolute top-4 left-4 w-7 h-7 md:w-8 md:h-8 rounded-full border flex items-center justify-center transition-all active:scale-90 cursor-pointer z-40 ${
                        isDark
                          ? "bg-black/40 border-white/10 text-white/70 hover:text-amber-400 hover:bg-black/60"
                          : "bg-black/5 border-[#EAD7C3] text-[#543D2B]/70 hover:text-[#B27A1C] hover:bg-black/10"
                      }`}
                    >
                      <X className="w-4 h-4" />
                    </button>
                    
                    {/* 1. LEFT SIDE: Info & CTA */}
                    <div className="w-[55%] flex flex-col justify-between self-stretch pt-5 pb-1 gap-3.5 select-none text-left">
                      <div className="space-y-4 md:space-y-5">
                        {/* Header title */}
                        <div className="space-y-2">
                          <div className="flex flex-wrap items-center gap-1.5">
                            <span className={`inline-block px-2 py-0.5 border rounded text-[7px] md:text-[9px] font-sans font-black uppercase tracking-widest leading-none shadow-sm backdrop-blur-[2px] ${
                              isDark
                                ? "bg-amber-500/15 border-amber-500/35 text-amber-400"
                                : "bg-[#651317]/10 border-[#651317]/25 text-[#651317]"
                            }`}>
                              {isHi
                                ? (wp.deity==="Shiva"?"शिव":wp.deity==="Rama"?"राम":wp.deity==="Krishna"?"कृष्ण":wp.deity==="Hanuman"?"हनुमान":wp.deity)
                                : wp.deity}
                            </span>
                            <span className={`inline-block px-2 py-0.5 border rounded text-[7px] md:text-[9px] font-sans font-black uppercase tracking-widest leading-none shadow-sm backdrop-blur-[2px] ${
                              isDark
                                ? "bg-orange-500/15 border-orange-500/35 text-orange-400"
                                : "bg-[#B27A1C]/15 border-[#B27A1C]/35 text-[#B27A1C]"
                            }`}>
                              {wp.effect}
                            </span>
                          </div>
                          <h2 className={`text-base md:text-2xl font-serif font-black leading-tight ${
                            isDark 
                              ? "text-transparent bg-clip-text bg-gradient-to-r from-amber-200 via-amber-100 to-amber-300" 
                              : "text-[#3A2418]"
                          }`}>
                            {isHi ? wp.nameHindi : wp.name}
                          </h2>
                          <p className={`text-[9px] md:text-xs font-sans font-medium leading-normal ${
                            isDark ? "text-amber-200/60" : "text-[#786252]"
                          }`}>
                            {isHi 
                              ? `रागघवम् गैलरी का पावन सजीव ${wp.tier !== "free" ? "प्रीमियम" : "मुफ़्त"} वॉलपेपर`
                              : `Sacred ${wp.tier !== "free" ? "Premium" : "Free"} live wallpaper from Raghavam gallery`}
                          </p>
                        </div>

                        {/* Toggle Pills Selection - Segmented Control */}
                        <div className={`flex border rounded-full p-0.5 max-w-[240px] select-none font-sans text-[10px] md:text-xs ${
                          isDark ? "bg-stone-950/60 border-amber-500/10" : "bg-[#F4EAD8]/80 border-[#EAD7C3]"
                        }`}>
                          <button
                            onClick={() => setPreviewMode("lock")}
                            className={`flex-1 flex items-center justify-center gap-1 py-1.5 px-2 md:px-3.5 rounded-full transition-all duration-200 cursor-pointer ${
                              previewMode === "lock"
                                ? isDark
                                  ? "bg-amber-500 text-stone-950 font-bold shadow-md"
                                  : "bg-[#651317] text-white font-bold shadow-md"
                                : isDark
                                  ? "bg-transparent text-amber-200/80 hover:text-amber-200"
                                  : "bg-transparent text-[#786252] hover:text-[#3A2418]"
                            }`}
                          >
                            <Lock className="w-3 h-3" />
                            <span>{isHi ? "लॉक" : "Lock"}</span>
                          </button>
                          <button
                            onClick={() => setPreviewMode("home")}
                            className={`flex-1 flex items-center justify-center gap-1 py-1.5 px-2 md:px-3.5 rounded-full transition-all duration-200 cursor-pointer ${
                              previewMode === "home"
                                ? isDark
                                  ? "bg-amber-500 text-stone-950 font-bold shadow-md"
                                  : "bg-[#651317] text-white font-bold shadow-md"
                                : isDark
                                  ? "bg-transparent text-amber-200/80 hover:text-amber-200"
                                  : "bg-transparent text-[#786252] hover:text-[#3A2418]"
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
                          className={`w-full py-2 md:py-3.5 font-sans font-black text-[9px] md:text-xs uppercase tracking-widest rounded-xl md:rounded-2xl transition-all active:scale-[0.96] flex items-center justify-center gap-1.5 focus:outline-none cursor-pointer border ${
                            isDark
                              ? "bg-gradient-to-r from-amber-400 via-orange-500 to-amber-500 hover:from-amber-500 hover:to-orange-600 text-stone-950 shadow-[0_4px_12px_rgba(245,158,11,0.25)] border-amber-400/20"
                              : "bg-gradient-to-r from-[#651317] via-[#7D191E] to-[#651317] hover:from-[#7D191E] hover:to-[#651317] text-white shadow-[0_4px_12px_rgba(101,19,23,0.25)] border-[#651317]/20"
                          }`}
                        >
                          <CustomDownloadIcon className={`w-4 h-4 ${isDark ? "text-stone-950" : "text-white"}`} />
                          <span>{isHi ? "डाउनलोड" : "Download"}</span>
                        </button>
                        
                        <button
                          onClick={() => toggleSaveWallpaper(wp.id)}
                          className={`w-full py-1.5 md:py-2.5 font-sans font-black text-[9px] md:text-xs uppercase tracking-widest rounded-xl md:rounded-2xl transition-all active:scale-[0.96] flex items-center justify-center gap-1.5 focus:outline-none cursor-pointer border ${
                            isDark
                              ? "border-amber-500/30 hover:border-amber-500/50 bg-black/30 hover:bg-black/50 text-amber-400"
                              : "border-[#651317]/30 hover:border-[#651317]/50 bg-[#F4EAD8]/60 hover:bg-[#F4EAD8] text-[#651317]"
                          }`}
                        >
                          <Heart className={`w-4 h-4 ${likedWallpaperIds.includes(wp.id) ? (isDark ? "fill-amber-500 text-amber-500" : "fill-[#651317] text-[#651317]") : (isDark ? "text-amber-400" : "text-[#651317]")}`} />
                          <span>
                            {likedWallpaperIds.includes(wp.id) 
                              ? (isHi ? "सहेजा गया" : "Saved") 
                              : (isHi ? "सहेजें" : "Save")}
                          </span>
                        </button>
                      </div>
                    </div>

                    {/* 2. RIGHT SIDE: Phone Mockup panel */}
                    <div 
                      className="w-[42%] flex items-center justify-center relative overflow-visible"
                      onTouchStart={handleTouchStart}
                      onTouchEnd={(e) => handleTouchEnd(e, LIVE_WALLPAPERS_LIST, wp.id, setShowLivePreviewModal)}
                    >
                      <div className="absolute -top-10 -right-6 md:-top-16 md:-right-8 z-30 transition-transform active:scale-[0.98]">
                        <PhoneFrame imageUrl={wp.thumbnailUrl} previewMode={previewMode} effect={wp.effect} />
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Swipe Help instruction at absolute bottom */}
              {isCardVisible && (
                <div className={`fixed bottom-4 inset-x-0 flex items-center justify-center gap-1 text-[9px] uppercase tracking-widest font-sans pointer-events-none select-none z-[131] font-semibold ${
                  isDark ? "text-amber-200/85" : "text-[#543D2B]/85"
                }`}>
                  <span className={isDark ? "text-amber-500/80" : "text-[#651317]/80"}>❈</span>
                  <span>👆 {isHi ? "स्वाइप करें और वॉलपेपर देखें" : "Swipe to change"}</span>
                  <span className={isDark ? "text-amber-500/80" : "text-[#651317]/80"}>❈</span>
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
              className="fixed inset-0 bg-black/65 z-[150] backdrop-blur-sm"
            />

            {/* Bottom Sheet Drawer Container — position above mobile footer */}
            <motion.div
              initial={{ opacity: 0, y: "100%" }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: "100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className={cn(
                "fixed inset-x-0 bottom-[calc(4.2rem+env(safe-area-inset-bottom))] md:bottom-auto md:top-[20%] max-w-md mx-auto rounded-t-[2.2rem] md:rounded-[2rem] p-6 shadow-2xl z-[160] flex flex-col gap-5 text-stone-200 border pointer-events-auto",
                isDark 
                  ? "bg-gradient-to-b from-[#1c0d06] to-[#0e0502] border-amber-500/30 text-stone-200 shadow-black/80" 
                  : "bg-[#FFFDF8] border-[#EAD7C3] text-[#3A2418] shadow-stone-900/20"
              )}
            >
              {/* Drag handle */}
              <div className={cn("w-12 h-1 rounded-full mx-auto md:hidden", isDark ? "bg-amber-500/20" : "bg-[#651317]/20")} />

              <div className="flex justify-between items-center">
                <h3 className={cn("font-serif text-base font-black uppercase tracking-widest", isDark ? "text-amber-400" : "text-[#651317]")}>
                  {isHi ? "प्रोफ़ाइल सेटअप" : "Profile Setup"}
                </h3>
                <button
                  onClick={() => setShowSetupSheet(false)}
                  className={cn("w-8 h-8 rounded-full border flex items-center justify-center transition-colors cursor-pointer", isDark ? "bg-amber-500/10 hover:bg-amber-500/20 border-amber-500/20 text-amber-400" : "bg-[#651317]/10 hover:bg-[#651317]/20 border-[#651317]/20 text-[#651317]")}
                >
                  <X className="w-4.5 h-4.5" />
                </button>
              </div>

              {/* Upload Photo section — Elegant avatar with non-overlapping camera badge */}
              <div className="flex flex-col items-center gap-3">
                <div className="relative inline-block">
                  <div className={cn("w-24 h-24 rounded-full overflow-hidden border-2 flex items-center justify-center shadow-lg transition-all", isDark ? "border-amber-500/50 bg-stone-900/80 shadow-amber-500/10" : "border-[#D4A437] bg-[#FCF6E8] shadow-amber-900/10")}>
                    {tempPhoto ? (
                      <img src={tempPhoto} alt="Preview avatar" className="w-full h-full object-cover" />
                    ) : (
                      <span className={cn("font-serif text-2xl", isDark ? "text-amber-400/80" : "text-[#651317]")}>ॐ</span>
                    )}
                  </div>

                  {/* Camera float overlay badge outside overflow container */}
                  <button
                    type="button"
                    onClick={(e) => {
                      e.preventDefault();
                      if (fileInputRef.current) {
                        fileInputRef.current.value = "";
                      }
                      fileInputRef.current?.click();
                    }}
                    className={cn("absolute bottom-0 right-0 w-8 h-8 rounded-full flex items-center justify-center shadow-md cursor-pointer active:scale-90 transition-transform border-2", isDark ? "bg-amber-500 border-stone-950 text-stone-950 hover:bg-amber-400" : "bg-[#651317] border-white text-white hover:bg-[#8B1E24]")}
                  >
                    <Camera className="w-4 h-4" />
                  </button>
                </div>

                <span className={cn("text-[10px] uppercase font-sans font-black tracking-wider", isDark ? "text-amber-500/90" : "text-[#651317]")}>
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
                <label className={cn("text-[10px] uppercase font-sans font-black tracking-wider", isDark ? "text-amber-500/90" : "text-[#786252]")}>
                  {isHi ? "आपका नाम" : "Your Name"}
                </label>
                <div className="relative">
                  <div className={cn("absolute left-4 top-1/2 -translate-y-1/2", isDark ? "text-amber-500/70" : "text-[#651317]/70")}>
                    <UserIcon className="w-4 h-4" />
                  </div>
                  <input
                    type="text"
                    maxLength={30}
                    placeholder={isHi ? "नाम दर्ज करें..." : "Enter your name..."}
                    value={tempName}
                    onChange={(e) => setTempName(e.target.value)}
                    className={cn(
                      "w-full rounded-xl py-3 pl-11 pr-16 text-xs focus:outline-none tracking-wide font-sans font-medium border transition-colors",
                      isDark
                        ? "bg-black/45 border-amber-500/20 focus:border-amber-500/45 text-amber-100 placeholder:text-amber-200/85"
                        : "bg-white border-[#EAD7C3] focus:border-[#651317] text-[#3A2418] placeholder:text-[#786252]/60"
                    )}
                  />
                  <span className={cn("absolute right-4 top-1/2 -translate-y-1/2 text-[9px] font-sans font-bold", isDark ? "text-amber-500/80" : "text-[#786252]")}>
                    {tempName.length}/30
                  </span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="space-y-2.5">
                <button
                  onClick={() => {
                    const finalName = tempName.trim();
                    if (!finalName) {
                      toast.error(isHi ? "कृपया अपना नाम दर्ज करें!" : "Please enter your name!");
                      return;
                    }
                    setUserName(finalName);
                    setUserPhoto(tempPhoto);
                    try {
                      localStorage.setItem("hk_profile_name", finalName);
                      if (tempPhoto) {
                        localStorage.setItem("hk_profile_photo", tempPhoto);
                      } else {
                        localStorage.removeItem("hk_profile_photo");
                      }
                    } catch (err) {
                      console.error("Failed to save profile details to localStorage", err);
                    }
                    setShowSetupSheet(false);
                    toast.success(isHi ? "प्रोफ़ाइल सफलतापूर्वक सहेज ली गई!" : "Profile details saved successfully!");
                  }}
                  disabled={!tempName.trim()}
                  className={cn(
                    "w-full py-3.5 font-sans font-black text-xs uppercase rounded-xl transition-all active:scale-[0.97] flex items-center justify-center gap-1.5 shadow-md cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed",
                    isDark
                      ? "bg-gradient-to-r from-amber-500 to-amber-600 text-stone-950"
                      : "bg-gradient-to-r from-[#651317] to-[#8B1E24] text-white"
                  )}
                >
                  <Check className="w-4 h-4" />
                  <span>{isHi ? "प्रोफ़ाइल सहेजें" : "Save Profile"}</span>
                </button>

                {/* Delete Profile Option */}
                {(tempPhoto || (tempName && tempName !== "हरि भक्त")) && (
                  <button
                    type="button"
                    onClick={() => {
                      setTempPhoto(null);
                      setTempName("");
                      setUserPhoto(null);
                      setUserName("हरि भक्त");
                      try {
                        localStorage.removeItem("hk_profile_name");
                        localStorage.removeItem("hk_profile_photo");
                      } catch (err) {}
                      setShowSetupSheet(false);
                      toast.info(isHi ? "प्रोफ़ाइल हटा दी गई!" : "Profile deleted & reset!");
                    }}
                    className={cn(
                      "w-full py-2.5 rounded-xl font-sans font-bold text-xs flex items-center justify-center gap-1.5 transition-all cursor-pointer border active:scale-95",
                      isDark
                        ? "bg-red-500/10 border-red-500/30 text-red-400 hover:bg-red-500/20"
                        : "bg-red-50 border-red-200 text-red-700 hover:bg-red-100"
                    )}
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>{isHi ? "प्रोफ़ाइल / फ़ोटो हटाएं" : "Delete Profile & Photo"}</span>
                  </button>
                )}

                <p className="text-[9.5px] font-sans text-emerald-600 dark:text-emerald-400 flex items-center justify-center gap-1.5 leading-none pt-1">
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
              className="fixed inset-0 z-[30]"
              style={{ background: isDark ? "rgba(10,3,1,0.94)" : "rgba(252,246,232,0.92)", backdropFilter: "blur(18px)" }}
            />

            {/* Modal */}
            <div className="fixed inset-x-0 top-0 bottom-[4.2rem] md:bottom-0 z-[35] flex items-center justify-center pointer-events-none">
              <motion.div
                initial={{ opacity: 0, scale: 0.96 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.96 }}
                transition={{ duration: 0.22, ease: [0.25, 0.1, 0.25, 1] }}
                className="pointer-events-auto w-full max-w-[420px] h-full flex flex-col justify-between"
                style={{
                  background: "transparent",
                  overflow: "hidden",
                }}
              >
                {/* ── TOP: Close button + Share button + Poster card ── */}
                <div
                  className="flex-1 min-h-0 flex flex-col items-center justify-end relative"
                  style={{ padding: "14px 12px 6px", overflow: "hidden" }}
                >
                  {/* Close button — top left */}
                  <button
                    onClick={() => { setSelectedPoster(null); setShowProfileEdit(false); }}
                    className="absolute top-3 left-4 z-50 flex items-center justify-center cursor-pointer shadow-lg active:scale-95"
                    style={{
                      width: 40, height: 40, borderRadius: "50%",
                      background: isDark ? "rgba(0,0,0,0.65)" : "rgba(255,253,248,0.9)",
                      border: isDark ? "1px solid rgba(251,191,36,0.35)" : "1px solid #EAD7C3",
                      color: isDark ? "#fbbf24" : "#543D2B",
                      transition: "transform 0.2s, opacity 0.2s",
                    }}
                    onMouseEnter={e => (e.currentTarget.style.transform="scale(1.08)")}
                    onMouseLeave={e => (e.currentTarget.style.transform="scale(1)")}
                  >
                    <X className="w-5 h-5" />
                  </button>

                  {/* Share button — top right, equal to close button */}
                  <button
                    onClick={handleSharePosterNative}
                    className="absolute top-3 right-4 z-50 flex items-center justify-center cursor-pointer shadow-lg active:scale-95"
                    style={{
                      width: 40, height: 40, borderRadius: "50%",
                      background: isDark ? "rgba(0,0,0,0.65)" : "rgba(255,253,248,0.9)",
                      border: isDark ? "1px solid rgba(251,191,36,0.35)" : "1px solid #EAD7C3",
                      color: isDark ? "#fbbf24" : "#543D2B",
                      transition: "transform 0.2s, opacity 0.2s",
                    }}
                    onMouseEnter={e => (e.currentTarget.style.transform="scale(1.08)")}
                    onMouseLeave={e => (e.currentTarget.style.transform="scale(1)")}
                  >
                    <Share2 className="w-5 h-5" />
                  </button>

                  {/* Scrollable container of poster cards - Vertical snap scrolling */}
                  <div
                    ref={posterScrollContainerRef}
                    onScroll={handlePosterScroll}
                    className={`w-full flex flex-col snap-y snap-mandatory scrollbar-none gap-0 ${isEditingPhoto ? "overflow-y-hidden touch-none" : "overflow-y-auto"}`}
                    style={{
                      height: "calc(100% - 10px)",
                      maxHeight: "calc(100% - 10px)",
                      opacity: hasScrolledPosterToInitial ? 1 : 0,
                      transition: "opacity 0.12s ease-in-out",
                      WebkitOverflowScrolling: "touch",
                      scrollBehavior: "smooth",
                      overscrollBehavior: "contain",
                    }}
                  >
                    {filteredPosterTemplates.map((tpl) => {
                      const isActive = selectedPoster.id === tpl.id;
                      
                      // Calculate relative coordinate percentages matching 1080x1920 canvas
                      const CX_tpl = tpl.photoPosition.x + posterOffsetX;
                      const CY_tpl = tpl.photoPosition.y + posterOffsetY;
                      const R_tpl = tpl.photoPosition.radius * posterFrameScale;

                      const photoLeft = `${(CX_tpl / 1080) * 100}%`;
                      const photoTop = `${(CY_tpl / 1920) * 100}%`;
                      const avatarWidthPercent = `${((R_tpl * 2) / 1080) * 100}%`;
                      const nameLeft = `${((tpl.namePosition.x + posterNameOffsetX) / 1080) * 100}%`;
                      const nameTop = `${((tpl.namePosition.y + posterNameOffsetY) / 1920) * 100}%`;

                      return (
                        <div
                          key={tpl.id}
                          id={`poster-card-${tpl.id}`}
                          className="snap-center shrink-0 w-full h-full flex items-center justify-center relative select-none"
                          style={{ scrollSnapStop: "always", height: "100%" }}
                        >
                          <div
                            ref={isActive ? posterCardRef : undefined}
                            className="relative overflow-hidden"
                            style={{
                              aspectRatio: "9/16",
                              width: "100%",
                              height: "100%",
                              maxWidth: 390,
                              maxHeight: "100%",
                              borderRadius: 18,
                              boxShadow: isDark ? "0 16px 48px rgba(0,0,0,0.85)" : "0 16px 48px rgba(84,61,43,0.18)",
                              background: isDark ? "#120603" : "#FFFDF8",
                            }}
                          >
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
                              if (hidePhotoFrame) return null;

                              const shapeForTpl = posterShape;
                              const zoomForTpl = posterZoom;
                              const offsetXForTpl = posterOffsetX;
                              const offsetYForTpl = posterOffsetY;

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
                                  ref={photoLayerRef}
                                  className={`absolute overflow-hidden flex items-center justify-center cursor-pointer ${isEditable ? 'cursor-grab select-none active:cursor-grabbing touch-none z-[120]' : 'z-[100]'}`}
                                  onClick={() => {
                                    if (!isEditable) {
                                      if (!userPhoto) {
                                        if (profileEditFileInputRef.current) {
                                          profileEditFileInputRef.current.value = "";
                                        }
                                        profileEditFileInputRef.current?.click();
                                      } else {
                                        setIsEditingPhoto(true);
                                        setEditingElement("photo");
                                      }
                                    }
                                  }}
                                  style={{
                                    left: photoLeft,
                                    top: photoTop,
                                    width: avatarWidthPercent,
                                    aspectRatio: shapeForTpl === "oval" ? "3/4" : "1/1",
                                    transform: `translate(-50%, -50%) rotate(${posterRotation}rad)`,
                                    borderRadius: computedBorderRadius,
                                    border: isPhotoSelected 
                                      ? isDark ? "2px dashed #fbbf24" : "2px dashed #651317"
                                      : isEditable 
                                      ? isDark ? "1.5px dashed rgba(251, 191, 36, 0.4)" : "1.5px dashed rgba(101, 19, 23, 0.5)"
                                      : isDark ? "1.5px solid #fbbf24" : "1.5px solid #651317",
                                    background: isDark ? "#1b0a05" : "#FFFDF8",
                                    boxShadow: isPhotoSelected 
                                      ? isDark ? "0 0 0 2px rgba(251, 191, 36, 0.4), 0 0 24px rgba(251, 191, 36, 0.95)" : "0 0 0 2px rgba(101, 19, 23, 0.3), 0 0 20px rgba(101, 19, 23, 0.4)"
                                      : isDark ? "0 4px 12px rgba(0,0,0,0.6)" : "0 4px 14px rgba(101, 19, 23, 0.15)",
                                    touchAction: "none"
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
                                    const scaleX = 1080 / rect.width;
                                    const scaleY = 1920 / rect.height;
                                    const dx = (e.clientX - data.x) * scaleX;
                                    const dy = (e.clientY - data.y) * scaleY;
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
                                        transform: `scale(${zoomForTpl})`,
                                        transformOrigin: "center center",
                                      }} 
                                      className="pointer-events-none"
                                    />
                                  ) : (
                                    <img 
                                      src={omSvg} 
                                      alt="Om" 
                                      className="w-10 h-10 sm:w-12 sm:h-12 md:w-16 md:h-16 object-contain pointer-events-none drop-shadow" 
                                    />
                                  )}

                                  {/* Clean selected frame without handle dots */}
                                </div>
                              );
                            })()}

                            {/* Live CSS Name Banner Overlay */}
                            {(() => {
                              const isNameEditable = isActive && isEditingPhoto;
                              const isNameSelected = isNameEditable && editingElement === "name";

                              const computedNameBorderRadius = 
                                posterNameShape === "circle" || posterNameShape === "oval"
                                  ? "999px"
                                  : posterNameShape === "square"
                                  ? "0px"
                                  : "12px";

                              return (
                                <>
                                  <div
                                    ref={nameLayerRef}
                                    className={`absolute flex items-center justify-center whitespace-nowrap ${isNameEditable ? 'cursor-grab select-none active:cursor-grabbing touch-none z-[120]' : ''}`}
                                    style={{
                                      left: nameLeft,
                                      top: nameTop,
                                      transform: `translate(-50%, -50%) scale(${posterNameScale}) rotate(${posterNameRotation}rad)`,
                                      background: isDark ? "rgba(12, 5, 2, 0.88)" : "rgba(255, 253, 248, 0.95)",
                                      border: isNameSelected 
                                        ? isDark ? "2px dashed #fbbf24" : "2px dashed #651317"
                                        : isNameEditable
                                        ? isDark ? "1.5px dashed rgba(251, 191, 36, 0.5)" : "1.5px dashed rgba(101, 19, 23, 0.6)"
                                        : isDark ? "1.5px solid rgba(251, 191, 36, 0.5)" : "1.5px solid #651317",
                                      borderRadius: computedNameBorderRadius,
                                      padding: "4px min(4vw, 16px)",
                                      boxShadow: isNameSelected
                                        ? isDark ? "0 0 0 2px rgba(251, 191, 36, 0.4), 0 0 24px rgba(251, 191, 36, 0.95)" : "0 0 0 2px rgba(101, 19, 23, 0.3), 0 0 20px rgba(101, 19, 23, 0.3)"
                                        : isDark ? "0 6px 16px rgba(0,0,0,0.7)" : "0 4px 14px rgba(101, 19, 23, 0.18)",
                                      transition: "border 0.2s, box-shadow 0.2s",
                                      touchAction: "none"
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
                                      const scaleX = 1080 / rect.width;
                                      const scaleY = 1920 / rect.height;
                                      const dx = (e.clientX - data.x) * scaleX;
                                      const dy = (e.clientY - data.y) * scaleY;
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
                                        color: isDark ? "#fbbf24" : "#651317",
                                        fontSize: "min(3.2vw, 16px)",
                                        letterSpacing: isHi ? "normal" : "0.02em",
                                      }}
                                    >
                                      {userName.trim() ? userName : (isHi ? "आपका नाम..." : "Your Name...")}
                                    </span>
                                  </div>

                                  {/* Render Extra Custom Text Boxes */}
                                  {isActive && extraTextBoxes.map((box) => {
                                    if (!isEditingPhoto && !box.text.trim()) return null;
                                    const isBoxEditable = isActive && isEditingPhoto;
                                    const isBoxSelected = isBoxEditable && editingElement === box.id;
                                    const computedBoxBorderRadius = 
                                      box.shape === "circle" || box.shape === "oval" ? "999px" : box.shape === "square" ? "0px" : "12px";

                                    const boxLeft = `${((tpl.namePosition.x + posterNameOffsetX + box.offsetX) / 1080) * 100}%`;
                                    const boxTop = `${((tpl.namePosition.y + posterNameOffsetY + box.offsetY) / 1920) * 100}%`;

                                    const displayText = box.text.trim() ? box.text : (isBoxEditable ? (isHi ? "नया पाठ..." : "New Text...") : "");
                                    if (!displayText) return null;

                                    return (
                                      <div
                                        key={box.id}
                                        className={`absolute flex items-center justify-center touch-none z-[130] ${isBoxEditable ? "cursor-grab active:cursor-grabbing select-none" : "pointer-events-none"}`}
                                        style={{
                                          left: boxLeft,
                                          top: boxTop,
                                          transform: `translate(-50%, -50%) scale(${box.scale}) rotate(${box.rotation}rad)`,
                                          background: isDark ? "rgba(12, 5, 2, 0.88)" : "rgba(255, 253, 248, 0.95)",
                                          border: isBoxSelected
                                            ? isDark ? "2px solid #fbbf24" : "2px solid #651317"
                                            : isDark ? "1.5px solid rgba(251, 191, 36, 0.5)" : "1.5px solid #651317",
                                          borderRadius: computedBoxBorderRadius,
                                          padding: "4px min(4vw, 16px)",
                                          boxShadow: isBoxSelected
                                            ? isDark ? "0 0 0 3px rgba(251,191,36,0.25)" : "0 0 0 3px rgba(101,19,23,0.18)"
                                            : isDark ? "0 6px 16px rgba(0,0,0,0.7)" : "0 4px 14px rgba(101, 19, 23, 0.18)",
                                          touchAction: "none",
                                        }}
                                        onPointerDown={isBoxEditable ? (e) => {
                                          e.stopPropagation();
                                          setEditingElement(box.id);
                                          e.currentTarget.setPointerCapture(e.pointerId);
                                          (e.currentTarget as any)._dragStart = {
                                            x: e.clientX,
                                            y: e.clientY,
                                            ox: box.offsetX,
                                            oy: box.offsetY
                                          };
                                        } : undefined}
                                        onPointerMove={isBoxEditable ? (e) => {
                                          const data = (e.currentTarget as any)._dragStart;
                                          if (!data) return;
                                          const rect = e.currentTarget.parentElement?.getBoundingClientRect();
                                          if (!rect) return;
                                          const scale = 1080 / rect.width;
                                          const dx = (e.clientX - data.x) * scale;
                                          const dy = (e.clientY - data.y) * (1920 / rect.height);
                                          handleUpdateCustomTextBox(box.id, {
                                            offsetX: data.ox + dx,
                                            offsetY: data.oy + dy
                                          });
                                        } : undefined}
                                        onPointerUp={isBoxEditable ? (e) => {
                                          delete (e.currentTarget as any)._dragStart;
                                          e.currentTarget.releasePointerCapture(e.pointerId);
                                        } : undefined}
                                        onPointerCancel={isBoxEditable ? (e) => {
                                          delete (e.currentTarget as any)._dragStart;
                                          e.currentTarget.releasePointerCapture(e.pointerId);
                                        } : undefined}
                                      >
                                        <span
                                          style={{
                                            fontFamily: "serif",
                                            fontWeight: 800,
                                            color: isDark ? "#fbbf24" : "#651317",
                                            fontSize: "min(3.0vw, 15px)",
                                            opacity: !box.text.trim() && isBoxEditable ? 0.55 : 1.0,
                                            userSelect: "none",
                                            pointerEvents: "none",
                                          }}
                                        >
                                          {displayText}
                                        </span>
                                      </div>
                                    );
                                  })}
                                </>
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
                  style={{ background: isDark ? "#0c0300" : "#FCF6E8", paddingTop: 0, maxHeight: "52vh", overflowY: "auto", WebkitOverflowScrolling: "touch" as any }}
                >
                  {isEditingPhoto ? (
                    <div className={cn("flex flex-col w-full", isDark ? "bg-[#0c0300]" : "bg-[#FCF6E8]")} style={{ paddingTop: 0 }}>
                      
                      {/* 1. TITLE / INDICATOR ROW */}
                      <div className={cn("flex justify-between items-center px-4 py-2.5 border-b", isDark ? "border-white/5" : "border-[#EAD7C3]")}>
                        <div className="flex flex-col text-left">
                          <span style={{ fontSize: 13, fontFamily: "serif", fontWeight: 800, color: isDark ? "#fbbf24" : "#3A2418", letterSpacing: "0.02em" }}>
                            {isHi ? "तस्वीर और नाम समायोजन" : "Adjust Photo & Name"}
                          </span>
                          <span style={{ fontSize: 10, fontFamily: "sans-serif", color: isDark ? "rgba(255,255,255,0.4)" : "#786252" }}>
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
                            setHidePhotoFrame(false);
                          }}
                          className={cn(
                            "px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 border border-[#651317] dark:border-amber-500/40 bg-white dark:bg-stone-900 text-[#651317] dark:text-amber-300 select-none active:scale-95 shadow-sm hover:bg-stone-50"
                          )}
                        >
                          <RotateCcw className="w-3.5 h-3.5" />
                          <span>{isHi ? "पुनः सेट" : "Reset"}</span>
                        </button>
                      </div>

                      {/* 2. LAYER SELECTOR (Photo, Name, Custom Textboxes + Add Text Button) */}
                      <div className={cn("flex items-center gap-2 px-4 py-2.5 border-b overflow-x-auto no-scrollbar", isDark ? "border-white/5 bg-[#0a0200]" : "border-[#EAD7C3] bg-[#FCF6E8]")}>
                        {/* Photo Layer button */}
                        <button
                          onClick={() => setEditingElement("photo")}
                          className={cn(
                            "py-2 px-3 rounded-xl text-xs font-bold tracking-wide transition-all cursor-pointer select-none flex items-center gap-1.5 border border-[#651317] shrink-0",
                            editingElement === "photo"
                              ? isDark ? "bg-amber-500 text-stone-950 font-extrabold border-amber-400" : "bg-[#651317] text-white font-extrabold border-[#651317]"
                              : isDark ? "bg-white/5 hover:bg-white/10 text-stone-300 border-white/20" : "bg-white hover:bg-stone-50 text-[#651317] border-[#651317]"
                          )}
                        >
                          <Camera className="w-3.5 h-3.5" />
                          <span>{isHi ? "तस्वीर" : "Photo"}</span>
                        </button>

                        {/* Primary Name Layer button */}
                        <button
                          onClick={() => setEditingElement("name")}
                          className={cn(
                            "py-2 px-3 rounded-xl text-xs font-bold tracking-wide transition-all cursor-pointer select-none flex items-center gap-1.5 border border-[#651317] shrink-0",
                            editingElement === "name"
                              ? isDark ? "bg-amber-500 text-stone-950 font-extrabold border-amber-400" : "bg-[#651317] text-white font-extrabold border-[#651317]"
                              : isDark ? "bg-white/5 hover:bg-white/10 text-stone-300 border-white/20" : "bg-white hover:bg-stone-50 text-[#651317] border-[#651317]"
                          )}
                        >
                          <UserIcon className="w-3.5 h-3.5" />
                          <span>{isHi ? "नाम" : "Name"}</span>
                        </button>

                        {/* Custom Text Box buttons */}
                        {extraTextBoxes.map((box, idx) => (
                          <button
                            key={box.id}
                            onClick={() => setEditingElement(box.id)}
                            className={cn(
                              "py-2 px-3 rounded-xl text-xs font-bold tracking-wide transition-all cursor-pointer select-none flex items-center gap-1.5 border border-[#651317] shrink-0",
                              editingElement === box.id
                                ? isDark ? "bg-amber-500 text-stone-950 font-extrabold border-amber-400" : "bg-[#651317] text-white font-extrabold border-[#651317]"
                                : isDark ? "bg-white/5 hover:bg-white/10 text-stone-300 border-white/20" : "bg-white hover:bg-stone-50 text-[#651317] border-[#651317]"
                            )}
                          >
                            <Type className="w-3.5 h-3.5" />
                            <span>{box.text.substring(0, 10) || `${isHi ? 'पाठ' : 'Text'} ${idx + 1}`}</span>
                          </button>
                        ))}

                        {/* Add Textbox Button */}
                        <button
                          onClick={handleAddTextBox}
                          className={cn(
                            "py-2 px-3 rounded-xl text-xs font-bold tracking-wide transition-all cursor-pointer select-none flex items-center gap-1.5 border border-[#651317] shrink-0 bg-white text-[#651317] dark:bg-stone-900 dark:text-amber-300 hover:bg-stone-50 shadow-sm"
                          )}
                        >
                          <Plus className="w-3.5 h-3.5" />
                          <span>{isHi ? "नया टेक्स्ट" : "+ Text"}</span>
                        </button>
                      </div>

                      {/* 3. TAB LIST BAR (Simplified without Move tab) */}
                      <div className={cn("grid grid-cols-4 border-b", isDark ? "border-white/5 bg-[#0a0200]" : "border-[#EAD7C3] bg-[#FCF6E8]")}>
                        {[
                          { id: "shape", label: isHi ? "आकार" : "Shape", icon: <Circle className="w-4 h-4" /> },
                          { id: "resize", label: isHi ? "आकार बदलें" : "Resize", icon: <Maximize2 className="w-4 h-4" /> },
                          { id: "rotate", label: isHi ? "घुमाएं" : "Rotate", icon: <RotateCw className="w-4 h-4" /> },
                          { id: "reset", label: isHi ? "पुनः सेट" : "Reset", icon: <RotateCcw className="w-4 h-4" /> }
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
                                  } else if (editingElement === "name") {
                                    setPosterNameOffsetX(0);
                                    setPosterNameOffsetY(0);
                                    setPosterNameScale(1.0);
                                    setPosterNameRotation(0);
                                    setPosterNameShape("rounded-square");
                                  } else {
                                    handleUpdateCustomTextBox(editingElement, {
                                      offsetX: 0,
                                      offsetY: 0,
                                      scale: 1.0,
                                      rotation: 0,
                                      shape: "rounded-square"
                                    });
                                  }
                                } else {
                                  setPosterActiveTab(tab.id as any);
                                }
                              }}
                              className={cn(
                                "flex flex-col items-center justify-center gap-1 py-2.5 border-b-2 text-xs font-semibold tracking-wide transition-all cursor-pointer select-none",
                                isTabActive
                                  ? isDark ? "border-amber-500 bg-amber-500/10 text-amber-400 font-bold" : "border-[#651317] bg-[#651317]/10 text-[#651317] font-bold"
                                  : isDark ? "border-transparent text-stone-400 hover:text-stone-200" : "border-transparent text-[#786252] hover:text-[#3A2418]"
                              )}
                            >
                              {tab.icon}
                              <span>{tab.label}</span>
                            </button>
                          );
                        })}
                      </div>

                      {/* 4. ACTIVE PANEL CONTENT */}
                      <div className={cn("p-3.5 space-y-3.5", isDark ? "bg-[#0c0300]" : "bg-[#FCF6E8]")}>
                        
                        {/* Edit Primary Name Text */}
                        {editingElement === "name" && (
                          <div className={cn("space-y-1.5 text-left border-b pb-3", isDark ? "border-white/5" : "border-[#EAD7C3]")}>
                            <span className={cn("text-xs font-bold uppercase tracking-wider block", isDark ? "text-stone-400" : "text-[#786252]")}>
                              {isHi ? "नाम बदलें" : "Edit Name Text"}
                            </span>
                            <div className="relative">
                              <input
                                type="text"
                                maxLength={30}
                                placeholder={isHi ? "अपना नाम लिखें..." : "Type your name..."}
                                value={userName}
                                onChange={(e) => setUserName(e.target.value)}
                                className={cn(
                                  "w-full rounded-xl py-2 px-3 text-xs sm:text-sm focus:outline-none tracking-wide font-sans font-medium border transition-colors",
                                  isDark 
                                    ? "bg-black/45 border-amber-500/20 text-amber-100 placeholder:text-amber-200/40"
                                    : "bg-white border-[#651317] text-[#3A2418] placeholder:text-[#786252]/50 focus:border-[#651317]"
                                )}
                              />
                              <span className={cn("absolute right-3 top-1/2 -translate-y-1/2 text-xs font-sans font-bold", isDark ? "text-amber-500/80" : "text-[#786252]")}>
                                {userName.length}/30
                              </span>
                            </div>
                          </div>
                        )}

                        {/* Edit Custom Textbox Content & Delete Option */}
                        {editingElement.startsWith("text_") && (() => {
                          const currentBox = extraTextBoxes.find(b => b.id === editingElement);
                          if (!currentBox) return null;
                          return (
                            <div className={cn("space-y-2 text-left border-b pb-3", isDark ? "border-white/5" : "border-[#EAD7C3]")}>
                              <div className="flex items-center justify-between">
                                <span className={cn("text-xs font-bold uppercase tracking-wider block", isDark ? "text-stone-400" : "text-[#786252]")}>
                                  {isHi ? "पाठ बदलें" : "Edit Custom Text"}
                                </span>
                                <button
                                  onClick={() => handleRemoveTextBox(currentBox.id)}
                                  className="px-2.5 py-1 rounded-lg text-xs font-bold text-red-600 bg-red-100 dark:bg-red-950/40 dark:text-red-400 border border-red-300 dark:border-red-800/40 hover:bg-red-200 transition-colors flex items-center gap-1 cursor-pointer"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                  <span>{isHi ? "हटाएं" : "Remove"}</span>
                                </button>
                              </div>
                              <div className="relative">
                                <input
                                  type="text"
                                  maxLength={40}
                                  placeholder={isHi ? "नया पाठ लिखें..." : "Type text..."}
                                  value={currentBox.text}
                                  onChange={(e) => handleUpdateCustomTextBox(currentBox.id, { text: e.target.value })}
                                  className={cn(
                                    "w-full rounded-xl py-2 px-3 text-xs sm:text-sm focus:outline-none tracking-wide font-sans font-medium border transition-colors",
                                    isDark 
                                      ? "bg-black/45 border-amber-500/20 text-amber-100 placeholder:text-amber-200/40"
                                      : "bg-white border-[#651317] text-[#3A2418] placeholder:text-[#786252]/50 focus:border-[#651317]"
                                  )}
                                />
                                <span className={cn("absolute right-3 top-1/2 -translate-y-1/2 text-xs font-sans font-bold", isDark ? "text-amber-500/80" : "text-[#786252]")}>
                                  {currentBox.text.length}/40
                                </span>
                              </div>
                            </div>
                          );
                        })()}
                        
                        {/* shape panel */}
                        {posterActiveTab === "shape" && (
                          <div className="space-y-3">
                            {editingElement === "photo" ? (
                              <div className="space-y-2.5 text-left">
                                <div className="flex items-center justify-between">
                                  <span className={cn("text-xs font-bold uppercase tracking-wider block", isDark ? "text-stone-400" : "text-[#786252]")}>
                                    {isHi ? "तस्वीर का आकार एवं फ़्रेम" : "Photo Shape & Visibility"}
                                  </span>
                                  {/* Hide/Show Photo Frame Toggle */}
                                  <button
                                    onClick={() => setHidePhotoFrame(prev => !prev)}
                                    className={cn(
                                      "px-3 py-1.5 rounded-xl text-xs font-sans font-bold transition-all cursor-pointer border border-[#651317] flex items-center gap-1.5 select-none bg-white text-[#651317]",
                                      hidePhotoFrame
                                        ? isDark ? "bg-amber-500/20 border-amber-500 text-amber-300" : "bg-[#651317] border-[#651317] text-white shadow"
                                        : isDark ? "bg-white/5 border-white/10 text-stone-300 hover:bg-white/10" : "bg-white border-[#651317] text-[#651317] hover:bg-stone-50"
                                    )}
                                  >
                                    {hidePhotoFrame ? (
                                      <>
                                        <Eye className="w-3.5 h-3.5" />
                                        <span>{isHi ? "फ़्रेम दिखाएं" : "Show Frame"}</span>
                                      </>
                                    ) : (
                                      <>
                                        <EyeOff className="w-3.5 h-3.5" />
                                        <span>{isHi ? "फ़्रेम छिपाएं" : "Hide Frame"}</span>
                                      </>
                                    )}
                                  </button>
                                </div>
                                <div className="grid grid-cols-4 gap-2">
                                  {[
                                    { id: "circle", label: isHi ? "वृत्ताकार" : "Circle" },
                                    { id: "square", label: isHi ? "वर्गाकार" : "Square" },
                                    { id: "rounded-square", label: isHi ? "मुड़ा हुआ" : "Rounded" },
                                    { id: "oval", label: isHi ? "दीर्घवृत्ताकार" : "Oval" },
                                  ].map((s) => (
                                    <button
                                      key={s.id}
                                      onClick={() => { setPosterShape(s.id as any); setHidePhotoFrame(false); }}
                                      className={cn(
                                        "py-2.5 px-2 rounded-xl border border-[#651317] text-xs font-bold transition-all cursor-pointer select-none flex items-center justify-center text-center",
                                        posterShape === s.id && !hidePhotoFrame
                                          ? isDark ? "bg-amber-500/20 border-amber-500 text-amber-300 font-extrabold shadow-sm" : "bg-[#651317] border-[#651317] text-white font-extrabold shadow"
                                          : isDark ? "bg-transparent border-white/10 text-stone-400 hover:text-stone-200" : "bg-white border-[#651317] text-[#651317] hover:bg-stone-50"
                                      )}
                                    >
                                      <span>{s.label}</span>
                                    </button>
                                  ))}
                                </div>
                              </div>
                            ) : editingElement.startsWith("text_") ? (
                              <div className="space-y-2 text-left">
                                <span className={cn("text-xs font-bold uppercase tracking-wider block", isDark ? "text-stone-400" : "text-[#786252]")}>
                                  {isHi ? "पाठ पट्टी का आकार चुनें" : "Select Text Plate Shape"}
                                </span>
                                <div className="grid grid-cols-4 gap-2">
                                  {[
                                    { id: "circle", label: isHi ? "कैप्सूल" : "Capsule" },
                                    { id: "square", label: isHi ? "वर्गाकार" : "Square" },
                                    { id: "rounded-square", label: isHi ? "मुड़ा हुआ" : "Rounded" },
                                    { id: "oval", label: isHi ? "दीर्घवृत्ताकार" : "Oval" },
                                  ].map((s) => {
                                    const currentShape = extraTextBoxes.find(x => x.id === editingElement)?.shape || "rounded-square";
                                    return (
                                      <button
                                        key={s.id}
                                        onClick={() => handleUpdateCustomTextBox(editingElement, { shape: s.id as any })}
                                        className={cn(
                                          "py-2.5 px-2 rounded-xl border border-[#651317] text-xs font-bold transition-all cursor-pointer select-none flex items-center justify-center text-center",
                                          currentShape === s.id
                                            ? isDark ? "bg-amber-500/20 border-amber-500 text-amber-300 font-extrabold shadow-sm" : "bg-[#651317] border-[#651317] text-white font-extrabold shadow"
                                            : isDark ? "bg-transparent border-white/10 text-stone-400 hover:text-stone-200" : "bg-white border-[#651317] text-[#651317] hover:bg-stone-50"
                                        )}
                                      >
                                        <span>{s.label}</span>
                                      </button>
                                    );
                                  })}
                                </div>
                              </div>
                            ) : null}
                          </div>
                        )}

                        {/* move panel (fine nudge arrows) */}
                        {posterActiveTab === "move" && (
                          <div className="flex flex-col items-center gap-2">
                            <span className={cn("text-xs font-bold uppercase tracking-wider block text-center mb-0.5", isDark ? "text-stone-400" : "text-[#786252]")}>
                              {isHi 
                                ? `${editingElement === "photo" ? "तस्वीर" : editingElement === "name" ? "नाम" : "पाठ"} स्थान सूक्ष्म समायोजन` 
                                : `Fine-Tune ${editingElement === "photo" ? "Photo" : editingElement === "name" ? "Name" : "Text"} Position`}
                            </span>
                            <div className="flex flex-col items-center gap-1.5">
                              <button 
                                onClick={() => {
                                  if (editingElement === "photo") setPosterOffsetY(prev => prev - 2);
                                  else if (editingElement === "name") setPosterNameOffsetY(prev => prev - 2);
                                  else {
                                    const b = extraTextBoxes.find(x => x.id === editingElement);
                                    if (b) handleUpdateCustomTextBox(b.id, { offsetY: b.offsetY - 2 });
                                  }
                                }}
                                className={cn("w-10 h-8 rounded-lg flex items-center justify-center border border-[#651317] cursor-pointer active:scale-90 transition-all", isDark ? "bg-white/5 text-amber-400 border-white/10 hover:bg-white/10" : "bg-white text-[#651317] border-[#651317] hover:bg-white/80")}
                              >
                                <ChevronUp className="w-4 h-4" />
                              </button>
                              <div className="flex gap-3">
                                <button 
                                  onClick={() => {
                                    if (editingElement === "photo") setPosterOffsetX(prev => prev - 2);
                                    else if (editingElement === "name") setPosterNameOffsetX(prev => prev - 2);
                                    else {
                                      const b = extraTextBoxes.find(x => x.id === editingElement);
                                      if (b) handleUpdateCustomTextBox(b.id, { offsetX: b.offsetX - 2 });
                                    }
                                  }}
                                  className={cn("w-10 h-8 rounded-lg flex items-center justify-center border border-[#651317] cursor-pointer active:scale-90 transition-all", isDark ? "bg-white/5 text-amber-400 border-white/10 hover:bg-white/10" : "bg-white text-[#651317] border-[#651317] hover:bg-white/80")}
                                >
                                  <ChevronLeft className="w-4 h-4" />
                                </button>
                                <button 
                                  onClick={() => {
                                    if (editingElement === "photo") {
                                      setPosterOffsetX(0);
                                      setPosterOffsetY(0);
                                    } else if (editingElement === "name") {
                                      setPosterNameOffsetX(0);
                                      setPosterNameOffsetY(0);
                                    } else {
                                      const b = extraTextBoxes.find(x => x.id === editingElement);
                                      if (b) handleUpdateCustomTextBox(b.id, { offsetX: 0, offsetY: 0 });
                                    }
                                  }}
                                  className={cn("px-3 h-8 rounded-lg flex items-center justify-center text-xs font-bold uppercase tracking-wider border border-[#651317] cursor-pointer", isDark ? "bg-white/5 text-stone-300 border-white/10" : "bg-white text-[#543D2B] border-[#651317]")}
                                >
                                  {isHi ? "मध्य में" : "Center"}
                                </button>
                                <button 
                                  onClick={() => {
                                    if (editingElement === "photo") setPosterOffsetX(prev => prev + 2);
                                    else if (editingElement === "name") setPosterNameOffsetX(prev => prev + 2);
                                    else {
                                      const b = extraTextBoxes.find(x => x.id === editingElement);
                                      if (b) handleUpdateCustomTextBox(b.id, { offsetX: b.offsetX + 2 });
                                    }
                                  }}
                                  className={cn("w-10 h-8 rounded-lg flex items-center justify-center border border-[#651317] cursor-pointer active:scale-90 transition-all", isDark ? "bg-white/5 text-amber-400 border-white/10 hover:bg-white/10" : "bg-white text-[#651317] border-[#651317] hover:bg-white/80")}
                                >
                                  <ChevronRight className="w-4 h-4" />
                                </button>
                              </div>
                              <button 
                                onClick={() => {
                                  if (editingElement === "photo") setPosterOffsetY(prev => prev + 2);
                                  else if (editingElement === "name") setPosterNameOffsetY(prev => prev + 2);
                                  else {
                                    const b = extraTextBoxes.find(x => x.id === editingElement);
                                    if (b) handleUpdateCustomTextBox(b.id, { offsetY: b.offsetY + 2 });
                                  }
                                }}
                                className={cn("w-10 h-8 rounded-lg flex items-center justify-center border border-[#651317] cursor-pointer active:scale-90 transition-all", isDark ? "bg-white/5 text-amber-400 border-white/10 hover:bg-white/10" : "bg-white text-[#651317] border-[#651317] hover:bg-white/80")}
                              >
                                <ChevronDown className="w-4 h-4" />
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
                                  <div className={cn("flex justify-between text-xs font-bold uppercase tracking-wider", isDark ? "text-stone-400" : "text-[#786252]")}>
                                    <span>{isHi ? "फ़्रेम का आकार बदलें" : "Adjust Circle Size"}</span>
                                    <span className={cn("font-sans font-bold", isDark ? "text-amber-400" : "text-[#651317]")}>{posterFrameScale.toFixed(2)}x</span>
                                  </div>
                                  <div className="flex items-center gap-3">
                                    <button
                                      onClick={() => setPosterFrameScale(prev => Math.max(0.5, prev - 0.05))}
                                      className={cn("w-7 h-7 rounded-lg flex items-center justify-center text-sm font-bold cursor-pointer border border-[#651317]", isDark ? "bg-white/5 text-amber-300 border-white/10 hover:bg-white/10" : "bg-white text-[#651317] border-[#651317] hover:bg-white/80")}
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
                                      className={cn("flex-1 cursor-pointer h-1.5 rounded-lg appearance-none", isDark ? "accent-amber-500 bg-stone-900" : "accent-[#651317] bg-[#EAD7C3]")}
                                    />
                                    <button
                                      onClick={() => setPosterFrameScale(prev => Math.min(2.5, prev + 0.05))}
                                      className={cn("w-7 h-7 rounded-lg flex items-center justify-center text-sm font-bold cursor-pointer border border-[#651317]", isDark ? "bg-white/5 text-amber-300 border-white/10 hover:bg-white/10" : "bg-white text-[#651317] border-[#651317] hover:bg-white/80")}
                                    >
                                      +
                                    </button>
                                  </div>
                                </div>

                                <div className="space-y-1 text-left">
                                  <div className={cn("flex justify-between text-xs font-bold uppercase tracking-wider", isDark ? "text-stone-400" : "text-[#786252]")}>
                                    <span>{isHi ? "तस्वीर का ज़ूम" : "Zoom Photo"}</span>
                                    <span className={cn("font-sans font-bold", isDark ? "text-amber-400" : "text-[#651317]")}>{posterZoom.toFixed(2)}x</span>
                                  </div>
                                  <div className="flex items-center gap-3">
                                    <button
                                      onClick={() => setPosterZoom(prev => Math.max(0.8, prev - 0.05))}
                                      className={cn("w-7 h-7 rounded-lg flex items-center justify-center text-sm font-bold cursor-pointer border border-[#651317]", isDark ? "bg-white/5 text-amber-300 border-white/10 hover:bg-white/10" : "bg-white text-[#651317] border-[#651317] hover:bg-white/80")}
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
                                      className={cn("flex-1 cursor-pointer h-1.5 rounded-lg appearance-none", isDark ? "accent-amber-500 bg-stone-900" : "accent-[#651317] bg-[#EAD7C3]")}
                                    />
                                    <button
                                      onClick={() => setPosterZoom(prev => Math.min(3.0, prev + 0.05))}
                                      className={cn("w-7 h-7 rounded-lg flex items-center justify-center text-sm font-bold cursor-pointer border border-[#651317]", isDark ? "bg-white/5 text-amber-300 border-white/10 hover:bg-white/10" : "bg-white text-[#651317] border-[#651317] hover:bg-white/80")}
                                    >
                                      +
                                    </button>
                                  </div>
                                </div>
                              </>
                            ) : (
                              <div className="space-y-1 text-left">
                                <div className={cn("flex justify-between text-xs font-bold uppercase tracking-wider", isDark ? "text-stone-400" : "text-[#786252]")}>
                                  <span>{isHi ? "पाठ का आकार बदलें" : "Adjust Text Scale"}</span>
                                  <span className={cn("font-sans font-bold", isDark ? "text-amber-400" : "text-[#651317]")}>
                                    {(editingElement === "name" 
                                      ? posterNameScale 
                                      : (extraTextBoxes.find(x => x.id === editingElement)?.scale || 1.0)
                                    ).toFixed(2)}x
                                  </span>
                                </div>
                                <div className="flex items-center gap-3">
                                  <button
                                    onClick={() => {
                                      if (editingElement === "name") setPosterNameScale(prev => Math.max(0.5, prev - 0.05));
                                      else {
                                        const b = extraTextBoxes.find(x => x.id === editingElement);
                                        if (b) handleUpdateCustomTextBox(b.id, { scale: Math.max(0.5, b.scale - 0.05) });
                                      }
                                    }}
                                    className={cn("w-7 h-7 rounded-lg flex items-center justify-center text-sm font-bold cursor-pointer border border-[#651317]", isDark ? "bg-white/5 text-amber-300 border-white/10 hover:bg-white/10" : "bg-white text-[#651317] border-[#651317] hover:bg-white/80")}
                                  >
                                    -
                                  </button>
                                  <input
                                    type="range"
                                    min="0.5"
                                    max="2.5"
                                    step="0.05"
                                    value={editingElement === "name" 
                                      ? posterNameScale 
                                      : (extraTextBoxes.find(x => x.id === editingElement)?.scale || 1.0)}
                                    onChange={(e) => {
                                      const val = parseFloat(e.target.value);
                                      if (editingElement === "name") setPosterNameScale(val);
                                      else handleUpdateCustomTextBox(editingElement, { scale: val });
                                    }}
                                    className={cn("flex-1 cursor-pointer h-1.5 rounded-lg appearance-none", isDark ? "accent-amber-500 bg-stone-900" : "accent-[#651317] bg-[#EAD7C3]")}
                                  />
                                  <button
                                    onClick={() => {
                                      if (editingElement === "name") setPosterNameScale(prev => Math.min(2.5, prev + 0.05));
                                      else {
                                        const b = extraTextBoxes.find(x => x.id === editingElement);
                                        if (b) handleUpdateCustomTextBox(b.id, { scale: Math.min(2.5, b.scale + 0.05) });
                                      }
                                    }}
                                    className={cn("w-7 h-7 rounded-lg flex items-center justify-center text-sm font-bold cursor-pointer border border-[#651317]", isDark ? "bg-white/5 text-amber-300 border-white/10 hover:bg-white/10" : "bg-white text-[#651317] border-[#651317] hover:bg-white/80")}
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
                            <div className={cn("flex justify-between text-xs font-bold uppercase tracking-wider", isDark ? "text-stone-400" : "text-[#786252]")}>
                              <span>
                                {isHi ? `${editingElement === "photo" ? "तस्वीर" : "पाठ"} रोटेशन` : `${editingElement === "photo" ? "Frame" : "Text"} Rotation`}
                              </span>
                              <span className={cn("font-sans font-bold", isDark ? "text-amber-400" : "text-[#651317]")}>
                                {Math.round(((
                                  editingElement === "photo" 
                                    ? posterRotation 
                                    : editingElement === "name" 
                                    ? posterNameRotation 
                                    : (extraTextBoxes.find(x => x.id === editingElement)?.rotation || 0)
                                ) * 180) / Math.PI)}°
                              </span>
                            </div>
                            <div className="flex items-center gap-3">
                              <button
                                onClick={() => {
                                  if (editingElement === "photo") setPosterRotation(prev => prev - (5 * Math.PI) / 180);
                                  else if (editingElement === "name") setPosterNameRotation(prev => prev - (5 * Math.PI) / 180);
                                  else {
                                    const b = extraTextBoxes.find(x => x.id === editingElement);
                                    if (b) handleUpdateCustomTextBox(b.id, { rotation: b.rotation - (5 * Math.PI) / 180 });
                                  }
                                }}
                                className={cn("w-7 h-7 rounded-lg flex items-center justify-center text-xs font-bold cursor-pointer border border-[#651317]", isDark ? "bg-white/5 text-amber-300 border-white/10 hover:bg-white/10" : "bg-white text-[#651317] border-[#651317] hover:bg-white/80")}
                              >
                                <RotateCcw className="w-3.5 h-3.5" />
                              </button>
                              <input
                                type="range"
                                min={-Math.PI}
                                max={Math.PI}
                                step={0.05}
                                value={
                                  editingElement === "photo" 
                                    ? posterRotation 
                                    : editingElement === "name" 
                                    ? posterNameRotation 
                                    : (extraTextBoxes.find(x => x.id === editingElement)?.rotation || 0)
                                }
                                onChange={(e) => {
                                  const val = parseFloat(e.target.value);
                                  if (editingElement === "photo") setPosterRotation(val);
                                  else if (editingElement === "name") setPosterNameRotation(val);
                                  else handleUpdateCustomTextBox(editingElement, { rotation: val });
                                }}
                                className={cn("flex-1 cursor-pointer h-1.5 rounded-lg appearance-none", isDark ? "accent-amber-500 bg-stone-900" : "accent-[#651317] bg-[#EAD7C3]")}
                              />
                              <button
                                onClick={() => {
                                  if (editingElement === "photo") setPosterRotation(prev => prev + (5 * Math.PI) / 180);
                                  else if (editingElement === "name") setPosterNameRotation(prev => prev + (5 * Math.PI) / 180);
                                  else {
                                    const b = extraTextBoxes.find(x => x.id === editingElement);
                                    if (b) handleUpdateCustomTextBox(b.id, { rotation: b.rotation + (5 * Math.PI) / 180 });
                                  }
                                }}
                                className={cn("w-7 h-7 rounded-lg flex items-center justify-center text-xs font-bold cursor-pointer border border-[#651317]", isDark ? "bg-white/5 text-amber-300 border-white/10 hover:bg-white/10" : "bg-white text-[#651317] border-[#651317] hover:bg-white/80")}
                              >
                                <RotateCw className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </div>
                        )}

                        {/* Action buttons done / cancel */}
                        <div className={cn("flex gap-3 pt-3 pb-1 border-t", isDark ? "border-white/5" : "border-[#EAD7C3]")}>
                          <button
                            onClick={() => {
                              setIsEditingPhoto(false);
                            }}
                            className={cn(
                              "flex-1 py-3 rounded-xl border border-[#651317] text-xs sm:text-sm font-bold uppercase tracking-wider cursor-pointer active:scale-95 transition-all flex items-center justify-center gap-2 bg-white text-[#651317] dark:bg-stone-900 dark:text-stone-300 dark:border-white/10 hover:bg-stone-50 shadow-sm"
                            )}
                          >
                            <X className="w-4 h-4" />
                            <span>{isHi ? "रद्द करें" : "Cancel"}</span>
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
                            className={cn(
                              "flex-1 py-3 rounded-xl font-extrabold text-xs sm:text-sm uppercase tracking-wider cursor-pointer active:scale-95 transition-all shadow-md flex items-center justify-center gap-2 border border-[#651317]",
                              isDark
                                ? "bg-gradient-to-r from-amber-500 to-amber-600 text-stone-950 shadow-amber-500/10 border-amber-400"
                                : "bg-gradient-to-r from-[#651317] to-[#8B1E24] text-white shadow-red-900/20 border-[#651317]"
                            )}
                          >
                            <Check className="w-4 h-4" />
                            <span>{isHi ? "संपन्न" : "Done"}</span>
                          </button>
                        </div>

                      </div>
                    </div>
                  ) : (
                    <>
                      {/* Profile row + Edit Poster Button (Always visible on right) */}
                      <div className="flex items-center justify-between" style={{ padding: "8px 16px 6px" }}>
                        {/* Left: Avatar + name + edit */}
                        <button
                          onClick={() => setShowProfileEdit(true)}
                          className="flex items-center cursor-pointer min-w-0 max-w-[62%]"
                          style={{ gap: 10, transition: "opacity 0.2s", background: "none", border: "none", padding: 0 }}
                          onMouseEnter={e => (e.currentTarget.style.opacity="0.8")}
                          onMouseLeave={e => (e.currentTarget.style.opacity="1")}
                        >
                          {/* Avatar — 50px, 1px gold ring */}
                          <div style={{
                            width: 50, height: 50, borderRadius: "50%",
                            border: isDark ? "1px solid rgba(251,191,36,0.5)" : "1px solid #EAD7C3",
                            background: isDark ? "#1b0a05" : "#FFFDF8",
                            overflow: "hidden",
                            display: "flex", alignItems: "center", justifyContent: "center",
                            flexShrink: 0,
                          }}>
                            {userPhoto ? (
                              <img src={userPhoto} alt="devotee" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                            ) : (
                              <span style={{ fontSize: 18, fontFamily: "serif", color: isDark ? "rgba(251,191,36,0.55)" : "#651317" }}>ॐ</span>
                            )}
                          </div>
                          <div className="flex flex-col text-left min-w-0">
                            <span style={{ fontSize: 9, fontFamily: "sans-serif", fontWeight: 600, color: isDark ? "rgba(255,200,120,0.85)" : "#786252", lineHeight: 1, marginBottom: 3, letterSpacing: "0.04em" }}>
                              {isHi ? "श्रद्धालु" : "Devotee"}
                            </span>
                            <span className="truncate" style={{ fontSize: 15, fontFamily: "serif", fontWeight: 800, color: isDark ? "#fef3c7" : "#3A2418", lineHeight: 1.1, letterSpacing: isHi ? "normal" : "0.01em" }}>
                              {userName.trim() || (isHi ? "हरि भक्त" : "Devotee")}
                            </span>
                            <span style={{ fontSize: 9, fontFamily: "sans-serif", fontWeight: 600, color: isDark ? "rgba(251,191,36,0.85)" : "#651317", marginTop: 2 }}>
                              {isHi ? "प्रोफ़ाइल बदलें ›" : "Edit Profile ›"}
                            </span>
                          </div>
                        </button>

                        {/* Right: Poster Edit Button (Always accessible on the right side!) */}
                        <button
                          onClick={() => setIsEditingPhoto(true)}
                          className="flex items-center justify-center gap-1 px-3 py-2 cursor-pointer shadow-md hover:scale-[1.03] active:scale-95 transition-all rounded-xl text-xs font-sans font-bold select-none shrink-0"
                          style={{
                            background: isDark ? "rgba(251,191,36,0.12)" : "rgba(101,19,23,0.08)",
                            border: isDark ? "1px solid rgba(251,191,36,0.35)" : "1px solid rgba(101,19,23,0.25)",
                            color: isDark ? "#fbbf24" : "#651317",
                          }}
                        >
                          🎨 {isHi ? "पोस्टर एडिट" : "Edit Poster"}
                        </button>
                      </div>

                      {/* Hairline divider */}
                      <div style={{ height: "0.5px", background: isDark ? "rgba(255,255,255,0.06)" : "rgba(84,61,43,0.15)", margin: "0 16px 8px" }} />

                      {/* Action buttons row — equal height, 18px radius */}
                      <div className="flex items-stretch gap-2" style={{ padding: "0 16px 14px" }}>
                        {/* Download — outlined secondary */}
                        <button
                          onClick={handleDownloadPoster}
                          disabled={!compiledPosterUrl}
                          className="flex-1 flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-40"
                          style={{
                            height: 44,
                            borderRadius: 18,
                            background: isDark ? "transparent" : "#FFFDF8",
                            border: isDark ? "1.5px solid rgba(251,191,36,0.28)" : "1.5px solid #651317",
                            color: isDark ? "rgba(251,191,36,0.85)" : "#651317",
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
                            height: 44,
                            borderRadius: 18,
                            background: isDark ? "linear-gradient(135deg, #e8960a 0%, #c97c04 100%)" : "linear-gradient(135deg, #651317 0%, #8B1E24 100%)",
                            color: isDark ? "#1a0500" : "#FFFDF8",
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
              className="fixed inset-0 z-[155] bg-black/60 backdrop-blur-sm"
            />
            {/* Sheet — position above mobile bottom nav */}
            <motion.div
              initial={{ y: "100%", opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: "100%", opacity: 0 }}
              transition={{ type: "spring", damping: 30, stiffness: 260 }}
              className={cn(
                "fixed inset-x-0 bottom-[calc(4.2rem+env(safe-area-inset-bottom))] md:bottom-auto md:top-[20%] max-w-md mx-auto z-[160] pointer-events-auto rounded-t-[2.2rem] md:rounded-[2rem] p-6 shadow-2xl border flex flex-col gap-4",
                isDark
                  ? "bg-gradient-to-b from-[#120603] to-[#0a0200] border-amber-500/25 text-stone-200 shadow-black/80"
                  : "bg-[#FFFDF8] border-[#EAD7C3] text-[#3A2418] shadow-stone-900/20"
              )}
            >
              {/* Drag handle */}
              <div className="flex justify-center pt-1 pb-2">
                <div className={cn("w-10 h-1 rounded-full", isDark ? "bg-amber-500/25" : "bg-[#651317]/25")} />
              </div>

              {/* Header */}
              <div className="flex items-center justify-between">
                <span className={cn("font-serif text-base font-black uppercase tracking-wider", isDark ? "text-[#fef3c7]" : "text-[#651317]")}>
                  {isHi ? "प्रोफ़ाइल बदलें" : "Edit Profile"}
                </span>
                <button
                  onClick={() => setShowProfileEdit(false)}
                  className={cn("w-8 h-8 rounded-full border flex items-center justify-center transition-colors cursor-pointer", isDark ? "bg-amber-500/10 border-amber-500/25 text-amber-400" : "bg-[#651317]/10 border-[#651317]/20 text-[#651317]")}
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Name input */}
              <div>
                <label className={cn("text-[10px] font-sans font-black uppercase tracking-widest block mb-2", isDark ? "text-amber-400" : "text-[#786252]")}>
                  {isHi ? "आपका नाम" : "Your Name"}
                </label>
                <div className="relative">
                  <UserIcon className={cn("absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4", isDark ? "text-amber-500/70" : "text-[#651317]/70")} />
                  <input
                    type="text"
                    maxLength={30}
                    placeholder={isHi ? "अपना नाम दर्ज करें..." : "Enter your name..."}
                    value={userName}
                    onChange={(e) => setUserName(e.target.value)}
                    autoFocus
                    className={cn(
                      "w-full rounded-xl py-3 pl-11 pr-14 text-sm font-serif font-semibold focus:outline-none tracking-wide border transition-colors",
                      isDark
                        ? "bg-black/50 border-amber-500/25 text-[#fef3c7] placeholder:text-amber-200/50"
                        : "bg-white border-[#EAD7C3] text-[#3A2418] placeholder:text-[#786252]/50"
                    )}
                  />
                  <span className={cn("absolute right-4 top-1/2 -translate-y-1/2 text-[9px] font-sans font-bold", isDark ? "text-amber-500/80" : "text-[#786252]")}>
                    {userName.length}/30
                  </span>
                </div>
              </div>

              {/* Photo upload section */}
              <div>
                <label className={cn("text-[10px] font-sans font-black uppercase tracking-widest block mb-2", isDark ? "text-amber-400" : "text-[#786252]")}>
                  {isHi ? "श्रद्धालु चित्र" : "Devotee Photo"}
                </label>
                <div className={cn("flex items-center gap-3 rounded-2xl p-3 border", isDark ? "bg-black/40 border-amber-500/15" : "bg-[#FCF6E8] border-[#EAD7C3]")}>
                  <div className={cn("w-12 h-12 rounded-full border-2 overflow-hidden flex items-center justify-center shrink-0 shadow-md", isDark ? "border-amber-500/45 bg-[#1b0a05]" : "border-[#D4A437] bg-white")}>
                    {userPhoto ? <img src={userPhoto} alt="devotee" className="w-full h-full object-cover" /> : <span className={cn("font-serif text-lg", isDark ? "text-amber-400/70" : "text-[#651317]")}>ॐ</span>}
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
                      className={cn(
                        "flex items-center gap-1.5 px-3 py-2 rounded-xl text-[11px] font-sans font-black uppercase tracking-wider cursor-pointer transition-all active:scale-95 border",
                        isDark ? "bg-amber-500/12 border-amber-500/30 text-amber-300" : "bg-[#651317]/10 border-[#651317]/25 text-[#651317]"
                      )}
                    >
                      <Camera className="w-3.5 h-3.5" />
                      <span>{userPhoto ? (isHi ? "बदलें" : "Change") : (isHi ? "अपलोड करें" : "Upload Photo")}</span>
                    </button>
                    {userPhoto && (
                      <button
                        onClick={() => setUserPhoto(null)}
                        className="px-3 py-2 rounded-xl text-[11px] font-sans font-black uppercase cursor-pointer transition-all active:scale-95 border bg-red-500/10 border-red-500/30 text-red-500 hover:bg-red-500/20"
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

              {/* Action Buttons: Save & Delete */}
              <div className="space-y-2 pt-1">
                <button
                  onClick={() => {
                    if (!userName.trim()) {
                      toast.error(isHi ? "कृपया नाम दर्ज करें!" : "Please enter your name!");
                      return;
                    }
                    try {
                      localStorage.setItem("hk_profile_name", userName.trim());
                      if (userPhoto) {
                        localStorage.setItem("hk_profile_photo", userPhoto);
                      } else {
                        localStorage.removeItem("hk_profile_photo");
                      }
                    } catch (err) {}
                    setShowProfileEdit(false);
                    toast.success(isHi ? "प्रोफ़ाइल सहेज ली गई!" : "Profile saved successfully!");
                  }}
                  className={cn(
                    "w-full py-3.5 rounded-xl font-sans font-black text-xs uppercase tracking-wider cursor-pointer flex items-center justify-center gap-2 shadow-md active:scale-[0.98] transition-all",
                    isDark
                      ? "bg-gradient-to-r from-amber-500 to-amber-600 text-stone-950 shadow-amber-500/20"
                      : "bg-gradient-to-r from-[#651317] to-[#8B1E24] text-white shadow-red-900/20"
                  )}
                >
                  <Check className="w-4 h-4" />
                  <span>{isHi ? "सहेजें" : "Save Profile"}</span>
                </button>

                {/* Delete Profile Option */}
                {(userPhoto || (userName && userName !== "हरि भक्त")) && (
                  <button
                    type="button"
                    onClick={() => {
                      setUserPhoto(null);
                      setUserName("हरि भक्त");
                      try {
                        localStorage.removeItem("hk_profile_name");
                        localStorage.removeItem("hk_profile_photo");
                      } catch (err) {}
                      setShowProfileEdit(false);
                      toast.info(isHi ? "प्रोफ़ाइल हटा दी गई!" : "Profile deleted & reset!");
                    }}
                    className={cn(
                      "w-full py-2.5 rounded-xl font-sans font-bold text-xs flex items-center justify-center gap-1.5 transition-all cursor-pointer border active:scale-95",
                      isDark
                        ? "bg-red-500/10 border-red-500/30 text-red-400 hover:bg-red-500/20"
                        : "bg-red-50 border-red-200 text-red-700 hover:bg-red-100"
                    )}
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>{isHi ? "प्रोफ़ाइल / फ़ोटो हटाएं" : "Delete Profile & Photo"}</span>
                  </button>
                )}
              </div>
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


