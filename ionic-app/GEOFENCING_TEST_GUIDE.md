# Guide de Test - Notifications de Proximité (Geofencing)

## ✅ Sprint 3 - Phase 1 Terminée

### 📦 Ce qui a été implémenté

#### 1. Service de Notifications (`notificationService.ts`)
- ✅ Gestion des permissions LocalNotifications
- ✅ Initialisation et listeners d'événements
- ✅ 5 types de notifications :
  - `notifyProximity()` - Attraction à distance variable
  - `notifyGeofenceEnter()` - Entrée dans zone (200m)
  - `notifyGeofenceExit()` - Sortie de zone
  - `notifyDownloadComplete()` - Téléchargement audio terminé
  - `notifySyncComplete()` - Synchronisation réussie

#### 2. Hook React (`useGeofencing.ts`)
- ✅ Calcul automatique des distances (formule Haversine)
- ✅ Détection entrée/sortie de zones (rayon configurable, défaut 200m)
- ✅ Mise à jour position toutes les 10 secondes
- ✅ État géré : `isActive`, `currentLocation`, `nearbyAttractions`, `activeRegions`
- ✅ API simple : `startGeofencing()`, `stopGeofencing()`, `checkProximity()`

#### 3. Intégration Map.tsx
- ✅ Hook `useGeofencing` activé au montage de la page
- ✅ Badge avec compteur d'attractions proches dans header
- ✅ Icône notifications (🔔) en vert quand actif
- ✅ Vérification automatique de proximité sur `filteredAttractions`

---

## 🧪 Comment Tester

### Option 1 : Test sur Android (Recommandé)

```powershell
# Dans ionic-app/
npx cap sync android
npx cap run android
```

**Étapes de test :**

1. **Accepter les permissions** au lancement :
   - Permission localisation (obligatoire)
   - Permission notifications (obligatoire)

2. **Ouvrir l'onglet Map** 🗺️

3. **Vérifier l'indicateur geofencing** :
   - Icône 🔔 verte visible dans header
   - Badge rouge si attractions proches

4. **Simuler déplacement** (Android Studio Emulator) :
   - Ouvrir "Extended Controls" (⋯ sur sidebar)
   - Section "Location"
   - Entrer coordonnées d'attractions :
     - **Basilique Notre-Dame de la Paix** : `6.8107, -5.2894`
     - **Musée des Civilisations** : `5.3160, -4.0305`
     - **Parc National de Taï** : `5.8664, -7.3538`
   - Cliquer "Send" pour chaque position

5. **Observer les notifications** :
   - Notification "🎯 Vous êtes arrivé !" quand < 200m
   - Badge compteur augmente
   - Notification "👋 Au revoir !" quand > 200m

6. **Cliquer sur notification** :
   - Devrait ouvrir l'attraction dans AttractionDetail.tsx
   - (Navigation automatique configurée dans notificationService)

---

### Option 2 : Test sur iOS

```powershell
# Dans ionic-app/
npx cap sync ios
npx cap open ios
```

**Prérequis :**
- Xcode installé (macOS uniquement)
- Apple Developer account (gratuit)
- Appareil iOS physique (les notifications ne fonctionnent pas toujours sur simulateur)

**Étapes similaires à Android**

---

### Option 3 : Test avec Appareil Physique (Meilleur pour GPS réel)

#### Android via USB :

```powershell
# 1. Activer "Débogage USB" sur téléphone Android
# 2. Brancher via USB
# 3. Autoriser débogage sur téléphone

npx cap run android --target <device-id>
```

#### iOS via Lightning/USB-C :

```powershell
# 1. Ouvrir Xcode (npx cap open ios)
# 2. Connecter iPhone
# 3. Sélectionner appareil dans Xcode
# 4. Cliquer "Run" (▶️)
```

**Avantages test physique :**
- GPS réel (déplacement effectif)
- Notifications push natives
- Vibration et sons réels
- Test en conditions réelles (indoor/outdoor)

---

### Option 4 : Mode Mock (Données simulées)

Si les permissions sont refusées ou géolocalisation indisponible, le système utilise le **fallback Abidjan** :

```typescript
// Position fallback (geolocationService.ts)
const fallbackLocation: Location = {
  latitude: 5.3599517,   // Centre d'Abidjan
  longitude: -4.0082563, // Côte d'Ivoire
  accuracy: 1000,
  timestamp: Date.now()
};
```

Pour tester manuellement les notifications sans GPS :

1. **Ouvrir Console navigateur** (F12)
2. **Exécuter dans console** :

```javascript
// Import service (déjà disponible globalement dans dev)
const { notificationService } = window;

// Test notification proximité
await notificationService.notifyProximity('Basilique Notre-Dame', 'attraction-1', 150);

// Test entrée zone
await notificationService.notifyGeofenceEnter('Musée des Civilisations', 'attraction-2');

// Test sortie zone
await notificationService.notifyGeofenceExit('Parc National de Taï', 'attraction-3');
```

---

## 📊 Logs de Débogage

### Console Logs Attendus

**Au démarrage de Map.tsx :**
```
✅ Permissions notifications déjà accordées
✅ Geofencing démarré
🎯 Geofencing activé sur Map.tsx
```

**Pendant tracking (toutes les 10s) :**
```
📍 Position: 5.3599517, -4.0082563 (±1000m)
```

