import { Plus, MapPin, Video, Trash2, CalendarDays, Clock } from "lucide-react";
import { EventCountdown } from "@/components/community/PostCard";
import { communityApi, type CommunityPost, type PostComment } from "@/lib/community/communityApi";

export interface EventsTabProps {
  isHi: boolean;
  groupPosts: CommunityPost[];
  user: any;
  commentsMap: Record<string, PostComment[]>;
  expandedCommentsPostId: string | null;
  newCommentText: string;
  setNewCommentText: (text: string) => void;
  commentIsLyricsSubmit: boolean;
  setCommentIsLyricsSubmit: (val: boolean) => void;
  loadingCommentsPostIds: Record<string, boolean>;
  isSaved: (postId: string) => boolean;
  handleToggleComments: (postId: string) => void;
  handleToggleReaction: (postId: string) => void;
  handleToggleRsvp: (postId: string, currentRsvp: 'interested' | 'going' | null, clickedRsvp: 'interested' | 'going') => void;
  handleVoteOption: (postId: string, optionIndex: number) => void;
  handleDeleteComment: (postId: string, commentId: string) => void;
  handleAddComment: (postId: string) => void;
  handleToggleSavePost: (postId: string) => void;
  loadPosts: () => void;
  setPostType: (type: 'bhajan_share' | 'bhajan_request' | 'question' | 'thought' | 'event' | 'shloka') => void;
  setCreatePostOpen: (open: boolean) => void;
}

// Month abbreviation helper
function getMonth(date: Date, isHi: boolean) {
  const en = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
  const hi = ["जन","फर","मार","अप्र","मई","जून","जुल","अग","सित","अक्","नव","दिस"];
  return isHi ? hi[date.getMonth()] : en[date.getMonth()];
}

// hh:mm am/pm IST
function formatTime(date: Date) {
  let h = date.getHours();
  const m = date.getMinutes();
  const ampm = h >= 12 ? "pm" : "am";
  h = h % 12 || 12;
  return `${h}:${m < 10 ? "0" + m : m} ${ampm} IST`;
}

