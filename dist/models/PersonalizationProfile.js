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
exports.PersonalizationProfile = void 0;
const mongoose_1 = __importStar(require("mongoose"));
const personalizationProfileSchema = new mongoose_1.Schema({
    userId: { type: String, required: true, unique: true },
    preferences: {
        categories: {
            type: Map,
            of: Number,
            default: {}
        },
        timeOfDay: {
            type: Map,
            of: Number,
            default: {}
        },
        duration: {
            type: String,
            enum: ['short', 'medium', 'long'],
            default: 'medium'
        },
        language: { type: String, default: 'fr' },
        difficulty: {
            type: String,
            enum: ['easy', 'moderate', 'expert'],
            default: 'moderate'
        }
    },
    behaviorScore: {
        explorer: { type: Number, min: 0, max: 1, default: 0.5 },
        planner: { type: Number, min: 0, max: 1, default: 0.5 },
        social: { type: Number, min: 0, max: 1, default: 0.5 },
        local: { type: Number, min: 0, max: 1, default: 0.5 },
        cultural: { type: Number, min: 0, max: 1, default: 0.5 }
    },
    visitPatterns: {
        frequency: {
            type: String,
            enum: ['occasional', 'regular', 'frequent'],
            default: 'occasional'
        },
        seasonality: {
            type: Map,
            of: Number,
            default: {}
        },
        groupSize: { type: Number, default: 1 },
        repeatVisitor: { type: Boolean, default: false }
    },
    recommendations: {
        nextAttractions: [{ type: String }],
        optimalRoutes: [{ type: String }],
        personalizedContent: [{ type: String }]
    },
    lastUpdated: { type: Date, default: Date.now }
}, {
    timestamps: true
});
// Index pour les performances
personalizationProfileSchema.index({ userId: 1 });
personalizationProfileSchema.index({ lastUpdated: -1 });
personalizationProfileSchema.index({ 'behaviorScore.explorer': -1 });
personalizationProfileSchema.index({ 'visitPatterns.frequency': 1 });
exports.PersonalizationProfile = mongoose_1.default.model('PersonalizationProfile', personalizationProfileSchema);
