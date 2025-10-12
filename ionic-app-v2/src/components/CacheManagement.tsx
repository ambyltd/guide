/**
 * Composant de gestion du cache et stockage offline
 * 
 * Affiche les statistiques de cache et permet de gérer le stockage
 * À intégrer dans la page Profile
 */

import React, { useEffect } from 'react';
import {
  IonCard,
  IonCardHeader,
  IonCardTitle,
  IonCardContent,
  IonList,
  IonItem,
  IonLabel,
  IonButton,
  IonIcon,
  IonProgressBar,
  IonChip,
  IonAlert,
  IonSkeletonText,
} from '@ionic/react';
import {
  cloudDownloadOutline,
  trashOutline,
  refreshOutline,
  serverOutline,
  imagesOutline,
  musicalNotesOutline,
  documentTextOutline,
  hardwareChipOutline,
} from 'ionicons/icons';
import { useServiceWorker } from '../hooks/useServiceWorker';
import './CacheManagement.css';

export const CacheManagement: React.FC = () => {
  const {
    swStatus,
    cacheReport,
    updateAvailable,
    activateUpdate,
    clearAllCaches,
    refreshCacheReport,
    isOnline,
  } = useServiceWorker();

  const [showClearAlert, setShowClearAlert] = React.useState(false);
  const [showUpdateAlert, setShowUpdateAlert] = React.useState(false);

  useEffect(() => {
    // Charger le rapport initial
    refreshCacheReport();
  }, []);

  useEffect(() => {
    // Afficher l'alerte de mise à jour
    if (updateAvailable) {
      setShowUpdateAlert(true);
    }
  }, [updateAvailable]);

  const handleClearCache = async () => {
    await clearAllCaches();
    setShowClearAlert(false);
  };

  const handleActivateUpdate = async () => {
    await activateUpdate();
    setShowUpdateAlert(false);
  };

  if (!swStatus.registered) {
    return (
      <IonCard className="cache-management-card">
        <IonCardHeader>
          <IonCardTitle>💾 Stockage Offline</IonCardTitle>
        </IonCardHeader>
        <IonCardContent>
          <p className="cache-disabled-text">
            Le mode offline n'est pas disponible sur cet appareil.
            <br />
            <small>Service Worker non supporté ou désactivé</small>
          </p>
        </IonCardContent>
      </IonCard>
    );
  }

  return (
    <>
      <IonCard className="cache-management-card">
        <IonCardHeader>
          <IonCardTitle>💾 Stockage Offline</IonCardTitle>
          {swStatus.active && (
            <IonChip color="success" className="status-chip">
              Actif
            </IonChip>
          )}
        </IonCardHeader>

        <IonCardContent>
          {/* Statut du Service Worker */}
          <div className="sw-status">
            <IonLabel>
              <h3>Service Worker</h3>
              <p>
                {swStatus.active
                  ? '✅ Actif et prêt pour le mode offline'
                  : swStatus.installing
                  ? '🔄 Installation en cours...'
                  : '⏳ En attente d\'activation'}
              </p>
            </IonLabel>
          </div>

          {/* Statistiques de cache */}
          {cacheReport ? (
            <>
              <IonList className="cache-stats-list">
                {/* Total */}
                <IonItem>
                  <IonIcon icon={hardwareChipOutline} slot="start" color="primary" />
                  <IonLabel>
                    <h3>Cache Total</h3>
                    <p>{cacheReport.formatted.total}</p>
                  </IonLabel>
                </IonItem>

                {/* API Cache */}
                <IonItem>
                  <IonIcon icon={serverOutline} slot="start" color="secondary" />
                  <IonLabel>
                    <h3>Données API</h3>
                    <p>{cacheReport.formatted.sizes.api}</p>
                  </IonLabel>
                </IonItem>

                {/* Images Cache */}
                <IonItem>
                  <IonIcon icon={imagesOutline} slot="start" color="tertiary" />
                  <IonLabel>
                    <h3>Images</h3>
                    <p>{cacheReport.formatted.sizes.images}</p>
                  </IonLabel>
                </IonItem>

                {/* Audio Cache */}
                <IonItem>
                  <IonIcon icon={musicalNotesOutline} slot="start" color="success" />
                  <IonLabel>
                    <h3>Fichiers Audio</h3>
                    <p>{cacheReport.formatted.sizes.audio}</p>
                  </IonLabel>
                </IonItem>

                {/* Static Cache */}
                <IonItem>
                  <IonIcon icon={documentTextOutline} slot="start" color="warning" />
                  <IonLabel>
                    <h3>Fichiers Statiques</h3>
                    <p>{cacheReport.formatted.sizes.static}</p>
                  </IonLabel>
                </IonItem>
              </IonList>

              {/* Quota de stockage */}
              <div className="storage-quota">
                <IonLabel>
                  <h3>Espace de Stockage</h3>
                  <p>
                    {cacheReport.formatted.storage.usage} utilisé sur{' '}
                    {cacheReport.formatted.storage.quota}
                  </p>
                </IonLabel>
                <IonProgressBar
                  value={cacheReport.storage.percentage / 100}
                  color={
                    cacheReport.storage.percentage > 80
                      ? 'danger'
                      : cacheReport.storage.percentage > 50
                      ? 'warning'
                      : 'success'
                  }
                  className="storage-progress"
                />
                <p className="storage-percentage">
                  {cacheReport.storage.percentage.toFixed(1)}% utilisé
                </p>
              </div>
            </>
          ) : (
            <div className="cache-loading">
              <IonSkeletonText animated style={{ width: '100%', height: '200px' }} />
            </div>
          )}

          {/* Actions */}
          <div className="cache-actions">
            <IonButton
              expand="block"
              fill="outline"
              onClick={refreshCacheReport}
              disabled={!isOnline}
            >
              <IonIcon icon={refreshOutline} slot="start" />
              Actualiser
            </IonButton>

            <IonButton
              expand="block"
              color="danger"
              fill="outline"
              onClick={() => setShowClearAlert(true)}
            >
              <IonIcon icon={trashOutline} slot="start" />
              Vider le Cache
            </IonButton>
          </div>

          {/* Info offline */}
          {!isOnline && (
            <div className="offline-info">
              <p>
                📡 <strong>Mode hors ligne actif</strong>
                <br />
                Vous pouvez continuer à utiliser l'application avec les données en cache.
              </p>
            </div>
          )}
        </IonCardContent>
      </IonCard>

      {/* Alerte de suppression du cache */}
      <IonAlert
        isOpen={showClearAlert}
        onDidDismiss={() => setShowClearAlert(false)}
        header="Vider le cache"
        message="Êtes-vous sûr de vouloir supprimer toutes les données en cache ? Vous devrez les télécharger à nouveau."
        buttons={[
          {
            text: 'Annuler',
            role: 'cancel',
          },
          {
            text: 'Vider',
            role: 'destructive',
            handler: handleClearCache,
          },
        ]}
      />

      {/* Alerte de mise à jour */}
      <IonAlert
        isOpen={showUpdateAlert}
        onDidDismiss={() => setShowUpdateAlert(false)}
        header="Mise à jour disponible"
        message="Une nouvelle version de l'application est disponible. Voulez-vous l'installer maintenant ?"
        buttons={[
          {
            text: 'Plus tard',
            role: 'cancel',
          },
          {
            text: 'Installer',
            handler: handleActivateUpdate,
          },
        ]}
      />
    </>
  );
};
