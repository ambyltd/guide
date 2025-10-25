/**
 * Script de test des endpoints Favorites, Reviews et UserStats
 * 
 * Ce script teste:
 * - POST /api/favorites (ajouter favori)
 * - GET /api/favorites (récupérer favoris)
 * - DELETE /api/favorites/:id (supprimer favori)
 * - POST /api/reviews (créer review)
 * - GET /api/reviews (récupérer reviews)
 * - GET /api/users/:userId/stats (récupérer stats)
 * - PATCH /api/users/:userId/stats (mettre à jour stats)
 * - PATCH /api/users/:userId/stats/increment (incrémenter compteur)
 * - POST /api/users/:userId/stats/badge (ajouter badge)
 * - GET /api/users/leaderboard (classement)
 */

const API_BASE_URL = 'http://localhost:5000/api';

// Test user data
// Génération d'un ObjectId MongoDB valide pour userId (pour Review model)
const testUserId = '507f1f77bcf86cd799439011'; // ObjectId valide fixe pour les tests
const testUserName = 'Test User';
let testAttractionId = null;
let testFavoriteId = null;
let testReviewId = null;

// Couleurs pour la console
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
};

function log(color, message) {
  console.log(`${color}${message}${colors.reset}`);
}

async function testEndpoint(name, method, url, body = null, expectedStatus = 200) {
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

    if (response.status === expectedStatus) {
      log(colors.green, `✅ ${name}: SUCCESS (${response.status})`);
      return data;
    } else {
      log(colors.red, `❌ ${name}: FAILED (attendu ${expectedStatus}, reçu ${response.status})`);
      console.log('Réponse:', data);
      return null;
    }
  } catch (error) {
    log(colors.red, `❌ ${name}: ERROR`);
    console.error(error.message);
    return null;
  }
}

