# Configuration API Production - Backend Render.com

**Date** : 13 octobre 2025  
**Backend URL** : `https://audio-guide-w8ww.onrender.com`  
**Status** : ✅ Déployé et opérationnel

---

## 📋 Configuration Complète

### 🌐 **Backend API (Render.com)**

- **URL principale** : `https://audio-guide-w8ww.onrender.com`
- **API Base** : `https://audio-guide-w8ww.onrender.com/api`
- **Health Check** : `https://audio-guide-w8ww.onrender.com/api/health`
- **Database** : MongoDB Atlas (`ambyl.nlafa4d.mongodb.net`)
- **Hébergement** : Render.com (Free Tier)
- **Build** : Node.js 18, auto-deploy sur push GitHub

---

## 📱 **Mobile App (ionic-app-v2)**

### Fichier : `ionic-app-v2/src/config/apiConfig.ts`

```typescript
// Configuration production (Backend Render.com)
const PRODUCTION_API_URL = 'https://audio-guide-w8ww.onrender.com';

/**
 * Retourne l'URL de base de l'API selon l'environnement
 * CONFIGURATION : Toujours utiliser l'API production (Render.com)
 */
export function getApiBaseUrl(): string {
  // Toujours utiliser l'URL de production pour tous les environnements
  // Backend déployé sur Render.com : https://audio-guide-w8ww.onrender.com
  return PRODUCTION_API_URL;
}
```

### Environnements

| Environnement | URL API | Status |
|---------------|---------|--------|
| **Dev Web** (`npm run dev`) | `https://audio-guide-w8ww.onrender.com` | ✅ |
| **Production Web** (`npm run build`) | `https://audio-guide-w8ww.onrender.com` | ✅ |
| **Android Dev** | `https://audio-guide-w8ww.onrender.com` | ✅ |
| **Android Production** | `https://audio-guide-w8ww.onrender.com` | ✅ |

---

## 🖥️ **CMS Web (cms-web)**

### Fichier : `cms-web/src/services/api.ts`

```typescript
const API_BASE_URL = process.env.REACT_APP_API_URL || 'https://audio-guide-w8ww.onrender.com/api';
```

### Environnements

**Development** (`.env.development`) :
```bash
REACT_APP_API_URL=https://audio-guide-w8ww.onrender.com/api
```

**Production** (`.env.production`) :
```bash
REACT_APP_API_URL=https://audio-guide-w8ww.onrender.com/api
```

| Environnement | URL API | Status |
|---------------|---------|--------|
| **Dev Local** (`npm start`) | `https://audio-guide-w8ww.onrender.com/api` | ✅ |
| **Production** (Netlify) | `https://audio-guide-w8ww.onrender.com/api` | ⏳ À déployer |

---

## 🔧 **Endpoints API Disponibles**

### Public (sans authentification)

```bash
GET  /api/health                  # Health check
GET  /api/features                # Feature flags actifs
GET  /api/features/:key           # Feature flag par clé
GET  /api/attractions             # Liste des attractions
GET  /api/attractions/:id         # Détail attraction
GET  /api/audioguides             # Liste des audioguides
GET  /api/audioguides/:id         # Détail audioguide
GET  /api/tours                   # Liste des circuits
GET  /api/tours/:id               # Détail circuit
```

### Authentifié (Firebase Token requis)

```bash
# Favoris
GET    /api/favorites?userId=xxx
POST   /api/favorites
DELETE /api/favorites/:id

# Reviews
POST   /api/reviews
GET    /api/reviews?attractionId=xxx
PATCH  /api/reviews/:id/helpful
PATCH  /api/reviews/:id/report
PATCH  /api/reviews/:id/moderate

# User Stats
GET    /api/users/:userId/stats
PATCH  /api/users/:userId/stats
POST   /api/users/:userId/badges
GET    /api/users/leaderboard
```

### Admin (Firebase Admin Token requis)

```bash
# Feature Flags Management
GET    /api/admin/features
POST   /api/admin/features
PATCH  /api/admin/features/:id/toggle
DELETE /api/admin/features/:id

# Analytics
GET    /api/admin/stats
GET    /api/admin/config
PATCH  /api/admin/config
```

---

## ✅ **Tests de Connexion**

### Test Health Check

```bash
curl https://audio-guide-w8ww.onrender.com/api/health
```

**Réponse attendue** :
```json
{
  "status": "healthy",
  "mongodb": "connected",
  "timestamp": "2025-10-13T..."
}
```

### Test Features Endpoint

```bash
curl https://audio-guide-w8ww.onrender.com/api/features
```

**Réponse attendue** :
```json
[
  {
    "key": "social_sharing",
    "name": "Partage Social",
    "enabled": true,
    ...
  },
  ...
]
```

### Test Attractions Endpoint

```bash
curl https://audio-guide-w8ww.onrender.com/api/attractions
```

