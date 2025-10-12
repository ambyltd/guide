import { useState, useEffect } from 'react';
import featureFlagService, { FeatureFlag } from '../services/featureFlagService';

/**
 * ============================================
 * 🎛️ useFeatureFlag Hook - Sprint 5
 * ============================================
 * Hook React pour vérifier si une feature est enabled
 * 
 * Usage:
 * ```tsx
 * const { isEnabled, isLoading, feature } = useFeatureFlag('social_sharing');
 * 
 * if (isEnabled) {
 *   return <ShareButton />;
 * }
 * ```
 * ============================================
 */

interface UseFeatureFlagReturn {
  isEnabled: boolean;
  isLoading: boolean;
  feature: FeatureFlag | null;
  refresh: () => Promise<void>;
}

export function useFeatureFlag(key: string, fallback: boolean = true): UseFeatureFlagReturn {
  const [isEnabled, setIsEnabled] = useState<boolean>(fallback);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [feature, setFeature] = useState<FeatureFlag | null>(null);

  useEffect(() => {
    // Vérifier immédiatement dans le cache
    const cachedEnabled = featureFlagService.isEnabled(key, fallback);
    const cachedFeature = featureFlagService.getFeature(key);

    setIsEnabled(cachedEnabled);
    setFeature(cachedFeature);
    setIsLoading(false);

    // Si le cache est expiré, fetch depuis l'API
    if (featureFlagService.isCacheExpired()) {
      featureFlagService.fetchFeatures().then(() => {
        const updatedEnabled = featureFlagService.isEnabled(key, fallback);
        const updatedFeature = featureFlagService.getFeature(key);

        setIsEnabled(updatedEnabled);
        setFeature(updatedFeature);
      });
    }
  }, [key, fallback]);

  const refresh = async () => {
    setIsLoading(true);
    await featureFlagService.refresh();
    const updatedEnabled = featureFlagService.isEnabled(key, fallback);
    const updatedFeature = featureFlagService.getFeature(key);

    setIsEnabled(updatedEnabled);
    setFeature(updatedFeature);
    setIsLoading(false);
  };

  return { isEnabled, isLoading, feature, refresh };
}

/**
 * Hook pour récupérer toutes les features
 */
export function useAllFeatureFlags() {
  const [features, setFeatures] = useState<FeatureFlag[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    const cachedFeatures = featureFlagService.getAllFeatures();
    setFeatures(cachedFeatures);
    setIsLoading(false);

    if (featureFlagService.isCacheExpired()) {
      featureFlagService.fetchFeatures().then((updated) => {
        setFeatures(updated);
      });
    }
  }, []);

  const refresh = async () => {
    setIsLoading(true);
    const updated = await featureFlagService.refresh();
    setFeatures(updated);
    setIsLoading(false);
  };

  return { features, isLoading, refresh };
}

/**
 * Hook pour récupérer les features par catégorie
 */
export function useFeaturesByCategory(category: FeatureFlag['category']) {
  const [features, setFeatures] = useState<FeatureFlag[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    const cachedFeatures = featureFlagService.getFeaturesByCategory(category);
    setFeatures(cachedFeatures);
    setIsLoading(false);

    if (featureFlagService.isCacheExpired()) {
      featureFlagService.fetchFeatures().then(() => {
        const updated = featureFlagService.getFeaturesByCategory(category);
        setFeatures(updated);
      });
    }
  }, [category]);

  return { features, isLoading };
}
