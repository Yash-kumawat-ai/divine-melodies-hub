import { useMemo, useState } from "react";
import { Plus, MapPin, Video, Trash2, CalendarDays, Clock, Share2, Check, MoreVertical } from "lucide-react";
import { CommunityEventImage } from "@/components/community/CommunityMedia";
import { communityApi, type CommunityPost, type EventRsvpStatus } from "@/lib/community/communityApi";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

export interface EventsTabProps {
  isHi: boolean;
  groupPosts: CommunityPost[];
  user: any;
  memberGroupIds?: string[];
  handleToggleRsvp: (
    postId: string,
    currentRsvp: EventRsvpStatus | null,
    clickedRsvp: EventRsvpStatus
  ) => void;
  loadPosts: () => void;
  setPostType: (type: "bhajan_share" | "bhajan_request" | "question" | "thought" | "event" | "shloka") => void;
  setCreatePostOpen: (open: boolean) => void;
}

type EventFilter = "all" | "today" | "week" | "mine";

const MONTH_HI = ["जन", "फर", "मार", "अप्र", "मई", "जून", "जुल", "अगस्त", "सित", "अक्टू", "नव", "दिस"];
const MONTH_EN = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
const DAY_HI = ["रविवार", "सोमवार", "मंगलवार", "बुधवार", "गुरुवार", "शुक्रवार", "शनिवार"];
const DAY_EN = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

function startOfDay(d: Date) {
  const x = new Date(d);
  x.setHours(0, 0, 0, 0);
  return x;
}

function formatClock(date: Date) {
  let h = date.getHours();
  const m = date.getMinutes();
  const ampm = h >= 12 ? "PM" : "AM";
  h = h % 12 || 12;
  return `${h}:${m < 10 ? "0" + m : m} ${ampm}`;
}

function relativeDayLabel(date: Date, isHi: boolean) {
  const today = startOfDay(new Date());
  const target = startOfDay(date);
  const diff = Math.round((target.getTime() - today.getTime()) / 86400000);
  if (diff === 0) return isHi ? "आज" : "Today";
  if (diff === 1) return isHi ? "कल" : "Tomorrow";
  return null;
}

function shareEvent(post: CommunityPost, isHi: boolean) {
  const link = `${window.location.origin}/community/posts/${post.id}`;
  const title = post.title || (isHi ? "सत्संग आयोजन" : "Satsang event");
  const text = `${title}\n${link}`;
  if (navigator.share) {
    void navigator.share({ title, text, url: link }).catch(() => {});
    return;
  }
  window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, "_blank", "noopener,noreferrer");
  toast.success(isHi ? "निमंत्रण लिंक तैयार है" : "Invite link ready");
}

