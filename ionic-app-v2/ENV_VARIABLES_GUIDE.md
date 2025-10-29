# 🔐 VARIABLES D'ENVIRONNEMENT - GUIDE COMPLET

## 📋 Fichiers de Configuration

### Structure
```
ionic-app-v2/
├── .env                  # Développement local (Git ignoré)
├── .env.production       # Production (Git ignoré)
└── .env.example          # Template avec documentation (Git tracké)
```

### Commande pour créer vos fichiers
```bash
# Copier le template vers .env
cp .env.example .env

# Éditer avec vos credentials
nano .env  # ou code .env
```

---

## 🌍 Variables d'Environnement Disponibles

### 1. **Application Configuration**

```bash
VITE_APP_NAME="Côte d'Ivoire Audio Guide"
VITE_APP_VERSION=1.2.0
VITE_APP_ENVIRONMENT=development  # ou 'production'
```

**Usage**:
```typescript
const appName = import.meta.env.VITE_APP_NAME;
const version = import.meta.env.VITE_APP_VERSION;
const isProduction = import.meta.env.VITE_APP_ENVIRONMENT === 'production';
```

---

### 2. **Debug Configuration**

```bash
VITE_DEBUG_MODE=true              # Activer logs détaillés
VITE_LOG_LEVEL=debug              # debug | info | warn | error
```

**Usage**:
```typescript
if (import.meta.env.VITE_DEBUG_MODE === 'true') {
  console.log('🐛 Debug mode activé');
}
```

---

### 3. **Backend API Configuration**

```bash
VITE_API_URL=https://audio-guide-w8ww.onrender.com/api
```

**Usage** (dans `mapService.ts`, `apiClient.ts`):
```typescript
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

// Exemple appel API
const response = await axios.get(`${API_URL}/attractions`);
```

**Valeurs possibles**:
- Development: `http://localhost:5000/api`
- Production: `https://audio-guide-w8ww.onrender.com/api`
- Local Network: `http://192.168.1.9:5000/api`

---

### 4. **Firebase Authentication**

```bash
VITE_FIREBASE_API_KEY=AIzaSyAWlPL4AOQYx59-cvXssikVouXCw4ryCXc
VITE_FIREBASE_AUTH_DOMAIN=ambyl-fr.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=ambyl-fr
VITE_FIREBASE_STORAGE_BUCKET=ambyl-fr.firebasestorage.app
VITE_FIREBASE_MESSAGING_SENDER_ID=283024094411
VITE_FIREBASE_APP_ID=1:283024094411:web:1ce3f672c4e1cc8aa5974e
```

**Usage** (dans `firebase.ts`):
```typescript
import { initializeApp } from 'firebase/app';

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
};

export const app = initializeApp(firebaseConfig);
```

**Obtenir vos credentials**:
1. Aller sur https://console.firebase.google.com/
2. Sélectionner votre projet
3. Paramètres projet → Ajouter une app Web
4. Copier les credentials

---

### 5. **Map Configuration - OpenStreetMap (Leaflet)**

```bash
VITE_MAP_PROVIDER=openstreetmap
VITE_OSM_TILE_URL=https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png
VITE_OSM_ATTRIBUTION=&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors
```

**Caractéristiques**:
- ✅ **Gratuit** (pas de token requis)
- ✅ **Open source**
- ✅ **Pas de quota**
- ⚠️ Performance moyenne

**Usage** (ancienne page `Map.tsx` avec Leaflet):
```typescript
import { MapContainer, TileLayer } from 'react-leaflet';

<MapContainer center={[5.345, -4.0305]} zoom={12}>
  <TileLayer
    url={import.meta.env.VITE_OSM_TILE_URL}
    attribution={import.meta.env.VITE_OSM_ATTRIBUTION}
  />
</MapContainer>
```

---

### 6. **Map Configuration - Mapbox GL JS** ⭐ **NOUVELLE VERSION**

