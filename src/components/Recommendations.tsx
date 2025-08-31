import { useState, useEffect } from 'react';
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent } from '@/components/ui/card';
import { ChevronLeft, ChevronRight, Linkedin, Twitter } from 'lucide-react';
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

  useEffect(() => {
    loadRecommendations();
  }, []);

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

  const nextRecommendation = () => {
    setCurrentIndex((prev) => (prev + 1) % recommendations.length);
  };

  const prevRecommendation = () => {
    setCurrentIndex((prev) => (prev - 1 + recommendations.length) % recommendations.length);
  };

  if (isLoading || recommendations.length === 0) {
    return null;
  }

  const currentRec = recommendations[currentIndex];

  return (
    <section className="py-16 bg-gradient-to-br from-background via-background/95 to-accent/10">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-heading font-bold text-primary mb-4">
            What People Say
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Testimonials from colleagues, mentors, and collaborators who've witnessed the journey.
          </p>
        </div>

        <div className="max-w-4xl mx-auto">
          <Card className="glass-card border-primary/20">
            <CardContent className="p-8 md:p-12">
              <div className="flex flex-col md:flex-row items-center gap-8">
                {/* Profile Section */}
                <div className="flex-shrink-0 text-center">
                  <div className="w-20 h-20 md:w-24 md:h-24 rounded-full overflow-hidden mb-4 mx-auto border-2 border-primary/30">
                    {currentRec.recommender_image_url ? (
                      <img
                        src={currentRec.recommender_image_url}
                        alt={currentRec.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full bg-gradient-primary flex items-center justify-center text-white font-bold text-xl">
                        {currentRec.name.charAt(0)}
                      </div>
                    )}
                  </div>
                  
                  <h4 className="font-semibold text-primary">{currentRec.name}</h4>
                  {currentRec.position && (
                    <p className="text-sm text-muted-foreground">
                      {currentRec.position}
                      {currentRec.company && ` at ${currentRec.company}`}
                    </p>
                  )}
                  
                  {/* Social Links */}
                  <div className="flex justify-center gap-2 mt-3">
                    {currentRec.linkedin_url && (
                      <Button
                        size="sm"
                        variant="ghost"
                        asChild
                        className="h-8 w-8 p-0"
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
                        className="h-8 w-8 p-0"
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

                {/* Testimonial Content */}
                <div className="flex-1">
                  <blockquote className="text-lg md:text-xl leading-relaxed text-center md:text-left">
                    <span className="text-primary text-4xl leading-none">"</span>
                    <span className="text-foreground italic">
                      {currentRec.message}
                    </span>
                    <span className="text-primary text-4xl leading-none">"</span>
                  </blockquote>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Navigation */}
          {recommendations.length > 1 && (
            <div className="flex justify-center items-center gap-4 mt-8">
              <Button
                variant="outline"
                size="icon"
                onClick={prevRecommendation}
                className="hover:bg-primary hover:text-primary-foreground transition-colors"
              >
                <ChevronLeft className="w-4 h-4" />
              </Button>
              
              <div className="flex gap-2">
                {recommendations.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => setCurrentIndex(index)}
                    className={`w-2 h-2 rounded-full transition-all duration-300 ${
                      index === currentIndex
                        ? 'bg-primary w-6'
                        : 'bg-muted-foreground/30 hover:bg-muted-foreground/60'
                    }`}
                  />
                ))}
              </div>
              
              <Button
                variant="outline"
                size="icon"
                onClick={nextRecommendation}
                className="hover:bg-primary hover:text-primary-foreground transition-colors"
              >
                <ChevronRight className="w-4 h-4" />
              </Button>
            </div>
          )}
        </div>
      </div>
    </section>
  );
};

export default Recommendations;