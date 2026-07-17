import { useState, useEffect, useMemo, useRef } from "react";
import { useNavigate, useParams } from "react-router-dom";
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
import { uploadToCloudinary } from "@/lib/cloudinary";
import { queryUserUploads } from "@/lib/supabaseQueries";
import { toast } from "sonner";
import { SEO } from "@/components/SEO";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { PostCard } from "@/components/community/PostCard";
import { EventsTab } from "@/components/community/EventsTab";
import { SatsangFeedTab } from "@/components/community/SatsangFeedTab";
import { DevoteesTab } from "@/components/community/DevoteesTab";
import { GroupHall } from "@/components/community/GroupHall";
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
  const [activeTab, setActiveTab] = useState<'feed' | 'groups' | 'events'>('feed');

  // Core Data
  const [posts, setPosts] = useState<CommunityPost[]>([]);
  const [groups, setGroups] = useState<Group[]>([]);
  const [myBhajans, setMyBhajans] = useState<any[]>([]);
  const [loadingPosts, setLoadingPosts] = useState(true);
  const [loadingGroups, setLoadingGroups] = useState(true);
  
  // Modals
  const [createPostOpen, setCreatePostOpen] = useState(false);
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


  // Feed Filter type
  const [feedFilter, setFeedFilter] = useState<string>("All");

  // Post Creator form states
  const [postType, setPostType] = useState<'bhajan_share' | 'bhajan_request' | 'question' | 'thought' | 'event'>('thought');
  const [postTitle, setPostTitle] = useState("");
  const [postContent, setPostContent] = useState("");
  const [postImageFile, setPostImageFile] = useState<File | null>(null);
  const [postImagePreview, setPostImagePreview] = useState<string | null>(null);
  const [postYoutubeUrl, setPostYoutubeUrl] = useState("");
  // Quick-tap options for Question type
  const [pollOptions, setPollOptions] = useState<string[]>(["", ""]);
  // Event fields
  const [eventDate, setEventDate] = useState("");
  const [eventTime, setEventTime] = useState("");
  const [eventLocation, setEventLocation] = useState("");
  const [eventLinkedBhajan, setEventLinkedBhajan] = useState<number | null>(null);
  const [publishingPost, setPublishingPost] = useState(false);

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
  const loadPosts = async () => {
    setLoadingPosts(true);
    const data = await communityApi.fetchPosts(user?.id);
    setPosts(data);
    setLoadingPosts(false);
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

  // Log group chants handler (calls useMantraJapa mutation)
  const handleLogGroupChants = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedGroup || !user) {
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
        userId: user.id,
        mantraId: matchingMantra.id,
        sankalp: customSankalp || undefined,
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
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setPostImageFile(file);
      const reader = new FileReader();
      reader.onload = () => setPostImagePreview(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  // Post Creator submit handler
  const handleCreatePost = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      toast.error(isHi ? "पोस्ट प्रकाशित करने के लिए कृपया लॉग इन करें" : "Please log in to publish posts");
      return;
    }
    if (postType !== 'thought' && !postTitle.trim()) {
      toast.error(isHi ? "शीर्षक आवश्यक है" : "Title is required");
      return;
    }
    if (!postContent.trim()) {
      toast.error(isHi ? "विवरण सामग्री आवश्यक है" : "Content description is required");
      return;
    }

    try {
      setPublishingPost(true);
      let imageUrl = null;
      if (postImageFile) {
        imageUrl = await uploadToCloudinary(postImageFile, 'lyrics');
      }

      const options = postType === 'question' 
        ? pollOptions.filter(o => o.trim())
        : null;

      let eventDt = null;
      if (postType === 'event' && eventDate) {
        eventDt = new Date(`${eventDate}T${eventTime || '00:00'}`).toISOString();
      }

      await communityApi.createPost({
        group_id: selectedGroup?.id || null,
        author_id: user.id,
        type: postType,
        title: postTitle.trim() || null,
        content: postContent.trim(),
        image_url: imageUrl,
        youtube_url: postYoutubeUrl.trim() || null,
        question_options: options,
        event_datetime: eventDt,
        event_location: postLocation.trim() || null,
        linked_bhajan_id: eventLinkedBhajan
      });

      toast.success(isHi ? "भक्तिमय पोस्ट प्रकाशित की गई!" : "Devotional post published!");
      
      // Reset forms
      setPostTitle("");
      setPostContent("");
      setPostImageFile(null);
      setPostImagePreview(null);
      setPostYoutubeUrl("");
      setPollOptions(["", ""]);
      setEventDate("");
      setEventTime("");
      setEventLocation("");
      setEventLinkedBhajan(null);
      setCreatePostOpen(false);

      loadPosts();
    } catch (err: any) {
      console.error("Post creation error:", err);
      const errMsg = err?.message || err?.details || JSON.stringify(err);
      toast.error(isHi ? `पोस्ट प्रकाशित करने में असमर्थ: ${errMsg}` : `Failed to publish post: ${errMsg}`);
    } finally {
      setPublishingPost(false);
    }
  };

  // Event location state field
  const [postLocation, setPostLocation] = useState("");

  // Computed views filter
  const filteredPosts = useMemo(() => {
    let list = posts;
    if (postId) {
      return list.filter(p => p.id === postId);
    }
    if (selectedGroup) {
      list = list.filter(p => p.group_id === selectedGroup.id);
    }
    if (feedFilter !== "All") {
      list = list.filter(p => p.type === feedFilter.toLowerCase().replace(" ", "_"));
    }
    return list;
  }, [posts, feedFilter, selectedGroup, postId]);

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
    return posts.filter(p => p.type === 'event');
  }, [posts]);

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
      <header className="sticky top-0 z-30 bg-[#FAF6EE]/95 dark:bg-[#0c0a08]/95 backdrop-blur-md border-b border-orange-500/10 px-4 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button
            onClick={() => {
              if (groupViewOpen) {
                navigate("/join-community");
              } else {
                navigate("/community");
              }
            }}
            className="w-10 h-10 rounded-full border border-orange-500/20 bg-orange-50/40 dark:bg-stone-900/40 hover:bg-orange-100/50 dark:hover:bg-stone-850 flex items-center justify-center text-orange-600 dark:text-orange-400 active:scale-95 transition-all shrink-0"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <span className="font-display text-xl font-bold tracking-tight text-orange-950 dark:text-amber-50">
            {groupViewOpen ? selectedGroup?.name : (isHi ? "डिजिटल सत्संग" : "Digital Satsang")}
          </span>
        </div>

        {communityApi.isFallbackActive() && (
          <Badge variant="outline" className="text-[10px] text-amber-600 dark:text-amber-400 border-amber-500/30 flex items-center gap-1">
            <AlertCircle className="w-3 h-3 text-amber-500" />
            Local Sandbox Mode
          </Badge>
        )}
      </header>

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
              className="mt-4 bg-orange-500 hover:bg-orange-600 text-white font-bold rounded-xl"
            >
              {isHi ? "लॉग इन करें" : "Log In to Participate"}
            </Button>
          </div>
        </div>
      )}

      {user && !groupViewOpen && (
        <div className="max-w-7xl mx-auto px-4 mt-6">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            
            {/* ─── 1. LEFT SIDEBAR: MY GROUPS (Desktop Only) ────────────── */}
            <div className="hidden lg:block lg:col-span-3 space-y-4 sticky top-24">
              <div className="bg-white dark:bg-stone-900 border border-orange-500/10 rounded-2xl p-5 shadow-xs space-y-4">
                <div className="flex items-center gap-2 pb-2 border-b border-orange-500/10">
                  <Users className="w-4.5 h-4.5 text-orange-500" />
                  <h3 className="font-display font-extrabold text-[11px] text-orange-950 dark:text-amber-100 uppercase tracking-wider">
                    {isHi ? "मेरे समूह" : "My Communities"}
                  </h3>
                </div>

                <div className="space-y-3 max-h-[350px] overflow-y-auto pr-1">
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
            </div>

            {/* ─── 2. MIDDLE COLUMN (MAIN CONTENT) ────────────────────── */}
            <div className={`col-span-12 ${activeTab === 'feed' ? 'lg:col-span-6' : 'lg:col-span-9'} space-y-6`}>
              
              {/* ─── TAB SWITCHER ──────────────────────────────────────── */}
              <div className="flex border-b border-orange-500/10 mb-6 gap-2 overflow-x-auto scrollbar-none">
                {[
                  { id: 'feed', label: isHi ? 'सत्संग फीड' : 'Satsang Feed', icon: MessageSquare },
                  { id: 'groups', label: isHi ? 'समूह' : 'Communities', icon: Users },
                  { id: 'events', label: isHi ? 'धार्मिक कार्यक्रम' : 'Satsang Events', icon: Calendar }
                ].map(tab => {
                  const Icon = tab.icon;
                  const isActive = activeTab === tab.id;
                  return (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id as any)}
                      className={`relative pb-3 px-4 font-bold text-sm transition-all flex items-center gap-2 whitespace-nowrap ${
                        isActive ? "text-orange-600 dark:text-orange-400" : "text-stone-500 dark:text-stone-400 hover:text-stone-800"
                      }`}
                    >
                      <Icon className="w-4 h-4" />
                      {tab.label}
                      {isActive && (
                        <motion.div 
                          layoutId="community-tab-line"
                          className="absolute bottom-0 left-0 right-0 h-0.5 bg-orange-500"
                        />
                      )}
                    </button>
                  );
                })}
              </div>

              {/* ─── TAB 1: FEED VIEW ──────────────────────────────────── */}
              {activeTab === 'feed' && (
                <div className="space-y-6">
                  
                  {/* Digital Satsang Premium Banner */}
                  <div className="relative rounded-3xl overflow-hidden bg-gradient-to-r from-[#1a0e07] via-[#2d1508] to-[#1a0e07] border border-orange-500/20 p-6 md:p-8 flex items-center justify-between shadow-2xl min-h-[140px] select-none text-left">
                    {/* warm ambient glows */}
                    <div className="absolute top-1/2 left-1/4 -translate-y-1/2 w-72 h-72 bg-orange-600/8 rounded-full blur-3xl pointer-events-none" />
                    <div className="absolute bottom-0 right-1/4 w-48 h-48 bg-amber-500/6 rounded-full blur-2xl pointer-events-none" />
                    
                    <div className="relative z-10 space-y-2 max-w-md md:max-w-lg">
                      <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-amber-500/70">🪷 {isHi ? "सत्संग में आपका स्वागत है" : "Welcome to Satsang"}</p>
                      <h2 className="font-display font-extrabold text-2xl md:text-3xl text-amber-50 tracking-tight">
                        {isHi ? "डिजिटल सत्संग" : "Digital Satsang"}
                      </h2>
                      <p className="text-xs md:text-sm text-amber-200/60 font-medium tracking-wide leading-relaxed">
                        {isHi 
                          ? "भजन साझा करें • भक्तों से जुड़ें • भक्ति को आगे बढ़ाएं" 
                          : "Share Bhajans • Connect with Devotees • Advance Devotion"}
                      </p>
                      <div className="flex items-center gap-2 pt-1">
                        <span className="w-16 h-px bg-gradient-to-r from-transparent to-amber-500/40" />
                        <span className="text-amber-500/50 text-[10px]">✦</span>
                        <span className="w-16 h-px bg-gradient-to-l from-transparent to-amber-500/40" />
                      </div>
                    </div>

                    <div className="relative flex items-center justify-center shrink-0 pr-2">
                      <div className="absolute w-28 h-28 bg-amber-500/15 rounded-full blur-2xl animate-pulse" />
                      <div className="relative z-10 flex flex-col items-center gap-1">
                        <span className="text-4xl md:text-5xl font-extrabold text-transparent bg-clip-text bg-gradient-to-b from-amber-200 via-amber-400 to-orange-500 drop-shadow-[0_4px_16px_rgba(245,158,11,0.6)] select-none">
                          ॐ
                        </span>
                        <span className="text-xl md:text-2xl mt-0.5 filter drop-shadow-[0_2px_8px_rgba(244,63,94,0.4)] select-none">🪷</span>
                      </div>
                    </div>
                  </div>

                  {/* Desktop Post Composer (Hidden on mobile) */}
                  <div className="hidden lg:block bg-white dark:bg-stone-900 border border-orange-500/10 rounded-2xl p-5 shadow-xs space-y-4">
                    <p className="font-bold text-xs text-orange-950 dark:text-amber-100 text-left">
                      {isHi ? "कुछ अच्छा साझा करें..." : "Share something devotional..."}
                    </p>
                    
                    <div className="grid grid-cols-4 gap-3">
                      {[
                        { id: 'bhajan_share', label: isHi ? 'भजन साझा करें' : 'Share Bhajan', desc: isHi ? 'अपना प्रिय भजन साझा करें' : 'Share your favorite bhajan', icon: '🎵', color: 'text-orange-500 bg-orange-50 dark:bg-orange-950/20 border-orange-500/15' },
                        { id: 'bhajan_request', label: isHi ? 'भजन अनुरोध' : 'Request Bhajan', desc: isHi ? 'जो भजन नहीं मिल रहा हो' : 'If lyrics/audio missing', icon: '📿', color: 'text-purple-500 bg-purple-50 dark:bg-purple-950/20 border-purple-500/15' },
                        { id: 'thought', label: isHi ? 'भक्ति विचार' : 'Devotional Thought', desc: isHi ? 'अपने विचार साझा करें' : 'Share your thoughts', icon: '🌿', color: 'text-emerald-500 bg-emerald-50 dark:bg-emerald-950/20 border-emerald-500/15' },
                        { id: 'event', label: isHi ? 'कार्यक्रम बनाएं' : 'Create Event', desc: isHi ? 'सत्संग या कार्यक्रम जोड़ें' : 'Add satsang or kirtan', icon: '📅', color: 'text-rose-500 bg-rose-50 dark:bg-rose-950/20 border-rose-500/15' }
                      ].map(item => (
                        <button
                          key={item.id}
                          onClick={() => {
                            setPostType(item.id as any);
                            setCreatePostOpen(true);
                          }}
                          className={`p-3.5 rounded-xl border flex flex-col items-center justify-center text-center gap-1.5 hover:scale-[1.02] active:scale-95 transition-all group ${item.color}`}
                        >
                          <span className="text-2xl filter drop-shadow-sm group-hover:scale-110 transition-transform">{item.icon}</span>
                          <span className="font-extrabold text-[10px] uppercase tracking-tight">{item.label}</span>
                          <span className="text-[8.5px] text-stone-400 dark:text-stone-500 line-clamp-1 font-medium">{item.desc}</span>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Mobile Post Composer (Hidden on desktop) */}
                  <div className="lg:hidden bg-orange-50/40 dark:bg-stone-900/60 border border-orange-500/10 rounded-3xl p-5 shadow-xs space-y-4">
                    <div className="flex items-center justify-between gap-3 text-left">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-orange-100 dark:bg-orange-950/40 border border-orange-200 dark:border-orange-950 flex items-center justify-center text-orange-600 font-extrabold text-sm shrink-0 overflow-hidden">
                          {user.photoURL ? (
                            <img src={user.photoURL} alt="user avatar" className="w-full h-full object-cover" />
                          ) : (
                            user.displayName?.slice(0, 2).toUpperCase() || "DV"
                          )}
                        </div>
                        <span className="text-stone-600 dark:text-stone-300 font-bold text-xs">
                          {isHi ? "आज आप क्या साझा करना चाहेंगे?" : "What would you like to share today?"}
                        </span>
                      </div>
                      
                      <Button 
                        size="icon" 
                        onClick={() => setCreatePostOpen(true)}
                        className="bg-orange-500 hover:bg-orange-600 text-white rounded-full w-9 h-9 shadow-md active:scale-95 shrink-0"
                      >
                        <Plus className="w-5 h-5 text-white" />
                      </Button>
                    </div>

                    <div className="grid grid-cols-4 gap-2.5 pt-1">
                      {[
                        { id: 'bhajan_share', label: isHi ? 'भजन साझा करें' : 'Bhajan', icon: '🎵' },
                        { id: 'bhajan_request', label: isHi ? 'भजन अनुरोध' : 'Request', icon: '📿' },
                        { id: 'thought', label: isHi ? 'विचार साझा करें' : 'Thought', icon: '🌿' },
                        { id: 'event', label: isHi ? 'कार्यक्रम बनाएं' : 'Event', icon: '📅' }
                      ].map(item => (
                        <button
                          key={item.id}
                          onClick={() => {
                            setPostType(item.id as any);
                            setCreatePostOpen(true);
                          }}
                          className="bg-white dark:bg-stone-900 border border-orange-500/10 hover:bg-orange-50/50 p-2.5 rounded-2xl flex flex-col items-center justify-center gap-1.5 transition-all text-center"
                        >
                          <span className="text-xl leading-none">{item.icon}</span>
                          <span className="font-extrabold text-[8.5px] uppercase tracking-tight text-stone-700 dark:text-stone-300 whitespace-nowrap">{item.label}</span>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Mobile Bhajan Request Board Banner (Hidden on desktop) */}
                  <div className={`lg:hidden border rounded-3xl p-5 shadow-lg flex items-center justify-between gap-4 text-left relative overflow-hidden select-none ${
                    isDark ? 'bg-[#16120e] border-orange-500/20' : 'bg-[#FAF6EE] border-orange-500/15 shadow-orange-950/5'
                  }`}>
                    <div className="absolute right-0 top-0 w-24 h-24 bg-purple-500/10 rounded-full blur-2xl pointer-events-none" />
                    
                    <div className="flex items-start gap-3.5 relative z-10">
                      <span className="text-3xl mt-0.5 filter drop-shadow-[0_2px_8px_rgba(168,85,247,0.3)]">📿</span>
                      <div className="space-y-1">
                        <div className="flex items-center gap-1">
                          <h4 className={`font-display font-extrabold text-sm ${
                            isDark ? 'text-amber-100' : 'text-stone-850'
                          }`}>
                            {isHi ? "भजन अनुरोध बोर्ड" : "Bhajan Request Board"}
                          </h4>
                          <span className="text-[10px] text-stone-400">❓</span>
                        </div>
                        <p className={`text-[10px] leading-relaxed max-w-[190px] font-medium ${
                          isDark ? 'text-stone-300' : 'text-stone-600'
                        }`}>
                          {isHi ? "क्या आपको कोई भजन नहीं मिल रहा? यहाँ अनुरोध करें और भक्तों से सहायता लें।" : "Can't find a bhajan? Request it here and get lyrics from other devotees."}
                        </p>
                        {posts.filter(p => p.type === 'bhajan_request').length > 0 && (
                          <p className="text-[9px] text-purple-500 font-bold flex items-center gap-1 pt-1">
                            ✦ {posts.filter(p => p.type === 'bhajan_request').length} {isHi ? "सक्रिय अनुरोध" : "active requests"}
                          </p>
                        )}
                      </div>
                    </div>

                    <button
                      onClick={() => {
                        setPostType('bhajan_request');
                        setCreatePostOpen(true);
                      }}
                      className="bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold py-2.5 px-3.5 rounded-2xl flex items-center gap-1 shrink-0 shadow-md shadow-purple-950/20 active:scale-95 transition-all"
                    >
                      <span>{isHi ? "अनुरोध करें" : "Request"}</span>
                      <ChevronRight className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  {/* Feed Filters */}
                  <div className="flex items-center gap-1.5 overflow-x-auto pb-2 scrollbar-none">
                    {["All", "Bhajan Share", "Bhajan Request", "Question", "Thought", "Event"].map(filter => {
                      const isSelected = feedFilter === filter;
                      return (
                        <button
                          key={filter}
                          onClick={() => setFeedFilter(filter)}
                          className={`px-3.5 py-1.5 rounded-full text-xs font-bold transition-all border shrink-0 ${
                            isSelected 
                              ? "bg-orange-500 text-white border-orange-600"
                              : "bg-white dark:bg-stone-900 text-stone-600 dark:text-stone-400 border-orange-500/10 hover:bg-orange-500/5"
                          }`}
                        >
                          {filter === "All" ? (isHi ? "सभी पोस्ट" : "All") : filter}
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
                    <div className="text-center py-16 bg-white dark:bg-stone-900 border border-orange-500/10 rounded-2xl">
                      <span className="text-4xl block">🌸</span>
                      <p className="text-stone-500 dark:text-stone-400 font-medium text-sm mt-3">
                        {isHi ? "कोई भक्तिमय पोस्ट नहीं मिली। पहली पोस्ट करें!" : "No devotional posts found. Start the satsang!"}
                      </p>
                    </div>
                  )}

                  {/* Posts Lists */}
                  {!loadingPosts && filteredPosts.length > 0 && (
                    <div className="space-y-4">
                      {filteredPosts.map(post => (
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
                            if (confirm(isHi ? "क्या आप इस पोस्ट को हटाना चाहते हैं?" : "Delete this post?")) {
                              await communityApi.softRemovePost(id);
                              loadPosts();
                            }
                          }}
                        />
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* ─── TAB 2: GROUPS LIST VIEW ───────────────────────────── */}
              {activeTab === 'groups' && (
                <div className="space-y-6">
                  {/* Discover Toolbar */}
                  <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
                    <div className="relative flex-1">
                      <Search className="absolute left-3.5 top-3 w-4.5 h-4.5 text-stone-400" />
                      <Input 
                        type="text"
                        placeholder={isHi ? "समूह नाम या विवरण खोजें..." : "Search groups..."}
                        value={groupSearch}
                        onChange={(e) => setGroupSearch(e.target.value)}
                        className="pl-10 border-orange-500/15 bg-white dark:bg-stone-900 rounded-xl"
                      />
                    </div>
                    <button
                      onClick={() => setCreateGroupOpen(true)}
                      className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl font-bold text-xs text-white shadow-md shadow-red-950/15 hover:shadow-lg hover:shadow-red-950/25 hover:scale-[1.01] active:scale-95 transition-all shrink-0"
                      style={{
                        background: "linear-gradient(135deg, #8B1E23 0%, #651317 100%)"
                      }}
                    >
                      <Plus className="w-4 h-4 text-white" />
                      {isHi ? "समूह बनाएं" : "Create Group"}
                    </button>
                  </div>

                  {/* Subtabs for Groups */}
                  <div className="flex border-b border-orange-500/10 pb-1.5 mb-4">
                    <span className="text-xs font-bold text-stone-500 dark:text-stone-400">
                      {debouncedGroupSearch ? "Search Results" : (isHi ? "सभी भक्ति समूह" : "Devotional Communities")}
                    </span>
                  </div>

                  {loadingGroups && (
                    <div className="flex items-center justify-center py-12">
                      <Loader2 className="w-8 h-8 animate-spin text-orange-500" />
                    </div>
                  )}

                  {/* Empty search */}
                  {!loadingGroups && filteredGroups.length === 0 && (
                    <div className="text-center py-16 bg-white dark:bg-stone-900 border border-dashed border-orange-500/20 rounded-2xl">
                      <span className="text-4xl block">👥</span>
                      <p className="text-stone-500 dark:text-stone-400 font-medium text-sm mt-3">
                        {isHi ? "कोई समूह नहीं मिला।" : "No groups found."}
                      </p>
                      <p className="text-xs text-stone-400 mt-1">
                        {isHi ? "अपना नया भक्ति समूह बनाने वाले पहले व्यक्ति बनें!" : "Be the first to create one!"}
                      </p>
                      <Button 
                        onClick={() => setCreateGroupOpen(true)}
                        variant="outline" 
                        className="mt-4 border-orange-500/25 text-orange-600 dark:text-orange-400 rounded-xl"
                      >
                        {isHi ? "पहला समूह बनाएं" : "Create Group"}
                      </Button>
                    </div>
                  )}

                  {/* Groups Grid */}
                  {!loadingGroups && filteredGroups.length > 0 && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5 w-full">
                      {filteredGroups.map(group => {
                        const deityFound = DEITIES.find(d => d.id === group.deity);
                        return (
                          <div 
                            key={group.id}
                            className="overflow-hidden rounded-2xl bg-white dark:bg-stone-900 border border-orange-500/10 shadow-xs hover:shadow-md transition-all flex flex-col justify-between relative group"
                          >
                            {/* Header banner image representing deity */}
                            <div className="h-36 w-full relative overflow-hidden bg-amber-50 dark:bg-stone-950 flex items-center justify-center">
                              {(() => {
                                const hasValidGroupImg = group.image_url && 
                                  group.image_url.trim() !== "" && 
                                  group.image_url !== "null" && 
                                  group.image_url !== "undefined" && 
                                  (group.image_url.startsWith("http") || group.image_url.startsWith("/") || group.image_url.startsWith("data:"));
                                const cardCoverSrc = hasValidGroupImg ? group.image_url! : resolveCover(group.deity);
                                return (
                                 <img
                                    src={cardCoverSrc}
                                    alt={group.name}
                                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                                    loading="lazy"
                                  />
                                );
                              })()}
                              <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-black/20" />
                              
                              {/* Public/Private badge */}
                              <span className={`absolute top-3 left-3 text-[9px] font-bold px-2.5 py-1 rounded-full text-white/90 flex items-center gap-1.5 backdrop-blur-md border border-white/10 ${
                                group.is_public ? "bg-emerald-600/70" : "bg-rose-700/70"
                              }`}>
                                {group.is_public ? (
                                  <>
                                    <Globe className="w-2.5 h-2.5" />
                                    {isHi ? "सार्वजनिक" : "Public"}
                                  </>
                                ) : (
                                  <>
                                    <Lock className="w-2.5 h-2.5" />
                                    {isHi ? "निजी" : "Private"}
                                  </>
                                )}
                              </span>
                            </div>

                            <div className="p-5 flex-1 flex flex-col justify-between relative overflow-hidden">
                              {/* Background beige mandala decoration */}
                              <div className="absolute right-0 bottom-0 translate-x-6 translate-y-6 opacity-[0.05] dark:opacity-[0.02] pointer-events-none w-24 h-24">
                                <img src={mandalaBeige} className="w-full h-full object-contain" alt="" />
                              </div>
                              <div>
                                {/* Deity Tag */}
                                {(() => {
                                  const getDeityDisplayName = (deityId: string | null) => {
                                    if (!deityId) return "";
                                    const mappings: Record<string, { en: string, hi: string }> = {
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
                                    <span className="inline-block text-[9px] font-bold px-2 py-0.5 rounded-md bg-orange-100/70 dark:bg-stone-850 text-orange-700 dark:text-orange-400 mb-2 uppercase tracking-wide">
                                      {dName}
                                    </span>
                                  ) : null;
                                })()}

                                <h3 className="font-display text-lg font-bold text-orange-950 dark:text-amber-100 leading-snug">
                                  {group.name}
                                </h3>
                                {(group.member_count || 0) >= 5 ? (
                                  <p className="text-xs text-stone-500 mt-0.5">
                                    {group.member_count} {isHi ? "भक्त जुड़े हैं" : "Members"}
                                  </p>
                                ) : (
                                  <p className="text-xs text-stone-400 italic mt-0.5">
                                    {isHi ? "नया समूह — आज ही जुड़ें!" : "New group — join today!"}
                                  </p>
                                )}
                                <p className="text-xs text-stone-600 dark:text-stone-300 mt-2 line-clamp-2 leading-relaxed">
                                  {group.description || (isHi ? "भक्तिमय संगीत और नाम जप साझा करने का स्थान।" : "A space for sharing devotional music and thoughts.")}
                                </p>

                                {/* Goal Target Progress Bar */}
                                {group.target_count && group.target_count > 0 && (
                                  <div className="mt-3.5 bg-amber-500/5 p-3 rounded-xl border border-amber-500/10">
                                    <div className="flex items-center justify-between text-[10px] font-semibold text-stone-500 dark:text-stone-400 mb-1.5">
                                      <span>{isHi ? "सामूहिक लक्ष्य प्रगति" : "Goal Progress"}</span>
                                      <span className="font-bold text-amber-600 dark:text-amber-400">
                                        {group.completion_percent}% ({group.total_chants && group.total_chants >= 100000 
                                          ? `${(group.total_chants / 100000).toFixed(1)}L` 
                                          : (group.total_chants || 0).toLocaleString()} / {group.target_count >= 100000 
                                          ? `${(group.target_count / 100000).toFixed(1)}L` 
                                          : group.target_count.toLocaleString()})
                                      </span>
                                    </div>
                                    <div className="w-full h-1.5 rounded-full bg-amber-500/10 overflow-hidden">
                                      <div 
                                        className="h-full rounded-full bg-gradient-to-r from-orange-500 to-amber-500 transition-all duration-500" 
                                        style={{ width: `${group.completion_percent}%` }}
                                      />
                                    </div>
                                  </div>
                                )}
                              </div>
                            </div>

                            <div className="flex gap-2.5 mt-5 border-t border-orange-500/5 pt-3.5">
                              {group.is_member ? (
                                <>
                                  <Button
                                    onClick={() => handleOpenGroupDetails(group)}
                                    className="flex-1 text-xs font-bold bg-orange-500 hover:bg-orange-600 text-white rounded-xl h-9 shadow-sm shadow-orange-500/15"
                                  >
                                    {isHi ? "समूह देखें" : "View Group"}
                                  </Button>
                                  <Button
                                    variant="outline"
                                    onClick={() => handleToggleGroupJoin(group)}
                                    className="flex-1 text-xs font-bold border border-stone-250 dark:border-stone-800 text-stone-500 dark:text-stone-400 bg-stone-50/50 dark:bg-stone-900/50 rounded-xl h-9 flex items-center justify-center gap-1 hover:bg-rose-50 dark:hover:bg-rose-950/20 hover:text-rose-600 hover:border-rose-500/20"
                                  >
                                    <Check className="w-3.5 h-3.5 text-orange-600" />
                                    {isHi ? "शामिल हैं" : "Joined"}
                                  </Button>
                                </>
                              ) : (
                                <>
                                  <Button
                                    variant="outline"
                                    onClick={() => handleOpenGroupDetails(group)}
                                    className="flex-1 text-xs font-bold border border-orange-500/20 text-orange-600 dark:text-orange-400 hover:bg-orange-500/5 rounded-xl h-9"
                                  >
                                    {isHi ? "विवरण देखें" : "Details"}
                                  </Button>
                                  <Button
                                    onClick={() => handleToggleGroupJoin(group)}
                                    className="flex-1 text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl h-9 shadow-sm shadow-emerald-500/20 flex items-center justify-center gap-1.5 transition-all active:scale-95"
                                  >
                                    <Plus className="w-3.5 h-3.5" />
                                    {isHi ? "शामिल हों" : "Join"}
                                  </Button>
                                </>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              )}

              {/* ─── TAB 3: EVENTS VIEW ────────────────────────────────── */}
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
                      className="bg-orange-500 hover:bg-orange-600 text-white text-xs font-bold rounded-xl"
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
                        className="mt-4 bg-orange-500 hover:bg-orange-600 text-white rounded-xl text-xs font-bold"
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
                            if (confirm(isHi ? "क्या आप इस कार्यक्रम पोस्ट को हटाना चाहते हैं?" : "Delete this event post?")) {
                              await communityApi.softRemovePost(id);
                              loadPosts();
                            }
                          }}
                        />
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* ─── 3. RIGHT SIDEBAR: COMMUNITY WIDGETS (Feed tab only, desktop only) ─── */}
            {activeTab === 'feed' && (
              <div className="hidden lg:block lg:col-span-3 space-y-6 sticky top-24">
                
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
                          <div className="flex items-center justify-between pt-1 border-t border-stone-100 dark:border-stone-900/60 mt-1">
                            <div className="flex -space-x-1.5 overflow-hidden select-none">
                              {[1, 2, 3].map((num) => (
                                <div key={num} className="inline-block h-4 w-4 rounded-full ring-1 ring-white dark:ring-stone-950 bg-stone-200 dark:bg-stone-850 flex items-center justify-center text-[7px] font-bold">
                                  {num}
                                </div>
                              ))}
                              <span className="text-[8px] text-stone-400 dark:text-stone-500 pl-2 font-bold mt-0.5">+12</span>
                            </div>
                            
                            <button
                              onClick={() => onToggleComments(req.id)}
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
                              
                              <div className="flex items-center justify-between pt-1 mt-1.5 border-t border-stone-100 dark:border-stone-900/60">
                                <div className="flex -space-x-1 overflow-hidden select-none">
                                  {[1, 2, 3].map((num) => (
                                    <div key={num} className="inline-block h-3.5 w-3.5 rounded-full ring-1 ring-white dark:ring-stone-950 bg-stone-200 dark:bg-stone-850 flex items-center justify-center text-[6px] font-bold">
                                      {num}
                                    </div>
                                  ))}
                                  <span className="text-[8px] text-stone-400 dark:text-stone-500 pl-1.5 font-bold mt-0.5">+18</span>
                                </div>
                                
                                <button
                                  onClick={() => onToggleRsvp(evt.id)}
                                  className="bg-rose-500 hover:bg-rose-600 text-white text-[9.5px] font-extrabold py-1 px-2.5 rounded-lg active:scale-95 transition-all shadow-sm"
                                >
                                  {isHi ? "रुचि दिखाएं" : "Join"}
                                </button>
                              </div>
                            </div>
                          </div>
                        );
                      })
                    )}
                  </div>
                </div>

                {/* Widget C: Active Groups recommendation list */}
                <div className="bg-white dark:bg-stone-900 border border-orange-500/10 rounded-2xl p-5 shadow-xs space-y-4">
                  <div className="flex items-center justify-between pb-2 border-b border-orange-500/10">
                    <h3 className="font-display font-extrabold text-[11px] text-orange-950 dark:text-amber-100 uppercase tracking-wider flex items-center gap-1">
                      👥 {isHi ? "सक्रिय समूह" : "Active Communities"}
                    </h3>
                    <button 
                      onClick={() => setActiveTab('groups')}
                      className="text-[10px] font-bold text-orange-500 hover:underline"
                    >
                      {isHi ? "सभी देखें" : "See All"}
                    </button>
                  </div>

                  <div className="space-y-3">
                    {groups.filter(g => !g.is_member).slice(0, 2).length === 0 ? (
                      <p className="text-[11px] text-stone-400 py-3 text-center font-medium">
                        {isHi ? "सभी समूह आपने जॉइन किए हैं।" : "You've joined all groups."}
                      </p>
                    ) : (
                      groups.filter(g => !g.is_member).slice(0, 2).map(group => {
                        const deityFound = DEITIES.find(d => d.id === group.deity);
                        return (
                          <div 
                            key={group.id} 
                            className="flex items-center justify-between p-2.5 bg-stone-50 dark:bg-stone-950 border border-orange-500/5 rounded-xl text-left group"
                          >
                            <div className="flex items-center gap-2.5 min-w-0">
                              <div className="w-8 h-8 rounded-full overflow-hidden border border-orange-500/10 shrink-0">
                                <img 
                                  src={deityFound ? deityFound.src : "/placeholder-deity.jpg"} 
                                  alt={group.name} 
                                  className="w-full h-full object-cover" 
                                />
                              </div>
                              <div className="min-w-0">
                                <p className="font-bold text-[11px] text-orange-950 dark:text-amber-100 truncate">
                                  {group.name}
                                </p>
                                <p className="text-[9px] text-emerald-600 dark:text-emerald-450 font-bold mt-0.5 flex items-center gap-0.5">
                                  ● {isHi ? "24 सक्रिय सदस्य" : "24 Active Devotees"}
                                </p>
                              </div>
                            </div>
                            
                            <button
                              onClick={() => handleOpenGroupDetails(group)}
                              className="text-stone-400 hover:text-orange-500 p-1 shrink-0"
                            >
                              <ChevronRight className="w-4 h-4" />
                            </button>
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

          {/* ─── Om FAB Floating Action Button ─── */}
          <button
            onClick={() => setCreatePostOpen(true)}
            className="fixed bottom-6 right-6 w-14 h-14 rounded-full bg-gradient-to-r from-amber-500 to-orange-600 text-white flex items-center justify-center shadow-xl hover:scale-105 active:scale-95 hover:shadow-orange-500/20 transition-all z-40 border border-amber-400/20"
          >
            <span className="text-2xl font-bold select-none drop-shadow-md">ॐ</span>
          </button>
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
        />
      )}
      
      {/* ─── MODAL: LOG CHANTS TO GROUP ─────────────────────────── */}
      <Dialog open={logChantsOpen} onOpenChange={setLogChantsOpen}>
        <DialogContent className="max-w-md bg-[#FAF6EE] dark:bg-[#0f0d0a] border-amber-500/20 text-stone-950 dark:text-stone-50 rounded-3xl p-6 shadow-2xl">
          <DialogHeader className="font-sans">
            <DialogTitle className="font-display font-extrabold text-lg text-orange-950 dark:text-amber-100 text-center flex items-center justify-center gap-1.5">
              📿 {isHi ? "नाम जप समर्पण" : "Log Chants to Yajna"}
            </DialogTitle>
            <DialogDescription className="text-center text-xs text-stone-500 mt-1">
              {isHi 
                ? `${selectedGroup?.name} के सामूहिक जप यज्ञ में अपना जप समर्पण करें`
                : `Contribute your chanting rounds to ${selectedGroup?.name}'s collective target`}
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleLogGroupChants} className="space-y-5 mt-4 font-sans">
            
            {/* Display group's deity mantra details */}
            {(() => {
              const groupDeity = selectedGroup?.deity?.toLowerCase();
              const matchingMantra = mantras?.find(m => m.deity?.toLowerCase() === groupDeity) || mantras?.[0];
              return (
                <div className="bg-amber-500/5 border border-amber-500/15 rounded-2xl p-4 text-center">
                  <span className="text-[10px] uppercase font-black tracking-wider text-amber-600 block">{isHi ? "समर्पित मंत्र" : "Target Mantra"}</span>
                  <span className="text-base font-extrabold text-orange-950 dark:text-amber-100 block mt-1">
                    {isHi ? matchingMantra?.name_hindi : matchingMantra?.name_english}
                  </span>
                  {matchingMantra?.full_text_hindi && (
                    <p className="text-xs text-stone-500 dark:text-stone-400 italic mt-1.5 leading-relaxed font-hindi">
                      "{matchingMantra.full_text_hindi}"
                    </p>
                  )}
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
      <Dialog open={createPostOpen} onOpenChange={setCreatePostOpen}>
        <DialogContent className="max-w-md bg-[#FAF6EE] dark:bg-[#0f0d0a] border-orange-500/20 text-stone-950 dark:text-stone-50 rounded-3xl p-6 max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="font-display font-extrabold text-lg text-orange-950 dark:text-amber-100 text-center">
              {isHi ? "भक्तिमय पोस्ट बनाएं" : "Create Devotional Post"}
            </DialogTitle>
            <DialogDescription className="text-center text-xs text-stone-500 mt-1">
              Select post type and fill the devotional details below.
            </DialogDescription>
          </DialogHeader>

          {/* Post Type Selector Grid */}
          <div className="grid grid-cols-3 sm:grid-cols-5 gap-2 my-4">
            {[
              { id: 'thought', label: isHi ? 'विचार' : 'Thought', icon: '🌿' },
              { id: 'bhajan_share', label: isHi ? 'भजन शेयर' : 'Share', icon: '🎵' },
              { id: 'bhajan_request', label: isHi ? 'अनुरोध' : 'Request', icon: '📿' },
              { id: 'question', label: isHi ? 'प्रश्न' : 'Question', icon: '❓' },
              { id: 'event', label: isHi ? 'कार्यक्रम' : 'Event', icon: '📅' }
            ].map(type => (
              <button
                key={type.id}
                type="button"
                onClick={() => setPostType(type.id as any)}
                className={`p-2.5 rounded-xl border flex flex-col items-center justify-center gap-1.5 transition-all ${
                  postType === type.id 
                    ? "bg-orange-500 border-orange-600 text-white scale-[1.02] shadow-xs" 
                    : "bg-white dark:bg-stone-900 border-orange-500/10 text-stone-700 dark:text-stone-300 hover:bg-orange-50"
                }`}
              >
                <span className="text-lg leading-none">{type.icon}</span>
                <span className="text-[9px] font-extrabold tracking-tight uppercase whitespace-nowrap">{type.label}</span>
              </button>
            ))}
          </div>

          <form onSubmit={handleCreatePost} className="space-y-4">
            {/* Title (for Bhajan Share, Request, Event) */}
            {postType !== 'thought' && (
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-stone-600 dark:text-stone-300">
                  {postType === 'bhajan_share' && (isHi ? "भजन शीर्षक" : "Bhajan Title")}
                  {postType === 'bhajan_request' && (isHi ? "अनुरोधित भजन का नाम" : "Requested Bhajan Title")}
                  {postType === 'question' && (isHi ? "प्रश्न का विषय (संक्षिप्त)" : "Question / Topic")}
                  {postType === 'event' && (isHi ? "सत्संग / कार्यक्रम का नाम" : "Event Title")}
                </label>
                <Input 
                  type="text"
                  placeholder={postType === 'bhajan_request' ? "e.g., Kunj Bihari Aarti" : "e.g., Ram Ji Ka Satsang"}
                  value={postTitle}
                  onChange={(e) => setPostTitle(e.target.value)}
                  required
                  className="border-orange-500/20 bg-white dark:bg-stone-950/40 rounded-xl font-bold"
                />
              </div>
            )}

            {/* Content Textarea */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-stone-600 dark:text-stone-300">
                {postType === 'thought' && (isHi ? "अपने विचार लिखें" : "Write your devotional thought")}
                {postType === 'bhajan_share' && (isHi ? "भजन की पंक्तियाँ या वर्णन" : "Lyrics excerpt or description")}
                {postType === 'bhajan_request' && (isHi ? "विवरण (भजन के बोल, राग या कोई संकेत)" : "Provide hints, singer name, or details")}
                {postType === 'question' && (isHi ? "अपना प्रश्न यहाँ पूछें" : "Write your question here")}
                {postType === 'event' && (isHi ? "कार्यक्रम विवरण" : "Event Description")}
              </label>
              <textarea
                rows={4}
                value={postContent}
                onChange={(e) => setPostContent(e.target.value)}
                required
                className="w-full text-sm rounded-xl border border-orange-500/20 bg-white dark:bg-stone-950/40 p-3 focus:border-orange-500 focus:outline-none placeholder:text-stone-400"
                placeholder={postType === 'thought' ? "भक्ति के बारे में कुछ लिखें..." : "विवरण दर्ज करें..."}
              />
            </div>

            {/* Custom Image Upload (Cloudinary) */}
            {(postType === 'bhajan_share' || postType === 'event') && (
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-stone-600 dark:text-stone-300 block">
                  {postType === 'event' ? "Event Poster Image" : "Add Image (Optional)"}
                </label>
                <div className="flex items-center gap-3">
                  <Input 
                    type="file" 
                    accept="image/*"
                    onChange={handleImageChange}
                    className="hidden" 
                    id="post-image-file" 
                  />
                  <label 
                    htmlFor="post-image-file"
                    className="px-4 py-2 bg-white dark:bg-stone-900 border border-orange-500/25 hover:bg-orange-50 text-orange-600 dark:text-orange-400 font-bold text-xs rounded-xl shadow-xs cursor-pointer flex items-center gap-1 hover:scale-98 active:scale-95 transition-all shrink-0"
                  >
                    Upload Photo
                  </label>
                  {postImagePreview && (
                    <div className="w-10 h-10 rounded-lg overflow-hidden border border-orange-500/10 shrink-0">
                      <img src={postImagePreview} alt="Preview" className="w-full h-full object-cover" />
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Youtube URL (Bhajan Share only) */}
            {postType === 'bhajan_share' && (
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-stone-600 dark:text-stone-300">
                  YouTube Link (Optional)
                </label>
                <Input 
                  type="url"
                  placeholder="https://youtube.com/watch?v=..."
                  value={postYoutubeUrl}
                  onChange={(e) => setPostYoutubeUrl(e.target.value)}
                  className="border-orange-500/20 bg-white dark:bg-stone-950/40 rounded-xl"
                />
              </div>
            )}

            {/* Quick-tap choices for Questions */}
            {postType === 'question' && (
              <div className="space-y-2 bg-orange-500/5 p-3.5 rounded-2xl border border-orange-500/10">
                <span className="text-xs font-bold text-orange-950 dark:text-amber-100 block">
                  Quick-tap choices (optional)
                </span>
                <div className="space-y-1.5">
                  {pollOptions.map((opt, index) => (
                    <div key={index} className="flex gap-2">
                      <Input
                        type="text"
                        placeholder={`Option ${index + 1}`}
                        value={opt}
                        onChange={(e) => {
                          const updated = [...pollOptions];
                          updated[index] = e.target.value;
                          setPollOptions(updated);
                        }}
                        className="h-8.5 text-xs rounded-lg"
                      />
                      {pollOptions.length > 2 && (
                        <button
                          type="button"
                          onClick={() => setPollOptions(pollOptions.filter((_, idx) => idx !== index))}
                          className="text-rose-600 hover:text-rose-700 text-xs px-1"
                        >
                          Remove
                        </button>
                      )}
                    </div>
                  ))}
                  {pollOptions.length < 4 && (
                    <button
                      type="button"
                      onClick={() => setPollOptions([...pollOptions, ""])}
                      className="text-xs font-bold text-orange-600 dark:text-orange-400 hover:underline"
                    >
                      + Add Option
                    </button>
                  )}
                </div>
              </div>
            )}

            {/* Event Specific Parameters */}
            {postType === 'event' && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 bg-orange-500/5 p-4 rounded-2xl border border-orange-500/10">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-stone-600 dark:text-stone-300">Date</label>
                  <Input 
                    type="date"
                    value={eventDate}
                    onChange={(e) => setEventDate(e.target.value)}
                    required
                    className="border-orange-500/20 bg-white rounded-lg h-9 text-xs"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-stone-600 dark:text-stone-300">Time</label>
                  <Input 
                    type="time"
                    value={eventTime}
                    onChange={(e) => setEventTime(e.target.value)}
                    required
                    className="border-orange-500/20 bg-white rounded-lg h-9 text-xs"
                  />
                </div>
                <div className="space-y-1.5 sm:col-span-2">
                  <label className="text-xs font-bold text-stone-600 dark:text-stone-300">Location</label>
                  <Input 
                    type="text"
                    placeholder="e.g., Radha Krishna Temple, Kunj Gali"
                    value={postLocation}
                    onChange={(e) => setPostLocation(e.target.value)}
                    required
                    className="border-orange-500/20 bg-white rounded-lg h-9 text-xs"
                  />
                </div>
                
                {/* Linked library bhajan (optional) */}
                <div className="space-y-1.5 sm:col-span-2">
                  <label className="text-xs font-bold text-stone-600 dark:text-stone-300">
                    Attach library bhajan (Optional)
                  </label>
                  <select
                    value={eventLinkedBhajan || ""}
                    onChange={(e) => setEventLinkedBhajan(e.target.value ? Number(e.target.value) : null)}
                    className="w-full text-xs rounded-lg border border-orange-500/20 bg-white p-2.5"
                  >
                    <option value="">-- None --</option>
                    {myBhajans.map(b => (
                      <option key={b.id} value={b.id}>
                        {b.title} ({b.singer_name})
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            )}

            <div className="flex gap-3 pt-3">
              <Button
                type="button"
                variant="outline"
                onClick={() => setCreatePostOpen(false)}
                className="flex-1 rounded-xl border border-stone-200 dark:border-stone-700"
              >
                {isHi ? "रद्द करें" : "Cancel"}
              </Button>
              <Button
                type="submit"
                disabled={publishingPost}
                className="flex-1 bg-orange-500 hover:bg-orange-600 text-white font-bold rounded-xl"
              >
                {publishingPost ? (isHi ? "प्रकाशित हो रहा..." : "Publishing...") : (isHi ? "प्रकाशित करें" : "Publish")}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* ─── MODAL: CREATE GROUP ────────────────────────────────── */}
      <Dialog open={createGroupOpen} onOpenChange={(o) => {
        setCreateGroupOpen(o);
        if (!o) {
          setGroupName("");
          setGroupDesc("");
          setGroupDeity("rama");
        }
      }}>
        <DialogContent className="max-w-md bg-[#FAF6EE] dark:bg-[#120F0B] border-orange-500/20 text-stone-950 dark:text-stone-50 rounded-3xl p-6 max-h-[90vh] overflow-y-auto shadow-2xl shadow-orange-950/10">
          {/* Visually hidden — required by Radix for accessibility */}
          <DialogHeader className="sr-only">
            <DialogTitle>{isHi ? "समूह बनाएं" : "Create Community Group"}</DialogTitle>
            <DialogDescription>
              {isHi ? "समूह बनाएं और भक्तों को आमंत्रित करें।" : "Create a community group and invite devotees."}
            </DialogDescription>
          </DialogHeader>

          
          {/* Glowing Header with Lotus & Flourish Leaves */}
          <div className="relative flex flex-col items-center mb-6 pt-2">
            <div className="relative flex justify-center mb-3">
              <div className="w-16 h-16 rounded-full bg-white dark:bg-stone-900 border border-orange-200 dark:border-orange-950 flex items-center justify-center shadow-lg shadow-orange-500/10 relative z-10">
                <span className="text-3xl filter drop-shadow-[0_2px_8px_rgba(249,115,22,0.45)] select-none">🪷</span>
              </div>
              {/* Glow backdrop */}
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-28 h-28 bg-orange-200/40 dark:bg-orange-950/20 rounded-full blur-2xl -z-0" />
              {/* Decorative flourish leaves */}
              <div className="absolute top-2 left-[calc(50%-75px)] text-emerald-600/30 dark:text-emerald-500/20 text-2xl select-none pointer-events-none transform -rotate-12">🌿</div>
              <div className="absolute top-2 right-[calc(50%-75px)] text-emerald-600/30 dark:text-emerald-500/20 text-2xl select-none pointer-events-none transform rotate-12">🌿</div>
            </div>
            
            <h2 className="font-display font-extrabold text-xl md:text-2xl text-orange-950 dark:text-amber-100 text-center tracking-tight leading-tight">
              {isHi ? "समूह बनाएं" : "Create Community Group"}
            </h2>
            <p className="text-center text-xs text-stone-500 dark:text-stone-400 mt-1 flex items-center justify-center gap-1 font-medium">
              {isHi ? "श्रद्धापूर्वक स्थान बनाएं और साथ मिलकर आगे बढ़ें 🧡" : "Build a devotional space and grow together 🧡"}
            </p>
          </div>

          <form onSubmit={handleCreateGroup} className="space-y-5">
            {/* Group Name input */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-stone-600 dark:text-stone-300 block">
                {isHi ? "समूह का नाम" : "Group Name"}
              </label>
              <div className="relative">
                <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-orange-500">
                  <Users className="w-4 h-4" />
                </span>
                <input 
                  type="text"
                  required
                  maxLength={40}
                  placeholder={isHi ? "जैसे: श्री श्याम सत्संग मंडल" : "e.g., Shree Shyam Group"}
                  value={groupName}
                  onChange={(e) => setGroupName(e.target.value)}
                  className={`w-full rounded-xl border bg-white dark:bg-stone-900/60 pl-10 pr-10 py-3 text-sm focus:outline-none transition-all ${
                    isNameUnique === true
                      ? "border-emerald-500 ring-2 ring-emerald-500/10 focus:ring-emerald-500/20"
                      : isNameUnique === false
                      ? "border-rose-500 ring-2 ring-rose-500/10 focus:ring-rose-500/20"
                      : "border-orange-500/20 focus:border-orange-400 focus:ring-2 focus:ring-orange-500/20"
                  }`}
                />
                {isNameUnique === true && (
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 w-5.5 h-5.5 bg-emerald-100 dark:bg-emerald-950/60 rounded-full flex items-center justify-center text-emerald-600 dark:text-emerald-450">
                    <Check className="w-3.5 h-3.5" strokeWidth={3} />
                  </span>
                )}
                {isNameUnique === false && (
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 w-5.5 h-5.5 bg-rose-100 dark:bg-rose-950/60 rounded-full flex items-center justify-center text-rose-600 dark:text-rose-450">
                    <X className="w-3.5 h-3.5" strokeWidth={3} />
                  </span>
                )}
              </div>
              
              {/* Dynamic Tip display */}
              {isNameUnique === false && (
                <p className="text-[10.5px] text-rose-600 dark:text-rose-400 font-semibold leading-relaxed mt-1 flex items-start gap-1">
                  <span className="shrink-0 mt-0.5">⚠️</span>
                  <span>
                    {isHi 
                      ? "यह नाम पहले से लिया गया है। टिप: इसे अद्वितीय बनाने के लिए स्थान का नाम जोड़ें (जैसे: 'जयपुर श्री श्याम ग्रुप सत्संग')।" 
                      : "This group name is already taken. Tip: Add a place/location name (e.g. 'Jaipur Shree Shyam Group') to make it unique!"}
                  </span>
                </p>
              )}
              {isNameUnique === true && (
                <p className="text-[10.5px] text-emerald-600 dark:text-emerald-400 font-semibold leading-relaxed mt-1 flex items-start gap-1">
                  <span className="shrink-0 mt-0.5">✅</span>
                  <span>{isHi ? "यह नाम उपलब्ध है!" : "This name is available!"}</span>
                </p>
              )}
            </div>

            {/* Description input */}
            <div className="space-y-1.5">
              <div className="flex justify-between items-center">
                <label className="text-xs font-bold text-stone-600 dark:text-stone-300 block">
                  {isHi ? "विवरण (वैकल्पिक)" : "Description (Optional)"}
                </label>
                <span className="text-[9px] text-stone-400 dark:text-stone-500 font-mono">
                  {groupDesc.length}/60
                </span>
              </div>
              <div className="relative">
                <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-orange-500">
                  <Pencil className="w-4 h-4" />
                </span>
                <input 
                  type="text"
                  maxLength={60}
                  placeholder={isHi ? "जैसे: प्रतिदिन संकीर्तन और भजन शेयरिंग" : "e.g., For kirtan and bhajan sharing"}
                  value={groupDesc}
                  onChange={(e) => setGroupDesc(e.target.value)}
                  className="w-full rounded-xl border border-orange-500/20 bg-white dark:bg-stone-900/60 pl-10 pr-10 py-3 text-sm focus:border-orange-400 focus:outline-none focus:ring-2 focus:ring-orange-500/20 transition-all"
                />
              </div>
            </div>

            {/* Choose Ishta Dev deity avatars row */}
            <div className="space-y-2.5">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-stone-600 dark:text-stone-300 block">
                  {isHi ? "इष्ट देव चुनें" : "Choose Ishta Dev"}
                </label>
                <span className="text-[10px] text-stone-400 dark:text-stone-500 font-semibold">
                  {isHi ? "एक चुनें" : "Select one"}
                </span>
              </div>
              
              <div className="grid grid-cols-4 gap-3 py-1">
                {DEITIES.map(d => {
                  const isSelected = groupDeity === d.id;
                  return (
                    <button
                      key={d.id}
                      type="button"
                      onClick={() => setGroupDeity(d.id)}
                      className="group flex flex-col items-center gap-1.5 focus:outline-none"
                    >
                      <div className="relative">
                        {/* Deity circular avatar */}
                        <div className={`w-14 h-14 rounded-full overflow-hidden border-2 transition-all p-0.5 ${
                          isSelected 
                            ? "border-orange-500 scale-[1.05] ring-4 ring-orange-500/10 shadow-md" 
                            : "border-stone-200 dark:border-stone-800 opacity-80 hover:opacity-100 hover:border-orange-400/40 hover:scale-[1.02]"
                        }`}>
                          <img src={d.src} alt={d.name} className="w-full h-full object-cover rounded-full" />
                        </div>
                        {/* Active checkmark indicator */}
                        {isSelected && (
                          <span className="absolute -top-1 -right-1 w-5 h-5 bg-orange-500 text-white rounded-full flex items-center justify-center shadow border-2 border-[#FAF6EE] dark:border-[#120F0B] text-[10px] font-bold">
                            ✓
                          </span>
                        )}
                      </div>
                      <span className={`text-[10px] font-bold transition-colors ${
                        isSelected 
                          ? "text-orange-500 border-b border-orange-500/50 pb-0.5" 
                          : "text-stone-500 dark:text-stone-400 group-hover:text-stone-700 dark:group-hover:text-stone-200"
                      }`}>
                        {d.name.split(" ")[0]}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Public/Privacy Banner */}
            <div className="flex items-center justify-between p-3.5 rounded-2xl bg-emerald-500/5 dark:bg-emerald-500/10 border border-emerald-500/15">
              <div className="flex items-center gap-3">
                <span className="w-8 h-8 rounded-full bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-450 flex items-center justify-center shrink-0">
                  <Check className="w-4 h-4" strokeWidth={3} />
                </span>
                <div className="text-left">
                  <p className="text-xs font-bold text-stone-850 dark:text-stone-200 leading-tight">
                    {isHi ? "कोई भी आपके समूह में शामिल हो सकता है।" : "Anyone can join your group."}
                  </p>
                  <p className="text-[10px] text-stone-500 dark:text-stone-400 mt-0.5 font-medium">
                    {isHi ? "सभी समूह हरि कीर्तन पर सार्वजनिक हैं।" : "All groups are public on Hari Kirtan."}
                  </p>
                </div>
              </div>
              <span className="text-orange-500/20 dark:text-orange-400/15">
                <Users className="w-7 h-7" />
              </span>
            </div>

            {/* Submit and Cancel Buttons */}
            <div className="space-y-2 pt-2">
              <Button
                type="submit"
                disabled={creatingGroup || isNameUnique === false}
                className="w-full bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white font-bold py-3.5 rounded-xl shadow-lg shadow-orange-500/20 hover:shadow-orange-500/30 transition-all duration-200 flex items-center justify-center gap-2 text-sm"
              >
                <Sparkles className="w-4 h-4 animate-pulse" />
                <span>
                  {creatingGroup 
                    ? (isHi ? "बन रहा है..." : "Creating Group...") 
                    : (isHi ? "समूह बनाएं" : "Create Group")}
                </span>
                <ArrowRight className="w-4 h-4 ml-auto" />
              </Button>
              
              <button
                type="button"
                onClick={() => setCreateGroupOpen(false)}
                className="w-full text-center text-xs font-bold text-stone-500 hover:text-stone-700 dark:text-stone-400 dark:hover:text-stone-250 py-1.5 focus:outline-none transition-colors"
              >
                {isHi ? "रद्द करें" : "Cancel"}
              </button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
