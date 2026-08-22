import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Sparkles, Upload, RotateCcw, Download, Info, Image as ImageIcon } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useLanguage } from "@/hooks/useLanguage";
import { useBhajanModalOpen } from "@/hooks/useBhajanModalOpen";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

// Import Poster Backgrounds from images folder
import template1Img from "@/pages/images/ChatGPT Image Jun 27, 2026, 06_26_05 PM.png";
import template2Img from "@/pages/images/ChatGPT Image Jun 27, 2026, 06_47_29 PM.png";
import template3Img from "@/pages/images/ChatGPT Image Jun 27, 2026, 06_47_29 PM11.png";
import template4Img from "@/pages/images/ChatGPT Image Jun 27, 2026, 10_00_03 PM.png";

// Interface Definitions
export interface PosterTemplateConfig {
  id: string;
  title: string;
  titleHindi: string;
  imageUrl: string;
  photo: {
    x: number;          // center X as percentage (0.0 to 1.0)
    y: number;          // center Y as percentage (0.0 to 1.0)
    width: number;      // width as percentage of canvas width
    height: number;     // height as percentage of canvas width (keeps aspect ratio)
    allowShapeChange: boolean;
    defaultShape: "circle" | "square" | "rounded-square" | "oval";
  };
}

// Banners/Poster Templates Configuration Data
const POSTER_TEMPLATES: PosterTemplateConfig[] = [
  {
    id: "template-1",
    title: "Khatu Shyam Devotional",
    titleHindi: "जय श्री श्याम संदेश",
    imageUrl: template1Img,
    photo: {
      x: 0.50,
      y: 0.81,
      width: 0.22,
      height: 0.22,
      allowShapeChange: false,
      defaultShape: "circle"
    }
  },
  {
    id: "template-2",
    title: "Hanumanji Blessings",
    titleHindi: "हनुमान जी आशीर्वाद",
    imageUrl: template2Img,
    photo: {
      x: 0.50,
      y: 0.78,
      width: 0.24,
      height: 0.24,
      allowShapeChange: true,
      defaultShape: "circle"
    }
  },
  {
    id: "template-3",
    title: "Radhe Krishna Greeting",
    titleHindi: "राधे कृष्णा बधाई",
    imageUrl: template3Img,
    photo: {
      x: 0.50,
      y: 0.70,
      width: 0.20,
      height: 0.20,
      allowShapeChange: true,
      defaultShape: "rounded-square"
    }
  },
  {
    id: "template-4",
    title: "Spiritual Meditation",
    titleHindi: "दिव्य ध्यान पत्र",
    imageUrl: template4Img,
    photo: {
      x: 0.50,
      y: 0.70,
      width: 0.20,
      height: 0.20,
      allowShapeChange: true,
      defaultShape: "circle"
    }
  }
];

type Shape = "circle" | "square" | "rounded-square" | "oval";
type DragMode = "photo" | "frame" | "name";

