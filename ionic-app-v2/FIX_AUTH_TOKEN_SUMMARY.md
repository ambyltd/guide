# 🔐 Fix Erreur 400 - Token Firebase Missing

## 📋 Résumé des Corrections

**Date** : 16 octobre 2025  
**Issue** : Erreur 400 sur `/api/favorites` - Token Firebase absent  
**Files Modified** : 3 fichiers  
**Lines Changed** : ~50 lignes  

## 🐛 Root Cause Analysis

### Problème
```
GET /api/favorites 400 (Bad Request)
GET /api/favorites/check/:id 400 (Bad Request)
```

### Cause Racine
1. **apiClient.ts** récupère token depuis `localStorage.getItem('authToken')`
2. **authService.ts** ne sauvegardait **jamais** le token dans localStorage
3. Résultat : Requêtes API **sans Authorization header** → Backend retourne 400

### Impact
- ❌ Favoris ne se chargent pas
- ❌ Toggle favoris échoue
- ❌ Check statut favori échoue
- ❌ Console inondée d'erreurs 400

## ✅ Solutions Implémentées

### 1. **authService.ts - login()** (Ligne ~193)
```typescript
// AVANT
const userCredential = await signInWithEmailAndPassword(auth, email, password);
console.log('✅ Connexion Firebase réussie:', userCredential.user.uid);
await this.updateLastLogin(userCredential.user.uid);

// APRÈS
const userCredential = await signInWithEmailAndPassword(auth, email, password);
console.log('✅ Connexion Firebase réussie:', userCredential.user.uid);

// ✅ AJOUTÉ : Sauvegarde token
const token = await userCredential.user.getIdToken();
localStorage.setItem('authToken', token);
console.log('✅ Token Firebase sauvegardé dans localStorage');

await this.updateLastLogin(userCredential.user.uid);
```

### 2. **authService.ts - signInWithGoogle()** (Ligne ~257)
```typescript
// AVANT
const userCredential = await signInWithPopup(auth, provider);
const existingProfile = await this.getUserProfile(userCredential.user.uid);

// APRÈS
const userCredential = await signInWithPopup(auth, provider);

// ✅ AJOUTÉ : Sauvegarde token
const token = await userCredential.user.getIdToken();
localStorage.setItem('authToken', token);
console.log('✅ Token Firebase sauvegardé dans localStorage (Google)');

const existingProfile = await this.getUserProfile(userCredential.user.uid);
```

### 3. **authService.ts - onAuthStateChanged()** (Ligne ~110)
```typescript
// AVANT
if (user) {
  const profile = await this.loadUserProfile(user);
  this.currentState = { user, profile, loading: false, error: null };
} else {
  this.currentState = { user: null, profile: null, loading: false, error: null };
}

// APRÈS
if (user) {
  // ✅ AJOUTÉ : Actualiser token à chaque changement d'état
  const token = await user.getIdToken();
  localStorage.setItem('authToken', token);
  console.log('✅ Token Firebase actualisé dans localStorage');

  const profile = await this.loadUserProfile(user);
  this.currentState = { user, profile, loading: false, error: null };
} else {
  // ✅ AJOUTÉ : Supprimer token à la déconnexion
  localStorage.removeItem('authToken');
  console.log('🗑️ Token Firebase supprimé de localStorage');

  this.currentState = { user: null, profile: null, loading: false, error: null };
}
```

### 4. **AttractionDetail.tsx - checkFavorite()** (Ligne ~211)
```typescript
// AVANT
const checkFavorite = async () => {
  try {
    const isFav = await favoritesService.isFavorite(id);
    setIsFavorite(isFav);
  } catch (error) {
    // fallback
  }
};

// APRÈS
const checkFavorite = async () => {
  // ✅ AJOUTÉ : Protection si non connecté
  if (!user?.uid) {
    console.log('⚠️ Utilisateur non connecté, skip checkFavorite API');
    // Fallback localStorage
    const savedFavorites = localStorage.getItem('favorites');
    if (savedFavorites) {
      const favorites = new Set(JSON.parse(savedFavorites));
      setIsFavorite(favorites.has(id));
    }
    return;
  }

  try {
    const isFav = await favoritesService.isFavorite(id);
    setIsFavorite(isFav);
  } catch (error) {
    // fallback
  }
};
```

### 5. **Home.tsx - loadFavorites()** (Ligne ~255)
```typescript
// AVANT
const loadFavorites = async () => {
  try {
    const favoriteIds = await favoritesService.getFavoriteIds();
    // ...
  } catch (error) {
    // ...
  }
};

// APRÈS
const loadFavorites = useCallback(async () => {
  // ✅ AJOUTÉ : Protection si non connecté
  if (!user?.uid) {
    console.log('⚠️ Utilisateur non connecté, skip loadFavorites API');
    return;
  }

  try {
    const favoriteIds = await favoritesService.getFavoriteIds();
    // ...
  } catch (error) {
    // ...
  }
}, [user]);
```

## 📊 Résultats

