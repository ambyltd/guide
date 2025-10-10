import express from 'express';
import { GPSController } from '../controllers/gpsController';
import { firebaseAuthMiddleware } from '../middleware/authMiddleware';

const router = express.Router();

/**
 * Routes GPS et géolocalisation avancées
 */

// Recherche d'attractions proches avec GPS
router.get('/nearby-attractions', GPSController.findNearbyAttractions);

// Détection automatique des guides audio à proximité
router.post('/detect-audio-guides', firebaseAuthMiddleware, GPSController.detectNearbyAudioGuides);

// Suivi de trajet utilisateur avec analyse comportementale
router.post('/track-location', firebaseAuthMiddleware, GPSController.trackUserLocation);

// Optimisation de route avec algorithme avancé
router.post('/optimize-route', firebaseAuthMiddleware, GPSController.optimizeRoute);

// Enregistrement du comportement d'écoute avec données GPS
router.post('/listening-behavior', firebaseAuthMiddleware, GPSController.recordListeningBehavior);

// Obtention d'insights analytics en temps réel
router.get('/insights', GPSController.getRealTimeInsights);

// Obtention d'insights personnalisés (nécessite authentification)
router.get('/insights/personalized', firebaseAuthMiddleware, GPSController.getRealTimeInsights);

export default router;