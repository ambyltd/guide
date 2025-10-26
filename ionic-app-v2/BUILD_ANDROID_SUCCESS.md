# 🚀 BUILD ANDROID APK - GUIDE RAPIDE

**Date**: 19 octobre 2025  
**Status**: ✅ Build propre réussi  
**Durée**: ~3 minutes (nettoyage + rebuild)

---

## ✅ ÉTAPES COMPLÉTÉES

### 1. Nettoyage complet ✅
```powershell
# Supprimé:
✅ android/app/build/       # Build cache
✅ android/.gradle/         # Gradle cache
✅ android/build/           # Build racine
✅ android/.idea/           # Android Studio cache
✅ android/app/src/main/assets/  # Anciens assets web
✅ dist/                    # Ancien build Vite
```

### 2. Build Vite ✅
```bash
npx vite build
# ✅ Terminé en 1m 5s
# ✅ 19 fichiers précachés (3701.94 KB)
# ✅ Service Worker généré
```

### 3. Sync Capacitor ✅
```bash
npx cap sync android
# ✅ Terminé en 1.16s
# ✅ 6 plugins Capacitor détectés
# ✅ Assets copiés vers android/app/src/main/assets/public
```

### 4. Android Studio lancé ✅
```bash
.\open-android-studio.bat
# ✅ Android Studio ouvert sur projet ionic-app-v2
```

---

## 📋 PROCHAINES ÉTAPES DANS ANDROID STUDIO

### Étape 1: Gradle Sync (automatique - 30s)
- **Attendre** que "Gradle Sync" termine en bas à droite
- Message de succès: "Gradle sync finished in X s"

### Étape 2: Clean Project
```
Menu: Build > Clean Project
Durée: ~10 secondes
```

### Étape 3: Rebuild Project
```
Menu: Build > Rebuild Project
Durée: ~1-2 minutes

Résultat attendu:
✅ BUILD SUCCESSFUL in Xm Xs
✅ 0 errors, X warnings (normaux)
```

### Étape 4: Connecter Device Android
```
1. Activer "Developer Options" sur le téléphone:
   Paramètres > À propos > Appuyer 7x sur "Numéro de build"

2. Activer "USB Debugging":
   Paramètres > Options développeur > Débogage USB

3. Connecter téléphone via câble USB

4. Autoriser débogage sur le téléphone:
   Popup "Autoriser le débogage USB" > OK

5. Vérifier dans Android Studio:
   Toolbar en haut > Dropdown device > Voir le nom du téléphone
```

### Étape 5: Run App
```
Toolbar Android Studio > Bouton vert "Run 'app'" (▶️)
OU
Menu: Run > Run 'app'
OU
Raccourci: Shift+F10

Durée: ~30 secondes
L'app s'installe et se lance automatiquement sur le device
```

---

## 🧪 TESTS À EFFECTUER SUR DEVICE

### Test 1: Navigation de base
- [ ] Ouvrir app
- [ ] Login/Register
- [ ] Naviguer Home → Map → Favorites → Profile
- [ ] Vérifier tabs en bas fonctionnent

### Test 2: AttractionDetail avec MapWithGeofencing
- [ ] Home > Cliquer attraction
- [ ] Tab 'Informations' → Vérifier PAS de carte
- [ ] Tab 'AudioGuides' → Vérifier carte 400px en haut
- [ ] Tab 'AudioGuides' → Liste audioguides en dessous
- [ ] Interagir avec carte (zoom, pan, markers)

### Test 3: Filtres Map.tsx
- [ ] Aller sur page Map (tab 'Carte')
- [ ] Vérifier chips: Tous / Attractions / Circuits
- [ ] Cliquer "Attractions" → Vérifier filtrage
- [ ] Cliquer "Circuits" → Vérifier filtrage
- [ ] Cliquer "Tous" → Tout s'affiche

### Test 4: Geofencing (nécessite Fake GPS)
**Prérequis**:
- Installer "Fake GPS Location" depuis Play Store
- Activer "Mock Location" dans Developer Options

**Étapes**:
1. Ouvrir app audioguide
2. Naviguer vers attraction avec circuit (ex: "Yamoussoukro Historic Tour")
3. Aller dans tab 'AudioGuides'
4. Ouvrir Fake GPS app
5. Chercher "Yamoussoukro" sur la map
6. Placer marker près d'un waypoint du circuit
7. Activer "Play" dans Fake GPS
8. Retourner dans app audioguide
9. **Vérifier**:
   - Badge "🎯 Geofence triggered" apparaît sur la carte
   - AudioPlayer s'ouvre automatiquement
   - Audio correspondant au waypoint se lance

### Test 5: Geofencing multi-waypoints
1. Changer position dans Fake GPS vers autre waypoint
2. Attendre 10 secondes
3. Vérifier que l'audioguide change automatiquement
4. Répéter avec 2-3 waypoints différents

---

## 🐛 TROUBLESHOOTING

### Problème: Gradle Sync échoue
**Solution**:
```
File > Invalidate Caches > Invalidate and Restart
Attendre redémarrage + nouveau Gradle Sync
```

