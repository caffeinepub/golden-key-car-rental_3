import React from 'react';
import { useLanguage } from '../contexts/LanguageContext';
import { useGetPublishedBlogPosts } from '../hooks/useQueries';
import BlogPostCard from '../components/BlogPostCard';
import { Loader2, BookOpen } from 'lucide-react';

export default function BlogListing() {
  const { t } = useLanguage();
  const { data: posts = [], isLoading } = useGetPublishedBlogPosts();

  return (
    <div className="container mx-auto px-4 py-10 animate-fade-in">
      <div className="mb-10">
        <h1 className="font-serif text-4xl font-bold text-foreground mb-2">{t('blog.title')}</h1>
        <div className="w-16 h-0.5 bg-gold" />
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="w-8 h-8 animate-spin text-gold" />
        </div>
      ) : posts.length === 0 ? (
        <div className="text-center py-20 text-muted-foreground">
          <BookOpen className="w-16 h-16 mx-auto mb-4 opacity-30" />
          <p className="text-lg">{t('blog.noPosts')}</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {posts.map(post => (
            <BlogPostCard key={post.id.toString()} post={post} />
          ))}
        </div>
      )}
    </div>
  );
}
