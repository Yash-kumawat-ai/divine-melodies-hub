import { useEffect, useState } from 'react';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Loader2, User2 } from 'lucide-react';
import { getSubmitterProfile, type SubmitterProfile } from '@/lib/supabaseQueries';

interface SubmitterPopoverProps {
  userId: string;
  displayName: string;
}

export default function SubmitterPopover({ userId, displayName }: SubmitterPopoverProps) {
  const [open, setOpen] = useState(false);
  const [profile, setProfile] = useState<SubmitterProfile | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!open || profile) return;
    let cancelled = false;
    setLoading(true);
    getSubmitterProfile(userId).then(({ data }) => {
      if (!cancelled) {
        setProfile(data);
        setLoading(false);
      }
    });
    return () => { cancelled = true; };
  }, [open, userId, profile]);

  const approvalRate =
    profile && profile.totalUploads > 0
      ? Math.round((profile.approvedCount / profile.totalUploads) * 100)
      : 0;

  const accountAge = profile
    ? (() => {
        const days = Math.floor((Date.now() - new Date(profile.createdAt).getTime()) / 86400000);
        if (days < 1) return 'Today';
        if (days === 1) return '1 day';
        if (days < 30) return `${days} days`;
        const months = Math.floor(days / 30);
        return months === 1 ? '1 month' : `${months} months`;
      })()
    : '';

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button
          type="button"
          className="text-sm text-orange-400 hover:underline cursor-pointer font-medium"
        >
          {displayName}
        </button>
      </PopoverTrigger>
      <PopoverContent side="bottom" align="start" className="w-64 p-0 border-orange-900/30 bg-[#2a1a08]">
        {loading ? (
          <div className="flex justify-center py-6">
            <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />
          </div>
        ) : profile ? (
          <div className="p-3 space-y-2">
            <div className="flex items-center gap-2">
              <User2 className="w-4 h-4 text-orange-400" />
              <span className="font-semibold text-sm text-foreground">{profile.name}</span>
            </div>
            <p className="text-xs text-muted-foreground">{profile.email}</p>
            <div className="grid grid-cols-3 gap-2 pt-2 border-t border-orange-900/20">
              <div className="text-center">
                <p className="text-lg font-bold text-foreground tabular-nums">{profile.totalUploads}</p>
                <p className="text-[10px] text-muted-foreground">Uploads</p>
              </div>
              <div className="text-center">
                <p className="text-lg font-bold text-green-400 tabular-nums">{approvalRate}%</p>
                <p className="text-[10px] text-muted-foreground">Approved</p>
              </div>
              <div className="text-center">
                <p className="text-lg font-bold text-foreground">{accountAge}</p>
                <p className="text-[10px] text-muted-foreground">Account</p>
              </div>
            </div>
          </div>
        ) : (
          <p className="px-3 py-4 text-sm text-muted-foreground text-center">No profile found</p>
        )}
      </PopoverContent>
    </Popover>
  );
}
