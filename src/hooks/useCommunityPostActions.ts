import { useState } from "react";
import { toast } from "sonner";
import { communityApi, type CommunityPost, type PostComment } from "@/lib/community/communityApi";

interface UseCommunityPostActionsInput {
  user: any;
  profile: any;
  isHi: boolean;
  loadPosts: (silent?: boolean) => void;
  setPosts: React.Dispatch<React.SetStateAction<CommunityPost[]>>;
}

export interface CommunityPostActionsReturn {
  // State
  expandedCommentsPostId: string | null;
  commentsMap: Record<string, PostComment[]>;
  newCommentText: string;
  setNewCommentText: (text: string) => void;
  commentIsLyricsSubmit: boolean;
  setCommentIsLyricsSubmit: (val: boolean) => void;
  loadingCommentsPostIds: Record<string, boolean>;
  // Handlers
  handleToggleComments: (postId: string) => Promise<void>;
  handleAddComment: (postId: string) => Promise<void>;
  handleDeleteComment: (postId: string, commentId: string) => Promise<void>;
  handleToggleReaction: (postId: string) => Promise<void>;
  handleToggleRsvp: (
    postId: string,
    currentRsvp: "interested" | "going" | null,
    clickedRsvp: "interested" | "going"
  ) => Promise<void>;
  handleVoteOption: (postId: string, optionIndex: number) => Promise<void>;
  setCommentsMap: React.Dispatch<React.SetStateAction<Record<string, PostComment[]>>>;
  setExpandedCommentsPostId: React.Dispatch<React.SetStateAction<string | null>>;
  setLoadingCommentsPostIds: React.Dispatch<React.SetStateAction<Record<string, boolean>>>;
}

/**
 * useCommunityPostActions
 *
 * Encapsulates all post-level interaction handlers (comments, reactions,
 * RSVPs, poll votes) and their supporting state.
 *
 * Extracted from JoinCommunityPage as part of Phase 3 refactoring.
 * Referenced by Engineering Execution Blueprint.
 */
