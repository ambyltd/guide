import mongoose, { Document, Schema } from 'mongoose';

export interface IAudioGuide extends Document {
  title: string;
  titleEn: string;
  description: string;
  descriptionEn: string;
  attractionId: mongoose.Types.ObjectId;
  
  // Liaison GPS obligatoire - coordonnées liées à l'attraction
  gpsLocation: {
    type: 'Point';
    coordinates: [number, number]; // [longitude, latitude]
  };
  gpsMetadata: {
    accuracy: number;
    optimalListeningRadius: number; // Rayon optimal pour l'écoute
    triggerDistance: number; // Distance pour déclencher la lecture
    autoPlay: boolean;
    locationVerified: boolean;
    lastLocationUpdate: Date;
  };
  
  audioUrl: string;
  duration: number; // en secondes
  language: 'fr' | 'en';
  transcript: string;
  transcriptEn: string;
  narrator: string;
  fileSize: number; // en bytes
  downloadCount: number;
  rating: number;
  reviewCount: number;
  featured: boolean;
  active: boolean;
  
  // Analytics avancées pour l'audio
  analytics: {
    totalPlays: number;
    uniqueListeners: number;
    completionRate: number;
    averageListenTime: number;
    skipPoints: number[]; // Points où les utilisateurs sautent souvent
    replayPoints: number[]; // Points souvent rejoués
    popularTimeRanges: {
      start: number;
      end: number;
      playCount: number;
    }[];
    deviceBreakdown: Record<string, number>;
    locationAccuracy: {
      withinOptimalRadius: number;
      outsideRadius: number;
      averageDistance: number;
    };
    userEngagement: {
      pauseFrequency: number;
      volumeAdjustments: number;
      backgroundInterruptions: number;
    };
    lastAnalyticsUpdate: Date;
  };
  
  // Métadonnées pour machine learning
  mlFeatures: {
    contentQualityScore: number;
    narratorPopularityScore: number;
    languageComplexityScore: number;
    emotionalEngagementScore: number;
    educationalValueScore: number;
    accessibilityScore: number;
    contentTags: string[];
    recommendedAudience: string[];
  };
  
  // Configuration pour les notifications GPS
  notifications: {
    entryNotification: {
      enabled: boolean;
      message: string;
      messageEn: string;
    };
    proximityReminder: {
      enabled: boolean;
      distance: number; // en mètres
      message: string;
      messageEn: string;
    };
    completionSuggestion: {
      enabled: boolean;
      nextRecommendations: mongoose.Types.ObjectId[];
    };
  };
  
  createdAt: Date;
  updatedAt: Date;
}

const audioGuideSchema = new Schema<IAudioGuide>({
  title: { type: String, required: true },
  titleEn: { type: String, required: true },
  description: { type: String, required: true },
  descriptionEn: { type: String, required: true },
  attractionId: { type: Schema.Types.ObjectId, ref: 'Attraction', required: true },
  
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
      nextRecommendations: [{ type: Schema.Types.ObjectId, ref: 'AudioGuide' }]
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

export const AudioGuide = mongoose.model<IAudioGuide>('AudioGuide', audioGuideSchema);