```bash
# Token public Mapbox (commence par "pk.")
VITE_MAPBOX_TOKEN=pk.eyJ1IjoiYW1ieWx0ZCIsImEiOiJjbTRnbXpvZWoxMWcyMmpzZjV1eHZhcjgyIn0.TQxW5dxm-eO7dI0yl5T5qQ

# Style de la carte
VITE_MAPBOX_STYLE=mapbox://styles/mapbox/streets-v12

# Position par défaut (Abidjan, Côte d'Ivoire)
VITE_MAP_DEFAULT_CENTER_LNG=-4.024429
VITE_MAP_DEFAULT_CENTER_LAT=5.345317
VITE_MAP_DEFAULT_ZOOM=12
```

**Caractéristiques**:
- ✅ **Performance excellente** (WebGL)
- ✅ **Design moderne**
- ✅ **3D buildings** disponible
- ⚠️ Token requis (50,000 vues/mois gratuites)

**Usage** (nouvelle page `MapRefactored.tsx`):
```typescript
// Dans useMapbox.ts
import mapboxgl from 'mapbox-gl';

mapboxgl.accessToken = import.meta.env.VITE_MAPBOX_TOKEN;

const map = new mapboxgl.Map({
  style: import.meta.env.VITE_MAPBOX_STYLE,
  center: [
    parseFloat(import.meta.env.VITE_MAP_DEFAULT_CENTER_LNG),
    parseFloat(import.meta.env.VITE_MAP_DEFAULT_CENTER_LAT)
  ],
  zoom: parseInt(import.meta.env.VITE_MAP_DEFAULT_ZOOM, 10)
});
```

**Obtenir un token Mapbox**:
1. Créer un compte sur https://account.mapbox.com/
2. Aller dans **Access Tokens**
3. Copier votre **Default public token** (commence par `pk.`)
4. Coller dans `VITE_MAPBOX_TOKEN`

**Styles disponibles**:
- `mapbox://styles/mapbox/streets-v12` (par défaut)
- `mapbox://styles/mapbox/outdoors-v12`
- `mapbox://styles/mapbox/light-v11`
- `mapbox://styles/mapbox/dark-v11`
- `mapbox://styles/mapbox/satellite-v9`
- `mapbox://styles/mapbox/satellite-streets-v12`

---

## 🔒 Sécurité

### ✅ Bonnes Pratiques

1. **Ne JAMAIS commit les fichiers .env**
```bash
# .gitignore (déjà configuré)
.env
.env.local
.env.production
```

2. **Utiliser .env.example pour la documentation**
```bash
# Remplacer les vraies valeurs par des placeholders
VITE_FIREBASE_API_KEY=your_api_key_here
VITE_MAPBOX_TOKEN=pk.your_token_here
```

3. **Variables publiques uniquement (VITE_)**
```bash
# ✅ Bon (VITE_ = exposé au frontend)
VITE_API_URL=https://api.example.com

# ❌ Mauvais (secret backend, ne pas mettre ici)
DATABASE_PASSWORD=secret123
```

4. **Tokens publics vs secrets**
```bash
# ✅ OK d'exposer (tokens publics)
VITE_MAPBOX_TOKEN=pk.xxxxxx  # Public token
VITE_FIREBASE_API_KEY=xxxxxx # Web API key

# ❌ NE PAS mettre ici (secrets backend)
FIREBASE_SERVICE_ACCOUNT_KEY=xxxx
MAPBOX_SECRET_TOKEN=sk.xxxx
```

---

## 🧪 Tests des Variables

### Test 1: Vérifier que les variables sont chargées

```typescript
// Dans n'importe quel fichier .tsx
console.log('🔍 Variables d\'environnement:');
console.log('API URL:', import.meta.env.VITE_API_URL);
console.log('Mapbox Token:', import.meta.env.VITE_MAPBOX_TOKEN ? '✅ Défini' : '❌ Manquant');
console.log('Mode:', import.meta.env.MODE); // 'development' ou 'production'
```

