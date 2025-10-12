/**
 * Service Worker Registration & Management
 * 
 * Fonctionnalités :
 * - Enregistrement automatique du Service Worker
 * - Détection online/offline
 * - Communication bidirectionnelle avec le SW
 * - Gestion des mises à jour du SW
 * - Statistiques de cache
 */

interface CacheSizes {
  static: number;
  api: number;
  images: number;
  audio: number;
}

interface ServiceWorkerStatus {
  registered: boolean;
  active: boolean;
  waiting: boolean;
  installing: boolean;
  updateAvailable: boolean;
}

class ServiceWorkerService {
  private registration: ServiceWorkerRegistration | null = null;
  private isOnline: boolean = navigator.onLine;
  private onlineStatusCallbacks: Array<(status: boolean) => void> = [];

  constructor() {
    // Écouter les changements de statut réseau
    window.addEventListener('online', () => {
      this.isOnline = true;
      this.notifyOnlineStatusChange(true);
      console.log('🌐 Connexion rétablie');
    });

    window.addEventListener('offline', () => {
      this.isOnline = false;
      this.notifyOnlineStatusChange(false);
      console.log('📡 Connexion perdue - Mode offline activé');
    });

    // Écouter les messages du Service Worker
    navigator.serviceWorker?.addEventListener('message', this.handleMessage.bind(this));
  }

