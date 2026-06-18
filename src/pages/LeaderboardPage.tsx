import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Trophy, ArrowLeft, Loader2, Sparkles, EyeOff, Play, RefreshCw } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useLanguage } from "@/hooks/useLanguage";
import { fetchLeaderboardRankings, type LeaderboardRanking } from "@/lib/mantraJapa/mantraJapaApi";
import { toast } from "sonner";

export default function LeaderboardPage() {
  const { user, profile } = useAuth();
  const { language } = useLanguage();
  const navigate = useNavigate();
  const isHi = language === "hi";

  // --- API State ---
  const [rankings, setRankings] = useState<LeaderboardRanking[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Load Leaderboard Rankings
  const loadLeaderboard = async (showRefresher = false) => {
    if (showRefresher) setRefreshing(true);
    else setLoading(true);

    try {
      // Fetch global rankings (top 10 + viewer rank)
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

  // Find User's personal ranking
  const personalRank = user ? rankings.find((r) => r.user_id === user.id) : null;

  // Filter Top 10 rankings for list
  const top10Rankings = rankings.filter((r) => r.rank <= 10).slice(0, 10);
  const podiumRankings = top10Rankings.slice(0, 3);
  const listRankings = top10Rankings.slice(3);

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#0a0508] via-[#0f070e] to-[#050306] pb-32 text-amber-50 relative overflow-hidden font-display">
      {/* Background Decorative Rings */}
      <div className="pointer-events-none fixed -top-40 -left-40 w-[500px] h-[500px] bg-purple-500/5 rounded-full blur-[120px]" />
      <div className="pointer-events-none fixed -bottom-40 -right-40 w-[500px] h-[500px] bg-orange-500/5 rounded-full blur-[120px]" />

      {/* HEADER */}
      <header className="sticky top-0 z-40 bg-[#0a0508]/85 backdrop-blur-lg border-b border-white/5 px-4 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate("/meditation?practice=mantra_jap_home")}
            className="flex items-center justify-center h-10 w-10 rounded-full bg-white/5 hover:bg-white/10 active:scale-95 text-amber-100 transition-all border border-white/10"
            aria-label="Back to Japa"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-xl font-bold text-white tracking-wide flex items-center gap-2">
              <Trophy className="w-5 h-5 text-orange-400 animate-pulse" />
              {isHi ? "वैश्विक लीडरबोर्ड" : "Global Leaderboard"}
            </h1>
            <p className="text-xs text-amber-200/50">
              {isHi ? "भक्तों का आध्यात्मिक संगम" : "Spiritual assembly of devotees"}
            </p>
          </div>
        </div>
        <button
          onClick={() => loadLeaderboard(true)}
          disabled={refreshing}
          className="h-10 w-10 rounded-full bg-white/5 hover:bg-white/10 flex items-center justify-center text-amber-100/70 border border-white/5 active:rotate-180 transition-all duration-300"
        >
          {refreshing ? <Loader2 className="w-4 h-4 animate-spin text-orange-400" /> : <RefreshCw className="w-4 h-4" />}
        </button>
      </header>

      {/* MAIN VIEW CONTENTS */}
      <div className="max-w-4xl mx-auto px-4 mt-8">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 space-y-4">
            <Loader2 className="w-10 h-10 animate-spin text-orange-500" />
            <p className="text-sm text-amber-200/60 font-medium">
              {isHi ? "आध्यात्मिक डेटा प्राप्त हो रहा है..." : "Fetching spiritual statistics..."}
            </p>
          </div>
        ) : (
          <div className="space-y-6">
            {/* PODIUM (Ranks 1 to 3) */}
            {podiumRankings.length > 0 ? (
              <div className="grid grid-cols-3 gap-3 md:gap-6 items-end pt-12 pb-6 max-w-2xl mx-auto">
                {/* Rank 2 (Silver) */}
                {podiumRankings[1] ? (
                  <div className="flex flex-col items-center">
                    <div className="relative">
                      <div className="absolute inset-0 bg-gradient-to-t from-gray-400 to-white opacity-25 rounded-full blur" />
                      <div className="relative w-16 h-16 md:w-20 md:h-20 rounded-full border-2 border-gray-400 overflow-hidden bg-[#221221]">
                        {podiumRankings[1].avatar_url ? (
                          <img src={podiumRankings[1].avatar_url} alt={podiumRankings[1].display_name} className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-gray-400 font-bold text-xl">
                            {podiumRankings[1].display_name.charAt(0).toUpperCase()}
                          </div>
                        )}
                      </div>
                      <span className="absolute -bottom-2 -right-1 bg-gray-400 text-[#0c050e] text-xs font-bold w-6 h-6 rounded-full flex items-center justify-center shadow-lg">
                        2
                      </span>
                    </div>
                    <span className="mt-4 text-xs md:text-sm font-semibold truncate max-w-full text-center">
                      {podiumRankings[1].display_name}
                    </span>
                    <div className="mt-2 bg-[#221721] border border-gray-500/20 px-3 py-1.5 rounded-full text-xs font-bold text-gray-300">
                      {Number(podiumRankings[1].total_chants).toLocaleString()} {isHi ? "जाप" : "chants"}
                    </div>
                  </div>
                ) : (
                  <div />
                )}

                {/* Rank 1 (Gold) */}
                {podiumRankings[0] ? (
                  <div className="flex flex-col items-center -translate-y-4">
                    <div className="relative">
                      <span className="absolute -top-7 left-1/2 -translate-x-1/2 text-2xl animate-bounce">👑</span>
                      <div className="absolute inset-0 bg-gradient-to-t from-yellow-500 to-amber-300 opacity-40 rounded-full blur-[10px]" />
                      <div className="relative w-20 h-20 md:w-24 md:h-24 rounded-full border-4 border-yellow-400 overflow-hidden bg-[#221221] shadow-[0_0_25px_rgba(234,179,8,0.25)]">
                        {podiumRankings[0].avatar_url ? (
                          <img src={podiumRankings[0].avatar_url} alt={podiumRankings[0].display_name} className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-yellow-400 font-bold text-2xl">
                            {podiumRankings[0].display_name.charAt(0).toUpperCase()}
                          </div>
                        )}
                      </div>
                      <span className="absolute -bottom-2 -right-1 bg-yellow-400 text-[#0c050e] text-xs font-black w-7 h-7 rounded-full flex items-center justify-center shadow-lg border-2 border-[#0a0508]">
                        1
                      </span>
                    </div>
                    <span className="mt-4 text-sm md:text-base font-bold truncate max-w-full text-center">
                      {podiumRankings[0].display_name}
                    </span>
                    <div className="mt-2 bg-gradient-to-r from-yellow-600/30 to-amber-500/30 border border-yellow-500/30 px-4 py-1.5 rounded-full text-xs md:text-sm font-black text-yellow-300 shadow-lg shadow-yellow-500/5">
                      {Number(podiumRankings[0].total_chants).toLocaleString()} {isHi ? "जाप" : "chants"}
                    </div>
                  </div>
                ) : (
                  <div />
                )}

                {/* Rank 3 (Bronze) */}
                {podiumRankings[2] ? (
                  <div className="flex flex-col items-center">
                    <div className="relative">
                      <div className="absolute inset-0 bg-gradient-to-t from-amber-600 to-amber-800 opacity-20 rounded-full blur" />
                      <div className="relative w-16 h-16 md:w-20 md:h-20 rounded-full border-2 border-amber-600 overflow-hidden bg-[#221221]">
                        {podiumRankings[2].avatar_url ? (
                          <img src={podiumRankings[2].avatar_url} alt={podiumRankings[2].display_name} className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-amber-500 font-bold text-xl">
                            {podiumRankings[2].display_name.charAt(0).toUpperCase()}
                          </div>
                        )}
                      </div>
                      <span className="absolute -bottom-2 -right-1 bg-amber-600 text-white text-xs font-bold w-6 h-6 rounded-full flex items-center justify-center shadow-lg">
                        3
                      </span>
                    </div>
                    <span className="mt-4 text-xs md:text-sm font-semibold truncate max-w-full text-center">
                      {podiumRankings[2].display_name}
                    </span>
                    <div className="mt-2 bg-[#221721] border border-amber-600/20 px-3 py-1.5 rounded-full text-xs font-bold text-amber-400">
                      {Number(podiumRankings[2].total_chants).toLocaleString()} {isHi ? "जाप" : "chants"}
                    </div>
                  </div>
                ) : (
                  <div />
                )}
              </div>
            ) : (
              <div className="text-center py-10 bg-white/5 border border-white/5 rounded-3xl">
                <EyeOff className="w-8 h-8 text-amber-100/30 mx-auto mb-2" />
                <p className="text-sm text-amber-200/50">
                  {isHi ? "इस सूची में अभी कोई भक्त उपलब्ध नहीं है।" : "No devotees found in this category."}
                </p>
              </div>
            )}

            {/* SCROLL LIST (Ranks 4 to 10) */}
            {listRankings.length > 0 && (
              <div className="bg-[#10070f] border border-white/5 rounded-3xl p-3 md:p-6 shadow-xl space-y-1">
                {listRankings.map((devotee) => {
                  const isCurrentUser = user && devotee.user_id === user.id;
                  return (
                    <div
                      key={devotee.user_id}
                      className={`flex items-center justify-between p-3.5 rounded-2xl hover:bg-white/5 transition-all ${
                        isCurrentUser ? "bg-orange-500/10 border border-orange-500/20" : ""
                      }`}
                    >
                      <div className="flex items-center gap-4">
                        <span className="text-sm font-bold text-amber-200/60 w-5 text-center">
                          {devotee.rank}
                        </span>
                        <div className="relative w-10 h-10 rounded-full overflow-hidden bg-[#221221] border border-white/10">
                          {devotee.avatar_url ? (
                            <img src={devotee.avatar_url} alt={devotee.display_name} className="w-full h-full object-cover" />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-amber-300/80 font-semibold">
                              {devotee.display_name.charAt(0).toUpperCase()}
                            </div>
                          )}
                        </div>
                        <div>
                          <div className="text-sm font-bold text-white flex items-center gap-2">
                            {devotee.display_name}
                            {isCurrentUser && (
                              <span className="text-[9px] px-1.5 py-0.5 rounded bg-orange-500/20 text-orange-400 font-bold border border-orange-500/30 uppercase">
                                {isHi ? "आप" : "You"}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>

                      <div className="text-right">
                        <span className="text-sm font-black text-amber-300">
                          {Number(devotee.total_chants).toLocaleString()}
                        </span>
                        <span className="block text-[9px] text-amber-200/40 font-medium uppercase">
                          {isHi ? "मंत्र" : "chants"}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}
      </div>

      {/* FLOAT ACTION BUTTON FOR WORKOUT JAPA */}
      <div className="fixed bottom-24 right-6 md:right-8 z-30">
        <button
          onClick={() => navigate("/meditation?practice=mantra_jap_home")}
          className="flex items-center gap-2 px-5 py-3 rounded-full bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 active:scale-95 transition-all text-white font-bold text-sm shadow-xl shadow-orange-500/25 border border-orange-400/25"
        >
          <Play className="w-4 h-4 fill-current" />
          <span>{isHi ? "जाप शुरू करें" : "Start Japa"}</span>
        </button>
      </div>

      {/* USER PERSONAL RANK CARD - STICKY AT BOTTOM */}
      {user && !loading && (
        <div className="fixed bottom-0 left-0 right-0 z-40 bg-[#0d070e]/95 border-t border-white/10 backdrop-blur-xl py-4 px-4 shadow-[0_-10px_30px_rgba(0,0,0,0.8)]">
          <div className="max-w-4xl mx-auto flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex items-center justify-center bg-gradient-to-br from-orange-500/20 to-pink-500/20 border border-orange-500/30 w-10 h-10 rounded-2xl">
                <span className="text-sm font-black text-orange-400">
                  {personalRank ? personalRank.rank : (rankings.length > 0 ? rankings[rankings.length - 1].rank : 1)}
                </span>
              </div>
              <div className="relative w-10 h-10 rounded-full overflow-hidden border border-orange-500/30">
                {profile?.avatar_url ? (
                  <img src={profile.avatar_url} alt={profile.name} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-[#221221] text-amber-300 font-bold">
                    {profile?.name?.charAt(0).toUpperCase() || "D"}
                  </div>
                )}
              </div>
              <div>
                <div className="text-xs md:text-sm font-bold text-white flex items-center gap-1.5">
                  {profile?.name || "Devotee"}
                  <span className="text-[8px] bg-orange-500/20 text-orange-400 px-1 py-0.5 rounded border border-orange-500/20 uppercase font-black">
                    {isHi ? "आप" : "YOU"}
                  </span>
                </div>
              </div>
            </div>

            <div className="text-right">
              <span className="text-sm md:text-base font-black text-orange-400">
                {personalRank ? Number(personalRank.total_chants).toLocaleString() : "0"}
              </span>
              <span className="block text-[8px] text-amber-200/50 font-bold uppercase tracking-wider">
                {isHi ? "कुल जाप" : "total chants"}
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
