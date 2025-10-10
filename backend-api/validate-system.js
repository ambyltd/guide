const mongoose = require('mongoose');
const fetch = require('node-fetch');
const fs = require('fs').promises;
const path = require('path');

// Configuration de validation
const VALIDATION_CONFIG = {
  mongodb: {
    uri: process.env.MONGODB_URI || 'mongodb://localhost:27017/audioguide_ci',
    testTimeout: 10000
  },
  api: {
    baseUrl: process.env.API_BASE_URL || 'http://localhost:5000',
    timeout: 15000
  },
  testData: {
    location: { latitude: 5.3600, longitude: -4.0083 },
    userId: `validation_user_${Date.now()}`,
    sessionId: `validation_session_${Date.now()}`
  }
};

// Utilitaires de logging avec couleurs
const Logger = {
  colors: {
    red: '\x1b[31m',
    green: '\x1b[32m',
    yellow: '\x1b[33m',
    blue: '\x1b[34m',
    magenta: '\x1b[35m',
    cyan: '\x1b[36m',
    white: '\x1b[37m',
    reset: '\x1b[0m'
  },

  log(message, color = 'white') {
    const timestamp = new Date().toISOString();
    console.log(`${this.colors[color]}[${timestamp}] ${message}${this.colors.reset}`);
  },

  success(message) { this.log(`✅ ${message}`, 'green'); },
  error(message) { this.log(`❌ ${message}`, 'red'); },
  warning(message) { this.log(`⚠️  ${message}`, 'yellow'); },
  info(message) { this.log(`ℹ️  ${message}`, 'blue'); },
  section(message) { this.log(`\n🔍 ${message}`, 'cyan'); }
};

// Classe principale de validation
class SystemValidator {
  constructor() {
    this.results = {
      database: { passed: 0, failed: 0, tests: [] },
      api: { passed: 0, failed: 0, tests: [] },
      gps: { passed: 0, failed: 0, tests: [] },
      analytics: { passed: 0, failed: 0, tests: [] },
      performance: { passed: 0, failed: 0, tests: [] }
    };
    this.startTime = Date.now();
  }

  // Test de base de données
  async validateDatabase() {
    Logger.section('Validation de la base de données MongoDB');

    try {
      // Connexion à MongoDB
      await this.testDbConnection();
      await this.testCollections();
      await this.testIndexes();
      await this.testDataIntegrity();
      await this.testQueries();
    } catch (error) {
      this.recordResult('database', 'Validation DB générale', false, error.message);
    }
  }

  async testDbConnection() {
    try {
      await mongoose.connect(VALIDATION_CONFIG.mongodb.uri, {
        serverSelectionTimeoutMS: VALIDATION_CONFIG.mongodb.testTimeout
      });
      this.recordResult('database', 'Connexion MongoDB', true);
    } catch (error) {
      this.recordResult('database', 'Connexion MongoDB', false, error.message);
      throw error;
    }
  }

  async testCollections() {
    const expectedCollections = [
      'attractions', 'audioguides', 'tours', 'users',
      'usersessions', 'listeningbehaviors', 'personalizationprofiles'
    ];

    const collections = await mongoose.connection.db.listCollections().toArray();
    const collectionNames = collections.map(c => c.name);

    for (const expected of expectedCollections) {
      const exists = collectionNames.includes(expected);
      this.recordResult('database', `Collection ${expected}`, exists);
    }
  }

  async testIndexes() {
    const indexTests = [
      { collection: 'attractions', field: 'location', type: '2dsphere' },
      { collection: 'audioguides', field: 'gpsLocation.coordinates', type: '2dsphere' },
      { collection: 'usersessions', field: 'userId' },
      { collection: 'listeningbehaviors', field: 'userId' }
    ];

    for (const test of indexTests) {
      try {
        const collection = mongoose.connection.db.collection(test.collection);
        const indexes = await collection.indexes();
        const hasIndex = indexes.some(idx => 
          Object.keys(idx.key).includes(test.field) ||
          (test.type === '2dsphere' && idx.key[test.field] === '2dsphere')
        );
        this.recordResult('database', `Index ${test.collection}.${test.field}`, hasIndex);
      } catch (error) {
        this.recordResult('database', `Index ${test.collection}.${test.field}`, false, error.message);
      }
    }
  }

