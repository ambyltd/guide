"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.checkFavorite = exports.getUserFavorites = exports.removeFavorite = exports.addFavorite = void 0;
const Favorite_1 = __importDefault(require("../models/Favorite"));
const UserStats_1 = __importDefault(require("../models/UserStats"));
const Attraction_1 = require("../models/Attraction");
const mongoose_1 = __importDefault(require("mongoose"));
// POST /api/favorites - Ajouter un favori
const addFavorite = async (req, res) => {
    try {
        // Utiliser le userId du token Firebase (authentification requise)
        const userId = req.user?.uid;
        const { userName, attractionId } = req.body;
        if (!userId) {
            return res.status(401).json({
                success: false,
                error: 'Authentification requise',
            });
        }
        if (!attractionId) {
            return res.status(400).json({
                success: false,
                error: 'attractionId est requis',
            });
        }
        // Vérifier que l'attraction existe
        const attraction = await Attraction_1.Attraction.findById(attractionId);
        if (!attraction) {
            return res.status(404).json({
                success: false,
                error: 'Attraction non trouvée',
            });
        }
        // Créer le favori (unique index gère les doublons)
        const favorite = new Favorite_1.default({
            userId,
            attractionId,
        });
        await favorite.save();
        // Mettre à jour les stats utilisateur
        await UserStats_1.default.findOneAndUpdate({ userId }, {
            $inc: { favoriteCount: 1 },
            $set: { lastActivityAt: new Date(), userName: userName || req.user?.email || 'User' },
        }, { upsert: true, new: true });
        res.status(201).json({
            success: true,
            data: favorite,
        });
    }
    catch (error) {
        if (error.code === 11000) {
            // Doublon
            return res.status(200).json({
                success: true,
                message: 'Favori déjà existant',
            });
        }
        console.error('Erreur addFavorite:', error);
        res.status(500).json({
            success: false,
            error: 'Erreur serveur lors de l\'ajout du favori',
        });
    }
};
exports.addFavorite = addFavorite;
// DELETE /api/favorites/:attractionId - Supprimer un favori
const removeFavorite = async (req, res) => {
    try {
        const { attractionId } = req.params;
        // Utiliser le userId du token Firebase (authentification requise)
        const userId = req.user?.uid;
        if (!userId) {
            return res.status(401).json({
                success: false,
                error: 'Authentification requise',
            });
        }
        const favorite = await Favorite_1.default.findOneAndDelete({
            userId,
            attractionId: new mongoose_1.default.Types.ObjectId(attractionId),
        });
        if (!favorite) {
            return res.status(404).json({
                success: false,
                error: 'Favori non trouvé',
            });
        }
        // Mettre à jour les stats utilisateur
        await UserStats_1.default.findOneAndUpdate({ userId }, {
            $inc: { favoriteCount: -1 },
            $set: { lastActivityAt: new Date() },
        });
        res.json({
            success: true,
            message: 'Favori supprimé',
        });
    }
    catch (error) {
        console.error('Erreur removeFavorite:', error);
        res.status(500).json({
            success: false,
            error: 'Erreur serveur lors de la suppression du favori',
        });
    }
};
exports.removeFavorite = removeFavorite;
// GET /api/favorites - Récupérer tous les favoris d'un utilisateur
const getUserFavorites = async (req, res) => {
    try {
        // Utiliser le userId du token Firebase (authentification requise)
        const userId = req.user?.uid;
        if (!userId) {
            return res.status(401).json({
                success: false,
                error: 'Authentification requise',
            });
        }
        const favorites = await Favorite_1.default.find({ userId })
            .populate('attractionId')
            .sort({ createdAt: -1 });
        res.json({
            success: true,
            count: favorites.length,
            data: favorites,
        });
    }
    catch (error) {
        console.error('Erreur getUserFavorites:', error);
        res.status(500).json({
            success: false,
            error: 'Erreur serveur lors de la récupération des favoris',
        });
    }
};
exports.getUserFavorites = getUserFavorites;
// GET /api/favorites/check/:attractionId - Vérifier si une attraction est en favori
const checkFavorite = async (req, res) => {
    try {
        const { attractionId } = req.params;
        const { userId } = req.query;
        if (!userId) {
            return res.status(400).json({
                success: false,
                error: 'userId requis',
            });
        }
        const favorite = await Favorite_1.default.findOne({
            userId: userId,
            attractionId: new mongoose_1.default.Types.ObjectId(attractionId),
        });
        res.json({
            success: true,
            data: {
                isFavorite: !!favorite,
            },
        });
    }
    catch (error) {
        console.error('Erreur checkFavorite:', error);
        res.status(500).json({
            success: false,
            error: 'Erreur serveur lors de la vérification du favori',
        });
    }
};
exports.checkFavorite = checkFavorite;
