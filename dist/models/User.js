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
exports.User = void 0;
const mongoose_1 = __importStar(require("mongoose"));
const userSchema = new mongoose_1.Schema({
    firebaseUid: { type: String, required: true, unique: true },
    email: { type: String, required: true, unique: true },
    password: { type: String }, // Optionnel pour compatibilité Firebase
    displayName: { type: String, required: true },
    firstName: { type: String },
    lastName: { type: String },
    phoneNumber: { type: String },
    nationality: { type: String },
    photoURL: String,
    role: { type: String, enum: ['user', 'admin', 'moderator'], default: 'user' },
    preferences: {
        language: { type: String, enum: ['fr', 'en'], default: 'fr' },
        notifications: { type: Boolean, default: true },
        offlineMode: { type: Boolean, default: false }
    },
    favorites: [{ type: mongoose_1.Schema.Types.ObjectId, ref: 'Attraction' }],
    downloadedGuides: [{
            audioGuideId: { type: mongoose_1.Schema.Types.ObjectId, ref: 'AudioGuide' },
            downloadedAt: { type: Date, default: Date.now }
        }],
    visitHistory: [{
            attractionId: { type: mongoose_1.Schema.Types.ObjectId, ref: 'Attraction' },
            visitedAt: { type: Date, default: Date.now },
            rating: { type: Number, min: 1, max: 5 },
            review: String
        }],
    subscription: {
        type: { type: String, enum: ['free', 'premium'], default: 'free' },
        expiresAt: Date
    },
    lastLogin: { type: Date },
    active: { type: Boolean, default: true }
}, {
    timestamps: true
});
// Supprimer les index dupliqués car ils sont déjà définis avec unique: true
// userSchema.index({ firebaseUid: 1 }); // Supprimé car unique: true
// userSchema.index({ email: 1 }); // Supprimé car unique: true
exports.User = mongoose_1.default.model('User', userSchema);
