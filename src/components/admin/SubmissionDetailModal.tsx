import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { CheckCircle2, XCircle, AlertTriangle, Loader2, FileText, ExternalLink } from 'lucide-react';
import SubmitterPopover from './SubmitterPopover';

export interface QueueItem {
  id: string;
  user_id: string;
  title: string;
  title_hindi: string;
  singer_name: string;
  language?: string;
  deity_id?: number;
  status: string;
  created_at: string;
  youtube_url?: string;
  admin_notes?: string;
  rejection_reason?: string;
  request_changes_notes?: string;
  lyrics_hindi?: string;
  content_type?: string;
  is_duplicate_flagged?: boolean;
  duplicate_reference_title?: string;
  user_claimed_different?: boolean;
}

const REJECTION_TEMPLATES = [
  'Inappropriate content',
  'Wrong language tag',
  'Duplicate submission',
  'Poor audio quality',
  'Lyrics mismatch',
  'Missing or broken YouTube link',
  'Custom reason...',
] as const;

interface SubmissionDetailModalProps {
  item: QueueItem | null;
  open: boolean;
  onClose: () => void;
  onAction: (id: string, status: 'approved' | 'rejected' | 'changes_requested', reason?: string) => Promise<void>;
  processing: boolean;
}

const extractYouTubeVideoId = (url: string) => {
  const match = url.match(/(?:youtube\.com\/(?:watch\?v=|embed\/|shorts\/)|youtu\.be\/)([^&\n?#]+)/);
  return match?.[1] || null;
};

export default function SubmissionDetailModal({
  item,
  open,
  onClose,
  onAction,
  processing,
}: SubmissionDetailModalProps) {
  const [reason, setReason] = useState('');
  const [selectedTemplate, setSelectedTemplate] = useState('');
  const [activeAction, setActiveAction] = useState<'rejected' | 'changes_requested' | null>(null);

  if (!item) return null;

  const videoId = item.youtube_url ? extractYouTubeVideoId(item.youtube_url) : null;

  const handleTemplateChange = (value: string) => {
    setSelectedTemplate(value);
    if (value !== 'Custom reason...') {
      setReason(value);
    } else {
      setReason('');
    }
  };

  const handleApprove = async () => {
    await onAction(item.id, 'approved');
    resetAndClose();
  };

  const handleRejectOrChanges = async (status: 'rejected' | 'changes_requested') => {
    if (!reason.trim()) {
      setActiveAction(status);
      return;
    }
    await onAction(item.id, status, reason.trim());
    resetAndClose();
  };

  const resetAndClose = () => {
    setReason('');
    setSelectedTemplate('');
    setActiveAction(null);
    onClose();
  };

  const showReasonForm = activeAction !== null;

  return (
    <Dialog open={open} onOpenChange={(v) => !v && resetAndClose()}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto border-2 border-[#E8D8C4] dark:border-zinc-800 bg-white dark:bg-[#1E1710] text-[#32251E] dark:text-[#FFFDF8] rounded-3xl shadow-xl p-6 sm:p-8">
        <DialogHeader className="border-b border-[#EFE4D7] dark:border-zinc-800 pb-4">
          <DialogTitle className="font-serif text-2xl font-bold text-[#32251E] dark:text-[#FFFDF8] pr-6">
            {item.title_hindi || item.title}
          </DialogTitle>
          {item.title && item.title !== item.title_hindi && (
            <DialogDescription className="text-xs sm:text-sm text-[#7A6B60] dark:text-[#D4C5B9] font-medium mt-0.5">
              {item.title}
            </DialogDescription>
          )}
        </DialogHeader>

        <div className="space-y-4 mt-2">
          {/* Metadata Badges Bar */}
          <div className="flex flex-wrap items-center gap-2 text-xs">
            <span className="text-[#7A6B60] dark:text-[#D4C5B9] font-medium">By</span>
            <SubmitterPopover userId={item.user_id} displayName={item.singer_name} />
            <span className="text-[#7A6B60] dark:text-[#D4C5B9]">•</span>
            <span className="text-[#7A6B60] dark:text-[#D4C5B9] font-medium">{new Date(item.created_at).toLocaleDateString()}</span>
            {item.content_type && (
              <>
                <span className="text-[#7A6B60] dark:text-[#D4C5B9]">•</span>
                <Badge variant="outline" className="text-[10px] uppercase font-bold border-[#EFE4D7] dark:border-amber-900/40 bg-[#FAF2E8] dark:bg-amber-950/40 text-[#7A2D28] dark:text-[#E8B15C]">
                  {item.content_type}
                </Badge>
              </>
            )}
            <Badge
              variant="outline"
              className="text-[10px] uppercase font-bold border-[#EFE4D7] dark:border-zinc-700 bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300"
            >
              {item.status}
            </Badge>
          </div>

          {/* Admin Duplicate Alert & Comparison Card */}
          {(() => {
            const isDuplicateFlagged = Boolean(item.is_duplicate_flagged || item.duplicate_reference_title || item.admin_notes?.includes('[DUPLICATE_CHECK]'));
            const userClaimedDifferent = Boolean(item.user_claimed_different || item.admin_notes?.includes('User Claimed Different: true'));
            const matchedReferenceTitle = item.duplicate_reference_title || item.admin_notes?.match(/Matched: ([^|]+)/)?.[1]?.trim() || item.title;

            if (!isDuplicateFlagged) return null;

            return (
              <div className="p-4 rounded-2xl bg-amber-50 dark:bg-amber-950/40 border-2 border-amber-300 dark:border-amber-800 space-y-3 shadow-xs">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-amber-900 dark:text-amber-200 flex items-center gap-1.5">
                    <AlertTriangle className="w-4 h-4 text-amber-600 dark:text-amber-400" />
                    <span>Duplicate Check Flagged</span>
                  </span>
                  {userClaimedDifferent && (
                    <Badge variant="outline" className="text-[10px] font-bold border-green-400 text-green-700 dark:text-green-300 bg-green-50 dark:bg-green-950/40">
                      User marked as Different Version
                    </Badge>
                  )}
                </div>
                <p className="text-xs text-amber-800 dark:text-amber-300 leading-relaxed">
                  Matched Reference: <strong className="text-amber-950 dark:text-amber-100">{matchedReferenceTitle}</strong>
                </p>
                <div className="pt-1">
                  <a
                    href={`/search?q=${encodeURIComponent(matchedReferenceTitle)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs transition-colors shadow-sm"
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                    <span>Compare Existing Content (Opens in New Tab)</span>
                  </a>
                </div>
              </div>
            );
          })()}

          {/* YouTube Video Embedded Preview */}
          {videoId && (
            <div className="aspect-video rounded-2xl overflow-hidden border-2 border-[#E8D8C4] dark:border-zinc-800 shadow-sm">
              <iframe
                src={`https://www.youtube-nocookie.com/embed/${videoId}`}
                title={`Preview ${item.title}`}
                className="w-full h-full"
                referrerPolicy="strict-origin-when-cross-origin"
                allow="autoplay; encrypted-media; picture-in-picture"
                allowFullScreen
              />
            </div>
          )}

          {/* Lyrics Preview */}
          {item.lyrics_hindi && (
            <div className="rounded-2xl border-2 border-[#E8D8C4] dark:border-zinc-800 bg-[#FCF8F2] dark:bg-[#2A1F14] p-4 max-h-48 overflow-y-auto space-y-1.5 shadow-sm">
              <p className="text-xs font-bold text-[#6A2C2A] dark:text-[#E8B15C] flex items-center gap-1.5">
                <FileText className="w-3.5 h-3.5" />
                <span>Submitted Lyrics Preview</span>
              </p>
              <p className="text-xs text-[#32251E] dark:text-[#FFFDF8] whitespace-pre-wrap leading-relaxed font-sans">
                {item.lyrics_hindi}
              </p>
            </div>
          )}

          {item.youtube_url && !videoId && (
            <p className="text-xs text-[#7A6B60] dark:text-[#D4C5B9] font-medium">
              YouTube Link: <a href={item.youtube_url} target="_blank" rel="noopener noreferrer" className="text-[#7A2D28] dark:text-[#E8B15C] font-bold underline">{item.youtube_url}</a>
            </p>
          )}

          {/* Rejection / Request Changes Form */}
          {showReasonForm && (
            <div className="rounded-2xl border-2 border-[#E8D8C4] dark:border-zinc-800 bg-[#FAF2E8]/70 dark:bg-amber-950/20 p-4 space-y-3 shadow-sm animate-in fade-in-50">
              <p className="text-xs font-bold text-[#32251E] dark:text-[#FFFDF8]">
                {activeAction === 'rejected' ? 'Select Rejection Reason' : 'Specify Required Changes'}
              </p>
              <Select value={selectedTemplate} onValueChange={handleTemplateChange}>
                <SelectTrigger className="border-[#D8C9B9] dark:border-zinc-700 bg-white dark:bg-[#2A1F14] text-[#32251E] dark:text-[#FFFDF8] h-10 text-xs font-medium rounded-xl">
                  <SelectValue placeholder="Select reason template..." />
                </SelectTrigger>
                <SelectContent className="bg-white dark:bg-[#1E1710] border-[#E8D8C4] dark:border-zinc-800">
                  {REJECTION_TEMPLATES.map((t) => (
                    <SelectItem key={t} value={t}>{t}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Textarea
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                placeholder="Type or edit the reason details..."
                className="border-[#D8C9B9] dark:border-zinc-700 bg-white dark:bg-[#2A1F14] text-[#32251E] dark:text-[#FFFDF8] min-h-[80px] rounded-xl text-xs font-medium"
              />
              <div className="flex gap-2 pt-1">
                <Button
                  disabled={!reason.trim() || processing}
                  onClick={() => handleRejectOrChanges(activeAction!)}
                  variant={activeAction === 'rejected' ? 'destructive' : 'secondary'}
                  className="flex-1 rounded-xl font-bold text-xs h-10"
                >
                  {processing && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                  {activeAction === 'rejected' ? 'Confirm Reject' : 'Confirm Request Changes'}
                </Button>
                <Button variant="outline" onClick={() => setActiveAction(null)} className="rounded-xl border-[#EFE4D7] text-xs font-bold px-4 h-10">
                  Cancel
                </Button>
              </div>
            </div>
          )}

          {/* Main Action Buttons */}
          {!showReasonForm && (
            <div className="flex flex-wrap gap-2.5 pt-3 border-t border-[#EFE4D7] dark:border-zinc-800">
              <Button
                disabled={processing}
                onClick={handleApprove}
                className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl flex-1 sm:flex-none px-5 h-10 shadow-sm"
              >
                {processing && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                <CheckCircle2 className="w-4 h-4 mr-1.5" />
                Approve & Publish
              </Button>
              <Button
                variant="destructive"
                disabled={processing}
                onClick={() => setActiveAction('rejected')}
                className="font-bold rounded-xl flex-1 sm:flex-none px-5 h-10 shadow-sm"
              >
                <XCircle className="w-4 h-4 mr-1.5" />
                Reject
              </Button>
              <Button
                variant="secondary"
                disabled={processing}
                onClick={() => setActiveAction('changes_requested')}
                className="font-bold rounded-xl flex-1 sm:flex-none px-5 h-10 shadow-sm border border-[#EFE4D7] dark:border-zinc-700"
              >
                <AlertTriangle className="w-4 h-4 mr-1.5 text-amber-500" />
                Request Changes
              </Button>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
