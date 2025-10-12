/**
 * Service de synchronisation en arrière-plan
 * Phase 5 du Sprint 3
 * 
 * Fonctionnalités :
 * - Synchronisation automatique des favoris
 * - Upload reviews/ratings en différé
 * - Statistiques utilisateur offline
 * - Retry queue avec exponential backoff
 * - Détection automatique du retour online
 * 
 * INTÉGRATION PHASE 6:
 * - Utilise favoritesService pour sync favoris
 * - Utilise reviewsService pour sync reviews
 * - Utilise userStatsService pour sync stats
 */

import { Network } from '@capacitor/network';
import { favoritesService } from './favoritesService';
import { reviewsService } from './reviewsService';
import { userStatsService } from './userStatsService';

// Types
export interface SyncQueueItem {
  id: string;
  type: 'favorite' | 'unfavorite' | 'review' | 'rating' | 'stats';
  data: unknown;
  createdAt: number;
  attempts: number;
  lastAttempt: number;
  priority: 'high' | 'medium' | 'low';
}

export interface SyncResult {
  success: boolean;
  itemId: string;
  type: string;
  error?: string;
}

export interface SyncStats {
  totalPending: number;
  byType: Record<string, number>;
  oldestItem: number;
  failedAttempts: number;
}

// Configuration
const SYNC_QUEUE_KEY = 'backgroundSyncQueue';
const MAX_RETRY_ATTEMPTS = 5;
const INITIAL_RETRY_DELAY = 1000; // 1 seconde
const MAX_RETRY_DELAY = 60000; // 1 minute
const SYNC_INTERVAL = 30000; // 30 secondes

class BackgroundSyncService {
  private syncQueue: SyncQueueItem[] = [];
  private isSyncing: boolean = false;
  private isOnline: boolean = navigator.onLine;
  private syncInterval: NodeJS.Timeout | null = null;
  private networkListener: ((status: { connected: boolean }) => void) | null = null;

  constructor() {
    this.loadQueue();
    this.setupNetworkListener();
    this.startPeriodicSync();
  }

  /**
   * Charger la queue depuis localStorage
   */
  private loadQueue(): void {
    try {
      const queueStr = localStorage.getItem(SYNC_QUEUE_KEY);
      if (queueStr) {
        this.syncQueue = JSON.parse(queueStr);
        console.log(`📥 Loaded ${this.syncQueue.length} items from sync queue`);
      }
    } catch (error) {
      console.error('❌ Error loading sync queue:', error);
      this.syncQueue = [];
    }
  }

  /**
   * Sauvegarder la queue dans localStorage
   */
  private saveQueue(): void {
    try {
      localStorage.setItem(SYNC_QUEUE_KEY, JSON.stringify(this.syncQueue));
      console.log(`💾 Saved ${this.syncQueue.length} items to sync queue`);
    } catch (error) {
      console.error('❌ Error saving sync queue:', error);
    }
  }

  /**
   * Configurer l'écouteur réseau
   */
  private async setupNetworkListener(): Promise<void> {
    try {
      // Écouter les changements de statut réseau
      this.networkListener = async (status) => {
        const wasOnline = this.isOnline;
        this.isOnline = status.connected;

        console.log(`📡 Network status changed: ${this.isOnline ? 'ONLINE' : 'OFFLINE'}`);

        // Si retour online, synchroniser immédiatement
        if (!wasOnline && this.isOnline && this.syncQueue.length > 0) {
          console.log('🔄 Back online! Starting sync...');
          await this.sync();
        }
      };

      Network.addListener('networkStatusChange', this.networkListener);

      // Vérifier le statut initial
      const status = await Network.getStatus();
      this.isOnline = status.connected;
      console.log(`📡 Initial network status: ${this.isOnline ? 'ONLINE' : 'OFFLINE'}`);
    } catch (error) {
      console.error('❌ Error setting up network listener:', error);
      // Fallback sur navigator.onLine
      window.addEventListener('online', () => {
        this.isOnline = true;
        console.log('🔄 Back online! Starting sync...');
        this.sync();
      });
      window.addEventListener('offline', () => {
        this.isOnline = false;
        console.log('📡 Network offline');
      });
    }
  }

  /**
   * Démarrer la synchronisation périodique
   */
  private startPeriodicSync(): void {
    this.syncInterval = setInterval(() => {
      if (this.isOnline && this.syncQueue.length > 0 && !this.isSyncing) {
        console.log('⏰ Periodic sync triggered');
        this.sync();
      }
    }, SYNC_INTERVAL);
  }

