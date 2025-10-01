/**
 * Image optimization utilities for compression and format conversion
 */

export interface OptimizedImage {
  file: File;
  url: string;
}

/**
 * Compress an image file to reduce size while maintaining quality
 */
export const compressImage = async (file: File, maxWidth: number = 1920, quality: number = 0.85): Promise<File> => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');

    img.onload = () => {
      // Calculate new dimensions
      let width = img.width;
      let height = img.height;

      if (width > maxWidth) {
        height = (height * maxWidth) / width;
        width = maxWidth;
      }

      canvas.width = width;
      canvas.height = height;

      // Draw and compress
      ctx?.drawImage(img, 0, 0, width, height);

      canvas.toBlob(
        (blob) => {
          if (blob) {
            const compressedFile = new File([blob], file.name, {
              type: 'image/jpeg',
              lastModified: Date.now(),
            });
            resolve(compressedFile);
          } else {
            reject(new Error('Failed to compress image'));
          }
        },
        'image/jpeg',
        quality
      );
    };

    img.onerror = () => reject(new Error('Failed to load image'));
    img.src = URL.createObjectURL(file);
  });
};

/**
 * Generate multiple responsive sizes for an image
 */
export const generateResponsiveSizes = async (file: File): Promise<OptimizedImage[]> => {
  const sizes = [
    { width: 640, suffix: '-sm' },
    { width: 1024, suffix: '-md' },
    { width: 1920, suffix: '-lg' },
  ];

  const results: OptimizedImage[] = [];

  for (const size of sizes) {
    const compressed = await compressImage(file, size.width, 0.85);
    const newName = file.name.replace(/\.[^/.]+$/, `${size.suffix}.jpg`);
    const renamedFile = new File([compressed], newName, { type: 'image/jpeg' });
    results.push({
      file: renamedFile,
      url: URL.createObjectURL(renamedFile),
    });
  }

  return results;
};

/**
 * Validate image file before upload
 */
export const validateImage = (file: File): { valid: boolean; error?: string } => {
  const maxSize = 20 * 1024 * 1024; // 20MB
  const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/heic', 'image/heif'];

  if (!allowedTypes.includes(file.type)) {
    return { valid: false, error: 'Invalid file type. Please upload JPEG, PNG, or WebP images.' };
  }

  if (file.size > maxSize) {
    return { valid: false, error: 'File size too large. Maximum size is 20MB.' };
  }

  return { valid: true };
};
