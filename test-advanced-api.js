const fetch = require('node-fetch');

const BASE_URL = 'http://localhost:5000/api';

// Configuration de test
const TEST_CONFIG = {
  testLocation: {
    latitude: 5.3600,
    longitude: -4.0083,
    accuracy: 15
  },
  sessionId: `test_session_${Date.now()}`,
  userId: `test_user_${Date.now()}`
};

// Couleurs pour la console
const colors = {
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  reset: '\x1b[0m'
};

async function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

async function testEndpoint(name, method, url, data = null, headers = {}) {
  try {
    log(`\n🧪 Test: ${name}`, 'blue');
    
    const options = {
      method,
      headers: {
        'Content-Type': 'application/json',
        'x-session-id': TEST_CONFIG.sessionId,
        'x-user-id': TEST_CONFIG.userId,
        ...headers
      }
    };

    if (data) {
      options.body = JSON.stringify(data);
    }

    const response = await fetch(`${BASE_URL}${url}`, options);
    const result = await response.json();

    if (response.ok && result.success !== false) {
      log(`✅ ${name} - Succès`, 'green');
      return { success: true, data: result };
    } else {
      log(`❌ ${name} - Échec: ${result.message || 'Erreur inconnue'}`, 'red');
      return { success: false, error: result };
    }
  } catch (error) {
    log(`❌ ${name} - Erreur: ${error.message}`, 'red');
    return { success: false, error: error.message };
  }
}

async function runAdvancedTests() {
  log('🚀 Démarrage des tests API Avancée v2.0', 'yellow');

  const results = [];

  // 1. Test de santé de l'API
  const healthResult = await testEndpoint(
    'Health Check',
    'GET',
    '/health'
  );
  results.push(healthResult);

  // 2. Test de démarrage de session analytics
  const sessionResult = await testEndpoint(
    'Démarrage de session',
    'POST',
    '/analytics/session/start',
    {
      sessionId: TEST_CONFIG.sessionId,
      userId: TEST_CONFIG.userId,
      deviceInfo: {
        platform: 'web',
        version: '2.0.0',
        userAgent: 'TestAgent/1.0',
        language: 'fr'
      },
      startLocation: TEST_CONFIG.testLocation
    }
  );
  results.push(sessionResult);

  // 3. Test de recherche d'attractions GPS
  const nearbyResult = await testEndpoint(
    'Recherche GPS attractions proches',
    'GET',
    `/gps/nearby-attractions?lat=${TEST_CONFIG.testLocation.latitude}&lng=${TEST_CONFIG.testLocation.longitude}&radius=10000&includeAnalytics=true`
  );
  results.push(nearbyResult);

  let attractionId = null;
  if (nearbyResult.success && nearbyResult.data.data.attractions.length > 0) {
    attractionId = nearbyResult.data.data.attractions[0]._id;
    log(`📍 Attraction trouvée pour les tests: ${attractionId}`, 'blue');
  }

  // 4. Test de détection de guides audio (nécessite une attraction)
  if (attractionId) {
    const audioDetectionResult = await testEndpoint(
      'Détection guides audio GPS',
      'POST',
      '/gps/detect-audio-guides',
      {
        latitude: TEST_CONFIG.testLocation.latitude,
        longitude: TEST_CONFIG.testLocation.longitude,
        accuracy: TEST_CONFIG.testLocation.accuracy
      }
    );
    results.push(audioDetectionResult);
  } else {
    log('⚠️  Pas d\'attraction trouvée, skip test détection audio', 'yellow');
  }

  // 5. Test de tracking de localisation
  const trackingResult = await testEndpoint(
    'Tracking localisation',
    'POST',
    '/gps/track-location',
    {
      latitude: TEST_CONFIG.testLocation.latitude + 0.001,
      longitude: TEST_CONFIG.testLocation.longitude + 0.001,
      accuracy: 10,
      speed: 1.5,
      heading: 180,
      context: 'exploring'
    }
  );
  results.push(trackingResult);

  // 6. Test d'optimisation de route (avec plusieurs attractions)
  if (attractionId) {
    // Récupérer plus d'attractions pour l'optimisation
    const moreAttractionsResult = await testEndpoint(
      'Récupération attractions pour route',
      'GET',
      '/attractions?limit=5'
    );

    if (moreAttractionsResult.success && moreAttractionsResult.data.data.attractions.length >= 2) {
      const attractionIds = moreAttractionsResult.data.data.attractions
        .slice(0, 3)
        .map(a => a._id);

      const routeOptResult = await testEndpoint(
        'Optimisation de route',
        'POST',
        '/gps/optimize-route',
        {
          attractions: attractionIds,
          startLocation: {
            latitude: TEST_CONFIG.testLocation.latitude,
            longitude: TEST_CONFIG.testLocation.longitude
          },
          constraints: {
            maxDuration: 240,
            maxDistance: 15000,
            preferredCategories: ['cultural', 'museum'],
            avoidCrowds: false
          }
        }
      );
      results.push(routeOptResult);
    }
  }

  // 7. Test d'enregistrement d'interaction
  const interactionResult = await testEndpoint(
    'Enregistrement interaction',
    'POST',
    '/analytics/interaction',
    {
      sessionId: TEST_CONFIG.sessionId,
      type: 'search',
      target: 'attractions',
      context: 'test_browsing',
      duration: 5000,
      metadata: {
        testData: true
      }
    }
  );
  results.push(interactionResult);

  // 8. Test d'enregistrement de comportement d'écoute
  if (attractionId) {
    const listeningResult = await testEndpoint(
      'Enregistrement comportement écoute',
      'POST',
      '/gps/listening-behavior',
      {
        audioGuideId: attractionId, // Utilise l'ID attraction comme proxy
        startTime: new Date(Date.now() - 180000).toISOString(),
        endTime: new Date().toISOString(),
        duration: 180,
        completionPercentage: 85,
        pauseCount: 2,
        rewindCount: 1,
        location: TEST_CONFIG.testLocation,
        qualityRating: 4
      }
    );
    results.push(listeningResult);
  }

  // 9. Test de récupération de profil de personnalisation
  const profileResult = await testEndpoint(
    'Profil de personnalisation',
    'GET',
    `/analytics/personalization/${TEST_CONFIG.userId}`
  );
  results.push(profileResult);

  // 10. Test de mise à jour du profil
  const updateProfileResult = await testEndpoint(
    'Mise à jour profil personnalisation',
    'PUT',
    `/analytics/personalization/${TEST_CONFIG.userId}`,
    {
      preferences: {
        categories: {
          cultural: 0.8,
          historical: 0.6,
          nature: 0.4
        },
        duration: 'medium',
        language: 'fr'
      },
      behaviorScore: {
        explorer: 0.7,
        planner: 0.3,
        social: 0.5,
        local: 0.6,
        cultural: 0.8
      }
    }
  );
  results.push(updateProfileResult);

  // 11. Test d'insights en temps réel
  const insightsResult = await testEndpoint(
    'Insights temps réel',
    'GET',
    '/gps/insights?timeRange=24h&includePersonalized=true'
  );
  results.push(insightsResult);

  // 12. Test du dashboard analytics
  const dashboardResult = await testEndpoint(
    'Dashboard analytics',
    'GET',
    '/analytics/dashboard'
  );
  results.push(dashboardResult);

  // 13. Test d'analytics d'attraction
  if (attractionId) {
    const attractionAnalyticsResult = await testEndpoint(
      'Analytics attraction',
      'GET',
      `/attractions/${attractionId}/analytics?timeRange=30d`
    );
    results.push(attractionAnalyticsResult);
  }

  // 14. Test de fin de session
  const endSessionResult = await testEndpoint(
    'Fin de session',
    'POST',
    '/analytics/session/end',
    {
      sessionId: TEST_CONFIG.sessionId,
      endLocation: {
        latitude: TEST_CONFIG.testLocation.latitude + 0.002,
        longitude: TEST_CONFIG.testLocation.longitude + 0.002,
        accuracy: 12
      },
      performanceMetrics: {
        loadTime: 1500,
        errorCount: 0
      }
    }
  );
  results.push(endSessionResult);

  // 15. Test de la nouvelle version des attractions avec analytics
  const attractionsAdvancedResult = await testEndpoint(
    'Attractions avec analytics',
    'GET',
    `/attractions?lat=${TEST_CONFIG.testLocation.latitude}&lng=${TEST_CONFIG.testLocation.longitude}&includeAnalytics=true&includeML=true&sortBy=popularity`
  );
  results.push(attractionsAdvancedResult);

  // Résumé des résultats
  log('\n📊 Résumé des tests:', 'yellow');
  const totalTests = results.length;
  const passedTests = results.filter(r => r.success).length;
  const failedTests = totalTests - passedTests;

  log(`✅ Tests réussis: ${passedTests}/${totalTests}`, 'green');
  if (failedTests > 0) {
    log(`❌ Tests échoués: ${failedTests}/${totalTests}`, 'red');
  }

  const successRate = ((passedTests / totalTests) * 100).toFixed(1);
  if (successRate >= 90) {
    log(`🎉 Taux de réussite: ${successRate}% - Excellent!`, 'green');
  } else if (successRate >= 70) {
    log(`👍 Taux de réussite: ${successRate}% - Bon`, 'yellow');
  } else {
    log(`⚠️  Taux de réussite: ${successRate}% - Nécessite attention`, 'red');
  }

  // Détails des échecs
  const failures = results.filter(r => !r.success);
  if (failures.length > 0) {
    log('\n❌ Détails des échecs:', 'red');
    failures.forEach((failure, index) => {
      log(`${index + 1}. ${failure.error}`, 'red');
    });
  }

  log('\n🏁 Tests terminés', 'blue');
}

