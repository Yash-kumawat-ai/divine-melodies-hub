import { useState, useEffect } from "react";
import { 
  Heart, MessageSquare, Bookmark, ExternalLink, Trash2, Play, ChevronRight, Calendar, MapPin, Send, Loader2
} from "lucide-react";
import { useTheme } from "@/hooks/useTheme";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Link } from "react-router-dom";
import { type CommunityPost, type PostComment } from "@/lib/community/communityApi";

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
      className="inline-flex items-center gap-1 bg-rose-500/10 text-rose-500 px-2 py-0.5 rounded-md font-extrabold text-[10px] tracking-wide uppercase select-none"
      aria-live="polite"
    >
      ⏳ {timeLeft.days > 0 ? `${timeLeft.days}d ` : ""}{timeLeft.hours}h {timeLeft.mins}m left
    </span>
  );
}


const POST_TYPE_LABELS: Record<string, { hi: string; en: string }> = {
  bhajan_share: { hi: "भजन साझा", en: "Bhajan Share" },
  bhajan_request: { hi: "भजन अनुरोध", en: "Bhajan Request" },
  question: { hi: "प्रश्न", en: "Question" },
  event: { hi: "कार्यक्रम", en: "Event" },
  thought: { hi: "विचार", en: "Thought" },
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
  newCommentText: string;
  setNewCommentText: (text: string) => void;
  commentIsLyricsSubmit: boolean;
  setCommentIsLyricsSubmit: (val: boolean) => void;
  isLoadingComments?: boolean;
  isPostSaved: boolean;
  onToggleSavePost: (postId: string) => void;
}

