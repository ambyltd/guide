/**
 * Service des attractions payantes - Architecture avec cache et offline
 */

import type { 
  PaidAttraction, 
  DownloadRequest, 
  DownloadStatus,
  PurchaseRequest 
} from '../types/attractions';
import type { ApiError } from '../types/auth';

// Simulation d'une API - à remplacer par des appels réels
// const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

/**
 * Cache en mémoire pour les attractions
 */
class AttractionsCache {
  private cache = new Map<string, { data: PaidAttraction[], timestamp: number }>();
  private readonly CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

  set(key: string, data: PaidAttraction[]): void {
    this.cache.set(key, { data, timestamp: Date.now() });
  }

  get(key: string): PaidAttraction[] | null {
    const cached = this.cache.get(key);
    if (!cached) return null;
    
    const isExpired = Date.now() - cached.timestamp > this.CACHE_DURATION;
    if (isExpired) {
      this.cache.delete(key);
      return null;
    }
    
    return cached.data;
  }

  clear(): void {
    this.cache.clear();
  }
}

const cache = new AttractionsCache();

/**
 * Gestion d'erreurs API
 */
const handleApiError = (error: unknown): ApiError => {
  if (typeof error === 'object' && error !== null && 'response' in error) {
    const apiError = error as { response?: { data?: Record<string, unknown>; status?: number } };
    return {
      message: (apiError.response?.data?.message as string) || 'Erreur serveur',
      code: apiError.response?.status?.toString() || 'SERVER_ERROR'
    };
  }
  
  if (typeof error === 'object' && error !== null && 'request' in error) {
    return {
      message: 'Impossible de contacter le serveur. Verifiez votre connexion.',
      code: 'NETWORK_ERROR'
    };
  }
  
  const errorMessage = error instanceof Error ? error.message : 'Une erreur inattendue est survenue.';
  return {
    message: errorMessage,
    code: 'UNKNOWN_ERROR'
  };
};

/**
 * Données de démonstration - attractions payantes
 */
const mockPaidAttractions: PaidAttraction[] = [
  {
    id: 'att-001',
    title: 'Musée des Civilisations',
    description: "Decouvrez l'histoire riche et diversifiee de la Cote d'Ivoire a travers ses civilisations ancestrales.",
    shortDescription: 'Guide audio premium du musée',
    category: 'Culture',
    location: {
      coordinates: [-4.0267, 5.3364],
      address: 'Plateau, Abidjan',
      city: 'Abidjan'
    },
    pricing: {
      free: false,
      price: 4.99,
      currency: 'EUR',
      discountedPrice: 3.99
    },
    audioGuide: {
      duration: '45 min',
      language: ['fr', 'en'],
      fileSize: '85 MB'
    },
    media: {
      images: ['/assets/museum-1.jpg', '/assets/museum-2.jpg'],
      thumbnail: '/assets/museum-thumb.jpg'
    },
    features: ['Audio HD', 'Cartes interactives', 'Quiz', 'Accès offline'],
    rating: { average: 4.8, count: 124 },
    isPurchased: false,
    isDownloaded: false,
    createdAt: new Date('2024-01-15'),
    updatedAt: new Date('2024-02-20')
  },
  {
    id: 'att-002',
    title: 'Parc National de Taï',
    description: "Explorez la biodiversite exceptionnelle de ce joyau de l'Afrique de l'Ouest avec notre guide naturaliste.",
    shortDescription: 'Guide nature immersif',
    category: 'Nature',
    location: {
      coordinates: [-7.3547, 5.8481],
      address: 'Parc National de Taï',
      city: 'Taï'
    },
    pricing: {
      free: false,
      price: 6.99,
      currency: 'EUR'
    },
    audioGuide: {
      duration: '1h 20min',
      language: ['fr', 'en'],
      fileSize: '125 MB'
    },
    media: {
      images: ['/assets/tai-1.jpg', '/assets/tai-2.jpg'],
      thumbnail: '/assets/tai-thumb.jpg'
    },
    features: ['Sons de la nature', 'Guide GPS', 'Identification espèces'],
    rating: { average: 4.9, count: 89 },
    isPurchased: false,
    isDownloaded: false,
    createdAt: new Date('2024-01-20'),
    updatedAt: new Date('2024-02-25')
  },
  {
    id: 'att-003',
    title: 'Basilique Notre-Dame de la Paix',
    description: 'Visitez le plus grand édifice religieux chrétien au monde avec un guide audio exclusif.',
    shortDescription: 'Visite guidée de la basilique',
    category: 'Architecture',
    location: {
      coordinates: [-5.1859, 6.8993],
      address: 'Yamoussoukro',
      city: 'Yamoussoukro'
    },
    pricing: {
      free: false,
      price: 5.99,
      currency: 'EUR',
      discountedPrice: 4.99
    },
    audioGuide: {
      duration: '55 min',
      language: ['fr', 'en', 'es'],
      fileSize: '95 MB'
    },
    media: {
      images: ['/assets/basilique-1.jpg', '/assets/basilique-2.jpg'],
      thumbnail: '/assets/basilique-thumb.jpg'
    },
    features: ['Histoire architecturale', 'Anecdotes', 'Visite virtuelle'],
    rating: { average: 4.7, count: 203 },
    isPurchased: false,
    isDownloaded: false,
    createdAt: new Date('2024-01-10'),
    updatedAt: new Date('2024-02-15')
  }
];

