import mongoose, { Document, Schema } from 'mongoose';
import { IListeningBehavior, IGeolocation } from '../types/analytics';

export interface IListeningBehaviorDoc extends IListeningBehavior, Document {}

const listeningBehaviorSchema = new Schema<IListeningBehaviorDoc>({
  audioGuideId: { type: String, required: true },
  startTime: { type: Date, required: true },
  endTime: { type: Date },
  duration: { type: Number, required: true },
  completionPercentage: { 
    type: Number, 
    required: true, 
    min: 0, 
    max: 100 
  },
  pauseCount: { type: Number, default: 0 },
  rewindCount: { type: Number, default: 0 },
  skipCount: { type: Number, default: 0 },
  volumeChanges: { type: Number, default: 0 },
  location: {
    latitude: { type: Number, required: true },
    longitude: { type: Number, required: true },
    accuracy: { type: Number, required: true },
    altitude: { type: Number },
    speed: { type: Number },
    heading: { type: Number },
    timestamp: { type: Date, required: true }
  },
  interruptionReasons: [{ type: String }],
  qualityRating: { 
    type: Number, 
    min: 1, 
    max: 5 
  }
}, {
  timestamps: true
});

// Index pour les analyses
listeningBehaviorSchema.index({ audioGuideId: 1, startTime: -1 });
listeningBehaviorSchema.index({ completionPercentage: -1 });
listeningBehaviorSchema.index({ startTime: -1 });
listeningBehaviorSchema.index({ location: '2dsphere' });

export const ListeningBehavior = mongoose.model<IListeningBehaviorDoc>('ListeningBehavior', listeningBehaviorSchema);