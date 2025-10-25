import mongoose, { Schema, Document } from 'mongoose';

/**
 * UserActivity - Activité quotidienne agrégée par utilisateur
 * Utilisé pour générer les tendances (trends) sur 7j/30j
 */
export interface IUserActivity extends Document {
  userId: string;
  date: Date; // Date de l'activité (ex: 2025-10-12)
  attractionsVisited: number; // Nombre d'attractions visitées ce jour
  audioGuidesListened: number; // Nombre d'audio guides écoutés ce jour
  reviewCount: number; // Nombre d'avis postés ce jour
  totalListeningTime: number; // Temps d'écoute total en secondes
  shareCount: number; // Nombre de partages sociaux ce jour
  favoriteCount: number; // Nombre de favoris ajoutés ce jour
  createdAt: Date;
  updatedAt: Date;
}

const UserActivitySchema: Schema = new Schema(
  {
    userId: {
      type: String,
      required: true,
      index: true,
    },
    date: {
      type: Date,
      required: true,
      index: true,
    },
    attractionsVisited: {
      type: Number,
      default: 0,
      min: 0,
    },
    audioGuidesListened: {
      type: Number,
      default: 0,
      min: 0,
    },
    reviewCount: {
      type: Number,
      default: 0,
      min: 0,
    },
    totalListeningTime: {
      type: Number,
      default: 0,
      min: 0,
    },
    shareCount: {
      type: Number,
      default: 0,
      min: 0,
    },
    favoriteCount: {
      type: Number,
      default: 0,
      min: 0,
    },
  },
  {
    timestamps: true,
  }
);

// Index composé pour requêtes par userId et date
UserActivitySchema.index({ userId: 1, date: -1 });

// Index pour requêtes de tendances (tri par date)
UserActivitySchema.index({ date: -1 });

export default mongoose.model<IUserActivity>('UserActivity', UserActivitySchema);
