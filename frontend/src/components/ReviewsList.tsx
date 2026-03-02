import React from 'react';
import { useLanguage } from '../contexts/LanguageContext';
import { Review } from '../backend';
import StarRating from './StarRating';
import { User } from 'lucide-react';

interface ReviewsListProps {
  reviews: Review[];
}

export default function ReviewsList({ reviews }: ReviewsListProps) {
  const { t } = useLanguage();

  if (reviews.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        <p>{t('reviews.noReviews')}</p>
      </div>
    );
  }

  const avgRating = reviews.reduce((sum, r) => sum + Number(r.rating), 0) / reviews.length;

  return (
    <div className="space-y-4">
      {/* Average */}
      <div className="flex items-center gap-3 p-4 luxury-card">
        <div className="text-center">
          <div className="text-3xl font-bold text-gold">{avgRating.toFixed(1)}</div>
          <StarRating rating={Math.round(avgRating)} size="sm" />
          <div className="text-xs text-muted-foreground mt-1">{reviews.length} reviews</div>
        </div>
      </div>

      {/* Reviews list */}
      {reviews.map((review, idx) => (
        <div key={idx} className="luxury-card p-4 space-y-2">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-secondary flex items-center justify-center">
                <User className="w-4 h-4 text-muted-foreground" />
              </div>
              <div>
                <p className="text-sm font-medium text-foreground">
                  {review.user.toString().slice(0, 8)}...
                </p>
                <p className="text-xs text-muted-foreground">
                  {new Date(Number(review.timestamp) / 1_000_000).toLocaleDateString()}
                </p>
              </div>
            </div>
            <StarRating rating={Number(review.rating)} size="sm" />
          </div>
          <p className="text-sm text-muted-foreground leading-relaxed">{review.comment}</p>
        </div>
      ))}
    </div>
  );
}
