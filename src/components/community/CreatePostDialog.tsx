/**
 * CreatePostDialog.tsx
 *
 * Enhanced devotional post creation modal with clean localized fields:
 * - Thought: Topic tags, Deity selector, Scripture reference
 * - Share: Deity, Raag/Taal, Singer, YouTube link
 * - Request: Deity, Urgency, Need/Reward badge, Photo upload
 * - Question: Category, Deity context, Scripture ref, Anonymous toggle, up to 6 poll options
 * - Event: Event type, Online/Offline toggle, Date, Time, Venue/Link, Entry fee, Contact
 * - NEW Shloka: Mantra text, Translation/Meaning, Source/Scripture, Deity
 */

import React, { useState, useEffect } from "react";
import { Eye, EyeOff, Tag } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { ImageAdjuster } from "@/components/community/ImageAdjuster";
import { cn } from "@/lib/utils";

export interface CreatePostDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  isHi: boolean;
  postType: "bhajan_share" | "bhajan_request" | "question" | "thought" | "event" | "shloka";
  setPostType: (type: "bhajan_share" | "bhajan_request" | "question" | "thought" | "event" | "shloka") => void;
  postTitle: string;
  setPostTitle: (v: string) => void;
  postContent: string;
  setPostContent: (v: string) => void;
  postImagePreview: string | null;
  postYoutubeUrl: string;
  setPostYoutubeUrl: (v: string) => void;
  pollOptions: string[];
  setPollOptions: (opts: string[]) => void;
  eventDate: string;
  setEventDate: (v: string) => void;
  eventTime: string;
  setEventTime: (v: string) => void;
  postLocation: string;
  setPostLocation: (v: string) => void;
  eventLinkedBhajan: number | null;
  setEventLinkedBhajan: (id: number | null) => void;
  myBhajans: any[];
  publishingPost: boolean;
  handleImageChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onCroppedImageReady?: (file: File, previewUrl: string) => void;
  onRemoveImage?: () => void;
  onSubmit: (e: React.FormEvent) => void;
}

const POST_TYPES = [
  { id: "thought", emoji: "🌿", label: "Thought", labelHi: "विचार" },
  { id: "bhajan_share", emoji: "🎵", label: "Share", labelHi: "शेयर" },
  { id: "bhajan_request", emoji: "📿", label: "Request", labelHi: "अनुरोध" },
  { id: "question", emoji: "🙏", label: "Question", labelHi: "प्रश्न" },
  { id: "event", emoji: "📅", label: "Event", labelHi: "सत्संग" },
  { id: "shloka", emoji: "📜", label: "Shloka", labelHi: "श्लोक" },
] as const;

// ── Shared localized tag lists ──
const MOOD_TAGS = [
  { emoji: "🌸", en: "Grateful", hi: "कृतज्ञ" },
  { emoji: "✨", en: "Inspired", hi: "प्रेरित" },
  { emoji: "🙏", en: "Seeking", hi: "जिज्ञासु" },
  { emoji: "😊", en: "Joyful", hi: "आनंदित" },
  { emoji: "🕉️", en: "Peaceful", hi: "शांत" },
];

const TOPIC_TAGS = [
  { emoji: "🌅", en: "Morning Thought", hi: "प्रातः विचार" },
  { emoji: "📖", en: "Story / Katha", hi: "कथा / प्रसंग" },
  { emoji: "💭", en: "Reflection", hi: "चिंतन" },
  { emoji: "🙏", en: "Prayer", hi: "प्रार्थना" },
  { emoji: "🪷", en: "Life Lesson", hi: "जीवन सीख" },
];

const DEITY_TAGS = [
  { emoji: "🕉️", en: "Ram", hi: "श्री राम" },
  { emoji: "🦚", en: "Krishna", hi: "श्री कृष्ण" },
  { emoji: "🔱", en: "Shiva", hi: "महादेव शिव" },
  { emoji: "🐒", en: "Hanuman", hi: "श्री हनुमान" },
  { emoji: "🌺", en: "Durga", hi: "माँ दुर्गा" },
  { emoji: "🐘", en: "Ganesh", hi: "श्री गणेश" },
  { emoji: "🙏", en: "Sai Baba", hi: "साईं बाबा" },
  { emoji: "✨", en: "Other", hi: "अन्य" },
];

const Q_CATEGORIES = [
  { emoji: "📚", en: "Philosophy", hi: "दर्शन" },
  { emoji: "🙏", en: "Devotion", hi: "भक्ति" },
  { emoji: "🕉️", en: "Deity", hi: "देवता" },
  { emoji: "📿", en: "Practice", hi: "साधना" },
  { emoji: "🎵", en: "Bhajan", hi: "भजन" },
  { emoji: "💡", en: "Other", hi: "अन्य" },
];

