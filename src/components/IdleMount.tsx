import { useEffect, useState, type ReactNode } from 'react';

interface IdleMountProps {
  children: ReactNode;
  /** Fallback delay (ms) if requestIdleCallback is unavailable. */
  timeout?: number;
}

/**
 * Defers rendering its children until the browser is idle, so non-critical
 * widgets (chatbot, gamification, etc.) don't compete with first paint.
 */
const IdleMount = ({ children, timeout = 1500 }: IdleMountProps) => {
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const w = window as any;
    if (typeof w.requestIdleCallback === 'function') {
      const id = w.requestIdleCallback(() => setReady(true), { timeout });
      return () => w.cancelIdleCallback?.(id);
    }
    const t = setTimeout(() => setReady(true), timeout);
    return () => clearTimeout(t);
  }, [timeout]);

  if (!ready) return null;
  return <>{children}</>;
};

export default IdleMount;
