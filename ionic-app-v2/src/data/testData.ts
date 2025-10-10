export interface AttractionTestData {
  id: string;
  name: string;
  description: string;
  latitude: number;
  longitude: number;
  category: string;
  audioUrl: string;
  imageUrl: string;
  duration: number; // en minutes
  featured: boolean;
}

export const attractionsCoteDIvoire: AttractionTestData[] = [
  {
    id: "basilique-yamoussoukro",
    name: "Basilique Notre-Dame de la Paix",
    description: "Plus grande basilique du monde, œuvre architecturale exceptionnelle inaugurée en 1990. Monument emblématique de Yamoussoukro, capitale politique de la Côte d'Ivoire.",
    latitude: 6.8103,
    longitude: -5.2767,
    category: "Monument religieux",
    audioUrl: "/audio/basilique-yamoussoukro.mp3",
    imageUrl: "/images/basilique-yamoussoukro.jpg",
    duration: 8,
    featured: true
  },
  {
    id: "musee-civilisations-abidjan",
    name: "Musée des Civilisations de Côte d'Ivoire",
    description: "Principal musée national présentant l'art et les traditions des différents peuples ivoiriens. Collections exceptionnelles de masques, sculptures et objets traditionnels.",
    latitude: 5.3411,
    longitude: -4.0287,
    category: "Musée",
    audioUrl: "/audio/musee-civilisations.mp3",
    imageUrl: "/images/musee-civilisations.jpg",
    duration: 12,
    featured: true
  },
  {
    id: "grand-bassam-unesco",
    name: "Grand-Bassam - Centre Historique",
    description: "Première capitale coloniale française inscrite au patrimoine mondial UNESCO. Architecture coloniale préservée et plages magnifiques.",
    latitude: 5.2167,
    longitude: -3.7333,
    category: "Site UNESCO",
    audioUrl: "/audio/grand-bassam.mp3",
    imageUrl: "/images/grand-bassam.jpg",
    duration: 15,
    featured: true
  },
  {
    id: "parc-tai",
    name: "Parc National de Taï",
    description: "Dernière grande forêt primaire d'Afrique de l'Ouest, patrimoine mondial UNESCO. Biodiversité exceptionnelle avec chimpanzés, éléphants et hippopotames pygmées.",
    latitude: 5.8500,
    longitude: -7.3500,
    category: "Parc National",
    audioUrl: "/audio/parc-tai.mp3",
    imageUrl: "/images/parc-tai.jpg",
    duration: 10,
    featured: true
  },
  {
    id: "mosquee-kong",
    name: "Mosquée de Kong",
    description: "Mosquée historique du 18ème siècle, témoignage de l'architecture soudano-sahélienne en Côte d'Ivoire. Centre spirituel et culturel majeur du nord du pays.",
    latitude: 9.1500,
    longitude: -4.6167,
    category: "Monument religieux",
    audioUrl: "/audio/mosquee-kong.mp3",
    imageUrl: "/images/mosquee-kong.jpg",
    duration: 6,
    featured: false
  },
  {
    id: "cathedrale-saint-paul",
    name: "Cathédrale Saint-Paul d'Abidjan",
    description: "Architecture moderne exceptionnelle conçue par Aldo Spirito. Forme unique évoquant une pirogue renversée, symbole de la culture maritime ivoirienne.",
    latitude: 5.3197,
    longitude: -4.0058,
    category: "Monument religieux",
    audioUrl: "/audio/cathedrale-saint-paul.mp3",
    imageUrl: "/images/cathedrale-saint-paul.jpg",
    duration: 7,
    featured: false
  },
  {
    id: "marche-treichville",
    name: "Grand Marché de Treichville",
    description: "Plus grand marché d'Abidjan, véritable cœur économique et culturel. Découverte des produits locaux, artisanat et ambiance authentique ivoirienne.",
    latitude: 5.2833,
    longitude: -4.0167,
    category: "Marché traditionnel",
    audioUrl: "/audio/marche-treichville.mp3",
    imageUrl: "/images/marche-treichville.jpg",
    duration: 5,
    featured: false
  },
  {
    id: "parc-banco-abidjan",
    name: "Parc National du Banco",
    description: "Forêt urbaine de 3000 hectares au cœur d'Abidjan. Poumon vert de la capitale économique, refuge pour la faune et sentiers de randonnée.",
    latitude: 5.3833,
    longitude: -4.0667,
    category: "Parc National",
    audioUrl: "/audio/parc-banco.mp3",
    imageUrl: "/images/parc-banco.jpg",
    duration: 8,
    featured: false
  },
  {
    id: "assinie-plages",
    name: "Assinie - Plages Paradisiaques",
    description: "Station balnéaire prestigieuse aux plages de sable blanc. Lagunes, cocotiers et complexes hôteliers de luxe face à l'océan Atlantique.",
    latitude: 5.1667,
    longitude: -3.3000,
    category: "Station balnéaire",
    audioUrl: "/audio/assinie-plages.mp3",
    imageUrl: "/images/assinie-plages.jpg",
    duration: 6,
    featured: false
  },
  {
    id: "man-mont-tonkpi",
    name: "Mont Tonkpi - Man",
    description: "Point culminant de la région Ouest, sommet à 1200m d'altitude. Paysages montagneux exceptionnels et vue panoramique sur les forêts et plantations.",
    latitude: 7.4000,
    longitude: -7.5500,
    category: "Site naturel",
    audioUrl: "/audio/mont-tonkpi.mp3",
    imageUrl: "/images/mont-tonkpi.jpg",
    duration: 9,
    featured: false
  },
  {
    id: "korhogo-artisanat",
    name: "Korhogo - Quartier des Artisans",
    description: "Centre de l'artisanat traditionnel Sénoufo. Sculpture sur bois, tissage traditionnel et forges ancestrales dans l'authenticité du Nord ivoirien.",
    latitude: 9.4500,
    longitude: -5.6167,
    category: "Artisanat traditionnel",
    audioUrl: "/audio/korhogo-artisanat.mp3",
    imageUrl: "/images/korhogo-artisanat.jpg",
    duration: 7,
    featured: false
  },
  {
    id: "bouake-mosquee",
    name: "Grande Mosquée de Bouaké",
    description: "Mosquée centrale de la deuxième ville du pays. Architecture contemporaine élégante et lieu spirituel majeur du centre de la Côte d'Ivoire.",
    latitude: 7.6833,
    longitude: -5.0333,
    category: "Monument religieux",
    audioUrl: "/audio/bouake-mosquee.mp3",
    imageUrl: "/images/bouake-mosquee.jpg",
    duration: 5,
    featured: false
  },
  {
    id: "sassandra-plage",
    name: "Sassandra - Port Colonial",
    description: "Port historique sur la côte ouest, architecture coloniale préservée. Plages sauvages et histoire maritime de la traite et du commerce colonial.",
    latitude: 4.9500,
    longitude: -6.0833,
    category: "Port historique",
    audioUrl: "/audio/sassandra-port.mp3",
    imageUrl: "/images/sassandra-port.jpg",
    duration: 8,
    featured: false
  },
  {
    id: "daloa-marche",
    name: "Marché Central de Daloa",
    description: "Marché régional du Centre-Ouest, carrefour commercial entre le nord et le sud. Produits agricoles, cacao et rencontres interculturelles.",
    latitude: 6.8833,
    longitude: -6.4500,
    category: "Marché traditionnel",
    audioUrl: "/audio/daloa-marche.mp3",
    imageUrl: "/images/daloa-marche.jpg",
    duration: 6,
    featured: false
  },
  {
    id: "abengourou-palais",
    name: "Palais Royal d'Abengourou",
    description: "Siège traditionnel du royaume Agni, témoin des monarchies ancestrales ivoiriennes. Architecture traditionnelle et musée des regalia royaux.",
    latitude: 6.7333,
    longitude: -3.4833,
    category: "Patrimoine royal",
    audioUrl: "/audio/abengourou-palais.mp3",
    imageUrl: "/images/abengourou-palais.jpg",
    duration: 7,
    featured: false
  }
];

