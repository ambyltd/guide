# ✅ Correction Geofencing - Guide de Validation

## 🐛 Problème Corrigé

**Erreur initiale** : `Response is not an array, using empty geofence regions: Object`

**Cause** : Le service `geolocationService.ts` ne gérait pas correctement le format de réponse API du backend :
```json
{
  "success": true,
  "data": {
    "attractions": [ /* tableau des attractions */ ]
  }
}
```

**Solution** : Modification de la fonction `syncGeofenceRegions()` pour détecter et extraire correctement le tableau imbriqué.

---

## 📝 Changements Appliqués

### Fichier : `ionic-app-v2/src/services/geolocationService.ts`

**Avant** (ligne 451) :
```typescript
const dataObj = data as Record<string, unknown>;
attractions = (dataObj.data || dataObj.attractions || dataObj.results || []) as BackendAttractionData[];
```

**Après** :
```typescript
const dataObj = data as Record<string, unknown>;

// Format backend : { success: true, data: { attractions: [...] } }
if (dataObj.data && typeof dataObj.data === 'object') {
  const nestedData = dataObj.data as Record<string, unknown>;
  attractions = (nestedData.attractions || []) as BackendAttractionData[];
} 
// Formats alternatifs
else {
  attractions = (dataObj.attractions || dataObj.results || []) as BackendAttractionData[];
}
```

**Build** : ✅ Réussi (37.62s, 0 erreurs TypeScript)  
**Sync Android** : ✅ Réussi (1.5s, 7 plugins Capacitor)

---

## 🧪 Tests de Validation

### Test 1 : Chargement des Régions (5 min)

**Objectif** : Vérifier que les attractions sont chargées correctement au démarrage.

**Étapes** :
1. Ouvrir l'app Android
2. Naviguer vers la page **Map**
3. Ouvrir la console Chrome DevTools (`chrome://inspect/#devices`)
4. Observer les logs au chargement

**Résultat attendu** :
```
📍 Loaded X attractions for geofencing
✅ X zones de geofencing chargées depuis le backend
```

**Critères de réussite** :
- ✅ Aucune erreur `Response is not an array`
- ✅ X ≥ 1 (au moins une attraction chargée)
- ✅ Nombre de régions = nombre d'attractions avec `gpsLocation`

---

### Test 2 : Démarrage Geofencing (3 min)

**Objectif** : Valider que le système de geofencing démarre correctement.

**Étapes** :
1. Page **Map** ouverte
2. Activer le toggle **Geofencing** (en haut à droite du badge)
3. Observer la console

**Résultat attendu** :
```
✅ Geofencing démarré
📍 Attractions à proximité : 0/X dans un rayon de 200m
```

**Critères de réussite** :
- ✅ Badge devient vert avec nombre total (ex: `0/10`)
- ✅ Aucune erreur de permissions (ou demande si première fois)
- ✅ Position GPS obtenue (ou fallback Abidjan)

---

### Test 3 : Simulation de Proximité avec Fake GPS (15 min)

**Objectif** : Tester les notifications de proximité en simulant un déplacement.

**Prérequis** :
- App **Fake GPS location** installée (GPS JoyStick ou similaire)
- Coordonnées d'une attraction (exemple : Basilique Notre-Dame de la Paix)

**Étapes** :
1. Démarrer **Fake GPS location**
2. Chercher "Yamoussoukro" ou saisir coordonnées : `6.8199, -5.2767`
3. Placer le marqueur à ~500m de l'attraction (hors rayon 200m)
4. Dans l'app, page **Map**, activer **Geofencing**
5. Observer badge : devrait afficher `0/10` (aucune à proximité)
6. Dans Fake GPS, déplacer le marqueur vers l'attraction (< 200m)
7. Attendre 10 secondes (intervalle de mise à jour GPS)

**Résultat attendu** :
```
📍 Entrée zone: Basilique Notre-Dame de la Paix (150m)
```
- Notification push : **"🎯 Vous êtes arrivé !"**
- Badge devient : `1/10` (une attraction à proximité)

**Test de sortie** :
8. Déplacer le marqueur à > 200m
9. Attendre 10 secondes

**Résultat attendu** :
```
🚪 Sortie zone: Basilique Notre-Dame de la Paix
```
- Badge revient à : `0/10`

**Critères de réussite** :
- ✅ Détection d'entrée < 200m
- ✅ Notification push envoyée
- ✅ Badge mis à jour en temps réel
- ✅ Détection de sortie > 200m

---

### Test 4 : Performances & Stabilité (5 min)

**Objectif** : Vérifier que le système fonctionne sans fuites mémoire.

**Étapes** :
1. Geofencing activé
2. Naviguer entre les pages (Home → Map → Favorites → Profile)
3. Revenir sur **Map**
4. Vérifier console pour erreurs

**Critères de réussite** :
- ✅ Aucune erreur de React Hooks
- ✅ Aucune fuite mémoire (`useEffect` cleanup correct)
- ✅ Geofencing s'arrête automatiquement si on quitte la page Map

---

## 📊 Résultats Attendus

| Test | Durée | Status | Notes |
|------|-------|--------|-------|
| 1. Chargement régions | 5 min | ⏳ À tester | Vérifier logs console |
| 2. Démarrage geofencing | 3 min | ⏳ À tester | Badge vert + nombre |
| 3. Simulation proximité | 15 min | ⏳ À tester | Fake GPS requis |
| 4. Performances | 5 min | ⏳ À tester | Aucune erreur |
| **Total** | **28 min** | **0/4** | - |

---

## 🔧 Débogage (si problèmes)

### Problème : Aucune attraction chargée (X = 0)

**Causes possibles** :
1. Backend non démarré → Vérifier `http://192.168.1.9:5000/api/attractions`
2. Aucune attraction avec `gpsLocation` en DB
3. Format API changé

**Solution** :
```bash
# Depuis backend-api/
npm run dev
# Tester endpoint
curl http://localhost:5000/api/attractions
```

---

### Problème : Geofencing ne démarre pas

**Causes possibles** :
1. Permissions géolocalisation refusées
2. Permissions notifications refusées

**Solution** :
```
Paramètres Android → Apps → Audioguide
→ Permissions → Localisation : Autoriser
→ Permissions → Notifications : Autoriser
```

---

### Problème : Notifications pas reçues

**Causes possibles** :
1. Service `notificationService` non initialisé
2. Batterie en mode économie (bloque background)

**Solution** :
```typescript
// Ajouter log dans ionic-app-v2/src/services/notificationService.ts
async notifyGeofenceEnter(name: string, attractionId: string) {
  console.log('🔔 Tentative notification:', name, attractionId);
  // ...
}
```

---

## ✅ Validation Finale

**Checklist avant de clore le bug** :
- [ ] Test 1 : ✅ Attractions chargées (X ≥ 1)
- [ ] Test 2 : ✅ Geofencing démarre sans erreur
- [ ] Test 3 : ✅ Notifications entrée/sortie fonctionnent
- [ ] Test 4 : ✅ Aucune fuite mémoire ou crash
- [ ] Console : ✅ Aucune erreur `Response is not an array`

**Si tous les tests passent** :
- ✅ **Bug geofencing corrigé**
- Passer aux autres tests Android (cache, audio, QR scanner)

**Si un test échoue** :
- Documenter l'erreur dans `SUIVI_TESTS_DEVICE.md`
- Créer une issue avec logs console et capture d'écran
