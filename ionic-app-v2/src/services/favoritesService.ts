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
    console.log('[FavoritesService] Initialized for user:', userId);
  }

  /**
   * Obtenir l'userId actuel
   */
  private getUserId(): string {
    if (!this.userId) {
      // Fallback: générer un ID temporaire si pas encore initialisé
      this.userId = `user-${Date.now()}`;
      this.userName = 'Guest User';
    }
    return this.userId;
  }

  /**
   * Ajouter une attraction aux favoris
   */
  async addFavorite(attractionId: string): Promise<Favorite> {
    try {
      console.log('[FavoritesService] Adding favorite:', attractionId);

      const response = await apiClient.post<Favorite>('/api/favorites', {
        userId: this.getUserId(),
        userName: this.userName || 'User',
        attractionId,
      });

      if (response.success) {
        console.log('[FavoritesService] Favorite added successfully');
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
      console.log('[FavoritesService] Removing favorite:', attractionId);

      const response = await apiClient.delete<{ message: string }>(
        `/api/favorites/${attractionId}`
      );

      if (response.success) {
        console.log('[FavoritesService] Favorite removed successfully');
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
      console.log('[FavoritesService] Fetching user favorites');

      const response = await apiClient.get<Favorite[]>('/api/favorites', {
        userId: this.getUserId(),
      });

      if (response.success) {
        console.log('[FavoritesService] Favorites fetched:', response.data.length);
        return response.data;
      } else {
        throw new Error(response.message || 'Erreur lors de la récupération des favoris');
      }
    } catch (error) {
      console.error('[FavoritesService] Error fetching favorites:', error);
      throw error;
    }
  }

  /**
   * Vérifier si une attraction est dans les favoris
   */
  async isFavorite(attractionId: string): Promise<boolean> {
    try {
      const response = await apiClient.get<{ isFavorite: boolean }>(
        `/api/favorites/check/${attractionId}`,
        {
          userId: this.getUserId(),
        }
      );

      if (response.success) {
        return response.data.isFavorite;
      } else {
        return false;
      }
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
