"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const attractionController_1 = require("../controllers/attractionController");
const requireAdmin_1 = require("../middleware/requireAdmin");
const router = express_1.default.Router();
// Routes publiques
router.get('/', attractionController_1.getAllAttractions);
router.get('/search', attractionController_1.searchAttractions);
router.get('/:id', attractionController_1.getAttractionById);
// Routes protégées (admin)
router.post('/', requireAdmin_1.requireAdmin, attractionController_1.createAttraction);
router.put('/:id', requireAdmin_1.requireAdmin, attractionController_1.updateAttraction);
router.delete('/:id', requireAdmin_1.requireAdmin, attractionController_1.deleteAttraction);
exports.default = router;
