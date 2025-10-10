import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { Review } from '../src/models/Review';

dotenv.config();

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/cotedivoire-audioguide';

async function testReviews() {
  try {
    console.log('🔌 Connexion à MongoDB...');
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Connecté à MongoDB');

    // Tester la récupération des reviews
    const allReviews = await Review.find();
    console.log(`\n📊 Total reviews: ${allReviews.length}`);

    // Statistiques par statut
    const activeReviews = await Review.find({ active: true });
    const moderatedReviews = await Review.find({ isModerated: true });
    const pendingReviews = await Review.find({ isModerated: false });

    console.log(`🟢 Reviews actives: ${activeReviews.length}`);
    console.log(`✅ Reviews modérées: ${moderatedReviews.length}`);
    console.log(`⏳ Reviews en attente: ${pendingReviews.length}`);

    // Statistiques par type
    const attractionReviews = await Review.find({ itemType: 'Attraction' });
    const tourReviews = await Review.find({ itemType: 'Tour' });
    const audioGuideReviews = await Review.find({ itemType: 'AudioGuide' });

    console.log(`\n📝 Reviews par type:`);
    console.log(`   🏛️  Attractions: ${attractionReviews.length}`);
    console.log(`   🗺️  Tours: ${tourReviews.length}`);
    console.log(`   🎧 AudioGuides: ${audioGuideReviews.length}`);

    // Afficher quelques exemples
    console.log(`\n📋 Exemples de reviews:`);
    const sampleReviews = await Review.find().limit(3).populate('itemId', 'name');
    sampleReviews.forEach((review, index) => {
      console.log(`   ${index + 1}. ${review.itemType} - Note: ${review.rating}/5`);
      console.log(`      Statut: ${review.active ? '🟢 Actif' : '🔴 Inactif'} | Modération: ${review.isModerated ? '✅ Modéré' : '⏳ En attente'}`);
      console.log(`      Commentaire: "${review.comment?.substring(0, 50)}..."`);
      console.log('');
    });

  } catch (error) {
    console.error('❌ Erreur:', error);
  } finally {
    await mongoose.disconnect();
    console.log('🔌 Déconnecté de MongoDB');
  }
}

testReviews();
