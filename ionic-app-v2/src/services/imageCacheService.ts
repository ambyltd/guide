/**
 * Service de cache intelligent des images
 * Phase 3 du Sprint 3
 * 
 * Fonctionnalités :
 * - Préchargement des images prioritaires
 * - Compression automatique avec Canvas API
 * - Lazy loading avec IntersectionObserver
 * - Nettoyage automatique des images > 30 jours
 * - UI progress bar pour download
 */

import { Filesystem, Directory } from '@capacitor/filesystem';
import { Capacitor } from '@capacitor/core';

// Types
export interface ImageCacheEntry {
  url: string;
  localPath: string;
  size: number;
  downloadedAt: number;
  lastAccessedAt: number;
  priority: 'high' | 'medium' | 'low';
  compressed: boolean;
}

export interface ImageCacheStats {
  totalImages: number;
  totalSize: number;
  highPriority: number;
  mediumPriority: number;
  lowPriority: number;
  compressed: number;
  uncompressed: number;
}

export interface DownloadProgress {
  url: string;
  loaded: number;
  total: number;
  percentage: number;
}

// Configuration
const CACHE_DIR = 'images_cache';
const MAX_CACHE_SIZE = 200 * 1024 * 1024; // 200 MB
const MAX_AGE_DAYS = 30;
const COMPRESSION_QUALITY = 0.8;
const MAX_IMAGE_WIDTH = 1920;
const MAX_IMAGE_HEIGHT = 1080;

class ImageCacheService {
  private cache: Map<string, ImageCacheEntry> = new Map();
  private downloadQueue: Set<string> = new Set();
  private observers: Map<string, IntersectionObserver> = new Map();
  private progressCallbacks: Map<string, (progress: DownloadProgress) => void> = new Map();
  private isNative: boolean;

  constructor() {
    this.isNative = Capacitor.isNativePlatform();
    this.loadCacheIndex();
  }

  /**
   * Initialiser le service (à appeler au démarrage de l'app)
   */
  async initialize(): Promise<void> {
    console.log('🖼️ Initializing Image Cache Service...');
    
    try {
      // Créer le dossier cache si nécessaire
      if (this.isNative) {
        await this.ensureCacheDirectory();
      }
      
      // Charger l'index du cache
      await this.loadCacheIndex();
      
      // Nettoyer les anciennes images
      await this.cleanOldImages();
      
      // Vérifier la taille du cache
      const stats = await this.getStats();
      console.log('📊 Image Cache Stats:', stats);
      
      if (stats.totalSize > MAX_CACHE_SIZE) {
        console.warn('⚠️ Cache size exceeds limit, cleaning up...');
        await this.cleanupCache();
      }
      
      console.log('✅ Image Cache Service initialized');
    } catch (error) {
      console.error('❌ Error initializing Image Cache Service:', error);
    }
  }

  /**
   * Créer le dossier de cache si nécessaire
   */
  private async ensureCacheDirectory(): Promise<void> {
    try {
      await Filesystem.mkdir({
        path: CACHE_DIR,
        directory: Directory.Data,
        recursive: true,
      });
    } catch (error) {
      // Dossier existe déjà, ignorer l'erreur
      console.log('📁 Cache directory already exists');
    }
  }

  /**
   * Charger l'index du cache depuis localStorage
   */
  private async loadCacheIndex(): Promise<void> {
    try {
      const indexStr = localStorage.getItem('imageCacheIndex');
      if (indexStr) {
        const entries: ImageCacheEntry[] = JSON.parse(indexStr);
        this.cache = new Map(entries.map(entry => [entry.url, entry]));
        console.log(`📥 Loaded ${this.cache.size} images from cache index`);
      }
    } catch (error) {
      console.error('❌ Error loading cache index:', error);
      this.cache = new Map();
    }
  }

