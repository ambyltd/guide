/**
 * Page Favoris
 * Affiche toutes les attractions ajoutées en favoris
 */

import React, { useState, useEffect } from 'react';
import {
  IonPage,
  IonHeader,
  IonToolbar,
  IonContent,
  IonCard,
  IonCardHeader,
  IonCardTitle,
  IonCardSubtitle,
  IonCardContent,
  IonButton,
  IonIcon,
  IonChip,
  IonLabel,
  IonText,
  IonGrid,
  IonRow,
  IonCol,
  IonSpinner,
  IonRefresher,
  IonRefresherContent,
} from '@ionic/react';
import {
  heartOutline,
  heart,
  locationOutline,
  playCircle,
  star,
  trashOutline,
} from 'ionicons/icons';
import { useHistory } from 'react-router-dom';
import axios from 'axios';
import type { BackendAttraction } from '../types/backend';
import { backgroundSyncService } from '../services/backgroundSyncService';
import { favoritesService } from '../services/favoritesService';
import { userStatsService } from '../services/userStatsService';
import './Favorites.css';

const FavoritesPage: React.FC = () => {
  const history = useHistory();
  const [favorites, setFavorites] = useState<BackendAttraction[]>([]);
  const [loading, setLoading] = useState(true);
  const [favoriteIds, setFavoriteIds] = useState<Set<string>>(new Set());

  useEffect(() => {
    // TODO: Récupérer userId et userName depuis Firebase Auth
    const userId = 'user-123';
    const userName = 'Utilisateur Test';

    // Initialiser les services
    favoritesService.initialize(userId, userName);
    userStatsService.initialize(userId, userName);
    
    console.log('✅ Services initialisés (Favorites):', { userId, userName });

    loadFavorites();
  }, []);

  const loadFavorites = async () => {
    try {
      setLoading(true);

      // Charger les favoris depuis l'API (retourne les attractions complètes)
      const userFavorites = await favoritesService.getUserFavorites();
      const ids = userFavorites.map(fav => {
        const attractionData = fav.attractionId;
        if (typeof attractionData === 'string') {
          return attractionData;
        } else if (attractionData && typeof attractionData === 'object' && '_id' in attractionData) {
          return (attractionData as any)._id;
        }
        return '';
      }).filter(Boolean);
      setFavoriteIds(new Set(ids));
      
      // Extraire les données d'attraction complètes (type assertion pour éviter conflit de types)
      const attractions = userFavorites
        .map(fav => fav.attractionId)
        .filter((attr): attr is any => attr !== null && typeof attr === 'object' && '_id' in attr) as BackendAttraction[];

      setFavorites(attractions);
      console.log('✅ Favoris chargés depuis API:', attractions.length);
    } catch (error) {
      console.error('❌ Erreur chargement favoris API, fallback localStorage:', error);
      
      // Fallback: charger depuis localStorage
      const savedFavorites = localStorage.getItem('favorites');
      if (!savedFavorites) {
        setFavorites([]);
        setFavoriteIds(new Set());
        setLoading(false);
        return;
      }

      const ids = JSON.parse(savedFavorites);
      setFavoriteIds(new Set(ids));

      if (ids.length === 0) {
        setFavorites([]);
        setLoading(false);
        return;
      }

      // Charger les attractions depuis l'API
      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
      const attractionsPromises = ids.map((id: string) =>
        axios.get<{ data: BackendAttraction }>(`${apiUrl}/attractions/${id}`).catch(() => null)
      );

      const responses = await Promise.all(attractionsPromises);
      const attractions = responses
        .filter((r) => r !== null)
        .map((r) => r!.data.data);

      setFavorites(attractions);
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async (event: CustomEvent) => {
    await loadFavorites();
    event.detail.complete();
  };

  const removeFavorite = async (attractionId: string) => {
    const userId = 'user-123'; // TODO: Récupérer depuis Firebase Auth
    
    try {
      // Essayer favoritesService (online)
      await favoritesService.removeFavorite(attractionId);
      await userStatsService.incrementStat('favoriteCount', -1);
      console.log('✅ Favori retiré avec succès');
    } catch (error) {
      console.error('❌ Erreur retrait favori, fallback backgroundSync:', error);
      // Fallback: utiliser backgroundSyncService pour offline
      await backgroundSyncService.removeFavorite(attractionId, userId);
    }

    // Mettre à jour l'UI immédiatement
    const newFavorites = new Set(favoriteIds);
    newFavorites.delete(attractionId);
    setFavoriteIds(newFavorites);
    localStorage.setItem('favorites', JSON.stringify(Array.from(newFavorites)));
    setFavorites(favorites.filter((f) => f._id !== attractionId));
  };

  const goToAttraction = (id: string) => {
    history.push(`/tabs/attraction/${id}`);
  };

  const goToAudioGuides = (attractionId: string) => {
    history.push(`/tabs/audioguides?attractionId=${attractionId}`);
  };

  const formatCategory = (category: string): string => {
    const categories: Record<string, string> = {
      monument: 'Monument',
      museum: 'Musée',
      nature: 'Nature',
      culture: 'Culture',
      restaurant: 'Restaurant',
      shopping: 'Shopping',
      entertainment: 'Divertissement',
      other: 'Autre',
    };
    return categories[category] || category;
  };

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
        </IonToolbar>
      </IonHeader>

      <IonContent>
        {/* Rafraîchissement */}
        <IonRefresher slot="fixed" onIonRefresh={handleRefresh}>
          <IonRefresherContent />
        </IonRefresher>

        {/* Loading */}
        {loading && (
          <div className="loading-container">
            <IonSpinner name="crescent" />
            <IonText>
              <p>Chargement des favoris...</p>
            </IonText>
          </div>
        )}

        {/* Empty state */}
        {!loading && favorites.length === 0 && (
          <div className="empty-state">
            <IonIcon icon={heartOutline} className="empty-icon" />
            <IonText>
              <h2>Aucun favori</h2>
              <p>Ajoutez des attractions à vos favoris pour les retrouver facilement ici.</p>
            </IonText>
            <IonButton routerLink="/tabs/home" expand="block">
              Découvrir des attractions
            </IonButton>
          </div>
        )}

        {/* Liste des favoris */}
        {!loading && favorites.length > 0 && (
          <div className="favorites-container">
            <div className="favorites-header">
              <IonText>
                <h2>{favorites.length} attraction(s) favorite(s)</h2>
              </IonText>
            </div>

            <IonGrid>
              <IonRow>
                {favorites.map((attraction) => {
                  const imageUrl =
                    attraction.images && attraction.images.length > 0
                      ? attraction.images[0]
                      : '/assets/default-attraction.jpg';

                  return (
                    <IonCol size="12" sizeMd="6" sizeLg="4" key={attraction._id}>
                      <IonCard className="favorite-card">
                        {/* Image */}
                        <div
                          className="favorite-image"
                          style={{ backgroundImage: `url(${imageUrl})` }}
                          onClick={() => goToAttraction(attraction._id)}
                        >
                          {/* Badge catégorie */}
                          <IonChip className="category-chip" color="primary">
                            <IonLabel>{formatCategory(attraction.category)}</IonLabel>
                          </IonChip>

                          {/* Bouton supprimer favori */}
                          <IonButton
                            className="remove-button"
                            fill="clear"
                            onClick={(e) => {
                              e.stopPropagation();
                              removeFavorite(attraction._id);
                            }}
                          >
                            <IonIcon icon={heart} color="danger" />
                          </IonButton>
                        </div>

                        {/* Contenu */}
                        <IonCardHeader onClick={() => goToAttraction(attraction._id)}>
                          <IonCardTitle>{attraction.name}</IonCardTitle>
                          <IonCardSubtitle>
                            {attraction.shortDescription || attraction.description}
                          </IonCardSubtitle>
                        </IonCardHeader>

                        <IonCardContent>
                          {/* Métadonnées */}
                          <div className="favorite-meta">
                            {attraction.rating && (
                              <div className="meta-item">
                                <IonIcon icon={star} color="warning" />
                                <span>{attraction.rating.toFixed(1)}</span>
                              </div>
                            )}
                            {attraction.audioGuides && attraction.audioGuides.length > 0 && (
                              <div className="meta-item">
                                <IonIcon icon={playCircle} color="primary" />
                                <span>{attraction.audioGuides.length} guides</span>
                              </div>
                            )}
                            {attraction.address && (
                              <div className="meta-item">
                                <IonIcon icon={locationOutline} color="medium" />
                                <span>{attraction.address.substring(0, 30)}...</span>
                              </div>
                            )}
                          </div>

                          {/* Actions */}
                          <div className="favorite-actions">
                            <IonButton
                              expand="block"
                              fill="solid"
                              onClick={() => goToAttraction(attraction._id)}
                            >
                              Voir détails
                            </IonButton>
                            {attraction.audioGuides && attraction.audioGuides.length > 0 && (
                              <IonButton
                                expand="block"
                                fill="outline"
                                onClick={() => goToAudioGuides(attraction._id)}
                              >
                                <IonIcon icon={playCircle} slot="start" />
                                Écouter
                              </IonButton>
                            )}
                            <IonButton
                              expand="block"
                              fill="clear"
                              color="danger"
                              onClick={() => removeFavorite(attraction._id)}
                            >
                              <IonIcon icon={trashOutline} slot="start" />
                              Retirer
                            </IonButton>
                          </div>
                        </IonCardContent>
                      </IonCard>
                    </IonCol>
                  );
                })}
              </IonRow>
            </IonGrid>
          </div>
        )}
      </IonContent>
    </IonPage>
  );
};

export default FavoritesPage;
