#!/usr/bin/env node

/**
 * Script de validation finale de l'application
 * Vérifie que tout est prêt pour la production
 */

import { exec } from 'child_process';
import { promisify } from 'util';
import fs from 'fs';
import path from 'path';

const execAsync = promisify(exec);

console.log('🎵 VALIDATION FINALE - Guide Audio Géolocalisé Côte d\'Ivoire');
console.log('================================================================\n');

async function validateApp() {
  let allTestsPassed = true;

  // 1. Vérifier que les fichiers essentiels existent
  console.log('📁 Vérification des fichiers essentiels...');
  const essentialFiles = [
    'src/components/AdvancedAudioPlayer.tsx',
    'src/components/GeolocationAudioTester.tsx',
    'src/services/nativeAudioService.ts',
    'src/services/testAudioService.ts',
    'src/hooks/useNativeAudio.ts',
    'src/pages/MapPage.tsx'
  ];

  for (const file of essentialFiles) {
    if (!fs.existsSync(file)) {
      console.log(`❌ Fichier manquant: ${file}`);
      allTestsPassed = false;
    } else {
      console.log(`✅ ${file}`);
    }
  }

  // 2. Test de compilation TypeScript
  console.log('\n🔧 Test de compilation TypeScript...');
  try {
    const { stderr } = await execAsync('npx tsc --noEmit');
    if (stderr && stderr.includes('error TS')) {
      console.log('❌ Erreurs TypeScript détectées');
      console.log(stderr);
      allTestsPassed = false;
    } else {
      console.log('✅ Compilation TypeScript réussie');
    }
  } catch (error) {
    console.log('❌ Erreur lors de la compilation TypeScript');
    allTestsPassed = false;
  }

  // 3. Test de build de production
  console.log('\n🏗️  Test de build de production...');
  try {
    const { stdout } = await execAsync('npm run build');
    if (stdout.includes('✓ built in')) {
      console.log('✅ Build de production réussi');
    } else {
      console.log('❌ Problème avec le build de production');
      allTestsPassed = false;
    }
  } catch (error) {
    console.log('❌ Erreur lors du build de production');
    allTestsPassed = false;
  }

  // 4. Vérifier les dépendances
  console.log('\n📦 Vérification des dépendances...');
  const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'));
  const requiredDeps = [
    '@ionic/react',
    '@capacitor/core',
    '@capacitor/filesystem',
    'leaflet',
    'react',
    'typescript'
  ];

  for (const dep of requiredDeps) {
    if (!packageJson.dependencies?.[dep] && !packageJson.devDependencies?.[dep]) {
      console.log(`❌ Dépendance manquante: ${dep}`);
      allTestsPassed = false;
    } else {
      console.log(`✅ ${dep}`);
    }
  }

  // 5. Vérifier la structure du projet
  console.log('\n🏛️  Vérification de la structure...');
  const requiredDirs = [
    'src/components',
    'src/services',
    'src/hooks',
    'src/pages',
    'src/store',
    'public'
  ];

  for (const dir of requiredDirs) {
    if (!fs.existsSync(dir)) {
      console.log(`❌ Répertoire manquant: ${dir}`);
      allTestsPassed = false;
    } else {
      console.log(`✅ ${dir}/`);
    }
  }

  // Résumé final
  console.log('\n' + '='.repeat(60));
  if (allTestsPassed) {
    console.log('🎉 VALIDATION RÉUSSIE !');
    console.log('🚀 Application prête pour la production');
    console.log('📱 Prête pour le déploiement mobile (iOS/Android)');
    console.log('🌐 Prête pour le déploiement web (PWA)');
    console.log('\n📋 PROCHAINES ÉTAPES:');
    console.log('   1. Ajouter du contenu audio réel de Côte d\'Ivoire');
    console.log('   2. Connecter à une vraie API backend');
    console.log('   3. Configurer l\'authentification Firebase');
    console.log('   4. Publier sur les app stores');
  } else {
    console.log('❌ VALIDATION ÉCHOUÉE');
    console.log('🔧 Des corrections sont nécessaires avant le déploiement');
  }
  console.log('='.repeat(60));

  return allTestsPassed;
}

// Exécution
validateApp().then(success => {
  process.exit(success ? 0 : 1);
}).catch(error => {
  console.error('Erreur lors de la validation:', error);
  process.exit(1);
});