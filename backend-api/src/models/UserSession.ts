import mongoose, { Document, Schema } from 'mongoose';
import { IUserSession, IGeolocation, ILocationTrackingPoint, IUserInteraction, ICrashReport } from '../types/analytics';

export interface IUserSessionDoc extends IUserSession, Document {}

const geolocationSchema = new Schema<IGeolocation>({
  latitude: { type: Number, required: true },
  longitude: { type: Number, required: true },
  accuracy: { type: Number, required: true },
  altitude: { type: Number },
  speed: { type: Number },
  heading: { type: Number },
  timestamp: { type: Date, required: true }
}, { _id: false });

const locationTrackingPointSchema = new Schema<ILocationTrackingPoint>({
  latitude: { type: Number, required: true },
  longitude: { type: Number, required: true },
  accuracy: { type: Number, required: true },
  altitude: { type: Number },
  speed: { type: Number },
  heading: { type: Number },
  timestamp: { type: Date, required: true },
  distanceFromPrevious: { type: Number },
  timeFromPrevious: { type: Number },
  context: { 
    type: String, 
    enum: ['navigation', 'listening', 'exploring', 'searching'],
    required: true 
  }
}, { _id: false });

const userInteractionSchema = new Schema<IUserInteraction>({
  type: { 
    type: String, 
    enum: ['tap', 'scroll', 'swipe', 'search', 'play', 'pause', 'skip', 'favorite', 'share'],
    required: true 
  },
  target: { type: String, required: true },
  targetId: { type: String },
  coordinates: {
    x: { type: Number },
    y: { type: Number }
  },
  timestamp: { type: Date, required: true },
  context: { type: String, required: true },
  duration: { type: Number },
  metadata: { type: Schema.Types.Mixed }
}, { _id: false });

const crashReportSchema = new Schema<ICrashReport>({
  type: { 
    type: String, 
    enum: ['crash', 'error', 'warning'],
    required: true 
  },
  message: { type: String, required: true },
  stack: { type: String },
  timestamp: { type: Date, required: true },
  context: { type: Schema.Types.Mixed, required: true }
}, { _id: false });

const userSessionSchema = new Schema<IUserSessionDoc>({
  sessionId: { type: String, required: true, unique: true },
  userId: { type: String, required: true },
  startTime: { type: Date, required: true },
  endTime: { type: Date },
  duration: { type: Number },
  deviceInfo: {
    platform: { 
      type: String, 
      enum: ['ios', 'android', 'web'],
      required: true 
    },
    version: { type: String, required: true },
    userAgent: { type: String, required: true },
    screenResolution: { type: String },
    language: { type: String, required: true }
  },
  locationData: {
    startLocation: geolocationSchema,
    endLocation: geolocationSchema,
    trackingPoints: [locationTrackingPointSchema]
  },
  interactions: [userInteractionSchema],
  performance: {
    loadTime: { type: Number, required: true },
    errorCount: { type: Number, default: 0 },
    crashReports: [crashReportSchema]
  }
}, {
  timestamps: true
});

// Index pour les performances
userSessionSchema.index({ userId: 1, startTime: -1 });
userSessionSchema.index({ sessionId: 1 });
userSessionSchema.index({ 'deviceInfo.platform': 1 });
userSessionSchema.index({ startTime: -1 });
userSessionSchema.index({ 'locationData.trackingPoints.timestamp': -1 });

// Index géospatial pour les points de tracking
userSessionSchema.index({ 
  'locationData.startLocation': '2dsphere',
  'locationData.endLocation': '2dsphere' 
});

export const UserSession = mongoose.model<IUserSessionDoc>('UserSession', userSessionSchema);