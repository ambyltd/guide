/**
 * Service d'authentification Firebase
 * Architecture experte avec gestion d'erreurs, types stricts et sécurité
 */

import {
  User,
  UserCredential,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  updateProfile,
  sendPasswordResetEmail,
  sendEmailVerification,
  updatePassword,
  reauthenticateWithCredential,
  EmailAuthProvider,
  GoogleAuthProvider,
  signInWithPopup,
  type Unsubscribe,
} from 'firebase/auth';
import { doc, setDoc, getDoc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { auth, firestore } from '../config/firebase';

// Vérification de la disponibilité de Firestore
const isFirestoreAvailable = (): boolean => {
  return firestore !== null;
};

// ===== INTERFACES =====
export interface UserProfile {
  uid: string;
  email: string;
  displayName: string | null;
  photoURL: string | null;
  emailVerified: boolean;
  createdAt: Date;
  lastLoginAt: Date;
  preferences: UserPreferences;
}

export interface UserPreferences {
  language: 'fr' | 'en';
  theme: 'light' | 'dark' | 'auto';
  notifications: boolean;
  autoplay: boolean;
  audioQuality: 'low' | 'medium' | 'high';
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData extends LoginCredentials {
  displayName: string;
  confirmPassword: string;
}

export interface AuthState {
  user: User | null;
  profile: UserProfile | null;
  loading: boolean;
  error: string | null;
}

// ===== ERREURS PERSONNALISÉES =====
export class AuthError extends Error {
  constructor(
    message: string,
    public code: string,
    public originalError?: Error
  ) {
    super(message);
    this.name = 'AuthError';
  }
}

// ===== SERVICE D'AUTHENTIFICATION =====
class AuthService {
  private static instance: AuthService;
  private authStateListeners: Set<(state: AuthState) => void> = new Set();
  private currentState: AuthState = {
    user: null,
    profile: null,
    loading: true,
    error: null,
  };

  constructor() {
    this.initializeAuthStateListener();
  }

  static getInstance(): AuthService {
    if (!AuthService.instance) {
      AuthService.instance = new AuthService();
    }
    return AuthService.instance;
  }

  // ===== GESTION DES ÉTATS =====
  private initializeAuthStateListener(): void {
    onAuthStateChanged(
      auth,
      async (user) => {
        this.currentState.loading = true;
        this.notifyListeners();

        try {
          if (user) {
            // Récupérer et sauvegarder le token Firebase à chaque changement d'état
            const token = await user.getIdToken();
            localStorage.setItem('authToken', token);
            console.log('✅ Token Firebase actualisé dans localStorage');

            const profile = await this.loadUserProfile(user);
            this.currentState = {
              user,
              profile,
              loading: false,
              error: null,
            };
          } else {
            // Supprimer le token si déconnecté
            localStorage.removeItem('authToken');
            console.log('🗑️ Token Firebase supprimé de localStorage');

            this.currentState = {
              user: null,
              profile: null,
              loading: false,
              error: null,
            };
          }
        } catch (error) {
          this.currentState = {
            user: null,
            profile: null,
            loading: false,
            error: this.formatError(error).message,
          };
        }

        this.notifyListeners();
      },
      (error) => {
        this.currentState = {
          user: null,
          profile: null,
          loading: false,
          error: this.formatError(error).message,
        };
        this.notifyListeners();
      }
    );
  }

  private notifyListeners(): void {
    this.authStateListeners.forEach(listener => {
      try {
        listener({ ...this.currentState });
      } catch (error) {
        console.error('Erreur dans le listener d\'authentification:', error);
      }
    });
  }

  // ===== ABONNEMENT AUX CHANGEMENTS D'ÉTAT =====
  onAuthStateChange(callback: (state: AuthState) => void): Unsubscribe {
    this.authStateListeners.add(callback);
    // Notifier immédiatement avec l'état actuel
    callback({ ...this.currentState });

    return () => {
      this.authStateListeners.delete(callback);
    };
  }

  // ===== AUTHENTIFICATION =====
  async signIn({ email, password }: LoginCredentials): Promise<UserProfile> {
    try {
      this.currentState.loading = true;
      this.notifyListeners();

      // Logs de débogage
      console.log('🔐 Tentative de connexion pour:', email);
      console.log('🔥 Firebase Config Check:', {
        apiKey: import.meta.env.VITE_FIREBASE_API_KEY ? 'Défini' : 'Manquant',
        authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN ? 'Défini' : 'Manquant',
        projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID ? 'Défini' : 'Manquant',
      });

      const userCredential: UserCredential = await signInWithEmailAndPassword(
        auth,
        email,
        password
      );

      console.log('✅ Connexion Firebase réussie:', userCredential.user.uid);

      // Récupérer et sauvegarder le token Firebase
      const token = await userCredential.user.getIdToken();
      localStorage.setItem('authToken', token);
      console.log('✅ Token Firebase sauvegardé dans localStorage');

      await this.updateLastLogin(userCredential.user.uid);
      const profile = await this.loadUserProfile(userCredential.user);

      console.log('✅ Profil utilisateur chargé:', profile.displayName);

      return profile;
    } catch (error) {
      const errorObj = error as { code?: string; message?: string };
      console.error('❌ Erreur de connexion détaillée:', {
        error,
        code: errorObj?.code,
        message: errorObj?.message,
        email: email
      });
      throw this.formatError(error);
    }
  }

  async signUp({ email, password, displayName }: RegisterData): Promise<UserProfile> {
    try {
      this.currentState.loading = true;
      this.notifyListeners();

      const userCredential: UserCredential = await createUserWithEmailAndPassword(
        auth,
        email,
        password
      );

      // Mise à jour du profil
      await updateProfile(userCredential.user, { displayName });

      // Création du profil utilisateur dans Firestore
      const profile = await this.createUserProfile(userCredential.user, {
        language: 'fr',
        theme: 'auto',
        notifications: true,
        autoplay: false,
        audioQuality: 'medium',
      });

      // Envoi de l'email de vérification
      await sendEmailVerification(userCredential.user);

      return profile;
    } catch (error) {
      throw this.formatError(error);
    }
  }

  async signInWithGoogle(): Promise<UserProfile> {
    try {
      this.currentState.loading = true;
      this.notifyListeners();

      const provider = new GoogleAuthProvider();
      provider.addScope('profile');
      provider.addScope('email');

      const userCredential = await signInWithPopup(auth, provider);

      // Récupérer et sauvegarder le token Firebase
      const token = await userCredential.user.getIdToken();
      localStorage.setItem('authToken', token);
      console.log('✅ Token Firebase sauvegardé dans localStorage (Google)');
      
      // Créer ou mettre à jour le profil
      let profile: UserProfile;
      const existingProfile = await this.getUserProfile(userCredential.user.uid);
      
      if (existingProfile) {
        await this.updateLastLogin(userCredential.user.uid);
        profile = await this.loadUserProfile(userCredential.user);
      } else {
        profile = await this.createUserProfile(userCredential.user, {
          language: 'fr',
          theme: 'auto',
          notifications: true,
          autoplay: false,
          audioQuality: 'medium',
        });
      }

      return profile;
    } catch (error) {
      throw this.formatError(error);
    }
  }

  async signOut(): Promise<void> {
    try {
      await signOut(auth);
    } catch (error) {
      throw this.formatError(error);
    }
  }

  // ===== GESTION DU PROFIL =====
  private async createUserProfile(
    user: User,
    preferences: UserPreferences
  ): Promise<UserProfile> {
    const profile: UserProfile = {
      uid: user.uid,
      email: user.email!,
      displayName: user.displayName,
      photoURL: user.photoURL,
      emailVerified: user.emailVerified,
      createdAt: new Date(),
      lastLoginAt: new Date(),
      preferences,
    };

    // Vérifier si Firestore est disponible avant de l'utiliser
    if (!isFirestoreAvailable()) {
      console.warn('⚠️ Firestore non disponible, impossible de sauvegarder le profil utilisateur');
      return profile;
    }

    const userRef = doc(firestore!, 'users', user.uid);
    await setDoc(userRef, {
      ...profile,
      createdAt: serverTimestamp(),
      lastLoginAt: serverTimestamp(),
    });

    return profile;
  }

  private async loadUserProfile(user: User): Promise<UserProfile> {
    // Vérifier si Firestore est disponible
    if (!isFirestoreAvailable()) {
      console.warn('⚠️ Firestore non disponible, création d\'un profil temporaire');
      return {
        uid: user.uid,
        email: user.email!,
        displayName: user.displayName,
        photoURL: user.photoURL,
        emailVerified: user.emailVerified,
        createdAt: new Date(),
        lastLoginAt: new Date(),
        preferences: {
          language: 'fr',
          theme: 'auto',
          notifications: true,
          autoplay: false,
          audioQuality: 'medium',
        },
      };
    }

    const userRef = doc(firestore!, 'users', user.uid);
    const userDoc = await getDoc(userRef);

    if (!userDoc.exists()) {
      // Créer le profil s'il n'existe pas
      return this.createUserProfile(user, {
        language: 'fr',
        theme: 'auto',
        notifications: true,
        autoplay: false,
        audioQuality: 'medium',
      });
    }

    const data = userDoc.data();
    return {
      uid: user.uid,
      email: user.email!,
      displayName: user.displayName,
      photoURL: user.photoURL,
      emailVerified: user.emailVerified,
      createdAt: data.createdAt?.toDate() || new Date(),
      lastLoginAt: data.lastLoginAt?.toDate() || new Date(),
      preferences: data.preferences || {
        language: 'fr',
        theme: 'auto',
        notifications: true,
        autoplay: false,
        audioQuality: 'medium',
      },
    };
  }

  private async getUserProfile(uid: string): Promise<UserProfile | null> {
    try {
      // Vérifier si Firestore est disponible
      if (!isFirestoreAvailable()) {
        console.warn('⚠️ Firestore non disponible, impossible de récupérer le profil utilisateur');
        return null;
      }

      const userRef = doc(firestore!, 'users', uid);
      const userDoc = await getDoc(userRef);
      
      if (!userDoc.exists()) {
        return null;
      }

      const data = userDoc.data();
      
      // Convertir les timestamps Firestore en Date
      const createdAt = data.createdAt?.toDate ? data.createdAt.toDate() : 
                       data.createdAt instanceof Date ? data.createdAt : 
                       new Date(data.createdAt || Date.now());
      
      const lastLoginAt = data.lastLoginAt?.toDate ? data.lastLoginAt.toDate() : 
                         data.lastLoginAt instanceof Date ? data.lastLoginAt : 
                         new Date(data.lastLoginAt || Date.now());
      
      return {
        uid,
        email: data.email,
        displayName: data.displayName,
        photoURL: data.photoURL,
        emailVerified: data.emailVerified,
        createdAt,
        lastLoginAt,
        preferences: data.preferences,
      };
    } catch (error) {
      console.error('Erreur lors du chargement du profil:', error);
      return null;
    }
  }

  async updateUserProfile(updates: Partial<UserProfile>): Promise<void> {
    const user = auth.currentUser;
    if (!user) throw new AuthError('Utilisateur non connecté', 'user-not-authenticated');

    try {
      // Mise à jour dans Firebase Auth
      if (updates.displayName !== undefined || updates.photoURL !== undefined) {
        await updateProfile(user, {
          displayName: updates.displayName ?? user.displayName,
          photoURL: updates.photoURL ?? user.photoURL,
        });
      }

      // Mise à jour dans Firestore
      if (isFirestoreAvailable()) {
        const userRef = doc(firestore!, 'users', user.uid);
        const updateData: Record<string, unknown> = {};

        if (updates.displayName !== undefined) updateData.displayName = updates.displayName;
        if (updates.photoURL !== undefined) updateData.photoURL = updates.photoURL;
        if (updates.preferences) updateData.preferences = updates.preferences;

        if (Object.keys(updateData).length > 0) {
          await updateDoc(userRef, updateData);
        }
      } else {
        console.warn('⚠️ Firestore non disponible, impossible de sauvegarder les modifications du profil');
      }
    } catch (error) {
      throw this.formatError(error);
    }
  }

  private async updateLastLogin(uid: string): Promise<void> {
    try {
      // Vérifier si Firestore est disponible
      if (!isFirestoreAvailable()) {
        console.warn('⚠️ Firestore non disponible, impossible de mettre à jour la dernière connexion');
        return;
      }

      const userRef = doc(firestore!, 'users', uid);
      await updateDoc(userRef, {
        lastLoginAt: serverTimestamp(),
      });
    } catch (error) {
      console.error('Erreur lors de la mise à jour de la dernière connexion:', error);
    }
  }

  // ===== UTILITAIRES =====
  async sendPasswordReset(email: string): Promise<void> {
    try {
      await sendPasswordResetEmail(auth, email);
    } catch (error) {
      throw this.formatError(error);
    }
  }

  async updateUserPassword(currentPassword: string, newPassword: string): Promise<void> {
    const user = auth.currentUser;
    if (!user || !user.email) {
      throw new AuthError('Utilisateur non connecté', 'user-not-authenticated');
    }

    try {
      // Ré-authentification requise
      const credential = EmailAuthProvider.credential(user.email, currentPassword);
      await reauthenticateWithCredential(user, credential);

      // Mise à jour du mot de passe
      await updatePassword(user, newPassword);
    } catch (error) {
      throw this.formatError(error);
    }
  }

  async resendEmailVerification(): Promise<void> {
    const user = auth.currentUser;
    if (!user) throw new AuthError('Utilisateur non connecté', 'user-not-authenticated');

    try {
      await sendEmailVerification(user);
    } catch (error) {
      throw this.formatError(error);
    }
  }

  // ===== GETTERS =====
  getCurrentUser(): User | null {
    return auth.currentUser;
  }

  getCurrentState(): AuthState {
    return { ...this.currentState };
  }

  isAuthenticated(): boolean {
    return !!auth.currentUser;
  }

  // ===== ENREGISTREMENT BACKEND =====
  async registerUserInBackend(userData: {
    firebaseUid: string;
    email: string;
    displayName: string;
    firstName?: string;
    lastName?: string;
    phoneNumber?: string;
    nationality?: string;
    language?: 'fr' | 'en';
  }): Promise<{ success: boolean; message?: string; data?: unknown }> {
    try {
      const { apiClient } = await import('./apiClient');
      const response = await apiClient.post('/auth/register', userData);
      
      // Sauvegarder le token dans le localStorage
      if (response.success && response.data && typeof response.data === 'object' && 'token' in response.data) {
        localStorage.setItem('authToken', (response.data as { token: string }).token);
      }
      
      return response;
    } catch (error) {
      console.error('Erreur lors de l\'enregistrement backend:', error);
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Erreur lors de l\'enregistrement'
      };
    }
  }

  // ===== FORMATAGE DES ERREURS =====
  private formatError(error: unknown): AuthError {
    const errorMessages: Record<string, string> = {
      'auth/user-not-found': 'Aucun compte trouvé avec cette adresse email',
      'auth/wrong-password': 'Mot de passe incorrect',
      'auth/invalid-credential': 'Email ou mot de passe incorrect. Veuillez vérifier vos identifiants.',
      'auth/email-already-in-use': 'Cette adresse email est déjà utilisée',
      'auth/weak-password': 'Le mot de passe doit contenir au moins 6 caractères',
      'auth/invalid-email': 'Adresse email invalide',
      'auth/user-disabled': 'Ce compte a été désactivé',
      'auth/too-many-requests': 'Trop de tentatives. Réessayez plus tard',
      'auth/network-request-failed': 'Erreur de connexion réseau',
      'auth/requires-recent-login': 'Une authentification récente est requise',
      'auth/popup-closed-by-user': 'Connexion annulée par l\'utilisateur',
      'auth/popup-blocked': 'Popup bloquée par le navigateur',
    };

    const errorObj = error as { code?: string; message?: string };
    const code = errorObj?.code || 'unknown-error';
    const message = errorMessages[code] || errorObj?.message || 'Une erreur inattendue s\'est produite';

    return new AuthError(message, code, error as Error);
  }
}

// ===== INSTANCE SINGLETON =====
export const authService = AuthService.getInstance();
export default authService;