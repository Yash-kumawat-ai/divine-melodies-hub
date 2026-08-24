import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { useAuth } from '@/hooks/useAuth';
import { useLanguage } from '@/hooks/useLanguage';
import { communityApi, type Group } from '@/lib/community/communityApi';
import type { Bhajan } from '@/data/bhajans';
import {
  Users,
  Share2,
  Check,
  Loader2,
  Plus,
  Sparkles,
  Music2,
  ArrowRight,
  LogIn,
} from 'lucide-react';
import { toast } from 'sonner';

interface AddToGroupDialogProps {
  isOpen: boolean;
  onClose: () => void;
  bhajan: Bhajan;
}

export default function AddToGroupDialog({ isOpen, onClose, bhajan }: AddToGroupDialogProps) {
  const { user } = useAuth();
  const { language } = useLanguage();
  const isHi = language === 'hi';

  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [joiningGroupId, setJoiningGroupId] = useState<string | null>(null);

  const [myGroups, setMyGroups] = useState<Group[]>([]);
  const [recommendedGroups, setRecommendedGroups] = useState<Group[]>([]);
  const [selectedGroupId, setSelectedGroupId] = useState<string>('');
  const [postContent, setPostContent] = useState<string>('');

  // Fetch user's joined groups & popular public groups when dialog opens
  useEffect(() => {
    if (!isOpen || !user) return;

    let isMounted = true;
    async function loadGroups() {
      setLoading(true);
      try {
        const [joined, allPublic] = await Promise.all([
          communityApi.fetchMyGroups(user.id),
          communityApi.fetchGroups(user.id),
        ]);

        if (isMounted) {
          setMyGroups(joined);
          if (joined.length > 0) {
            setSelectedGroupId(joined[0].id);
          } else {
            // Filter recommended groups not yet joined
            const notJoined = allPublic.filter((g) => !g.is_member).slice(0, 4);
            setRecommendedGroups(notJoined.length > 0 ? notJoined : allPublic.slice(0, 4));
          }
        }
      } catch (err) {
        console.warn('Error loading groups in AddToGroupDialog:', err);
      } finally {
        if (isMounted) setLoading(false);
      }
    }

    void loadGroups();

    return () => {
      isMounted = false;
    };
  }, [isOpen, user]);

  // Handle explicit 1-click Join without auto-posting (Step 1 -> Step 2 transition)
  const handleJoinGroup = async (group: Group) => {
    if (!user) return;
    setJoiningGroupId(group.id);
    try {
      await communityApi.joinGroup(group.id, user.id);
      toast.success(
        isHi
          ? `आप "${group.name}" समूह से जुड़ गए! अब अपना संदेश लिखकर साझा करें।`
          : `Joined "${group.name}"! You can now write a note and share.`
      );
      // Move this group into myGroups and select it for step 2 composer
      setMyGroups((prev) => [group, ...prev]);
      setSelectedGroupId(group.id);
      setRecommendedGroups((prev) => prev.filter((g) => g.id !== group.id));
    } catch (err) {
      console.error('Error joining group:', err);
      toast.error(isHi ? 'समूह में शामिल होने में विफल' : 'Failed to join group');
    } finally {
      setJoiningGroupId(null);
    }
  };

  // Handle explicit Share button click
  const handleShareToGroup = async () => {
    if (!user) {
      toast.error(isHi ? 'कृपया पहले लॉगिन करें' : 'Please sign in first');
      return;
    }
    if (!selectedGroupId) {
      toast.error(isHi ? 'कृपया एक समूह चुनें' : 'Please select a group');
      return;
    }

    setSubmitting(true);
    try {
      const defaultNote = isHi
        ? `जय श्री राम / जय श्री श्याम! यह भजन अवश्य सुनें: ${bhajan.titleHindi || bhajan.title}`
        : `Devotional Bhajan: ${bhajan.title}`;

      const content = postContent.trim() || defaultNote;

      await communityApi.createPost({
        group_id: selectedGroupId,
        author_id: user.id,
        type: 'bhajan_share',
        content,
        linked_bhajan_id: bhajan.id,
      });

      toast.success(
        isHi ? 'भजन समूह में सफलतापूर्वक साझा किया गया! 🙏' : 'Bhajan shared to group! 🙏'
      );
      setPostContent('');
      onClose();
    } catch (err) {
      console.error('Error posting to group:', err);
      toast.error(isHi ? 'समूह में साझा करने में विफल' : 'Failed to share to group');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-md bg-[#FFFDF8] dark:bg-[#140d08] border-[#E8D8C4] dark:border-stone-800 text-[#32251E] dark:text-[#FAF6EE] p-5 sm:p-6 rounded-2xl">
        <DialogHeader className="space-y-1 text-left">
          <div className="flex items-center gap-2 text-[#651317] dark:text-amber-400">
            <Users className="w-5 h-5" />
            <DialogTitle className="font-serif text-lg sm:text-xl font-bold">
              {isHi ? 'समूह में भजन साझा करें' : 'Share Bhajan to Group'}
            </DialogTitle>
          </div>
          <DialogDescription className="text-xs text-[#786252] dark:text-stone-400">
            {isHi
              ? 'इस पावन भजन को अपने सत्संग समूह के भक्तों के साथ साझा करें।'
              : 'Share this sacred bhajan with fellow devotees in your devotional group.'}
          </DialogDescription>
        </DialogHeader>

        {/* Not Logged In State */}
        {!user ? (
          <div className="space-y-4 py-4 text-center">
            <div className="mx-auto w-12 h-12 rounded-full bg-amber-100 dark:bg-amber-950/40 flex items-center justify-center text-[#651317] dark:text-amber-400">
              <LogIn className="w-6 h-6" />
            </div>
            <div className="space-y-1">
              <p className="text-sm font-bold text-[#3A2418] dark:text-amber-100">
                {isHi ? 'लॉगिन आवश्यक है' : 'Sign in Required'}
              </p>
              <p className="text-xs text-[#786252] dark:text-stone-400">
                {isHi
                  ? 'समूहों में भजन साझा करने के लिए कृपया अपने अकाउंट में लॉगिन करें।'
                  : 'Please sign in to your account to share bhajans with groups.'}
              </p>
            </div>
            <Button
              asChild
              className="w-full rounded-full bg-[#651317] hover:bg-[#80181D] text-white font-bold h-10"
            >
              <Link to="/auth/login">{isHi ? 'लॉगिन करें' : 'Sign In'}</Link>
            </Button>
          </div>
        ) : loading ? (
          <div className="py-12 flex flex-col items-center justify-center gap-2">
            <Loader2 className="w-7 h-7 animate-spin text-[#651317] dark:text-amber-400" />
            <span className="text-xs font-semibold text-[#786252] dark:text-stone-400">
              {isHi ? 'समूह लोड हो रहे हैं…' : 'Loading groups…'}
            </span>
          </div>
        ) : myGroups.length === 0 ? (
          /* STEP 1: Not a member yet -> Show Recommended Groups with Explicit Join Button */
          <div className="space-y-4 py-2">
            <div className="rounded-xl bg-amber-500/10 border border-amber-500/20 p-3 text-xs text-amber-900 dark:text-amber-200">
              <p className="font-semibold">
                {isHi
                  ? 'आप अभी किसी समूह के सदस्य नहीं हैं। नीचे दिए गए समूह में शामिल हों:'
                  : 'You have not joined any groups yet. Join a group below to start sharing:'}
              </p>
            </div>

            <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
              {recommendedGroups.map((grp) => (
                <div
                  key={grp.id}
                  className="flex items-center justify-between gap-3 p-3 rounded-xl border border-[#E8D8C4] dark:border-stone-800 bg-white dark:bg-[#1C140E] hover:border-amber-400 transition-colors"
                >
                  <div className="min-w-0 flex-1">
                    <p className="text-xs sm:text-sm font-bold text-[#3A2418] dark:text-amber-100 truncate">
                      {grp.name}
                    </p>
                    <p className="text-[11px] text-[#786252] dark:text-stone-400 truncate">
                      {grp.deity ? `${grp.deity} • ` : ''}
                      {grp.member_count || 1} {isHi ? 'भक्त' : 'members'}
                    </p>
                  </div>

                  <Button
                    type="button"
                    size="sm"
                    onClick={() => handleJoinGroup(grp)}
                    disabled={joiningGroupId === grp.id}
                    className="h-8 px-3 rounded-full bg-[#651317] hover:bg-[#80181D] text-white text-xs font-bold shrink-0 cursor-pointer"
                  >
                    {joiningGroupId === grp.id ? (
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    ) : (
                      <>
                        <Plus className="w-3.5 h-3.5 mr-1" />
                        <span>{isHi ? 'जॉइन करें' : 'Join'}</span>
                      </>
                    )}
                  </Button>
                </div>
              ))}
            </div>
          </div>
        ) : (
          /* STEP 2: Member of 1+ Groups -> Select Group, Write Note & Confirm Share */
          <div className="space-y-4 py-2">
            {/* Mini Bhajan Preview Card */}
            <div className="flex items-center gap-3 p-3 rounded-xl bg-amber-500/10 border border-[#E8D8C4] dark:border-stone-800">
              <div className="w-10 h-10 rounded-lg bg-[#651317] text-white flex items-center justify-center shrink-0">
                <Music2 className="w-5 h-5" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-xs sm:text-sm font-bold text-[#3A2418] dark:text-amber-100 truncate">
                  {bhajan.titleHindi || bhajan.title}
                </p>
                <p className="text-[11px] text-[#786252] dark:text-stone-400 truncate">
                  {bhajan.singerName || 'Traditional'}
                </p>
              </div>
            </div>

            {/* Select Group */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-[#543D2B] dark:text-stone-300">
                {isHi ? 'समूह चुनें (Select Group):' : 'Select Group:'}
              </label>
              <select
                value={selectedGroupId}
                onChange={(e) => setSelectedGroupId(e.target.value)}
                className="w-full h-10 px-3 rounded-xl bg-white dark:bg-stone-900 border border-[#E8D8C4] dark:border-stone-800 text-xs font-semibold text-[#3A2418] dark:text-stone-200 focus:outline-hidden focus:ring-2 focus:ring-[#651317]"
              >
                {myGroups.map((grp) => (
                  <option key={grp.id} value={grp.id}>
                    {grp.name} ({grp.member_count || 1} {isHi ? 'भक्त' : 'members'})
                  </option>
                ))}
              </select>
            </div>

            {/* Optional Devotional Message */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-[#543D2B] dark:text-stone-300">
                {isHi ? 'संदेश लिखें (वैकल्पिक):' : 'Message (Optional):'}
              </label>
              <Textarea
                value={postContent}
                onChange={(e) => setPostContent(e.target.value)}
                placeholder={
                  isHi
                    ? 'जैसे: जय श्री श्याम! यह प्यारा भजन अवश्य सुनें 🙏'
                    : 'Write a devotional note to your group…'
                }
                rows={3}
                className="rounded-xl border-[#E8D8C4] dark:border-stone-800 text-xs resize-none bg-white dark:bg-stone-900"
              />
            </div>

            {/* Actions */}
            <div className="flex items-center justify-end gap-2 pt-2">
              <Button
                type="button"
                variant="outline"
                onClick={onClose}
                disabled={submitting}
                className="rounded-full text-xs font-bold border-[#E8D8C4] dark:border-stone-800 h-9 cursor-pointer"
              >
                {isHi ? 'रद्द करें' : 'Cancel'}
              </Button>
              <Button
                type="button"
                onClick={handleShareToGroup}
                disabled={submitting || !selectedGroupId}
                className="rounded-full bg-[#651317] hover:bg-[#80181D] text-white text-xs font-bold h-9 px-4 shadow-sm cursor-pointer"
              >
                {submitting ? (
                  <Loader2 className="w-3.5 h-3.5 animate-spin mr-1" />
                ) : (
                  <Share2 className="w-3.5 h-3.5 mr-1" />
                )}
                <span>{isHi ? 'समूह में साझा करें' : 'Share to Group'}</span>
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
