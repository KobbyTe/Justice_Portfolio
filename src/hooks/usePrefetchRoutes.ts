import { useEffect } from 'react';

/**
 * Warms up the most-likely-next route chunks once the browser is idle.
 * Eliminates the spinner flash on first navigation.
 */
export const usePrefetchRoutes = () => {
  useEffect(() => {
    const prefetch = () => {
      import('@/pages/Projects');
      import('@/pages/About');
      import('@/pages/Resume');
      import('@/pages/Blog');
      import('@/pages/Gallery');
    };

    const w = window as any;
    if (typeof w.requestIdleCallback === 'function') {
      const id = w.requestIdleCallback(prefetch, { timeout: 3000 });
      return () => w.cancelIdleCallback?.(id);
    }
    const t = setTimeout(prefetch, 2000);
    return () => clearTimeout(t);
  }, []);
};
