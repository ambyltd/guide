"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.geoLocationMiddleware = exports.performanceTrackingMiddleware = exports.errorTrackingMiddleware = exports.analyticsTrackingMiddleware = void 0;
const UserSession_1 = require("../models/UserSession");
/**
 * Middleware pour le tracking automatique des événements utilisateur
 */
const analyticsTrackingMiddleware = async (req, res, next) => {
    try {
        // Récupération des identifiants de session et utilisateur
        const sessionId = req.headers['x-session-id'];
        const userId = req.user?.uid || req.headers['x-user-id'];
        // Initialisation des données analytics dans la requête
        req.analytics = {
            sessionId,
            userId,
            trackingEnabled: !!sessionId
        };
        // Enregistrement automatique des événements d'API
        if (sessionId && shouldTrackRequest(req)) {
            // Détermination du type d'événement
            const eventType = determineEventType(req);
            // Enregistrement de l'interaction
            const interaction = {
                type: eventType,
                target: req.route?.path || req.path,
                targetId: req.params.id,
                timestamp: new Date(),
                context: `${req.method} ${req.path}`,
                metadata: {
                    method: req.method,
                    path: req.path,
                    params: req.params,
                    query: req.query,
                    userAgent: req.headers['user-agent'],
                    ip: req.ip || req.socket.remoteAddress
                }
            };
            // Mise à jour asynchrone de la session
            setImmediate(async () => {
                try {
                    await UserSession_1.UserSession.updateOne({ sessionId }, { $push: { interactions: interaction } });
                }
                catch (error) {
                    console.error('Error recording interaction:', error);
                }
            });
        }
        next();
    }
    catch (error) {
        // En cas d'erreur, continuer sans bloquer la requête
        console.error('Analytics middleware error:', error);
        next();
    }
};
exports.analyticsTrackingMiddleware = analyticsTrackingMiddleware;
/**
 * Middleware pour l'enregistrement des erreurs
 */
const errorTrackingMiddleware = (error, req, res, next) => {
    // Enregistrement de l'erreur dans les analytics
    if (req.analytics?.sessionId) {
        const crashReport = {
            type: 'error',
            message: error.message || 'Unknown error',
            stack: error.stack,
            timestamp: new Date(),
            context: {
                method: req.method,
                path: req.path,
                params: req.params,
                query: req.query,
                statusCode: error.statusCode || 500,
                userAgent: req.headers['user-agent']
            }
        };
        setImmediate(async () => {
            try {
                await UserSession_1.UserSession.updateOne({ sessionId: req.analytics.sessionId }, {
                    $push: { 'performance.crashReports': crashReport },
                    $inc: { 'performance.errorCount': 1 }
                });
            }
            catch (dbError) {
                console.error('Error recording crash report:', dbError);
            }
        });
    }
    next(error);
};
exports.errorTrackingMiddleware = errorTrackingMiddleware;
/**
 * Middleware pour mesurer les performances des requêtes
 */
const performanceTrackingMiddleware = (req, res, next) => {
    const startTime = Date.now();
    // Override de la fonction res.end pour capturer le temps de réponse
    const originalEnd = res.end.bind(res);
    res.end = function (...args) {
        const responseTime = Date.now() - startTime;
        // Enregistrement des métriques de performance
        if (req.analytics?.sessionId && shouldTrackPerformance(req, responseTime)) {
            setImmediate(async () => {
                try {
                    await UserSession_1.UserSession.updateOne({ sessionId: req.analytics.sessionId }, {
                        $push: {
                            'performance.apiCalls': {
                                endpoint: req.path,
                                method: req.method,
                                responseTime,
                                statusCode: res.statusCode,
                                timestamp: new Date()
                            }
                        }
                    });
                }
                catch (error) {
                    console.error('Error recording performance metrics:', error);
                }
            });
        }
        // Appel de la fonction originale
        return originalEnd(...args);
    };
    next();
};
exports.performanceTrackingMiddleware = performanceTrackingMiddleware;
/**
 * Détermine si la requête doit être trackée
 */
function shouldTrackRequest(req) {
    // Ne pas tracker les requêtes de health check
    if (req.path === '/api/health')
        return false;
    // Ne pas tracker les requêtes d'assets statiques
    if (req.path.includes('/static/') || req.path.includes('/assets/'))
        return false;
    // Tracker uniquement les requêtes API principales
    return req.path.startsWith('/api/');
}
/**
 * Détermine le type d'événement basé sur la requête
 */
