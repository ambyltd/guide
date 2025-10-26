/**
 * Script de Validation Post-Fix Memory Leak
 * Vérifie que tous les fichiers ont été correctement modifiés
 */

const fs = require('fs');
const path = require('path');

console.log('🔍 Validation du Fix Memory Leak - Pattern Ref-Based Cleanup\n');
console.log('═'.repeat(70) + '\n');

const pagesDir = path.join(__dirname, 'src', 'pages');
const pagesToCheck = [
  'Home.tsx',
  'Favorites.tsx',
  'Map.tsx',
  'Profile.tsx',
  'AttractionDetail.tsx'
];

let allTestsPassed = true;
const results = [];

// Test 1: Vérifier que tous les useRef sont initialisés à false
console.log('📋 Test 1: Vérification useRef(false)...');
pagesToCheck.forEach(page => {
  const filePath = path.join(pagesDir, page);
  const content = fs.readFileSync(filePath, 'utf8');
  
  // Chercher les patterns incorrects
  const badPattern = /isMountedRef\s*=\s*useRef\(true\)/g;
  const goodPattern = /isMountedRef\s*=\s*useRef\(false\)/g;
  
  const hasBadPattern = badPattern.test(content);
  const hasGoodPattern = goodPattern.test(content);
  
  if (hasBadPattern) {
    console.log(`  ❌ ${page}: useRef(true) trouvé - ERREUR!`);
    results.push({ page, test: 'useRef', status: 'FAIL' });
    allTestsPassed = false;
  } else if (hasGoodPattern) {
    console.log(`  ✅ ${page}: useRef(false) correct`);
    results.push({ page, test: 'useRef', status: 'PASS' });
  } else {
    console.log(`  ⚠️  ${page}: Aucun isMountedRef trouvé`);
    results.push({ page, test: 'useRef', status: 'WARN' });
  }
});

console.log('\n' + '─'.repeat(70) + '\n');

