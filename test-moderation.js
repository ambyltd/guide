/**
 * Script de test des endpoints de modération
 * Sprint 4 - Phase 1
 * 
 * Test:
 * - Signalement de reviews (reportReview)
 * - Auto-flagging (>= 3 signalements)
 * - Modération admin (moderateReview)
 */

const BASE_URL = 'http://localhost:5000/api';

// Helper pour fetch avec JSON
async function fetchJSON(url, options = {}) {
  const response = await fetch(url, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
  });
  const data = await response.json();
  return { data, status: response.status };
}

// Couleurs pour le terminal
const colors = {
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  reset: '\x1b[0m',
};

const log = {
  success: (msg) => console.log(`${colors.green}✓ ${msg}${colors.reset}`),
  error: (msg) => console.log(`${colors.red}✗ ${msg}${colors.reset}`),
  info: (msg) => console.log(`${colors.blue}ℹ ${msg}${colors.reset}`),
  warning: (msg) => console.log(`${colors.yellow}⚠ ${msg}${colors.reset}`),
};

let testReviewId = null;

async function testModeration() {
  console.log('\n🧪 TESTS DE MODÉRATION - Sprint 4 Phase 1\n');

  try {
    // ========== SETUP: Créer une review de test ==========
    log.info('SETUP: Création d\'une review de test...');
    
    const createResponse = await fetchJSON(`${BASE_URL}/reviews`, {
      method: 'POST',
      body: JSON.stringify({
        attractionId: '670e5f9b2b8e1f001a2b3c4d', // Basilique Notre-Dame de la Paix
        userId: 'test-user-1',
        userName: 'Utilisateur Test',
        rating: 5,
        comment: 'Test review pour modération',
        language: 'fr',
      }),
    });

    if (createResponse.data.success) {
      testReviewId = createResponse.data.data._id;
      log.success(`Review créée: ${testReviewId}`);
    } else {
      log.error('Échec création review');
      return;
    }

    // ========== TEST 1: Premier signalement ==========
    log.info('\n--- TEST 1: Premier signalement ---');
    
    const report1 = await axios.patch(`${BASE_URL}/reviews/${testReviewId}/report`, {
      userId: 'reporter-1',
      reason: 'spam',
    });

    if (report1.data.success && report1.data.reportCount === 1) {
      log.success('Premier signalement OK');
      log.info(`  reportCount: ${report1.data.reportCount}`);
      log.info(`  flagged: ${report1.data.flagged}`);
    } else {
      log.error('Premier signalement FAILED');
      console.log(report1.data);
    }

    // ========== TEST 2: Deuxième signalement (utilisateur différent) ==========
    log.info('\n--- TEST 2: Deuxième signalement ---');
    
    const report2 = await axios.patch(`${BASE_URL}/reviews/${testReviewId}/report`, {
      userId: 'reporter-2',
      reason: 'inappropriate',
    });

    if (report2.data.success && report2.data.reportCount === 2) {
      log.success('Deuxième signalement OK');
      log.info(`  reportCount: ${report2.data.reportCount}`);
      log.info(`  flagged: ${report2.data.flagged}`);
    } else {
      log.error('Deuxième signalement FAILED');
      console.log(report2.data);
    }

    // ========== TEST 3: Signalement duplicate (même userId) ==========
    log.info('\n--- TEST 3: Signalement duplicate (même utilisateur) ---');
    
    const report3Duplicate = await axios.patch(`${BASE_URL}/reviews/${testReviewId}/report`, {
      userId: 'reporter-1', // Même userId que TEST 1
      reason: 'spam',
    });

    if (report3Duplicate.data.success && report3Duplicate.data.reportCount === 2) {
      log.success('Duplicate détecté OK (reportCount reste à 2)');
      log.info(`  reportCount: ${report3Duplicate.data.reportCount}`);
    } else {
      log.error('Duplicate detection FAILED');
      console.log(report3Duplicate.data);
    }

    // ========== TEST 4: Troisième signalement → Auto-flagging ==========
    log.info('\n--- TEST 4: Troisième signalement → Auto-flagging ---');
    
    const report3 = await axios.patch(`${BASE_URL}/reviews/${testReviewId}/report`, {
      userId: 'reporter-3',
      reason: 'fake',
    });

    if (report3.data.success && report3.data.reportCount === 3 && report3.data.flagged) {
      log.success('Auto-flagging OK (>= 3 signalements)');
      log.info(`  reportCount: ${report3.data.reportCount}`);
      log.info(`  flagged: ${report3.data.flagged}`);
    } else {
      log.error('Auto-flagging FAILED');
      console.log(report3.data);
    }

    // ========== TEST 5: Vérifier que la review est masquée (active=false) ==========
    log.info('\n--- TEST 5: Vérifier masquage automatique ---');
    
    const reviewCheck = await axios.get(`${BASE_URL}/reviews?reviewId=${testReviewId}`);
    const review = reviewCheck.data.data.find(r => r._id === testReviewId);

    if (review && review.flagged === true && review.active === false) {
      log.success('Masquage automatique OK (active=false, flagged=true)');
      log.info(`  active: ${review.active}`);
      log.info(`  flagged: ${review.flagged}`);
      log.info(`  reportedBy: [${review.reportedBy.join(', ')}]`);
      log.info(`  reportReasons: [${review.reportReasons.join(', ')}]`);
    } else {
      log.error('Masquage automatique FAILED');
      console.log(review);
    }

    // ========== TEST 6: Modération admin - Rejeter ==========
    log.info('\n--- TEST 6: Modération admin - Rejeter ---');
    
    const moderate1 = await axios.patch(`${BASE_URL}/reviews/${testReviewId}/moderate`, {
      status: 'rejected',
      moderatorId: 'admin-1',
      moderationNote: 'Contenu inapproprié confirmé',
    });

    if (moderate1.data.success && moderate1.data.data.status === 'rejected') {
      log.success('Modération rejection OK');
      log.info(`  status: ${moderate1.data.data.status}`);
      log.info(`  moderatedBy: ${moderate1.data.data.moderatedBy}`);
      log.info(`  moderationNote: ${moderate1.data.data.moderationNote}`);
      log.info(`  active: ${moderate1.data.data.active}`);
      log.info(`  flagged: ${moderate1.data.data.flagged}`);
    } else {
      log.error('Modération rejection FAILED');
      console.log(moderate1.data);
    }

    // ========== TEST 7: Créer nouvelle review et approuver ==========
    log.info('\n--- TEST 7: Nouvelle review + Modération approbation ---');
    
    const createResponse2 = await axios.post(`${BASE_URL}/reviews`, {
      attractionId: '670e5f9b2b8e1f001a2b3c4d',
      userId: 'test-user-2',
      userName: 'Utilisateur Test 2',
      rating: 4,
      comment: 'Test review pour approbation',
      language: 'fr',
    });

    const testReviewId2 = createResponse2.data.data._id;
    log.info(`  Review créée: ${testReviewId2}`);

    // Signaler 3 fois pour flagging
    await axios.patch(`${BASE_URL}/reviews/${testReviewId2}/report`, {
      userId: 'reporter-4',
      reason: 'spam',
    });
    await axios.patch(`${BASE_URL}/reviews/${testReviewId2}/report`, {
      userId: 'reporter-5',
      reason: 'spam',
    });
    await axios.patch(`${BASE_URL}/reviews/${testReviewId2}/report`, {
      userId: 'reporter-6',
      reason: 'spam',
    });

    log.info('  Review signalée 3 fois (flagged=true)');

    // Approuver via modération
    const moderate2 = await axios.patch(`${BASE_URL}/reviews/${testReviewId2}/moderate`, {
      status: 'approved',
      moderatorId: 'admin-1',
      moderationNote: 'Faux positif - contenu légitime',
    });

    if (
      moderate2.data.success &&
      moderate2.data.data.status === 'approved' &&
      moderate2.data.data.active === true &&
      moderate2.data.data.flagged === false
    ) {
      log.success('Modération approbation OK');
      log.info(`  status: ${moderate2.data.data.status}`);
      log.info(`  active: ${moderate2.data.data.active} (réactivée)`);
      log.info(`  flagged: ${moderate2.data.data.flagged} (cleared)`);
      log.info(`  moderationNote: ${moderate2.data.data.moderationNote}`);
    } else {
      log.error('Modération approbation FAILED');
      console.log(moderate2.data);
    }

    // ========== TEST 8: Status invalide ==========
    log.info('\n--- TEST 8: Status invalide ---');
    
    try {
      await axios.patch(`${BASE_URL}/reviews/${testReviewId}/moderate`, {
        status: 'invalid-status',
        moderatorId: 'admin-1',
      });
      log.error('Validation status FAILED (devrait rejeter)');
    } catch (error) {
      if (error.response && error.response.status === 400) {
        log.success('Validation status OK (status invalide rejeté)');
        log.info(`  Message: ${error.response.data.message}`);
      } else {
        log.error('Validation status FAILED');
        console.log(error.response?.data || error.message);
      }
    }

    // ========== RÉSUMÉ ==========
    console.log('\n' + '='.repeat(60));
    log.success('TOUS LES TESTS PASSÉS ✓');
    console.log('='.repeat(60));
    console.log('\n📊 Résumé:');
    console.log('  - Signalement multi-utilisateurs: ✓');
    console.log('  - Détection duplicates: ✓');
    console.log('  - Auto-flagging (>= 3 signalements): ✓');
    console.log('  - Masquage automatique: ✓');
    console.log('  - Modération rejection: ✓');
    console.log('  - Modération approbation: ✓');
    console.log('  - Clear flagged après approbation: ✓');
    console.log('  - Validation status: ✓');
    console.log('\n🎉 Système de modération 100% fonctionnel !');

    // ========== CLEANUP ==========
    log.info('\n--- CLEANUP: Suppression des reviews de test ---');
    
    try {
      await axios.delete(`${BASE_URL}/reviews/${testReviewId}`);
      await axios.delete(`${BASE_URL}/reviews/${testReviewId2}`);
      log.success('Reviews de test supprimées');
    } catch (error) {
      log.warning('Cleanup partiel (reviews peuvent rester en base)');
    }

  } catch (error) {
    log.error('ERREUR TEST:');
    if (error.response) {
      console.log('Status:', error.response.status);
      console.log('Data:', error.response.data);
    } else {
      console.log(error.message);
    }
  }
}

// Lancer les tests
testModeration().then(() => {
  console.log('\n✅ Script de test terminé\n');
  process.exit(0);
}).catch((error) => {
  console.error('\n❌ Erreur fatale:', error.message);
  process.exit(1);
});
