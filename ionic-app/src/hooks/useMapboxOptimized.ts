import { useState, useEffect, useRef, useCallback } from 'react';
import 'mapbox-gl/dist/mapbox-gl.css';

export interface MapboxMarker {
  coordinates: [number, number];
  title: string;
  description: string;
  category?: string;
  color?: string;
}

export interface MapboxConfig {
  center?: [number, number];
  zoom?: number;
  style?: string;
  maxZoom?: number;
  minZoom?: number;
  showNavigationControls?: boolean;
  autoFitBounds?: boolean;
}

interface MapboxInstance {
  addControl: (control: unknown) => void;
  on: (event: string, callback: (...args: unknown[]) => void) => void;
  getContainer: () => HTMLElement;
  fitBounds: (bounds: [[number, number], [number, number]], options?: unknown) => void;
  remove: () => void;
}

interface UseMapboxReturn {
  mapContainer: React.RefObject<HTMLDivElement | null>;
  map: MapboxInstance | null;
  isLoading: boolean;
  error: string | null;
  isHealthy: boolean;
  addMarkers: (markers: MapboxMarker[]) => void;
  resetMap: () => void;
}

const MAPBOX_TOKEN = 'pk.eyJ1IjoiY2l2cG1hcCIsImEiOiJjbTJoOTVoazAwOGFrMmpxd2diNzVsaGI4In0.ZVOr18F_pUPePcmYWvyc6A';

