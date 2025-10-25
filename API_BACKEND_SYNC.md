# 📚 Documentation API - Endpoints Backend Sync

## Vue d'Ensemble

Cette documentation couvre les **14 endpoints** créés pour supporter les fonctionnalités offline de l'app mobile (favoris, reviews, user stats).

**Date**: 11 octobre 2025  
**Version API**: 2.0.0  
**Base URL**: `http://localhost:5000/api`

---

## 📋 Table des Matières

1. [Favorites Endpoints](#favorites-endpoints) (4 endpoints)
2. [Reviews Endpoints](#reviews-endpoints) (5 endpoints)
3. [UserStats Endpoints](#userstats-endpoints) (5 endpoints)
4. [Modèles de Données](#modèles-de-données)
5. [Tests](#tests)

---

## ❤️ Favorites Endpoints

### 1. POST /api/favorites

Ajouter une attraction aux favoris d'un utilisateur.

**URL**: `/api/favorites`  
**Méthode**: `POST`  
**Auth**: Non requise (public)

**Body**:
```json
{
  "userId": "user-123",
  "userName": "John Doe",
  "attractionId": "507f1f77bcf86cd799439011"
}
```

**Réponse** (201 Created):
```json
{
  "success": true,
  "data": {
    "_id": "67890abcdef",
    "userId": "user-123",
    "attractionId": "507f1f77bcf86cd799439011",
    "createdAt": "2025-10-11T10:30:00.000Z",
    "updatedAt": "2025-10-11T10:30:00.000Z"
  }
}
```

**Cas spécial**: Si le favori existe déjà (doublon), retourne 200 OK avec message.

---

### 2. DELETE /api/favorites/:attractionId

Supprimer une attraction des favoris.

**URL**: `/api/favorites/:attractionId`  
**Méthode**: `DELETE`  
**Auth**: Non requise (public)

**Body**:
```json
{
  "userId": "user-123"
}
```

**Réponse** (200 OK):
```json
{
  "success": true,
  "message": "Favori supprimé"
}
```

---

### 3. GET /api/favorites

Récupérer tous les favoris d'un utilisateur.

**URL**: `/api/favorites?userId=user-123`  
**Méthode**: `GET`  
**Auth**: Non requise (public)

**Query Params**:
- `userId` (requis): ID de l'utilisateur

**Réponse** (200 OK):
```json
{
  "success": true,
  "count": 3,
  "data": [
    {
      "_id": "67890abcdef",
      "userId": "user-123",
      "attractionId": {
        "_id": "507f1f77bcf86cd799439011",
        "name": "Basilique Notre-Dame de la Paix",
        "location": { "city": "Yamoussoukro" },
        "images": ["url1.jpg"],
        "rating": 4.8
      },
      "createdAt": "2025-10-11T10:30:00.000Z"
    }
  ]
}
```

**Note**: Les attractions sont **populées** avec toutes leurs données.

---

### 4. GET /api/favorites/check/:attractionId

Vérifier si une attraction est dans les favoris.

**URL**: `/api/favorites/check/:attractionId?userId=user-123`  
**Méthode**: `GET`  
**Auth**: Non requise (public)

**Query Params**:
- `userId` (requis): ID de l'utilisateur

**Réponse** (200 OK):
```json
{
  "success": true,
  "isFavorite": true
}
```

---

## ⭐ Reviews Endpoints

### 1. POST /api/reviews

Créer une review (notation + commentaire).

**URL**: `/api/reviews`  
**Méthode**: `POST`  
**Auth**: Non requise (public)

**Body**:
```json
{
  "userId": "user-123",
  "userName": "John Doe",
  "userAvatar": "https://example.com/avatar.jpg",
  "attractionId": "507f1f77bcf86cd799439011",
  "rating": 5,
  "comment": "Excellent lieu à visiter ! Très intéressant et bien conservé.",
  "language": "fr"
}
```

**Validations**:
- `rating`: Entre 1 et 5
- `comment`: Entre 10 et 1000 caractères
- `language`: "fr" ou "en"

**Réponse** (201 Created):
```json
{
  "success": true,
  "data": {
    "_id": "review123",
    "userId": "user-123",
    "userName": "John Doe",
    "attractionId": "507f1f77bcf86cd799439011",
    "rating": 5,
    "comment": "Excellent lieu...",
    "language": "fr",
    "helpful": 0,
    "reported": 0,
    "status": "pending",
    "createdAt": "2025-10-11T10:30:00.000Z"
  }
}
```

**Note**: Les reviews créées ont le status `pending` (nécessite modération).

---

### 2. GET /api/reviews

Récupérer les reviews (filtrable par attraction, user, status).

**URL**: `/api/reviews?attractionId=xxx&userId=yyy&status=approved&page=1&limit=10`  
**Méthode**: `GET`  
**Auth**: Non requise (public)

**Query Params** (tous optionnels):
- `attractionId`: Filtrer par attraction
- `userId`: Filtrer par utilisateur
- `status`: Filtrer par status (`pending`, `approved`, `rejected`)
- `page`: Page (défaut: 1)
- `limit`: Nombre par page (défaut: 10)

**Réponse** (200 OK):
```json
{
  "success": true,
  "count": 5,
  "total": 23,
  "page": 1,
  "pages": 3,
  "data": [
    {
      "_id": "review123",
      "userId": "user-123",
      "userName": "John Doe",
      "userAvatar": "https://...",
      "attractionId": {
        "_id": "507f1f77bcf86cd799439011",
        "name": "Basilique Notre-Dame",
        "location": { "city": "Yamoussoukro" }
      },
      "rating": 5,
      "comment": "Excellent lieu...",
      "helpful": 12,
      "reported": 0,
      "status": "approved",
      "createdAt": "2025-10-11T10:30:00.000Z"
    }
  ]
}
```

**Défaut**: Si aucun `status` n'est spécifié, retourne seulement les reviews `approved`.

---

### 3. PATCH /api/reviews/:id/helpful

Marquer une review comme utile (like).

**URL**: `/api/reviews/:id/helpful`  
**Méthode**: `PATCH`  
**Auth**: Non requise (public)

**Réponse** (200 OK):
```json
{
  "success": true,
  "data": {
    "_id": "review123",
    "helpful": 13,
    ...
  }
}
```

---

### 4. PATCH /api/reviews/:id/report

Signaler une review (spam, contenu inapproprié).

**URL**: `/api/reviews/:id/report`  
**Méthode**: `PATCH`  
**Auth**: Non requise (public)

**Réponse** (200 OK):
```json
{
  "success": true,
  "data": {
    "_id": "review123",
    "reported": 1,
    "status": "approved",
    ...
  }
}
```

**Auto-modération**: Si `reported >= 3`, la review passe automatiquement en `pending`.

---

### 5. PATCH /api/reviews/:id/moderate

Modérer une review (admin seulement).

**URL**: `/api/reviews/:id/moderate`  
**Méthode**: `PATCH`  
**Auth**: Requise (admin)

**Body**:
```json
{
  "status": "approved",
  "moderationNote": "Review approuvée, contenu pertinent"
}
```

**Status possibles**: `pending`, `approved`, `rejected`

**Réponse** (200 OK):
```json
{
  "success": true,
  "data": {
    "_id": "review123",
    "status": "approved",
    "moderationNote": "Review approuvée...",
    ...
  }
}
```

---

## 📊 UserStats Endpoints

### 1. GET /api/users/:userId/stats

Récupérer les statistiques d'un utilisateur.

**URL**: `/api/users/:userId/stats`  
**Méthode**: `GET`  
**Auth**: Non requise (public)

**Réponse** (200 OK):
```json
{
  "success": true,
  "data": {
    "_id": "stats123",
    "userId": "user-123",
    "userName": "John Doe",
    "attractionsVisited": 15,
    "audioGuidesListened": 42,
    "toursCompleted": 3,
    "totalListeningTime": 7200,
    "favoriteCount": 8,
    "reviewCount": 5,
    "badges": ["first_favorite", "reviewer", "explorer"],
    "lastActivityAt": "2025-10-11T10:30:00.000Z",
    "createdAt": "2025-09-01T08:00:00.000Z",
    "updatedAt": "2025-10-11T10:30:00.000Z"
  }
}
```

**Note**: Si l'utilisateur n'a pas de stats, crée automatiquement un profil vide.

---

### 2. PATCH /api/users/:userId/stats

Mettre à jour les stats d'un utilisateur (batch update).

**URL**: `/api/users/:userId/stats`  
**Méthode**: `PATCH`  
**Auth**: Non requise (public)

**Body** (tous les champs sont optionnels):
```json
{
  "userName": "John Updated",
  "attractionsVisited": 20,
  "audioGuidesListened": 50,
  "toursCompleted": 5,
  "totalListeningTime": 9000,
  "favoriteCount": 10,
  "reviewCount": 7,
  "badges": ["first_favorite", "reviewer", "explorer", "master"]
}
```

**Champs autorisés**:
- `userName`
- `attractionsVisited`
- `audioGuidesListened`
- `toursCompleted`
- `totalListeningTime`
- `favoriteCount`
- `reviewCount`
- `badges`

**Réponse** (200 OK):
```json
{
  "success": true,
  "data": {
    "_id": "stats123",
    "userId": "user-123",
    "userName": "John Updated",
    "attractionsVisited": 20,
    ...
  }
}
```

---

### 3. PATCH /api/users/:userId/stats/increment

Incrémenter un compteur spécifique.

**URL**: `/api/users/:userId/stats/increment`  
**Méthode**: `PATCH`  
**Auth**: Non requise (public)

**Body**:
```json
{
  "field": "attractionsVisited",
  "value": 1
}
```

**Champs autorisés**:
- `attractionsVisited`
- `audioGuidesListened`
- `toursCompleted`
- `totalListeningTime`
- `favoriteCount`
- `reviewCount`

**Réponse** (200 OK):
```json
{
  "success": true,
  "data": {
    "_id": "stats123",
    "userId": "user-123",
    "attractionsVisited": 16,
    ...
  }
}
```

---

### 4. POST /api/users/:userId/stats/badge

Ajouter un badge à un utilisateur.

**URL**: `/api/users/:userId/stats/badge`  
**Méthode**: `POST`  
**Auth**: Non requise (public)

**Body**:
```json
{
  "badge": "first_favorite"
}
```

**Badges possibles** (exemples):
- `first_favorite`: Premier favori ajouté
- `reviewer`: Première review postée
- `explorer`: 10 attractions visitées
- `audio_lover`: 50 audio guides écoutés
- `master`: 100 attractions visitées

**Réponse** (200 OK):
```json
{
  "success": true,
  "data": {
    "_id": "stats123",
    "userId": "user-123",
    "badges": ["first_favorite", "reviewer"],
    ...
  }
}
```

**Note**: Utilise `$addToSet` pour éviter les doublons.

---

### 5. GET /api/users/leaderboard

Récupérer le classement des utilisateurs.

**URL**: `/api/users/leaderboard?sortBy=attractionsVisited&limit=10`  
**Méthode**: `GET`  
**Auth**: Non requise (public)

**Query Params**:
- `sortBy`: Champ de tri (défaut: `attractionsVisited`)
- `limit`: Nombre d'utilisateurs (défaut: 10)

**Champs de tri autorisés**:
- `attractionsVisited`
- `audioGuidesListened`
- `toursCompleted`
- `totalListeningTime`
- `favoriteCount`
- `reviewCount`

**Réponse** (200 OK):
```json
{
  "success": true,
  "count": 10,
  "sortBy": "attractionsVisited",
  "data": [
    {
      "_id": "stats1",
      "userId": "user-001",
      "userName": "Explorer Pro",
      "attractionsVisited": 120,
      "audioGuidesListened": 300,
      "badges": ["master", "audio_lover"]
    },
    {
      "_id": "stats2",
      "userId": "user-002",
      "userName": "Travel Fan",
      "attractionsVisited": 95,
      ...
    }
  ]
}
```

---

## 📦 Modèles de Données

### Favorite Model

```typescript
interface IFavorite {
  userId: string;
  attractionId: ObjectId;
  createdAt: Date;
  updatedAt: Date;
}
```

**Index**: Unique composite sur `userId` + `attractionId` (évite doublons).

---

### Review Model

```typescript
interface IReview {
  userId: string;
  userName: string;
  userAvatar?: string;
  attractionId: ObjectId;
  rating: number; // 1-5
  comment: string; // 10-1000 caractères
  language: 'fr' | 'en';
  helpful: number;
  reported: number;
  status: 'pending' | 'approved' | 'rejected';
  moderationNote?: string;
  createdAt: Date;
  updatedAt: Date;
}
```

**Index**:
- Composite sur `attractionId` + `status` + `createdAt`
- Sur `userId` + `createdAt`

---

### UserStats Model

```typescript
interface IUserStats {
  userId: string; // Unique
  userName: string;
  attractionsVisited: number;
  audioGuidesListened: number;
  toursCompleted: number;
  totalListeningTime: number; // secondes
  favoriteCount: number;
  reviewCount: number;
  badges: string[];
  lastActivityAt: Date;
  createdAt: Date;
  updatedAt: Date;
}
```

**Index**: Unique sur `userId`.

---

## 🧪 Tests

### Script de Test Automatisé

**Fichier**: `test-backend-sync.js`

**Commande**:
```bash
node test-backend-sync.js
```

**Tests effectués** (14 endpoints):

1. **Favorites** (4 tests):
   - POST /api/favorites
   - GET /api/favorites
   - GET /api/favorites/check/:attractionId
   - DELETE /api/favorites/:attractionId

2. **Reviews** (5 tests):
   - POST /api/reviews
   - GET /api/reviews (par attraction)
   - GET /api/reviews (par user)
   - PATCH /api/reviews/:id/helpful
   - PATCH /api/reviews/:id/moderate

3. **UserStats** (5 tests):
   - GET /api/users/:userId/stats
   - PATCH /api/users/:userId/stats/increment (x3)
   - POST /api/users/:userId/stats/badge (x2)
   - PATCH /api/users/:userId/stats
   - GET /api/users/leaderboard

**Résultat attendu**: 14/14 tests ✅

---

## 📝 Notes Importantes

### Background Sync Integration

Ces endpoints sont conçus pour fonctionner avec le **backgroundSyncService.ts** de l'app mobile:

1. **Favoris offline** → Queue `favorite` / `unfavorite`
2. **Reviews offline** → Queue `review`
3. **Ratings offline** → Queue `rating` (utilise reviews endpoint)
4. **Stats offline** → Queue `stats` (utilise increment endpoint)

### Auto-Update des Stats

Certains endpoints mettent à jour automatiquement les stats:

- **POST /api/favorites** → Incrémente `favoriteCount`
- **DELETE /api/favorites** → Décrémente `favoriteCount`
- **POST /api/reviews** → Incrémente `reviewCount`

### Modération

Les reviews créées ont le status `pending` par défaut. Un admin doit les approuver via:

```http
PATCH /api/reviews/:id/moderate
{
  "status": "approved",
  "moderationNote": "Contenu pertinent"
}
```

---

## 🚀 Déploiement

### Variables d'Environnement

Aucune variable supplémentaire requise. Utilise la même `MONGODB_URI`.

### MongoDB Indexes

Les indexes sont créés automatiquement au démarrage du serveur.

---

**Date**: 11 octobre 2025  
**Auteur**: Backend API Team  
**Version**: 2.0.0  
**Status**: ✅ Production Ready
