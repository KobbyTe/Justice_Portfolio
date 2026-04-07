import { useRef, useCallback } from 'react';

/**
 * Rate limiting hook to prevent form spam.
 * @param cooldownMs - Minimum milliseconds between submissions (default 5000)
 * @param maxAttempts - Max submissions within the window (default 5)
 * @param windowMs - Window for maxAttempts tracking (default 60000)
 */
export const useRateLimit = (cooldownMs = 5000, maxAttempts = 5, windowMs = 60000) => {
  const lastSubmit = useRef<number>(0);
  const attempts = useRef<number[]>([]);

  const checkRateLimit = useCallback((): { allowed: boolean; message: string } => {
    const now = Date.now();

    // Check cooldown
    if (now - lastSubmit.current < cooldownMs) {
      const wait = Math.ceil((cooldownMs - (now - lastSubmit.current)) / 1000);
      return { allowed: false, message: `Please wait ${wait} seconds before submitting again.` };
    }

    // Clean old attempts
    attempts.current = attempts.current.filter(t => now - t < windowMs);

    // Check max attempts
    if (attempts.current.length >= maxAttempts) {
      return { allowed: false, message: 'Too many submissions. Please try again later.' };
    }

    // Record this attempt
    lastSubmit.current = now;
    attempts.current.push(now);
    return { allowed: true, message: '' };
  }, [cooldownMs, maxAttempts, windowMs]);

  return { checkRateLimit };
};
