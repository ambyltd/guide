# API Documentation - Version Avancée 2.0

## Vue d'ensemble

L'API Audio Guide Côte d'Ivoire v2.0 intègre des fonctionnalités avancées de géolocalisation GPS, d'analytics et de machine learning pour offrir une expérience utilisateur personnalisée et intelligente.

## Nouvelles Fonctionnalités

### 🛰️ GPS et Géolocalisation Avancée
- Détection automatique des guides audio à proximité
- Géofencing intelligent avec triggers adaptatifs
- Optimisation de routes avec algorithmes avancés
- Tracking comportemental en temps réel

### 📊 Analytics et Machine Learning
- Collecte automatique de données utilisateur
- Profils de personnalisation intelligents
- Prédictions comportementales
- Insights en temps réel

### 🎯 Personnalisation
- Recommandations basées sur l'IA
- Adaptation du contenu selon les préférences
- Clustering d'utilisateurs
- Optimisation d'expérience

## Endpoints GPS (`/api/gps`)

### Recherche d'attractions proches
```http
GET /api/gps/nearby-attractions?lat=5.3600&lng=-4.0083&radius=5000
```

**Paramètres :**
- `lat` (required): Latitude de l'utilisateur
- `lng` (required): Longitude de l'utilisateur
- `radius` (optional): Rayon de recherche en mètres (défaut: 5000)
- `category` (optional): Filtrer par catégorie
- `sortBy` (optional): `distance`, `popularity`, `rating`
- `limit` (optional): Nombre de résultats (défaut: 20)

**Réponse :**
```json
{
  "success": true,
  "data": {
    "attractions": [
      {
        "_id": "...",
        "name": "Basilique Notre-Dame de la Paix",
        "gpsData": {
          "distance": 1250,
          "bearing": 45,
          "compassDirection": "NE",
          "estimatedWalkTime": 15,
          "withinGeofence": false
        },
        "analytics": { /* si includeAnalytics=true */ },
        "mlFeatures": { /* si includeML=true */ }
      }
    ],
    "userLocation": { "lat": 5.3600, "lng": -4.0083 },
    "searchRadius": 5000
  }
}
```

### Détection automatique des guides audio
```http
POST /api/gps/detect-audio-guides
Headers: x-session-id: session_123, Authorization: Bearer <token>
```

**Body :**
```json
{
  "latitude": 5.3600,
  "longitude": -4.0083,
  "accuracy": 15
}
```

**Réponse :**
```json
{
  "success": true,
  "data": {
    "detectedGuides": [
      {
        "audioGuide": { /* objet AudioGuide complet */ },
        "distance": 25,
        "triggerType": "optimal",
        "confidence": 0.95,
        "personalizedScore": 0.87,
        "personalizedReason": "Dans votre langue préférée, Correspond à vos centres d'intérêt"
      }
    ],
    "detectionRadius": 100,
    "totalDetected": 1
  }
}
```

### Suivi de trajet utilisateur
```http
POST /api/gps/track-location
Headers: x-session-id: session_123, Authorization: Bearer <token>
```

**Body :**
```json
{
  "latitude": 5.3600,
  "longitude": -4.0083,
  "accuracy": 10,
  "altitude": 150,
  "speed": 1.2,
  "heading": 180,
  "context": "exploring"
}
```

### Optimisation de route
```http
POST /api/gps/optimize-route
Headers: Authorization: Bearer <token>
```

**Body :**
```json
{
  "attractions": ["attraction_id_1", "attraction_id_2", "attraction_id_3"],
  "startLocation": {
    "latitude": 5.3600,
    "longitude": -4.0083
  },
  "constraints": {
    "maxDuration": 240,
    "maxDistance": 10000,
    "preferredCategories": ["museum", "cultural"],
    "avoidCrowds": true,
    "timeOfDay": 14
  }
}
```

### Enregistrement du comportement d'écoute
```http
POST /api/gps/listening-behavior
Headers: Authorization: Bearer <token>
```

**Body :**
```json
{
  "audioGuideId": "guide_123",
  "startTime": "2024-01-15T10:30:00Z",
  "duration": 180,
  "completionPercentage": 85,
  "pauseCount": 2,
  "location": {
    "latitude": 5.3600,
    "longitude": -4.0083,
    "accuracy": 15
  },
  "qualityRating": 4
}
```

## Endpoints Analytics (`/api/analytics`)

### Démarrage de session
```http
POST /api/analytics/session/start
```

**Body :**
```json
{
  "sessionId": "unique_session_id",
  "userId": "user_123",
  "deviceInfo": {
    "platform": "ios",
    "version": "17.1",
    "userAgent": "AudioGuideApp/1.0",
    "language": "fr"
  },
  "startLocation": {
    "latitude": 5.3600,
    "longitude": -4.0083,
    "accuracy": 10
  }
}
```

### Fin de session
```http
POST /api/analytics/session/end
```

### Enregistrement d'interactions
```http
POST /api/analytics/interaction
```

**Body :**
```json
{
  "sessionId": "session_123",
  "type": "play",
  "target": "audio_guide",
  "targetId": "guide_123",
  "context": "attraction_visit",
  "duration": 5000
}
```

### Profil de personnalisation
```http
GET /api/analytics/personalization/:userId
Headers: Authorization: Bearer <token>
```

