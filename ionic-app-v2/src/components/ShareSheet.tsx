/**
 * ShareSheet - Composant de partage social
 * Sprint 4 - Phase 4
 * 
 * Fonctionnalités:
 * - Options de partage (WhatsApp, Facebook, Twitter, Native)
 * - Icônes et labels pour chaque plateforme
 * - Gestion fermeture modal
 */

import React from 'react';
import {
  IonModal,
  IonHeader,
  IonToolbar,
  IonTitle,
  IonContent,
  IonButtons,
  IonButton,
  IonList,
  IonItem,
  IonLabel,
  IonIcon,
} from '@ionic/react';
import {
  closeOutline,
  logoWhatsapp,
  logoFacebook,
  logoTwitter,
  shareOutline,
} from 'ionicons/icons';
import './ShareSheet.css';

export type SharePlatform = 'whatsapp' | 'facebook' | 'twitter' | 'native';

interface ShareOption {
  platform: SharePlatform;
  label: string;
  icon: string;
  color: string;
}

interface ShareSheetProps {
  isOpen: boolean;
  onClose: () => void;
  onShare: (platform: SharePlatform) => void;
  title?: string;
}

const ShareSheet: React.FC<ShareSheetProps> = ({
  isOpen,
  onClose,
  onShare,
  title = 'Partager',
}) => {
  const shareOptions: ShareOption[] = [
    {
      platform: 'whatsapp',
      label: 'WhatsApp',
      icon: logoWhatsapp,
      color: '#25D366',
    },
    {
      platform: 'facebook',
      label: 'Facebook',
      icon: logoFacebook,
      color: '#1877F2',
    },
    {
      platform: 'twitter',
      label: 'Twitter',
      icon: logoTwitter,
      color: '#1DA1F2',
    },
    {
      platform: 'native',
      label: 'Plus d\'options',
      icon: shareOutline,
      color: '#3880ff',
    },
  ];

  const handleShare = (platform: SharePlatform) => {
    onShare(platform);
    onClose();
  };

  return (
    <IonModal
      isOpen={isOpen}
      onDidDismiss={onClose}
      className="share-sheet-modal"
      breakpoints={[0, 0.5]}
      initialBreakpoint={0.5}
    >
      <IonHeader>
        <IonToolbar>
          <IonTitle>{title}</IonTitle>
          <IonButtons slot="end">
            <IonButton onClick={onClose}>
              <IonIcon icon={closeOutline} />
            </IonButton>
          </IonButtons>
        </IonToolbar>
      </IonHeader>

      <IonContent className="ion-padding">
        <IonList>
          {shareOptions.map((option) => (
            <IonItem
              key={option.platform}
              button
              onClick={() => handleShare(option.platform)}
              className="share-option-item"
            >
              <div
                className={`share-icon ${option.platform}`}
                slot="start"
              >
                <IonIcon icon={option.icon} />
              </div>
              <IonLabel>
                <h3>{option.label}</h3>
              </IonLabel>
            </IonItem>
          ))}
        </IonList>

        <div className="share-info">
          <p>
            Partagez cette attraction avec vos amis et gagnez des points !
          </p>
        </div>
      </IonContent>
    </IonModal>
  );
};

export default ShareSheet;
