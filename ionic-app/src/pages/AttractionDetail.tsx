/**
 * Page Détails Attraction
 * Affiche toutes les informations d'une attraction avec carte, audioguides, galerie photos
 */

import React, { useState, useEffect } from 'react';
import {
  IonPage,
  IonHeader,
  IonToolbar,
  IonTitle,
  IonContent,
  IonBackButton,
  IonButtons,
  IonButton,
  IonIcon,
  IonSpinner,
  IonText,
  IonCard,
  IonCardHeader,
  IonCardTitle,
  IonCardContent,
  IonChip,
  IonLabel,
  IonSegment,
  IonSegmentButton,
  IonList,
  IonItem,
  IonThumbnail,
  IonBadge,
  IonFab,
  IonFabButton,
  IonModal,
  IonGrid,
  IonRow,
  IonCol,
} from '@ionic/react';
import {
  heartOutline,
  heart,
  shareOutline,
  locationOutline,
  timeOutline,
  star,
  playCircle,
  mapOutline,
  callOutline,
  globeOutline,
  navigateOutline,
  imageOutline,
  closeOutline,
} from 'ionicons/icons';
import { useParams, useHistory } from 'react-router-dom';
import axios from 'axios';
import mapboxgl from 'mapbox-gl';
import type { BackendAttraction, BackendAudioGuide } from '../types/backend';
import AudioPlayer from '../components/AudioPlayer';
import 'mapbox-gl/dist/mapbox-gl.css';
import './AttractionDetail.css';

// Configuration Mapbox
mapboxgl.accessToken = import.meta.env.VITE_MAPBOX_TOKEN || '';

interface RouteParams {
  id: string;
}

