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
exports.Attraction = void 0;
const mongoose_1 = __importStar(require("mongoose"));
const attractionSchema = new mongoose_1.Schema({
    name: { type: String, required: true },
    nameEn: { type: String },
    description: { type: String, required: true },
    descriptionEn: { type: String },
    category: {
        type: String,
        enum: ['museum', 'monument', 'nature', 'market', 'cultural', 'restaurant', 'religious', 'historical'],
        required: true
    },
    location: {
        type: { type: String, enum: ['Point'], required: true },
        coordinates: { type: [Number], required: true, index: '2dsphere' }
    },
    gpsMetadata: {
        accuracy: { type: Number, required: true, default: 10 },
        elevation: { type: Number },
        lastUpdated: { type: Date, default: Date.now },
        source: {
            type: String,
            enum: ['manual', 'gps', 'geocoding'],
            default: 'manual'
        },
        verified: { type: Boolean, default: false }
    },
    address: { type: String },
    city: { type: String, required: true },
    region: { type: String, required: true },
    images: [{ type: String }],
    audioGuides: [{ type: mongoose_1.Schema.Types.ObjectId, ref: 'AudioGuide' }],
    audioGuideId: { type: mongoose_1.Schema.Types.ObjectId, ref: 'AudioGuide' }, // Backward compatibility
    openingHours: {
        type: Map,
        of: new mongoose_1.Schema({
            open: String,
            close: String,
            closed: Boolean
        }),
        default: {}
    },
    entryFee: {
        adult: { type: Number, default: 0 },
        child: { type: Number, default: 0 },
        student: { type: Number, default: 0 },
        currency: { type: String, default: 'XOF' }
    },
    contact: {
        phone: String,
        email: String,
        website: String
    },
    rating: { type: Number, default: 0, min: 0, max: 5 },
    reviewCount: { type: Number, default: 0 },
    featured: { type: Boolean, default: false },
    active: { type: Boolean, default: true },
    // Analytics et données avancées
    analytics: {
        totalVisits: { type: Number, default: 0 },
        uniqueVisitors: { type: Number, default: 0 },
        averageVisitDuration: { type: Number, default: 0 },
        popularTimeSlots: { type: Map, of: Number, default: {} },
        seasonalTrends: { type: Map, of: Number, default: {} },
        userSegments: { type: Map, of: Number, default: {} },
        proximityHotspots: [{
                coordinates: { type: [Number], required: true },
                visitCount: { type: Number, default: 0 },
                averageDwellTime: { type: Number, default: 0 }
            }],
        recommendationScore: { type: Number, default: 0.5, min: 0, max: 1 },
        contentEngagement: {
            audioGuideListens: { type: Number, default: 0 },
            completionRate: { type: Number, default: 0 },
            averageListenDuration: { type: Number, default: 0 },
            skipRate: { type: Number, default: 0 },
            replayRate: { type: Number, default: 0 }
        },
        lastAnalyticsUpdate: { type: Date, default: Date.now }
    },
    // Métadonnées pour machine learning
    mlFeatures: {
        popularityScore: { type: Number, default: 0.5, min: 0, max: 1 },
        accessibilityScore: { type: Number, default: 0.5, min: 0, max: 1 },
        photographyScore: { type: Number, default: 0.5, min: 0, max: 1 },
        familyFriendlyScore: { type: Number, default: 0.5, min: 0, max: 1 },
        culturalSignificanceScore: { type: Number, default: 0.5, min: 0, max: 1 },
        crowdLevel: {
            type: String,
            enum: ['low', 'medium', 'high'],
            default: 'medium'
        },
        optimalVisitDuration: { type: Number, default: 30 }, // en minutes
        difficultyLevel: {
            type: String,
            enum: ['easy', 'moderate', 'challenging'],
            default: 'easy'
        },
        tags: [{ type: String }],
        similarAttractions: [{ type: mongoose_1.Schema.Types.ObjectId, ref: 'Attraction' }]
    },
    // Données de géofencing
    geofencing: {
        radius: { type: Number, default: 50 }, // en mètres
        entryTrigger: { type: Boolean, default: true },
        exitTrigger: { type: Boolean, default: false },
        dwellTimeTrigger: { type: Number, default: 30 }, // en secondes
        accuracyThreshold: { type: Number, default: 20 } // en mètres
    }
}, {
    timestamps: true
});
// Index géospatial pour les recherches par proximité
attractionSchema.index({ location: '2dsphere' });
attractionSchema.index({ category: 1 });
attractionSchema.index({ featured: -1 });
attractionSchema.index({ rating: -1 });
attractionSchema.index({ 'analytics.totalVisits': -1 });
attractionSchema.index({ 'analytics.recommendationScore': -1 });
attractionSchema.index({ 'mlFeatures.popularityScore': -1 });
attractionSchema.index({ 'mlFeatures.crowdLevel': 1 });
attractionSchema.index({ 'gpsMetadata.verified': 1 });
attractionSchema.index({ 'gpsMetadata.lastUpdated': -1 });
// Index composés pour les requêtes avancées
attractionSchema.index({ category: 1, 'mlFeatures.popularityScore': -1 });
attractionSchema.index({ city: 1, rating: -1 });
attractionSchema.index({ location: '2dsphere', category: 1 });
exports.Attraction = mongoose_1.default.model('Attraction', attractionSchema);
