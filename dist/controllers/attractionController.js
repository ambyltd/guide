"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.searchAttractions = exports.deleteAttraction = exports.updateAttraction = exports.createAttraction = exports.getAttractionById = exports.getAllAttractions = void 0;
const Attraction_1 = require("../models/Attraction");
const GPSService_1 = require("../services/GPSService");
const joi_1 = __importDefault(require("joi"));
const getAllAttractions = async (req, res) => {
    try {
        const schema = joi_1.default.object({
            category: joi_1.default.string().valid('museum', 'monument', 'nature', 'market', 'cultural', 'restaurant', 'religious', 'historical'),
            city: joi_1.default.string(),
            featured: joi_1.default.boolean(),
            lat: joi_1.default.number().min(-90).max(90),
            lng: joi_1.default.number().min(-180).max(180),
            radius: joi_1.default.number().min(100).max(50000).default(10000),
            limit: joi_1.default.number().min(1).max(100).default(20),
            page: joi_1.default.number().min(1).default(1),
            sortBy: joi_1.default.string().valid('distance', 'rating', 'popularity', 'created').default('featured'),
            includeAnalytics: joi_1.default.boolean().default(false),
            includeML: joi_1.default.boolean().default(false)
        });
        const { error, value } = schema.validate(req.query);
        if (error) {
            return res.status(400).json({
                success: false,
                message: 'Paramètres invalides',
                errors: error.details
            });
        }
        const { category, city, featured, lat, lng, radius, limit, page, sortBy, includeAnalytics, includeML } = value;
        const filter = { active: true };
        if (category)
            filter.category = category;
        if (city)
            filter.city = new RegExp(city, 'i');
        if (featured !== undefined)
            filter.featured = featured;
        // Recherche géospatiale si coordonnées fournies
        if (lat !== undefined && lng !== undefined) {
            const userLocation = { latitude: lat, longitude: lng, accuracy: 20, timestamp: new Date() };
            // Utilisation du service GPS avancé
            const nearbyAttractions = await GPSService_1.GPSService.findNearbyAttractions(userLocation, radius, {
                category,
                includeAudioGuides: true,
                includeAnalytics,
                sortBy: sortBy === 'featured' ? 'popularity' : sortBy,
                limit: limit * 2 // Plus de résultats pour le filtrage
            });
            // Application des filtres supplémentaires
            let filteredAttractions = nearbyAttractions;
            if (city) {
                filteredAttractions = filteredAttractions.filter(a => a.city.toLowerCase().includes(city.toLowerCase()));
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
        let sortOption = {};
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
        let attractions = await Attraction_1.Attraction.find(filter)
            .skip(skip)
            .limit(limit)
            .populate('audioGuides')
            .sort(sortOption);
        // Filtrage des champs sensibles selon les options
        const processedAttractions = attractions.map(attraction => {
            const obj = attraction.toObject();
            if (!includeAnalytics && obj.analytics) {
                delete obj.analytics;
            }
            if (!includeML && obj.mlFeatures) {
                delete obj.mlFeatures;
            }
            return obj;
        });
        const total = await Attraction_1.Attraction.countDocuments(filter);
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
    }
    catch (error) {
        console.error('Error getting attractions:', error);
        res.status(500).json({
            success: false,
            message: 'Erreur lors de la récupération des attractions'
        });
    }
};
exports.getAllAttractions = getAllAttractions;
const getAttractionById = async (req, res) => {
    try {
        const attraction = await Attraction_1.Attraction.findById(req.params.id)
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
    }
    catch (error) {
        console.error('Erreur getAttractionById:', error);
        res.status(500).json({
            success: false,
            message: 'Erreur lors de la récupération de l\'attraction'
        });
    }
};
exports.getAttractionById = getAttractionById;
const createAttraction = async (req, res) => {
    try {
        // Ajouter des valeurs par défaut pour les champs optionnels
        const attractionData = {
            ...req.body,
            nameEn: req.body.nameEn || req.body.name, // Utilise le nom français par défaut
            descriptionEn: req.body.descriptionEn || req.body.description, // Utilise la description française par défaut
            address: req.body.address || `${req.body.city || ''}, ${req.body.region || ''}`.trim().replace(/^,\s*|,\s*$/g, '') || 'Adresse non spécifiée',
        };
        const attraction = new Attraction_1.Attraction(attractionData);
        await attraction.save();
        res.status(201).json({
            success: true,
            data: attraction,
            message: 'Attraction créée avec succès'
        });
    }
    catch (error) {
        console.error('Erreur createAttraction:', error);
        res.status(400).json({
            success: false,
            message: 'Erreur lors de la création de l\'attraction'
        });
    }
};
exports.createAttraction = createAttraction;
const updateAttraction = async (req, res) => {
    try {
        const attraction = await Attraction_1.Attraction.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
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
    }
    catch (error) {
        console.error('Erreur updateAttraction:', error);
        res.status(400).json({
            success: false,
            message: 'Erreur lors de la mise à jour de l\'attraction'
        });
    }
};
exports.updateAttraction = updateAttraction;
const deleteAttraction = async (req, res) => {
    try {
        const attraction = await Attraction_1.Attraction.findByIdAndUpdate(req.params.id, { active: false }, { new: true });
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
    }
    catch (error) {
        console.error('Erreur deleteAttraction:', error);
        res.status(500).json({
            success: false,
            message: 'Erreur lors de la suppression de l\'attraction'
        });
    }
};
exports.deleteAttraction = deleteAttraction;
const searchAttractions = async (req, res) => {
    try {
        const { q, lat, lng, radius = 5000 } = req.query;
        if (!q) {
            return res.status(400).json({
                success: false,
                message: 'Terme de recherche requis'
            });
        }
        const searchRegex = new RegExp(q, 'i');
        let filter = {
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
        let query = Attraction_1.Attraction.find(filter);
        // Recherche géospatiale si coordonnées fournies
        if (lat && lng) {
            filter.location = {
                $near: {
                    $geometry: {
                        type: 'Point',
                        coordinates: [parseFloat(lng), parseFloat(lat)]
                    },
                    $maxDistance: parseInt(radius)
                }
            };
            query = Attraction_1.Attraction.find(filter);
        }
        const attractions = await query
            .limit(10)
            .populate('audioGuideId')
            .sort({ rating: -1 });
        res.json({
            success: true,
            data: attractions
        });
    }
    catch (error) {
        console.error('Erreur searchAttractions:', error);
        res.status(500).json({
            success: false,
            message: 'Erreur lors de la recherche'
        });
    }
};
exports.searchAttractions = searchAttractions;