// Fonction pour tester les performances
async function performanceTest() {
  log('\n⚡ Test de performance...', 'yellow');
  
  const iterations = 10;
  const times = [];

  for (let i = 0; i < iterations; i++) {
    const start = Date.now();
    
    await testEndpoint(
      `Performance test ${i + 1}`,
      'GET',
      `/gps/nearby-attractions?lat=${TEST_CONFIG.testLocation.latitude}&lng=${TEST_CONFIG.testLocation.longitude}&radius=5000`
    );
    
    const duration = Date.now() - start;
    times.push(duration);
  }

  const avgTime = times.reduce((a, b) => a + b) / times.length;
  const minTime = Math.min(...times);
  const maxTime = Math.max(...times);

  log(`📊 Performance GPS recherche (${iterations} tests):`, 'blue');
  log(`   Temps moyen: ${avgTime.toFixed(0)}ms`, 'green');
  log(`   Temps min: ${minTime}ms`, 'green');
  log(`   Temps max: ${maxTime}ms`, 'green');

  if (avgTime < 500) {
    log('   🚀 Performance excellente!', 'green');
  } else if (avgTime < 1000) {
    log('   👍 Performance correcte', 'yellow');
  } else {
    log('   ⚠️  Performance à améliorer', 'red');
  }
}

// Exécution des tests
async function main() {
  try {
    await runAdvancedTests();
    await performanceTest();
  } catch (error) {
    log(`💥 Erreur critique: ${error.message}`, 'red');
    process.exit(1);
  }
}

if (require.main === module) {
  main();
}

module.exports = { runAdvancedTests, performanceTest };