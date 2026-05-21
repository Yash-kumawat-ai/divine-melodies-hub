import { forwardRef, useEffect, useImperativeHandle, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { BookOpen, Bot, Heart, Home, Menu, MessageSquarePlus, Mic, Play, Search, Send, Share2, Upload, X } from "lucide-react";
import { Link } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { TextToSpeech, VoiceManager, checkVoiceSupport } from "@/lib/voiceUtils";
import BhajanCard from "@/components/BhajanCard";
import BhajanDetailModal from "@/components/BhajanDetailModal";
import { Bhajan, bhajans as appBhajans, deities as appDeities } from "@/data/bhajans";
import { bhajanMatchesQuery, smartSearchBhajans } from "@/lib/searchAlgorithm";
import { queryUserUploads, searchUserBhajans } from "@/lib/supabaseQueries";
import { generateBhajanSlug } from "@/lib/slugUtils";
import { useIsMobile } from "@/hooks/use-mobile";
import {
  createChatSession,
  deriveChatTitle,
  loadChatSessions,
  saveChatSessions,
  type KirtanChatSession,
} from "@/lib/kirtanChatHistory";
import {
  AddBhajanDraft,
  KirtanBhajan,
  KirtanDeity,
  KirtanLanguage,
  KirtanMood,
  OFFLINE_BHAJANS,
  createBhajanFromDraft,
  exactSearchBhajans,
  filterByDeityAndLanguage,
  filterByMood,
  getOccasionSuggestions,
  isDuplicateBhajan,
  loadSavedBhajans,
  saveBhajans,
} from "@/lib/offlineKirtan";
import { cn } from "@/lib/utils";

type Role = "user" | "bot";
type Flow =
  | { type: "idle" }
  | { type: "find"; step: "deity" | "language"; deity?: KirtanDeity | "All" }
  | { type: "mood"; step: "mood" }
  | { type: "occasion"; step: "date" }
  | { type: "add"; step: "name" | "deity" | "language" | "lyrics" | "singer" | "link" | "confirm"; draft: AddBhajanDraft };

interface Message {
  id: string;
  role: Role;
  text: string;
  options?: string[];
  bhajans?: KirtanBhajan[];
  appBhajans?: Bhajan[];
  searchQuery?: string;
  hasMoreResults?: boolean;
  summary?: AddBhajanDraft;
}

const FAVORITES_KEY = "kirtan_ai_favorites";
const QUICK_ACTIONS = ["Find a Bhajan", "➕ Add a Bhajan", "Suggest Bhajans by Mood", "Bhajans for Today's Occasion", "Aarti Collection", "❤️ My Favorites"];
const DEITY_OPTIONS = ["Krishna", "Shiva", "Devi", "Ganesh", "Hanuman", "All"];
const LANGUAGE_OPTIONS = ["Hindi", "Sanskrit", "Regional", "Any"];
const ADD_DEITIES = ["Krishna", "Shiva", "Devi", "Ganesh", "Hanuman", "General"];
const ADD_LANGUAGES = ["Hindi", "Sanskrit", "Gujarati", "Marathi", "Other"];
const MOOD_OPTIONS = ["Morning Prayer", "Meditation", "Festival", "Grief", "Celebration"];
const NAVIGATION = [
  { icon: Home, label: "Home", path: "/" },
  { icon: BookOpen, label: "All Bhajans", path: "/all-bhajans" },
  { icon: Search, label: "Search", path: "/search" },
  { icon: Upload, label: "Upload", path: "/upload-bhajan" },
];

function id() {
  return `${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

function isGreeting(text: string) {
  return ["hi", "hy", "hello", "hey", "namaste", "ram ram"].includes(text.trim().toLowerCase());
}

function compactLines(value?: string) {
  return (value || "").split(/\r?\n/).filter(Boolean).slice(0, 4);
}

function loadFavorites(): string[] {
  try {
    return JSON.parse(window.localStorage.getItem(FAVORITES_KEY) || "[]") as string[];
  } catch {
    return [];
  }
}

function saveFavorites(ids: string[]) {
  window.localStorage.setItem(FAVORITES_KEY, JSON.stringify(ids));
}

function stripFillerWords(value: string): string {
  return value
    .replace(/\b(mujhe|please|zara|ek|koi)\b/gi, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function extractChatSearchTerm(value: string): { term: string; isSearch: boolean; isDeityBrowse: boolean } {
  let text = stripFillerWords(value);
  const lower = text.toLowerCase();
  const deityBrowse = lower.match(/^(show all\s+)?(krishna|shiv|shiva|hanuman|ganesh|devi|durga|rama|ram|sai|lakshmi|khatu)(\s+ke)?\s+bhajans?$/);

  if (deityBrowse) {
    return { term: deityBrowse[2], isSearch: true, isDeityBrowse: true };
  }

  text = text
    .replace(/^(find|search|dhundho|play|show me)\s+/i, "")
    .replace(/\s+(bhajan chahiye|ka bhajan)$/i, "")
    .trim();

  const directName = text.length >= 3 && !/^(find a bhajan|suggest bhajans by mood|bhajans for today|aarti collection|❤️ my favorites|\+ add a bhajan)$/i.test(text);
  return { term: text, isSearch: directName, isDeityBrowse: false };
}

function convertUploadToBhajan(upload: any, index: number): Bhajan {
  const converted = {
    id: Number.parseInt(String(upload.id), 10) || 100000 + index,
    slug: generateBhajanSlug(upload.title || `uploaded-bhajan-${index}`),
    title: upload.title || "Untitled Bhajan",
    titleHindi: upload.title_hindi || upload.title || "",
    deityId: Number(upload.deity_id) || 0,
    singerName: upload.singer_name || "Unknown",
    composerName: upload.composer_name || "",
    youtubeUrl: upload.youtube_url || "",
    lyricsHindi: upload.lyrics_hindi || "",
    lyricsTransliteration: "",
    playCount: upload.play_count || 0,
    rating: upload.average_rating || 0,
    tags: upload.mood_tags || [],
    featured: false,
  } as Bhajan & { language?: string; aliases?: string[] };

  converted.language = upload.language || "";
  converted.aliases = upload.aliases || [];
  return converted;
}

function getDeityNameForBhajan(bhajan: Bhajan): string {
  const deity = appDeities.find((item) => item.id === bhajan.deityId);
  return [deity?.name, deity?.nameHindi, deity?.slug].filter(Boolean).join(" ");
}

function strictBhajanMatch(term: string, bhajan: Bhajan): boolean {
  if (bhajanMatchesQuery(bhajan, term)) return true;
  const query = term.toLowerCase().trim();
  if (!query) return false;
  return getDeityNameForBhajan(bhajan).toLowerCase().includes(query);
}

function dedupeBhajans(items: Bhajan[]): Bhajan[] {
  const seen = new Set<string>();
  return items.filter((bhajan) => {
    const key = `${bhajan.slug}-${bhajan.title.toLowerCase()}`;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

function speakableBotText(text: string): string {
  return text.replace(/[^\u0900-\u097F\w\s.,!?-]/g, "").trim().slice(0, 220);
}

export type NaradChipKind = "hanuman" | "morning" | "lyrics" | "festival" | "explain";

export interface KirtanAIChatCoreProps {
  /** full = Kirtan AI page layout; compact = floating Narad panel */
  variant?: "page" | "compact";
  className?: string;
  /** Only used when variant is compact */
  inputPlaceholder?: string;
}

export type KirtanAIChatCoreHandle = {
  runNaradChip: (kind: NaradChipKind) => void;
  startNewChat: () => void;
};

const KirtanAIChatCore = forwardRef<KirtanAIChatCoreHandle, KirtanAIChatCoreProps>(function KirtanAIChatCore(
  { variant = "page", className, inputPlaceholder },
  ref,
) {
  const isCompact = variant === "compact";
  const { user, profile } = useAuth();
  const { toast } = useToast();
  const isMobile = useIsMobile();
  const [library, setLibrary] = useState<KirtanBhajan[]>(OFFLINE_BHAJANS);
  const [uploadedBhajans, setUploadedBhajans] = useState<Bhajan[]>([]);
  const [favorites, setFavorites] = useState<string[]>([]);
  const [chatSessions, setChatSessions] = useState<KirtanChatSession[]>([]);
  const [activeSessionId, setActiveSessionId] = useState<string>("");
  const [messages, setMessages] = useState<Message[]>([]);
  const [flow, setFlow] = useState<Flow>({ type: "idle" });
  const [input, setInput] = useState("");
  const [typing, setTyping] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [voiceSupport, setVoiceSupport] = useState({ recognition: true, synthesis: true });
  const [selectedBhajan, setSelectedBhajan] = useState<Bhajan | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const voiceRef = useRef<VoiceManager | null>(null);
  const ttsRef = useRef<TextToSpeech | null>(null);
  const endRef = useRef<HTMLDivElement>(null);
  const displayName = profile?.name || user?.email?.split("@")[0] || "User";

  useEffect(() => {
    setLibrary([...OFFLINE_BHAJANS, ...loadSavedBhajans()]);
    setFavorites(loadFavorites());
    const stored = loadChatSessions();
    const initial = stored[0] ?? createChatSession();
    const sessions = stored.length ? stored : [initial];
    setChatSessions(sessions);
    setActiveSessionId(initial.id);
    setMessages((initial.messages as Message[]) ?? []);
    setSidebarOpen(!isCompact && window.innerWidth >= 768);
    const support = checkVoiceSupport();
    setVoiceSupport(support);
    if (support.recognition) voiceRef.current = new VoiceManager();
    if (support.synthesis) ttsRef.current = new TextToSpeech();

    void (async () => {
      try {
        const { data, error } = await queryUserUploads({ orderBy: "created_at", limit: 400 });
        if (error || !data) return;
        setUploadedBhajans(dedupeBhajans((data as unknown[]).map(convertUploadToBhajan)));
      } catch (error) {
        console.error("Kirtan AI: preload uploads failed:", error);
      }
    })();

    return () => {
      voiceRef.current?.stopListening();
      ttsRef.current?.stop();
    };
  }, []);

  useEffect(() => {
    if (!activeSessionId) return;
    const title = deriveChatTitle(messages as KirtanChatSession['messages']);
    setChatSessions((prev) => {
      const next = prev.map((session) =>
        session.id === activeSessionId
          ? { ...session, messages: messages as KirtanChatSession['messages'], title, updatedAt: Date.now() }
          : session,
      );
      saveChatSessions(next);
      return next.sort((a, b) => b.updatedAt - a.updatedAt);
    });
  }, [messages, activeSessionId]);

  const startNewChat = () => {
    const session = createChatSession();
    setChatSessions((prev) => {
      const next = [session, ...prev];
      saveChatSessions(next);
      return next;
    });
    setActiveSessionId(session.id);
    setMessages([]);
    setFlow({ type: "idle" });
    setInput("");
    if (isMobile) setSidebarOpen(false);
  };

  const openChatSession = (sessionId: string) => {
    const session = chatSessions.find((item) => item.id === sessionId);
    if (!session) return;
    setActiveSessionId(session.id);
    setMessages((session.messages as Message[]) ?? []);
    setFlow({ type: "idle" });
    if (isMobile) setSidebarOpen(false);
  };

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, typing]);

  const pushUser = (text: string) => setMessages((prev) => [...prev, { id: id(), role: "user", text }]);

  const pushBot = (message: Omit<Message, "id" | "role">, speak = true) => {
    setTyping(true);
    window.setTimeout(() => {
      setMessages((prev) => [...prev, { id: id(), role: "bot", ...message }]);
      setTyping(false);
      if (speak && voiceSupport.synthesis && ttsRef.current && message.text) {
        const line = speakableBotText(message.text);
        if (line) ttsRef.current.speak(line, "hi");
      }
    }, isCompact ? 120 : 300);
  };

  const showQuickActions = () => {
    pushBot({
      text: `Namaste ${displayName}. Main offline Kirtan AI hoon. Aap kya karna chahenge?`,
      options: QUICK_ACTIONS,
    });
  };

  const startFindFlow = () => {
    setFlow({ type: "find", step: "deity" });
    pushBot({ text: "Kaunse deity ke bhajan chahiye?", options: DEITY_OPTIONS });
  };

  const startAddFlow = () => {
    setFlow({ type: "add", step: "name", draft: {} });
    pushBot({ text: "Bilkul. Step 1: Bhajan ka exact name batayein." });
  };

  const startMoodFlow = () => {
    setFlow({ type: "mood", step: "mood" });
    pushBot({ text: "Aapka current mood/occasion kya hai?", options: MOOD_OPTIONS });
  };

  const startOccasionFlow = () => {
    setFlow({ type: "occasion", step: "date" });
    const results = getOccasionSuggestions(library).slice(0, 6);
    pushBot({
      text: "Aaj ke liye suggestion: weekday ke hisaab se curated bhajans yeh rahe. Monday ko Shiva, Tuesday/Saturday ko Hanuman, Wednesday ko Ganesh, Friday ko Devi.",
      bhajans: results,
    });
    setFlow({ type: "idle" });
  };

  const showAartiCollection = () => {
    const results = library.filter((bhajan) => bhajan.mood.includes("Aarti"));
    pushBot({ text: "Aarti collection ready hai.", bhajans: results });
  };

  const showFavorites = () => {
    const results = library.filter((bhajan) => favorites.includes(bhajan.id));
    pushBot({
      text: results.length ? "Yeh aapke saved favorites hain." : "Abhi favorites empty hain. Kisi bhajan card par heart dabaiye.",
      bhajans: results,
    });
  };

  const runExactSearch = (query: string) => {
    const results = exactSearchBhajans(query, library);
    pushBot({
      text: results.length ? "Exact match mil gaya." : "Bhajan not found in our library. Would you like to add it?",
      options: results.length ? undefined : ["➕ Add a Bhajan"],
      bhajans: results,
    });
  };

  const runExistingBhajanSearch = async (query: string, isDeityBrowse = false) => {
    const term = query.trim();
    if (!term) return;

    const searchPool = dedupeBhajans([...appBhajans, ...uploadedBhajans]);
    const localMatches = isDeityBrowse
      ? searchPool.filter((bhajan) => strictBhajanMatch(term, bhajan))
      : smartSearchBhajans(term, searchPool);

    const pushSearchResults = (combined: Bhajan[]) => {
      pushBot({
        text: combined.length
          ? `Yeh results mile "${term}" ke liye. Card par click karke details popup open karein.`
          : `कोई भजन नहीं मिला '${term}' के लिए। क्या आप इसे add करना चाहते हैं?`,
        options: combined.length ? undefined : ["Yes, Add It", "No Thanks"],
        appBhajans: combined.slice(0, 6),
        searchQuery: term,
        hasMoreResults: combined.length > 6,
      });
    };

    if (localMatches.length > 0) {
      pushSearchResults(localMatches);
      return;
    }

    try {
      const uploadRows = await searchUserBhajans(term, 20);
      const fromApi = uploadRows.map(convertUploadToBhajan);
      const combined = smartSearchBhajans(term, dedupeBhajans([...searchPool, ...fromApi]));
      pushSearchResults(combined);
    } catch (error) {
      console.error("Kirtan AI search failed:", error);
      pushBot({
        text: `कोई भजन नहीं मिला '${term}' के लिए। क्या आप इसे add करना चाहते हैं?`,
        options: ["Yes, Add It", "No Thanks"],
        searchQuery: term,
      });
    }
  };

  const handleFindFlow = (value: string) => {
    if (flow.type !== "find") return;
    if (flow.step === "deity") {
      const deity = value as KirtanDeity | "All";
      setFlow({ type: "find", step: "language", deity });
      pushBot({ text: "Language kya chahiye?", options: LANGUAGE_OPTIONS });
      return;
    }

    const results = filterByDeityAndLanguage(library, flow.deity || "All", value as KirtanLanguage | "Regional" | "Any");
    pushBot({
      text: results.length ? "Filtered bhajans mil gaye. Card se details/play open kar sakte hain." : "Bhajan not found in our library. Would you like to add it?",
      options: results.length ? undefined : ["➕ Add a Bhajan"],
      bhajans: results.slice(0, 12),
    });
    setFlow({ type: "idle" });
  };

  const handleMoodFlow = (value: string) => {
    const results = filterByMood(library, value as KirtanMood);
    pushBot({
      text: results.length ? `${value} ke liye curated bhajans:` : "Bhajan not found in our library. Would you like to add it?",
      options: results.length ? undefined : ["➕ Add a Bhajan"],
      bhajans: results.slice(0, 10),
    });
    setFlow({ type: "idle" });
  };

  const handleAddFlow = (value: string) => {
    if (flow.type !== "add") return;
    const v = value.trim();

    if (flow.step === "name") {
      const duplicate = isDuplicateBhajan(v, library);
      if (duplicate) {
        pushBot({ text: "This bhajan already exists", bhajans: [duplicate] });
        setFlow({ type: "idle" });
        return;
      }
      setFlow({ type: "add", step: "deity", draft: { name: v } });
      pushBot({ text: "Step 2: Deity/category select karein.", options: ADD_DEITIES });
      return;
    }

    if (flow.step === "deity") {
      setFlow({ type: "add", step: "language", draft: { ...flow.draft, deity: v as KirtanDeity } });
      pushBot({ text: "Step 3: Language select karein.", options: ADD_LANGUAGES });
      return;
    }

    if (flow.step === "language") {
      setFlow({ type: "add", step: "lyrics", draft: { ...flow.draft, language: v as KirtanLanguage } });
      pushBot({ text: "Step 4: Lyrics optional hain. Agar nahi hain to Skip likhein." });
      return;
    }

    if (flow.step === "lyrics") {
      setFlow({ type: "add", step: "singer", draft: { ...flow.draft, lyrics_preview: /^skip$/i.test(v) ? "" : v } });
      pushBot({ text: "Step 5: Singer/album optional. Agar nahi pata to Skip likhein." });
      return;
    }

    if (flow.step === "singer") {
      setFlow({ type: "add", step: "link", draft: { ...flow.draft, singer: /^skip$/i.test(v) ? "" : v } });
      pushBot({ text: "Step 6: YouTube/audio link optional. Agar nahi hai to Skip likhein." });
      return;
    }

    if (flow.step === "link") {
      const draft = { ...flow.draft, youtube_link: /^skip$/i.test(v) ? "" : v };
      setFlow({ type: "add", step: "confirm", draft });
      pushBot({ text: "Summary check kar lijiye. Confirm to save?", summary: draft, options: ["Confirm", "Cancel"] });
      return;
    }

    if (flow.step === "confirm") {
      if (!/^confirm$/i.test(v)) {
        pushBot({ text: "Add flow cancel kar diya.", options: QUICK_ACTIONS });
        setFlow({ type: "idle" });
        return;
      }

      const draft = flow.draft;
      if (!draft.name || !draft.deity || !draft.language) {
        pushBot({ text: "Required details missing hain. Please Add Bhajan dobara start karein.", options: ["➕ Add a Bhajan"] });
        setFlow({ type: "idle" });
        return;
      }

      const newBhajan = createBhajanFromDraft({
        name: draft.name,
        deity: draft.deity,
        language: draft.language,
        lyrics_preview: draft.lyrics_preview || "",
        singer: draft.singer || "",
        youtube_link: draft.youtube_link || "",
      });
      const saved = [...loadSavedBhajans(), newBhajan];
      saveBhajans(saved);
      setLibrary([...OFFLINE_BHAJANS, ...saved]);
      pushBot({ text: "Saved. Ye bhajan ab immediately searchable hai.", bhajans: [newBhajan] });
      setFlow({ type: "idle" });
    }
  };

  const handleAction = async (value: string) => {
    const text = value.trim();
    if (!text) return;
    pushUser(text);

    if (flow.type === "find") return handleFindFlow(text);
    if (flow.type === "mood") return handleMoodFlow(text);
    if (flow.type === "add") return handleAddFlow(text);

    const normalized = text.toLowerCase();
    if (normalized === "yes, add it") return startAddFlow();
    if (normalized === "no thanks") return pushBot({ text: "Theek hai. Aap koi aur bhajan search kar sakte hain.", options: QUICK_ACTIONS });
    if (isGreeting(text)) return showQuickActions();
    if (normalized.includes("add")) return startAddFlow();
    const detected = extractChatSearchTerm(text);
    if (detected.isSearch && normalized !== "find a bhajan") return runExistingBhajanSearch(detected.term, detected.isDeityBrowse);
    if (normalized === "find a bhajan") return startFindFlow();
    if (normalized.includes("mood") || normalized.includes("suggest")) return startMoodFlow();
    if (normalized.includes("occasion") || normalized.includes("today")) return startOccasionFlow();
    if (normalized.includes("aarti")) return showAartiCollection();
    if (normalized.includes("favorite")) return showFavorites();
    runExactSearch(text);
  };

  const toggleFavorite = (bhajan: KirtanBhajan) => {
    setFavorites((prev) => {
      const next = prev.includes(bhajan.id) ? prev.filter((item) => item !== bhajan.id) : [...prev, bhajan.id];
      saveFavorites(next);
      return next;
    });
  };

  const shareBhajan = async (bhajan: KirtanBhajan) => {
    const text = `${bhajan.name}${bhajan.youtube_link ? ` - ${bhajan.youtube_link}` : ""}`;
    await navigator.clipboard?.writeText(text);
    toast({ title: "Copied", description: "Bhajan name/link clipboard mein copy ho gaya." });
  };

  const submitInput = () => {
    const value = input;
    setInput("");
    handleAction(value);
  };

  const startListening = () => {
    if (!voiceRef.current) return;
    ttsRef.current?.stop();
    voiceRef.current.resetTranscript();
    voiceRef.current.startListening(
      (transcript) => setInput(transcript),
      (error) => {
        setIsListening(false);
        toast({ title: "Voice error", description: error, variant: "destructive" });
      },
      () => {
        setIsListening(true);
      },
      () => {
        setIsListening(false);
        const transcript = voiceRef.current?.getTranscript() || "";
        if (transcript.trim()) handleAction(transcript);
      },
    );
  };

  const handlersRef = useRef({
    pushUser: (_t: string) => {},
    handleMoodFlow: (_v: string) => {},
    runExistingBhajanSearch: async (_q: string, _d?: boolean) => {},
    pushBot: (_m: Omit<Message, "id" | "role">) => {},
    startNewChat: () => {},
  });
  handlersRef.current = { pushUser, handleMoodFlow, runExistingBhajanSearch, pushBot, startNewChat };

  useImperativeHandle(ref, () => ({
    runNaradChip(kind: NaradChipKind) {
      const h = handlersRef.current;
      switch (kind) {
        case "hanuman":
          h.pushUser("Find Hanuman Bhajan");
          void h.runExistingBhajanSearch("hanuman", true);
          break;
        case "morning":
          h.pushUser("Morning Bhajans");
          h.handleMoodFlow("Morning Prayer");
          break;
        case "lyrics":
          h.pushUser("Bhajan by Lyrics");
          void h.runExistingBhajanSearch("hare krishna mahamantra", false);
          break;
        case "festival":
          h.pushUser("Festival Playlist");
          h.handleMoodFlow("Festival");
          break;
        case "explain":
          h.pushUser("Explain this Bhajan");
          h.pushBot({
            text: "Kripya neeche bhajan ka naam likhein aur bhejein. Jab aap card par click karenge, poora lyrics aur play options Kirtan AI ki tarah khulenge.",
            options: ["Find a Bhajan", "Suggest Bhajans by Mood"],
          });
          break;
      }
    },
    startNewChat: () => handlersRef.current.startNewChat(),
  }));

  return (
    <motion.div
      className={cn(
        "flex min-h-0 flex-col overflow-hidden bg-background",
        isCompact ? "h-full flex-1" : "min-h-0 flex-1",
        className,
      )}
    >
      <div className="relative flex flex-1 overflow-hidden min-h-0">
        {Boolean(!isCompact && isMobile && sidebarOpen) && (
          <button
            type="button"
            className="fixed top-16 md:top-20 left-0 right-0 bottom-0 z-40 bg-black/50 md:hidden"
            aria-label="Close menu"
            onClick={() => setSidebarOpen(false)}
          />
        )}
        {!isCompact && (
        <aside
          className={`${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} fixed top-16 md:top-20 bottom-0 left-0 z-50 flex w-[min(18rem,88vw)] flex-col border-r border-border bg-card transition-transform duration-200 md:static md:top-auto md:bottom-auto md:z-auto md:w-72 md:translate-x-0 md:flex-shrink-0`}
        >
          <div className="flex items-center justify-between border-b border-border p-4">
            <span className="text-sm font-semibold">Chats</span>
            {isMobile && (
              <button type="button" onClick={() => setSidebarOpen(false)} className="rounded-lg p-2 hover:bg-accent" aria-label="Close sidebar">
                <X className="h-5 w-5" />
              </button>
            )}
          </div>
          <div className="p-3">
            <button type="button" onClick={startNewChat} className="flex w-full items-center justify-center gap-2 rounded-lg border border-border bg-background px-4 py-3 text-sm font-semibold hover:border-primary hover:text-primary">
              <MessageSquarePlus className="h-4 w-4" />
              New chat
            </button>
          </div>
          <div className="min-h-0 flex-1 overflow-y-auto px-2 pb-2">
            <p className="px-2 pb-2 text-xs font-medium uppercase tracking-wide text-muted-foreground">History</p>
            {chatSessions.map((session) => (
              <button
                key={session.id}
                type="button"
                onClick={() => openChatSession(session.id)}
                className={`mb-1 w-full rounded-lg px-3 py-2.5 text-left text-sm transition-colors ${session.id === activeSessionId ? 'bg-primary/15 text-primary' : 'text-foreground hover:bg-accent'}`}
              >
                <span className="line-clamp-2 break-words">{session.title}</span>
              </button>
            ))}
          </div>
          <div className="border-t border-border p-3 space-y-2">
            <p className="text-xs text-muted-foreground rounded-lg border border-border p-3">100% offline. No AI API calls. Added bhajans and favorites save in this browser.</p>
            {NAVIGATION.map((nav) => (
              <Link key={nav.path} to={nav.path} className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm hover:bg-accent" onClick={() => isMobile && setSidebarOpen(false)}>
                <nav.icon className="h-4 w-4 shrink-0" /> {nav.label}
              </Link>
            ))}
          </div>
        </aside>
        )}

        <main className="min-w-0 flex flex-1 flex-col min-h-0">
          {isCompact ? (
            <div className="flex shrink-0 items-center justify-end border-b border-border/60 bg-background/90 px-2 py-1 backdrop-blur-sm">
              <button
                type="button"
                onClick={startNewChat}
                className="flex items-center gap-1 rounded-lg p-2 text-xs font-medium hover:bg-accent"
                aria-label="New chat"
              >
                <MessageSquarePlus className="h-4 w-4" />
                New chat
              </button>
            </div>
          ) : (
            <div className="flex shrink-0 items-center gap-2 border-b border-border px-4 py-2">
              <button onClick={() => setSidebarOpen(true)} className="rounded-lg p-2 hover:bg-accent md:hidden" aria-label="Open sidebar">
                <Menu className="h-5 w-5" />
              </button>
              <button onClick={() => setSidebarOpen((prev) => !prev)} className="hidden rounded-lg p-2 hover:bg-accent md:inline-flex" aria-label="Toggle sidebar">
                {sidebarOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
              </button>
              <Bot className="h-4 w-4 text-primary" />
              <span className="text-sm font-semibold">Kirtan AI</span>
            </div>
          )}

          <div className={cn("min-h-0 flex-1 overflow-y-auto", isCompact ? "px-2 py-2" : "px-4 py-6 md:px-8")}>
            <div className={cn("space-y-5", !isCompact && "mx-auto max-w-4xl")}>
              {messages.length === 0 && (
                <div className={cn("flex flex-col justify-center", isCompact ? "min-h-[120px]" : "min-h-[55vh]")}>
                  <div className={cn("text-center", isCompact ? "mb-4" : "mb-8")}>
                    <div
                      className={cn(
                        "mx-auto mb-3 flex items-center justify-center rounded-2xl bg-primary/10",
                        isCompact ? "h-10 w-10 text-xl" : "mb-4 h-14 w-14 text-2xl",
                      )}
                    >
                      🪷
                    </div>
                    <h1 className={cn("break-words px-2 font-bold", isCompact ? "text-lg" : "text-2xl sm:text-3xl")}>
                      Namaste, {displayName}
                    </h1>
                    <p className={cn("mt-2 px-2 text-muted-foreground", isCompact ? "text-xs" : "text-sm sm:text-base")}>
                      Kya karna chahenge? Quick action choose karein ya bhajan ka exact naam type karein.
                    </p>
                  </div>
                  <div className="flex flex-wrap justify-center gap-2">
                    {QUICK_ACTIONS.map((action) => (
                      <button
                        key={action}
                        onClick={() => handleAction(action)}
                        className={cn(
                          "rounded-full border border-border bg-card font-medium hover:border-primary hover:text-primary",
                          isCompact ? "px-3 py-1.5 text-xs" : "px-4 py-2 text-sm",
                        )}
                      >
                        {action}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              <AnimatePresence initial={false}>
                {messages.map((message) => (
                  <motion.div key={message.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className={`flex gap-3 ${message.role === "user" ? "justify-end" : "justify-start"}`}>
                    {message.role === "bot" && <div className="mt-1 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary/10 text-lg">🪷</div>}
                    <div className={`max-w-[88%] rounded-2xl px-4 py-3 ${message.role === "user" ? "bg-primary text-primary-foreground rounded-br-md" : "bg-card border border-border rounded-bl-md"}`}>
                      <p className="whitespace-pre-wrap text-sm leading-relaxed md:text-base">{message.text}</p>

                      {message.summary && (
                        <div className="mt-4 rounded-lg border border-border bg-background p-3 text-sm">
                          <div><b>Name:</b> {message.summary.name}</div>
                          <div><b>Deity:</b> {message.summary.deity}</div>
                          <div><b>Language:</b> {message.summary.language}</div>
                          <div><b>Singer:</b> {message.summary.singer || "Optional empty"}</div>
                          <div><b>Link:</b> {message.summary.youtube_link || "Optional empty"}</div>
                        </div>
                      )}

                      {message.bhajans && message.bhajans.length > 0 && (
                        <div className="mt-4 grid gap-3">
                          {message.bhajans.map((bhajan) => (
                            <div key={bhajan.id} className="rounded-lg border border-border bg-background p-4">
                              <div className="flex items-start justify-between gap-3">
                                <div>
                                  <h3 className="font-semibold">{bhajan.name}</h3>
                                  <p className="text-sm text-muted-foreground">{bhajan.deity} • {bhajan.language} • {bhajan.singer}</p>
                                </div>
                                <button onClick={() => toggleFavorite(bhajan)} className="rounded-full p-2 hover:bg-accent" aria-label="Toggle favorite">
                                  <Heart className={`h-5 w-5 ${favorites.includes(bhajan.id) ? "fill-red-500 text-red-500" : "text-muted-foreground"}`} />
                                </button>
                              </div>
                              {compactLines(bhajan.lyrics_preview).length > 0 && (
                                <div className="mt-3 rounded-md bg-muted/50 p-3 text-sm leading-relaxed">
                                  {compactLines(bhajan.lyrics_preview).map((line) => <div key={line}>{line}</div>)}
                                </div>
                              )}
                              <div className="mt-3 flex flex-wrap gap-2">
                                {bhajan.youtube_link && (
                                  <a href={bhajan.youtube_link} target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 rounded-md bg-primary px-3 py-1.5 text-sm font-medium text-primary-foreground">
                                    <Play className="h-4 w-4" /> Play on YouTube
                                  </a>
                                )}
                                <button onClick={() => toggleFavorite(bhajan)} className="inline-flex items-center gap-2 rounded-md border border-border px-3 py-1.5 text-sm font-medium hover:border-primary">
                                  <Heart className="h-4 w-4" /> {favorites.includes(bhajan.id) ? "Remove Favorite" : "Add to Favorites"}
                                </button>
                                <button onClick={() => shareBhajan(bhajan)} className="inline-flex items-center gap-2 rounded-md border border-border px-3 py-1.5 text-sm font-medium hover:border-primary">
                                  <Share2 className="h-4 w-4" /> Share
                                </button>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}

                      {message.appBhajans && message.appBhajans.length > 0 && (
                        <div className="mt-4">
                          <div
                            className={cn(
                              "grid gap-3",
                              isCompact ? "grid-cols-1" : "max-w-2xl grid-cols-1 sm:grid-cols-2",
                            )}
                          >
                            {message.appBhajans.map((bhajan) => (
                              <BhajanCard
                                key={`${bhajan.slug}-${bhajan.id}`}
                                bhajan={bhajan}
                                onCardClick={(clickedBhajan) => {
                                  setSelectedBhajan(clickedBhajan);
                                  setIsDetailOpen(true);
                                }}
                              />
                            ))}
                          </div>
                          {message.searchQuery && message.hasMoreResults && (
                            <Link
                              to={`/search?q=${encodeURIComponent(message.searchQuery)}`}
                              className="mt-3 inline-flex text-sm font-medium text-primary hover:underline"
                            >
                              Show more results →
                            </Link>
                          )}
                        </div>
                      )}

                      {message.options && (
                        <div className="mt-4 flex flex-wrap gap-2">
                          {message.options.map((option) => (
                            <button key={option} onClick={() => handleAction(option)} className="rounded-full border border-border px-3 py-1.5 text-xs font-medium hover:border-primary hover:text-primary">
                              {option}
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>

              {typing && (
                <div className="flex gap-3">
                  <div className="mt-1 flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-lg">🪷</div>
                  <div className="rounded-2xl rounded-bl-md border border-border bg-card px-4 py-3">
                    <div className="flex gap-1.5">
                      <span className="h-2 w-2 animate-bounce rounded-full bg-primary" />
                      <span className="h-2 w-2 animate-bounce rounded-full bg-primary [animation-delay:120ms]" />
                      <span className="h-2 w-2 animate-bounce rounded-full bg-primary [animation-delay:240ms]" />
                    </div>
                  </div>
                </div>
              )}
              <div ref={endRef} />
            </div>
          </div>

          <div className={cn("shrink-0 border-t border-border", isCompact ? "p-2" : "p-4")}>
            <div className={cn("flex gap-2", !isCompact && "mx-auto max-w-4xl")}>
              <button
                onClick={isListening ? () => {
                  voiceRef.current?.stopListening();
                  setIsListening(false);
                } : startListening}
                disabled={!voiceSupport.recognition}
                className={cn(
                  "shrink-0 rounded-lg border border-border hover:border-primary disabled:opacity-50",
                  isCompact ? "px-2.5 py-2" : "px-4",
                  isListening && "border-primary bg-primary/10 animate-pulse",
                )}
                aria-label={isListening ? "Stop listening" : "Voice input"}
              >
                <Mic className={cn(isCompact ? "h-4 w-4" : "h-5 w-5", isListening && "text-primary")} />
              </button>
              <input
                value={input}
                onChange={(event) => setInput(event.target.value)}
                onKeyDown={(event) => event.key === "Enter" && submitInput()}
                placeholder={
                  inputPlaceholder ??
                  "Exact bhajan name type karein, ya 'add a bhajan'..."
                }
                className={cn(
                  "min-w-0 flex-1 rounded-lg border border-border bg-card focus:border-primary focus:outline-none",
                  isCompact ? "px-3 py-2 text-sm" : "px-4 py-3",
                )}
              />
              <button
                onClick={submitInput}
                disabled={!input.trim()}
                className={cn(
                  "shrink-0 rounded-lg bg-primary text-primary-foreground disabled:opacity-50",
                  isCompact ? "px-3 py-2" : "px-4",
                )}
                aria-label="Send"
              >
                <Send className={isCompact ? "h-4 w-4" : "h-5 w-5"} />
              </button>
            </div>
          </div>
        </main>
      </div>
      <BhajanDetailModal
        bhajan={selectedBhajan}
        isOpen={isDetailOpen}
        onClose={() => {
          setIsDetailOpen(false);
          setSelectedBhajan(null);
        }}
        allBhajans={appBhajans}
      />
    </motion.div>
  );
});

KirtanAIChatCore.displayName = "KirtanAIChatCore";

export default KirtanAIChatCore;
