/**
 * Données mockées pour le développement et tests
 * Utilisées quand le backend n'est pas disponible
 */

import type { BackendAttraction, BackendAudioGuide } from '../types/backend';

export const mockAttractions: BackendAttraction[] = [
  {
    _id: '1',
    name: 'Basilique Notre-Dame de la Paix',
    description: 'La Basilique Notre-Dame de la Paix de Yamoussoukro est un édifice religieux catholique consacré en 1990. C\'est la plus grande basilique au monde avec une superficie de 30 000 m². Inspirée de la Basilique Saint-Pierre de Rome, elle peut accueillir 18 000 fidèles. Monument emblématique de la Côte d\'Ivoire, elle symbolise la foi et l\'architecture grandiose.',
    shortDescription: 'La plus grande basilique au monde, monument emblématique de Yamoussoukro',
    category: 'Monument',
    location: {
      type: 'Point',
      coordinates: [-5.2893, 6.8203],
      address: 'Yamoussoukro, Côte d\'Ivoire'
    },
    images: [
      'https://images.unsplash.com/photo-1589519160732-57fc498494f8?w=800',
      'https://images.unsplash.com/photo-1605649487212-1a2c0279d87f?w=800',
      'https://images.unsplash.com/photo-1605649487291-6585d6d98e4f?w=800'
    ],
    audioGuides: ['audio1', 'audio2'],
    rating: 4.8,
    visitCount: 15420,
    status: 'active',
    address: 'BP 1001, Yamoussoukro',
    openingHours: 'Lun-Dim: 6h00 - 18h00',
    phone: '+225 27 30 64 10 51',
    website: 'https://notredamedelapaix.org',
    createdAt: new Date('2024-01-15'),
    updatedAt: new Date('2025-10-01')
  },
  {
    _id: '2',
    name: 'Parc National de Taï',
    description: 'Le Parc National de Taï est l\'une des dernières étendues de forêt primaire d\'Afrique de l\'Ouest. Inscrit au patrimoine mondial de l\'UNESCO, il abrite une biodiversité exceptionnelle avec plus de 140 espèces de mammifères dont des chimpanzés, des éléphants pygmées et des hippopotames nains. Un paradis pour les amoureux de la nature.',
    shortDescription: 'Forêt primaire classée UNESCO, paradis de la biodiversité',
    category: 'Nature',
    location: {
      type: 'Point',
      coordinates: [-7.3520, 5.8450],
      address: 'Région du Guémon, Sud-Ouest',
    },
    images: [
      'https://images.unsplash.com/photo-1516026672322-bc52d61a55d5?w=800',
      'https://images.unsplash.com/photo-1535083783855-76ae62b2914e?w=800',
      'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=800'
    ],
    audioGuides: ['audio3'],
    rating: 4.9,
    visitCount: 8900,
    status: 'active',
    address: 'Taï, Sud-Ouest de la Côte d\'Ivoire',
    openingHours: 'Visites guidées sur réservation',
    phone: '+225 27 34 71 00 48',
    createdAt: new Date('2024-02-10'),
    updatedAt: new Date('2025-09-28')
  },
  {
    _id: '3',
    name: 'Musée des Civilisations de Côte d\'Ivoire',
    description: 'Situé au Plateau à Abidjan, le Musée des Civilisations présente l\'histoire et la culture ivoirienne à travers une collection exceptionnelle de masques, statues, tissus et objets traditionnels. Un voyage fascinant à travers les 60 ethnies du pays et leurs traditions ancestrales.',
    shortDescription: 'Collections ethnographiques et patrimoine culturel ivoirien',
    category: 'Musée',
    location: {
      type: 'Point',
      coordinates: [-4.0267, 5.3257],
      address: 'Le Plateau, Abidjan'
    },
    images: [
      'https://images.unsplash.com/photo-1566127444979-b3d2b64d3b0d?w=800',
      'https://images.unsplash.com/photo-1582555172866-f73bb12a2ab3?w=800',
      'https://images.unsplash.com/photo-1607619056574-7b8d3ee536b2?w=800'
    ],
    audioGuides: ['audio4', 'audio5'],
    rating: 4.6,
    visitCount: 12300,
    status: 'active',
    address: 'Boulevard Carde, Le Plateau, Abidjan',
    openingHours: 'Mar-Dim: 9h00 - 17h00 (fermé lundi)',
    phone: '+225 27 20 23 14 50',
    website: 'https://musee-civilisations.ci',
    createdAt: new Date('2024-01-20'),
    updatedAt: new Date('2025-10-05')
  },
  {
    _id: '4',
    name: 'Grand-Bassam',
    description: 'Ancienne capitale coloniale classée au patrimoine mondial de l\'UNESCO, Grand-Bassam est une ville côtière chargée d\'histoire. Ses bâtiments coloniaux, ses plages de sable fin et son musée national en font une destination incontournable. Promenez-vous dans le quartier France et découvrez l\'architecture d\'époque.',
    shortDescription: 'Ville historique UNESCO avec plages et architecture coloniale',
    category: 'Culture',
    location: {
      type: 'Point',
      coordinates: [-3.7382, 5.1967],
      address: 'Grand-Bassam'
    },
    images: [
      'https://images.unsplash.com/photo-1559827260-dc66d52bef19?w=800',
      'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800',
      'https://images.unsplash.com/photo-1473496169904-658ba7c44d8a?w=800'
    ],
    audioGuides: ['audio6'],
    rating: 4.7,
    visitCount: 18750,
    status: 'active',
    address: 'Grand-Bassam, Sud de la Côte d\'Ivoire',
    openingHours: 'Accessible 24h/24',
    phone: '+225 27 21 30 11 91',
    createdAt: new Date('2024-03-01'),
    updatedAt: new Date('2025-10-02')
  },
  {
    _id: '5',
    name: 'Marché de Cocody',
    description: 'Le Marché de Cocody est un lieu vibrant où se mêlent couleurs, saveurs et traditions. Découvrez les fruits tropicaux, les épices locales, l\'artisanat ivoirien et goûtez aux spécialités culinaires. Une immersion authentique dans la vie quotidienne abidjanaise.',
    shortDescription: 'Marché traditionnel, couleurs et saveurs de la Côte d\'Ivoire',
    category: 'Gastronomie',
    location: {
      type: 'Point',
      coordinates: [-4.0083, 5.3483],
      address: 'Cocody, Abidjan'
    },
    images: [
      'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=800',
      'https://images.unsplash.com/photo-1488459716781-31db52582fe9?w=800',
      'https://images.unsplash.com/photo-1603105037880-880cd4edfb0d?w=800'
    ],
    audioGuides: ['audio7'],
    rating: 4.4,
    visitCount: 9800,
    status: 'active',
    address: 'Rue des Jardins, Cocody, Abidjan',
    openingHours: 'Lun-Sam: 6h00 - 19h00, Dim: 6h00 - 14h00',
    phone: '+225 27 22 41 55 88',
    createdAt: new Date('2024-02-15'),
    updatedAt: new Date('2025-09-30')
  },
  {
    _id: '6',
    name: 'Cathédrale Saint-Paul',
    description: 'Chef-d\'œuvre architectural moderne situé au Plateau, la Cathédrale Saint-Paul impressionne par sa structure unique en forme de croix et ses vitraux colorés. Conçue par l\'architecte italien Aldo Spirito, elle symbolise la rencontre entre modernité et spiritualité.',
    shortDescription: 'Architecture moderne spectaculaire, symbole d\'Abidjan',
    category: 'Architecture',
    location: {
      type: 'Point',
      coordinates: [-4.0250, 5.3217],
      address: 'Boulevard de Marseille, Abidjan'
    },
    images: [
      'https://images.unsplash.com/photo-1583417319070-4a69db38a482?w=800',
      'https://images.unsplash.com/photo-1548602088-9d89c93c3cbb?w=800',
      'https://images.unsplash.com/photo-1519283777784-7bed29ed5d7f?w=800'
    ],
    audioGuides: ['audio8'],
    rating: 4.5,
    visitCount: 11200,
    status: 'active',
    address: 'Boulevard de Marseille, Le Plateau, Abidjan',
    openingHours: 'Lun-Dim: 7h00 - 18h00',
    phone: '+225 27 20 21 28 40',
    createdAt: new Date('2024-01-25'),
    updatedAt: new Date('2025-10-04')
  },
  {
    _id: '7',
    name: 'Plage d\'Assinie',
    description: 'Située à 100 km d\'Abidjan, la Plage d\'Assinie est un joyau de la côte ivoirienne. Sable blanc, cocotiers et eaux turquoise en font une destination de rêve. Idéale pour la détente, les sports nautiques et la découverte de la vie maritime locale.',
    shortDescription: 'Paradis balnéaire, sable blanc et eaux cristallines',
    category: 'Plage',
    location: {
      type: 'Point',
      coordinates: [-3.3167, 5.1333],
      address: 'Assinie, Sud-Est'
    },
    images: [
      'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=800',
      'https://images.unsplash.com/photo-1519046904884-53103b34b206?w=800',
      'https://images.unsplash.com/photo-1473116763249-2faaef81ccda?w=800'
    ],
    audioGuides: [],
    rating: 4.8,
    visitCount: 16500,
    status: 'active',
    address: 'Assinie-Mafia, Sud-Est de la Côte d\'Ivoire',
    openingHours: 'Accessible 24h/24',
    phone: '+225 27 21 39 55 22',
    createdAt: new Date('2024-03-10'),
    updatedAt: new Date('2025-10-06')
  },
  {
    _id: '8',
    name: 'Parc National de la Comoé',
    description: 'Plus grande aire protégée d\'Afrique de l\'Ouest, le Parc National de la Comoé offre une diversité de paysages incroyable. Savanes, forêts galeries et points d\'eau abritent éléphants, lions, buffles, hippopotames et plus de 500 espèces d\'oiseaux. Un safari authentique.',
    shortDescription: 'Safaris et faune sauvage dans la plus grande réserve d\'Afrique de l\'Ouest',
    category: 'Parc',
    location: {
      type: 'Point',
      coordinates: [-3.7000, 9.1500],
      address: 'Nord-Est, près de Bouna'
    },
    images: [
      'https://images.unsplash.com/photo-1547471080-7cc2caa01a7e?w=800',
      'https://images.unsplash.com/photo-1516426122078-c23e76319801?w=800',
      'https://images.unsplash.com/photo-1549366021-9f761d450615?w=800'
    ],
    audioGuides: ['audio9'],
    rating: 4.9,
    visitCount: 7200,
    status: 'active',
    address: 'Parc National de la Comoé, Nord-Est',
    openingHours: 'Visites guidées sur réservation (saison sèche recommandée)',
    phone: '+225 27 35 91 04 20',
    createdAt: new Date('2024-02-20'),
    updatedAt: new Date('2025-09-25')
  }
];

