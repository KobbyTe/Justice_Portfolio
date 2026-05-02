import { useEffect, useRef, useState, useCallback } from 'react';
import { Heart, MessageCircle, Share2, Volume2, VolumeX, Play, Pause } from 'lucide-react';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

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
  const [showPlayHint, setShowPlayHint] = useState(false);
  const [showMuteFlash, setShowMuteFlash] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);

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

  const handleLike = () => {
    setLiked((prev) => {
      setLikeCount((c) => c + (prev ? -1 : 1));
      return !prev;
    });
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

  return (
    <section
      className="relative h-[100dvh] w-full snap-start flex items-center justify-center bg-black"
      role="region"
      aria-label={`Vlog: ${vlog.title}`}
      aria-roledescription="vertical video"
    >
      {/* Video frame: full-screen on mobile, 9:16 column on desktop */}
      <div className="relative h-full w-full md:h-auto md:max-h-[calc(100dvh-2rem)] md:aspect-[9/16] md:max-w-[420px] md:rounded-2xl md:overflow-hidden md:shadow-2xl bg-black">
        <video
          ref={videoRef}
          src={vlog.videoUrl}
          className="absolute inset-0 w-full h-full object-cover cursor-pointer"
          loop
          playsInline
          muted={muted}
          preload="metadata"
          aria-label={`${vlog.title}. ${vlog.description}`}
          onTimeUpdate={handleTimeUpdate}
          onClick={handleVideoClick}
          onPlay={() => setIsPlaying(true)}
          onPause={() => setIsPlaying(false)}
        />

        {/* Mute flash indicator */}
        {showMuteFlash && (
          <div className="pointer-events-none absolute inset-0 flex items-center justify-center" aria-hidden="true">
            <div className="bg-black/60 rounded-full p-5 animate-in fade-in zoom-in duration-300">
              {muted ? (
                <VolumeX className="w-10 h-10 text-white" />
              ) : (
                <Volume2 className="w-10 h-10 text-white" />
              )}
            </div>
          </div>
        )}

        {/* Play hint if autoplay was blocked */}
        {showPlayHint && (
          <button
            onClick={handleVideoClick}
            className="absolute inset-0 flex items-center justify-center bg-black/40 focus:outline-none focus-visible:ring-2 focus-visible:ring-white"
            aria-label="Play video"
          >
            <div className="bg-white/20 backdrop-blur-md rounded-full p-6">
              <Play className="w-12 h-12 text-white fill-white" aria-hidden="true" />
            </div>
          </button>
        )}

        {/* Top-right action stack: play/pause + mute */}
        <div className="absolute top-4 right-4 z-10 flex flex-col gap-2">
          <button
            onClick={togglePlay}
            className="p-2.5 rounded-full bg-black/40 backdrop-blur-sm text-white hover:bg-black/60 focus:outline-none focus-visible:ring-2 focus-visible:ring-white transition-colors"
            aria-label={isPlaying ? 'Pause video (space)' : 'Play video (space)'}
            aria-pressed={isPlaying}
          >
            {isPlaying ? (
              <Pause className="w-5 h-5" aria-hidden="true" />
            ) : (
              <Play className="w-5 h-5" aria-hidden="true" />
            )}
          </button>
          <button
            onClick={onToggleMuted}
            className="p-2.5 rounded-full bg-black/40 backdrop-blur-sm text-white hover:bg-black/60 focus:outline-none focus-visible:ring-2 focus-visible:ring-white transition-colors"
            aria-label={muted ? 'Unmute video' : 'Mute video'}
            aria-pressed={!muted}
          >
            {muted ? <VolumeX className="w-5 h-5" aria-hidden="true" /> : <Volume2 className="w-5 h-5" aria-hidden="true" />}
          </button>
        </div>

        {/* Bottom gradient overlay */}
        <div className="pointer-events-none absolute inset-x-0 bottom-0 h-1/3 bg-gradient-to-t from-black/80 via-black/40 to-transparent" aria-hidden="true" />

        {/* Bottom-left: title + description */}
        <div className="absolute bottom-6 left-4 right-20 z-10 text-white">
          <h2 className="font-bold text-lg mb-1 line-clamp-2">{vlog.title}</h2>
          <p className="text-sm text-white/85 line-clamp-2">{vlog.description}</p>
        </div>

        {/* Bottom-right: action stack */}
        <div
          className="absolute bottom-8 right-3 z-10 flex flex-col items-center gap-5"
          role="group"
          aria-label="Vlog actions"
        >
          <button
            onClick={handleLike}
            className="flex flex-col items-center group focus:outline-none focus-visible:ring-2 focus-visible:ring-white rounded-full"
            aria-label={liked ? `Unlike. ${formatCount(likeCount)} likes` : `Like. ${formatCount(likeCount)} likes`}
            aria-pressed={liked}
          >
            <div className="p-3 rounded-full bg-black/30 backdrop-blur-sm group-active:scale-90 transition-transform">
              <Heart
                className={cn(
                  'w-6 h-6 transition-colors',
                  liked ? 'fill-red-500 text-red-500' : 'text-white'
                )}
                aria-hidden="true"
              />
            </div>
            <span className="text-xs text-white font-semibold mt-1" aria-hidden="true">{formatCount(likeCount)}</span>
          </button>

          <button
            onClick={() => toast.info('Comments coming soon')}
            className="flex flex-col items-center group focus:outline-none focus-visible:ring-2 focus-visible:ring-white rounded-full"
            aria-label={`Comments. ${formatCount(vlog.comments)} comments`}
          >
            <div className="p-3 rounded-full bg-black/30 backdrop-blur-sm group-active:scale-90 transition-transform">
              <MessageCircle className="w-6 h-6 text-white" aria-hidden="true" />
            </div>
            <span className="text-xs text-white font-semibold mt-1" aria-hidden="true">{formatCount(vlog.comments)}</span>
          </button>

          <button
            onClick={handleShare}
            className="flex flex-col items-center group focus:outline-none focus-visible:ring-2 focus-visible:ring-white rounded-full"
            aria-label="Share this vlog"
          >
            <div className="p-3 rounded-full bg-black/30 backdrop-blur-sm group-active:scale-90 transition-transform">
              <Share2 className="w-6 h-6 text-white" aria-hidden="true" />
            </div>
            <span className="text-xs text-white font-semibold mt-1" aria-hidden="true">Share</span>
          </button>
        </div>

        {/* Progress bar */}
        <div
          className="absolute bottom-0 left-0 right-0 h-1 bg-white/10 z-10"
          role="progressbar"
          aria-label="Video playback progress"
          aria-valuenow={Math.round(progress)}
          aria-valuemin={0}
          aria-valuemax={100}
        >
          <div
            className="h-full bg-white transition-[width] duration-100 ease-linear"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>
    </section>
  );
};

export default VlogCard;
