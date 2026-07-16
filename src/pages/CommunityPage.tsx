import { useState, useEffect, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Users, 
  Trophy, 
  Flame, 
  Flower2, 
  ChevronLeft, 
  ChevronRight,
  Plus, 
  Info, 
  Menu,
  Activity, 
  Award,
  Sparkles,
  TrendingUp,
  X,
  Check,
  Search,
  Lock,
  Globe,
  Copy,
  ArrowRight,
  Share2,
  ImagePlus,
  CheckCircle2,
  Trash2,
  Pencil,
  Shield,
  MessageSquare,
  Bell,
  Music,
  Calendar,
  Settings
} from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useDrawer } from "@/hooks/useDrawer";
import { useLanguage } from "@/hooks/useLanguage";
import { supabase } from "@/lib/supabaseClient";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { SEO } from "@/components/SEO";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";

import { 
  fetchGroups, 
  createGroup, 
  joinGroup, 
  leaveGroup, 
  joinGroupByInviteCode,
  fetchGroupRankings,
  type NaamSanghGroup,
  type GroupMember 
} from "@/lib/naamSangh/naamSanghApi";

// Deity banners for cards
import durgaImg from "@/assets/deities/durga.webp";
import ganeshImg from "@/assets/deities/ganesh.webp";
import hanumanImg from "@/assets/deities/hanuman.webp";
import krishnaImg from "@/assets/deities/krishna.webp";
import lakshmiImg from "@/assets/deities/lakshmi.webp";
import ramaImg from "@/assets/deities/rama.webp";
import saiBabaImg from "@/assets/deities/sai-baba.webp";
import shivaImg from "@/assets/deities/shiva.webp";
import hanumanHighQualityImg from "@/assets/deities/hanuman_high_quality.webp";
import shyamBackgroundImg from "./images/shyam_background_hd.webp";
import flowersImg from "./images/abhijit muhrat.webp";
import mandalaSvg from "./images/mandala.svg";
import communityFeaturesImg from "./images/community_features.png";

const DEITY_IMAGES = [
  { id: "rama", name: "Rama Ji", src: ramaImg },
  { id: "hanuman", name: "Hanuman Ji", src: hanumanImg },
  { id: "krishna", name: "Krishna Ji", src: krishnaImg },
  { id: "shiva", name: "Shiva Ji", src: shivaImg },
  { id: "ganesh", name: "Ganesh Ji", src: ganeshImg },
  { id: "durga", name: "Durga Ma", src: durgaImg },
  { id: "lakshmi", name: "Lakshmi Ma", src: lakshmiImg },
  { id: "sai-baba", name: "Sai Baba", src: saiBabaImg },
];

function getGroupImage(imageUrl: string | null) {
  if (!imageUrl) return hanumanHighQualityImg;
  const found = DEITY_IMAGES.find((d) => d.id === imageUrl || d.src.includes(imageUrl));
  return found ? found.src : hanumanHighQualityImg;
}

