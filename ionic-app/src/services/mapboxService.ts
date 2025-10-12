import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';

// Configuration Mapbox centralisée
export const MAPBOX_CONFIG = {
  accessToken: import.meta.env.VITE_MAPBOX_ACCESS_TOKEN || '',
  style: 'mapbox://styles/mapbox/streets-v11',
  fallbackStyles: [
    'mapbox://styles/mapbox/streets-v11',
    'mapbox://styles/mapbox/outdoors-v11', 
    'mapbox://styles/mapbox/light-v10',
    'mapbox://styles/mapbox/dark-v10'
  ],
  defaultCenter: [-4.0267, 5.3364] as [number, number], // Abidjan
  defaultZoom: 12,
  maxZoom: 18,
  minZoom: 6,
} as const;

// Types pour Mapbox
export interface MapboxMarker {
  id: string;
  coordinates: [number, number];
  title: string;
  description: string;
  category?: string;
  color?: string;
}

export interface MapboxConfig {
  container: HTMLDivElement;
  center?: [number, number];
  zoom?: number;
  style?: string;
}

// Service Mapbox avec gestion d'erreurs
export class MapboxService {
  private static instance: MapboxService;
  private map: mapboxgl.Map | null = null;
  private markers: mapboxgl.Marker[] = [];

  private constructor() {
    // Configuration du token
    mapboxgl.accessToken = MAPBOX_CONFIG.accessToken;
    
    if (MAPBOX_CONFIG.accessToken) {
      this.validateToken().catch(error => {
        console.warn('⚠️  Problème de validation token:', error.message);
      });
    }
  }

  public static getInstance(): MapboxService {
    if (!MapboxService.instance) {
      MapboxService.instance = new MapboxService();
    }
    return MapboxService.instance;
  }

  // Initialisation sécurisée de la carte
  public async initializeMap(config: MapboxConfig): Promise<mapboxgl.Map | null> {
    try {
      if (!MAPBOX_CONFIG.accessToken) {
        console.error('❌ Token Mapbox manquant dans .env');
        throw new Error('Token Mapbox requis. Vérifiez VITE_MAPBOX_ACCESS_TOKEN dans .env');
      }

      console.log('🔑 Token Mapbox détecté:', MAPBOX_CONFIG.accessToken.substring(0, 10) + '...');

      if (this.map) {
        this.cleanup();
      }

      // Essayer avec le style principal d'abord
      const mapStyle = config.style || MAPBOX_CONFIG.style;
      let mapCreated = false;
      let attempts = 0;

      for (const style of [mapStyle, ...MAPBOX_CONFIG.fallbackStyles]) {
        if (mapCreated) break;
        attempts++;

        try {
          console.log(`🗺️  Tentative ${attempts}: création carte avec style ${style}`);
          
          this.map = new mapboxgl.Map({
            container: config.container,
            style: style,
            center: config.center || MAPBOX_CONFIG.defaultCenter,
            zoom: config.zoom || MAPBOX_CONFIG.defaultZoom,
            maxZoom: MAPBOX_CONFIG.maxZoom,
            minZoom: MAPBOX_CONFIG.minZoom,
            attributionControl: false,
            failIfMajorPerformanceCaveat: false,
          });

          // Ajouter les contrôles
          this.map.addControl(new mapboxgl.NavigationControl(), 'top-right');
          this.map.addControl(new mapboxgl.FullscreenControl(), 'top-right');

          // Gestion des erreurs de style
          this.map.on('error', (e) => {
            console.error(`❌ Erreur style ${style}:`, e.error);
            if (attempts < MAPBOX_CONFIG.fallbackStyles.length + 1) {
              this.map?.remove();
              this.map = null;
            }
          });

          // Attendre le chargement
          await new Promise<void>((resolve, reject) => {
            const timeout = setTimeout(() => {
              reject(new Error('Timeout lors du chargement de la carte'));
            }, 10000);

            this.map!.on('load', () => {
              clearTimeout(timeout);
              mapCreated = true;
              console.log(`✅ Carte chargée avec succès (style: ${style})`);
              resolve();
            });

            this.map!.on('error', (e) => {
              clearTimeout(timeout);
              reject(e.error);
            });
          });

        } catch (error) {
          console.warn(`⚠️  Échec style ${style}:`, error);
          if (this.map) {
            this.map.remove();
            this.map = null;
          }
          if (attempts >= MAPBOX_CONFIG.fallbackStyles.length + 1) {
            throw error;
          }
        }
      }

      if (!mapCreated || !this.map) {
        throw new Error('Impossible de créer la carte avec tous les styles disponibles');
      }

      return this.map;
      return this.map;

    } catch (error) {
      console.error('❌ Erreur initialisation Mapbox:', error);
      return null;
    }
  }

