# 🧪 Guide Test OpenStreetMap - Device Android

## 📅 Date : 22 octobre 2025

**Objectif** : Valider la migration Mapbox → OpenStreetMap sur device physique Android.

---

## ⏱️ Durée Estimée : 30-40 minutes

- Invalidate Caches : 2 min
- Rebuild Android : 2-3 min
- Installation : 1 min
- Tests fonctionnels : 25-30 min

---

## 🚀 Étape 1 : Préparation Android Studio (5 min)

### 1.1 Ouvrir Android Studio

```powershell
cd c:\Users\jpama\Desktop\i\audioguide\ionic-app-v2
.\open-android-studio.bat
```

**Attendu** : Android Studio s'ouvre sur le projet `ionic-app-v2/android`

### 1.2 Invalidate Caches ⚠️ OBLIGATOIRE

```
Menu : File > Invalidate Caches...
Options :
  ✅ Clear file system cache and Local History
  ✅ Clear downloaded shared indexes
  ✅ Clear VCS Log caches and indexes
  ✅ Invalidate and Restart

Bouton : Invalidate and Restart
```

**Attendu** : Android Studio redémarre (~1-2 min)

**Raison** : Supprimer les caches Mapbox, forcer rebuild avec Leaflet

### 1.3 Rebuild Project

```
Menu : Build > Rebuild Project
```

**Attendu** : 
- Build progress bar ~1-2 minutes
- **Build Output** : "BUILD SUCCESSFUL"
- Aucune erreur Mapbox

---

## 📱 Étape 2 : Installation Device (2 min)

### 2.1 Connecter Device Android

- Brancher câble USB
- Vérifier **Developer Options** activées
- Vérifier **USB Debugging** activé

### 2.2 Installer l'App

```
Menu : Run > Run 'app'
Ou : Bouton ▶️ (Play) dans toolbar
```

**Attendu** : 
- Device détecté dans dropdown
- App s'installe et se lance
- Splash screen → Page Home

---

## ✅ Étape 3 : Tests Fonctionnels (25-30 min)

### 🏠 TEST 1 : Page Home (5 min)

#### Checklist

- [ ] **Hero section** s'affiche
- [ ] **Barre de recherche** fonctionnelle
- [ ] **Catégories chips** cliquables
- [ ] **Attractions populaires** liste visible
- [ ] **Cartes preview** dans les cards attractions :
  - [ ] Tiles OpenStreetMap chargent (pas de carré gris)
  - [ ] Marker bleu visible sur chaque carte
  - [ ] Coordonnées correctes (pas de map centrée sur [0,0])

#### ✅ Success Criteria

- Map previews affichent OpenStreetMap tiles
- Markers visibles et positionnés correctement
- Aucune erreur console liée à Mapbox

#### ❌ Échec Possible

- **Map grise** → Tiles ne chargent pas (voir Solutions ci-dessous)
- **Pas de marker** → Icon fix manquant (déjà appliqué, unlikely)

---

### 📍 TEST 2 : Page AttractionDetail (8 min)

#### Préparation

1. Depuis Home, cliquer sur une attraction (ex: "Basilique Notre-Dame de la Paix")
2. AttractionDetail page s'ouvre

#### Checklist - Map Preview

- [ ] **Map preview** visible en haut de la page
- [ ] Tiles OpenStreetMap chargent
- [ ] Marker bleu au centre
- [ ] Clic sur marker → Popup avec nom attraction

#### Checklist - MapWithGeofencing (si onglet Map)

1. Sélectionner onglet "Carte" (si disponible)
2. MapWithGeofencing s'affiche :
   - [ ] **Markers numérotés** visibles (1, 2, 3...)
   - [ ] **Polyline orange** entre les points (si circuit multi-points)
   - [ ] **User marker** (cercle bleu pulsant) visible
   - [ ] **Boutons contrôles** en bas à droite :
     - [ ] Bouton tracking (icône boussole) toggle on/off
     - [ ] Bouton "Me localiser" (icône position)
   - [ ] **Stats circuit** : "Points visités : 0/X" (si circuit)

3. Cliquer bouton "Me localiser" :
   - [ ] Map se centre sur position utilisateur (user marker)
   - [ ] Zoom à 16

4. Cliquer marker numéroté :
   - [ ] Popup s'affiche avec titre audioguide
   - [ ] Langue affichée (🇫🇷 ou 🇬🇧)
   - [ ] Durée affichée (⏱️ X min)

#### ✅ Success Criteria

- MapWithGeofencing affiche correctement
- Tous les markers (numérotés + user) visibles
- Polyline tracée entre points
- Contrôles fonctionnels

#### ❌ Échec Possible

- **Markers numérotés manquants** → CSS custom-marker pas chargé
- **User marker statique** → Animation CSS manquante
- **Pas de polyline** → Coordonnées mal formatées

---

