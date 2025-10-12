/**
 * Service AudioGuide pour l'application Ionic
 * Gestion complète des audioguides avec téléchargement, cache et lecture offline
 */

import axios from 'axios';
import type { BackendAudioGuide as AudioGuide } from '../types/backend';

// ===== INTERFACES =====
export interface AudioGuideFilters {
  language?: string;
  attractionId?: string;
  status?: 'active' | 'inactive';
  search?: string;
}

export interface AudioGuideDownload {
  id: string;
  audioGuideId: string;
  progress: number;
  status: 'pending' | 'downloading' | 'completed' | 'failed';
  audioUrl?: string;
  localPath?: string;
  error?: string;
}

export interface PlaybackState {
  audioGuideId: string;
  isPlaying: boolean;
  currentTime: number;
  duration: number;
  volume: number;
}

// ===== GESTION DU CACHE =====
class AudioGuideCache {
  private static CACHE_KEY = 'audioguides_cache';
  private static CACHE_DURATION = 24 * 60 * 60 * 1000; // 24 heures

  static async get(key: string): Promise<AudioGuide | null> {
    try {
      const cacheData = localStorage.getItem(`${this.CACHE_KEY}_${key}`);
      if (!cacheData) return null;

      const { data, timestamp } = JSON.parse(cacheData);
      const isExpired = Date.now() - timestamp > this.CACHE_DURATION;

      if (isExpired) {
        this.remove(key);
        return null;
      }

      return data;
    } catch (error) {
      console.error('Erreur lecture cache:', error);
      return null;
    }
  }

  static async set(key: string, data: AudioGuide): Promise<void> {
    try {
      const cacheData = {
        data,
        timestamp: Date.now(),
      };
      localStorage.setItem(`${this.CACHE_KEY}_${key}`, JSON.stringify(cacheData));
    } catch (error) {
      console.error('Erreur écriture cache:', error);
    }
  }

  static remove(key: string): void {
    localStorage.removeItem(`${this.CACHE_KEY}_${key}`);
  }

  static clear(): void {
    const keys = Object.keys(localStorage);
    keys.forEach(key => {
      if (key.startsWith(this.CACHE_KEY)) {
        localStorage.removeItem(key);
      }
    });
  }
}

// ===== SERVICE AUDIOGUIDE =====
class AudioGuideService {
  private static instance: AudioGuideService;
  private apiClient = axios.create({
    baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api',
    timeout: 30000,
  });
  private downloads: Map<string, AudioGuideDownload> = new Map();
  private currentAudio: HTMLAudioElement | null = null;
  private playbackState: PlaybackState | null = null;

  private constructor() {
    this.setupInterceptors();
  }

  static getInstance(): AudioGuideService {
    if (!AudioGuideService.instance) {
      AudioGuideService.instance = new AudioGuideService();
    }
    return AudioGuideService.instance;
  }

  private setupInterceptors(): void {
    // Intercepteur de requête
    this.apiClient.interceptors.request.use(
      config => {
        const token = localStorage.getItem('auth_token');
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
      },
      error => Promise.reject(error)
    );

    // Intercepteur de réponse
    this.apiClient.interceptors.response.use(
      response => response,
      error => {
        if (error.response?.status === 401) {
          // Token expiré - redirection vers login
          window.dispatchEvent(new CustomEvent('auth:expired'));
        }
        return Promise.reject(error);
      }
    );
  }

  // ===== RÉCUPÉRATION DES AUDIOGUIDES =====

  /**
   * Récupère tous les audioguides avec filtres
   */
  async getAudioGuides(filters?: AudioGuideFilters): Promise<AudioGuide[]> {
    try {
      const params = new URLSearchParams();
      if (filters?.language) params.append('language', filters.language);
      if (filters?.attractionId) params.append('attractionId', filters.attractionId);
      if (filters?.status) params.append('status', filters.status);
      if (filters?.search) params.append('search', filters.search);

      const response = await this.apiClient.get<{ data: AudioGuide[] }>(
        `/audioguides?${params.toString()}`
      );

      // Mettre en cache
      response.data.data.forEach(guide => {
        AudioGuideCache.set(guide._id, guide);
      });

      return response.data.data;
    } catch (error) {
      console.error('Erreur récupération audioguides:', error);
      throw this.handleError(error);
    }
  }

