import mongoose, { Schema, Document } from 'mongoose';

export interface IUserStats extends Document {
  userId: string;
  userName: string;
  attractionsVisited: number;
  audioGuidesListened: number;
  toursCompleted: number;
  totalListeningTime: number; // en secondes
  favoriteCount: number;
  reviewCount: number;
  shareCount: number; // Sprint 4 - Nombre de partages sociaux
  badges: string[];
  lastActivityAt: Date;
  createdAt: Date;
  updatedAt: Date;
}

const UserStatsSchema: Schema = new Schema(
  {
    userId: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    userName: {
      type: String,
      required: true,
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
    toursCompleted: {
      type: Number,
      default: 0,
      min: 0,
    },
    totalListeningTime: {
      type: Number,
      default: 0,
      min: 0,
    },
    favoriteCount: {
      type: Number,
      default: 0,
      min: 0,
    },
    reviewCount: {
      type: Number,
      default: 0,
      min: 0,
    },
    shareCount: {
      type: Number,
      default: 0,
      min: 0,
    },
    badges: {
      type: [String],
      default: [],
    },
    lastActivityAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.model<IUserStats>('UserStats', UserStatsSchema);
