import { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import SEO from '@/components/SEO';
import Navigation from '@/components/Navigation';
import Footer from '@/components/Footer';
import { SearchAndFilters } from '@/components/blog/SearchAndFilters';
import { BlogCard } from '@/components/blog/BlogCard';
import { Skeleton } from '@/components/ui/skeleton';
import { supabase } from '@/integrations/supabase/client';

const Blog = () => {
  const navigate = useNavigate();
  const [blogPosts, setBlogPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');

  useEffect(() => {
    loadBlogPosts();
    
    // Set up realtime subscription for blog posts
    const channel = supabase
      .channel('blog-posts-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'blog_posts'
        },
        () => {
          loadBlogPosts();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const loadBlogPosts = async () => {
    try {
      setLoading(true);
      const { data } = await supabase
        .from('blog_posts')
        .select('*')
        .eq('is_published', true)
        .order('published_at', { ascending: false });
      setBlogPosts(data || []);
    } catch (error) {
      console.error('Error loading blog posts:', error);
    } finally {
      setLoading(false);
    }
  };

  // Calculate read time if not set
  const calculateReadTime = (content: string) => {
    const words = content.split(' ').length;
    return Math.max(1, Math.ceil(words / 200)); // 200 words per minute
  };

  // Get unique categories
  const categories = useMemo(() => {
    const uniqueCategories = [...new Set(blogPosts.map((post: any) => post.category))];
    return uniqueCategories.filter(Boolean);
  }, [blogPosts]);

  // Filter posts based on search and category
  const filteredPosts = useMemo(() => {
    return blogPosts.filter((post: any) => {
      const matchesSearch = searchQuery === '' || 
        post.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        post.excerpt?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        post.content?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        post.tags?.some((tag: string) => tag.toLowerCase().includes(searchQuery.toLowerCase()));
      
      const matchesCategory = selectedCategory === '' || post.category === selectedCategory;
      
      return matchesSearch && matchesCategory;
    });
  }, [blogPosts, searchQuery, selectedCategory]);

  const handleBlogClick = (slug: string) => {
    navigate(`/blog/${slug}`);
  };

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      {/* Blog Section */}
      <section className="py-16 sm:py-20">
        <div className="container mx-auto px-4 sm:px-6">
          <h1 className="section-heading text-center mb-8 sm:mb-12 text-3xl sm:text-4xl lg:text-5xl">✍️ Blog</h1>
          
          <div className="max-w-7xl mx-auto">
            {/* Search and Filters */}
            <SearchAndFilters
              onSearch={setSearchQuery}
              onCategoryChange={setSelectedCategory}
              categories={categories}
              selectedCategory={selectedCategory}
              searchQuery={searchQuery}
            />

            {/* Blog Posts Grid */}
            {loading ? (
              <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-6">
                {[...Array(6)].map((_, i) => (
                  <div key={i} className="space-y-4">
                    <Skeleton className="aspect-[16/9] rounded-lg" />
                    <Skeleton className="h-4 w-3/4" />
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-2/3" />
                  </div>
                ))}
              </div>
            ) : filteredPosts.length > 0 ? (
              <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-6">
                {filteredPosts.map((post: any) => (
                  <BlogCard
                    key={post.id}
                    post={{
                      ...post,
                      read_time_minutes: post.read_time_minutes || calculateReadTime(post.content || '')
                    }}
                    onClick={handleBlogClick}
                  />
                ))}
              </div>
            ) : (
              <div className="text-center py-16">
                <div className="glass-card p-12">
                  <h3 className="text-xl font-semibold mb-2">No posts found</h3>
                  <p className="text-muted-foreground mb-6">
                    {searchQuery || selectedCategory 
                      ? 'Try adjusting your search or filter criteria.'
                      : 'No blog posts published yet.'
                    }
                  </p>
                  {(searchQuery || selectedCategory) && (
                    <div className="flex justify-center gap-2">
                      {searchQuery && (
                        <button
                          onClick={() => setSearchQuery('')}
                          className="text-sm text-primary hover:underline"
                        >
                          Clear search
                        </button>
                      )}
                      {selectedCategory && (
                        <button
                          onClick={() => setSelectedCategory('')}
                          className="text-sm text-primary hover:underline"
                        >
                          Clear filter
                        </button>
                      )}
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Blog;