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

/** An error whose message is already written for the person uploading. */
export class VideoUploadError extends Error {}

// Pull the server's own message out of a tus error such as
// "... response code: 400, response text: {"statusCode":"403","error":"Unauthorized","message":"Invalid Compact JWS"} ..."
function serverDetail(message: string): { status?: string; text: string } {
  const status = message.match(/response code: (\d{3})/)?.[1];
  const body = message.match(/response text: (\{.*?\})(?:,|$)/)?.[1];
  if (body) {
    try {
      const j = JSON.parse(body);
      return { status: j.statusCode || status, text: String(j.message || j.error || body) };
    } catch {
      /* fall through */
    }
  }
  return { status, text: message };
}

export function videoUploadError(error: unknown): string {
  if (error instanceof VideoUploadError) return error.message;
  const raw = error instanceof Error ? error.message
    : error && typeof error === 'object' && 'message' in error ? String(error.message)
    : String(error);
  const name = error instanceof Error ? error.name : '';
  const { status, text } = serverDetail(raw);
  const all = `${name} ${raw}`;

  if (/maximum.*size|exceed|too large|413|EntityTooLarge/i.test(all)) {
    return 'Supabase rejected this video because of its storage size limit. The project owner needs to raise the maximum file size to 200 MB in Supabase Settings → Storage. Chunked uploads cannot bypass this limit. You can use a smaller video or Add by URL meanwhile.';
  }
  // The device lost access to the file (common with iCloud videos on iPhone).
  if (/NotReadableError|could not be read|NotFoundError/i.test(all)) {
    return "Your device couldn't read this video file. If it's stored in iCloud, open it in Photos first so it fully downloads, then try again.";
  }
  if (/jwt expired|token.*expired|exp claim/i.test(text)) {
    return 'Your sign-in has expired. Please sign in again, then retry the upload.';
  }
  if (/row-level security|row level security/i.test(text)) {
    return 'Your account is not allowed to upload videos (the admin role is required).';
  }
  const short = text.length > 200 ? `${text.slice(0, 200)}…` : text;
  return `Video upload failed${status ? ` (${status})` : ''}: ${short}`;
}
