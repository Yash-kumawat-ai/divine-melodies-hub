/**
 * PostCard.tsx
 *
 * Devotional Community Post Card component.
 * Features:
 * - Fixed non-overlapping clean header with avatar, name, badges, and timestamp
 * - High-visibility devotional thought and text styling
 * - Adaptive image presentation with natural aspect ratio (contain/cover) and full darshan lightbox
 * - In-app animated Delete Confirmation Modal (no browser alerts) with strict author ownership
 * - In-app Edit Post Modal (author-only) powered by ImageAdjuster
 * - 4-Action bar: Blessings, Comments, Save, Share
 * - Comments discussion thread with lyrics submission
 */

import { useState, useEffect } from "react";
import { 
  Heart, MessageSquare, Bookmark, Share2, ExternalLink, Trash2, Pencil, Play, ChevronRight, Calendar, MapPin, Send, Loader2, X, ZoomIn
} from "lucide-react";
import { useTheme } from "@/hooks/useTheme";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { type CommunityPost, type PostComment } from "@/lib/community/communityApi";
import { EditPostDialog } from "@/components/community/EditPostDialog";
import { cn } from "@/lib/utils";

// Deity Avatars
import durgaImg from "@/assets/deities/durga.webp";
import ganeshImg from "@/assets/deities/ganesh.webp";
import hanumanImg from "@/assets/deities/hanuman.webp";
import krishnaImg from "@/assets/deities/krishna.webp";
import lakshmiImg from "@/assets/deities/lakshmi.webp";
import ramaImg from "@/assets/deities/rama.webp";
import saiBabaImg from "@/assets/deities/sai-baba.webp";
import shivaImg from "@/assets/deities/shiva.webp";

// Small countdown helper component
export function EventCountdown({ datetime }: { datetime: string }) {
  const [timeLeft, setTimeLeft] = useState<{ days: number; hours: number; mins: number } | null>(null);

  useEffect(() => {
    const calcTime = () => {
      const diff = new Date(datetime).getTime() - Date.now();
      if (diff <= 0) {
        setTimeLeft(null);
        return;
      }
      const days = Math.floor(diff / (1000 * 60 * 60 * 24));
      const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
      const mins = Math.floor((diff / (1000 * 60)) % 60);
      setTimeLeft({ days, hours, mins });
    };

    calcTime();
    const interval = setInterval(calcTime, 60000);
    return () => clearInterval(interval);
  }, [datetime]);

  if (!timeLeft) return null;

  return (
    <span 
      className="inline-flex items-center gap-1 bg-rose-500/10 text-rose-600 dark:text-rose-400 px-2 py-0.5 rounded-full font-bold text-[10px] tracking-wide uppercase select-none border border-rose-500/20"
      aria-live="polite"
    >
      ⏳ {timeLeft.days > 0 ? `${timeLeft.days}d ` : ""}{timeLeft.hours}h {timeLeft.mins}m left
    </span>
  );
}

const POST_TYPE_LABELS: Record<string, { hi: string; en: string }> = {
  bhajan_share: { hi: "भजन", en: "Bhajan" },
  bhajan_request: { hi: "अनुरोध", en: "Request" },
  question: { hi: "प्रश्न", en: "Question" },
  event: { hi: "सत्संग", en: "Event" },
  thought: { hi: "विचार", en: "Thought" },
  shloka: { hi: "श्लोक", en: "Shloka" },
};

export interface PostCardProps {
  post: CommunityPost;
  user: any;
  isHi: boolean;
  variant?: "card" | "feed";
  comments: PostComment[];
  isCommentsExpanded: boolean;
  onToggleComments: (postId: string) => void;
  onToggleReaction: (postId: string) => void;
  onToggleRsvp: (postId: string, currentRsvp: 'interested' | 'going' | null, clickedRsvp: 'interested' | 'going') => void;
  onVoteOption: (postId: string, optionIndex: number) => void;
  onDeleteComment: (postId: string, commentId: string) => void;
  onAddComment: (postId: string) => void;
  onDeletePost: (postId: string) => void;
  onPostUpdated?: () => void;
  newCommentText: string;
  setNewCommentText: (text: string) => void;
  commentIsLyricsSubmit: boolean;
  setCommentIsLyricsSubmit: (val: boolean) => void;
  isLoadingComments?: boolean;
  isPostSaved: boolean;
  onToggleSavePost: (postId: string) => void;
}