  /**
   * Sauvegarder l'index du cache dans localStorage
   */
  private async saveCacheIndex(): Promise<void> {
    try {
      const entries = Array.from(this.cache.values());
      localStorage.setItem('imageCacheIndex', JSON.stringify(entries));
      console.log(`💾 Saved ${entries.length} images to cache index`);
    } catch (error) {
      console.error('❌ Error saving cache index:', error);
    }
  }

  /**
   * Télécharger et cacher une image
   */
  async cacheImage(
    url: string,
    priority: 'high' | 'medium' | 'low' = 'medium',
    compress: boolean = true,
    onProgress?: (progress: DownloadProgress) => void
  ): Promise<string> {
    // Vérifier si l'image est déjà en cache
    const cached = this.cache.get(url);
    if (cached) {
      // Mettre à jour lastAccessedAt
      cached.lastAccessedAt = Date.now();
      await this.saveCacheIndex();
      return this.isNative ? cached.localPath : url;
    }

    // Ajouter à la queue de téléchargement
    if (this.downloadQueue.has(url)) {
      console.log('⏳ Image already in download queue:', url);
      return url; // Retourner URL originale en attendant
    }

    this.downloadQueue.add(url);
    if (onProgress) {
      this.progressCallbacks.set(url, onProgress);
    }

    try {
      console.log(`📥 Downloading image: ${url} (priority: ${priority})`);

      // Télécharger l'image
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }

      const contentLength = parseInt(response.headers.get('content-length') || '0', 10);
      const reader = response.body?.getReader();
      if (!reader) {
        throw new Error('Cannot read response body');
      }

      // Lire le body avec progress
      const chunks: Uint8Array[] = [];
      let loaded = 0;

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        chunks.push(value);
        loaded += value.length;

        // Callback progress
        if (onProgress && contentLength > 0) {
          onProgress({
            url,
            loaded,
            total: contentLength,
            percentage: (loaded / contentLength) * 100,
          });
        }
      }

      // Combiner les chunks
      const blob = new Blob(chunks as BlobPart[]);
      
      // Compresser si demandé
      let finalBlob = blob;
      let compressed = false;
      if (compress && blob.type.startsWith('image/')) {
        finalBlob = await this.compressImage(blob);
        compressed = true;
      }

      // Sauvegarder sur le filesystem (natif uniquement)
      let localPath = url;
      if (this.isNative) {
        const filename = this.getFilenameFromUrl(url);
        const base64Data = await this.blobToBase64(finalBlob);
        
        await Filesystem.writeFile({
          path: `${CACHE_DIR}/${filename}`,
          data: base64Data,
          directory: Directory.Data,
        });

        localPath = `${CACHE_DIR}/${filename}`;
      }

      // Ajouter au cache
      const entry: ImageCacheEntry = {
        url,
        localPath,
        size: finalBlob.size,
        downloadedAt: Date.now(),
        lastAccessedAt: Date.now(),
        priority,
        compressed,
      };

      this.cache.set(url, entry);
      await this.saveCacheIndex();

      console.log(`✅ Image cached: ${url} (${(finalBlob.size / 1024).toFixed(2)} KB, compressed: ${compressed})`);

