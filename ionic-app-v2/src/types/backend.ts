/**
 * Types compatibles avec le backend API
 * Adaptation des types pour correspondre aux modèles MongoDB
 */

// ===== TYPES BACKEND =====

export interface OpeningHoursDay {
  open?: string;
  close?: string;
  closed?: boolean;
}

export interface OpeningHours {
  monday?: OpeningHoursDay;
  tuesday?: OpeningHoursDay;
  wednesday?: OpeningHoursDay;
  thursday?: OpeningHoursDay;
  friday?: OpeningHoursDay;
  saturday?: OpeningHoursDay;
  sunday?: OpeningHoursDay;
}

export interface BackendAudioGuide {
  _id: string;
  title: string;
  description?: string;
  audioUrl: string;
  duration: number; // Durée en secondes
  language: string;
  attractionId: string;
  thumbnailUrl?: string;
  status: 'active' | 'inactive';
  createdAt?: Date;
  updatedAt?: Date;
}

export interface BackendAttraction {
  _id: string;
  name: string;
  nameEn?: string;
  description: string;
  shortDescription?: string;
  category: string;
  type?: 'attraction' | 'tour'; // Type de lieu (attraction simple ou circuit touristique)
  city?: string; // Ville
  region?: string; // Région
  location: {
    type: 'Point';
    coordinates: [number, number]; // [longitude, latitude]
    address?: string;
  };
  images?: string[];
  audioGuides?: string[];
  rating?: number;
  visitCount?: number;
  status: 'active' | 'inactive';
  address?: string; // Adresse complète
  openingHours?: OpeningHours | string; // Object avec {monday: {open, close}, ...} ou string pour fallback
  phone?: string; // Numéro de téléphone
  website?: string; // Site web
  createdAt?: Date;
  updatedAt?: Date;
}

export interface BackendTour {
  _id: string;
  title: string;
  description?: string;
  duration: string;
  difficulty: 'easy' | 'moderate' | 'hard';
  attractions: string[];
  startPoint?: {
    type: 'Point';
    coordinates: [number, number];
  };
  endPoint?: {
    type: 'Point';
    coordinates: [number, number];
  };
  distance?: number;
  audioGuide?: string;
  images?: string[];
  rating?: number;
  status: 'active' | 'inactive';
  createdAt?: Date;
  updatedAt?: Date;
}

export interface BackendUser {
  _id: string;
  email: string;
  displayName: string;
  photoURL?: string;
  emailVerified: boolean;
  preferences: {
    language: 'fr' | 'en';
    theme: 'light' | 'dark' | 'auto';
    notifications: boolean;
    autoplay: boolean;
    audioQuality: 'low' | 'medium' | 'high';
  };
  createdAt?: Date;
  updatedAt?: Date;
}

// ===== TYPES API RESPONSES =====

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
  error?: string;
}

export interface PaginatedResponse<T> {
  success: boolean;
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}

export interface ApiError {
  success: false;
  error: string;
  message: string;
  statusCode: number;
}

// ===== TYPES FILTRES =====

export interface AudioGuideFilters {
  language?: string;
  attractionId?: string;
  status?: 'active' | 'inactive';
  search?: string;
  page?: number;
  limit?: number;
}

export interface AttractionFilters {
  category?: string;
  status?: 'active' | 'inactive';
  search?: string;
  near?: {
    longitude: number;
    latitude: number;
    maxDistance?: number; // en mètres
  };
  page?: number;
  limit?: number;
}

export interface TourFilters {
  difficulty?: 'easy' | 'moderate' | 'hard';
  status?: 'active' | 'inactive';
  search?: string;
  page?: number;
  limit?: number;
}

// ===== TYPES GPS =====

export interface GeoLocation {
  latitude: number;
  longitude: number;
  accuracy?: number;
  altitude?: number;
  altitudeAccuracy?: number;
  heading?: number;
  speed?: number;
  timestamp?: number;
}

export interface NearbyAttraction {
  attraction: BackendAttraction;
  distance: number; // en mètres
  bearing?: number; // angle en degrés
}

