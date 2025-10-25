"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getRecommendations = exports.searchGlobal = exports.getRegions = exports.getCities = exports.getCategories = exports.getStats = void 0;
const Attraction_1 = require("../models/Attraction");
const AudioGuide_1 = require("../models/AudioGuide");
const Tour_1 = require("../models/Tour");
const User_1 = require("../models/User");
const getStats = async (req, res) => {
    try {
        const [attractionsCount, audioGuidesCount, toursCount, usersCount, activeUsersCount, featuredAttractionsCount, featuredToursCount] = await Promise.all([
            Attraction_1.Attraction.countDocuments(),
            AudioGuide_1.AudioGuide.countDocuments(),
            Tour_1.Tour.countDocuments(),
            User_1.User.countDocuments(),
            User_1.User.countDocuments({ active: true }),
            Attraction_1.Attraction.countDocuments({ featured: true }),
            Tour_1.Tour.countDocuments({ featured: true })
        ]);
        // Statistiques par catégories d'attractions
        const attractionsByCategory = await Attraction_1.Attraction.aggregate([
            { $group: { _id: '$category', count: { $sum: 1 } } },
            { $sort: { count: -1 } }
        ]);
        // Statistiques par catégories de tours
        const toursByCategory = await Tour_1.Tour.aggregate([
            { $group: { _id: '$category', count: { $sum: 1 } } },
            { $sort: { count: -1 } }
        ]);
        // Statistiques par villes
        const attractionsByCity = await Attraction_1.Attraction.aggregate([
            { $group: { _id: '$city', count: { $sum: 1 } } },
            { $sort: { count: -1 } },
            { $limit: 10 }
        ]);
        // Top attractions par rating
        const topAttractions = await Attraction_1.Attraction.find()
            .sort({ rating: -1, reviewCount: -1 })
            .limit(5)
            .select('name nameEn rating reviewCount city');
        // Top tours par rating
        const topTours = await Tour_1.Tour.find()
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
    }
    catch (error) {
        console.error('Erreur getStats:', error);
        res.status(500).json({
            success: false,
            message: 'Erreur lors de la récupération des statistiques',
            error: error instanceof Error ? error.message : 'Erreur inconnue'
        });
    }
};
exports.getStats = getStats;
const getCategories = async (req, res) => {
    try {
        const { type } = req.query;
        let categories = [];
        if (type === 'attractions' || !type) {
            const attractionCategories = await Attraction_1.Attraction.distinct('category');
            categories.push({
                type: 'attractions',
                categories: attractionCategories
            });
        }
        if (type === 'tours' || !type) {
            const tourCategories = await Tour_1.Tour.distinct('category');
            categories.push({
                type: 'tours',
                categories: tourCategories
            });
        }
        res.json({
            success: true,
            data: type ? categories[0]?.categories || [] : categories
        });
    }
    catch (error) {
        console.error('Erreur getCategories:', error);
        res.status(500).json({
            success: false,
            message: 'Erreur lors de la récupération des catégories',
            error: error instanceof Error ? error.message : 'Erreur inconnue'
        });
    }
};
exports.getCategories = getCategories;
const getCities = async (req, res) => {
    try {
        const cities = await Attraction_1.Attraction.distinct('city');
        res.json({
            success: true,
            data: cities.sort()
        });
    }
    catch (error) {
        console.error('Erreur getCities:', error);
        res.status(500).json({
            success: false,
            message: 'Erreur lors de la récupération des villes',
            error: error instanceof Error ? error.message : 'Erreur inconnue'
        });
    }
};
exports.getCities = getCities;
const getRegions = async (req, res) => {
    try {
        const regions = await Attraction_1.Attraction.distinct('region');
        res.json({
            success: true,
            data: regions.sort()
        });
    }
    catch (error) {
        console.error('Erreur getRegions:', error);
        res.status(500).json({
            success: false,
            message: 'Erreur lors de la récupération des régions',
            error: error instanceof Error ? error.message : 'Erreur inconnue'
        });
    }
};
exports.getRegions = getRegions;
const searchGlobal = async (req, res) => {
    try {
        const { q, limit = 10 } = req.query;
        if (!q) {
            return res.status(400).json({
                success: false,
                message: 'Terme de recherche requis'
            });
        }
        const searchRegex = new RegExp(q, 'i');
        const limitNum = parseInt(limit);
        // Recherche dans les attractions
        const attractions = await Attraction_1.Attraction.find({
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
        const tours = await Tour_1.Tour.find({
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
        const audioGuides = await AudioGuide_1.AudioGuide.find({
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
    }
    catch (error) {
        console.error('Erreur searchGlobal:', error);
        res.status(500).json({
            success: false,
            message: 'Erreur lors de la recherche globale',
            error: error instanceof Error ? error.message : 'Erreur inconnue'
        });
    }
};
exports.searchGlobal = searchGlobal;
const getRecommendations = async (req, res) => {
    try {
        const { type = 'mixed', limit = 6 } = req.query;
        const limitNum = parseInt(limit);
        let recommendations = {};
        if (type === 'attractions' || type === 'mixed') {
            // Attractions recommandées (featured + haute note)
            const featuredAttractions = await Attraction_1.Attraction.find({
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
            const featuredTours = await Tour_1.Tour.find({
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
    }
    catch (error) {
        console.error('Erreur getRecommendations:', error);
        res.status(500).json({
            success: false,
            message: 'Erreur lors de la récupération des recommandations',
            error: error instanceof Error ? error.message : 'Erreur inconnue'
        });
    }
};
exports.getRecommendations = getRecommendations;
