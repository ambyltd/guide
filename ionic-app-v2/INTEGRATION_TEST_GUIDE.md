# Guide de Test d'Intégration - Sprint 3 Complet

## 📋 Vue d'ensemble

Ce guide permet de tester **toutes les intégrations** des 5 phases du Sprint 3 :
- ✅ Phase 1 : Geofencing (notifications proximité)
- ✅ Phase 2 : Service Worker (offline mode)
- ✅ Phase 3 : Cache Images (compression + lazy loading)
- ✅ Phase 4 : Cache Audio (IndexedDB + offline playback)
- ✅ Phase 5 : Background Sync (retry + network detection)

---

## 🔧 Configuration Préalable

### 1. Backend API (Port 5000)
```powershell
# Terminal 1 - Backend
cd C:\Users\jpama\Desktop\i\audioguide\backend-api
npm run dev
```

**Vérification** :
- Ouvrir : http://localhost:5000/api/health
- Attendu : `{"status":"ok","message":"API is running"}`

### 2. Frontend Ionic (Port 5173)
```powershell
# Terminal 2 - Frontend
cd C:\Users\jpama\Desktop\i\audioguide\ionic-app-v2
npm run dev
```

**Vérification** :
- Ouvrir : http://localhost:5173/
- Attendu : Page Home avec hero et attractions

### 3. DevTools Chrome
- Ouvrir : http://localhost:5173/
- F12 → Console (vérifier logs)
- Application tab (vérifier Service Worker)
- Network tab (vérifier requests)

---

## 🧪 Tests d'Intégration par Phase

### Phase 3 : Cache Images (Home.tsx)

#### Test 3.1 : Précachage automatique des images
1. Recharger la page Home (Ctrl+R)
2. Ouvrir Console DevTools
3. **Attendu** :
```
[ImageCache] Précachage de 15 images avec priorité high
[ImageCache] Précachage: 1/15 images
[ImageCache] Précachage: 2/15 images
...
[ImageCache] Précachage: 15/15 images
[ImageCache] Précachage terminé en X.Xs
```

#### Test 3.2 : Stats cache images
1. Console DevTools : `await imageCacheService.getStats()`
2. **Attendu** :
```javascript
{
  totalImages: 15,
  totalSize: 12458752, // ~12 MB
  compressedCount: 15,
  averageCompressionRatio: 0.65,
  oldestImage: 1728662400000,
  newestImage: 1728662450000
}
```

#### Test 3.3 : Lazy loading
1. Scroller lentement la page Home
2. Ouvrir Network tab → Filter "images"
3. **Attendu** : Images chargées **seulement** quand visibles (IntersectionObserver)

#### Test 3.4 : Compression Canvas API
1. Console : `imageCacheService.getStats().then(s => console.log('Ratio:', s.averageCompressionRatio))`
2. **Attendu** : Ratio entre 0.5 et 0.8 (50-80% de la taille originale)

---

### Phase 4 : Cache Audio (AttractionDetail.tsx)

#### Test 4.1 : Téléchargement audio avec progress
1. Aller sur AttractionDetail (cliquer une attraction)
2. Cliquer bouton "📥 Télécharger" sur un audioguide
3. **Attendu** :
   - Progress bar de 0% → 100%
   - Badge "Téléchargé ✓" apparaît
   - Console : logs de progression (speed, timeRemaining)

#### Test 4.2 : Lecture audio offline
1. Télécharger 1 audioguide (attendre 100%)
2. DevTools → Network tab → **Offline mode** (cocher)
3. Recharger la page (Ctrl+R)
4. Cliquer "▶️ Écouter maintenant" sur l'audioguide téléchargé
5. **Attendu** : Audio se lance (depuis IndexedDB, pas de requête réseau)

#### Test 4.3 : Stats cache audio
1. Console DevTools :
```javascript
await audioCacheService.getStats()
```
2. **Attendu** :
```javascript
{
  totalAudios: 5,
  totalSize: 45678912, // ~45 MB
  totalDuration: 1850, // 30 min 50s
  availableSpace: 54321088, // ~54 MB restants
  cacheUsagePercent: 45.7
}
```

#### Test 4.4 : Queue de téléchargement
1. Cliquer rapidement "Télécharger" sur 5 audioguides
2. Console → Vérifier logs de queue
3. **Attendu** : Téléchargements **séquentiels** (un par un, delay 500ms entre chaque)