export function EventsTab({
  isHi,
  groupPosts,
  user,
  memberGroupIds = [],
  handleToggleRsvp,
  loadPosts,
  setPostType,
  setCreatePostOpen,
}: EventsTabProps) {
  const [filter, setFilter] = useState<EventFilter>("all");
  const [menuOpenId, setMenuOpenId] = useState<string | null>(null);

  const eventPosts = useMemo(() => {
    const now = new Date();
    const today0 = startOfDay(now);
    const weekEnd = new Date(today0);
    weekEnd.setDate(weekEnd.getDate() + 7);
    const memberSet = new Set(memberGroupIds);

    return groupPosts
      .filter((p) => p.type === "event")
      .filter((p) => {
        const dt = p.event_datetime ? new Date(p.event_datetime) : null;
        if (filter === "today") {
          return dt ? startOfDay(dt).getTime() === today0.getTime() : false;
        }
        if (filter === "week") {
          return dt ? dt >= today0 && dt < weekEnd : false;
        }
        if (filter === "mine") {
          return Boolean(p.group_id && memberSet.has(p.group_id));
        }
        return true;
      });
  }, [groupPosts, filter, memberGroupIds]);

  const filters: { id: EventFilter; hi: string; en: string }[] = [
    { id: "all", hi: "सभी", en: "All" },
    { id: "today", hi: "आज", en: "Today" },
    { id: "week", hi: "इस सप्ताह", en: "This week" },
    { id: "mine", hi: "मेरे समूह", en: "My groups" },
  ];

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h2 className="font-display font-bold text-base text-[#651317] dark:text-amber-100">
            {isHi ? "सत्संग आयोजन" : "Satsang Events"}
          </h2>
          <p className="text-[11px] text-[#8C7A6B] dark:text-stone-400 font-medium mt-0.5">
            {isHi ? "आने वाले आयोजन" : "Upcoming events"}
          </p>
        </div>
        <button
          type="button"
          onClick={() => {
            setPostType("event");
            setCreatePostOpen(true);
          }}
          className="inline-flex h-10 min-h-10 shrink-0 items-center justify-center gap-1.5 rounded-xl bg-[#651317] px-4 text-sm font-extrabold text-white shadow-xs transition-all hover:bg-[#4f0f12] active:scale-95"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>{isHi ? "+ नया आयोजन" : "+ New Event"}</span>
        </button>
      </div>

      <div className="flex gap-2 overflow-x-auto pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        {filters.map((f) => {
          const active = filter === f.id;
          return (
            <button
              key={f.id}
              type="button"
              onClick={() => setFilter(f.id)}
              className={cn(
                "h-9 shrink-0 rounded-full px-3.5 text-xs font-bold border transition-all",
                active
                  ? "bg-[#651317] border-[#651317] text-white"
                  : "bg-white dark:bg-stone-900 border-[#E8D8C4] dark:border-stone-700 text-[#651317] dark:text-amber-200"
              )}
            >
              {isHi ? f.hi : f.en}
            </button>
          );
        })}
      </div>

      {eventPosts.length === 0 ? (
        <div className="text-center py-12 bg-[#FFFDF8] dark:bg-[#1A120B] border border-[#E8D8C4] dark:border-stone-800 rounded-2xl px-6">
          <p className="text-[#8C7A6B] dark:text-stone-400 font-normal text-xs leading-relaxed">
            {isHi
              ? "इस फ़िल्टर में कोई सत्संग कार्यक्रम नहीं है।"
              : "No satsang events in this filter yet."}
          </p>
          <button
            type="button"
            onClick={() => {
              setPostType("event");
              setCreatePostOpen(true);
            }}
            className="mt-4 inline-flex h-10 min-h-10 items-center justify-center gap-1.5 rounded-xl bg-[#651317] px-4 text-sm font-extrabold text-white"
          >
            <Plus className="w-3.5 h-3.5" />
            {isHi ? "पहला कार्यक्रम जोड़ें" : "Schedule Event"}
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {eventPosts.map((post) => {
            const dateObj = post.event_datetime ? new Date(post.event_datetime) : null;
            const locationStr = post.event_location || "";
            const isOnline = ["online", "zoom", "youtube", "virtual", "google meet", "वर्चुअल", "गूगल मीट"].some((kw) =>
              locationStr.toLowerCase().includes(kw)
            );
            const going = post.rsvps_count?.going || 0;
            const interested = post.rsvps_count?.interested || 0;
            const maybe = post.rsvps_count?.maybe || 0;
            const isAuthor = Boolean(user && post.author_id === user.id);
            const rel = dateObj ? relativeDayLabel(dateObj, isHi) : null;
            const previews = post.rsvp_preview || [];

            return (
              <article
                key={post.id}
                className="bg-[#FFFDF8] dark:bg-[#1A120B] border border-[#E8D8C4] dark:border-stone-800 rounded-2xl overflow-hidden shadow-xs"
              >
                {post.image_url && (
                  <CommunityEventImage src={post.image_url} alt={post.title || (isHi ? "कार्यक्रम" : "Event")}>
                    {dateObj && (
                      <div className="absolute left-3 top-3 w-14 overflow-hidden rounded-xl bg-white text-center shadow-md">
                        <div className="py-1.5 leading-none">
                          <p className="text-lg font-black text-[#651317]">{dateObj.getDate()}</p>
                          <p className="text-[10px] font-bold text-[#8C7A6B]">
                            {isHi ? MONTH_HI[dateObj.getMonth()] : MONTH_EN[dateObj.getMonth()]}
                          </p>
                        </div>
                        <div className="bg-[#651317] px-1 py-0.5 text-[8px] font-bold text-white leading-tight">
                          {isHi ? DAY_HI[dateObj.getDay()] : DAY_EN[dateObj.getDay()]}
                        </div>
                      </div>
                    )}
                    {dateObj && (
                      <div className="absolute right-3 top-3 inline-flex items-center gap-1 rounded-full bg-white/95 px-2 py-1 text-[10px] font-bold text-[#651317] shadow-sm">
                        <CalendarDays className="w-3 h-3" />
                        {rel ? `${rel} • ${formatClock(dateObj)}` : formatClock(dateObj)}
                      </div>
                    )}
                  </CommunityEventImage>
                )}

                <div className="p-4 space-y-3">
                  {!post.image_url && dateObj && (
                    <div className="flex items-center gap-2 text-[11px] font-semibold text-[#651317]">
                      <CalendarDays className="w-3.5 h-3.5" />
                      {dateObj.getDate()} {isHi ? MONTH_HI[dateObj.getMonth()] : MONTH_EN[dateObj.getMonth()]}
                      <Clock className="w-3.5 h-3.5 ml-1" />
                      {formatClock(dateObj)}
                    </div>
                  )}

                  <h3 className="font-display font-bold text-lg text-[#651317] dark:text-amber-50 leading-snug">
                    {post.title}
                  </h3>

                  <p className="text-[11px] text-[#8C7A6B] dark:text-stone-400 font-medium flex flex-wrap items-center gap-x-2 gap-y-1">
                    {dateObj && (
                      <span>
                        {dateObj.getDate()} {isHi ? MONTH_HI[dateObj.getMonth()] : MONTH_EN[dateObj.getMonth()]}{" "}
                        {dateObj.getFullYear()} • {formatClock(dateObj)}
                      </span>
                    )}
                    {locationStr && (
                      <span className="inline-flex items-center gap-1 min-w-0">
                        {isOnline ? <Video className="w-3 h-3 shrink-0" /> : <MapPin className="w-3 h-3 shrink-0" />}
                        <span className="truncate max-w-[12rem]">{locationStr}</span>
                      </span>
                    )}
                  </p>

                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-full bg-[#FAF0E4] overflow-hidden shrink-0">
                      {post.author?.avatar_url ? (
                        <img src={post.author.avatar_url} alt="" className="w-full h-full object-cover" />
                      ) : (
                        <span className="w-full h-full flex items-center justify-center text-[10px] font-bold text-[#651317]">
                          {(post.author?.display_name || "D")[0]}
                        </span>
                      )}
                    </div>
                    <p className="text-[11px] text-[#8C7A6B]">
                      {isHi
                        ? `${post.author?.display_name || "भक्त"} द्वारा आयोजित`
                        : `Organized by ${post.author?.display_name || "Devotee"}`}
                    </p>
                  </div>

                  {post.content && (
                    <p className="text-xs text-[#8C7A6B] dark:text-stone-400 leading-relaxed line-clamp-2">
                      {post.content}
                    </p>
                  )}

                  <div className="flex items-center gap-2 pt-1">
                    {previews.length > 0 && (
                      <div className="flex -space-x-1.5">
                        {previews.slice(0, 4).map((p) => (
                          <div
                            key={p.user_id}
                            title={p.display_name}
                            className="w-6 h-6 rounded-full border-2 border-white dark:border-[#1A120B] bg-[#FAF0E4] overflow-hidden"
                          >
                            {p.avatar_url ? (
                              <img src={p.avatar_url} alt="" className="w-full h-full object-cover" />
                            ) : (
                              <span className="w-full h-full flex items-center justify-center text-[8px] font-bold text-[#651317]">
                                {p.display_name[0]}
                              </span>
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                    <p className="text-[11px] font-semibold text-emerald-700 dark:text-emerald-400">
                      {isHi
                        ? `${going} भक्त आ रहे हैं`
                        : `${going} devotee${going === 1 ? " is" : "s are"} coming`}
                      {(interested > 0 || maybe > 0) && (
                        <span className="text-[#8C7A6B] font-medium">
                          {" "}
                          · {interested} {isHi ? "रुचि" : "interested"}
                          {maybe > 0 ? ` · ${maybe} ${isHi ? "शायद" : "maybe"}` : ""}
                        </span>
                      )}
                    </p>
                  </div>

                  <div className="flex flex-col gap-2 pt-1">
                    <div className="flex gap-2">
                      {(
                        [
                          { status: "going" as const, hi: "मैं आ रहा हूँ", en: "I am coming" },
                          { status: "interested" as const, hi: "मुझे रुचि है", en: "I am interested" },
                        ] as const
                      ).map((opt) => {
                        const active = post.rsvp_status === opt.status;
                        return (
                          <button
                            key={opt.status}
                            type="button"
                            onClick={() => handleToggleRsvp(post.id, post.rsvp_status || null, opt.status)}
                            className={cn(
                              "h-10 flex-1 rounded-full px-2 text-[11px] font-bold border inline-flex items-center justify-center gap-1 active:scale-95 transition-all",
                              active
                                ? "bg-[#651317] border-[#651317] text-white"
                                : "bg-white dark:bg-stone-900 border-[#E8D8C4] dark:border-stone-700 text-[#651317] dark:text-amber-200"
                            )}
                          >
                            {opt.status === "going" && <Check className="w-3.5 h-3.5 shrink-0" />}
                            {isHi ? opt.hi : opt.en}
                          </button>
                        );
                      })}
                    </div>
                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={() => handleToggleRsvp(post.id, post.rsvp_status || null, "maybe")}
                        className={cn(
                          "h-10 flex-1 rounded-full px-2.5 text-[11px] font-bold border active:scale-95",
                          post.rsvp_status === "maybe"
                            ? "bg-[#651317] border-[#651317] text-white"
                            : "bg-white dark:bg-stone-900 border-[#E8D8C4] text-[#651317] dark:text-amber-200"
                        )}
                      >
                        {isHi ? "शायद" : "Maybe"}
                      </button>
                      <button
                        type="button"
                        onClick={() => shareEvent(post, isHi)}
                        className="h-10 flex-1 rounded-full border border-[#E8D8C4] dark:border-stone-700 inline-flex items-center justify-center gap-1.5 text-[11px] font-bold text-[#651317]"
                      >
                        <Share2 className="w-3.5 h-3.5" />
                        {isHi ? "निमंत्रण भेजें" : "Send invite"}
                      </button>
                      {isAuthor && (
                        <div className="relative">
                          <button
                            type="button"
                            onClick={() => setMenuOpenId(menuOpenId === post.id ? null : post.id)}
                            className="h-10 w-10 rounded-full border border-[#E8D8C4] dark:border-stone-700 flex items-center justify-center text-[#651317]"
                            aria-label={isHi ? "और" : "More"}
                          >
                            <MoreVertical className="w-4 h-4" />
                          </button>
                          {menuOpenId === post.id && (
                            <button
                              type="button"
                              onClick={async () => {
                                setMenuOpenId(null);
                                if (confirm(isHi ? "क्या आप इस आयोजन को हटाना चाहते हैं?" : "Delete this event?")) {
                                  await communityApi.softRemovePost(post.id);
                                  loadPosts();
                                }
                              }}
                              className="absolute right-0 bottom-11 z-10 inline-flex items-center gap-1.5 rounded-xl border border-rose-200 bg-white px-3 py-2 text-xs font-bold text-rose-600 shadow-md dark:bg-stone-900"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                              {isHi ? "हटाएँ" : "Delete"}
                            </button>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      )}
    </div>
  );
}
