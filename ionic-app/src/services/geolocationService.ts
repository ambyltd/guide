import { Geolocation } from '@capacitor/geolocation';
import { apiClient } from './apiClient';
import type { AttractionRef, EventPayload } from '../types/shared';

export interface Location {
  latitude: number;
  longitude: number;
  accuracy?: number;
  altitude?: number | undefined;
  altitudeAccuracy?: number | undefined;
  heading?: number | undefined;
  speed?: number | undefined;
  timestamp: number;
}

export interface GeofenceRegion {
  id: string;
  latitude: number;
  longitude: number;
  radius: number; // in meters
  attractionId?: string;
  audioGuideId?: string;
  triggers: GeofenceTrigger[];
  active: boolean;
}

export interface GeofenceTrigger {
  event: 'enter' | 'exit' | 'dwell';
  action: 'play_audio' | 'show_notification' | 'track_visit' | 'offer_download';
  payload?: Record<string, unknown>;
  dwellTime?: number; // for dwell events, in milliseconds
}

export interface LocationUpdate {
  location: Location;
  triggeredRegions: GeofenceRegion[];
  nearbyAttractions: AttractionRef[];
  suggestedActions: string[];
}

export interface LocationSettings {
  enableHighAccuracy: boolean;
  maximumAge: number;
  timeout: number;
  enableBackgroundTracking: boolean;
  geofenceEnabled: boolean;
  trackingInterval: number; // in milliseconds
  batteryOptimization: boolean;
}

/**
 * Advanced geolocation service with geofencing and intelligent tracking
 */
class GeolocationService {
  private currentLocation: Location | null = null;
  private watchId: string | null = null;
  private geofenceRegions: GeofenceRegion[] = [];
  private locationUpdateCallbacks = new Set<(update: LocationUpdate) => void>();
  private isTracking = false;
  private trackingInterval: number | null = null;
  private lastLocationUpdate = 0;
  
  private settings: LocationSettings = {
    enableHighAccuracy: false, // Désactivé pour dev/indoor - moins précis mais plus rapide
    maximumAge: 60000, // 60 seconds - accepter des positions un peu plus anciennes
    timeout: 30000, // 30 seconds - timeout plus long pour éviter les erreurs
    enableBackgroundTracking: false,
    geofenceEnabled: true,
    trackingInterval: 5000, // 5 seconds
    batteryOptimization: true
  };

  constructor() {
    this.loadGeofenceRegions();
  }

  /**
   * Request location permissions
   */
  async requestPermissions(): Promise<boolean> {
    try {
      const permissions = await Geolocation.requestPermissions();
      return permissions.location === 'granted';
    } catch (error) {
      console.error('Location permission request failed:', error);
      return false;
    }
  }

  /**
   * Check if location permissions are granted
   */
  async checkPermissions(): Promise<boolean> {
    try {
      const permissions = await Geolocation.checkPermissions();
      return permissions.location === 'granted';
    } catch (error) {
      console.error('Location permission check failed:', error);
      return false;
    }
  }

  /**
   * Get current location with fallback to default location (Abidjan, Côte d'Ivoire)
   */
  async getCurrentLocation(): Promise<Location> {
    try {
      const position = await Geolocation.getCurrentPosition({
        enableHighAccuracy: this.settings.enableHighAccuracy,
        timeout: this.settings.timeout,
        maximumAge: this.settings.maximumAge
      });

      const location: Location = {
        latitude: position.coords.latitude,
        longitude: position.coords.longitude,
        accuracy: position.coords.accuracy,
        altitude: position.coords.altitude || undefined,
        altitudeAccuracy: position.coords.altitudeAccuracy || undefined,
        heading: position.coords.heading || undefined,
        speed: position.coords.speed || undefined,
        timestamp: position.timestamp
      };

      this.currentLocation = location;
      return location;
    } catch (error) {
      console.warn('Failed to get current location, using fallback (Abidjan):', error);
      
      // Fallback: Centre d'Abidjan, Côte d'Ivoire
      const fallbackLocation: Location = {
        latitude: 5.3599517,
        longitude: -4.0082563,
        accuracy: 1000, // 1km accuracy
        timestamp: Date.now()
      };
      
      this.currentLocation = fallbackLocation;
      return fallbackLocation;
    }
  }

