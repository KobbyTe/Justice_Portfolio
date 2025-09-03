import { useState } from 'react';

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

  const handleError = () => {
    setHasError(true);
  };

  // If we have both WebP and fallback sources, use picture element
  if (webpSrc && !hasError) {
    return (
      <picture>
        <source srcSet={webpSrc} type="image/webp" />
        <img 
          src={src} 
          alt={alt} 
          className={className}
          loading={loading}
          onError={handleError}
        />
      </picture>
    );
  }

  // Fallback to regular img element
  return (
    <img 
      src={src} 
      alt={alt} 
      className={className}
      loading={loading}
      onError={handleError}
    />
  );
};

export default OptimizedImage;