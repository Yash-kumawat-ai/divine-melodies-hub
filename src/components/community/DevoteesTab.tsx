import { Flame } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import type { GroupMember } from "@/lib/community/communityApi";

export interface DevoteesTabProps {
  isHi: boolean;
  groupRankings: any[];
  loadingRankings: boolean;
  groupMembers: GroupMember[];
  currentUserId?: string;
}

export function DevoteesTab({
  isHi,
  groupRankings,
  loadingRankings,
  groupMembers,
  currentUserId,
}: DevoteesTabProps) {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

        {/* Devotees Chanting Rankings */}
        <div className="md:col-span-2 space-y-4">
          <h3 className="font-display font-extrabold text-sm text-orange-950 dark:text-amber-100 flex items-center gap-1.5">
            🏆 {isHi ? "जप यज्ञ लीडरबोर्ड" : "Japa Yajna Leaderboard"}
          </h3>

          {loadingRankings ? (
            <div className="space-y-3" aria-busy="true" aria-label="Loading rankings">
              {[1, 2, 3].map((i) => (
                <div
                  key={i}
                  className="h-14 bg-stone-100 dark:bg-stone-900 rounded-xl animate-pulse"
                />
              ))}
            </div>
          ) : groupRankings.length > 0 ? (
            <div className="space-y-6">

              {/* Top 3 podium */}
              <div className="grid grid-cols-3 gap-3 md:gap-4 pt-4 pb-2">
                {/* Rank 2 */}
                {groupRankings[1] && (
                  <div className="flex flex-col items-center justify-end text-center p-3 rounded-2xl bg-white/40 dark:bg-stone-900/40 border border-stone-200 dark:border-stone-800 shadow-xs relative">
                    <span className="absolute -top-3.5 left-1/2 -translate-x-1/2 w-7 h-7 rounded-full bg-slate-300 text-slate-800 flex items-center justify-center font-bold text-xs shadow-md border-2 border-white dark:border-stone-900">
                      2
                    </span>
                    <div className="w-12 h-12 rounded-full overflow-hidden border-2 border-slate-300 mb-2 shadow-inner">
                      {groupRankings[1].avatar_url ? (
                        <img
                          src={groupRankings[1].avatar_url}
                          alt={groupRankings[1].display_name}
                          className="w-full h-full object-cover"
                          loading="lazy"
                        />
                      ) : (
                        <div className="w-full h-full bg-slate-200 dark:bg-stone-850 flex items-center justify-center text-xs font-bold text-slate-500">
                          {groupRankings[1].display_name[0]}
                        </div>
                      )}
                    </div>
                    <span className="text-[10px] md:text-xs font-bold text-stone-700 dark:text-stone-300 truncate w-full">
                      {groupRankings[1].display_name}
                    </span>
                    <span className="text-[9px] font-extrabold text-slate-500 block mt-0.5">
                      {groupRankings[1].total_chants.toLocaleString()}{" "}
                      {isHi ? "जप" : "japs"}
                    </span>
                  </div>
                )}

                {/* Rank 1 */}
                {groupRankings[0] && (
                  <div className="flex flex-col items-center justify-end text-center p-4 rounded-2xl bg-gradient-to-b from-amber-500/15 to-amber-500/5 dark:from-amber-500/5 border-2 border-amber-400 shadow-md relative scale-[1.05] z-10">
                    <span className="absolute -top-4.5 left-1/2 -translate-x-1/2 w-9 h-9 rounded-full bg-amber-500 text-white flex items-center justify-center font-extrabold text-sm shadow-lg border-2 border-white dark:border-stone-900 animate-pulse">
                      👑
                    </span>
                    <div className="w-14 h-14 rounded-full overflow-hidden border-2 border-amber-400 mb-2 shadow-lg">
                      {groupRankings[0].avatar_url ? (
                        <img
                          src={groupRankings[0].avatar_url}
                          alt={groupRankings[0].display_name}
                          className="w-full h-full object-cover"
                          loading="lazy"
                        />
                      ) : (
                        <div className="w-full h-full bg-amber-100 dark:bg-amber-950/30 flex items-center justify-center text-sm font-bold text-amber-600">
                          {groupRankings[0].display_name[0]}
                        </div>
                      )}
                    </div>
                    <span className="text-xs md:text-sm font-extrabold text-stone-900 dark:text-amber-100 truncate w-full">
                      {groupRankings[0].display_name}
                    </span>
                    <span className="text-[10px] md:text-xs font-extrabold text-orange-600 dark:text-amber-400 block mt-0.5">
                      {groupRankings[0].total_chants.toLocaleString()}{" "}
                      {isHi ? "जप" : "japs"}
                    </span>
                  </div>
                )}

                {/* Rank 3 */}
                {groupRankings[2] && (
                  <div className="flex flex-col items-center justify-end text-center p-3 rounded-2xl bg-white/40 dark:bg-stone-900/40 border border-stone-200 dark:border-stone-800 shadow-xs relative">
                    <span className="absolute -top-3.5 left-1/2 -translate-x-1/2 w-7 h-7 rounded-full bg-amber-700 text-amber-100 flex items-center justify-center font-bold text-xs shadow-md border-2 border-white dark:border-stone-900">
                      3
                    </span>
                    <div className="w-12 h-12 rounded-full overflow-hidden border-2 border-amber-700 mb-2 shadow-inner">
                      {groupRankings[2].avatar_url ? (
                        <img
                          src={groupRankings[2].avatar_url}
                          alt={groupRankings[2].display_name}
                          className="w-full h-full object-cover"
                          loading="lazy"
                        />
                      ) : (
                        <div className="w-full h-full bg-amber-50 dark:bg-stone-850 flex items-center justify-center text-xs font-bold text-amber-700">
                          {groupRankings[2].display_name[0]}
                        </div>
                      )}
                    </div>
                    <span className="text-[10px] md:text-xs font-bold text-stone-700 dark:text-stone-300 truncate w-full">
                      {groupRankings[2].display_name}
                    </span>
                    <span className="text-[9px] font-extrabold text-amber-700 block mt-0.5">
                      {groupRankings[2].total_chants.toLocaleString()}{" "}
                      {isHi ? "जप" : "japs"}
                    </span>
                  </div>
                )}
              </div>

              {/* Standings table */}
              <div className="bg-white dark:bg-stone-900 border border-orange-500/10 rounded-2xl overflow-hidden shadow-xs">
                <div className="overflow-x-auto">
                  <table
                    className="w-full text-left border-collapse text-xs"
                    aria-label={isHi ? "जप यज्ञ लीडरबोर्ड" : "Japa Yajna Leaderboard"}
                  >
                    <thead>
                      <tr className="bg-stone-50 dark:bg-stone-950 text-stone-500 dark:text-stone-400 font-bold border-b border-orange-500/10">
                        <th className="py-3 px-4 w-12 text-center">{isHi ? "स्थान" : "Rank"}</th>
                        <th className="py-3 px-4">{isHi ? "श्रद्धालु" : "Devotee"}</th>
                        <th className="py-3 px-4 text-center">{isHi ? "नियम" : "Streak"}</th>
                        <th className="py-3 px-4 text-right">{isHi ? "साप्ताहिक" : "Weekly"}</th>
                        <th className="py-3 px-4 text-right">{isHi ? "कुल जप" : "Total"}</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-stone-100 dark:divide-stone-950 font-medium">
                      {groupRankings.map((row, index) => (
                        <tr
                          key={row.user_id}
                          className={`hover:bg-orange-500/5 transition-colors ${
                            currentUserId === row.user_id
                              ? "bg-amber-500/5 text-orange-950 dark:text-amber-100 font-extrabold"
                              : ""
                          }`}
                        >
                          <td className="py-3 px-4 text-center font-extrabold text-stone-400 dark:text-stone-500">
                            {index + 1}
                          </td>
                          <td className="py-3 px-4 flex items-center gap-2">
                            <div className="w-7 h-7 rounded-full overflow-hidden bg-stone-100 dark:bg-stone-950 border border-stone-200 shrink-0">
                              {row.avatar_url ? (
                                <img
                                  src={row.avatar_url}
                                  alt={row.display_name}
                                  className="w-full h-full object-cover"
                                  loading="lazy"
                                />
                              ) : (
                                <div className="w-full h-full flex items-center justify-center text-[10px] font-bold text-stone-500">
                                  {row.display_name[0]}
                                </div>
                              )}
                            </div>
                            <span className="truncate">{row.display_name}</span>
                          </td>
                          <td className="py-3 px-4 text-center">
                            {row.current_streak > 0 ? (
                              <span className="inline-flex items-center gap-0.5 text-orange-500 font-extrabold">
                                <Flame className="w-3.5 h-3.5 fill-orange-500" />
                                {row.current_streak}d
                              </span>
                            ) : (
                              <span className="text-stone-400 font-medium">-</span>
                            )}
                          </td>
                          <td className="py-3 px-4 text-right text-stone-500 dark:text-stone-400">
                            {row.weekly_japs?.toLocaleString() || 0}
                          </td>
                          <td className="py-3 px-4 text-right font-extrabold text-stone-850 dark:text-stone-200">
                            {row.total_chants.toLocaleString()}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          ) : (
            <div className="text-center py-12 bg-white dark:bg-stone-900 border border-orange-500/10 rounded-2xl">
              <span className="text-3xl block select-none">📿</span>
              <p className="text-stone-500 dark:text-stone-400 font-medium text-xs mt-3 leading-relaxed">
                {isHi
                  ? "अभी तक कोई नाम जप नहीं हुआ। सामूहिक जप शुरू करने वाले पहले बनें!"
                  : "No chants logged yet. Be the first to start the chanting yajna!"}
              </p>
            </div>
          )}
        </div>

        {/* Devotees directory (Flat List) */}
        <div className="space-y-4">
          <h3 className="font-display font-extrabold text-sm text-orange-950 dark:text-amber-100 flex items-center gap-1.5">
            👥 {isHi ? "देव परिवार (सदस्य)" : "Devotee Family"}
          </h3>
          <div className="bg-white dark:bg-stone-900 border border-orange-500/10 rounded-2xl p-4 divide-y divide-stone-100 dark:divide-stone-950 shadow-xs max-h-[480px] overflow-y-auto font-sans">
            {groupMembers.map((m) => (
              <div
                key={m.user_id}
                className="py-3 first:pt-0 last:pb-0 flex items-center justify-between gap-3 text-xs"
              >
                <div className="flex items-center gap-2 min-w-0 font-medium">
                  <div className="w-8 h-8 rounded-full overflow-hidden bg-stone-100 dark:bg-stone-950 border border-stone-200 shrink-0">
                    {m.profile?.avatar_url ? (
                      <img
                        src={m.profile.avatar_url}
                        alt={m.profile.display_name}
                        className="w-full h-full object-cover"
                        loading="lazy"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-xs font-bold text-stone-500">
                        {(m.profile?.display_name || "D")[0]}
                      </div>
                    )}
                  </div>
                  <div className="min-w-0">
                    <span className="font-bold text-stone-850 dark:text-stone-200 block truncate">
                      {m.profile?.display_name || "Devotee"}
                    </span>
                    <span className="text-[10px] text-stone-400 block truncate">
                      Joined {new Date(m.joined_at).toLocaleDateString()}
                    </span>
                  </div>
                </div>
                <Badge
                  variant="outline"
                  className={`text-[9px] py-0 px-1.5 font-bold uppercase ${
                    m.role === "admin"
                      ? "border-amber-400 text-amber-500 bg-amber-500/5"
                      : "border-stone-200 text-stone-400"
                  }`}
                >
                  {m.role === "admin"
                    ? isHi
                      ? "प्रशासक"
                      : "Admin"
                    : isHi
                    ? "भक्त"
                    : "Devotee"}
                </Badge>
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
}
