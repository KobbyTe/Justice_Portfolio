import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import Navigation from '@/components/Navigation';
import Footer from '@/components/Footer';
import { Calendar, ExternalLink } from 'lucide-react';
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

const Blog = () => {
  const [blogPosts, setBlogPosts] = useState([]);

  useEffect(() => {
    loadBlogPosts();
  }, []);

  const loadBlogPosts = async () => {
    try {
      const { data } = await supabase
        .from('blog_posts')
        .select('*')
        .eq('is_published', true)
        .order('published_at', { ascending: false });
      setBlogPosts(data || []);
    } catch (error) {
      console.error('Error loading blog posts:', error);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      {/* Blog Section */}
      <section className="py-16 sm:py-20">
        <div className="container mx-auto px-4 sm:px-6">
          <h1 className="section-heading text-center mb-8 sm:mb-12 text-3xl sm:text-4xl lg:text-5xl">✍️ Blog</h1>
          
          <div className="max-w-4xl mx-auto space-y-6">
            {blogPosts.length > 0 ? (
              blogPosts.map((post) => (
                <Card key={post.id} className="glass-card hover-lift">
                  <CardContent className="p-6 sm:p-8">
                    <div className="grid md:grid-cols-3 gap-4 sm:gap-6 items-center">
                      {post.featured_image_url && (
                        <div className="aspect-[4/3] bg-secondary rounded-lg md:col-span-1 overflow-hidden">
                          <img src={post.featured_image_url} alt={post.title} className="w-full h-full object-cover" />
                        </div>
                      )}
                      <div className={`space-y-3 sm:space-y-4 ${post.featured_image_url ? 'md:col-span-2' : 'md:col-span-3'}`}>
                        <div className="flex flex-col sm:flex-row sm:items-center sm:space-x-4 space-y-2 sm:space-y-0 text-sm text-muted-foreground">
                          <div className="flex items-center space-x-1">
                            <Calendar className="w-4 h-4" />
                            <span>
                              {post.published_at ? 
                                new Date(post.published_at).toLocaleDateString('en-US', { 
                                  year: 'numeric', 
                                  month: 'long', 
                                  day: 'numeric' 
                                }) : 
                                'Draft'
                              }
                            </span>
                          </div>
                        </div>
                        <h2 className="text-xl sm:text-2xl font-heading font-bold">{post.title}</h2>
                        <p className="text-muted-foreground text-sm sm:text-base">
                          {post.excerpt || post.content?.substring(0, 150) + '...'}
                        </p>
                        <Button variant="outline" className="border-primary text-primary hover:bg-primary hover:text-primary-foreground w-fit" size="sm">
                          Read More
                          <ExternalLink className="w-4 h-4 ml-2" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            ) : (
              <Card className="glass-card">
                <CardContent className="p-6 sm:p-8 text-center">
                  <p className="text-muted-foreground">No blog posts published yet.</p>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Blog;