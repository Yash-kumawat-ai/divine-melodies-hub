import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Camera, User as UserIcon, Check, Trash2 } from "lucide-react";
import { cn } from "@/lib/utils";

export interface ProfileSetupModalProps {
  isOpen: boolean;
  onClose: () => void;
  isDark: boolean;
  isHi: boolean;
  tempPhoto: string | null;
  setTempPhoto: (photo: string | null) => void;
  tempName: string;
  setTempName: (name: string) => void;
  setUserName: (name: string) => void;
  setUserPhoto: (photo: string | null) => void;
  fileInputRef: React.RefObject<HTMLInputElement>;
  setCropImageSrc: (src: string) => void;
  setCropTarget: (target: 'temp' | 'user') => void;
  setCropModalOpen: (open: boolean) => void;
  onSaveSuccess: () => void;
}

export const ProfileSetupModal: React.FC<ProfileSetupModalProps> = ({
  isOpen,
  onClose,
  isDark,
  isHi,
  tempPhoto,
  setTempPhoto,
  tempName,
  setTempName,
  setUserName,
  setUserPhoto,
  fileInputRef,
  setCropImageSrc,
  setCropTarget,
  setCropModalOpen,
  onSaveSuccess,
}) => {
  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="fixed inset-0 bg-black/65 z-[150] backdrop-blur-sm"
      />

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
            onClick={onClose}
            className={cn("w-8 h-8 rounded-full border flex items-center justify-center transition-colors cursor-pointer", isDark ? "bg-amber-500/10 hover:bg-amber-500/20 border-amber-500/20 text-amber-400" : "bg-[#651317]/10 hover:bg-[#651317]/20 border-[#651317]/20 text-[#651317]")}
          >
            <X className="w-4.5 h-4.5" />
          </button>
        </div>

        {/* Upload Photo section */}
        <div className="flex flex-col items-center gap-3">
          <div className="relative inline-block">
            <div className={cn("w-24 h-24 rounded-full overflow-hidden border-2 flex items-center justify-center shadow-lg transition-all", isDark ? "border-amber-500/50 bg-stone-900/80 shadow-amber-500/10" : "border-[#D4A437] bg-[#FCF6E8] shadow-amber-900/10")}>
              {tempPhoto ? (
                <img src={tempPhoto} alt="Preview avatar" className="w-full h-full object-cover" />
              ) : (
                <span className={cn("font-serif text-2xl", isDark ? "text-amber-400/80" : "text-[#651317]")}>ॐ</span>
              )}
            </div>

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
            onClick={onSaveSuccess}
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
                onClose();
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
    </AnimatePresence>
  );
};
