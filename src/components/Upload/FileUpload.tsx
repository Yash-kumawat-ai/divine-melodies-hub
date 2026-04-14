import { useState } from 'react';
import { Upload, X, Image as ImageIcon, Loader2, FileText } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { uploadToCloudinary } from '@/lib/cloudinary';
import { supabase } from '@/integrations/supabase/client';

interface LyricsUploadProps {
  onLyricsSelect: (url: string, type: 'image' | 'text', content: string) => void;
  onLoading?: (loading: boolean) => void;
}

export default function LyricsUpload({ onLyricsSelect, onLoading }: LyricsUploadProps) {
  const [mode, setMode] = useState<'image' | 'text'>('image');
  const [preview, setPreview] = useState<string>('');
  const [isDragActive, setIsDragActive] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadedUrl, setUploadedUrl] = useState<string>('');
  const [textLyrics, setTextLyrics] = useState('');
  const [error, setError] = useState('');
  const MAX_IMAGE_SIZE_MB = 10;
  const allowedImageTypes = ['image/jpeg', 'image/png', 'image/webp'];

  const uploadFile = async (file: File) => {
    setError('');
    setIsUploading(true);
    onLoading?.(true);

    try {
      const url = await uploadToCloudinary(file);
      if (!url) {
        throw new Error('Failed to get upload URL from Cloudinary');
      }

      const { data: scanResult, error: scanError } = await supabase.functions.invoke('scan-upload', {
        body: { fileUrl: url },
      });

      if (scanError) {
        throw new Error('Security scan failed. Please try again later.');
      }

      if (!scanResult?.clean) {
        throw new Error(scanResult?.reason || 'Uploaded file did not pass security checks');
      }

      setUploadedUrl(url);
      // Keep lyrics text empty for image mode and store URL only in image field.
      onLyricsSelect(url, 'image', '');
    } catch (err: any) {
      const errorMsg = err.message || 'Upload failed. Please check your Cloudinary setup.';
      setError(errorMsg);
      console.error('Upload error:', err);
    } finally {
      setIsUploading(false);
      onLoading?.(false);
    }
  };

  const handleFile = (file: File) => {
    if (!allowedImageTypes.includes(file.type)) {
      setError('Please upload a JPG, PNG, or WebP image');
      return;
    }

    if (file.size > MAX_IMAGE_SIZE_MB * 1024 * 1024) {
      setError(`Image is too large. Max allowed size is ${MAX_IMAGE_SIZE_MB}MB`);
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      const result = e.target?.result as string;
      setPreview(result);
      uploadFile(file);
    };
    reader.readAsDataURL(file);
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setIsDragActive(true);
    } else if (e.type === 'dragleave') {
      setIsDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragActive(false);

    const files = e.dataTransfer.files;
    if (files && files[0]) {
      handleFile(files[0]);
    }
  };

  const handleSubmitText = () => {
    if (!textLyrics.trim()) {
      setError('Please enter lyrics');
      return;
    }
    onLyricsSelect('', 'text', textLyrics);
  };

  return (
    <div className="w-full max-w-2xl mx-auto">
      {/* Mode Selector */}
      <div className="flex gap-2 mb-6 bg-muted p-1 rounded-lg w-fit mx-auto">
        <button
          onClick={() => {
            setMode('image');
            setError('');
          }}
          className={`px-4 py-2 rounded-md font-medium transition-all ${
            mode === 'image'
              ? 'bg-primary text-primary-foreground'
              : 'text-muted-foreground hover:text-foreground'
          }`}
        >
          <ImageIcon className="w-4 h-4 inline mr-2" />
          Lyrics Image
        </button>
        <button
          onClick={() => {
            setMode('text');
            setError('');
          }}
          className={`px-4 py-2 rounded-md font-medium transition-all ${
            mode === 'text'
              ? 'bg-primary text-primary-foreground'
              : 'text-muted-foreground hover:text-foreground'
          }`}
        >
          <FileText className="w-4 h-4 inline mr-2" />
          Type Lyrics
        </button>
      </div>

      {error && (
        <div className="mb-4 p-3 bg-destructive/10 text-destructive rounded-lg text-sm">
          {error}
        </div>
      )}

      {/* Image Upload Mode */}
      {mode === 'image' && (
        <div
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
          className={`border-2 border-dashed rounded-2xl p-12 text-center transition-colors ${
            isDragActive
              ? 'border-primary bg-primary/5'
              : 'border-border hover:border-primary/50'
          } ${isUploading ? 'opacity-50 pointer-events-none' : ''}`}
        >
          {uploadedUrl ? (
            <div className="space-y-4">
              <div className="text-green-500 text-center mb-2">✓ Lyrics Image Uploaded</div>
              <img
                src={uploadedUrl}
                alt="Uploaded Preview"
                className="max-h-64 mx-auto rounded-lg shadow-lg"
                onError={(e) => console.error('Image failed to load:', uploadedUrl)}
              />
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setPreview('');
                  setUploadedUrl('');
                }}
                className="w-full"
              >
                <X className="w-4 h-4 mr-2" />
                Choose Different Image
              </Button>
            </div>
          ) : isUploading ? (
            <div className="space-y-4">
              <div className="flex justify-center">
                <Loader2 className="w-8 h-8 text-primary animate-spin" />
              </div>
              <p className="text-muted-foreground">Uploading lyrics image...</p>
              {preview && (
                <img
                  src={preview}
                  alt="Preview"
                  className="max-h-64 mx-auto rounded-lg shadow-lg opacity-50"
                />
              )}
            </div>
          ) : (
            <div className="space-y-6">
              <div className="flex justify-center">
                <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
                  <ImageIcon className="w-8 h-8 text-primary" />
                </div>
              </div>
              <div>
                <h3 className="text-lg font-semibold mb-2">Upload Lyrics Image</h3>
                <p className="text-muted-foreground mb-4">
                  Drag and drop image of lyrics or click to select
                </p>
                <p className="text-sm text-muted-foreground mb-6">
                  Supported formats: JPG, PNG, WebP (max 10MB)
                </p>
              </div>

              <label className="inline-block cursor-pointer">
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => e.target.files && handleFile(e.target.files[0])}
                  disabled={isUploading}
                  className="hidden"
                />
                <Button asChild disabled={isUploading}>
                  <span>
                    <Upload className="w-4 h-4 mr-2" />
                    Upload Image
                  </span>
                </Button>
              </label>
            </div>
          )}
        </div>
      )}

      {/* Text Mode */}
      {mode === 'text' && (
        <div className="bg-card rounded-lg p-6 border border-border space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">Lyrics Text *</label>
            <Textarea
              value={textLyrics}
              onChange={(e) => setTextLyrics(e.target.value)}
              placeholder="Paste or type the bhajan lyrics here..."
              rows={8}
              className="font-mono text-sm"
            />
            <p className="text-xs text-muted-foreground mt-2">
              {textLyrics.length} characters
            </p>
          </div>
          <Button onClick={handleSubmitText} className="w-full">
            <FileText className="w-4 h-4 mr-2" />
            Continue with These Lyrics
          </Button>
        </div>
      )}
    </div>
  );
}
