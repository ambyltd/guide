# 🚀 SPRINT 3 - PHASES 3, 4 & 5 - GUIDE COMPLET

## Date : 11 octobre 2025

---

## ✅ PHASE 3 : CACHE INTELLIGENT DES IMAGES

### Fichier Créé
**`src/services/imageCacheService.ts`** (600+ lignes)

### Fonctionnalités Implémentées

#### 1. Téléchargement et Cache
- ✅ Téléchargement images avec progress callback
- ✅ Stockage sur Filesystem (Capacitor natif)
- ✅ Fallback localStorage pour web
- ✅ Queue de téléchargement avec priorités (high/medium/low)

#### 2. Compression Automatique
- ✅ Canvas API pour redimensionnement
- ✅ Max dimensions : 1920x1080
- ✅ Qualité JPEG : 0.8 (80%)
- ✅ Logs compression avant/après

#### 3. Lazy Loading
- ✅ IntersectionObserver avec rootMargin: 50px
- ✅ Chargement juste avant affichage
- ✅ Unobserve automatique après chargement

#### 4. Nettoyage Automatique
- ✅ Suppression images > 30 jours
- ✅ Nettoyage si cache > 200 MB
- ✅ Conservation priorité "high"
- ✅ Tri par lastAccessedAt

#### 5. Statistiques
- ✅ Total images cached
- ✅ Taille totale et par priorité
- ✅ Images compressées vs non compressées
- ✅ Formatage taille en KB/MB/GB

### API Principale

```typescript
import { imageCacheService } from './services/imageCacheService';

// Initialiser (auto au démarrage)
await imageCacheService.initialize();

// Cacher une image avec progress
await imageCacheService.cacheImage(
  'https://example.com/image.jpg',
  'high', // priority
  true,   // compress
  (progress) => {
    console.log(`${progress.percentage}%`);
  }
);

// Précharger plusieurs images
await imageCacheService.precacheImages(
  ['url1.jpg', 'url2.jpg'],
  'high',
  (current, total) => console.log(`${current}/${total}`)
);

// Obtenir image (cached ou télécharger)
const imageUrl = await imageCacheService.getImage('url.jpg');

// Lazy loading avec IntersectionObserver
const observer = imageCacheService.createLazyLoader((entry) => {
  const img = entry.target as HTMLImageElement;
  const url = img.dataset.src;
  if (url) {
    imageCacheService.getImage(url).then(cachedUrl => {
      img.src = cachedUrl;
    });
  }
});
observer.observe(imageElement);

// Statistiques
const stats = await imageCacheService.getStats();
console.log(`${stats.totalImages} images, ${imageCacheService.formatBytes(stats.totalSize)}`);

// Vider cache
await imageCacheService.clearCache();
```

### Configuration
```typescript
const CACHE_DIR = 'images_cache';
const MAX_CACHE_SIZE = 200 * 1024 * 1024; // 200 MB
const MAX_AGE_DAYS = 30;
const COMPRESSION_QUALITY = 0.8;
const MAX_IMAGE_WIDTH = 1920;
const MAX_IMAGE_HEIGHT = 1080;
```

---

## ✅ PHASE 4 : CACHE AUDIO (INDEXEDDB)

### Fichier Créé
**`src/services/audioCacheService.ts`** (600+ lignes)

### Fonctionnalités Implémentées

#### 1. Stockage IndexedDB
- ✅ Database : `audioguide_cache`
- ✅ Object Store : `audios` avec keyPath: 'id'
- ✅ Index : attractionId, language, downloadedAt, lastPlayedAt
- ✅ Stockage Blob audio (quota ~100 MB)

#### 2. Téléchargement avec Progress
- ✅ Fetch avec AbortController
- ✅ Progress callback détaillé (loaded, total, percentage, speed, timeRemaining)
- ✅ Chunked reading avec Reader
- ✅ Calcul vitesse (bytes/sec)

