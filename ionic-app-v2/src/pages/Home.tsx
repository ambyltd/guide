/**
 * Page Home - Écran d'accueil principal
 * Affiche attractions populaires, recherche rapide et accès audioguides
 */

import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  IonPage,
  IonHeader,
  IonToolbar,
  IonContent,
  IonSearchbar,
  IonCard,
  IonCardHeader,
  IonCardTitle,
  IonCardSubtitle,
  IonCardContent,
  IonButton,
  IonIcon,
  IonChip,
  useIonViewDidEnter,
  useIonViewWillLeave,
  IonLabel,
  IonSpinner,
  IonText,
  IonSegment,
  IonSegmentButton,
  IonFab,
  IonFabButton,
  IonBadge,
} from '@ionic/react';
import {
  locationOutline,
  playCircle,
  heartOutline,
  mapOutline,
  heart, // Used for filled heart when favorited
  trendingUpOutline,
  navigateOutline,
  timeOutline,
  starOutline,
  arrowForward,
  qrCodeOutline,
} from 'ionicons/icons';
import { useHistory } from 'react-router-dom';
import axios from 'axios';
import SearchFilters, { SearchFiltersState } from '../components/SearchFilters';
import QRCodeScanner from '../components/QRCodeScanner';
import { imageCacheService } from '../services/imageCacheService';
import { backgroundSyncService } from '../services/backgroundSyncService';
import { favoritesService } from '../services/favoritesService';
import { userStatsService } from '../services/userStatsService';
import { useAuth } from '../hooks/useAuth';
import './Home.css';

interface BackendAudioGuide {
  _id: string;
  title: string;
  duration: number;
  language: string;
}

interface BackendAttraction {
  _id: string;
  name: string;
  nameEn?: string;
  description?: string;
  city: string;
  region: string;
  category: string;
  location: {
    type: string;
    coordinates: [number, number];
  };
  images: string[];
  audioGuides?: BackendAudioGuide[];
  rating?: number;
  analytics?: {
    totalVisits?: number;
    uniqueVisitors?: number;
  };
  mlFeatures?: {
    visualAppeal?: number;
    popularity?: number;
  };
}

interface BackendTour {
  _id: string;
  name: string;
  nameEn?: string;
  description?: string;
  descriptionEn?: string;
  category: string;
  totalDuration: number;
  distance: number;
  difficulty: string;
  attractions: Array<{
    attraction: string;
    order: number;
    estimatedDuration: number;
  }>;
  pricing: {
    adult: number;
    child: number;
    currency: string;
  };
  price?: {
    adult: number;
    child?: number;
  };
  rating: number;
  reviewCount: number;
  images: string[];
  coverImage?: string;
}

