"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.GPSService = void 0;
const geolib_1 = __importDefault(require("geolib"));
const Attraction_1 = require("../models/Attraction");
const AudioGuide_1 = require("../models/AudioGuide");
const UserSession_1 = require("../models/UserSession");
class GPSService {
    /**
     * Recherche des attractions proches avec analyse avancée
     */
    static async findNearbyAttractions(userLocation, radius = 5000, // 5km par défaut
    options = {}) {
        const { category, includeAudioGuides = true, includeAnalytics = false, sortBy = 'distance', limit = 20 } = options;
        const query = {
            active: true,
            location: {
                $near: {
                    $geometry: {
                        type: 'Point',
                        coordinates: [userLocation.longitude, userLocation.latitude]
                    },
                    $maxDistance: radius
                }
            }
        };
        if (category) {
            query.category = category;
        }
        let attractionsQuery = Attraction_1.Attraction.find(query);
        if (includeAudioGuides) {
            attractionsQuery = attractionsQuery.populate('audioGuides');
        }
        const attractions = await attractionsQuery.limit(limit);
        // Enrichir avec les données de distance et les métadonnées GPS
        const enrichedAttractions = attractions.map(attraction => {
            const distance = geolib_1.default.getDistance({ latitude: userLocation.latitude, longitude: userLocation.longitude }, { latitude: attraction.location.coordinates[1], longitude: attraction.location.coordinates[0] });
            const bearing = geolib_1.default.getRhumbLineBearing({ latitude: userLocation.latitude, longitude: userLocation.longitude }, { latitude: attraction.location.coordinates[1], longitude: attraction.location.coordinates[0] });
            const enriched = {
                ...attraction.toObject(),
                gpsData: {
                    distance,
                    bearing,
                    compassDirection: this.bearingToCompass(bearing),
                    estimatedWalkTime: Math.round(distance / 83), // 5 km/h = 83 m/min
                    accuracy: this.calculateLocationAccuracy(userLocation, attraction.gpsMetadata),
                    withinGeofence: distance <= attraction.geofencing.radius
                }
            };
            if (includeAnalytics) {
                enriched.analytics = attraction.analytics;
            }
            return enriched;
        });
        // Tri selon les préférences
        return this.sortAttractionsByPreference(enrichedAttractions, sortBy);
    }
    /**
     * Détection automatique des guides audio à proximité
     */
    static async detectNearbyAudioGuides(userLocation, sessionId, accuracy = 20) {
        const audioGuides = await AudioGuide_1.AudioGuide.find({
            active: true,
            gpsLocation: {
                $near: {
                    $geometry: {
                        type: 'Point',
                        coordinates: [userLocation.longitude, userLocation.latitude]
                    },
                    $maxDistance: 100 // 100 mètres maximum
                }
            }
        }).populate('attractionId');
        const detectedGuides = [];
        for (const guide of audioGuides) {
            const distance = geolib_1.default.getDistance({ latitude: userLocation.latitude, longitude: userLocation.longitude }, { latitude: guide.gpsLocation.coordinates[1], longitude: guide.gpsLocation.coordinates[0] });
            const shouldTrigger = this.shouldTriggerAudioGuide(distance, accuracy, guide.gpsMetadata, userLocation);
            if (shouldTrigger) {
                detectedGuides.push({
                    audioGuide: guide,
                    distance,
                    triggerType: this.determineTriggerType(distance, guide.gpsMetadata),
                    confidence: this.calculateTriggerConfidence(distance, accuracy, guide.gpsMetadata)
                });
                // Enregistrer l'événement de détection
                await this.recordGPSEvent(sessionId, 'audio_guide_detected', {
                    audioGuideId: guide._id,
                    distance,
                    userLocation,
                    accuracy
                });
            }
        }
        return detectedGuides.sort((a, b) => a.distance - b.distance);
    }
    /**
     * Suivi de trajet optimisé avec analyse comportementale
     */
    static async trackUserJourney(sessionId, locationPoint, previousLocation) {
        // Calcul des métriques de déplacement
        let movementMetrics = {};
        if (previousLocation) {
            const distance = geolib_1.default.getDistance({ latitude: previousLocation.latitude, longitude: previousLocation.longitude }, { latitude: locationPoint.latitude, longitude: locationPoint.longitude });
            const timeDiff = locationPoint.timeFromPrevious || 0;
            const speed = timeDiff > 0 ? (distance / timeDiff) * 3.6 : 0; // km/h
            movementMetrics = {
                distance,
                speed,
                timeDiff,
                bearing: geolib_1.default.getRhumbLineBearing({ latitude: previousLocation.latitude, longitude: previousLocation.longitude }, { latitude: locationPoint.latitude, longitude: locationPoint.longitude })
            };
        }
        // Détection des arrêts et points d'intérêt
        const nearbyPOIs = await this.detectPointsOfInterest(locationPoint);
        // Analyse du comportement de mouvement
        const movementPattern = await this.analyzeMovementPattern(sessionId, locationPoint);
        // Mise à jour de la session avec le point de tracking
        await UserSession_1.UserSession.updateOne({ sessionId }, {
            $push: {
                'locationData.trackingPoints': {
                    ...locationPoint,
                    ...movementMetrics,
                    nearbyPOIs: nearbyPOIs.map(poi => poi._id),
                    movementPattern
                }
            }
        });
        return {
            movementMetrics,
            nearbyPOIs,
            movementPattern,
            recommendations: await this.generateLocationBasedRecommendations(locationPoint, nearbyPOIs)
        };
    }
    /**
     * Optimisation de routes avec algorithme avancé
     */
    static async optimizeRoute(attractions, startLocation, constraints = {}) {
        const attractionDocs = await Attraction_1.Attraction.find({
            _id: { $in: attractions },
            active: true
        });
        if (attractionDocs.length === 0) {
            return { route: [], totalDistance: 0, estimatedDuration: 0 };
        }
        // Application des contraintes
        let filteredAttractions = this.applyRouteConstraints(attractionDocs, constraints);
        // Calcul de la matrice de distances
        const distanceMatrix = await this.calculateAdvancedDistanceMatrix(startLocation, filteredAttractions);
        // Algorithme d'optimisation (TSP amélioré avec contraintes)
        const optimizedRoute = this.solveTSPWithAdvancedConstraints(filteredAttractions, distanceMatrix, constraints);
        // Enrichissement avec les données de navigation
        const enrichedRoute = await this.enrichRouteWithNavigationData(optimizedRoute, startLocation, constraints);
        return {
            route: enrichedRoute,
            totalDistance: this.calculateTotalDistance(enrichedRoute),
            estimatedDuration: this.calculateTotalDuration(enrichedRoute),
            optimizationScore: this.calculateOptimizationScore(enrichedRoute, constraints)
        };
    }
    /**
     * Géofencing intelligent avec apprentissage adaptatif
     */
    static async checkGeofences(userLocation, sessionId, velocity) {
        const nearbyAttractions = await Attraction_1.Attraction.find({
            active: true,
            location: {
                $near: {
                    $geometry: {
                        type: 'Point',
                        coordinates: [userLocation.longitude, userLocation.latitude]
                    },
                    $maxDistance: 200 // Zone d'intérêt élargie
                }
            }
        });
        const geofenceEvents = [];
        for (const attraction of nearbyAttractions) {
            const distance = geolib_1.default.getDistance({ latitude: userLocation.latitude, longitude: userLocation.longitude }, { latitude: attraction.location.coordinates[1], longitude: attraction.location.coordinates[0] });
            const geofence = attraction.geofencing;
            const events = this.processGeofenceLogic(attraction, distance, geofence, userLocation, velocity);
            if (events.length > 0) {
                geofenceEvents.push(...events);
                // Enregistrement des événements
                for (const event of events) {
                    await this.recordGPSEvent(sessionId, event.type, {
                        attractionId: attraction._id,
                        geofenceRadius: geofence.radius,
                        userLocation,
                        ...event.metadata
                    });
                }
            }
        }
        return geofenceEvents;
    }
    /**
     * Analyse prédictive des mouvements utilisateur
     */
    static async predictUserMovement(sessionId, currentLocation, velocity, heading) {
        // Récupération de l'historique de mouvement
        const session = await UserSession_1.UserSession.findOne({ sessionId })
            .select('locationData.trackingPoints');
        if (!session || session.locationData.trackingPoints.length < 3) {
            return { predictedPath: [], confidence: 0 };
        }
        const trackingPoints = session.locationData.trackingPoints;
        const recentPoints = trackingPoints.slice(-5); // 5 derniers points
        // Analyse de la tendance de mouvement
        const movementTrend = this.analyzeMovementTrend(recentPoints);
        // Prédiction basée sur les patterns
        const predictedPath = this.predictMovementPath(currentLocation, movementTrend, velocity, heading);
        // Calcul de la confiance de prédiction
        const confidence = this.calculatePredictionConfidence(recentPoints, velocity, heading);
        // Recommandations basées sur la prédiction
        const recommendations = await this.generatePredictiveRecommendations(predictedPath, confidence);
        return {
            predictedPath,
            confidence,
            recommendations,
            movementTrend
        };
    }
    // Méthodes utilitaires privées
    static bearingToCompass(bearing) {
        const directions = ['N', 'NE', 'E', 'SE', 'S', 'SW', 'W', 'NW'];
        const index = Math.round(bearing / 45) % 8;
        return directions[index];
    }
    static calculateLocationAccuracy(userLocation, attractionGPS) {
        const combinedAccuracy = (userLocation.accuracy + attractionGPS.accuracy) / 2;
        if (combinedAccuracy <= 10)
            return 'high';
        if (combinedAccuracy <= 30)
            return 'medium';
        return 'low';
    }
    static sortAttractionsByPreference(attractions, sortBy) {
        switch (sortBy) {
            case 'popularity':
                return attractions.sort((a, b) => b.mlFeatures.popularityScore - a.mlFeatures.popularityScore);
            case 'rating':
                return attractions.sort((a, b) => b.rating - a.rating);
            case 'distance':
            default:
                return attractions.sort((a, b) => a.gpsData.distance - b.gpsData.distance);
        }
    }
    static shouldTriggerAudioGuide(distance, accuracy, guideMetadata, userLocation) {
        const effectiveRadius = guideMetadata.triggerDistance + accuracy;
        return distance <= effectiveRadius && accuracy <= guideMetadata.accuracyThreshold;
    }
    static determineTriggerType(distance, guideMetadata) {
        if (distance <= guideMetadata.optimalListeningRadius)
            return 'optimal';
        if (distance <= guideMetadata.triggerDistance * 0.8)
            return 'close';
        return 'approaching';
    }
    static calculateTriggerConfidence(distance, accuracy, guideMetadata) {
        const distanceScore = Math.max(0, 1 - distance / guideMetadata.triggerDistance);
        const accuracyScore = Math.max(0, 1 - accuracy / guideMetadata.accuracyThreshold);
        return (distanceScore + accuracyScore) / 2;
    }
    static async recordGPSEvent(sessionId, eventType, metadata) {
        await UserSession_1.UserSession.updateOne({ sessionId }, {
            $push: {
                'locationData.gpsEvents': {
                    type: eventType,
                    timestamp: new Date(),
                    metadata
                }
            }
        });
    }
    static async detectPointsOfInterest(location) {
        return await Attraction_1.Attraction.find({
            active: true,
            location: {
                $near: {
                    $geometry: {
                        type: 'Point',
                        coordinates: [location.longitude, location.latitude]
                    },
                    $maxDistance: 50 // 50 mètres
                }
            }
        }).select('name category location');
    }
    static async analyzeMovementPattern(sessionId, currentLocation) {
        const session = await UserSession_1.UserSession.findOne({ sessionId })
            .select('locationData.trackingPoints');
        if (!session || session.locationData.trackingPoints.length < 2) {
            return 'starting';
        }
        const points = session.locationData.trackingPoints;
        const recentPoints = points.slice(-3);
        // Analyse de la vitesse moyenne
        const avgSpeed = this.calculateAverageSpeed(recentPoints);
        // Analyse de la direction
        const directionStability = this.calculateDirectionStability(recentPoints);
        // Classification du pattern
        if (avgSpeed < 0.5)
            return 'stationary';
        if (avgSpeed < 2)
            return 'walking';
        if (avgSpeed < 15)
            return 'cycling';
        if (directionStability < 0.3)
            return 'exploring';
        return 'directed';
    }
    static async generateLocationBasedRecommendations(location, nearbyPOIs) {
        if (nearbyPOIs.length === 0)
            return [];
        const recommendations = nearbyPOIs.map(poi => ({
            type: 'nearby_attraction',
            attractionId: poi._id,
            distance: geolib_1.default.getDistance({ latitude: location.latitude, longitude: location.longitude }, { latitude: poi.location.coordinates[1], longitude: poi.location.coordinates[0] }),
            priority: poi.featured ? 'high' : 'medium'
        }));
        return recommendations.sort((a, b) => a.distance - b.distance).slice(0, 3);
    }
    static applyRouteConstraints(attractions, constraints) {
        let filtered = [...attractions];
        if (constraints.preferredCategories) {
            filtered = filtered.filter(a => constraints.preferredCategories.includes(a.category));
        }
        if (constraints.avoidCrowds) {
            filtered = filtered.filter(a => a.mlFeatures.crowdLevel !== 'high');
        }
        return filtered;
    }
    static async calculateAdvancedDistanceMatrix(startLocation, attractions) {
        const allPoints = [
            { coordinates: [startLocation.longitude, startLocation.latitude] },
            ...attractions.map(a => ({ coordinates: a.location.coordinates }))
        ];
        const matrix = [];
        for (let i = 0; i < allPoints.length; i++) {
            matrix[i] = [];
            for (let j = 0; j < allPoints.length; j++) {
                if (i === j) {
                    matrix[i][j] = 0;
                }
                else {
                    matrix[i][j] = geolib_1.default.getDistance({ latitude: allPoints[i].coordinates[1], longitude: allPoints[i].coordinates[0] }, { latitude: allPoints[j].coordinates[1], longitude: allPoints[j].coordinates[0] });
                }
            }
        }
        return matrix;
    }
    static solveTSPWithAdvancedConstraints(attractions, distanceMatrix, constraints) {
        // Algorithme TSP avec contraintes de temps et préférences
        return this.nearestNeighborWithConstraints(attractions, distanceMatrix, constraints);
    }
    static nearestNeighborWithConstraints(attractions, distances, constraints) {
        const visited = new Set([0]);
        const route = [0];
        let current = 0;
        let totalTime = 0;
        while (visited.size < distances.length &&
            (!constraints.maxDuration || totalTime < constraints.maxDuration)) {
            let best = this.findBestNextAttraction(current, visited, distances, attractions, constraints, totalTime);
            if (best.index === -1)
                break;
            visited.add(best.index);
            route.push(best.index);
            current = best.index;
            totalTime += best.estimatedTime;
        }
        return route.slice(1).map(index => attractions[index - 1]);
    }
    static findBestNextAttraction(current, visited, distances, attractions, constraints, currentTime) {
        let bestScore = -1;
        let bestIndex = -1;
        let bestTime = 0;
        for (let i = 1; i < distances.length; i++) {
            if (visited.has(i))
                continue;
            const attraction = attractions[i - 1];
            const distance = distances[current][i];
            const travelTime = distance / 83; // minutes de marche
            const visitTime = attraction.mlFeatures.optimalVisitDuration || 30;
            const totalTime = travelTime + visitTime;
            if (constraints.maxDuration &&
                currentTime + totalTime > constraints.maxDuration)
                continue;
            // Score basé sur distance, popularité et préférences
            const distanceScore = 1 / (1 + distance / 1000); // Normalisation
            const popularityScore = attraction.mlFeatures.popularityScore || 0.5;
            const timeScore = constraints.timeOfDay ?
                this.getTimeOptimalityScore(constraints.timeOfDay, attraction) : 0.5;
            const score = distanceScore * 0.4 + popularityScore * 0.4 + timeScore * 0.2;
            if (score > bestScore) {
                bestScore = score;
                bestIndex = i;
                bestTime = totalTime;
            }
        }
        return { index: bestIndex, estimatedTime: bestTime, score: bestScore };
    }
    static getTimeOptimalityScore(timeOfDay, attraction) {
        // Score basé sur les heures d'ouverture et la popularité aux différents moments
        const openingHours = attraction.openingHours;
        if (!openingHours)
            return 0.5;
        // Logic pour calculer l'optimalité temporelle
        return 0.7; // Placeholder
    }
    static async enrichRouteWithNavigationData(route, startLocation, constraints) {
        return route.map((attraction, index) => {
            const prevLocation = index === 0 ?
                { coordinates: [startLocation.longitude, startLocation.latitude] } :
                route[index - 1].location;
            const distance = geolib_1.default.getDistance({ latitude: prevLocation.coordinates[1], longitude: prevLocation.coordinates[0] }, { latitude: attraction.location.coordinates[1], longitude: attraction.location.coordinates[0] });
            return {
                ...attraction.toObject(),
                routeOrder: index + 1,
                navigation: {
                    distance,
                    estimatedWalkTime: Math.round(distance / 83),
                    bearing: geolib_1.default.getRhumbLineBearing({ latitude: prevLocation.coordinates[1], longitude: prevLocation.coordinates[0] }, { latitude: attraction.location.coordinates[1], longitude: attraction.location.coordinates[0] }),
                    instructions: this.generateTurnByTurnInstructions(prevLocation, attraction.location)
                }
            };
        });
    }
    static generateTurnByTurnInstructions(from, to) {
        const bearing = geolib_1.default.getRhumbLineBearing({ latitude: from.coordinates[1], longitude: from.coordinates[0] }, { latitude: to.coordinates[1], longitude: to.coordinates[0] });
        const direction = this.bearingToCompass(bearing);
        const distance = geolib_1.default.getDistance({ latitude: from.coordinates[1], longitude: from.coordinates[0] }, { latitude: to.coordinates[1], longitude: to.coordinates[0] });
        return `Dirigez-vous vers le ${direction} sur ${distance}m`;
    }
    static calculateTotalDistance(route) {
        return route.reduce((total, attraction) => total + (attraction.navigation?.distance || 0), 0);
    }
    static calculateTotalDuration(route) {
        return route.reduce((total, attraction) => total + (attraction.navigation?.estimatedWalkTime || 0) +
            (attraction.mlFeatures?.optimalVisitDuration || 30), 0);
    }
    static calculateOptimizationScore(route, constraints) {
        // Score d'optimisation basé sur différents critères
        const distanceEfficiency = this.calculateDistanceEfficiency(route);
        const timeEfficiency = this.calculateTimeEfficiency(route, constraints);
        const preferenceMatch = this.calculatePreferenceMatch(route, constraints);
        return (distanceEfficiency + timeEfficiency + preferenceMatch) / 3;
    }
    static calculateDistanceEfficiency(route) {
        // Compare la distance totale avec la distance minimale théorique
        const totalDistance = this.calculateTotalDistance(route);
        const directDistance = route.length > 0 ?
            geolib_1.default.getDistance({ latitude: route[0].location.coordinates[1], longitude: route[0].location.coordinates[0] }, { latitude: route[route.length - 1].location.coordinates[1], longitude: route[route.length - 1].location.coordinates[0] }) : 0;
        return directDistance > 0 ? Math.max(0, 1 - (totalDistance - directDistance) / totalDistance) : 1;
    }
    static calculateTimeEfficiency(route, constraints) {
        const totalDuration = this.calculateTotalDuration(route);
        if (!constraints.maxDuration)
            return 1;
        return Math.max(0, 1 - Math.abs(totalDuration - constraints.maxDuration) / constraints.maxDuration);
    }
    static calculatePreferenceMatch(route, constraints) {
        if (!constraints.preferredCategories)
            return 1;
        const matchingAttractions = route.filter(a => constraints.preferredCategories.includes(a.category)).length;
        return route.length > 0 ? matchingAttractions / route.length : 0;
    }
    static processGeofenceLogic(attraction, distance, geofence, userLocation, velocity) {
        const events = [];
        // Événement d'entrée
        if (geofence.entryTrigger && distance <= geofence.radius) {
            events.push({
                type: 'geofence_entry',
                attractionId: attraction._id,
                metadata: { distance, velocity }
            });
        }
        // Événement de sortie (nécessite un historique des positions)
        if (geofence.exitTrigger && distance > geofence.radius) {
            events.push({
                type: 'geofence_exit',
                attractionId: attraction._id,
                metadata: { distance, velocity }
            });
        }
        return events;
    }
    static analyzeMovementTrend(points) {
        if (points.length < 2)
            return { speed: 0, direction: 0, acceleration: 0 };
        const speeds = [];
        const bearings = [];
        for (let i = 1; i < points.length; i++) {
            const prev = points[i - 1];
            const curr = points[i];
            const distance = geolib_1.default.getDistance({ latitude: prev.latitude, longitude: prev.longitude }, { latitude: curr.latitude, longitude: curr.longitude });
            const timeDiff = (curr.timestamp.getTime() - prev.timestamp.getTime()) / 1000;
            const speed = timeDiff > 0 ? distance / timeDiff : 0;
            speeds.push(speed);
            const bearing = geolib_1.default.getRhumbLineBearing({ latitude: prev.latitude, longitude: prev.longitude }, { latitude: curr.latitude, longitude: curr.longitude });
            bearings.push(bearing);
        }
        return {
            averageSpeed: speeds.length > 0 ? speeds.reduce((a, b) => a + b) / speeds.length : 0,
            averageDirection: bearings.length > 0 ? bearings.reduce((a, b) => a + b) / bearings.length : 0,
            speedVariation: speeds.length > 1 ? this.calculateVariation(speeds) : 0,
            directionStability: bearings.length > 1 ? this.calculateDirectionStability(points) : 1
        };
    }
    static predictMovementPath(currentLocation, trend, velocity, heading) {
        const predictedPoints = [];
        const timeSteps = [30, 60, 120, 300]; // 30s, 1min, 2min, 5min
        for (const timeStep of timeSteps) {
            const effectiveSpeed = velocity || trend.averageSpeed;
            const effectiveHeading = heading || trend.averageDirection;
            const distance = effectiveSpeed * timeStep; // en mètres
            const predictedPoint = geolib_1.default.computeDestinationPoint({ latitude: currentLocation.latitude, longitude: currentLocation.longitude }, distance, effectiveHeading);
            predictedPoints.push({
                latitude: predictedPoint.latitude,
                longitude: predictedPoint.longitude,
                timestamp: new Date(Date.now() + timeStep * 1000),
                confidence: Math.max(0, 1 - timeStep / 300) // Décroissance de confiance
            });
        }
        return predictedPoints;
    }
    static calculatePredictionConfidence(recentPoints, velocity, heading) {
        if (recentPoints.length < 3)
            return 0.1;
        const consistencyScore = this.calculateMovementConsistency(recentPoints);
        const dataQualityScore = this.calculateDataQuality(recentPoints);
        const recencyScore = this.calculateRecencyScore(recentPoints);
        return (consistencyScore + dataQualityScore + recencyScore) / 3;
    }
    static async generatePredictiveRecommendations(predictedPath, confidence) {
        if (confidence < 0.3 || predictedPath.length === 0)
            return [];
        const recommendations = [];
        for (const point of predictedPath) {
            const nearbyAttractions = await this.findNearbyAttractions({ latitude: point.latitude, longitude: point.longitude, accuracy: 20, timestamp: point.timestamp }, 200, { limit: 3 });
            if (nearbyAttractions.length > 0) {
                recommendations.push({
                    type: 'upcoming_attraction',
                    timeToReach: (point.timestamp.getTime() - Date.now()) / 1000 / 60, // minutes
                    attractions: nearbyAttractions.slice(0, 2),
                    confidence: confidence * point.confidence
                });
            }
        }
        return recommendations;
    }
    static calculateAverageSpeed(points) {
        if (points.length < 2)
            return 0;
        let totalSpeed = 0;
        let count = 0;
        for (let i = 1; i < points.length; i++) {
            if (points[i].speed !== undefined) {
                totalSpeed += points[i].speed;
                count++;
            }
        }
        return count > 0 ? totalSpeed / count : 0;
    }
    static calculateDirectionStability(points) {
        if (points.length < 3)
            return 1;
        const bearings = [];
        for (let i = 2; i < points.length; i++) {
            const bearing = geolib_1.default.getRhumbLineBearing({ latitude: points[i - 1].latitude, longitude: points[i - 1].longitude }, { latitude: points[i].latitude, longitude: points[i].longitude });
            bearings.push(bearing);
        }
        return 1 - this.calculateVariation(bearings) / 180; // Normalisation sur 180°
    }
    static calculateVariation(values) {
        if (values.length < 2)
            return 0;
        const mean = values.reduce((a, b) => a + b) / values.length;
        const variance = values.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / values.length;
        return Math.sqrt(variance);
    }
    static calculateMovementConsistency(points) {
        const speeds = points.filter(p => p.speed !== undefined).map(p => p.speed);
        if (speeds.length < 2)
            return 0.5;
        const speedVariation = this.calculateVariation(speeds);
        const avgSpeed = speeds.reduce((a, b) => a + b) / speeds.length;
        return avgSpeed > 0 ? Math.max(0, 1 - speedVariation / avgSpeed) : 0.5;
    }
    static calculateDataQuality(points) {
        if (points.length === 0)
            return 0;
        const avgAccuracy = points.reduce((sum, p) => sum + p.accuracy, 0) / points.length;
        return Math.max(0, 1 - avgAccuracy / 50); // Normalisation sur 50m d'accuracy
    }
    static calculateRecencyScore(points) {
        if (points.length === 0)
            return 0;
        const lastPoint = points[points.length - 1];
        const ageMinutes = (Date.now() - lastPoint.timestamp.getTime()) / 1000 / 60;
        return Math.max(0, 1 - ageMinutes / 10); // Décrois sur 10 minutes
    }
}
exports.GPSService = GPSService;
