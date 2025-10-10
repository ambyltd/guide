/**
 * Service de géolocalisation avancé avec support Capacitor/Web
 * Gestion automatique du cache, des permissions et des erreurs
 * Architecture singleton pour optimiser les performances
 */

import { Capacitor } from '@capacitor/core';
import { Geolocation, type Position } from '@capacitor/geolocation';
import type {
  GeoLocation,
  LocationError,
  LocationErrorCode,
  LocationOptions,
} from '../types';

// ===== ÉNUMÉRATIONS =====
export const LocationErrorCodes = {
  PERMISSION_DENIED: 1,
  POSITION_UNAVAILABLE: 2,
  TIMEOUT: 3,
  UNKNOWN: 99,
} as const;

// ===== TYPES INTERNES =====
interface LocationCache {
  location: GeoLocation;
  timestamp: number;
  accuracy: number;
}

interface LocationWatcher {
  id: string;
  callback: (location: GeoLocation) => void;
  errorCallback?: (error: LocationError) => void;
  options?: LocationOptions;
}

// ===== CONFIGURATION =====
const DEFAULT_OPTIONS: Required<LocationOptions> = {
  enableHighAccuracy: true,
  timeout: 15000, // 15 secondes
  maximumAge: 5 * 60 * 1000, // 5 minutes
  useNativeAPI: true,
};

const CACHE_DURATION = 2 * 60 * 1000; // 2 minutes
const MIN_ACCURACY_METERS = 100; // Précision minimale acceptable
const MAX_RETRIES = 3;

// ===== UTILITAIRES =====
const createLocationError = (
  message: string,
  code: LocationErrorCode,
  originalError?: Error
): LocationError => {
  return Object.assign(new Error(message), {
    name: 'LocationError',
    code,
    isPermissionError: code === LocationErrorCodes.PERMISSION_DENIED,
    isTimeoutError: code === LocationErrorCodes.TIMEOUT,
    isUnavailableError: code === LocationErrorCodes.POSITION_UNAVAILABLE,
    originalError,
  }) as LocationError;
};

const mapCapacitorPosition = (position: Position): GeoLocation => {
  const baseLocation = {
    latitude: position.coords.latitude,
    longitude: position.coords.longitude,
    accuracy: position.coords.accuracy,
  };
  
  if (position.coords.altitude !== undefined && position.coords.altitude !== null) {
    return {
      ...baseLocation,
      altitude: position.coords.altitude,
    };
  }
  
  return baseLocation;
};

const mapWebPosition = (position: GeolocationPosition): GeoLocation => {
  const baseLocation = {
    latitude: position.coords.latitude,
    longitude: position.coords.longitude,
    accuracy: position.coords.accuracy,
  };
  
  if (position.coords.altitude !== null && position.coords.altitude !== undefined) {
    return {
      ...baseLocation,
      altitude: position.coords.altitude,
    };
  }
  
  return baseLocation;
};

const calculateDistance = (pos1: GeoLocation, pos2: GeoLocation): number => {
  const R = 6371e3; // Rayon de la Terre en mètres
  const φ1 = (pos1.latitude * Math.PI) / 180;
  const φ2 = (pos2.latitude * Math.PI) / 180;
  const Δφ = ((pos2.latitude - pos1.latitude) * Math.PI) / 180;
  const Δλ = ((pos2.longitude - pos1.longitude) * Math.PI) / 180;

  const a =
    Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
    Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return R * c; // Distance en mètres
};

const isLocationAccurate = (location: GeoLocation): boolean => {
  return (location.accuracy ?? Infinity) <= MIN_ACCURACY_METERS;
};

const isCacheValid = (cache: LocationCache | null): boolean => {
  if (!cache) return false;
  return Date.now() - cache.timestamp <= CACHE_DURATION;
};

// ===== SERVICE PRINCIPAL =====
export class LocationService {
  private static instance: LocationService | null = null;
  private cache: LocationCache | null = null;
  private watchers: Map<string, LocationWatcher> = new Map();
  private watchId: number | null = null;
  private isNativeAvailable: boolean = false;
  private permissionStatus: string = 'unknown';

  private constructor() {
    this.isNativeAvailable = Capacitor.isNativePlatform();
    this.initializePermissions();
  }

  public static getInstance(): LocationService {
    if (!LocationService.instance) {
      LocationService.instance = new LocationService();
    }
    return LocationService.instance;
  }

  // ===== INITIALISATION =====
  private async initializePermissions(): Promise<void> {
    try {
      if (this.isNativeAvailable) {
        const permission = await Geolocation.checkPermissions();
        this.permissionStatus = permission.location;
      } else if ('permissions' in navigator) {
        const permission = await navigator.permissions.query({ name: 'geolocation' });
        this.permissionStatus = permission.state;
      }
    } catch {
      this.permissionStatus = 'unknown';
    }
  }

