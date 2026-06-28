import React, { useState, useRef, useEffect } from "react";
import { X, Check, ZoomIn, RotateCw, Move } from "lucide-react";

interface ImageCropModalProps {
  isOpen: boolean;
  imageSrc: string | null;
  onClose: () => void;
  onCropComplete: (croppedBase64: string) => void;
  isHi: boolean;
}

export const ImageCropModal: React.FC<ImageCropModalProps> = ({
  isOpen,
  imageSrc,
  onClose,
  onCropComplete,
  isHi,
}) => {
  const [zoom, setZoom] = useState(1);
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const [rotation, setRotation] = useState(0); // 0, 90, 180, 270
  const [isDragging, setIsDragging] = useState(false);
  const dragStart = useRef({ x: 0, y: 0 });
  const initialOffset = useRef({ x: 0, y: 0 });
  const containerRef = useRef<HTMLDivElement>(null);
  const imageRef = useRef<HTMLImageElement>(null);

  const [dims, setDims] = useState({
    renderedWidth: 0,
    renderedHeight: 0,
    initialScale: 1,
  });

  // Reset when image changes or modal opens
  useEffect(() => {
    if (isOpen) {
      setZoom(1);
      setOffset({ x: 0, y: 0 });
      setRotation(0);
    }
  }, [isOpen, imageSrc]);

  if (!isOpen || !imageSrc) return null;

  const handleImageLoad = (e: React.SyntheticEvent<HTMLImageElement>) => {
    const img = e.currentTarget;
    const naturalWidth = img.naturalWidth;
    const naturalHeight = img.naturalHeight;

    const containerWidth = 300;
    const containerHeight = 300;

    // Determine scale to cover the 300x300 container
    const scaleX = containerWidth / naturalWidth;
    const scaleY = containerHeight / naturalHeight;
    const initialScale = Math.max(scaleX, scaleY);

    setDims({
      renderedWidth: naturalWidth * initialScale,
      renderedHeight: naturalHeight * initialScale,
      initialScale,
    });
  };

  // Dragging logic
  const handleStart = (clientX: number, clientY: number) => {
    setIsDragging(true);
    dragStart.current = { x: clientX, y: clientY };
    initialOffset.current = { ...offset };
  };

  const handleMove = (clientX: number, clientY: number) => {
    if (!isDragging) return;
    const dx = clientX - dragStart.current.x;
    const dy = clientY - dragStart.current.y;

    // Apply rotation adjustments to drag offsets if rotated
    let adjustedDx = dx;
    let adjustedDy = dy;

    if (rotation === 90) {
      adjustedDx = dy;
      adjustedDy = -dx;
    } else if (rotation === 180) {
      adjustedDx = -dx;
      adjustedDy = -dy;
    } else if (rotation === 270) {
      adjustedDx = -dy;
      adjustedDy = dx;
    }

    // Limit offset to keep image in viewport (optional, but let's make it smooth)
    setOffset({
      x: initialOffset.current.x + adjustedDx,
      y: initialOffset.current.y + adjustedDy,
    });
  };

  const handleEnd = () => {
    setIsDragging(false);
  };

  // Canvas cropping logic
  const handleCrop = () => {
    if (!imageRef.current) return;

    const img = imageRef.current;
    const canvas = document.createElement("canvas");
    canvas.width = 400;
    canvas.height = 400;
    const ctx = canvas.getContext("2d");

    if (ctx) {
      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = "high";

      // Center canvas coordinates for translation/rotation
      ctx.translate(200, 200);
      if (rotation !== 0) {
        ctx.rotate((rotation * Math.PI) / 180);
      }

      // Map back from 400x400 canvas space to 300x300 viewport space
      ctx.scale(400 / 300, 400 / 300);

      // Draw relative to the centered 300x300 viewport
      const x = offset.x - (dims.renderedWidth * zoom) / 2;
      const y = offset.y - (dims.renderedHeight * zoom) / 2;
      const w = dims.renderedWidth * zoom;
      const h = dims.renderedHeight * zoom;

      ctx.drawImage(img, x, y, w, h);

      const croppedBase64 = canvas.toDataURL("image/jpeg", 0.85);
      onCropComplete(croppedBase64);
    }
  };

  const rotateClockwise = () => {
    setRotation((prev) => (prev + 90) % 360);
    setOffset({ x: 0, y: 0 }); // Reset offsets on rotate to keep centered
  };

  return (
    <div className="fixed inset-0 z-[200] flex flex-col items-center justify-center p-4 bg-stone-950/85 backdrop-blur-md transition-opacity duration-300">
      <div className="w-full max-w-md bg-stone-900 border border-stone-800 rounded-3xl overflow-hidden shadow-2xl flex flex-col">
        {/* Header */}
        <div className="px-5 py-4 border-b border-stone-800 flex items-center justify-between">
          <span className="font-display text-sm font-black text-amber-500 uppercase tracking-widest">
            {isHi ? "फ़ोटो काटें (क्रॉप)" : "Crop Profile Photo"}
          </span>
          <button
            onClick={onClose}
            className="text-stone-400 hover:text-white transition-colors cursor-pointer p-1 rounded-full hover:bg-stone-800"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Crop Viewport */}
        <div className="p-6 flex items-center justify-center bg-stone-950/45">
          <div
            ref={containerRef}
            className="w-[300px] h-[300px] relative overflow-hidden rounded-2xl border-2 border-amber-500/30 bg-stone-900 shadow-inner select-none touch-none cursor-grab active:cursor-grabbing"
            onMouseDown={(e) => handleStart(e.clientX, e.clientY)}
            onMouseMove={(e) => handleMove(e.clientX, e.clientY)}
            onMouseUp={handleEnd}
            onMouseLeave={handleEnd}
            onTouchStart={(e) => {
              const touch = e.touches[0];
              handleStart(touch.clientX, touch.clientY);
            }}
            onTouchMove={(e) => {
              const touch = e.touches[0];
              handleMove(touch.clientX, touch.clientY);
            }}
            onTouchEnd={handleEnd}
          >
            {/* Image to crop */}
            <img
              ref={imageRef}
              src={imageSrc}
              alt="Crop target"
              onLoad={handleImageLoad}
              style={{
                width: dims.renderedWidth || "auto",
                height: dims.renderedHeight || "auto",
                position: "absolute",
                left: "50%",
                top: "50%",
                transform: `translate(-50%, -50%) translate(${offset.x}px, ${offset.y}px) scale(${zoom}) rotate(${rotation}deg)`,
                transformOrigin: "center",
                maxWidth: "none",
                pointerEvents: "none",
              }}
            />

            {/* Circular Crop Guide Mask */}
            <div className="absolute inset-0 rounded-full border border-amber-500/40 pointer-events-none box-content shadow-[0_0_0_9999px_rgba(12,10,9,0.7)]" />

            {/* Drag helper indicator */}
            <div className="absolute bottom-3 left-1/2 -translate-x-1/2 bg-black/60 backdrop-blur-sm px-2.5 py-1 rounded-full text-[9px] font-sans font-bold text-amber-500/80 uppercase tracking-wider flex items-center gap-1 pointer-events-none">
              <Move className="w-3 h-3" />
              <span>{isHi ? "खिसकाएं" : "Drag to Position"}</span>
            </div>
          </div>
        </div>

        {/* Controls */}
        <div className="px-6 py-5 space-y-5 bg-stone-900/50">
          {/* Zoom Slider */}
          <div className="flex items-center gap-4">
            <span className="text-[10px] font-sans font-black text-stone-400 uppercase tracking-wider">
              {isHi ? "ज़ूम" : "Zoom"}
            </span>
            <input
              type="range"
              min="1"
              max="3"
              step="0.01"
              value={zoom}
              onChange={(e) => setZoom(parseFloat(e.target.value))}
              className="flex-1 h-1.5 bg-stone-800 rounded-lg appearance-none cursor-pointer accent-amber-500"
            />
            <ZoomIn className="w-4 h-4 text-amber-500" />
          </div>

          {/* Action Row */}
          <div className="flex items-center justify-between">
            {/* Rotation Button */}
            <button
              onClick={rotateClockwise}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-stone-800 bg-stone-900 text-stone-300 hover:text-white active:scale-95 transition-all text-xs font-sans font-bold cursor-pointer"
            >
              <RotateCw className="w-3.5 h-3.5" />
              <span>{isHi ? "घुमाएं" : "Rotate"}</span>
            </button>

            {/* Confirm buttons */}
            <div className="flex items-center gap-3">
              <button
                onClick={onClose}
                className="px-4 py-2 text-stone-400 hover:text-white transition-colors text-xs font-sans font-bold cursor-pointer"
              >
                {isHi ? "रद्द करें" : "Cancel"}
              </button>
              <button
                onClick={handleCrop}
                className="flex items-center gap-1.5 px-5 py-2.5 rounded-xl bg-amber-500 text-stone-950 font-sans font-black text-xs uppercase tracking-wider active:scale-95 transition-all shadow-md cursor-pointer hover:bg-amber-600"
              >
                <Check className="w-4 h-4" />
                <span>{isHi ? "क्रॉप करें" : "Crop & Done"}</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
