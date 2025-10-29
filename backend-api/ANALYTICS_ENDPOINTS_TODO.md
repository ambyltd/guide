# Endpoints Analytics - TODO

## Statut Actuel

### ✅ Endpoints Implémentés

#### 1. GET `/api/users/leaderboard` ✅
**Statut**: Implémenté et fonctionnel (commit: 7c6334b)

**Paramètres**:
- `sortBy`: `attractionsVisited` | `audioGuidesListened` | `toursCompleted` | `totalListeningTime` | `reviewCount` | `shareCount` (défaut: `attractionsVisited`)
- `limit`: nombre d'utilisateurs à retourner (défaut: 20)
- `timeframe`: `7d` | `30d` | `all` (défaut: `all`)

**Réponse**:
```json
{
  "success": true,
  "count": 10,
  "sortBy": "attractionsVisited",
  "timeframe": "all",
  "data": [
    {
      "_id": "...",
      "userId": "test-user-123",
      "userName": "Test User",
      "userAvatar": "",
      "attractionsVisited": 4,
      "audioGuidesListened": 12,
      "toursCompleted": 2,
      "totalListeningTime": 7200,
      "reviewCount": 0,
      "favoriteCount": 0,
      "shareCount": 0,
      "badges": ["first_favorite", "reviewer"],
      "rank": 1,
      "score": 145,
      "lastActivityAt": "2025-10-12T09:26:13.850Z",
      "createdAt": "2025-10-12T09:08:31.641Z",
      "updatedAt": "2025-10-12T09:26:13.851Z"
    }
  ]
}
```

**Formule de calcul du score**:
```
score = attractionsVisited × 10
      + audioGuidesListened × 5
      + toursCompleted × 20
      + reviewCount × 15
      + badges.length × 25
```

**Testé sur**: 
- ✅ Local: `http://localhost:5000/api/users/leaderboard`
- ✅ Production: `https://audio-guide-w8ww.onrender.com/api/users/leaderboard`

---

### ❌ Endpoints Non Implémentés

#### 2. GET `/api/analytics/users/:userId/trends`
**Statut**: Non implémenté (mobile utilise mock data)

**Paramètres**:
- `:userId`: ID de l'utilisateur
- `timeframe`: `7d` | `30d` (défaut: `30d`)

**Réponse attendue**:
```json
{
  "success": true,
  "data": {
    "attractionsVisited": [
      { "date": "2025-10-20", "value": 2 },
      { "date": "2025-10-21", "value": 1 }
    ],
    "audioGuidesListened": [
      { "date": "2025-10-20", "value": 5 },
      { "date": "2025-10-21", "value": 3 }
    ],
    "reviewCount": [
      { "date": "2025-10-20", "value": 1 },
      { "date": "2025-10-21", "value": 0 }
    ],
    "totalListeningTime": [
      { "date": "2025-10-20", "value": 1800 },
      { "date": "2025-10-21", "value": 900 }
    ]
  }
}
```

**Implémentation nécessaire**:
1. Créer modèle `ActivityLog` avec:
   - `userId`: string
   - `activityType`: `attraction_visit` | `audio_guide_listen` | `review_post` | etc.
   - `metadata`: object (attractionId, duration, etc.)
   - `createdAt`: Date (indexé pour requêtes temporelles)

2. Créer contrôleur `analyticsController.ts`:
   ```typescript
   export const getUserTrends = async (req: Request, res: Response) => {
     const { userId } = req.params;
     const { timeframe = '30d' } = req.query;
     const days = timeframe === '7d' ? 7 : 30;
     
     // Agréger les logs d'activité par date
     const trends = await ActivityLog.aggregate([
       {
         $match: {
           userId,
           createdAt: { $gte: new Date(Date.now() - days * 86400000) }
         }
       },
       {
         $group: {
           _id: { 
             date: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
             activityType: "$activityType"
           },
           count: { $sum: 1 },
           totalDuration: { $sum: "$metadata.duration" }
         }
       },
       { $sort: { "_id.date": 1 } }
     ]);
     
     // Formater les résultats
     res.json({ success: true, data: formatTrends(trends) });
   };
   ```

3. Ajouter route dans `analytics.ts`:
   ```typescript
   router.get('/users/:userId/trends', getUserTrends);
   ```

---

#### 3. GET `/api/analytics/users/:userId/compare`
**Statut**: Non implémenté (mobile utilise mock data)

**Paramètres**:
- `:userId`: ID de l'utilisateur

**Réponse attendue**:
```json
{
  "success": true,
  "data": {
    "user": {
      "userId": "user-123",
      "userName": "John Doe",
      "stats": {
        "attractionsVisited": 15,
        "audioGuidesListened": 30,
        "reviewCount": 5,
        "totalListeningTime": 3600
      }
    },
    "peers": {
      "average": {
        "attractionsVisited": 8,
        "audioGuidesListened": 20,
        "reviewCount": 3,
        "totalListeningTime": 2400
      },
      "percentile": 75,
      "rank": 250,
      "total": 1000
    }
  }
}
```

