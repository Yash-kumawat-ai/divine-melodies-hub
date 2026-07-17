/**
 * CreatePostDialog.tsx
 *
 * Extracted from JoinCommunityPage.tsx as part of Phase 7 refactoring.
 * Renders the modal form to compose a devotional post.
 */

import React from "react";
import { Sparkles, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";

export interface CreatePostDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  isHi: boolean;
  postType: 'bhajan_share' | 'bhajan_request' | 'question' | 'thought' | 'event';
  setPostType: (type: 'bhajan_share' | 'bhajan_request' | 'question' | 'thought' | 'event') => void;
  postTitle: string;
  setPostTitle: (v: string) => void;
  postContent: string;
  setPostContent: (v: string) => void;
  postImagePreview: string | null;
  postYoutubeUrl: string;
  setPostYoutubeUrl: (v: string) => void;
  pollOptions: string[];
  setPollOptions: (opts: string[]) => void;
  eventDate: string;
  setEventDate: (v: string) => void;
  eventTime: string;
  setEventTime: (v: string) => void;
  postLocation: string;
  setPostLocation: (v: string) => void;
  eventLinkedBhajan: number | null;
  setEventLinkedBhajan: (id: number | null) => void;
  myBhajans: any[];
  publishingPost: boolean;
  handleImageChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onSubmit: (e: React.FormEvent) => void;
}

