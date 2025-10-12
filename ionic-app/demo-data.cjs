#!/usr/bin/env node

/**
 * Script de démonstration de l'intégration des vraies données
 * Affiche un aperçu visuel des données disponibles
 */

const axios = require('axios');

const API_URL = process.env.VITE_API_URL || 'http://localhost:5000/api';

const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  green: '\x1b[32m',
  cyan: '\x1b[36m',
  yellow: '\x1b[33m',
  magenta: '\x1b[35m',
};

const box = {
  top: '╔═══════════════════════════════════════════════════════════════╗',
  mid: '╠═══════════════════════════════════════════════════════════════╣',
  bot: '╚═══════════════════════════════════════════════════════════════╝',
  line: '║',
};

function printHeader(title) {
  console.log('\n' + box.top);
  console.log(`${box.line} ${colors.bright}${colors.cyan}${title.padEnd(61)}${colors.reset} ${box.line}`);
  console.log(box.mid);
}

function printFooter() {
  console.log(box.bot);
}

function printLine(text) {
  console.log(`${box.line} ${text.padEnd(61)} ${box.line}`);
}

async function displayAttractions() {
  try {
    const response = await axios.get(`${API_URL}/attractions`);
    const attractions = response.data.data.attractions;

    printHeader('🏛️  ATTRACTIONS DISPONIBLES');
    
    attractions.forEach((attr, index) => {
      printLine('');
      printLine(`${colors.yellow}${index + 1}. ${attr.name}${colors.reset}`);
      printLine(`   📍 ${attr.city}, ${attr.region}`);
      printLine(`   🏷️  ${attr.category.toUpperCase()}`);
      printLine(`   ⭐ ${attr.rating}/5 (${attr.reviewCount} avis)`);
      printLine(`   🗺️  GPS: [${attr.location.coordinates[0]}, ${attr.location.coordinates[1]}]`);
      printLine(`   🎧 ${attr.audioGuides?.length || 0} audioguides`);
    });

    printLine('');
    printLine(`${colors.green}Total: ${attractions.length} attractions${colors.reset}`);
    printFooter();
  } catch (error) {
    console.error('❌ Erreur:', error.message);
  }
}

async function displayAudioGuides() {
  try {
    const response = await axios.get(`${API_URL}/audio-guides`);
    const audioGuides = response.data.data;

    printHeader('🎧 AUDIOGUIDES DISPONIBLES');

    const byLanguage = audioGuides.reduce((acc, ag) => {
      if (!acc[ag.language]) acc[ag.language] = [];
      acc[ag.language].push(ag);
      return acc;
    }, {});

    Object.entries(byLanguage).forEach(([lang, guides]) => {
      printLine('');
      printLine(`${colors.magenta}${lang.toUpperCase()} - ${guides.length} guides${colors.reset}`);
      
      guides.forEach((ag, index) => {
        const minutes = Math.floor(ag.duration / 60);
        const seconds = ag.duration % 60;
        printLine(`   ${index + 1}. ${ag.title}`);
        printLine(`      ⏱️  ${minutes}:${seconds.toString().padStart(2, '0')}`);
        printLine(`      🗣️  ${ag.narrator}`);
        printLine(`      ⭐ ${ag.rating.toFixed(1)}/5`);
      });
    });

    printLine('');
    printLine(`${colors.green}Total: ${audioGuides.length} audioguides${colors.reset}`);
    printFooter();
  } catch (error) {
    console.error('❌ Erreur:', error.message);
  }
}

async function displayTours() {
  try {
    const response = await axios.get(`${API_URL}/tours`);
    const tours = response.data.data;

    printHeader('🗺️  CIRCUITS TOURISTIQUES');

    tours.forEach((tour, index) => {
      printLine('');
      printLine(`${colors.yellow}${index + 1}. ${tour.name}${colors.reset}`);
      printLine(`   🏷️  ${tour.category.toUpperCase()}`);
      printLine(`   📍 ${tour.attractions.length} attractions`);
      printLine(`   ⏱️  ${tour.totalDuration} minutes`);
      printLine(`   🚗 ${tour.distance} km`);
      printLine(`   💰 ${tour.price.adult} XOF (adulte)`);
      printLine(`   ⭐ ${tour.rating}/5 (${tour.reviewCount} avis)`);
      
      printLine(`   `);
      printLine(`   Itinéraire:`);
      tour.attractions.forEach((stop, i) => {
        printLine(`      ${i + 1}. ${stop.attractionId.name} (${stop.estimatedDuration}min)`);
      });
    });

    printLine('');
    printLine(`${colors.green}Total: ${tours.length} circuits${colors.reset}`);
    printFooter();
  } catch (error) {
    console.error('❌ Erreur:', error.message);
  }
}

async function displayStats() {
  try {
    const [attractionsRes, audioGuidesRes, toursRes] = await Promise.all([
      axios.get(`${API_URL}/attractions`),
      axios.get(`${API_URL}/audio-guides`),
      axios.get(`${API_URL}/tours`),
    ]);

    const attractions = attractionsRes.data.data.attractions;
    const audioGuides = audioGuidesRes.data.data;
    const tours = toursRes.data.data;

    // Calculs
    const totalVisits = attractions.reduce((sum, a) => sum + (a.analytics?.totalVisits || 0), 0);
    const avgRating = attractions.reduce((sum, a) => sum + a.rating, 0) / attractions.length;
    const totalAudioDuration = audioGuides.reduce((sum, ag) => sum + ag.duration, 0);
    const totalAudioPlays = audioGuides.reduce((sum, ag) => sum + (ag.analytics?.totalPlays || 0), 0);

    printHeader('📊 STATISTIQUES GLOBALES');
    printLine('');
    printLine(`${colors.bright}Attractions${colors.reset}`);
    printLine(`   Total: ${attractions.length}`);
    printLine(`   Visites totales: ${totalVisits.toLocaleString()}`);
    printLine(`   Note moyenne: ${avgRating.toFixed(2)}/5 ⭐`);
    printLine('');
    printLine(`${colors.bright}AudioGuides${colors.reset}`);
    printLine(`   Total: ${audioGuides.length}`);
    printLine(`   Durée totale: ${Math.floor(totalAudioDuration / 60)} minutes`);
    printLine(`   Écoutes totales: ${totalAudioPlays.toLocaleString()}`);
    printLine('');
    printLine(`${colors.bright}Circuits${colors.reset}`);
    printLine(`   Total: ${tours.length}`);
    printLine(`   Distance totale: ${tours.reduce((s, t) => s + t.distance, 0)} km`);
    printLine(`   Durée totale: ${tours.reduce((s, t) => s + t.totalDuration, 0)} minutes`);
    printLine('');
    printFooter();
  } catch (error) {
    console.error('❌ Erreur:', error.message);
  }
}

async function main() {
  console.log('\n' + '═'.repeat(65));
  console.log(`${colors.bright}${colors.cyan}   🇨🇮 AUDIOGUIDE CÔTE D'IVOIRE - DONNÉES RÉELLES 🇨🇮${colors.reset}`);
  console.log('═'.repeat(65));

  await displayStats();
  await displayAttractions();
  await displayAudioGuides();
  await displayTours();

  console.log('\n' + '═'.repeat(65));
  console.log(`${colors.green}✅ Toutes les données ont été chargées avec succès !${colors.reset}`);
  console.log('═'.repeat(65) + '\n');
}

main().catch(error => {
  console.error('\n❌ Erreur fatale:', error.message);
  process.exit(1);
});
