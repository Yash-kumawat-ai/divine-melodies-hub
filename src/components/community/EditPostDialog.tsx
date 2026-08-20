/**
 * EditPostDialog.tsx
 *
 * Modal allowing authors to edit their existing community posts,
 * including updating text, title, and replacing or adjusting photo.
 */

import React, { useState, useEffect } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { ImageAdjuster } from "@/components/community/ImageAdjuster";
import { uploadToCloudinary } from "@/lib/cloudinary";
import { communityApi, type CommunityPost } from "@/lib/community/communityApi";

export interface EditPostDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  post: CommunityPost | null;
  isHi: boolean;
  onPostUpdated?: () => void;
}

export function EditPostDialog({
  open,
  onOpenChange,
  post,
  isHi,
  onPostUpdated,
}: EditPostDialogProps) {
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (post) {
      setTitle(post.title || "");
      setContent(post.content || "");
      setImagePreview(post.image_url || null);
      setImageFile(null);
    }
  }, [post, open]);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      const reader = new FileReader();
      reader.onload = () => setImagePreview(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  const handleRemoveImage = () => {
    setImageFile(null);
    setImagePreview(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!post) return;

    if (!content.trim()) {
      toast.error(isHi ? "विवरण सामग्री आवश्यक है" : "Content is required");
      return;
    }

    try {
      setIsSaving(true);
      let finalImageUrl = imagePreview;

      // If new image selected, upload to Cloudinary
      if (imageFile) {
        finalImageUrl = await uploadToCloudinary(imageFile, "lyrics");
      }

      await communityApi.updatePost(post.id, {
        title: title.trim() || null,
        content: content.trim(),
        image_url: finalImageUrl,
      });

      toast.success(isHi ? "पोस्ट सफलतापूर्वक अपडेट की गई!" : "Post updated successfully!");
      onOpenChange(false);
      onPostUpdated?.();
    } catch (err: any) {
      console.error("Failed to update post:", err);
      toast.error(isHi ? "पोस्ट अपडेट करने में विफल" : "Failed to update post");
    } finally {
      setIsSaving(false);
    }
  };

  if (!post) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-[calc(100vw-24px)] sm:w-full max-w-lg bg-[#FFFDF8] dark:bg-[#120F0B] border border-[#E8D8C4] dark:border-stone-800 text-stone-900 dark:text-stone-50 rounded-2xl sm:rounded-3xl p-5 sm:p-6 max-h-[90vh] overflow-y-auto overflow-x-hidden [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden shadow-2xl">
        <DialogHeader className="pb-3 border-b border-[#E8D8C4]/60 dark:border-stone-800 text-center sm:text-center">
          <DialogTitle className="font-display font-bold text-lg sm:text-xl text-[#651317] dark:text-amber-100 text-center">
            {isHi ? "पोस्ट संपादित करें" : "Edit Post"}
          </DialogTitle>
          <DialogDescription className="text-center text-[11px] text-[#8C7A6B] dark:text-stone-400 mt-0.5">
            {isHi ? "अपनी पोस्ट का विवरण और चित्र अपडेट करें" : "Update your post details and photo"}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-3 pt-2 text-left">
          {/* Title (if post has title or is not a plain thought) */}
          {(post.type !== "thought" || title) && (
            <div className="space-y-1">
              <label className="text-[11px] font-bold text-[#651317] dark:text-amber-200">
                {isHi ? "शीर्षक" : "Title"}
              </label>
              <Input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder={isHi ? "पोस्ट शीर्षक दर्ज करें" : "Enter post title"}
                className="h-9 text-xs sm:text-sm border-[#E8D8C4] dark:border-stone-700 bg-white dark:bg-stone-900 rounded-xl"
              />
            </div>
          )}

          {/* Content */}
          <div className="space-y-1">
            <label className="text-[11px] font-bold text-[#651317] dark:text-amber-200">
              {isHi ? "विवरण / विचार" : "Thought / Description"} <span className="text-rose-500">*</span>
            </label>
            <textarea
              rows={3}
              value={content}
              onChange={(e) => setContent(e.target.value)}
              required
              placeholder={isHi ? "अपने विचार लिखें…" : "Write your thoughts…"}
              className="w-full text-xs sm:text-sm rounded-xl border border-[#E8D8C4] dark:border-stone-700 bg-white dark:bg-stone-900 p-2.5 focus:border-[#651317] focus:outline-none focus:ring-1 focus:ring-[#651317]/20 placeholder:text-stone-400 leading-relaxed resize-none dark:text-stone-100"
            />
          </div>

          {/* Image Adjuster */}
          <ImageAdjuster
            imageSrc={imagePreview}
            onImageChange={handleImageChange}
            onCroppedImageReady={(file, previewUrl) => {
              setImageFile(file);
              setImagePreview(previewUrl);
            }}
            onRemoveImage={handleRemoveImage}
            isHi={isHi}
            label={isHi ? "संलग्न चित्र (समायोजित करें / बदलें)" : "Attached Photo (Adjust / Replace)"}
          />

          {/* Buttons */}
          <div className="flex gap-2 pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              className="flex-1 h-9 sm:h-9.5 rounded-full border-[#E8D8C4] dark:border-stone-700 text-[#651317] dark:text-stone-300 font-bold text-xs sm:text-sm hover:bg-[#FAF0E4]"
            >
              {isHi ? "रद्द करें" : "Cancel"}
            </Button>
            <Button
              type="submit"
              disabled={isSaving}
              className="flex-1 h-9 sm:h-9.5 rounded-full bg-[#651317] hover:bg-[#4f0f12] text-white font-bold text-xs sm:text-sm shadow-xs transition-all active:scale-95"
            >
              {isSaving
                ? isHi
                  ? "सहेजा जा रहा है…"
                  : "Saving Changes…"
                : isHi
                ? "बदलाव सहेजें"
                : "Save Changes"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
