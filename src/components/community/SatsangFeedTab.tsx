import { Plus, Megaphone, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PostCard } from "@/components/community/PostCard";
import { communityApi, type CommunityPost, type PostComment } from "@/lib/community/communityApi";
import mandalaBeige from "@/pages/images/mandala-beige.svg";

export interface SatsangFeedTabProps {
  isHi: boolean;
  groupPosts: CommunityPost[];
  groupAnnouncements: CommunityPost[];
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
  handleToggleRsvp: (
    postId: string,
    currentRsvp: "interested" | "going" | null,
    clickedRsvp: "interested" | "going"
  ) => void;
  handleVoteOption: (postId: string, optionIndex: number) => void;
  handleDeleteComment: (postId: string, commentId: string) => void;
  handleAddComment: (postId: string) => void;
  handleToggleSavePost: (postId: string) => void;
  loadPosts: () => void;
  setPostType: (
    type: "bhajan_share" | "bhajan_request" | "question" | "thought" | "event"
  ) => void;
  setCreatePostOpen: (open: boolean) => void;
  setDismissedAnnouncements: React.Dispatch<React.SetStateAction<string[]>>;
}

export function SatsangFeedTab({
  isHi,
  groupPosts,
  groupAnnouncements,
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
  setCreatePostOpen,
  setDismissedAnnouncements,
}: SatsangFeedTabProps) {
  const feedList = groupPosts.filter(
    (p) =>
      p.type !== "event" &&
      p.type !== "bhajan_share" &&
      p.type !== "bhajan_request"
  );

  return (
    <div className="space-y-6">
      {/* Pinned Announcements from Admin */}
      {groupAnnouncements.length > 0 && (
        <div className="space-y-3">
          {groupAnnouncements.map((announce) => (
            <div
              key={announce.id}
              className="bg-gradient-to-r from-amber-500/10 to-orange-500/15 border-2 border-amber-400/40 rounded-3xl p-5 relative shadow-xs flex gap-3.5 items-start overflow-hidden"
            >
              {/* Background beige mandala decoration */}
              <div className="absolute right-0 bottom-0 translate-x-6 translate-y-6 opacity-[0.08] dark:opacity-[0.03] pointer-events-none w-24 h-24">
                <img
                  src={mandalaBeige}
                  className="w-full h-full object-contain"
                  alt=""
                />
              </div>
              <div className="shrink-0 flex items-center justify-center w-10 h-10 rounded-full bg-amber-500/20 text-orange-600 border border-amber-400/20 relative z-10">
                <Megaphone className="w-5 h-5 animate-pulse" />
              </div>
              <div className="flex-1 min-w-0 relative z-10">
                <div className="flex items-center justify-between gap-4">
                  <span className="text-[10px] uppercase font-black tracking-wider text-orange-600 flex items-center gap-1">
                    📢 {isHi ? "समूह घोषणा" : "Group Announcement"}
                  </span>
                  <button
                    onClick={() =>
                      setDismissedAnnouncements((prev) => [
                        ...prev,
                        announce.id,
                      ])
                    }
                    className="text-stone-400 hover:text-stone-650 dark:hover:text-stone-250 transition-colors"
                    aria-label="Dismiss announcement"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
                <h4 className="font-display font-bold text-sm text-stone-900 dark:text-amber-100 mt-1">
                  {announce.title}
                </h4>
                <p className="text-xs text-stone-600 dark:text-stone-300 mt-1 line-clamp-3 leading-relaxed font-medium">
                  {announce.content}
                </p>
                <button
                  onClick={() => handleToggleComments(announce.id)}
                  className="text-orange-600 dark:text-amber-400 hover:underline font-extrabold text-[10px] uppercase tracking-wide mt-2 block text-left"
                >
                  {isHi
                    ? "पूर्ण विवरण पढ़ें और उत्तर दें"
                    : "View Announcement & Reply"}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Feed Composer CTA */}
      <div
        onClick={() => {
          setPostType("thought");
          setCreatePostOpen(true);
        }}
        className="bg-white dark:bg-stone-900 border border-orange-500/10 rounded-2xl p-4 flex items-center justify-between shadow-xs hover:border-orange-500/30 cursor-pointer select-none"
        role="button"
        aria-label={
          isHi
            ? "सत्संग में अपने विचार साझा करें"
            : "Share a thought, mantra quote or question"
        }
      >
        <span className="text-stone-400 text-xs font-medium">
          {isHi
            ? "सत्संग में अपने विचार साझा करें..."
            : "Share a thought, mantra quote or question..."}
        </span>
        <Button
          size="icon"
          className="bg-orange-500 hover:bg-orange-600 text-white rounded-full w-8 h-8 shrink-0"
          aria-label="Create post"
        >
          <Plus className="w-4.5 h-4.5" />
        </Button>
      </div>

      {/* Posts List */}
      {feedList.length === 0 ? (
        <div className="text-center py-16 bg-white dark:bg-stone-900 border border-orange-500/10 rounded-2xl px-6">
          <span className="text-3xl block select-none">🌿</span>
          <p className="text-stone-500 dark:text-stone-400 font-medium text-xs mt-3 leading-relaxed">
            {isHi
              ? "अभी तक कोई सत्संग चर्चा या विचार साझा नहीं हुआ। पहला विचार साझा करें!"
              : "No thoughts or discussions shared yet. Start the satsang by writing a post!"}
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {feedList.map((post) => (
            <PostCard
              key={post.id}
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
                if (
                  confirm(
                    isHi
                      ? "क्या आप इस पोस्ट को हटाना चाहते हैं?"
                      : "Delete this post?"
                  )
                ) {
                  await communityApi.softRemovePost(id);
                  loadPosts();
                }
              }}
            />
          ))}
        </div>
      )}
    </div>
  );
}
