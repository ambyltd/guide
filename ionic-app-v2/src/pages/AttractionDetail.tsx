/**
 * Page Détails Attraction
 * Affiche toutes les informations d'une attraction avec carte, audioguides, galerie photos
 */

import React, { useState, useEffect, useRef } from 'react';
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
  useIonViewDidEnter,
  useIonViewWillLeave,
  IonFab,
  IonFabButton,
  IonModal,
  IonGrid,
  IonRow,
  IonCol,
  IonTextarea,
} from '@ionic/react';
import {
  heartOutline,
  heart,
  // shareOutline, // DÉSACTIVÉ: Fonction de partage retirée
  locationOutline,
  timeOutline,
  star,
  starOutline,
  playCircle,
  callOutline,
  globeOutline,
  navigateOutline,
  imageOutline,
  closeOutline,
  downloadOutline,
  checkmarkCircle,
  chatbubbleOutline,
  personCircleOutline,
  thumbsUpOutline,
  flagOutline,
} from 'ionicons/icons';
import { useParams, useHistory, useLocation } from 'react-router-dom';
import axios from 'axios';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import type { BackendAttraction, BackendAudioGuide } from '../types/backend';
import AudioPlayer from '../components/AudioPlayer';
import MapWithGeofencing from '../components/MapWithGeofencing';
import ReportReviewModal from '../components/ReportReviewModal';
import ProfileMenu from '../components/ProfileMenu';
// import ShareSheet, { type SharePlatform } from '../components/ShareSheet'; // DÉSACTIVÉ
import { audioCacheService } from '../services/audioCacheService';
import { reviewsService } from '../services/reviewsService';
import { favoritesService } from '../services/favoritesService';
import { userStatsService } from '../services/userStatsService';
import { moderationService } from '../services/moderationService';
// import { socialShareService } from '../services/socialShareService'; // DÉSACTIVÉ
import { useAuth } from '../hooks/useAuth';
import 'leaflet/dist/leaflet.css';
import './AttractionDetail.css';

// Fix pour les icônes Leaflet
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

// Import du type Review depuis le service
import type { Review } from '../services/reviewsService';

const AttractionDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const history = useHistory();
  const location = useLocation();
  const isMountedRef = useRef(true);
  const [attraction, setAttraction] = useState<BackendAttraction | null>(null);
  const [audioGuides, setAudioGuides] = useState<BackendAudioGuide[]>([]);
  const [loading, setLoading] = useState(true);
  const [isFavorite, setIsFavorite] = useState(false);
  const [selectedTab, setSelectedTab] = useState<'info' | 'audioguides' | 'photos' | 'reviews'>('info');
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [selectedAudioGuide, setSelectedAudioGuide] = useState<BackendAudioGuide | null>(null);
  const [isPlayerOpen, setIsPlayerOpen] = useState(false);
  // Pas besoin de mapRef avec Leaflet (géré par MapContainer)
  
  // 🎵 États pour le cache audio
  const [downloadProgress, setDownloadProgress] = useState<{ [key: string]: number }>({});
  const [downloadedAudios, setDownloadedAudios] = useState<Set<string>>(new Set());
  const [downloadingAudios, setDownloadingAudios] = useState<Set<string>>(new Set());

  // 📝 États pour les reviews
  const [reviews, setReviews] = useState<Review[]>([]);
  const [reviewsLoading, setReviewsLoading] = useState(false);
  const [newReviewRating, setNewReviewRating] = useState(5);
  const [newReviewComment, setNewReviewComment] = useState('');
  const [isSubmittingReview, setIsSubmittingReview] = useState(false);

  // � Récupérer l'utilisateur authentifié depuis Firebase
  const { user } = useAuth();

  // �🚩 États pour la modération (userId dynamique basé sur Firebase)
  const [reportModalOpen, setReportModalOpen] = useState(false);
  const [reviewToReport, setReviewToReport] = useState<string | null>(null);
  const currentUserId = user?.uid || '';

  // 🔗 État pour le partage social
  const [showShareSheet, setShowShareSheet] = useState<boolean>(false);

  // Initialiser les services une seule fois au montage avec Firebase user
  useEffect(() => {
    if (user) {
      const userId = user.uid;
      const userName = user.displayName || user.email || 'User';
      const userAvatar = user.photoURL || 'https://i.pravatar.cc/150?img=1';

      // Initialiser les services
      favoritesService.initialize(userId, userName);
      userStatsService.initialize(userId, userName);
      reviewsService.initialize(userId, userName, userAvatar);

      console.log('✅ Services initialisés avec userId:', userId);
    }
  }, [user]);

  // Charger les données à chaque fois qu'on entre dans la page OU que l'id change
  useIonViewDidEnter(() => {
    isMountedRef.current = true;
    console.log('📱 AttractionDetail - Page active, rechargement des données pour:', id);
    loadAttraction();
    loadAudioGuides();
    checkFavorite();
    loadReviews();
  });

  // Marquer comme inactive quand on quitte la page
  useIonViewWillLeave(() => {
    isMountedRef.current = false;
    console.log('📱 AttractionDetail - Page inactive');
  });

  // Recharger aussi si l'id change (navigation entre différentes attractions)
  useEffect(() => {
    if (id) {
      console.log('🔄 ID changé, rechargement des données pour:', id);
      loadAttraction();
      loadAudioGuides();
      checkFavorite();
      loadReviews();
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  // Gérer le focus lors du chargement de la page (fix aria-hidden warning)
  useEffect(() => {
    // Retirer le focus de tout élément lors du montage
    if (document.activeElement instanceof HTMLElement) {
      document.activeElement.blur();
    }
  }, []);

  // 🎵 Auto-play depuis QR Code Scanner
  useEffect(() => {
    if (!audioGuides.length || !isMountedRef.current) return;

    // Parser les query params (format: ?autoplay=true&language=fr)
    const searchParams = new URLSearchParams(location.search);
    const autoplay = searchParams.get('autoplay') === 'true';
    const preferredLang = searchParams.get('language') || 'fr';

    if (autoplay) {
      console.log('🎵 QR Code Auto-play détecté:', { preferredLang, audioGuides: audioGuides.length });

      // Sélectionner l'audioguide selon la langue préférée
      const audioGuide = audioGuides.find(ag => ag.language === preferredLang) || audioGuides[0];

      if (audioGuide) {
        console.log('▶️ Ouverture AudioPlayer automatique:', audioGuide.title);
        setSelectedAudioGuide(audioGuide);
        setIsPlayerOpen(true);
        setSelectedTab('audioguides'); // Switcher vers l'onglet audioguides

        // Nettoyer les query params pour éviter re-trigger au retour
        const newUrl = `${location.pathname}`;
        history.replace(newUrl);
      }
    }
  }, [audioGuides, location.search, history, location.pathname]);

  const loadAttraction = async () => {
    try {
      if (!isMountedRef.current) return;
      setLoading(true);
      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
      const response = await axios.get<{ data: BackendAttraction }>(
        `${apiUrl}/attractions/${id}`
      );
      if (!isMountedRef.current) return;
      setAttraction(response.data.data);
    } catch (error) {
      console.error('Erreur chargement attraction:', error);
    } finally {
      if (isMountedRef.current) {
        setLoading(false);
      }
    }
  };

  const loadAudioGuides = async () => {
    try {
      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
      const response = await axios.get<{ success: boolean; data: BackendAudioGuide[] }>(
        `${apiUrl}/audio-guides?attractionId=${id}`
      );
      if (!isMountedRef.current) return;
      if (response.data.success && Array.isArray(response.data.data)) {
        setAudioGuides(response.data.data);
        console.log('✅ AudioGuides chargés:', response.data.data.length);
      }
    } catch (error) {
      console.error('Erreur chargement audioguides:', error);
    }
  };

  const checkFavorite = async () => {
    // Protection: Ne pas appeler l'API si l'utilisateur n'est pas connecté OU si le token n'est pas prêt
    const authToken = localStorage.getItem('authToken');
    if (!user?.uid || !authToken) {
      // Fallback localStorage pour utilisateurs non connectés
      const savedFavorites = localStorage.getItem('favorites');
      if (savedFavorites) {
        const favorites = new Set(JSON.parse(savedFavorites));
        setIsFavorite(favorites.has(id));
      }
      return;
    }

    try {
      const isFav = await favoritesService.isFavorite(id);
      if (!isMountedRef.current) return;
      setIsFavorite(isFav);
    } catch (error) {
      console.error('Erreur vérification favori, fallback localStorage:', error);
      const savedFavorites = localStorage.getItem('favorites');
      if (savedFavorites) {
        const favorites = new Set(JSON.parse(savedFavorites));
        setIsFavorite(favorites.has(id));
      }
    }
  };

  const loadReviews = async () => {
    try {
      if (!isMountedRef.current) return;
      setReviewsLoading(true);
      const response = await reviewsService.getAttractionReviews(id, 1, 20);
      if (!isMountedRef.current) return;
      setReviews(response.data || []);
      console.log('✅ Reviews chargés:', response.data?.length || 0);
    } catch (error) {
      console.error('❌ Erreur chargement reviews:', error);
      if (!isMountedRef.current) return;
      setReviews([]);
    } finally {
      if (isMountedRef.current) {
        setReviewsLoading(false);
      }
    }
  };

  const handleSubmitReview = async () => {
    if (!newReviewComment.trim() || newReviewComment.length < 10) {
      alert('Le commentaire doit contenir au moins 10 caractères');
      return;
    }

    if (newReviewRating < 1 || newReviewRating > 5) {
      alert('La note doit être entre 1 et 5');
      return;
    }

    try {
      setIsSubmittingReview(true);
      await reviewsService.createReview({
        attractionId: id,
        rating: newReviewRating,
        comment: newReviewComment,
        language: 'fr',
      });

      // Incrémenter le compteur de reviews dans userStats
      await userStatsService.incrementStat('reviewCount', 1);

      // Recharger les reviews
      await loadReviews();

      // Réinitialiser le formulaire
      setNewReviewComment('');
      setNewReviewRating(5);

      console.log('✅ Review créée avec succès');
      alert('Votre avis a été publié avec succès !');
    } catch (error) {
      console.error('❌ Erreur création review:', error);
      alert('Erreur lors de la publication de votre avis');
    } finally {
      setIsSubmittingReview(false);
    }
  };

  // SUPPRIMÉ: Initialisation de la carte Mapbox (remplacée par MapContainer Leaflet dans le JSX)

  // Toggle favori (Bouton visible uniquement si user connecté)
  const toggleFavorite = async () => {
    const previousState = isFavorite;
    try {
      // Essayer favoritesService (online)
      const newIsFavorite = await favoritesService.toggleFavorite(id);
      setIsFavorite(newIsFavorite);
      console.log(`✅ Favori ${newIsFavorite ? 'ajouté' : 'retiré'} avec succès`);

      // Incrémenter/décrémenter userStats
      if (newIsFavorite) {
        await userStatsService.incrementStat('favoriteCount', 1);
      } else {
        await userStatsService.incrementStat('favoriteCount', -1);
      }
    } catch (error) {
      console.error('❌ Erreur toggle favori, fallback localStorage:', error);
      // Fallback localStorage pour offline
      const savedFavorites = localStorage.getItem('favorites');
      const favorites = savedFavorites ? new Set(JSON.parse(savedFavorites)) : new Set();

      if (previousState) {
        favorites.delete(id);
      } else {
        favorites.add(id);
      }

      localStorage.setItem('favorites', JSON.stringify(Array.from(favorites)));
      setIsFavorite(!previousState);
    }
  };

  /* DÉSACTIVÉ: Fonction de partage social
  // 🔗 Partager - Ouvrir le ShareSheet modal
  const handleShare = () => {
    setShowShareSheet(true);
  };

  // 🔗 Partager sur une plateforme spécifique
  const handleSharePlatform = async (platform: SharePlatform) => {
    if (!attraction) return;

    try {
      switch (platform) {
        case 'whatsapp':
          await socialShareService.shareToWhatsApp(
            `${attraction.name} - ${attraction.description.slice(0, 100)}... Découvrez plus sur Ambyl! ${window.location.href}`,
            window.location.href
          );
          break;
        
        case 'facebook':
          await socialShareService.shareToFacebook(window.location.href);
          break;
        
        case 'twitter':
          await socialShareService.shareToTwitter(
            `${attraction.name} - ${attraction.description.slice(0, 100)}...`,
            window.location.href
          );
          break;
        
        case 'native':
          await socialShareService.shareAttraction({
            attractionId: attraction._id,
            attractionName: attraction.name,
            description: attraction.description,
            imageUrl: attraction.images?.[0],
            rating: attraction.rating,
          });
          break;
      }
      
      console.log('✅ Partagé avec succès sur', platform);
    } catch (error) {
      console.error('❌ Erreur partage:', error);
    }
  };
  FIN DÉSACTIVÉ */

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

  // 🗺️ Callback pour le geofencing (déclenchement automatique de l'audio)
  const handleGeofenceTrigger = (guide: BackendAudioGuide) => {
    console.log('🎯 Geofence trigger pour audioguide:', guide.title);
    console.log('✅ Audioguide reçu du geofencing, ouverture du player avec auto-play');
    setSelectedAudioGuide(guide);
    setIsPlayerOpen(true);
    // Le AudioPlayer détectera qu'il vient d'être ouvert et lancera la lecture automatiquement
  };

  // 🎵 Vérifier quels audios sont déjà téléchargés
  useEffect(() => {
    if (audioGuides.length === 0) return;

    Promise.all(
      audioGuides.map(async (guide) => {
        const isDownloaded = await audioCacheService.isDownloaded(guide._id);
        return { id: guide._id, isDownloaded };
      })
    ).then((results) => {
      const downloaded = new Set(
        results.filter(r => r.isDownloaded).map(r => r.id)
      );
      setDownloadedAudios(downloaded);
      console.log(`✅ ${downloaded.size}/${audioGuides.length} audios déjà téléchargés`);
    });
  }, [audioGuides]);

  // 🎵 Télécharger un audio guide
  const handleDownloadAudio = async (audioGuide: BackendAudioGuide) => {
    if (!attraction) return;

    const audioId = audioGuide._id;
    
    // Déjà en cours de téléchargement
    if (downloadingAudios.has(audioId)) {
      console.log('⏳ Téléchargement déjà en cours:', audioGuide.title);
      return;
    }

    // Déjà téléchargé
    if (downloadedAudios.has(audioId)) {
      console.log('✅ Audio déjà téléchargé:', audioGuide.title);
      return;
    }

    setDownloadingAudios(prev => new Set(prev).add(audioId));
    console.log(`📥 Téléchargement audio: ${audioGuide.title} (${audioGuide.language})`);

    try {
      const success = await audioCacheService.downloadAudio(
        audioId,
        audioGuide.audioUrl,
        attraction._id,
        audioGuide.language,
        'high',
        (progress) => {
          setDownloadProgress(prev => ({ ...prev, [audioId]: progress.percentage }));
          if (progress.percentage % 10 === 0) { // Log tous les 10%
            console.log(
              `📥 ${audioGuide.title}: ${progress.percentage}% ` +
              `(${progress.speed} - ${progress.timeRemaining})`
            );
          }
        }
      );

      if (success) {
        setDownloadedAudios(prev => new Set(prev).add(audioId));
        console.log('✅ Audio téléchargé avec succès:', audioGuide.title);
      } else {
        console.error('❌ Échec téléchargement audio:', audioGuide.title);
      }
    } catch (error) {
      console.error('❌ Erreur téléchargement audio:', error);
    } finally {
      setDownloadingAudios(prev => {
        const next = new Set(prev);
        next.delete(audioId);
        return next;
      });
      setDownloadProgress(prev => {
        const next = { ...prev };
        delete next[audioId];
        return next;
      });
    }
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
            <IonBackButton />
          </IonButtons>
          <IonButtons slot="end">
            {/* Bouton favori - Visible uniquement si connecté */}
            {user && (
              <IonButton onClick={toggleFavorite}>
                <IonIcon
                  icon={isFavorite ? heart : heartOutline}
                  {...(isFavorite && { color: 'danger' })}
                />
              </IonButton>
            )}
            {/* DÉSACTIVÉ: Bouton de partage retiré
            <IonButton onClick={handleShare}>
              <IonIcon icon={shareOutline} />
            </IonButton>
            */}
            <ProfileMenu />
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
        <IonSegment 
          value={selectedTab} 
          onIonChange={(e) => {
            const val = e.detail.value;
            if (val) setSelectedTab(val as 'info' | 'audioguides' | 'photos' | 'reviews');
          }}
        >
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
          <IonSegmentButton value="reviews">
            <IonLabel>
              Avis
              {reviews.length > 0 && (
                <IonBadge color="primary" style={{ marginLeft: '5px' }}>
                  {reviews.length}
                </IonBadge>
              )}
            </IonLabel>
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


          </div>
        )}

        {/* Contenu - AudioGuides avec Carte Interactive */}
        {selectedTab === 'audioguides' && (
          <div className="tab-content">
            {/* Carte Interactive avec Geofencing */}
            {attraction && (
              <div className="map-section">
                <MapWithGeofencing
                  attraction={attraction}
                  audioGuides={audioGuides}
                  onGeofenceTrigger={handleGeofenceTrigger}
                />
              </div>
            )}

            {/* Liste des AudioGuides */}
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
              <div className="audioguides-list">
                {audioGuides.map((guide) => {
                  const isDownloaded = downloadedAudios.has(guide._id);
                  const isDownloading = downloadingAudios.has(guide._id);
                  const progress = downloadProgress[guide._id] || 0;

                  return (
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
                            {isDownloaded && (
                              <IonChip color="success">
                                <IonIcon icon={checkmarkCircle} />
                                <IonLabel>Téléchargé</IonLabel>
                              </IonChip>
                            )}
                          </div>
                          {isDownloading && (
                            <div className="download-progress">
                              <div className="progress-bar"></div>
                              <span className="progress-text">{progress}%</span>
                            </div>
                          )}
                        </IonLabel>
                        {!isDownloaded && !isDownloading && (
                          <IonButton 
                            fill="clear" 
                            slot="end"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDownloadAudio(guide);
                            }}
                          >
                            <IonIcon icon={downloadOutline} />
                          </IonButton>
                        )}
                        {!isDownloading && (
                          <IonIcon icon={playCircle} slot="end" size="large" color="primary" />
                        )}
                      </IonItem>
                    </IonCard>
                  );
                })}
              </div>
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

        {/* Contenu - Avis */}
        {selectedTab === 'reviews' && (
          <div className="tab-content">
            {/* Formulaire création avis (visible uniquement si user connecté) */}
            {user ? (
              <IonCard>
                <IonCardHeader>
                  <IonCardTitle>Donner votre avis</IonCardTitle>
                </IonCardHeader>
                <IonCardContent>
                  {/* Notation étoiles */}
                  <div style={{ marginBottom: '15px' }}>
                    <IonText>
                      <p style={{ marginBottom: '10px', fontWeight: 'bold' }}>Note : {newReviewRating}/5</p>
                    </IonText>
                    <div style={{ display: 'flex', gap: '5px' }}>
                      {[1, 2, 3, 4, 5].map((starNum) => (
                        <IonIcon
                          key={starNum}
                          icon={starNum <= newReviewRating ? star : starOutline}
                          style={{ fontSize: '32px', color: '#ffc409', cursor: 'pointer' }}
                          onClick={() => setNewReviewRating(starNum)}
                        />
                      ))}
                    </div>
                  </div>

                  {/* Commentaire */}
                  <IonTextarea
                    placeholder="Partagez votre expérience (minimum 10 caractères)..."
                    value={newReviewComment}
                    onIonInput={(e) => setNewReviewComment(e.detail.value || '')}
                    rows={4}
                    maxlength={1000}
                    style={{ border: '1px solid #ddd', borderRadius: '8px', padding: '10px' }}
                  />
                  <IonText color="medium">
                    <p style={{ fontSize: '12px', marginTop: '5px' }}>
                      {newReviewComment.length}/1000 caractères
                    </p>
                  </IonText>

                  {/* Bouton soumettre */}
                  <IonButton
                    expand="block"
                    onClick={handleSubmitReview}
                    disabled={isSubmittingReview || newReviewComment.length < 10}
                    style={{ marginTop: '15px' }}
                  >
                    {isSubmittingReview ? 'Publication...' : 'Publier mon avis'}
                  </IonButton>
                </IonCardContent>
              </IonCard>
            ) : (
              <IonCard>
                <IonCardHeader>
                  <IonCardTitle>Donner votre avis</IonCardTitle>
                </IonCardHeader>
                <IonCardContent>
                  <p>Connectez-vous pour laisser un avis.</p>
                  <IonButton expand="block" onClick={() => history.push('/login')}>Se connecter</IonButton>
                </IonCardContent>
              </IonCard>
            )}

            {/* Liste des avis */}
            {reviewsLoading ? (
              <IonCard>
                <IonCardContent>
                  <div style={{ textAlign: 'center', padding: '20px' }}>
                    <IonSpinner name="crescent" />
                    <IonText>
                      <p>Chargement des avis...</p>
                    </IonText>
                  </div>
                </IonCardContent>
              </IonCard>
            ) : reviews.length === 0 ? (
              <IonCard>
                <IonCardContent>
                  <div className="empty-state">
                    <IonIcon icon={chatbubbleOutline} className="empty-icon" />
                    <IonText>
                      <h3>Aucun avis pour le moment</h3>
                      <p>Soyez le premier à partager votre expérience !</p>
                    </IonText>
                  </div>
                </IonCardContent>
              </IonCard>
            ) : (
              <>
                <IonCard>
                  <IonCardHeader>
                    <IonCardTitle>Avis des visiteurs ({reviews.length})</IonCardTitle>
                  </IonCardHeader>
                </IonCard>
                {reviews.map((review) => (
                  <IonCard key={review._id}>
                    <IonCardContent>
                      {/* En-tête avis */}
                      <div style={{ display: 'flex', alignItems: 'center', marginBottom: '10px' }}>
                        <div style={{ marginRight: '10px' }}>
                          {review.userAvatar ? (
                            <img
                              src={review.userAvatar}
                              alt={review.userName}
                              style={{ width: '40px', height: '40px', borderRadius: '50%' }}
                            />
                          ) : (
                            <IonIcon icon={personCircleOutline} style={{ fontSize: '40px', color: '#999' }} />
                          )}
                        </div>
                        <div style={{ flex: 1 }}>
                          <IonText>
                            <h3 style={{ margin: 0, fontSize: '16px', fontWeight: 'bold' }}>
                              {review.userName || 'Anonyme'}
                            </h3>
                          </IonText>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '3px', marginTop: '3px' }}>
                            {[1, 2, 3, 4, 5].map((starNum) => (
                              <IonIcon
                                key={starNum}
                                icon={starNum <= review.rating ? star : starOutline}
                                style={{ fontSize: '16px', color: '#ffc409' }}
                              />
                            ))}
                            <IonText color="medium">
                              <span style={{ fontSize: '12px', marginLeft: '8px' }}>
                                {new Date(review.createdAt).toLocaleDateString('fr-FR')}
                              </span>
                            </IonText>
                          </div>
                        </div>
                      </div>

                      {/* Commentaire */}
                      <IonText>
                        <p style={{ margin: 0, lineHeight: '1.5' }}>{review.comment}</p>
                      </IonText>

                      {/* Badge modération */}
                      {(() => {
                        const badge = moderationService.getStatusBadge(review);
                        return badge ? (
                          <IonBadge color={badge.color} style={{ marginTop: '10px' }}>
                            {badge.icon} {badge.text}
                          </IonBadge>
                        ) : null;
                      })()}

                      {/* Actions */}
                      <div style={{ display: 'flex', gap: '10px', marginTop: '15px' }}>
                        <IonChip color="light">
                          <IonIcon icon={thumbsUpOutline} />
                          <IonLabel>Utile</IonLabel>
                        </IonChip>
                        <IonChip
                          color="light"
                          onClick={() => {
                            setReviewToReport(review._id);
                            setReportModalOpen(true);
                          }}
                          style={{ cursor: 'pointer' }}
                          disabled={moderationService.hasUserReported(review, currentUserId)}
                        >
                          <IonIcon icon={flagOutline} />
                          <IonLabel>
                            {moderationService.hasUserReported(review, currentUserId)
                              ? 'Déjà signalé'
                              : 'Signaler'}
                          </IonLabel>
                        </IonChip>
                      </div>
                    </IonCardContent>
                  </IonCard>
                ))}
              </>
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

        {/* Modal de signalement de review */}
        <ReportReviewModal
          isOpen={reportModalOpen}
          onClose={() => {
            setReportModalOpen(false);
            setReviewToReport(null);
          }}
          reviewId={reviewToReport || ''}
          userId={currentUserId}
          onReported={(reportCount, flagged) => {
            // Rafraîchir les reviews après signalement
            console.log(`Review signalée: ${reportCount} signalements, flagged: ${flagged}`);
            loadReviews();
          }}
        />

        {/* DÉSACTIVÉ: ShareSheet Modal - Sprint 4 Phase 4
        <ShareSheet
          isOpen={showShareSheet}
          onClose={() => setShowShareSheet(false)}
          onShare={handleSharePlatform}
          title="Partager cette attraction"
        />
        */}
      </IonContent>
    </IonPage>
  );
};

export default AttractionDetailPage;