  /**
   * Arrêter la synchronisation périodique
   */
  stopPeriodicSync(): void {
    if (this.syncInterval) {
      clearInterval(this.syncInterval);
      this.syncInterval = null;
    }
  }

  /**
   * Ajouter un favori à synchroniser
   */
  async addFavorite(attractionId: string, userId: string): Promise<void> {
    const item: SyncQueueItem = {
      id: `favorite_${attractionId}_${Date.now()}`,
      type: 'favorite',
      data: { attractionId, userId },
      createdAt: Date.now(),
      attempts: 0,
      lastAttempt: 0,
      priority: 'high',
    };

    this.syncQueue.push(item);
    this.saveQueue();
    
    console.log(`➕ Added favorite to sync queue: ${attractionId}`);

    // Synchroniser immédiatement si online
    if (this.isOnline) {
      await this.sync();
    }
  }

  /**
   * Retirer un favori à synchroniser
   */
  async removeFavorite(attractionId: string, userId: string): Promise<void> {
    const item: SyncQueueItem = {
      id: `unfavorite_${attractionId}_${Date.now()}`,
      type: 'unfavorite',
      data: { attractionId, userId },
      createdAt: Date.now(),
      attempts: 0,
      lastAttempt: 0,
      priority: 'high',
    };

    this.syncQueue.push(item);
    this.saveQueue();
    
    console.log(`➖ Added unfavorite to sync queue: ${attractionId}`);

    // Synchroniser immédiatement si online
    if (this.isOnline) {
      await this.sync();
    }
  }

  /**
   * Ajouter une review à synchroniser
   */
  async addReview(
    attractionId: string,
    userId: string,
    rating: number,
    comment: string
  ): Promise<void> {
    const item: SyncQueueItem = {
      id: `review_${attractionId}_${Date.now()}`,
      type: 'review',
      data: { attractionId, userId, rating, comment },
      createdAt: Date.now(),
      attempts: 0,
      lastAttempt: 0,
      priority: 'medium',
    };

    this.syncQueue.push(item);
    this.saveQueue();
    
    console.log(`💬 Added review to sync queue: ${attractionId}`);

    // Synchroniser immédiatement si online
    if (this.isOnline) {
      await this.sync();
    }
  }

  /**
   * Ajouter une note à synchroniser
   */
  async addRating(
    attractionId: string,
    userId: string,
    rating: number
  ): Promise<void> {
    const item: SyncQueueItem = {
      id: `rating_${attractionId}_${Date.now()}`,
      type: 'rating',
      data: { attractionId, userId, rating },
      createdAt: Date.now(),
      attempts: 0,
      lastAttempt: 0,
      priority: 'medium',
    };

    this.syncQueue.push(item);
    this.saveQueue();
    
    console.log(`⭐ Added rating to sync queue: ${attractionId}`);

    // Synchroniser immédiatement si online
    if (this.isOnline) {
      await this.sync();
    }
  }

  /**
   * Ajouter des statistiques utilisateur à synchroniser
   */
  async addStats(userId: string, stats: Record<string, unknown>): Promise<void> {
    const item: SyncQueueItem = {
      id: `stats_${userId}_${Date.now()}`,
      type: 'stats',
      data: { userId, ...stats },
      createdAt: Date.now(),
      attempts: 0,
      lastAttempt: 0,
      priority: 'low',
    };

    this.syncQueue.push(item);
    this.saveQueue();
    
    console.log(`📊 Added stats to sync queue: ${userId}`);

    // Synchroniser périodiquement (pas immédiatement)
  }

