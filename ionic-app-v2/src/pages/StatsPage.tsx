/**
 * StatsPage - Page de statistiques avancées
 * Sprint 4 - Phase 6
 * 
 * Fonctionnalités:
 * - Graphiques de tendances (7j/30j)
 * - Comparaison avec pairs
 * - Achievements avec progression
 * - Leaderboard
 */

import React, { useState, useEffect, useCallback } from 'react';
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
  IonGrid,
  IonRow,
  IonCol,
  IonProgressBar,
  IonBadge,
  IonSpinner,
  IonRefresher,
  IonRefresherContent,
  RefresherEventDetail,
} from '@ionic/react';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import {
  advancedStatsService,
  type UserTrends,
  type Achievement,
  type ComparisonData,
} from '../services/advancedStatsService';
import { useAuth } from '../hooks/useAuth';
import './StatsPage.css';

const StatsPage: React.FC = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<'trends' | 'achievements' | 'compare'>('trends');
  const [timeframe, setTimeframe] = useState<'7d' | '30d'>('30d');
  const [loading, setLoading] = useState<boolean>(true);

  // Data states
  const [trends, setTrends] = useState<UserTrends | null>(null);
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [comparison, setComparison] = useState<ComparisonData | null>(null);

  // Initialize service with userId
  useEffect(() => {
    if (user?.uid) {
      advancedStatsService.initialize(user.uid);
    }
  }, [user]);

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      if (activeTab === 'trends') {
        const trendsData = await advancedStatsService.getUserTrends(timeframe);
        setTrends(trendsData);
      } else if (activeTab === 'achievements') {
        const achievementsData = await advancedStatsService.getAchievements();
        setAchievements(achievementsData);
      } else if (activeTab === 'compare') {
        const comparisonData = await advancedStatsService.compareWithPeers();
        setComparison(comparisonData);
      }
    } catch (error) {
      console.error('Error loading stats:', error);
    } finally {
      setLoading(false);
    }
  }, [activeTab, timeframe]);

  useEffect(() => {
    if (user?.uid) {
      loadData();
    }
  }, [user, loadData]);

  const handleRefresh = async (event: CustomEvent<RefresherEventDetail>) => {
    await loadData();
    event.detail.complete();
  };

  const renderTrendsTab = () => {
    if (!trends) return null;

    // Transformer les données pour Recharts
    const chartData = trends.attractionsVisited.map((item, index) => ({
      date: new Date(item.date).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short' }),
      attractions: item.value,
      guides: trends.audioGuidesListened[index]?.value || 0,
      reviews: trends.reviewCount[index]?.value || 0,
    }));

    return (
      <div className="trends-container">
        {/* Sélecteur de période */}
        <IonSegment
          value={timeframe}
          onIonChange={(e) => setTimeframe(e.detail.value as '7d' | '30d')}
          className="timeframe-segment"
        >
          <IonSegmentButton value="7d">
            <IonLabel>7 jours</IonLabel>
          </IonSegmentButton>
          <IonSegmentButton value="30d">
            <IonLabel>30 jours</IonLabel>
          </IonSegmentButton>
        </IonSegment>

        {/* Graphique d'activité */}
        <IonCard>
          <IonCardHeader>
            <IonCardTitle>📈 Activité récente</IonCardTitle>
          </IonCardHeader>
          <IonCardContent>
            <ResponsiveContainer width="100%" height={250}>
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="attractions" stroke="#3880ff" name="Attractions" />
                <Line type="monotone" dataKey="guides" stroke="#10dc60" name="Audioguides" />
                <Line type="monotone" dataKey="reviews" stroke="#ffce00" name="Avis" />
              </LineChart>
            </ResponsiveContainer>
          </IonCardContent>
        </IonCard>

        {/* Temps d'écoute */}
        <IonCard>
          <IonCardHeader>
            <IonCardTitle>🎧 Temps d'écoute</IonCardTitle>
          </IonCardHeader>
          <IonCardContent>
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="guides" fill="#10dc60" name="Guides écoutés" />
              </BarChart>
            </ResponsiveContainer>
          </IonCardContent>
        </IonCard>
      </div>
    );
  };

  const renderAchievementsTab = () => {
    const categories = {
      exploration: { name: 'Exploration', icon: '🗺️' },
      learning: { name: 'Apprentissage', icon: '🎓' },
      social: { name: 'Social', icon: '👥' },
      master: { name: 'Maître', icon: '💎' },
    };

    return (
      <div className="achievements-container">
        {Object.entries(categories).map(([key, category]) => {
          const categoryAchievements = achievements.filter((a) => a.category === key);
          const unlockedCount = categoryAchievements.filter((a) => a.unlockedAt).length;

          return (
            <IonCard key={key}>
              <IonCardHeader>
                <IonCardTitle>
                  {category.icon} {category.name}
                  <IonBadge color="primary" slot="end">
                    {unlockedCount}/{categoryAchievements.length}
                  </IonBadge>
                </IonCardTitle>
              </IonCardHeader>
              <IonCardContent>
                <IonGrid>
                  <IonRow>
                    {categoryAchievements.map((achievement) => (
                      <IonCol size="6" key={achievement.id}>
                        <div
                          className={`achievement-item ${achievement.unlockedAt ? 'unlocked' : 'locked'}`}
                          style={{ borderColor: advancedStatsService.getTierColor(achievement.tier) }}
                        >
                          <div className="achievement-icon">{achievement.icon}</div>
                          <div className="achievement-name">{achievement.name}</div>
                          <div className="achievement-desc">{achievement.description}</div>
                          <IonProgressBar value={achievement.progress / 100} />
                          <div className="achievement-progress">{Math.round(achievement.progress)}%</div>
                          {achievement.unlockedAt && (
                            <IonBadge color="success" className="achievement-badge">
                              Débloqué ✓
                            </IonBadge>
                          )}
                        </div>
                      </IonCol>
                    ))}
                  </IonRow>
                </IonGrid>
              </IonCardContent>
            </IonCard>
          );
        })}
      </div>
    );
  };

  const renderCompareTab = () => {
    if (!comparison) return null;

    const userStats = comparison.user.stats;
    const peerAverage = comparison.peers.average;

    const comparisonData = [
      {
        metric: 'Attractions',
        user: userStats.attractionsVisited,
        peers: peerAverage.attractionsVisited || 0,
      },
      {
        metric: 'Guides',
        user: userStats.audioGuidesListened,
        peers: peerAverage.audioGuidesListened || 0,
      },
      {
        metric: 'Avis',
        user: userStats.reviewCount,
        peers: peerAverage.reviewCount || 0,
      },
      {
        metric: 'Circuits',
        user: userStats.toursCompleted,
        peers: peerAverage.toursCompleted || 0,
      },
    ];

    return (
      <div className="compare-container">
        {/* Rang global */}
        <IonCard className="rank-card">
          <IonCardContent>
            <div className="rank-display">
              <div className="rank-emoji">
                {advancedStatsService.getRankEmoji(comparison.peers.rank)}
              </div>
              <div className="rank-info">
                <div className="rank-number">#{comparison.peers.rank}</div>
                <div className="rank-label">
                  sur {advancedStatsService.formatNumber(comparison.peers.total)} utilisateurs
                </div>
                <div className="rank-percentile">
                  Top {100 - comparison.peers.percentile}%
                </div>
              </div>
            </div>
          </IonCardContent>
        </IonCard>

        {/* Graphique de comparaison */}
        <IonCard>
          <IonCardHeader>
            <IonCardTitle>📊 Comparaison avec la moyenne</IonCardTitle>
          </IonCardHeader>
          <IonCardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={comparisonData} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis type="number" />
                <YAxis dataKey="metric" type="category" />
                <Tooltip />
                <Legend />
                <Bar dataKey="user" fill="#3880ff" name="Vous" />
                <Bar dataKey="peers" fill="#ffce00" name="Moyenne" />
              </BarChart>
            </ResponsiveContainer>
          </IonCardContent>
        </IonCard>

        {/* Détails des stats */}
        <IonCard>
          <IonCardHeader>
            <IonCardTitle>📈 Détails</IonCardTitle>
          </IonCardHeader>
          <IonCardContent>
            <IonGrid>
              {comparisonData.map((item) => {
                const diff = item.user - item.peers;
                const diffPercent = item.peers > 0 ? (diff / item.peers) * 100 : 0;
                const isAbove = diff > 0;

                return (
                  <IonRow key={item.metric} className="stat-row">
                    <IonCol size="4">
                      <strong>{item.metric}</strong>
                    </IonCol>
                    <IonCol size="3" className="text-center">
                      {item.user}
                    </IonCol>
                    <IonCol size="3" className="text-center text-muted">
                      {item.peers.toFixed(1)}
                    </IonCol>
                    <IonCol size="2" className="text-right">
                      <IonBadge color={isAbove ? 'success' : 'medium'}>
                        {isAbove ? '+' : ''}
                        {diffPercent.toFixed(0)}%
                      </IonBadge>
                    </IonCol>
                  </IonRow>
                );
              })}
            </IonGrid>
          </IonCardContent>
        </IonCard>
      </div>
    );
  };

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonButtons slot="start">
            <IonBackButton defaultHref="/profile" />
          </IonButtons>
          <IonTitle>Statistiques</IonTitle>
        </IonToolbar>
      </IonHeader>

      <IonContent fullscreen>
        <IonRefresher slot="fixed" onIonRefresh={handleRefresh}>
          <IonRefresherContent />
        </IonRefresher>

        {/* Tabs */}
        <IonSegment
          value={activeTab}
          onIonChange={(e) => setActiveTab(e.detail.value as any)}
          className="main-segment"
        >
          <IonSegmentButton value="trends">
            <IonLabel>Tendances</IonLabel>
          </IonSegmentButton>
          <IonSegmentButton value="achievements">
            <IonLabel>Achievements</IonLabel>
          </IonSegmentButton>
          <IonSegmentButton value="compare">
            <IonLabel>Comparaison</IonLabel>
          </IonSegmentButton>
        </IonSegment>

        {/* Contenu */}
        {loading ? (
          <div className="loading-container">
            <IonSpinner />
          </div>
        ) : (
          <>
            {activeTab === 'trends' && renderTrendsTab()}
            {activeTab === 'achievements' && renderAchievementsTab()}
            {activeTab === 'compare' && renderCompareTab()}
          </>
        )}
      </IonContent>
    </IonPage>
  );
};

export default StatsPage;