export default function CommunityPage() {
  const { user } = useAuth();
  const { toggleDrawer } = useDrawer();
  const { language } = useLanguage();
  const navigate = useNavigate();
  const isHi = language === "hi";

  // State variables
  const [groups, setGroups] = useState<NaamSanghGroup[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedTab, setSelectedTab] = useState("all");
  const [globalStats, setGlobalStats] = useState({
    devotees: 0,
    totalJaps: 0,
    groupCount: 0,
    bhajansCount: 0,
    eventsCount: 0,
  });

  // Modal Dialog states
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [leaderboardDialogOpen, setLeaderboardDialogOpen] = useState(false);
  const [selectedGroup, setSelectedGroup] = useState<NaamSanghGroup | null>(null);
  const [groupRankings, setGroupRankings] = useState<GroupMember[]>([]);
  const [loadingRankings, setLoadingRankings] = useState(false);

  // Join by Invite Code state
  const [inviteCodeInput, setInviteCodeInput] = useState("");
  const [joiningByCode, setJoiningByCode] = useState(false);

  // Form states
  const [groupName, setGroupName] = useState("");
  const [groupDesc, setGroupDesc] = useState("");
  const [groupTarget, setGroupTarget] = useState(100000);
  const [inviteCode, setInviteCode] = useState("");
  const [isInviteCodeManuallyEdited, setIsInviteCodeManuallyEdited] = useState(false);
  const [selectedImage, setSelectedImage] = useState("rama");
  const [isPublic, setIsPublic] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  // Success screen state
  const [createdGroupData, setCreatedGroupData] = useState<{id: string; name: string; inviteCode: string} | null>(null);
  // Custom group image upload
  const [customGroupImage, setCustomGroupImage] = useState<string | null>(null);
  const groupImageInputRef = useRef<HTMLInputElement | null>(null);

  const isNameUnique = groupName.trim()
    ? !groups.some((g) => g.name.trim().toLowerCase() === groupName.trim().toLowerCase())
    : null;



  // Load groups and global stats
  const loadData = async () => {
    try {
      setLoading(true);
      const fetched = await fetchGroups(user?.id);
      setGroups(fetched);

      // Compute stats
      const totalGroups = fetched.length;
      
      // Fetch total profiles count for devotees metric
      const { count: profileCount } = await supabase
        .from("user_profiles")
        .select("id", { count: "exact", head: true });

      // Fetch sum of chants from user_jap_totals
      const { data: japTotals } = await supabase
        .from("user_jap_totals")
        .select("total_chants");
      const realTotalJaps = (japTotals ?? []).reduce((sum, row) => sum + (Number(row.total_chants) || 0), 0);

      // Fetch total groups count
      const { count: groupsCount } = await supabase
        .from("groups")
        .select("id", { count: "exact", head: true });

      // Fetch total uploaded bhajans
      const { count: bhajansCount } = await supabase
        .from("user_uploads")
        .select("id", { count: "exact", head: true });

      // Fetch total events count
      const { count: eventsCount } = await supabase
        .from("community_posts")
        .select("id", { count: "exact", head: true })
        .eq("type", "event");

      setGlobalStats({
        devotees: profileCount ?? 0,
        totalJaps: realTotalJaps,
        groupCount: groupsCount ?? totalGroups ?? 0,
        bhajansCount: bhajansCount ?? 0,
        eventsCount: eventsCount ?? 0,
      });
    } catch (err) {
      console.error("Error loading community data:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [user?.id]);

  // Trigger invite code generation when group name changes
  useEffect(() => {
    if (!isInviteCodeManuallyEdited && groupName.trim()) {
      const prefix = groupName
        .trim()
        .replace(/[^a-zA-Z0-9]/g, "")
        .slice(0, 5)
        .toUpperCase();
      const randomNum = Math.floor(100 + Math.random() * 900);
      setInviteCode(prefix ? `${prefix}${randomNum}` : `COMMUNITY${randomNum}`);
    } else if (!groupName.trim()) {
      setInviteCode("");
    }
  }, [groupName, isInviteCodeManuallyEdited]);

  // Copy invite code to clipboard
  const copyInviteCode = (code: string) => {
    navigator.clipboard.writeText(code);
    toast.success(isHi ? "आमंत्रण कोड कॉपी किया गया!" : "Invite code copied to clipboard!");
  };

  // Join by Invite Code submit
  const handleJoinByCode = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      toast.info(isHi ? "कृपया समूह में शामिल होने के लिए लॉग इन करें" : "Please log in to join a Community group");
      navigate("/auth/login?redirect=/community");
      return;
    }

    if (!inviteCodeInput.trim()) {
      toast.error(isHi ? "कृपया आमंत्रण कोड दर्ज करें" : "Please enter an invite code");
      return;
    }

    try {
      setJoiningByCode(true);
      const joinedGroup = await joinGroupByInviteCode(inviteCodeInput.trim(), user.id);
      toast.success(
        isHi 
          ? `सफलतापूर्वक ${joinedGroup.name} में शामिल हो गए!` 
          : `Successfully joined ${joinedGroup.name}!`
      );
      setInviteCodeInput("");
      loadData();
    } catch (err: any) {
      console.error("Error joining group by invite code:", err);
      toast.error(
        isHi 
          ? "इस कोड के साथ कोई समूह नहीं मिला या आप पहले से सदस्य हैं" 
          : err.message || "Failed to join group. Please check the code."
      );
    } finally {
      setJoiningByCode(false);
    }
  };

  // Handle Join / Leave Group
  const handleGroupMembership = async (group: NaamSanghGroup) => {
    if (!user) {
      toast.info(
        isHi
          ? "कृपया समूह में शामिल होने के लिए लॉग इन करें"
          : "Please log in to join a Community group"
      );
      navigate("/auth/login?redirect=/community");
      return;
    }

    try {
      if (group.is_member) {
        await leaveGroup(group.id, user.id);
        toast.success(
          isHi 
            ? `आप ${group.name} से बाहर आ गए हैं` 
            : `You left ${group.name}`
        );
      } else {
        await joinGroup(group.id, user.id);
        toast.success(
          isHi 
            ? `आप ${group.name} में शामिल हो गए हैं!` 
            : `Joined ${group.name} successfully!`
        );
      }
      loadData();
    } catch (err) {
      console.error("Error toggling group membership:", err);
      toast.error(isHi ? "प्रक्रिया पूरी करने में त्रुटि हुई" : "Failed to update membership");
    }
  };

  // View Group Leaderboard
  const handleOpenLeaderboard = async (group: NaamSanghGroup) => {
    setSelectedGroup(group);
    setLeaderboardDialogOpen(true);
    setLoadingRankings(true);
    try {
      const rankings = await fetchGroupRankings(group.id);
      setGroupRankings(rankings);
    } catch (err) {
      console.error("Error loading rankings:", err);
    } finally {
      setLoadingRankings(false);
    }
  };

  // Handle Create Group Form Submit
  const handleCreateGroup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      toast.info(isHi ? "कृपया समूह बनाने के लिए लॉग इन करें" : "Please log in to create a group");
      navigate("/auth/login?redirect=/community");
      return;
    }

    if (!groupName.trim()) {
      toast.error(isHi ? "कृपया समूह का नाम दर्ज करें" : "Group name is required");
      return;
    }

    if (!inviteCode.trim()) {
      toast.error(isHi ? "कृपया आमंत्रण कोड दर्ज करें" : "Invite code is required");
      return;
    }

    try {
      setSubmitting(true);
      const result = await createGroup({
        name: groupName.trim(),
        description: groupDesc.trim(),
        targetCount: Number(groupTarget),
        createdBy: user.id,
        inviteCode: inviteCode.trim().toUpperCase(),
        imageUrl: customGroupImage || selectedImage,
        isPublic: isPublic,
      });

      // Show success screen instead of closing immediately
      setCreatedGroupData({
        id: result?.id || "",
        name: groupName.trim(),
        inviteCode: inviteCode.trim().toUpperCase(),
      });
      loadData();
    } catch (err: any) {
      console.error("Error creating group:", err);
      toast.error(
        err.message?.includes("unique") || err.message?.includes("duplicate")
          ? (isHi ? "यह आमंत्रण कोड पहले से किसी अन्य समूह द्वारा उपयोग में है" : "This invite code is already taken")
          : (isHi ? "समूह बनाने में विफल" : "Failed to create group")
      );
    } finally {
      setSubmitting(false);
    }
  };

  // Reset create dialog fully
  const closeCreateDialog = () => {
    setCreateDialogOpen(false);
    setCreatedGroupData(null);
    setGroupName("");
    setGroupDesc("");
    setGroupTarget(100000);
    setInviteCode("");
    setSelectedImage("rama");
    setIsPublic(true);
    setIsInviteCodeManuallyEdited(false);
    setCustomGroupImage(null);
  };

  // WhatsApp share
  const shareOnWhatsApp = (code: string, name: string) => {
    const joinUrl = `${window.location.origin}/community?join=${code}`;
    const msg = isHi
      ? `🙏 मेरे समूह "${name}" में शामिल हों! कोड: *${code}*\n👉 ${joinUrl}`
      : `🙏 Join my Community "${name}"! Code: *${code}*\n👉 ${joinUrl}`;
    window.open(`https://wa.me/?text=${encodeURIComponent(msg)}`, "_blank");
  };

  // Handle custom group image file
  const handleGroupImageFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => setCustomGroupImage(ev.target?.result as string);
    reader.readAsDataURL(file);
  };

  const featuredGroup = groups.find(g => g.is_member) || groups[0] || null;

  const getDeityTag = (imageUrl: string | null) => {
    if (!imageUrl) return isHi ? "जय श्री राम 🙏" : "Jai Shree Ram 🙏";
    const key = imageUrl.toLowerCase();
    if (key.includes("rama")) return isHi ? "जय श्री राम 🙏" : "Jai Shree Ram 🙏";
    if (key.includes("hanuman")) return isHi ? "जय श्री हनुमान 🙏" : "Jai Shree Hanuman 🙏";
    if (key.includes("krishna")) return isHi ? "जय श्री कृष्णा 🙏" : "Jai Shree Krishna 🙏";
    if (key.includes("shiva")) return isHi ? "हर हर महादेव 🙏" : "Har Har Mahadev 🙏";
    if (key.includes("ganesh")) return isHi ? "जय श्री गणेश 🙏" : "Jai Shree Ganesh 🙏";
    if (key.includes("durga")) return isHi ? "जय माता दी 🙏" : "Jai Mata Di 🙏";
    return isHi ? "जय श्री राम 🙏" : "Jai Shree Ram 🙏";
  };

  const filteredGroups = groups.filter(g => {
    if (!g.is_public && !g.is_member) return false;
    
    // Tab filter
    if (selectedTab === "my") {
      if (!g.is_member) return false;
    } else if (selectedTab === "trending") {
      if ((g.member_count || 0) < 5) return false;
    } else if (selectedTab === "japa") {
      if (!g.total_chants || g.total_chants === 0) return false;
    }

    // Search query filter
    const query = searchQuery.toLowerCase().trim();
    if (!query) return true;
    return (
      g.name.toLowerCase().includes(query) ||
      (g.description && g.description.toLowerCase().includes(query)) ||
      g.invite_code.toLowerCase().includes(query)
    );
  });

  return (
    <div className="min-h-screen bg-[#fdfbf7] dark:bg-[#0c0a08] text-stone-900 dark:text-stone-100 transition-colors pb-16">
      <SEO 
        title={isHi ? "समूह - राघवन" : "Community - Raghavam"}
        description={isHi ? "अपना समूह बनाएं, परिवार और मित्रों के साथ सामूहिक नाम जाप करें और भक्ति पथ पर आगे बढ़ें।" : "Create your community, chant together with family and friends and grow spiritually."}
      />

      {/* ─── HEADER BAR ────────────────────────────────────────── */}
      <header className="md:hidden sticky top-0 z-30 bg-[#fdfbf7]/90 dark:bg-[#0c0a08]/90 backdrop-blur-md border-b border-amber-500/10 px-4 py-3.5 flex items-center justify-between">
        <div className="flex items-center gap-3">
          {/* Mobile Hamburger menu */}
          <button
            onClick={toggleDrawer}
            className="w-10 h-10 rounded-full border border-amber-500/20 bg-amber-50/40 dark:bg-stone-900/40 hover:bg-amber-100/50 dark:hover:bg-stone-850 flex items-center justify-center text-amber-600 dark:text-amber-400 active:scale-95 transition-all shrink-0"
            aria-label="Menu"
          >
            <Menu className="w-5 h-5" />
          </button>
          
          <span className="font-display text-lg font-extrabold tracking-tight text-amber-900 dark:text-amber-100">
            {isHi ? "समुदाय" : "Community"}
          </span>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => navigate("/notifications")}
            className="relative text-stone-600 dark:text-stone-300 hover:text-orange-500 active:scale-95 transition-all p-1.5"
            title={isHi ? "सूचनाएं" : "Notifications"}
          >
            <Bell className="w-4.5 h-4.5" />
            <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full border border-white dark:border-stone-900" />
          </button>

          {/* My Groups button */}
          <button
            onClick={() => {
              if (!user) {
                toast.info(isHi ? "कृपया अपने समूह देखने के लिए लॉग इन करें" : "Please log in to view your groups");
                navigate("/auth/login?redirect=/community");
              } else {
                setSelectedTab("my");
                const el = document.getElementById("groups-filter-tabs");
                if (el) {
                  el.scrollIntoView({ behavior: "smooth" });
                }
              }
            }}
            className="inline-flex items-center gap-1 bg-[#5c1d0c] hover:bg-[#4a170a] text-white font-bold px-2.5 py-1.5 rounded-xl text-[10px] active:scale-95 transition-all shadow-sm shrink-0 border border-orange-500/5 cursor-pointer"
          >
            <Users className="w-3 h-3 text-orange-400" />
            {isHi ? "मेरे समूह" : "My Groups"}
          </button>

          {/* Create Group button */}
          <button
            onClick={() => {
              if (!user) {
                toast.info(isHi ? "कृपया समूह बनाने के लिए लॉग इन करें" : "Please log in to create a group");
                navigate("/auth/login?redirect=/community");
              } else {
                setCreateDialogOpen(true);
              }
            }}
            className="inline-flex items-center gap-1 bg-[#5c1d0c] hover:bg-[#4a170a] text-white font-bold px-2.5 py-1.5 rounded-xl text-[10px] active:scale-95 transition-all shadow-sm shrink-0 border border-orange-500/5 cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            {isHi ? "समूह बनाएं" : "Create Group"}
          </button>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 mt-6 space-y-6">
         {/* ─── PREMIUM DEVOTIONAL HERO BANNER ────────────────────── */}
        <div 
          className="relative w-full rounded-[2rem] overflow-hidden shadow-lg border border-orange-500/15 p-2 md:p-10 flex flex-col justify-center text-center bg-no-repeat bg-cover bg-center aspect-[16/9] md:aspect-auto min-h-0 md:min-h-[480px]"
          style={{ backgroundImage: `url(${shyamBackgroundImg})` }}
        >
          {/* Golden Lotus & Heading Section with Glassmorphism */}
          <div className="relative z-10 space-y-1.5 md:space-y-4 mt-0 md:mt-6 bg-transparent md:bg-white/10 md:dark:bg-black/15 md:backdrop-blur-md md:border md:border-white/15 md:dark:border-white/5 rounded-3xl p-1 md:p-7 w-full max-w-[280px] md:max-w-2xl text-center mx-auto shadow-none md:shadow-md overflow-hidden">
            {/* Spinning Mandala Watermark */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none opacity-[0.06] dark:opacity-[0.04] flex items-center justify-center -z-10">
              <img src={mandalaSvg} className="w-[120px] h-[120px] md:w-[320px] md:h-[320px] animate-[spin_120s_linear_infinite]" alt="mandala" />
            </div>

            {/* Lotus Flower Image at the top */}
            <div className="flex justify-center">
              <img 
                src={flowersImg} 
                className="w-10 h-10 md:w-16 md:h-16 object-contain filter drop-shadow-[0_4px_8px_rgba(217,119,6,0.2)]" 
                alt="Lotus Flower" 
              />
            </div>

            <p className="text-[10px] md:text-sm font-bold text-[#5c1d0c] tracking-widest uppercase flex items-center justify-center gap-1.5">
              <span>—</span> {isHi ? "आइए जुड़ें" : "Come Join"} <span>—</span>
            </p>
            
            <h1 className="font-display text-sm md:text-4xl font-black text-[#5c1d0c] dark:text-amber-100 leading-tight">
              {isHi ? "भक्ति के इस पावन परिवार से" : "In This Holy Family of Devotion"}
            </h1>
            
            <div className="text-[#7c2d12] dark:text-amber-200 font-semibold space-y-0.5 md:space-y-1.5 max-w-lg mx-auto leading-normal md:leading-relaxed">
              <p className="text-[9px] md:text-base">
                {isHi 
                  ? "यहाँ मिलती है भक्ति, संगत और सेवा की भावना।" 
                  : "Here you find devotion, company, and the spirit of service."}
              </p>
              <p className="text-[8px] md:text-sm text-[#7c2d12] dark:text-amber-200 font-medium">
                {isHi 
                  ? "आइए, साथ मिलकर भजन गाएँ, नाम जपें और भक्ति का आनंद बांटें।" 
                  : "Come, sing bhajans together, chant holy names, and share the joy of devotion."}
              </p>
            </div>

            {/* Button */}
            <div className="flex justify-center pt-1 md:pt-2">
              <button
                onClick={() => navigate("/join-community")}
                className="inline-flex items-center gap-1 bg-[#5c1d0c] hover:bg-[#4a170a] text-white md:text-[#fef3c7] font-bold px-4 py-1.5 md:px-7 md:py-2.5 rounded-full text-[10px] md:text-sm border border-orange-500/10 md:border-[#d97706]/40 active:scale-95 transition-all shadow-md cursor-pointer"
              >
                <Users className="w-3 h-3 md:w-4 md:h-4 text-orange-400" />
                {isHi ? "समुदाय से जुड़ें" : "Join Community"}
              </button>
            </div>
          </div>
        </div>

        {/* ─── QUICK ACTIONS CARDS GRID ───────────────────────────── */}
        <div className="flex md:grid md:grid-cols-4 gap-4 overflow-x-auto md:overflow-visible pb-2 md:pb-0 snap-x w-full" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
          {/* Card 1: Invite Friends */}
          <div 
            onClick={() => {
              // Copy community invite link
              navigator.clipboard.writeText(window.location.origin + "/community");
              toast.success(isHi ? "समुदाय आमंत्रण लिंक कॉपी किया गया!" : "Community invite link copied!");
            }}
            className="w-[150px] md:w-auto shrink-0 snap-start bg-[#faf8f5] dark:bg-stone-900/50 border border-orange-500/10 hover:border-orange-500/20 rounded-2xl p-4 text-center cursor-pointer transition-all active:scale-95 flex flex-col justify-between"
          >
            <div className="w-10 h-10 rounded-full bg-orange-100 dark:bg-stone-850 text-orange-600 flex items-center justify-center mx-auto mb-2.5 shrink-0">
              <Users className="w-5 h-5" />
            </div>
            <h3 className="text-xs font-bold text-stone-900 dark:text-amber-100">
              {isHi ? "मित्र आमंत्रित करें" : "Invite Friends"}
            </h3>
            <p className="text-[9px] text-stone-500 dark:text-stone-400 mt-1 leading-normal font-semibold">
              {isHi ? "मित्रों को समुदाय में आमंत्रित करें" : "Invite friends to the community"}
            </p>
          </div>

          {/* Card 2: Upload Bhajan */}
          <div 
            onClick={() => navigate("/upload-bhajan")}
            className="w-[150px] md:w-auto shrink-0 snap-start bg-[#faf8f5] dark:bg-stone-900/50 border border-orange-500/10 hover:border-orange-500/20 rounded-2xl p-4 text-center cursor-pointer transition-all active:scale-95 flex flex-col justify-between"
          >
            <div className="w-10 h-10 rounded-full bg-rose-100 dark:bg-rose-950/20 text-rose-600 flex items-center justify-center mx-auto mb-2.5 shrink-0">
              <Music className="w-5 h-5" />
            </div>
            <h3 className="text-xs font-bold text-stone-900 dark:text-amber-100">
              {isHi ? "भजन अपलोड करें" : "Upload Bhajans"}
            </h3>
            <p className="text-[9px] text-stone-500 dark:text-stone-400 mt-1 leading-normal font-semibold">
              {isHi ? "अपने भजन अपलोड करें और साझा करें" : "Upload your bhajans and share with all"}
            </p>
          </div>

          {/* Card 3: Start Japa */}
          <div 
            onClick={() => navigate("/meditation")}
            className="w-[150px] md:w-auto shrink-0 snap-start bg-[#faf8f5] dark:bg-stone-900/50 border border-orange-500/10 hover:border-orange-500/20 rounded-2xl p-4 text-center cursor-pointer transition-all active:scale-95 flex flex-col justify-between"
          >
            <div className="w-10 h-10 rounded-full bg-emerald-100 dark:bg-emerald-950/20 text-emerald-600 flex items-center justify-center mx-auto mb-2.5 shrink-0">
              <Flame className="w-5 h-5 fill-emerald-500/10" />
            </div>
            <h3 className="text-xs font-bold text-stone-900 dark:text-amber-100">
              {isHi ? "नाम जप प्रारंभ करें" : "Start Japa"}
            </h3>
            <p className="text-[9px] text-stone-500 dark:text-stone-400 mt-1 leading-normal font-semibold">
              {isHi ? "नाम जप समूह बनाएं और साथ मिलकर जप करें" : "Create a name japa group and chant together"}
            </p>
          </div>

          {/* Card 4: Satsang & Events */}
          <div 
            onClick={() => setCreateDialogOpen(true)}
            className="w-[150px] md:w-auto shrink-0 snap-start bg-[#faf8f5] dark:bg-stone-900/50 border border-orange-500/10 hover:border-orange-500/20 rounded-2xl p-4 text-center cursor-pointer transition-all active:scale-95 flex flex-col justify-between"
          >
            <div className="w-10 h-10 rounded-full bg-amber-100 dark:bg-amber-950/20 text-amber-600 flex items-center justify-center mx-auto mb-2.5 shrink-0">
              <svg viewBox="0 0 24 24" className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 2L2 7h20L12 2z" />
                <path d="M4 7v10h16V7H4z" />
              </svg>
            </div>
            <h3 className="text-xs font-bold text-stone-900 dark:text-amber-100">
              {isHi ? "सत्संग आयोजित करें" : "Organize Satsang"}
            </h3>
            <p className="text-[9px] text-stone-500 dark:text-stone-400 mt-1 leading-normal font-semibold">
              {isHi ? "ऑनलाइन या ऑफ़लाइन सत्संग आयोजित करें" : "Organize online or offline devotional meetups"}
            </p>
          </div>
        </div>

        {/* ─── STATISTICS PANEL ─────────────────────────────────── */}
        <div className="w-full bg-[#fefaf0]/95 dark:bg-stone-900/95 border border-orange-500/10 rounded-2xl p-4 flex flex-row justify-around shadow-sm divide-x divide-orange-500/10">
          {/* Stat 1 */}
          <div className="flex flex-col items-center justify-center px-1 text-center flex-1">
            <div className="flex items-center gap-1.5 justify-center mb-0.5">
              <Users className="w-4.5 h-4.5 text-orange-600 shrink-0" />
              <span className="text-xs md:text-sm font-black text-stone-950 dark:text-stone-50 leading-none">
                {globalStats.devotees >= 1000 ? `${(globalStats.devotees / 1000).toFixed(1)}K+` : globalStats.devotees}
              </span>
            </div>
            <span className="text-[8.5px] md:text-[10px] text-stone-500 dark:text-stone-400 font-bold leading-none mt-0.5">
              {isHi ? "भक्त जुड़ चुके हैं" : "Devotees Joined"}
            </span>
          </div>

          {/* Stat 2 */}
          <div className="flex flex-col items-center justify-center px-1 text-center flex-1">
            <div className="flex items-center gap-1.5 justify-center mb-0.5">
              <Flame className="w-4.5 h-4.5 text-orange-650 fill-orange-500/15 shrink-0" />
              <span className="text-xs md:text-sm font-black text-stone-950 dark:text-stone-50 leading-none">
                {globalStats.totalJaps >= 10000000 
                  ? `${(globalStats.totalJaps / 10000000).toFixed(1)}Cr+`
                  : globalStats.totalJaps >= 100000 
                  ? `${(globalStats.totalJaps / 100000).toFixed(1)}L+`
                  : globalStats.totalJaps.toLocaleString()}
              </span>
            </div>
            <span className="text-[8.5px] md:text-[10px] text-stone-500 dark:text-stone-400 font-bold leading-none mt-0.5">
              {isHi ? "नाम जप" : "Name Chanting"}
            </span>
          </div>

          {/* Stat 3 */}
          <div className="flex flex-col items-center justify-center px-1 text-center flex-1">
            <div className="flex items-center gap-1.5 justify-center mb-0.5">
              <Music className="w-4.5 h-4.5 text-orange-650 shrink-0" />
              <span className="text-xs md:text-sm font-black text-stone-950 dark:text-stone-50 leading-none">
                {globalStats.bhajansCount}
              </span>
            </div>
            <span className="text-[8.5px] md:text-[10px] text-stone-500 dark:text-stone-400 font-bold leading-none mt-0.5">
              {isHi ? "भजन साझा हुए" : "Bhajans Shared"}
            </span>
          </div>

          {/* Stat 4 */}
          <div className="flex flex-col items-center justify-center px-1 text-center flex-1">
            <div className="flex items-center gap-1.5 justify-center mb-0.5">
              <svg viewBox="0 0 24 24" className="w-4.5 h-4.5 text-orange-650 shrink-0" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M12 2L2 7h20L12 2z" />
                <path d="M4 7v10h16V7H4z" />
              </svg>
              <span className="text-xs md:text-sm font-black text-stone-950 dark:text-stone-50 leading-none">
                {globalStats.eventsCount}
              </span>
            </div>
            <span className="text-[8.5px] md:text-[10px] text-stone-500 dark:text-stone-400 font-bold leading-none mt-0.5">
              {isHi ? "सत्संग एवं आयोजन" : "Satsang & Events"}
            </span>
          </div>
        </div>

        {/* ─── POPULAR TOPICS SECTION ───────────────────────────── */}
        <div className="w-full text-left mt-6">
          <div className="flex items-center justify-between mb-3.5">
            <div className="flex items-center gap-1.5">
              <span className="text-base">🔥</span>
              <h2 className="font-display text-base md:text-lg font-bold text-stone-900 dark:text-amber-50">
                {isHi ? "आज के लोकप्रिय विषय" : "Popular Topics Today"}
              </h2>
            </div>
            <button
              onClick={() => navigate("/join-community")}
              className="text-xs font-extrabold text-orange-650 dark:text-orange-400 hover:underline flex items-center gap-0.5"
            >
              {isHi ? "सभी देखें" : "View All"} <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div 
            className="flex gap-4 overflow-x-auto pb-3 snap-x scroll-smooth w-full"
            style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
          >
            {[
              {
                title: isHi ? "राम नवमी" : "Ram Navami",
                devotees: "12.5K",
                image: ramaImg,
              },
              {
                title: isHi ? "हनुमान चालीसा" : "Hanuman Chalisa",
                devotees: "8.2K",
                image: hanumanHighQualityImg,
              },
              {
                title: isHi ? "खाटू श्याम भजन" : "Khatu Shyam Bhajan",
                devotees: "6.7K",
                image: shyamBackgroundImg,
              },
              {
                title: isHi ? "सावन विशेष" : "Sawan Special",
                devotees: "5.1K",
                image: shivaImg,
              },
            ].map((topic, i) => (
              <div 
                key={i}
                className="w-[140px] shrink-0 snap-start rounded-2xl overflow-hidden aspect-[3/4] relative shadow-xs border border-orange-500/5 cursor-pointer hover:scale-[1.02] active:scale-[0.98] transition-all"
                onClick={() => navigate(`/search?q=${encodeURIComponent(topic.title)}`)}
              >
                <img src={topic.image} className="w-full h-full object-cover filter brightness-[0.92]" alt={topic.title} />
                <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/30 to-transparent" />
                
                {/* Trending icon top right */}
                <div className="absolute top-2.5 right-2.5 w-6 h-6 rounded-full bg-black/40 backdrop-blur-xs flex items-center justify-center text-orange-400">
                  <svg viewBox="0 0 24 24" className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <line x1="18" y1="20" x2="18" y2="10" />
                    <line x1="12" y1="20" x2="12" y2="4" />
                    <line x1="6" y1="20" x2="6" y2="14" />
                  </svg>
                </div>

                <div className="absolute bottom-3 left-3 right-3 text-left">
                  <h3 className="text-xs font-black text-white leading-tight line-clamp-1">{topic.title}</h3>
                  <p className="text-[9px] text-orange-300 font-bold mt-0.5">{topic.devotees} {isHi ? "भक्त" : "devotees"}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* ─── SEARCH INPUT BAR & FILTER TABS ────────────────────── */}
        <div id="groups-filter-tabs" className="w-full space-y-4">
          <div className="relative flex items-center rounded-2xl bg-white dark:bg-stone-900 border border-[#5c1d0c]/10 shadow-xs px-3.5 py-1 focus-within:border-[#5c1d0c] focus-within:ring-2 focus-within:ring-[#5c1d0c]/10 transition-all">
            <Search className="w-5 h-5 text-stone-450 dark:text-stone-500 mr-2" />
            <input
              type="text"
              placeholder={isHi ? "नाम या समूह खोजें..." : "Search name or group..."}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="flex-1 bg-transparent border-none py-2.5 text-sm focus:outline-none text-stone-900 dark:text-stone-100"
            />
            <button
              onClick={() => {}}
              className="w-8.5 h-8.5 rounded-xl bg-[#5c1d0c] hover:bg-[#4a170a] flex items-center justify-center text-white active:scale-95 transition-all"
            >
              <Search className="w-4 h-4 text-white" />
            </button>
          </div>

          {/* Filter tabs row scrollable */}
          <div className="w-full flex items-center gap-2 overflow-x-auto pb-1 mt-4 scroll-smooth" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
            <button
              onClick={() => setSelectedTab("all")}
              className={`px-4 py-2 rounded-full text-xs font-extrabold shrink-0 border transition-all ${
                selectedTab === "all"
                  ? "bg-[#5c1d0c] border-[#5c1d0c] text-white shadow-xs"
                  : "bg-[#faf8f5] dark:bg-stone-900 border-[#5c1d0c]/10 text-stone-600 dark:text-stone-400 hover:border-[#5c1d0c]/20"
              }`}
            >
              {isHi ? "सभी समूह" : "All Groups"}
            </button>

            <button
              onClick={() => {
                if (!user) {
                  toast.info(isHi ? "कृपया अपने समूह देखने के लिए लॉग इन करें" : "Please log in to view your groups");
                  navigate("/auth/login?redirect=/community");
                } else {
                  setSelectedTab("my");
                }
              }}
              className={`px-4 py-2 rounded-full text-xs font-extrabold shrink-0 border transition-all ${
                selectedTab === "my"
                  ? "bg-[#5c1d0c] border-[#5c1d0c] text-white shadow-xs"
                  : "bg-[#faf8f5] dark:bg-stone-900 border-[#5c1d0c]/10 text-stone-600 dark:text-stone-400 hover:border-[#5c1d0c]/20"
              }`}
            >
              {isHi ? "मेरे समूह" : "My Groups"}
            </button>

            <button
              onClick={() => setSelectedTab("trending")}
              className={`px-4 py-2 rounded-full text-xs font-extrabold shrink-0 border transition-all ${
                selectedTab === "trending"
                  ? "bg-[#5c1d0c] border-[#5c1d0c] text-white shadow-xs"
                  : "bg-[#faf8f5] dark:bg-stone-900 border-[#5c1d0c]/10 text-stone-600 dark:text-stone-400 hover:border-[#5c1d0c]/20"
              }`}
            >
              {isHi ? "ट्रेंडिंग" : "Trending"}
            </button>

            <button
              onClick={() => setSelectedTab("japa")}
              className={`px-4 py-2 rounded-full text-xs font-extrabold shrink-0 border transition-all ${
                selectedTab === "japa"
                  ? "bg-[#5c1d0c] border-[#5c1d0c] text-white shadow-xs"
                  : "bg-[#faf8f5] dark:bg-stone-900 border-[#5c1d0c]/10 text-stone-600 dark:text-stone-400 hover:border-[#5c1d0c]/20"
              }`}
            >
              {isHi ? "नाम जप समूह" : "Naam Jap Groups"}
            </button>

            <button
              className="w-9 h-9 rounded-full bg-[#faf8f5] dark:bg-stone-900 border border-[#5c1d0c]/10 flex items-center justify-center text-stone-600 dark:text-stone-400 shrink-0 hover:border-[#5c1d0c]/20"
              aria-label="Filter"
            >
              <svg viewBox="0 0 24 24" className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3" />
              </svg>
            </button>
          </div>
        </div>

        {/* ─── ACTIVE GROUPS SECTION ────────────────────────────── */}
        <div className="w-full text-left">
          <div className="flex items-center justify-between mb-3.5">
            <h2 className="font-display text-lg font-bold text-stone-900 dark:text-amber-50">
              {isHi ? "सक्रिय नाम संघ" : "Active Naam Sangh"}
            </h2>
            <button
              onClick={() => navigate("/join-community")}
              className="text-xs font-bold text-orange-600 dark:text-orange-400 hover:underline flex items-center gap-0.5"
            >
              {isHi ? "सभी देखें" : "View All"} <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div
            className="flex gap-4 overflow-x-auto pb-4 pt-1 snap-x scroll-smooth w-full"
            style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
          >
            {filteredGroups.length === 0 && !loading ? (
              <div className="w-full py-12 text-center text-stone-500 dark:text-stone-400 bg-white dark:bg-stone-900/30 rounded-2xl border border-dashed border-orange-500/15">
                <span className="text-2xl mb-1.5 block">📿</span>
                <p className="font-semibold text-xs">
                  {isHi ? "कोई सक्रिय समूह नहीं मिला।" : "No active groups found."}
                </p>
              </div>
            ) : (
              filteredGroups.map((group) => {
                const isActiveBadge = (group.member_count || 0) >= 5 || (group.total_chants || 0) > 0;
                
                const formatGroupChants = (chants: number) => {
                  if (!chants) return isHi ? "0 जप" : "0 chants";
                  if (chants >= 10000000) return `${(chants / 10000000).toFixed(1)} ${isHi ? "करोड़" : "Cr"}`;
                  if (chants >= 100000) return `${(chants / 100000).toFixed(1)} ${isHi ? "लाख" : "Lakh"}`;
                  if (chants >= 1000) return `${(chants / 1000).toFixed(1)}K`;
                  return chants.toString();
                };

                return (
                  <div
                    key={group.id}
                    className="w-[240px] shrink-0 snap-start bg-white dark:bg-stone-900 border border-orange-500/10 rounded-3xl overflow-hidden shadow-xs flex flex-col justify-between"
                  >
                    {/* Header banner image */}
                    <div className="h-36 w-full relative overflow-hidden bg-orange-50 dark:bg-stone-950 flex items-center justify-center">
                      <img
                        src={getGroupImage(group.image_url)}
                        alt={group.name}
                        className="w-full h-full object-cover opacity-95"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/15" />
                      
                      {/* Star Icon Top Left */}
                      <span className="absolute top-2.5 left-2.5 w-6 h-6 rounded-full bg-orange-500/80 backdrop-blur-xs flex items-center justify-center text-white text-xs">
                        ★
                      </span>

                      {/* Active/New/Trending Badge Top Right */}
                      <span className={`absolute top-2.5 right-2.5 text-[9px] font-extrabold px-2 py-0.5 rounded-full text-white flex items-center gap-1 shadow-xs ${
                        isActiveBadge 
                          ? (group.member_count || 0) >= 10 ? "bg-rose-600/90" : "bg-emerald-600/90" 
                          : "bg-blue-600/90"
                      }`}>
                        {isActiveBadge 
                          ? (group.member_count || 0) >= 10 ? (isHi ? "ट्रेंडिंग" : "Trending") : (isHi ? "सक्रिय" : "Active") 
                          : (isHi ? "नया" : "New")}
                      </span>

                      {/* Avatar stack overlapping the bottom-left of the image */}
                      <div className="absolute bottom-2.5 left-2.5 flex -space-x-1.5 z-10">
                        {[...Array(Math.min(3, group.member_count || 1))].map((_, idx) => (
                          <div
                            key={idx}
                            className="w-6 h-6 rounded-full bg-amber-100 border border-white dark:border-stone-900 flex items-center justify-center font-bold text-[8px] text-[#7c2d12] shadow-xs"
                          >
                            {String.fromCharCode(65 + idx)}
                          </div>
                        ))}
                        {(group.member_count || 0) > 3 && (
                          <div className="w-6 h-6 rounded-full bg-orange-100 dark:bg-stone-800 border border-white dark:border-stone-900 flex items-center justify-center font-extrabold text-[8px] text-orange-700 dark:text-orange-400 shadow-xs">
                            +{(group.member_count || 0) - 3}
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Content Section */}
                    <div className="p-4 flex-1 flex flex-col justify-between space-y-3 relative overflow-hidden">
                      {/* Non-animated Mandala Watermark Background in Cards */}
                      <div className="absolute -right-6 -bottom-6 w-20 h-20 pointer-events-none opacity-[0.06] dark:opacity-[0.04] flex items-center justify-center -z-0">
                        <img src={mandalaSvg} className="w-full h-full object-contain" alt="mandala watermark" />
                      </div>

                      <div className="relative z-10">
                        <h3 className="font-display text-sm font-black text-stone-900 dark:text-amber-100 leading-snug line-clamp-1 text-left">
                          {group.name}
                        </h3>
                        <p className="text-[10px] text-stone-500 dark:text-stone-400 font-semibold mt-1 text-left">
                          {group.member_count || 0} {isHi ? "सदस्य" : "members"} • {isHi ? "2 मिनट पहले सक्रिय" : "active 2m ago"}
                        </p>

                        {/* Japa Stats with Flame icon */}
                        <div className="text-[10px] text-stone-600 dark:text-stone-400 font-bold flex items-center gap-1 mt-2.5 border-t border-orange-500/5 pt-2 text-left">
                          <span>🔥</span>
                          <span>
                            {isHi ? "आज का नाम जप" : "Today's Japa"}: <span className="text-orange-600 dark:text-orange-400 font-black">{formatGroupChants(group.total_chants || (group.id.charCodeAt(0) % 5 + 1) * 10000)}</span>
                          </span>
                        </div>
                      </div>

                      {/* Full-width Action button */}
                      <button
                        onClick={() => handleGroupMembership(group)}
                        className={`w-full mt-2 py-2 rounded-xl text-xs font-black transition-all flex items-center justify-center gap-1 ${
                          group.is_member
                            ? "bg-stone-50 dark:bg-stone-900/50 text-[#5c1d0c] dark:text-amber-100 border border-[#5c1d0c]/15"
                            : "bg-[#5c1d0c] text-white hover:bg-[#4a170a] shadow-xs active:scale-[0.98]"
                        }`}
                      >
                        {group.is_member ? (
                          <span>{isHi ? "शामिल हैं ✓" : "Joined ✓"}</span>
                        ) : (
                          <span>{isHi ? "जुड़ें" : "Join"}</span>
                        )}
                      </button>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* ─── QUOTE BLOCK ───────────────────────────────────────── */}
        <div className="relative w-full rounded-2xl bg-[#FAF6EE] dark:bg-stone-900/30 border border-orange-500/15 p-5 max-w-xl mx-auto text-center shadow-xxs">
          <span className="absolute top-2 left-3 font-serif text-3xl text-orange-500/20 leading-none select-none">❝</span>
          <p className="text-xs md:text-sm font-semibold text-[#7c2d12] dark:text-amber-250 italic px-4 py-1 leading-relaxed">
            {isHi 
              ? "भक्ति भाव से की गई साधना ही जीवन का सच्चा उद्देश्य प्रदान करती है।" 
              : "Devotional practice done with a pure heart provides the true purpose of life."}
          </p>
          <p className="text-[10px] font-bold text-orange-600 dark:text-orange-400 mt-2">
            {isHi ? "– हनुमान चालीसा" : "– Hanuman Chalisa"}
          </p>
          <span className="absolute bottom-1 right-3 font-serif text-3xl text-orange-500/20 leading-none select-none">❞</span>
        </div>

        {/* Info Note Footer */}
        <div className="w-full mt-4 flex items-center gap-2.5 justify-center p-3 rounded-2xl bg-amber-500/5 border border-amber-500/10 text-[10px] text-amber-800 dark:text-amber-400 font-semibold max-w-md mx-auto text-left">
          <Info className="w-4 h-4 shrink-0 text-amber-600 dark:text-amber-400" />
          <span>
            {isHi
              ? "7 दिनों तक कोई गतिविधि (पोस्ट या जाप) न होने पर समूह को स्वतः संग्रहीत किया जा सकता है।"
              : "Groups with no activity (posts or chants) for 7 days may be automatically archived."}
          </span>
        </div>

      </div>

      {/* ─── CREATE GROUP DIALOG ─────────────────────────────────── */}
      <Dialog open={createDialogOpen} onOpenChange={(o) => { if (!o) closeCreateDialog(); }}>
        <DialogContent className="max-w-md md:max-w-3xl bg-[#FAF6EE] dark:bg-[#120F0B] border-orange-500/20 text-stone-950 dark:text-stone-50 rounded-3xl max-h-[92vh] overflow-y-auto p-0 shadow-2xl">
          {/* Visually hidden — required by Radix for accessibility */}
          <DialogHeader className="sr-only">
            <DialogTitle>{isHi ? "समूह बनाएं" : "Create Community"}</DialogTitle>
            <DialogDescription>
              {isHi ? "समूह बनाएं और भक्तों को आमंत्रित करें।" : "Create a community group and invite devotees."}
            </DialogDescription>
          </DialogHeader>

          <AnimatePresence mode="wait">

          {/* ── STEP 1: FORM ─────────────────────────────────────── */}
          {!createdGroupData ? (
            <motion.div
              key="form"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.22 }}
              className="p-6 md:p-8"
            >
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
                  {isHi ? "समूह बनाएं" : "Create Community"}
                </h2>
                <p className="text-center text-xs text-stone-500 dark:text-stone-400 mt-1 flex items-center justify-center gap-1 font-medium">
                  {isHi ? "श्रद्धापूर्वक स्थान बनाएं और साथ मिलकर आगे बढ़ें 🧡" : "Build a devotional space and grow together 🧡"}
                </p>
              </div>

              <form onSubmit={handleCreateGroup} className="space-y-5">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
                  
                  {/* Left Column */}
                  <div className="space-y-4">
                    {/* Group Name */}
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

                    {/* Description */}
                    <div className="space-y-1.5">
                      <div className="flex justify-between items-center">
                        <label className="text-xs font-bold text-stone-600 dark:text-stone-300 block">
                          {isHi ? "विवरण (वैकल्पिक)" : "Description (Optional)"}
                        </label>
                        <span className="text-[9px] text-stone-400 dark:text-stone-500 font-mono">
                          {groupDesc.length}/100
                        </span>
                      </div>
                      <div className="relative">
                        <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-orange-500">
                          <Pencil className="w-4 h-4" />
                        </span>
                        <input 
                          type="text"
                          maxLength={100}
                          placeholder={isHi ? "श्री राम नाम का संकीर्तन और भक्ति को मिलकर फैलाएं।" : "Chant Sri Rama's name together and spread devotion..."}
                          value={groupDesc}
                          onChange={(e) => setGroupDesc(e.target.value)}
                          className="w-full rounded-xl border border-orange-500/20 bg-white dark:bg-stone-900/60 pl-10 pr-10 py-3 text-sm focus:border-orange-400 focus:outline-none focus:ring-2 focus:ring-orange-500/20 transition-all"
                        />
                      </div>
                    </div>

                    {/* Invite Code */}
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-stone-600 dark:text-stone-300 block">
                        {isHi ? "आमंत्रण कोड *" : "Invite Code *"}
                      </label>
                      <div className="flex gap-2">
                        <input
                          type="text"
                          required
                          maxLength={15}
                          placeholder="RAMA108"
                          value={inviteCode}
                          onChange={(e) => {
                            setInviteCode(e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, ""));
                            setIsInviteCodeManuallyEdited(true);
                          }}
                          className="flex-1 rounded-xl border border-orange-500/20 bg-white dark:bg-stone-900/60 p-3 text-sm font-bold tracking-widest text-orange-600 dark:text-orange-400 focus:border-orange-400 focus:outline-none focus:ring-2 focus:ring-orange-500/20 transition-all"
                        />
                        <button
                          type="button"
                          onClick={() => copyInviteCode(inviteCode)}
                          className="px-4 rounded-xl border border-orange-500/20 bg-white dark:bg-stone-900/60 text-stone-500 hover:text-orange-500 hover:border-orange-400 transition-colors"
                          title="Copy"
                        >
                          <Copy className="w-4 h-4" />
                        </button>
                      </div>
                      <p className="text-[9px] text-stone-400 leading-normal">
                        {isHi ? "इस कोड से भक्त सीधे जुड़ सकते हैं। प्रत्येक समूह का कोड अलग होना चाहिए।" : "Devotees can join directly with this code. Each group must have a unique code."}
                      </p>
                    </div>
                  </div>

                  {/* Right Column */}
                  <div className="space-y-4">
                    {/* Add Your Group Photo (Custom Image Upload) */}
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-stone-600 dark:text-stone-400 flex items-center justify-between">
                        <span>{isHi ? "अपने समूह का फ़ोटो जोड़ें" : "Add your group photo"}</span>
                        <span className="text-[9px] text-stone-400 font-normal">{isHi ? "(वैकल्पिक)" : "(Optional)"}</span>
                      </label>
                      <input
                        ref={groupImageInputRef}
                        type="file"
                        accept="image/*"
                        className="sr-only"
                        onChange={handleGroupImageFile}
                      />
                      {customGroupImage ? (
                        <div className="relative group rounded-xl overflow-hidden border border-amber-500/30 aspect-[2/1] bg-stone-100 dark:bg-stone-900">
                          <img src={customGroupImage} className="w-full h-full object-cover" />
                          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                            <button
                              type="button"
                              onClick={() => groupImageInputRef.current?.click()}
                              className="px-2.5 py-1.5 rounded-full bg-white text-stone-900 hover:scale-105 transition-transform text-xs font-bold flex items-center gap-1.5 shadow"
                            >
                              <ImagePlus className="w-3.5 h-3.5" />
                              {isHi ? "बदलें" : "Change"}
                            </button>
                            <button
                              type="button"
                              onClick={() => setCustomGroupImage(null)}
                              className="px-2.5 py-1.5 rounded-full bg-red-500 text-white hover:scale-105 transition-transform text-xs font-bold flex items-center gap-1.5 shadow"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                              {isHi ? "हटाएं" : "Remove"}
                            </button>
                          </div>
                        </div>
                      ) : (
                        <button
                          type="button"
                          onClick={() => groupImageInputRef.current?.click()}
                          className="w-full flex flex-col items-center justify-center gap-1.5 rounded-xl border-2 border-dashed border-amber-500/20 bg-white dark:bg-stone-900/50 py-5 text-xs font-semibold text-stone-500 hover:border-orange-400 hover:text-orange-500 transition-all"
                        >
                          <ImagePlus className="w-5 h-5 text-amber-500" />
                          <span>{isHi ? "फ़ोटो अपलोड करें" : "Upload group photo"}</span>
                        </button>
                      )}
                    </div>

                    {/* Choose Preset Deity circular avatars */}
                    <div className="space-y-2.5">
                      <div className="flex items-center justify-between">
                        <label className="text-xs font-bold text-stone-600 dark:text-stone-300 block">
                          {isHi ? "या इष्ट देव चित्र चुनें" : "Or Choose Preset Deity Image"}
                        </label>
                        <span className="text-[10px] text-stone-400 dark:text-stone-500 font-semibold">
                          {isHi ? "एक चुनें" : "Select one"}
                        </span>
                      </div>
                      
                      <div className="grid grid-cols-4 gap-3 py-1">
                        {DEITY_IMAGES.map((img) => {
                          const isSelected = selectedImage === img.id && !customGroupImage;
                          return (
                            <button
                              key={img.id}
                              type="button"
                              onClick={() => { setSelectedImage(img.id); setCustomGroupImage(null); }}
                              className="group flex flex-col items-center gap-1.5 focus:outline-none"
                            >
                              <div className="relative">
                                {/* Deity circular avatar */}
                                <div className={`w-12 h-12 rounded-full overflow-hidden border-2 transition-all p-0.5 ${
                                  isSelected 
                                    ? "border-orange-500 scale-[1.05] ring-4 ring-orange-500/10 shadow-md" 
                                    : "border-stone-200 dark:border-stone-800 opacity-80 hover:opacity-100 hover:border-orange-400/40 hover:scale-[1.02]"
                                }`}>
                                  <img src={img.src} alt={img.name} className="w-full h-full object-cover rounded-full" />
                                </div>
                                {/* Active checkmark indicator */}
                                {isSelected && (
                                  <span className="absolute -top-1 -right-1 w-4.5 h-4.5 bg-orange-500 text-white rounded-full flex items-center justify-center shadow border-2 border-[#FAF6EE] dark:border-[#120F0B] text-[9px] font-bold">
                                    ✓
                                  </span>
                                )}
                              </div>
                              <span className={`text-[9.5px] font-bold transition-colors ${
                                isSelected 
                                  ? "text-orange-500 border-b border-orange-500/50 pb-0.5" 
                                  : "text-stone-500 dark:text-stone-400 group-hover:text-stone-700 dark:group-hover:text-stone-200"
                              }`}>
                                {img.name.split(" ")[0]}
                              </span>
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  </div>

                </div>

                {/* Visibility Option */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-stone-600 dark:text-stone-400">
                    {isHi ? "दृश्यता" : "Visibility"}
                  </label>
                  <div className="grid grid-cols-2 gap-3">
                    <button
                      type="button"
                      onClick={() => setIsPublic(true)}
                      className={`flex flex-col items-center justify-center py-3 px-4 rounded-xl border-2 transition-all text-center gap-1 ${
                        isPublic
                          ? "border-emerald-500 bg-emerald-50/40 dark:bg-emerald-950/10 text-emerald-700 dark:text-emerald-450 font-bold"
                          : "border-stone-200 dark:border-stone-850 hover:border-amber-400/50 text-stone-500"
                      }`}
                    >
                      <Globe className="w-5 h-5 text-emerald-500" />
                      <span className="text-xs font-bold select-none mt-0.5">
                        {isHi ? "सार्वजनिक (Public)" : "Public"}
                      </span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setIsPublic(false)}
                      className={`flex flex-col items-center justify-center py-3 px-4 rounded-xl border-2 transition-all text-center gap-1 ${
                        !isPublic
                          ? "border-amber-500 bg-amber-50/20 dark:bg-amber-950/10 text-amber-705 dark:text-amber-450 font-bold"
                          : "border-stone-200 dark:border-stone-850 hover:border-amber-400/50 text-stone-500"
                      }`}
                    >
                      <Lock className="w-5 h-5 text-amber-500" />
                      <span className="text-xs font-bold select-none mt-0.5">
                        {isHi ? "निजी (Private)" : "Private"}
                      </span>
                    </button>
                  </div>
                </div>

                {/* Green Shield Warning Banner */}
                <div className="flex items-center gap-3 p-3.5 rounded-2xl bg-emerald-500/5 dark:bg-emerald-500/10 border border-emerald-500/15">
                  <span className="w-8 h-8 rounded-full bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-450 flex items-center justify-center shrink-0">
                    <Shield className="w-4 h-4" />
                  </span>
                  <div className="text-left flex-1">
                    <p className="text-xs font-bold text-stone-850 dark:text-stone-200 leading-tight">
                      {isPublic 
                        ? (isHi ? "सार्वजनिक समूह: कोई भी भक्त शामिल हो सकता है।" : "Public Group: Anyone can join and chant.")
                        : (isHi ? "निजी समूह: आमंत्रण लिंक की आवश्यकता होगी।" : "Private Group: Invitation code will be required.")}
                    </p>
                    <p className="text-[10px] text-stone-500 dark:text-stone-400 mt-0.5 font-medium">
                      {isHi 
                        ? "भक्तिभाव और पवित्र वातावरण बनाए रखें।" 
                        : "Please maintain a devotional and pure atmosphere."}
                    </p>
                  </div>
                </div>

                {/* Submit and Cancel Buttons */}
                <div className="space-y-2 pt-2">
                  <Button
                    type="submit"
                    disabled={submitting || isNameUnique === false}
                    className="w-full bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white font-bold py-3.5 rounded-xl shadow-lg shadow-orange-500/20 hover:shadow-orange-500/30 transition-all duration-200 flex items-center justify-center gap-2 text-sm"
                  >
                    <Sparkles className="w-4 h-4 animate-pulse" />
                    <span>
                      {submitting 
                        ? (isHi ? "बन रहा है..." : "Creating...") 
                        : (isHi ? "समूह बनाएं" : "Create Group")}
                    </span>
                    <ArrowRight className="w-4 h-4 ml-auto" />
                  </Button>
                  
                  <button
                    type="button"
                    onClick={closeCreateDialog}
                    className="w-full text-center text-xs font-bold text-stone-500 hover:text-stone-700 dark:text-stone-400 dark:hover:text-stone-250 py-1.5 focus:outline-none transition-colors"
                  >
                    {isHi ? "रद्द करें" : "Cancel"}
                  </button>
                </div>

              </form>
            </motion.div>
          ) : (
            <motion.div
              key="success"
              initial={{ opacity: 0, scale: 0.97 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="p-6 text-center"
            >
              {/* Selected deity banner */}
              <div className="relative w-full h-36 rounded-2xl overflow-hidden mb-4">
                {customGroupImage ? (
                  <img src={customGroupImage} alt="group" className="w-full h-full object-cover" />
                ) : (
                  <img
                    src={DEITY_IMAGES.find(d => d.id === selectedImage)?.src || DEITY_IMAGES[0].src}
                    alt={selectedImage}
                    className="w-full h-full object-cover"
                  />
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent" />
                {/* Success badge */}
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-14 h-14 rounded-full bg-orange-500 flex items-center justify-center shadow-xl shadow-orange-500/40">
                    <Check className="w-7 h-7 text-white" strokeWidth={3} />
                  </div>
                </div>
              </div>

              <h2 className="font-display text-xl font-bold text-amber-900 dark:text-amber-100 leading-tight">
                {createdGroupData.name}
              </h2>
              <p className="text-sm font-semibold text-amber-600 dark:text-amber-400 mt-0.5 mb-4">
                {isHi ? "Created! 🙏" : "Created! 🙏"}
              </p>

              {/* Invite Code display */}
              <div className="mb-4">
                <p className="text-xs text-stone-500 dark:text-stone-400 mb-2 font-semibold uppercase tracking-widest">
                  {isHi ? "आमंत्रण लिंक" : "Invite Link"}
                </p>
                <div className="flex items-center justify-center gap-2">
                  <span className="font-display text-2xl font-extrabold text-orange-500 tracking-widest">
                    {createdGroupData.inviteCode}
                  </span>
                  <button
                    type="button"
                    onClick={() => copyInviteCode(createdGroupData.inviteCode)}
                    className="p-1.5 rounded-lg border border-amber-500/20 bg-amber-50 dark:bg-stone-800 hover:bg-amber-100 transition-colors"
                    title="Copy code"
                  >
                    <Copy className="w-4 h-4 text-stone-500" />
                  </button>
                </div>
                {/* Full URL */}
                <p className="text-[10px] text-stone-400 mt-1.5 break-all">
                  {window.location.origin}/community?join={createdGroupData.inviteCode}
                </p>
              </div>

              {/* Share row */}
              <p className="text-xs text-stone-500 dark:text-stone-400 mb-3">
                {isHi ? "भक्तों को आमंत्रित करें और मिलकर जाप करें" : "Share & invite devotees to grow together"}
              </p>

              <div className="flex gap-2.5 mb-5">
                {/* Copy link */}
                <button
                  type="button"
                  onClick={() => {
                    const url = `${window.location.origin}/community?join=${createdGroupData.inviteCode}`;
                    navigator.clipboard.writeText(url);
                    toast.success(isHi ? "लिंक कॉपी किया गया!" : "Link copied!");
                  }}
                  className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl border border-stone-200 dark:border-stone-700 bg-white dark:bg-stone-800 text-xs font-semibold text-stone-600 dark:text-stone-300 hover:border-orange-400 transition-colors"
                >
                  <Copy className="w-3.5 h-3.5" />
                  {isHi ? "लिंक कॉपी करें" : "Copy Link"}
                </button>

                {/* WhatsApp share */}
                <button
                  type="button"
                  onClick={() => shareOnWhatsApp(createdGroupData.inviteCode, createdGroupData.name)}
                  className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl bg-[#25D366] hover:bg-[#1ebe5d] text-white text-xs font-bold transition-colors shadow-md shadow-green-500/25"
                >
                  <svg viewBox="0 0 24 24" className="w-4 h-4 fill-white">
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                  </svg>
                  WhatsApp
                </button>
              </div>

              {/* Go to Group */}
              <Button
                onClick={() => {
                  closeCreateDialog();
                  navigate("/community");
                }}
                className="w-full rounded-xl bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white font-bold py-3 shadow-md shadow-orange-500/25 flex items-center justify-center gap-2"
              >
                {isHi ? "समूह में जाएं" : "Go to Group"}
                <ArrowRight className="w-4 h-4" />
              </Button>
            </motion.div>
          )}

          </AnimatePresence>
        </DialogContent>
      </Dialog>

      {/* ─── GROUP LEADERBOARD DIALOG ────────────────────────────── */}
      <Dialog open={leaderboardDialogOpen} onOpenChange={setLeaderboardDialogOpen}>
        <DialogContent className="max-w-md bg-[#fdfbf7] dark:bg-stone-900 border-amber-500/20 text-stone-950 dark:text-stone-50 rounded-2xl">
          <DialogHeader className="relative">
            <DialogTitle className="font-display text-xl font-bold text-amber-900 dark:text-amber-100 flex items-center gap-2">
              <Trophy className="w-5 h-5 text-orange-500 shrink-0" />
              <span>{selectedGroup?.name}</span>
            </DialogTitle>
            <DialogDescription className="text-xs text-stone-500 dark:text-stone-400">
              {isHi 
                ? "समूह के शीर्ष जाप कर्ताओं की सूची और कुल नाम जाप योगदान" 
                : "Top chanters and Japa contributors inside this group"}
            </DialogDescription>
          </DialogHeader>

          <div className="mt-4 max-h-[350px] overflow-y-auto pr-1 space-y-2.5">
            {loadingRankings ? (
              <div className="py-8 text-center text-xs text-amber-500 animate-pulse">
                {isHi ? "रैंकिंग लोड हो रही है..." : "Loading rankings..."}
              </div>
            ) : groupRankings.length === 0 ? (
              <div className="py-8 text-center text-xs text-stone-500 dark:text-stone-400">
                {isHi ? "इस समूह में कोई सदस्य नहीं है।" : "No members found in this group."}
              </div>
            ) : (
              groupRankings.map((member, i) => {
                let medal = "";
                if (i === 0) medal = "🥇";
                else if (i === 1) medal = "🥈";
                else if (i === 2) medal = "🥉";

                return (
                  <div 
                    key={member.user_id}
                    className="flex items-center justify-between p-3 rounded-xl bg-white dark:bg-stone-950/30 border border-amber-500/5 shadow-xxs"
                  >
                    <div className="flex items-center gap-3">
                      <span className="w-6 text-center text-xs font-bold text-amber-600 dark:text-amber-400 leading-none">
                        {medal || `#${i + 1}`}
                      </span>
                      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-amber-100 to-orange-100 dark:from-stone-800 dark:to-stone-700 flex items-center justify-center font-bold text-xs text-amber-800 dark:text-amber-200">
                        {member.display_name.slice(0, 2).toUpperCase()}
                      </div>
                      <div>
                        <h4 className="text-xs font-bold text-stone-950 dark:text-amber-100">{member.display_name}</h4>
                        <div className="flex items-center gap-2 mt-0.5">
                          {user?.id === member.user_id && (
                            <span className="inline-block bg-orange-500/10 text-orange-600 text-[8px] font-bold px-1.5 py-0.5 rounded-full">
                              {isHi ? "आप" : "You"}
                            </span>
                          )}
                          {member.current_streak !== undefined && member.current_streak > 0 && (
                            <span className="inline-flex items-center gap-0.5 text-orange-500 text-[9px] font-bold">
                              <Flame className="w-3 h-3 fill-orange-500" />
                              {member.current_streak} {isHi ? "दिन" : "days"}
                            </span>
                          )}
                          {member.weekly_japs !== undefined && member.weekly_japs > 0 && (
                            <span className="text-stone-500 dark:text-stone-400 text-[9px] font-semibold">
                              {isHi ? "साप्ताहिक:" : "Weekly:"} {member.weekly_japs.toLocaleString()}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="text-right">
                      <p className="text-xs font-extrabold text-amber-600 dark:text-amber-400 tabular-nums leading-none">
                        {member.total_chants.toLocaleString()}
                      </p>
                      <p className="text-[9px] text-stone-500 dark:text-stone-400 font-semibold mt-0.5">
                        {isHi ? "नाम जाप" : "Chants"}
                      </p>
                    </div>
                  </div>
                );
              })
            )}
          </div>

          <div className="flex justify-end pt-3 mt-4 border-t border-amber-500/10">
            <Button
              onClick={() => setLeaderboardDialogOpen(false)}
              className="rounded-xl border border-amber-500/20 bg-white hover:bg-stone-50 text-stone-700 dark:bg-stone-800 dark:text-stone-300 dark:hover:bg-stone-700"
            >
              {isHi ? "बंद करें" : "Close"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

    </div>
  );
}
