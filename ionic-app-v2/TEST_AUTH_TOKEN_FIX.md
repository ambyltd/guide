# 🔧 Test Fix Erreur 400 - Token Firebase

## 🐛 Problème Identifié

L'erreur 400 sur `/api/favorites` était causée par l'**absence de token Firebase** dans localStorage.

### Root Cause
- `apiClient` récupère le token depuis `localStorage.getItem('authToken')`
- Mais `authService.login()` et `signInWithGoogle()` **ne sauvegardaient pas** le token
- Résultat : Requêtes API sans Authorization header → 400 Bad Request

## ✅ Corrections Appliquées

### 1. **authService.ts - login()**
```typescript
// Après signInWithEmailAndPassword
const token = await userCredential.user.getIdToken();
localStorage.setItem('authToken', token);
console.log('✅ Token Firebase sauvegardé dans localStorage');
```

### 2. **authService.ts - signInWithGoogle()**
```typescript
// Après signInWithPopup
const token = await userCredential.user.getIdToken();
localStorage.setItem('authToken', token);
console.log('✅ Token Firebase sauvegardé dans localStorage (Google)');
```

### 3. **authService.ts - onAuthStateChanged()**
```typescript
if (user) {
  // Actualiser le token à chaque changement d'état
  const token = await user.getIdToken();
  localStorage.setItem('authToken', token);
  console.log('✅ Token Firebase actualisé dans localStorage');
} else {
  // Supprimer le token si déconnecté
  localStorage.removeItem('authToken');
  console.log('🗑️ Token Firebase supprimé de localStorage');
}
```

### 4. **AttractionDetail.tsx - checkFavorite()**
```typescript
const checkFavorite = async () => {
  // Protection: Ne pas appeler l'API si l'utilisateur n'est pas connecté
  if (!user?.uid) {
    console.log('⚠️ Utilisateur non connecté, skip checkFavorite API');
    // Fallback localStorage
    return;
  }
  // ... appel API
};
```

### 5. **Home.tsx - loadFavorites()**
```typescript
const loadFavorites = useCallback(async () => {
  // Protection: Ne pas appeler l'API si pas authentifié
  if (!user?.uid) {
    console.log('⚠️ Utilisateur non connecté, skip loadFavorites API');
    return;
  }
  // ... appel API
}, [user]);
```

## 🧪 Instructions de Test

### Étape 1 : Se Déconnecter
1. Ouvrir l'app : http://localhost:5173/
2. Aller sur **Profile** (tab du bas)
3. Cliquer sur **Se déconnecter**
4. ✅ Vérifier console : `🗑️ Token Firebase supprimé de localStorage`

### Étape 2 : Vérifier localStorage (Avant)
1. Ouvrir DevTools (F12)
2. Onglet **Application** → **Local Storage** → http://localhost:5173
3. ✅ Vérifier : `authToken` **absent** ou **vide**

### Étape 3 : Se Reconnecter
1. Aller sur **Login** page
2. Se connecter avec Email/Password **OU** Google
3. ✅ Vérifier console : `✅ Token Firebase sauvegardé dans localStorage`

### Étape 4 : Vérifier localStorage (Après)
1. DevTools → **Application** → **Local Storage**
2. ✅ Vérifier : `authToken` présent avec un long token JWT
3. Format attendu : `eyJhbGciOiJSUzI1NiIsImtpZCI6IjFhY...` (très long)

### Étape 5 : Tester Page Home
1. Aller sur **Home** (tab du bas)
2. ✅ Vérifier console : **Aucune erreur 400**
3. ✅ Vérifier console : `✅ Services initialisés avec userId: xxx`
4. ✅ Favoris chargés sans erreur

### Étape 6 : Tester Page AttractionDetail
1. Cliquer sur une **attraction** (ex: Basilique Notre-Dame)
2. ✅ Vérifier console : **Aucune erreur 400**
3. ✅ Vérifier console : `✅ Statut favori chargé: true/false`
4. ✅ Bouton cœur (favori) fonctionne

