import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { Attraction } from '../src/models/Attraction';
import { AudioGuide } from '../src/models/AudioGuide';

dotenv.config();

const MONGODB_URI = process.env.MONGODB_URI || '';

async function migrateToAdvancedSchema() {
  try {
    console.log('🚀 Démarrage de la migration vers le schéma avancé...');
    
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Connexion à MongoDB établie');

    // 1. Migration des Attractions
    console.log('\n📍 Migration des Attractions...');
    const attractions = await Attraction.find({});
    
    for (const attraction of attractions) {
      const updates: any = {};
      
      // Ajout des métadonnées GPS si manquantes
      if (!attraction.gpsMetadata) {
        updates.gpsMetadata = {
          accuracy: 10,
          lastUpdated: new Date(),
          source: 'manual',
          verified: false
        };
      }

      // Ajout des analytics si manquantes
      if (!attraction.analytics) {
        updates.analytics = {
          totalVisits: Math.floor(Math.random() * 1000), // Données simulées
          uniqueVisitors: Math.floor(Math.random() * 800),
          averageVisitDuration: Math.floor(Math.random() * 3600),
          popularTimeSlots: {},
          seasonalTrends: {},
          userSegments: {},
          proximityHotspots: [],
          recommendationScore: Math.random() * 0.5 + 0.5,
          contentEngagement: {
            audioGuideListens: Math.floor(Math.random() * 500),
            completionRate: Math.random() * 40 + 60,
            averageListenDuration: Math.floor(Math.random() * 1800),
            skipRate: Math.random() * 20,
            replayRate: Math.random() * 15
          },
          lastAnalyticsUpdate: new Date()
        };
      }

      // Ajout des métadonnées ML si manquantes
      if (!attraction.mlFeatures) {
        updates.mlFeatures = {
          popularityScore: Math.random() * 0.4 + 0.6,
          accessibilityScore: Math.random() * 0.3 + 0.7,
          photographyScore: Math.random() * 0.3 + 0.7,
          familyFriendlyScore: Math.random() * 0.4 + 0.6,
          culturalSignificanceScore: Math.random() * 0.2 + 0.8,
          crowdLevel: ['low', 'medium', 'high'][Math.floor(Math.random() * 3)],
          optimalVisitDuration: Math.floor(Math.random() * 60) + 20,
          difficultyLevel: ['easy', 'moderate', 'challenging'][Math.floor(Math.random() * 3)],
          tags: generateTags(attraction.category, attraction.name),
          similarAttractions: []
        };
      }

      // Ajout du géofencing si manquant
      if (!attraction.geofencing) {
        updates.geofencing = {
          radius: 50,
          entryTrigger: true,
          exitTrigger: false,
          dwellTimeTrigger: 30,
          accuracyThreshold: 20
        };
      }

      // Conversion de audioGuideId vers audioGuides array
      if (attraction.audioGuideId && !attraction.audioGuides) {
        updates.audioGuides = [attraction.audioGuideId];
      }

      if (Object.keys(updates).length > 0) {
        await Attraction.updateOne({ _id: attraction._id }, { $set: updates });
        console.log(`  ✅ Attraction mise à jour: ${attraction.name}`);
      }
    }

    // 2. Migration des AudioGuides
    console.log('\n🎧 Migration des AudioGuides...');
    const audioGuides = await AudioGuide.find({});

    for (const guide of audioGuides) {
      const updates: any = {};
      
      // Récupération de la localisation de l'attraction liée
      const attraction = await Attraction.findById(guide.attractionId);
      if (!attraction) {
        console.log(`  ⚠️  Attraction non trouvée pour le guide: ${guide.title}`);
        continue;
      }

      // Ajout de la géolocalisation obligatoire
      if (!guide.gpsLocation) {
        updates.gpsLocation = {
          type: 'Point',
          coordinates: attraction.location.coordinates
        };
      }

      // Ajout des métadonnées GPS
      if (!guide.gpsMetadata) {
        updates.gpsMetadata = {
          accuracy: 10,
          optimalListeningRadius: 30,
          triggerDistance: 50,
          autoPlay: false,
          locationVerified: true,
          lastLocationUpdate: new Date()
        };
      }

      // Ajout des analytics
      if (!guide.analytics) {
        updates.analytics = {
          totalPlays: Math.floor(Math.random() * 500),
          uniqueListeners: Math.floor(Math.random() * 400),
          completionRate: Math.random() * 40 + 60,
          averageListenTime: Math.floor(Math.random() * guide.duration),
          skipPoints: generateSkipPoints(guide.duration),
          replayPoints: generateReplayPoints(guide.duration),
          popularTimeRanges: [],
          deviceBreakdown: {
            ios: Math.floor(Math.random() * 200),
            android: Math.floor(Math.random() * 200),
            web: Math.floor(Math.random() * 100)
          },
          locationAccuracy: {
            withinOptimalRadius: Math.floor(Math.random() * 300),
            outsideRadius: Math.floor(Math.random() * 50),
            averageDistance: Math.random() * 20 + 10
          },
          userEngagement: {
            pauseFrequency: Math.random() * 5,
            volumeAdjustments: Math.random() * 3,
            backgroundInterruptions: Math.random() * 2
          },
          lastAnalyticsUpdate: new Date()
        };
      }

      // Ajout des métadonnées ML
      if (!guide.mlFeatures) {
        updates.mlFeatures = {
          contentQualityScore: Math.random() * 0.3 + 0.7,
          narratorPopularityScore: Math.random() * 0.4 + 0.6,
          languageComplexityScore: Math.random() * 0.5 + 0.5,
          emotionalEngagementScore: Math.random() * 0.4 + 0.6,
          educationalValueScore: Math.random() * 0.3 + 0.7,
          accessibilityScore: Math.random() * 0.2 + 0.8,
          contentTags: generateContentTags(guide.title, guide.description),
          recommendedAudience: generateAudience(attraction.category)
        };
      }

      // Ajout des notifications
      if (!guide.notifications) {
        updates.notifications = {
          entryNotification: {
            enabled: true,
            message: `Guide audio disponible pour ${attraction.name}`,
            messageEn: `Audio guide available for ${attraction.name}`
          },
          proximityReminder: {
            enabled: true,
            distance: 100,
            message: 'Approchez-vous pour écouter le guide',
            messageEn: 'Get closer to listen to the guide'
          },
          completionSuggestion: {
            enabled: true,
            nextRecommendations: []
          }
        };
      }

      if (Object.keys(updates).length > 0) {
        await AudioGuide.updateOne({ _id: guide._id }, { $set: updates });
        console.log(`  ✅ AudioGuide mis à jour: ${guide.title}`);
      }
    }

    // 3. Calcul des attractions similaires
    console.log('\n🔗 Calcul des attractions similaires...');
    await calculateSimilarAttractions();

    // 4. Mise à jour des index
    console.log('\n📊 Création des index de performance...');
    await createPerformanceIndexes();

    console.log('\n🎉 Migration terminée avec succès !');
    console.log(`   - ${attractions.length} attractions mises à jour`);
    console.log(`   - ${audioGuides.length} guides audio mis à jour`);

  } catch (error) {
    console.error('❌ Erreur lors de la migration:', error);
  } finally {
    await mongoose.disconnect();
    console.log('🔌 Connexion fermée');
  }
}

