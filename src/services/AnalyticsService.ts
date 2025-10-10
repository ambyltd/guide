import { UserSession } from '../models/UserSession';
import { ListeningBehavior } from '../models/ListeningBehavior';
import { PersonalizationProfile } from '../models/PersonalizationProfile';
import { Attraction } from '../models/Attraction';
import { AudioGuide } from '../models/AudioGuide';
import geolib from 'geolib';
import * as turf from '@turf/turf';
import * as ss from 'simple-statistics';

// Import compatible CommonJS pour ml-kmeans
const kmeans = require('ml-kmeans');

export class AnalyticsService {
  
  /**
   * Analyse des patterns de géolocalisation
   */
  static async analyzeLocationPatterns(userId: string, timeRange: { start: Date; end: Date }) {
    const sessions = await UserSession.find({
      userId,
      startTime: { $gte: timeRange.start, $lte: timeRange.end }
    }).select('locationData');

    const allTrackingPoints = sessions.flatMap(session => 
      session.locationData.trackingPoints.map(point => ({
        longitude: point.longitude,
        latitude: point.latitude,
        timestamp: point.timestamp,
        context: point.context
      }))
    );

    if (allTrackingPoints.length === 0) {
      return { clusters: [], hotspots: [], totalDistance: 0, averageSpeed: 0 };
    }

    // Clustering des points de géolocalisation
    const coordinates = allTrackingPoints.map(point => [point.longitude, point.latitude]);
    const clusterCount = Math.min(5, Math.floor(coordinates.length / 10)) || 1;
    const kmeansResult = kmeans(coordinates, clusterCount);

    // Calcul des hotspots
    const hotspots = kmeansResult.clusters.map((clusterIndices: number[], index: number) => {
      const clusterPoints = clusterIndices.map((pointIndex: number) => allTrackingPoints[pointIndex]);
      const center = turf.center(turf.featureCollection(
        clusterPoints.map((point: any) => turf.point([point.longitude, point.latitude]))
      ));
      
      return {
        center: center.geometry.coordinates,
        pointCount: clusterIndices.length,
        contexts: clusterPoints.map((p: any) => p.context),
        averageTime: this.calculateAverageTimeInCluster(clusterPoints)
      };
    });

    // Calcul de la distance totale
    const totalDistance = geolib.getPathLength(
      allTrackingPoints.map(point => ({ latitude: point.latitude, longitude: point.longitude }))
    );

    // Calcul de la vitesse moyenne
    const totalTime = allTrackingPoints.length > 1 ? 
      (allTrackingPoints[allTrackingPoints.length - 1].timestamp.getTime() - allTrackingPoints[0].timestamp.getTime()) / 1000 : 0;
    const averageSpeed = totalTime > 0 ? totalDistance / totalTime : 0;

    return {
      clusters: hotspots,
      totalDistance,
      averageSpeed,
      pointCount: allTrackingPoints.length
    };
  }

  /**
   * Analyse du comportement d'écoute
   */
  static async analyzeListeningBehavior(audioGuideId: string, timeRange: { start: Date; end: Date }) {
    const behaviors = await ListeningBehavior.find({
      audioGuideId,
      startTime: { $gte: timeRange.start, $lte: timeRange.end }
    });

    if (behaviors.length === 0) {
      return { metrics: {}, patterns: [], recommendations: [] };
    }

    const completionRates = behaviors.map(b => b.completionPercentage);
    const durations = behaviors.map(b => b.duration);
    const pauseCounts = behaviors.map(b => b.pauseCount);

    const metrics = {
      totalListens: behaviors.length,
      averageCompletion: ss.mean(completionRates),
      medianCompletion: ss.median(completionRates),
      averageDuration: ss.mean(durations),
      averagePauses: ss.mean(pauseCounts),
      dropoffPoints: this.findDropoffPoints(behaviors),
      peakListeningTimes: this.findPeakListeningTimes(behaviors)
    };

    const patterns = this.identifyListeningPatterns(behaviors);
    const recommendations = this.generateContentRecommendations(metrics, patterns);

    return { metrics, patterns, recommendations };
  }

