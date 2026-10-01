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
    const objectUrl = URL.createObjectURL(file);
    let settled = false;

    const finish = (fn: () => void) => {
      if (settled) return;
      settled = true;
      clearTimeout(timer);
      URL.revokeObjectURL(objectUrl);
      fn();
    };

    // Guard against browsers that never fire load/error for unsupported formats.
    const timer = setTimeout(() => finish(() => reject(new Error('Image processing timed out'))), 20000);

    img.onload = () => {
      try {
        let width = img.naturalWidth || img.width;
        let height = img.naturalHeight || img.height;
        if (!width || !height || !ctx) {
          finish(() => reject(new Error('Image could not be decoded')));
          return;
        }

        if (width > maxWidth) {
          height = Math.round((height * maxWidth) / width);
          width = maxWidth;
        }

        canvas.width = width;
        canvas.height = height;
        // White background so transparent PNGs don't turn black as JPEG.
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(0, 0, width, height);
        ctx.drawImage(img, 0, 0, width, height);

        canvas.toBlob(
          (blob) => {
            if (blob && blob.size > 0) {
              const compressedFile = new File([blob], file.name.replace(/\.[^/.]+$/, '') + '.jpg', {
                type: 'image/jpeg',
                lastModified: Date.now(),
              });
              finish(() => resolve(compressedFile));
            } else {
              finish(() => reject(new Error('Failed to compress image')));
            }
          },
          'image/jpeg',
          quality
        );
      } catch (err) {
        finish(() => reject(err instanceof Error ? err : new Error('Failed to compress image')));
      }
    };

    img.onerror = () => finish(() => reject(new Error('Failed to load image')));
    img.src = objectUrl;
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
  const allowedTypes = ['image/jpeg', 'image/jpg', 'image/pjpeg', 'image/png', 'image/webp', 'image/heic', 'image/heif', 'image/heic-sequence', 'image/heif-sequence'];
  const allowedExtensions = ['jpg', 'jpeg', 'jfif', 'png', 'webp', 'heic', 'heif'];
  const type = (file.type || '').toLowerCase();
  const extension = file.name.split('.').pop()?.toLowerCase() || '';

  // Mobile browsers (notably iOS Safari) often report an empty or generic MIME type
  // for camera-roll photos, so fall back to the file extension.
  const typeOk = allowedTypes.includes(type);
  const extOk = allowedExtensions.includes(extension);
  if (!typeOk && !extOk) {
    return { valid: false, error: 'Invalid file type. Please upload a JPEG, PNG, WebP, HEIC or HEIF image.' };
  }

  if (file.size === 0) {
    return { valid: false, error: 'The selected file is empty. Please choose another image.' };
  }

  if (file.size > maxSize) {
    return { valid: false, error: 'File size too large. Maximum size is 20MB.' };
  }

  return { valid: true };
};
