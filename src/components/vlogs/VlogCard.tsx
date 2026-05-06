import { useEffect, useRef, useState, useCallback } from 'react';
import { Heart, MessageCircle, Share2, Volume2, VolumeX, Play, Pause } from 'lucide-react';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import VlogComments from './VlogComments';

export interface Vlog {
  id: string;
  title: string;
  description: string;
  videoUrl: string;
  likes: number;
  comments: number;
  slug?: string;
  posterUrl?: string | null;
  publishedAt?: string | null;
  tags?: string[];
}

interface VlogCardProps {
  vlog: Vlog;
  isActive: boolean;
  muted: boolean;
  onToggleMuted: () => void;
}

const formatCount = (n: number) => {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}K`;
  return `${n}`;
};

export const VlogCard = ({ vlog, isActive, muted, onToggleMuted }: VlogCardProps) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [progress, setProgress] = useState(0);
  const [liked, setLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(vlog.likes);
  const [commentCount, setCommentCount] = useState(vlog.comments);
  const [showPlayHint, setShowPlayHint] = useState(false);
  const [showMuteFlash, setShowMuteFlash] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [showHeartBurst, setShowHeartBurst] = useState(false);
  const [commentsOpen, setCommentsOpen] = useState(false);
  const [likeBusy, setLikeBusy] = useState(false);

  // Persistent fingerprint (shared with blog likes)
  const getFingerprint = (): string => {
    let fp = localStorage.getItem('like_fingerprint');
    if (!fp) {
      fp = crypto.randomUUID();
      localStorage.setItem('like_fingerprint', fp);
    }
    return fp;
  };

  const isRealPost = !vlog.id.startsWith('sample-');

  // Load real like + comment counts and liked state
  useEffect(() => {
    if (!isRealPost) return;
    let cancelled = false;
    (async () => {
      const fp = getFingerprint();
      const [{ count: lc }, { count: cc }, { data: mine }] = await Promise.all([
        supabase.from('blog_likes').select('id', { count: 'exact', head: true }).eq('post_id', vlog.id),
        supabase.from('blog_comments').select('id', { count: 'exact', head: true }).eq('post_id', vlog.id).eq('is_approved', true),
        supabase.from('blog_likes').select('id').eq('post_id', vlog.id).eq('ip_address', fp).maybeSingle(),
      ]);
      if (cancelled) return;
      setLikeCount(lc || 0);
      setCommentCount(cc || 0);
      setLiked(!!mine);
    })();
    return () => { cancelled = true; };
  }, [vlog.id, isRealPost]);

  // Active state controls play/pause
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;
    if (isActive) {
      video.currentTime = 0;
      video.play().catch(() => setShowPlayHint(true));
    } else {
      video.pause();
    }
  }, [isActive]);

  // Apply muted state
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;
    video.muted = muted;
  }, [muted]);

  const handleTimeUpdate = useCallback(() => {
    const video = videoRef.current;
    if (!video || !video.duration) return;
    setProgress((video.currentTime / video.duration) * 100);
  }, []);

  const togglePlay = useCallback(() => {
    const video = videoRef.current;
    if (!video) return;
    if (video.paused) {
      video.play().catch(() => {});
      setShowPlayHint(false);
    } else {
      video.pause();
    }
  }, []);

  const handleVideoClick = () => {
    const video = videoRef.current;
    if (!video) return;
    if (video.paused) {
      video.play().catch(() => {});
      setShowPlayHint(false);
      return;
    }
    onToggleMuted();
    setShowMuteFlash(true);
    setTimeout(() => setShowMuteFlash(false), 600);
  };

  // Keyboard: Space toggles play/pause when card is active
  useEffect(() => {
    if (!isActive) return;
    const onKey = (e: KeyboardEvent) => {
      // Don't hijack space when user is typing in an input
      const t = e.target as HTMLElement | null;
      if (t && (t.tagName === 'INPUT' || t.tagName === 'TEXTAREA' || t.isContentEditable)) return;
      if (e.code === 'Space') {
        e.preventDefault();
        togglePlay();
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [isActive, togglePlay]);

  const handleLike = useCallback(async () => {
    if (likeBusy) return;
    setShowHeartBurst(true);
    setTimeout(() => setShowHeartBurst(false), 600);

    if (!isRealPost) {
      // Sample vlogs: optimistic local toggle only
      setLiked((prev) => {
        setLikeCount((c) => c + (prev ? -1 : 1));
        return !prev;
      });
      return;
    }

    setLikeBusy(true);
    const fp = getFingerprint();
    const wasLiked = liked;
    // Optimistic
    setLiked(!wasLiked);
    setLikeCount((c) => c + (wasLiked ? -1 : 1));
    try {
      if (wasLiked) {
        const { error } = await supabase.rpc('delete_own_blog_like', {
          _post_id: vlog.id,
          _fingerprint: fp,
        });
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('blog_likes')
          .insert({ post_id: vlog.id, ip_address: fp, user_agent: navigator.userAgent });
        if (error) throw error;
      }
    } catch {
      // Revert on error
      setLiked(wasLiked);
      setLikeCount((c) => c + (wasLiked ? 1 : -1));
      toast.error('Could not save like');
    } finally {
      setLikeBusy(false);
    }
  }, [liked, likeBusy, isRealPost, vlog.id]);

  // Double-tap to like
  const lastTapRef = useRef(0);
  const handleVideoDoubleTap = () => {
    const now = Date.now();
    if (now - lastTapRef.current < 300) {
      if (!liked) handleLike();
      else { setShowHeartBurst(true); setTimeout(() => setShowHeartBurst(false), 600); }
      lastTapRef.current = 0;
    } else {
      lastTapRef.current = now;
    }
  };

  const handleShare = async () => {
    const shareData = {
      title: vlog.title,
      text: vlog.description,
      url: window.location.href,
    };
    try {
      if (navigator.share) {
        await navigator.share(shareData);
      } else {
        await navigator.clipboard.writeText(window.location.href);
        toast.success('Link copied to clipboard');
      }
    } catch {
      // user cancelled
    }
  };

  const relativeTime = (iso?: string | null) => {
    if (!iso) return '';
    const diff = (Date.now() - new Date(iso).getTime()) / 1000;
    if (diff < 60) return 'just now';
    if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
    if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
    if (diff < 604800) return `${Math.floor(diff / 86400)}d ago`;
    if (diff < 2592000) return `${Math.floor(diff / 604800)}w ago`;
    return `${Math.floor(diff / 2592000)}mo ago`;
  };

  return (
    <section
      className="relative h-[100dvh] w-full snap-start flex items-center justify-center"
      role="region"
      aria-label={`Vlog: ${vlog.title}`}
      aria-roledescription="vertical video"
    >
      {/* Video frame: full-screen on mobile, 9:16 column on desktop */}
      <div className="relative h-full w-full md:h-auto md:max-h-[calc(100dvh-2rem)] md:aspect-[9/16] md:max-w-[420px] md:rounded-3xl md:overflow-hidden md:shadow-[0_30px_80px_-20px_hsl(var(--primary)/0.35)] md:ring-1 md:ring-white/10 bg-black">
        <video
          ref={videoRef}
          src={vlog.videoUrl}
          poster={vlog.posterUrl || undefined}
          className="absolute inset-0 w-full h-full object-cover cursor-pointer"
          loop
          playsInline
          muted={muted}
          preload="metadata"
          aria-label={`${vlog.title}. ${vlog.description}`}
          onTimeUpdate={handleTimeUpdate}
          onClick={() => { handleVideoDoubleTap(); handleVideoClick(); }}
          onPlay={() => setIsPlaying(true)}
          onPause={() => setIsPlaying(false)}
        />

        {/* Hairline progress bar at the top — TikTok-style */}
        <div
          className="absolute top-0 left-0 right-0 h-[3px] bg-white/15 z-20"
          role="progressbar"
          aria-label="Video playback progress"
          aria-valuenow={Math.round(progress)}
          aria-valuemin={0}
          aria-valuemax={100}
        >
          <div
            className="h-full bg-white rounded-r-full transition-[width] duration-100 ease-linear"
            style={{ width: `${progress}%` }}
          />
        </div>

        {/* Top gradient for legibility */}
        <div className="pointer-events-none absolute inset-x-0 top-0 h-32 bg-gradient-to-b from-black/70 to-transparent z-[1]" aria-hidden="true" />

        {/* Top bar: author + timestamp */}
        <div
          className="absolute left-4 right-20 z-10 flex items-center gap-2.5 text-white"
          style={{ top: 'calc(env(safe-area-inset-top) + 1rem)' }}
        >
          <div className="w-9 h-9 rounded-full bg-gradient-to-br from-primary to-primary/60 flex items-center justify-center font-bold text-sm shadow-lg ring-2 ring-white/20">
            JA
          </div>
          <div className="flex flex-col leading-tight">
            <span className="font-semibold text-sm drop-shadow">Justice Ansah</span>
            {vlog.publishedAt && (
              <span className="text-[11px] text-white/70 drop-shadow">{relativeTime(vlog.publishedAt)}</span>
            )}
          </div>
        </div>

        {/* Mute toggle (top-right, single button) */}
        <button
          onClick={onToggleMuted}
          className="absolute right-3 z-10 w-10 h-10 rounded-full bg-white/10 backdrop-blur-md text-white hover:bg-white/20 focus:outline-none focus-visible:ring-2 focus-visible:ring-white transition-colors flex items-center justify-center"
          style={{ top: 'calc(env(safe-area-inset-top) + 1rem)' }}
          aria-label={muted ? 'Unmute video' : 'Mute video'}
          aria-pressed={!muted}
        >
          {muted ? <VolumeX className="w-4 h-4" aria-hidden="true" /> : <Volume2 className="w-4 h-4" aria-hidden="true" />}
        </button>

        {/* Mute flash indicator */}
        {showMuteFlash && (
          <div className="pointer-events-none absolute inset-0 flex items-center justify-center z-20" aria-hidden="true">
            <div className="bg-black/50 backdrop-blur-md rounded-full p-5 animate-in fade-in zoom-in duration-300">
              {muted ? (
                <VolumeX className="w-10 h-10 text-white" />
              ) : (
                <Volume2 className="w-10 h-10 text-white" />
              )}
            </div>
          </div>
        )}

        {/* Pause indicator when paused */}
        {!isPlaying && !showPlayHint && (
          <div className="pointer-events-none absolute inset-0 flex items-center justify-center z-10" aria-hidden="true">
            <div className="bg-black/40 backdrop-blur-md rounded-full p-5 animate-in fade-in duration-200">
              <Play className="w-10 h-10 text-white fill-white" />
            </div>
          </div>
        )}

        {/* Heart burst on like / double-tap */}
        {showHeartBurst && (
          <div className="pointer-events-none absolute inset-0 flex items-center justify-center z-20" aria-hidden="true">
            <Heart className="w-28 h-28 fill-red-500 text-red-500 drop-shadow-2xl animate-in zoom-in-50 fade-in duration-300" />
          </div>
        )}

        {/* Play hint if autoplay was blocked */}
        {showPlayHint && (
          <button
            onClick={handleVideoClick}
            className="absolute inset-0 flex items-center justify-center bg-black/40 z-20 focus:outline-none focus-visible:ring-2 focus-visible:ring-white"
            aria-label="Play video"
          >
            <div className="bg-white/20 backdrop-blur-md rounded-full p-6">
              <Play className="w-12 h-12 text-white fill-white" aria-hidden="true" />
            </div>
          </button>
        )}

        {/* Bottom gradient overlay */}
        <div className="pointer-events-none absolute inset-x-0 bottom-0 h-2/5 bg-gradient-to-t from-black/90 via-black/40 to-transparent" aria-hidden="true" />

        {/* Bottom-left: title + description + tags */}
        <div
          className="absolute left-4 right-20 z-10 text-white"
          style={{ bottom: 'calc(env(safe-area-inset-bottom) + 1.5rem)' }}
        >
          <h2 className="font-bold text-base sm:text-lg mb-1 line-clamp-2 drop-shadow">{vlog.title}</h2>
          {vlog.description && (
            <p className="text-xs sm:text-sm text-white/85 line-clamp-2 drop-shadow mb-2">{vlog.description}</p>
          )}
          {vlog.tags && vlog.tags.length > 0 && (
            <div className="flex flex-wrap gap-1.5">
              {vlog.tags.slice(0, 3).map((t) => (
                <span key={t} className="text-[11px] text-white/90 bg-white/10 backdrop-blur-sm px-2 py-0.5 rounded-full">
                  #{t}
                </span>
              ))}
            </div>
          )}
        </div>

        {/* Bottom-right: action stack */}
        <div
          className="absolute right-2 z-10 flex flex-col items-center gap-4"
          style={{ bottom: 'calc(env(safe-area-inset-bottom) + 2rem)' }}
          role="group"
          aria-label="Vlog actions"
        >
          <button
            onClick={handleLike}
            disabled={likeBusy}
            className="flex flex-col items-center group focus:outline-none focus-visible:ring-2 focus-visible:ring-white rounded-full disabled:opacity-70"
            aria-label={liked ? `Unlike. ${formatCount(likeCount)} likes` : `Like. ${formatCount(likeCount)} likes`}
            aria-pressed={liked}
          >
            <div className="w-11 h-11 rounded-full bg-white/10 backdrop-blur-md flex items-center justify-center group-active:scale-90 group-hover:bg-white/20 transition-all shadow-lg">
              <Heart
                className={cn(
                  'w-5 h-5 transition-all',
                  liked ? 'fill-red-500 text-red-500 scale-110' : 'text-white'
                )}
                aria-hidden="true"
              />
            </div>
            <span className="text-[11px] text-white font-medium mt-1 drop-shadow" aria-hidden="true">{formatCount(likeCount)}</span>
          </button>

          <button
            onClick={() => setCommentsOpen(true)}
            className="flex flex-col items-center group focus:outline-none focus-visible:ring-2 focus-visible:ring-white rounded-full"
            aria-label={`Open comments. ${formatCount(commentCount)} comments`}
          >
            <div className="w-11 h-11 rounded-full bg-white/10 backdrop-blur-md flex items-center justify-center group-active:scale-90 group-hover:bg-white/20 transition-all shadow-lg">
              <MessageCircle className="w-5 h-5 text-white" aria-hidden="true" />
            </div>
            <span className="text-[11px] text-white font-medium mt-1 drop-shadow" aria-hidden="true">{formatCount(commentCount)}</span>
          </button>

          <button
            onClick={handleShare}
            className="flex flex-col items-center group focus:outline-none focus-visible:ring-2 focus-visible:ring-white rounded-full"
            aria-label="Share this vlog"
          >
            <div className="w-11 h-11 rounded-full bg-white/10 backdrop-blur-md flex items-center justify-center group-active:scale-90 group-hover:bg-white/20 transition-all shadow-lg">
              <Share2 className="w-5 h-5 text-white" aria-hidden="true" />
            </div>
            <span className="text-[11px] text-white font-medium mt-1 drop-shadow" aria-hidden="true">Share</span>
          </button>
        </div>
      </div>

      {isRealPost && (
        <VlogComments
          postId={vlog.id}
          open={commentsOpen}
          onClose={() => setCommentsOpen(false)}
          onCountChange={setCommentCount}
        />
      )}
    </section>
  );
};

export default VlogCard;
