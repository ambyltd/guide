import { getApiBaseUrl, checkApiHealth } from '../config/apiConfig';

export interface ApiResponse<T> {
  data: T;
  success: boolean;
  message?: string;
}

export interface ApiError {
  message: string;
  status?: number;
}

// Configuration de l'API dynamique (dev/prod)
const API_BASE_URL = getApiBaseUrl();

class ApiClient {
  private baseURL: string;

  constructor(baseURL: string) {
    this.baseURL = baseURL;
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> {
    const url = `${this.baseURL}${endpoint}`;
    
    // Configuration par défaut
    const config: RequestInit = {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    };

    // Ajouter le token d'authentification si disponible
    const token = localStorage.getItem('authToken');
    if (token && config.headers) {
      (config.headers as Record<string, string>).Authorization = `Bearer ${token}`;
    }

    try {
      const response = await fetch(url, config);
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ message: 'Erreur réseau' }));
        throw new Error(errorData.message || `Erreur HTTP: ${response.status}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Erreur API:', error);
      throw error;
    }
  }

  async get<T>(url: string, params?: Record<string, unknown>): Promise<ApiResponse<T>> {
    let endpoint = url;
    if (params && Object.keys(params).length > 0) {
      const searchParams = new URLSearchParams();
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          searchParams.append(key, String(value));
        }
      });
      endpoint += `?${searchParams.toString()}`;
    }
    
    return this.request<T>(endpoint, {
      method: 'GET',
    });
  }

  async post<T>(url: string, data?: unknown): Promise<ApiResponse<T>> {
    const requestInit: RequestInit = {
      method: 'POST',
    };
    
    if (data) {
      requestInit.body = JSON.stringify(data);
    }
    
    return this.request<T>(url, requestInit);
  }

  async put<T>(url: string, data?: unknown): Promise<ApiResponse<T>> {
    const requestInit: RequestInit = {
      method: 'PUT',
    };
    
    if (data) {
      requestInit.body = JSON.stringify(data);
    }
    
    return this.request<T>(url, requestInit);
  }

  async patch<T>(url: string, data?: unknown): Promise<ApiResponse<T>> {
    const requestInit: RequestInit = {
      method: 'PATCH',
    };
    
    if (data) {
      requestInit.body = JSON.stringify(data);
    }
    
    return this.request<T>(url, requestInit);
  }

  async delete<T>(url: string, data?: unknown): Promise<ApiResponse<T>> {
    const requestInit: RequestInit = {
      method: 'DELETE',
    };
    
    if (data) {
      requestInit.body = JSON.stringify(data);
    }
    
    return this.request<T>(url, requestInit);
  }

  /**
   * Vérifie si l'API est accessible (health check)
   */
  async checkHealth(): Promise<boolean> {
    return checkApiHealth();
  }

  /**
   * Retourne l'URL de base actuelle
   */
  getBaseUrl(): string {
    return this.baseURL;
  }
}

export const apiClient = new ApiClient(API_BASE_URL);

// Log de la configuration au démarrage (dev uniquement)
if (import.meta.env.DEV) {
  console.log('📡 API Client initialized with baseURL:', API_BASE_URL);
}
