import { apiClient } from './apiClient';

/**
 * ============================================
 * 🎛️ FEATURE FLAG SERVICE - Sprint 5
 * ============================================
 * Service pour gérer les feature flags dans l'app mobile
 * - Cache local avec localStorage
 * - Auto-refresh (1h)
 * - Fallback: enabled par défaut si non trouvé
 * ============================================
 */

const CACHE_KEY = 'feature_flags_cache';
const CACHE_TIMESTAMP_KEY = 'feature_flags_timestamp';
const CACHE_DURATION = 60 * 60 * 1000; // 1 heure en millisecondes

export interface FeatureFlag {
  _id?: string;
  id?: string;
  key: string;
  name: string;
  description: string;
  enabled: boolean;
  requiredVersion: string;
  category: 'core' | 'social' | 'analytics' | 'offline' | 'experimental';
  metadata?: {
    icon?: string;
    color?: string;
    priority?: number;
    dependencies?: string[];
    [key: string]: any;
  };
  createdAt?: Date;
  updatedAt?: Date;
}

export interface FeatureFlagCache {
  features: FeatureFlag[];
  timestamp: number;
}

class FeatureFlagService {
  private cache: Map<string, boolean> = new Map();
  private allFeatures: FeatureFlag[] = [];
  private lastFetch: number = 0;
  private refreshTimer: NodeJS.Timeout | null = null;

  constructor() {
    this.loadFromLocalStorage();
    this.startAutoRefresh();
  }

  /**
   * Charge les feature flags depuis le cache localStorage
   */
  private loadFromLocalStorage(): void {
    try {
      const cachedData = localStorage.getItem(CACHE_KEY);
      const cachedTimestamp = localStorage.getItem(CACHE_TIMESTAMP_KEY);

      if (cachedData && cachedTimestamp) {
        const timestamp = parseInt(cachedTimestamp, 10);
        const now = Date.now();

        // Vérifier si le cache est encore valide (< 1h)
        if (now - timestamp < CACHE_DURATION) {
          const features: FeatureFlag[] = JSON.parse(cachedData);
          this.allFeatures = features;
          this.lastFetch = timestamp;

          // Remplir le cache Map
          features.forEach((feature) => {
            this.cache.set(feature.key, feature.enabled);
          });

          console.log(`[FeatureFlags] Loaded ${features.length} features from cache`);
        } else {
          console.log('[FeatureFlags] Cache expired, will fetch from API');
          this.fetchFeatures(); // Cache expiré, fetch depuis l'API
        }
      } else {
        console.log('[FeatureFlags] No cache found, will fetch from API');
        this.fetchFeatures(); // Pas de cache, fetch depuis l'API
      }
    } catch (error) {
      console.error('[FeatureFlags] Error loading from localStorage:', error);
    }
  }

  /**
   * Sauvegarde les feature flags dans le cache localStorage
   */
  private saveToLocalStorage(features: FeatureFlag[]): void {
    try {
      localStorage.setItem(CACHE_KEY, JSON.stringify(features));
      localStorage.setItem(CACHE_TIMESTAMP_KEY, Date.now().toString());
      console.log(`[FeatureFlags] Saved ${features.length} features to cache`);
    } catch (error) {
      console.error('[FeatureFlags] Error saving to localStorage:', error);
    }
  }

  /**
   * Fetch les feature flags depuis l'API backend
   */
  async fetchFeatures(): Promise<FeatureFlag[]> {
    try {
      console.log('[FeatureFlags] Fetching features from API...');

      const response = await apiClient.get<{
        success: boolean;
        data: { features: FeatureFlag[]; total: number };
      }>('/features');

      if (response.data.success && response.data.data.features) {
        const features = response.data.data.features;
        this.allFeatures = features;
        this.lastFetch = Date.now();

        // Mettre à jour le cache Map
        this.cache.clear();
        features.forEach((feature) => {
          this.cache.set(feature.key, feature.enabled);
        });

        // Sauvegarder dans localStorage
        this.saveToLocalStorage(features);

        console.log(`[FeatureFlags] Fetched ${features.length} features from API`);
        return features;
      }

      throw new Error('Invalid API response');
    } catch (error) {
      console.error('[FeatureFlags] Error fetching features:', error);
      // En cas d'erreur, retourner le cache existant
      return this.allFeatures;
    }
  }

