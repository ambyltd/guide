import mongoose, { Document, Schema } from 'mongoose';

export interface IReview extends Document {
  itemType: 'Attraction' | 'Tour' | 'AudioGuide';
  itemId: mongoose.Types.ObjectId;
  userId: mongoose.Types.ObjectId; // Lié au modèle User de l'app mobile
  rating: number;
  comment?: string;
  isModerated: boolean;
  active: boolean;
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
}, {
  timestamps: true
});

// Index pour récupérer rapidement les avis d'un élément
reviewSchema.index({ itemId: 1, itemType: 1 });
// Index pour s'assurer qu'un utilisateur ne note un élément qu'une seule fois
reviewSchema.index({ itemId: 1, userId: 1 }, { unique: true });

export const Review = mongoose.model<IReview>('Review', reviewSchema);
