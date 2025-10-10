import { Request, Response, NextFunction } from 'express';
import admin from '../config/firebaseAdmin';

// Interface pour un utilisateur authentifié avec un rôle
export interface AuthenticatedUser {
  uid: string;
  email?: string;
  role: 'admin' | 'editor' | 'user';
}

// Étendre l'interface Request d'Express pour inclure notre utilisateur typé
declare global {
  namespace Express {
    interface Request {
      user?: AuthenticatedUser;
    }
  }
}

export const firebaseAuthMiddleware = async (req: Request, res: Response, next: NextFunction) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ 
      success: false, 
      message: 'Non autorisé: Token manquant ou mal formé' 
    });
  }

  const idToken = authHeader.split('Bearer ')[1];

  try {
    // Vérifier si Firebase Admin est initialisé
    if (!admin.apps.length) {
      console.warn('⚠️ Firebase not initialized, using development mode');
      // Mode développement : créer un utilisateur fictif admin
      const authenticatedUser: AuthenticatedUser = {
        uid: 'dev-user-' + Math.random().toString(36).substr(2, 9),
        email: 'dev@example.com',
        role: 'admin'
      };
      req.user = authenticatedUser;
      return next();
    }

    // 1. Vérifier le token Firebase
    const decodedToken = await admin.auth().verifyIdToken(idToken);
    
    // 2. Récupérer le profil utilisateur depuis Firestore pour obtenir le rôle
    const userRecord = await admin.firestore().collection('users').doc(decodedToken.uid).get();

    let userRole = 'user'; // Rôle par défaut

    if (userRecord.exists) {
      const userProfile = userRecord.data();
      userRole = userProfile?.role || 'user';
    } else {
      console.warn(`⚠️ User profile not found in Firestore for UID: ${decodedToken.uid}, using default role`);
    }
    
    // 3. Créer un objet utilisateur enrichi avec le rôle
    const authenticatedUser: AuthenticatedUser = {
      uid: decodedToken.uid,
      email: decodedToken.email,
      role: userRole as 'admin' | 'editor' | 'user'
    };

    // 4. Attacher l'utilisateur enrichi à la requête
    req.user = authenticatedUser;
    
    next();
  } catch (error) {
    console.error('Erreur de vérification du token:', error);
    return res.status(403).json({ 
      success: false, 
      message: 'Interdit: Token invalide ou expiré' 
    });
  }
};
