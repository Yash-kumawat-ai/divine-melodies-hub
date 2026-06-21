import { supabase } from "@/lib/supabaseClient";

// Helper to determine if a Supabase error is a missing relation error
function isMissingTableError(error: any): boolean {
  if (!error) return false;
  const msg = error.message || "";
  return msg.includes("relation") && msg.includes("does not exist");
}

// Interfaces
export interface Group {
  id: string;
  name: string;
  description: string;
  deity: string;
  slug?: string;
  created_by: string;
  created_at: string;
  member_count?: number;
  is_member?: boolean;
}

export interface GroupMember {
  group_id: string;
  user_id: string;
  role: 'admin' | 'member';
  joined_at: string;
  profile?: {
    display_name: string;
    avatar_url: string;
  };
}

export interface CommunityPost {
  id: string;
  group_id: string | null;
  author_id: string;
  type: 'bhajan_share' | 'bhajan_request' | 'question' | 'thought' | 'event';
  title: string | null;
  content: string;
  image_url: string | null;
  youtube_url: string | null;
  question_options: string[] | null;
  status: 'approved' | 'removed';
  created_at: string;
  // Event specific
  event_datetime: string | null;
  event_location: string | null;
  linked_bhajan_id: string | number | null;
  // Bhajan Request specific
  request_status: 'open' | 'lyrics_submitted' | 'in_review' | 'added_to_library' | 'closed_unresolved';
  resolved_bhajan_id: string | number | null;
  // Joined/Aggregated client states
  author?: {
    display_name: string;
    avatar_url: string;
  };
  group_name?: string;
  reaction_count: number;
  has_reacted: boolean;
  comment_count: number;
  // RSVP states
  rsvp_status?: 'interested' | 'going' | null;
  rsvps_count?: { interested: number; going: number };
  // Question votes
  vote_percentages?: number[];
  user_voted_option?: number | null;
}

export interface PostComment {
  id: string;
  post_id: string;
  author_id: string;
  content: string;
  is_lyrics_submission: boolean;
  created_at: string;
  author?: {
    display_name: string;
    avatar_url: string;
  };
}

// Fallback Local Storage Data Helper
const LS_KEY_GROUPS = "hk_community_groups";
const LS_KEY_MEMBERS = "hk_community_members";
const LS_KEY_POSTS = "hk_community_posts";
const LS_KEY_REACTIONS = "hk_community_reactions";
const LS_KEY_COMMENTS = "hk_community_comments";
const LS_KEY_RSVPS = "hk_community_rsvps";
const LS_KEY_VOTES = "hk_community_votes";

const getLS = <T>(key: string, defaultValue: T): T => {
  try {
    const val = localStorage.getItem(key);
    return val ? JSON.parse(val) : defaultValue;
  } catch {
    return defaultValue;
  }
};

const setLS = <T>(key: string, data: T) => {
  try {
    localStorage.setItem(key, JSON.stringify(data));
  } catch (e) {
    console.error("Local storage error:", e);
  }
};

// Seed mock profiles if fallback is active
const getMockUserProfile = (userId: string) => {
  return {
    display_name: userId === "admin" ? "Adishree (Admin)" : "Devotee " + userId.slice(0, 4),
    avatar_url: ""
  };
};

// State flag to inform UI if we are in fallback mode
export let isUsingLocalFallback = false;

// ─── POST COMPOSER AND DATABASE CLIENTS ──────────────────────────────────

