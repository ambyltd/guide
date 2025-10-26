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
  compassOutline,
  earthOutline,
  mapOutline,
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
      history.push('/tabs/home', { replace: true });
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
      <IonContent fullscreen className="login-page-content">
        <div className="login-container">
          {/* Background decorative elements */}
          <div className="login-bg-pattern">
            <div className="floating-icon icon-1">
              <IonIcon icon={compassOutline} />
            </div>
            <div className="floating-icon icon-2">
              <IonIcon icon={earthOutline} />
            </div>
            <div className="floating-icon icon-3">
              <IonIcon icon={mapOutline} />
            </div>
          </div>

          <IonGrid className="login-grid">
            <IonRow className="ion-justify-content-center ion-align-items-center">
              <IonCol size="12" sizeMd="10" sizeLg="8" sizeXl="6">
                <div className="login-wrapper">
                  {/* Left side - Branding */}
                  <div className="login-branding">
                    <div className="brand-content">
                      <div className="brand-logo-container">
                        <div className="brand-logo">
                          <IonIcon icon={compassOutline} />
                        </div>
                        <div className="brand-glow"></div>
                      </div>
                      <h1 className="brand-title">Côte d'Ivoire</h1>
                      <h2 className="brand-subtitle">Audio Guide</h2>
                      <p className="brand-description">
                        Découvrez les merveilles de la Côte d'Ivoire à travers des guides audio immersifs
                      </p>
                      <div className="brand-stats">
                        <div className="stat-item">
                          <div className="stat-number">50+</div>
                          <div className="stat-label">Attractions</div>
                        </div>
                        <div className="stat-item">
                          <div className="stat-number">15+</div>
                          <div className="stat-label">Circuits</div>
                        </div>
                        <div className="stat-item">
                          <div className="stat-number">2</div>
                          <div className="stat-label">Langues</div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Right side - Login Form */}
                  <div className="login-form-container">
                    <div className="login-form-inner">
                      <div className="login-header">
                        <h3 className="login-welcome">Bon retour !</h3>
                        <p className="login-subtitle">Connectez-vous pour continuer votre exploration</p>
                      </div>

                      <form onSubmit={handleSubmit} className="login-form">
                        {/* Email */}
                        <div className="input-group">
                          <label className="input-label">Adresse email</label>
                          <div className={`input-wrapper ${validationErrors.email ? 'has-error' : ''}`}>
                            <IonIcon icon={mailOutline} className="input-icon" />
                            <input
                              type="email"
                              value={formData.email}
                              onChange={(e) => handleInputChange('email', e.target.value)}
                              placeholder="votre@email.com"
                              className="custom-input"
                              required
                            />
                          </div>
                          {validationErrors.email && (
                            <span className="error-message">{validationErrors.email}</span>
                          )}
                        </div>

                        {/* Password */}
                        <div className="input-group">
                          <label className="input-label">Mot de passe</label>
                          <div className={`input-wrapper ${validationErrors.password ? 'has-error' : ''}`}>
                            <IonIcon icon={lockClosedOutline} className="input-icon" />
                            <input
                              type={showPassword ? 'text' : 'password'}
                              value={formData.password}
                              onChange={(e) => handleInputChange('password', e.target.value)}
                              placeholder="••••••••"
                              className="custom-input"
                              required
                            />
                            <button
                              type="button"
                              onClick={() => setShowPassword(!showPassword)}
                              className="password-toggle-btn"
                            >
                              <IonIcon icon={showPassword ? eyeOffOutline : eyeOutline} />
                            </button>
                          </div>
                          {validationErrors.password && (
                            <span className="error-message">{validationErrors.password}</span>
                          )}
                        </div>

                        {/* Remember & Forgot */}
                        <div className="form-options">
                          <label className="checkbox-label">
                            <input
                              type="checkbox"
                              checked={rememberMe}
                              onChange={(e) => setRememberMe(e.target.checked)}
                              className="custom-checkbox"
                            />
                            <span>Se souvenir de moi</span>
                          </label>
                          <button
                            type="button"
                            onClick={navigateToForgotPassword}
                            className="forgot-link"
                          >
                            Mot de passe oublié ?
                          </button>
                        </div>

                        {/* Submit Button */}
                        <button
                          type="submit"
                          disabled={isSubmitting || loading}
                          className="submit-btn"
                        >
                          {isSubmitting ? (
                            <>
                              <span className="spinner"></span>
                              Connexion en cours...
                            </>
                          ) : (
                            'Se connecter'
                          )}
                        </button>

                        {/* Divider */}
                        <div className="divider-wrapper">
                          <div className="divider-line"></div>
                          <span className="divider-text">ou continuer avec</span>
                          <div className="divider-line"></div>
                        </div>

                        {/* Google Button */}
                        <button
                          type="button"
                          onClick={handleGoogleSignIn}
                          disabled={isSubmitting || loading}
                          className="google-btn"
                        >
                          <IonIcon icon={logoGoogle} className="google-icon" />
                          Google
                        </button>

                        {/* Register Link */}
                        <div className="register-link">
                          <span>Pas encore de compte ?</span>
                          <button
                            type="button"
                            onClick={navigateToRegister}
                            className="register-btn"
                          >
                            Créer un compte
                          </button>
                        </div>
                      </form>
                    </div>
                  </div>
                </div>
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
