import React, { useState } from 'react';
import { useLanguage } from '../contexts/LanguageContext';
import { useAddReview } from '../hooks/useQueries';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import StarRating from './StarRating';
import { Loader2, CheckCircle } from 'lucide-react';

interface ReviewFormProps {
  carId: bigint;
}

export default function ReviewForm({ carId }: ReviewFormProps) {
  const { t } = useLanguage();
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const addReview = useAddReview();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (rating === 0 || !comment.trim()) return;
    try {
      await addReview.mutateAsync({ carId, rating: BigInt(rating), comment: comment.trim() });
      setSubmitted(true);
      setRating(0);
      setComment('');
    } catch (err) {
      // error handled by mutation state
    }
  };

  if (submitted) {
    return (
      <div className="luxury-card p-5 flex items-center gap-3 text-green-400">
        <CheckCircle className="w-5 h-5" />
        <span>{t('reviews.success')}</span>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="luxury-card p-5 space-y-4">
      <h3 className="font-semibold text-foreground">{t('reviews.write')}</h3>

      <div className="space-y-1.5">
        <Label className="text-sm text-muted-foreground">{t('reviews.rating')}</Label>
        <StarRating rating={rating} interactive onRate={setRating} size="lg" />
      </div>

      <div className="space-y-1.5">
        <Label className="text-sm text-muted-foreground">{t('reviews.comment')}</Label>
        <Textarea
          value={comment}
          onChange={e => setComment(e.target.value)}
          placeholder="Share your experience..."
          className="bg-secondary border-border resize-none"
          rows={3}
        />
      </div>

      {addReview.isError && (
        <p className="text-sm text-destructive">{t('reviews.completedRequired')}</p>
      )}

      <Button
        type="submit"
        disabled={rating === 0 || !comment.trim() || addReview.isPending}
        className="bg-gold text-charcoal hover:bg-gold-light font-semibold w-full"
      >
        {addReview.isPending ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
        {t('reviews.submit')}
      </Button>
    </form>
  );
}
