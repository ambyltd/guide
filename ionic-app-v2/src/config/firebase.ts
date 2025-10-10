/**
 * Configuration Firebase Web SDK pour l'application Ionic
 * Architecture experte avec gestion d'erreurs et types stricts
 */

import { initializeApp, type FirebaseApp } from 'firebase/app';
import { getAuth, type Auth } from 'firebase/auth';
import { getFirestore, type Firestore } from 'firebase/firestore';
import { getStorage, type FirebaseStorage } from 'firebase/storage';
import { getAnalytics, type Analytics } from 'firebase/analytics';

// ===== INTERFACE DE CONFIGURATION =====
interface FirebaseConfig {
  readonly apiKey: string;
  readonly authDomain: string;
  readonly projectId: string;
  readonly storageBucket: string;
  readonly messagingSenderId: string;
  readonly appId: string;
  readonly measurementId?: string;
}

// ===== CONFIGURATION FIREBASE =====
const firebaseConfig: FirebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || '',
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || '',
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || '',
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || '',
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || '',
  appId: import.meta.env.VITE_FIREBASE_APP_ID || '',
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID,
};

// ===== VALIDATION DE LA CONFIGURATION =====
const validateFirebaseConfig = (config: FirebaseConfig): void => {
  const requiredFields: (keyof FirebaseConfig)[] = [
    'apiKey',
    'authDomain',
    'projectId',
    'storageBucket',
    'messagingSenderId',
    'appId',
  ];

  const missingFields = requiredFields.filter(
    field => !config[field] || config[field].trim() === ''
  );

  if (missingFields.length > 0) {
    throw new Error(
      `Configuration Firebase incomplète. Champs manquants: ${missingFields.join(', ')}`
    );
  }
};

// ===== INITIALISATION =====
let app: FirebaseApp;
let auth: Auth;
let firestore: Firestore | null = null;
let storage: FirebaseStorage | null = null;
let analytics: Analytics | null = null;

try {
  // Validation de la configuration
  validateFirebaseConfig(firebaseConfig);

  // Initialisation de l'application Firebase
  app = initializeApp(firebaseConfig);

  // Initialisation des services
  auth = getAuth(app);
  
  // Initialisation de Firestore avec gestion d'erreur
  try {
    firestore = getFirestore(app);
    console.log('✅ Firestore initialisé avec succès');
  } catch (firestoreError) {
    console.warn('⚠️ Firestore non disponible:', firestoreError);
    console.warn('Vérifiez que Firestore est activé dans la console Firebase');
  }
  
  // Initialisation de Storage avec gestion d'erreur
  try {
    storage = getStorage(app);
    console.log('✅ Storage initialisé avec succès');
  } catch (storageError) {
    console.warn('⚠️ Storage non disponible:', storageError);
    console.warn('Vérifiez que Storage est activé dans la console Firebase');
  }

  // Analytics seulement en production et avec le consentement
  if (import.meta.env.PROD && firebaseConfig.measurementId) {
    try {
      analytics = getAnalytics(app);
    } catch (error) {
      console.warn('Firebase Analytics non disponible:', error);
    }
  }

  console.log('✅ Firebase initialisé avec succès');
} catch (error) {
  console.error('❌ Erreur lors de l\'initialisation de Firebase:', error);
  throw error;
}

// ===== EXPORTS =====
export { app, auth, firestore, storage, analytics };

export default {
  app,
  auth,
  firestore,
  storage,
  analytics,
};

// ===== UTILITAIRES =====
export const isFirebaseConfigured = (): boolean => {
  try {
    validateFirebaseConfig(firebaseConfig);
    return true;
  } catch {
    return false;
  }
};

export const getFirebaseApp = (): FirebaseApp => app;
export const getFirebaseAuth = (): Auth => auth;
export const getFirebaseFirestore = (): Firestore | null => firestore;
export const getFirebaseStorage = (): FirebaseStorage | null => storage;
export const getFirebaseAnalytics = (): Analytics | null => analytics;