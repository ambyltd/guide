const API_BASE_URL = 'http://localhost:5000/api';

/**
 * Script de test pour les endpoints admin (Sprint 5)
 * Teste les 11 endpoints créés
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

async function testEndpoint(name, method, url, data = null) {
  try {
    const config = {
      method,
      headers: {
        'Content-Type': 'application/json',
      },
      ...(data && { body: JSON.stringify(data) }),
    };

    log(`\n🧪 Test: ${name}`, 'blue');
    log(`   ${method} ${url}`, 'reset');

    const response = await fetch(`${API_BASE_URL}${url}`, config);
    const responseData = await response.json();

    if (responseData.success) {
      log(`   ✅ Success (${response.status})`, 'green');
      if (responseData.message) {
        log(`   📝 ${responseData.message}`, 'reset');
      }
      return responseData;
    } else {
      log(`   ⚠️  Success: false`, 'yellow');
      return responseData;
    }
  } catch (error) {
    log(`   ❌ Error: ${error.message}`, 'red');
    return null;
  }
}

async function runTests() {
  log('🚀 Démarrage des tests Admin Endpoints (Sprint 5)\n', 'magenta');

  let featureId = null;
  let testFeatureId = null;

  // ============================================
  // TEST 1: GET /api/admin/features
  // ============================================
  const test1 = await testEndpoint(
    'GET all features',
    'GET',
    '/admin/features'
  );
  if (test1 && test1.data.features.length > 0) {
    featureId = test1.data.features[0]._id || test1.data.features[0].id;
    log(`   📦 ${test1.data.total} features récupérés`, 'reset');
    log(`   🟢 Activés: ${test1.data.features.filter(f => f.enabled).length}`, 'green');
  }

  // ============================================
  // TEST 2: GET /api/admin/features?category=social
  // ============================================
  await testEndpoint(
    'GET features by category (social)',
    'GET',
    '/admin/features?category=social'
  );

  // ============================================
  // TEST 3: GET /api/admin/features?enabled=true
  // ============================================
  await testEndpoint(
    'GET enabled features',
    'GET',
    '/admin/features?enabled=true'
  );

  // ============================================
  // TEST 4: GET /api/admin/features/:id
  // ============================================
  if (featureId) {
    await testEndpoint(
      'GET feature by ID',
      'GET',
      `/admin/features/${featureId}`
    );
  }

  // ============================================
  // TEST 5: GET /api/admin/features/key/:key
  // ============================================
  await testEndpoint(
    'GET feature by key (social_sharing)',
    'GET',
    '/admin/features/key/social_sharing'
  );

  // ============================================
  // TEST 6: GET /api/admin/features/categories
  // ============================================
  const test6 = await testEndpoint(
    'GET features by category (stats)',
    'GET',
    '/admin/features/categories'
  );
  if (test6 && test6.data.categories) {
    log(`   📊 ${test6.data.categories.length} catégories trouvées`, 'reset');
  }

  // ============================================
  // TEST 7: POST /api/admin/features
  // ============================================
  const test7 = await testEndpoint(
    'POST create new feature',
    'POST',
    '/admin/features',
    {
      key: 'test_feature',
      name: 'Feature de Test',
      description: 'Ceci est une feature de test créée par le script de test automatisé.',
      enabled: false,
      requiredVersion: '1.0.0',
      category: 'experimental',
      metadata: {
        icon: 'TestIcon',
        color: '#00FF00',
        priority: 99
      }
    }
  );
  if (test7 && test7.data.feature) {
    testFeatureId = test7.data.feature._id || test7.data.feature.id;
  }

  // ============================================
  // TEST 8: PATCH /api/admin/features/:id/toggle
  // ============================================
  if (testFeatureId) {
    await testEndpoint(
      'PATCH toggle feature',
      'PATCH',
      `/admin/features/${testFeatureId}/toggle`
    );
  }

  // ============================================
  // TEST 9: PUT /api/admin/features/:id
  // ============================================
  if (testFeatureId) {
    await testEndpoint(
      'PUT update feature',
      'PUT',
      `/admin/features/${testFeatureId}`,
      {
        name: 'Feature de Test (Modifiée)',
        description: 'Description mise à jour par le script de test.'
      }
    );
  }

  // ============================================
  // TEST 10: DELETE /api/admin/features/:id
  // ============================================
  if (testFeatureId) {
    await testEndpoint(
      'DELETE feature',
      'DELETE',
      `/admin/features/${testFeatureId}`
    );
  }

  // ============================================
  // TEST 11: GET /api/admin/config
  // ============================================
  await testEndpoint(
    'GET config',
    'GET',
    '/admin/config'
  );

  // ============================================
  // TEST 12: GET /api/admin/stats
  // ============================================
  const test12 = await testEndpoint(
    'GET admin stats',
    'GET',
    '/admin/stats'
  );
  if (test12 && test12.data.stats) {
    log(`   📊 Total features: ${test12.data.stats.features.total}`, 'reset');
  }

  // ============================================
  // RÉSUMÉ
  // ============================================
  log('\n📊 Résumé des Tests:', 'magenta');
  log(`   ✅ Tests exécutés: 12`, 'green');
  log(`   🎯 Endpoints testés: 11 (GET: 6, POST: 1, PATCH: 1, PUT: 1, DELETE: 1)`, 'reset');
  log('\n🎉 Tests terminés!\n', 'magenta');
}

// Exécution
runTests().catch(error => {
  console.error('❌ Erreur fatale:', error.message);
  process.exit(1);
});
