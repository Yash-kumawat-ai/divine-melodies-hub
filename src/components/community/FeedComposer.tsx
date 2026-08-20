/**
 * FeedComposer.tsx
 *
 * Feed Post Composer bar matching GroupHall styling:
 * Avatar + "Share your thoughts..." pill input, with Media, Emoji, Voice, and Post button.
 */

import React from "react";
import { Image as ImageIcon, Smile, Mic } from "lucide-react";

type PostTypeId = "bhajan_share" | "bhajan_request" | "question" | "thought" | "event" | "shloka";

interface FeedComposerProps {
  isHi: boolean;
  user: any;
  onOpenCompose: (type?: PostTypeId) => void;
}

export function FeedComposer({ isHi, user, onOpenCompose }: FeedComposerProps) {
  const displayName = user?.user_metadata?.display_name || user?.email || "D";
  const avatarUrl = user?.user_metadata?.avatar_url;

  return (
    <div className="bg-[#FFFDF8] dark:bg-[#1A120B] border border-[#E8D8C4] dark:border-stone-800 rounded-2xl p-3 sm:p-3.5 space-y-2.5 shadow-xs">
      {/* Top Input Row */}
      <div className="flex items-center gap-2.5">
        <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-full overflow-hidden bg-[#FAF0E4] dark:bg-[#2B1F14] border border-[#E8D8C4] dark:border-stone-700 shrink-0 flex items-center justify-center shadow-2xs">
          {avatarUrl ? (
            <img
              src={avatarUrl}
              alt="avatar"
              className="w-full h-full object-cover"
            />
          ) : (
            <span className="font-bold text-xs text-[#651317] dark:text-amber-300 uppercase">
              {displayName[0]?.toUpperCase() || "D"}
            </span>
          )}
        </div>
        <button
          type="button"
          onClick={() => onOpenCompose("thought")}
          className="flex-1 text-left text-[#8C7A6B] dark:text-stone-400 text-xs sm:text-sm font-medium py-2 px-3.5 rounded-xl bg-[#FAF6EE] dark:bg-stone-900 border border-[#E8D8C4]/60 hover:border-[#651317]/30 transition-all cursor-pointer"
        >
          😊 {isHi ? "विचार साझा करें..." : "Share your thoughts..."}
        </button>
      </div>

      {/* Bottom Action Bar */}
      <div className="flex items-center justify-between border-t border-[#E8D8C4]/50 dark:border-stone-800 pt-2">
        <div className="flex items-center gap-1.5 sm:gap-2">
          <button
            type="button"
            onClick={() => onOpenCompose("thought")}
            className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold text-[#8C7A6B] hover:text-[#651317] hover:bg-[#FAF0E4] dark:hover:bg-stone-800 transition-colors cursor-pointer"
          >
            <ImageIcon className="w-3.5 h-3.5 text-[#651317] dark:text-amber-400" />
            <span>{isHi ? "चित्र" : "Media"}</span>
          </button>
          <button
            type="button"
            onClick={() => onOpenCompose("thought")}
            className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold text-[#8C7A6B] hover:text-[#651317] hover:bg-[#FAF0E4] dark:hover:bg-stone-800 transition-colors cursor-pointer"
          >
            <Smile className="w-3.5 h-3.5 text-[#651317] dark:text-amber-400" />
            <span>{isHi ? "इमोजी" : "Emoji"}</span>
          </button>
          <button
            type="button"
            onClick={() => onOpenCompose("thought")}
            className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold text-[#8C7A6B] hover:text-[#651317] hover:bg-[#FAF0E4] dark:hover:bg-stone-800 transition-colors cursor-pointer"
          >
            <Mic className="w-3.5 h-3.5 text-[#651317] dark:text-amber-400" />
            <span>{isHi ? "आवाज" : "Voice"}</span>
          </button>
        </div>

        <button
          type="button"
          onClick={() => onOpenCompose("thought")}
          className="inline-flex items-center justify-center gap-1.5 h-8 sm:h-8.5 px-4 rounded-full bg-[#651317] hover:bg-[#4f0f12] text-white font-semibold text-xs active:scale-95 transition-all shadow-xs shrink-0 cursor-pointer"
        >
          {isHi ? "पोस्ट करें" : "Post"}
        </button>
      </div>
    </div>
  );
}

export default FeedComposer;
