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

async function exportData() {
  try {
    console.log('🔗 Connexion à MongoDB...');
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Connecté à MongoDB');

    console.log('📤 Export des données en cours...');

    // Export des attractions
    console.log('   📍 Export des attractions...');
    const attractions = await Attraction.find({}).lean();
    
    // Export des guides audio
    console.log('   🎧 Export des guides audio...');
    const audioGuides = await AudioGuide.find({}).lean();
    
    // Export des tours
    console.log('   🎯 Export des tours...');
    const tours = await Tour.find({}).lean();
    
    // Export des utilisateurs
    console.log('   👥 Export des utilisateurs...');
    const users = await User.find({}).lean();

    // Créer la structure de sauvegarde
    const backup = {
      metadata: {
        exportDate: new Date().toISOString(),
        version: '1.0.0',
        description: 'Sauvegarde complète de la base de données Côte d\'Ivoire Audio Guide',
        counts: {
          attractions: attractions.length,
          audioGuides: audioGuides.length,
          tours: tours.length,
          users: users.length
        }
      },
      data: {
        attractions,
        audioGuides,
        tours,
        users
      }
    };

    // Sauvegarder dans un fichier JSON
    const backupDir = path.join(__dirname, '../backups');
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const backupFileName = `backup-${timestamp}.json`;
    const backupFilePath = path.join(backupDir, backupFileName);

    fs.writeFileSync(backupFilePath, JSON.stringify(backup, null, 2));

    // Créer aussi un fichier de sauvegarde "latest" pour faciliter l'usage
    const latestBackupPath = path.join(backupDir, 'latest-backup.json');
    fs.writeFileSync(latestBackupPath, JSON.stringify(backup, null, 2));

    console.log('✅ Export terminé avec succès !');
    console.log(`📁 Fichier de sauvegarde: ${backupFileName}`);
    console.log(`📊 Statistiques de l'export:`);
    console.log(`   - ${attractions.length} attractions`);
    console.log(`   - ${audioGuides.length} guides audio`);
    console.log(`   - ${tours.length} tours`);
    console.log(`   - ${users.length} utilisateurs`);
    console.log(`📁 Sauvegarde disponible dans: ${backupFilePath}`);
    console.log(`📁 Sauvegarde "latest" dans: ${latestBackupPath}`);

    // Créer un fichier de statistiques séparé
    const statsFile = path.join(backupDir, 'backup-stats.json');
    const stats = {
      lastBackup: new Date().toISOString(),
      backupFile: backupFileName,
      counts: backup.metadata.counts,
      categories: [...new Set(attractions.map(a => a.category))],
      cities: [...new Set(attractions.map(a => a.city))],
      regions: [...new Set(attractions.map(a => a.region))]
    };
    fs.writeFileSync(statsFile, JSON.stringify(stats, null, 2));
    console.log(`📊 Statistiques sauvegardées dans: ${statsFile}`);

  } catch (error) {
    console.error('❌ Erreur lors de l\'export:', error);
  } finally {
    await mongoose.disconnect();
    console.log('🔌 Déconnecté de MongoDB');
  }
}

exportData();
