import React, { useEffect, useCallback, useMemo } from 'react';
import { useMapboxV5, MapboxMarkerV5 } from '../hooks/useMapboxV5';
import './MapboxMapV5.css';

interface MapboxMapV5Props {
  markers?: MapboxMarkerV5[];
  center?: [number, number];
  zoom?: number;
  style?: React.CSSProperties;
  className?: string;
  onMapLoad?: (map: unknown) => void;
  onError?: (error: string) => void;
  showNavigationControls?: boolean;
  autoFitBounds?: boolean;
  maxZoom?: number;
  minZoom?: number;
}

/**
 * Composant Mapbox V5 - Version optimisée avec fonctionnalités avancées
 */
export const MapboxMapV5: React.FC<MapboxMapV5Props> = ({
  markers = [],
  center = [-4.0267, 5.3364],
  zoom = 10,
  style = {},
  className = '',
  onMapLoad,
  onError,
  showNavigationControls = true,
  autoFitBounds = true,
  maxZoom = 18,
  minZoom = 1
}) => {
  // Stabiliser la config pour éviter les re-renders
  const centerLat = center[0];
  const centerLng = center[1];
  const config = useMemo(() => ({ 
    center: [centerLat, centerLng] as [number, number], 
    zoom, 
    maxZoom, 
    minZoom,
    showNavigationControls,
    autoFitBounds 
  }), [centerLat, centerLng, zoom, maxZoom, minZoom, showNavigationControls, autoFitBounds]);
  
  const {
    mapContainer,
    map,
    isLoading,
    error,
    isHealthy,
    addMarkers
  } = useMapboxV5(config);

  // Callbacks optimisés
  const handleMapLoad = useCallback((map: unknown) => {
    if (onMapLoad) {
      onMapLoad(map);
    }
  }, [onMapLoad]);

  const handleError = useCallback((error: string) => {
    if (onError) {
      onError(error);
    }
  }, [onError]);

  useEffect(() => {
    if (map && isHealthy) {
      handleMapLoad(map);
    }
  }, [map, isHealthy, handleMapLoad]);

  useEffect(() => {
    if (error) {
      handleError(error);
    }
  }, [error, handleError]);

  // Ajouter les marqueurs quand la carte est prête
  useEffect(() => {
    if (map && !isLoading && markers.length > 0) {
      console.log(`🎯 MapboxMapV5: Carte prête, ajout de ${markers.length} marqueurs`);
      // Délai minimal pour s'assurer que la carte est complètement rendue
      setTimeout(() => {
        addMarkers(markers);
      }, 500);
    }
  }, [map, isLoading, markers, addMarkers]);

  const containerStyle: React.CSSProperties = {
    width: '100%',
    height: '400px',
    ...style
  };

  if (error) {
    return (
      <div className={`mapbox-error ${className}`} style={containerStyle}>
        <div className="error-content">
          <div className="error-icon">🗺️</div>
          <h3>Erreur de carte</h3>
          <p>{error}</p>
          <button 
            onClick={() => {
              console.log('🔄 Rechargement de la carte demandé par l\'utilisateur');
              // Au lieu de recharger toute la page, on peut juste re-monter le composant
              // ou rediriger vers la même page avec un paramètre
              const currentPath = window.location.pathname + window.location.search;
              const separator = currentPath.includes('?') ? '&' : '?';
              window.location.href = currentPath + separator + 'reload=' + Date.now();
            }}
            className="retry-button"
          >
            Recharger la carte
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={`mapbox-container ${className}`} style={containerStyle}>
      {isLoading && (
        <div className="mapbox-loading">
          <div className="loading-spinner"></div>
          <p>Chargement de la carte Mapbox...</p>
          <small>Vérification token, container et initialisation...</small>
        </div>
      )}
      <div 
        ref={mapContainer as React.RefObject<HTMLDivElement>} 
        className="mapbox-map"
        style={{ width: '100%', height: '100%' }}
      />
    </div>
  );
};

export default MapboxMapV5;