async function runTests() {
  console.log('\n' + '='.repeat(60));
  log(colors.magenta, '🧪 TEST DES ENDPOINTS - Favorites, Reviews, UserStats');
  console.log('='.repeat(60) + '\n');

  // ========== 1. GET ATTRACTION ID ==========
  log(colors.blue, '\n📍 Étape 1: Récupération d\'une attraction pour les tests');
  console.log('-'.repeat(60));

  const attractionsData = await testEndpoint(
    'GET Attractions',
    'GET',
    `${API_BASE_URL}/attractions?limit=1`
  );

  // Format de la réponse: { success: true, data: { attractions: [...] } }
  if (attractionsData?.data?.attractions && attractionsData.data.attractions.length > 0) {
    testAttractionId = attractionsData.data.attractions[0]._id;
  }

  if (testAttractionId) {
    log(colors.green, `✅ Attraction ID obtenu: ${testAttractionId}`);
  } else {
    log(colors.red, '❌ Impossible de récupérer une attraction. Tests arrêtés.');
    console.log('Données reçues:', attractionsData);
    return;
  }

  // ========== 2. FAVORITES ENDPOINTS ==========
  log(colors.blue, '\n❤️ Étape 2: Tests Favorites Endpoints');
  console.log('-'.repeat(60));

  // 2.1. POST /api/favorites - Ajouter un favori
  const favoriteData = await testEndpoint(
    'POST /api/favorites (Ajouter favori)',
    'POST',
    `${API_BASE_URL}/favorites`,
    {
      userId: testUserId,
      userName: testUserName,
      attractionId: testAttractionId,
    },
    201
  );

  // 2.2. GET /api/favorites - Récupérer les favoris
  const favoritesListData = await testEndpoint(
    'GET /api/favorites (Liste favoris)',
    'GET',
    `${API_BASE_URL}/favorites?userId=${testUserId}`
  );

  if (favoritesListData && favoritesListData.count > 0) {
    log(colors.green, `✅ ${favoritesListData.count} favori(s) trouvé(s)`);
  }

  // 2.3. GET /api/favorites/check/:attractionId - Vérifier favori
  await testEndpoint(
    'GET /api/favorites/check/:attractionId (Vérifier)',
    'GET',
    `${API_BASE_URL}/favorites/check/${testAttractionId}?userId=${testUserId}`
  );

  // ========== 3. REVIEWS ENDPOINTS ==========
  log(colors.blue, '\n⭐ Étape 3: Tests Reviews Endpoints');
  console.log('-'.repeat(60));

  // 3.1. POST /api/reviews - Créer une review
  // Note: Utilise le format du modèle existant (itemId, itemType, userId, rating, comment)
  const reviewData = await testEndpoint(
    'POST /api/reviews (Créer review)',
    'POST',
    `${API_BASE_URL}/reviews`,
    {
      itemId: testAttractionId,
      itemType: 'Attraction',
      userId: testUserId,
      rating: 5,
      comment: 'Excellent lieu à visiter ! Très intéressant et bien conservé.',
    },
    201
  );

  if (reviewData && reviewData.data) {
    testReviewId = reviewData.data._id;
    log(colors.green, `✅ Review ID créé: ${testReviewId}`);
  }

  // 3.2. GET /api/reviews - Récupérer les reviews (par attraction)
  // Note: Utilise itemId (nom du champ dans le modèle) au lieu de attractionId
  await testEndpoint(
    'GET /api/reviews (Par attraction)',
    'GET',
    `${API_BASE_URL}/reviews?itemId=${testAttractionId}&active=true`
  );

  // 3.3. GET /api/reviews - Récupérer toutes les reviews
  await testEndpoint(
    'GET /api/reviews (Toutes)',
    'GET',
    `${API_BASE_URL}/reviews?limit=5`
  );

  // 3.4. PATCH /api/reviews/:id/helpful - Marquer comme utile
  if (testReviewId) {
    await testEndpoint(
      'PATCH /api/reviews/:id/helpful (Marquer utile)',
      'PATCH',
      `${API_BASE_URL}/reviews/${testReviewId}/helpful`
    );
  }

  // 3.5. PATCH /api/reviews/:id/moderate - Modérer (approuver)
  if (testReviewId) {
    await testEndpoint(
      'PATCH /api/reviews/:id/moderate (Approuver)',
      'PATCH',
      `${API_BASE_URL}/reviews/${testReviewId}/moderate`,
      {
        status: 'approved',
        moderationNote: 'Review approuvée automatiquement par test',
      }
    );
  }

  // ========== 4. USER STATS ENDPOINTS ==========
  log(colors.blue, '\n📊 Étape 4: Tests UserStats Endpoints');
  console.log('-'.repeat(60));

  // 4.1. GET /api/users/:userId/stats - Récupérer stats
  const statsData = await testEndpoint(
    'GET /api/users/:userId/stats (Récupérer stats)',
    'GET',
    `${API_BASE_URL}/users/${testUserId}/stats`
  );

  if (statsData && statsData.data) {
    log(colors.green, `✅ Stats utilisateur:`);
    console.log(`   - Attractions visitées: ${statsData.data.attractionsVisited}`);
    console.log(`   - Audio guides écoutés: ${statsData.data.audioGuidesListened}`);
    console.log(`   - Favoris: ${statsData.data.favoriteCount}`);
    console.log(`   - Reviews: ${statsData.data.reviewCount}`);
    console.log(`   - Badges: ${statsData.data.badges.join(', ') || 'aucun'}`);
  }

  // 4.2. PATCH /api/users/:userId/stats/increment - Incrémenter compteur
  await testEndpoint(
    'PATCH /api/users/:userId/stats/increment (Attractions visitées)',
    'PATCH',
    `${API_BASE_URL}/users/${testUserId}/stats/increment`,
    {
      field: 'attractionsVisited',
      value: 1,
    }
  );

  await testEndpoint(
    'PATCH /api/users/:userId/stats/increment (Audio guides écoutés)',
    'PATCH',
    `${API_BASE_URL}/users/${testUserId}/stats/increment`,
    {
      field: 'audioGuidesListened',
      value: 3,
    }
  );

  await testEndpoint(
    'PATCH /api/users/:userId/stats/increment (Temps d\'écoute)',
    'PATCH',
    `${API_BASE_URL}/users/${testUserId}/stats/increment`,
    {
      field: 'totalListeningTime',
      value: 1800, // 30 minutes en secondes
    }
  );

  // 4.3. POST /api/users/:userId/stats/badge - Ajouter badge
  await testEndpoint(
    'POST /api/users/:userId/stats/badge (Ajouter badge)',
    'POST',
    `${API_BASE_URL}/users/${testUserId}/stats/badge`,
    {
      badge: 'first_favorite',
    }
  );

  await testEndpoint(
    'POST /api/users/:userId/stats/badge (Ajouter badge 2)',
    'POST',
    `${API_BASE_URL}/users/${testUserId}/stats/badge`,
    {
      badge: 'reviewer',
    }
  );

  // 4.4. PATCH /api/users/:userId/stats - Mise à jour manuelle
  await testEndpoint(
    'PATCH /api/users/:userId/stats (Mise à jour)',
    'PATCH',
    `${API_BASE_URL}/users/${testUserId}/stats`,
    {
      userName: 'Test User Updated',
      toursCompleted: 2,
    }
  );

  // 4.5. GET /api/users/leaderboard - Classement
  await testEndpoint(
    'GET /api/users/leaderboard (Classement)',
    'GET',
    `${API_BASE_URL}/users/leaderboard?sortBy=attractionsVisited&limit=5`
  );

  // ========== 5. STATS FINALES ==========
  log(colors.blue, '\n📊 Étape 5: Vérification Stats Finales');
  console.log('-'.repeat(60));

  const finalStats = await testEndpoint(
    'GET /api/users/:userId/stats (Stats finales)',
    'GET',
    `${API_BASE_URL}/users/${testUserId}/stats`
  );

  if (finalStats && finalStats.data) {
    log(colors.green, `✅ Stats finales utilisateur:`);
    console.log(`   - Attractions visitées: ${finalStats.data.attractionsVisited}`);
    console.log(`   - Audio guides écoutés: ${finalStats.data.audioGuidesListened}`);
    console.log(`   - Tours complétés: ${finalStats.data.toursCompleted}`);
    console.log(`   - Temps d'écoute total: ${finalStats.data.totalListeningTime}s (${Math.floor(finalStats.data.totalListeningTime / 60)} min)`);
    console.log(`   - Favoris: ${finalStats.data.favoriteCount}`);
    console.log(`   - Reviews: ${finalStats.data.reviewCount}`);
    console.log(`   - Badges: ${finalStats.data.badges.join(', ')}`);
  }

  // ========== 6. CLEANUP (OPTIONNEL) ==========
  log(colors.blue, '\n🧹 Étape 6: Nettoyage (Suppression favori test)');
  console.log('-'.repeat(60));

  await testEndpoint(
    'DELETE /api/favorites/:attractionId (Supprimer favori)',
    'DELETE',
    `${API_BASE_URL}/favorites/${testAttractionId}`,
    {
      userId: testUserId,
    }
  );

  // ========== 7. RÉSUMÉ ==========
  log(colors.magenta, '\n' + '='.repeat(60));
  log(colors.magenta, '✅ TESTS TERMINÉS');
  log(colors.magenta, '='.repeat(60));
  console.log('\n📊 Endpoints testés:');
  console.log('   - Favorites: 4 endpoints');
  console.log('   - Reviews: 5 endpoints');
  console.log('   - UserStats: 5 endpoints');
  console.log('   - TOTAL: 14 endpoints\n');
}

// Lancer les tests
runTests().catch((error) => {
  log(colors.red, '\n❌ ERREUR GLOBALE:');
  console.error(error);
  process.exit(1);
});
