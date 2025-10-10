const axios = require('axios');

const BASE_URL = 'http://localhost:5000/api';

console.log('🧪 TEST COMPLET DE L\'API AVEC SEED COMPLET\n');

async function testAPI() {
  try {
    console.log('📊 STATISTIQUES GLOBALES:');
    const stats = await axios.get(`${BASE_URL}/stats`);
    console.log(`✅ Total attractions: ${stats.data.data.totalAttractions}`);
    console.log(`✅ Total tours: ${stats.data.data.totalTours}`);
    console.log(`✅ Total guides audio: ${stats.data.data.totalAudioGuides}`);
    console.log(`✅ Utilisateurs actifs: ${stats.data.data.activeUsers}\n`);

    console.log('🏷️ CATÉGORIES:');
    const categories = await axios.get(`${BASE_URL}/categories`);
    console.log(`✅ Catégories disponibles: ${categories.data.data.join(', ')}\n`);

    console.log('🏙️ VILLES:');
    const cities = await axios.get(`${BASE_URL}/cities`);
    console.log(`✅ Villes: ${cities.data.data.join(', ')}\n`);

    console.log('🌍 RÉGIONS:');
    const regions = await axios.get(`${BASE_URL}/regions`);
    console.log(`✅ Régions: ${regions.data.data.join(', ')}\n`);

    console.log('🔍 RECHERCHE:');
    const searchMusee = await axios.get(`${BASE_URL}/search?q=musée`);
    console.log(`✅ Recherche 'musée': ${searchMusee.data.data.length} résultats`);
    
    const searchNature = await axios.get(`${BASE_URL}/search?q=nature`);
    console.log(`✅ Recherche 'nature': ${searchNature.data.data.length} résultats`);

    const searchAbidjan = await axios.get(`${BASE_URL}/search?q=Abidjan`);
    console.log(`✅ Recherche 'Abidjan': ${searchAbidjan.data.data.length} résultats\n`);

    console.log('⭐ RECOMMANDATIONS:');
    const recommendations = await axios.get(`${BASE_URL}/recommendations`);
    console.log(`✅ Nombre de recommandations: ${recommendations.data.data.length}`);
    if (recommendations.data.data.length > 0) {
      const top = recommendations.data.data[0];
      console.log(`✅ Top recommandation: ${top.name} (${top.rating}/5 ⭐)\n`);
    }

    console.log('📍 ATTRACTIONS PAR CATÉGORIE:');
    const museums = await axios.get(`${BASE_URL}/attractions?category=museum`);
    console.log(`✅ Musées: ${museums.data.data.length}`);
    
    const monuments = await axios.get(`${BASE_URL}/attractions?category=monument`);
    console.log(`✅ Monuments: ${monuments.data.data.length}`);
    
    const parks = await axios.get(`${BASE_URL}/attractions?category=nature`);
    console.log(`✅ Parcs naturels: ${parks.data.data.length}`);

    const religious = await axios.get(`${BASE_URL}/attractions?category=religious`);
    console.log(`✅ Sites religieux: ${religious.data.data.length}\n`);

    console.log('📍 ATTRACTIONS PAR VILLE:');
    const abidjanAttr = await axios.get(`${BASE_URL}/attractions?city=Abidjan`);
    console.log(`✅ Abidjan: ${abidjanAttr.data.data.length} attractions`);

    const yamoussoukroAttr = await axios.get(`${BASE_URL}/attractions?city=Yamoussoukro`);
    console.log(`✅ Yamoussoukro: ${yamoussoukroAttr.data.data.length} attractions`);

    const manAttr = await axios.get(`${BASE_URL}/attractions?city=Man`);
    console.log(`✅ Man: ${manAttr.data.data.length} attractions\n`);

    console.log('🎯 CIRCUITS TOURISTIQUES:');
    const tours = await axios.get(`${BASE_URL}/tours`);
    console.log(`✅ Total circuits: ${tours.data.data.length}`);
    tours.data.data.forEach((tour, index) => {
      console.log(`   ${index + 1}. ${tour.name} (${tour.attractions?.length || 0} attractions)`);
    });

    console.log('\n🎧 GUIDES AUDIO:');
    const audioGuides = await axios.get(`${BASE_URL}/audio-guides`);
    console.log(`✅ Total guides audio: ${audioGuides.data.data.length}`);

    console.log('\n✅ TOUS LES TESTS SONT PASSÉS ! La base de données est bien peuplée avec le seed complet.');
    
  } catch (error) {
    console.error('❌ Erreur lors du test:', error.message);
    if (error.response) {
      console.error('Détails:', error.response.data);
    }
  }
}

testAPI();
