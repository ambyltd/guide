import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { Attraction } from '../src/models/Attraction';
import { AudioGuide } from '../src/models/AudioGuide';
import { Tour } from '../src/models/Tour';

dotenv.config();

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/cotedivoire-audioguide';

const sampleAttractions = [
  {
    name: "Musée des Civilisations",
    nameEn: "Museum of Civilizations",
    description: "Le Musée des Civilisations de Côte d'Ivoire présente l'histoire et la culture des peuples ivoiriens à travers des collections d'art traditionnel, d'objets rituels et d'artefacts historiques.",
    descriptionEn: "The Museum of Civilizations of Côte d'Ivoire presents the history and culture of Ivorian peoples through collections of traditional art, ritual objects and historical artifacts.",
    category: "museum",
    location: {
      type: "Point",
      coordinates: [-4.0083, 5.3364] // Abidjan
    },
    address: "Plateau, Abidjan",
    city: "Abidjan",
    region: "Lagunes",
    images: [
      "https://images.unsplash.com/photo-1566127992631-137a642a90f4?w=800",
      "https://images.unsplash.com/photo-1544735716-392fe2489ffa?w=800"
    ],
    openingHours: {
      monday: { open: "09:00", close: "17:00", closed: false },
      tuesday: { open: "09:00", close: "17:00", closed: false },
      wednesday: { open: "09:00", close: "17:00", closed: false },
      thursday: { open: "09:00", close: "17:00", closed: false },
      friday: { open: "09:00", close: "17:00", closed: false },
      saturday: { open: "10:00", close: "16:00", closed: false },
      sunday: { open: "", close: "", closed: true }
    },
    entryFee: {
      adult: 2000,
      child: 1000,
      student: 1500,
      currency: "XOF"
    },
    rating: 4.5,
    reviewCount: 127,
    featured: true,
    active: true
  },
  {
    name: "Cathédrale Saint-Paul",
    nameEn: "Saint Paul Cathedral",
    description: "La Cathédrale Saint-Paul d'Abidjan est un monument emblématique de la ville, reconnaissable par son architecture moderne unique et sa croix géante.",
    descriptionEn: "Saint Paul Cathedral of Abidjan is an emblematic monument of the city, recognizable by its unique modern architecture and giant cross.",
    category: "monument",
    location: {
      type: "Point",
      coordinates: [-4.0267, 5.3247]
    },
    address: "Plateau, Abidjan",
    city: "Abidjan",
    region: "Lagunes",
    images: [
      "https://images.unsplash.com/photo-1520637836862-4d197d17c62a?w=800"
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
    rating: 4.7,
    reviewCount: 89,
    featured: true,
    active: true
  },
  {
    name: "Parc National du Banco",
    nameEn: "Banco National Park",
    description: "Poumon vert d'Abidjan, le Parc National du Banco offre 3 400 hectares de forêt tropicale primaire en plein cœur de la métropole.",
    descriptionEn: "Green lung of Abidjan, Banco National Park offers 3,400 hectares of primary tropical forest in the heart of the metropolis.",
    category: "nature",
    location: {
      type: "Point",
      coordinates: [-4.0641, 5.3875]
    },
    address: "Yopougon, Abidjan",
    city: "Abidjan",
    region: "Lagunes",
    images: [
      "https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=800",
      "https://images.unsplash.com/photo-1518837695005-2083093ee35b?w=800"
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
      adult: 1000,
      child: 500,
      student: 750,
      currency: "XOF"
    },
    rating: 4.2,
    reviewCount: 156,
    featured: false,
    active: true
  },
  {
    name: "Marché de Cocody",
    nameEn: "Cocody Market",
    description: "Marché local animé où vous pouvez découvrir les produits frais, l'artisanat local et l'ambiance authentique de la vie quotidienne ivoirienne.",
    descriptionEn: "Lively local market where you can discover fresh products, local crafts and the authentic atmosphere of Ivorian daily life.",
    category: "market",
    location: {
      type: "Point",
      coordinates: [-3.9778, 5.3456]
    },
    address: "Cocody, Abidjan",
    city: "Abidjan",
    region: "Lagunes",
    images: [
      "https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=800"
    ],
    openingHours: {
      monday: { open: "06:00", close: "18:00", closed: false },
      tuesday: { open: "06:00", close: "18:00", closed: false },
      wednesday: { open: "06:00", close: "18:00", closed: false },
      thursday: { open: "06:00", close: "18:00", closed: false },
      friday: { open: "06:00", close: "18:00", closed: false },
      saturday: { open: "06:00", close: "18:00", closed: false },
      sunday: { open: "08:00", close: "16:00", closed: false }
    },
    entryFee: {
      adult: 0,
      child: 0,
      student: 0,
      currency: "XOF"
    },
    rating: 3.8,
    reviewCount: 73,
    featured: false,
    active: true
  }
];

async function seedDatabase() {
  try {
    console.log('🌱 Connexion à MongoDB...');
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Connecté à MongoDB');

    console.log('🗑️ Suppression des données existantes...');
    await Attraction.deleteMany({});
    await AudioGuide.deleteMany({});
    await Tour.deleteMany({});

    console.log('📍 Création des attractions...');
    const attractions = await Attraction.create(sampleAttractions);
    console.log(`✅ ${attractions.length} attractions créées`);

    console.log('🎵 Création des guides audio d\'exemple...');
    const audioGuides: any[] = [];
    for (const attraction of attractions) {
      audioGuides.push({
        title: `Guide audio - ${attraction.name}`,
        titleEn: `Audio guide - ${attraction.nameEn}`,
        description: `Découvrez l'histoire et les secrets de ${attraction.name}`,
        descriptionEn: `Discover the history and secrets of ${attraction.nameEn}`,
        attractionId: attraction._id,
        audioUrl: "https://www.soundjay.com/misc/sounds-from-nature/bell-chime-3.mp3",
        duration: 180,
        language: "fr",
        transcript: `Bienvenue à ${attraction.name}. Ce guide vous fera découvrir...`,
        transcriptEn: `Welcome to ${attraction.nameEn}. This guide will help you discover...`,
        narrator: "Marie Dupont",
        fileSize: 2048000,
        rating: 4.3,
        reviewCount: 45,
        active: true
      });
    }

    const createdAudioGuides = await AudioGuide.create(audioGuides);
    console.log(`✅ ${createdAudioGuides.length} guides audio créés`);

    // Lier les guides audio aux attractions
    for (let i = 0; i < attractions.length; i++) {
      attractions[i].audioGuideId = createdAudioGuides[i]._id as mongoose.Types.ObjectId;
      await attractions[i].save();
    }

    console.log('🎯 Création des circuits touristiques...');
    const tours = await Tour.create([
      {
        name: "Circuit Historique d'Abidjan",
        nameEn: "Historical Tour of Abidjan",
        description: "Découvrez l'histoire d'Abidjan à travers ses monuments emblématiques",
        descriptionEn: "Discover the history of Abidjan through its emblematic monuments",
        category: "historic",
        attractions: attractions.slice(0, 3).map(a => ({
          attractionId: a._id,
          order: attractions.indexOf(a) + 1,
          estimatedDuration: 45,
          notes: "Visite guidée incluse"
        })),
        totalDuration: 180,
        difficulty: "easy",
        distance: 12.5,
        startLocation: {
          type: "Point",
          coordinates: [-4.0083, 5.3364]
        },
        endLocation: {
          type: "Point",
          coordinates: [-4.0641, 5.3875]
        },
        price: {
          adult: 15000,
          child: 8000,
          currency: "XOF"
        },
        images: ["https://images.unsplash.com/photo-1469474968028-56623f02e42e?w=800"],
        featured: true,
        rating: 4.6,
        reviewCount: 34,
        bookingCount: 127,
        active: true
      }
    ]);

    console.log(`✅ ${tours.length} circuits créés`);

    console.log('🎉 Base de données initialisée avec succès !');
    console.log(`📊 Résumé:`);
    console.log(`   - ${attractions.length} attractions`);
    console.log(`   - ${createdAudioGuides.length} guides audio`);
    console.log(`   - ${tours.length} circuits`);

  } catch (error) {
    console.error('❌ Erreur lors de l\'initialisation:', error);
  } finally {
    await mongoose.disconnect();
    console.log('🔌 Déconnecté de MongoDB');
  }
}

seedDatabase();
