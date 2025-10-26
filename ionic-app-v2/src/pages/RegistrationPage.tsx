import React, { useState } from 'react';
import {
  IonContent,
  IonPage,
  IonText,
  IonSpinner,
  IonCheckbox,
  IonIcon,
  IonAlert
} from '@ionic/react';
import {
  mailOutline,
  lockClosedOutline,
  personOutline,
  callOutline,
  globeOutline,
  languageOutline,
  arrowBackOutline,
  checkmarkCircleOutline,
  shieldCheckmarkOutline
} from 'ionicons/icons';
import { createUserWithEmailAndPassword, updateProfile } from 'firebase/auth';
import { auth } from '../config/firebase';
import { useHistory } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { setUser } from '../store/slices/authSlice';
import { authService } from '../services/authService';
import { User, SupportedLanguage, AudioQuality, FontSize, SubscriptionTier } from '../types';
import './RegistrationPage.css';

interface RegistrationFormData {
  email: string;
  password: string;
  confirmPassword: string;
  displayName: string;
  firstName: string;
  lastName: string;
  phoneNumber: string;
  nationality: string;
  language: 'fr' | 'en';
  acceptTerms: boolean;
}

const RegistrationPage: React.FC = () => {
  const history = useHistory();
  const dispatch = useDispatch();
  
  const [formData, setFormData] = useState<RegistrationFormData>({
    email: '',
    password: '',
    confirmPassword: '',
    displayName: '',
    firstName: '',
    lastName: '',
    phoneNumber: '',
    nationality: '',
    language: 'fr',
    acceptTerms: false
  });

  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [showSuccessAlert, setShowSuccessAlert] = useState(false);

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.email.trim()) {
      newErrors.email = 'L\'email est requis';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Format d\'email invalide';
    }

    if (!formData.password) {
      newErrors.password = 'Le mot de passe est requis';
    } else if (formData.password.length < 6) {
      newErrors.password = 'Le mot de passe doit contenir au moins 6 caractères';
    }

    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Les mots de passe ne correspondent pas';
    }

    if (!formData.displayName.trim()) {
      newErrors.displayName = 'Le nom d\'affichage est requis';
    }

    if (!formData.acceptTerms) {
      newErrors.acceptTerms = 'Vous devez accepter les conditions d\'utilisation';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleRegister = async () => {
    if (!validateForm()) {
      return;
    }

    setLoading(true);
    
    try {
      // 1. Créer l'utilisateur dans Firebase
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        formData.email,
        formData.password
      );

      // 2. Mettre à jour le profil Firebase
      await updateProfile(userCredential.user, {
        displayName: formData.displayName
      });

      // 3. Enregistrer l'utilisateur dans notre backend
      const backendUserData = {
        firebaseUid: userCredential.user.uid,
        email: formData.email,
        displayName: formData.displayName,
        firstName: formData.firstName,
        lastName: formData.lastName,
        phoneNumber: formData.phoneNumber,
        nationality: formData.nationality,
        language: formData.language
      };

      const response = await authService.registerUserInBackend(backendUserData);

      if (response.success) {
        // 4. Mettre à jour le store Redux
        const user = createUserFromFirebase(userCredential.user, formData);
        dispatch(setUser(user));

        // 5. Afficher le succès et rediriger
        setShowSuccessAlert(true);
      } else {
        throw new Error(response.message || 'Erreur lors de l\'enregistrement');
      }

    } catch (error: unknown) {
      console.error('Erreur lors de l\'inscription:', error);
      
      let errorMessage = 'Une erreur est survenue lors de l\'inscription';
      
      if (error && typeof error === 'object' && 'code' in error) {
        const firebaseError = error as { code: string; message?: string };
        if (firebaseError.code === 'auth/email-already-in-use') {
          errorMessage = 'Cet email est déjà utilisé';
        } else if (firebaseError.code === 'auth/weak-password') {
          errorMessage = 'Le mot de passe est trop faible';
        } else if (firebaseError.code === 'auth/invalid-email') {
          errorMessage = 'L\'email n\'est pas valide';
        } else if (firebaseError.message) {
          errorMessage = firebaseError.message;
        }
      } else if (error instanceof Error) {
        errorMessage = error.message;
      }

      setErrors({ general: errorMessage });
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field: keyof RegistrationFormData, value: string | boolean) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    
    // Effacer l'erreur pour ce champ
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: ''
      }));
    }
  };

  const handleSuccessRedirect = () => {
    setShowSuccessAlert(false);
    history.push('/tabs/home');
  };

  // Fonction utilitaire pour mapper les données Firebase vers notre interface User
  const createUserFromFirebase = (firebaseUser: { uid: string; email: string | null; photoURL: string | null }, formData: RegistrationFormData): User => {
    const user: User = {
      id: firebaseUser.uid,
      email: firebaseUser.email || '',
      name: formData.displayName,
      preferences: {
        language: formData.language === 'fr' ? SupportedLanguage.FRENCH : SupportedLanguage.ENGLISH,
        audioQuality: AudioQuality.MEDIUM,
        downloadOverWifiOnly: true,
        notifications: {
          nearbyAttractions: true,
          tourReminders: true,
          newContent: true,
          systemUpdates: false,
        },
        accessibility: {
          fontSize: FontSize.MEDIUM,
          highContrast: false,
          screenReader: false,
          autoplayAudio: true,
        },
      },
      subscription: SubscriptionTier.FREE,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    
    // Ajouter profileImage seulement s'il existe
    if (firebaseUser.photoURL) {
      (user as { profileImage?: string }).profileImage = firebaseUser.photoURL;
    }
    
    return user;
  };

  return (
    <IonPage>
      <IonContent fullscreen className="registration-page">
        {/* Background Animation */}
        <div className="background-animation">
          <div className="animated-circle circle-1"></div>
          <div className="animated-circle circle-2"></div>
          <div className="animated-circle circle-3"></div>
          <div className="animated-grid"></div>
        </div>

        {/* Header avec bouton retour */}
        <div className="registration-header">
          <button 
            onClick={() => history.push('/login')} 
            className="back-btn"
            title="Retour à la page de connexion"
            aria-label="Retour à la page de connexion"
          >
            <IonIcon icon={arrowBackOutline} />
          </button>
          <h1 className="page-title">Créer un compte</h1>
          <div className="subtitle">Rejoignez l'aventure Audio Guide</div>
        </div>

        <div className="registration-container">
          <div className="registration-form">
            
            {/* Erreur générale */}
            {errors.general && (
              <div className="error-banner">
                <IonText color="danger">{errors.general}</IonText>
              </div>
            )}

            {/* Formulaire Multi-étapes */}
            <div className="form-steps">
              
              {/* Section Compte */}
              <div className="form-section">
                <div className="section-header">
                  <IonIcon icon={shieldCheckmarkOutline} className="section-icon" />
                  <h2>Informations de connexion</h2>
                </div>

                {/* Email */}
                <div className="input-group">
                  <IonIcon icon={mailOutline} className="input-icon" />
                  <div className="input-wrapper">
                    <input
                      type="email"
                      value={formData.email}
                      onChange={(e) => handleInputChange('email', e.target.value)}
                      placeholder="votre.email@exemple.com"
                      disabled={loading}
                      className={errors.email ? 'error' : ''}
                    />
                    <label className="floating-label">Email *</label>
                  </div>
                </div>
                {errors.email && (
                  <div className="error-message">
                    <small>{errors.email}</small>
                  </div>
                )}

                {/* Mot de passe */}
                <div className="input-group">
                  <IonIcon icon={lockClosedOutline} className="input-icon" />
                  <div className="input-wrapper">
                    <input
                      type="password"
                      value={formData.password}
                      onChange={(e) => handleInputChange('password', e.target.value)}
                      placeholder="Minimum 6 caractères"
                      disabled={loading}
                      className={errors.password ? 'error' : ''}
                    />
                    <label className="floating-label">Mot de passe *</label>
                  </div>
                </div>
                {errors.password && (
                  <div className="error-message">
                    <small>{errors.password}</small>
                  </div>
                )}

                {/* Confirmation mot de passe */}
                <div className="input-group">
                  <IonIcon icon={lockClosedOutline} className="input-icon" />
                  <div className="input-wrapper">
                    <input
                      type="password"
                      value={formData.confirmPassword}
                      onChange={(e) => handleInputChange('confirmPassword', e.target.value)}
                      placeholder="Répétez votre mot de passe"
                      disabled={loading}
                      className={errors.confirmPassword ? 'error' : ''}
                    />
                    <label className="floating-label">Confirmer le mot de passe *</label>
                  </div>
                </div>
                {errors.confirmPassword && (
                  <div className="error-message">
                    <small>{errors.confirmPassword}</small>
                  </div>
                )}
              </div>

              {/* Section Profil */}
              <div className="form-section">
                <div className="section-header">
                  <IonIcon icon={personOutline} className="section-icon" />
                  <h2>Informations personnelles</h2>
                </div>

                {/* Nom d'affichage */}
                <div className="input-group">
                  <IonIcon icon={personOutline} className="input-icon" />
                  <div className="input-wrapper">
                    <input
                      type="text"
                      value={formData.displayName}
                      onChange={(e) => handleInputChange('displayName', e.target.value)}
                      placeholder="Comment vous souhaitez être appelé"
                      disabled={loading}
                      className={errors.displayName ? 'error' : ''}
                    />
                    <label className="floating-label">Nom d'affichage *</label>
                  </div>
                </div>
                {errors.displayName && (
                  <div className="error-message">
                    <small>{errors.displayName}</small>
                  </div>
                )}

                {/* Prénom et Nom (Grid 2 colonnes) */}
                <div className="input-grid">
                  <div className="input-group">
                    <IonIcon icon={personOutline} className="input-icon" />
                    <div className="input-wrapper">
                      <input
                        type="text"
                        value={formData.firstName}
                        onChange={(e) => handleInputChange('firstName', e.target.value)}
                        placeholder="Votre prénom"
                        disabled={loading}
                      />
                      <label className="floating-label">Prénom</label>
                    </div>
                  </div>

                  <div className="input-group">
                    <IonIcon icon={personOutline} className="input-icon" />
                    <div className="input-wrapper">
                      <input
                        type="text"
                        value={formData.lastName}
                        onChange={(e) => handleInputChange('lastName', e.target.value)}
                        placeholder="Votre nom de famille"
                        disabled={loading}
                      />
                      <label className="floating-label">Nom</label>
                    </div>
                  </div>
                </div>

                {/* Téléphone */}
                <div className="input-group">
                  <IonIcon icon={callOutline} className="input-icon" />
                  <div className="input-wrapper">
                    <input
                      type="tel"
                      value={formData.phoneNumber}
                      onChange={(e) => handleInputChange('phoneNumber', e.target.value)}
                      placeholder="+225 XX XX XX XX"
                      disabled={loading}
                    />
                    <label className="floating-label">Téléphone</label>
                  </div>
                </div>

                {/* Nationalité et Langue (Grid 2 colonnes) */}
                <div className="input-grid">
                  <div className="input-group">
                    <IonIcon icon={globeOutline} className="input-icon" />
                    <div className="input-wrapper">
                      <input
                        type="text"
                        value={formData.nationality}
                        onChange={(e) => handleInputChange('nationality', e.target.value)}
                        placeholder="Votre nationalité"
                        disabled={loading}
                      />
                      <label className="floating-label">Nationalité</label>
                    </div>
                  </div>

                  <div className="input-group">
                    <IonIcon icon={languageOutline} className="input-icon" />
                    <div className="input-wrapper">
                      <select
                        value={formData.language}
                        onChange={(e) => handleInputChange('language', e.target.value)}
                        disabled={loading}
                        className="language-select"
                        title="Sélectionner votre langue préférée"
                        aria-label="Langue préférée"
                      >
                        <option value="fr">Français 🇫🇷</option>
                        <option value="en">English 🇬🇧</option>
                      </select>
                      <label className="floating-label">Langue</label>
                    </div>
                  </div>
                </div>
              </div>

              {/* Conditions d'utilisation */}
              <div className="terms-section">
                <div className="checkbox-wrapper">
                  <IonCheckbox
                    checked={formData.acceptTerms}
                    onIonChange={(e) => handleInputChange('acceptTerms', e.detail.checked)}
                    disabled={loading}
                    className={errors.acceptTerms ? 'error' : ''}
                  />
                  <label onClick={() => handleInputChange('acceptTerms', !formData.acceptTerms)}>
                    J'accepte les <span className="link">conditions d'utilisation</span> et la <span className="link">politique de confidentialité</span>
                  </label>
                </div>
                {errors.acceptTerms && (
                  <div className="error-message">
                    <small>{errors.acceptTerms}</small>
                  </div>
                )}
              </div>

              {/* Bouton d'inscription */}
              <button
                onClick={handleRegister}
                disabled={loading}
                className="register-btn"
              >
                {loading ? (
                  <>
                    <IonSpinner name="crescent" />
                    <span>Création du compte...</span>
                  </>
                ) : (
                  <>
                    <IonIcon icon={checkmarkCircleOutline} />
                    <span>Créer mon compte</span>
                  </>
                )}
              </button>

              {/* Lien vers connexion */}
              <div className="login-link">
                <p>
                  Vous avez déjà un compte ?{' '}
                  <span onClick={() => history.push('/login')} className="link">
                    Se connecter
                  </span>
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Alert de succès */}
        <IonAlert
          isOpen={showSuccessAlert}
          onDidDismiss={() => setShowSuccessAlert(false)}
          header="Compte créé avec succès !"
          message="Votre compte a été créé avec succès. Vous allez être redirigé vers l'application."
          buttons={[
            {
              text: 'Continuer',
              handler: handleSuccessRedirect
            }
          ]}
        />
      </IonContent>
    </IonPage>
  );
};

export default RegistrationPage;
