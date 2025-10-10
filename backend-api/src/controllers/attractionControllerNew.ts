import { Request, Response } from 'express';
import { Attraction } from '../models/Attraction';
import { AudioGuide } from '../models/AudioGuide';
import { AnalyticsService } from '../services/AnalyticsService';
import { GPSService } from '../services/GPSService';
import Joi from 'joi';

export const getAllAttractions = async (req: Request, res: Response) => {
  try {
    const schema = Joi.object({
      category: Joi.string().valid('museum', 'monument', 'nature', 'market', 'cultural', 'restaurant', 'religious', 'historical'),
      city: Joi.string(),
      featured: Joi.boolean(),
      lat: Joi.number().min(-90).max(90),
      lng: Joi.number().min(-180).max(180),
      radius: Joi.number().min(100).max(50000).default(10000),
      limit: Joi.number().min(1).max(100).default(20),
      page: Joi.number().min(1).default(1),
      sortBy: Joi.string().valid('distance', 'rating', 'popularity', 'created').default('featured'),
      includeAnalytics: Joi.boolean().default(false),
      includeML: Joi.boolean().default(false)
    });

    const { error, value } = schema.validate(req.query);
    if (error) {
      return res.status(400).json({
        success: false,
        message: 'Paramètres invalides',
        errors: error.details
      });
    }

    const { 
      category, 
      city, 
      featured, 
      lat, 
      lng, 
      radius,
      limit, 
      page,
      sortBy,
      includeAnalytics,
      includeML
    } = value;

    const filter: any = { active: true };

    if (category) filter.category = category;
    if (city) filter.city = new RegExp(city, 'i');
    if (featured !== undefined) filter.featured = featured;

    let query;

    // Recherche géospatiale si coordonnées fournies
    if (lat && lng) {
      const userLocation = { latitude: lat, longitude: lng, accuracy: 20, timestamp: new Date() };
      
      // Utilisation du service GPS avancé
      const nearbyAttractions = await GPSService.findNearbyAttractions(userLocation, radius, {
        category,
        includeAudioGuides: true,
        includeAnalytics,
        sortBy: sortBy === 'featured' ? 'popularity' : sortBy,
        limit: limit * 2 // Plus de résultats pour le filtrage
      });

      // Application des filtres supplémentaires
      let filteredAttractions = nearbyAttractions;
      if (city) {
        filteredAttractions = filteredAttractions.filter(a => 
          a.city.toLowerCase().includes(city.toLowerCase())
        );
      }
      if (featured !== undefined) {
        filteredAttractions = filteredAttractions.filter(a => a.featured === featured);
      }

      // Pagination
      const skip = (page - 1) * limit;
      const paginatedAttractions = filteredAttractions.slice(skip, skip + limit);

      return res.json({
        success: true,
        data: {
          attractions: paginatedAttractions,
          pagination: {
            page,
            limit,
            total: filteredAttractions.length,
            totalPages: Math.ceil(filteredAttractions.length / limit)
          },
          gpsData: {
            userLocation: { lat, lng },
            searchRadius: radius,
            sortedBy: sortBy
          }
        }
      });
    } else {
      // Recherche classique sans GPS
      query = Attraction.find(filter);
    }

    // Application du tri
    let sortOption: any = {};
    switch (sortBy) {
      case 'rating':
        sortOption = { rating: -1, reviewCount: -1 };
        break;
      case 'popularity':
        sortOption = { 'analytics.totalVisits': -1, 'mlFeatures.popularityScore': -1 };
        break;
      case 'created':
        sortOption = { createdAt: -1 };
        break;
      default:
        sortOption = { featured: -1, rating: -1 };
    }

    const skip = (page - 1) * limit;
    let attractions = await query!
      .skip(skip)
      .limit(limit)
      .populate('audioGuides')
      .sort(sortOption);

    // Filtrage des champs sensibles selon les options
    const processedAttractions = attractions.map(attraction => {
      const obj = attraction.toObject() as any;
      
      if (!includeAnalytics && obj.analytics) {
        delete obj.analytics;
      }
      
      if (!includeML && obj.mlFeatures) {
        delete obj.mlFeatures;
      }
      
      return obj;
    });

    const total = await Attraction.countDocuments(filter);

    res.json({
      success: true,
      data: {
        attractions: processedAttractions,
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit)
        }
      }
    });

  } catch (error) {
    console.error('Error getting attractions:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la récupération des attractions'
    });
  }
};

export const getAttractionById = async (req: Request, res: Response) => {
  try {
    const { includeAnalytics = false, includeML = false } = req.query;
    
    let attraction = await Attraction.findById(req.params.id)
      .populate('audioGuides');

    if (!attraction) {
      return res.status(404).json({
        success: false,
        message: 'Attraction non trouvée'
      });
    }

    // Mise à jour des analytics de visite
    await Attraction.updateOne(
      { _id: req.params.id },
      { 
        $inc: { 'analytics.totalVisits': 1 },
        $set: { 'analytics.lastAnalyticsUpdate': new Date() }
      }
    );

    const obj = attraction.toObject() as any;
    
    if (!includeAnalytics && obj.analytics) {
      delete obj.analytics;
    }
    
    if (!includeML && obj.mlFeatures) {
      delete obj.mlFeatures;
    }

    res.json({
      success: true,
      data: obj
    });
  } catch (error) {
    console.error('Erreur getAttractionById:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la récupération de l\'attraction'
    });
  }
};

