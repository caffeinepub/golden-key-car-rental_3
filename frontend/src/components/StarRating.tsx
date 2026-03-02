import React from 'react';
import { Star } from 'lucide-react';

interface StarRatingProps {
  rating: number;
  maxRating?: number;
  size?: 'sm' | 'md' | 'lg';
  interactive?: boolean;
  onRate?: (rating: number) => void;
}

export default function StarRating({ rating, maxRating = 5, size = 'md', interactive = false, onRate }: StarRatingProps) {
  const sizeClass = size === 'sm' ? 'w-3 h-3' : size === 'lg' ? 'w-6 h-6' : 'w-4 h-4';

  return (
    <div className="flex items-center gap-0.5">
      {Array.from({ length: maxRating }, (_, i) => (
        <Star
          key={i}
          className={`${sizeClass} transition-colors ${
            i < rating ? 'text-gold fill-gold' : 'text-muted-foreground'
          } ${interactive ? 'cursor-pointer hover:text-gold hover:fill-gold' : ''}`}
          onClick={() => interactive && onRate && onRate(i + 1)}
        />
      ))}
    </div>
  );
}
