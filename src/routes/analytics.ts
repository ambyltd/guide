import express from 'express';
import { AnalyticsService } from '../services/AnalyticsService';
import { UserSession } from '../models/UserSession';
import { PersonalizationProfile } from '../models/PersonalizationProfile';
import { firebaseAuthMiddleware } from '../middleware/authMiddleware';
import Joi from 'joi';

const router = express.Router();

/**
 * Démarrage d'une nouvelle session utilisateur
 */
router.post('/session/start', async (req, res) => {
  try {
    const schema = Joi.object({
      sessionId: Joi.string().required(),
      userId: Joi.string().required(),
      deviceInfo: Joi.object({
        platform: Joi.string().valid('ios', 'android', 'web').required(),
        version: Joi.string().required(),
        userAgent: Joi.string().required(),
        screenResolution: Joi.string(),
        language: Joi.string().required()
      }).required(),
      startLocation: Joi.object({
        latitude: Joi.number().min(-90).max(90).required(),
        longitude: Joi.number().min(-180).max(180).required(),
        accuracy: Joi.number().min(0).required()
      })
    });

    const { error, value } = schema.validate(req.body);
    if (error) {
      return res.status(400).json({
        success: false,
        message: 'Paramètres invalides',
        errors: error.details
      });
    }

    const sessionData = {
      ...value,
      startTime: new Date(),
      locationData: {
        startLocation: {
          ...value.startLocation,
          timestamp: new Date()
        },
        trackingPoints: []
      },
      interactions: [],
      performance: {
        loadTime: 0,
        errorCount: 0,
        crashReports: []
      }
    };

    const session = new UserSession(sessionData);
    await session.save();

    res.status(201).json({
      success: true,
      data: { sessionId: session.sessionId },
      message: 'Session démarrée avec succès'
    });

  } catch (error) {
    console.error('Error starting session:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors du démarrage de session'
    });
  }
});

/**
 * Fin d'une session utilisateur
 */
router.post('/session/end', async (req, res) => {
  try {
    const schema = Joi.object({
      sessionId: Joi.string().required(),
      endLocation: Joi.object({
        latitude: Joi.number().min(-90).max(90).required(),
        longitude: Joi.number().min(-180).max(180).required(),
        accuracy: Joi.number().min(0).required()
      }),
      performanceMetrics: Joi.object({
        loadTime: Joi.number(),
        errorCount: Joi.number(),
        crashReports: Joi.array()
      })
    });

    const { error, value } = schema.validate(req.body);
    if (error) {
      return res.status(400).json({
        success: false,
        message: 'Paramètres invalides',
        errors: error.details
      });
    }

    const endTime = new Date();
    const session = await UserSession.findOne({ sessionId: value.sessionId });
    
    if (!session) {
      return res.status(404).json({
        success: false,
        message: 'Session non trouvée'
      });
    }

    const duration = endTime.getTime() - session.startTime.getTime();

    await UserSession.updateOne(
      { sessionId: value.sessionId },
      {
        $set: {
          endTime,
          duration: Math.round(duration / 1000),
          'locationData.endLocation': {
            ...value.endLocation,
            timestamp: endTime
          },
          'performance.loadTime': value.performanceMetrics?.loadTime || session.performance.loadTime,
          'performance.errorCount': value.performanceMetrics?.errorCount || session.performance.errorCount
        }
      }
    );

    res.json({
      success: true,
      data: { duration: Math.round(duration / 1000) },
      message: 'Session terminée avec succès'
    });

  } catch (error) {
    console.error('Error ending session:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la fin de session'
    });
  }
});

/**
 * Enregistrement d'interactions utilisateur
 */
