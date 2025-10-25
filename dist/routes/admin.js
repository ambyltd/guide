"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const adminController_1 = require("../controllers/adminController");
const router = (0, express_1.Router)();
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
router.get('/features', adminController_1.getFeatures);
// GET /api/admin/features/categories - Statistiques par catégorie
router.get('/features/categories', adminController_1.getFeaturesByCategory);
// GET /api/admin/features/:id - Récupère un feature par ID
router.get('/features/:id', adminController_1.getFeatureById);
// GET /api/admin/features/key/:key - Récupère un feature par clé
router.get('/features/key/:key', adminController_1.getFeatureByKey);
// POST /api/admin/features - Crée un nouveau feature flag
router.post('/features', adminController_1.createFeature);
// PATCH /api/admin/features/:id/toggle - Toggle l'état d'un feature
router.patch('/features/:id/toggle', adminController_1.toggleFeature);
// PUT /api/admin/features/:id - Met à jour un feature flag
router.put('/features/:id', adminController_1.updateFeature);
// DELETE /api/admin/features/:id - Supprime un feature flag
router.delete('/features/:id', adminController_1.deleteFeature);
// ============================================
// CONFIGURATION ROUTES
// ============================================
// GET /api/admin/config - Récupère la configuration globale
router.get('/config', adminController_1.getConfig);
// PATCH /api/admin/config - Met à jour la configuration
router.patch('/config', adminController_1.updateConfig);
// ============================================
// STATS ROUTES
// ============================================
// GET /api/admin/stats - Statistiques d'administration
router.get('/stats', adminController_1.getAdminStats);
exports.default = router;