  /**
   * Start location tracking with intelligent updates
   */
  async startTracking(): Promise<void> {
    if (this.isTracking) return;

    const hasPermission = await this.checkPermissions();
    if (!hasPermission) {
      const granted = await this.requestPermissions();
      if (!granted) {
        throw new Error('Location permission required for tracking');
      }
    }

    try {
      this.watchId = await Geolocation.watchPosition(
        {
          enableHighAccuracy: this.settings.enableHighAccuracy,
          timeout: this.settings.timeout,
          maximumAge: this.settings.maximumAge
        },
        (position) => {
          if (position) {
            this.handleLocationUpdate({
              latitude: position.coords.latitude,
              longitude: position.coords.longitude,
              accuracy: position.coords.accuracy,
              altitude: position.coords.altitude || undefined,
              altitudeAccuracy: position.coords.altitudeAccuracy || undefined,
              heading: position.coords.heading || undefined,
              speed: position.coords.speed || undefined,
              timestamp: position.timestamp
            });
          }
        }
      );

      this.isTracking = true;
      console.log('🌍 Location tracking started');

      // Start intelligent tracking interval
      if (this.settings.trackingInterval > 0) {
        this.trackingInterval = window.setInterval(() => {
          this.performIntelligentUpdate();
        }, this.settings.trackingInterval);
      }
    } catch (error) {
      console.error('Failed to start location tracking:', error);
      throw error;
    }
  }

  /**
   * Stop location tracking
   */
  async stopTracking(): Promise<void> {
    if (!this.isTracking) return;

    try {
      if (this.watchId) {
        await Geolocation.clearWatch({ id: this.watchId });
        this.watchId = null;
      }

      if (this.trackingInterval) {
        clearInterval(this.trackingInterval);
        this.trackingInterval = null;
      }

      this.isTracking = false;
      console.log('🌍 Location tracking stopped');
    } catch (error) {
      console.error('Failed to stop location tracking:', error);
    }
  }

  /**
   * Handle location updates with geofencing and intelligence
   */
  private async handleLocationUpdate(location: Location): Promise<void> {
    this.currentLocation = location;
    this.lastLocationUpdate = Date.now();

    // Check geofences
    const triggeredRegions = this.checkGeofences(location);

    // Get nearby attractions
    const nearbyAttractions = await this.getNearbyAttractions(location);

    // Generate suggested actions
    const suggestedActions = this.generateSuggestedActions(location, triggeredRegions, nearbyAttractions);

    // Create location update
    const locationUpdate: LocationUpdate = {
      location,
      triggeredRegions,
      nearbyAttractions,
      suggestedActions
    };

    // Notify callbacks
    this.locationUpdateCallbacks.forEach(callback => {
      try {
        callback(locationUpdate);
      } catch (error) {
        console.error('Location update callback error:', error);
      }
    });

    // Track location for analytics
    this.trackLocationUpdate(location);
  }

  /**
   * Perform intelligent location update based on context
   */
  private async performIntelligentUpdate(): Promise<void> {
    if (!this.isTracking) return;

    try {
      // Adjust update frequency based on movement
      const timeSinceLastUpdate = Date.now() - this.lastLocationUpdate;
      
      if (this.settings.batteryOptimization) {
        // Reduce frequency if stationary
        if (this.currentLocation && this.isUserStationary()) {
          if (timeSinceLastUpdate < 30000) { // Don't update more than every 30s when stationary
            return;
          }
        }
      }

      await this.getCurrentLocation();
    } catch (error) {
      console.warn('Intelligent location update failed:', error);
    }
  }

  /**
   * Check if user appears to be stationary
   */
  private isUserStationary(): boolean {
    if (!this.currentLocation || !this.currentLocation.speed) return false;
    return this.currentLocation.speed < 1; // Less than 1 m/s
  }

  /**
   * Check geofences for triggers
   */
  private checkGeofences(location: Location): GeofenceRegion[] {
    if (!this.settings.geofenceEnabled) return [];

    const triggeredRegions: GeofenceRegion[] = [];

    this.geofenceRegions.forEach(region => {
      if (!region.active) return;

      const distance = this.calculateDistance(
        location.latitude,
        location.longitude,
        region.latitude,
        region.longitude
      );

      if (distance <= region.radius) {
        triggeredRegions.push(region);
        this.handleGeofenceTrigger(region, 'enter', location);
      }
    });

    return triggeredRegions;
  }

  /**
   * Handle geofence trigger events
   */
  private handleGeofenceTrigger(region: GeofenceRegion, event: 'enter' | 'exit' | 'dwell', location: Location): void {
    region.triggers.forEach(trigger => {
      if (trigger.event === event) {
        console.log(`🎯 Geofence triggered: ${region.id} - ${trigger.action}`);
        
        switch (trigger.action) {
          case 'play_audio':
            this.triggerAudioPlay(trigger.payload || {});
            break;
          case 'show_notification':
            this.showNotification(trigger.payload || {});
            break;
          case 'track_visit':
            this.trackVisit(region, location);
            break;
          case 'offer_download':
            this.offerDownload(trigger.payload || {});
            break;
        }
      }
    });
  }

