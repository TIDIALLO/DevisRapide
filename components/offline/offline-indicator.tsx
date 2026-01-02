'use client';

import { useEffect, useState } from 'react';
import { WifiOff, Wifi } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export function OfflineIndicator() {
  const [isOnline, setIsOnline] = useState(true);
  const [showBanner, setShowBanner] = useState(false);

  useEffect(() => {
    // Vérifier l'état initial
    setIsOnline(navigator.onLine);
    setShowBanner(!navigator.onLine);

    // Écouter les changements de connexion
    const handleOnline = () => {
      setIsOnline(true);
      setShowBanner(false);
    };

    const handleOffline = () => {
      setIsOnline(false);
      setShowBanner(true);
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  return (
    <AnimatePresence>
      {showBanner && (
        <motion.div
          initial={{ y: -100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: -100, opacity: 0 }}
          className="fixed top-0 left-0 right-0 z-50 bg-yellow-500 text-white px-4 py-3 shadow-lg"
        >
          <div className="max-w-7xl mx-auto flex items-center gap-3">
            <WifiOff className="w-5 h-5 flex-shrink-0" />
            <div className="flex-1">
              <p className="font-semibold">Mode hors ligne activé</p>
              <p className="text-sm text-yellow-100">
                Vous pouvez continuer à travailler sans internet. Les données seront sauvegardées localement et synchronisées automatiquement lorsque la connexion sera rétablie.
              </p>
            </div>
            <button
              onClick={() => setShowBanner(false)}
              className="text-white hover:text-yellow-100 transition-colors"
              aria-label="Fermer"
            >
              ×
            </button>
          </div>
        </motion.div>
      )}
      {!isOnline && !showBanner && (
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          className="fixed bottom-20 right-4 z-50 bg-yellow-500 text-white rounded-full p-3 shadow-lg"
          title="Mode hors ligne"
        >
          <WifiOff className="w-5 h-5" />
        </motion.div>
      )}
    </AnimatePresence>
  );
}