export const createAttraction = async (req: Request, res: Response) => {
  try {
    const schema = Joi.object({
      name: Joi.string().required(),
      nameEn: Joi.string(),
      description: Joi.string().required(),
      descriptionEn: Joi.string(),
      category: Joi.string().valid('museum', 'monument', 'nature', 'market', 'cultural', 'restaurant', 'religious', 'historical').required(),
      location: Joi.object({
        type: Joi.string().valid('Point').default('Point'),
        coordinates: Joi.array().items(Joi.number()).length(2).required()
      }).required(),
      gpsMetadata: Joi.object({
        accuracy: Joi.number().default(10),
        elevation: Joi.number(),
        source: Joi.string().valid('manual', 'gps', 'geocoding').default('manual'),
        verified: Joi.boolean().default(false)
      }).default({}),
      address: Joi.string(),
      city: Joi.string().required(),
      region: Joi.string().required(),
      images: Joi.array().items(Joi.string()).default([]),
      openingHours: Joi.object().default({}),
      entryFee: Joi.object({
        adult: Joi.number().default(0),
        child: Joi.number().default(0),
        student: Joi.number().default(0),
        currency: Joi.string().default('XOF')
      }).default({}),
      contact: Joi.object({
        phone: Joi.string(),
        email: Joi.string().email(),
        website: Joi.string().uri()
      }).default({}),
      featured: Joi.boolean().default(false),
      mlFeatures: Joi.object().default({}),
      geofencing: Joi.object({
        radius: Joi.number().default(50),
        entryTrigger: Joi.boolean().default(true),
        exitTrigger: Joi.boolean().default(false),
        dwellTimeTrigger: Joi.number().default(30),
        accuracyThreshold: Joi.number().default(20)
      }).default({})
    });

    const { error, value } = schema.validate(req.body);
    if (error) {
      return res.status(400).json({
        success: false,
        message: 'Données invalides',
        errors: error.details
      });
    }

    // Enrichissement automatique des données
    const attractionData = {
      ...value,
      nameEn: value.nameEn || value.name,
      descriptionEn: value.descriptionEn || value.description,
      address: value.address || `${value.city}, ${value.region}`,
      gpsMetadata: {
        ...value.gpsMetadata,
        lastUpdated: new Date()
      },
      analytics: {
        totalVisits: 0,
        uniqueVisitors: 0,
        averageVisitDuration: 0,
        popularTimeSlots: {},
        seasonalTrends: {},
        userSegments: {},
        proximityHotspots: [],
        recommendationScore: 0.5,
        contentEngagement: {
          audioGuideListens: 0,
          completionRate: 0,
          averageListenDuration: 0,
          skipRate: 0,
          replayRate: 0
        },
        lastAnalyticsUpdate: new Date()
      },
      mlFeatures: {
        popularityScore: 0.5,
        accessibilityScore: 0.5,
        photographyScore: 0.5,
        familyFriendlyScore: 0.5,
        culturalSignificanceScore: 0.5,
        crowdLevel: 'medium',
        optimalVisitDuration: 30,
        difficultyLevel: 'easy',
        tags: [],
        similarAttractions: [],
        ...value.mlFeatures
      }
    };

    const attraction = new Attraction(attractionData);
    await attraction.save();

    res.status(201).json({
      success: true,
      data: attraction,
      message: 'Attraction créée avec succès'
    });
  } catch (error) {
    console.error('Erreur createAttraction:', error);
    res.status(400).json({
      success: false,
      message: 'Erreur lors de la création de l\'attraction'
    });
  }
};

export const updateAttraction = async (req: Request, res: Response) => {
  try {
    // Mise à jour des métadonnées GPS
    if (req.body.location) {
      req.body.gpsMetadata = {
        ...req.body.gpsMetadata,
        lastUpdated: new Date()
      };
    }

    const attraction = await Attraction.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );

    if (!attraction) {
      return res.status(404).json({
        success: false,
        message: 'Attraction non trouvée'
      });
    }

    res.json({
      success: true,
      data: attraction,
      message: 'Attraction mise à jour avec succès'
    });
  } catch (error) {
    console.error('Erreur updateAttraction:', error);
    res.status(400).json({
      success: false,
      message: 'Erreur lors de la mise à jour de l\'attraction'
    });
  }
};

export const deleteAttraction = async (req: Request, res: Response) => {
  try {
    const attraction = await Attraction.findByIdAndUpdate(
      req.params.id,
      { active: false },
      { new: true }
    );

    if (!attraction) {
      return res.status(404).json({
        success: false,
        message: 'Attraction non trouvée'
      });
    }

    res.json({
      success: true,
      message: 'Attraction supprimée avec succès'
    });
  } catch (error) {
    console.error('Erreur deleteAttraction:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la suppression de l\'attraction'
    });
  }
};

