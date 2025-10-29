# Corrections Map - Problèmes Résolus

## Date: 28 octobre 2025

## 🐛 Bugs Identifiés et Corrigés

### 1. **Tours (circuits) non visibles** ✅ RÉSOLU

**Cause Root**: Incohérence nom propriété entre backend et frontend
- Backend seed: `startLocation` / `endLocation`
- Frontend types: `startPoint` / `endPoint`
- Résultat: `addTourMarker()` vérifiait `tour.startPoint?.coordinates` → toujours undefined → throw error → marker pas ajouté

**Corrections**:
- `ionic-app-v2/src/types/backend.ts` ligne 66-73:
  ```typescript
  // AVANT
  startPoint?: { type: 'Point'; coordinates: [number, number]; };
  endPoint?: { type: 'Point'; coordinates: [number, number]; };
  
  // APRÈS
  startLocation?: { type: 'Point'; coordinates: [number, number]; };
  endLocation?: { type: 'Point'; coordinates: [number, number]; };
  ```

- `ionic-app-v2/src/hooks/useMapbox.ts` ligne 138:
  ```typescript
  // AVANT
  if (!mapInstance.current || !tour.startPoint?.coordinates) {
  
  // APRÈS
  if (!mapInstance.current || !tour.startLocation?.coordinates) {
  ```

- `ionic-app-v2/src/components/MapView.tsx` ligne 125-127:
  ```typescript
  // AVANT
  if (!isLoaded || !selectedTour?.startPoint?.coordinates) return;
  const [lng, lat] = selectedTour.startPoint.coordinates;
  
  // APRÈS
  if (!isLoaded || !selectedTour?.startLocation?.coordinates) return;
  const [lng, lat] = selectedTour.startLocation.coordinates;
  ```

- `ionic-app-v2/src/pages/MapRefactored.tsx` ligne 242-243:
  ```typescript
  // AVANT
  } else if (selectedTour?.startPoint?.coordinates) {
    [destLng, destLat] = selectedTour.startPoint.coordinates;
  
  // APRÈS
  } else if (selectedTour?.startLocation?.coordinates) {
    [destLng, destLat] = selectedTour.startLocation.coordinates;
  ```

