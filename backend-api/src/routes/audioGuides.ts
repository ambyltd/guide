import express from 'express';
import {
  getAllAudioGuides,
  getAudioGuideById,
  createAudioGuide,
  updateAudioGuide,
  deleteAudioGuide,
  incrementDownloadCount,
  getAudioGuidesByAttraction
} from '../controllers/audioGuideController';
import { requireAdmin } from '../middleware/requireAdmin';

const router = express.Router();

// Routes publiques
router.get('/', getAllAudioGuides);
router.get('/attraction/:attractionId', getAudioGuidesByAttraction);
router.get('/:id', getAudioGuideById);
router.post('/:id/download', incrementDownloadCount);

// Routes protégées (admin)
router.post('/', requireAdmin, createAudioGuide);
router.put('/:id', requireAdmin, updateAudioGuide);
router.delete('/:id', requireAdmin, deleteAudioGuide);

export default router;