---

### Phase 5 : Background Sync (Home.tsx + Favorites.tsx)

#### Test 5.1 : Ajout favori online
1. **Online mode** (Network tab : Online)
2. Page Home → Cliquer ❤️ sur une attraction
3. Console DevTools
4. **Attendu** :
```
[BackgroundSync] addFavorite: attr123 pour user456
[BackgroundSync] Sync: 1 items en queue
[BackgroundSync] POST /api/favorites - SUCCESS
[BackgroundSync] Queue vide après sync
```

#### Test 5.2 : Ajout favori offline → sync auto
1. **Offline mode** (Network tab : Offline)
2. Cliquer ❤️ sur 3 attractions
3. Console :
```
[BackgroundSync] addFavorite - MODE OFFLINE
[BackgroundSync] Queue: 3 items en attente
```
4. **Retour online** (Network tab : Online)
5. Attendre 5-10 secondes
6. Console :
```
[BackgroundSync] Network status: online - Déclenchement sync auto
[BackgroundSync] Sync: 3 items
[BackgroundSync] POST /api/favorites - SUCCESS (x3)
[BackgroundSync] Queue vide
```

#### Test 5.3 : Retry avec exponential backoff
1. Backend **arrêté** (npm stop dans Terminal 1)
2. Online mode → Cliquer ❤️ sur 1 attraction
3. Console :
```
[BackgroundSync] POST /api/favorites - FAILED (attempt 1/5)
[BackgroundSync] Retry in 1s (exponential backoff)
[BackgroundSync] POST /api/favorites - FAILED (attempt 2/5)
[BackgroundSync] Retry in 2s
[BackgroundSync] POST /api/favorites - FAILED (attempt 3/5)
[BackgroundSync] Retry in 4s
...
```
4. Redémarrer backend (npm run dev)
5. Attendre sync auto
6. **Attendu** : Sync réussit après redémarrage

#### Test 5.4 : Stats sync queue
1. Mode offline → Ajouter 5 favoris, 2 reviews
2. Console :
```javascript
await backgroundSyncService.getStats()
```
3. **Attendu** :
```javascript
{
  totalPending: 7,
  byType: {
    favorite: 5,
    review: 2
  },
  oldestItem: 1728662400000,
  isOnline: false
}
```

---

## 🔄 Test d'Intégration Complet (Scénario End-to-End)

### Scénario : "Utilisateur prépare son voyage offline"

#### Étape 1 : Précachage (Online)
1. Backend + Frontend lancés
2. Ouvrir Home → Attendre précachage images (15/15)
3. Ouvrir 5 AttractionDetail → Télécharger 10 audioguides
4. Attendre tous les downloads (100%)

#### Étape 2 : Mode Offline
1. DevTools → Network tab → **Offline**
2. Recharger app (Ctrl+R)
3. Vérifier Home : Images visibles ✅
4. Vérifier AttractionDetail : Audios jouables ✅

#### Étape 3 : Actions Offline
1. Ajouter 5 favoris ❤️
2. Ajouter 2 reviews ⭐
3. Console → Vérifier queue : 7 items

#### Étape 4 : Retour Online + Auto-sync
1. Network tab → **Online**
2. Attendre 10s (periodic sync 30s)
3. Console → Vérifier :
```
[BackgroundSync] Network online → Auto sync
[BackgroundSync] Sync: 7 items
[BackgroundSync] Tous les items synchronisés ✅
```

#### Étape 5 : Vérification Backend
1. Ouvrir : http://localhost:5000/api/favorites (devrait avoir 5 favoris)
2. Ouvrir : http://localhost:5000/api/reviews (devrait avoir 2 reviews)

---

## 📊 Métriques de Performance

### Build Production
```bash
npm run build
```

**Attendu** :
- Temps : 35-45s
- Errors : 0
- Service Worker : ✅ Généré
- Precache : 19 fichiers (~3.3 MB)

### Bundle Size
- `index.js` : ~568 KB (gzip: ~153 KB)
- `vendor-ionic.js` : ~766 KB (gzip: ~154 KB)
- `vendor-mapbox.js` : ~1612 KB (gzip: ~435 KB) ⚠️
- Total : ~3 MB (gzip: ~742 KB)

