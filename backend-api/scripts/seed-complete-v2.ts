/**
 * Script de seed complet et viable pour MongoDB
 * Compatible avec tous les modèles actuels du backend-api
 */

import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { Attraction } from '../src/models/Attraction';
import { AudioGuide } from '../src/models/AudioGuide';
import { Tour } from '../src/models/Tour';

dotenv.config();

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/cotedivoire-audioguide';

// Données d'attractions complètes
const attractions = [
  {
    name: 'Basilique Notre-Dame de la Paix',
    nameEn: 'Basilica of Our Lady of Peace',
    description: 'La Basilique Notre-Dame de la Paix de Yamoussoukro est un édifice religieux catholique consacré en 1990. C\'est la plus grande basilique au monde.',
    descriptionEn: 'The Basilica of Our Lady of Peace in Yamoussoukro is the largest church in the world, consecrated in 1990.',
    category: 'religious',
    location: {
      type: 'Point',
      coordinates: [-5.2893, 6.8203] // [longitude, latitude]
    },
    gpsMetadata: {
      accuracy: 5,
      elevation: 213,
      lastUpdated: new Date(),
      source: 'gps',
      verified: true
    },
    address: 'BP 1001, Yamoussoukro',
    city: 'Yamoussoukro',
    region: 'Lacs',
    images: [
      'https://images.unsplash.com/photo-1589519160732-57fc498494f8?w=800',
      'https://images.unsplash.com/photo-1605649487212-1a2c0279d87f?w=800'
    ],
    audioGuides: [],
    openingHours: {
      monday: { open: '06:00', close: '18:00', closed: false },
      tuesday: { open: '06:00', close: '18:00', closed: false },
      wednesday: { open: '06:00', close: '18:00', closed: false },
      thursday: { open: '06:00', close: '18:00', closed: false },
      friday: { open: '06:00', close: '18:00', closed: false },
      saturday: { open: '06:00', close: '18:00', closed: false },
      sunday: { open: '06:00', close: '18:00', closed: false }
    },
    entryFee: {
      adult: 2000,
      child: 1000,
      student: 1500,
      currency: 'XOF'
    },
    contact: {
      phone: '+225 27 30 64 10 51',
      email: 'contact@notredamedelapaix.org',
      website: 'https://notredamedelapaix.org'
    },
    rating: 4.8,
    reviewCount: 1542,
    featured: true,
    active: true,
    analytics: {
      totalVisits: 15420,
      uniqueVisitors: 12300,
      averageVisitDuration: 90,
      popularTimeSlots: {
        '09:00': 120,
        '10:00': 180,
        '14:00': 150
      },
      seasonalTrends: {
        'spring': 3500,
        'summer': 4200,
        'autumn': 3800,
        'winter': 3920
      },
      userSegments: {
        'tourists': 8500,
        'locals': 4200,
        'students': 2720
      },
      proximityHotspots: [
        {
          coordinates: [-5.2893, 6.8203],
          visitCount: 850,
          averageDwellTime: 45
        }
      ],
      recommendationScore: 0.92,
      contentEngagement: {
        audioGuideListens: 8500,
        completionRate: 0.78,
        averageListenDuration: 420,
        skipRate: 0.12,
        replayRate: 0.15
      },
      lastAnalyticsUpdate: new Date()
    },
    mlFeatures: {
      popularityScore: 0.95,
      accessibilityScore: 0.85,
      photographyScore: 0.98,
      familyFriendlyScore: 0.9,
      culturalSignificanceScore: 0.96,
      crowdLevel: 'high',
      optimalVisitDuration: 90,
      difficultyLevel: 'easy',
      tags: ['architecture', 'religion', 'history', 'unesco-candidate', 'iconic'],
      similarAttractions: []
    },
    geofencing: {
      radius: 100,
      entryTrigger: true,
      exitTrigger: false,
      dwellTimeTrigger: 45,
      accuracyThreshold: 15
    }
  },
  {
    name: 'Parc National de Taï',
    nameEn: 'Taï National Park',
    description: 'Le Parc National de Taï est l\'une des dernières étendues de forêt primaire d\'Afrique de l\'Ouest. Inscrit au patrimoine mondial de l\'UNESCO.',
    descriptionEn: 'Taï National Park is one of the last remaining primary forests in West Africa, a UNESCO World Heritage Site.',
    category: 'nature',
    location: {
      type: 'Point',
      coordinates: [-7.3520, 5.8450]
    },
    gpsMetadata: {
      accuracy: 10,
      elevation: 150,
      lastUpdated: new Date(),
      source: 'gps',
      verified: true
    },
    address: 'Région du Guémon',
    city: 'Taï',
    region: 'Bas-Sassandra',
    images: [
      'https://images.unsplash.com/photo-1516026672322-bc52d61a55d5?w=800',
      'https://images.unsplash.com/photo-1535083783855-76ae62b2914e?w=800'
    ],
    audioGuides: [],
    openingHours: {
      monday: { open: '07:00', close: '17:00', closed: false },
      tuesday: { open: '07:00', close: '17:00', closed: false },
      wednesday: { open: '07:00', close: '17:00', closed: false },
      thursday: { open: '07:00', close: '17:00', closed: false },
      friday: { open: '07:00', close: '17:00', closed: false },
      saturday: { open: '07:00', close: '17:00', closed: false },
      sunday: { open: '07:00', close: '17:00', closed: false }
    },
    entryFee: {
      adult: 5000,
      child: 2500,
      student: 3500,
      currency: 'XOF'
    },
    contact: {
      phone: '+225 27 34 71 00 48',
      email: 'info@parcnationaltai.ci'
    },
    rating: 4.9,
    reviewCount: 890,
    featured: true,
    active: true,
    analytics: {
      totalVisits: 8900,
      uniqueVisitors: 7200,
      averageVisitDuration: 180,
      popularTimeSlots: {
        '08:00': 90,
        '09:00': 120,
        '10:00': 85
      },
      seasonalTrends: {
        'spring': 2100,
        'summer': 2500,
        'autumn': 2200,
        'winter': 2100
      },
      userSegments: {
        'tourists': 6200,
        'researchers': 1500,
        'students': 1200
      },
      proximityHotspots: [],
      recommendationScore: 0.89,
      contentEngagement: {
        audioGuideListens: 4500,
        completionRate: 0.82,
        averageListenDuration: 600,
        skipRate: 0.08,
        replayRate: 0.18
      },
      lastAnalyticsUpdate: new Date()
    },
    mlFeatures: {
      popularityScore: 0.88,
      accessibilityScore: 0.65,
      photographyScore: 0.95,
      familyFriendlyScore: 0.75,
      culturalSignificanceScore: 0.92,
      crowdLevel: 'medium',
      optimalVisitDuration: 180,
      difficultyLevel: 'moderate',
      tags: ['nature', 'unesco', 'wildlife', 'forest', 'biodiversity'],
      similarAttractions: []
    },
    geofencing: {
      radius: 200,
      entryTrigger: true,
      exitTrigger: true,
      dwellTimeTrigger: 60,
      accuracyThreshold: 20
    }
  },
  {
    name: 'Musée des Civilisations de Côte d\'Ivoire',
    nameEn: 'Museum of Civilizations of Ivory Coast',
    description: 'Le Musée des Civilisations présente l\'histoire et la culture ivoirienne à travers une collection exceptionnelle de masques, statues et objets traditionnels.',
    descriptionEn: 'The Museum of Civilizations showcases Ivorian history and culture through an exceptional collection of masks, statues and traditional objects.',
    category: 'museum',
    location: {
      type: 'Point',
      coordinates: [-4.0267, 5.3257]
    },
    gpsMetadata: {
      accuracy: 5,
      elevation: 10,
      lastUpdated: new Date(),
      source: 'gps',
      verified: true
    },
    address: 'Boulevard Carde, Le Plateau',
    city: 'Abidjan',
    region: 'Abidjan Autonomous District',
    images: [
      'https://images.unsplash.com/photo-1566127444979-b3d2b64d3b0d?w=800',
      'https://images.unsplash.com/photo-1582555172866-f73bb12a2ab3?w=800'
    ],
    audioGuides: [],
    openingHours: {
      monday: { open: '00:00', close: '00:00', closed: true },
      tuesday: { open: '09:00', close: '17:00', closed: false },
      wednesday: { open: '09:00', close: '17:00', closed: false },
      thursday: { open: '09:00', close: '17:00', closed: false },
      friday: { open: '09:00', close: '17:00', closed: false },
      saturday: { open: '09:00', close: '17:00', closed: false },
      sunday: { open: '09:00', close: '17:00', closed: false }
    },
    entryFee: {
      adult: 1500,
      child: 500,
      student: 1000,
      currency: 'XOF'
    },
    contact: {
      phone: '+225 27 20 23 14 50',
      email: 'info@musee-civilisations.ci',
      website: 'https://musee-civilisations.ci'
    },
    rating: 4.6,
    reviewCount: 1230,
    featured: true,
    active: true,
    analytics: {
      totalVisits: 12300,
      uniqueVisitors: 9800,
      averageVisitDuration: 120,
      popularTimeSlots: {
        '10:00': 150,
        '11:00': 180,
        '14:00': 140
      },
      seasonalTrends: {
        'spring': 2800,
        'summer': 3200,
        'autumn': 3100,
        'winter': 3200
      },
      userSegments: {
        'tourists': 7200,
        'locals': 3100,
        'students': 2000
      },
      proximityHotspots: [],
      recommendationScore: 0.86,
      contentEngagement: {
        audioGuideListens: 7500,
        completionRate: 0.75,
        averageListenDuration: 720,
        skipRate: 0.15,
        replayRate: 0.12
      },
      lastAnalyticsUpdate: new Date()
    },
    mlFeatures: {
      popularityScore: 0.83,
      accessibilityScore: 0.9,
      photographyScore: 0.75,
      familyFriendlyScore: 0.88,
      culturalSignificanceScore: 0.94,
      crowdLevel: 'medium',
      optimalVisitDuration: 120,
      difficultyLevel: 'easy',
      tags: ['museum', 'culture', 'art', 'history', 'education'],
      similarAttractions: []
    },
    geofencing: {
      radius: 50,
      entryTrigger: true,
      exitTrigger: false,
      dwellTimeTrigger: 30,
      accuracyThreshold: 10
    }
  },
  {
    name: 'Grand-Bassam',
    nameEn: 'Grand-Bassam Historic Town',
    description: 'Ancienne capitale coloniale classée au patrimoine mondial de l\'UNESCO. Ville côtière chargée d\'histoire avec ses bâtiments coloniaux et plages.',
    descriptionEn: 'Former colonial capital listed as UNESCO World Heritage Site. Coastal town rich in history with colonial buildings and beaches.',
    category: 'historical',
    location: {
      type: 'Point',
      coordinates: [-3.7382, 5.1967]
    },
    gpsMetadata: {
      accuracy: 8,
      elevation: 5,
      lastUpdated: new Date(),
      source: 'gps',
      verified: true
    },
    address: 'Grand-Bassam',
    city: 'Grand-Bassam',
    region: 'Sud-Comoé',
    images: [
      'https://images.unsplash.com/photo-1559827260-dc66d52bef19?w=800',
      'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800'
    ],
    audioGuides: [],
    openingHours: {
      monday: { open: '00:00', close: '23:59', closed: false },
      tuesday: { open: '00:00', close: '23:59', closed: false },
      wednesday: { open: '00:00', close: '23:59', closed: false },
      thursday: { open: '00:00', close: '23:59', closed: false },
      friday: { open: '00:00', close: '23:59', closed: false },
      saturday: { open: '00:00', close: '23:59', closed: false },
      sunday: { open: '00:00', close: '23:59', closed: false }
    },
    entryFee: {
      adult: 0,
      child: 0,
      student: 0,
      currency: 'XOF'
    },
    contact: {
      phone: '+225 27 21 30 11 91',
      email: 'tourisme@grandbassam.ci'
    },
    rating: 4.7,
    reviewCount: 1875,
    featured: true,
    active: true,
    analytics: {
      totalVisits: 18750,
      uniqueVisitors: 14200,
      averageVisitDuration: 240,
      popularTimeSlots: {
        '09:00': 200,
        '10:00': 250,
        '15:00': 180
      },
      seasonalTrends: {
        'spring': 4200,
        'summer': 5500,
        'autumn': 4800,
        'winter': 4250
      },
      userSegments: {
        'tourists': 11200,
        'locals': 5500,
        'students': 2050
      },
      proximityHotspots: [],
      recommendationScore: 0.91,
      contentEngagement: {
        audioGuideListens: 9500,
        completionRate: 0.72,
        averageListenDuration: 540,
        skipRate: 0.18,
        replayRate: 0.14
      },
      lastAnalyticsUpdate: new Date()
    },
    mlFeatures: {
      popularityScore: 0.90,
      accessibilityScore: 0.88,
      photographyScore: 0.92,
      familyFriendlyScore: 0.85,
      culturalSignificanceScore: 0.96,
      crowdLevel: 'high',
      optimalVisitDuration: 240,
      difficultyLevel: 'easy',
      tags: ['unesco', 'history', 'colonial', 'beach', 'architecture'],
      similarAttractions: []
    },
    geofencing: {
      radius: 500,
      entryTrigger: true,
      exitTrigger: true,
      dwellTimeTrigger: 90,
      accuracyThreshold: 25
    }
  },
  {
    name: 'Marché de Cocody',
    nameEn: 'Cocody Market',
    description: 'Marché traditionnel vibrant avec fruits tropicaux, épices locales, artisanat ivoirien et spécialités culinaires.',
    descriptionEn: 'Vibrant traditional market with tropical fruits, local spices, Ivorian crafts and culinary specialties.',
    category: 'market',
    location: {
      type: 'Point',
      coordinates: [-4.0083, 5.3483]
    },
    gpsMetadata: {
      accuracy: 10,
      elevation: 15,
      lastUpdated: new Date(),
      source: 'gps',
      verified: true
    },
    address: 'Rue des Jardins, Cocody',
    city: 'Abidjan',
    region: 'Abidjan Autonomous District',
    images: [
      'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=800',
      'https://images.unsplash.com/photo-1488459716781-31db52582fe9?w=800'
    ],
    audioGuides: [],
    openingHours: {
      monday: { open: '06:00', close: '19:00', closed: false },
      tuesday: { open: '06:00', close: '19:00', closed: false },
      wednesday: { open: '06:00', close: '19:00', closed: false },
      thursday: { open: '06:00', close: '19:00', closed: false },
      friday: { open: '06:00', close: '19:00', closed: false },
      saturday: { open: '06:00', close: '19:00', closed: false },
      sunday: { open: '06:00', close: '14:00', closed: false }
    },
    entryFee: {
      adult: 0,
      child: 0,
      student: 0,
      currency: 'XOF'
    },
    contact: {
      phone: '+225 27 22 41 55 88'
    },
    rating: 4.4,
    reviewCount: 980,
    featured: false,
    active: true,
    analytics: {
      totalVisits: 9800,
      uniqueVisitors: 7500,
      averageVisitDuration: 60,
      popularTimeSlots: {
        '08:00': 120,
        '09:00': 150,
        '10:00': 110
      },
      seasonalTrends: {
        'spring': 2400,
        'summer': 2500,
        'autumn': 2450,
        'winter': 2450
      },
      userSegments: {
        'tourists': 4500,
        'locals': 4300,
        'students': 1000
      },
      proximityHotspots: [],
      recommendationScore: 0.78,
      contentEngagement: {
        audioGuideListens: 3500,
        completionRate: 0.68,
        averageListenDuration: 360,
        skipRate: 0.22,
        replayRate: 0.10
      },
      lastAnalyticsUpdate: new Date()
    },
    mlFeatures: {
      popularityScore: 0.76,
      accessibilityScore: 0.85,
      photographyScore: 0.80,
      familyFriendlyScore: 0.70,
      culturalSignificanceScore: 0.82,
      crowdLevel: 'high',
      optimalVisitDuration: 60,
      difficultyLevel: 'easy',
      tags: ['market', 'food', 'culture', 'local-life', 'authentic'],
      similarAttractions: []
    },
    geofencing: {
      radius: 75,
      entryTrigger: true,
      exitTrigger: false,
      dwellTimeTrigger: 20,
      accuracyThreshold: 15
    }
  }
];

