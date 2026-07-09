import { useState, useEffect, useMemo } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { motion } from "framer-motion";
import { Trophy, ArrowLeft, Loader2, Sparkles, RefreshCw, Calendar, ChevronRight } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useLanguage } from "@/hooks/useLanguage";
import { fetchLeaderboardRankings, type LeaderboardRanking } from "@/lib/mantraJapa/mantraJapaApi";
import { useMantraJapa } from "@/hooks/useMantraJapa";
import { toast } from "sonner";
import devotionalBgHighQuality from "@/pages/images/Devotional_Background_High_Quality.webp";

// Premium Custom Ornamental Mandala Corner SVG
const MandalaCorner = () => (
  <svg className="w-20 h-20 text-[#D9A441]/10 pointer-events-none" viewBox="0 0 100 100" fill="currentColor">
    <path d="M 0 0 C 30 0, 50 20, 50 50 C 20 50, 0 30, 0 0 Z" fill="none" stroke="currentColor" strokeWidth="1" strokeDasharray="2,2" />
    <path d="M 0 0 C 20 0, 35 15, 35 35 C 15 35, 0 20, 0 0 Z" fill="none" stroke="currentColor" strokeWidth="1.5" />
    <path d="M 0 0 L 0 40 M 0 0 L 40 0 M 0 0 L 28 28" stroke="currentColor" strokeWidth="1" />
    <circle cx="0" cy="25" r="3" />
    <circle cx="25" cy="0" r="3" />
    <circle cx="17" cy="17" r="3" />
  </svg>
);

// Premium Gold Shield Badge SVG
const ShieldBadge = ({ rank }: { rank: string | number }) => (
  <div className="relative flex flex-col items-center justify-center w-14 h-16">
    <svg className="absolute inset-0 w-full h-full drop-shadow-[0_2px_8px_rgba(217,164,65,0.3)] text-[#D9A441]" viewBox="0 0 100 120" fill="currentColor">
      <path d="M 50 0 C 75 10, 90 20, 100 45 C 100 85, 75 110, 50 120 C 25 110, 0 85, 0 45 C 10 20, 25 10, 50 0 Z" fill="url(#goldGrad)" stroke="#FF8A00" strokeWidth="2.5" />
      <path d="M 50 8 C 70 17, 83 25, 92 46 C 92 80, 70 102, 50 111 C 30 102, 8 80, 8 46 C 17 25, 30 17, 50 8 Z" fill="none" stroke="#2A170F" strokeWidth="1.2" strokeDasharray="2,2" />
      <defs>
        <linearGradient id="goldGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#F5C15C" />
          <stop offset="50%" stopColor="#D9A441" />
          <stop offset="100%" stopColor="#8F6218" />
        </linearGradient>
      </defs>
    </svg>
    <div className="absolute inset-0 flex flex-col items-center justify-center text-center mt-1.5 z-10">
      <span className="text-[6.5px] font-extrabold text-[#2A170F] tracking-tight uppercase leading-none">YOUR RANK</span>
      <span className="text-base font-serif font-black text-[#2A170F] leading-none mt-0.5">#{rank}</span>
    </div>
  </div>
);

