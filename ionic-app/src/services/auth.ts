/**
 * Service d'authentification expert avec Firebase Web SDK
 * Architecture robuste avec gestion d'erreurs, types stricts et sécurité
 */

import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut as firebaseSignOut,
  onAuthStateChanged,
  updateProfile,
  sendPasswordResetEmail,
  sendEmailVerification,
  updatePassword,
  reauthenticateWithCredential,
  EmailAuthProvider,
  type User as FirebaseUser,
  type UserCredential,
  type Unsubscribe,
} from 'firebase/auth';
import { doc, setDoc, getDoc } from 'firebase/firestore';
import { auth, firestore } from '@/config/firebase';
import type { User, UserPreferences, SubscriptionTier, SupportedLanguage, AudioQuality, FontSize } from '@/types';

// ===== INTERFACES =====
interface SignInCredentials {
  readonly email: string;
  readonly password: string;
}

interface SignUpData extends SignInCredentials {
  readonly name: string;
  readonly acceptsTerms: boolean;
}

interface UpdateProfileData {
  readonly name?: string;
  readonly profileImage?: string;
}

interface PasswordChangeData {
  readonly currentPassword: string;
  readonly newPassword: string;
}

interface AuthError extends Error {
  readonly code: string;
  readonly customMessage: string;
}

// ===== GESTION D'ERREURS =====
const createAuthError = (error: Error | { code?: string; message?: string }): AuthError => {
  const errorMessages: Record<string, string> = {
    'auth/email-already-in-use': 'Cette adresse email est déjà utilisée.',
    'auth/weak-password': 'Le mot de passe doit contenir au moins 6 caractères.',
    'auth/invalid-email': 'Adresse email invalide.',
    'auth/user-disabled': 'Ce compte a été désactivé.',
    'auth/user-not-found': 'Aucun compte trouvé avec cette adresse email.',
    'auth/wrong-password': 'Mot de passe incorrect.',
    'auth/too-many-requests': 'Trop de tentatives. Veuillez réessayer plus tard.',
    'auth/network-request-failed': 'Erreur de connexion. Vérifiez votre connexion internet.',
    'auth/requires-recent-login': 'Cette action nécessite une authentification récente.',
    'auth/invalid-credential': 'Identifiants invalides.',
  };

  const code = 'code' in error && error.code ? error.code : 'unknown-error';
  const customMessage = errorMessages[code] || 'Une erreur inattendue s\'est produite.';

  return Object.assign(new Error(customMessage), {
    code,
    customMessage,
    name: 'AuthError',
  }) as AuthError;
};

// ===== UTILITAIRES =====
const createDefaultPreferences = (): UserPreferences => ({
  language: 'fr' as SupportedLanguage,
  audioQuality: 'medium' as AudioQuality,
  downloadOverWifiOnly: true,
  notifications: {
    nearbyAttractions: true,
    tourReminders: true,
    newContent: true,
    systemUpdates: false,
  },
  accessibility: {
    fontSize: 'medium' as FontSize,
    highContrast: false,
    screenReader: false,
    autoplayAudio: false,
  },
});

const mapFirebaseUserToUser = async (firebaseUser: FirebaseUser): Promise<User> => {
  // Vérifier si Firestore est disponible
  let userData: Record<string, unknown> | undefined = undefined;
  if (firestore) {
    try {
      const userDoc = await getDoc(doc(firestore, 'users', firebaseUser.uid));
      userData = userDoc.data();
    } catch (error) {
      console.warn('⚠️ Erreur lors de la récupération des données utilisateur:', error);
    }
  }

  return {
    id: firebaseUser.uid,
    email: firebaseUser.email!,
    name: firebaseUser.displayName || (userData?.name as string) || '',
    profileImage: firebaseUser.photoURL || (userData?.profileImage as string) || '',
    preferences: (userData?.preferences as UserPreferences) || createDefaultPreferences(),
    subscription: (userData?.subscription as SubscriptionTier) || 'free',
    createdAt: (userData?.createdAt as { toDate?: () => Date })?.toDate?.() || new Date(),
    updatedAt: (userData?.updatedAt as { toDate?: () => Date })?.toDate?.() || new Date(),
  };
};