export const useMapboxOptimized = (config: MapboxConfig = {}): UseMapboxReturn => {
  const mapContainer = useRef<HTMLDivElement | null>(null);
  const [map, setMap] = useState<MapboxInstance | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isHealthy, setIsHealthy] = useState(false);

  // Configuration stable
  const mapConfig = {
    style: config.style || 'mapbox://styles/mapbox/streets-v11',
    center: config.center || [-4.0267, 5.3364] as [number, number],
    zoom: config.zoom || 10,
    maxZoom: config.maxZoom || 18,
    minZoom: config.minZoom || 1,
    showNavigationControls: config.showNavigationControls !== false,
    autoFitBounds: config.autoFitBounds !== false
  };

  const addMarkers = useCallback((markers: MapboxMarker[]) => {
    if (!map || !markers.length) {
      console.log('🔍 addMarkers: Carte ou marqueurs manquants');
      return;
    }

    console.log(`🎯 Ajout de ${markers.length} marqueurs`);
    
    try {
      // Import dynamique de mapbox-gl
      import('mapbox-gl').then(({ default: mapboxgl }) => {
        const bounds: [number, number][] = [];

        markers.forEach((marker, index) => {
          // Créer le HTML du popup
          const popupHtml = `
            <div style="padding: 10px; max-width: 200px;">
              <h4 style="margin: 0 0 8px 0; color: #333;">${marker.title}</h4>
              <p style="margin: 0; color: #666; font-size: 14px;">${marker.description}</p>
              ${marker.category ? `<span style="display: inline-block; padding: 2px 6px; background: ${marker.color || '#007cbf'}; color: white; border-radius: 3px; font-size: 12px; margin-top: 6px;">${marker.category}</span>` : ''}
            </div>
          `;

          // Créer le popup
          const popup = new mapboxgl.Popup({
            offset: 25,
            closeButton: true,
            closeOnClick: false
          }).setHTML(popupHtml);

          // Créer le marqueur
          new mapboxgl.Marker({ 
            color: marker.color || '#FF6B6B' 
          })
            .setLngLat(marker.coordinates)
            .setPopup(popup)
            .addTo(map as unknown as mapboxgl.Map);

          bounds.push(marker.coordinates);
          
          console.log(`✅ Marqueur ${index + 1} ajouté: ${marker.title}`);
        });

        // Auto-ajustement des limites si demandé
        if (mapConfig.autoFitBounds && bounds.length > 1) {
          setTimeout(() => {
            const minLng = Math.min(...bounds.map(b => b[0]));
            const maxLng = Math.max(...bounds.map(b => b[0]));
            const minLat = Math.min(...bounds.map(b => b[1]));
            const maxLat = Math.max(...bounds.map(b => b[1]));
            
            map.fitBounds([
              [minLng - 0.01, minLat - 0.01],
              [maxLng + 0.01, maxLat + 0.01]
            ], { padding: 50 });
            
            console.log('🗺️ Limites de la carte ajustées automatiquement');
          }, 500);
        }
      });
    } catch (err) {
      console.error('❌ Erreur lors de l\'ajout des marqueurs:', err);
    }
  }, [map, mapConfig.autoFitBounds]);

  const resetMap = useCallback(() => {
    setError(null);
    setIsLoading(true);
    setIsHealthy(false);
    
    // Force la re-création de la carte
    setTimeout(() => {
      if (map) {
        map.remove();
        setMap(null);
      }
    }, 100);
  }, [map]);

  useEffect(() => {
    let isMounted = true;
    let mapInstance: MapboxInstance | null = null;
    let timeoutId: NodeJS.Timeout | null = null;

    const initializeMap = async () => {
      console.log('🚀 Initialisation Mapbox optimisée...');
      setIsLoading(true);
      setError(null);
      setIsHealthy(false);

      try {
        // Vérification du token
        if (!MAPBOX_TOKEN || MAPBOX_TOKEN.length < 10) {
          throw new Error('Token Mapbox invalide');
        }

        // Attendre que le container soit disponible
        const waitForContainer = () => {
          return new Promise<void>((resolve, reject) => {
            const checkContainer = () => {
              if (!isMounted) return reject(new Error('Composant démonté'));
              
              if (mapContainer.current) {
                console.log('✅ Container mapbox trouvé');
                resolve();
              } else {
                console.log('⏳ Attente du container...');
                setTimeout(checkContainer, 100);
              }
            };
            checkContainer();
          });
        };

        await waitForContainer();

        if (!isMounted) return;

        // Import dynamique de mapbox-gl
        const { default: mapboxgl } = await import('mapbox-gl');
        
        // Configuration du token
        mapboxgl.accessToken = MAPBOX_TOKEN;

        console.log('📍 Création de la carte avec config:', mapConfig);

        // Création de la carte
        const newMap = new mapboxgl.Map({
          container: mapContainer.current!,
          style: mapConfig.style,
          center: mapConfig.center,
          zoom: mapConfig.zoom,
          maxZoom: mapConfig.maxZoom,
          minZoom: mapConfig.minZoom,
        }) as unknown as MapboxInstance;

        mapInstance = newMap;

        // Contrôles de navigation
        if (mapConfig.showNavigationControls) {
          const nav = new mapboxgl.NavigationControl();
          newMap.addControl(nav);
          console.log('🧭 Contrôles de navigation ajoutés');
        }

        // Gestionnaires d'événements
        newMap.on('load', () => {
          if (!isMounted) return;
          console.log('✅ Carte chargée avec succès');
          setMap(newMap);
          setIsLoading(false);
          setIsHealthy(true);
        });

        newMap.on('error', (e: unknown) => {
          if (!isMounted) return;
          console.error('❌ Erreur Mapbox:', e);
          setError('Erreur de chargement de la carte');
          setIsLoading(false);
          setIsHealthy(false);
        });

        // Timeout de sécurité
        timeoutId = setTimeout(() => {
          if (!isMounted) return;
          if (isLoading) {
            console.log('⏰ Timeout atteint');
            setError('Timeout lors du chargement de la carte');
            setIsLoading(false);
            setIsHealthy(false);
          }
        }, 10000);

      } catch (err) {
        if (!isMounted) return;
        console.error('❌ Erreur d\'initialisation:', err);
        setError(err instanceof Error ? err.message : 'Erreur inconnue');
        setIsLoading(false);
        setIsHealthy(false);
      }
    };

    initializeMap();

    // Nettoyage
    return () => {
      isMounted = false;
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
      if (mapInstance) {
        console.log('🧹 Nettoyage de la carte');
        mapInstance.remove();
      }
    };
  }, []); // Dépendances vides pour éviter les re-créations

  return {
    mapContainer,
    map,
    isLoading,
    error,
    isHealthy,
    addMarkers,
    resetMap
  };
};