#### 3. File d'Attente
- ✅ Queue avec priorités (high/medium/low)
- ✅ Tri automatique par priorité
- ✅ Traitement séquentiel (500ms entre downloads)
- ✅ Annulation en cours (AbortController)

#### 4. Mode Offline
- ✅ Object URL depuis Blob
- ✅ Fallback streaming si pas en cache
- ✅ Détection automatique cached/streaming
- ✅ Mise à jour lastPlayedAt à chaque lecture

#### 5. Gestion Cache
- ✅ Nettoyage automatique (quota 70%)
- ✅ Tri par lastPlayedAt
- ✅ Conservation priorité "high"
- ✅ Vider cache complet

### API Principale

```typescript
import { audioCacheService } from './services/audioCacheService';

// Télécharger un audio avec progress
await audioCacheService.downloadAudio(
  'audio123',
  'https://example.com/audio.mp3',
  'attraction456',
  'fr',
  'high',
  (progress) => {
    console.log(`${progress.percentage.toFixed(1)}%`);
    console.log(`Speed: ${audioCacheService.formatBytes(progress.speed)}/s`);
    console.log(`Remaining: ${progress.timeRemaining.toFixed(0)}s`);
  }
);

// Ajouter à la file d'attente
audioCacheService.addToQueue({
  audioId: 'audio123',
  url: 'https://example.com/audio.mp3',
  attractionId: 'attraction456',
  language: 'fr',
  priority: 'medium',
});

// Obtenir URL pour lecture
const audioUrl = await audioCacheService.getAudioUrl('audio123', 'fallback-url.mp3');
const audio = new Audio(audioUrl);
audio.play();

// Vérifier si téléchargé
const isDownloaded = await audioCacheService.isDownloaded('audio123');

// Annuler téléchargement
audioCacheService.cancelDownload('audio123');

// Obtenir audios d'une attraction
const audios = await audioCacheService.getAudiosByAttraction('attraction456');

// Statistiques
const stats = await audioCacheService.getStats();
console.log(`${stats.totalAudios} audios, ${audioCacheService.formatBytes(stats.totalSize)}`);
console.log(`Used: ${stats.usedPercentage.toFixed(1)}%`);

// Vider cache
await audioCacheService.clearCache();
```

### Configuration
```typescript
const DB_NAME = 'audioguide_cache';
const DB_VERSION = 1;
const STORE_NAME = 'audios';
const MAX_CACHE_SIZE = 100 * 1024 * 1024; // 100 MB
```

---

## ✅ PHASE 5 : BACKGROUND SYNC

### Fichier Créé
**`src/services/backgroundSyncService.ts`** (600+ lignes)

### Fonctionnalités Implémentées

#### 1. File de Synchronisation
- ✅ localStorage persistence (`backgroundSyncQueue`)
- ✅ 5 types : favorite, unfavorite, review, rating, stats
- ✅ Priorités : high/medium/low
- ✅ Tri automatique par priorité

#### 2. Détection Réseau
- ✅ Capacitor Network plugin
- ✅ Event listener `networkStatusChange`
- ✅ Auto-sync au retour online
- ✅ Fallback `navigator.onLine`

#### 3. Retry avec Exponential Backoff
- ✅ Max 5 tentatives
- ✅ Délai initial : 1 seconde
- ✅ Délai max : 1 minute
- ✅ Formule : delay = 1000 * 2^attempts

#### 4. Synchronisation Périodique
- ✅ Interval : 30 secondes
- ✅ Condition : online + queue non vide + pas de sync en cours
- ✅ Stop/start automatique

#### 5. API Endpoints (TODO)
- ⏳ POST /favorites (à implémenter backend)
- ⏳ DELETE /favorites/:id
- ⏳ POST /reviews
- ⏳ POST /ratings
- ⏳ PATCH /users/:id/stats

### API Principale