  // Ajout de marqueurs avec popup
  public addMarkers(markers: MapboxMarker[]): void {
    if (!this.map) return;

    // Supprimer les anciens marqueurs
    this.clearMarkers();

    markers.forEach(markerData => {
      const el = document.createElement('div');
      el.className = 'mapbox-marker';
      el.style.cssText = `
        width: 32px;
        height: 32px;
        background: ${markerData.color || '#FF6B35'};
        border: 3px solid white;
        border-radius: 50%;
        box-shadow: 0 2px 6px rgba(0,0,0,0.3);
        cursor: pointer;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 16px;
        transition: transform 0.2s;
      `;
      el.innerHTML = this.getCategoryIcon(markerData.category);

      // Effet hover
      el.addEventListener('mouseenter', () => {
        el.style.transform = 'scale(1.1)';
      });
      el.addEventListener('mouseleave', () => {
        el.style.transform = 'scale(1)';
      });

      // Création du marqueur
      const marker = new mapboxgl.Marker(el)
        .setLngLat(markerData.coordinates)
        .addTo(this.map!);

      // Popup avec contenu riche
      const popup = new mapboxgl.Popup({
        offset: 25,
        closeButton: true,
        closeOnClick: false
      }).setHTML(`
        <div style="padding: 12px; min-width: 200px;">
          <h3 style="margin: 0 0 8px 0; color: #333; font-size: 16px;">${markerData.title}</h3>
          <p style="margin: 0 0 8px 0; color: #666; font-size: 14px; line-height: 1.4;">${markerData.description}</p>
          ${markerData.category ? `<span style="background: #e3f2fd; color: #1976d2; padding: 4px 8px; border-radius: 12px; font-size: 12px;">${markerData.category}</span>` : ''}
        </div>
      `);

      marker.setPopup(popup);
      this.markers.push(marker);
    });

    // Ajuster la vue pour inclure tous les marqueurs
    if (markers.length > 0) {
      this.fitToMarkers(markers);
    }
  }

  // Ajuster la vue aux marqueurs
  private fitToMarkers(markers: MapboxMarker[]): void {
    if (!this.map || markers.length === 0) return;

    const bounds = new mapboxgl.LngLatBounds();
    markers.forEach(marker => bounds.extend(marker.coordinates));

    this.map.fitBounds(bounds, {
      padding: 50,
      maxZoom: 15
    });
  }

  // Obtenir l'icône selon la catégorie
  private getCategoryIcon(category?: string): string {
    const icons: Record<string, string> = {
      'Monument': '🏛️',
      'Musée': '🏛️',
      'Parc': '🌳',
      'Plage': '🏖️',
      'Restaurant': '🍽️',
      'Hôtel': '🏨',
      'Shopping': '🛍️',
      'Culture': '🎭',
      'Nature': '🌿',
      'default': '📍'
    };
    return icons[category || 'default'] || icons.default;
  }

  // Nettoyer les marqueurs
  public clearMarkers(): void {
    this.markers.forEach(marker => marker.remove());
    this.markers = [];
  }

  // Voler vers une position
  public flyTo(coordinates: [number, number], zoom: number = 14): void {
    if (!this.map) return;
    
    this.map.flyTo({
      center: coordinates,
      zoom: zoom,
      duration: 1500
    });
  }

  // Nettoyage complet
  public cleanup(): void {
    if (this.map) {
      this.clearMarkers();
      this.map.remove();
      this.map = null;
    }
  }

  // Validation du token Mapbox
  public async validateToken(token?: string): Promise<boolean> {
    const tokenToCheck = token || MAPBOX_CONFIG.accessToken;
    
    if (!tokenToCheck) {
      throw new Error('Token Mapbox non configuré');
    }

    try {
      const response = await fetch(`https://api.mapbox.com/tokens/v2?access_token=${tokenToCheck}`);
      return response.ok;
    } catch (error) {
      throw new Error(`Erreur de validation du token: ${error instanceof Error ? error.message : 'Erreur inconnue'}`);
    }
  }

  // Validation du token statique
  public static async validateToken(token?: string): Promise<boolean> {
    const instance = MapboxService.getInstance();
    return instance.validateToken(token);
  }

  // Getters
  public getMap(): mapboxgl.Map | null {
    return this.map;
  }

  public isInitialized(): boolean {
    return this.map !== null;
  }
}

// Export du service singleton
export const mapboxService = MapboxService.getInstance();