### Problème: Build échoue avec erreur "Duplicate class"
**Solution**:
```powershell
# Relancer le script de nettoyage
.\clean-android.ps1
```

### Problème: Device non détecté
**Solution**:
1. Débrancher/rebrancher câble USB
2. Révoquer autorisations USB sur device
3. Réautoriser le débogage
4. Redémarrer ADB:
   ```bash
   adb kill-server
   adb start-server
   adb devices
   ```

### Problème: App crash au lancement
**Solution**:
1. Vérifier Logcat dans Android Studio (onglet bas)
2. Chercher "FATAL EXCEPTION"
3. Si "Network error":
   - Vérifier backend API lancé (192.168.1.9:5000)
   - Vérifier apiConfig.ts (IP correcte)

### Problème: Geofencing ne fonctionne pas
**Solution**:
1. Vérifier permissions location:
   ```
   Paramètres app > Permissions > Localisation > "Autoriser tout le temps"
   ```
2. Vérifier Mock Location activée:
   ```
   Developer Options > Select mock location app > Fake GPS
   ```
3. Vérifier logs console:
   ```javascript
   // Dans MapWithGeofencing.tsx
   console.log('📍 Position:', position.coords.latitude, position.coords.longitude);
   console.log('🎯 Distance to waypoint:', distance, 'm');
   ```

---

## 📊 INFOS BUILD

### Version actuelle
- **App**: ionic-app-base 0.0.0
- **Capacitor**: 7.x
- **Ionic**: 8.x
- **Android SDK**: Target 34, Min 22

### Taille APK (estimée)
- **Debug**: ~50-60 MB
- **Release**: ~30-40 MB (après minification + ProGuard)

### Plugins Capacitor utilisés
1. `@capacitor/device` - Info device
2. `@capacitor/filesystem` - Cache fichiers
3. `@capacitor/geolocation` - GPS position
4. `@capacitor/local-notifications` - Notifications geofencing
5. `@capacitor/network` - Statut réseau
6. `@capacitor/share` - Partage social

---

## 🔧 SCRIPTS UTILES

### Nettoyage complet + Rebuild
```powershell
.\clean-android.ps1
```

### Build production (release APK)
```bash
# 1. Build Vite production
npx vite build --mode production

# 2. Sync Capacitor
npx cap sync android

# 3. Dans Android Studio:
Build > Generate Signed Bundle / APK
> APK
> Create new keystore (première fois)
> release
> Sign
```

### Logs temps réel
```bash
# Voir tous les logs
adb logcat

# Filtrer par app
adb logcat | grep "ionic-app"

# Filtrer erreurs uniquement
adb logcat *:E
```

### Installer APK manuellement
```bash
adb install app-debug.apk

# Forcer réinstallation
adb install -r app-debug.apk

# Désinstaller
adb uninstall io.ionic.starter
```

---

## 📁 FICHIERS GÉNÉRÉS

### Après build Vite
```
dist/
├── index.html                 # Entry point
├── assets/
│   ├── index-*.css           # Styles (142 KB)
│   ├── index-*.js            # App bundle (937 KB)
│   ├── vendor-mapbox-*.js    # Mapbox (1611 KB) ⚠️ Large
│   ├── vendor-ionic-*.js     # Ionic (752 KB)
│   ├── vendor-firebase-*.js  # Firebase (170 KB)
│   └── vendor-react-*.js     # React (149 KB)
├── sw.js                     # Service Worker
└── manifest.webmanifest      # PWA manifest
```

### Après sync Capacitor
```
android/app/src/main/assets/public/
├── index.html
├── assets/
│   └── (tous les fichiers du build)
└── capacitor.config.json
```

### APK généré
```
android/app/build/outputs/apk/debug/
└── app-debug.apk   # APK installable (~50-60 MB)
```

---

## 🎯 CHECKLIST AVANT TESTS

- [x] ✅ Nettoyage complet Android
- [x] ✅ Build Vite sans erreurs
- [x] ✅ Sync Capacitor réussi
- [x] ✅ Android Studio ouvert
- [ ] ⏳ Gradle Sync terminé
- [ ] ⏳ Clean Project
- [ ] ⏳ Rebuild Project
- [ ] ⏳ Device connecté et autorisé
- [ ] ⏳ App installée sur device
- [ ] ⏳ Tests navigation de base
- [ ] ⏳ Tests MapWithGeofencing
- [ ] ⏳ Tests filtres Map.tsx
- [ ] ⏳ Tests geofencing avec Fake GPS

---

## 📞 SUPPORT

### En cas de problème
1. Consulter ce guide
2. Vérifier TROUBLESHOOTING ci-dessus
3. Relancer `.\clean-android.ps1`
4. Vérifier logs Logcat

### Fichiers de logs
- **Vite build**: Terminal output
- **Capacitor sync**: Terminal output
- **Android Studio**: `build/outputs/logs/`
- **Device logs**: `adb logcat`

---

**✨ Bon build et bons tests ! 🚀**
