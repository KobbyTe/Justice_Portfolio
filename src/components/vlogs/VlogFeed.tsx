import { useEffect, useRef, useState, useCallback } from 'react';
import { ChevronUp, ChevronDown } from 'lucide-react';
import VlogCard, { Vlog } from './VlogCard';

interface VlogFeedProps {
  vlogs: Vlog[];
}

export const VlogFeed = ({ vlogs }: VlogFeedProps) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const cardRefs = useRef<(HTMLDivElement | null)[]>([]);
  const [activeIndex, setActiveIndex] = useState(0);
  const [muted, setMuted] = useState(true);

  // Track which card is in view
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting && entry.intersectionRatio >= 0.6) {
            const idx = Number((entry.target as HTMLElement).dataset.index);
            if (!Number.isNaN(idx)) setActiveIndex(idx);
          }
        });
      },
      { root: container, threshold: [0.6] }
    );

    cardRefs.current.forEach((el) => el && observer.observe(el));
    return () => observer.disconnect();
  }, [vlogs.length]);

  const scrollToIndex = useCallback((idx: number) => {
    const target = cardRefs.current[idx];
    if (target) target.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }, []);

  // Keyboard nav
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'ArrowDown' && activeIndex < vlogs.length - 1) {
        e.preventDefault();
        scrollToIndex(activeIndex + 1);
      } else if (e.key === 'ArrowUp' && activeIndex > 0) {
        e.preventDefault();
        scrollToIndex(activeIndex - 1);
      } else if (e.key === 'm' || e.key === 'M') {
        setMuted((m) => !m);
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [activeIndex, vlogs.length, scrollToIndex]);

  return (
    <div className="relative h-[100dvh] w-full bg-black">
      <div
        ref={containerRef}
        className="h-full w-full overflow-y-scroll snap-y snap-mandatory scrollbar-hide"
        style={{ scrollbarWidth: 'none' }}
      >
        {vlogs.map((vlog, idx) => (
          <div
            key={vlog.id}
            ref={(el) => (cardRefs.current[idx] = el)}
            data-index={idx}
          >
            <VlogCard
              vlog={vlog}
              isActive={idx === activeIndex}
              muted={muted}
              onToggleMuted={() => setMuted((m) => !m)}
            />
          </div>
        ))}
      </div>

      {/* Desktop nav arrows */}
      <div className="hidden md:flex absolute right-8 top-1/2 -translate-y-1/2 flex-col gap-3 z-20">
        <button
          onClick={() => scrollToIndex(activeIndex - 1)}
          disabled={activeIndex === 0}
          className="p-3 rounded-full bg-white/10 backdrop-blur-md text-white hover:bg-white/20 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
          aria-label="Previous video"
        >
          <ChevronUp className="w-6 h-6" />
        </button>
        <button
          onClick={() => scrollToIndex(activeIndex + 1)}
          disabled={activeIndex >= vlogs.length - 1}
          className="p-3 rounded-full bg-white/10 backdrop-blur-md text-white hover:bg-white/20 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
          aria-label="Next video"
        >
          <ChevronDown className="w-6 h-6" />
        </button>
      </div>

      {/* Counter */}
      <div className="absolute top-4 left-1/2 -translate-x-1/2 z-20 px-3 py-1 rounded-full bg-black/40 backdrop-blur-sm text-white text-xs font-medium">
        {activeIndex + 1} / {vlogs.length}
      </div>
    </div>
  );
};

export default VlogFeed;
