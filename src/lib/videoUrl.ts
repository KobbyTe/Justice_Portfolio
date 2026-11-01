// Recognises YouTube links in every common form: watch?v=, youtu.be/, embed/,
// shorts/ and live/. Returns the 11-character video id, or null.
export function youTubeId(url: string | null | undefined): string | null {
  const m = String(url || '').match(
    /(?:youtube(?:-nocookie)?\.com\/(?:watch\?(?:.*&)?v=|embed\/|shorts\/|live\/)|youtu\.be\/)([a-zA-Z0-9_-]{11})/
  );
  return m ? m[1] : null;
}

export function youTubeThumbnail(url: string | null | undefined): string | null {
  const id = youTubeId(url);
  return id ? `https://img.youtube.com/vi/${id}/hqdefault.jpg` : null;
}