export function PostCard({
  post, user, isHi, comments, isCommentsExpanded, onToggleComments, onToggleReaction, onToggleRsvp, onVoteOption, onDeleteComment, onAddComment, onDeletePost, newCommentText, setNewCommentText, commentIsLyricsSubmit, setCommentIsLyricsSubmit,
  isLoadingComments = false,
  isPostSaved,
  onToggleSavePost,
  variant = "card",
}: PostCardProps) {
  const { theme } = useTheme();
  const isDark = theme === "dark";
  const isFeed = variant === "feed";
  const typeLabel = isHi
    ? (POST_TYPE_LABELS[post.type]?.hi || post.type)
    : (POST_TYPE_LABELS[post.type]?.en || post.type.replace("_", " "));
  
  // Format DateTime
  const formatTime = (isoString: string) => {
    const diffMs = new Date().getTime() - new Date(isoString).getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);
    if (diffMins < 1) return isHi ? "अभी" : "just now";
    if (diffMins < 60) return isHi ? `${diffMins} मिनट पहले` : `${diffMins}m ago`;
    if (diffHours < 24) return isHi ? `${diffHours} घंटे पहले` : `${diffHours}h ago`;
    return new Date(isoString).toLocaleDateString();
  };

  const getAuthorBadge = (role?: string) => {
    if (!role) return { label: isHi ? "भक्त" : "Devotee", icon: "🌸", colorClass: "text-amber-500" };
    const r = role.toLowerCase();
    if (r.includes("admin") || r.includes("acharya")) return { label: isHi ? "आचार्य" : "Acharya", icon: "🔱", colorClass: "text-orange-500 font-bold" };
    if (r.includes("mod") || r.includes("satsangi")) return { label: isHi ? "सत्संगी" : "Satsangi", icon: "📿", colorClass: "text-amber-400" };
    if (r.includes("sadhak")) return { label: isHi ? "साधक" : "Sadhak", icon: "🌿", colorClass: "text-emerald-400" };
    return { label: isHi ? "भक्त" : "Devotee", icon: "🌸", colorClass: "text-amber-500" };
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
      case 'open': return 'bg-[#181310] border-[#2c2018] text-stone-400';
      case 'lyrics_submitted': return 'bg-blue-950/40 border-blue-900/40 text-blue-400';
      case 'in_review': return 'bg-amber-950/40 border-amber-900/40 text-amber-400';
      case 'added_to_library': return 'bg-emerald-950/40 border-emerald-900/40 text-emerald-400';
      case 'closed_unresolved': return 'bg-rose-950/40 border-rose-900/40 text-rose-400';
      default: return 'bg-stone-900 text-stone-400';
    }
  };

  const highlightSacredText = (text: string) => {
    if (!text) return "";
    const keywords = ["108", "Hanuman Chalisa", "हनुमान चालीसा", "जय श्री राम", "जय श्री कृष्णा", "Jai Shree Ram", "Jai Shri Ram", "Hari Bol", "Hare Krishna"];
    const escapedKeywords = keywords.map(k => k.replace(/[-/\\^$*+?.()|[\]{}]/g, '\\$&'));
    const regex = new RegExp(`(${escapedKeywords.join('|')})`, 'gi');
    
    const parts = text.split(regex);
    return parts.map((part, index) => {
      const isKeyword = keywords.some(k => k.toLowerCase() === part.toLowerCase());
      if (isKeyword) {
        return <span key={index} className="text-amber-400 font-bold">{part}</span>;
      }
      return part;
    });
  };

  return (
    <div className={
      isFeed
        ? `p-4 sm:p-5 flex flex-col gap-3.5 text-left border border-[#E8D8C4] dark:border-stone-800 rounded-2xl bg-[#FFFDF8] dark:bg-[#1A120B] shadow-xs transition-all hover:border-[#D6A86B]`
        : `rounded-3xl p-6 transition-all duration-300 flex flex-col gap-5 text-left border hover:shadow-xl ${
            isDark
              ? "bg-[#130f0c] border-[#231b15] hover:border-orange-500/25 shadow-black/40"
              : "bg-white border-orange-500/10 shadow-orange-950/5 hover:border-orange-500/20"
          }`
    }>
      <div>
        {/* Post Card Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className={`${isFeed ? "w-10 h-10 min-w-[40px] ring-1 ring-[#E8D8C4] dark:ring-stone-700" : "w-11 h-11 min-w-[44px] max-w-[44px] max-h-[44px] p-[1.5px] bg-gradient-to-tr from-amber-500 to-orange-600"} rounded-full shrink-0`}>
              <div className={`w-full h-full rounded-full overflow-hidden flex items-center justify-center font-extrabold text-xs uppercase select-none ${
                isDark ? 'bg-stone-900 text-orange-400' : 'bg-stone-100 text-orange-600'
              }`}>
                {post.author?.avatar_url ? (
                  <img src={post.author.avatar_url} alt="author" className="w-full h-full max-w-full max-h-full object-cover rounded-full" />
                ) : (
                  post.author?.display_name?.slice(0, 2).toUpperCase() || "DV"
                )}
              </div>
            </div>
            <div className="flex flex-col text-left min-w-0">
              <span className={`font-display font-bold ${isFeed ? "text-sm" : "text-base font-extrabold"} flex items-center gap-1.5 flex-wrap ${
                isDark ? 'text-stone-100' : 'text-stone-850'
              }`}>
                {post.author?.display_name || (isHi ? "अनाम भक्त" : "Anonymous Devotee")}
                {!isFeed && (
                  <span className="text-xs select-none" title={authorBadge.label}>
                    {authorBadge.icon}
                  </span>
                )}
                {post.group_name && (
                  <span className={`text-xs font-semibold ${
                    isDark ? 'text-stone-500' : 'text-stone-450'
                  }`}>
                    {isHi ? "में" : "in"} <span className="text-orange-500 dark:text-orange-400 font-bold">#{post.group_name}</span>
                  </span>
                )}
              </span>
              <p className={`${isFeed ? "text-[11px]" : "text-xs"} font-semibold tracking-wide mt-0.5 ${
                isDark ? 'text-stone-400' : 'text-stone-500'
              }`}>
                {formatTime(post.created_at)}
                {!isFeed && (
                  <> • <span className={`${authorBadge.colorClass} font-semibold`}>{authorBadge.label}</span></>
                )}
                {isFeed && (
                  <> · <span className="text-stone-400">{typeLabel}</span></>
                )}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            {!isFeed && (
            <Badge 
              variant="outline" 
              className={`text-xs uppercase font-extrabold px-3 py-1 rounded-full select-none ${
                post.type === 'bhajan_share' ? (isDark ? "bg-emerald-950/20 text-emerald-450 border-emerald-500/25" : "bg-emerald-50 text-emerald-700 border-emerald-300/40") :
                post.type === 'bhajan_request' ? (isDark ? "bg-[#2c2018] text-amber-400 border-amber-500/25" : "bg-amber-50 text-amber-700 border-amber-300/60") :
                post.type === 'question' ? (isDark ? "bg-blue-950/20 text-blue-405 border-blue-500/25" : "bg-blue-50 text-blue-700 border-blue-300/40") :
                post.type === 'event' ? (isDark ? "bg-rose-950/20 text-rose-455 border-rose-500/25" : "bg-rose-50 text-rose-700 border-rose-300/40") :
                isDark ? "bg-stone-900 text-stone-400 border-stone-800" : "bg-stone-100 text-stone-600 border-stone-200"
              }`}
            >
              {typeLabel}
            </Badge>
            )}
            {user?.id === post.author_id && (
              <button 
                onClick={() => onDeletePost(post.id)}
                className={`p-1.5 transition-colors rounded-lg hover:bg-rose-500/5 ${
                  isDark ? 'text-stone-500 hover:text-rose-500' : 'text-stone-400 hover:text-rose-600'
                }`}
                title="Delete Post"
                aria-label="Delete Post"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>

        {/* Post content and media */}
        <div className={`${isFeed ? "mt-2 space-y-2" : "mt-3.5 space-y-3.5"} text-left w-full`}>
          {post.title && (
            <h3 className={`font-display font-bold ${isFeed ? "text-sm" : "text-base sm:text-lg font-extrabold"} leading-tight ${
              isDark ? 'text-amber-50' : 'text-stone-850'
            }`}>
              {post.title}
            </h3>
          )}

          {post.content && (
            <p className={`${isFeed ? "text-sm" : "text-xs sm:text-[13px]"} whitespace-pre-wrap leading-relaxed ${
              isDark ? 'text-stone-300' : 'text-stone-600'
            }`}>
              {highlightSacredText(post.content)}
            </p>
          )}

          {post.image_url && (
            <div className={`w-full rounded-2xl overflow-hidden shadow-sm border ${
              isDark ? 'border-orange-500/10 bg-stone-900/40' : 'border-stone-200 bg-stone-50'
            }`}>
              <img 
                src={post.image_url} 
                alt="post visual" 
                className="w-full h-auto max-h-[350px] sm:max-h-[450px] object-cover rounded-2xl" 
                loading="lazy"
              />
            </div>
          )}

          {post.type === 'bhajan_share' && post.youtube_url && (
            <div 
              onClick={() => window.open(post.youtube_url, '_blank')}
              className={`rounded-2xl p-4 flex items-center gap-3 w-full cursor-pointer transition-all group relative shadow-xs select-none border ${
                isDark ? 'bg-[#17120e] border-[#2c2018] hover:bg-[#201813]' : 'bg-orange-50/40 border-orange-200/60 hover:bg-orange-100/30'
              }`}
            >
              <div className={`w-12 h-12 rounded-xl overflow-hidden shrink-0 flex items-center justify-center border ${
                isDark ? 'border-orange-500/10 bg-stone-900' : 'border-orange-200/50 bg-white'
              }`}>
                <img 
                  src={getDeityImgForPost(post.id)} 
                  alt="deity logo" 
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="min-w-0 flex-1 flex flex-col justify-between text-left">
                <div>
                  <span className={`font-bold text-xs sm:text-sm truncate block group-hover:text-orange-500 transition-colors ${
                    isDark ? 'text-stone-100' : 'text-stone-850'
                  }`}>
                    {post.title || (isHi ? "भजन कीर्तन" : "Bhajan Share")}
                  </span>
                  <span className="text-[10px] sm:text-xs text-orange-400/90 font-medium block truncate mt-0.5">
                    {isHi ? "भजन श्रवण" : "Devotional Melody"}
                  </span>
                </div>
                <div className="flex items-end gap-[1.5px] h-3.5 mt-1.5 opacity-80">
                  {[2, 4, 3, 5, 8, 6, 4, 7, 5, 3, 6, 4, 2, 5, 3, 4, 6, 8, 5, 3].map((h, i) => (
                    <span key={i} className="w-[1.5px] bg-gradient-to-t from-orange-600 to-amber-400 rounded-full" style={{ height: (h * 1.5) + 'px' }} />
                  ))}
                </div>
              </div>
              <button
                className="w-8 h-8 rounded-full bg-gradient-to-r from-amber-500 to-orange-600 flex items-center justify-center shadow-md text-white shrink-0 group-hover:scale-105 transition-all"
                aria-label="Play Bhajan"
              >
                <Play className="w-3.5 h-3.5 fill-white text-white translate-x-[0.5px]" />
              </button>
            </div>
          )}

          {post.youtube_url && post.type !== 'bhajan_share' && (
            <div className={`rounded-xl p-2.5 flex items-center justify-between gap-3 max-w-[400px] border ${
              isDark ? 'border-orange-500/10 bg-[#1a1410]/50' : 'border-stone-200 bg-stone-50'
            }`}>
              <Play className="w-6 h-6 text-orange-500 shrink-0 ml-1" />
              <div className="min-w-0 flex-1">
                <span className={`text-[8px] font-bold uppercase tracking-wider block ${
                  isDark ? 'text-stone-400' : 'text-stone-500'
                }`}>{isHi ? "यूट्यूब लिंक" : "YouTube Link"}</span>
                <a 
                  href={post.youtube_url} 
                  target="_blank" 
                  rel="noreferrer" 
                  className="text-xs font-semibold text-orange-400 block truncate hover:underline"
                >
                  {post.youtube_url}
                </a>
              </div>
              <ExternalLink className="w-3.5 h-3.5 text-stone-400 shrink-0" />
            </div>
          )}

          {/* Type Specific Elements */}
          {post.type === 'bhajan_request' && (
            <div className={`border rounded-2xl p-4 ${isDark ? 'bg-stone-900/20 border-orange-500/10' : 'bg-stone-50/60 border-stone-200'}`}>
              <div className="flex items-center justify-between mb-3.5">
                <span className={`text-xs font-bold ${isDark ? 'text-stone-400' : 'text-stone-600'}`}>{isHi ? "अनुरोध स्थिति:" : "Request Pipeline:"}</span>
                <Badge variant="outline" className={"text-[10px] font-extrabold capitalize " + getStatusBadgeColor(post.request_status)}>
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
                <div className="mb-4 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-bold p-3 rounded-xl flex items-center gap-2">
                  <span>🎉</span>
                  <span>
                    {isHi ? "भजन को मुख्य लाइब्रेरी में जोड़ दिया गया है!" : "Your request was added to the Library!"}
                  </span>
                  {post.resolved_bhajan_id && (
                    <Link 
                      to={"/bhajan/" + post.resolved_bhajan_id}
                      className="underline text-emerald-400 ml-auto flex items-center gap-1 shrink-0"
                    >
                      View Bhajan <ChevronRight className="w-3.5 h-3.5" />
                    </Link>
                  )}
                </div>
              )}

              <div className="flex items-center justify-between text-[10px] font-extrabold tracking-tight text-center relative px-2 mb-2 select-none">
                <div className={`absolute top-2 left-6 right-6 h-0.5 -z-10 ${isDark ? 'bg-stone-850' : 'bg-stone-200'}`} />
                {[
                  { status: 'open', label: isHi ? 'खुला' : 'Open' },
                  { status: 'lyrics_submitted', label: isHi ? 'उत्तर प्राप्त' : 'Lyrics' },
                  { status: 'in_review', label: isHi ? 'समीक्षा' : 'Review' },
                  { status: 'added_to_library', label: isHi ? 'लाइब्रेरी' : 'Library' }
                ].map((step) => {
                  const stages = ['open', 'lyrics_submitted', 'in_review', 'added_to_library'];
                  const currentIdx = stages.indexOf(post.request_status);
                  const stepIdx = stages.indexOf(step.status);
                  const isPassed = stepIdx <= currentIdx && post.request_status !== 'closed_unresolved';
                  return (
                    <div key={step.status} className="flex flex-col items-center">
                      <div className={"w-4 h-4 rounded-full border flex items-center justify-center text-[7.5px] font-bold " + (
                        isPassed 
                          ? "bg-[#5c1d0c] border-[#5c1d0c] text-white" 
                          : isDark ? "bg-[#130f0c] border-stone-800 text-stone-400" : "bg-white border-stone-200 text-stone-450"
                      )}>
                        {isPassed && "✓"}
                      </div>
                      <span className={"mt-1 font-semibold " + (isPassed ? "text-[#5c1d0c]" : isDark ? "text-stone-500" : "text-stone-400")}>
                        {step.label}
                      </span>
                    </div>
                  );
                })}
              </div>

              {post.request_status === 'open' && (
                <Button 
                  onClick={() => onToggleComments(post.id)}
                  className="mt-3.5 w-full bg-[#5c1d0c] hover:bg-[#4a170a] text-white text-xs font-bold rounded-xl h-9 shadow-xs"
                >
                  📿 {isHi ? "मुझे इस भजन के बोल पता हैं (उत्तर दें)" : "I Know This Bhajan (Submit Lyrics)"}
                </Button>
              )}
            </div>
          )}

          {post.type === 'event' && (
            <div className={`border rounded-2xl p-4 space-y-3 ${isDark ? 'bg-stone-900/20 border-orange-500/10' : 'bg-stone-50/60 border-stone-200'}`}>
              <div className={`flex flex-col sm:flex-row sm:items-center justify-between text-sm font-bold gap-3 border-b pb-2.5 ${isDark ? 'text-stone-300 border-[#2c2018]' : 'text-stone-700 border-stone-200'}`}>
                <span className="flex items-center gap-1.5 text-rose-500">
                  <Calendar className="w-4 h-4" />
                  {post.event_datetime 
                    ? new Date(post.event_datetime).toLocaleString(isHi ? 'hi-IN' : 'en-US', { dateStyle: 'medium', timeStyle: 'short' }) 
                    : (isHi ? "तारीख/समय निर्धारित नहीं" : "Date/Time not set")}
                </span>
                <span className={`flex items-center gap-1.5 ${isDark ? 'text-stone-400' : 'text-stone-500'}`}>
                  <MapPin className="w-4 h-4" />
                  {post.event_location || (isHi ? "वर्चुअल ज़ूम" : "Virtual Zoom")}
                </span>
              </div>

              {post.linked_bhajan_id && (
                <div className={`p-3 rounded-xl border flex items-center justify-between gap-3 ${
                  isDark ? 'bg-[#1a1410]/50 border-[#5c1d0c]/10' : 'bg-orange-50/10 border-stone-200/50'
                }`}>
                  <div className="min-w-0 flex-1">
                    <span className="text-[9px] uppercase tracking-wider font-extrabold text-[#5c1d0c] block">{isHi ? "संबद्ध भजन" : "Linked Bhajan"}</span>
                    <span className={`text-xs font-bold truncate block ${isDark ? 'text-stone-200' : 'text-stone-855'}`}>{isHi ? "भजन संदर्भ" : "Bhajan Page Reference"}</span>
                  </div>
                  <Link 
                    to={"/bhajan/" + post.linked_bhajan_id}
                    className="bg-[#5c1d0c]/10 text-[#5c1d0c] hover:bg-[#5c1d0c]/20 text-xs px-3 py-1.5 rounded-lg font-bold flex items-center gap-0.5 transition-all shrink-0"
                  >
                    {isHi ? "बोल खोलें" : "Open lyrics"} <ChevronRight className="w-3 h-3" />
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
                      className={"flex-1 flex items-center justify-center gap-2 border px-3 py-2 rounded-xl text-xs font-bold active:scale-98 transition-all " + (
                        isActive 
                          ? "bg-[#5c1d0c] border-[#5c1d0c] text-white shadow-xs" 
                          : isDark ? "bg-[#1a1410] border-[#5c1d0c]/15 text-[#5c1d0c] hover:bg-[#5c1d0c]/5" : "bg-[#FAF6EE]/50 border-stone-200 text-[#5c1d0c] hover:bg-[#5c1d0c]/10"
                      )}
                    >
                      <span>{opt.status === 'interested' ? '⭐' : '✓'}</span>
                      <span>{opt.label} ({count})</span>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {post.type === 'question' && post.question_options && post.question_options.length > 0 && (
            <div className={`p-4 rounded-2xl border ${isDark ? 'bg-stone-900/20 border-orange-500/10' : 'bg-stone-50/60 border-stone-200'}`}>
              <span className="text-[10px] font-extrabold uppercase tracking-wider text-blue-500 block mb-2">
                {isHi ? "त्वरित मतदान विकल्प" : "Quick tap option poll"}
              </span>
              <div className="space-y-2">
                {post.question_options.map((opt, index) => {
                  const isVoted = post.user_voted_option === index;
                  const pct = post.vote_percentages ? post.vote_percentages[index] || 0 : 0;
                  
                  return (
                    <button
                      key={index}
                      onClick={() => onVoteOption(post.id, index)}
                      className={`w-full relative overflow-hidden text-left p-3 rounded-xl flex items-center justify-between border ${
                        isDark ? 'border-orange-500/10 bg-[#130f0c] hover:border-orange-500/25' : 'border-stone-200 bg-white hover:border-stone-300'
                      }`}
                    >
                      <div 
                        className="absolute left-0 top-0 bottom-0 bg-orange-500/10 transition-all duration-300"
                        style={{ width: pct + '%' }}
                      />
                      <span className={"text-xs font-bold relative z-10 flex items-center gap-1.5 " + (isVoted ? "text-orange-500" : isDark ? "text-stone-300" : "text-stone-700")}>
                        {isVoted && "✦"} {opt}
                      </span>
                      <span className="text-xs font-bold text-orange-500 relative z-10">{pct}%</span>
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </div>
      
      {/* Post action footer bar */}
      {isFeed ? (
        <div className="flex items-center justify-around pt-2 -mx-1">
          <button
            onClick={() => onToggleReaction(post.id)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full transition-all active:scale-95 group ${post.has_reacted ? "text-rose-500" : "text-stone-500 hover:text-rose-500"}`}
            aria-label={isHi ? "प्रणाम" : "Bless this post"}
          >
            <Heart className={`w-[18px] h-[18px] ${post.has_reacted ? "fill-rose-500 text-rose-500" : ""}`} />
            {post.reaction_count > 0 && (
              <span className="text-xs font-semibold tabular-nums">{post.reaction_count}</span>
            )}
          </button>
          <button
            onClick={() => onToggleComments(post.id)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full transition-all active:scale-95 group ${isCommentsExpanded ? "text-orange-500" : "text-stone-500 hover:text-orange-500"}`}
            aria-label={isHi ? "टिप्पणी" : "View comments"}
            aria-expanded={isCommentsExpanded}
          >
            <MessageSquare className="w-[18px] h-[18px]" />
            {post.comment_count > 0 && (
              <span className="text-xs font-semibold tabular-nums">{post.comment_count}</span>
            )}
          </button>
          <button
            onClick={() => onToggleSavePost(post.id)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full transition-all active:scale-95 group ${isPostSaved ? "text-amber-500" : "text-stone-500 hover:text-amber-500"}`}
            aria-label={isHi ? "सहेजें" : "Save post"}
          >
            <Bookmark className={`w-[18px] h-[18px] ${isPostSaved ? "fill-amber-500 text-amber-500" : ""}`} />
          </button>
          <button
            onClick={() => {
              const link = `${window.location.origin}/community/posts/${post.id}`;
              if (navigator.share) {
                navigator.share({
                  title: post.title || (isHi ? "भक्तिमय पोस्ट" : "Devotional Post"),
                  text: post.content ? post.content.substring(0, 100) + "..." : (isHi ? "सत्संग पोस्ट देखें" : "Check out this post on Divine Melodies Hub"),
                  url: link
                }).catch((err) => {
                  if (err.name !== "AbortError") {
                    navigator.clipboard.writeText(link);
                    toast.success(isHi ? "पोस्ट लिंक कॉपी की गई!" : "Post link copied!");
                  }
                });
              } else {
                navigator.clipboard.writeText(link);
                toast.success(isHi ? "पोस्ट लिंक कॉपी की गई!" : "Post link copied!");
              }
            }}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-stone-500 hover:text-orange-500 transition-all active:scale-95 group"
            aria-label={isHi ? "साझा करें" : "Share post"}
          >
            <ExternalLink className="w-[18px] h-[18px]" />
          </button>
        </div>
      ) : (
      <div className={`flex items-center rounded-full px-5 py-2 w-fit gap-4 mt-3 shadow-inner border ${
        isDark ? 'bg-[#181310] border-[#281f19]' : 'bg-stone-50 border-stone-200'
      }`}>
        <button
          onClick={() => onToggleReaction(post.id)}
          className={`flex items-center gap-2.5 text-left transition-all active:scale-95 group ${post.has_reacted ? 'text-rose-500' : 'text-stone-400'}`}
          aria-label="Bless this post"
        >
          <Heart className={`w-5 h-5 transition-all ${post.has_reacted ? 'text-rose-500 fill-rose-500 scale-110' : 'text-stone-400 group-hover:text-rose-500'}`} />
          <div>
            <p className={`text-xs font-black leading-none transition-colors ${
              post.has_reacted ? 'text-rose-500' : isDark ? 'text-stone-100' : 'text-stone-850'
            }`}>{post.reaction_count}</p>
            <p className={`text-[9px] font-bold mt-0.5 transition-colors ${
              post.has_reacted ? 'text-rose-400' : isDark ? 'text-stone-400' : 'text-stone-500'
            }`}>{isHi ? "प्रणाम" : "Blessings"}</p>
          </div>
        </button>

        <span className={`w-px h-6 ${isDark ? 'bg-[#2c2018]' : 'bg-stone-200'}`} />

        <button
          onClick={() => onToggleComments(post.id)}
          className="flex items-center gap-2.5 text-left transition-all active:scale-95 group"
          aria-label="View comments"
          aria-expanded={isCommentsExpanded}
        >
          <MessageSquare className={`w-5 h-5 transition-all ${isCommentsExpanded ? 'text-orange-400 scale-110' : 'text-stone-400 group-hover:text-orange-400'}`} />
          <div>
            <p className={`text-xs font-black leading-none ${isDark ? 'text-stone-100' : 'text-stone-850'}`}>{post.comment_count}</p>
            <p className={`text-[9px] font-bold mt-0.5 ${isDark ? 'text-stone-400' : 'text-stone-500'}`}>{isHi ? "टिप्पणी" : "Comments"}</p>
          </div>
        </button>

        <span className={`w-px h-6 ${isDark ? 'bg-[#2c2018]' : 'bg-stone-200'}`} />

        <button
          onClick={() => onToggleSavePost(post.id)}
          className="flex items-center gap-2 text-left transition-all active:scale-95 group"
          aria-label="Save post"
        >
          <Bookmark className={`w-4.5 h-4.5 transition-all ${isPostSaved ? 'text-amber-500 fill-amber-500 scale-110' : 'text-stone-400 group-hover:text-amber-500'}`} />
          <span className={`text-[11px] font-bold transition-colors ${
            isPostSaved ? 'text-amber-500' : isDark ? 'text-stone-300 group-hover:text-stone-100' : 'text-stone-600 group-hover:text-stone-850'
          }`}>{isHi ? "सहेजें" : "Save"}</span>
        </button>

        <span className={`w-px h-6 ${isDark ? 'bg-[#2c2018]' : 'bg-stone-200'}`} />

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
          className="flex items-center gap-2 text-left transition-all active:scale-95 group"
          aria-label="Share post"
        >
          <ExternalLink className={`w-4.5 h-4.5 transition-colors ${isDark ? 'text-stone-400 group-hover:text-orange-400' : 'text-stone-500 group-hover:text-orange-500'}`} />
          <span className={`text-[11px] font-bold transition-colors ${isDark ? 'text-stone-300 group-hover:text-stone-100' : 'text-stone-600 group-hover:text-stone-850'}`}>{isHi ? "साझा करें" : "Share"}</span>
        </button>
      </div>
      )}

      {/* ─── COLLAPSED COMMENTS PANEL ───────────────────────────── */}
      {isCommentsExpanded && (
        <div className={`${isFeed ? "mt-2 rounded-xl p-3" : "mt-4 rounded-2xl p-4"} border space-y-4 ${
          isDark ? 'bg-[#120e0c] border-[#5c1d0c]/20' : 'bg-[#FAF6EE]/30 border-stone-200'
        }`}>
          <div className={`flex items-center justify-between border-b pb-2 ${isDark ? 'border-[#291e17]' : 'border-stone-200'}`}>
            <span className={`text-xs font-bold ${isDark ? 'text-stone-400' : 'text-stone-500'}`}>
              {isHi ? "वार्तालाप" : "Discussion Thread"}
            </span>
          </div>

          {/* Comments List */}
          <div className="space-y-3.5 max-h-72 overflow-y-auto pr-1">
            {isLoadingComments && comments.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-8 text-stone-400">
                <Loader2 className="w-5 h-5 animate-spin text-[#5c1d0c] mb-2" />
                <span className="text-[10px] font-extrabold uppercase tracking-wider text-stone-500">
                  {isHi ? "टिप्पणियाँ लोड हो रही हैं..." : "Loading comments..."}
                </span>
              </div>
            ) : comments.length === 0 ? (
              <div className={`text-center py-6 border border-dashed rounded-xl bg-orange-500/[0.01] ${
                isDark ? 'border-[#291e17]' : 'border-stone-200'
              }`}>
                <p className={`text-xs font-medium ${isDark ? 'text-stone-400' : 'text-stone-500'}`}>
                  {isHi ? "कोई टिप्पणी नहीं है। पहली टिप्पणी करें! 📿" : "No replies yet. Be the first to reply! 📿"}
                </p>
              </div>
            ) : (
              comments.map(comment => (
                <div key={comment.id} className="flex gap-3 text-xs items-start group text-left relative">
                  <div className="w-8 h-8 rounded-full bg-orange-950/20 shrink-0 flex items-center justify-center font-bold text-orange-650 ring-2 ring-orange-500/10 shadow-xs overflow-hidden select-none">
                    {comment.author?.avatar_url ? (
                      <img src={comment.author.avatar_url} alt="avatar" className="w-full h-full object-cover rounded-full animate-fade-in" />
                    ) : (
                      comment.author?.display_name ? (
                        comment.author.display_name.slice(0, 2).toUpperCase()
                      ) : "DV"
                    )}
                  </div>
                  <div className={`relative p-3.5 rounded-2xl min-w-0 shadow-xxs transition-all flex-1 border ${
                    isDark ? 'bg-[#19130f] border-[#291e17] hover:border-[#5c1d0c]/30' : 'bg-white border-stone-200 hover:border-stone-300'
                  }`}>
                    <div className="flex items-center justify-between gap-2 flex-wrap mb-1">
                      <span className={`font-extrabold flex items-center gap-1.5 flex-wrap ${
                        isDark ? 'text-stone-100' : 'text-stone-850'
                      }`}>
                        {comment.author?.display_name || "Devotee"}
                        {comment.is_lyrics_submission && (
                          <Badge variant="outline" className="text-[7.5px] bg-emerald-600 text-white font-extrabold uppercase border-emerald-700 scale-90 px-1 py-0 select-none">
                            {isHi ? "भजन बोल" : "Lyrics Submission"}
                          </Badge>
                        )}
                      </span>
                      <span className={`text-[8.5px] font-semibold ${isDark ? 'text-stone-500' : 'text-stone-450'}`}>{formatTime(comment.created_at)}</span>
                    </div>
                    <p className={`text-xs whitespace-pre-wrap leading-relaxed break-words font-medium ${
                      isDark ? 'text-stone-300' : 'text-stone-650'
                    }`}>
                      {comment.content}
                    </p>
                    {user?.id === comment.author_id && (
                      <div className="flex justify-end pt-1">
                        <button 
                          onClick={() => {
                            if (confirm(isHi ? "क्या आप सच में इस टिप्पणी को हटाना चाहते हैं?" : "Are you sure you want to delete this comment?")) {
                              onDeleteComment(post.id, comment.id);
                            }
                          }}
                          className="text-stone-400 hover:text-rose-600 font-bold text-xs flex items-center gap-1 transition-colors hover:underline cursor-pointer py-1 px-2 rounded-lg hover:bg-rose-500/5 mt-1"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
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
            <div className={`pt-2 border-t ${isDark ? 'border-[#291e17]' : 'border-stone-200'}`}>
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
                  className={`flex-1 text-xs rounded-xl p-2.5 focus:outline-none focus:border-[#5c1d0c] focus:ring-1 focus:ring-[#5c1d0c]/10 resize-none border ${
                    isDark ? 'border-[#5c1d0c]/20 bg-[#130f0c] text-stone-200' : 'border-stone-200 bg-white text-stone-700'
                  }`}
                  aria-label="Comment text content"
                />
                <button
                  onClick={() => onAddComment(post.id)}
                  disabled={!newCommentText.trim()}
                  className="bg-[#5c1d0c] hover:bg-[#4a170a] disabled:opacity-40 disabled:hover:bg-[#5c1d0c] text-white font-bold p-3 rounded-xl flex items-center justify-center hover:scale-98 transition-all shrink-0 w-11 h-11 self-end border-none cursor-pointer"
                  aria-label="Submit Comment"
                >
                  <Send className="w-4 h-4 text-white" />
                </button>
              </div>

              {post.type === 'bhajan_request' && post.request_status === 'open' && (
                <div className="flex items-center gap-2 text-left mt-2 select-none">
                  <input 
                    type="checkbox" 
                    id={`lyrics-submit-check-${post.id}`}
                    checked={commentIsLyricsSubmit}
                    onChange={(e) => setCommentIsLyricsSubmit(e.target.checked)}
                    className="w-3.5 h-3.5 accent-[#5c1d0c] cursor-pointer"
                  />
                  <label htmlFor={`lyrics-submit-check-${post.id}`} className="text-[10px] font-bold text-stone-400 cursor-pointer select-none">
                    {isHi ? "इस टिप्पणी को भजन के बोल के रूप में जमा करें (अनुरोध समीक्षा के लिए चला जाएगा)" : "Submit this comment as the Bhajan Lyrics (moves request to pending review)"}
                  </label>
                </div>
              )}
            </div>
          ) : (
            <p className="text-[10px] text-stone-500 text-center mt-2">
              {isHi ? "सत्संग वार्तालाप में भाग लेने के लिए कृपया लॉग इन करें।" : "Please log in to participate in the satsang conversation."}
            </p>
          )}
        </div>
      )}
    </div>
  );
}
