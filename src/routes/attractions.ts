import express from 'express';
import {
  getAllAttractions,
  getAttractionById,
  createAttraction,
  updateAttraction,
  deleteAttraction,
  searchAttractions
} from '../controllers/attractionController';
import { requireAdmin } from '../middleware/requireAdmin';

const router = express.Router();

// Routes publiques
router.get('/', getAllAttractions);
router.get('/search', searchAttractions);
router.get('/:id', getAttractionById);

// Routes protégées (admin)
router.post('/', requireAdmin, createAttraction);
router.put('/:id', requireAdmin, updateAttraction);
router.delete('/:id', requireAdmin, deleteAttraction);

export default router;
