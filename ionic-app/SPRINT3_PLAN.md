# 🚀 Sprint 3 - Plan d'Implémentation
## Géolocalisation & Mode Offline

---

## 📋 État Actuel

### ✅ Déjà Implémenté
1. **Service de géolocalisation temps réel** (geolocationService.ts - 522 lignes)
   - ✅ Permissions Capacitor
   - ✅ getCurrentLocation() avec fallback Abidjan
   - ✅ watchPosition() pour tracking temps réel
   - ✅ Interface GeofenceRegion complète
   - ✅ Callbacks pour updates
   - ✅ Settings configurables

2. **Géolocalisation dans Map.tsx**
   - ✅ Fallback position Abidjan
   - ✅ Timeout 30s (pas 5s)
   - ✅ enableHighAccuracy = false
   - ✅ Marker utilisateur sur la carte

---

## 🎯 À Implémenter (Sprint 3)

### 1️⃣ Notifications de Proximité (Geofencing) ⏳

**Objectif** : Déclencher des notifications quand l'utilisateur entre/sort d'une zone d'attraction

**Fonctionnalités** :
- Créer des zones géographiques autour des attractions (radius configurable)
- Détecter entrée/sortie de zone
- Afficher notification native : "Vous êtes près de [Attraction]"
- Proposer d'ouvrir l'audioguide automatiquement
- Logger les visites pour analytics

**Fichiers à créer/modifier** :
- `src/services/notificationService.ts` (nouveau)
- `src/hooks/useGeofencing.ts` (nouveau hook React)
- Modifier `geolocationService.ts` pour intégrer notifications
- Modifier `Home.tsx` / `Map.tsx` pour activer geofencing

**Technologies** :
- `@capacitor/local-notifications`
- Calcul distance (haversine déjà présent)
- Background tracking

---

### 2️⃣ Service Worker pour Mode Offline Complet ⏳

**Objectif** : Application fonctionnelle sans connexion internet

**Fonctionnalités** :
- Intercepter requêtes réseau
- Cache stratégies :
  - Network First pour API (données fraîches)
  - Cache First pour assets statiques (images, CSS, JS)
  - Cache avec fallback pour audioguides
- Synchronisation en arrière-plan quand connexion revient
- Indicateur "Mode Hors Ligne" dans l'interface

**Fichiers à créer** :
- `public/service-worker.js` (Service Worker principal)
- `src/services/offlineService.ts` (Gestion cache)
- `src/hooks/useOnlineStatus.ts` (Hook pour détecter connexion)
- `src/components/OfflineBanner.tsx` (Bannière "Hors ligne")

**Technologies** :
- Workbox (library Google pour Service Workers)
- Cache API
- Background Sync API
- Network Information API

---

### 3️⃣ Cache Intelligent des Images et Audios ⏳

**Objectif** : Télécharger et stocker assets pour consultation offline

**Fonctionnalités** :
- **Images** :
  - Téléchargement automatique des images d'attractions consultées
  - Compression/optimisation avant mise en cache
  - Gestion taille cache (max 100 MB par exemple)
  - LRU (Least Recently Used) pour libérer espace
  
- **Audios** :
  - Bouton "Télécharger pour hors ligne" (déjà dans AudioPlayer)
  - Téléchargement en arrière-plan
  - Progression du téléchargement
  - Lecture depuis cache si disponible
  - Indicateur "Disponible hors ligne"

**Fichiers à créer/modifier** :
- `src/services/cacheService.ts` (Gestion cache générique)
- `src/services/imageCache.ts` (Cache images spécifique)
- `src/services/audioCache.ts` (Cache audios spécifique)
- Modifier `AudioPlayer.tsx` pour vraie mise en cache (actuellement simulé)
- Créer `src/components/DownloadManager.tsx` (Gestionnaire téléchargements)

**Technologies** :
- IndexedDB (stockage local large capacité)
- Capacitor Filesystem API
- Fetch API avec progress
- Blob Storage

---

### 4️⃣ Synchronisation Background des Données ⏳

**Objectif** : Synchroniser données quand connexion disponible

**Fonctionnalités** :
- **Queue de synchronisation** :
  - Favoris ajoutés/retirés
  - Reviews/commentaires créés
  - Analytics (visites, écoutes)
  - Bookmarks audio créés
  
- **Synchronisation bidirectionnelle** :
  - Upload données locales → serveur
  - Download nouvelles données serveur → local
  - Résolution conflits (last-write-wins)
  
- **Indicateurs UI** :
  - Badge "X éléments à synchroniser"
  - Bouton "Synchroniser maintenant"
  - Animation sync en cours
  - Toast "Synchronisation réussie"