  /**
   * Récupère un audioguide par ID
   */
  async getAudioGuideById(id: string): Promise<AudioGuide> {
    try {
      // Vérifier le cache d'abord
      const cached = await AudioGuideCache.get(id);
      if (cached) {
        return cached;
      }

      const response = await this.apiClient.get<{ data: AudioGuide }>(`/audioguides/${id}`);
      
      // Mettre en cache
      AudioGuideCache.set(id, response.data.data);

      return response.data.data;
    } catch (error) {
      console.error('Erreur récupération audioguide:', error);
      throw this.handleError(error);
    }
  }

  /**
   * Récupère les audioguides d'une attraction
   */
  async getAudioGuidesByAttraction(attractionId: string): Promise<AudioGuide[]> {
    return this.getAudioGuides({ attractionId, status: 'active' });
  }

  /**
   * Recherche d'audioguides
   */
  async searchAudioGuides(query: string): Promise<AudioGuide[]> {
    return this.getAudioGuides({ search: query, status: 'active' });
  }

  // ===== TÉLÉCHARGEMENT ET CACHE =====

  /**
   * Télécharge un audioguide pour utilisation offline
   */
  async downloadAudioGuide(audioGuideId: string): Promise<void> {
    try {
      const audioGuide = await this.getAudioGuideById(audioGuideId);
      
      if (!audioGuide.audioUrl) {
        throw new Error('URL audio non disponible');
      }

      // Créer l'état de téléchargement
      const download: AudioGuideDownload = {
        id: Date.now().toString(),
        audioGuideId,
        progress: 0,
        status: 'downloading',
        audioUrl: audioGuide.audioUrl,
      };

      this.downloads.set(audioGuideId, download);

      // Télécharger l'audio
      const response = await fetch(audioGuide.audioUrl);
      
      if (!response.ok) {
        throw new Error('Échec du téléchargement');
      }

      const blob = await response.blob();
      
      // Sauvegarder en cache
      const localUrl = URL.createObjectURL(blob);
      
      download.localPath = localUrl;
      download.progress = 100;
      download.status = 'completed';
      
      this.downloads.set(audioGuideId, download);

      // Sauvegarder la référence locale
      localStorage.setItem(`audio_${audioGuideId}`, localUrl);

      console.log(`Audioguide ${audioGuideId} téléchargé avec succès`);
    } catch (error) {
      const download = this.downloads.get(audioGuideId);
      if (download) {
        download.status = 'failed';
        download.error = error instanceof Error ? error.message : 'Erreur inconnue';
        this.downloads.set(audioGuideId, download);
      }
      throw this.handleError(error);
    }
  }

  /**
   * Vérifie si un audioguide est téléchargé
   */
  isDownloaded(audioGuideId: string): boolean {
    const download = this.downloads.get(audioGuideId);
    return download?.status === 'completed' || 
           localStorage.getItem(`audio_${audioGuideId}`) !== null;
  }

  /**
   * Récupère l'état du téléchargement
   */
  getDownloadStatus(audioGuideId: string): AudioGuideDownload | null {
    return this.downloads.get(audioGuideId) || null;
  }

  /**
   * Supprime un audioguide téléchargé
   */
  async deleteDownload(audioGuideId: string): Promise<void> {
    const localUrl = localStorage.getItem(`audio_${audioGuideId}`);
    if (localUrl) {
      URL.revokeObjectURL(localUrl);
      localStorage.removeItem(`audio_${audioGuideId}`);
    }
    this.downloads.delete(audioGuideId);
    AudioGuideCache.remove(audioGuideId);
  }

