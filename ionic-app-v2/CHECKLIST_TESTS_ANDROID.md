# ✅ CHECKLIST BUILD ANDROID - Tests MapWithGeofencing

**Date**: 19 octobre 2025  
**Objectif**: Tester intégration MapWithGeofencing + filtres Map.tsx sur device Android

---

## 🔧 PRÉPARATION BUILD (COMPLÉTÉ ✅)

- [x] Nettoyage complet Android (app/build, .gradle, etc.)
- [x] Build Vite production (1m 5s, 0 erreurs)
- [x] Sync Capacitor Android (1.16s, 6 plugins)
- [x] Android Studio lancé

---

## 🏗️ BUILD ANDROID STUDIO (EN COURS ⏳)

### Dans Android Studio:

- [ ] **Gradle Sync terminé** (~30s)
  - Vérifier en bas à droite: "Gradle sync finished in X s"
  
- [ ] **Clean Project** (~10s)
  - Menu: `Build > Clean Project`
  
- [ ] **Rebuild Project** (~1-2 min)
  - Menu: `Build > Rebuild Project`
  - Résultat attendu: `BUILD SUCCESSFUL in Xm Xs`

---

## 📱 INSTALLATION DEVICE (TODO 📋)

- [ ] **Developer Options activées**
  - Paramètres > À propos > Taper 7x "Numéro de build"
  
- [ ] **USB Debugging activé**
  - Paramètres > Options développeur > Débogage USB
  
- [ ] **Device connecté USB**
  - Brancher câble USB
  - Autoriser débogage sur le téléphone
  
- [ ] **Device visible dans Android Studio**
  - Toolbar en haut > Dropdown device > Nom du téléphone
  
- [ ] **Run app**
  - Bouton vert ▶️ ou `Run > Run 'app'`
  - Attendre installation (~30s)

---

## 🧪 TESTS FONCTIONNELS (TODO 📋)

### Test 1: Navigation de base
- [ ] App s'ouvre sans crash
- [ ] Login/Register fonctionne
- [ ] Tabs navigation (Home/Map/Favorites/Profile) OK
- [ ] Pas de page blanche

### Test 2: AttractionDetail - Tab 'info'
- [ ] Home > Cliquer attraction
- [ ] Tab 'Informations' sélectionné par défaut
- [ ] **Vérifier: PAS de carte visible**
- [ ] Contenu: Description + Détails (Localisation, Horaires, Téléphone)

### Test 3: AttractionDetail - Tab 'audioguides' avec Map
- [ ] Cliquer tab 'AudioGuides'
- [ ] **Vérifier: Carte 400px en haut**
- [ ] **Vérifier: Liste audioguides en dessous**
- [ ] Carte Mapbox interactive (zoom, pan fonctionne)
- [ ] Markers visibles:
  - 1 marker principal (attraction)
  - N markers waypoints (audioguides)
- [ ] Cliquer marker → Popup avec titre audioguide

### Test 4: Map.tsx - Filtres catégories
- [ ] Aller page Map (tab 'Carte' en bas)
- [ ] **Vérifier: 3 chips sous searchbar**
  - Tous (couleur primary)
  - Attractions (couleur medium)
  - Circuits (couleur medium)
- [ ] Cliquer "Attractions" → Seules attractions affichées
- [ ] Cliquer "Circuits" → Seuls circuits affichés
- [ ] Cliquer "Tous" → Tout affiché
- [ ] Markers mis à jour dynamiquement

### Test 5: Geofencing - Préparation
- [ ] Installer app "Fake GPS Location" (Play Store)
- [ ] Paramètres > Options développeur > Select mock location app > Fake GPS
- [ ] Dans app audioguide:
  - Paramètres app > Permissions > Localisation > "Autoriser tout le temps"

### Test 6: Geofencing - Auto-play waypoint
- [ ] Ouvrir app audioguide
- [ ] Home > Attraction avec circuit (ex: "Yamoussoukro Historic Tour")
- [ ] Tab 'AudioGuides'
- [ ] Ouvrir Fake GPS app
- [ ] Chercher "Yamoussoukro" sur map
- [ ] Placer marker près d'un waypoint du circuit (~50m)
- [ ] Activer "Play" dans Fake GPS
- [ ] Retourner app audioguide (tab AudioGuides)
- [ ] **Attendre 10 secondes max**
- [ ] **Vérifier**:
  - [ ] Badge "🎯 Geofence triggered" apparaît sur carte
  - [ ] AudioPlayer s'ouvre automatiquement en bas
  - [ ] Audio correspondant au waypoint se lance
  - [ ] Titre audioguide correct

### Test 7: Geofencing - Multi-waypoints
- [ ] Dans Fake GPS, changer position vers autre waypoint
- [ ] Attendre 10 secondes
- [ ] **Vérifier**:
  - [ ] Nouveau badge geofence
  - [ ] Audioguide change automatiquement
  - [ ] Nouveau audio se lance
- [ ] Répéter avec 2-3 waypoints différents
- [ ] Tous les waypoints doivent déclencher auto-play

---

## 🐛 PROBLÈMES RENCONTRÉS

### Problème 1:
**Description**:  
**Solution**:  
**Status**:

### Problème 2:
**Description**:  
**Solution**:  
**Status**:

---

## 📊 RÉSULTATS TESTS

### Navigation (Test 1)
- **Status**: 
- **Notes**:

### Tab 'info' sans carte (Test 2)
- **Status**: 
- **Notes**:

### Tab 'audioguides' avec map (Test 3)
- **Status**: 
- **Notes**:

### Filtres Map.tsx (Test 4)
- **Status**: 
- **Notes**:

### Geofencing auto-play (Test 6)
- **Status**: 
- **Notes**:

### Geofencing multi-waypoints (Test 7)
- **Status**: 
- **Notes**:

---

## 📸 SCREENSHOTS (Optionnel)

- [ ] Screenshot tab 'info' (sans carte)
- [ ] Screenshot tab 'audioguides' (avec carte)
- [ ] Screenshot Map.tsx avec filtres
- [ ] Screenshot geofence triggered

---

## ✅ VALIDATION FINALE

### Critères de succès:
- [ ] Tab 'info' ne contient PAS de carte ✅
- [ ] Tab 'audioguides' contient carte 400px + liste ✅
- [ ] Filtres Map.tsx fonctionnent (Tous/Attractions/Circuits) ✅
- [ ] Geofencing déclenche auto-play audio ✅
- [ ] Multi-waypoints changent audioguide automatiquement ✅
- [ ] Aucun crash ou erreur bloquante ✅

### Si tous les critères sont validés:
**🎉 INTÉGRATION MAP + GEOFENCING RÉUSSIE ! ✅**

---

## 🚀 PROCHAINES ÉTAPES

Si tests OK:
1. [ ] Git commit tests réussis
2. [ ] Mettre à jour documentation (.github/copilot-instructions.md)
3. [ ] Build release APK pour production
4. [ ] Tests utilisateurs réels (sans Fake GPS)

Si tests KO:
1. [ ] Documenter problèmes
2. [ ] Vérifier Logcat Android Studio
3. [ ] Corriger bugs
4. [ ] Relancer `.\clean-android.ps1`
5. [ ] Re-tester

---

**📅 Date début tests**: _____________  
**⏱️ Durée tests**: _____________  
**📅 Date fin tests**: _____________  
**👤 Testeur**: _____________  
**✅ Résultat global**: ⬜ RÉUSSI  ⬜ ÉCHOUÉ  ⬜ PARTIEL
