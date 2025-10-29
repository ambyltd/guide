# Guide Debug - Problèmes Map

## Problèmes Identifiés

### 1. **Circuits (marqueurs jaunes) non visibles**

**Causes possibles:**
1. Backend API tours retourne 0 tours
2. `showTours` initialisé à `false` dans `useMapInteractions`
3. Tours sans `startPoint.coordinates` valide
4. `clearTourMarkers()` appelé mais `addTourMarker()` échoue

**Debug:**
```bash
# Console Browser (F12)
# Chercher logs:
🔄 mapService - Fetch tours depuis API
✅ mapService - X tours chargés
🗺️ MapView - Affichage X tours
```

**Fix si 0 tours:**
- Vérifier backend: `http://localhost:5000/api/tours`
- Vérifier seed: `backend-api/scripts/seed-complete.ts` ligne ~400
- Re-seed: `cd backend-api && npm run seed:complete`

**Fix si tours chargés mais pas affichés:**
- Vérifier `showTours` = true dans header chip
- Vérifier `tours.length > 0` dans MapView useEffect ligne 85

---

### 2. **Cloche geofencing non visible**

**Causes possibles:**
1. `geofencingState.nearbyAttractions.length` = 0 (pas d'attractions proches)
2. Geofencing pas démarré (`startGeofencing()` pas appelé)
3. Position utilisateur non disponible
4. Rayon 200m trop petit pour tests

**Debug:**
```bash
# Console Browser
# Chercher logs:
📱 Map - Page active
🎯 Geofencing - Started
📍 Position: {latitude, longitude}
🔔 Geofencing - Nearby: X attractions within 200m
```

**Fix:**
- Vérifier position user dans console
- Calculer distance attractions: `mapService.calculateDistance(userLat, userLng, attractionLat, attractionLng)`
- Si > 200m, modifier rayon dans `useGeofencing(500)` MapRefactored.tsx ligne 74
- Ou utiliser Fake GPS Chrome DevTools (Sensors > Location)

---

### 3. **Zoom pas adapté automatiquement**

**Causes possibles:**
1. `attractions.length` = 0 (pas d'attractions chargées)
2. `userLocation` = null (position non disponible)
3. useEffect zoom ligne 148 pas exécuté
4. `smartZoom` reste à defaultZoom (12)

**Debug:**
```bash
# Console Browser
# Chercher log:
🔍 Map - Zoom intelligent: 15 (distance min: 1.23km)
```

**Fix si log absent:**
- Vérifier `attractions.length > 0`
- Vérifier `userLocation !== null`
- Ajouter breakpoint ligne 148 MapRefactored.tsx
- Vérifier `defaultZoom` dans .env (VITE_MAP_DEFAULT_ZOOM)

**Fix si log présent mais zoom pas appliqué:**
- Vérifier `smartZoom` passé à `<MapView zoom={smartZoom} />`
- Vérifier MapView ligne 43: `zoom` dans `useMapbox({ center, zoom })`

---

## Tests Rapides (Browser localhost:8100)

### Test 1: Vérifier Tours Backend
```bash
curl http://localhost:5000/api/tours
# Attendre: {"success":true,"data":{"tours":[...],"total":X}}
```

### Test 2: Console Logs Complets
```javascript
// Ouvrir F12 > Console
// Filtrer par "Map" ou "mapService" ou "Geofencing"
// Vérifier séquence:
// 1. 📱 Map - Page active
// 2. 🔄 mapService - Fetch attractions/tours
// 3. ✅ mapService - X attractions, Y tours chargés
// 4. 🗺️ MapView - Affichage X attractions
// 5. 🗺️ MapView - Affichage Y tours
// 6. 📍 MapView - Affichage position utilisateur
// 7. 🔍 Map - Zoom intelligent: Z
```

### Test 3: Inspect Header Chips
```javascript
// Console
document.querySelector('ion-chip[color="warning"]')?.textContent
// Attendre: "🚶 2" ou "🚶 0"
```

### Test 4: Inspect Geofencing Badge
```javascript
// Console
document.querySelector('ion-badge[color="danger"]')?.textContent
// Attendre: "1" ou "2" si proche attraction
```

### Test 5: Force Fake Location
```javascript
// Chrome DevTools > Sensors > Location
// Custom: Lat 5.3451, Lng -4.0244 (Abidjan centre)
// Refresh page
// Vérifier cloche badge apparaît (si attractions < 200m)
```

---

## Corrections Code si Nécessaire

### Fix 1: Tours pas affichés (showTours false par défaut)
**Fichier:** `ionic-app-v2/src/hooks/useMapInteractions.ts` ligne 50
```typescript
// AVANT
const [showTours, setShowTours] = useState(true);

// Si false, changer en true
```

### Fix 2: Rayon geofencing trop petit
**Fichier:** `ionic-app-v2/src/pages/MapRefactored.tsx` ligne 74
```typescript
// AVANT
const { state: geofencingState, ... } = useGeofencing(200);

// Si tests, augmenter à 2000m (2km)
const { state: geofencingState, ... } = useGeofencing(2000);
```

### Fix 3: Zoom pas réactif
**Fichier:** `ionic-app-v2/src/pages/MapRefactored.tsx` ligne 318
```typescript
// Vérifier:
<MapView
  zoom={smartZoom}  // Pas zoom={15} ou zoom={defaultZoom}
  ...
/>
```

### Fix 4: Tours sans startPoint
**Fichier:** `backend-api/scripts/seed-complete.ts` ligne ~400
```typescript
// Vérifier tous tours ont:
{
  startPoint: {
    type: 'Point',
    coordinates: [lng, lat], // Format GeoJSON [lng, lat]
  },
  ...
}
```

---

## Commandes Build/Test

```bash
# 1. Backend (si tours manquants)
cd backend-api
npm run seed:complete
npm run dev

# 2. Frontend rebuild
cd ionic-app-v2
npm run build
npx cap sync android

# 3. Test browser
npm run dev
# Ouvrir http://localhost:8100/tabs/map

# 4. Test device Android
npx cap open android
# Build APK > Install > Tester
```

---

## Checklist Validation

- [ ] Backend API `/api/tours` retourne >= 2 tours
- [ ] Console log "X tours chargés" avec X > 0
- [ ] Console log "Affichage X tours" avec X > 0
- [ ] Header chip "🚶 2" (ou count > 0) visible
- [ ] Marqueurs jaunes visibles sur carte (tap pour bottom sheet)
- [ ] Console log "Nearby: X attractions" si < 200m
- [ ] Cloche geofencing + badge visible si nearbyAttractions > 0
- [ ] Console log "Zoom intelligent: X (distance min: Ykm)"
- [ ] Zoom carte change automatiquement selon distance
- [ ] FAB locate (bodyOutline) visible en bas droite
- [ ] FAB QR scanner ABSENT (retiré)

