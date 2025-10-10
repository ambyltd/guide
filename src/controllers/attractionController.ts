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

    // Recherche géospatiale si coordonnées fournies
    if (lat !== undefined && lng !== undefined) {
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
    }

    // Recherche classique sans GPS (si pas de coordonnées ou fallback)
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
    let attractions = await Attraction.find(filter)
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
    const attraction = await Attraction.findById(req.params.id)
      .populate('audioGuideId');

    if (!attraction) {
      return res.status(404).json({
        success: false,
        message: 'Attraction non trouvée'
      });
    }

    res.json({
      success: true,
      data: attraction
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
    // Ajouter des valeurs par défaut pour les champs optionnels
    const attractionData = {
      ...req.body,
      nameEn: req.body.nameEn || req.body.name, // Utilise le nom français par défaut
      descriptionEn: req.body.descriptionEn || req.body.description, // Utilise la description française par défaut
      address: req.body.address || `${req.body.city || ''}, ${req.body.region || ''}`.trim().replace(/^,\s*|,\s*$/g, '') || 'Adresse non spécifiée',
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
    const { q, lat, lng, radius = 5000 } = req.query;

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
        { region: searchRegex }
      ]
    };

    let query = Attraction.find(filter);

    // Recherche géospatiale si coordonnées fournies
    if (lat && lng) {
      filter.location = {
        $near: {
          $geometry: {
            type: 'Point',
            coordinates: [parseFloat(lng as string), parseFloat(lat as string)]
          },
          $maxDistance: parseInt(radius as string)
        }
      };
      query = Attraction.find(filter);
    }

    const attractions = await query
      .limit(10)
      .populate('audioGuideId')
      .sort({ rating: -1 });

    res.json({
      success: true,
      data: attractions
    });
  } catch (error) {
    console.error('Erreur searchAttractions:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la recherche'
    });
  }
};
