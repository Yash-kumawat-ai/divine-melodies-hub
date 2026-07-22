/**
 * CreateGroupDialog.tsx
 *
 * Extracted from JoinCommunityPage.tsx as part of Phase 6 refactoring (Engineering Execution Blueprint).
 * Encapsulates the modal dialog for creating a new devotional group.
 */

import React from "react";
import { Users, Check, X, Pencil, Sparkles, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";

// Large deity avatars for group creation
import durgaImg from "@/assets/deities/durga.webp";
import ganeshImg from "@/assets/deities/ganesh.webp";
import hanumanImg from "@/assets/deities/hanuman.webp";
import krishnaImg from "@/assets/deities/krishna.webp";
import lakshmiImg from "@/assets/deities/lakshmi.webp";
import ramaImg from "@/assets/deities/rama.webp";
import saiBabaImg from "@/assets/deities/sai-baba.webp";
import shivaImg from "@/assets/deities/shiva.webp";

const DEITIES = [
  { id: "rama", name: "Ram Ji", src: ramaImg },
  { id: "hanuman", name: "Hanuman Ji", src: hanumanImg },
  { id: "krishna", name: "Krishna Ji", src: krishnaImg },
  { id: "shiva", name: "Shiva Ji", src: shivaImg },
  { id: "ganesh", name: "Ganesh Ji", src: ganeshImg },
  { id: "durga", name: "Durga Ma", src: durgaImg },
  { id: "lakshmi", name: "Lakshmi Ma", src: lakshmiImg },
  { id: "sai-baba", name: "Sai Baba", src: saiBabaImg },
];

export interface CreateGroupDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  isHi: boolean;
  groupName: string;
  setGroupName: (name: string) => void;
  groupDesc: string;
  setGroupDesc: (desc: string) => void;
  groupDeity: string;
  setGroupDeity: (deity: string) => void;
  creatingGroup: boolean;
  isNameUnique: boolean | null;
  onSubmit: (e: React.FormEvent) => void;
}

