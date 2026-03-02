import React from 'react';
import { useParams, useNavigate } from '@tanstack/react-router';
import { useLanguage } from '../contexts/LanguageContext';
import { useGetBlogPost } from '../hooks/useQueries';
import { Button } from '@/components/ui/button';
import { Loader2, ArrowLeft, Calendar, User } from 'lucide-react';

export default function BlogPost() {
  const { postId } = useParams({ from: '/blog/$postId' });
  const navigate = useNavigate();
  const { t } = useLanguage();

  const postIdBigInt = postId ? BigInt(postId) : null;
  const { data: post, isLoading } = useGetBlogPost(postIdBigInt);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="w-8 h-8 animate-spin text-gold" />
      </div>
    );
  }

  if (!post) {
    return (
      <div className="container mx-auto px-4 py-20 text-center">
        <p className="text-muted-foreground text-lg">Blog post not found.</p>
        <Button onClick={() => navigate({ to: '/blog' })} className="mt-4 bg-gold text-charcoal">
          {t('blog.backToBlog')}
        </Button>
      </div>
    );
  }

  const date = new Date(Number(post.date) / 1_000_000).toLocaleDateString('en-US', {
    year: 'numeric', month: 'long', day: 'numeric'
  });

  return (
    <div className="container mx-auto px-4 py-10 max-w-3xl animate-fade-in">
      <button
        onClick={() => navigate({ to: '/blog' })}
        className="flex items-center gap-2 text-muted-foreground hover:text-gold transition-colors mb-8 text-sm"
      >
        <ArrowLeft className="w-4 h-4" />
        {t('blog.backToBlog')}
      </button>

      {post.thumbnailUrl && (
        <div className="rounded-lg overflow-hidden mb-8 aspect-[16/7]">
          <img
            src={post.thumbnailUrl}
            alt={post.title}
            className="w-full h-full object-cover"
            onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
          />
        </div>
      )}

      <h1 className="font-serif text-4xl font-bold text-foreground mb-4 leading-tight">{post.title}</h1>

      <div className="flex items-center gap-4 text-sm text-muted-foreground mb-8 pb-8 border-b border-border">
        <span className="flex items-center gap-1.5">
          <User className="w-4 h-4" />
          {t('blog.by')} <span className="text-foreground font-medium ml-1">{post.author}</span>
        </span>
        <span className="flex items-center gap-1.5">
          <Calendar className="w-4 h-4" />
          {date}
        </span>
      </div>

      <div className="prose prose-invert prose-gold max-w-none">
        {post.content.split('\n').map((paragraph, i) => (
          paragraph.trim() ? (
            <p key={i} className="text-foreground/90 leading-relaxed mb-4">{paragraph}</p>
          ) : <br key={i} />
        ))}
      </div>
    </div>
  );
}