export const attractionsService = {
  /**
   * Récupérer toutes les attractions payantes
   */
  async getPaidAttractions(useCache: boolean = true): Promise<PaidAttraction[]> {
    try {
      const cacheKey = 'paid-attractions';
      
      if (useCache) {
        const cached = cache.get(cacheKey);
        if (cached) return cached;
      }

      // Simulation d'appel API - remplacer par fetch réel
      await new Promise(resolve => setTimeout(resolve, 500)); // Simulate network delay
      
      const attractions = mockPaidAttractions;
      cache.set(cacheKey, attractions);
      
      return attractions;
    } catch (error) {
      throw handleApiError(error);
    }
  },

  /**
   * Récupérer les achats de l'utilisateur
   */
  async getUserPurchases(userId: string): Promise<string[]> {
    try {
      // Simulation - remplacer par appel API réel
      await new Promise(resolve => setTimeout(resolve, 300));
      
      // Mock: quelques achats pour la démo basés sur l'utilisateur
      return userId ? ['att-001'] : [];
    } catch (error) {
      throw handleApiError(error);
    }
  },

  /**
   * Acheter une attraction
   */
  async purchaseAttraction(request: PurchaseRequest): Promise<{ success: boolean; transactionId: string }> {
    try {
      // Simulation d'achat - remplacer par logique de paiement réelle
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      return {
        success: true,
        transactionId: `txn_${request.attractionId}_${Date.now()}`
      };
    } catch (error) {
      throw handleApiError(error);
    }
  },

  /**
   * Télécharger une attraction
   */
  async downloadAttraction(
    request: DownloadRequest,
    onProgress?: (progress: number) => void
  ): Promise<DownloadStatus> {
    try {
      // Simulation de téléchargement avec progression
      const downloadStatus: DownloadStatus = {
        attractionId: request.attractionId,
        status: 'downloading',
        progress: 0
      };

      // Simuler la progression
      for (let i = 0; i <= 100; i += 10) {
        await new Promise(resolve => setTimeout(resolve, 200));
        downloadStatus.progress = i;
        onProgress?.(i);
      }

      downloadStatus.status = 'completed';
      downloadStatus.downloadedAt = new Date();
      downloadStatus.filePath = `/downloads/${request.attractionId}_${request.quality}.mp3`;
      
      return downloadStatus;
    } catch (error) {
      throw handleApiError(error);
    }
  },

  /**
   * Obtenir le statut de téléchargement
   */
  async getDownloadStatus(attractionId: string): Promise<DownloadStatus | null> {
    try {
      // Simulation - vérifier en base/cache local
      await new Promise(resolve => setTimeout(resolve, 100));
      
      // Mock: retourner null si pas téléchargé pour cette attraction
      console.log(`Checking download status for ${attractionId}`);
      return null;
    } catch (error) {
      throw handleApiError(error);
    }
  },

  /**
   * Vider le cache
   */
  clearCache(): void {
    cache.clear();
  }
};