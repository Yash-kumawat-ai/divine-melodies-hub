import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { ChevronRight, AlertCircle } from 'lucide-react';

interface TextExtractorProps {
  imageUrl: string;
  onExtract: (text: string) => void;
  onBack: () => void;
}

export default function TextExtractor({ imageUrl, onExtract, onBack }: TextExtractorProps) {
  const [extractedText, setExtractedText] = useState('');

  const handleConfirm = () => {
    if (extractedText.trim()) {
      onExtract(extractedText);
    }
  };

  // Don't render URL as text - only show images
  const isValidImageUrl = imageUrl && (imageUrl.startsWith('http') || imageUrl.startsWith('data:'));

  return (
    <div className="w-full max-w-4xl mx-auto space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Image Preview */}
        <div className="bg-card rounded-lg p-6 space-y-4">
          <h3 className="font-semibold text-lg">Uploaded Image</h3>
          {isValidImageUrl ? (
            <div className="space-y-3">
              <img
                src={imageUrl}
                alt="Lyrics"
                className="w-full h-auto rounded-lg shadow-lg max-h-96 object-cover"
                onError={(e) => {
                  console.error('Image failed to load:', imageUrl);
                  (e.target as HTMLImageElement).style.display = 'none';
                }}
              />
              <p className="text-xs text-muted-foreground">
                ✓ Image loaded successfully
              </p>
            </div>
          ) : (
            <div className="bg-muted rounded p-4 text-muted-foreground text-sm flex items-center gap-2">
              <AlertCircle className="w-4 h-4" />
              No image provided
            </div>
          )}
        </div>

        {/* Text Input */}
        <div className="bg-card rounded-lg p-6 space-y-4">
          <h3 className="font-semibold text-lg">Extract Lyrics</h3>
          
          <p className="text-sm text-muted-foreground">
            Type or paste the lyrics from your photo. You can manually type them or paste from another source.
          </p>

          <Textarea
            value={extractedText}
            onChange={(e) => setExtractedText(e.target.value)}
            placeholder="Paste or type the bhajan lyrics here..."
            className="min-h-64 font-mono text-sm"
          />

          <p className="text-sm text-muted-foreground">
            {extractedText.length} characters
          </p>

          <div className="flex gap-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={onBack}
              className="flex-1"
            >
              Back
            </Button>
            <Button
              onClick={handleConfirm}
              disabled={!extractedText.trim()}
              className="flex-1"
            >
              Continue
              <ChevronRight className="w-4 h-4 ml-2" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
