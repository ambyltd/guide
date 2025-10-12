import React from 'react';
import {
  IonHeader,
  IonToolbar,
  IonTitle,
  IonButtons,
  IonButton,
  IonIcon,
  IonBadge,
} from '@ionic/react';
import { notifications, person, logOutOutline } from 'ionicons/icons';
import { useAuth } from '../hooks/useAuth';
import { useHistory } from 'react-router-dom';
import './HeaderMinimal.css';

interface HeaderMinimalProps {
  title?: string;
  showNotifications?: boolean;
  notificationCount?: number;
  onNotificationClick?: () => void;
}

const HeaderMinimal: React.FC<HeaderMinimalProps> = ({
  title = 'Audio Guide CI',
  showNotifications = true,
  notificationCount = 0,
  onNotificationClick
}) => {
  const { isAuthenticated, user, signOut } = useAuth();
  const history = useHistory();

  const handleAuthClick = () => {
    if (isAuthenticated) {
      signOut();
    } else {
      history.push('/login');
    }
  };

  return (
    <IonHeader className="header-minimal">
      <IonToolbar color="light">
        <IonTitle className="title-minimal">{title}</IonTitle>
        
        <IonButtons slot="end" className="header-actions">
          {showNotifications && (
            <IonButton 
              fill="clear" 
              className="btn-icon-minimal"
              onClick={onNotificationClick}
            >
              <IonIcon icon={notifications} />
              {notificationCount > 0 && (
                <IonBadge className="notification-badge" color="danger">
                  {notificationCount > 99 ? '99+' : notificationCount}
                </IonBadge>
              )}
            </IonButton>
          )}
          
          <IonButton 
            fill="clear" 
            className="btn-icon-minimal auth-button"
            onClick={handleAuthClick}
            title={isAuthenticated ? `Déconnexion (${user?.displayName})` : 'Se connecter'}
          >
            <IonIcon icon={isAuthenticated ? logOutOutline : person} />
          </IonButton>
        </IonButtons>
      </IonToolbar>
    </IonHeader>
  );
};

export default HeaderMinimal;