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
exports.AudioGuide = void 0;
const mongoose_1 = __importStar(require("mongoose"));
const audioGuideSchema = new mongoose_1.Schema({
    title: { type: String, required: true },
    titleEn: { type: String, required: true },
    description: { type: String, required: true },
    descriptionEn: { type: String, required: true },
    attractionId: { type: mongoose_1.Schema.Types.ObjectId, ref: 'Attraction', required: true },
    // Liaison GPS obligatoire
    gpsLocation: {
        type: { type: String, enum: ['Point'], required: true },
        coordinates: { type: [Number], required: true, index: '2dsphere' }
    },
    gpsMetadata: {
        accuracy: { type: Number, default: 10 },
        optimalListeningRadius: { type: Number, default: 30 }, // 30 mètres par défaut
        triggerDistance: { type: Number, default: 50 }, // 50 mètres pour déclencher
        autoPlay: { type: Boolean, default: false },
        locationVerified: { type: Boolean, default: false },
        lastLocationUpdate: { type: Date, default: Date.now }
    },
    audioUrl: { type: String, required: true },
    duration: { type: Number, required: true },
    language: { type: String, enum: ['fr', 'en'], required: true },
    transcript: { type: String, required: true },
    transcriptEn: { type: String, required: true },
    narrator: { type: String, required: true },
    fileSize: { type: Number, required: true },
    downloadCount: { type: Number, default: 0 },
    rating: { type: Number, default: 0, min: 0, max: 5 },
    reviewCount: { type: Number, default: 0 },
    featured: { type: Boolean, default: false },
    active: { type: Boolean, default: true },
    // Analytics avancées
    analytics: {
        totalPlays: { type: Number, default: 0 },
        uniqueListeners: { type: Number, default: 0 },
        completionRate: { type: Number, default: 0 },
        averageListenTime: { type: Number, default: 0 },
        skipPoints: [{ type: Number }],
        replayPoints: [{ type: Number }],
        popularTimeRanges: [{
                start: { type: Number, required: true },
                end: { type: Number, required: true },
                playCount: { type: Number, default: 0 }
            }],
        deviceBreakdown: { type: Map, of: Number, default: {} },
        locationAccuracy: {
            withinOptimalRadius: { type: Number, default: 0 },
            outsideRadius: { type: Number, default: 0 },
            averageDistance: { type: Number, default: 0 }
        },
        userEngagement: {
            pauseFrequency: { type: Number, default: 0 },
            volumeAdjustments: { type: Number, default: 0 },
            backgroundInterruptions: { type: Number, default: 0 }
        },
        lastAnalyticsUpdate: { type: Date, default: Date.now }
    },
    // Métadonnées ML
    mlFeatures: {
        contentQualityScore: { type: Number, default: 0.5, min: 0, max: 1 },
        narratorPopularityScore: { type: Number, default: 0.5, min: 0, max: 1 },
        languageComplexityScore: { type: Number, default: 0.5, min: 0, max: 1 },
        emotionalEngagementScore: { type: Number, default: 0.5, min: 0, max: 1 },
        educationalValueScore: { type: Number, default: 0.5, min: 0, max: 1 },
        accessibilityScore: { type: Number, default: 0.5, min: 0, max: 1 },
        contentTags: [{ type: String }],
        recommendedAudience: [{ type: String }]
    },
    // Notifications GPS
    notifications: {
        entryNotification: {
            enabled: { type: Boolean, default: true },
            message: { type: String, default: 'Guide audio disponible !' },
            messageEn: { type: String, default: 'Audio guide available!' }
        },
        proximityReminder: {
            enabled: { type: Boolean, default: true },
            distance: { type: Number, default: 100 },
            message: { type: String, default: 'Approchez-vous pour écouter le guide' },
            messageEn: { type: String, default: 'Get closer to listen to the guide' }
        },
        completionSuggestion: {
            enabled: { type: Boolean, default: true },
            nextRecommendations: [{ type: mongoose_1.Schema.Types.ObjectId, ref: 'AudioGuide' }]
        }
    }
}, {
    timestamps: true
});
// Index pour les performances et recherches GPS
audioGuideSchema.index({ attractionId: 1 });
audioGuideSchema.index({ gpsLocation: '2dsphere' });
audioGuideSchema.index({ language: 1 });
audioGuideSchema.index({ rating: -1 });
audioGuideSchema.index({ 'analytics.totalPlays': -1 });
audioGuideSchema.index({ 'analytics.completionRate': -1 });
audioGuideSchema.index({ 'gpsMetadata.locationVerified': 1 });
audioGuideSchema.index({ 'mlFeatures.contentQualityScore': -1 });
// Index composés pour les requêtes avancées
audioGuideSchema.index({ attractionId: 1, language: 1 });
audioGuideSchema.index({ gpsLocation: '2dsphere', language: 1 });
audioGuideSchema.index({ featured: -1, rating: -1 });
exports.AudioGuide = mongoose_1.default.model('AudioGuide', audioGuideSchema);