### Lighthouse Scores (Cible)
- Performance : >85
- Accessibility : >90
- Best Practices : >90
- SEO : >90

---

## 🐛 Debugging

### Console Logs Utiles

```javascript
// 1. Vérifier API Config
import { logApiConfig } from './config/apiConfig';
logApiConfig();

// 2. Stats cache images
import { imageCacheService } from './services/imageCacheService';
await imageCacheService.getStats();

// 3. Stats cache audio
import { audioCacheService } from './services/audioCacheService';
await audioCacheService.getStats();

// 4. Stats background sync
import { backgroundSyncService } from './services/backgroundSyncService';
backgroundSyncService.getStats();

// 5. Forcer sync manuel
await backgroundSyncService.sync();

// 6. Vider cache images
await imageCacheService.clearAllCache();

// 7. Vider cache audio
await audioCacheService.clearAllCache();
```

### Service Worker Debug
1. DevTools → Application tab
2. Service Workers → Cliquer "Update"
3. Storage → Cache Storage → Vérifier caches
4. IndexedDB → audioguide_cache → Vérifier audios

---

## ✅ Checklist de Validation

### Intégration Phase 3 (Images)
- [ ] Précachage auto au chargement Home
- [ ] Compression Canvas API (ratio 0.5-0.8)
- [ ] Lazy loading avec IntersectionObserver
- [ ] Stats cache accessibles
- [ ] Cleanup auto >30 jours

### Intégration Phase 4 (Audio)
- [ ] Téléchargement avec progress bar
- [ ] Badges "Téléchargé ✓" visibles
- [ ] Lecture offline depuis IndexedDB
- [ ] Queue séquentielle fonctionnelle
- [ ] Stats cache audio accessibles

### Intégration Phase 5 (Sync)
- [ ] Favoris online → sync immédiat
- [ ] Favoris offline → queue persistante
- [ ] Auto-sync au retour online
- [ ] Exponential backoff sur erreur
- [ ] Stats queue accessibles

### Build & Deploy
- [ ] `npm run build` : 0 errors
- [ ] Service Worker généré
- [ ] Precache 19 fichiers
- [ ] Bundle size <5 MB
- [ ] Lighthouse >85

---

## 🚀 Prochaines Étapes

### Tests Device Android
1. **Configuration backend** :
   - Exécuter `allow-port-5000.ps1` (firewall)
   - IP PC : 192.168.1.9
   - Tester : http://192.168.1.9:5000/api/health

2. **Installation app** :
   - Android Studio → Open `android/`
   - Clean + Rebuild Project
   - Run 'app' sur device USB

3. **Tests device** :
   - Geofencing avec Fake GPS
   - Cache images/audio en mode avion
   - Background sync online/offline

### Backend API Endpoints (TODO)
- `POST /api/favorites` (addFavorite)
- `DELETE /api/favorites/:id` (removeFavorite)
- `GET /api/favorites/:userId` (getFavorites)
- `POST /api/reviews` (addReview)
- `GET /api/reviews/:attractionId` (getReviews)
- `POST /api/ratings` (addRating)
- `PATCH /api/users/:id/stats` (updateStats)

---

## 📝 Notes Importantes

1. **Service Worker** : Fonctionne uniquement en mode web (http://localhost:5173), pas sur device natif
2. **IndexedDB** : Quota ~100 MB sur mobile, illimité sur desktop
3. **Capacitor Filesystem** : Storage natif pour images (200 MB max)
4. **Network Listener** : Capacitor Network sur device, navigator.onLine sur web
5. **Background Sync** : Queue persistante dans localStorage (survit au reload)

---

## 📞 Support

En cas de problème :
1. Vérifier console DevTools (erreurs JS)
2. Vérifier Network tab (requêtes API)
3. Vérifier Application tab (Service Worker, Cache, IndexedDB)
4. Consulter guides :
   - `SPRINT3_RAPPORT_FINAL.md` (Phases 1-2)
   - `SPRINT3_PHASES_3_4_5_GUIDE.md` (Phases 3-5)
   - `INSTALLATION_ANDROID_GUIDE.md` (Device setup)

---

**Date de création** : 11 octobre 2025  
**Version** : 1.0.0  
**Sprint** : 3 (Géolocalisation & Offline)  
**Status** : ✅ Toutes les phases complétées et intégrées
