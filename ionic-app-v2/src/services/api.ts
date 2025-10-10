/**
 * Service API expert pour l'application Ionic
 * Architecture robuste avec gestion d'erreurs, cache et offline support
 */

import axios, {
  type AxiosInstance,
  type AxiosResponse,
  type AxiosError,
  type AxiosRequestConfig,
} from 'axios';
import type {
  Attraction,
  Tour,
  AudioGuide,
  ApiResponse,
  PaginatedResponse,
  SearchFilters,
} from '@/types';

// ===== INTERFACES =====
interface ApiConfig {
  readonly baseURL: string;
  readonly timeout: number;
  readonly retries: number;
  readonly retryDelay: number;
}

interface CacheEntry<T> {
  readonly data: T;
  readonly timestamp: number;
  readonly expiresAt: number;
}

interface RequestOptions extends AxiosRequestConfig {
  readonly useCache?: boolean;
  readonly cacheTimeout?: number;
  readonly retries?: number;
}

// ===== CONFIGURATION =====
const API_CONFIG: ApiConfig = {
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api',
  timeout: 30000, // 30 secondes pour les audioguides
  retries: 3,
  retryDelay: 1000, // 1 seconde
};

// ===== GESTION D'ERREURS =====
interface ApiError extends Error {
  readonly code: string;
  readonly status?: number;
  readonly isNetworkError: boolean;
  readonly isTimeoutError: boolean;
}

const createApiError = (error: AxiosError | Error): ApiError => {
  const isAxiosError = 'isAxiosError' in error;
  
  let message = 'Une erreur inattendue s\'est produite';
  let code = 'UNKNOWN_ERROR';
  let status: number | undefined;
  let isNetworkError = false;
  let isTimeoutError = false;

  if (isAxiosError) {
    const axiosError = error as AxiosError;
    status = axiosError.response?.status;
    
    if (axiosError.code === 'ECONNABORTED') {
      message = 'Délai d\'attente dépassé. Vérifiez votre connexion.';
      code = 'TIMEOUT_ERROR';
      isTimeoutError = true;
    } else if (axiosError.code === 'ERR_NETWORK') {
      message = 'Erreur de connexion. Vérifiez votre connexion internet.';
      code = 'NETWORK_ERROR';
      isNetworkError = true;
    } else if (status) {
      switch (status) {
        case 400:
          message = 'Requête invalide';
          code = 'BAD_REQUEST';
          break;
        case 401:
          message = 'Non autorisé. Veuillez vous reconnecter.';
          code = 'UNAUTHORIZED';
          break;
        case 403:
          message = 'Accès interdit';
          code = 'FORBIDDEN';
          break;
        case 404:
          message = 'Ressource non trouvée';
          code = 'NOT_FOUND';
          break;
        case 429:
          message = 'Trop de requêtes. Veuillez patienter.';
          code = 'RATE_LIMITED';
          break;
        case 500:
          message = 'Erreur du serveur. Veuillez réessayer plus tard.';
          code = 'SERVER_ERROR';
          break;
        default:
          message = `Erreur HTTP ${status}`;
          code = `HTTP_${status}`;
      }
    }
  }

  return Object.assign(new Error(message), {
    code,
    status,
    isNetworkError,
    isTimeoutError,
    name: 'ApiError',
  }) as ApiError;
};

// ===== CACHE EN MÉMOIRE =====
class MemoryCache {
  private cache = new Map<string, CacheEntry<unknown>>();
  private readonly defaultTimeout = 5 * 60 * 1000; // 5 minutes

  public get<T>(key: string): T | null {
    const entry = this.cache.get(key);
    
    if (!entry) {
      return null;
    }

    if (Date.now() > entry.expiresAt) {
      this.cache.delete(key);
      return null;
    }

    return entry.data as T;
  }

  public set<T>(key: string, data: T, timeout?: number): void {
    const expiresAt = Date.now() + (timeout || this.defaultTimeout);
    this.cache.set(key, {
      data,
      timestamp: Date.now(),
      expiresAt,
    });
  }

  public delete(key: string): void {
    this.cache.delete(key);
  }

  public clear(): void {
    this.cache.clear();
  }

  public size(): number {
    return this.cache.size;
  }
}

// ===== SERVICE API =====
class ApiService {
  private readonly client: AxiosInstance;
  private readonly cache = new MemoryCache();
  private authToken: string | null = null;

