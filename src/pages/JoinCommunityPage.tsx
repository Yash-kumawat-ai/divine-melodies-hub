import { useState, useEffect, useMemo, useRef } from "react";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { 
  ChevronLeft, Plus, Users, MessageSquare, Search, Copy, Globe, Info, Clock, Check, X, Trash2, Calendar, MapPin, ExternalLink, Sparkles, AlertCircle, Play, Heart, ThumbsUp, Send, User, ChevronRight, Pencil, ArrowRight,
  Leaf, Music, BookOpen, HelpCircle, Bookmark, Lock, Award, Megaphone, Flame, Loader2, Share2, MessageCircle, CheckCircle2, Volume2, Eye
} from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useLanguage } from "@/hooks/useLanguage";
import { useTheme } from "@/hooks/useTheme";
import { useSavedPosts } from "@/hooks/useSavedPosts";
import { communityApi, type Group, type CommunityPost, type PostComment, type GroupMember } from "@/lib/community/communityApi";
import { queryUserUploads } from "@/lib/supabaseQueries";
import { toast } from "sonner";
import { SEO } from "@/components/SEO";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { PostCard } from "@/components/community/PostCard";
import { FeedComposer } from "@/components/community/FeedComposer";
import { EventsTab } from "@/components/community/EventsTab";
import { SatsangFeedTab } from "@/components/community/SatsangFeedTab";
import { DevoteesTab } from "@/components/community/DevoteesTab";
import { GroupHall } from "@/components/community/GroupHall";
import { CreateGroupDialog } from "@/components/community/CreateGroupDialog";
import { CreatePostDialog } from "@/components/community/CreatePostDialog";
import { useCreatePost } from "@/hooks/useCreatePost";
import { useCommunityPostActions } from "@/hooks/useCommunityPostActions";
import { useMantraJapa } from "@/hooks/useMantraJapa";
import { fetchGroupRankings } from "@/lib/naamSangh/naamSanghApi";
import { supabase } from "@/lib/supabaseClient";

// Curated Widescreen Cover Images for groups
import RamCover from "./images/lord_ram_high_quality.webp";
import ShivaCover from "./images/shiv_temple_hd.webp";
import KrishnaCover from "./images/krishna_mobile_wallpaper.webp";
import HanumanCover from "./images/hanuman_community_banner_high_quality.webp";
import DefaultCover from "./images/hindu_temple_sunset_widescreen_high_quality.webp";
import litDiyaImg from "./images/lit_diya.png";
import templeBellImg from "./images/temple_bell.png";
import omWebp from "./images/om.webp";
import mandalaBeige from "./images/mandala-beige.svg";
import mandalaGold from "./images/mandala-gold.svg";
import devotionalBg3 from "./images/devotional_background(3).webp";
import mandirSvg from "./images/svg/mandirorg.svg";
import malaSvg from "./images/svg/mala.svg";
import manjiraSvg from "./images/svg/manjira.svg";
import prayingSvg from "./images/svg/praying-svgrepo-com.svg";
import leaderboardSvg from "./images/svg/leaderboard-1.svg";

// Large deity avatars for group creation
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

const resolveCover = (deity: string) => {
  const d = deity?.toLowerCase();
  if (d === "rama") return RamCover;
  if (d === "shiva") return ShivaCover;
  if (d === "krishna") return KrishnaCover;
  if (d === "hanuman") return HanumanCover;
  return DefaultCover;
};

const TAB_HERO_CONFIG = {
  groups: {
    badgeHi: "नाम संकीर्तन समूह",
    badgeEn: "Naam Sangh Groups",
    badgeIcon: mandirSvg,
    titleHi: "भक्ति एवं नाम संकीर्तन समूह",
    titleEn: "Devotional Naam Sangh",
    descHi: "अपने प्रिय इष्टदेव के समूह से जुड़ें, सामूहिक नाम जाप यज्ञ में भाग लें और भक्तों के साथ भक्तिमय संवाद बनाएं।",
    descEn: "Join sacred devotee circles, chant together in collective Naam Jap, and connect with devotees worldwide.",
    tags: [
      { svg: mandirSvg, labelHi: "पवित्र मंडली", labelEn: "Sacred Circles" },
      { svg: malaSvg, labelHi: "सामूहिक नाम जाप", labelEn: "Group Naam Jap" },
      { svg: leaderboardSvg, labelHi: "जप यज्ञ रैंकिंग", labelEn: "Jap Leaderboard" },
    ],
  },
  feed: {
    badgeHi: "डिजिटल सत्संग मंच",
    badgeEn: "Digital Satsang Feed",
    badgeIcon: prayingSvg,
    titleHi: "सत्संग एवं भक्तिमय विचार",
    titleEn: "Satsang & Reflections",
    descHi: "दैनिक भक्ति विचार, सुंदर भजन, श्लोक व आध्यात्मिक प्रश्न साझा करें और संपूर्ण भक्त समुदाय से आशीर्वाद पाएं।",
    descEn: "Share daily devotional thoughts, sacred bhajans, spiritual questions, and connect in satsang.",
    tags: [
      { svg: prayingSvg, labelHi: "दैनिक विचार", labelEn: "Daily Thoughts" },
      { svg: manjiraSvg, labelHi: "भजन व संकीर्तन", labelEn: "Bhajans & Kirtans" },
      { svg: malaSvg, labelHi: "भक्तिमय संवाद", labelEn: "Spiritual Satsang" },
    ],
  },
  events: {
    badgeHi: "सत्संग एवं धार्मिक उत्सव",
    badgeEn: "Spiritual Events & Festivals",
    badgeIcon: mandirSvg,
    titleHi: "आगामी सत्संग व धार्मिक कार्यक्रम",
    titleEn: "Upcoming Sacred Gatherings",
    descHi: "आगामी ऑनलाइन व स्थानीय सत्संग, भजन संध्या, एकादशी व धार्मिक आयोजनों में भाग लें और अपनी रुचि दर्ज करें।",
    descEn: "Explore live online kirtans, temple satsangs, bhajan sandhyas, and festival celebrations.",
    tags: [
      { svg: mandirSvg, labelHi: "सत्संग व जागरण", labelEn: "Satsang & Jagran" },
      { svg: manjiraSvg, labelHi: "भजन संध्या", labelEn: "Bhajan Sandhya" },
      { svg: prayingSvg, labelHi: "स्थान व लाइव लिंक", labelEn: "Venue & Live Links" },
    ],
  },
};

function EventCountdown({ datetime }: { datetime: string }) {
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
    <span className="inline-flex items-center gap-1 bg-rose-500/10 text-rose-500 px-2 py-0.5 rounded-md font-extrabold text-[10px] tracking-wide uppercase">
      ⏳ {timeLeft.days > 0 ? `${timeLeft.days}d ` : ""}{timeLeft.hours}h {timeLeft.mins}m left
    </span>
  );
}

