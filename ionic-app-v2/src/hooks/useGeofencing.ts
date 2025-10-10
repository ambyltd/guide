/**
 * Hook React pour Geofencing
 * Gère la détection de proximité et les notifications automatiques
 */

import { useState, useEffect, useCallback } from 'react';
import { geolocationService, GeofenceRegion, Location } from '../services/geolocationService';
import { notificationService } from '../services/notificationService';

interface Attraction {
  _id: string;
  name: string;
  location: {
    coordinates: [number, number];
  };
}

interface GeofencingState {
  isActive: boolean;
  currentLocation: Location | null;
  nearbyAttractions: Attraction[];
  activeRegions: GeofenceRegion[];
}

interface UseGeofencingReturn {
  state: GeofencingState;
  startGeofencing: () => Promise<void>;
  stopGeofencing: () => void;
  checkProximity: (attractions: Attraction[]) => void;
}

/**
 * Hook pour gérer le geofencing et les notifications de proximité
 */
export const useGeofencing = (
  radius: number = 200 // Rayon par défaut en mètres
): UseGeofencingReturn => {
  const [state, setState] = useState<GeofencingState>({
    isActive: false,
    currentLocation: null,
    nearbyAttractions: [],
    activeRegions: [],
  });

  const [enteredRegions] = useState<Set<string>>(new Set());

  /**
   * Calculer la distance entre deux points (Haversine)
   */
  const calculateDistance = useCallback((
    lat1: number,
    lon1: number,
    lat2: number,
    lon2: number
  ): number => {
    const R = 6371e3; // Rayon de la Terre en mètres
    const φ1 = (lat1 * Math.PI) / 180;
    const φ2 = (lat2 * Math.PI) / 180;
    const Δφ = ((lat2 - lat1) * Math.PI) / 180;
    const Δλ = ((lon2 - lon1) * Math.PI) / 180;

    const a =
      Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
      Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

    return R * c; // Distance en mètres
  }, []);

  /**
   * Vérifier la proximité avec les attractions
   */
  const checkProximity = useCallback(
    (attractions: Attraction[]) => {
      if (!state.currentLocation || !state.isActive) return;

      const nearby: Attraction[] = [];
      const { latitude, longitude } = state.currentLocation;

      attractions.forEach((attraction) => {
        const [lng, lat] = attraction.location.coordinates;
        const distance = calculateDistance(latitude, longitude, lat, lng);

        // Si dans le rayon
        if (distance <= radius) {
          nearby.push(attraction);

          // Notification d'entrée si pas déjà notifié
          if (!enteredRegions.has(attraction._id)) {
            enteredRegions.add(attraction._id);
            notificationService.notifyGeofenceEnter(
              attraction.name,
              attraction._id
            );
            console.log(
              `📍 Entrée zone: ${attraction.name} (${Math.round(distance)}m)`
            );
          }
        } else {
          // Notification de sortie si était dans la zone
          if (enteredRegions.has(attraction._id)) {
            enteredRegions.delete(attraction._id);
            notificationService.notifyGeofenceExit(
              attraction.name,
              attraction._id
            );
            console.log(`🚪 Sortie zone: ${attraction.name}`);
          }
        }
      });

      setState((prev) => ({ ...prev, nearbyAttractions: nearby }));
    },
    [state.currentLocation, state.isActive, radius, calculateDistance, enteredRegions]
  );

  /**
   * Démarrer le geofencing
   */
  const startGeofencing = useCallback(async () => {
    try {
      // Initialiser les notifications
      const hasPermission = await notificationService.initialize();
      if (!hasPermission) {
        console.warn('⚠️ Permissions notifications non accordées');
        return;
      }

      // Démarrer le tracking de localisation
      const hasLocationPermission = await geolocationService.checkPermissions();
      if (!hasLocationPermission) {
        const granted = await geolocationService.requestPermissions();
        if (!granted) {
          console.error('❌ Permissions localisation refusées');
          return;
        }
      }

      // Obtenir position actuelle
      const location = await geolocationService.getCurrentLocation();
      setState((prev) => ({
        ...prev,
        isActive: true,
        currentLocation: location,
      }));

      console.log('✅ Geofencing démarré');
    } catch (error) {
      console.error('❌ Erreur démarrage geofencing:', error);
    }
  }, []);

  /**
   * Arrêter le geofencing
   */
  const stopGeofencing = useCallback(() => {
    setState((prev) => ({
      ...prev,
      isActive: false,
      nearbyAttractions: [],
    }));

    // Nettoyer les zones entrées
    enteredRegions.clear();

    console.log('🛑 Geofencing arrêté');
  }, [enteredRegions]);

  /**
   * Mettre à jour la position périodiquement
   */
  useEffect(() => {
    if (!state.isActive) return;

    const intervalId = setInterval(async () => {
      try {
        const location = await geolocationService.getCurrentLocation();
        setState((prev) => ({
          ...prev,
          currentLocation: location,
        }));
      } catch (error) {
        console.error('❌ Erreur mise à jour position:', error);
      }
    }, 10000); // Toutes les 10 secondes

    return () => clearInterval(intervalId);
  }, [state.isActive]);

  /**
   * Nettoyer au démontage
   */
  useEffect(() => {
    return () => {
      if (state.isActive) {
        stopGeofencing();
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return {
    state,
    startGeofencing,
    stopGeofencing,
    checkProximity,
  };
};

export default useGeofencing;