  /**
   * Synchroniser la queue
   */
  async sync(): Promise<SyncResult[]> {
    if (this.isSyncing) {
      console.log('⏳ Sync already in progress');
      return [];
    }

    if (!this.isOnline) {
      console.log('📡 Offline, skipping sync');
      return [];
    }

    if (this.syncQueue.length === 0) {
      console.log('✅ Sync queue empty');
      return [];
    }

    this.isSyncing = true;
    console.log(`🔄 Starting sync... (${this.syncQueue.length} items)`);

    const results: SyncResult[] = [];

    // Trier par priorité
    this.syncQueue.sort((a, b) => {
      const priorityOrder = { high: 0, medium: 1, low: 2 };
      return priorityOrder[a.priority] - priorityOrder[b.priority];
    });

    // Synchroniser chaque élément
    for (let i = this.syncQueue.length - 1; i >= 0; i--) {
      const item = this.syncQueue[i];

      // Vérifier si on doit réessayer (exponential backoff)
      const now = Date.now();
      const delay = this.getRetryDelay(item.attempts);
      if (item.lastAttempt > 0 && now - item.lastAttempt < delay) {
        console.log(`⏳ Skipping ${item.id}, retry delay not elapsed`);
        continue;
      }

      // Vérifier nombre de tentatives
      if (item.attempts >= MAX_RETRY_ATTEMPTS) {
        console.error(`❌ Max retry attempts reached for ${item.id}, removing from queue`);
        this.syncQueue.splice(i, 1);
        results.push({
          success: false,
          itemId: item.id,
          type: item.type,
          error: 'Max retry attempts reached',
        });
        continue;
      }

      // Synchroniser l'élément
      try {
        const success = await this.syncItem(item);
        
        if (success) {
          // Supprimer de la queue
          this.syncQueue.splice(i, 1);
          results.push({
            success: true,
            itemId: item.id,
            type: item.type,
          });
          console.log(`✅ Synced ${item.type}: ${item.id}`);
        } else {
          // Incrémenter tentatives
          item.attempts++;
          item.lastAttempt = now;
          results.push({
            success: false,
            itemId: item.id,
            type: item.type,
            error: 'Sync failed',
          });
          console.warn(`⚠️ Sync failed for ${item.id}, attempt ${item.attempts}/${MAX_RETRY_ATTEMPTS}`);
        }
      } catch (error) {
        item.attempts++;
        item.lastAttempt = now;
        results.push({
          success: false,
          itemId: item.id,
          type: item.type,
          error: error instanceof Error ? error.message : 'Unknown error',
        });
        console.error(`❌ Error syncing ${item.id}:`, error);
      }
    }

    // Sauvegarder la queue
    this.saveQueue();

    this.isSyncing = false;
    console.log(`✅ Sync complete: ${results.length} items processed`);

    return results;
  }

  /**
   * Synchroniser un élément spécifique
   */
  private async syncItem(item: SyncQueueItem): Promise<boolean> {
    try {
      switch (item.type) {
        case 'favorite':
          return await this.syncFavorite(item.data as { attractionId: string; userId: string });
        
        case 'unfavorite':
          return await this.syncUnfavorite(item.data as { attractionId: string; userId: string });
        
        case 'review':
          return await this.syncReview(item.data as { attractionId: string; userId: string; rating: number; comment: string });
        
        case 'rating':
          return await this.syncRating(item.data as { attractionId: string; userId: string; rating: number });
        
        case 'stats':
          return await this.syncStats(item.data as { userId: string; [key: string]: unknown });
        
        default:
          console.error(`❌ Unknown sync type: ${item.type}`);
          return false;
      }
    } catch (error) {
      console.error(`❌ Error syncing item ${item.id}:`, error);
      return false;
    }
  }

  /**
   * Synchroniser un favori
   * Phase 6: Utilise favoritesService.addFavorite()
   */
  private async syncFavorite(data: { attractionId: string; userId: string }): Promise<boolean> {
    try {
      await favoritesService.addFavorite(data.attractionId);
      console.log(`✅ Synced favorite via favoritesService: ${data.attractionId}`);
      return true;
    } catch (error) {
      console.error('❌ Error syncing favorite:', error);
      return false;
    }
  }

  /**
   * Synchroniser un unfavorite
   * Phase 6: Utilise favoritesService.removeFavorite()
   */
  private async syncUnfavorite(data: { attractionId: string; userId: string }): Promise<boolean> {
    try {
      await favoritesService.removeFavorite(data.attractionId);
      console.log(`✅ Synced unfavorite via favoritesService: ${data.attractionId}`);
      return true;
    } catch (error) {
      console.error('❌ Error syncing unfavorite:', error);
      return false;
    }
  }

  /**
   * Synchroniser une review
   * Phase 6: Utilise reviewsService.createReview()
   */
  private async syncReview(data: { attractionId: string; userId: string; rating: number; comment: string }): Promise<boolean> {
    try {
      await reviewsService.createReview({
        attractionId: data.attractionId,
        rating: data.rating,
        comment: data.comment,
        language: 'fr', // Default language
      });
      
      // Incrémenter reviewCount dans userStats
      await userStatsService.incrementStat('reviewCount', 1);
      
      console.log(`✅ Synced review via reviewsService: ${data.attractionId}`);
      return true;
    } catch (error) {
      console.error('❌ Error syncing review:', error);
      return false;
    }
  }