export const communityApi = {
  // Flag getter
  isFallbackActive() {
    return isUsingLocalFallback;
  },

  // 1. GROUPS SECTION
  async fetchGroups(currentUserId?: string): Promise<Group[]> {
    try {
      const { data, error } = await supabase
        .from("groups")
        .select(`
          *,
          group_members(user_id, role)
        `);

      if (error) {
        if (isMissingTableError(error)) {
          isUsingLocalFallback = true;
          return this.fetchGroupsFallback(currentUserId);
        }
        throw error;
      }

      return (data || []).map((g: any) => {
        const members = g.group_members || [];
        const isMember = currentUserId ? members.some((m: any) => m.user_id === currentUserId) : false;
        return {
          id: g.id,
          name: g.name,
          description: g.description,
          deity: g.deity,
          slug: g.slug || "",
          created_by: g.created_by,
          created_at: g.created_at,
          member_count: members.length,
          is_member: isMember,
        };
      });
    } catch (err) {
      console.warn("Supabase fetchGroups failed, using fallback:", err);
      isUsingLocalFallback = true;
      return this.fetchGroupsFallback(currentUserId);
    }
  },

  fetchGroupsFallback(currentUserId?: string): Group[] {
    const groups = getLS<any[]>(LS_KEY_GROUPS, []);
    const members = getLS<any[]>(LS_KEY_MEMBERS, []);
    return groups.map(g => {
      const groupMembers = members.filter(m => m.group_id === g.id);
      const isMember = currentUserId ? groupMembers.some(m => m.user_id === currentUserId) : false;
      const computedSlug = g.slug || g.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '') || "group";
      return {
        ...g,
        slug: computedSlug,
        member_count: groupMembers.length,
        is_member: isMember
      };
    });
  },

  async createGroup(name: string, description: string, deity: string, userId: string): Promise<Group> {
    try {
      const { data, error } = await supabase
        .from("groups")
        .insert({
          name,
          description,
          deity,
          created_by: userId
        })
        .select()
        .single();

      if (error) {
        if (isMissingTableError(error)) return this.createGroupFallback(name, description, deity, userId);
        throw error;
      }
      return data;
    } catch (err) {
      console.warn("Supabase createGroup failed, using fallback:", err);
      return this.createGroupFallback(name, description, deity, userId);
    }
  },

  createGroupFallback(name: string, description: string, deity: string, userId: string): Group {
    const groups = getLS<any[]>(LS_KEY_GROUPS, []);
    const members = getLS<any[]>(LS_KEY_MEMBERS, []);
    
    const baseSlug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '') || "group";
    let slug = baseSlug;
    let suffix = 1;
    while (groups.some(g => g.slug === slug)) {
      slug = `${baseSlug}-${suffix}`;
      suffix++;
    }

    const newGroup: Group = {
      id: crypto.randomUUID(),
      name,
      description,
      deity,
      slug,
      created_by: userId,
      created_at: new Date().toISOString()
    };
    
    groups.push(newGroup);
    setLS(LS_KEY_GROUPS, groups);
    
    // Auto-join trigger
    members.push({
      group_id: newGroup.id,
      user_id: userId,
      role: 'admin',
      joined_at: new Date().toISOString()
    });
    setLS(LS_KEY_MEMBERS, members);
    
    return { ...newGroup, member_count: 1, is_member: true };
  },

  async joinGroup(groupId: string, userId: string): Promise<void> {
    try {
      const { error } = await supabase
        .from("group_members")
        .insert({
          group_id: groupId,
          user_id: userId,
          role: 'member'
        });

      if (error) {
        if (isMissingTableError(error)) return this.joinGroupFallback(groupId, userId);
        throw error;
      }
    } catch (err) {
      console.warn("Supabase joinGroup failed, using fallback:", err);
      return this.joinGroupFallback(groupId, userId);
    }
  },

  joinGroupFallback(groupId: string, userId: string) {
    const members = getLS<any[]>(LS_KEY_MEMBERS, []);
    if (!members.some(m => m.group_id === groupId && m.user_id === userId)) {
      members.push({
        group_id: groupId,
        user_id: userId,
        role: 'member',
        joined_at: new Date().toISOString()
      });
      setLS(LS_KEY_MEMBERS, members);
    }
  },

  async leaveGroup(groupId: string, userId: string): Promise<void> {
    try {
      const { error } = await supabase
        .from("group_members")
        .delete()
        .match({ group_id: groupId, user_id: userId });

      if (error) {
        if (isMissingTableError(error)) return this.leaveGroupFallback(groupId, userId);
        throw error;
      }
    } catch (err) {
      console.warn("Supabase leaveGroup failed, using fallback:", err);
      return this.leaveGroupFallback(groupId, userId);
    }
  },

  leaveGroupFallback(groupId: string, userId: string) {
    let members = getLS<any[]>(LS_KEY_MEMBERS, []);
    members = members.filter(m => !(m.group_id === groupId && m.user_id === userId));
    setLS(LS_KEY_MEMBERS, members);
  },

  async deleteGroup(groupId: string): Promise<void> {
    try {
      const { error } = await supabase
        .from("groups")
        .delete()
        .match({ id: groupId });

      if (error) {
        if (isMissingTableError(error)) return this.deleteGroupFallback(groupId);
        throw error;
      }
    } catch (err) {
      console.warn("Supabase deleteGroup failed, using fallback:", err);
      return this.deleteGroupFallback(groupId);
    }
  },

  deleteGroupFallback(groupId: string) {
    let groups = getLS<any[]>(LS_KEY_GROUPS, []);
    groups = groups.filter(g => g.id !== groupId);
    setLS(LS_KEY_GROUPS, groups);

    let members = getLS<any[]>(LS_KEY_MEMBERS, []);
    members = members.filter(m => m.group_id !== groupId);
    setLS(LS_KEY_MEMBERS, members);
  },

  async fetchGroupMembers(groupId: string): Promise<GroupMember[]> {
    try {
      const { data, error } = await supabase
        .from("group_members")
        .select(`
          *,
          user_profiles:user_id(display_name:name, avatar_url)
        `)
        .eq("group_id", groupId);

      if (error) {
        if (isMissingTableError(error)) return this.fetchGroupMembersFallback(groupId);
        throw error;
      }

      return (data || []).map((m: any) => ({
        group_id: m.group_id,
        user_id: m.user_id,
        role: m.role,
        joined_at: m.joined_at,
        profile: m.user_profiles ? {
          display_name: m.user_profiles.display_name,
          avatar_url: m.user_profiles.avatar_url || ""
        } : undefined
      }));
    } catch (err) {
      console.warn("Supabase fetchGroupMembers failed, fallback:", err);
      return this.fetchGroupMembersFallback(groupId);
    }
  },

  fetchGroupMembersFallback(groupId: string): GroupMember[] {
    const members = getLS<any[]>(LS_KEY_MEMBERS, []);
    return members
      .filter(m => m.group_id === groupId)
      .map(m => ({
        ...m,
        profile: getMockUserProfile(m.user_id)
      }));
  },

  async removeGroupMember(groupId: string, memberUserId: string): Promise<void> {
    return this.leaveGroup(groupId, memberUserId);
  },

  // 2. COMMUNITY POSTS (FEED CORE)
  async fetchPosts(currentUserId?: string, filters?: { groupId?: string; type?: string }): Promise<CommunityPost[]> {
    try {
      let query = supabase
        .from("community_posts")
        .select(`
          *,
          user_profiles:author_id(display_name:name, avatar_url),
          groups:group_id(name),
          post_reactions(user_id),
          post_comments(id),
          event_rsvps(user_id, rsvp_status),
          question_option_votes(user_id, option_index)
        `)
        .eq("status", "approved")
        .order("created_at", { ascending: false });

      if (filters?.groupId) {
        query = query.eq("group_id", filters.groupId);
      }
      if (filters?.type) {
        query = query.eq("type", filters.type);
      }

      const { data, error } = await query;
      if (error) {
        if (isMissingTableError(error)) return this.fetchPostsFallback(currentUserId, filters);
        throw error;
      }

      return (data || []).map((p: any) => {
        const reactions = p.post_reactions || [];
        const hasReacted = currentUserId ? reactions.some((r: any) => r.user_id === currentUserId) : false;
        
        // Compute RSVP details
        const rsvps = p.event_rsvps || [];
        const userRsvp = currentUserId ? rsvps.find((r: any) => r.user_id === currentUserId) : null;
        const rsvpsCount = rsvps.reduce((acc: any, r: any) => {
          if (r.rsvp_status === 'interested') acc.interested++;
          if (r.rsvp_status === 'going') acc.going++;
          return acc;
        }, { interested: 0, going: 0 });

        // Compute Poll votes
        const votes = p.question_option_votes || [];
        const userVote = currentUserId ? votes.find((v: any) => v.user_id === currentUserId) : null;
        
        const optionCount = p.question_options ? p.question_options.length : 0;
        const votePercentages = Array(optionCount).fill(0);
        if (votes.length > 0) {
          const tally = Array(optionCount).fill(0);
          votes.forEach((v: any) => {
            if (v.option_index >= 0 && v.option_index < optionCount) {
              tally[v.option_index]++;
            }
          });
          for (let i = 0; i < optionCount; i++) {
            votePercentages[i] = Math.round((tally[i] / votes.length) * 100);
          }
        }

        return {
          ...p,
          author: p.user_profiles ? {
            display_name: p.user_profiles.display_name,
            avatar_url: p.user_profiles.avatar_url || ""
          } : undefined,
          group_name: p.groups?.name || undefined,
          reaction_count: reactions.length,
          has_reacted: hasReacted,
          comment_count: p.post_comments?.length || 0,
          rsvp_status: userRsvp?.rsvp_status || null,
          rsvps_count: rsvpsCount,
          vote_percentages: votePercentages,
          user_voted_option: userVote?.option_index ?? null
        };
      });
    } catch (err) {
      console.warn("Supabase fetchPosts failed, fallback:", err);
      return this.fetchPostsFallback(currentUserId, filters);
    }
  },

  fetchPostsFallback(currentUserId?: string, filters?: { groupId?: string; type?: string }): CommunityPost[] {
    let posts = getLS<any[]>(LS_KEY_POSTS, []);
    const reactions = getLS<any[]>(LS_KEY_REACTIONS, []);
    const comments = getLS<any[]>(LS_KEY_COMMENTS, []);
    const rsvps = getLS<any[]>(LS_KEY_RSVPS, []);
    const votes = getLS<any[]>(LS_KEY_VOTES, []);
    const groups = getLS<any[]>(LS_KEY_GROUPS, []);

    // Filter approved
    posts = posts.filter(p => p.status === 'approved');

    if (filters?.groupId) {
      posts = posts.filter(p => p.group_id === filters.groupId);
    }
    if (filters?.type) {
      posts = posts.filter(p => p.type === filters.type);
    }

    // Sort descending by created_at
    posts.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

    return posts.map(p => {
      const postReactions = reactions.filter(r => r.post_id === p.id);
      const hasReacted = currentUserId ? postReactions.some(r => r.user_id === currentUserId) : false;
      const postComments = comments.filter(c => c.post_id === p.id);
      
      const grp = groups.find(g => g.id === p.group_id);

      // RSVPs
      const postRsvps = rsvps.filter(r => r.post_id === p.id);
      const userRsvp = currentUserId ? postRsvps.find(r => r.user_id === currentUserId) : null;
      const rsvpsCount = postRsvps.reduce((acc, r) => {
        if (r.rsvp_status === 'interested') acc.interested++;
        if (r.rsvp_status === 'going') acc.going++;
        return acc;
      }, { interested: 0, going: 0 });

      // Poll votes
      const postVotes = votes.filter(v => v.post_id === p.id);
      const userVote = currentUserId ? postVotes.find(v => v.user_id === currentUserId) : null;
      const optionCount = p.question_options ? p.question_options.length : 0;
      const votePercentages = Array(optionCount).fill(0);
      if (postVotes.length > 0) {
        const tally = Array(optionCount).fill(0);
        postVotes.forEach(v => {
          if (v.option_index >= 0 && v.option_index < optionCount) {
            tally[v.option_index]++;
          }
        });
        for (let i = 0; i < optionCount; i++) {
          votePercentages[i] = Math.round((tally[i] / postVotes.length) * 100);
        }
      }

      return {
        ...p,
        author: getMockUserProfile(p.author_id),
        group_name: grp ? grp.name : undefined,
        reaction_count: postReactions.length,
        has_reacted: hasReacted,
        comment_count: postComments.length,
        rsvp_status: userRsvp ? userRsvp.rsvp_status : null,
        rsvps_count: rsvpsCount,
        vote_percentages: votePercentages,
        user_voted_option: userVote ? userVote.option_index : null
      };
    });
  },

  async createPost(postData: Partial<CommunityPost>): Promise<CommunityPost> {
    try {
      const { data, error } = await supabase
        .from("community_posts")
        .insert({
          ...postData,
          status: 'approved'
        })
        .select()
        .single();

      if (error) {
        if (isMissingTableError(error)) return this.createPostFallback(postData);
        throw error;
      }
      return data;
    } catch (err) {
      console.warn("Supabase createPost failed, fallback:", err);
      return this.createPostFallback(postData);
    }
  },

  createPostFallback(postData: Partial<CommunityPost>): CommunityPost {
    const posts = getLS<any[]>(LS_KEY_POSTS, []);
    const newPost: CommunityPost = {
      id: crypto.randomUUID(),
      group_id: postData.group_id || null,
      author_id: postData.author_id || "guest",
      type: postData.type || "thought",
      title: postData.title || null,
      content: postData.content || "",
      image_url: postData.image_url || null,
      youtube_url: postData.youtube_url || null,
      question_options: postData.question_options || null,
      status: 'approved',
      created_at: new Date().toISOString(),
      event_datetime: postData.event_datetime || null,
      event_location: postData.event_location || null,
      linked_bhajan_id: postData.linked_bhajan_id || null,
      request_status: postData.request_status || 'open',
      resolved_bhajan_id: postData.resolved_bhajan_id || null
    };

    posts.push(newPost);
    setLS(LS_KEY_POSTS, posts);
    return {
      ...newPost,
      author: getMockUserProfile(newPost.author_id),
      reaction_count: 0,
      has_reacted: false,
      comment_count: 0
    };
  },

  async togglePostReaction(postId: string, userId: string): Promise<boolean> {
    try {
      // Check if already reacted
      const { data, error: fetchErr } = await supabase
        .from("post_reactions")
        .select("*")
        .match({ post_id: postId, user_id: userId })
        .maybeSingle();

      if (fetchErr) {
        if (isMissingTableError(fetchErr)) return this.togglePostReactionFallback(postId, userId);
        throw fetchErr;
      }

      if (data) {
        // Remove reaction
        const { error: delErr } = await supabase
          .from("post_reactions")
          .delete()
          .match({ post_id: postId, user_id: userId });
        if (delErr) throw delErr;
        return false;
      } else {
        // Add reaction
        const { error: insErr } = await supabase
          .from("post_reactions")
          .insert({ post_id: postId, user_id: userId });
        if (insErr) throw insErr;
        return true;
      }
    } catch (err) {
      console.warn("Supabase togglePostReaction failed, fallback:", err);
      return this.togglePostReactionFallback(postId, userId);
    }
  },

  togglePostReactionFallback(postId: string, userId: string): boolean {
    const reactions = getLS<any[]>(LS_KEY_REACTIONS, []);
    const idx = reactions.findIndex(r => r.post_id === postId && r.user_id === userId);
    if (idx !== -1) {
      reactions.splice(idx, 1);
      setLS(LS_KEY_REACTIONS, reactions);
      return false;
    } else {
      reactions.push({
        post_id: postId,
        user_id: userId,
        created_at: new Date().toISOString()
      });
      setLS(LS_KEY_REACTIONS, reactions);
      return true;
    }
  },

  async softRemovePost(postId: string): Promise<void> {
    try {
      const { error } = await supabase
        .from("community_posts")
        .update({ status: "removed" })
        .match({ id: postId });

      if (error) {
        if (isMissingTableError(error)) return this.softRemovePostFallback(postId);
        throw error;
      }
    } catch (err) {
      console.warn("Supabase softRemovePost failed, fallback:", err);
      return this.softRemovePostFallback(postId);
    }
  },

  softRemovePostFallback(postId: string) {
    const posts = getLS<any[]>(LS_KEY_POSTS, []);
    const p = posts.find(x => x.id === postId);
    if (p) {
      p.status = 'removed';
      setLS(LS_KEY_POSTS, posts);
    }
  },

  // 3. POST COMMENTS
  async fetchComments(postId: string): Promise<PostComment[]> {
    try {
      const { data, error } = await supabase
        .from("post_comments")
        .select(`
          *,
          user_profiles:author_id(display_name:name, avatar_url)
        `)
        .eq("post_id", postId)
        .order("created_at", { ascending: true });

      if (error) {
        if (isMissingTableError(error)) return this.fetchCommentsFallback(postId);
        throw error;
      }

      return (data || []).map((c: any) => ({
        id: c.id,
        post_id: c.post_id,
        author_id: c.author_id,
        content: c.content,
        is_lyrics_submission: c.is_lyrics_submission,
        created_at: c.created_at,
        author: c.user_profiles ? {
          display_name: c.user_profiles.display_name,
          avatar_url: c.user_profiles.avatar_url || ""
        } : undefined
      }));
    } catch (err) {
      console.warn("Supabase fetchComments failed, fallback:", err);
      return this.fetchCommentsFallback(postId);
    }
  },

  fetchCommentsFallback(postId: string): PostComment[] {
    const comments = getLS<any[]>(LS_KEY_COMMENTS, []);
    return comments
      .filter(c => c.post_id === postId)
      .map(c => ({
        ...c,
        author: getMockUserProfile(c.author_id)
      }));
  },

  async createComment(postId: string, content: string, userId: string, isLyricsSubmission: boolean = false): Promise<PostComment> {
    try {
      const { data, error } = await supabase
        .from("post_comments")
        .insert({
          post_id: postId,
          content,
          author_id: userId,
          is_lyrics_submission: isLyricsSubmission
        })
        .select()
        .single();

      if (error) {
        if (isMissingTableError(error)) return this.createCommentFallback(postId, content, userId, isLyricsSubmission);
        throw error;
      }

      // If lyrics submission, advance post request_status to 'lyrics_submitted'
      if (isLyricsSubmission) {
        await supabase
          .from("community_posts")
          .update({ request_status: "lyrics_submitted" })
          .match({ id: postId });
      }

      return data;
    } catch (err) {
      console.warn("Supabase createComment failed, fallback:", err);
      return this.createCommentFallback(postId, content, userId, isLyricsSubmission);
    }
  },

  createCommentFallback(postId: string, content: string, userId: string, isLyricsSubmission: boolean = false): PostComment {
    const comments = getLS<any[]>(LS_KEY_COMMENTS, []);
    const newComment: PostComment = {
      id: crypto.randomUUID(),
      post_id: postId,
      author_id: userId,
      content,
      is_lyrics_submission: isLyricsSubmission,
      created_at: new Date().toISOString()
    };
    comments.push(newComment);
    setLS(LS_KEY_COMMENTS, comments);

    // If lyrics submission, advance request status
    if (isLyricsSubmission) {
      const posts = getLS<any[]>(LS_KEY_POSTS, []);
      const p = posts.find(x => x.id === postId);
      if (p) {
        p.request_status = 'lyrics_submitted';
        setLS(LS_KEY_POSTS, posts);
      }
    }

    return {
      ...newComment,
      author: getMockUserProfile(newComment.author_id)
    };
  },

  async deleteComment(commentId: string): Promise<void> {
    try {
      const { error } = await supabase
        .from("post_comments")
        .delete()
        .match({ id: commentId });

      if (error) {
        if (isMissingTableError(error)) return this.deleteCommentFallback(commentId);
        throw error;
      }
    } catch (err) {
      console.warn("Supabase deleteComment failed, fallback:", err);
      return this.deleteCommentFallback(commentId);
    }
  },

  deleteCommentFallback(commentId: string) {
    let comments = getLS<any[]>(LS_KEY_COMMENTS, []);
    comments = comments.filter(c => c.id !== commentId);
    setLS(LS_KEY_COMMENTS, comments);
  },

  // 4. EVENT RSVPS
  async rsvpToEvent(postId: string, userId: string, rsvpStatus: 'interested' | 'going'): Promise<void> {
    try {
      const { error } = await supabase
        .from("event_rsvps")
        .upsert({
          post_id: postId,
          user_id: userId,
          rsvp_status: rsvpStatus,
          responded_at: new Date().toISOString()
        });

      if (error) {
        if (isMissingTableError(error)) return this.rsvpToEventFallback(postId, userId, rsvpStatus);
        throw error;
      }
    } catch (err) {
      console.warn("Supabase rsvpToEvent failed, fallback:", err);
      return this.rsvpToEventFallback(postId, userId, rsvpStatus);
    }
  },

  rsvpToEventFallback(postId: string, userId: string, rsvpStatus: 'interested' | 'going') {
    const rsvps = getLS<any[]>(LS_KEY_RSVPS, []);
    const idx = rsvps.findIndex(r => r.post_id === postId && r.user_id === userId);
    if (idx !== -1) {
      rsvps[idx].rsvp_status = rsvpStatus;
      rsvps[idx].responded_at = new Date().toISOString();
    } else {
      rsvps.push({
        post_id: postId,
        user_id: userId,
        rsvp_status: rsvpStatus,
        responded_at: new Date().toISOString()
      });
    }
    setLS(LS_KEY_RSVPS, rsvps);
  },

  async deleteEventRsvp(postId: string, userId: string): Promise<void> {
    try {
      const { error } = await supabase
        .from("event_rsvps")
        .delete()
        .match({ post_id: postId, user_id: userId });

      if (error) {
        if (isMissingTableError(error)) return this.deleteEventRsvpFallback(postId, userId);
        throw error;
      }
    } catch (err) {
      console.warn("Supabase deleteEventRsvp failed, fallback:", err);
      return this.deleteEventRsvpFallback(postId, userId);
    }
  },

  deleteEventRsvpFallback(postId: string, userId: string) {
    let rsvps = getLS<any[]>(LS_KEY_RSVPS, []);
    rsvps = rsvps.filter(r => !(r.post_id === postId && r.user_id === userId));
    setLS(LS_KEY_RSVPS, rsvps);
  },

  // 5. QUESTION POLL VOTES
  async voteOnQuestionOption(postId: string, userId: string, optionIndex: number): Promise<void> {
    try {
      const { error } = await supabase
        .from("question_option_votes")
        .upsert({
          post_id: postId,
          user_id: userId,
          option_index: optionIndex,
          voted_at: new Date().toISOString()
        });

      if (error) {
        if (isMissingTableError(error)) return this.voteOnQuestionOptionFallback(postId, userId, optionIndex);
        throw error;
      }
    } catch (err) {
      console.warn("Supabase voteOnQuestionOption failed, fallback:", err);
      return this.voteOnQuestionOptionFallback(postId, userId, optionIndex);
    }
  },

  voteOnQuestionOptionFallback(postId: string, userId: string, optionIndex: number) {
    const votes = getLS<any[]>(LS_KEY_VOTES, []);
    const idx = votes.findIndex(v => v.post_id === postId && v.user_id === userId);
    if (idx !== -1) {
      votes[idx].option_index = optionIndex;
      votes[idx].voted_at = new Date().toISOString();
    } else {
      votes.push({
        post_id: postId,
        user_id: userId,
        option_index: optionIndex,
        voted_at: new Date().toISOString()
      });
    }
    setLS(LS_KEY_VOTES, votes);
  },

  // 6. ADMIN MODERATION ACTIONS FOR BHAJAN REQUESTS
  async adminResolveRequestToLibrary(postId: string, lyrics: string, title: string, userId: string): Promise<string | number> {
    try {
      // 1) Inserts a row in user_uploads table
      const { data: uploadData, error: uploadErr } = await supabase
        .from("user_uploads")
        .insert({
          user_id: userId,
          title: title,
          title_hindi: title, // Pre-fill with same title
          deity_id: 1, // Default deity ID (Rama)
          singer_name: "Community Request Fulfillment",
          lyrics_hindi: lyrics,
          status: "pending", // Pre-fill as pending for moderation queue review
          admin_notes: "Automatically created from community Bhajan Request."
        })
        .select()
        .single();

      if (uploadErr) {
        if (isMissingTableError(uploadErr)) return this.adminResolveRequestToLibraryFallback(postId, lyrics, title, userId);
        throw uploadErr;
      }

      const newBhajanUploadId = isNaN(Number(uploadData.id)) ? uploadData.id : Number(uploadData.id);

      // 2) Update community post request_status and resolved_bhajan_id
      const { error: postErr } = await supabase
        .from("community_posts")
        .update({
          request_status: "in_review",
          resolved_bhajan_id: newBhajanUploadId
        })
        .match({ id: postId });

      if (postErr) throw postErr;

      return newBhajanUploadId;
    } catch (err) {
      console.warn("Supabase adminResolveRequestToLibrary failed, fallback:", err);
      return this.adminResolveRequestToLibraryFallback(postId, lyrics, title, userId);
    }
  },

  adminResolveRequestToLibraryFallback(postId: string, lyrics: string, title: string, userId: string): string | number {
    const posts = getLS<any[]>(LS_KEY_POSTS, []);
    const p = posts.find(x => x.id === postId);
    if (p) {
      p.request_status = 'added_to_library'; // Mark as added immediately for fallback sandbox testing
      p.resolved_bhajan_id = 9999;
      setLS(LS_KEY_POSTS, posts);
    }
    return 9999;
  },

  async adminRejectRequestSubmission(postId: string): Promise<void> {
    try {
      const { error } = await supabase
        .from("community_posts")
        .update({ request_status: "open" })
        .match({ id: postId });

      if (error) {
        if (isMissingTableError(error)) return this.adminRejectRequestSubmissionFallback(postId);
        throw error;
      }
    } catch (err) {
      console.warn("Supabase adminRejectRequestSubmission failed, fallback:", err);
      return this.adminRejectRequestSubmissionFallback(postId);
    }
  },

  adminRejectRequestSubmissionFallback(postId: string) {
    const posts = getLS<any[]>(LS_KEY_POSTS, []);
    const p = posts.find(x => x.id === postId);
    if (p) {
      p.request_status = 'open';
      setLS(LS_KEY_POSTS, posts);
    }
  },

  async adminPickRequestForReview(postId: string): Promise<void> {
    try {
      const { error } = await supabase
        .from("community_posts")
        .update({ request_status: "in_review" })
        .match({ id: postId });

      if (error) {
        if (isMissingTableError(error)) return this.adminPickRequestForReviewFallback(postId);
        throw error;
      }
    } catch (err) {
      console.warn("Supabase adminPickRequestForReview failed, fallback:", err);
      return this.adminPickRequestForReviewFallback(postId);
    }
  },

  adminPickRequestForReviewFallback(postId: string) {
    const posts = getLS<any[]>(LS_KEY_POSTS, []);
    const p = posts.find(x => x.id === postId);
    if (p) {
      p.request_status = 'in_review';
      setLS(LS_KEY_POSTS, posts);
    }
  }
};
