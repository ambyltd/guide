import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import rateLimit from 'express-rate-limit';
import mongoose from 'mongoose';
import dotenv from 'dotenv';

// Models (important to import them to register with Mongoose)
import './models/Attraction';
import './models/AudioGuide';
import './models/Tour';
import './models/User';
import './models/Review';
import './models/UserSession';
import './models/ListeningBehavior';
import './models/PersonalizationProfile';
import './models/Favorite';
import './models/UserStats';
import './models/FeatureFlag'; // Sprint 5 - Feature Flags

// Routes
import attractionRoutes from './routes/attractions';
import audioGuideRoutes from './routes/audioGuides';
import tourRoutes from './routes/tours';
import userRoutes from './routes/users';
import authRoutes from './routes/auth';
import generalRoutes from './routes/general';
import reviewRoutes from './routes/reviews';
import gpsRoutes from './routes/gps';
import analyticsRoutes from './routes/analytics';
import favoriteRoutes from './routes/favorites';
import userStatsRoutes from './routes/userStats';
import adminRoutes from './routes/admin'; // Sprint 5 - Admin Routes
import featuresRoutes from './routes/features'; // Sprint 5 - Public Features Routes

// Middleware
import { firebaseAuthMiddleware } from './middleware/authMiddleware';
import { 
  analyticsTrackingMiddleware,
  errorTrackingMiddleware,
  performanceTrackingMiddleware,
  geoLocationMiddleware
} from './middleware/analyticsMiddleware';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100 // limit each IP to 100 requests per windowMs
});

// Middleware
app.use(helmet() as any);
app.use(compression() as any);
app.use(limiter as any);
app.use(cors({
  origin: [
    'http://localhost:3000',
    'http://localhost:5173', // Vite dev server
    'http://localhost:8100', // Ionic dev server
    'https://cotedivoire-audioguide.netlify.app',
    'https://audio-guide-cms.netlify.app', // CMS Production (à ajuster après déploiement)
    'exp://localhost:19000', // Expo development
    'capacitor://localhost', // Capacitor iOS
    'ionic://localhost', // Capacitor iOS alternative
    'https://localhost', // Capacitor Android
    'http://localhost', // Capacitor Android alternative
    /^https:\/\/.*\.netlify\.app$/, // Toutes les previews Netlify
    /^http:\/\/192\.168\.\d+\.\d+:\d+$/ // Réseau local (device testing)
  ],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
}));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Analytics middleware (doit être appliqué tôt)
app.use(performanceTrackingMiddleware);
app.use(geoLocationMiddleware);
app.use(analyticsTrackingMiddleware);

// Health check endpoint (public)
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    message: 'API Côte d\'Ivoire Audio Guide en fonctionnement',
    timestamp: new Date().toISOString(),
    version: '1.0.0'
  });
});

// Simple logging middleware
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
  next();
});

// Middleware d'authentification Firebase
// Appliqué sélectivement selon les routes
app.use('/api', (req, res, next) => {
  // Routes publiques (pas d'authentification requise)
  const publicRoutes = [
    '/health',
    '/attractions',
    '/tours', 
    '/audio-guides',
    '/gps/nearby-attractions',
    '/gps/insights',
    '/analytics/dashboard',
    '/features',       // Sprint 5 - Public feature flags (mobile app)
    '/reviews',        // Pour les tests (à sécuriser en production)
    '/users'           // Pour les tests (à sécuriser en production)
  ];
  
  // Routes publiques : GET seulement pour attractions/tours/audio-guides
  // Routes reviews/users : accès complet pour les tests
  const isPublicRoute = publicRoutes.some(route => req.path.startsWith(route));
  const isGetRequest = req.method === 'GET';
  const isTestRoute = ['/reviews', '/users'].some(route => req.path.startsWith(route));
  
  // Skip auth pour :
  // - /health
  // - GET sur les routes publiques (attractions, tours, etc.)
  // - Toutes les méthodes sur les routes de test (reviews, users)
  // ⚠️ /favorites nécessite maintenant l'authentification !
  if (req.path === '/health' || (isPublicRoute && isGetRequest) || isTestRoute) {
    return next();
  }
  
  // Appliquer l'authentification pour toutes les autres routes
  firebaseAuthMiddleware(req, res, next);
});

