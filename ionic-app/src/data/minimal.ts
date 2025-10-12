// Données de test pour l'application Audio Guide Côte d'Ivoire
// Design minimaliste et luxueux

export interface AttractionMinimal {
  id: string;
  name: string;
  description: string;
  image: string;
  category: 'musee' | 'transport' | 'pied';
  city: string;
  rating: number;
  duration: string;
  price: number;
  position: {
    lat: number;
    lng: number;
  };
  audioGuideUrl?: string;
  tags: string[];
  isPremium: boolean;
}

export interface CityMinimal {
  id: string;
  name: string;
  country: string;
  attractionsCount: number;
}

export interface ReservationMinimal {
  id: string;
  attractionId: string;
  attractionName: string;
  date: string;
  status: 'confirmed' | 'pending' | 'cancelled';
  location: string;
  participants: number;
  duration: string;
  guideName: string;
  guidePhoto: string;
  guideLanguages: string;
  totalPrice: number;
}

// Villes disponibles
export const cities: CityMinimal[] = [
  { id: '1', name: 'Abidjan', country: 'Côte d\'Ivoire', attractionsCount: 15 },
  { id: '2', name: 'Yamoussoukro', country: 'Côte d\'Ivoire', attractionsCount: 8 },
  { id: '3', name: 'Bouaké', country: 'Côte d\'Ivoire', attractionsCount: 5 },
  { id: '4', name: 'San-Pédro', country: 'Côte d\'Ivoire', attractionsCount: 4 },
  { id: '5', name: 'Korhogo', country: 'Côte d\'Ivoire', attractionsCount: 6 },
  { id: '6', name: 'Daloa', country: 'Côte d\'Ivoire', attractionsCount: 3 },
  { id: '7', name: 'Man', country: 'Côte d\'Ivoire', attractionsCount: 4 },
  { id: '8', name: 'Grand-Bassam', country: 'Côte d\'Ivoire', attractionsCount: 7 },
];

