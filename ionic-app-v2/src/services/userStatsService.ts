/**
 * Service pour gérer les statistiques utilisateur
 * Intégration avec backend API /api/users/:userId/stats
 */

import { apiClient } from './apiClient';

export interface UserStats {
  _id: string;
  userId: string;
  userName: string;
  attractionsVisited: number;
  audioGuidesListened: number;
  toursCompleted: number;
  totalListeningTime: number; // en secondes
  favoriteCount: number;
  reviewCount: number;
  badges: string[];
  lastActivityAt: string;
  createdAt: string;
  updatedAt: string;
}

export interface LeaderboardEntry {
  _id: string;
  userId: string;
  userName: string;
  attractionsVisited: number;
  audioGuidesListened: number;
  toursCompleted: number;
  totalListeningTime: number;
  favoriteCount: number;
  reviewCount: number;
  badges: string[];
}

export interface LeaderboardResponse {
  count: number;
  sortBy: string;
  data: LeaderboardEntry[];
}

export type StatsField =
  | 'attractionsVisited'
  | 'audioGuidesListened'
  | 'toursCompleted'
  | 'totalListeningTime'
  | 'favoriteCount'
  | 'reviewCount';

class UserStatsService {
  private userId: string | null = null;
  private userName: string | null = null;
  private localStats: UserStats | null = null;

  /**
   * Initialiser le service avec les données utilisateur
   */
  initialize(userId: string, userName: string = 'User') {
    this.userId = userId;
    this.userName = userName;
    console.log('[UserStatsService] Initialized for user:', userId);
  }

  /**
   * Obtenir l'userId actuel
   */
  private getUserId(): string {
    if (!this.userId) {
      this.userId = `user-${Date.now()}`;
      this.userName = 'Guest User';
    }
    return this.userId;
  }

  /**
   * Récupérer les stats de l'utilisateur
   */
  async getUserStats(): Promise<UserStats> {
    try {
      console.log('[UserStatsService] Fetching user stats');

      const response = await apiClient.get<UserStats>(
        `/api/users/${this.getUserId()}/stats`
      );

      if (response.success) {
        this.localStats = response.data;
        console.log('[UserStatsService] Stats fetched successfully');
        return response.data;
      } else {
        throw new Error(response.message || 'Erreur lors de la récupération des stats');
      }
    } catch (error) {
      console.error('[UserStatsService] Error fetching stats:', error);
      throw error;
    }
  }

  /**
   * Mettre à jour les stats (batch update)
   */
  async updateUserStats(updates: Partial<UserStats>): Promise<UserStats> {
    try {
      console.log('[UserStatsService] Updating user stats');

      const response = await apiClient.patch<UserStats>(
        `/api/users/${this.getUserId()}/stats`,
        updates
      );

      if (response.success) {
        this.localStats = response.data;
        console.log('[UserStatsService] Stats updated successfully');
        return response.data;
      } else {
        throw new Error(response.message || 'Erreur lors de la mise à jour des stats');
      }
    } catch (error) {
      console.error('[UserStatsService] Error updating stats:', error);
      throw error;
    }
  }

  /**
   * Incrémenter un compteur spécifique
   */
  async incrementStat(field: StatsField, value: number = 1): Promise<UserStats> {
    try {
      console.log(`[UserStatsService] Incrementing ${field} by ${value}`);

      const response = await apiClient.patch<UserStats>(
        `/api/users/${this.getUserId()}/stats/increment`,
        { field, value }
      );

      if (response.success) {
        this.localStats = response.data;
        console.log('[UserStatsService] Stat incremented successfully');
        return response.data;
      } else {
        throw new Error(response.message || 'Erreur lors de l\'incrémentation');
      }
    } catch (error) {
      console.error('[UserStatsService] Error incrementing stat:', error);
      throw error;
    }
  }

  /**
   * Ajouter un badge
   */
  async addBadge(badge: string): Promise<UserStats> {
    try {
      console.log('[UserStatsService] Adding badge:', badge);

      const response = await apiClient.post<UserStats>(
        `/api/users/${this.getUserId()}/stats/badge`,
        { badge }
      );

      if (response.success) {
        this.localStats = response.data;
        console.log('[UserStatsService] Badge added successfully');
        return response.data;
      } else {
        throw new Error(response.message || 'Erreur lors de l\'ajout du badge');
      }
    } catch (error) {
      console.error('[UserStatsService] Error adding badge:', error);
      throw error;
    }
  }