  constructor() {
    this.client = axios.create({
      baseURL: API_CONFIG.baseURL,
      timeout: API_CONFIG.timeout,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    this.setupInterceptors();
  }

  // ===== CONFIGURATION =====
  private setupInterceptors(): void {
    // Intercepteur de requête
    this.client.interceptors.request.use(
      (config) => {
        if (this.authToken) {
          config.headers.Authorization = `Bearer ${this.authToken}`;
        }
        return config;
      },
      (error) => Promise.reject(error)
    );

    // Intercepteur de réponse
    this.client.interceptors.response.use(
      (response) => response,
      async (error: AxiosError) => {
        const config = error.config as AxiosRequestConfig & { _retry?: boolean; _retries?: number };
        
        // Gestion des retries
        if (config && !config._retry && this.shouldRetry(error)) {
          config._retry = true;
          config._retries = (config._retries || 0) + 1;

          if (config._retries <= API_CONFIG.retries) {
            await this.delay(API_CONFIG.retryDelay * config._retries);
            return this.client.request(config);
          }
        }

        return Promise.reject(createApiError(error));
      }
    );
  }

  private shouldRetry(error: AxiosError): boolean {
    if (!error.response) {
      return true; // Erreurs réseau
    }

    const status = error.response.status;
    return status >= 500 || status === 429; // Erreurs serveur ou rate limiting
  }

  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  // ===== AUTHENTIFICATION =====
  public setAuthToken(token: string | null): void {
    this.authToken = token;
  }

  // ===== MÉTHODES GÉNÉRIQUES =====
  private async request<T>(
    config: AxiosRequestConfig,
    options: RequestOptions = {}
  ): Promise<T> {
    const cacheKey = this.generateCacheKey(config);
    
    // Vérification du cache
    if (options.useCache !== false && config.method === 'GET') {
      const cachedData = this.cache.get<T>(cacheKey);
      if (cachedData) {
        return cachedData;
      }
    }

    try {
      const response: AxiosResponse<ApiResponse<T>> = await this.client.request({
        ...config,
        ...options,
      });

      if (!response.data.success) {
        throw new Error(response.data.error?.message || 'Erreur API');
      }

      const data = response.data.data!;

      // Mise en cache pour les requêtes GET
      if (config.method === 'GET' && options.useCache !== false) {
        this.cache.set(cacheKey, data, options.cacheTimeout);
      }

      return data;
    } catch (error) {
      if (error instanceof Error && 'code' in error) {
        throw error; // Erreur déjà formatée
      }
      throw createApiError(error as AxiosError);
    }
  }

  // Requête publique sans authentification
  private async publicRequest<T>(
    config: AxiosRequestConfig,
    options: RequestOptions = {}
  ): Promise<T> {
    const cacheKey = this.generateCacheKey(config);
    
    // Vérification du cache
    if (options.useCache !== false && config.method === 'GET') {
      const cachedData = this.cache.get<T>(cacheKey);
      if (cachedData) {
        return cachedData;
      }
    }

    try {
      // Créer une instance axios temporaire sans intercepteurs d'authentification
      const publicClient = axios.create({
        baseURL: this.client.defaults.baseURL || API_CONFIG.baseURL,
        timeout: this.client.defaults.timeout || API_CONFIG.timeout,
        headers: {
          'Content-Type': 'application/json',
        }
      });

      const response: AxiosResponse<ApiResponse<T>> = await publicClient.request({
        ...config,
        ...options,
      });

      if (!response.data.success) {
        throw new Error(response.data.error?.message || 'Erreur API');
      }

      const data = response.data.data!;

      // Mise en cache pour les requêtes GET
      if (config.method === 'GET' && options.useCache !== false) {
        this.cache.set(cacheKey, data, options.cacheTimeout);
      }

      return data;
    } catch (error) {
      if (error instanceof Error && 'code' in error) {
        throw error; // Erreur déjà formatée
      }
      throw createApiError(error as AxiosError);
    }
  }

  private generateCacheKey(config: AxiosRequestConfig): string {
    const { method = 'GET', url = '', params } = config;
    const paramsString = params ? JSON.stringify(params) : '';
    return `${method}:${url}:${paramsString}`;
  }

  // ===== MÉTHODES HTTP GÉNÉRIQUES =====
  public async get<T>(url: string, config?: AxiosRequestConfig): Promise<T> {
    return this.request<T>({
      method: 'GET',
      url,
      ...config,
    });
  }

  public async post<T>(url: string, data?: unknown, config?: AxiosRequestConfig): Promise<T> {
    return this.request<T>({
      method: 'POST',
      url,
      data,
      ...config,
    });
  }

  public async put<T>(url: string, data?: unknown, config?: AxiosRequestConfig): Promise<T> {
    return this.request<T>({
      method: 'PUT',
      url,
      data,
      ...config,
    });
  }

  public async delete<T>(url: string, config?: AxiosRequestConfig): Promise<T> {
    return this.request<T>({
      method: 'DELETE',
      url,
      ...config,
    });
  }

  // ===== API ATTRACTIONS =====
  public async getAttractions(
    filters?: SearchFilters,
    page = 1,
    limit = 20
  ): Promise<PaginatedResponse<Attraction>> {
    return this.request({
      method: 'GET',
      url: '/attractions',
      params: { ...filters, page, limit },
    });
  }

  public async getAttraction(id: string): Promise<Attraction> {
    return this.request({
      method: 'GET',
      url: `/attractions/${id}`,
    });
  }

  public async searchAttractions(
    query: string,
    filters?: SearchFilters
  ): Promise<Attraction[]> {
    return this.request({
      method: 'GET',
      url: '/attractions/search',
      params: { q: query, ...filters },
    }, { cacheTimeout: 2 * 60 * 1000 }); // Cache de 2 minutes pour les recherches
  }

  public async getAttractionsNearby(
    latitude: number,
    longitude: number,
    radius = 10
  ): Promise<Attraction[]> {
    return this.request({
      method: 'GET',
      url: '/attractions/nearby',
      params: { latitude, longitude, radius },
    }, { cacheTimeout: 1 * 60 * 1000 }); // Cache de 1 minute pour la géolocalisation
  }

  // ===== API CIRCUITS =====
  public async getTours(
    filters?: SearchFilters,
    page = 1,
    limit = 20
  ): Promise<PaginatedResponse<Tour>> {
    return this.request({
      method: 'GET',
      url: '/tours',
      params: { ...filters, page, limit },
    });
  }

  public async getTour(id: string): Promise<Tour> {
    return this.request({
      method: 'GET',
      url: `/tours/${id}`,
    });
  }

  public async searchTours(
    query: string,
    filters?: SearchFilters
  ): Promise<Tour[]> {
    return this.request({
      method: 'GET',
      url: '/tours/search',
      params: { q: query, ...filters },
    }, { cacheTimeout: 2 * 60 * 1000 });
  }

  // ===== API GUIDES AUDIO =====
  public async getAudioGuides(
    attractionId?: string,
    language?: string
  ): Promise<AudioGuide[]> {
    return this.request({
      method: 'GET',
      url: '/audio-guides',
      params: { attractionId, language },
    });
  }

  public async getAudioGuide(id: string): Promise<AudioGuide> {
    return this.request({
      method: 'GET',
      url: `/audio-guides/${id}`,
    });
  }

  public async downloadAudioGuide(id: string): Promise<Blob> {
    const response = await this.client.get(`/audio-guides/${id}/download`, {
      responseType: 'blob',
    });
    return response.data;
  }

  // ===== GESTION DU CACHE =====
  public clearCache(): void {
    this.cache.clear();
  }

  public getCacheSize(): number {
    return this.cache.size();
  }

  // ===== API PUBLIQUE (sans authentification) =====
  public async getPublicAttractions(
    filters?: SearchFilters,
    page = 1,
    limit = 20
  ): Promise<PaginatedResponse<Attraction>> {
    return this.publicRequest({
      method: 'GET',
      url: '/attractions',
      params: { ...filters, page, limit },
    });
  }

  public async getPublicAttraction(id: string): Promise<Attraction> {
    return this.publicRequest({
      method: 'GET',
      url: `/attractions/${id}`,
    });
  }

  public async getPublicTours(
    filters?: SearchFilters,
    page = 1,
    limit = 20
  ): Promise<PaginatedResponse<Tour>> {
    return this.publicRequest({
      method: 'GET',
      url: '/tours',
      params: { ...filters, page, limit },
    });
  }

  public async getPublicTour(id: string): Promise<Tour> {
    return this.publicRequest({
      method: 'GET',
      url: `/tours/${id}`,
    });
  }

  public async getPublicAudioGuides(
    attractionId?: string,
    language?: string
  ): Promise<AudioGuide[]> {
    return this.publicRequest({
      method: 'GET',
      url: '/audio-guides',
      params: { attractionId, language },
    });
  }

  // ===== MONITORING =====
  public getApiStats(): {
    cacheSize: number;
    baseURL: string;
    hasAuthToken: boolean;
  } {
    return {
      cacheSize: this.cache.size(),
      baseURL: API_CONFIG.baseURL,
      hasAuthToken: this.authToken !== null,
    };
  }
}

// ===== INSTANCE SINGLETON =====
export const apiService = new ApiService();

// ===== EXPORTS =====
export default apiService;
export type { ApiError, RequestOptions };