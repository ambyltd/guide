"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.Review = void 0;
const mongoose_1 = __importStar(require("mongoose"));
const reviewSchema = new mongoose_1.Schema({
    itemType: {
        type: String,
        required: true,
        enum: ['Attraction', 'Tour', 'AudioGuide']
    },
    itemId: {
        type: mongoose_1.Schema.Types.ObjectId,
        required: true,
        refPath: 'itemType' // Référence dynamique au modèle basé sur itemType
    },
    userId: {
        type: mongoose_1.Schema.Types.Mixed, // ✅ Accepte ObjectId ou String
        required: true
    },
    userName: {
        type: String // Nom de l'utilisateur (dénormalisé depuis Firebase)
    },
    userAvatar: {
        type: String // URL avatar de l'utilisateur (dénormalisé depuis Firebase)
    },
    rating: {
        type: Number,
        required: true,
        min: 1,
        max: 5
    },
    comment: {
        type: String
    },
    isModerated: {
        type: Boolean,
        default: false
    },
    active: {
        type: Boolean,
        default: true
    },
    // 🚀 SPRINT 4: Modération avancée
    moderationStatus: {
        type: String,
        enum: ['pending', 'approved', 'rejected'],
        default: 'approved' // Auto-approuvé par défaut (peut être changé en 'pending' si modération stricte)
    },
    moderatedBy: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: 'User'
    },
    moderatedAt: {
        type: Date
    },
    moderationReason: {
        type: String
    },
    reportCount: {
        type: Number,
        default: 0
    },
    reportReasons: [{
            type: String
        }],
    reportedBy: [{
            type: mongoose_1.Schema.Types.ObjectId,
            ref: 'User'
        }],
    helpfulCount: {
        type: Number,
        default: 0
    },
    helpfulBy: [{
            type: mongoose_1.Schema.Types.ObjectId,
            ref: 'User'
        }],
    language: {
        type: String,
        default: 'fr'
    },
}, {
    timestamps: true
});
// Index pour récupérer rapidement les avis d'un élément
reviewSchema.index({ itemId: 1, itemType: 1 });
// Index pour s'assurer qu'un utilisateur ne note un élément qu'une seule fois
reviewSchema.index({ itemId: 1, userId: 1 }, { unique: true });
exports.Review = mongoose_1.default.model('Review', reviewSchema);
