/**
 * Script de test pour les endpoints Analytics (Sprint 4)
 * 
 * Tests:
 * 1. POST /api/analytics/track - Tracker une action
 * 2. GET /api/analytics/users/:userId/trends?timeframe=7d - Tendances 7j
 * 3. GET /api/analytics/users/:userId/compare - Comparaison avec pairs
 * 4. GET /api/analytics/dashboard - Analytics admin
 * 5. GET /api/users/leaderboard?sortBy=attractionsVisited&timeframe=7d - Classement
 */

const BASE_URL = 'http://localhost:5000/api';

// Test counter
let totalTests = 0;
let passedTests = 0;
let failedTests = 0;

// Test user ID (doit exister dans la base)
const TEST_USER_ID = 'user-123';
const TEST_ATTRACTION_ID = 'attraction-1';

// Helper pour tester un endpoint
async function testEndpoint(name, method, url, body = null) {
  totalTests++;
  console.log(`\n🧪 Test ${totalTests}: ${name}`);
  console.log(`   ${method} ${url}`);

  try {
    const options = {
      method,
      headers: {
        'Content-Type': 'application/json',
      },
    };

    if (body) {
      options.body = JSON.stringify(body);
    }

    const response = await fetch(url, options);
    const data = await response.json();

    if (response.ok && data.success) {
      console.log(`   ✅ PASS (${response.status})`);
      console.log(`   📊 Data:`, JSON.stringify(data, null, 2).slice(0, 200) + '...');
      passedTests++;
      return data;
    } else {
      console.log(`   ❌ FAIL (${response.status})`);
      console.log(`   Error:`, data.error || data.message);
      failedTests++;
      return null;
    }
  } catch (error) {
    console.log(`   ❌ FAIL (Network error)`);
    console.log(`   Error:`, error.message);
    failedTests++;
    return null;
  }
}

// Helper pour attendre
const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

async function runTests() {
  console.log('🚀 Démarrage des tests Backend API - Sprint 4 Analytics\n');
  console.log('═'.repeat(60));

  // ============================================
  // Test 1: Tracker une action 'visit'
  // ============================================
  await testEndpoint(
    'Track action (visit)',
    'POST',
    `${BASE_URL}/analytics/track`,
    {
      userId: TEST_USER_ID,
      action: 'visit',
      attractionId: TEST_ATTRACTION_ID,
      metadata: {},
    }
  );

  await wait(500);

  // ============================================
  // Test 2: Tracker une action 'listen' avec durée
  // ============================================
  await testEndpoint(
    'Track action (listen)',
    'POST',
    `${BASE_URL}/analytics/track`,
    {
      userId: TEST_USER_ID,
      action: 'listen',
      attractionId: TEST_ATTRACTION_ID,
      audioGuideId: 'audio-1',
      metadata: {
        duration: 120, // 2 minutes
      },
    }
  );

  await wait(500);

  // ============================================
  // Test 3: Tracker une action 'share'
  // ============================================
  await testEndpoint(
    'Track action (share)',
    'POST',
    `${BASE_URL}/analytics/track`,
    {
      userId: TEST_USER_ID,
      action: 'share',
      attractionId: TEST_ATTRACTION_ID,
      metadata: {
        platform: 'whatsapp',
      },
    }
  );

  await wait(500);

  // ============================================
  // Test 4: Récupérer tendances 7j
  // ============================================
  await testEndpoint(
    'Get user trends (7d)',
    'GET',
    `${BASE_URL}/analytics/users/${TEST_USER_ID}/trends?timeframe=7d`
  );

  await wait(500);

  // ============================================
  // Test 5: Récupérer tendances 30j
  // ============================================
  await testEndpoint(
    'Get user trends (30d)',
    'GET',
    `${BASE_URL}/analytics/users/${TEST_USER_ID}/trends?timeframe=30d`
  );

  await wait(500);

  // ============================================
  // Test 6: Comparer avec peers
  // ============================================
  await testEndpoint(
    'Compare with peers',
    'GET',
    `${BASE_URL}/analytics/users/${TEST_USER_ID}/compare`
  );

  await wait(500);

  // ============================================
  // Test 7: Dashboard analytics (admin)
  // ============================================
  await testEndpoint(
    'Get dashboard analytics',
    'GET',
    `${BASE_URL}/analytics/dashboard`
  );

  await wait(500);

  // ============================================
  // Test 8: Leaderboard (all time)
  // ============================================
  await testEndpoint(
    'Get leaderboard (all time)',
    'GET',
    `${BASE_URL}/users/leaderboard?sortBy=attractionsVisited&limit=10`
  );

  await wait(500);

  // ============================================
  // Test 9: Leaderboard (7 derniers jours)
  // ============================================
  await testEndpoint(
    'Get leaderboard (7d)',
    'GET',
    `${BASE_URL}/users/leaderboard?sortBy=attractionsVisited&limit=10&timeframe=7d`
  );

  await wait(500);

  // ============================================
  // Test 10: Leaderboard (tri par shareCount)
  // ============================================
  await testEndpoint(
    'Get leaderboard (shareCount)',
    'GET',
    `${BASE_URL}/users/leaderboard?sortBy=shareCount&limit=10`
  );

  // ============================================
  // Résultats finaux
  // ============================================
  console.log('\n' + '═'.repeat(60));
  console.log('📊 RÉSULTATS FINAUX\n');
  console.log(`   Total tests    : ${totalTests}`);
  console.log(`   ✅ Réussis     : ${passedTests} (${Math.round((passedTests / totalTests) * 100)}%)`);
  console.log(`   ❌ Échoués     : ${failedTests}`);
  console.log('═'.repeat(60));

  if (failedTests === 0) {
    console.log('\n🎉 TOUS LES TESTS PASSÉS !\n');
  } else {
    console.log('\n⚠️  CERTAINS TESTS ONT ÉCHOUÉ\n');
    console.log('Vérifiez que:');
    console.log('1. Le backend est lancé (npm run dev)');
    console.log('2. MongoDB est connecté');
    console.log(`3. L'utilisateur ${TEST_USER_ID} existe`);
    console.log(`4. L'attraction ${TEST_ATTRACTION_ID} existe`);
  }

  process.exit(failedTests === 0 ? 0 : 1);
}

// Lancer les tests
runTests().catch((error) => {
  console.error('\n❌ ERREUR FATALE:', error);
  process.exit(1);
});
