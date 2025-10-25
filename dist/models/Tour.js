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
exports.Tour = void 0;
const mongoose_1 = __importStar(require("mongoose"));
const tourSchema = new mongoose_1.Schema({
    name: { type: String, required: true },
    nameEn: { type: String, required: true },
    description: { type: String, required: true },
    descriptionEn: { type: String, required: true },
    category: {
        type: String,
        enum: ['historic', 'cultural', 'nature', 'culinary', 'art'],
        required: true
    },
    attractions: [{
            attractionId: { type: mongoose_1.Schema.Types.ObjectId, ref: 'Attraction', required: true },
            order: { type: Number, required: true },
            estimatedDuration: { type: Number, required: true },
            notes: { type: String }
        }],
    totalDuration: { type: Number, required: true },
    difficulty: { type: String, enum: ['easy', 'moderate', 'hard'], default: 'easy' },
    distance: { type: Number, required: true },
    startLocation: {
        type: { type: String, enum: ['Point'], required: true },
        coordinates: { type: [Number], required: true }
    },
    endLocation: {
        type: { type: String, enum: ['Point'], required: true },
        coordinates: { type: [Number], required: true }
    },
    price: {
        adult: { type: Number, default: 0 },
        child: { type: Number, default: 0 },
        currency: { type: String, default: 'XOF' }
    },
    images: [{ type: String }],
    featured: { type: Boolean, default: false },
    rating: { type: Number, default: 0, min: 0, max: 5 },
    reviewCount: { type: Number, default: 0 },
    bookingCount: { type: Number, default: 0 },
    active: { type: Boolean, default: true }
}, {
    timestamps: true
});
tourSchema.index({ category: 1 });
tourSchema.index({ featured: -1 });
tourSchema.index({ rating: -1 });
tourSchema.index({ startLocation: '2dsphere' });
exports.Tour = mongoose_1.default.model('Tour', tourSchema);
