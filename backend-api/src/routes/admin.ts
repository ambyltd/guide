import { Router } from 'express';
import {
  getFeatures,
  getFeatureById,
  getFeatureByKey,
  createFeature,
  toggleFeature,
  updateFeature,
  deleteFeature,
  getFeaturesByCategory,
  getConfig,
  updateConfig,
  getAdminStats,
} from '../controllers/adminController';

const router = Router();

/**
 * ============================================
 * 🔧 ROUTES ADMIN - Sprint 5
 * ============================================
 * Routes pour l'administration via le CMS web
 * ============================================
 */

// ============================================
// FEATURE FLAGS ROUTES
// ============================================

// GET /api/admin/features - Liste tous les feature flags
router.get('/features', getFeatures);

// GET /api/admin/features/categories - Statistiques par catégorie
router.get('/features/categories', getFeaturesByCategory);

// GET /api/admin/features/:id - Récupère un feature par ID
router.get('/features/:id', getFeatureById);

// GET /api/admin/features/key/:key - Récupère un feature par clé
router.get('/features/key/:key', getFeatureByKey);

// POST /api/admin/features - Crée un nouveau feature flag
router.post('/features', createFeature);

// PATCH /api/admin/features/:id/toggle - Toggle l'état d'un feature
router.patch('/features/:id/toggle', toggleFeature);

// PUT /api/admin/features/:id - Met à jour un feature flag
router.put('/features/:id', updateFeature);

// DELETE /api/admin/features/:id - Supprime un feature flag
router.delete('/features/:id', deleteFeature);

// ============================================
// CONFIGURATION ROUTES
// ============================================

// GET /api/admin/config - Récupère la configuration globale
router.get('/config', getConfig);

// PATCH /api/admin/config - Met à jour la configuration
router.patch('/config', updateConfig);

// ============================================
// STATS ROUTES
// ============================================

// GET /api/admin/stats - Statistiques d'administration
router.get('/stats', getAdminStats);

export default router;
