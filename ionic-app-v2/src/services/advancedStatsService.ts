/**
 * Service pour les statistiques utilisateur avancées
 * Sprint 4 - Phase 5
 * 
 * Fonctionnalités:
 * - Leaderboard (classements)
 * - Tendances temporelles (7j, 30j)
 * - Comparaison avec pairs
 * - Analytics détaillés
 * - Graphiques de progression
 */

import { apiClient } from './apiClient';
import { userStatsService, type UserStats } from './userStatsService';

export interface LeaderboardEntry {
  rank: number;
  userId: string;
  userName: string;
  userAvatar?: string;
  score: number;
  attractionsVisited: number;
  audioGuidesListened: number;
  toursCompleted?: number;
  reviewCount: number;
  badges: string[];
}

export interface LeaderboardResponse {
  count: number;
  sortBy: string;
  timeframe: '7d' | '30d' | 'all';
  data: LeaderboardEntry[];
}

export interface TrendData {
  date: string;
  value: number;
}

export interface UserTrends {
  attractionsVisited: TrendData[];
  audioGuidesListened: TrendData[];
  reviewCount: TrendData[];
  totalListeningTime: TrendData[];
}

export interface ComparisonData {
  user: {
    userId: string;
    userName: string;
    stats: UserStats;
  };
  peers: {
    average: Partial<UserStats>;
    percentile: number; // 0-100
    rank: number;
    total: number;
  };
}

export interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: string;
  category: 'exploration' | 'learning' | 'social' | 'master';
  tier: 'bronze' | 'silver' | 'gold' | 'platinum';
  requirement: {
    field: string;
    threshold: number;
  };
  unlockedAt?: string;
  progress: number; // 0-100
}

export interface DashboardAnalytics {
  overview: {
    totalUsers: number;
    totalAttractions: number;
    totalReviews: number;
    totalShares: number;
  };
  topAttractions: Array<{
    attractionId: string;
    name: string;
    visits: number;
    rating: number;
    reviewCount: number;
  }>;
  topUsers: LeaderboardEntry[];
  recentActivity: Array<{
    userId: string;
    userName: string;
    action: 'visit' | 'review' | 'share' | 'favorite';
    attractionId?: string;
    attractionName?: string;
    timestamp: string;
  }>;
}

class AdvancedStatsService {
  private userId: string | null = null;

  /**
   * Initialiser le service
   */
  initialize(userId: string) {
    this.userId = userId;
    console.log('[AdvancedStatsService] Initialized for user:', userId);
  }

  /**
   * Obtenir le leaderboard global
   */
  async getLeaderboard(
    sortBy: 'attractionsVisited' | 'audioGuidesListened' | 'reviewCount' | 'totalListeningTime' = 'attractionsVisited',
    limit: number = 20,
    timeframe: '7d' | '30d' | 'all' = 'all'
  ): Promise<LeaderboardResponse> {
    try {
      const response = await apiClient.get<{
        success: boolean;
        data: LeaderboardEntry[];
      }>('/users/leaderboard', {
        params: { sortBy, limit, timeframe },
      });

      if (response.data.success) {
        // Ajouter les rangs
        const data = response.data.data.map((entry: LeaderboardEntry, index: number) => ({
          ...entry,
          rank: index + 1,
          score: this.calculateScore(entry),
        }));

        return {
          count: data.length,
          sortBy,
          timeframe,
          data,
        };
      }

      throw new Error('Failed to fetch leaderboard');
    } catch (error) {
      console.error('[AdvancedStatsService] Error fetching leaderboard:', error);
      throw error;
    }
  }