router.post('/interaction', async (req, res) => {
  try {
    const schema = Joi.object({
      sessionId: Joi.string().required(),
      type: Joi.string().valid('tap', 'scroll', 'swipe', 'search', 'play', 'pause', 'skip', 'favorite', 'share').required(),
      target: Joi.string().required(),
      targetId: Joi.string(),
      coordinates: Joi.object({
        x: Joi.number(),
        y: Joi.number()
      }),
      context: Joi.string().required(),
      duration: Joi.number(),
      metadata: Joi.object()
    });

    const { error, value } = schema.validate(req.body);
    if (error) {
      return res.status(400).json({
        success: false,
        message: 'Paramètres invalides',
        errors: error.details
      });
    }

    const interaction = {
      ...value,
      timestamp: new Date()
    };

    await UserSession.updateOne(
      { sessionId: value.sessionId },
      { $push: { interactions: interaction } }
    );

    res.json({
      success: true,
      message: 'Interaction enregistrée'
    });

  } catch (error) {
    console.error('Error recording interaction:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de l\'enregistrement'
    });
  }
});

/**
 * Analyse des patterns de géolocalisation
 */
router.get('/location-patterns/:userId', firebaseAuthMiddleware, async (req, res) => {
  try {
    const { userId } = req.params;
    const { timeRange = '30d' } = req.query;

    const now = new Date();
    const periods = {
      '24h': 24 * 60 * 60 * 1000,
      '7d': 7 * 24 * 60 * 60 * 1000,
      '30d': 30 * 24 * 60 * 60 * 1000,
      '90d': 90 * 24 * 60 * 60 * 1000
    };

    const since = new Date(now.getTime() - periods[timeRange as keyof typeof periods]);

    const patterns = await AnalyticsService.analyzeLocationPatterns(userId, {
      start: since,
      end: now
    });

    res.json({
      success: true,
      data: {
        patterns,
        timeRange,
        period: { start: since, end: now }
      }
    });

  } catch (error) {
    console.error('Error analyzing location patterns:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de l\'analyse des patterns'
    });
  }
});

/**
 * Obtention du profil de personnalisation
 */
router.get('/personalization/:userId', firebaseAuthMiddleware, async (req, res) => {
  try {
    const { userId } = req.params;
    
    let profile = await PersonalizationProfile.findOne({ userId });
    
    if (!profile) {
      // Création d'un profil par défaut
      profile = new PersonalizationProfile({
        userId,
        preferences: {
          categories: new Map(),
          timeOfDay: new Map(),
          duration: 'medium',
          language: 'fr',
          difficulty: 'moderate'
        },
        behaviorScore: {
          explorer: 0.5,
          planner: 0.5,
          social: 0.5,
          local: 0.5,
          cultural: 0.5
        },
        visitPatterns: {
          frequency: 'occasional',
          seasonality: new Map(),
          groupSize: 1,
          repeatVisitor: false
        },
        recommendations: {
          nextAttractions: [],
          optimalRoutes: [],
          personalizedContent: []
        }
      });
      
      await profile.save();
    }

    // Calcul du score de personnalisation
    const personalizationScore = await AnalyticsService.calculatePersonalizationScore(userId);

    // Prédiction des préférences
    const predictedPreferences = await AnalyticsService.predictUserPreferences(userId);

    res.json({
      success: true,
      data: {
        profile,
        personalizationScore,
        predictedPreferences,
        lastUpdated: profile.lastUpdated
      }
    });

  } catch (error) {
    console.error('Error getting personalization profile:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la récupération du profil'
    });
  }
});

/**
 * Mise à jour du profil de personnalisation
 */
router.put('/personalization/:userId', firebaseAuthMiddleware, async (req, res) => {
  try {
    const { userId } = req.params;
    
    const schema = Joi.object({
      preferences: Joi.object({
        categories: Joi.object(),
        timeOfDay: Joi.object(),
        duration: Joi.string().valid('short', 'medium', 'long'),
        language: Joi.string(),
        difficulty: Joi.string().valid('easy', 'moderate', 'expert')
      }),
      behaviorScore: Joi.object({
        explorer: Joi.number().min(0).max(1),
        planner: Joi.number().min(0).max(1),
        social: Joi.number().min(0).max(1),
        local: Joi.number().min(0).max(1),
        cultural: Joi.number().min(0).max(1)
      }),
      visitPatterns: Joi.object({
        frequency: Joi.string().valid('occasional', 'regular', 'frequent'),
        groupSize: Joi.number().min(1),
        repeatVisitor: Joi.boolean()
      })
    });

    const { error, value } = schema.validate(req.body);
    if (error) {
      return res.status(400).json({
        success: false,
        message: 'Paramètres invalides',
        errors: error.details
      });
    }

    const updatedProfile = await PersonalizationProfile.findOneAndUpdate(
      { userId },
      {
        $set: {
          ...value,
          lastUpdated: new Date()
        }
      },
      { new: true, upsert: true }
    );

    res.json({
      success: true,
      data: updatedProfile,
      message: 'Profil mis à jour avec succès'
    });

  } catch (error) {
    console.error('Error updating personalization profile:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la mise à jour du profil'
    });
  }
});

