import React, { useEffect, useState, useRef, useMemo } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import { IonIcon } from '@ionic/react';
import { locateOutline, navigateCircleOutline } from 'ionicons/icons';
import './MapWithGeofencing.css';

// Types
interface GpsLocation {
  latitude: number;
  longitude: number;
}

interface AudioGuide {
  id?: string; // Optionnel pour compatibilité
  _id?: string; // Support BackendAudioGuide
  title: string;
  gpsLocation?: GpsLocation; // Optionnel pour compatibilité
  location?: { // Support BackendAudioGuide
    type: 'Point';
    coordinates: [number, number];
  };
  audioUrl: string;
  duration?: number;
  language: string;
}

interface Attraction {
  id?: string; // Optionnel pour compatibilité
  _id?: string; // Support BackendAttraction
  name: string;
  location: {
    coordinates: [number, number];
  };
  audioGuides?: AudioGuide[] | string[]; // Support BackendAttraction (string[]) et Attraction (AudioGuide[])
  type?: 'attraction' | 'circuit' | 'tour';
}

interface MapWithGeofencingProps {
  attraction: Attraction;
  audioGuides?: AudioGuide[]; // Support liste audioguides externe
  currentAudioGuide?: AudioGuide;
  onGeofenceTrigger?: (guide: AudioGuide) => void; // Passer l'audioguide complet au lieu de l'ID
  geofenceRadius?: number; // en mètres, défaut 50m
  style?: React.CSSProperties; // Support styles custom
}

const MAPBOX_TOKEN = import.meta.env.VITE_MAPBOX_TOKEN || 'pk.eyJ1IjoiYW1ieXRyYXZlbCIsImEiOiJjbTFtODdrcGQwMzJnMmtzN3p1aDJ5cWNkIn0.Q3QJCcbl2_5PLKL9nD0FHA';

