/**
 * Service de stockage expert pour l'application Ionic
 * Gestion unifiée du stockage local et cloud avec synchronisation
 */

import { Storage } from '@ionic/storage-angular';
import { ref, uploadBytes, getDownloadURL, deleteObject, type StorageReference } from 'firebase/storage';
import { storage } from '@/config/firebase';

// ===== INTERFACES =====
interface StorageItem<T = unknown> {
  readonly key: string;
  readonly value: T;
  readonly timestamp: number;
  readonly expiresAt?: number;
  readonly metadata?: StorageMetadata;
}

interface StorageMetadata {
  readonly version: string;
  readonly userId?: string;
  readonly tags?: readonly string[];
  readonly encrypted?: boolean;
}

interface UploadProgress {
  readonly bytesTransferred: number;
  readonly totalBytes: number;
  readonly progress: number;
  readonly state: 'running' | 'paused' | 'success' | 'error';
}

interface CloudUploadOptions {
  readonly folder?: string;
  readonly fileName?: string;
  readonly metadata?: Record<string, string>;
  readonly onProgress?: (progress: UploadProgress) => void;
}

// ===== CONSTANTES =====
const STORAGE_PREFIX = 'civ_audio_guide_';
// const MAX_LOCAL_STORAGE_SIZE = 50 * 1024 * 1024; // 50MB - Réservé pour usage futur

// ===== ERREURS =====
class StorageError extends Error {
  constructor(
    message: string,
    public readonly code: string,
    public readonly originalError?: Error
  ) {
    super(message);
    this.name = 'StorageError';
  }
}

// ===== SERVICE DE STOCKAGE =====
class StorageService {
  private localStorage: Storage | null = null;
  private storageInitialized = false;
  private readonly storageCache = new Map<string, StorageItem>();

  // ===== INITIALISATION =====
  public async initialize(): Promise<void> {
    if (this.storageInitialized) return;

    try {
      this.localStorage = new Storage();
      await this.localStorage.create();
      
      // Charger les éléments en cache
      await this.loadCache();
      
      // Nettoyer les éléments expirés
      await this.cleanupExpiredItems();
      
      this.storageInitialized = true;
    } catch (error) {
      throw new StorageError(
        'Erreur lors de l\'initialisation du stockage',
        'INIT_ERROR',
        error as Error
      );
    }
  }

  private async loadCache(): Promise<void> {
    if (!this.localStorage) return;

    try {
      const keys = await this.localStorage.keys();
      const cacheKeys = keys.filter(key => key.startsWith(STORAGE_PREFIX));

      for (const key of cacheKeys) {
        const item = await this.localStorage.get(key);
        if (item && this.isValidStorageItem(item)) {
          this.storageCache.set(key, item);
        }
      }
    } catch (error) {
      console.warn('Erreur lors du chargement du cache:', error);
    }
  }

  private isValidStorageItem(item: unknown): item is StorageItem {
    return (
      typeof item === 'object' &&
      item !== null &&
      'key' in item &&
      'value' in item &&
      'timestamp' in item &&
      typeof (item as StorageItem).key === 'string' &&
      typeof (item as StorageItem).timestamp === 'number'
    );
  }

  private async cleanupExpiredItems(): Promise<void> {
    const now = Date.now();
    const expiredKeys: string[] = [];

    this.storageCache.forEach((item, key) => {
      if (item.expiresAt && item.expiresAt < now) {
        expiredKeys.push(key);
      }
    });

    for (const key of expiredKeys) {
      await this.remove(key);
    }
  }

  // ===== STOCKAGE LOCAL =====
  public async set<T>(
    key: string,
    value: T,
    options: {
      readonly expiresAt?: number;
      readonly metadata?: StorageMetadata;
      readonly encrypt?: boolean;
    } = {}
  ): Promise<void> {
    if (!this.storageInitialized) {
      await this.initialize();
    }

    if (!this.localStorage) {
      throw new StorageError('Stockage local non initialisé', 'NOT_INITIALIZED');
    }

    try {
      const storageKey = `${STORAGE_PREFIX}${key}`;
      const item: StorageItem<T> = {
        key: storageKey,
        value: options.encrypt ? this.encrypt(value) : value,
        timestamp: Date.now(),
        ...(options.expiresAt && { expiresAt: options.expiresAt }),
        ...(options.metadata && { metadata: options.metadata }),
      };

      await this.localStorage.set(storageKey, item);
      this.storageCache.set(storageKey, item);
    } catch (error) {
      throw new StorageError(
        `Erreur lors de la sauvegarde de la clé: ${key}`,
        'SET_ERROR',
        error as Error
      );
    }
  }