export function useCommunityPostActions({
  user,
  profile,
  isHi,
  loadPosts,
  setPosts,
}: UseCommunityPostActionsInput): CommunityPostActionsReturn {
  // ── Comment State ─────────────────────────────────────────────────────────
  const [expandedCommentsPostId, setExpandedCommentsPostId] = useState<string | null>(null);
  const [commentsMap, setCommentsMap] = useState<Record<string, PostComment[]>>({});
  const [newCommentText, setNewCommentText] = useState("");
  const [commentIsLyricsSubmit, setCommentIsLyricsSubmit] = useState(false);
  const [loadingCommentsPostIds, setLoadingCommentsPostIds] = useState<Record<string, boolean>>({});

  // ── Toggle Comments ───────────────────────────────────────────────────────
  const handleToggleComments = async (postId: string) => {
    if (expandedCommentsPostId === postId) {
      setExpandedCommentsPostId(null);
    } else {
      setExpandedCommentsPostId(postId);
      // Only set loading if we don't have comments in cache already
      const hasCached = !!commentsMap[postId];
      if (!hasCached) {
        setLoadingCommentsPostIds(prev => ({ ...prev, [postId]: true }));
      }
      try {
        const comments = await communityApi.fetchComments(postId);
        setCommentsMap(prev => ({ ...prev, [postId]: comments }));
      } catch (err) {
        console.error("Error fetching comments:", err);
      } finally {
        setLoadingCommentsPostIds(prev => ({ ...prev, [postId]: false }));
      }
    }
  };

  // ── Add Comment ───────────────────────────────────────────────────────────
  const handleAddComment = async (postId: string) => {
    if (!user) {
      toast.error(isHi ? "टिप्पणी करने के लिए कृपया लॉग इन करें" : "Please log in to add a comment");
      return;
    }
    if (!newCommentText.trim()) return;

    try {
      const added = await communityApi.createComment(
        postId,
        newCommentText.trim(),
        user.id,
        commentIsLyricsSubmit
      );
      // Attach commenter profile info so it shows immediately in the UI
      // without waiting for a server refresh round-trip
      const addedWithProfile = {
        ...added,
        author: profile
          ? {
              display_name: profile.name || "Devotee",
              avatar_url: profile.avatar_url || "",
            }
          : undefined,
      };
      setCommentsMap(prev => ({
        ...prev,
        [postId]: [...(prev[postId] || []), addedWithProfile],
      }));
      setNewCommentText("");
      setCommentIsLyricsSubmit(false);
      toast.success(isHi ? "टिप्पणी जोड़ी गई!" : "Comment posted!");
      // Reload posts to reflect updated comment count & request status in background
      loadPosts(true);
    } catch (err: any) {
      console.error("Comment submission error:", err);
      const errMsg = err?.message || err?.details || JSON.stringify(err);
      toast.error(
        isHi
          ? `टिप्पणी जोड़ने में असमर्थ: ${errMsg}`
          : `Failed to post comment: ${errMsg}`
      );
    }
  };

  // ── Delete Comment ────────────────────────────────────────────────────────
  const handleDeleteComment = async (postId: string, commentId: string) => {
    try {
      await communityApi.deleteComment(commentId);
      setCommentsMap(prev => ({
        ...prev,
        [postId]: (prev[postId] || []).filter(c => c.id !== commentId),
      }));
      toast.success(isHi ? "टिप्पणी हटा दी गई!" : "Comment deleted!");
      loadPosts(true);
    } catch {
      toast.error(isHi ? "टिप्पणी हटाने में विफल" : "Failed to delete comment");
    }
  };

  // ── Toggle Reaction 🙏 ────────────────────────────────────────────────────
  const handleToggleReaction = async (postId: string) => {
    if (!user) {
      toast.error(isHi ? "प्रतिक्रिया देने के लिए कृपया लॉग इन करें" : "Please log in to react");
      return;
    }
    // Optimistic update — immediately reflect the change in the UI
    setPosts(prev =>
      prev.map(p => {
        if (p.id !== postId) return p;
        return {
          ...p,
          has_reacted: !p.has_reacted,
          reaction_count: p.reaction_count + (p.has_reacted ? -1 : 1),
        };
      })
    );
    try {
      await communityApi.togglePostReaction(postId, user.id);
    } catch {
      // Revert optimistic update on failure in background
      loadPosts(true);
    }
  };

  // ── RSVP Handler ──────────────────────────────────────────────────────────
  const handleToggleRsvp = async (
    postId: string,
    currentRsvp: "interested" | "going" | null,
    clickedRsvp: "interested" | "going"
  ) => {
    if (!user) {
      toast.error(isHi ? "RSVP करने के लिए कृपया लॉग इन करें" : "Please log in to RSVP");
      return;
    }
    try {
      if (currentRsvp === clickedRsvp) {
        await communityApi.deleteEventRsvp(postId, user.id);
        toast.success(isHi ? "RSVP हटा दिया गया" : "RSVP removed");
      } else {
        await communityApi.rsvpToEvent(postId, user.id, clickedRsvp);
        toast.success(isHi ? "RSVP अपडेट किया गया" : "RSVP updated");
      }
      loadPosts(true);
    } catch {
      toast.error(isHi ? "RSVP अपडेट करने में असमर्थ" : "Failed to update RSVP");
    }
  };

  // ── Poll Vote Handler ─────────────────────────────────────────────────────
  const handleVoteOption = async (postId: string, optionIndex: number) => {
    if (!user) {
      toast.error(isHi ? "मतदान करने के लिए कृपया लॉग इन करें" : "Please log in to vote");
      return;
    }
    try {
      await communityApi.voteOnQuestionOption(postId, user.id, optionIndex);
      toast.success(isHi ? "आपका मत दर्ज किया गया" : "Vote recorded");
      loadPosts(true);
    } catch {
      toast.error(isHi ? "मतदान दर्ज करने में असमर्थ" : "Failed to register vote");
    }
  };

  return {
    // State
    expandedCommentsPostId,
    commentsMap,
    newCommentText,
    setNewCommentText,
    commentIsLyricsSubmit,
    setCommentIsLyricsSubmit,
    loadingCommentsPostIds,
    // Handlers
    handleToggleComments,
    handleAddComment,
    handleDeleteComment,
    handleToggleReaction,
    handleToggleRsvp,
    handleVoteOption,
    // Raw setters (needed by realtime subscription and postId deep-link effect)
    setCommentsMap,
    setExpandedCommentsPostId,
    setLoadingCommentsPostIds,
  };
}
