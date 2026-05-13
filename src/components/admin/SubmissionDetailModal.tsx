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
import { CheckCircle2, XCircle, AlertTriangle, Loader2 } from 'lucide-react';
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
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto border-orange-900/30 bg-[#1e1108]">
        <DialogHeader>
          <DialogTitle className="text-xl text-foreground pr-8">{item.title}</DialogTitle>
          <DialogDescription className="text-muted-foreground">{item.title_hindi}</DialogDescription>
        </DialogHeader>

        <div className="space-y-4 mt-2">
          <div className="flex flex-wrap items-center gap-2 text-sm">
            <span className="text-muted-foreground">By</span>
            <SubmitterPopover userId={item.user_id} displayName={item.singer_name} />
            <span className="text-muted-foreground">•</span>
            <span className="text-muted-foreground">{new Date(item.created_at).toLocaleDateString()}</span>
            {item.language && (
              <>
                <span className="text-muted-foreground">•</span>
                <Badge variant="outline" className="text-xs border-orange-900/30">{item.language}</Badge>
              </>
            )}
            <Badge
              variant="outline"
              className="text-xs border-orange-900/30 uppercase"
            >
              {item.status}
            </Badge>
          </div>

          {videoId && (
            <div className="aspect-video rounded-lg overflow-hidden border border-orange-900/30">
              <iframe
                src={`https://www.youtube-nocookie.com/embed/${videoId}`}
                title={`Preview ${item.title}`}
                className="w-full h-full"
                sandbox="allow-scripts allow-same-origin allow-presentation"
                referrerPolicy="strict-origin-when-cross-origin"
                allow="autoplay; encrypted-media; picture-in-picture; fullscreen"
                allowFullScreen
              />
            </div>
          )}

          {item.lyrics_hindi && (
            <div className="rounded-lg border border-orange-900/20 bg-[#2a1a08] p-3 max-h-40 overflow-y-auto">
              <p className="text-xs font-medium text-muted-foreground mb-1">Lyrics Preview</p>
              <p className="text-sm text-foreground whitespace-pre-wrap leading-relaxed">
                {item.lyrics_hindi.slice(0, 500)}
                {item.lyrics_hindi.length > 500 && '...'}
              </p>
            </div>
          )}

          {item.youtube_url && !videoId && (
            <p className="text-sm text-muted-foreground">
              YouTube URL: <a href={item.youtube_url} target="_blank" rel="noopener noreferrer" className="text-orange-400 hover:underline">{item.youtube_url}</a>
            </p>
          )}

          {showReasonForm && (
            <div className="rounded-lg border border-orange-900/30 bg-[#2a1a08] p-4 space-y-3">
              <p className="text-sm font-medium text-foreground">
                {activeAction === 'rejected' ? 'Rejection Reason' : 'Changes Needed'}
              </p>
              <Select value={selectedTemplate} onValueChange={handleTemplateChange}>
                <SelectTrigger className="border-orange-900/30 bg-[#1e1108]">
                  <SelectValue placeholder="Select a reason template..." />
                </SelectTrigger>
                <SelectContent>
                  {REJECTION_TEMPLATES.map((t) => (
                    <SelectItem key={t} value={t}>{t}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Textarea
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                placeholder="Type or edit the reason..."
                className="border-orange-900/30 bg-[#1e1108] min-h-[80px]"
              />
              <div className="flex gap-2">
                <Button
                  disabled={!reason.trim() || processing}
                  onClick={() => handleRejectOrChanges(activeAction!)}
                  variant={activeAction === 'rejected' ? 'destructive' : 'secondary'}
                  className="flex-1"
                >
                  {processing && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                  {activeAction === 'rejected' ? 'Confirm Reject' : 'Confirm Request Changes'}
                </Button>
                <Button variant="outline" onClick={() => setActiveAction(null)} className="border-orange-900/30">
                  Cancel
                </Button>
              </div>
            </div>
          )}

          {!showReasonForm && (
            <div className="flex flex-wrap gap-2 pt-2 border-t border-orange-900/20">
              <Button
                disabled={processing}
                onClick={handleApprove}
                className="bg-green-600 hover:bg-green-700 text-white flex-1 sm:flex-none"
              >
                {processing && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                <CheckCircle2 className="w-4 h-4 mr-2" />
                Approve
              </Button>
              <Button
                variant="destructive"
                disabled={processing}
                onClick={() => setActiveAction('rejected')}
                className="flex-1 sm:flex-none"
              >
                <XCircle className="w-4 h-4 mr-2" />
                Reject
              </Button>
              <Button
                variant="secondary"
                disabled={processing}
                onClick={() => setActiveAction('changes_requested')}
                className="flex-1 sm:flex-none"
              >
                <AlertTriangle className="w-4 h-4 mr-2" />
                Request Changes
              </Button>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