// Attractions test par catégorie
export const attractions: AttractionMinimal[] = [
  // MUSÉES
  {
    id: 'm1',
    name: 'Musée National de Côte d\'Ivoire',
    description: 'Découvrez l\'histoire fascinante de la Côte d\'Ivoire à travers ses collections d\'art traditionnel.',
    image: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=500',
    category: 'musee',
    city: 'Abidjan',
    rating: 4.8,
    duration: '2h 30min',
    price: 15,
    position: { lat: 5.316667, lng: -4.033333 },
    tags: ['Histoire', 'Culture', 'Art'],
    isPremium: true
  },
  {
    id: 'm2',
    name: 'Musée des Civilisations',
    description: 'Explorez les différentes civilisations qui ont façonné la Côte d\'Ivoire moderne.',
    image: 'https://images.unsplash.com/photo-1566127321048-0e5ac1cade22?w=500',
    category: 'musee',
    city: 'Abidjan',
    rating: 4.6,
    duration: '1h 45min',
    price: 12,
    position: { lat: 5.325000, lng: -4.025000 },
    tags: ['Civilisation', 'Patrimoine'],
    isPremium: false
  },
  {
    id: 'm3',
    name: 'Centre Culturel Français',
    description: 'Un lieu de rencontre entre les cultures française et ivoirienne.',
    image: 'https://images.unsplash.com/photo-1577083300278-98aeafc8c652?w=500',
    category: 'musee',
    city: 'Abidjan',
    rating: 4.4,
    duration: '1h 30min',
    price: 8,
    position: { lat: 5.320000, lng: -4.028000 },
    tags: ['Culture', 'Art contemporain'],
    isPremium: false
  },
  {
    id: 'm4',
    name: 'Palais de la Culture',
    description: 'Le cœur culturel d\'Abidjan avec ses expositions permanentes et temporaires.',
    image: 'https://images.unsplash.com/photo-1571115764595-644a1f56a55c?w=500',
    category: 'musee',
    city: 'Abidjan',
    rating: 4.7,
    duration: '2h 15min',
    price: 10,
    position: { lat: 5.330000, lng: -4.020000 },
    tags: ['Palais', 'Expositions'],
    isPremium: true
  },
  {
    id: 'm5',
    name: 'Musée du Costume',
    description: 'Découvrez les costumes traditionnels des différentes ethnies de Côte d\'Ivoire.',
    image: 'https://images.unsplash.com/photo-1544735716-392fe2489ffa?w=500',
    category: 'musee',
    city: 'Abidjan',
    rating: 4.3,
    duration: '1h 20min',
    price: 7,
    position: { lat: 5.310000, lng: -4.035000 },
    tags: ['Costumes', 'Traditions'],
    isPremium: false
  },

  // ATTRACTIONS EN TRANSPORT
  {
    id: 't1',
    name: 'Circuit des Quartiers Historiques',
    description: 'Parcourez Abidjan en transport et découvrez ses quartiers emblématiques.',
    image: 'https://images.unsplash.com/photo-1449824913935-59a10b8d2000?w=500',
    category: 'transport',
    city: 'Abidjan',
    rating: 4.9,
    duration: '3h 30min',
    price: 25,
    position: { lat: 5.316667, lng: -4.033333 },
    tags: ['Circuit', 'Quartiers', 'Histoire'],
    isPremium: true
  },
  {
    id: 't2',
    name: 'Tour du Plateau',
    description: 'Découvrez le cœur économique d\'Abidjan depuis votre véhicule.',
    image: 'https://images.unsplash.com/photo-1486299267070-83823f5448dd?w=500',
    category: 'transport',
    city: 'Abidjan',
    rating: 4.5,
    duration: '2h 00min',
    price: 18,
    position: { lat: 5.325000, lng: -4.025000 },
    tags: ['Plateau', 'Business', 'Architecture'],
    isPremium: false
  },
  {
    id: 't3',
    name: 'Lagune Ébrié en Bateau',
    description: 'Naviguez sur la lagune et découvrez Abidjan depuis l\'eau.',
    image: 'https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=500',
    category: 'transport',
    city: 'Abidjan',
    rating: 4.8,
    duration: '2h 45min',
    price: 30,
    position: { lat: 5.300000, lng: -4.000000 },
    tags: ['Lagune', 'Bateau', 'Nature'],
    isPremium: true
  },
  {
    id: 't4',
    name: 'Circuit des Marchés',
    description: 'Visitez les marchés colorés d\'Abidjan en transport climatisé.',
    image: 'https://images.unsplash.com/photo-1555529669-e69e7aa0ba9a?w=500',
    category: 'transport',
    city: 'Abidjan',
    rating: 4.4,
    duration: '2h 30min',
    price: 20,
    position: { lat: 5.340000, lng: -4.040000 },
    tags: ['Marchés', 'Commerce', 'Local'],
    isPremium: false
  },
  {
    id: 't5',
    name: 'Pont HKB et Banlieues',
    description: 'Traversez le célèbre pont et explorez les banlieues d\'Abidjan.',
    image: 'https://images.unsplash.com/photo-1477959858617-67f85cf4f1df?w=500',
    category: 'transport',
    city: 'Abidjan',
    rating: 4.2,
    duration: '1h 45min',
    price: 15,
    position: { lat: 5.350000, lng: -4.050000 },
    tags: ['Pont', 'Architecture', 'Vue'],
    isPremium: false
  },

  // ATTRACTIONS À PIED
  {
    id: 'p1',
    name: 'Balade au Marché de Cocody',
    description: 'Promenade guidée dans l\'un des marchés les plus authentiques d\'Abidjan.',
    image: 'https://images.unsplash.com/photo-1559113202-9c8e65ff0d0b?w=500',
    category: 'pied',
    city: 'Abidjan',
    rating: 4.7,
    duration: '1h 30min',
    price: 12,
    position: { lat: 5.360000, lng: -4.015000 },
    tags: ['Marché', 'Gastronomie', 'Local'],
    isPremium: true
  },
  {
    id: 'p2',
    name: 'Jardin Botanique de Bingerville',
    description: 'Explorez à pied la flore tropicale de la Côte d\'Ivoire.',
    image: 'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=500',
    category: 'pied',
    city: 'Abidjan',
    rating: 4.6,
    duration: '2h 15min',
    price: 8,
    position: { lat: 5.400000, lng: -3.950000 },
    tags: ['Nature', 'Botanique', 'Détente'],
    isPremium: false
  },
  {
    id: 'p3',
    name: 'Art de Rue de Yopougon',
    description: 'Découvrez les fresques et l\'art urbain du quartier populaire.',
    image: 'https://images.unsplash.com/photo-1541961017774-22349e4a1262?w=500',
    category: 'pied',
    city: 'Abidjan',
    rating: 4.5,
    duration: '1h 45min',
    price: 10,
    position: { lat: 5.380000, lng: -4.080000 },
    tags: ['Art urbain', 'Culture', 'Quartier'],
    isPremium: false
  },
  {
    id: 'p4',
    name: 'Cathédrale Saint-Paul',
    description: 'Visite architecturale de cette merveille moderne de Côte d\'Ivoire.',
    image: 'https://images.unsplash.com/photo-1520637836862-4d197d17c825?w=500',
    category: 'pied',
    city: 'Abidjan',
    rating: 4.9,
    duration: '1h 00min',
    price: 5,
    position: { lat: 5.345000, lng: -4.045000 },
    tags: ['Architecture', 'Religion', 'Moderne'],
    isPremium: true
  },
  {
    id: 'p5',
    name: 'Promenade de la Corniche',
    description: 'Balade le long de la corniche avec vue sur la lagune.',
    image: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=500',
    category: 'pied',
    city: 'Abidjan',
    rating: 4.8,
    duration: '1h 15min',
    price: 0,
    position: { lat: 5.300000, lng: -4.010000 },
    tags: ['Corniche', 'Vue', 'Gratuit'],
    isPremium: false
  }
];

