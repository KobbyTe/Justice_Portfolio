import { useEffect, useMemo, useState } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Loader2 } from 'lucide-react';
import SEO from '@/components/SEO';
import VlogFeed from '@/components/vlogs/VlogFeed';
import type { Vlog } from '@/components/vlogs/VlogCard';
import { supabase } from '@/integrations/supabase/client';

const SAMPLE_VLOGS: Vlog[] = [
  {
    id: 'sample-1',
    slug: 'big-buck-bunny',
    title: 'Big Buck Bunny',
    description: 'A short animated film by the Blender Foundation — sample vlog content.',
    videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
    likes: 12400,
    comments: 230,
  },
  {
    id: 'sample-2',
    slug: 'elephants-dream',
    title: 'Elephants Dream',
    description: 'The first open-source animated film — exploring creativity and storytelling.',
    videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4',
    likes: 8900,
    comments: 145,
  },
  {
    id: 'sample-3',
    slug: 'for-bigger-blazes',
    title: 'For Bigger Blazes',
    description: 'A quick demo of cinematic motion. Perfect for testing video playback.',
    videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4',
    likes: 4200,
    comments: 67,
  },
  {
    id: 'sample-4',
    slug: 'sintel',
    title: 'Sintel',
    description: 'A fantasy short following a girl on a quest. Open-source animation at its best.',
    videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/Sintel.mp4',
    likes: 15700,
    comments: 412,
  },
  {
    id: 'sample-5',
    slug: 'tears-of-steel',
    title: 'Tears of Steel',
    description: 'Live-action sci-fi with VFX — a demo of what open creative tools can build.',
    videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/TearsOfSteel.mp4',
    likes: 9300,
    comments: 178,
  },
];

const isPlayableVideoUrl = (url: string | null | undefined): boolean => {
  if (!url) return false;
  return /\.(mp4|webm|ogg|mov)(\?|$)/i.test(url);
};

const Vlogs = () => {
  const { slug } = useParams<{ slug?: string }>();
  const navigate = useNavigate();
  const [vlogs, setVlogs] = useState<Vlog[] | null>(null);

  useEffect(() => {
    const load = async () => {
      try {
        const { data } = await supabase
          .from('blog_posts')
          .select('id, title, excerpt, slug, featured_video_url, featured_image_url, published_at, tags')
          .eq('is_published', true)
          .not('featured_video_url', 'is', null)
          .order('published_at', { ascending: false });

        const mapped: Vlog[] = (data || [])
          .filter((p: any) => isPlayableVideoUrl(p.featured_video_url))
          .map((p: any) => ({
            id: p.id,
            slug: p.slug,
            title: p.title,
            description: p.excerpt || '',
            videoUrl: p.featured_video_url,
            posterUrl: p.featured_image_url,
            publishedAt: p.published_at,
            tags: p.tags || [],
            likes: 0,
            comments: 0,
          }));

        setVlogs(mapped.length > 0 ? mapped : SAMPLE_VLOGS);
      } catch {
        setVlogs(SAMPLE_VLOGS);
      }
    };
    load();
  }, []);

  // Find the active vlog by slug (deep link) or default to first
  const initialIndex = useMemo(() => {
    if (!vlogs || !slug) return 0;
    const idx = vlogs.findIndex((v) => v.slug === slug);
    return idx >= 0 ? idx : 0;
  }, [vlogs, slug]);

  // If slug provided but doesn't match, redirect to /vlogs
  useEffect(() => {
    if (vlogs && slug && !vlogs.some((v) => v.slug === slug)) {
      navigate('/vlogs', { replace: true });
    }
  }, [vlogs, slug, navigate]);

  const activeVlog = vlogs && slug ? vlogs.find((v) => v.slug === slug) : null;

  // Per-vlog SEO when deep-linked, otherwise feed-level SEO
  const seoProps = activeVlog
    ? {
        title: activeVlog.title,
        description:
          activeVlog.description?.slice(0, 160) ||
          `Watch "${activeVlog.title}" — a vlog by Justice Ansah.`,
        url: `/vlogs/${activeVlog.slug}`,
        type: 'video.other',
        image: activeVlog.posterUrl || undefined,
        article: {
          publishedTime: activeVlog.publishedAt || undefined,
          tags: activeVlog.tags,
          category: 'Vlog',
        },
      }
    : {
        title: 'Vlogs',
        description:
          'A vertical video feed of vlogs and visual stories by Justice Ansah on robotics, STEM education, and technology.',
        url: '/vlogs',
      };

  return (
    <div className="fixed inset-0 bg-black overflow-hidden">
      <SEO {...seoProps} />

      {/* Minimal top bar */}
      <div className="absolute top-0 left-0 right-0 z-30 flex items-center justify-between p-3 pointer-events-none">
        <Link
          to="/"
          className="pointer-events-auto p-2.5 rounded-full bg-black/40 backdrop-blur-sm text-white hover:bg-black/60 transition-colors"
          aria-label="Back to home"
        >
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <span className="pointer-events-auto text-white font-bold text-base">Vlogs</span>
        <div className="w-10" />
      </div>

      {vlogs === null ? (
        <div className="h-full w-full flex items-center justify-center">
          <Loader2 className="w-8 h-8 text-white animate-spin" />
        </div>
      ) : (
        <VlogFeed
          vlogs={vlogs}
          initialIndex={initialIndex}
          onActiveChange={(idx) => {
            const v = vlogs[idx];
            if (v?.slug) {
              const path = `/vlogs/${v.slug}`;
              if (window.location.pathname !== path) {
                window.history.replaceState(null, '', path);
              }
            }
          }}
        />
      )}
    </div>
  );
};

export default Vlogs;
