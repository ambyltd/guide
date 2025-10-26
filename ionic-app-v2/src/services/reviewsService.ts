/**
 * Service pour gérer les reviews et ratings
 * Intégration avec backend API /api/reviews
 */

import { apiClient } from './apiClient';

export interface Review {
  _id: string;
  userId: string;
  userName: string;
  userAvatar?: string;
  attractionId: string;
  rating: number; // 1-5
  comment: string;
  language: 'fr' | 'en';
  helpful: number;
  reported: number;
  status: 'pending' | 'approved' | 'rejected';
  moderationNote?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateReviewData {
  attractionId: string;
  rating: number;
  comment: string;
  language?: 'fr' | 'en';
}

export interface ReviewsListResponse {
  count: number;
  total: number;
  page: number;
  pages: number;
  data: Review[];
}

class ReviewsService {
  private userId: string | null = null;
  private userName: string | null = null;
  private userAvatar: string | null = null;

  /**
   * Initialiser le service avec les données utilisateur
   */
  initialize(userId: string, userName: string = 'User', userAvatar?: string) {
    this.userId = userId;
    this.userName = userName;
    this.userAvatar = userAvatar || null;
    console.log('[ReviewsService] Initialized for user:', userId);
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
   * Créer une review
   */
  async createReview(data: CreateReviewData): Promise<Review> {
    try {
      console.log('[ReviewsService] Creating review for attraction:', data.attractionId);

      // Validation
      if (data.rating < 1 || data.rating > 5) {
        throw new Error('Le rating doit être entre 1 et 5');
      }

      if (data.comment.length < 10) {
        throw new Error('Le commentaire doit contenir au moins 10 caractères');
      }

      if (data.comment.length > 1000) {
        throw new Error('Le commentaire ne peut pas dépasser 1000 caractères');
      }

      const payload = {
        itemId: data.attractionId,
        itemType: 'Attraction',
        userId: this.getUserId(),
        userName: this.userName || 'User',
        userAvatar: this.userAvatar,
        rating: data.rating,
        comment: data.comment,
        language: data.language || 'fr',
      };

      console.log('[ReviewsService] Payload envoyé:', payload);

      const response = await apiClient.post<Review>('/api/reviews', payload);

      if (response.success) {
        console.log('[ReviewsService] Review created successfully');
        return response.data;
      } else {
        throw new Error(response.message || 'Erreur lors de la création de la review');
      }
    } catch (error) {
      console.error('[ReviewsService] Error creating review:', error);
      throw error;
    }
  }

  /**
   * Récupérer les reviews d'une attraction
   */
  async getAttractionReviews(
    attractionId: string,
    page: number = 1,
    limit: number = 10,
    status: 'pending' | 'approved' | 'rejected' = 'approved'
  ): Promise<ReviewsListResponse> {
    try {
      console.log('[ReviewsService] Fetching reviews for attraction:', attractionId);

      const response = await apiClient.get<ReviewsListResponse>('/api/reviews', {
        attractionId,
        status,
        page,
        limit,
      });

      if (response.success) {
        console.log('[ReviewsService] Reviews fetched:', response.data.count);
        return response.data;
      } else {
        throw new Error(response.message || 'Erreur lors de la récupération des reviews');
      }
    } catch (error) {
      console.error('[ReviewsService] Error fetching reviews:', error);
      throw error;
    }
  }

  /**
   * Récupérer les reviews d'un utilisateur
   */
  async getUserReviews(
    page: number = 1,
    limit: number = 10
  ): Promise<ReviewsListResponse> {
    try {
      console.log('[ReviewsService] Fetching user reviews');

      const response = await apiClient.get<ReviewsListResponse>('/api/reviews', {
        userId: this.getUserId(),
        page,
        limit,
      });

      if (response.success) {
        console.log('[ReviewsService] User reviews fetched:', response.data.count);
        return response.data;
      } else {
        throw new Error(response.message || 'Erreur lors de la récupération des reviews');
      }
    } catch (error) {
      console.error('[ReviewsService] Error fetching user reviews:', error);
      throw error;
    }
  }

  /**
   * Marquer une review comme utile
   */
  async markReviewHelpful(reviewId: string): Promise<Review> {
    try {
      console.log('[ReviewsService] Marking review as helpful:', reviewId);

      const response = await apiClient.patch<Review>(`/api/reviews/${reviewId}/helpful`);

      if (response.success) {
        console.log('[ReviewsService] Review marked as helpful');
        return response.data;
      } else {
        throw new Error(response.message || 'Erreur lors du marquage de la review');
      }
    } catch (error) {
      console.error('[ReviewsService] Error marking review helpful:', error);
      throw error;
    }
  }

  /**
   * Signaler une review
   */
  async reportReview(reviewId: string): Promise<Review> {
    try {
      console.log('[ReviewsService] Reporting review:', reviewId);

      const response = await apiClient.patch<Review>(`/api/reviews/${reviewId}/report`);

      if (response.success) {
        console.log('[ReviewsService] Review reported');
        return response.data;
      } else {
        throw new Error(response.message || 'Erreur lors du signalement de la review');
      }
    } catch (error) {
      console.error('[ReviewsService] Error reporting review:', error);
      throw error;
    }
  }

  /**
   * Calculer le rating moyen d'une attraction à partir des reviews
   */
  calculateAverageRating(reviews: Review[]): number {
    if (reviews.length === 0) return 0;

    const total = reviews.reduce((sum, review) => sum + review.rating, 0);
    return Math.round((total / reviews.length) * 10) / 10; // Arrondi à 1 décimale
  }

  /**
   * Obtenir la distribution des ratings (1-5 étoiles)
   */
  getRatingDistribution(reviews: Review[]): Record<number, number> {
    const distribution: Record<number, number> = {
      1: 0,
      2: 0,
      3: 0,
      4: 0,
      5: 0,
    };

    reviews.forEach((review) => {
      if (review.rating >= 1 && review.rating <= 5) {
        distribution[review.rating]++;
      }
    });

    return distribution;
  }
}

export const reviewsService = new ReviewsService();