// Réservations test
export const reservationsData: ReservationMinimal[] = [
  {
    id: 'r1',
    attractionId: 'm1',
    attractionName: 'Musée National de Côte d\'Ivoire',
    date: '2024-12-25T10:00:00Z',
    status: 'confirmed',
    location: 'Plateau, Abidjan',
    participants: 2,
    duration: '2h 30min',
    guideName: 'Kouadio Adjé',
    guidePhoto: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150',
    guideLanguages: 'Français, Anglais',
    totalPrice: 30
  },
  {
    id: 'r2',
    attractionId: 't1',
    attractionName: 'Circuit des Quartiers Historiques',
    date: '2024-12-22T14:00:00Z',
    status: 'confirmed',
    location: 'Gare de Treichville, Abidjan',
    participants: 4,
    duration: '3h 30min',
    guideName: 'Aminata Traoré',
    guidePhoto: 'https://images.unsplash.com/photo-1494790108755-2616b612b5bb?w=150',
    guideLanguages: 'Français, Dioula',
    totalPrice: 100
  },
  {
    id: 'r3',
    attractionId: 'p1',
    attractionName: 'Balade au Marché de Cocody',
    date: '2024-12-28T09:00:00Z',
    status: 'pending',
    location: 'Marché de Cocody, Abidjan',
    participants: 1,
    duration: '1h 45min',
    guideName: 'Yao Kouakou',
    guidePhoto: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150',
    guideLanguages: 'Français',
    totalPrice: 15
  },
  {
    id: 'r4',
    attractionId: 'm2',
    attractionName: 'Centre Culturel Français',
    date: '2024-11-15T16:00:00Z',
    status: 'confirmed',
    location: 'Cocody, Abidjan',
    participants: 3,
    duration: '2h 00min',
    guideName: 'Marie Dupont',
    guidePhoto: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150',
    guideLanguages: 'Français, Anglais',
    totalPrice: 45
  },
  {
    id: 'r5',
    attractionId: 't3',
    attractionName: 'Lagune Ébrié en Bateau',
    date: '2025-01-05T15:30:00Z',
    status: 'confirmed',
    location: 'Port de plaisance, Abidjan',
    participants: 2,
    duration: '2h 45min',
    guideName: 'Konan Michel',
    guidePhoto: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150',
    guideLanguages: 'Français, Anglais',
    totalPrice: 60
  },
  {
    id: 'r6',
    attractionId: 'p2',
    attractionName: 'Quartier Treichville',
    date: '2024-10-20T11:00:00Z',
    status: 'confirmed',
    location: 'Station de métro Treichville',
    participants: 1,
    duration: '2h 00min',
    guideName: 'Fatou Keita',
    guidePhoto: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150',
    guideLanguages: 'Français, Baoulé',
    totalPrice: 25
  }
];

// Catégories d'attractions
export const categoriesData = [
  {
    id: 'musees',
    name: 'Musées & Culture',
    icon: 'library-outline',
    description: 'Explorez l\'art et l\'histoire',
    count: attractions.filter((a: AttractionMinimal) => a.category === 'musee').length
  },
  {
    id: 'transport',
    name: 'En Transport',
    icon: 'car-outline',
    description: 'Circuits en véhicule',
    count: attractions.filter((a: AttractionMinimal) => a.category === 'transport').length
  },
  {
    id: 'pied',
    name: 'À Pied',
    icon: 'walk-outline',
    description: 'Promenades guidées',
    count: attractions.filter((a: AttractionMinimal) => a.category === 'pied').length
  }
];

// Aliases pour compatibilité
export const attractionsData = attractions;
export const citiesData = cities;