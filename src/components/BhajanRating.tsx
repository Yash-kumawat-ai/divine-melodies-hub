import React, { useState } from 'react';
import { Star, MessageSquare } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { useAuth } from '@/hooks/useAuth';

interface BhajanRatingProps {
  bhajanId: number;
  currentRating?: number;
  averageRating?: number;
  ratingCount?: number;
  onRatingSubmit?: (rating: number, review: string) => Promise<void>;
}

export const BhajanRating: React.FC<BhajanRatingProps> = ({
  bhajanId,
  currentRating = 0,
  averageRating = 0,
  ratingCount = 0,
  onRatingSubmit,
}) => {
  const { user } = useAuth();
  const [userRating, setUserRating] = useState(currentRating);
  const [hoverRating, setHoverRating] = useState(0);
  const [reviewText, setReviewText] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmitRating = async () => {
    if (!user || !onRatingSubmit) return;

    setIsSubmitting(true);
    try {
      await onRatingSubmit(userRating, reviewText);
      setReviewText('');
    } catch (error) {
      console.error('Error submitting rating:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderStars = (rating: number, interactive: boolean = false) => {
    return (
      <div className="flex gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            onMouseEnter={() => interactive && setHoverRating(star)}
            onMouseLeave={() => interactive && setHoverRating(0)}
            onClick={() => interactive && setUserRating(star)}
            disabled={!interactive}
            className={`transition-colors ${!interactive && 'cursor-default'}`}
          >
            <Star
              className={`w-5 h-5 ${
                star <= (interactive ? hoverRating || userRating : rating)
                  ? 'fill-yellow-400 text-yellow-400'
                  : 'text-muted-foreground'
              }`}
            />
          </button>
        ))}
      </div>
    );
  };

  return (
    <div className="space-y-4 p-4 bg-card rounded-lg border border-border">
      {/* Average Rating Display */}
      <div className="flex items-center gap-3">
        <div>
          <div className="flex items-center gap-2">
            {renderStars(Math.round(averageRating))}
            <span className="font-semibold text-lg">{averageRating.toFixed(1)}</span>
          </div>
          <p className="text-xs text-muted-foreground">
            {ratingCount} {ratingCount === 1 ? 'rating' : 'ratings'}
          </p>
        </div>
      </div>

      {user ? (
        <div className="space-y-3 border-t border-border pt-4">
          <div>
            <label className="text-sm font-medium text-foreground mb-2 block">
              Rate this bhajan
            </label>
            {renderStars(userRating, true)}
          </div>

          <div>
            <label className="text-sm font-medium text-foreground mb-2 block">
              Share your thoughts
            </label>
            <Textarea
              placeholder="What did you love about this bhajan? (Optional)"
              value={reviewText}
              onChange={(e) => setReviewText(e.target.value)}
              className="resize-none"
              maxLength={500}
            />
            <p className="text-xs text-muted-foreground mt-1">
              {reviewText.length}/500
            </p>
          </div>

          <Button
            onClick={handleSubmitRating}
            disabled={isSubmitting || userRating === 0}
            className="w-full"
          >
            {isSubmitting ? 'Submitting...' : 'Submit Rating'}
          </Button>
        </div>
      ) : (
        <div className="border-t border-border pt-4 text-center">
          <p className="text-sm text-muted-foreground mb-2">
            Sign in to rate and review this bhajan
          </p>
          <Button variant="outline" size="sm" className="w-full">
            Sign In
          </Button>
        </div>
      )}

      {/* Recent Reviews */}
      {ratingCount > 0 && (
        <div className="border-t border-border pt-4 space-y-3">
          <h3 className="text-sm font-semibold flex items-center gap-2">
            <MessageSquare className="w-4 h-4" />
            Recent Reviews
          </h3>
          <p className="text-xs text-muted-foreground text-center">
            Reviews will be displayed here
          </p>
        </div>
      )}
    </div>
  );
};

export default BhajanRating;