const HomePage: React.FC = () => {
  const history = useHistory();
  const isMountedRef = useRef(true);
  const [searchText, setSearchText] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [attractions, setAttractions] = useState<BackendAttraction[]>([]);
  const [filteredAttractions, setFilteredAttractions] = useState<BackendAttraction[]>([]);
  const [tours, setTours] = useState<BackendTour[]>([]);
  const [filteredTours, setFilteredTours] = useState<BackendTour[]>([]);
  const [loading, setLoading] = useState(true);
  const [favorites, setFavorites] = useState<Set<string>>(new Set());
  const [isFiltersOpen, setIsFiltersOpen] = useState(false);
  const [isQRScannerOpen, setIsQRScannerOpen] = useState(false);
  const [filters, setFilters] = useState<SearchFiltersState>({
    searchText: '',
    categories: [],
    minRating: 0,
    maxDistance: 100,
    sortBy: 'popular',
    showOnlyFavorites: false,
  });

  const categories = [
    { value: 'all', label: 'Tous', icon: starOutline, isIonicon: true },
    { value: 'popular', label: 'Populaires', icon: trendingUpOutline, isIonicon: true },
    { value: 'museum', label: 'Musées', icon: '🏛️', isIonicon: false },
    { value: 'monument', label: 'Monuments', icon: '🗿', isIonicon: false },
    { value: 'nature', label: 'Nature', icon: '🌿', isIonicon: false },
    { value: 'historical', label: 'Historique', icon: '📜', isIonicon: false },
    { value: 'religious', label: 'Religieux', icon: '⛪', isIonicon: false },
    { value: 'market', label: 'Marchés', icon: '🛒', isIonicon: false },
  ];

  // 🔐 Récupérer l'utilisateur authentifié depuis Firebase
  const { user } = useAuth();

  // Initialiser les services une seule fois au montage avec Firebase user
  useEffect(() => {
    if (user) {
      const userId = user.uid;
      const userName = user.displayName || user.email || 'User';
      
      favoritesService.initialize(userId, userName);
      userStatsService.initialize(userId, userName);
      
      // ✅ Charger les favoris après initialisation
      loadFavorites();
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  // Charger les données au premier montage (attractions et tours seulement)
  useEffect(() => {
    console.log('📱 Home - Montage initial, chargement des données...');
    loadAttractions();
    loadTours();
    // loadFavorites() est maintenant appelé dans le useEffect de user
  }, []);

  // Charger les données à chaque fois qu'on entre dans la page (navigation entre tabs)
  useIonViewDidEnter(() => {
    isMountedRef.current = true;
    console.log('📱 Home - Page active (enter)');
  });

  // Marquer comme inactive quand on quitte la page
  useIonViewWillLeave(() => {
    isMountedRef.current = false;
    console.log('📱 Home - Page inactive (leave)');
  });

  // 🖼️ Précachage automatique des images d'attractions
  useEffect(() => {
    if (attractions.length === 0) return;

    const imageUrls: string[] = [];
    attractions.forEach((attraction) => {
      if (attraction.images && attraction.images.length > 0) {
        // Ajouter toutes les images de l'attraction
        imageUrls.push(...attraction.images.filter(url => url && url.trim()));
      }
    });

    if (imageUrls.length === 0) return;

    console.log(`🖼️ Précachage de ${imageUrls.length} images d'attractions...`);
    
    imageCacheService.precacheImages(imageUrls, 'high', (current, total) => {
      const percent = Math.round((current / total) * 100);
          console.log(`📊 Précachage images: ${current}/${total} (${percent}%)`);
    }).then(() => {
        console.log('✅ Précachage images terminé');
      imageCacheService.getStats().then(stats => {
        console.log(`📊 Cache images: ${stats.totalImages} images, ${imageCacheService.formatBytes(stats.totalSize)}`);
      });
    }).catch(err => {
      console.error('❌ Erreur précachage images:', err);
    });
  }, [attractions]);

  const loadAttractions = async () => {
    try {
      if (!isMountedRef.current) return;
      setLoading(true);
      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
      const response = await axios.get(`${apiUrl}/attractions`);
      if (!isMountedRef.current) return;
      if (response.data.success && response.data.data.attractions && Array.isArray(response.data.data.attractions)) {
        const loadedAttractions = response.data.data.attractions;
        setAttractions(loadedAttractions);
        setFilteredAttractions(loadedAttractions);
        
        // ✅ Sauvegarder dans localStorage pour le précachage Service Worker
        localStorage.setItem('attractionsList', JSON.stringify(loadedAttractions));
        
        console.log('✅ Attractions chargées:', loadedAttractions.length);
      }
    } catch (error) {
      console.error('? Erreur chargement attractions:', error);
    } finally {
      if (isMountedRef.current) {
        setLoading(false);
      }
    }
  };

  const loadTours = async () => {
    try {
      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
      const response = await axios.get(`${apiUrl}/tours`);
      if (!isMountedRef.current) return;
      if (response.data.success && Array.isArray(response.data.data)) {
        setTours(response.data.data);
        setFilteredTours(response.data.data);
        console.log('✅ Circuits chargés:', response.data.data.length);
      }
    } catch (error) {
      console.error('? Erreur chargement circuits:', error);
    }
  };

  const loadFavorites = useCallback(async () => {
    try {
      // ⚠️ Vérifier si l'utilisateur est authentifié ET si le token est présent
      const authToken = localStorage.getItem('authToken');
      if (!user?.uid || !authToken) {
        console.log('ℹ️ Utilisateur non connecté ou token absent, chargement favoris depuis localStorage');
        const saved = localStorage.getItem('favorites');
        if (saved) {
          setFavorites(new Set(JSON.parse(saved)));
        }
        return;
      }

      // Essayer de charger depuis l'API (utilisateur connecté)
      const favoriteIds = await favoritesService.getFavoriteIds();
      if (!isMountedRef.current) return;
      setFavorites(new Set(favoriteIds));
      console.log('✅ Favoris chargés depuis API:', favoriteIds.length);
    } catch (error) {
      console.error('❌ Erreur chargement favoris API, fallback localStorage:', error);
      if (!isMountedRef.current) return;
      
      // Fallback: Charger depuis localStorage
      const saved = localStorage.getItem('favorites');
      if (saved) {
        setFavorites(new Set(JSON.parse(saved)));
      }
    }
  }, [user?.uid]);

  const toggleFavorite = async (id: string) => {
    // ⚠️ VÉRIFICATION AUTHENTIFICATION - Seuls les utilisateurs connectés peuvent ajouter des favoris
    if (!user?.uid) {
      // Afficher un toast d'erreur
      const toast = document.createElement('ion-toast');
      toast.message = 'Veuillez vous connecter pour ajouter des favoris';
      toast.duration = 3000;
      toast.position = 'top';
      toast.color = 'warning';
      document.body.appendChild(toast);
      toast.present();
      
      // Rediriger vers la page de connexion après 2 secondes
      setTimeout(() => {
        window.location.href = '/login';
      }, 2000);
      return;
    }

    // 💚 Utiliser favoritesService avec fallback sur backgroundSyncService pour offline
    const isFavorite = favorites.has(id);

    try {
      // Essayer d'abord avec favoritesService (online)
      const newIsFavorite = await favoritesService.toggleFavorite(id);
      console.log(`✅ Favori ${newIsFavorite ? 'ajouté' : 'retiré'} avec succès`);
      
      // Incrémenter le compteur de favoris dans userStats
      if (newIsFavorite) {
        await userStatsService.incrementStat('favoriteCount', 1);
      } else {
        await userStatsService.incrementStat('favoriteCount', -1);
      }
    } catch (error) {
      console.error('❌ Erreur favoritesService (online), fallback sur backgroundSync:', error);
      
      // Fallback: Utiliser backgroundSyncService pour sync automatique en mode offline
      const userId = user.uid;
      try {
        if (isFavorite) {
          await backgroundSyncService.removeFavorite(id, userId);
          console.log('✅ Favori retiré (sync en arrière-plan)');
        } else {
          await backgroundSyncService.addFavorite(id, userId);
          console.log('✅ Favori ajouté (sync en arrière-plan)');
        }
      } catch (bgError) {
        console.error('❌ Erreur backgroundSync également:', bgError);
      }
    }

    // Mettre à jour l'UI immédiatement
    setFavorites((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      localStorage.setItem('favorites', JSON.stringify([...next]));
      return next;
    });
  };

  // Appliquer les filtres avancés
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
      sortBy: 'popular',
      showOnlyFavorites: false,
    };
    setFilters(defaultFilters);
    setSearchText('');
  };

  useEffect(() => {
    let filtered = [...attractions];
    let filteredToursTemp = [...tours];

    // Appliquer catégorie simple (barre de filtres rapides)
    if (selectedCategory === 'all') {
      filtered = [...attractions];
    } else if (selectedCategory === 'popular') {
      filtered = filtered.filter((a) => a.rating && a.rating >= 4);
      filtered.sort((a, b) => (b.rating || 0) - (a.rating || 0));
    } else {
      filtered = filtered.filter((a) => a.category === selectedCategory);
    }

    // Appliquer catégories avancées (filtre modal)
    if (filters.categories.length > 0) {
      filtered = filtered.filter((a) => filters.categories.includes(a.category));
    }

    // Appliquer note minimale
    if (filters.minRating > 0) {
      filtered = filtered.filter((a) => (a.rating || 0) >= filters.minRating);
    }

    // Appliquer favoris uniquement
    if (filters.showOnlyFavorites) {
      filtered = filtered.filter((a) => favorites.has(a._id));
    }

    // Appliquer recherche texte
    if (searchText.trim() || filters.searchText.trim()) {
      const search = (searchText || filters.searchText).toLowerCase().trim();
      filtered = filtered.filter(
        (a) =>
          a.name?.toLowerCase().includes(search) ||
          a.nameEn?.toLowerCase().includes(search) ||
          a.description?.toLowerCase().includes(search) ||
          a.city?.toLowerCase().includes(search) ||
          a.category?.toLowerCase().includes(search)
      );

      filteredToursTemp = filteredToursTemp.filter(
        (t) =>
          t.name?.toLowerCase().includes(search) ||
          t.nameEn?.toLowerCase().includes(search) ||
          t.description?.toLowerCase().includes(search)
      );
    }

    // Appliquer tri
    switch (filters.sortBy) {
      case 'rating':
        filtered.sort((a, b) => (b.rating || 0) - (a.rating || 0));
        break;
      case 'name':
        filtered.sort((a, b) => (a.name || '').localeCompare(b.name || ''));
        break;
      case 'popular':
        filtered.sort((a, b) => (b.mlFeatures?.popularity || 0) - (a.mlFeatures?.popularity || 0));
        break;
      case 'distance':
        // Distance nécessite géolocalisation - pas encore implémenté
        break;
    }

    console.log(`?? Filtrage: ${filtered.length} attractions, ${filteredToursTemp.length} circuits`);
    setFilteredAttractions(filtered);
    setFilteredTours(filteredToursTemp);
  }, [searchText, selectedCategory, attractions, tours, filters, favorites]);

  const goToAttractionDetail = (id: string) => {
    history.push(`/tabs/attraction/${id}`);
  };

  const goToMap = () => {
    history.push('/tabs/map');
  };

  const formatCategory = (category: string): string => {
    const mapping: Record<string, string> = {
      museum: 'Musée',
      monument: 'Monument',
      nature: 'Nature',
      historical: 'Historique',
      religious: 'Religieux',
      market: 'Marché',
      cultural: 'Culturel',
    };
    return mapping[category] || category;
  };

  return (
    <IonPage>
      <IonHeader className="ion-no-border" translucent collapse="fade">
        <IonToolbar style={{ 
          '--background': 'transparent',
          '--border-width': '0',
          '--min-height': '56px'
        }}>
          <IonSearchbar
            value={searchText}
            onIonInput={(e) => setSearchText(e.detail.value || '')}
            placeholder="Rechercher une attraction..."
            animated
            showCancelButton="focus"
            style={{
              '--background': 'white',
              '--color': 'var(--ion-color-dark)',
              '--placeholder-color': 'var(--ion-color-medium)',
              '--icon-color': 'var(--ion-color-primary)',
              '--border-radius': '12px',
              '--box-shadow': '0 2px 8px rgba(0,0,0,0.1)',
              padding: '8px 16px'
            }}
          />
        </IonToolbar>
      </IonHeader>

      <IonContent fullscreen className="home-page">
        {/* Hero section */}
        <div className="hero-section">
          <div className="hero-content">
            <h2>Découvrez la Côte d'Ivoire</h2>
            <p>Des plages paradisiaques aux sites historiques</p>
          </div>
        </div>

        <div className="categories-section">
          <IonSegment
            value={selectedCategory}
            onIonChange={(e) => setSelectedCategory(e.detail.value as string)}
            scrollable
          >
            {categories.map((cat) => (
              <IonSegmentButton key={cat.value} value={cat.value}>
                {cat.isIonicon ? (
                  <IonIcon icon={cat.icon as string} />
                ) : (
                  <span style={{ fontSize: '1.2rem', marginRight: '4px' }}>{cat.icon}</span>
                )}
                <IonLabel>{cat.label}</IonLabel>
              </IonSegmentButton>
            ))}
          </IonSegment>
        </div>

        {loading && (
          <div className="loading-container">
            <IonSpinner name="crescent" />
            <IonText>
              <p>Chargement des attractions...</p>
            </IonText>
          </div>
        )}

        {/* Section Attractions */}
        {!loading && (
          <div className="attractions-section" style={{ marginBottom: '32px' }}>
            <div style={{ padding: '0 16px', marginBottom: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <h2 style={{ 
                  fontSize: '1.6rem', 
                  fontWeight: 'bold', 
                  marginBottom: '8px',
                  color: 'var(--ion-color-primary)'
                }}>
                  🏛️ Attractions Populaires
                </h2>
                <p style={{ color: 'var(--ion-color-medium)', fontSize: '0.9rem' }}>
                  Découvrez les sites incontournables
                </p>
              </div>
            </div>

            {filteredAttractions.length === 0 ? (
              <IonCard>
                <IonCardContent>
                  <IonText color="medium">
                    <p style={{ textAlign: 'center', padding: '20px' }}>
                      Aucune attraction trouvée.
                    </p>
                  </IonText>
                </IonCardContent>
              </IonCard>
            ) : (
              <>
                <div style={{ 
                  display: 'flex',
                  overflowX: 'auto',
                  gap: '16px',
                  padding: '0 16px',
                  scrollSnapType: 'x mandatory',
                  WebkitOverflowScrolling: 'touch'
                }}>
                  {filteredAttractions.slice(0, 7).map((attraction) => {
                    const isFav = favorites.has(attraction._id);
                    return (
                      <IonCard 
                        key={attraction._id}
                        className="attraction-card" 
                        onClick={() => goToAttractionDetail(attraction._id)}
                        style={{ 
                          margin: 0,
                          minWidth: '280px',
                          maxWidth: '280px',
                          flexShrink: 0,
                          scrollSnapAlign: 'start'
                        }}
                      >
                        {attraction.images?.[0] && (
                          <img
                            src={attraction.images[0]}
                            alt={attraction.name}
                            style={{ width: '100%', height: '200px', objectFit: 'cover' }}
                          />
                        )}
                        <IonCardHeader>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
                            <IonCardTitle style={{ fontSize: '1.2rem' }}>
                              {attraction.name}
                            </IonCardTitle>
                            <IonIcon
                              icon={isFav ? heart : heartOutline}
                              color={isFav ? 'danger' : 'medium'}
                              style={{ fontSize: '1.5rem', cursor: 'pointer' }}
                              onClick={(e) => {
                                e.stopPropagation();
                                toggleFavorite(attraction._id);
                              }}
                            />
                          </div>
                          <IonCardSubtitle>
                            <IonIcon icon={locationOutline} style={{ marginRight: '4px' }} />
                            {attraction.city}, {attraction.region}
                          </IonCardSubtitle>
                        </IonCardHeader>
                        <IonCardContent>
                          <p style={{ fontSize: '0.9rem', marginBottom: '12px' }}>
                            {attraction.description?.substring(0, 120)}
                            {attraction.description && attraction.description.length > 120 ? '...' : ''}
                          </p>
                          <div style={{ display: 'flex', gap: '8px', marginBottom: '12px', flexWrap: 'wrap' }}>
                            <IonChip color="primary" style={{ margin: 0 }}>
                              <IonLabel>{formatCategory(attraction.category)}</IonLabel>
                            </IonChip>
                            {attraction.rating && (
                              <IonChip color="warning" style={{ margin: 0 }}>
                                <IonIcon icon={starOutline} />
                                <IonLabel>{attraction.rating.toFixed(1)}</IonLabel>
                              </IonChip>
                            )}
                            {attraction.audioGuides && attraction.audioGuides.length > 0 && (
                              <IonChip color="secondary" style={{ margin: 0 }}>
                                <IonIcon icon={playCircle} />
                                <IonLabel>{attraction.audioGuides.length} guides</IonLabel>
                              </IonChip>
                            )}
                          </div>
                          <div style={{ display: 'flex', gap: '8px' }}>
                            <IonButton expand="block" onClick={() => goToAttractionDetail(attraction._id)} style={{ flex: 1 }}>
                              Découvrir
                            </IonButton>
                            {attraction.audioGuides && attraction.audioGuides.length > 0 && (
                              <IonButton fill="outline" onClick={(e) => {
                                e.stopPropagation();
                                goToAttractionDetail(attraction._id);
                              }}>
                                <IonIcon slot="icon-only" icon={playCircle} />
                              </IonButton>
                            )}
                          </div>
                        </IonCardContent>
                      </IonCard>
                    );
                  })}

                  {/* Bouton Voir Plus */}
                  {filteredAttractions.length > 7 && (
                    <IonCard 
                      button
                      onClick={() => history.push('/tabs/map')}
                      style={{
                        minWidth: '280px',
                        maxWidth: '280px',
                        flexShrink: 0,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        cursor: 'pointer',
                        height: '100%'
                      }}
                    >
                      <IonCardContent style={{ textAlign: 'center', padding: '40px 20px' }}>
                        <IonIcon icon={arrowForward} size="large" color="primary" style={{ fontSize: '48px', marginBottom: '16px' }} />
                        <h3 style={{ fontSize: '1.2rem', fontWeight: 'bold', marginBottom: '8px' }}>Voir plus</h3>
                        <p style={{ color: 'var(--ion-color-medium)', fontSize: '0.9rem' }}>
                          {filteredAttractions.length - 7} autres attractions
                        </p>
                      </IonCardContent>
                    </IonCard>
                  )}
                </div>
              </>
            )}
          </div>
        )}

        {/* Section Circuits Touristiques */}
        {!loading && (
          <div className="tours-section" style={{ marginBottom: '32px' }}>
            <div style={{ padding: '0 16px', marginBottom: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <h2 style={{ 
                  fontSize: '1.6rem', 
                  fontWeight: 'bold', 
                  marginBottom: '8px',
                  color: 'var(--ion-color-secondary)'
                }}>
                  🗺️ Circuits Touristiques
                </h2>
                <p style={{ color: 'var(--ion-color-medium)', fontSize: '0.9rem' }}>
                  Découvrez nos parcours thématiques
                </p>
              </div>
            </div>

            {filteredTours.length === 0 ? (
              <IonCard>
                <IonCardContent>
                  <IonText color="medium">
                    <p style={{ textAlign: 'center', padding: '20px' }}>
                      Aucun circuit touristique disponible pour le moment.
                    </p>
                  </IonText>
                </IonCardContent>
              </IonCard>
            ) : (
              <>
                <div style={{ 
                  display: 'flex',
                  overflowX: 'auto',
                  gap: '16px',
                  padding: '0 16px',
                  scrollSnapType: 'x mandatory',
                  WebkitOverflowScrolling: 'touch'
                }}>
                  {filteredTours.slice(0, 7).map((tour: BackendTour) => (
                    <IonCard 
                      key={tour._id}
                      className="attraction-card"
                      style={{ 
                        margin: 0,
                        minWidth: '280px',
                        maxWidth: '280px',
                        flexShrink: 0,
                        scrollSnapAlign: 'start'
                      }}
                    >
                      {tour.coverImage && (
                        <img
                          src={tour.coverImage}
                          alt={tour.name}
                          style={{ width: '100%', height: '200px', objectFit: 'cover' }}
                        />
                      )}
                      <IonCardHeader>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
                          <IonCardTitle style={{ fontSize: '1.2rem', marginBottom: '8px' }}>
                            {tour.name}
                          </IonCardTitle>
                          <IonBadge color={tour.category === 'historic' ? 'primary' : 'secondary'}>
                            {tour.category === 'historic' ? '?? Historique' : '?? Culturel'}
                          </IonBadge>
                        </div>
                        <IonCardSubtitle style={{ fontSize: '0.85rem', marginTop: '4px' }}>
                          {tour.nameEn || tour.name}
                        </IonCardSubtitle>
                      </IonCardHeader>
                      <IonCardContent>
                        <p style={{ fontSize: '0.9rem', marginBottom: '12px', lineHeight: '1.5' }}>
                          {tour.description?.substring(0, 100)}
                          {(tour.description && tour.description.length > 100) ? '...' : ''}
                        </p>
                        <div style={{ display: 'flex', gap: '12px', marginBottom: '12px', flexWrap: 'wrap' }}>
                          <IonChip color="primary" style={{ margin: 0 }}>
                            <IonIcon icon={timeOutline} style={{ marginRight: '4px' }} />
                            <IonLabel>{tour.totalDuration ? `${tour.totalDuration} min` : 'N/A'}</IonLabel>
                          </IonChip>
                          <IonChip color="secondary" style={{ margin: 0 }}>
                            <IonIcon icon={navigateOutline} style={{ marginRight: '4px' }} />
                            <IonLabel>{tour.distance ? `${tour.distance} km` : 'N/A'}</IonLabel>
                          </IonChip>
                          <IonChip color="tertiary" style={{ margin: 0 }}>
                            <IonIcon icon={locationOutline} style={{ marginRight: '4px' }} />
                            <IonLabel>{tour.attractions?.length || 0} sites</IonLabel>
                          </IonChip>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                          <div>
                            <span style={{ fontSize: '1.2rem', fontWeight: 'bold', color: 'var(--ion-color-primary)' }}>
                              {tour.price?.adult ? `${tour.price.adult} FCFA` : 'Gratuit'}
                            </span>
                            {tour.price?.child && (
                              <span style={{ fontSize: '0.8rem', color: 'var(--ion-color-medium)', marginLeft: '8px' }}>
                                ({tour.price.child} FCFA enfant)
                              </span>
                            )}
                          </div>
                          {tour.rating && (
                            <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                              <IonIcon icon={starOutline} color="warning" />
                              <span style={{ fontWeight: 'bold' }}>{tour.rating.toFixed(1)}</span>
                            </div>
                          )}
                        </div>
                        <div style={{ display: 'flex', gap: '8px', marginTop: '12px' }}>
                          <IonButton
                            expand="block"
                            onClick={() => history.push(`/tabs/tour/${tour._id}`)}
                            style={{ flex: 1 }}
                          >
                            <IonIcon slot="start" icon={mapOutline} />
                            Découvrir le circuit
                          </IonButton>
                        </div>
                      </IonCardContent>
                    </IonCard>
                  ))}

                  {/* Bouton Voir Plus */}
                  {filteredTours.length > 7 && (
                    <IonCard 
                      button
                      onClick={() => history.push('/tabs/map')}
                      style={{
                        minWidth: '280px',
                        maxWidth: '280px',
                        flexShrink: 0,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        cursor: 'pointer',
                        height: '100%'
                      }}
                    >
                      <IonCardContent style={{ textAlign: 'center', padding: '40px 20px' }}>
                        <IonIcon icon={arrowForward} size="large" color="secondary" style={{ fontSize: '48px', marginBottom: '16px' }} />
                        <h3 style={{ fontSize: '1.2rem', fontWeight: 'bold', marginBottom: '8px' }}>Voir plus</h3>
                        <p style={{ color: 'var(--ion-color-medium)', fontSize: '0.9rem' }}>
                          {filteredTours.length - 7} autres circuits
                        </p>
                      </IonCardContent>
                    </IonCard>
                  )}
                </div>
              </>
            )}
          </div>
        )}

        <IonFab vertical="bottom" horizontal="end" slot="fixed">
          <IonFabButton onClick={() => setIsQRScannerOpen(true)} color="secondary">
            <IonIcon icon={qrCodeOutline} />
          </IonFabButton>
        </IonFab>

        <IonFab vertical="bottom" horizontal="end" slot="fixed" style={{ marginBottom: '70px' }}>
          <IonFabButton onClick={goToMap}>
            <IonIcon icon={mapOutline} />
          </IonFabButton>
        </IonFab>
      </IonContent>

      {/* Scanner QR Code */}
      <QRCodeScanner
        isOpen={isQRScannerOpen}
        onClose={() => setIsQRScannerOpen(false)}
      />

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

export default HomePage;
