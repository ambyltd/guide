"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getToursByCategory = exports.getFeaturedTours = exports.searchTours = exports.deleteTour = exports.updateTour = exports.createTour = exports.getTourById = exports.getAllTours = void 0;
const Tour_1 = require("../models/Tour");
const Attraction_1 = require("../models/Attraction");
const getAllTours = async (req, res) => {
    try {
        const { category, difficulty, duration, city, featured, active = true, limit = 20, page = 1 } = req.query;
        const filter = {};
        if (category) {
            filter.category = category;
        }
        if (difficulty) {
            filter.difficulty = difficulty;
        }
        if (duration) {
            const durationNum = parseInt(duration);
            filter.estimatedDuration = { $lte: durationNum };
        }
        if (city) {
            filter.city = new RegExp(city, 'i');
        }
        if (featured !== undefined) {
            filter.featured = featured === 'true';
        }
        if (active !== 'all') {
            filter.active = active === 'true' || active === true;
        }
        const skip = (parseInt(page) - 1) * parseInt(limit);
        const tours = await Tour_1.Tour.find(filter)
            .skip(skip)
            .limit(parseInt(limit))
            .populate('attractions.attractionId', 'name nameEn city region location images')
            .sort({ featured: -1, rating: -1, createdAt: -1 });
        const total = await Tour_1.Tour.countDocuments(filter);
        res.json({
            success: true,
            data: tours,
            pagination: {
                page: parseInt(page),
                limit: parseInt(limit),
                total,
                pages: Math.ceil(total / parseInt(limit))
            }
        });
    }
    catch (error) {
        console.error('Erreur getAllTours:', error);
        res.status(500).json({
            success: false,
            message: 'Erreur lors de la récupération des circuits',
            error: error instanceof Error ? error.message : 'Erreur inconnue'
        });
    }
};
exports.getAllTours = getAllTours;
const getTourById = async (req, res) => {
    try {
        const { id } = req.params;
        const tour = await Tour_1.Tour.findById(id)
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
    }
    catch (error) {
        console.error('Erreur getTourById:', error);
        res.status(500).json({
            success: false,
            message: 'Erreur lors de la récupération du circuit',
            error: error instanceof Error ? error.message : 'Erreur inconnue'
        });
    }
};
exports.getTourById = getTourById;
const createTour = async (req, res) => {
    try {
        const { name, nameEn, description, descriptionEn, attractionIds, category, difficulty, estimatedDuration, distance, price, maxParticipants, city, region, route, highlights, highlightsEn, includes, includesEn, excludes, excludesEn, requirements, requirementsEn, tags, featured } = req.body;
        // Vérifier que toutes les attractions existent
        if (attractionIds && attractionIds.length > 0) {
            const existingAttractions = await Attraction_1.Attraction.find({
                _id: { $in: attractionIds }
            });
            if (existingAttractions.length !== attractionIds.length) {
                return res.status(400).json({
                    success: false,
                    message: 'Une ou plusieurs attractions n\'existent pas'
                });
            }
        }
        const tour = new Tour_1.Tour({
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
    }
    catch (error) {
        console.error('Erreur createTour:', error);
        res.status(500).json({
            success: false,
            message: 'Erreur lors de la création du circuit',
            error: error instanceof Error ? error.message : 'Erreur inconnue'
        });
    }
};
exports.createTour = createTour;
const updateTour = async (req, res) => {
    try {
        const { id } = req.params;
        const updateData = req.body;
        // Si on change les attractionIds, vérifier qu'elles existent
        if (updateData.attractionIds && updateData.attractionIds.length > 0) {
            const existingAttractions = await Attraction_1.Attraction.find({
                _id: { $in: updateData.attractionIds }
            });
            if (existingAttractions.length !== updateData.attractionIds.length) {
                return res.status(400).json({
                    success: false,
                    message: 'Une ou plusieurs attractions n\'existent pas'
                });
            }
        }
        const tour = await Tour_1.Tour.findByIdAndUpdate(id, updateData, { new: true, runValidators: true }).populate('attractionIds', 'name nameEn city region location');
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
    }
    catch (error) {
        console.error('Erreur updateTour:', error);
        res.status(500).json({
            success: false,
            message: 'Erreur lors de la mise à jour du circuit',
            error: error instanceof Error ? error.message : 'Erreur inconnue'
        });
    }
};
exports.updateTour = updateTour;
const deleteTour = async (req, res) => {
    try {
        const { id } = req.params;
        const tour = await Tour_1.Tour.findByIdAndDelete(id);
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
    }
    catch (error) {
        console.error('Erreur deleteTour:', error);
        res.status(500).json({
            success: false,
            message: 'Erreur lors de la suppression du circuit',
            error: error instanceof Error ? error.message : 'Erreur inconnue'
        });
    }
};
exports.deleteTour = deleteTour;
const searchTours = async (req, res) => {
    try {
        const { q, category, difficulty, maxDuration, city, limit = 20, page = 1 } = req.query;
        const filter = { active: true };
        if (q) {
            filter.$or = [
                { name: new RegExp(q, 'i') },
                { nameEn: new RegExp(q, 'i') },
                { description: new RegExp(q, 'i') },
                { descriptionEn: new RegExp(q, 'i') },
                { tags: { $in: [new RegExp(q, 'i')] } }
            ];
        }
        if (category) {
            filter.category = category;
        }
        if (difficulty) {
            filter.difficulty = difficulty;
        }
        if (maxDuration) {
            filter.estimatedDuration = { $lte: parseInt(maxDuration) };
        }
        if (city) {
            filter.city = new RegExp(city, 'i');
        }
        const skip = (parseInt(page) - 1) * parseInt(limit);
        const tours = await Tour_1.Tour.find(filter)
            .skip(skip)
            .limit(parseInt(limit))
            .populate('attractionIds', 'name nameEn city region location images')
            .sort({ featured: -1, rating: -1 });
        const total = await Tour_1.Tour.countDocuments(filter);
        res.json({
            success: true,
            data: tours,
            pagination: {
                page: parseInt(page),
                limit: parseInt(limit),
                total,
                pages: Math.ceil(total / parseInt(limit))
            }
        });
    }
    catch (error) {
        console.error('Erreur searchTours:', error);
        res.status(500).json({
            success: false,
            message: 'Erreur lors de la recherche de circuits',
            error: error instanceof Error ? error.message : 'Erreur inconnue'
        });
    }
};
exports.searchTours = searchTours;
const getFeaturedTours = async (req, res) => {
    try {
        const { limit = 6 } = req.query;
        const tours = await Tour_1.Tour.find({ featured: true, active: true })
            .limit(parseInt(limit))
            .populate('attractionIds', 'name nameEn city region location images')
            .sort({ rating: -1, createdAt: -1 });
        res.json({
            success: true,
            data: tours
        });
    }
    catch (error) {
        console.error('Erreur getFeaturedTours:', error);
        res.status(500).json({
            success: false,
            message: 'Erreur lors de la récupération des circuits mis en avant',
            error: error instanceof Error ? error.message : 'Erreur inconnue'
        });
    }
};
exports.getFeaturedTours = getFeaturedTours;
const getToursByCategory = async (req, res) => {
    try {
        const { category } = req.params;
        const { limit = 20, page = 1 } = req.query;
        const skip = (parseInt(page) - 1) * parseInt(limit);
        const tours = await Tour_1.Tour.find({ category, active: true })
            .skip(skip)
            .limit(parseInt(limit))
            .populate('attractionIds', 'name nameEn city region location images')
            .sort({ featured: -1, rating: -1 });
        const total = await Tour_1.Tour.countDocuments({ category, active: true });
        res.json({
            success: true,
            data: tours,
            pagination: {
                page: parseInt(page),
                limit: parseInt(limit),
                total,
                pages: Math.ceil(total / parseInt(limit))
            }
        });
    }
    catch (error) {
        console.error('Erreur getToursByCategory:', error);
        res.status(500).json({
            success: false,
            message: 'Erreur lors de la récupération des circuits par catégorie',
            error: error instanceof Error ? error.message : 'Erreur inconnue'
        });
    }
};
exports.getToursByCategory = getToursByCategory;
