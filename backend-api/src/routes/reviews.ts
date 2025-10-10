import express from 'express';
import { 
  createReview, 
  getReviewsForItem, 
  getAllReviews, 
  deleteReview,
  toggleReviewActive,
  moderateReview
} from '../controllers/reviewController';
import { firebaseAuthMiddleware } from '../middleware/authMiddleware';
import { requireAdmin } from '../middleware/requireAdmin';

const router = express.Router();

// Route pour l'application mobile : créer un avis (nécessite une authentification utilisateur)
router.post('/', firebaseAuthMiddleware, createReview);

// Route pour l'application mobile : récupérer les avis d'un item (publique)
router.get('/item/:itemId', getReviewsForItem);

// --- Routes pour le CMS (nécessitent une authentification admin) ---

// Récupérer tous les avis pour la modération
router.get('/', firebaseAuthMiddleware, requireAdmin, getAllReviews);

// Supprimer un avis
router.delete('/:id', firebaseAuthMiddleware, requireAdmin, deleteReview);

// Activer/désactiver un avis
router.patch('/:id/toggle-active', firebaseAuthMiddleware, requireAdmin, toggleReviewActive);

// Modérer un avis
router.patch('/:id/moderate', firebaseAuthMiddleware, requireAdmin, moderateReview);

export default router;
