import { useEffect, useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { CheckCircle2, XCircle, AlertTriangle, Loader2, FileText, ExternalLink, Save } from 'lucide-react';
import SubmitterPopover from './SubmitterPopover';
import { deities } from '@/data/bhajans';
import { extractYouTubeVideoId } from '@/lib/youtubeSearch';
import { generateBhajanSlug } from '@/lib/slugUtils';
import { bhajanMatchesQuery } from '@/lib/searchAlgorithm';
import { getContentUrl } from '@/lib/contentUrls';
import type { AdminBhajanContentUpdate } from '@/lib/supabaseQueries';

export interface QueueItem {
  id: string;
  user_id: string;
  title: string;
  title_hindi: string;
  singer_name: string;
  composer_name?: string;
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
  search_aliases?: string[] | string;
  slug?: string;
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

const CONTENT_TYPES = ['bhajan', 'aarti', 'chalisa', 'katha', 'other'] as const;

interface SubmissionDetailModalProps {
  item: QueueItem | null;
  open: boolean;
  onClose: () => void;
  onAction: (id: string, status: 'approved' | 'rejected' | 'changes_requested', reason?: string) => Promise<void>;
  onSave: (id: string, fields: AdminBhajanContentUpdate) => Promise<boolean>;
  processing: boolean;
}

export default function SubmissionDetailModal({
  item,
  open,
  onClose,
  onAction,
  onSave,
  processing,
}: SubmissionDetailModalProps) {
  const [reason, setReason] = useState('');
  const [selectedTemplate, setSelectedTemplate] = useState('');
  const [activeAction, setActiveAction] = useState<'rejected' | 'changes_requested' | null>(null);
  const [saving, setSaving] = useState(false);
  const [title, setTitle] = useState('');
  const [titleHindi, setTitleHindi] = useState('');
  const [lyricsHindi, setLyricsHindi] = useState('');
  const [youtubeUrl, setYoutubeUrl] = useState('');
  const [singerName, setSingerName] = useState('');
  const [composerName, setComposerName] = useState('');
  const [deityId, setDeityId] = useState<string>('');
  const [contentType, setContentType] = useState<string>('bhajan');
  const [searchAliases, setSearchAliases] = useState('');
  const [testSearchQuery, setTestSearchQuery] = useState('');
  const [actionError, setActionError] = useState('');

  function sanitizeAliases(input: string): string[] {
    return input
      .split(',')
      .map((s) => s.replace(/\|/g, '').replace(/https?:\/\/\S+/g, '').trim())
      .filter((s) => s.length > 0 && s.length <= 48)
      .slice(0, 8);
  }

  useEffect(() => {
    if (!item) return;
    setTitle(item.title || '');
    setTitleHindi(item.title_hindi || '');
    setLyricsHindi(item.lyrics_hindi || '');
    setYoutubeUrl(item.youtube_url || '');
    setSingerName(item.singer_name || '');
    setComposerName(item.composer_name || '');
    setDeityId(item.deity_id != null ? String(item.deity_id) : '');
    setContentType(item.content_type || 'bhajan');
    setSearchAliases(
      Array.isArray(item.search_aliases)
        ? item.search_aliases.join(', ')
        : String(item.search_aliases || '')
    );
    setTestSearchQuery('');
    setActionError('');
    setReason('');
    setSelectedTemplate('');
    setActiveAction(null);
  }, [item]);

  if (!item) return null;

  const videoId = extractYouTubeVideoId(youtubeUrl);

  const handleTemplateChange = (value: string) => {
    setSelectedTemplate(value);
    if (value !== 'Custom reason...') {
      setReason(value);
    } else {
      setReason('');
    }
  };

  const handleApprove = async () => {
    setActionError('');
    const cType = (contentType || 'bhajan').toLowerCase();
    const singer = singerName.trim();
    const invalidSingers = ['', 'none', 'null', 'undefined', 'na', 'n/a', 'unknown'];
    if (['bhajan', 'aarti', 'chalisa'].includes(cType) && invalidSingers.includes(singer.toLowerCase())) {
      setActionError('Cannot approve: A valid singer/artist name is required for bhajans, aartis, and chalisas.');
      return;
    }

    try {
      const cleanAliases = sanitizeAliases(searchAliases);
      // Save content updates first (including auto-slug and search aliases)
      await onSave(item.id, {
        title,
        title_hindi: titleHindi,
        lyrics_hindi: lyricsHindi,
        youtube_url: youtubeUrl,
        singer_name: singerName,
        composer_name: composerName,
        deity_id: deityId ? Number(deityId) : null,
        content_type: contentType,
        slug: item.slug || generateBhajanSlug(title || titleHindi),
        search_aliases: cleanAliases,
      });
      await onAction(item.id, 'approved');
      resetAndClose();
    } catch (err: any) {
      setActionError(err?.message || 'Failed to approve submission.');
    }
  };

  const handleRejectOrChanges = async (status: 'rejected' | 'changes_requested') => {
    setActionError('');
    if (!reason.trim()) {
      setActiveAction(status);
      return;
    }
    try {
      await onAction(item.id, status, reason.trim());
      resetAndClose();
    } catch (err: any) {
      setActionError(err?.message || 'Failed to process action.');
    }
  };

  const resetAndClose = () => {
    setReason('');
    setSelectedTemplate('');
    setActiveAction(null);
    setActionError('');
    onClose();
  };

  const handleSave = async () => {
    setSaving(true);
    setActionError('');
    try {
      const cleanAliases = sanitizeAliases(searchAliases);
      await onSave(item.id, {
        title,
        title_hindi: titleHindi,
        lyrics_hindi: lyricsHindi,
        youtube_url: youtubeUrl,
        singer_name: singerName,
        composer_name: composerName,
        deity_id: deityId ? Number(deityId) : null,
        content_type: contentType,
        slug: item.slug || generateBhajanSlug(title || titleHindi),
        search_aliases: cleanAliases,
      });
    } catch (err: any) {
      setActionError(err?.message || 'Failed to save content.');
    } finally {
      setSaving(false);
    }
  };

  const showReasonForm = activeAction !== null;
  const busy = processing || saving;

  return (
    <Dialog open={open} onOpenChange={(v) => !v && resetAndClose()}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto border-2 border-[#E8D8C4] dark:border-zinc-800 bg-white dark:bg-[#1E1710] text-[#32251E] dark:text-[#FFFDF8] rounded-3xl shadow-xl p-6 sm:p-8">
        <DialogHeader className="border-b border-[#EFE4D7] dark:border-zinc-800 pb-4">
          <DialogTitle className="font-serif text-2xl font-bold text-[#32251E] dark:text-[#FFFDF8] pr-6">
            {titleHindi || title || item.title}
          </DialogTitle>
          <DialogDescription className="text-xs sm:text-sm text-[#7A6B60] dark:text-[#D4C5B9] font-medium mt-0.5">
            Edit content, then approve or reject. Saving does not change status.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 mt-2">
          <div className="flex flex-wrap items-center gap-2 text-xs">
            <span className="text-[#7A6B60] dark:text-[#D4C5B9] font-medium">By</span>
            <SubmitterPopover userId={item.user_id} displayName={item.singer_name} />
            <span className="text-[#7A6B60] dark:text-[#D4C5B9]">•</span>
            <span className="text-[#7A6B60] dark:text-[#D4C5B9] font-medium">{new Date(item.created_at).toLocaleDateString()}</span>
            <Badge
              variant="outline"
              className="text-[10px] uppercase font-bold border-[#EFE4D7] dark:border-zinc-700 bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300"
            >
              {item.status}
            </Badge>
          </div>

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

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="text-xs font-bold">Title</label>
              <Input value={title} onChange={(e) => setTitle(e.target.value)} className="h-9 text-sm rounded-xl" />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-bold">शीर्षक</label>
              <Input value={titleHindi} onChange={(e) => setTitleHindi(e.target.value)} className="h-9 text-sm rounded-xl" />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-bold">Singer</label>
              <Input value={singerName} onChange={(e) => setSingerName(e.target.value)} className="h-9 text-sm rounded-xl" />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-bold">Composer</label>
              <Input value={composerName} onChange={(e) => setComposerName(e.target.value)} className="h-9 text-sm rounded-xl" />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-bold">Deity</label>
              <Select modal={false} value={deityId || 'none'} onValueChange={(v) => setDeityId(v === 'none' ? '' : v)}>
                <SelectTrigger className="h-9 text-sm rounded-xl">
                  <SelectValue placeholder="Select deity" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">None</SelectItem>
                  {deities.map((d) => (
                    <SelectItem key={d.id} value={String(d.id)}>
                      {d.nameHindi} ({d.name})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1">
              <label className="text-xs font-bold">Content type</label>
              <Select modal={false} value={contentType} onValueChange={setContentType}>
                <SelectTrigger className="h-9 text-sm rounded-xl">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {CONTENT_TYPES.map((t) => (
                    <SelectItem key={t} value={t}>
                      {t}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1 sm:col-span-2">
              <label className="text-xs font-bold">YouTube URL</label>
              <Input
                value={youtubeUrl}
                onChange={(e) => setYoutubeUrl(e.target.value)}
                placeholder="https://www.youtube.com/watch?v=..."
                className="h-9 text-sm rounded-xl"
              />
            </div>
            <div className="space-y-1 sm:col-span-2">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold">Search Aliases / Alternative Spellings</label>
                <span className="text-[10px] text-muted-foreground">Max 8 aliases, comma-separated</span>
              </div>
              <Input
                value={searchAliases}
                onChange={(e) => setSearchAliases(e.target.value)}
                placeholder="e.g. baglamukhi arti, ma baglamukhi aarti, pitambara mata"
                className="h-9 text-sm rounded-xl"
              />
            </div>
            {item.slug && (
              <div className="space-y-1 sm:col-span-2">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-[#7A6B60] dark:text-[#D4C5B9]">Canonical Permanent Slug</label>
                  <span className="text-[10px] text-muted-foreground">URL Path</span>
                </div>
                <Input
                  value={getContentUrl({ slug: item.slug, contentType: selectedContentType || item.content_type, subType: selectedSubType || item.sub_type })}
                  disabled
                  className="h-8 text-xs rounded-xl bg-zinc-100 dark:bg-zinc-800 font-mono text-zinc-600 dark:text-zinc-400"
                />
              </div>
            )}
          </div>

          {actionError && (
            <div className="p-3 rounded-xl bg-red-50 dark:bg-red-950/40 border border-red-300 dark:border-red-800 text-red-700 dark:text-red-300 text-xs font-bold flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 shrink-0 text-red-600 dark:text-red-400" />
              <span>{actionError}</span>
            </div>
          )}

          {/* Live Search Match Tester for Quality Control */}
          <div className="p-3.5 rounded-2xl bg-[#FAF2E8]/60 dark:bg-zinc-900/60 border border-[#E8D8C4] dark:border-zinc-800 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-[#6A2C2A] dark:text-[#E8B15C] flex items-center gap-1.5">
                <span>🔍 Live Search Match Preview</span>
              </span>
              <span className="text-[10px] text-[#7A6B60] dark:text-stone-400">Test search discoverability</span>
            </div>
            <Input
              value={testSearchQuery}
              onChange={(e) => setTestSearchQuery(e.target.value)}
              placeholder="Type a test query (e.g. baglamukhi aarti, maa arti)..."
              className="h-8 text-xs rounded-xl bg-white dark:bg-[#1E1710]"
            />
            {testSearchQuery.trim() && (() => {
              const selectedDeity = deities.find((d) => String(d.id) === deityId);
              const testCandidate = {
                title,
                titleHindi,
                singerName,
                composerName,
                search_aliases: searchAliases.split(',').map((s) => s.trim()).filter(Boolean),
                deityName: selectedDeity ? selectedDeity.name : '',
                lyricsHindi,
                contentType,
              };
              const isMatch = bhajanMatchesQuery(testCandidate, testSearchQuery);
              return (
                <div className="pt-0.5">
                  {isMatch ? (
                    <p className="text-[11px] font-bold text-emerald-700 dark:text-emerald-400 flex items-center gap-1.5">
                      <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
                      <span>Match Confirmed! Users searching "{testSearchQuery}" will discover this content.</span>
                    </p>
                  ) : (
                    <p className="text-[11px] font-bold text-amber-700 dark:text-amber-400 flex items-center gap-1.5">
                      <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
                      <span>Not matching. Add "{testSearchQuery}" into Title or Search Aliases field above.</span>
                    </p>
                  )}
                </div>
              );
            })()}
          </div>

          {videoId && (
            <div className="aspect-video rounded-2xl overflow-hidden border-2 border-[#E8D8C4] dark:border-zinc-800 shadow-sm">
              <iframe
                src={`https://www.youtube-nocookie.com/embed/${videoId}`}
                title={`Preview ${title}`}
                className="w-full h-full"
                referrerPolicy="strict-origin-when-cross-origin"
                allow="autoplay; encrypted-media; picture-in-picture"
                allowFullScreen
              />
            </div>
          )}

          <div className="space-y-1.5">
            <p className="text-xs font-bold text-[#6A2C2A] dark:text-[#E8B15C] flex items-center gap-1.5">
              <FileText className="w-3.5 h-3.5" />
              <span>Lyrics (Hindi)</span>
            </p>
            <Textarea
              value={lyricsHindi}
              onChange={(e) => setLyricsHindi(e.target.value)}
              className="min-h-[140px] rounded-xl text-xs font-medium whitespace-pre-wrap"
            />
          </div>

          {youtubeUrl && !videoId && (
            <p className="text-xs text-[#7A6B60] dark:text-[#D4C5B9] font-medium">
              YouTube Link:{' '}
              <a href={youtubeUrl} target="_blank" rel="noopener noreferrer" className="text-[#7A2D28] dark:text-[#E8B15C] font-bold underline">
                {youtubeUrl}
              </a>
            </p>
          )}

          <Button
            type="button"
            disabled={busy || !title.trim()}
            onClick={handleSave}
            variant="outline"
            className="w-full rounded-xl font-bold text-xs h-10 border-[#7A2D28] text-[#7A2D28]"
          >
            {saving && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
            <Save className="w-4 h-4 mr-1.5" />
            Save content
          </Button>

          {showReasonForm && (
            <div className="rounded-2xl border-2 border-[#E8D8C4] dark:border-zinc-800 bg-[#FAF2E8]/70 dark:bg-amber-950/20 p-4 space-y-3 shadow-sm animate-in fade-in-50">
              <p className="text-xs font-bold text-[#32251E] dark:text-[#FFFDF8]">
                {activeAction === 'rejected' ? 'Select Rejection Reason' : 'Specify Required Changes'}
              </p>
              <Select modal={false} value={selectedTemplate} onValueChange={handleTemplateChange}>
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
                  disabled={!reason.trim() || busy}
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

          {!showReasonForm && (
            <div className="flex flex-wrap gap-2.5 pt-3 border-t border-[#EFE4D7] dark:border-zinc-800">
              {item.status !== 'approved' && (
                <Button
                  disabled={busy}
                  onClick={handleApprove}
                  className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl flex-1 sm:flex-none px-5 h-10 shadow-sm"
                >
                  {processing && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                  <CheckCircle2 className="w-4 h-4 mr-1.5" />
                  Approve & Publish
                </Button>
              )}
              <Button
                variant="destructive"
                disabled={busy}
                onClick={() => setActiveAction('rejected')}
                className="font-bold rounded-xl flex-1 sm:flex-none px-5 h-10 shadow-sm"
              >
                <XCircle className="w-4 h-4 mr-1.5" />
                Reject
              </Button>
              <Button
                variant="secondary"
                disabled={busy}
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
