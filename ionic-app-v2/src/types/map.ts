/**
 * Types et interfaces pour les composants de carte
 * Suivant les bonnes pratiques TypeScript pour la robustesse
 */

export interface Position {
  readonly lat: number;
  readonly lng: number;
}

export interface AttractionMapData {
  readonly id: string;
  readonly name: string;
  readonly position: Position;
  readonly category: string;
  readonly rating: number;
  readonly duration: string;
  readonly price: number;
}

export interface SimpleMapProps {
  readonly attractions: readonly AttractionMapData[];
  readonly selectedCity: string;
  readonly className?: string;
  readonly onAttractionClick?: (attraction: AttractionMapData) => void;
  readonly isLoading?: boolean;
  readonly showLegend?: boolean;
  readonly maxMarkers?: number;
}

export interface MapError {
  readonly code: string;
  readonly message: string;
  readonly details?: unknown;
}

export interface MapState {
  readonly isLoading: boolean;
  readonly error: MapError | null;
  readonly selectedAttraction: AttractionMapData | null;
}

// Constantes pour la configuration de la carte
export const MAP_CONFIG = {
  DEFAULT_MAX_MARKERS: 8,
  DEFAULT_MIN_HEIGHT: 400,
  MARKER_COLORS: {
    MUSEUM: '#8B5CF6',
    TRANSPORT: '#06B6D4', 
    WALKING: '#10B981',
    DEFAULT: '#6B7280'
  }
} as const;

export type MarkerColor = keyof typeof MAP_CONFIG.MARKER_COLORS;