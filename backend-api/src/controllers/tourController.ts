import { Request, Response } from 'express';
import { Tour } from '../models/Tour';
import { Attraction } from '../models/Attraction';

export const getAllTours = async (req: Request, res: Response) => {
  try {
    const { 
      category,
      difficulty,
      duration,
      city,
      featured,
      active = true,
      limit = 20, 
      page = 1 
    } = req.query;

    const filter: any = {};
    
    if (category) {
      filter.category = category;
    }
    
    if (difficulty) {
      filter.difficulty = difficulty;
    }
    
    if (duration) {
      const durationNum = parseInt(duration as string);
      filter.estimatedDuration = { $lte: durationNum };
    }
    
    if (city) {
      filter.city = new RegExp(city as string, 'i');
    }
    
    if (featured !== undefined) {
      filter.featured = featured === 'true';
    }
    
    if (active !== 'all') {
      filter.active = active === 'true' || active === true;
    }

    const skip = (parseInt(page as string) - 1) * parseInt(limit as string);
    const tours = await Tour.find(filter)
      .skip(skip)
      .limit(parseInt(limit as string))
      .populate('attractions.attractionId', 'name nameEn city region location images')
      .sort({ featured: -1, rating: -1, createdAt: -1 });

    const total = await Tour.countDocuments(filter);

    res.json({
      success: true,
      data: tours,
      pagination: {
        page: parseInt(page as string),
        limit: parseInt(limit as string),
        total,
        pages: Math.ceil(total / parseInt(limit as string))
      }
    });
  } catch (error) {
    console.error('Erreur getAllTours:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la récupération des circuits',
      error: error instanceof Error ? error.message : 'Erreur inconnue'
    });
  }
};

export const getTourById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const tour = await Tour.findById(id)
      .populate('attractions.attractionId', 'name nameEn description descriptionEn city region location images openingHours entryFee');

    if (!tour) {
      return res.status(404).json({
        success: false,
        message: 'Circuit non trouvé'
      });
    }

    res.json({
      success: true,
      data: tour
    });
  } catch (error) {
    console.error('Erreur getTourById:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la récupération du circuit',
      error: error instanceof Error ? error.message : 'Erreur inconnue'
    });
  }
};

export const createTour = async (req: Request, res: Response) => {
  try {
    const {
      name,
      nameEn,
      description,
      descriptionEn,
      attractionIds,
      category,
      difficulty,
      estimatedDuration,
      distance,
      price,
      maxParticipants,
      city,
      region,
      route,
      highlights,
      highlightsEn,
      includes,
      includesEn,
      excludes,
      excludesEn,
      requirements,
      requirementsEn,
      tags,
      featured
    } = req.body;

    // Vérifier que toutes les attractions existent
    if (attractionIds && attractionIds.length > 0) {
      const existingAttractions = await Attraction.find({ 
        _id: { $in: attractionIds } 
      });
      
      if (existingAttractions.length !== attractionIds.length) {
        return res.status(400).json({
          success: false,
          message: 'Une ou plusieurs attractions n\'existent pas'
        });
      }
    }

    const tour = new Tour({
      name,
      nameEn,
      description,
      descriptionEn,
      attractionIds: attractionIds || [],
      category,
      difficulty,
      estimatedDuration,
      distance,
      price,
      maxParticipants,
      city,
      region,
      route,
      highlights,
      highlightsEn,
      includes,
      includesEn,
      excludes,
      excludesEn,
      requirements,
      requirementsEn,
      tags: tags || [],
      featured: featured || false
    });

    await tour.save();
    await tour.populate('attractionIds', 'name nameEn city region location');

    res.status(201).json({
      success: true,
      message: 'Circuit créé avec succès',
      data: tour
    });
  } catch (error) {
    console.error('Erreur createTour:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la création du circuit',
      error: error instanceof Error ? error.message : 'Erreur inconnue'
    });
  }
};