  /**
   * Synchroniser une note
   * Phase 6: Utilise reviewsService.createReview() (sans commentaire)
   * Note: Le backend ne semble pas avoir d'endpoint séparé pour ratings seuls,
   * on utilise createReview avec un commentaire vide ou minimal
   */
  private async syncRating(data: { attractionId: string; userId: string; rating: number }): Promise<boolean> {
    try {
      await reviewsService.createReview({
        attractionId: data.attractionId,
        rating: data.rating,
        comment: `Note: ${data.rating}/5`, // Commentaire minimal pour rating seul
        language: 'fr',
      });
      
      console.log(`✅ Synced rating via reviewsService: ${data.attractionId}`);
      return true;
    } catch (error) {
      console.error('❌ Error syncing rating:', error);
      return false;
    }
  }

  /**
   * Synchroniser les statistiques
   * Phase 6: Utilise userStatsService.updateUserStats() ou incrementStat()
   */
  private async syncStats(data: { userId: string; [key: string]: unknown }): Promise<boolean> {
    try {
      // Extraire les données de stats (sans userId)
      const { userId, ...statsData } = data;
      
      // Si c'est un increment (field + value)
      if ('field' in statsData && 'value' in statsData) {
        const field = statsData.field as string;
        const value = statsData.value as number;
        
        // Vérifier que le field est valide avant l'appel
        const validFields = ['attractionsVisited', 'audioGuidesListened', 'toursCompleted', 'totalListeningTime', 'favoriteCount', 'reviewCount'];
        if (validFields.includes(field)) {
          await userStatsService.incrementStat(field as any, value);
          console.log(`✅ Synced stats increment via userStatsService: ${field}`);
        } else {
          console.warn(`⚠️ Invalid stats field: ${field}`);
          return false;
        }
      } else {
        // Sinon mise à jour batch
        await userStatsService.updateUserStats(statsData);
        console.log(`✅ Synced stats update via userStatsService: ${userId}`);
      }
      
      return true;
    } catch (error) {
      console.error('❌ Error syncing stats:', error);
      return false;
    }
  }

  /**
   * Calculer le délai de retry (exponential backoff)
   */
  private getRetryDelay(attempts: number): number {
    const delay = INITIAL_RETRY_DELAY * Math.pow(2, attempts);
    return Math.min(delay, MAX_RETRY_DELAY);
  }

  /**
   * Obtenir les statistiques de la queue
   */
  getStats(): SyncStats {
    const byType: Record<string, number> = {};
    let oldestItem = Infinity;
    let failedAttempts = 0;

    for (const item of this.syncQueue) {
      // Compter par type
      byType[item.type] = (byType[item.type] || 0) + 1;

      // Plus vieux élément
      if (item.createdAt < oldestItem) {
        oldestItem = item.createdAt;
      }

      // Tentatives échouées
      if (item.attempts > 0) {
        failedAttempts++;
      }
    }

    return {
      totalPending: this.syncQueue.length,
      byType,
      oldestItem: oldestItem === Infinity ? 0 : oldestItem,
      failedAttempts,
    };
  }

  /**
   * Vider la queue
   */
  clearQueue(): void {
    this.syncQueue = [];
    this.saveQueue();
    console.log('🗑️ Sync queue cleared');
  }

  /**
   * Retirer un élément de la queue
   */
  removeItem(itemId: string): void {
    const index = this.syncQueue.findIndex(item => item.id === itemId);
    if (index !== -1) {
      this.syncQueue.splice(index, 1);
      this.saveQueue();
      console.log(`🗑️ Removed item from sync queue: ${itemId}`);
    }
  }

  /**
   * Obtenir la queue complète
   */
  getQueue(): SyncQueueItem[] {
    return [...this.syncQueue];
  }

  /**
   * Détruire le service (cleanup)
   */
  destroy(): void {
    this.stopPeriodicSync();
    if (this.networkListener) {
      Network.removeAllListeners();
    }
  }
}

// Singleton
export const backgroundSyncService = new BackgroundSyncService();

export default backgroundSyncService;