### Avant
```
❌ GET /api/favorites 400 (Bad Request)
❌ GET /api/favorites/check/:id 400 (Bad Request)
❌ Console: "Erreur API: Error: Erreur HTTP: 400"
❌ Favoris ne se chargent pas
```

### Après
```
✅ GET /api/favorites 200 OK
✅ GET /api/favorites/check/:id 200 OK
✅ Console: "✅ Token Firebase sauvegardé dans localStorage"
✅ Console: "✅ Statut favori chargé: true"
✅ Favoris se chargent correctement
```

## 🔍 Flow Complet

### 1. Login
```
User → LoginPage.tsx
  ↓
authService.login(email, password)
  ↓
Firebase signInWithEmailAndPassword()
  ↓
✅ user.getIdToken() → localStorage.setItem('authToken', token)
  ↓
useAuth() détecte changement → Home.tsx reçoit user
  ↓
Home.tsx initialise services + appelle loadFavorites()
  ↓
apiClient.get('/api/favorites')
  ↓ 
Headers: { Authorization: Bearer eyJhbGci... } ✅
  ↓
Backend valide token Firebase → 200 OK ✅
```

### 2. Page Refresh
```
Browser refresh (F5)
  ↓
Firebase onAuthStateChanged(user)
  ↓
✅ user.getIdToken() → localStorage.setItem('authToken', token)
  ↓
useAuth() reçoit user → Components se réinitialisent
  ↓
API calls avec token actualisé ✅
```

### 3. Logout
```
User → Profile → Se déconnecter
  ↓
authService.signOut()
  ↓
Firebase signOut()
  ↓
onAuthStateChanged(null)
  ↓
✅ localStorage.removeItem('authToken')
  ↓
useAuth() détecte user = null
  ↓
Components passent en mode "non connecté" (localStorage fallback)
```

## 🎯 Tests de Validation

### ✅ Test 1 : Login Email/Password
```bash
1. Se déconnecter
2. Se reconnecter avec email/password
3. ✅ Vérifier console : "✅ Token Firebase sauvegardé"
4. ✅ Vérifier localStorage : authToken présent
5. ✅ Vérifier /api/favorites → 200 OK
```

### ✅ Test 2 : Login Google
```bash
1. Se déconnecter
2. Se reconnecter avec Google
3. ✅ Vérifier console : "✅ Token Firebase sauvegardé (Google)"
4. ✅ Vérifier localStorage : authToken présent
5. ✅ Vérifier /api/favorites → 200 OK
```

### ✅ Test 3 : Page Refresh
```bash
1. Connecté → Actualiser page (F5)
2. ✅ Vérifier console : "✅ Token Firebase actualisé"
3. ✅ Vérifier localStorage : authToken toujours présent
4. ✅ Vérifier favoris : toujours chargés
```

### ✅ Test 4 : Logout
```bash
1. Se déconnecter
2. ✅ Vérifier console : "🗑️ Token Firebase supprimé"
3. ✅ Vérifier localStorage : authToken absent
4. ✅ Vérifier favoris : fallback localStorage (pas d'erreur)
```

### ✅ Test 5 : Toggle Favoris
```bash
1. Connecté → Aller sur AttractionDetail
2. Cliquer sur bouton cœur (favori)
3. ✅ Vérifier console : "✅ Favori ajouté avec succès"
4. ✅ Vérifier POST /api/favorites → 201 Created
5. ✅ Vérifier icône cœur change
```

## 📝 Files Modified

```
ionic-app-v2/
├── src/
│   ├── services/
│   │   └── authService.ts                    ✏️ Modified (+25 lines)
│   └── pages/
│       ├── Home.tsx                           ✏️ Modified (+15 lines)
│       └── AttractionDetail.tsx               ✏️ Modified (+15 lines)
└── TEST_AUTH_TOKEN_FIX.md                     ✅ Created (guide de test)
```

## 🚀 Deployment Checklist

- [x] Code modifié et testé localement
- [x] Aucune erreur de build
- [x] Tests manuels passés (login, logout, refresh, favoris)
- [ ] Git commit avec message descriptif
- [ ] Git push vers remote
- [ ] Tests sur device Android
- [ ] Tests sur navigateurs multiples (Chrome, Firefox, Safari)
- [ ] Validation backend avec logs
- [ ] Documentation mise à jour

## 💡 Lessons Learned

1. **toujours sauvegarder le token** après authentification Firebase
2. **Actualiser le token** dans `onAuthStateChanged` pour gérer les refreshs
3. **Supprimer le token** à la déconnexion pour éviter les requêtes invalides
4. **Protéger les appels API** avec `if (!user?.uid)` pour éviter les race conditions
5. **Utiliser fallback localStorage** pour les utilisateurs non connectés

## 🔗 References

- Firebase Auth : https://firebase.google.com/docs/auth/web/manage-users
- JWT Token : https://jwt.io/
- localStorage API : https://developer.mozilla.org/en-US/docs/Web/API/Window/localStorage

## ✅ Status

**RESOLVED** ✅  
Date: 16 octobre 2025  
Tested: ✅ Local (http://localhost:5173)  
Next: Git commit + Push
