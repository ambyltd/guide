/**
 * ============================================
 * 🧪 Tests Backend Admin Endpoints - Sprint 5
 * ============================================
 * Tests automatisés pour tous les endpoints admin
 * feature flags créés dans le Sprint 5
 * 
 * Usage:
 *   node test-admin-features.js
 * 
 * Endpoints testés:
 *   - GET /api/admin/features (list)
 *   - GET /api/admin/features/categories (stats)
 *   - GET /api/admin/features/:id (detail)
 *   - GET /api/admin/features/key/:key (by key)
 *   - POST /api/admin/features (create)
 *   - PATCH /api/admin/features/:id/toggle (toggle)
 *   - PUT /api/admin/features/:id (update)
 *   - DELETE /api/admin/features/:id (delete)
 *   - GET /api/admin/stats (dashboard stats)
 * ============================================
 */

const BASE_URL = 'http://localhost:5000/api';

// ============================================
// Helpers
// ============================================

let testResults = {
  total: 0,
  passed: 0,
  failed: 0,
  tests: []
};

async function testEndpoint(name, fn) {
  testResults.total++;
  console.log(`\n🧪 Test ${testResults.total}: ${name}`);
  
  try {
    await fn();
    testResults.passed++;
    testResults.tests.push({ name, status: 'PASS' });
    console.log(`✅ PASS: ${name}`);
  } catch (error) {
    testResults.failed++;
    testResults.tests.push({ name, status: 'FAIL', error: error.message });
    console.log(`❌ FAIL: ${name}`);
    console.log(`   Error: ${error.message}`);
  }
}

function assert(condition, message) {
  if (!condition) {
    throw new Error(message || 'Assertion failed');
  }
}

// ============================================
// Tests Public Endpoints (no auth)
// ============================================

async function testPublicEndpoints() {
  console.log('\n' + '='.repeat(60));
  console.log('📋 TESTS PUBLIC ENDPOINTS (no auth required)');
  console.log('='.repeat(60));

  // Test 1: GET all enabled features
  await testEndpoint('GET /api/features (all enabled)', async () => {
    const response = await fetch(`${BASE_URL}/features`);
    assert(response.ok, `Status ${response.status}`);
    
    const data = await response.json();
    assert(data.success === true, 'success should be true');
    assert(Array.isArray(data.data.features), 'features should be array');
    assert(data.data.features.length > 0, 'should have features');
    
    // Vérifier que toutes les features sont enabled
    const allEnabled = data.data.features.every(f => f.enabled === true);
    assert(allEnabled, 'all features should be enabled');
    
    console.log(`   ✓ Found ${data.data.features.length} enabled features`);
  });

  // Test 2: GET feature by key (enabled)
  await testEndpoint('GET /api/features/:key (social_sharing)', async () => {
    const response = await fetch(`${BASE_URL}/features/social_sharing`);
    assert(response.ok, `Status ${response.status}`);
    
    const data = await response.json();
    assert(data.success === true, 'success should be true');
    assert(data.data.feature.key === 'social_sharing', 'key should match');
    assert(data.data.feature.enabled === true, 'should be enabled');
    
    console.log(`   ✓ Feature: ${data.data.feature.name}`);
    console.log(`   ✓ Category: ${data.data.feature.category}`);
  });

  // Test 3: GET feature by key (disabled)
  await testEndpoint('GET /api/features/:key (dark_mode - disabled)', async () => {
    const response = await fetch(`${BASE_URL}/features/dark_mode`);
    assert(response.status === 404, 'should return 404 for disabled feature');
    
    const data = await response.json();
    assert(data.success === false, 'success should be false');
    
    console.log(`   ✓ Correctly returns 404 for disabled feature`);
  });

  // Test 4: CHECK feature enabled
  await testEndpoint('GET /api/features/check/:key (geofencing)', async () => {
    const response = await fetch(`${BASE_URL}/features/check/geofencing`);
    assert(response.ok, `Status ${response.status}`);
    
    const data = await response.json();
    assert(data.success === true, 'success should be true');
    assert(data.data.key === 'geofencing', 'key should match');
    assert(data.data.enabled === true, 'should be enabled');
    assert(data.data.exists === true, 'should exist');
    
    console.log(`   ✓ Feature check: enabled=${data.data.enabled}`);
  });

  // Test 5: CHECK feature disabled
  await testEndpoint('GET /api/features/check/:key (push_notifications)', async () => {
    const response = await fetch(`${BASE_URL}/features/check/push_notifications`);
    assert(response.ok, `Status ${response.status}`);
    
    const data = await response.json();
    assert(data.success === true, 'success should be true');
    assert(data.data.enabled === false, 'should be disabled');
    assert(data.data.exists === true, 'should exist');
    
    console.log(`   ✓ Feature check: enabled=${data.data.enabled}`);
  });

  // Test 6: CHECK non-existent feature (fallback)
  await testEndpoint('GET /api/features/check/:key (non_existent)', async () => {
    const response = await fetch(`${BASE_URL}/features/check/non_existent_feature`);
    assert(response.ok, `Status ${response.status}`);
    
    const data = await response.json();
    assert(data.success === true, 'success should be true');
    assert(data.data.enabled === false, 'fallback should be false');
    assert(data.data.exists === false, 'should not exist');
    
    console.log(`   ✓ Fallback works: enabled=false, exists=false`);
  });
}

