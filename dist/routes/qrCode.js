"use strict";
/**
 * Routes QR Code
 * Endpoints pour la génération et le scan des QR codes
 */
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const qrCodeController_1 = require("../controllers/qrCodeController");
const router = express_1.default.Router();
/**
 * POST /api/qr/generate/:attractionId
 * Génère un QR code pour une attraction
 * Query params: format (dataURL|buffer|svg), size (pixels), preferredLang (fr|en)
 */
router.post('/generate/:attractionId', qrCodeController_1.generateQRCode);
/**
 * GET /api/qr/scan
 * Valide un QR code scanné et retourne attraction + audioguides
 * Query param: content (le contenu scanné du QR code)
 */
router.get('/scan', qrCodeController_1.scanQRCode);
/**
 * GET /api/qr/batch-generate
 * Génère les QR codes pour toutes les attractions actives
 * Pour usage CMS (admin only)
 */
router.get('/batch-generate', qrCodeController_1.batchGenerateQRCodes);
exports.default = router;
