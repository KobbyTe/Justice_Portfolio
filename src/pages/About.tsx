import Navigation from '@/components/Navigation';
import Footer from '@/components/Footer';
import portrait from '@/assets/portrait.jpg';
import { MapPin } from 'lucide-react';
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

const About = () => {
  const [aboutContent, setAboutContent] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadAboutContent();
  }, []);

  const loadAboutContent = async () => {
    try {
      const { data } = await supabase.from('about_content').select('*').single();
      setAboutContent(data);
    } catch (error) {
      console.error('Error loading about content:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      {/* About Section */}
      <section className="py-16 sm:py-20">
        <div className="container mx-auto px-4 sm:px-6">
          <div className="grid lg:grid-cols-2 gap-8 sm:gap-12 items-center">
            <div className="space-y-4 sm:space-y-6 order-2 lg:order-1">
              <h1 className="section-heading text-3xl sm:text-4xl lg:text-5xl">ABOUT</h1>
              <a href="mailto:justiceansah@gmail.com" className="text-primary hover:underline font-medium text-sm sm:text-base">
                justiceansah@gmail.com
              </a>
              
              <p className="text-base sm:text-lg text-muted-foreground leading-relaxed">
                {aboutContent?.about_description || 'I am Justice Ansah, a young innovator who grew up in a farming community with no background in technology. From those simple beginnings, curiosity led me to robotics, IoT development, and teaching STEM education. My work now bridges technology, agriculture, and sustainable development, with a vision to reimagine how communities grow and thrive. My journey has never been a straight line, but each step has been driven by a belief that innovation can rise from any soil. The story is still unfolding.'}
              </p>

              <div className="pt-4 border-t border-border">
                {/* Removed location display */}
              </div>
            </div>

            <div className="relative order-1 lg:order-2">
              <div className="relative">
                {!isLoading && (
                  <img 
                    src={aboutContent?.profile_image_url || portrait} 
                    alt="Justice Ansah - STEM Educator & Robotics Engineer" 
                    className="w-full max-w-md mx-auto transition-all duration-500"
                    style={{
                      maskImage: 'radial-gradient(ellipse at center, rgba(0,0,0,1) 70%, rgba(0,0,0,0.8) 85%, rgba(0,0,0,0.2) 100%)',
                      WebkitMaskImage: 'radial-gradient(ellipse at center, rgba(0,0,0,1) 70%, rgba(0,0,0,0.8) 85%, rgba(0,0,0,0.2) 100%)'
                    }}
                  />
                )}
                {isLoading && (
                  <div className="w-full max-w-md mx-auto h-96 bg-muted animate-pulse rounded-lg"></div>
                )}
                <div className="absolute inset-0 bg-gradient-to-r from-background/20 via-transparent to-background/20 pointer-events-none"></div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default About;