const URGENCY_TAGS = [
  { emoji: "🔔", en: "Asap", hi: "शीघ्र" },
  { emoji: "📅", en: "Later", hi: "फुर्सत में" },
  { emoji: "🎉", en: "For Event", hi: "कार्यक्रम हेतु" },
];

const REWARD_TAGS = [
  { emoji: "📝", en: "Just Need Lyrics", hi: "केवल बोल (Lyrics) चाहिए" },
  { emoji: "🎤", en: "Need Full Audio", hi: "पूरा ऑडियो चाहिए" },
  { emoji: "🏅", en: "Will Credit Singer", hi: "गायक का आभार व्यक्त करेंगे" },
];

const EVENT_TYPE_TAGS = [
  { emoji: "🎵", en: "Bhajan Sandhya", hi: "भजन संध्या" },
  { emoji: "📿", en: "Satsang", hi: "सत्संग" },
  { emoji: "🔥", en: "Jagran", hi: "जागरण" },
  { emoji: "🕉️", en: "Path / Katha", hi: "पाठ / कथा" },
  { emoji: "🎉", en: "Festival", hi: "उत्सव" },
  { emoji: "📅", en: "Other", hi: "अन्य" },
];

function Field({
  label,
  required,
  children,
}: {
  label: string;
  required?: boolean;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-1.5 text-left min-w-0 w-full">
      <label className="text-xs font-bold text-[#651317] dark:text-amber-200 flex items-center gap-0.5 leading-none">
        {label}
        {required && <span className="text-rose-500 ml-0.5">*</span>}
      </label>
      {children}
    </div>
  );
}

// ── Reusable Deity Selector ──
function DeitySelector({
  selected,
  onSelect,
  chipCls,
  isHi,
}: {
  selected: string;
  onSelect: (v: string) => void;
  chipCls: (active: boolean) => string;
  isHi: boolean;
}) {
  return (
    <div className="flex flex-wrap gap-1.5">
      {DEITY_TAGS.map((d) => {
        const label = `${d.emoji} ${isHi ? d.hi : d.en}`;
        return (
          <button
            key={d.en}
            type="button"
            onClick={() => onSelect(selected === label ? "" : label)}
            className={chipCls(selected === label)}
          >
            {label}
          </button>
        );
      })}
    </div>
  );
}