  /**
   * Vérifie si une feature est enabled
   * @param key - Clé de la feature (ex: 'social_sharing')
   * @param fallback - Valeur par défaut si non trouvé (default: true)
   */
  isEnabled(key: string, fallback: boolean = true): boolean {
    // Vérifier dans le cache Map
    if (this.cache.has(key)) {
      return this.cache.get(key)!;
    }

    // Vérifier dans allFeatures
    const feature = this.allFeatures.find((f) => f.key === key);
    if (feature) {
      this.cache.set(key, feature.enabled);
      return feature.enabled;
    }

    // Fallback
    console.warn(`[FeatureFlags] Feature '${key}' not found, using fallback: ${fallback}`);
    return fallback;
  }

  /**
   * Récupère une feature complète par sa clé
   */
  getFeature(key: string): FeatureFlag | null {
    return this.allFeatures.find((f) => f.key === key) || null;
  }

  /**
   * Récupère toutes les features
   */
  getAllFeatures(): FeatureFlag[] {
    return [...this.allFeatures];
  }

  /**
   * Récupère les features par catégorie
   */
  getFeaturesByCategory(category: FeatureFlag['category']): FeatureFlag[] {
    return this.allFeatures.filter((f) => f.category === category);
  }

  /**
   * Récupère les features enabled
   */
  getEnabledFeatures(): FeatureFlag[] {
    return this.allFeatures.filter((f) => f.enabled);
  }

  /**
   * Vérifie si le cache est expiré
   */
  isCacheExpired(): boolean {
    const now = Date.now();
    return now - this.lastFetch > CACHE_DURATION;
  }

  /**
   * Force le refresh des features depuis l'API
   */
  async refresh(): Promise<FeatureFlag[]> {
    console.log('[FeatureFlags] Manual refresh triggered');
    return this.fetchFeatures();
  }

  /**
   * Démarre le refresh automatique (toutes les heures)
   */
  private startAutoRefresh(): void {
    if (this.refreshTimer) {
      clearInterval(this.refreshTimer);
    }

    this.refreshTimer = setInterval(() => {
      if (this.isCacheExpired()) {
        console.log('[FeatureFlags] Auto-refresh triggered');
        this.fetchFeatures();
      }
    }, CACHE_DURATION); // Check toutes les heures

    console.log('[FeatureFlags] Auto-refresh started (interval: 1h)');
  }

  /**
   * Arrête le refresh automatique
   */
  stopAutoRefresh(): void {
    if (this.refreshTimer) {
      clearInterval(this.refreshTimer);
      this.refreshTimer = null;
      console.log('[FeatureFlags] Auto-refresh stopped');
    }
  }

  /**
   * Efface le cache
   */
  clearCache(): void {
    this.cache.clear();
    this.allFeatures = [];
    this.lastFetch = 0;
    localStorage.removeItem(CACHE_KEY);
    localStorage.removeItem(CACHE_TIMESTAMP_KEY);
    console.log('[FeatureFlags] Cache cleared');
  }

  /**
   * Vérifie une feature depuis l'API (bypass cache)
   */
  async checkFeatureFromAPI(key: string): Promise<boolean> {
    try {
      const response = await apiClient.get<{
        success: boolean;
        data: { key: string; enabled: boolean; exists: boolean };
      }>(`/features/check/${key}`);

      if (response.data.success) {
        return response.data.data.enabled;
      }

      return false;
    } catch (error) {
      console.error(`[FeatureFlags] Error checking feature '${key}':`, error);
      return this.isEnabled(key); // Fallback au cache
    }
  }

  /**
   * Statistiques du cache
   */
  getCacheStats() {
    return {
      totalFeatures: this.allFeatures.length,
      enabledFeatures: this.allFeatures.filter((f) => f.enabled).length,
      disabledFeatures: this.allFeatures.filter((f) => !f.enabled).length,
      categories: {
        core: this.allFeatures.filter((f) => f.category === 'core').length,
        social: this.allFeatures.filter((f) => f.category === 'social').length,
        analytics: this.allFeatures.filter((f) => f.category === 'analytics').length,
        offline: this.allFeatures.filter((f) => f.category === 'offline').length,
        experimental: this.allFeatures.filter((f) => f.category === 'experimental').length,
      },
      lastFetch: new Date(this.lastFetch).toISOString(),
      cacheAge: Date.now() - this.lastFetch,
      isExpired: this.isCacheExpired(),
    };
  }
}

// Instance singleton
const featureFlagService = new FeatureFlagService();

export default featureFlagService;
