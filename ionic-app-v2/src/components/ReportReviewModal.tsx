/**
 * Modal de signalement de review
 * Sprint 4 - Phase 2
 */

import React, { useState } from 'react';
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
  IonRadioGroup,
  IonRadio,
  IonTextarea,
  IonText,
  IonIcon,
} from '@ionic/react';
import { closeOutline } from 'ionicons/icons';
import { moderationService, type ReportReason } from '../services/moderationService';
import './ReportReviewModal.css';

interface ReportReviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  reviewId: string;
  userId: string;
  onReported?: (reportCount: number, flagged: boolean) => void;
}

const ReportReviewModal: React.FC<ReportReviewModalProps> = ({
  isOpen,
  onClose,
  reviewId,
  userId,
  onReported,
}) => {
  const [selectedReason, setSelectedReason] = useState<string>('');
  const [additionalInfo, setAdditionalInfo] = useState<string>('');
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [error, setError] = useState<string>('');

  const reasons: ReportReason[] = moderationService.getReportReasons();

  const handleSubmit = async () => {
    if (!selectedReason) {
      setError('Veuillez sélectionner une raison');
      return;
    }

    setSubmitting(true);
    setError('');

    try {
      const result = await moderationService.reportReview(reviewId, userId, selectedReason);
      
      // Appeler callback avec résultats
      if (onReported) {
        onReported(result.reportCount, result.flagged);
      }

      // Fermer modal
      handleClose();
    } catch (err: any) {
      console.error('Erreur signalement:', err);
      setError(err.message || 'Une erreur est survenue');
    } finally {
      setSubmitting(false);
    }
  };

  const handleClose = () => {
    setSelectedReason('');
    setAdditionalInfo('');
    setError('');
    onClose();
  };

  return (
    <IonModal isOpen={isOpen} onDidDismiss={handleClose} className="report-review-modal">
      <IonHeader>
        <IonToolbar>
          <IonTitle>Signaler cet avis</IonTitle>
          <IonButtons slot="end">
            <IonButton onClick={handleClose}>
              <IonIcon icon={closeOutline} />
            </IonButton>
          </IonButtons>
        </IonToolbar>
      </IonHeader>

      <IonContent className="ion-padding">
        <div className="modal-description">
          <p>
            Aidez-nous à maintenir la qualité des avis en signalant tout contenu inapproprié.
            Votre signalement sera examiné par notre équipe de modération.
          </p>
        </div>

        <IonList className="reason-list">
          <IonRadioGroup value={selectedReason} onIonChange={(e) => setSelectedReason(e.detail.value)}>
            {reasons.map((reason) => (
              <IonItem key={reason.id} className="reason-item">
                <div className="reason-content">
                  <div className="reason-icon">{reason.icon}</div>
                  <div className="reason-text">
                    <IonLabel>
                      <h3>{reason.label}</h3>
                      <p>{reason.description}</p>
                    </IonLabel>
                  </div>
                </div>
                <IonRadio slot="end" value={reason.id} />
              </IonItem>
            ))}
          </IonRadioGroup>
        </IonList>

        {selectedReason === 'other' && (
          <div className="additional-info">
            <IonLabel>
              <h3>Informations complémentaires</h3>
            </IonLabel>
            <IonTextarea
              placeholder="Décrivez le problème..."
              value={additionalInfo}
              onIonInput={(e) => setAdditionalInfo(e.detail.value || '')}
              rows={4}
              className="additional-textarea"
            />
          </div>
        )}

        {error && (
          <div className="error-message">
            <IonText color="danger">
              <p>{error}</p>
            </IonText>
          </div>
        )}

        <div className="modal-actions">
          <IonButton expand="block" onClick={handleClose} fill="outline" disabled={submitting}>
            Annuler
          </IonButton>
          <IonButton
            expand="block"
            onClick={handleSubmit}
            disabled={!selectedReason || submitting}
            color="danger"
          >
            {submitting ? 'Envoi en cours...' : 'Signaler'}
          </IonButton>
        </div>

        <div className="modal-footer">
          <IonText color="medium">
            <p>
              <small>
                Les signalements abusifs peuvent entraîner des sanctions. 
                Merci de signaler uniquement les contenus qui enfreignent nos règles.
              </small>
            </p>
          </IonText>
        </div>
      </IonContent>
    </IonModal>
  );
};

export default ReportReviewModal;