export const updateTour = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    // Si on change les attractionIds, vérifier qu'elles existent
    if (updateData.attractionIds && updateData.attractionIds.length > 0) {
      const existingAttractions = await Attraction.find({ 
        _id: { $in: updateData.attractionIds } 
      });
      
      if (existingAttractions.length !== updateData.attractionIds.length) {
        return res.status(400).json({
          success: false,
          message: 'Une ou plusieurs attractions n\'existent pas'
        });
      }
    }

    const tour = await Tour.findByIdAndUpdate(
      id,
      updateData,
      { new: true, runValidators: true }
    ).populate('attractionIds', 'name nameEn city region location');

    if (!tour) {
      return res.status(404).json({
        success: false,
        message: 'Circuit non trouvé'
      });
    }

    res.json({
      success: true,
      message: 'Circuit mis à jour avec succès',
      data: tour
    });
  } catch (error) {
    console.error('Erreur updateTour:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la mise à jour du circuit',
      error: error instanceof Error ? error.message : 'Erreur inconnue'
    });
  }
};

export const deleteTour = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    
    const tour = await Tour.findByIdAndDelete(id);
    if (!tour) {
      return res.status(404).json({
        success: false,
        message: 'Circuit non trouvé'
      });
    }

    res.json({
      success: true,
      message: 'Circuit supprimé avec succès'
    });
  } catch (error) {
    console.error('Erreur deleteTour:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la suppression du circuit',
      error: error instanceof Error ? error.message : 'Erreur inconnue'
    });
  }
};

export const searchTours = async (req: Request, res: Response) => {
  try {
    const { q, category, difficulty, maxDuration, city, limit = 20, page = 1 } = req.query;
    
    const filter: any = { active: true };
    
    if (q) {
      filter.$or = [
        { name: new RegExp(q as string, 'i') },
        { nameEn: new RegExp(q as string, 'i') },
        { description: new RegExp(q as string, 'i') },
        { descriptionEn: new RegExp(q as string, 'i') },
        { tags: { $in: [new RegExp(q as string, 'i')] } }
      ];
    }
    
    if (category) {
      filter.category = category;
    }
    
    if (difficulty) {
      filter.difficulty = difficulty;
    }
    
    if (maxDuration) {
      filter.estimatedDuration = { $lte: parseInt(maxDuration as string) };
    }
    
    if (city) {
      filter.city = new RegExp(city as string, 'i');
    }

    const skip = (parseInt(page as string) - 1) * parseInt(limit as string);
    const tours = await Tour.find(filter)
      .skip(skip)
      .limit(parseInt(limit as string))
      .populate('attractionIds', 'name nameEn city region location images')
      .sort({ featured: -1, rating: -1 });

    const total = await Tour.countDocuments(filter);

    res.json({
      success: true,
      data: tours,
      pagination: {
        page: parseInt(page as string),
        limit: parseInt(limit as string),
        total,
        pages: Math.ceil(total / parseInt(limit as string))
      }
    });
  } catch (error) {
    console.error('Erreur searchTours:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la recherche de circuits',
      error: error instanceof Error ? error.message : 'Erreur inconnue'
    });
  }
};

export const getFeaturedTours = async (req: Request, res: Response) => {
  try {
    const { limit = 6 } = req.query;
    
    const tours = await Tour.find({ featured: true, active: true })
      .limit(parseInt(limit as string))
      .populate('attractionIds', 'name nameEn city region location images')
      .sort({ rating: -1, createdAt: -1 });

    res.json({
      success: true,
      data: tours
    });
  } catch (error) {
    console.error('Erreur getFeaturedTours:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la récupération des circuits mis en avant',
      error: error instanceof Error ? error.message : 'Erreur inconnue'
    });
  }
};

export const getToursByCategory = async (req: Request, res: Response) => {
  try {
    const { category } = req.params;
    const { limit = 20, page = 1 } = req.query;
    
    const skip = (parseInt(page as string) - 1) * parseInt(limit as string);
    const tours = await Tour.find({ category, active: true })
      .skip(skip)
      .limit(parseInt(limit as string))
      .populate('attractionIds', 'name nameEn city region location images')
      .sort({ featured: -1, rating: -1 });

    const total = await Tour.countDocuments({ category, active: true });

    res.json({
      success: true,
      data: tours,
      pagination: {
        page: parseInt(page as string),
        limit: parseInt(limit as string),
        total,
        pages: Math.ceil(total / parseInt(limit as string))
      }
    });
  } catch (error) {
    console.error('Erreur getToursByCategory:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la récupération des circuits par catégorie',
      error: error instanceof Error ? error.message : 'Erreur inconnue'
    });
  }
};
