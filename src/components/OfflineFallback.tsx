import { useState, useEffect } from 'react';
import { WifiOff, RefreshCw } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';

const OfflineFallback = () => {
  const [isOffline, setIsOffline] = useState(!navigator.onLine);
  const [isRetrying, setIsRetrying] = useState(false);

  useEffect(() => {
    const goOffline = () => setIsOffline(true);
    const goOnline = () => setIsOffline(false);

    window.addEventListener('offline', goOffline);
    window.addEventListener('online', goOnline);
    return () => {
      window.removeEventListener('offline', goOffline);
      window.removeEventListener('online', goOnline);
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
  );
};

export default OfflineFallback;