### 🗺️ TEST 3 : Page Map Full Screen (10 min)

#### Préparation

1. Depuis navigation tabs, aller sur onglet "Carte" (icône map)
2. Map page plein écran s'ouvre

#### Checklist - Affichage Initial

- [ ] **Tiles OpenStreetMap** chargent
- [ ] **Tous les markers attractions** visibles :
  - [ ] Couleur **bleue** pour attractions normales
  - [ ] Couleur **violette** pour circuits/tours
- [ ] **User marker** (si géolocalisation autorisée)
- [ ] **Barre de recherche** en haut
- [ ] **Filtres catégories** : Tous / Attractions / Circuits

#### Checklist - Interactions

1. **Zoom/Pan** :
   - [ ] Pinch to zoom fonctionne
   - [ ] Pan (glisser) fluide

2. **Clic sur marker** :
   - [ ] Carte Ionic apparaît en bas
   - [ ] Nom attraction correct
   - [ ] Description affichée
   - [ ] Distance affichée (si user location)
   - [ ] Bouton "Voir les détails" fonctionne

3. **Recherche** :
   - [ ] Taper "Basilique" dans la barre
   - [ ] Markers filtrés (seuls les matchs visibles)
   - [ ] Map se réajuste sur les résultats

4. **Filtres catégories** :
   - [ ] Clic "Circuits" → Seuls markers violets visibles
   - [ ] Clic "Attractions" → Seuls markers bleus visibles
   - [ ] Clic "Tous" → Tous les markers réapparaissent

5. **FAB Button "Me localiser"** (bouton flottant en bas à droite) :
   - [ ] Clic → Map se centre sur user position
   - [ ] Zoom à 14
   - [ ] User marker visible

6. **Badge Geofencing** (coin haut droit) :
   - [ ] Si près d'un POI (<200m) : Badge rouge avec nombre
   - [ ] Sinon : Badge absent ou 0

#### ✅ Success Criteria

- Map interactive et fluide
- Markers couleurs correctes (bleu/violet)
- Filtres fonctionnent
- Center on user fonctionne
- Carte Ionic s'affiche au clic marker

#### ❌ Échec Possible

- **Tous markers même couleur** → createAttractionIcon logic cassée
- **Map ne recentre pas** → MapController userLocation prop manquante

---

### 🎯 TEST 4 : Geofencing (Fake GPS) (5 min)

#### Préparation

1. Installer **Fake GPS Location** (Google Play) si pas déjà fait
2. Activer Developer Options > Mock Location App = Fake GPS Location
3. Ouvrir Fake GPS app

#### Test Geofencing

1. Dans Fake GPS, chercher une attraction du projet (ex: "Yamoussoukro")
2. Placer marker proche d'un POI (<200m)
3. Activer "Play" dans Fake GPS
4. Ouvrir ionic-app-v2, aller sur Map.tsx
5. **Attendu** :
   - [ ] Badge geofencing (haut droit) affiche compteur > 0
   - [ ] Notification système "Vous êtes près de..." (si permissions OK)
   - [ ] Dans MapWithGeofencing : Stats circuit "Points visités : X/Y" augmente

6. Déplacer Fake GPS loin (>500m) :
   - [ ] Badge compteur diminue ou disparaît

#### ✅ Success Criteria

- Geofencing détecte proximité
- Badge compteur s'affiche
- Notifications fonctionnent (si permissions)

#### ❌ Échec Possible

- **Pas de détection** → Permissions géolocalisation manquantes
- **Badge toujours 0** → useGeofencing hook pas démarré

---

### 📶 TEST 5 : Mode Offline (5 min)

#### Préparation

1. Naviguer sur Map.tsx pendant ~30 secondes (charger tiles en cache)
2. Zoomer/panner pour charger plusieurs zones
3. Fermer l'app

#### Test Offline

1. **Couper WiFi + Data mobile** sur device
2. Rouvrir l'app
3. Aller sur Map.tsx
4. **Attendu** :
   - [ ] Tiles précédemment visitées s'affichent depuis le cache
   - [ ] Markers visibles
   - [ ] Zoom/pan fonctionne sur zones cachées
   - [ ] Nouvelles zones (jamais visitées) : tiles manquantes = gris

5. Réactiver réseau :
   - [ ] Nouvelles tiles chargent automatiquement

#### ✅ Success Criteria

- Tiles cachées disponibles offline
- App utilisable sans réseau (zones visitées)

#### ❌ Échec Possible

- **Toutes tiles grises offline** → Service Worker cache OSM pas configuré (déjà fait dans vite.config.ts)

---

## 🐛 Solutions aux Problèmes Communs

### Problème 1 : Map Grise (Tiles ne chargent pas)

**Symptômes** :
- Map s'affiche mais fond gris
- Console : Erreurs 403 ou timeout