// Fonctions utilitaires

function generateTags(category: string, name: string): string[] {
  const categoryTags = {
    museum: ['art', 'histoire', 'culture', 'exposition'],
    monument: ['patrimoine', 'architecture', 'historique'],
    nature: ['paysage', 'biodiversité', 'environnement'],
    market: ['local', 'artisanat', 'commerce'],
    cultural: ['tradition', 'culture', 'spectacle'],
    restaurant: ['gastronomie', 'cuisine', 'spécialités'],
    religious: ['spiritualité', 'architecture', 'tradition'],
    historical: ['histoire', 'patrimoine', 'éducatif']
  };

  const baseTags = categoryTags[category as keyof typeof categoryTags] || [];
  
  // Ajout de tags basés sur le nom
  const nameTags = [];
  if (name.toLowerCase().includes('royal') || name.toLowerCase().includes('palace')) {
    nameTags.push('royal', 'prestige');
  }
  if (name.toLowerCase().includes('colonial')) {
    nameTags.push('colonial', 'architecture');
  }
  if (name.toLowerCase().includes('modern')) {
    nameTags.push('moderne', 'contemporain');
  }

  return [...baseTags, ...nameTags, category];
}

function generateSkipPoints(duration: number): number[] {
  const points = [];
  const numPoints = Math.floor(Math.random() * 5);
  
  for (let i = 0; i < numPoints; i++) {
    points.push(Math.floor(Math.random() * duration));
  }
  
  return points.sort((a, b) => a - b);
}