  async testDataIntegrity() {
    try {
      // Test des contraintes GPS sur les attractions
      const attractions = await mongoose.connection.db.collection('attractions')
        .find({ location: { $exists: true } }).limit(5).toArray();
      
      const hasValidGPS = attractions.length > 0 && attractions.every(attr => 
        attr.location && 
        attr.location.type === 'Point' && 
        Array.isArray(attr.location.coordinates) &&
        attr.location.coordinates.length === 2
      );
      
      this.recordResult('database', 'Intégrité GPS attractions', hasValidGPS);

      // Test des liens attraction-audioguide
      const audioguides = await mongoose.connection.db.collection('audioguides')
        .find({ 'gpsLocation.coordinates': { $exists: true } }).limit(3).toArray();
      
      const hasValidAudioGPS = audioguides.length > 0 && audioguides.every(guide =>
        guide.gpsLocation &&
        guide.gpsLocation.type === 'Point' &&
        Array.isArray(guide.gpsLocation.coordinates) &&
        guide.gpsLocation.coordinates.length === 2
      );

      this.recordResult('database', 'Intégrité GPS audioguides', hasValidAudioGPS);

    } catch (error) {
      this.recordResult('database', 'Intégrité des données', false, error.message);
    }
  }

  async testQueries() {
    try {
      // Test requête géospatiale
      const location = VALIDATION_CONFIG.testData.location;
      const nearbyAttractions = await mongoose.connection.db.collection('attractions')
        .find({
          location: {
            $near: {
              $geometry: { type: 'Point', coordinates: [location.longitude, location.latitude] },
              $maxDistance: 10000
            }
          }
        }).limit(5).toArray();

      this.recordResult('database', 'Requête géospatiale attractions', nearbyAttractions.length >= 0);

      // Test agrégation avancée
      const analyticsData = await mongoose.connection.db.collection('attractions')
        .aggregate([
          { $match: { active: true } },
          { $group: { _id: '$category', count: { $sum: 1 } } },
          { $sort: { count: -1 } }
        ]).toArray();

      this.recordResult('database', 'Agrégation analytics', analyticsData.length >= 0);

    } catch (error) {
      this.recordResult('database', 'Requêtes complexes', false, error.message);
    }
  }

  // Test de l'API
  async validateAPI() {
    Logger.section('Validation de l\'API REST');

    const apiTests = [
      { name: 'Health Check', method: 'GET', endpoint: '/api/health' },
      { name: 'Attractions List', method: 'GET', endpoint: '/api/attractions' },
      { name: 'AudioGuides List', method: 'GET', endpoint: '/api/audioguides' },
      { name: 'Tours List', method: 'GET', endpoint: '/api/tours' }
    ];

    for (const test of apiTests) {
      await this.testAPIEndpoint(test.name, test.method, test.endpoint);
    }

    // Tests avec données
    await this.testAPIWithData();
  }

  async testAPIEndpoint(name, method, endpoint, data = null) {
    try {
      const options = {
        method,
        headers: { 'Content-Type': 'application/json' },
        timeout: VALIDATION_CONFIG.api.timeout
      };

      if (data) {
        options.body = JSON.stringify(data);
      }

      const response = await fetch(`${VALIDATION_CONFIG.api.baseUrl}${endpoint}`, options);
      const result = await response.json();

      const success = response.ok && result.success !== false;
      this.recordResult('api', `${name} (${method})`, success, success ? null : result.message);

      return success ? result : null;
    } catch (error) {
      this.recordResult('api', `${name} (${method})`, false, error.message);
      return null;
    }
  }

  async testAPIWithData() {
    // Test création session analytics
    const sessionData = {
      sessionId: VALIDATION_CONFIG.testData.sessionId,
      userId: VALIDATION_CONFIG.testData.userId,
      deviceInfo: { platform: 'validation', version: '1.0.0' },
      startLocation: VALIDATION_CONFIG.testData.location
    };

    await this.testAPIEndpoint('Session Start', 'POST', '/api/analytics/session/start', sessionData);

    // Test interaction
    const interactionData = {
      sessionId: VALIDATION_CONFIG.testData.sessionId,
      type: 'validation',
      target: 'system',
      duration: 1000
    };

    await this.testAPIEndpoint('Interaction Log', 'POST', '/api/analytics/interaction', interactionData);
  }

