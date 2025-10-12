import express from 'express';
import { 
  createReview, 
  getReviewsForItem, 
  getAllReviews, 
  deleteReview,
  toggleReviewActive,
  moderateReview,
  getReviews,
  markReviewHelpful,
  reportReview,
  createReviewSimple,
  // 🚀 SPRINT 4: Nouvelles fonctions de modération
  getPendingReviews,
  getModerationStats,
} from '../controllers/reviewController';
import { firebaseAuthMiddleware } from '../middleware/authMiddleware';
import { requireAdmin } from '../middleware/requireAdmin';

const router = express.Router();

// ========== ROUTES MOBILE APP (PUBLIQUES POUR LES TESTS) ==========

// POST /api/reviews - Créer une review (version simplifiée sans auth pour tests)
router.post('/', createReviewSimple);

// GET /api/reviews - Récupérer les reviews (filtrable par attractionId, userId, status)
router.get('/', getReviews);

// PATCH /api/reviews/:id/helpful - Marquer une review comme utile
router.patch('/:id/helpful', markReviewHelpful);

// PATCH /api/reviews/:id/report - Signaler une review
router.patch('/:id/report', reportReview);

// PATCH /api/reviews/:id/moderate - Modérer une review (publique pour tests)
router.patch('/:id/moderate', moderateReview);

// GET /api/reviews/item/:itemId - Récupérer les avis d'un item (publique)
router.get('/item/:itemId', getReviewsForItem);

// ========== 🚀 SPRINT 4: MODÉRATION AVANCÉE ==========

// GET /api/reviews/pending - Récupérer les avis en attente de modération
router.get('/pending', getPendingReviews);

// GET /api/reviews/moderation/stats - Statistiques de modération (dashboard admin)
router.get('/moderation/stats', getModerationStats);

// --- Routes CMS (authentification admin) ---

// DELETE /api/reviews/:id - Supprimer un avis (admin only)
router.delete('/:id', firebaseAuthMiddleware, requireAdmin, deleteReview);

// PATCH /api/reviews/:id/toggle-active - Activer/désactiver un avis (admin only)
router.patch('/:id/toggle-active', firebaseAuthMiddleware, requireAdmin, toggleReviewActive);

export default router;
