"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.errorHandler = void 0;
const errorHandler = (err, req, res, next) => {
    console.error('Error:', err);
    if (err.name === 'ValidationError') {
        return res.status(400).json({
            success: false,
            message: 'Erreur de validation',
            errors: Object.values(err.errors).map((e) => e.message)
        });
    }
    if (err.name === 'CastError') {
        return res.status(400).json({
            success: false,
            message: 'Format d\'ID invalide'
        });
    }
    if (err.code === 11000) {
        return res.status(400).json({
            success: false,
            message: 'Cette ressource existe déjà'
        });
    }
    res.status(err.statusCode || 500).json({
        success: false,
        message: err.message || 'Erreur interne du serveur'
    });
};
exports.errorHandler = errorHandler;
