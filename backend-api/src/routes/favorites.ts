import express from 'express';
import {
  addFavorite,
  removeFavorite,
  getUserFavorites,
  checkFavorite,
} from '../controllers/favoriteController';

const router = express.Router();

// POST /api/favorites - Ajouter un favori
router.post('/', addFavorite);

// DELETE /api/favorites/:attractionId - Supprimer un favori
router.delete('/:attractionId', removeFavorite);

// GET /api/favorites - Récupérer tous les favoris d'un utilisateur
router.get('/', getUserFavorites);

// GET /api/favorites/check/:attractionId - Vérifier si une attraction est en favori
router.get('/check/:attractionId', checkFavorite);

export default router;
