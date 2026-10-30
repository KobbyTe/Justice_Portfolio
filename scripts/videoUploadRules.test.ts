import { describe, expect, test } from 'bun:test';
import { MAX_VLOG_BYTES, VIDEO_CHUNK_BYTES, validateVlogVideo, videoContentType, videoUploadError } from './videoUploadRules';

describe('vlog video upload rules', () => {
  test('accepts the existing 200 MB boundary', () => {
    expect(MAX_VLOG_BYTES).toBe(209715200);
    expect(() => validateVlogVideo({ name: 'video.mp4', type: 'video/mp4', size: 209715200 })).not.toThrow();
    expect(() => validateVlogVideo({ name: 'video.mp4', type: 'video/mp4', size: 209715201 })).toThrow();
  });
  test('accepts phone videos without a MIME type', () => {
    expect(videoContentType({ name: 'CAMERA.MOV', type: '' })).toBe('video/quicktime');
  });
  test('rejects empty and unsupported files', () => {
    expect(() => validateVlogVideo({ name: 'empty.mp4', type: 'video/mp4', size: 0 })).toThrow();
    expect(() => validateVlogVideo({ name: 'script.html', type: 'video/mp4', size: 100 })).toThrow();
  });
  test('uses the supported 6 MiB chunk size', () => expect(VIDEO_CHUNK_BYTES).toBe(6291456));
  test('explains server file limits without promising a transport bypass', () => {
    expect(videoUploadError(new Error('The object exceeded the maximum allowed size'))).toContain('Settings → Storage');
  });
});