import express from 'express';
import {
  getAllTours,
  getTourById,
  createTour,
  updateTour,
  deleteTour,
  searchTours,
  getFeaturedTours,
  getToursByCategory
} from '../controllers/tourController';
import { requireAdmin } from '../middleware/requireAdmin';

const router = express.Router();

// Routes publiques
router.get('/', getAllTours);
router.get('/search', searchTours);
router.get('/featured', getFeaturedTours);
router.get('/category/:category', getToursByCategory);
router.get('/:id', getTourById);

// Routes protégées (admin)
router.post('/', requireAdmin, createTour);
router.put('/:id', requireAdmin, updateTour);
router.delete('/:id', requireAdmin, deleteTour);

export default router;
