"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const audioGuideController_1 = require("../controllers/audioGuideController");
const requireAdmin_1 = require("../middleware/requireAdmin");
const router = express_1.default.Router();
// Routes publiques
router.get('/', audioGuideController_1.getAllAudioGuides);
router.get('/attraction/:attractionId', audioGuideController_1.getAudioGuidesByAttraction);
router.get('/:id', audioGuideController_1.getAudioGuideById);
router.post('/:id/download', audioGuideController_1.incrementDownloadCount);
// Routes protégées (admin)
router.post('/', requireAdmin_1.requireAdmin, audioGuideController_1.createAudioGuide);
router.put('/:id', requireAdmin_1.requireAdmin, audioGuideController_1.updateAudioGuide);
router.delete('/:id', requireAdmin_1.requireAdmin, audioGuideController_1.deleteAudioGuide);
exports.default = router;