  /**
   * Calcul du score de personnalisation
   */
  static async calculatePersonalizationScore(userId: string): Promise<number> {
    const profile = await PersonalizationProfile.findOne({ userId });
    if (!profile) return 0;

    const sessions = await UserSession.countDocuments({ userId });
    const behaviors = await ListeningBehavior.countDocuments({ 
      // Assuming we add userId to ListeningBehavior model
    });

    // Algorithme de scoring basé sur l'engagement
    const engagementScore = Math.min(1, sessions / 10); // Normalisation sur 10 sessions
    const contentScore = Math.min(1, behaviors / 5); // Normalisation sur 5 écoutes
    const diversityScore = Object.keys(profile.preferences.categories).length / 7; // 7 catégories max

    return (engagementScore * 0.4 + contentScore * 0.4 + diversityScore * 0.2);
  }

  /**
   * Prédiction des préférences utilisateur
   */
  static async predictUserPreferences(userId: string) {
    const sessions = await UserSession.find({ userId }).limit(50);
    const profile = await PersonalizationProfile.findOne({ userId });

    if (!profile || sessions.length === 0) {
      return this.getDefaultPreferences();
    }

    // Analyse des patterns temporels
    const hourPreferences = this.analyzeTimePreferences(sessions);
    
    // Analyse des patterns de géolocalisation
    const locationPreferences = await this.analyzeLocationPreferences(sessions);
    
    // Analyse des interactions
    const interactionPatterns = this.analyzeInteractionPatterns(sessions);

    return {
      temporal: hourPreferences,
      spatial: locationPreferences,
      behavioral: interactionPatterns,
      confidence: this.calculatePredictionConfidence(sessions.length, profile.lastUpdated)
    };
  }

  /**
   * Optimisation des circuits basée sur les données GPS
   */
  static async optimizeRouteWithGPS(attractionIds: string[], userLocation: { lat: number; lng: number }) {
    const attractions = await Attraction.find({
      _id: { $in: attractionIds },
      active: true
    }).select('location analytics mlFeatures');

    if (attractions.length === 0) return [];

    // Conversion en format compatible avec TSP (Traveling Salesman Problem)
    const points = attractions.map(attraction => ({
      id: (attraction._id as any).toString(),
      name: attraction.name,
      category: attraction.category,
      coordinates: attraction.location.coordinates,
      visitTime: attraction.mlFeatures?.optimalVisitDuration || 30,
      crowdLevel: attraction.mlFeatures?.crowdLevel || 0.5,
      popularityScore: attraction.mlFeatures?.popularityScore || 0.5
    }));

    // Algorithme d'optimisation de route
    const optimizedRoute = this.solveTSPWithConstraints(points, userLocation);
    
    // Ajout des métadonnées de navigation
    return this.enrichRouteWithNavigationData(optimizedRoute);
  }

  /**
   * Analyse des tendances en temps réel
   */
  static async generateRealTimeInsights() {
    const now = new Date();
    const oneHourAgo = new Date(now.getTime() - 60 * 60 * 1000);
    const oneDayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);

    const [
      activeUsers,
      newSessions,
      popularAttractions,
      audioGuideMetrics
    ] = await Promise.all([
      UserSession.countDocuments({ startTime: { $gte: oneHourAgo } }),
      UserSession.countDocuments({ startTime: { $gte: oneHourAgo } }),
      this.getPopularAttractions(oneDayAgo),
      this.getAudioGuideMetrics(oneDayAgo)
    ]);

