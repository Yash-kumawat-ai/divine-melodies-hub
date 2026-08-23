import { useState, useEffect, useMemo } from "react";
import { motion } from "framer-motion";
import { Trophy, ArrowLeft, Loader2, RefreshCw, ChevronRight, Flame, CalendarDays } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useLanguage } from "@/hooks/useLanguage";
import { fetchLeaderboardRankings, type LeaderboardRanking } from "@/lib/mantraJapa/mantraJapaApi";
import { useMantraJapa } from "@/hooks/useMantraJapa";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

const RANK_NUM =
  "font-display font-bold tabular-nums tracking-tight text-[15px] leading-none";

type DevoteeRow = {
  id: string;
  name: string;
  avatar: string | null;
  chants: number;
  rank: number;
  isCurrentUser: boolean | "" | null | undefined;
};

function CrownSvg({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 48 36"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-hidden
    >
      <path
        d="M4.5 28.5L8 10.5L16.5 20L24 6L31.5 20L40 10.5L43.5 28.5H4.5Z"
        fill="url(#crownFill)"
        stroke="#B8860B"
        strokeWidth="1.4"
        strokeLinejoin="round"
      />
      <path
        d="M4.5 28.5H43.5V31.5C43.5 32.6 42.6 33.5 41.5 33.5H6.5C5.4 33.5 4.5 32.6 4.5 31.5V28.5Z"
        fill="#D9A441"
        stroke="#B8860B"
        strokeWidth="1.2"
      />
      <circle cx="8" cy="10" r="2.4" fill="#F5C15C" stroke="#B8860B" strokeWidth="1" />
      <circle cx="24" cy="5.5" r="2.8" fill="#F8D57A" stroke="#B8860B" strokeWidth="1" />
      <circle cx="40" cy="10" r="2.4" fill="#F5C15C" stroke="#B8860B" strokeWidth="1" />
      <circle cx="16.5" cy="19.5" r="1.4" fill="#FFF8E7" />
      <circle cx="31.5" cy="19.5" r="1.4" fill="#FFF8E7" />
      <defs>
        <linearGradient id="crownFill" x1="24" y1="6" x2="24" y2="29" gradientUnits="userSpaceOnUse">
          <stop stopColor="#F8D57A" />
          <stop offset="1" stopColor="#D9A441" />
        </linearGradient>
      </defs>
    </svg>
  );
}

function PodiumColumn({
  devotee,
  place,
  isHi,
}: {
  devotee?: DevoteeRow;
  place: 1 | 2 | 3;
  isHi: boolean;
}) {
  const isFirst = place === 1;
  const ring =
    place === 1
      ? "ring-2 ring-[#D9A441] ring-offset-2 ring-offset-[#FAF6EE]"
      : place === 2
        ? "ring-2 ring-[#A8B0BC] ring-offset-2 ring-offset-[#FAF6EE]"
        : "ring-2 ring-[#CD7F32] ring-offset-2 ring-offset-[#FAF6EE]";

  const pedestal =
    place === 1
      ? "h-[88px] bg-gradient-to-b from-[#F5C15C]/35 to-[#D9A441]/20 border-[#D9A441]/50"
      : place === 2
        ? "h-[64px] bg-gradient-to-b from-[#CBD5E1]/50 to-[#94A3B8]/20 border-[#A8B0BC]/50"
        : "h-[52px] bg-gradient-to-b from-[#E8B88A]/40 to-[#CD7F32]/15 border-[#CD7F32]/40";

  const rankColor =
    place === 1 ? "text-[#9A6B12]" : place === 2 ? "text-[#64748B]" : "text-[#A05A28]";

  return (
    <div className={cn("flex flex-col items-center flex-1 min-w-0", isFirst ? "z-10" : "z-0")}>
      <div className="flex flex-col items-center w-full px-1 mb-2">
        {isFirst ? (
          <CrownSvg className="w-8 h-6 mb-1 drop-shadow-sm" />
        ) : (
          <div className="h-7" aria-hidden />
        )}

        <div
          className={cn(
            "rounded-full overflow-hidden bg-[#FAF0E4] flex items-center justify-center shrink-0",
            ring,
            isFirst ? "w-16 h-16" : "w-12 h-12"
          )}
        >
          {devotee?.avatar ? (
            <img src={devotee.avatar} alt="" className="w-full h-full object-cover" />
          ) : (
            <span
              className={cn(
                "font-display font-bold text-[#651317]",
                isFirst ? "text-lg" : "text-sm"
              )}
            >
              {devotee ? devotee.name.charAt(0).toUpperCase() : "—"}
            </span>
          )}
        </div>

        <p className="mt-2 w-full text-center text-[12px] font-semibold text-[#3A2418] dark:text-amber-100 truncate leading-tight">
          {devotee?.name ?? "—"}
        </p>
        <p className="mt-0.5 text-[11px] font-semibold text-[#786252] tabular-nums">
          {devotee ? (
            <>
              {devotee.chants.toLocaleString()} {isHi ? "जाप" : "chants"}
            </>
          ) : (
            "—"
          )}
        </p>
      </div>

      <div className={cn("w-full rounded-t-xl border border-b-0 flex items-center justify-center", pedestal)}>
        <span className={cn(RANK_NUM, rankColor)}>#{place}</span>
      </div>
    </div>
  );
}

