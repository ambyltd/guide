"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.GPSController = void 0;
const GPSService_1 = require("../services/GPSService");
const AnalyticsService_1 = require("../services/AnalyticsService");
const UserSession_1 = require("../models/UserSession");
const ListeningBehavior_1 = require("../models/ListeningBehavior");
const PersonalizationProfile_1 = require("../models/PersonalizationProfile");
const AudioGuide_1 = require("../models/AudioGuide");
const joi_1 = __importDefault(require("joi"));
class GPSController {
    /**
     * Recherche des attractions proches avec GPS
     */
    static async findNearbyAttractions(req, res) {
        try {
            const schema = joi_1.default.object({
                latitude: joi_1.default.number().min(-90).max(90).required(),
                longitude: joi_1.default.number().min(-180).max(180).required(),
                accuracy: joi_1.default.number().min(0).default(20),
                radius: joi_1.default.number().min(100).max(50000).default(5000),
                category: joi_1.default.string().valid('museum', 'monument', 'nature', 'market', 'cultural', 'restaurant', 'religious', 'historical'),
                includeAudioGuides: joi_1.default.boolean().default(true),
                includeAnalytics: joi_1.default.boolean().default(false),
                sortBy: joi_1.default.string().valid('distance', 'popularity', 'rating').default('distance'),
                limit: joi_1.default.number().min(1).max(50).default(20)
            });
            const { error, value } = schema.validate(req.query);
            if (error) {
                return res.status(400).json({
                    success: false,
                    message: 'Paramètres invalides',
                    errors: error.details
                });
            }
            const { latitude, longitude, accuracy, ...options } = value;
            const userLocation = { latitude, longitude, accuracy, timestamp: new Date() };
            const attractions = await GPSService_1.GPSService.findNearbyAttractions(userLocation, options.radius, {
                category: options.category,
                includeAudioGuides: options.includeAudioGuides,
                includeAnalytics: options.includeAnalytics,
                sortBy: options.sortBy,
                limit: options.limit
            });
            // Enregistrement de l'événement de recherche pour analytics
            if (req.headers['x-session-id']) {
                await GPSController.recordSearchEvent(req.headers['x-session-id'], userLocation, options, attractions.length);
            }
            res.json({
                success: true,
                data: {
                    attractions,
                    userLocation,
                    searchRadius: options.radius,
                    resultsCount: attractions.length
                }
            });
        }
        catch (error) {
            console.error('Error finding nearby attractions:', error);
            res.status(500).json({
                success: false,
                message: 'Erreur lors de la recherche des attractions'
            });
        }
    }
    /**
     * Détection automatique des guides audio à proximité
     */
    static async detectNearbyAudioGuides(req, res) {
        try {
            const schema = joi_1.default.object({
                latitude: joi_1.default.number().min(-90).max(90).required(),
                longitude: joi_1.default.number().min(-180).max(180).required(),
                accuracy: joi_1.default.number().min(0).default(20),
                sessionId: joi_1.default.string().required()
            });
            const { error, value } = schema.validate({
                ...req.body,
                sessionId: req.headers['x-session-id']
            });
            if (error) {
                return res.status(400).json({
                    success: false,
                    message: 'Paramètres invalides',
                    errors: error.details
                });
            }
            const { latitude, longitude, accuracy, sessionId } = value;
            const userLocation = { latitude, longitude, accuracy, timestamp: new Date() };
            const detectedGuides = await GPSService_1.GPSService.detectNearbyAudioGuides(userLocation, sessionId, accuracy);
            // Personnalisation basée sur le profil utilisateur
            let personalizedGuides = detectedGuides;
            if (req.user?.uid) {
                personalizedGuides = await GPSController.personalizeAudioGuideRecommendations(req.user.uid, detectedGuides);
            }
            res.json({
                success: true,
                data: {
                    detectedGuides: personalizedGuides,
                    userLocation,
                    detectionRadius: 100,
                    totalDetected: personalizedGuides.length
                }
            });
        }
        catch (error) {
            console.error('Error detecting nearby audio guides:', error);
            res.status(500).json({
                success: false,
                message: 'Erreur lors de la détection des guides audio'
            });
        }
    }
    /**
     * Suivi du trajet utilisateur avec analyse comportementale
     */
    static async trackUserLocation(req, res) {
        try {
            const schema = joi_1.default.object({
                latitude: joi_1.default.number().min(-90).max(90).required(),
                longitude: joi_1.default.number().min(-180).max(180).required(),
                accuracy: joi_1.default.number().min(0).required(),
                altitude: joi_1.default.number().optional(),
                speed: joi_1.default.number().min(0).optional(),
                heading: joi_1.default.number().min(0).max(360).optional(),
                context: joi_1.default.string().valid('navigation', 'listening', 'exploring', 'searching').required(),
                sessionId: joi_1.default.string().required()
            });
            const { error, value } = schema.validate({
                ...req.body,
                sessionId: req.headers['x-session-id']
            });
            if (error) {
                return res.status(400).json({
                    success: false,
                    message: 'Paramètres invalides',
                    errors: error.details
                });
            }
            const locationPoint = {
                ...value,
                timestamp: new Date(),
                distanceFromPrevious: undefined,
                timeFromPrevious: undefined
            };
            // Récupération de la dernière position connue
            const session = await UserSession_1.UserSession.findOne({ sessionId: value.sessionId })
                .select('locationData.trackingPoints');
            let previousLocation;
            if (session && session.locationData.trackingPoints.length > 0) {
                const lastPoint = session.locationData.trackingPoints[session.locationData.trackingPoints.length - 1];
                previousLocation = {
                    latitude: lastPoint.latitude,
                    longitude: lastPoint.longitude,
                    accuracy: lastPoint.accuracy,
                    timestamp: lastPoint.timestamp
                };
            }
            // Traitement du point de tracking
            const trackingResult = await GPSService_1.GPSService.trackUserJourney(value.sessionId, locationPoint, previousLocation);
            // Vérification des géofences
            const geofenceEvents = await GPSService_1.GPSService.checkGeofences(locationPoint, value.sessionId, value.speed);
            // Prédiction des mouvements futurs
            const movementPrediction = await GPSService_1.GPSService.predictUserMovement(value.sessionId, locationPoint, value.speed, value.heading);
            res.json({
                success: true,
                data: {
                    trackingResult,
                    geofenceEvents,
                    movementPrediction,
                    locationPoint,
                    timestamp: new Date()
                }
            });
        }
        catch (error) {
            console.error('Error tracking user location:', error);
            res.status(500).json({
                success: false,
                message: 'Erreur lors du suivi de position'
            });
        }
    }
    /**
     * Optimisation de route avec algorithme avancé
     */
    static async optimizeRoute(req, res) {
        try {
            const schema = joi_1.default.object({
                attractions: joi_1.default.array().items(joi_1.default.string()).min(2).required(),
                startLocation: joi_1.default.object({
                    latitude: joi_1.default.number().min(-90).max(90).required(),
                    longitude: joi_1.default.number().min(-180).max(180).required()
                }).required(),
                constraints: joi_1.default.object({
                    maxDuration: joi_1.default.number().min(30).max(480).optional(), // 30 min à 8h
                    maxDistance: joi_1.default.number().min(1000).max(50000).optional(),
                    preferredCategories: joi_1.default.array().items(joi_1.default.string()).optional(),
                    avoidCrowds: joi_1.default.boolean().default(false),
                    timeOfDay: joi_1.default.number().min(0).max(23).optional()
                }).default({})
            });
            const { error, value } = schema.validate(req.body);
            if (error) {
                return res.status(400).json({
                    success: false,
                    message: 'Paramètres invalides',
                    errors: error.details
                });
            }
            const { attractions, startLocation, constraints } = value;
            // Conversion du startLocation vers le format IGeolocation
            const userLocation = {
                ...startLocation,
                accuracy: 20,
                timestamp: new Date()
            };
            const optimizedRoute = await GPSService_1.GPSService.optimizeRoute(attractions, userLocation, constraints);
            // Enrichissement avec des données personnalisées
            let personalizedRoute = optimizedRoute;
            if (req.user?.uid) {
                personalizedRoute = await GPSController.personalizeRoute(req.user.uid, optimizedRoute);
            }
            // Enregistrement de l'événement de planification de route
            if (req.headers['x-session-id']) {
                await GPSController.recordRouteOptimization(req.headers['x-session-id'], attractions, optimizedRoute, constraints);
            }
            res.json({
                success: true,
                data: {
                    originalRoute: attractions,
                    optimizedRoute: personalizedRoute,
                    optimization: {
                        distanceSaved: await GPSController.calculateDistanceSaved(attractions, optimizedRoute, userLocation),
                        timeSaved: await GPSController.calculateTimeSaved(attractions, optimizedRoute),
                        score: optimizedRoute.optimizationScore
                    }
                }
            });
        }
        catch (error) {
            console.error('Error optimizing route:', error);
            res.status(500).json({
                success: false,
                message: 'Erreur lors de l\'optimisation de route'
            });
        }
    }
    /**
     * Enregistrement du comportement d'écoute avec données GPS
     */
    static async recordListeningBehavior(req, res) {
        try {
            const schema = joi_1.default.object({
                audioGuideId: joi_1.default.string().required(),
                startTime: joi_1.default.date().required(),
                endTime: joi_1.default.date().optional(),
                duration: joi_1.default.number().min(0).required(),
                completionPercentage: joi_1.default.number().min(0).max(100).required(),
                pauseCount: joi_1.default.number().min(0).default(0),
                rewindCount: joi_1.default.number().min(0).default(0),
                skipCount: joi_1.default.number().min(0).default(0),
                volumeChanges: joi_1.default.number().min(0).default(0),
                location: joi_1.default.object({
                    latitude: joi_1.default.number().min(-90).max(90).required(),
                    longitude: joi_1.default.number().min(-180).max(180).required(),
                    accuracy: joi_1.default.number().min(0).required()
                }).required(),
                interruptionReasons: joi_1.default.array().items(joi_1.default.string()).default([]),
                qualityRating: joi_1.default.number().min(1).max(5).optional()
            });
            const { error, value } = schema.validate(req.body);
            if (error) {
                return res.status(400).json({
                    success: false,
                    message: 'Paramètres invalides',
                    errors: error.details
                });
            }
            // Enrichissement avec timestamp
            const listeningData = {
                ...value,
                location: {
                    ...value.location,
                    timestamp: new Date()
                }
            };
            // Sauvegarde du comportement d'écoute
            const listeningBehavior = new ListeningBehavior_1.ListeningBehavior(listeningData);
            await listeningBehavior.save();
            // Mise à jour des analytics du guide audio
            await GPSController.updateAudioGuideAnalytics(value.audioGuideId, listeningData);
            // Mise à jour du profil de personnalisation
            if (req.user?.uid) {
                await GPSController.updatePersonalizationProfile(req.user.uid, listeningData);
            }
            res.json({
                success: true,
                message: 'Comportement d\'écoute enregistré avec succès',
                data: {
                    behaviorId: listeningBehavior._id,
                    recommendations: await GPSController.generatePostListeningRecommendations(value.audioGuideId, listeningData)
                }
            });
        }
        catch (error) {
            console.error('Error recording listening behavior:', error);
            res.status(500).json({
                success: false,
                message: 'Erreur lors de l\'enregistrement du comportement'
            });
        }
    }
    /**
     * Obtention d'insights analytics en temps réel
     */
    static async getRealTimeInsights(req, res) {
        try {
            const schema = joi_1.default.object({
                timeRange: joi_1.default.string().valid('1h', '24h', '7d', '30d').default('24h'),
                includePersonalized: joi_1.default.boolean().default(false)
            });
            const { error, value } = schema.validate(req.query);
            if (error) {
                return res.status(400).json({
                    success: false,
                    message: 'Paramètres invalides',
                    errors: error.details
                });
            }
            // Génération des insights généraux
            const generalInsights = await AnalyticsService_1.AnalyticsService.generateRealTimeInsights();
            let personalizedInsights = null;
            if (value.includePersonalized && req.user?.uid) {
                personalizedInsights = await GPSController.generatePersonalizedInsights(req.user.uid, value.timeRange);
            }
            res.json({
                success: true,
                data: {
                    general: generalInsights,
                    personalized: personalizedInsights,
                    timestamp: new Date()
                }
            });
        }
        catch (error) {
            console.error('Error getting real-time insights:', error);
            res.status(500).json({
                success: false,
                message: 'Erreur lors de la récupération des insights'
            });
        }
    }
    // Méthodes privées utilitaires
    static async recordSearchEvent(sessionId, userLocation, searchOptions, resultsCount) {
        await UserSession_1.UserSession.updateOne({ sessionId }, {
            $push: {
                interactions: {
                    type: 'search',
                    target: 'nearby_attractions',
                    timestamp: new Date(),
                    context: 'gps_search',
                    metadata: {
                        location: userLocation,
                        options: searchOptions,
                        resultsCount
                    }
                }
            }
        });
    }
    static async personalizeAudioGuideRecommendations(userId, detectedGuides) {
        const profile = await PersonalizationProfile_1.PersonalizationProfile.findOne({ userId });
        if (!profile)
            return detectedGuides;
        // Score personnalisé basé sur les préférences
        return detectedGuides.map(guide => {
            const audioGuide = guide.audioGuide;
            let personalizedScore = guide.confidence;
            // Bonus basé sur les catégories préférées
            if (audioGuide.attractionId?.category) {
                const categoryScore = profile.preferences.categories[audioGuide.attractionId.category] || 0.5;
                personalizedScore = (personalizedScore + categoryScore) / 2;
            }
            // Bonus basé sur la langue préférée
            if (audioGuide.language === profile.preferences.language) {
                personalizedScore *= 1.1;
            }
            return {
                ...guide,
                personalizedScore,
                personalizedReason: GPSController.generatePersonalizationReason(profile, audioGuide)
            };
        }).sort((a, b) => b.personalizedScore - a.personalizedScore);
    }
    static async personalizeRoute(userId, optimizedRoute) {
        const profile = await PersonalizationProfile_1.PersonalizationProfile.findOne({ userId });
        if (!profile)
            return optimizedRoute;
        // Ajout de suggestions personnalisées
        const personalizedRoute = {
            ...optimizedRoute,
            personalizedSuggestions: await GPSController.generateRouteSuggestions(profile, optimizedRoute.route)
        };
        return personalizedRoute;
    }
    static async recordRouteOptimization(sessionId, originalAttractions, optimizedRoute, constraints) {
        await UserSession_1.UserSession.updateOne({ sessionId }, {
            $push: {
                interactions: {
                    type: 'route_optimization',
                    target: 'route_planner',
                    timestamp: new Date(),
                    context: 'gps_routing',
                    metadata: {
                        originalAttractions,
                        optimizedRoute: optimizedRoute.route.map((r) => r._id),
                        constraints,
                        optimizationScore: optimizedRoute.optimizationScore
                    }
                }
            }
        });
    }
    static async updateAudioGuideAnalytics(audioGuideId, listeningData) {
        const updates = {
            $inc: {
                'analytics.totalPlays': 1,
                'analytics.uniqueListeners': 1
            },
            $set: {
                'analytics.lastAnalyticsUpdate': new Date()
            }
        };
        // Mise à jour du taux de complétion
        const currentGuide = await AudioGuide_1.AudioGuide.findById(audioGuideId);
        if (currentGuide) {
            const newCompletionRate = ((currentGuide.analytics.completionRate * currentGuide.analytics.totalPlays) +
                listeningData.completionPercentage) / (currentGuide.analytics.totalPlays + 1);
            updates.$set['analytics.completionRate'] = newCompletionRate;
        }
        await AudioGuide_1.AudioGuide.updateOne({ _id: audioGuideId }, updates);
    }
    static async updatePersonalizationProfile(userId, listeningData) {
        // Récupérer l'attraction associée pour obtenir la catégorie
        const audioGuide = await AudioGuide_1.AudioGuide.findById(listeningData.audioGuideId)
            .populate('attractionId');
        if (!audioGuide?.attractionId)
            return;
        const category = audioGuide.attractionId.category;
        const language = audioGuide.language;
        await PersonalizationProfile_1.PersonalizationProfile.updateOne({ userId }, {
            $inc: {
                [`preferences.categories.${category}`]: listeningData.completionPercentage / 100,
            },
            $set: {
                'preferences.language': language,
                'lastUpdated': new Date()
            }
        }, { upsert: true });
    }
    static async generatePostListeningRecommendations(audioGuideId, listeningData) {
        const audioGuide = await AudioGuide_1.AudioGuide.findById(audioGuideId)
            .populate('attractionId');
        if (!audioGuide)
            return [];
        const recommendations = [];
        // Recommandations basées sur la complétion
        if (listeningData.completionPercentage > 80) {
            recommendations.push({
                type: 'similar_content',
                message: 'Découvrez d\'autres guides audio similaires',
                audioGuides: audioGuide.notifications.completionSuggestion.nextRecommendations
            });
        }
        // Recommandations basées sur la location
        const nearbyAttractions = await GPSService_1.GPSService.findNearbyAttractions(listeningData.location, 1000, { limit: 3, includeAudioGuides: true });
        if (nearbyAttractions.length > 0) {
            recommendations.push({
                type: 'nearby_attractions',
                message: 'Attractions à proximité',
                attractions: nearbyAttractions
            });
        }
        return recommendations;
    }
    static async generatePersonalizedInsights(userId, timeRange) {
        const profile = await PersonalizationProfile_1.PersonalizationProfile.findOne({ userId });
        if (!profile)
            return null;
        // Calcul de la période
        const now = new Date();
        const periods = {
            '1h': 60 * 60 * 1000,
            '24h': 24 * 60 * 60 * 1000,
            '7d': 7 * 24 * 60 * 60 * 1000,
            '30d': 30 * 24 * 60 * 60 * 1000
        };
        const since = new Date(now.getTime() - periods[timeRange]);
        // Analyse des patterns de localisation
        const locationPatterns = await AnalyticsService_1.AnalyticsService.analyzeLocationPatterns(userId, {
            start: since,
            end: now
        });
        // Score de personnalisation
        const personalizationScore = await AnalyticsService_1.AnalyticsService.calculatePersonalizationScore(userId);
        // Prédictions des préférences
        const predictedPreferences = await AnalyticsService_1.AnalyticsService.predictUserPreferences(userId);
        return {
            profile: {
                preferences: profile.preferences,
                behaviorScore: profile.behaviorScore,
                visitPatterns: profile.visitPatterns
            },
            analytics: {
                locationPatterns,
                personalizationScore,
                predictedPreferences
            },
            recommendations: profile.recommendations
        };
    }
    static generatePersonalizationReason(profile, audioGuide) {
        const reasons = [];
        if (audioGuide.language === profile.preferences.language) {
            reasons.push('Dans votre langue préférée');
        }
        const categoryScore = profile.preferences.categories.get(audioGuide.attractionId?.category);
        if (categoryScore && categoryScore > 0.7) {
            reasons.push('Correspond à vos centres d\'intérêt');
        }
        if (audioGuide.mlFeatures.contentQualityScore > 0.8) {
            reasons.push('Contenu de haute qualité');
        }
        return reasons.length > 0 ? reasons.join(', ') : 'Recommandé pour vous';
    }
    static async generateRouteSuggestions(profile, route) {
        const suggestions = [];
        // Suggestion basée sur les catégories préférées
        const preferredCategories = Object.entries(profile.preferences.categories)
            .sort(([, a], [, b]) => b - a)
            .slice(0, 2)
            .map(([category]) => category);
        for (const category of preferredCategories) {
            const categoryAttractions = route.filter(r => r.category === category);
            if (categoryAttractions.length > 0) {
                suggestions.push({
                    type: 'category_focus',
                    category,
                    message: `Vous semblez apprécier les ${category}, ${categoryAttractions.length} attraction(s) de ce type dans votre parcours`,
                    attractions: categoryAttractions.map(a => a._id)
                });
            }
        }
        // Suggestion de timing optimal
        const optimalDuration = profile.preferences.duration;
        const totalDuration = route.reduce((sum, r) => sum + (r.mlFeatures?.optimalVisitDuration || 30), 0);
        const durationMapping = { short: 60, medium: 120, long: 240 };
        const preferredDuration = durationMapping[optimalDuration];
        if (totalDuration > preferredDuration * 1.2) {
            suggestions.push({
                type: 'duration_warning',
                message: `Ce parcours pourrait être long pour vos préférences (${Math.round(totalDuration)}min vs ${preferredDuration}min préférés)`,
                suggestion: 'Considérez diviser en plusieurs visites'
            });
        }
        return suggestions;
    }
    static async calculateDistanceSaved(originalAttractions, optimizedRoute, userLocation) {
        // Calcul simplifié - dans une implémentation réelle, 
        // il faudrait calculer la distance de la route originale vs optimisée
        return Math.random() * 2000; // Placeholder
    }
    static async calculateTimeSaved(originalAttractions, optimizedRoute) {
        // Calcul simplifié - temps économisé en minutes
        return Math.random() * 30; // Placeholder
    }
}
exports.GPSController = GPSController;
