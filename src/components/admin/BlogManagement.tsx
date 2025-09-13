import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus, Edit2, Trash2, Eye, EyeOff, Search, Filter } from 'lucide-react';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import BlogEditor from './BlogEditor';

interface BlogPost {
  id: string;
  title: string;
  content: string;
  excerpt: string;
  slug: string;
  category: string;
  tags: string[];
  featured_image_url?: string;
  featured_video_url?: string;
  is_published: boolean;
  published_at?: string;
  read_time_minutes: number;
  created_at: string;
  updated_at: string;
}

interface BlogManagementProps {
  onFileUpload: (file: File) => Promise<string>;
}

const BlogManagement = ({ onFileUpload }: BlogManagementProps) => {
  const [blogPosts, setBlogPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [showEditor, setShowEditor] = useState(false);
  const [editingPost, setEditingPost] = useState<BlogPost | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'published' | 'draft'>('all');
  const [categoryFilter, setCategoryFilter] = useState('all');

  // Get unique categories from posts
  const categories = ['General', 'Technology', 'Tutorial', 'News', 'Personal'];
  const allCategories = [...new Set([...categories, ...blogPosts.map(post => post.category)])];

  useEffect(() => {
    loadBlogPosts();
  }, []);

  const loadBlogPosts = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('blog_posts')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setBlogPosts(data || []);
    } catch (error) {
      toast.error('Failed to load blog posts');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveBlogPost = async (postData: Partial<BlogPost>) => {
    try {
      if (editingPost) {
        // Update existing post
        const { error } = await supabase
          .from('blog_posts')
          .update({
            ...postData,
            updated_at: new Date().toISOString()
          })
          .eq('id', editingPost.id);

        if (error) throw error;
      } else {
        // Create new post - ensure required fields are present
        if (!postData.title || !postData.slug) {
          throw new Error('Title and slug are required');
        }
        
        const { error } = await supabase
          .from('blog_posts')
          .insert([{
            ...postData,
            title: postData.title,
            slug: postData.slug,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          }]);

        if (error) throw error;
      }

      await loadBlogPosts();
      setShowEditor(false);
      setEditingPost(null);
    } catch (error) {
      console.error(error);
      throw error;
    }
  };

  const handleEditPost = (post: BlogPost) => {
    setEditingPost(post);
    setShowEditor(true);
  };

  const handleDeletePost = async (id: string) => {
    if (!confirm('Are you sure you want to delete this blog post?')) return;

    try {
      const { error } = await supabase
        .from('blog_posts')
        .delete()
        .eq('id', id);

      if (error) throw error;
      
      toast.success('Blog post deleted successfully');
      loadBlogPosts();
    } catch (error) {
      toast.error('Failed to delete blog post');
      console.error(error);
    }
  };

  const handleTogglePublish = async (post: BlogPost) => {
    try {
      const { error } = await supabase
        .from('blog_posts')
        .update({
          is_published: !post.is_published,
          published_at: !post.is_published ? new Date().toISOString() : post.published_at,
          updated_at: new Date().toISOString()
        })
        .eq('id', post.id);

      if (error) throw error;
      
      toast.success(`Blog post ${!post.is_published ? 'published' : 'unpublished'}`);
      loadBlogPosts();
    } catch (error) {
      toast.error('Failed to update blog post');
      console.error(error);
    }
  };

  // Filter posts based on search and filters
  const filteredPosts = blogPosts.filter(post => {
    const matchesSearch = searchQuery === '' || 
      post.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      post.excerpt?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      post.tags?.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesStatus = statusFilter === 'all' || 
      (statusFilter === 'published' && post.is_published) ||
      (statusFilter === 'draft' && !post.is_published);

    const matchesCategory = categoryFilter === 'all' || post.category === categoryFilter;

    return matchesSearch && matchesStatus && matchesCategory;
  });

  if (showEditor) {
    return (
      <BlogEditor
        post={editingPost || undefined}
        categories={allCategories}
        onSave={handleSaveBlogPost}
        onCancel={() => {
          setShowEditor(false);
          setEditingPost(null);
        }}
        onFileUpload={onFileUpload}
      />
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Blog Management</h2>
        <Button onClick={() => setShowEditor(true)}>
          <Plus className="w-4 h-4 mr-2" />
          Create New Post
        </Button>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
              <Input
                placeholder="Search posts..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={statusFilter} onValueChange={(value: any) => setStatusFilter(value)}>
              <SelectTrigger>
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="published">Published</SelectItem>
                <SelectItem value="draft">Draft</SelectItem>
              </SelectContent>
            </Select>
            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Filter by category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                {allCategories.map((category) => (
                  <SelectItem key={category} value={category}>
                    {category}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Blog Posts List */}
      <Card>
        <CardHeader>
          <CardTitle>
            Blog Posts ({filteredPosts.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-8">Loading...</div>
          ) : filteredPosts.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-muted-foreground">
                {blogPosts.length === 0 ? 'No blog posts yet.' : 'No posts match your filters.'}
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredPosts.map((post) => (
                <div key={post.id} className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center space-x-4 flex-1">
                    {/* Featured Media Thumbnail */}
                    <div className="w-16 h-16 flex-shrink-0">
                      {post.featured_image_url ? (
                        <img 
                          src={post.featured_image_url} 
                          alt={post.title} 
                          className="w-full h-full object-cover rounded" 
                        />
                      ) : post.featured_video_url ? (
                        <div className="w-full h-full bg-muted rounded flex items-center justify-center">
                          <Eye className="w-6 h-6 text-muted-foreground" />
                        </div>
                      ) : (
                        <div className="w-full h-full bg-muted rounded flex items-center justify-center">
                          <div className="text-xs font-medium text-muted-foreground">
                            {post.title.charAt(0)}
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Post Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-medium truncate">{post.title}</h3>
                        <Badge variant={post.is_published ? "default" : "secondary"}>
                          {post.is_published ? "Published" : "Draft"}
                        </Badge>
                        <Badge variant="outline">{post.category}</Badge>
                      </div>
                      
                      <p className="text-sm text-muted-foreground mb-2 line-clamp-2">
                        {post.excerpt || 'No excerpt provided'}
                      </p>
                      
                      <div className="flex items-center gap-4 text-xs text-muted-foreground">
                        <span>{post.read_time_minutes} min read</span>
                        <span>
                          {post.published_at 
                            ? new Date(post.published_at).toLocaleDateString()
                            : 'Not published'
                          }
                        </span>
                        {post.tags && post.tags.length > 0 && (
                          <div className="flex gap-1">
                            {post.tags.slice(0, 3).map(tag => (
                              <Badge key={tag} variant="outline" className="text-xs">
                                {tag}
                              </Badge>
                            ))}
                            {post.tags.length > 3 && (
                              <span className="text-muted-foreground">+{post.tags.length - 3}</span>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center space-x-2">
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={() => handleTogglePublish(post)}
                    >
                      {post.is_published ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={() => handleEditPost(post)}
                    >
                      <Edit2 className="w-4 h-4" />
                    </Button>
                    <Button 
                      variant="destructive" 
                      size="sm" 
                      onClick={() => handleDeletePost(post.id)}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default BlogManagement;