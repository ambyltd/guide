"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const reviewController_1 = require("../controllers/reviewController");
const authMiddleware_1 = require("../middleware/authMiddleware");
const requireAdmin_1 = require("../middleware/requireAdmin");
const router = express_1.default.Router();
// ========== ROUTES MOBILE APP (PUBLIQUES POUR LES TESTS) ==========
// POST /api/reviews - Créer une review (version simplifiée sans auth pour tests)
router.post('/', reviewController_1.createReviewSimple);
// GET /api/reviews - Récupérer les reviews (filtrable par attractionId, userId, status)
router.get('/', reviewController_1.getReviews);
// PATCH /api/reviews/:id/helpful - Marquer une review comme utile
router.patch('/:id/helpful', reviewController_1.markReviewHelpful);
// PATCH /api/reviews/:id/report - Signaler une review
router.patch('/:id/report', reviewController_1.reportReview);
// PATCH /api/reviews/:id/moderate - Modérer une review (publique pour tests)
router.patch('/:id/moderate', reviewController_1.moderateReview);
// GET /api/reviews/item/:itemId - Récupérer les avis d'un item (publique)
router.get('/item/:itemId', reviewController_1.getReviewsForItem);
// ========== 🚀 SPRINT 4: MODÉRATION AVANCÉE ==========
// GET /api/reviews/pending - Récupérer les avis en attente de modération
router.get('/pending', reviewController_1.getPendingReviews);
// GET /api/reviews/moderation/stats - Statistiques de modération (dashboard admin)
router.get('/moderation/stats', reviewController_1.getModerationStats);
// --- Routes CMS (authentification admin) ---
// DELETE /api/reviews/:id - Supprimer un avis (admin only)
router.delete('/:id', authMiddleware_1.firebaseAuthMiddleware, requireAdmin_1.requireAdmin, reviewController_1.deleteReview);
// PATCH /api/reviews/:id/toggle-active - Activer/désactiver un avis (admin only)
router.patch('/:id/toggle-active', authMiddleware_1.firebaseAuthMiddleware, requireAdmin_1.requireAdmin, reviewController_1.toggleReviewActive);
exports.default = router;
