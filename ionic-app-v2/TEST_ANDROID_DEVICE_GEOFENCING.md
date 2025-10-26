# 🧪 GUIDE TEST ANDROID DEVICE - GEOFENCING

**Date**: 19 octobre 2025  
**Build**: audioguide-debug.apk  
**Objectif**: Tester MapWithGeofencing + auto-play waypoints

---

## 📱 PRÉPARATION DEVICE

### 1. Activer USB Debugging
```
Settings > About Phone > Taper 7x "Build Number"
Settings > Developer Options > USB Debugging (ON)
```

### 2. Connecter device
```bash
# Vérifier connexion
adb devices

# Devrait afficher:
# List of devices attached
# ABC123XYZ    device
```

### 3. Installer APK
```bash
# Depuis le dossier ionic-app-v2
adb install -r audioguide-debug.apk

# OU utiliser le script
.\build-android.ps1  # Répondre 'y' à "Install on connected device now?"
```

### 4. Installer Fake GPS
```
Play Store > "Fake GPS Location - GPS Joystick"
Settings > Developer Options > Select mock location app > Fake GPS Location
```

---

## 🧪 TESTS GEOFENCING

### TEST 1: MapWithGeofencing visible dans tab Audioguides

**Étapes**:
1. Lancer app sur device
2. Se connecter (ou mode invité)
3. Page Home > Cliquer sur une attraction (ex: "Basilique Notre-Dame")
4. Tab "AudioGuides" (2ème tab)

**Vérifications**:
- [ ] Carte Mapbox affichée en haut (400px)
- [ ] Marker principal (attraction) visible
- [ ] Markers waypoints (audioguides) visibles si circuit
- [ ] Bouton "Center on User" en haut à droite
- [ ] Liste audioguides en dessous de la carte

**Logs attendus** (adb logcat):
```
Capacitor: MapWithGeofencing mounted
Capacitor: Map initialized with attraction: <nom>
Capacitor: 3 audioguides loaded
```

---

### TEST 2: Géolocalisation temps réel

**Étapes**:
1. Rester sur tab "AudioGuides"
2. Cliquer bouton "Center on User" sur la carte
3. Autoriser permission Location si demandée
4. Vérifier marker utilisateur apparaît sur la carte

**Vérifications**:
- [ ] Permission Location demandée
- [ ] Marker utilisateur (point bleu) visible
- [ ] Position centrée sur utilisateur
- [ ] Zoom adapté

**Logs attendus**:
```
CapacitorGeolocation: Location permission granted
CapacitorGeolocation: Position: lat=6.8167, lng=-5.2767
MapWithGeofencing: User location updated
```

---

### TEST 3: Geofencing trigger avec Fake GPS

**Prérequis**:
- Attraction avec circuit (ex: "Yamoussoukro Historic Tour")
- Au moins 2 audioguides waypoints

**Étapes**:

#### 3.1 Configuration Fake GPS
1. Ouvrir **Fake GPS Location** app
2. Chercher "Yamoussoukro" sur la carte
3. Noter les coordonnées d'un waypoint dans l'app Audioguide:
   - Exemple Waypoint 1: `6.8167, -5.2767` (Basilique)
4. Dans Fake GPS, placer le marqueur sur ces coordonnées
5. Activer "Start" (joystick vert)

#### 3.2 Test geofencing dans app Audioguide
1. Retourner dans app Audioguide
2. Tab "AudioGuides" > Vérifier position sur carte
3. Position devrait être proche du waypoint (<200m)
4. **Attendre 10 secondes** (interval geofencing)

**Résultat attendu**:
- [ ] Badge notification "🎯 Geofence triggered" apparaît brièvement
- [ ] AudioPlayer s'ouvre automatiquement en bas de l'écran
- [ ] Audioguide correspondant au waypoint est sélectionné
- [ ] **Audio se lance automatiquement** (auto-play)
- [ ] Console logs:

```
MapWithGeofencing: Geofencing check...
MapWithGeofencing: Distance to waypoint "Basilique History": 150m
🎯 Geofence trigger pour audioguide: Basilique History
✅ Audioguide reçu du geofencing, ouverture du player avec auto-play
AudioPlayer: Auto-play triggered by geofencing
```

#### 3.3 Test multi-waypoints
1. Dans Fake GPS, déplacer le marqueur vers un autre waypoint
   - Exemple Waypoint 2: `6.8200, -5.2800` (Palace)
2. Attendre 10s
3. Vérifier que l'audioguide change automatiquement
4. Vérifier que le nouveau audio se lance

**Vérifications**:
- [ ] Détection automatique du nouveau waypoint
- [ ] AudioPlayer change d'audioguide
- [ ] Nouveau audio se lance automatiquement
- [ ] Marker utilisateur mis à jour sur la carte

---

### TEST 4: Filtres catégories Map page

**Étapes**:
1. Page Map (tab "Carte" en bas)
2. Vérifier 3 chips sous la searchbar:
   - **Tous** (primary si sélectionné)
   - **Attractions** (medium)
   - **Circuits** (medium)
