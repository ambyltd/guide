/**
 * Page de réinitialisation du mot de passe
 * Interface moderne pour demander un nouveau mot de passe
 */

import React, { useState, useEffect } from 'react';
import {
  IonContent,
  IonPage,
  IonItem,
  IonLabel,
  IonInput,
  IonButton,
  IonText,
  IonToast,
  IonLoading,
  IonIcon,
  IonGrid,
  IonRow,
  IonCol,
  IonCard,
  IonCardContent,
  IonCardHeader,
  IonCardTitle,
  IonHeader,
  IonToolbar,
  IonButtons,
  IonBackButton,
} from '@ionic/react';
import {
  mailOutline,
  checkmarkCircleOutline,
  arrowBackOutline,
} from 'ionicons/icons';
import { useHistory } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import './ForgotPasswordPage.css';

interface FormData {
  email: string;
}

interface ValidationErrors {
  email?: string;
}

const ForgotPasswordPage: React.FC = () => {
  const history = useHistory();
  const { sendPasswordReset, loading, error, clearError } = useAuth();
  
  const [formData, setFormData] = useState<FormData>({
    email: '',
  });
  const [validationErrors, setValidationErrors] = useState<ValidationErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  // Nettoyer les erreurs au montage
  useEffect(() => {
    clearError();
  }, [clearError]);

  // Validation en temps réel
  const validateField = (field: keyof FormData, value: string): string | undefined => {
    switch (field) {
      case 'email':
        if (!value) return 'L\'email est requis';
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
          return 'Format d\'email invalide';
        }
        return undefined;
      default:
        return undefined;
    }
  };

  const handleInputChange = (field: keyof FormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    
    // Validation en temps réel
    const fieldError = validateField(field, value);
    setValidationErrors(prev => {
      const newErrors = { ...prev };
      if (fieldError) {
        newErrors[field] = fieldError;
      } else {
        delete newErrors[field];
      }
      return newErrors;
    });
  };

  const validateForm = (): boolean => {
    const errors: ValidationErrors = {};
    
    Object.entries(formData).forEach(([key, value]) => {
      const error = validateField(key as keyof FormData, value);
      if (error) {
        errors[key as keyof ValidationErrors] = error;
      }
    });

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      setShowToast(true);
      return;
    }

    setIsSubmitting(true);
    
    try {
      await sendPasswordReset(formData.email);
      setIsSuccess(true);
    } catch (err) {
      console.error('Erreur lors de la réinitialisation:', err);
      setShowToast(true);
    } finally {
      setIsSubmitting(false);
    }
  };

  const navigateToLogin = () => {
    history.push('/login');
  };

  if (isSuccess) {
    return (
      <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonButtons slot="start">
            <IonBackButton defaultHref="/login" />
          </IonButtons>
        </IonToolbar>
      </IonHeader>        <IonContent className="forgot-password-container">
          <div className="forgot-password-content">
            <IonGrid>
              <IonRow className="ion-justify-content-center">
                <IonCol size="12" sizeMd="8" sizeLg="6" sizeXl="4">
                  <IonCard className="success-card">
                    <IonCardHeader>
                      <div className="success-header">
                        <div className="success-icon">
                          <IonIcon 
                            icon={checkmarkCircleOutline} 
                            className="success-icon-svg"
                          />
                        </div>
                        <IonCardTitle className="success-title">
                          Email envoyé !
                        </IonCardTitle>
                        <IonText color="medium" className="success-subtitle">
                          Vérifiez votre boîte de réception
                        </IonText>
                      </div>
                    </IonCardHeader>

                    <IonCardContent>
                      <div className="success-content">
                        <IonText color="medium">
                          <p>
                            Nous avons envoyé un lien de réinitialisation à{' '}
                            <strong>{formData.email}</strong>
                          </p>
                          <p>
                            Cliquez sur le lien dans l'email pour créer un nouveau mot de passe.
                          </p>
                          <p>
                            <small>
                              Si vous ne recevez pas l'email dans les prochaines minutes, 
                              vérifiez votre dossier spam.
                            </small>
                          </p>
                        </IonText>

                        <IonButton
                          expand="block"
                          fill="solid"
                          onClick={navigateToLogin}
                          className="back-to-login-button"
                        >
                          <IonIcon icon={arrowBackOutline} slot="start" />
                          Retour à la connexion
                        </IonButton>
                      </div>
                    </IonCardContent>
                  </IonCard>
                </IonCol>
              </IonRow>
            </IonGrid>
          </div>
        </IonContent>
      </IonPage>
    );
  }

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonButtons slot="start">
            <IonBackButton defaultHref="/login" />
          </IonButtons>
        </IonToolbar>
      </IonHeader>
      
      <IonContent className="forgot-password-container">
        <div className="forgot-password-content">
          <IonGrid>
            <IonRow className="ion-justify-content-center">
              <IonCol size="12" sizeMd="8" sizeLg="6" sizeXl="4">
                <IonCard className="forgot-password-card">
                  <IonCardHeader>
                    <div className="forgot-password-header">
                      <div className="app-logo">
                        <IonIcon 
                          icon={mailOutline} 
                          className="logo-icon"
                        />
                      </div>
                      <IonCardTitle className="forgot-password-title">
                        Réinitialiser votre mot de passe
                      </IonCardTitle>
                      <IonText color="medium" className="forgot-password-subtitle">
                        Entrez votre email pour recevoir un lien de réinitialisation
                      </IonText>
                    </div>
                  </IonCardHeader>

                  <IonCardContent>
                    <form onSubmit={handleSubmit} className="forgot-password-form">
                      {/* Email */}
                      <IonItem 
                        className={`forgot-password-input ${validationErrors.email ? 'ion-invalid' : ''}`}
                      >
                        <IonIcon icon={mailOutline} slot="start" />
                        <IonLabel position="stacked">Email</IonLabel>
                        <IonInput
                          type="email"
                          value={formData.email}
                          onIonInput={(e) => handleInputChange('email', e.detail.value!)}
                          placeholder="votre@email.com"
                          required
                        />
                      </IonItem>
                      {validationErrors.email && (
                        <IonText color="danger" className="error-text">
                          {validationErrors.email}
                        </IonText>
                      )}

                      {/* Bouton de soumission */}
                      <IonButton
                        type="submit"
                        expand="block"
                        fill="solid"
                        disabled={isSubmitting || loading || Object.keys(validationErrors).length > 0}
                        className="reset-button"
                      >
                        {isSubmitting || loading ? 'Envoi en cours...' : 'Envoyer le lien'}
                      </IonButton>

                      {/* Lien retour à la connexion */}
                      <div className="back-to-login">
                        <IonText color="medium">
                          Vous vous souvenez de votre mot de passe ?{' '}
                          <IonButton 
                            fill="clear" 
                            size="small"
                            onClick={navigateToLogin}
                            className="login-link"
                          >
                            Se connecter
                          </IonButton>
                        </IonText>
                      </div>
                    </form>
                  </IonCardContent>
                </IonCard>
              </IonCol>
            </IonRow>
          </IonGrid>
        </div>

        {/* Loading */}
        <IonLoading isOpen={loading || isSubmitting} message="Envoi du lien en cours..." />

        {/* Toast d'erreur */}
        <IonToast
          isOpen={showToast}
          onDidDismiss={() => {
            setShowToast(false);
            clearError();
          }}
          message={error || 'Veuillez corriger les erreurs dans le formulaire'}
          duration={5000}
          color="danger"
          position="top"
          buttons={[
            {
              text: 'Fermer',
              role: 'cancel'
            }
          ]}
        />
      </IonContent>
    </IonPage>
  );
};

export default ForgotPasswordPage;
