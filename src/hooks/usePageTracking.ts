import { useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';

const getSessionId = (): string => {
  let id = sessionStorage.getItem('analytics_session_id');
  if (!id) {
    id = crypto.randomUUID();
    sessionStorage.setItem('analytics_session_id', id);
  }
  return id;
};

const getDeviceType = (): string => {
  const ua = navigator.userAgent;
  if (/tablet|ipad|playbook|silk/i.test(ua)) return 'tablet';
  if (/mobile|iphone|ipod|android|blackberry|opera mini|iemobile/i.test(ua)) return 'mobile';
  return 'desktop';
};

const getBrowser = (): string => {
  const ua = navigator.userAgent;
  if (ua.includes('Firefox/')) return 'Firefox';
  if (ua.includes('Edg/')) return 'Edge';
  if (ua.includes('OPR/') || ua.includes('Opera')) return 'Opera';
  if (ua.includes('Chrome/') && !ua.includes('Edg/')) return 'Chrome';
  if (ua.includes('Safari/') && !ua.includes('Chrome')) return 'Safari';
  return 'Other';
};

const getCountry = (): string => {
  try {
    const locale = Intl.DateTimeFormat().resolvedOptions().timeZone;
    return locale || 'Unknown';
  } catch {
    return 'Unknown';
  }
};

export const usePageTracking = () => {
  const location = useLocation();
  const lastTracked = useRef<string>('');

  useEffect(() => {
    const path = location.pathname;

    // Skip admin pages and debounce same path
    if (path.startsWith('/admin') || lastTracked.current === path) return;
    lastTracked.current = path;

    const trackView = async () => {
      try {
        await supabase.from('page_views').insert({
          page_path: path,
          referrer: document.referrer || null,
          user_agent: navigator.userAgent,
          device_type: getDeviceType(),
          browser: getBrowser(),
          country: getCountry(),
          session_id: getSessionId(),
        });
      } catch (e) {
        // Silent fail – tracking should never break the app
        console.warn('Page tracking failed:', e);
      }
    };

    trackView();
  }, [location.pathname]);
};
