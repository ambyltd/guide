"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const favoriteController_1 = require("../controllers/favoriteController");
const router = express_1.default.Router();
// POST /api/favorites - Ajouter un favori
router.post('/', favoriteController_1.addFavorite);
// DELETE /api/favorites/:attractionId - Supprimer un favori
router.delete('/:attractionId', favoriteController_1.removeFavorite);
// GET /api/favorites - Récupérer tous les favoris d'un utilisateur
router.get('/', favoriteController_1.getUserFavorites);
// GET /api/favorites/check/:attractionId - Vérifier si une attraction est en favori
router.get('/check/:attractionId', favoriteController_1.checkFavorite);
exports.default = router;
