/**
 * ProfileMenu - Menu déroulant du profil dans le header
 * Affiche: Favoris, Statistiques, Achievements, Settings, Déconnexion
 */

import React, { useState, useRef, useEffect } from 'react';
import {
  IonButton,
  IonIcon,
  IonPopover,
  IonList,
  IonItem,
  IonLabel,
  IonAvatar,
} from '@ionic/react';
import {
  menuOutline,
  heartOutline,
  statsChartOutline,
  trophyOutline,
  settingsOutline,
  logOutOutline,
  logInOutline,
  personOutline,
} from 'ionicons/icons';
import { useHistory } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import './ProfileMenu.css';

interface ProfileMenuProps {
  className?: string;
}

const ProfileMenu: React.FC<ProfileMenuProps> = ({ className }) => {
  const [showPopover, setShowPopover] = useState(false);
  const [popoverEvent, setPopoverEvent] = useState<Event | undefined>(undefined);
  const { user, isAuthenticated, logout } = useAuth();
  const history = useHistory();

  const handleOpenPopover = (e: React.MouseEvent) => {
    e.persist();
    setPopoverEvent(e.nativeEvent);
    setShowPopover(true);
  };

  const handleNavigate = (path: string) => {
    setShowPopover(false);
    history.push(path);
  };

  const handleLogout = async () => {
    setShowPopover(false);
    await logout();
    history.push('/login');
  };

  const handleLogin = () => {
    setShowPopover(false);
    history.push('/login');
  };

  return (
    <>
      <IonButton
        fill="clear"
        onClick={handleOpenPopover}
        className={`profile-menu-button ${className || ''}`}
      >
        <IonIcon icon={menuOutline} className="profile-icon" />
      </IonButton>

      <IonPopover
        isOpen={showPopover}
        event={popoverEvent}
        onDidDismiss={() => setShowPopover(false)}
        className="profile-menu-popover"
      >
        <IonList className="profile-menu-list">
          {isAuthenticated ? (
            <>
              {/* User info */}
              <IonItem lines="none" className="profile-menu-header">
                <IonAvatar slot="start">
                  <img
                    src={user?.photoURL || 'https://i.pravatar.cc/150?img=1'}
                    alt="Profile"
                  />
                </IonAvatar>
                <IonLabel>
                  <h2>{user?.displayName || user?.email || 'Utilisateur'}</h2>
                  <p>{user?.email}</p>
                </IonLabel>
              </IonItem>

              {/* Menu items */}
              <IonItem button onClick={() => handleNavigate('/tabs/favorites')} detail={false}>
                <IonIcon icon={heartOutline} slot="start" />
                <IonLabel>Mes Favoris</IonLabel>
              </IonItem>

              <IonItem button onClick={() => handleNavigate('/stats')} detail={false}>
                <IonIcon icon={statsChartOutline} slot="start" />
                <IonLabel>Statistiques</IonLabel>
              </IonItem>

              <IonItem button onClick={() => handleNavigate('/leaderboard')} detail={false}>
                <IonIcon icon={trophyOutline} slot="start" />
                <IonLabel>Classement</IonLabel>
              </IonItem>

              <IonItem button onClick={() => handleNavigate('/settings')} detail={false}>
                <IonIcon icon={settingsOutline} slot="start" />
                <IonLabel>Paramètres</IonLabel>
              </IonItem>

              <IonItem button onClick={handleLogout} detail={false} lines="none">
                <IonIcon icon={logOutOutline} slot="start" color="danger" />
                <IonLabel color="danger">Déconnexion</IonLabel>
              </IonItem>
            </>
          ) : (
            <>
              {/* Guest user */}
              <IonItem lines="none" className="profile-menu-header">
                <IonAvatar slot="start">
                  <IonIcon icon={personOutline} />
                </IonAvatar>
                <IonLabel>
                  <h2>Invité</h2>
                  <p>Connectez-vous pour plus de fonctionnalités</p>
                </IonLabel>
              </IonItem>

              <IonItem button onClick={handleLogin} detail={false} lines="none">
                <IonIcon icon={logInOutline} slot="start" color="primary" />
                <IonLabel color="primary">Se connecter</IonLabel>
              </IonItem>
            </>
          )}
        </IonList>
      </IonPopover>
    </>
  );
};

export default ProfileMenu;
