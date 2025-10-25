"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const helmet_1 = __importDefault(require("helmet"));
const compression_1 = __importDefault(require("compression"));
const express_rate_limit_1 = __importDefault(require("express-rate-limit"));
const mongoose_1 = __importDefault(require("mongoose"));
const dotenv_1 = __importDefault(require("dotenv"));
// Models (important to import them to register with Mongoose)
require("./models/Attraction");
require("./models/AudioGuide");
require("./models/Tour");
require("./models/User");
require("./models/Review");
require("./models/UserSession");
require("./models/ListeningBehavior");
require("./models/PersonalizationProfile");
require("./models/Favorite");
require("./models/UserStats");
require("./models/FeatureFlag"); // Sprint 5 - Feature Flags
// Routes
const attractions_1 = __importDefault(require("./routes/attractions"));
const audioGuides_1 = __importDefault(require("./routes/audioGuides"));
const tours_1 = __importDefault(require("./routes/tours"));
const auth_1 = __importDefault(require("./routes/auth"));
const general_1 = __importDefault(require("./routes/general"));
const reviews_1 = __importDefault(require("./routes/reviews"));
const gps_1 = __importDefault(require("./routes/gps"));
const analytics_1 = __importDefault(require("./routes/analytics"));
const favorites_1 = __importDefault(require("./routes/favorites"));
const userStats_1 = __importDefault(require("./routes/userStats"));
const admin_1 = __importDefault(require("./routes/admin")); // Sprint 5 - Admin Routes
const features_1 = __importDefault(require("./routes/features")); // Sprint 5 - Public Features Routes
// Middleware
const authMiddleware_1 = require("./middleware/authMiddleware");
const analyticsMiddleware_1 = require("./middleware/analyticsMiddleware");
dotenv_1.default.config();
const app = (0, express_1.default)();
const PORT = process.env.PORT || 5000;
// Rate limiting
const limiter = (0, express_rate_limit_1.default)({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100 // limit each IP to 100 requests per windowMs
});
// Middleware
app.use((0, helmet_1.default)());
app.use((0, compression_1.default)());
app.use(limiter);
app.use((0, cors_1.default)({
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
app.use(express_1.default.json({ limit: '10mb' }));
app.use(express_1.default.urlencoded({ extended: true, limit: '10mb' }));
// Analytics middleware (doit être appliqué tôt)
app.use(analyticsMiddleware_1.performanceTrackingMiddleware);
app.use(analyticsMiddleware_1.geoLocationMiddleware);
app.use(analyticsMiddleware_1.analyticsTrackingMiddleware);
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
        '/features', // Sprint 5 - Public feature flags (mobile app)
        '/reviews', // Pour les tests (à sécuriser en production)
        '/users' // Pour les tests (à sécuriser en production)
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
    (0, authMiddleware_1.firebaseAuthMiddleware)(req, res, next);
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
app.use('/api/attractions', attractions_1.default);
app.use('/api/audio-guides', audioGuides_1.default);
app.use('/api/tours', tours_1.default);
app.use('/api/users', userStats_1.default);
app.use('/api/auth', auth_1.default);
app.use('/api/reviews', reviews_1.default);
app.use('/api/favorites', favorites_1.default);
app.use('/api/gps', gps_1.default);
app.use('/api/analytics', analytics_1.default);
app.use('/api/admin', admin_1.default); // Sprint 5 - Admin routes (auth required)
app.use('/api/features', features_1.default); // Sprint 5 - Public features routes
app.use('/api', general_1.default);
// Error handling middleware
app.use(analyticsMiddleware_1.errorTrackingMiddleware);
app.use((error, req, res, next) => {
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
        await mongoose_1.default.connect(mongoUri, {
            serverSelectionTimeoutMS: 30000,
            socketTimeoutMS: 45000,
            maxPoolSize: 10,
            minPoolSize: 2
        });
        console.log('✅ Connecté à MongoDB Atlas');
        console.log('📊 Database:', mongoose_1.default.connection.name);
        console.log('🌐 Host:', mongoose_1.default.connection.host);
    }
    catch (error) {
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
        mongoose_1.default.connection.close().then(() => {
            console.log('✅ Connexions fermées proprement');
            process.exit(0);
        });
    });
});
exports.default = app;
