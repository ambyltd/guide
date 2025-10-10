import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { Attraction } from '../src/models/Attraction';
import { AudioGuide } from '../src/models/AudioGuide';
import { Tour } from '../src/models/Tour';
import { User } from '../src/models/User';

dotenv.config();

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/cotedivoire-audioguide';

// Données d'attractions viables
const sampleAttractions = [
  {
    name: "Basilique Notre-Dame de la Paix",
    nameEn: "Basilica of Our Lady of Peace",
    description: "La Basilique Notre-Dame de la Paix de Yamoussoukro est un édifice religieux catholique consacré en 1990. C'est la plus grande basilique au monde avec une superficie de 30 000 m². Monument emblématique de la Côte d'Ivoire.",
    descriptionEn: "The Basilica of Our Lady of Peace in Yamoussoukro is a Catholic religious building consecrated in 1990. It is the largest basilica in the world with an area of 30,000 m². Iconic monument of Côte d'Ivoire.",
    category: "monument",
    location: {
      type: "Point",
      coordinates: [-5.2893, 6.8203]
    },
    address: "Yamoussoukro",
    city: "Yamoussoukro",
    region: "Yamoussoukro",
    images: [
      "https://images.unsplash.com/photo-1589519160732-57fc498494f8?w=800",
      "https://images.unsplash.com/photo-1605649487212-1a2c0279d87f?w=800"
    ],
    openingHours: {
      monday: { open: "06:00", close: "18:00", closed: false },
      tuesday: { open: "06:00", close: "18:00", closed: false },
      wednesday: { open: "06:00", close: "18:00", closed: false },
      thursday: { open: "06:00", close: "18:00", closed: false },
      friday: { open: "06:00", close: "18:00", closed: false },
      saturday: { open: "06:00", close: "18:00", closed: false },
      sunday: { open: "06:00", close: "18:00", closed: false }
    },
    entryFee: {
      adult: 0,
      child: 0,
      student: 0,
      currency: "XOF"
    },
    rating: 4.8,
    reviewCount: 342,
    visitCount: 15420,
    active: true
  },
  {
    name: "Parc National de Taï",
    nameEn: "Taï National Park",
    description: "Le Parc National de Taï est l'une des dernières étendues de forêt primaire d'Afrique de l'Ouest. Inscrit au patrimoine mondial de l'UNESCO, il abrite une biodiversité exceptionnelle avec plus de 140 espèces de mammifères.",
    descriptionEn: "Taï National Park is one of the last remaining primary forests in West Africa. A UNESCO World Heritage Site, it is home to exceptional biodiversity with over 140 species of mammals.",
    category: "nature",
    location: {
      type: "Point",
      coordinates: [-7.3520, 5.8450]
    },
    address: "Taï, Sud-Ouest",
    city: "Taï",
    region: "San-Pédro",
    images: [
      "https://images.unsplash.com/photo-1516026672322-bc52d61a55d5?w=800",
      "https://images.unsplash.com/photo-1535083783855-76ae62b2914e?w=800"
    ],
    openingHours: {
      monday: { open: "08:00", close: "17:00", closed: false },
      tuesday: { open: "08:00", close: "17:00", closed: false },
      wednesday: { open: "08:00", close: "17:00", closed: false },
      thursday: { open: "08:00", close: "17:00", closed: false },
      friday: { open: "08:00", close: "17:00", closed: false },
      saturday: { open: "08:00", close: "17:00", closed: false },
      sunday: { open: "08:00", close: "17:00", closed: false }
    },
    entryFee: {
      adult: 5000,
      child: 2500,
      student: 3000,
      currency: "XOF"
    },
    rating: 4.9,
    reviewCount: 156,
    visitCount: 8900,
    active: true
  },
  {
    name: "Musée des Civilisations de Côte d'Ivoire",
    nameEn: "Museum of Civilizations of Côte d'Ivoire",
    description: "Le Musée des Civilisations présente l'histoire et la culture ivoirienne à travers une collection exceptionnelle de masques, statues, tissus et objets traditionnels.",
    descriptionEn: "The Museum of Civilizations presents Ivorian history and culture through an exceptional collection of masks, statues, textiles and traditional objects.",
    category: "museum",
    location: {
      type: "Point",
      coordinates: [-4.0267, 5.3257]
    },
    address: "Le Plateau, Abidjan",
    city: "Abidjan",
    region: "Abidjan",
    images: [
      "https://images.unsplash.com/photo-1566127444979-b3d2b64d3b0d?w=800",
      "https://images.unsplash.com/photo-1582555172866-f73bb12a2ab3?w=800"
    ],
    openingHours: {
      monday: { open: "", close: "", closed: true },
      tuesday: { open: "09:00", close: "17:00", closed: false },
      wednesday: { open: "09:00", close: "17:00", closed: false },
      thursday: { open: "09:00", close: "17:00", closed: false },
      friday: { open: "09:00", close: "17:00", closed: false },
      saturday: { open: "10:00", close: "16:00", closed: false },
      sunday: { open: "10:00", close: "16:00", closed: false }
    },
    entryFee: {
      adult: 2000,
      child: 1000,
      student: 1500,
      currency: "XOF"
    },
    rating: 4.6,
    reviewCount: 234,
    visitCount: 12300,
    active: true
  },
  {
    name: "Grand-Bassam",
    nameEn: "Grand-Bassam",
    description: "Ancienne capitale coloniale classée au patrimoine mondial de l'UNESCO, Grand-Bassam est une ville côtière chargée d'histoire avec ses bâtiments coloniaux et ses plages de sable fin.",
    descriptionEn: "Former colonial capital listed as a UNESCO World Heritage Site, Grand-Bassam is a coastal city steeped in history with its colonial buildings and sandy beaches.",
    category: "historical",
    location: {
      type: "Point",
      coordinates: [-3.7382, 5.1967]
    },
    address: "Grand-Bassam",
    city: "Grand-Bassam",
    region: "Sud-Comoé",
    images: [
      "https://images.unsplash.com/photo-1559827260-dc66d52bef19?w=800",
      "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800"
    ],
    openingHours: {
      monday: { open: "00:00", close: "23:59", closed: false },
      tuesday: { open: "00:00", close: "23:59", closed: false },
      wednesday: { open: "00:00", close: "23:59", closed: false },
      thursday: { open: "00:00", close: "23:59", closed: false },
      friday: { open: "00:00", close: "23:59", closed: false },
      saturday: { open: "00:00", close: "23:59", closed: false },
      sunday: { open: "00:00", close: "23:59", closed: false }
    },
    entryFee: {
      adult: 0,
      child: 0,
      student: 0,
      currency: "XOF"
    },
    rating: 4.7,
    reviewCount: 445,
    visitCount: 18750,
    active: true
  },
  {
    name: "Cathédrale Saint-Paul",
    nameEn: "St. Paul's Cathedral",
    description: "Chef-d'œuvre architectural moderne situé au Plateau, la Cathédrale Saint-Paul impressionne par sa structure unique en forme de croix et ses vitraux colorés.",
    descriptionEn: "Modern architectural masterpiece located in Plateau, St. Paul's Cathedral impresses with its unique cross-shaped structure and colorful stained glass windows.",
    category: "monument",
    location: {
      type: "Point",
      coordinates: [-4.0250, 5.3217]
    },
    address: "Boulevard de Marseille, Abidjan",
    city: "Abidjan",
    region: "Abidjan",
    images: [
      "https://images.unsplash.com/photo-1583417319070-4a69db38a482?w=800",
      "https://images.unsplash.com/photo-1548602088-9d89c93c3cbb?w=800"
    ],
    openingHours: {
      monday: { open: "07:00", close: "18:00", closed: false },
      tuesday: { open: "07:00", close: "18:00", closed: false },
      wednesday: { open: "07:00", close: "18:00", closed: false },
      thursday: { open: "07:00", close: "18:00", closed: false },
      friday: { open: "07:00", close: "18:00", closed: false },
      saturday: { open: "07:00", close: "18:00", closed: false },
      sunday: { open: "06:00", close: "19:00", closed: false }
    },
    entryFee: {
      adult: 0,
      child: 0,
      student: 0,
      currency: "XOF"
    },
    rating: 4.5,
    reviewCount: 189,
    visitCount: 11200,
    active: true
  }
];

