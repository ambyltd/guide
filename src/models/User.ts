import mongoose, { Document, Schema } from 'mongoose';

export interface IUser extends Document {
  firebaseUid: string;
  email: string;
  password?: string; // Optionnel car peut être géré par Firebase
  displayName: string;
  firstName?: string;
  lastName?: string;
  phoneNumber?: string;
  nationality?: string;
  photoURL?: string;
  role: 'user' | 'admin' | 'moderator';
  preferences: {
    language: 'fr' | 'en';
    notifications: boolean;
    offlineMode: boolean;
  };
  favorites: mongoose.Types.ObjectId[];
  downloadedGuides: {
    audioGuideId: mongoose.Types.ObjectId;
    downloadedAt: Date;
  }[];
  visitHistory: {
    attractionId: mongoose.Types.ObjectId;
    visitedAt: Date;
    rating?: number;
    review?: string;
  }[];
  subscription: {
    type: 'free' | 'premium';
    expiresAt?: Date;
  };
  lastLogin?: Date;
  active: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const userSchema = new Schema<IUser>({
  firebaseUid: { type: String, required: true, unique: true },
  email: { type: String, required: true, unique: true },
  password: { type: String }, // Optionnel pour compatibilité Firebase
  displayName: { type: String, required: true },
  firstName: { type: String },
  lastName: { type: String },
  phoneNumber: { type: String },
  nationality: { type: String },
  photoURL: String,
  role: { type: String, enum: ['user', 'admin', 'moderator'], default: 'user' },
  preferences: {
    language: { type: String, enum: ['fr', 'en'], default: 'fr' },
    notifications: { type: Boolean, default: true },
    offlineMode: { type: Boolean, default: false }
  },
  favorites: [{ type: Schema.Types.ObjectId, ref: 'Attraction' }],
  downloadedGuides: [{
    audioGuideId: { type: Schema.Types.ObjectId, ref: 'AudioGuide' },
    downloadedAt: { type: Date, default: Date.now }
  }],
  visitHistory: [{
    attractionId: { type: Schema.Types.ObjectId, ref: 'Attraction' },
    visitedAt: { type: Date, default: Date.now },
    rating: { type: Number, min: 1, max: 5 },
    review: String
  }],
  subscription: {
    type: { type: String, enum: ['free', 'premium'], default: 'free' },
    expiresAt: Date
  },
  lastLogin: { type: Date },
  active: { type: Boolean, default: true }
}, {
  timestamps: true
});

// Supprimer les index dupliqués car ils sont déjà définis avec unique: true
// userSchema.index({ firebaseUid: 1 }); // Supprimé car unique: true
// userSchema.index({ email: 1 }); // Supprimé car unique: true

export const User = mongoose.model<IUser>('User', userSchema);