export function CreatePostDialog({
  open,
  onOpenChange,
  isHi,
  postType,
  setPostType,
  postTitle,
  setPostTitle,
  postContent,
  setPostContent,
  postImagePreview,
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
  myBhajans,
  publishingPost,
  handleImageChange,
  onSubmit,
}: CreatePostDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md bg-[#FAF6EE] dark:bg-[#0f0d0a] border-orange-500/20 text-stone-950 dark:text-stone-50 rounded-3xl p-6 max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="font-display font-extrabold text-lg text-orange-950 dark:text-amber-100 text-center">
            {isHi ? "भक्तिमय पोस्ट बनाएं" : "Create Devotional Post"}
          </DialogTitle>
          <DialogDescription className="text-center text-xs text-stone-500 mt-1">
            Select post type and fill the devotional details below.
          </DialogDescription>
        </DialogHeader>

        {/* Post Type Selector Grid */}
        <div className="grid grid-cols-3 sm:grid-cols-5 gap-2 my-4">
          {[
            { id: 'thought', label: isHi ? 'विचार' : 'Thought', icon: '🌿' },
            { id: 'bhajan_share', label: isHi ? 'भजन शेयर' : 'Share', icon: '🎵' },
            { id: 'bhajan_request', label: isHi ? 'अनुरोध' : 'Request', icon: '📿' },
            { id: 'question', label: isHi ? 'प्रश्न' : 'Question', icon: '❓' },
            { id: 'event', label: isHi ? 'कार्यक्रम' : 'Event', icon: '📅' },
          ].map((type) => (
            <button
              key={type.id}
              type="button"
              onClick={() => setPostType(type.id as any)}
              className={`p-2.5 rounded-xl border flex flex-col items-center justify-center gap-1.5 transition-all ${
                postType === type.id
                  ? "bg-orange-500 border-orange-600 text-white scale-[1.02] shadow-xs"
                  : "bg-white dark:bg-stone-900 border-orange-500/10 text-stone-700 dark:text-stone-300 hover:bg-orange-50"
              }`}
            >
              <span className="text-lg leading-none">{type.icon}</span>
              <span className="text-[9px] font-extrabold tracking-tight uppercase whitespace-nowrap">{type.label}</span>
            </button>
          ))}
        </div>

        <form onSubmit={onSubmit} className="space-y-4">
          {/* Title (for Bhajan Share, Request, Event) */}
          {postType !== 'thought' && (
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-stone-600 dark:text-stone-300">
                {postType === 'bhajan_share' && (isHi ? "भजन शीर्षक" : "Bhajan Title")}
                {postType === 'bhajan_request' && (isHi ? "अनुरोधित भजन का नाम" : "Requested Bhajan Title")}
                {postType === 'question' && (isHi ? "प्रश्न का विषय (संक्षिप्त)" : "Question / Topic")}
                {postType === 'event' && (isHi ? "सत्संग / कार्यक्रम का नाम" : "Event Title")}
              </label>
              <Input
                type="text"
                placeholder={postType === 'bhajan_request' ? "e.g., Kunj Bihari Aarti" : "e.g., Ram Ji Ka Satsang"}
                value={postTitle}
                onChange={(e) => setPostTitle(e.target.value)}
                required
                className="border-orange-500/20 bg-white dark:bg-stone-950/40 rounded-xl font-bold"
              />
            </div>
          )}

          {/* Content Textarea */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-stone-600 dark:text-stone-300">
              {postType === 'thought' && (isHi ? "अपने विचार लिखें" : "Write your devotional thought")}
              {postType === 'bhajan_share' && (isHi ? "भजन की पंक्तियाँ या वर्णन" : "Lyrics excerpt or description")}
              {postType === 'bhajan_request' && (isHi ? "विवरण (भजन के बोल, राग या कोई संकेत)" : "Provide hints, singer name, or details")}
              {postType === 'question' && (isHi ? "अपना प्रश्न यहाँ पूछें" : "Write your question here")}
              {postType === 'event' && (isHi ? "कार्यक्रम विवरण" : "Event Description")}
            </label>
            <textarea
              rows={4}
              value={postContent}
              onChange={(e) => setPostContent(e.target.value)}
              required
              className="w-full text-sm rounded-xl border border-orange-500/20 bg-white dark:bg-stone-950/40 p-3 focus:border-orange-500 focus:outline-none placeholder:text-stone-400"
              placeholder={postType === 'thought' ? "भक्ति के बारे में कुछ लिखें..." : "विवरण दर्ज करें..."}
            />
          </div>

          {/* Custom Image Upload (Cloudinary) */}
          {(postType === 'bhajan_share' || postType === 'event') && (
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-stone-600 dark:text-stone-300 block">
                {postType === 'event' ? "Event Poster Image" : "Add Image (Optional)"}
              </label>
              <div className="flex items-center gap-3">
                <Input
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  className="hidden"
                  id="post-image-file"
                />
                <label
                  htmlFor="post-image-file"
                  className="px-4 py-2 bg-white dark:bg-stone-900 border border-orange-500/25 hover:bg-orange-50 text-orange-600 dark:text-orange-400 font-bold text-xs rounded-xl shadow-xs cursor-pointer flex items-center gap-1 hover:scale-98 active:scale-95 transition-all shrink-0"
                >
                  Upload Photo
                </label>
                {postImagePreview && (
                  <div className="w-10 h-10 rounded-lg overflow-hidden border border-orange-500/10 shrink-0">
                    <img src={postImagePreview} alt="Preview" className="w-full h-full object-cover" />
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Youtube URL (Bhajan Share only) */}
          {postType === 'bhajan_share' && (
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-stone-600 dark:text-stone-300">
                YouTube Link (Optional)
              </label>
              <Input
                type="url"
                placeholder="https://youtube.com/watch?v=..."
                value={postYoutubeUrl}
                onChange={(e) => setPostYoutubeUrl(e.target.value)}
                className="border-orange-500/20 bg-white dark:bg-stone-950/40 rounded-xl"
              />
            </div>
          )}

          {/* Quick-tap choices for Questions */}
          {postType === 'question' && (
            <div className="space-y-2 bg-orange-500/5 p-3.5 rounded-2xl border border-orange-500/10">
              <span className="text-xs font-bold text-orange-955 text-orange-950 dark:text-amber-100 block">
                Quick-tap choices (optional)
              </span>
              <div className="space-y-1.5">
                {pollOptions.map((opt, index) => (
                  <div key={index} className="flex gap-2">
                    <Input
                      type="text"
                      placeholder={`Option ${index + 1}`}
                      value={opt}
                      onChange={(e) => {
                        const updated = [...pollOptions];
                        updated[index] = e.target.value;
                        setPollOptions(updated);
                      }}
                      className="h-8.5 text-xs rounded-lg"
                    />
                    {pollOptions.length > 2 && (
                      <button
                        type="button"
                        onClick={() => setPollOptions(pollOptions.filter((_, idx) => idx !== index))}
                        className="text-rose-600 hover:text-rose-700 text-xs px-1"
                      >
                        Remove
                      </button>
                    )}
                  </div>
                ))}
                {pollOptions.length < 4 && (
                  <button
                    type="button"
                    onClick={() => setPollOptions([...pollOptions, ""])}
                    className="text-xs font-bold text-orange-600 dark:text-orange-400 hover:underline"
                  >
                    + Add Option
                  </button>
                )}
              </div>
            </div>
          )}

          {/* Event Specific Parameters */}
          {postType === 'event' && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 bg-orange-500/5 p-4 rounded-2xl border border-orange-500/10">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-stone-600 dark:text-stone-300">Date</label>
                <Input
                  type="date"
                  value={eventDate}
                  onChange={(e) => setEventDate(e.target.value)}
                  required
                  className="border-orange-500/20 bg-white rounded-lg h-9 text-xs"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-stone-600 dark:text-stone-300">Time</label>
                <Input
                  type="time"
                  value={eventTime}
                  onChange={(e) => setEventTime(e.target.value)}
                  required
                  className="border-orange-500/20 bg-white rounded-lg h-9 text-xs"
                />
              </div>
              <div className="space-y-1.5 sm:col-span-2">
                <label className="text-xs font-bold text-stone-600 dark:text-stone-300">Location</label>
                <Input
                  type="text"
                  placeholder="e.g., Radha Krishna Temple, Kunj Gali"
                  value={postLocation}
                  onChange={(e) => setPostLocation(e.target.value)}
                  required
                  className="border-orange-500/20 bg-white rounded-lg h-9 text-xs"
                />
              </div>

              {/* Linked library bhajan (optional) */}
              <div className="space-y-1.5 sm:col-span-2">
                <label className="text-xs font-bold text-stone-600 dark:text-stone-300">
                  Attach library bhajan (Optional)
                </label>
                <select
                  value={eventLinkedBhajan || ""}
                  onChange={(e) => setEventLinkedBhajan(e.target.value ? Number(e.target.value) : null)}
                  className="w-full text-xs rounded-lg border border-orange-500/20 bg-white p-2.5"
                >
                  <option value="">-- None --</option>
                  {myBhajans.map((b) => (
                    <option key={b.id} value={b.id}>
                      {b.title} ({b.singer_name})
                    </option>
                  ))}
                </select>
              </div>
            </div>
          )}

          <div className="flex gap-3 pt-3">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              className="flex-1 rounded-xl border border-stone-200 dark:border-stone-700"
            >
              {isHi ? "रद्द करें" : "Cancel"}
            </Button>
            <Button
              type="submit"
              disabled={publishingPost}
              className="flex-1 bg-orange-500 hover:bg-orange-600 text-white font-bold rounded-xl"
            >
              {publishingPost ? (isHi ? "प्रकाशित हो रहा..." : "Publishing...") : (isHi ? "प्रकाशित करें" : "Publish")}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
