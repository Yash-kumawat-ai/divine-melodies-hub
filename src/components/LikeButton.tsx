import React, { useState } from 'react';
import { Heart } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/useAuth';

interface LikeButtonProps {
  bhajanId: number;
  isLiked?: boolean;
  likeCount?: number;
  onLikeChange?: (isLiked: boolean) => Promise<void>;
}

export const LikeButton: React.FC<LikeButtonProps> = ({
  bhajanId,
  isLiked = false,
  likeCount = 0,
  onLikeChange,
}) => {
  const { user } = useAuth();
  const [liked, setLiked] = useState(isLiked);
  const [count, setCount] = useState(likeCount);
  const [isLoading, setIsLoading] = useState(false);

  const handleLikeClick = async () => {
    if (!user) {
      // Could redirect to login or show toast
      return;
    }

    setIsLoading(true);
    try {
      if (onLikeChange) {
        await onLikeChange(!liked);
      }
      setLiked(!liked);
      setCount(liked ? count - 1 : count + 1);
    } catch (error) {
      console.error('Error updating like:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={handleLikeClick}
      disabled={isLoading || !user}
      className={`flex items-center gap-1 ${
        liked
          ? 'text-red-500 hover:text-red-600'
          : 'text-muted-foreground hover:text-red-500'
      }`}
      title={!user ? 'Sign in to like' : liked ? 'Unlike' : 'Like'}
    >
      <Heart
        className={`w-4 h-4 ${liked ? 'fill-current' : ''}`}
      />
      {count > 0 && <span className="text-xs">{count}</span>}
    </Button>
  );
};

export default LikeButton;
