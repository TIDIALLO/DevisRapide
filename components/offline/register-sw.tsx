'use client';

import { useEffect } from 'react';
import { offlineSync } from '@/lib/offline/sync';

export function RegisterServiceWorker() {
  useEffect(() => {
    if (typeof window !== 'undefined' && 'serviceWorker' in navigator) {
      // Enregistrer le service worker
      navigator.serviceWorker
        .register('/sw.js')
        .then((registration) => {
          console.log('✅ Service Worker enregistré avec succès:', registration.scope);
          
          // Démarrer la synchronisation automatique
          offlineSync.startAutoSync();
          
          // Vérifier les mises à jour périodiquement
          setInterval(() => {
            registration.update();
          }, 60 * 60 * 1000); // Toutes les heures
        })
        .catch((error) => {
          console.log('❌ Erreur enregistrement Service Worker:', error);
        });

      // Écouter les messages du service worker
      navigator.serviceWorker.addEventListener('message', (event) => {
        console.log('📨 Message du Service Worker:', event.data);
      });
    }
  }, []);

  return null;
}
