"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const gpsController_1 = require("../controllers/gpsController");
const authMiddleware_1 = require("../middleware/authMiddleware");
const router = express_1.default.Router();
/**
 * Routes GPS et géolocalisation avancées
 */
// Recherche d'attractions proches avec GPS
router.get('/nearby-attractions', gpsController_1.GPSController.findNearbyAttractions);
// Détection automatique des guides audio à proximité
router.post('/detect-audio-guides', authMiddleware_1.firebaseAuthMiddleware, gpsController_1.GPSController.detectNearbyAudioGuides);
// Suivi de trajet utilisateur avec analyse comportementale
router.post('/track-location', authMiddleware_1.firebaseAuthMiddleware, gpsController_1.GPSController.trackUserLocation);
// Optimisation de route avec algorithme avancé
router.post('/optimize-route', authMiddleware_1.firebaseAuthMiddleware, gpsController_1.GPSController.optimizeRoute);
// Enregistrement du comportement d'écoute avec données GPS
router.post('/listening-behavior', authMiddleware_1.firebaseAuthMiddleware, gpsController_1.GPSController.recordListeningBehavior);
// Obtention d'insights analytics en temps réel
router.get('/insights', gpsController_1.GPSController.getRealTimeInsights);
// Obtention d'insights personnalisés (nécessite authentification)
router.get('/insights/personalized', authMiddleware_1.firebaseAuthMiddleware, gpsController_1.GPSController.getRealTimeInsights);
exports.default = router;