**Fichiers à créer** :
- `src/services/syncService.ts` (Service de sync)
- `src/services/queueService.ts` (Queue persistante)
- `src/components/SyncStatus.tsx` (Composant statut sync)
- `src/hooks/useSyncQueue.ts` (Hook React pour sync)

**Technologies** :
- IndexedDB pour queue persistante
- Background Sync API
- Network Information API
- Retry logic avec exponential backoff

---

## 📅 Plan d'Action Recommandé

### Phase 1 : Notifications de Proximité (2-3h)
1. Installer `@capacitor/local-notifications`
2. Créer `notificationService.ts`
3. Créer `useGeofencing.ts` hook
4. Intégrer dans Map.tsx
5. Tester avec attractions fictives

### Phase 2 : Service Worker Basique (2h)
1. Installer Workbox
2. Créer `service-worker.js` basique
3. Créer `offlineService.ts`
4. Créer `useOnlineStatus.ts`
5. Créer `OfflineBanner.tsx`
6. Tester mode avion

### Phase 3 : Cache Images (1-2h)
1. Créer `cacheService.ts` générique
2. Créer `imageCache.ts` spécifique
3. Intégrer dans AttractionDetail.tsx
4. Tester téléchargement/affichage offline

### Phase 4 : Cache Audios (2h)
1. Créer `audioCache.ts`
2. Modifier `AudioPlayer.tsx` (remplacer simulation)
3. Créer `DownloadManager.tsx`
4. Tester téléchargement/lecture offline

### Phase 5 : Synchronisation Background (2-3h)
1. Créer `queueService.ts`
2. Créer `syncService.ts`
3. Créer `SyncStatus.tsx`
4. Créer `useSyncQueue.ts`
5. Intégrer dans Profile.tsx
6. Tester sync après mode offline

---

## 🎯 Priorités

### 🔥 Must Have (MVP)
1. ✅ Service Worker basique (cache pages)
2. ✅ Cache images automatique
3. ✅ Indicateur mode offline
4. ✅ Cache audios avec bouton téléchargement

### 🌟 Nice to Have
5. Notifications de proximité
6. Synchronisation background automatique
7. Gestionnaire téléchargements avancé
8. Analytics offline

---

## 🚀 Commencer Maintenant

### Étape 1 : Notifications de Proximité

Commençons par le geofencing car :
- Service `geolocationService.ts` déjà prêt
- Structure GeofenceRegion déjà définie
- Impact utilisateur immédiat
- Peu de dépendances

**Fichiers à créer** :
1. `src/services/notificationService.ts`
2. `src/hooks/useGeofencing.ts`
3. Modifier `Map.tsx` pour activation

**Commande** :
```bash
npm install @capacitor/local-notifications
npx cap sync
```

---

## ✅ Checklist Sprint 3

- [ ] **Notifications de proximité**
  - [ ] Installer @capacitor/local-notifications
  - [ ] Créer notificationService.ts
  - [ ] Créer useGeofencing.ts hook
  - [ ] Intégrer dans Map.tsx
  - [ ] Tester notifications entrée/sortie zone
  
- [ ] **Service Worker**
  - [ ] Installer Workbox
  - [ ] Créer service-worker.js
  - [ ] Créer offlineService.ts
  - [ ] Créer useOnlineStatus.ts hook
  - [ ] Créer OfflineBanner.tsx
  - [ ] Tester mode avion
  
- [ ] **Cache Images**
  - [ ] Créer cacheService.ts
  - [ ] Créer imageCache.ts
  - [ ] Intégrer dans AttractionDetail
  - [ ] Tester offline
  
- [ ] **Cache Audios**
  - [ ] Créer audioCache.ts
  - [ ] Modifier AudioPlayer (remplacer simulation)
  - [ ] Créer DownloadManager
  - [ ] Tester téléchargement/lecture offline
  
- [ ] **Synchronisation**
  - [ ] Créer queueService.ts
  - [ ] Créer syncService.ts
  - [ ] Créer SyncStatus component
  - [ ] Créer useSyncQueue hook
  - [ ] Intégrer dans Profile
  - [ ] Tester sync après offline

---

## 🎉 Résultat Attendu

À la fin du Sprint 3, l'application doit :
1. ✅ Notifier l'utilisateur quand il est près d'une attraction
2. ✅ Fonctionner en mode avion (pages visitées + audios téléchargés)
3. ✅ Afficher "Mode Hors Ligne" quand pas de connexion
4. ✅ Télécharger vraiment les audios (pas simulation)
5. ✅ Synchroniser favoris/bookmarks quand connexion revient
6. ✅ Cache intelligent des images consultées

**Impact utilisateur** : Application utilisable en voyage, dans zones sans réseau ! 🌍📱
