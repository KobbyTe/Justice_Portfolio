import { useState, useEffect } from 'react';
import { supabase } from "@/integrations/supabase/client";
import Navigation from '@/components/Navigation';
import Footer from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { X } from 'lucide-react';
import MediaItem from '@/components/MediaItem';

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
  const [selectedImage, setSelectedImage] = useState<GalleryItem | null>(null);
  const [isLoading, setIsLoading] = useState(true);

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

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Navigation />
        <div className="container mx-auto px-4 pt-24 pb-12">
          <div className="text-center">Loading...</div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      <div className="container mx-auto px-4 pt-24 pb-12">
        {/* Header Section */}
        <div className="text-center mb-12 animate-fade-in">
          <h1 className="text-4xl md:text-5xl font-heading font-bold text-primary mb-4">
            Frames of Action
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            A visual record of the projects, people, and ideas that shaped my journey.
          </p>
        </div>

        {/* Filter Buttons */}
        <div className="flex flex-wrap justify-center gap-2 mb-8">
          {categories.map((category) => (
            <Button
              key={category}
              variant={selectedCategory === category ? "default" : "outline"}
              size="sm"
              onClick={() => setSelectedCategory(category)}
              className="transition-all duration-300"
            >
              {category}
            </Button>
          ))}
        </div>

        {/* Gallery Grid */}
        <div className="columns-1 md:columns-2 lg:columns-3 xl:columns-4 gap-4 space-y-4">
          {filteredItems.map((item, index) => (
            <MediaItem
              key={item.id}
              item={item}
              onClick={() => setSelectedImage(item)}
              className="animate-fade-in"
              style={{ animationDelay: `${index * 100}ms` }}
            />
          ))}
        </div>

        {filteredItems.length === 0 && (
          <div className="text-center py-12">
            <p className="text-muted-foreground">No media found in this category.</p>
          </div>
        )}

        {/* Closing Section */}
        <div className="text-center mt-16 py-12 border-t border-border">
          <blockquote className="text-xl md:text-2xl font-heading italic text-primary mb-6">
            "Every picture is a chapter, but the story is still unfolding."
          </blockquote>
          <Button size="lg" className="bg-gradient-primary">
            View My Full Portfolio
          </Button>
        </div>
      </div>

      {/* Enhanced Lightbox Modal */}
      {selectedImage && (
        <div 
          className="fixed inset-0 bg-black/95 z-50 flex items-center justify-center p-4"
          onClick={() => setSelectedImage(null)}
        >
          <div 
            className="relative w-full max-w-6xl max-h-[95vh] flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="bg-background rounded-lg overflow-hidden flex flex-col max-h-full">
              {/* Media Container */}
              <div className="flex-shrink-0">
                {selectedImage.media_type === 'video' && selectedImage.video_url ? (
                  <video
                    className="w-full h-auto max-h-[60vh] object-contain"
                    autoPlay
                    loop
                    muted
                    playsInline
                  >
                    {selectedImage.video_webm_url && (
                      <source src={selectedImage.video_webm_url} type="video/webm" />
                    )}
                    <source src={selectedImage.video_url} type="video/mp4" />
                    Your browser does not support the video tag.
                  </video>
                ) : (
                  <img
                    src={selectedImage.image_url}
                    alt={selectedImage.title}
                    className="w-full h-auto max-h-[60vh] object-contain"
                  />
                )}
              </div>
              
              {/* Scrollable Description Container */}
              <div className="p-6 overflow-y-scroll scrollbar-none flex-1 min-h-0">
                <h3 className="text-2xl md:text-3xl font-heading font-bold text-primary mb-4">
                  {selectedImage.title}
                </h3>
                {selectedImage.description && (
                  <div className="max-h-96 overflow-y-scroll scrollbar-none">
                    <p className="text-muted-foreground leading-relaxed whitespace-pre-wrap">
                      {selectedImage.description}
                    </p>
                  </div>
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