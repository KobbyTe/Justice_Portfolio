import { Button } from '@/components/ui/button';
import Navigation from '@/components/Navigation';
import Footer from '@/components/Footer';
import Recommendations from '@/components/Recommendations';
import TechStack from '@/components/TechStack';
import ImpactMetrics from '@/components/ImpactMetrics';
import heroWorkspace1 from '@/assets/hero-workspace.jpg';
import heroWorkspace2 from '@/assets/hero-workspace-2.jpg';
import heroWorkspace3 from '@/assets/hero-workspace-3.jpg';
import heroWorkspace4 from '@/assets/hero-workspace-4.jpg';
import { Download, Github, Linkedin, Twitter, Instagram } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

const Home = () => {
  const fallbackImages = [heroWorkspace1, heroWorkspace2, heroWorkspace3, heroWorkspace4];
  const [heroImages, setHeroImages] = useState(fallbackImages);
  const [socialLinks, setSocialLinks] = useState([]);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [aboutContent, setAboutContent] = useState(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [heroRes, socialRes, aboutRes] = await Promise.all([
        supabase.from('hero_images').select('*').eq('is_active', true),
        supabase.from('social_links').select('*').eq('is_active', true).order('sort_order'),
        supabase.from('about_content').select('*').single()
      ]);

      if (heroRes.data && heroRes.data.length > 0) {
        setHeroImages(heroRes.data.map(img => img.image_url));
      }
      setSocialLinks(socialRes.data || []);
      setAboutContent(aboutRes.data);
    } catch (error) {
      console.error('Error loading data:', error);
    }
  };

  useEffect(() => {
    // Set random image on initial load
    setCurrentImageIndex(Math.floor(Math.random() * heroImages.length));
    
    // Change image every 10 seconds
    const interval = setInterval(() => {
      setCurrentImageIndex((prev) => (prev + 1) % heroImages.length);
    }, 10000);

    return () => clearInterval(interval);
  }, [heroImages.length]);
  return (
    <div className="min-h-screen bg-background relative overflow-hidden">
      <Navigation />

      {/* Full-screen Hero Section */}
      <section className="relative min-h-screen flex items-center">
        {/* Background Image - Full Screen */}
        <div className="absolute inset-0 z-0">
          <img 
            src={heroImages[currentImageIndex]} 
            alt="Developer workspace with vivid screen wallpaper" 
            className="w-full h-full object-cover transition-opacity duration-1000"
            style={{
              maskImage: 'radial-gradient(ellipse at center, rgba(0,0,0,1) 60%, rgba(0,0,0,0.8) 80%, rgba(0,0,0,0.3) 100%)',
              WebkitMaskImage: 'radial-gradient(ellipse at center, rgba(0,0,0,1) 60%, rgba(0,0,0,0.8) 80%, rgba(0,0,0,0.3) 100%)'
            }}
          />
          <div className="absolute inset-0 bg-gradient-to-r from-background via-background/90 to-transparent"></div>
        </div>

        {/* Content */}
        <div className="container mx-auto px-4 sm:px-6 relative z-10">
          <div className="max-w-2xl">
            <div className="space-y-6 sm:space-y-8">
              <div className="space-y-3 sm:space-y-4">
                <p className="text-primary font-medium text-sm sm:text-base">Hello, I'm</p>
                <h1 className="hero-text text-4xl sm:text-5xl md:text-6xl lg:text-7xl">
                  Justice <span className="font-black">ANSAH</span>
                </h1>
                <p className="hero-subtitle text-lg sm:text-xl md:text-2xl">
                  {aboutContent?.hero_description || 'Self-Taught Robotics Engineer & IoT Developer | STE(A)M & STEM Instructor | Innovator | Agriculture Enthusiast | Aspiring Estate Developer'}
                </p>
              </div>
              

              {/* Social Links */}
              <div className="flex items-center space-x-4 pt-4">
                {socialLinks.map((link) => {
                  const getIcon = (platform) => {
                    switch (platform.toLowerCase()) {
                      case 'github': return <Github className="w-5 h-5" />;
                      case 'linkedin': return <Linkedin className="w-5 h-5" />;
                      case 'twitter': return <Twitter className="w-5 h-5" />;
                      case 'instagram': return <Instagram className="w-5 h-5" />;
                      default: return <Github className="w-5 h-5" />;
                    }
                  };
                  
                  return (
                    <a 
                      key={link.id}
                      href={link.url} 
                      target="_blank" 
                      rel="noopener noreferrer" 
                      className="p-2 text-muted-foreground hover:text-primary transition-colors"
                    >
                      {getIcon(link.platform)}
                    </a>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Impact Metrics Section */}
      <ImpactMetrics />

      {/* Recommendations Section */}
      <Recommendations />

      <Footer />
    </div>
  );
};

export default Home;