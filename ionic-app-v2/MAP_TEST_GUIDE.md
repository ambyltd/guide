# 🧪 GUIDE DE TEST - MAP REFACTORED

## 🎯 Tests Web (5 min - localhost:5173)

### 1. **Chargement Initial**
- [ ] Ouvrir `http://localhost:5173`
- [ ] Naviguer vers tab "Carte"
- [ ] Vérifier: Spinner "Chargement de la carte..." apparaît
- [ ] Vérifier: Carte Mapbox s'affiche après ~2s

### 2. **Markers**
- [ ] Vérifier: Markers bleus (attractions) visibles
- [ ] Vérifier: Position centrée sur Abidjan par défaut
- [ ] Vérifier: Zoom/Pan fonctionne (scroll + drag)
- [ ] Vérifier: Markers cliquables → Popup avec nom

### 3. **Géolocalisation**
- [ ] Click FAB "Locate Me" (bottom-right)
- [ ] Accepter permissions géolocalisation
- [ ] Vérifier: Marker vert (user) apparaît
- [ ] Vérifier: Carte se centre sur position user
- [ ] Vérifier: Toast "📍 Position mise à jour"

### 4. **Recherche**
- [ ] Taper "Basilique" dans barre recherche
- [ ] Vérifier: Markers filtrés (seulement Basilique visible)
- [ ] Vérifier: Compteur attractions mis à jour
- [ ] Clear recherche → Tous markers réapparaissent

### 5. **Filtres**
- [ ] Click chip "🏛️ Attractions"
- [ ] Vérifier: Markers attractions disparaissent
- [ ] Re-click chip → Markers réapparaissent
- [ ] Click chip "🚶 Tours"
- [ ] Vérifier: Markers tours disparaissent

### 6. **Sélection Attraction**
- [ ] Click sur marker Basilique
- [ ] Vérifier: Bottom sheet slide up
- [ ] Vérifier: Image + nom + description
- [ ] Vérifier: Bouton "Voir Détails" présent
- [ ] Vérifier: Bouton "Itinéraire" présent
- [ ] Click X (close) → Bottom sheet disparaît

### 7. **Navigation**
- [ ] Click marker Basilique → Bottom sheet
- [ ] Click "Voir Détails"
- [ ] Vérifier: Navigation vers `/tabs/attraction/:id`
- [ ] Back → Retour Map
- [ ] Click marker → Bottom sheet → Click "Itinéraire"
- [ ] Vérifier: Maps URL dans console (Google Maps)

### 8. **QR Scanner**
- [ ] Click FAB QR (bottom-left)
- [ ] Vérifier: Modal QR scanner s'ouvre
- [ ] Click X (close)
- [ ] Vérifier: Modal se ferme

---

## 📱 Tests Device Android (30 min)

### Pré-requis
```bash
# Build APK
cd ionic-app-v2
npx cap open android

# Dans Android Studio:
# Build > Build Bundle(s) / APK(s) > Build APK(s)
# Wait ~2 min
# Click "locate" pour trouver APK

# Installer sur device:
# Run 'app' > Sélectionner device USB
```

### 1. **Chargement (2 min)**
- [ ] Ouvrir app sur device
- [ ] Naviguer tab "Carte"
- [ ] Vérifier: Tiles Mapbox se chargent (Wi-Fi)
- [ ] Vérifier: Pas de lag/freeze
- [ ] Vérifier: Smooth zoom/pan tactile

### 2. **Géolocalisation Réelle (5 min)**
- [ ] Click FAB "Locate Me"
- [ ] Accepter permissions GPS
- [ ] Vérifier: Marker vert à position réelle
- [ ] Sortir dehors (si intérieur)
- [ ] Attendre ~10s
- [ ] Vérifier: Position mise à jour

### 3. **Geofencing (10 min)**
**Méthode 1: Se déplacer réellement** (si proche attraction)
- [ ] Marcher vers attraction <200m
- [ ] Vérifier: Notification "🎯 Vous êtes proche de [Nom]"
- [ ] Vérifier: Chip geofencing avec compteur
- [ ] S'éloigner >200m
- [ ] Vérifier: Notification disparaît

**Méthode 2: Fake GPS** (développeur)
- [ ] Installer app "Fake GPS Location" (Play Store)
- [ ] Activer Developer Options
- [ ] Settings > Developer > Select mock location app
- [ ] Fake GPS: Coordonnées Basilique (5.318, -4.016)
- [ ] Vérifier: Geofencing détecte proximité
- [ ] Fake GPS: Position éloignée
- [ ] Vérifier: Notification disparaît

### 4. **Markers Tactile (3 min)**
- [ ] Tap marker attraction
- [ ] Vérifier: Bottom sheet slide fluide
- [ ] Vérifier: Image charge correctement
- [ ] Scroll description
- [ ] Tap "Voir Détails" → Navigation OK
- [ ] Back → Map

### 5. **Navigation Native (5 min)**
- [ ] Tap marker Basilique
- [ ] Tap "Itinéraire"
- [ ] Vérifier: Google Maps s'ouvre
- [ ] Vérifier: Itinéraire calculé (origin → destination)
- [ ] Vérifier: Bouton "Démarrer" présent
- [ ] Back → Retour app

