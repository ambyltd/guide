/**
 * Hook React pour l'authentification Firebase
 * Architecture experte avec gestion d'état optimisée et types stricts
 */

import { useEffect, useState, useCallback } from 'react';
import { User } from 'firebase/auth';
import { 
  authService, 
  type AuthState, 
  type LoginCredentials, 
  type RegisterData, 
  type UserProfile,
  AuthError 
} from '../services/authService';

// ===== INTERFACES =====
export interface UseAuthReturn {
  // État
  user: User | null;
  profile: UserProfile | null;
  loading: boolean;
  error: string | null;
  isAuthenticated: boolean;
  
  // Actions
  signIn: (credentials: LoginCredentials) => Promise<void>;
  signUp: (data: RegisterData) => Promise<void>;
  signInWithGoogle: () => Promise<void>;
  signOut: () => Promise<void>;
  sendPasswordReset: (email: string) => Promise<void>;
  updateProfile: (updates: Partial<UserProfile>) => Promise<void>;
  updatePassword: (currentPassword: string, newPassword: string) => Promise<void>;
  resendEmailVerification: () => Promise<void>;
  clearError: () => void;
}

// ===== HOOK PRINCIPAL =====
export const useAuth = (): UseAuthReturn => {
  const [authState, setAuthState] = useState<AuthState>(() => 
    authService.getCurrentState()
  );
  const [actionLoading, setActionLoading] = useState<boolean>(false);

  // ===== ABONNEMENT AUX CHANGEMENTS D'ÉTAT =====
  useEffect(() => {
    const unsubscribe = authService.onAuthStateChange((state) => {
      setAuthState(state);
    });

    return unsubscribe;
  }, []);

  // ===== ACTIONS AVEC GESTION D'ERREUR =====
  const executeWithErrorHandling = useCallback(
    async (action: () => Promise<void>) => {
      try {
        setActionLoading(true);
        setAuthState(prev => ({ ...prev, error: null }));
        await action();
      } catch (error) {
        const authError = error instanceof AuthError ? error : new AuthError(
          'Une erreur inattendue s\'est produite',
          'unknown-error',
          error as Error
        );
        
        setAuthState(prev => ({ 
          ...prev, 
          error: authError.message 
        }));
        throw authError;
      } finally {
        setActionLoading(false);
      }
    },
    []
  );

  // ===== CONNEXION =====
  const signIn = useCallback(
    async (credentials: LoginCredentials): Promise<void> => {
      await executeWithErrorHandling(async () => {
        await authService.signIn(credentials);
      });
    },
    [executeWithErrorHandling]
  );

  // ===== INSCRIPTION =====
  const signUp = useCallback(
    async (data: RegisterData): Promise<void> => {
      // Validation côté client
      if (data.password !== data.confirmPassword) {
        throw new AuthError(
          'Les mots de passe ne correspondent pas',
          'passwords-do-not-match'
        );
      }

      if (data.password.length < 6) {
        throw new AuthError(
          'Le mot de passe doit contenir au moins 6 caractères',
          'weak-password'
        );
      }

      if (!data.displayName.trim()) {
        throw new AuthError(
          'Le nom d\'affichage est requis',
          'display-name-required'
        );
      }

      await executeWithErrorHandling(async () => {
        await authService.signUp(data);
      });
    },
    [executeWithErrorHandling]
  );

  // ===== CONNEXION GOOGLE =====
  const signInWithGoogle = useCallback(
    async (): Promise<void> => {
      await executeWithErrorHandling(async () => {
        await authService.signInWithGoogle();
      });
    },
    [executeWithErrorHandling]
  );

  // ===== DÉCONNEXION =====
  const signOut = useCallback(
    async (): Promise<void> => {
      await executeWithErrorHandling(async () => {
        await authService.signOut();
      });
    },
    [executeWithErrorHandling]
  );

  // ===== RÉINITIALISATION DU MOT DE PASSE =====
  const sendPasswordReset = useCallback(
    async (email: string): Promise<void> => {
      if (!email.trim()) {
        throw new AuthError(
          'L\'adresse email est requise',
          'email-required'
        );
      }

      await executeWithErrorHandling(async () => {
        await authService.sendPasswordReset(email);
      });
    },
    [executeWithErrorHandling]
  );

  // ===== MISE À JOUR DU PROFIL =====
  const updateProfile = useCallback(
    async (updates: Partial<UserProfile>): Promise<void> => {
      await executeWithErrorHandling(async () => {
        await authService.updateUserProfile(updates);
      });
    },
    [executeWithErrorHandling]
  );

  // ===== MISE À JOUR DU MOT DE PASSE =====
  const updatePassword = useCallback(
    async (currentPassword: string, newPassword: string): Promise<void> => {
      if (!currentPassword.trim()) {
        throw new AuthError(
          'Le mot de passe actuel est requis',
          'current-password-required'
        );
      }

      if (newPassword.length < 6) {
        throw new AuthError(
          'Le nouveau mot de passe doit contenir au moins 6 caractères',
          'weak-password'
        );
      }

      await executeWithErrorHandling(async () => {
        await authService.updateUserPassword(currentPassword, newPassword);
      });
    },
    [executeWithErrorHandling]
  );

  // ===== RENVOI DE L'EMAIL DE VÉRIFICATION =====
  const resendEmailVerification = useCallback(
    async (): Promise<void> => {
      await executeWithErrorHandling(async () => {
        await authService.resendEmailVerification();
      });
    },
    [executeWithErrorHandling]
  );

  // ===== EFFACER L'ERREUR =====
  const clearError = useCallback(() => {
    setAuthState(prev => ({ ...prev, error: null }));
  }, []);

  // ===== RETOUR =====
  return {
    // État
    user: authState.user,
    profile: authState.profile,
    loading: authState.loading || actionLoading,
    error: authState.error,
    isAuthenticated: !!authState.user,
    
    // Actions
    signIn,
    signUp,
    signInWithGoogle,
    signOut,
    sendPasswordReset,
    updateProfile,
    updatePassword,
    resendEmailVerification,
    clearError,
  };
};

// ===== HOOK POUR VÉRIFIER LE STATUT D'AUTHENTIFICATION =====
export const useAuthStatus = () => {
  const { user, loading } = useAuth();
  
  return {
    isAuthenticated: !!user,
    isLoading: loading,
    user,
  };
};

// ===== HOOK POUR LE PROFIL UTILISATEUR =====
export const useUserProfile = () => {
  const { profile, updateProfile, loading, error } = useAuth();
  
  return {
    profile,
    updateProfile,
    loading,
    error,
  };
};

export default useAuth;