"use strict";
/**
 * Controller QR Code
 * Gère la génération et la validation des QR codes pour les attractions
 */
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.batchGenerateQRCodes = exports.scanQRCode = exports.generateQRCode = void 0;
const qrcode_1 = __importDefault(require("qrcode"));
const mongoose_1 = __importDefault(require("mongoose"));
const Attraction_1 = require("../models/Attraction");
const AudioGuide_1 = require("../models/AudioGuide");
/**
 * POST /api/qr/generate/:attractionId
 * Génère un QR code pour une attraction
 * Format: audioguide://attraction/{attractionId}?lang={preferredLang}
 */
const generateQRCode = async (req, res) => {
    try {
        const { attractionId } = req.params;
        const { format = 'dataURL', size = 300, preferredLang = 'fr' } = req.query;
        // Valider l'ObjectId
        if (!mongoose_1.default.Types.ObjectId.isValid(attractionId)) {
            return res.status(400).json({
                success: false,
                error: 'ID d\'attraction invalide',
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
        // Format du QR code: audioguide://attraction/{id}?lang={lang}&autoplay=true
        const qrContent = `audioguide://attraction/${attractionId}?lang=${preferredLang}&autoplay=true`;
        // Options de génération selon le format
        let qrCodeData;
        if (format === 'dataURL') {
            // Data URL pour affichage direct (base64)
            const qrOptions = {
                errorCorrectionLevel: 'M',
                width: Number(size),
                margin: 2,
                color: {
                    dark: '#000000',
                    light: '#FFFFFF',
                },
            };
            qrCodeData = await qrcode_1.default.toDataURL(qrContent, qrOptions);
        }
        else if (format === 'buffer') {
            // Buffer pour téléchargement
            const qrOptions = {
                errorCorrectionLevel: 'M',
                type: 'png',
                width: Number(size),
                margin: 2,
                color: {
                    dark: '#000000',
                    light: '#FFFFFF',
                },
            };
            const buffer = await qrcode_1.default.toBuffer(qrContent, qrOptions);
            res.set('Content-Type', 'image/png');
            res.set('Content-Disposition', `attachment; filename="qr-${attraction.name.replace(/\s+/g, '-').toLowerCase()}.png"`);
            return res.send(buffer);
        }
        else if (format === 'svg') {
            // SVG vectoriel
            const qrOptions = {
                errorCorrectionLevel: 'M',
                type: 'svg',
                width: Number(size),
                margin: 2,
            };
            qrCodeData = await qrcode_1.default.toString(qrContent, qrOptions);
            res.set('Content-Type', 'image/svg+xml');
            return res.send(qrCodeData);
        }
        else {
            return res.status(400).json({
                success: false,
                error: 'Format invalide. Utilisez: dataURL, buffer, ou svg',
            });
        }
        // Réponse avec métadonnées
        res.json({
            success: true,
            data: {
                qrCode: qrCodeData,
                attractionId,
                attractionName: attraction.name,
                attractionNameEn: attraction.nameEn,
                qrContent,
                format,
                size: Number(size),
                generatedAt: new Date().toISOString(),
            },
        });
    }
    catch (error) {
        console.error('Erreur génération QR code:', error);
        res.status(500).json({
            success: false,
            error: 'Erreur serveur lors de la génération du QR code',
        });
    }
};
exports.generateQRCode = generateQRCode;
/**
 * GET /api/qr/scan
 * Valide un QR code scanné et retourne les données de l'attraction + audioguides
 * Query params: content (le contenu du QR scanné)
 */
const scanQRCode = async (req, res) => {
    try {
        const { content } = req.query;
        if (!content || typeof content !== 'string') {
            return res.status(400).json({
                success: false,
                error: 'Contenu du QR code manquant',
            });
        }
        // Parser le contenu du QR code
        // Format attendu: audioguide://attraction/{id}?lang={lang}&autoplay=true
        const qrRegex = /^audioguide:\/\/attraction\/([a-f0-9]{24})(\?.*)?$/i;
        const match = content.match(qrRegex);
        if (!match) {
            return res.status(400).json({
                success: false,
                error: 'Format de QR code invalide',
                expectedFormat: 'audioguide://attraction/{attractionId}?lang={lang}&autoplay=true',
            });
        }
        const attractionId = match[1];
        // Valider l'ObjectId
        if (!mongoose_1.default.Types.ObjectId.isValid(attractionId)) {
            return res.status(400).json({
                success: false,
                error: 'ID d\'attraction invalide dans le QR code',
            });
        }
        // Récupérer l'attraction
        const attraction = await Attraction_1.Attraction.findById(attractionId);
        if (!attraction) {
            return res.status(404).json({
                success: false,
                error: 'Attraction non trouvée',
            });
        }
        // Vérifier que l'attraction est active
        if (!attraction.active) {
            return res.status(403).json({
                success: false,
                error: 'Cette attraction n\'est pas accessible actuellement',
            });
        }
        // Récupérer les audioguides de l'attraction
        const audioGuides = await AudioGuide_1.AudioGuide.find({
            attractionId: new mongoose_1.default.Types.ObjectId(attractionId),
            active: true,
        }).select('title titleEn audioUrl duration language transcript transcriptEn narrator gpsLocation');
        // Parser les query params du QR code
        const urlParams = new URLSearchParams(match[2] || '');
        const preferredLang = urlParams.get('lang') || 'fr';
        const autoplay = urlParams.get('autoplay') === 'true';
        // Trouver l'audioguide correspondant à la langue préférée
        const defaultAudioGuide = audioGuides.find(ag => ag.language === preferredLang) || audioGuides[0];
        // Incrémenter les statistiques de scan
        await Attraction_1.Attraction.findByIdAndUpdate(attractionId, {
            $inc: { 'analytics.totalVisits': 1 },
        });
        // Réponse complète
        res.json({
            success: true,
            data: {
                attraction: {
                    _id: attraction._id,
                    name: attraction.name,
                    nameEn: attraction.nameEn,
                    description: attraction.description,
                    descriptionEn: attraction.descriptionEn,
                    category: attraction.category,
                    location: attraction.location,
                    images: attraction.images,
                    rating: attraction.rating,
                    reviewCount: attraction.reviewCount,
                },
                audioGuides,
                defaultAudioGuide,
                scanMetadata: {
                    scannedAt: new Date().toISOString(),
                    preferredLang,
                    autoplay,
                    totalAudioGuides: audioGuides.length,
                },
            },
        });
    }
    catch (error) {
        console.error('Erreur scan QR code:', error);
        res.status(500).json({
            success: false,
            error: 'Erreur serveur lors du scan du QR code',
        });
    }
};
exports.scanQRCode = scanQRCode;
/**
 * GET /api/qr/batch-generate
 * Génère les QR codes pour toutes les attractions actives
 * Pour usage CMS uniquement (requiert authentification admin)
 */
const batchGenerateQRCodes = async (req, res) => {
    try {
        const { format = 'dataURL', size = 300 } = req.query;
        // Récupérer toutes les attractions actives
        const attractions = await Attraction_1.Attraction.find({ active: true }).select('_id name nameEn');
        // Générer QR codes pour toutes les attractions
        const qrCodes = await Promise.all(attractions.map(async (attraction) => {
            const qrContent = `audioguide://attraction/${attraction._id}?lang=fr&autoplay=true`;
            let qrCode;
            if (format === 'dataURL') {
                const qrOptions = {
                    errorCorrectionLevel: 'M',
                    width: Number(size),
                    margin: 2,
                };
                qrCode = await qrcode_1.default.toDataURL(qrContent, qrOptions);
            }
            else {
                const qrOptions = {
                    errorCorrectionLevel: 'M',
                    type: 'svg',
                    width: Number(size),
                    margin: 2,
                };
                qrCode = await qrcode_1.default.toString(qrContent, qrOptions);
            }
            return {
                attractionId: attraction._id,
                attractionName: attraction.name,
                attractionNameEn: attraction.nameEn,
                qrCode,
                qrContent,
            };
        }));
        res.json({
            success: true,
            data: {
                qrCodes,
                total: qrCodes.length,
                format,
                generatedAt: new Date().toISOString(),
            },
        });
    }
    catch (error) {
        console.error('Erreur génération batch QR codes:', error);
        res.status(500).json({
            success: false,
            error: 'Erreur serveur lors de la génération batch des QR codes',
        });
    }
};
exports.batchGenerateQRCodes = batchGenerateQRCodes;