    return {
      timestamp: now,
      activeUsers,
      newSessions,
      popularAttractions,
      audioGuideMetrics,
      trends: await this.calculateTrends(oneDayAgo)
    };
  }

  // Méthodes privées d'assistance
  private static calculateAverageTimeInCluster(points: any[]): number {
    if (points.length <= 1) return 0;
    
    const sortedPoints = points.sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime());
    let totalTime = 0;
    
    for (let i = 1; i < sortedPoints.length; i++) {
      totalTime += (sortedPoints[i].timestamp.getTime() - sortedPoints[i-1].timestamp.getTime()) / 1000;
    }
    
    return totalTime / (sortedPoints.length - 1);
  }

  private static findDropoffPoints(behaviors: any[]): number[] {
    const completionBuckets = Array(11).fill(0); // 0-10%, 10-20%, etc.
    
    behaviors.forEach(behavior => {
      const bucket = Math.floor(behavior.completionPercentage / 10);
      completionBuckets[Math.min(bucket, 10)]++;
    });

    // Trouve les points où il y a une chute significative
    const dropoffPoints = [];
    for (let i = 1; i < completionBuckets.length; i++) {
      if (completionBuckets[i] < completionBuckets[i-1] * 0.7) {
        dropoffPoints.push(i * 10);
      }
    }

    return dropoffPoints;
  }

  private static findPeakListeningTimes(behaviors: any[]): { hour: number; count: number }[] {
    const hourCounts = Array(24).fill(0);
    
    behaviors.forEach(behavior => {
      const hour = behavior.startTime.getHours();
      hourCounts[hour]++;
    });

    return hourCounts
      .map((count, hour) => ({ hour, count }))
      .filter(item => item.count > 0)
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);
  }

  private static identifyListeningPatterns(behaviors: any[]): string[] {
    const patterns = [];
    
    const avgCompletion = ss.mean(behaviors.map(b => b.completionPercentage));
    if (avgCompletion > 80) patterns.push('high_completion');
    if (avgCompletion < 30) patterns.push('low_completion');
    
    const avgPauses = ss.mean(behaviors.map(b => b.pauseCount));
    if (avgPauses > 3) patterns.push('frequent_pauses');
    
    const avgRewinds = ss.mean(behaviors.map(b => b.rewindCount));
    if (avgRewinds > 1) patterns.push('frequent_rewinds');

    return patterns;
  }

  private static generateContentRecommendations(metrics: any, patterns: string[]): string[] {
    const recommendations = [];

    if (patterns.includes('low_completion')) {
      recommendations.push('Consider shorter audio segments');
      recommendations.push('Add more engaging introduction');
    }

    if (patterns.includes('frequent_pauses')) {
      recommendations.push('Review content pacing');
      recommendations.push('Add natural pause points');
    }

    if (metrics.averageDuration < metrics.expectedDuration * 0.5) {
      recommendations.push('Content may be too long or not engaging');
    }

    return recommendations;
  }

  private static getDefaultPreferences() {
    return {
      categories: { cultural: 0.5, historical: 0.5, nature: 0.3 },
      timeOfDay: { morning: 0.3, afternoon: 0.5, evening: 0.2 },
      duration: 'medium',
      difficulty: 'moderate'
    };
  }

  private static analyzeTimePreferences(sessions: any[]) {
    const hourCounts = Array(24).fill(0);
    sessions.forEach(session => {
      const hour = session.startTime.getHours();
      hourCounts[hour]++;
    });

    const total = sessions.length;
    return hourCounts.map((count, hour) => ({
      hour,
      preference: count / total
    }));
  }

  private static async analyzeLocationPreferences(sessions: any[]) {
    // Analyse des préférences géographiques basée sur les sessions
    const locationClusters: { [key: string]: number } = {};
    
    sessions.forEach(session => {
      if (session.locationData?.startLocation) {
        const key = `${Math.round(session.locationData.startLocation.latitude * 100)}_${Math.round(session.locationData.startLocation.longitude * 100)}`;
        locationClusters[key] = (locationClusters[key] || 0) + 1;
      }
    });

    return Object.entries(locationClusters)
      .map(([key, count]) => ({
        location: key,
        frequency: count as number
      }))
      .sort((a, b) => b.frequency - a.frequency)
      .slice(0, 10);
  }

  private static analyzeInteractionPatterns(sessions: any[]) {
    const interactions = sessions.flatMap(s => s.interactions || []);
    const patterns: { [key: string]: number } = {};
    
    interactions.forEach((interaction: any) => {
      if (interaction.type) {
        patterns[interaction.type] = (patterns[interaction.type] || 0) + 1;
      }
    });

    return Object.entries(patterns).map(([type, count]) => ({
      type,
      frequency: count as number
    }));
  }

  private static calculatePredictionConfidence(sessionCount: number, lastUpdate: Date): number {
    const daysSinceUpdate = (Date.now() - lastUpdate.getTime()) / (1000 * 60 * 60 * 24);
    const sessionConfidence = Math.min(1, sessionCount / 20);
    const freshnessConfidence = Math.max(0, 1 - daysSinceUpdate / 30);
    
    return (sessionConfidence + freshnessConfidence) / 2;
  }

  private static solveTSPWithConstraints(points: any[], startLocation: { lat: number; lng: number }) {
    // Algorithme TSP simplifié avec contraintes
    const distances = this.calculateDistanceMatrix(points, startLocation);
    return this.nearestNeighborTSP(points, distances);
  }

  private static calculateDistanceMatrix(points: any[], startLocation: { lat: number; lng: number }) {
    const allPoints = [
      { coordinates: [startLocation.lng, startLocation.lat] },
      ...points
    ];

    const matrix: number[][] = [];
    for (let i = 0; i < allPoints.length; i++) {
      matrix[i] = [];
      for (let j = 0; j < allPoints.length; j++) {
        matrix[i][j] = geolib.getDistance(
          { latitude: allPoints[i].coordinates[1], longitude: allPoints[i].coordinates[0] },
          { latitude: allPoints[j].coordinates[1], longitude: allPoints[j].coordinates[0] }
        );
      }
    }
    return matrix;
  }

  private static nearestNeighborTSP(points: any[], distances: number[][]) {
    const visited = new Set([0]); // Start from user location
    const route = [0];
    let current = 0;

    while (visited.size < distances.length) {
      let nearest = -1;
      let minDistance = Infinity;

      for (let i = 1; i < distances.length; i++) {
        if (!visited.has(i) && distances[current][i] < minDistance) {
          minDistance = distances[current][i];
          nearest = i;
        }
      }

      if (nearest !== -1) {
        visited.add(nearest);
        route.push(nearest);
        current = nearest;
      }
    }

    return route.slice(1).map(index => points[index - 1]);
  }

  private static enrichRouteWithNavigationData(route: any[]) {
    return route.map((point, index) => ({
      ...point,
      order: index + 1,
      estimatedTravelTime: index > 0 ? this.calculateTravelTime(route[index-1], point) : 0,
      navigationInstructions: this.generateNavigationInstructions(route, index)
    }));
  }

  private static calculateTravelTime(from: any, to: any): number {
    const distance = geolib.getDistance(
      { latitude: from.coordinates[1], longitude: from.coordinates[0] },
      { latitude: to.coordinates[1], longitude: to.coordinates[0] }
    );
    // Vitesse de marche moyenne : 5 km/h
    return Math.round(distance / 1000 * 12); // en minutes
  }

  private static generateNavigationInstructions(route: any[], currentIndex: number): string {
    if (currentIndex === 0) return "Dirigez-vous vers votre première destination";
    if (currentIndex === route.length - 1) return "Dernière étape de votre parcours";
    return `Étape ${currentIndex + 1} sur ${route.length}`;
  }

  private static async getPopularAttractions(since: Date) {
    return await Attraction.find({ active: true })
      .sort({ 'analytics.totalVisits': -1 })
      .limit(10)
      .select('name analytics.totalVisits');
  }

  private static async getAudioGuideMetrics(since: Date) {
    return await AudioGuide.aggregate([
      { $match: { active: true } },
      {
        $group: {
          _id: null,
          totalPlays: { $sum: '$analytics.totalPlays' },
          averageCompletion: { $avg: '$analytics.completionRate' },
          totalGuides: { $sum: 1 }
        }
      }
    ]);
  }

  private static async calculateTrends(since: Date) {
    // Calcul des tendances sur 24h
    const [current, previous] = await Promise.all([
      UserSession.countDocuments({ startTime: { $gte: since } }),
      UserSession.countDocuments({ 
        startTime: { 
          $gte: new Date(since.getTime() - 24 * 60 * 60 * 1000),
          $lt: since
        }
      })
    ]);

    return {
      userGrowth: previous > 0 ? ((current - previous) / previous) * 100 : 0,
      period: '24h'
    };
  }
}