  /**
   * Enregistrer le Service Worker
   */
  async register(): Promise<boolean> {
    if (!('serviceWorker' in navigator)) {
      console.warn('⚠️ Service Worker non supporté par ce navigateur');
      return false;
    }

    try {
      // Vérifier si on est dans Capacitor (capacitor://localhost)
      const isCapacitor = window.location.protocol === 'capacitor:' || 
                          window.location.protocol === 'ionic:';
      
      if (isCapacitor) {
        console.log('📱 Capacitor détecté - Service Worker désactivé (non supporté)');
        return false;
      }

      console.log('🔧 Enregistrement du Service Worker...');

      this.registration = await navigator.serviceWorker.register(
        '/service-worker.js',
        { scope: '/' }
      );

      console.log('✅ Service Worker enregistré avec succès');
      console.log('   - Scope:', this.registration.scope);
      console.log('   - Active:', !!this.registration.active);

      // Gérer les mises à jour
      this.registration.addEventListener('updatefound', () => {
        const newWorker = this.registration?.installing;
        console.log('🔄 Nouvelle version du Service Worker détectée');

        newWorker?.addEventListener('statechange', () => {
          if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
            console.log('✨ Mise à jour du Service Worker prête');
            this.notifyUpdateAvailable();
          }
        });
      });

      // Vérifier les mises à jour toutes les heures
      setInterval(() => {
        this.checkForUpdates();
      }, 60 * 60 * 1000);

      return true;
    } catch (error) {
      console.error('❌ Erreur lors de l\'enregistrement du Service Worker:', error);
      return false;
    }
  }

  /**
   * Désenregistrer le Service Worker
   */
  async unregister(): Promise<boolean> {
    if (!this.registration) {
      return false;
    }

    try {
      const success = await this.registration.unregister();
      console.log('✅ Service Worker désenregistré');
      this.registration = null;
      return success;
    } catch (error) {
      console.error('❌ Erreur lors du désenregistrement du Service Worker:', error);
      return false;
    }
  }

  /**
   * Vérifier les mises à jour du Service Worker
   */
  async checkForUpdates(): Promise<void> {
    if (!this.registration) {
      return;
    }

    try {
      await this.registration.update();
      console.log('🔄 Vérification des mises à jour effectuée');
    } catch (error) {
      console.error('❌ Erreur lors de la vérification des mises à jour:', error);
    }
  }

  /**
   * Activer la nouvelle version du Service Worker
   */
  async activateUpdate(): Promise<void> {
    if (!this.registration?.waiting) {
      return;
    }

    // Envoyer le message SKIP_WAITING au nouveau SW
    this.registration.waiting.postMessage({ type: 'SKIP_WAITING' });

    // Recharger la page après activation
    window.location.reload();
  }

  /**
   * Obtenir le statut du Service Worker
   */
  getStatus(): ServiceWorkerStatus {
    return {
      registered: !!this.registration,
      active: !!this.registration?.active,
      waiting: !!this.registration?.waiting,
      installing: !!this.registration?.installing,
      updateAvailable: !!this.registration?.waiting,
    };
  }

  /**
   * Obtenir la taille des caches
   */
  async getCacheSizes(): Promise<CacheSizes> {
    return new Promise((resolve) => {
      // Envoyer le message au SW
      navigator.serviceWorker?.controller?.postMessage({
        type: 'GET_CACHE_SIZE',
      });

      // Écouter la réponse
      const handler = (event: MessageEvent) => {
        if (event.data.type === 'CACHE_SIZE_RESPONSE') {
          navigator.serviceWorker?.removeEventListener('message', handler);
          resolve(event.data.payload);
        }
      };

      navigator.serviceWorker?.addEventListener('message', handler);

      // Timeout après 5 secondes
      setTimeout(() => {
        navigator.serviceWorker?.removeEventListener('message', handler);
        resolve({ static: 0, api: 0, images: 0, audio: 0 });
      }, 5000);
    });
  }

  /**
   * Vider tous les caches
   */
  async clearAllCaches(): Promise<void> {
    navigator.serviceWorker?.controller?.postMessage({
      type: 'CLEAR_CACHE',
    });

    console.log('🗑️ Demande de suppression de tous les caches envoyée');
  }

  /**
   * Mettre en cache une liste d'URLs
   */
  async cacheUrls(urls: string[], cacheName?: string): Promise<void> {
    navigator.serviceWorker?.controller?.postMessage({
      type: 'CACHE_URLS',
      payload: { urls, cacheName },
    });

    console.log(`📦 Demande de mise en cache de ${urls.length} URLs envoyée`);
  }

  /**
   * Statut online/offline
   */
  isOnlineNow(): boolean {
    return this.isOnline;
  }

  /**
   * S'abonner aux changements de statut online/offline
   */
  onOnlineStatusChange(callback: (status: boolean) => void): () => void {
    this.onlineStatusCallbacks.push(callback);

    // Retourner fonction de désabonnement
    return () => {
      this.onlineStatusCallbacks = this.onlineStatusCallbacks.filter((cb) => cb !== callback);
    };
  }

  /**
   * Notifier les changements de statut online/offline
   */
  private notifyOnlineStatusChange(status: boolean): void {
    this.onlineStatusCallbacks.forEach((callback) => {
      try {
        callback(status);
      } catch (error) {
        console.error('❌ Erreur dans le callback de statut online:', error);
      }
    });
  }

  /**
   * Notifier qu'une mise à jour est disponible
   */
  private notifyUpdateAvailable(): void {
    // Émettre un événement personnalisé
    window.dispatchEvent(
      new CustomEvent('sw-update-available', {
        detail: { registration: this.registration },
      })
    );
  }

  /**
   * Gérer les messages du Service Worker
   */
  private handleMessage(event: MessageEvent): void {
    const { type, payload } = event.data;

    switch (type) {
      case 'CACHE_SIZE_RESPONSE':
        console.log('📊 Tailles des caches:', payload);
        break;

      case 'SYNC_COMPLETE':
        console.log('✅ Synchronisation terminée:', payload);
        break;

      case 'CACHE_UPDATED':
        console.log('🔄 Cache mis à jour:', payload);
        break;

      default:
        console.log('📨 Message du SW:', type, payload);
    }
  }

  /**
   * Enregistrer une synchronisation en arrière-plan
   */
  async registerBackgroundSync(tag: string): Promise<boolean> {
    if (!this.registration || !('sync' in this.registration)) {
      console.warn('⚠️ Background Sync non supporté');
      return false;
    }

    try {
      await (this.registration as any).sync.register(tag);
      console.log(`✅ Background Sync enregistré: ${tag}`);
      return true;
    } catch (error) {
      console.error('❌ Erreur lors de l\'enregistrement du Background Sync:', error);
      return false;
    }
  }

  /**
   * Précharger les ressources essentielles
   */
  async precacheEssentials(attractions: any[]): Promise<void> {
    if (!this.registration) {
      console.warn('⚠️ Service Worker non enregistré, impossible de précacher');
      return;
    }

    const urls: string[] = [];

    // Ajouter les images des attractions
    attractions.forEach((attraction) => {
      if (attraction.images && attraction.images.length > 0) {
        urls.push(attraction.images[0]); // Première image uniquement
      }
    });

    // Ajouter les URLs des API endpoints
    urls.push(
      `${import.meta.env.VITE_API_URL}/attractions`,
      `${import.meta.env.VITE_API_URL}/audioguides`,
      `${import.meta.env.VITE_API_URL}/tours`
    );

    await this.cacheUrls(urls);
    console.log(`📦 Préchargement de ${urls.length} ressources essentielles`);
  }

  /**
   * Obtenir les statistiques de stockage
   */
  async getStorageEstimate(): Promise<{
    usage: number;
    quota: number;
    percentage: number;
  }> {
    if (!('storage' in navigator && 'estimate' in navigator.storage)) {
      return { usage: 0, quota: 0, percentage: 0 };
    }

    try {
      const estimate = await navigator.storage.estimate();
      const usage = estimate.usage || 0;
      const quota = estimate.quota || 0;
      const percentage = quota > 0 ? (usage / quota) * 100 : 0;

      return {
        usage,
        quota,
        percentage: Math.round(percentage * 100) / 100,
      };
    } catch (error) {
      console.error('❌ Erreur lors de l\'estimation du stockage:', error);
      return { usage: 0, quota: 0, percentage: 0 };
    }
  }

  /**
   * Formater les tailles en bytes
   */
  formatBytes(bytes: number): string {
    if (bytes === 0) return '0 B';

    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));

    return `${Math.round((bytes / Math.pow(k, i)) * 100) / 100} ${sizes[i]}`;
  }

  /**
   * Obtenir un rapport complet du cache
   */
  async getCacheReport(): Promise<{
    sizes: CacheSizes;
    total: number;
    storage: { usage: number; quota: number; percentage: number };
    formatted: {
      sizes: Record<string, string>;
      total: string;
      storage: { usage: string; quota: string; percentage: string };
    };
  }> {
    const sizes = await this.getCacheSizes();
    const storage = await this.getStorageEstimate();

    const total = Object.values(sizes).reduce((sum, size) => sum + size, 0);

    return {
      sizes,
      total,
      storage,
      formatted: {
        sizes: {
          static: this.formatBytes(sizes.static),
          api: this.formatBytes(sizes.api),
          images: this.formatBytes(sizes.images),
          audio: this.formatBytes(sizes.audio),
        },
        total: this.formatBytes(total),
        storage: {
          usage: this.formatBytes(storage.usage),
          quota: this.formatBytes(storage.quota),
          percentage: `${storage.percentage}%`,
        },
      },
    };
  }
}

// Export singleton
export const serviceWorkerService = new ServiceWorkerService();

// Auto-register en production (pas en dev ni Capacitor)
if (import.meta.env.PROD && typeof window !== 'undefined') {
  window.addEventListener('load', () => {
    serviceWorkerService.register();
  });
}
