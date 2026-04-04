import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { ChevronRight } from 'lucide-react';

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

  return (
    <div className="w-full max-w-2xl mx-auto space-y-4">
      <div className="bg-card rounded-lg p-6 space-y-4">
        <h3 className="font-semibold text-lg">Bhajan Lyrics/Content</h3>
        
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
  );
}
