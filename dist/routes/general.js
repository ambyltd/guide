"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const generalController_1 = require("../controllers/generalController");
const requireAdmin_1 = require("../middleware/requireAdmin");
const router = express_1.default.Router();
// Routes publiques
router.get('/search', generalController_1.searchGlobal);
router.get('/categories', generalController_1.getCategories);
router.get('/cities', generalController_1.getCities);
router.get('/regions', generalController_1.getRegions);
router.get('/recommendations', generalController_1.getRecommendations);
// Routes protégées admin
router.get('/stats', requireAdmin_1.requireAdmin, generalController_1.getStats);
exports.default = router;
