import { useState } from "react";
import { toast } from "sonner";
import { communityApi } from "@/lib/community/communityApi";
import { uploadToCloudinary } from "@/lib/cloudinary";
import {
  compressCommunityImage,
  COMMUNITY_IMAGE_MAX_PICK_BYTES,
  COMMUNITY_IMAGE_TARGET_BYTES,
} from "@/lib/compressCommunityImage";
import type { ComposeIntent } from "@/components/community/FeedComposer";

interface UseCreatePostInput {
  user: any;
  isHi: boolean;
  selectedGroup: any;
  loadPosts: () => void;
}

export function useCreatePost({
  user,
  isHi,
  selectedGroup,
  loadPosts,
}: UseCreatePostInput) {
  // Form visibility state
  const [createPostOpen, setCreatePostOpen] = useState(false);

  // Post Creator form states
  const [postType, setPostType] = useState<'bhajan_share' | 'bhajan_request' | 'question' | 'thought' | 'event' | 'shloka'>('thought');
  const [postTitle, setPostTitle] = useState("");
  const [postContent, setPostContent] = useState("");
  const [postImageFile, setPostImageFile] = useState<File | null>(null);
  const [postImagePreview, setPostImagePreview] = useState<string | null>(null);
  const [postYoutubeUrl, setPostYoutubeUrl] = useState("");
  const [pollOptions, setPollOptions] = useState<string[]>(["", ""]);
  
  // Event specific fields
  const [eventDate, setEventDate] = useState("");
  const [eventTime, setEventTime] = useState("");
  const [postLocation, setPostLocation] = useState("");
  const [eventLinkedBhajan, setEventLinkedBhajan] = useState<number | null>(null);
  
  const [publishingPost, setPublishingPost] = useState(false);
  const [cropOpenKey, setCropOpenKey] = useState(0);
  const [voiceStartKey, setVoiceStartKey] = useState(0);
  const [emojiOpenKey, setEmojiOpenKey] = useState(0);

  // Cloudinary image upload preview helper
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > COMMUNITY_IMAGE_MAX_PICK_BYTES) {
      toast.error(isHi ? "चित्र 15MB से बड़ा है।" : "Photo is larger than 15MB.");
      return;
    }
    setPostImageFile(file);
    const reader = new FileReader();
    reader.onload = () => setPostImagePreview(reader.result as string);
    reader.readAsDataURL(file);
  };

  const ingestImageFile = (file: File) => {
    if (file.size > COMMUNITY_IMAGE_MAX_PICK_BYTES) {
      toast.error(isHi ? "चित्र 15MB से बड़ा है।" : "Photo is larger than 15MB.");
      return;
    }
    setPostImageFile(file);
    const reader = new FileReader();
    reader.onload = () => {
      setPostImagePreview(reader.result as string);
      setCropOpenKey((k) => k + 1);
    };
    reader.readAsDataURL(file);
  };

  const openCompose = (intent?: ComposeIntent | "bhajan_share" | "bhajan_request" | "question" | "thought" | "event" | "shloka") => {
    const i: ComposeIntent = typeof intent === "string" ? { type: intent } : intent ?? {};
    setPostType(i.type ?? "thought");
    setCreatePostOpen(true);
    if (i.mediaFile) ingestImageFile(i.mediaFile);
    if (i.startVoice) setVoiceStartKey((k) => k + 1);
    if (i.showEmoji) setEmojiOpenKey((k) => k + 1);
  };

  // Post Creator submit handler
  const handleCreatePost = async (
    e: React.FormEvent,
    overrides?: { content?: string; location?: string }
  ) => {
    e.preventDefault();
    if (!user) {
      toast.error(isHi ? "पोस्ट प्रकाशित करने के लिए कृपया लॉग इन करें" : "Please log in to publish posts");
      return;
    }
    if (postType !== 'thought' && postType !== 'shloka' && !postTitle.trim()) {
      toast.error(isHi ? "शीर्षक आवश्यक है" : "Title is required");
      return;
    }
    const contentToSave = (overrides?.content ?? postContent).trim()
      || (postType === "question" ? postTitle.trim() : "");
    const locationToSave = (overrides?.location ?? postLocation).trim();
    if (!contentToSave) {
      toast.error(isHi ? "विवरण सामग्री आवश्यक है" : "Content description is required");
      return;
    }
    if (postType === 'event' && (!eventDate || !eventTime)) {
      toast.error(isHi ? "कृपया तारीख और समय चुनें" : "Please select event date and time");
      return;
    }

    try {
      setPublishingPost(true);
      let imageUrl = null;
      if (postImageFile) {
        let toUpload = postImageFile;
        if (postImageFile.size > COMMUNITY_IMAGE_TARGET_BYTES) {
          const packed = await compressCommunityImage(postImageFile);
          toUpload = packed.file;
        }
        imageUrl = await uploadToCloudinary(toUpload, "lyrics");
      }

      const options = postType === 'question'
        ? pollOptions.filter(o => o.trim())
        : null;

      let eventDt = null;
      if (postType === 'event' && eventDate) {
        eventDt = new Date(`${eventDate}T${eventTime || '00:00'}`).toISOString();
      }

      let finalContent = contentToSave;
      if (postType === 'shloka' && !finalContent.startsWith('[SHLOKA]')) {
        finalContent = `[SHLOKA]\n${finalContent}`;
      }

      await communityApi.createPost({
        group_id: selectedGroup?.id || null,
        author_id: user.id,
        type: postType === 'shloka' ? 'thought' : postType,
        title: postTitle.trim() || null,
        content: finalContent,
        image_url: imageUrl,
        youtube_url: postYoutubeUrl.trim() || null,
        question_options: options,
        event_datetime: eventDt,
        event_location: locationToSave || null,
        linked_bhajan_id: eventLinkedBhajan,
      });

      toast.success(isHi ? "भक्तिमय पोस्ट प्रकाशित की गई!" : "Devotional post published!");

      // Reset form states
      setPostTitle("");
      setPostContent("");
      setPostImageFile(null);
      setPostImagePreview(null);
      setPostYoutubeUrl("");
      setPollOptions(["", ""]);
      setEventDate("");
      setEventTime("");
      setPostLocation("");
      setEventLinkedBhajan(null);
      setCreatePostOpen(false);

      loadPosts();
    } catch (err: any) {
      console.error("Post creation error:", err);
      const errMsg = err?.message || err?.details || JSON.stringify(err);
      toast.error(isHi ? `पोस्ट प्रकाशित करने में असमर्थ: ${errMsg}` : `Failed to publish post: ${errMsg}`);
    } finally {
      setPublishingPost(false);
    }
  };

  const handleCroppedImageReady = (file: File, previewUrl: string) => {
    setPostImageFile(file);
    setPostImagePreview(previewUrl);
  };

  const handleRemoveImage = () => {
    setPostImageFile(null);
    setPostImagePreview(null);
  };

  return {
    createPostOpen,
    setCreatePostOpen,
    postType,
    setPostType,
    postTitle,
    setPostTitle,
    postContent,
    setPostContent,
    postImageFile,
    setPostImageFile,
    postImagePreview,
    setPostImagePreview,
    postYoutubeUrl,
    setPostYoutubeUrl,
    pollOptions,
    setPollOptions,
    eventDate,
    setEventDate,
    eventTime,
    setEventTime,
    postLocation,
    setPostLocation,
    eventLinkedBhajan,
    setEventLinkedBhajan,
    publishingPost,
    setPublishingPost,
    cropOpenKey,
    voiceStartKey,
    emojiOpenKey,
    openCompose,
    handleImageChange,
    handleCroppedImageReady,
    handleRemoveImage,
    handleCreatePost,
  };
}
