export interface Attraction {
  id: string;
  name: string;
  city: string;
  category: string;
  description: string;
  image: string;
  rating: number;
  latitude: number;
  longitude: number;
  isPopular?: boolean;
}

export const attractions: Attraction[] = [
  // Abidjan - Attractions principales
  {
    id: '1',
    name: 'Cathédrale Saint-Paul',
    city: 'Abidjan',
    category: 'Religion',
    description: 'Magnifique cathédrale moderne avec architecture unique',
    image: 'https://images.unsplash.com/photo-1520637836862-4d197d17c90a?w=400',
    rating: 4.8,
    latitude: 5.3364,
    longitude: -4.0266,
    isPopular: true
  },
  {
    id: '2',
    name: 'Marché de Treichville',
    city: 'Abidjan',
    category: 'Shopping',
    description: 'Marché traditionnel authentique avec produits locaux',
    image: 'https://images.unsplash.com/photo-1555529902-7f5b1c0a7e8a?w=400',
    rating: 4.5,
    latitude: 5.2767,
    longitude: -4.0050
  },
  {
    id: '3',
    name: 'Plateau District',
    city: 'Abidjan',
    category: 'Quartier',
    description: 'Centre d\'affaires moderne avec gratte-ciels',
    image: 'https://images.unsplash.com/photo-1486325212027-8081e485255e?w=400',
    rating: 4.6,
    latitude: 5.3197,
    longitude: -4.0267,
    isPopular: true
  },
  {
    id: '4',
    name: 'Cocody Université',
    city: 'Abidjan',
    category: 'Éducation',
    description: 'Campus universitaire prestigieux dans un quartier verdoyant',
    image: 'https://images.unsplash.com/photo-1562774053-701939374585?w=400',
    rating: 4.4,
    latitude: 5.3553,
    longitude: -3.9781
  },
  {
    id: '5',
    name: 'Banco National Park',
    city: 'Abidjan',
    category: 'Nature',
    description: 'Forêt urbaine préservée au cœur d\'Abidjan',
    image: 'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=400',
    rating: 4.7,
    latitude: 5.3892,
    longitude: -4.0651,
    isPopular: true
  },
  {
    id: '6',
    name: 'Lagune Ébrié',
    city: 'Abidjan',
    category: 'Nature',
    description: 'Magnifique lagune offrant des vues panoramiques',
    image: 'https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=400',
    rating: 4.9,
    latitude: 5.2845,
    longitude: -4.0183
  },
  
  // Yamoussoukro - Capitale politique
  {
    id: '7',
    name: 'Basilique Notre-Dame de la Paix',
    city: 'Yamoussoukro',
    category: 'Religion',
    description: 'Plus grande basilique au monde, architecture impressionnante',
    image: 'https://images.unsplash.com/photo-1520637836862-4d197d17c90a?w=400',
    rating: 4.9,
    latitude: 6.8167,
    longitude: -5.2833,
    isPopular: true
  },
  {
    id: '8',
    name: 'Palais Présidentiel',
    city: 'Yamoussoukro',
    category: 'Politique',
    description: 'Résidence officielle du Président de la République',
    image: 'https://images.unsplash.com/photo-1555881400-74d7acaacd8b?w=400',
    rating: 4.3,
    latitude: 6.8205,
    longitude: -5.2769
  },
  {
    id: '9',
    name: 'Lac aux Caïmans',
    city: 'Yamoussoukro',
    category: 'Nature',
    description: 'Lac artificiel abritant des crocodiles sacrés',
    image: 'https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=400',
    rating: 4.6,
    latitude: 6.8156,
    longitude: -5.2897
  },

  // Bouaké - Centre du pays
  {
    id: '10',
    name: 'Grand Marché de Bouaké',
    city: 'Bouaké',
    category: 'Shopping',
    description: 'Marché central animé avec artisanat local',
    image: 'https://images.unsplash.com/photo-1555529902-7f5b1c0a7e8a?w=400',
    rating: 4.2,
    latitude: 7.6944,
    longitude: -5.0300
  },
  {
    id: '11',
    name: 'Mosquée de Bouaké',
    city: 'Bouaké',
    category: 'Religion',
    description: 'Belle mosquée représentative de l\'architecture locale',
    image: 'https://images.unsplash.com/photo-1564769625905-50e93615e769?w=400',
    rating: 4.4,
    latitude: 7.6889,
    longitude: -5.0333
  },

  // San-Pédro - Ville portuaire
  {
    id: '12',
    name: 'Port de San-Pédro',
    city: 'San-Pédro',
    category: 'Industrie',
    description: 'Important port commercial sur la côte atlantique',
    image: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=400',
    rating: 4.1,
    latitude: 4.7467,
    longitude: -6.6369
  },
  {
    id: '13',
    name: 'Plage de San-Pédro',
    city: 'San-Pédro',
    category: 'Nature',
    description: 'Belle plage de sable fin sur la côte ouest',
    image: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=400',
    rating: 4.8,
    latitude: 4.7333,
    longitude: -6.6456,
    isPopular: true
  }
];

export const cities = [
  { name: 'Abidjan', latitude: 5.3364, longitude: -4.0266 },
  { name: 'Yamoussoukro', latitude: 6.8167, longitude: -5.2833 },
  { name: 'Bouaké', latitude: 7.6944, longitude: -5.0300 },
  { name: 'San-Pédro', latitude: 4.7467, longitude: -6.6369 }
];

export const categories = [
  'Toutes',
  'Religion',
  'Nature',
  'Shopping',
  'Quartier',
  'Éducation',
  'Politique',
  'Industrie'
];

export function getAttractionsByCity(cityName: string): Attraction[] {
  return attractions.filter(attraction => attraction.city === cityName);
}

export function getAttractionsByCategory(category: string, cityName?: string): Attraction[] {
  let filtered = attractions;
  
  if (cityName) {
    filtered = filtered.filter(attraction => attraction.city === cityName);
  }
  
  if (category !== 'Toutes') {
    filtered = filtered.filter(attraction => attraction.category === category);
  }
  
  return filtered;
}