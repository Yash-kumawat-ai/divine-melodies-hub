import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PostCard, EventCountdown } from "@/components/community/PostCard";
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
  setPostType: (type: 'bhajan_share' | 'bhajan_request' | 'question' | 'thought' | 'event') => void;
  setCreatePostOpen: (open: boolean) => void;
}

export function EventsTab({
  isHi,
  groupPosts,
  user,
  commentsMap,
  expandedCommentsPostId,
  newCommentText,
  setNewCommentText,
  commentIsLyricsSubmit,
  setCommentIsLyricsSubmit,
  loadingCommentsPostIds,
  isSaved,
  handleToggleComments,
  handleToggleReaction,
  handleToggleRsvp,
  handleVoteOption,
  handleDeleteComment,
  handleAddComment,
  handleToggleSavePost,
  loadPosts,
  setPostType,
  setCreatePostOpen
}: EventsTabProps) {
  const eventPosts = groupPosts.filter(p => p.type === 'event');

  return (
    <div className="space-y-6">
      {/* Event Composer CTA */}
      <div 
        onClick={() => {
          setPostType('event');
          setCreatePostOpen(true);
        }}
        className="bg-white dark:bg-stone-900 border border-orange-500/10 rounded-2xl p-4 flex items-center justify-between shadow-xs hover:border-orange-500/30 cursor-pointer select-none"
      >
        <span className="text-stone-400 text-xs font-medium">
          {isHi ? "सत्संग, कीर्तन या धार्मिक सभा निर्धारित करें..." : "Schedule an upcoming satsang, kirtan, or holiday event..."}
        </span>
        <Button size="icon" className="bg-orange-500 hover:bg-orange-600 text-white rounded-full w-8 h-8 shrink-0" aria-label="Schedule Event">
          <Plus className="w-4.5 h-4.5" />
        </Button>
      </div>

      {eventPosts.length === 0 ? (
        <div className="text-center py-16 bg-white dark:bg-stone-900 border border-orange-500/10 rounded-2xl px-6">
          <span className="text-3xl block select-none">📅</span>
          <p className="text-stone-500 dark:text-stone-400 font-medium text-xs mt-3 leading-relaxed">
            {isHi 
              ? "अभी कोई सत्संग कार्यक्रम निर्धारित नहीं है। आगामी कार्यक्रम दर्ज करें!" 
              : "No upcoming temple events scheduled yet. Add a kirtan session or holiday gathering!"}
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {eventPosts.map(post => (
            <div key={post.id} className="relative">
              <PostCard 
                post={post}
                user={user}
                isHi={isHi}
                comments={commentsMap[post.id] || []}
                isCommentsExpanded={expandedCommentsPostId === post.id}
                onToggleComments={handleToggleComments}
                onToggleReaction={handleToggleReaction}
                onToggleRsvp={handleToggleRsvp}
                onVoteOption={handleVoteOption}
                onDeleteComment={handleDeleteComment}
                onAddComment={handleAddComment}
                newCommentText={newCommentText}
                setNewCommentText={setNewCommentText}
                commentIsLyricsSubmit={commentIsLyricsSubmit}
                setCommentIsLyricsSubmit={setCommentIsLyricsSubmit}
                isLoadingComments={loadingCommentsPostIds[post.id]}
                isPostSaved={isSaved(post.id)}
                onToggleSavePost={handleToggleSavePost}
                onDeletePost={async (id) => {
                  if (confirm(isHi ? "क्या आप इस पोस्ट को हटाना चाहते हैं?" : "Delete this post?")) {
                      await communityApi.softRemovePost(id);
                      loadPosts();
                  }
                }}
              />
              {/* Countdown overlay corner badge */}
              {post.event_datetime && (
                <div className="absolute top-4 right-14 z-10 hidden sm:block">
                  <EventCountdown datetime={post.event_datetime} />
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
