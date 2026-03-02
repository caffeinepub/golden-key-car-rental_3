import React, { useState } from 'react';
import { useLanguage } from '../../contexts/LanguageContext';
import { useGetAllBlogPosts, useCreateOrUpdateBlogPost } from '../../hooks/useQueries';
import { BlogPost } from '../../backend';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Loader2, Plus, Edit2, BookOpen, ImageOff } from 'lucide-react';

interface BlogFormData {
  title: string;
  content: string;
  author: string;
  published: boolean;
  thumbnailUrl: string;
}

const DEFAULT_FORM: BlogFormData = {
  title: '',
  content: '',
  author: '',
  published: false,
  thumbnailUrl: '',
};

export default function BlogManagementPanel() {
  const { t } = useLanguage();
  const { data: posts = [], isLoading } = useGetAllBlogPosts();
  const createOrUpdate = useCreateOrUpdateBlogPost();

  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingPost, setEditingPost] = useState<BlogPost | null>(null);
  const [form, setForm] = useState<BlogFormData>(DEFAULT_FORM);
  const [formError, setFormError] = useState('');

  const openCreate = () => {
    setEditingPost(null);
    setForm(DEFAULT_FORM);
    setFormError('');
    setDialogOpen(true);
  };

  const openEdit = (post: BlogPost) => {
    setEditingPost(post);
    setForm({
      title: post.title,
      content: post.content,
      author: post.author,
      published: post.published,
      thumbnailUrl: post.thumbnailUrl || '',
    });
    setFormError('');
    setDialogOpen(true);
  };

  const handleSave = async () => {
    if (!form.title.trim()) { setFormError('Title is required'); return; }
    if (!form.content.trim()) { setFormError('Content is required'); return; }
    if (!form.author.trim()) { setFormError('Author is required'); return; }
    setFormError('');

    try {
      await createOrUpdate.mutateAsync({
        title: form.title.trim(),
        content: form.content.trim(),
        author: form.author.trim(),
        published: form.published,
        thumbnailUrl: form.thumbnailUrl.trim() || null,
        postId: editingPost ? editingPost.id : null,
      });
      setDialogOpen(false);
    } catch (err: unknown) {
      setFormError((err as Error).message || 'Failed to save blog post');
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center gap-2 text-muted-foreground py-8">
        <Loader2 className="w-5 h-5 animate-spin" />
        {t('common.loading')}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="font-serif font-bold text-xl text-foreground">{t('admin.blog')}</h2>
        <Button onClick={openCreate} className="bg-gold text-charcoal hover:bg-gold-light font-semibold">
          <Plus className="w-4 h-4 mr-2" />Create Post
        </Button>
      </div>

      {posts.length === 0 ? (
        <div className="text-center py-16 text-muted-foreground">
          <BookOpen className="w-12 h-12 mx-auto mb-3 opacity-30" />
          <p>No blog posts yet. Create your first post!</p>
        </div>
      ) : (
        <div className="luxury-card overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow className="border-border hover:bg-transparent">
                <TableHead className="text-muted-foreground">Thumbnail</TableHead>
                <TableHead className="text-muted-foreground">Title</TableHead>
                <TableHead className="text-muted-foreground">Author</TableHead>
                <TableHead className="text-muted-foreground">Date</TableHead>
                <TableHead className="text-muted-foreground">Status</TableHead>
                <TableHead className="text-muted-foreground">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {posts.map(post => (
                <TableRow key={post.id.toString()} className="border-border hover:bg-secondary/50">
                  <TableCell>
                    {post.thumbnailUrl ? (
                      <img
                        src={post.thumbnailUrl}
                        alt={post.title}
                        className="w-16 h-10 object-cover rounded"
                        onError={(e) => {
                          const target = e.target as HTMLImageElement;
                          target.style.display = 'none';
                        }}
                      />
                    ) : (
                      <div className="w-16 h-10 bg-secondary rounded flex items-center justify-center">
                        <ImageOff className="w-4 h-4 text-muted-foreground" />
                      </div>
                    )}
                  </TableCell>
                  <TableCell className="font-medium max-w-[200px] truncate">{post.title}</TableCell>
                  <TableCell className="text-sm text-muted-foreground">{post.author}</TableCell>
                  <TableCell className="text-xs text-muted-foreground">
                    {new Date(Number(post.date) / 1_000_000).toLocaleDateString()}
                  </TableCell>
                  <TableCell>
                    <span className={`text-xs px-2 py-0.5 rounded-full ${
                      post.published
                        ? 'bg-green-600/20 text-green-400'
                        : 'bg-yellow-600/20 text-yellow-400'
                    }`}>
                      {post.published ? 'Published' : 'Draft'}
                    </span>
                  </TableCell>
                  <TableCell>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => openEdit(post)}
                      className="h-7 w-7 p-0 text-muted-foreground hover:text-gold"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}

      {/* Create / Edit Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="bg-card border-border max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="font-serif text-gold">
              {editingPost ? 'Edit Blog Post' : 'Create Blog Post'}
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4 py-2">
            <div className="space-y-1.5">
              <Label className="text-sm text-muted-foreground">Title *</Label>
              <Input
                value={form.title}
                onChange={e => setForm(p => ({ ...p, title: e.target.value }))}
                placeholder="Enter post title..."
                className="bg-secondary border-border"
              />
            </div>

            <div className="space-y-1.5">
              <Label className="text-sm text-muted-foreground">Author *</Label>
              <Input
                value={form.author}
                onChange={e => setForm(p => ({ ...p, author: e.target.value }))}
                placeholder="Author name"
                className="bg-secondary border-border"
              />
            </div>

            <div className="space-y-1.5">
              <Label className="text-sm text-muted-foreground">Thumbnail URL (optional)</Label>
              <Input
                value={form.thumbnailUrl}
                onChange={e => setForm(p => ({ ...p, thumbnailUrl: e.target.value }))}
                placeholder="https://example.com/image.jpg"
                className="bg-secondary border-border"
              />
            </div>

            <div className="space-y-1.5">
              <Label className="text-sm text-muted-foreground">Content *</Label>
              <textarea
                value={form.content}
                onChange={e => setForm(p => ({ ...p, content: e.target.value }))}
                placeholder="Write your blog post content here..."
                className="w-full bg-secondary border border-border rounded px-3 py-2 text-sm text-foreground resize-none h-48 focus:outline-none focus:ring-1 focus:ring-gold/50"
              />
            </div>

            <div className="flex items-center gap-3">
              <Switch
                checked={form.published}
                onCheckedChange={v => setForm(p => ({ ...p, published: v }))}
                className="data-[state=checked]:bg-gold"
              />
              <Label className="text-sm cursor-pointer">
                {form.published ? (
                  <span className="text-green-400 font-medium">Published</span>
                ) : (
                  <span className="text-muted-foreground">Save as Draft</span>
                )}
              </Label>
            </div>

            {formError && (
              <p className="text-sm text-destructive">{formError}</p>
            )}
          </div>

          <DialogFooter>
            <Button
              variant="ghost"
              onClick={() => setDialogOpen(false)}
              className="text-muted-foreground"
            >
              {t('common.cancel')}
            </Button>
            <Button
              onClick={handleSave}
              disabled={createOrUpdate.isPending}
              className="bg-gold text-charcoal hover:bg-gold-light font-semibold"
            >
              {createOrUpdate.isPending
                ? <Loader2 className="w-4 h-4 animate-spin mr-2" />
                : null
              }
              {t('common.save')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