  /**
   * Obtenir les tendances de l'utilisateur
   */
  async getUserTrends(timeframe: '7d' | '30d' = '30d'): Promise<UserTrends> {
    if (!this.userId) {
      throw new Error('User not initialized');
    }

    try {
      const response = await apiClient.get<{
        success: boolean;
        data: UserTrends;
      }>(`/api/analytics/users/${this.userId}/trends`, {
        timeframe,
      });

      if (response.data.success) {
        return response.data.data;
      }

      throw new Error('Failed to fetch trends');
    } catch (_error) {
      console.warn('[AdvancedStatsService] Using mock trends data (backend endpoint not implemented)');
      // Retourner des données mockées réalistes
      const days = timeframe === '7d' ? 7 : 30;
      const today = new Date();
      
      return {
        attractionsVisited: Array.from({ length: days }, (_, i) => ({
          date: new Date(today.getTime() - i * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
          value: Math.floor(Math.random() * 3),
        })).reverse(),
        audioGuidesListened: Array.from({ length: days }, (_, i) => ({
          date: new Date(today.getTime() - i * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
          value: Math.floor(Math.random() * 5),
        })).reverse(),
        reviewCount: Array.from({ length: days }, (_, i) => ({
          date: new Date(today.getTime() - i * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
          value: Math.random() > 0.7 ? 1 : 0,
        })).reverse(),
        totalListeningTime: Array.from({ length: days }, (_, i) => ({
          date: new Date(today.getTime() - i * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
          value: Math.floor(Math.random() * 120),
        })).reverse(),
      };
    }
  }

  /**
   * Comparer avec les pairs
   */
  async compareWithPeers(): Promise<ComparisonData> {
    if (!this.userId) {
      throw new Error('User not initialized');
    }

    try {
      const response = await apiClient.get<{
        success: boolean;
        data: ComparisonData;
      }>(`/api/analytics/users/${this.userId}/compare`);

      if (response.data.success) {
        return response.data.data;
      }

      throw new Error('Failed to compare with peers');
    } catch (_error) {
      console.warn('[AdvancedStatsService] Using mock comparison data (backend endpoint not implemented)');
      // Retourner des données mockées réalistes
      const stats = await userStatsService.getUserStats();
      
      return {
        user: {
          userId: this.userId!,
          userName: 'Current User',
          stats,
        },
        peers: {
          average: {
            attractionsVisited: Math.floor((stats.attractionsVisited || 0) * 0.6),
            audioGuidesListened: Math.floor((stats.audioGuidesListened || 0) * 0.7),
            favoriteCount: Math.floor((stats.favoriteCount || 0) * 0.5),
            totalListeningTime: Math.floor((stats.totalListeningTime || 0) * 0.65),
          },
          percentile: Math.floor(Math.random() * 30) + 60, // Top 60-90%
          rank: Math.floor(Math.random() * 50) + 1, // Rang aléatoire 1-50
          total: 150, // Mock: 150 utilisateurs
        },
      };
    }
  }

  /**
   * Obtenir tous les achievements disponibles avec progression
   */
  async getAchievements(): Promise<Achievement[]> {
    if (!this.userId) {
      throw new Error('User not initialized');
    }

    try {
      // Récupérer les stats de l'utilisateur
      const stats = await userStatsService.getUserStats();

      // Définir les achievements
      const achievements: Achievement[] = [
        // EXPLORATION
        {
          id: 'explorer_bronze',
          name: 'Explorateur Bronze',
          description: 'Visitez 5 attractions',
          icon: '🥉',
          category: 'exploration',
          tier: 'bronze',
          requirement: { field: 'attractionsVisited', threshold: 5 },
          progress: Math.min(100, (stats.attractionsVisited / 5) * 100),
        },
        {
          id: 'explorer_silver',
          name: 'Explorateur Argent',
          description: 'Visitez 20 attractions',
          icon: '🥈',
          category: 'exploration',
          tier: 'silver',
          requirement: { field: 'attractionsVisited', threshold: 20 },
          progress: Math.min(100, (stats.attractionsVisited / 20) * 100),
        },
        {
          id: 'explorer_gold',
          name: 'Explorateur Or',
          description: 'Visitez 50 attractions',
          icon: '🥇',
          category: 'exploration',
          tier: 'gold',
          requirement: { field: 'attractionsVisited', threshold: 50 },
          progress: Math.min(100, (stats.attractionsVisited / 50) * 100),
        },
        {
          id: 'explorer_platinum',
          name: 'Maître Explorateur',
          description: 'Visitez 100 attractions',
          icon: '💎',
          category: 'exploration',
          tier: 'platinum',
          requirement: { field: 'attractionsVisited', threshold: 100 },
          progress: Math.min(100, (stats.attractionsVisited / 100) * 100),
        },
        // LEARNING
        {
          id: 'learner_bronze',
          name: 'Apprenant Bronze',
          description: 'Écoutez 10 audioguides',
          icon: '🎧',
          category: 'learning',
          tier: 'bronze',
          requirement: { field: 'audioGuidesListened', threshold: 10 },
          progress: Math.min(100, (stats.audioGuidesListened / 10) * 100),
        },
        {
          id: 'learner_silver',
          name: 'Apprenant Argent',
          description: 'Écoutez 50 audioguides',
          icon: '🎓',
          category: 'learning',
          tier: 'silver',
          requirement: { field: 'audioGuidesListened', threshold: 50 },
          progress: Math.min(100, (stats.audioGuidesListened / 50) * 100),
        },
        {
          id: 'learner_gold',
          name: 'Érudit',
          description: 'Écoutez 100 audioguides',
          icon: '📚',
          category: 'learning',
          tier: 'gold',
          requirement: { field: 'audioGuidesListened', threshold: 100 },
          progress: Math.min(100, (stats.audioGuidesListened / 100) * 100),
        },
        // SOCIAL
        {
          id: 'critic_bronze',
          name: 'Critique Bronze',
          description: 'Publiez 5 avis',
          icon: '✍️',
          category: 'social',
          tier: 'bronze',
          requirement: { field: 'reviewCount', threshold: 5 },
          progress: Math.min(100, (stats.reviewCount / 5) * 100),
        },
        {
          id: 'critic_silver',
          name: 'Critique Argent',
          description: 'Publiez 20 avis',
          icon: '📝',
          category: 'social',
          tier: 'silver',
          requirement: { field: 'reviewCount', threshold: 20 },
          progress: Math.min(100, (stats.reviewCount / 20) * 100),
        },
        {
          id: 'critic_gold',
          name: 'Critique Expert',
          description: 'Publiez 50 avis',
          icon: '🏆',
          category: 'social',
          tier: 'gold',
          requirement: { field: 'reviewCount', threshold: 50 },
          progress: Math.min(100, (stats.reviewCount / 50) * 100),
        },
        // MASTER
        {
          id: 'completionist',
          name: 'Complétionniste',
          description: 'Terminez 10 circuits',
          icon: '🗺️',
          category: 'master',
          tier: 'gold',
          requirement: { field: 'toursCompleted', threshold: 10 },
          progress: Math.min(100, (stats.toursCompleted / 10) * 100),
        },
        {
          id: 'time_master',
          name: 'Maître du Temps',
          description: 'Cumulez 10 heures d\'écoute',
          icon: '⏰',
          category: 'master',
          tier: 'gold',
          requirement: { field: 'totalListeningTime', threshold: 36000 }, // 10 heures en secondes
          progress: Math.min(100, (stats.totalListeningTime / 36000) * 100),
        },
      ];

      // Marquer les achievements débloqués
      achievements.forEach(achievement => {
        const field = achievement.requirement.field as keyof typeof stats;
        const fieldValue = (typeof stats[field] === 'number' ? stats[field] : 0) as number;
        if (fieldValue >= achievement.requirement.threshold) {
          achievement.unlockedAt = stats.updatedAt;
        }
      });

      return achievements;
    } catch (error) {
      console.error('[AdvancedStatsService] Error fetching achievements:', error);
      throw error;
    }
  }

  /**
   * Obtenir le dashboard analytics (admin)
   */
  async getDashboardAnalytics(): Promise<DashboardAnalytics> {
    try {
      const response = await apiClient.get<{
        success: boolean;
        data: DashboardAnalytics;
      }>('/analytics/dashboard');

      if (response.data.success) {
        return response.data.data;
      }

      throw new Error('Failed to fetch dashboard analytics');
    } catch (error) {
      console.error('[AdvancedStatsService] Error fetching dashboard analytics:', error);
      throw error;
    }
  }

  /**
   * Tracker une action utilisateur pour analytics
   */
  async trackAction(
    action: 'visit' | 'review' | 'share' | 'favorite',
    attractionId?: string
  ): Promise<void> {
    if (!this.userId) return;

    try {
      await apiClient.post('/analytics/track', {
        userId: this.userId,
        action,
        attractionId,
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      console.error('[AdvancedStatsService] Error tracking action:', error);
      // Non-bloquant
    }
  }

  /**
   * Calculer un score global basé sur toutes les métriques
   */
  private calculateScore(stats: Partial<LeaderboardEntry>): number {
    const weights = {
      attractionsVisited: 10,
      audioGuidesListened: 5,
      toursCompleted: 20,
      reviewCount: 15,
      badges: 25,
    };

    return (
      (stats.attractionsVisited || 0) * weights.attractionsVisited +
      (stats.audioGuidesListened || 0) * weights.audioGuidesListened +
      (stats.toursCompleted || 0) * weights.toursCompleted +
      (stats.reviewCount || 0) * weights.reviewCount +
      (stats.badges?.length || 0) * weights.badges
    );
  }



  /**
   * Formater un nombre pour affichage (1000 → 1k)
   */
  formatNumber(num: number): string {
    if (num >= 1000000) {
      return (num / 1000000).toFixed(1) + 'M';
    }
    if (num >= 1000) {
      return (num / 1000).toFixed(1) + 'k';
    }
    return num.toString();
  }

  /**
   * Obtenir l'emoji de rang
   */
  getRankEmoji(rank: number): string {
    if (rank === 1) return '🥇';
    if (rank === 2) return '🥈';
    if (rank === 3) return '🥉';
    if (rank <= 10) return '🏅';
    if (rank <= 50) return '⭐';
    return '👤';
  }

  /**
   * Obtenir la couleur du tier
   */
  getTierColor(tier: 'bronze' | 'silver' | 'gold' | 'platinum'): string {
    const colors = {
      bronze: '#CD7F32',
      silver: '#C0C0C0',
      gold: '#FFD700',
      platinum: '#E5E4E2',
    };
    return colors[tier];
  }
}

export const advancedStatsService = new AdvancedStatsService();
