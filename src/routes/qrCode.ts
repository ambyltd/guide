/**
 * Routes QR Code
 * Endpoints pour la génération et le scan des QR codes
 */

import express from 'express';
import { generateQRCode, scanQRCode, batchGenerateQRCodes } from '../controllers/qrCodeController';

const router = express.Router();

/**
 * POST /api/qr/generate/:attractionId
 * Génère un QR code pour une attraction
 * Query params: format (dataURL|buffer|svg), size (pixels), preferredLang (fr|en)
 */
router.post('/generate/:attractionId', generateQRCode);

/**
 * GET /api/qr/scan
 * Valide un QR code scanné et retourne attraction + audioguides
 * Query param: content (le contenu scanné du QR code)
 */
router.get('/scan', scanQRCode);

/**
 * GET /api/qr/batch-generate
 * Génère les QR codes pour toutes les attractions actives
 * Pour usage CMS (admin only)
 */
router.get('/batch-generate', batchGenerateQRCodes);

export default router;
