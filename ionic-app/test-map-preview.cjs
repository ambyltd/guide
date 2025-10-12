#!/usr/bin/env node

/**
 * Script de test pour vérifier l'intégration de la Map Preview
 * avec les vraies coordonnées GPS
 */

const axios = require('axios');

const API_URL = process.env.VITE_API_URL || 'http://localhost:5000/api';

const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  cyan: '\x1b[36m',
};

async function testMapPreviewData() {
  console.log('\n' + '='.repeat(60));
  console.log(`${colors.cyan}🗺️  TEST MAP PREVIEW - COORDONNÉES GPS${colors.reset}`);
  console.log('='.repeat(60) + '\n');

  try {
    // Récupérer toutes les attractions
    const response = await axios.get(`${API_URL}/attractions`);
    
    if (!response.data.success || !response.data.data?.attractions) {
      console.log(`${colors.red}❌ Erreur: Impossible de récupérer les attractions${colors.reset}`);
      return false;
    }

    const attractions = response.data.data.attractions;
    console.log(`${colors.green}✅ ${attractions.length} attractions récupérées${colors.reset}\n`);

    let successCount = 0;
    let errorCount = 0;

    attractions.forEach((attraction, index) => {
      console.log(`${colors.yellow}${index + 1}. ${attraction.name}${colors.reset}`);
      
      // Vérifier la présence de location
      if (!attraction.location) {
        console.log(`   ${colors.red}❌ Pas de location${colors.reset}`);
        errorCount++;
        return;
      }

      // Vérifier le type GeoJSON
      if (attraction.location.type !== 'Point') {
        console.log(`   ${colors.red}❌ Type invalide: ${attraction.location.type}${colors.reset}`);
        errorCount++;
        return;
      }

      // Vérifier les coordonnées
      if (!attraction.location.coordinates || attraction.location.coordinates.length !== 2) {
        console.log(`   ${colors.red}❌ Coordonnées invalides${colors.reset}`);
        errorCount++;
        return;
      }

      const [lng, lat] = attraction.location.coordinates;

      // Valider longitude (-180 à 180)
      if (typeof lng !== 'number' || lng < -180 || lng > 180) {
        console.log(`   ${colors.red}❌ Longitude invalide: ${lng}${colors.reset}`);
        errorCount++;
        return;
      }

      // Valider latitude (-90 à 90)
      if (typeof lat !== 'number' || lat < -90 || lat > 90) {
        console.log(`   ${colors.red}❌ Latitude invalide: ${lat}${colors.reset}`);
        errorCount++;
        return;
      }

      // Vérifier que c'est en Côte d'Ivoire (approximativement)
      // CI: longitude -8.6 à -2.5, latitude 4.3 à 10.7
      const isInCI = (lng >= -8.6 && lng <= -2.5) && (lat >= 4.3 && lat <= 10.7);
      
      if (!isInCI) {
        console.log(`   ${colors.yellow}⚠️  Coordonnées hors Côte d'Ivoire: [${lng}, ${lat}]${colors.reset}`);
      }

      console.log(`   ${colors.green}✅ GPS valide: [${lng.toFixed(4)}, ${lat.toFixed(4)}]${colors.reset}`);
      console.log(`   📍 ${attraction.city}, ${attraction.region}`);
      console.log(`   🗺️  Mapbox URL: https://api.mapbox.com/styles/v1/mapbox/streets-v12/static/${lng},${lat},14,0/400x300@2x`);
      console.log('');
      
      successCount++;
    });

    console.log('='.repeat(60));
    console.log('📊 RÉSULTATS');
    console.log('='.repeat(60));
    console.log(`${colors.green}✅ Valides: ${successCount}${colors.reset}`);
    console.log(`${colors.red}❌ Erreurs: ${errorCount}${colors.reset}`);
    console.log(`📈 Score: ${successCount}/${attractions.length} (${Math.round(successCount/attractions.length*100)}%)`);
    console.log('='.repeat(60) + '\n');

    // Test des audioguides avec gpsLocation
    console.log(`${colors.cyan}🎧 VÉRIFICATION AUDIOGUIDES GPS${colors.reset}\n`);
    
    const audioResponse = await axios.get(`${API_URL}/audio-guides`);
    const audioGuides = audioResponse.data.data;

    let audioSuccess = 0;
    let audioError = 0;

    audioGuides.forEach((ag, index) => {
      if (ag.gpsLocation?.coordinates && ag.gpsLocation.coordinates.length === 2) {
        const [lng, lat] = ag.gpsLocation.coordinates;
        console.log(`${colors.green}✅ ${index + 1}. ${ag.title}: [${lng.toFixed(4)}, ${lat.toFixed(4)}]${colors.reset}`);
        audioSuccess++;
      } else {
        console.log(`${colors.red}❌ ${index + 1}. ${ag.title}: GPS manquant${colors.reset}`);
        audioError++;
      }
    });

    console.log(`\n${colors.cyan}📊 AudioGuides: ${audioSuccess}/${audioGuides.length} avec GPS${colors.reset}\n`);

    return successCount === attractions.length && audioSuccess === audioGuides.length;
  } catch (error) {
    console.log(`${colors.red}❌ Erreur: ${error.message}${colors.reset}`);
    return false;
  }
}

async function testMapboxIntegration() {
  console.log(`${colors.cyan}🌍 TEST INTÉGRATION MAPBOX GL JS${colors.reset}\n`);

  const checks = [
    {
      name: 'Token Mapbox configuré',
      check: () => process.env.VITE_MAPBOX_TOKEN?.length > 0,
      fix: 'Ajouter VITE_MAPBOX_TOKEN dans .env'
    },
    {
      name: 'Mapbox GL JS installé',
      check: () => {
        try {
          require.resolve('mapbox-gl');
          return true;
        } catch {
          return false;
        }
      },
      fix: 'npm install mapbox-gl'
    }
  ];

  let allPassed = true;

  checks.forEach(({ name, check, fix }) => {
    const passed = check();
    if (passed) {
      console.log(`${colors.green}✅ ${name}${colors.reset}`);
    } else {
      console.log(`${colors.red}❌ ${name}${colors.reset}`);
      console.log(`   💡 Solution: ${fix}`);
      allPassed = false;
    }
  });

  return allPassed;
}

async function main() {
  console.log('\n' + '═'.repeat(60));
  console.log(`${colors.cyan}   🗺️  TEST INTÉGRATION MAP PREVIEW   ${colors.reset}`);
  console.log('═'.repeat(60));

  const mapboxOk = await testMapboxIntegration();
  const dataOk = await testMapPreviewData();

  console.log('\n' + '═'.repeat(60));
  console.log('🎯 RÉSULTAT FINAL');
  console.log('═'.repeat(60));

  if (mapboxOk && dataOk) {
    console.log(`${colors.green}✅ Map Preview complètement fonctionnelle !${colors.reset}`);
    console.log(`${colors.green}✅ Toutes les attractions ont des coordonnées GPS valides${colors.reset}`);
    console.log(`${colors.green}✅ Tous les audioguides ont gpsLocation${colors.reset}`);
    console.log('\n💡 La Map Preview s\'affichera dans AttractionDetail.tsx');
    console.log('═'.repeat(60) + '\n');
    process.exit(0);
  } else {
    console.log(`${colors.red}❌ Des problèmes ont été détectés${colors.reset}`);
    console.log('═'.repeat(60) + '\n');
    process.exit(1);
  }
}

main();
