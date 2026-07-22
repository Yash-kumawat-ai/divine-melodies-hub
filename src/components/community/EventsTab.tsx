import { Plus, MapPin, Video, Trash2, Calendar, Check, Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { EventCountdown } from "@/components/community/PostCard";
import { communityApi, type CommunityPost, type PostComment } from "@/lib/community/communityApi";
import { useState, useEffect } from "react";

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
  setPostType: (type: 'bhajan_share' | 'bhajan_request' | 'question' | 'thought' | 'event') => void;
  setCreatePostOpen: (open: boolean) => void;
}

export function EventsTab({
  isHi,
  groupPosts,
  user,
  handleToggleRsvp,
  loadPosts,
  setPostType,
  setCreatePostOpen
}: EventsTabProps) {
  const eventPosts = groupPosts.filter(p => p.type === 'event');

  // Format month names
  const getMonthStr = (date: Date) => {
    if (isHi) {
      const monthsHi = ["जन°", "फर°", "मार्च", "अप्रै°", "मई", "जून", "जुल°", "अग°", "सित°", "अक्°", "नव°", "दिस°"];
      return monthsHi[date.getMonth()];
    } else {
      const monthsEn = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
      return monthsEn[date.getMonth()];
    }
  };

  // Format time in hh:mm a
  const getFormattedTime = (date: Date) => {
    let hours = date.getHours();
    const minutes = date.getMinutes();
    const ampm = hours >= 12 ? 'pm' : 'am';
    hours = hours % 12;
    hours = hours ? hours : 12;
    const minStr = minutes < 10 ? '0' + minutes : minutes;
    return `${hours}:${minStr} ${ampm} IST`;
  };

  return (
    <div className="space-y-6">
      {/* Event Header & Action */}
      <div className="flex items-center justify-between">
        <div className="text-left">
          <h2 className="font-display font-extrabold text-xl text-[#4E342E] dark:text-amber-50">
            {isHi ? "सत्संग आयोजन" : "Satsang Events"}
          </h2>
          <p className="text-[11px] text-stone-500 font-semibold mt-0.5">
            {isHi ? "आगामी आयोजन" : "Upcoming Events"}
          </p>
        </div>
        <Button 
          onClick={() => {
            setPostType('event');
            setCreatePostOpen(true);
          }}
          className="bg-[#C88A3D] hover:bg-[#b07833] text-white rounded-xl text-xs font-bold px-4 py-2 flex items-center gap-1.5 shadow-sm active:scale-95 transition-all select-none"
        >
          <Plus className="w-4 h-4" />
          <span>{isHi ? "नया आयोजन" : "New Event"}</span>
        </Button>
      </div>

      {eventPosts.length === 0 ? (
        <div className="text-center py-16 bg-white dark:bg-stone-900 border border-[#D6A86B]/20 rounded-3xl px-6">
          <span className="text-3xl block select-none">📅</span>
          <p className="text-stone-500 dark:text-stone-400 font-medium text-xs mt-3 leading-relaxed">
            {isHi 
              ? "अभी कोई सत्संग कार्यक्रम निर्धारित नहीं है। आगामी कार्यक्रम दर्ज करें!" 
              : "No upcoming temple events scheduled yet. Add a kirtan session or holiday gathering!"}
          </p>
        </div>
      ) : (
        <div className="space-y-5">
          {eventPosts.map(post => {
            const dateObj = post.event_datetime ? new Date(post.event_datetime) : null;
            const day = dateObj ? dateObj.getDate() : "";
            const month = dateObj ? getMonthStr(dateObj) : "";
            const timeStr = dateObj ? getFormattedTime(dateObj) : "";
            
            // Check if online event
            const locationStr = post.event_location || "";
            const isOnline = locationStr.toLowerCase().includes('online') || 
                             locationStr.toLowerCase().includes('zoom') || 
                             locationStr.toLowerCase().includes('youtube') || 
                             locationStr.toLowerCase().includes('वर्चुअल') ||
                             locationStr.toLowerCase().includes('गूगल मीट');
                             
            const attendeeCount = (post.rsvps_count?.going || 0) + (post.rsvps_count?.interested || 0);

            return (
              <div 
                key={post.id} 
                className="flex flex-col sm:flex-row overflow-hidden border border-[#D6A86B]/20 bg-white dark:bg-stone-900 rounded-3xl shadow-sm hover:shadow-md transition-all text-left"
              >
                {/* Left Date Card */}
                <div className="w-full sm:w-24 bg-[#FFF8EE] dark:bg-stone-950/60 flex sm:flex-col items-center justify-center border-b sm:border-b-0 sm:border-r border-[#D6A86B]/15 p-4 shrink-0 gap-2 sm:gap-0">
                  <span className="text-3xl font-extrabold text-[#4E342E] dark:text-amber-100">
                    {day || "📅"}
                  </span>
                  <span className="text-xs font-bold text-[#C88A3D] uppercase tracking-wider">
                    {month}
                  </span>
                </div>

                {/* Right Content Area */}
                <div className="flex-1 p-5 flex flex-col justify-between space-y-4">
                  <div className="space-y-2.5 relative">
                    {/* Delete action for author */}
                    {user && (post.author_id === user.id || post.author?.user_id === user.id) && (
                      <button
                        onClick={async () => {
                          if (confirm(isHi ? "क्या आप इस आयोजन को हटाना चाहते हैं?" : "Are you sure you want to delete this event?")) {
                            await communityApi.softRemovePost(post.id);
                            loadPosts();
                          }
                        }}
                        className="absolute right-0 top-0 text-stone-400 hover:text-red-500 transition-colors p-1"
                        title={isHi ? "आयोजन हटाएं" : "Delete Event"}
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}

                    {/* Category Badge */}
                    <div>
                      {isOnline ? (
                        <span className="inline-flex items-center gap-1.5 text-[9px] font-extrabold px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 dark:bg-emerald-950/30 dark:text-emerald-400 border border-emerald-100 dark:border-emerald-900/50 uppercase tracking-wide">
                          📹 {isHi ? "ऑनलाइन" : "Online"}
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1.5 text-[9px] font-extrabold px-2.5 py-0.5 rounded-full bg-amber-50 text-amber-800 dark:bg-amber-950/30 dark:text-amber-400 border border-amber-100 dark:border-amber-900/50 uppercase tracking-wide">
                          🎉 {isHi ? "कीर्तन" : "Kirtan"}
                        </span>
                      )}
                    </div>

                    {/* Main Event Title */}
                    <h3 className="font-display font-extrabold text-base text-[#4E342E] dark:text-amber-50 leading-snug pr-6">
                      {post.title}
                    </h3>

                    {/* Optional Event Image */}
                    {post.image_url && (
                      <div className="w-full h-40 rounded-2xl overflow-hidden border border-[#D6A86B]/15 bg-amber-50/20 my-2 shadow-xs">
                        <img 
                          src={post.image_url} 
                          alt={post.title} 
                          className="w-full h-full object-cover hover:scale-[1.01] transition-transform duration-300"
                        />
                      </div>
                    )}

                    {/* Description */}
                    <p className="text-xs text-stone-500 dark:text-stone-400 leading-relaxed font-medium">
                      {post.content}
                    </p>

                    {/* Location Info */}
                    <div className="flex items-center gap-1.5 text-xs text-[#C88A3D] dark:text-amber-400/80 font-bold pt-1">
                      {isOnline ? (
                        <>
                          <Video className="w-3.5 h-3.5 shrink-0" />
                          <span>{locationStr}</span>
                        </>
                      ) : (
                        <>
                          <MapPin className="w-3.5 h-3.5 shrink-0" />
                          <span>{locationStr}</span>
                        </>
                      )}
                    </div>

                    {/* Time & Author */}
                    <div className="text-[10px] text-stone-400 font-semibold flex flex-wrap items-center gap-1">
                      <span>{timeStr}</span>
                      <span>•</span>
                      <span>{isHi ? `${post.author?.display_name || 'भक्त'} द्वारा` : `by ${post.author?.display_name || 'Devotee'}`}</span>
                    </div>
                  </div>

                  {/* Footer Row with Attendees and RSVP Buttons */}
                  <div className="pt-3 border-t border-[#D6A86B]/10 flex flex-col xs:flex-row items-start xs:items-center justify-between gap-3 select-none">
                    <span className="text-[11px] text-stone-500 font-bold dark:text-stone-400 shrink-0">
                      {isHi ? `${attendeeCount} भक्त` : `${attendeeCount} devotees`}
                    </span>

                    <div className="flex gap-2 w-full xs:w-auto">
                      {[
                        { status: 'going', label: isHi ? 'आ रहा हूँ' : 'Going', emoji: '✅' },
                        { status: 'interested', label: isHi ? 'रुचि है' : 'Interested', emoji: '🙏' }
                      ].map(opt => {
                        const isActive = post.rsvp_status === opt.status;
                        
                        return (
                          <button
                            key={opt.status}
                            onClick={() => handleToggleRsvp(post.id, post.rsvp_status || null, opt.status as any)}
                            className={"flex-1 xs:flex-initial flex items-center justify-center gap-1.5 border px-4 py-1.5 rounded-full text-[11px] font-bold active:scale-95 transition-all shadow-xs " + (
                              isActive 
                                ? "bg-[#C88A3D] border-[#C88A3D] text-white" 
                                : "bg-white dark:bg-stone-850 border-[#D6A86B]/25 text-stone-600 dark:text-stone-300 hover:bg-amber-50/50 dark:hover:bg-stone-800"
                            )}
                          >
                            <span>{opt.emoji}</span>
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
