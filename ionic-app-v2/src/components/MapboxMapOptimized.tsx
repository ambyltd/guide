import React, { useEffect, useCallback, useMemo } from 'react';
import { useMapboxOptimized, MapboxMarker } from '../hooks/useMapboxOptimized';
import './MapboxMapOptimized.css';

interface MapboxMapOptimizedProps {
  markers?: MapboxMarker[];
  center?: [number, number];
  zoom?: number;
  className?: string;
  onMapLoad?: (map: unknown) => void;
  onError?: (error: string) => void;
  showNavigationControls?: boolean;
  autoFitBounds?: boolean;
  maxZoom?: number;
  minZoom?: number;
  height?: string;
  width?: string;
}

/**
 * Composant Mapbox Optimisé - Version finale avec meilleures performances
 */
export const MapboxMapOptimized: React.FC<MapboxMapOptimizedProps> = ({
  markers = [],
  center = [-4.0267, 5.3364],
  zoom = 10,
  className = '',
  onMapLoad,
  onError,
  showNavigationControls = true,
  autoFitBounds = true,
  maxZoom = 18,
  minZoom = 1,
  height = '400px',
  width = '100%'
}) => {
  // Configuration optimisée
  const config = useMemo(() => ({
    center,
    zoom,
    maxZoom,
    minZoom,
    showNavigationControls,
    autoFitBounds
  }), [center[0], center[1], zoom, maxZoom, minZoom, showNavigationControls, autoFitBounds]);

  const {
    mapContainer,
    map,
    isLoading,
    error,
    isHealthy,
    addMarkers,
    resetMap
  } = useMapboxOptimized(config);

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

  const handleRetry = useCallback(() => {
    console.log('🔄 Tentative de rechargement de la carte...');
    resetMap();
  }, [resetMap]);

  // Events
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

  // Ajouter les marqueurs avec délai optimisé
  useEffect(() => {
    if (map && isHealthy && markers.length > 0) {
      console.log(`🎯 Prêt à ajouter ${markers.length} marqueurs`);
      const timeoutId = setTimeout(() => {
        addMarkers(markers);
      }, 200);
      
      return () => clearTimeout(timeoutId);
    }
    return;
  }, [map, isHealthy, markers, addMarkers]);

  if (error) {
    return (
      <div className={`mapbox-error ${className}`}>
        <div className="error-content">
          <div className="error-icon">🗺️</div>
          <h3>Erreur de carte</h3>
          <p>{error}</p>
          <button 
            onClick={handleRetry}
            className="retry-button"
          >
            Réessayer
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={`mapbox-container ${className}`}>
      {isLoading && (
        <div className="mapbox-loading">
          <div className="loading-spinner"></div>
          <p>Chargement de la carte optimisée...</p>
          <small>Initialisation Mapbox GL JS...</small>
        </div>
      )}
      <div 
        ref={mapContainer as React.RefObject<HTMLDivElement>} 
        className="mapbox-map"
        style={{ 
          width, 
          height,
          visibility: isLoading ? 'hidden' : 'visible'
        }}
      />
      {isHealthy && (
        <div className="map-status">
          <span className="status-indicator">✅ Carte prête</span>
          {markers.length > 0 && (
            <span className="markers-count">{markers.length} lieu(x)</span>
          )}
        </div>
      )}
    </div>
  );
};

export default MapboxMapOptimized;