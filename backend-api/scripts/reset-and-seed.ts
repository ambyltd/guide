import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { Attraction } from '../src/models/Attraction';
import { AudioGuide } from '../src/models/AudioGuide';
import { Tour } from '../src/models/Tour';
import { User } from '../src/models/User';
import { Review } from '../src/models/Review';

dotenv.config();

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/cotedivoire-audioguide';

async function resetAndSeed() {
  try {
    console.log('🔌 Connexion à MongoDB...');
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Connecté à MongoDB');

    // Nettoyer toutes les collections
    console.log('🧹 Nettoyage des collections...');
    await Review.deleteMany({});
    await Tour.deleteMany({});
    await AudioGuide.deleteMany({});
    await Attraction.deleteMany({});
    await User.deleteMany({});
    console.log('✅ Collections nettoyées');

    // Importer et exécuter le seed complet
    console.log('🌱 Exécution du seed complet...');
    const { seedDatabase } = require('./seed-complete');
    await seedDatabase();

  } catch (error) {
    console.error('❌ Erreur:', error);
  } finally {
    await mongoose.disconnect();
    console.log('🔌 Déconnecté de MongoDB');
  }
}

resetAndSeed();