export default function JoinCommunityPage() {
  const navigate = useNavigate();
  const { slug, postId } = useParams<{ slug?: string; postId?: string }>();
  const [searchParams] = useSearchParams();
  const { user, profile } = useAuth();
  const { language } = useLanguage();
  const isHi = language === "hi";
  const { theme } = useTheme();
  const isDark = theme === "dark";
  const { isSaved, toggleSave } = useSavedPosts();

  const handleToggleSavePost = (pId: string) => {
    const saved = toggleSave(pId);
    if (saved) {
      toast.success(isHi ? "पोस्ट सहेजी गई!" : "Post saved!");
    } else {
      toast.success(isHi ? "सहेजे गए पोस्ट से हटाया गया" : "Removed from saved posts");
    }
  };

  // Navigation tabs
  const [activeTab, setActiveTab] = useState<'feed' | 'groups' | 'events'>(() => {
    const tab = new URLSearchParams(window.location.search).get("tab");
    return tab === "feed" || tab === "groups" || tab === "events" ? tab : "groups";
  });

  useEffect(() => {
    const tab = searchParams.get("tab");
    if (tab === "feed" || tab === "groups" || tab === "events") {
      setActiveTab(tab);
    }
  }, [searchParams]);

  // Core Data
  const [posts, setPosts] = useState<CommunityPost[]>([]);
  const [groups, setGroups] = useState<Group[]>([]);
  const [myBhajans, setMyBhajans] = useState<any[]>([]);
  const [loadingPosts, setLoadingPosts] = useState(true);
  const [loadingGroups, setLoadingGroups] = useState(true);
  
  // Modals
  const [createGroupOpen, setCreateGroupOpen] = useState(false);
  const [selectedGroup, setSelectedGroup] = useState<Group | null>(null);
  
  // Group view details state
  const [groupViewOpen, setGroupViewOpen] = useState(!!slug);
  const [groupMembers, setGroupMembers] = useState<GroupMember[]>([]);
  const [activeGroupTab, setActiveGroupTab] = useState<'feed' | 'bhajans' | 'requests' | 'events' | 'members' | 'gallery'>('feed');
  const [showMemberManagement, setShowMemberManagement] = useState(false);
  const [bhajanSearch, setBhajanSearch] = useState("");
  const [bhajanSort, setBhajanSort] = useState("newest");

  // Group Details Search and Create State
  const [groupSearch, setGroupSearch] = useState("");
  const [groupName, setGroupName] = useState("");
  const [groupDesc, setGroupDesc] = useState("");
  const [groupDeity, setGroupDeity] = useState("rama");
  const [creatingGroup, setCreatingGroup] = useState(false);

  const isNameUnique = groupName.trim()
    ? !groups.some(g => g.name.trim().toLowerCase() === groupName.trim().toLowerCase())
    : null;


  // Feed Filter & Search type
  const [feedFilter, setFeedFilter] = useState<string>("All");
  const [postSearchQuery, setPostSearchQuery] = useState("");

  // Post Creator form states

  // Japa logging states & hook
  const { mantras, completeSession } = useMantraJapa();
  const [logChantsOpen, setLogChantsOpen] = useState(false);
  const [chantsToLog, setChantsToLog] = useState(108);
  const [customSankalp, setCustomSankalp] = useState("");
  const [loggingChants, setLoggingChants] = useState(false);

  // Group stats, rankings and announcements
  const [groupRankings, setGroupRankings] = useState<any[]>([]);
  const [loadingRankings, setLoadingRankings] = useState(false);
  const [dismissedAnnouncements, setDismissedAnnouncements] = useState<string[]>([]);

  // Debounced search for groups
  const [debouncedGroupSearch, setDebouncedGroupSearch] = useState("");
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedGroupSearch(groupSearch);
    }, 300);
    return () => clearTimeout(handler);
  }, [groupSearch]);

  // Load Initial Data
  const loadPosts = async (silent = false) => {
    if (!silent) setLoadingPosts(true);
    try {
      const data = await communityApi.fetchPosts(user?.id);
      setPosts(data);
    } finally {
      if (!silent) setLoadingPosts(false);
    }
  };

  const loadGroups = async () => {
    setLoadingGroups(true);
    const data = await communityApi.fetchGroups(user?.id);
    setGroups(data);
    setLoadingGroups(false);
  };

  const loadMyBhajans = async () => {
    const { data } = await queryUserUploads({ includeUnapproved: false });
    if (data) setMyBhajans(data);
  };

  // Comments state + handlers — managed by useCommunityPostActions hook
  const {
    expandedCommentsPostId,
    commentsMap,
    newCommentText,
    setNewCommentText,
    commentIsLyricsSubmit,
    setCommentIsLyricsSubmit,
    loadingCommentsPostIds,
    handleToggleComments,
    handleAddComment,
    handleDeleteComment,
    handleToggleReaction,
    handleToggleRsvp,
    handleVoteOption,
    setCommentsMap,
    setExpandedCommentsPostId,
    setLoadingCommentsPostIds,
  } = useCommunityPostActions({ user, profile, isHi, loadPosts, setPosts });
  const {
    createPostOpen,
    setCreatePostOpen,
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
    publishingPost,
    handleImageChange,
    handleCroppedImageReady,
    handleRemoveImage,
    handleCreatePost,
  } = useCreatePost({ user, isHi, selectedGroup, loadPosts });

  useEffect(() => {
    loadPosts();
    loadGroups();
    loadMyBhajans();
  }, [user?.id]);

  useEffect(() => {
    if (postId) {
      setExpandedCommentsPostId(postId);
      const hasCached = !!commentsMap[postId];
      if (!hasCached) {
        setLoadingCommentsPostIds(prev => ({ ...prev, [postId]: true }));
        communityApi.fetchComments(postId).then(comments => {
          setCommentsMap(prev => ({ ...prev, [postId]: comments }));
        }).catch(err => {
          console.error("Error loading shared post comments:", err);
        }).finally(() => {
          setLoadingCommentsPostIds(prev => ({ ...prev, [postId]: false }));
        });
      }
    }
  }, [postId]);

  useEffect(() => {
    if (slug) {
      if (groups.length > 0) {
        const group = groups.find(g => g.slug === slug || g.id === slug);
        if (group) {
          setSelectedGroup(prev => {
            if (prev?.id !== group.id) {
              setActiveGroupTab('feed');
            }
            return group;
          });
          setGroupViewOpen(true);
          communityApi.fetchGroupMembers(group.id).then(members => setGroupMembers(members));
          
          // Load rankings
          setLoadingRankings(true);
          fetchGroupRankings(group.id).then(rankings => {
            setGroupRankings(rankings);
            setLoadingRankings(false);
          }).catch(err => {
            console.error("Error loading group rankings:", err);
            setLoadingRankings(false);
          });
        } else {
          setGroupViewOpen(false);
          setSelectedGroup(null);
        }
      }
    } else {
      setGroupViewOpen(false);
      setSelectedGroup(null);
    }
  }, [slug, groups]);

  // Start group japa sadhana -> navigates to full setup & meditation counter
  const handleStartGroupJapa = (grp?: Group | null) => {
    const targetGroup = grp || selectedGroup;
    if (!targetGroup) return;
    const groupDeity = targetGroup.deity?.toLowerCase();
    // Find matching mantra in database
    const matchingMantra = mantras.find(m => m.deity?.toLowerCase() === groupDeity) || mantras[0];
    const mantraId = matchingMantra ? matchingMantra.id : "om_namah_shivaya";
    const currentPath = window.location.pathname + window.location.search;
    navigate(`/meditation?practice=mantra_jap_home&mantraId=${mantraId}&showSetup=true&groupId=${targetGroup.id}&returnUrl=${encodeURIComponent(currentPath)}`);
  };

  // Log group chants handler (calls useMantraJapa mutation)
  const handleLogGroupChants = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedGroup) return;
    if (!user) {
      toast.error(isHi ? "नाम जप जोड़ने के लिए कृपया लॉगिन करें।" : "Please log in to log group chants.");
      return;
    }
    setLoggingChants(true);
    try {
      const groupDeity = selectedGroup.deity?.toLowerCase();
      // Find matching mantra in database
      const matchingMantra = mantras.find(m => m.deity?.toLowerCase() === groupDeity) || mantras[0];
      if (!matchingMantra) {
        throw new Error("No matching mantra found in library.");
      }

      await completeSession({
        mantraId: matchingMantra.id,
        mantraLabel: matchingMantra.name_hindi || matchingMantra.name_english || "Mantra",
        sankalp: customSankalp || "Group Naam Jap",
        targetCount: chantsToLog,
        actualCount: chantsToLog,
        durationSeconds: Math.round(chantsToLog * 0.8),
        groupId: selectedGroup.id
      });

      toast.success(isHi 
        ? `सफलतापूर्वक ${chantsToLog} नाम जप जोड़े गए! 📿` 
        : `Successfully logged ${chantsToLog} chants to the group! 📿`
      );
      setLogChantsOpen(false);
      setCustomSankalp("");
      setChantsToLog(108);

      // Refresh groups list & rankings
      loadGroups();
      const rankings = await fetchGroupRankings(selectedGroup.id);
      setGroupRankings(rankings);
    } catch (err: any) {
      console.error("Error logging group chants:", err);
      toast.error(isHi ? "नाम जप जोड़ने में असमर्थ।" : "Failed to log chants.");
    } finally {
      setLoggingChants(false);
    }
  };

  // Realtime subscription for group updates (posts, comments, likes, members, progress)
  useEffect(() => {
    if (!selectedGroup?.id) return;

    const channel = supabase
      .channel(`group-realtime-${selectedGroup.id}`)
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'community_posts', filter: `group_id=eq.${selectedGroup.id}` },
        () => {
          loadPosts();
        }
      )
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'post_comments' },
        () => {
          loadPosts();
          if (expandedCommentsPostId) {
            communityApi.fetchComments(expandedCommentsPostId).then(comments => {
              setCommentsMap(prev => ({ ...prev, [expandedCommentsPostId]: comments }));
            });
          }
        }
      )
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'post_reactions' },
        () => {
          loadPosts();
        }
      )
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'group_members', filter: `group_id=eq.${selectedGroup.id}` },
        () => {
          communityApi.fetchGroupMembers(selectedGroup.id).then(members => setGroupMembers(members));
          fetchGroupRankings(selectedGroup.id).then(rankings => setGroupRankings(rankings));
          loadGroups();
        }
      )
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'naam_sangh_progress', filter: `group_id=eq.${selectedGroup.id}` },
        () => {
          loadGroups();
        }
      )
      .subscribe();

    return () => {
      channel.unsubscribe();
      supabase.removeChannel(channel);
    };
  }, [selectedGroup?.id, expandedCommentsPostId]);

  // ── Post interaction handlers now live in useCommunityPostActions hook ──

  // Group Create handler
  const handleCreateGroup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      toast.error(isHi ? "समूह बनाने के लिए कृपया लॉग इन करें" : "Please log in to create a group");
      return;
    }
    if (!groupName.trim()) {
      toast.error(isHi ? "समूह का नाम आवश्यक है" : "Group name is required");
      return;
    }

    try {
      setCreatingGroup(true);
      await communityApi.createGroup(groupName.trim(), groupDesc.trim(), groupDeity, user.id);
      toast.success(isHi ? "समूह सफलतापूर्वक बनाया गया!" : "Community group created successfully!");
      setGroupName("");
      setGroupDesc("");
      setCreateGroupOpen(false);
      loadGroups();
    } catch {
      toast.error(isHi ? "समूह बनाने में असमर्थ" : "Failed to create group");
    } finally {
      setCreatingGroup(false);
    }
  };

  // Group Join Toggle handler
  const handleToggleGroupJoin = async (group: Group) => {
    if (!user) {
      toast.error(isHi ? "समूह में शामिल होने के लिए कृपया लॉग इन करें" : "Please log in to join a group");
      return;
    }
    try {
      if (group.is_member) {
        await communityApi.leaveGroup(group.id, user.id);
        toast.success(isHi ? "समूह से बाहर निकले" : "Left group");
      } else {
        await communityApi.joinGroup(group.id, user.id);
        toast.success(isHi ? "समूह में शामिल हुए" : "Joined group");
      }
      loadGroups();
      if (selectedGroup?.id === group.id) {
        const updatedGroups = await communityApi.fetchGroups(user.id);
        const match = updatedGroups.find(g => g.id === group.id);
        if (match) setSelectedGroup(match);
      }
    } catch (err: any) {
      console.error("Group action error:", err);
      const isDeletePolicyBlock = err?.message?.toLowerCase().includes("row-level security") || 
                                  err?.details?.toLowerCase().includes("row-level security") ||
                                  err?.message?.toLowerCase().includes("policy") ||
                                  err?.details?.toLowerCase().includes("policy");
      
      if (group.is_member && isDeletePolicyBlock) {
        toast.error(isHi 
          ? "आप इस समूह के अंतिम एडमिन हैं। जब तक समूह डिलीट नहीं होता या आप किसी और को एडमिन नहीं बनाते, आप इसे छोड़ नहीं सकते।"
          : "You are the last admin of this group. You cannot leave unless you delete the group or make another member an admin."
        );
      } else {
        toast.error(isHi ? "समूह क्रिया विफल रही" : "Group action failed");
      }
    }
  };

  // Open Group Detail page
  const handleOpenGroupDetails = (group: Group) => {
    if (group.slug) {
      navigate(`/community/groups/${group.slug}`);
    } else {
      navigate(`/community/groups/${group.id}`);
    }
  };

  // Share group invitation link on WhatsApp
  const handleWhatsAppInvite = (group: Group) => {
    const groupLink = `${window.location.origin}/community/groups/${group.slug || group.id}`;
    const text = `🙏 Jai Shri Ram\n\nI created a Community on Hari Kirtan.\n\nLet's share bhajans, devotional thoughts and grow spiritually together.\n\nJoin Here:\n${groupLink}`;
    window.open(`https://api.whatsapp.com/send?text=${encodeURIComponent(text)}`, '_blank');
  };

  // Copy Group Link
  const handleCopyGroupLink = (group: Group) => {
    const groupLink = `${window.location.origin}/community/groups/${group.slug || group.id}`;
    navigator.clipboard.writeText(groupLink);
    toast.success(isHi ? "आमंत्रण लिंक कॉपी किया गया!" : "Invitation link copied!");
  };

  // Group Admin actions (kick member, delete group)
  const handleRemoveMember = async (groupId: string, memberId: string) => {
    try {
      await communityApi.removeGroupMember(groupId, memberId);
      toast.success(isHi ? "सदस्य को हटा दिया गया" : "Member removed");
      const members = await communityApi.fetchGroupMembers(groupId);
      setGroupMembers(members);
    } catch {
      toast.error(isHi ? "सदस्य को हटाने में असमर्थ" : "Failed to remove member");
    }
  };

  const handleDeleteGroupAction = async (groupId: string) => {
    if (confirm(isHi ? "क्या आप सच में इस समूह को हटाना चाहते हैं?" : "Are you sure you want to delete this group?")) {
      try {
        await communityApi.deleteGroup(groupId);
        toast.success(isHi ? "समूह हटा दिया गया" : "Group deleted");
        navigate("/join-community");
        loadGroups();
      } catch {
        toast.error(isHi ? "समूह को हटाने में असमर्थ" : "Failed to delete group");
      }
    }
  };

  // Cloudinary image upload helper

  // Post Creator submit handler

  // Event location state field

  // Computed views filter
  const filteredPosts = useMemo(() => {
    let list = posts;
    if (postId) {
      return list.filter(p => p.id === postId);
    }
    if (selectedGroup) {
      list = list.filter(p => p.group_id === selectedGroup.id);
    } else {
      // Global feed: Only show posts that belong to the general community (not a specific group)
      list = list.filter(p => !p.group_id);
    }
    if (feedFilter !== "All") {
      if (feedFilter === "Shloka") {
        list = list.filter(p =>
          p.type === "shloka" ||
          p.content?.startsWith("[SHLOKA]") ||
          p.content?.includes("📖 भावार्थ") ||
          p.content?.includes("📖 अर्थ")
        );
      } else if (feedFilter === "Thought") {
        list = list.filter(p =>
          p.type === "thought" &&
          !p.content?.startsWith("[SHLOKA]") &&
          !p.content?.includes("📖 भावार्थ") &&
          !p.content?.includes("📖 अर्थ")
        );
      } else {
        list = list.filter(p => p.type === feedFilter.toLowerCase().replace(" ", "_"));
      }
    }
    if (postSearchQuery.trim()) {
      const q = postSearchQuery.toLowerCase().trim();
      list = list.filter(p => 
        (p.title && p.title.toLowerCase().includes(q)) ||
        (p.content && p.content.toLowerCase().includes(q)) ||
        (p.author?.display_name && p.author.display_name.toLowerCase().includes(q)) ||
        (p.group_name && p.group_name.toLowerCase().includes(q))
      );
    }
    return list;
  }, [posts, feedFilter, selectedGroup, postId, postSearchQuery]);

  // Group lists filter
  const filteredGroups = useMemo(() => {
    if (!debouncedGroupSearch.trim()) return groups;
    return groups.filter(g => 
      g.name.toLowerCase().includes(debouncedGroupSearch.toLowerCase()) || 
      g.description.toLowerCase().includes(debouncedGroupSearch.toLowerCase())
    );
  }, [groups, debouncedGroupSearch]);

  const myJoinedGroups = useMemo(() => {
    return groups.filter(g => g.is_member);
  }, [groups]);

  // Events filtered view
  const eventsList = useMemo(() => {
    if (selectedGroup) {
      return posts.filter(p => p.group_id === selectedGroup.id && p.type === 'event');
    }
    return posts.filter(p => !p.group_id && p.type === 'event');
  }, [posts, selectedGroup]);

  // Status Colors for Request badge
  const getStatusBadgeColor = (status: string) => {
    switch (status) {
      case 'open': return 'bg-stone-200 dark:bg-stone-800 text-stone-700 dark:text-stone-300 border-stone-300';
      case 'lyrics_submitted': return 'bg-blue-100 dark:bg-blue-900/40 text-blue-600 dark:text-blue-400 border-blue-200';
      case 'in_review': return 'bg-amber-100 dark:bg-amber-900/40 text-amber-600 dark:text-amber-400 border-amber-200';
      case 'added_to_library': return 'bg-emerald-100 dark:bg-emerald-900/40 text-emerald-600 dark:text-emerald-400 border-emerald-200';
      case 'closed_unresolved': return 'bg-rose-100 dark:bg-rose-900/40 text-rose-600 dark:text-rose-400 border-rose-200';
      default: return 'bg-stone-100 text-stone-600';
    }
  };

  return (
    <div className="min-h-screen bg-[#FAF6EE] dark:bg-[#0c0a08] text-stone-900 dark:text-stone-100 pb-20">
      <SEO 
        title={isHi ? "डिजिटल सत्संग - राघवन" : "Digital Satsang - Raghavam"}
        description="भजन साझा करें, नाम जाप अनुरोध सबमिट करें और भक्तों के समुदाय से जुड़ें।"
      />

      {/* ─── HEADER BAR ────────────────────────────────────────── */}
      {!groupViewOpen && (
        <header className="sticky top-0 z-30 bg-[#FAF6EE]/95 dark:bg-[#0c0a08]/95 backdrop-blur-md border-b border-orange-500/10 px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={() => {
                if (groupViewOpen) {
                  navigate("/join-community");
                } else {
                  navigate("/community");
                }
              }}
              className="w-9 h-9 rounded-full border border-[#D6A86B]/30 bg-orange-50/40 dark:bg-stone-900/40 hover:bg-orange-100/50 dark:hover:bg-stone-850 flex items-center justify-center text-[#C88A3D] active:scale-95 transition-all shrink-0"
              title={isHi ? "समुदाय पर वापस जाएं" : "Back to Community"}
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <span className="font-display text-base sm:text-lg font-extrabold tracking-tight text-[#651317] dark:text-amber-100">
              {isHi ? "समुदाय" : "Community"}
            </span>
          </div>

          {groupViewOpen && communityApi.isFallbackActive() && (
            <Badge variant="outline" className="text-[10px] text-amber-600 dark:text-amber-400 border-amber-500/30 flex items-center gap-1">
              <AlertCircle className="w-3 h-3 text-amber-500" />
              Local Sandbox Mode
            </Badge>
          )}
        </header>
      )}

      {/* ─── GUEST LOGIN BLOCK ──────────────────────────────────── */}
      {!user && (
        <div className="max-w-xl mx-auto px-4 mt-8">
          <div className="bg-orange-50/70 dark:bg-stone-900/40 border border-orange-500/20 rounded-3xl p-6 text-center shadow-xs">
            <span className="text-3xl">📿</span>
            <h2 className="font-display text-lg font-bold text-orange-950 dark:text-amber-100 mt-2">
              {isHi ? "सत्संग समुदाय में आपका स्वागत है" : "Welcome to the Satsang Community"}
            </h2>
            <p className="text-stone-600 dark:text-stone-300 text-xs mt-2 leading-relaxed">
              {isHi 
                ? "भक्तों के साथ जुड़ने, अपने विचार, भजन और आगामी धार्मिक कार्यक्रमों को साझा करने के लिए लॉग इन करें।"
                : "Log in to connect with other devotees, share your thoughts, bhajans, and see upcoming devotional programs."}
            </p>
            <Button
              onClick={() => navigate("/auth/login?redirect=/join-community")}
              className="mt-4 bg-[#5c1d0c] hover:bg-[#4a170a] text-white text-sm font-extrabold py-2.5 px-6 rounded-xl transition-all shadow-md active:scale-95 border-none"
            >
              {isHi ? "लॉग इन करें" : "Log In to Participate"}
            </Button>
          </div>
        </div>
      )}

      {user && !groupViewOpen && (
        <div className="max-w-7xl mx-auto px-4 mt-6">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            
            {/* ─── 1. LEFT SIDEBAR: MY GROUPS & DEVOTIONAL QUICK STATS ────────────── */}
            <div className="hidden lg:block lg:col-span-3 space-y-4 sticky top-24">
              <div className="bg-white dark:bg-stone-900 border border-orange-500/10 rounded-2xl p-5 shadow-xs space-y-4">
                <div className="flex items-center gap-2 pb-2 border-b border-orange-500/10">
                  <img src={mandirSvg} alt="Mandir" className="w-4.5 h-4.5 filter drop-shadow opacity-90" />
                  <h3 className="font-display font-extrabold text-[11px] text-orange-950 dark:text-amber-100 uppercase tracking-wider">
                    {isHi ? "मेरे समूह" : "My Communities"}
                  </h3>
                </div>

                <div className="space-y-3 max-h-[280px] overflow-y-auto pr-1">
                  {groups.filter(g => g.is_member).length === 0 ? (
                    <p className="text-xs text-stone-400 text-center py-4 font-medium">
                      {isHi ? "आप अभी किसी समूह में नहीं हैं।" : "You haven't joined any groups yet."}
                    </p>
                  ) : (
                    groups.filter(g => g.is_member).map(group => {
                      const deityFound = DEITIES.find(d => d.id === group.deity);
                      return (
                        <button
                          key={group.id}
                          onClick={() => handleOpenGroupDetails(group)}
                          className="w-full flex items-center justify-between p-2 rounded-xl hover:bg-orange-500/5 hover:scale-[1.01] active:scale-95 transition-all text-left group"
                        >
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full overflow-hidden border border-orange-500/20 p-0.5 shrink-0">
                              <img 
                                src={deityFound ? deityFound.src : "/placeholder-deity.jpg"} 
                                alt={group.name} 
                                className="w-full h-full object-cover rounded-full" 
                              />
                            </div>
                            <div className="min-w-0">
                              <p className="font-bold text-xs text-orange-950 dark:text-amber-100 truncate group-hover:text-orange-500 transition-colors">
                                {group.name}
                              </p>
                              <p className="text-[10px] text-stone-500 dark:text-stone-400 mt-0.5">
                                {group.member_count} {isHi ? "सदस्य" : "Members"}
                              </p>
                            </div>
                          </div>
                          
                          <span className="w-1.5 h-1.5 rounded-full bg-orange-500 shrink-0 opacity-80" />
                        </button>
                      );
                    })
                  )}
                </div>

                <button
                  onClick={() => setCreateGroupOpen(true)}
                  className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl border border-dashed border-orange-500/25 text-orange-600 dark:text-orange-400 hover:border-orange-500/50 hover:bg-orange-500/5 text-xs font-bold transition-all mt-2"
                >
                  <Plus className="w-4 h-4" />
                  <span>{isHi ? "समूह बनाएं" : "Create Community"}</span>
                </button>
              </div>

              {/* Devotional Quick Glance & Satsang Stats Widget */}
              <div className="bg-gradient-to-br from-amber-500/10 via-orange-500/5 to-stone-900/10 border border-amber-500/20 rounded-2xl p-4 space-y-3 shadow-xs">
                <div className="flex items-center gap-2 pb-2 border-b border-amber-500/15">
                  <img src={malaSvg} alt="Mala" className="w-4 h-4 opacity-90" />
                  <h4 className="font-display font-extrabold text-[11px] text-orange-950 dark:text-amber-100 uppercase tracking-wider">
                    {isHi ? "सत्संग झलक" : "Satsang Glance"}
                  </h4>
                </div>

                <div className="grid grid-cols-2 gap-2 text-left">
                  <div className="p-2.5 rounded-xl bg-white/70 dark:bg-stone-900/70 border border-amber-500/15 flex items-center gap-2">
                    <img src={prayingSvg} alt="Devotees" className="w-5 h-5 opacity-90 shrink-0" />
                    <div>
                      <p className="text-[9.5px] text-stone-500 font-bold">{isHi ? "सक्रिय भक्त" : "Devotees"}</p>
                      <p className="text-xs font-black text-amber-600 dark:text-amber-400">1,008+</p>
                    </div>
                  </div>

                  <div className="p-2.5 rounded-xl bg-white/70 dark:bg-stone-900/70 border border-amber-500/15 flex items-center gap-2">
                    <img src={manjiraSvg} alt="Kirtans" className="w-5 h-5 opacity-90 shrink-0" />
                    <div>
                      <p className="text-[9.5px] text-stone-500 font-bold">{isHi ? "दैनिक कीर्तन" : "Live Kirtan"}</p>
                      <p className="text-xs font-black text-amber-600 dark:text-amber-400">24/7</p>
                    </div>
                  </div>
                </div>

                <button
                  onClick={() => navigate("/naam-sangh")}
                  className="w-full flex items-center justify-between py-2 px-3.5 rounded-xl bg-[#5c1d0c] hover:bg-[#4a170a] text-white text-[11px] font-extrabold transition-all shadow-xs"
                >
                  <div className="flex items-center gap-2">
                    <img src={leaderboardSvg} alt="Leaderboard" className="w-4 h-4 filter brightness-0 invert" />
                    <span>{isHi ? "नाम संघ लीडरबोर्ड" : "Naam Sangh Ranks"}</span>
                  </div>
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* ─── 2. MIDDLE COLUMN (MAIN CONTENT) ────────────────────── */}
            <div className="col-span-12 lg:col-span-9 space-y-6">
              
              {/* Top Hero Banner — Dynamic Tab-Aware Devotional Header */}
              {(() => {
                const currentHero = TAB_HERO_CONFIG[activeTab] || TAB_HERO_CONFIG.groups;
                return (
                  <div className="relative rounded-3xl overflow-hidden shadow-md border border-[#E8D8C4] dark:border-stone-800 bg-[#FAF2E8] dark:bg-[#1E1710] p-6 sm:p-8 md:p-10 flex flex-col items-center justify-center text-center select-none min-h-[210px] sm:min-h-[235px] group transition-all">
                    {/* Background image: devotional_background(3).webp with full 100% clarity (no fade/opacity) */}
                    <img 
                      src={devotionalBg3} 
                      alt="Digital Satsang Banner" 
                      className="absolute inset-0 w-full h-full object-cover object-center"
                    />
                    
                    {/* Clean warm overlay matching website palette */}
                    <div className="absolute inset-0 bg-gradient-to-b from-[#FFFDF8]/75 via-[#FAF0E4]/45 to-[#FFFDF8]/85 dark:from-[#1A120B]/80 dark:via-[#1A120B]/55 dark:to-[#1A120B]/90" />

                    <AnimatePresence mode="wait">
                      <motion.div
                        key={activeTab}
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -8 }}
                        transition={{ duration: 0.25 }}
                        className="relative z-10 space-y-2.5 max-w-2xl mx-auto flex flex-col items-center text-center"
                      >
                        {/* Top Pill Badge */}
                        <span className="text-[10.5px] md:text-xs font-bold uppercase tracking-wider text-[#651317] dark:text-amber-300 bg-[#FAF0E4]/90 dark:bg-[#2B1F14]/90 backdrop-blur-xs border border-[#E8D8C4] dark:border-stone-700 px-3.5 py-1 rounded-full shadow-2xs flex items-center gap-1.5">
                          <img src={currentHero.badgeIcon} alt="" className="w-3.5 h-3.5" />
                          <span>{isHi ? currentHero.badgeHi : currentHero.badgeEn}</span>
                        </span>
                        
                        {/* Main Heading in Website's Signature Temple Maroon */}
                        <h1 className="font-serif font-black text-2xl sm:text-3xl md:text-4xl lg:text-5xl text-[#651317] dark:text-[#FFFDF8] tracking-tight drop-shadow-xs">
                          {isHi ? currentHero.titleHi : currentHero.titleEn}
                        </h1>

                        {/* Sacred Divider */}
                        <div className="flex items-center justify-center gap-2.5 my-0.5 w-full">
                          <span className="w-12 sm:w-20 h-px bg-gradient-to-r from-transparent to-[#651317]/40 dark:to-amber-400/50" />
                          <span className="text-[#651317] dark:text-amber-400 text-xs sm:text-sm font-extrabold">✦ ॐ ✦</span>
                          <span className="w-12 sm:w-20 h-px bg-gradient-to-l from-transparent to-[#651317]/40 dark:to-amber-400/50" />
                        </div>

                        {/* Description Text in Website's Warm Brown */}
                        <p className="text-xs sm:text-sm md:text-base text-[#5C3026] dark:text-[#D4C5B9] font-medium leading-relaxed max-w-xl">
                          {isHi ? currentHero.descHi : currentHero.descEn}
                        </p>

                        {/* Feature Badges in Fixed Palette */}
                        <div className="flex flex-wrap items-center justify-center gap-2 md:gap-2.5 pt-1">
                          {currentHero.tags.map((tag, idx) => (
                            <div 
                              key={idx} 
                              className="bg-[#FFFDF8]/90 dark:bg-[#16110B]/90 backdrop-blur-xs border border-[#E8D8C4] dark:border-stone-700 text-[#651317] dark:text-amber-200 px-3 py-1.5 rounded-xl text-[10.5px] md:text-xs font-bold flex items-center gap-1.5 shadow-2xs"
                            >
                              <img src={tag.svg} alt="" className="w-4 h-4" />
                              <span>{isHi ? tag.labelHi : tag.labelEn}</span>
                            </div>
                          ))}
                        </div>
                      </motion.div>
                    </AnimatePresence>
                  </div>
                );
              })()}

              {/* ─── TAB SWITCHER ─────────────────────────────────── */}
              <div className="flex gap-1 overflow-x-auto scrollbar-none border border-[#E8D8C4] dark:border-stone-800 bg-[#FFFDF8] dark:bg-[#1A120B] rounded-2xl p-1.5 shadow-xs">
                {[
                  { id: 'groups', label: isHi ? 'समूह' : 'Groups', icon: Users },
                  { id: 'feed', label: isHi ? 'फीड' : 'Feed', icon: MessageSquare },
                  { id: 'events', label: isHi ? 'कार्यक्रम' : 'Events', icon: Calendar }
                ].map(tab => {
                  const Icon = tab.icon;
                  const isActive = activeTab === tab.id;
                  return (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id as any)}
                      className={`flex items-center justify-center gap-2 flex-1 px-4 py-2.5 text-xs md:text-sm font-extrabold transition-all rounded-xl whitespace-nowrap cursor-pointer ${
                        isActive
                          ? 'bg-[#651317] text-white shadow-xs'
                          : 'text-[#651317] dark:text-amber-200 hover:text-[#651317] hover:bg-[#FAF0E4] dark:hover:bg-stone-800'
                      }`}
                    >
                      <Icon className="w-4 h-4" />
                      {tab.label}
                    </button>
                  );
                })}
              </div>

              {/* ─── TAB 1: FEED VIEW ──────────────────────────────────── */}
              {activeTab === 'feed' && (
                <div className="rounded-2xl border border-[#E8D8C4] dark:border-stone-800 bg-white dark:bg-stone-900 overflow-hidden shadow-xs space-y-3 p-3">

                  {/* Post Creation Input Bar */}
                  <FeedComposer
                    isHi={isHi}
                    user={user}
                    onOpenCompose={(type) => {
                      if (type) setPostType(type);
                      setCreatePostOpen(true);
                    }}
                  />

                  {/* Feed Search Bar */}
                  <div className="relative flex items-center w-full h-10 rounded-xl bg-[#FFFDF8] dark:bg-stone-900/60 border border-[#E8D8C4] dark:border-stone-700/80 px-3 gap-2">
                    <Search className="w-4 h-4 text-[#651317] dark:text-amber-400 shrink-0" />
                    <input
                      type="text"
                      placeholder={isHi ? "पोस्ट, भजन या भक्त खोजें..." : "Search posts, bhajans, or devotees..."}
                      value={postSearchQuery}
                      onChange={(e) => setPostSearchQuery(e.target.value)}
                      className="flex-1 min-w-0 bg-transparent border-0 outline-none text-xs font-medium text-stone-900 dark:text-amber-100 placeholder:text-stone-400"
                    />
                    {postSearchQuery && (
                      <button onClick={() => setPostSearchQuery("")} className="text-stone-400 hover:text-stone-600 p-0.5">
                        <X className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>

                  {/* Feed Filter Pill Badges */}
                  <div className="flex items-center gap-1.5 overflow-x-auto [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden pb-1">
                    {[
                      { id: "All", labelEn: "All Feed", labelHiShort: "सभी" },
                      { id: "Bhajan Share", labelEn: "Bhajans", labelHiShort: "भजन" },
                      { id: "Bhajan Request", labelEn: "Requests", labelHiShort: "अनुरोध" },
                      { id: "Question", labelEn: "Questions", labelHiShort: "प्रश्न" },
                      { id: "Thought", labelEn: "Thoughts", labelHiShort: "विचार" },
                      { id: "Shloka", labelEn: "Shlokas", labelHiShort: "श्लोक" },
                      { id: "Event", labelEn: "Events", labelHiShort: "कार्यक्रम" },
                    ].map(({ id, labelEn, labelHiShort }) => {
                      const isSelected = feedFilter === id;
                      return (
                        <button
                          key={id}
                          onClick={() => setFeedFilter(id)}
                          className={`px-3.5 py-1.5 rounded-full text-xs font-extrabold transition-all shrink-0 border ${
                            isSelected
                              ? "bg-[#651317] border-[#651317] text-white shadow-xs"
                              : "bg-[#FAF6EE] dark:bg-stone-800 border-[#E8D8C4] dark:border-stone-700 text-[#651317] dark:text-stone-300 hover:bg-[#F5ECE0]"
                          }`}
                        >
                          {isHi ? labelHiShort : labelEn}
                        </button>
                      );
                    })}
                  </div>

                  {/* Loader */}
                  {loadingPosts && (
                    <div className="flex items-center justify-center py-12">
                      <Loader2 className="w-8 h-8 animate-spin text-orange-500" />
                    </div>
                  )}

                  {/* Empty state */}
                  {!loadingPosts && filteredPosts.length === 0 && (
                    <div className="text-center py-16 px-4">
                      <span className="text-4xl block">🌸</span>
                      <p className="text-stone-500 dark:text-stone-400 font-medium text-sm mt-3">
                        {isHi ? "कोई भक्तिमय पोस्ट नहीं मिली। पहली पोस्ट करें!" : "No devotional posts found. Start the satsang!"}
                      </p>
                    </div>
                  )}

                  {/* Posts timeline */}
                  {!loadingPosts && filteredPosts.length > 0 && (
                    <div className="space-y-4 pt-1">
                      {filteredPosts.map(post => (
                        <PostCard 
                          key={post.id}
                          variant="feed"
                          post={post}
                          user={user}
                          isHi={isHi}
                          comments={commentsMap[post.id] || []}
                          isCommentsExpanded={expandedCommentsPostId === post.id}
                          onToggleComments={handleToggleComments}
                          onToggleReaction={handleToggleReaction}
                          onToggleRsvp={handleToggleRsvp}
                          onVoteOption={handleVoteOption}
                          onDeleteComment={handleDeleteComment}
                          onAddComment={handleAddComment}
                          newCommentText={newCommentText}
                          setNewCommentText={setNewCommentText}
                          commentIsLyricsSubmit={commentIsLyricsSubmit}
                          setCommentIsLyricsSubmit={setCommentIsLyricsSubmit}
                          isLoadingComments={loadingCommentsPostIds[post.id]}
                          isPostSaved={isSaved(post.id)}
                          onToggleSavePost={handleToggleSavePost}
                          onDeletePost={async (id) => {
                            try {
                              await communityApi.softRemovePost(id);
                              loadPosts();
                            } catch (err) {
                              console.error("Delete post error:", err);
                            }
                          }}
                          onPostUpdated={loadPosts}
                        />
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* ─── TAB 2: GROUPS LIST VIEW ───────────────────────────── */}
              {activeTab === 'groups' && (
                <div className="space-y-6">
                  {(() => {
                    const joined = groups.filter(g => g.is_member);
                    
                    // Filter unjoined/search result list:
                    // If searching, show all matching groups. If not searching, show only groups they are NOT members of (discovery).
                    const exploreList = filteredGroups.filter(g => {
                      if (debouncedGroupSearch.trim() !== "") return true;
                      return !g.is_member;
                    });

                    return (
                      <>
                        {/* TOP TOOLBAR: SEARCH & CREATE GROUP */}
                        <div className="flex items-center justify-between gap-3 text-left w-full mb-2">
                          <div className="relative flex-1">
                            <Search className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
                            <Input 
                              type="text"
                              placeholder={isHi ? "समूह खोजें..." : "Search groups..."}
                              value={groupSearch}
                              onChange={(e) => setGroupSearch(e.target.value)}
                              className="pl-9 h-10 border-border bg-background rounded-xl w-full text-sm font-medium focus-visible:ring-1 focus-visible:ring-brand-primary"
                            />
                          </div>

                          <Button
                            onClick={() => setCreateGroupOpen(true)}
                            className="btn-primary shrink-0 text-sm font-extrabold px-4 h-10 rounded-xl flex items-center justify-center gap-1.5"
                          >
                            <Plus className="w-4 h-4" />
                            <span>{isHi ? "नया समूह" : "New Group"}</span>
                          </Button>
                        </div>

                        {/* 1. MY JOINED GROUPS SECTION */}
                        {joined.length > 0 && (
                          <div className="space-y-4 text-left">
                            <div className="flex items-center justify-between">
                              <h3 className="font-display font-extrabold text-sm text-brand-primary dark:text-amber-100 uppercase tracking-wider flex items-center gap-1.5">
                                👥 {isHi ? "मेरे समूह" : "My Communities"}
                              </h3>
                              <button 
                                onClick={() => setGroupSearch("")}
                                className="text-xs font-bold text-brand-gold hover:underline flex items-center gap-0.5"
                              >
                                {isHi ? "सभी देखें" : "See All"} <ChevronRight className="w-3.5 h-3.5" />
                              </button>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                              {joined.map(group => {
                                const deityFound = DEITIES.find(d => d.id === group.deity);
                                const hasValidGroupImg = group.image_url && 
                                  group.image_url.trim() !== "" && 
                                  group.image_url !== "null" && 
                                  group.image_url !== "undefined" && 
                                  (group.image_url.startsWith("http") || group.image_url.startsWith("/") || group.image_url.startsWith("data:"));
                                const cardCoverSrc = hasValidGroupImg ? group.image_url! : resolveCover(group.deity);
                                
                                const getDeityDisplayName = (deityId) => {
                                  if (!deityId) return "";
                                  const mappings = {
                                    "rama": { en: "Ram Ji", hi: "श्री राम जी" },
                                    "hanuman": { en: "Hanuman Ji", hi: "श्री हनुमान जी" },
                                    "krishna": { en: "Krishna Ji", hi: "श्री कृष्ण जी" },
                                    "shiva": { en: "Shiva Ji", hi: "शिव जी" },
                                    "ganesh": { en: "Ganesh Ji", hi: "गणेश जी" },
                                    "durga": { en: "Durga Ma", hi: "दुर्गा माँ" },
                                    "lakshmi": { en: "Lakshmi Ma", hi: "लक्ष्मी माँ" },
                                    "sai-baba": { en: "Sai Baba", hi: "साईं बाबा" }
                                  };
                                  const key = deityId.toLowerCase();
                                  if (mappings[key]) {
                                    return isHi ? mappings[key].hi : mappings[key].en;
                                  }
                                  return deityFound ? deityFound.name : deityId;
                                };

                                return (
                                  <div 
                                    key={group.id} 
                                    className="card-interactive overflow-hidden flex flex-col justify-between text-left relative min-h-[290px]"
                                  >
                                    {/* Cover Banner at the top of card */}
                                    <div className="h-32 w-full relative overflow-hidden bg-surface-alt">
                                      <img
                                        src={cardCoverSrc}
                                        alt={group.name}
                                        className="w-full h-full object-cover"
                                      />
                                      <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-black/10" />
                                    </div>

                                    {/* Avatar Overlap */}
                                    <div className="absolute left-5 top-20 z-20">
                                      <div className="w-16 h-16 rounded-full overflow-hidden border-4 border-background p-0.5 bg-background shadow-md">
                                        <img 
                                          src={deityFound ? deityFound.src : "/placeholder-deity.jpg"} 
                                          alt={group.name} 
                                          className="w-full h-full object-cover rounded-full" 
                                        />
                                      </div>
                                    </div>

                                    {/* Subtle background mandala-gold */}
                                    <div className="absolute right-0 bottom-0 translate-x-6 translate-y-6 opacity-[0.16] dark:opacity-[0.08] pointer-events-none w-28 h-28 z-0">
                                      <img src={mandalaGold} className="w-full h-full object-contain" alt="" />
                                    </div>

                                    {/* Card Content Body */}
                                    <div className="relative z-10 pt-7 px-5 pb-5 flex-1 flex flex-col justify-between space-y-4">
                                      <div className="space-y-3">
                                        {/* Header Title Row */}
                                        <div className="flex items-center justify-between gap-2 mt-1">
                                          <h4 className="font-display font-extrabold text-base text-brand-primary truncate leading-snug">
                                            {group.name}
                                          </h4>
                                          <span className="shrink-0 inline-flex items-center gap-0.5 text-[9px] font-extrabold px-2 py-0.5 rounded-full bg-brand-gold/10 border border-brand-gold/30 text-brand-gold uppercase">
                                            🪷 {getDeityDisplayName(group.deity)}
                                          </span>
                                        </div>

                                        <p className="text-xs text-muted-foreground font-bold flex items-center gap-1">
                                          👥 {group.member_count} {isHi ? "भक्त जुड़े हैं" : "devotees joined"}
                                        </p>

                                        {/* Group Description */}
                                        <p className="text-xs text-muted-foreground font-medium line-clamp-2 leading-relaxed">
                                          {group.description || (isHi ? "भक्तिमय संगीत और नाम जाप साझा करने का स्थान।" : "A space for sharing devotional music and chanting.")}
                                        </p>
                                      </div>

                                      {/* Full width button */}
                                      <div className="pt-2">
                                        <button
                                          onClick={() => handleOpenGroupDetails(group)}
                                          className="btn-primary btn-sm btn-full"
                                        >
                                          <span>{isHi ? "समूह देखें" : "See Group"}</span>
                                          <ChevronRight className="w-4 h-4" />
                                        </button>
                                      </div>
                                    </div>
                                  </div>
                                );
                              })}
                            </div>
                          </div>
                        )}

                        {/* BOTTOM BANNER CARD */}
                        <div className="bg-gradient-to-r from-amber-500/10 to-brand-gold/5 border border-[hsl(var(--brand-gold-border))] p-4 rounded-3xl flex items-center gap-3 text-left relative overflow-hidden">
                          <div className="w-10 h-10 rounded-full bg-background border border-[hsl(var(--brand-gold-border))] flex items-center justify-center shrink-0">
                            <span className="text-lg">🪷</span>
                          </div>
                          <p className="text-xs text-brand-primary dark:text-amber-100 font-bold leading-normal">
                            {isHi 
                              ? "आइए मिलकर अधिक से अधिक नाम जाप करें और इस लक्ष्य को प्राप्त करें।" 
                              : "Let us chant as much as possible together and achieve this spiritual goal."}
                          </p>
                        </div>



                        {/* 2. EXPLORE / DISCOVER COMMUNITIES SECTION */}
                        <div className="space-y-5 text-left pt-2">
                          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                            <div>
                              <h3 className="font-display font-extrabold text-sm text-brand-primary dark:text-amber-100 uppercase tracking-wider">
                                🔍 {isHi ? "नए समूह खोजें" : "Explore Groups"}
                              </h3>
                            </div>
                          </div>

                          {loadingGroups && (
                            <div className="flex items-center justify-center py-12">
                              <Loader2 className="w-8 h-8 animate-spin text-brand-primary" />
                            </div>
                          )}

                          {/* Empty Search results */}
                          {!loadingGroups && exploreList.length === 0 && (
                            <div className="text-center py-12 bg-card border border-dashed border-border rounded-3xl relative overflow-hidden">
                              <div className="absolute right-0 bottom-0 opacity-[0.03] pointer-events-none w-24 h-24">
                                <img src={mandalaBeige} className="w-full h-full object-contain" alt="" />
                              </div>
                              <span className="text-3xl block">📿</span>
                              <p className="text-muted-foreground font-medium text-xs mt-3">
                                {isHi ? "कोई समूह नहीं मिला।" : "No groups found."}
                              </p>
                              <Button 
                                onClick={() => setCreateGroupOpen(true)}
                                className="btn-primary btn-sm mt-4"
                              >
                                {isHi ? "नया समूह बनाएं" : "Create Group"}
                              </Button>
                            </div>
                          )}

                          {/* Suggested Unjoined / Search results listing */}
                          {!loadingGroups && exploreList.length > 0 && (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-5 w-full">
                              {exploreList.map(group => {
                                const deityFound = DEITIES.find(d => d.id === group.deity);
                                const hasValidGroupImg = group.image_url && 
                                  group.image_url.trim() !== "" && 
                                  group.image_url !== "null" && 
                                  group.image_url !== "undefined" && 
                                  (group.image_url.startsWith("http") || group.image_url.startsWith("/") || group.image_url.startsWith("data:"));
                                const cardCoverSrc = hasValidGroupImg ? group.image_url! : resolveCover(group.deity);

                                return (
                                  <div 
                                    key={group.id}
                                    className="overflow-hidden rounded-3xl bg-card border border-border shadow-sm hover:shadow-md transition-all flex flex-col justify-between relative group min-h-[290px] text-left"
                                  >
                                    {/* Header Banner representing deity */}
                                    <div className="h-32 w-full relative overflow-hidden bg-surface-alt">
                                      <img
                                        src={cardCoverSrc}
                                        alt={group.name}
                                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-103"
                                        loading="lazy"
                                      />
                                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/20" />
                                      
                                      {/* Public/Private badge */}
                                      <span className={`absolute top-3 left-3 text-[9px] font-bold px-2.5 py-1 rounded-full text-white/95 flex items-center gap-1.5 backdrop-blur-md border border-white/10 ${
                                        group.is_public ? "bg-emerald-600/70" : "bg-rose-700/70"
                                      }`}>
                                        <Globe className="w-2.5 h-2.5" />
                                        {group.is_public ? (isHi ? "सार्वजनिक" : "Public") : (isHi ? "निजी" : "Private")}
                                      </span>
                                    </div>

                                    {/* Content Card Body */}
                                    <div className="p-5 flex-1 flex flex-col justify-between relative overflow-hidden">
                                      <div className="absolute right-0 bottom-0 translate-x-6 translate-y-6 opacity-[0.06] dark:opacity-[0.03] pointer-events-none w-24 h-24">
                                        <img src={mandalaBeige} className="w-full h-full object-contain" alt="" />
                                      </div>

                                      <div className="space-y-2">
                                        {/* Deity Indicator tag */}
                                        {(() => {
                                          const getDeityDisplayName = (deityId) => {
                                            if (!deityId) return "";
                                            const mappings = {
                                              "rama": { en: "Rama Ji", hi: "श्री राम जी" },
                                              "hanuman": { en: "Hanuman Ji", hi: "श्री हनुमान जी" },
                                              "krishna": { en: "Krishna Ji", hi: "श्री कृष्ण जी" },
                                              "shiva": { en: "Shiva Ji", hi: "शिव जी" },
                                              "ganesh": { en: "Ganesh Ji", hi: "गणेश जी" },
                                              "durga": { en: "Durga Ma", hi: "दुर्गा माँ" },
                                              "lakshmi": { en: "Lakshmi Ma", hi: "लक्ष्मी माँ" },
                                              "sai-baba": { en: "Sai Baba", hi: "साईं बाबा" }
                                            };
                                            const key = deityId.toLowerCase();
                                            if (mappings[key]) {
                                              return isHi ? mappings[key].hi : mappings[key].en;
                                            }
                                            return deityFound ? deityFound.name : deityId;
                                          };
                                          const dName = getDeityDisplayName(group.deity);
                                          return dName ? (
                                            <span className="inline-block text-[9px] font-extrabold px-2 py-0.5 rounded-full bg-brand-gold/10 border border-brand-gold/30 text-brand-gold uppercase tracking-wide">
                                              🪷 {dName}
                                            </span>
                                          ) : null;
                                        })()}

                                        <h3 className="font-display text-base font-extrabold text-brand-primary dark:text-amber-100 leading-snug">
                                          {group.name}
                                        </h3>
                                        <p className="text-xs text-muted-foreground font-bold">
                                          👥 {group.member_count} {isHi ? "भक्त जुड़े हैं" : "Members"}
                                        </p>
                                        
                                        <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed">
                                          {group.description || (isHi ? "भक्तिमय संगीत और नाम जाप साझा करने का स्थान।" : "A space for sharing devotional music and thoughts.")}
                                        </p>
                                      </div>

                                      {/* Action Buttons */}
                                      <div className="flex gap-2 mt-4 pt-3 border-t border-border">
                                        {group.is_member ? (
                                          <>
                                            <Button
                                              onClick={() => handleOpenGroupDetails(group)}
                                              className="btn-primary btn-sm flex-1 text-sm font-extrabold"
                                            >
                                              {isHi ? "समूह देखें" : "View Group"}
                                            </Button>
                                            <Button
                                              variant="outline"
                                              onClick={() => handleToggleGroupJoin(group)}
                                              className="btn-secondary btn-sm flex-1 text-rose-600 border-rose-500/20 bg-rose-500/5 flex items-center justify-center gap-1 text-sm font-extrabold"
                                            >
                                              <Check className="w-3.5 h-3.5" />
                                              {isHi ? "शामिल हैं" : "Joined"}
                                            </Button>
                                          </>
                                        ) : (
                                          <>
                                            <Button
                                              variant="outline"
                                              onClick={() => handleOpenGroupDetails(group)}
                                              className="btn-secondary btn-sm flex-1 text-sm font-extrabold"
                                            >
                                              {isHi ? "विवरण देखें" : "Details"}
                                            </Button>
                                            <Button
                                              onClick={() => handleToggleGroupJoin(group)}
                                              className="btn-primary btn-sm flex-1 flex items-center justify-center gap-1 text-sm font-extrabold"
                                            >
                                              <Plus className="w-3.5 h-3.5 text-white" />
                                              {isHi ? "शामिल हों" : "Join"}
                                            </Button>
                                          </>
                                        )}
                                      </div>
                                    </div>
                                  </div>
                                );
                              })}
                            </div>
                          )}
                        </div>
                      </>
                    );
                  })()}
                </div>
              )}{/* ─── TAB 3: EVENTS VIEW ────────────────────────────────── */}
              {activeTab === 'events' && (
                <div className="space-y-6">
                  <div className="flex items-center justify-between border-b border-orange-500/10 pb-3">
                    <div>
                      <h3 className="font-display font-extrabold text-base text-orange-950 dark:text-amber-100">
                        {isHi ? "आगामी सत्संग कार्यक्रम" : "Upcoming Satsang Events"}
                      </h3>
                      <p className="text-xs text-stone-500 mt-1">
                        {isHi ? "आसपास हो रहे भजन संध्या, सत्संग और कीर्तन कार्यक्रमों में भाग लें।" : "Participate in local bhajan sandhyas, satsangs, and kirtan programs."}
                      </p>
                    </div>
                    <Button 
                      onClick={() => {
                        setPostType('event');
                        setCreatePostOpen(true);
                      }}
                      className="bg-[#5c1d0c] hover:bg-[#4a170a] text-white text-sm font-extrabold rounded-xl"
                    >
                      <Plus className="w-4 h-4 mr-1" />
                      {isHi ? "कार्यक्रम जोड़ें" : "Add Event"}
                    </Button>
                  </div>

                  {eventsList.length === 0 ? (
                    <div className="text-center py-16 bg-white dark:bg-stone-900 border border-orange-500/10 rounded-2xl">
                      <span className="text-4xl block">📅</span>
                      <p className="text-stone-500 dark:text-stone-400 font-medium text-sm mt-3">
                        {isHi ? "कोई आगामी कार्यक्रम निर्धारित नहीं है।" : "No events scheduled yet."}
                      </p>
                      <Button 
                        onClick={() => {
                          setPostType('event');
                          setCreatePostOpen(true);
                        }}
                        className="mt-4 bg-[#5c1d0c] hover:bg-[#4a170a] text-white rounded-xl text-sm font-extrabold px-4 py-2"
                      >
                        {isHi ? "पहला कार्यक्रम जोड़ें" : "Schedule Event"}
                      </Button>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {eventsList.map(post => (
                        <PostCard 
                          key={post.id} 
                          post={post}
                          user={user}
                          isHi={isHi}
                          comments={commentsMap[post.id] || []}
                          isCommentsExpanded={expandedCommentsPostId === post.id}
                          onToggleComments={handleToggleComments}
                          onToggleReaction={handleToggleReaction}
                          onToggleRsvp={handleToggleRsvp}
                          onVoteOption={handleVoteOption}
                          onDeleteComment={handleDeleteComment}
                          onAddComment={handleAddComment}
                          newCommentText={newCommentText}
                          setNewCommentText={setNewCommentText}
                          commentIsLyricsSubmit={commentIsLyricsSubmit}
                          setCommentIsLyricsSubmit={setCommentIsLyricsSubmit}
                          isLoadingComments={loadingCommentsPostIds[post.id]}
                          isPostSaved={isSaved(post.id)}
                          onToggleSavePost={handleToggleSavePost}
                          onDeletePost={async (id) => {
                            try {
                              await communityApi.softRemovePost(id);
                              loadPosts();
                            } catch (err) {
                              console.error("Delete post error:", err);
                            }
                          }}
                          onPostUpdated={loadPosts}
                        />
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* ─── 3. RIGHT SIDEBAR: COMMUNITY WIDGETS (Feed tab only, desktop only) ─── */}
            {activeTab === 'feed' && (
              <div className="hidden lg:block lg:col-span-4 space-y-6 sticky top-24">
                
                {/* Widget A: Bhajan Requests list */}
                <div className="bg-white dark:bg-stone-900 border border-orange-500/10 rounded-2xl p-5 shadow-xs space-y-4">
                  <div className="flex items-center justify-between pb-2 border-b border-orange-500/10">
                    <h3 className="font-display font-extrabold text-[11px] text-orange-950 dark:text-amber-100 uppercase tracking-wider flex items-center gap-1">
                      📿 {isHi ? "भजन अनुरोध" : "Bhajan Requests"}
                    </h3>
                    <button 
                      onClick={() => setFeedFilter("Bhajan Request")}
                      className="text-[10px] font-bold text-orange-500 hover:underline"
                    >
                      {isHi ? "सभी देखें" : "See All"}
                    </button>
                  </div>

                  <div className="space-y-3">
                    {posts.filter(p => p.type === 'bhajan_request').slice(0, 2).length === 0 ? (
                      <p className="text-[11px] text-stone-400 py-3 text-center font-medium">
                        {isHi ? "अभी कोई सक्रिय अनुरोध नहीं है।" : "No active requests yet."}
                      </p>
                    ) : (
                      posts.filter(p => p.type === 'bhajan_request').slice(0, 2).map(req => (
                        <div key={req.id} className="p-3 bg-stone-50 dark:bg-stone-950 border border-orange-500/5 rounded-xl space-y-2 text-left">
                          <div className="w-7 h-7 rounded-full bg-purple-500/10 flex items-center justify-center text-[10px] shrink-0 select-none">
                            📿
                          </div>
                          <div>
                            <p className="font-bold text-[11.5px] text-orange-950 dark:text-amber-100 line-clamp-1">
                              {req.title || (isHi ? "मुझे यह भजन नहीं मिल रहा" : "Can't find this bhajan")}
                            </p>
                            <p className="text-[10px] text-stone-500 line-clamp-2 mt-0.5">
                              {req.content}
                            </p>
                          </div>
                          <div className="flex items-center justify-end pt-1 border-t border-stone-100 dark:border-stone-900/60 mt-1">
                            <button
                              onClick={() => handleToggleComments(req.id)}
                              className="bg-purple-600 hover:bg-purple-700 text-white text-[9.5px] font-extrabold py-1 px-2.5 rounded-lg active:scale-95 transition-all shadow-sm"
                            >
                              {isHi ? "सहायता करें" : "Help"}
                            </button>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>

                {/* Widget B: Upcoming Events list */}
                <div className="bg-white dark:bg-stone-900 border border-orange-500/10 rounded-2xl p-5 shadow-xs space-y-4">
                  <div className="flex items-center justify-between pb-2 border-b border-orange-500/10">
                    <h3 className="font-display font-extrabold text-[11px] text-orange-950 dark:text-amber-100 uppercase tracking-wider flex items-center gap-1">
                      📅 {isHi ? "आगामी कार्यक्रम" : "Upcoming Events"}
                    </h3>
                    <button 
                      onClick={() => setActiveTab('events')}
                      className="text-[10px] font-bold text-orange-500 hover:underline"
                    >
                      {isHi ? "सभी देखें" : "See All"}
                    </button>
                  </div>

                  <div className="space-y-3">
                    {eventsList.slice(0, 2).length === 0 ? (
                      <p className="text-[11px] text-stone-400 py-3 text-center font-medium">
                        {isHi ? "अभी कोई आगामी कार्यक्रम नहीं है।" : "No upcoming events yet."}
                      </p>
                    ) : (
                      eventsList.slice(0, 2).map(evt => {
                        const dateObj = new Date(evt.created_at);
                        const day = dateObj.getDate();
                        const months = isHi 
                          ? ['जनवरी', 'फरवरी', 'मार्च', 'अप्रैल', 'मई', 'जून', 'जुलाई', 'अगस्त', 'सितंबर', 'अक्टूबर', 'नवंबर', 'दिसंबर']
                          : ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
                        const month = months[dateObj.getMonth()];
                        
                        return (
                          <div key={evt.id} className="flex gap-3 p-3 bg-stone-50 dark:bg-stone-950 border border-orange-500/5 rounded-xl text-left items-start">
                            <div className="w-10 h-10 rounded-lg bg-rose-500/10 border border-rose-500/20 text-rose-600 dark:text-rose-400 flex flex-col items-center justify-center shrink-0">
                              <span className="text-sm font-extrabold leading-none">{day}</span>
                              <span className="text-[7.5px] font-extrabold uppercase mt-0.5 leading-none">{month}</span>
                            </div>
                            
                            <div className="min-w-0 flex-1 space-y-1">
                              <p className="font-bold text-[11.5px] text-orange-950 dark:text-amber-100 truncate">
                                {evt.title}
                              </p>
                              <p className="text-[9px] text-stone-500 truncate leading-none">
                                {isHi ? "आज • 7:00 PM" : "Today • 7:00 PM"}
                              </p>
                              <p className="text-[9.5px] text-stone-600 dark:text-stone-400 font-medium truncate">
                                {evt.content}
                              </p>
                              
                              <div className="flex items-center justify-end pt-1 mt-1.5 border-t border-stone-100 dark:border-stone-900/60">
                                <button
                                  type="button"
                                  onClick={() => handleToggleRsvp(evt.id, evt.rsvp_status || null, 'interested')}
                                  className={`text-[11px] font-extrabold py-1 px-3 rounded-lg active:scale-95 transition-all shadow-xs cursor-pointer ${
                                    evt.rsvp_status
                                      ? "bg-amber-100 text-[#651317] dark:bg-amber-950 dark:text-amber-200 border border-amber-300 dark:border-amber-800"
                                      : "bg-[#651317] hover:bg-[#4f0f12] text-white"
                                  }`}
                                >
                                  {evt.rsvp_status ? (isHi ? "✓ रुचि दर्ज" : "✓ Joined") : (isHi ? "रुचि दिखाएं" : "Join")}
                                </button>
                              </div>
                            </div>
                          </div>
                        );
                      })
                    )}
                  </div>
                </div>

                {/* Widget D: Devotional Quote */}
                <div className="bg-[#FAF6EE]/50 dark:bg-[#120f0b]/40 border border-orange-500/10 rounded-2xl p-5 shadow-xs relative overflow-hidden text-center select-none">
                  <span className="absolute top-1 left-3 text-stone-200 dark:text-stone-850 font-serif text-5xl opacity-40 shrink-0">“</span>
                  <span className="absolute bottom-1 right-3 text-stone-200 dark:text-stone-850 font-serif text-5xl opacity-40 shrink-0">”</span>
                  
                  <p className="relative z-10 text-[11.5px] italic text-stone-600 dark:text-stone-300 font-medium leading-relaxed px-2">
                    {isHi 
                      ? "संगत का प्रभाव ऐसा है, जैसा चंदन का वृक्ष पास आने पर होता है।" 
                      : "The influence of good association is like that of a sandalwood tree; its fragrance naturally permeates everything nearby."}
                  </p>
                  
                  <div className="flex items-center justify-center gap-2 mt-3.5 relative z-10">
                    <span className="w-6 h-px bg-amber-500/25" />
                    <span className="text-[10px] filter drop-shadow-sm">🪷</span>
                    <span className="w-6 h-px bg-amber-500/25" />
                  </div>
                </div>

              </div>
            )}
            
          </div>



        </div>
      )}

      {/* If we are loading the group for the slug, show a loading spinner */}
      {groupViewOpen && !selectedGroup && (
        <div className="min-h-[60vh] flex flex-col items-center justify-center space-y-4">
          <div className="w-8 h-8 border-4 border-[#5c1d0c] border-t-transparent rounded-full animate-spin" />
          <p className="text-xs font-semibold text-stone-500 dark:text-stone-400">
            {isHi ? "समूह लोड हो रहा है..." : "Loading group..."}
          </p>
        </div>
      )}

      {groupViewOpen && selectedGroup && (
        <GroupHall
          group={selectedGroup}
          posts={posts}
          groupMembers={groupMembers}
          groupRankings={groupRankings}
          loadingRankings={loadingRankings}
          user={user}
          isHi={isHi}
          activeGroupTab={activeGroupTab}
          setActiveGroupTab={setActiveGroupTab}
          bhajanSearch={bhajanSearch}
          setBhajanSearch={setBhajanSearch}
          bhajanSort={bhajanSort}
          setBhajanSort={setBhajanSort}
          dismissedAnnouncements={dismissedAnnouncements}
          setDismissedAnnouncements={setDismissedAnnouncements}
          showMemberManagement={showMemberManagement}
          setShowMemberManagement={setShowMemberManagement}
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
          loadGroups={loadGroups}
          handleWhatsAppInvite={handleWhatsAppInvite}
          handleCopyGroupLink={handleCopyGroupLink}
          handleToggleGroupJoin={handleToggleGroupJoin}
          handleDeleteGroupAction={handleDeleteGroupAction}
          handleRemoveMember={handleRemoveMember}
          setCreatePostOpen={setCreatePostOpen}
          setPostType={setPostType}
          setLogChantsOpen={setLogChantsOpen}
          onStartJapa={() => handleStartGroupJapa(selectedGroup)}
        />
      )}
      
      {/* ─── MODAL: LOG CHANTS TO GROUP ─────────────────────────── */}
      <Dialog open={logChantsOpen} onOpenChange={setLogChantsOpen}>
        <DialogContent className="max-w-md bg-[#FAF6EE] dark:bg-[#0f0d0a] border-amber-500/20 text-stone-950 dark:text-stone-50 rounded-3xl p-6 shadow-2xl">
          <DialogHeader className="font-sans">
            <DialogTitle className="font-display font-extrabold text-lg text-orange-950 dark:text-amber-100 text-center flex items-center justify-center gap-1.5">
              📿 {isHi ? "नाम जप साधना व समर्पण" : "Naam Japa Sadhana"}
            </DialogTitle>
            <DialogDescription className="text-center text-xs text-stone-500 mt-1">
              {isHi 
                ? `${selectedGroup?.name} के सामूहिक जप यज्ञ में साधना करें अथवा जप समर्पण करें`
                : `Chant live or contribute completed rounds to ${selectedGroup?.name}`}
            </DialogDescription>
          </DialogHeader>

          {/* Primary Action: Go to Interactive Japa Sadhana Counter */}
          <div className="mt-4 p-4 rounded-2xl bg-gradient-to-r from-amber-500/15 via-orange-500/10 to-amber-500/15 border border-amber-500/30 flex flex-col items-center text-center space-y-2">
            <span className="text-xs font-bold text-orange-950 dark:text-amber-200">
              {isHi ? "🎯 लाइव डिजिटल माला / काउंटर से जप करें" : "🎯 Practice live with Digital Mala & Counter"}
            </span>
            <p className="text-[11px] text-stone-600 dark:text-stone-300">
              {isHi 
                ? "माला संख्या, संकल्प व मोड चुनकर लाइव साधना आरंभ करें" 
                : "Select Mala target, Sankalp & practice mode with full audio-visual counter"}
            </p>
            <Button
              type="button"
              onClick={() => {
                setLogChantsOpen(false);
                handleStartGroupJapa(selectedGroup);
              }}
              className="w-full bg-[#651317] hover:bg-[#4f0f12] text-white font-extrabold rounded-xl py-2.5 shadow-md active:scale-98 transition-all flex items-center justify-center gap-2 text-xs"
            >
              <span>📿</span>
              <span>{isHi ? "जप साधना प्रारंभ करें (Start Sadhana)" : "Start Interactive Japa"}</span>
              <ChevronRight className="w-4 h-4" />
            </Button>
          </div>

          <div className="relative flex py-1 items-center">
            <div className="flex-grow border-t border-amber-500/20"></div>
            <span className="flex-shrink mx-3 text-[10px] uppercase font-bold text-stone-400">
              {isHi ? "या पहले से किए गए जप दर्ज करें" : "OR LOG OFFLINE CHANTS"}
            </span>
            <div className="flex-grow border-t border-amber-500/20"></div>
          </div>

          <form onSubmit={handleLogGroupChants} className="space-y-4 font-sans">
            
            {/* Display group's deity mantra details */}
            {(() => {
              const groupDeity = selectedGroup?.deity?.toLowerCase();
              const matchingMantra = mantras?.find(m => m.deity?.toLowerCase() === groupDeity) || mantras?.[0];
              return (
                <div className="bg-amber-500/5 border border-amber-500/15 rounded-2xl p-3 text-center">
                  <span className="text-[10px] uppercase font-black tracking-wider text-amber-600 block">{isHi ? "समर्पित मंत्र" : "Target Mantra"}</span>
                  <span className="text-sm font-extrabold text-orange-950 dark:text-amber-100 block mt-0.5">
                    {isHi ? matchingMantra?.name_hindi : matchingMantra?.name_english}
                  </span>
                </div>
              );
            })()}

            {/* Chants count selection */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-stone-600 dark:text-stone-300 block">
                {isHi ? "जप संख्या (संख्या)" : "Number of Chants"}
              </label>
              <Input 
                type="number"
                min={1}
                value={chantsToLog}
                onChange={(e) => setChantsToLog(Math.max(1, Number(e.target.value)))}
                required
                className="border-amber-500/20 bg-white dark:bg-stone-950/40 rounded-xl font-extrabold text-center text-base h-11"
              />
              
              {/* Quick tap round values */}
              <div className="grid grid-cols-3 gap-2 mt-2">
                {[
                  { label: isHi ? "१ माला (१०८)" : "1 Mala (108)", val: 108 },
                  { label: isHi ? "५ माला (५४०)" : "5 Malas (540)", val: 540 },
                  { label: isHi ? "११ माला (११८८)" : "11 Malas (1188)", val: 1188 }
                ].map(opt => (
                  <button
                    key={opt.val}
                    type="button"
                    onClick={() => setChantsToLog(opt.val)}
                    className={`py-1.5 rounded-lg border text-[10px] font-extrabold transition-all ${
                      chantsToLog === opt.val
                        ? "bg-amber-500 border-amber-600 text-white"
                        : "bg-white dark:bg-stone-900 border-amber-500/10 text-stone-600 dark:text-stone-300 hover:bg-amber-500/5"
                    }`}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Custom Sankalp input */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-stone-600 dark:text-stone-300">
                {isHi ? "संकल्प (वैकल्पिक)" : "Sankalp / Intention (Optional)"}
              </label>
              <textarea
                rows={2}
                value={customSankalp}
                onChange={(e) => setCustomSankalp(e.target.value)}
                className="w-full text-xs rounded-xl border border-amber-500/20 bg-white dark:bg-stone-950/40 p-3 focus:border-amber-500 focus:outline-none placeholder:text-stone-400 leading-relaxed font-medium"
                placeholder={isHi ? "जैसे: लोक शांति हेतु, पारिवारिक स्वास्थ्य हेतु..." : "e.g., For family peace, gratitude..."}
              />
            </div>

            {/* Action buttons */}
            <div className="flex gap-3 pt-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setLogChantsOpen(false)}
                className="flex-1 rounded-xl border border-stone-200 dark:border-stone-700"
              >
                {isHi ? "रद्द करें" : "Cancel"}
              </Button>
              <Button
                type="submit"
                disabled={loggingChants}
                className="flex-1 bg-amber-500 hover:bg-amber-600 text-white font-bold rounded-xl flex items-center justify-center gap-1"
              >
                {loggingChants ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    {isHi ? "समर्पण हो रहा..." : "Submitting..."}
                  </>
                ) : (
                  <>
                    <span>📿</span>
                    {isHi ? "जप समर्पित करें" : "Log Chants"}
                  </>
                )}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* ─── MODAL: CREATE POST ─────────────────────────────────── */}
      <CreatePostDialog
        open={createPostOpen}
        onOpenChange={setCreatePostOpen}
        isHi={isHi}
        postType={postType}
        setPostType={setPostType}
        postTitle={postTitle}
        setPostTitle={setPostTitle}
        postContent={postContent}
        setPostContent={setPostContent}
        postImagePreview={postImagePreview}
        postYoutubeUrl={postYoutubeUrl}
        setPostYoutubeUrl={setPostYoutubeUrl}
        pollOptions={pollOptions}
        setPollOptions={setPollOptions}
        eventDate={eventDate}
        setEventDate={setEventDate}
        eventTime={eventTime}
        setEventTime={setEventTime}
        postLocation={postLocation}
        setPostLocation={setPostLocation}
        eventLinkedBhajan={eventLinkedBhajan}
        setEventLinkedBhajan={setEventLinkedBhajan}
        myBhajans={myBhajans}
        publishingPost={publishingPost}
        handleImageChange={handleImageChange}
        onCroppedImageReady={handleCroppedImageReady}
        onRemoveImage={handleRemoveImage}
        onSubmit={handleCreatePost}
      />

      {/* ─── MODAL: CREATE GROUP ────────────────────────────────── */}
      <CreateGroupDialog
        open={createGroupOpen}
        onOpenChange={setCreateGroupOpen}
        isHi={isHi}
        groupName={groupName}
        setGroupName={setGroupName}
        groupDesc={groupDesc}
        setGroupDesc={setGroupDesc}
        groupDeity={groupDeity}
        setGroupDeity={setGroupDeity}
        creatingGroup={creatingGroup}
        isNameUnique={isNameUnique}
        onSubmit={handleCreateGroup}
      />
    </div>
  );
}
