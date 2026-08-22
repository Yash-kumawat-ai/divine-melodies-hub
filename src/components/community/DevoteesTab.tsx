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
    <div className="space-y-5">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">

        {/* Devotees Chanting Rankings */}
        <div className="md:col-span-2 space-y-3">
          <h3 className="font-display font-semibold text-sm text-[#651317] dark:text-amber-100 flex items-center gap-1.5">
            🏆 {isHi ? "जप यज्ञ लीडरबोर्ड" : "Japa Yajna Leaderboard"}
          </h3>

          {loadingRankings ? (
            <div className="space-y-2" aria-busy="true" aria-label="Loading rankings">
              {[1, 2, 3].map((i) => (
                <div
                  key={i}
                  className="h-10 bg-stone-100 dark:bg-stone-900 rounded-xl animate-pulse"
                />
              ))}
            </div>
          ) : groupRankings.length > 0 ? (
            <div className="space-y-3">

              {/* Top 3 podium — simple, clean, light */}
              <div className="grid grid-cols-3 gap-2 sm:gap-3 items-end">

                {/* Rank 2 (Silver) */}
                {groupRankings[1] ? (
                  <div className="flex flex-col items-center text-center py-3 px-2 rounded-xl bg-[#FFFDF8] dark:bg-[#1A120B] border border-[#E8D8C4] dark:border-stone-800">
                    <span className="text-[10px] font-semibold text-[#8C7A6B] dark:text-stone-400 mb-1.5">🥈 2</span>
                    <div className="w-10 h-10 rounded-full overflow-hidden border border-[#E8D8C4] dark:border-stone-700 mb-1.5 bg-[#FAF6EE] dark:bg-stone-900 flex items-center justify-center">
                      {groupRankings[1].avatar_url ? (
                        <img
                          src={groupRankings[1].avatar_url}
                          alt={groupRankings[1].display_name}
                          className="w-full h-full object-cover"
                          loading="lazy"
                        />
                      ) : (
                        <span className="text-xs font-semibold text-[#651317]">
                          {groupRankings[1].display_name[0]}
                        </span>
                      )}
                    </div>
                    <span className="text-[11px] font-semibold text-[#32251E] dark:text-stone-300 truncate w-full">
                      {groupRankings[1].display_name}
                    </span>
                    <span className="text-[10px] font-normal text-[#8C7A6B] dark:text-stone-400 mt-0.5">
                      {groupRankings[1].total_chants.toLocaleString()} {isHi ? "जप" : "japs"}
                    </span>
                  </div>
                ) : <div />}

                {/* Rank 1 (Gold) — slightly taller */}
                {groupRankings[0] && (
                  <div className="flex flex-col items-center text-center py-3.5 px-2 rounded-xl bg-[#FFFDF8] dark:bg-[#1A120B] border border-[#E8D8C4] dark:border-stone-800">
                    <span className="text-[10px] font-semibold text-amber-600 dark:text-amber-400 mb-1.5">🥇 1</span>
                    <div className="w-12 h-12 rounded-full overflow-hidden border border-[#E8D8C4] dark:border-stone-700 mb-1.5 bg-[#FAF6EE] dark:bg-stone-900 flex items-center justify-center">
                      {groupRankings[0].avatar_url ? (
                        <img
                          src={groupRankings[0].avatar_url}
                          alt={groupRankings[0].display_name}
                          className="w-full h-full object-cover"
                          loading="lazy"
                        />
                      ) : (
                        <span className="text-sm font-semibold text-[#651317]">
                          {groupRankings[0].display_name[0]}
                        </span>
                      )}
                    </div>
                    <span className="text-xs font-semibold text-[#651317] dark:text-amber-100 truncate w-full">
                      {groupRankings[0].display_name}
                    </span>
                    <span className="text-[10px] font-normal text-[#8C7A6B] dark:text-stone-400 mt-0.5">
                      {groupRankings[0].total_chants.toLocaleString()} {isHi ? "जप" : "japs"}
                    </span>
                  </div>
                )}

                {/* Rank 3 (Bronze) */}
                {groupRankings[2] ? (
                  <div className="flex flex-col items-center text-center py-3 px-2 rounded-xl bg-[#FFFDF8] dark:bg-[#1A120B] border border-[#E8D8C4] dark:border-stone-800">
                    <span className="text-[10px] font-semibold text-[#8C7A6B] dark:text-stone-400 mb-1.5">🥉 3</span>
                    <div className="w-10 h-10 rounded-full overflow-hidden border border-[#E8D8C4] dark:border-stone-700 mb-1.5 bg-[#FAF6EE] dark:bg-stone-900 flex items-center justify-center">
                      {groupRankings[2].avatar_url ? (
                        <img
                          src={groupRankings[2].avatar_url}
                          alt={groupRankings[2].display_name}
                          className="w-full h-full object-cover"
                          loading="lazy"
                        />
                      ) : (
                        <span className="text-xs font-semibold text-[#651317]">
                          {groupRankings[2].display_name[0]}
                        </span>
                      )}
                    </div>
                    <span className="text-[11px] font-semibold text-[#32251E] dark:text-stone-300 truncate w-full">
                      {groupRankings[2].display_name}
                    </span>
                    <span className="text-[10px] font-normal text-[#8C7A6B] dark:text-stone-400 mt-0.5">
                      {groupRankings[2].total_chants.toLocaleString()} {isHi ? "जप" : "japs"}
                    </span>
                  </div>
                ) : <div />}
              </div>

              {/* Standings table */}
              <div className="bg-[#FFFDF8] dark:bg-[#1A120B] border border-[#E8D8C4] dark:border-stone-800 rounded-xl overflow-hidden">
                <div className="overflow-x-auto">
                  <table
                    className="w-full text-left border-collapse text-xs"
                    aria-label={isHi ? "जप यज्ञ लीडरबोर्ड" : "Japa Yajna Leaderboard"}
                  >
                    <thead>
                      <tr className="bg-[#FAF6EE] dark:bg-stone-900 text-[#8C7A6B] dark:text-stone-400 font-medium text-[10px] uppercase tracking-wider border-b border-[#E8D8C4]/60 dark:border-stone-800">
                        <th className="py-2 px-3 w-10 text-center">{isHi ? "स्थान" : "Rank"}</th>
                        <th className="py-2 px-3">{isHi ? "श्रद्धालु" : "Devotee"}</th>
                        <th className="py-2 px-3 text-center">{isHi ? "नियम" : "Streak"}</th>
                        <th className="py-2 px-3 text-right">{isHi ? "साप्ताहिक" : "Weekly"}</th>
                        <th className="py-2 px-3 text-right">{isHi ? "कुल" : "Total"}</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#E8D8C4]/40 dark:divide-stone-800/60 font-normal text-xs text-[#32251E] dark:text-stone-200">
                      {groupRankings.map((row, index) => (
                        <tr
                          key={row.user_id}
                          className={`hover:bg-[#FAF6EE]/50 dark:hover:bg-stone-900/50 transition-colors ${
                            currentUserId === row.user_id
                              ? "bg-[#FAF0E4]/50 dark:bg-amber-950/20 text-[#651317] dark:text-amber-100 font-medium"
                              : ""
                          }`}
                        >
                          <td className="py-2 px-3 text-center font-medium text-[#8C7A6B] dark:text-stone-400">
                            {index + 1}
                          </td>
                          <td className="py-2 px-3 flex items-center gap-2">
                            <div className="w-6 h-6 rounded-full overflow-hidden bg-[#FAF0E4] dark:bg-[#2B1F14] border border-[#E8D8C4] shrink-0 flex items-center justify-center">
                              {row.avatar_url ? (
                                <img
                                  src={row.avatar_url}
                                  alt={row.display_name}
                                  className="w-full h-full object-cover"
                                  loading="lazy"
                                />
                              ) : (
                                <span className="text-[10px] font-semibold text-[#651317] dark:text-amber-300">
                                  {row.display_name[0]}
                                </span>
                              )}
                            </div>
                            <span className="truncate">{row.display_name}</span>
                          </td>
                          <td className="py-2 px-3 text-center">
                            {row.current_streak > 0 ? (
                              <span className="inline-flex items-center gap-0.5 text-amber-600 font-medium">
                                <Flame className="w-3 h-3 fill-amber-500 text-amber-500" />
                                {row.current_streak}d
                              </span>
                            ) : (
                              <span className="text-stone-400">-</span>
                            )}
                          </td>
                          <td className="py-2 px-3 text-right text-[#8C7A6B] dark:text-stone-400">
                            {row.weekly_japs?.toLocaleString() || 0}
                          </td>
                          <td className="py-2 px-3 text-right font-semibold text-[#651317] dark:text-amber-300">
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
            <div className="text-center py-8 bg-[#FFFDF8] dark:bg-[#1A120B] border border-[#E8D8C4] dark:border-stone-800 rounded-xl">
              <span className="text-3xl block select-none">📿</span>
              <p className="text-[#8C7A6B] dark:text-stone-400 font-normal text-xs mt-2 leading-relaxed">
                {isHi
                  ? "अभी तक कोई नाम जप नहीं हुआ। सामूहिक जप शुरू करने वाले पहले बनें!"
                  : "No chants logged yet. Be the first to start the chanting yajna!"}
              </p>
            </div>
          )}
        </div>

        {/* Devotees directory (Flat List) */}
        <div className="space-y-3">
          <h3 className="font-display font-semibold text-sm text-[#651317] dark:text-amber-100 flex items-center gap-1.5">
            👥 {isHi ? "देव परिवार" : "Devotee Family"}
          </h3>
          <div className="bg-[#FFFDF8] dark:bg-[#1A120B] border border-[#E8D8C4] dark:border-stone-800 rounded-xl p-3 divide-y divide-[#E8D8C4]/50 dark:divide-stone-800 max-h-[440px] overflow-y-auto">
            {groupMembers.map((m) => (
              <div
                key={m.user_id}
                className="py-2.5 first:pt-0 last:pb-0 flex items-center justify-between gap-3 text-xs"
              >
                <div className="flex items-center gap-2 min-w-0">
                  <div className="w-7 h-7 rounded-full overflow-hidden bg-[#FAF0E4] dark:bg-[#2B1F14] border border-[#E8D8C4] shrink-0 flex items-center justify-center">
                    {m.profile?.avatar_url ? (
                      <img
                        src={m.profile.avatar_url}
                        alt={m.profile.display_name}
                        className="w-full h-full object-cover"
                        loading="lazy"
                      />
                    ) : (
                      <span className="text-xs font-semibold text-[#651317] dark:text-amber-300">
                        {(m.profile?.display_name || "D")[0]}
                      </span>
                    )}
                  </div>
                  <div className="min-w-0">
                    <span className="font-medium text-[#32251E] dark:text-stone-200 block truncate">
                      {m.profile?.display_name || "Devotee"}
                    </span>
                    <span className="text-[10px] font-normal text-[#8C7A6B] dark:text-stone-400 block truncate">
                      Joined {new Date(m.joined_at).toLocaleDateString()}
                    </span>
                  </div>
                </div>
                <Badge
                  variant="outline"
                  className={`text-[9.5px] py-0.5 px-2 font-medium rounded-full ${
                    m.role === "admin"
                      ? "border-amber-400 text-amber-600 bg-amber-50 dark:bg-amber-950/40"
                      : "border-[#E8D8C4] text-[#8C7A6B]"
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
