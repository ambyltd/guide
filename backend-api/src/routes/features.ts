import { Router } from 'express';
import FeatureFlag from '../models/FeatureFlag';
import { Request, Response } from 'express';

const router = Router();

/**
 * ============================================
 * 📱 PUBLIC FEATURE FLAGS ROUTES - Sprint 5
 * ============================================
 * Routes publiques pour l'app mobile (pas d'auth requise)
 * ============================================
 */

/**
 * GET /api/features
 * Récupère toutes les features actives (publiques, pour l'app mobile)
 */
router.get('/', async (req: Request, res: Response) => {
  try {
    const features = await FeatureFlag.find({ enabled: true }).sort({
      'metadata.priority': -1,
      name: 1,
    });

    res.status(200).json({
      success: true,
      data: {
        features,
        total: features.length,
      },
    });
  } catch (error) {
    console.error('Error GET /api/features:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la récupération des features',
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

/**
 * GET /api/features/:key
 * Récupère une feature par sa clé (public)
 */
router.get('/:key', async (req: Request, res: Response) => {
  try {
    const { key } = req.params;

    const feature = await FeatureFlag.findOne({ key: key.toLowerCase() });

    if (!feature) {
      return res.status(404).json({
        success: false,
        message: `Feature '${key}' non trouvée`,
      });
    }

    res.status(200).json({
      success: true,
      data: { feature },
    });
  } catch (error) {
    console.error('Error GET /api/features/:key:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la récupération de la feature',
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

/**
 * GET /api/features/check/:key
 * Vérifie si une feature est enabled (retourne juste un boolean)
 */
router.get('/check/:key', async (req: Request, res: Response) => {
  try {
    const { key } = req.params;

    const feature = await FeatureFlag.findOne({ key: key.toLowerCase() });

    res.status(200).json({
      success: true,
      data: {
        key,
        enabled: feature ? feature.enabled : false, // Fallback: false si non trouvé
        exists: !!feature,
      },
    });
  } catch (error) {
    console.error('Error GET /api/features/check/:key:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la vérification de la feature',
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

export default router;
