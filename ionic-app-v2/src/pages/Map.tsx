/**
 * Page Carte Interactive
 * Carte OpenStreetMap (Leaflet) avec toutes les attractions, géolocalisation et geofencing
 */

import React, { useState, useEffect, useRef } from 'react';
import {
  IonPage,
  IonHeader,
  IonToolbar,
  IonContent,
  IonButtons,
  IonButton,
  IonIcon,
  IonFab,
  IonFabButton,
  IonSpinner,
  IonCard,
  IonCardHeader,
  IonCardTitle,
  IonCardContent,
  IonChip,
  IonLabel,
  IonText,
  useIonViewDidEnter,
  useIonViewWillLeave,
  IonBadge,
} from '@ionic/react';
import {
  closeOutline,
  navigateOutline,
  notificationsOutline,
  qrCodeOutline,
} from 'ionicons/icons';
import { useHistory, useLocation } from 'react-router-dom';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import axios from 'axios';
import type { BackendAttraction } from '../types/backend';
import SearchFilters, { SearchFiltersState } from '../components/SearchFilters';
import QRCodeScanner from '../components/QRCodeScanner';
import ProfileMenu from '../components/ProfileMenu';
import { useGeofencing } from '../hooks/useGeofencing';
import './Map.css';

// Fix pour les icônes Leaflet
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

// Composant helper pour contrôler la map
interface MapControllerProps {
  center?: [number, number];
  zoom?: number;
  selectedAttractionCoords?: [number, number] | null;
  filteredAttractions?: BackendAttraction[];
  mapRef: React.MutableRefObject<L.Map | null>;
}

const MapController: React.FC<MapControllerProps> = ({ 
  center, 
  zoom, 
  selectedAttractionCoords,
  filteredAttractions,
  mapRef 
}) => {
  const map = useMap();

  // Stocker la référence pour utilisation externe
  useEffect(() => {
    mapRef.current = map;
    
    // Forcer le refresh des tiles au montage
    setTimeout(() => {
      map.invalidateSize();
      console.log('🗺️ Tiles Leaflet rafraîchies');
    }, 200);
  }, [map, mapRef]);

  // Gérer changements de center/zoom (pour centerOnUser et autres)
  useEffect(() => {
    if (!center || !zoom || !map) return;
    
    const [lat, lng] = center;
    // Valider et appliquer le nouveau centre/zoom
    if (lat && lng && !isNaN(lat) && !isNaN(lng) && isFinite(lat) && isFinite(lng)) {
      map.setView(center, zoom);
    } else {
      console.warn('⚠️ Coordonnées center invalides:', center);
    }
  }, [center, zoom, map]);

  // Zoom sur attraction sélectionnée
  useEffect(() => {
    if (!selectedAttractionCoords || !map) return;
    
    const [lat, lng] = selectedAttractionCoords;
    console.log('🔍 DEBUG selectedAttraction useEffect:', { lat, lng, selectedAttractionCoords });
    
    // Valider les coordonnées avant setView (éviter [NaN, NaN])
    if (lat && lng && !isNaN(lat) && !isNaN(lng) && isFinite(lat) && isFinite(lng)) {
      console.log('✅ Coordonnées attraction valides, appel setView');
      map.setView([lat, lng], 16); // setView au lieu de flyTo
    } else {
      console.warn('⚠️ Coordonnées attraction invalides:', { lat, lng, selectedAttractionCoords });
    }
  }, [selectedAttractionCoords, map]);

  // Ajuster bounds pour toutes les attractions
  useEffect(() => {
    if (filteredAttractions && filteredAttractions.length > 1 && map) {
      const bounds = L.latLngBounds([]);
      let hasValidCoords = false;
      
      filteredAttractions.forEach((attraction) => {
        if (attraction.location?.coordinates) {
          const [lng, lat] = attraction.location.coordinates;
          // Valider les coordonnées avant d'étendre les bounds
          if (!isNaN(lat) && !isNaN(lng) && isFinite(lat) && isFinite(lng)) {
            bounds.extend([lat, lng]);
            hasValidCoords = true;
          }
        }
      });
      
      if (hasValidCoords && bounds.isValid()) {
        map.fitBounds(bounds, { padding: [50, 50], maxZoom: 15 });
      }
    }
  }, [filteredAttractions, map]);

  return null;
};

