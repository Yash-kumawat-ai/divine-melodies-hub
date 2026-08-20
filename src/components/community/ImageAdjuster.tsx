/**
 * ImageAdjuster.tsx
 *
 * Professional image cropper and adjuster powered by react-easy-crop.
 * Features:
 * - Interactive pan / drag with finger or mouse
 * - Pinch zoom & smooth zoom slider
 * - Aspect ratio presets: Original/Free, Portrait (4:5), Square (1:1), Landscape (16:9)
 * - Canvas export using HTML5 canvas
 * - Clean, non-cluttered UI
 */

import React, { useState, useCallback, useRef } from "react";
import Cropper from "react-easy-crop";
import type { Area, Point } from "react-easy-crop";
import { 
  Image as ImageIcon, 
  ZoomIn, 
  ZoomOut, 
  Crop, 
  RotateCcw, 
  Check, 
  X, 
  Trash2, 
  Sparkles,
  Smartphone,
  Square,
  Monitor
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { getCroppedImg } from "@/lib/cropImage";
import { cn } from "@/lib/utils";

export interface ImageAdjusterProps {
  imageSrc: string | null;
  onImageChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onRemoveImage?: () => void;
  onCroppedImageReady?: (file: File, previewUrl: string) => void;
  isHi?: boolean;
  label?: string;
}

type AspectPreset = "original" | "portrait" | "square" | "landscape";

export function ImageAdjuster({
  imageSrc,
  onImageChange,
  onRemoveImage,
  onCroppedImageReady,
  isHi = false,
  label,
}: ImageAdjusterProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Raw uploaded image for cropping
  const [rawImage, setRawImage] = useState<string | null>(null);
  const [isCropModalOpen, setIsCropModalOpen] = useState(false);

  // react-easy-crop states
  const [crop, setCrop] = useState<Point>({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [aspectPreset, setAspectPreset] = useState<AspectPreset>("original");
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<Area | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  const getAspectValue = (): number | undefined => {
    switch (aspectPreset) {
      case "portrait":
        return 4 / 5;
      case "square":
        return 1;
      case "landscape":
        return 16 / 9;
      case "original":
      default:
        return undefined;
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        const result = reader.result as string;
        setRawImage(result);
        setCrop({ x: 0, y: 0 });
        setZoom(1);
        setAspectPreset("original");
        setIsCropModalOpen(true);
      };
      reader.readAsDataURL(file);
      onImageChange(e);
    }
  };

  const onCropComplete = useCallback((_croppedArea: Area, croppedAreaPixels: Area) => {
    setCroppedAreaPixels(croppedAreaPixels);
  }, []);

  const handleApplyCrop = async () => {
    if (!rawImage) return;

    try {
      setIsProcessing(true);
      if (croppedAreaPixels) {
        const { file, url } = await getCroppedImg(rawImage, croppedAreaPixels);
        onCroppedImageReady?.(file, url);
      }
      setIsCropModalOpen(false);
    } catch (err) {
      console.error("Failed to crop image:", err);
      setIsCropModalOpen(false);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="space-y-1.5 text-left min-w-0 w-full">
      {label && (
        <label className="text-xs font-bold text-[#651317] dark:text-amber-200 block leading-none">
          {label}
        </label>
      )}

      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileSelect}
        className="hidden"
      />

      {!imageSrc ? (
        /* Empty Upload Trigger */
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          className="w-full flex items-center justify-center gap-2 py-2.5 px-3 border border-dashed border-[#E8D8C4] dark:border-stone-700 bg-white/70 dark:bg-stone-900/60 hover:bg-[#FAF0E4]/60 dark:hover:bg-stone-800/80 rounded-xl text-[#651317] dark:text-amber-300 transition-all cursor-pointer shadow-2xs group active:scale-[0.99] h-10"
        >
          <ImageIcon className="w-4 h-4 text-[#651317] dark:text-amber-300 shrink-0 group-hover:scale-110 transition-transform" />
          <span className="text-xs font-bold">
            {isHi ? "चित्र जोड़ें व समायोजित करें" : "Upload & Adjust Devotional Photo"}
          </span>
        </button>
      ) : (
        /* Clean Image Preview with Action Bar */
        <div className="rounded-2xl border border-[#E8D8C4] dark:border-stone-800 bg-[#FAF6EE]/70 dark:bg-stone-900/60 p-2.5 space-y-2">
          <div className="relative w-full max-h-[220px] rounded-xl overflow-hidden bg-stone-950 flex items-center justify-center">
            <img
              src={imageSrc}
              alt="Post preview"
              className="max-h-[220px] w-auto max-w-full object-contain rounded-xl"
            />
          </div>

          <div className="flex items-center justify-between gap-2 pt-0.5">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => {
                if (rawImage) {
                  setIsCropModalOpen(true);
                } else {
                  fileInputRef.current?.click();
                }
              }}
              className="h-8 text-xs font-bold border-[#E8D8C4] text-[#651317] dark:text-amber-300 hover:bg-[#FAF0E4] rounded-xl flex items-center gap-1.5 cursor-pointer"
            >
              <Crop className="w-3.5 h-3.5" />
              <span>{isHi ? "समायोजित / क्रॉप करें" : "Adjust & Crop"}</span>
            </Button>

            <div className="flex items-center gap-1.5">
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => fileInputRef.current?.click()}
                className="h-8 text-xs text-[#8C7A6B] hover:text-[#651317] dark:hover:text-amber-300 font-semibold cursor-pointer"
              >
                {isHi ? "बदलें" : "Change"}
              </Button>

              {onRemoveImage && (
                <button
                  type="button"
                  onClick={() => {
                    setRawImage(null);
                    onRemoveImage();
                  }}
                  className="p-1.5 text-stone-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded-lg transition-colors cursor-pointer"
                  title={isHi ? "हटाएं" : "Remove"}
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ── INTERACTIVE CROPPER MODAL (react-easy-crop) ── */}
      <Dialog open={isCropModalOpen} onOpenChange={setIsCropModalOpen}>
        <DialogContent className="w-[calc(100vw-24px)] sm:w-full max-w-lg bg-[#FFFDF8] dark:bg-[#120F0B] border border-[#E8D8C4] dark:border-stone-800 text-stone-900 dark:text-stone-50 rounded-3xl p-5 sm:p-6 shadow-2xl z-[350]">
          <DialogHeader className="pb-2 border-b border-[#E8D8C4]/60 dark:border-stone-800 text-center">
            <DialogTitle className="font-display font-bold text-lg text-[#651317] dark:text-amber-100 text-center">
              {isHi ? "चित्र समायोजित व क्रॉप करें" : "Adjust & Crop Photo"}
            </DialogTitle>
            <DialogDescription className="text-center text-xs text-[#8C7A6B] dark:text-stone-400 mt-0.5">
              {isHi
                ? "हाथ से ड्रैग करके स्थान बदलें • पिंच या स्लाइडर से ज़ूम करें"
                : "Drag to reposition freely • Pinch or slide to zoom"}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-3.5 pt-2">
            {/* 1. Aspect Ratio Presets */}
            <div className="grid grid-cols-4 gap-1.5 p-1 bg-[#FAF6EE] dark:bg-stone-900/80 rounded-2xl border border-[#E8D8C4]/60 dark:border-stone-800">
              {[
                { id: "original", label: isHi ? "मूल (Auto)" : "Original", icon: Sparkles },
                { id: "portrait", label: isHi ? "पोर्ट्रेट (4:5)" : "Portrait 4:5", icon: Smartphone },
                { id: "square", label: isHi ? "स्क्वायर (1:1)" : "Square 1:1", icon: Square },
                { id: "landscape", label: isHi ? "लैंडस्केप (16:9)" : "Landscape 16:9", icon: Monitor },
              ].map((item) => {
                const active = aspectPreset === item.id;
                const Icon = item.icon;
                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => setAspectPreset(item.id as AspectPreset)}
                    className={cn(
                      "flex flex-col items-center justify-center py-2 px-1 rounded-xl transition-all text-center cursor-pointer select-none",
                      active
                        ? "bg-[#651317] text-white shadow-xs font-bold"
                        : "text-[#651317] dark:text-amber-200 hover:bg-[#FAF0E4] dark:hover:bg-stone-800 font-medium"
                    )}
                  >
                    <Icon className="w-4 h-4 mb-1 shrink-0" />
                    <span className="text-[10.5px] truncate w-full block leading-tight font-semibold">
                      {item.label}
                    </span>
                  </button>
                );
              })}
            </div>

            {/* 2. Interactive Cropper Canvas Container */}
            <div className="relative w-full h-[280px] sm:h-[320px] rounded-2xl overflow-hidden bg-black/90 shadow-inner">
              {rawImage && (
                <Cropper
                  image={rawImage}
                  crop={crop}
                  zoom={zoom}
                  aspect={getAspectValue()}
                  onCropChange={setCrop}
                  onZoomChange={setZoom}
                  onCropComplete={onCropComplete}
                  showGrid={true}
                  classes={{
                    containerClassName: "rounded-2xl",
                    cropAreaClassName: "rounded-xl border-2 border-amber-400/80 shadow-2xl",
                  }}
                />
              )}
            </div>

            {/* 3. Zoom Slider Controls */}
            <div className="flex items-center gap-3 bg-[#FAF6EE] dark:bg-stone-900/60 p-2.5 rounded-2xl border border-[#E8D8C4]/60 dark:border-stone-800">
              <button
                type="button"
                onClick={() => setZoom((z) => Math.max(1, z - 0.2))}
                className="p-1 text-[#651317] dark:text-amber-300 hover:bg-[#FAF0E4] rounded-lg transition-colors cursor-pointer"
                title="Zoom Out"
              >
                <ZoomOut className="w-4 h-4" />
              </button>

              <input
                type="range"
                min={1}
                max={3}
                step={0.05}
                value={zoom}
                onChange={(e) => setZoom(Number(e.target.value))}
                className="flex-1 accent-[#651317] cursor-pointer h-1.5 bg-stone-200 dark:bg-stone-700 rounded-lg"
              />

              <button
                type="button"
                onClick={() => setZoom((z) => Math.min(3, z + 0.2))}
                className="p-1 text-[#651317] dark:text-amber-300 hover:bg-[#FAF0E4] rounded-lg transition-colors cursor-pointer"
                title="Zoom In"
              >
                <ZoomIn className="w-4 h-4" />
              </button>

              <span className="text-xs font-bold text-[#651317] dark:text-amber-300 w-10 text-right tabular-nums">
                {zoom.toFixed(1)}x
              </span>
            </div>

            {/* 4. Action Buttons */}
            <div className="flex gap-2.5 pt-1">
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsCropModalOpen(false)}
                className="flex-1 h-10 rounded-full border-[#E8D8C4] dark:border-stone-700 text-[#651317] dark:text-stone-300 font-bold text-xs sm:text-sm hover:bg-[#FAF0E4] cursor-pointer"
              >
                {isHi ? "रद्द करें" : "Cancel"}
              </Button>
              <Button
                type="button"
                onClick={handleApplyCrop}
                disabled={isProcessing}
                className="flex-1 h-10 rounded-full bg-[#651317] hover:bg-[#4f0f12] text-white font-bold text-xs sm:text-sm shadow-xs transition-all active:scale-95 cursor-pointer"
              >
                {isProcessing
                  ? (isHi ? "सहेजा जा रहा है…" : "Applying…")
                  : (isHi ? "लागू करें" : "Apply & Save")}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
