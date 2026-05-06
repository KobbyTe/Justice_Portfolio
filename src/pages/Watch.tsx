import { useEffect, useState, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import SEO from '@/components/SEO';
import VlogFeed from '@/components/vlogs/VlogFeed';
import { Vlog } from '@/components/vlogs/VlogCard';
import { supabase } from '@/integrations/supabase/client';

const getYouTubeThumbnail = (url: string): string | null => {
  const match = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([a-zA-Z0-9_-]{11})/);
  return match ? `https://img.youtube.com/vi/${match[1]}/hqdefault.jpg` : null;
};

interface VlogPost {
  id: string;
  title: string;
  excerpt: string;
  slug: string;
  featured_video_url: string;
  featured_image_url: string | null;
  published_at: string;
  tags: string[] | null;
  like_count?: number;
}

const Watch = () => {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const [posts, setPosts] = useState<VlogPost[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      const { data } = await supabase
        .from('blog_posts')
        .select('id, title, excerpt, slug, featured_video_url, featured_image_url, published_at, tags')
        .eq('is_published', true)
        .not('featured_video_url', 'is', null)
        .order('published_at', { ascending: false });
      if (cancelled) return;
      setPosts((data as VlogPost[]) || []);
      setLoading(false);
    })();
    return () => { cancelled = true; };
  }, []);

  const { vlogs, initialIndex } = useMemo(() => {
    const idx = Math.max(0, posts.findIndex((p) => p.slug === slug));
    const ordered = posts.length
      ? [...posts.slice(idx), ...posts.slice(0, idx)]
      : [];
    const v: Vlog[] = ordered.map((p) => ({
      id: p.id,
      title: p.title,
      description: p.excerpt || '',
      videoUrl: p.featured_video_url,
      likes: 0,
      comments: 0,
      slug: p.slug,
      posterUrl: p.featured_image_url || (p.featured_video_url ? getYouTubeThumbnail(p.featured_video_url) : null),
      publishedAt: p.published_at,
      tags: p.tags || [],
    }));
    return { vlogs: v, initialIndex: 0 };
  }, [posts, slug]);

  const active = vlogs[0];

  if (!loading && vlogs.length === 0) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center text-center p-6">
        <SEO title="Watch" description="No vlogs available" url={`/watch/${slug || ''}`} />
        <h1 className="text-2xl font-bold mb-2">No vlogs yet</h1>
        <p className="text-muted-foreground mb-6">Check back soon.</p>
        <button onClick={() => navigate('/blog')} className="text-primary hover:underline">Back to Blog</button>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black overflow-hidden">
      {active && (
        <SEO
          title={active.title}
          description={active.description}
          image={active.posterUrl || undefined}
          url={`/watch/${active.slug}`}
          type="article"
        />
      )}

      {/* Ambient blurred backdrop */}
      {active?.posterUrl && (
        <div
          className="pointer-events-none absolute inset-0 -z-0 opacity-40"
          aria-hidden="true"
          style={{
            backgroundImage: `url(${active.posterUrl})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            filter: 'blur(60px) saturate(1.2)',
            transform: 'scale(1.2)',
          }}
        />
      )}
      <div className="absolute inset-0 bg-black/60 -z-0" aria-hidden="true" />

      {/* Floating back button */}
      <button
        onClick={() => navigate(-1)}
        className="fixed left-3 z-30 w-11 h-11 rounded-full bg-black/40 backdrop-blur-md text-white hover:bg-black/60 flex items-center justify-center focus:outline-none focus-visible:ring-2 focus-visible:ring-white transition-colors"
        style={{ top: 'calc(env(safe-area-inset-top) + 0.75rem)' }}
        aria-label="Back"
      >
        <ArrowLeft className="w-5 h-5" />
      </button>

      <div className="relative z-10 h-full">
        {!loading && vlogs.length > 0 && (
          <VlogFeed vlogs={vlogs} initialIndex={initialIndex} />
        )}
      </div>
    </div>
  );
};

export default Watch;
