/**
 * Composant d'indicateur de statut online/offline
 * 
 * Affiche une bannière en haut de l'écran quand l'utilisateur est offline
 * avec informations sur le cache disponible
 */

import React from 'react';
import { IonChip, IonIcon, IonLabel } from '@ionic/react';
import { cloudOfflineOutline, cloudDoneOutline, warningOutline } from 'ionicons/icons';
import { useServiceWorker } from '../hooks/useServiceWorker';
import './OfflineIndicator.css';

export const OfflineIndicator: React.FC = () => {
  const { isOnline, cacheReport } = useServiceWorker();

  // Ne rien afficher si online et cache faible
  if (isOnline && (!cacheReport || cacheReport.total < 1024 * 1024)) {
    return null;
  }

  return (
    <div className={`offline-indicator ${isOnline ? 'online' : 'offline'}`}>
      <IonChip
        color={isOnline ? 'success' : 'warning'}
        className="offline-chip"
      >
        <IonIcon
          icon={isOnline ? cloudDoneOutline : cloudOfflineOutline}
          className="offline-icon"
        />
        <IonLabel>
          {isOnline ? (
            <span>
              <strong>En ligne</strong>
              {cacheReport && ` • ${cacheReport.formatted.total} en cache`}
            </span>
          ) : (
            <span>
              <strong>Mode hors ligne</strong>
              {cacheReport && ` • ${cacheReport.formatted.total} disponible`}
            </span>
          )}
        </IonLabel>
      </IonChip>

      {/* Avertissement si quota de stockage élevé */}
      {cacheReport && cacheReport.storage.percentage > 80 && (
        <IonChip color="danger" className="storage-warning-chip">
          <IonIcon icon={warningOutline} />
          <IonLabel>
            Stockage {cacheReport.storage.percentage.toFixed(0)}% plein
          </IonLabel>
        </IonChip>
      )}
    </div>
  );
};
