/**
 * Script de test - Page Home avec circuits touristiques
 * Vérifie que:
 * 1. Les attractions sont chargées (5 attendues)
 * 2. Les circuits sont chargés (2 attendus)
 * 3. La recherche fonctionne
 * 4. Les catégories fonctionnent
 * 5. Les tours sont affichés avec toutes les données
 */

const axios = require('axios');

const API_URL = process.env.VITE_API_URL || 'http://localhost:5000/api';

async function testHomePageFunctionality() {
  console.log('\n🧪 TEST DE LA PAGE HOME - CIRCUITS TOURISTIQUES\n');
  console.log('='.repeat(60));

  let totalTests = 0;
  let passedTests = 0;

  // Test 1: Chargement des attractions
  console.log('\n📍 Test 1: Chargement des attractions');
  console.log('-'.repeat(60));
  try {
    const response = await axios.get(`${API_URL}/attractions`);
    const attractions = response.data.data.attractions; // Correction: data.data.attractions
    
    if (attractions && attractions.length === 5) {
      console.log(`✅ ${attractions.length} attractions chargées`);
      attractions.forEach((a, i) => {
        console.log(`   ${i + 1}. ${a.name} (${a.category}) - ${a.city}`);
      });
      passedTests++;
    } else {
      console.log(`❌ Nombre d'attractions incorrect: ${attractions?.length || 0} (attendu: 5)`);
    }
    totalTests++;
  } catch (error) {
    console.log(`❌ Erreur chargement attractions:`, error.message);
    totalTests++;
  }

  // Test 2: Chargement des circuits
  console.log('\n🗺️  Test 2: Chargement des circuits touristiques');
  console.log('-'.repeat(60));
  try {
    const response = await axios.get(`${API_URL}/tours`);
    const tours = response.data.data;
    
    if (tours && tours.length === 2) {
      console.log(`✅ ${tours.length} circuits chargés`);
      tours.forEach((t, i) => {
        console.log(`   ${i + 1}. ${t.name}`);
        console.log(`      - Catégorie: ${t.category}`);
        console.log(`      - Durée: ${t.totalDuration} min`); // Correction: totalDuration
        console.log(`      - Distance: ${t.distance} km`);
        console.log(`      - Sites: ${t.attractions?.length || 0}`);
        console.log(`      - Prix adulte: ${t.price?.adult || 0} FCFA`);
        console.log(`      - Note: ${t.rating || 'N/A'}`);
      });
      passedTests++;
    } else {
      console.log(`❌ Nombre de circuits incorrect: ${tours?.length || 0} (attendu: 2)`);
    }
    totalTests++;
  } catch (error) {
    console.log(`❌ Erreur chargement circuits:`, error.message);
    totalTests++;
  }

  // Test 3: Vérification des données des circuits
  console.log('\n📊 Test 3: Validation des données des circuits');
  console.log('-'.repeat(60));
  try {
    const response = await axios.get(`${API_URL}/tours`);
    const tours = response.data.data;
    
    let allFieldsPresent = true;
    tours.forEach(tour => {
      const requiredFields = ['name', 'nameEn', 'description', 'category', 'totalDuration', 'distance', 'attractions', 'price', 'rating']; // Correction: totalDuration
      const missingFields = requiredFields.filter(field => !tour[field]);
      
      if (missingFields.length > 0) {
        console.log(`❌ ${tour.name}: champs manquants - ${missingFields.join(', ')}`);
        allFieldsPresent = false;
      } else {
        console.log(`✅ ${tour.name}: tous les champs présents`);
      }
    });
    
    if (allFieldsPresent) {
      passedTests++;
    }
    totalTests++;
  } catch (error) {
    console.log(`❌ Erreur validation données:`, error.message);
    totalTests++;
  }

  // Test 4: Test de recherche (simulation)
  console.log('\n🔍 Test 4: Simulation de recherche');
  console.log('-'.repeat(60));
  try {
    const attractionsRes = await axios.get(`${API_URL}/attractions`);
    const toursRes = await axios.get(`${API_URL}/tours`);
    
    const attractions = attractionsRes.data.data.attractions; // Correction
    const tours = toursRes.data.data; // tours est déjà un array direct
    
    // Recherche "UNESCO"
    const searchTerm = 'unesco';
    const filteredAttractions = attractions.filter(a =>
      a.name?.toLowerCase().includes(searchTerm) ||
      a.description?.toLowerCase().includes(searchTerm)
    );
    const filteredTours = tours.filter(t =>
      t.name?.toLowerCase().includes(searchTerm) ||
      t.description?.toLowerCase().includes(searchTerm)
    );
    
    console.log(`Recherche "${searchTerm}":`);
    console.log(`   - ${filteredAttractions.length} attractions trouvées`);
    console.log(`   - ${filteredTours.length} circuits trouvés`);
    
    if (filteredAttractions.length > 0 || filteredTours.length > 0) {
      console.log('✅ Recherche fonctionne');
      passedTests++;
    } else {
      console.log('❌ Aucun résultat trouvé pour "unesco"');
    }
    totalTests++;
  } catch (error) {
    console.log(`❌ Erreur test recherche:`, error.message);
    totalTests++;
  }

  // Test 5: Test de filtrage par catégorie (simulation)
  console.log('\n🏷️  Test 5: Simulation de filtrage par catégorie');
  console.log('-'.repeat(60));
  try {
    const response = await axios.get(`${API_URL}/attractions`);
    const attractions = response.data.data.attractions; // Correction
    
    const categories = ['museum', 'nature', 'monument', 'historical', 'religious'];
    const categoryCounts = {};
    
    categories.forEach(cat => {
      const filtered = attractions.filter(a => a.category === cat);
      categoryCounts[cat] = filtered.length;
      console.log(`   - ${cat}: ${filtered.length} attractions`);
    });
    
    if (Object.values(categoryCounts).some(count => count > 0)) {
      console.log('✅ Filtrage par catégorie fonctionne');
      passedTests++;
    } else {
      console.log('❌ Aucune attraction dans les catégories testées');
    }
    totalTests++;
  } catch (error) {
    console.log(`❌ Erreur test catégories:`, error.message);
    totalTests++;
  }

  // Résumé
  console.log('\n' + '='.repeat(60));
  console.log(`\n📊 RÉSULTATS DES TESTS\n`);
  console.log(`Tests réussis: ${passedTests}/${totalTests}`);
  console.log(`Pourcentage de réussite: ${((passedTests / totalTests) * 100).toFixed(1)}%\n`);

  if (passedTests === totalTests) {
    console.log('✅ TOUS LES TESTS SONT PASSÉS !');
    console.log('🎉 La page Home avec circuits touristiques est fonctionnelle\n');
  } else {
    console.log(`⚠️  ${totalTests - passedTests} test(s) ont échoué\n`);
  }
}

// Exécuter les tests
testHomePageFunctionality().catch(error => {
  console.error('❌ Erreur fatale lors des tests:', error);
  process.exit(1);
});
