import mongoose, { Document, Schema } from 'mongoose';
import { IPersonalizationProfile } from '../types/analytics';

export interface IPersonalizationProfileDoc extends IPersonalizationProfile, Document {}

const personalizationProfileSchema = new Schema<IPersonalizationProfileDoc>({
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

export const PersonalizationProfile = mongoose.model<IPersonalizationProfileDoc>('PersonalizationProfile', personalizationProfileSchema);