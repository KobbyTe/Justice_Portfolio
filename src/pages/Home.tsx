import SEO from '@/components/SEO';
import Navigation from '@/components/Navigation';
import Footer from '@/components/Footer';
import Recommendations from '@/components/Recommendations';
import ImpactMetrics from '@/components/ImpactMetrics';
import LogoCarousel from '@/components/LogoCarousel';
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
  // Use the preloaded /hero-lcp.jpg as the FIRST hero image — it matches the
  // <link rel="preload"> in index.html, so it paints instantly.
  const fallbackImages = ['/hero-lcp.jpg', heroWorkspace2, heroWorkspace3, heroWorkspace4];
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
    // Defer non-critical data fetching until the browser is idle so it doesn't
    // compete with hero image decode / first paint.
    const run = () => {
      supabase.from('hero_images').select('*').eq('is_active', true).then(({ data }) => {
        if (data && data.length > 0) setHeroImages(data.map((img: any) => img.image_url));
      });
      supabase.from('social_links').select('*').eq('is_active', true).order('sort_order').then(({ data }) => {
        setSocialLinks(data || []);
      });
      supabase.from('about_content').select('*').single().then(({ data }) => {
        setAboutContent(data);
      });
    };

    const w = window as any;
    if (typeof w.requestIdleCallback === 'function') {
      const id = w.requestIdleCallback(run, { timeout: 1500 });
      return () => w.cancelIdleCallback?.(id);
    }
    const t = setTimeout(run, 200);
    return () => clearTimeout(t);
  }, []);

  useEffect(() => {
    // Start on the preloaded LCP image; rotation begins after first paint.
    setCurrentImageIndex(0);
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
      <SEO description="Portfolio of Justice Ansah - Full-Stack Developer, STEM Educator, and Robotics Engineer." url="/" />
      <Navigation />

      {/* Full-screen Hero Section */}
      <section className="relative min-h-[100dvh] flex items-center">
        {/* Background Image */}
        <div className="absolute inset-0 z-0">
          {heroImages.map((img, idx) => {
            const isNear = idx === currentImageIndex || idx === (currentImageIndex + 1) % heroImages.length || idx === (currentImageIndex - 1 + heroImages.length) % heroImages.length;
            if (!isNear) return null;
            return (
              <img
                key={idx}
                src={img}
                alt="Developer workspace"
                className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-1000 will-change-[opacity] ${
                  idx === currentImageIndex ? 'opacity-100' : 'opacity-0'
                }`}
                loading={idx === 0 ? 'eager' : 'lazy'}
                decoding="async"
                style={{
                  maskImage: 'radial-gradient(ellipse at center, rgba(0,0,0,1) 60%, rgba(0,0,0,0.8) 80%, rgba(0,0,0,0.3) 100%)',
                  WebkitMaskImage: 'radial-gradient(ellipse at center, rgba(0,0,0,1) 60%, rgba(0,0,0,0.8) 80%, rgba(0,0,0,0.3) 100%)'
                }}
              />
            );
          })}
          {/* Stronger overlay on mobile for text readability */}
          <div className="absolute inset-0 bg-gradient-to-r from-background via-background/95 to-background/60 sm:from-background sm:via-background/90 sm:to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-t from-background/80 via-transparent to-transparent sm:from-background/60" />
          {/* Animated radial glow — smaller on mobile */}
          <div className="absolute top-1/4 left-1/4 w-48 h-48 sm:w-96 sm:h-96 rounded-full bg-primary/5 blur-3xl animate-float pointer-events-none" />
        </div>

        {/* Content */}
        <div ref={heroRef} className="container mx-auto px-4 sm:px-6 relative z-10 pt-16 sm:pt-0">
          <div className="max-w-2xl">
            <div className="space-y-5 sm:space-y-8 animate-fade-up">
              <div className="space-y-3 sm:space-y-4">
                <p className="text-primary font-medium text-sm sm:text-base tracking-widest uppercase">
                  Hello, I'm
                </p>
                <h1 className="hero-text text-[2.5rem] leading-[1.1] sm:text-5xl md:text-6xl lg:text-7xl">
                  Justice <span className="font-black">ANSAH</span>
                </h1>
                {/* Typewriter */}
                <div className="text-lg sm:text-2xl md:text-3xl font-heading font-semibold h-8 sm:h-10 flex items-center">
                  <span className="text-primary typewriter-cursor">{displayed}</span>
                </div>
                <p className="hero-subtitle text-sm sm:text-base md:text-lg max-w-lg">
                  {aboutContent?.hero_description?.split('|')[0]?.trim() ||
                    'Self-taught innovator bridging technology, agriculture, and sustainable development.'}
                </p>
              </div>

              {/* CTA Buttons */}
              <div className="flex flex-col sm:flex-row gap-3 pt-2">
                <Button asChild size="lg" className="w-full sm:w-auto bg-primary hover:bg-primary/90 text-primary-foreground font-semibold shadow-glow transition-all duration-300 hover:shadow-[0_0_28px_hsl(var(--primary)/0.5)] h-12 sm:h-11">
                  <Link to="/projects">
                    <ExternalLink className="w-4 h-4 mr-2" />
                    View My Projects
                  </Link>
                </Button>
                <Button asChild size="lg" variant="outline" className="w-full sm:w-auto border-primary/40 text-primary hover:bg-primary/10 hover:border-primary font-semibold transition-all duration-300 h-12 sm:h-11">
                  <Link to="/resume">
                    <Download className="w-4 h-4 mr-2" />
                    Download Resume
                  </Link>
                </Button>
              </div>

              {/* Social Links */}
              <div className="flex items-center space-x-2 sm:space-x-3 pt-2">
                {socialLinks.map((link: any) => (
                  <a
                    key={link.id}
                    href={link.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-2.5 min-w-[44px] min-h-[44px] flex items-center justify-center rounded-lg text-muted-foreground hover:text-primary hover:bg-primary/10 transition-all duration-200"
                  >
                    {getIcon(link.platform)}
                  </a>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Image indicator dots */}
        <div className="absolute bottom-4 sm:bottom-8 left-1/2 -translate-x-1/2 flex gap-1.5 sm:gap-2 z-10 max-w-[80vw] overflow-hidden">
          {heroImages.map((_, idx) => (
            <button
              key={idx}
              onClick={() => setCurrentImageIndex(idx)}
              aria-label={`Go to image ${idx + 1}`}
              className={`rounded-full transition-all duration-300 min-w-[10px] min-h-[10px] ${
                idx === currentImageIndex
                  ? 'w-5 sm:w-6 h-2.5 sm:h-2 bg-primary'
                  : 'w-2.5 sm:w-2 h-2.5 sm:h-2 bg-muted-foreground/40 hover:bg-muted-foreground/70'
              }`}
            />
          ))}
        </div>

        {/* Scroll indicator - hide on mobile */}
        <div className="absolute bottom-8 right-8 hidden sm:flex flex-col items-center gap-2 z-10 text-muted-foreground/60">
          <span className="text-xs tracking-widest uppercase rotate-90 origin-center mb-2">Scroll</span>
          <ArrowDown className="w-4 h-4 animate-bounce-y" />
        </div>
      </section>

      {/* Logo Carousel */}
      <LogoCarousel />

      {/* Impact Metrics Section */}
      <ImpactMetrics />

      {/* Recommendations Section */}
      <Recommendations />

      <Footer />
    </div>
  );
};

export default Home;