3. Cliquer "Circuits"
4. Vérifier que seuls les markers "circuit" s'affichent
5. Cliquer "Attractions"
6. Vérifier que seuls les markers "attraction" s'affichent
7. Cliquer "Tous"
8. Vérifier tous les markers s'affichent

**Vérifications**:
- [ ] Chips responsive (scroll horizontal si nécessaire)
- [ ] Couleurs changent au clic
- [ ] Filtrage instantané des markers
- [ ] Pas de lag

**Logs attendus**:
```
Map: Category filter changed to: circuit
Map: Filtering 15 attractions -> 3 circuits
Map: Rendering 3 markers
```

---

## 📊 CHECKLIST TESTS COMPLETS

### Fonctionnalités de base
- [ ] App lance sans crash
- [ ] Login/Logout fonctionne
- [ ] Home page affiche attractions
- [ ] AttractionDetail s'ouvre correctement
- [ ] Tabs fonctionnent (Info, AudioGuides, Photos, Reviews)

### Tab "Info"
- [ ] Description affichée
- [ ] Détails (Localisation, Horaires, Téléphone, Site web)
- [ ] **Pas de carte visible** ✓

### Tab "AudioGuides"
- [ ] Carte MapWithGeofencing affichée (400px)
- [ ] Liste audioguides en dessous
- [ ] Boutons download fonctionnent
- [ ] Boutons play ouvrent AudioPlayer

### MapWithGeofencing
- [ ] Carte interactive (zoom, pan)
- [ ] Markers attraction + waypoints
- [ ] Bouton "Center on User"
- [ ] Permission Location demandée
- [ ] Marker utilisateur visible

### Geofencing
- [ ] Détection proximité waypoint (<200m)
- [ ] Trigger callback après 10s
- [ ] AudioPlayer s'ouvre automatiquement
- [ ] Audio se lance automatiquement
- [ ] Multi-waypoints fonctionne

### Map page
- [ ] Filtres catégories (Tous/Attractions/Circuits)
- [ ] Filtrage dynamique markers
- [ ] Chips responsive
- [ ] Recherche + filtres combinés

### AudioPlayer
- [ ] Play/Pause
- [ ] Skip ±10s
- [ ] Vitesse (0.75x-1.5x)
- [ ] Volume
- [ ] Bookmarks
- [ ] Download offline

### Offline
- [ ] Service Worker actif
- [ ] Cache images
- [ ] Cache audio
- [ ] Background sync favoris

---

## 🐛 TROUBLESHOOTING DEVICE

### App crash au lancement
```bash
# Vérifier logs
adb logcat -c && adb logcat | Select-String "AndroidRuntime|FATAL"

# Souvent: permissions manquantes
# Solution: Vérifier AndroidManifest.xml
```

### Géolocalisation ne fonctionne pas
```
Settings > Apps > Audioguide > Permissions > Location (Allow)

# OU réinstaller:
adb uninstall io.ionic.starter
adb install audioguide-debug.apk
```

### Fake GPS non détecté
```
Settings > Developer Options > Select mock location app > Fake GPS Location
Relancer Fake GPS app
Vérifier joystick vert actif
```

### Geofencing ne trigger pas
```bash
# Vérifier logs
adb logcat | Select-String "Geofencing|MapWithGeofencing"

# Vérifications:
# - Distance <200m du waypoint
# - Attendre au moins 10s
# - Fake GPS bien actif
# - Permission Location accordée
```

### Audio ne se lance pas automatiquement
```bash
# Vérifier logs AudioPlayer
adb logcat | Select-String "AudioPlayer"

# Vérifications:
# - isPlayerOpen = true
# - selectedAudioGuide défini
# - Fichier audio accessible (URL ou cache)
```

---

## 📱 COMMANDES UTILES

```bash
# Logs live filtrés
adb logcat -c && adb logcat | Select-String "Capacitor|Geofencing|AudioPlayer"

# Logs avec timestamp
adb logcat -v time | Select-String "MapWithGeofencing"

# Effacer logs
adb logcat -c

# Redémarrer app
adb shell am force-stop io.ionic.starter
adb shell am start -n io.ionic.starter/.MainActivity

# Screenshot
adb shell screencap -p /sdcard/screenshot.png
adb pull /sdcard/screenshot.png

# Vidéo screen record
adb shell screenrecord /sdcard/test.mp4
# Arrêter avec Ctrl+C
adb pull /sdcard/test.mp4
```

---

## ✅ CRITÈRES DE SUCCÈS

### Minimum Viable (MUST HAVE)
- [x] App installe et lance
- [x] MapWithGeofencing affichée dans tab AudioGuides
- [x] Géolocalisation fonctionne
- [x] Filtres Map page fonctionnent

### Geofencing Core (CRITICAL)
- [ ] Détection proximité waypoint
- [ ] Trigger callback automatique
- [ ] AudioPlayer auto-play
- [ ] Multi-waypoints successifs

### Nice to Have (BONUS)
- [ ] Badge notification geofence
- [ ] Animations transitions
- [ ] Marker utilisateur animé (pulse)
- [ ] Logs console détaillés

---

**🎯 OBJECTIF**: Valider que le geofencing fonctionne end-to-end sur device réel avec Fake GPS avant le déploiement production.

**✨ BON TEST ! 🚀**