  /**
   * Calculate distance between two points in meters
   */
  private calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
    const R = 6371e3; // Earth's radius in meters
    const φ1 = lat1 * Math.PI / 180;
    const φ2 = lat2 * Math.PI / 180;
    const Δφ = (lat2 - lat1) * Math.PI / 180;
    const Δλ = (lon2 - lon1) * Math.PI / 180;

    const a = Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
              Math.cos(φ1) * Math.cos(φ2) *
              Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

    return R * c;
  }

  /**
   * Get nearby attractions from API
   */
  private async getNearbyAttractions(location: Location): Promise<AttractionRef[]> {
    try {
      const response = await apiClient.get<AttractionRef[]>(
        `/attractions/nearby?lat=${location.latitude}&lng=${location.longitude}&radius=1000`
      );
      return response.data;
    } catch (error) {
      console.warn('Failed to get nearby attractions:', error);
      return [];
    }
  }

  /**
   * Generate suggested actions based on context
   */
  private generateSuggestedActions(
    location: Location, 
    triggeredRegions: GeofenceRegion[], 
    nearbyAttractions: AttractionRef[]
  ): string[] {
    const actions: string[] = [];

    if (triggeredRegions.length > 0) {
      actions.push('Audio guide available for this location');
    }

    if (nearbyAttractions.length > 0) {
      actions.push(`${nearbyAttractions.length} attractions nearby`);
    }

    if (location.accuracy && location.accuracy > 50) {
      actions.push('Move to open area for better GPS accuracy');
    }

    return actions;
  }

  /**
   * Load geofence regions from storage or API
   */
  private async loadGeofenceRegions(): Promise<void> {
    try {
      // First try to load from local storage
      const stored = localStorage.getItem('geofence_regions');
      if (stored) {
        this.geofenceRegions = JSON.parse(stored);
      }

      // Then sync with server
      await this.syncGeofenceRegions();
    } catch (error) {
      console.warn('Failed to load geofence regions:', error);
    }
  }

  /**
   * Sync geofence regions with server
   */
  private async syncGeofenceRegions(): Promise<void> {
    try {
      const response = await apiClient.get<GeofenceRegion[]>('/geofences');
      this.geofenceRegions = response.data;
      
      // Store locally
      localStorage.setItem('geofence_regions', JSON.stringify(this.geofenceRegions));
    } catch (error) {
      console.warn('Failed to sync geofence regions:', error);
    }
  }

  /**
   * Track location update for analytics
   */
  private trackLocationUpdate(location: Location): void {
    // Send to analytics (fire and forget)
    apiClient.post('/analytics/location', {
      location,
      timestamp: Date.now(),
      sessionId: this.getSessionId()
    }).catch(() => {
      // Ignore analytics errors
    });
  }

  /**
   * Trigger action handlers
   */
  private triggerAudioPlay(payload: EventPayload): void {
    // This would trigger the audio service
    console.log('🎵 Triggering audio play:', payload);
  }

  private showNotification(payload: EventPayload): void {
    // This would show a notification
    console.log('🔔 Showing notification:', payload);
  }

  private trackVisit(region: GeofenceRegion, location: Location): void {
    apiClient.post('/analytics/visit', {
      regionId: region.id,
      attractionId: region.attractionId,
      location,
      timestamp: Date.now()
    }).catch(() => {
      // Ignore analytics errors
    });
  }

  private offerDownload(payload: EventPayload): void {
    // This would trigger download offer UI
    console.log('💾 Offering download:', payload);
  }

  private getSessionId(): string {
    return localStorage.getItem('session_id') || 'anonymous';
  }

  // Public API methods
  getCurrentPosition(): Location | null {
    return this.currentLocation;
  }

  isLocationTracking(): boolean {
    return this.isTracking;
  }

  addLocationUpdateCallback(callback: (update: LocationUpdate) => void): void {
    this.locationUpdateCallbacks.add(callback);
  }

  removeLocationUpdateCallback(callback: (update: LocationUpdate) => void): void {
    this.locationUpdateCallbacks.delete(callback);
  }

  updateSettings(newSettings: Partial<LocationSettings>): void {
    this.settings = { ...this.settings, ...newSettings };
  }

  getSettings(): LocationSettings {
    return { ...this.settings };
  }

  addGeofenceRegion(region: GeofenceRegion): void {
    this.geofenceRegions.push(region);
    localStorage.setItem('geofence_regions', JSON.stringify(this.geofenceRegions));
  }

  removeGeofenceRegion(regionId: string): void {
    this.geofenceRegions = this.geofenceRegions.filter(r => r.id !== regionId);
    localStorage.setItem('geofence_regions', JSON.stringify(this.geofenceRegions));
  }

  getGeofenceRegions(): GeofenceRegion[] {
    return [...this.geofenceRegions];
  }
}

// Export singleton instance
export const geolocationService = new GeolocationService();
export default GeolocationService;