### Test 2: Vérifier token Mapbox valide

```typescript
// Dans MapRefactored.tsx ou useMapbox.ts
import mapboxgl from 'mapbox-gl';

mapboxgl.accessToken = import.meta.env.VITE_MAPBOX_TOKEN;

// Test de validation
if (!mapboxgl.accessToken || !mapboxgl.accessToken.startsWith('pk.')) {
  console.error('❌ Token Mapbox invalide ou manquant');
}
```

### Test 3: Vérifier API Backend accessible

```bash
# Dans terminal
curl https://audio-guide-w8ww.onrender.com/api/health

# Devrait retourner:
# {"success":true,"message":"API is running"}
```

---

## 🚀 Build Production

### Build avec .env.production

```bash
# Vite utilise automatiquement .env.production
npm run build

# Vérifier les variables injectées
grep -r "VITE_MAPBOX_TOKEN" dist/assets/*.js
# Devrait afficher le token (c'est normal, token public)
```

### Variables disponibles dans le build

```typescript
// dist/assets/index-*.js contient:
// - import.meta.env.VITE_MAPBOX_TOKEN
// - import.meta.env.VITE_API_URL
// - etc.

// Mode est automatiquement défini
import.meta.env.MODE === 'production' // true après build
```

---

## 🐛 Troubleshooting

### Problème 1: Variables undefined

**Symptôme**:
```typescript
console.log(import.meta.env.VITE_MAPBOX_TOKEN); // undefined
```

**Solutions**:
1. Vérifier que le nom commence par `VITE_`
2. Redémarrer le dev server (`npm run dev`)
3. Vérifier `.env` existe à la racine du projet
4. Pas d'espaces autour du `=`: `VITE_TOKEN=value` (pas `VITE_TOKEN = value`)

### Problème 2: Mapbox map ne s'affiche pas

**Symptôme**: Console error `Error: A valid Mapbox access token is required`

**Solutions**:
1. Vérifier token dans `.env`:
```bash
echo $VITE_MAPBOX_TOKEN  # Doit afficher pk.xxx
```
2. Token valide sur https://account.mapbox.com/
3. Token n'a pas expiré
4. Rebuild: `npm run build`

### Problème 3: Variables en production différentes de développement

**Solution**: Créer `.env.production` avec valeurs de production
```bash
# .env.production
VITE_API_URL=https://audio-guide-w8ww.onrender.com/api
VITE_DEBUG_MODE=false
VITE_LOG_LEVEL=error
```

---

## 📊 Variables par Environnement

| Variable | Development (.env) | Production (.env.production) |
|----------|-------------------|------------------------------|
| VITE_DEBUG_MODE | `true` | `false` |
| VITE_LOG_LEVEL | `debug` | `error` |
| VITE_API_URL | `http://localhost:5000/api` | `https://audio-guide-w8ww.onrender.com/api` |
| VITE_MAPBOX_TOKEN | Même token (public) | Même token (public) |

---

## ✅ Checklist Configuration

- [ ] Fichier `.env` créé à la racine `ionic-app-v2/`
- [ ] Toutes les variables `VITE_*` définies
- [ ] Token Mapbox valide (commence par `pk.`)
- [ ] Firebase credentials correctes
- [ ] `npm run dev` démarre sans erreurs
- [ ] Console logs affichent les variables
- [ ] Map Mapbox s'affiche correctement
- [ ] API Backend accessible (test curl)
- [ ] `.env` dans `.gitignore` (ne pas commit)
- [ ] `.env.example` à jour avec documentation

---

## 📚 Ressources

- **Vite Env Docs**: https://vitejs.dev/guide/env-and-mode.html
- **Mapbox Token**: https://account.mapbox.com/access-tokens/
- **Firebase Console**: https://console.firebase.google.com/
- **Backend API**: https://audio-guide-w8ww.onrender.com/api/health

---

**Dernière mise à jour**: 28 octobre 2025  
**Version app**: 1.2.0
