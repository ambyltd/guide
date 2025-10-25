import mongoose, { Schema, Document } from 'mongoose';

/**
 * Interface pour un Feature Flag (activation/désactivation de fonctionnalités)
 */
export interface IFeatureFlag extends Document {
  key: string; // Clé unique (ex: 'social_sharing', 'geofencing')
  name: string; // Nom affiché dans le CMS
  description: string; // Description de la fonctionnalité
  enabled: boolean; // Activé ou désactivé
  requiredVersion: string; // Version minimale de l'app mobile (ex: '1.4.0')
  category: 'core' | 'social' | 'analytics' | 'offline' | 'experimental'; // Catégorie
  metadata?: {
    icon?: string; // Icône Material-UI (ex: 'ShareIcon')
    color?: string; // Couleur (ex: '#FF6B6B')
    priority?: number; // Ordre d'affichage (1 = haute priorité)
    dependencies?: string[]; // Dépendances (keys d'autres features)
    [key: string]: any;
  };
  createdAt: Date;
  updatedAt: Date;
}

const FeatureFlagSchema: Schema = new Schema(
  {
    key: {
      type: String,
      required: [true, 'La clé du feature flag est obligatoire'],
      unique: true,
      lowercase: true,
      trim: true,
      match: [/^[a-z0-9_]+$/, 'La clé doit contenir uniquement des lettres minuscules, chiffres et underscores'],
      index: true,
    },
    name: {
      type: String,
      required: [true, 'Le nom du feature flag est obligatoire'],
      trim: true,
      minlength: [3, 'Le nom doit contenir au moins 3 caractères'],
      maxlength: [100, 'Le nom ne peut pas dépasser 100 caractères'],
    },
    description: {
      type: String,
      required: [true, 'La description est obligatoire'],
      trim: true,
      minlength: [10, 'La description doit contenir au moins 10 caractères'],
      maxlength: [500, 'La description ne peut pas dépasser 500 caractères'],
    },
    enabled: {
      type: Boolean,
      default: true,
      required: true,
      index: true,
    },
    requiredVersion: {
      type: String,
      required: [true, 'La version requise est obligatoire'],
      trim: true,
      match: [/^\d+\.\d+\.\d+$/, 'La version doit suivre le format semver (ex: 1.4.0)'],
    },
    category: {
      type: String,
      required: [true, 'La catégorie est obligatoire'],
      enum: {
        values: ['core', 'social', 'analytics', 'offline', 'experimental'],
        message: 'Catégorie invalide. Valeurs autorisées: core, social, analytics, offline, experimental',
      },
      index: true,
    },
    metadata: {
      type: Schema.Types.Mixed,
      default: {},
    },
  },
  {
    timestamps: true, // Ajoute createdAt et updatedAt automatiquement
    toJSON: {
      virtuals: true,
    },
    toObject: {
      virtuals: true,
    },
  }
);

// Index composé pour requêtes fréquentes
FeatureFlagSchema.index({ category: 1, enabled: 1 });
FeatureFlagSchema.index({ enabled: 1, updatedAt: -1 });

// Méthode virtuelle pour vérifier si une feature est active
FeatureFlagSchema.virtual('isActive').get(function (this: IFeatureFlag) {
  return this.enabled === true;
});

// Méthode statique pour récupérer toutes les features actives
FeatureFlagSchema.statics.getActiveFeatures = function () {
  return this.find({ enabled: true }).sort({ 'metadata.priority': -1, name: 1 });
};

// Méthode statique pour récupérer les features par catégorie
FeatureFlagSchema.statics.getByCategory = function (category: string) {
  return this.find({ category }).sort({ enabled: -1, 'metadata.priority': -1, name: 1 });
};

// Méthode d'instance pour toggle l'état
FeatureFlagSchema.methods.toggle = function () {
  this.enabled = !this.enabled;
  return this.save();
};

// Hook pre-save pour validation des dépendances
FeatureFlagSchema.pre('save', async function (next) {
  if (this.isModified('metadata') && this.metadata && typeof this.metadata === 'object') {
    const metadata = this.metadata as Record<string, any>;
    if ('dependencies' in metadata) {
      const deps = metadata.dependencies as string[];
      if (Array.isArray(deps) && deps.length > 0) {
        const FeatureFlagModel = this.constructor as any;
        const dependencies = await FeatureFlagModel.find({
          key: { $in: deps },
        });

        if (dependencies.length !== deps.length) {
          throw new Error('Une ou plusieurs dépendances sont invalides');
        }
      }
    }
  }
  next();
});

export default mongoose.model<IFeatureFlag>('FeatureFlag', FeatureFlagSchema);
