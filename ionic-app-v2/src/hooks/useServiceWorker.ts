/**
 * Hook React pour gérer le Service Worker
 * 
 * Usage :
 * ```tsx
 * const { 
 *   isOnline, 
 *   swStatus, 
 *   updateAvailable, 
 *   activateUpdate,
 *   cacheReport 
 * } = useServiceWorker();
 * ```
 */

import { useState, useEffect } from 'react';
import { serviceWorkerService } from '../services/serviceWorkerService';

interface ServiceWorkerStatus {
  registered: boolean;
  active: boolean;
  waiting: boolean;
  installing: boolean;
  updateAvailable: boolean;
}

interface CacheReport {
  sizes: {
    static: number;
    api: number;
    images: number;
    audio: number;
  };
  total: number;
  storage: {
    usage: number;
    quota: number;
    percentage: number;
  };
  formatted: {
    sizes: Record<string, string>;
    total: string;
    storage: {
      usage: string;
      quota: string;
      percentage: string;
    };
  };
}

export function useServiceWorker() {
  const [isOnline, setIsOnline] = useState<boolean>(navigator.onLine);
  const [swStatus, setSwStatus] = useState<ServiceWorkerStatus>({
    registered: false,
    active: false,
    waiting: false,
    installing: false,
    updateAvailable: false,
  });
  const [updateAvailable, setUpdateAvailable] = useState<boolean>(false);
  const [cacheReport, setCacheReport] = useState<CacheReport | null>(null);

  useEffect(() => {
    // S'abonner aux changements de statut online/offline
    const unsubscribe = serviceWorkerService.onOnlineStatusChange((status) => {
      setIsOnline(status);
    });

    // Écouter les mises à jour du Service Worker
    const handleUpdateAvailable = () => {
      setUpdateAvailable(true);
      updateSwStatus();
    };

    window.addEventListener('sw-update-available', handleUpdateAvailable);

    // Mettre à jour le statut initial
    updateSwStatus();

    // Rafraîchir le rapport de cache toutes les 30 secondes
    const cacheReportInterval = setInterval(() => {
      refreshCacheReport();
    }, 30000);

    // Cleanup
    return () => {
      unsubscribe();
      window.removeEventListener('sw-update-available', handleUpdateAvailable);
      clearInterval(cacheReportInterval);
    };
  }, []);

  /**
   * Mettre à jour le statut du Service Worker
   */
  const updateSwStatus = () => {
    const status = serviceWorkerService.getStatus();
    setSwStatus(status);
    setUpdateAvailable(status.updateAvailable);
  };

  /**
   * Rafraîchir le rapport de cache
   */
  const refreshCacheReport = async () => {
    try {
      const report = await serviceWorkerService.getCacheReport();
      setCacheReport(report);
    } catch (error) {
      console.error('❌ Erreur lors du rafraîchissement du rapport de cache:', error);
    }
  };

  /**
   * Activer la mise à jour du Service Worker
   */
  const activateUpdate = async () => {
    await serviceWorkerService.activateUpdate();
  };

  /**
   * Vider tous les caches
   */
  const clearAllCaches = async () => {
    await serviceWorkerService.clearAllCaches();
    setTimeout(refreshCacheReport, 1000);
  };

  /**
   * Précharger les ressources essentielles
   */
  const precacheEssentials = async (attractions: any[]) => {
    await serviceWorkerService.precacheEssentials(attractions);
    setTimeout(refreshCacheReport, 2000);
  };

  /**
   * Enregistrer une synchronisation en arrière-plan
   */
  const registerBackgroundSync = async (tag: string) => {
    return await serviceWorkerService.registerBackgroundSync(tag);
  };

  return {
    // Statuts
    isOnline,
    swStatus,
    updateAvailable,
    cacheReport,

    // Actions
    activateUpdate,
    clearAllCaches,
    refreshCacheReport,
    precacheEssentials,
    registerBackgroundSync,
    updateSwStatus,
  };
}
