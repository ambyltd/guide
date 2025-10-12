/**
 * Types pour les attractions et guides audio payants
 */

export interface PaidAttraction {
  id: string;
  title: string;
  description: string;
  shortDescription: string;
  category: string;
  location: {
    coordinates: [number, number];
    address: string;
    city: string;
  };
  pricing: {
    free: boolean;
    price?: number;
    currency: string;
    discountedPrice?: number;
  };
  audioGuide: {
    duration: string;
    language: string[];
    downloadUrl?: string;
    streamUrl?: string;
    fileSize?: string;
  };
  media: {
    images: string[];
    thumbnail: string;
    video?: string;
  };
  features: string[];
  rating: {
    average: number;
    count: number;
  };
  isPurchased: boolean;
  isDownloaded: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface AttractionsState {
  paidAttractions: PaidAttraction[];
  userPurchases: string[]; // IDs des attractions achetées
  downloads: Record<string, DownloadStatus>;
  isLoading: boolean;
  error: string | null;
}

export interface DownloadStatus {
  attractionId: string;
  status: 'pending' | 'downloading' | 'completed' | 'failed';
  progress: number;
  downloadedAt?: Date;
  filePath?: string;
}

export interface PurchaseRequest {
  attractionId: string;
  paymentMethod: 'card' | 'paypal' | 'apple_pay';
}

export interface DownloadRequest {
  attractionId: string;
  quality: 'standard' | 'high';
}