```typescript
import { backgroundSyncService } from './services/backgroundSyncService';

// Ajouter favori (sync auto si online)
await backgroundSyncService.addFavorite('attraction123', 'user456');

// Retirer favori
await backgroundSyncService.removeFavorite('attraction123', 'user456');

// Ajouter review
await backgroundSyncService.addReview(
  'attraction123',
  'user456',
  5, // rating
  'Excellent !' // comment
);

// Ajouter note
await backgroundSyncService.addRating('attraction123', 'user456', 4);

// Ajouter statistiques
await backgroundSyncService.addStats('user456', {
  audioPlayed: 10,
  attractionsVisited: 5,
  totalPlayTime: 3600,
});

// Synchroniser manuellement
const results = await backgroundSyncService.sync();
console.log(`Synced ${results.length} items`);

// Statistiques
const stats = backgroundSyncService.getStats();
console.log(`Pending: ${stats.totalPending}`);
console.log(`By type:`, stats.byType);
console.log(`Failed attempts: ${stats.failedAttempts}`);

// Vider la queue
backgroundSyncService.clearQueue();

// Retirer un élément
backgroundSyncService.removeItem('favorite_123_1234567890');
```

### Configuration
```typescript
const SYNC_QUEUE_KEY = 'backgroundSyncQueue';
const MAX_RETRY_ATTEMPTS = 5;
const INITIAL_RETRY_DELAY = 1000; // 1 seconde
const MAX_RETRY_DELAY = 60000; // 1 minute
const SYNC_INTERVAL = 30000; // 30 secondes
```

---

## 📊 INTÉGRATION DANS L'APP

### 1. Initialisation (App.tsx)

```typescript
import { imageCacheService } from './services/imageCacheService';
import { audioCacheService } from './services/audioCacheService';
import { backgroundSyncService } from './services/backgroundSyncService';

useEffect(() => {
  // Services auto-initialisés au démarrage
  console.log('✅ Cache services initialized');
}, []);
```

### 2. Utilisation dans Home.tsx

```typescript
// Précharger images prioritaires
useEffect(() => {
  const imageUrls = attractions.map(a => a.imageUrl);
  imageCacheService.precacheImages(imageUrls, 'high');
}, [attractions]);

// Lazy loading images
const imageRef = useRef<HTMLImageElement>(null);
useEffect(() => {
  if (imageRef.current) {
    const observer = imageCacheService.createLazyLoader((entry) => {
      const img = entry.target as HTMLImageElement;
      const url = img.dataset.src;
      if (url) {
        imageCacheService.getImage(url).then(cachedUrl => {
          img.src = cachedUrl;
        });
      }
    });
    observer.observe(imageRef.current);
    return () => observer.disconnect();
  }
}, []);
```

### 3. Utilisation dans AttractionDetail.tsx

```typescript
// Télécharger audio
const [downloadProgress, setDownloadProgress] = useState(0);

const handleDownloadAudio = async (audioId: string, url: string) => {
  await audioCacheService.downloadAudio(
    audioId,
    url,
    attractionId,
    'fr',
    'high',
    (progress) => setDownloadProgress(progress.percentage)
  );
};

// Vérifier si audio téléchargé
const [isDownloaded, setIsDownloaded] = useState(false);
useEffect(() => {
  audioCacheService.isDownloaded(audioId).then(setIsDownloaded);
}, [audioId]);

// Lecture audio
const playAudio = async () => {
  const audioUrl = await audioCacheService.getAudioUrl(audioId, originalUrl);
  const audio = new Audio(audioUrl);
  audio.play();
};
```

### 4. Utilisation dans Favorites.tsx

```typescript
// Ajouter favori (sync background)
const handleAddFavorite = async (attractionId: string) => {
  // Mise à jour locale immédiate
  setFavorites([...favorites, attractionId]);
  localStorage.setItem('favorites', JSON.stringify([...favorites, attractionId]));
  
  // Sync background
  await backgroundSyncService.addFavorite(attractionId, userId);
};

// Retirer favori
const handleRemoveFavorite = async (attractionId: string) => {
  const updated = favorites.filter(id => id !== attractionId);
  setFavorites(updated);
  localStorage.setItem('favorites', JSON.stringify(updated));
  
  await backgroundSyncService.removeFavorite(attractionId, userId);
};
```