async function seedDatabase() {
  try {
    console.log('🔄 Connexion à MongoDB...');
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Connecté à MongoDB');

    // Nettoyer les collections
    console.log('\n🗑️  Nettoyage des collections...');
    await Attraction.deleteMany({});
    await AudioGuide.deleteMany({});
    await Tour.deleteMany({});
    console.log('✅ Collections nettoyées');

    // Insérer les attractions
    console.log('\n📍 Insertion des attractions...');
    const insertedAttractions = await Attraction.insertMany(attractions);
    console.log(`✅ ${insertedAttractions.length} attractions insérées`);

    // Créer des audioguides pour chaque attraction
    console.log('\n🎧 Création des audioguides...');
    const audioGuides = [];
    
    for (const attraction of insertedAttractions) {
      // AudioGuide FR
      const audioGuideFr = {
        title: `Visite guidée - ${attraction.name}`,
        titleEn: `Guided Tour - ${attraction.nameEn}`,
        description: `Découvrez l'histoire et les secrets de ${attraction.name} à travers cette visite audio guidée complète.`,
        descriptionEn: `Discover the history and secrets of ${attraction.nameEn} through this complete audio guided tour.`,
        attractionId: attraction._id,
        gpsLocation: {
          type: 'Point',
          coordinates: attraction.location.coordinates
        },
        gpsMetadata: {
          accuracy: 10,
          optimalListeningRadius: 50,
          triggerDistance: 75,
          autoPlay: false,
          locationVerified: true,
          lastLocationUpdate: new Date()
        },
        audioUrl: `https://cdn.audioguide.ci/fr/${attraction._id}.mp3`,
        duration: 480 + Math.floor(Math.random() * 240),
        language: 'fr',
        transcript: `Transcription complète du guide audio en français pour ${attraction.name}...`,
        transcriptEn: `Complete transcript of the audio guide in English for ${attraction.nameEn}...`,
        narrator: 'Marie Kouassi',
        fileSize: 15000000 + Math.floor(Math.random() * 5000000),
        downloadCount: Math.floor(Math.random() * 5000),
        rating: 4.5 + Math.random() * 0.5,
        reviewCount: Math.floor(Math.random() * 500),
        featured: attraction.featured,
        active: true,
        analytics: {
          totalPlays: Math.floor(Math.random() * 10000),
          uniqueListeners: Math.floor(Math.random() * 8000),
          completionRate: 0.7 + Math.random() * 0.2,
          averageListenTime: 350 + Math.floor(Math.random() * 150),
          skipPoints: [120, 240, 360],
          replayPoints: [60, 180],
          popularTimeRanges: [
            { start: 0, end: 60, playCount: 500 },
            { start: 60, end: 120, playCount: 450 },
            { start: 120, end: 180, playCount: 400 }
          ],
          deviceBreakdown: {
            'iOS': 3500,
            'Android': 4200,
            'Web': 1300
          },
          locationAccuracy: {
            withinOptimalRadius: 4500,
            outsideRadius: 800,
            averageDistance: 35
          },
          userEngagement: {
            pauseFrequency: 2.5,
            volumeAdjustments: 1.8,
            backgroundInterruptions: 0.5
          },
          lastAnalyticsUpdate: new Date()
        },
        mlFeatures: {
          contentQualityScore: 0.85 + Math.random() * 0.15,
          narratorPopularityScore: 0.80 + Math.random() * 0.15,
          languageComplexityScore: 0.6 + Math.random() * 0.2,
          emotionalEngagementScore: 0.75 + Math.random() * 0.2,
          educationalValueScore: 0.80 + Math.random() * 0.15,
          accessibilityScore: 0.90 + Math.random() * 0.1,
          contentTags: ['history', 'culture', 'architecture'],
          recommendedAudience: ['adults', 'students', 'tourists']
        },
        notifications: {
          entryNotification: {
            enabled: true,
            message: `Bienvenue à ${attraction.name}! Démarrez votre visite audio guidée.`,
            messageEn: `Welcome to ${attraction.nameEn}! Start your audio guided tour.`
          },
          proximityReminder: {
            enabled: true,
            distance: 50,
            message: `Vous approchez de ${attraction.name}. Préparez votre guide audio!`,
            messageEn: `You are approaching ${attraction.nameEn}. Prepare your audio guide!`
          },
          completionSuggestion: {
            enabled: true,
            nextRecommendations: []
          }
        }
      };

      audioGuides.push(audioGuideFr);

      // AudioGuide EN
      const audioGuideEn = {
        ...audioGuideFr,
        title: `Guided Tour - ${attraction.nameEn}`,
        titleEn: `Guided Tour - ${attraction.nameEn}`,
        language: 'en',
        narrator: 'John Smith'
      };

      audioGuides.push(audioGuideEn);
    }

    const insertedAudioGuides = await AudioGuide.insertMany(audioGuides);
    console.log(`✅ ${insertedAudioGuides.length} audioguides insérés`);

    // Mettre à jour les attractions avec les IDs des audioguides
    console.log('\n🔗 Liaison attractions-audioguides...');
    for (let i = 0; i < insertedAttractions.length; i++) {
      const attraction = insertedAttractions[i] as any;
      const relatedAudioGuides = insertedAudioGuides.filter(
        (ag: any) => ag.attractionId.toString() === attraction._id.toString()
      );
      
      await Attraction.updateOne(
        { _id: attraction._id },
        { 
          $set: { 
            audioGuides: relatedAudioGuides.map((ag: any) => ag._id),
            audioGuideId: relatedAudioGuides[0]?._id // Backward compatibility
          } 
        }
      );
    }
    console.log('✅ Liaisons créées');

    // Créer des tours
    console.log('\n🗺️  Création des circuits touristiques...');
    const tours = [
      {
        name: 'Circuit Historique d\'Abidjan',
        nameEn: 'Abidjan Historical Tour',
        description: 'Découvrez l\'histoire fascinante d\'Abidjan à travers ses monuments historiques et culturels.',
        descriptionEn: 'Discover the fascinating history of Abidjan through its historical and cultural monuments.',
        category: 'historic',
        attractions: [
          { attractionId: insertedAttractions[2]._id, order: 1, estimatedDuration: 120, notes: 'Visite du musée' },
          { attractionId: insertedAttractions[4]._id, order: 2, estimatedDuration: 60, notes: 'Pause déjeuner au marché' }
        ],
        totalDuration: 180,
        difficulty: 'easy',
        distance: 12.5,
        startLocation: {
          type: 'Point',
          coordinates: [-4.0267, 5.3257]
        },
        endLocation: {
          type: 'Point',
          coordinates: [-4.0083, 5.3483]
        },
        price: {
          adult: 15000,
          child: 8000,
          currency: 'XOF'
        },
        images: [
          'https://images.unsplash.com/photo-1566127444979-b3d2b64d3b0d?w=800',
          'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=800'
        ],
        featured: true,
        rating: 4.7,
        reviewCount: 245,
        bookingCount: 1850,
        active: true
      },
      {
        name: 'Circuit Patrimoine UNESCO',
        nameEn: 'UNESCO Heritage Tour',
        description: 'Visitez les sites classés au patrimoine mondial de l\'UNESCO en Côte d\'Ivoire.',
        descriptionEn: 'Visit UNESCO World Heritage sites in Ivory Coast.',
        category: 'cultural',
        attractions: [
          { attractionId: insertedAttractions[0]._id, order: 1, estimatedDuration: 90, notes: 'Visite de la Basilique' },
          { attractionId: insertedAttractions[1]._id, order: 2, estimatedDuration: 180, notes: 'Safari dans le parc' },
          { attractionId: insertedAttractions[3]._id, order: 3, estimatedDuration: 120, notes: 'Visite de Grand-Bassam' }
        ],
        totalDuration: 390,
        difficulty: 'moderate',
        distance: 285,
        startLocation: {
          type: 'Point',
          coordinates: [-5.2893, 6.8203]
        },
        endLocation: {
          type: 'Point',
          coordinates: [-3.7382, 5.1967]
        },
        price: {
          adult: 45000,
          child: 25000,
          currency: 'XOF'
        },
        images: [
          'https://images.unsplash.com/photo-1589519160732-57fc498494f8?w=800',
          'https://images.unsplash.com/photo-1516026672322-bc52d61a55d5?w=800'
        ],
        featured: true,
        rating: 4.9,
        reviewCount: 312,
        bookingCount: 2100,
        active: true
      }
    ];

    const insertedTours = await Tour.insertMany(tours);
    console.log(`✅ ${insertedTours.length} circuits insérés`);

    // Résumé
    console.log('\n' + '='.repeat(50));
    console.log('📊 RÉSUMÉ DU SEED');
    console.log('='.repeat(50));
    console.log(`✅ Attractions: ${insertedAttractions.length}`);
    console.log(`✅ AudioGuides: ${insertedAudioGuides.length}`);
    console.log(`✅ Circuits: ${insertedTours.length}`);
    console.log('='.repeat(50));
    console.log('\n✅ Seed terminé avec succès!');
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Erreur lors du seed:', error);
    process.exit(1);
  }
}

seedDatabase();