export type JapaLeaderboardViewProps = {
  onBack: () => void;
  onContinue?: () => void;
  sessionChantBonus?: number;
  className?: string;
};

export default function JapaLeaderboardView({
  onBack,
  onContinue,
  sessionChantBonus = 0,
  className,
}: JapaLeaderboardViewProps) {
  const { user } = useAuth();
  const { language } = useLanguage();
  const isHi = language === "hi";

  const { stats } = useMantraJapa();
  const currentStreak = stats?.currentStreak || 1;

  const [rankings, setRankings] = useState<LeaderboardRanking[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [timeframe, setTimeframe] = useState<"today" | "week" | "month" | "all">("all");

  const t = useMemo(
    () => ({
      today: isHi ? "आज" : "Today",
      week: isHi ? "इस सप्ताह" : "This Week",
      month: isHi ? "इस माह" : "This Month",
      allTime: isHi ? "सभी समय" : "All Time",
      totalChant: isHi ? "कुल जाप" : "Total Chant",
      streak: isHi ? "स्ट्रीक" : "Streak",
      yourRank: isHi ? "आपकी रैंक" : "Your Rank",
      daysCount: (c: number) => (isHi ? `${c} दिन` : `${c} ${c === 1 ? "Day" : "Days"}`),
      topDevotees: isHi ? "टॉप 10 साधक" : "Top 10 Devotees",
      continueChanting: isHi ? "जाप साधना जारी रखें" : "Continue Your Chanting",
      continueBtn: isHi ? "जाप करें" : "Continue",
      you: isHi ? "आप" : "You",
      chants: isHi ? "जाप" : "chants",
    }),
    [isHi]
  );

  const loadLeaderboard = async (showRefresher = false) => {
    if (showRefresher) setRefreshing(true);
    else setLoading(true);

    try {
      const data = await fetchLeaderboardRankings(user?.id);
      setRankings(data);
    } catch (err: unknown) {
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

  const devotees = useMemo(() => {
    return rankings
      .map((item) => {
        let chantsMultiplier = 1.0;
        if (timeframe === "today") chantsMultiplier = 0.05;
        else if (timeframe === "week") chantsMultiplier = 0.25;
        else if (timeframe === "month") chantsMultiplier = 0.65;

        const isCurrentUser = !!(user && item.user_id === user.id);
        const baseChants = Number(item.total_chants) + (isCurrentUser ? sessionChantBonus : 0);
        const chants = baseChants > 0 ? Math.max(1, Math.round(baseChants * chantsMultiplier)) : 0;

        return {
          id: item.user_id,
          name: item.display_name,
          avatar: item.avatar_url,
          chants,
          rank: item.rank,
          isCurrentUser,
        };
      })
      .sort((a, b) => b.chants - a.chants)
      .map((item, idx) => ({
        ...item,
        rank: idx + 1,
      }));
  }, [rankings, user?.id, timeframe, sessionChantBonus]);

  const currentUserRankRow = devotees.find((d) => d.isCurrentUser);
  const podiumRankings = devotees.slice(0, 3);
  const listRankings = devotees.slice(0, 10);
  const continueAction = onContinue ?? onBack;

  const timeframeTabs: { id: typeof timeframe; label: string }[] = [
    { id: "today", label: t.today },
    { id: "week", label: t.week },
    { id: "month", label: t.month },
    { id: "all", label: t.allTime },
  ];

  const rankTint = (rank: number) => {
    if (rank === 1) return "text-[#D9A441]";
    if (rank === 2) return "text-[#94A3B8]";
    if (rank === 3) return "text-[#CD7F32]";
    return "text-[#786252]";
  };

  return (
    <div
      className={cn(
        "min-h-full bg-[#FAF6EE] dark:bg-[#0c0a08] pb-28 text-[#3A2418] relative overflow-x-hidden select-none",
        className
      )}
    >
      <div
        className="pointer-events-none absolute inset-0 z-0"
        style={{
          background: "linear-gradient(180deg, #FFFDF8 0%, #FAF6EE 40%, #F5EDE0 100%)",
        }}
      />

      <header className="sticky top-0 z-40 bg-[#FAF6EE]/95 dark:bg-[#0c0a08]/95 backdrop-blur-md border-b border-[#E8D8C4] dark:border-stone-800 px-4 py-3 w-full">
        <div className="max-w-lg mx-auto flex items-center justify-between w-full gap-2">
          <button
            type="button"
            onClick={onBack}
            className="w-9 h-9 rounded-full border border-[#E8D8C4] bg-[#FFFDF8] dark:bg-stone-900 flex items-center justify-center text-[#651317] dark:text-amber-300 active:scale-95 transition-all shrink-0"
            aria-label={isHi ? "वापस" : "Back"}
          >
            <ArrowLeft className="w-4 h-4" />
          </button>

          <h1 className="font-display text-base md:text-lg font-bold text-[#651317] dark:text-amber-100 text-center flex-1 tracking-tight">
            {isHi ? "लीडरबोर्ड" : "Leaderboard"}
          </h1>

          <button
            type="button"
            onClick={() => loadLeaderboard(true)}
            disabled={refreshing}
            className="w-9 h-9 rounded-full border border-[#E8D8C4] bg-[#FFFDF8] dark:bg-stone-900 flex items-center justify-center text-[#651317] dark:text-amber-300 active:scale-95 transition-all disabled:opacity-50 shrink-0"
            aria-label={isHi ? "रीफ़्रेश" : "Refresh"}
          >
            {refreshing ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <RefreshCw className="w-4 h-4" />
            )}
          </button>
        </div>
      </header>

      <div className="max-w-lg mx-auto px-4 mt-4 relative z-10 space-y-4">
        <div className="flex items-center gap-0 overflow-x-auto scrollbar-none border-b border-[#E8D8C4] dark:border-stone-800 -mx-1 px-1">
          {timeframeTabs.map(({ id, label }) => {
            const active = timeframe === id;
            return (
              <button
                key={id}
                type="button"
                onClick={() => setTimeframe(id)}
                className={cn(
                  "flex-1 min-w-0 px-2 py-2.5 text-[11px] sm:text-xs font-semibold whitespace-nowrap border-b-2 -mb-px transition-all",
                  active
                    ? "border-[#651317] text-[#651317] dark:text-amber-300 dark:border-amber-400 font-bold"
                    : "border-transparent text-stone-500 dark:text-stone-400 hover:text-[#3A2418]"
                )}
              >
                {label}
              </button>
            );
          })}
        </div>

        {loading ? (
          <div className="flex flex-col items-center justify-center py-24 space-y-3">
            <Loader2 className="w-9 h-9 animate-spin text-[#651317]" />
            <p className="text-xs text-[#786252] font-medium">
              {isHi ? "लोड हो रहा है…" : "Loading…"}
            </p>
          </div>
        ) : (
          <>
            {user && (
              <motion.div
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.35 }}
                className="grid grid-cols-3 bg-white dark:bg-stone-900 border border-[#E8D8C4] dark:border-stone-800 rounded-2xl overflow-hidden divide-x divide-[#E8D8C4]/80 dark:divide-stone-800"
              >
                <div className="flex flex-col items-center justify-center py-3.5 px-2 text-center">
                  <span className="text-[10px] font-semibold text-[#786252] uppercase tracking-wide">
                    {t.yourRank}
                  </span>
                  <span className={cn(RANK_NUM, "text-[#651317] dark:text-amber-200 mt-1")}>
                    #{currentUserRankRow?.rank ?? "—"}
                  </span>
                </div>
                <div className="flex flex-col items-center justify-center py-3.5 px-2 text-center">
                  <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-[#786252] uppercase tracking-wide">
                    <Flame className="w-3 h-3 text-[#651317]" />
                    {t.totalChant}
                  </span>
                  <span className={cn(RANK_NUM, "text-[#3A2418] dark:text-amber-100 mt-1")}>
                    {(currentUserRankRow?.chants || 0).toLocaleString()}
                  </span>
                </div>
                <div className="flex flex-col items-center justify-center py-3.5 px-2 text-center">
                  <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-[#786252] uppercase tracking-wide">
                    <CalendarDays className="w-3 h-3 text-[#651317]" />
                    {t.streak}
                  </span>
                  <span className={cn(RANK_NUM, "text-[#3A2418] dark:text-amber-100 mt-1")}>
                    {t.daysCount(currentStreak)}
                  </span>
                </div>
              </motion.div>
            )}

            {devotees.length === 0 ? (
              <div className="w-full bg-white dark:bg-stone-900 border border-[#E8D8C4] dark:border-stone-800 rounded-2xl p-8 flex flex-col items-center text-center">
                <Trophy className="w-8 h-8 text-[#D9A441] mb-2" />
                <h4 className="font-display text-sm font-bold text-[#3A2418] dark:text-amber-100 mb-1">
                  {isHi ? "लीडरबोर्ड खाली है" : "No Devotees Found"}
                </h4>
                <p className="text-xs text-[#786252] max-w-[240px] leading-relaxed">
                  {isHi
                    ? "कोई प्रविष्टि नहीं मिली। जाप शुरू करें और पहले स्थान पर पहुँचें!"
                    : "No devotees yet. Start chanting and lead the board!"}
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: 0.05 }}
                  className="pt-2 max-w-[400px] mx-auto w-full"
                >
                  <div className="flex items-end gap-1.5 sm:gap-2">
                    <PodiumColumn devotee={podiumRankings[1]} place={2} isHi={isHi} />
                    <PodiumColumn devotee={podiumRankings[0]} place={1} isHi={isHi} />
                    <PodiumColumn devotee={podiumRankings[2]} place={3} isHi={isHi} />
                  </div>
                  <div className="h-1 rounded-b-lg bg-[#E8D8C4]/80 dark:bg-stone-700" />
                </motion.div>

                <div className="space-y-2.5">
                  <div className="flex flex-col items-center text-center pt-1">
                    <h3 className="font-display text-sm font-bold text-[#651317] dark:text-amber-100">
                      {t.topDevotees}
                    </h3>
                    <div className="flex items-center justify-center gap-2 mt-1.5 w-full max-w-[160px]">
                      <div className="h-px flex-1 bg-gradient-to-r from-transparent to-[#D9A441]/50" />
                      <div className="w-1 h-1 rounded-full bg-[#D9A441]/60" />
                      <div className="h-px flex-1 bg-gradient-to-l from-transparent to-[#D9A441]/50" />
                    </div>
                  </div>

                  <div className="bg-white dark:bg-stone-900 border border-[#E8D8C4] dark:border-stone-800 rounded-2xl overflow-hidden divide-y divide-[#E8D8C4]/70 dark:divide-stone-800">
                    {listRankings.map((devotee, index) => {
                      const isCurrentUser = !!devotee.isCurrentUser;
                      return (
                        <motion.div
                          key={devotee.id}
                          initial={{ opacity: 0, y: 6 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ duration: 0.28, delay: 0.04 * index }}
                          className={cn(
                            "flex items-center justify-between px-4 h-[56px] relative",
                            isCurrentUser && "bg-[#651317]/[0.06] dark:bg-amber-500/10"
                          )}
                        >
                          {isCurrentUser && (
                            <span className="absolute left-0 top-0 bottom-0 w-[3px] bg-[#651317] dark:bg-amber-400" />
                          )}

                          <div className="flex items-center gap-3 min-w-0">
                            <span className={cn(RANK_NUM, "w-8 text-center shrink-0", rankTint(devotee.rank))}>
                              #{devotee.rank}
                            </span>
                            <div className="w-9 h-9 rounded-full border border-[#E8D8C4] dark:border-stone-700 overflow-hidden shrink-0 bg-[#FFFDF8] dark:bg-stone-800 flex items-center justify-center">
                              {devotee.avatar ? (
                                <img src={devotee.avatar} alt="" className="w-full h-full object-cover" />
                              ) : (
                                <span className="text-[10px] font-bold text-[#651317] dark:text-amber-200">
                                  {devotee.name.charAt(0).toUpperCase()}
                                </span>
                              )}
                            </div>
                            <div className="min-w-0 flex items-center gap-1.5">
                              <span className="text-sm font-semibold text-[#3A2418] dark:text-stone-100 truncate">
                                {devotee.name}
                              </span>
                              {isCurrentUser && (
                                <span className="shrink-0 text-[9px] font-bold px-1.5 py-0.5 rounded-full bg-[#651317] text-white">
                                  {t.you}
                                </span>
                              )}
                            </div>
                          </div>

                          <div className="flex flex-col items-end shrink-0 pl-2">
                            <span className={cn(RANK_NUM, "text-[#3A2418] dark:text-amber-100")}>
                              {devotee.chants.toLocaleString()}
                            </span>
                            <span className="text-[9px] text-[#786252] font-medium mt-0.5">{t.chants}</span>
                          </div>
                        </motion.div>
                      );
                    })}
                  </div>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      <div className="fixed bottom-4 left-4 right-4 z-40 max-w-lg mx-auto">
        <div className="bg-[#FFFDF8] dark:bg-stone-900 border border-[#E8D8C4] dark:border-stone-800 rounded-2xl py-2.5 px-3 flex items-center gap-2.5 shadow-[0_8px_24px_rgba(74,14,18,0.08)]">
          <div className="w-9 h-9 rounded-full bg-[#651317] flex items-center justify-center text-white font-display text-sm font-bold shrink-0">
            ॐ
          </div>
          <div className="flex-1 min-w-0 text-left">
            <span className="text-xs font-bold text-[#3A2418] dark:text-amber-100 truncate block">
              {t.continueChanting}
            </span>
          </div>
          <button
            type="button"
            onClick={continueAction}
            className="inline-flex items-center gap-0.5 h-9 px-3.5 rounded-full bg-[#651317] hover:bg-[#4f0f12] text-white text-xs font-bold shrink-0 active:scale-95 transition-all"
          >
            {t.continueBtn}
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
}
