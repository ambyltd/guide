import geolib from 'geolib';
import * as turf from '@turf/turf';
import { Attraction } from '../models/Attraction';
import { AudioGuide } from '../models/AudioGuide';
import { UserSession } from '../models/UserSession';
import { IGeolocation, ILocationTrackingPoint } from '../types/analytics';

export class GPSService {
  
  /**
   * Recherche des attractions proches avec analyse avancée
   */
  static async findNearbyAttractions(
    userLocation: IGeolocation,
    radius: number = 5000, // 5km par défaut
    options: {
      category?: string;
      includeAudioGuides?: boolean;
      includeAnalytics?: boolean;
      sortBy?: 'distance' | 'popularity' | 'rating';
      limit?: number;
    } = {}
  ) {
    const { category, includeAudioGuides = true, includeAnalytics = false, sortBy = 'distance', limit = 20 } = options;

    const query: any = {
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

    let attractionsQuery = Attraction.find(query);

    if (includeAudioGuides) {
      attractionsQuery = attractionsQuery.populate('audioGuides');
    }

    const attractions = await attractionsQuery.limit(limit);

    // Enrichir avec les données de distance et les métadonnées GPS
    const enrichedAttractions = attractions.map(attraction => {
      const distance = geolib.getDistance(
        { latitude: userLocation.latitude, longitude: userLocation.longitude },
        { latitude: attraction.location.coordinates[1], longitude: attraction.location.coordinates[0] }
      );

      const bearing = geolib.getRhumbLineBearing(
        { latitude: userLocation.latitude, longitude: userLocation.longitude },
        { latitude: attraction.location.coordinates[1], longitude: attraction.location.coordinates[0] }
      );

      const enriched: any = {
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
  static async detectNearbyAudioGuides(
    userLocation: IGeolocation,
    sessionId: string,
    accuracy: number = 20
  ) {
    const audioGuides = await AudioGuide.find({
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
      const distance = geolib.getDistance(
        { latitude: userLocation.latitude, longitude: userLocation.longitude },
        { latitude: guide.gpsLocation.coordinates[1], longitude: guide.gpsLocation.coordinates[0] }
      );

      const shouldTrigger = this.shouldTriggerAudioGuide(
        distance,
        accuracy,
        guide.gpsMetadata,
        userLocation
      );

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
  static async trackUserJourney(
    sessionId: string,
    locationPoint: ILocationTrackingPoint,
    previousLocation?: IGeolocation
  ) {
    // Calcul des métriques de déplacement
    let movementMetrics = {};
    
    if (previousLocation) {
      const distance = geolib.getDistance(
        { latitude: previousLocation.latitude, longitude: previousLocation.longitude },
        { latitude: locationPoint.latitude, longitude: locationPoint.longitude }
      );

      const timeDiff = locationPoint.timeFromPrevious || 0;
      const speed = timeDiff > 0 ? (distance / timeDiff) * 3.6 : 0; // km/h

      movementMetrics = {
        distance,
        speed,
        timeDiff,
        bearing: geolib.getRhumbLineBearing(
          { latitude: previousLocation.latitude, longitude: previousLocation.longitude },
          { latitude: locationPoint.latitude, longitude: locationPoint.longitude }
        )
      };
    }

    // Détection des arrêts et points d'intérêt
    const nearbyPOIs = await this.detectPointsOfInterest(locationPoint);
    
    // Analyse du comportement de mouvement
    const movementPattern = await this.analyzeMovementPattern(sessionId, locationPoint);

    // Mise à jour de la session avec le point de tracking
    await UserSession.updateOne(
      { sessionId },
      {
        $push: {
          'locationData.trackingPoints': {
            ...locationPoint,
            ...movementMetrics,
            nearbyPOIs: nearbyPOIs.map(poi => poi._id),
            movementPattern
          }
        }
      }
    );

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
  static async optimizeRoute(
    attractions: string[],
    startLocation: IGeolocation,
    constraints: {
      maxDuration?: number; // en minutes
      maxDistance?: number; // en mètres
      preferredCategories?: string[];
      avoidCrowds?: boolean;
      timeOfDay?: number; // 0-23
    } = {}
  ) {
    const attractionDocs = await Attraction.find({
      _id: { $in: attractions },
      active: true
    });

    if (attractionDocs.length === 0) {
      return { route: [], totalDistance: 0, estimatedDuration: 0 };
    }

    // Application des contraintes
    let filteredAttractions = this.applyRouteConstraints(attractionDocs, constraints);

    // Calcul de la matrice de distances
    const distanceMatrix = await this.calculateAdvancedDistanceMatrix(
      startLocation,
      filteredAttractions
    );

    // Algorithme d'optimisation (TSP amélioré avec contraintes)
    const optimizedRoute = this.solveTSPWithAdvancedConstraints(
      filteredAttractions,
      distanceMatrix,
      constraints
    );

    // Enrichissement avec les données de navigation
    const enrichedRoute = await this.enrichRouteWithNavigationData(
      optimizedRoute,
      startLocation,
      constraints
    );

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
  static async checkGeofences(
    userLocation: IGeolocation,
    sessionId: string,
    velocity?: number
  ) {
    const nearbyAttractions = await Attraction.find({
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
      const distance = geolib.getDistance(
        { latitude: userLocation.latitude, longitude: userLocation.longitude },
        { latitude: attraction.location.coordinates[1], longitude: attraction.location.coordinates[0] }
      );

      const geofence = attraction.geofencing;
      const events = this.processGeofenceLogic(
        attraction,
        distance,
        geofence,
        userLocation,
        velocity
      );

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
  static async predictUserMovement(
    sessionId: string,
    currentLocation: IGeolocation,
    velocity?: number,
    heading?: number
  ) {
    // Récupération de l'historique de mouvement
    const session = await UserSession.findOne({ sessionId })
      .select('locationData.trackingPoints');

    if (!session || session.locationData.trackingPoints.length < 3) {
      return { predictedPath: [], confidence: 0 };
    }

    const trackingPoints = session.locationData.trackingPoints;
    const recentPoints = trackingPoints.slice(-5); // 5 derniers points

    // Analyse de la tendance de mouvement
    const movementTrend = this.analyzeMovementTrend(recentPoints);
    
    // Prédiction basée sur les patterns
    const predictedPath = this.predictMovementPath(
      currentLocation,
      movementTrend,
      velocity,
      heading
    );

    // Calcul de la confiance de prédiction
    const confidence = this.calculatePredictionConfidence(
      recentPoints,
      velocity,
      heading
    );

    // Recommandations basées sur la prédiction
    const recommendations = await this.generatePredictiveRecommendations(
      predictedPath,
      confidence
    );

    return {
      predictedPath,
      confidence,
      recommendations,
      movementTrend
    };
  }

  // Méthodes utilitaires privées

  private static bearingToCompass(bearing: number): string {
    const directions = ['N', 'NE', 'E', 'SE', 'S', 'SW', 'W', 'NW'];
    const index = Math.round(bearing / 45) % 8;
    return directions[index];
  }

  private static calculateLocationAccuracy(
    userLocation: IGeolocation,
    attractionGPS: any
  ): 'high' | 'medium' | 'low' {
    const combinedAccuracy = (userLocation.accuracy + attractionGPS.accuracy) / 2;
    
    if (combinedAccuracy <= 10) return 'high';
    if (combinedAccuracy <= 30) return 'medium';
    return 'low';
  }

  private static sortAttractionsByPreference(attractions: any[], sortBy: string) {
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

  private static shouldTriggerAudioGuide(
    distance: number,
    accuracy: number,
    guideMetadata: any,
    userLocation: IGeolocation
  ): boolean {
    const effectiveRadius = guideMetadata.triggerDistance + accuracy;
    return distance <= effectiveRadius && accuracy <= guideMetadata.accuracyThreshold;
  }

  private static determineTriggerType(distance: number, guideMetadata: any): string {
    if (distance <= guideMetadata.optimalListeningRadius) return 'optimal';
    if (distance <= guideMetadata.triggerDistance * 0.8) return 'close';
    return 'approaching';
  }

  private static calculateTriggerConfidence(
    distance: number,
    accuracy: number,
    guideMetadata: any
  ): number {
    const distanceScore = Math.max(0, 1 - distance / guideMetadata.triggerDistance);
    const accuracyScore = Math.max(0, 1 - accuracy / guideMetadata.accuracyThreshold);
    return (distanceScore + accuracyScore) / 2;
  }

  private static async recordGPSEvent(
    sessionId: string,
    eventType: string,
    metadata: any
  ) {
    await UserSession.updateOne(
      { sessionId },
      {
        $push: {
          'locationData.gpsEvents': {
            type: eventType,
            timestamp: new Date(),
            metadata
          }
        }
      }
    );
  }

  private static async detectPointsOfInterest(location: ILocationTrackingPoint) {
    return await Attraction.find({
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

  private static async analyzeMovementPattern(
    sessionId: string,
    currentLocation: ILocationTrackingPoint
  ): Promise<string> {
    const session = await UserSession.findOne({ sessionId })
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
    if (avgSpeed < 0.5) return 'stationary';
    if (avgSpeed < 2) return 'walking';
    if (avgSpeed < 15) return 'cycling';
    if (directionStability < 0.3) return 'exploring';
    return 'directed';
  }

  private static async generateLocationBasedRecommendations(
    location: ILocationTrackingPoint,
    nearbyPOIs: any[]
  ) {
    if (nearbyPOIs.length === 0) return [];

    const recommendations = nearbyPOIs.map(poi => ({
      type: 'nearby_attraction',
      attractionId: poi._id,
      distance: geolib.getDistance(
        { latitude: location.latitude, longitude: location.longitude },
        { latitude: poi.location.coordinates[1], longitude: poi.location.coordinates[0] }
      ),
      priority: poi.featured ? 'high' : 'medium'
    }));

    return recommendations.sort((a, b) => a.distance - b.distance).slice(0, 3);
  }

  private static applyRouteConstraints(attractions: any[], constraints: any) {
    let filtered = [...attractions];

    if (constraints.preferredCategories) {
      filtered = filtered.filter(a => 
        constraints.preferredCategories.includes(a.category)
      );
    }

    if (constraints.avoidCrowds) {
      filtered = filtered.filter(a => 
        a.mlFeatures.crowdLevel !== 'high'
      );
    }

    return filtered;
  }

  private static async calculateAdvancedDistanceMatrix(
    startLocation: IGeolocation,
    attractions: any[]
  ) {
    const allPoints = [
      { coordinates: [startLocation.longitude, startLocation.latitude] },
      ...attractions.map(a => ({ coordinates: a.location.coordinates }))
    ];

    const matrix: number[][] = [];
    for (let i = 0; i < allPoints.length; i++) {
      matrix[i] = [];
      for (let j = 0; j < allPoints.length; j++) {
        if (i === j) {
          matrix[i][j] = 0;
        } else {
          matrix[i][j] = geolib.getDistance(
            { latitude: allPoints[i].coordinates[1], longitude: allPoints[i].coordinates[0] },
            { latitude: allPoints[j].coordinates[1], longitude: allPoints[j].coordinates[0] }
          );
        }
      }
    }
    return matrix;
  }

  private static solveTSPWithAdvancedConstraints(
    attractions: any[],
    distanceMatrix: number[][],
    constraints: any
  ) {
    // Algorithme TSP avec contraintes de temps et préférences
    return this.nearestNeighborWithConstraints(attractions, distanceMatrix, constraints);
  }

  private static nearestNeighborWithConstraints(
    attractions: any[],
    distances: number[][],
    constraints: any
  ) {
    const visited = new Set([0]);
    const route = [0];
    let current = 0;
    let totalTime = 0;

    while (visited.size < distances.length && 
           (!constraints.maxDuration || totalTime < constraints.maxDuration)) {
      
      let best = this.findBestNextAttraction(
        current,
        visited,
        distances,
        attractions,
        constraints,
        totalTime
      );

      if (best.index === -1) break;

      visited.add(best.index);
      route.push(best.index);
      current = best.index;
      totalTime += best.estimatedTime;
    }

    return route.slice(1).map(index => attractions[index - 1]);
  }

  private static findBestNextAttraction(
    current: number,
    visited: Set<number>,
    distances: number[][],
    attractions: any[],
    constraints: any,
    currentTime: number
  ) {
    let bestScore = -1;
    let bestIndex = -1;
    let bestTime = 0;

    for (let i = 1; i < distances.length; i++) {
      if (visited.has(i)) continue;

      const attraction = attractions[i - 1];
      const distance = distances[current][i];
      const travelTime = distance / 83; // minutes de marche
      const visitTime = attraction.mlFeatures.optimalVisitDuration || 30;
      const totalTime = travelTime + visitTime;

      if (constraints.maxDuration && 
          currentTime + totalTime > constraints.maxDuration) continue;

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

  private static getTimeOptimalityScore(timeOfDay: number, attraction: any): number {
    // Score basé sur les heures d'ouverture et la popularité aux différents moments
    const openingHours = attraction.openingHours;
    if (!openingHours) return 0.5;

    // Logic pour calculer l'optimalité temporelle
    return 0.7; // Placeholder
  }

  private static async enrichRouteWithNavigationData(
    route: any[],
    startLocation: IGeolocation,
    constraints: any
  ) {
    return route.map((attraction, index) => {
      const prevLocation = index === 0 ? 
        { coordinates: [startLocation.longitude, startLocation.latitude] } :
        route[index - 1].location;

      const distance = geolib.getDistance(
        { latitude: prevLocation.coordinates[1], longitude: prevLocation.coordinates[0] },
        { latitude: attraction.location.coordinates[1], longitude: attraction.location.coordinates[0] }
      );

      return {
        ...attraction.toObject(),
        routeOrder: index + 1,
        navigation: {
          distance,
          estimatedWalkTime: Math.round(distance / 83),
          bearing: geolib.getRhumbLineBearing(
            { latitude: prevLocation.coordinates[1], longitude: prevLocation.coordinates[0] },
            { latitude: attraction.location.coordinates[1], longitude: attraction.location.coordinates[0] }
          ),
          instructions: this.generateTurnByTurnInstructions(prevLocation, attraction.location)
        }
      };
    });
  }

  private static generateTurnByTurnInstructions(from: any, to: any): string {
    const bearing = geolib.getRhumbLineBearing(
      { latitude: from.coordinates[1], longitude: from.coordinates[0] },
      { latitude: to.coordinates[1], longitude: to.coordinates[0] }
    );
    
    const direction = this.bearingToCompass(bearing);
    const distance = geolib.getDistance(
      { latitude: from.coordinates[1], longitude: from.coordinates[0] },
      { latitude: to.coordinates[1], longitude: to.coordinates[0] }
    );

    return `Dirigez-vous vers le ${direction} sur ${distance}m`;
  }

  private static calculateTotalDistance(route: any[]): number {
    return route.reduce((total, attraction) => 
      total + (attraction.navigation?.distance || 0), 0
    );
  }

  private static calculateTotalDuration(route: any[]): number {
    return route.reduce((total, attraction) => 
      total + (attraction.navigation?.estimatedWalkTime || 0) + 
      (attraction.mlFeatures?.optimalVisitDuration || 30), 0
    );
  }

  private static calculateOptimizationScore(route: any[], constraints: any): number {
    // Score d'optimisation basé sur différents critères
    const distanceEfficiency = this.calculateDistanceEfficiency(route);
    const timeEfficiency = this.calculateTimeEfficiency(route, constraints);
    const preferenceMatch = this.calculatePreferenceMatch(route, constraints);

    return (distanceEfficiency + timeEfficiency + preferenceMatch) / 3;
  }

  private static calculateDistanceEfficiency(route: any[]): number {
    // Compare la distance totale avec la distance minimale théorique
    const totalDistance = this.calculateTotalDistance(route);
    const directDistance = route.length > 0 ? 
      geolib.getDistance(
        { latitude: route[0].location.coordinates[1], longitude: route[0].location.coordinates[0] },
        { latitude: route[route.length-1].location.coordinates[1], longitude: route[route.length-1].location.coordinates[0] }
      ) : 0;

    return directDistance > 0 ? Math.max(0, 1 - (totalDistance - directDistance) / totalDistance) : 1;
  }

  private static calculateTimeEfficiency(route: any[], constraints: any): number {
    const totalDuration = this.calculateTotalDuration(route);
    if (!constraints.maxDuration) return 1;
    
    return Math.max(0, 1 - Math.abs(totalDuration - constraints.maxDuration) / constraints.maxDuration);
  }

  private static calculatePreferenceMatch(route: any[], constraints: any): number {
    if (!constraints.preferredCategories) return 1;
    
    const matchingAttractions = route.filter(a => 
      constraints.preferredCategories.includes(a.category)
    ).length;
    
    return route.length > 0 ? matchingAttractions / route.length : 0;
  }

  private static processGeofenceLogic(
    attraction: any,
    distance: number,
    geofence: any,
    userLocation: IGeolocation,
    velocity?: number
  ) {
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

  private static analyzeMovementTrend(points: ILocationTrackingPoint[]) {
    if (points.length < 2) return { speed: 0, direction: 0, acceleration: 0 };

    const speeds = [];
    const bearings = [];

    for (let i = 1; i < points.length; i++) {
      const prev = points[i-1];
      const curr = points[i];
      
      const distance = geolib.getDistance(
        { latitude: prev.latitude, longitude: prev.longitude },
        { latitude: curr.latitude, longitude: curr.longitude }
      );
      
      const timeDiff = (curr.timestamp.getTime() - prev.timestamp.getTime()) / 1000;
      const speed = timeDiff > 0 ? distance / timeDiff : 0;
      speeds.push(speed);

      const bearing = geolib.getRhumbLineBearing(
        { latitude: prev.latitude, longitude: prev.longitude },
        { latitude: curr.latitude, longitude: curr.longitude }
      );
      bearings.push(bearing);
    }

    return {
      averageSpeed: speeds.length > 0 ? speeds.reduce((a, b) => a + b) / speeds.length : 0,
      averageDirection: bearings.length > 0 ? bearings.reduce((a, b) => a + b) / bearings.length : 0,
      speedVariation: speeds.length > 1 ? this.calculateVariation(speeds) : 0,
      directionStability: bearings.length > 1 ? this.calculateDirectionStability(points) : 1
    };
  }

  private static predictMovementPath(
    currentLocation: IGeolocation,
    trend: any,
    velocity?: number,
    heading?: number
  ) {
    const predictedPoints = [];
    const timeSteps = [30, 60, 120, 300]; // 30s, 1min, 2min, 5min

    for (const timeStep of timeSteps) {
      const effectiveSpeed = velocity || trend.averageSpeed;
      const effectiveHeading = heading || trend.averageDirection;
      
      const distance = effectiveSpeed * timeStep; // en mètres
      
      const predictedPoint = geolib.computeDestinationPoint(
        { latitude: currentLocation.latitude, longitude: currentLocation.longitude },
        distance,
        effectiveHeading
      );

      predictedPoints.push({
        latitude: predictedPoint.latitude,
        longitude: predictedPoint.longitude,
        timestamp: new Date(Date.now() + timeStep * 1000),
        confidence: Math.max(0, 1 - timeStep / 300) // Décroissance de confiance
      });
    }

    return predictedPoints;
  }

  private static calculatePredictionConfidence(
    recentPoints: ILocationTrackingPoint[],
    velocity?: number,
    heading?: number
  ): number {
    if (recentPoints.length < 3) return 0.1;

    const consistencyScore = this.calculateMovementConsistency(recentPoints);
    const dataQualityScore = this.calculateDataQuality(recentPoints);
    const recencyScore = this.calculateRecencyScore(recentPoints);

    return (consistencyScore + dataQualityScore + recencyScore) / 3;
  }

  private static async generatePredictiveRecommendations(
    predictedPath: any[],
    confidence: number
  ) {
    if (confidence < 0.3 || predictedPath.length === 0) return [];

    const recommendations = [];

    for (const point of predictedPath) {
      const nearbyAttractions = await this.findNearbyAttractions(
        { latitude: point.latitude, longitude: point.longitude, accuracy: 20, timestamp: point.timestamp },
        200,
        { limit: 3 }
      );

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

  private static calculateAverageSpeed(points: ILocationTrackingPoint[]): number {
    if (points.length < 2) return 0;

    let totalSpeed = 0;
    let count = 0;

    for (let i = 1; i < points.length; i++) {
      if (points[i].speed !== undefined) {
        totalSpeed += points[i].speed!;
        count++;
      }
    }

    return count > 0 ? totalSpeed / count : 0;
  }

  private static calculateDirectionStability(points: ILocationTrackingPoint[]): number {
    if (points.length < 3) return 1;

    const bearings = [];
    for (let i = 2; i < points.length; i++) {
      const bearing = geolib.getRhumbLineBearing(
        { latitude: points[i-1].latitude, longitude: points[i-1].longitude },
        { latitude: points[i].latitude, longitude: points[i].longitude }
      );
      bearings.push(bearing);
    }

    return 1 - this.calculateVariation(bearings) / 180; // Normalisation sur 180°
  }

  private static calculateVariation(values: number[]): number {
    if (values.length < 2) return 0;
    
    const mean = values.reduce((a, b) => a + b) / values.length;
    const variance = values.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / values.length;
    return Math.sqrt(variance);
  }

  private static calculateMovementConsistency(points: ILocationTrackingPoint[]): number {
    const speeds = points.filter(p => p.speed !== undefined).map(p => p.speed!);
    if (speeds.length < 2) return 0.5;

    const speedVariation = this.calculateVariation(speeds);
    const avgSpeed = speeds.reduce((a, b) => a + b) / speeds.length;
    
    return avgSpeed > 0 ? Math.max(0, 1 - speedVariation / avgSpeed) : 0.5;
  }

  private static calculateDataQuality(points: ILocationTrackingPoint[]): number {
    if (points.length === 0) return 0;

    const avgAccuracy = points.reduce((sum, p) => sum + p.accuracy, 0) / points.length;
    return Math.max(0, 1 - avgAccuracy / 50); // Normalisation sur 50m d'accuracy
  }

  private static calculateRecencyScore(points: ILocationTrackingPoint[]): number {
    if (points.length === 0) return 0;

    const lastPoint = points[points.length - 1];
    const ageMinutes = (Date.now() - lastPoint.timestamp.getTime()) / 1000 / 60;
    
    return Math.max(0, 1 - ageMinutes / 10); // Décrois sur 10 minutes
  }
}
