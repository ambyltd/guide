import { Request, Response } from 'express';
import { Attraction } from '../models/Attraction';
import { AudioGuide } from '../models/AudioGuide';
import { Tour } from '../models/Tour';
import { User } from '../models/User';

export const getStats = async (req: Request, res: Response) => {
  try {
    const [
      attractionsCount,
      audioGuidesCount,
      toursCount,
      usersCount,
      activeUsersCount,
      featuredAttractionsCount,
      featuredToursCount
    ] = await Promise.all([
      Attraction.countDocuments(),
      AudioGuide.countDocuments(),
      Tour.countDocuments(),
      User.countDocuments(),
      User.countDocuments({ active: true }),
      Attraction.countDocuments({ featured: true }),
      Tour.countDocuments({ featured: true })
    ]);

    // Statistiques par catégories d'attractions
    const attractionsByCategory = await Attraction.aggregate([
      { $group: { _id: '$category', count: { $sum: 1 } } },
      { $sort: { count: -1 } }
    ]);

    // Statistiques par catégories de tours
    const toursByCategory = await Tour.aggregate([
      { $group: { _id: '$category', count: { $sum: 1 } } },
      { $sort: { count: -1 } }
    ]);

    // Statistiques par villes
    const attractionsByCity = await Attraction.aggregate([
      { $group: { _id: '$city', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 10 }
    ]);

    // Top attractions par rating
    const topAttractions = await Attraction.find()
      .sort({ rating: -1, reviewCount: -1 })
      .limit(5)
      .select('name nameEn rating reviewCount city');

    // Top tours par rating
    const topTours = await Tour.find()
      .sort({ rating: -1 })
      .limit(5)
      .select('name nameEn rating category estimatedDuration');

    res.json({
      success: true,
      data: {
        overview: {
          attractions: attractionsCount,
          audioGuides: audioGuidesCount,
          tours: toursCount,
          users: usersCount,
          activeUsers: activeUsersCount,
          featuredAttractions: featuredAttractionsCount,
          featuredTours: featuredToursCount
        },
        categories: {
          attractions: attractionsByCategory,
          tours: toursByCategory
        },
        locations: {
          attractionsByCity
        },
        top: {
          attractions: topAttractions,
          tours: topTours
        }
      }
    });
  } catch (error) {
    console.error('Erreur getStats:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la récupération des statistiques',
      error: error instanceof Error ? error.message : 'Erreur inconnue'
    });
  }
};

export const getCategories = async (req: Request, res: Response) => {
  try {
    const { type } = req.query;

    let categories = [];

    if (type === 'attractions' || !type) {
      const attractionCategories = await Attraction.distinct('category');
      categories.push({
        type: 'attractions',
        categories: attractionCategories
      });
    }

    if (type === 'tours' || !type) {
      const tourCategories = await Tour.distinct('category');
      categories.push({
        type: 'tours',
        categories: tourCategories
      });
    }

    res.json({
      success: true,
      data: type ? categories[0]?.categories || [] : categories
    });
  } catch (error) {
    console.error('Erreur getCategories:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la récupération des catégories',
      error: error instanceof Error ? error.message : 'Erreur inconnue'
    });
  }
};

export const getCities = async (req: Request, res: Response) => {
  try {
    const cities = await Attraction.distinct('city');
    
    res.json({
      success: true,
      data: cities.sort()
    });
  } catch (error) {
    console.error('Erreur getCities:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la récupération des villes',
      error: error instanceof Error ? error.message : 'Erreur inconnue'
    });
  }
};

export const getRegions = async (req: Request, res: Response) => {
  try {
    const regions = await Attraction.distinct('region');
    
    res.json({
      success: true,
      data: regions.sort()
    });
  } catch (error) {
    console.error('Erreur getRegions:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la récupération des régions',
      error: error instanceof Error ? error.message : 'Erreur inconnue'
    });
  }
};

export const searchGlobal = async (req: Request, res: Response) => {
  try {
    const { q, limit = 10 } = req.query;

    if (!q) {
      return res.status(400).json({
        success: false,
        message: 'Terme de recherche requis'
      });
    }

    const searchRegex = new RegExp(q as string, 'i');
    const limitNum = parseInt(limit as string);

    // Recherche dans les attractions
    const attractions = await Attraction.find({
      $or: [
        { name: searchRegex },
        { nameEn: searchRegex },
        { description: searchRegex },
        { descriptionEn: searchRegex },
        { tags: { $in: [searchRegex] } }
      ]
    })
    .limit(limitNum)
    .select('name nameEn city region category images');

    // Recherche dans les tours
    const tours = await Tour.find({
      $or: [
        { name: searchRegex },
        { nameEn: searchRegex },
        { description: searchRegex },
        { descriptionEn: searchRegex },
        { tags: { $in: [searchRegex] } }
      ]
    })
    .limit(limitNum)
    .select('name nameEn category estimatedDuration difficulty');

    // Recherche dans les guides audio
    const audioGuides = await AudioGuide.find({
      $or: [
        { title: searchRegex },
        { titleEn: searchRegex },
        { description: searchRegex },
        { descriptionEn: searchRegex }
      ]
    })
    .limit(limitNum)
    .populate('attractionId', 'name nameEn city')
    .select('title titleEn duration language');

    res.json({
      success: true,
      data: {
        attractions,
        tours,
        audioGuides,
        total: attractions.length + tours.length + audioGuides.length
      }
    });
  } catch (error) {
    console.error('Erreur searchGlobal:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la recherche globale',
      error: error instanceof Error ? error.message : 'Erreur inconnue'
    });
  }
};

export const getRecommendations = async (req: Request, res: Response) => {
  try {
    const { type = 'mixed', limit = 6 } = req.query;
    const limitNum = parseInt(limit as string);

    let recommendations: any = {};

    if (type === 'attractions' || type === 'mixed') {
      // Attractions recommandées (featured + haute note)
      const featuredAttractions = await Attraction.find({ 
        featured: true, 
        active: true 
      })
      .limit(limitNum)
      .sort({ rating: -1 })
      .select('name nameEn city region category images rating reviewCount');

      recommendations.attractions = featuredAttractions;
    }

    if (type === 'tours' || type === 'mixed') {
      // Tours recommandés
      const featuredTours = await Tour.find({ 
        featured: true, 
        active: true 
      })
      .limit(limitNum)
      .sort({ rating: -1 })
      .populate('attractionIds', 'name city')
      .select('name nameEn category estimatedDuration difficulty rating');

      recommendations.tours = featuredTours;
    }

    res.json({
      success: true,
      data: recommendations
    });
  } catch (error) {
    console.error('Erreur getRecommendations:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la récupération des recommandations',
      error: error instanceof Error ? error.message : 'Erreur inconnue'
    });
  }
};
