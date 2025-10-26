/**
 * Service pour gérer les favoris utilisateur
 * Intégration avec backend API /api/favorites
 */

import { apiClient } from './apiClient';

export interface Favorite {
  _id: string;
  userId: string;
  attractionId: string | Attraction;
  createdAt: string;
  updatedAt: string;
}

export interface Attraction {
  _id: string;
  name: string;
  location: {
    city: string;
    coordinates?: [number, number];
  };
  images: string[];
  rating: number;
  category?: string;
}

class FavoritesService {
  private userId: string | null = null;
  private userName: string | null = null;

  /**
   * Initialiser le service avec les données utilisateur
   */
  initialize(userId: string, userName: string = 'User') {
    this.userId = userId;
    this.userName = userName;
  }

  /**
   * Obtenir l'userId actuel
   */
  private getUserId(): string {
    if (!this.userId) {
      throw new Error('FavoritesService non initialisé. Veuillez vous connecter.');
    }
    return this.userId;
  }

  /**
   * Ajouter une attraction aux favoris
   */
  async addFavorite(attractionId: string): Promise<Favorite> {
    try {
      const userId = this.getUserId();
      
      const response = await apiClient.post<Favorite>('/api/favorites', {
        userId,
        userName: this.userName || 'User',
        attractionId,
      });

      if (response.success) {
        return response.data;
      } else {
        throw new Error(response.message || 'Erreur lors de l\'ajout du favori');
      }
    } catch (error) {
      console.error('[FavoritesService] Error adding favorite:', error);
      throw error;
    }
  }

  /**
   * Supprimer une attraction des favoris
   */
  async removeFavorite(attractionId: string): Promise<void> {
    try {
      const userId = this.getUserId();
      
      const response = await apiClient.delete<{ message: string }>(
        `/api/favorites/${attractionId}`,
        { userId }
      );

      if (response.success) {
        return;
      } else {
        throw new Error(response.message || 'Erreur lors de la suppression du favori');
      }
    } catch (error) {
      console.error('[FavoritesService] Error removing favorite:', error);
      throw error;
    }
  }

  /**
   * Récupérer tous les favoris de l'utilisateur
   */
  async getUserFavorites(): Promise<Favorite[]> {
    try {
      const userId = this.getUserId();
      if (!userId) {
        console.warn('[FavoritesService] No userId, returning empty favorites');
        return [];
      }

      const response = await apiClient.get<Favorite[]>(`/api/favorites?userId=${userId}`);

      if (response.success) {
        return response.data;
      } else {
        throw new Error(response.message || 'Erreur lors de la récupération des favoris');
      }
    } catch (error) {
      console.error('[FavoritesService] Error fetching favorites:', error);
      // Retourner un tableau vide au lieu de throw pour ne pas bloquer l'app
      return [];
    }
  }

  /**
   * Vérifier si une attraction est dans les favoris
   */
  async isFavorite(attractionId: string): Promise<boolean> {
    try {
      const userId = this.getUserId();
      if (!userId) {
        console.warn('[FavoritesService] No userId, favorite check returns false');
        return false;
      }

      const response = await apiClient.get<{ isFavorite: boolean }>(
        `/api/favorites/check/${attractionId}?userId=${userId}`
      );

      // Gérer les deux formats de réponse (local et prod)
      if (response.success) {
        // Format standard: { success: true, data: { isFavorite: boolean } }
        if (response.data && typeof response.data === 'object' && 'isFavorite' in response.data) {
          return response.data.isFavorite;
        }
        // Format prod: { success: true, isFavorite: boolean }
        if ('isFavorite' in response) {
          return (response as { success: boolean; isFavorite: boolean }).isFavorite;
        }
      }
      return false;
    } catch (error) {
      console.error('[FavoritesService] Error checking favorite:', error);
      return false;
    }
  }

  /**
   * Toggle favori (ajouter ou supprimer)
   */
  async toggleFavorite(attractionId: string): Promise<boolean> {
    try {
      const isFav = await this.isFavorite(attractionId);

      if (isFav) {
        await this.removeFavorite(attractionId);
        return false;
      } else {
        await this.addFavorite(attractionId);
        return true;
      }
    } catch (error) {
      console.error('[FavoritesService] Error toggling favorite:', error);
      throw error;
    }
  }

  /**
   * Obtenir les IDs des favoris (pour affichage rapide)
   */
  async getFavoriteIds(): Promise<string[]> {
    try {
      const favorites = await this.getUserFavorites();
      return favorites.map((fav) => {
        if (typeof fav.attractionId === 'string') {
          return fav.attractionId;
        } else {
          return fav.attractionId._id;
        }
      });
    } catch (error) {
      console.error('[FavoritesService] Error getting favorite IDs:', error);
      return [];
    }
  }
}

export const favoritesService = new FavoritesService();