### 6. **QR Scanner (3 min)**
- [ ] Tap FAB QR
- [ ] Vérifier: Caméra s'ouvre directement (PAS de page instructions)
- [ ] Vérifier: Frame blanc animé visible
- [ ] Vérifier: Bouton close blanc visible (top-right)
- [ ] Scanner QR code attraction
- [ ] Vérifier: Navigation vers attraction + autoplay
- [ ] Ou: Tap close → Retour Map

### 7. **Performance (2 min)**
- [ ] Zoom in/out rapide (10x)
- [ ] Vérifier: Pas de lag
- [ ] Pan carte rapide (swipe 10x)
- [ ] Vérifier: Tiles Mapbox chargent vite
- [ ] Open/close bottom sheet 5x
- [ ] Vérifier: Animation fluide 60fps

### 8. **Offline (si temps)**
- [ ] Mode Avion ON
- [ ] Naviguer tab Carte
- [ ] Vérifier: Tiles Mapbox en cache affichées
- [ ] Zoom sur zones déjà visitées
- [ ] Vérifier: Pas de "Loading tiles..."
- [ ] Mode Avion OFF

---

## 🐛 Bugs Connus à Vérifier

### Priorité Haute
- [ ] **Markers pas visibles**: Vérifier token Mapbox valide
- [ ] **Géolocalisation timeout**: Vérifier permissions Settings
- [ ] **Bottom sheet pas slide**: Vérifier animation CSS
- [ ] **Google Maps pas ouvert**: Vérifier URL format

### Priorité Moyenne
- [ ] **Tiles pas en cache offline**: Vérifier Service Worker
- [ ] **Geofencing pas détecte**: Vérifier calcul distance
- [ ] **QR Scanner black screen**: Vérifier permissions caméra
- [ ] **Search lag**: Vérifier debounce 300ms

### Priorité Basse
- [ ] **Marker user pas centré**: Vérifier flyTo()
- [ ] **Popup pas fermée**: Vérifier clearMarkers()
- [ ] **Toast spam**: Vérifier conditions affichage

---

## ✅ Critères de Validation

### Must Have (Bloquants)
- ✅ Carte Mapbox s'affiche
- ✅ Markers attractions cliquables
- ✅ Géolocalisation user fonctionne
- ✅ Bottom sheet details affichés
- ✅ Navigation vers AttractionDetail OK
- ✅ Google Maps ouvre avec itinéraire

### Should Have (Important)
- ✅ Geofencing détecte proximité
- ✅ QR Scanner caméra directe
- ✅ Recherche filtre markers
- ✅ Performance fluide (60fps)
- ✅ Tiles Mapbox cache offline

### Nice to Have (Bonus)
- ✅ Animations smooth
- ✅ Responsive layout
- ✅ Dark mode support
- ✅ Accessibility (reduced motion)

---

## 📊 Rapport de Test

### Template à remplir:

```markdown
## Test Report - Map Refactored

**Date**: [DATE]
**Device**: [MODEL] (Android [VERSION])
**Tester**: [NOM]

### Tests Web (/10)
- [ ] Chargement: __/10
- [ ] Markers: __/10
- [ ] Géolocalisation: __/10
- [ ] Recherche: __/10
- [ ] Filtres: __/10
- [ ] Sélection: __/10
- [ ] Navigation: __/10
- [ ] QR Scanner: __/10

**Score Web**: __/80

### Tests Device (/10)
- [ ] Chargement: __/10
- [ ] Géolocalisation: __/10
- [ ] Geofencing: __/10
- [ ] Markers Tactile: __/10
- [ ] Navigation Native: __/10
- [ ] QR Scanner: __/10
- [ ] Performance: __/10

**Score Device**: __/70

### Bugs Trouvés
1. [Description bug 1]
2. [Description bug 2]

### Améliorations Suggérées
1. [Amélioration 1]
2. [Amélioration 2]

### Conclusion
- [ ] ✅ VALIDÉ - Prêt production
- [ ] ⚠️ VALIDÉ AVEC RÉSERVES - Bugs mineurs
- [ ] ❌ BLOQUÉ - Bugs critiques
```

---

## 🚀 Actions Après Tests

### Si VALIDÉ ✅
1. Marquer TODO "Tester Map refactored device" comme COMPLÉTÉ
2. Commit changes: `git add . && git commit -m "feat: Map refactored with Mapbox GL JS"`
3. Push: `git push origin main`
4. Update CHECKLIST: Map refactored ✅

### Si BUGS TROUVÉS ⚠️
1. Créer issues dans MAP_BUGS.md
2. Prioriser (High/Medium/Low)
3. Fix bugs critiques
4. Re-test
5. Valider fix

### Si BLOQUÉ ❌
1. Analyser logs console (chrome://inspect)
2. Vérifier token Mapbox
3. Vérifier permissions Android
4. Rollback Map.tsx ancien si critique
5. Debug avec breakpoints

---

**Temps estimé total**: 35 min (5 min web + 30 min device)
**Status actuel**: 🔲 **PENDING TESTS**
