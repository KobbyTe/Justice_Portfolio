// Supabase's per-file upload limit. The Free plan is fixed at 50 MB.
// After upgrading to Supabase Pro, raise the Global file size limit in
// Supabase → Storage → Settings, then change this number to match (e.g. 500).
export const UPLOAD_LIMIT_MB = 50;
export const MAX_VLOG_BYTES = UPLOAD_LIMIT_MB * 1024 * 1024;

/** Thrown when a video is bigger than the upload limit, so the UI can offer alternatives. */
export class VideoTooLargeError extends Error {
  constructor(public readonly bytes: number) {
    super(`This video is ${Math.round(bytes / 1024 / 1024)} MB. Uploads are limited to ${UPLOAD_LIMIT_MB} MB.`);
  }
}
export const VIDEO_CHUNK_BYTES = 6 * 1024 * 1024;

export function videoContentType(file: Pick<File, 'type' | 'name'>): string | null {
  const types: Record<string, string> = { mp4: 'video/mp4', webm: 'video/webm', ogg: 'video/ogg', ogv: 'video/ogg', mov: 'video/quicktime', m4v: 'video/mp4' };
  const extension = file.name.split('.').pop()?.toLowerCase() || '';
  return types[extension] || null;
}

export function validateVlogVideo(file: Pick<File, 'size' | 'type' | 'name'>) {
  if (!videoContentType(file)) throw new Error('Choose an MP4, WebM, OGG, MOV or M4V video.');
  if (file.size === 0) throw new Error('This video is empty. Please choose another file.');
  if (file.size > MAX_VLOG_BYTES) throw new VideoTooLargeError(file.size);
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
    return `This video is over the ${UPLOAD_LIMIT_MB} MB upload limit. Compress it, or upload it to YouTube and use "Add by URL".`;
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
