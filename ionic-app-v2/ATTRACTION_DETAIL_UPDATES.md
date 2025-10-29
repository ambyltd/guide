# Modifications AttractionDetail - 28 Octobre 2025

## Résumé des Changements

Deux modifications majeures ont été apportées à la page `AttractionDetail.tsx` :

1. **Onglet AudioGuides masqué**
2. **FAB Location ouvre l'app Maps native** (au lieu de la page Map interne)

---

## 1. Onglet AudioGuides Masqué ❌

### Changement

L'onglet "AudioGuides" dans le segment de navigation a été commenté et masqué.

**Avant** :
```tsx
<IonSegment value={selectedTab}>
  <IonSegmentButton value="info">
    <IonLabel>Informations</IonLabel>
  </IonSegmentButton>
  <IonSegmentButton value="audioguides">  // ✅ VISIBLE
    <IonLabel>
      AudioGuides
      {audioGuides.length > 0 && (
        <IonBadge color="primary">{audioGuides.length}</IonBadge>
      )}
    </IonLabel>
  </IonSegmentButton>
  <IonSegmentButton value="photos">
    <IonLabel>Photos</IonLabel>
  </IonSegmentButton>
  <IonSegmentButton value="reviews">
    <IonLabel>Avis</IonLabel>
  </IonSegmentButton>
</IonSegment>
```

**Après** :
```tsx
<IonSegment value={selectedTab}>
  <IonSegmentButton value="info">
    <IonLabel>Informations</IonLabel>
  </IonSegmentButton>
  {/* ONGLET AUDIOGUIDES MASQUÉ
  <IonSegmentButton value="audioguides">
    <IonLabel>
      AudioGuides
      {audioGuides.length > 0 && (
        <IonBadge color="primary">{audioGuides.length}</IonBadge>
      )}
    </IonLabel>
  </IonSegmentButton>
  */}
  <IonSegmentButton value="photos">  // ❌ MASQUÉ
    <IonLabel>Photos</IonLabel>
  </IonSegmentButton>
  <IonSegmentButton value="reviews">
    <IonLabel>Avis</IonLabel>
  </IonSegmentButton>
</IonSegment>
```

### Impact UI

**Onglets visibles maintenant** :
- ✅ Informations (par défaut)
- ✅ Photos
- ✅ Avis

