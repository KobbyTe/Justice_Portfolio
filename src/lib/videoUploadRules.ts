export const MAX_VLOG_BYTES = 200 * 1024 * 1024;
export const VIDEO_CHUNK_BYTES = 6 * 1024 * 1024;

export function videoContentType(file: Pick<File, 'type' | 'name'>): string | null {
  const types: Record<string, string> = { mp4: 'video/mp4', webm: 'video/webm', ogg: 'video/ogg', ogv: 'video/ogg', mov: 'video/quicktime', m4v: 'video/mp4' };
  const extension = file.name.split('.').pop()?.toLowerCase() || '';
  return types[extension] || null;
}

export function validateVlogVideo(file: Pick<File, 'size' | 'type' | 'name'>) {
  if (!videoContentType(file)) throw new Error('Choose an MP4, WebM, OGG, MOV or M4V video.');
  if (file.size === 0) throw new Error('This video is empty. Please choose another file.');
  if (file.size > MAX_VLOG_BYTES) throw new Error('Video is too large. Maximum size is 200 MB.');
}

export function videoUploadError(error: unknown): string {
  const message = error instanceof Error ? error.message : String(error);
  if (/maximum.*size|exceed|too large|413|EntityTooLarge/i.test(message)) {
    return 'Supabase rejected this video because of its storage size limit. The project owner needs to raise the maximum file size to 200 MB in Supabase Settings → Storage. Chunked uploads cannot bypass this limit. You can use a smaller video or Add by URL meanwhile.';
  }
  if (/401|403|unauthorized|jwt|permission/i.test(message)) return 'Your upload was not authorized. Sign in again and retry.';
  return `Video upload failed: ${message}`;
}