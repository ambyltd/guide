"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const AnalyticsService_1 = require("../services/AnalyticsService");
const UserSession_1 = require("../models/UserSession");
const PersonalizationProfile_1 = require("../models/PersonalizationProfile");
const authMiddleware_1 = require("../middleware/authMiddleware");
const joi_1 = __importDefault(require("joi"));
const router = express_1.default.Router();
/**
 * Démarrage d'une nouvelle session utilisateur
 */
router.post('/session/start', async (req, res) => {
    try {
        const schema = joi_1.default.object({
            sessionId: joi_1.default.string().required(),
            userId: joi_1.default.string().required(),
            deviceInfo: joi_1.default.object({
                platform: joi_1.default.string().valid('ios', 'android', 'web').required(),
                version: joi_1.default.string().required(),
                userAgent: joi_1.default.string().required(),
                screenResolution: joi_1.default.string(),
                language: joi_1.default.string().required()
            }).required(),
            startLocation: joi_1.default.object({
                latitude: joi_1.default.number().min(-90).max(90).required(),
                longitude: joi_1.default.number().min(-180).max(180).required(),
                accuracy: joi_1.default.number().min(0).required()
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
        const session = new UserSession_1.UserSession(sessionData);
        await session.save();
        res.status(201).json({
            success: true,
            data: { sessionId: session.sessionId },
            message: 'Session démarrée avec succès'
        });
    }
    catch (error) {
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
        const schema = joi_1.default.object({
            sessionId: joi_1.default.string().required(),
            endLocation: joi_1.default.object({
                latitude: joi_1.default.number().min(-90).max(90).required(),
                longitude: joi_1.default.number().min(-180).max(180).required(),
                accuracy: joi_1.default.number().min(0).required()
            }),
            performanceMetrics: joi_1.default.object({
                loadTime: joi_1.default.number(),
                errorCount: joi_1.default.number(),
                crashReports: joi_1.default.array()
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
        const session = await UserSession_1.UserSession.findOne({ sessionId: value.sessionId });
        if (!session) {
            return res.status(404).json({
                success: false,
                message: 'Session non trouvée'
            });
        }
        const duration = endTime.getTime() - session.startTime.getTime();
        await UserSession_1.UserSession.updateOne({ sessionId: value.sessionId }, {
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
        });
        res.json({
            success: true,
            data: { duration: Math.round(duration / 1000) },
            message: 'Session terminée avec succès'
        });
    }
    catch (error) {
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
        const schema = joi_1.default.object({
            sessionId: joi_1.default.string().required(),
            type: joi_1.default.string().valid('tap', 'scroll', 'swipe', 'search', 'play', 'pause', 'skip', 'favorite', 'share').required(),
            target: joi_1.default.string().required(),
            targetId: joi_1.default.string(),
            coordinates: joi_1.default.object({
                x: joi_1.default.number(),
                y: joi_1.default.number()
            }),
            context: joi_1.default.string().required(),
            duration: joi_1.default.number(),
            metadata: joi_1.default.object()
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
        await UserSession_1.UserSession.updateOne({ sessionId: value.sessionId }, { $push: { interactions: interaction } });
        res.json({
            success: true,
            message: 'Interaction enregistrée'
        });
    }
    catch (error) {
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
router.get('/location-patterns/:userId', authMiddleware_1.firebaseAuthMiddleware, async (req, res) => {
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
        const since = new Date(now.getTime() - periods[timeRange]);
        const patterns = await AnalyticsService_1.AnalyticsService.analyzeLocationPatterns(userId, {
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
    }
    catch (error) {
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
router.get('/personalization/:userId', authMiddleware_1.firebaseAuthMiddleware, async (req, res) => {
    try {
        const { userId } = req.params;
        let profile = await PersonalizationProfile_1.PersonalizationProfile.findOne({ userId });
        if (!profile) {
            // Création d'un profil par défaut
            profile = new PersonalizationProfile_1.PersonalizationProfile({
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
        const personalizationScore = await AnalyticsService_1.AnalyticsService.calculatePersonalizationScore(userId);
        // Prédiction des préférences
        const predictedPreferences = await AnalyticsService_1.AnalyticsService.predictUserPreferences(userId);
        res.json({
            success: true,
            data: {
                profile,
                personalizationScore,
                predictedPreferences,
                lastUpdated: profile.lastUpdated
            }
        });
    }
    catch (error) {
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
router.put('/personalization/:userId', authMiddleware_1.firebaseAuthMiddleware, async (req, res) => {
    try {
        const { userId } = req.params;
        const schema = joi_1.default.object({
            preferences: joi_1.default.object({
                categories: joi_1.default.object(),
                timeOfDay: joi_1.default.object(),
                duration: joi_1.default.string().valid('short', 'medium', 'long'),
                language: joi_1.default.string(),
                difficulty: joi_1.default.string().valid('easy', 'moderate', 'expert')
            }),
            behaviorScore: joi_1.default.object({
                explorer: joi_1.default.number().min(0).max(1),
                planner: joi_1.default.number().min(0).max(1),
                social: joi_1.default.number().min(0).max(1),
                local: joi_1.default.number().min(0).max(1),
                cultural: joi_1.default.number().min(0).max(1)
            }),
            visitPatterns: joi_1.default.object({
                frequency: joi_1.default.string().valid('occasional', 'regular', 'frequent'),
                groupSize: joi_1.default.number().min(1),
                repeatVisitor: joi_1.default.boolean()
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
        const updatedProfile = await PersonalizationProfile_1.PersonalizationProfile.findOneAndUpdate({ userId }, {
            $set: {
                ...value,
                lastUpdated: new Date()
            }
        }, { new: true, upsert: true });
        res.json({
            success: true,
            data: updatedProfile,
            message: 'Profil mis à jour avec succès'
        });
    }
    catch (error) {
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
        const insights = await AnalyticsService_1.AnalyticsService.generateRealTimeInsights();
        // Métriques supplémentaires
        const totalSessions = await UserSession_1.UserSession.countDocuments();
        const activeSessions = await UserSession_1.UserSession.countDocuments({
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
    }
    catch (error) {
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
router.get('/export/:userId', authMiddleware_1.firebaseAuthMiddleware, async (req, res) => {
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
        const since = new Date(now.getTime() - periods[timeRange]);
        const [sessions, profile, patterns] = await Promise.all([
            UserSession_1.UserSession.find({
                userId,
                startTime: { $gte: since }
            }).select('-__v'),
            PersonalizationProfile_1.PersonalizationProfile.findOne({ userId }).select('-__v'),
            AnalyticsService_1.AnalyticsService.analyzeLocationPatterns(userId, { start: since, end: now })
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
        }
        else {
            res.setHeader('Content-Type', 'application/json');
            res.setHeader('Content-Disposition', `attachment; filename=analytics-${userId}-${timeRange}.json`);
            res.json(exportData);
        }
    }
    catch (error) {
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
const analyticsController_1 = require("../controllers/analyticsController");
/**
 * GET /api/analytics/users/:userId/trends
 * Récupérer les tendances d'activité sur 7j ou 30j
 */
router.get('/users/:userId/trends', analyticsController_1.getUserTrends);
/**
 * GET /api/analytics/users/:userId/compare
 * Comparer les stats avec la moyenne des pairs
 */
router.get('/users/:userId/compare', analyticsController_1.compareWithPeers);
/**
 * GET /api/analytics/dashboard
 * Analytics globales pour admin
 */
router.get('/dashboard', analyticsController_1.getDashboardAnalytics);
/**
 * POST /api/analytics/track
 * Tracker une action utilisateur (créer ActivityLog)
 */
router.post('/track', analyticsController_1.trackAction);
exports.default = router;