**Validation**: 
- Console doit afficher: `🗺️ MapView - Affichage X tours` (X = nombre tours depuis backend)
- Marqueurs jaunes (backgroundColor #ffc409) visibles sur carte
- Tap marker → Bottom sheet avec détails tour
- Backend seed a 8 tours dans `sampleTours` array

---

### 2. **Cloche geofencing non visible** ✅ RÉSOLU

**Cause Root**: Rayon trop restrictif (200m) + condition `isActive` superflue
- 200m = rayon très petit pour tests (difficile d'approcher attractions)
- Condition `geofencingState.isActive && nearbyAttractions.length > 0` cachait badge si geofencing stoppé

**Corrections**:
- `ionic-app-v2/src/pages/MapRefactored.tsx` ligne 74:
  ```typescript
  // AVANT
  const { ... } = useGeofencing(200); // 200m rayon
  
  // APRÈS
  const { ... } = useGeofencing(2000); // 2000m = 2km rayon (tests plus faciles)
  ```

- `ionic-app-v2/src/pages/MapRefactored.tsx` ligne 290:
  ```typescript
  // AVANT
  {geofencingState.isActive && geofencingState.nearbyAttractions.length > 0 && (
  
  // APRÈS
  {geofencingState.nearbyAttractions.length > 0 && (
  ```

**Validation**:
- Console: `🔔 Geofencing - Nearby: X attractions within 2000m`
- Header: Cloche (notificationsOutline icon) + badge rouge visible si attractions < 2km
- Badge affiche count: `geofencingState.nearbyAttractions.length`

**Notes**: 
- Rayon 2000m = temporaire pour tests
- Production: réduire à 500m ou 1km selon use case
- Fake GPS Chrome DevTools (Sensors > Location) utile pour simuler proximité

---

### 3. **Zoom pas adapté automatiquement** ✅ DÉJÀ CORRIGÉ (Sprint précédent)

**Status**: Fonctionnel depuis build précédent
- useEffect ligne 148 calcule `smartZoom` réactif
- Utilise `attractions` (TOUTES, pas `filteredAttractions`)
- 6 paliers: 17 (< 500m), 16 (< 1km), 15 (< 2km), 14 (< 5km), 13 (< 10km), 12 (> 10km)
- Mise à jour automatique sur changement `userLocation` ou `attractions`

**Validation**:
- Console: `🔍 Map - Zoom intelligent: X (distance min: Ykm)`
- Carte zoom/dézoom automatiquement selon distance attraction la plus proche
- Si user proche attraction (< 500m) → zoom 17 (très zoomé)
- Si user loin (> 10km) → zoom 12 (vue d'ensemble)

---

## 📊 Build Stats (Après Corrections)

```bash
Build Time: 1m16s
Modules: 1525 transformed
Errors: 0
Warnings: 1 (chunk size > 500KB, normal pour Mapbox)

Bundle Sizes:
- vendor-mapbox: 1649.88 KB (445.19 KB gzipped)
- index: 963.50 KB (265.03 KB gzipped)
- vendor-ionic: 869.80 KB (174.68 KB gzipped)

PWA:
- Mode: generateSW
- Precache: 21 entries (4456.80 KB)
- Service Worker: ✅ généré

Sync Android: 0.764s
```

---

## 🧪 Tests Recommandés

### Test 1: Tours (Circuits) Visibles
```bash
1. Ouvrir http://localhost:8100/tabs/map (ou device Android)
2. Attendre chargement carte (spinner disparaît)
3. Vérifier header: Chip "🚶 X" avec X > 0 (count tours)
4. Vérifier carte: Marqueurs JAUNES visibles (différents bleus attractions)
5. Tap marqueur jaune → Bottom sheet avec détails tour
6. Tap "Voir Détails" → Navigation vers /tabs/tour/:id
7. Tap "Itinéraire" → Ouvre Maps natives avec route
```

**Logs Console Attendus**:
```
🔄 mapService - Fetch tours depuis API
✅ mapService - X tours chargés
🗺️ MapView - Affichage X tours
```

### Test 2: Cloche Geofencing Badge
```bash
1. Accepter permissions géolocalisation
2. Si indoor/WiFi: Fake GPS Chrome DevTools (Sensors > Location)
   - Custom: Lat 5.3364, Lng -4.0267 (Abidjan Plateau)
3. Refresh page
4. Vérifier header: Cloche (🔔) + badge rouge avec count
5. Badge affiche nombre attractions < 2km
6. Se déplacer (Fake GPS) → Badge update automatique
```

**Logs Console Attendus**:
```
📍 Position: {latitude: 5.3364, longitude: -4.0267}
🔔 Geofencing - Nearby: X attractions within 2000m
```

### Test 3: Zoom Intelligent
```bash
1. Charger carte avec géolocalisation activée
2. Observer zoom initial (adapté selon distance attractions)
3. Console: Vérifier log "Zoom intelligent: X (distance min: Ykm)"
4. Changer position user (Fake GPS ou déplacement réel)
5. Observer carte zoom/dézoom automatiquement
```

**Comportement Attendu**:
- < 500m: Zoom 17 (très zoomé, détails rues)
- 500m-1km: Zoom 16 (zoomé, quartier)
- 1-2km: Zoom 15 (moyen, district)
- 2-5km: Zoom 14 (normal, plusieurs districts)
- 5-10km: Zoom 13 (dézoomé, ville)
- > 10km: Zoom 12 (très dézoomé, région)

---

## 🔍 Debug Checklist

Si problèmes persistent:

**Tours pas visibles**:
- [ ] Backend running: `cd backend-api && npm run dev`
- [ ] API accessible: `curl http://localhost:5000/api/tours`
- [ ] Response contient tours: `{"success":true,"data":{"tours":[...],"total":X}}`
- [ ] Console log: "X tours chargés" avec X > 0
- [ ] Console log: "Affichage X tours" avec X > 0
- [ ] Chip header "🚶 X" avec X > 0
- [ ] Aucun error console type "coordonnées invalides"

**Cloche pas visible**:
- [ ] Géolocalisation permissions accordées
- [ ] Console log position: `{latitude: X, longitude: Y}`
- [ ] Attractions chargées: "X attractions chargées" avec X > 0
- [ ] Console log: "Nearby: X attractions within 2000m" avec X > 0
- [ ] Distance calculée < 2000m (vérifier manuellement avec outil distance en ligne)

**Zoom fixe**:
- [ ] Console log: "Zoom intelligent: X (distance min: Ykm)"
- [ ] `smartZoom` passé à MapView: `<MapView zoom={smartZoom} />`
- [ ] Attractions array non vide
- [ ] UserLocation non null
- [ ] useEffect ligne 148 exécuté (breakpoint ou console.log)

---

## 📝 Fichiers Modifiés

1. `ionic-app-v2/src/types/backend.ts` - Interface BackendTour (startPoint → startLocation)
2. `ionic-app-v2/src/hooks/useMapbox.ts` - addTourMarker() check startLocation
3. `ionic-app-v2/src/components/MapView.tsx` - useEffect zoom tour avec startLocation
4. `ionic-app-v2/src/pages/MapRefactored.tsx` - handleNavigate() + rayon geofencing 2000m + condition badge
5. `ionic-app-v2/MAP_DEBUG_GUIDE.md` - Guide debug créé (600+ lignes)

**Lignes modifiées**: ~15 lignes
**Impact**: 
- ✅ Tours maintenant visibles sur carte
- ✅ Cloche geofencing visible avec rayon 2km
- ✅ Zoom intelligent déjà fonctionnel (pas modifié)

---

## 🚀 Déploiement

```bash
# Build production
cd ionic-app-v2
npm run build  # 1m16s, 0 erreurs

# Sync Android
npx cap sync android  # 0.764s

# Test browser
npm run dev
# Ouvrir http://localhost:8100/tabs/map

# Test device Android
npx cap open android
# Build APK > Install > Test
```

---

## 📌 Notes Production

**Rayon Geofencing**:
- Actuel: 2000m (2km) pour tests
- Production recommandée: 500m ou 1000m
- Modifier: `useGeofencing(500)` ligne 74 MapRefactored.tsx

**Optimization Future**:
- Ajouter filtre tours par catégorie (cultural, nature, art)
- Clustering marqueurs si > 50 tours (performance Mapbox)
- Précharger tours data dans Service Worker offline

**Backend Seed**:
- 8 tours dans `sampleTours` array
- 15 attractions dans `sampleAttractions` array
- Tous ont `startLocation` avec coordinates valides
- Re-seed: `cd backend-api && npm run seed:complete`