### 5. Statistiques dans Profile.tsx

```typescript
// Statistiques cache
const [cacheStats, setCacheStats] = useState({
  images: { totalImages: 0, totalSize: 0 },
  audios: { totalAudios: 0, totalSize: 0 },
  sync: { totalPending: 0, byType: {} },
});

useEffect(() => {
  Promise.all([
    imageCacheService.getStats(),
    audioCacheService.getStats(),
  ]).then(([images, audios]) => {
    setCacheStats({
      images,
      audios,
      sync: backgroundSyncService.getStats(),
    });
  });
}, []);

// UI
<IonCard>
  <IonCardHeader>Cache Images</IonCardHeader>
  <IonCardContent>
    {cacheStats.images.totalImages} images
    ({imageCacheService.formatBytes(cacheStats.images.totalSize)})
  </IonCardContent>
</IonCard>

<IonCard>
  <IonCardHeader>Cache Audio</IonCardHeader>
  <IonCardContent>
    {cacheStats.audios.totalAudios} audios
    ({audioCacheService.formatBytes(cacheStats.audios.totalSize)})
    <IonProgressBar value={cacheStats.audios.usedPercentage / 100} />
  </IonCardContent>
</IonCard>

<IonCard>
  <IonCardHeader>Synchronisation</IonCardHeader>
  <IonCardContent>
    {cacheStats.sync.totalPending} en attente
  </IonCardContent>
</IonCard>
```

---

## 🧪 TESTS

### Test Phase 3 : Images

```typescript
// Test téléchargement
const url = 'https://picsum.photos/800/600';
await imageCacheService.cacheImage(url, 'high', true, (progress) => {
  console.log(`Progress: ${progress.percentage.toFixed(1)}%`);
});

// Test lazy loading
const img = document.createElement('img');
img.dataset.src = url;
const observer = imageCacheService.createLazyLoader((entry) => {
  const img = entry.target as HTMLImageElement;
  imageCacheService.getImage(img.dataset.src!).then(cachedUrl => {
    img.src = cachedUrl;
  });
});
observer.observe(img);

// Test stats
const stats = await imageCacheService.getStats();
console.log('Image Cache Stats:', stats);
```

### Test Phase 4 : Audio

```typescript
// Test téléchargement
const audioUrl = 'https://example.com/audio.mp3';
await audioCacheService.downloadAudio(
  'test-audio',
  audioUrl,
  'test-attraction',
  'fr',
  'high',
  (progress) => {
    console.log(`${progress.percentage.toFixed(1)}% - ${progress.speed} bytes/s - ${progress.timeRemaining}s remaining`);
  }
);

// Test lecture
const url = await audioCacheService.getAudioUrl('test-audio', audioUrl);
const audio = new Audio(url);
audio.play();

// Test stats
const stats = await audioCacheService.getStats();
console.log('Audio Cache Stats:', stats);
```

### Test Phase 5 : Background Sync

```typescript
// Test ajout favori
await backgroundSyncService.addFavorite('attraction123', 'user456');

// Test ajout review
await backgroundSyncService.addReview('attraction123', 'user456', 5, 'Excellent !');

// Simuler offline
window.dispatchEvent(new Event('offline'));
console.log('Offline mode');

// Ajouter items pendant offline
await backgroundSyncService.addRating('attraction456', 'user456', 4);

// Check queue
const stats = backgroundSyncService.getStats();
console.log('Sync Queue:', stats);

// Simuler retour online
window.dispatchEvent(new Event('online'));
// Auto-sync se déclenche

// Sync manuel
const results = await backgroundSyncService.sync();
console.log('Sync Results:', results);
```

---

## 📚 DOCUMENTATION TECHNIQUE

### Architecture Générale

