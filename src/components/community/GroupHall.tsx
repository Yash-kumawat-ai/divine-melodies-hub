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
  MoreVertical, Search, Music, Sparkles, Image, Smile, Mic, Bookmark, Flame, Trophy
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { communityApi, type Group, type CommunityPost, type PostComment, type GroupMember } from "@/lib/community/communityApi";
import { SatsangFeedTab } from "@/components/community/SatsangFeedTab";
import { EventsTab } from "@/components/community/EventsTab";
import { DevoteesTab } from "@/components/community/DevoteesTab";
import { PostCard } from "@/components/community/PostCard";

// Image assets (re-used from JoinCommunityPage)
import mandalaBeige from "@/pages/images/mandala-beige.svg";
import mandalaGold from "@/pages/images/mandala-gold.svg";
import RamCover from "@/pages/images/lord_ram_high_quality.webp";
import ShivaCover from "@/pages/images/shiv_temple_hd.webp";
import KrishnaCover from "@/pages/images/krishna_mobile_wallpaper.webp";
import HanumanCover from "@/pages/images/hanuman_community_banner_high_quality.webp";
import DefaultCover from "@/pages/images/hindu_temple_sunset_widescreen_high_quality.webp";

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
  const d = deity?.toLowerCase();
  if (d === "rama") return RamCover;
  if (d === "shiva") return ShivaCover;
  if (d === "krishna") return KrishnaCover;
  if (d === "hanuman") return HanumanCover;
  return DefaultCover;
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
  handleToggleRsvp: (postId: string, currentRsvp: "interested" | "going" | null, clickedRsvp: "interested" | "going") => void;
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
  setPostType: (type: 'bhajan_share' | 'bhajan_request' | 'question' | 'thought' | 'event') => void;
  setLogChantsOpen: (open: boolean) => void;
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

  // Delete post handler
  const handleDeletePost = async (id: string) => {
    if (confirm(isHi ? "क्या आप इस पोस्ट को हटाना चाहते हैं?" : "Delete this post?")) {
      await communityApi.softRemovePost(id);
      loadPosts();
    }
  };

  // Find user's member profile for avatar
  const memberProfile = groupMembers.find(m => m.user_id === user?.id)?.profile;

  // Retrieve top devotee from rankings for highlights
  const topDevoteeName = groupRankings && groupRankings.length > 0
    ? groupRankings[0].profile?.display_name || (isHi ? "अग्रणी भक्त" : "Top Devotee")
    : (isHi ? "प्रतीक्षारत" : "Pending");

  return (
    <div className="w-full max-w-5xl mx-auto min-h-screen bg-background dark:bg-background pb-24 shadow-none flex flex-col justify-between text-foreground font-sans relative overflow-hidden px-4 md:px-6">
      
      {/* 1 Single Elegant Mandala background watermark for spiritual elegance */}
      <div className="absolute top-20 right-0 translate-x-24 opacity-[0.04] pointer-events-none w-96 h-96 select-none z-0">
        <img src={mandalaGold} className="w-full h-full object-contain" alt="" />
      </div>

      {/* 1. STICKY NAVIGATION BAR */}
      <div className="sticky top-0 z-40 w-full bg-background/95 dark:bg-background/95 backdrop-blur-md border-b border-[hsl(var(--brand-gold-border))] py-4 flex items-center justify-between h-[64px] select-none">
        <div className="flex items-center gap-3 min-w-0 flex-1 text-left">
          <button
            onClick={() => navigate("/join-community")}
            className="btn-icon shrink-0"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          
          <div className="w-10 h-10 rounded-full overflow-hidden border-2 border-[#C89B3C]/35 shrink-0 bg-white p-0.5 shadow-2xs">
            <img 
              src={avatarSrc} 
              alt={group.name} 
              className="w-full h-full object-cover rounded-full" 
            />
          </div>

          <div className="flex flex-col text-left min-w-0">
            <span className="font-serif font-extrabold text-base text-[#2E2A27] dark:text-amber-50 truncate leading-tight">
              {group.name}
            </span>
            <span className="text-xs text-gold font-extrabold tracking-wider uppercase mt-0.5 flex items-center gap-1">
              {group.is_public ? (isHi ? "सार्वजनिक समूह" : "Public Group") : (isHi ? "निजी समूह" : "Private Group")}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0 ml-2">
          <button 
            className="btn-icon"
            title={isHi ? "सूचनाएं" : "Notifications"}
          >
            <Bell className="w-4 h-4 text-[#7A1F1F] dark:text-[#C89B3C]" />
          </button>
          <button 
            onClick={() => handleWhatsAppInvite(group)}
            className="btn-icon"
            title={isHi ? "साझा करें" : "Share"}
          >
            <Share2 className="w-4 h-4 text-[#7A1F1F] dark:text-[#C89B3C]" />
          </button>
        </div>
      </div>

      {/* 2. HERO BANNER */}
      <div className="mt-6">
        <div className="relative rounded-[22px] overflow-hidden h-[180px] bg-stone-100 dark:bg-stone-955 border border-[#C89B3C]/20 shadow-xs">
          <img
            src={coverSrc}
            alt={group.name}
            className="w-full h-full object-cover object-center"
            loading="lazy"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/35 to-transparent flex flex-col justify-end p-5 text-left">
            <div className="flex items-center gap-2 mb-1.5">
              <span className="text-xs uppercase font-extrabold tracking-wider bg-emerald-600/90 text-white px-2.5 py-0.5 rounded-md flex items-center gap-0.5">
                {group.is_public ? (isHi ? "सार्वजनिक" : "Public") : (isHi ? "निजी" : "Private")}
              </span>
              <span className="text-xs uppercase font-extrabold tracking-wider bg-[#C89B3C] text-[#2D2D2D] px-2.5 py-0.5 rounded-md font-bold flex items-center gap-0.5">
                🌸 {group.deity?.toUpperCase()}
              </span>
            </div>

            <h2 className="font-serif font-black text-3xl text-white leading-tight drop-shadow-sm truncate">
              {group.name}
            </h2>
            <p className="text-amber-100/90 text-xs mt-1 font-bold italic tracking-wide truncate">
              ✦ {isHi ? "परस्पर भक्ति साधना और नाम संकीर्तन यज्ञ" : "Collective devotional practice and chanting"} ✦
            </p>

            {/* Bottom Statistics Row inside Banner */}
            <div className="flex items-center gap-3 text-xs text-amber-100/80 font-semibold mt-3 pt-2.5 border-t border-white/10">
              <span>👥 {group.member_count} {isHi ? "श्रद्धालु" : "Devotees"}</span>
              <span>•</span>
              <span>📿 {(group.total_chants || 0).toLocaleString()} {isHi ? "नाम जाप" : "Chants"}</span>
              <span>•</span>
              <span>📅 {isHi ? "प्रारंभ" : "Created"} {new Date(group.created_at || Date.now()).toLocaleDateString(isHi ? 'hi-IN' : 'en-US', { day: 'numeric', month: 'short' })}</span>
            </div>
          </div>
        </div>
      </div>

      {/* 2.5 QUICK HIGHLIGHTS STRIP */}
      <div className="mt-6">
        <div className="bg-[#FAF6EE] dark:bg-stone-900/60 border border-[#C89B3C]/15 rounded-xl p-3 flex justify-between items-center text-left text-xs text-stone-600 dark:text-stone-300">
          <div className="flex items-center gap-1.5">
            <Flame className="w-4 h-4 text-amber-500 animate-pulse" />
            <div>
              <span className="font-bold block text-stone-505 uppercase text-[10px] tracking-wider">{isHi ? "दैनिक जाप" : "Daily Jap"}</span>
              <span className="font-extrabold text-[#5c1d0c] dark:text-amber-100">{isHi ? "1.2K आज" : "1.2K today"}</span>
            </div>
          </div>
          <div className="h-6 w-px bg-[#C89B3C]/20" />
          <div className="flex items-center gap-1.5">
            <Calendar className="w-4 h-4 text-[#C89B3C]" />
            <div>
              <span className="font-bold block text-stone-505 uppercase text-[10px] tracking-wider">{isHi ? "अगला सत्संग" : "Next Satsang"}</span>
              <span className="font-extrabold text-[#5c1d0c] dark:text-amber-100">{isHi ? "रविवार 5 PM" : "Sunday 5 PM"}</span>
            </div>
          </div>
          <div className="h-6 w-px bg-[#C89B3C]/20" />
          <div className="flex items-center gap-1.5">
            <Trophy className="w-4 h-4 text-amber-500" />
            <div>
              <span className="font-bold block text-stone-505 uppercase text-[10px] tracking-wider">{isHi ? "शीर्ष भक्त" : "Top Devotee"}</span>
              <span className="font-extrabold text-[#5c1d0c] dark:text-amber-100 truncate max-w-[90px] block">{topDevoteeName}</span>
            </div>
          </div>
        </div>
      </div>

      {/* 3. QUICK STATS (Beige background, custom inline SVGs, larger labels) */}
      <div className="mt-5">
        <div className="bg-[#FAF6EE] dark:bg-stone-900 border border-[#C89B3C]/20 rounded-[22px] p-1.5 shadow-2xs grid grid-cols-4 gap-1.5 text-center text-stone-600 relative overflow-hidden">
          
          {/* Column 1: Members */}
          <div className="bg-[#FCF8F3] dark:bg-stone-950/60 rounded-[16px] p-3 flex flex-col items-center justify-between min-h-[90px] relative overflow-hidden border border-[#C89B3C]/10">
            <svg className="w-5 h-5 text-[#C89B3C] relative z-10" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" strokeLinecap="round" strokeLinejoin="round">
              <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
              <circle cx="9" cy="7" r="4" />
              <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
              <path d="M16 3.13a4 4 0 0 1 0 7.75" />
            </svg>
            
            <span className="text-lg font-bold text-[#7A1F1F] dark:text-amber-100 leading-none mt-1.5 relative z-10">{group.member_count}</span>
            <span className="text-[11px] text-stone-500 font-extrabold uppercase tracking-wider mt-1 relative z-10">{isHi ? "सदस्य" : "Members"}</span>
          </div>

          {/* Column 2: Naam Jap */}
          <div className="bg-[#FCF8F3] dark:bg-stone-955 rounded-[16px] p-3 flex flex-col items-center justify-between min-h-[90px] relative overflow-hidden border border-[#C89B3C]/10">
            <svg className="w-5 h-5 text-[#C89B3C] relative z-10" fill="currentColor" viewBox="0 0 24 24">
              <path fill="none" stroke="currentColor" strokeWidth="1.5" d="M12 2a8 8 0 1 0 0 16 8 8 0 1 0 0-16z" strokeDasharray="1.5,2.5" />
              <circle cx="12" cy="18" r="2" fill="currentColor" />
              <path stroke="currentColor" strokeWidth="1.5" d="M12 20v3M10 23h4" />
            </svg>
            
            <span className="text-lg font-bold text-[#7A1F1F] dark:text-amber-100 leading-none mt-1.5 relative z-10">
              {group.total_chants && group.total_chants >= 100000 
                ? `${(group.total_chants / 100000).toFixed(1)}L` 
                : (group.total_chants || 0).toLocaleString()}
            </span>
            <span className="text-[11px] text-stone-500 font-extrabold uppercase tracking-wider mt-1 relative z-10">{isHi ? "नाम जाप" : "Naam Jap"}</span>
          </div>

          {/* Column 3: Bhajans */}
          <div className="bg-[#FCF8F3] dark:bg-stone-955 rounded-[16px] p-3 flex flex-col items-center justify-between min-h-[90px] relative overflow-hidden border border-[#C89B3C]/10">
            <svg className="w-5 h-5 text-[#C89B3C] relative z-10" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" strokeLinecap="round" strokeLinejoin="round">
              <path d="M9 18V5l12-2v13" />
              <circle cx="6" cy="18" r="3" />
              <circle cx="18" cy="16" r="3" />
            </svg>
            
            <span className="text-lg font-bold text-[#7A1F1F] dark:text-amber-100 leading-none mt-1.5 relative z-10">{groupPosts.filter(p => p.type === 'bhajan_share').length}</span>
            <span className="text-[11px] text-stone-500 font-extrabold uppercase tracking-wider mt-1 relative z-10">{isHi ? "भजन" : "Bhajans"}</span>
          </div>

          {/* Column 4: Events */}
          <div className="bg-[#FCF8F3] dark:bg-stone-955 rounded-[16px] p-3 flex flex-col items-center justify-between min-h-[90px] relative overflow-hidden border border-[#C89B3C]/10">
            <svg className="w-5 h-5 text-[#C89B3C] relative z-10" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" strokeLinecap="round" strokeLinejoin="round">
              <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
              <line x1="16" y1="2" x2="16" y2="6" />
              <line x1="8" y1="2" x2="8" y2="6" />
              <line x1="3" y1="10" x2="21" y2="10" />
            </svg>
            
            <span className="text-lg font-bold text-[#7A1F1F] dark:text-amber-100 leading-none mt-1.5 relative z-10">{groupPosts.filter(p => p.type === 'event').length}</span>
            <span className="text-[11px] text-stone-500 font-extrabold uppercase tracking-wider mt-1 relative z-10">{isHi ? "कार्यक्रम" : "Events"}</span>
          </div>

        </div>
      </div>

      {/* 4. PRIMARY ACTION (Invite Members text, decreased height) */}
      <div className="mt-6">
        <button
          onClick={() => handleWhatsAppInvite(group)}
          className="btn-primary btn-full"
        >
          <Plus className="w-4 h-4 text-white" />
          <span>{isHi ? "सदस्य आमंत्रित करें" : "Invite Members"}</span>
        </button>
      </div>

      {/* 5. SECONDARY ACTIONS (Individual bordered buttons with clear gaps) */}
      <div className="mt-6">
        <div className="flex gap-2">
          <button
            onClick={() => handleCopyGroupLink(group)}
            className="btn-secondary flex-1"
          >
            <Copy className="w-3.5 h-3.5" />
            <span>{isHi ? "लिंक कॉपी" : "Copy Link"}</span>
          </button>

          <button
            onClick={() => setActiveGroupTab('members')}
            className="btn-secondary flex-1"
          >
            <Users className="w-3.5 h-3.5" />
            <span>{isHi ? "लीडरबोर्ड" : "Leaderboard"}</span>
          </button>

          {group.created_by === user?.id ? (
            <button
              onClick={() => handleDeleteGroupAction(group.id)}
              className="btn-danger flex-1"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>{isHi ? "हटाएं" : "Delete"}</span>
            </button>
          ) : (
            <button
              onClick={() => handleToggleGroupJoin(group)}
              className="btn-danger flex-1"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>{isHi ? "छोड़ें" : "Leave"}</span>
            </button>
          )}
        </div>
      </div>

      {/* 6. ABOUT CARD (Fixed heading, scrollable description, mandala corner decoration) */}
      <div className="mt-6">
        <div className="bg-white dark:bg-stone-900 border border-[#C89B3C]/20 rounded-[22px] p-4 shadow-sm text-left w-full relative overflow-hidden flex flex-col" style={{minHeight: '120px'}}>
          {/* Mandala decorative corner */}
          <img
            src={mandalaGold}
            alt="mandala"
            className="absolute bottom-0 right-0 w-24 h-24 opacity-15 pointer-events-none select-none"
            style={{transform: 'translate(25%, 25%)'}}
          />
          {/* Fixed heading — never scrolls away */}
          <h4 className="font-serif font-extrabold text-sm text-[#7A1F1F] dark:text-amber-100 flex items-center gap-1.5 shrink-0 mb-1.5">
            🌿 {isHi ? "विवरण" : "About"}
          </h4>
          {/* Scrollable description */}
          <div className="relative z-10 overflow-y-auto scrollbar-none flex-1" style={{maxHeight: '56px'}}>
            <p className="text-[11px] text-stone-500 dark:text-stone-400 font-medium leading-relaxed">
              {group.description || (isHi ? "यह समूह सत्संग चर्चा और सामूहिक नाम जाप के लिए बनाया गया है।" : "This community is dedicated to sharing bhajans and chanting.")}
            </p>
          </div>
          <span className="text-[8px] text-[#C89B3C] font-extrabold uppercase mt-2 block truncate shrink-0 relative z-10">
            🕉️ {creatorName ? (isHi ? `प्रशासक: ${creatorName}` : `Admin: ${creatorName}`) : ""}
          </span>
        </div>
      </div>

      {/* 7. COMMUNITY FEATURES */}
      <div className="mt-6 text-left">
        <h4 className="font-serif font-extrabold text-sm text-[#7A1F1F] dark:text-amber-100 uppercase tracking-wider mb-3">
          🎛️ {isHi ? "सामुदायिक सुविधाएँ" : "Community Features"}
        </h4>
        <div className="bg-white dark:bg-stone-900 border border-[#C89B3C]/15 rounded-[22px] p-4 shadow-2xs">
          {/* Mockup matching 4-column layout */}
          <div className="grid grid-cols-4 gap-2.5">
            {[
              { id: 'feed', iconKey: 'satsang', label: isHi ? 'सत्संग' : 'Satsang' },
              { id: 'bhajans', iconKey: 'bhajan', label: isHi ? 'भजन' : 'Bhajan' },
              { id: 'events', iconKey: 'events', label: isHi ? 'कार्यक्रम' : 'Events' },
              { id: 'members', iconKey: 'leaderboard', label: isHi ? 'रैंकिंग' : 'Leaderboard' },
              { id: 'gallery', iconKey: 'gallery', label: isHi ? 'गैलरी' : 'Gallery' },
              { id: 'requests', iconKey: 'prayer', label: isHi ? 'अनुरोध' : 'Requests' },
              { id: 'naam_jap', iconKey: 'naam_jap', label: isHi ? 'नाम जाप' : 'Naam Jap' },
              { id: 'add_bhajan', iconKey: 'add_bhajan', label: isHi ? 'भजन जोड़ें' : 'Add Bhajan' }
            ].map(item => {
              const isActive = activeGroupTab === item.id;
              
              // Custom inline SVGs for V3 features
              let svgIcon;
              if (item.iconKey === 'satsang') {
                svgIcon = (
                  <svg className="w-5 h-5 mx-auto transition-colors" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                    <circle cx="9" cy="7" r="4" />
                    <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
                    <path d="M16 3.13a4 4 0 0 1 0 7.75" />
                  </svg>
                );
              } else if (item.iconKey === 'bhajan') {
                svgIcon = (
                  <svg className="w-5 h-5 mx-auto transition-colors" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M9 18V5l12-2v13" />
                    <circle cx="6" cy="18" r="3" />
                    <circle cx="18" cy="16" r="3" />
                  </svg>
                );
              } else if (item.iconKey === 'events') {
                svgIcon = (
                  <svg className="w-5 h-5 mx-auto transition-colors" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                    <line x1="16" y1="2" x2="16" y2="6" />
                    <line x1="8" y1="2" x2="8" y2="6" />
                    <line x1="3" y1="10" x2="21" y2="10" />
                  </svg>
                );
              } else if (item.iconKey === 'leaderboard') {
                svgIcon = (
                  <svg className="w-5 h-5 mx-auto transition-colors" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6" />
                    <path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18" />
                    <path d="M4 22h16" />
                    <path d="M10 14.66V17c0 .55-.45 1-1 1H4v2h16v-2h-5c-.55 0-1-.45-1-1v-2.34" />
                    <path d="M12 2a6 6 0 0 1 6 6v3a6 6 0 0 1-6 6 6 6 0 0 1-6-6V8a6 6 0 0 1 6-6z" />
                  </svg>
                );
              } else if (item.iconKey === 'gallery') {
                svgIcon = (
                  <svg className="w-5 h-5 mx-auto transition-colors" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
                    <circle cx="8.5" cy="8.5" r="1.5" />
                    <polyline points="21 15 16 10 5 21" />
                  </svg>
                );
              } else if (item.iconKey === 'prayer') {
                svgIcon = (
                  <svg className="w-5 h-5 mx-auto transition-colors" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M12 22a7 7 0 0 0 5-2l-3-8h-4l-3 8a7 7 0 0 0 5 2z" />
                    <path d="M12 12V3" />
                    <path d="M10 6c0-1.1.9-2 2-2s2 .9 2 2" />
                    <path d="M14 12c1.5 0 2.5 1 2.5 2.5" />
                    <path d="M10 12c-1.5 0-2.5 1-2.5 2.5" />
                  </svg>
                );
              } else if (item.iconKey === 'naam_jap') {
                svgIcon = (
                  <svg className="w-5 h-5 mx-auto text-[#7A1F1F] dark:text-[#C89B3C]" fill="currentColor" viewBox="0 0 24 24">
                    <path fill="none" stroke="currentColor" strokeWidth="1.5" d="M12 2a8 8 0 1 0 0 16 8 8 0 1 0 0-16z" strokeDasharray="1.5,2.5" />
                    <circle cx="12" cy="18" r="2" fill="currentColor" />
                    <path stroke="currentColor" strokeWidth="1.5" d="M12 20v3M10 23h4" />
                  </svg>
                );
              } else if (item.iconKey === 'add_bhajan') {
                svgIcon = (
                  <svg className="w-5 h-5 mx-auto text-[#7A1F1F] dark:text-[#C89B3C]" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="12" cy="12" r="10" />
                    <line x1="12" y1="8" x2="12" y2="16" />
                    <line x1="8" y1="12" x2="16" y2="12" />
                  </svg>
                );
              }

              // Click handler mapping
              const handleCardClick = () => {
                if (item.id === 'naam_jap') {
                  setLogChantsOpen(true);
                } else if (item.id === 'add_bhajan') {
                  navigate("/upload-bhajan");
                } else {
                  setActiveGroupTab(item.id as any);
                }
              };

              return (
                <button
                  key={item.id}
                  onClick={handleCardClick}
                  className={`p-2.5 rounded-xl border text-center transition-all duration-200 active:scale-[0.98] flex flex-col justify-between items-center h-[76px] ${
                    isActive
                      ? "bg-[#FAF6EE] dark:bg-stone-850 border-y border-r border-amber-500/10 border-l-4 border-l-[#7A1F1F] text-[#7A1F1F] shadow-2xs font-extrabold"
                      : "bg-[#FCF8F3] dark:bg-stone-955 border border-amber-500/5 hover:border-amber-500/10 text-[#2D2D2D] dark:text-stone-250"
                  }`}
                >
                  <div className={`shrink-0 ${isActive ? 'text-[#7A1F1F]' : 'text-[#7A1F1F]'}`}>
                    {svgIcon}
                  </div>
                  <span className="text-[10px] font-extrabold block leading-tight mt-1 truncate w-full text-center">
                    {item.label}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* 8. SECTION TABS (Restored horizontal x-scrollable tab switcher with larger text) */}
      <div className="mt-6">
        <div 
          className="flex border-b border-[#C89B3C]/15 pb-2.5 gap-4 overflow-x-auto whitespace-nowrap scrollbar-none [&::-webkit-scrollbar]:hidden text-left"
          style={{ msOverflowStyle: 'none', scrollbarWidth: 'none' }}
        >
          {[
            { id: 'feed', label: isHi ? 'सत्संग' : 'Satsang' },
            { id: 'bhajans', label: isHi ? 'भजन' : 'Bhajan' },
            { id: 'requests', label: isHi ? 'प्रार्थना/अनुरोध' : 'Requests' },
            { id: 'events', label: isHi ? 'कार्यक्रम' : 'Events' },
            { id: 'gallery', label: isHi ? 'गैलरी' : 'Gallery' },
            { id: 'members', label: isHi ? 'सदस्य' : 'Members' },
          ].map(tab => {
            const isActive = activeGroupTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveGroupTab(tab.id as any)}
                className={`tab-item ${isActive ? "tab-active" : ""} text-sm font-bold transition-all duration-200`}
              >
                {tab.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* ─── TAB CONTENT (Feed, Bhajans, Requests, Events, Members, Gallery) ─── */}
      <div className="mt-6">
        
        {/* 9. POST COMPOSER & 10. FEED */}
        {activeGroupTab === 'feed' && (
          <div className="space-y-4">
            {/* Post Composer card */}
            {user && (
              <div className="bg-white dark:bg-stone-900 border border-stone-150 dark:border-stone-850 rounded-[22px] p-4 shadow-2xs space-y-3.5 text-left">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full overflow-hidden border border-stone-200 shrink-0 bg-stone-100">
                    <img
                      src={memberProfile?.avatar_url || "/placeholder-avatar.jpg"}
                      alt="User"
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <button
                    onClick={() => { setPostType('thought'); setCreatePostOpen(true); }}
                    className="flex-1 text-left text-muted-foreground text-sm font-semibold py-2 transition-all"
                  >
                    😊 {isHi ? "विचार साझा करें..." : "Share your thoughts..."}
                  </button>
                </div>

                <div className="flex items-center justify-between border-t border-stone-100/50 pt-3">
                  <div className="flex items-center gap-3">
                    <button 
                      onClick={() => { setPostType('thought'); setCreatePostOpen(true); }}
                      className="btn-ghost btn-sm flex items-center gap-1"
                    >
                      <Image className="w-3.5 h-3.5 text-[#C89B3C]" />
                      <span>{isHi ? "चित्र" : "Media"}</span>
                    </button>
                    <button 
                      onClick={() => { setPostType('thought'); setCreatePostOpen(true); }}
                      className="btn-ghost btn-sm flex items-center gap-1"
                    >
                      <Smile className="w-3.5 h-3.5 text-[#C89B3C]" />
                      <span>{isHi ? "इमोजी" : "Emoji"}</span>
                    </button>
                    <button 
                      onClick={() => { setPostType('thought'); setCreatePostOpen(true); }}
                      className="btn-ghost btn-sm flex items-center gap-1"
                    >
                      <Mic className="w-3.5 h-3.5 text-[#C89B3C]" />
                      <span>{isHi ? "आवाज" : "Voice"}</span>
                    </button>
                  </div>

                  <Button
                    variant="default" size="sm"
                    onClick={() => { setPostType('thought'); setCreatePostOpen(true); }}
                  >
                    {isHi ? "पोस्ट" : "Post"}
                  </Button>
                </div>
              </div>
            )}

            {/* Posts Lists / Empty state */}
            {groupPosts.length === 0 ? (
              <div className="text-center py-10 bg-white dark:bg-stone-900 border border-orange-500/10 rounded-[22px] px-6 relative overflow-hidden shadow-2xs">
                <span className="text-3xl block select-none mb-2">🌸</span>
                <h4 className="font-serif font-extrabold text-sm text-[#7A1F1F] dark:text-amber-100">
                  {isHi ? "सत्संग पोस्ट नहीं है" : "No Satsang Posts Yet"}
                </h4>
                <p className="text-stone-400 font-medium text-[10px] mt-1 max-w-xs mx-auto leading-relaxed">
                  {isHi 
                    ? "पहला भक्तिमय पोस्ट साझा करें और सत्संग शुरू करें!" 
                    : "Share today's spiritual thoughts."}
                </p>
                <Button
                  size="sm"
                  onClick={() => { setPostType('thought'); setCreatePostOpen(true); }}
                >
                  {isHi ? "पहला सत्संग पोस्ट लिखें" : "Write First Post"}
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                {groupPosts.map(post => (
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
                  />
                ))}
              </div>
            )}
          </div>
        )}

        {/* TAB 2: BHAJANS */}
        {activeGroupTab === 'bhajans' && (
          <div className="space-y-4">
            {/* Search & Sort Panel */}
            <div className="flex flex-col gap-2.5 bg-white dark:bg-stone-900 border border-orange-500/10 p-3.5 rounded-2xl shadow-xs">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-2.5 w-4 h-4 text-stone-400" />
                <Input
                  type="text"
                  placeholder={isHi ? "भजन खोजें..." : "Search shared bhajans..."}
                  value={bhajanSearch}
                  onChange={(e) => setBhajanSearch(e.target.value)}
                  className="pl-9 h-9 border-orange-500/10 rounded-xl text-xs"
                />
              </div>
              <select
                value={bhajanSort}
                onChange={(e) => setBhajanSort(e.target.value)}
                className="h-9 rounded-xl border border-orange-500/10 bg-[#FCF8F3] dark:bg-stone-955 px-3 py-1 text-xs font-bold text-stone-700 dark:text-stone-300 w-full"
              >
                <option value="newest">{isHi ? "नवीनतम" : "Newest"}</option>
                <option value="popular">{isHi ? "लोकप्रिय" : "Popular"}</option>
                <option value="comments">{isHi ? "चर्चित" : "Most Commented"}</option>
              </select>
            </div>

            {/* Bhajan Composer CTA */}
            <div
              onClick={() => { setPostType('bhajan_share'); setCreatePostOpen(true); }}
              className="bg-white dark:bg-stone-900 border border-orange-500/10 rounded-2xl p-3.5 flex items-center justify-between shadow-xs hover:border-orange-500/30 hover:shadow-sm cursor-pointer select-none transition-all"
              role="button"
            >
              <span className="text-stone-400 text-xs font-medium text-left">
                {isHi ? "समूह में कोई भजन साझा करें..." : "Share a bhajan lyrics link or video..."}
              </span>
              <button className="btn-primary w-7 h-7 rounded-full flex items-center justify-center" aria-label="Share bhajan">
                <Plus className="w-3.5 h-3.5" />
              </button>
            </div>

            {filteredBhajans.length === 0 ? (
              <div className="text-center py-16 bg-white dark:bg-stone-900 border border-orange-500/10 rounded-2xl px-6">
                <span className="text-3xl block select-none">🎵</span>
                <p className="text-stone-500 dark:text-stone-400 font-medium text-xs mt-3 leading-relaxed">
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
              onClick={() => { setPostType('bhajan_request'); setCreateOpen => { setPostType('bhajan_request'); setCreatePostOpen(true); } }}
              className="bg-white dark:bg-stone-900 border border-orange-500/10 rounded-2xl p-3.5 flex items-center justify-between shadow-xs hover:border-orange-500/30 hover:shadow-sm cursor-pointer select-none transition-all"
              role="button"
            >
              <span className="text-stone-400 text-xs font-medium text-left">
                {isHi ? "दुर्लभ भजन के बोल या जानकारी का अनुरोध करें..." : "Request a bhajan's lyrics or chords..."}
              </span>
              <button className="btn-primary w-7 h-7 rounded-full flex items-center justify-center" aria-label="Request bhajan">
                <Plus className="w-3.5 h-3.5" />
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
            isHi={isHi} groupPosts={groupPosts} user={user}
            commentsMap={commentsMap} expandedCommentsPostId={expandedCommentsPostId}
            newCommentText={newCommentText} setNewCommentText={setNewCommentText}
            commentIsLyricsSubmit={commentIsLyricsSubmit} setCommentIsLyricsSubmit={setCommentIsLyricsSubmit}
            loadingCommentsPostIds={loadingCommentsPostIds} isSaved={isSaved}
            handleToggleComments={handleToggleComments} handleToggleReaction={handleToggleReaction}
            handleToggleRsvp={handleToggleRsvp} handleVoteOption={handleVoteOption}
            handleDeleteComment={handleDeleteComment} handleAddComment={handleAddComment}
            handleToggleSavePost={handleToggleSavePost} loadPosts={loadPosts}
            setPostType={setPostType} setCreatePostOpen={setCreatePostOpen}
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