/**
 * Analytics dashboard - métriques globales
 */
router.get('/dashboard', async (req, res) => {
  try {
    const insights = await AnalyticsService.generateRealTimeInsights();

    // Métriques supplémentaires
    const totalSessions = await UserSession.countDocuments();
    const activeSessions = await UserSession.countDocuments({
      endTime: { $exists: false }
    });

    const dashboardData = {
      ...insights,
      sessions: {
        total: totalSessions,
        active: activeSessions,
        completed: totalSessions - activeSessions
      }
    };

    res.json({
      success: true,
      data: dashboardData
    });

  } catch (error) {
    console.error('Error getting dashboard data:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la récupération du dashboard'
    });
  }
});

/**
 * Export des données analytics
 */
router.get('/export/:userId', firebaseAuthMiddleware, async (req, res) => {
  try {
    const { userId } = req.params;
    const { format = 'json', timeRange = '30d' } = req.query;

    const now = new Date();
    const periods = {
      '7d': 7 * 24 * 60 * 60 * 1000,
      '30d': 30 * 24 * 60 * 60 * 1000,
      '90d': 90 * 24 * 60 * 60 * 1000,
      'all': 365 * 24 * 60 * 60 * 1000 * 10 // 10 ans
    };

    const since = new Date(now.getTime() - periods[timeRange as keyof typeof periods]);

    const [sessions, profile, patterns] = await Promise.all([
      UserSession.find({
        userId,
        startTime: { $gte: since }
      }).select('-__v'),
      PersonalizationProfile.findOne({ userId }).select('-__v'),
      AnalyticsService.analyzeLocationPatterns(userId, { start: since, end: now })
    ]);

    const exportData = {
      userId,
      exportDate: new Date(),
      timeRange,
      sessions,
      personalizationProfile: profile,
      locationPatterns: patterns,
      summary: {
        totalSessions: sessions.length,
        totalInteractions: sessions.reduce((sum, s) => sum + s.interactions.length, 0),
        totalTrackingPoints: sessions.reduce((sum, s) => sum + s.locationData.trackingPoints.length, 0)
      }
    };

    if (format === 'csv') {
      // TODO: Implémenter l'export CSV
      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', `attachment; filename=analytics-${userId}-${timeRange}.csv`);
      res.send('CSV export not implemented yet');
    } else {
      res.setHeader('Content-Type', 'application/json');
      res.setHeader('Content-Disposition', `attachment; filename=analytics-${userId}-${timeRange}.json`);
      res.json(exportData);
    }

  } catch (error) {
    console.error('Error exporting analytics:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de l\'export'
    });
  }
});

// ============================================
// 🚀 Sprint 4 - Advanced Analytics Endpoints
// ============================================

import {
  getUserTrends,
  compareWithPeers,
  getDashboardAnalytics,
  trackAction,
} from '../controllers/analyticsController';

/**
 * GET /api/analytics/users/:userId/trends
 * Récupérer les tendances d'activité sur 7j ou 30j
 */
router.get('/users/:userId/trends', getUserTrends);

/**
 * GET /api/analytics/users/:userId/compare
 * Comparer les stats avec la moyenne des pairs
 */
router.get('/users/:userId/compare', compareWithPeers);

/**
 * GET /api/analytics/dashboard
 * Analytics globales pour admin
 */
router.get('/dashboard', getDashboardAnalytics);

/**
 * POST /api/analytics/track
 * Tracker une action utilisateur (créer ActivityLog)
 */
router.post('/track', trackAction);

export default router;