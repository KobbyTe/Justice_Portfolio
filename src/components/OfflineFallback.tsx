import { useState, useEffect, useRef } from 'react';
import { WifiOff, Wifi, RefreshCw } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';

const OfflineFallback = () => {
  const [isOffline, setIsOffline] = useState(!navigator.onLine);
  const [isRetrying, setIsRetrying] = useState(false);
  const [banner, setBanner] = useState<'offline' | 'online' | null>(null);
  const initialMount = useRef(true);
  const bannerTimer = useRef<ReturnType<typeof setTimeout>>();

  useEffect(() => {
    const goOffline = () => {
      setIsOffline(true);
      if (!initialMount.current) {
        clearTimeout(bannerTimer.current);
        setBanner('offline');
        bannerTimer.current = setTimeout(() => setBanner(null), 4000);
      }
    };
    const goOnline = () => {
      setIsOffline(false);
      if (!initialMount.current) {
        clearTimeout(bannerTimer.current);
        setBanner('online');
        bannerTimer.current = setTimeout(() => setBanner(null), 3000);
      }
    };

    window.addEventListener('offline', goOffline);
    window.addEventListener('online', goOnline);
    initialMount.current = false;

    return () => {
      window.removeEventListener('offline', goOffline);
      window.removeEventListener('online', goOnline);
      clearTimeout(bannerTimer.current);
    };
  }, []);

  const handleRetry = () => {
    setIsRetrying(true);
    setTimeout(() => {
      if (navigator.onLine) {
        window.location.reload();
      } else {
        setIsRetrying(false);
      }
    }, 1500);
  };

  return (
    <>
      {/* Slim status banner */}
      <AnimatePresence>
        {banner && (
          <motion.div
            initial={{ y: -40, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: -40, opacity: 0 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className={`fixed top-0 left-0 right-0 z-[110] flex items-center justify-center gap-2 py-2 px-4 text-xs font-medium ${
              banner === 'offline'
                ? 'bg-destructive text-destructive-foreground'
                : 'bg-primary text-primary-foreground'
            }`}
            style={{ paddingTop: 'max(0.5rem, env(safe-area-inset-top))' }}
          >
            {banner === 'offline' ? (
              <>
                <WifiOff className="w-3.5 h-3.5" />
                You're offline
              </>
            ) : (
              <>
                <Wifi className="w-3.5 h-3.5" />
                Back online
              </>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Full-screen offline overlay */}
      <AnimatePresence>
        {isOffline && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="fixed inset-0 z-[100] flex items-center justify-center bg-background/95 backdrop-blur-md p-6"
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              className="flex flex-col items-center text-center max-w-sm"
            >
              <div className="w-20 h-20 rounded-full bg-muted flex items-center justify-center mb-6">
                <WifiOff className="w-10 h-10 text-muted-foreground" />
              </div>

              <h2 className="text-2xl font-heading font-bold text-foreground mb-2">
                You're Offline
              </h2>
              <p className="text-muted-foreground mb-8 text-sm leading-relaxed">
                No internet connection detected. Check your Wi-Fi or mobile data and try again.
              </p>

              <Button
                onClick={handleRetry}
                disabled={isRetrying}
                className="gap-2 touch-target"
                size="lg"
              >
                <RefreshCw className={`w-4 h-4 ${isRetrying ? 'animate-spin' : ''}`} />
                {isRetrying ? 'Checking...' : 'Try Again'}
              </Button>

              <p className="text-xs text-muted-foreground mt-6 opacity-70">
                Cached pages may still be available
              </p>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default OfflineFallback;
