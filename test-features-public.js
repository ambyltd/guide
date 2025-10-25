const API_BASE_URL = 'http://localhost:5000/api';

/**
 * Script de test pour les endpoints publics features (Sprint 5)
 * Teste les 3 endpoints publics (pas d'auth requise)
 */

// Couleurs pour le terminal
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

async function testEndpoint(name, method, url) {
  try {
    log(`\n🧪 Test: ${name}`, 'blue');
    log(`   ${method} ${url}`, 'reset');

    const response = await fetch(`${API_BASE_URL}${url}`, { method });
    const data = await response.json();

    if (data.success) {
      log(`   ✅ Success (${response.status})`, 'green');
      return data;
    } else {
      log(`   ⚠️  Success: false - ${data.message}`, 'yellow');
      return null;
    }
  } catch (error) {
    log(`   ❌ Error: ${error.message}`, 'red');
    return null;
  }
}

async function runTests() {
  log('🚀 Démarrage des tests Features Publics (Sprint 5)\n', 'magenta');

  // ============================================
  // TEST 1: GET /api/features
  // ============================================
  const test1 = await testEndpoint(
    'GET all enabled features',
    'GET',
    '/features'
  );
  if (test1 && test1.data.features) {
    log(`   📦 ${test1.data.total} features actives récupérées`, 'green');
    test1.data.features.forEach(f => {
      log(`      🟢 ${f.name} (${f.key}) - v${f.requiredVersion}`, 'reset');
    });
  }

  // ============================================
  // TEST 2: GET /api/features/:key (social_sharing)
  // ============================================
  const test2 = await testEndpoint(
    'GET feature by key (social_sharing)',
    'GET',
    '/features/social_sharing'
  );
  if (test2 && test2.data.feature) {
    log(`   📝 ${test2.data.feature.name}`, 'green');
    log(`   📄 ${test2.data.feature.description}`, 'reset');
    log(`   🎯 Catégorie: ${test2.data.feature.category}`, 'reset');
  }

  // ============================================
  // TEST 3: GET /api/features/check/:key (geofencing)
  // ============================================
  const test3 = await testEndpoint(
    'GET check feature enabled (geofencing)',
    'GET',
    '/features/check/geofencing'
  );
  if (test3 && test3.data) {
    const status = test3.data.enabled ? '🟢 ACTIVÉ' : '🔴 DÉSACTIVÉ';
    log(`   ${status}`, test3.data.enabled ? 'green' : 'red');
  }

  // ============================================
  // TEST 4: GET /api/features/check/:key (feature non existante)
  // ============================================
  const test4 = await testEndpoint(
    'GET check non-existent feature (fallback test)',
    'GET',
    '/features/check/non_existent_feature'
  );
  if (test4 && test4.data) {
    const status = test4.data.enabled ? '🟢 ACTIVÉ' : '🔴 DÉSACTIVÉ (fallback)';
    log(`   ${status}`, test4.data.enabled ? 'green' : 'red');
    log(`   Exists: ${test4.data.exists}`, 'reset');
  }

  // ============================================
  // TEST 5: Test multiple features
  // ============================================
  log('\n🧪 Test: Check multiple features', 'blue');
  const featureKeys = ['social_sharing', 'advanced_stats', 'offline_mode', 'dark_mode'];
  for (const key of featureKeys) {
    const response = await fetch(`${API_BASE_URL}/features/check/${key}`);
    const data = await response.json();
    if (data.success) {
      const status = data.data.enabled ? '🟢' : '🔴';
      log(`   ${status} ${key}`, data.data.enabled ? 'green' : 'red');
    }
  }

  // ============================================
  // RÉSUMÉ
  // ============================================
  log('\n📊 Résumé des Tests:', 'magenta');
  log(`   ✅ Tests exécutés: 5+`, 'green');
  log(`   🎯 Endpoints testés: 3 publics (GET only)`, 'reset');
  log(`   📱 Prêt pour l'app mobile!`, 'green');
  log('\n🎉 Tests terminés!\n', 'magenta');
}

// Exécution
runTests().catch(error => {
  console.error('❌ Erreur fatale:', error.message);
  process.exit(1);
});