export function PostCard({
  post, user, isHi, comments, isCommentsExpanded, onToggleComments, onToggleReaction, onToggleRsvp, onVoteOption, onDeleteComment, onAddComment, onDeletePost, onPostUpdated, newCommentText, setNewCommentText, commentIsLyricsSubmit, setCommentIsLyricsSubmit,
  isLoadingComments = false,
  isPostSaved,
  onToggleSavePost,
}: PostCardProps) {
  const { theme } = useTheme();
  const isDark = theme === "dark";

  // Modals state
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [isContentExpanded, setIsContentExpanded] = useState(false);

  // Author ownership check
  const isAuthor = Boolean(
    user?.id && (user.id === post.author_id || user.id === post.author?.user_id)
  );

  // Check if post is a Shloka
  const isShloka =
    post.type === "shloka" ||
    (post.content && (
      post.content.startsWith("[SHLOKA]") ||
      post.content.includes("📖 भावार्थ") ||
      post.content.includes("📖 अर्थ") ||
      post.content.includes("भावार्थ / Meaning:")
    ));

  const effectiveType = isShloka ? "shloka" : post.type;

  const typeLabel = isHi
    ? (POST_TYPE_LABELS[effectiveType]?.hi || effectiveType)
    : (POST_TYPE_LABELS[effectiveType]?.en || effectiveType.replace("_", " "));
  
  // Format DateTime
  const formatTime = (isoString: string) => {
    const diffMs = new Date().getTime() - new Date(isoString).getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);
    if (diffMins < 1) return isHi ? "अभी" : "just now";
    if (diffMins < 60) return isHi ? `${diffMins}m पहले` : `${diffMins}m ago`;
    if (diffHours < 24) return isHi ? `${diffHours}h पहले` : `${diffHours}h ago`;
    return new Date(isoString).toLocaleDateString();
  };

  const getAuthorBadge = (role?: string) => {
    if (!role) return { label: isHi ? "भक्त" : "Devotee", icon: "🌸", colorClass: "text-[#8C7A6B]" };
    const r = role.toLowerCase();
    if (r.includes("admin") || r.includes("acharya")) return { label: isHi ? "आचार्य" : "Acharya", icon: "🔱", colorClass: "text-[#651317] dark:text-amber-400 font-bold" };
    if (r.includes("mod") || r.includes("satsangi")) return { label: isHi ? "सत्संगी" : "Satsangi", icon: "📿", colorClass: "text-amber-600 dark:text-amber-400" };
    if (r.includes("sadhak")) return { label: isHi ? "साधक" : "Sadhak", icon: "🌿", colorClass: "text-emerald-600 dark:text-emerald-400" };
    return { label: isHi ? "भक्त" : "Devotee", icon: "🌸", colorClass: "text-[#8C7A6B]" };
  };

  const authorBadge = getAuthorBadge(post.author?.role);

  const getDeityImgForPost = (postId: string) => {
    const list = [ramaImg, hanumanImg, krishnaImg, shivaImg, ganeshImg, durgaImg, lakshmiImg, saiBabaImg];
    let num = 0;
    for (let i = 0; i < postId.length; i++) {
      num += postId.charCodeAt(i);
    }
    return list[num % list.length];
  };

  const getStatusBadgeColor = (status: string) => {
    switch (status) {
      case 'open': return 'bg-[#FAF6EE] border-[#E8D8C4] text-[#8C7A6B]';
      case 'lyrics_submitted': return 'bg-blue-50 border-blue-200 text-blue-700 dark:bg-blue-950/40 dark:border-blue-800 dark:text-blue-300';
      case 'in_review': return 'bg-amber-50 border-amber-200 text-amber-700 dark:bg-amber-950/40 dark:border-amber-800 dark:text-amber-300';
      case 'added_to_library': return 'bg-emerald-50 border-emerald-200 text-emerald-700 dark:bg-emerald-950/40 dark:border-emerald-800 dark:text-emerald-300';
      case 'closed_unresolved': return 'bg-rose-50 border-rose-200 text-rose-700 dark:bg-rose-950/40 dark:border-rose-800 dark:text-rose-300';
      default: return 'bg-stone-100 border-stone-200 text-stone-600';
    }
  };

  const highlightSacredText = (text: string) => {
    if (!text) return "";
    const keywords = ["108", "Hanuman Chalisa", "हनुमान चालीसा", "जय श्री राम", "जय श्री कृष्णा", "Jai Shree Ram", "Jai Shri Ram", "Hari Bol", "Hare Krishna", "राधे", "कृष्ण", "राम", "शिव"];
    const escapedKeywords = keywords.map(k => k.replace(/[-/\\^$*+?.()|[\]{}]/g, '\\$&'));
    const regex = new RegExp(`(${escapedKeywords.join('|')})`, 'gi');
    
    const parts = text.split(regex);
    return parts.map((part, index) => {
      const isKeyword = keywords.some(k => k.toLowerCase() === part.toLowerCase());
      if (isKeyword) {
        return <span key={index} className="text-[#651317] dark:text-amber-300 font-bold">{part}</span>;
      }
      return part;
    });
  };

  const handleConfirmDelete = async () => {
    try {
      setIsDeleting(true);
      await onDeletePost(post.id);
      setDeleteModalOpen(false);
    } catch (err) {
      console.error("Delete failed:", err);
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <>
      <div className="w-full rounded-2xl p-4 sm:p-5 bg-[#FFFDF8] dark:bg-[#1A120B] border border-[#E8D8C4] dark:border-stone-800 shadow-xs transition-all hover:border-[#651317]/30 text-left space-y-3">
        {/* ── 1. Post Header (Fixed Non-Overlapping Layout) ── */}
        <div className="flex items-center justify-between gap-2.5">
          <div className="flex items-center gap-2.5 min-w-0 flex-1">
            {/* Avatar */}
            <div className="w-10 h-10 rounded-full overflow-hidden shrink-0 border border-[#E8D8C4] dark:border-stone-700 bg-[#FAF0E4] dark:bg-[#2B1F14] flex items-center justify-center font-bold text-xs text-[#651317] dark:text-amber-300 shadow-2xs">
              {post.author?.avatar_url ? (
                <img src={post.author.avatar_url} alt={post.author.display_name || "author"} className="w-full h-full object-cover" loading="lazy" />
              ) : (
                <span>{(post.author?.display_name || "D")[0]?.toUpperCase()}</span>
              )}
            </div>

            {/* Name & Details (Clean truncation & non-overlapping badges) */}
            <div className="flex flex-col justify-center gap-0.5 min-w-0 flex-1 text-left">
              <div className="flex items-center gap-1.5 min-w-0 leading-snug">
                <span className="font-display font-bold text-xs sm:text-sm text-[#32251E] dark:text-stone-100 truncate block">
                  {post.author?.display_name || (isHi ? "अनाम भक्त" : "Anonymous Devotee")}
                </span>
                <span className="text-xs shrink-0 select-none" title={authorBadge.label}>
                  {authorBadge.icon}
                </span>
                {post.group_name && (
                  <span className="text-[11px] font-semibold text-[#8C7A6B] dark:text-stone-400 truncate shrink-0">
                    {isHi ? "में" : "in"}{" "}
                    <span className="text-[#651317] dark:text-amber-300 font-bold">
                      #{post.group_name}
                    </span>
                  </span>
                )}
              </div>

              <p className="text-[10px] sm:text-[11px] text-[#8C7A6B] dark:text-stone-400 font-medium leading-normal">
                {formatTime(post.created_at)} •{" "}
                <span className={`font-semibold ${authorBadge.colorClass}`}>{authorBadge.label}</span>
              </p>
            </div>
          </div>

          {/* Right: Badge, Edit & Delete Buttons (Author Only) */}
          <div className="flex items-center gap-1.5 shrink-0">
            <span className={cn(
              "text-[9.5px] uppercase font-bold tracking-wider px-2.5 py-0.5 rounded-full border select-none",
              isShloka
                ? "bg-amber-100 dark:bg-amber-950/80 text-amber-900 dark:text-amber-200 border-amber-300 dark:border-amber-800 shadow-2xs"
                : "bg-[#FAF0E4] dark:bg-[#2B1F14] text-[#651317] dark:text-amber-300 border-[#E8D8C4] dark:border-stone-700"
            )}>
              {typeLabel}
            </span>

            {isAuthor && (
              <div className="flex items-center gap-0.5 pl-1">
                {/* Edit Button */}
                <button
                  type="button"
                  onClick={() => setEditModalOpen(true)}
                  className="p-1.5 text-stone-400 hover:text-[#651317] dark:hover:text-amber-300 hover:bg-[#FAF0E4] dark:hover:bg-stone-800 transition-colors rounded-lg cursor-pointer"
                  title={isHi ? "पोस्ट संपादित करें" : "Edit Post"}
                  aria-label="Edit Post"
                >
                  <Pencil className="w-3.5 h-3.5" />
                </button>

                {/* Delete Button */}
                <button
                  type="button"
                  onClick={() => setDeleteModalOpen(true)}
                  className="p-1.5 text-stone-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors rounded-lg cursor-pointer"
                  title={isHi ? "पोस्ट हटाएं" : "Delete Post"}
                  aria-label="Delete Post"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            )}
          </div>
        </div>

        {/* ── 2. Post Title & Devotional Content ── */}
        <div className="space-y-2.5 pt-0.5">
          {post.title && (
            <h3 className="font-display font-bold text-sm sm:text-base text-[#32251E] dark:text-amber-100 leading-snug">
              {post.title}
            </h3>
          )}

          {post.content && (() => {
            if (isShloka) {
              let cleanContent = post.content.replace(/^\[SHLOKA\]\s*/i, '').trim();
              let shlokaPart = cleanContent;
              let meaningPart = "";

              const markers = [
                "📖 भावार्थ / Meaning:", 
                "📖 अर्थ / Translation:", 
                "📖 भावार्थ:", 
                "📖 अर्थ:", 
                "भावार्थ / Meaning:", 
                "अर्थ / Translation:", 
                "भावार्थ:", 
                "अर्थ:"
              ];
              for (const marker of markers) {
                if (cleanContent.includes(marker)) {
                  const parts = cleanContent.split(marker);
                  shlokaPart = parts[0].trim();
                  meaningPart = parts.slice(1).join(marker).trim();
                  break;
                }
              }

              return (
                <div className="space-y-2 text-left">
                  {/* Shloka Card */}
                  <div className="bg-[#FAF6EE] dark:bg-[#1a140d] border border-[#E8D8C4] dark:border-amber-900/40 rounded-2xl p-3.5 sm:p-4 text-center shadow-2xs">
                    <p className="font-serif italic text-base sm:text-lg font-bold text-[#651317] dark:text-amber-200 leading-relaxed whitespace-pre-wrap">
                      {shlokaPart}
                    </p>
                  </div>

                  {/* Meaning Container */}
                  {meaningPart && (
                    <div className="bg-[#FFFDF8] dark:bg-[#15100B] border border-[#E8D8C4]/70 dark:border-stone-800 rounded-xl p-3 space-y-1">
                      <span className="text-xs font-bold text-[#651317] dark:text-amber-400 block tracking-wide">
                        📖 {isHi ? "भावार्थ / अर्थ :" : "Meaning / Translation :"}
                      </span>
                      <p className="text-xs sm:text-sm text-[#32251E] dark:text-stone-200 whitespace-pre-wrap leading-relaxed font-normal">
                        {meaningPart}
                      </p>
                    </div>
                  )}
                </div>
              );
            }

            const isLongContent = Boolean(
              post.content.length > 200 || (post.content.match(/\n/g) || []).length > 3
            );

            return (
              <div className="space-y-1 text-left">
                <p 
                  className={cn(
                    "text-sm sm:text-[15px] text-[#2C1810] dark:text-stone-100 whitespace-pre-wrap leading-relaxed font-normal break-words transition-all",
                    isLongContent && !isContentExpanded && "line-clamp-4 max-h-[110px] overflow-hidden"
                  )}
                >
                  {highlightSacredText(post.content)}
                </p>
                {isLongContent && (
                  <button
                    type="button"
                    onClick={() => setIsContentExpanded(!isContentExpanded)}
                    className="text-xs font-bold text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 hover:underline inline-flex items-center gap-0.5 pt-0.5 cursor-pointer select-none"
                  >
                    {isContentExpanded 
                      ? (isHi ? "कम देखें" : "Show less") 
                      : (isHi ? "...और देखें" : "...Show more")}
                  </button>
                )}
              </div>
            );
          })()}

          {/* ── 3. Image Display (Adaptive Aspect Ratio & Clickable Lightbox) ── */}
          {post.image_url && (
            <div 
              onClick={() => setLightboxOpen(true)}
              className="w-full rounded-2xl overflow-hidden border border-[#E8D8C4]/80 dark:border-stone-800 bg-[#FAF6EE] dark:bg-stone-900/60 max-h-[380px] sm:max-h-[420px] flex items-center justify-center shadow-2xs relative group cursor-pointer"
              title={isHi ? "पूर्ण दर्शन के लिए क्लिक करें" : "Click to view full image"}
            >
              <img 
                src={post.image_url} 
                alt="post visual" 
                className="w-full h-auto max-h-[380px] sm:max-h-[420px] object-contain rounded-2xl group-hover:scale-[1.01] transition-transform duration-200" 
                loading="lazy"
              />
              <div className="absolute top-2.5 right-2.5 bg-black/50 text-white p-1.5 rounded-full opacity-0 group-hover:opacity-100 transition-opacity backdrop-blur-xs">
                <ZoomIn className="w-3.5 h-3.5" />
              </div>
            </div>
          )}

          {/* ── 4. Special Post Type Views ── */}
          {/* Bhajan Share with YouTube */}
          {post.type === 'bhajan_share' && post.youtube_url && (
            <div 
              onClick={() => window.open(post.youtube_url, '_blank')}
              className="rounded-2xl p-3 sm:p-3.5 flex items-center gap-3 w-full cursor-pointer transition-all group shadow-xs select-none border border-[#E8D8C4] dark:border-stone-800 bg-[#FAF6EE]/70 dark:bg-stone-900/80 hover:border-[#651317]/40"
            >
              <div className="w-10 h-10 rounded-xl overflow-hidden shrink-0 flex items-center justify-center border border-[#E8D8C4] bg-[#FAF0E4]">
                <img 
                  src={getDeityImgForPost(post.id)} 
                  alt="deity logo" 
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="min-w-0 flex-1 flex flex-col justify-between text-left">
                <div>
                  <span className="font-bold text-xs sm:text-sm truncate block text-[#32251E] dark:text-stone-100 group-hover:text-[#651317] dark:group-hover:text-amber-300 transition-colors">
                    {post.title || (isHi ? "भजन श्रवण" : "Devotional Melody")}
                  </span>
                  <span className="text-[10px] text-[#8C7A6B] dark:text-stone-400 font-medium block truncate mt-0.5">
                    {isHi ? "यूट्यूब पर सुनें" : "Listen on YouTube"}
                  </span>
                </div>
              </div>
              <button
                className="w-7 h-7 rounded-full bg-[#651317] hover:bg-[#4f0f12] flex items-center justify-center shadow-xs text-white shrink-0 group-hover:scale-105 transition-all"
                aria-label="Play Bhajan"
              >
                <Play className="w-3 h-3 fill-white text-white translate-x-[0.5px]" />
              </button>
            </div>
          )}

          {post.youtube_url && post.type !== 'bhajan_share' && (
            <div className="rounded-xl p-2.5 flex items-center justify-between gap-2.5 max-w-[400px] border border-[#E8D8C4] dark:border-stone-800 bg-[#FAF6EE]/50 dark:bg-stone-900/50">
              <Play className="w-4 h-4 text-[#651317] dark:text-amber-400 shrink-0 ml-0.5" />
              <div className="min-w-0 flex-1">
                <span className="text-[9px] font-bold uppercase tracking-wider block text-[#8C7A6B] dark:text-stone-400">
                  {isHi ? "यूट्यूब लिंक" : "YouTube Link"}
                </span>
                <a 
                  href={post.youtube_url} 
                  target="_blank" 
                  rel="noreferrer" 
                  className="text-xs font-semibold text-[#651317] dark:text-amber-300 block truncate hover:underline"
                >
                  {post.youtube_url}
                </a>
              </div>
              <ExternalLink className="w-3.5 h-3.5 text-[#8C7A6B] shrink-0" />
            </div>
          )}

          {/* Bhajan Request Pipeline */}
          {post.type === 'bhajan_request' && (
            <div className="border border-[#E8D8C4] dark:border-stone-800 rounded-2xl p-3.5 space-y-3 bg-[#FAF6EE]/50 dark:bg-stone-900/40">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-[#651317] dark:text-amber-200">
                  {isHi ? "अनुरोध स्थिति:" : "Request Pipeline:"}
                </span>
                <Badge variant="outline" className={`text-[10px] font-bold capitalize ${getStatusBadgeColor(post.request_status)}`}>
                  {(() => {
                    const statusMap: Record<string, { hi: string, en: string }> = {
                      'open': { hi: 'खुला', en: 'Open' },
                      'lyrics_submitted': { hi: 'उत्तर प्राप्त (लिरिक्स)', en: 'Lyrics Submitted' },
                      'in_review': { hi: 'समीक्षा में', en: 'In Review' },
                      'added_to_library': { hi: 'लाइब्रेरी में शामिल', en: 'Added to Library' },
                      'closed_unresolved': { hi: 'बंद', en: 'Closed Unresolved' }
                    };
                    return isHi ? (statusMap[post.request_status]?.hi || post.request_status) : (statusMap[post.request_status]?.en || post.request_status.replace('_', ' '));
                  })()}
                </Badge>
              </div>

              {post.request_status === 'added_to_library' && (
                <div className="bg-emerald-500/10 border border-emerald-500/20 text-emerald-700 dark:text-emerald-300 text-xs font-bold p-2.5 rounded-xl flex items-center gap-2">
                  <span>🎉</span>
                  <span>
                    {isHi ? "भजन मुख्य लाइब्रेरी में जुड़ गया है!" : "Your request was added to the Library!"}
                  </span>
                  {post.resolved_bhajan_id && (
                    <Link 
                      to={"/bhajan/" + post.resolved_bhajan_id}
                      className="underline text-emerald-600 dark:text-emerald-400 ml-auto flex items-center gap-1 shrink-0"
                    >
                      View <ChevronRight className="w-3.5 h-3.5" />
                    </Link>
                  )}
                </div>
              )}

              <div className="flex items-center justify-between text-[10px] font-bold text-center relative px-2 mb-1 select-none">
                <div className="absolute top-2 left-6 right-6 h-0.5 -z-0 bg-[#E8D8C4] dark:bg-stone-800" />
                {[
                  { status: 'open', label: isHi ? 'खुला' : 'Open' },
                  { status: 'lyrics_submitted', label: isHi ? 'उत्तर' : 'Lyrics' },
                  { status: 'in_review', label: isHi ? 'समीक्षा' : 'Review' },
                  { status: 'added_to_library', label: isHi ? 'लाइब्रेरी' : 'Library' }
                ].map((step) => {
                  const stages = ['open', 'lyrics_submitted', 'in_review', 'added_to_library'];
                  const currentIdx = stages.indexOf(post.request_status);
                  const stepIdx = stages.indexOf(step.status);
                  const isPassed = stepIdx <= currentIdx && post.request_status !== 'closed_unresolved';
                  return (
                    <div key={step.status} className="flex flex-col items-center relative z-10">
                      <div className={`w-4 h-4 rounded-full border flex items-center justify-center text-[7.5px] font-bold ${
                        isPassed 
                          ? "bg-[#651317] border-[#651317] text-white" 
                          : "bg-white dark:bg-stone-900 border-[#E8D8C4] dark:border-stone-700 text-[#8C7A6B]"
                      }`}>
                        {isPassed && "✓"}
                      </div>
                      <span className={`mt-1 text-[9.5px] ${isPassed ? "text-[#651317] dark:text-amber-300 font-bold" : "text-[#8C7A6B] dark:text-stone-500"}`}>
                        {step.label}
                      </span>
                    </div>
                  );
                })}
              </div>

              {post.request_status === 'open' && (
                <Button 
                  onClick={() => onToggleComments(post.id)}
                  className="w-full bg-[#651317] hover:bg-[#4f0f12] text-white text-xs font-bold rounded-xl h-8.5 shadow-xs"
                >
                  📿 {isHi ? "मुझे इस भजन के बोल पता हैं (उत्तर दें)" : "I Know This Bhajan (Submit Lyrics)"}
                </Button>
              )}
            </div>
          )}

          {/* Event details card */}
          {post.type === 'event' && (
            <div className="border border-[#E8D8C4] dark:border-stone-800 rounded-2xl p-3.5 space-y-2.5 bg-[#FAF6EE]/50 dark:bg-stone-900/40">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between text-xs font-bold gap-2 border-b border-[#E8D8C4]/60 dark:border-stone-800 pb-2">
                <span className="flex items-center gap-1.5 text-[#651317] dark:text-amber-300">
                  <Calendar className="w-3.5 h-3.5" />
                  {post.event_datetime 
                    ? new Date(post.event_datetime).toLocaleString(isHi ? 'hi-IN' : 'en-US', { dateStyle: 'medium', timeStyle: 'short' }) 
                    : (isHi ? "तारीख/समय निर्धारित नहीं" : "Date/Time not set")}
                </span>
                <span className="flex items-center gap-1.5 text-[#8C7A6B] dark:text-stone-400">
                  <MapPin className="w-3.5 h-3.5" />
                  {post.event_location || (isHi ? "वर्चुअल ज़ूम" : "Virtual Zoom")}
                </span>
              </div>

              {post.linked_bhajan_id && (
                <div className="p-2.5 rounded-xl border border-[#E8D8C4] dark:border-stone-800 flex items-center justify-between gap-3 bg-white dark:bg-stone-900">
                  <div className="min-w-0 flex-1">
                    <span className="text-[9px] uppercase tracking-wider font-bold text-[#651317] dark:text-amber-300 block">{isHi ? "संबद्ध भजन" : "Linked Bhajan"}</span>
                    <span className="text-xs font-bold truncate block text-[#32251E] dark:text-stone-200">{isHi ? "भजन संदर्भ" : "Bhajan Reference"}</span>
                  </div>
                  <Link 
                    to={"/bhajan/" + post.linked_bhajan_id}
                    className="bg-[#FAF0E4] dark:bg-[#2B1F14] text-[#651317] dark:text-amber-300 text-xs px-2.5 py-1 rounded-lg font-bold flex items-center gap-0.5 hover:scale-98 transition-all shrink-0"
                  >
                    {isHi ? "बोल" : "Lyrics"} <ChevronRight className="w-3 h-3" />
                  </Link>
                </div>
              )}

              <div className="flex gap-2 select-none">
                {[
                  { status: 'interested', label: isHi ? 'रुचि है' : 'Interested' },
                  { status: 'going', label: isHi ? 'शामिल होऊंगा' : 'Going' }
                ].map(opt => {
                  const isActive = post.rsvp_status === opt.status;
                  const count = opt.status === 'interested' 
                     ? post.rsvps_count?.interested || 0
                     : post.rsvps_count?.going || 0;

                  return (
                    <button
                      key={opt.status}
                      onClick={() => onToggleRsvp(post.id, post.rsvp_status || null, opt.status as any)}
                      className={`flex-1 flex items-center justify-center gap-1.5 border px-3 py-1.5 rounded-full text-xs font-bold active:scale-95 transition-all shadow-xs ${
                        isActive 
                          ? "bg-[#651317] border-[#651317] text-white" 
                          : "bg-white dark:bg-stone-900 border-[#E8D8C4] dark:border-stone-700 text-[#651317] dark:text-amber-300 hover:border-[#651317]/50"
                      }`}
                    >
                      <span>{opt.status === 'interested' ? '🙏' : '✅'}</span>
                      <span>{opt.label} ({count})</span>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Question Polls */}
          {post.type === 'question' && post.question_options && post.question_options.length > 0 && (
            <div className="p-3.5 rounded-2xl border border-[#E8D8C4] dark:border-stone-800 bg-[#FAF6EE]/50 dark:bg-stone-900/40 space-y-2">
              <span className="text-[10px] font-bold uppercase tracking-wider text-[#651317] dark:text-amber-300 block mb-1.5">
                {isHi ? "त्वरित मतदान विकल्प" : "Quick tap poll"}
              </span>
              <div className="space-y-1.5">
                {post.question_options.map((opt, index) => {
                  const isVoted = post.user_voted_option === index;
                  const pct = post.vote_percentages ? post.vote_percentages[index] || 0 : 0;
                  
                  return (
                    <button
                      key={index}
                      onClick={() => onVoteOption(post.id, index)}
                      className="w-full relative overflow-hidden text-left p-2.5 rounded-xl flex items-center justify-between border border-[#E8D8C4] dark:border-stone-700 bg-white dark:bg-stone-900 hover:border-[#651317]/40 transition-all cursor-pointer"
                    >
                      <div 
                        className="absolute left-0 top-0 bottom-0 bg-[#FAF0E4] dark:bg-[#2B1F14] transition-all duration-300"
                        style={{ width: pct + '%' }}
                      />
                      <span className={`text-xs font-bold relative z-10 flex items-center gap-1.5 ${
                        isVoted ? "text-[#651317] dark:text-amber-300" : "text-[#32251E] dark:text-stone-200"
                      }`}>
                        {isVoted && "✦"} {opt}
                      </span>
                      <span className="text-xs font-bold text-[#651317] dark:text-amber-300 relative z-10">{pct}%</span>
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* ── 5. Action Footer Bar ── */}
        <div className="flex items-center justify-between pt-2.5 border-t border-[#E8D8C4]/60 dark:border-stone-800 text-[#8C7A6B] dark:text-stone-400 select-none">
          {/* Blessings / Heart */}
          <button
            onClick={() => onToggleReaction(post.id)}
            className={`inline-flex items-center gap-1.5 py-1 px-1.5 rounded-lg text-xs font-semibold transition-all active:scale-95 cursor-pointer ${
              post.has_reacted
                ? "text-rose-600 dark:text-rose-400"
                : "hover:text-[#651317] dark:hover:text-amber-300"
            }`}
            aria-label={isHi ? "प्रणाम" : "Blessings"}
          >
            <Heart className={`w-4 h-4 ${post.has_reacted ? "fill-rose-500 text-rose-500" : ""}`} />
            <span>{isHi ? "प्रणाम" : "Blessings"}</span>
            {post.reaction_count > 0 && (
              <span className="tabular-nums font-bold">({post.reaction_count})</span>
            )}
          </button>

          {/* Comments */}
          <button
            onClick={() => onToggleComments(post.id)}
            className={`inline-flex items-center gap-1.5 py-1 px-1.5 rounded-lg text-xs font-semibold transition-all active:scale-95 cursor-pointer ${
              isCommentsExpanded
                ? "text-[#651317] dark:text-amber-300"
                : "hover:text-[#651317] dark:hover:text-amber-300"
            }`}
            aria-label={isHi ? "टिप्पणी" : "Comments"}
            aria-expanded={isCommentsExpanded}
          >
            <MessageSquare className="w-4 h-4" />
            <span>{post.comment_count || 0}</span>
          </button>

          {/* Save */}
          <button
            onClick={() => onToggleSavePost(post.id)}
            className={`inline-flex items-center gap-1.5 py-1 px-1.5 rounded-lg text-xs font-semibold transition-all active:scale-95 cursor-pointer ${
              isPostSaved
                ? "text-amber-600 dark:text-amber-400"
                : "hover:text-[#651317] dark:hover:text-amber-300"
            }`}
            aria-label={isHi ? "सहेजें" : "Save"}
          >
            <Bookmark className={`w-4 h-4 ${isPostSaved ? "fill-amber-500 text-amber-500" : ""}`} />
            <span>{isHi ? "सहेजें" : "Save"}</span>
          </button>

          {/* Share */}
          <button
            onClick={() => {
              const link = `${window.location.origin}/community/posts/${post.id}`;
              if (navigator.share) {
                navigator.share({
                  title: post.title || (isHi ? "भक्तिमय पोस्ट" : "Devotional Post"),
                  text: post.content ? post.content.substring(0, 100) + "..." : (isHi ? "सत्संग पोस्ट देखें" : "Check out this post on Divine Melodies Hub"),
                  url: link
                }).catch((err) => {
                  if (err.name !== 'AbortError') {
                    navigator.clipboard.writeText(link);
                    toast.success(isHi ? "पोस्ट लिंक कॉपी की गई!" : "Post link copied!");
                  }
                });
              } else {
                navigator.clipboard.writeText(link);
                toast.success(isHi ? "पोस्ट लिंक कॉपी की गई!" : "Post link copied!");
              }
            }}
            className="inline-flex items-center gap-1.5 py-1 px-1.5 rounded-lg text-xs font-semibold hover:text-[#651317] dark:hover:text-amber-300 transition-all active:scale-95 cursor-pointer"
            aria-label={isHi ? "साझा करें" : "Share"}
          >
            <Share2 className="w-4 h-4" />
            <span>{isHi ? "साझा करें" : "Share"}</span>
          </button>
        </div>

        {/* ── 6. Expanded Comments Section ── */}
        {isCommentsExpanded && (
          <div className="mt-3 rounded-2xl p-3.5 border border-[#E8D8C4] dark:border-stone-800 bg-[#FAF6EE]/50 dark:bg-stone-900/60 space-y-3">
            <div className="flex items-center justify-between border-b border-[#E8D8C4]/60 dark:border-stone-800 pb-2">
              <span className="text-xs font-bold text-[#651317] dark:text-amber-200">
                {isHi ? "वार्तालाप (टिप्पणियाँ)" : "Discussion Thread"}
              </span>
            </div>

            {/* Comments List */}
            <div className="space-y-2.5 max-h-64 overflow-y-auto pr-1">
              {isLoadingComments && comments.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-6 text-stone-400">
                  <Loader2 className="w-5 h-5 animate-spin text-[#651317] mb-1.5" />
                  <span className="text-[10px] font-bold text-[#8C7A6B]">
                    {isHi ? "टिप्पणियाँ लोड हो रही हैं..." : "Loading comments..."}
                  </span>
                </div>
              ) : comments.length === 0 ? (
                <div className="text-center py-5 border border-dashed border-[#E8D8C4] dark:border-stone-800 rounded-xl bg-white/60 dark:bg-stone-900/40">
                  <p className="text-xs font-medium text-[#8C7A6B] dark:text-stone-400">
                    {isHi ? "अभी कोई टिप्पणी नहीं है। पहली टिप्पणी करें! 📿" : "No replies yet. Be the first to reply! 📿"}
                  </p>
                </div>
              ) : (
                comments.map(comment => (
                  <div key={comment.id} className="flex gap-2.5 text-xs items-start text-left relative">
                    <div className="w-7 h-7 rounded-full bg-[#FAF0E4] dark:bg-[#2B1F14] border border-[#E8D8C4] shrink-0 flex items-center justify-center font-bold text-xs text-[#651317] dark:text-amber-300 overflow-hidden select-none">
                      {comment.author?.avatar_url ? (
                        <img src={comment.author.avatar_url} alt="avatar" className="w-full h-full object-cover rounded-full" />
                      ) : (
                        comment.author?.display_name ? comment.author.display_name.slice(0, 2).toUpperCase() : "DV"
                      )}
                    </div>
                    <div className="relative p-2.5 rounded-xl min-w-0 transition-all flex-1 border border-[#E8D8C4] dark:border-stone-800 bg-white dark:bg-stone-900 shadow-2xs">
                      <div className="flex items-center justify-between gap-2 flex-wrap mb-0.5">
                        <span className="font-bold text-xs text-[#32251E] dark:text-stone-100 flex items-center gap-1.5 flex-wrap">
                          {comment.author?.display_name || "Devotee"}
                          {comment.is_lyrics_submission && (
                            <Badge variant="outline" className="text-[7.5px] bg-emerald-600 text-white font-extrabold uppercase border-emerald-700 px-1 py-0 select-none">
                              {isHi ? "भजन बोल" : "Lyrics"}
                            </Badge>
                          )}
                        </span>
                        <span className="text-[9px] text-[#8C7A6B] dark:text-stone-400">{formatTime(comment.created_at)}</span>
                      </div>
                      <p className="text-xs whitespace-pre-wrap leading-relaxed break-words font-normal text-[#32251E] dark:text-stone-200">
                        {comment.content}
                      </p>
                      {user?.id === comment.author_id && (
                        <div className="flex justify-end pt-1">
                          <button 
                            onClick={() => {
                              if (confirm(isHi ? "क्या आप सच में इस टिप्पणी को हटाना चाहते हैं?" : "Delete this comment?")) {
                                onDeleteComment(post.id, comment.id);
                              }
                            }}
                            className="text-[#8C7A6B] hover:text-rose-600 font-semibold text-[10px] flex items-center gap-0.5 transition-colors cursor-pointer"
                          >
                            <Trash2 className="w-3 h-3" />
                            <span>{isHi ? "हटाएं" : "Delete"}</span>
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Comment Form */}
            {user ? (
              <div className="pt-2 border-t border-[#E8D8C4]/60 dark:border-stone-800">
                <div className="flex gap-2">
                  <textarea
                    rows={2}
                    value={newCommentText}
                    onChange={(e) => setNewCommentText(e.target.value)}
                    placeholder={
                      post.type === 'bhajan_request' 
                        ? (isHi ? "भजन के बोल यहाँ लिखें..." : "Provide lyrics or details here...")
                        : (isHi ? "अपनी टिप्पणी यहाँ लिखें..." : "Write a response...")
                    }
                    className="flex-1 text-xs rounded-xl p-2 focus:outline-none focus:border-[#651317] border border-[#E8D8C4] dark:border-stone-700 bg-white dark:bg-stone-900 text-[#32251E] dark:text-stone-100 placeholder:text-stone-400 resize-none"
                    aria-label="Comment text content"
                  />
                  <button
                    onClick={() => onAddComment(post.id)}
                    disabled={!newCommentText.trim()}
                    className="bg-[#651317] hover:bg-[#4f0f12] disabled:opacity-40 text-white font-bold p-2.5 rounded-xl flex items-center justify-center transition-all shrink-0 w-10 h-10 self-end cursor-pointer"
                    aria-label="Submit Comment"
                  >
                    <Send className="w-3.5 h-3.5 text-white" />
                  </button>
                </div>

                {post.type === 'bhajan_request' && post.request_status === 'open' && (
                  <div className="flex items-center gap-2 text-left mt-2 select-none">
                    <input 
                      type="checkbox" 
                      id={`lyrics-submit-check-${post.id}`}
                      checked={commentIsLyricsSubmit}
                      onChange={(e) => setCommentIsLyricsSubmit(e.target.checked)}
                      className="w-3.5 h-3.5 accent-[#651317] cursor-pointer"
                    />
                    <label htmlFor={`lyrics-submit-check-${post.id}`} className="text-[10px] font-bold text-[#8C7A6B] cursor-pointer select-none">
                      {isHi ? "इस टिप्पणी को भजन के बोल के रूप में जमा करें" : "Submit this comment as the Bhajan Lyrics"}
                    </label>
                  </div>
                )}
              </div>
            ) : (
              <p className="text-[10px] text-[#8C7A6B] text-center mt-1">
                {isHi ? "टिप्पणी करने के लिए कृपया लॉग इन करें।" : "Please log in to reply."}
              </p>
            )}
          </div>
        )}
      </div>

      {/* ── 7. Custom In-App Delete Confirmation Modal ── */}
      {deleteModalOpen && (
        <div className="fixed inset-0 z-[110] bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-[#FFFDF8] dark:bg-[#1A120B] border border-[#E8D8C4] dark:border-stone-800 rounded-2xl p-5 max-w-sm w-full shadow-2xl text-center space-y-3.5 animate-in fade-in zoom-in-95 duration-150">
            <div className="w-11 h-11 rounded-full bg-rose-100 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400 mx-auto flex items-center justify-center">
              <Trash2 className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-display font-bold text-base text-[#651317] dark:text-amber-100">
                {isHi ? "पोस्ट हटाएं?" : "Delete Post?"}
              </h3>
              <p className="text-xs text-[#7A6B60] dark:text-stone-300 mt-1 leading-relaxed">
                {isHi
                  ? "क्या आप वाकई इस भक्तिमय पोस्ट को हटाना चाहते हैं? इसे वापस नहीं लाया जा सकेगा।"
                  : "Are you sure you want to delete this post? This action cannot be undone."}
              </p>
            </div>
            <div className="flex gap-2 justify-center pt-1">
              <Button
                type="button"
                variant="outline"
                onClick={() => setDeleteModalOpen(false)}
                disabled={isDeleting}
                className="flex-1 h-9 rounded-full border-[#E8D8C4] text-[#8C7A6B] hover:text-[#651317] font-semibold text-xs"
              >
                {isHi ? "रद्द करें" : "Cancel"}
              </Button>
              <Button
                type="button"
                onClick={handleConfirmDelete}
                disabled={isDeleting}
                className="flex-1 h-9 rounded-full bg-rose-600 hover:bg-rose-700 text-white font-semibold text-xs shadow-xs"
              >
                {isDeleting
                  ? (isHi ? "हटा रहे हैं…" : "Deleting…")
                  : (isHi ? "हाँ, हटाएं" : "Delete")}
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* ── 8. Edit Post Modal ── */}
      <EditPostDialog
        open={editModalOpen}
        onOpenChange={setEditModalOpen}
        post={post}
        isHi={isHi}
        onPostUpdated={onPostUpdated}
      />

      {/* ── 9. Fullscreen Darshan Lightbox Modal ── */}
      {lightboxOpen && post.image_url && (
        <div 
          onClick={() => setLightboxOpen(false)}
          className="fixed inset-0 z-[120] bg-black/90 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in duration-200"
        >
          <button
            onClick={() => setLightboxOpen(false)}
            className="absolute top-4 right-4 text-white/80 hover:text-white bg-white/10 hover:bg-white/20 rounded-full p-2.5 transition-colors cursor-pointer"
            aria-label="Close"
          >
            <X className="w-6 h-6" />
          </button>
          <div className="max-w-4xl max-h-[90vh] flex flex-col items-center justify-center" onClick={(e) => e.stopPropagation()}>
            <img
              src={post.image_url}
              alt="Darshan Full View"
              className="max-w-full max-h-[85vh] object-contain rounded-2xl shadow-2xl border border-white/10"
            />
            {post.title && (
              <p className="text-white text-sm font-semibold mt-3 text-center px-4">
                {post.title}
              </p>
            )}
          </div>
        </div>
      )}
    </>
  );
}
