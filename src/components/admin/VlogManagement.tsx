import { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { UploadCloud, Trash2, Eye, EyeOff, Film, Loader2, Link as LinkIcon, Plus } from 'lucide-react';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';

interface VlogPost {
  id: string;
  title: string;
  excerpt: string | null;
  slug: string;
  category: string;
  featured_video_url: string | null;
  featured_image_url: string | null;
  is_published: boolean;
  published_at: string | null;
  created_at: string;
}

interface VlogManagementProps {
  onFileUpload: (file: File) => Promise<string>;
}

const slugify = (s: string) =>
  s
    .toLowerCase()
    .replace(/\.[^.]+$/, '')
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '')
    .substring(0, 60) || `vlog-${Date.now()}`;

const titleFromFilename = (name: string) =>
  name
    .replace(/\.[^.]+$/, '')
    .replace(/[-_]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
    .replace(/\b\w/g, (c) => c.toUpperCase()) || 'Untitled Vlog';

const formatDuration = (seconds: number) => {
  if (!isFinite(seconds) || seconds <= 0) return '';
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${m}:${s.toString().padStart(2, '0')}`;
};

const formatBytes = (bytes: number) => {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
};

const extractVideoMetadata = (file: File): Promise<{
  duration: number;
  width: number;
  height: number;
  posterBlob: Blob | null;
}> =>
  new Promise((resolve) => {
    const url = URL.createObjectURL(file);
    const video = document.createElement('video');
    video.preload = 'metadata';
    video.muted = true;
    video.playsInline = true;
    video.src = url;

    const cleanup = () => URL.revokeObjectURL(url);

    video.onloadedmetadata = () => {
      const duration = video.duration || 0;
      const width = video.videoWidth || 0;
      const height = video.videoHeight || 0;
      const seekTo = Math.min(1, duration / 2);
      const onSeeked = () => {
        try {
          const canvas = document.createElement('canvas');
          const maxW = 720;
          const ratio = width > 0 ? maxW / width : 1;
          canvas.width = Math.min(width, maxW) || maxW;
          canvas.height = (height || maxW) * (width > maxW ? ratio : 1);
          const ctx = canvas.getContext('2d');
          if (ctx) ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
          canvas.toBlob(
            (blob) => {
              cleanup();
              resolve({ duration, width, height, posterBlob: blob });
            },
            'image/jpeg',
            0.82
          );
        } catch {
          cleanup();
          resolve({ duration, width, height, posterBlob: null });
        }
      };
      video.onseeked = onSeeked;
      try {
        video.currentTime = seekTo;
      } catch {
        onSeeked();
      }
    };

    video.onerror = () => {
      cleanup();
      resolve({ duration: 0, width: 0, height: 0, posterBlob: null });
    };
  });

const VlogManagement = ({ onFileUpload }: VlogManagementProps) => {
  const [vlogs, setVlogs] = useState<VlogPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDragOver, setIsDragOver] = useState(false);
  const [uploadingFile, setUploadingFile] = useState<string | null>(null);
  const [progress, setProgress] = useState(0);
  const [overrideTitle, setOverrideTitle] = useState('');
  const [overrideDescription, setOverrideDescription] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  // URL-based add form state
  const [urlTitle, setUrlTitle] = useState('');
  const [urlDescription, setUrlDescription] = useState('');
  const [urlVideo, setUrlVideo] = useState('');
  const [urlPoster, setUrlPoster] = useState('');
  const [urlSubmitting, setUrlSubmitting] = useState(false);

  useEffect(() => {
    loadVlogs();
  }, []);

  const loadVlogs = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('blog_posts')
        .select('id, title, excerpt, slug, category, featured_video_url, featured_image_url, is_published, published_at, created_at')
        .not('featured_video_url', 'is', null)
        .order('created_at', { ascending: false });
      if (error) throw error;
      setVlogs((data || []) as VlogPost[]);
    } catch (e) {
      console.error(e);
      toast.error('Failed to load vlogs');
    } finally {
      setLoading(false);
    }
  };

  const processFile = async (file: File) => {
    if (!file.type.startsWith('video/')) {
      toast.error('Please upload a video file');
      return;
    }
    const MAX = 200 * 1024 * 1024;
    if (file.size > MAX) {
      toast.error('Video is too large (max 200MB)');
      return;
    }

    setUploadingFile(file.name);
    setProgress(5);

    try {
      const { duration, posterBlob } = await extractVideoMetadata(file);
      setProgress(25);

      let posterUrl: string | null = null;
      if (posterBlob) {
        try {
          const posterFile = new File([posterBlob], `${slugify(file.name)}-poster.jpg`, {
            type: 'image/jpeg',
          });
          posterUrl = await onFileUpload(posterFile);
        } catch {
          posterUrl = null;
        }
      }
      setProgress(55);

      const videoUrl = await onFileUpload(file);
      setProgress(85);

      const title = overrideTitle.trim() || titleFromFilename(file.name);
      const description =
        overrideDescription.trim() ||
        (duration > 0
          ? `Vlog · ${formatDuration(duration)} · ${formatBytes(file.size)}`
          : `Vlog · ${formatBytes(file.size)}`);

      let slug = slugify(title);
      const { data: existing } = await supabase
        .from('blog_posts')
        .select('id')
        .eq('slug', slug)
        .maybeSingle();
      if (existing) slug = `${slug}-${Date.now().toString(36)}`;

      const { error: insertError } = await supabase.from('blog_posts').insert([
        {
          title,
          slug,
          excerpt: description,
          content: `<p>${description}</p>`,
          category: 'Vlog',
          tags: ['vlog'],
          featured_video_url: videoUrl,
          featured_image_url: posterUrl,
          is_published: true,
          published_at: new Date().toISOString(),
          read_time_minutes: Math.max(1, Math.ceil(duration / 60)) || 1,
        },
      ]);
      if (insertError) throw insertError;

      setProgress(100);
      toast.success(`Vlog "${title}" published`);
      setOverrideTitle('');
      setOverrideDescription('');
      await loadVlogs();
    } catch (e: any) {
      console.error(e);
      toast.error(e?.message || 'Failed to upload vlog');
    } finally {
      setUploadingFile(null);
      setProgress(0);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) processFile(file);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    const file = e.dataTransfer.files?.[0];
    if (file) processFile(file);
  };

  const togglePublish = async (vlog: VlogPost) => {
    try {
      const { error } = await supabase
        .from('blog_posts')
        .update({
          is_published: !vlog.is_published,
          published_at: !vlog.is_published ? new Date().toISOString() : vlog.published_at,
          updated_at: new Date().toISOString(),
        })
        .eq('id', vlog.id);
      if (error) throw error;
      toast.success(vlog.is_published ? 'Vlog unpublished' : 'Vlog published');
      loadVlogs();
    } catch (e) {
      toast.error('Failed to update vlog');
    }
  };

  const deleteVlog = async (vlog: VlogPost) => {
    if (!confirm(`Delete "${vlog.title}"? This cannot be undone.`)) return;
    try {
      const { error } = await supabase.from('blog_posts').delete().eq('id', vlog.id);
      if (error) throw error;
      toast.success('Vlog deleted');
      loadVlogs();
    } catch (e) {
      toast.error('Failed to delete vlog');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <Film className="w-6 h-6" />
            Vlog Management
          </h2>
          <p className="text-sm text-muted-foreground mt-1">
            Upload local video files. Title, description, and poster frame are auto-generated.
          </p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Upload New Vlog</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="vlog-title">Title (optional)</Label>
              <Input
                id="vlog-title"
                value={overrideTitle}
                onChange={(e) => setOverrideTitle(e.target.value)}
                placeholder="Auto-generated from filename if blank"
                maxLength={120}
                disabled={!!uploadingFile}
              />
            </div>
            <div>
              <Label htmlFor="vlog-desc">Description (optional)</Label>
              <Textarea
                id="vlog-desc"
                value={overrideDescription}
                onChange={(e) => setOverrideDescription(e.target.value)}
                placeholder="Auto-generated from video metadata if blank"
                rows={1}
                maxLength={280}
                disabled={!!uploadingFile}
              />
            </div>
          </div>

          <div
            onDragOver={(e) => {
              e.preventDefault();
              setIsDragOver(true);
            }}
            onDragLeave={() => setIsDragOver(false)}
            onDrop={handleDrop}
            onClick={() => !uploadingFile && fileInputRef.current?.click()}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => {
              if ((e.key === 'Enter' || e.key === ' ') && !uploadingFile) {
                e.preventDefault();
                fileInputRef.current?.click();
              }
            }}
            aria-label="Upload vlog video file"
            className={`relative border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-primary ${
              isDragOver ? 'border-primary bg-primary/5' : 'border-border hover:border-primary/50'
            } ${uploadingFile ? 'pointer-events-none opacity-70' : ''}`}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept="video/mp4,video/webm,video/ogg,video/quicktime"
              onChange={handleFileSelect}
              className="hidden"
            />
            {uploadingFile ? (
              <div className="space-y-3">
                <Loader2 className="w-10 h-10 mx-auto animate-spin text-primary" />
                <p className="font-medium text-sm truncate">{uploadingFile}</p>
                <Progress value={progress} className="h-2" />
                <p className="text-xs text-muted-foreground">
                  {progress < 25
                    ? 'Reading metadata…'
                    : progress < 55
                    ? 'Uploading poster…'
                    : progress < 85
                    ? 'Uploading video…'
                    : 'Creating vlog post…'}
                </p>
              </div>
            ) : (
              <div className="space-y-2">
                <UploadCloud className="w-12 h-12 mx-auto text-muted-foreground" />
                <p className="font-medium">Drag & drop a video, or click to browse</p>
                <p className="text-xs text-muted-foreground">
                  MP4, WebM, OGG, or MOV · max 200MB
                </p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Existing Vlogs ({vlogs.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-8 text-muted-foreground">Loading…</div>
          ) : vlogs.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No vlogs yet. Upload your first one above.
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {vlogs.map((vlog) => (
                <div
                  key={vlog.id}
                  className="border border-border rounded-lg overflow-hidden bg-card"
                >
                  <div className="aspect-video bg-muted relative">
                    {vlog.featured_image_url ? (
                      <img
                        src={vlog.featured_image_url}
                        alt={vlog.title}
                        className="w-full h-full object-cover"
                        loading="lazy"
                      />
                    ) : vlog.featured_video_url ? (
                      <video
                        src={vlog.featured_video_url}
                        className="w-full h-full object-cover"
                        muted
                        playsInline
                        preload="metadata"
                      />
                    ) : (
                      <div className="flex items-center justify-center h-full">
                        <Film className="w-8 h-8 text-muted-foreground" />
                      </div>
                    )}
                    <Badge
                      variant={vlog.is_published ? 'default' : 'secondary'}
                      className="absolute top-2 left-2"
                    >
                      {vlog.is_published ? 'Published' : 'Draft'}
                    </Badge>
                  </div>
                  <div className="p-3 space-y-2">
                    <h3 className="font-medium line-clamp-1" title={vlog.title}>
                      {vlog.title}
                    </h3>
                    <p className="text-xs text-muted-foreground line-clamp-2 min-h-[2rem]">
                      {vlog.excerpt || 'No description'}
                    </p>
                    <div className="flex gap-2 pt-1">
                      <Button
                        variant="outline"
                        size="sm"
                        className="flex-1"
                        onClick={() => togglePublish(vlog)}
                        aria-label={vlog.is_published ? 'Unpublish vlog' : 'Publish vlog'}
                      >
                        {vlog.is_published ? (
                          <EyeOff className="w-4 h-4" />
                        ) : (
                          <Eye className="w-4 h-4" />
                        )}
                      </Button>
                      <Button
                        variant="destructive"
                        size="sm"
                        className="flex-1"
                        onClick={() => deleteVlog(vlog)}
                        aria-label="Delete vlog"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default VlogManagement;
