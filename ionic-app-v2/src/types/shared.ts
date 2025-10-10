// Shared types for the application

// Analytics types
export interface AnalyticsStats {
  totalVisits: number;
  averageRating: number;
  popularTimes: Record<string, number>;
  demographics: {
    ageGroups: Record<string, number>;
    languages: Record<string, number>;
    countries: Record<string, number>;
  };
  engagement: {
    averageDuration: number;
    completionRate: number;
    downloadCount: number;
  };
}

// Review types
export interface Review {
  id: string;
  userId: string;
  userName: string;
  rating: number;
  comment: string;
  helpful: number;
  reported: boolean;
  createdAt: string;
  updatedAt: string;
}

// Geofence payload types
export interface AudioPlayPayload {
  audioGuideId: string;
  autoPlay?: boolean;
  volume?: number;
}

export interface NotificationPayload {
  title: string;
  message: string;
  icon?: string;
  actions?: Array<{
    id: string;
    title: string;
    action: string;
  }>;
}

export interface DownloadOfferPayload {
  audioGuideId: string;
  title: string;
  description: string;
  fileSize: number;
  estimatedDownloadTime: number;
}

// Form data type for uploads
export interface FormDataLike {
  append(name: string, value: string | Blob | File): void;
  delete(name: string): void;
  get(name: string): FormDataEntryValue | null;
  getAll(name: string): FormDataEntryValue[];
  has(name: string): boolean;
  set(name: string, value: string | Blob | File): void;
}

// Generic payload type for flexible events
export type EventPayload = AudioPlayPayload | NotificationPayload | DownloadOfferPayload | Record<string, unknown>;

// Attraction reference type (lightweight)
export interface AttractionRef {
  id: string;
  name: string;
  category: string;
  distance?: number;
}

// Upload response types
export interface ImageUploadResponse {
  urls: string[];
  totalSize: number;
}

export interface AudioUploadResponse {
  fileUrl: string;
  duration: number;
  fileSize: number;
  format: string;
}

// Error types for better error handling
export interface ValidationError {
  field: string;
  message: string;
  code: string;
}

export interface ServiceError {
  type: 'network' | 'validation' | 'permission' | 'server' | 'unknown';
  message: string;
  details?: Record<string, unknown>;
}