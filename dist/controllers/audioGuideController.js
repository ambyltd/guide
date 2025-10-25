"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getAudioGuidesByAttraction = exports.incrementDownloadCount = exports.deleteAudioGuide = exports.updateAudioGuide = exports.createAudioGuide = exports.getAudioGuideById = exports.getAllAudioGuides = void 0;
const AudioGuide_1 = require("../models/AudioGuide");
const Attraction_1 = require("../models/Attraction");
const getAllAudioGuides = async (req, res) => {
    try {
        const { attractionId, language = 'fr', limit = 20, page = 1, active = true } = req.query;
        const filter = {};
        if (attractionId) {
            filter.attractionId = attractionId;
        }
        if (language && language !== 'all') {
            filter.language = language;
        }
        if (active !== 'all') {
            filter.active = active === 'true' || active === true;
        }
        const skip = (parseInt(page) - 1) * parseInt(limit);
        const audioGuides = await AudioGuide_1.AudioGuide.find(filter)
            .skip(skip)
            .limit(parseInt(limit))
            .populate('attractionId', 'name nameEn city region')
            .sort({ rating: -1, downloadCount: -1 });
        const total = await AudioGuide_1.AudioGuide.countDocuments(filter);
        res.json({
            success: true,
            data: audioGuides,
            pagination: {
                page: parseInt(page),
                limit: parseInt(limit),
                total,
                pages: Math.ceil(total / parseInt(limit))
            }
        });
    }
    catch (error) {
        console.error('Erreur getAllAudioGuides:', error);
        res.status(500).json({
            success: false,
            message: 'Erreur lors de la récupération des guides audio',
            error: error instanceof Error ? error.message : 'Erreur inconnue'
        });
    }
};
exports.getAllAudioGuides = getAllAudioGuides;
const getAudioGuideById = async (req, res) => {
    try {
        const { id } = req.params;
        const audioGuide = await AudioGuide_1.AudioGuide.findById(id)
            .populate('attractionId', 'name nameEn description descriptionEn city region location images');
        if (!audioGuide) {
            return res.status(404).json({
                success: false,
                message: 'Guide audio non trouvé'
            });
        }
        res.json({
            success: true,
            data: audioGuide
        });
    }
    catch (error) {
        console.error('Erreur getAudioGuideById:', error);
        res.status(500).json({
            success: false,
            message: 'Erreur lors de la récupération du guide audio',
            error: error instanceof Error ? error.message : 'Erreur inconnue'
        });
    }
};
exports.getAudioGuideById = getAudioGuideById;
const createAudioGuide = async (req, res) => {
    try {
        const { title, titleEn, description, descriptionEn, attractionId, audioUrl, duration, language, transcript, transcriptEn, narrator, fileSize } = req.body;
        // Vérifier que l'attraction existe
        const attraction = await Attraction_1.Attraction.findById(attractionId);
        if (!attraction) {
            return res.status(404).json({
                success: false,
                message: 'Attraction non trouvée'
            });
        }
        const audioGuide = new AudioGuide_1.AudioGuide({
            title,
            titleEn,
            description,
            descriptionEn,
            attractionId,
            audioUrl,
            duration,
            language,
            transcript,
            transcriptEn,
            narrator,
            fileSize
        });
        await audioGuide.save();
        // Mettre à jour l'attraction avec le nouvel ID de guide audio
        await Attraction_1.Attraction.findByIdAndUpdate(attractionId, { audioGuideId: audioGuide._id });
        await audioGuide.populate('attractionId', 'name nameEn city region');
        res.status(201).json({
            success: true,
            message: 'Guide audio créé avec succès',
            data: audioGuide
        });
    }
    catch (error) {
        console.error('Erreur createAudioGuide:', error);
        res.status(500).json({
            success: false,
            message: 'Erreur lors de la création du guide audio',
            error: error instanceof Error ? error.message : 'Erreur inconnue'
        });
    }
};
exports.createAudioGuide = createAudioGuide;
const updateAudioGuide = async (req, res) => {
    try {
        const { id } = req.params;
        const updateData = req.body;
        // Si on change l'attractionId, vérifier qu'elle existe
        if (updateData.attractionId) {
            const attraction = await Attraction_1.Attraction.findById(updateData.attractionId);
            if (!attraction) {
                return res.status(404).json({
                    success: false,
                    message: 'Attraction non trouvée'
                });
            }
        }
        const audioGuide = await AudioGuide_1.AudioGuide.findByIdAndUpdate(id, updateData, { new: true, runValidators: true }).populate('attractionId', 'name nameEn city region');
        if (!audioGuide) {
            return res.status(404).json({
                success: false,
                message: 'Guide audio non trouvé'
            });
        }
        res.json({
            success: true,
            message: 'Guide audio mis à jour avec succès',
            data: audioGuide
        });
    }
    catch (error) {
        console.error('Erreur updateAudioGuide:', error);
        res.status(500).json({
            success: false,
            message: 'Erreur lors de la mise à jour du guide audio',
            error: error instanceof Error ? error.message : 'Erreur inconnue'
        });
    }
};
exports.updateAudioGuide = updateAudioGuide;
const deleteAudioGuide = async (req, res) => {
    try {
        const { id } = req.params;
        const audioGuide = await AudioGuide_1.AudioGuide.findById(id);
        if (!audioGuide) {
            return res.status(404).json({
                success: false,
                message: 'Guide audio non trouvé'
            });
        }
        // Retirer l'ID du guide audio de l'attraction
        await Attraction_1.Attraction.findByIdAndUpdate(audioGuide.attractionId, { $unset: { audioGuideId: 1 } } // ou { audioGuideId: null }
        );
        await AudioGuide_1.AudioGuide.findByIdAndDelete(id);
        res.json({
            success: true,
            message: 'Guide audio supprimé avec succès'
        });
    }
    catch (error) {
        console.error('Erreur deleteAudioGuide:', error);
        res.status(500).json({
            success: false,
            message: 'Erreur lors de la suppression du guide audio',
            error: error instanceof Error ? error.message : 'Erreur inconnue'
        });
    }
};
exports.deleteAudioGuide = deleteAudioGuide;
const incrementDownloadCount = async (req, res) => {
    try {
        const { id } = req.params;
        const audioGuide = await AudioGuide_1.AudioGuide.findByIdAndUpdate(id, { $inc: { downloadCount: 1 } }, { new: true });
        if (!audioGuide) {
            return res.status(404).json({
                success: false,
                message: 'Guide audio non trouvé'
            });
        }
        res.json({
            success: true,
            message: 'Compteur de téléchargement mis à jour',
            data: { downloadCount: audioGuide.downloadCount }
        });
    }
    catch (error) {
        console.error('Erreur incrementDownloadCount:', error);
        res.status(500).json({
            success: false,
            message: 'Erreur lors de la mise à jour du compteur',
            error: error instanceof Error ? error.message : 'Erreur inconnue'
        });
    }
};
exports.incrementDownloadCount = incrementDownloadCount;
const getAudioGuidesByAttraction = async (req, res) => {
    try {
        const { attractionId } = req.params;
        const { language = 'fr' } = req.query;
        const filter = { attractionId, active: true };
        if (language && language !== 'all') {
            filter.language = language;
        }
        const audioGuides = await AudioGuide_1.AudioGuide.find(filter)
            .sort({ rating: -1, createdAt: -1 });
        res.json({
            success: true,
            data: audioGuides
        });
    }
    catch (error) {
        console.error('Erreur getAudioGuidesByAttraction:', error);
        res.status(500).json({
            success: false,
            message: 'Erreur lors de la récupération des guides audio de l\'attraction',
            error: error instanceof Error ? error.message : 'Erreur inconnue'
        });
    }
};
exports.getAudioGuidesByAttraction = getAudioGuidesByAttraction;
