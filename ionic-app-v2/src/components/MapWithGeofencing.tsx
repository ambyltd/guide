import React, { useEffect, useState, useRef, useMemo } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polyline, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { IonIcon } from '@ionic/react';
import { locateOutline, navigateCircleOutline } from 'ionicons/icons';
import './MapWithGeofencing.css';

// Fix pour les icônes Leaflet
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

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

// Composant helper pour contrôler la map Leaflet
const MapController: React.FC<{
  bounds?: L.LatLngBounds;
  center?: [number, number];
  zoom?: number;
}> = ({ bounds, center, zoom }) => {
  const map = useMap();

  useEffect(() => {
    if (bounds) {
      map.fitBounds(bounds, { padding: [50, 50], maxZoom: 15 });
    } else if (center && zoom) {
      map.setView(center, zoom);
    }
  }, [map, bounds, center, zoom]);

  return null;
};

const MapWithGeofencing: React.FC<MapWithGeofencingProps> = ({
  attraction,
  audioGuides: externalAudioGuides,
  currentAudioGuide,
  onGeofenceTrigger,
  geofenceRadius = 50,
  style
}) => {
  // States pour Leaflet (pas de refs DOM nécessaires avec MapContainer)
  const [userPosition, setUserPosition] = useState<GpsLocation | null>(null);
  const [triggeredGuides, setTriggeredGuides] = useState<Set<string>>(new Set());
  const [isTracking, setIsTracking] = useState(true);
  const [mapCenter, setMapCenter] = useState<[number, number]>(() => {
    const [lng, lat] = attraction.location.coordinates;
    return [lat, lng]; // Leaflet utilise [lat, lng]
  });
  const [mapZoom, setMapZoom] = useState<number>(15);
  const [mapBounds, setMapBounds] = useState<L.LatLngBounds | undefined>(undefined);
  const watchIdRef = useRef<number | null>(null);

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

  // Calculer les bounds si plusieurs audioguides
  useEffect(() => {
    if (audioGuides.length > 1) {
      const bounds = L.latLngBounds([]);
      audioGuides.forEach(guide => {
        const coords = getCoordinates(guide);
        if (coords) {
          bounds.extend([coords.latitude, coords.longitude]);
        }
      });
      if (bounds.isValid()) {
        setMapBounds(bounds);
      }
    } else {
      // Un seul point : centrer dessus
      const [lng, lat] = attraction.location.coordinates;
      setMapCenter([lat, lng]);
      setMapZoom(audioGuides.length > 0 ? 15 : 13);
    }
  }, [audioGuides, attraction.location.coordinates]);

  // Geolocalisation temps réel (INCHANGÉ - logique geofencing conservée)
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
    if (userPosition) {
      setMapCenter([userPosition.latitude, userPosition.longitude]);
      setMapZoom(16);
      setMapBounds(undefined); // Réinitialiser bounds pour forcer le recentrage
    }
  };

  // Créer custom icons pour les markers
  const createCustomIcon = (index: number, isActive: boolean, isCompleted: boolean) => {
    const className = `custom-marker ${isActive ? 'active' : ''} ${isCompleted ? 'completed' : ''}`;
    return L.divIcon({
      html: `<div class="${className}"><span class="marker-number">${index + 1}</span></div>`,
      className: 'custom-marker-wrapper',
      iconSize: [40, 40],
      iconAnchor: [20, 40],
      popupAnchor: [0, -40]
    });
  };

  // Icon utilisateur
  const userIcon = L.divIcon({
    html: '<div class="user-marker"><div class="user-marker-pulse"></div><div class="user-marker-dot"></div></div>',
    className: 'user-marker-wrapper',
    iconSize: [30, 30],
    iconAnchor: [15, 15]
  });

  // Calculer coordonnées pour la polyline (circuit)
  const routeCoordinates: [number, number][] = useMemo(() => {
    return audioGuides
      .map(guide => getCoordinates(guide))
      .filter(coords => coords !== null)
      .map(coords => [coords!.latitude, coords!.longitude] as [number, number]);
  }, [audioGuides]);

  return (
    <div className="map-with-geofencing" style={style}>
      <MapContainer
        center={mapCenter}
        zoom={mapZoom}
        className="map-container"
        zoomControl={false} // Désactiver zoom control par défaut (on met notre UI custom)
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        {/* Controller pour bounds/center dynamique */}
        <MapController bounds={mapBounds} center={mapCenter} zoom={mapZoom} />

        {/* Markers pour chaque audioguide */}
        {audioGuides.map((guide, index) => {
          const coords = getCoordinates(guide);
          if (!coords) return null;

          const guideId = guide._id || guide.id || '';
          const currentId = currentAudioGuide?._id || currentAudioGuide?.id || '';
          const isActive = currentAudioGuide && guideId === currentId;
          const isCompleted = triggeredGuides.has(guideId);

          return (
            <Marker
              key={guideId}
              position={[coords.latitude, coords.longitude]}
              icon={createCustomIcon(index, isActive, isCompleted)}
            >
              <Popup>
                <div className="marker-popup">
                  <h3>{guide.title}</h3>
                  <p className="language">
                    {guide.language === 'fr' ? '🇫🇷 Français' : '🇬🇧 English'}
                  </p>
                  {guide.duration && (
                    <p className="duration">⏱️ {Math.ceil(guide.duration / 60)} min</p>
                  )}
                </div>
              </Popup>
            </Marker>
          );
        })}

        {/* Ligne de circuit (si plusieurs points) */}
        {audioGuides.length > 1 && routeCoordinates.length > 1 && (
          <Polyline
            positions={routeCoordinates}
            pathOptions={{
              color: '#f97316',
              weight: 3,
              opacity: 0.7,
              dashArray: '10, 10'
            }}
          />
        )}

        {/* Marker utilisateur */}
        {userPosition && (
          <Marker
            position={[userPosition.latitude, userPosition.longitude]}
            icon={userIcon}
          />
        )}
      </MapContainer>
      
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
