import { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { MapboxOptions } from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';

// Type pour mapboxgl.Map sans import direct
// type MapboxMap = any;

// Interface pour les types compatibles avec MapboxOptions
interface MapboxMapOptions extends Partial<MapboxOptions> {
  zoom?: number;
  center?: [number, number];
  style?: string;
  showNavigationControls?: boolean;
}

// Type alias pour la carte Mapbox
type MapboxMap = import('mapbox-gl').Map;

export interface MapboxMarkerV5 {
  coordinates: [number, number];
  title: string;
  description: string;
  category?: string;
  color?: string;
}

export interface MapboxConfigV5 {
  center?: [number, number];
  zoom?: number;
  style?: string;
  maxZoom?: number;
  minZoom?: number;
  showNavigationControls?: boolean;
  autoFitBounds?: boolean;
}

interface UseMapboxV5Return {
  mapContainer: React.RefObject<HTMLDivElement | null>;
  map: MapboxMap | null;
  isLoading: boolean;
  error: string | null;
  isHealthy: boolean;
  addMarkers: (markers: MapboxMarkerV5[]) => void;
}

export const useMapboxV5 = (config: Partial<MapboxMapOptions> = {}): UseMapboxV5Return => {
  const mapContainer = useRef<HTMLDivElement | null>(null);
  const [map, setMap] = useState<MapboxMap | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isHealthy, setIsHealthy] = useState(false);
  const pendingMarkersRef = useRef<MapboxMarkerV5[]>([]);

  // Stabiliser la config une seule fois
  const mapConfig = useMemo(() => ({
    style: config.style || 'mapbox://styles/mapbox/streets-v11',
    center: config.center || [-4.0267, 5.3364] as [number, number],
    zoom: config.zoom || 10,
    maxZoom: config.maxZoom || 18,
    minZoom: config.minZoom || 2
  }), [config.center, config.zoom, config.style, config.minZoom, config.maxZoom]); // Dépendances spécifiques

  // Fonction pour ajouter les marqueurs à la carte (approche simplifiée sans retry)
  const addMarkersToMap = useCallback(async (mapInstance: MapboxMap, markers: MapboxMarkerV5[]) => {
    try {
      console.log(`🎯 useMapboxV5: Ajout de ${markers.length} marqueurs à la carte`);
      
      const mapboxgl = (await import('mapbox-gl')).default;
      
      markers.forEach((marker, index) => {
        console.log(`📍 Ajout marqueur ${index + 1}: ${marker.title}`);
        
        try {
          new mapboxgl.Marker({ color: marker.color || '#FF6B35' })
            .setLngLat(marker.coordinates)
            .setPopup(
              new mapboxgl.Popup({ offset: 25 })
                .setHTML(`
                  <div style="padding: 10px; max-width: 300px;">
                    <h3 style="margin: 0 0 8px 0; font-size: 16px; font-weight: bold;">${marker.title}</h3>
                    <p style="margin: 0; font-size: 14px; color: #666; line-height: 1.4;">${marker.description}</p>
                    ${marker.category ? `<span style="display: inline-block; margin-top: 8px; padding: 4px 8px; background: #e3f2fd; border-radius: 12px; font-size: 12px; color: #1976d2; font-weight: 500;">${marker.category}</span>` : ''}
                  </div>
                `)
            )
            .addTo(mapInstance);
        } catch (markerError) {
          console.warn(`⚠️ Échec ajout marqueur ${index + 1}:`, markerError);
        }
      });
      
      console.log(`✅ useMapboxV5: ${markers.length} marqueurs traités`);
      
      // Auto-ajustement de la vue après un petit délai
      setTimeout(() => {
        try {
          if (markers.length > 1) {
            const bounds = new mapboxgl.LngLatBounds();
            markers.forEach(marker => bounds.extend(marker.coordinates));
            mapInstance.fitBounds(bounds, {
              padding: { top: 50, bottom: 50, left: 50, right: 50 },
              duration: 2000
            });
          } else if (markers.length === 1) {
            mapInstance.flyTo({
              center: markers[0].coordinates,
              zoom: 15,
              duration: 2000
            });
          }
        } catch (adjustError) {
          console.warn('⚠️ useMapboxV5: Erreur lors de l\'ajustement de vue:', adjustError);
        }
      }, 500); // Délai réduit
      
    } catch (error) {
      console.error('❌ useMapboxV5: Erreur lors de l\'ajout des marqueurs:', error);
    }
  }, []);  useEffect(() => {
    let isMounted = true;
    let mapInstance: MapboxMap | null = null;
    let timeoutId: NodeJS.Timeout | null = null;

    const initializeMap = async () => {
      console.log('🚀 useMapboxV5: Début d\'initialisation...');

      // Attendre que le container soit disponible
      let attempts = 0;
      while (!mapContainer.current && attempts < 10) {
        await new Promise(resolve => setTimeout(resolve, 100));
        attempts++;
      }

      if (!mapContainer.current) {
        console.error('❌ useMapboxV5: Container non disponible');
        if (isMounted) {
          setError('Container de carte non disponible');
          setIsLoading(false);
        }
        return;
      }

      if (!isMounted) return;

      console.log('✅ useMapboxV5: Container disponible');
      setIsLoading(true);
      setError(null);

      try {
        const token = import.meta.env.VITE_MAPBOX_ACCESS_TOKEN;
        console.log('🔑 useMapboxV5: Token détecté:', token ? `${token.substring(0, 10)}...` : 'MANQUANT');
        if (!token || !token.startsWith('pk.')) {
          throw new Error('Token Mapbox invalide ou manquant');
        }

        console.log('✅ useMapboxV5: Token validé');

        const mapboxgl = (await import('mapbox-gl')).default;
        console.log('✅ useMapboxV5: Mapbox GL JS importé avec CSS');
        
        // Définir le token d'accès via la propriété accessToken
        mapboxgl.accessToken = token;
        mapContainer.current.innerHTML = '';
        
        console.log('🗺️ useMapboxV5: Création de la carte...');
        
        mapInstance = new mapboxgl.Map({
          container: mapContainer.current,
          ...mapConfig
        });

        // Timeout de sécurité
        timeoutId = setTimeout(() => {
          if (isMounted && isLoading) {
            console.warn('⏰ useMapboxV5: Timeout de chargement');
            setError('Timeout - Vérifiez votre connexion');
            setIsLoading(false);
            setIsHealthy(false);
          }
        }, 8000);

        mapInstance.on('load', () => {
          console.log('✅ useMapboxV5: Carte chargée avec succès');
          if (isMounted) {
            setMap(mapInstance);
            setIsLoading(false);
            setError(null);
            setIsHealthy(true);

            // Ajouter les contrôles de navigation
            if (mapInstance) {
              const NavigationControl = mapboxgl.NavigationControl;
              mapInstance.addControl(new NavigationControl(), 'top-left');
              console.log('🎮 useMapboxV5: Contrôles ajoutés');
            }

            // Attendre l'événement 'styledata' pour s'assurer que le style est chargé
            const mi = mapInstance!;
            mi.once('styledata', () => {
              if (!isMounted) return;
              
              if (pendingMarkersRef.current.length > 0) {
                console.log('🎯 useMapboxV5: Ajout des marqueurs en attente après styledata');
                addMarkersToMap(mi, pendingMarkersRef.current);
                pendingMarkersRef.current = [];
              }
            });

            if (timeoutId) {
              clearTimeout(timeoutId);
              timeoutId = null;
            }
          }
        });

        mapInstance.on('error', (e: unknown) => {
          console.error('❌ useMapboxV5: Erreur carte:', e);
          if (isMounted) {
            const errorMessage = 'Erreur lors du chargement de la carte Mapbox';
            setError(errorMessage);
            setIsLoading(false);
            setIsHealthy(false);
          }
        });

      } catch (err) {
        console.error('❌ useMapboxV5: Erreur lors de l\'initialisation:', err);
        if (isMounted) {
          const errorMessage = err instanceof Error ? err.message : String(err);
          setError(errorMessage);
          setIsLoading(false);
          setIsHealthy(false);
        }
      }
    };

    initializeMap();

    return () => {
      isMounted = false;
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
      if (mapInstance && typeof mapInstance.remove === 'function') {
        try {
          console.log('🧹 useMapboxV5: Nettoyage de la carte...');
          mapInstance.remove();
        } catch (cleanupError) {
          console.warn('⚠️ useMapboxV5: Erreur lors du nettoyage:', cleanupError);
        }
      }
    };
  }, [mapConfig, isLoading, addMarkersToMap]);

  // (définition déplacée plus haut)

  // Fonction pour ajouter des marqueurs - stocke en attente si la carte n'est pas prête
  const addMarkers = (markers: MapboxMarkerV5[]) => {
    console.log(`📍 useMapboxV5: Demande d'ajout de ${markers.length} marqueurs`);
    
    if (!markers.length) {
      console.warn('⚠️ useMapboxV5: Aucun marqueur à ajouter');
      return;
    }

    if (!map || !isHealthy) {
      console.log('⏳ useMapboxV5: Carte non prête, marqueurs mis en attente');
      pendingMarkersRef.current = [...pendingMarkersRef.current, ...markers];
      return;
    }

    // Si la carte est prête, ajouter immédiatement
    console.log('🎯 useMapboxV5: Carte prête, ajout immédiat des marqueurs');
    addMarkersToMap(map, markers);
  };

  return {
    mapContainer,
    map,
    isLoading,
    error,
    isHealthy,
    addMarkers
  };
};