import mongoose from 'mongoose';
import fs from 'fs';
import path from 'path';
import dotenv from 'dotenv';
import { Attraction } from '../src/models/Attraction';
import { AudioGuide } from '../src/models/AudioGuide';
import { Tour } from '../src/models/Tour';
import { User } from '../src/models/User';

dotenv.config();

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/cotedivoire-audioguide';

async function importData(backupFileName?: string) {
  try {
    console.log('🔗 Connexion à MongoDB...');
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Connecté à MongoDB');

    // Déterminer le fichier de sauvegarde à utiliser
    const backupDir = path.join(__dirname, '../backups');
    let backupFilePath: string;
    
    if (backupFileName) {
      backupFilePath = path.join(backupDir, backupFileName);
    } else {
      backupFilePath = path.join(backupDir, 'latest-backup.json');
    }

    if (!fs.existsSync(backupFilePath)) {
      throw new Error(`Fichier de sauvegarde non trouvé: ${backupFilePath}`);
    }

    console.log(`📁 Lecture du fichier de sauvegarde: ${path.basename(backupFilePath)}`);
    const backupData = JSON.parse(fs.readFileSync(backupFilePath, 'utf8'));

    console.log('📊 Informations de la sauvegarde:');
    console.log(`   Date d'export: ${backupData.metadata.exportDate}`);
    console.log(`   Version: ${backupData.metadata.version}`);
    console.log(`   Description: ${backupData.metadata.description}`);
    console.log(`   Attractions: ${backupData.metadata.counts.attractions}`);
    console.log(`   Guides audio: ${backupData.metadata.counts.audioGuides}`);
    console.log(`   Tours: ${backupData.metadata.counts.tours}`);
    console.log(`   Utilisateurs: ${backupData.metadata.counts.users}`);

    console.log('🗑️ Nettoyage de la base de données...');
    await Attraction.deleteMany({});
    await AudioGuide.deleteMany({});
    await Tour.deleteMany({});
    await User.deleteMany({});
    console.log('✅ Base de données nettoyée');

    console.log('📥 Import des données...');

    // Import des attractions
    console.log('   📍 Import des attractions...');
    if (backupData.data.attractions && backupData.data.attractions.length > 0) {
      await Attraction.insertMany(backupData.data.attractions);
      console.log(`   ✅ ${backupData.data.attractions.length} attractions importées`);
    }

    // Import des guides audio
    console.log('   🎧 Import des guides audio...');
    if (backupData.data.audioGuides && backupData.data.audioGuides.length > 0) {
      await AudioGuide.insertMany(backupData.data.audioGuides);
      console.log(`   ✅ ${backupData.data.audioGuides.length} guides audio importés`);
    }

    // Import des tours
    console.log('   🎯 Import des tours...');
    if (backupData.data.tours && backupData.data.tours.length > 0) {
      await Tour.insertMany(backupData.data.tours);
      console.log(`   ✅ ${backupData.data.tours.length} tours importés`);
    }

    // Import des utilisateurs
    console.log('   👥 Import des utilisateurs...');
    if (backupData.data.users && backupData.data.users.length > 0) {
      await User.insertMany(backupData.data.users);
      console.log(`   ✅ ${backupData.data.users.length} utilisateurs importés`);
    }

    console.log('✅ Import terminé avec succès !');
    console.log('🎯 La base de données a été restaurée à partir de la sauvegarde');

    // Vérification post-import
    console.log('🔍 Vérification post-import...');
    const attractionCount = await Attraction.countDocuments();
    const audioGuideCount = await AudioGuide.countDocuments();
    const tourCount = await Tour.countDocuments();
    const userCount = await User.countDocuments();

    console.log(`✅ Vérification réussie:`);
    console.log(`   - ${attractionCount} attractions en base`);
    console.log(`   - ${audioGuideCount} guides audio en base`);
    console.log(`   - ${tourCount} tours en base`);
    console.log(`   - ${userCount} utilisateurs en base`);

  } catch (error) {
    console.error('❌ Erreur lors de l\'import:', error);
  } finally {
    await mongoose.disconnect();
    console.log('🔌 Déconnecté de MongoDB');
  }
}

// Utilisation: node import-data.js [nom-du-fichier-backup.json]
const backupFileName = process.argv[2];
importData(backupFileName);