const saveUserToFirestore = async (
  userId: string,
  userData: Partial<User>
): Promise<void> => {
  // Vérifier si Firestore est disponible
  if (!firestore) {
    console.warn('⚠️ Firestore non disponible, impossible de sauvegarder les données utilisateur');
    return;
  }

  const userRef = doc(firestore, 'users', userId);
  await setDoc(userRef, {
    ...userData,
    updatedAt: new Date(),
  }, { merge: true });
};

// ===== VALIDATEURS =====
const validateEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

const validatePassword = (password: string): { isValid: boolean; errors: string[] } => {
  const errors: string[] = [];

  if (password.length < 8) {
    errors.push('Le mot de passe doit contenir au moins 8 caractères');
  }
  if (!/[A-Z]/.test(password)) {
    errors.push('Le mot de passe doit contenir au moins une majuscule');
  }
  if (!/[a-z]/.test(password)) {
    errors.push('Le mot de passe doit contenir au moins une minuscule');
  }
  if (!/\d/.test(password)) {
    errors.push('Le mot de passe doit contenir au moins un chiffre');
  }
  if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
    errors.push('Le mot de passe doit contenir au moins un caractère spécial');
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
};

// ===== SERVICE D'AUTHENTIFICATION =====
class AuthService {
  private currentUser: User | null = null;
  private authStateChangeListeners: Set<(user: User | null) => void> = new Set();

  constructor() {
    this.initializeAuthStateListener();
  }

  // ===== GESTION D'ÉTAT =====
  private initializeAuthStateListener(): Unsubscribe {
    return onAuthStateChanged(auth, async (firebaseUser) => {
      try {
        if (firebaseUser) {
          this.currentUser = await mapFirebaseUserToUser(firebaseUser);
        } else {
          this.currentUser = null;
        }
        this.notifyAuthStateChange();
      } catch (error) {
        console.error('Erreur lors de la mise à jour de l\'état d\'authentification:', error);
        this.currentUser = null;
        this.notifyAuthStateChange();
      }
    });
  }

  private notifyAuthStateChange(): void {
    this.authStateChangeListeners.forEach(listener => {
      try {
        listener(this.currentUser);
      } catch (error) {
        console.error('Erreur dans le listener d\'état d\'authentification:', error);
      }
    });
  }

  // ===== MÉTHODES PUBLIQUES =====
  public onAuthStateChange(callback: (user: User | null) => void): () => void {
    this.authStateChangeListeners.add(callback);
    
    // Appel immédiat avec l'état actuel
    callback(this.currentUser);

    // Retourne une fonction de nettoyage
    return () => {
      this.authStateChangeListeners.delete(callback);
    };
  }

  public getCurrentUser(): User | null {
    return this.currentUser;
  }

  public isAuthenticated(): boolean {
    return this.currentUser !== null;
  }

  // ===== AUTHENTIFICATION =====
  public async signIn(credentials: SignInCredentials): Promise<User> {
    try {
      if (!validateEmail(credentials.email)) {
        throw new Error('Adresse email invalide');
      }

      const userCredential: UserCredential = await signInWithEmailAndPassword(
        auth,
        credentials.email,
        credentials.password
      );

      const user = await mapFirebaseUserToUser(userCredential.user);
      return user;
    } catch (error: unknown) {
      throw createAuthError(error as Error);
    }
  }

  public async signUp(signUpData: SignUpData): Promise<User> {
    try {
      if (!signUpData.acceptsTerms) {
        throw new Error('Vous devez accepter les conditions d\'utilisation');
      }

      if (!validateEmail(signUpData.email)) {
        throw new Error('Adresse email invalide');
      }

      const passwordValidation = validatePassword(signUpData.password);
      if (!passwordValidation.isValid) {
        throw new Error(passwordValidation.errors.join('. '));
      }

      const userCredential: UserCredential = await createUserWithEmailAndPassword(
        auth,
        signUpData.email,
        signUpData.password
      );

      // Mise à jour du profil Firebase
      await updateProfile(userCredential.user, {
        displayName: signUpData.name,
      });

      // Création du document utilisateur dans Firestore
      const userData: Partial<User> = {
        name: signUpData.name,
        email: signUpData.email,
        preferences: createDefaultPreferences(),
        subscription: 'free' as SubscriptionTier,
        createdAt: new Date(),
      };

      await saveUserToFirestore(userCredential.user.uid, userData);

      // Envoi de l'email de vérification
      await sendEmailVerification(userCredential.user);

      const user = await mapFirebaseUserToUser(userCredential.user);
      return user;
    } catch (error: unknown) {
      throw createAuthError(error as Error);
    }
  }

