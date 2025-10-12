import mongoose, { Document, Schema } from 'mongoose';

export interface IReview extends Document {
  itemType: 'Attraction' | 'Tour' | 'AudioGuide';
  itemId: mongoose.Types.ObjectId;
  userId: mongoose.Types.ObjectId; // Lié au modèle User de l'app mobile
  rating: number;
  comment?: string;
  isModerated: boolean;
  active: boolean;
  // 🚀 SPRINT 4: Modération avancée
  moderationStatus: 'pending' | 'approved' | 'rejected';
  moderatedBy?: mongoose.Types.ObjectId; // Admin qui a modéré
  moderatedAt?: Date;
  moderationReason?: string; // Raison du rejet
  reportCount: number; // Nombre de signalements
  reportReasons: string[]; // Raisons des signalements
  reportedBy: mongoose.Types.ObjectId[]; // IDs des utilisateurs ayant signalé
  helpfulCount: number; // Nombre de "utile"
  helpfulBy: mongoose.Types.ObjectId[]; // IDs des utilisateurs ayant trouvé utile
  language: string; // Langue du commentaire (fr, en, etc.)
  createdAt: Date;
  updatedAt: Date;
}

const reviewSchema = new Schema<IReview>({
  itemType: { 
    type: String, 
    required: true, 
    enum: ['Attraction', 'Tour', 'AudioGuide'] 
  },
  itemId: { 
    type: Schema.Types.ObjectId, 
    required: true, 
    refPath: 'itemType' // Référence dynamique au modèle basé sur itemType
  },
  userId: { 
    type: Schema.Types.ObjectId, 
    ref: 'User', // Assurez-vous d'avoir un modèle User pour les utilisateurs mobiles
    required: true 
  },
  rating: { 
    type: Number, 
    required: true, 
    min: 1, 
    max: 5 
  },
  comment: { 
    type: String 
  },
  isModerated: {
    type: Boolean,
    default: false
  },
  active: {
    type: Boolean,
    default: true
  },
  // 🚀 SPRINT 4: Modération avancée
  moderationStatus: {
    type: String,
    enum: ['pending', 'approved', 'rejected'],
    default: 'approved' // Auto-approuvé par défaut (peut être changé en 'pending' si modération stricte)
  },
  moderatedBy: {
    type: Schema.Types.ObjectId,
    ref: 'User'
  },
  moderatedAt: {
    type: Date
  },
  moderationReason: {
    type: String
  },
  reportCount: {
    type: Number,
    default: 0
  },
  reportReasons: [{
    type: String
  }],
  reportedBy: [{
    type: Schema.Types.ObjectId,
    ref: 'User'
  }],
  helpfulCount: {
    type: Number,
    default: 0
  },
  helpfulBy: [{
    type: Schema.Types.ObjectId,
    ref: 'User'
  }],
  language: {
    type: String,
    default: 'fr'
  },
}, {
  timestamps: true
});

// Index pour récupérer rapidement les avis d'un élément
reviewSchema.index({ itemId: 1, itemType: 1 });
// Index pour s'assurer qu'un utilisateur ne note un élément qu'une seule fois
reviewSchema.index({ itemId: 1, userId: 1 }, { unique: true });

export const Review = mongoose.model<IReview>('Review', reviewSchema);
