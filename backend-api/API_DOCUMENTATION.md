# API Côte d'Ivoire Audio Guide - Documentation des Endpoints

## 🏠 Base URL

```text
http://localhost:5000/api
```

## 📊 Health Check

- `GET /api/health` - Vérification du statut de l'API

## 🏛️ Attractions

### Routes publiques

- `GET /api/attractions` - Liste toutes les attractions
  - Query params: `category`, `city`, `featured`, `lat`, `lng`, `radius`, `limit`, `page`
- `GET /api/attractions/search` - Recherche d'attractions
  - Query params: `q`, `category`, `city`, `limit`, `page`
- `GET /api/attractions/:id` - Détails d'une attraction

### Routes protégées (Admin)
- `POST /api/attractions` - Créer une attraction
- `PUT /api/attractions/:id` - Modifier une attraction
- `DELETE /api/attractions/:id` - Supprimer une attraction

## 🎧 Guides Audio

### Routes publiques
- `GET /api/audio-guides` - Liste tous les guides audio
  - Query params: `attractionId`, `language`, `limit`, `page`, `active`
- `GET /api/audio-guides/attraction/:attractionId` - Guides audio par attraction
- `GET /api/audio-guides/:id` - Détails d'un guide audio
- `POST /api/audio-guides/:id/download` - Incrémenter le compteur de téléchargement

### Routes protégées (Admin)
- `POST /api/audio-guides` - Créer un guide audio
- `PUT /api/audio-guides/:id` - Modifier un guide audio
- `DELETE /api/audio-guides/:id` - Supprimer un guide audio

## 🚶 Circuits Touristiques

### Routes publiques
- `GET /api/tours` - Liste tous les circuits
  - Query params: `category`, `difficulty`, `duration`, `city`, `featured`, `active`, `limit`, `page`
- `GET /api/tours/search` - Recherche de circuits
  - Query params: `q`, `category`, `difficulty`, `maxDuration`, `city`, `limit`, `page`
- `GET /api/tours/featured` - Circuits mis en avant
- `GET /api/tours/category/:category` - Circuits par catégorie
- `GET /api/tours/:id` - Détails d'un circuit

### Routes protégées (Admin)
- `POST /api/tours` - Créer un circuit
- `PUT /api/tours/:id` - Modifier un circuit
- `DELETE /api/tours/:id` - Supprimer un circuit

## 👥 Utilisateurs

### Routes protégées (Utilisateur connecté)
- `GET /api/users/profile` - Profil de l'utilisateur connecté
- `PUT /api/users/profile` - Modifier le profil

### Routes protégées (Admin)
- `GET /api/users` - Liste tous les utilisateurs
- `GET /api/users/:id` - Détails d'un utilisateur
- `POST /api/users` - Créer un utilisateur
- `PUT /api/users/:id` - Modifier un utilisateur
- `DELETE /api/users/:id` - Supprimer un utilisateur
- `PATCH /api/users/:id/deactivate` - Désactiver un utilisateur
- `PATCH /api/users/:id/activate` - Activer un utilisateur
- `PATCH /api/users/:id/role` - Changer le rôle d'un utilisateur

## 🔐 Authentification (Temporairement désactivé)
- `POST /api/auth/register` - Inscription
- `POST /api/auth/login` - Connexion
- `POST /api/auth/logout` - Déconnexion
- `POST /api/auth/forgot-password` - Mot de passe oublié
- `POST /api/auth/refresh-token` - Rafraîchir le token
- `GET /api/auth/verify-token` - Vérifier le token
- `POST /api/auth/change-password` - Changer le mot de passe

## 🔍 Endpoints Généraux

### Routes publiques
- `GET /api/search` - Recherche globale
  - Query params: `q`, `limit`
- `GET /api/categories` - Liste des catégories
  - Query params: `type` (attractions, tours)
- `GET /api/cities` - Liste des villes
- `GET /api/regions` - Liste des régions
- `GET /api/recommendations` - Recommandations
  - Query params: `type` (attractions, tours, mixed), `limit`

### Routes protégées (Admin)
- `GET /api/stats` - Statistiques de l'application

## 📝 Format de Réponse Standard

### Succès
```json
{
  "success": true,
  "message": "Message de succès",
  "data": { /* données */ },
  "pagination": { /* info de pagination si applicable */ }
}
```

### Erreur
```json
{
  "success": false,
  "message": "Message d'erreur",
  "error": "Détails de l'erreur"
}
```

## 🔒 Authentification

La plupart des endpoints publics ne nécessitent pas d'authentification. Les endpoints protégés requièrent un header:
```
Authorization: Bearer <token_jwt>
```

## 📊 Pagination

Les endpoints qui retournent des listes supportent la pagination:
- `limit`: Nombre d'éléments par page (défaut: 20)
- `page`: Numéro de page (défaut: 1)

La réponse inclut un objet `pagination`:
```json
{
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 100,
    "pages": 5
  }
}
```

## 🎯 Codes de Statut HTTP

- `200` - OK
- `201` - Créé
- `400` - Requête invalide
- `401` - Non autorisé
- `403` - Accès interdit
- `404` - Non trouvé
- `500` - Erreur serveur
