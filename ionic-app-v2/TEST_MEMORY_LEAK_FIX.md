# Test du Fix Memory Leak - Pattern Ref-Based Cleanup

## ✅ Corrections Appliquées (14 octobre 2025)

### Problème Initial
- **Symptôme** : Warning `Can't perform a React state update on an unmounted component`
- **Cause** : `useIonViewDidEnter` n'a pas de fonction de cleanup comme `useEffect`
- **Impact** : Les opérations async continuent après navigation, causant des erreurs

### Solution Implémentée

**Pattern Ref-Based Cleanup** appliqué à 5 pages :

```tsx
// 1. Initialisation à FALSE (crucial!)
const isMountedRef = useRef(false);

// 2. Activer lors de l'entrée
useIonViewDidEnter(() => {
  isMountedRef.current = true;
  console.log('📱 Page active');
  loadData();
});

// 3. Désactiver lors de la sortie
useIonViewWillLeave(() => {
  isMountedRef.current = false;
  console.log('📱 Page inactive');
});

// 4. Vérifier dans les fonctions async
const loadData = async () => {
  if (!isMountedRef.current) return;
  setLoading(true);
  const response = await axios.get(url);
  if (!isMountedRef.current) return;
  setData(response.data);
  if (isMountedRef.current) setLoading(false);
};
```

### Fichiers Modifiés

#### 1. **Home.tsx** ✅
- `isMountedRef = useRef(false)` ⚠️ Changé de `true` à `false`
- Fonctions modifiées :
  - `loadAttractions()`
  - `loadTours()`
  - `loadFavorites()`

#### 2. **Favorites.tsx** ✅
- `isMountedRef = useRef(false)` ⚠️ Changé de `true` à `false`
- Fonctions modifiées :
  - `loadFavorites()`

#### 3. **Map.tsx** ✅
- `isMountedRef = useRef(false)` ⚠️ Changé de `true` à `false`
- Fonctions modifiées :
  - `loadAttractions()`
  - `getUserLocation()`

#### 4. **Profile.tsx** ✅
- `isMountedRef = useRef(false)` ⚠️ Changé de `true` à `false`
- Fonctions modifiées :
  - `loadCacheStats()`
  - `loadUserStats()`

#### 5. **AttractionDetail.tsx** ✅
- `isMountedRef = useRef(false)` ⚠️ Changé de `true` à `false`
- Fonctions modifiées :
  - `loadAttraction()`
  - `loadAudioGuides()`
  - `checkFavorite()`
  - `loadReviews()`

---

## 🧪 Plan de Test (15-20 min)

### Pré-requis
- ✅ Serveur dev lancé : `npm run dev`
- ✅ Backend API running sur `http://localhost:5000`
- ✅ Console DevTools ouverte (F12)

### Test 1 : Navigation Simple entre Tabs (5 min)

**Objectif** : Vérifier qu'il n'y a plus de warning memory leak

**Étapes** :
1. Ouvrir `http://localhost:5173/`
2. Ouvrir la Console DevTools (F12 → Console)
3. Effacer la console (`Ctrl+L`)
4. **Naviguer** : Home → Map → Favorites → Profile → Home
5. **Répéter** 3 fois ce cycle de navigation

**Résultat Attendu** :
- ✅ Console montre `📱 [Page] - Page active`
- ✅ Console montre `📱 [Page] - Page inactive`
- ❌ **AUCUN** warning `Can't perform a React state update...`
- ✅ Les données se chargent correctement à chaque navigation

**Résultat** : ⬜ À tester

---

### Test 2 : Navigation Rapide (Stress Test) (3 min)

**Objectif** : Vérifier que les opérations async sont bien annulées

**Étapes** :
1. Effacer la console
2. **Naviguer RAPIDEMENT** entre les tabs (cliquer vite) :
   - Home → Map → Favorites → Profile → Home (en 2 secondes)
3. Répéter 5 fois
4. Attendre 5 secondes
5. Observer la console

**Résultat Attendu** :
- ✅ Beaucoup de logs `Page active` et `Page inactive`
- ❌ **AUCUN** warning memory leak
- ✅ Application reste stable et réactive

**Résultat** : ⬜ À tester

---

### Test 3 : Navigation vers AttractionDetail (5 min)

**Objectif** : Vérifier que le pattern fonctionne avec des paramètres de route

**Étapes** :
1. Aller sur Home
2. Cliquer sur une attraction (ex: Basilique Notre-Dame de la Paix)
3. Observer la console
4. Cliquer sur Back/Retour
5. Cliquer sur une AUTRE attraction
6. Observer la console
7. Répéter 3 fois avec différentes attractions

**Résultat Attendu** :
- ✅ `📱 AttractionDetail - Page active, rechargement des données pour: [id]`
- ✅ `📱 AttractionDetail - Page inactive`
- ✅ `🔄 ID changé, rechargement des données pour: [new-id]`
- ❌ **AUCUN** warning memory leak
- ✅ Les données se chargent correctement pour chaque attraction

**Résultat** : ⬜ À tester

---

### Test 4 : Rechargement de Page (2 min)

**Objectif** : Vérifier que le pattern fonctionne après un hard reload

**Étapes** :
1. Naviguer vers Map
2. **Recharger la page** (`F5` ou `Ctrl+R`)
3. Observer la console
4. Naviguer vers Home
5. Observer la console

**Résultat Attendu** :
- ✅ `📱 Map - Page active` après reload
- ✅ Navigation fonctionne normalement
- ❌ **AUCUN** warning memory leak

**Résultat** : ⬜ À tester

---

### Test 5 : Longue Attente sur API (3 min)