  // ===== GESTION DES PERMISSIONS =====
  public async requestPermissions(): Promise<boolean> {
    try {
      if (this.isNativeAvailable) {
        const permission = await Geolocation.requestPermissions();
        this.permissionStatus = permission.location;
        return permission.location === 'granted';
      } else {
        // Pour le web, on utilise getCurrentPosition qui demande automatiquement
        await new Promise<GeolocationPosition>((resolve, reject) => {
          navigator.geolocation.getCurrentPosition(resolve, reject, {
            timeout: 5000,
          });
        });
        this.permissionStatus = 'granted';
        return true;
      }
    } catch {
      this.permissionStatus = 'denied';
      return false;
    }
  }

  public getPermissionStatus(): string {
    return this.permissionStatus;
  }

  // ===== GÉOLOCALISATION PRINCIPALE =====
  public async getCurrentPosition(options?: LocationOptions): Promise<GeoLocation> {
    const mergedOptions = { ...DEFAULT_OPTIONS, ...options };

    // Vérifier le cache en premier
    if (isCacheValid(this.cache) && !mergedOptions.enableHighAccuracy) {
      return this.cache!.location;
    }

    // Vérifier les permissions
    if (this.permissionStatus === 'denied') {
      throw createLocationError(
        'Permissions de géolocalisation refusées',
        LocationErrorCodes.PERMISSION_DENIED
      );
    }

    // Demander les permissions si nécessaire
    if (this.permissionStatus !== 'granted') {
      const hasPermission = await this.requestPermissions();
      if (!hasPermission) {
        throw createLocationError(
          'Permissions de géolocalisation refusées',
          LocationErrorCodes.PERMISSION_DENIED
        );
      }
    }

    // Obtenir la position avec retry
    return this.getPositionWithRetry(mergedOptions);
  }

  private async getPositionWithRetry(options: Required<LocationOptions>): Promise<GeoLocation> {
    let lastError: LocationError | null = null;

    for (let attempt = 0; attempt < MAX_RETRIES; attempt++) {
      try {
        const location = await this.getPositionOnce(options);
        
        
        // Mise à jour du cache avec une position précise
        if (isLocationAccurate(location)) {
          this.cache = {
            location,
            timestamp: Date.now(),
            accuracy: location.accuracy ?? 0,
          };
        }

        return location;
      } catch (error) {
        lastError = error as LocationError;
        
        // Ne pas retry sur certaines erreurs
        if (lastError.isPermissionError) {
          throw lastError;
        }

        // Attendre entre les tentatives
        if (attempt < MAX_RETRIES - 1) {
          await this.delay(1000 * (attempt + 1));
        }
      }
    }

    throw lastError || createLocationError(
      'Impossible d\'obtenir la position après plusieurs tentatives',
      LocationErrorCodes.UNKNOWN
    );
  }

  private async getPositionOnce(options: Required<LocationOptions>): Promise<GeoLocation> {
    if (this.isNativeAvailable && options.useNativeAPI) {
      return this.getCapacitorPosition(options);
    } else {
      return this.getWebPosition(options);
    }
  }

  private async getCapacitorPosition(options: Required<LocationOptions>): Promise<GeoLocation> {
    try {
      const position = await Geolocation.getCurrentPosition({
        enableHighAccuracy: options.enableHighAccuracy,
        timeout: options.timeout,
        maximumAge: options.maximumAge,
      });

      return mapCapacitorPosition(position);
    } catch (error) {
      throw this.mapError(error as Error);
    }
  }

  private async getWebPosition(options: Required<LocationOptions>): Promise<GeoLocation> {
    return new Promise<GeoLocation>((resolve, reject) => {
      if (!navigator.geolocation) {
        reject(createLocationError(
          'Géolocalisation non supportée par ce navigateur',
          LocationErrorCodes.POSITION_UNAVAILABLE
        ));
        return;
      }

      navigator.geolocation.getCurrentPosition(
        (position) => {
          resolve(mapWebPosition(position));
        },
        (error) => {
          reject(this.mapGeolocationError(error));
        },
        {
          enableHighAccuracy: options.enableHighAccuracy,
          timeout: options.timeout,
          maximumAge: options.maximumAge,
        }
      );
    });
  }

