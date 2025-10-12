/**
 * Service de modération des reviews
 * Sprint 4 - Phase 2
 * 
 * Fonctionnalités:
 * - Signalement de reviews (users)
 * - Modération admin (approve/reject)
 * - Récupération reviews flaggées
 * - Statistiques modération
 */

import { apiClient } from './apiClient';

export interface ReportReason {
  id: string;
  label: string;
  description: string;
  icon: string;
}

export interface ModerationStats {
  totalReviews: number;
  pendingReviews: number;
  approvedReviews: number;
  rejectedReviews: number;
  flaggedReviews: number;
  avgModerationTime: number; // en heures
}

export interface FlaggedReview {
  _id: string;
  attractionId: string;
  attractionName?: string;
  userId: string;
  userName: string;
  rating: number;
  comment: string;
  reportedBy: string[];
  reportReasons: string[];
  flagged: boolean;
  status: 'pending' | 'approved' | 'rejected';
  createdAt: string;
}

class ModerationService {
  /**
   * Raisons de signalement prédéfinies
   */
  getReportReasons(): ReportReason[] {
    return [
      {
        id: 'spam',
        label: 'Spam',
        description: 'Contenu publicitaire ou répétitif',
        icon: '🚫',
      },
      {
        id: 'inappropriate',
        label: 'Inapproprié',
        description: 'Langage offensant ou contenu choquant',
        icon: '⚠️',
      },
      {
        id: 'fake',
        label: 'Faux avis',
        description: 'Avis manifestement faux ou trompeur',
        icon: '🎭',
      },
      {
        id: 'irrelevant',
        label: 'Hors sujet',
        description: 'Avis non pertinent pour cette attraction',
        icon: '🔀',
      },
      {
        id: 'other',
        label: 'Autre',
        description: 'Autre raison à préciser',
        icon: '❓',
      },
    ];
  }

  /**
   * Signaler une review (utilisateur)
   */
  async reportReview(
    reviewId: string,
    userId: string,
    reason: string
  ): Promise<{ success: boolean; reportCount: number; flagged: boolean }> {
    try {
      const response = await apiClient.patch<{
        success: boolean;
        reportCount: number;
        flagged: boolean;
      }>(`/reviews/${reviewId}/report`, {
        userId,
        reason,
      });

      if (response.data.success) {
        console.log(`✅ Review ${reviewId} signalée: ${reason}`);
        console.log(`  reportCount: ${response.data.reportCount}`);
        console.log(`  flagged: ${response.data.flagged}`);
        
        return {
          success: true,
          reportCount: response.data.reportCount,
          flagged: response.data.flagged,
        };
      }

      throw new Error('Échec signalement review');
    } catch (error) {
      console.error('[ModerationService] Error reporting review:', error);
      throw error;
    }
  }

  /**
   * Modérer une review (admin)
   */
  async moderateReview(
    reviewId: string,
    status: 'approved' | 'rejected',
    moderatorId: string,
    moderationNote?: string
  ): Promise<FlaggedReview> {
    try {
      const response = await apiClient.patch<{
        success: boolean;
        data: FlaggedReview;
      }>(`/reviews/${reviewId}/moderate`, {
        status,
        moderatorId,
        moderationNote,
      });

      if (response.data.success) {
        console.log(`✅ Review ${reviewId} modérée: ${status}`);
        return response.data.data;
      }

      throw new Error('Échec modération review');
    } catch (error) {
      console.error('[ModerationService] Error moderating review:', error);
      throw error;
    }
  }

  /**
   * Récupérer les reviews en attente de modération
   */
  async getPendingReviews(): Promise<FlaggedReview[]> {
    try {
      const response = await apiClient.get<{
        success: boolean;
        data: FlaggedReview[];
      }>('/reviews/pending');

      if (response.data.success) {
        return response.data.data;
      }

      throw new Error('Échec récupération reviews en attente');
    } catch (error) {
      console.error('[ModerationService] Error fetching pending reviews:', error);
      // Fallback: retourner array vide
      return [];
    }
  }

  /**
   * Récupérer les statistiques de modération (admin)
   */
  async getModerationStats(): Promise<ModerationStats> {
    try {
      const response = await apiClient.get<{
        success: boolean;
        data: ModerationStats;
      }>('/reviews/moderation/stats');

      if (response.data.success) {
        return response.data.data;
      }

      throw new Error('Échec récupération stats modération');
    } catch (error) {
      console.error('[ModerationService] Error fetching moderation stats:', error);
      // Fallback: retourner stats par défaut
      return {
        totalReviews: 0,
        pendingReviews: 0,
        approvedReviews: 0,
        rejectedReviews: 0,
        flaggedReviews: 0,
        avgModerationTime: 0,
      };
    }
  }

  /**
   * Vérifier si un utilisateur a déjà signalé une review
   */
  hasUserReported(review: Partial<FlaggedReview>, userId: string): boolean {
    if (!review.reportedBy || !Array.isArray(review.reportedBy)) {
      return false;
    }
    return review.reportedBy.includes(userId);
  }

  /**
   * Obtenir le badge de statut d'une review
   */
  getStatusBadge(review: Partial<FlaggedReview>): { text: string; color: string; icon: string } | null {
    if (review.flagged) {
      return {
        text: 'Signalé',
        color: 'warning',
        icon: '⚠️',
      };
    }

    if (review.status === 'approved') {
      return {
        text: 'Approuvé',
        color: 'success',
        icon: '✅',
      };
    }

    if (review.status === 'rejected') {
      return {
        text: 'Rejeté',
        color: 'danger',
        icon: '❌',
      };
    }

    return null;
  }

  /**
   * Formater la date de modération
   */
  formatModerationDate(date: string | Date): string {
    const d = new Date(date);
    const now = new Date();
    const diffMs = now.getTime() - d.getTime();
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffHours / 24);

    if (diffHours < 1) {
      return 'Il y a moins d\'une heure';
    } else if (diffHours < 24) {
      return `Il y a ${diffHours}h`;
    } else if (diffDays === 1) {
      return 'Hier';
    } else if (diffDays < 7) {
      return `Il y a ${diffDays} jours`;
    } else {
      return d.toLocaleDateString('fr-FR', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
      });
    }
  }
}

export const moderationService = new ModerationService();
