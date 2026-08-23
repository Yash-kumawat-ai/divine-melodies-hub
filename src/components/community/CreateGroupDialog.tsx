/**
 * CreateGroupDialog.tsx
 *
 * Modal for creating a new community group.
 */

import { Users, Check, X, Pencil } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";

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

const inputCls =
  "w-full h-11 rounded-xl border bg-[#FFFDF8] dark:bg-stone-900 pl-10 pr-10 text-sm text-[#3A2418] dark:text-amber-50 placeholder:text-[#786252]/70 focus:outline-none focus:ring-1 focus:ring-[#651317]/20 transition-all";

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
      <DialogContent className="max-w-md bg-[#FFFDF8] dark:bg-[#120F0B] border border-[#E8D8C4] dark:border-stone-800 text-[#3A2418] dark:text-stone-50 rounded-2xl p-5 sm:p-6 max-h-[90vh] overflow-y-auto shadow-2xl">
        <DialogHeader className="sr-only">
          <DialogTitle>{isHi ? "समूह बनाएं" : "Create Community Group"}</DialogTitle>
          <DialogDescription>
            {isHi ? "समूह बनाएं और भक्तों को आमंत्रित करें।" : "Create a community group and invite devotees."}
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-col items-center mb-5">
          <div className="w-12 h-12 rounded-full border border-[#E8D8C4] dark:border-stone-700 bg-[#FAF6EE] dark:bg-stone-900 flex items-center justify-center mb-3">
            <Users className="w-5 h-5 text-[#651317] dark:text-amber-300" />
          </div>
          <h2 className="font-display font-bold text-lg sm:text-xl text-[#651317] dark:text-amber-100 text-center tracking-tight">
            {isHi ? "समूह बनाएं" : "Create Community Group"}
          </h2>
          <p className="text-center text-xs text-[#786252] dark:text-stone-400 mt-1 font-medium">
            {isHi ? "श्रद्धापूर्वक स्थान बनाएं और साथ मिलकर आगे बढ़ें" : "Build a devotional space and grow together"}
          </p>
        </div>

        <form onSubmit={onSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-[#3A2418] dark:text-stone-300 block">
              {isHi ? "समूह का नाम" : "Group Name"}
            </label>
            <div className="relative">
              <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#786252]">
                <Users className="w-4 h-4" />
              </span>
              <input
                type="text"
                required
                maxLength={40}
                placeholder={isHi ? "जैसे: श्री श्याम सत्संग मंडल" : "e.g., Shree Shyam Group"}
                value={groupName}
                onChange={(e) => setGroupName(e.target.value)}
                className={cn(
                  inputCls,
                  isNameUnique === false
                    ? "border-rose-500 focus:border-rose-500"
                    : "border-[#E8D8C4] dark:border-stone-700 focus:border-[#651317]"
                )}
              />
              {isNameUnique === true && (
                <span className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 rounded-full bg-[#651317] flex items-center justify-center text-white">
                  <Check className="w-3 h-3" strokeWidth={3} />
                </span>
              )}
              {isNameUnique === false && (
                <span className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 rounded-full bg-rose-100 dark:bg-rose-950/60 flex items-center justify-center text-rose-600">
                  <X className="w-3 h-3" strokeWidth={3} />
                </span>
              )}
            </div>

            {isNameUnique === false && (
              <p className="text-[10.5px] text-rose-600 dark:text-rose-400 font-medium leading-relaxed mt-1">
                {isHi
                  ? "यह नाम पहले से लिया गया है। टिप: स्थान का नाम जोड़ें (जैसे: 'जयपुर श्री श्याम ग्रुप सत्संग')।"
                  : "This group name is already taken. Tip: Add a place name (e.g. 'Jaipur Shree Shyam Group') to make it unique."}
              </p>
            )}
            {isNameUnique === true && (
              <p className="text-[10.5px] text-[#651317] dark:text-amber-300 font-medium leading-relaxed mt-1">
                {isHi ? "यह नाम उपलब्ध है।" : "This name is available."}
              </p>
            )}
          </div>

          <div className="space-y-1.5">
            <div className="flex justify-between items-center">
              <label className="text-xs font-bold text-[#3A2418] dark:text-stone-300 block">
                {isHi ? "विवरण (वैकल्पिक)" : "Description (Optional)"}
              </label>
              <span className="text-[9px] text-[#786252] font-medium tabular-nums">
                {groupDesc.length}/60
              </span>
            </div>
            <div className="relative">
              <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#786252]">
                <Pencil className="w-4 h-4" />
              </span>
              <input
                type="text"
                maxLength={60}
                placeholder={isHi ? "जैसे: प्रतिदिन संकीर्तन और भजन शेयरिंग" : "e.g., For kirtan and bhajan sharing"}
                value={groupDesc}
                onChange={(e) => setGroupDesc(e.target.value)}
                className={cn(inputCls, "border-[#E8D8C4] dark:border-stone-700 focus:border-[#651317]")}
              />
            </div>
          </div>

          <div className="space-y-2.5">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-[#3A2418] dark:text-stone-300 block">
                {isHi ? "इष्ट देव चुनें" : "Choose Ishta Dev"}
              </label>
              <span className="text-[10px] text-[#786252] font-medium">
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
                      <div
                        className={cn(
                          "w-14 h-14 rounded-full overflow-hidden border transition-all p-0.5",
                          isSelected
                            ? "border-[#651317] ring-2 ring-[#651317] ring-offset-2 ring-offset-[#FFFDF8] dark:ring-offset-[#120F0B]"
                            : "border-[#E8D8C4] dark:border-stone-700 opacity-85 hover:opacity-100"
                        )}
                      >
                        <img
                          src={d.src}
                          alt={d.name}
                          className="w-full h-full object-cover rounded-full"
                          loading="lazy"
                        />
                      </div>
                      {isSelected && (
                        <span className="absolute -top-0.5 -right-0.5 w-5 h-5 bg-[#651317] text-white rounded-full flex items-center justify-center border-2 border-[#FFFDF8] dark:border-[#120F0B]">
                          <Check className="w-3 h-3" strokeWidth={3} />
                        </span>
                      )}
                    </div>
                    <span
                      className={cn(
                        "text-[10px] font-semibold",
                        isSelected ? "text-[#651317] dark:text-amber-300" : "text-[#786252] dark:text-stone-400"
                      )}
                    >
                      {d.name.split(" ")[0]}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="flex items-center gap-3 p-3.5 rounded-2xl bg-[#FAF6EE] dark:bg-stone-900 border border-[#E8D8C4] dark:border-stone-800">
            <span className="w-8 h-8 rounded-full bg-[#651317] text-white flex items-center justify-center shrink-0">
              <Check className="w-4 h-4" strokeWidth={3} />
            </span>
            <div className="text-left min-w-0">
              <p className="text-xs font-bold text-[#3A2418] dark:text-stone-200 leading-tight">
                {isHi ? "कोई भी आपके समूह में शामिल हो सकता है।" : "Anyone can join your group."}
              </p>
              <p className="text-[10px] text-[#786252] dark:text-stone-400 mt-0.5 font-medium">
                {isHi ? "सभी समूह हरि कीर्तन पर सार्वजनिक हैं।" : "All groups are public on Hari Kirtan."}
              </p>
            </div>
          </div>

          <div className="space-y-2 pt-1">
            <button
              type="submit"
              disabled={creatingGroup || isNameUnique === false}
              className="w-full h-12 rounded-full bg-[#651317] hover:bg-[#4f0f12] text-white font-bold text-sm active:scale-[0.98] transition-all disabled:opacity-50"
            >
              {creatingGroup
                ? isHi
                  ? "बन रहा है..."
                  : "Creating Group..."
                : isHi
                  ? "समूह बनाएं"
                  : "Create Group"}
            </button>

            <button
              type="button"
              onClick={() => onOpenChange(false)}
              className="w-full text-center text-sm font-semibold text-[#651317] dark:text-amber-300 hover:text-[#4f0f12] py-2"
            >
              {isHi ? "रद्द करें" : "Cancel"}
            </button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