export function CreatePostDialog({
  open,
  onOpenChange,
  isHi,
  postType,
  setPostType,
  postTitle,
  setPostTitle,
  postContent,
  setPostContent,
  postImagePreview,
  postYoutubeUrl,
  setPostYoutubeUrl,
  pollOptions,
  setPollOptions,
  eventDate,
  setEventDate,
  eventTime,
  setEventTime,
  postLocation,
  setPostLocation,
  eventLinkedBhajan,
  setEventLinkedBhajan,
  myBhajans,
  publishingPost,
  handleImageChange,
  onCroppedImageReady,
  onRemoveImage,
  onSubmit,
}: CreatePostDialogProps) {
  // ── Local UI state for enhanced fields ──
  const [selectedMood, setSelectedMood] = useState("");
  const [selectedTopic, setSelectedTopic] = useState("");
  const [selectedDeity, setSelectedDeity] = useState("");
  const [scriptureRef, setScriptureRef] = useState("");
  const [singerName, setSingerName] = useState("");
  const [raagTaal, setRaagTaal] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [selectedUrgency, setSelectedUrgency] = useState("");
  const [selectedReward, setSelectedReward] = useState("");
  const [askAnonymously, setAskAnonymously] = useState(false);
  const [selectedEventType, setSelectedEventType] = useState("");
  const [isOnlineEvent, setIsOnlineEvent] = useState(false);
  const [entryFee, setEntryFee] = useState("");
  const [contactInfo, setContactInfo] = useState("");
  const [shlokaTranslation, setShlokaTranslation] = useState("");

  // Reset local state when modal closes
  useEffect(() => {
    if (!open) {
      setSelectedMood("");
      setSelectedTopic("");
      setSelectedDeity("");
      setScriptureRef("");
      setSingerName("");
      setRaagTaal("");
      setSelectedCategory("");
      setSelectedUrgency("");
      setSelectedReward("");
      setAskAnonymously(false);
      setSelectedEventType("");
      setIsOnlineEvent(false);
      setEntryFee("");
      setContactInfo("");
      setShlokaTranslation("");
    }
  }, [open]);

  const fl = (en: string, hi: string) => (isHi ? hi : en);

  const chipCls = (active: boolean) =>
    cn(
      "text-[11px] px-2.5 py-1 rounded-full border transition-all font-semibold cursor-pointer whitespace-nowrap",
      active
        ? "bg-[#651317] text-white border-[#651317] shadow-xs"
        : "bg-white dark:bg-stone-900 border-[#E8D8C4] dark:border-stone-700 text-[#651317] dark:text-amber-300 hover:border-[#651317]/50"
    );

  const inputCls = "h-9 text-sm border-[#E8D8C4] dark:border-stone-700 bg-white dark:bg-stone-900 rounded-xl focus:border-[#651317] focus-visible:ring-0";
  const textareaCls = "w-full min-w-0 text-sm rounded-xl border border-[#E8D8C4] dark:border-stone-700 bg-white dark:bg-stone-900 p-3 focus:border-[#651317] focus:outline-none placeholder:text-stone-400 resize-none dark:text-stone-100 leading-relaxed";

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    let finalContent = postContent.trim();

    if (postType === "shloka") {
      if (!finalContent.startsWith("[SHLOKA]")) {
        finalContent = `[SHLOKA]\n${finalContent}`;
      }
      if (shlokaTranslation.trim() && !finalContent.includes("📖 भावार्थ") && !finalContent.includes("📖 अर्थ")) {
        finalContent = `${finalContent}\n\n📖 भावार्थ / Meaning:\n${shlokaTranslation.trim()}`;
      }
      setPostContent(finalContent);
    } else if (postType === "bhajan_share" && singerName.trim()) {
      if (!postContent.includes("🎤 गायक") && !postContent.includes("Singer:")) {
        finalContent = `${finalContent}\n\n🎤 गायक / Singer: ${singerName.trim()}`;
        setPostContent(finalContent);
      }
    }

    onSubmit(e);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-[calc(100vw-24px)] sm:w-full max-w-lg sm:max-w-xl bg-[#FFFDF8] dark:bg-[#120F0B] border border-[#E8D8C4] dark:border-stone-800 text-stone-900 dark:text-stone-50 rounded-2xl sm:rounded-3xl p-5 sm:p-6 max-h-[90vh] overflow-y-auto overflow-x-hidden [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden shadow-2xl">
        <DialogHeader className="pb-3 border-b border-[#E8D8C4]/60 dark:border-stone-800 text-center sm:text-center">
          <DialogTitle className="font-display font-bold text-lg sm:text-xl text-[#651317] dark:text-amber-100 text-center">
            {isHi ? "भक्तिमय पोस्ट बनाएं" : "Create Devotional Post"}
          </DialogTitle>
          <DialogDescription className="text-center text-xs text-[#8C7A6B] dark:text-stone-400 mt-1">
            {isHi ? "पोस्ट का प्रकार चुनें और विवरण भरें" : "Choose post type and fill in the details"}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 pt-1">
          {/* Post Type Selector — 6 tabs */}
          <div className="grid grid-cols-6 gap-1 p-1.5 bg-[#FAF6EE] dark:bg-stone-900/80 rounded-2xl border border-[#E8D8C4]/60 dark:border-stone-800">
            {POST_TYPES.map((type) => {
              const active = postType === type.id;
              return (
                <button
                  key={type.id}
                  type="button"
                  onClick={() => setPostType(type.id as any)}
                  className={cn(
                    "min-w-0 flex flex-col items-center justify-center py-2 px-0.5 rounded-xl transition-all text-center select-none cursor-pointer",
                    active
                      ? "bg-[#651317] text-white shadow-xs font-bold scale-[1.02]"
                      : "text-[#651317] dark:text-amber-200 hover:bg-[#FAF0E4] dark:hover:bg-stone-800 font-medium"
                  )}
                >
                  <span className="text-base leading-none mb-0.5">{type.emoji}</span>
                  <span className="text-[10px] sm:text-[11px] truncate w-full px-0.5 block leading-tight font-semibold">
                    {isHi ? type.labelHi : type.label}
                  </span>
                </button>
              );
            })}
          </div>

          <form 
            onSubmit={handleFormSubmit} 
            onKeyDown={(e) => {
              // Prevent accidental submit when pressing Enter on inputs
              if (e.key === "Enter" && (e.target as HTMLElement).tagName !== "TEXTAREA") {
                e.preventDefault();
              }
            }}
            className="space-y-3"
          >
            {/* ══════════════════════════════════════════════
                ── 1. THOUGHT TAB ──
               ══════════════════════════════════════════════ */}
            {postType === "thought" && (
              <>
                <Field label={fl("Your Devotional Thought", "अपने विचार लिखें")} required>
                  <textarea
                    rows={3}
                    value={postContent}
                    onChange={(e) => setPostContent(e.target.value)}
                    required
                    placeholder={fl(
                      "Share a devotional thought, reflection, or quote…",
                      "भक्ति, भजन या आज का विचार साझा करें…"
                    )}
                    className={textareaCls + " focus:ring-1 focus:ring-[#651317]/20"}
                  />
                </Field>

                {/* Topic Tags */}
                <Field label={fl("Topic (optional)", "विषय चुनें (वैकल्पिक)")}>
                  <div className="flex flex-wrap gap-1.5">
                    {TOPIC_TAGS.map((tag) => {
                      const label = `${tag.emoji} ${isHi ? tag.hi : tag.en}`;
                      return (
                        <button
                          key={tag.en}
                          type="button"
                          onClick={() => setSelectedTopic(selectedTopic === label ? "" : label)}
                          className={chipCls(selectedTopic === label)}
                        >
                          {label}
                        </button>
                      );
                    })}
                  </div>
                </Field>

                {/* Mood Tags */}
                <Field label={fl("Mood / Feeling (optional)", "भाव चुनें (वैकल्पिक)")}>
                  <div className="flex flex-wrap gap-1.5">
                    {MOOD_TAGS.map((tag) => {
                      const label = `${tag.emoji} ${isHi ? tag.hi : tag.en}`;
                      return (
                        <button
                          key={tag.en}
                          type="button"
                          onClick={() => setSelectedMood(selectedMood === label ? "" : label)}
                          className={chipCls(selectedMood === label)}
                        >
                          {label}
                        </button>
                      );
                    })}
                  </div>
                </Field>

                {/* Deity Tag */}
                <Field label={fl("Related Deity (optional)", "संबंधित देवता (वैकल्पिक)")}>
                  <DeitySelector selected={selectedDeity} onSelect={setSelectedDeity} chipCls={chipCls} isHi={isHi} />
                </Field>

                {/* Scripture Reference */}
                <Field label={fl("Scripture Reference (optional)", "ग्रंथ संदर्भ (वैकल्पिक)")}>
                  <Input
                    type="text"
                    value={scriptureRef}
                    onChange={(e) => setScriptureRef(e.target.value)}
                    placeholder={fl("e.g., Bhagavad Gita 2.47", "जैसे: भगवद् गीता 2.47")}
                    className={inputCls}
                  />
                </Field>

                <ImageAdjuster
                  imageSrc={postImagePreview}
                  onImageChange={handleImageChange}
                  onCroppedImageReady={onCroppedImageReady}
                  onRemoveImage={onRemoveImage}
                  isHi={isHi}
                  label={fl("Add Photo (optional)", "चित्र जोड़ें (वैकल्पिक)")}
                />
              </>
            )}

            {/* ══════════════════════════════════════════════
                ── 2. BHAJAN SHARE TAB ──
               ══════════════════════════════════════════════ */}
            {postType === "bhajan_share" && (
              <>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <Field label={fl("Bhajan Title", "भजन का नाम")} required>
                    <Input
                      placeholder={fl("e.g., Radhey Krishna", "जैसे: राधे कृष्ण राधे कृष्ण")}
                      value={postTitle}
                      onChange={(e) => setPostTitle(e.target.value)}
                      required
                      className={inputCls}
                    />
                  </Field>
                  <Field label={fl("Singer / Artist (optional)", "गायक (वैकल्पिक)")}>
                    <Input
                      placeholder={fl("e.g., Anup Jalota", "जैसे: अनूप जलोटा")}
                      value={singerName}
                      onChange={(e) => setSingerName(e.target.value)}
                      className={inputCls}
                    />
                  </Field>
                </div>

                <Field label={fl("Lyrics / Description", "भजन की पंक्तियाँ या वर्णन")} required>
                  <textarea
                    rows={2}
                    value={postContent}
                    onChange={(e) => setPostContent(e.target.value)}
                    required
                    placeholder={fl("Share lyrics or description…", "भजन की पंक्तियाँ या विवरण लिखें…")}
                    className={textareaCls}
                  />
                </Field>

                {/* Deity Tag */}
                <Field label={fl("Related Deity (optional)", "संबंधित देवता (वैकल्पिक)")}>
                  <DeitySelector selected={selectedDeity} onSelect={setSelectedDeity} chipCls={chipCls} isHi={isHi} />
                </Field>

                {/* Raag / Taal */}
                <Field label={fl("Raag / Taal (optional)", "राग / ताल (वैकल्पिक)")}>
                  <Input
                    placeholder={fl("e.g., Raag Bhairavi, Keherwa Taal", "जैसे: राग भैरवी, कहरवा ताल")}
                    value={raagTaal}
                    onChange={(e) => setRaagTaal(e.target.value)}
                    className={inputCls}
                  />
                </Field>

                <Field label={fl("YouTube Link (optional)", "यूट्यूब लिंक (वैकल्पिक)")}>
                  <Input
                    type="url"
                    value={postYoutubeUrl}
                    onChange={(e) => setPostYoutubeUrl(e.target.value)}
                    placeholder="https://youtube.com/watch?v=..."
                    className={inputCls}
                  />
                </Field>

                <ImageAdjuster
                  imageSrc={postImagePreview}
                  onImageChange={handleImageChange}
                  onCroppedImageReady={onCroppedImageReady}
                  onRemoveImage={onRemoveImage}
                  isHi={isHi}
                  label={fl("Add Photo (optional)", "चित्र जोड़ें (वैकल्पिक)")}
                />
              </>
            )}

            {/* ══════════════════════════════════════════════
                ── 3. BHAJAN REQUEST TAB ──
               ══════════════════════════════════════════════ */}
            {postType === "bhajan_request" && (
              <>
                <Field label={fl("Bhajan Name (what you remember)", "भजन का नाम जो याद हो")} required>
                  <Input
                    placeholder={fl(
                      "e.g., A bhajan with the word 'Radhey'…",
                      "जैसे: कोई भजन जिसमें 'राधे' आता हो…"
                    )}
                    value={postTitle}
                    onChange={(e) => setPostTitle(e.target.value)}
                    required
                    className={inputCls}
                  />
                </Field>

                <Field label={fl("Hints — singer, style, or any line", "संकेत — गायक, धुन या कोई पंक्ति")} required>
                  <textarea
                    rows={2}
                    value={postContent}
                    onChange={(e) => setPostContent(e.target.value)}
                    required
                    placeholder={fl(
                      "e.g., Slow tempo, female singer, mentions Vrindavan…",
                      "जैसे: धीमी ताल में था, महिला गायिका थीं…"
                    )}
                    className={textareaCls}
                  />
                </Field>

                {/* Deity Tag */}
                <Field label={fl("Related Deity (optional)", "संबंधित देवता (वैकल्पिक)")}>
                  <DeitySelector selected={selectedDeity} onSelect={setSelectedDeity} chipCls={chipCls} isHi={isHi} />
                </Field>

                <Field label={fl("How soon do you need it?", "कितनी जल्दी चाहिए?")}>
                  <div className="flex flex-wrap gap-1.5">
                    {URGENCY_TAGS.map((tag) => {
                      const label = `${tag.emoji} ${isHi ? tag.hi : tag.en}`;
                      return (
                        <button
                          key={tag.en}
                          type="button"
                          onClick={() => setSelectedUrgency(selectedUrgency === label ? "" : label)}
                          className={chipCls(selectedUrgency === label)}
                        >
                          {label}
                        </button>
                      );
                    })}
                  </div>
                </Field>

                {/* Need Badge */}
                <Field label={fl("What do you need?", "आपको क्या चाहिए?")}>
                  <div className="flex flex-wrap gap-1.5">
                    {REWARD_TAGS.map((tag) => {
                      const label = `${tag.emoji} ${isHi ? tag.hi : tag.en}`;
                      return (
                        <button
                          key={tag.en}
                          type="button"
                          onClick={() => setSelectedReward(selectedReward === label ? "" : label)}
                          className={chipCls(selectedReward === label)}
                        >
                          {label}
                        </button>
                      );
                    })}
                  </div>
                </Field>

                <ImageAdjuster
                  imageSrc={postImagePreview}
                  onImageChange={handleImageChange}
                  onCroppedImageReady={onCroppedImageReady}
                  onRemoveImage={onRemoveImage}
                  isHi={isHi}
                  label={fl("Add Screenshot / Photo (optional)", "स्क्रीनशॉट / चित्र जोड़ें (वैकल्पिक)")}
                />
              </>
            )}

            {/* ══════════════════════════════════════════════
                ── 4. QUESTION TAB ──
               ══════════════════════════════════════════════ */}
            {postType === "question" && (
              <>
                <Field label={fl("Your Question", "आपका प्रश्न")} required>
                  <Input
                    placeholder={fl(
                      "e.g., What is the best time for Naam Jap?",
                      "जैसे: नाम जप कब और कैसे करें?"
                    )}
                    value={postTitle}
                    onChange={(e) => setPostTitle(e.target.value)}
                    required
                    className={inputCls}
                  />
                </Field>

                <Field label={fl("More details (optional)", "विस्तार से लिखें (वैकल्पिक)")}>
                  <textarea
                    rows={2}
                    value={postContent}
                    onChange={(e) => setPostContent(e.target.value)}
                    placeholder={fl(
                      "Provide context or background for your question…",
                      "प्रश्न का विवरण या संदर्भ जोड़ें…"
                    )}
                    className={textareaCls}
                  />
                </Field>

                <Field label={fl("Category", "श्रेणी")}>
                  <div className="flex flex-wrap gap-1.5">
                    {Q_CATEGORIES.map((cat) => {
                      const label = `${cat.emoji} ${isHi ? cat.hi : cat.en}`;
                      return (
                        <button
                          key={cat.en}
                          type="button"
                          onClick={() => setSelectedCategory(selectedCategory === label ? "" : label)}
                          className={chipCls(selectedCategory === label)}
                        >
                          {label}
                        </button>
                      );
                    })}
                  </div>
                </Field>

                {/* Deity Context */}
                <Field label={fl("Related Deity (optional)", "संबंधित देवता (वैकल्पिक)")}>
                  <DeitySelector selected={selectedDeity} onSelect={setSelectedDeity} chipCls={chipCls} isHi={isHi} />
                </Field>

                {/* Scripture Reference */}
                <Field label={fl("Scripture Reference (optional)", "ग्रंथ संदर्भ (वैकल्पिक)")}>
                  <Input
                    type="text"
                    value={scriptureRef}
                    onChange={(e) => setScriptureRef(e.target.value)}
                    placeholder={fl("e.g., Ramcharitmanas - Balkand", "जैसे: रामचरितमानस - बालकांड")}
                    className={inputCls}
                  />
                </Field>

                {/* Ask Anonymously toggle */}
                <div className="flex items-center justify-between bg-[#FAF6EE] dark:bg-stone-900/60 rounded-xl border border-[#E8D8C4]/80 dark:border-stone-800 px-3 py-2.5">
                  <div className="flex items-center gap-2">
                    {askAnonymously ? (
                      <EyeOff className="w-4 h-4 text-[#651317] dark:text-amber-300" />
                    ) : (
                      <Eye className="w-4 h-4 text-[#8C7A6B]" />
                    )}
                    <span className="text-xs font-bold text-[#651317] dark:text-amber-200">
                      {fl("Ask Anonymously", "गुमनाम रूप से पूछें")}
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setAskAnonymously(!askAnonymously)}
                    className={cn(
                      "w-10 h-5.5 rounded-full transition-all relative cursor-pointer",
                      askAnonymously ? "bg-[#651317]" : "bg-stone-300 dark:bg-stone-600"
                    )}
                  >
                    <span
                      className={cn(
                        "absolute top-0.5 w-4.5 h-4.5 rounded-full bg-white shadow-xs transition-all",
                        askAnonymously ? "left-[calc(100%-20px)]" : "left-0.5"
                      )}
                    />
                  </button>
                </div>

                {/* Poll Options — up to 6 */}
                <div className="bg-[#FAF6EE] dark:bg-stone-900/60 rounded-2xl border border-[#E8D8C4]/80 dark:border-stone-800 p-3 space-y-2">
                  <span className="text-xs font-bold text-[#651317] dark:text-amber-100 flex items-center gap-1.5">
                    <Tag className="w-3.5 h-3.5" />
                    {fl("Poll Options (optional)", "उत्तर के विकल्प (वैकल्पिक)")}
                  </span>
                  <div className="space-y-2">
                    {pollOptions.map((opt, index) => (
                      <div key={index} className="flex gap-2 min-w-0">
                        <input
                          type="text"
                          placeholder={`${fl("Option", "विकल्प")} ${index + 1}`}
                          value={opt}
                          onChange={(e) => {
                            const updated = [...pollOptions];
                            updated[index] = e.target.value;
                            setPollOptions(updated);
                          }}
                          className="flex-1 min-w-0 h-8 text-xs sm:text-sm rounded-xl border border-[#E8D8C4] dark:border-stone-700 bg-white dark:bg-stone-900 px-3 focus:border-[#651317] focus:outline-none dark:text-stone-200"
                        />
                        {pollOptions.length > 2 && (
                          <button
                            type="button"
                            onClick={() =>
                              setPollOptions(pollOptions.filter((_, idx) => idx !== index))
                            }
                            className="text-rose-500 hover:text-rose-600 text-xs px-2 shrink-0 cursor-pointer font-bold"
                          >
                            ✕
                          </button>
                        )}
                      </div>
                    ))}
                    {pollOptions.length < 6 && (
                      <button
                        type="button"
                        onClick={() => setPollOptions([...pollOptions, ""])}
                        className="text-xs font-bold text-[#651317] dark:text-amber-400 hover:underline block cursor-pointer pt-0.5"
                      >
                        + {fl("Add Option", "विकल्प जोड़ें")}
                      </button>
                    )}
                  </div>
                </div>
              </>
            )}

            {/* ══════════════════════════════════════════════
                ── 5. EVENT TAB ──
               ══════════════════════════════════════════════ */}
            {postType === "event" && (
              <>
                <Field label={fl("Event Title", "कार्यक्रम का नाम")} required>
                  <Input
                    placeholder={fl(
                      "e.g., Shri Krishna Sankirtan & Satsang",
                      "जैसे: श्री कृष्ण संकीर्तन व सत्संग"
                    )}
                    value={postTitle}
                    onChange={(e) => setPostTitle(e.target.value)}
                    required
                    className={inputCls}
                  />
                </Field>

                {/* Event Type chips */}
                <Field label={fl("Event Type", "कार्यक्रम का प्रकार")}>
                  <div className="flex flex-wrap gap-1.5">
                    {EVENT_TYPE_TAGS.map((tag) => {
                      const label = `${tag.emoji} ${isHi ? tag.hi : tag.en}`;
                      return (
                        <button
                          key={tag.en}
                          type="button"
                          onClick={() => setSelectedEventType(selectedEventType === label ? "" : label)}
                          className={chipCls(selectedEventType === label)}
                        >
                          {label}
                        </button>
                      );
                    })}
                  </div>
                </Field>

                <Field label={fl("Description", "विवरण")} required>
                  <textarea
                    rows={2}
                    value={postContent}
                    onChange={(e) => setPostContent(e.target.value)}
                    required
                    placeholder={fl(
                      "Share event details, schedule, or what to expect…",
                      "कार्यक्रम का विवरण और समय सारणी लिखें…"
                    )}
                    className={textareaCls}
                  />
                </Field>

                {/* Date and Time */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <Field label={fl("Date", "तारीख")} required>
                    <Input
                      type="date"
                      value={eventDate}
                      onChange={(e) => setEventDate(e.target.value)}
                      required
                      className={inputCls}
                    />
                  </Field>

                  <Field label={fl("Time", "समय")} required>
                    <Input
                      type="time"
                      value={eventTime}
                      onChange={(e) => setEventTime(e.target.value)}
                      required
                      className={inputCls}
                    />
                  </Field>
                </div>

                {/* Online/Offline toggle */}
                <div className="flex items-center justify-between bg-[#FAF6EE] dark:bg-stone-900/60 rounded-xl border border-[#E8D8C4]/80 dark:border-stone-800 px-3 py-2.5">
                  <span className="text-xs font-bold text-[#651317] dark:text-amber-200">
                    {fl("Online Event (Zoom / Meet / YouTube)", "ऑनलाइन कार्यक्रम (ज़ूम / मीट / यूट्यूब)")}
                  </span>
                  <button
                    type="button"
                    onClick={() => setIsOnlineEvent(!isOnlineEvent)}
                    className={cn(
                      "w-10 h-5.5 rounded-full transition-all relative cursor-pointer",
                      isOnlineEvent ? "bg-[#651317]" : "bg-stone-300 dark:bg-stone-600"
                    )}
                  >
                    <span
                      className={cn(
                        "absolute top-0.5 w-4.5 h-4.5 rounded-full bg-white shadow-xs transition-all",
                        isOnlineEvent ? "left-[calc(100%-20px)]" : "left-0.5"
                      )}
                    />
                  </button>
                </div>

                <Field label={fl(isOnlineEvent ? "Meeting Link" : "Location / Venue", isOnlineEvent ? "मीटिंग लिंक" : "स्थान / मंदिर")} required>
                  <Input
                    type="text"
                    value={postLocation}
                    onChange={(e) => setPostLocation(e.target.value)}
                    required
                    placeholder={fl(
                      isOnlineEvent ? "Zoom / Google Meet / YouTube Live link" : "Temple, hall address or city",
                      isOnlineEvent ? "ज़ूम / गूगल मीट / यूट्यूब लाइव लिंक" : "मंदिर या स्थान का नाम"
                    )}
                    className={inputCls}
                  />
                </Field>

                {/* Entry Fee & Contact */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <Field label={fl("Entry / Dakshina (optional)", "प्रवेश / दक्षिणा (वैकल्पिक)")}>
                    <Input
                      type="text"
                      value={entryFee}
                      onChange={(e) => setEntryFee(e.target.value)}
                      placeholder={fl("Free / ₹100 etc.", "निःशुल्क / ₹100 आदि")}
                      className={inputCls}
                    />
                  </Field>
                  <Field label={fl("Contact / WhatsApp (optional)", "संपर्क / व्हाट्सऐप (वैकल्पिक)")}>
                    <Input
                      type="text"
                      value={contactInfo}
                      onChange={(e) => setContactInfo(e.target.value)}
                      placeholder={fl("Phone or link", "फ़ोन या लिंक")}
                      className={inputCls}
                    />
                  </Field>
                </div>

                <ImageAdjuster
                  imageSrc={postImagePreview}
                  onImageChange={handleImageChange}
                  onCroppedImageReady={onCroppedImageReady}
                  onRemoveImage={onRemoveImage}
                  isHi={isHi}
                  label={fl("Event Poster (optional)", "कार्यक्रम पोस्टर (वैकल्पिक)")}
                />

                {myBhajans.length > 0 && (
                  <Field
                    label={fl(
                      "Attach a Bhajan (optional)",
                      "पुस्तकालय से भजन जोड़ें (वैकल्पिक)"
                    )}
                  >
                    <select
                      value={eventLinkedBhajan || ""}
                      onChange={(e) =>
                        setEventLinkedBhajan(e.target.value ? Number(e.target.value) : null)
                      }
                      className="w-full min-w-0 h-9 px-3 text-sm rounded-xl border border-[#E8D8C4] dark:border-stone-700 bg-white dark:bg-stone-900 focus:border-[#651317] focus:outline-none dark:text-stone-200"
                    >
                      <option value="">— {isHi ? "कोई नहीं" : "None"} —</option>
                      {myBhajans.map((b) => (
                        <option key={b.id} value={b.id}>
                          {b.title} ({b.singer_name})
                        </option>
                      ))}
                    </select>
                  </Field>
                )}
              </>
            )}

            {/* ══════════════════════════════════════════════
                ── 6. NEW: SHLOKA / MANTRA TAB ──
               ══════════════════════════════════════════════ */}
            {postType === "shloka" && (
              <>
                <Field label={fl("Shloka / Mantra Text", "श्लोक / मंत्र")} required>
                  <textarea
                    rows={3}
                    value={postContent}
                    onChange={(e) => setPostContent(e.target.value)}
                    required
                    placeholder={fl(
                      "कर्मण्येवाधिकारस्ते मा फलेषु कदाचन…\nPaste or type the shloka / mantra here…",
                      "कर्मण्येवाधिकारस्ते मा फलेषु कदाचन…\nश्लोक या मंत्र यहाँ लिखें…"
                    )}
                    className={textareaCls + " font-serif text-sm sm:text-base"}
                  />
                </Field>

                <Field label={fl("Translation / Meaning (optional)", "भावार्थ / अर्थ (वैकल्पिक)")}>
                  <textarea
                    rows={2}
                    value={shlokaTranslation}
                    onChange={(e) => setShlokaTranslation(e.target.value)}
                    placeholder={fl(
                      "Share the meaning in simple words…",
                      "सरल शब्दों में भावार्थ लिखें…"
                    )}
                    className={textareaCls}
                  />
                </Field>

                <Field label={fl("Source / Scripture", "स्रोत / ग्रंथ")} required>
                  <Input
                    type="text"
                    value={postTitle}
                    onChange={(e) => setPostTitle(e.target.value)}
                    required
                    placeholder={fl(
                      "e.g., Bhagavad Gita 2.47, Hanuman Chalisa",
                      "जैसे: भगवद् गीता 2.47, हनुमान चालीसा"
                    )}
                    className={inputCls}
                  />
                </Field>

                {/* Deity Tag */}
                <Field label={fl("Related Deity (optional)", "संबंधित देवता (वैकल्पिक)")}>
                  <DeitySelector selected={selectedDeity} onSelect={setSelectedDeity} chipCls={chipCls} isHi={isHi} />
                </Field>

                <ImageAdjuster
                  imageSrc={postImagePreview}
                  onImageChange={handleImageChange}
                  onCroppedImageReady={onCroppedImageReady}
                  onRemoveImage={onRemoveImage}
                  isHi={isHi}
                  label={fl("Add Calligraphy / Photo (optional)", "सुलेख / चित्र जोड़ें (वैकल्पिक)")}
                />
              </>
            )}

            {/* ── Actions ── */}
            <div className="flex gap-2.5 pt-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
                className="flex-1 h-9.5 sm:h-10 rounded-full border-[#E8D8C4] dark:border-stone-700 text-[#651317] dark:text-stone-300 font-bold text-xs sm:text-sm hover:bg-[#FAF0E4] cursor-pointer"
              >
                {isHi ? "रद्द करें" : "Cancel"}
              </Button>
              <Button
                type="submit"
                disabled={publishingPost}
                className="flex-1 h-9.5 sm:h-10 rounded-full bg-[#651317] hover:bg-[#4f0f12] text-white font-bold text-xs sm:text-sm shadow-xs transition-all active:scale-95 cursor-pointer"
              >
                {publishingPost
                  ? isHi
                    ? "प्रकाशित हो रहा…"
                    : "Publishing…"
                  : isHi
                  ? "प्रकाशित करें"
                  : "Publish"}
              </Button>
            </div>
          </form>
        </div>
      </DialogContent>
    </Dialog>
  );
}

export default CreatePostDialog;
