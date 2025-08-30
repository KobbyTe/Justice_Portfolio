import Navigation from '@/components/Navigation';
import Footer from '@/components/Footer';
import portrait from '@/assets/portrait.jpg';
import { MapPin } from 'lucide-react';
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

const About = () => {
  const [aboutContent, setAboutContent] = useState(null);

  useEffect(() => {
    loadAboutContent();
  }, []);

  const loadAboutContent = async () => {
    try {
      const { data } = await supabase.from('about_content').select('*').single();
      setAboutContent(data);
    } catch (error) {
      console.error('Error loading about content:', error);
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
                {aboutContent?.about_description || 'Experienced STEM educator and robotics engineer dedicated to transforming education through innovative technology integration. I specialize in developing comprehensive robotics curricula, implementing cutting-edge educational technologies, and creating engaging hands-on learning experiences that inspire students to pursue careers in science, technology, engineering, and mathematics.'}
              </p>

              <div className="pt-4 border-t border-border">
                <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                  <MapPin className="w-4 h-4" />
                  <span>{aboutContent?.location || 'Accra, Ghana'}</span>
                </div>
              </div>
            </div>

            <div className="relative order-1 lg:order-2">
              <div className="relative">
                <img 
                  src={aboutContent?.profile_image_url || portrait} 
                  alt="Justice Ansah - STEM Educator & Robotics Engineer" 
                  className="w-full max-w-md mx-auto transition-all duration-500"
                  style={{
                    maskImage: 'radial-gradient(ellipse at center, rgba(0,0,0,1) 70%, rgba(0,0,0,0.8) 85%, rgba(0,0,0,0.2) 100%)',
                    WebkitMaskImage: 'radial-gradient(ellipse at center, rgba(0,0,0,1) 70%, rgba(0,0,0,0.8) 85%, rgba(0,0,0,0.2) 100%)'
                  }}
                />
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