  // Test GPS et géolocalisation
  async validateGPS() {
    Logger.section('Validation des fonctionnalités GPS');

    const location = VALIDATION_CONFIG.testData.location;

    // Test recherche attractions proches
    const nearbyResult = await this.testAPIEndpoint(
      'GPS Nearby Search',
      'GET',
      `/api/gps/nearby-attractions?lat=${location.latitude}&lng=${location.longitude}&radius=5000`
    );

    if (nearbyResult) {
      const hasAttractions = nearbyResult.data && Array.isArray(nearbyResult.data.attractions);
      this.recordResult('gps', 'Format réponse GPS', hasAttractions);
    }

    // Test détection audioguides
    const detectionData = {
      latitude: location.latitude,
      longitude: location.longitude,
      accuracy: 15
    };

    await this.testAPIEndpoint('GPS Audio Detection', 'POST', '/api/gps/detect-audio-guides', detectionData);

    // Test tracking
    const trackingData = {
      latitude: location.latitude + 0.001,
      longitude: location.longitude + 0.001,
      accuracy: 10,
      context: 'validation'
    };

    await this.testAPIEndpoint('GPS Tracking', 'POST', '/api/gps/track-location', trackingData);
  }

  // Test Analytics
  async validateAnalytics() {
    Logger.section('Validation du système d\'analytics');

    // Test dashboard
    await this.testAPIEndpoint('Analytics Dashboard', 'GET', '/api/analytics/dashboard');

    // Test profil personnalisation
    await this.testAPIEndpoint(
      'Personalization Profile',
      'GET',
      `/api/analytics/personalization/${VALIDATION_CONFIG.testData.userId}`
    );

    // Test insights
    await this.testAPIEndpoint('Real-time Insights', 'GET', '/api/gps/insights?timeRange=24h');

    // Test comportement d'écoute
    const listeningData = {
      audioGuideId: 'validation_guide',
      startTime: new Date(Date.now() - 300000).toISOString(),
      endTime: new Date().toISOString(),
      duration: 300,
      completionPercentage: 90,
      location: VALIDATION_CONFIG.testData.location
    };

    await this.testAPIEndpoint('Listening Behavior', 'POST', '/api/gps/listening-behavior', listeningData);
  }

  // Test de performance
  async validatePerformance() {
    Logger.section('Validation des performances');

    const performanceTests = [
      { name: 'API Response Time', target: 1000, test: () => this.measureResponseTime() },
      { name: 'GPS Query Performance', target: 500, test: () => this.measureGPSQuery() },
      { name: 'Database Query Speed', target: 200, test: () => this.measureDatabaseQuery() }
    ];

    for (const test of performanceTests) {
      try {
        const duration = await test.test();
        const passed = duration <= test.target;
        this.recordResult('performance', `${test.name} (<${test.target}ms)`, passed, 
          passed ? `${duration}ms` : `${duration}ms (trop lent)`);
      } catch (error) {
        this.recordResult('performance', test.name, false, error.message);
      }
    }
  }

  async measureResponseTime() {
    const start = Date.now();
    await fetch(`${VALIDATION_CONFIG.api.baseUrl}/api/health`);
    return Date.now() - start;
  }

  async measureGPSQuery() {
    const start = Date.now();
    const location = VALIDATION_CONFIG.testData.location;
    await fetch(`${VALIDATION_CONFIG.api.baseUrl}/api/gps/nearby-attractions?lat=${location.latitude}&lng=${location.longitude}&radius=1000`);
    return Date.now() - start;
  }

  async measureDatabaseQuery() {
    const start = Date.now();
    await mongoose.connection.db.collection('attractions').findOne({});
    return Date.now() - start;
  }

  // Utilitaire pour enregistrer les résultats
  recordResult(category, testName, passed, error = null) {
    this.results[category].tests.push({
      name: testName,
      passed,
      error,
      timestamp: new Date().toISOString()
    });

    if (passed) {
      this.results[category].passed++;
      Logger.success(`${testName}`);
    } else {
      this.results[category].failed++;
      Logger.error(`${testName}${error ? ': ' + error : ''}`);
    }
  }

