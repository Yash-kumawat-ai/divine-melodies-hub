import { useState, useEffect, useMemo, useRef } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { 
  ChevronLeft, Plus, Users, MessageSquare, Search, Copy, Globe, Info, Clock, Check, X, Trash2, Calendar, MapPin, ExternalLink, Sparkles, AlertCircle, Play, Heart, ThumbsUp, Send, User, ChevronRight, Pencil, ArrowRight,
  Leaf, Music, BookOpen, HelpCircle, Bookmark
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
  const [groupViewOpen, setGroupViewOpen] = useState(false);
  const [groupMembers, setGroupMembers] = useState<GroupMember[]>([]);
  const [activeGroupTab, setActiveGroupTab] = useState<'feed' | 'bhajans' | 'requests' | 'events' | 'members'>('feed');
  const [showMemberManagement, setShowMemberManagement] = useState(false);

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

  // Comments state maps
  const [expandedCommentsPostId, setExpandedCommentsPostId] = useState<string | null>(null);
  const [commentsMap, setCommentsMap] = useState<Record<string, PostComment[]>>({});
  const [newCommentText, setNewCommentText] = useState("");
  const [commentIsLyricsSubmit, setCommentIsLyricsSubmit] = useState(false);
  const [loadingCommentsPostIds, setLoadingCommentsPostIds] = useState<Record<string, boolean>>({});

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

  // Comments toggle handler
  const handleToggleComments = async (postId: string) => {
    if (expandedCommentsPostId === postId) {
      setExpandedCommentsPostId(null);
    } else {
      setExpandedCommentsPostId(postId);
      // Only set loading if we don't have comments in cache already
      const hasCached = !!commentsMap[postId];
      if (!hasCached) {
        setLoadingCommentsPostIds(prev => ({ ...prev, [postId]: true }));
      }
      try {
        const comments = await communityApi.fetchComments(postId);
        setCommentsMap(prev => ({ ...prev, [postId]: comments }));
      } catch (err) {
        console.error("Error fetching comments:", err);
      } finally {
        setLoadingCommentsPostIds(prev => ({ ...prev, [postId]: false }));
      }
    }
  };

  // Add Comment handler
  const handleAddComment = async (postId: string) => {
    if (!user) {
      toast.error(isHi ? "टिप्पणी करने के लिए कृपया लॉग इन करें" : "Please log in to add a comment");
      return;
    }
    if (!newCommentText.trim()) return;

    try {
      const added = await communityApi.createComment(postId, newCommentText.trim(), user.id, commentIsLyricsSubmit);
      // Attach commenter profile info so it shows immediately in the UI without waiting for refresh
      const addedWithProfile = {
        ...added,
        author: profile ? {
          display_name: profile.name || "Devotee",
          avatar_url: profile.avatar_url || ""
        } : undefined
      };
      setCommentsMap(prev => ({
        ...prev,
        [postId]: [...(prev[postId] || []), addedWithProfile]
      }));
      setNewCommentText("");
      setCommentIsLyricsSubmit(false);
      toast.success(isHi ? "टिप्पणी जोड़ी गई!" : "Comment posted!");
      // Reload posts to reflect comment counts & potential request status updates
      loadPosts();
    } catch (err: any) {
      console.error("Comment submission error:", err);
      const errMsg = err?.message || err?.details || JSON.stringify(err);
      toast.error(isHi ? `टिप्पणी जोड़ने में असमर्थ: ${errMsg}` : `Failed to post comment: ${errMsg}`);
    }
  };

  // Delete Comment handler
  const handleDeleteComment = async (postId: string, commentId: string) => {
    try {
      await communityApi.deleteComment(commentId);
      setCommentsMap(prev => ({
        ...prev,
        [postId]: (prev[postId] || []).filter(c => c.id !== commentId)
      }));
      toast.success(isHi ? "टिप्पणी हटा दी गई!" : "Comment deleted!");
      loadPosts();
    } catch {
      toast.error("Failed to delete comment");
    }
  };

  // Toggle Reaction 🙏 handler
  const handleToggleReaction = async (postId: string) => {
    if (!user) {
      toast.error(isHi ? "प्रतिक्रिया देने के लिए कृपया लॉग इन करें" : "Please log in to react");
      return;
    }
    // Optimistic Update
    setPosts(prev => prev.map(p => {
      if (p.id === postId) {
        return {
          ...p,
          has_reacted: !p.has_reacted,
          reaction_count: p.reaction_count + (p.has_reacted ? -1 : 1)
        };
      }
      return p;
    }));

    try {
      await communityApi.togglePostReaction(postId, user.id);
    } catch {
      // Revert if error
      loadPosts();
    }
  };

  // RSVP handler
  const handleToggleRsvp = async (postId: string, currentRsvp: 'interested' | 'going' | null, clickedRsvp: 'interested' | 'going') => {
    if (!user) {
      toast.error(isHi ? "RSVP करने के लिए कृपया लॉग इन करें" : "Please log in to RSVP");
      return;
    }
    try {
      if (currentRsvp === clickedRsvp) {
        await communityApi.deleteEventRsvp(postId, user.id);
        toast.success(isHi ? "RSVP हटा दिया गया" : "RSVP removed");
      } else {
        await communityApi.rsvpToEvent(postId, user.id, clickedRsvp);
        toast.success(isHi ? "RSVP अपडेट किया गया" : "RSVP updated");
      }
      loadPosts();
    } catch {
      toast.error("Failed to update RSVP");
    }
  };

  // Poll option vote handler
  const handleVoteOption = async (postId: string, optionIndex: number) => {
    if (!user) {
      toast.error(isHi ? "मतदान करने के लिए कृपया लॉग इन करें" : "Please log in to vote");
      return;
    }
    try {
      await communityApi.voteOnQuestionOption(postId, user.id, optionIndex);
      toast.success(isHi ? "आपका मत दर्ज किया गया" : "Vote recorded");
      loadPosts();
    } catch {
      toast.error("Failed to register vote");
    }
  };

  // Group Create handler
  const handleCreateGroup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      toast.error("Please log in to create a group");
      return;
    }
    if (!groupName.trim()) {
      toast.error("Group name is required");
      return;
    }

    try {
      setCreatingGroup(true);
      await communityApi.createGroup(groupName.trim(), groupDesc.trim(), groupDeity, user.id);
      toast.success(isHi ? "नाम संघ समूह सफलतापूर्वक बनाया गया!" : "Naam Sangh group created successfully!");
      setGroupName("");
      setGroupDesc("");
      setCreateGroupOpen(false);
      loadGroups();
    } catch {
      toast.error("Failed to create group");
    } finally {
      setCreatingGroup(false);
    }
  };

  // Group Join Toggle handler
  const handleToggleGroupJoin = async (group: Group) => {
    if (!user) {
      toast.error("Please log in to join a group");
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
    const text = `🙏 Jai Shri Ram\n\nI created a Naam Sangh on Hari Kirtan.\n\nLet's share bhajans, devotional thoughts and grow spiritually together.\n\nJoin Here:\n${groupLink}`;
    window.open(`https://api.whatsapp.com/send?text=${encodeURIComponent(text)}`, '_blank');
  };

  // Copy Group Link
  const handleCopyGroupLink = (group: Group) => {
    const groupLink = `${window.location.origin}/community/groups/${group.slug || group.id}`;
    navigator.clipboard.writeText(groupLink);
    toast.success("Invitation link copied!");
  };

  // Group Admin actions (kick member, delete group)
  const handleRemoveMember = async (groupId: string, memberId: string) => {
    try {
      await communityApi.removeGroupMember(groupId, memberId);
      toast.success("Member removed");
      const members = await communityApi.fetchGroupMembers(groupId);
      setGroupMembers(members);
    } catch {
      toast.error("Failed to remove member");
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
        toast.error("Failed to delete group");
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
      toast.error("Please log in to publish posts");
      return;
    }
    if (postType !== 'thought' && !postTitle.trim()) {
      toast.error("Title is required");
      return;
    }
    if (!postContent.trim()) {
      toast.error("Content description is required");
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
                    {isHi ? "मेरे नाम संघ" : "My Naam Sangh"}
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
                  <span>{isHi ? "नाम संघ बनाएं" : "Create Naam Sangh"}</span>
                </button>
              </div>
            </div>

            {/* ─── 2. MIDDLE COLUMN (MAIN CONTENT) ────────────────────── */}
            <div className={`col-span-12 ${activeTab === 'feed' ? 'lg:col-span-6' : 'lg:col-span-9'} space-y-6`}>
              
              {/* ─── TAB SWITCHER ──────────────────────────────────────── */}
              <div className="flex border-b border-orange-500/10 mb-6 gap-2 overflow-x-auto scrollbar-none">
                {[
                  { id: 'feed', label: isHi ? 'सत्संग फीड' : 'Satsang Feed', icon: MessageSquare },
                  { id: 'groups', label: isHi ? 'नाम संघ' : 'Naam Sangh Groups', icon: Users },
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
                  <div className="relative rounded-3xl overflow-hidden bg-gradient-to-r from-stone-950 via-[#2d1c10] to-stone-950 border border-orange-500/25 p-6 md:p-8 flex items-center justify-between shadow-xl min-h-[140px] select-none text-left">
                    <div className="absolute top-1/2 left-1/3 -translate-y-1/2 w-64 h-64 bg-orange-500/10 rounded-full blur-3xl pointer-events-none" />
                    
                    <div className="relative z-10 space-y-2 max-w-md md:max-w-lg">
                      <h2 className="font-display font-extrabold text-2xl md:text-3xl text-amber-100 tracking-tight drop-shadow-md">
                        {isHi ? "डिजिटल सत्संग" : "Digital Satsang"}
                      </h2>
                      <p className="text-xs md:text-sm text-stone-300 font-medium tracking-wide leading-relaxed">
                        {isHi 
                          ? "भजन साझा करें • भक्तों से जुड़ें • भक्ति को आगे बढ़ाएं" 
                          : "Share Bhajans • Connect with Devotees • Advance Devotion"}
                      </p>
                      <div className="flex items-center gap-2 pt-1">
                        <span className="w-12 h-px bg-amber-500/30" />
                        <span className="text-amber-500 text-[10px]">🌸</span>
                        <span className="w-12 h-px bg-amber-500/30" />
                      </div>
                    </div>

                    <div className="relative flex items-center justify-center shrink-0 pr-2">
                      <div className="absolute w-24 h-24 bg-amber-500/20 rounded-full blur-xl animate-pulse" />
                      <div className="relative z-10 flex flex-col items-center gap-1">
                        <span className="text-4xl md:text-5xl font-extrabold text-transparent bg-clip-text bg-gradient-to-b from-amber-200 to-amber-500 drop-shadow-[0_2px_12px_rgba(245,158,11,0.5)]">
                          ॐ
                        </span>
                        <span className="text-xl md:text-2xl mt-0.5 filter drop-shadow-[0_2px_6px_rgba(244,63,94,0.3)]">🪷</span>
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
                        <p className="text-[9px] text-purple-500 font-bold flex items-center gap-1 pt-1">
                          ✦ {isHi ? "आज 23 नए अनुरोध" : "23 new requests today"}
                        </p>
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
                            if (confirm("Delete this post?")) {
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
                      className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl font-bold text-xs text-white shadow-md shadow-orange-500/15 hover:shadow-lg hover:shadow-orange-500/25 hover:scale-[1.01] active:scale-95 transition-all shrink-0"
                      style={{
                        background: "linear-gradient(135deg, #f59e0b 0%, #ea580c 100%)"
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
                            <div className="h-28 w-full relative overflow-hidden bg-amber-50 dark:bg-stone-950 flex items-center justify-center">
                              <img
                                src={deityFound ? deityFound.src : "/placeholder-deity.jpg"}
                                alt={group.name}
                                className="w-full h-full object-cover opacity-90 transition-transform duration-500 group-hover:scale-105"
                              />
                              <div className="absolute inset-0 bg-gradient-to-t from-white dark:from-stone-900 via-transparent to-black/20" />
                              
                              {/* Public/Private badge */}
                              <span className="absolute top-3 left-3 text-[9px] font-extrabold px-2 py-0.5 rounded-full text-white flex items-center gap-1 backdrop-blur-xs shadow-xs bg-emerald-600/80">
                                <Globe className="w-2.5 h-2.5" />
                                {isHi ? "सार्वजनिक" : "Public"}
                              </span>
                            </div>

                            <div className="p-5 flex-1 flex flex-col justify-between">
                              <div>
                                <h3 className="font-display text-lg font-bold text-orange-950 dark:text-amber-100 leading-snug">
                                  {group.name}
                                </h3>
                                <p className="text-xs text-stone-500 mt-0.5">
                                  {group.member_count} {isHi ? "भक्त जुड़े हैं" : "Members"}
                                </p>
                                <p className="text-xs text-stone-600 dark:text-stone-300 mt-2 line-clamp-2 leading-relaxed">
                                  {group.description || (isHi ? "भक्तिमय संगीत और नाम जप साझा करने का स्थान।" : "A space for sharing devotional music and thoughts.")}
                                </p>
                              </div>
                            </div>

                            <div className="flex gap-2.5 mt-5 border-t border-orange-500/5 pt-3.5">
                              <Button
                                variant="outline"
                                onClick={() => handleOpenGroupDetails(group)}
                                className="flex-1 text-xs font-bold border-orange-500/20 text-orange-600 dark:text-orange-400 hover:bg-orange-500/5 rounded-xl h-9"
                              >
                                {group.is_member ? (isHi ? "समूह देखें" : "View") : (isHi ? "विवरण देखें" : "Details")}
                              </Button>
                              <Button
                                onClick={() => handleToggleGroupJoin(group)}
                                className={`flex-1 text-xs font-bold rounded-xl h-9 ${
                                  group.is_member 
                                    ? "bg-stone-100 dark:bg-stone-850 text-stone-700 dark:text-stone-300 hover:bg-stone-200" 
                                    : "bg-orange-500 hover:bg-orange-600 text-white"
                                }`}
                              >
                                {group.is_member ? (isHi ? "शामिल हैं" : "Joined") : (isHi ? "शामिल हों" : "Join")}
                              </Button>
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
                            if (confirm("Delete this event post?")) {
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
                      👥 {isHi ? "सक्रिय नाम संघ" : "Active Naam Sangh"}
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

      {/* ─── GROUP DETAIL FULLSCREEN SUB-VIEW ────────────────────── */}
      {groupViewOpen && selectedGroup && (
        <div className="max-w-4xl mx-auto px-4 mt-6">
          
          {/* Deity Banner Jumbotron */}
          <div className="relative rounded-3xl overflow-hidden h-40 border border-orange-500/10 bg-orange-100 dark:bg-stone-900 shadow-xs flex items-center justify-center mb-6">
            {DEITIES.find(d => d.id === selectedGroup.deity) && (
              <img 
                src={DEITIES.find(d => d.id === selectedGroup.deity)?.src} 
                alt={selectedGroup.name}
                className="w-full h-full object-cover object-top opacity-20 filter blur-xs scale-105 pointer-events-none"
              />
            )}
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/25 to-transparent flex flex-col justify-end p-6">
              <div className="flex items-center gap-2">
                <span className="text-[10px] uppercase font-extrabold tracking-wider bg-orange-500 text-white px-2 py-0.5 rounded-md">
                  {isHi ? "सार्वजनिक" : "Public Group"}
                </span>
                <span className="text-[10px] uppercase font-extrabold tracking-wider bg-stone-900/60 text-stone-200 px-2 py-0.5 rounded-md">
                  {selectedGroup.deity}
                </span>
              </div>
              <h2 className="font-display font-extrabold text-xl md:text-2xl text-white mt-1.5 leading-none">
                {selectedGroup.name}
              </h2>
              <p className="text-stone-200 text-xs mt-1.5 font-medium">
                {selectedGroup.member_count} {isHi ? "भक्त जुड़े हैं" : "Members"}
              </p>
            </div>
          </div>

          {/* Action Row */}
          <div className="flex flex-wrap items-center gap-2 mb-6">
            <Button
              onClick={() => handleWhatsAppInvite(selectedGroup)}
              className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-xs flex items-center gap-1 h-9 px-4 shadow-sm"
            >
              <Send className="w-3.5 h-3.5" />
              {isHi ? "व्हाट्सएप आमंत्रण" : "Invite WhatsApp"}
            </Button>
            <Button
              variant="outline"
              onClick={() => handleCopyGroupLink(selectedGroup)}
              className="border-orange-500/20 text-orange-600 dark:text-orange-400 bg-white dark:bg-stone-900 hover:bg-orange-500/5 rounded-xl text-xs flex items-center gap-1 h-9 px-4 shadow-sm"
            >
              <Copy className="w-3.5 h-3.5" />
              {isHi ? "लिंक कॉपी करें" : "Copy Link"}
            </Button>

            {/* If Creator/Admin */}
            {selectedGroup.created_by === user?.id && (
              <>
                <Button
                  variant="outline"
                  onClick={() => setShowMemberManagement(!showMemberManagement)}
                  className="border-stone-500/20 text-stone-600 dark:text-stone-300 bg-white dark:bg-stone-900 hover:bg-stone-500/5 rounded-xl text-xs flex items-center gap-1 h-9 px-4 shadow-sm ml-auto"
                >
                  <Users className="w-3.5 h-3.5" />
                  {isHi ? "सदस्य सूची" : "Manage Members"}
                </Button>
                <Button
                  variant="ghost"
                  onClick={() => handleDeleteGroupAction(selectedGroup.id)}
                  className="text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/20 rounded-xl text-xs flex items-center gap-1 h-9 px-3"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  {isHi ? "समूह हटाएं" : "Delete Group"}
                </Button>
              </>
            )}

            {selectedGroup.created_by !== user?.id && (
              <Button
                variant="outline"
                onClick={() => handleToggleGroupJoin(selectedGroup)}
                className="border-stone-500/20 text-rose-600 dark:text-rose-400 bg-white dark:bg-stone-900 hover:bg-stone-500/5 rounded-xl text-xs flex items-center gap-1 h-9 px-4 shadow-sm ml-auto"
              >
                Leave Group
              </Button>
            )}
          </div>

          {/* Members manager panel */}
          {showMemberManagement && selectedGroup.created_by === user?.id && (
            <div className="bg-white dark:bg-stone-900 border border-orange-500/10 rounded-2xl p-5 mb-6 shadow-sm">
              <h3 className="font-display font-bold text-sm text-orange-950 dark:text-amber-100 mb-3 flex items-center gap-1">
                👥 Member List
              </h3>
              <div className="space-y-3 max-h-48 overflow-y-auto">
                {groupMembers.map(m => (
                  <div key={m.user_id} className="flex items-center justify-between text-xs py-1">
                    <span className="font-medium text-stone-700 dark:text-stone-300">
                      {m.profile?.display_name || "Devotee"} {m.role === 'admin' && "(Admin)"}
                    </span>
                    {m.role !== 'admin' && (
                      <button 
                        onClick={() => handleRemoveMember(selectedGroup.id, m.user_id)}
                        className="text-rose-600 hover:underline"
                      >
                        Remove
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* About Section */}
          <div className="bg-white dark:bg-stone-900 border border-orange-500/10 rounded-2xl p-5 mb-6 shadow-xs">
            <h3 className="font-display font-bold text-sm text-orange-950 dark:text-amber-100 mb-2">
              🌿 {isHi ? "समूह विवरण" : "About this Community"}
            </h3>
            <p className="text-xs text-stone-600 dark:text-stone-300 leading-relaxed font-medium">
              {selectedGroup.description || (isHi ? "कोई विवरण उपलब्ध नहीं है।" : "No description provided.")}
            </p>
          </div>

          {/* Group Content Tabs */}
          <div className="flex border-b border-orange-500/10 mb-6 gap-2">
            {[
              { id: 'feed', label: isHi ? 'सत्संग' : 'Satsang' },
              { id: 'bhajans', label: isHi ? 'भजन शेयर' : 'Bhajans' },
              { id: 'requests', label: isHi ? 'भजन अनुरोध' : 'Requests' },
              { id: 'events', label: isHi ? 'कार्यक्रम' : 'Events' }
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveGroupTab(tab.id as any)}
                className={`relative pb-3 px-3 font-bold text-xs transition-all ${
                  activeGroupTab === tab.id ? "text-orange-600 dark:text-orange-400" : "text-stone-500 dark:text-stone-400"
                }`}
              >
                {tab.label}
                {activeGroupTab === tab.id && (
                  <motion.div 
                    layoutId="group-tab-line"
                    className="absolute bottom-0 left-0 right-0 h-0.5 bg-orange-500"
                  />
                )}
              </button>
            ))}
          </div>

          {/* Group-specific Feed Composer CTA */}
          <div 
            onClick={() => {
              // Pre-select post type according to activeGroupTab
              if (activeGroupTab === 'bhajans') setPostType('bhajan_share');
              else if (activeGroupTab === 'requests') setPostType('bhajan_request');
              else if (activeGroupTab === 'events') setPostType('event');
              else setPostType('thought');
              setCreatePostOpen(true);
            }}
            className="bg-white dark:bg-stone-900 border border-orange-500/10 rounded-2xl p-4 flex items-center justify-between shadow-xs hover:border-orange-500/30 cursor-pointer mb-6"
          >
            <span className="text-stone-400 text-xs font-medium">
              {isHi ? "इस समूह में कुछ साझा करें..." : "Post to this group..."}
            </span>
            <Button size="icon" className="bg-orange-500 hover:bg-orange-600 text-white rounded-full w-8 h-8 shrink-0">
              <Plus className="w-4.5 h-4.5" />
            </Button>
          </div>

          {/* Feed Filter logic for group items */}
          {(() => {
            const groupPosts = posts.filter(p => p.group_id === selectedGroup.id);
            let displayList = groupPosts;
            
            if (activeGroupTab === 'bhajans') {
              displayList = groupPosts.filter(p => p.type === 'bhajan_share');
            } else if (activeGroupTab === 'requests') {
              displayList = groupPosts.filter(p => p.type === 'bhajan_request');
            } else if (activeGroupTab === 'events') {
              displayList = groupPosts.filter(p => p.type === 'event');
            }

            if (displayList.length === 0) {
              return (
                <div className="text-center py-16 bg-white dark:bg-stone-900 border border-orange-500/10 rounded-2xl">
                  <span className="text-3xl block">🌸</span>
                  <p className="text-stone-500 dark:text-stone-400 font-medium text-xs mt-3">
                    No items in this section yet. Share the first one!
                  </p>
                </div>
              );
            }

            return (
              <div className="space-y-4">
                {displayList.map(post => (
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
                      if (confirm("Delete this post?")) {
                        await communityApi.softRemovePost(id);
                        loadPosts();
                      }
                    }}
                  />
                ))}
              </div>
            );
          })()}
        </div>
      )}

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
            <DialogTitle>{isHi ? "नाम संघ समूह बनाएं" : "Create Naam Sangh Group"}</DialogTitle>
            <DialogDescription>
              {isHi ? "नाम संघ समूह बनाएं और भक्तों को आमंत्रित करें।" : "Create a Naam Sangh group and invite devotees."}
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
              {isHi ? "नाम संघ बनाएं" : "Create Naam Sangh Group"}
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

// ─── POST CARD SUB-COMPONENT ──────────────────────────────────────────

export interface PostCardProps {
  post: CommunityPost;
  user: any;
  isHi: boolean;
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
  onToggleSavePost
}: PostCardProps) {
  const { theme } = useTheme();
  const isDark = theme === "dark";
  
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
    <div className={`rounded-[24px] p-5 hover:border-orange-500/20 hover:shadow-[0_0_15px_rgba(249,115,22,0.07)] transition-all flex flex-col gap-4 text-left shadow-lg border ${
      isDark ? 'bg-[#130f0c] border-[#231b15]' : 'bg-white border-stone-200'
    }`}>
      <div>
        {/* Post Card Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 min-w-[40px] min-h-[40px] max-w-[40px] max-h-[40px] rounded-full p-[1.5px] bg-gradient-to-tr from-amber-500 to-orange-600 shrink-0">
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
            <div>
              <span className={`font-display font-bold text-xs flex items-center gap-1.5 flex-wrap ${
                isDark ? 'text-stone-100' : 'text-stone-850'
              }`}>
                {post.author?.display_name || (isHi ? "अनाम भक्त" : "Anonymous Devotee")}
                <span className="text-[10px] select-none" title={authorBadge.label}>
                  {authorBadge.icon}
                </span>
                {post.group_name && (
                  <span className={`text-[10px] font-semibold ${
                    isDark ? 'text-stone-500' : 'text-stone-400'
                  }`}>
                    in <span className="text-orange-400 font-bold">#${post.group_name}</span>
                  </span>
                )}
              </span>
              <p className={`text-[9px] font-medium tracking-wide mt-0.5 ${
                isDark ? 'text-stone-400' : 'text-stone-500'
              }`}>
                {formatTime(post.created_at)} • <span className={authorBadge.colorClass}>{authorBadge.label}</span>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1.5">
            {/* Colored Type Tag */}
            <Badge 
              variant="outline" 
              className={`text-[9px] uppercase font-extrabold ${
                post.type === 'bhajan_share' ? (isDark ? "bg-emerald-950/20 text-emerald-400 border-emerald-500/20" : "bg-emerald-50 text-emerald-700 border-emerald-300/40") :
                post.type === 'bhajan_request' ? (isDark ? "bg-[#2c2018] text-amber-400 border-amber-500/20" : "bg-amber-50 text-amber-700 border-amber-300/60") :
                post.type === 'question' ? (isDark ? "bg-blue-950/20 text-blue-400 border-blue-500/20" : "bg-blue-50 text-blue-700 border-blue-300/40") :
                post.type === 'event' ? (isDark ? "bg-rose-950/20 text-rose-400 border-rose-500/20" : "bg-rose-50 text-rose-700 border-rose-300/40") :
                isDark ? "bg-stone-900 text-stone-400 border-stone-800" : "bg-stone-100 text-stone-600 border-stone-200"
              }`}
            >
              {post.type.replace('_', ' ')}
            </Badge>
            {user?.id === post.author_id && (
              <button 
                onClick={() => onDeletePost(post.id)}
                className={`p-1 transition-colors ${
                  isDark ? 'text-stone-400 hover:text-rose-500' : 'text-stone-500 hover:text-rose-600'
                }`}
                title="Delete Post"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>

        {/* Post content and media (stacked vertically like Twitter) */}
        <div className="mt-3.5 space-y-3.5 text-left w-full">
          {/* Title */}
          {post.title && (
            <h3 className={`font-display font-extrabold text-sm sm:text-base leading-tight ${
              isDark ? 'text-amber-50' : 'text-stone-850'
            }`}>
              {post.title}
            </h3>
          )}

          {/* Content text */}
          {post.content && (
            <p className={`text-xs sm:text-[13px] whitespace-pre-wrap leading-relaxed ${
              isDark ? 'text-stone-300' : 'text-stone-600'
            }`}>
              {highlightSacredText(post.content)}
            </p>
          )}

          {/* Optional Uploaded Image (Full-width, rounded) */}
          {post.image_url && (
            <div className={`w-full rounded-2xl overflow-hidden shadow-sm border ${
              isDark ? 'border-orange-500/10 bg-stone-900/40' : 'border-stone-200 bg-stone-50'
            }`}>
              <img 
                src={post.image_url} 
                alt="post visual" 
                className="w-full h-auto max-h-[350px] sm:max-h-[450px] object-cover rounded-2xl" 
              />
            </div>
          )}

          {/* Bhajan share player widget (Only if type is bhajan_share AND youtube_url is present!) */}
          {post.type === 'bhajan_share' && post.youtube_url && (
            <div 
              onClick={() => window.open(post.youtube_url, '_blank')}
              className={`rounded-2xl p-4 flex items-center gap-3 w-full cursor-pointer transition-all group relative shadow-xs select-none border ${
                isDark ? 'bg-[#17120e] border-[#2c2018] hover:bg-[#201813]' : 'bg-orange-50/40 border-orange-200/60 hover:bg-orange-100/30'
              }`}
            >
              {/* Deity image */}
              <div className={`w-12 h-12 rounded-xl overflow-hidden shrink-0 flex items-center justify-center border ${
                isDark ? 'border-orange-500/10 bg-stone-900' : 'border-orange-200/50 bg-white'
              }`}>
                <img 
                  src={getDeityImgForPost(post.id)} 
                  alt="deity logo" 
                  className="w-full h-full object-cover"
                />
              </div>
              {/* Title & wave visualizer */}
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
                {/* Audio Wave Visualizer */}
                <div className="flex items-end gap-[1.5px] h-3.5 mt-1.5 opacity-80">
                  {[2, 4, 3, 5, 8, 6, 4, 7, 5, 3, 6, 4, 2, 5, 3, 4, 6, 8, 5, 3].map((h, i) => (
                    <span key={i} className="w-[1.5px] bg-gradient-to-t from-orange-600 to-amber-400 rounded-full" style={{ height: (h * 1.5) + 'px' }} />
                  ))}
                </div>
              </div>
              {/* Play Button */}
              <button
                className="w-8 h-8 rounded-full bg-gradient-to-r from-amber-500 to-orange-600 flex items-center justify-center shadow-md text-white shrink-0 group-hover:scale-105 transition-all"
              >
                <Play className="w-3.5 h-3.5 fill-white text-white translate-x-[0.5px]" />
              </button>
            </div>
          )}

          {/* Embedded YouTube Link (For posts that are NOT bhajan_share but have youtube_url) */}
          {post.youtube_url && post.type !== 'bhajan_share' && (
            <div className={`rounded-xl p-2.5 flex items-center justify-between gap-3 max-w-[400px] border ${
              isDark ? 'border-orange-500/10 bg-[#1a1410]/50' : 'border-stone-200 bg-stone-50'
            }`}>
              <Play className="w-6 h-6 text-orange-500 shrink-0 ml-1" />
              <div className="min-w-0 flex-1">
                <span className={`text-[8px] font-bold uppercase tracking-wider block ${
                  isDark ? 'text-stone-400' : 'text-stone-500'
                }`}>YouTube Link</span>
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

          {/* ── TYPE SPECIFIC RENDERINGS ── */}

          {/* A. Bhajan Request status timeline */}
          {post.type === 'bhajan_request' && (
            <div className={`border rounded-2xl p-4 ${isDark ? 'bg-stone-900/20 border-orange-500/10' : 'bg-stone-50/60 border-stone-200'}`}>
              <div className="flex items-center justify-between mb-3.5">
                <span className={`text-xs font-bold ${isDark ? 'text-stone-400' : 'text-stone-600'}`}>{isHi ? "अनुरोध स्थिति:" : "Request Pipeline:"}</span>
                <Badge variant="outline" className={"text-[10px] font-extrabold capitalize " + getStatusBadgeColor(post.request_status)}>
                  {post.request_status.replace('_', ' ')}
                </Badge>
              </div>

              {/* Celebratory alert banner if resolved and added to library */}
              {post.request_status === 'added_to_library' && (
                <div className="mb-4 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-bold p-3 rounded-xl flex items-center gap-2">
                  <span>🎉</span>
                  <span>
                    {isHi ? "भजन को मुख्य लाइब्रेरी में जोड़ दिया गया है!" : "Your request was added to the Library!"}
                  </span>
                  {post.resolved_bhajan_id && (
                    <a 
                      href={"/bhajan/" + post.resolved_bhajan_id}
                      className="underline text-emerald-400 ml-auto flex items-center gap-1 shrink-0"
                    >
                      View Bhajan <ChevronRight className="w-3.5 h-3.5" />
                    </a>
                  )}
                </div>
              )}

              {/* Status Timeline Circles */}
              <div className="flex items-center justify-between text-[10px] font-extrabold tracking-tight text-center relative px-2 mb-2">
                <div className={`absolute top-2 left-6 right-6 h-0.5 -z-10 ${isDark ? 'bg-stone-850' : 'bg-stone-200'}`} />
                {[
                  { status: 'open', label: isHi ? 'खुला' : 'Open' },
                  { status: 'lyrics_submitted', label: isHi ? 'उत्तर प्राप्त' : 'Lyrics' },
                  { status: 'in_review', label: isHi ? 'समीक्षा' : 'Review' },
                  { status: 'added_to_library', label: isHi ? 'लाइब्रेरी' : 'Library' }
                ].map((step, idx) => {
                  const stages = ['open', 'lyrics_submitted', 'in_review', 'added_to_library'];
                  const currentIdx = stages.indexOf(post.request_status);
                  const stepIdx = stages.indexOf(step.status);
                  const isPassed = stepIdx <= currentIdx && post.request_status !== 'closed_unresolved';
                  return (
                    <div key={step.status} className="flex flex-col items-center">
                      <div className={"w-4 h-4 rounded-full border flex items-center justify-center text-[7.5px] font-bold " + (
                        isPassed 
                          ? "bg-orange-500 border-orange-600 text-white" 
                          : isDark ? "bg-[#130f0c] border-stone-800 text-stone-400" : "bg-white border-stone-200 text-stone-450"
                      )}>
                        {isPassed && "✓"}
                      </div>
                      <span className={"mt-1 font-semibold " + (isPassed ? "text-orange-400" : isDark ? "text-stone-500" : "text-stone-400")}>
                        {step.label}
                      </span>
                    </div>
                  );
                })}
              </div>

              {/* Lyrics submit CTA */}
              {post.request_status === 'open' && (
                <Button 
                  onClick={() => onToggleComments(post.id)}
                  className="mt-3.5 w-full bg-orange-500 hover:bg-orange-600 text-white text-xs font-bold rounded-xl h-9 shadow-xs"
                >
                  📿 {isHi ? "मुझे इस भजन के बोल पता हैं (उत्तर दें)" : "I Know This Bhajan (Submit Lyrics)"}
                </Button>
              )}
            </div>
          )}

          {/* B. Event Date and Location detail card */}
          {post.type === 'event' && (
            <div className={`border rounded-2xl p-4 space-y-3 ${isDark ? 'bg-stone-900/20 border-orange-500/10' : 'bg-stone-50/60 border-stone-200'}`}>
              <div className={`flex flex-col sm:flex-row sm:items-center justify-between text-xs font-bold gap-2 border-b pb-2.5 ${isDark ? 'text-stone-300 border-[#2c2018]' : 'text-stone-700 border-stone-200'}`}>
                <span className="flex items-center gap-1 text-rose-500">
                  <Calendar className="w-4 h-4" />
                  {post.event_datetime ? new Date(post.event_datetime).toLocaleString() : "Date/Time not set"}
                </span>
                <span className={`flex items-center gap-1 ${isDark ? 'text-stone-400' : 'text-stone-500'}`}>
                  <MapPin className="w-4 h-4" />
                  {post.event_location || "Virtual Zoom"}
                </span>
              </div>

              {/* Linked Bhajan */}
              {post.linked_bhajan_id && (
                <div className={`p-3 rounded-xl border flex items-center justify-between gap-3 ${
                  isDark ? 'bg-[#1a1410]/50 border-orange-500/10' : 'bg-orange-50/30 border-orange-200/50'
                }`}>
                  <div className="min-w-0 flex-1">
                    <span className="text-[9px] uppercase tracking-wider font-extrabold text-orange-400 block">Linked Bhajan</span>
                    <span className={`text-xs font-bold truncate block ${isDark ? 'text-stone-200' : 'text-stone-850'}`}>Bhajan Page Reference</span>
                  </div>
                  <a 
                    href={"/bhajan/" + post.linked_bhajan_id}
                    className="bg-orange-500/10 text-orange-600 hover:bg-orange-500/20 text-xs px-3 py-1.5 rounded-lg font-bold flex items-center gap-0.5 transition-all shrink-0"
                  >
                    Open lyrics <ChevronRight className="w-3 h-3" />
                  </a>
                </div>
              )}

              {/* RSVP Selection Buttons */}
              <div className="flex gap-2">
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
                          ? "bg-rose-500 border-rose-600 text-white shadow-xs" 
                          : isDark ? "bg-[#1a1410] border-rose-500/15 text-rose-400 hover:bg-rose-500/5" : "bg-rose-50/30 border-rose-200/60 text-rose-600 hover:bg-rose-100/40"
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

          {/* C. Question poll quick choices render */}
          {post.type === 'question' && post.question_options && post.question_options.length > 0 && (
            <div className={`p-4 rounded-2xl border ${isDark ? 'bg-stone-900/20 border-orange-500/10' : 'bg-stone-50/60 border-stone-200'}`}>
              <span className="text-[10px] font-extrabold uppercase tracking-wider text-blue-500 block mb-2">
                Quick tap option poll
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
                      {/* Percentage Progress Fill */}
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
      <div className={`flex items-center rounded-full px-5 py-2 w-fit gap-4 mt-3 shadow-inner border ${
        isDark ? 'bg-[#181310] border-[#281f19]' : 'bg-stone-50 border-stone-200'
      }`}>
        {/* Blessings (Like) */}
        <button
          onClick={() => onToggleReaction(post.id)}
          className={`flex items-center gap-2.5 text-left transition-all active:scale-95 group ${post.has_reacted ? 'text-rose-500' : 'text-stone-400'}`}
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

        {/* Divider */}
        <span className={`w-px h-6 ${isDark ? 'bg-[#2c2018]' : 'bg-stone-200'}`} />

        {/* Comments */}
        <button
          onClick={() => onToggleComments(post.id)}
          className="flex items-center gap-2.5 text-left transition-all active:scale-95 group"
        >
          <MessageSquare className={`w-5 h-5 transition-all ${isCommentsExpanded ? 'text-orange-400 scale-110' : 'text-stone-400 group-hover:text-orange-400'}`} />
          <div>
            <p className={`text-xs font-black leading-none ${isDark ? 'text-stone-100' : 'text-stone-850'}`}>{post.comment_count}</p>
            <p className={`text-[9px] font-bold mt-0.5 ${isDark ? 'text-stone-400' : 'text-stone-500'}`}>{isHi ? "टिप्पणी" : "Comments"}</p>
          </div>
        </button>

        {/* Divider */}
        <span className={`w-px h-6 ${isDark ? 'bg-[#2c2018]' : 'bg-stone-200'}`} />

        {/* Save button */}
        <button
          onClick={() => onToggleSavePost(post.id)}
          className="flex items-center gap-2 text-left transition-all active:scale-95 group"
        >
          <Bookmark className={`w-4.5 h-4.5 transition-all ${isPostSaved ? 'text-amber-500 fill-amber-500 scale-110' : 'text-stone-400 group-hover:text-amber-500'}`} />
          <span className={`text-[11px] font-bold transition-colors ${
            isPostSaved ? 'text-amber-500' : isDark ? 'text-stone-300 group-hover:text-stone-100' : 'text-stone-600 group-hover:text-stone-850'
          }`}>{isHi ? "सहेजें" : "Save"}</span>
        </button>

        {/* Divider */}
        <span className={`w-px h-6 ${isDark ? 'bg-[#2c2018]' : 'bg-stone-200'}`} />

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
          className="flex items-center gap-2 text-left transition-all active:scale-95 group"
        >
          <ExternalLink className={`w-4 h-4 transition-colors ${isDark ? 'text-stone-400 group-hover:text-orange-400' : 'text-stone-500 group-hover:text-orange-500'}`} />
          <span className={`text-[11px] font-bold transition-colors ${isDark ? 'text-stone-300 group-hover:text-stone-100' : 'text-stone-600 group-hover:text-stone-850'}`}>{isHi ? "साझा करें" : "Share"}</span>
        </button>
      </div>

      {/* ─── COLLAPSED COMMENTS PANEL ───────────────────────────── */}
      {isCommentsExpanded && (
        <div className={`mt-4 rounded-2xl p-4 border space-y-4 ${
          isDark ? 'bg-[#120e0c] border-orange-500/5' : 'bg-stone-50/50 border-stone-200/80'
        }`}>
          <div className={`flex items-center justify-between border-b pb-2 ${isDark ? 'border-[#231b15]' : 'border-stone-200'}`}>
            <span className={`text-xs font-bold ${isDark ? 'text-stone-400' : 'text-stone-500'}`}>
              {isHi ? "वार्तालाप" : "Discussion Thread"}
            </span>
          </div>

          {/* Comments List */}
          <div className="space-y-3.5 max-h-72 overflow-y-auto pr-1">
            {isLoadingComments && comments.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-8 text-stone-400">
                <Loader2 className="w-5 h-5 animate-spin text-orange-500 mb-2" />
                <span className="text-[10px] font-extrabold uppercase tracking-wider text-stone-500">
                  {isHi ? "टिप्पणियाँ लोड हो रही हैं..." : "Loading comments..."}
                </span>
              </div>
            ) : comments.length === 0 ? (
              <div className={`text-center py-6 border border-dashed rounded-xl bg-orange-500/[0.01] ${
                isDark ? 'border-[#231b15]' : 'border-stone-200'
              }`}>
                <p className={`text-xs font-medium ${isDark ? 'text-stone-400' : 'text-stone-500'}`}>
                  {isHi ? "कोई टिप्पणी नहीं है। पहली टिप्पणी करें! 📿" : "No replies yet. Be the first to reply! 📿"}
                </p>
              </div>
            ) : (
              comments.map(comment => (
                <div key={comment.id} className="flex gap-2.5 text-xs items-start group text-left">
                  {/* Defensive, bulletproof avatar container */}
                  <div className="w-8 h-8 min-w-[32px] min-h-[32px] max-w-[32px] max-h-[32px] rounded-full bg-orange-950/40 shrink-0 flex items-center justify-center font-bold text-orange-400 ring-2 ring-orange-500/10 shadow-xs overflow-hidden select-none">
                    {comment.author?.avatar_url ? (
                      <img src={comment.author.avatar_url} alt="avatar" className="w-full h-full max-w-full max-h-full object-cover rounded-full" />
                    ) : (
                      comment.author?.display_name ? (
                        comment.author.display_name.slice(0, 2).toUpperCase()
                      ) : "DV"
                    )}
                  </div>
                  <div className={`p-3 rounded-2xl min-w-0 shadow-xs transition-colors flex-1 border ${
                    isDark ? 'bg-[#17120f] border-[#231b15] hover:border-orange-500/10' : 'bg-white border-stone-200 hover:border-stone-300'
                  }`}>
                    <div className="flex items-center justify-between gap-2 flex-wrap mb-1">
                      <span className={`font-extrabold flex items-center gap-1.5 flex-wrap ${
                        isDark ? 'text-stone-100' : 'text-stone-850'
                      }`}>
                        {comment.author?.display_name || "Devotee"}
                        {comment.is_lyrics_submission && (
                          <Badge variant="outline" className="text-[7px] bg-emerald-500 text-white font-extrabold uppercase border-emerald-600 scale-90 px-1 py-0 select-none">
                            Lyrics Submission
                          </Badge>
                        )}
                      </span>
                      <span className={`text-[8px] font-semibold ${isDark ? 'text-stone-500' : 'text-stone-400'}`}>{formatTime(comment.created_at)}</span>
                    </div>
                    <p className={`text-xs whitespace-pre-wrap leading-relaxed break-words font-medium ${
                      isDark ? 'text-stone-300' : 'text-stone-600'
                    }`}>
                      {comment.content}
                    </p>
                    {user?.id === comment.author_id && (
                      <button 
                        onClick={() => onDeleteComment(post.id, comment.id)}
                        className="text-stone-500 hover:text-rose-500 font-bold text-[8px] mt-2 flex items-center gap-0.5 hover:underline transition-colors ml-auto"
                      >
                        <Trash2 className="w-3 h-3 inline" /> {isHi ? "हटाएं" : "Delete"}
                      </button>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Comment input form */}
          {user ? (
            <div className={`pt-2 border-t ${isDark ? 'border-[#231b15]' : 'border-stone-200'}`}>
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
                  className={`flex-1 text-xs rounded-xl p-2.5 focus:outline-none focus:border-orange-500 resize-none border ${
                    isDark ? 'border-orange-500/10 bg-[#130f0c] text-stone-200' : 'border-stone-200 bg-white text-stone-700'
                  }`}
                />
                <button
                  onClick={() => onAddComment(post.id)}
                  disabled={!newCommentText.trim()}
                  className="bg-orange-500 hover:bg-orange-600 disabled:opacity-50 text-white font-bold p-3 rounded-xl flex items-center justify-center hover:scale-98 transition-all shrink-0 w-11 h-11 self-end"
                >
                  <Send className="w-4 h-4 text-white" />
                </button>
              </div>

              {/* Special checkmark for Bhajan Request comments to submit as lyrics */}
              {post.type === 'bhajan_request' && post.request_status === 'open' && (
                <div className="flex items-center gap-2 text-left">
                  <input 
                    type="checkbox" 
                    id={`lyrics-submit-check-${post.id}`}
                    checked={commentIsLyricsSubmit}
                    onChange={(e) => setCommentIsLyricsSubmit(e.target.checked)}
                    className="w-3.5 h-3.5 accent-orange-500"
                  />
                  <label htmlFor={`lyrics-submit-check-${post.id}`} className="text-[10px] font-bold text-stone-400 cursor-pointer select-none">
                    Submit this comment as the Bhajan Lyrics (moves request to pending review)
                  </label>
                </div>
              )}
            </div>
          ) : (
            <p className="text-[10px] text-stone-500 text-center mt-2">
              Please log in to participate in the satsang conversation.
            </p>
          )}
        </div>
      )}
    </div>
  );
}

// Simple loader helper
function Loader2(props: any) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      <path d="M21 12a9 9 0 1 1-6.219-8.56" />
    </svg>
  );
}
