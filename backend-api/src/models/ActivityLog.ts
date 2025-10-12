import mongoose, { Schema, Document } from 'mongoose';

/**
 * ActivityLog - Log d'actions individuelles des utilisateurs
 * Utilisé pour analytics en temps réel et tracking détaillé
 */
export interface IActivityLog extends Document {
  userId: string;
  action: 'visit' | 'listen' | 'review' | 'share' | 'favorite' | 'tour_start' | 'tour_complete';
  attractionId?: string; // Optionnel, dépend de l'action
  audioGuideId?: string; // Optionnel, pour actions 'listen'
  tourId?: string; // Optionnel, pour actions 'tour_start', 'tour_complete'
  metadata?: {
    duration?: number; // Durée d'écoute en secondes (pour 'listen')
    platform?: string; // Plateforme de partage (pour 'share')
    rating?: number; // Note donnée (pour 'review')
    [key: string]: unknown; // Métadonnées additionnelles flexibles
  };
  timestamp: Date;
  createdAt: Date;
}

const ActivityLogSchema: Schema = new Schema(
  {
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
      type: Schema.Types.Mixed,
      default: {},
    },
    timestamp: {
      type: Date,
      required: true,
      default: Date.now,
      index: true,
    },
  },
  {
    timestamps: true,
  }
);

// Index composé pour requêtes par userId et timestamp (activités récentes)
ActivityLogSchema.index({ userId: 1, timestamp: -1 });

// Index composé pour analytics par action et date
ActivityLogSchema.index({ action: 1, timestamp: -1 });

// Index pour TTL (Time To Live) - optionnel, pour auto-suppression après 90 jours
// ActivityLogSchema.index({ timestamp: 1 }, { expireAfterSeconds: 7776000 }); // 90 jours

export default mongoose.model<IActivityLog>('ActivityLog', ActivityLogSchema);