**Objectif** : Vérifier que les requêtes lentes sont bien annulées

**Étapes** :
1. Aller sur Home (qui charge attractions, tours, favorites)
2. **IMMÉDIATEMENT** cliquer sur Map (avant la fin du chargement)
3. Observer la console
4. **IMMÉDIATEMENT** cliquer sur Favorites
5. Observer la console

**Résultat Attendu** :
- ✅ Logs `Page inactive` pour Home
- ✅ Les requêtes Home ne mettent PAS à jour l'état après navigation
- ❌ **AUCUN** warning memory leak
- ✅ Seule la page active (Favorites) affiche ses données

**Résultat** : ⬜ À tester

---

## 📊 Résumé des Résultats

| Test | Statut | Warnings | Notes |
|------|--------|----------|-------|
| Navigation Simple | ⬜ | - | - |
| Navigation Rapide | ⬜ | - | - |
| AttractionDetail | ⬜ | - | - |
| Rechargement Page | ⬜ | - | - |
| API Lente | ⬜ | - | - |

**Légende** :
- ✅ Succès
- ⚠️ Warning mineur
- ❌ Échec

---

## 🐛 Si Problèmes Persistent

### Symptôme : Warning "Can't perform..." toujours présent

**Diagnostic** :
```bash
# 1. Vérifier que les refs sont bien à false
grep -n "useRef(true)" ionic-app-v2/src/pages/*.tsx

# Résultat attendu : AUCUN match (tous doivent être useRef(false))
```

**Solutions** :
1. Vérifier que TOUS les `useRef` sont initialisés à `false`
2. Vérifier que `useIonViewDidEnter` met bien `isMountedRef.current = true`
3. Vérifier que `useIonViewWillLeave` met bien `isMountedRef.current = false`

### Symptôme : Données ne se chargent pas

**Diagnostic** :
- Console montre `📱 Page active` ?
- Console montre des logs d'API (✅ ou ❌) ?

**Solutions** :
1. Vérifier que les fonctions `loadData()` n'ont PLUS de paramètre `isMounted`
2. Vérifier que les appels dans `useIonViewDidEnter` sont sans paramètre : `loadData()` et pas `loadData(true)`

### Symptôme : Application nécessite reload manuel

**Cause Possible** : `isMountedRef` bloque le chargement

**Solution** :
```tsx
// ❌ MAUVAIS - ref reste true après première visite
const isMountedRef = useRef(true);

// ✅ BON - ref démarre false, activée par useIonViewDidEnter
const isMountedRef = useRef(false);
```

---

## 📈 Améliorations Futures (Optionnel)

### Custom Hook Réutilisable

```tsx
// hooks/useIonicPageLifecycle.ts
import { useRef } from 'react';
import { useIonViewDidEnter, useIonViewWillLeave } from '@ionic/react';

export const useIonicPageLifecycle = () => {
  const isMountedRef = useRef(false);

  useIonViewDidEnter(() => {
    isMountedRef.current = true;
  });

  useIonViewWillLeave(() => {
    isMountedRef.current = false;
  });

  return isMountedRef;
};

// Utilisation dans les pages
const HomePage: React.FC = () => {
  const isMountedRef = useIonicPageLifecycle();
  
  useIonViewDidEnter(() => {
    loadData();
  });
  
  const loadData = async () => {
    if (!isMountedRef.current) return;
    // ...
  };
};
```

---

## ✅ Checklist Validation Finale

Avant de considérer le fix comme complet :

- [ ] Tous les 5 tests passent sans warning
- [ ] Navigation fluide entre toutes les pages
- [ ] Données se chargent correctement à chaque visite
- [ ] Console affiche uniquement les logs `Page active/inactive`
- [ ] Aucun warning `Can't perform React state update...`
- [ ] Application fonctionne après hard reload (F5)
- [ ] Navigation rapide (stress test) ne cause pas de crash

**Date de Validation** : ________________

**Validé par** : ________________

**Commentaires** :
```


```

---

## 📝 Notes Techniques

### Pourquoi `useRef(false)` et pas `useRef(true)` ?

**Problème avec `useRef(true)`** :
- Au premier montage du composant, `isMountedRef.current = true`
- Ionic garde les composants montés en mémoire (optimisation)
- Quand on navigue vers une autre page puis revient :
  - `isMountedRef.current` est toujours `true` (jamais réinitialisé)
  - `useIonViewDidEnter` s'exécute mais ref est déjà `true`
  - Les vérifications `if (!isMountedRef.current) return;` ne bloquent RIEN
  - Les opérations async précédentes continuent et causent le warning

**Solution avec `useRef(false)`** :
- Au premier montage du composant, `isMountedRef.current = false`
- `useIonViewDidEnter` met `isMountedRef.current = true` → autorise les opérations
- `useIonViewWillLeave` met `isMountedRef.current = false` → bloque les opérations
- Quand on revient sur la page :
  - `isMountedRef.current` est `false` (mis par `useIonViewWillLeave`)
  - `useIonViewDidEnter` met `true` → autorise à nouveau
  - Cycle correct : `false → true → false → true → ...`

### Lifecycle Ionic vs React

```tsx
// React (useEffect)
useEffect(() => {
  let isMounted = true;
  loadData(isMounted);
  
  return () => { 
    isMounted = false; // ✅ Cleanup automatique
  };
}, []);

// Ionic (useIonViewDidEnter)
useIonViewDidEnter(() => {
  loadData();
  // ❌ PAS de return cleanup possible!
  // Solution : useRef + useIonViewWillLeave
});
```

---

**Dernière mise à jour** : 14 octobre 2025, 23:45