      return this.isNative ? localPath : url;
    } catch (error) {
      console.error(`❌ Error caching image ${url}:`, error);
      return url; // Retourner URL originale en cas d'erreur
    } finally {
      this.downloadQueue.delete(url);
      this.progressCallbacks.delete(url);
    }
  }

  /**
   * Compresser une image avec Canvas API
   */
  private async compressImage(blob: Blob): Promise<Blob> {
    return new Promise((resolve, reject) => {
      const img = new Image();
      const url = URL.createObjectURL(blob);

      img.onload = () => {
        try {
          // Créer canvas
          const canvas = document.createElement('canvas');
          const ctx = canvas.getContext('2d');
          if (!ctx) {
            throw new Error('Cannot get canvas context');
          }

          // Calculer nouvelles dimensions (max 1920x1080)
          let { width, height } = img;
          if (width > MAX_IMAGE_WIDTH || height > MAX_IMAGE_HEIGHT) {
            const ratio = Math.min(MAX_IMAGE_WIDTH / width, MAX_IMAGE_HEIGHT / height);
            width = Math.floor(width * ratio);
            height = Math.floor(height * ratio);
          }

          canvas.width = width;
          canvas.height = height;

          // Dessiner l'image redimensionnée
          ctx.drawImage(img, 0, 0, width, height);

          // Convertir en blob compressé
          canvas.toBlob(
            (compressedBlob) => {
              URL.revokeObjectURL(url);
              if (compressedBlob) {
                console.log(`🗜️ Image compressed: ${(blob.size / 1024).toFixed(2)} KB → ${(compressedBlob.size / 1024).toFixed(2)} KB`);
                resolve(compressedBlob);
              } else {
                reject(new Error('Failed to compress image'));
              }
            },
            'image/jpeg',
            COMPRESSION_QUALITY
          );
        } catch (error) {
          URL.revokeObjectURL(url);
          reject(error);
        }
      };

      img.onerror = () => {
        URL.revokeObjectURL(url);
        reject(new Error('Failed to load image'));
      };

      img.src = url;
    });
  }

  /**
   * Convertir Blob en Base64
   */
  private async blobToBase64(blob: Blob): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64 = reader.result as string;
        // Retirer le préfixe "data:image/...;base64,"
        const base64Data = base64.split(',')[1];
        resolve(base64Data);
      };
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
  }

  /**
   * Extraire nom de fichier depuis URL
   */
  private getFilenameFromUrl(url: string): string {
    const urlObj = new URL(url);
    const pathname = urlObj.pathname;
    const filename = pathname.split('/').pop() || 'unknown';
    // Ajouter hash pour éviter collisions
    const hash = this.hashCode(url).toString();
    return `${hash}_${filename}`;
  }

  /**
   * Hash simple pour URL
   */
  private hashCode(str: string): number {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = (hash << 5) - hash + char;
      hash = hash & hash; // Convert to 32bit integer
    }
    return Math.abs(hash);
  }

  /**
   * Précharger des images prioritaires
   */
  async precacheImages(
    urls: string[],
    priority: 'high' | 'medium' | 'low' = 'high',
    onProgress?: (current: number, total: number) => void
  ): Promise<void> {
    console.log(`🚀 Precaching ${urls.length} images (priority: ${priority})...`);

    for (let i = 0; i < urls.length; i++) {
      try {
        await this.cacheImage(urls[i], priority, true);
        if (onProgress) {
          onProgress(i + 1, urls.length);
        }
      } catch (error) {
        console.error(`❌ Error precaching image ${urls[i]}:`, error);
      }
    }

    console.log(`✅ Precached ${urls.length} images`);
  }

  /**
   * Obtenir une image (depuis cache ou télécharger)
   */
  async getImage(url: string): Promise<string> {
    const cached = this.cache.get(url);
    if (cached) {
      // Mettre à jour lastAccessedAt
      cached.lastAccessedAt = Date.now();
      await this.saveCacheIndex();
      
      if (this.isNative) {
        // Retourner chemin local
        try {
          const file = await Filesystem.readFile({
            path: cached.localPath,
            directory: Directory.Data,
          });
          return `data:image/jpeg;base64,${file.data}`;
        } catch (error) {
          console.error('❌ Error reading cached image:', error);
          // Cache invalide, retélécharger
          this.cache.delete(url);
          await this.saveCacheIndex();
          return this.cacheImage(url);
        }
      } else {
        // Web : retourner URL originale
        return url;
      }
    }

    // Pas en cache, télécharger
    return this.cacheImage(url);
  }

  /**
   * Nettoyer les images anciennes (> 30 jours)
   */
  private async cleanOldImages(): Promise<void> {
    const now = Date.now();
    const maxAge = MAX_AGE_DAYS * 24 * 60 * 60 * 1000;
    let cleaned = 0;

    for (const [url, entry] of this.cache.entries()) {
      const age = now - entry.lastAccessedAt;
      if (age > maxAge) {
        await this.removeImage(url);
        cleaned++;
      }
    }

    if (cleaned > 0) {
      console.log(`🗑️ Cleaned ${cleaned} old images (>${MAX_AGE_DAYS} days)`);
    }
  }

  /**
   * Supprimer une image du cache
   */
  async removeImage(url: string): Promise<void> {
    const entry = this.cache.get(url);
    if (!entry) return;

    // Supprimer du filesystem
    if (this.isNative) {
      try {
        await Filesystem.deleteFile({
          path: entry.localPath,
          directory: Directory.Data,
        });
      } catch (error) {
        console.error('❌ Error deleting cached image:', error);
      }
    }

    // Supprimer de l'index
    this.cache.delete(url);
    await this.saveCacheIndex();
  }

  /**
   * Nettoyer le cache pour libérer de l'espace
   */
  async cleanupCache(): Promise<void> {
    console.log('🧹 Cleaning up cache...');

    // Trier par lastAccessedAt (plus vieux en premier)
    const entries = Array.from(this.cache.entries()).sort(
      ([, a], [, b]) => a.lastAccessedAt - b.lastAccessedAt
    );

    // Supprimer les plus vieux jusqu'à atteindre 70% de la limite
    const targetSize = MAX_CACHE_SIZE * 0.7;
    let currentSize = (await this.getStats()).totalSize;
    let cleaned = 0;

    for (const [url] of entries) {
      if (currentSize <= targetSize) break;
      
      const entry = this.cache.get(url);
      if (entry && entry.priority !== 'high') {
        await this.removeImage(url);
        currentSize -= entry.size;
        cleaned++;
      }
    }

    console.log(`✅ Cache cleanup complete: ${cleaned} images removed`);
  }

  /**
   * Vider complètement le cache
   */
  async clearCache(): Promise<void> {
    console.log('🗑️ Clearing entire image cache...');

    // Supprimer tous les fichiers
    if (this.isNative) {
      for (const entry of this.cache.values()) {
        try {
          await Filesystem.deleteFile({
            path: entry.localPath,
            directory: Directory.Data,
          });
        } catch (error) {
          console.error('❌ Error deleting image:', error);
        }
      }
    }

    // Vider l'index
    this.cache.clear();
    await this.saveCacheIndex();

    console.log('✅ Image cache cleared');
  }

  /**
   * Obtenir les statistiques du cache
   */
  async getStats(): Promise<ImageCacheStats> {
    let totalSize = 0;
    let highPriority = 0;
    let mediumPriority = 0;
    let lowPriority = 0;
    let compressed = 0;
    let uncompressed = 0;

    for (const entry of this.cache.values()) {
      totalSize += entry.size;
      
      if (entry.priority === 'high') highPriority++;
      else if (entry.priority === 'medium') mediumPriority++;
      else lowPriority++;
      
      if (entry.compressed) compressed++;
      else uncompressed++;
    }

    return {
      totalImages: this.cache.size,
      totalSize,
      highPriority,
      mediumPriority,
      lowPriority,
      compressed,
      uncompressed,
    };
  }

  /**
   * Créer un IntersectionObserver pour lazy loading
   */
  createLazyLoader(
    callback: (entry: IntersectionObserverEntry) => void
  ): IntersectionObserver {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            callback(entry);
            observer.unobserve(entry.target);
          }
        });
      },
      {
        rootMargin: '50px', // Charger 50px avant d'être visible
        threshold: 0.01,
      }
    );

    return observer;
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
}

// Singleton
export const imageCacheService = new ImageCacheService();

// Auto-initialisation
if (typeof window !== 'undefined') {
  imageCacheService.initialize();
}

export default imageCacheService;
