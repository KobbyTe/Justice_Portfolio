import { Button } from '@/components/ui/button';
import Navigation from '@/components/Navigation';
import Footer from '@/components/Footer';
import heroWorkspace1 from '@/assets/hero-workspace.jpg';
import heroWorkspace2 from '@/assets/hero-workspace-2.jpg';
import heroWorkspace3 from '@/assets/hero-workspace-3.jpg';
import heroWorkspace4 from '@/assets/hero-workspace-4.jpg';
import { Download, Github, Linkedin, Twitter, Instagram } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useState, useEffect } from 'react';

const Home = () => {
  const heroImages = [heroWorkspace1, heroWorkspace2, heroWorkspace3, heroWorkspace4];
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

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
                <p className="hero-subtitle text-lg sm:text-xl md:text-2xl">STEM Educator & Robotics Engineer</p>
              </div>
              
              <div className="flex flex-col sm:flex-row gap-4">
                <Button asChild className="bg-primary hover:bg-primary/90 text-primary-foreground w-full sm:w-auto">
                  <Link to="/resume">
                    <Download className="w-4 h-4 mr-2" />
                    Résumé
                  </Link>
                </Button>
              </div>

              {/* Social Links */}
              <div className="flex items-center space-x-4 pt-4">
                <a href="https://github.com/KobbyTe" target="_blank" rel="noopener noreferrer" className="p-2 text-muted-foreground hover:text-primary transition-colors">
                  <Github className="w-5 h-5" />
                </a>
                <a href="https://www.linkedin.com/in/justice-ansah-85917529a/" target="_blank" rel="noopener noreferrer" className="p-2 text-muted-foreground hover:text-primary transition-colors">
                  <Linkedin className="w-5 h-5" />
                </a>
                <a href="#" className="p-2 text-muted-foreground hover:text-primary transition-colors">
                  <Twitter className="w-5 h-5" />
                </a>
                <a href="#" className="p-2 text-muted-foreground hover:text-primary transition-colors">
                  <Instagram className="w-5 h-5" />
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Home;