**Onglet masqué** :
- ❌ AudioGuides (contenu toujours présent dans le code, juste pas accessible via l'UI)

### Pourquoi ?

Simplification de l'interface utilisateur. Les audioguides restent accessibles via d'autres moyens (QR code, page AudioGuides dédiée, etc.).

---

## 2. FAB Location → Maps Native 🗺️

### Changement

Le bouton FAB (Floating Action Button) avec l'icône de navigation ouvre maintenant l'application Maps native du téléphone avec l'itinéraire entre la position de l'utilisateur et l'attraction.

### Code Avant

```typescript
const goToMap = () => {
  if (attraction) {
    history.push(`/tabs/map?attractionId=${attraction._id}`);
  }
};
```

**Comportement** : Navigation interne vers la page Map de l'app avec l'attraction sélectionnée.

---

### Code Après

```typescript
const goToMap = () => {
  if (attraction && attraction.gpsLocation) {
    const lat = attraction.gpsLocation.coordinates[1]; // Latitude
    const lng = attraction.gpsLocation.coordinates[0]; // Longitude
    
    // Récupérer position actuelle de l'utilisateur
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const userLat = position.coords.latitude;
        const userLng = position.coords.longitude;
        
        // Construire URL pour Maps avec origine (user) et destination (attraction)
        let mapsUrl = '';
        
        // Détection plateforme
        const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
        const isAndroid = /Android/.test(navigator.userAgent);
        
        if (isIOS) {
          // iOS: Apple Maps avec directions
          mapsUrl = `maps://maps.apple.com/?saddr=${userLat},${userLng}&daddr=${lat},${lng}&dirflg=d`;
        } else if (isAndroid) {
          // Android: Google Maps avec directions
          mapsUrl = `https://www.google.com/maps/dir/?api=1&origin=${userLat},${userLng}&destination=${lat},${lng}&travelmode=driving`;
        } else {
          // Fallback: Google Maps web
          mapsUrl = `https://www.google.com/maps/dir/?api=1&origin=${userLat},${userLng}&destination=${lat},${lng}&travelmode=driving`;
        }
        
        // Ouvrir Maps native
        window.open(mapsUrl, '_system');
        
        console.log(`📍 Ouverture Maps native: ${attraction.name} (${lat}, ${lng})`);
      },
      (error) => {
        console.error('Erreur géolocalisation:', error);
        
        // Fallback: ouvrir juste la position de l'attraction sans origine
        let mapsUrl = '';
        const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
        const isAndroid = /Android/.test(navigator.userAgent);
        
        if (isIOS) {
          mapsUrl = `maps://maps.apple.com/?daddr=${lat},${lng}&dirflg=d`;
        } else if (isAndroid) {
          mapsUrl = `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}&travelmode=driving`;
        } else {
          mapsUrl = `https://www.google.com/maps/search/?api=1&query=${lat},${lng}`;
        }
        
        window.open(mapsUrl, '_system');
      },
      { enableHighAccuracy: true, timeout: 5000, maximumAge: 0 }
    );
  }
};
```

**Comportement** : Ouvre l'application Maps native (Apple Maps sur iOS, Google Maps sur Android) avec l'itinéraire GPS calculé entre la position actuelle de l'utilisateur et l'attraction.

---

### Fonctionnalités Implémentées

#### **1. Détection Position Utilisateur** 📍

```typescript
navigator.geolocation.getCurrentPosition(
  (position) => {
    const userLat = position.coords.latitude;
    const userLng = position.coords.longitude;
    // ...
  },
  (error) => {
    console.error('Erreur géolocalisation:', error);
    // Fallback sans position utilisateur
  },
  { enableHighAccuracy: true, timeout: 5000, maximumAge: 0 }
);
```

**Paramètres** :
- `enableHighAccuracy: true` → GPS haute précision
- `timeout: 5000` → Timeout 5 secondes
- `maximumAge: 0` → Ne pas utiliser position en cache

---

#### **2. Détection Plateforme** 🔍

```typescript
const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
const isAndroid = /Android/.test(navigator.userAgent);
```

**Résultat** :
- iOS → Apple Maps (`maps://`)
- Android → Google Maps (`https://www.google.com/maps/`)
- Autre → Google Maps Web

---

#### **3. Construction URL Maps** 🗺️

##### **iOS (Apple Maps)**

```typescript
// Avec position utilisateur
maps://maps.apple.com/?saddr=6.8165,-5.2895&daddr=6.8065,-5.2825&dirflg=d

// Sans position utilisateur (fallback)
maps://maps.apple.com/?daddr=6.8065,-5.2825&dirflg=d
```

**Paramètres** :
- `saddr` = Source Address (position utilisateur)
- `daddr` = Destination Address (attraction)
- `dirflg=d` = Driving mode

---

##### **Android (Google Maps)**

```typescript
// Avec position utilisateur
https://www.google.com/maps/dir/?api=1&origin=6.8165,-5.2895&destination=6.8065,-5.2825&travelmode=driving

// Sans position utilisateur (fallback)
https://www.google.com/maps/dir/?api=1&destination=6.8065,-5.2825&travelmode=driving
```

**Paramètres** :
- `api=1` = Version API Google Maps
- `origin` = Position de départ (utilisateur)
- `destination` = Position d'arrivée (attraction)
- `travelmode=driving` = Mode voiture

---

##### **Fallback (Google Maps Web)**

```typescript
// Si erreur géolocalisation ou plateforme non détectée
https://www.google.com/maps/search/?api=1&query=6.8065,-5.2825
```

**Paramètres** :
- `query` = Coordonnées GPS de l'attraction (simple marqueur)

---

#### **4. Ouverture App Native** 📱

```typescript
window.open(mapsUrl, '_system');
```

**`_system`** : Ouvre le lien dans le navigateur/app système externe (pas dans WebView Ionic).

