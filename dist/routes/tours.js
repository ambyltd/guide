"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const tourController_1 = require("../controllers/tourController");
const requireAdmin_1 = require("../middleware/requireAdmin");
const router = express_1.default.Router();
// Routes publiques
router.get('/', tourController_1.getAllTours);
router.get('/search', tourController_1.searchTours);
router.get('/featured', tourController_1.getFeaturedTours);
router.get('/category/:category', tourController_1.getToursByCategory);
router.get('/:id', tourController_1.getTourById);
// Routes protégées (admin)
router.post('/', requireAdmin_1.requireAdmin, tourController_1.createTour);
router.put('/:id', requireAdmin_1.requireAdmin, tourController_1.updateTour);
router.delete('/:id', requireAdmin_1.requireAdmin, tourController_1.deleteTour);
exports.default = router;