**Réponse attendue** :
```json
{
  "attractions": [
    {
      "_id": "...",
      "name": "Basilique Notre-Dame de la Paix",
      "description": "...",
      "location": {...},
      ...
    },
    ...
  ],
  "total": 15,
  "page": 1,
  "limit": 20
}
```

---

## 🚀 **Prochaines Étapes**

### 1. Déployer le CMS sur Netlify ⏳

1. Aller sur https://app.netlify.com
2. **New site from Git** → Connecter GitHub → Sélectionner `ambyltd/guide`
3. Configuration :
   - **Base directory** : `cms-web`
   - **Build command** : `npm run build`
   - **Publish directory** : `build`
   - **Environment variable** :
     - `REACT_APP_API_URL=https://audio-guide-w8ww.onrender.com/api`
4. Deploy site (3-5 min)

### 2. Mettre à jour CORS Backend

Une fois le CMS déployé, ajouter l'URL Netlify dans `backend-api/src/index.ts` :

```typescript
origin: [
  'http://localhost:3000',
  'http://localhost:5173',
  'http://localhost:8100',
  'https://your-cms-url.netlify.app', // ← Ajouter l'URL réelle
  'https://audio-guide-cms.netlify.app',
  /^https:\/\/.*\.netlify\.app$/,
  /^http:\/\/192\.168\.\d+\.\d+:\d+$/
]
```

Puis commit + push → Render auto-déploie.

### 3. Tester l'Intégration Complète

- **CMS** : Login → Toggle feature flag → Vérifier dans MongoDB
- **Mobile** : Refresh → Voir le changement de feature flag
- **Backend** : Logs Render pour tracer les requêtes

---

## 📊 **Architecture Déployée**

```
┌─────────────────────────────────────────────────────────────┐
│                    USERS (Europe)                           │
└─────────────────────────────────────────────────────────────┘
                │                    │
                │                    │
        ┌───────▼──────┐     ┌───────▼──────┐
        │   Mobile App │     │   CMS Web    │
        │   (Ionic)    │     │   (React)    │
        │ localhost OR │     │ localhost OR │
        │   Android    │     │   Netlify    │
        └───────┬──────┘     └───────┬──────┘
                │                    │
                └──────────┬─────────┘
                           │
                    ┌──────▼──────────┐
                    │  Backend API    │
                    │  (Node.js)      │
                    │  Render.com     │
                    │ audio-guide-w8ww│
                    └──────┬──────────┘
                           │
                    ┌──────▼──────────┐
                    │  MongoDB Atlas  │
                    │  Database       │
                    │  ambyl.nlafa4d  │
                    └─────────────────┘
```

---

## 📝 **Notes Importantes**

### ⚠️ Backend Local Désactivé

La configuration pour backend local (`http://localhost:5000`) est **commentée** dans le code. Pour la réactiver :

**Mobile** (`ionic-app-v2/src/config/apiConfig.ts`) :
```typescript
// Décommenter cette section :
/* Configuration avancée (désactivée - à réactiver si backend local nécessaire) :
  
  // Développement web (localhost) : utiliser localhost
  return 'http://localhost:5000';
*/
```

**CMS** (`cms-web/.env.development`) :
```bash
# Changer de :
REACT_APP_API_URL=https://audio-guide-w8ww.onrender.com/api

# À :
REACT_APP_API_URL=http://localhost:5000/api
```

### 🔄 Auto-Deploy Render

Le backend Render.com est configuré pour auto-deploy lors d'un push sur la branche `main` :

1. Push vers GitHub (`git push origin main`)
2. Render détecte le changement
3. Build automatique (1-2 min)
4. Deploy automatique
5. Application redémarrée avec nouvelle version

### 💾 Données de Production

- **15 attractions** seeded (Basilique, Mosquée Kong, Parc Banco, etc.)
- **10 audioguides** (FR + EN) avec gpsLocation
- **2 circuits touristiques** (historic, cultural)
- **10 feature flags** (7 activés, 3 désactivés)

---

## 🎯 **Récapitulatif Final**

| Composant | Status | URL | Déployé |
|-----------|--------|-----|---------|
| **Backend API** | ✅ Production | https://audio-guide-w8ww.onrender.com | Render.com |
| **Mobile App** | ✅ Dev Ready | http://localhost:5173 | Local |
| **Mobile App** | ✅ Build Ready | - | À tester Android |
| **CMS Web** | ✅ Dev Ready | http://localhost:3000 | Local |
| **CMS Web** | ⏳ À déployer | - | Netlify (pending) |
| **Database** | ✅ Production | ambyl.nlafa4d.mongodb.net | MongoDB Atlas |
| **GitHub Repo** | ✅ Synchronisé | https://github.com/ambyltd/guide | GitHub |

---

**Configuration vérifiée et validée** ✅  
**Date** : 13 octobre 2025  
**Backend** : `https://audio-guide-w8ww.onrender.com`
