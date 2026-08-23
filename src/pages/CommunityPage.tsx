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
  ChevronDown,
  Plus, 
  Info, 
  Activity, 
  Award,
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
  Settings,
  HelpCircle,
  Key
} from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useDrawer } from "@/hooks/useDrawer";
import { useLanguage } from "@/hooks/useLanguage";
import { supabase } from "@/lib/supabaseClient";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { uploadToCloudinary } from "@/lib/cloudinary";
import { Button } from "@/components/ui/button";
import { SEO } from "@/components/SEO";
import { goBack, prefetchJoinCommunityPage } from "@/lib/navigation";
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
import DevotionalDivider from "@/components/DevotionalDivider";

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
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMoreGroups, setHasMoreGroups] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedTab, setSelectedTab] = useState("all");
  const [visibleGroupCount, setVisibleGroupCount] = useState(6);
  const GROUPS_PAGE_SIZE = 12;
  const VISIBLE_PAGE_SIZE = 6;
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
  const [customGroupImageFile, setCustomGroupImageFile] = useState<File | null>(null);
  const groupImageInputRef = useRef<HTMLInputElement | null>(null);

  const isNameUnique = groupName.trim()
    ? !groups.some((g) => g.name.trim().toLowerCase() === groupName.trim().toLowerCase())
    : null;



  // Load groups fast, then stats in parallel
  const loadData = async (opts?: { silent?: boolean }) => {
    const silent = opts?.silent ?? false;
    try {
      if (!silent) setLoading(true);
      const fetched = await fetchGroups(user?.id, { limit: GROUPS_PAGE_SIZE, offset: 0 });
      setGroups(fetched);
      setHasMoreGroups(fetched.length >= GROUPS_PAGE_SIZE);
      setVisibleGroupCount(VISIBLE_PAGE_SIZE);
      setLoading(false);

      void (async () => {
        try {
          const [
            { count: profileCount },
            { data: japTotals },
            { count: groupsCount },
            { count: bhajansCount },
            { count: eventsCount },
          ] = await Promise.all([
            supabase.from("user_profiles").select("id", { count: "exact", head: true }),
            (supabase.from as any)("user_jap_totals").select("total_chants"),
            (supabase.from as any)("groups").select("id", { count: "exact", head: true }),
            supabase.from("user_uploads").select("id", { count: "exact", head: true }),
            (supabase.from as any)("community_posts").select("id", { count: "exact", head: true }).eq("type", "event"),
          ]);

          const realTotalJaps = (japTotals ?? []).reduce((sum, row) => sum + (Number(row.total_chants) || 0), 0);
          setGlobalStats({
            devotees: profileCount ?? 0,
            totalJaps: realTotalJaps,
            groupCount: groupsCount ?? fetched.length ?? 0,
            bhajansCount: bhajansCount ?? 0,
            eventsCount: eventsCount ?? 0,
          });
        } catch (statsErr) {
          console.error("Error loading community stats:", statsErr);
        }
      })();
      return;
    } catch (err) {
      console.error("Error loading community data:", err);
      setLoading(false);
    }
  };

  const loadMoreGroups = async () => {
    if (loadingMore) return;
    if (visibleGroupCount < groups.length) {
      setVisibleGroupCount((n) => Math.min(n + VISIBLE_PAGE_SIZE, groups.length));
      return;
    }
    if (!hasMoreGroups) return;
    try {
      setLoadingMore(true);
      const next = await fetchGroups(user?.id, { limit: GROUPS_PAGE_SIZE, offset: groups.length });
      if (next.length === 0) setHasMoreGroups(false);
      else {
        setGroups((prev) => {
          const seen = new Set(prev.map((g) => g.id));
          return [...prev, ...next.filter((g) => !seen.has(g.id))];
        });
        setVisibleGroupCount((n) => n + VISIBLE_PAGE_SIZE);
        setHasMoreGroups(next.length >= GROUPS_PAGE_SIZE);
      }
    } catch (err) {
      console.error("Error loading more groups:", err);
    } finally {
      setLoadingMore(false);
    }
  };

  useEffect(() => {
    loadData({ silent: groups.length > 0 });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.id]);

  useEffect(() => {
    let cancelled = false;
    const run = () => {
      if (!cancelled) prefetchJoinCommunityPage();
    };
    if (typeof window.requestIdleCallback === "function") {
      const id = window.requestIdleCallback(run, { timeout: 2500 });
      return () => {
        cancelled = true;
        window.cancelIdleCallback(id);
      };
    }
    const t = window.setTimeout(run, 600);
    return () => {
      cancelled = true;
      window.clearTimeout(t);
    };
  }, []);

  useEffect(() => {
    setVisibleGroupCount(VISIBLE_PAGE_SIZE);
  }, [selectedTab, searchQuery]);

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
      let imageUrl = selectedImage;
      if (customGroupImageFile) {
        imageUrl = await uploadToCloudinary(customGroupImageFile, "groups");
      } else if (customGroupImage && !customGroupImage.startsWith("data:")) {
        imageUrl = customGroupImage;
      }
      const result = await createGroup({
        name: groupName.trim(),
        description: groupDesc.trim(),
        targetCount: Number(groupTarget),
        createdBy: user.id,
        inviteCode: inviteCode.trim().toUpperCase(),
        imageUrl,
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
    setCustomGroupImageFile(null);
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
    if (customGroupImage?.startsWith("blob:")) {
      URL.revokeObjectURL(customGroupImage);
    }
    setCustomGroupImageFile(file);
    setCustomGroupImage(URL.createObjectURL(file));
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

  const visibleFilteredGroups = filteredGroups.slice(0, visibleGroupCount);
  const canShowMoreFiltered =
    visibleGroupCount < filteredGroups.length || (selectedTab === "all" && !searchQuery && hasMoreGroups);
  const myJoinedGroups = groups.filter((g) => g.is_member);

  return (
    <div
      className="community-page min-h-screen bg-[#fdfbf7] dark:bg-[#0c0a08] text-stone-900 dark:text-stone-100 transition-colors pb-16"
      data-lang={language}
    >
      <SEO
        title={isHi ? "समुदाय" : "Community"}
        description={
          isHi
            ? "अपना समूह बनाएं, परिवार और मित्रों के साथ सामूहिक नाम जाप करें और भक्ति पथ पर आगे बढ़ें।"
            : "Create your community, chant together with family and friends and grow spiritually."
        }
        url={typeof window !== "undefined" ? `${window.location.origin}/community` : undefined}
        image={typeof window !== "undefined" ? `${window.location.origin}${shyamBackgroundImg}` : shyamBackgroundImg}
        lang={isHi ? "hi" : "en"}
      />

      {/* ─── HEADER BAR (Aligned with Website Fixed Nav Bar) ─────── */}
      <header className="sticky top-0 z-40 bg-[#FFFDF8]/95 dark:bg-background/95 backdrop-blur-md border-b border-border/40 shadow-xs">
        <div className="max-w-7xl mx-auto px-4 h-14 flex items-center justify-between gap-3">
          <div className="flex items-center gap-2.5 shrink-0">
            <button
              type="button"
              onClick={() => goBack(navigate, "/")}
              className="w-10 h-10 rounded-full border border-border/80 bg-[#FFFDF8]/80 dark:bg-stone-900/60 text-[#651317] dark:text-amber-200 hover:bg-[#651317]/5 hover:text-[#651317] hover:border-[#651317]/30 flex items-center justify-center p-0 active:scale-95 transition-all shadow-xs shrink-0 cursor-pointer"
              aria-label={isHi ? "वापस" : "Back"}
            >
              <ChevronLeft className="w-5 h-5 text-[#651317] dark:text-amber-200" />
            </button>
            <span className="font-display text-lg sm:text-xl font-extrabold tracking-tight text-[#651317] dark:text-amber-100 leading-none">
              {isHi ? "समुदाय" : "Community"}
            </span>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={() => navigate("/notifications")}
              className="relative w-10 h-10 rounded-full border border-border/80 bg-[#FFFDF8]/80 dark:bg-stone-900/60 text-[#651317] dark:text-amber-200 hover:bg-[#651317]/5 hover:text-[#651317] hover:border-[#651317]/30 flex items-center justify-center p-0 active:scale-95 transition-all shadow-xs shrink-0 cursor-pointer"
              title={isHi ? "सूचनाएं" : "Notifications"}
            >
              <Bell className="w-4.5 h-4.5 text-[#651317] dark:text-amber-200" />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full border border-white dark:border-stone-900" />
            </button>
            <button
              onClick={() => {
                if (!user) {
                  toast.info(isHi ? "कृपया अपने समूह देखने के लिए लॉग इन करें" : "Please log in to view your groups");
                  navigate("/auth/login?redirect=/community");
                } else {
                  const el = document.getElementById("my-joined-groups-section");
                  if (el) el.scrollIntoView({ behavior: "smooth" });
                  else {
                    setSelectedTab("my");
                    document.getElementById("groups-filter-tabs")?.scrollIntoView({ behavior: "smooth" });
                  }
                }
              }}
              className="inline-flex items-center justify-center gap-1.5 h-9 sm:h-9.5 bg-[#651317] hover:bg-[#4f0f12] text-white font-bold px-4 rounded-full text-xs sm:text-sm active:scale-95 transition-all shadow-xs shrink-0 cursor-pointer whitespace-nowrap leading-none"
            >
              <Users className="w-4 h-4 text-white shrink-0" />
              <span className="leading-none">{isHi ? "मेरे समूह" : "My Groups"}</span>
            </button>
            <button
              onClick={() => {
                if (!user) {
                  toast.info(isHi ? "कृपया समूह बनाने के लिए लॉग इन करें" : "Please log in to create a group");
                  navigate("/auth/login?redirect=/community");
                } else setCreateDialogOpen(true);
              }}
              className="w-10 h-10 rounded-full bg-[#651317] hover:bg-[#4f0f12] text-white flex items-center justify-center active:scale-95 transition-all shadow-xs shrink-0 cursor-pointer"
              aria-label={isHi ? "समूह बनाएं" : "Create Group"}
            >
              <Plus className="w-4.5 h-4.5 text-white" />
            </button>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 mt-4 md:mt-6 space-y-4 md:space-y-6">
        {/* ─── FULL LANDSCAPE HERO (centered) ─────────────────────── */}
        <div
          className="relative w-full h-[240px] md:h-[320px] rounded-[24px] overflow-hidden bg-[#161008] border border-[#F3E2C8]/10 select-none"
          style={{ boxShadow: "0 12px 35px rgba(0,0,0,0.10)" }}
        >
          <img
            src={shyamBackgroundImg}
            alt=""
            width={1600}
            height={900}
            fetchpriority="high"
            decoding="async"
            className="absolute inset-0 w-full h-full object-cover object-[center_20%] z-0 pointer-events-none select-none opacity-100 saturate-[1.08] contrast-[1.05]"
          />
          <div
            className="absolute inset-0 z-10 pointer-events-none"
            style={{ background: "linear-gradient(180deg, rgba(0,0,0,0.05) 0%, rgba(0,0,0,0.08) 45%, rgba(0,0,0,0.55) 78%, rgba(0,0,0,0.72) 100%)" }}
          />
          <div className="absolute inset-0 z-20 flex flex-col items-center justify-end text-center px-5 pb-4 md:pb-6">
            <h1 className="font-display font-bold md:font-extrabold text-[#FFFDF8] leading-[1.25] text-[16px] md:text-[28px] select-text max-w-[280px] md:max-w-md drop-shadow-[0_1px_2px_rgba(0,0,0,0.6),0_2px_10px_rgba(0,0,0,0.45)]">
              {isHi ? (
                <>
                  भक्ति के इस पावन
                  <br />
                  परिवार से जुड़ें
                </>
              ) : (
                <>
                  Join Our Holy
                  <br />
                  Devotional Family
                </>
              )}
            </h1>
            <div className="w-10 h-[1.5px] bg-gradient-to-r from-transparent via-amber-300/70 to-transparent my-2" />
            <p className="text-[#FFFDF8]/90 text-[10px] md:text-sm font-bold leading-snug max-w-[260px] md:max-w-sm mb-2.5 drop-shadow-[0_1px_3px_rgba(0,0,0,0.55)]">
              {isHi
                ? "साथ मिलकर भजन गाएँ, नाम जपें और एक-दूसरे को प्रार्थना करें।"
                : "Sing bhajans together, chant the Name, and pray for one another."}
            </p>
            <button
              type="button"
              onClick={() => navigate("/join-community?tab=feed")}
              onPointerEnter={() => prefetchJoinCommunityPage()}
              className="inline-flex items-center justify-center gap-1.5 h-9 px-4 rounded-full bg-[#FFFDF8]/95 hover:bg-white text-[#651317] font-bold text-[12px] md:text-sm shadow-md active:scale-95 transition-all border border-amber-200/40"
            >
              <Search className="w-3.5 h-3.5" />
              {isHi ? "समुदाय देखें" : "Explore Community"}
            </button>
          </div>
        </div>

        {/* ─── HORIZONTALLY SCROLLABLE (X DIRECTION) SMALL ACTION BOXES ─── */}
        <div className="w-full space-y-3">
          <div
            className="flex gap-2.5 md:gap-3 overflow-x-auto pb-2 pt-1 snap-x scroll-smooth w-full select-none"
            style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
          >
            {/* Box 1: समूह बनायें */}
            <div
              onClick={() => {
                if (!user) {
                  toast.info(isHi ? "कृपया समूह बनाने के लिए लॉग इन करें" : "Please log in to create a group");
                  navigate("/auth/login?redirect=/community");
                } else setCreateDialogOpen(true);
              }}
              className="w-[125px] sm:w-[140px] md:w-[155px] shrink-0 snap-start bg-[#FFFDF8] dark:bg-[#1A120B] border border-[#E8D8C4] dark:border-stone-800 rounded-[20px] p-3 flex flex-col items-center justify-between text-center cursor-pointer transition-all duration-200 hover:shadow-md hover:-translate-y-0.5 active:scale-[0.97] shadow-xs"
            >
              <div className="w-11 h-11 md:w-12 md:h-12 rounded-full bg-[#FAF0E4] dark:bg-[#2B1F14] border border-[#F3E5D8]/80 flex items-center justify-center mx-auto mb-2 shadow-inner shrink-0">
                <Users className="w-5 h-5 md:w-5.5 md:h-5.5 text-[#651317] dark:text-amber-300 stroke-[2.2]" />
              </div>
              <div>
                <h3 className="font-display font-extrabold text-[11px] md:text-xs text-[#651317] dark:text-amber-100 text-center leading-tight truncate">
                  {isHi ? "समूह बनायें" : "Create Group"}
                </h3>
                <p className="text-[9px] md:text-[10px] font-medium text-[#8C7A6B] dark:text-stone-400 text-center leading-tight mt-1 line-clamp-2">
                  {isHi ? "अपना समूह बनाएं" : "Create group"}
                </p>
              </div>
            </div>

            {/* Box 2: समूह खोजें */}
            <div
              onClick={() => document.getElementById("groups-filter-tabs")?.scrollIntoView({ behavior: "smooth" })}
              className="w-[125px] sm:w-[140px] md:w-[155px] shrink-0 snap-start bg-[#FFFDF8] dark:bg-[#1A120B] border border-[#E8D8C4] dark:border-stone-800 rounded-[20px] p-3 flex flex-col items-center justify-between text-center cursor-pointer transition-all duration-200 hover:shadow-md hover:-translate-y-0.5 active:scale-[0.97] shadow-xs"
            >
              <div className="w-11 h-11 md:w-12 md:h-12 rounded-full bg-[#FAF0E4] dark:bg-[#2B1F14] border border-[#F3E5D8]/80 flex items-center justify-center mx-auto mb-2 shadow-inner shrink-0">
                <Search className="w-5 h-5 md:w-5.5 md:h-5.5 text-[#651317] dark:text-amber-300 stroke-[2.2]" />
              </div>
              <div>
                <h3 className="font-display font-extrabold text-[11px] md:text-xs text-[#651317] dark:text-amber-100 text-center leading-tight truncate">
                  {isHi ? "समूह खोजें" : "Find Group"}
                </h3>
                <p className="text-[9px] md:text-[10px] font-medium text-[#8C7A6B] dark:text-stone-400 text-center leading-tight mt-1 line-clamp-2">
                  {isHi ? "समूह खोजें और जुड़ें" : "Find & join"}
                </p>
              </div>
            </div>

            {/* Box 3: मेरे समूह */}
            <div
              onClick={() => {
                if (!user) {
                  toast.info(isHi ? "कृपया अपने समूह देखने के लिए लॉग इन करें" : "Please log in to view your groups");
                  navigate("/auth/login?redirect=/community");
                } else {
                  const el = document.getElementById("my-joined-groups-section");
                  if (el) el.scrollIntoView({ behavior: "smooth" });
                  else {
                    setSelectedTab("my");
                    document.getElementById("groups-filter-tabs")?.scrollIntoView({ behavior: "smooth" });
                  }
                }
              }}
              className="w-[125px] sm:w-[140px] md:w-[155px] shrink-0 snap-start bg-[#FFFDF8] dark:bg-[#1A120B] border border-[#E8D8C4] dark:border-stone-800 rounded-[20px] p-3 flex flex-col items-center justify-between text-center cursor-pointer transition-all duration-200 hover:shadow-md hover:-translate-y-0.5 active:scale-[0.97] shadow-xs"
            >
              <div className="w-11 h-11 md:w-12 md:h-12 rounded-full bg-[#FAF0E4] dark:bg-[#2B1F14] border border-[#F3E5D8]/80 flex items-center justify-center mx-auto mb-2 shadow-inner shrink-0">
                <Users className="w-5 h-5 md:w-5.5 md:h-5.5 text-[#651317] dark:text-amber-300 stroke-[2.2]" />
              </div>
              <div>
                <h3 className="font-display font-extrabold text-[11px] md:text-xs text-[#651317] dark:text-amber-100 text-center leading-tight truncate">
                  {isHi ? "मेरे समूह" : "My Groups"} {user && myJoinedGroups.length > 0 && <span className="text-[#651317] dark:text-amber-300 font-extrabold">({myJoinedGroups.length})</span>}
                </h3>
                <p className="text-[9px] md:text-[10px] font-medium text-[#8C7A6B] dark:text-stone-400 text-center leading-tight mt-1 line-clamp-2">
                  {isHi ? "मेरे समूह देखें" : "View my groups"}
                </p>
              </div>
            </div>

            {/* Box 4: नया पोस्ट */}
            <div
              onClick={() => navigate("/join-community?tab=feed")}
              onPointerEnter={() => prefetchJoinCommunityPage()}
              className="w-[125px] sm:w-[140px] md:w-[155px] shrink-0 snap-start bg-[#FFFDF8] dark:bg-[#1A120B] border border-[#E8D8C4] dark:border-stone-800 rounded-[20px] p-3 flex flex-col items-center justify-between text-center cursor-pointer transition-all duration-200 hover:shadow-md hover:-translate-y-0.5 active:scale-[0.97] shadow-xs"
            >
              <div className="w-11 h-11 md:w-12 md:h-12 rounded-full bg-[#FAF0E4] dark:bg-[#2B1F14] border border-[#F3E5D8]/80 flex items-center justify-center mx-auto mb-2 shadow-inner shrink-0">
                <Plus className="w-5 h-5 md:w-5.5 md:h-5.5 text-[#651317] dark:text-amber-300 stroke-[2.5]" />
              </div>
              <div>
                <h3 className="font-display font-extrabold text-[11px] md:text-xs text-[#651317] dark:text-amber-100 text-center leading-tight truncate">
                  {isHi ? "नया पोस्ट" : "New Post"}
                </h3>
                <p className="text-[9px] md:text-[10px] font-medium text-[#8C7A6B] dark:text-stone-400 text-center leading-tight mt-1 line-clamp-2">
                  {isHi ? "समूह में पोस्ट करें" : "Post in group"}
                </p>
              </div>
            </div>

            {/* Box 5: मित्र आमंत्रित करें */}
            <div
              onClick={() => {
                navigator.clipboard.writeText(window.location.origin + "/community");
                toast.success(isHi ? "समुदाय आमंत्रण लिंक कॉपी किया गया!" : "Community invite link copied!");
              }}
              className="w-[125px] sm:w-[140px] md:w-[155px] shrink-0 snap-start bg-[#FFFDF8] dark:bg-[#1A120B] border border-[#E8D8C4] dark:border-stone-800 rounded-[20px] p-3 flex flex-col items-center justify-between text-center cursor-pointer transition-all duration-200 hover:shadow-md hover:-translate-y-0.5 active:scale-[0.97] shadow-xs"
            >
              <div className="w-11 h-11 md:w-12 md:h-12 rounded-full bg-[#FAF0E4] dark:bg-[#2B1F14] border border-[#F3E5D8]/80 flex items-center justify-center mx-auto mb-2 shadow-inner shrink-0">
                <Share2 className="w-5 h-5 md:w-5.5 md:h-5.5 text-[#651317] dark:text-amber-300 stroke-[2.2]" />
              </div>
              <div>
                <h3 className="font-display font-extrabold text-[11px] md:text-xs text-[#651317] dark:text-amber-100 text-center leading-tight truncate">
                  {isHi ? "मित्र आमंत्रित करें" : "Invite Friends"}
                </h3>
                <p className="text-[9px] md:text-[10px] font-medium text-[#8C7A6B] dark:text-stone-400 text-center leading-tight mt-1 line-clamp-2">
                  {isHi ? "मित्रों को आमंत्रित करें" : "Invite friends"}
                </p>
              </div>
            </div>

            {/* Box 6: भजन अपलोड करें */}
            <div
              onClick={() => navigate("/upload-bhajan")}
              className="w-[125px] sm:w-[140px] md:w-[155px] shrink-0 snap-start bg-[#FFFDF8] dark:bg-[#1A120B] border border-[#E8D8C4] dark:border-stone-800 rounded-[20px] p-3 flex flex-col items-center justify-between text-center cursor-pointer transition-all duration-200 hover:shadow-md hover:-translate-y-0.5 active:scale-[0.97] shadow-xs"
            >
              <div className="w-11 h-11 md:w-12 md:h-12 rounded-full bg-[#FAF0E4] dark:bg-[#2B1F14] border border-[#F3E5D8]/80 flex items-center justify-center mx-auto mb-2 shadow-inner shrink-0">
                <Music className="w-5 h-5 md:w-5.5 md:h-5.5 text-[#651317] dark:text-amber-300 stroke-[2.2]" />
              </div>
              <div>
                <h3 className="font-display font-extrabold text-[11px] md:text-xs text-[#651317] dark:text-amber-100 text-center leading-tight truncate">
                  {isHi ? "भजन अपलोड करें" : "Upload Bhajans"}
                </h3>
                <p className="text-[9px] md:text-[10px] font-medium text-[#8C7A6B] dark:text-stone-400 text-center leading-tight mt-1 line-clamp-2">
                  {isHi ? "भजन अपलोड व शेयर" : "Upload & share"}
                </p>
              </div>
            </div>

            {/* Box 7: नाम जप प्रारंभ करें */}
            <div
              onClick={() => navigate("/meditation")}
              className="w-[125px] sm:w-[140px] md:w-[155px] shrink-0 snap-start bg-[#FFFDF8] dark:bg-[#1A120B] border border-[#E8D8C4] dark:border-stone-800 rounded-[20px] p-3 flex flex-col items-center justify-between text-center cursor-pointer transition-all duration-200 hover:shadow-md hover:-translate-y-0.5 active:scale-[0.97] shadow-xs"
            >
              <div className="w-11 h-11 md:w-12 md:h-12 rounded-full bg-[#FAF0E4] dark:bg-[#2B1F14] border border-[#F3E5D8]/80 flex items-center justify-center mx-auto mb-2 shadow-inner shrink-0">
                <Flame className="w-5 h-5 md:w-5.5 md:h-5.5 text-[#651317] dark:text-amber-300 stroke-[2.2]" />
              </div>
              <div>
                <h3 className="font-display font-extrabold text-[11px] md:text-xs text-[#651317] dark:text-amber-100 text-center leading-tight truncate">
                  {isHi ? "नाम जप प्रारंभ करें" : "Start Japa"}
                </h3>
                <p className="text-[9px] md:text-[10px] font-medium text-[#8C7A6B] dark:text-stone-400 text-center leading-tight mt-1 line-clamp-2">
                  {isHi ? "साथ मिलकर नाम जप" : "Chant together"}
                </p>
              </div>
            </div>

            {/* Box 8: सत्संग आयोजित करें */}
            <div
              onClick={() => {
                if (!user) {
                  toast.info(isHi ? "कृपया समूह बनाने के लिए लॉग इन करें" : "Please log in to create a group");
                  navigate("/auth/login?redirect=/community");
                } else setCreateDialogOpen(true);
              }}
              className="w-[125px] sm:w-[140px] md:w-[155px] shrink-0 snap-start bg-[#FFFDF8] dark:bg-[#1A120B] border border-[#E8D8C4] dark:border-stone-800 rounded-[20px] p-3 flex flex-col items-center justify-between text-center cursor-pointer transition-all duration-200 hover:shadow-md hover:-translate-y-0.5 active:scale-[0.97] shadow-xs"
            >
              <div className="w-11 h-11 md:w-12 md:h-12 rounded-full bg-[#FAF0E4] dark:bg-[#2B1F14] border border-[#F3E5D8]/80 flex items-center justify-center mx-auto mb-2 shadow-inner shrink-0">
                <Calendar className="w-5 h-5 md:w-5.5 md:h-5.5 text-[#651317] dark:text-amber-300 stroke-[2.2]" />
              </div>
              <div>
                <h3 className="font-display font-extrabold text-[11px] md:text-xs text-[#651317] dark:text-amber-100 text-center leading-tight truncate">
                  {isHi ? "सत्संग आयोजित करें" : "Organize Satsang"}
                </h3>
                <p className="text-[9px] md:text-[10px] font-medium text-[#8C7A6B] dark:text-stone-400 text-center leading-tight mt-1 line-clamp-2">
                  {isHi ? "सत्संग व कार्यक्रम" : "Devotional meetups"}
                </p>
              </div>
            </div>
          </div>

          {/* Quick Invite Code Form (Standardized SearchBar Component) */}
          <form onSubmit={handleJoinByCode} className="w-full min-w-0 mt-2">
            <div className="relative flex items-center w-full h-12 sm:h-12.5 bg-white dark:bg-[#1E1710] border border-[#EFE4D7] dark:border-zinc-800/80 rounded-full shadow-[0_4px_20px_rgba(80,45,20,0.04)] pl-3.5 sm:pl-4 pr-1.5 sm:pr-2 gap-2 sm:gap-2.5 focus-within:border-[#6A2C2A] dark:focus-within:border-[#E8B15C] focus-within:ring-2 focus-within:ring-[#6A2C2A]/10 transition-all duration-200">
              <div className="w-7 h-7 sm:w-7.5 sm:h-7.5 rounded-full bg-[#651317]/8 dark:bg-amber-400/10 flex items-center justify-center shrink-0">
                <Key className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-[#6A2C2A] dark:text-[#E8B15C] shrink-0" />
              </div>
              <input
                type="text"
                placeholder={isHi ? "आमंत्रण कोड दर्ज करें..." : "ENTER INVITE CODE..."}
                value={inviteCodeInput}
                onChange={(e) => setInviteCodeInput(e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, ""))}
                className="flex-1 min-w-0 w-full bg-transparent border-0 outline-none text-xs sm:text-sm font-bold text-[#32251E] dark:text-foreground placeholder:text-[#7A6B60]/70 uppercase tracking-wider py-1.5"
              />
              <button
                type="submit"
                disabled={joiningByCode}
                className="inline-flex items-center justify-center gap-1.5 h-9 sm:h-9.5 px-4 sm:px-4.5 rounded-full bg-[#651317] hover:bg-[#4f0f12] text-white font-bold text-xs sm:text-sm active:scale-95 transition-all shadow-xs shrink-0 cursor-pointer whitespace-nowrap leading-none opacity-100"
              >
                <span>{joiningByCode ? "..." : (isHi ? "जुड़ें" : "Join")}</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </form>
        </div>

        {/* राधा — after hero / actions / quick cards */}
        <DevotionalDivider word="राधा" />

        {/* ─── MY JOINED GROUPS (REDESIGNED UI) ───────────────────── */}
        <div id="my-joined-groups-section" className="w-full text-left bg-[#FFFDF8] dark:bg-[#1A120B] border border-[#E8D8C4] dark:border-stone-800 rounded-[24px] p-4 md:p-5 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-[#FAF0E4] dark:bg-[#2B1F14] border border-[#F3E5D8]/80 flex items-center justify-center shrink-0">
                <Users className="w-5 h-5 text-[#651317] dark:text-amber-300" />
              </div>
              <div>
                <h2 className="font-display text-base md:text-lg font-black text-[#651317] dark:text-amber-100 flex items-center gap-1.5">
                  <span>{isHi ? "मेरे जुड़े हुए समूह" : "My Joined Groups"}</span>
                  {user && myJoinedGroups.length > 0 && (
                    <span className="text-[#651317] dark:text-amber-300 font-extrabold text-base md:text-lg font-sans">
                      ({myJoinedGroups.length})
                    </span>
                  )}
                </h2>
                <p className="text-[11px] text-[#8C7A6B] dark:text-stone-400 font-semibold mt-0.5">
                  {isHi ? "आप जिन समूहों के सदस्य हैं" : "Groups you have joined"}
                </p>
              </div>
            </div>

            {user && (
              <>
                {/* Mobile: icon-only pill button */}
                <button
                  onClick={() => setCreateDialogOpen(true)}
                  className="sm:hidden inline-flex items-center justify-center w-9 h-9 rounded-full bg-[#651317] hover:bg-[#4f0f12] text-white active:scale-95 transition-all shadow-xs shrink-0 cursor-pointer"
                  title={isHi ? "नया समूह बनाएं" : "Create New Group"}
                >
                  <Plus className="w-4 h-4 text-white" />
                </button>
                {/* Desktop: full label button */}
                <button
                  onClick={() => setCreateDialogOpen(true)}
                  className="hidden sm:inline-flex items-center justify-center gap-1.5 h-9 sm:h-9.5 px-4 rounded-full bg-[#651317] hover:bg-[#4f0f12] text-white text-xs sm:text-sm font-bold active:scale-95 transition-all shadow-xs shrink-0 cursor-pointer whitespace-nowrap leading-none"
                >
                  <Plus className="w-4 h-4 text-white" />
                  <span>{isHi ? "नया समूह" : "New Group"}</span>
                </button>
              </>
            )}
          </div>

          {!user ? (
            /* State 1: User not logged in */
            <div className="w-full bg-[#FAF6EE] dark:bg-[#120E0A] border border-dashed border-[#E8D8C4] dark:border-stone-800 rounded-2xl p-6 text-center space-y-3">
              <div className="w-12 h-12 rounded-full bg-[#FAF0E4] dark:bg-[#2B1F14] text-[#651317] dark:text-amber-300 flex items-center justify-center mx-auto">
                <Lock className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-display text-sm font-bold text-[#651317] dark:text-amber-100">
                  {isHi ? "अपने जुड़े हुए समूह देखने के लिए लॉग इन करें" : "Log in to view your joined groups"}
                </h3>
                <p className="text-xs text-[#8C7A6B] dark:text-stone-400 font-medium mt-1">
                  {isHi ? "सामूहिक नाम जप में भाग लें और भक्तों के साथ जुड़ें" : "Participate in group japa and connect with devotees"}
                </p>
              </div>
              <Button
                onClick={() => navigate("/auth/login?redirect=/community")}
                className="inline-flex items-center justify-center gap-1.5 h-9 sm:h-9.5 px-5 rounded-full bg-[#651317] hover:bg-[#4f0f12] text-white text-xs sm:text-sm font-bold active:scale-95 transition-all shadow-xs"
              >
                {isHi ? "लॉग इन करें" : "Log In to Participate"}
              </Button>
            </div>
          ) : myJoinedGroups.length > 0 ? (
            /* State 2: User logged in, >=1 joined group */
            <div className="flex gap-3.5 overflow-x-auto pb-2 pt-0.5 -mx-1 px-1 scrollbar-none [&::-webkit-scrollbar]:hidden snap-x snap-mandatory">
              {myJoinedGroups.map((group) => (
                <div
                  key={group.id}
                  className="w-[240px] shrink-0 snap-start bg-white dark:bg-stone-900 border border-[#E8D8C4] dark:border-stone-800 rounded-3xl overflow-hidden shadow-xs flex flex-col justify-between hover:shadow-md transition-all"
                >
                  {/* Header banner image — same h-36 as all-groups cards */}
                  <div className="h-36 w-full relative overflow-hidden bg-[#FAF6EE] dark:bg-stone-950">
                    <img
                      src={getGroupImage(group.image_url)}
                      alt={group.name}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/65 via-transparent to-black/15" />

                    {/* Public/Private badge — top right */}
                    <span className={`absolute top-2.5 right-2.5 text-[9px] font-bold px-2 py-0.5 rounded-full text-white flex items-center gap-1 shadow-xs ${
                      group.is_public ? "bg-emerald-600/90" : "bg-amber-600/90"
                    }`}>
                      {group.is_public ? <Globe className="w-2.5 h-2.5" /> : <Lock className="w-2.5 h-2.5" />}
                      {group.is_public ? (isHi ? "सार्वजनिक" : "Public") : (isHi ? "निजी" : "Private")}
                    </span>

                    {/* Avatar stack — bottom left */}
                    <div className="absolute bottom-2.5 left-2.5 flex -space-x-1.5 z-10">
                      {[...Array(Math.min(3, group.member_count || 1))].map((_, idx) => (
                        <div
                          key={idx}
                          className="w-6 h-6 rounded-full bg-[#FAF0E4] border border-white dark:border-stone-900 flex items-center justify-center font-bold text-[8px] text-[#651317] shadow-xs"
                        >
                          {String.fromCharCode(65 + idx)}
                        </div>
                      ))}
                      {(group.member_count || 0) > 3 && (
                        <div className="w-6 h-6 rounded-full bg-[#FAF0E4] dark:bg-stone-800 border border-white dark:border-stone-900 flex items-center justify-center font-bold text-[8px] text-[#651317] dark:text-amber-400 shadow-xs">
                          +{(group.member_count || 0) - 3}
                        </div>
                      )}
                    </div>

                    {/* Member count — bottom right */}
                    <div className="absolute bottom-2.5 right-2.5 left-12 text-right">
                      <p className="text-[10px] text-amber-200 font-semibold truncate flex items-center justify-end gap-1">
                        <Users className="w-3 h-3 text-amber-300 shrink-0" />
                        {group.member_count || 0} {isHi ? "सदस्य" : "members"}
                      </p>
                    </div>
                  </div>

                  {/* Content section */}
                  <div className="p-3.5 flex-1 flex flex-col justify-between space-y-2.5">
                    <div>
                      <h3 className="font-display text-sm font-bold text-[#651317] dark:text-amber-100 leading-snug line-clamp-1 text-left">
                        {group.name}
                      </h3>
                      {group.invite_code && (
                        <div className="flex items-center justify-between bg-[#FAF6EE] dark:bg-stone-800/80 px-2.5 py-1 rounded-lg mt-1.5 text-[10px] font-semibold text-[#7c2d12] dark:text-amber-300 border border-[#E8D8C4]/60">
                          <span className="font-mono tracking-wider">CODE: {group.invite_code}</span>
                          <button
                            type="button"
                            onClick={() => shareOnWhatsApp(group.invite_code, group.name)}
                            className="text-[#651317] dark:text-amber-400 hover:scale-110 transition-transform p-0.5"
                            title={isHi ? "व्हाट्सएप शेयर" : "Share on WhatsApp"}
                          >
                            <Share2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      )}
                    </div>

                    {/* Enter Group Hall — standard page button style */}
                    <button
                      onClick={() => navigate(`/community/groups/${group.id}`)}
                      className="w-full h-9 sm:h-9.5 rounded-full text-xs sm:text-sm font-bold bg-[#651317] hover:bg-[#4f0f12] text-white flex items-center justify-center gap-1.5 active:scale-[0.98] transition-all shadow-xs cursor-pointer leading-none"
                    >
                      <span>{isHi ? "समूह में प्रवेश करें" : "Enter Group Hall"}</span>
                      <ArrowRight className="w-3.5 h-3.5 text-amber-300" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            /* State 3: User logged in, but 0 joined groups */
            <div className="w-full bg-[#FAF6EE] dark:bg-[#120E0A] border border-dashed border-[#E8D8C4] dark:border-stone-800 rounded-2xl p-5 text-center flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="text-left space-y-1">
                <h3 className="font-display text-sm font-extrabold text-[#651317] dark:text-amber-100">
                  {isHi ? "आप अभी किसी समूह के सदस्य नहीं हैं" : "You haven't joined any group yet"}
                </h3>
                <p className="text-xs text-[#8C7A6B] dark:text-stone-400 font-medium">
                  {isHi ? "नीचे दिए गए समूहों में शामिल हों या अपना समूह बनाएं" : "Join from active groups below or create your own"}
                </p>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <button
                  onClick={() => document.getElementById("groups-filter-tabs")?.scrollIntoView({ behavior: "smooth" })}
                  className="inline-flex items-center justify-center gap-1.5 h-9 sm:h-9.5 px-4 rounded-full bg-white dark:bg-stone-800 text-[#651317] dark:text-amber-100 border border-[#E8D8C4] font-bold text-xs sm:text-sm active:scale-95 transition-all shadow-xs shrink-0 cursor-pointer whitespace-nowrap leading-none"
                >
                  <Search className="w-3.5 h-3.5" />
                  {isHi ? "समूह खोजें" : "Explore Groups"}
                </button>
                <button
                  onClick={() => setCreateDialogOpen(true)}
                  className="inline-flex items-center justify-center gap-1.5 h-9 sm:h-9.5 px-4 rounded-full bg-[#651317] hover:bg-[#4f0f12] text-white font-bold text-xs sm:text-sm active:scale-95 transition-all shadow-xs shrink-0 cursor-pointer whitespace-nowrap leading-none"
                >
                  <Plus className="w-4 h-4 text-white" />
                  <span>{isHi ? "नया समूह बनाएं" : "Create Group"}</span>
                </button>
              </div>
            </div>
          )}
        </div>

        {/* ─── STATISTICS PANEL (Balanced, Clean 1-Row Layout) ─── */}
        <div className="w-full bg-[#FFFDF8] dark:bg-[#1A120B] border border-[#E8D8C4] dark:border-stone-800 rounded-2xl py-3 px-2 sm:px-4 md:py-3.5 md:px-6 shadow-xs">
          <div className="grid grid-cols-4 divide-x divide-[#E8D8C4]/60 dark:divide-stone-800/80">
            {/* Stat 1: Devotees */}
            <div className="flex flex-col items-center justify-center py-1 px-1 sm:px-2 text-center min-w-0">
              <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-[#FAF0E4] dark:bg-[#2B1F14] border border-[#F3E5D8]/80 flex items-center justify-center mb-1.5 shadow-2xs shrink-0">
                <Users className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-[#651317] dark:text-amber-300 stroke-[1.8]" />
              </div>
              <span className="text-xs sm:text-sm md:text-base font-bold text-[#651317] dark:text-amber-100 leading-tight tabular-nums block truncate max-w-full text-center">
                {globalStats.devotees >= 1000 ? `${(globalStats.devotees / 1000).toFixed(1)}K+` : globalStats.devotees}
              </span>
              <span className="text-[10px] sm:text-xs font-semibold text-[#8C7A6B] dark:text-stone-400 mt-1 whitespace-nowrap truncate w-full text-center block leading-tight">
                {isHi ? "भक्त" : "Devotees"}
              </span>
            </div>

            {/* Stat 2: Name Chants */}
            <div className="flex flex-col items-center justify-center py-1 px-1 sm:px-2 text-center min-w-0">
              <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-[#FAF0E4] dark:bg-[#2B1F14] border border-[#F3E5D8]/80 flex items-center justify-center mb-1.5 shadow-2xs shrink-0">
                <Flame className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-[#651317] dark:text-amber-300 stroke-[1.8]" />
              </div>
              <span className="text-xs sm:text-sm md:text-base font-bold text-[#651317] dark:text-amber-100 leading-tight tabular-nums block truncate max-w-full text-center">
                {globalStats.totalJaps >= 10000000 
                  ? `${(globalStats.totalJaps / 10000000).toFixed(1)}Cr+`
                  : globalStats.totalJaps >= 100000 
                  ? `${(globalStats.totalJaps / 100000).toFixed(1)}L+`
                  : globalStats.totalJaps.toLocaleString()}
              </span>
              <span className="text-[10px] sm:text-xs font-semibold text-[#8C7A6B] dark:text-stone-400 mt-1 whitespace-nowrap truncate w-full text-center block leading-tight">
                {isHi ? "नाम जप" : "Naam Jap"}
              </span>
            </div>

            {/* Stat 3: Bhajans Shared */}
            <div className="flex flex-col items-center justify-center py-1 px-1 sm:px-2 text-center min-w-0">
              <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-[#FAF0E4] dark:bg-[#2B1F14] border border-[#F3E5D8]/80 flex items-center justify-center mb-1.5 shadow-2xs shrink-0">
                <Music className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-[#651317] dark:text-amber-300 stroke-[1.8]" />
              </div>
              <span className="text-xs sm:text-sm md:text-base font-bold text-[#651317] dark:text-amber-100 leading-tight tabular-nums block truncate max-w-full text-center">
                {globalStats.bhajansCount}
              </span>
              <span className="text-[10px] sm:text-xs font-semibold text-[#8C7A6B] dark:text-stone-400 mt-1 whitespace-nowrap truncate w-full text-center block leading-tight">
                {isHi ? "भजन" : "Bhajans"}
              </span>
            </div>

            {/* Stat 4: Satsang & Events */}
            <div className="flex flex-col items-center justify-center py-1 px-1 sm:px-2 text-center min-w-0">
              <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-[#FAF0E4] dark:bg-[#2B1F14] border border-[#F3E5D8]/80 flex items-center justify-center mb-1.5 shadow-2xs shrink-0">
                <Calendar className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-[#651317] dark:text-amber-300 stroke-[1.8]" />
              </div>
              <span className="text-xs sm:text-sm md:text-base font-bold text-[#651317] dark:text-amber-100 leading-tight tabular-nums block truncate max-w-full text-center">
                {globalStats.eventsCount}
              </span>
              <span className="text-[10px] sm:text-xs font-semibold text-[#8C7A6B] dark:text-stone-400 mt-1 whitespace-nowrap truncate w-full text-center block leading-tight">
                {isHi ? "सत्संग" : "Satsang"}
              </span>
            </div>
          </div>
        </div>

        {/* ─── SEARCH INPUT BAR & FILTER TABS ────────────────────── */}
        <div id="groups-filter-tabs" className="w-full space-y-3">
          {/* Search Bar (Matching Standardized SearchBar Component) */}
          <div className="relative flex items-center w-full h-12 sm:h-12.5 bg-white dark:bg-[#1E1710] border border-[#EFE4D7] dark:border-zinc-800/80 rounded-full shadow-[0_4px_20px_rgba(80,45,20,0.04)] pl-3.5 sm:pl-4 pr-1.5 sm:pr-2 gap-2 sm:gap-2.5 focus-within:border-[#6A2C2A] dark:focus-within:border-[#E8B15C] focus-within:ring-2 focus-within:ring-[#6A2C2A]/10 transition-all duration-200">
            <div className="w-7 h-7 sm:w-7.5 sm:h-7.5 rounded-full bg-[#651317]/8 dark:bg-amber-400/10 flex items-center justify-center shrink-0">
              <Search className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-[#6A2C2A] dark:text-[#E8B15C] shrink-0 select-none pointer-events-none" />
            </div>
            <input
              type="text"
              placeholder={isHi ? "नाम या समूह खोजें..." : "Search name or group..."}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="flex-1 min-w-0 w-full bg-transparent border-0 outline-none text-xs sm:text-sm font-medium text-[#32251E] dark:text-foreground placeholder:text-[#7A6B60]/70 py-1.5"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery("")}
                className="text-stone-400 hover:text-stone-600 dark:hover:text-white p-1 rounded-full hover:bg-stone-100 dark:hover:bg-white/10 shrink-0 transition-colors"
                title="Clear search"
              >
                <X className="w-4 h-4" />
              </button>
            )}
            <button
              type="button"
              className="inline-flex items-center justify-center gap-1.5 h-9 sm:h-9.5 px-4 sm:px-4.5 rounded-full bg-[#651317] hover:bg-[#4f0f12] text-white font-bold text-xs sm:text-sm active:scale-95 transition-all shadow-xs shrink-0 cursor-pointer whitespace-nowrap leading-none"
            >
              <Search className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">{isHi ? "खोजें" : "Search"}</span>
            </button>
          </div>

          {/* Filter tabs row scrollable */}
          <div className="w-full flex items-center gap-2 overflow-x-auto pb-1 mt-3 scroll-smooth" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
            {[
              { id: "all", labelHi: "सभी समूह", labelEn: "All Groups" },
              { id: "my", labelHi: "मेरे समूह", labelEn: "My Groups", authOnly: true },
              { id: "trending", labelHi: "ट्रेंडिंग", labelEn: "Trending" },
              { id: "japa", labelHi: "नाम जप समूह", labelEn: "Naam Jap Groups" },
            ].map((tab) => {
              const isActive = selectedTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => {
                    if (tab.authOnly && !user) {
                      toast.info(isHi ? "कृपया अपने समूह देखने के लिए लॉग इन करें" : "Please log in to view your groups");
                      navigate("/auth/login?redirect=/community");
                    } else {
                      setSelectedTab(tab.id);
                    }
                  }}
                  className={cn(
                    "inline-flex items-center justify-center gap-1.5 h-9 sm:h-9.5 px-4 sm:px-4.5 rounded-full font-bold text-xs sm:text-sm active:scale-95 transition-all shadow-xs shrink-0 cursor-pointer whitespace-nowrap leading-none border",
                    isActive
                      ? "bg-[#651317] hover:bg-[#4f0f12] text-white border-[#651317]"
                      : "bg-[#FFFDF8] dark:bg-[#1A120B] border-[#E8D8C4] dark:border-stone-800 text-[#651317] dark:text-stone-300 hover:border-[#651317]/50"
                  )}
                >
                  {isHi ? tab.labelHi : tab.labelEn}
                </button>
              );
            })}
          </div>
        </div>

        {/* राधा — after my groups / stats / search */}
        <DevotionalDivider word="राधा" />

        {/* ─── ACTIVE GROUPS SECTION ────────────────────────────── */}
        <div className="w-full text-left">
          <div className="flex items-center justify-between mb-3.5">
            <h2 className="font-display text-lg font-extrabold text-stone-900 dark:text-amber-50">
              {isHi ? "सक्रिय नाम संघ" : "Active Naam Sangh"}
            </h2>
            <button
              onClick={() => navigate("/join-community")}
              onPointerEnter={() => prefetchJoinCommunityPage()}
              className="text-xs font-bold text-orange-600 dark:text-orange-400 hover:underline flex items-center gap-0.5"
            >
              {isHi ? "सभी देखें" : "View All"} <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div
            className="flex gap-4 overflow-x-auto pb-4 pt-1 snap-x scroll-smooth w-full"
            style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
          >
            {loading && groups.length === 0 ? (
              [...Array(3)].map((_, i) => (
                <div key={"skel-"+i} className="w-[250px] shrink-0 rounded-3xl overflow-hidden border border-orange-500/10 bg-white dark:bg-stone-900 animate-pulse">
                  <div className="h-36 w-full bg-stone-200 dark:bg-stone-800" />
                  <div className="p-4 space-y-2">
                    <div className="h-4 w-3/4 rounded bg-stone-200 dark:bg-stone-800" />
                    <div className="h-9 w-full rounded-xl bg-stone-200 dark:bg-stone-800" />
                  </div>
                </div>
              ))
            ) : filteredGroups.length === 0 ? (
              <div className="w-full py-12 text-center text-stone-500 dark:text-stone-400 bg-white dark:bg-stone-900/30 rounded-2xl border border-dashed border-orange-500/15">
                <span className="text-2xl mb-1.5 block">📿</span>
                <p className="font-bold text-xs">
                  {isHi ? "कोई सक्रिय समूह नहीं मिला।" : "No active groups found."}
                </p>
              </div>
            ) : (
              visibleFilteredGroups.map((group) => {
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
                        loading="lazy"
                        decoding="async"
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
                        <img src={mandalaSvg} className="w-full h-full object-contain" alt="" />
                      </div>

                      <div className="relative z-10">
                        <h3 className="font-display text-sm font-black text-stone-900 dark:text-amber-100 leading-snug line-clamp-1 text-left">
                          {group.name}
                        </h3>
                        <p className="text-[10px] text-stone-500 dark:text-stone-400 font-bold mt-1 text-left">
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
                        onClick={() => {
                          if (group.is_member) {
                            navigate(`/community/groups/${group.id}`);
                          } else {
                            handleGroupMembership(group);
                          }
                        }}
                        className="w-full h-9 sm:h-9.5 rounded-full text-xs sm:text-sm font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer bg-[#651317] hover:bg-[#4f0f12] text-white shadow-xs active:scale-[0.98] leading-none"
                      >
                        {group.is_member ? (
                          <span>{isHi ? "समूह देखें" : "View Group"}</span>
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

          {canShowMoreFiltered && (
            <div className="flex justify-center mt-2">
              <button
                type="button"
                onClick={() => void loadMoreGroups()}
                disabled={loadingMore}
                className="inline-flex items-center justify-center gap-1.5 h-9 sm:h-9.5 px-5 rounded-full border border-[#E8D8C4] bg-[#FFFDF8] dark:bg-stone-900 text-[#651317] dark:text-amber-100 text-xs sm:text-sm font-bold hover:bg-white active:scale-95 transition-all shadow-xs disabled:opacity-60 leading-none"
              >
                {loadingMore
                  ? (isHi ? "लोड हो रहा है..." : "Loading...")
                  : (isHi ? "और समूह देखें" : "Load more groups")}
              </button>
            </div>
          )}
        </div>

        {/* ─── QUOTE BLOCK ───────────────────────────────────────── */}
        <div className="relative w-full rounded-2xl bg-[#FAF6EE] dark:bg-stone-900/30 border border-orange-500/15 p-5 max-w-xl mx-auto text-center shadow-xxs">
          <span className="absolute top-2 left-3 font-serif text-3xl text-orange-500/20 leading-none select-none">❝</span>
          <p className="text-xs md:text-sm font-bold text-[#7c2d12] dark:text-amber-250 italic px-4 py-1 leading-relaxed">
            {isHi 
              ? "भक्ति भाव से की गई साधना ही जीवन का सच्चा उद्देश्य प्रदान करती है।" 
              : "Devotional practice done with a pure heart provides the true purpose of life."}
          </p>
          <p className="text-[10px] font-bold text-orange-600 dark:text-orange-400 mt-2">
            {isHi ? "– हनुमान चालीसा" : "– Hanuman Chalisa"}
          </p>
          <span className="absolute bottom-1 right-3 font-serif text-3xl text-orange-500/20 leading-none select-none">❞</span>
        </div>

        {/* राधा — cadence close after active groups + quote */}
        <DevotionalDivider word="राधा" />

        {/* Info Note Footer */}
        <div className="w-full mt-4 flex items-center gap-2.5 justify-center p-3 rounded-2xl bg-amber-500/5 border border-amber-500/10 text-[10px] text-amber-800 dark:text-amber-400 font-bold max-w-md mx-auto text-left">
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
        <DialogContent className="max-w-md md:max-w-3xl bg-[#FFFDF8] dark:bg-[#120F0B] border border-[#E8D8C4] dark:border-stone-800 text-[#3A2418] dark:text-stone-50 rounded-2xl max-h-[92vh] overflow-y-auto p-0 shadow-2xl">
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
              <div className="flex flex-col items-center mb-6">
                <div className="w-12 h-12 rounded-full border border-[#E8D8C4] dark:border-stone-700 bg-[#FAF6EE] dark:bg-stone-900 flex items-center justify-center mb-3">
                  <Users className="w-5 h-5 text-[#651317] dark:text-amber-300" />
                </div>
                <h2 className="font-display font-bold text-lg sm:text-xl text-[#651317] dark:text-amber-100 text-center tracking-tight">
                  {isHi ? "समूह बनाएं" : "Create Community"}
                </h2>
                <p className="text-center text-xs text-[#786252] dark:text-stone-400 mt-1 font-medium">
                  {isHi ? "श्रद्धापूर्वक स्थान बनाएं और साथ मिलकर आगे बढ़ें" : "Build a devotional space and grow together"}
                </p>
              </div>

              <form onSubmit={handleCreateGroup} className="space-y-5">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
                  
                  {/* Left Column */}
                  <div className="space-y-4">
                    {/* Group Name */}
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-[#3A2418] dark:text-stone-300 block">
                        {isHi ? "समूह का नाम" : "Group Name"}
                      </label>
                      <div className="relative">
                        <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#786252]">
                          <Users className="w-4 h-4" />
                        </span>
                        <input
                          type="text"
                          required
                          maxLength={40}
                          placeholder={isHi ? "जैसे: श्री श्याम सत्संग मंडल" : "e.g., Shree Shyam Group"}
                          value={groupName}
                          onChange={(e) => setGroupName(e.target.value)}
                          className={`w-full h-11 rounded-xl border bg-[#FFFDF8] dark:bg-stone-900 pl-10 pr-10 text-sm focus:outline-none focus:ring-1 focus:ring-[#651317]/20 transition-all ${
                            isNameUnique === false
                              ? "border-rose-500 focus:border-rose-500"
                              : "border-[#E8D8C4] dark:border-stone-700 focus:border-[#651317]"
                          }`}
                        />
                        {isNameUnique === true && (
                          <span className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 bg-[#651317] rounded-full flex items-center justify-center text-white">
                            <Check className="w-3 h-3" strokeWidth={3} />
                          </span>
                        )}
                        {isNameUnique === false && (
                          <span className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 bg-rose-100 dark:bg-rose-950/60 rounded-full flex items-center justify-center text-rose-600">
                            <X className="w-3 h-3" strokeWidth={3} />
                          </span>
                        )}
                      </div>
                      {isNameUnique === false && (
                        <p className="text-[10.5px] text-rose-600 dark:text-rose-400 font-medium leading-relaxed mt-1">
                          {isHi
                            ? "यह नाम पहले से लिया गया है। टिप: स्थान का नाम जोड़ें (जैसे: 'जयपुर श्री श्याम ग्रुप सत्संग')।"
                            : "This group name is already taken. Tip: Add a place name (e.g. 'Jaipur Shree Shyam Group') to make it unique."}
                        </p>
                      )}
                      {isNameUnique === true && (
                        <p className="text-[10.5px] text-[#651317] dark:text-amber-300 font-medium leading-relaxed mt-1">
                          {isHi ? "यह नाम उपलब्ध है।" : "This name is available."}
                        </p>
                      )}
                    </div>

                    {/* Description */}
                    <div className="space-y-1.5">
                      <div className="flex justify-between items-center">
                        <label className="text-xs font-bold text-[#3A2418] dark:text-stone-300 block">
                          {isHi ? "विवरण (वैकल्पिक)" : "Description (Optional)"}
                        </label>
                        <span className="text-[9px] text-[#786252] font-medium tabular-nums">
                          {groupDesc.length}/100
                        </span>
                      </div>
                      <div className="relative">
                        <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#786252]">
                          <Pencil className="w-4 h-4" />
                        </span>
                        <input 
                          type="text"
                          maxLength={100}
                          placeholder={isHi ? "श्री राम नाम का संकीर्तन और भक्ति को मिलकर फैलाएं।" : "Chant Sri Rama's name together and spread devotion..."}
                          value={groupDesc}
                          onChange={(e) => setGroupDesc(e.target.value)}
                          className="w-full h-11 rounded-xl border border-[#E8D8C4] dark:border-stone-700 bg-[#FFFDF8] dark:bg-stone-900 pl-10 pr-4 text-sm focus:border-[#651317] focus:outline-none focus:ring-1 focus:ring-[#651317]/20 transition-all"
                        />
                      </div>
                    </div>

                    {/* Invite Code */}
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-[#3A2418] dark:text-stone-300 block">
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
                          className="flex-1 h-11 rounded-xl border border-[#E8D8C4] dark:border-stone-700 bg-[#FFFDF8] dark:bg-stone-900 px-3 text-sm font-bold tracking-widest text-[#651317] dark:text-amber-300 focus:border-[#651317] focus:outline-none focus:ring-1 focus:ring-[#651317]/20 transition-all"
                        />
                        <button
                          type="button"
                          onClick={() => copyInviteCode(inviteCode)}
                          className="h-11 px-4 rounded-xl border border-[#E8D8C4] dark:border-stone-700 bg-[#FFFDF8] dark:bg-stone-900 text-[#786252] hover:text-[#651317] hover:border-[#651317] transition-colors"
                          title="Copy"
                        >
                          <Copy className="w-4 h-4" />
                        </button>
                      </div>
                      <p className="text-[9px] text-[#786252] leading-normal">
                        {isHi ? "इस कोड से भक्त सीधे जुड़ सकते हैं। प्रत्येक समूह का कोड अलग होना चाहिए।" : "Devotees can join directly with this code. Each group must have a unique code."}
                      </p>
                    </div>
                  </div>

                  {/* Right Column */}
                  <div className="space-y-4">
                    {/* Add Your Group Photo (Custom Image Upload) */}
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-[#3A2418] dark:text-stone-400 flex items-center justify-between">
                        <span>{isHi ? "अपने समूह का फ़ोटो जोड़ें" : "Add your group photo"}</span>
                        <span className="text-[9px] text-[#786252] font-normal">{isHi ? "(वैकल्पिक)" : "(Optional)"}</span>
                      </label>
                      <input
                        ref={groupImageInputRef}
                        type="file"
                        accept="image/*"
                        className="sr-only"
                        onChange={handleGroupImageFile}
                      />
                      {customGroupImage ? (
                        <div className="relative group rounded-xl overflow-hidden border border-[#E8D8C4] dark:border-stone-700 aspect-[2/1] bg-[#FAF6EE] dark:bg-stone-900">
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
                          className="w-full flex flex-col items-center justify-center gap-1.5 rounded-xl border border-dashed border-[#E8D8C4] dark:border-stone-700 bg-[#FAF6EE] dark:bg-stone-900/50 py-5 text-xs font-semibold text-[#786252] hover:border-[#651317] hover:text-[#651317] transition-all"
                        >
                          <ImagePlus className="w-5 h-5 text-[#651317]" />
                          <span>{isHi ? "फ़ोटो अपलोड करें" : "Upload group photo"}</span>
                        </button>
                      )}
                    </div>

                    {/* Choose Preset Deity circular avatars */}
                    <div className="space-y-2.5">
                      <div className="flex items-center justify-between">
                        <label className="text-xs font-bold text-[#3A2418] dark:text-stone-300 block">
                          {isHi ? "या इष्ट देव चित्र चुनें" : "Or Choose Preset Deity Image"}
                        </label>
                        <span className="text-[10px] text-[#786252] font-medium">
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
                                <div className={`w-12 h-12 rounded-full overflow-hidden border transition-all p-0.5 ${
                                  isSelected 
                                    ? "border-[#651317] ring-2 ring-[#651317] ring-offset-2 ring-offset-[#FFFDF8] dark:ring-offset-[#120F0B]" 
                                    : "border-[#E8D8C4] dark:border-stone-700 opacity-85 hover:opacity-100"
                                }`}>
                                  <img src={img.src} alt={img.name} className="w-full h-full object-cover rounded-full" />
                                </div>
                                {isSelected && (
                                  <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-[#651317] text-white rounded-full flex items-center justify-center border-2 border-[#FFFDF8] dark:border-[#120F0B]">
                                    <Check className="w-2.5 h-2.5" strokeWidth={3} />
                                  </span>
                                )}
                              </div>
                              <span className={`text-[9.5px] font-semibold transition-colors ${
                                isSelected 
                                  ? "text-[#651317] dark:text-amber-300" 
                                  : "text-[#786252] dark:text-stone-400"
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
                  <label className="text-xs font-bold text-[#3A2418] dark:text-stone-400">
                    {isHi ? "दृश्यता" : "Visibility"}
                  </label>
                  <div className="grid grid-cols-2 gap-3">
                    <button
                      type="button"
                      onClick={() => setIsPublic(true)}
                      className={`flex flex-col items-center justify-center py-3 px-4 rounded-xl border transition-all text-center gap-1 ${
                        isPublic
                          ? "border-[#651317] bg-[#651317]/5 text-[#651317] dark:text-amber-300 font-bold"
                          : "border-[#E8D8C4] dark:border-stone-700 text-[#786252]"
                      }`}
                    >
                      <Globe className={`w-5 h-5 ${isPublic ? "text-[#651317]" : "text-[#786252]"}`} />
                      <span className="text-xs font-bold select-none mt-0.5">
                        {isHi ? "सार्वजनिक (Public)" : "Public"}
                      </span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setIsPublic(false)}
                      className={`flex flex-col items-center justify-center py-3 px-4 rounded-xl border transition-all text-center gap-1 ${
                        !isPublic
                          ? "border-[#651317] bg-[#651317]/5 text-[#651317] dark:text-amber-300 font-bold"
                          : "border-[#E8D8C4] dark:border-stone-700 text-[#786252]"
                      }`}
                    >
                      <Lock className={`w-5 h-5 ${!isPublic ? "text-[#651317]" : "text-[#786252]"}`} />
                      <span className="text-xs font-bold select-none mt-0.5">
                        {isHi ? "निजी (Private)" : "Private"}
                      </span>
                    </button>
                  </div>
                </div>

                {/* Green Shield Warning Banner */}
                <div className="flex items-center gap-3 p-3.5 rounded-2xl bg-[#FAF6EE] dark:bg-stone-900 border border-[#E8D8C4] dark:border-stone-800">
                  <span className="w-8 h-8 rounded-full bg-[#651317] text-white flex items-center justify-center shrink-0">
                    <Shield className="w-4 h-4" />
                  </span>
                  <div className="text-left flex-1">
                    <p className="text-xs font-bold text-[#3A2418] dark:text-stone-200 leading-tight">
                      {isPublic 
                        ? (isHi ? "सार्वजनिक समूह: कोई भी भक्त शामिल हो सकता है।" : "Public Group: Anyone can join and chant.")
                        : (isHi ? "निजी समूह: आमंत्रण लिंक की आवश्यकता होगी।" : "Private Group: Invitation code will be required.")}
                    </p>
                    <p className="text-[10px] text-[#786252] dark:text-stone-400 mt-0.5 font-medium">
                      {isHi 
                        ? "भक्तिभाव और पवित्र वातावरण बनाए रखें।" 
                        : "Please maintain a devotional and pure atmosphere."}
                    </p>
                  </div>
                </div>

                {/* Submit and Cancel Buttons */}
                <div className="space-y-2 pt-2">
                  <button
                    type="submit"
                    disabled={submitting || isNameUnique === false}
                    className="w-full h-12 rounded-full bg-[#651317] hover:bg-[#4f0f12] text-white font-bold text-sm active:scale-[0.98] transition-all disabled:opacity-50"
                  >
                    {submitting
                      ? (isHi ? "बन रहा है..." : "Creating...")
                      : (isHi ? "समूह बनाएं" : "Create Group")}
                  </button>
                  
                  <button
                    type="button"
                    onClick={closeCreateDialog}
                    className="w-full text-center text-sm font-semibold text-[#651317] dark:text-amber-300 hover:text-[#4f0f12] py-2"
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
                  <div className="w-14 h-14 rounded-full bg-[#651317] flex items-center justify-center shadow-lg">
                    <Check className="w-7 h-7 text-white" strokeWidth={3} />
                  </div>
                </div>
              </div>

              <h2 className="font-display text-xl font-bold text-[#651317] dark:text-amber-100 leading-tight">
                {createdGroupData.name}
              </h2>
              <p className="text-sm font-semibold text-[#786252] dark:text-amber-400 mt-0.5 mb-4">
                {isHi ? "समूह बन गया" : "Created"}
              </p>

              <div className="mb-4">
                <p className="text-xs text-[#786252] dark:text-stone-400 mb-2 font-semibold uppercase tracking-widest">
                  {isHi ? "आमंत्रण लिंक" : "Invite Link"}
                </p>
                <div className="flex items-center justify-center gap-2">
                  <span className="font-display text-2xl font-semibold text-[#651317] tracking-widest">
                    {createdGroupData.inviteCode}
                  </span>
                  <button
                    type="button"
                    onClick={() => copyInviteCode(createdGroupData.inviteCode)}
                    className="p-1.5 rounded-lg border border-[#E8D8C4] bg-[#FAF6EE] dark:bg-stone-800 hover:border-[#651317] transition-colors"
                    title="Copy code"
                  >
                    <Copy className="w-4 h-4 text-[#786252]" />
                  </button>
                </div>
                <p className="text-[10px] text-[#786252] mt-1.5 break-all">
                  {window.location.origin}/community?join={createdGroupData.inviteCode}
                </p>
              </div>

              <p className="text-xs text-[#786252] dark:text-stone-400 mb-3">
                {isHi ? "भक्तों को आमंत्रित करें और मिलकर जाप करें" : "Share and invite devotees to grow together"}
              </p>

              <div className="flex gap-2.5 mb-5">
                <button
                  type="button"
                  onClick={() => {
                    const url = `${window.location.origin}/community?join=${createdGroupData.inviteCode}`;
                    navigator.clipboard.writeText(url);
                    toast.success(isHi ? "लिंक कॉपी किया गया!" : "Link copied!");
                  }}
                  className="flex-1 flex items-center justify-center gap-2 h-11 rounded-full border border-[#E8D8C4] dark:border-stone-700 bg-[#FFFDF8] dark:bg-stone-800 text-xs font-semibold text-[#651317] dark:text-stone-300 hover:border-[#651317] transition-colors"
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
                className="w-full h-12 rounded-full bg-[#651317] hover:bg-[#4f0f12] text-white font-bold"
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
                      <p className="text-xs font-semibold text-amber-600 dark:text-amber-400 tabular-nums leading-none">
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
