import { useState, useEffect, useCallback, useRef } from 'react';
import { supabase } from "@/integrations/supabase/client";
import SEO from '@/components/SEO';
import Navigation from '@/components/Navigation';
import Footer from '@/components/Footer';
import MediaItem from '@/components/MediaItem';
import { X, ChevronLeft, ChevronRight } from 'lucide-react';

interface GalleryItem {
  id: string;
  title: string;
  description: string | null;
  image_url: string;
  webp_url?: string;
  video_url?: string;
  video_webm_url?: string;
  media_type: 'image' | 'video';
  category: string;
  is_active: boolean;
}

const Gallery = () => {
  const [galleryItems, setGalleryItems] = useState<GalleryItem[]>([]);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [lightboxVisible, setLightboxVisible] = useState(false);

  // Swipe support
  const touchStartX = useRef<number | null>(null);
  const touchStartY = useRef<number | null>(null);

  const categories = ['All', 'Robotics', 'STEM Education', 'Agriculture', 'Events', 'Personal Journey'];

  useEffect(() => {
    loadGalleryItems();
  }, []);

  const loadGalleryItems = async () => {
    try {
      const { data, error } = await supabase
        .from('gallery')
        .select('*')
        .eq('is_active', true)
        .order('sort_order', { ascending: true });
      if (error) throw error;
      setGalleryItems((data || []).map(item => ({
        ...item,
        media_type: item.media_type as 'image' | 'video'
      })));
    } catch (error) {
      console.error('Error loading gallery:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const filteredItems = selectedCategory === 'All'
    ? galleryItems
    : galleryItems.filter(item => item.category === selectedCategory);

  const openLightbox = (item: GalleryItem) => {
    const idx = filteredItems.findIndex(i => i.id === item.id);
    setSelectedIndex(idx);
    setTimeout(() => setLightboxVisible(true), 10);
    // Prevent body scroll
    document.body.style.overflow = 'hidden';
  };

  const closeLightbox = () => {
    setLightboxVisible(false);
    document.body.style.overflow = '';
    setTimeout(() => setSelectedIndex(null), 300);
  };

  const navigate = useCallback((dir: 1 | -1) => {
    setSelectedIndex(prev => {
      if (prev === null) return null;
      const next = (prev + dir + filteredItems.length) % filteredItems.length;
      return next;
    });
  }, [filteredItems.length]);

  // Keyboard navigation
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (selectedIndex === null) return;
      if (e.key === 'ArrowRight') navigate(1);
      if (e.key === 'ArrowLeft') navigate(-1);
      if (e.key === 'Escape') closeLightbox();
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [selectedIndex, navigate]);

  // Touch swipe handlers
  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
    touchStartY.current = e.touches[0].clientY;
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (touchStartX.current === null || touchStartY.current === null) return;
    const dx = e.changedTouches[0].clientX - touchStartX.current;
    const dy = e.changedTouches[0].clientY - touchStartY.current;
    // Only swipe if horizontal movement > vertical and > 50px
    if (Math.abs(dx) > Math.abs(dy) && Math.abs(dx) > 50) {
      if (dx > 0) navigate(-1);
      else navigate(1);
    }
    touchStartX.current = null;
    touchStartY.current = null;
  };

  const selectedImage = selectedIndex !== null ? filteredItems[selectedIndex] : null;

  const getCategoryCount = (cat: string) =>
    cat === 'All' ? galleryItems.length : galleryItems.filter(i => i.category === cat).length;

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Navigation />
        <div className="container mx-auto px-4 pt-24 pb-12">
          <div className="text-center text-muted-foreground">Loading gallery...</div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <SEO title="Gallery" description="A visual journal showcasing Justice Ansah's work in robotics, STEM education, and innovation." url="/gallery" />
      <Navigation />

      <div className="container mx-auto px-4 pt-20 sm:pt-24 pb-12">
        {/* Header */}
        <div className="text-center mb-8 sm:mb-12 animate-fade-up">
          <p className="text-primary text-sm font-medium tracking-widest uppercase mb-3">Visual Journal</p>
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-heading font-bold text-foreground mb-3 sm:mb-4">
            Frames of <span className="text-primary">Action</span>
          </h1>
          <p className="text-sm sm:text-lg text-muted-foreground max-w-2xl mx-auto">
            A visual record of the projects, people, and ideas that shaped my journey.
          </p>
        </div>

        {/* Filter Buttons — horizontally scrollable on mobile */}
        <div className="flex gap-2 mb-8 sm:mb-10 overflow-x-auto scrollbar-none pb-2 sm:flex-wrap sm:justify-center sm:overflow-visible">
          {categories.map((category) => {
            const count = getCategoryCount(category);
            return (
              <button
                key={category}
                onClick={() => setSelectedCategory(category)}
                className={`relative flex-shrink-0 px-4 py-2.5 text-sm font-medium rounded-full border transition-all duration-300 flex items-center gap-2 ${
                  selectedCategory === category
                    ? 'bg-primary text-primary-foreground border-primary shadow-glow'
                    : 'border-border text-muted-foreground hover:text-primary hover:border-primary/50 bg-transparent'
                }`}
              >
                {category}
                <span className={`text-xs px-1.5 py-0.5 rounded-full font-bold ${
                  selectedCategory === category
                    ? 'bg-primary-foreground/20 text-primary-foreground'
                    : 'bg-muted text-muted-foreground'
                }`}>
                  {count}
                </span>
              </button>
            );
          })}
        </div>

        {/* Gallery Grid */}
        <div className="columns-2 md:columns-2 lg:columns-3 xl:columns-4 gap-3 sm:gap-4 space-y-3 sm:space-y-4">
          {filteredItems.map((item, index) => (
            <MediaItem
              key={item.id}
              item={item}
              onClick={() => openLightbox(item)}
              className="animate-fade-in"
              style={{ animationDelay: `${index * 60}ms` }}
            />
          ))}
        </div>

        {filteredItems.length === 0 && (
          <div className="text-center py-20">
            <p className="text-muted-foreground text-lg">No media found in this category.</p>
          </div>
        )}

        {/* Closing quote */}
        <div className="text-center mt-12 sm:mt-16 py-8 sm:py-12 border-t border-border">
          <blockquote className="text-lg sm:text-xl md:text-2xl font-heading italic text-primary mb-4 px-4">
            "Every picture is a chapter, but the story is still unfolding."
          </blockquote>
          <p className="text-muted-foreground text-sm">— Justice Ansah</p>
        </div>
      </div>

      {/* Animated Lightbox — mobile-optimized */}
      {selectedIndex !== null && (
        <div
          className={`fixed inset-0 z-50 flex items-center justify-center transition-all duration-300 ${
            lightboxVisible ? 'bg-black/95 opacity-100' : 'bg-black/0 opacity-0'
          }`}
          onClick={closeLightbox}
          onTouchStart={handleTouchStart}
          onTouchEnd={handleTouchEnd}
        >
          <div
            className={`relative w-full max-w-5xl max-h-[100dvh] sm:max-h-[92vh] flex flex-col transition-all duration-300 px-2 sm:px-4 ${
              lightboxVisible ? 'scale-100 opacity-100' : 'scale-95 opacity-0'
            }`}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close button — larger on mobile */}
            <button
              onClick={closeLightbox}
              className="absolute top-2 right-2 sm:-top-12 sm:right-0 p-3 text-white/70 hover:text-white hover:bg-white/10 rounded-full transition-colors z-20 bg-black/40 sm:bg-transparent"
              aria-label="Close lightbox"
            >
              <X className="w-6 h-6" />
            </button>

            {/* Counter */}
            {filteredItems.length > 1 && (
              <div className="absolute top-3 left-3 sm:-top-12 sm:left-0 text-white/60 text-sm font-medium z-20 bg-black/40 sm:bg-transparent px-2 py-1 rounded sm:px-0 sm:py-0">
                {selectedIndex + 1} / {filteredItems.length}
              </div>
            )}

            <div className="bg-background rounded-xl sm:rounded-2xl overflow-hidden border border-border shadow-2xl flex flex-col max-h-[90dvh] sm:max-h-[92vh] mt-12 sm:mt-0">
              {/* Media */}
              <div className="flex-shrink-0 relative">
                {selectedImage?.media_type === 'video' && selectedImage?.video_url ? (
                  <video
                    key={selectedImage.id}
                    className="w-full h-auto max-h-[45dvh] sm:max-h-[55vh] object-contain"
                    autoPlay loop muted playsInline preload="metadata"
                  >
                    {selectedImage.video_webm_url && (
                      <source src={selectedImage.video_webm_url} type="video/webm" />
                    )}
                    <source src={selectedImage.video_url} type="video/mp4" />
                  </video>
                ) : selectedImage && (
                  <img
                    key={selectedImage.id}
                    src={selectedImage.image_url}
                    alt={selectedImage.title}
                    className="w-full h-auto max-h-[45dvh] sm:max-h-[55vh] object-contain"
                    loading="lazy"
                    decoding="async"
                  />
                )}

                {/* Arrow navigation — larger touch targets on mobile */}
                {filteredItems.length > 1 && (
                  <>
                    <button
                      onClick={() => navigate(-1)}
                      className="absolute left-2 sm:left-3 top-1/2 -translate-y-1/2 p-3 sm:p-2 bg-background/80 backdrop-blur-sm rounded-full text-foreground hover:text-primary hover:bg-background transition-all duration-200 border border-border hover:border-primary/40"
                      aria-label="Previous image"
                    >
                      <ChevronLeft className="w-5 h-5" />
                    </button>
                    <button
                      onClick={() => navigate(1)}
                      className="absolute right-2 sm:right-3 top-1/2 -translate-y-1/2 p-3 sm:p-2 bg-background/80 backdrop-blur-sm rounded-full text-foreground hover:text-primary hover:bg-background transition-all duration-200 border border-border hover:border-primary/40"
                      aria-label="Next image"
                    >
                      <ChevronRight className="w-5 h-5" />
                    </button>
                  </>
                )}
              </div>

              {/* Info */}
              <div className="p-4 sm:p-6 overflow-y-auto scrollbar-none">
                <div className="flex items-start justify-between gap-3 mb-2 sm:mb-3">
                  <h3 className="text-lg sm:text-xl md:text-2xl font-heading font-bold text-primary">
                    {selectedImage?.title}
                  </h3>
                  {selectedImage?.category && (
                    <span className="flex-shrink-0 text-xs font-semibold text-primary bg-primary/10 px-2.5 py-1 rounded-full border border-primary/20">
                      {selectedImage.category}
                    </span>
                  )}
                </div>
                {selectedImage?.description && (
                  <p className="text-muted-foreground leading-relaxed whitespace-pre-wrap text-sm">
                    {selectedImage.description}
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      <Footer />
    </div>
  );
};

export default Gallery;