### Étape 7 : Tester Toggle Favori
1. Cliquer sur le **bouton cœur** (favori)
2. ✅ Vérifier console : `✅ Favori ajouté avec succès` (ou retiré)
3. ✅ Vérifier : **Aucune erreur 400**
4. ✅ Vérifier : Icône change (cœur plein ↔ cœur vide)

### Étape 8 : Tester Refresh Page
1. Actualiser la page (F5)
2. ✅ Vérifier console : `✅ Token Firebase actualisé dans localStorage`
3. ✅ Vérifier : Utilisateur toujours connecté
4. ✅ Vérifier : Favoris toujours chargés

## 📊 Résultats Attendus

### Console Logs Attendus (Connexion)
```
✅ Connexion Firebase réussie: abc123xyz...
✅ Token Firebase sauvegardé dans localStorage
✅ Profil utilisateur chargé: Jean Dupont
```

### Console Logs Attendus (Home)
```
✅ Services initialisés avec userId: abc123xyz...
✅ Token Firebase actualisé dans localStorage
(Aucune erreur 400)
```

### Console Logs Attendus (AttractionDetail)
```
✅ Services initialisés avec userId: abc123xyz...
📱 AttractionDetail - Page active, rechargement des données pour: 68ebc2e...
✅ Statut favori chargé: true
(Aucune erreur 400)
```

### API Requests Attendus
```
GET /api/favorites → 200 OK (avec Authorization: Bearer eyJhbGci...)
GET /api/favorites/check/68ebc2e... → 200 OK
POST /api/favorites → 201 Created
DELETE /api/favorites/68ebc2e... → 200 OK
```

## ❌ Erreurs à NE PLUS VOIR

```
❌ GET /api/favorites 400 (Bad Request)
❌ GET /api/favorites/check/68ebc2e... 400 (Bad Request)
❌ Erreur API: Error: Erreur HTTP: 400
```

## 🔍 Debug Console Commands

### Vérifier Token Présent
```javascript
localStorage.getItem('authToken')
// Devrait retourner : "eyJhbGciOiJSUzI1NiIs..." (long string)
```

### Vérifier User Connecté
```javascript
// Dans console Browser
authService.getCurrentState()
// Devrait retourner : { user: {...}, profile: {...}, loading: false }
```

### Forcer Refresh Token
```javascript
// Si erreur persiste
const user = await authService.getCurrentUser();
if (user) {
  const token = await user.getIdToken(true); // force refresh
  localStorage.setItem('authToken', token);
  console.log('Token refresh:', token.substring(0, 50) + '...');
}
```

## 📝 Notes Importantes

1. **Token Expiration** : Les tokens Firebase expirent après 1h
   - `onAuthStateChanged` actualise automatiquement le token
   - Si erreur 401 après 1h, vérifier refresh token

2. **Fallback localStorage** : 
   - Pour utilisateurs **non connectés** : favoris en localStorage uniquement
   - Pour utilisateurs **connectés** : API backend + sync

3. **Race Condition** :
   - `useIonViewDidEnter()` peut s'exécuter avant `useEffect([user])`
   - Protection `if (!user?.uid)` dans toutes les fonctions API

4. **Backend Validation** :
   - Backend extrait `userId` du token JWT Firebase
   - Impossible de manipuler `userId` depuis le frontend
   - Sécurité garantie par Firebase Admin SDK

## 🎯 Checklist Final

- [ ] Token sauvegardé après login Email/Password
- [ ] Token sauvegardé après login Google
- [ ] Token actualisé au refresh page
- [ ] Token supprimé à la déconnexion
- [ ] Aucune erreur 400 sur /api/favorites
- [ ] Aucune erreur 400 sur /api/favorites/check/:id
- [ ] Toggle favoris fonctionne sans erreur
- [ ] Favoris persistent après refresh
- [ ] Protection non-authentifiés fonctionne
- [ ] Console logs positifs présents

## ✅ Si Tous les Tests Passent

L'erreur 400 est **définitivement résolue** ! 🎉

Le token Firebase est maintenant :
- ✅ Sauvegardé à la connexion
- ✅ Actualisé automatiquement
- ✅ Envoyé dans Authorization header
- ✅ Validé par le backend
- ✅ Supprimé à la déconnexion

**Prochaine étape** : Commit Git ! 🚀