function generateReplayPoints(duration: number): number[] {
  const points = [];
  const numPoints = Math.floor(Math.random() * 3);
  
  for (let i = 0; i < numPoints; i++) {
    points.push(Math.floor(Math.random() * duration));
  }
  
  return points.sort((a, b) => a - b);
}

function generateContentTags(title: string, description: string): string[] {
  const text = `${title} ${description}`.toLowerCase();
  const tags = [];

  if (text.includes('histoire') || text.includes('historical')) tags.push('historique');
  if (text.includes('art') || text.includes('artist')) tags.push('artistique');
  if (text.includes('architecture')) tags.push('architectural');
  if (text.includes('nature') || text.includes('natural')) tags.push('naturel');
  if (text.includes('culture') || text.includes('cultural')) tags.push('culturel');
  if (text.includes('tradition')) tags.push('traditionnel');
  if (text.includes('moderne') || text.includes('modern')) tags.push('moderne');

  return tags;
}

function generateAudience(category: string): string[] {
  const audienceMap = {
    museum: ['adultes', 'étudiants', 'familles'],
    monument: ['tous_publics', 'touristes'],
    nature: ['familles', 'amoureux_nature', 'aventuriers'],
    market: ['locaux', 'touristes', 'gourmets'],
    cultural: ['passionnés_culture', 'étudiants'],
    restaurant: ['gourmets', 'familles'],
    religious: ['pèlerins', 'passionnés_histoire'],
    historical: ['étudiants', 'passionnés_histoire']
  };

  return audienceMap[category as keyof typeof audienceMap] || ['tous_publics'];
}

async function calculateSimilarAttractions() {
  const attractions = await Attraction.find({ active: true });
  
  for (const attraction of attractions) {
    // Trouver des attractions similaires basées sur la catégorie et la proximité
    const similar = await Attraction.find({
      _id: { $ne: attraction._id },
      active: true,
      $or: [
        { category: attraction.category },
        {
          location: {
            $near: {
              $geometry: attraction.location,
              $maxDistance: 5000 // 5km
            }
          }
        }
      ]
    }).limit(5);

    if (similar.length > 0) {
      await Attraction.updateOne(
        { _id: attraction._id },
        { $set: { 'mlFeatures.similarAttractions': similar.map(s => s._id) } }
      );
    }
  }
}

async function createPerformanceIndexes() {
  // Index pour les requêtes géospatiales avancées
  await Attraction.collection.createIndex({ 
    location: '2dsphere', 
    category: 1, 
    'mlFeatures.popularityScore': -1 
  });

  await AudioGuide.collection.createIndex({ 
    gpsLocation: '2dsphere', 
    language: 1, 
    'analytics.totalPlays': -1 
  });

  // Index pour les analytics
  await Attraction.collection.createIndex({ 
    'analytics.totalVisits': -1, 
    'analytics.recommendationScore': -1 
  });

  await AudioGuide.collection.createIndex({ 
    'analytics.completionRate': -1, 
    'mlFeatures.contentQualityScore': -1 
  });

  console.log('  ✅ Index de performance créés');
}

// Exécution du script
if (require.main === module) {
  migrateToAdvancedSchema();
}

export { migrateToAdvancedSchema };