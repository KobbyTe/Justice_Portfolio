// Shrinks a video in the browser so it fits under the upload limit.
//
// It plays the video once (silently) into a 720p canvas and re-records it with
// the browser's built-in MediaRecorder at a bitrate chosen to land under the
// target size. That takes about as long as the video itself, needs no extra
// libraries, and works in current Chrome, Edge, Firefox and Safari (iPhone
// included). The page must stay open and on screen while it runs.
//
// IMPORTANT: call this directly from a click/tap handler. Browsers only allow a
// video to start playing in response to a user action.

export interface CompressOptions {
  targetBytes: number;
  onProgress?: (percent: number) => void;
  signal?: AbortSignal;
}

export class CompressError extends Error {}

const MAX_LONG_SIDE = 1280; // 720p
const AUDIO_BPS = 96_000;
const MIN_VIDEO_BPS = 350_000;
const MAX_VIDEO_BPS = 4_000_000;

function pickMimeType(): string | null {
  if (typeof MediaRecorder === 'undefined') return null;
  const candidates = [
    'video/mp4;codecs=avc1.42E01E,mp4a.40.2',
    'video/mp4;codecs=avc1,mp4a',
    'video/mp4',
    'video/webm;codecs=vp9,opus',
    'video/webm;codecs=vp8,opus',
    'video/webm',
  ];
  return candidates.find((t) => MediaRecorder.isTypeSupported(t)) || null;
}

export function canCompressVideo(): boolean {
  return (
    typeof document !== 'undefined' &&
    !!pickMimeType() &&
    typeof HTMLCanvasElement !== 'undefined' &&
    'captureStream' in HTMLCanvasElement.prototype
  );
}

const once = (el: EventTarget, event: string) =>
  new Promise<void>((resolve) => el.addEventListener(event, () => resolve(), { once: true }));

export async function compressVideo(file: File, { targetBytes, onProgress, signal }: CompressOptions): Promise<File> {
  const mimeType = pickMimeType();
  if (!mimeType || !canCompressVideo()) {
    throw new CompressError("This browser can't compress videos. Try Chrome or Safari on a computer, or use YouTube.");
  }

  const url = URL.createObjectURL(file);
  const video = document.createElement('video');
  video.playsInline = true;
  video.preload = 'auto';
  video.src = url;

  // Route the sound into the recording only, so nothing plays out loud.
  let audioCtx: AudioContext | null = null;
  let audioDest: MediaStreamAudioDestinationNode | null = null;
  try {
    const Ctx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    audioCtx = new Ctx();
    const source = audioCtx.createMediaElementSource(video);
    audioDest = audioCtx.createMediaStreamDestination();
    source.connect(audioDest);
  } catch {
    // No audio routing available: record without sound rather than play it aloud.
    audioCtx = null;
    audioDest = null;
    video.muted = true;
  }

  // Start playback while we are still inside the tap that triggered this.
  const firstPlay = video.play();

  let recorder: MediaRecorder | null = null;
  let stopDrawing = false;
  const cleanup = () => {
    stopDrawing = true;
    try {
      if (recorder && recorder.state !== 'inactive') recorder.stop();
    } catch {
      /* ignore */
    }
    video.pause();
    video.removeAttribute('src');
    video.load();
    URL.revokeObjectURL(url);
    void audioCtx?.close();
  };

  try {
    await firstPlay;
    video.pause();
    if (!video.duration || !isFinite(video.duration)) await once(video, 'loadedmetadata');
    const duration = video.duration;
    if (!duration || !isFinite(duration)) throw new CompressError("Couldn't read this video's length.");

    // Bitrate that keeps the result under the target (with 8% headroom).
    const totalBps = Math.floor((targetBytes * 0.92 * 8) / duration);
    const videoBps = Math.min(MAX_VIDEO_BPS, totalBps - AUDIO_BPS);
    if (videoBps < MIN_VIDEO_BPS) {
      throw new CompressError(
        `This video is too long (${Math.round(duration / 60)} min) to fit under the limit at watchable quality. Please use YouTube for it.`
      );
    }

    const scale = Math.min(1, MAX_LONG_SIDE / Math.max(video.videoWidth, video.videoHeight));
    const width = Math.max(2, Math.round((video.videoWidth * scale) / 2) * 2);
    const height = Math.max(2, Math.round((video.videoHeight * scale) / 2) * 2);
    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext('2d');
    if (!ctx) throw new CompressError("This browser can't compress videos.");

    const stream = canvas.captureStream(30);
    audioDest?.stream.getAudioTracks().forEach((t) => stream.addTrack(t));

    recorder = new MediaRecorder(stream, { mimeType, videoBitsPerSecond: videoBps, audioBitsPerSecond: AUDIO_BPS });
    const chunks: Blob[] = [];
    recorder.ondataavailable = (e) => {
      if (e.data && e.data.size) chunks.push(e.data);
    };
    const stopped = new Promise<void>((resolve) => recorder!.addEventListener('stop', () => resolve(), { once: true }));

    // Rewind, then record while playing through once.
    video.currentTime = 0;
    await once(video, 'seeked');
    await audioCtx?.resume();

    const draw = () => {
      if (stopDrawing) return;
      ctx.drawImage(video, 0, 0, width, height);
      onProgress?.(Math.min(99, Math.round((video.currentTime / duration) * 100)));
      if ('requestVideoFrameCallback' in video) {
        (video as HTMLVideoElement & { requestVideoFrameCallback: (cb: () => void) => void }).requestVideoFrameCallback(draw);
      } else {
        requestAnimationFrame(draw);
      }
    };

    let lastTime = -1;
    let stalledFor = 0;
    const result = new Promise<void>((resolve, reject) => {
      video.addEventListener('ended', () => resolve(), { once: true });
      video.addEventListener('error', () => reject(new CompressError("This video couldn't be read for compression.")), { once: true });
      signal?.addEventListener('abort', () => reject(new CompressError('Compression cancelled.')), { once: true });
      // If playback stops moving (e.g. the screen locked), stop instead of hanging.
      const watchdog = setInterval(() => {
        if (stopDrawing) return clearInterval(watchdog);
        if (video.currentTime === lastTime) {
          stalledFor += 1;
          if (stalledFor >= 15) {
            clearInterval(watchdog);
            reject(new CompressError('Compression stopped. Keep this page open and the screen on while it runs, then try again.'));
          }
        } else {
          stalledFor = 0;
          lastTime = video.currentTime;
        }
      }, 1000);
    });

    recorder.start(1000);
    draw();
    await video.play();
    await result;

    recorder.stop();
    await stopped;
    stopDrawing = true;

    const type = mimeType.split(';')[0];
    const ext = type === 'video/mp4' ? 'mp4' : 'webm';
    const out = new Blob(chunks, { type });
    if (!out.size) throw new CompressError('Compression produced an empty video.');
    if (out.size > targetBytes) {
      throw new CompressError(
        `Even compressed, this video is ${Math.round(out.size / 1024 / 1024)} MB, still over the limit. Please use YouTube for it.`
      );
    }
    onProgress?.(100);
    const base = file.name.replace(/\.[^.]+$/, '') || 'video';
    return new File([out], `${base}.${ext}`, { type });
  } catch (e) {
    if (e instanceof CompressError) throw e;
    const msg = e instanceof Error ? e.message : String(e);
    if (/NotAllowedError|user didn't interact|play\(\) failed/i.test(msg)) {
      throw new CompressError('Your browser blocked playback. Tap "Compress" again.');
    }
    throw new CompressError(`Compression failed: ${msg}`);
  } finally {
    cleanup();
  }
}