**Comportement** :
- iOS → Ouvre Apple Maps native
- Android → Ouvre Google Maps app (si installée) ou Maps web
- Desktop → Ouvre Google Maps dans navigateur par défaut

---

### Scénarios d'Utilisation

#### **Scénario 1 : Utilisateur avec GPS activé** ✅

```
1. Utilisateur ouvre AttractionDetail (Basilique Notre-Dame)
2. Clique sur FAB location (bouton bleu avec icône navigateOutline)
3. Prompt permission "Autoriser accès position ?" → Accepter
4. Position utilisateur récupérée: (6.8165, -5.2895)
5. URL construite:
   Android: https://www.google.com/maps/dir/?api=1&origin=6.8165,-5.2895&destination=6.8065,-5.2825&travelmode=driving
6. Google Maps s'ouvre avec itinéraire calculé
7. Affichage:
   - Point A (bleu): Position utilisateur
   - Point B (rouge): Basilique Notre-Dame
   - Trajet calculé avec distance/temps estimé
```

---

#### **Scénario 2 : Utilisateur refuse permission GPS** ⚠️

```
1. Utilisateur clique sur FAB location
2. Prompt permission "Autoriser accès position ?" → Refuser
3. Callback error déclenché
4. Fallback URL construite:
   Android: https://www.google.com/maps/dir/?api=1&destination=6.8065,-5.2825&travelmode=driving
5. Google Maps s'ouvre sans origine
6. Affichage:
   - Point B (rouge): Basilique Notre-Dame
   - Utilisateur doit entrer manuellement sa position de départ
```

---

#### **Scénario 3 : GPS timeout (indoor, signal faible)** ⏱️

```
1. Utilisateur clique sur FAB location
2. getCurrentPosition() timeout après 5 secondes
3. Callback error déclenché
4. Fallback appliqué (même que Scénario 2)
5. Google Maps s'ouvre avec seulement destination
```

---

#### **Scénario 4 : iOS (Apple Maps)** 🍎

```
1. iPhone user clique sur FAB location
2. Position récupérée: (6.8165, -5.2895)
3. URL construite:
   maps://maps.apple.com/?saddr=6.8165,-5.2895&daddr=6.8065,-5.2825&dirflg=d
4. Apple Maps s'ouvre automatiquement
5. Itinéraire calculé en mode driving
```

---

### Console Logs

**Success** ✅ :
```bash
📍 Ouverture Maps native: Basilique Notre-Dame de la Paix (6.8065, -5.2825)
```

**Error** ❌ :
```bash
Erreur géolocalisation: GeolocationPositionError { code: 1, message: "User denied Geolocation" }
# Ou
Erreur géolocalisation: GeolocationPositionError { code: 3, message: "Timeout expired" }
```

---

### Permissions Requises

#### **Android (AndroidManifest.xml)**

```xml
<!-- Déjà présentes -->
<uses-permission android:name="android.permission.ACCESS_FINE_LOCATION" />
<uses-permission android:name="android.permission.ACCESS_COARSE_LOCATION" />
```

#### **iOS (Info.plist)**

```xml
<!-- Déjà présentes -->
<key>NSLocationWhenInUseUsageDescription</key>
<string>Nous avons besoin de votre position pour afficher l'itinéraire vers l'attraction</string>
```

---

## Avantages des Modifications

### **1. Onglet AudioGuides Masqué**

✅ **Interface simplifiée** - 3 onglets au lieu de 4  
✅ **Focus sur contenu principal** - Informations, Photos, Avis  
✅ **Réduction cognitive load** - Moins de choix pour l'utilisateur  

### **2. FAB Location → Maps Native**

✅ **Navigation GPS réelle** - Utilise l'app Maps native avec toutes ses fonctionnalités :
   - Guidage vocal
   - Trafic en temps réel
   - Options de transport (voiture, vélo, marche)
   - Street View
   - Sauvegarde d'itinéraires

✅ **Meilleure UX** - L'utilisateur connaît déjà l'interface Maps native  
✅ **Économie batterie** - Pas besoin de maintenir une carte dans l'app  
✅ **Intégration système** - Navigation en arrière-plan pendant que l'app est fermée  

---

## Tests Recommandés

