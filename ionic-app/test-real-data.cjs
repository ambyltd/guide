/**
 * Script de test pour valider l'intégration des vraies données
 * Test les 3 endpoints principaux utilisés par l'app
 */

const axios = require('axios');

const API_URL = process.env.VITE_API_URL || 'http://localhost:5000/api';

const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
};

const log = {
  success: (msg) => console.log(`${colors.green}✅ ${msg}${colors.reset}`),
  error: (msg) => console.log(`${colors.red}❌ ${msg}${colors.reset}`),
  info: (msg) => console.log(`${colors.cyan}ℹ️  ${msg}${colors.reset}`),
  test: (msg) => console.log(`${colors.yellow}🧪 ${msg}${colors.reset}`),
};

async function testAttractions() {
  log.test('Test GET /attractions');
  try {
    const response = await axios.get(`${API_URL}/attractions`);
    
    if (!response.data.success) {
      log.error('Response success is false');
      return false;
    }

    if (!response.data.data?.attractions) {
      log.error('No attractions array in response');
      return false;
    }

    const attractions = response.data.data.attractions;
    log.success(`${attractions.length} attractions récupérées`);

    // Vérifier structure
    if (attractions.length > 0) {
      const first = attractions[0];
      const requiredFields = ['_id', 'name', 'description', 'category', 'location', 'city', 'rating'];
      const missingFields = requiredFields.filter(field => !(field in first));
      
      if (missingFields.length > 0) {
        log.error(`Champs manquants: ${missingFields.join(', ')}`);
        return false;
      }

      // Vérifier coordonnées GPS
      if (!first.location?.coordinates || first.location.coordinates.length !== 2) {
        log.error('Coordonnées GPS invalides');
        return false;
      }

      log.info(`Exemple: ${first.name} (${first.city}) - Rating: ${first.rating}`);
      log.info(`GPS: [${first.location.coordinates[0]}, ${first.location.coordinates[1]}]`);
    }

    return true;
  } catch (error) {
    log.error(`Erreur: ${error.message}`);
    if (error.response) {
      console.error('Response:', error.response.data);
    }
    return false;
  }
}

async function testAudioGuides() {
  log.test('Test GET /audio-guides');
  try {
    const response = await axios.get(`${API_URL}/audio-guides`);
    
    if (!response.data.success) {
      log.error('Response success is false');
      return false;
    }

    if (!Array.isArray(response.data.data)) {
      log.error('Response data is not an array');
      return false;
    }

    const audioGuides = response.data.data;
    log.success(`${audioGuides.length} audioguides récupérés`);

    // Vérifier structure
    if (audioGuides.length > 0) {
      const first = audioGuides[0];
      const requiredFields = ['_id', 'title', 'attractionId', 'gpsLocation', 'audioUrl', 'duration', 'language'];
      const missingFields = requiredFields.filter(field => !(field in first));
      
      if (missingFields.length > 0) {
        log.error(`Champs manquants: ${missingFields.join(', ')}`);
        return false;
      }

      // Vérifier gpsLocation (CRITICAL)
      if (!first.gpsLocation?.coordinates || first.gpsLocation.coordinates.length !== 2) {
        log.error('gpsLocation manquant ou invalide - BREAKING CHANGE!');
        return false;
      }

      log.info(`Exemple: ${first.title} (${first.language}) - Durée: ${first.duration}s`);
      log.info(`GPS: [${first.gpsLocation.coordinates[0]}, ${first.gpsLocation.coordinates[1]}]`);
      log.success('gpsLocation validé ✓');
    }

    return true;
  } catch (error) {
    log.error(`Erreur: ${error.message}`);
    if (error.response) {
      console.error('Response:', error.response.data);
    }
    return false;
  }
}

async function testTours() {
  log.test('Test GET /tours');
  try {
    const response = await axios.get(`${API_URL}/tours`);
    
    if (!response.data.success) {
      log.error('Response success is false');
      return false;
    }

    if (!Array.isArray(response.data.data)) {
      log.error('Response data is not an array');
      return false;
    }

    const tours = response.data.data;
    log.success(`${tours.length} circuits récupérés`);

    // Vérifier structure
    if (tours.length > 0) {
      const first = tours[0];
      const requiredFields = ['_id', 'name', 'category', 'attractions', 'startLocation', 'endLocation'];
      const missingFields = requiredFields.filter(field => !(field in first));
      
      if (missingFields.length > 0) {
        log.error(`Champs manquants: ${missingFields.join(', ')}`);
        return false;
      }

      // Vérifier locations
      if (!first.startLocation?.coordinates || first.startLocation.coordinates.length !== 2) {
        log.error('startLocation invalide');
        return false;
      }

      if (!first.endLocation?.coordinates || first.endLocation.coordinates.length !== 2) {
        log.error('endLocation invalide');
        return false;
      }

      log.info(`Exemple: ${first.name} (${first.category})`);
      log.info(`${first.attractions.length} attractions - Durée: ${first.totalDuration}min`);
      log.success('Locations validées ✓');
    }

    return true;
  } catch (error) {
    log.error(`Erreur: ${error.message}`);
    if (error.response) {
      console.error('Response:', error.response.data);
    }
    return false;
  }
}

async function testAttractionById() {
  log.test('Test GET /attractions/:id');
  try {
    // Récupérer une attraction d'abord
    const listResponse = await axios.get(`${API_URL}/attractions`);
    const attractions = listResponse.data.data.attractions;
    
    if (attractions.length === 0) {
      log.error('Aucune attraction à tester');
      return false;
    }

    const firstId = attractions[0]._id;
    const response = await axios.get(`${API_URL}/attractions/${firstId}`);
    
    if (!response.data.success) {
      log.error('Response success is false');
      return false;
    }

    const attraction = response.data.data;
    log.success(`Attraction détaillée récupérée: ${attraction.name}`);

    // Vérifier audioGuides liés
    if (attraction.audioGuides && Array.isArray(attraction.audioGuides)) {
      log.info(`${attraction.audioGuides.length} audioguides liés`);
    }

    return true;
  } catch (error) {
    log.error(`Erreur: ${error.message}`);
    return false;
  }
}

async function runTests() {
  console.log('\n' + '='.repeat(60));
  console.log('🧪 TEST D\'INTÉGRATION DES VRAIES DONNÉES');
  console.log('='.repeat(60) + '\n');

  const results = {
    attractions: await testAttractions(),
    audioGuides: await testAudioGuides(),
    tours: await testTours(),
    attractionById: await testAttractionById(),
  };

  console.log('\n' + '='.repeat(60));
  console.log('📊 RÉSULTATS');
  console.log('='.repeat(60));
  
  Object.entries(results).forEach(([test, success]) => {
    const icon = success ? '✅' : '❌';
    console.log(`${icon} ${test.padEnd(20)} - ${success ? 'RÉUSSI' : 'ÉCHOUÉ'}`);
  });

  const totalTests = Object.keys(results).length;
  const passedTests = Object.values(results).filter(Boolean).length;
  const percentage = Math.round((passedTests / totalTests) * 100);

  console.log('\n' + '-'.repeat(60));
  console.log(`📈 Score: ${passedTests}/${totalTests} (${percentage}%)`);
  console.log('='.repeat(60) + '\n');

  process.exit(percentage === 100 ? 0 : 1);
}

runTests();
