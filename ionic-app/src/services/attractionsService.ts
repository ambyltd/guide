import { apiClient, type ApiResponse } from './apiClient';
import type { Review, ImageUploadResponse, AnalyticsStats } from '../types/shared';

// Types
export interface Attraction {
  id: string;
  name: string;
  description: string;
  location: {
    latitude: number;
    longitude: number;
    address: string;
    city: string;
    region: string;
  };
  images: string[];
  category: string;
  rating: number;
  reviews: number;
  active: boolean;
  audioGuides: string[];
  openingHours?: {
    monday?: string;
    tuesday?: string;
    wednesday?: string;
    thursday?: string;
    friday?: string;
    saturday?: string;
    sunday?: string;
  };
  ticketPrice?: {
    adult: number;
    child: number;
    student: number;
  };
  accessibility?: string[];
  languages?: string[];
  duration?: number; // in minutes
  difficulty?: 'easy' | 'moderate' | 'hard';
  tags?: string[];
  createdAt: string;
  updatedAt: string;
}

export interface AttractionFilters {
  category?: string;
  city?: string;
  region?: string;
  rating?: number;
  priceRange?: [number, number];
  accessibility?: string[];
  languages?: string[];
  active?: boolean;
  tags?: string[];
  search?: string;
  sortBy?: 'name' | 'rating' | 'reviews' | 'distance' | 'price';
  sortOrder?: 'asc' | 'desc';
  page?: number;
  limit?: number;
}

export interface CreateAttractionData {
  name: string;
  description: string;
  location: {
    latitude: number;
    longitude: number;
    address: string;
    city: string;
    region: string;
  };
  category: string;
  images?: string[];
  openingHours?: Attraction['openingHours'];
  ticketPrice?: Attraction['ticketPrice'];
  accessibility?: string[];
  languages?: string[];
  duration?: number;
  difficulty?: Attraction['difficulty'];
  tags?: string[];
}

export interface UpdateAttractionData extends Partial<CreateAttractionData> {
  active?: boolean;
  rating?: number;
  reviews?: number;
}

/**
 * Service for managing attractions
 */
class AttractionsService {
  private readonly basePath = '/attractions';

  /**
   * Get all attractions with optional filtering
   */
  async getAttractions(filters?: AttractionFilters): Promise<ApiResponse<Attraction[]>> {
    const params = new URLSearchParams();
    
    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          if (Array.isArray(value)) {
            params.append(key, value.join(','));
          } else if (key === 'priceRange') {
            params.append('minPrice', value[0].toString());
            params.append('maxPrice', value[1].toString());
          } else {
            params.append(key, value.toString());
          }
        }
      });
    }

    const queryString = params.toString();
    const endpoint = queryString ? `${this.basePath}?${queryString}` : this.basePath;
    
    return apiClient.get<Attraction[]>(endpoint, { cache: true });
  }

  /**
   * Get single attraction by ID
   */
  async getAttraction(id: string): Promise<ApiResponse<Attraction>> {
    return apiClient.get<Attraction>(`${this.basePath}/${id}`, { cache: true });
  }

  /**
   * Search attractions by location proximity
   */
  async getAttractionsByLocation(
    latitude: number, 
    longitude: number, 
    radius: number = 10000 // meters
  ): Promise<ApiResponse<Attraction[]>> {
    const params = new URLSearchParams({
      lat: latitude.toString(),
      lng: longitude.toString(),
      radius: radius.toString()
    });

    return apiClient.get<Attraction[]>(`${this.basePath}/nearby?${params}`, { cache: true });
  }

  /**
   * Get attraction categories
   */
  async getCategories(): Promise<ApiResponse<string[]>> {
    return apiClient.get<string[]>(`${this.basePath}/categories`, { cache: true });
  }

  /**
   * Create new attraction (admin)
   */
  async createAttraction(data: CreateAttractionData): Promise<ApiResponse<Attraction>> {
    return apiClient.post<Attraction>(this.basePath, data);
  }

  /**
   * Update attraction (admin)
   */
  async updateAttraction(id: string, data: UpdateAttractionData): Promise<ApiResponse<Attraction>> {
    return apiClient.put<Attraction>(`${this.basePath}/${id}`, data);
  }

  /**
   * Delete attraction (admin)
   */
  async deleteAttraction(id: string): Promise<ApiResponse<void>> {
    return apiClient.delete<void>(`${this.basePath}/${id}`);
  }

  /**
   * Upload attraction images
   */
  async uploadImages(_attractionId: string, images: File[]): Promise<ApiResponse<ImageUploadResponse>> {
    const formData = new FormData();
    images.forEach((image, index) => {
      formData.append(`image_${index}`, image);
    });

    // Note: This would need special handling for FormData
    // TODO: Implement proper FormData support in apiClient
    throw new Error('Image upload not yet implemented');
    // return apiClient.request<ImageUploadResponse>(`${this.basePath}/${attractionId}/images`, {
    //   method: 'POST',
    //   body: formData as FormDataLike, // FormData handling would need to be added to apiClient
    //   headers: {} // Remove Content-Type to let browser set it for FormData
    // });
  }

  /**
   * Rate an attraction
   */
  async rateAttraction(id: string, rating: number, review?: string): Promise<ApiResponse<void>> {
    return apiClient.post<void>(`${this.basePath}/${id}/rate`, { rating, review });
  }

  /**
   * Get attraction reviews
   */
  async getAttractionReviews(
    id: string, 
    page: number = 1, 
    limit: number = 20
  ): Promise<ApiResponse<Review[]>> {
    return apiClient.get<Review[]>(`${this.basePath}/${id}/reviews?page=${page}&limit=${limit}`);
  }

  /**
   * Get attraction statistics (admin)
   */
  async getAttractionStats(id: string): Promise<ApiResponse<AnalyticsStats>> {
    return apiClient.get<AnalyticsStats>(`${this.basePath}/${id}/stats`);
  }

  /**
   * Toggle attraction active status (admin)
   */
  async toggleAttractionStatus(id: string): Promise<ApiResponse<Attraction>> {
    return apiClient.patch<Attraction>(`${this.basePath}/${id}/toggle-status`);
  }

  /**
   * Get popular attractions
   */
  async getPopularAttractions(limit: number = 10): Promise<ApiResponse<Attraction[]>> {
    return apiClient.get<Attraction[]>(`${this.basePath}/popular?limit=${limit}`, { cache: true });
  }

  /**
   * Get recently added attractions
   */
  async getRecentAttractions(limit: number = 10): Promise<ApiResponse<Attraction[]>> {
    return apiClient.get<Attraction[]>(`${this.basePath}/recent?limit=${limit}`, { cache: true });
  }

  /**
   * Search attractions with advanced text search
   */
  async searchAttractions(
    query: string, 
    filters?: Omit<AttractionFilters, 'search'>
  ): Promise<ApiResponse<Attraction[]>> {
    const params = new URLSearchParams({ q: query });
    
    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          if (Array.isArray(value)) {
            params.append(key, value.join(','));
          } else {
            params.append(key, value.toString());
          }
        }
      });
    }

    return apiClient.get<Attraction[]>(`${this.basePath}/search?${params}`, { cache: true });
  }
}

// Export singleton instance
export const attractionsService = new AttractionsService();
export default AttractionsService;