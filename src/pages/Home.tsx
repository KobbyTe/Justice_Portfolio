import Navigation from '@/components/Navigation';
import Footer from '@/components/Footer';
import Recommendations from '@/components/Recommendations';
import TechStack from '@/components/TechStack';
import ImpactMetrics from '@/components/ImpactMetrics';
import heroWorkspace1 from '@/assets/hero-workspace.jpg';
import heroWorkspace2 from '@/assets/hero-workspace-2.jpg';
import heroWorkspace3 from '@/assets/hero-workspace-3.jpg';
import heroWorkspace4 from '@/assets/hero-workspace-4.jpg';
import { Download, Github, Linkedin, Twitter, Instagram, ArrowDown, ExternalLink } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useState, useEffect, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';

const ROLES = ['Robotics Engineer', 'IoT Developer', 'STEM Instructor', 'Innovator'];

const Home = () => {
  const fallbackImages = [heroWorkspace1, heroWorkspace2, heroWorkspace3, heroWorkspace4];
  const [heroImages, setHeroImages] = useState(fallbackImages);
  const [socialLinks, setSocialLinks] = useState([]);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [aboutContent, setAboutContent] = useState(null);

  // Typewriter state
  const [roleIndex, setRoleIndex] = useState(0);
  const [displayed, setDisplayed] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);
  const typeRef = useRef<ReturnType<typeof setTimeout>>();

  // Scroll-reveal
  const heroRef = useRef<HTMLDivElement>(null);

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
    setCurrentImageIndex(Math.floor(Math.random() * heroImages.length));
    const interval = setInterval(() => {
      setCurrentImageIndex((prev) => (prev + 1) % heroImages.length);
    }, 10000);
    return () => clearInterval(interval);
  }, [heroImages.length]);

  // Typewriter effect
  useEffect(() => {
    const currentRole = ROLES[roleIndex];
    const typingSpeed = isDeleting ? 50 : 90;
    const pauseDelay = isDeleting ? 0 : 1800;

    if (!isDeleting && displayed === currentRole) {
      typeRef.current = setTimeout(() => setIsDeleting(true), pauseDelay);
      return;
    }
    if (isDeleting && displayed === '') {
      setIsDeleting(false);
      setRoleIndex((prev) => (prev + 1) % ROLES.length);
      return;
    }

    typeRef.current = setTimeout(() => {
      setDisplayed(isDeleting
        ? currentRole.slice(0, displayed.length - 1)
        : currentRole.slice(0, displayed.length + 1)
      );
    }, typingSpeed);

    return () => clearTimeout(typeRef.current);
  }, [displayed, isDeleting, roleIndex]);

  const getIcon = (platform: string) => {
    switch (platform.toLowerCase()) {
      case 'github': return <Github className="w-5 h-5" />;
      case 'linkedin': return <Linkedin className="w-5 h-5" />;
      case 'twitter': return <Twitter className="w-5 h-5" />;
      case 'instagram': return <Instagram className="w-5 h-5" />;
      default: return <ExternalLink className="w-5 h-5" />;
    }
  };

  return (
    <div className="min-h-screen bg-background relative overflow-hidden">
      <Navigation />

      {/* Full-screen Hero Section */}
      <section className="relative min-h-screen flex items-center">
        {/* Background Image */}
        <div className="absolute inset-0 z-0">
          {heroImages.map((img, idx) => (
            <img
              key={idx}
              src={img}
              alt="Developer workspace"
              className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-1000 ${
                idx === currentImageIndex ? 'opacity-100' : 'opacity-0'
              }`}
              loading={idx === 0 ? 'eager' : 'lazy'}
              decoding="async"
              fetchPriority={idx === 0 ? 'high' : 'auto'}
              style={{
                maskImage: 'radial-gradient(ellipse at center, rgba(0,0,0,1) 60%, rgba(0,0,0,0.8) 80%, rgba(0,0,0,0.3) 100%)',
                WebkitMaskImage: 'radial-gradient(ellipse at center, rgba(0,0,0,1) 60%, rgba(0,0,0,0.8) 80%, rgba(0,0,0,0.3) 100%)'
              }}
            />
          ))}
          <div className="absolute inset-0 bg-gradient-to-r from-background via-background/90 to-transparent" />
          {/* Glow overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-background/60 via-transparent to-transparent" />
          {/* Animated radial glow */}
          <div className="absolute top-1/4 left-1/4 w-96 h-96 rounded-full bg-primary/5 blur-3xl animate-float pointer-events-none" />
        </div>

        {/* Content */}
        <div ref={heroRef} className="container mx-auto px-4 sm:px-6 relative z-10">
          <div className="max-w-2xl">
            <div className="space-y-6 sm:space-y-8 animate-fade-up">
              <div className="space-y-3 sm:space-y-4">
                <p className="text-primary font-medium text-sm sm:text-base tracking-widest uppercase">
                  Hello, I'm
                </p>
                <h1 className="hero-text text-4xl sm:text-5xl md:text-6xl lg:text-7xl">
                  Justice <span className="font-black">ANSAH</span>
                </h1>
                {/* Typewriter */}
                <div className="text-xl sm:text-2xl md:text-3xl font-heading font-semibold h-10 flex items-center">
                  <span className="text-primary typewriter-cursor">{displayed}</span>
                </div>
                <p className="hero-subtitle text-base sm:text-lg max-w-lg">
                  {aboutContent?.hero_description?.split('|')[0]?.trim() ||
                    'Self-taught innovator bridging technology, agriculture, and sustainable development.'}
                </p>
              </div>

              {/* CTA Buttons */}
              <div className="flex flex-wrap gap-3 pt-2">
                <Button asChild size="lg" className="bg-primary hover:bg-primary/90 text-primary-foreground font-semibold shadow-glow transition-all duration-300 hover:shadow-[0_0_28px_hsl(var(--primary)/0.5)]">
                  <Link to="/projects">
                    <ExternalLink className="w-4 h-4 mr-2" />
                    View My Projects
                  </Link>
                </Button>
                <Button asChild size="lg" variant="outline" className="border-primary/40 text-primary hover:bg-primary/10 hover:border-primary font-semibold transition-all duration-300">
                  <Link to="/resume">
                    <Download className="w-4 h-4 mr-2" />
                    Download Resume
                  </Link>
                </Button>
              </div>

              {/* Social Links */}
              <div className="flex items-center space-x-3 pt-2">
                {socialLinks.map((link: any) => (
                  <a
                    key={link.id}
                    href={link.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-2 rounded-lg text-muted-foreground hover:text-primary hover:bg-primary/10 transition-all duration-200"
                  >
                    {getIcon(link.platform)}
                  </a>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Image indicator dots */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex gap-2 z-10">
          {heroImages.map((_, idx) => (
            <button
              key={idx}
              onClick={() => setCurrentImageIndex(idx)}
              aria-label={`Go to image ${idx + 1}`}
              className={`rounded-full transition-all duration-300 ${
                idx === currentImageIndex
                  ? 'w-6 h-2 bg-primary'
                  : 'w-2 h-2 bg-muted-foreground/40 hover:bg-muted-foreground/70'
              }`}
            />
          ))}
        </div>

        {/* Scroll indicator */}
        <div className="absolute bottom-8 right-8 flex flex-col items-center gap-2 z-10 text-muted-foreground/60">
          <span className="text-xs tracking-widest uppercase rotate-90 origin-center mb-2">Scroll</span>
          <ArrowDown className="w-4 h-4 animate-bounce-y" />
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
