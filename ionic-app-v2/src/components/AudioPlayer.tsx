/**
 * Composant AudioPlayer - Lecteur audio avancé
 * Contrôles: Play/Pause, progression, vitesse, marque-pages
 */

import React, { useState, useEffect, useRef } from 'react';
import {
  IonModal,
  IonHeader,
  IonToolbar,
  IonTitle,
  IonContent,
  IonButton,
  IonIcon,
  IonRange,
  IonLabel,
  IonItem,
  IonList,
  IonButtons,
  IonText,
  IonChip,
  IonProgressBar,
  IonSegment,
  IonSegmentButton,
  IonCard,
  IonCardContent,
} from '@ionic/react';
import {
  play,
  pause,
  playSkipBack,
  playSkipForward,
  close,
  volumeHigh,
  bookmark as bookmarkIcon,
  speedometer,
  downloadOutline,
  checkmarkCircle,
} from 'ionicons/icons';
import type { BackendAudioGuide } from '../types/backend';
import './AudioPlayer.css';

interface AudioPlayerProps {
  isOpen: boolean;
  audioGuide: BackendAudioGuide | null;
  onClose: () => void;
}

interface Bookmark {
  time: number;
  label: string;
}

const AudioPlayer: React.FC<AudioPlayerProps> = ({ isOpen, audioGuide, onClose }) => {
  const audioRef = useRef<HTMLAudioElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1);
  const [playbackRate, setPlaybackRate] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [bookmarks, setBookmarks] = useState<Bookmark[]>([]);
  const [activeTab, setActiveTab] = useState<'player' | 'bookmarks'>('player');
  const [isDownloaded, setIsDownloaded] = useState(false);

  // Initialiser l'audio
  useEffect(() => {
    if (!audioRef.current || !audioGuide) return;

    const audio = audioRef.current;
    audio.src = audioGuide.audioUrl;
    audio.volume = volume;
    audio.playbackRate = playbackRate;

    // Event listeners
    const handleLoadedMetadata = () => {
      setDuration(audio.duration);
      setIsLoading(false);
    };

    const handleTimeUpdate = () => {
      setCurrentTime(audio.currentTime);
    };

    const handleEnded = () => {
      setIsPlaying(false);
      setCurrentTime(0);
    };

    const handleError = () => {
      console.error('Erreur chargement audio');
      setIsLoading(false);
    };

    audio.addEventListener('loadedmetadata', handleLoadedMetadata);
    audio.addEventListener('timeupdate', handleTimeUpdate);
    audio.addEventListener('ended', handleEnded);
    audio.addEventListener('error', handleError);

    // Charger les marque-pages sauvegardés
    loadBookmarks();
    checkIfDownloaded();

    return () => {
      audio.removeEventListener('loadedmetadata', handleLoadedMetadata);
      audio.removeEventListener('timeupdate', handleTimeUpdate);
      audio.removeEventListener('ended', handleEnded);
      audio.removeEventListener('error', handleError);
    };
  }, [audioGuide]);

  // Contrôle volume
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = volume;
    }
  }, [volume]);

  // Contrôle vitesse
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.playbackRate = playbackRate;
    }
  }, [playbackRate]);

  const loadBookmarks = () => {
    if (!audioGuide) return;
    const saved = localStorage.getItem(`bookmarks_${audioGuide._id}`);
    if (saved) {
      setBookmarks(JSON.parse(saved));
    }
  };

  const checkIfDownloaded = () => {
    if (!audioGuide) return;
    const downloaded = localStorage.getItem(`downloaded_${audioGuide._id}`);
    setIsDownloaded(!!downloaded);
  };

  const togglePlayPause = async () => {
    if (!audioRef.current) return;

    if (isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
    } else {
      try {
        await audioRef.current.play();
        setIsPlaying(true);
      } catch (error) {
        console.error('Erreur lecture audio:', error);
      }
    }
  };

  const handleSeek = (value: number) => {
    if (!audioRef.current) return;
    audioRef.current.currentTime = value;
    setCurrentTime(value);
  };

  const skipBackward = () => {
    if (!audioRef.current) return;
    audioRef.current.currentTime = Math.max(0, currentTime - 10);
  };

  const skipForward = () => {
    if (!audioRef.current) return;
    audioRef.current.currentTime = Math.min(duration, currentTime + 10);
  };

  const addBookmark = () => {
    if (!audioGuide) return;
    
    const newBookmark: Bookmark = {
      time: currentTime,
      label: `Marque-page ${formatTime(currentTime)}`,
    };

    const updatedBookmarks = [...bookmarks, newBookmark];
    setBookmarks(updatedBookmarks);
    localStorage.setItem(`bookmarks_${audioGuide._id}`, JSON.stringify(updatedBookmarks));
  };

  const goToBookmark = (time: number) => {
    if (!audioRef.current) return;
    audioRef.current.currentTime = time;
    setCurrentTime(time);
    setActiveTab('player');
  };

  const deleteBookmark = (index: number) => {
    if (!audioGuide) return;
    
    const updatedBookmarks = bookmarks.filter((_, i) => i !== index);
    setBookmarks(updatedBookmarks);
    localStorage.setItem(`bookmarks_${audioGuide._id}`, JSON.stringify(updatedBookmarks));
  };

  const downloadAudio = async () => {
    if (!audioGuide) return;
    
    setIsLoading(true);
    try {
      // Simuler téléchargement (à implémenter avec service worker)
      await new Promise(resolve => setTimeout(resolve, 2000));
      localStorage.setItem(`downloaded_${audioGuide._id}`, 'true');
      setIsDownloaded(true);
      console.log('Audio téléchargé pour lecture hors ligne');
    } catch (error) {
      console.error('Erreur téléchargement:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  // Supprimé: getProgressPercent non utilisé
  // const getProgressPercent = (): number => {
  //   return duration > 0 ? (currentTime / duration) * 100 : 0;
  // };

  if (!audioGuide) return null;

  return (
    <IonModal isOpen={isOpen} onDidDismiss={onClose} className="audio-player-modal">
      <IonHeader>
        <IonToolbar>
          <IonTitle>{audioGuide.title}</IonTitle>
          <IonButtons slot="end">
            <IonButton onClick={onClose}>
              <IonIcon icon={close} />
            </IonButton>
          </IonButtons>
        </IonToolbar>

        {/* Tabs */}
        <IonToolbar>
          <IonSegment value={activeTab} onIonChange={(e) => setActiveTab(e.detail.value as 'player' | 'bookmarks')}>
            <IonSegmentButton value="player">
              <IonLabel>Lecteur</IonLabel>
            </IonSegmentButton>
            <IonSegmentButton value="bookmarks">
              <IonLabel>Marque-pages ({bookmarks.length})</IonLabel>
            </IonSegmentButton>
          </IonSegment>
        </IonToolbar>
      </IonHeader>

      <IonContent className="audio-player-content">
        <audio ref={audioRef} preload="metadata" />

        {activeTab === 'player' ? (
          <div className="player-container">
            {/* Artwork / Thumbnail */}
            <div className="artwork-container">
              {audioGuide.thumbnailUrl ? (
                <img src={audioGuide.thumbnailUrl} alt={audioGuide.title} className="artwork" />
              ) : (
                <div className="artwork-placeholder">
                  <IonIcon icon={volumeHigh} size="large" />
                </div>
              )}
            </div>

            {/* Info */}
            <div className="player-info">
              <h2>{audioGuide.title}</h2>
              <p>{audioGuide.description}</p>
              <IonChip color="primary">
                <IonLabel>{audioGuide.language.toUpperCase()}</IonLabel>
              </IonChip>
              {isDownloaded && (
                <IonChip color="success">
                  <IonIcon icon={checkmarkCircle} />
                  <IonLabel>Hors ligne</IonLabel>
                </IonChip>
              )}
            </div>

            {/* Progress bar */}
            <div className="progress-container">
              <IonText className="time-display">
                <span>{formatTime(currentTime)}</span>
                <span>{formatTime(duration)}</span>
              </IonText>
              <IonRange
                value={currentTime}
                min={0}
                max={duration}
                onIonChange={(e) => handleSeek(e.detail.value as number)}
                className="progress-range"
              />
            </div>

            {/* Controls */}
            <div className="player-controls">
              <IonButton fill="clear" onClick={skipBackward}>
                <IonIcon icon={playSkipBack} size="large" />
              </IonButton>

              <IonButton
                className="play-button"
                shape="round"
                size="large"
                onClick={togglePlayPause}
                disabled={isLoading}
              >
                <IonIcon icon={isPlaying ? pause : play} size="large" />
              </IonButton>

              <IonButton fill="clear" onClick={skipForward}>
                <IonIcon icon={playSkipForward} size="large" />
              </IonButton>
            </div>

            {/* Additional controls */}
            <div className="additional-controls">
              {/* Volume */}
              <IonItem>
                <IonIcon icon={volumeHigh} slot="start" />
                <IonRange
                  value={volume}
                  min={0}
                  max={1}
                  step={0.1}
                  onIonChange={(e) => setVolume(e.detail.value as number)}
                />
              </IonItem>

              {/* Playback speed */}
              <IonItem>
                <IonIcon icon={speedometer} slot="start" />
                <IonLabel>Vitesse: {playbackRate}x</IonLabel>
                <IonButtons slot="end">
                  <IonButton onClick={() => setPlaybackRate(0.75)}>0.75x</IonButton>
                  <IonButton onClick={() => setPlaybackRate(1)}>1x</IonButton>
                  <IonButton onClick={() => setPlaybackRate(1.25)}>1.25x</IonButton>
                  <IonButton onClick={() => setPlaybackRate(1.5)}>1.5x</IonButton>
                </IonButtons>
              </IonItem>
            </div>

            {/* Action buttons */}
            <div className="action-buttons">
              <IonButton expand="block" onClick={addBookmark} disabled={!isPlaying}>
                <IonIcon icon={bookmarkIcon} slot="start" />
                Ajouter marque-page
              </IonButton>

              {!isDownloaded && (
                <IonButton expand="block" color="success" onClick={downloadAudio} disabled={isLoading}>
                  <IonIcon icon={downloadOutline} slot="start" />
                  {isLoading ? 'Téléchargement...' : 'Télécharger pour hors ligne'}
                </IonButton>
              )}
            </div>
          </div>
        ) : (
          <div className="bookmarks-container">
            {bookmarks.length === 0 ? (
              <IonCard>
                <IonCardContent className="empty-state">
                  <IonIcon icon={bookmarkIcon} size="large" color="medium" />
                  <p>Aucun marque-page</p>
                  <p className="subtitle">Ajoutez des marque-pages pendant l'écoute</p>
                </IonCardContent>
              </IonCard>
            ) : (
              <IonList>
                {bookmarks.map((bookmark, index) => (
                  <IonItem key={index} button onClick={() => goToBookmark(bookmark.time)}>
                    <IonIcon icon={bookmarkIcon} slot="start" color="primary" />
                    <IonLabel>
                      <h3>{bookmark.label}</h3>
                      <p>{formatTime(bookmark.time)}</p>
                    </IonLabel>
                    <IonButton
                      fill="clear"
                      color="danger"
                      slot="end"
                      onClick={(e) => {
                        e.stopPropagation();
                        deleteBookmark(index);
                      }}
                    >
                      Supprimer
                    </IonButton>
                  </IonItem>
                ))}
              </IonList>
            )}
          </div>
        )}

        {/* Loading indicator */}
        {isLoading && <IonProgressBar type="indeterminate" />}
      </IonContent>
    </IonModal>
  );
};

export default AudioPlayer;
