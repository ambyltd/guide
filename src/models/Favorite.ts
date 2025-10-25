import mongoose, { Schema, Document } from 'mongoose';

export interface IFavorite extends Document {
  userId: string;
  attractionId: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const FavoriteSchema: Schema = new Schema(
  {
    userId: {
      type: String,
      required: true,
      index: true,
    },
    attractionId: {
      type: Schema.Types.ObjectId,
      ref: 'Attraction',
      required: true,
      index: true,
    },
  },
  {
    timestamps: true,
  }
);

// Index composé pour éviter les doublons
FavoriteSchema.index({ userId: 1, attractionId: 1 }, { unique: true });

export default mongoose.model<IFavorite>('Favorite', FavoriteSchema);
