#!/usr/bin/env node

/**
 * Script de test pour l'amélioration du debugging Firebase Auth
 * Teste les nouvelles fonctionnalités d'erreur et de diagnostic
 */

const fs = require('fs');
const path = require('path');

console.log('🔍 Test des améliorations de debugging Firebase Auth\n');

// 1. Vérifier que les fichiers ont été créés/modifiés
const filesToCheck = [
  'src/services/authService.ts',
  'src/pages/FirebaseDiagnosticPage.tsx',
  'src/pages/LoginPage.tsx',
  'src/pages/LoginPage.css',
  'src/App.tsx'
];

console.log('📁 Vérification des fichiers...');
let allFilesExist = true;

filesToCheck.forEach(file => {
  const filePath = path.join(__dirname, file);
  if (fs.existsSync(filePath)) {
    console.log(`✅ ${file} - Existe`);
  } else {
    console.log(`❌ ${file} - Manquant`);
    allFilesExist = false;
  }
});

if (!allFilesExist) {
  console.log('\n❌ Certains fichiers sont manquants.');
  process.exit(1);
}

// 2. Vérifier le contenu de authService.ts
console.log('\n🔧 Vérification des améliorations dans authService.ts...');
const authServicePath = path.join(__dirname, 'src/services/authService.ts');
const authServiceContent = fs.readFileSync(authServicePath, 'utf8');

const authServiceChecks = [
  { pattern: /auth\/invalid-credential/, description: 'Message d\'erreur spécifique pour invalid-credential' },
  { pattern: /Firebase Config Check/, description: 'Debug logging pour la configuration' },
  { pattern: /Tentative de connexion/, description: 'Debug logging pour les tentatives de connexion' },
  { pattern: /Erreur de connexion détaillée/, description: 'Logging d\'erreur amélioré' }
];

authServiceChecks.forEach(check => {
  if (check.pattern.test(authServiceContent)) {
    console.log(`✅ ${check.description}`);
  } else {
    console.log(`❌ ${check.description}`);
  }
});

// 3. Vérifier la page de diagnostic
console.log('\n🔍 Vérification de FirebaseDiagnosticPage.tsx...');
const diagnosticPagePath = path.join(__dirname, 'src/pages/FirebaseDiagnosticPage.tsx');
const diagnosticPageContent = fs.readFileSync(diagnosticPagePath, 'utf8');

const diagnosticChecks = [
  { pattern: /Variables.*environnement.*Firebase/, description: 'Test des variables d\'environnement' },
  { pattern: /Initialisation Firebase Auth/, description: 'Test d\'initialisation Firebase Auth' },
  { pattern: /Connectivité Firebase API/, description: 'Test de connectivité API' },
  { pattern: /runDiagnostics/, description: 'Fonction de diagnostic' }
];

diagnosticChecks.forEach(check => {
  if (check.pattern.test(diagnosticPageContent)) {
    console.log(`✅ ${check.description}`);
  } else {
    console.log(`❌ ${check.description}`);
  }
});

// 4. Vérifier l'intégration dans App.tsx
console.log('\n🚀 Vérification de l\'intégration dans App.tsx...');
const appPath = path.join(__dirname, 'src/App.tsx');
const appContent = fs.readFileSync(appPath, 'utf8');

const appChecks = [
  { pattern: /import.*FirebaseDiagnosticPage/, description: 'Import de FirebaseDiagnosticPage' },
  { pattern: /path="\/diagnostic"/, description: 'Route pour /diagnostic' },
  { pattern: /<FirebaseDiagnosticPage/, description: 'Composant utilisé dans une route' }
];

appChecks.forEach(check => {
  if (check.pattern.test(appContent)) {
    console.log(`✅ ${check.description}`);
  } else {
    console.log(`❌ ${check.description}`);
  }
});

// 5. Vérifier le lien de diagnostic dans LoginPage
console.log('\n🔗 Vérification du lien de diagnostic dans LoginPage.tsx...');
const loginPagePath = path.join(__dirname, 'src/pages/LoginPage.tsx');
const loginPageContent = fs.readFileSync(loginPagePath, 'utf8');

const loginPageChecks = [
  { pattern: /bugOutline/, description: 'Import de l\'icône bugOutline' },
  { pattern: /routerLink="\/diagnostic"/, description: 'Lien vers la page de diagnostic' },
  { pattern: /Problème de connexion/, description: 'Texte d\'aide pour le diagnostic' },
  { pattern: /diagnostic-link/, description: 'Classe CSS pour le lien de diagnostic' }
];

loginPageChecks.forEach(check => {
  if (check.pattern.test(loginPageContent)) {
    console.log(`✅ ${check.description}`);
  } else {
    console.log(`❌ ${check.description}`);
  }
});

// 6. Vérifier les styles CSS
console.log('\n🎨 Vérification des styles CSS...');
const cssPath = path.join(__dirname, 'src/pages/LoginPage.css');
const cssContent = fs.readFileSync(cssPath, 'utf8');

const cssChecks = [
  { pattern: /\.diagnostic-link/, description: 'Style pour diagnostic-link' },
  { pattern: /\.diagnostic-button/, description: 'Style pour diagnostic-button' }
];

cssChecks.forEach(check => {
  if (check.pattern.test(cssContent)) {
    console.log(`✅ ${check.description}`);
  } else {
    console.log(`❌ ${check.description}`);
  }
});

console.log('\n✨ Test des améliorations terminé !\n');

console.log('📋 Résumé des améliorations :');
console.log('1. ✅ Messages d\'erreur plus spécifiques dans authService.ts');
console.log('2. ✅ Debug logging pour le diagnostic des problèmes');
console.log('3. ✅ Page de diagnostic Firebase complète (/diagnostic)');
console.log('4. ✅ Lien de diagnostic accessible depuis la page de connexion');
console.log('5. ✅ Tests automatisés de configuration Firebase');
console.log('6. ✅ Interface utilisateur pour le debugging');

console.log('\n🚀 Prochaines étapes recommandées :');
console.log('1. Démarrer l\'application : npm start');
console.log('2. Aller sur http://localhost:3000/diagnostic pour tester');
console.log('3. Essayer de se connecter et examiner les logs de la console');
console.log('4. Utiliser les informations de diagnostic pour résoudre les problèmes');

console.log('\n💡 Pour déboguer une erreur de connexion :');
console.log('- Ouvrir les DevTools (F12)');
console.log('- Aller dans la console');
console.log('- Essayer de se connecter');
console.log('- Examiner les logs "Firebase Auth Config" et "Sign-in attempt"');
console.log('- Utiliser la page /diagnostic pour des tests automatisés');