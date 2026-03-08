import { useState, useRef, useCallback, ReactNode } from 'react';
import { motion, useMotionValue, useTransform } from 'framer-motion';
import { RefreshCw } from 'lucide-react';

const THRESHOLD = 80;
const MAX_PULL = 120;

const PullToRefresh = ({ children }: { children: ReactNode }) => {
  const [isRefreshing, setIsRefreshing] = useState(false);
  const pullY = useMotionValue(0);
  const startY = useRef(0);
  const isPulling = useRef(false);

  const indicatorOpacity = useTransform(pullY, [0, THRESHOLD * 0.5, THRESHOLD], [0, 0.5, 1]);
  const indicatorScale = useTransform(pullY, [0, THRESHOLD], [0.6, 1]);
  const indicatorRotate = useTransform(pullY, [0, MAX_PULL], [0, 360]);

  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    if (isRefreshing) return;
    if (window.scrollY <= 0) {
      startY.current = e.touches[0].clientY;
      isPulling.current = true;
    }
  }, [isRefreshing]);

  const handleTouchMove = useCallback((e: React.TouchEvent) => {
    if (!isPulling.current || isRefreshing) return;
    const delta = e.touches[0].clientY - startY.current;
    if (delta > 0 && window.scrollY <= 0) {
      const dampened = Math.min(delta * 0.4, MAX_PULL);
      pullY.set(dampened);
    } else {
      pullY.set(0);
    }
  }, [isRefreshing, pullY]);

  const handleTouchEnd = useCallback(() => {
    if (!isPulling.current) return;
    isPulling.current = false;
    const current = pullY.get();

    if (current >= THRESHOLD && !isRefreshing) {
      setIsRefreshing(true);
      pullY.set(60);
      // Reload after brief delay
      setTimeout(() => {
        window.location.reload();
      }, 600);
    } else {
      pullY.set(0);
    }
  }, [isRefreshing, pullY]);

  return (
    <div
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      className="relative"
    >
      {/* Pull indicator */}
      <motion.div
        style={{ opacity: indicatorOpacity, scale: indicatorScale, y: useTransform(pullY, v => v - 48) }}
        className="fixed top-0 left-1/2 -translate-x-1/2 z-50 flex items-center justify-center w-10 h-10 rounded-full bg-card border border-border shadow-lg"
      >
        <motion.div style={{ rotate: isRefreshing ? undefined : indicatorRotate }}>
          <RefreshCw
            className={`w-5 h-5 text-primary ${isRefreshing ? 'animate-spin' : ''}`}
          />
        </motion.div>
      </motion.div>

      {children}
    </div>
  );
};

export default PullToRefresh;
