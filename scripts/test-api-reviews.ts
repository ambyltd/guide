import axios from 'axios';

const API_BASE = 'http://localhost:3001/api';

async function testReviewsAPI() {
  try {
    console.log('🔍 Test de l\'API Reviews...\n');

    // Test 1: Vérifier que le serveur est accessible
    console.log('1. Test de santé de l\'API...');
    try {
      const healthResponse = await axios.get(`${API_BASE}/health`);
      console.log('✅ Serveur accessible:', healthResponse.data);
    } catch (error) {
      console.log('❌ Serveur non accessible');
      return;
    }

    // Test 2: Récupérer toutes les reviews (sans auth - devrait échouer)
    console.log('\n2. Test récupération reviews sans auth...');
    try {
      const response = await axios.get(`${API_BASE}/reviews`);
      console.log('❌ Erreur: Les reviews devraient nécessiter une authentification');
    } catch (error: any) {
      if (error.response?.status === 401) {
        console.log('✅ Sécurité OK: Authentication requise');
      } else {
        console.log('⚠️ Erreur inattendue:', error.response?.status);
      }
    }

    // Test 3: Récupérer les reviews d'une attraction spécifique (publique)
    console.log('\n3. Test récupération reviews d\'une attraction...');
    try {
      // On utilise un ID fictif pour tester la route
      const response = await axios.get(`${API_BASE}/reviews/item/507f1f77bcf86cd799439011`);
      console.log('✅ Route accessible:', response.status);
      console.log('   Données reçues:', response.data);
    } catch (error: any) {
      if (error.response?.status === 404) {
        console.log('✅ Route fonctionne (404 attendu pour ID fictif)');
      } else {
        console.log('⚠️ Erreur:', error.response?.status, error.response?.data);
      }
    }

    console.log('\n🎉 Tests terminés !');

  } catch (error) {
    console.error('❌ Erreur lors des tests:', error);
  }
}

// Attendre que le serveur soit prêt
setTimeout(testReviewsAPI, 3000);