  public async signOut(): Promise<void> {
    try {
      await firebaseSignOut(auth);
    } catch (error: unknown) {
      throw createAuthError(error as Error);
    }
  }

  // ===== GESTION DU PROFIL =====
  public async updateProfile(profileData: UpdateProfileData): Promise<User> {
    try {
      const currentFirebaseUser = auth.currentUser;
      if (!currentFirebaseUser) {
        throw new Error('Utilisateur non authentifié');
      }

      // Mise à jour du profil Firebase
      const firebaseUpdates: Record<string, string> = {};
      if (profileData.name) firebaseUpdates.displayName = profileData.name;
      if (profileData.profileImage) firebaseUpdates.photoURL = profileData.profileImage;

      if (Object.keys(firebaseUpdates).length > 0) {
        await updateProfile(currentFirebaseUser, firebaseUpdates);
      }

      // Mise à jour dans Firestore
      await saveUserToFirestore(currentFirebaseUser.uid, profileData);

      // Retour de l'utilisateur mis à jour
      const updatedUser = await mapFirebaseUserToUser(currentFirebaseUser);
      this.currentUser = updatedUser;
      this.notifyAuthStateChange();

      return updatedUser;
    } catch (error: unknown) {
      throw createAuthError(error as Error);
    }
  }

  public async updateUserPreferences(preferences: Partial<UserPreferences>): Promise<User> {
    try {
      const currentFirebaseUser = auth.currentUser;
      if (!currentFirebaseUser || !this.currentUser) {
        throw new Error('Utilisateur non authentifié');
      }

      const updatedPreferences = {
        ...this.currentUser.preferences,
        ...preferences,
      };

      await saveUserToFirestore(currentFirebaseUser.uid, {
        preferences: updatedPreferences,
      });

      const updatedUser = await mapFirebaseUserToUser(currentFirebaseUser);
      this.currentUser = updatedUser;
      this.notifyAuthStateChange();

      return updatedUser;
    } catch (error: unknown) {
      throw createAuthError(error as Error);
    }
  }

  // ===== GESTION DU MOT DE PASSE =====
  public async resetPassword(email: string): Promise<void> {
    try {
      if (!validateEmail(email)) {
        throw new Error('Adresse email invalide');
      }

      await sendPasswordResetEmail(auth, email);
    } catch (error: unknown) {
      throw createAuthError(error as Error);
    }
  }

  public async changePassword(passwordData: PasswordChangeData): Promise<void> {
    try {
      const currentFirebaseUser = auth.currentUser;
      if (!currentFirebaseUser) {
        throw new Error('Utilisateur non authentifié');
      }

      const passwordValidation = validatePassword(passwordData.newPassword);
      if (!passwordValidation.isValid) {
        throw new Error(passwordValidation.errors.join('. '));
      }

      // Ré-authentification requise pour le changement de mot de passe
      const credential = EmailAuthProvider.credential(
        currentFirebaseUser.email!,
        passwordData.currentPassword
      );

      await reauthenticateWithCredential(currentFirebaseUser, credential);
      await updatePassword(currentFirebaseUser, passwordData.newPassword);
    } catch (error: unknown) {
      throw createAuthError(error as Error);
    }
  }

  public async sendEmailVerification(): Promise<void> {
    try {
      const currentFirebaseUser = auth.currentUser;
      if (!currentFirebaseUser) {
        throw new Error('Utilisateur non authentifié');
      }

      await sendEmailVerification(currentFirebaseUser);
    } catch (error: unknown) {
      throw createAuthError(error as Error);
    }
  }
}

// ===== INSTANCE SINGLETON =====
export const authService = new AuthService();

// ===== EXPORTS =====
export default authService;
export type { SignInCredentials, SignUpData, UpdateProfileData, PasswordChangeData, AuthError };
