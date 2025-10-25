const fs = require('fs');
const path = require('path');

function verifyBackup() {
  console.log('🔍 VÉRIFICATION DE LA SAUVEGARDE\n');

  const backupDir = path.join(__dirname, 'backups');
  const latestBackupPath = path.join(backupDir, 'latest-backup.json');
  const statsPath = path.join(backupDir, 'backup-stats.json');

  try {
    // Vérifier l'existence des fichiers
    if (!fs.existsSync(latestBackupPath)) {
      console.log('❌ Fichier latest-backup.json non trouvé');
      return;
    }

    if (!fs.existsSync(statsPath)) {
      console.log('❌ Fichier backup-stats.json non trouvé');
      return;
    }

    // Lire les données de sauvegarde
    const backup = JSON.parse(fs.readFileSync(latestBackupPath, 'utf8'));
    const stats = JSON.parse(fs.readFileSync(statsPath, 'utf8'));

    console.log('✅ SAUVEGARDE TROUVÉE ET VALIDE');
    console.log(`📅 Date de sauvegarde: ${backup.metadata.exportDate}`);
    console.log(`📊 Statistiques:`);
    console.log(`   - ${backup.metadata.counts.attractions} attractions`);
    console.log(`   - ${backup.metadata.counts.audioGuides} guides audio`);
    console.log(`   - ${backup.metadata.counts.tours} tours`);
    console.log(`   - ${backup.metadata.counts.users} utilisateurs`);

    console.log(`\n🏷️ Catégories: ${stats.categories.join(', ')}`);
    console.log(`🏙️ Villes: ${stats.cities.join(', ')}`);
    console.log(`🌍 Régions: ${stats.regions.join(', ')}`);

    // Vérifier l'intégrité des données
    let isValid = true;
    
    if (!backup.data.attractions || backup.data.attractions.length === 0) {
      console.log('⚠️ Aucune attraction dans la sauvegarde');
      isValid = false;
    }

    if (!backup.data.tours || backup.data.tours.length === 0) {
      console.log('⚠️ Aucun tour dans la sauvegarde');
      isValid = false;
    }

    if (isValid) {
      console.log('\n✅ SAUVEGARDE COMPLÈTE ET VALIDE');
      console.log('🚀 Prête pour restauration ou archivage');
    } else {
      console.log('\n⚠️ SAUVEGARDE INCOMPLÈTE');
    }

    // Lister tous les fichiers de sauvegarde disponibles
    console.log('\n📁 FICHIERS DE SAUVEGARDE DISPONIBLES:');
    const backupFiles = fs.readdirSync(backupDir)
      .filter(file => file.startsWith('backup-') && file.endsWith('.json'))
      .sort()
      .reverse(); // Plus récent en premier

    backupFiles.forEach((file, index) => {
      const size = fs.statSync(path.join(backupDir, file)).size;
      const sizeKB = Math.round(size / 1024);
      console.log(`   ${index + 1}. ${file} (${sizeKB} KB)`);
    });

    console.log(`\n📁 Total: ${backupFiles.length} fichiers de sauvegarde`);

  } catch (error) {
    console.error('❌ Erreur lors de la vérification:', error.message);
  }
}

verifyBackup();
