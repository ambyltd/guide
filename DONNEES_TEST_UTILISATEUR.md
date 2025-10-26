# 🧪 Données de Test Utilisateur - Audit Complet

**Date**: 16 octobre 2025  
**Objectif**: Identifier et remplacer tous les userId/userName hardcodés par des valeurs Firebase Auth

---

## 📍 **Localisation des Données Hardcodées**

### **Valeurs actuelles (à remplacer)** :
```typescript
const userId = 'user-123';
const userName = 'Utilisateur Test';
```

---

## 📄 **Pages Concernées (5 fichiers)**

### **1. Home.tsx** - 2 occurrences

#### **Occurrence 1 : Ligne 151-152** (Initialisation services)
```typescript
// 🔧 Initialiser les services avec l'utilisateur
// TODO: Récupérer userId et userName depuis Firebase Auth
const userId = 'user-123';
const userName = 'Utilisateur Test';

favoritesService.initialize(userId, userName);
userStatsService.initialize(userId, userName);

console.log('✅ Services initialisés:', { userId, userName });
```

**Fonction** : `useEffect(() => { ... }, [])`  
**Ligne** : 148-158

---

#### **Occurrence 2 : Ligne 288** (Toggle favoris fallback)
```typescript
// Fallback: Utiliser backgroundSyncService pour sync automatique en mode offline
const userId = 'user-123'; // TODO: Récupérer depuis Firebase Auth
try {
  if (isFavorite) {
    await backgroundSyncService.removeFavorite(id, userId);
    console.log('✅ Favori retiré (sync en arrière-plan)');
  } else {
    await backgroundSyncService.addFavorite(id, userId);
    console.log('✅ Favori ajouté (sync en arrière-plan)');
  }
```

**Fonction** : `toggleFavorite(id: string)`  
**Ligne** : 280-295  
**Contexte** : Fallback si `favoritesService` échoue

---

### **2. AttractionDetail.tsx** - 2 occurrences

#### **Occurrence 1 : Ligne 115** (currentUserId pour reviews)
```typescript
const currentUserId = 'user-123'; // TODO: Récupérer depuis Firebase Auth
```

**Fonction** : Variable globale du composant  
**Ligne** : 115  
**Usage** : Pour identifier les reviews de l'utilisateur actuel

---

#### **Occurrence 2 : Ligne 123-124** (Initialisation services)
```typescript
// TODO: Récupérer userId et userName depuis Firebase Auth
const userId = 'user-123';
const userName = 'Utilisateur Test';
const userAvatar = 'https://i.pravatar.cc/150?img=1';

// Initialiser les services
favoritesService.initialize(userId, userName);
userStatsService.initialize(userId, userName);
reviewsService.initialize(userId, userName, userAvatar);
```

**Fonction** : `useEffect(() => { ... }, [])`  
**Ligne** : 120-130  
**Bonus** : `userAvatar` aussi hardcodé

---

### **3. Profile.tsx** - 1 occurrence

#### **Occurrence : Ligne 77-78** (Initialisation services)
```typescript
// TODO: Récupérer userId et userName depuis Firebase Auth
const userId = 'user-123';
const userName = 'Utilisateur Test';

// Initialiser userStatsService
userStatsService.initialize(userId, userName);

console.log('✅ userStatsService initialisé (Profile):', { userId, userName });
```

**Fonction** : `useEffect(() => { ... }, [])`  
**Ligne** : 75-84

---

### **4. Favorites.tsx** - 2 occurrences

#### **Occurrence 1 : Ligne 57-58** (Initialisation services)
```typescript
// TODO: Récupérer userId et userName depuis Firebase Auth
const userId = 'user-123';
const userName = 'Utilisateur Test';

// Initialiser les services
favoritesService.initialize(userId, userName);
userStatsService.initialize(userId, userName);

console.log('✅ Services initialisés (Favorites):', { userId, userName });
```

**Fonction** : `useEffect(() => { ... }, [])`  
**Ligne** : 55-64

---

#### **Occurrence 2 : Ligne 157** (Toggle favoris)
```typescript
const userId = 'user-123'; // TODO: Récupérer depuis Firebase Auth
```

