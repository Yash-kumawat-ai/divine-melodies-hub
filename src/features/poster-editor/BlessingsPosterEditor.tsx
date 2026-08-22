import React, { useState, useEffect, useRef } from "react";
import { 
  X, Check, RotateCcw, RotateCw, ChevronUp, ChevronDown, 
  ChevronLeft, ChevronRight, Circle, Square, Move, Maximize2 
} from "lucide-react";
import { cn } from "@/lib/utils";
import type { BlessingsPosterEditorProps } from "@/pages/Blessings/types";

export function BlessingsPosterEditor({
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
      setOffsetX(startVal.ox + dx);
      setOffsetY(startVal.oy + dy);
    } else if (action === "move-photo") {
      setPhotoOffsetX(startVal.pox + dx);
      setPhotoOffsetY(startVal.poy + dy);
    } else if (action === "rot") {
      const angle = Math.atan2(clickY - photoY, clickX - photoX);
      setRotation(angle + Math.PI / 2);
    } else if (["tl", "tr", "bl", "br"].includes(action)) {
      const currentDist = Math.hypot(clickX - photoX, clickY - photoY);
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

          {/* Reset All Button */}
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

export default BlessingsPosterEditor;
