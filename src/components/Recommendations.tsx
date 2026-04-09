import { useState, useEffect, useCallback } from 'react';
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent } from '@/components/ui/card';
import { ChevronLeft, ChevronRight, Linkedin, Twitter, Quote } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface Recommendation {
  id: string;
  name: string;
  position: string | null;
  company: string | null;
  message: string;
  recommender_image_url: string | null;
  linkedin_url: string | null;
  twitter_url: string | null;
  is_active: boolean;
}

const Recommendations = () => {
  const [recommendations, setRecommendations] = useState<Recommendation[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [direction, setDirection] = useState<'left' | 'right'>('right');
  const [isAnimating, setIsAnimating] = useState(false);

  useEffect(() => {
    loadRecommendations();
  }, []);

  // Auto-advance every 6 seconds
  useEffect(() => {
    if (recommendations.length <= 1) return;
    const timer = setInterval(() => {
      goNext();
    }, 6000);
    return () => clearInterval(timer);
  }, [recommendations.length, currentIndex]);

  const loadRecommendations = async () => {
    try {
      const { data, error } = await supabase
        .from('recommendations')
        .select('*')
        .eq('is_active', true)
        .order('sort_order', { ascending: true });

      if (error) throw error;
      setRecommendations(data || []);
    } catch (error) {
      console.error('Error loading recommendations:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const animateTransition = useCallback((newIndex: number, dir: 'left' | 'right') => {
    if (isAnimating) return;
    setIsAnimating(true);
    setDirection(dir);
    setTimeout(() => {
      setCurrentIndex(newIndex);
      setIsAnimating(false);
    }, 300);
  }, [isAnimating]);

  const goNext = useCallback(() => {
    const next = (currentIndex + 1) % recommendations.length;
    animateTransition(next, 'right');
  }, [currentIndex, recommendations.length, animateTransition]);

  const goPrev = useCallback(() => {
    const prev = (currentIndex - 1 + recommendations.length) % recommendations.length;
    animateTransition(prev, 'left');
  }, [currentIndex, recommendations.length, animateTransition]);

  if (isLoading || recommendations.length === 0) {
    return null;
  }

  const currentRec = recommendations[currentIndex];

  return (
    <section className="py-16 sm:py-24 relative overflow-hidden">
      {/* Background decorations */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-accent/5" />
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[600px] rounded-full bg-primary/5 blur-3xl pointer-events-none" />

      <div className="container mx-auto px-4 sm:px-6 relative z-10">
        {/* Section Header */}
        <div className="text-center mb-12 sm:mb-16">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/10 text-primary text-sm font-medium mb-4">
            <Quote className="w-3.5 h-3.5" />
            Testimonials
          </div>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-heading font-bold text-foreground mb-4">
            What People{' '}
            <span className="bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
              Say
            </span>
          </h2>
          <p className="text-muted-foreground max-w-xl mx-auto text-base sm:text-lg">
            Testimonials from colleagues, mentors, and collaborators.
          </p>
        </div>

        {/* Testimonial Card */}
        <div className="max-w-4xl mx-auto">
          <div className="relative">
            {/* Large decorative quote */}
            <div className="absolute -top-6 -left-2 sm:-left-6 z-0">
              <Quote className="w-16 h-16 sm:w-24 sm:h-24 text-primary/10 fill-primary/5" />
            </div>

            <Card
              className={`
                relative z-10 border-0 bg-card/60 backdrop-blur-xl shadow-xl
                transition-all duration-500 ease-out
                hover:shadow-2xl hover:shadow-primary/10
                ${isAnimating
                  ? direction === 'right'
                    ? 'opacity-0 translate-x-4'
                    : 'opacity-0 -translate-x-4'
                  : 'opacity-100 translate-x-0'
                }
              `}
              style={{
                background: 'linear-gradient(135deg, hsl(var(--card)) 0%, hsl(var(--card) / 0.8) 100%)',
                borderTop: '1px solid hsl(var(--primary) / 0.15)',
              }}
            >
              <CardContent className="p-6 sm:p-10 md:p-14">
                <div className="flex flex-col items-center text-center gap-6 sm:gap-8">
                  {/* Message */}
                  <blockquote className="text-lg sm:text-xl md:text-2xl leading-relaxed font-light max-w-3xl">
                    <span className="text-foreground/90 italic">
                      "{currentRec.message}"
                    </span>
                  </blockquote>

                  {/* Divider */}
                  <div className="w-12 h-0.5 bg-gradient-to-r from-transparent via-primary/40 to-transparent" />

                  {/* Author info */}
                  <div className="flex flex-col items-center gap-4">
                    {/* Avatar */}
                    <div className="relative group">
                      <div className="absolute -inset-1 bg-gradient-to-r from-primary/50 to-accent/50 rounded-full blur opacity-40 group-hover:opacity-70 transition-opacity duration-500" />
                      <div className="relative w-16 h-16 sm:w-20 sm:h-20 rounded-full overflow-hidden ring-2 ring-primary/20">
                        {currentRec.recommender_image_url ? (
                          <img
                            src={currentRec.recommender_image_url}
                            alt={currentRec.name}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full bg-gradient-to-br from-primary to-primary/70 flex items-center justify-center text-primary-foreground font-bold text-xl sm:text-2xl">
                            {currentRec.name.charAt(0)}
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Name & Role */}
                    <div className="text-center">
                      <h4 className="font-heading font-semibold text-lg text-foreground">
                        {currentRec.name}
                      </h4>
                      {currentRec.position && (
                        <p className="text-sm text-muted-foreground mt-0.5">
                          {currentRec.position}
                          {currentRec.company && (
                            <span className="text-primary/70"> · {currentRec.company}</span>
                          )}
                        </p>
                      )}
                    </div>

                    {/* Social Links */}
                    <div className="flex gap-1.5">
                      {currentRec.linkedin_url && (
                        <Button
                          size="sm"
                          variant="ghost"
                          asChild
                          className="h-9 w-9 p-0 rounded-full hover:bg-primary/10 hover:text-primary transition-colors"
                        >
                          <a
                            href={currentRec.linkedin_url}
                            target="_blank"
                            rel="noopener noreferrer"
                          >
                            <Linkedin className="w-4 h-4" />
                          </a>
                        </Button>
                      )}
                      {currentRec.twitter_url && (
                        <Button
                          size="sm"
                          variant="ghost"
                          asChild
                          className="h-9 w-9 p-0 rounded-full hover:bg-primary/10 hover:text-primary transition-colors"
                        >
                          <a
                            href={currentRec.twitter_url}
                            target="_blank"
                            rel="noopener noreferrer"
                          >
                            <Twitter className="w-4 h-4" />
                          </a>
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Navigation Controls */}
          {recommendations.length > 1 && (
            <div className="flex justify-center items-center gap-6 mt-8 sm:mt-10">
              <Button
                variant="ghost"
                size="icon"
                onClick={goPrev}
                disabled={isAnimating}
                className="h-11 w-11 rounded-full border border-border/50 hover:border-primary/50 hover:bg-primary/10 hover:text-primary transition-all duration-300"
              >
                <ChevronLeft className="w-5 h-5" />
              </Button>

              {/* Dots */}
              <div className="flex gap-2 items-center">
                {recommendations.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => {
                      const dir = index > currentIndex ? 'right' : 'left';
                      animateTransition(index, dir);
                    }}
                    disabled={isAnimating}
                    className={`
                      rounded-full transition-all duration-500 ease-out
                      ${index === currentIndex
                        ? 'w-8 h-2.5 bg-primary shadow-lg shadow-primary/30'
                        : 'w-2.5 h-2.5 bg-muted-foreground/25 hover:bg-muted-foreground/50'
                      }
                    `}
                  />
                ))}
              </div>

              <Button
                variant="ghost"
                size="icon"
                onClick={goNext}
                disabled={isAnimating}
                className="h-11 w-11 rounded-full border border-border/50 hover:border-primary/50 hover:bg-primary/10 hover:text-primary transition-all duration-300"
              >
                <ChevronRight className="w-5 h-5" />
              </Button>
            </div>
          )}
        </div>
      </div>
    </section>
  );
};

export default Recommendations;