### **Test 1 : Onglet AudioGuides Masqué** (2 min)

```bash
1. Ouvrir app → Home
2. Tap sur une attraction (ex: Basilique)
3. Vérifier AttractionDetail s'ouvre
4. Vérifier segment navigation affiche:
   ✅ Informations (sélectionné par défaut)
   ✅ Photos
   ✅ Avis
   ❌ AudioGuides (masqué)
```

**Résultat attendu** : Seulement 3 onglets visibles, pas d'onglet AudioGuides.

---

### **Test 2 : FAB Location - GPS OK** (5 min)

```bash
1. Ouvrir app → Attraction (Basilique)
2. Activer GPS sur device
3. Scroll vers le bas de la page
4. Cliquer sur FAB bleu (coin bas droit, icône navigation)
5. Dialog "Autoriser accès position ?" → Accepter
6. Vérifier:
   ✅ Google Maps (Android) ou Apple Maps (iOS) s'ouvre
   ✅ Point A (bleu): Position actuelle visible
   ✅ Point B (rouge): Basilique Notre-Dame
   ✅ Itinéraire calculé avec distance/temps
   ✅ Bouton "Démarrer" pour navigation
```

**Résultat attendu** : Maps native s'ouvre avec itinéraire complet.

---

### **Test 3 : FAB Location - GPS Refusé** (3 min)

```bash
1. Settings Android → Apps → AudioGuide → Permissions → Position → Refuser
2. Ouvrir app → Attraction (Basilique)
3. Cliquer sur FAB location
4. Vérifier:
   ✅ Google Maps s'ouvre
   ❌ Pas de point A (position utilisateur)
   ✅ Point B (rouge): Basilique Notre-Dame
   ⚠️ Message "Entrez votre position de départ"
```

**Résultat attendu** : Maps s'ouvre avec seulement destination (fallback).

---

### **Test 4 : Console Logs** (2 min)

```bash
1. Ouvrir Chrome DevTools (chrome://inspect)
2. Connecter device Android
3. Ouvrir app → Attraction → Clic FAB location
4. Vérifier console:
   ✅ "📍 Ouverture Maps native: Basilique Notre-Dame de la Paix (6.8065, -5.2825)"
   OU
   ❌ "Erreur géolocalisation: GeolocationPositionError { code: 1 }"
```

**Résultat attendu** : Logs confirment succès ou erreur géolocalisation.

---

## Build & Déploiement

### **Build Réussi** ✅

```bash
npm run build
# ✓ built in 23.04s
# 0 erreurs TypeScript
# PWA: 20 entries (2802.83 KiB)
```

### **Sync Android** ✅

```bash
npx cap sync android
# ✓ Sync finished in 0.313s
# 7 plugins Capacitor synchronized
```

### **Prochaine Étape**

```bash
npx cap open android
# Build → Build APK
# Installer sur device via USB
# Tester modifications (10 min)
```

---

## Rollback (si nécessaire)

### **Restaurer Onglet AudioGuides**

```typescript
// Décommenter lignes 671-680 dans AttractionDetail.tsx
<IonSegmentButton value="audioguides">
  <IonLabel>
    AudioGuides
    {audioGuides.length > 0 && (
      <IonBadge color="primary" style={{ marginLeft: '5px' }}>
        {audioGuides.length}
      </IonBadge>
    )}
  </IonLabel>
</IonSegmentButton>
```

### **Restaurer Navigation Interne**

```typescript
// Remplacer fonction goToMap (ligne 415)
const goToMap = () => {
  if (attraction) {
    history.push(`/tabs/map?attractionId=${attraction._id}`);
  }
};
```

Puis rebuild et sync :
```bash
npm run build
npx cap sync android
```

---

## Fichiers Modifiés

- ✅ `ionic-app-v2/src/pages/AttractionDetail.tsx` (2 modifications)
- ✅ Build production validé (23.04s, 0 erreurs)
- ✅ Sync Android validé (0.313s)

**Date** : 28 octobre 2025  
**Status** : ✅ COMPLÉTÉ - Prêt pour tests device  
**Next** : Build APK + Tests sur device Android (10 min)