const MapPage: React.FC = () => {
  const history = useHistory();
  const location = useLocation();
  const isMountedRef = useRef(true);
  const mapRef = useRef<L.Map | null>(null); // Ref pour contrôler la map Leaflet

  const [attractions, setAttractions] = useState<BackendAttraction[]>([]);
  const [filteredAttractions, setFilteredAttractions] = useState<BackendAttraction[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedAttraction, setSelectedAttraction] = useState<BackendAttraction | null>(null);
  const [userLocation, setUserLocation] = useState<[number, number] | null>(null);
  const [mapCenter, setMapCenter] = useState<[number, number]>([5.345, -4.0305]); // Leaflet: [lat, lng]
  const [mapZoom, setMapZoom] = useState<number>(12);
  const [searchText, setSearchText] = useState('');
  const [isFiltersOpen, setIsFiltersOpen] = useState(false);
  const [isQRScannerOpen, setIsQRScannerOpen] = useState(false);
  const [filters, setFilters] = useState<SearchFiltersState>({
    searchText: '',
    categories: [],
    minRating: 0,
    maxDistance: 100,
    sortBy: 'distance',
    showOnlyFavorites: false,
  });
  const [categoryFilter, setCategoryFilter] = useState<'all' | 'attraction' | 'tour'>('all');

  // Geofencing hook (notifications de proximité)
  const { state: geofencingState, startGeofencing, stopGeofencing, checkProximity } = useGeofencing(200);

  // Charger les données à chaque fois qu'on entre dans la page
  useIonViewDidEnter(() => {
    isMountedRef.current = true;
    console.log('📱 Map - Page active, rechargement des données...');
    loadAttractions();
    getUserLocation();
  });

  // Marquer comme inactive quand on quitte la page
  useIonViewWillLeave(() => {
    isMountedRef.current = false;
    console.log('📱 Map - Page inactive');
  });

  // Démarrer le geofencing quand la page est active
  useEffect(() => {
    startGeofencing();
    console.log('🎯 Geofencing activé sur Map.tsx');

    return () => {
      stopGeofencing();
      console.log('🛑 Geofencing désactivé sur Map.tsx');
    };
  }, [startGeofencing, stopGeofencing]);

  // Vérifier la proximité quand les attractions changent
  useEffect(() => {
    if (filteredAttractions.length > 0) {
      // Convertir BackendAttraction vers format attendu par useGeofencing
      const attractionsForGeofencing = filteredAttractions.map((a) => ({
        _id: a._id,
        name: a.name,
        location: a.location,
      }));
      checkProximity(attractionsForGeofencing);
    }
  }, [filteredAttractions, checkProximity]);

  // SUPPRIMÉ: Initialisation carte Mapbox (remplacée par MapContainer Leaflet)

  // SUPPRIMÉ: Affichage markers Mapbox (remplacé par composants Marker Leaflet)

  // SUPPRIMÉ: Affichage user marker Mapbox (remplacé par composant Marker Leaflet)

  // Zoom sur une attraction spécifique (paramètre URL)
  const [selectedAttractionCoords, setSelectedAttractionCoords] = useState<[number, number] | null>(null);

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const attractionId = params.get('attractionId');

    if (attractionId && attractions.length > 0) {
      const attraction = attractions.find((a) => a._id === attractionId);
      if (attraction && attraction.location?.coordinates) {
        const [lng, lat] = attraction.location.coordinates;
        setSelectedAttractionCoords([lat, lng]); // Leaflet: [lat, lng]
        setSelectedAttraction(attraction);
      }
    }
  }, [location.search, attractions]);

  const loadAttractions = async () => {
    try {
      if (!isMountedRef.current) return;
      setLoading(true);
      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
      const response = await axios.get<{ 
        success: boolean; 
        data: { attractions: BackendAttraction[]; total: number; }
      }>(
        `${apiUrl}/attractions`
      );
      if (!isMountedRef.current) return;
      if (response.data.success && response.data.data?.attractions) {
        const loadedAttractions = response.data.data.attractions;
        setAttractions(loadedAttractions);
        setFilteredAttractions(loadedAttractions);
        
        // Calculer le centre et zoom basés sur les attractions
        if (loadedAttractions.length > 0 && mapRef.current) {
          const validCoords = loadedAttractions
            .filter(a => a.location?.coordinates)
            .map(a => {
              const [lng, lat] = a.location!.coordinates;
              return [lat, lng] as [number, number];
            });
          
          if (validCoords.length > 0) {
            const bounds = L.latLngBounds(validCoords);
            setTimeout(() => {
              if (mapRef.current) {
                mapRef.current.fitBounds(bounds, { padding: [50, 50], maxZoom: 12 });
                // Forcer le refresh des tiles Leaflet
                mapRef.current.invalidateSize();
              }
            }, 100);
          }
        }
        
        console.log('✅ Map - Attractions chargées:', loadedAttractions.length);
      }
    } catch (error) {
      console.error('❌ Erreur chargement attractions pour la carte:', error);
    } finally {
      if (isMountedRef.current) {
        setLoading(false);
      }
    }
  };

  // Appliquer les filtres
  const applyFilters = (newFilters: SearchFiltersState) => {
    setFilters(newFilters);
    setSearchText(newFilters.searchText);
  };

  // Réinitialiser les filtres
  const resetFilters = () => {
    const defaultFilters: SearchFiltersState = {
      searchText: '',
      categories: [],
      minRating: 0,
      maxDistance: 100,
      sortBy: 'distance',
      showOnlyFavorites: false,
    };
    setFilters(defaultFilters);
    setSearchText('');
  };

  // Effet pour filtrer les attractions
  useEffect(() => {
    let filtered = [...attractions];
    const favoritesSet = new Set(JSON.parse(localStorage.getItem('favorites') || '[]'));

    // Appliquer filtre de type (categoryFilter: 'all' | 'attraction' | 'tour')
    if (categoryFilter !== 'all') {
      filtered = filtered.filter((a) => a.type === categoryFilter);
    }

    // Appliquer catégories
    if (filters.categories.length > 0) {
      filtered = filtered.filter((a) => filters.categories.includes(a.category));
    }

    // Appliquer note minimale
    if (filters.minRating > 0) {
      filtered = filtered.filter((a) => (a.rating || 0) >= filters.minRating);
    }

    // Appliquer favoris uniquement
    if (filters.showOnlyFavorites) {
      filtered = filtered.filter((a) => favoritesSet.has(a._id));
    }

    // Appliquer recherche texte
    if (searchText.trim() || filters.searchText.trim()) {
      const search = (searchText || filters.searchText).toLowerCase().trim();
      filtered = filtered.filter(
        (a) =>
          a.name?.toLowerCase().includes(search) ||
          a.nameEn?.toLowerCase().includes(search) ||
          a.city?.toLowerCase().includes(search) ||
          a.category?.toLowerCase().includes(search)
      );
    }

    console.log(`🗺️ Map - Filtrage: ${filtered.length}/${attractions.length} attractions (Type: ${categoryFilter})`);
    setFilteredAttractions(filtered);
  }, [attractions, filters, searchText, categoryFilter]);

  const getUserLocation = () => {
    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          if (!isMountedRef.current) return;
          const { longitude, latitude } = position.coords;
          setUserLocation([latitude, longitude]); // Leaflet: [lat, lng]
          console.log('✅ Position utilisateur obtenue:', { latitude, longitude });
        },
        (error) => {
          if (!isMountedRef.current) return;
          console.warn('⚠️ Erreur géolocalisation, utilisation position par défaut (Abidjan):', error);
          // Fallback: Centre d'Abidjan, Côte d'Ivoire (Leaflet: [lat, lng])
          setUserLocation([5.3599517, -4.0082563]);
        },
        {
          enableHighAccuracy: false, // Désactivé pour dev/indoor - plus rapide
          timeout: 30000, // 30 secondes - timeout plus long
          maximumAge: 60000, // Accepter position jusqu'à 60s d'ancienneté
        }
      );
    } else {
      if (!isMountedRef.current) return;
      // Navigateur ne supporte pas la géolocalisation
      console.warn('⚠️ Géolocalisation non supportée, utilisation position par défaut');
      setUserLocation([5.3599517, -4.0082563]); // Leaflet: [lat, lng]
    }
  };

  // Navigation
  const goToAttraction = (id: string) => {
    history.push(`/tabs/attraction/${id}`);
  };

  const centerOnUser = () => {
    if (userLocation) {
      // Utiliser le MapController pour centrer sur user
      const [lat, lng] = userLocation;
      if (!isNaN(lat) && !isNaN(lng) && mapRef.current) {
        mapRef.current.flyTo(userLocation, 14, { duration: 1 });
      }
    } else {
      getUserLocation();
    }
  };

  // Calculer la distance (Haversine formula)
  // Note: userLocation est [lat, lng] (Leaflet), attraction.location.coordinates est [lng, lat] (MongoDB)
  const calculateDistance = (userPos: [number, number], attractionCoords: [number, number]): number => {
    const [userLat, userLng] = userPos; // Leaflet format: [lat, lng]
    const [attrLng, attrLat] = attractionCoords; // MongoDB format: [lng, lat]

    const R = 6371; // Rayon de la Terre en km
    const dLat = ((attrLat - userLat) * Math.PI) / 180;
    const dLon = ((attrLng - userLng) * Math.PI) / 180;

    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos((userLat * Math.PI) / 180) *
        Math.cos((attrLat * Math.PI) / 180) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);

    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  };

  // Créer custom icons pour les markers d'attractions
  const createAttractionIcon = (isCircuit: boolean) => {
    const markerColor = isCircuit ? '#9B59B6' : '#3498DB'; // Violet pour circuits, Bleu pour attractions
    return L.divIcon({
      html: `
        <div class="custom-marker">
          <div class="marker-icon" style="color: ${markerColor};">
            <svg width="30" height="40" viewBox="0 0 24 32" fill="currentColor" stroke="white" stroke-width="1.5">
              <path d="M12 0C7.58 0 4 3.58 4 8c0 5.5 8 16 8 16s8-10.5 8-16c0-4.42-3.58-8-8-8zm0 11c-1.66 0-3-1.34-3-3s1.34-3 3-3 3 1.34 3 3-1.34 3-3 3z"></path>
            </svg>
          </div>
        </div>
      `,
      className: 'custom-marker-wrapper',
      iconSize: [30, 40],
      iconAnchor: [15, 40],
      popupAnchor: [0, -40]
    });
  };

  // Icon utilisateur
  const userIcon = L.divIcon({
    html: '<div class="user-marker"><div class="user-marker-pulse"></div></div>',
    className: 'user-marker-wrapper',
    iconSize: [30, 30],
    iconAnchor: [15, 15]
  });

  return (
    <IonPage className="map-page">
      <IonHeader className="map-header">
        <IonToolbar>
          {/* Filtres catégories dans le header */}
          <div style={{ 
            display: 'flex', 
            gap: '8px', 
            padding: '8px 16px', 
            justifyContent: 'center',
            flexWrap: 'wrap'
          }}>
            <IonChip 
              onClick={() => setCategoryFilter('all')} 
              color={categoryFilter === 'all' ? 'primary' : 'medium'}
            >
              <IonLabel>Tous</IonLabel>
            </IonChip>
            <IonChip 
              onClick={() => setCategoryFilter('attraction')} 
              color={categoryFilter === 'attraction' ? 'primary' : 'medium'}
            >
              <IonLabel>Attractions</IonLabel>
            </IonChip>
            <IonChip 
              onClick={() => setCategoryFilter('tour')} 
              color={categoryFilter === 'tour' ? 'primary' : 'medium'}
            >
              <IonLabel>Circuits</IonLabel>
            </IonChip>
          </div>
          
          <IonButtons slot="end">
            {/* Indicateur Geofencing actif */}
            {geofencingState.isActive && (
              <IonButton disabled>
                <IonIcon icon={notificationsOutline} color="success" />
                {geofencingState.nearbyAttractions.length > 0 && (
                  <IonBadge color="danger">
                    {geofencingState.nearbyAttractions.length}
                  </IonBadge>
                )}
              </IonButton>
            )}
            <ProfileMenu />
          </IonButtons>
        </IonToolbar>
      </IonHeader>

      <IonContent fullscreen scrollY={false} className="map-page-content" style={{ '--background': 'transparent' } as React.CSSProperties}>
        {/* Carte Leaflet */}
        <MapContainer
          center={mapCenter}
          zoom={mapZoom}
          className="map-container"
          zoomControl={false} // Désactiver zoom control (on utilise les boutons natifs)
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />

          {/* Controller pour bounds/center dynamique */}
          <MapController
            center={mapCenter}
            zoom={mapZoom}
            selectedAttractionCoords={selectedAttractionCoords}
            filteredAttractions={filteredAttractions}
            mapRef={mapRef}
          />

          {/* Markers pour chaque attraction */}
          {filteredAttractions.map((attraction) => {
            if (!attraction.location?.coordinates) return null;

            const [lng, lat] = attraction.location.coordinates;
            const isCircuit = attraction.category?.toLowerCase().includes('circuit') || 
                              attraction.category?.toLowerCase().includes('tour');

            return (
              <Marker
                key={attraction._id}
                position={[lat, lng]}
                icon={createAttractionIcon(isCircuit)}
                eventHandlers={{
                  click: () => setSelectedAttraction(attraction)
                }}
              />
            );
          })}

          {/* Marker utilisateur */}
          {userLocation && (
            <Marker
              position={userLocation} // userLocation est déjà [lat, lng]
              icon={userIcon}
            />
          )}
        </MapContainer>

        {/* Loading */}
        {loading && (
          <div className="map-loading">
            <IonSpinner name="crescent" />
            <IonText>
              <p>Chargement de la carte...</p>
            </IonText>
          </div>
        )}

        {/* Carte de l'attraction sélectionnée */}
        {selectedAttraction && (
          <IonCard className="selected-attraction-card">
            <IonButton
              fill="clear"
              className="close-card-button"
              onClick={() => setSelectedAttraction(null)}
            >
              <IonIcon icon={closeOutline} />
            </IonButton>

            <IonCardHeader>
              <IonCardTitle>{selectedAttraction.name}</IonCardTitle>
            </IonCardHeader>

            <IonCardContent>
              <IonText>
                <p>{selectedAttraction.shortDescription || selectedAttraction.description}</p>
              </IonText>

              <div className="card-meta">
                <IonChip color="primary">
                  <IonLabel>{selectedAttraction.category}</IonLabel>
                </IonChip>
                {userLocation && selectedAttraction.location?.coordinates && (
                  <IonChip>
                    <IonIcon icon={navigateOutline} />
                    <IonLabel>
                      {calculateDistance(
                        userLocation,
                        selectedAttraction.location.coordinates as [number, number]
                      ).toFixed(1)}{' '}
                      km
                    </IonLabel>
                  </IonChip>
                )}
              </div>

              <IonButton
                expand="block"
                onClick={() => goToAttraction(selectedAttraction._id)}
              >
                Voir les détails
              </IonButton>
            </IonCardContent>
          </IonCard>
        )}

        {/* FAB - QR Code Scanner (bottom) */}
        <IonFab vertical="bottom" horizontal="end" slot="fixed">
          <IonFabButton onClick={() => setIsQRScannerOpen(true)} color="secondary">
            <IonIcon icon={qrCodeOutline} />
          </IonFabButton>
        </IonFab>

        {/* FAB - Ma position (above QR scanner) */}
        <IonFab vertical="bottom" horizontal="end" slot="fixed" style={{ marginBottom: '70px' }}>
          <IonFabButton onClick={centerOnUser} color="primary">
            <IonIcon icon={navigateOutline} />
          </IonFabButton>
        </IonFab>
      </IonContent>

      {/* Filtres avancés */}
      <SearchFilters
        isOpen={isFiltersOpen}
        filters={filters}
        onApply={applyFilters}
        onClose={() => setIsFiltersOpen(false)}
        onReset={resetFilters}
      />

      {/* QR Code Scanner */}
      <QRCodeScanner
        isOpen={isQRScannerOpen}
        onClose={() => setIsQRScannerOpen(false)}
      />
    </IonPage>
  );
};

export default MapPage;
