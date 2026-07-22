import { useState } from "react";
import { toast } from "sonner";
import { communityApi } from "@/lib/community/communityApi";
import { uploadToCloudinary } from "@/lib/cloudinary";

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
  const [postType, setPostType] = useState<'bhajan_share' | 'bhajan_request' | 'question' | 'thought' | 'event'>('thought');
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

  // Cloudinary image upload preview helper
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setPostImageFile(file);
      const reader = new FileReader();
      reader.onload = () => setPostImagePreview(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  // Post Creator submit handler
  const handleCreatePost = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      toast.error(isHi ? "पोस्ट प्रकाशित करने के लिए कृपया लॉग इन करें" : "Please log in to publish posts");
      return;
    }
    if (postType !== 'thought' && !postTitle.trim()) {
      toast.error(isHi ? "शीर्षक आवश्यक है" : "Title is required");
      return;
    }
    if (!postContent.trim()) {
      toast.error(isHi ? "विवरण सामग्री आवश्यक है" : "Content description is required");
      return;
    }

    try {
      setPublishingPost(true);
      let imageUrl = null;
      if (postImageFile) {
        imageUrl = await uploadToCloudinary(postImageFile, 'lyrics');
      }

      const options = postType === 'question'
        ? pollOptions.filter(o => o.trim())
        : null;

      let eventDt = null;
      if (postType === 'event' && eventDate) {
        eventDt = new Date(`${eventDate}T${eventTime || '00:00'}`).toISOString();
      }

      await communityApi.createPost({
        group_id: selectedGroup?.id || null,
        author_id: user.id,
        type: postType,
        title: postTitle.trim() || null,
        content: postContent.trim(),
        image_url: imageUrl,
        youtube_url: postYoutubeUrl.trim() || null,
        question_options: options,
        event_datetime: eventDt,
        event_location: postLocation.trim() || null,
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
    handleImageChange,
    handleCreatePost,
  };
}
