import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import Navigation from '@/components/Navigation';
import Footer from '@/components/Footer';
import { Calendar, ExternalLink } from 'lucide-react';

const Blog = () => {
  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      {/* Blog Section */}
      <section className="py-16 sm:py-20">
        <div className="container mx-auto px-4 sm:px-6">
          <h1 className="section-heading text-center mb-8 sm:mb-12 text-3xl sm:text-4xl lg:text-5xl">✍️ Blog</h1>
          
          <div className="max-w-4xl mx-auto">
            <Card className="glass-card hover-lift">
              <CardContent className="p-6 sm:p-8">
                <div className="grid md:grid-cols-3 gap-4 sm:gap-6 items-center">
                  <div className="aspect-[4/3] bg-secondary rounded-lg md:col-span-1"></div>
                  <div className="md:col-span-2 space-y-3 sm:space-y-4">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:space-x-4 space-y-2 sm:space-y-0 text-sm text-muted-foreground">
                      <span className="bg-primary/20 text-primary px-2 py-1 rounded-full text-xs font-medium w-fit">AI</span>
                      <div className="flex items-center space-x-1">
                        <Calendar className="w-4 h-4" />
                        <span>21st December 2024</span>
                      </div>
                    </div>
                    <h2 className="text-xl sm:text-2xl font-heading font-bold">The Expert Beginner</h2>
                    <p className="text-muted-foreground text-sm sm:text-base">
                      The sudden outburst of Artificial Intelligence (AI) has improved our lives, especially in...
                    </p>
                    <Button variant="outline" className="border-primary text-primary hover:bg-primary hover:text-primary-foreground w-fit" size="sm">
                      Read More
                      <ExternalLink className="w-4 h-4 ml-2" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Blog;