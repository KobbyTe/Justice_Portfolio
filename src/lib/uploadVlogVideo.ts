import { supabase } from '@/integrations/supabase/client';
import { validateVlogVideo, videoContentType, VIDEO_CHUNK_BYTES, videoUploadError } from './videoUploadRules';

export async function uploadVlogVideo(file: File, onProgress: (percent: number) => void): Promise<string> {
  validateVlogVideo(file);
  const { data: { session }, error } = await supabase.auth.getSession();
  if (error || !session) throw new Error('Please sign in again before uploading a video.');
  const { Upload } = await import('tus-js-client');
  const bucket = 'portfolio-assets';
  const path = `vlogs/${crypto.randomUUID()}.${file.name.split('.').pop()?.toLowerCase()}`;
  const projectUrl = new URL(supabase.storage.from(bucket).getPublicUrl(path).data.publicUrl);
  // Direct storage hostname avoids the API proxy for large media transfers.
  const host = projectUrl.hostname.replace('.supabase.co', '.storage.supabase.co');
  await new Promise<void>((resolve, reject) => {
    let timer: ReturnType<typeof setTimeout>;
    let finished = false;
    const settle = (failure?: Error) => {
      if (finished) return;
      finished = true;
      clearTimeout(timer);
      if (failure) reject(failure); else resolve();
    };
    const armTimeout = () => {
      clearTimeout(timer);
      timer = setTimeout(() => {
        void upload.abort();
        settle(new Error('The connection stalled. Check your connection and retry the video.'));
      }, 120000);
    };
    const upload = new Upload(file, {
      endpoint: `https://${host}/storage/v1/upload/resumable`,
      headers: { authorization: `Bearer ${session.access_token}`, 'x-upsert': 'false' },
      metadata: { bucketName: bucket, objectName: path, contentType: videoContentType(file) || 'video/mp4', cacheControl: '3600' },
      chunkSize: VIDEO_CHUNK_BYTES,
      retryDelays: [0, 1000, 3000, 5000, 10000],
      uploadDataDuringCreation: true,
      removeFingerprintOnSuccess: true,
      storeFingerprintForResuming: false,
      onBeforeRequest: async (request) => {
        const { data: { session: current } } = await supabase.auth.getSession();
        if (current) request.setHeader('authorization', `Bearer ${current.access_token}`);
      },
      onProgress: (sent, total) => {
        armTimeout();
        onProgress(total ? Math.min(100, Math.round(sent / total * 100)) : 0);
      },
      onError: (failure) => settle(new Error(videoUploadError(failure))),
      onSuccess: () => settle(),
    });
    armTimeout();
    upload.start();
  });
  return supabase.storage.from(bucket).getPublicUrl(path).data.publicUrl;
}