  // ===== SURVEILLANCE CONTINUE =====
  public startWatching(
    callback: (location: GeoLocation) => void,
    errorCallback?: (error: LocationError) => void,
    options?: LocationOptions
  ): string {
    const watcherId = `watch_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const mergedOptions = { ...DEFAULT_OPTIONS, ...options };

    const watcher: LocationWatcher = {
      id: watcherId,
      callback,
      options: mergedOptions,
    };

    if (errorCallback) {
      watcher.errorCallback = errorCallback;
    }

    this.watchers.set(watcherId, watcher);

    // Démarrer la surveillance si c'est le premier watcher
    if (this.watchers.size === 1) {
      this.startNativeWatching(mergedOptions);
    }

    // Envoyer immédiatement la position cachée si disponible
    if (isCacheValid(this.cache)) {
      setTimeout(() => callback(this.cache!.location), 0);
    }

    return watcherId;
  }

  private async startNativeWatching(options: Required<LocationOptions>): Promise<void> {
    try {
      if (this.isNativeAvailable && options.useNativeAPI) {
        const watchResult = await Geolocation.watchPosition(
          {
            enableHighAccuracy: options.enableHighAccuracy,
            timeout: options.timeout,
          },
          (position) => {
            if (position) {
              const location = mapCapacitorPosition(position);
              this.handleNewLocation(location);
            }
          }
        );
        this.watchId = Number(watchResult);
      } else {
        this.watchId = navigator.geolocation.watchPosition(
          (position) => {
            const location = mapWebPosition(position);
            this.handleNewLocation(location);
          },
          (error) => {
            const locationError = this.mapGeolocationError(error);
            this.handleWatchError(locationError);
          },
          {
            enableHighAccuracy: options.enableHighAccuracy,
            timeout: options.timeout,
          }
        );
      }
    } catch (error) {
      const locationError = this.mapError(error as Error);
      this.handleWatchError(locationError);
    }
  }

  private handleNewLocation(location: GeoLocation): void {
    // Mettre à jour le cache
    if (isLocationAccurate(location)) {
      this.cache = {
        location,
        timestamp: Date.now(),
        accuracy: location.accuracy ?? 0,
      };
    }

    // Notifier tous les watchers
    this.watchers.forEach((watcher) => {
      try {
        watcher.callback(location);
      } catch (error) {
        console.error('Erreur dans callback de géolocalisation:', error);
      }
    });
  }

  private handleWatchError(error: LocationError): void {
    this.watchers.forEach((watcher) => {
      if (watcher.errorCallback) {
        try {
          watcher.errorCallback(error);
        } catch (callbackError) {
          console.error('Erreur dans callback d\'erreur de géolocalisation:', callbackError);
        }
      }
    });
  }

  public stopWatching(watcherId: string): boolean {
    const removed = this.watchers.delete(watcherId);

    // Arrêter la surveillance native si plus de watchers
    if (this.watchers.size === 0 && this.watchId !== null) {
      if (this.isNativeAvailable) {
        Geolocation.clearWatch({ id: this.watchId.toString() });
      } else {
        navigator.geolocation.clearWatch(this.watchId);
      }
      this.watchId = null;
    }

    return removed;
  }

  public stopAllWatching(): void {
    const watcherIds = Array.from(this.watchers.keys());
    watcherIds.forEach((id) => this.stopWatching(id));
  }

  // ===== UTILITAIRES =====
  public calculateDistanceTo(targetLocation: GeoLocation): Promise<number> {
    return this.getCurrentPosition().then((currentLocation) =>
      calculateDistance(currentLocation, targetLocation)
    );
  }

  public clearCache(): void {
    this.cache = null;
  }

  public getCachedLocation(): GeoLocation | null {
    return isCacheValid(this.cache) ? this.cache!.location : null;
  }

  // ===== GESTION D'ERREURS =====
  private mapError(error: Error): LocationError {
    return createLocationError(
      error.message || 'Erreur de géolocalisation inconnue',
      LocationErrorCodes.UNKNOWN,
      error
    );
  }

  private mapGeolocationError(error: GeolocationPositionError): LocationError {
    switch (error.code) {
      case error.PERMISSION_DENIED:
        return createLocationError(
          'Permissions de géolocalisation refusées',
          LocationErrorCodes.PERMISSION_DENIED
        );
      case error.POSITION_UNAVAILABLE:
        return createLocationError(
          'Position non disponible',
          LocationErrorCodes.POSITION_UNAVAILABLE
        );
      case error.TIMEOUT:
        return createLocationError(
          'Délai de géolocalisation dépassé',
          LocationErrorCodes.TIMEOUT
        );
      default:
        return createLocationError(
          'Erreur de géolocalisation inconnue',
          LocationErrorCodes.UNKNOWN
        );
    }
  }

  private delay(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  // ===== INFORMATIONS =====
  public getStatus(): {
    hasCache: boolean;
    cacheAge?: number;
    watchersCount: number;
    isWatching: boolean;
  } {
    const result: {
      hasCache: boolean;
      cacheAge?: number;
      watchersCount: number;
      isWatching: boolean;
    } = {
      hasCache: this.cache !== null,
      watchersCount: this.watchers.size,
      isWatching: this.watchId !== null,
    };

    if (this.cache) {
      result.cacheAge = Date.now() - this.cache.timestamp;
    }

    return result;
  }
}

// ===== EXPORT SINGLETON =====
export const locationService = LocationService.getInstance();
export default locationService;