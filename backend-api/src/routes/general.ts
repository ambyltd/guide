import express from 'express';
import {
  getStats,
  getCategories,
  getCities,
  getRegions,
  searchGlobal,
  getRecommendations
} from '../controllers/generalController';
import { requireAdmin } from '../middleware/requireAdmin';

const router = express.Router();

// Routes publiques
router.get('/search', searchGlobal);
router.get('/categories', getCategories);
router.get('/cities', getCities);
router.get('/regions', getRegions);
router.get('/recommendations', getRecommendations);

// Routes protégées admin
router.get('/stats', requireAdmin, getStats);

export default router;
