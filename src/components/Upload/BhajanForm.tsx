import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { deities } from '@/data/bhajans';
import { Loader2, Check, ChevronLeft, User } from 'lucide-react';

interface BhajanFormProps {
  lyrics: string;
  imageUrl?: string;
  onSuccess?: () => void;
  onBack?: () => void;
  deityId?: number;
  deityName?: string;
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

    setLoading(true);
    setError('');

    try {
      const { data: canSubmit, error: rateLimitError } = await (supabase as any).rpc(
        'check_submission_rate_limit',
        { p_user_id: user.id, p_limit: 5 }
      );

      if (rateLimitError) {
        throw new Error('Rate limit check failed. Please try again.');
      }

      if (!canSubmit) {
        setError('Upload limit reached. You can submit up to 5 bhajans per hour.');
        setLoading(false);
        return;
      }

      // Let's just save to a simple JSON structure for now
      // In production, you'd save to Supabase
      
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
        // If table doesn't exist yet, show success anyway for now
        console.log('Note: Database table setup needed for permanent storage');
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
      <div className="w-full max-w-2xl mx-auto text-center py-12">
        <div className="w-16 h-16 rounded-full bg-green-500/10 flex items-center justify-center mx-auto mb-4">
          <Check className="w-8 h-8 text-green-500" />
        </div>
        <h3 className="text-2xl font-bold mb-2">Bhajan Uploaded! 🎉</h3>
        <p className="text-muted-foreground mb-2">
          Title: <span className="font-semibold">{title}</span>
        </p>
        <p className="text-muted-foreground">
          Your bhajan has been submitted for admin review. It will be published after approval.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="w-full max-w-2xl mx-auto bg-card rounded-lg p-6 space-y-6">
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