export const searchAttractions = async (req: Request, res: Response) => {
  try {
    const { q, lat, lng, radius = 5000, limit = 20 } = req.query;

    if (!q) {
      return res.status(400).json({
        success: false,
        message: 'Terme de recherche requis'
      });
    }

    const searchRegex = new RegExp(q as string, 'i');
    let filter: any = {
      active: true,
      $or: [
        { name: searchRegex },
        { nameEn: searchRegex },
        { description: searchRegex },
        { descriptionEn: searchRegex },
        { category: searchRegex },
        { city: searchRegex },
        { region: searchRegex },
        { 'mlFeatures.tags': { $in: [searchRegex] } }
      ]
    };

    let attractions;

    if (lat && lng) {
      // Recherche géospatiale avec GPS
      const userLocation = { 
        latitude: parseFloat(lat as string), 
        longitude: parseFloat(lng as string), 
        accuracy: 20, 
        timestamp: new Date() 
      };
      
      const nearbyAttractions = await GPSService.findNearbyAttractions(
        userLocation, 
        parseInt(radius as string),
        { limit: parseInt(limit as string) * 2 }
      );

      // Filtrage par terme de recherche
      attractions = nearbyAttractions.filter(attraction => {
        const searchText = `${attraction.name} ${attraction.nameEn} ${attraction.description} ${attraction.category} ${attraction.city}`.toLowerCase();
        return searchText.includes((q as string).toLowerCase());
      });
    } else {
      // Recherche classique
      attractions = await Attraction.find(filter)
        .limit(parseInt(limit as string))
        .populate('audioGuides')
        .sort({ featured: -1, rating: -1 });
    }

    res.json({
      success: true,
      data: attractions,
      searchTerm: q,
      resultsCount: attractions.length
    });
  } catch (error) {
    console.error('Erreur searchAttractions:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la recherche'
    });
  }
};

export const getAttractionAnalytics = async (req: Request, res: Response) => {
  try {
    const attractionId = req.params.id;
    const { timeRange = '30d' } = req.query;

    const attraction = await Attraction.findById(attractionId);
    if (!attraction) {
      return res.status(404).json({
        success: false,
        message: 'Attraction non trouvée'
      });
    }

    // Calcul de la période d'analyse
    const now = new Date();
    const periods = {
      '24h': 24 * 60 * 60 * 1000,
      '7d': 7 * 24 * 60 * 60 * 1000,
      '30d': 30 * 24 * 60 * 60 * 1000,
      '90d': 90 * 24 * 60 * 60 * 1000
    };

    const since = new Date(now.getTime() - periods[timeRange as keyof typeof periods]);

    // Analyse des comportements d'écoute pour cette attraction
    const audioGuides = await AudioGuide.find({ attractionId });
    const analyticsPromises = audioGuides.map(guide => 
      AnalyticsService.analyzeListeningBehavior((guide._id as any).toString(), {
        start: since,
        end: now
      })
    );

    const audioGuideAnalytics = await Promise.all(analyticsPromises);

    // Analyse des patterns de géolocalisation autour de l'attraction
    const locationAnalytics = await AnalyticsService.analyzeLocationPatterns('', {
      start: since,
      end: now
    });

    res.json({
      success: true,
      data: {
        attraction: {
          id: attraction._id,
          name: attraction.name,
          analytics: attraction.analytics,
          mlFeatures: attraction.mlFeatures
        },
        timeRange,
        audioGuideAnalytics,
        locationAnalytics,
        recommendations: await generateAttractionRecommendations(attraction, audioGuideAnalytics)
      }
    });

  } catch (error) {
    console.error('Erreur getAttractionAnalytics:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la récupération des analytics'
    });
  }
};

// Fonction utilitaire pour générer des recommandations d'amélioration
async function generateAttractionRecommendations(attraction: any, audioAnalytics: any[]) {
  const recommendations = [];

  // Analyse de la complétion des guides audio
  const avgCompletion = audioAnalytics.reduce((sum, anal) => 
    sum + (anal.metrics?.averageCompletion || 0), 0) / audioAnalytics.length;

  if (avgCompletion < 0.6) {
    recommendations.push({
      type: 'content_improvement',
      priority: 'high',
      message: 'Taux de complétion faible des guides audio',
      suggestion: 'Réviser le contenu pour le rendre plus engageant'
    });
  }

  // Analyse de la popularité
  if (attraction.analytics.totalVisits < 100) {
    recommendations.push({
      type: 'visibility',
      priority: 'medium',
      message: 'Faible nombre de visites',
      suggestion: 'Améliorer le référencement et la promotion'
    });
  }

  // Analyse du géofencing
  if (attraction.analytics.proximityHotspots.length === 0) {
    recommendations.push({
      type: 'location_optimization',
      priority: 'low',
      message: 'Pas de données de proximité',
      suggestion: 'Vérifier la configuration du géofencing'
    });
  }

  return recommendations;
}