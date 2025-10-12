/**
 * Script de validation des routes - Vérifie que toutes les routes utilisent /tabs
 * Validations:
 * 1. Toutes les routes de navigation doivent commencer par /tabs/
 * 2. Les routes d'authentification (/login, /register, etc.) sont exclues
 * 3. Vérifie la cohérence entre App.tsx et les pages
 */

const fs = require('fs');
const path = require('path');

console.log('\n🧪 VALIDATION DES ROUTES DE NAVIGATION\n');
console.log('='.repeat(60));

let totalIssues = 0;
let totalChecks = 0;

// Fichiers à vérifier
const filesToCheck = [
  'src/pages/Home.tsx',
  'src/pages/Map.tsx',
  'src/pages/Favorites.tsx',
  'src/pages/AttractionDetail.tsx',
  'src/pages/Profile.tsx'
];

// Routes autorisées sans /tabs (authentification)
const allowedWithoutTabs = [
  '/login',
  '/register',
  '/forgot-password',
  '/reset-password'
];

// Patterns de routes à vérifier
const routePatterns = [
  { regex: /history\.push\([`'"]\/(?!tabs\/|login|register|forgot-password|reset-password)([^`'"]*)[`'"]\)/g, description: 'Routes sans /tabs/' },
  { regex: /href=[`'"]\/(?!tabs\/|login|register|forgot-password|reset-password)([^`'"]*)[`'"]/g, description: 'href sans /tabs/' },
];

console.log('\n📂 Fichiers à vérifier:\n');
filesToCheck.forEach((file, i) => {
  console.log(`   ${i + 1}. ${file}`);
});

console.log('\n' + '-'.repeat(60));

filesToCheck.forEach(file => {
  const filePath = path.join(__dirname, file);
  
  if (!fs.existsSync(filePath)) {
    console.log(`\n⚠️  ${file}: fichier non trouvé`);
    return;
  }

  const content = fs.readFileSync(filePath, 'utf-8');
  let fileIssues = 0;

  console.log(`\n📄 ${file}`);
  
  routePatterns.forEach(pattern => {
    const matches = [...content.matchAll(pattern.regex)];
    
    if (matches.length > 0) {
      console.log(`\n   ❌ ${pattern.description}:`);
      matches.forEach(match => {
        const lineNumber = content.substring(0, match.index).split('\n').length;
        console.log(`      - Ligne ${lineNumber}: ${match[0]}`);
        fileIssues++;
        totalIssues++;
      });
    }
    totalChecks++;
  });

  if (fileIssues === 0) {
    console.log('   ✅ Aucun problème détecté');
  }
});

// Vérifier App.tsx pour la cohérence des routes
console.log('\n' + '='.repeat(60));
console.log('\n📋 Vérification de App.tsx\n');

const appTsxPath = path.join(__dirname, 'src/App.tsx');
if (fs.existsSync(appTsxPath)) {
  const appContent = fs.readFileSync(appTsxPath, 'utf-8');
  
  // Extraire les routes définies
  const routeRegex = /<Route\s+(?:exact\s+)?path=["']([^"']+)["']/g;
  const routes = [...appContent.matchAll(routeRegex)].map(m => m[1]);
  
  console.log('Routes définies dans App.tsx:');
  routes.forEach((route, i) => {
    if (route.startsWith('/tabs/')) {
      console.log(`   ${i + 1}. ${route} ✅`);
    } else if (allowedWithoutTabs.includes(route) || route === '/') {
      console.log(`   ${i + 1}. ${route} ⚪ (auth/redirect)`);
    } else {
      console.log(`   ${i + 1}. ${route} ⚠️  (hors /tabs)`);
    }
  });

  // Vérifier la présence de IonTabs
  if (appContent.includes('<IonTabs>')) {
    console.log('\n✅ IonTabs présent dans App.tsx');
  } else {
    console.log('\n❌ IonTabs manquant dans App.tsx');
    totalIssues++;
  }

  // Vérifier la présence de IonTabBar
  if (appContent.includes('<IonTabBar')) {
    console.log('✅ IonTabBar présent dans App.tsx');
  } else {
    console.log('❌ IonTabBar manquant dans App.tsx');
    totalIssues++;
  }
} else {
  console.log('❌ App.tsx non trouvé');
  totalIssues++;
}

// Résumé
console.log('\n' + '='.repeat(60));
console.log('\n📊 RÉSUMÉ DE LA VALIDATION\n');

if (totalIssues === 0) {
  console.log('✅ TOUTES LES ROUTES SONT CORRECTES !');
  console.log('🎉 Toutes les routes de navigation utilisent /tabs/');
  console.log('✨ L\'application respecte la structure de navigation Ionic\n');
} else {
  console.log(`❌ ${totalIssues} problème(s) détecté(s)`);
  console.log(`📝 ${totalChecks} vérifications effectuées\n`);
  console.log('💡 Actions recommandées:');
  console.log('   1. Corriger toutes les routes sans /tabs/');
  console.log('   2. Vérifier que App.tsx utilise <IonTabs>');
  console.log('   3. Re-tester l\'application après corrections\n');
}

console.log('='.repeat(60) + '\n');

process.exit(totalIssues > 0 ? 1 : 0);