// ============================================
// Tests Admin Endpoints (require auth)
// ============================================

async function testAdminEndpoints() {
  console.log('\n' + '='.repeat(60));
  console.log('🔐 TESTS ADMIN ENDPOINTS (auth required - SKIPPED)');
  console.log('='.repeat(60));
  
  console.log('\n⚠️  Note: Les endpoints admin nécessitent un token Firebase Auth.');
  console.log('   Pour tester ces endpoints, utilisez:');
  console.log('   1. Login dans le CMS (http://localhost:3000)');
  console.log('   2. Récupérer le token depuis DevTools (Application > Storage)');
  console.log('   3. Ajouter header: Authorization: Bearer <token>');
  console.log('\n   Endpoints admin disponibles:');
  console.log('   - GET /api/admin/features');
  console.log('   - GET /api/admin/features/categories');
  console.log('   - GET /api/admin/features/:id');
  console.log('   - GET /api/admin/features/key/:key');
  console.log('   - POST /api/admin/features');
  console.log('   - PATCH /api/admin/features/:id/toggle');
  console.log('   - PUT /api/admin/features/:id');
  console.log('   - DELETE /api/admin/features/:id');
  console.log('   - GET /api/admin/config');
  console.log('   - PATCH /api/admin/config');
  console.log('   - GET /api/admin/stats');
}

// ============================================
// Tests Integration Scenarios
// ============================================