export function EventsTab({
  isHi,
  groupPosts,
  user,
  handleToggleRsvp,
  loadPosts,
  setPostType,
  setCreatePostOpen,
}: EventsTabProps) {
  const eventPosts = groupPosts.filter((p) => p.type === "event");

  return (
    <div className="space-y-4">

      {/* Section header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-display font-bold text-base text-[#651317] dark:text-amber-100">
            {isHi ? "सत्संग आयोजन" : "Satsang Events"}
          </h2>
          <p className="text-[11px] text-[#8C7A6B] dark:text-stone-400 font-medium mt-0.5">
            {isHi ? "आगामी आयोजन" : "Upcoming events"}
          </p>
        </div>
        <button
          onClick={() => { setPostType("event"); setCreatePostOpen(true); }}
          className="inline-flex items-center justify-center gap-1.5 h-9 sm:h-9.5 px-4 rounded-full bg-[#651317] hover:bg-[#4f0f12] text-white text-xs sm:text-sm font-bold active:scale-95 transition-all shadow-xs cursor-pointer whitespace-nowrap leading-none"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>{isHi ? "नया आयोजन" : "New Event"}</span>
        </button>
      </div>

      {/* Empty state */}
      {eventPosts.length === 0 ? (
        <div className="text-center py-12 bg-[#FFFDF8] dark:bg-[#1A120B] border border-[#E8D8C4] dark:border-stone-800 rounded-2xl px-6">
          <span className="text-3xl block select-none mb-2">📅</span>
          <p className="text-[#8C7A6B] dark:text-stone-400 font-normal text-xs leading-relaxed">
            {isHi
              ? "अभी कोई सत्संग कार्यक्रम नहीं है। नया आयोजन दर्ज करें!"
              : "No upcoming events scheduled yet. Add a kirtan or satsang!"}
          </p>
        </div>
      ) : (
        <div className="space-y-3.5">
          {eventPosts.map((post) => {
            const dateObj = post.event_datetime ? new Date(post.event_datetime) : null;
            const locationStr = post.event_location || "";
            const isOnline =
              ["online","zoom","youtube","virtual","google meet","वर्चुअल","गूगल मीट"].some((kw) =>
                locationStr.toLowerCase().includes(kw)
              );
            const attendeeCount =
              (post.rsvps_count?.going || 0) + (post.rsvps_count?.interested || 0);
            const isAuthor =
              user && (post.author_id === user.id || post.author?.user_id === user.id);

            return (
              <div
                key={post.id}
                className="bg-[#FFFDF8] dark:bg-[#1A120B] border border-[#E8D8C4] dark:border-stone-800 rounded-2xl overflow-hidden shadow-xs"
              >
                {/* Optional event banner image */}
                {post.image_url && (
                  <div className="w-full h-36 sm:h-44 overflow-hidden bg-stone-100 dark:bg-stone-900">
                    <img
                      src={post.image_url}
                      alt={post.title}
                      className="w-full h-full object-cover"
                    />
                  </div>
                )}

                <div className="p-4 space-y-3">

                  {/* Top row — date chip + badge + delete */}
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2 flex-wrap">
                      {/* Date chip */}
                      {dateObj && (
                        <span className="inline-flex items-center gap-1.5 bg-[#FAF0E4] dark:bg-[#2B1F14] text-[#651317] dark:text-amber-300 border border-[#E8D8C4] dark:border-stone-700 rounded-full px-2.5 py-1 text-[11px] font-semibold">
                          <CalendarDays className="w-3 h-3 shrink-0" />
                          {dateObj.getDate()} {getMonth(dateObj, isHi)}
                        </span>
                      )}
                      {/* Time chip */}
                      {dateObj && (
                        <span className="inline-flex items-center gap-1 text-[10px] font-medium text-[#8C7A6B] dark:text-stone-400">
                          <Clock className="w-3 h-3 shrink-0" />
                          {formatTime(dateObj)}
                        </span>
                      )}
                      {/* Online / Kirtan badge */}
                      <span className={`inline-flex items-center gap-1 text-[9px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wide ${
                        isOnline
                          ? "bg-emerald-50 text-emerald-700 border border-emerald-200 dark:bg-emerald-950/30 dark:text-emerald-400 dark:border-emerald-900/50"
                          : "bg-[#FAF0E4] text-[#651317] border border-[#E8D8C4] dark:bg-[#2B1F14] dark:text-amber-300 dark:border-stone-700"
                      }`}>
                        {isOnline ? "📹 Online" : "🎉 " + (isHi ? "कीर्तन" : "Kirtan")}
                      </span>
                      {/* Countdown */}
                      {post.event_datetime && (
                        <EventCountdown datetime={post.event_datetime} />
                      )}
                    </div>

                    {/* Delete — author only */}
                    {isAuthor && (
                      <button
                        onClick={async () => {
                          if (confirm(isHi ? "क्या आप इस आयोजन को हटाना चाहते हैं?" : "Delete this event?")) {
                            await communityApi.softRemovePost(post.id);
                            loadPosts();
                          }
                        }}
                        className="text-stone-400 hover:text-rose-500 transition-colors p-1 shrink-0"
                        title={isHi ? "आयोजन हटाएं" : "Delete Event"}
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>

                  {/* Title */}
                  <h3 className="font-display font-bold text-sm text-[#32251E] dark:text-amber-50 leading-snug">
                    {post.title}
                  </h3>

                  {/* Description */}
                  {post.content && (
                    <p className="text-xs text-[#8C7A6B] dark:text-stone-400 leading-relaxed font-normal">
                      {post.content}
                    </p>
                  )}

                  {/* Location */}
                  {locationStr && (
                    <div className="flex items-center gap-1.5 text-xs text-[#651317] dark:text-amber-400 font-medium">
                      {isOnline
                        ? <Video className="w-3.5 h-3.5 shrink-0" />
                        : <MapPin className="w-3.5 h-3.5 shrink-0" />}
                      <span className="truncate">{locationStr}</span>
                    </div>
                  )}

                  {/* Author */}
                  <p className="text-[10px] text-[#8C7A6B] dark:text-stone-400 font-normal">
                    {isHi
                      ? `${post.author?.display_name || "भक्त"} द्वारा`
                      : `by ${post.author?.display_name || "Devotee"}`}
                  </p>

                  {/* Footer — attendees + RSVP buttons */}
                  <div className="pt-3 border-t border-[#E8D8C4]/50 dark:border-stone-800 flex items-center justify-between gap-3">
                    <span className="text-[11px] text-[#8C7A6B] dark:text-stone-400 font-medium shrink-0">
                      {attendeeCount} {isHi ? "भक्त" : "attending"}
                    </span>

                    <div className="flex gap-2">
                      {[
                        { status: "going",      label: isHi ? "आ रहा हूँ" : "Going",      emoji: "✅" },
                        { status: "interested", label: isHi ? "रुचि है"   : "Interested", emoji: "🙏" },
                      ].map((opt) => {
                        const isActive = post.rsvp_status === opt.status;
                        return (
                          <button
                            key={opt.status}
                            onClick={() =>
                              handleToggleRsvp(post.id, post.rsvp_status || null, opt.status as any)
                            }
                            className={`inline-flex items-center justify-center gap-1.5 h-8 px-3 rounded-full border text-[11px] font-semibold active:scale-95 transition-all shadow-xs whitespace-nowrap ${
                              isActive
                                ? "bg-[#651317] border-[#651317] text-white"
                                : "bg-white dark:bg-stone-900 border-[#E8D8C4] dark:border-stone-700 text-[#651317] dark:text-amber-300 hover:border-[#651317]/50"
                            }`}
                          >
                            <span className="text-xs">{opt.emoji}</span>
                            <span>{opt.label}</span>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