**Fonction** : `toggleFavorite(id: string)`  
**Ligne** : 157  
**Usage** : Pour `backgroundSyncService`

---

## 🔧 **Services Impactés**

### **Services initialisés avec données hardcodées** :

1. ✅ **favoritesService** (4 pages)
   - Home.tsx
   - AttractionDetail.tsx
   - Profile.tsx (non utilisé directement)
   - Favorites.tsx

2. ✅ **userStatsService** (4 pages)
   - Home.tsx
   - AttractionDetail.tsx
   - Profile.tsx
   - Favorites.tsx

3. ✅ **reviewsService** (1 page)
   - AttractionDetail.tsx (+ userAvatar hardcodé)

4. ✅ **backgroundSyncService** (2 pages)
   - Home.tsx (fallback toggleFavorite)
   - Favorites.tsx (toggleFavorite)

---

## 🎯 **Stratégie de Remplacement**

### **Option 1 : Hook `useAuth()` existant** ✅ (Recommandé)

```typescript
import { useAuth } from '../hooks/useAuth';

const { user, isAuthenticated } = useAuth();

// Utilisation
useEffect(() => {
  if (user) {
    const userId = user.uid;
    const userName = user.displayName || user.email || 'User';
    
    favoritesService.initialize(userId, userName);
    userStatsService.initialize(userId, userName);
  }
}, [user]);
```

**Avantages** :
- ✅ Déjà implémenté dans le projet
- ✅ Gère l'état d'authentification
- ✅ Synchronisé avec Firebase Auth
- ✅ Type-safe avec TypeScript

---

### **Option 2 : Context Provider global** (Alternative)

Créer un `UserContext` qui expose `userId` et `userName` globalement.

**Avantages** :
- ✅ Une seule source de vérité
- ✅ Mise à jour automatique dans toutes les pages

**Inconvénients** :
- ❌ `useAuth()` existe déjà et fait le job

---

## 📝 **Plan d'Action Détaillé**

### **Étape 1 : Modifier Home.tsx**

```typescript
// AVANT
const userId = 'user-123';
const userName = 'Utilisateur Test';

// APRÈS
const { user } = useAuth();

useEffect(() => {
  if (user) {
    favoritesService.initialize(user.uid, user.displayName || user.email || 'User');
    userStatsService.initialize(user.uid, user.displayName || user.email || 'User');
  }
}, [user]);
```

**Modifications** :
- Ligne 148-158 : Initialisation services
- Ligne 288 : `toggleFavorite` fallback → Utiliser `user.uid`

---

### **Étape 2 : Modifier AttractionDetail.tsx**

```typescript
// AVANT
const currentUserId = 'user-123';
const userId = 'user-123';
const userName = 'Utilisateur Test';
const userAvatar = 'https://i.pravatar.cc/150?img=1';

// APRÈS
const { user } = useAuth();
const currentUserId = user?.uid || '';

useEffect(() => {
  if (user) {
    favoritesService.initialize(user.uid, user.displayName || user.email || 'User');
    userStatsService.initialize(user.uid, user.displayName || user.email || 'User');
    reviewsService.initialize(
      user.uid, 
      user.displayName || user.email || 'User',
      user.photoURL || 'https://i.pravatar.cc/150?img=1'
    );
  }
}, [user]);
```

**Modifications** :
- Ligne 115 : `currentUserId` → `user?.uid`
- Ligne 120-130 : Initialisation services avec Firebase user
- **Bonus** : `userAvatar` → `user.photoURL`

---

### **Étape 3 : Modifier Profile.tsx**

```typescript
// AVANT
const userId = 'user-123';
const userName = 'Utilisateur Test';

// APRÈS
const { user } = useAuth();

useEffect(() => {
  if (user) {
    userStatsService.initialize(user.uid, user.displayName || user.email || 'User');
  }
}, [user]);
```

**Modifications** :
- Ligne 75-84 : Initialisation userStatsService

---

### **Étape 4 : Modifier Favorites.tsx**

