/**
 * GroupHall.tsx
 *
 * Redesigned Group Detail View following user feedback:
 *  - Boxed About (विवरण) section with a fixed height (h-[120px]) and layout wrapper.
 *  - 8 Community Features cards in a 4-column layout matching the mockup screenshot.
 *  - Active features tiles have a Maroon border indicator on the left side (border-l-4 border-l-[#7A1F1F]).
 *  - Restored horizontal x-scrollable tab switcher below features, completely scrollbar-hidden and with larger text.
 *  - Only 1 mandala watermark in the background.
 */

import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { 
  ChevronLeft, ChevronRight, Plus, Users, MessageSquare, 
  Calendar, Copy, Trash2, Globe, Lock, Bell, Share2, 
  MoreVertical, Search, Music, Sparkles, Image, Smile, Mic, Bookmark, Flame, Trophy,
  Shield, Check, ArrowRight, HeartHandshake, BookOpen
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { communityApi, type Group, type CommunityPost, type PostComment, type GroupMember, type EventRsvpStatus } from "@/lib/community/communityApi";
import { SatsangFeedTab } from "@/components/community/SatsangFeedTab";
import { EventsTab } from "@/components/community/EventsTab";
import { DevoteesTab } from "@/components/community/DevoteesTab";
import { PostCard } from "@/components/community/PostCard";
import { goBack } from "@/lib/navigation";
import { resolveCommunityCover } from "@/lib/community/communityCovers";

// Image assets (re-used from JoinCommunityPage)
import mandalaBeige from "@/pages/images/mandala-beige.svg";
import mandalaGold from "@/pages/images/mandala-gold.svg";

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

function resolveCover(deity: string) {
  return resolveCommunityCover(deity);
}

export interface GroupHallProps {
  // Core data
  group: Group;
  posts: CommunityPost[];
  groupMembers: GroupMember[];
  groupRankings: any[];
  loadingRankings: boolean;
  // Auth
  user: any;
  isHi: boolean;
  // Tab navigation
  activeGroupTab: 'feed' | 'bhajans' | 'requests' | 'events' | 'members' | 'gallery';
  setActiveGroupTab: (tab: 'feed' | 'bhajans' | 'requests' | 'events' | 'members' | 'gallery') => void;
  // Bhajan search/sort
  bhajanSearch: string;
  setBhajanSearch: (v: string) => void;
  bhajanSort: string;
  setBhajanSort: (v: string) => void;
  // Announcements
  dismissedAnnouncements: string[];
  setDismissedAnnouncements: React.Dispatch<React.SetStateAction<string[]>>;
  // Member management
  showMemberManagement: boolean;
  setShowMemberManagement: (v: boolean) => void;
  // Post action handlers (from useCommunityPostActions)
  commentsMap: Record<string, PostComment[]>;
  expandedCommentsPostId: string | null;
  newCommentText: string;
  setNewCommentText: (text: string) => void;
  commentIsLyricsSubmit: boolean;
  setCommentIsLyricsSubmit: (v: boolean) => void;
  loadingCommentsPostIds: Record<string, boolean>;
  isSaved: (postId: string) => boolean;
  handleToggleComments: (postId: string) => void;
  handleToggleReaction: (postId: string) => void;
  handleToggleRsvp: (postId: string, currentRsvp: EventRsvpStatus | null, clickedRsvp: EventRsvpStatus) => void;
  handleVoteOption: (postId: string, optionIndex: number) => void;
  handleDeleteComment: (postId: string, commentId: string) => void;
  handleAddComment: (postId: string) => void;
  handleToggleSavePost: (postId: string) => void;
  loadPosts: () => void;
  // Group-level actions
  loadGroups: () => void;
  handleWhatsAppInvite: (group: Group) => void;
  handleCopyGroupLink: (group: Group) => void;
  handleToggleGroupJoin: (group: Group) => void;
  handleDeleteGroupAction: (groupId: string) => void;
  handleRemoveMember: (groupId: string, userId: string) => void;
  // Modal openers
  setCreatePostOpen: (open: boolean) => void;
  setPostType: (type: 'bhajan_share' | 'bhajan_request' | 'question' | 'thought' | 'event' | 'shloka') => void;
  setLogChantsOpen: (open: boolean) => void;
  onStartJapa?: () => void;
}

export function GroupHall({
  group,
  posts,
  groupMembers,
  groupRankings,
  loadingRankings,
  user,
  isHi,
  activeGroupTab,
  setActiveGroupTab,
  bhajanSearch,
  setBhajanSearch,
  bhajanSort,
  setBhajanSort,
  dismissedAnnouncements,
  setDismissedAnnouncements,
  showMemberManagement,
  setShowMemberManagement,
  commentsMap,
  expandedCommentsPostId,
  newCommentText,
  setNewCommentText,
  commentIsLyricsSubmit,
  setCommentIsLyricsSubmit,
  loadingCommentsPostIds,
  isSaved,
  handleToggleComments,
  handleToggleReaction,
  handleToggleRsvp,
  handleVoteOption,
  handleDeleteComment,
  handleAddComment,
  handleToggleSavePost,
  loadPosts,
  loadGroups,
  handleWhatsAppInvite,
  handleCopyGroupLink,
  handleToggleGroupJoin,
  handleDeleteGroupAction,
  handleRemoveMember,
  setCreatePostOpen,
  setPostType,
  setLogChantsOpen,
  onStartJapa,
}: GroupHallProps) {
  const navigate = useNavigate();

  // Derived local data
  const groupPosts = posts.filter(p => p.group_id === group.id);
  
  const adminMembers = groupMembers.filter(m => m.role === 'admin' || m.user_id === group.created_by);
  const creatorName = adminMembers.length > 0
    ? adminMembers.map(a => a.profile?.display_name || (isHi ? "भक्त" : "Devotee")).join(", ")
    : (isHi ? "प्रशासक" : "Admin");

  const deityInfo = DEITIES.find(d => d.id?.toLowerCase() === group.deity?.toLowerCase());
  const hasValidImageUrl = group.image_url &&
    group.image_url.trim() !== "" &&
    group.image_url !== "null" &&
    group.image_url !== "undefined" &&
    (group.image_url.startsWith("http") || group.image_url.startsWith("/") || group.image_url.startsWith("data:"));

  const coverSrc = hasValidImageUrl ? group.image_url! : resolveCover(group.deity);
  const avatarSrc = hasValidImageUrl ? group.image_url! : (deityInfo?.src || DefaultCover);

  // Filtered and sorted bhajans
  let filteredBhajans = groupPosts.filter(p => p.type === 'bhajan_share');
  if (bhajanSearch.trim()) {
    const q = bhajanSearch.toLowerCase();
    filteredBhajans = filteredBhajans.filter(p => p.title?.toLowerCase().includes(q) || p.content?.toLowerCase().includes(q));
  }
  if (bhajanSort === 'newest') {
    filteredBhajans = [...filteredBhajans].sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
  } else if (bhajanSort === 'popular') {
    filteredBhajans = [...filteredBhajans].sort((a, b) => (b.reaction_count || 0) - (a.reaction_count || 0));
  } else if (bhajanSort === 'comments') {
    filteredBhajans = [...filteredBhajans].sort((a, b) => ((b as any).comment_count || 0) - ((a as any).comment_count || 0));
  }

  // Delete post handler (confirmed via PostCard in-app modal)
  const handleDeletePost = async (id: string) => {
    try {
      await communityApi.softRemovePost(id);
      toast.success(isHi ? "पोस्ट हटा दी गई!" : "Post deleted!");
      loadPosts();
    } catch (err) {
      console.error("Delete post error:", err);
      toast.error(isHi ? "हटाने में असमर्थ" : "Failed to delete post");
    }
  };

  // Find user's member profile for avatar
  const memberProfile = groupMembers.find(m => m.user_id === user?.id)?.profile;

  // Retrieve top devotee from rankings for highlights
  const topDevoteeName = groupRankings && groupRankings.length > 0
    ? groupRankings[0].profile?.display_name || (isHi ? "अग्रणी भक्त" : "Top Devotee")
    : (isHi ? "प्रतीक्षारत" : "Pending");

  // Leave Group Confirmation Modal State
  const [leaveConfirmOpen, setLeaveConfirmOpen] = useState(false);
  const [isLeaving, setIsLeaving] = useState(false);
  const [feedFilter, setFeedFilter] = useState<'all' | 'thought' | 'bhajan_share' | 'shloka' | 'event' | 'requests'>('all');

  const handleConfirmLeave = async () => {
    try {
      setIsLeaving(true);
      await handleToggleGroupJoin(group);
      setLeaveConfirmOpen(false);
      navigate("/join-community");
    } catch (err) {
      console.error("Error leaving group:", err);
    } finally {
      setIsLeaving(false);
    }
  };

  return (
    <div className="w-full max-w-5xl mx-auto min-h-screen bg-background dark:bg-background pb-24 shadow-none flex flex-col justify-between text-foreground font-sans relative overflow-hidden px-4 md:px-6">
      
      {/* 1 Single Elegant Mandala background watermark for spiritual elegance */}
      <div className="absolute top-20 right-0 translate-x-24 opacity-[0.04] pointer-events-none w-96 h-96 select-none z-0">
        <img src={mandalaGold} className="w-full h-full object-contain" alt="" />
      </div>

      {/* 1. STICKY NAVIGATION BAR (Matching Website Nav Bar standard h-14) */}
      <header className="sticky top-0 z-40 w-full bg-[#FFFDF8]/95 dark:bg-background/95 backdrop-blur-md border-b border-border/40 py-2 flex items-center justify-between h-14 select-none px-1">
        <div className="flex items-center gap-3 min-w-0 flex-1 text-left">
          <button
            type="button"
            onClick={() => goBack(navigate, "/join-community?tab=groups")}
            className="w-10 h-10 rounded-full border border-[#E8D8C4] dark:border-stone-800 bg-[#FFFDF8]/80 dark:bg-stone-900/60 text-foreground hover:bg-[#651317]/5 hover:text-[#651317] hover:border-[#651317]/30 flex items-center justify-center p-0 active:scale-95 transition-all shadow-xs shrink-0 cursor-pointer"
            aria-label={isHi ? "वापस" : "Back"}
          >
            <ChevronLeft className="w-5 h-5 text-foreground" />
          </button>
          
          <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-full overflow-hidden border-2 border-[#E8D8C4] dark:border-amber-400/30 shrink-0 bg-white p-0.5 shadow-2xs">
            <img 
              src={avatarSrc} 
              alt={group.name} 
              className="w-full h-full object-cover rounded-full" 
            />
          </div>

          <div className="flex flex-col text-left min-w-0">
            <span className="font-display font-black text-base sm:text-lg text-[#651317] dark:text-amber-100 truncate leading-tight">
              {group.name}
            </span>
            <span className="text-[10px] sm:text-[11px] text-[#8C7A6B] dark:text-stone-400 font-bold uppercase tracking-wider mt-0.5 flex items-center gap-1">
              {group.is_public ? (isHi ? "सार्वजनिक समूह" : "Public Group") : (isHi ? "निजी समूह" : "Private Group")}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0 ml-2">
          <button 
            onClick={() => navigate("/notifications")}
            className="relative w-9 h-9 sm:w-9.5 sm:h-9.5 rounded-full border border-[#E8D8C4] dark:border-stone-800 bg-[#FFFDF8]/80 dark:bg-stone-900/60 text-foreground hover:bg-[#651317]/5 hover:text-[#651317] hover:border-[#651317]/30 flex items-center justify-center p-0 active:scale-95 transition-all shadow-xs shrink-0 cursor-pointer"
            title={isHi ? "सूचनाएं" : "Notifications"}
          >
            <Bell className="w-4.5 h-4.5 text-foreground" />
            <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full border border-white dark:border-stone-900" />
          </button>
          <button 
            onClick={() => handleWhatsAppInvite(group)}
            className="w-9 h-9 sm:w-9.5 sm:h-9.5 rounded-full border border-[#E8D8C4] dark:border-stone-800 bg-[#FFFDF8]/80 dark:bg-stone-900/60 text-foreground hover:bg-[#651317]/5 hover:text-[#651317] hover:border-[#651317]/30 flex items-center justify-center p-0 active:scale-95 transition-all shadow-xs shrink-0 cursor-pointer"
            title={isHi ? "व्हाट्सएप साझा करें" : "Share on WhatsApp"}
          >
            <Share2 className="w-4.5 h-4.5 text-foreground" />
          </button>
        </div>
      </header>

      {/* 2. HERO / GROUP DETAILS CARD (Image on Left, Details & Description on Right for both Mobile & Desktop) */}
      <div className="mt-5 sm:mt-6">
        <div className="bg-[#FFFDF8] dark:bg-[#1A120B] border border-[#E8D8C4] dark:border-stone-800 rounded-2xl p-3.5 sm:p-4.5 shadow-xs flex flex-row items-start gap-3.5 sm:gap-5">
          
          {/* Left Side: Group Image (maintains uploaded quality and fixed aspect ratio) */}
          <div className="w-20 h-20 sm:w-28 sm:h-28 md:w-32 md:h-32 rounded-xl overflow-hidden border border-[#E8D8C4] dark:border-stone-800 bg-[#FAF6EE] dark:bg-stone-900 shrink-0 shadow-2xs">
            <img
              src={coverSrc}
              alt={group.name}
              className="w-full h-full object-cover object-center"
              loading="lazy"
            />
          </div>

          {/* Right Side: Group Information */}
          <div className="flex-1 flex flex-col justify-between text-left min-w-0">
            <div>
              <div className="flex items-center gap-1.5 flex-wrap">
                <span className={cn(
                  "text-[9px] sm:text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-full flex items-center gap-1 shadow-2xs",
                  group.is_public 
                    ? "bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800/50" 
                    : "bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-800/50"
                )}>
                  {group.is_public ? <Globe className="w-2.5 h-2.5" /> : <Lock className="w-2.5 h-2.5" />}
                  {group.is_public ? (isHi ? "सार्वजनिक" : "Public") : (isHi ? "निजी" : "Private")}
                </span>
                <span className="text-[9px] sm:text-[10px] font-semibold uppercase tracking-wider bg-[#FAF0E4] dark:bg-[#2B1F14] text-[#651317] dark:text-amber-200 border border-[#E8D8C4] dark:border-amber-400/30 px-2 py-0.5 rounded-full flex items-center gap-1 shadow-2xs">
                  🌸 {group.deity?.toUpperCase()}
                </span>
              </div>

              <h2 className="font-display font-bold text-base sm:text-lg md:text-xl text-[#651317] dark:text-amber-100 leading-tight truncate mt-1">
                {group.name}
              </h2>
              <p className="text-[#8C7A6B] dark:text-stone-400 text-[11px] sm:text-xs mt-1 font-normal line-clamp-2 leading-relaxed">
                {group.description || (isHi ? "परस्पर भक्ति साधना और सामूहिक नाम संकीर्तन।" : "Collective devotional practice and chanting.")}
              </p>
            </div>

            {/* Bottom Statistics Row inside Card */}
            <div className="flex items-center gap-2 sm:gap-3 text-[10px] sm:text-xs text-[#8C7A6B] dark:text-stone-400 font-medium mt-2.5 pt-2 border-t border-[#E8D8C4]/60 dark:border-stone-800/80 flex-wrap">
              <span className="flex items-center gap-1"><Users className="w-3.5 h-3.5 text-[#651317] dark:text-amber-400" /> {group.member_count} {isHi ? "श्रद्धालु" : "Devotees"}</span>
              <span>•</span>
              <span className="flex items-center gap-1"><Flame className="w-3.5 h-3.5 text-[#651317] dark:text-amber-400" /> {(group.total_chants || 0).toLocaleString()} {isHi ? "नाम जाप" : "Chants"}</span>
              <span>•</span>
              <span className="flex items-center gap-1"><Calendar className="w-3.5 h-3.5 text-[#651317] dark:text-amber-400" /> {new Date(group.created_at || Date.now()).toLocaleDateString(isHi ? 'hi-IN' : 'en-US', { day: 'numeric', month: 'short' })}</span>
            </div>
          </div>

        </div>
      </div>

      {/* 2.5 QUICK HIGHLIGHTS STRIP */}
      <div className="mt-4 sm:mt-5">
        <div className="w-full bg-[#FFFDF8] dark:bg-[#1A120B] border border-[#E8D8C4] dark:border-stone-800 rounded-2xl py-2.5 px-2.5 sm:px-4 shadow-xs grid grid-cols-3 divide-x divide-[#E8D8C4]/60 dark:divide-stone-800/80 text-left text-xs">
          <div className="flex items-center gap-2 sm:gap-2.5 px-1 sm:px-2 min-w-0">
            <div className="w-7 h-7 rounded-full bg-[#FAF0E4] dark:bg-[#2B1F14] flex items-center justify-center shrink-0">
              <Flame className="w-3.5 h-3.5 text-[#651317] dark:text-amber-300" />
            </div>
            <div className="min-w-0">
              <span className="font-semibold block text-[9px] sm:text-[10px] text-[#8C7A6B] dark:text-stone-400 uppercase tracking-wider truncate">{isHi ? "दैनिक जाप" : "Daily Jap"}</span>
              <span className="font-semibold text-xs text-[#651317] dark:text-amber-100 truncate block">{isHi ? "1.2K आज" : "1.2K today"}</span>
            </div>
          </div>
          <div className="flex items-center gap-2 sm:gap-2.5 px-2 sm:px-3 min-w-0">
            <div className="w-7 h-7 rounded-full bg-[#FAF0E4] dark:bg-[#2B1F14] flex items-center justify-center shrink-0">
              <Calendar className="w-3.5 h-3.5 text-[#651317] dark:text-amber-300" />
            </div>
            <div className="min-w-0">
              <span className="font-semibold block text-[9px] sm:text-[10px] text-[#8C7A6B] dark:text-stone-400 uppercase tracking-wider truncate">{isHi ? "अगला सत्संग" : "Next Satsang"}</span>
              <span className="font-semibold text-xs text-[#651317] dark:text-amber-100 truncate block">{isHi ? "रविवार 5 PM" : "Sunday 5 PM"}</span>
            </div>
          </div>
          <div className="flex items-center gap-2 sm:gap-2.5 px-2 sm:px-3 min-w-0">
            <div className="w-7 h-7 rounded-full bg-[#FAF0E4] dark:bg-[#2B1F14] flex items-center justify-center shrink-0">
              <Trophy className="w-3.5 h-3.5 text-[#651317] dark:text-amber-300" />
            </div>
            <div className="min-w-0">
              <span className="font-semibold block text-[9px] sm:text-[10px] text-[#8C7A6B] dark:text-stone-400 uppercase tracking-wider truncate">{isHi ? "शीर्ष भक्त" : "Top Devotee"}</span>
              <span className="font-semibold text-xs text-[#651317] dark:text-amber-100 truncate block">{topDevoteeName}</span>
            </div>
          </div>
        </div>
      </div>

      {/* 3. QUICK STATS PANEL (Icon and text in the same line) */}
      <div className="mt-4 sm:mt-5">
        <div className="w-full bg-[#FFFDF8] dark:bg-[#1A120B] border border-[#E8D8C4] dark:border-stone-800 rounded-2xl py-2.5 px-2 sm:px-4 shadow-xs">
          <div className="grid grid-cols-4 divide-x divide-[#E8D8C4]/60 dark:divide-stone-800/80 text-left">
            
            {/* Stat 1: Members */}
            <div className="flex items-center justify-center gap-2 px-1 sm:px-2 min-w-0">
              <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-[#FAF0E4] dark:bg-[#2B1F14] border border-[#F3E5D8]/80 flex items-center justify-center shadow-inner shrink-0">
                <Users className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-[#651317] dark:text-amber-300 stroke-[2.2]" />
              </div>
              <div className="min-w-0">
                <span className="text-xs sm:text-sm font-bold text-[#651317] dark:text-amber-100 leading-tight block truncate">
                  {group.member_count}
                </span>
                <span className="text-[10px] sm:text-[11px] font-medium text-[#8C7A6B] dark:text-stone-400 leading-tight block truncate">
                  {isHi ? "सदस्य" : "Members"}
                </span>
              </div>
            </div>

            {/* Stat 2: Naam Jap */}
            <div className="flex items-center justify-center gap-2 px-1 sm:px-2 min-w-0">
              <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-[#FAF0E4] dark:bg-[#2B1F14] border border-[#F3E5D8]/80 flex items-center justify-center shadow-inner shrink-0">
                <Flame className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-[#651317] dark:text-amber-300 stroke-[2.2]" />
              </div>
              <div className="min-w-0">
                <span className="text-xs sm:text-sm font-bold text-[#651317] dark:text-amber-100 leading-tight block truncate">
                  {group.total_chants && group.total_chants >= 100000 
                    ? `${(group.total_chants / 100000).toFixed(1)}L` 
                    : (group.total_chants || 0).toLocaleString()}
                </span>
                <span className="text-[10px] sm:text-[11px] font-medium text-[#8C7A6B] dark:text-stone-400 leading-tight block truncate">
                  {isHi ? "नाम जाप" : "Naam Jap"}
                </span>
              </div>
            </div>

            {/* Stat 3: Bhajans */}
            <div className="flex items-center justify-center gap-2 px-1 sm:px-2 min-w-0">
              <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-[#FAF0E4] dark:bg-[#2B1F14] border border-[#F3E5D8]/80 flex items-center justify-center shadow-inner shrink-0">
                <Music className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-[#651317] dark:text-amber-300 stroke-[2.2]" />
              </div>
              <div className="min-w-0">
                <span className="text-xs sm:text-sm font-bold text-[#651317] dark:text-amber-100 leading-tight block truncate">
                  {groupPosts.filter(p => p.type === 'bhajan_share').length}
                </span>
                <span className="text-[10px] sm:text-[11px] font-medium text-[#8C7A6B] dark:text-stone-400 leading-tight block truncate">
                  {isHi ? "भजन" : "Bhajans"}
                </span>
              </div>
            </div>

            {/* Stat 4: Events */}
            <div className="flex items-center justify-center gap-2 px-1 sm:px-2 min-w-0">
              <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-[#FAF0E4] dark:bg-[#2B1F14] border border-[#F3E5D8]/80 flex items-center justify-center shadow-inner shrink-0">
                <Calendar className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-[#651317] dark:text-amber-300 stroke-[2.2]" />
              </div>
              <div className="min-w-0">
                <span className="text-xs sm:text-sm font-bold text-[#651317] dark:text-amber-100 leading-tight block truncate">
                  {groupPosts.filter(p => p.type === 'event').length}
                </span>
                <span className="text-[10px] sm:text-[11px] font-medium text-[#8C7A6B] dark:text-stone-400 leading-tight block truncate">
                  {isHi ? "कार्यक्रम" : "Events"}
                </span>
              </div>
            </div>

          </div>
        </div>
      </div>

      {/* 4. ABOUT CARD (Directly below group stats header) */}
      <div className="mt-5 sm:mt-6">
        <div className="bg-[#FFFDF8] dark:bg-[#1A120B] border border-[#E8D8C4] dark:border-stone-800 rounded-2xl p-4 sm:p-5 shadow-xs text-left w-full relative overflow-hidden flex flex-col min-h-[90px]">
          {/* Mandala decorative corner */}
          <img
            src={mandalaGold}
            alt="mandala"
            className="absolute bottom-0 right-0 w-20 h-20 opacity-10 pointer-events-none select-none"
            style={{transform: 'translate(20%, 20%)'}}
          />
          {/* Heading */}
          <h4 className="font-display font-bold text-xs sm:text-sm text-[#651317] dark:text-amber-100 flex items-center gap-1.5 shrink-0 mb-1.5">
            🌿 {isHi ? "विवरण" : "About"}
          </h4>
          {/* Description */}
          <div className="relative z-10 overflow-y-auto scrollbar-none flex-1 max-h-16">
            <p className="text-xs text-[#7A6B60] dark:text-stone-300 font-normal leading-relaxed">
              {group.description || (isHi ? "यह समूह सत्संग चर्चा और सामूहिक नाम जाप के लिए बनाया गया है।" : "This community is dedicated to sharing bhajans and chanting.")}
            </p>
          </div>
          <span className="text-[11px] text-[#8C7A6B] dark:text-stone-400 font-medium mt-2 block truncate shrink-0 relative z-10">
            🕉️ {creatorName ? (isHi ? `प्रशासक: ${creatorName}` : `Admin: ${creatorName}`) : ""}
          </span>
        </div>
      </div>

      {/* 5. UNIFIED ACTION BUTTON SYSTEM (Below group description) */}
      <div className="mt-4 sm:mt-5 space-y-2.5">
        {/* Row 1: Primary Action (Invite Members) */}
        <button
          onClick={() => handleWhatsAppInvite(group)}
          className="w-full inline-flex items-center justify-center gap-2 h-10 sm:h-10.5 px-5 rounded-full bg-[#651317] hover:bg-[#4f0f12] text-white font-semibold text-xs sm:text-sm active:scale-95 transition-all shadow-xs shrink-0 cursor-pointer whitespace-nowrap"
        >
          <Plus className="w-4 h-4 text-white" />
          <span>{isHi ? "सदस्य आमंत्रित करें" : "Invite Members"}</span>
        </button>

        {/* Row 2: Secondary Actions (3 Equal Uniform Roomy Pill Buttons) */}
        <div className="grid grid-cols-3 gap-2 sm:gap-2.5">
          <button
            onClick={() => handleCopyGroupLink(group)}
            className="inline-flex items-center justify-center gap-1.5 h-10 sm:h-10.5 px-2.5 sm:px-4 rounded-full bg-[#FFFDF8] dark:bg-[#1A120B] border border-[#E8D8C4] dark:border-stone-800 text-[#651317] dark:text-amber-100 hover:border-[#651317]/50 font-semibold text-xs sm:text-sm active:scale-95 transition-all shadow-xs cursor-pointer whitespace-nowrap"
          >
            <Copy className="w-3.5 h-3.5 sm:w-4 sm:h-4 shrink-0" />
            <span className="truncate">{isHi ? "लिंक कॉपी" : "Copy Link"}</span>
          </button>

          <button
            onClick={() => setActiveGroupTab('members')}
            className="inline-flex items-center justify-center gap-1.5 h-10 sm:h-10.5 px-2.5 sm:px-4 rounded-full bg-[#FFFDF8] dark:bg-[#1A120B] border border-[#E8D8C4] dark:border-stone-800 text-[#651317] dark:text-amber-100 hover:border-[#651317]/50 font-semibold text-xs sm:text-sm active:scale-95 transition-all shadow-xs cursor-pointer whitespace-nowrap"
          >
            <Users className="w-3.5 h-3.5 sm:w-4 sm:h-4 shrink-0" />
            <span className="truncate">{isHi ? "लीडरबोर्ड" : "Leaderboard"}</span>
          </button>

          {group.created_by === user?.id ? (
            <button
              onClick={() => handleDeleteGroupAction(group.id)}
              className="inline-flex items-center justify-center gap-1.5 h-10 sm:h-10.5 px-2.5 sm:px-4 rounded-full bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/50 text-rose-700 dark:text-rose-300 hover:bg-rose-100 font-semibold text-xs sm:text-sm active:scale-95 transition-all shadow-xs cursor-pointer whitespace-nowrap"
            >
              <Trash2 className="w-3.5 h-3.5 sm:w-4 sm:h-4 shrink-0" />
              <span className="truncate">{isHi ? "हटाएं" : "Delete"}</span>
            </button>
          ) : (
            <button
              onClick={() => setLeaveConfirmOpen(true)}
              className="inline-flex items-center justify-center gap-1.5 h-10 sm:h-10.5 px-2.5 sm:px-4 rounded-full bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/50 text-rose-700 dark:text-rose-300 hover:bg-rose-100 font-semibold text-xs sm:text-sm active:scale-95 transition-all shadow-xs cursor-pointer whitespace-nowrap"
            >
              <Trash2 className="w-3.5 h-3.5 sm:w-4 sm:h-4 shrink-0" />
              <span className="truncate">{isHi ? "छोड़ें" : "Leave"}</span>
            </button>
          )}
        </div>
      </div>

      {/* Leave Group Confirmation Modal */}
      {leaveConfirmOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-[#FFFDF8] dark:bg-[#1A120B] border border-[#E8D8C4] dark:border-stone-800 rounded-2xl p-5 max-w-sm w-full shadow-lg text-center space-y-4 animate-in fade-in zoom-in-95 duration-200">
            <div className="w-11 h-11 rounded-full bg-rose-100 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400 mx-auto flex items-center justify-center">
              <Trash2 className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-display font-bold text-base text-[#651317] dark:text-amber-100">
                {isHi ? "समूह छोड़ें?" : "Leave Group?"}
              </h3>
              <p className="text-xs text-[#7A6B60] dark:text-stone-300 mt-1.5 leading-relaxed">
                {isHi 
                  ? `क्या आप वाकई "${group.name}" समूह को छोड़ना चाहते हैं?` 
                  : `Are you sure you want to leave "${group.name}"?`}
              </p>
            </div>
            <div className="flex gap-2 justify-center pt-1">
              <button
                onClick={() => setLeaveConfirmOpen(false)}
                disabled={isLeaving}
                className="inline-flex items-center justify-center h-9 px-4 rounded-full bg-[#FAF6EE] dark:bg-stone-800 border border-[#E8D8C4] text-[#8C7A6B] dark:text-stone-300 hover:text-[#651317] font-semibold text-xs active:scale-95 transition-all shadow-xs cursor-pointer flex-1"
              >
                {isHi ? "रद्द करें" : "Cancel"}
              </button>
              <button
                onClick={handleConfirmLeave}
                disabled={isLeaving}
                className="inline-flex items-center justify-center h-9 px-4 rounded-full bg-rose-600 hover:bg-rose-700 text-white font-semibold text-xs active:scale-95 transition-all shadow-xs cursor-pointer flex-1"
              >
                {isLeaving ? (isHi ? "छोड़ रहे हैं..." : "Leaving...") : (isHi ? "हाँ, छोड़ें" : "Leave")}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 7. COMMUNITY FEATURES / QUICK POST ACTIONS (8 Tiles that launch dedicated actions) */}
      <div className="mt-5 sm:mt-6 text-left">
        <h4 className="font-display font-bold text-xs sm:text-sm md:text-base text-[#651317] dark:text-amber-100 flex items-center gap-1.5 mb-3">
          ✨ {isHi ? "त्वरित पोस्ट व सामुदायिक क्रियाएँ" : "Quick Actions & Posts"}
        </h4>
        
        {/* Fixed 4-Column x 2-Row Non-Scrolling Grid with Action Launchers */}
        <div className="bg-[#FFFDF8] dark:bg-[#1A120B] border border-[#E8D8C4] dark:border-stone-800 rounded-2xl p-3 sm:p-4 shadow-xs">
          <div className="grid grid-cols-4 gap-2.5 sm:gap-3.5">
            {[
              { 
                id: 'satsang', 
                icon: MessageSquare, 
                title: isHi ? 'सत्संग' : 'Satsang', 
                desc: isHi ? 'विचार लिखें' : 'Post thought',
                action: () => { setPostType('thought'); setCreatePostOpen(true); }
              },
              { 
                id: 'bhajans', 
                icon: Music, 
                title: isHi ? 'भजन' : 'Bhajans', 
                desc: isHi ? 'भजन साझा करें' : 'Share bhajan',
                action: () => { setPostType('bhajan_share'); setCreatePostOpen(true); }
              },
              { 
                id: 'shloka', 
                icon: BookOpen, 
                title: isHi ? 'श्लोक' : 'Shloka', 
                desc: isHi ? 'श्लोक साझा करें' : 'Post shloka',
                action: () => { setPostType('shloka'); setCreatePostOpen(true); }
              },
              { 
                id: 'events', 
                icon: Calendar, 
                title: isHi ? 'कार्यक्रम' : 'Events', 
                desc: isHi ? 'सत्संग जोड़ें' : 'Host event',
                action: () => { setPostType('event'); setCreatePostOpen(true); }
              },
              { 
                id: 'naam_jap', 
                icon: Flame, 
                title: isHi ? 'नाम जाप' : 'Start Japa', 
                desc: isHi ? 'साधना प्रारंभ करें' : 'Start Sadhana',
                action: () => {
                  if (onStartJapa) {
                    onStartJapa();
                  } else {
                    navigate(`/meditation?practice=mantra_jap_home&showSetup=true&groupId=${group.id}`);
                  }
                }
              },
              { 
                id: 'requests', 
                icon: Sparkles, 
                title: isHi ? 'प्रार्थना' : 'Requests', 
                desc: isHi ? 'अनुरोध पूछें' : 'Ask request',
                action: () => { setPostType('question'); setCreatePostOpen(true); }
              },
              { 
                id: 'members', 
                icon: Trophy, 
                title: isHi ? 'लीडरबोर्ड' : 'Leaderboard', 
                desc: isHi ? 'जप रैंकिंग' : 'Top devotees',
                action: () => setActiveGroupTab('members')
              },
              { 
                id: 'upload', 
                icon: Plus, 
                title: isHi ? 'नई पोस्ट' : 'New Post', 
                desc: isHi ? 'सभी विकल्प' : 'Create post',
                action: () => setCreatePostOpen(true)
              }
            ].map(item => {
              const IconComp = item.icon;

              return (
                <div
                  key={item.id}
                  onClick={item.action}
                  className="rounded-xl sm:rounded-2xl p-2 sm:p-3 flex flex-col items-center justify-between text-center cursor-pointer transition-all duration-200 hover:shadow-md hover:-translate-y-0.5 active:scale-[0.97] min-h-[92px] sm:min-h-[108px] bg-[#FFFDF8] dark:bg-[#16110B] border border-[#E8D8C4] dark:border-stone-800/80 hover:border-[#651317]/50 shadow-2xs group select-none"
                >
                  <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-full border border-[#F3E5D8]/80 flex items-center justify-center mx-auto mb-1.5 shadow-inner shrink-0 bg-[#FAF0E4] dark:bg-[#2B1F14] text-[#651317] dark:text-amber-300 group-hover:bg-[#651317] group-hover:text-white transition-colors">
                    <IconComp className="w-5 h-5 stroke-[1.5]" />
                  </div>
                  <div className="w-full">
                    <h3 className="font-display font-semibold text-[11px] sm:text-xs text-[#651317] dark:text-amber-100 text-center leading-tight truncate">
                      {item.title}
                    </h3>
                    <p className="text-[9px] sm:text-[10px] font-normal text-[#8C7A6B] dark:text-stone-400 text-center leading-tight mt-0.5 truncate hidden sm:block">
                      {item.desc}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* ─── TAB CONTENT (Feed & Members) ─── */}
      <div className="mt-5 space-y-4">
        {/* If Active Tab is Members/Leaderboard */}
        {activeGroupTab === 'members' ? (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <button
                onClick={() => setActiveGroupTab('feed')}
                className="inline-flex items-center gap-1.5 text-xs font-bold text-[#651317] dark:text-amber-300 hover:underline cursor-pointer"
              >
                <ChevronLeft className="w-4 h-4" />
                <span>{isHi ? "फीड पर वापस जाएं" : "Back to Feed"}</span>
              </button>
            </div>
            <DevoteesTab groupMembers={groupMembers} groupRankings={groupRankings} isHi={isHi} />
          </div>
        ) : (
          <div className="space-y-4">
            {/* 8. POST COMPOSER CARD (Placed above the Filter Bar) */}
            {user && (
              <div className="bg-[#FFFDF8] dark:bg-[#1A120B] border border-[#E8D8C4] dark:border-stone-800 rounded-2xl p-3.5 sm:p-4 shadow-xs space-y-3 text-left">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full overflow-hidden border border-[#E8D8C4] shrink-0 bg-[#FAF0E4] dark:bg-[#2B1F14] flex items-center justify-center">
                    {memberProfile?.avatar_url ? (
                      <img
                        src={memberProfile.avatar_url}
                        alt="User"
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <span className="font-bold text-xs text-[#651317] dark:text-amber-300 uppercase">
                        {(user?.user_metadata?.display_name || user?.email || "D")[0]}
                      </span>
                    )}
                  </div>
                  <button
                    onClick={() => { setPostType('thought'); setCreatePostOpen(true); }}
                    className="flex-1 text-left text-[#8C7A6B] dark:text-stone-400 text-xs sm:text-sm font-medium py-1.5 px-3 rounded-xl bg-[#FAF6EE] dark:bg-stone-900 border border-[#E8D8C4]/60 hover:border-[#651317]/30 transition-all cursor-pointer"
                  >
                    😊 {isHi ? "विचार साझा करें..." : "Share your thoughts..."}
                  </button>
                </div>

                <div className="flex items-center justify-between border-t border-[#E8D8C4]/50 dark:border-stone-800 pt-2.5">
                  <div className="flex items-center gap-2">
                    <button 
                      onClick={() => { setPostType('thought'); setCreatePostOpen(true); }}
                      className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold text-[#8C7A6B] hover:text-[#651317] hover:bg-[#FAF0E4] dark:hover:bg-stone-800 transition-colors cursor-pointer"
                    >
                      <Image className="w-3.5 h-3.5 text-[#651317] dark:text-amber-400" />
                      <span>{isHi ? "चित्र" : "Media"}</span>
                    </button>
                    <button 
                      onClick={() => { setPostType('thought'); setCreatePostOpen(true); }}
                      className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold text-[#8C7A6B] hover:text-[#651317] hover:bg-[#FAF0E4] dark:hover:bg-stone-800 transition-colors cursor-pointer"
                    >
                      <Smile className="w-3.5 h-3.5 text-[#651317] dark:text-amber-400" />
                      <span>{isHi ? "इमोजी" : "Emoji"}</span>
                    </button>
                    <button 
                      onClick={() => { setPostType('thought'); setCreatePostOpen(true); }}
                      className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold text-[#8C7A6B] hover:text-[#651317] hover:bg-[#FAF0E4] dark:hover:bg-stone-800 transition-colors cursor-pointer"
                    >
                      <Mic className="w-3.5 h-3.5 text-[#651317] dark:text-amber-400" />
                      <span>{isHi ? "आवाज" : "Voice"}</span>
                    </button>
                  </div>

                  <button
                    onClick={() => { setPostType('thought'); setCreatePostOpen(true); }}
                    className="inline-flex items-center justify-center gap-1.5 h-8 sm:h-8.5 px-4 rounded-full bg-[#651317] hover:bg-[#4f0f12] text-white font-semibold text-xs active:scale-95 transition-all shadow-xs shrink-0 cursor-pointer"
                  >
                    {isHi ? "पोस्ट करें" : "Post"}
                  </button>
                </div>
              </div>
            )}

            {/* 9. MODERN FILTER SECTION (Placed directly below Post Composer and above feed) */}
            <div className="pt-1">
              <div 
                className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none [&::-webkit-scrollbar]:hidden text-left scroll-smooth"
                style={{ msOverflowStyle: 'none', scrollbarWidth: 'none' }}
              >
                {[
                  { id: 'all', label: isHi ? '🌟 सभी' : '🌟 All', count: groupPosts.length },
                  { id: 'thought', label: isHi ? '💬 सत्संग' : '💬 Satsang', count: groupPosts.filter(p => p.type === 'thought' || !p.type).length },
                  { id: 'bhajan_share', label: isHi ? '🎵 भजन' : '🎵 Bhajan', count: groupPosts.filter(p => p.type === 'bhajan_share').length },
                  { id: 'shloka', label: isHi ? '📖 श्लोक' : '📖 Shloka', count: groupPosts.filter(p => p.type === 'shloka' || p.content?.startsWith('[SHLOKA]') || p.content?.includes('📖 भावार्थ') || p.content?.includes('📖 अर्थ')).length },
                  { id: 'event', label: isHi ? '📅 कार्यक्रम' : '📅 Events', count: groupPosts.filter(p => p.type === 'event').length },
                  { id: 'requests', label: isHi ? '✨ प्रार्थना' : '✨ Requests', count: groupPosts.filter(p => p.type === 'bhajan_request' || p.type === 'question').length },
                  { id: 'leaderboard', label: isHi ? '🏆 लीडरबोर्ड' : '🏆 Leaderboard', isTab: true },
                ].map(tab => {
                  const isTab = (tab as any).isTab;
                  const isActive = isTab 
                    ? activeGroupTab === 'members' 
                    : (activeGroupTab === 'feed' && feedFilter === tab.id);

                  return (
                    <button
                      key={tab.id}
                      onClick={() => {
                        if (isTab) {
                          setActiveGroupTab('members');
                        } else {
                          setActiveGroupTab('feed');
                          setFeedFilter(tab.id as any);
                        }
                      }}
                      className={cn(
                        "inline-flex items-center justify-center gap-1.5 h-8 sm:h-8.5 px-3.5 sm:px-4 rounded-full font-bold text-xs active:scale-95 transition-all shadow-xs shrink-0 cursor-pointer whitespace-nowrap border",
                        isActive
                          ? "bg-[#651317] text-white border-[#651317] shadow-xs"
                          : "bg-[#FFFDF8] dark:bg-[#1A120B] border-[#E8D8C4] dark:border-stone-800 text-[#651317] dark:text-stone-300 hover:border-[#651317]/50"
                      )}
                    >
                      <span>{tab.label}</span>
                      {typeof tab.count === 'number' && (
                        <span className={cn(
                          "text-[10px] px-1.5 py-0.2 rounded-full tabular-nums font-extrabold",
                          isActive
                            ? "bg-white/20 text-white"
                            : "bg-[#FAF0E4] dark:bg-[#2B1F14] text-[#651317] dark:text-amber-300"
                        )}>
                          {tab.count}
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* 10. POST FEED (Filtered by selected filter) */}
            {(() => {
              const displayedPosts = groupPosts.filter((p) => {
                if (feedFilter === 'all') return true;
                if (feedFilter === 'thought') return p.type === 'thought' || !p.type;
                if (feedFilter === 'bhajan_share') return p.type === 'bhajan_share';
                if (feedFilter === 'shloka') {
                  return p.type === 'shloka' || (p.content && (p.content.startsWith('[SHLOKA]') || p.content.includes('📖 भावार्थ') || p.content.includes('📖 अर्थ') || p.content.includes('भावार्थ:')));
                }
                if (feedFilter === 'event') return p.type === 'event';
                if (feedFilter === 'requests') return p.type === 'bhajan_request' || p.type === 'question';
                return true;
              });

              if (displayedPosts.length === 0) {
                return (
                  <div className="text-center py-8 bg-[#FFFDF8] dark:bg-[#1A120B] border border-[#E8D8C4] dark:border-stone-800 rounded-2xl px-5 relative overflow-hidden shadow-xs">
                    <span className="text-2xl block select-none mb-1.5">🌸</span>
                    <h4 className="font-display font-bold text-sm text-[#651317] dark:text-amber-100">
                      {isHi ? "इस श्रेणी में कोई पोस्ट नहीं है" : "No Posts in this category"}
                    </h4>
                    <p className="text-[#8C7A6B] dark:text-stone-400 font-normal text-xs mt-1 max-w-xs mx-auto leading-relaxed">
                      {isHi 
                        ? "पहला भक्तिमय पोस्ट साझा करें और सत्संग शुरू करें!" 
                        : "Share a spiritual post and start the discussion."}
                    </p>
                    <div className="mt-3 flex justify-center">
                      <button
                        onClick={() => { 
                          if (feedFilter === 'bhajan_share') setPostType('bhajan_share');
                          else if (feedFilter === 'shloka') setPostType('shloka');
                          else if (feedFilter === 'event') setPostType('event');
                          else if (feedFilter === 'requests') setPostType('question');
                          else setPostType('thought');
                          setCreatePostOpen(true); 
                        }}
                        className="inline-flex items-center justify-center gap-1.5 h-8 sm:h-8.5 px-4 rounded-full bg-[#651317] hover:bg-[#4f0f12] text-white font-semibold text-xs active:scale-95 transition-all shadow-xs cursor-pointer leading-none whitespace-nowrap"
                      >
                        <Plus className="w-3.5 h-3.5 text-white" />
                        <span>{isHi ? "पहली पोस्ट लिखें" : "Write First Post"}</span>
                      </button>
                    </div>
                  </div>
                );
              }

              return (
                <div className="space-y-4">
                  {displayedPosts.map(post => (
                    <PostCard
                      key={post.id} post={post} user={user} isHi={isHi}
                      comments={commentsMap[post.id] || []}
                      isCommentsExpanded={expandedCommentsPostId === post.id}
                      onToggleComments={handleToggleComments} onToggleReaction={handleToggleReaction}
                      onToggleRsvp={handleToggleRsvp} onVoteOption={handleVoteOption}
                      onDeleteComment={handleDeleteComment} onAddComment={handleAddComment}
                      newCommentText={newCommentText} setNewCommentText={setNewCommentText}
                      commentIsLyricsSubmit={commentIsLyricsSubmit} setCommentIsLyricsSubmit={setCommentIsLyricsSubmit}
                      isLoadingComments={loadingCommentsPostIds[post.id]}
                      isPostSaved={isSaved(post.id)} onToggleSavePost={handleToggleSavePost}
                      onDeletePost={handleDeletePost}
                      onPostUpdated={loadPosts}
                    />
                  ))}
                </div>
              );
            })()}
          </div>
        )}

        {/* TAB 2: BHAJANS */}
        {activeGroupTab === 'bhajans' && (
          <div className="space-y-4">
            {/* Search & Sort Panel */}
            <div className="flex flex-col sm:flex-row gap-2.5 bg-[#FFFDF8] dark:bg-[#1A120B] border border-[#E8D8C4] dark:border-stone-800 p-3 rounded-2xl shadow-xs">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-2.5 w-4 h-4 text-stone-400" />
                <Input
                  type="text"
                  placeholder={isHi ? "भजन खोजें..." : "Search shared bhajans..."}
                  value={bhajanSearch}
                  onChange={(e) => setBhajanSearch(e.target.value)}
                  className="pl-9 h-9 border-[#E8D8C4] dark:border-stone-800 rounded-xl text-xs"
                />
              </div>
              <select
                value={bhajanSort}
                onChange={(e) => setBhajanSort(e.target.value)}
                className="h-9 rounded-xl border border-[#E8D8C4] dark:border-stone-800 bg-[#FCF8F3] dark:bg-stone-955 px-3 py-1 text-xs font-bold text-stone-700 dark:text-stone-300 w-full sm:w-auto"
              >
                <option value="newest">{isHi ? "नवीनतम" : "Newest"}</option>
                <option value="popular">{isHi ? "लोकप्रिय" : "Popular"}</option>
                <option value="comments">{isHi ? "चर्चित" : "Most Commented"}</option>
              </select>
            </div>

            {/* Bhajan Composer CTA */}
            <div
              onClick={() => { setPostType('bhajan_share'); setCreatePostOpen(true); }}
              className="bg-[#FFFDF8] dark:bg-[#1A120B] border border-[#E8D8C4] dark:border-stone-800 rounded-2xl p-3.5 flex items-center justify-between shadow-xs hover:border-[#651317]/40 cursor-pointer select-none transition-all"
              role="button"
            >
              <span className="text-[#8C7A6B] dark:text-stone-400 text-xs font-medium text-left">
                {isHi ? "समूह में कोई भजन साझा करें..." : "Share a bhajan lyrics link or video..."}
              </span>
              <button className="w-8 h-8 rounded-full bg-[#651317] hover:bg-[#4f0f12] text-white flex items-center justify-center shadow-xs shrink-0 cursor-pointer" aria-label="Share bhajan">
                <Plus className="w-4 h-4 text-white" />
              </button>
            </div>

            {filteredBhajans.length === 0 ? (
              <div className="text-center py-16 bg-[#FFFDF8] dark:bg-[#1A120B] border border-[#E8D8C4] dark:border-stone-800 rounded-2xl px-6 shadow-xs">
                <span className="text-3xl block select-none">🎵</span>
                <p className="text-[#8C7A6B] dark:text-stone-400 font-medium text-xs mt-3 leading-relaxed">
                  {isHi ? "कोई भजन नहीं मिला। भजन साझा करने वाले पहले व्यक्ति बनें!" : "No shared bhajans found. Be the first to share a devotional melody!"}
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {filteredBhajans.map(post => (
                  <PostCard
                    key={post.id} post={post} user={user} isHi={isHi}
                    comments={commentsMap[post.id] || []}
                    isCommentsExpanded={expandedCommentsPostId === post.id}
                    onToggleComments={handleToggleComments} onToggleReaction={handleToggleReaction}
                    onToggleRsvp={handleToggleRsvp} onVoteOption={handleVoteOption}
                    onDeleteComment={handleDeleteComment} onAddComment={handleAddComment}
                    newCommentText={newCommentText} setNewCommentText={setNewCommentText}
                    commentIsLyricsSubmit={commentIsLyricsSubmit} setCommentIsLyricsSubmit={setCommentIsLyricsSubmit}
                    isLoadingComments={loadingCommentsPostIds[post.id]}
                    isPostSaved={isSaved(post.id)} onToggleSavePost={handleToggleSavePost}
                    onDeletePost={handleDeletePost}
                    onPostUpdated={loadPosts}
                  />
                ))}
              </div>
            )}
          </div>
        )}

        {/* TAB 3: BHAJAN REQUESTS */}
        {activeGroupTab === 'requests' && (
          <div className="space-y-4">
            <div
              onClick={() => { setPostType('bhajan_request'); setCreatePostOpen(true); }}
              className="bg-[#FFFDF8] dark:bg-[#1A120B] border border-[#E8D8C4] dark:border-stone-800 rounded-2xl p-3.5 flex items-center justify-between shadow-xs hover:border-[#651317]/40 cursor-pointer select-none transition-all"
              role="button"
            >
              <span className="text-[#8C7A6B] dark:text-stone-400 text-xs font-medium text-left">
                {isHi ? "दुर्लभ भजन के बोल या जानकारी का अनुरोध करें..." : "Request a bhajan's lyrics or chords..."}
              </span>
              <button className="w-8 h-8 rounded-full bg-[#651317] hover:bg-[#4f0f12] text-white flex items-center justify-center shadow-xs shrink-0 cursor-pointer" aria-label="Request bhajan">
                <Plus className="w-4 h-4 text-white" />
              </button>
            </div>

            {(() => {
              const requestPosts = groupPosts.filter(p => p.type === 'bhajan_request');
              if (requestPosts.length === 0) {
                return (
                  <div className="text-center py-16 bg-white dark:bg-stone-900 border border-orange-500/10 rounded-2xl px-6">
                    <span className="text-3xl block select-none">📿</span>
                    <p className="text-stone-500 dark:text-stone-400 font-medium text-xs mt-3 leading-relaxed">
                      {isHi ? "अभी तक कोई भजन अनुरोध नहीं है।" : "No bhajan requests in this group yet."}
                    </p>
                  </div>
                );
              }
              return (
                <div className="space-y-4">
                  {requestPosts.map(post => (
                    <PostCard
                      key={post.id} post={post} user={user} isHi={isHi}
                      comments={commentsMap[post.id] || []}
                      isCommentsExpanded={expandedCommentsPostId === post.id}
                      onToggleComments={handleToggleComments} onToggleReaction={handleToggleReaction}
                      onToggleRsvp={handleToggleRsvp} onVoteOption={handleVoteOption}
                      onDeleteComment={handleDeleteComment} onAddComment={handleAddComment}
                      newCommentText={newCommentText} setNewCommentText={setNewCommentText}
                      commentIsLyricsSubmit={commentIsLyricsSubmit} setCommentIsLyricsSubmit={setCommentIsLyricsSubmit}
                      isLoadingComments={loadingCommentsPostIds[post.id]}
                      isPostSaved={isSaved(post.id)} onToggleSavePost={handleToggleSavePost}
                      onDeletePost={handleDeletePost}
                    onPostUpdated={loadPosts}
                    />
                  ))}
                </div>
              );
            })()}
          </div>
        )}

        {/* TAB 4: EVENTS */}
        {activeGroupTab === 'events' && (
          <EventsTab
            isHi={isHi}
            groupPosts={groupPosts}
            user={user}
            memberGroupIds={group.is_member ? [group.id] : []}
            handleToggleRsvp={handleToggleRsvp}
            loadPosts={loadPosts}
            setPostType={setPostType}
            setCreatePostOpen={setCreatePostOpen}
          />
        )}

        {/* TAB 5: DEVOTEES & LEADERBOARD */}
        {activeGroupTab === 'members' && (
          <DevoteesTab
            isHi={isHi}
            groupRankings={groupRankings}
            loadingRankings={loadingRankings}
            groupMembers={groupMembers}
            currentUserId={user?.id}
          />
        )}

        {/* TAB 6: SACRED GALLERY */}
        {activeGroupTab === 'gallery' && (
          <div className="space-y-4">
            <h3 className="font-display font-extrabold text-sm text-stone-900 dark:text-amber-100 flex items-center gap-1.5 text-left">
              🌸 {isHi ? "दिव्य दर्शन गैलरी" : "Temple Darshan Gallery"}
            </h3>
            {(() => {
              const mediaPosts = groupPosts.filter(p => p.image_url);
              if (mediaPosts.length === 0) {
                return (
                  <div className="text-center py-16 bg-white dark:bg-stone-900 border border-orange-500/10 rounded-2xl px-6">
                    <span className="text-3xl block select-none">🌸</span>
                    <p className="text-stone-500 dark:text-stone-400 font-medium text-xs mt-3 leading-relaxed">
                      {isHi ? "इस समूह में अभी तक कोई दर्शन चित्र साझा नहीं किया गया है।" : "No images or temple darshans shared in this group yet."}
                    </p>
                  </div>
                );
              }
              return (
                <div className="grid grid-cols-2 gap-3">
                  {mediaPosts.map(post => (
                    <div
                      key={post.id}
                      onClick={() => { handleToggleComments(post.id); setActiveGroupTab('feed'); }}
                      className="group relative aspect-square rounded-2xl overflow-hidden border border-orange-500/10 bg-stone-100 dark:bg-stone-955 cursor-pointer shadow-xs hover:border-orange-500/30 transition-all hover:scale-[0.98]"
                    >
                      <img
                        src={post.image_url!}
                        alt="Darshan"
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                        loading="lazy"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-end p-3 font-sans text-left">
                        <span className="text-[10px] text-amber-100 font-bold truncate">@{post.author?.display_name || "Devotee"}</span>
                        <span className="text-[8px] text-stone-300 truncate mt-0.5">{new Date(post.created_at).toLocaleDateString()}</span>
                      </div>
                    </div>
                  ))}
                </div>
              );
            })()}
          </div>
        )}

      </div>
    </div>
  );
}
