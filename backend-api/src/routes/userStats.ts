import express from 'express';
import {
  getUserStats,
  updateUserStats,
  incrementUserStats,
  addBadge,
  getLeaderboard,
} from '../controllers/userStatsController';

const router = express.Router();

// GET /api/users/leaderboard - Classement des utilisateurs
router.get('/leaderboard', getLeaderboard);

// GET /api/users/:userId/stats - Récupérer les stats
router.get('/:userId/stats', getUserStats);

// PATCH /api/users/:userId/stats - Mettre à jour les stats
router.patch('/:userId/stats', updateUserStats);

// PATCH /api/users/:userId/stats/increment - Incrémenter un compteur
router.patch('/:userId/stats/increment', incrementUserStats);

// POST /api/users/:userId/stats/badge - Ajouter un badge
router.post('/:userId/stats/badge', addBadge);

export default router;