// Routes
app.get('/', (req, res) => {
  res.json({ 
    message: 'API Audio Guide Côte d\'Ivoire - Version Avancée',
    version: '2.0.0',
    features: [
      'GPS et géolocalisation avancée',
      'Analytics et machine learning',
      'Personnalisation intelligente',
      'Géofencing automatique',
      'Optimisation de routes'
    ],
    endpoints: {
      attractions: '/api/attractions',
      audioGuides: '/api/audio-guides',
      tours: '/api/tours',
      users: '/api/users',
      auth: '/api/auth',
      reviews: '/api/reviews',
      gps: '/api/gps',
      analytics: '/api/analytics',
      admin: '/api/admin', // Sprint 5
      features: '/api/features' // Sprint 5 - Public
    }
  });
});

app.use('/api/attractions', attractionRoutes);
app.use('/api/audio-guides', audioGuideRoutes);
app.use('/api/tours', tourRoutes);
app.use('/api/users', userStatsRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/reviews', reviewRoutes);
app.use('/api/favorites', favoriteRoutes);
app.use('/api/gps', gpsRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/admin', adminRoutes); // Sprint 5 - Admin routes (auth required)
app.use('/api/features', featuresRoutes); // Sprint 5 - Public features routes
app.use('/api', generalRoutes);

// Error handling middleware
app.use(errorTrackingMiddleware);
app.use((error: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error('Erreur serveur:', error);
  res.status(error.statusCode || 500).json({
    success: false,
    message: error.message || 'Erreur interne du serveur'
  });
});

// MongoDB connection with retry logic
const connectDB = async () => {
  try {
    const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/cotedivoire-audioguide';
    console.log('🔄 Tentative de connexion à MongoDB...');
    console.log('📍 URI:', mongoUri.replace(/\/\/([^:]+):([^@]+)@/, '//$1:****@')); // Masquer le mot de passe
    
    await mongoose.connect(mongoUri, {
      serverSelectionTimeoutMS: 30000,
      socketTimeoutMS: 45000,
      maxPoolSize: 10,
      minPoolSize: 2
    });
    
    console.log('✅ Connecté à MongoDB Atlas');
    console.log('📊 Database:', mongoose.connection.name);
    console.log('🌐 Host:', mongoose.connection.host);
  } catch (error: any) {
    console.error('❌ Erreur de connexion MongoDB:', error.message);
    console.error('💡 Vérifiez:');
    console.error('   - Que votre IP est dans la whitelist MongoDB Atlas');
    console.error('   - Que les credentials sont corrects dans .env');
    console.error('   - Que le cluster MongoDB Atlas est actif');
    
    // Retry après 10 secondes
    console.log('🔄 Nouvelle tentative dans 10 secondes...');
    setTimeout(connectDB, 10000);
  }
};

// Démarrer la connexion MongoDB
connectDB();

// Handler pour les erreurs non gérées
process.on('unhandledRejection', (reason, promise) => {
  console.error('❌ Unhandled Rejection at:', promise, 'reason:', reason);
  // Ne pas quitter le processus, juste logger
});

process.on('uncaughtException', (error) => {
  console.error('❌ Uncaught Exception:', error);
  // Ne pas quitter le processus, juste logger
});

// Démarrer le serveur même si MongoDB n'est pas encore connecté
const server = app.listen(PORT, () => {
  console.log(`🚀 Serveur démarré sur le port ${PORT}`);
  console.log(`📡 API disponible sur http://localhost:${PORT}`);
  console.log(`🏥 Health check: http://localhost:${PORT}/api/health`);
  console.log(`\n💡 Pour tester: curl http://localhost:${PORT}/api/health`);
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('👋 SIGTERM reçu, fermeture gracieuse...');
  server.close(() => {
    mongoose.connection.close().then(() => {
      console.log('✅ Connexions fermées proprement');
      process.exit(0);
    });
  });
});

export default app;
