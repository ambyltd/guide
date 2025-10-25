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
const mongoose_1 = __importStar(require("mongoose"));
const FeatureFlagSchema = new mongoose_1.Schema({
    key: {
        type: String,
        required: [true, 'La clé du feature flag est obligatoire'],
        unique: true,
        lowercase: true,
        trim: true,
        match: [/^[a-z0-9_]+$/, 'La clé doit contenir uniquement des lettres minuscules, chiffres et underscores'],
        index: true,
    },
    name: {
        type: String,
        required: [true, 'Le nom du feature flag est obligatoire'],
        trim: true,
        minlength: [3, 'Le nom doit contenir au moins 3 caractères'],
        maxlength: [100, 'Le nom ne peut pas dépasser 100 caractères'],
    },
    description: {
        type: String,
        required: [true, 'La description est obligatoire'],
        trim: true,
        minlength: [10, 'La description doit contenir au moins 10 caractères'],
        maxlength: [500, 'La description ne peut pas dépasser 500 caractères'],
    },
    enabled: {
        type: Boolean,
        default: true,
        required: true,
        index: true,
    },
    requiredVersion: {
        type: String,
        required: [true, 'La version requise est obligatoire'],
        trim: true,
        match: [/^\d+\.\d+\.\d+$/, 'La version doit suivre le format semver (ex: 1.4.0)'],
    },
    category: {
        type: String,
        required: [true, 'La catégorie est obligatoire'],
        enum: {
            values: ['core', 'social', 'analytics', 'offline', 'experimental'],
            message: 'Catégorie invalide. Valeurs autorisées: core, social, analytics, offline, experimental',
        },
        index: true,
    },
    metadata: {
        type: mongoose_1.Schema.Types.Mixed,
        default: {},
    },
}, {
    timestamps: true, // Ajoute createdAt et updatedAt automatiquement
    toJSON: {
        virtuals: true,
    },
    toObject: {
        virtuals: true,
    },
});
// Index composé pour requêtes fréquentes
FeatureFlagSchema.index({ category: 1, enabled: 1 });
FeatureFlagSchema.index({ enabled: 1, updatedAt: -1 });
// Méthode virtuelle pour vérifier si une feature est active
FeatureFlagSchema.virtual('isActive').get(function () {
    return this.enabled === true;
});
// Méthode statique pour récupérer toutes les features actives
FeatureFlagSchema.statics.getActiveFeatures = function () {
    return this.find({ enabled: true }).sort({ 'metadata.priority': -1, name: 1 });
};
// Méthode statique pour récupérer les features par catégorie
FeatureFlagSchema.statics.getByCategory = function (category) {
    return this.find({ category }).sort({ enabled: -1, 'metadata.priority': -1, name: 1 });
};
// Méthode d'instance pour toggle l'état
FeatureFlagSchema.methods.toggle = function () {
    this.enabled = !this.enabled;
    return this.save();
};
// Hook pre-save pour validation des dépendances
FeatureFlagSchema.pre('save', async function (next) {
    if (this.isModified('metadata') && this.metadata && typeof this.metadata === 'object') {
        const metadata = this.metadata;
        if ('dependencies' in metadata) {
            const deps = metadata.dependencies;
            if (Array.isArray(deps) && deps.length > 0) {
                const FeatureFlagModel = this.constructor;
                const dependencies = await FeatureFlagModel.find({
                    key: { $in: deps },
                });
                if (dependencies.length !== deps.length) {
                    throw new Error('Une ou plusieurs dépendances sont invalides');
                }
            }
        }
    }
    next();
});
exports.default = mongoose_1.default.model('FeatureFlag', FeatureFlagSchema);