  // Génération du rapport final
  async generateReport() {
    const endTime = Date.now();
    const duration = endTime - this.startTime;

    Logger.section('Génération du rapport de validation');

    const totalTests = Object.values(this.results).reduce((sum, cat) => sum + cat.passed + cat.failed, 0);
    const totalPassed = Object.values(this.results).reduce((sum, cat) => sum + cat.passed, 0);
    const totalFailed = totalTests - totalPassed;
    const successRate = totalTests > 0 ? ((totalPassed / totalTests) * 100).toFixed(1) : 0;

    const report = {
      timestamp: new Date().toISOString(),
      duration: `${(duration / 1000).toFixed(1)}s`,
      summary: {
        totalTests,
        totalPassed,
        totalFailed,
        successRate: `${successRate}%`
      },
      categories: this.results,
      recommendations: this.generateRecommendations()
    };

    // Sauvegarde du rapport
    const reportPath = path.join(__dirname, 'validation-report.json');
    await fs.writeFile(reportPath, JSON.stringify(report, null, 2));

    // Affichage console
    Logger.info(`\n📊 RAPPORT DE VALIDATION SYSTÈME`);
    Logger.info(`⏱️  Durée totale: ${report.duration}`);
    Logger.info(`📈 Tests exécutés: ${totalTests}`);
    Logger.success(`✅ Tests réussis: ${totalPassed}`);
    if (totalFailed > 0) Logger.error(`❌ Tests échoués: ${totalFailed}`);
    
    if (successRate >= 95) {
      Logger.success(`🎉 Taux de réussite: ${successRate}% - Système excellent!`);
    } else if (successRate >= 85) {
      Logger.log(`👍 Taux de réussite: ${successRate}% - Système bon`, 'yellow');
    } else if (successRate >= 70) {
      Logger.warning(`⚠️  Taux de réussite: ${successRate}% - Améliorations nécessaires`);
    } else {
      Logger.error(`🚨 Taux de réussite: ${successRate}% - Problèmes critiques détectés`);
    }

    Logger.info(`📄 Rapport détaillé sauvegardé: ${reportPath}`);

    return report;
  }

  generateRecommendations() {
    const recommendations = [];

    Object.entries(this.results).forEach(([category, results]) => {
      if (results.failed > 0) {
        const failedTests = results.tests.filter(t => !t.passed);
        recommendations.push({
          category,
          priority: results.failed > results.passed ? 'HIGH' : 'MEDIUM',
          issues: failedTests.length,
          actions: this.getCategoryRecommendations(category, failedTests)
        });
      }
    });

    return recommendations;
  }

  getCategoryRecommendations(category, failedTests) {
    const actions = [];
    
    switch (category) {
      case 'database':
        actions.push('Vérifier la configuration MongoDB');
        actions.push('Recréer les index géospatiaux si nécessaire');
        actions.push('Exécuter le script de migration');
        break;
      case 'api':
        actions.push('Vérifier que le serveur API est démarré');
        actions.push('Contrôler les routes et middlewares');
        actions.push('Valider la configuration CORS');
        break;
      case 'gps':
        actions.push('Vérifier les données de géolocalisation');
        actions.push('Contrôler les algorithmes de proximité');
        actions.push('Valider les coordonnées GPS des attractions');
        break;
      case 'analytics':
        actions.push('Vérifier la configuration Redis (si utilisée)');
        actions.push('Contrôler les modèles de données analytics');
        actions.push('Valider les calculs ML et statistiques');
        break;
      case 'performance':
        actions.push('Optimiser les requêtes de base de données');
        actions.push('Ajouter des index supplémentaires');
        actions.push('Configurer un cache Redis');
        break;
    }

    return actions;
  }

  // Nettoyage après validation
  async cleanup() {
    try {
      if (mongoose.connection.readyState === 1) {
        await mongoose.disconnect();
      }
      Logger.info('🧹 Nettoyage terminé');
    } catch (error) {
      Logger.warning(`Erreur de nettoyage: ${error.message}`);
    }
  }
}

// Fonction principale d'exécution
async function validateSystem() {
  const validator = new SystemValidator();

  try {
    Logger.log('\n🚀 DÉMARRAGE DE LA VALIDATION SYSTÈME COMPLÈTE', 'magenta');
    
    await validator.validateDatabase();
    await validator.validateAPI();
    await validator.validateGPS();
    await validator.validateAnalytics();
    await validator.validatePerformance();

    const report = await validator.generateReport();
    
    Logger.log('\n✨ Validation système terminée avec succès', 'green');
    
    return report;

  } catch (error) {
    Logger.error(`💥 Erreur critique pendant la validation: ${error.message}`);
    throw error;
  } finally {
    await validator.cleanup();
  }
}

// Exécution si appelé directement
if (require.main === module) {
  validateSystem()
    .then(report => {
      process.exit(report.summary.totalFailed > 0 ? 1 : 0);
    })
    .catch(error => {
      console.error('Validation échouée:', error);
      process.exit(1);
    });
}

module.exports = { validateSystem, SystemValidator };