export const audioGuidesCoteDIvoire = [
  {
    id: "guide-patrimoine-unesco",
    title: "Patrimoine UNESCO de Côte d'Ivoire",
    description: "Découverte des sites classés UNESCO : Grand-Bassam, Parc de Taï et forêts sacrées",
    attractions: ["grand-bassam-unesco", "parc-tai"],
    duration: 25,
    category: "Patrimoine mondial"
  },
  {
    id: "guide-abidjan-moderne",
    title: "Abidjan, la Perle des Lagunes",
    description: "Visite de la capitale économique : architecture moderne, marchés et culture urbaine",
    attractions: ["musee-civilisations-abidjan", "cathedrale-saint-paul", "marche-treichville", "parc-banco-abidjan"],
    duration: 32,
    category: "Ville moderne"
  },
  {
    id: "guide-spirituel",
    title: "Lieux Spirituels et Religieux",
    description: "Parcours des monuments religieux emblématiques du pays",
    attractions: ["basilique-yamoussoukro", "mosquee-kong", "cathedrale-saint-paul", "bouake-mosquee"],
    duration: 26,
    category: "Spiritualité"
  },
  {
    id: "guide-nature-ecotourisme",
    title: "Nature et Écotourisme",
    description: "Exploration des parcs nationaux et sites naturels exceptionnels",
    attractions: ["parc-tai", "parc-banco-abidjan", "man-mont-tonkpi"],
    duration: 27,
    category: "Nature"
  },
  {
    id: "guide-culture-traditions",
    title: "Culture et Traditions Ancestrales",
    description: "Immersion dans l'artisanat traditionnel et les royaumes historiques",
    attractions: ["korhogo-artisanat", "abengourou-palais", "daloa-marche"],
    duration: 20,
    category: "Culture traditionnelle"
  },
  {
    id: "guide-littoral-atlantique",
    title: "Littoral Atlantique",
    description: "Découverte des plages, ports et stations balnéaires de la côte ivoirienne",
    attractions: ["assinie-plages", "sassandra-plage", "grand-bassam-unesco"],
    duration: 29,
    category: "Littoral"
  }
];

