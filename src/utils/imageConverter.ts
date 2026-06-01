export const isHEIFFile = (file: File): boolean => {
  const extension = file.name.split('.').pop()?.toLowerCase();
  return extension === 'heic' || extension === 'heif';
};

export const convertHEIFToPNG = async (file: File): Promise<File> => {
  try {
    // Dynamic import: heic2any is large and only needed when the user uploads HEIC/HEIF.
    const { default: heic2any } = await import('heic2any');
    const convertedBlob = await heic2any({
      blob: file,
      toType: "image/png",
      quality: 1
    });

    const pngFile = new File([convertedBlob as Blob],
      file.name.replace(/\.(heic|heif)$/i, '.png'),
      { type: 'image/png' }
    );

    return pngFile;
  } catch (error) {
    console.error('Error converting HEIF to PNG:', error);
    throw new Error('Failed to convert HEIF/HEIC file to PNG');
  }
};

export const convertToWebP = async (file: File): Promise<File> => {
  return new Promise((resolve, reject) => {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const img = new Image();

    img.onload = () => {
      canvas.width = img.width;
      canvas.height = img.height;
      ctx?.drawImage(img, 0, 0);

      canvas.toBlob((blob) => {
        if (blob) {
          const webpFile = new File([blob],
            file.name.replace(/\.(png|jpg|jpeg|heic|heif)$/i, '.webp'),
            { type: 'image/webp' }
          );
          resolve(webpFile);
        } else {
          reject(new Error('Failed to convert to WebP'));
        }
      }, 'image/webp', 0.8);
    };

    img.onerror = () => reject(new Error('Failed to load image for WebP conversion'));
    img.src = URL.createObjectURL(file);
  });
};

export interface ConvertedImages {
  png: File;
  webp: File;
  pngUrl: string;
  webpUrl: string;
}