// ===== TYPES TÉLÉCHARGEMENT =====

export interface DownloadStatus {
  id: string;
  audioGuideId: string;
  progress: number; // 0-100
  status: 'pending' | 'downloading' | 'completed' | 'failed' | 'paused';
  audioUrl?: string;
  localPath?: string;
  error?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface DownloadQueue {
  items: DownloadStatus[];
  totalSize: number;
  downloadedSize: number;
  activeDownloads: number;
}

// ===== TYPES LECTURE AUDIO =====

export interface PlaybackState {
  audioGuideId: string;
  isPlaying: boolean;
  currentTime: number; // en secondes
  duration: number; // en secondes
  volume: number; // 0-1
  playbackRate: number; // 0.5-2.0
  isBuffering: boolean;
  isOffline: boolean;
}

export interface PlaybackHistory {
  audioGuideId: string;
  startTime: Date;
  endTime?: Date;
  lastPosition: number;
  completed: boolean;
  attractionId?: string;
}

// ===== TYPES FAVORIS =====

export interface Favorite {
  _id: string;
  userId: string;
  itemType: 'attraction' | 'audioguide' | 'tour';
  itemId: string;
  createdAt: Date;
}

// ===== TYPES STATISTIQUES =====

export interface UserStats {
  userId: string;
  totalListened: number;
  totalDuration: number; // en secondes
  visitedAttractions: string[];
  completedTours: string[];
  favorites: number;
  lastActivity: Date;
}

export interface AttractionStats {
  attractionId: string;
  views: number;
  audioPlays: number;
  favorites: number;
  averageRating: number;
  totalRatings: number;
}

// ===== TYPES NOTIFICATIONS =====

export interface Notification {
  _id: string;
  userId: string;
  type: 'info' | 'warning' | 'success' | 'error';
  title: string;
  message: string;
  read: boolean;
  actionUrl?: string;
  createdAt: Date;
}

// ===== UTILS =====

/**
 * Convertit un AudioGuide backend en format local
 */
export function mapBackendAudioGuide(backend: BackendAudioGuide) {
  return {
    id: backend._id,
    title: backend.title,
    description: backend.description || '',
    audioUrl: backend.audioUrl,
    duration: backend.duration || '0:00',
    language: backend.language,
    attractionId: backend.attractionId,
    thumbnailUrl: backend.thumbnailUrl || undefined,
    status: backend.status,
  };
}

/**
 * Convertit une Attraction backend en format local
 */
export function mapBackendAttraction(backend: BackendAttraction) {
  return {
    id: backend._id,
    name: backend.name,
    description: backend.description,
    category: backend.category,
    location: {
      longitude: backend.location.coordinates[0],
      latitude: backend.location.coordinates[1],
    },
    images: backend.images || [],
    rating: backend.rating || undefined,
    status: backend.status,
  };
}

/**
 * Formate une durée en secondes en format MM:SS
 */
export function formatDuration(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs.toString().padStart(2, '0')}`;
}

/**
 * Parse une durée au format MM:SS en secondes
 */
export function parseDuration(duration: string): number {
  const parts = duration.split(':');
  if (parts.length !== 2) return 0;
  const mins = parseInt(parts[0], 10) || 0;
  const secs = parseInt(parts[1], 10) || 0;
  return mins * 60 + secs;
}

/**
 * Calcule la distance entre deux points GPS (formule de Haversine)
 */
export function calculateDistance(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 6371e3; // Rayon de la Terre en mètres
  const φ1 = (lat1 * Math.PI) / 180;
  const φ2 = (lat2 * Math.PI) / 180;
  const Δφ = ((lat2 - lat1) * Math.PI) / 180;
  const Δλ = ((lon2 - lon1) * Math.PI) / 180;

  const a =
    Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
    Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return R * c;
}

/**
 * Formate une distance en texte lisible
 */
export function formatDistance(meters: number): string {
  if (meters < 1000) {
    return `${Math.round(meters)} m`;
  }
  return `${(meters / 1000).toFixed(1)} km`;
}
