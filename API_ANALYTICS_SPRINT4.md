# 📊 API Documentation - Sprint 4 Analytics Endpoints

**Date**: 12 octobre 2025  
**Version**: 1.0  
**Base URL**: `http://localhost:5000/api`

---

## 🎯 Nouveaux Endpoints

### 1. Tracker une action utilisateur

**POST** `/api/analytics/track`

Enregistre une action utilisateur dans ActivityLog et met à jour UserActivity quotidien.

**Body** :
```json
{
  "userId": "user-123",
  "action": "visit" | "listen" | "review" | "share" | "favorite" | "tour_start" | "tour_complete",
  "attractionId": "attraction-1" (optionnel),
  "audioGuideId": "audio-1" (optionnel),
  "tourId": "tour-1" (optionnel),
  "metadata": {
    "duration": 120,
    "platform": "whatsapp",
    "rating": 5
  }
}
```

**Response** :
```json
{
  "success": true,
  "data": {
    "activityLog": {
      "id": "67890...",
      "action": "visit",
      "timestamp": "2025-10-12T10:30:00.000Z"
    }
  }
}
```

**Comportement** :
- Crée un `ActivityLog` avec l'action
- Met à jour ou crée un `UserActivity` pour aujourd'hui
- Incrémente les compteurs selon l'action :
  - `visit` → `attractionsVisited++`
  - `listen` → `audioGuidesListened++`, `totalListeningTime += metadata.duration`
  - `review` → `reviewCount++`
  - `share` → `shareCount++`
  - `favorite` → `favoriteCount++`

---

### 2. Récupérer les tendances d'un utilisateur

**GET** `/api/analytics/users/:userId/trends?timeframe=7d|30d`

Récupère l'activité quotidienne agrégée sur 7 ou 30 jours.

**Query Parameters** :
- `timeframe` : `'7d'` (défaut) ou `'30d'`

**Response** :
```json
{
  "success": true,
  "data": {
    "timeframe": "7d",
    "period": "7 jours",
    "trends": [
      {
        "date": "2025-10-05",
        "attractionsVisited": 2,
        "audioGuidesListened": 5,
        "reviewCount": 1,
        "totalListeningTime": 480,
        "shareCount": 3,
        "favoriteCount": 2
      },
      {
        "date": "2025-10-06",
        "attractionsVisited": 1,
        "audioGuidesListened": 3,
        "reviewCount": 0,
        "totalListeningTime": 240,
        "shareCount": 1,
        "favoriteCount": 1
      }
    ],
    "totals": {
      "attractionsVisited": 10,
      "audioGuidesListened": 25,
      "reviewCount": 3,
      "totalListeningTime": 1800,
      "shareCount": 8,
      "favoriteCount": 5
    }
  }
}
```

**Usage** :
- Alimenter les graphiques LineChart et BarChart dans StatsPage
- Afficher l'évolution temporelle de l'activité

---

### 3. Comparer avec les pairs

**GET** `/api/analytics/users/:userId/compare`

Compare les stats d'un utilisateur avec la moyenne de tous les utilisateurs.

**Response** :
```json
{
  "success": true,
  "data": {
    "user": {
      "userId": "user-123",
      "userName": "Jean Dupont",
      "stats": {
        "attractionsVisited": 15,
        "audioGuidesListened": 45,
        "toursCompleted": 3,
        "totalListeningTime": 3600,
        "favoriteCount": 12,
        "reviewCount": 8,
        "shareCount": 10
      }
    },
    "peers": {
      "average": {
        "attractionsVisited": 8,
        "audioGuidesListened": 20,
        "toursCompleted": 1,
        "totalListeningTime": 1500,
        "favoriteCount": 5,
        "reviewCount": 3,
        "shareCount": 4
      },
      "rank": 3,
      "percentile": 92,
      "totalUsers": 50
    }
  }
}
```

**Calculs** :
- `rank` : Position de l'utilisateur (trié par `attractionsVisited`)
- `percentile` : `((totalUsers - rank) / totalUsers) * 100`
- `average` : Moyenne de chaque métrique sur tous les utilisateurs

**Usage** :
- Afficher le rang et percentile dans StatsPage (tab Comparaison)
- BarChart comparant user vs moyenne

---

### 4. Dashboard analytics (Admin)

**GET** `/api/analytics/dashboard`

Récupère les analytics globales pour l'interface admin.