```typescript
// AVANT (ligne 57-58)
const userId = 'user-123';
const userName = 'Utilisateur Test';

// APRÈS
const { user } = useAuth();

useEffect(() => {
  if (user) {
    favoritesService.initialize(user.uid, user.displayName || user.email || 'User');
    userStatsService.initialize(user.uid, user.displayName || user.email || 'User');
  }
}, [user]);

// AVANT (ligne 157)
const userId = 'user-123'; // TODO: Récupérer depuis Firebase Auth

// APRÈS
const userId = user?.uid;
if (!userId) return; // Protection
```

**Modifications** :
- Ligne 55-64 : Initialisation services
- Ligne 157 : `toggleFavorite` → Utiliser `user?.uid` avec guard

---

## ⚠️ **Points d'Attention**

### **1. Protection contre undefined**
```typescript
// ❌ Risque
favoritesService.initialize(user.uid, user.displayName);

// ✅ Sécurisé
if (user) {
  favoritesService.initialize(
    user.uid, 
    user.displayName || user.email || 'User'
  );
}
```

---

### **2. Fallback userName**
Firebase `displayName` peut être null si l'utilisateur ne l'a pas défini.

**Ordre de priorité** :
1. `user.displayName` (si défini)
2. `user.email` (toujours présent)
3. `'User'` (fallback ultime)

```typescript
const userName = user.displayName || user.email || 'User';
```

---

### **3. Services non initialisés**
Avec la nouvelle logique, les services ne seront initialisés que si `user` existe.

**Conséquence** :
- Si utilisateur non authentifié → Services non initialisés
- Solution : Les pages protégées utilisent déjà `ProtectedRoute` qui redirige vers `/login`

---

## ✅ **Checklist de Migration**

- [ ] **Home.tsx**
  - [ ] Ligne 148-158 : Remplacer initialisation services
  - [ ] Ligne 288 : Remplacer `userId` dans `toggleFavorite` fallback
  - [ ] Ajouter `import { useAuth } from '../hooks/useAuth';`
  - [ ] Retirer logs de test après migration

- [ ] **AttractionDetail.tsx**
  - [ ] Ligne 115 : Remplacer `currentUserId`
  - [ ] Ligne 120-130 : Remplacer initialisation services
  - [ ] Bonus : Utiliser `user.photoURL` pour avatar
  - [ ] Ajouter `import { useAuth } from '../hooks/useAuth';`

- [ ] **Profile.tsx**
  - [ ] Ligne 75-84 : Remplacer initialisation service
  - [ ] Ajouter `import { useAuth } from '../hooks/useAuth';`

- [ ] **Favorites.tsx**
  - [ ] Ligne 55-64 : Remplacer initialisation services
  - [ ] Ligne 157 : Remplacer `userId` dans `toggleFavorite`
  - [ ] Ajouter protection `if (!userId) return;`
  - [ ] Ajouter `import { useAuth } from '../hooks/useAuth';`

- [ ] **Tests**
  - [ ] Tester avec utilisateur authentifié
  - [ ] Tester favoris (add/remove)
  - [ ] Tester reviews (create/report)
  - [ ] Vérifier stats utilisateur
  - [ ] Vérifier background sync

---

## 🚀 **Résultat Attendu**

### **Avant** ❌
- 9 occurrences de `'user-123'` hardcodé
- 5 occurrences de `'Utilisateur Test'` hardcodé
- Services initialisés avec données factices
- Impossible de tester avec vrais utilisateurs Firebase

### **Après** ✅
- 0 occurrence de données hardcodées
- Services initialisés avec Firebase user.uid
- userName dynamique basé sur Firebase user.displayName/email
- Avatar dynamique basé sur Firebase user.photoURL
- Tests possibles avec vrais comptes Firebase

---

## 📊 **Impact sur la Sécurité**

### **Problèmes actuels** ❌
1. Tous les utilisateurs partagent le même `userId = 'user-123'`
2. Impossible de distinguer les favoris/reviews entre utilisateurs
3. Stats globales incorrectes

### **Après migration** ✅
1. Chaque utilisateur a son propre `userId` unique (Firebase UID)
2. Favoris/reviews/stats isolés par utilisateur
3. Backend sécurisé avec token Firebase (déjà fait)

---

**Auteur**: GitHub Copilot  
**Statut**: 📋 **AUDIT COMPLÉTÉ** - Prêt pour migration