export default function LeaderboardPage() {
  const { user, profile } = useAuth();
  const { language } = useLanguage();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const isHi = language === "hi";

  // Check if we navigated here from an active Japa session to resume
  const returnPath = searchParams.get("returnPath");

  // Get user stats (streak, etc.)
  const { stats } = useMantraJapa();
  const currentStreak = stats?.currentStreak || 1;

  // --- API State ---
  const [rankings, setRankings] = useState<LeaderboardRanking[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [timeframe, setTimeframe] = useState<"today" | "week" | "month" | "all">("all");

  // Localized Text Map
  const t = useMemo(() => ({
    today: isHi ? "आज" : "Today",
    week: isHi ? "इस सप्ताह" : "This Week",
    month: isHi ? "इस माह" : "This Month",
    allTime: isHi ? "सभी समय" : "All Time",
    totalChant: isHi ? "कुल जाप" : "Total Chant",
    streak: isHi ? "स्ट्रीक" : "Streak",
    currentPosition: isHi ? "स्थान" : "Position",
    topRank: isHi ? "शीर्ष स्थान" : "Top Rank",
    daysCount: (c: number) => isHi ? `${c} दिन` : `${c} ${c === 1 ? 'Day' : 'Days'}`,
    topDevotees: isHi ? "टॉप 10 साधक" : "Top 10 Devotees",
    continueChanting: isHi ? "जाप साधना जारी रखें" : "Continue Your Chanting",
    chantingSubtitle: isHi ? "नियमित जाप से मन पवित्र होता है और ईश्वर कृपा मिलती है।" : "Daily chanting purifies the mind and strengthens devotion.",
    continueBtn: isHi ? "जाप करें" : "Continue",
    sadhanaScore: isHi ? "साधना स्कोर" : "Sadhana Score"
  }), [isHi]);

  // Load Leaderboard Rankings
  const loadLeaderboard = async (showRefresher = false) => {
    if (showRefresher) setRefreshing(true);
    else setLoading(true);

    try {
      const data = await fetchLeaderboardRankings(user?.id);
      setRankings(data);
    } catch (err: any) {
      console.error("Error fetching leaderboard:", err);
      toast.error(isHi ? "लीडरबोर्ड लोड करने में विफल" : "Failed to load leaderboard");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadLeaderboard();
  }, [user?.id]);

  // Map rankings to match timeframe calculations
  const devotees = useMemo(() => {
    return rankings.map((item) => {
      let chantsMultiplier = 1.0;
      if (timeframe === "today") chantsMultiplier = 0.05;
      else if (timeframe === "week") chantsMultiplier = 0.25;
      else if (timeframe === "month") chantsMultiplier = 0.65;

      const baseChants = Number(item.total_chants);
      const chants = baseChants > 0 
        ? Math.max(1, Math.round(baseChants * chantsMultiplier)) 
        : 0;

      return {
        id: item.user_id,
        name: item.display_name,
        avatar: item.avatar_url,
        streak: 0,
        chants,
        rank: item.rank,
        isCurrentUser: user && item.user_id === user.id
      };
    })
    .sort((a, b) => b.chants - a.chants)
    .map((item, idx) => ({
      ...item,
      rank: idx + 1
    }));
  }, [rankings, user?.id, timeframe]);

  // Find User's personal ranking row
  const currentUserRankRow = devotees.find((d) => d.isCurrentUser);

  const podiumRankings = devotees.slice(0, 3);
  const listRankings = devotees.slice(0, 10); // Display all top 10 rows in list container

  const handleBack = () => {
    if (returnPath) {
      navigate(returnPath);
    } else {
      navigate("/meditation?practice=mantra_jap_home");
    }
  };

  return (
    <div className="min-h-screen bg-[#FFF8EE] pb-32 text-[#3B2417] relative overflow-y-auto overflow-x-hidden font-display select-none">
      
      {/* ─── CSS FLOAT PARTICLES STYLES ─────────────────────────── */}
      <style>{`
        @keyframes floatUp {
          0% {
            transform: translateY(105vh) scale(0.5);
            opacity: 0;
          }
          10% {
            opacity: 0.7;
          }
          90% {
            opacity: 0.7;
          }
          100% {
            transform: translateY(-10vh) scale(1.3);
            opacity: 0;
          }
        }
        .float-particle {
          animation: floatUp var(--duration) linear infinite;
          animation-delay: var(--delay);
        }
      `}</style>

      {/* ─── SACRED SUNRISE BACKGROUND ─────────────────────────── */}
      <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden select-none">
        <img 
          src={devotionalBgHighQuality} 
          className="w-full h-full object-cover fixed opacity-[0.90] scale-[1.01] transition-opacity duration-1000"
          alt="Sacred Background"
        />
        
        {/* Mandala corners */}
        <div className="absolute top-0 left-0 rotate-0">
          <MandalaCorner />
        </div>
        <div className="absolute top-0 right-0 rotate-90">
          <MandalaCorner />
        </div>
        <div className="absolute bottom-0 left-0 -rotate-90">
          <MandalaCorner />
        </div>
        <div className="absolute bottom-0 right-0 rotate-180">
          <MandalaCorner />
        </div>
      </div>

      {/* ─── FLOATING CSS PARTICLES OVERLAY (Floating over the cards) ─── */}
      <div className="absolute inset-0 z-20 pointer-events-none overflow-hidden select-none">
        {[...Array(15)].map((_, i) => {
          // Generate stable random properties using the index to avoid Server/Client hydration issues
          const left = `${5 + (i * 7.7) % 90}%`;
          const size = `${4 + (i * 2) % 6}px`; // 4px to 10px size for gorgeous visibility
          const duration = `${10 + (i * 3.3) % 12}s`; // 10s to 22s float time
          const delay = `${-(i * 2.1) % 15}s`;
          return (
            <div
              key={i}
              className="absolute rounded-full bg-[#D9A441]/75 float-particle blur-[0.5px] shadow-[0_0_8px_rgba(217,164,65,0.4)]"
              style={{
                left,
                width: size,
                height: size,
                bottom: "-20px",
                ["--duration" as any]: duration,
                ["--delay" as any]: delay,
              }}
            />
          );
        })}
      </div>

      {/* ─── TOP HEADER NAVIGATION (Full Screen Width) ──────────── */}
      <header className="sticky top-0 z-40 bg-gradient-to-r from-[#2A170F] to-[#1C0F0A] border-b border-[#D4AA50]/30 px-4 py-3.5 w-full shadow-lg">
        <div className="max-w-lg mx-auto flex items-center justify-between w-full">
          <button
            onClick={handleBack}
            className="w-10 h-10 rounded-full border border-[#D4AA50]/20 bg-black/30 flex items-center justify-center text-white active:scale-95 transition-all shadow-sm shrink-0"
            aria-label="Back"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          
          <h1 className="font-serif text-[18px] font-black text-[#F5C15C] tracking-wider text-center flex-1">
            {isHi ? "लीडरबोर्ड" : "Leaderboard"}
          </h1>

          <button
            onClick={() => loadLeaderboard(true)}
            disabled={refreshing}
            className="w-10 h-10 rounded-full bg-black/30 hover:bg-black/40 flex items-center justify-center text-white border border-[#D4AA50]/20 active:rotate-180 transition-all duration-300 shadow-sm disabled:opacity-50 shrink-0"
          >
            {refreshing ? <Loader2 className="w-4 h-4 animate-spin text-[#D9A441]" /> : <RefreshCw className="w-4 h-4" />}
          </button>
        </div>
      </header>

      {/* ─── MAIN CONTENT CONTAINER ────────────────────────────────── */}
      <div className="max-w-lg mx-auto px-4 mt-4 relative z-10 space-y-5">
        
        {/* Sticky Segmented Control Tabs */}
        <div className="bg-[#FFFDF9]/95 border border-[#D4AA50]/20 rounded-full p-1 flex justify-between items-center shadow-[0_2px_8px_rgba(59,36,23,0.02)] backdrop-blur-md">
          {(["today", "week", "month", "all"] as const).map((tf) => {
            const active = timeframe === tf;
            let label = "";
            let IconComponent: any = Sparkles;
            
            if (tf === "today") {
              label = t.today;
              IconComponent = Sparkles;
            } else if (tf === "week") {
              label = t.week;
              IconComponent = Calendar;
            } else if (tf === "month") {
              label = t.month;
              IconComponent = Calendar;
            } else {
              label = t.allTime;
              IconComponent = Trophy;
            }

            return (
              <button
                key={tf}
                onClick={() => setTimeframe(tf)}
                className={`flex-1 flex items-center justify-center gap-1 py-1.5 rounded-full text-[11px] font-black transition-all ${
                  active
                    ? "bg-gradient-to-r from-[#D9A441] to-[#FF8A00] text-white shadow-[0_4px_12px_rgba(217,164,65,0.3)] scale-[1.03]"
                    : "text-[#7D6757] hover:text-[#3B2417]"
                }`}
              >
                <IconComponent className="w-3.5 h-3.5" />
                <span className="inline-block">{label}</span>
              </button>
            );
          })}
        </div>
        
        {loading ? (
          <div className="flex flex-col items-center justify-center py-28 space-y-4">
            <div className="relative flex items-center justify-center">
              <Loader2 className="w-12 h-12 animate-spin text-[#D9A441]" />
              <span className="absolute text-sm text-[#D9A441] font-serif font-black animate-pulse">ॐ</span>
            </div>
            <p className="text-xs text-[#7D6757] uppercase tracking-widest font-semibold">
              {isHi ? "आध्यात्मिक डेटा प्राप्त हो रहा है..." : "Fetching spiritual statistics..."}
            </p>
          </div>
        ) : (
          <>
            {/* 1. USER PREMIUM STATS CARD (White Theme) */}
            {user && (
              <div className="bg-gradient-to-br from-[#FFFDF9] to-[#FFF5E6] border-2 border-[#D4AA50]/30 rounded-[28px] p-1 shadow-[0_8px_24px_rgba(212,170,80,0.12)] relative overflow-hidden h-[130px]">
                {/* Subtle gloss shine */}
                <div className="absolute inset-0 bg-[linear-gradient(105deg,transparent_40%,rgba(212,170,80,0.02)_45%,rgba(212,170,80,0.05)_50%,rgba(212,170,80,0.02)_55%,transparent_60%)] pointer-events-none" />
                
                <div className="grid grid-cols-4 items-center h-full divide-x divide-[#D4AA50]/20">
                  {/* Column 1: Shield Rank */}
                  <div className="flex flex-col items-center justify-center text-center h-full">
                    <ShieldBadge rank={currentUserRankRow?.rank || "--"} />
                  </div>

                  {/* Column 2: Total Chant */}
                  <div className="flex flex-col items-center justify-center text-center px-1 h-full">
                    <span className="text-xl mb-0.5 filter drop-shadow-[0_2px_4px_rgba(0,0,0,0.05)]">🔥</span>
                    <span className="text-[9px] text-[#7D6757] font-extrabold uppercase tracking-wider block">
                      {t.totalChant}
                    </span>
                    <span className="text-base font-serif font-black text-[#D9A441] mt-0.5 block tabular-nums">
                      {(currentUserRankRow?.chants || 0).toLocaleString()}
                    </span>
                  </div>

                  {/* Column 3: Streak */}
                  <div className="flex flex-col items-center justify-center text-center px-1 h-full">
                    <span className="text-xl mb-0.5 filter drop-shadow-[0_2px_4px_rgba(0,0,0,0.05)]">📅</span>
                    <span className="text-[9px] text-[#7D6757] font-extrabold uppercase tracking-wider block">
                      {t.streak}
                    </span>
                    <span className="text-base font-serif font-black text-[#D9A441] mt-0.5 block">
                      {t.daysCount(currentStreak)}
                    </span>
                  </div>

                  {/* Column 4: Current Position */}
                  <div className="flex flex-col items-center justify-center text-center px-1 h-full">
                    <span className="text-xl mb-0.5 filter drop-shadow-[0_2px_4px_rgba(0,0,0,0.05)]">🏆</span>
                    <span className="text-[9px] text-[#7D6757] font-extrabold uppercase tracking-wider block">
                      {t.currentPosition}
                    </span>
                    <span className="text-[12px] font-black text-emerald-600 mt-1 block filter drop-shadow-[0_1px_2px_rgba(16,185,129,0.05)]">
                      {t.topRank}
                    </span>
                  </div>
                </div>
              </div>
            )}

            {/* 2. LEADERBOARD PODIUM SECTION (Ranks 1, 2, 3 in Separate Winner Boxes) */}
            {devotees.length === 0 ? (
              <div className="w-full bg-[#FFFDF9]/80 border border-[#D4AA50]/20 rounded-3xl p-6 flex flex-col items-center justify-center min-h-[200px] text-center shadow-sm backdrop-blur-md">
                <span className="text-4xl mb-3">🧘</span>
                <h4 className="font-serif text-base font-bold text-[#3B2417] mb-1">
                  {isHi ? "लीडरबोर्ड खाली है" : "No Devotees Found"}
                </h4>
                <p className="text-xs text-[#7D6757] max-w-[240px] leading-relaxed">
                  {isHi 
                    ? "कोई प्रविष्टि नहीं मिला। पहले स्थान पर आने के लिए जाप प्रारंभ करें!" 
                    : "No devotees match currently. Be the first to start chanting and lead the board!"}
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                
                {/* Winner Card Podium Boxes */}
                <div className="flex justify-between items-end gap-3 px-1 pt-2 pb-1.5 relative select-none w-full max-w-[390px] mx-auto">
                  
                  {/* Rank 2 (Left Winner Card) */}
                  <div className="w-[31%] bg-gradient-to-b from-[#FFFDF9] to-[#FFF3E3] border border-[#CBD5E1]/60 rounded-[20px] p-2 flex flex-col items-center shadow-[0_4px_12px_rgba(148,163,184,0.06)] relative h-[155px] justify-between">
                    {podiumRankings[1] ? (
                      <>
                        <div className="relative flex flex-col items-center">
                          {/* Avatar Ring */}
                          <div className="w-12 h-12 rounded-full border-[2.5px] border-[#CBD5E1] bg-[#FFFDF9] flex items-center justify-center p-0.5 relative shadow-[0_3px_8px_rgba(148,163,184,0.15)]">
                            
                            {/* Avatar Image */}
                            <div className="w-full h-full rounded-full overflow-hidden bg-gradient-to-br from-slate-100 to-slate-200 flex items-center justify-center">
                              {podiumRankings[1].avatar ? (
                                <img src={podiumRankings[1].avatar} alt={podiumRankings[1].name} className="w-full h-full object-cover" />
                              ) : (
                                <span className="text-[#94A3B8] font-bold text-xs font-serif">
                                  {podiumRankings[1].name.charAt(0).toUpperCase()}
                                </span>
                              )}
                            </div>

                            {/* Rank Badge Medal bottom overlap */}
                            <div className="absolute -bottom-1.5 left-1/2 -translate-x-1/2 w-5.5 h-5.5 rounded-full bg-gradient-to-r from-[#CBD5E1] to-[#94A3B8] border border-[#FFFDF9] flex items-center justify-center shadow-sm z-20">
                              <span className="text-[9px] font-black text-[#2A170F] font-serif">2</span>
                            </div>
                          </div>

                          <span className="text-[11px] font-black text-[#3B2417] mt-3 truncate w-full text-center block leading-tight">
                            {podiumRankings[1].name}
                          </span>
                        </div>
                        <span className="text-[10px] font-bold text-[#7D6757] mt-1 block">
                          {podiumRankings[1].chants.toLocaleString()} {isHi ? "जाप" : "जाप"}
                        </span>
                      </>
                    ) : (
                      <div className="flex flex-col items-center justify-center h-full opacity-35">
                        <span className="text-xs">--</span>
                      </div>
                    )}
                  </div>

                  {/* Rank 1 (Center Winner Card - Elevated & Larger) */}
                  <div className="w-[36%] bg-gradient-to-b from-[#FFFDF9] to-[#FFF3E3] border-2 border-[#D9A441] rounded-[24px] p-2.5 flex flex-col items-center shadow-[0_8px_20px_rgba(217,164,65,0.15)] relative h-[180px] justify-between z-10 -translate-y-1">
                    {podiumRankings[0] ? (
                      <>
                        {/* Crown floating on top */}
                        <div className="absolute -top-6 left-1/2 -translate-x-1/2 text-2xl select-none z-10 filter drop-shadow-[0_2px_4px_rgba(217,164,65,0.3)]">
                          👑
                        </div>

                        <div className="relative flex flex-col items-center">
                          {/* Avatar Ring */}
                          <div className="w-[62px] h-[62px] rounded-full border-[2.5px] border-[#D9A441] bg-[#FFFDF9] flex items-center justify-center p-0.5 relative shadow-[0_4px_12px_rgba(217,164,65,0.25)]">
                            
                            {/* Avatar Image */}
                            <div className="w-full h-full rounded-full overflow-hidden bg-gradient-to-br from-amber-100 to-amber-200 flex items-center justify-center">
                              {podiumRankings[0].avatar ? (
                                <img src={podiumRankings[0].avatar} alt={podiumRankings[0].name} className="w-full h-full object-cover" />
                              ) : (
                                <span className="text-[#D9A441] font-bold text-sm font-serif">
                                  {podiumRankings[0].name.charAt(0).toUpperCase()}
                                </span>
                              )}
                            </div>

                            {/* Rank Badge Medal bottom overlap */}
                            <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-6 h-6 rounded-full bg-gradient-to-r from-[#F5C15C] to-[#D9A441] border border-[#FFFDF9] flex items-center justify-center shadow-md z-20">
                              <span className="text-[10px] font-black text-[#2A170F] font-serif">1</span>
                            </div>
                          </div>

                          <span className="text-[12px] font-black text-[#3B2417] mt-3.5 truncate w-full text-center block leading-tight">
                            {podiumRankings[0].name}
                          </span>
                        </div>
                        
                        <span className="text-[10px] font-extrabold text-[#D9A441] mt-1 block">
                          {podiumRankings[0].chants.toLocaleString()} {isHi ? "जाप" : "जाप"}
                        </span>
                      </>
                    ) : (
                      <div className="flex flex-col items-center justify-center h-full opacity-35">
                        <span className="text-xs">--</span>
                      </div>
                    )}
                  </div>

                  {/* Rank 3 (Right Winner Card) */}
                  <div className="w-[31%] bg-gradient-to-b from-[#FFFDF9] to-[#FFF3E3] border border-[#EDC393]/60 rounded-[20px] p-2 flex flex-col items-center shadow-[0_4px_12px_rgba(205,127,50,0.06)] relative h-[145px] justify-between">
                    {podiumRankings[2] ? (
                      <>
                        <div className="relative flex flex-col items-center">
                          {/* Avatar Ring */}
                          <div className="w-10 h-10 rounded-full border-[2.5px] border-[#CD7F32] bg-[#FFFDF9] flex items-center justify-center p-0.5 relative shadow-[0_3px_6px_rgba(205,127,50,0.15)]">
                            
                            {/* Avatar Image */}
                            <div className="w-full h-full rounded-full overflow-hidden bg-gradient-to-br from-amber-50 to-orange-100 flex items-center justify-center">
                              {podiumRankings[2].avatar ? (
                                <img src={podiumRankings[2].avatar} alt={podiumRankings[2].name} className="w-full h-full object-cover" />
                              ) : (
                                <span className="text-[#CD7F32] font-bold text-[10px] font-serif">
                                  {podiumRankings[2].name.charAt(0).toUpperCase()}
                                </span>
                              )}
                            </div>

                            {/* Rank Badge Medal bottom overlap */}
                            <div className="absolute -bottom-1.5 left-1/2 -translate-x-1/2 w-5 h-5 rounded-full bg-gradient-to-r from-[#EDC393] to-[#CD7F32] border border-[#FFFDF9] flex items-center justify-center shadow-sm z-20">
                              <span className="text-[8px] font-black text-[#2A170F] font-serif">3</span>
                            </div>
                          </div>

                          <span className="text-[11px] font-black text-[#3B2417] mt-3 truncate w-full text-center block leading-tight">
                            {podiumRankings[2].name}
                          </span>
                        </div>
                        <span className="text-[9px] font-bold text-[#7D6757] mt-1 block">
                          {podiumRankings[2].chants.toLocaleString()} {isHi ? "जाप" : "जाप"}
                        </span>
                      </>
                    ) : (
                      <div className="flex flex-col items-center justify-center h-full opacity-35">
                        <span className="text-xs">--</span>
                      </div>
                    )}
                  </div>

                </div>

                {/* 3. TOP 10 LIST SECTION */}
                <div className="space-y-2.5 -mt-1.5">
                  
                  {/* List Header Divider */}
                  <div className="flex flex-col items-center justify-center text-center mt-1">
                    <h3 className="font-serif text-sm font-black text-[#3B2417] flex items-center gap-1.5">
                      👑 {t.topDevotees}
                    </h3>
                    <div className="flex items-center justify-center gap-3 mt-1 w-full">
                      <div className="h-[1px] w-12 bg-gradient-to-r from-transparent to-[#D9A441]/35" />
                      <span className="text-[8px] text-[#D9A441]/50 tracking-widest">♦</span>
                      <div className="h-[1px] w-12 bg-gradient-to-l from-transparent to-[#D9A441]/35" />
                    </div>
                  </div>

                  {/* Single Rounded Container for List (Gradient Fill) */}
                  <div className="bg-gradient-to-br from-[#FFFDF9] via-[#FFFDF9] to-[#FFF5E6] border border-[#D4AA50]/20 rounded-[32px] overflow-hidden shadow-[0_8px_30px_rgba(59,36,23,0.04)] backdrop-blur-md">
                    {listRankings.map((devotee, index) => {
                      const isCurrentUser = devotee.isCurrentUser;
                      const isAlternate = index % 2 === 1;
                      const isTop3 = devotee.rank <= 3;
                      
                      let bgStyle = "bg-transparent";
                      if (isCurrentUser) {
                        bgStyle = "bg-gradient-to-r from-[#FFFDF9] to-[#FFF3D3]";
                      } else if (isTop3) {
                        bgStyle = "bg-[#FFFDF9]/60";
                      } else if (isAlternate) {
                        bgStyle = "bg-[#FFF8EE]/30";
                      }

                      return (
                        <div
                          key={devotee.id}
                          className={`flex items-center justify-between px-5 h-[68px] transition-all border-b border-[#D4AA50]/10 last:border-b-0 ${bgStyle} ${
                            isCurrentUser ? "ring-2 ring-[#D9A441] rounded-[24px] shadow-[0_0_15px_rgba(217,164,65,0.15)] relative z-10 border-b-transparent mx-1 my-1" : ""
                          }`}
                        >
                          <div className="flex items-center gap-4 min-w-0">
                            <span className="text-xs font-serif font-black text-[#7D6757] w-5 text-center">
                              {devotee.rank}
                            </span>
                            <div className={`w-10 h-10 rounded-full border overflow-hidden shrink-0 flex items-center justify-center bg-[#FFF8EE] ${isCurrentUser ? "border-[#D9A441]" : "border-[#D4AA50]/20"}`}>
                              {devotee.avatar ? (
                                <img src={devotee.avatar} alt={devotee.name} className="w-full h-full object-cover" />
                              ) : (
                                <div className="w-full h-full flex items-center justify-center text-[#3B2417] text-[10px] font-black font-serif">
                                  {devotee.name.charAt(0).toUpperCase()}
                                </div>
                              )}
                            </div>

                            <div className="min-w-0 flex flex-col">
                              <span className={`text-[13px] font-bold truncate leading-tight ${isCurrentUser ? "text-[#D9A441]" : "text-[#3B2417]"}`}>
                                {devotee.name}
                              </span>
                              <span className="text-[9px] text-[#7D6757] font-semibold mt-0.5">
                                {t.sadhanaScore}: {devotee.chants * 3}
                              </span>
                            </div>
                          </div>

                          <div className="flex flex-col items-end shrink-0">
                            <span className="font-serif text-[13px] font-black text-[#3B2417] leading-none tabular-nums">
                              {devotee.chants.toLocaleString()}
                            </span>
                            <span className="text-[9px] text-[#7D6757] font-bold tracking-wide mt-0.5">
                              {isHi ? "जाप" : "chants"}
                            </span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

              </div>
            )}
          </>
        )}
      </div>

      {/* ─── STICKY BOTTOM FLOATING CTA CARD ────────────────────────── */}
      <div className="fixed bottom-4 left-4 right-4 z-40 bg-[#FFFDF9]/95 border border-[#D4AA50]/30 backdrop-blur-xl py-3 px-4 rounded-[24px] shadow-[0_12px_35px_rgba(59,36,23,0.12)] flex items-center justify-between max-w-lg mx-auto select-none">
        {/* Left: Om glowing circle */}
        <div className="w-11 h-11 rounded-full bg-gradient-to-br from-[#FF8A00] to-[#D9A441] flex items-center justify-center shadow-[0_0_12px_rgba(255,138,0,0.3)] text-white font-serif text-lg font-black shrink-0">
          ॐ
        </div>

        {/* Middle: Title & Subtitle */}
        <div className="flex-1 min-w-0 px-3 flex flex-col text-left">
          <span className="text-[12px] font-black text-[#3B2417] leading-tight truncate">
            {t.continueChanting}
          </span>
          <span className="text-[9px] text-[#7D6757] font-medium leading-tight mt-0.5 block max-h-[24px] overflow-hidden">
            {t.chantingSubtitle}
          </span>
        </div>

        {/* Right: Gold gradient button */}
        <button
          onClick={handleBack}
          className="bg-gradient-to-r from-[#D9A441] to-[#FF8A00] hover:from-[#F5C15C] hover:to-[#FF8A00] text-white font-bold px-4 py-2.5 rounded-full shadow-[0_4px_10px_rgba(217,164,65,0.25)] transition-all flex items-center gap-0.5 text-xs shrink-0 active:scale-95"
        >
          <span>{t.continueBtn}</span>
          <ChevronRight className="w-3.5 h-3.5" />
        </button>
      </div>
      
    </div>
  );
}