// Test 2: Vérifier la présence de useIonViewDidEnter
console.log('📋 Test 2: Vérification useIonViewDidEnter...');
pagesToCheck.forEach(page => {
  const filePath = path.join(pagesDir, page);
  const content = fs.readFileSync(filePath, 'utf8');
  
  const hasImport = /useIonViewDidEnter/.test(content);
  const hasUsage = /useIonViewDidEnter\(\(\)\s*=>\s*\{/g.test(content);
  const setsRefTrue = /isMountedRef\.current\s*=\s*true/g.test(content);
  
  if (hasImport && hasUsage && setsRefTrue) {
    console.log(`  ✅ ${page}: useIonViewDidEnter correctement implémenté`);
    results.push({ page, test: 'DidEnter', status: 'PASS' });
  } else {
    console.log(`  ❌ ${page}: useIonViewDidEnter incomplet`);
    if (!hasImport) console.log(`      - Import manquant`);
    if (!hasUsage) console.log(`      - Utilisation manquante`);
    if (!setsRefTrue) console.log(`      - isMountedRef.current = true manquant`);
    results.push({ page, test: 'DidEnter', status: 'FAIL' });
    allTestsPassed = false;
  }
});

console.log('\n' + '─'.repeat(70) + '\n');

// Test 3: Vérifier la présence de useIonViewWillLeave
console.log('📋 Test 3: Vérification useIonViewWillLeave...');
pagesToCheck.forEach(page => {
  const filePath = path.join(pagesDir, page);
  const content = fs.readFileSync(filePath, 'utf8');
  
  const hasImport = /useIonViewWillLeave/.test(content);
  const hasUsage = /useIonViewWillLeave\(\(\)\s*=>\s*\{/g.test(content);
  const setsRefFalse = /isMountedRef\.current\s*=\s*false/g.test(content);
  
  if (hasImport && hasUsage && setsRefFalse) {
    console.log(`  ✅ ${page}: useIonViewWillLeave correctement implémenté`);
    results.push({ page, test: 'WillLeave', status: 'PASS' });
  } else {
    console.log(`  ❌ ${page}: useIonViewWillLeave incomplet`);
    if (!hasImport) console.log(`      - Import manquant`);
    if (!hasUsage) console.log(`      - Utilisation manquante`);
    if (!setsRefFalse) console.log(`      - isMountedRef.current = false manquant`);
    results.push({ page, test: 'WillLeave', status: 'FAIL' });
    allTestsPassed = false;
  }
});

console.log('\n' + '─'.repeat(70) + '\n');

// Test 4: Vérifier que les fonctions async utilisent isMountedRef.current
console.log('📋 Test 4: Vérification utilisation isMountedRef.current...');
pagesToCheck.forEach(page => {
  const filePath = path.join(pagesDir, page);
  const content = fs.readFileSync(filePath, 'utf8');
  
  // Chercher les patterns d'utilisation
  const usesRef = /if\s*\(\s*!isMountedRef\.current\s*\)\s*return/g;
  const matches = content.match(usesRef);
  const count = matches ? matches.length : 0;
  
  if (count > 0) {
    console.log(`  ✅ ${page}: ${count} vérification(s) isMountedRef.current trouvée(s)`);
    results.push({ page, test: 'RefUsage', status: 'PASS', count });
  } else {
    console.log(`  ⚠️  ${page}: Aucune vérification isMountedRef.current trouvée`);
    results.push({ page, test: 'RefUsage', status: 'WARN' });
  }
});

console.log('\n' + '─'.repeat(70) + '\n');

// Test 5: Vérifier qu'il n'y a plus de paramètres isMounted
console.log('📋 Test 5: Vérification absence paramètres isMounted...');
pagesToCheck.forEach(page => {
  const filePath = path.join(pagesDir, page);
  const content = fs.readFileSync(filePath, 'utf8');
  
  // Chercher les anciens patterns avec paramètre
  const oldPattern = /const\s+load\w+\s*=\s*async\s*\(\s*isMounted\s*[=:]?\s*true\s*\)/g;
  const matches = content.match(oldPattern);
  
  if (matches && matches.length > 0) {
    console.log(`  ❌ ${page}: ${matches.length} fonction(s) avec ancien pattern trouvée(s)`);
    matches.forEach(m => console.log(`      - ${m.substring(0, 50)}...`));
    results.push({ page, test: 'NoOldPattern', status: 'FAIL' });
    allTestsPassed = false;
  } else {
    console.log(`  ✅ ${page}: Aucun ancien pattern détecté`);
    results.push({ page, test: 'NoOldPattern', status: 'PASS' });
  }
});

console.log('\n' + '═'.repeat(70) + '\n');

// Résumé
console.log('📊 RÉSUMÉ DES TESTS\n');

const summary = {
  total: results.length,
  passed: results.filter(r => r.status === 'PASS').length,
  failed: results.filter(r => r.status === 'FAIL').length,
  warnings: results.filter(r => r.status === 'WARN').length
};

console.log(`Total de tests: ${summary.total}`);
console.log(`✅ Réussis: ${summary.passed}`);
console.log(`❌ Échecs: ${summary.failed}`);
console.log(`⚠️  Warnings: ${summary.warnings}`);

console.log('\n' + '─'.repeat(70) + '\n');

// Détails par page
console.log('📄 DÉTAILS PAR PAGE\n');
pagesToCheck.forEach(page => {
  const pageResults = results.filter(r => r.page === page);
  const passed = pageResults.filter(r => r.status === 'PASS').length;
  const total = pageResults.length;
  
  const icon = passed === total ? '✅' : (passed > 0 ? '⚠️' : '❌');
  console.log(`${icon} ${page}: ${passed}/${total} tests réussis`);
});

console.log('\n' + '═'.repeat(70) + '\n');

// Conclusion
if (allTestsPassed && summary.failed === 0) {
  console.log('🎉 SUCCÈS! Tous les fichiers sont correctement configurés.\n');
  console.log('Prochaines étapes:');
  console.log('  1. Lancer le serveur: npm run dev');
  console.log('  2. Ouvrir http://localhost:5173/');
  console.log('  3. Ouvrir DevTools Console (F12)');
  console.log('  4. Naviguer entre les tabs et vérifier l\'absence de warnings\n');
  process.exit(0);
} else {
  console.log('❌ ÉCHEC! Des problèmes ont été détectés.\n');
  console.log('Actions requises:');
  console.log('  1. Corriger les erreurs mentionnées ci-dessus');
  console.log('  2. Relancer ce script: node validate-memory-leak-fix.js');
  console.log('  3. Consulter TEST_MEMORY_LEAK_FIX.md pour les détails\n');
  process.exit(1);
}