**Réponse :**
```json
{
  "success": true,
  "data": {
    "profile": {
      "preferences": {
        "categories": {
          "cultural": 0.8,
          "historical": 0.6,
          "nature": 0.4
        },
        "duration": "medium",
        "language": "fr"
      },
      "behaviorScore": {
        "explorer": 0.7,
        "planner": 0.3,
        "social": 0.5
      }
    },
    "personalizationScore": 0.75,
    "predictedPreferences": { /* prédictions IA */ }
  }
}
```

### Dashboard analytics
```http
GET /api/analytics/dashboard
```

## Améliorations des Endpoints Existants

### Attractions avec GPS
```http
GET /api/attractions?lat=5.3600&lng=-4.0083&radius=5000&sortBy=popularity&includeAnalytics=true
```

**Nouvelles options :**
- `sortBy`: `distance`, `rating`, `popularity`, `created`
- `includeAnalytics`: Inclure les données d'analyse
- `includeML`: Inclure les métadonnées ML

### Création d'attraction avec GPS
```http
POST /api/attractions
```

**Nouveau schema :**
```json
{
  "name": "Nouveau Site",
  "location": {
    "type": "Point",
    "coordinates": [-4.0083, 5.3600]
  },
  "gpsMetadata": {
    "accuracy": 5,
    "source": "gps",
    "verified": true
  },
  "geofencing": {
    "radius": 30,
    "entryTrigger": true,
    "dwellTimeTrigger": 20
  },
  "mlFeatures": {
    "crowdLevel": "low",
    "optimalVisitDuration": 45,
    "tags": ["moderne", "architecture"]
  }
}
```

### Analytics des attractions
```http
GET /api/attractions/:id/analytics?timeRange=30d
```

## Middleware et Headers

### Headers requis pour le tracking
- `x-session-id`: ID de session unique
- `x-user-id`: ID utilisateur (optionnel)
- `x-latitude`: Latitude actuelle (optionnel)
- `x-longitude`: Longitude actuelle (optionnel)
- `x-accuracy`: Précision GPS (optionnel)

### Tracking automatique
Le middleware analytics track automatiquement :
- Toutes les interactions API
- Les métriques de performance
- Les erreurs et crashes
- Les points de géolocalisation

## Types de Données Analytics

### UserSession
```typescript
interface IUserSession {
  sessionId: string;
  userId: string;
  startTime: Date;
  endTime?: Date;
  duration?: number;
  deviceInfo: {
    platform: 'ios' | 'android' | 'web';
    version: string;
    userAgent: string;
    language: string;
  };
  locationData: {
    startLocation?: IGeolocation;
    endLocation?: IGeolocation;
    trackingPoints: ILocationTrackingPoint[];
  };
  interactions: IUserInteraction[];
  performance: {
    loadTime: number;
    errorCount: number;
    crashReports: ICrashReport[];
  };
}
```

### ListeningBehavior
```typescript
interface IListeningBehavior {
  audioGuideId: string;
  startTime: Date;
  duration: number;
  completionPercentage: number;
  pauseCount: number;
  location: IGeolocation;
  qualityRating?: number;
}
```

### PersonalizationProfile
```typescript
interface IPersonalizationProfile {
  userId: string;
  preferences: {
    categories: Record<string, number>;
    timeOfDay: Record<string, number>;
    duration: 'short' | 'medium' | 'long';
    language: string;
  };
  behaviorScore: {
    explorer: number;
    planner: number;
    social: number;
  };
  recommendations: {
    nextAttractions: string[];
    personalizedContent: string[];
  };
}
```

## Codes d'Erreur

- `400`: Paramètres invalides (avec détails Joi)
- `401`: Non authentifié
- `403`: Non autorisé
- `404`: Ressource non trouvée
- `429`: Limite de taux atteinte
- `500`: Erreur serveur interne

## Sécurité et Performance

### Rate Limiting
- 100 requêtes par 15 minutes par IP
- Limites spéciales pour les endpoints GPS (plus élevées)

### Optimisations
- Index géospatiaux 2dsphere
- Cache Redis pour les requêtes fréquentes
- Pagination automatique
- Compression des réponses

### Monitoring
- Tracking automatique des performances
- Alertes sur les erreurs critiques
- Métriques en temps réel

## Migration

Pour migrer vers la v2.0 :

```bash
npm run migrate:advanced
```

Cette commande :
1. Ajoute les nouveaux champs aux modèles existants
2. Génère des données analytics simulées
3. Crée les index de performance
4. Calcule les similarités entre attractions

## Exemples d'Usage

### Workflow complet GPS + Analytics

1. **Démarrer une session**
```javascript
const sessionId = generateUniqueId();
await startSession(sessionId, userId, deviceInfo, location);
```

2. **Rechercher des attractions proches**
```javascript
const nearbyAttractions = await findNearbyAttractions(userLocation);
```

3. **Tracker les mouvements**
```javascript
await trackLocation(sessionId, newLocation, 'exploring');
```

4. **Détecter les guides audio**
```javascript
const detectedGuides = await detectAudioGuides(userLocation, sessionId);
```

5. **Enregistrer l'écoute**
```javascript
await recordListening(audioGuideId, listeningData);
```

6. **Terminer la session**
```javascript
await endSession(sessionId, endLocation, performanceMetrics);
```

Cette version avancée transforme l'API en une plateforme intelligente capable de fournir des expériences personnalisées et d'optimiser continuellement les recommandations basées sur les données collectées.