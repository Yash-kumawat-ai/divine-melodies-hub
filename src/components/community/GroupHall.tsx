/**
 * GroupHall.tsx
 *
 * The full-screen group detail view — extracted from JoinCommunityPage.tsx
 * as part of Phase 5 refactoring (Engineering Execution Blueprint).
 *
 * Contains:
 *  - Temple Jumbotron Banner (hero cover image + group metadata)
 *  - Action Row (invite, copy link, admin dashboard, leave)
 *  - Members manager panel (admin only)
 *  - About section
 *  - Chanting Goal Progress Altar
 *  - Quick Actions Grid
 *  - Today's Temple Activity Banner
 *  - Group Content Tabs (Feed, Bhajans, Requests, Events, Members, Gallery)
 */

import { useNavigate } from "react-router-dom";
import { Search, Globe, Lock, Sparkles, Send, Copy, Users, Trash2, Plus, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { communityApi, type Group, type CommunityPost, type PostComment, type GroupMember } from "@/lib/community/communityApi";
import { SatsangFeedTab } from "@/components/community/SatsangFeedTab";
import { EventsTab } from "@/components/community/EventsTab";
import { DevoteesTab } from "@/components/community/DevoteesTab";
import { PostCard } from "@/components/community/PostCard";

// Image assets (re-used from JoinCommunityPage)
import mandalaBeige from "@/pages/images/mandala-beige.svg";
import omWebp from "@/pages/images/om.webp";
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

  // ── Derived local data (mirrors original IIFE variables verbatim) ──────────
  const groupPosts = posts.filter(p => p.group_id === group.id);

  const groupAnnouncements = groupPosts.filter(p => {
    const isCreator = p.author_id === group.created_by;
    const isAdmin = groupMembers.find(m => m.user_id === p.author_id)?.role === 'admin';
    return (isCreator || isAdmin) && (p.type === 'thought' || p.type === 'event') && !dismissedAnnouncements.includes(p.id);
  });

  const adminMembers = groupMembers.filter(m => m.role === 'admin' || m.user_id === group.created_by);
  const creatorName = adminMembers.length > 0
    ? adminMembers.map(a => a.profile?.display_name || (isHi ? "भक्त" : "Devotee")).join(", ")
    : (isHi ? "प्रशासक" : "Admin");
  const activeMembersCount = groupRankings.filter(r => r.total_chants > 0).length;

  // Today's activity items
  const todayActivityItems: { title: string; icon: string }[] = [];
  const isToday = (dateStr: string) => new Date(dateStr).toDateString() === new Date().toDateString();

  const newBhajansToday = groupPosts.filter(p => p.type === 'bhajan_share' && isToday(p.created_at)).length;
  if (newBhajansToday > 0) todayActivityItems.push({ title: isHi ? `${newBhajansToday} नए भजन साझा` : `${newBhajansToday} new bhajans shared`, icon: '🎵' });

  const newRequestsToday = groupPosts.filter(p => p.type === 'bhajan_request' && isToday(p.created_at)).length;
  if (newRequestsToday > 0) todayActivityItems.push({ title: isHi ? `${newRequestsToday} नए भजन अनुरोध` : `${newRequestsToday} new bhajan requests`, icon: '📿' });

  const newEventsToday = groupPosts.filter(p => p.type === 'event' && isToday(p.created_at)).length;
  if (newEventsToday > 0) todayActivityItems.push({ title: isHi ? `${newEventsToday} नए कार्यक्रम` : `${newEventsToday} new events`, icon: '📅' });

  const newThoughtsToday = groupPosts.filter(p => p.type === 'thought' && isToday(p.created_at)).length;
  if (newThoughtsToday > 0) todayActivityItems.push({ title: isHi ? `${newThoughtsToday} नए विचार` : `${newThoughtsToday} new thoughts`, icon: '🌿' });

  const newMembersToday = groupMembers.filter(m => isToday(m.joined_at)).length;
  if (newMembersToday > 0) todayActivityItems.push({ title: isHi ? `${newMembersToday} नए भक्त जुड़े` : `${newMembersToday} new devotees joined`, icon: '👥' });

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

  const deityInfo = DEITIES.find(d => d.id?.toLowerCase() === group.deity?.toLowerCase());
  const hasValidImageUrl = group.image_url &&
    group.image_url.trim() !== "" &&
    group.image_url !== "null" &&
    group.image_url !== "undefined" &&
    (group.image_url.startsWith("http") || group.image_url.startsWith("/") || group.image_url.startsWith("data:"));

  const coverSrc = hasValidImageUrl ? group.image_url! : resolveCover(group.deity);
  const avatarSrc = hasValidImageUrl ? group.image_url! : (deityInfo?.src || DefaultCover);

  // Shared PostCard delete handler
  const makeDeleteHandler = (confirmMsg: string) => async (id: string) => {
    if (confirm(confirmMsg)) {
      await communityApi.softRemovePost(id);
      loadPosts();
    }
  };
  const deletePostMsg = isHi ? "क्या आप इस पोस्ट को हटाना चाहते हैं?" : "Delete this post?";
  const handleDeletePost = makeDeleteHandler(deletePostMsg);

  return (
    <div className="max-w-5xl mx-auto px-4 mt-6 pb-20">

      {/* ─── Temple Jumbotron Banner ─────────────────────────────── */}
      <div className="relative rounded-3xl overflow-hidden h-52 border border-amber-500/20 bg-orange-100 dark:bg-stone-950 shadow-md flex items-center justify-center mb-6">
        <img
          src={coverSrc}
          alt={group.name}
          className="w-full h-full object-cover object-center opacity-85 dark:opacity-40"
          loading="lazy"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/40 to-transparent flex flex-col justify-end p-6">
          {/* Group Badges */}
          <div className="flex items-center gap-2 mb-2">
            <span className={`text-[10px] uppercase font-extrabold tracking-wider px-2 py-0.5 rounded-md text-white flex items-center gap-0.5 ${
              group.is_public ? "bg-emerald-600/90" : "bg-rose-600/90"
            }`}>
              <Globe className="w-3 h-3" />
              {group.is_public ? (isHi ? "सार्वजनिक समूह" : "Public Group") : (isHi ? "निजी समूह" : "Private Group")}
            </span>
            <span className="text-[10px] uppercase font-extrabold tracking-wider bg-amber-500 text-amber-950 px-2 py-0.5 rounded-md font-display font-black flex items-center gap-0.5">
              <Sparkles className="w-3 h-3 animate-pulse" />
              {group.deity?.toUpperCase()}
            </span>
            {group.invite_code && (
              <span className="text-[10px] font-extrabold tracking-wider bg-stone-900/70 text-stone-200 border border-stone-700/30 px-2 py-0.5 rounded-md font-mono">
                CODE: {group.invite_code}
              </span>
            )}
          </div>

          {/* Group Typography */}
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
            <div>
              <h2 className="font-display font-black text-2xl md:text-3xl text-white leading-tight drop-shadow-md flex items-center gap-2">
                {group.name}
              </h2>
              <p className="text-amber-100/90 text-xs mt-1.5 font-medium flex flex-wrap items-center gap-x-2 gap-y-1">
                <span>👥 {group.member_count} {isHi ? "श्रद्धालु" : "Devotees"}</span>
                <span>•</span>
                <span>🔥 {loadingRankings ? "..." : activeMembersCount} {isHi ? "सक्रिय भक्त" : "Active Chanting"}</span>
                <span>•</span>
                <span>📅 {isHi ? "प्रारंभ तिथि" : "Created"} {new Date(group.created_at || Date.now()).toLocaleDateString(isHi ? 'hi-IN' : 'en-US', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
              </p>
            </div>
            {/* Admin info */}
            <div className="text-left md:text-right shrink-0">
              <span className="text-[9px] uppercase tracking-wider text-amber-200/75 block font-bold">{isHi ? "समूह प्रशासक (एडमिन)" : "TEMPLE ADMIN"}</span>
              <span className="text-xs font-bold text-white truncate max-w-xs block">{creatorName}</span>
            </div>
          </div>
        </div>
      </div>

      {/* ─── Action Row ──────────────────────────────────────────── */}
      <div className="grid grid-cols-2 sm:flex sm:flex-wrap items-center gap-2 mb-6 w-full">
        <Button
          onClick={() => handleWhatsAppInvite(group)}
          className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-xs flex items-center justify-center gap-1.5 h-9 w-full sm:w-auto px-4 shadow-sm"
        >
          <Send className="w-3.5 h-3.5" />
          {isHi ? "व्हाट्सएप आमंत्रण" : "Invite WhatsApp"}
        </Button>
        <Button
          variant="outline"
          onClick={() => handleCopyGroupLink(group)}
          className="border-orange-500/20 text-orange-600 dark:text-orange-400 bg-white dark:bg-stone-900 hover:bg-orange-500/5 rounded-xl text-xs flex items-center justify-center gap-1.5 h-9 w-full sm:w-auto px-4 shadow-sm"
        >
          <Copy className="w-3.5 h-3.5" />
          {isHi ? "लिंक कॉपी करें" : "Copy Link"}
        </Button>

        {group.created_by === user?.id ? (
          <>
            <Button
              variant="outline"
              onClick={() => setShowMemberManagement(!showMemberManagement)}
              className="border-stone-500/20 text-stone-600 dark:text-stone-300 bg-white dark:bg-stone-900 hover:bg-stone-500/5 rounded-xl text-xs flex items-center justify-center gap-1.5 h-9 w-full sm:w-auto px-4 shadow-sm sm:ml-auto"
            >
              <Users className="w-3.5 h-3.5" />
              {isHi ? "प्रशासक डैशबोर्ड" : "Admin Dashboard"}
            </Button>
            <Button
              variant="outline"
              onClick={() => handleDeleteGroupAction(group.id)}
              className="border-rose-500/20 hover:border-rose-500/40 text-rose-600 bg-white dark:bg-stone-900 hover:bg-rose-50 dark:hover:bg-rose-950/20 rounded-xl text-xs flex items-center justify-center gap-1.5 h-9 w-full sm:w-auto px-3"
            >
              <Trash2 className="w-3.5 h-3.5" />
              {isHi ? "समूह हटाएं" : "Delete Group"}
            </Button>
          </>
        ) : (
          <Button
            variant="outline"
            onClick={() => handleToggleGroupJoin(group)}
            className="border-stone-500/20 text-rose-600 dark:text-rose-400 bg-white dark:bg-stone-900 hover:bg-stone-500/5 rounded-xl text-xs flex items-center justify-center gap-1.5 h-9 w-full sm:w-auto px-4 shadow-sm sm:ml-auto col-span-2 sm:col-span-1"
          >
            {isHi ? "समूह छोड़ें" : "Leave Group"}
          </Button>
        )}
      </div>

      {/* ─── Members Manager Panel (admin only) ──────────────────── */}
      {showMemberManagement && group.created_by === user?.id && (
        <div className="bg-white dark:bg-stone-900 border border-orange-500/10 rounded-2xl p-5 mb-6 shadow-sm animate-[accordion-down_0.2s_ease-out]">
          <h3 className="font-display font-bold text-sm text-orange-950 dark:text-amber-100 mb-3 flex items-center gap-1">
            👥 {isHi ? "सदस्य सूची" : "Member List"}
          </h3>
          <div className="space-y-3 max-h-48 overflow-y-auto">
            {groupMembers.map(m => (
              <div key={m.user_id} className="flex items-center justify-between text-xs py-1.5 border-b border-stone-50 dark:border-stone-950 last:border-b-0">
                <span className="font-bold text-stone-700 dark:text-stone-300">
                  {m.profile?.display_name || "Devotee"}{" "}
                  {m.role === 'admin' && <span className="text-[10px] text-amber-500 bg-amber-500/10 px-1.5 py-0.5 rounded font-black ml-1 uppercase">Admin</span>}
                </span>
                {m.role !== 'admin' && (
                  <button
                    onClick={() => handleRemoveMember(group.id, m.user_id)}
                    className="text-rose-600 hover:underline font-bold"
                  >
                    {isHi ? "हटाएं" : "Remove"}
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ─── About Section ───────────────────────────────────────── */}
      <div className="bg-white dark:bg-stone-900 border border-orange-500/10 rounded-2xl p-5 mb-6 shadow-xs relative overflow-hidden">
        <div className="absolute right-0 bottom-0 translate-x-6 translate-y-6 opacity-[0.08] dark:opacity-[0.03] pointer-events-none w-24 h-24">
          <img src={mandalaBeige} className="w-full h-full object-contain" alt="" />
        </div>
        <h3 className="font-display font-bold text-sm text-orange-950 dark:text-amber-100 mb-2 relative z-10">
          🌿 {isHi ? "समूह विवरण" : "About this Community"}
        </h3>
        <p className="text-xs text-stone-600 dark:text-stone-300 leading-relaxed font-medium relative z-10">
          {group.description || (isHi ? "कोई विवरण उपलब्ध नहीं है।" : "No description provided.")}
        </p>
      </div>

      {/* ─── Chanting Goal Progress Altar ────────────────────────── */}
      {group.target_count && group.target_count > 0 && (
        <div className="bg-white dark:bg-stone-900 border border-amber-500/20 rounded-3xl p-6 shadow-md relative overflow-hidden mb-6">
          <div className="absolute right-0 bottom-0 translate-x-12 translate-y-12 opacity-[0.08] dark:opacity-[0.03] pointer-events-none w-48 h-48">
            <img src={mandalaBeige} className="w-full h-full object-contain animate-[spin_60s_linear_infinite]" alt="" />
          </div>
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
            <div className="flex items-center gap-4">
              <div className="relative shrink-0 flex items-center justify-center w-16 h-16 rounded-full bg-amber-500/10 border border-amber-500/15">
                <img src={omWebp} alt="Om" className="w-14 h-14 object-contain" />
              </div>
              <div>
                <h4 className="font-display font-extrabold text-sm text-orange-950 dark:text-amber-100 flex items-center gap-1.5">
                  📿 {isHi ? "सामूहिक नाम जप यज्ञ" : "Group Chanting Yajna"}
                </h4>
                <p className="text-xs text-stone-500 dark:text-stone-400 mt-1">
                  {isHi ? "भक्तों द्वारा सामूहिक रूप से पूर्ण किए गए जप" : "Devotees chanting together towards collective target"}
                </p>
              </div>
            </div>
            <div className="w-full md:w-64 space-y-2">
              <div className="flex items-center justify-between text-xs font-semibold text-stone-500 dark:text-stone-400">
                <span>{isHi ? "यज्ञ लक्ष्य प्रगति" : "Yajna Progress"}</span>
                <span className="font-bold text-orange-600 dark:text-orange-400">
                  {group.completion_percent}% ({group.total_chants && group.total_chants >= 100000
                    ? `${(group.total_chants / 100000).toFixed(1)}L`
                    : (group.total_chants || 0).toLocaleString()} / {group.target_count >= 100000
                    ? `${(group.target_count / 100000).toFixed(1)}L`
                    : group.target_count.toLocaleString()})
                </span>
              </div>
              <div className="w-full h-3 rounded-full bg-orange-500/10 overflow-hidden border border-orange-500/5">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-orange-500 via-amber-500 to-yellow-500 transition-all duration-500"
                  style={{ width: `${group.completion_percent}%` }}
                />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ─── Quick Actions Grid ───────────────────────────────────── */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-8">
        {[
          { id: 'feed', emoji: '🌿', label: isHi ? 'डिजिटल सत्संग' : 'Digital Satsang', sub: isHi ? 'चर्चा और विचार' : 'Discussions & feed' },
          { id: 'bhajans', emoji: '🎵', label: isHi ? 'भजन संग्रह' : 'Read Bhajans', sub: isHi ? 'समूह द्वारा साझा' : 'Shared by community' },
          { id: 'events', emoji: '📅', label: isHi ? 'सत्संग कार्यक्रम' : 'Satsang Events', sub: isHi ? 'उत्सव और प्रार्थना' : 'Festivals & RSVP' },
          { id: 'members', emoji: '🏆', label: isHi ? 'भक्त लीडरबोर्ड' : 'Devotee Leaderboard', sub: isHi ? 'शीर्ष नाम जपक' : 'Top contributors' },
          { id: 'gallery', emoji: '🌸', label: isHi ? 'पवित्र गैलरी' : 'Temple Gallery', sub: isHi ? 'दर्शन और चित्र' : 'Devotional media' },
          { id: 'requests', emoji: '🙏', label: isHi ? 'भजन अनुरोध' : 'Bhajan Requests', sub: isHi ? 'बोल या धुन मांगें' : 'Request missing lyrics' },
        ].map(item => (
          <button
            key={item.id}
            onClick={() => setActiveGroupTab(item.id as any)}
            className={`p-4 rounded-2xl border text-left transition-all duration-350 hover:-translate-y-0.5 shadow-xs ${
              activeGroupTab === item.id
                ? "bg-[#651317] border-[#4A0E12] text-[#FFF9F2] shadow-md shadow-red-950/20"
                : "bg-white dark:bg-stone-900 border-amber-500/10 hover:border-amber-500/20 text-stone-800 dark:text-stone-200"
            }`}
          >
            <span className="text-xl mb-1.5 block">{item.emoji}</span>
            <span className="text-xs font-bold block">{item.label}</span>
            <span className="text-[10px] opacity-60 block mt-0.5 leading-tight">{item.sub}</span>
          </button>
        ))}

        {/* Log Chants — special tile */}
        <button
          onClick={() => setLogChantsOpen(true)}
          className="p-4 rounded-2xl border text-left bg-[#FAF6EE] dark:bg-[#1a1410] border-amber-500/30 hover:border-amber-500/50 hover:-translate-y-0.5 transition-all duration-350 shadow-xs"
        >
          <span className="text-xl mb-1.5 block">📿</span>
          <span className="text-xs font-bold text-amber-850 dark:text-amber-300 block">{isHi ? "सामूहिक नाम जप" : "Log Chants"}</span>
          <span className="text-[10px] text-amber-700/80 dark:text-amber-400 block mt-0.5 leading-tight">{isHi ? "यज्ञ में जप जोड़ें" : "Contribute chants"}</span>
        </button>

        {/* Upload Bhajan — external nav */}
        <button
          onClick={() => navigate("/upload-bhajan")}
          className="p-4 rounded-2xl border text-left bg-white dark:bg-stone-900 border-amber-500/10 hover:border-amber-500/20 hover:-translate-y-0.5 transition-all duration-350 shadow-xs"
        >
          <span className="text-xl mb-1.5 block">📤</span>
          <span className="text-xs font-bold text-stone-800 dark:text-stone-200 block">{isHi ? "भजन अपलोड करें" : "Upload Bhajan"}</span>
          <span className="text-[10px] opacity-60 block mt-0.5 leading-tight">{isHi ? "नया भजन जोड़ें" : "Add to library"}</span>
        </button>
      </div>

      {/* ─── Today's Temple Activity Banner ──────────────────────── */}
      {todayActivityItems.length > 0 && (
        <div className="bg-[#FAF6EE] dark:bg-[#1a1410] border border-amber-500/20 rounded-3xl p-5 mb-8 shadow-xs relative overflow-hidden">
          <div className="absolute right-0 bottom-0 translate-x-6 translate-y-6 opacity-[0.08] dark:opacity-[0.03] pointer-events-none w-24 h-24">
            <img src={mandalaBeige} className="w-full h-full object-contain" alt="" />
          </div>
          <h3 className="font-display font-extrabold text-sm text-[#543D2B] dark:text-amber-100 flex items-center gap-1.5 border-b border-amber-500/10 pb-2 mb-3 relative z-10">
            🔱 {isHi ? "आज की मंदिर हलचल (सत्संग)" : "Today's Temple Activity"}
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 relative z-10">
            {todayActivityItems.map((item, idx) => (
              <div key={idx} className="flex items-center gap-2 text-xs font-bold text-[#543D2B] dark:text-amber-100 bg-white/70 dark:bg-stone-950/40 p-2.5 rounded-xl border border-amber-500/10">
                <span className="text-base leading-none">{item.icon}</span>
                <span>{item.title}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ─── Group Content Tab Bar ────────────────────────────────── */}
      <div className="flex border-b border-orange-500/10 mb-6 gap-2 overflow-x-auto whitespace-nowrap scrollbar-none">
        {[
          { id: 'feed', label: isHi ? 'सत्संग (चर्चा)' : 'Satsang Feed' },
          { id: 'bhajans', label: isHi ? 'भजन संग्रह' : 'Community Bhajans' },
          { id: 'requests', label: isHi ? 'भजन अनुरोध' : 'Requests' },
          { id: 'events', label: isHi ? 'सत्संग कार्यक्रम' : 'Events' },
          { id: 'members', label: isHi ? 'भक्त और लीडरबोर्ड' : 'Devotees & Leaderboard' },
          { id: 'gallery', label: isHi ? 'पवित्र गैलरी' : 'Sacred Gallery' },
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveGroupTab(tab.id as any)}
            className={`relative pb-3 px-3 font-bold text-xs transition-all ${
              activeGroupTab === tab.id
                ? "text-orange-600 dark:text-orange-400 font-extrabold border-b-2 border-orange-500"
                : "text-stone-500 dark:text-stone-400"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* ─── TAB 1: SATSANG FEED ─────────────────────────────────── */}
      {activeGroupTab === 'feed' && (
        <SatsangFeedTab
          isHi={isHi}
          groupPosts={groupPosts}
          groupAnnouncements={groupAnnouncements}
          user={user}
          commentsMap={commentsMap}
          expandedCommentsPostId={expandedCommentsPostId}
          newCommentText={newCommentText}
          setNewCommentText={setNewCommentText}
          commentIsLyricsSubmit={commentIsLyricsSubmit}
          setCommentIsLyricsSubmit={setCommentIsLyricsSubmit}
          loadingCommentsPostIds={loadingCommentsPostIds}
          isSaved={isSaved}
          handleToggleComments={handleToggleComments}
          handleToggleReaction={handleToggleReaction}
          handleToggleRsvp={handleToggleRsvp}
          handleVoteOption={handleVoteOption}
          handleDeleteComment={handleDeleteComment}
          handleAddComment={handleAddComment}
          handleToggleSavePost={handleToggleSavePost}
          loadPosts={loadPosts}
          setPostType={setPostType}
          setCreatePostOpen={setCreatePostOpen}
          setDismissedAnnouncements={setDismissedAnnouncements}
        />
      )}

      {/* ─── TAB 2: BHAJANS ──────────────────────────────────────── */}
      {activeGroupTab === 'bhajans' && (
        <div className="space-y-6">
          {/* Search & Sort Panel */}
          <div className="flex flex-col sm:flex-row gap-3 bg-white dark:bg-stone-900 border border-orange-500/10 p-4 rounded-2xl shadow-xs">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-2.5 w-4 h-4 text-stone-400" />
              <Input
                type="text"
                placeholder={isHi ? "भजन खोजें..." : "Search shared bhajans..."}
                value={bhajanSearch}
                onChange={(e) => setBhajanSearch(e.target.value)}
                className="pl-9 h-9 border-orange-500/10 rounded-xl"
              />
            </div>
            <select
              value={bhajanSort}
              onChange={(e) => setBhajanSort(e.target.value)}
              className="h-9 rounded-xl border border-orange-500/10 bg-white dark:bg-stone-950 px-3 py-1 text-xs font-bold text-stone-700 dark:text-stone-300 w-full sm:w-40"
            >
              <option value="newest">{isHi ? "नवीनतम" : "Newest"}</option>
              <option value="popular">{isHi ? "लोकप्रिय" : "Popular"}</option>
              <option value="comments">{isHi ? "चर्चित" : "Most Commented"}</option>
            </select>
          </div>

          {/* Bhajan Composer CTA */}
          <div
            onClick={() => { setPostType('bhajan_share'); setCreatePostOpen(true); }}
            className="bg-white dark:bg-stone-900 border border-orange-500/10 rounded-2xl p-4 flex items-center justify-between shadow-xs hover:border-orange-500/30 hover:shadow-sm cursor-pointer select-none transition-all"
            role="button"
          >
            <span className="text-stone-400 text-xs font-medium">
              {isHi ? "इस समूह में कोई भजन साझा करें..." : "Share a bhajan lyrics link or YouTube video..."}
            </span>
            <button className="bg-orange-500 hover:bg-orange-600 text-white rounded-full w-8 h-8 shrink-0 flex items-center justify-center" aria-label="Share bhajan">
              <Plus className="w-4 h-4" />
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

      {/* ─── TAB 3: BHAJAN REQUESTS ──────────────────────────────── */}
      {activeGroupTab === 'requests' && (
        <div className="space-y-6">
          <div
            onClick={() => { setPostType('bhajan_request'); setCreatePostOpen(true); }}
            className="bg-white dark:bg-stone-900 border border-orange-500/10 rounded-2xl p-4 flex items-center justify-between shadow-xs hover:border-orange-500/30 hover:shadow-sm cursor-pointer select-none transition-all"
            role="button"
          >
            <span className="text-stone-400 text-xs font-medium">
              {isHi ? "किसी दुर्लभ भजन के बोल या जानकारी का अनुरोध करें..." : "Request a bhajan's lyrics or chords..."}
            </span>
            <button className="bg-orange-500 hover:bg-orange-600 text-white rounded-full w-8 h-8 shrink-0 flex items-center justify-center" aria-label="Request bhajan">
              <Plus className="w-4 h-4" />
            </button>
          </div>

          {(() => {
            const requestPosts = groupPosts.filter(p => p.type === 'bhajan_request');
            if (requestPosts.length === 0) {
              return (
                <div className="text-center py-16 bg-white dark:bg-stone-900 border border-orange-500/10 rounded-2xl px-6">
                  <span className="text-3xl block select-none">📿</span>
                  <p className="text-stone-500 dark:text-stone-400 font-medium text-xs mt-3 leading-relaxed">
                    {isHi ? "अभी तक कोई भजन अनुरोध नहीं है। यदि आप कोई भजन खोज रहे हैं, तो अनुरोध दर्ज करें।" : "No bhajan requests in this group yet. Request a rare lyrics transcription here."}
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

      {/* ─── TAB 4: EVENTS ───────────────────────────────────────── */}
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

      {/* ─── TAB 5: DEVOTEES & LEADERBOARD ───────────────────────── */}
      {activeGroupTab === 'members' && (
        <DevoteesTab
          isHi={isHi}
          groupRankings={groupRankings}
          loadingRankings={loadingRankings}
          groupMembers={groupMembers}
          currentUserId={user?.id}
        />
      )}

      {/* ─── TAB 6: SACRED GALLERY ───────────────────────────────── */}
      {activeGroupTab === 'gallery' && (
        <div className="space-y-4">
          <h3 className="font-display font-extrabold text-sm text-orange-950 dark:text-amber-100 flex items-center gap-1.5">
            🌸 {isHi ? "दिव्य दर्शन गैलरी" : "Temple Darshan Gallery"}
          </h3>
          {(() => {
            const mediaPosts = groupPosts.filter(p => p.image_url);
            if (mediaPosts.length === 0) {
              return (
                <div className="text-center py-16 bg-white dark:bg-stone-900 border border-orange-500/10 rounded-2xl px-6">
                  <span className="text-3xl block select-none">🌸</span>
                  <p className="text-stone-500 dark:text-stone-400 font-medium text-xs mt-3 leading-relaxed">
                    {isHi ? "इस समूह में अभी तक कोई चित्र या दर्शन साझा नहीं किया गया है।" : "No images or temple darshans shared in this group yet."}
                  </p>
                </div>
              );
            }
            return (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                {mediaPosts.map(post => (
                  <div
                    key={post.id}
                    onClick={() => { handleToggleComments(post.id); setActiveGroupTab('feed'); }}
                    className="group relative aspect-square rounded-2xl overflow-hidden border border-orange-500/10 bg-stone-100 dark:bg-stone-950 cursor-pointer shadow-xs hover:border-orange-500/30 transition-all hover:scale-[0.98]"
                  >
                    <img
                      src={post.image_url!}
                      alt="Darshan"
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                      loading="lazy"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-end p-3 font-sans">
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
  );
}
