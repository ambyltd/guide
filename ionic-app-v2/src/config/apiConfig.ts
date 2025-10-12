/**
 * Configuration API dynamique pour dev/prod
 * Gère automatiquement l'URL backend selon l'environnement
 */

import { Capacitor } from '@capacitor/core';

// Détection de l'environnement
const isProduction = import.meta.env.PROD;
const platform = Capacitor.getPlatform();
const isNative = platform === 'android' || platform === 'ios';

// Configuration réseau local (à adapter selon ton PC)
const LOCAL_IP = '192.168.1.9'; // IP de ton PC (obtenue via ipconfig)
const LOCAL_PORT = 5000;

// Configuration production (à remplacer par ton URL Render/Railway/etc)
const PRODUCTION_API_URL = 'https://your-backend.onrender.com';

/**
 * Retourne l'URL de base de l'API selon l'environnement
 */
export function getApiBaseUrl(): string {
  // Production : utiliser l'URL de production
  if (isProduction && !isNative) {
    return PRODUCTION_API_URL;
  }

  // Développement sur device Android/iOS : utiliser IP locale
  if (isNative) {
    return `http://${LOCAL_IP}:${LOCAL_PORT}`;
  }

  // Développement web (localhost) : utiliser localhost
  return 'http://localhost:5000';
}

/**
 * Configuration API complète
 */
export const apiConfig = {
  baseUrl: getApiBaseUrl(),
  endpoints: {
    // Attractions
    attractions: '/api/attractions',
    attractionById: (id: string) => `/api/attractions/${id}`,
    
    // Audio Guides
    audioGuides: '/api/audioguides',
    audioGuideById: (id: string) => `/api/audioguides/${id}`,
    audioGuidesByAttraction: (attractionId: string) => `/api/audioguides/attraction/${attractionId}`,
    
    // Tours
    tours: '/api/tours',
    tourById: (id: string) => `/api/tours/${id}`,
    
    // Users
    users: '/api/users',
    userById: (id: string) => `/api/users/${id}`,
    
    // Health check
    health: '/api/health',
  },
  
  // Configuration réseau
  timeout: 30000, // 30 secondes
  retries: 3,
  retryDelay: 1000, // 1 seconde
  
  // Headers par défaut
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
};

/**
 * Construit l'URL complète pour un endpoint
 */
export function buildUrl(endpoint: string): string {
  const baseUrl = getApiBaseUrl();
  // Supprimer le slash final de baseUrl si présent
  const cleanBaseUrl = baseUrl.endsWith('/') ? baseUrl.slice(0, -1) : baseUrl;
  // Ajouter le slash initial à endpoint si absent
  const cleanEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
  return `${cleanBaseUrl}${cleanEndpoint}`;
}

/**
 * Vérifie si l'API est accessible
 */
export async function checkApiHealth(): Promise<boolean> {
  try {
    const response = await fetch(buildUrl(apiConfig.endpoints.health), {
      method: 'GET',
      headers: apiConfig.headers,
      signal: AbortSignal.timeout(5000), // 5 secondes max
    });
    
    if (!response.ok) {
      console.error('❌ API health check failed:', response.status);
      return false;
    }
    
    const data = await response.json();
    console.log('✅ API health check OK:', data);
    return data.status === 'ok';
  } catch (error) {
    console.error('❌ API health check error:', error);
    return false;
  }
}

/**
 * Informations de debug
 */
export function logApiConfig(): void {
  console.log('📡 API Configuration:');
  console.log('  Environment:', isProduction ? 'PRODUCTION' : 'DEVELOPMENT');
  console.log('  Platform:', platform);
  console.log('  Is Native:', isNative);
  console.log('  Base URL:', getApiBaseUrl());
  console.log('  Local IP:', LOCAL_IP);
  console.log('  Local Port:', LOCAL_PORT);
}

// Log automatique en développement
if (!isProduction) {
  logApiConfig();
}

export default apiConfig;
