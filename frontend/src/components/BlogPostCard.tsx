import React from 'react';
import { useNavigate } from '@tanstack/react-router';
import { useLanguage } from '../contexts/LanguageContext';
import { BlogPost } from '../backend';
import { Calendar, User, ArrowRight } from 'lucide-react';

interface BlogPostCardProps {
  post: BlogPost;
}

export default function BlogPostCard({ post }: BlogPostCardProps) {
  const navigate = useNavigate();
  const { t } = useLanguage();

  const excerpt = post.content.length > 150 ? post.content.slice(0, 150) + '...' : post.content;
  const date = new Date(Number(post.date) / 1_000_000).toLocaleDateString('en-US', {
    year: 'numeric', month: 'short', day: 'numeric'
  });

  return (
    <div
      className="luxury-card overflow-hidden group cursor-pointer hover:border-gold/40 transition-all duration-300 hover:shadow-gold flex flex-col"
      onClick={() => navigate({ to: '/blog/$postId', params: { postId: post.id.toString() } })}
    >
      {/* Thumbnail */}
      <div className="aspect-[16/9] overflow-hidden bg-secondary">
        {post.thumbnailUrl ? (
          <img
            src={post.thumbnailUrl}
            alt={post.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            onError={(e) => {
              const target = e.target as HTMLImageElement;
              target.style.display = 'none';
            }}
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-secondary">
            <span className="text-4xl">📰</span>
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-5 flex flex-col flex-1">
        <h3 className="font-serif font-bold text-lg text-foreground mb-2 group-hover:text-gold transition-colors line-clamp-2">
          {post.title}
        </h3>
        <p className="text-sm text-muted-foreground leading-relaxed mb-4 flex-1 line-clamp-3">
          {excerpt}
        </p>
        <div className="flex items-center justify-between text-xs text-muted-foreground mt-auto pt-3 border-t border-border">
          <div className="flex items-center gap-3">
            <span className="flex items-center gap-1">
              <User className="w-3 h-3" />{post.author}
            </span>
            <span className="flex items-center gap-1">
              <Calendar className="w-3 h-3" />{date}
            </span>
          </div>
          <span className="flex items-center gap-1 text-gold font-medium">
            {t('blog.readMore')} <ArrowRight className="w-3 h-3" />
          </span>
        </div>
      </div>
    </div>
  );
}
