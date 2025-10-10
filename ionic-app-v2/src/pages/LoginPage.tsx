/**
 * Page de connexion
 * Interface moderne et responsive avec validation en temps réel
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
  IonCheckbox,
  IonGrid,
  IonRow,
  IonCol,
  IonCard,
  IonCardContent,
  IonCardHeader,
  IonCardTitle,
} from '@ionic/react';
import {
  lockClosedOutline,
  mailOutline,
  eyeOutline,
  eyeOffOutline,
  logoGoogle,
  personAddOutline,
  bugOutline,
} from 'ionicons/icons';
import { useHistory } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import type { LoginCredentials } from '../services/authService';
import './LoginPage.css';

const LoginPage: React.FC = () => {
  const history = useHistory();
  const { signIn, signInWithGoogle, loading, error, isAuthenticated, clearError } = useAuth();

  // ===== ÉTAT LOCAL =====
  const [formData, setFormData] = useState<LoginCredentials>({
    email: '',
    password: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const [validationErrors, setValidationErrors] = useState<{
    email?: string;
    password?: string;
  }>({});

  // ===== REDIRECTION SI CONNECTÉ =====
  useEffect(() => {
    if (isAuthenticated) {
      history.replace('/home');
    }
  }, [isAuthenticated, history]);

  // ===== AFFICHAGE DES ERREURS =====
  useEffect(() => {
    if (error) {
      setShowToast(true);
    }
  }, [error]);

  // ===== VALIDATION =====
  const validateField = (field: keyof LoginCredentials, value: string): string | undefined => {
    switch (field) {
      case 'email':
        if (!value.trim()) return 'L\'adresse email est requise';
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
          return 'Adresse email invalide';
        }
        return undefined;
      case 'password':
        if (!value.trim()) return 'Le mot de passe est requis';
        if (value.length < 6) return 'Le mot de passe doit contenir au moins 6 caractères';
        return undefined;
      default:
        return undefined;
    }
  };

  const validateForm = (): boolean => {
    const errors: typeof validationErrors = {};
    
    Object.keys(formData).forEach((key) => {
      const field = key as keyof LoginCredentials;
      const error = validateField(field, formData[field]);
      if (error) errors[field] = error;
    });

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // ===== GESTION DES ÉVÉNEMENTS =====
  const handleInputChange = (field: keyof LoginCredentials, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    
    // Validation en temps réel
    const error = validateField(field, value);
    setValidationErrors(prev => ({
      ...prev,
      [field]: error,
    }));
    
    // Effacer l'erreur globale
    if (error) clearError();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    try {
      setIsSubmitting(true);
      await signIn(formData);
      // La redirection se fait automatiquement via useEffect
    } catch (error) {
      console.error('Erreur de connexion:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleGoogleSignIn = async () => {
    try {
      setIsSubmitting(true);
      await signInWithGoogle();
    } catch (error) {
      console.error('Erreur de connexion Google:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const navigateToRegister = () => {
    history.push('/register');
  };

  const navigateToForgotPassword = () => {
    history.push('/forgot-password');
  };

  // ===== RENDU =====
  return (
    <IonPage>
      <IonContent fullscreen>
        <div className="login-container">
          <IonGrid>
            <IonRow className="ion-justify-content-center">
              <IonCol size="12" sizeMd="8" sizeLg="6" sizeXl="4">
                <IonCard className="login-card">
                  <IonCardHeader>
                    <div className="login-header">
                      <div className="app-logo">
                        <IonIcon 
                          icon={mailOutline} 
                          className="logo-icon"
                        />
                      </div>
                      <IonCardTitle className="login-title">
                        Côte d'Ivoire Audio Guide
                      </IonCardTitle>
                      <IonText color="medium" className="login-subtitle">
                        Connectez-vous pour découvrir les merveilles de la Côte d'Ivoire
                      </IonText>
                    </div>
                  </IonCardHeader>

                  <IonCardContent>
                    <form onSubmit={handleSubmit} className="login-form">
                      {/* Email */}
                      <IonItem 
                        className={`login-input ${validationErrors.email ? 'ion-invalid' : ''}`}
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

                      {/* Mot de passe */}
                      <IonItem 
                        className={`login-input ${validationErrors.password ? 'ion-invalid' : ''}`}
                      >
                        <IonIcon icon={lockClosedOutline} slot="start" />
                        <IonLabel position="stacked">Mot de passe</IonLabel>
                        <IonInput
                          type={showPassword ? 'text' : 'password'}
                          value={formData.password}
                          onIonInput={(e) => handleInputChange('password', e.detail.value!)}
                          placeholder="••••••••"
                          required
                        />
                        <IonButton
                          fill="clear"
                          slot="end"
                          onClick={() => setShowPassword(!showPassword)}
                          className="password-toggle"
                        >
                          <IonIcon icon={showPassword ? eyeOffOutline : eyeOutline} />
                        </IonButton>
                      </IonItem>
                      {validationErrors.password && (
                        <IonText color="danger" className="error-text">
                          {validationErrors.password}
                        </IonText>
                      )}

                      {/* Options */}
                      <div className="login-options">
                        <IonItem lines="none">
                          <IonCheckbox
                            checked={rememberMe}
                            onIonChange={(e) => setRememberMe(e.detail.checked)}
                          />
                          <IonLabel className="ion-margin-start">
                            Se souvenir de moi
                          </IonLabel>
                        </IonItem>

                        <IonButton 
                          fill="clear" 
                          size="small"
                          onClick={navigateToForgotPassword}
                          className="forgot-password-link"
                        >
                          Mot de passe oublié ?
                        </IonButton>
                      </div>

                      {/* Bouton de connexion */}
                      <IonButton
                        expand="block"
                        type="submit"
                        disabled={isSubmitting || loading}
                        className="login-button"
                      >
                        {isSubmitting ? 'Connexion...' : 'Se connecter'}
                      </IonButton>

                      {/* Divider */}
                      <div className="divider">
                        <span>ou</span>
                      </div>

                      {/* Connexion Google */}
                      <IonButton
                        expand="block"
                        fill="outline"
                        onClick={handleGoogleSignIn}
                        disabled={isSubmitting || loading}
                        className="google-button"
                      >
                        <IonIcon icon={logoGoogle} slot="start" />
                        Continuer avec Google
                      </IonButton>

                      {/* Lien vers l'inscription */}
                      <div className="register-link">
                        <IonText color="medium">
                          Pas encore de compte ?{' '}
                          <IonButton 
                            fill="clear" 
                            size="small"
                            onClick={navigateToRegister}
                            className="register-button"
                          >
                            <IonIcon icon={personAddOutline} slot="start" />
                            S'inscrire
                          </IonButton>
                        </IonText>
                      </div>

                      {/* Lien vers le diagnostic (pour le débogage) */}
                      <div className="diagnostic-link">
                        <IonText color="medium">
                          Problème de connexion ?{' '}
                          <IonButton 
                            fill="clear" 
                            size="small"
                            routerLink="/diagnostic"
                            className="diagnostic-button"
                          >
                            <IonIcon icon={bugOutline} slot="start" />
                            Diagnostic
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
        <IonLoading isOpen={loading} message="Connexion en cours..." />

        {/* Toast d'erreur */}
        <IonToast
          isOpen={showToast}
          onDidDismiss={() => {
            setShowToast(false);
            clearError();
          }}
          message={error || ''}
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

export default LoginPage;