/**
 * Page AudioGuides - Affichage et lecture des audioguides
 * Interface moderne avec liste, recherche et lecteur audio
 */

import React, { useState, useEffect } from 'react';
import {
  IonPage,
  IonHeader,
  IonToolbar,
  IonTitle,
  IonContent,
  IonSearchbar,
  IonList,
  IonItem,
  IonLabel,
  IonThumbnail,
  IonButton,
  IonIcon,
  IonChip,
  IonSpinner,
  IonRefresher,
  IonRefresherContent,
  IonSegment,
  IonSegmentButton,
  IonModal,
  IonCard,
  IonText,
  IonToast,
  IonRange,
  IonButtons,
  IonBackButton,
} from '@ionic/react';
import {
  playCircle,
  pauseCircle,
  downloadOutline,
  checkmarkCircle,
  closeCircle,
  searchOutline,
  volumeHighOutline,
  timeOutline,
  languageOutline,
} from 'ionicons/icons';
import { audioGuideService } from '../services/audioGuideService';
import type { BackendAudioGuide as AudioGuide } from '../types/backend';
import './AudioGuides.css';

const AudioGuidesPage: React.FC = () => {
  const [audioGuides, setAudioGuides] = useState<AudioGuide[]>([]);
  const [filteredGuides, setFilteredGuides] = useState<AudioGuide[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchText, setSearchText] = useState('');
  const [selectedLanguage, setSelectedLanguage] = useState<string>('all');
  const [selectedGuide, setSelectedGuide] = useState<AudioGuide | null>(null);
  const [showPlayer, setShowPlayer] = useState(false);
  const [playbackState, setPlaybackState] = useState<{
    isPlaying: boolean;
    currentTime: number;
    duration: number;
    volume?: number;
  } | null>(null);
  const [toast, setToast] = useState<{ show: boolean; message: string; color: string }>({
    show: false,
    message: '',
    color: 'success',
  });

  // Charger les audioguides
  useEffect(() => {
    loadAudioGuides();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const loadAudioGuides = async () => {
    try {
      setLoading(true);
      const guides = await audioGuideService.getAudioGuides({ status: 'active' });
      setAudioGuides(guides);
      setFilteredGuides(guides);
    } catch (error) {
      console.error('Erreur chargement audioguides:', error);
      showToast('Erreur de chargement', 'danger');
    } finally {
      setLoading(false);
    }
  };

  // Rafraîchissement
  const handleRefresh = async (event: CustomEvent) => {
    await loadAudioGuides();
    event.detail.complete();
  };

  // Recherche
  useEffect(() => {
    let filtered = [...audioGuides];

    // Filtre par langue
    if (selectedLanguage !== 'all') {
      filtered = filtered.filter((guide) => guide.language === selectedLanguage);
    }

    // Filtre par recherche
    if (searchText) {
      filtered = filtered.filter(
        (guide) =>
          guide.title.toLowerCase().includes(searchText.toLowerCase()) ||
          guide.description?.toLowerCase().includes(searchText.toLowerCase())
      );
    }

    setFilteredGuides(filtered);
  }, [searchText, selectedLanguage, audioGuides]);

  // Téléchargement
  const handleDownload = async (guide: AudioGuide) => {
    try {
      showToast('Téléchargement en cours...', 'primary');
      await audioGuideService.downloadAudioGuide(guide._id);
      showToast('Audioguide téléchargé avec succès !', 'success');
    } catch (error) {
      console.error('Erreur téléchargement:', error);
      showToast('Erreur de téléchargement', 'danger');
    }
  };

  // Lecture
  const handlePlay = async (guide: AudioGuide) => {
    try {
      setSelectedGuide(guide);
      setShowPlayer(true);
      await audioGuideService.play(guide._id);
      
      // Mettre à jour l'état de lecture
      const interval = setInterval(() => {
        const state = audioGuideService.getPlaybackState();
        if (state) {
          setPlaybackState(state);
        } else {
          clearInterval(interval);
        }
      }, 100);
    } catch (error) {
      console.error('Erreur lecture:', error);
      showToast('Erreur de lecture audio', 'danger');
    }
  };

  // Pause
  const handlePause = () => {
    audioGuideService.pause();
    const state = audioGuideService.getPlaybackState();
    if (state) {
      setPlaybackState({ ...state, isPlaying: false });
    }
  };

  // Reprendre
  const handleResume = () => {
    audioGuideService.resume();
    const state = audioGuideService.getPlaybackState();
    if (state) {
      setPlaybackState({ ...state, isPlaying: true });
    }
  };

  // Arrêter
  const handleStop = () => {
    audioGuideService.stop();
    setShowPlayer(false);
    setSelectedGuide(null);
    setPlaybackState(null);
  };

  // Changer la position
  const handleSeek = (value: number) => {
    audioGuideService.seek(value);
  };

  // Changer le volume
  const handleVolumeChange = (value: number) => {
    audioGuideService.setVolume(value);
  };

  // Formater le temps
  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  // Toast
  const showToast = (message: string, color: string) => {
    setToast({ show: true, message, color });
  };

  // Langues disponibles
  const languages = ['all', 'fr', 'en'];
  const languageLabels: Record<string, string> = {
    all: 'Toutes',
    fr: 'Français',
    en: 'English',
  };

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonButtons slot="start">
            <IonBackButton defaultHref="/home" />
          </IonButtons>
          <IonTitle>AudioGuides</IonTitle>
        </IonToolbar>

        {/* Barre de recherche */}
        <IonToolbar>
          <IonSearchbar
            value={searchText}
            onIonInput={(e) => setSearchText(e.detail.value || '')}
            placeholder="Rechercher un audioguide..."
            showClearButton="focus"
          />
        </IonToolbar>

        {/* Filtres de langue */}
        <IonToolbar>
          <IonSegment
            value={selectedLanguage}
            onIonChange={(e) => setSelectedLanguage(e.detail.value as string)}
          >
            {languages.map((lang) => (
              <IonSegmentButton key={lang} value={lang}>
                <IonLabel>{languageLabels[lang]}</IonLabel>
              </IonSegmentButton>
            ))}
          </IonSegment>
        </IonToolbar>
      </IonHeader>

      <IonContent>
        {/* Rafraîchissement */}
        <IonRefresher slot="fixed" onIonRefresh={handleRefresh}>
          <IonRefresherContent />
        </IonRefresher>

        {/* Loading */}
        {loading && (
          <div className="loading-container">
            <IonSpinner name="crescent" />
            <IonText>
              <p>Chargement des audioguides...</p>
            </IonText>
          </div>
        )}

        {/* Liste des audioguides */}
        {!loading && (
          <IonList>
            {filteredGuides.length === 0 ? (
              <div className="empty-state">
                <IonIcon icon={searchOutline} className="empty-icon" />
                <IonText>
                  <h2>Aucun audioguide trouvé</h2>
                  <p>Essayez de modifier vos filtres de recherche</p>
                </IonText>
              </div>
            ) : (
              filteredGuides.map((guide) => {
                const isDownloaded = audioGuideService.isDownloaded(guide._id);

                return (
                  <IonCard key={guide._id} className="audioguide-card">
                    <IonItem lines="none">
                      <IonThumbnail slot="start" className="audioguide-thumbnail">
                        <img
                          src={guide.thumbnailUrl || '/assets/default-audio.png'}
                          alt={guide.title}
                        />
                      </IonThumbnail>

                      <IonLabel>
                        <h2>{guide.title}</h2>
                        <p>{guide.description}</p>

                        <div className="audioguide-meta">
                          <IonChip color="primary">
                            <IonIcon icon={languageOutline} />
                            <IonLabel>{guide.language.toUpperCase()}</IonLabel>
                          </IonChip>
                          <IonChip color="medium">
                            <IonIcon icon={timeOutline} />
                            <IonLabel>{guide.duration || '0:00'}</IonLabel>
                          </IonChip>
                        </div>
                      </IonLabel>

                      <div className="audioguide-actions" slot="end">
                        {/* Bouton Télécharger */}
                        {!isDownloaded ? (
                          <IonButton
                            fill="clear"
                            onClick={() => handleDownload(guide)}
                          >
                            <IonIcon icon={downloadOutline} slot="icon-only" />
                          </IonButton>
                        ) : (
                          <IonIcon
                            icon={checkmarkCircle}
                            color="success"
                            className="downloaded-icon"
                          />
                        )}

                        {/* Bouton Lecture */}
                        <IonButton fill="solid" onClick={() => handlePlay(guide)}>
                          <IonIcon icon={playCircle} slot="start" />
                          Écouter
                        </IonButton>
                      </div>
                    </IonItem>
                  </IonCard>
                );
              })
            )}
          </IonList>
        )}

        {/* Lecteur Audio Modal */}
        <IonModal isOpen={showPlayer} onDidDismiss={handleStop}>
          <IonHeader>
            <IonToolbar>
              <IonTitle>Lecture en cours</IonTitle>
              <IonButtons slot="end">
                <IonButton onClick={handleStop}>
                  <IonIcon icon={closeCircle} />
                </IonButton>
              </IonButtons>
            </IonToolbar>
          </IonHeader>

          <IonContent className="player-content">
            {selectedGuide && (
              <div className="audio-player">
                {/* Cover */}
                <div className="player-cover">
                  <img
                    src={selectedGuide.thumbnailUrl || '/assets/default-audio.png'}
                    alt={selectedGuide.title}
                  />
                </div>

                {/* Info */}
                <div className="player-info">
                  <h2>{selectedGuide.title}</h2>
                  <p>{selectedGuide.description}</p>
                </div>

                {/* Progress */}
                <div className="player-progress">
                  <IonText>{formatTime(playbackState?.currentTime || 0)}</IonText>
                  <IonRange
                    min={0}
                    max={playbackState?.duration || 100}
                    value={playbackState?.currentTime || 0}
                    onIonChange={(e) => handleSeek(e.detail.value as number)}
                  />
                  <IonText>{formatTime(playbackState?.duration || 0)}</IonText>
                </div>

                {/* Contrôles */}
                <div className="player-controls">
                  {playbackState?.isPlaying ? (
                    <IonButton size="large" onClick={handlePause}>
                      <IonIcon icon={pauseCircle} />
                    </IonButton>
                  ) : (
                    <IonButton size="large" onClick={handleResume}>
                      <IonIcon icon={playCircle} />
                    </IonButton>
                  )}
                </div>

                {/* Volume */}
                <div className="player-volume">
                  <IonIcon icon={volumeHighOutline} />
                  <IonRange
                    min={0}
                    max={1}
                    step={0.1}
                    value={playbackState?.volume || 1}
                    onIonChange={(e) => handleVolumeChange(e.detail.value as number)}
                  />
                </div>
              </div>
            )}
          </IonContent>
        </IonModal>

        {/* Toast */}
        <IonToast
          isOpen={toast.show}
          message={toast.message}
          duration={3000}
          color={toast.color}
          onDidDismiss={() => setToast({ ...toast, show: false })}
        />
      </IonContent>
    </IonPage>
  );
};

export default AudioGuidesPage;
