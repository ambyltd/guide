/**
 * Composant de protection des routes
 * Gère l'accès sécurisé aux pages nécessitant une authentification
 */

import React from 'react';
import { Redirect } from 'react-router-dom';
// (pas de changement ici, mais s'assurer que l'import est bien là)
import { IonSpinner, IonContent, IonPage } from '@ionic/react';
import { useAuth } from '../hooks/useAuth';

// ===== INTERFACES =====
interface ProtectedRouteProps {
  children: React.ReactNode;
  requireAuth?: boolean;
  requireVerification?: boolean;
  redirectTo?: string;
  fallback?: React.ReactNode;
}

interface AuthGuardProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

interface GuestOnlyProps {
  children: React.ReactNode;
  redirectTo?: string;
}

// ===== COMPOSANT DE PROTECTION PRINCIPAL =====
export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  children,
  requireAuth = true,
  requireVerification = false,
  redirectTo = '/login',
  fallback = null,
}) => {
  const { user, loading, isAuthenticated } = useAuth();

  // Affichage du loading
  if (loading) {
    return fallback || (
      <IonPage>
        <IonContent className="ion-padding ion-text-center">
          <div style={{ 
            display: 'flex', 
            flexDirection: 'column', 
            alignItems: 'center', 
            justifyContent: 'center', 
            height: '100%',
            gap: '1rem'
          }}>
            <IonSpinner name="crescent" />
            <p>Vérification de l'authentification...</p>
          </div>
        </IonContent>
      </IonPage>
    );
  }

  // Vérification de l'authentification
  if (requireAuth && !isAuthenticated) {
    return <Redirect to={redirectTo} />;
  }

  // Vérification de l'email (si requis)
  if (requireAuth && requireVerification && user && !user.emailVerified) {
    return <Redirect to="/verify-email" />;
  }

  // Si tout est OK, afficher le contenu
  return <>{children}</>;
};

// ===== GARDE D'AUTHENTIFICATION =====
export const AuthGuard: React.FC<AuthGuardProps> = ({ 
  children, 
  fallback 
}) => {
  return (
    <ProtectedRoute requireAuth={true} fallback={fallback}>
      {children}
    </ProtectedRoute>
  );
};

// ===== COMPOSANT POUR INVITÉS SEULEMENT =====
export const GuestOnly: React.FC<GuestOnlyProps> = ({ 
  children, 
  redirectTo = '/tabs/home' 
}) => {
  const { loading, isAuthenticated } = useAuth();

  // Affichage du loading
  if (loading) {
    return (
      <IonPage>
        <IonContent className="ion-padding ion-text-center">
          <div style={{ 
            display: 'flex', 
            flexDirection: 'column', 
            alignItems: 'center', 
            justifyContent: 'center', 
            height: '100%',
            gap: '1rem'
          }}>
            <IonSpinner name="crescent" />
            <p>Chargement...</p>
          </div>
        </IonContent>
      </IonPage>
    );
  }

  // Rediriger si l'utilisateur est connecté
  if (isAuthenticated) {
    return <Redirect to={redirectTo} />;
  }

  // Afficher le contenu pour les invités
  return <>{children}</>;
};

// ===== VÉRIFICATEUR DE STATUT D'AUTHENTIFICATION =====
export const useRequireAuth = (redirectTo: string = '/login') => {
  const { isAuthenticated, loading } = useAuth();

  React.useEffect(() => {
    if (!loading && !isAuthenticated) {
      window.location.href = redirectTo;
    }
  }, [isAuthenticated, loading, redirectTo]);

  return { isAuthenticated, loading };
};

// ===== HOOK POUR VÉRIFIER LES PERMISSIONS =====
export const usePermissions = () => {
  const { user, profile } = useAuth();

  const hasPermission = (permission: string): boolean => {
    // Logique des permissions basée sur le profil utilisateur
    // À étendre selon les besoins spécifiques de l'application
    if (!user || !profile) return false;

    // Permissions de base pour les utilisateurs authentifiés
    const basePermissions = [
      'view_attractions',
      'view_audio_guides',
      'save_favorites',
      'view_profile',
    ];

    // Permissions admin (exemple)
    const adminPermissions = [
      ...basePermissions,
      'manage_content',
      'view_analytics',
      'manage_users',
    ];

    // Logique simple - à adapter selon vos besoins
    if (user.email?.includes('admin')) {
      return adminPermissions.includes(permission);
    }

    return basePermissions.includes(permission);
  };

  const canAccess = (resource: string, action: string = 'view'): boolean => {
    return hasPermission(`${action}_${resource}`);
  };

  return {
    hasPermission,
    canAccess,
    isAdmin: user?.email?.includes('admin') || false,
    isVerified: user?.emailVerified || false,
  };
};

// ===== WRAPPER POUR COMPOSANTS NÉCESSITANT UNE PERMISSION =====
interface RequirePermissionProps {
  permission: string;
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

export const RequirePermission: React.FC<RequirePermissionProps> = ({
  permission,
  children,
  fallback = null,
}) => {
  const { hasPermission } = usePermissions();

  if (!hasPermission(permission)) {
    return <>{fallback}</>;
  }

  return <>{children}</>;
};

// ===== EXPORTS PAR DÉFAUT =====
export default ProtectedRoute;
