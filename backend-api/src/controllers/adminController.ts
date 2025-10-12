import { Request, Response } from 'express';
import FeatureFlag, { IFeatureFlag } from '../models/FeatureFlag';

/**
 * ============================================
 * 🔧 ADMIN CONTROLLER - Sprint 5
 * ============================================
 * Endpoints pour l'administration du CMS:
 * - Feature flags management
 * - Configuration globale
 * - Statistiques d'administration
 * ============================================
 */

// ============================================
// FEATURE FLAGS MANAGEMENT
// ============================================

/**
 * GET /api/admin/features
 * Récupère la liste de tous les feature flags
 */
export const getFeatures = async (req: Request, res: Response) => {
  try {
    const { category, enabled } = req.query;

    // Construire le filtre
    const filter: any = {};
    if (category && category !== 'all') {
      filter.category = category;
    }
    if (enabled !== undefined) {
      filter.enabled = enabled === 'true';
    }

    // Récupérer les features avec tri
    const features = await FeatureFlag.find(filter).sort({
      'metadata.priority': -1,
      category: 1,
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
    console.error('Error getFeatures:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la récupération des feature flags',
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
};

/**
 * GET /api/admin/features/:id
 * Récupère un feature flag spécifique
 */
export const getFeatureById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const feature = await FeatureFlag.findById(id);

    if (!feature) {
      return res.status(404).json({
        success: false,
        message: 'Feature flag non trouvé',
      });
    }

    res.status(200).json({
      success: true,
      data: { feature },
    });
  } catch (error) {
    console.error('Error getFeatureById:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la récupération du feature flag',
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
};

/**
 * GET /api/admin/features/key/:key
 * Récupère un feature flag par sa clé
 */
export const getFeatureByKey = async (req: Request, res: Response) => {
  try {
    const { key } = req.params;

    const feature = await FeatureFlag.findOne({ key: key.toLowerCase() });

    if (!feature) {
      return res.status(404).json({
        success: false,
        message: `Feature flag '${key}' non trouvé`,
      });
    }

    res.status(200).json({
      success: true,
      data: { feature },
    });
  } catch (error) {
    console.error('Error getFeatureByKey:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la récupération du feature flag',
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
};

/**
 * POST /api/admin/features
 * Crée un nouveau feature flag
 */
export const createFeature = async (req: Request, res: Response) => {
  try {
    const { key, name, description, enabled, requiredVersion, category, metadata } = req.body;

    // Validation
    if (!key || !name || !description || !requiredVersion || !category) {
      return res.status(400).json({
        success: false,
        message: 'Champs obligatoires manquants (key, name, description, requiredVersion, category)',
      });
    }

    // Vérifier si la clé existe déjà
    const existing = await FeatureFlag.findOne({ key: key.toLowerCase() });
    if (existing) {
      return res.status(400).json({
        success: false,
        message: `Un feature flag avec la clé '${key}' existe déjà`,
      });
    }

    // Créer le feature flag
    const feature = new FeatureFlag({
      key: key.toLowerCase(),
      name,
      description,
      enabled: enabled !== undefined ? enabled : true,
      requiredVersion,
      category,
      metadata: metadata || {},
    });

    await feature.save();

    res.status(201).json({
      success: true,
      data: { feature },
      message: 'Feature flag créé avec succès',
    });
  } catch (error) {
    console.error('Error createFeature:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la création du feature flag',
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
};

/**
 * PATCH /api/admin/features/:id/toggle
 * Toggle l'état enabled d'un feature flag
 */
export const toggleFeature = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const feature = await FeatureFlag.findById(id);

    if (!feature) {
      return res.status(404).json({
        success: false,
        message: 'Feature flag non trouvé',
      });
    }

    // Toggle l'état
    feature.enabled = !feature.enabled;
    await feature.save();

    res.status(200).json({
      success: true,
      data: { feature },
      message: `Feature '${feature.name}' ${feature.enabled ? 'activé' : 'désactivé'} avec succès`,
    });
  } catch (error) {
    console.error('Error toggleFeature:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors du toggle du feature flag',
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
};

/**
 * PUT /api/admin/features/:id
 * Met à jour un feature flag
 */
export const updateFeature = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { name, description, enabled, requiredVersion, category, metadata } = req.body;

    const feature = await FeatureFlag.findById(id);

    if (!feature) {
      return res.status(404).json({
        success: false,
        message: 'Feature flag non trouvé',
      });
    }

    // Mettre à jour les champs autorisés
    if (name !== undefined) feature.name = name;
    if (description !== undefined) feature.description = description;
    if (enabled !== undefined) feature.enabled = enabled;
    if (requiredVersion !== undefined) feature.requiredVersion = requiredVersion;
    if (category !== undefined) feature.category = category;
    if (metadata !== undefined) {
      feature.metadata = { ...feature.metadata, ...metadata };
    }

    await feature.save();

    res.status(200).json({
      success: true,
      data: { feature },
      message: 'Feature flag mis à jour avec succès',
    });
  } catch (error) {
    console.error('Error updateFeature:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la mise à jour du feature flag',
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
};

/**
 * DELETE /api/admin/features/:id
 * Supprime un feature flag
 */
export const deleteFeature = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const feature = await FeatureFlag.findById(id);

    if (!feature) {
      return res.status(404).json({
        success: false,
        message: 'Feature flag non trouvé',
      });
    }

    // Vérifier si d'autres features dépendent de celle-ci
    const dependentFeatures = await FeatureFlag.find({
      'metadata.dependencies': feature.key,
    });

    if (dependentFeatures.length > 0) {
      return res.status(400).json({
        success: false,
        message: `Impossible de supprimer: ${dependentFeatures.length} feature(s) dépendent de '${feature.name}'`,
        data: {
          dependentFeatures: dependentFeatures.map((f) => ({ key: f.key, name: f.name })),
        },
      });
    }

    await FeatureFlag.findByIdAndDelete(id);

    res.status(200).json({
      success: true,
      message: `Feature flag '${feature.name}' supprimé avec succès`,
    });
  } catch (error) {
    console.error('Error deleteFeature:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la suppression du feature flag',
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
};

/**
 * GET /api/admin/features/categories
 * Récupère les statistiques par catégorie
 */
export const getFeaturesByCategory = async (req: Request, res: Response) => {
  try {
    const categories = await FeatureFlag.aggregate([
      {
        $group: {
          _id: '$category',
          total: { $sum: 1 },
          enabled: {
            $sum: { $cond: ['$enabled', 1, 0] },
          },
          disabled: {
            $sum: { $cond: ['$enabled', 0, 1] },
          },
        },
      },
      {
        $project: {
          _id: 0,
          category: '$_id',
          total: 1,
          enabled: 1,
          disabled: 1,
          percentageEnabled: {
            $multiply: [{ $divide: ['$enabled', '$total'] }, 100],
          },
        },
      },
      {
        $sort: { category: 1 },
      },
    ]);

    res.status(200).json({
      success: true,
      data: { categories },
    });
  } catch (error) {
    console.error('Error getFeaturesByCategory:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la récupération des statistiques',
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
};

// ============================================
// CONFIGURATION GLOBALE
// ============================================

/**
 * GET /api/admin/config
 * Récupère la configuration globale de l'application
 */
export const getConfig = async (req: Request, res: Response) => {
  try {
    // Configuration statique (peut être étendu avec un modèle AppConfig)
    const config = {
      app: {
        name: 'Audio Guide CI',
        version: '1.4.0',
        environment: process.env.NODE_ENV || 'development',
      },
      features: {
        totalFeatures: await FeatureFlag.countDocuments(),
        enabledFeatures: await FeatureFlag.countDocuments({ enabled: true }),
        disabledFeatures: await FeatureFlag.countDocuments({ enabled: false }),
      },
      cache: {
        refreshInterval: 3600, // 1 heure en secondes
        maxSize: 50 * 1024 * 1024, // 50 MB
      },
      limits: {
        maxImageSize: 5 * 1024 * 1024, // 5 MB
        maxAudioSize: 50 * 1024 * 1024, // 50 MB
        maxCacheSize: 200 * 1024 * 1024, // 200 MB
      },
      api: {
        baseUrl: process.env.API_BASE_URL || 'http://localhost:5000/api',
        timeout: 30000, // 30 secondes
      },
    };

    res.status(200).json({
      success: true,
      data: { config },
    });
  } catch (error) {
    console.error('Error getConfig:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la récupération de la configuration',
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
};

/**
 * PATCH /api/admin/config
 * Met à jour la configuration globale
 * (Pour l'instant, retourne un message - peut être étendu avec AppConfig model)
 */
export const updateConfig = async (req: Request, res: Response) => {
  try {
    const updates = req.body;

    // TODO: Implémenter la persistance avec AppConfig model
    // Pour l'instant, on retourne juste un succès

    res.status(200).json({
      success: true,
      message: 'Configuration mise à jour (fonctionnalité à implémenter)',
      data: { updates },
    });
  } catch (error) {
    console.error('Error updateConfig:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la mise à jour de la configuration',
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
};

/**
 * GET /api/admin/stats
 * Récupère les statistiques d'administration
 */
export const getAdminStats = async (req: Request, res: Response) => {
  try {
    const stats = {
      features: {
        total: await FeatureFlag.countDocuments(),
        enabled: await FeatureFlag.countDocuments({ enabled: true }),
        disabled: await FeatureFlag.countDocuments({ enabled: false }),
        byCategory: await FeatureFlag.aggregate([
          {
            $group: {
              _id: '$category',
              count: { $sum: 1 },
            },
          },
          {
            $project: {
              _id: 0,
              category: '$_id',
              count: 1,
            },
          },
        ]),
      },
      recentUpdates: await FeatureFlag.find()
        .sort({ updatedAt: -1 })
        .limit(5)
        .select('key name enabled updatedAt'),
    };

    res.status(200).json({
      success: true,
      data: { stats },
    });
  } catch (error) {
    console.error('Error getAdminStats:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la récupération des statistiques',
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
};
