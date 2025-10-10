/**
 * Page de réservations avec gestion d'authentification et attractions payantes
 * Architecture experte avec hooks personnalisés et gestion d'état
 */

import React, { useState } from 'react';
import {
  IonContent,
  IonSegment,
  IonSegmentButton,
  IonLabel,
  IonCard,
  IonCardContent,
  IonButton,
  IonIcon,
  IonBadge,
  IonList,
  IonSpinner,
  IonToast,
  IonProgressBar,
  IonChip,
  IonAlert
} from '@ionic/react';
import { 
  logInOutline,
  downloadOutline,
  cardOutline,
  starOutline,
  timeOutline,
  languageOutline,
  cloudDownloadOutline,
  checkmarkCircleOutline
} from 'ionicons/icons';
import HeaderMinimal from '../components/HeaderMinimal';
import { useAuth } from '../hooks/useAuth';
import { usePaidAttractions } from '../hooks/usePaidAttractions';
import { useHistory } from 'react-router-dom';
import type { PaidAttraction } from '../types/attractions';
import './PaidReservationsPage.css';

const PaidReservationsPage: React.FC = () => {
  const history = useHistory();
  const { isAuthenticated, user } = useAuth();
  const { attractions, isLoading, error, purchaseAttraction, downloadAttraction } = usePaidAttractions();
  
  const [selectedSegment, setSelectedSegment] = useState<string>('all');
  const [showPurchaseAlert, setShowPurchaseAlert] = useState(false);
  const [selectedAttraction, setSelectedAttraction] = useState<PaidAttraction | null>(null);
  const [downloadProgress, setDownloadProgress] = useState<Record<string, number>>({});
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');

  // Filtrer les attractions selon le segment sélectionné
  const getFilteredAttractions = (): PaidAttraction[] => {
    switch (selectedSegment) {
      case 'purchased':
        return attractions.filter(att => att.isPurchased);
      case 'downloaded':
        return attractions.filter(att => att.isDownloaded);
      case 'all':
      default:
        return attractions;
    }
  };

  // Gestion de l'achat d'une attraction
  const handlePurchase = async (attraction: PaidAttraction) => {
    if (!isAuthenticated) {
      history.push('/login');
      return;
    }

    try {
      await purchaseAttraction(attraction.id, 'card');
      setToastMessage(`${attraction.title} acheté avec succès !`);
      setShowToast(true);
      setShowPurchaseAlert(false);
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Erreur inconnue';
      setToastMessage(`Erreur lors de l'achat: ${errorMessage}`);
      setShowToast(true);
    }
  };

  // Gestion du téléchargement
  const handleDownload = async (attraction: PaidAttraction) => {
    try {
      await downloadAttraction(
        attraction.id,
        'standard',
        (progress) => {
          setDownloadProgress(prev => ({
            ...prev,
            [attraction.id]: progress
          }));
        }
      );
      
      setToastMessage(`${attraction.title} téléchargé avec succès !`);
      setShowToast(true);
      
      // Clear progress
      setDownloadProgress(prev => {
        const newProgress = { ...prev };
        delete newProgress[attraction.id];
        return newProgress;
      });
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Erreur inconnue';
      setToastMessage(`Erreur lors du téléchargement: ${errorMessage}`);
      setShowToast(true);
    }
  };

  // Navigation vers la connexion
  const handleLoginClick = () => {
    history.push('/login');
  };

  // Affichage du message de connexion requis
  const renderLoginRequired = () => (
    <div className="login-required">
      <IonIcon icon={logInOutline} className="login-icon" />
      <h2>Connexion requise</h2>
      <p>Connectez-vous pour accéder à vos guides audio achetés et télécharger du contenu.</p>
      <div className="auth-buttons">
        <IonButton expand="block" fill="solid" color="primary" onClick={handleLoginClick}>
          <IonIcon icon={logInOutline} slot="start" />
          Se connecter
        </IonButton>
        <IonButton 
          expand="block" 
          fill="outline" 
          color="medium" 
          onClick={() => history.push('/register')}
          className="register-button"
        >
          Créer un compte
        </IonButton>
      </div>
      <p className="auth-note">
        Nouveau sur l'application ? Créez votre compte pour découvrir nos guides audio premium.
      </p>
    </div>
  );  // Affichage d'une carte d'attraction
  const renderAttractionCard = (attraction: PaidAttraction) => {
    const isDownloading = downloadProgress[attraction.id] !== undefined;
    const progress = downloadProgress[attraction.id] || 0;

    return (
      <IonCard key={attraction.id} className="attraction-card">
        <IonCardContent>
          <div className="attraction-header">
            <div className="attraction-info">
              <h2>{attraction.title}</h2>
              <p className="attraction-category">{attraction.category}</p>
              <p className="attraction-description">{attraction.shortDescription}</p>
            </div>
            <div className="attraction-price">
              {attraction.pricing.discountedPrice ? (
                <>
                  <span className="price-original">{attraction.pricing.price}€</span>
                  <span className="price-discounted">{attraction.pricing.discountedPrice}€</span>
                </>
              ) : (
                <span className="price-current">{attraction.pricing.price}€</span>
              )}
            </div>
          </div>

          <div className="attraction-details">
            <IonChip color="primary" outline>
              <IonIcon icon={timeOutline} />
              <IonLabel>{attraction.audioGuide.duration}</IonLabel>
            </IonChip>
            <IonChip color="medium" outline>
              <IonIcon icon={languageOutline} />
              <IonLabel>{attraction.audioGuide.language.join(', ')}</IonLabel>
            </IonChip>
            <IonChip color="warning" outline>
              <IonIcon icon={starOutline} />
              <IonLabel>{attraction.rating.average} ({attraction.rating.count})</IonLabel>
            </IonChip>
          </div>

          <div className="attraction-features">
            {attraction.features.map((feature, index) => (
              <IonBadge key={index} color="light">{feature}</IonBadge>
            ))}
          </div>

          {/* Barre de progression pour le téléchargement */}
          {isDownloading && (
            <div className="download-progress">
              <IonProgressBar value={progress / 100} />
              <span>{progress}%</span>
            </div>
          )}

          <div className="attraction-actions">
            {!isAuthenticated ? (
              <div className="auth-actions">
                <IonButton 
                  expand="block" 
                  fill="solid" 
                  color="primary" 
                  onClick={handleLoginClick}
                >
                  <IonIcon icon={logInOutline} slot="start" />
                  Se connecter pour acheter
                </IonButton>
                <IonButton 
                  expand="block" 
                  fill="outline" 
                  color="medium" 
                  onClick={() => history.push('/register')}
                  size="small"
                >
                  Créer un compte
                </IonButton>
              </div>
            ) : !attraction.isPurchased ? (
              <IonButton 
                expand="block" 
                fill="solid" 
                color="primary"
                onClick={() => {
                  setSelectedAttraction(attraction);
                  setShowPurchaseAlert(true);
                }}
              >
                <IonIcon icon={cardOutline} slot="start" />
                Acheter - {attraction.pricing.discountedPrice || attraction.pricing.price}€
              </IonButton>
            ) : (
              <div className="purchased-actions">
                {attraction.isDownloaded ? (
                  <IonButton expand="block" fill="solid" color="success">
                    <IonIcon icon={checkmarkCircleOutline} slot="start" />
                    Téléchargé - Écouter
                  </IonButton>
                ) : (
                  <IonButton 
                    expand="block" 
                    fill="outline" 
                    color="primary"
                    disabled={isDownloading}
                    onClick={() => handleDownload(attraction)}
                  >
                    <IonIcon icon={downloadOutline} slot="start" />
                    {isDownloading ? 'Téléchargement...' : 'Télécharger'} - {attraction.audioGuide.fileSize}
                  </IonButton>
                )}
              </div>
            )}
          </div>
        </IonCardContent>
      </IonCard>
    );
  };

  return (
    <>
        <HeaderMinimal 
          title="Guides Audio"
        />      <IonContent className="paid-reservations-content">
        {/* En-tête avec segments */}
        <div className="reservations-header">
          <h1>Guides Audio Premium</h1>
          <p>
            {isAuthenticated 
              ? `Bonjour ${user?.displayName}, découvrez nos guides audio exclusifs`
              : 'Connectez-vous pour acheter et télécharger nos guides'
            }
          </p>
          
          <IonSegment 
            value={selectedSegment} 
            onIonChange={e => setSelectedSegment(e.detail.value as string)}
            className="reservations-segment"
          >
            <IonSegmentButton value="all">
              <IonLabel>Tous</IonLabel>
            </IonSegmentButton>
            {isAuthenticated && (
              <>
                <IonSegmentButton value="purchased">
                  <IonLabel>Achetés</IonLabel>
                </IonSegmentButton>
                <IonSegmentButton value="downloaded">
                  <IonLabel>Téléchargés</IonLabel>
                </IonSegmentButton>
              </>
            )}
          </IonSegment>
        </div>

        {/* Contenu principal */}
        <div className="attractions-content">
          {!isAuthenticated && selectedSegment !== 'all' ? (
            renderLoginRequired()
          ) : isLoading ? (
            <div className="loading-state">
              <IonSpinner name="crescent" />
              <p>Chargement des guides audio...</p>
            </div>
          ) : error ? (
            <div className="error-state">
              <p>Erreur: {error}</p>
              <IonButton fill="outline" onClick={() => window.location.reload()}>
                Réessayer
              </IonButton>
            </div>
          ) : getFilteredAttractions().length === 0 ? (
            <div className="empty-state">
              <IonIcon icon={cloudDownloadOutline} className="empty-icon" />
              <h3>
                {selectedSegment === 'purchased' && 'Aucun guide acheté'}
                {selectedSegment === 'downloaded' && 'Aucun guide téléchargé'}
                {selectedSegment === 'all' && 'Aucun guide disponible'}
              </h3>
              <p>
                {selectedSegment === 'purchased' && 'Parcourez nos guides et faites votre premier achat !'}
                {selectedSegment === 'downloaded' && 'Téléchargez vos guides achetés pour les écouter hors ligne.'}
                {selectedSegment === 'all' && 'Revenez plus tard pour découvrir nos nouveaux guides.'}
              </p>
            </div>
          ) : (
            <IonList>
              {getFilteredAttractions().map(attraction => renderAttractionCard(attraction))}
            </IonList>
          )}
        </div>

        {/* Alert de confirmation d'achat */}
        <IonAlert
          isOpen={showPurchaseAlert}
          onDidDismiss={() => setShowPurchaseAlert(false)}
          header="Confirmer l'achat"
          message={`Voulez-vous acheter "${selectedAttraction?.title}" pour ${selectedAttraction?.pricing.discountedPrice || selectedAttraction?.pricing.price}€ ?`}
          buttons={[
            {
              text: 'Annuler',
              role: 'cancel'
            },
            {
              text: 'Acheter',
              handler: () => {
                if (selectedAttraction) {
                  handlePurchase(selectedAttraction);
                }
                return true;
              }
            }
          ]}
        />

        {/* Toast pour les notifications */}
        <IonToast
          isOpen={showToast}
          onDidDismiss={() => setShowToast(false)}
          message={toastMessage}
          duration={3000}
          position="bottom"
        />
      </IonContent>
    </>
  );
};

export default PaidReservationsPage;