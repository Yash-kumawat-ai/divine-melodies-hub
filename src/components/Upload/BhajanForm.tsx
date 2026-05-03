import { useState, useEffect, useMemo } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { deities, bhajans, Bhajan as StaticBhajan } from '@/data/bhajans';
import { Loader2, Check, ChevronLeft, User, CheckCircle2, AlertTriangle } from 'lucide-react';

interface BhajanFormProps {
  lyrics: string;
  imageUrl?: string;
  onSuccess?: () => void;
  onBack?: () => void;
  deityId?: number;
  deityName?: string;
}

interface DuplicateBhajan {
  bhajan: StaticBhajan;
  similarity: number;
}

export default function BhajanForm({ lyrics, imageUrl, onSuccess, onBack, deityId: initialDeityId, deityName: initialDeityName }: BhajanFormProps) {
  const { user, profile } = useAuth();
  const [title, setTitle] = useState('');
  const [titleHindi, setTitleHindi] = useState('');
  const [deityId, setDeityId] = useState(initialDeityId?.toString() || '1');
  const [deityName, setDeityName] = useState(initialDeityName || '');
  const [singerName, setSingerName] = useState('');
  const [composerName, setComposerName] = useState('');
  const [youtubeUrl, setYoutubeUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');
  const [extractingMetadata, setExtractingMetadata] = useState(false);
  const [metadataError, setMetadataError] = useState('');
  const [duplicates, setDuplicates] = useState<DuplicateBhajan[]>([]);
  const [checkedDuplicates, setCheckedDuplicates] = useState(false);

  // Levenshtein distance for duplicate detection
  const levenshteinSimilarity = (str1: string, str2: string): number => {
    const s1 = str1.toLowerCase().trim();
    const s2 = str2.toLowerCase().trim();
    if (s1 === s2) return 100;
    const longer = s1.length > s2.length ? s1 : s2;
    if (longer.length === 0) return 100;
    const track = Array(s2.length + 1).fill(null).map(() => Array(s1.length + 1).fill(null));
    for (let i = 0; i <= s1.length; i++) track[0][i] = i;
    for (let j = 0; j <= s2.length; j++) track[j][0] = j;
    for (let j = 1; j <= s2.length; j++) {
      for (let i = 1; i <= s1.length; i++) {
        const indicator = s1[i - 1] === s2[j - 1] ? 0 : 1;
        track[j][i] = Math.min(track[j][i - 1] + 1, track[j - 1][i] + 1, track[j - 1][i - 1] + indicator);
      }
    }
    const distance = track[s2.length][s1.length];
    return Math.max(0, ((longer.length - distance) / longer.length) * 100);
  };

  // Check for duplicates when title changes
  useEffect(() => {
    if (!title.trim() || title.length < 3) {
      setDuplicates([]);
      setCheckedDuplicates(false);
      return;
    }

    const found: DuplicateBhajan[] = [];
    const titleLower = title.toLowerCase();

    for (const b of bhajans) {
      const similarity = levenshteinSimilarity(titleLower, b.title);
      if (similarity >= 70) {
        found.push({ bhajan: b, similarity });
      } else if (b.titleHindi.includes(title) || title.includes(b.titleHindi)) {
        found.push({ bhajan: b, similarity: 85 });
      }
      if (found.length >= 3) break;
    }

    setDuplicates(found);
    setCheckedDuplicates(true);
  }, [title]);

  const sanitizeText = (value: string) => value.replace(/[<>]/g, '').trim();

  const isValidYouTubeUrl = (url: string) => {
    if (!url) return true;
    return /^(https?:\/\/)?(www\.)?(youtube\.com|youtu\.be)\/.+/i.test(url.trim());
  };

  // Auto-populate singer name with user profile name
  useEffect(() => {
    if (profile?.name && !singerName) {
      setSingerName(profile.name);
    }
  }, [profile]);

  // Extract YouTube metadata when URL is provided
  const handleYouTubeUrlChange = async (url: string) => {
    setYoutubeUrl(url);
    setMetadataError('');

    // Validate if it's a YouTube URL
    if (!url.includes('youtube.com') && !url.includes('youtu.be')) {
      return;
    }

    setExtractingMetadata(true);
    try {
      // Try direct oEmbed API call (works without authentication)
      const videoId = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&\n?#]+)/)?.[1];
      if (!videoId) {
        setExtractingMetadata(false);
        return;
      }

      const oembedUrl = `https://www.youtube.com/oembed?url=https://www.youtube.com/watch?v=${videoId}&format=json`;
      const response = await fetch(oembedUrl);
      
      if (response.ok) {
        const data = await response.json();
        const fullTitle = data.title || '';
        let extractedTitle = fullTitle;
        let extractedArtist = data.author_name || '';

        // Try to split title by common separators
        const separators = [' - ', ' | ', ' by '];
        for (const sep of separators) {
          if (fullTitle.includes(sep)) {
            const parts = fullTitle.split(sep);
            if (parts.length === 2) {
              extractedTitle = parts[0].trim();
              if (!extractedArtist) {
                extractedArtist = parts[1].trim();
              }
            }
            break;
          }
        }

        // Auto-fill only if fields are empty
        if (!title && extractedTitle) {
          setTitle(extractedTitle);
        }
        if ((!singerName || singerName === profile?.name) && extractedArtist) {
          setSingerName(extractedArtist);
        }
      }
    } catch (err) {
      // Silently fail - user can fill manually
      console.log('YouTube metadata extraction failed:', err);
    } finally {
      setExtractingMetadata(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      setError('You must be logged in');
      return;
    }

    if (!title.trim() || !titleHindi.trim() || !singerName.trim()) {
      setError('Please fill in all required fields');
      return;
    }

    if (!isValidYouTubeUrl(youtubeUrl)) {
      setError('Please provide a valid YouTube URL');
      return;
    }

    // Check for high-similarity duplicates
    const hasHighDuplicate = duplicates.some(d => d.similarity >= 85);
    if (hasHighDuplicate) {
      setError('A very similar bhajan already exists. Please check the warnings below or modify your title.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      // Upload bhajan for admin review
      // Saves with status='pending' - will appear in admin moderation panel
      const { error: insertError } = await supabase
        .from('user_uploads')
        .insert([
          {
            user_id: user.id,
            title: sanitizeText(title),
            title_hindi: sanitizeText(titleHindi),
            deity_id: parseInt(deityId),
            singer_name: sanitizeText(singerName),
            composer_name: sanitizeText(composerName) || '',
            lyrics_hindi: sanitizeText(lyrics),
            image_url: imageUrl || '',
            youtube_url: youtubeUrl.trim() || '',
            status: 'pending',
          },
        ]);

      if (insertError) {
        throw new Error('Failed to submit bhajan. Please try again.');
      }

      setSuccess(true);
      setTimeout(() => {
        onSuccess?.();
      }, 2000);
    } catch (err: any) {
      setError(err.message || 'Error uploading bhajan');
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="w-full max-w-2xl mx-auto py-12">
        <div className="text-center">
          <div className="w-16 h-16 rounded-full bg-green-500/10 flex items-center justify-center mx-auto mb-4">
            <Check className="w-8 h-8 text-green-500" />
          </div>
          <h3 className="text-3xl font-bold mb-1">✅ Submitted Successfully!</h3>
          <p className="text-lg text-orange-600 dark:text-orange-400 font-semibold mb-6">🙏 Under Admin Review</p>
        </div>

        <div className="bg-blue-50 dark:bg-blue-900/20 border-2 border-blue-200 dark:border-blue-800 rounded-xl p-6 mb-6">
          <p className="text-sm font-semibold text-blue-900 dark:text-blue-300 mb-3 flex items-center gap-2">
            <span>📋</span> Your Bhajan Details
          </p>
          <div className="bg-white dark:bg-slate-800 rounded-lg p-4 space-y-2">
            <p className="text-sm">
              <span className="font-medium text-muted-foreground">Title:</span>
              <span className="ml-2 font-semibold text-foreground">{title}</span>
            </p>
            <p className="text-sm">
              <span className="font-medium text-muted-foreground">Hindi:</span>
              <span className="ml-2 font-semibold text-foreground hindi-text">{titleHindi}</span>
            </p>
            <p className="text-sm">
              <span className="font-medium text-muted-foreground">Status:</span>
              <span className="ml-2 inline-flex items-center gap-1 px-3 py-1 bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-300 rounded-full text-xs font-semibold">
                ⏳ Pending Approval
              </span>
            </p>
          </div>
        </div>

        <div className="bg-orange-50 dark:bg-orange-900/20 border-2 border-orange-200 dark:border-orange-800 rounded-xl p-6">
          <p className="text-sm font-semibold text-orange-900 dark:text-orange-300 mb-3 flex items-center gap-2">
            <span>📍</span> What Happens Next
          </p>
          <ul className="space-y-2 text-sm text-orange-800 dark:text-orange-200">
            <li className="flex items-start gap-3">
              <span className="text-lg">1️⃣</span>
              <span>Admin reviews your bhajan for quality and authenticity</span>
            </li>
            <li className="flex items-start gap-3">
              <span className="text-lg">2️⃣</span>
              <span>You'll receive a notification when it's approved</span>
            </li>
            <li className="flex items-start gap-3">
              <span className="text-lg">3️⃣</span>
              <span>Once approved, your bhajan appears for everyone in the app</span>
            </li>
            <li className="flex items-start gap-3">
              <span className="text-lg">⏱️</span>
              <span className="font-medium">Typical review time: 24-48 hours</span>
            </li>
          </ul>
        </div>

        <div className="text-center mt-8">
          <p className="text-sm text-muted-foreground mb-4">Check your notifications for updates</p>
          <Button onClick={() => onSuccess?.()} className="gap-2">
            ← Back to Upload
          </Button>
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="w-full max-w-2xl mx-auto bg-card rounded-lg p-4 md:p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-2xl font-bold">Bhajan Details</h3>
        {profile && (
          <div className="flex items-center gap-2 px-3 py-2 bg-primary/10 rounded-lg">
            <User className="w-4 h-4" />
            <span className="text-sm font-medium">{profile.name}</span>
          </div>
        )}
      </div>

      {error && (
        <div className="p-4 bg-destructive/10 text-destructive rounded-lg">
          {error}
        </div>
      )}

      {/* Image Preview Section */}
      {imageUrl && (
        <div className="bg-muted/50 rounded-lg p-4 border border-border">
          <p className="text-xs font-medium text-muted-foreground mb-3 uppercase">Uploaded Lyrics Image</p>
          <img
            src={imageUrl}
            alt="Lyrics"
            className="w-full max-h-48 object-cover rounded-lg"
            onError={(e) => {
              console.error('Image failed to load:', imageUrl);
              (e.target as any).style.display = 'none';
            }}
          />
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium mb-1">Title (English Only) *</label>
          <p className="text-xs text-muted-foreground mb-2">e.g., "Hare Krishna" - English text only</p>
          <Input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Title in English"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Title (Hindi Only) *</label>
          <p className="text-xs text-muted-foreground mb-2">e.g., "हरे कृष्ण" - Hindi text only</p>
          <Input
            value={titleHindi}
            onChange={(e) => setTitleHindi(e.target.value)}
            placeholder="शीर्षक हिंदी में"
            required
          />
        </div>
      </div>

      {/* Duplicate Warning */}
      {checkedDuplicates && duplicates.length > 0 && (
        <div className="bg-amber-500/10 border border-amber-500/30 rounded-lg p-4">
          <div className="flex items-center gap-2 text-amber-700 dark:text-amber-400 mb-2">
            <AlertTriangle className="w-5 h-5" />
            <span className="font-medium">Similar bhajans found</span>
          </div>
          <p className="text-sm text-muted-foreground mb-3">
            The following bhajans have similar titles. Please verify that your bhajan is unique:
          </p>
          <div className="space-y-2">
            {duplicates.slice(0, 3).map((dup, idx) => (
              <div key={idx} className="flex items-center justify-between bg-background/50 rounded p-2 text-sm">
                <span>{dup.bhajan.title}</span>
                <span className={`px-2 py-0.5 rounded text-xs ${
                  dup.similarity >= 85 ? 'bg-red-500/20 text-red-600' : 'bg-amber-500/20 text-amber-600'
                }`}>
                  {dup.similarity}% match
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium mb-1">Singer Name (Artist) *</label>
          <p className="text-xs text-muted-foreground mb-2">Who is singing this bhajan?</p>
          <Input
            value={singerName}
            onChange={(e) => setSingerName(e.target.value)}
            placeholder="e.g., Jagjit Singh"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Composer Name</label>
          <p className="text-xs text-muted-foreground mb-2">Who wrote this bhajan? (Optional)</p>
          <Input
            value={composerName}
            onChange={(e) => setComposerName(e.target.value)}
            placeholder="e.g., Traditional"
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium mb-2">YouTube URL (Optional)</label>
        <div className="flex gap-2 items-end">
          <div className="flex-1">
            <Input
              type="url"
              value={youtubeUrl}
              onChange={(e) => handleYouTubeUrlChange(e.target.value)}
              placeholder="https://www.youtube.com/watch?v=..."
            />
            <p className="text-xs text-muted-foreground mt-1">
              {extractingMetadata ? (
                <span className="flex items-center gap-1">
                  <Loader2 className="w-3 h-3 animate-spin" />
                  Extracting title and artist...
                </span>
              ) : (
                "Paste YouTube link and we'll auto-fill the title & artist"
              )}
            </p>
          </div>
          {extractingMetadata && (
            <Loader2 className="w-4 h-4 animate-spin text-primary mb-2" />
          )}
        </div>
      </div>

      {initialDeityId ? (
        <div className="p-4 bg-primary/5 border border-primary/20 rounded-lg">
          <label className="block text-sm font-medium mb-2">Deity *</label>
          <div className="flex items-center gap-3">
            <span className="text-3xl">{initialDeityName}</span>
            <div>
              <p className="font-semibold">{deityName}</p>
              <p className="text-xs text-muted-foreground">Selected deity</p>
            </div>
          </div>
        </div>
      ) : (
        <div>
          <label className="block text-sm font-medium mb-2">Deity *</label>
          <select
            value={deityId}
            onChange={(e) => setDeityId(e.target.value)}
            className="w-full px-4 py-2 rounded-lg border border-border bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
          >
            {deities.map((deity) => (
              <option key={deity.id} value={deity.id}>
                {deity.emoji} {deity.name}
              </option>
            ))}
          </select>
        </div>
      )}

      <div>
        <label className="block text-sm font-medium mb-2">Lyrics Preview</label>
        {imageUrl ? (
          <div className="bg-muted rounded-lg p-4 space-y-3">
            <img
              src={imageUrl}
              alt="Lyrics"
              className="w-full max-h-64 object-cover rounded-lg"
              onError={(e) => {
                console.error('Image failed to load:', imageUrl);
                (e.target as HTMLImageElement).style.display = 'none';
              }}
            />
            <p className="text-xs text-muted-foreground">Lyrics Image</p>
          </div>
        ) : (
          <div className="bg-muted rounded-lg p-4">
            <p className="text-sm text-muted-foreground font-mono">
              {lyrics.substring(0, 200)}
              {lyrics.length > 200 ? '...' : ''}
            </p>
            <p className="text-xs text-muted-foreground mt-2">
              {lyrics.length} characters
            </p>
          </div>
        )}
      </div>

      <div className="flex gap-3 pt-4">
        {onBack && (
          <Button
            type="button"
            variant="outline"
            onClick={onBack}
          >
            <ChevronLeft className="w-4 h-4 mr-2" />
            Back
          </Button>
        )}
        <Button type="submit" disabled={loading} className="flex-1">
          {loading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
          Submit Bhajan
        </Button>
      </div>
    </form>
  );
}
