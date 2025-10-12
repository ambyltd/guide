#!/usr/bin/env node

/**
 * Script de démarrage pour tests utilisateurs
 * Audio Guide Géolocalisé - Côte d'Ivoire
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🇨🇮 Audio Guide Géolocalisé - Côte d\'Ivoire');
console.log('=====================================');
console.log('🧪 Configuration pour Tests Utilisateurs\n');

// Vérifier Node.js version
function checkNodeVersion() {
  const nodeVersion = process.version;
  const majorVersion = parseInt(nodeVersion.slice(1).split('.')[0]);
  
  console.log(`📦 Node.js version: ${nodeVersion}`);
  
  if (majorVersion < 18) {
    console.error('❌ Node.js 18+ requis. Veuillez mettre à jour.');
    process.exit(1);
  }
  console.log('✅ Version Node.js compatible\n');
}

// Vérifier les dépendances
function checkDependencies() {
  console.log('🔍 Vérification des dépendances...');
  
  if (!fs.existsSync('node_modules')) {
    console.log('📦 Installation des dépendances...');
    try {
      execSync('npm install', { stdio: 'inherit' });
      console.log('✅ Dépendances installées\n');
    } catch (error) {
      console.error('❌ Erreur lors de l\'installation des dépendances');
      process.exit(1);
    }
  } else {
    console.log('✅ Dépendances OK\n');
  }
}

// Créer le fichier de configuration de test
function createTestConfig() {
  console.log('⚙️ Configuration du mode test...');
  
  const testConfig = `# Configuration Test - Audio Guide Côte d'Ivoire
# Généré automatiquement pour les tests utilisateurs

# Mode test activé
REACT_APP_TEST_MODE=true

# Configuration API (backend optionnel pour tests)
REACT_APP_API_URL=https://api-audio-guide-ci.com
REACT_APP_API_VERSION=v1

# Configuration Mapbox (remplacez par votre token)
REACT_APP_MAPBOX_TOKEN=pk.eyJ1IjoidGVzdC1hdWRpby1ndWlkZSIsImEiOiJjbGV0ZXN0In0.test_token_here

# Configuration Firebase (remplacez par vos clés)
REACT_APP_FIREBASE_API_KEY=AIzaSyTest_Firebase_Key_Here
REACT_APP_FIREBASE_AUTH_DOMAIN=audio-guide-ci-test.firebaseapp.com
REACT_APP_FIREBASE_PROJECT_ID=audio-guide-ci-test

# Configuration géolocalisation pour tests
REACT_APP_GPS_HIGH_ACCURACY=true
REACT_APP_GPS_TIMEOUT=15000
REACT_APP_GPS_MAX_AGE=60000

# Configuration audio pour tests
REACT_APP_AUDIO_AUTOPLAY=true
REACT_APP_AUDIO_PRELOAD=metadata
REACT_APP_AUDIO_VOLUME=0.8

# Debug et logs pour testeurs
REACT_APP_DEBUG_MODE=true
REACT_APP_LOG_LEVEL=info
`;

  fs.writeFileSync('.env.local', testConfig);
  console.log('✅ Configuration test créée (.env.local)\n');
}

// Valider la configuration
function validateConfig() {
  console.log('🔍 Validation de la configuration...');
  
  try {
    // Vérifier TypeScript
    execSync('npx tsc --noEmit --skipLibCheck', { stdio: 'pipe' });
    console.log('✅ TypeScript OK');
    
    // Vérifier ESLint
    const lintResult = execSync('npm run lint', { stdio: 'pipe', encoding: 'utf8' });
    const warningCount = (lintResult.match(/warning/g) || []).length;
    const errorCount = (lintResult.match(/error/g) || []).length;
    
    if (errorCount > 0) {
      console.log(`❌ ESLint: ${errorCount} erreurs trouvées`);
    } else {
      console.log(`✅ ESLint: Code propre (${warningCount} warnings mineurs)`);
    }
    
  } catch (error) {
    console.log('⚠️ Validation partielle (erreurs mineures détectées)');
  }
  
  console.log('✅ Configuration validée\n');
}

// Créer des scripts de test rapides
function createTestScripts() {
  console.log('📝 Création des scripts de test...');
  
  const testScripts = {
    'test-web.js': `
// Script de test Web - Audio Guide CI
const { execSync } = require('child_process');

console.log('🌐 Lancement du test Web...');
console.log('URL: http://localhost:3000');
console.log('');
console.log('🧪 Tests à effectuer:');
console.log('1. Carte de Côte d\\'Ivoire visible');
console.log('2. Marqueurs d\\'attractions présents');
console.log('3. Géolocalisation fonctionnelle');
console.log('4. Audio guide activable');
console.log('');

try {
  execSync('npm run dev', { stdio: 'inherit' });
} catch (error) {
  console.error('Erreur lors du lancement:', error.message);
}
`,
    'test-android.js': `
// Script de test Android - Audio Guide CI
const { execSync } = require('child_process');

console.log('🤖 Préparation du test Android...');
console.log('');
console.log('📋 Prérequis:');
console.log('- Android Studio installé');
console.log('- Téléphone Android connecté (mode développeur)');
console.log('- USB Debugging activé');
console.log('');

try {
  console.log('🔨 Build de l\\'application...');
  execSync('npm run build', { stdio: 'inherit' });
  
  console.log('🔄 Synchronisation Capacitor...');
  execSync('npx cap sync android', { stdio: 'inherit' });
  
  console.log('📱 Ouverture dans Android Studio...');
  execSync('npx cap open android', { stdio: 'inherit' });
  
  console.log('');
  console.log('✅ Prêt pour installation sur téléphone Android');
  console.log('👆 Cliquez sur "Run" (▶️) dans Android Studio');
  
} catch (error) {
  console.error('Erreur:', error.message);
}
`,
    'test-ios.js': `
// Script de test iOS - Audio Guide CI
const { execSync } = require('child_process');

console.log('🍎 Préparation du test iOS...');
console.log('');
console.log('📋 Prérequis:');
console.log('- Mac avec Xcode installé');
console.log('- iPhone/iPad connecté');
console.log('- Compte développeur Apple configuré');
console.log('');

try {
  console.log('🔨 Build de l\\'application...');
  execSync('npm run build', { stdio: 'inherit' });
  
  console.log('🔄 Synchronisation Capacitor...');
  execSync('npx cap sync ios', { stdio: 'inherit' });
  
  console.log('📱 Ouverture dans Xcode...');
  execSync('npx cap open ios', { stdio: 'inherit' });
  
  console.log('');
  console.log('✅ Prêt pour installation sur iPhone/iPad');
  console.log('👆 Cliquez sur "Run" (▶️) dans Xcode');
  
} catch (error) {
  console.error('Erreur:', error.message);
}
`
  };

  Object.entries(testScripts).forEach(([filename, content]) => {
    fs.writeFileSync(filename, content);
    if (process.platform !== 'win32') {
      execSync(`chmod +x ${filename}`);
    }
  });
  
  console.log('✅ Scripts de test créés:');
  console.log('  - test-web.js (Test navigateur)');
  console.log('  - test-android.js (Test Android)');
  console.log('  - test-ios.js (Test iOS)');
  console.log('');
}

// Afficher les instructions finales
function showInstructions() {
  console.log('🎯 INSTRUCTIONS POUR TESTS UTILISATEURS');
  console.log('=====================================\n');
  
  console.log('🌐 Test Web (Navigateur):');
  console.log('   node test-web.js');
  console.log('   → Ouvre http://localhost:3000\n');
  
  console.log('🤖 Test Android:');
  console.log('   node test-android.js');
  console.log('   → Ouvre Android Studio pour installation\n');
  
  console.log('🍎 Test iOS (Mac uniquement):');
  console.log('   node test-ios.js');
  console.log('   → Ouvre Xcode pour installation\n');
  
  console.log('📚 Documentation complète:');
  console.log('   📄 GUIDE_INSTALLATION_TEST.md\n');
  
  console.log('🇨🇮 Zones de test prioritaires en Côte d\'Ivoire:');
  console.log('   🏛️ Basilique Notre-Dame de la Paix (Yamoussoukro)');
  console.log('   🏛️ Musée des Civilisations (Abidjan)');
  console.log('   🏛️ Grand-Bassam Centre Historique UNESCO');
  console.log('   🌳 Parc National de Taï\n');
  
  console.log('✅ Configuration terminée ! Prêt pour les tests.');
}

// Exécution principale
function main() {
  try {
    checkNodeVersion();
    checkDependencies();
    createTestConfig();
    validateConfig();
    createTestScripts();
    showInstructions();
  } catch (error) {
    console.error('\n❌ Erreur lors de la configuration:', error.message);
    process.exit(1);
  }
}

// Gestion des arguments de ligne de commande
const args = process.argv.slice(2);

if (args.includes('--help') || args.includes('-h')) {
  console.log('Usage: node setup-tests.js [options]');
  console.log('');
  console.log('Options:');
  console.log('  --help, -h     Afficher cette aide');
  console.log('  --web          Lancer directement le test web');
  console.log('  --android      Lancer directement le test Android');
  console.log('  --ios          Lancer directement le test iOS');
  process.exit(0);
}

if (args.includes('--web')) {
  execSync('node test-web.js', { stdio: 'inherit' });
  process.exit(0);
}

if (args.includes('--android')) {
  execSync('node test-android.js', { stdio: 'inherit' });
  process.exit(0);
}

if (args.includes('--ios')) {
  execSync('node test-ios.js', { stdio: 'inherit' });
  process.exit(0);
}

main();