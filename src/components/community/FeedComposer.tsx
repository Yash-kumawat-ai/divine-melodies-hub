/**
 * FeedComposer.tsx
 *
 * Feed post composer: avatar + caption pill, then Photo / Emoji / Voice + Post.
 */

import React, { useRef } from "react";
import { Image as ImageIcon, Smile, Mic } from "lucide-react";
import { toast } from "sonner";
import { COMMUNITY_IMAGE_MAX_PICK_BYTES } from "@/lib/compressCommunityImage";
import { checkVoiceSupport } from "@/lib/voiceUtils";

type PostTypeId = "bhajan_share" | "bhajan_request" | "question" | "thought" | "event" | "shloka";

export type ComposeIntent = {
  type?: PostTypeId;
  openFilePicker?: boolean;
  mediaFile?: File | null;
  startVoice?: boolean;
  showEmoji?: boolean;
};

interface FeedComposerProps {
  isHi: boolean;
  user: any;
  onOpenCompose: (intent?: ComposeIntent | PostTypeId) => void;
}

export function FeedComposer({ isHi, user, onOpenCompose }: FeedComposerProps) {
  const displayName = user?.user_metadata?.display_name || user?.email || "D";
  const avatarUrl = user?.user_metadata?.avatar_url;
  const fileRef = useRef<HTMLInputElement>(null);

  const open = (intent: ComposeIntent = {}) => {
    onOpenCompose({ type: intent.type ?? "thought", ...intent });
  };

  const onMediaClick = () => {
    fileRef.current?.click();
  };

  const onMediaPicked = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    if (file.size > COMMUNITY_IMAGE_MAX_PICK_BYTES) {
      toast.error(isHi ? "चित्र 15MB से बड़ा है।" : "Photo is larger than 15MB.");
      return;
    }
    open({ mediaFile: file });
  };

  const onVoiceClick = () => {
    if (!checkVoiceSupport().recognition) {
      toast.error(
        isHi
          ? "इस ब्राउज़र में आवाज़ लिखना उपलब्ध नहीं है।"
          : "Voice typing is not supported in this browser."
      );
      return;
    }
    open({ startVoice: true });
  };

  return (
    <div className="bg-[#FFFDF8] dark:bg-[#1A120B] border border-[#E8D8C4] dark:border-stone-800 rounded-2xl p-3 sm:p-3.5 space-y-2.5 shadow-xs">
      <input
        ref={fileRef}
        type="file"
        accept="image/jpeg,image/png,image/webp,image/*"
        className="hidden"
        onChange={onMediaPicked}
      />

      <div className="flex items-center gap-2.5">
        <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-full overflow-hidden bg-[#FAF0E4] dark:bg-[#2B1F14] border border-[#E8D8C4] dark:border-stone-700 shrink-0 flex items-center justify-center shadow-2xs">
          {avatarUrl ? (
            <img src={avatarUrl} alt="" className="w-full h-full object-cover" />
          ) : (
            <span className="font-bold text-xs text-[#651317] dark:text-amber-300 uppercase">
              {displayName[0]?.toUpperCase() || "D"}
            </span>
          )}
        </div>
        <button
          type="button"
          onClick={() => open()}
          className="flex-1 text-left text-[#8C7A6B] dark:text-stone-400 text-xs sm:text-sm font-medium py-2 px-3.5 rounded-xl bg-[#FAF6EE] dark:bg-stone-900 border border-[#E8D8C4]/60 hover:border-[#651317]/30 transition-all cursor-pointer"
        >
          {isHi ? "विचार साझा करें..." : "Share your thoughts..."}
        </button>
      </div>

      <div className="flex items-center justify-between gap-2 border-t border-[#E8D8C4]/50 dark:border-stone-800 pt-2">
        <div className="flex items-center gap-0.5 rounded-xl bg-[#FAF6EE]/80 dark:bg-stone-900/50 p-0.5">
          <button
            type="button"
            onClick={onMediaClick}
            className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-semibold text-[#8C7A6B] hover:text-[#651317] hover:bg-white dark:hover:bg-stone-800 transition-colors cursor-pointer"
          >
            <ImageIcon className="w-3.5 h-3.5 text-[#651317] dark:text-amber-400" />
            <span>{isHi ? "चित्र" : "Photo"}</span>
          </button>
          <button
            type="button"
            onClick={() => open({ showEmoji: true })}
            className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-semibold text-[#8C7A6B] hover:text-[#651317] hover:bg-white dark:hover:bg-stone-800 transition-colors cursor-pointer"
          >
            <Smile className="w-3.5 h-3.5 text-[#651317] dark:text-amber-400" />
            <span>{isHi ? "इमोजी" : "Emoji"}</span>
          </button>
          <button
            type="button"
            onClick={onVoiceClick}
            className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-semibold text-[#8C7A6B] hover:text-[#651317] hover:bg-white dark:hover:bg-stone-800 transition-colors cursor-pointer"
          >
            <Mic className="w-3.5 h-3.5 text-[#651317] dark:text-amber-400" />
            <span>{isHi ? "आवाज़" : "Voice"}</span>
          </button>
        </div>

        <button
          type="button"
          onClick={() => open()}
          className="inline-flex h-10 min-h-10 shrink-0 items-center justify-center gap-1.5 rounded-xl bg-[#651317] px-4 text-sm font-extrabold text-white shadow-xs transition-all hover:bg-[#4f0f12] active:scale-95 cursor-pointer"
        >
          {isHi ? "पोस्ट करें" : "Post"}
        </button>
      </div>
    </div>
  );
}

export default FeedComposer;
