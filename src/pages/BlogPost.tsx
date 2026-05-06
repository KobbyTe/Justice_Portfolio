import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import SEO from '@/components/SEO';
import Navigation from '@/components/Navigation';
import Footer from '@/components/Footer';
import { LikeButton } from '@/components/blog/LikeButton';
import { SocialShare } from '@/components/blog/SocialShare';
import { CommentsSection } from '@/components/blog/CommentsSection';
import { BlogCard } from '@/components/blog/BlogCard';
import OptimizedImage from '@/components/OptimizedImage';
import { Skeleton } from '@/components/ui/skeleton';
import { ArrowLeft, Calendar, Clock } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

interface BlogPost {
  id: string;
  title: string;
  content: string;
  excerpt: string;
  featured_image_url?: string;
  featured_video_url?: string;
  slug: string;
  category: string;
  tags?: string[];
  read_time_minutes: number;
  published_at: string;
  like_count: number;
}

const BlogPost = () => {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const [post, setPost] = useState<BlogPost | null>(null);
  const [relatedPosts, setRelatedPosts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (slug) {
      loadBlogPost(slug);
    }
  }, [slug]);

  // Vlogs go to the immersive player
  useEffect(() => {
    if (post?.featured_video_url && slug) {
      navigate(`/watch/${slug}`, { replace: true });
    }
  }, [post, slug, navigate]);

  const loadBlogPost = async (postSlug: string) => {
    try {
      setLoading(true);
      setError(null);

      const { data, error } = await supabase
        .rpc('get_blog_post_with_stats', { post_slug: postSlug });

      if (error) throw error;
      
      if (!data || data.length === 0) {
        setError('Blog post not found');
        return;
      }

      setPost(data[0]);
      
      const { data: relatedData, error: relatedError } = await supabase
        .from('blog_posts')
        .select('id, title, excerpt, featured_image_url, featured_video_url, slug, category, tags, read_time_minutes, published_at')
        .eq('is_published', true)
        .eq('category', data[0].category)
        .neq('id', data[0].id)
        .order('published_at', { ascending: false })
        .limit(3);

      if (relatedError) throw relatedError;
      setRelatedPosts(relatedData || []);
    } catch (error) {
      console.error('Error loading blog post:', error);
      setError('Failed to load blog post');
      toast({
        title: "Error",
        description: "Failed to load the blog post. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const handleRelatedPostClick = (postSlug: string) => {
    navigate(`/blog/${postSlug}`);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Navigation />
        <div className="container mx-auto px-4 py-8 max-w-4xl pt-20">
          <Skeleton className="h-8 w-32 mb-6" />
          <Skeleton className="h-48 sm:h-64 w-full mb-8 rounded-lg" />
          <Skeleton className="h-10 sm:h-12 w-3/4 mb-4" />
          <Skeleton className="h-4 w-full mb-2" />
          <Skeleton className="h-4 w-full mb-2" />
          <Skeleton className="h-4 w-2/3 mb-8" />
          <div className="space-y-4">
            {[...Array(5)].map((_, i) => (
              <Skeleton key={i} className="h-4 w-full" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error || !post) {
    return (
      <div className="min-h-screen bg-background">
        <Navigation />
        <div className="container mx-auto px-4 py-16 text-center pt-24">
          <h1 className="text-2xl sm:text-3xl font-bold mb-4">Blog Post Not Found</h1>
          <p className="text-muted-foreground mb-8 text-sm sm:text-base">
            {error || "The blog post you're looking for doesn't exist or has been removed."}
          </p>
          <Button onClick={() => navigate('/blog')} className="bg-primary hover:bg-primary/90">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Blog
          </Button>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <SEO
        title={post.title}
        description={post.excerpt}
        image={post.featured_image_url}
        url={`/blog/${post.slug}`}
        type="article"
        article={{
          publishedTime: post.published_at,
          tags: post.tags,
          category: post.category,
        }}
      />
      <Navigation />
      
      <article className="pt-20 sm:pt-8 pb-8">
        <div className="container mx-auto px-4 max-w-4xl">
          {/* Back Button */}
          <Button 
            variant="ghost" 
            onClick={() => navigate('/blog')}
            className="mb-4 sm:mb-6 hover:bg-primary/10 h-10"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Blog
          </Button>

          {/* Vlogs are redirected to /watch/:slug — no inline video here */}

          {/* Hero Section */}
          <div className="space-y-4 sm:space-y-6 mb-6 sm:mb-8">
            <div className="space-y-3 sm:space-y-4">
              <Badge className="bg-primary text-primary-foreground">
                {post.category}
              </Badge>
              
              <h1 className="text-2xl sm:text-3xl lg:text-5xl font-heading font-bold leading-tight">
                {post.title}
              </h1>
              
              <div className="flex flex-wrap items-center gap-4 sm:gap-6 text-sm text-muted-foreground">
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4" />
                  <span>{formatDate(post.published_at)}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4" />
                  <span>{post.read_time_minutes} min {post.featured_video_url ? 'watch' : 'read'}</span>
                </div>
              </div>

              {/* Tags */}
              {post.tags && post.tags.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {post.tags.map((tag) => (
                    <Badge key={tag} variant="outline" className="hover:bg-primary/10 text-xs">
                      #{tag}
                    </Badge>
                  ))}
                </div>
              )}

              <div className="flex items-center gap-4 pt-2 sm:pt-4">
                <LikeButton postId={post.id} initialLikeCount={post.like_count} />
                <SocialShare 
                  title={post.title} 
                  url={`/blog/${post.slug}`}
                  excerpt={post.excerpt}
                />
              </div>
            </div>

            {/* Featured Image (only for non-vlog posts) */}
            {!post.featured_video_url && post.featured_image_url && (
              <div className="relative aspect-[16/9] rounded-lg overflow-hidden">
                <OptimizedImage
                  src={post.featured_image_url}
                  alt={post.title}
                  className="w-full h-full object-cover"
                />
              </div>
            )}
          </div>

          {/* Content - styled as notes for vlogs */}
          {post.featured_video_url && post.content && (
            <p className="text-sm text-muted-foreground mb-2 font-medium uppercase tracking-wider">Show Notes</p>
          )}

          {/* Content */}
          <div className="prose prose-lg max-w-none mb-8 sm:mb-12">
            <Card className="glass-card">
              <CardContent className="p-4 sm:p-6 md:p-8">
                <div 
                  className="prose prose-invert max-w-none prose-headings:text-foreground prose-p:text-muted-foreground prose-strong:text-foreground prose-a:text-primary hover:prose-a:text-primary/80 prose-sm sm:prose-base"
                  dangerouslySetInnerHTML={{ __html: post.content.replace(/\n/g, '<br>') }}
                />
              </CardContent>
            </Card>
          </div>

          {/* Comments Section */}
          <div className="mb-8 sm:mb-12">
            <CommentsSection postId={post.id} />
          </div>

          {/* Related Posts */}
          {relatedPosts.length > 0 && (
            <section className="space-y-4 sm:space-y-6">
              <h3 className="text-xl sm:text-2xl font-heading font-bold">Related Posts</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                {relatedPosts.map((relatedPost) => (
                  <BlogCard
                    key={relatedPost.id}
                    post={relatedPost}
                    onClick={handleRelatedPostClick}
                  />
                ))}
              </div>
            </section>
          )}
        </div>
      </article>

      <Footer />
    </div>
  );
};

export default BlogPost;