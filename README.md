# 🇨🇮 Application de Découverte Audio Guide - Côte d'Ivoire

## 📋 Description

Application complète de découverte audio guide de la Côte d'Ivoire destinée au marché européen. Le projet comprend un CMS web pour la gestion de contenu et une application mobile interactive pour les visiteurs.

## 🏗️ Architecture du Projet

```
cote-divoire-audio-guide/
├── cms-web/          # CMS Web React.js (MVP basé sur izi.travel)
├── mobile-app/       # Application mobile React Native
├── backend-api/      # API Backend Node.js/Express
├── shared/          # Types et utilitaires partagés
└── docs/            # Documentation
```

## 🚀 Technologies Utilisées

### Frontend Web (CMS)

- **React.js** - Interface utilisateur
- **Material-UI** - Composants UI
- **React Router** - Navigation
- **Axios** - Requêtes HTTP
- **Mapbox GL JS** - Cartographie

### Application Mobile

- **React Native** - Framework mobile
- **Expo** - Plateforme de développement
- **React Navigation** - Navigation mobile
- **Mapbox Maps SDK** - Cartes interactives
- **React Native Audio** - Lecture audio

### Backend

- **Node.js** - Runtime JavaScript
- **Express.js** - Framework web
- **MongoDB Atlas** - Base de données
- **Firebase Admin** - Authentification
- **Multer** - Upload de fichiers

### Services Externes

- **Firebase Auth** - Authentification utilisateurs
- **MongoDB Atlas** - Base de données cloud
- **Mapbox** - Services de cartographie
- **Netlify** - Hébergement frontend
- **Render** - Hébergement backend

## 📱 Fonctionnalités

### CMS Web

- ✅ Gestion des attractions touristiques
- ✅ Upload et gestion des guides audio
- ✅ Interface cartographique pour positionner les points d'intérêt
- ✅ Gestion des circuits touristiques
- ✅ Système d'authentification admin
- ✅ Dashboard analytique

### Application Mobile

- ✅ Carte interactive avec points d'intérêt
- ✅ Lecture de guides audio géolocalisés
- ✅ Circuits touristiques guidés
- ✅ Mode offline pour les contenus téléchargés
- ✅ Authentification utilisateur
- ✅ Favoris et historique

## 🛠️ Installation et Développement

### Prérequis

- Node.js 18+
- npm ou yarn
- Expo CLI (pour mobile)
- Comptes: Firebase, MongoDB Atlas, Mapbox

### Installation

```bash
# Cloner le projet
git clone [URL_DU_REPO]
cd cote-divoire-audio-guide

# Installer toutes les dépendances
npm run install:all
```

### Configuration

1. Créer les fichiers `.env` dans chaque dossier
2. Configurer les clés API (Firebase, MongoDB, Mapbox)
3. Voir les fichiers `.env.example` pour les variables requises

### Développement

```bash
# Lancer le CMS web
npm run dev:web

# Lancer l'application mobile
npm run dev:mobile

# Lancer l'API backend
npm run dev:api
```

## 🌍 Déploiement

### CMS Web (Netlify)

```bash
npm run build:web
npm run deploy:web
```

### API Backend (Render)

```bash
npm run deploy:api
```

### Application Mobile

- **iOS**: Via App Store Connect
- **Android**: Via Google Play Console

## 📊 Contenu par Défaut

### Attractions Incluses

- **Musées**: Musée des Civilisations, Musée National
- **Sites Naturels**: Parc Banco, Lagune Ébrié
- **Monuments**: Cathédrale Saint-Paul, Plateau administratif
- **Marchés**: Marché de Cocody, Marché de Treichville

### Circuits Touristiques

- Circuit Historique d'Abidjan
- Découverte de la Culture Baoulé
- Nature et Lagunes
- Art et Artisanat Ivoirien

## 🔧 Configuration des Services

### Firebase Auth

- Configuration dans `firebase.config.js`
- Méthodes: Email/Password, Google, Facebook

### MongoDB Atlas

- Collections: users, attractions, audio_guides, tours
- Indexes géospatiaux pour la recherche par proximité

### Mapbox

- Style personnalisé pour la Côte d'Ivoire
- Geocoding et directions API

## 📈 État du Projet

### ✅ Complété

- Structure complète du projet
- Backend API avec TypeScript et MongoDB
- CMS Web avec React et Material-UI
- Modèles de données complets
- Configuration de déploiement
- Scripts d'initialisation des données
- Documentation complète

### 🔄 Prochaines Étapes

1. **Finaliser l'authentification Firebase**
2. **Implémenter l'upload de fichiers**
3. **Créer l'interface mobile**
4. **Ajouter la fonctionnalité Mapbox**
5. **Tests et déploiement**

## 🚀 Démarrage Rapide

```bash
# 1. Configurer le backend
cd backend-api
cp .env.example .env
# Éditer le fichier .env avec vos configurations
npm install
npm run build
npm run seed  # Initialiser les données d'exemple

# 2. Démarrer le backend
npm run dev

# 3. Configurer le CMS (nouveau terminal)
cd ../cms-web
cp .env.example .env
# Éditer le fichier .env
npm install
npm start

# 4. L'application sera accessible sur:
# - Backend API: http://localhost:5000
# - CMS Web: http://localhost:3000
```

## 📞 Contact

- **Email**: contact@cotedivoire-audioguide.com
- **Website**: https://cotedivoire-audioguide.netlify.app
- **API**: https://cotedivoire-api.render.com

---

*Développé avec ❤️ pour promouvoir le tourisme en Côte d'Ivoire*