export const mockAudioGuides: BackendAudioGuide[] = [
  {
    _id: 'audio1',
    title: 'Histoire de la Basilique - Version Française',
    description: 'Découvrez l\'histoire fascinante de la construction de la Basilique Notre-Dame de la Paix et son importance culturelle',
    audioUrl: 'https://example.com/audio/basilique-fr.mp3',
    duration: 480,
    language: 'fr',
    attractionId: '1',
    thumbnailUrl: 'https://images.unsplash.com/photo-1589519160732-57fc498494f8?w=400',
    status: 'active',
    createdAt: new Date('2024-01-15'),
    updatedAt: new Date('2025-10-01')
  },
  {
    _id: 'audio2',
    title: 'Basilica History - English Version',
    description: 'Discover the fascinating history of the construction of the Basilica of Our Lady of Peace',
    audioUrl: 'https://example.com/audio/basilica-en.mp3',
    duration: 480,
    language: 'en',
    attractionId: '1',
    thumbnailUrl: 'https://images.unsplash.com/photo-1589519160732-57fc498494f8?w=400',
    status: 'active',
    createdAt: new Date('2024-01-15'),
    updatedAt: new Date('2025-10-01')
  },
  {
    _id: 'audio3',
    title: 'Biodiversité du Parc de Taï',
    description: 'Explorez la richesse de la faune et de la flore du Parc National de Taï, classé UNESCO',
    audioUrl: 'https://example.com/audio/tai-biodiv.mp3',
    duration: 600,
    language: 'fr',
    attractionId: '2',
    thumbnailUrl: 'https://images.unsplash.com/photo-1516026672322-bc52d61a55d5?w=400',
    status: 'active',
    createdAt: new Date('2024-02-10'),
    updatedAt: new Date('2025-09-28')
  },
  {
    _id: 'audio4',
    title: 'Collections du Musée des Civilisations',
    description: 'Visite guidée audio des collections permanentes du musée',
    audioUrl: 'https://example.com/audio/musee-collections.mp3',
    duration: 720,
    language: 'fr',
    attractionId: '3',
    thumbnailUrl: 'https://images.unsplash.com/photo-1566127444979-b3d2b64d3b0d?w=400',
    status: 'active',
    createdAt: new Date('2024-01-20'),
    updatedAt: new Date('2025-10-05')
  },
  {
    _id: 'audio5',
    title: 'Museum Collections - English Tour',
    description: 'Audio guided tour of the museum\'s permanent collections',
    audioUrl: 'https://example.com/audio/museum-collections-en.mp3',
    duration: 720,
    language: 'en',
    attractionId: '3',
    thumbnailUrl: 'https://images.unsplash.com/photo-1566127444979-b3d2b64d3b0d?w=400',
    status: 'active',
    createdAt: new Date('2024-01-20'),
    updatedAt: new Date('2025-10-05')
  },
  {
    _id: 'audio6',
    title: 'Promenade dans Grand-Bassam',
    description: 'Circuit historique à travers l\'ancienne capitale coloniale',
    audioUrl: 'https://example.com/audio/bassam-tour.mp3',
    duration: 540,
    language: 'fr',
    attractionId: '4',
    thumbnailUrl: 'https://images.unsplash.com/photo-1559827260-dc66d52bef19?w=400',
    status: 'active',
    createdAt: new Date('2024-03-01'),
    updatedAt: new Date('2025-10-02')
  },
  {
    _id: 'audio7',
    title: 'Saveurs du Marché de Cocody',
    description: 'Découverte culinaire et culturelle du marché traditionnel',
    audioUrl: 'https://example.com/audio/cocody-market.mp3',
    duration: 360,
    language: 'fr',
    attractionId: '5',
    thumbnailUrl: 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=400',
    status: 'active',
    createdAt: new Date('2024-02-15'),
    updatedAt: new Date('2025-09-30')
  },
  {
    _id: 'audio8',
    title: 'Architecture de la Cathédrale Saint-Paul',
    description: 'Analyse architecturale de ce chef-d\'œuvre moderne',
    audioUrl: 'https://example.com/audio/cathedrale-archi.mp3',
    duration: 420,
    language: 'fr',
    attractionId: '6',
    thumbnailUrl: 'https://images.unsplash.com/photo-1583417319070-4a69db38a482?w=400',
    status: 'active',
    createdAt: new Date('2024-01-25'),
    updatedAt: new Date('2025-10-04')
  },
  {
    _id: 'audio9',
    title: 'Safari dans le Parc de la Comoé',
    description: 'Guide audio pour observer la faune du parc',
    audioUrl: 'https://example.com/audio/comoe-safari.mp3',
    duration: 900,
    language: 'fr',
    attractionId: '8',
    thumbnailUrl: 'https://images.unsplash.com/photo-1547471080-7cc2caa01a7e?w=400',
    status: 'active',
    createdAt: new Date('2024-02-20'),
    updatedAt: new Date('2025-09-25')
  }
];

// Fonction utilitaire pour simuler un délai réseau
export const simulateNetworkDelay = (ms: number = 500): Promise<void> => {
  return new Promise(resolve => setTimeout(resolve, ms));
};

// Fonction pour obtenir des attractions par catégorie
export const getAttractionsByCategory = (category: string): BackendAttraction[] => {
  return mockAttractions.filter(attraction => attraction.category === category);
};

// Fonction pour obtenir une attraction par ID
export const getAttractionById = (id: string): BackendAttraction | undefined => {
  return mockAttractions.find(attraction => attraction._id === id);
};

// Fonction pour obtenir les audioguides d'une attraction
export const getAudioGuidesByAttraction = (attractionId: string): BackendAudioGuide[] => {
  return mockAudioGuides.filter(guide => guide.attractionId === attractionId);
};

// Fonction pour rechercher des attractions
export const searchAttractions = (query: string): BackendAttraction[] => {
  const lowercaseQuery = query.toLowerCase();
  return mockAttractions.filter(attraction => 
    attraction.name.toLowerCase().includes(lowercaseQuery) ||
    attraction.description.toLowerCase().includes(lowercaseQuery) ||
    attraction.category.toLowerCase().includes(lowercaseQuery)
  );
};
