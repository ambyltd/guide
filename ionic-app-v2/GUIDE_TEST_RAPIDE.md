# 🧪 Guide de Test Rapide - Fix Memory Leak

**Date** : 14 octobre 2025, 23:50  
**Durée estimée** : 5 minutes  
**Statut validation automatique** : ✅ 25/25 tests réussis

---

## ✅ Pré-requis (COMPLÉTÉS)

- [x] Toutes les pages modifiées avec pattern `useRef(false)`
- [x] Hooks `useIonViewDidEnter` + `useIonViewWillLeave` implémentés
- [x] Fonctions async utilisent `isMountedRef.current`
- [x] Serveur dev lancé sur http://localhost:5173/

---

## 🎯 Test 1 : Navigation Simple (2 min)

### Étapes

1. **Ouvrir l'application**
   - URL : http://localhost:5173/
   - Ouvrir DevTools Console (F12)

2. **Effacer la console** : `Ctrl+L`

3. **Naviguer entre les tabs** (cliquer sur chaque tab en bas) :
   ```
   Home → Map → Favorites → Profile → Home
   ```

4. **Observer la console** - Vous devriez voir :
   ```
   📱 Home - Page active, rechargement des données...
   ✅ Attractions chargées: 5
   ✅ Circuits chargés: 2
   ✅ Favoris chargés depuis API: 0
   📱 Home - Page inactive, annulation des opérations...
   
   📱 Map - Page active, rechargement des données...
   ✅ Map - Attractions chargées: 5
   ✅ Position utilisateur obtenue: {...}
   📱 Map - Page inactive
   
   📱 Favorites - Page active, rechargement des données...
   📱 Favorites - Page inactive
   
   📱 Profile - Page active, rechargement des données...
   📱 Profile - Page inactive
   ```

### ✅ Résultat Attendu

- **AUCUN** warning `Warning: Can't perform a React state update on an unmounted component`
- Logs `Page active` et `Page inactive` pour chaque navigation
- Données chargées correctement à chaque visite

### ❌ Si Erreur

- Screenshot du warning
- Copier le message complet
- Noter quelle page cause le problème

---

## ⚡ Test 2 : Navigation Rapide (1 min)

### Étapes

1. **Effacer la console** : `Ctrl+L`

2. **Cliquer RAPIDEMENT** entre les tabs (en 3 secondes) :
   ```
   Home → Map → Favorites → Profile → Home → Map → Favorites
   ```

3. **Attendre 3 secondes**

4. **Observer la console**

### ✅ Résultat Attendu

- Beaucoup de logs `Page active` / `Page inactive`
- **AUCUN** warning memory leak
- Application reste réactive et stable

---

## 🔍 Test 3 : AttractionDetail (2 min)

### Étapes

1. **Aller sur Home tab**

2. **Cliquer sur une attraction** (ex: Basilique Notre-Dame de la Paix)

3. **Observer la console** - Vous devriez voir :
   ```
   📱 AttractionDetail - Page active, rechargement des données pour: [id]
   🔄 ID changé, rechargement des données pour: [id]
   ✅ AudioGuides chargés: X
   ✅ Reviews chargés: X
   ```

4. **Cliquer sur le bouton Back** (flèche en haut à gauche)

5. **Observer la console** :
   ```
   📱 AttractionDetail - Page inactive
   📱 Home - Page active, rechargement des données...
   ```

6. **Cliquer sur une AUTRE attraction**

7. **Observer la console** :
   ```
   📱 Home - Page inactive, annulation des opérations...
   📱 AttractionDetail - Page active, rechargement des données pour: [new-id]
   🔄 ID changé, rechargement des données pour: [new-id]
   ```

### ✅ Résultat Attendu

- **AUCUN** warning memory leak
- Données différentes pour chaque attraction
- Navigation fluide sans rechargement manuel

---

## 📊 Checklist de Validation

Cochez après chaque test :

- [ ] **Test 1** : Navigation simple → Aucun warning
- [ ] **Test 2** : Navigation rapide → Aucun warning
- [ ] **Test 3** : AttractionDetail → Aucun warning
- [ ] **Données** : Se chargent correctement à chaque visite
- [ ] **Performance** : Pas de lag ou freeze
- [ ] **Console** : Uniquement les logs attendus

---

## 🎉 Si Tous les Tests Passent

**SUCCÈS !** Le fix est complet et fonctionnel.

### Prochaines Étapes

1. **Commiter les changements** :
   ```bash
   git add ionic-app-v2/src/pages/*.tsx
   git add ionic-app-v2/validate-memory-leak-fix.cjs
   git add ionic-app-v2/TEST_MEMORY_LEAK_FIX.md
   git commit -m "fix: Résolution memory leak avec pattern ref-based cleanup
   
   - Changement useRef(true) → useRef(false) pour éviter faux positifs
   - Ajout useIonViewWillLeave pour cleanup propre
   - Modification 5 pages: Home, Favorites, Map, Profile, AttractionDetail
   - Modification 14 fonctions async avec vérifications isMountedRef.current
   - Tests: 25/25 réussis, 0 warnings en navigation
   "
   ```

2. **Mettre à jour la documentation** :
   - Ajouter note dans ARCHITECTURE_GEOLOCALISATION.md
   - Mettre à jour PROJET_COMPLETE.md

3. **Continuer le développement** :
   - Sprint 4 : Social & Reviews (phases restantes)
   - Backend API endpoints
   - Tests device Android

---

## ❌ Si Problèmes Persistent

### Diagnostic

1. **Quel warning exactement ?**
   - Copier le message complet
   - Noter le fichier et la ligne

2. **Quelle page ?**
   - Home, Map, Favorites, Profile, ou AttractionDetail ?

3. **Quand ?**
   - Lors de l'entrée sur la page ?
   - Lors de la sortie ?
   - Après navigation ?

### Solutions

#### Problème : Warning persiste sur Home.tsx ligne 207

**Cause** : Une fonction async n'a pas de vérification `isMountedRef.current`

**Solution** :
```bash
# Vérifier toutes les vérifications
grep -n "if (!isMountedRef.current) return" ionic-app-v2/src/pages/Home.tsx

# Résultat attendu : 5 lignes (dans loadAttractions, loadTours, loadFavorites)
```

#### Problème : Données ne se chargent pas

**Cause** : `isMountedRef.current` bloque le chargement

**Vérification** :
1. Ouvrir `Home.tsx`
2. Chercher : `const isMountedRef = useRef(???);`
3. **DOIT ÊTRE** : `useRef(false)` et **PAS** `useRef(true)`

**Solution** :
```tsx
// ❌ MAUVAIS
const isMountedRef = useRef(true);

// ✅ BON
const isMountedRef = useRef(false);
```

#### Problème : Application freeze

**Cause possible** : Boucle infinie dans `useEffect`

**Solution** :
1. Vérifier qu'il n'y a pas de `useEffect` avec `loadData()` dans les dépendances
2. Seul `useIonViewDidEnter` doit appeler les fonctions de chargement

---

## 📞 Support

- **Documentation** : `TEST_MEMORY_LEAK_FIX.md` (guide détaillé)
- **Validation** : `node validate-memory-leak-fix.cjs` (vérification automatique)
- **Pattern** : Voir section "Notes Techniques" dans `TEST_MEMORY_LEAK_FIX.md`

---

**Dernière mise à jour** : 14 octobre 2025, 23:50  
**Version** : 1.0  
**Statut** : ✅ Prêt pour test