**Implémentation nécessaire**:
1. Créer contrôleur dans `analyticsController.ts`:
   ```typescript
   export const compareWithPeers = async (req: Request, res: Response) => {
     const { userId } = req.params;
     
     // Récupérer les stats de l'utilisateur
     const userStats = await UserStats.findOne({ userId });
     
     // Calculer les moyennes de tous les utilisateurs
     const avgStats = await UserStats.aggregate([
       {
         $group: {
           _id: null,
           avgAttractionsVisited: { $avg: "$attractionsVisited" },
           avgAudioGuidesListened: { $avg: "$audioGuidesListened" },
           avgReviewCount: { $avg: "$reviewCount" },
           avgTotalListeningTime: { $avg: "$totalListeningTime" }
         }
       }
     ]);
     
     // Calculer le rang et percentile
     const totalUsers = await UserStats.countDocuments();
     const rank = await UserStats.countDocuments({
       attractionsVisited: { $gt: userStats.attractionsVisited }
     }) + 1;
     
     res.json({
       success: true,
       data: {
         user: { userId, userName: userStats.userName, stats: userStats },
         peers: {
           average: avgStats[0],
           percentile: Math.round((1 - rank / totalUsers) * 100),
           rank,
           total: totalUsers
         }
       }
     });
   };
   ```

2. Ajouter route dans `analytics.ts`:
   ```typescript
   router.get('/users/:userId/compare', compareWithPeers);
   ```

---

#### 4. GET `/api/analytics/dashboard` (Admin)
**Statut**: Non implémenté

**Paramètres**:
- `timeframe`: `7d` | `30d` | `all` (défaut: `30d`)

**Réponse attendue**:
```json
{
  "success": true,
  "data": {
    "totalUsers": 1500,
    "activeUsers": 450,
    "totalAttractions": 15,
    "totalAudioGuides": 30,
    "totalReviews": 250,
    "popularAttractions": [
      { "id": "...", "name": "Basilique", "visits": 450 }
    ],
    "engagementMetrics": {
      "avgListeningTime": 1800,
      "avgReviewsPerUser": 0.17,
      "completionRate": 0.65
    }
  }
}
```

**Implémentation nécessaire**:
1. Créer contrôleur admin
2. Requêtes d'agrégation sur UserStats, Attraction, Review
3. Protéger avec `requireAdmin` middleware

---

#### 5. POST `/api/analytics/track`
**Statut**: Non implémenté

**Body**:
```json
{
  "userId": "user-123",
  "activityType": "attraction_visit",
  "metadata": {
    "attractionId": "...",
    "duration": 1800
  }
}
```

**Implémentation nécessaire**:
1. Créer modèle `ActivityLog`
2. Contrôleur pour insérer log
3. Utiliser dans mobile app pour tracking temps réel

---

## Priorité d'Implémentation

### Sprint Futur - Endpoints Analytics (3-4h)

**Phase 1**: Modèles de données (30 min)
- [ ] Créer `ActivityLog` model
- [ ] Ajouter indexes pour performance

**Phase 2**: Contrôleurs (2h)
- [ ] `getUserTrends()` avec agrégation MongoDB
- [ ] `compareWithPeers()` avec calculs statistiques
- [ ] `trackActivity()` pour logging temps réel
- [ ] `getDashboardAnalytics()` pour admin

**Phase 3**: Routes (15 min)
- [ ] Créer `analytics.ts` routes
- [ ] Enregistrer dans `index.ts`

**Phase 4**: Tests (1h)
- [ ] Script de test automatique
- [ ] Test sur local + Render.com
- [ ] Validation mobile app

**Phase 5**: Documentation (15 min)
- [ ] Mettre à jour API_DOCUMENTATION.md
- [ ] Exemples curl

---

## Notes Techniques

### Mock Data Actuel (Mobile)
Le mobile utilise des fallbacks mockés dans `advancedStatsService.ts`:
- `getUserTrends()`: Génère arrays de 7/30 jours avec valeurs aléatoires
- `compareWithPeers()`: Retourne moyenne = userStats, percentile = 50
- `getLeaderboard()`: Génère 10-20 utilisateurs fictifs triés par score

Ces mocks permettent de tester l'UI sans backend, mais doivent être remplacés par vraies données dès que endpoints sont implémentés.

### Collection MongoDB Nécessaire
```javascript
// ActivityLog collection
{
  _id: ObjectId,
  userId: String (indexed),
  activityType: String, // 'attraction_visit', 'audio_guide_listen', 'review_post', etc.
  metadata: {
    attractionId: String,
    audioGuideId: String,
    duration: Number, // en secondes
    language: String,
    completed: Boolean
  },
  createdAt: Date (indexed),
  updatedAt: Date
}

// Index composé pour requêtes temporelles
db.activitylogs.createIndex({ userId: 1, createdAt: -1 })
db.activitylogs.createIndex({ activityType: 1, createdAt: -1 })
```

---

## Déploiement

### Render.com
Après implémentation, redéployer sur Render.com:
```bash
git add backend-api/src/controllers/analyticsController.ts
git add backend-api/src/routes/analytics.ts
git add backend-api/src/models/ActivityLog.ts
git commit -m "feat: Implement analytics endpoints (getUserTrends, compareWithPeers, trackActivity)"
git push origin master
```

Render.com détectera automatiquement le push et redéploiera (5-10 min).

### Variables d'Environnement
Aucune variable supplémentaire nécessaire (MongoDB URI déjà configurée).

---

**Dernière mise à jour**: 26 octobre 2025  
**Commit backend**: 7c6334b  
**Commit mobile**: b88ed59
