import { useState, useRef, useEffect } from 'react';
import OptimizedImage from './OptimizedImage';
import { Skeleton } from '@/components/ui/skeleton';

interface MediaItemProps {
  item: {
    id: string;
    title: string;
    description: string | null;
    image_url: string;
    webp_url?: string;
    video_url?: string;
    video_webm_url?: string;
    media_type: 'image' | 'video';
  };
  onClick: () => void;
  className?: string;
  style?: React.CSSProperties;
}

const MediaItem = ({ item, onClick, className = "", style }: MediaItemProps) => {
  const [isInView, setIsInView] = useState(false);
  const [videoLoaded, setVideoLoaded] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsInView(entry.isIntersecting);
        if (entry.isIntersecting && videoRef.current && item.media_type === 'video') {
          videoRef.current.play().catch(() => {
            // Video autoplay failed, which is fine
          });
        } else if (!entry.isIntersecting && videoRef.current) {
          videoRef.current.pause();
        }
      },
      { threshold: 0.1 }
    );

    if (containerRef.current) {
      observer.observe(containerRef.current);
    }

    return () => observer.disconnect();
  }, [item.media_type]);

  if (item.media_type === 'video' && item.video_url) {
    return (
      <div
        ref={containerRef}
        className={`break-inside-avoid group cursor-pointer ${className}`}
        style={style}
        onClick={onClick}
      >
        <div className="relative overflow-hidden rounded-lg glass-card hover-scale transition-all duration-500">
          {!videoLoaded && (
            <Skeleton className="w-full h-48 rounded-lg" />
          )}
          <video
            ref={videoRef}
            className={`w-full h-auto object-cover transition-all duration-500 group-hover:scale-105 ${videoLoaded ? 'opacity-100' : 'opacity-0'}`}
            muted
            loop
            playsInline
            preload="metadata"
            onLoadedData={() => setVideoLoaded(true)}
          >
            {item.video_webm_url && (
              <source src={item.video_webm_url} type="video/webm" />
            )}
            <source src={item.video_url} type="video/mp4" />
            Your browser does not support the video tag.
          </video>
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300">
            <div className="absolute bottom-4 left-4 right-4">
              <h3 className="text-white font-semibold text-sm mb-1">{item.title}</h3>
              <div className="text-xs text-white/80 bg-white/20 px-2 py-1 rounded inline-block">
                Video
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      ref={containerRef}
      className={`break-inside-avoid group cursor-pointer ${className}`}
      style={style}
      onClick={onClick}
    >
      <div className="relative overflow-hidden rounded-lg glass-card hover-scale transition-all duration-500">
        <OptimizedImage
          src={item.image_url}
          webpSrc={item.webp_url}
          alt={item.title}
          className="w-full h-auto object-cover transition-transform duration-500 group-hover:scale-105"
          loading="lazy"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300">
          <div className="absolute bottom-4 left-4 right-4">
            <h3 className="text-white font-semibold text-sm mb-1">{item.title}</h3>
            <div className="text-xs text-white/80 bg-white/20 px-2 py-1 rounded inline-block">
              Image
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MediaItem;