// Script pour générer Home.tsx
const fs = require('fs');
const path = require('path');

const content = `/**
 * Page Home - Écran d'accueil principal
 * Affiche attractions populaires, recherche rapide et accès audioguides
 */

import React, { useState, useEffect } from 'react';
import {
  IonPage,
  IonHeader,
  IonToolbar,
  IonTitle,
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
  IonLabel,
  IonGrid,
  IonRow,
  IonCol,
  IonSpinner,
  IonText,
  IonSegment,
  IonSegmentButton,
  IonFab,
  IonFabButton,
  IonBadge,
} from '@ionic/react';
import {
  searchOutline,
  locationOutline,
  playCircle,
  heartOutline,
  mapOutline,
  heart,
  trendingUpOutline,
  navigateOutline,
  timeOutline,
  starOutline,
} from 'ionicons/icons';
import { useHistory } from 'react-router-dom';
import axios from 'axios';
import './Home.css';

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
  audioGuides?: any[];
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

const HomePage: React.FC = () => {
  const history = useHistory();
  const [searchText, setSearchText] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [attractions, setAttractions] = useState<BackendAttraction[]>([]);
  const [filteredAttractions, setFilteredAttractions] = useState<BackendAttraction[]>([]);
  const [tours, setTours] = useState<any[]>([]);
  const [filteredTours, setFilteredTours] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [favorites, setFavorites] = useState<Set<string>>(new Set());

  const categories = [
    { value: 'all', label: 'Tout', icon: searchOutline },
    { value: 'popular', label: 'Populaires', icon: trendingUpOutline },
    { value: 'museum', label: 'Musées', icon: '🎨' },
    { value: 'monument', label: 'Monuments', icon: '🏛️' },
    { value: 'nature', label: 'Nature', icon: '🌿' },
    { value: 'historical', label: 'Historique', icon: '📜' },
    { value: 'religious', label: 'Religieux', icon: '⛪' },
    { value: 'market', label: 'Marchés', icon: '🛒' },
  ];

  useEffect(() => {
    loadAttractions();
    loadTours();
    loadFavorites();
  }, []);

  const loadAttractions = async () => {
    try {
      setLoading(true);
      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
      const response = await axios.get(\`\${apiUrl}/attractions\`);
      if (response.data.success && Array.isArray(response.data.data)) {
        setAttractions(response.data.data);
        setFilteredAttractions(response.data.data);
        console.log('✅ Attractions chargées:', response.data.data.length);
      }
    } catch (error) {
      console.error('❌ Erreur chargement attractions:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadTours = async () => {
    try {
      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
      const response = await axios.get(\`\${apiUrl}/tours\`);
      if (response.data.success && Array.isArray(response.data.data)) {
        setTours(response.data.data);
        setFilteredTours(response.data.data);
        console.log('✅ Circuits chargés:', response.data.data.length);
      }
    } catch (error) {
      console.error('❌ Erreur chargement circuits:', error);
    }
  };

  const loadFavorites = () => {
    const saved = localStorage.getItem('favorites');
    if (saved) {
      setFavorites(new Set(JSON.parse(saved)));
    }
  };

  const toggleFavorite = (id: string) => {
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

  useEffect(() => {
    let filtered = [...attractions];
    let filteredToursTemp = [...tours];

    if (selectedCategory === 'all') {
      filtered = [...attractions];
    } else if (selectedCategory === 'popular') {
      filtered = filtered.filter((a) => a.rating && a.rating >= 4);
      filtered.sort((a, b) => (b.rating || 0) - (a.rating || 0));
    } else {
      filtered = filtered.filter((a) => a.category === selectedCategory);
    }

    if (searchText.trim()) {
      const search = searchText.toLowerCase().trim();
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

    console.log(\`🔍 Filtrage: \${filtered.length} attractions, \${filteredToursTemp.length} circuits\`);
    setFilteredAttractions(filtered);
    setFilteredTours(filteredToursTemp);
  }, [searchText, selectedCategory, attractions, tours]);

  const goToAttractionDetail = (id: string) => {
    history.push(\`/attraction/\${id}\`);
  };

  const goToMap = () => {
    history.push('/map');
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
      <IonHeader>
        <IonToolbar>
          <IonTitle>Découvrir la Côte d'Ivoire</IonTitle>
        </IonToolbar>
      </IonHeader>

      <IonContent fullscreen className="home-page">
        <div className="hero-section">
          <h1>Bienvenue en Côte d'Ivoire</h1>
          <p>Explorez les merveilles culturelles et naturelles</p>
        </div>

        <div className="search-section">
          <IonSearchbar
            value={searchText}
            onIonInput={(e) => setSearchText(e.detail.value || '')}
            placeholder="Rechercher une attraction..."
            animated
            showCancelButton="focus"
          />
        </div>

        <div className="categories-section">
          <IonSegment
            value={selectedCategory}
            onIonChange={(e) => setSelectedCategory(e.detail.value as string)}
            scrollable
          >
            {categories.map((cat) => (
              <IonSegmentButton key={cat.value} value={cat.value}>
                {typeof cat.icon === 'string' ? (
                  <span style={{ fontSize: '1.2rem', marginRight: '4px' }}>{cat.icon}</span>
                ) : (
                  <IonIcon icon={cat.icon} />
                )}
                <IonLabel>{cat.label}</IonLabel>
              </IonSegmentButton>
            ))}
          </IonSegment>
        </div>

        <IonGrid className="stats-grid">
          <IonRow>
            <IonCol size="4">
              <div className="stat-card">
                <IonIcon icon={locationOutline} className="stat-icon" />
                <div className="stat-value">{attractions.length}</div>
                <div className="stat-label">Attractions</div>
              </div>
            </IonCol>
            <IonCol size="4">
              <div className="stat-card">
                <IonIcon icon={playCircle} className="stat-icon" />
                <div className="stat-value">
                  {attractions.reduce((sum, a) => sum + (a.audioGuides?.length || 0), 0)}
                </div>
                <div className="stat-label">AudioGuides</div>
              </div>
            </IonCol>
            <IonCol size="4">
              <div className="stat-card">
                <IonIcon icon={heartOutline} className="stat-icon" />
                <div className="stat-value">{favorites.size}</div>
                <div className="stat-label">Favoris</div>
              </div>
            </IonCol>
          </IonRow>
        </IonGrid>

        {loading && (
          <div className="loading-container">
            <IonSpinner name="crescent" />
            <IonText>
              <p>Chargement des attractions...</p>
            </IonText>
          </div>
        )}

        {!loading && (
          <div className="attractions-container">
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
              <IonGrid>
                <IonRow>
                  {filteredAttractions.map((attraction) => {
                    const isFav = favorites.has(attraction._id);
                    return (
                      <IonCol size="12" sizeMd="6" sizeLg="4" key={attraction._id}>
                        <IonCard className="attraction-card" onClick={() => goToAttractionDetail(attraction._id)}>
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
                      </IonCol>
                    );
                  })}
                </IonRow>
              </IonGrid>
            )}
          </div>
        )}

        {!loading && filteredTours.length > 0 && (
          <div className="tours-container" style={{ marginTop: '24px' }}>
            <div style={{ padding: '0 16px', marginBottom: '16px' }}>
              <h2 style={{ fontSize: '1.5rem', fontWeight: 'bold', marginBottom: '8px' }}>
                🗺️ Circuits Touristiques
              </h2>
              <p style={{ color: 'var(--ion-color-medium)', fontSize: '0.9rem' }}>
                Découvrez nos parcours thématiques
              </p>
            </div>
            <IonGrid>
              <IonRow>
                {filteredTours.map((tour: any) => (
                  <IonCol size="12" sizeMd="6" sizeLg="4" key={tour._id}>
                    <IonCard className="attraction-card">
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
                            {tour.category === 'historic' ? '📜 Historique' : '🎨 Culturel'}
                          </IonBadge>
                        </div>
                        <IonCardSubtitle style={{ fontSize: '0.85rem', marginTop: '4px' }}>
                          {tour.nameEn || tour.name}
                        </IonCardSubtitle>
                      </IonCardHeader>
                      <IonCardContent>
                        <p style={{ fontSize: '0.9rem', marginBottom: '12px', lineHeight: '1.5' }}>
                          {tour.description?.substring(0, 100)}
                          {tour.description?.length > 100 ? '...' : ''}
                        </p>
                        <div style={{ display: 'flex', gap: '12px', marginBottom: '12px', flexWrap: 'wrap' }}>
                          <IonChip color="primary" style={{ margin: 0 }}>
                            <IonIcon icon={timeOutline} style={{ marginRight: '4px' }} />
                            <IonLabel>{tour.duration ? \`\${tour.duration} min\` : 'N/A'}</IonLabel>
                          </IonChip>
                          <IonChip color="secondary" style={{ margin: 0 }}>
                            <IonIcon icon={navigateOutline} style={{ marginRight: '4px' }} />
                            <IonLabel>{tour.distance ? \`\${tour.distance} km\` : 'N/A'}</IonLabel>
                          </IonChip>
                          <IonChip color="tertiary" style={{ margin: 0 }}>
                            <IonIcon icon={locationOutline} style={{ marginRight: '4px' }} />
                            <IonLabel>{tour.attractions?.length || 0} sites</IonLabel>
                          </IonChip>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                          <div>
                            <span style={{ fontSize: '1.2rem', fontWeight: 'bold', color: 'var(--ion-color-primary)' }}>
                              {tour.price?.adult ? \`\${tour.price.adult} FCFA\` : 'Gratuit'}
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
                            onClick={() => history.push(\`/tour/\${tour._id}\`)}
                            style={{ flex: 1 }}
                          >
                            <IonIcon slot="start" icon={mapOutline} />
                            Découvrir le circuit
                          </IonButton>
                        </div>
                      </IonCardContent>
                    </IonCard>
                  </IonCol>
                ))}
              </IonRow>
            </IonGrid>
          </div>
        )}

        <IonFab vertical="bottom" horizontal="end" slot="fixed">
          <IonFabButton onClick={goToMap}>
            <IonIcon icon={mapOutline} />
          </IonFabButton>
        </IonFab>
      </IonContent>
    </IonPage>
  );
};

export default HomePage;
`;

const outputPath = path.join(__dirname, 'src', 'pages', 'Home.tsx');
fs.writeFileSync(outputPath, content, 'utf8');
console.log('✅ Fichier Home.tsx créé avec succès !');
console.log('📍 Emplacement:', outputPath);
