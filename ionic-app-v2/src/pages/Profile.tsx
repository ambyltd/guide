/**
 * Page Profil Utilisateur
 */

import React, { useState, useEffect, useRef } from 'react';
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
  useIonViewDidEnter,
  useIonViewWillLeave,
} from '@ionic/react';
import {
  personOutline,
  logOutOutline,
  moonOutline,
  notificationsOutline,
  languageOutline,
  helpCircleOutline,
  informationCircleOutline,
  compassOutline,
} from 'ionicons/icons';
import { useHistory } from 'react-router-dom';
import { authService } from '../services/authService';
import { CacheManagement } from '../components/CacheManagement';
import { useServiceWorker } from '../hooks/useServiceWorker';
import { imageCacheService } from '../services/imageCacheService';
import { audioCacheService } from '../services/audioCacheService';
import { backgroundSyncService } from '../services/backgroundSyncService';
import { userStatsService } from '../services/userStatsService';
import { useAuth } from '../hooks/useAuth';
import ProfileMenu from '../components/ProfileMenu';
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
  const isMountedRef = useRef(true);
  const [user, setUser] = useState<User | null>(null);
  const [showLogoutAlert, setShowLogoutAlert] = useState(false);
  const [darkMode, setDarkMode] = useState(false);
  const [notifications, setNotifications] = useState(true);
  const { swStatus, isOnline } = useServiceWorker();
  
  // 📊 États pour les statistiques de cache
  const [cacheStats, setCacheStats] = useState({
    images: { totalImages: 0, totalSize: 0, compressed: 0 },
    audios: { totalAudios: 0, totalSize: 0 },
    sync: { totalPending: 0, byType: {} as Record<string, number> },
  });

  // 📊 États pour les statistiques utilisateur
  const [userStats, setUserStats] = useState<any>(null);
  const [userBadges, setUserBadges] = useState<any[]>([]);

  // 🔐 Récupérer l'utilisateur authentifié depuis Firebase
  const { user: firebaseUser } = useAuth();

  // Initialiser userStatsService avec Firebase user
  useEffect(() => {
    if (firebaseUser) {
      const userId = firebaseUser.uid;
      const userName = firebaseUser.displayName || firebaseUser.email || 'User';

      userStatsService.initialize(userId, userName);
    }
  }, [firebaseUser]);

  // Charger les données à chaque fois qu'on entre dans la page
  useIonViewDidEnter(() => {
    isMountedRef.current = true;
    console.log('📱 Profile - Page active, rechargement des données...');
    loadUserProfile();
    loadPreferences();
    loadCacheStats();
    loadUserStats();
  });

  // Marquer comme inactive quand on quitte la page
  useIonViewWillLeave(() => {
    isMountedRef.current = false;
    console.log('📱 Profile - Page inactive');
  });

  // 📊 Charger les statistiques de cache
  const loadCacheStats = async () => {
    try {
      const [imagesStats, audiosStats] = await Promise.all([
        imageCacheService.getStats(),
        audioCacheService.getStats(),
      ]);

      if (!isMountedRef.current) return;

      const syncStats = backgroundSyncService.getStats();

      setCacheStats({
        images: imagesStats,
        audios: audiosStats,
        sync: syncStats,
      });

      console.log('📊 Stats cache chargées:', {
        images: `${imagesStats.totalImages} images (${imageCacheService.formatBytes(imagesStats.totalSize)})`,
        audios: `${audiosStats.totalAudios} audios (${audioCacheService.formatBytes(audiosStats.totalSize)})`,
        sync: `${syncStats.totalPending} en attente`,
      });
    } catch (error) {
      console.error('❌ Erreur chargement stats cache:', error);
    }
  };

  // 📊 Charger les statistiques utilisateur
  const loadUserStats = async () => {
    try {
      const stats = await userStatsService.getUserStats();
      if (!isMountedRef.current) return;
      setUserStats(stats);

      // Vérifier et attribuer les badges automatiquement
      const newBadges = await userStatsService.checkAndAwardBadges();
      if (!isMountedRef.current) return;
      if (newBadges.length > 0) {
        console.log('🏆 Nouveaux badges attribués:', newBadges);
      }

      // Récupérer tous les badges disponibles (convertir Record en Array)
      const badgesObj = userStatsService.getAvailableBadges();
      const allBadges = Object.values(badgesObj);
      setUserBadges(allBadges);

      console.log('📊 Stats utilisateur chargées:', {
        attractionsVisited: stats.attractionsVisited,
        audioGuidesListened: stats.audioGuidesListened,
        favoriteCount: stats.favoriteCount,
        reviewCount: stats.reviewCount,
        badges: stats.badges.length,
      });
    } catch (error) {
      console.error('❌ Erreur chargement stats utilisateur:', error);
    }
  };

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
      history.push('/tabs/home', { replace: true });
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
        <IonHeader translucent className="profile-header-transparent">
          <IonToolbar style={{ '--background': 'transparent', '--border-width': '0' }}>
            <div slot="start" className="profile-logo-container">
              <IonAvatar className="profile-logo">
                <IonIcon icon={compassOutline} className="profile-logo-icon" />
              </IonAvatar>
            </div>
            <div slot="end">
              <ProfileMenu />
            </div>
          </IonToolbar>
        </IonHeader>
        <IonContent fullscreen>
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
      <IonHeader translucent className="profile-header-transparent">
        <IonToolbar style={{ '--background': 'transparent', '--border-width': '0' }}>
          <div slot="start" className="profile-logo-container">
            <IonAvatar className="profile-logo">
              <IonIcon icon={compassOutline} className="profile-logo-icon" />
            </IonAvatar>
          </div>
          <div slot="end">
            <ProfileMenu />
          </div>
        </IonToolbar>
      </IonHeader>

      <IonContent fullscreen>
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
          
          {/* Badge Offline Ready */}
          {swStatus.active && (
            <div className="profile-offline-badge">
              <IonText color={isOnline ? 'success' : 'warning'}>
                <p>
                  {isOnline ? '✅ Mode offline activé' : '📡 Hors ligne'}
                </p>
              </IonText>
            </div>
          )}
        </div>

        {/* Statistiques Utilisateur */}
        <IonCard className="stats-card">
          <IonCardContent>
            <h3>📊 Mes Statistiques</h3>
            <div className="stats-grid">
              <div className="stat-item">
                <div className="stat-value">
                  {userStats?.attractionsVisited || 0}
                </div>
                <div className="stat-label">Attractions visitées</div>
              </div>
              <div className="stat-item">
                <div className="stat-value">
                  {userStats?.favoriteCount || 0}
                </div>
                <div className="stat-label">Favoris</div>
              </div>
              <div className="stat-item">
                <div className="stat-value">
                  {userStats?.audioGuidesListened || 0}
                </div>
                <div className="stat-label">Guides écoutés</div>
              </div>
              <div className="stat-item">
                <div className="stat-value">
                  {userStats?.reviewCount || 0}
                </div>
                <div className="stat-label">Avis publiés</div>
              </div>
              <div className="stat-item">
                <div className="stat-value">
                  {userStats?.toursCompleted || 0}
                </div>
                <div className="stat-label">Circuits terminés</div>
              </div>
              <div className="stat-item">
                <div className="stat-value">
                  {userStatsService.formatListeningTime(userStats?.totalListeningTime || 0)}
                </div>
                <div className="stat-label">Temps d'écoute</div>
              </div>
            </div>
          </IonCardContent>
        </IonCard>

        {/* Badges */}
        {userStats?.badges && userStats.badges.length > 0 && (
          <IonCard className="badges-card">
            <IonCardContent>
              <h3>🏆 Mes Badges ({userStats.badges.length})</h3>
              <div className="badges-grid">
                {userBadges.slice(0, 6).map((badge) => {
                  const isUnlocked = userStats.badges.includes(badge.name);
                  return (
                    <div
                      key={badge.name}
                      className={`badge-item ${isUnlocked ? 'unlocked' : 'locked'}`}
                    >
                      <div className="badge-icon">{badge.icon}</div>
                      <div className="badge-name">{badge.description}</div>
                      {!isUnlocked && <div className="badge-lock">🔒</div>}
                    </div>
                  );
                })}
              </div>
              {userBadges.length > 6 && (
                <IonButton 
                  expand="block" 
                  fill="clear" 
                  size="small"
                  onClick={() => history.push('/stats')}
                  style={{ marginTop: '12px' }}
                >
                  Voir tous les achievements
                </IonButton>
              )}
            </IonCardContent>
          </IonCard>
        )}

        {/* Statistiques Avancées */}
        <IonCard className="advanced-stats-card">
          <IonCardContent>
            <h3>📊 Statistiques Avancées</h3>
            <p className="card-description">
              Découvrez vos tendances d'activité, achievements et classement parmi les autres utilisateurs.
            </p>
            <div className="stats-buttons">
              <IonButton 
                expand="block" 
                color="primary"
                onClick={() => history.push('/stats')}
              >
                📈 Voir mes statistiques
              </IonButton>
              <IonButton 
                expand="block" 
                fill="outline"
                onClick={() => history.push('/leaderboard')}
              >
                🏆 Classement
              </IonButton>
            </div>
          </IonCardContent>
        </IonCard>

        {/* 📊 Statistiques Cache & Stockage */}
        <IonCard className="cache-stats-card">
          <IonCardContent>
            <h3>Cache & Stockage</h3>
            <div className="cache-stats-grid">
              <div className="cache-stat-item">
                <div className="cache-stat-icon">🖼️</div>
                <div className="cache-stat-info">
                  <div className="cache-stat-value">
                    {cacheStats.images.totalImages} images
                  </div>
                  <div className="cache-stat-label">
                    {imageCacheService.formatBytes(cacheStats.images.totalSize)}
                    {cacheStats.images.compressed > 0 && 
                      ` • ${cacheStats.images.compressed} compressées`
                    }
                  </div>
                </div>
              </div>
              
              <div className="cache-stat-item">
                <div className="cache-stat-icon">🎵</div>
                <div className="cache-stat-info">
                  <div className="cache-stat-value">
                    {cacheStats.audios.totalAudios} audios
                  </div>
                  <div className="cache-stat-label">
                    {audioCacheService.formatBytes(cacheStats.audios.totalSize)}
                  </div>
                </div>
              </div>
              
              <div className="cache-stat-item">
                <div className="cache-stat-icon">⚡</div>
                <div className="cache-stat-info">
                  <div className="cache-stat-value">
                    {cacheStats.sync.totalPending} en attente
                  </div>
                  <div className="cache-stat-label">
                    Synchronisation
                  </div>
                </div>
              </div>
            </div>
            
            <IonButton 
              expand="block" 
              fill="outline" 
              size="small"
              onClick={loadCacheStats}
              style={{ marginTop: '16px' }}
            >
              🔄 Actualiser les statistiques
            </IonButton>
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

        {/* Gestion du cache offline (Sprint 3 Phase 2) */}
        <CacheManagement />

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