async function seedDatabase() {
  try {
    console.log('🚀 Démarrage du seed de la base de données...');

    // Connexion à MongoDB
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Connecté à MongoDB');

    // Suppression des données existantes
    console.log('🗑️  Suppression des données existantes...');
    await Attraction.deleteMany({});
    await AudioGuide.deleteMany({});
    await Tour.deleteMany({});
    await User.deleteMany({});
    console.log('✅ Données existantes supprimées');

    // Création des attractions
    console.log('📍 Création des attractions...');
    const createdAttractions = await Attraction.insertMany(sampleAttractions);
    console.log(`✅ ${createdAttractions.length} attractions créées`);

    // Création des audioguides
    console.log('🎧 Création des guides audio...');
    const audioGuides = [];
    
    for (const attraction of createdAttractions) {
      // Guide français
      audioGuides.push({
        title: `Découverte de ${attraction.name}`,
        titleEn: `Discover ${attraction.nameEn}`,
        description: `Guide audio complet pour découvrir ${attraction.name} en français.`,
        descriptionEn: `Complete audio guide to discover ${attraction.nameEn} in English.`,
        attractionId: attraction._id,
        gpsLocation: {
          type: "Point",
          coordinates: attraction.location.coordinates
        },
        gpsMetadata: {
          accuracy: 10,
          optimalListeningRadius: 50,
          triggerDistance: 100,
          autoPlay: true,
          locationVerified: true,
          lastLocationUpdate: new Date()
        },
        audioUrl: `https://storage.example.com/audio/${attraction._id}_fr.mp3`,
        duration: 480,
        language: 'fr',
        transcript: `Bienvenue à ${attraction.name}. ${attraction.description}`,
        transcriptEn: `Welcome to ${attraction.nameEn}. ${attraction.descriptionEn}`,
        narrator: "Sophie Martin",
        fileSize: 5242880,
        downloadCount: Math.floor(Math.random() * 1000),
        rating: 4.5 + Math.random() * 0.5,
        reviewCount: Math.floor(Math.random() * 100),
        featured: Math.random() > 0.5,
        active: true,
        analytics: {
          totalPlays: Math.floor(Math.random() * 5000),
          uniqueListeners: Math.floor(Math.random() * 2000),
          completionRate: 0.75 + Math.random() * 0.2,
          averageListenTime: 360 + Math.random() * 120,
          skipPoints: [120, 240, 360],
          replayPoints: [60, 180, 300],
          popularTimeRanges: [
            { start: 0, end: 120, playCount: 150 },
            { start: 120, end: 240, playCount: 120 },
            { start: 240, end: 360, playCount: 100 }
          ],
          deviceBreakdown: { iOS: 45, Android: 35, Web: 20 },
          locationAccuracy: {
            withinOptimalRadius: 85,
            outsideRadius: 15,
            averageDistance: 25.5
          },
          userEngagement: {
            pauseFrequency: 2.5,
            volumeAdjustments: 1.2,
            backgroundInterruptions: 0.8
          },
          lastAnalyticsUpdate: new Date()
        },
        mlFeatures: {
          contentQualityScore: 0.85,
          narratorPopularityScore: 0.78,
          languageComplexityScore: 0.65,
          emotionalEngagementScore: 0.82,
          educationalValueScore: 0.88,
          accessibilityScore: 0.90,
          contentTags: [attraction.category, 'histoire', 'culture'],
          recommendedAudience: ['adultes', 'familles', 'étudiants']
        },
        notifications: {
          entryNotification: {
            enabled: true,
            message: `Vous êtes à proximité de ${attraction.name}. Voulez-vous écouter le guide audio ?`,
            messageEn: `You are near ${attraction.nameEn}. Would you like to listen to the audio guide?`
          },
          proximityReminder: {
            enabled: true,
            distance: 50,
            message: `N'oubliez pas d'écouter le guide audio de ${attraction.name}`,
            messageEn: `Don't forget to listen to the audio guide for ${attraction.nameEn}`
          },
          completionSuggestion: {
            enabled: true,
            nextRecommendations: []
          }
        }
      });

      // Guide anglais
      audioGuides.push({
        title: `${attraction.nameEn} Audio Guide`,
        titleEn: `${attraction.nameEn} Audio Guide`,
        description: `Complete audio guide for ${attraction.nameEn}.`,
        descriptionEn: `Complete audio guide for ${attraction.nameEn}.`,
        attractionId: attraction._id,
        gpsLocation: {
          type: "Point",
          coordinates: attraction.location.coordinates
        },
        gpsMetadata: {
          accuracy: 10,
          optimalListeningRadius: 50,
          triggerDistance: 100,
          autoPlay: false,
          locationVerified: true,
          lastLocationUpdate: new Date()
        },
        audioUrl: `https://storage.example.com/audio/${attraction._id}_en.mp3`,
        duration: 450,
        language: 'en',
        transcript: `Welcome to ${attraction.nameEn}. ${attraction.descriptionEn}`,
        transcriptEn: `Welcome to ${attraction.nameEn}. ${attraction.descriptionEn}`,
        narrator: "John Smith",
        fileSize: 4928000,
        downloadCount: Math.floor(Math.random() * 800),
        rating: 4.6 + Math.random() * 0.4,
        reviewCount: Math.floor(Math.random() * 80),
        featured: false,
        active: true,
        analytics: {
          totalPlays: Math.floor(Math.random() * 3000),
          uniqueListeners: Math.floor(Math.random() * 1500),
          completionRate: 0.70 + Math.random() * 0.25,
          averageListenTime: 340 + Math.random() * 110,
          skipPoints: [100, 220, 340],
          replayPoints: [50, 170, 290],
          popularTimeRanges: [
            { start: 0, end: 150, playCount: 120 },
            { start: 150, end: 300, playCount: 90 },
            { start: 300, end: 450, playCount: 70 }
          ],
          deviceBreakdown: { iOS: 50, Android: 30, Web: 20 },
          locationAccuracy: {
            withinOptimalRadius: 80,
            outsideRadius: 20,
            averageDistance: 30.2
          },
          userEngagement: {
            pauseFrequency: 2.2,
            volumeAdjustments: 1.5,
            backgroundInterruptions: 1.0
          },
          lastAnalyticsUpdate: new Date()
        },
        mlFeatures: {
          contentQualityScore: 0.82,
          narratorPopularityScore: 0.75,
          languageComplexityScore: 0.60,
          emotionalEngagementScore: 0.79,
          educationalValueScore: 0.85,
          accessibilityScore: 0.88,
          contentTags: [attraction.category, 'history', 'culture'],
          recommendedAudience: ['adults', 'families', 'students']
        },
        notifications: {
          entryNotification: {
            enabled: true,
            message: `You are near ${attraction.nameEn}. Listen to the audio guide?`,
            messageEn: `You are near ${attraction.nameEn}. Listen to the audio guide?`
          },
          proximityReminder: {
            enabled: true,
            distance: 50,
            message: `Don't forget the ${attraction.nameEn} audio guide`,
            messageEn: `Don't forget the ${attraction.nameEn} audio guide`
          },
          completionSuggestion: {
            enabled: true,
            nextRecommendations: []
          }
        }
      });
    }

    const createdAudioGuides = await AudioGuide.insertMany(audioGuides);
    console.log(`✅ ${createdAudioGuides.length} guides audio créés`);

    // Création d'un circuit touristique
    console.log('🗺️  Création des circuits...');
    const tour = {
      title: "Circuit Historique d'Abidjan",
      titleEn: "Abidjan Historical Tour",
      description: "Découvrez les sites historiques majeurs d'Abidjan en une journée",
      descriptionEn: "Discover the major historical sites of Abidjan in one day",
      duration: "6 heures",
      durationEn: "6 hours",
      difficulty: 'easy',
      attractions: createdAttractions
        .filter(a => a.city === 'Abidjan')
        .map(a => a._id)
        .slice(0, 3),
      startPoint: {
        type: "Point",
        coordinates: [-4.0267, 5.3257]
      },
      endPoint: {
        type: "Point",
        coordinates: [-4.0250, 5.3217]
      },
      distance: 15.5,
      images: [
        "https://images.unsplash.com/photo-1566127444979-b3d2b64d3b0d?w=800"
      ],
      rating: 4.7,
      reviewCount: 89,
      active: true
    };

    const createdTour = await Tour.create(tour);
    console.log(`✅ 1 circuit créé`);

    // Création d'un utilisateur test
    console.log('👤 Création d\'un utilisateur test...');
    const testUser = {
      email: 'test@audioguide.ci',
      displayName: 'Test User',
      photoURL: 'https://ui-avatars.com/api/?name=Test+User&background=random',
      emailVerified: true,
      preferences: {
        language: 'fr',
        theme: 'auto',
        notifications: true,
        autoplay: true,
        audioQuality: 'high'
      }
    };

    const createdUser = await User.create(testUser);
    console.log(`✅ Utilisateur test créé: ${createdUser.email}`);

    console.log('\n✅ Seed terminé avec succès!');
    console.log(`\n📊 Résumé:`);
    console.log(`   - ${createdAttractions.length} attractions`);
    console.log(`   - ${createdAudioGuides.length} guides audio`);
    console.log(`   - 1 circuit touristique`);
    console.log(`   - 1 utilisateur test`);

  } catch (error) {
    console.error('❌ Erreur lors du seed:', error);
    throw error;
  } finally {
    await mongoose.disconnect();
    console.log('🔌 Déconnecté de MongoDB');
  }
}

// Exécution
seedDatabase()
  .then(() => {
    console.log('✅ Opération terminée');
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ Échec:', error);
    process.exit(1);
  });