export default function PosterMakerPage() {
  const navigate = useNavigate();
  const { language } = useLanguage();
  const { setBhajanModalOpen } = useBhajanModalOpen();
  const isHi = language === "hi";

  // Editor States
  const [selectedTemplate, setSelectedTemplate] = useState<PosterTemplateConfig | null>(null);

  useEffect(() => {
    if (selectedTemplate) {
      setBhajanModalOpen(true);
      return () => setBhajanModalOpen(false);
    }
  }, [selectedTemplate, setBhajanModalOpen]);
  const [userImageSrc, setUserImageSrc] = useState<string | null>(null);
  const [zoom, setZoom] = useState<number>(1.0);
  const [offsetX, setOffsetX] = useState<number>(0);
  const [offsetY, setOffsetY] = useState<number>(0);
  const [shape, setShape] = useState<Shape>("circle");

  // Dynamic Layout adjustment states (percentage based coordinates)
  const [frameXPercent, setFrameXPercent] = useState<number>(0.5);
  const [frameYPercent, setFrameYPercent] = useState<number>(0.8);
  const [frameWidthPercent, setFrameWidthPercent] = useState<number>(0.22);
  const [nameXPercent, setNameXPercent] = useState<number>(0.5);
  const [nameYPercent, setNameYPercent] = useState<number>(0.92);
  const [devoteeName, setDevoteeName] = useState<string>("");
  const [showNameCard, setShowNameCard] = useState<boolean>(false);
  const [dragMode, setDragMode] = useState<DragMode>("photo");

  // DOM Refs
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const isPointerDown = useRef(false);
  const dragStartX = useRef(0);
  const dragStartY = useRef(0);

  // Loaded Image Elements for Canvas Painting
  const [templateImgElement, setTemplateImgElement] = useState<HTMLImageElement | null>(null);
  const [userImgElement, setUserImgElement] = useState<HTMLImageElement | null>(null);
  const [loading, setLoading] = useState(false);

  // Translation Dictionaries
  const t = {
    back: isHi ? "पीछे जाएं" : "Go Back",
    title: isHi ? "राघवम् पोस्टर मेकर" : "Raghavam Poster Maker",
    subtitle: isHi 
      ? "अपने सुंदर भक्ति पोस्टरों को निजीकृत करें और साझा करें"
      : "Personalize and share beautiful devotional festival posters",
    selectTitle: isHi ? "1. एक पोस्टर चुनें" : "1. Select a Template",
    editTitle: isHi ? "2. अपनी फोटो को समायोजित करें" : "2. Adjust Your Photo",
    uploadPlaceholder: isHi 
      ? "फोटो अपलोड करें (JPG, PNG, WebP)"
      : "Upload Photo (JPG, PNG, WebP)",
    dragHelp: isHi
      ? "ड्रैग मोड चुनें और खिसकाने के लिए सीधे कैनवास पर ड्रैग करें।"
      : "Select Drag Mode and drag directly on canvas to adjust.",
    zoomLabel: isHi ? "ज़ूम (Zoom)" : "Zoom",
    shapeLabel: isHi ? "तस्वीर का आकार" : "Photo Frame Shape",
    btnReset: isHi ? "पुनः सेट करें" : "Reset Photo",
    btnDownload: isHi ? "एचडी डाउनलोड करें" : "Download HD Poster",
    demoBtn: isHi ? "डेमो फोटो का उपयोग करें" : "Use Demo Photo",
    shapeCircle: isHi ? "वृत्ताकार" : "Circle",
    shapeSquare: isHi ? "वर्गाकार" : "Square",
    shapeRounded: isHi ? "मुड़ा वर्गाकार" : "Rounded",
    shapeOval: isHi ? "दीर्घवृत्ताकार" : "Oval",
  };

  // Sync shape state when template changes
  useEffect(() => {
    if (selectedTemplate) {
      setShape(selectedTemplate.photo.defaultShape);
      setZoom(1.0);
      setOffsetX(0);
      setOffsetY(0);
      setDevoteeName("");
      setShowNameCard(false);
      setDragMode("photo");
      
      // Initialize dynamic coordinates from config
      setFrameXPercent(selectedTemplate.photo.x);
      setFrameYPercent(selectedTemplate.photo.y);
      setFrameWidthPercent(selectedTemplate.photo.width);
      
      setNameXPercent(selectedTemplate.photo.x);
      setNameYPercent(selectedTemplate.photo.y + 0.12);
    }
  }, [selectedTemplate]);

  // Load Template image in memory
  useEffect(() => {
    if (!selectedTemplate) {
      setTemplateImgElement(null);
      return;
    }
    setLoading(true);
    let isMounted = true;
    const img = new window.Image();
    img.src = selectedTemplate.imageUrl;
    img.onload = () => {
      if (isMounted) {
        setTemplateImgElement(img);
        setLoading(false);
      }
    };
    img.onerror = () => {
      if (isMounted) {
        toast.error("Failed to load poster background.");
        setLoading(false);
      }
    };
    return () => {
      isMounted = false;
    };
  }, [selectedTemplate]);

  // Load User portrait photo in memory
  useEffect(() => {
    if (!userImageSrc) {
      setUserImgElement(null);
      return;
    }
    let isMounted = true;
    const img = new window.Image();
    img.src = userImageSrc;
    img.onload = () => {
      if (isMounted) {
        setUserImgElement(img);
      }
    };
    img.onerror = () => {
      if (isMounted) {
        toast.error("Failed to parse the uploaded image.");
      }
    };
    return () => {
      isMounted = false;
    };
  }, [userImageSrc]);

  // Unified Canvas Paint Loop
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !templateImgElement) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const W = templateImgElement.naturalWidth || 1024;
    const H = templateImgElement.naturalHeight || 1346;
    
    // Set fixed high resolution dimensions
    canvas.width = W;
    canvas.height = H;

    // Enable high-quality anti-aliasing
    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = "high";

    // 1. Draw original template background
    ctx.drawImage(templateImgElement, 0, 0, W, H);

    // 2. Draw user photo if present
    const CX = frameXPercent * W;
    const CY = frameYPercent * H;
    const PW = frameWidthPercent * W;
    const PH = frameWidthPercent * W; // Keep width relative scale to stay square

    if (userImgElement) {
      ctx.save();

      // Establish the mask clip path
      ctx.beginPath();
      if (shape === "circle") {
        ctx.arc(CX, CY, PW / 2, 0, Math.PI * 2);
      } else if (shape === "square") {
        ctx.rect(CX - PW / 2, CY - PH / 2, PW, PH);
      } else if (shape === "rounded-square") {
        const radius = Math.min(PW, PH) * 0.15;
        if (typeof ctx.roundRect === "function") {
          ctx.roundRect(CX - PW / 2, CY - PH / 2, PW, PH, radius);
        } else {
          ctx.rect(CX - PW / 2, CY - PH / 2, PW, PH);
        }
      } else if (shape === "oval") {
        ctx.ellipse(CX, CY, PW / 2, PH / 1.5, 0, 0, Math.PI * 2);
      }
      ctx.closePath();
      ctx.clip();

      // Fit photo into the bounding crop box with cover math
      const avatarRatio = userImgElement.naturalWidth / userImgElement.naturalHeight;
      const targetW = shape === "oval" ? PW : PW;
      const targetH = shape === "oval" ? PH * 1.33 : PH;

      const baseScale = Math.max(targetW / userImgElement.naturalWidth, targetH / userImgElement.naturalHeight);
      const DW = userImgElement.naturalWidth * baseScale * zoom;
      const DH = userImgElement.naturalHeight * baseScale * zoom;

      // Centered position + user drag offsets
      const drawX = CX - DW / 2 + offsetX;
      const drawY = CY - DH / 2 + offsetY;

      ctx.drawImage(userImgElement, drawX, drawY, DW, DH);
      ctx.restore();

      // 3. Draw a premium gold border around the frame
      ctx.strokeStyle = "rgba(251, 191, 36, 0.9)";
      ctx.lineWidth = Math.min(W, H) * 0.005; // scalable border thickness
      ctx.beginPath();
      if (shape === "circle") {
        ctx.arc(CX, CY, PW / 2, 0, Math.PI * 2);
      } else if (shape === "square") {
        ctx.rect(CX - PW / 2, CY - PH / 2, PW, PH);
      } else if (shape === "rounded-square") {
        const radius = Math.min(PW, PH) * 0.15;
        if (typeof ctx.roundRect === "function") {
          ctx.roundRect(CX - PW / 2, CY - PH / 2, PW, PH, radius);
        } else {
          ctx.rect(CX - PW / 2, CY - PH / 2, PW, PH);
        }
      } else if (shape === "oval") {
        ctx.ellipse(CX, CY, PW / 2, PH / 1.5, 0, 0, Math.PI * 2);
      }
      ctx.closePath();
      ctx.stroke();
    } else {
      // 4. Draw frame indicator guide when empty
      ctx.save();
      ctx.fillStyle = "rgba(0, 0, 0, 0.4)";
      ctx.strokeStyle = "rgba(251, 191, 36, 0.45)";
      ctx.lineWidth = 4;
      ctx.setLineDash([12, 8]);
      ctx.beginPath();
      if (shape === "circle") {
        ctx.arc(CX, CY, PW / 2, 0, Math.PI * 2);
      } else if (shape === "square") {
        ctx.rect(CX - PW / 2, CY - PH / 2, PW, PH);
      } else if (shape === "rounded-square") {
        const radius = Math.min(PW, PH) * 0.15;
        if (typeof ctx.roundRect === "function") {
          ctx.roundRect(CX - PW / 2, CY - PH / 2, PW, PH, radius);
        } else {
          ctx.rect(CX - PW / 2, CY - PH / 2, PW, PH);
        }
      } else if (shape === "oval") {
        ctx.ellipse(CX, CY, PW / 2, PH / 1.5, 0, 0, Math.PI * 2);
      }
      ctx.closePath();
      ctx.fill();
      ctx.stroke();
      ctx.restore();
    }

    // 5. Draw Devotee Name Card if active
    if (showNameCard && devoteeName.trim()) {
      ctx.save();
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";

      const displayName = devoteeName.trim();
      const nameX = nameXPercent * W;
      const nameY = nameYPercent * H;

      // Premium Devanagari responsive font scaling
      const fontSize = Math.min(W, H) * 0.035;
      ctx.font = `bold ${fontSize}px 'Tiro Devanagari Hindi', 'Noto Sans Devanagari', 'Inter', sans-serif`;

      const nameWidth = ctx.measureText(displayName).width;
      const bannerW = nameWidth + Math.min(W, H) * 0.06;
      const bannerH = fontSize + Math.min(W, H) * 0.03;
      const bannerX = nameX - bannerW / 2;
      const bannerY = nameY - bannerH / 2;

      // Clear shadow for banner border
      ctx.shadowBlur = 0;
      ctx.shadowOffsetX = 0;
      ctx.shadowOffsetY = 0;

      // Dark glassmorphic container box
      ctx.fillStyle = "rgba(12, 5, 2, 0.85)";
      ctx.strokeStyle = "rgba(251, 191, 36, 0.6)";
      ctx.lineWidth = Math.min(W, H) * 0.003;
      ctx.beginPath();
      if (typeof ctx.roundRect === "function") {
        ctx.roundRect(bannerX, bannerY, bannerW, bannerH, 16);
      } else {
        ctx.rect(bannerX, bannerY, bannerW, bannerH);
      }
      ctx.fill();
      ctx.stroke();

      // Shadow overlay under text for high readability
      ctx.shadowColor = "rgba(0, 0, 0, 0.9)";
      ctx.shadowBlur = 6;
      ctx.shadowOffsetX = 0;
      ctx.shadowOffsetY = 2;

      // Gold fill devotee text
      ctx.fillStyle = "#fbbf24";
      ctx.fillText(displayName, nameX, nameY);

      // Watermark footer text
      ctx.textBaseline = "alphabetic";
      ctx.shadowBlur = 0;
      ctx.shadowOffsetY = 0;
      ctx.fillStyle = "rgba(255, 255, 255, 0.5)";
      ctx.font = `bold ${Math.min(W, H) * 0.02}px 'Inter', sans-serif`;
      ctx.fillText("✨ Created with Raghavam", W / 2, H - 45);

      ctx.restore();
    }
  }, [
    templateImgElement, 
    userImgElement, 
    selectedTemplate, 
    zoom, 
    offsetX, 
    offsetY, 
    shape,
    frameXPercent,
    frameYPercent,
    frameWidthPercent,
    nameXPercent,
    nameYPercent,
    devoteeName,
    showNameCard
  ]);

  // Pointer event capture to drag-move targets based on active mode
  const handlePointerDown = (e: React.PointerEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    // Check hit target to dynamically adjust pointer mode
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    const clickX = (e.clientX - rect.left) * scaleX;
    const clickY = (e.clientY - rect.top) * scaleY;

    const FX = frameXPercent * canvas.width;
    const FY = frameYPercent * canvas.height;
    const NX = nameXPercent * canvas.width;
    const NY = nameYPercent * canvas.height;

    const distToFrame = Math.sqrt(Math.pow(clickX - FX, 2) + Math.pow(clickY - FY, 2));
    const distToName = Math.sqrt(Math.pow(clickX - NX, 2) + Math.pow(clickY - NY, 2));

    // Auto-select mode if user clicks on specific parts of canvas
    if (showNameCard && devoteeName.trim() && distToName < 90) {
      setDragMode("name");
    } else if (distToFrame < (frameWidthPercent * canvas.width) / 2) {
      // If pointer is inside photo frame, default to pan if image loaded
      if (userImgElement && dragMode !== "frame") {
        setDragMode("photo");
      } else {
        setDragMode("frame");
      }
    }

    canvas.setPointerCapture(e.pointerId);
    isPointerDown.current = true;
    dragStartX.current = e.clientX;
    dragStartY.current = e.clientY;
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (!isPointerDown.current || !canvasRef.current) return;
    const canvas = canvasRef.current;
    
    // Scale pointer movement delta relative to canvas high-res viewport scale
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;

    const deltaX = (e.clientX - dragStartX.current) * scaleX;
    const deltaY = (e.clientY - dragStartY.current) * scaleY;

    dragStartX.current = e.clientX;
    dragStartY.current = e.clientY;

    if (dragMode === "photo") {
      setOffsetX((prev) => prev + deltaX);
      setOffsetY((prev) => prev + deltaY);
    } else if (dragMode === "frame") {
      // Reposition whole photo circle frame
      setFrameXPercent((prev) => Math.max(0.05, Math.min(0.95, prev + deltaX / canvas.width)));
      setFrameYPercent((prev) => Math.max(0.05, Math.min(0.95, prev + deltaY / canvas.height)));
    } else if (dragMode === "name") {
      // Reposition name card banner
      setNameXPercent((prev) => Math.max(0.05, Math.min(0.95, prev + deltaX / canvas.width)));
      setNameYPercent((prev) => Math.max(0.05, Math.min(0.95, prev + deltaY / canvas.height)));
    }
  };

  const handlePointerUp = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (!isPointerDown.current) return;
    isPointerDown.current = false;
    if (canvasRef.current) {
      canvasRef.current.releasePointerCapture(e.pointerId);
    }
  };

  // Upload/File input change callback
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      toast.error("Please upload a valid image file.");
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      if (event.target?.result) {
        setUserImageSrc(event.target.result as string);
        setZoom(1.0);
        setOffsetX(0);
        setOffsetY(0);
        setDragMode("photo"); // Default to photo panning after upload
        toast.success(isHi ? "तस्वीर अपलोड हो गई!" : "Photo uploaded successfully!", { duration: 2000 });
      }
    };
    reader.readAsDataURL(file);
  };

  // Trigger file dialog
  const triggerUpload = () => {
    fileInputRef.current?.click();
  };

  // Load Demo photo instantly
  const handleLoadDemo = () => {
    setUserImageSrc(template1Img); // Loads ChatGPT Image Jun 27, 2026, 06_26_05 PM.png as user photo
    setZoom(1.15);
    setOffsetX(0);
    setOffsetY(-35); // Slight offset default fit
    setDragMode("photo");
    toast.info(isHi ? "डेमो फोटो लोड की गई" : "Demo photo loaded for testing", { duration: 2000 });
  };

  // Clear/Reset adjustments
  const handleReset = () => {
    setZoom(1.0);
    setOffsetX(0);
    setOffsetY(0);
    setDragMode("photo");
    if (selectedTemplate) {
      setShape(selectedTemplate.photo.defaultShape);
      setFrameXPercent(selectedTemplate.photo.x);
      setFrameYPercent(selectedTemplate.photo.y);
      setFrameWidthPercent(selectedTemplate.photo.width);
      
      setNameXPercent(selectedTemplate.photo.x);
      setNameYPercent(selectedTemplate.photo.y + 0.12);
    }
    toast.success("Adjustments reset.", { duration: 2000 });
  };

  // Export & Download
  const handleDownload = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    try {
      const dataUrl = canvas.toDataURL("image/png");
      const link = document.createElement("a");
      link.download = `${selectedTemplate!.title.replace(/\s+/g, "_")}_Personalized.png`;
      link.href = dataUrl;
      link.click();
      toast.success(isHi ? "डाउनलोड शुरू हो गया!" : "Download started!", { duration: 2500 });
    } catch (e) {
      console.error(e);
      toast.error("Failed to generate download. Please try uploading another image.");
    }
  };

  return (
    <div className="min-h-screen bg-background py-10 px-4 md:px-8 text-foreground">
      <div className="container mx-auto max-w-6xl space-y-6">
        
        {/* Top bar Back Button */}
        <div>
          <button
            onClick={() => {
              if (selectedTemplate) {
                setSelectedTemplate(null);
                setUserImageSrc(null);
              } else {
                navigate(-1);
              }
            }}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-card border border-border hover:bg-muted/50 transition-colors text-xs font-semibold uppercase tracking-wider text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>{t.back}</span>
          </button>
        </div>

        {/* Header Description */}
        <div className="flex flex-col md:flex-row justify-between items-center md:items-start border-b border-border/40 pb-6 gap-4">
          <div className="text-center md:text-left space-y-2">
            <h1 className="font-display text-3xl md:text-4xl font-extrabold tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-amber-200 via-amber-100 to-amber-300">
              {t.title}
            </h1>
            <p className="text-sm text-muted-foreground leading-relaxed">
              {t.subtitle}
            </p>
          </div>
          <div className="flex items-center gap-2 bg-amber-500/10 border border-amber-500/20 px-3.5 py-1.5 rounded-full text-amber-500 text-[10px] font-black uppercase tracking-widest">
            <Sparkles className="w-3.5 h-3.5" />
            <span>DEVOTIONAL TEMPLATES</span>
          </div>
        </div>

        <AnimatePresence mode="wait">
          {!selectedTemplate ? (
            /* STEP 1: Select Poster Template Grid */
            <motion.div
              key="select-step"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.4 }}
              className="space-y-6"
            >
              <h2 className="font-display text-lg md:text-xl font-bold border-l-2 border-brand-saffron pl-3 text-left">
                {t.selectTitle}
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4 md:gap-6">
                {POSTER_TEMPLATES.map((item) => (
                  <div
                    key={item.id}
                    onClick={() => setSelectedTemplate(item)}
                    className="group relative cursor-pointer overflow-hidden rounded-[24px] border border-border/40 bg-card/40 transition-all duration-300 hover:border-brand-saffron/30 hover:shadow-xl hover:shadow-black/25 flex flex-col"
                  >
                    <div className="aspect-[3/4] relative w-full overflow-hidden bg-stone-950/20 border-b border-border/10">
                      <img
                        src={item.imageUrl}
                        alt={item.title}
                        loading="lazy"
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                    </div>
                    <div className="p-4 bg-card/60 backdrop-blur-xs flex-1 flex justify-between items-center">
                      <div className="text-left">
                        <p className="text-[10px] font-black text-brand-saffron uppercase tracking-widest">Greeting Card</p>
                        <h3 className="font-display text-sm font-extrabold tracking-wide mt-0.5 group-hover:text-brand-saffron transition-colors">
                          {isHi ? item.titleHindi : item.title}
                        </h3>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          ) : (
            /* STEP 2: Adjustment & Customization Editor */
            <motion.div
              key="edit-step"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.4 }}
              className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start"
            >
              
              {/* Canvas Preview Column */}
              <div className="lg:col-span-7 flex flex-col items-center justify-center bg-card/20 border border-border/20 rounded-[32px] p-6 shadow-2xl">
                <h2 className="font-display text-sm font-bold tracking-widest text-muted-foreground uppercase mb-4 self-start pl-2">
                  Poster Preview
                </h2>
                
                {/* Responsive scaling viewport for Canvas */}
                <div 
                  className="w-full relative rounded-2xl overflow-hidden shadow-2xl border border-border/10 max-w-[380px] md:max-w-[420px]"
                  style={{ touchAction: "none" }}
                >
                  {loading && (
                    <div className="absolute inset-0 z-25 bg-stone-950/80 flex items-center justify-center backdrop-blur-sm">
                      <div className="flex flex-col items-center gap-3">
                        <div className="w-8 h-8 rounded-full border-2 border-brand-saffron border-t-transparent animate-spin" />
                        <span className="text-xs text-muted-foreground font-semibold">Loading poster resources...</span>
                      </div>
                    </div>
                  )}
                  
                  <canvas
                    ref={canvasRef}
                    onPointerDown={handlePointerDown}
                    onPointerMove={handlePointerMove}
                    onPointerUp={handlePointerUp}
                    onPointerCancel={handlePointerUp}
                    className="w-full h-auto block select-none bg-stone-950"
                    style={{ cursor: "grab" }}
                  />
                </div>

                <p className="text-[11px] text-muted-foreground mt-3 flex items-center gap-1.5 bg-muted/40 border border-border/40 px-3.5 py-1.5 rounded-full mt-4 text-left">
                  <Info className="w-3.5 h-3.5 text-brand-saffron flex-shrink-0" />
                  <span>{t.dragHelp}</span>
                </p>
              </div>

              {/* Editing Controls Column */}
              <div className="lg:col-span-5 space-y-6">
                
                {/* Image Upload card */}
                <div className="bg-card/50 border border-border/40 rounded-[28px] p-6 space-y-4">
                  <div className="text-left">
                    <span className="text-[10px] font-black text-brand-saffron uppercase tracking-widest">Active Template</span>
                    <h2 className="font-display text-xl font-bold tracking-wide mt-0.5">
                      {isHi ? selectedTemplate.titleHindi : selectedTemplate.title}
                    </h2>
                  </div>

                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleFileChange}
                    accept="image/jpeg,image/png,image/webp"
                    className="hidden"
                  />

                  {/* Upload Trigger / Load Demo Block */}
                  <div className="flex flex-col gap-3">
                    <button
                      onClick={triggerUpload}
                      className="w-full flex items-center justify-center gap-2.5 px-6 py-3.5 rounded-2xl bg-brand-saffron text-stone-950 font-sans font-black text-xs uppercase tracking-widest shadow-lg shadow-orange-500/20 hover:scale-[1.02] active:scale-98 transition-transform cursor-pointer"
                    >
                      <Upload className="w-4 h-4" />
                      <span>{t.uploadPlaceholder}</span>
                    </button>

                    <button
                      onClick={handleLoadDemo}
                      className="w-full flex items-center justify-center gap-2.5 px-6 py-3.5 rounded-2xl bg-white/10 hover:bg-white/15 border border-white/20 hover:border-white/30 text-white font-sans font-black text-xs uppercase tracking-widest hover:scale-[1.02] active:scale-98 transition-transform cursor-pointer"
                    >
                      <ImageIcon className="w-4 h-4 text-brand-gold" />
                      <span>{t.demoBtn}</span>
                    </button>
                  </div>
                </div>

                {/* Devotee Name & Layout Control Card */}
                <div className="bg-card/50 border border-border/40 rounded-[28px] p-6 space-y-6">
                  
                  {/* Devotee Name text field */}
                  <div className="space-y-2 text-left">
                    <label className="block text-xs text-muted-foreground font-black uppercase tracking-wider">
                      {isHi ? "श्रद्धालु का नाम जोड़ें (वैकल्पिक)" : "Devotee Name (Optional)"}
                    </label>
                    <input
                      type="text"
                      maxLength={24}
                      value={devoteeName}
                      onChange={(e) => {
                        setDevoteeName(e.target.value);
                        if (e.target.value.trim() && !showNameCard) {
                          setShowNameCard(true);
                        }
                      }}
                      placeholder={isHi ? "जैसे: राहुल शर्मा" : "e.g. Rahul Sharma"}
                      className="w-full bg-stone-900 border border-border/60 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-brand-saffron/80 text-foreground"
                    />
                    {devoteeName.trim() && (
                      <div className="flex items-center gap-2 mt-2">
                        <input
                          type="checkbox"
                          id="showNameCard"
                          checked={showNameCard}
                          onChange={(e) => setShowNameCard(e.target.checked)}
                          className="accent-brand-saffron rounded"
                        />
                        <label htmlFor="showNameCard" className="text-[11px] text-muted-foreground font-semibold cursor-pointer">
                          {isHi ? "पोस्टर पर नाम दिखाएं" : "Show name card on poster"}
                        </label>
                      </div>
                    )}
                  </div>

                  {/* Segmented Drag Mode Switcher */}
                  {(userImgElement || (showNameCard && devoteeName.trim())) && (
                    <div className="space-y-2 text-left">
                      <label className="block text-xs text-muted-foreground font-black uppercase tracking-wider">
                        {isHi ? "कैनवास ड्रैग मोड" : "Canvas Drag Mode"}
                      </label>
                      <div className="grid grid-cols-3 gap-1 bg-stone-900/60 p-1 rounded-xl border border-border/30">
                        <button
                          onClick={() => setDragMode("photo")}
                          disabled={!userImgElement}
                          className={cn(
                            "py-1.5 px-2 rounded-lg text-[10px] font-black uppercase tracking-wider transition-all cursor-pointer disabled:opacity-30 disabled:pointer-events-none",
                            dragMode === "photo"
                              ? "bg-brand-saffron text-stone-950 shadow-md"
                              : "text-muted-foreground hover:text-foreground"
                          )}
                        >
                          {isHi ? "फोटो" : "Photo"}
                        </button>
                        <button
                          onClick={() => setDragMode("frame")}
                          className={cn(
                            "py-1.5 px-2 rounded-lg text-[10px] font-black uppercase tracking-wider transition-all cursor-pointer",
                            dragMode === "frame"
                              ? "bg-brand-saffron text-stone-950 shadow-md"
                              : "text-muted-foreground hover:text-foreground"
                          )}
                        >
                          {isHi ? "फ्रेम" : "Frame"}
                        </button>
                        <button
                          onClick={() => setDragMode("name")}
                          disabled={!showNameCard || !devoteeName.trim()}
                          className={cn(
                            "py-1.5 px-2 rounded-lg text-[10px] font-black uppercase tracking-wider transition-all cursor-pointer disabled:opacity-30 disabled:pointer-events-none",
                            dragMode === "name"
                              ? "bg-brand-saffron text-stone-950 shadow-md"
                              : "text-muted-foreground hover:text-foreground"
                          )}
                        >
                          {isHi ? "नाम" : "Name"}
                        </button>
                      </div>
                      <p className="text-[10px] text-brand-gold mt-1 italic pl-1 leading-tight">
                        {dragMode === "photo" && (isHi ? "→ तस्वीर को फ्रेम के अंदर खिसकाने के लिए ड्रैग करें" : "→ Drag on canvas to reposition photo inside frame")}
                        {dragMode === "frame" && (isHi ? "→ पूरे फोटो फ्रेम को पोस्टर पर कहीं भी ले जाने के लिए ड्रैग करें" : "→ Drag on canvas to reposition the frame itself anywhere")}
                        {dragMode === "name" && (isHi ? "→ नाम कार्ड को पोस्टर पर कहीं भी ले जाने के लिए ड्रैग करें" : "→ Drag on canvas to reposition the name card itself anywhere")}
                      </p>
                    </div>
                  )}

                  {/* Frame Size Slider */}
                  <div className="space-y-3 text-left">
                    <div className="flex justify-between items-center text-xs text-muted-foreground font-black uppercase tracking-wider">
                      <span>{isHi ? "फ्रेम का आकार (Size)" : "Frame Size"}</span>
                      <span className="text-amber-400 font-sans">{(frameWidthPercent * 100).toFixed(0)}%</span>
                    </div>
                    <input
                      type="range"
                      min="0.08"
                      max="0.45"
                      step="0.01"
                      value={frameWidthPercent}
                      onChange={(e) => setFrameWidthPercent(parseFloat(e.target.value))}
                      className="w-full accent-brand-saffron cursor-pointer h-1.5 bg-stone-900 rounded-lg appearance-none"
                    />
                  </div>

                  {/* Zoom Slider (if photo uploaded) */}
                  {userImgElement && (
                    <div className="space-y-3 text-left">
                      <div className="flex justify-between items-center text-xs text-muted-foreground font-black uppercase tracking-wider">
                        <span>{t.zoomLabel}</span>
                        <span className="text-amber-400 font-sans">{zoom.toFixed(2)}x</span>
                      </div>
                      <input
                        type="range"
                        min="1.0"
                        max="4.0"
                        step="0.05"
                        value={zoom}
                        onChange={(e) => setZoom(parseFloat(e.target.value))}
                        className="w-full accent-brand-saffron cursor-pointer h-1.5 bg-stone-900 rounded-lg appearance-none"
                      />
                    </div>
                  )}

                  {/* Shape Selector (Only if allowShapeChange is true) */}
                  {selectedTemplate.photo.allowShapeChange && (
                    <div className="space-y-3 text-left">
                      <label className="block text-xs text-muted-foreground font-black uppercase tracking-wider text-left">
                        {t.shapeLabel}
                      </label>
                      <div className="grid grid-cols-2 gap-2">
                        {[
                          { name: "circle", label: t.shapeCircle },
                          { name: "square", label: t.shapeSquare },
                          { name: "rounded-square", label: t.shapeRounded },
                          { name: "oval", label: t.shapeOval },
                        ].map((shapeOpt) => (
                          <button
                            key={shapeOpt.name}
                            onClick={() => setShape(shapeOpt.name as Shape)}
                            className={cn(
                              "py-2 px-3 rounded-xl border text-xs font-semibold tracking-wide transition-all cursor-pointer",
                              shape === shapeOpt.name
                                ? "bg-brand-saffron/15 border-brand-saffron text-amber-200"
                                : "bg-transparent border-border/50 hover:border-border hover:bg-muted/30 text-muted-foreground"
                            )}
                          >
                            {shapeOpt.label}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Reset Button */}
                  <button
                    onClick={handleReset}
                    className="w-full flex items-center justify-center gap-2 py-2 px-4 rounded-xl border border-border hover:bg-muted/40 transition-colors text-xs font-bold text-muted-foreground hover:text-foreground cursor-pointer"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    <span>{t.btnReset}</span>
                  </button>

                </div>

                {/* Final Download Button */}
                <button
                  onClick={handleDownload}
                  className="w-full flex items-center justify-center gap-2.5 px-6 py-4 rounded-2xl bg-gradient-to-r from-orange-500 to-amber-500 text-white font-sans font-black text-sm uppercase tracking-widest shadow-xl shadow-orange-500/20 hover:scale-[1.02] active:scale-98 transition-transform cursor-pointer"
                >
                  <Download className="w-4 h-4" />
                  <span>{t.btnDownload}</span>
                </button>

              </div>

            </motion.div>
          )}
        </AnimatePresence>

      </div>
    </div>
  );
}
