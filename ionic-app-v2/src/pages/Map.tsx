/**
 * Page Carte Interactive
 * Carte Mapbox avec toutes les attractions, clustering, géolocalisation
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
  IonSearchbar,
  IonSpinner,
  IonCard,
  IonCardHeader,
  IonCardTitle,
  IonCardContent,
  IonChip,
  IonLabel,
  IonText,
  IonBadge,
} from '@ionic/react';
import {
  // locateOutline, // Temporairement caché avec le bouton filtres
  closeOutline,
  listOutline,
  navigateOutline,
  notificationsOutline,
} from 'ionicons/icons';
import { useHistory, useLocation } from 'react-router-dom';
import mapboxgl from 'mapbox-gl';
import axios from 'axios';
import type { BackendAttraction } from '../types/backend';
import SearchFilters, { SearchFiltersState } from '../components/SearchFilters';
import { useGeofencing } from '../hooks/useGeofencing';
import 'mapbox-gl/dist/mapbox-gl.css';
import './Map.css';

// Configuration Mapbox
mapboxgl.accessToken = import.meta.env.VITE_MAPBOX_TOKEN || '';

const MapPage: React.FC = () => {
  const history = useHistory();
  const location = useLocation();
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const markers = useRef<mapboxgl.Marker[]>([]);
  const userMarker = useRef<mapboxgl.Marker | null>(null);

  const [attractions, setAttractions] = useState<BackendAttraction[]>([]);
  const [filteredAttractions, setFilteredAttractions] = useState<BackendAttraction[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedAttraction, setSelectedAttraction] = useState<BackendAttraction | null>(null);
  const [userLocation, setUserLocation] = useState<[number, number] | null>(null);
  const [searchText, setSearchText] = useState('');
  const [isFiltersOpen, setIsFiltersOpen] = useState(false);
  const [filters, setFilters] = useState<SearchFiltersState>({
    searchText: '',
    categories: [],
    minRating: 0,
    maxDistance: 100,
    sortBy: 'distance',
    showOnlyFavorites: false,
  });

  // Geofencing hook (notifications de proximité)
  const { state: geofencingState, startGeofencing, stopGeofencing, checkProximity } = useGeofencing(200);

  // Position par défaut (Abidjan)
  const defaultCenter: [number, number] = [-4.0305, 5.345];
  const defaultZoom = 12;

  // Charger les attractions
  useEffect(() => {
    loadAttractions();
    getUserLocation();
  }, []);

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

  // Initialiser la carte
  useEffect(() => {
    if (!mapContainer.current || map.current) return;

    // Créer la carte
    map.current = new mapboxgl.Map({
      container: mapContainer.current,
      style: 'mapbox://styles/mapbox/streets-v12',
      center: defaultCenter,
      zoom: defaultZoom,
    });

    // Ajouter les contrôles
    map.current.addControl(new mapboxgl.NavigationControl(), 'top-right');
    map.current.addControl(
      new mapboxgl.GeolocateControl({
        positionOptions: {
          enableHighAccuracy: true,
        },
        trackUserLocation: true,
        showUserHeading: true,
      }),
      'top-right'
    );

    return () => {
      map.current?.remove();
      map.current = null;
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Afficher les attractions sur la carte
  useEffect(() => {
    if (!map.current || filteredAttractions.length === 0) return;

    // Supprimer les anciens markers
    markers.current.forEach((marker) => marker.remove());
    markers.current = [];

    // Ajouter les nouveaux markers
    filteredAttractions.forEach((attraction) => {
      if (!attraction.location?.coordinates) return;

      const [lng, lat] = attraction.location.coordinates;

      // Créer l'élément du marker personnalisé
      const el = document.createElement('div');
      el.className = 'custom-marker';
      el.innerHTML = `
        <div class="marker-icon">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
            <circle cx="12" cy="10" r="3"></circle>
          </svg>
        </div>
      `;

      // Créer le marker
      const marker = new mapboxgl.Marker(el)
        .setLngLat([lng, lat])
        .setPopup(
          new mapboxgl.Popup({ offset: 25 }).setHTML(`
            <div class="popup-content">
              <h3>${attraction.name}</h3>
              <p>${attraction.shortDescription || attraction.description.substring(0, 100)}...</p>
              <button class="popup-button" data-id="${attraction._id}">Voir les détails</button>
            </div>
          `)
        )
        .addTo(map.current!);

      // Clic sur le marker
      el.addEventListener('click', () => {
        setSelectedAttraction(attraction);
      });

      markers.current.push(marker);
    });

    // Ajuster les bounds pour montrer toutes les attractions
    if (filteredAttractions.length > 1) {
      const bounds = new mapboxgl.LngLatBounds();
      filteredAttractions.forEach((attraction) => {
        if (attraction.location?.coordinates) {
          bounds.extend(attraction.location.coordinates as [number, number]);
        }
      });
      map.current?.fitBounds(bounds, { padding: 50, maxZoom: 15 });
    }

    // Event listener pour les boutons dans les popups
    setTimeout(() => {
      document.querySelectorAll('.popup-button').forEach((button) => {
        button.addEventListener('click', (e) => {
          const id = (e.target as HTMLElement).getAttribute('data-id');
          if (id) goToAttraction(id);
        });
      });
    }, 100);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filteredAttractions]);

  // Afficher la position de l'utilisateur
  useEffect(() => {
    if (!map.current || !userLocation) return;

    // Supprimer l'ancien marker
    if (userMarker.current) {
      userMarker.current.remove();
    }

    // Créer le marker de l'utilisateur
    const el = document.createElement('div');
    el.className = 'user-marker';
    el.innerHTML = '<div class="user-marker-pulse"></div>';

    userMarker.current = new mapboxgl.Marker(el)
      .setLngLat(userLocation)
      .addTo(map.current);

    // Centrer sur l'utilisateur
    map.current.flyTo({
      center: userLocation,
      zoom: 14,
      duration: 1500,
    });
  }, [userLocation]);

  // Zoom sur une attraction spécifique (paramètre URL)
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const attractionId = params.get('attractionId');

    if (attractionId && attractions.length > 0) {
      const attraction = attractions.find((a) => a._id === attractionId);
      if (attraction && map.current && attraction.location?.coordinates) {
        const [lng, lat] = attraction.location.coordinates;
        map.current.flyTo({
          center: [lng, lat],
          zoom: 16,
          duration: 2000,
        });
        setSelectedAttraction(attraction);
      }
    }
  }, [location.search, attractions]);

  const loadAttractions = async () => {
    try {
      setLoading(true);
      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
      const response = await axios.get<{ 
        success: boolean; 
        data: { attractions: BackendAttraction[]; total: number; }
      }>(
        `${apiUrl}/attractions`
      );
      if (response.data.success && response.data.data?.attractions) {
        setAttractions(response.data.data.attractions);
        setFilteredAttractions(response.data.data.attractions);
        console.log('✅ Map - Attractions chargées:', response.data.data.attractions.length);
      }
    } catch (error) {
      console.error('❌ Erreur chargement attractions pour la carte:', error);
    } finally {
      setLoading(false);
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

    console.log(`🗺️ Map - Filtrage: ${filtered.length}/${attractions.length} attractions`);
    setFilteredAttractions(filtered);
  }, [attractions, filters, searchText]);

  const getUserLocation = () => {
    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { longitude, latitude } = position.coords;
          setUserLocation([longitude, latitude]);
          console.log('✅ Position utilisateur obtenue:', { latitude, longitude });
        },
        (error) => {
          console.warn('⚠️ Erreur géolocalisation, utilisation position par défaut (Abidjan):', error);
          // Fallback: Centre d'Abidjan, Côte d'Ivoire
          setUserLocation([-4.0082563, 5.3599517]);
        },
        {
          enableHighAccuracy: false, // Désactivé pour dev/indoor - plus rapide
          timeout: 30000, // 30 secondes - timeout plus long
          maximumAge: 60000, // Accepter position jusqu'à 60s d'ancienneté
        }
      );
    } else {
      // Navigateur ne supporte pas la géolocalisation
      console.warn('⚠️ Géolocalisation non supportée, utilisation position par défaut');
      setUserLocation([-4.0082563, 5.3599517]);
    }
  };

  // Navigation
  const goToAttraction = (id: string) => {
    history.push(`/tabs/attraction/${id}`);
  };

  const centerOnUser = () => {
    if (map.current && userLocation) {
      map.current.flyTo({
        center: userLocation,
        zoom: 14,
        duration: 1000,
      });
    } else {
      getUserLocation();
    }
  };

  const goToList = () => {
    history.push('/tabs/home');
  };

  // Calculer la distance
  const calculateDistance = (point1: [number, number], point2: [number, number]): number => {
    const [lon1, lat1] = point1;
    const [lon2, lat2] = point2;

    const R = 6371; // Rayon de la Terre en km
    const dLat = ((lat2 - lat1) * Math.PI) / 180;
    const dLon = ((lon2 - lon1) * Math.PI) / 180;

    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos((lat1 * Math.PI) / 180) *
        Math.cos((lat2 * Math.PI) / 180) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);

    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  };

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonButtons slot="end">
            {/* Indicateur Geofencing actif */}
            {geofencingState.isActive && (
              <IonButton disabled>
                <IonIcon icon={notificationsOutline} color="success" />
                {geofencingState.nearbyAttractions.length > 0 && (
                  <IonBadge color="danger" style={{ marginLeft: '-8px', marginTop: '-8px' }}>
                    {geofencingState.nearbyAttractions.length}
                  </IonBadge>
                )}
              </IonButton>
            )}
            {/* Bouton Filtres temporairement caché
            <IonButton onClick={() => setIsFiltersOpen(true)}>
              <IonIcon icon={locateOutline} />
            </IonButton>
            */}
            <IonButton onClick={goToList}>
              <IonIcon icon={listOutline} />
            </IonButton>
          </IonButtons>
        </IonToolbar>

        {/* Barre de recherche */}
        <IonToolbar>
          <IonSearchbar
            value={searchText}
            onIonInput={(e) => setSearchText(e.detail.value || '')}
            placeholder="Rechercher sur la carte..."
            animated
          />
        </IonToolbar>
      </IonHeader>

      <IonContent>
        {/* Carte */}
        <div ref={mapContainer} className="map-container" />

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

        {/* FAB - Ma position */}
        <IonFab vertical="bottom" horizontal="end" slot="fixed">
          <IonFabButton onClick={centerOnUser}>
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
    </IonPage>
  );
};

export default MapPage;
