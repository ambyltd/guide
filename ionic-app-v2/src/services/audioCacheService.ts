/**
 * Service de cache audio avec IndexedDB
 * Phase 4 du Sprint 3
 * 
 * Fonctionnalités :
 * - Téléchargement audios en background
 * - Stockage IndexedDB (quota ~100 MB)
 * - Mode offline complet pour audios
 * - UI téléchargé vs streaming
 * - Progress bar download
 * - Gestion file d'attente avec priorité
 */

// Types
export interface AudioCacheEntry {
  id: string;
  url: string;
  blob: Blob;
  size: number;
  duration: number;
  downloadedAt: number;
  lastPlayedAt: number;
  attractionId: string;
  language: string;
  priority: 'high' | 'medium' | 'low';
}

export interface AudioDownloadProgress {
  audioId: string;
  url: string;
  loaded: number;
  total: number;
  percentage: number;
  speed: number; // bytes/sec
  timeRemaining: number; // seconds
}

export interface AudioCacheStats {
  totalAudios: number;
  totalSize: number;
  availableSpace: number;
  usedPercentage: number;
  downloadedCount: number;
  streamingCount: number;
}

export interface AudioDownloadQueue {
  audioId: string;
  url: string;
  priority: 'high' | 'medium' | 'low';
  attractionId: string;
  language: string;
}

// Configuration
const DB_NAME = 'audioguide_cache';
const DB_VERSION = 1;
const STORE_NAME = 'audios';
const MAX_CACHE_SIZE = 100 * 1024 * 1024; // 100 MB
const CHUNK_SIZE = 1024 * 1024; // 1 MB chunks for progress

class AudioCacheService {
  private db: IDBDatabase | null = null;
  private downloadQueue: AudioDownloadQueue[] = [];
  private isDownloading: boolean = false;
  private progressCallbacks: Map<string, (progress: AudioDownloadProgress) => void> = new Map();
  private abortControllers: Map<string, AbortController> = new Map();

  constructor() {
    this.initializeDB();
  }