const MapWithGeofencing: React.FC<MapWithGeofencingProps> = ({
  attraction,
  audioGuides: externalAudioGuides,
  currentAudioGuide,
  onGeofenceTrigger,
  geofenceRadius = 50,
  style
}) => {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const [userPosition, setUserPosition] = useState<GpsLocation | null>(null);
  const [triggeredGuides, setTriggeredGuides] = useState<Set<string>>(new Set());
  const [isTracking, setIsTracking] = useState(true);
  const watchIdRef = useRef<number | null>(null);
  const markersRef = useRef<mapboxgl.Marker[]>([]);

  // Audio guides du circuit (soit externe, soit de l'attraction)
  const audioGuides = useMemo(() => {
    return externalAudioGuides || attraction.audioGuides || [];
  }, [externalAudioGuides, attraction.audioGuides]);

  // Helper: Extraire coordonnées GPS d'un audioguide (support BackendAudioGuide et AudioGuide)
  const getCoordinates = (guide: AudioGuide): GpsLocation | null => {
    // Check old format (gpsLocation)
    if (guide.gpsLocation) {
      return guide.gpsLocation;
    }
    // Check new format (location.coordinates)
    if (guide.location?.coordinates) {
      const [lng, lat] = guide.location.coordinates;
      return { latitude: lat, longitude: lng };
    }
    return null;
  };

  // Calcul distance Haversine (en mètres)
  const calculateDistance = (pos1: GpsLocation, pos2: GpsLocation): number => {
    const R = 6371e3; // Rayon terre en mètres
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

  // Initialiser la map
  useEffect(() => {
    if (!mapContainer.current || map.current) return;

    mapboxgl.accessToken = MAPBOX_TOKEN;

    const [lng, lat] = attraction.location.coordinates;

    map.current = new mapboxgl.Map({
      container: mapContainer.current,
      style: 'mapbox://styles/mapbox/streets-v12',
      center: [lng, lat],
      zoom: audioGuides.length > 1 ? 13 : 15,
      pitch: 0,
      bearing: 0
    });

    map.current.addControl(new mapboxgl.NavigationControl(), 'top-right');

    return () => {
      if (map.current) {
        map.current.remove();
        map.current = null;
      }
    };
  }, [attraction.location.coordinates, audioGuides.length]);

  // Ajouter markers pour chaque audioguide
  useEffect(() => {
    if (!map.current || audioGuides.length === 0) return;

    // Supprimer anciens markers
    markersRef.current.forEach(marker => marker.remove());
    markersRef.current = [];

    // Créer marker pour chaque point
    audioGuides.forEach((guide, index) => {
      const coords = getCoordinates(guide);
      if (!coords) return;
      
      const el = document.createElement('div');
      el.className = 'custom-marker';
      
      const guideId = guide._id || guide.id || '';
      const currentId = currentAudioGuide?._id || currentAudioGuide?.id || '';
      
      // Marker actif si c'est le guide en cours
      if (currentAudioGuide && guideId === currentId) {
        el.classList.add('active');
      }
      
      // Marker complété si déjà déclenché
      if (triggeredGuides.has(guideId)) {
        el.classList.add('completed');
      }

      // Numéro du point
      el.innerHTML = `<span class="marker-number">${index + 1}</span>`;

      const marker = new mapboxgl.Marker(el)
        .setLngLat([coords.longitude, coords.latitude])
        .setPopup(
          new mapboxgl.Popup({ offset: 25 })
            .setHTML(`
              <div class="marker-popup">
                <h3>${guide.title}</h3>
                <p class="language">${guide.language === 'fr' ? '🇫🇷 Français' : '🇬🇧 English'}</p>
                ${guide.duration ? `<p class="duration">⏱️ ${Math.ceil(guide.duration / 60)} min</p>` : ''}
              </div>
            `)
        )
        .addTo(map.current!);

      markersRef.current.push(marker);
    });

    // Si circuit avec plusieurs points, dessiner la ligne
    if (audioGuides.length > 1 && map.current) {
      const coordinates = audioGuides
        .map(guide => getCoordinates(guide))
        .filter(coords => coords !== null)
        .map(coords => [coords!.longitude, coords!.latitude]);

      // Attendre que la map soit chargée
      if (map.current.isStyleLoaded()) {
        addRouteLayer(coordinates);
      } else {
        map.current.on('load', () => addRouteLayer(coordinates));
      }
    }

    // Ajuster bounds pour tout voir
    if (audioGuides.length > 1 && map.current) {
      const bounds = new mapboxgl.LngLatBounds();
      audioGuides.forEach(guide => {
        const coords = getCoordinates(guide);
        if (coords) {
          bounds.extend([coords.longitude, coords.latitude]);
        }
      });
      map.current.fitBounds(bounds, { padding: 50, maxZoom: 15 });
    }
  }, [audioGuides, currentAudioGuide, triggeredGuides]);

  // Ajouter ligne de circuit
  const addRouteLayer = (coordinates: number[][]) => {
    if (!map.current) return;

    // Supprimer layer existant
    if (map.current.getLayer('route')) {
      map.current.removeLayer('route');
    }
    if (map.current.getSource('route')) {
      map.current.removeSource('route');
    }

    // Ajouter nouvelle ligne
    map.current.addSource('route', {
      type: 'geojson',
      data: {
        type: 'Feature',
        properties: {},
        geometry: {
          type: 'LineString',
          coordinates
        }
      }
    });

    map.current.addLayer({
      id: 'route',
      type: 'line',
      source: 'route',
      layout: {
        'line-join': 'round',
        'line-cap': 'round'
      },
      paint: {
        'line-color': '#f97316',
        'line-width': 3,
        'line-opacity': 0.7,
        'line-dasharray': [2, 2]
      }
    });
  };

  // Geolocalisation temps réel
  useEffect(() => {
    if (!isTracking || audioGuides.length === 0) return;

    const options: PositionOptions = {
      enableHighAccuracy: true,
      timeout: 10000,
      maximumAge: 0
    };

    const successCallback = (position: GeolocationPosition) => {
      const newPosition: GpsLocation = {
        latitude: position.coords.latitude,
        longitude: position.coords.longitude
      };

      setUserPosition(newPosition);

      // Ajouter/Update marker utilisateur sur la map
      if (map.current) {
        const existingUserMarker = document.querySelector('.user-marker');
        if (existingUserMarker) {
          existingUserMarker.remove();
        }

        const userEl = document.createElement('div');
        userEl.className = 'user-marker';
        userEl.innerHTML = '<div class="user-marker-pulse"></div><div class="user-marker-dot"></div>';

        new mapboxgl.Marker(userEl)
          .setLngLat([newPosition.longitude, newPosition.latitude])
          .addTo(map.current);
      }

      // Check geofencing pour chaque audioguide
      audioGuides.forEach(guide => {
        const coords = getCoordinates(guide);
        if (!coords) return;
        
        const guideId = guide._id || guide.id || '';
        const distance = calculateDistance(newPosition, coords);

        console.log(`Distance to "${guide.title}": ${Math.round(distance)}m`);

        // Si distance < rayon ET pas encore déclenché
        if (distance < geofenceRadius && !triggeredGuides.has(guideId)) {
          console.log(`🎯 Geofence triggered for "${guide.title}"!`);
          
          // Marquer comme déclenché
          setTriggeredGuides(prev => new Set(prev).add(guideId));
          
          // Callback parent (passer l'audioguide complet)
          if (onGeofenceTrigger) {
            onGeofenceTrigger(guide);
          }
        }
      });
    };

    const errorCallback = (error: GeolocationPositionError) => {
      console.warn('Geolocation error:', error.message);
      
      // Fallback position (Abidjan centre)
      const fallbackPosition: GpsLocation = {
        latitude: 5.3600,
        longitude: -4.0083
      };
      setUserPosition(fallbackPosition);
    };

    // Watch position
    watchIdRef.current = navigator.geolocation.watchPosition(
      successCallback,
      errorCallback,
      options
    );

    // Cleanup
    return () => {
      if (watchIdRef.current !== null) {
        navigator.geolocation.clearWatch(watchIdRef.current);
        watchIdRef.current = null;
      }
    };
  }, [isTracking, audioGuides, geofenceRadius, triggeredGuides, onGeofenceTrigger]);

  // Toggle tracking
  const toggleTracking = () => {
    setIsTracking(prev => !prev);
  };

  // Center sur user
  const centerOnUser = () => {
    if (userPosition && map.current) {
      map.current.flyTo({
        center: [userPosition.longitude, userPosition.latitude],
        zoom: 16,
        duration: 1000
      });
    }
  };

  return (
    <div className="map-with-geofencing" style={style}>
      <div ref={mapContainer} className="map-container" />
      
      {/* Contrôles */}
      <div className="map-controls">
        {/* Bouton tracking */}
        <button
          className={`control-btn ${isTracking ? 'active' : ''}`}
          onClick={toggleTracking}
          title={isTracking ? 'Désactiver le suivi' : 'Activer le suivi'}
        >
          <IonIcon icon={navigateCircleOutline} />
        </button>

        {/* Bouton center sur user */}
        {userPosition && (
          <button
            className="control-btn"
            onClick={centerOnUser}
            title="Me localiser"
          >
            <IonIcon icon={locateOutline} />
          </button>
        )}
      </div>

      {/* Stats circuit */}
      {audioGuides.length > 1 && (
        <div className="circuit-stats">
          <span className="stat-label">Points visités :</span>
          <span className="stat-value">{triggeredGuides.size}/{audioGuides.length}</span>
        </div>
      )}

      {/* Info distance (si user position disponible et guide actif) */}
      {userPosition && currentAudioGuide && (() => {
        const coords = getCoordinates(currentAudioGuide);
        return coords ? (
          <div className="distance-info">
            <span className="distance-label">Distance :</span>
            <span className="distance-value">
              {Math.round(calculateDistance(userPosition, coords))}m
            </span>
          </div>
        ) : null;
      })()}
    </div>
  );
};

export default MapWithGeofencing;