  /**
   * Récupérer le classement des utilisateurs
   */
  async getLeaderboard(
    sortBy: StatsField = 'attractionsVisited',
    limit: number = 10
  ): Promise<LeaderboardResponse> {
    try {
      console.log('[UserStatsService] Fetching leaderboard');

      const response = await apiClient.get<LeaderboardResponse>('/api/users/leaderboard', {
        sortBy,
        limit,
      });

      if (response.success) {
        console.log('[UserStatsService] Leaderboard fetched:', response.data.count);
        return response.data;
      } else {
        throw new Error(response.message || 'Erreur lors de la récupération du classement');
      }
    } catch (error) {
      console.error('[UserStatsService] Error fetching leaderboard:', error);
      throw error;
    }
  }

  /**
   * Obtenir les stats locales (cache)
   */
  getLocalStats(): UserStats | null {
    return this.localStats;
  }

  /**
   * Convertir le temps d'écoute en format lisible
   */
  formatListeningTime(seconds: number): string {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);

    if (hours > 0) {
      return `${hours}h ${minutes}min`;
    } else {
      return `${minutes}min`;
    }
  }

  /**
   * Vérifier si un badge existe déjà
   */
  hasBadge(badge: string): boolean {
    if (!this.localStats) return false;
    return this.localStats.badges.includes(badge);
  }

  /**
   * Obtenir les badges disponibles (définitions)
   */
  getAvailableBadges(): Record<string, { name: string; description: string; icon: string }> {
    return {
      first_favorite: {
        name: 'Premier Favori',
        description: 'Ajoutez votre première attraction aux favoris',
        icon: '❤️',
      },
      reviewer: {
        name: 'Critique',
        description: 'Postez votre première review',
        icon: '⭐',
      },
      explorer: {
        name: 'Explorateur',
        description: 'Visitez 10 attractions',
        icon: '🗺️',
      },
      audio_lover: {
        name: 'Mélomane',
        description: 'Écoutez 50 audio guides',
        icon: '🎧',
      },
      master: {
        name: 'Maître Explorateur',
        description: 'Visitez 100 attractions',
        icon: '🏆',
      },
      tour_guide: {
        name: 'Guide Touristique',
        description: 'Complétez 5 circuits touristiques',
        icon: '🚶',
      },
      social: {
        name: 'Social',
        description: 'Postez 10 reviews',
        icon: '💬',
      },
      dedicated: {
        name: 'Dévoué',
        description: 'Écoutez plus de 10 heures d\'audio guides',
        icon: '⏱️',
      },
    };
  }

  /**
   * Vérifier et attribuer automatiquement les badges
   */
  async checkAndAwardBadges(): Promise<string[]> {
    try {
      const stats = await this.getUserStats();
      const newBadges: string[] = [];

      // Premier favori
      if (stats.favoriteCount >= 1 && !this.hasBadge('first_favorite')) {
        await this.addBadge('first_favorite');
        newBadges.push('first_favorite');
      }

      // Reviewer
      if (stats.reviewCount >= 1 && !this.hasBadge('reviewer')) {
        await this.addBadge('reviewer');
        newBadges.push('reviewer');
      }

      // Explorer
      if (stats.attractionsVisited >= 10 && !this.hasBadge('explorer')) {
        await this.addBadge('explorer');
        newBadges.push('explorer');
      }

      // Audio lover
      if (stats.audioGuidesListened >= 50 && !this.hasBadge('audio_lover')) {
        await this.addBadge('audio_lover');
        newBadges.push('audio_lover');
      }

      // Master
      if (stats.attractionsVisited >= 100 && !this.hasBadge('master')) {
        await this.addBadge('master');
        newBadges.push('master');
      }

      // Tour guide
      if (stats.toursCompleted >= 5 && !this.hasBadge('tour_guide')) {
        await this.addBadge('tour_guide');
        newBadges.push('tour_guide');
      }

      // Social
      if (stats.reviewCount >= 10 && !this.hasBadge('social')) {
        await this.addBadge('social');
        newBadges.push('social');
      }

      // Dedicated (10 heures = 36000 secondes)
      if (stats.totalListeningTime >= 36000 && !this.hasBadge('dedicated')) {
        await this.addBadge('dedicated');
        newBadges.push('dedicated');
      }

      if (newBadges.length > 0) {
        console.log('[UserStatsService] New badges awarded:', newBadges);
      }

      return newBadges;
    } catch (error) {
      console.error('[UserStatsService] Error checking badges:', error);
      return [];
    }
  }
}

export const userStatsService = new UserStatsService();
