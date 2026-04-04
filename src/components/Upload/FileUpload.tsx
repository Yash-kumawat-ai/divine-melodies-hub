import { useState } from 'react';
import { Upload, X, Image as ImageIcon, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { uploadToCloudinary } from '@/lib/cloudinary';

interface FileUploadProps {
  onFileSelect: (url: string, preview: string) => void;
  onLoading?: (loading: boolean) => void;
}

export default function FileUpload({ onFileSelect, onLoading }: FileUploadProps) {
  const [preview, setPreview] = useState<string>('');
  const [isDragActive, setIsDragActive] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadedUrl, setUploadedUrl] = useState<string>('');
  const [error, setError] = useState('');

  const uploadFile = async (file: File) => {
    setError('');
    setIsUploading(true);
    onLoading?.(true);

    try {
      const url = await uploadToCloudinary(file);
      setUploadedUrl(url);
      onFileSelect(url, preview);
    } catch (err: any) {
      setError(err.message || 'Upload failed');
    } finally {
      setIsUploading(false);
      onLoading?.(false);
    }
  };

  const handleFile = (file: File) => {
    if (!file.type.startsWith('image/')) {
      setError('Please upload an image file');
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

  return (
    <div className="w-full max-w-2xl mx-auto">
      {error && (
        <div className="mb-4 p-3 bg-destructive/10 text-destructive rounded-lg text-sm">
          {error}
        </div>
      )}
      
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
            <div className="text-green-500 text-center mb-2">✓ Image Uploaded</div>
            <img
              src={preview}
              alt="Preview"
              className="max-h-64 mx-auto rounded-lg shadow-lg"
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
            <p className="text-muted-foreground">Uploading to Cloudinary...</p>
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
              <h3 className="text-lg font-semibold mb-2">Upload Bhajan Photo</h3>
              <p className="text-muted-foreground mb-4">
                Drag and drop your image here or click to select
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
    </div>
  );
}
