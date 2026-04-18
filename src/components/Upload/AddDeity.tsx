import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Loader2, ChevronLeft, Upload, X } from 'lucide-react';
import { uploadToCloudinary } from '@/lib/cloudinary';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';

interface AddDeityProps {
  onDeityAdded: (deity: { id?: number; name: string; emoji: string; description: string; imageUrl: string }) => void;
  onBack: () => void;
}

export default function AddDeity({ onDeityAdded, onBack }: AddDeityProps) {
  const { user } = useAuth();
  const [name, setName] = useState('');
  const [emoji, setEmoji] = useState('🙏');
  const [description, setDescription] = useState('');
  const [imagePreview, setImagePreview] = useState<string>('');
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleImageSelect = async (file: File) => {
    if (!file.type.startsWith('image/')) {
      setError('Please upload an image file');
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      const result = e.target?.result as string;
      setImagePreview(result);
      setImageFile(file);
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!name.trim()) {
      setError('Please enter deity name');
      return;
    }

    if (!imageFile) {
      setError('Please upload a deity image');
      return;
    }

    if (!user) {
      setError('You must be logged in');
      return;
    }

    setLoading(true);

    try {
      // Upload image to Cloudinary
      let imageUrl = '';
      if (imageFile) {
        imageUrl = await uploadToCloudinary(imageFile, 'deity');
      }

      // Save custom deity to Supabase
      const { data, error: dbError } = await supabase
        .from('custom_deities')
        .insert([
          {
            user_id: user.id,
            name,
            emoji,
            description,
            image_url: imageUrl,
          },
        ])
        .select()
        .single();

      if (dbError) {
        throw dbError;
      }

      if (data) {
        onDeityAdded({
          id: data.id,
          name: data.name,
          emoji: data.emoji,
          description: data.description,
          imageUrl: data.image_url,
        });
      }
    } catch (err: any) {
      setError(err.message || 'Failed to add deity');
      console.error('Error adding deity:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="w-full max-w-2xl mx-auto bg-card rounded-lg p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-2xl font-bold">Add New Deity</h3>
      </div>

      {error && (
        <div className="p-4 bg-destructive/10 text-destructive rounded-lg text-sm">
          {error}
        </div>
      )}

      {/* Image Upload */}
      <div>
        <label className="block text-sm font-medium mb-2">Deity Image *</label>
        <div className="border-2 border-dashed border-border rounded-lg p-6 text-center hover:border-primary transition-colors">
          {imagePreview ? (
            <div className="space-y-3">
              <img
                src={imagePreview}
                alt="Preview"
                className="max-h-48 mx-auto rounded"
              />
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setImagePreview('');
                  setImageFile(null);
                }}
              >
                <X className="w-4 h-4 mr-2" />
                Change Image
              </Button>
            </div>
          ) : (
            <label className="cursor-pointer block">
              <div className="flex flex-col items-center gap-2">
                <Upload className="w-8 h-8 text-muted-foreground" />
                <span className="text-sm text-muted-foreground">Click to upload deity image</span>
              </div>
              <input
                type="file"
                accept="image/*"
                onChange={(e) => e.target.files && handleImageSelect(e.target.files[0])}
                className="hidden"
              />
            </label>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium mb-2">Deity Name *</label>
          <Input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g., Lakshmi"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">Emoji *</label>
          <Input
            value={emoji}
            onChange={(e) => setEmoji(e.target.value)}
            placeholder="🙏"
            maxLength={2}
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium mb-2">Description</label>
        <Textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Brief description about this deity..."
          rows={3}
        />
      </div>

      <div className="flex gap-3 pt-4">
        <Button
          type="button"
          variant="outline"
          onClick={onBack}
        >
          <ChevronLeft className="w-4 h-4 mr-2" />
          Back
        </Button>
        <Button type="submit" disabled={loading} className="flex-1">
          {loading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
          Add Deity
        </Button>
      </div>
    </form>
  );
}