**Entrée zone (< 200m) :**
```
📍 Entrée zone: Basilique Notre-Dame de la Paix (150m)
🎯 Notification: Vous êtes arrivé !
```

**Sortie zone (> 200m) :**
```
🚪 Sortie zone: Basilique Notre-Dame de la Paix
👋 Notification: Au revoir !
```

**Au démontage :**
```
🛑 Geofencing arrêté
🛑 Geofencing désactivé sur Map.tsx
```

---

## 🔍 Vérifications

### 1. Vérifier les permissions

**Android** : Settings > Apps > Audio Guide > Permissions
- ✅ Location (Always / While using app)
- ✅ Notifications

**iOS** : Settings > Audio Guide > 
- ✅ Location (While Using App)
- ✅ Notifications (Allow)

### 2. Vérifier le badge dans Map.tsx

- Badge **rouge avec nombre** = Attractions proches détectées
- **Pas de badge** = Aucune attraction < 200m

### 3. Tester clic notification

- Cliquer notification doit :
  1. Ouvrir l'app (si fermée)
  2. Naviguer vers `/tabs/attraction/:id`
  3. Afficher AttractionDetail.tsx

---

## ⚙️ Configuration

### Ajuster le rayon de geofence

Dans `Map.tsx` ligne 70 :

```typescript
const { state: geofencingState, startGeofencing, stopGeofencing, checkProximity } = useGeofencing(200);
//                                                                                                     ^^^
//                                                                                                   Rayon en mètres
```

**Valeurs suggérées :**
- `50` : Très proche (test dev)
- `200` : Défaut (zone piétonne)
- `500` : Zone urbaine étendue
- `1000` : Zone suburbaine

### Modifier la fréquence de mise à jour

Dans `useGeofencing.ts` ligne 163 :

```typescript
}, 10000); // Toutes les 10 secondes
// ^^^^^ 
// Modifier ici (en millisecondes)
```

**Valeurs suggérées :**
- `5000` : Mise à jour rapide (5s) - consomme batterie
- `10000` : Défaut (10s) - bon compromis
- `30000` : Économie batterie (30s)

---

## 🐛 Dépannage

### Problème 1 : Pas de notifications

**Causes possibles :**
- Permissions refusées → Réinstaller app et accepter
- Notifications désactivées système → Vérifier Settings
- App en arrière-plan → iOS limite les notifications background

**Solution :**
```typescript
// Vérifier état permissions dans console
const hasPermission = await notificationService.initialize();
console.log('Permissions notifications:', hasPermission);
```

### Problème 2 : Position toujours Abidjan (fallback)

**Causes possibles :**
- GPS désactivé sur appareil
- Pas de signal GPS (indoor)
- Timeout géolocalisation (30s)

**Solution :**
- Sortir dehors (signal GPS)
- Augmenter timeout dans `geolocationService.ts` :

```typescript
timeout: 30000, // 30 secondes
// Augmenter à 60000 (1 minute) si nécessaire
```

### Problème 3 : Badge ne s'affiche pas

**Causes possibles :**
- `geofencingState.nearbyAttractions.length === 0`
- Aucune attraction dans rayon de 200m

**Solution de test :**
Réduire rayon temporairement pour forcer détection :

```typescript
const { ... } = useGeofencing(5000); // 5 km au lieu de 200m
```

### Problème 4 : Notifications spam (trop fréquentes)

**Cause :**
Position oscille autour de la limite 200m (GPS imprécis)

**Solution :**
Ajouter hysteresis dans `useGeofencing.ts` :

```typescript
// Au lieu de 200m exactement, créer zone tampon
const ENTER_RADIUS = 180; // Entrée à 180m
const EXIT_RADIUS = 220;  // Sortie à 220m (évite oscillations)
```

---

## 📈 Métriques de Performance

**Consommation estimée :**
- Tracking GPS (10s) : ~5% batterie/heure
- Calcul distances : Négligeable (<1% CPU)
- Notifications : ~10 notifications/jour (usage normal)

**Optimisations possibles :**
- Désactiver tracking si app en arrière-plan > 5 min
- Pause tracking si vitesse = 0 (utilisateur statique)
- Augmenter intervalle si batterie < 20%

---

## 🎯 Prochaines Étapes (Sprint 3 - Phases suivantes)

### Phase 2 : Service Worker (2h)
- Offline shell avec Workbox
- Cache pages principales
- Fallback mode dégradé

### Phase 3 : Cache Images (1-2h)
- Téléchargement automatique images
- LRU eviction
- Progress indicators

### Phase 4 : Cache Audios (2h)
- **Remplacer simulation AudioPlayer**
- Téléchargement réel avec progress
- IndexedDB pour stockage

### Phase 5 : Sync Background (2-3h)
- Queue favoris/bookmarks
- Retry avec exponential backoff
- Badge sync status

---

## ✅ Checklist de Validation Phase 1

- [x] notificationService.ts créé (240 lignes)
- [x] useGeofencing.ts créé (189 lignes)
- [x] Map.tsx intégré (badge + auto-start/stop)
- [x] 0 erreurs TypeScript
- [ ] Test Android réussi (à faire)
- [ ] Test iOS réussi (à faire)
- [ ] Test GPS réel (à faire)
- [ ] Navigation notification → AttractionDetail (à tester)

**Status Phase 1 : 🟢 PRÊT POUR TESTS**

---

*Dernière mise à jour : Phase 1 complète, prête pour tests device*
