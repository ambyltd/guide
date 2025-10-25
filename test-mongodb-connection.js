const mongoose = require('mongoose');
require('dotenv').config();

console.log('🔧 Test de connexion MongoDB Atlas...');
console.log('URI:', process.env.MONGODB_URI?.replace(/\/\/.*@/, '//***:***@')); // Cache les credentials

const mongoOptions = {
  maxPoolSize: 10,
  serverSelectionTimeoutMS: 30000,
  socketTimeoutMS: 45000,
  bufferCommands: false,
  bufferMaxEntries: 0,
  ssl: true,
  sslValidate: true,
  authSource: 'admin',
  retryWrites: true,
  w: 'majority'
};

async function testConnection() {
  try {
    console.log('⏳ Tentative de connexion avec options SSL complètes...');
    await mongoose.connect(process.env.MONGODB_URI, mongoOptions);
    console.log('✅ Connexion réussie avec SSL!');
    
    // Test d'une requête simple
    const collections = await mongoose.connection.db.listCollections().toArray();
    console.log('📂 Collections disponibles:', collections.map(c => c.name));
    
  } catch (error) {
    console.error('❌ Erreur avec SSL complet:', error.message);
    
    try {
      console.log('🔄 Tentative avec options SSL simplifiées...');
      await mongoose.connect(process.env.MONGODB_URI, {
        maxPoolSize: 5,
        serverSelectionTimeoutMS: 30000,
        socketTimeoutMS: 45000
      });
      console.log('✅ Connexion réussie avec SSL simplifié!');
      
    } catch (fallbackError) {
      console.error('❌ Échec total de connexion:', fallbackError.message);
      
      // Diagnostic avancé
      console.log('\n🔍 Diagnostic:');
      console.log('- Vérifiez que votre adresse IP est autorisée dans MongoDB Atlas');
      console.log('- Vérifiez les identifiants de connexion');
      console.log('- Essayez de redémarrer votre routeur/connexion');
      console.log('- Vérifiez les paramètres de pare-feu');
    }
  } finally {
    await mongoose.disconnect();
    console.log('🔌 Déconnecté de MongoDB');
  }
}

testConnection();
