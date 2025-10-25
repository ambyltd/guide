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
const ActivityLogSchema = new mongoose_1.Schema({
    userId: {
        type: String,
        required: true,
        index: true,
    },
    action: {
        type: String,
        required: true,
        enum: ['visit', 'listen', 'review', 'share', 'favorite', 'tour_start', 'tour_complete'],
        index: true,
    },
    attractionId: {
        type: String,
        index: true,
    },
    audioGuideId: {
        type: String,
    },
    tourId: {
        type: String,
    },
    metadata: {
        type: mongoose_1.Schema.Types.Mixed,
        default: {},
    },
    timestamp: {
        type: Date,
        required: true,
        default: Date.now,
        index: true,
    },
}, {
    timestamps: true,
});
// Index composé pour requêtes par userId et timestamp (activités récentes)
ActivityLogSchema.index({ userId: 1, timestamp: -1 });
// Index composé pour analytics par action et date
ActivityLogSchema.index({ action: 1, timestamp: -1 });
// Index pour TTL (Time To Live) - optionnel, pour auto-suppression après 90 jours
// ActivityLogSchema.index({ timestamp: 1 }, { expireAfterSeconds: 7776000 }); // 90 jours
exports.default = mongoose_1.default.model('ActivityLog', ActivityLogSchema);
