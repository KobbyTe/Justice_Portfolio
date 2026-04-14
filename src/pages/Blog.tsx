import { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import SEO from '@/components/SEO';
import Navigation from '@/components/Navigation';
import Footer from '@/components/Footer';
import { SearchAndFilters } from '@/components/blog/SearchAndFilters';
import { BlogCard } from '@/components/blog/BlogCard';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight, Loader2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useIsMobile } from '@/hooks/use-mobile';

const POSTS_PER_PAGE = 9;

const Blog = () => {
  const navigate = useNavigate();
  const isMobile = useIsMobile();
  const [blogPosts, setBlogPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedContentType, setSelectedContentType] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [visibleCount, setVisibleCount] = useState(POSTS_PER_PAGE);
  const [loadingMore, setLoadingMore] = useState(false);
  const sentinelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    loadBlogPosts();
    
    const channel = supabase
      .channel('blog-posts-changes')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'blog_posts' },
        () => { loadBlogPosts(); }
      )
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, []);

  // Reset when filters change
  useEffect(() => {
    setCurrentPage(1);
    setVisibleCount(POSTS_PER_PAGE);
  }, [searchQuery, selectedCategory, selectedContentType]);

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

  const calculateReadTime = (content: string) => {
    const words = content.split(' ').length;
    return Math.max(1, Math.ceil(words / 200));
  };

  const categories = useMemo(() => {
    const uniqueCategories = [...new Set(blogPosts.map((post: any) => post.category))];
    return uniqueCategories.filter(Boolean);
  }, [blogPosts]);

  const filteredPosts = useMemo(() => {
    return blogPosts.filter((post: any) => {
      const matchesSearch = searchQuery === '' || 
        post.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        post.excerpt?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        post.content?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        post.tags?.some((tag: string) => tag.toLowerCase().includes(searchQuery.toLowerCase()));
      
      const matchesCategory = selectedCategory === '' || post.category === selectedCategory;
      
      const matchesContentType = selectedContentType === '' ||
        (selectedContentType === 'vlog' && !!post.featured_video_url) ||
        (selectedContentType === 'blog' && !post.featured_video_url);
      
      return matchesSearch && matchesCategory && matchesContentType;
    });
  }, [blogPosts, searchQuery, selectedCategory, selectedContentType]);

  // Infinite scroll for mobile
  const loadMore = useCallback(() => {
    if (loadingMore || visibleCount >= filteredPosts.length) return;
    setLoadingMore(true);
    setTimeout(() => {
      setVisibleCount(prev => Math.min(prev + POSTS_PER_PAGE, filteredPosts.length));
      setLoadingMore(false);
    }, 300);
  }, [loadingMore, visibleCount, filteredPosts.length]);

  useEffect(() => {
    if (!isMobile || !sentinelRef.current) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          loadMore();
        }
      },
      { rootMargin: '200px' }
    );

    observer.observe(sentinelRef.current);
    return () => observer.disconnect();
  }, [isMobile, loadMore]);

  // Pagination for desktop
  const totalPages = Math.ceil(filteredPosts.length / POSTS_PER_PAGE);
  const displayedPosts = isMobile
    ? filteredPosts.slice(0, visibleCount)
    : filteredPosts.slice((currentPage - 1) * POSTS_PER_PAGE, currentPage * POSTS_PER_PAGE);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const getPageNumbers = () => {
    const pages: (number | 'ellipsis')[] = [];
    if (totalPages <= 5) {
      for (let i = 1; i <= totalPages; i++) pages.push(i);
    } else {
      pages.push(1);
      if (currentPage > 3) pages.push('ellipsis');
      for (let i = Math.max(2, currentPage - 1); i <= Math.min(totalPages - 1, currentPage + 1); i++) {
        pages.push(i);
      }
      if (currentPage < totalPages - 2) pages.push('ellipsis');
      pages.push(totalPages);
    }
    return pages;
  };

  const handleBlogClick = (slug: string) => {
    navigate(`/blog/${slug}`);
  };

  const pageTitle = selectedContentType === 'vlog' ? 'Vlogs' : selectedContentType === 'blog' ? 'Blog' : 'Blog & Vlogs';
  const pageEmoji = selectedContentType === 'vlog' ? '🎬' : '✍️';

  return (
    <div className="min-h-screen bg-background">
      <SEO title={pageTitle} description="Articles, vlogs and insights by Justice Ansah on robotics, STEM education, IoT, and technology innovation." url="/blog" />
      <Navigation />
      
      <section className="py-16 sm:py-20">
        <div className="container mx-auto px-4 sm:px-6">
          <h1 className="section-heading text-center mb-8 sm:mb-12 text-3xl sm:text-4xl lg:text-5xl">
            {pageEmoji} {pageTitle}
          </h1>
          
          <div className="max-w-7xl mx-auto">
            <SearchAndFilters
              onSearch={setSearchQuery}
              onCategoryChange={setSelectedCategory}
              onContentTypeChange={setSelectedContentType}
              categories={categories}
              selectedCategory={selectedCategory}
              selectedContentType={selectedContentType}
              searchQuery={searchQuery}
            />

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
              <>
                <p className="text-sm text-muted-foreground mb-4">
                  {isMobile
                    ? `Showing ${Math.min(visibleCount, filteredPosts.length)} of ${filteredPosts.length} ${filteredPosts.length === 1 ? 'post' : 'posts'}`
                    : `Showing ${(currentPage - 1) * POSTS_PER_PAGE + 1}–${Math.min(currentPage * POSTS_PER_PAGE, filteredPosts.length)} of ${filteredPosts.length} ${filteredPosts.length === 1 ? 'post' : 'posts'}`
                  }
                </p>

                <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-6">
                  {displayedPosts.map((post: any) => (
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

                {/* Infinite scroll sentinel for mobile */}
                {isMobile && visibleCount < filteredPosts.length && (
                  <div ref={sentinelRef} className="flex justify-center py-8">
                    {loadingMore && (
                      <Loader2 className="w-6 h-6 animate-spin text-primary" />
                    )}
                  </div>
                )}

                {/* Pagination for desktop */}
                {!isMobile && totalPages > 1 && (
                  <nav aria-label="Blog pagination" className="flex items-center justify-center gap-1 mt-10">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handlePageChange(currentPage - 1)}
                      disabled={currentPage === 1}
                      aria-label="Previous page"
                    >
                      <ChevronLeft className="h-4 w-4" />
                    </Button>

                    {getPageNumbers().map((page, i) =>
                      page === 'ellipsis' ? (
                        <span key={`ellipsis-${i}`} className="px-2 text-muted-foreground">…</span>
                      ) : (
                        <Button
                          key={page}
                          variant={currentPage === page ? 'default' : 'ghost'}
                          size="icon"
                          onClick={() => handlePageChange(page)}
                          aria-current={currentPage === page ? 'page' : undefined}
                          className="w-9 h-9"
                        >
                          {page}
                        </Button>
                      )
                    )}

                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handlePageChange(currentPage + 1)}
                      disabled={currentPage === totalPages}
                      aria-label="Next page"
                    >
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                  </nav>
                )}
              </>
            ) : (
              <div className="text-center py-16">
                <div className="glass-card p-12">
                  <h3 className="text-xl font-semibold mb-2">No posts found</h3>
                  <p className="text-muted-foreground mb-6">
                    {searchQuery || selectedCategory || selectedContentType
                      ? 'Try adjusting your search or filter criteria.'
                      : 'No blog posts published yet.'
                    }
                  </p>
                  {(searchQuery || selectedCategory || selectedContentType) && (
                    <div className="flex justify-center gap-2">
                      {searchQuery && (
                        <button onClick={() => setSearchQuery('')} className="text-sm text-primary hover:underline">
                          Clear search
                        </button>
                      )}
                      {selectedCategory && (
                        <button onClick={() => setSelectedCategory('')} className="text-sm text-primary hover:underline">
                          Clear filter
                        </button>
                      )}
                      {selectedContentType && (
                        <button onClick={() => setSelectedContentType('')} className="text-sm text-primary hover:underline">
                          Clear content type
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