const AttractionDetailPage: React.FC = () => {
  const { id } = useParams<RouteParams>();
  const history = useHistory();
  const [attraction, setAttraction] = useState<BackendAttraction | null>(null);
  const [audioGuides, setAudioGuides] = useState<BackendAudioGuide[]>([]);
  const [loading, setLoading] = useState(true);
  const [isFavorite, setIsFavorite] = useState(false);
  const [selectedTab, setSelectedTab] = useState<'info' | 'audioguides' | 'photos'>('info');
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [selectedAudioGuide, setSelectedAudioGuide] = useState<BackendAudioGuide | null>(null);
  const [isPlayerOpen, setIsPlayerOpen] = useState(false);
  const mapContainerRef = React.useRef<HTMLDivElement>(null);
  const mapRef = React.useRef<mapboxgl.Map | null>(null);

  // Charger l'attraction
  useEffect(() => {
    loadAttraction();
    loadAudioGuides();
    checkFavorite();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  // Gérer le focus lors du chargement de la page (fix aria-hidden warning)
  useEffect(() => {
    // Retirer le focus de tout élément lors du montage
    if (document.activeElement instanceof HTMLElement) {
      document.activeElement.blur();
    }
  }, []);

  const loadAttraction = async () => {
    try {
      setLoading(true);
      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
      const response = await axios.get<{ data: BackendAttraction }>(
        `${apiUrl}/attractions/${id}`
      );
      setAttraction(response.data.data);
    } catch (error) {
      console.error('Erreur chargement attraction:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadAudioGuides = async () => {
    try {
      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
      const response = await axios.get<{ success: boolean; data: BackendAudioGuide[] }>(
        `${apiUrl}/audio-guides?attractionId=${id}`
      );
      if (response.data.success && Array.isArray(response.data.data)) {
        setAudioGuides(response.data.data);
        console.log('✅ AudioGuides chargés:', response.data.data.length);
      }
    } catch (error) {
      console.error('Erreur chargement audioguides:', error);
    }
  };

  const checkFavorite = () => {
    const savedFavorites = localStorage.getItem('favorites');
    if (savedFavorites) {
      const favorites = new Set(JSON.parse(savedFavorites));
      setIsFavorite(favorites.has(id));
    }
  };

  // Initialiser la map preview
  useEffect(() => {
    if (!attraction || !attraction.location?.coordinates || !mapContainerRef.current || mapRef.current) {
      return;
    }

    const [lng, lat] = attraction.location.coordinates;

    // Créer la map preview
    mapRef.current = new mapboxgl.Map({
      container: mapContainerRef.current,
      style: 'mapbox://styles/mapbox/streets-v12',
      center: [lng, lat],
      zoom: 14,
      interactive: false, // Désactiver les interactions (preview seulement)
    });

    // Ajouter un marker
    new mapboxgl.Marker({ color: '#3880ff' })
      .setLngLat([lng, lat])
      .setPopup(
        new mapboxgl.Popup({ offset: 25 }).setHTML(
          `<h3>${attraction.name}</h3><p>${attraction.city}</p>`
        )
      )
      .addTo(mapRef.current);

    // Cleanup
    return () => {
      mapRef.current?.remove();
      mapRef.current = null;
    };
  }, [attraction]);

  // Toggle favori
  const toggleFavorite = () => {
    const savedFavorites = localStorage.getItem('favorites');
    const favorites = savedFavorites ? new Set(JSON.parse(savedFavorites)) : new Set();

    if (favorites.has(id)) {
      favorites.delete(id);
    } else {
      favorites.add(id);
    }

    localStorage.setItem('favorites', JSON.stringify(Array.from(favorites)));
    setIsFavorite(favorites.has(id));
  };

  // Partager
  const handleShare = async () => {
    if (navigator.share && attraction) {
      try {
        await navigator.share({
          title: attraction.name,
          text: attraction.description,
          url: window.location.href,
        });
      } catch {
        console.log('Partage annulé');
      }
    }
  };

  // Navigation
  const goToMap = () => {
    if (attraction) {
      history.push(`/tabs/map?attractionId=${attraction._id}`);
    }
  };

  const playAudioGuide = (audioGuideId: string) => {
    const guide = audioGuides.find(g => g._id === audioGuideId);
    if (guide) {
      setSelectedAudioGuide(guide);
      setIsPlayerOpen(true);
    }
  };

  const closePlayer = () => {
    setIsPlayerOpen(false);
    setSelectedAudioGuide(null);
  };

  // Formater la durée
  const formatDuration = (seconds: number): string => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  // Formater les horaires d'ouverture
  const formatOpeningHours = (openingHours: unknown): string => {
    if (!openingHours) {
      return 'Horaires non disponibles';
    }

    // Si c'est déjà une string, la retourner directement
    if (typeof openingHours === 'string') {
      return openingHours;
    }

    // Si c'est un objet, formater les jours
    if (typeof openingHours === 'object') {
      const days = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];
      const dayLabels: Record<string, string> = {
        monday: 'Lun',
        tuesday: 'Mar',
        wednesday: 'Mer',
        thursday: 'Jeu',
        friday: 'Ven',
        saturday: 'Sam',
        sunday: 'Dim'
      };

      const hoursObj = openingHours as Record<string, { open?: string; close?: string; closed?: boolean }>;
      const schedules: string[] = [];
      days.forEach(day => {
        if (hoursObj[day]?.open && hoursObj[day]?.close) {
          schedules.push(`${dayLabels[day]}: ${hoursObj[day].open}-${hoursObj[day].close}`);
        } else if (hoursObj[day]?.closed) {
          schedules.push(`${dayLabels[day]}: Fermé`);
        }
      });

      return schedules.length > 0 ? schedules.join(', ') : 'Horaires non disponibles';
    }

    return 'Horaires non disponibles';
  };

  // Loading
  if (loading) {
    return (
      <IonPage>
        <IonHeader>
          <IonToolbar>
            <IonButtons slot="start">
              <IonBackButton defaultHref="/home" />
            </IonButtons>
            <IonTitle>Chargement...</IonTitle>
          </IonToolbar>
        </IonHeader>
        <IonContent>
          <div className="loading-container">
            <IonSpinner name="crescent" />
          </div>
        </IonContent>
      </IonPage>
    );
  }

  // Erreur
  if (!attraction) {
    return (
      <IonPage>
        <IonHeader>
          <IonToolbar>
            <IonButtons slot="start">
              <IonBackButton defaultHref="/tabs/home" />
            </IonButtons>
          </IonToolbar>
        </IonHeader>
        <IonContent>
          <div className="error-container">
            <IonText color="danger">
              <h2>Attraction non trouvée</h2>
              <p>L'attraction demandée n'existe pas ou a été supprimée.</p>
            </IonText>
            <IonButton routerLink="/home">Retour à l'accueil</IonButton>
          </div>
        </IonContent>
      </IonPage>
    );
  }

  const mainImage =
    attraction.images && attraction.images.length > 0
      ? attraction.images[0]
      : '/assets/default-attraction.jpg';

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonButtons slot="start">
            <IonBackButton defaultHref="/tabs/home" />
          </IonButtons>
          <IonButtons slot="end">
            <IonButton onClick={toggleFavorite}>
              <IonIcon
                icon={isFavorite ? heart : heartOutline}
                {...(isFavorite && { color: 'danger' })}
              />
            </IonButton>
            <IonButton onClick={handleShare}>
              <IonIcon icon={shareOutline} />
            </IonButton>
          </IonButtons>
        </IonToolbar>
      </IonHeader>

      <IonContent>
        {/* Image principale */}
        <div className="attraction-hero" style={{ backgroundImage: `url(${mainImage})` }}>
          <div className="hero-overlay">
            <h1>{attraction.name}</h1>
            {attraction.rating && (
              <div className="rating-badge">
                <IonIcon icon={star} />
                <span>{attraction.rating.toFixed(1)}</span>
              </div>
            )}
          </div>
        </div>

        {/* Onglets */}
        <IonSegment value={selectedTab} onIonChange={(e) => setSelectedTab(e.detail.value as 'info' | 'audioguides' | 'photos')}>
          <IonSegmentButton value="info">
            <IonLabel>Informations</IonLabel>
          </IonSegmentButton>
          <IonSegmentButton value="audioguides">
            <IonLabel>
              AudioGuides
              {audioGuides.length > 0 && (
                <IonBadge color="primary" style={{ marginLeft: '5px' }}>
                  {audioGuides.length}
                </IonBadge>
              )}
            </IonLabel>
          </IonSegmentButton>
          <IonSegmentButton value="photos">
            <IonLabel>Photos</IonLabel>
          </IonSegmentButton>
        </IonSegment>

        {/* Contenu - Informations */}
        {selectedTab === 'info' && (
          <div className="tab-content">
            {/* Description */}
            <IonCard>
              <IonCardHeader>
                <IonCardTitle>Description</IonCardTitle>
              </IonCardHeader>
              <IonCardContent>
                <IonText>
                  <p>{attraction.description}</p>
                </IonText>
                <IonChip color="primary">
                  <IonLabel>{attraction.category}</IonLabel>
                </IonChip>
              </IonCardContent>
            </IonCard>

            {/* Détails */}
            <IonCard>
              <IonCardHeader>
                <IonCardTitle>Détails</IonCardTitle>
              </IonCardHeader>
              <IonCardContent>
                <IonList lines="none">
                  {/* Localisation */}
                  <IonItem>
                    <IonIcon icon={locationOutline} slot="start" color="primary" />
                    <IonLabel>
                      <h3>Localisation</h3>
                      <p>{attraction.address || 'Adresse non disponible'}</p>
                    </IonLabel>
                  </IonItem>

                  {/* Horaires */}
                  {attraction.openingHours && (
                    <IonItem>
                      <IonIcon icon={timeOutline} slot="start" color="primary" />
                      <IonLabel>
                        <h3>Horaires</h3>
                        <p>{formatOpeningHours(attraction.openingHours)}</p>
                      </IonLabel>
                    </IonItem>
                  )}

                  {/* Téléphone */}
                  {attraction.phone && (
                    <IonItem button href={`tel:${attraction.phone}`}>
                      <IonIcon icon={callOutline} slot="start" color="primary" />
                      <IonLabel>
                        <h3>Téléphone</h3>
                        <p>{attraction.phone}</p>
                      </IonLabel>
                    </IonItem>
                  )}

                  {/* Site web */}
                  {attraction.website && (
                    <IonItem button href={attraction.website} target="_blank">
                      <IonIcon icon={globeOutline} slot="start" color="primary" />
                      <IonLabel>
                        <h3>Site web</h3>
                        <p>{attraction.website}</p>
                      </IonLabel>
                    </IonItem>
                  )}
                </IonList>
              </IonCardContent>
            </IonCard>

            {/* Carte */}
            <IonCard>
              <IonCardHeader>
                <IonCardTitle>Carte</IonCardTitle>
              </IonCardHeader>
              <IonCardContent>
                {attraction.location?.coordinates ? (
                  <div>
                    {/* Map Preview Mapbox GL JS */}
                    <div 
                      ref={mapContainerRef} 
                      className="map-preview-container"
                    />
                    
                    {/* Boutons d'action */}
                    <div className="map-actions">
                      <IonButton expand="block" onClick={goToMap}>
                        <IonIcon icon={mapOutline} slot="start" />
                        Voir en plein écran
                      </IonButton>
                      
                      <IonButton 
                        expand="block" 
                        fill="outline"
                        onClick={() => {
                          const [lng, lat] = attraction.location.coordinates;
                          window.open(`https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`, '_blank');
                        }}
                      >
                        <IonIcon icon={navigateOutline} slot="start" />
                        Itinéraire
                      </IonButton>
                    </div>
                    
                    {/* Coordonnées GPS */}
                    <IonText color="medium" className="gps-coordinates">
                      <p>
                        <small>
                          GPS: {attraction.location.coordinates[1].toFixed(4)}°N, {' '}
                          {attraction.location.coordinates[0].toFixed(4)}°E
                        </small>
                      </p>
                    </IonText>
                  </div>
                ) : (
                  <div className="map-preview">
                    <IonText color="medium">
                      <p>Coordonnées GPS non disponibles</p>
                    </IonText>
                  </div>
                )}
              </IonCardContent>
            </IonCard>
          </div>
        )}

        {/* Contenu - AudioGuides */}
        {selectedTab === 'audioguides' && (
          <div className="tab-content">
            {audioGuides.length === 0 ? (
              <IonCard>
                <IonCardContent>
                  <div className="empty-state">
                    <IonIcon icon={playCircle} className="empty-icon" />
                    <IonText>
                      <h3>Aucun audioguide disponible</h3>
                      <p>Il n'y a pas encore d'audioguide pour cette attraction.</p>
                    </IonText>
                  </div>
                </IonCardContent>
              </IonCard>
            ) : (
              <IonList>
                {audioGuides.map((guide) => (
                  <IonCard key={guide._id} className="audioguide-card">
                    <IonItem button onClick={() => playAudioGuide(guide._id)}>
                      <IonThumbnail slot="start">
                        <img
                          src={guide.thumbnailUrl || '/assets/default-audio.jpg'}
                          alt={guide.title}
                        />
                      </IonThumbnail>
                      <IonLabel>
                        <h2>{guide.title}</h2>
                        <p>{guide.description}</p>
                        <div className="audioguide-meta">
                          <IonChip color="primary">
                            <IonLabel>{guide.language.toUpperCase()}</IonLabel>
                          </IonChip>
                          <IonChip>
                            <IonIcon icon={timeOutline} />
                            <IonLabel>{formatDuration(guide.duration)}</IonLabel>
                          </IonChip>
                        </div>
                      </IonLabel>
                      <IonIcon icon={playCircle} slot="end" size="large" color="primary" />
                    </IonItem>
                  </IonCard>
                ))}
              </IonList>
            )}
          </div>
        )}

        {/* Contenu - Photos */}
        {selectedTab === 'photos' && (
          <div className="tab-content">
            {!attraction.images || attraction.images.length === 0 ? (
              <IonCard>
                <IonCardContent>
                  <div className="empty-state">
                    <IonIcon icon={imageOutline} className="empty-icon" />
                    <IonText>
                      <h3>Aucune photo disponible</h3>
                      <p>Il n'y a pas encore de photos pour cette attraction.</p>
                    </IonText>
                  </div>
                </IonCardContent>
              </IonCard>
            ) : (
              <IonGrid>
                <IonRow>
                  {attraction.images.map((image, index) => (
                    <IonCol size="6" sizeMd="4" key={index}>
                      <div
                        className="photo-thumbnail"
                        style={{ backgroundImage: `url(${image})` }}
                        onClick={() => setSelectedImage(image)}
                      />
                    </IonCol>
                  ))}
                </IonRow>
              </IonGrid>
            )}
          </div>
        )}

        {/* FAB - Directions */}
        <IonFab vertical="bottom" horizontal="end" slot="fixed">
          <IonFabButton onClick={goToMap}>
            <IonIcon icon={navigateOutline} />
          </IonFabButton>
        </IonFab>

        {/* Modal image plein écran */}
        <IonModal isOpen={!!selectedImage} onDidDismiss={() => setSelectedImage(null)}>
          <IonHeader>
            <IonToolbar>
              <IonTitle>Photo</IonTitle>
              <IonButtons slot="end">
                <IonButton onClick={() => setSelectedImage(null)}>
                  <IonIcon icon={closeOutline} />
                </IonButton>
              </IonButtons>
            </IonToolbar>
          </IonHeader>
          <IonContent>
            {selectedImage && (
              <div className="fullscreen-image">
                <img src={selectedImage} alt="Photo en grand" />
              </div>
            )}
          </IonContent>
        </IonModal>

        {/* Lecteur Audio */}
        <AudioPlayer
          isOpen={isPlayerOpen}
          audioGuide={selectedAudioGuide}
          onClose={closePlayer}
        />
      </IonContent>
    </IonPage>
  );
};

export default AttractionDetailPage;
