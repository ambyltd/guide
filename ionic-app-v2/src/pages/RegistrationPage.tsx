import React, { useState } from 'react';
import {
  IonContent,
  IonHeader,
  IonPage,
  IonToolbar,
  IonItem,
  IonLabel,
  IonInput,
  IonButton,
  IonCard,
  IonCardContent,
  IonCardHeader,
  IonCardTitle,
  IonText,
  IonSpinner,
  IonCheckbox,
  IonSelect,
  IonSelectOption,
  IonBackButton,
  IonButtons,
  IonGrid,
  IonRow,
  IonCol,
  IonAlert
} from '@ionic/react';
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
      <IonHeader>
        <IonToolbar>
          <IonButtons slot="start">
            <IonBackButton defaultHref="/login" />
          </IonButtons>
        </IonToolbar>
      </IonHeader>

      <IonContent fullscreen className="registration-content">
        <IonGrid>
          <IonRow className="ion-justify-content-center">
            <IonCol size="12" sizeMd="8" sizeLg="6">
              
              <IonCard className="registration-card">
                <IonCardHeader>
                  <IonCardTitle className="ion-text-center">
                    Rejoignez Audio Guide Côte d'Ivoire
                  </IonCardTitle>
                </IonCardHeader>

                <IonCardContent>
                  {errors.general && (
                    <IonText color="danger" className="error-text">
                      <p>{errors.general}</p>
                    </IonText>
                  )}

                  {/* Email */}
                  <IonItem className={errors.email ? 'ion-invalid' : ''}>
                    <IonLabel position="stacked">Email *</IonLabel>
                    <IonInput
                      type="email"
                      value={formData.email}
                      onIonInput={(e) => handleInputChange('email', e.detail.value!)}
                      placeholder="votre.email@exemple.com"
                      disabled={loading}
                    />
                  </IonItem>
                  {errors.email && (
                    <IonText color="danger" className="error-text">
                      <small>{errors.email}</small>
                    </IonText>
                  )}

                  {/* Mot de passe */}
                  <IonItem className={errors.password ? 'ion-invalid' : ''}>
                    <IonLabel position="stacked">Mot de passe *</IonLabel>
                    <IonInput
                      type="password"
                      value={formData.password}
                      onIonInput={(e) => handleInputChange('password', e.detail.value!)}
                      placeholder="Minimum 6 caractères"
                      disabled={loading}
                    />
                  </IonItem>
                  {errors.password && (
                    <IonText color="danger" className="error-text">
                      <small>{errors.password}</small>
                    </IonText>
                  )}

                  {/* Confirmation mot de passe */}
                  <IonItem className={errors.confirmPassword ? 'ion-invalid' : ''}>
                    <IonLabel position="stacked">Confirmer le mot de passe *</IonLabel>
                    <IonInput
                      type="password"
                      value={formData.confirmPassword}
                      onIonInput={(e) => handleInputChange('confirmPassword', e.detail.value!)}
                      placeholder="Répétez votre mot de passe"
                      disabled={loading}
                    />
                  </IonItem>
                  {errors.confirmPassword && (
                    <IonText color="danger" className="error-text">
                      <small>{errors.confirmPassword}</small>
                    </IonText>
                  )}

                  {/* Nom d'affichage */}
                  <IonItem className={errors.displayName ? 'ion-invalid' : ''}>
                    <IonLabel position="stacked">Nom d'affichage *</IonLabel>
                    <IonInput
                      type="text"
                      value={formData.displayName}
                      onIonInput={(e) => handleInputChange('displayName', e.detail.value!)}
                      placeholder="Comment vous souhaitez être appelé"
                      disabled={loading}
                    />
                  </IonItem>
                  {errors.displayName && (
                    <IonText color="danger" className="error-text">
                      <small>{errors.displayName}</small>
                    </IonText>
                  )}

                  {/* Prénom */}
                  <IonItem>
                    <IonLabel position="stacked">Prénom</IonLabel>
                    <IonInput
                      type="text"
                      value={formData.firstName}
                      onIonInput={(e) => handleInputChange('firstName', e.detail.value!)}
                      placeholder="Votre prénom"
                      disabled={loading}
                    />
                  </IonItem>

                  {/* Nom */}
                  <IonItem>
                    <IonLabel position="stacked">Nom</IonLabel>
                    <IonInput
                      type="text"
                      value={formData.lastName}
                      onIonInput={(e) => handleInputChange('lastName', e.detail.value!)}
                      placeholder="Votre nom de famille"
                      disabled={loading}
                    />
                  </IonItem>

                  {/* Téléphone */}
                  <IonItem>
                    <IonLabel position="stacked">Numéro de téléphone</IonLabel>
                    <IonInput
                      type="tel"
                      value={formData.phoneNumber}
                      onIonInput={(e) => handleInputChange('phoneNumber', e.detail.value!)}
                      placeholder="+225 XX XX XX XX"
                      disabled={loading}
                    />
                  </IonItem>

                  {/* Nationalité */}
                  <IonItem>
                    <IonLabel position="stacked">Nationalité</IonLabel>
                    <IonInput
                      type="text"
                      value={formData.nationality}
                      onIonInput={(e) => handleInputChange('nationality', e.detail.value!)}
                      placeholder="Votre nationalité"
                      disabled={loading}
                    />
                  </IonItem>

                  {/* Langue */}
                  <IonItem>
                    <IonLabel position="stacked">Langue préférée</IonLabel>
                    <IonSelect
                      value={formData.language}
                      onIonChange={(e) => handleInputChange('language', e.detail.value)}
                      disabled={loading}
                    >
                      <IonSelectOption value="fr">Français</IonSelectOption>
                      <IonSelectOption value="en">English</IonSelectOption>
                    </IonSelect>
                  </IonItem>

                  {/* Conditions d'utilisation */}
                  <IonItem className={errors.acceptTerms ? 'ion-invalid' : ''}>
                    <IonCheckbox
                      checked={formData.acceptTerms}
                      onIonChange={(e) => handleInputChange('acceptTerms', e.detail.checked)}
                      disabled={loading}
                    />
                    <IonLabel className="ion-margin-start">
                      J'accepte les <IonText color="primary">conditions d'utilisation</IonText> et la <IonText color="primary">politique de confidentialité</IonText>
                    </IonLabel>
                  </IonItem>
                  {errors.acceptTerms && (
                    <IonText color="danger" className="error-text">
                      <small>{errors.acceptTerms}</small>
                    </IonText>
                  )}

                  {/* Bouton d'inscription */}
                  <IonButton
                    expand="block"
                    onClick={handleRegister}
                    disabled={loading}
                    className="ion-margin-top"
                  >
                    {loading ? (
                      <>
                        <IonSpinner name="crescent" />
                        <span className="ion-margin-start">Création du compte...</span>
                      </>
                    ) : (
                      'Créer mon compte'
                    )}
                  </IonButton>

                  {/* Lien vers connexion */}
                  <IonText className="ion-text-center ion-margin-top">
                    <p>
                      Vous avez déjà un compte ? 
                      <IonText color="primary" onClick={() => history.push('/login')} style={{ cursor: 'pointer', textDecoration: 'underline' }}>
                        {' '}Se connecter
                      </IonText>
                    </p>
                  </IonText>
                </IonCardContent>
              </IonCard>

            </IonCol>
          </IonRow>
        </IonGrid>

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