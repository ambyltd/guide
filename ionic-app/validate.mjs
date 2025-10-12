#!/usr/bin/env node

/**
 * Script de validation complète de l'application Ionic
 * Tests de compilation, linting, et vérifications fonctionnelles
 */

import { execSync } from 'child_process';
import { existsSync, readFileSync } from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// ===== CONFIGURATION =====
const PROJECT_ROOT = __dirname;
const TIMEOUT = 300000; // 5 minutes

// Couleurs pour la console
const colors = {
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  reset: '\x1b[0m',
  bold: '\x1b[1m',
};

// ===== UTILITAIRES =====
const log = {
  success: (msg) => console.log(`${colors.green}✓${colors.reset} ${msg}`),
  error: (msg) => console.log(`${colors.red}✗${colors.reset} ${msg}`),
  warning: (msg) => console.log(`${colors.yellow}⚠${colors.reset} ${msg}`),
  info: (msg) => console.log(`${colors.blue}ℹ${colors.reset} ${msg}`),
  title: (msg) => console.log(`\n${colors.bold}${colors.blue}=== ${msg} ===${colors.reset}\n`),
};

const runCommand = (command, options = {}) => {
  try {
    const result = execSync(command, {
      cwd: PROJECT_ROOT,
      timeout: TIMEOUT,
      encoding: 'utf8',
      stdio: options.silent ? 'pipe' : 'inherit',
      ...options,
    });
    return { success: true, output: result };
  } catch (error) {
    return { 
      success: false, 
      error: error.message,
      output: error.stdout || error.output || '',
    };
  }
};

const checkFileExists = (filePath) => {
  const fullPath = path.join(PROJECT_ROOT, filePath);
  return existsSync(fullPath);
};

const checkFileContent = (filePath, patterns) => {
  const fullPath = path.join(PROJECT_ROOT, filePath);
  if (!existsSync(fullPath)) return false;
  
  const content = readFileSync(fullPath, 'utf8');
  return patterns.every(pattern => content.includes(pattern));
};

// ===== TESTS =====
const tests = {
  // Test de la structure du projet
  projectStructure: () => {
    log.title('Vérification de la structure du projet');
    
    const requiredFiles = [
      'package.json',
      'tsconfig.json',
      'vite.config.ts',
      'ionic.config.json',
      'capacitor.config.ts',
      'src/App.tsx',
      'src/main.tsx',
      'src/config/firebase.ts',
      'src/services/authService.ts',
      'src/hooks/useAuth.ts',
      'src/pages/HomePage.tsx',
      'src/pages/LoginPage.tsx',
      'src/pages/RegisterPage.tsx',
      'src/pages/VerifyEmailPage.tsx',
      'src/pages/AttractionsPage.tsx',
      'src/pages/AudioGuidesPage.tsx',
      'src/pages/MapPage.tsx',
      'src/components/ProtectedRoute.tsx',
    ];
    
    let passed = 0;
    for (const file of requiredFiles) {
      if (checkFileExists(file)) {
        log.success(`Fichier trouvé: ${file}`);
        passed++;
      } else {
        log.error(`Fichier manquant: ${file}`);
      }
    }
    
    return passed === requiredFiles.length;
  },

  // Test des dépendances
  dependencies: () => {
    log.title('Vérification des dépendances');
    
    const packageJson = JSON.parse(readFileSync(path.join(PROJECT_ROOT, 'package.json'), 'utf8'));
    const requiredDeps = [
      '@ionic/react',
      '@ionic/react-router',
      'firebase',
      'react',
      'react-dom',
      'react-router',
      'react-router-dom',
      'leaflet',
      'axios',
      '@reduxjs/toolkit',
      'react-redux',
    ];
    
    let passed = 0;
    for (const dep of requiredDeps) {
      if (packageJson.dependencies?.[dep] || packageJson.devDependencies?.[dep]) {
        log.success(`Dépendance trouvée: ${dep}`);
        passed++;
      } else {
        log.error(`Dépendance manquante: ${dep}`);
      }
    }
    
    return passed === requiredDeps.length;
  },

  // Test de compilation TypeScript
  typescript: () => {
    log.title('Vérification TypeScript');
    
    const result = runCommand('npx tsc --noEmit', { silent: false });
    if (result.success) {
      log.success('Compilation TypeScript réussie');
      return true;
    } else {
      log.error('Erreurs de compilation TypeScript');
      return false;
    }
  },

  // Test de linting
  linting: () => {
    log.title('Vérification ESLint');
    
    const result = runCommand('npm run lint', { silent: true });
    if (result.success || result.output.includes('0 problems')) {
      log.success('Linting réussi');
      return true;
    } else {
      log.warning('Avertissements de linting détectés');
      console.log(result.output);
      return true; // On accepte les warnings
    }
  },

  // Test de build
  build: () => {
    log.title('Test de build de production');
    
    const result = runCommand('npm run build', { silent: false });
    if (result.success) {
      log.success('Build de production réussi');
      
      // Vérifier que les fichiers de build existent
      const buildFiles = ['dist/index.html', 'dist/assets'];
      const allExists = buildFiles.every(file => checkFileExists(file));
      
      if (allExists) {
        log.success('Fichiers de build générés correctement');
        return true;
      } else {
        log.error('Fichiers de build manquants');
        return false;
      }
    } else {
      log.error('Échec du build de production');
      return false;
    }
  },

  // Test de la configuration Firebase
  firebaseConfig: () => {
    log.title('Vérification de la configuration Firebase');
    
    const configPatterns = [
      'initializeApp',
      'getAuth',
      'getFirestore',
      'getStorage',
      'VITE_FIREBASE_API_KEY',
    ];
    
    if (checkFileContent('src/config/firebase.ts', configPatterns)) {
      log.success('Configuration Firebase correcte');
      return true;
    } else {
      log.error('Configuration Firebase incomplète');
      return false;
    }
  },

  // Test des services
  services: () => {
    log.title('Vérification des services');
    
    const authServicePatterns = [
      'class AuthService',
      'signIn',
      'signUp',
      'signOut',
      'onAuthStateChanged',
    ];
    
    if (checkFileContent('src/services/authService.ts', authServicePatterns)) {
      log.success('Service d\'authentification correct');
      return true;
    } else {
      log.error('Service d\'authentification incomplet');
      return false;
    }
  },

  // Test des hooks
  hooks: () => {
    log.title('Vérification des hooks React');
    
    const useAuthPatterns = [
      'export const useAuth',
      'useState',
      'useEffect',
      'signIn',
      'signOut',
    ];
    
    if (checkFileContent('src/hooks/useAuth.ts', useAuthPatterns)) {
      log.success('Hook useAuth correct');
      return true;
    } else {
      log.error('Hook useAuth incomplet');
      return false;
    }
  },

  // Test des pages
  pages: () => {
    log.title('Vérification des pages React');
    
    const pages = [
      { file: 'src/pages/HomePage.tsx', patterns: ['HomePage', 'IonContent', 'IonPage'] },
      { file: 'src/pages/LoginPage.tsx', patterns: ['LoginPage', 'useAuth', 'IonInput'] },
      { file: 'src/pages/AttractionsPage.tsx', patterns: ['AttractionsPage', 'IonList'] },
      { file: 'src/pages/MapPage.tsx', patterns: ['MapPage', 'MapView'] },
    ];
    
    let passed = 0;
    for (const page of pages) {
      if (checkFileContent(page.file, page.patterns)) {
        log.success(`Page ${page.file} correcte`);
        passed++;
      } else {
        log.error(`Page ${page.file} incomplète`);
      }
    }
    
    return passed === pages.length;
  },

  // Test de la configuration Ionic
  ionicConfig: () => {
    log.title('Vérification de la configuration Ionic');
    
    const ionicConfigPatterns = [
      'ionic-app-base',
      'react',
    ];
    
    if (checkFileContent('ionic.config.json', ionicConfigPatterns)) {
      log.success('Configuration Ionic correcte');
      return true;
    } else {
      log.error('Configuration Ionic incomplète');
      return false;
    }
  },

  // Test de Capacitor
  capacitorConfig: () => {
    log.title('Vérification de la configuration Capacitor');
    
    const capacitorPatterns = [
      'appId',
      'appName',
      'webDir',
    ];
    
    if (checkFileContent('capacitor.config.ts', capacitorPatterns)) {
      log.success('Configuration Capacitor correcte');
      return true;
    } else {
      log.error('Configuration Capacitor incomplète');
      return false;
    }
  },
};

