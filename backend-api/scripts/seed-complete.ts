import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { Attraction } from '../src/models/Attraction';
import { AudioGuide } from '../src/models/AudioGuide';
import { Tour } from '../src/models/Tour';
import { User } from '../src/models/User';
import { Review } from '../src/models/Review';

dotenv.config();

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/cotedivoire-audioguide';

// Données complètes pour tester tous les aspects du generalController
const sampleAttractions = [
  // ABIDJAN - Lagunes
  {
    name: "Musée des Civilisations de Côte d'Ivoire",
    nameEn: "Museum of Civilizations of Côte d'Ivoire",
    description: "Le Musée des Civilisations présente l'histoire et la culture des peuples ivoiriens à travers des collections d'art traditionnel, d'objets rituels et d'artefacts historiques. Un voyage à travers les traditions akan, mandé et krou.",
    descriptionEn: "The Museum of Civilizations presents the history and culture of Ivorian peoples through collections of traditional art, ritual objects and historical artifacts. A journey through Akan, Mandé and Krou traditions.",
    category: "museum",
    location: {
      type: "Point",
      coordinates: [-4.0083, 5.3364]
    },
    address: "Plateau, Abidjan",
    city: "Abidjan",
    region: "Lagunes",
    images: [
      "https://images.unsplash.com/photo-1566127992631-137a642a90f4?w=800",
      "https://images.unsplash.com/photo-1544735716-392fe2489ffa?w=800",
      "https://images.unsplash.com/photo-1518998053901-5348d3961a04?w=800"
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
    active: true,
    tags: ["musée", "culture", "art", "histoire", "akan", "tradition", "museum", "culture", "art", "history"]
  },
  {
    name: "Cathédrale Saint-Paul d'Abidjan",
    nameEn: "Saint Paul Cathedral of Abidjan",
    description: "Architecture moderne remarquable conçue par Aldo Spirito, cette cathédrale est un symbole de la modernité ivoirienne. Ses lignes épurées et sa croix géante dominent le quartier du Plateau.",
    descriptionEn: "Remarkable modern architecture designed by Aldo Spirito, this cathedral is a symbol of Ivorian modernity. Its clean lines and giant cross dominate the Plateau district.",
    category: "religious",
    location: {
      type: "Point",
      coordinates: [-4.0126, 5.3317]
    },
    address: "Boulevard Clozel, Plateau, Abidjan",
    city: "Abidjan",
    region: "Lagunes",
    images: [
      "https://images.unsplash.com/photo-1520637836862-4d197d17c90a?w=800",
      "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=800"
    ],
    openingHours: {
      monday: { open: "07:00", close: "18:00", closed: false },
      tuesday: { open: "07:00", close: "18:00", closed: false },
      wednesday: { open: "07:00", close: "18:00", closed: false },
      thursday: { open: "07:00", close: "18:00", closed: false },
      friday: { open: "07:00", close: "18:00", closed: false },
      saturday: { open: "07:00", close: "19:00", closed: false },
      sunday: { open: "06:00", close: "19:00", closed: false }
    },
    entryFee: {
      adult: 0,
      child: 0,
      student: 0,
      currency: "XOF"
    },
    rating: 4.3,
    reviewCount: 89,
    featured: true,
    active: true,
    tags: ["cathédrale", "architecture", "moderne", "spirituel", "plateau", "cathedral", "modern", "spiritual"]
  },
  {
    name: "Marché de Treichville",
    nameEn: "Treichville Market",
    description: "L'un des plus grands marchés d'Afrique de l'Ouest, le marché de Treichville offre une immersion totale dans la vie quotidienne ivoirienne. Textiles, épices, artisanat et produits frais s'y côtoient.",
    descriptionEn: "One of the largest markets in West Africa, Treichville Market offers total immersion in Ivorian daily life. Textiles, spices, crafts and fresh produce come together here.",
    category: "market",
    location: {
      type: "Point",
      coordinates: [-4.0089, 5.2947]
    },
    address: "Treichville, Abidjan",
    city: "Abidjan",
    region: "Lagunes",
    images: [
      "https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=800",
      "https://images.unsplash.com/photo-1555529669-e69e7aa0ba9a?w=800"
    ],
    openingHours: {
      monday: { open: "06:00", close: "18:00", closed: false },
      tuesday: { open: "06:00", close: "18:00", closed: false },
      wednesday: { open: "06:00", close: "18:00", closed: false },
      thursday: { open: "06:00", close: "18:00", closed: false },
      friday: { open: "06:00", close: "18:00", closed: false },
      saturday: { open: "06:00", close: "19:00", closed: false },
      sunday: { open: "07:00", close: "17:00", closed: false }
    },
    entryFee: {
      adult: 0,
      child: 0,
      student: 0,
      currency: "XOF"
    },
    rating: 4.1,
    reviewCount: 203,
    featured: false,
    active: true,
    tags: ["marché", "shopping", "artisanat", "épices", "textiles", "market", "shopping", "crafts", "spices"]
  },
  
  // YAMOUSSOUKRO - Lacs
  {
    name: "Basilique Notre-Dame de la Paix",
    nameEn: "Basilica of Our Lady of Peace",
    description: "La plus grande église au monde, inspirée de la Basilique Saint-Pierre de Rome. Chef-d'œuvre architectural voulu par Félix Houphouët-Boigny, elle symbolise la grandeur de la Côte d'Ivoire.",
    descriptionEn: "The largest church in the world, inspired by St. Peter's Basilica in Rome. Architectural masterpiece commissioned by Félix Houphouët-Boigny, it symbolizes the grandeur of Côte d'Ivoire.",
    category: "religious",
    location: {
      type: "Point",
      coordinates: [-5.2767, 6.8206]
    },
    address: "Yamoussoukro",
    city: "Yamoussoukro",
    region: "Lacs",
    images: [
      "https://images.unsplash.com/photo-1520637736862-4d197d17c90a?w=800",
      "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=800",
      "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800"
    ],
    openingHours: {
      monday: { open: "08:00", close: "17:30", closed: false },
      tuesday: { open: "08:00", close: "17:30", closed: false },
      wednesday: { open: "08:00", close: "17:30", closed: false },
      thursday: { open: "08:00", close: "17:30", closed: false },
      friday: { open: "08:00", close: "17:30", closed: false },
      saturday: { open: "08:00", close: "18:00", closed: false },
      sunday: { open: "07:00", close: "18:00", closed: false }
    },
    entryFee: {
      adult: 1000,
      child: 500,
      student: 500,
      currency: "XOF"
    },
    rating: 4.8,
    reviewCount: 445,
    featured: true,
    active: true,
    tags: ["basilique", "église", "architecture", "spirituel", "patrimoine", "basilica", "church", "spiritual", "heritage"]
  },
  {
    name: "Palais Présidentiel de Yamoussoukro",
    nameEn: "Presidential Palace of Yamoussoukro",
    description: "Résidence officielle du président de la République, entourée d'un lac artificiel peuplé de caïmans. Architecture grandiose reflétant l'ambition politique de la capitale politique.",
    descriptionEn: "Official residence of the President of the Republic, surrounded by an artificial lake populated with caimans. Grandiose architecture reflecting the political ambition of the political capital.",
    category: "monument",
    location: {
      type: "Point",
      coordinates: [-5.2891, 6.8278]
    },
    address: "Yamoussoukro",
    city: "Yamoussoukro",
    region: "Lacs",
    images: [
      "https://images.unsplash.com/photo-1586616254439-d3a3a8b86e96?w=800",
      "https://images.unsplash.com/photo-1551632436-cbf8dd35adfa?w=800"
    ],
    openingHours: {
      monday: { open: "10:00", close: "16:00", closed: false },
      tuesday: { open: "10:00", close: "16:00", closed: false },
      wednesday: { open: "10:00", close: "16:00", closed: false },
      thursday: { open: "10:00", close: "16:00", closed: false },
      friday: { open: "10:00", close: "16:00", closed: false },
      saturday: { open: "10:00", close: "16:00", closed: false },
      sunday: { open: "", close: "", closed: true }
    },
    entryFee: {
      adult: 5000,
      child: 2500,
      student: 3000,
      currency: "XOF"
    },
    rating: 4.2,
    reviewCount: 156,
    featured: true,
    active: true,
    tags: ["palais", "politique", "architecture", "lac", "caïmans", "palace", "political", "architecture", "lake"]
  },

  // BOUAKE - Vallée du Bandama
  {
    name: "Grande Mosquée de Bouaké",
    nameEn: "Great Mosque of Bouaké",
    description: "Centre spirituel majeur du centre de la Côte d'Ivoire, cette mosquée de style soudano-sahélien témoigne de l'influence islamique dans la région. Architecture traditionnelle en banco.",
    descriptionEn: "Major spiritual center of central Côte d'Ivoire, this Sudano-Sahelian style mosque testifies to Islamic influence in the region. Traditional banco architecture.",
    category: "religious",
    location: {
      type: "Point",
      coordinates: [-5.0326, 7.6906]
    },
    address: "Centre-ville, Bouaké",
    city: "Bouaké",
    region: "Vallée du Bandama",
    images: [
      "https://images.unsplash.com/photo-1564769625392-651b87fa9825?w=800",
      "https://images.unsplash.com/photo-1591604466107-ec97de577aff?w=800"
    ],
    openingHours: {
      monday: { open: "05:00", close: "21:00", closed: false },
      tuesday: { open: "05:00", close: "21:00", closed: false },
      wednesday: { open: "05:00", close: "21:00", closed: false },
      thursday: { open: "05:00", close: "21:00", closed: false },
      friday: { open: "05:00", close: "21:00", closed: false },
      saturday: { open: "05:00", close: "21:00", closed: false },
      sunday: { open: "05:00", close: "21:00", closed: false }
    },
    entryFee: {
      adult: 0,
      child: 0,
      student: 0,
      currency: "XOF"
    },
    rating: 4.4,
    reviewCount: 78,
    featured: false,
    active: true,
    tags: ["mosquée", "islam", "soudano-sahélien", "banco", "spirituel", "mosque", "islamic", "spiritual"]
  },

  // SAN PEDRO - Bas-Sassandra
  {
    name: "Port de San Pedro",
    nameEn: "Port of San Pedro",
    description: "Deuxième port du pays, spécialisé dans l'exportation du cacao et du café. Point de départ idéal pour découvrir les plantations et l'industrie agro-alimentaire ivoirienne.",
    descriptionEn: "Second port of the country, specialized in cocoa and coffee export. Ideal starting point to discover plantations and Ivorian agri-food industry.",
    category: "monument",
    location: {
      type: "Point",
      coordinates: [-6.6286, 4.7467]
    },
    address: "San Pedro",
    city: "San Pedro",
    region: "Bas-Sassandra",
    images: [
      "https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=800",
      "https://images.unsplash.com/photo-1586616254439-d3a3a8b86e96?w=800"
    ],
    openingHours: {
      monday: { open: "07:00", close: "17:00", closed: false },
      tuesday: { open: "07:00", close: "17:00", closed: false },
      wednesday: { open: "07:00", close: "17:00", closed: false },
      thursday: { open: "07:00", close: "17:00", closed: false },
      friday: { open: "07:00", close: "17:00", closed: false },
      saturday: { open: "08:00", close: "15:00", closed: false },
      sunday: { open: "", close: "", closed: true }
    },
    entryFee: {
      adult: 3000,
      child: 1500,
      student: 2000,
      currency: "XOF"
    },
    rating: 3.8,
    reviewCount: 45,
    featured: false,
    active: true,
    tags: ["port", "cacao", "café", "export", "industrie", "plantation", "harbor", "cocoa", "coffee", "industry"]
  },

  // KORHOGO - Savanes
  {
    name: "Centre Artisanal de Korhogo",
    nameEn: "Korhogo Craft Center",
    description: "Haut lieu de l'artisanat sénoufo, ce centre présente les techniques traditionnelles de tissage, sculpture sur bois et poterie. L'art sénoufo dans toute sa splendeur.",
    descriptionEn: "High place of Senufo craftsmanship, this center presents traditional techniques of weaving, wood carving and pottery. Senufo art in all its splendor.",
    category: "cultural",
    location: {
      type: "Point",
      coordinates: [-5.6306, 9.4581]
    },
    address: "Korhogo",
    city: "Korhogo",
    region: "Savanes",
    images: [
      "https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=800",
      "https://images.unsplash.com/photo-1555529669-e69e7aa0ba9a?w=800"
    ],
    openingHours: {
      monday: { open: "08:00", close: "17:00", closed: false },
      tuesday: { open: "08:00", close: "17:00", closed: false },
      wednesday: { open: "08:00", close: "17:00", closed: false },
      thursday: { open: "08:00", close: "17:00", closed: false },
      friday: { open: "08:00", close: "17:00", closed: false },
      saturday: { open: "08:00", close: "18:00", closed: false },
      sunday: { open: "09:00", close: "16:00", closed: false }
    },
    entryFee: {
      adult: 2500,
      child: 1000,
      student: 1500,
      currency: "XOF"
    },
    rating: 4.6,
    reviewCount: 92,
    featured: true,
    active: true,
    tags: ["artisanat", "sénoufo", "tissage", "sculpture", "poterie", "tradition", "craft", "weaving", "carving", "pottery"]
  },

  // GRAND BASSAM - Sud-Comoé
  {
    name: "Ville Historique de Grand-Bassam",
    nameEn: "Historic Town of Grand-Bassam",
    description: "Première capitale de la Côte d'Ivoire et site UNESCO, Grand-Bassam conserve l'architecture coloniale française. Musées, plages et patrimoine historique exceptionnel.",
    descriptionEn: "First capital of Côte d'Ivoire and UNESCO site, Grand-Bassam preserves French colonial architecture. Museums, beaches and exceptional historical heritage.",
    category: "monument",
    location: {
      type: "Point",
      coordinates: [-3.7378, 5.2025]
    },
    address: "Grand-Bassam",
    city: "Grand-Bassam",
    region: "Sud-Comoé",
    images: [
      "https://images.unsplash.com/photo-1566127992631-137a642a90f4?w=800",
      "https://images.unsplash.com/photo-1586616254439-d3a3a8b86e96?w=800",
      "https://images.unsplash.com/photo-1551632436-cbf8dd35adfa?w=800"
    ],
    openingHours: {
      monday: { open: "08:00", close: "18:00", closed: false },
      tuesday: { open: "08:00", close: "18:00", closed: false },
      wednesday: { open: "08:00", close: "18:00", closed: false },
      thursday: { open: "08:00", close: "18:00", closed: false },
      friday: { open: "08:00", close: "18:00", closed: false },
      saturday: { open: "08:00", close: "19:00", closed: false },
      sunday: { open: "08:00", close: "19:00", closed: false }
    },
    entryFee: {
      adult: 2000,
      child: 1000,
      student: 1000,
      currency: "XOF"
    },
    rating: 4.7,
    reviewCount: 312,
    featured: true,
    active: true,
    tags: ["patrimoine", "UNESCO", "colonial", "histoire", "musée", "plage", "heritage", "colonial", "history", "beach"]
  },

  // PARC NATIONAL DE TAI - Cavally
  {
    name: "Parc National de Taï",
    nameEn: "Taï National Park",
    description: "Plus grande forêt primaire d'Afrique de l'Ouest, site UNESCO abritant une biodiversité exceptionnelle. Chimpanzés, éléphants de forêt et 1400 espèces végétales.",
    descriptionEn: "Largest primary forest in West Africa, UNESCO site home to exceptional biodiversity. Chimpanzees, forest elephants and 1400 plant species.",
    category: "nature",
    location: {
      type: "Point",
      coordinates: [-7.3833, 5.8500]
    },
    address: "Région de Taï",
    city: "Taï",
    region: "Cavally",
    images: [
      "https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=800",
      "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800",
      "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800"
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
      adult: 5000,
      child: 2500,
      student: 3000,
      currency: "XOF"
    },
    rating: 4.9,
    reviewCount: 167,
    featured: true,
    active: true,
    tags: ["parc", "nature", "UNESCO", "biodiversité", "chimpanzés", "forêt", "park", "nature", "biodiversity", "forest"]
  }
];

const sampleAudioGuides = [
  {
    title: "Histoire du Musée des Civilisations",
    titleEn: "History of the Museum of Civilizations",
    description: "Découvrez l'histoire fascinante des civilisations ivoiriennes à travers les collections du musée",
    descriptionEn: "Discover the fascinating history of Ivorian civilizations through the museum's collections",
    audioUrl: "https://example.com/audio/musee-civilizations.mp3",
    duration: 1200, // 20 minutes
    fileSize: 15360000, // 15.36 MB
    language: "fr",
    narrator: "Professeur Akissi Kouamé",
    transcript: "Bienvenue au Musée des Civilisations de Côte d'Ivoire. Ce musée abrite une collection exceptionnelle d'objets traditionnels, d'œuvres d'art et d'artefacts historiques qui retracent l'histoire riche et diverse des peuples ivoiriens. Nous commençons notre visite par la section dédiée aux masques traditionnels, véritables chefs-d'œuvre de l'art africain...",
    transcriptEn: "Welcome to the Museum of Civilizations of Côte d'Ivoire. This museum houses an exceptional collection of traditional objects, artworks and historical artifacts that trace the rich and diverse history of Ivorian peoples. We begin our visit with the section dedicated to traditional masks, true masterpieces of African art...",
    tags: ["histoire", "culture", "civilisations", "musée"]
  },
  {
    title: "Architecture de la Basilique",
    titleEn: "Architecture of the Basilica",
    description: "Guide architectural détaillé de la Basilique Notre-Dame de la Paix",
    descriptionEn: "Detailed architectural guide to the Basilica of Our Lady of Peace",
    audioUrl: "https://example.com/audio/basilique-architecture.mp3",
    duration: 1800, // 30 minutes
    fileSize: 23040000, // 23.04 MB
    language: "fr",
    narrator: "Architecte Jean-Marie Tano",
    transcript: "La Basilique Notre-Dame de la Paix de Yamoussoukro est un monument architectural extraordinaire, inspiré de la Basilique Saint-Pierre de Rome. Sa construction a débuté en 1985 et s'est achevée en 1989. Avec ses 158 mètres de hauteur, elle détient le record du plus haut édifice religieux chrétien au monde...",
    transcriptEn: "The Basilica of Our Lady of Peace in Yamoussoukro is an extraordinary architectural monument, inspired by St. Peter's Basilica in Rome. Its construction began in 1985 and was completed in 1989. At 158 meters high, it holds the record for the tallest Christian religious building in the world...",
    tags: ["architecture", "basilique", "spirituel", "patrimoine"]
  },
  {
    title: "Wildlife of Taï National Park",
    titleEn: "Wildlife of Taï National Park",
    description: "Comprehensive guide to the wildlife and biodiversity of Taï National Park",
    descriptionEn: "Comprehensive guide to the wildlife and biodiversity of Taï National Park",
    audioUrl: "https://example.com/audio/tai-wildlife.mp3",
    duration: 2100, // 35 minutes
    fileSize: 26880000, // 26.88 MB
    language: "en",
    narrator: "Dr. Mamadou Sangare",
    transcript: "Le Parc National de Taï est l'une des dernières forêts tropicales primaires d'Afrique de l'Ouest. Classé au patrimoine mondial de l'UNESCO, il abrite une biodiversité exceptionnelle avec plus de 1300 espèces de plantes supérieures, 140 espèces de mammifères et 250 espèces d'oiseaux...",
    transcriptEn: "Taï National Park is one of the last primary tropical forests in West Africa. Listed as a UNESCO World Heritage site, it houses exceptional biodiversity with more than 1,300 species of higher plants, 140 mammal species and 250 bird species...",
    tags: ["nature", "wildlife", "biodiversity", "conservation", "UNESCO"]
  },
  {
    title: "Art Sénoufo Traditionnel",
    titleEn: "Traditional Senufo Art",
    description: "Exploration des techniques et significations de l'art sénoufo de Korhogo",
    descriptionEn: "Exploration of techniques and meanings of Senufo art from Korhogo",
    audioUrl: "https://example.com/audio/art-senoufo.mp3",
    duration: 900, // 15 minutes
    fileSize: 11520000, // 11.52 MB
    language: "fr",
    narrator: "Maître Yaya Coulibaly",
    transcript: "L'art sénoufo de la région de Korhogo est reconnu mondialement pour sa richesse symbolique et sa beauté esthétique. Les masques, statues et textiles sénoufo ne sont pas de simples objets décoratifs, mais des éléments centraux de la cosmogonie et des rituels traditionnels...",
    transcriptEn: "Senufo art from the Korhogo region is recognized worldwide for its symbolic richness and aesthetic beauty. Senufo masks, statues and textiles are not mere decorative objects, but central elements of cosmogony and traditional rituals...",
    tags: ["art", "sénoufo", "tradition", "artisanat", "culture"]
  },
  {
    title: "Colonial Heritage of Grand-Bassam",
    titleEn: "Colonial Heritage of Grand-Bassam",
    description: "Walking tour through the colonial architecture and history of Grand-Bassam",
    descriptionEn: "Walking tour through the colonial architecture and history of Grand-Bassam",
    audioUrl: "https://example.com/audio/grand-bassam-heritage.mp3",
    duration: 1500, // 25 minutes
    fileSize: 19200000, // 19.2 MB
    language: "en",
    narrator: "Historian Dr. Marie-Claire Smets",
    transcript: "Grand-Bassam, ancienne capitale de la Côte d'Ivoire, témoigne de l'époque coloniale française avec son architecture préservée. Classée au patrimoine mondial de l'UNESCO, la ville offre un voyage dans le temps à travers ses bâtiments administratifs, ses maisons de commerce et ses quartiers résidentiels...",
    transcriptEn: "Grand-Bassam, former capital of Côte d'Ivoire, bears witness to the French colonial era with its preserved architecture. Listed as a UNESCO World Heritage site, the city offers a journey through time through its administrative buildings, commercial houses and residential neighborhoods...",
    tags: ["colonial", "heritage", "UNESCO", "history", "architecture"]
  },
  {
    title: "Marchés et Commerce d'Abidjan",
    titleEn: "Markets and Commerce of Abidjan",
    description: "Immersion dans l'univers commercial des marchés d'Abidjan",
    descriptionEn: "Immersion in the commercial world of Abidjan markets",
    audioUrl: "https://example.com/audio/marches-abidjan.mp3",
    duration: 1080, // 18 minutes
    fileSize: 13824000, // 13.824 MB
    language: "fr",
    narrator: "Commerçante Aya Traoré",
    transcript: "Les marchés d'Abidjan sont le cœur battant de l'économie ivoirienne. Du grand marché de Treichville au marché de Cocody, en passant par Adjamé, ces lieux d'échange reflètent la diversité culturelle et la vitalité économique de la métropole...",
    transcriptEn: "Abidjan's markets are the beating heart of the Ivorian economy. From the great market of Treichville to the Cocody market, through Adjamé, these places of exchange reflect the cultural diversity and economic vitality of the metropolis...",
    tags: ["commerce", "marché", "économie", "culture", "vie quotidienne"]
  }
];

const sampleTours = [
  {
    name: "Circuit Découverte d'Abidjan",
    nameEn: "Abidjan Discovery Tour",
    description: "Tour complet de la capitale économique : Plateau moderne, quartiers populaires, marchés traditionnels et sites culturels majeurs.",
    descriptionEn: "Complete tour of the economic capital: modern Plateau, popular neighborhoods, traditional markets and major cultural sites.",
    category: "cultural",
    totalDuration: 480, // 8 heures
    distance: 45, // 45 km
    difficulty: "easy",
    startLocation: {
      type: "Point",
      coordinates: [-4.0267, 5.3364] // Abidjan Plateau
    },
    endLocation: {
      type: "Point", 
      coordinates: [-4.0267, 5.3364] // Retour au Plateau
    },
    price: {
      adult: 15000,
      child: 7500,
      currency: "XOF"
    },
    rating: 4.4,
    featured: true,
    active: true,
    attractionIds: []
  },
  {
    name: "Patrimoine Spirituel de Côte d'Ivoire",
    nameEn: "Spiritual Heritage of Côte d'Ivoire",
    description: "Circuit religieux visitant la Basilique de Yamoussoukro, les mosquées historiques et sites spirituels traditionnels.",
    descriptionEn: "Religious circuit visiting the Yamoussoukro Basilica, historic mosques and traditional spiritual sites.",
    category: "historic", // Changé de "religious" vers "historic"
    totalDuration: 720, // 12 heures
    distance: 280, // 280 km
    difficulty: "moderate",
    startLocation: {
      type: "Point",
      coordinates: [-4.0267, 5.3364] // Abidjan
    },
    endLocation: {
      type: "Point",
      coordinates: [-5.2767, 6.8205] // Yamoussoukro
    },
    price: {
      adult: 25000,
      child: 12500,
      currency: "XOF"
    },
    rating: 4.7,
    featured: true,
    active: true,
    attractionIds: []
  },
  {
    name: "Safari Nature et Biodiversité",
    nameEn: "Nature and Biodiversity Safari",
    description: "Exploration des parcs nationaux, observation de la faune sauvage et découverte des écosystèmes forestiers uniques.",
    descriptionEn: "Exploration of national parks, wildlife observation and discovery of unique forest ecosystems.",
    category: "nature",
    totalDuration: 1440, // 2 jours
    distance: 650, // 650 km
    difficulty: "hard", // Changé de "challenging" vers "hard"
    startLocation: {
      type: "Point",
      coordinates: [-4.0267, 5.3364] // Abidjan
    },
    endLocation: {
      type: "Point",
      coordinates: [-7.3528, 5.8451] // Parc National de Taï
    },
    price: {
      adult: 85000,
      child: 42500,
      currency: "XOF"
    },
    rating: 4.9,
    featured: true,
    active: true,
    attractionIds: []
  },
  {
    name: "Route du Cacao et du Café",
    nameEn: "Cocoa and Coffee Route",
    description: "Visite des plantations, processus de transformation et rencontre avec les producteurs du célèbre cacao ivoirien.",
    descriptionEn: "Visit plantations, transformation processes and meet producers of famous Ivorian cocoa.",
    category: "nature",
    totalDuration: 600, // 10 heures
    distance: 420, // 420 km
    difficulty: "moderate",
    startLocation: {
      type: "Point",
      coordinates: [-4.0267, 5.3364] // Abidjan
    },
    endLocation: {
      type: "Point",
      coordinates: [-6.8463, 6.1373] // Région cacaoyère
    },
    price: {
      adult: 35000,
      child: 17500,
      currency: "XOF"
    },
    rating: 4.5,
    featured: false,
    active: true,
    attractionIds: []
  },
  {
    name: "Art et Artisanat Traditionnel",
    nameEn: "Traditional Art and Crafts",
    description: "Immersion dans l'univers artistique ivoirien : ateliers de sculpture, tissage traditionnel et centres artisanaux.",
    descriptionEn: "Immersion in the Ivorian artistic universe: sculpture workshops, traditional weaving and craft centers.",
    category: "art",
    totalDuration: 540, // 9 heures
    distance: 320, // 320 km
    difficulty: "easy",
    startLocation: {
      type: "Point",
      coordinates: [-4.0267, 5.3364] // Abidjan
    },
    endLocation: {
      type: "Point",
      coordinates: [-5.6289, 9.4518] // Korhogo
    },
    price: {
      adult: 20000,
      child: 10000,
      currency: "XOF"
    },
    rating: 4.6,
    featured: true,
    active: true,
    attractionIds: []
  },
  {
    name: "Côte Atlantique et Plages",
    nameEn: "Atlantic Coast and Beaches",
    description: "Découverte du littoral ivoirien : plages de Grand-Bassam, villages de pêcheurs et patrimoine côtier.",
    descriptionEn: "Discovery of the Ivorian coastline: Grand-Bassam beaches, fishing villages and coastal heritage.",
    category: "nature",
    totalDuration: 480, // 8 heures
    distance: 150, // 150 km
    difficulty: "easy",
    startLocation: {
      type: "Point",
      coordinates: [-4.0267, 5.3364] // Abidjan
    },
    endLocation: {
      type: "Point",
      coordinates: [-3.7380, 5.2009] // Grand-Bassam
    },
    price: {
      adult: 18000,
      child: 9000,
      currency: "XOF"
    },
    rating: 4.2,
    featured: false,
    active: true,
    attractionIds: []
  },
  {
    name: "Gastronomie et Saveurs Ivoiriennes",
    nameEn: "Ivorian Gastronomy and Flavors",
    description: "Voyage culinaire à travers les spécialités régionales, marchés d'épices et restaurants traditionnels.",
    descriptionEn: "Culinary journey through regional specialties, spice markets and traditional restaurants.",
    category: "culinary", // Changé de "restaurant" vers "culinary"
    totalDuration: 360, // 6 heures
    distance: 80, // 80 km
    difficulty: "easy",
    startLocation: {
      type: "Point",
      coordinates: [-4.0267, 5.3364] // Abidjan
    },
    endLocation: {
      type: "Point",
      coordinates: [-4.0267, 5.3364] // Retour à Abidjan
    },
    price: {
      adult: 22000,
      child: 11000,
      currency: "XOF"
    },
    rating: 4.3,
    featured: false,
    active: true,
    attractionIds: []
  },
  {
    name: "Histoire Coloniale et Indépendance",
    nameEn: "Colonial History and Independence",
    description: "Parcours historique retraçant l'époque coloniale, les luttes d'indépendance et la naissance de la nation ivoirienne.",
    descriptionEn: "Historical journey retracing the colonial era, independence struggles and birth of the Ivorian nation.",
    category: "historic", // Changé de "monument" vers "historic"
    totalDuration: 420, // 7 heures
    distance: 120, // 120 km
    difficulty: "moderate",
    startLocation: {
      type: "Point",
      coordinates: [-4.0267, 5.3364] // Abidjan
    },
    endLocation: {
      type: "Point",
      coordinates: [-3.7380, 5.2009] // Grand-Bassam
    },
    price: {
      adult: 16000,
      child: 8000,
      currency: "XOF"
    },
    rating: 4.1,
    featured: false,
    active: true,
    attractionIds: []
  }
];

const sampleUsers = [
  {
    firebaseUid: "user_admin_001",
    email: "admin@cotedivoire-audioguide.com",
    displayName: "Administrateur Principal",
    firstName: "Admin",
    lastName: "Principal",
    role: "admin",
    active: true,
    preferences: {
      language: "fr",
      notifications: true,
      offlineMode: false
    },
    photoURL: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400",
    subscription: {
      type: "premium"
    },
    favorites: [],
    downloadedGuides: [],
    visitHistory: []
  },
  {
    firebaseUid: "user_guide_002",
    email: "guide.local@email.com",
    displayName: "Kouassi Yao",
    firstName: "Kouassi",
    lastName: "Yao", 
    role: "moderator",
    active: true,
    preferences: {
      language: "fr",
      notifications: true,
      offlineMode: false
    },
    photoURL: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400",
    subscription: {
      type: "premium"
    },
    favorites: [],
    downloadedGuides: [],
    visitHistory: []
  },
  {
    firebaseUid: "user_tourist_003",
    email: "marie.dubois@email.fr",
    displayName: "Marie Dubois",
    firstName: "Marie",
    lastName: "Dubois",
    nationality: "France",
    role: "user",
    active: true,
    preferences: {
      language: "fr",
      notifications: false,
      offlineMode: true
    },
    photoURL: "https://images.unsplash.com/photo-1494790108755-2616b612b7e1?w=400",
    subscription: {
      type: "free"
    },
    favorites: [],
    downloadedGuides: [],
    visitHistory: []
  },
  {
    firebaseUid: "user_researcher_004",
    email: "dr.johnson@university.edu",
    displayName: "Dr. Sarah Johnson",
    firstName: "Sarah",
    lastName: "Johnson",
    nationality: "United States",
    role: "user",
    active: true,
    preferences: {
      language: "en",
      notifications: true,
      offlineMode: false
    },
    photoURL: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=400",
    subscription: {
      type: "premium"
    },
    favorites: [],
    downloadedGuides: [],
    visitHistory: []
  },
  {
    firebaseUid: "user_student_005",
    email: "ahmed.kone@student.ci",
    displayName: "Ahmed Koné",
    firstName: "Ahmed",
    lastName: "Koné",
    nationality: "Côte d'Ivoire",
    role: "user",
    active: true,
    preferences: {
      language: "fr",
      notifications: true,
      offlineMode: true
    },
    photoURL: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400",
    subscription: {
      type: "free"
    },
    favorites: [],
    downloadedGuides: [],
    visitHistory: []
  },
  {
    firebaseUid: "user_inactive_006",
    email: "inactive@email.com",
    displayName: "Utilisateur Inactif",
    firstName: "Utilisateur",
    lastName: "Inactif",
    role: "user",
    active: false,
    preferences: {
      language: "fr",
      notifications: false,
      offlineMode: false
    },
    photoURL: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400",
    subscription: {
      type: "free"
    },
    favorites: [],
    downloadedGuides: [],
    visitHistory: []
  }
];

async function seedDatabase() {
  try {
    console.log('🌱 Démarrage du seed complet de la base de données...');
    
    // Connexion à MongoDB
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Connecté à MongoDB');

    // Suppression des données existantes
    console.log('🗑️  Suppression des données existantes...');
    await Promise.all([
      Attraction.deleteMany({}),
      AudioGuide.deleteMany({}),
      Tour.deleteMany({}),
      User.deleteMany({})
    ]);

    // Création des attractions
    console.log('🏛️  Création des attractions...');
    const createdAttractions = await Attraction.insertMany(sampleAttractions);
    console.log(`   ✅ ${createdAttractions.length} attractions créées`);

    // Création des guides audio liés aux attractions
    console.log('🎧 Création des guides audio...');
    const audioGuidesWithAttraction = sampleAudioGuides.map((guide, index) => ({
      ...guide,
      attractionId: createdAttractions[index % createdAttractions.length]._id
    }));
    const createdAudioGuides = await AudioGuide.insertMany(audioGuidesWithAttraction);
    console.log(`   ✅ ${createdAudioGuides.length} guides audio créés`);

    // Création des tours avec liens vers les attractions
    console.log('🗺️  Création des circuits touristiques...');
    const toursWithAttractions = sampleTours.map((tour, index) => {
      // Assigner 2-4 attractions par tour
      const startIndex = (index * 2) % createdAttractions.length;
      const attractionCount = 2 + (index % 3); // 2 à 4 attractions
      const attractionIds: mongoose.Types.ObjectId[] = [];
      
      for (let i = 0; i < attractionCount; i++) {
        const attractionIndex = (startIndex + i) % createdAttractions.length;
        attractionIds.push(createdAttractions[attractionIndex]._id as mongoose.Types.ObjectId);
      }
      
      return {
        ...tour,
        attractionIds
      };
    });
    const createdTours = await Tour.insertMany(toursWithAttractions);
    console.log(`   ✅ ${createdTours.length} circuits créés`);

    // Création des utilisateurs
    console.log('👥 Création des utilisateurs...');
    const createdUsers = await User.insertMany(sampleUsers);
    console.log(`   ✅ ${createdUsers.length} utilisateurs créés`);

    // Création des reviews d'exemple
    console.log('⭐ Création des avis et évaluations...');
    const sampleReviews: any[] = [];
    
    // Reviews pour quelques attractions
    const attractionReviews = [
      {
        itemType: 'Attraction',
        itemId: createdAttractions[0]._id, // Musée des Civilisations
        userId: createdUsers[0]._id,
        rating: 5,
        comment: 'Musée fantastique ! Les collections sont riches et bien présentées. Guide très informatif.',
        isModerated: true,
        active: true
      },
      {
        itemType: 'Attraction',
        itemId: createdAttractions[0]._id,
        userId: createdUsers[1]._id,
        rating: 4,
        comment: 'Très intéressant, surtout la section sur l\'art akan. À recommander.',
        isModerated: true,
        active: true
      },
      {
        itemType: 'Attraction',
        itemId: createdAttractions[1]._id, // Cathédrale Saint-Paul
        userId: createdUsers[2]._id,
        rating: 5,
        comment: 'Architecture impressionnante ! La visite guidée était excellente.',
        isModerated: true,
        active: true
      },
      {
        itemType: 'Attraction',
        itemId: createdAttractions[2]._id, // Parc du Banco
        userId: createdUsers[0]._id,
        rating: 4,
        comment: 'Belle promenade dans la nature. Parfait pour une escapade verte à Abidjan.',
        isModerated: false, // En attente de modération
        active: true
      },
      {
        itemType: 'Attraction',
        itemId: createdAttractions[3]._id, // Marché de Treichville
        userId: createdUsers[3]._id,
        rating: 3,
        comment: 'Marché authentique mais très bruyant. Expérience intéressante.',
        isModerated: true,
        active: false // Désactivé par l'admin
      }
    ];

    // Reviews pour quelques tours
    const tourReviews = [
      {
        itemType: 'Tour',
        itemId: createdTours[0]._id, // Tour d'Abidjan
        userId: createdUsers[1]._id,
        rating: 5,
        comment: 'Circuit parfait pour découvrir Abidjan ! Guide très compétent.',
        isModerated: true,
        active: true
      },
      {
        itemType: 'Tour',
        itemId: createdTours[1]._id, // Tour culturel
        userId: createdUsers[2]._id,
        rating: 4,
        comment: 'Excellente immersion culturelle. Les sites sont bien choisis.',
        isModerated: true,
        active: true
      },
      {
        itemType: 'Tour',
        itemId: createdTours[0]._id,
        userId: createdUsers[4]._id,
        rating: 2,
        comment: 'Tour trop long, certains sites pas très intéressants.',
        isModerated: false, // En attente
        active: true
      }
    ];

    // Reviews pour quelques guides audio
    const audioGuideReviews = [
      {
        itemType: 'AudioGuide',
        itemId: createdAudioGuides[0]._id,
        userId: createdUsers[3]._id,
        rating: 5,
        comment: 'Guide audio excellent ! Très instructif et bien narré.',
        isModerated: true,
        active: true
      },
      {
        itemType: 'AudioGuide',
        itemId: createdAudioGuides[1]._id,
        userId: createdUsers[4]._id,
        rating: 4,
        comment: 'Bonne qualité audio, informations pertinentes.',
        isModerated: true,
        active: true
      },
      {
        itemType: 'AudioGuide',
        itemId: createdAudioGuides[2]._id,
        userId: createdUsers[0]._id,
        rating: 1,
        comment: 'Audio de mauvaise qualité, difficile à comprendre.',
        isModerated: true,
        active: false // Désactivé suite à la mauvaise note
      }
    ];

    sampleReviews.push(...attractionReviews, ...tourReviews, ...audioGuideReviews);
    
    const createdReviews = await Review.insertMany(sampleReviews);
    console.log(`   ✅ ${createdReviews.length} avis créés (${createdReviews.filter(r => r.isModerated).length} modérés, ${createdReviews.filter(r => r.active).length} actifs)`);

    // Statistiques finales
    console.log('\n📊 Résumé du seed:');
    console.log(`   📍 ${createdAttractions.length} attractions dans ${new Set(createdAttractions.map(a => a.city)).size} villes`);
    console.log(`   🎧 ${createdAudioGuides.length} guides audio`);
    console.log(`   🗺️  ${createdTours.length} circuits touristiques`);
    console.log(`   👥 ${createdUsers.length} utilisateurs (${createdUsers.filter(u => u.active).length} actifs)`);
    console.log(`   ⭐ ${createdReviews.length} avis (${createdReviews.filter(r => r.isModerated).length} modérés, ${createdReviews.filter(r => r.active).length} actifs)`);
    
    console.log('\n🎯 Données pour tester le generalController:');
    console.log(`   🏛️  Catégories d'attractions: ${new Set(createdAttractions.map(a => a.category)).size}`);
    console.log(`   🗺️  Catégories de tours: ${new Set(createdTours.map(t => t.category)).size}`);
    console.log(`   📍 Villes: ${Array.from(new Set(createdAttractions.map(a => a.city))).join(', ')}`);
    console.log(`   🌍 Régions: ${Array.from(new Set(createdAttractions.map(a => a.region))).join(', ')}`);
    console.log(`   ⭐ Attractions featured: ${createdAttractions.filter(a => a.featured).length}`);
    console.log(`   ⭐ Tours featured: ${createdTours.filter(t => t.featured).length}`);
    
    console.log('\n🎯 Données pour tester le système de reviews:');
    console.log(`   📝 Reviews par type: Attractions(${createdReviews.filter(r => r.itemType === 'Attraction').length}), Tours(${createdReviews.filter(r => r.itemType === 'Tour').length}), AudioGuides(${createdReviews.filter(r => r.itemType === 'AudioGuide').length})`);
    console.log(`   ✅ Reviews modérées: ${createdReviews.filter(r => r.isModerated).length}/${createdReviews.length}`);
    console.log(`   🟢 Reviews actives: ${createdReviews.filter(r => r.active).length}/${createdReviews.length}`);
    console.log(`   🔴 Reviews en attente: ${createdReviews.filter(r => !r.isModerated).length}`);
    console.log(`   📊 Notes moyennes: ${(createdReviews.reduce((acc, r) => acc + r.rating, 0) / createdReviews.length).toFixed(1)}/5`);

  } catch (error) {
    console.error('❌ Erreur lors du seed:', error);
  } finally {
    await mongoose.disconnect();
    console.log('🔌 Déconnecté de MongoDB');
  }
}

seedDatabase();
