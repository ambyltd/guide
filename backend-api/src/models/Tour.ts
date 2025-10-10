import mongoose, { Document, Schema } from 'mongoose';

export interface ITour extends Document {
  name: string;
  nameEn: string;
  description: string;
  descriptionEn: string;
  category: 'historic' | 'cultural' | 'nature' | 'culinary' | 'art';
  attractions: {
    attractionId: mongoose.Types.ObjectId;
    order: number;
    estimatedDuration: number; // durée estimée à cette attraction en minutes
    notes?: string;
  }[];
  totalDuration: number; // en minutes
  difficulty: 'easy' | 'moderate' | 'hard';
  distance: number; // en kilomètres
  startLocation: {
    type: 'Point';
    coordinates: [number, number];
  };
  endLocation: {
    type: 'Point';
    coordinates: [number, number];
  };
  price: {
    adult: number;
    child: number;
    currency: string;
  };
  images: string[];
  featured: boolean;
  rating: number;
  reviewCount: number;
  bookingCount: number;
  active: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const tourSchema = new Schema<ITour>({
  name: { type: String, required: true },
  nameEn: { type: String, required: true },
  description: { type: String, required: true },
  descriptionEn: { type: String, required: true },
  category: { 
    type: String, 
    enum: ['historic', 'cultural', 'nature', 'culinary', 'art'],
    required: true 
  },
  attractions: [{
    attractionId: { type: Schema.Types.ObjectId, ref: 'Attraction', required: true },
    order: { type: Number, required: true },
    estimatedDuration: { type: Number, required: true },
    notes: { type: String }
  }],
  totalDuration: { type: Number, required: true },
  difficulty: { type: String, enum: ['easy', 'moderate', 'hard'], default: 'easy' },
  distance: { type: Number, required: true },
  startLocation: {
    type: { type: String, enum: ['Point'], required: true },
    coordinates: { type: [Number], required: true }
  },
  endLocation: {
    type: { type: String, enum: ['Point'], required: true },
    coordinates: { type: [Number], required: true }
  },
  price: {
    adult: { type: Number, default: 0 },
    child: { type: Number, default: 0 },
    currency: { type: String, default: 'XOF' }
  },
  images: [{ type: String }],
  featured: { type: Boolean, default: false },
  rating: { type: Number, default: 0, min: 0, max: 5 },
  reviewCount: { type: Number, default: 0 },
  bookingCount: { type: Number, default: 0 },
  active: { type: Boolean, default: true }
}, {
  timestamps: true
});

tourSchema.index({ category: 1 });
tourSchema.index({ featured: -1 });
tourSchema.index({ rating: -1 });
tourSchema.index({ startLocation: '2dsphere' });

export const Tour = mongoose.model<ITour>('Tour', tourSchema);
