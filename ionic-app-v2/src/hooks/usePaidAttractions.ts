/**
 * Hook pour gérer les attractions payantes
 */

import { useState, useEffect, useCallback } from 'react';
import { attractionsService } from '../services/paidAttractionsService';
import type { PaidAttraction, DownloadRequest, PurchaseRequest } from '../types/attractions';

// Mock pour la démo - à remplacer par le vrai store Redux
const mockUser = { id: 'demo-user', displayName: 'Utilisateur démo' };

export const usePaidAttractions = () => {
  const user = mockUser; // Simulation pour la démo
  
  const [attractions, setAttractions] = useState<PaidAttraction[]>([]);
  const [userPurchases, setUserPurchases] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Charger les attractions et achats de l'utilisateur
  const loadData = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);

      const [attractionsData, purchasesData] = await Promise.all([
        attractionsService.getPaidAttractions(),
        user ? attractionsService.getUserPurchases(user.id) : Promise.resolve([])
      ]);

      // Marquer les attractions achetées
      const enrichedAttractions = attractionsData.map(attraction => ({
        ...attraction,
        isPurchased: purchasesData.includes(attraction.id)
      }));

      setAttractions(enrichedAttractions);
      setUserPurchases(purchasesData);
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Erreur inconnue';
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Acheter une attraction
  const purchaseAttraction = async (attractionId: string, paymentMethod: 'card' | 'paypal' | 'apple_pay') => {
    if (!user) throw new Error('Utilisateur non authentifié');

    try {
      setIsLoading(true);
      const request: PurchaseRequest = { attractionId, paymentMethod };
      await attractionsService.purchaseAttraction(request);
      
      // Mettre à jour l'état local
      setUserPurchases(prev => [...prev, attractionId]);
      setAttractions(prev => prev.map(attraction => 
        attraction.id === attractionId 
          ? { ...attraction, isPurchased: true }
          : attraction
      ));
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Erreur inconnue';
      setError(errorMessage);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  // Télécharger une attraction
  const downloadAttraction = async (
    attractionId: string, 
    quality: 'standard' | 'high' = 'standard',
    onProgress?: (progress: number) => void
  ) => {
    if (!user) throw new Error('Utilisateur non authentifié');
    if (!userPurchases.includes(attractionId)) {
      throw new Error('Attraction non achetée');
    }

    try {
      const request: DownloadRequest = { attractionId, quality };
      const downloadStatus = await attractionsService.downloadAttraction(request, onProgress);
      
      // Mettre à jour l'état local
      setAttractions(prev => prev.map(attraction => 
        attraction.id === attractionId 
          ? { ...attraction, isDownloaded: true }
          : attraction
      ));

      return downloadStatus;
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Erreur inconnue';
      setError(errorMessage);
      throw err;
    }
  };

  return {
    attractions,
    userPurchases,
    isLoading,
    error,
    purchaseAttraction,
    downloadAttraction,
    refresh: loadData
  };
};