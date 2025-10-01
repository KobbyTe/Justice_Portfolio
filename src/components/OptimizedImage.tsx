import { useState } from 'react';
import { Skeleton } from '@/components/ui/skeleton';

interface OptimizedImageProps {
  src: string;
  alt: string;
  className?: string;
  loading?: 'lazy' | 'eager';
  webpSrc?: string;
}

const OptimizedImage = ({ 
  src, 
  alt, 
  className = "", 
  loading = "lazy",
  webpSrc 
}: OptimizedImageProps) => {
  const [hasError, setHasError] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const handleError = () => {
    setHasError(true);
    setIsLoading(false);
  };

  const handleLoad = () => {
    setIsLoading(false);
  };

  return (
    <div className="relative">
      {isLoading && (
        <Skeleton className="absolute inset-0 w-full h-full rounded-lg" />
      )}
      {webpSrc && !hasError ? (
        <picture>
          <source srcSet={webpSrc} type="image/webp" />
          <img 
            src={src} 
            alt={alt} 
            className={`${className} ${isLoading ? 'opacity-0' : 'opacity-100'} transition-opacity duration-300`}
            loading={loading}
            onError={handleError}
            onLoad={handleLoad}
            decoding="async"
          />
        </picture>
      ) : (
        <img 
          src={src} 
          alt={alt} 
          className={`${className} ${isLoading ? 'opacity-0' : 'opacity-100'} transition-opacity duration-300`}
          loading={loading}
          onError={handleError}
          onLoad={handleLoad}
          decoding="async"
        />
      )}
    </div>
  );
};

export default OptimizedImage;