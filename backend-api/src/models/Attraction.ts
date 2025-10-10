import mongoose, { Document, Schema } from 'mongoose';

export interface IAttraction extends Document {
  name: string;
  nameEn?: string;
  description: string;
  descriptionEn?: string;
  category: 'museum' | 'monument' | 'nature' | 'market' | 'cultural' | 'restaurant' | 'religious' | 'historical';
  location: {
    type: 'Point';
    coordinates: [number, number]; // [longitude, latitude]
  };
  gpsMetadata: {
    accuracy: number;
    elevation?: number;
    lastUpdated: Date;
    source: 'manual' | 'gps' | 'geocoding';
    verified: boolean;
  };
  address?: string;
  city: string;
  region: string;
  images: string[];
  audioGuides: mongoose.Types.ObjectId[]; // Multiple audio guides per attraction
  audioGuideId?: mongoose.Types.ObjectId; // Backward compatibility
  openingHours: {
    monday: { open: string; close: string; closed: boolean };
    tuesday: { open: string; close: string; closed: boolean };
    wednesday: { open: string; close: string; closed: boolean };
    thursday: { open: string; close: string; closed: boolean };
    friday: { open: string; close: string; closed: boolean };
    saturday: { open: string; close: string; closed: boolean };
    sunday: { open: string; close: string; closed: boolean };
  };
  entryFee: {
    adult: number;
    child: number;
    student: number;
    currency: string;
  };
  contact: {
    phone?: string;
    email?: string;
    website?: string;
  };
  rating: number;
  reviewCount: number;
  featured: boolean;
  active: boolean;
  
  // Analytics et données avancées
  analytics: {
    totalVisits: number;
    uniqueVisitors: number;
    averageVisitDuration: number;
    popularTimeSlots: Record<string, number>;
    seasonalTrends: Record<string, number>;
    userSegments: Record<string, number>;
    proximityHotspots: {
      coordinates: [number, number];
      visitCount: number;
      averageDwellTime: number;
    }[];
    recommendationScore: number;
    contentEngagement: {
      audioGuideListens: number;
      completionRate: number;
      averageListenDuration: number;
      skipRate: number;
      replayRate: number;
    };
    lastAnalyticsUpdate: Date;
  };
  
  // Métadonnées pour machine learning
  mlFeatures: {
    popularityScore: number;
    accessibilityScore: number;
    photographyScore: number;
    familyFriendlyScore: number;
    culturalSignificanceScore: number;
    crowdLevel: 'low' | 'medium' | 'high';
    optimalVisitDuration: number;
    difficultyLevel: 'easy' | 'moderate' | 'challenging';
    tags: string[];
    similarAttractions: mongoose.Types.ObjectId[];
  };
  
  // Données de géofencing
  geofencing: {
    radius: number; // en mètres
    entryTrigger: boolean;
    exitTrigger: boolean;
    dwellTimeTrigger: number; // en secondes
    accuracyThreshold: number;
  };
  
  createdAt: Date;
  updatedAt: Date;
}

const attractionSchema = new Schema<IAttraction>({
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
  audioGuides: [{ type: Schema.Types.ObjectId, ref: 'AudioGuide' }],
  audioGuideId: { type: Schema.Types.ObjectId, ref: 'AudioGuide' }, // Backward compatibility
  openingHours: {
    type: Map,
    of: new Schema({
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
    similarAttractions: [{ type: Schema.Types.ObjectId, ref: 'Attraction' }]
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

export const Attraction = mongoose.model<IAttraction>('Attraction', attractionSchema);
