import { supabase } from '@/integrations/supabase/client';
import { validateVlogVideo, videoContentType, VIDEO_CHUNK_BYTES, videoUploadError, VideoUploadError } from './videoUploadRules';

// Returns a valid access token, refreshing it first if it expires within a minute
// (long uploads can outlive the token).
async function freshAccessToken(): Promise<string> {
  const { data: { session } } = await supabase.auth.getSession();
  const expiresSoon = !session?.expires_at || session.expires_at * 1000 - Date.now() < 60_000;
  if (session && !expiresSoon) return session.access_token;
  const { data, error } = await supabase.auth.refreshSession();
  if (error || !data.session) throw new VideoUploadError('Your sign-in has expired. Please sign in again, then retry the upload.');
  return data.session.access_token;
}

export async function uploadVlogVideo(file: File, onProgress: (percent: number) => void): Promise<string> {
  validateVlogVideo(file);
  const { data: { session }, error } = await supabase.auth.getSession();
  if (error || !session) throw new VideoUploadError('Please sign in again before uploading a video.');
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
        settle(new VideoUploadError('The connection stalled. Check your connection and retry the video.'));
      }, 120000);
    };
    const upload = new Upload(file, {
      endpoint: `https://${host}/storage/v1/upload/resumable`,
      // Do NOT put Authorization here: it is set in onBeforeRequest, and setting
      // it in both places makes the browser send "Bearer A, Bearer A", which
      // storage rejects as an invalid token ("Invalid Compact JWS").
      headers: { 'x-upsert': 'false' },
      metadata: { bucketName: bucket, objectName: path, contentType: videoContentType(file) || 'video/mp4', cacheControl: '3600' },
      chunkSize: VIDEO_CHUNK_BYTES,
      retryDelays: [0, 1000, 3000, 5000, 10000],
      uploadDataDuringCreation: true,
      removeFingerprintOnSuccess: true,
      storeFingerprintForResuming: false,
      onBeforeRequest: async (request) => {
        request.setHeader('Authorization', `Bearer ${await freshAccessToken()}`);
      },
      onProgress: (sent, total) => {
        armTimeout();
        onProgress(total ? Math.min(100, Math.round(sent / total * 100)) : 0);
      },
      onError: (failure) => settle(new VideoUploadError(videoUploadError(failure))),
      onSuccess: () => settle(),
    });
    armTimeout();
    upload.start();
  });
  return supabase.storage.from(bucket).getPublicUrl(path).data.publicUrl;
}