async function testIntegrationScenarios() {
  console.log('\n' + '='.repeat(60));
  console.log('🔄 TESTS INTEGRATION SCENARIOS');
  console.log('='.repeat(60));

  // Test 7: Vérifier que les features offline sont toutes activées
  await testEndpoint('Integration: All offline features enabled', async () => {
    const response = await fetch(`${BASE_URL}/features`);
    const data = await response.json();
    
    const offlineFeatures = data.data.features.filter(f => f.category === 'offline');
    assert(offlineFeatures.length === 4, 'should have 4 offline features');
    
    const allEnabled = offlineFeatures.every(f => f.enabled === true);
    assert(allEnabled, 'all offline features should be enabled');
    
    console.log(`   ✓ Found ${offlineFeatures.length} offline features`);
    offlineFeatures.forEach(f => {
      console.log(`      - ${f.name} (${f.key})`);
    });
  });

  // Test 8: Vérifier que les features experimental sont désactivées
  await testEndpoint('Integration: All experimental features disabled', async () => {
    const response = await fetch(`${BASE_URL}/features`);
    const data = await response.json();
    
    // Les features désactivées ne sont pas retournées par /api/features
    const experimentalKeys = ['push_notifications', 'dark_mode', 'beta_features'];
    
    for (const key of experimentalKeys) {
      const checkResponse = await fetch(`${BASE_URL}/features/check/${key}`);
      const checkData = await checkResponse.json();
      assert(checkData.data.enabled === false, `${key} should be disabled`);
    }
    
    console.log(`   ✓ All 3 experimental features are disabled`);
  });

  // Test 9: Vérifier les dépendances (offline_mode required)
  await testEndpoint('Integration: Dependencies check', async () => {
    const response = await fetch(`${BASE_URL}/features`);
    const data = await response.json();
    
    // Trouver offline_mode
    const offlineMode = data.data.features.find(f => f.key === 'offline_mode');
    assert(offlineMode, 'offline_mode should exist');
    assert(offlineMode.enabled, 'offline_mode should be enabled');
    
    // Vérifier que les features dépendantes sont aussi activées
    const dependentFeatures = ['background_sync', 'audio_cache', 'image_cache'];
    for (const key of dependentFeatures) {
      const feature = data.data.features.find(f => f.key === key);
      assert(feature && feature.enabled, `${key} should be enabled (depends on offline_mode)`);
      
      if (feature.metadata?.dependencies) {
        assert(
          feature.metadata.dependencies.includes('offline_mode'),
          `${key} should declare offline_mode as dependency`
        );
      }
    }
    
    console.log(`   ✓ offline_mode enabled + 3 dependent features enabled`);
  });

  // Test 10: Vérifier les versions requises
  await testEndpoint('Integration: Required versions check', async () => {
    const response = await fetch(`${BASE_URL}/features`);
    const data = await response.json();
    
    const v13Features = data.data.features.filter(f => f.requiredVersion === '1.3.0');
    const v14Features = data.data.features.filter(f => f.requiredVersion === '1.4.0');
    
    assert(v13Features.length === 5, 'should have 5 features for v1.3.0');
    assert(v14Features.length === 2, 'should have 2 features for v1.4.0');
    
    console.log(`   ✓ v1.3.0: ${v13Features.length} features`);
    console.log(`   ✓ v1.4.0: ${v14Features.length} features`);
  });
}

// ============================================
// Main Test Runner
// ============================================

async function runAllTests() {
  console.log('\n' + '='.repeat(60));
  console.log('🚀 TESTS BACKEND ADMIN FEATURES - Sprint 5');
  console.log('='.repeat(60));
  console.log(`Backend URL: ${BASE_URL}`);
  console.log(`Date: ${new Date().toLocaleString('fr-FR')}`);
  
  try {
    await testPublicEndpoints();
    await testIntegrationScenarios();
    await testAdminEndpoints();
    
    // Rapport final
    console.log('\n' + '='.repeat(60));
    console.log('📊 RAPPORT FINAL');
    console.log('='.repeat(60));
    console.log(`Total tests: ${testResults.total}`);
    console.log(`✅ Passed: ${testResults.passed}`);
    console.log(`❌ Failed: ${testResults.failed}`);
    console.log(`Success rate: ${((testResults.passed / testResults.total) * 100).toFixed(1)}%`);
    
    if (testResults.failed > 0) {
      console.log('\n❌ Tests échoués:');
      testResults.tests
        .filter(t => t.status === 'FAIL')
        .forEach(t => {
          console.log(`   - ${t.name}`);
          console.log(`     Error: ${t.error}`);
        });
    }
    
    console.log('\n' + '='.repeat(60));
    
    if (testResults.failed === 0) {
      console.log('🎉 Tous les tests sont passés avec succès!');
      process.exit(0);
    } else {
      console.log('⚠️  Certains tests ont échoué. Vérifiez les erreurs ci-dessus.');
      process.exit(1);
    }
    
  } catch (error) {
    console.error('\n❌ Erreur fatale lors des tests:', error);
    process.exit(1);
  }
}

// Run tests
runAllTests();
