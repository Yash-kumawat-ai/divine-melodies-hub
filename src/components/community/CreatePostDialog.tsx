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

import React, { useState, useEffect, useMemo } from "react";
import { Eye, EyeOff, Tag, Calendar as CalendarIcon, Clock, MapPin, Wifi, Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { format, addDays } from "date-fns";
import { ImageAdjuster } from "@/components/community/ImageAdjuster";
import { cn } from "@/lib/utils";

/** Parse "HH:mm" (24h) into 12-hour parts */
function parseEventTimeParts(time24: string): { hour12: number; minute: number; period: "AM" | "PM" } {
  const [hStr = "17", mStr = "00"] = (time24 || "17:00").split(":");
  let h = Math.min(23, Math.max(0, parseInt(hStr, 10) || 0));
  const minute = Math.min(59, Math.max(0, parseInt(mStr, 10) || 0));
  const period: "AM" | "PM" = h >= 12 ? "PM" : "AM";
  let hour12 = h % 12;
  if (hour12 === 0) hour12 = 12;
  return { hour12, minute, period };
}

/** Build "HH:mm" (24h) from 12-hour parts */
function toEventTime24(hour12: number, minute: number, period: "AM" | "PM"): string {
  let h = hour12 % 12;
  if (period === "PM") h += 12;
  return `${String(h).padStart(2, "0")}:${String(minute).padStart(2, "0")}`;
}

function isOtherChip(label: string) {
  return /Other|अन्य/i.test(label || "");
}

function resolveChipValue(selected: string, otherName: string) {
  if (!selected) return "";
  if (isOtherChip(selected) && otherName.trim()) {
    return otherName.trim();
  }
  return selected;
}

type CustomField = { id: string; label: string; value: string };

function makeCustomField(): CustomField {
  return {
    id: `cf-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    label: "",
    value: "",
  };
}

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
  onSubmit: (e: React.FormEvent, overrides?: { content?: string; location?: string }) => void;
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
  { emoji: "💫", en: "Other", hi: "अन्य" },
];

const TOPIC_TAGS = [
  { emoji: "🌅", en: "Morning Thought", hi: "प्रातः विचार" },
  { emoji: "📖", en: "Story / Katha", hi: "कथा / प्रसंग" },
  { emoji: "💭", en: "Reflection", hi: "चिंतन" },
  { emoji: "🙏", en: "Prayer", hi: "प्रार्थना" },
  { emoji: "🪷", en: "Life Lesson", hi: "जीवन सीख" },
  { emoji: "✨", en: "Other", hi: "अन्य" },
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
  { emoji: "✨", en: "Other", hi: "अन्य" },
];

const REWARD_TAGS = [
  { emoji: "📝", en: "Just Need Lyrics", hi: "केवल बोल (Lyrics) चाहिए" },
  { emoji: "🎤", en: "Need Full Audio", hi: "पूरा ऑडियो चाहिए" },
  { emoji: "🏅", en: "Will Credit Singer", hi: "गायक का आभार व्यक्त करेंगे" },
  { emoji: "✨", en: "Other", hi: "अन्य" },
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

function OtherNameInput({
  show,
  value,
  onChange,
  placeholder,
  className,
}: {
  show: boolean;
  value: string;
  onChange: (v: string) => void;
  placeholder: string;
  className: string;
}) {
  if (!show) return null;
  return (
    <Input
      type="text"
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      className={cn(className, "mt-1.5 h-8 text-xs")}
    />
  );
}

// ── Reusable Deity Selector ──
function DeitySelector({
  selected,
  onSelect,
  otherName,
  onOtherNameChange,
  chipCls,
  inputCls,
  isHi,
}: {
  selected: string;
  onSelect: (v: string) => void;
  otherName: string;
  onOtherNameChange: (v: string) => void;
  chipCls: (active: boolean) => string;
  inputCls: string;
  isHi: boolean;
}) {
  return (
    <div className="space-y-0">
      <div className="flex flex-wrap gap-1.5">
        {DEITY_TAGS.map((d) => {
          const label = `${d.emoji} ${isHi ? d.hi : d.en}`;
          return (
            <button
              key={d.en}
              type="button"
              onClick={() => {
                if (selected === label) {
                  onSelect("");
                  onOtherNameChange("");
                } else {
                  onSelect(label);
                  if (!isOtherChip(label)) onOtherNameChange("");
                }
              }}
              className={chipCls(selected === label)}
            >
              {label}
            </button>
          );
        })}
      </div>
      <OtherNameInput
        show={isOtherChip(selected)}
        value={otherName}
        onChange={onOtherNameChange}
        placeholder={isHi ? "अन्य देवता का नाम लिखें…" : "Write other deity name…"}
        className={inputCls}
      />
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
  const [isOnlineEvent, setIsOnlineEvent] = useState(false); // Offline by default
  const [entryFee, setEntryFee] = useState("");
  const [contactInfo, setContactInfo] = useState("");
  const [shlokaTranslation, setShlokaTranslation] = useState("");
  const [otherDeityName, setOtherDeityName] = useState("");
  const [otherTopicName, setOtherTopicName] = useState("");
  const [otherMoodName, setOtherMoodName] = useState("");
  const [otherCategoryName, setOtherCategoryName] = useState("");
  const [otherUrgencyName, setOtherUrgencyName] = useState("");
  const [otherRewardName, setOtherRewardName] = useState("");
  const [otherEventTypeName, setOtherEventTypeName] = useState("");
  const [customFields, setCustomFields] = useState<CustomField[]>([]);

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
      setIsOnlineEvent(false); // Offline default
      setEntryFee("");
      setContactInfo("");
      setShlokaTranslation("");
      setOtherDeityName("");
      setOtherTopicName("");
      setOtherMoodName("");
      setOtherCategoryName("");
      setOtherUrgencyName("");
      setOtherRewardName("");
      setOtherEventTypeName("");
      setCustomFields([]);
    }
  }, [open]);

  // Clear custom extras when switching post type (keep form focused)
  useEffect(() => {
    setCustomFields([]);
  }, [postType]);

  // Default event time when switching to event type
  useEffect(() => {
    if (open && postType === "event" && !eventTime) {
      setEventTime("17:00");
    }
  }, [open, postType, eventTime, setEventTime]);

  const fl = (en: string, hi: string) => (isHi ? hi : en);

  const timeParts = useMemo(() => parseEventTimeParts(eventTime || "17:00"), [eventTime]);

  const setTimeFromParts = (hour12: number, minute: number, period: "AM" | "PM") => {
    setEventTime(toEventTime24(hour12, minute, period));
  };

  const todayStr = format(new Date(), "yyyy-MM-dd");

  const chipCls = (active: boolean) =>
    cn(
      "text-[11px] px-2.5 py-1 rounded-full border transition-all font-semibold cursor-pointer whitespace-nowrap",
      active
        ? "bg-[#651317] text-white border-[#651317] shadow-xs"
        : "bg-white dark:bg-stone-900 border-[#E8D8C4] dark:border-stone-700 text-[#651317] dark:text-amber-300 hover:border-[#651317]/50"
    );

  const inputCls = "h-9 text-sm border-[#E8D8C4] dark:border-stone-700 bg-white dark:bg-stone-900 rounded-xl focus:border-[#651317] focus-visible:ring-0";
  const textareaCls = "w-full min-w-0 text-sm rounded-xl border border-[#E8D8C4] dark:border-stone-700 bg-white dark:bg-stone-900 p-3 focus:border-[#651317] focus:outline-none placeholder:text-stone-400 resize-none dark:text-stone-100 leading-relaxed";

  const updateCustomField = (id: string, key: "label" | "value", val: string) => {
    setCustomFields((prev) => prev.map((f) => (f.id === id ? { ...f, [key]: val } : f)));
  };

  const removeCustomField = (id: string) => {
    setCustomFields((prev) => prev.filter((f) => f.id !== id));
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    let finalContent = postContent.trim();
    let finalLocation = postLocation;

    const deityVal = resolveChipValue(selectedDeity, otherDeityName);
    const topicVal = resolveChipValue(selectedTopic, otherTopicName);
    const moodVal = resolveChipValue(selectedMood, otherMoodName);
    const categoryVal = resolveChipValue(selectedCategory, otherCategoryName);
    const urgencyVal = resolveChipValue(selectedUrgency, otherUrgencyName);
    const rewardVal = resolveChipValue(selectedReward, otherRewardName);
    const eventTypeVal = resolveChipValue(selectedEventType, otherEventTypeName);

    const meta: string[] = [];
    if (topicVal) meta.push(isHi ? `📌 विषय: ${topicVal}` : `📌 Topic: ${topicVal}`);
    if (moodVal) meta.push(isHi ? `💭 भाव: ${moodVal}` : `💭 Mood: ${moodVal}`);
    if (deityVal) meta.push(isHi ? `🙏 देवता: ${deityVal}` : `🙏 Deity: ${deityVal}`);
    if (categoryVal) meta.push(isHi ? `🏷 श्रेणी: ${categoryVal}` : `🏷 Category: ${categoryVal}`);
    if (urgencyVal) meta.push(isHi ? `⏰ आवश्यकता: ${urgencyVal}` : `⏰ Urgency: ${urgencyVal}`);
    if (rewardVal) meta.push(isHi ? `🎁 आवश्यकता प्रकार: ${rewardVal}` : `🎁 Need: ${rewardVal}`);
    if (scriptureRef.trim()) meta.push(isHi ? `📖 संदर्भ: ${scriptureRef.trim()}` : `📖 Scripture: ${scriptureRef.trim()}`);
    if (raagTaal.trim()) meta.push(isHi ? `🎵 राग/ताल: ${raagTaal.trim()}` : `🎵 Raag/Taal: ${raagTaal.trim()}`);
    if (askAnonymously) meta.push(isHi ? "🕵️ गुमनाम प्रश्न" : "🕵️ Asked anonymously");

    if (postType === "shloka") {
      if (!finalContent.startsWith("[SHLOKA]")) {
        finalContent = `[SHLOKA]\n${finalContent}`;
      }
      if (shlokaTranslation.trim() && !finalContent.includes("📖 भावार्थ") && !finalContent.includes("📖 अर्थ")) {
        finalContent = `${finalContent}\n\n📖 भावार्थ / Meaning:\n${shlokaTranslation.trim()}`;
      }
    } else if (postType === "bhajan_share" && singerName.trim()) {
      if (!finalContent.includes("🎤 गायक") && !finalContent.includes("Singer:")) {
        finalContent = `${finalContent}\n\n🎤 गायक / Singer: ${singerName.trim()}`;
      }
    } else if (postType === "event") {
      const extras: string[] = [];
      if (eventTypeVal) extras.push(`🏷 ${eventTypeVal}`);
      extras.push(isOnlineEvent ? (isHi ? "🌐 ऑनलाइन कार्यक्रम" : "🌐 Online Event") : (isHi ? "📍 ऑफ़लाइन कार्यक्रम" : "📍 Offline Event"));
      if (entryFee.trim()) extras.push(isHi ? `🙏 दक्षिणा: ${entryFee.trim()}` : `🙏 Dakshina: ${entryFee.trim()}`);
      if (contactInfo.trim()) extras.push(isHi ? `📞 संपर्क: ${contactInfo.trim()}` : `📞 Contact: ${contactInfo.trim()}`);
      if (extras.length) {
        finalContent = `${finalContent}\n\n${extras.join("\n")}`;
      }
      if (isOnlineEvent && finalLocation.trim() && !/online|zoom|meet|youtube|virtual/i.test(finalLocation)) {
        finalLocation = `Online · ${finalLocation.trim()}`;
      }
    }

    if (meta.length) {
      finalContent = `${finalContent}\n\n${meta.join("\n")}`;
    }

    const filledCustom = customFields.filter((f) => f.label.trim() && f.value.trim());
    if (filledCustom.length) {
      const lines = filledCustom.map((f) => `• ${f.label.trim()}: ${f.value.trim()}`);
      finalContent = `${finalContent}\n\n${isHi ? "➕ अतिरिक्त जानकारी" : "➕ Extra details"}\n${lines.join("\n")}`;
    }

    onSubmit(e, { content: finalContent, location: finalLocation });
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
                  <div className="space-y-0">
                    <div className="flex flex-wrap gap-1.5">
                      {TOPIC_TAGS.map((tag) => {
                        const label = `${tag.emoji} ${isHi ? tag.hi : tag.en}`;
                        return (
                          <button
                            key={tag.en}
                            type="button"
                            onClick={() => {
                              if (selectedTopic === label) {
                                setSelectedTopic("");
                                setOtherTopicName("");
                              } else {
                                setSelectedTopic(label);
                                if (!isOtherChip(label)) setOtherTopicName("");
                              }
                            }}
                            className={chipCls(selectedTopic === label)}
                          >
                            {label}
                          </button>
                        );
                      })}
                    </div>
                    <OtherNameInput
                      show={isOtherChip(selectedTopic)}
                      value={otherTopicName}
                      onChange={setOtherTopicName}
                      placeholder={fl("Write other topic…", "अन्य विषय लिखें…")}
                      className={inputCls}
                    />
                  </div>
                </Field>

                {/* Mood Tags */}
                <Field label={fl("Mood / Feeling (optional)", "भाव चुनें (वैकल्पिक)")}>
                  <div className="space-y-0">
                    <div className="flex flex-wrap gap-1.5">
                      {MOOD_TAGS.map((tag) => {
                        const label = `${tag.emoji} ${isHi ? tag.hi : tag.en}`;
                        return (
                          <button
                            key={tag.en}
                            type="button"
                            onClick={() => {
                              if (selectedMood === label) {
                                setSelectedMood("");
                                setOtherMoodName("");
                              } else {
                                setSelectedMood(label);
                                if (!isOtherChip(label)) setOtherMoodName("");
                              }
                            }}
                            className={chipCls(selectedMood === label)}
                          >
                            {label}
                          </button>
                        );
                      })}
                    </div>
                    <OtherNameInput
                      show={isOtherChip(selectedMood)}
                      value={otherMoodName}
                      onChange={setOtherMoodName}
                      placeholder={fl("Write other mood…", "अन्य भाव लिखें…")}
                      className={inputCls}
                    />
                  </div>
                </Field>

                {/* Deity Tag */}
                <Field label={fl("Related Deity (optional)", "संबंधित देवता (वैकल्पिक)")}>
                  <DeitySelector
                    selected={selectedDeity}
                    onSelect={setSelectedDeity}
                    otherName={otherDeityName}
                    onOtherNameChange={setOtherDeityName}
                    chipCls={chipCls}
                    inputCls={inputCls}
                    isHi={isHi}
                  />
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
                  <DeitySelector
                    selected={selectedDeity}
                    onSelect={setSelectedDeity}
                    otherName={otherDeityName}
                    onOtherNameChange={setOtherDeityName}
                    chipCls={chipCls}
                    inputCls={inputCls}
                    isHi={isHi}
                  />
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
                  <DeitySelector
                    selected={selectedDeity}
                    onSelect={setSelectedDeity}
                    otherName={otherDeityName}
                    onOtherNameChange={setOtherDeityName}
                    chipCls={chipCls}
                    inputCls={inputCls}
                    isHi={isHi}
                  />
                </Field>

                <Field label={fl("How soon do you need it?", "कितनी जल्दी चाहिए?")}>
                  <div className="space-y-0">
                    <div className="flex flex-wrap gap-1.5">
                      {URGENCY_TAGS.map((tag) => {
                        const label = `${tag.emoji} ${isHi ? tag.hi : tag.en}`;
                        return (
                          <button
                            key={tag.en}
                            type="button"
                            onClick={() => {
                              if (selectedUrgency === label) {
                                setSelectedUrgency("");
                                setOtherUrgencyName("");
                              } else {
                                setSelectedUrgency(label);
                                if (!isOtherChip(label)) setOtherUrgencyName("");
                              }
                            }}
                            className={chipCls(selectedUrgency === label)}
                          >
                            {label}
                          </button>
                        );
                      })}
                    </div>
                    <OtherNameInput
                      show={isOtherChip(selectedUrgency)}
                      value={otherUrgencyName}
                      onChange={setOtherUrgencyName}
                      placeholder={fl("Write custom timing…", "अपना समय लिखें…")}
                      className={inputCls}
                    />
                  </div>
                </Field>

                {/* Need Badge */}
                <Field label={fl("What do you need?", "आपको क्या चाहिए?")}>
                  <div className="space-y-0">
                    <div className="flex flex-wrap gap-1.5">
                      {REWARD_TAGS.map((tag) => {
                        const label = `${tag.emoji} ${isHi ? tag.hi : tag.en}`;
                        return (
                          <button
                            key={tag.en}
                            type="button"
                            onClick={() => {
                              if (selectedReward === label) {
                                setSelectedReward("");
                                setOtherRewardName("");
                              } else {
                                setSelectedReward(label);
                                if (!isOtherChip(label)) setOtherRewardName("");
                              }
                            }}
                            className={chipCls(selectedReward === label)}
                          >
                            {label}
                          </button>
                        );
                      })}
                    </div>
                    <OtherNameInput
                      show={isOtherChip(selectedReward)}
                      value={otherRewardName}
                      onChange={setOtherRewardName}
                      placeholder={fl("Write what you need…", "आपको क्या चाहिए लिखें…")}
                      className={inputCls}
                    />
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
                  <div className="space-y-0">
                    <div className="flex flex-wrap gap-1.5">
                      {Q_CATEGORIES.map((cat) => {
                        const label = `${cat.emoji} ${isHi ? cat.hi : cat.en}`;
                        return (
                          <button
                            key={cat.en}
                            type="button"
                            onClick={() => {
                              if (selectedCategory === label) {
                                setSelectedCategory("");
                                setOtherCategoryName("");
                              } else {
                                setSelectedCategory(label);
                                if (!isOtherChip(label)) setOtherCategoryName("");
                              }
                            }}
                            className={chipCls(selectedCategory === label)}
                          >
                            {label}
                          </button>
                        );
                      })}
                    </div>
                    <OtherNameInput
                      show={isOtherChip(selectedCategory)}
                      value={otherCategoryName}
                      onChange={setOtherCategoryName}
                      placeholder={fl("Write other category…", "अन्य श्रेणी लिखें…")}
                      className={inputCls}
                    />
                  </div>
                </Field>

                {/* Deity Context */}
                <Field label={fl("Related Deity (optional)", "संबंधित देवता (वैकल्पिक)")}>
                  <DeitySelector
                    selected={selectedDeity}
                    onSelect={setSelectedDeity}
                    otherName={otherDeityName}
                    onOtherNameChange={setOtherDeityName}
                    chipCls={chipCls}
                    inputCls={inputCls}
                    isHi={isHi}
                  />
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
                  <div className="space-y-0">
                    <div className="flex flex-wrap gap-1.5">
                      {EVENT_TYPE_TAGS.map((tag) => {
                        const label = `${tag.emoji} ${isHi ? tag.hi : tag.en}`;
                        return (
                          <button
                            key={tag.en}
                            type="button"
                            onClick={() => {
                              if (selectedEventType === label) {
                                setSelectedEventType("");
                                setOtherEventTypeName("");
                              } else {
                                setSelectedEventType(label);
                                if (!isOtherChip(label)) setOtherEventTypeName("");
                              }
                            }}
                            className={chipCls(selectedEventType === label)}
                          >
                            {label}
                          </button>
                        );
                      })}
                    </div>
                    <OtherNameInput
                      show={isOtherChip(selectedEventType)}
                      value={otherEventTypeName}
                      onChange={setOtherEventTypeName}
                      placeholder={fl("Write other event type…", "अन्य कार्यक्रम प्रकार लिखें…")}
                      className={inputCls}
                    />
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

                {/* ── Date, Time & Mode ── */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                  {/* Native date picker — works reliably inside Dialog */}
                  <Field label={fl("Event Date", "कार्यक्रम की तारीख")} required>
                    <div className="space-y-2">
                      <div className="relative">
                        <CalendarIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#651317] dark:text-amber-400 pointer-events-none z-[1]" />
                        <Input
                          type="date"
                          value={eventDate}
                          min={todayStr}
                          onChange={(e) => setEventDate(e.target.value)}
                          required
                          className={cn(inputCls, "pl-9 h-11 font-semibold cursor-pointer")}
                        />
                      </div>
                      <div className="flex items-center gap-1.5 flex-wrap">
                        {[
                          { label: fl("Today", "आज"), dateStr: format(new Date(), "yyyy-MM-dd") },
                          { label: fl("Tomorrow", "कल"), dateStr: format(addDays(new Date(), 1), "yyyy-MM-dd") },
                          { label: fl("In 2 Days", "2 दिन बाद"), dateStr: format(addDays(new Date(), 2), "yyyy-MM-dd") },
                          {
                            label: fl("This Sunday", "रविवार"),
                            dateStr: (() => {
                              const now = new Date();
                              const daysUntilSunday = (7 - now.getDay()) % 7 || 7;
                              return format(addDays(now, daysUntilSunday), "yyyy-MM-dd");
                            })(),
                          },
                        ].map((preset) => (
                          <button
                            key={preset.label}
                            type="button"
                            onClick={() => setEventDate(preset.dateStr)}
                            className={cn(
                              "text-[10px] px-2 py-0.5 rounded-md border font-bold transition-all cursor-pointer",
                              eventDate === preset.dateStr
                                ? "bg-[#651317] text-white border-[#651317]"
                                : "bg-[#FAF0E4]/60 dark:bg-[#2B1F14] text-[#7c2d12] dark:text-amber-300 border-[#E8D8C4]/70 dark:border-stone-700 hover:border-[#651317]/50"
                            )}
                          >
                            {preset.label}
                          </button>
                        ))}
                      </div>
                    </div>
                  </Field>

                  {/* Manual time: Hour · Minute · AM/PM */}
                  <Field label={fl("Event Time", "कार्यक्रम का समय")} required>
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <div className="relative flex-1 min-w-0">
                          <Clock className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-[#651317] dark:text-amber-400 pointer-events-none" />
                          <select
                            value={timeParts.hour12}
                            onChange={(e) =>
                              setTimeFromParts(parseInt(e.target.value, 10), timeParts.minute, timeParts.period)
                            }
                            required
                            aria-label={fl("Hour", "घंटा")}
                            className={cn(inputCls, "w-full h-11 pl-8 pr-2 font-bold appearance-none cursor-pointer")}
                          >
                            {Array.from({ length: 12 }, (_, i) => i + 1).map((h) => (
                              <option key={h} value={h}>
                                {String(h).padStart(2, "0")}
                              </option>
                            ))}
                          </select>
                        </div>
                        <span className="text-sm font-black text-[#651317] dark:text-amber-300">:</span>
                        <select
                          value={timeParts.minute}
                          onChange={(e) =>
                            setTimeFromParts(timeParts.hour12, parseInt(e.target.value, 10), timeParts.period)
                          }
                          required
                          aria-label={fl("Minute", "मिनट")}
                          className={cn(inputCls, "flex-1 min-w-0 h-11 px-2 font-bold appearance-none cursor-pointer")}
                        >
                          {Array.from({ length: 60 }, (_, i) => i).map((m) => (
                            <option key={m} value={m}>
                              {String(m).padStart(2, "0")}
                            </option>
                          ))}
                        </select>
                        <div className="flex shrink-0 rounded-xl border border-[#E8D8C4] dark:border-stone-700 overflow-hidden h-11">
                          {(["AM", "PM"] as const).map((p) => (
                            <button
                              key={p}
                              type="button"
                              onClick={() => setTimeFromParts(timeParts.hour12, timeParts.minute, p)}
                              className={cn(
                                "px-2.5 text-[11px] font-extrabold transition-all",
                                timeParts.period === p
                                  ? "bg-[#651317] text-white"
                                  : "bg-white dark:bg-stone-900 text-[#651317] dark:text-amber-300 hover:bg-[#FAF0E4]"
                              )}
                            >
                              {p}
                            </button>
                          ))}
                        </div>
                      </div>

                      <div className="flex items-center gap-1.5 flex-wrap">
                        {[
                          { label: fl("06:00 AM", "06:00 AM"), time: "06:00" },
                          { label: fl("09:00 AM", "09:00 AM"), time: "09:00" },
                          { label: fl("05:00 PM", "05:00 PM"), time: "17:00" },
                          { label: fl("07:00 PM", "07:00 PM"), time: "19:00" },
                          { label: fl("08:30 PM", "08:30 PM"), time: "20:30" },
                        ].map((slot) => (
                          <button
                            key={slot.time}
                            type="button"
                            onClick={() => setEventTime(slot.time)}
                            className={cn(
                              "text-[10px] px-2 py-0.5 rounded-md border font-bold transition-all cursor-pointer",
                              eventTime === slot.time
                                ? "bg-[#651317] text-white border-[#651317]"
                                : "bg-[#FAF0E4]/60 dark:bg-[#2B1F14] text-[#7c2d12] dark:text-amber-300 border-[#E8D8C4]/70 dark:border-stone-700 hover:border-[#651317]/50"
                            )}
                          >
                            {slot.label}
                          </button>
                        ))}
                      </div>
                    </div>
                  </Field>
                </div>

                {/* Offline / Online — Offline selected by default */}
                <div className="space-y-1.5">
                  <p className="text-[11px] font-bold text-[#651317] dark:text-amber-200">
                    {fl("Program Mode", "कार्यक्रम का प्रकार")} *
                  </p>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => setIsOnlineEvent(false)}
                      className={cn(
                        "flex items-center justify-center gap-2 h-11 rounded-xl border text-xs font-bold transition-all",
                        !isOnlineEvent
                          ? "bg-[#651317] text-white border-[#651317] shadow-xs"
                          : "bg-white dark:bg-stone-900 border-[#E8D8C4] dark:border-stone-700 text-[#651317] dark:text-amber-300 hover:border-[#651317]/50"
                      )}
                    >
                      <MapPin className="w-3.5 h-3.5" />
                      {fl("Offline", "ऑफ़लाइन")}
                    </button>
                    <button
                      type="button"
                      onClick={() => setIsOnlineEvent(true)}
                      className={cn(
                        "flex items-center justify-center gap-2 h-11 rounded-xl border text-xs font-bold transition-all",
                        isOnlineEvent
                          ? "bg-[#651317] text-white border-[#651317] shadow-xs"
                          : "bg-white dark:bg-stone-900 border-[#E8D8C4] dark:border-stone-700 text-[#651317] dark:text-amber-300 hover:border-[#651317]/50"
                      )}
                    >
                      <Wifi className="w-3.5 h-3.5" />
                      {fl("Online", "ऑनलाइन")}
                    </button>
                  </div>
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
                  <DeitySelector
                    selected={selectedDeity}
                    onSelect={setSelectedDeity}
                    otherName={otherDeityName}
                    onOtherNameChange={setOtherDeityName}
                    chipCls={chipCls}
                    inputCls={inputCls}
                    isHi={isHi}
                  />
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

            {/* ── Add more custom details (all post types) ── */}
            <div className="rounded-2xl border border-dashed border-[#E8D8C4] dark:border-stone-700 bg-[#FAF6EE]/50 dark:bg-stone-900/40 p-3 space-y-2.5">
              <div className="flex items-center justify-between gap-2">
                <div className="text-left min-w-0">
                  <p className="text-xs font-bold text-[#651317] dark:text-amber-200">
                    {fl("Add more details", "और जानकारी जोड़ें")}
                  </p>
                  <p className="text-[10px] text-stone-500 dark:text-stone-400 mt-0.5 leading-snug">
                    {fl(
                      "Add any extra field helpful for devotees (e.g. Temple name, WhatsApp group, dress code).",
                      "भक्तों के लिए कोई अतिरिक्त जानकारी जोड़ें (जैसे मंदिर का नाम, व्हाट्सऐप ग्रुप)।"
                    )}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setCustomFields((prev) => [...prev, makeCustomField()])}
                  className="shrink-0 inline-flex items-center gap-1 h-8 px-2.5 rounded-full bg-[#651317] text-white text-[11px] font-bold active:scale-95 transition-all"
                >
                  <Plus className="w-3.5 h-3.5" />
                  {fl("Add more", "जोड़ें")}
                </button>
              </div>

              {customFields.length > 0 && (
                <div className="space-y-2">
                  {customFields.map((field, index) => (
                    <div
                      key={field.id}
                      className="grid grid-cols-[1fr_1fr_auto] gap-1.5 items-start bg-white dark:bg-stone-900/70 border border-[#E8D8C4]/80 dark:border-stone-700 rounded-xl p-2"
                    >
                      <Input
                        type="text"
                        value={field.label}
                        onChange={(e) => updateCustomField(field.id, "label", e.target.value)}
                        placeholder={fl(`Info type ${index + 1}`, `जानकारी प्रकार ${index + 1}`)}
                        className={cn(inputCls, "h-8 text-xs")}
                      />
                      <Input
                        type="text"
                        value={field.value}
                        onChange={(e) => updateCustomField(field.id, "value", e.target.value)}
                        placeholder={fl("Details…", "विवरण…")}
                        className={cn(inputCls, "h-8 text-xs")}
                      />
                      <button
                        type="button"
                        onClick={() => removeCustomField(field.id)}
                        className="h-8 w-8 rounded-lg flex items-center justify-center text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/30"
                        aria-label={fl("Remove", "हटाएँ")}
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

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
