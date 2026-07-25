import { useState } from 'react';
import { Upload, X, Image as ImageIcon, Loader2, FileText, BookOpen } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { uploadToCloudinary } from '@/lib/cloudinary';
import { useLanguage } from '@/hooks/useLanguage';

interface LyricsUploadProps {
  onLyricsSelect: (url: string, type: 'image' | 'text', content: string) => void;
  onLoading?: (loading: boolean) => void;
  contentType?: string;
}

export default function LyricsUpload({ onLyricsSelect, onLoading, contentType = 'bhajan' }: LyricsUploadProps) {
  const { language } = useLanguage();
  const isHi = language === 'hi';

  const [mode, setMode] = useState<'image' | 'text'>('image');
  const [preview, setPreview] = useState<string>('');
  const [isDragActive, setIsDragActive] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadedUrl, setUploadedUrl] = useState<string>('');
  const [textLyrics, setTextLyrics] = useState('');
  const [kathaSynopsis, setKathaSynopsis] = useState('');
  const [error, setError] = useState('');

  const MAX_IMAGE_SIZE_MB = 5;
  const allowedImageTypes = ['image/jpeg', 'image/png', 'image/webp'];

  const isKatha = contentType === 'katha';
  const isChalisa = contentType === 'chalisa';

  const uploadFile = async (file: File) => {
    setError('');
    setIsUploading(true);
    onLoading?.(true);

    try {
      const url = await uploadToCloudinary(file, 'lyrics');
      if (!url) {
        throw new Error('Failed to get upload URL from Cloudinary');
      }

      setUploadedUrl(url);
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
      setError(isHi ? 'कृपया पाठ/बोल दर्ज करें' : 'Please enter lyrics text');
      return;
    }
    onLyricsSelect('', 'text', textLyrics);
  };

  const handleSubmitKathaSynopsis = () => {
    if (!kathaSynopsis.trim()) {
      setError(isHi ? 'कृपया कथा का संक्षिप्त विवरण दर्ज करें' : 'Please enter katha synopsis');
      return;
    }
    onLyricsSelect('', 'text', kathaSynopsis);
  };

  // If content_type === 'katha', render Synopsis input instead of Lyrics toggle
  if (isKatha) {
    return (
      <div className="w-full max-w-2xl mx-auto bg-white dark:bg-[#1E1710] rounded-2xl p-6 border-2 border-[#E8D8C4] dark:border-zinc-800 shadow-md space-y-4">
        <div className="flex items-center gap-2 text-[#7A2D28] dark:text-[#E8B15C] font-bold text-lg mb-1">
          <BookOpen className="w-5 h-5 shrink-0" />
          <span>{isHi ? "कथा का विवरण एवं सारांश" : "Katha Synopsis"}</span>
        </div>

        {error && (
          <div className="p-3 bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-900/40 text-red-700 dark:text-red-300 rounded-xl text-xs font-semibold">
            {error}
          </div>
        )}

        <div>
          <label className="block text-sm font-bold text-[#32251E] dark:text-[#FFFDF8] mb-1">
            {isHi ? "कथा का संक्षिप्त विवरण *" : "Katha Synopsis *"}
          </label>
          <p className="text-xs text-[#7A6B60] dark:text-[#D4C5B9] mb-2">
            {isHi ? "2-4 वाक्यों में बताएं कि यह कथा किस प्रसंग/लीला पर आधारित है" : "2-4 sentences describing the katha narrative"}
          </p>
          <Textarea
            value={kathaSynopsis}
            onChange={(e) => {
              setKathaSynopsis(e.target.value);
              setError('');
            }}
            placeholder={isHi ? "कथा का संक्षिप्त विवरण..." : "Brief synopsis of this katha..."}
            rows={5}
            className="rounded-xl border border-[#D8C9B9] dark:border-zinc-700 bg-[#FCF8F2] dark:bg-[#2A1F14] focus:border-[#7A2D28] dark:focus:border-[#E8B15C] text-[#32251E] dark:text-[#FFFDF8] text-sm font-medium p-3 shadow-inner"
          />
        </div>

        <Button
          onClick={handleSubmitKathaSynopsis}
          className="w-full rounded-xl bg-gradient-to-r from-[#7A2D28] to-[#5A1F1A] dark:from-[#D4A44A] dark:to-[#E8B15C] text-white dark:text-zinc-950 font-bold h-11 shadow-md hover:opacity-95"
        >
          {isHi ? "कथा विवरण के साथ आगे बढ़ें" : "Continue with Synopsis"}
        </Button>
      </div>
    );
  }

  return (
    <div className="w-full max-w-2xl mx-auto">
      {/* Mode Selector */}
      <div className="flex gap-2 mb-6 bg-[#FAF2E8] dark:bg-[#2A1F14] p-1.5 rounded-2xl border border-[#EFE4D7] dark:border-zinc-800 w-fit mx-auto shadow-sm">
        <button
          type="button"
          onClick={() => {
            setMode('image');
            setError('');
          }}
          className={`px-4 py-2 rounded-xl font-bold text-xs sm:text-sm transition-all ${
            mode === 'image'
              ? 'bg-[#7A2D28] dark:bg-[#E8B15C] text-white dark:text-zinc-950 shadow-sm'
              : 'text-[#7A6B60] dark:text-[#D4C5B9] hover:text-[#32251E]'
          }`}
        >
          <ImageIcon className="w-4 h-4 inline mr-1.5" />
          {isHi ? "बोल फोटो (Image)" : "Lyrics Image"}
        </button>
        <button
          type="button"
          onClick={() => {
            setMode('text');
            setError('');
          }}
          className={`px-4 py-2 rounded-xl font-bold text-xs sm:text-sm transition-all ${
            mode === 'text'
              ? 'bg-[#7A2D28] dark:bg-[#E8B15C] text-white dark:text-zinc-950 shadow-sm'
              : 'text-[#7A6B60] dark:text-[#D4C5B9] hover:text-[#32251E]'
          }`}
        >
          <FileText className="w-4 h-4 inline mr-1.5" />
          {isHi ? "बोल लिखें (Text)" : "Type Lyrics"}
        </button>
      </div>

      {error && (
        <div className="mb-4 p-3 bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-900/40 text-red-700 dark:text-red-300 rounded-xl text-xs font-semibold">
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
          className={`border-2 border-dashed rounded-2xl p-8 sm:p-10 text-center transition-all bg-white dark:bg-[#1E1710] ${
            isDragActive
              ? 'border-[#7A2D28] dark:border-[#E8B15C] bg-[#FAF2E8]'
              : 'border-[#EFE4D7] dark:border-zinc-800 hover:border-[#D4A44A]'
          } ${isUploading ? 'opacity-50 pointer-events-none' : ''}`}
        >
          {uploadedUrl ? (
            <div className="space-y-4">
              <div className="text-green-600 dark:text-green-400 font-bold text-sm flex items-center justify-center gap-1.5">
                <span>✓</span> {isHi ? "फोटो सफलतापूर्वक अपलोड हो गई" : "Lyrics Image Uploaded"}
              </div>
              <img
                src={uploadedUrl}
                alt="Uploaded Preview"
                className="max-h-64 mx-auto rounded-xl shadow-md border border-[#EFE4D7]"
                onError={(e) => console.error('Image failed to load:', uploadedUrl)}
              />
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setPreview('');
                  setUploadedUrl('');
                }}
                className="w-full rounded-xl border-[#EFE4D7] font-bold text-xs"
              >
                <X className="w-4 h-4 mr-1.5" />
                {isHi ? "दूसरी फोटो चुनें" : "Choose Different Image"}
              </Button>
            </div>
          ) : isUploading ? (
            <div className="space-y-4">
              <div className="flex justify-center">
                <Loader2 className="w-8 h-8 text-[#7A2D28] dark:text-[#E8B15C] animate-spin" />
              </div>
              <p className="text-xs font-bold text-[#7A6B60] dark:text-[#D4C5B9]">
                {isHi ? "फोटो अपलोड हो रही है..." : "Uploading lyrics image..."}
              </p>
              {preview && (
                <img
                  src={preview}
                  alt="Preview"
                  className="max-h-64 mx-auto rounded-xl shadow-md opacity-50"
                />
              )}
            </div>
          ) : (
            <div className="space-y-4">
              <div className="flex justify-center">
                <div className="w-14 h-14 rounded-2xl bg-[#FAF2E8] dark:bg-amber-950/40 border border-[#EFE4D7] dark:border-amber-900/50 flex items-center justify-center text-[#7A2D28] dark:text-[#E8B15C]">
                  <ImageIcon className="w-7 h-7" />
                </div>
              </div>
              <div>
                <h3 className="text-base font-bold text-[#32251E] dark:text-[#FFFDF8] mb-1">
                  {isHi ? "इमेज/फोटो अपलोड करें" : "Upload Lyrics Image"}
                </h3>
                <p className="text-xs text-[#7A6B60] dark:text-[#D4C5B9] mb-3">
                  {isHi ? "रचना/बोल की फोटो ड्रैग करें या सेलेक्ट करें" : "Drag and drop image of lyrics or click to select"}
                </p>
                <p className="text-[11px] text-[#7A6B60] dark:text-[#D4C5B9]">
                  {isHi ? "फॉर्मेट: JPG, PNG, WebP (अधिकतम 5MB)" : "Supported formats: JPG, PNG, WebP (max 5MB)"}
                </p>
              </div>

              {/* Chalisa Display-only Helper Text */}
              {isChalisa && (
                <div className="mt-2 text-xs font-bold text-amber-700 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/30 py-1.5 px-3 rounded-lg inline-block border border-amber-200 dark:border-amber-900/40">
                  {isHi ? "कृपया पारंपरिक पाठ से मिलाएं" : "Please match against traditional text"}
                </div>
              )}

              <div>
                <label className="inline-block cursor-pointer">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => e.target.files && handleFile(e.target.files[0])}
                    disabled={isUploading}
                    className="hidden"
                  />
                  <Button asChild disabled={isUploading} className="rounded-xl bg-gradient-to-r from-[#7A2D28] to-[#5A1F1A] dark:from-[#D4A44A] dark:to-[#E8B15C] text-white dark:text-zinc-950 font-bold px-5 h-10 shadow-md">
                    <span>
                      <Upload className="w-4 h-4 mr-1.5" />
                      {isHi ? "फोटो सेलेक्ट करें" : "Upload Image"}
                    </span>
                  </Button>
                </label>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Text Mode */}
      {mode === 'text' && (
        <div className="bg-white dark:bg-[#1E1710] rounded-2xl p-5 border-2 border-[#E8D8C4] dark:border-zinc-800 space-y-4 shadow-md">
          <div>
            <label className="block text-sm font-bold text-[#32251E] dark:text-[#FFFDF8] mb-1">
              {isHi ? "रचना के बोल (Lyrics Text) *" : "Lyrics Text *"}
            </label>
            <Textarea
              value={textLyrics}
              onChange={(e) => setTextLyrics(e.target.value)}
              placeholder={isHi ? "रचना के पावन बोल यहाँ लिखें या पेस्ट करें..." : "Paste or type lyrics here..."}
              rows={8}
              className="rounded-xl border border-[#D8C9B9] dark:border-zinc-700 bg-[#FCF8F2] dark:bg-[#2A1F14] focus:border-[#7A2D28] dark:focus:border-[#E8B15C] text-[#32251E] dark:text-[#FFFDF8] text-sm font-medium p-3 shadow-inner"
            />
            <p className="text-xs text-[#7A6B60] dark:text-[#D4C5B9] mt-2 font-medium">
              {textLyrics.length} {isHi ? "अक्षर" : "characters"}
            </p>

            {isChalisa && (
              <div className="mt-2 text-xs font-bold text-amber-700 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/30 py-1.5 px-3 rounded-lg inline-block border border-amber-200 dark:border-amber-900/40">
                {isHi ? "कृपया पारंपरिक पाठ से मिलाएं" : "Please match against traditional text"}
              </div>
            )}
          </div>

          <Button
            onClick={handleSubmitText}
            className="w-full rounded-xl bg-gradient-to-r from-[#7A2D28] to-[#5A1F1A] dark:from-[#D4A44A] dark:to-[#E8B15C] text-white dark:text-zinc-950 font-bold h-11 shadow-md hover:opacity-95"
          >
            <FileText className="w-4 h-4 mr-2" />
            {isHi ? "इन बोल के साथ आगे बढ़ें" : "Continue with These Lyrics"}
          </Button>
        </div>
      )}
    </div>
  );
}