```
ionic-app-v2/
├── src/
│   ├── config/
│   │   └── apiConfig.ts (✅ API configuration dynamique)
│   ├── services/
│   │   ├── imageCacheService.ts (✅ Phase 3)
│   │   ├── audioCacheService.ts (✅ Phase 4)
│   │   ├── backgroundSyncService.ts (✅ Phase 5)
│   │   ├── apiClient.ts (✅ Updated avec apiConfig)
│   │   ├── serviceWorkerService.ts (Phase 2)
│   │   └── geolocationService.ts (Phase 1)
│   └── ...
```

### Dépendances Utilisées

- **Capacitor Filesystem** : Stockage images (natif)
- **Capacitor Network** : Détection online/offline
- **IndexedDB API** : Stockage audios (web + natif)
- **Canvas API** : Compression images
- **IntersectionObserver** : Lazy loading images
- **Fetch API** : Téléchargements avec progress

---

## 🎯 TODO BACKEND

### Endpoints à Implémenter

```typescript
// Favorites
POST   /api/favorites           { attractionId, userId }
DELETE /api/favorites/:id       { userId }
GET    /api/favorites/:userId

// Reviews
POST   /api/reviews             { attractionId, userId, rating, comment }
GET    /api/reviews/:attractionId

// Ratings
POST   /api/ratings             { attractionId, userId, rating }
GET    /api/ratings/:attractionId

// User Stats
PATCH  /api/users/:id/stats     { audioPlayed, attractionsVisited, totalPlayTime, ... }
GET    /api/users/:id/stats
```

### Modèles MongoDB

```typescript
// Favorite
{
  _id: ObjectId,
  userId: String,
  attractionId: String,
  createdAt: Date
}

// Review
{
  _id: ObjectId,
  userId: String,
  attractionId: String,
  rating: Number (1-5),
  comment: String,
  createdAt: Date,
  updatedAt: Date
}

// UserStats
{
  _id: ObjectId,
  userId: String,
  audioPlayed: Number,
  attractionsVisited: Number,
  totalPlayTime: Number (seconds),
  favoritesCount: Number,
  reviewsCount: Number,
  lastActive: Date
}
```

---

## 📊 MÉTRIQUES PHASES 3, 4 & 5

### Code Produit
- **Phase 3 (Images)** : 600+ lignes
- **Phase 4 (Audio)** : 600+ lignes
- **Phase 5 (Background Sync)** : 600+ lignes
- **API Config** : 200+ lignes
- **Total** : 2000+ lignes

### Fichiers Créés
- `src/config/apiConfig.ts`
- `src/services/imageCacheService.ts`
- `src/services/audioCacheService.ts`
- `src/services/backgroundSyncService.ts`
- **Total** : 4 fichiers

### Fonctionnalités
- **Phase 3** : 5 features (download, compress, lazy load, cleanup, stats)
- **Phase 4** : 5 features (IndexedDB, download, queue, offline, cleanup)
- **Phase 5** : 5 features (queue, retry, network, periodic, stats)
- **Total** : 15 features

---

## ✅ PROCHAINES ÉTAPES

### 1. Configuration Backend (URGENT)
- [ ] Exécuter `allow-port-5000.ps1` en Admin
- [ ] Vérifier IP : `ipconfig` (192.168.1.9)
- [ ] Lancer backend : `npm run dev`
- [ ] Tester health check depuis device

### 2. Installation Android
- [ ] Ouvrir Android Studio
- [ ] Clean + Rebuild Project
- [ ] Run 'app' sur device

### 3. Tests Device
- [ ] Backend connectivity
- [ ] Geofencing (Phase 1)
- [ ] Service Worker web (Phase 2)
- [ ] Cache images (Phase 3)
- [ ] Cache audio (Phase 4)
- [ ] Background sync (Phase 5)

### 4. Implémentation Backend API
- [ ] Endpoints favorites
- [ ] Endpoints reviews
- [ ] Endpoints ratings
- [ ] Endpoints user stats
- [ ] Tests API

---

🎉 **SPRINT 3 PHASES 3, 4 & 5 : CODE COMPLÉTÉ !**
✅ **2000+ lignes produites**
✅ **15 fonctionnalités implémentées**
🚀 **Prêt pour intégration et tests !**