  // ===== LECTURE AUDIO =====

  /**
   * Démarre la lecture d'un audioguide
   */
  async play(audioGuideId: string): Promise<void> {
    try {
      // Arrêter la lecture en cours
      this.stop();

      // Récupérer l'audioguide
      const audioGuide = await this.getAudioGuideById(audioGuideId);
      
      // Vérifier si téléchargé localement
      const localUrl = localStorage.getItem(`audio_${audioGuideId}`);
      const audioUrl = localUrl || audioGuide.audioUrl;

      if (!audioUrl) {
        throw new Error('URL audio non disponible');
      }

      // Créer l'élément audio
      this.currentAudio = new Audio(audioUrl);
      
      // Initialiser l'état de lecture
      this.playbackState = {
        audioGuideId,
        isPlaying: false,
        currentTime: 0,
        duration: 0,
        volume: 1,
      };

      // Écouteurs d'événements
      this.currentAudio.addEventListener('loadedmetadata', () => {
        if (this.playbackState && this.currentAudio) {
          this.playbackState.duration = this.currentAudio.duration;
        }
      });

      this.currentAudio.addEventListener('timeupdate', () => {
        if (this.playbackState && this.currentAudio) {
          this.playbackState.currentTime = this.currentAudio.currentTime;
        }
      });

      this.currentAudio.addEventListener('ended', () => {
        if (this.playbackState) {
          this.playbackState.isPlaying = false;
        }
      });

      // Démarrer la lecture
      await this.currentAudio.play();
      this.playbackState.isPlaying = true;

      console.log(`Lecture audioguide ${audioGuideId} démarrée`);
    } catch (error) {
      console.error('Erreur lecture audio:', error);
      throw this.handleError(error);
    }
  }

  /**
   * Met en pause la lecture
   */
  pause(): void {
    if (this.currentAudio && this.playbackState) {
      this.currentAudio.pause();
      this.playbackState.isPlaying = false;
    }
  }

  /**
   * Reprend la lecture
   */
  resume(): void {
    if (this.currentAudio && this.playbackState) {
      this.currentAudio.play();
      this.playbackState.isPlaying = true;
    }
  }

  /**
   * Arrête la lecture
   */
  stop(): void {
    if (this.currentAudio) {
      this.currentAudio.pause();
      this.currentAudio.currentTime = 0;
      this.currentAudio = null;
    }
    this.playbackState = null;
  }

  /**
   * Change le volume (0-1)
   */
  setVolume(volume: number): void {
    if (this.currentAudio) {
      this.currentAudio.volume = Math.max(0, Math.min(1, volume));
      if (this.playbackState) {
        this.playbackState.volume = volume;
      }
    }
  }

  /**
   * Change la position de lecture
   */
  seek(time: number): void {
    if (this.currentAudio) {
      this.currentAudio.currentTime = time;
    }
  }

  /**
   * Récupère l'état de lecture actuel
   */
  getPlaybackState(): PlaybackState | null {
    return this.playbackState;
  }

  // ===== GESTION DES ERREURS =====

  private handleError(error: unknown): Error {
    if (axios.isAxiosError(error)) {
      if (error.response) {
        return new Error(
          error.response.data?.message || 'Erreur serveur'
        );
      } else if (error.request) {
        return new Error('Pas de réponse du serveur. Vérifiez votre connexion.');
      }
    }
    return error instanceof Error ? error : new Error('Erreur inconnue');
  }

  // ===== NETTOYAGE =====

  /**
   * Nettoie tous les téléchargements et le cache
   */
  async clearAll(): Promise<void> {
    this.stop();
    
    // Nettoyer les téléchargements
    for (const [audioGuideId] of this.downloads) {
      await this.deleteDownload(audioGuideId);
    }
    
    // Nettoyer le cache
    AudioGuideCache.clear();
  }
}

// Export singleton
export const audioGuideService = AudioGuideService.getInstance();
export default audioGuideService;