function determineEventType(req) {
    const method = req.method.toLowerCase();
    const path = req.path.toLowerCase();
    // Mapping des patterns d'URL vers les types d'événements
    if (path.includes('/attractions')) {
        if (method === 'get' && req.params.id)
            return 'view_attraction';
        if (method === 'get')
            return 'browse_attractions';
        if (method === 'post')
            return 'create_attraction';
        return 'attraction_action';
    }
    if (path.includes('/audio-guides')) {
        if (method === 'get' && req.params.id)
            return 'view_audio_guide';
        if (method === 'get')
            return 'browse_audio_guides';
        if (method === 'post')
            return 'play_audio_guide';
        return 'audio_guide_action';
    }
    if (path.includes('/tours')) {
        if (method === 'get' && req.params.id)
            return 'view_tour';
        if (method === 'get')
            return 'browse_tours';
        return 'tour_action';
    }
    if (path.includes('/gps')) {
        if (path.includes('/nearby'))
            return 'gps_search';
        if (path.includes('/track'))
            return 'location_update';
        if (path.includes('/optimize'))
            return 'route_optimization';
        return 'gps_action';
    }
    if (path.includes('/search'))
        return 'search';
    if (path.includes('/favorites'))
        return 'favorite_action';
    if (path.includes('/reviews'))
        return 'review_action';
    // Type générique basé sur la méthode HTTP
    switch (method) {
        case 'get': return 'view';
        case 'post': return 'create';
        case 'put':
        case 'patch': return 'update';
        case 'delete': return 'delete';
        default: return 'api_call';
    }
}
/**
 * Détermine si les métriques de performance doivent être enregistrées
 */
function shouldTrackPerformance(req, responseTime) {
    // Enregistrer seulement les requêtes importantes
    if (!req.path.startsWith('/api/'))
        return false;
    // Toujours enregistrer les requêtes lentes (> 1 seconde)
    if (responseTime > 1000)
        return true;
    // Enregistrer un échantillon des autres requêtes (10%)
    return Math.random() < 0.1;
}
/**
 * Middleware pour l'extraction automatique des données de géolocalisation
 */
const geoLocationMiddleware = (req, res, next) => {
    try {
        // Extraction des coordonnées depuis les headers ou le body
        const latitude = req.headers['x-latitude'] || req.body?.latitude || req.query?.lat;
        const longitude = req.headers['x-longitude'] || req.body?.longitude || req.query?.lng;
        const accuracy = req.headers['x-accuracy'] || req.body?.accuracy || 20;
        // Vérifier que latitude et longitude sont valides
        if (latitude && longitude && !isNaN(parseFloat(latitude)) && !isNaN(parseFloat(longitude))) {
            req.analytics = {
                ...req.analytics,
                location: {
                    latitude: parseFloat(latitude),
                    longitude: parseFloat(longitude),
                    accuracy: parseFloat(accuracy),
                    timestamp: new Date()
                }
            };
            // Enregistrement automatique du point de géolocalisation
            if (req.analytics?.sessionId && req.analytics?.location) {
                setImmediate(async () => {
                    try {
                        const location = req.analytics.location;
                        if (!location || typeof location.latitude === 'undefined' || typeof location.longitude === 'undefined') {
                            return; // Skip si location invalide
                        }
                        const locationPoint = {
                            latitude: location.latitude,
                            longitude: location.longitude,
                            accuracy: location.accuracy,
                            timestamp: location.timestamp,
                            context: determineLocationContext(req),
                            distanceFromPrevious: undefined,
                            timeFromPrevious: undefined
                        };
                        await UserSession_1.UserSession.updateOne({ sessionId: req.analytics.sessionId }, { $push: { 'locationData.trackingPoints': locationPoint } });
                    }
                    catch (error) {
                        console.error('Error recording location point:', error);
                    }
                });
            }
        }
    }
    catch (error) {
        console.error('Error in geoLocationMiddleware:', error);
        // Ne pas bloquer la requête si erreur dans le middleware
    }
    next();
};
exports.geoLocationMiddleware = geoLocationMiddleware;
/**
 * Détermine le contexte de géolocalisation basé sur la requête
 */
function determineLocationContext(req) {
    const path = req.path.toLowerCase();
    if (path.includes('/audio-guides') && req.method === 'POST')
        return 'listening';
    if (path.includes('/gps/nearby') || path.includes('/search'))
        return 'searching';
    if (path.includes('/optimize-route') || path.includes('/track'))
        return 'navigation';
    return 'exploring';
}
exports.default = {
    analyticsTrackingMiddleware: exports.analyticsTrackingMiddleware,
    errorTrackingMiddleware: exports.errorTrackingMiddleware,
    performanceTrackingMiddleware: exports.performanceTrackingMiddleware,
    geoLocationMiddleware: exports.geoLocationMiddleware
};