  public async get<T>(key: string): Promise<T | null> {
    if (!this.storageInitialized) {
      await this.initialize();
    }

    try {
      const storageKey = `${STORAGE_PREFIX}${key}`;
      
      // Vérifier le cache d'abord
      const cachedItem = this.storageCache.get(storageKey);
      if (cachedItem) {
        // Vérifier l'expiration
        if (cachedItem.expiresAt && cachedItem.expiresAt < Date.now()) {
          await this.remove(key);
          return null;
        }
        return this.decrypt(cachedItem.value as T, cachedItem.metadata?.encrypted);
      }

      // Récupérer depuis le stockage local
      if (!this.localStorage) return null;
      
      const item = await this.localStorage.get(storageKey);
      if (!item || !this.isValidStorageItem(item)) {
        return null;
      }

      // Vérifier l'expiration
      if (item.expiresAt && item.expiresAt < Date.now()) {
        await this.remove(key);
        return null;
      }

      // Mettre en cache
      this.storageCache.set(storageKey, item);
      
      return this.decrypt(item.value as T, item.metadata?.encrypted);
    } catch (error) {
      console.warn(`Erreur lors de la récupération de la clé ${key}:`, error);
      return null;
    }
  }

  public async remove(key: string): Promise<void> {
    if (!this.storageInitialized) {
      await this.initialize();
    }

    try {
      const storageKey = `${STORAGE_PREFIX}${key}`;
      
      if (this.localStorage) {
        await this.localStorage.remove(storageKey);
      }
      
      this.storageCache.delete(storageKey);
    } catch (error) {
      throw new StorageError(
        `Erreur lors de la suppression de la clé: ${key}`,
        'REMOVE_ERROR',
        error as Error
      );
    }
  }

  public async clear(): Promise<void> {
    if (!this.storageInitialized) {
      await this.initialize();
    }

    try {
      if (this.localStorage) {
        const keys = await this.localStorage.keys();
        const prefixedKeys = keys.filter(key => key.startsWith(STORAGE_PREFIX));
        
        for (const key of prefixedKeys) {
          await this.localStorage.remove(key);
        }
      }
      
      this.storageCache.clear();
    } catch (error) {
      throw new StorageError(
        'Erreur lors de la suppression de toutes les données',
        'CLEAR_ERROR',
        error as Error
      );
    }
  }

  public async getAllKeys(): Promise<readonly string[]> {
    if (!this.storageInitialized) {
      await this.initialize();
    }

    try {
      if (!this.localStorage) return [];
      
      const keys = await this.localStorage.keys();
      return keys
        .filter(key => key.startsWith(STORAGE_PREFIX))
        .map(key => key.replace(STORAGE_PREFIX, ''));
    } catch (error) {
      console.warn('Erreur lors de la récupération des clés:', error);
      return [];
    }
  }

  // ===== STOCKAGE CLOUD =====
  public async uploadFile(
    file: File | Blob,
    path: string,
    options: CloudUploadOptions = {}
  ): Promise<string> {
    try {
      // Vérifier que Storage est disponible
      if (!storage) {
        throw new Error('Firebase Storage non disponible. Vérifiez la configuration Firebase.');
      }

      const {
        folder = 'uploads',
        fileName = `file_${Date.now()}`,
        metadata = {},
        onProgress,
      } = options;

      const fullPath = `${folder}/${fileName}`;
      const storageRef: StorageReference = ref(storage, fullPath);

      // Créer la tâche d'upload
      const uploadTask = uploadBytes(storageRef, file, {
        customMetadata: metadata,
      });

      // Simuler le progress si une callback est fournie
      if (onProgress) {
        const fileSize = file.size;
        let bytesTransferred = 0;
        
        const progressInterval = setInterval(() => {
          bytesTransferred = Math.min(bytesTransferred + fileSize * 0.1, fileSize);
          onProgress({
            bytesTransferred,
            totalBytes: fileSize,
            progress: (bytesTransferred / fileSize) * 100,
            state: bytesTransferred >= fileSize ? 'success' : 'running',
          });
          
          if (bytesTransferred >= fileSize) {
            clearInterval(progressInterval);
          }
        }, 100);
      }

      const snapshot = await uploadTask;
      const downloadURL = await getDownloadURL(snapshot.ref);
      
      return downloadURL;
    } catch (error) {
      throw new StorageError(
        `Erreur lors de l'upload du fichier: ${path}`,
        'UPLOAD_ERROR',
        error as Error
      );
    }
  }

