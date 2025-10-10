/**
 * Page Profil Utilisateur
 */

import React, { useState, useEffect } from 'react';
import {
  IonPage,
  IonHeader,
  IonToolbar,
  IonContent,
  IonList,
  IonItem,
  IonLabel,
  IonButton,
  IonIcon,
  IonAvatar,
  IonText,
  IonCard,
  IonCardContent,
  IonAlert,
  IonToggle,
} from '@ionic/react';
import {
  personOutline,
  logOutOutline,
  moonOutline,
  notificationsOutline,
  languageOutline,
  helpCircleOutline,
  informationCircleOutline,
} from 'ionicons/icons';
import { useHistory } from 'react-router-dom';
import { authService } from '../services/authService';
import './Profile.css';

interface User {
  name?: string;
  displayName?: string | null;
  email?: string | null;
  photoURL?: string | null;
  visitedCount?: number;
  favoritesCount?: number;
  reviewsCount?: number;
}

const ProfilePage: React.FC = () => {
  const history = useHistory();
  const [user, setUser] = useState<User | null>(null);
  const [showLogoutAlert, setShowLogoutAlert] = useState(false);
  const [darkMode, setDarkMode] = useState(false);
  const [notifications, setNotifications] = useState(true);

  useEffect(() => {
    loadUserProfile();
    loadPreferences();
  }, []);

  const loadUserProfile = () => {
    const currentUser = authService.getCurrentUser();
    setUser(currentUser);
  };

  const loadPreferences = () => {
    const savedDarkMode = localStorage.getItem('darkMode') === 'true';
    const savedNotifications = localStorage.getItem('notifications') !== 'false';
    setDarkMode(savedDarkMode);
    setNotifications(savedNotifications);
  };

  const handleLogout = async () => {
    try {
      await authService.signOut();
      history.replace('/login');
    } catch (error) {
      console.error('Erreur déconnexion:', error);
    }
  };

  const toggleDarkMode = (checked: boolean) => {
    setDarkMode(checked);
    localStorage.setItem('darkMode', checked.toString());
    document.body.classList.toggle('dark', checked);
  };

  const toggleNotifications = (checked: boolean) => {
    setNotifications(checked);
    localStorage.setItem('notifications', checked.toString());
  };

  if (!user) {
    return (
      <IonPage>
        <IonHeader>
          <IonToolbar>
          </IonToolbar>
        </IonHeader>
        <IonContent>
          <div className="not-logged-container">
            <IonText>
              <h2>Non connecté</h2>
              <p>Connectez-vous pour accéder à votre profil</p>
            </IonText>
            <IonButton routerLink="/login" expand="block">
              Se connecter
            </IonButton>
          </div>
        </IonContent>
      </IonPage>
    );
  }

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
        </IonToolbar>
      </IonHeader>

      <IonContent>
        {/* En-tête profil */}
        <div className="profile-header">
          <IonAvatar className="profile-avatar">
            {user.photoURL ? (
              <img src={user.photoURL} alt={user.displayName || 'Avatar'} />
            ) : (
              <div className="avatar-placeholder">
                <IonIcon icon={personOutline} />
              </div>
            )}
          </IonAvatar>
          <h2>{user.displayName || 'Utilisateur'}</h2>
          <p>{user.email}</p>
        </div>

        {/* Statistiques */}
        <IonCard className="stats-card">
          <IonCardContent>
            <div className="stats-grid">
              <div className="stat-item">
                <div className="stat-value">
                  {JSON.parse(localStorage.getItem('favorites') || '[]').length}
                </div>
                <div className="stat-label">Favoris</div>
              </div>
              <div className="stat-item">
                <div className="stat-value">
                  {JSON.parse(localStorage.getItem('downloadedGuides') || '[]').length}
                </div>
                <div className="stat-label">Téléchargés</div>
              </div>
              <div className="stat-item">
                <div className="stat-value">
                  {JSON.parse(localStorage.getItem('playbackHistory') || '[]').length}
                </div>
                <div className="stat-label">Écoutés</div>
              </div>
            </div>
          </IonCardContent>
        </IonCard>

        {/* Paramètres */}
        <IonList>
          <IonItem>
            <IonIcon icon={moonOutline} slot="start" />
            <IonLabel>Mode sombre</IonLabel>
            <IonToggle checked={darkMode} onIonChange={(e) => toggleDarkMode(e.detail.checked)} />
          </IonItem>

          <IonItem>
            <IonIcon icon={notificationsOutline} slot="start" />
            <IonLabel>Notifications</IonLabel>
            <IonToggle
              checked={notifications}
              onIonChange={(e) => toggleNotifications(e.detail.checked)}
            />
          </IonItem>

          <IonItem button>
            <IonIcon icon={languageOutline} slot="start" />
            <IonLabel>
              <h3>Langue</h3>
              <p>Français</p>
            </IonLabel>
          </IonItem>
        </IonList>

        {/* Support */}
        <IonList>
          <IonItem button>
            <IonIcon icon={helpCircleOutline} slot="start" />
            <IonLabel>Aide et Support</IonLabel>
          </IonItem>

          <IonItem button>
            <IonIcon icon={informationCircleOutline} slot="start" />
            <IonLabel>
              <h3>À propos</h3>
              <p>Version 1.0.0</p>
            </IonLabel>
          </IonItem>
        </IonList>

        {/* Déconnexion */}
        <div className="logout-section">
          <IonButton
            expand="block"
            color="danger"
            onClick={() => setShowLogoutAlert(true)}
          >
            <IonIcon icon={logOutOutline} slot="start" />
            Se déconnecter
          </IonButton>
        </div>

        {/* Alert confirmation déconnexion */}
        <IonAlert
          isOpen={showLogoutAlert}
          onDidDismiss={() => setShowLogoutAlert(false)}
          header="Déconnexion"
          message="Êtes-vous sûr de vouloir vous déconnecter ?"
          buttons={[
            {
              text: 'Annuler',
              role: 'cancel',
            },
            {
              text: 'Déconnexion',
              role: 'confirm',
              handler: handleLogout,
            },
          ]}
        />
      </IonContent>
    </IonPage>
  );
};

export default ProfilePage;