**Response** :
```json
{
  "success": true,
  "data": {
    "overview": {
      "totalUsers": 150,
      "totalAttractions": 25,
      "totalActivities": 5432,
      "period": "7 derniers jours"
    },
    "topAttractions": [
      {
        "_id": "attraction-1",
        "name": "Basilique Notre-Dame de la Paix",
        "visitCount": 523,
        "rating": 4.8
      },
      {
        "_id": "attraction-2",
        "name": "Musée des Civilisations",
        "visitCount": 412,
        "rating": 4.6
      }
    ],
    "topUsers": [
      {
        "_id": "user-1",
        "userId": "user-123",
        "userName": "Jean Dupont",
        "attractionsVisited": 18,
        "audioGuidesListened": 54,
        "reviewCount": 12
      }
    ],
    "activityByType": [
      {
        "_id": "visit",
        "count": 1234
      },
      {
        "_id": "listen",
        "count": 2345
      },
      {
        "_id": "share",
        "count": 456
      }
    ],
    "recentActivities": [
      {
        "_id": "log-1",
        "userId": "user-123",
        "action": "visit",
        "attractionId": "attraction-1",
        "timestamp": "2025-10-12T10:45:00.000Z"
      }
    ]
  }
}
```

**Usage** :
- Dashboard admin pour monitoring
- Identifier les attractions populaires
- Voir les utilisateurs les plus actifs
- Analyser les types d'actions (7 derniers jours)

---

### 5. Classement des utilisateurs (Leaderboard)

**GET** `/api/users/leaderboard?sortBy=attractionsVisited&limit=20&timeframe=7d|30d|all`

Récupère le classement des utilisateurs trié par une métrique.

**Query Parameters** :
- `sortBy` : `'attractionsVisited'` (défaut), `'audioGuidesListened'`, `'toursCompleted'`, `'totalListeningTime'`, `'favoriteCount'`, `'reviewCount'`, `'shareCount'`
- `limit` : Nombre de résultats (défaut: `20`)
- `timeframe` : `'7d'`, `'30d'`, `'all'` (défaut: `'all'`)

**Response** :
```json
{
  "success": true,
  "count": 10,
  "sortBy": "attractionsVisited",
  "timeframe": "7d",
  "data": [
    {
      "_id": "user-1",
      "userId": "user-123",
      "userName": "Jean Dupont",
      "attractionsVisited": 18,
      "audioGuidesListened": 54,
      "toursCompleted": 3,
      "totalListeningTime": 3600,
      "favoriteCount": 12,
      "reviewCount": 8,
      "shareCount": 10,
      "badges": ["explorer", "audiophile"],
      "lastActivityAt": "2025-10-12T10:30:00.000Z"
    },
    {
      "_id": "user-2",
      "userId": "user-456",
      "userName": "Marie Martin",
      "attractionsVisited": 15,
      "audioGuidesListened": 42,
      "toursCompleted": 2,
      "totalListeningTime": 2800,
      "favoriteCount": 9,
      "reviewCount": 5,
      "shareCount": 7,
      "badges": ["explorer"],
      "lastActivityAt": "2025-10-11T14:20:00.000Z"
    }
  ]
}
```

**Filtres temporels** :
- `timeframe=7d` : Utilisateurs avec `lastActivityAt >= (aujourd'hui - 7 jours)`
- `timeframe=30d` : Utilisateurs avec `lastActivityAt >= (aujourd'hui - 30 jours)`
- `timeframe=all` ou omis : Tous les utilisateurs

**Usage** :
- LeaderboardPage avec filtres période et métrique
- Afficher le classement avec rang, nom, stats

---

## 🗄️ Modèles de Données

### UserActivity

```typescript
{
  userId: string;
  date: Date; // Date de l'activité (YYYY-MM-DD 00:00:00)
  attractionsVisited: number;
  audioGuidesListened: number;
  reviewCount: number;
  totalListeningTime: number; // en secondes
  shareCount: number;
  favoriteCount: number;
  createdAt: Date;
  updatedAt: Date;
}
```

**Indexes** :
- `{ userId: 1, date: -1 }` (composé)
- `{ date: -1 }`

**Usage** : Agrégation quotidienne pour tendances (LineChart, BarChart)

---

### ActivityLog

```typescript
{
  userId: string;
  action: 'visit' | 'listen' | 'review' | 'share' | 'favorite' | 'tour_start' | 'tour_complete';
  attractionId?: string;
  audioGuideId?: string;
  tourId?: string;
  metadata?: {
    duration?: number;
    platform?: string;
    rating?: number;
    [key: string]: unknown;
  };
  timestamp: Date;
  createdAt: Date;
}
```

**Indexes** :
- `{ userId: 1, timestamp: -1 }` (composé)
- `{ action: 1, timestamp: -1 }` (composé)
- `{ timestamp: 1 }` (TTL optionnel, expireAfterSeconds: 7776000 = 90 jours)

**Usage** : Log détaillé pour analytics temps réel, dashboard admin

---

### UserStats (Extended)

**Nouveau champ ajouté** :
```typescript
shareCount: number; // Sprint 4 - Nombre de partages sociaux
```