  public async deleteFile(url: string): Promise<void> {
    try {
      // Vérifier que Storage est disponible
      if (!storage) {
        throw new Error('Firebase Storage non disponible. Vérifiez la configuration Firebase.');
      }

      const storageRef: StorageReference = ref(storage, url);
      await deleteObject(storageRef);
    } catch (error) {
      throw new StorageError(
        `Erreur lors de la suppression du fichier: ${url}`,
        'DELETE_FILE_ERROR',
        error as Error
      );
    }
  }

  public async downloadFile(url: string): Promise<Blob> {
    try {
      // Vérifier que Storage est disponible
      if (!storage) {
        throw new Error('Firebase Storage non disponible. Vérifiez la configuration Firebase.');
      }

      const storageRef: StorageReference = ref(storage, url);
      const downloadURL = await getDownloadURL(storageRef);
      
      const response = await fetch(downloadURL);
      if (!response.ok) {
        throw new Error(`Erreur HTTP: ${response.status}`);
      }
      
      return await response.blob();
    } catch (error) {
      throw new StorageError(
        `Erreur lors du téléchargement du fichier: ${url}`,
        'DOWNLOAD_ERROR',
        error as Error
      );
    }
  }

  // ===== UTILITAIRES =====
  public async getStorageInfo(): Promise<{
    readonly totalSize: number;
    readonly usedSize: number;
    readonly itemCount: number;
    readonly oldestItem?: StorageItem;
    readonly newestItem?: StorageItem;
  }> {
    if (!this.storageInitialized) {
      await this.initialize();
    }

    let totalSize = 0;
    let itemCount = 0;
    let oldestItem: StorageItem | undefined;
    let newestItem: StorageItem | undefined;

    this.storageCache.forEach((item) => {
      const itemSize = new Blob([JSON.stringify(item)]).size;
      totalSize += itemSize;
      itemCount++;

      if (!oldestItem || item.timestamp < oldestItem.timestamp) {
        oldestItem = item;
      }
      if (!newestItem || item.timestamp > newestItem.timestamp) {
        newestItem = item;
      }
    });

    const result: {
      readonly totalSize: number;
      readonly usedSize: number;
      readonly itemCount: number;
      readonly oldestItem?: StorageItem;
      readonly newestItem?: StorageItem;
    } = {
      totalSize,
      usedSize: totalSize,
      itemCount,
    };

    if (oldestItem) {
      Object.assign(result, { oldestItem });
    }
    if (newestItem) {
      Object.assign(result, { newestItem });
    }

    return result;
  }

  // ===== MÉTHODES PRIVÉES =====
  private encrypt<T>(value: T): T {
    // Implémentation basique - à améliorer avec une vraie librairie de chiffrement
    try {
      const stringValue = JSON.stringify(value);
      const encoded = btoa(stringValue);
      return JSON.parse(encoded) as T;
    } catch {
      return value;
    }
  }

  private decrypt<T>(value: T, isEncrypted?: boolean): T {
    if (!isEncrypted) return value;
    
    try {
      const stringValue = JSON.stringify(value);
      const decoded = atob(stringValue);
      return JSON.parse(decoded) as T;
    } catch {
      return value;
    }
  }
}

// ===== SINGLETON =====
export const storageService = new StorageService();
export type { StorageMetadata, UploadProgress, CloudUploadOptions };
export { StorageError };