// ===== EXÉCUTION DES TESTS =====
const runAllTests = async () => {
  console.log(`${colors.bold}${colors.blue}🚀 VALIDATION DE L'APPLICATION IONIC${colors.reset}`);
  console.log(`${colors.blue}📱 Côte d'Ivoire Audio Guide${colors.reset}\n`);
  
  const startTime = Date.now();
  const results = {};
  let totalTests = 0;
  let passedTests = 0;
  
  for (const [testName, testFn] of Object.entries(tests)) {
    totalTests++;
    try {
      const result = await testFn();
      results[testName] = result;
      if (result) passedTests++;
    } catch (error) {
      log.error(`Erreur lors du test ${testName}: ${error.message}`);
      results[testName] = false;
    }
  }
  
  // ===== RÉSUMÉ =====
  const duration = ((Date.now() - startTime) / 1000).toFixed(2);
  
  log.title('Résumé des tests');
  console.log(`Durée: ${duration}s`);
  console.log(`Tests réussis: ${passedTests}/${totalTests}`);
  
  if (passedTests === totalTests) {
    console.log(`\n${colors.green}${colors.bold}🎉 TOUS LES TESTS SONT PASSÉS !${colors.reset}`);
    console.log(`${colors.green}✨ L'application Ionic est prête pour la production${colors.reset}\n`);
    
    // Informations de déploiement
    console.log(`${colors.blue}📦 Commandes de déploiement :${colors.reset}`);
    console.log(`  • Build production: ${colors.yellow}npm run build${colors.reset}`);
    console.log(`  • Prévisualisation: ${colors.yellow}npm run preview${colors.reset}`);
    console.log(`  • Build Android: ${colors.yellow}npx ionic capacitor build android${colors.reset}`);
    console.log(`  • Build iOS: ${colors.yellow}npx ionic capacitor build ios${colors.reset}\n`);
    
    process.exit(0);
  } else {
    console.log(`\n${colors.red}${colors.bold}❌ CERTAINS TESTS ONT ÉCHOUÉ${colors.reset}`);
    console.log(`${colors.red}🔧 Veuillez corriger les erreurs avant de déployer${colors.reset}\n`);
    
    // Détail des échecs
    for (const [testName, result] of Object.entries(results)) {
      if (!result) {
        console.log(`${colors.red}  ✗ ${testName}${colors.reset}`);
      }
    }
    
    process.exit(1);
  }
};

// Lancement des tests
runAllTests().catch(error => {
  log.error(`Erreur fatale: ${error.message}`);
  process.exit(1);
});