  /**
   * Initialiser IndexedDB
   */
  private async initializeDB(): Promise<void> {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(DB_NAME, DB_VERSION);

      request.onerror = () => {
        console.error('❌ Error opening IndexedDB:', request.error);
        reject(request.error);
      };

      request.onsuccess = () => {
        this.db = request.result;
        console.log('✅ IndexedDB initialized');
        resolve();
      };

      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;

        // Créer object store si nécessaire
        if (!db.objectStoreNames.contains(STORE_NAME)) {
          const objectStore = db.createObjectStore(STORE_NAME, { keyPath: 'id' });
          
          // Créer index pour recherche rapide
          objectStore.createIndex('attractionId', 'attractionId', { unique: false });
          objectStore.createIndex('language', 'language', { unique: false });
          objectStore.createIndex('downloadedAt', 'downloadedAt', { unique: false });
          objectStore.createIndex('lastPlayedAt', 'lastPlayedAt', { unique: false });
          
          console.log('📦 Audio cache object store created');
        }
      };
    });
  }

  /**
   * Attendre que la DB soit initialisée
   */
  private async ensureDB(): Promise<IDBDatabase> {
    if (this.db) return this.db;
    
    await this.initializeDB();
    
    if (!this.db) {
      throw new Error('Failed to initialize IndexedDB');
    }
    
    return this.db;
  }

  /**
   * Télécharger un audio avec progress
   */
  async downloadAudio(
    audioId: string,
    url: string,
    attractionId: string,
    language: string,
    priority: 'high' | 'medium' | 'low' = 'medium',
    onProgress?: (progress: AudioDownloadProgress) => void
  ): Promise<boolean> {
    // Vérifier si déjà téléchargé
    const cached = await this.getAudio(audioId);
    if (cached) {
      console.log('✅ Audio already cached:', audioId);
      return true;
    }

    // Ajouter callback progress
    if (onProgress) {
      this.progressCallbacks.set(audioId, onProgress);
    }

    try {
      console.log(`📥 Downloading audio: ${audioId} (priority: ${priority})`);

      // Créer AbortController pour annulation
      const abortController = new AbortController();
      this.abortControllers.set(audioId, abortController);

      // Télécharger avec fetch
      const startTime = Date.now();
      const response = await fetch(url, { signal: abortController.signal });
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }

      const contentLength = parseInt(response.headers.get('content-length') || '0', 10);
      const reader = response.body?.getReader();
      if (!reader) {
        throw new Error('Cannot read response body');
      }

      // Lire avec progress
      const chunks: Uint8Array[] = [];
      let loaded = 0;
      let lastProgressTime = Date.now();
      let lastLoaded = 0;

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        chunks.push(value);
        loaded += value.length;

        // Calculer vitesse et temps restant
        const now = Date.now();
        const elapsed = (now - lastProgressTime) / 1000; // secondes
        const progress = loaded - lastLoaded;
        const speed = elapsed > 0 ? progress / elapsed : 0;
        const remaining = contentLength - loaded;
        const timeRemaining = speed > 0 ? remaining / speed : 0;

        // Callback progress toutes les 100ms
        if (now - lastProgressTime > 100 && onProgress) {
          onProgress({
            audioId,
            url,
            loaded,
            total: contentLength,
            percentage: (loaded / contentLength) * 100,
            speed,
            timeRemaining,
          });
          
          lastProgressTime = now;
          lastLoaded = loaded;
        }
      }

      // Créer Blob
      const blob = new Blob(chunks as BlobPart[], { type: 'audio/mpeg' });

      // Obtenir durée audio (estimation)
      const duration = await this.getAudioDuration(blob);

      // Sauvegarder dans IndexedDB
      const entry: AudioCacheEntry = {
        id: audioId,
        url,
        blob,
        size: blob.size,
        duration,
        downloadedAt: Date.now(),
        lastPlayedAt: 0,
        attractionId,
        language,
        priority,
      };

      await this.saveAudio(entry);

      console.log(`✅ Audio cached: ${audioId} (${(blob.size / 1024 / 1024).toFixed(2)} MB, ${duration.toFixed(1)}s)`);

      // Callback progress final
      if (onProgress) {
        onProgress({
          audioId,
          url,
          loaded: contentLength,
          total: contentLength,
          percentage: 100,
          speed: 0,
          timeRemaining: 0,
        });
      }

      return true;
    } catch (error) {
      if (error instanceof Error && error.name === 'AbortError') {
        console.log(`❌ Audio download cancelled: ${audioId}`);
      } else {
        console.error(`❌ Error downloading audio ${audioId}:`, error);
      }
      return false;
    } finally {
      this.abortControllers.delete(audioId);
      this.progressCallbacks.delete(audioId);
    }
  }

  /**
   * Obtenir la durée d'un audio depuis Blob
   */
  private async getAudioDuration(blob: Blob): Promise<number> {
    return new Promise((resolve) => {
      const audio = new Audio();
      const url = URL.createObjectURL(blob);

      audio.addEventListener('loadedmetadata', () => {
        URL.revokeObjectURL(url);
        resolve(audio.duration);
      });

      audio.addEventListener('error', () => {
        URL.revokeObjectURL(url);
        resolve(0); // Durée inconnue
      });

      audio.src = url;
    });
  }

  /**
   * Sauvegarder un audio dans IndexedDB
   */
  private async saveAudio(entry: AudioCacheEntry): Promise<void> {
    const db = await this.ensureDB();

    return new Promise((resolve, reject) => {
      const transaction = db.transaction([STORE_NAME], 'readwrite');
      const store = transaction.objectStore(STORE_NAME);
      const request = store.put(entry);

      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  /**
   * Récupérer un audio depuis IndexedDB
   */
  async getAudio(audioId: string): Promise<AudioCacheEntry | null> {
    const db = await this.ensureDB();

    return new Promise((resolve, reject) => {
      const transaction = db.transaction([STORE_NAME], 'readonly');
      const store = transaction.objectStore(STORE_NAME);
      const request = store.get(audioId);

      request.onsuccess = () => {
        const entry = request.result as AudioCacheEntry | undefined;
        if (entry) {
          // Mettre à jour lastPlayedAt
          entry.lastPlayedAt = Date.now();
          this.saveAudio(entry); // Async, pas besoin d'attendre
        }
        resolve(entry || null);
      };
      request.onerror = () => reject(request.error);
    });
  }

  /**
   * Obtenir l'URL pour lecture (cached ou streaming)
   */
  async getAudioUrl(audioId: string, originalUrl: string): Promise<string> {
    const cached = await this.getAudio(audioId);
    
    if (cached) {
      // Créer Object URL depuis Blob
      return URL.createObjectURL(cached.blob);
    }
    
    // Pas en cache, retourner URL streaming
    return originalUrl;
  }

  /**
   * Vérifier si un audio est téléchargé
   */
  async isDownloaded(audioId: string): Promise<boolean> {
    const cached = await this.getAudio(audioId);
    return cached !== null;
  }

  /**
   * Ajouter un audio à la file d'attente de téléchargement
   */
  addToQueue(queue: AudioDownloadQueue): void {
    // Vérifier si déjà dans la queue
    const exists = this.downloadQueue.some(item => item.audioId === queue.audioId);
    if (exists) {
      console.log('⏳ Audio already in download queue:', queue.audioId);
      return;
    }

    // Ajouter à la queue
    this.downloadQueue.push(queue);

    // Trier par priorité (high > medium > low)
    this.downloadQueue.sort((a, b) => {
      const priorityOrder = { high: 0, medium: 1, low: 2 };
      return priorityOrder[a.priority] - priorityOrder[b.priority];
    });

    console.log(`➕ Added to download queue: ${queue.audioId} (priority: ${queue.priority})`);

    // Démarrer le processus de téléchargement si pas déjà en cours
    if (!this.isDownloading) {
      this.processQueue();
    }
  }

  /**
   * Traiter la file d'attente de téléchargement
   */
  private async processQueue(): Promise<void> {
    if (this.downloadQueue.length === 0) {
      this.isDownloading = false;
      console.log('✅ Download queue empty');
      return;
    }

    this.isDownloading = true;

    // Prendre le premier élément
    const item = this.downloadQueue.shift();
    if (!item) return;

    console.log(`⏬ Processing download: ${item.audioId} (${this.downloadQueue.length} remaining)`);

    // Télécharger
    await this.downloadAudio(
      item.audioId,
      item.url,
      item.attractionId,
      item.language,
      item.priority
    );

    // Continuer avec le suivant
    setTimeout(() => this.processQueue(), 500); // 500ms entre chaque téléchargement
  }

  /**
   * Annuler un téléchargement en cours
   */
  cancelDownload(audioId: string): void {
    const controller = this.abortControllers.get(audioId);
    if (controller) {
      controller.abort();
      console.log(`❌ Cancelled download: ${audioId}`);
    }

    // Retirer de la queue
    this.downloadQueue = this.downloadQueue.filter(item => item.audioId !== audioId);
  }

  /**
   * Supprimer un audio du cache
   */
  async removeAudio(audioId: string): Promise<void> {
    const db = await this.ensureDB();

    return new Promise((resolve, reject) => {
      const transaction = db.transaction([STORE_NAME], 'readwrite');
      const store = transaction.objectStore(STORE_NAME);
      const request = store.delete(audioId);

      request.onsuccess = () => {
        console.log(`🗑️ Removed audio: ${audioId}`);
        resolve();
      };
      request.onerror = () => reject(request.error);
    });
  }

  /**
   * Vider complètement le cache audio
   */
  async clearCache(): Promise<void> {
    const db = await this.ensureDB();

    return new Promise((resolve, reject) => {
      const transaction = db.transaction([STORE_NAME], 'readwrite');
      const store = transaction.objectStore(STORE_NAME);
      const request = store.clear();

      request.onsuccess = () => {
        console.log('🗑️ Audio cache cleared');
        resolve();
      };
      request.onerror = () => reject(request.error);
    });
  }

  /**
   * Obtenir tous les audios en cache
   */
  async getAllAudios(): Promise<AudioCacheEntry[]> {
    const db = await this.ensureDB();

    return new Promise((resolve, reject) => {
      const transaction = db.transaction([STORE_NAME], 'readonly');
      const store = transaction.objectStore(STORE_NAME);
      const request = store.getAll();

      request.onsuccess = () => {
        resolve(request.result as AudioCacheEntry[]);
      };
      request.onerror = () => reject(request.error);
    });
  }

  /**
   * Obtenir les audios d'une attraction
   */
  async getAudiosByAttraction(attractionId: string): Promise<AudioCacheEntry[]> {
    const db = await this.ensureDB();

    return new Promise((resolve, reject) => {
      const transaction = db.transaction([STORE_NAME], 'readonly');
      const store = transaction.objectStore(STORE_NAME);
      const index = store.index('attractionId');
      const request = index.getAll(attractionId);

      request.onsuccess = () => {
        resolve(request.result as AudioCacheEntry[]);
      };
      request.onerror = () => reject(request.error);
    });
  }

  /**
   * Obtenir les statistiques du cache
   */
  async getStats(): Promise<AudioCacheStats> {
    const audios = await this.getAllAudios();
    
    let totalSize = 0;
    for (const audio of audios) {
      totalSize += audio.size;
    }

    // Estimation de l'espace disponible (quota IndexedDB)
    let availableSpace = MAX_CACHE_SIZE - totalSize;
    const usedPercentage = (totalSize / MAX_CACHE_SIZE) * 100;

    return {
      totalAudios: audios.length,
      totalSize,
      availableSpace,
      usedPercentage,
      downloadedCount: audios.length,
      streamingCount: 0, // TODO: compter depuis API
    };
  }

  /**
   * Nettoyer le cache (supprimer les moins joués)
   */
  async cleanupCache(): Promise<void> {
    console.log('🧹 Cleaning up audio cache...');

    const audios = await this.getAllAudios();
    
    // Trier par lastPlayedAt (plus vieux en premier)
    audios.sort((a, b) => a.lastPlayedAt - b.lastPlayedAt);

    // Supprimer jusqu'à atteindre 70% du quota
    const targetSize = MAX_CACHE_SIZE * 0.7;
    let currentSize = (await this.getStats()).totalSize;
    let cleaned = 0;

    for (const audio of audios) {
      if (currentSize <= targetSize) break;
      
      if (audio.priority !== 'high') {
        await this.removeAudio(audio.id);
        currentSize -= audio.size;
        cleaned++;
      }
    }

    console.log(`✅ Audio cache cleanup complete: ${cleaned} audios removed`);
  }

  /**
   * Formater taille en octets
   */
  formatBytes(bytes: number): string {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return `${(bytes / Math.pow(k, i)).toFixed(2)} ${sizes[i]}`;
  }

  /**
   * Formater durée en mm:ss
   */
  formatDuration(seconds: number): string {
    const minutes = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${minutes}:${secs.toString().padStart(2, '0')}`;
  }
}

// Singleton
export const audioCacheService = new AudioCacheService();

export default audioCacheService;