// Configuration pour tests de géolocalisation
export const testLocations = {
  // Points de test proches des attractions pour simuler le déclenchement audio
  basilique: {
    // Position à 15m de la basilique pour test de déclenchement
    latitude: 6.8102,
    longitude: -5.2768,
    name: "Test Basilique - Déclenchement Audio"
  },
  museeAbidjan: {
    // Position à 18m du musée
    latitude: 6.3410,
    longitude: -4.0288,
    name: "Test Musée - Déclenchement Audio"
  },
  grandBassam: {
    // Position dans le centre historique
    latitude: 5.2168,
    longitude: -3.7334,
    name: "Test Grand-Bassam - Déclenchement Audio"
  }
};

// Simulation de données audio (pour tests sans serveur)
export const audioTestData = {
  "basilique-yamoussoukro": {
    title: "Basilique Notre-Dame de la Paix",
    narrator: "Marie-Claire Kouassi",
    duration: 480, // 8 minutes en secondes
    fileSize: "7.2 MB",
    language: "fr",
    content: "Bienvenue à la Basilique Notre-Dame de la Paix, joyau architectural de Yamoussoukro..."
  },
  "musee-civilisations": {
    title: "Musée des Civilisations",
    narrator: "Professeur Konan Yao",
    duration: 720, // 12 minutes
    fileSize: "10.8 MB",
    language: "fr",
    content: "Découvrez les trésors culturels de la Côte d'Ivoire dans ce voyage à travers les civilisations..."
  }
  // ... autres guides audio
};