**Champs existants** :
```typescript
{
  userId: string;
  userName: string;
  attractionsVisited: number;
  audioGuidesListened: number;
  toursCompleted: number;
  totalListeningTime: number;
  favoriteCount: number;
  reviewCount: number;
  shareCount: number; // ← NOUVEAU
  badges: string[];
  lastActivityAt: Date;
  createdAt: Date;
  updatedAt: Date;
}
```

---

## 🔄 Flux de Données

### 1. Tracking d'une action

```
Client (App Mobile/Web)
    ↓
POST /api/analytics/track
    ↓
analyticsController.trackAction()
    ↓
┌──────────────────────────┐
│ 1. Créer ActivityLog     │
│ 2. Trouver UserActivity  │
│    (userId + date=today) │
│ 3. Incrémenter compteurs │
│ 4. Sauvegarder           │
└──────────────────────────┘
    ↓
Response { success: true }
```

### 2. Affichage des tendances

```
StatsPage (Tab Tendances)
    ↓
GET /api/analytics/users/:userId/trends?timeframe=7d
    ↓
analyticsController.getUserTrends()
    ↓
┌──────────────────────────┐
│ 1. Calculer startDate    │
│ 2. Query UserActivity    │
│    { userId, date >= }   │
│ 3. Formater pour charts  │
│ 4. Calculer totaux       │
└──────────────────────────┘
    ↓
LineChart + BarChart (Recharts)
```

### 3. Comparaison avec pairs

```
StatsPage (Tab Comparaison)
    ↓
GET /api/analytics/users/:userId/compare
    ↓
analyticsController.compareWithPeers()
    ↓
┌──────────────────────────┐
│ 1. Query user UserStats  │
│ 2. Query all UserStats   │
│ 3. Calculer moyennes     │
│ 4. Calculer rang         │
│ 5. Calculer percentile   │
└──────────────────────────┘
    ↓
Rank Card + BarChart comparatif
```

---

## 🧪 Tests

**Script de test** : `backend-api/test-analytics-sprint4.js`

**Commandes** :
```bash
cd backend-api
node test-analytics-sprint4.js
```

**Tests effectués** :
1. ✅ Track action (visit)
2. ✅ Track action (listen) avec metadata.duration
3. ✅ Track action (share) avec metadata.platform
4. ✅ Get user trends (7d)
5. ✅ Get user trends (30d)
6. ✅ Compare with peers
7. ✅ Get dashboard analytics
8. ✅ Get leaderboard (all time)
9. ✅ Get leaderboard (7d)
10. ✅ Get leaderboard (sortBy=shareCount)

**Prérequis** :
- Backend lancé : `npm run dev` (port 5000)
- MongoDB connecté
- Utilisateur `user-123` existe
- Attraction `attraction-1` existe

---

## 📊 Exemples d'utilisation

### Exemple 1: Tracker un partage WhatsApp

```typescript
// Mobile app - socialShareService.ts
await fetch('http://localhost:5000/api/analytics/track', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    userId: 'user-123',
    action: 'share',
    attractionId: attraction._id,
    metadata: {
      platform: 'whatsapp',
    },
  }),
});
```

### Exemple 2: Afficher les tendances 30 jours

```typescript
// StatsPage.tsx
const response = await apiClient.get(`/analytics/users/${userId}/trends`, {
  params: { timeframe: '30d' },
});

const trendsData = response.data.data.trends;

// Recharts LineChart
<LineChart data={trendsData}>
  <Line dataKey="attractionsVisited" stroke="#3880ff" />
  <Line dataKey="audioGuidesListened" stroke="#2dd36f" />
</LineChart>
```

### Exemple 3: Leaderboard par shareCount

```typescript
// LeaderboardPage.tsx
const response = await apiClient.get('/users/leaderboard', {
  params: {
    sortBy: 'shareCount',
    limit: 20,
    timeframe: '7d',
  },
});

const leaderboard = response.data.data;

// Afficher classement
leaderboard.map((user, index) => (
  <div key={user._id}>
    <span>#{index + 1}</span>
    <span>{user.userName}</span>
    <span>{user.shareCount} partages</span>
  </div>
));
```

---

## 🔗 Liens Utiles

- **Models** :
  - `backend-api/src/models/UserActivity.ts`
  - `backend-api/src/models/ActivityLog.ts`
  - `backend-api/src/models/UserStats.ts` (extended)

- **Controllers** :
  - `backend-api/src/controllers/analyticsController.ts` (354 lignes)
  - `backend-api/src/controllers/userStatsController.ts` (modified)

- **Routes** :
  - `backend-api/src/routes/analytics.ts` (endpoints ajoutés)

- **Tests** :
  - `backend-api/test-analytics-sprint4.js`

---

**Dernière mise à jour** : 12 octobre 2025  
**Auteur** : GitHub Copilot  
**Version API** : 1.0
