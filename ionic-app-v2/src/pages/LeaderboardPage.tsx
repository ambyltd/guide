/**
 * LeaderboardPage - Classement des utilisateurs
 * Sprint 4 - Phase 6
 * 
 * Fonctionnalités:
 * - Top utilisateurs par métrique
 * - Filtres: Tout temps, Semaine, Mois
 * - Tri: Visits, Guides, Reviews, Favoris
 * - Highlight du rang de l'utilisateur
 */

import React, { useState, useEffect } from 'react';
import {
  IonPage,
  IonHeader,
  IonToolbar,
  IonButtons,
  IonBackButton,
  IonTitle,
  IonContent,
  IonSegment,
  IonSegmentButton,
  IonLabel,
  IonCard,
  IonCardHeader,
  IonCardTitle,
  IonCardContent,
  IonList,
  IonItem,
  IonAvatar,
  IonBadge,
  IonSpinner,
  IonRefresher,
  IonRefresherContent,
  RefresherEventDetail,
  IonChip,
} from '@ionic/react';
import {
  advancedStatsService,
  type LeaderboardEntry,
  type LeaderboardResponse,
} from '../services/advancedStatsService';
import ProfileMenu from '../components/ProfileMenu';
import './LeaderboardPage.css';

const LeaderboardPage: React.FC = () => {
  const [timeframe, setTimeframe] = useState<'7d' | '30d' | 'all'>('all');
  const [sortBy, setSortBy] = useState<'attractionsVisited' | 'audioGuidesListened' | 'reviewCount' | 'totalListeningTime'>('attractionsVisited');
  const [loading, setLoading] = useState<boolean>(true);
  const [leaderboard, setLeaderboard] = useState<LeaderboardResponse | null>(null);
  const currentUserId = 'current-user-id'; // TODO: Get from auth

  useEffect(() => {
    loadLeaderboard();
    // eslint-disable-next-line
  }, [timeframe, sortBy]);

  const loadLeaderboard = async () => {
    setLoading(true);
    try {
      const data = await advancedStatsService.getLeaderboard(sortBy, 50, timeframe);
      setLeaderboard(data);
    } catch (error) {
      console.error('Error loading leaderboard:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async (event: CustomEvent<RefresherEventDetail>) => {
    await loadLeaderboard();
    event.detail.complete();
  };

  const getSortLabel = (key: typeof sortBy): string => {
    const labels = {
      attractionsVisited: '🗺️ Attractions',
      audioGuidesListened: '🎧 Audioguides',
      reviewCount: '✍️ Avis',
      totalListeningTime: '⏰ Temps d\'écoute',
    };
    return labels[key];
  };

  const getTimeframeLabel = (key: typeof timeframe): string => {
    const labels = {
      '7d': 'Cette semaine',
      '30d': 'Ce mois',
      'all': 'Tout temps',
    };
    return labels[key];
  };

  const formatValue = (entry: LeaderboardEntry, key: typeof sortBy): string => {
    const value = (entry as any)[key] || 0;
    
    if (key === 'totalListeningTime') {
      // Convertir secondes en heures
      const hours = Math.floor(value / 3600);
      const minutes = Math.floor((value % 3600) / 60);
      return `${hours}h ${minutes}m`;
    }
    
    return advancedStatsService.formatNumber(value);
  };

  const renderLeaderboardItem = (entry: LeaderboardEntry, index: number) => {
    const isCurrentUser = entry.userId === currentUserId;

    return (
      <IonItem
        key={entry.userId}
        className={isCurrentUser ? 'current-user' : ''}
        detail={false}
      >
        {/* Rang */}
        <div slot="start" className="rank-badge">
          <div className="rank-number">{entry.rank}</div>
          <div className="rank-emoji">{advancedStatsService.getRankEmoji(entry.rank)}</div>
        </div>

        {/* Avatar */}
        <IonAvatar slot="start">
          {entry.userAvatar ? (
            <img src={entry.userAvatar} alt={entry.userName} />
          ) : (
            <div className="avatar-placeholder">
              {entry.userName.charAt(0).toUpperCase()}
            </div>
          )}
        </IonAvatar>

        {/* Info utilisateur */}
        <div className="user-info">
          <div className="user-name">
            {entry.userName}
            {isCurrentUser && (
              <IonBadge color="primary" className="you-badge">
                Vous
              </IonBadge>
            )}
          </div>
          <div className="user-stats">
            <span className="stat-value">{formatValue(entry, sortBy)}</span>
            <span className="stat-label">{getSortLabel(sortBy)}</span>
          </div>
          {entry.badges.length > 0 && (
            <div className="user-badges">
              {entry.badges.slice(0, 3).map((badge, i) => (
                <IonChip key={i} className="badge-chip">
                  {badge}
                </IonChip>
              ))}
              {entry.badges.length > 3 && (
                <IonChip className="badge-chip">+{entry.badges.length - 3}</IonChip>
              )}
            </div>
          )}
        </div>

        {/* Score */}
        <div slot="end" className="score-badge">
          <div className="score-value">{entry.score}</div>
          <div className="score-label">pts</div>
        </div>
      </IonItem>
    );
  };

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonButtons slot="start">
            <IonBackButton defaultHref="/profile" />
          </IonButtons>
          <IonTitle>Classement</IonTitle>
          <IonButtons slot="end">
            <ProfileMenu />
          </IonButtons>
        </IonToolbar>
      </IonHeader>

      <IonContent fullscreen>
        <IonRefresher slot="fixed" onIonRefresh={handleRefresh}>
          <IonRefresherContent />
        </IonRefresher>

        {/* Filtres de période */}
        <IonSegment
          value={timeframe}
          onIonChange={(e) => setTimeframe(e.detail.value as typeof timeframe)}
          className="timeframe-segment"
        >
          <IonSegmentButton value="7d">
            <IonLabel>7j</IonLabel>
          </IonSegmentButton>
          <IonSegmentButton value="30d">
            <IonLabel>30j</IonLabel>
          </IonSegmentButton>
          <IonSegmentButton value="all">
            <IonLabel>Tout</IonLabel>
          </IonSegmentButton>
        </IonSegment>

        {/* Filtres de métrique */}
        <div className="sort-chips">
          <IonChip
            color={sortBy === 'attractionsVisited' ? 'primary' : 'medium'}
            onClick={() => setSortBy('attractionsVisited')}
          >
            🗺️ Attractions
          </IonChip>
          <IonChip
            color={sortBy === 'audioGuidesListened' ? 'primary' : 'medium'}
            onClick={() => setSortBy('audioGuidesListened')}
          >
            🎧 Guides
          </IonChip>
          <IonChip
            color={sortBy === 'reviewCount' ? 'primary' : 'medium'}
            onClick={() => setSortBy('reviewCount')}
          >
            ✍️ Avis
          </IonChip>
          <IonChip
            color={sortBy === 'totalListeningTime' ? 'primary' : 'medium'}
            onClick={() => setSortBy('totalListeningTime')}
          >
            ⏰ Écoute
          </IonChip>
        </div>

        {/* Leaderboard */}
        {loading ? (
          <div className="loading-container">
            <IonSpinner />
          </div>
        ) : leaderboard && leaderboard.data.length > 0 ? (
          <IonCard className="leaderboard-card">
            <IonCardHeader>
              <IonCardTitle>
                🏆 {getTimeframeLabel(timeframe)} - {getSortLabel(sortBy)}
              </IonCardTitle>
            </IonCardHeader>
            <IonCardContent>
              <IonList>
                {leaderboard.data.map((entry, index) => renderLeaderboardItem(entry, index))}
              </IonList>
            </IonCardContent>
          </IonCard>
        ) : (
          <div className="empty-state">
            <div className="empty-icon">📊</div>
            <div className="empty-title">Aucune donnée</div>
            <div className="empty-text">Le classement n'est pas encore disponible</div>
          </div>
        )}
      </IonContent>
    </IonPage>
  );
};

export default LeaderboardPage;