export function CreateGroupDialog({
  open,
  onOpenChange,
  isHi,
  groupName,
  setGroupName,
  groupDesc,
  setGroupDesc,
  groupDeity,
  setGroupDeity,
  creatingGroup,
  isNameUnique,
  onSubmit,
}: CreateGroupDialogProps) {
  return (
    <Dialog
      open={open}
      onOpenChange={(o) => {
        onOpenChange(o);
        if (!o) {
          setGroupName("");
          setGroupDesc("");
          setGroupDeity("rama");
        }
      }}
    >
      <DialogContent className="max-w-md bg-background dark:bg-background border-[hsl(var(--brand-gold-border))] text-foreground rounded-3xl p-6 max-h-[90vh] overflow-y-auto shadow-4">
        {/* Visually hidden — required by Radix for accessibility */}
        <DialogHeader className="sr-only">
          <DialogTitle>{isHi ? "समूह बनाएं" : "Create Community Group"}</DialogTitle>
          <DialogDescription>
            {isHi ? "समूह बनाएं और भक्तों को आमंत्रित करें।" : "Create a community group and invite devotees."}
          </DialogDescription>
        </DialogHeader>

        {/* Glowing Header with Lotus & Flourish Leaves */}
        <div className="relative flex flex-col items-center mb-6 pt-2">
          <div className="relative flex justify-center mb-3">
            <div className="w-16 h-16 rounded-full bg-white dark:bg-stone-900 border border-orange-200 dark:border-orange-950 flex items-center justify-center shadow-lg shadow-orange-500/10 relative z-10">
              <span className="text-3xl filter drop-shadow-[0_2px_8px_rgba(249,115,22,0.45)] select-none">🪷</span>
            </div>
            {/* Glow backdrop */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-28 h-28 bg-orange-200/40 dark:bg-orange-950/20 rounded-full blur-2xl -z-0" />
            {/* Decorative flourish leaves */}
            <div className="absolute top-2 left-[calc(50%-75px)] text-emerald-600/30 dark:text-emerald-500/20 text-2xl select-none pointer-events-none transform -rotate-12">
              🌿
            </div>
            <div className="absolute top-2 right-[calc(50%-75px)] text-emerald-600/30 dark:text-emerald-500/20 text-2xl select-none pointer-events-none transform rotate-12">
              🌿
            </div>
          </div>

          <h2 className="font-display font-extrabold text-xl md:text-2xl text-orange-955 text-orange-950 dark:text-amber-100 text-center tracking-tight leading-tight">
            {isHi ? "समूह बनाएं" : "Create Community Group"}
          </h2>
          <p className="text-center text-xs text-stone-500 dark:text-stone-400 mt-1 flex items-center justify-center gap-1 font-medium">
            {isHi ? "श्रद्धापूर्वक स्थान बनाएं और साथ मिलकर आगे बढ़ें 🧡" : "Build a devotional space and grow together 🧡"}
          </p>
        </div>

        <form onSubmit={onSubmit} className="space-y-5">
          {/* Group Name input */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-stone-600 dark:text-stone-300 block">
              {isHi ? "समूह का नाम" : "Group Name"}
            </label>
            <div className="relative">
              <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-orange-500">
                <Users className="w-4 h-4" />
              </span>
              <input
                type="text"
                required
                maxLength={40}
                placeholder={isHi ? "जैसे: श्री श्याम सत्संग मंडल" : "e.g., Shree Shyam Group"}
                value={groupName}
                onChange={(e) => setGroupName(e.target.value)}
                className={`w-full rounded-xl border bg-white dark:bg-stone-900/60 pl-10 pr-10 py-3 text-sm focus:outline-none transition-all ${
                  isNameUnique === true
                    ? "border-emerald-500 ring-2 ring-emerald-500/10 focus:ring-emerald-500/20"
                    : isNameUnique === false
                    ? "border-rose-500 ring-2 ring-rose-500/10 focus:ring-rose-500/20"
                    : "border-orange-500/20 focus:border-orange-400 focus:ring-2 focus:ring-orange-500/20"
                }`}
              />
              {isNameUnique === true && (
                <span className="absolute right-3 top-1/2 -translate-y-1/2 w-5.5 h-5.5 bg-emerald-100 dark:bg-emerald-950/60 rounded-full flex items-center justify-center text-emerald-600 dark:text-emerald-450">
                  <Check className="w-3.5 h-3.5" strokeWidth={3} />
                </span>
              )}
              {isNameUnique === false && (
                <span className="absolute right-3 top-1/2 -translate-y-1/2 w-5.5 h-5.5 bg-rose-100 dark:bg-rose-950/60 rounded-full flex items-center justify-center text-rose-600 dark:text-rose-405 text-rose-500">
                  <X className="w-3.5 h-3.5" strokeWidth={3} />
                </span>
              )}
            </div>

            {/* Dynamic Tip display */}
            {isNameUnique === false && (
              <p className="text-[10.5px] text-rose-600 dark:text-rose-400 font-semibold leading-relaxed mt-1 flex items-start gap-1">
                <span className="shrink-0 mt-0.5">⚠️</span>
                <span>
                  {isHi
                    ? "यह नाम पहले से लिया गया है। टिप: इसे अद्वितीय बनाने के लिए स्थान का नाम जोड़ें (जैसे: 'जयपुर श्री श्याम ग्रुप सत्संग')।"
                    : "This group name is already taken. Tip: Add a place/location name (e.g. 'Jaipur Shree Shyam Group') to make it unique!"}
                </span>
              </p>
            )}
            {isNameUnique === true && (
              <p className="text-[10.5px] text-emerald-600 dark:text-emerald-400 font-semibold leading-relaxed mt-1 flex items-start gap-1">
                <span className="shrink-0 mt-0.5">✅</span>
                <span>{isHi ? "यह नाम उपलब्ध है!" : "This name is available!"}</span>
              </p>
            )}
          </div>

          {/* Description input */}
          <div className="space-y-1.5">
            <div className="flex justify-between items-center">
              <label className="text-xs font-bold text-stone-600 dark:text-stone-300 block">
                {isHi ? "विवरण (वैकल्पिक)" : "Description (Optional)"}
              </label>
              <span className="text-[9px] text-stone-400 dark:text-stone-500 font-mono">
                {groupDesc.length}/60
              </span>
            </div>
            <div className="relative">
              <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-orange-500">
                <Pencil className="w-4 h-4" />
              </span>
              <input
                type="text"
                maxLength={60}
                placeholder={isHi ? "जैसे: प्रतिदिन संकीर्तन और भजन शेयरिंग" : "e.g., For kirtan and bhajan sharing"}
                value={groupDesc}
                onChange={(e) => setGroupDesc(e.target.value)}
                className="w-full rounded-xl border border-orange-500/20 bg-white dark:bg-stone-900/60 pl-10 pr-10 py-3 text-sm focus:border-orange-400 focus:outline-none focus:ring-2 focus:ring-orange-500/20 transition-all"
              />
            </div>
          </div>

          {/* Choose Ishta Dev deity avatars row */}
          <div className="space-y-2.5">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-stone-600 dark:text-stone-300 block">
                {isHi ? "इष्ट देव चुनें" : "Choose Ishta Dev"}
              </label>
              <span className="text-[10px] text-stone-400 dark:text-stone-500 font-semibold">
                {isHi ? "एक चुनें" : "Select one"}
              </span>
            </div>

            <div className="grid grid-cols-4 gap-3 py-1">
              {DEITIES.map((d) => {
                const isSelected = groupDeity === d.id;
                return (
                  <button
                    key={d.id}
                    type="button"
                    onClick={() => setGroupDeity(d.id)}
                    className="group flex flex-col items-center gap-1.5 focus:outline-none"
                  >
                    <div className="relative">
                      {/* Deity circular avatar */}
                      <div
                        className={`w-14 h-14 rounded-full overflow-hidden border-2 transition-all p-0.5 ${
                          isSelected
                            ? "border-orange-500 scale-[1.05] ring-4 ring-orange-500/10 shadow-md"
                            : "border-stone-200 dark:border-stone-800 opacity-80 hover:opacity-100 hover:border-orange-400/40 hover:scale-[1.02]"
                        }`}
                      >
                        <img
                          src={d.src}
                          alt={d.name}
                          className="w-full h-full object-cover rounded-full"
                          loading="lazy"
                        />
                      </div>
                      {/* Active checkmark indicator */}
                      {isSelected && (
                        <span className="absolute -top-1 -right-1 w-5 h-5 bg-orange-500 text-white rounded-full flex items-center justify-center shadow border-2 border-[#FAF6EE] dark:border-[#120F0B] text-[10px] font-bold">
                          ✓
                        </span>
                      )}
                    </div>
                    <span
                      className={`text-[10px] font-bold transition-colors ${
                        isSelected
                          ? "text-orange-500 border-b border-orange-500/50 pb-0.5"
                          : "text-stone-500 dark:text-stone-400 group-hover:text-stone-700 dark:group-hover:text-stone-200"
                      }`}
                    >
                      {d.name.split(" ")[0]}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Public/Privacy Banner */}
          <div className="flex items-center justify-between p-3.5 rounded-2xl bg-emerald-500/5 dark:bg-emerald-500/10 border border-emerald-500/15">
            <div className="flex items-center gap-3">
              <span className="w-8 h-8 rounded-full bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-450 flex items-center justify-center shrink-0">
                <Check className="w-4 h-4" strokeWidth={3} />
              </span>
              <div className="text-left">
                <p className="text-xs font-bold text-stone-850 dark:text-stone-200 leading-tight">
                  {isHi ? "कोई भी आपके समूह में शामिल हो सकता है।" : "Anyone can join your group."}
                </p>
                <p className="text-[10px] text-stone-500 dark:text-stone-400 mt-0.5 font-medium">
                  {isHi ? "सभी समूह हरि कीर्तन पर सार्वजनिक हैं।" : "All groups are public on Hari Kirtan."}
                </p>
              </div>
            </div>
            <span className="text-orange-500/20 dark:text-orange-400/15">
              <Users className="w-7 h-7" />
            </span>
          </div>

          {/* Submit and Cancel Buttons */}
          <div className="space-y-2 pt-2">
            <Button
              type="submit"
              disabled={creatingGroup || isNameUnique === false}
              className="btn-primary btn-full btn-lg gap-2"
            >
              <Sparkles className="w-4 h-4 animate-pulse" />
              <span>
                {creatingGroup
                  ? isHi
                    ? "बन रहा है..."
                    : "Creating Group..."
                  : isHi
                  ? "समूह बनाएं"
                  : "Create Group"}
              </span>
              <ArrowRight className="w-4 h-4 ml-auto" />
            </Button>

            <button
              type="button"
              onClick={() => onOpenChange(false)}
              className="btn-ghost btn-full text-sm py-2"
            >
              {isHi ? "रद्द करें" : "Cancel"}
            </button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