**Causes Possibles** :
- Rate limit OpenStreetMap (trop de requêtes)
- Problème réseau
- URL tile server incorrecte

**Solutions** :

1. **Attendre 1-2 minutes** : OSM rate limit temporaire
2. **Vérifier réseau** : WiFi/data actifs
3. **Changer tile server** :

```typescript
// Dans MapContainer, modifier TileLayer url :

// Alternative 1 : CartoDB Light (recommandé)
<TileLayer url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png" />

// Alternative 2 : CartoDB Voyager (coloré)
<TileLayer url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png" />

// Alternative 3 : Stamen Terrain (relief)
<TileLayer url="https://stamen-tiles-{s}.a.ssl.fastly.net/terrain/{z}/{x}/{y}{r}.png" />
```

4. **Rebuild + Reinstall app**

### Problème 2 : Markers Manquants

**Symptômes** :
- Map s'affiche mais pas de markers

**Causes** :
- Icon fix Leaflet pas appliqué
- Coordonnées mal formatées

**Solutions** :

1. **Vérifier console device** (Chrome DevTools) :
   - Chercher erreurs "icon" ou "marker"
2. **Vérifier icon fix appliqué** dans chaque fichier :

```typescript
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});
```

3. **Rebuild + Reinstall**

### Problème 3 : App Crash au Lancement

**Symptômes** :
- App s'ouvre puis crash immédiatement
- Retour écran d'accueil Android

**Causes** :
- Build corrompu
- Caches Android Studio pas invalidés

**Solutions** :

1. **Invalidate Caches** (refaire Étape 1.2)
2. **Clean Build** :
   ```
   Build > Clean Project
   Build > Rebuild Project
   ```
3. **Désinstaller app device** :
   - Longpress icône app > Désinstaller
4. **Reinstaller** : Run > Run 'app'

### Problème 4 : Geofencing Ne Fonctionne Pas

**Symptômes** :
- Badge geofencing toujours 0
- Pas de notifications proximité

**Causes** :
- Permissions géolocalisation refusées
- Mock location pas activée (Fake GPS)

**Solutions** :

1. **Vérifier permissions** :
   - Settings > Apps > AudioGuide > Permissions
   - Location : Autorisé "All the time" (recommandé) ou "While using app"
2. **Activer Mock Location** :
   - Settings > Developer Options > Mock Location App = Fake GPS Location
3. **Redémarrer app**
4. **Console logs** : Chercher "Distance to..." (doit s'afficher toutes les 10s)

---

## 📊 Checklist Finale

### Build & Installation
- [ ] Android Studio caches invalidés
- [ ] Rebuild Project : SUCCESS
- [ ] App installée sur device
- [ ] App se lance sans crash

### Tests Fonctionnels
- [ ] **Home** : Map previews avec OSM tiles ✅
- [ ] **AttractionDetail** : Map preview + MapWithGeofencing ✅
- [ ] **Map Full Screen** : Tous markers visibles, filtres OK ✅
- [ ] **Geofencing** : Badge compteur + notifications ✅
- [ ] **Offline** : Tiles cachées disponibles ✅

### Performance
- [ ] Chargement initial < 3s
- [ ] Zoom/pan fluides
- [ ] Pas de lag au déplacement
- [ ] Transitions map rapides

### Régression
- [ ] Aucune fonctionnalité cassée (vs version Mapbox)
- [ ] UI/UX identique
- [ ] Toutes les pages accessibles

---

## ✅ Validation Réussie

Si **TOUS** les tests passent :

🎉 **Migration Mapbox → OpenStreetMap VALIDÉE SUR DEVICE !**

### Prochaines Actions

1. **Commit & Push** les changements :
   ```bash
   git add .
   git commit -m "feat: Migration Mapbox → OpenStreetMap/Leaflet complète"
   git push origin main
   ```

2. **Mettre à jour documentation** :
   - README.md : Changer "Mapbox" → "OpenStreetMap"
   - .github/copilot-instructions.md : Mise à jour stack

3. **Déploiement** (si applicable) :
   - Build production : `npm run build`
   - Upload sur stores (Google Play, etc.)

---

## ❌ Échec Validation

Si des tests échouent :

1. **Noter les problèmes** dans un fichier `ISSUES_OSM.md`
2. **Consulter Solutions** ci-dessus
3. **Re-tester** après corrections
4. **Demander aide** si blocage persistant

---

## 📞 Support

**Documentation** :
- MIGRATION_MAPBOX_OSM_SUCCESS.md (ce repo)
- https://react-leaflet.js.org/docs/start-introduction
- https://leafletjs.com/reference.html

**Issues Connues** :
- Voir MIGRATION_MAPBOX_OSM_SUCCESS.md section "Issues Connues & Solutions"

---

**Auteur** : GitHub Copilot  
**Date** : 22 octobre 2025  
**Dernière mise à jour** : 22 octobre 2025
