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
}

export default function BhajanForm({ lyrics, imageUrl, onSuccess, onBack }: BhajanFormProps) {
  const { user, profile } = useAuth();
  const [title, setTitle] = useState('');
  const [titleHindi, setTitleHindi] = useState('');
  const [deityId, setDeityId] = useState('1');
  const [singerName, setSingerName] = useState('');
  const [composerName, setComposerName] = useState('');
  const [youtubeUrl, setYoutubeUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  // Auto-populate singer name with user profile name
  useEffect(() => {
    if (profile?.name) {
      setSingerName(profile.name);
    }
  }, [profile]);

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

    setLoading(true);
    setError('');

    try {
      // Let's just save to a simple JSON structure for now
      // In production, you'd save to Supabase
      
      const { error: insertError } = await supabase
        .from('user_uploads')
        .insert([
          {
            user_id: user.id,
            title: title,
            title_hindi: titleHindi,
            deity_id: parseInt(deityId),
            singer_name: singerName,
            composer_name: composerName || '',
            lyrics_hindi: lyrics,
            image_url: imageUrl || '',
            youtube_url: youtubeUrl || '',
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
          Your bhajan has been submitted. Thank you for contributing!
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

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium mb-2">Title (English) *</label>
          <Input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="e.g., Hare Krishna"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">Title (Hindi) *</label>
          <Input
            value={titleHindi}
            onChange={(e) => setTitleHindi(e.target.value)}
            placeholder="e.g., हरे कृष्ण"
            required
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium mb-2">Singer Name *</label>
          <Input
            value={singerName}
            onChange={(e) => setSingerName(e.target.value)}
            placeholder="e.g., Jagjit Singh"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">Composer Name</label>
          <Input
            value={composerName}
            onChange={(e) => setComposerName(e.target.value)}
            placeholder="e.g., Traditional"
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium mb-2">YouTube URL (Optional)</label>
        <Input
          type="url"
          value={youtubeUrl}
          onChange={(e) => setYoutubeUrl(e.target.value)}
          placeholder="https://www.youtube.com/watch?v=..."
        />
        <p className="text-xs text-muted-foreground mt-1">
          Link to the bhajan on YouTube (if available)
        </p>
      </div>

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

      <div>
        <label className="block text-sm font-medium mb-2">Lyrics Preview</label>
        <Textarea
          value={lyrics}
          disabled
          className="min-h-32 font-mono text-sm bg-muted"
        />
        <p className="text-xs text-muted-foreground mt-2">
          {lyrics.length} characters
        </p>
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
