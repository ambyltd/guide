"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const userStatsController_1 = require("../controllers/userStatsController");
const router = express_1.default.Router();
// GET /api/users/leaderboard - Classement des utilisateurs
router.get('/leaderboard', userStatsController_1.getLeaderboard);
// GET /api/users/:userId/stats - Récupérer les stats
router.get('/:userId/stats', userStatsController_1.getUserStats);
// PATCH /api/users/:userId/stats - Mettre à jour les stats
router.patch('/:userId/stats', userStatsController_1.updateUserStats);
// PATCH /api/users/:userId/stats/increment - Incrémenter un compteur
router.patch('/:userId/stats/increment', userStatsController_1.incrementUserStats);
// POST /api/users/:userId/stats/badge - Ajouter un badge
router.post('/:userId/stats/badge', userStatsController_1.addBadge);
exports.default = router;
