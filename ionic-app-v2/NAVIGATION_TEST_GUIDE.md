# 🧪 Guide de Test Navigation - Tests Rapides (15 min)

## ✅ Date : 26 Octobre 2025

---

## 🚀 Lancement de l'App

### Option 1: Test Web (Navigateur)
```bash
cd ionic-app-v2
npm run dev
```
Ouvrir : http://localhost:5173

### Option 2: Test Device Android
```bash
cd ionic-app-v2
npm run build
npx cap sync
npx cap open android
```
Cliquer sur "Run" dans Android Studio

---

## ⚡ Tests Critiques (5 tests essentiels)

### ✅ Test 1: Tab Bar Réduit (30 secondes)
**Objectif** : Vérifier que seulement 3 tabs sont visibles

**Steps** :
1. Lancer l'app
2. Regarder le tab bar en bas

**Résultat attendu** :
- ✅ 3 tabs visibles : **Accueil**, **Carte**, **Guides**
- ❌ PAS de tabs : Favoris, Profil

---

### ✅ Test 2: ProfileMenu Visible (1 minute)
**Objectif** : Vérifier que l'icône profil est visible sur toutes les pages

**Steps** :
1. **Home** : Regarder en haut à droite → Icône profil visible
2. **Carte** : Tab Carte → Icône profil visible (après indicateur geofencing si actif)
3. **Guides** : Tab Guides → Icône profil visible
4. Cliquer sur une attraction → **Détail** : Icône profil visible (après bouton ❤️)

**Résultat attendu** :
- ✅ Icône profil (cercle avec silhouette) présente sur chaque page
- ✅ Positionnée en haut à droite du header

---

### ✅ Test 3: Dropdown Menu (1 minute)
**Objectif** : Vérifier que le menu dropdown fonctionne

**Steps** :
1. Depuis la page Home, cliquer sur icône profil
2. Vérifier les 5 options du menu :
   - ❤️ **Mes Favoris**
   - 📊 **Statistiques**
   - 🏆 **Classement**
   - ⚙️ **Paramètres**
   - 🚪 **Déconnexion** (rouge)

**Résultat attendu** :
- ✅ Popover s'ouvre avec 5 options
- ✅ Header affiche nom + email utilisateur
- ✅ Avatar utilisateur affiché

---

### ✅ Test 4: Navigation via Menu (2 minutes)
**Objectif** : Vérifier que chaque option du menu navigue correctement

**Steps** :
1. Home → ProfileMenu → **Mes Favoris**
   - ✅ Affiche la page Favoris (liste des attractions favorites)
   
2. Favoris → ProfileMenu → **Statistiques**
   - ✅ Affiche la page Stats avec 3 tabs (Tendances, Achievements, Comparaison)
   
3. Stats → ProfileMenu → **Classement**
   - ✅ Affiche la page Leaderboard avec filtres (Tout temps, Semaine, Mois)
   
4. Leaderboard → ProfileMenu → **Paramètres**
   - ✅ Affiche la page Settings avec 6 sections :
     - Apparence (Mode sombre)
     - Notifications
     - Langue
     - Stockage Offline
     - Aide & Support
     - À propos

**Résultat attendu** :
- ✅ Toutes les pages se chargent sans erreur
- ✅ Bouton retour fonctionne sur chaque page

---

### ✅ Test 5: Settings Fonctionnels (1 minute)
**Objectif** : Vérifier que la page Paramètres fonctionne

**Steps** :
1. ProfileMenu → Paramètres
2. **Mode sombre** : Toggle ON
   - ✅ Theme de l'app passe en dark mode
3. **Mode sombre** : Toggle OFF
   - ✅ Theme revient en light mode
4. **Langue** : Sélectionner "English"
   - ✅ Langue change (si i18n implémenté)
5. **Stockage Offline** : Regarder les stats
   - ✅ Affiche taille cache Images, Audios, Total

**Résultat attendu** :
- ✅ Toggle dark mode fonctionne instantanément
- ✅ Stats cache affichent des valeurs (en MB)

---

## 🔥 Tests Avancés (Optionnels - 10 min)

### Test 6: Déconnexion
**Steps** :
1. ProfileMenu → **Déconnexion**
2. Confirmer la déconnexion

**Résultat attendu** :
- ✅ Popup de confirmation
- ✅ Après confirmation : Redirect vers page Login
- ✅ Impossible d'accéder aux pages authentifiées

---

### Test 7: Favorites Offline Sync
**Steps** :
1. Home → Cliquer sur ❤️ d'une attraction
2. Activer **Mode Avion** (Android)
3. Cliquer sur ❤️ d'une autre attraction
4. Désactiver **Mode Avion**

**Résultat attendu** :
- ✅ Premier favori ajouté en temps réel
- ✅ Deuxième favori ajouté en offline (mis en queue)
- ✅ Après reconnexion : Sync automatique

---

### Test 8: AttractionDetail → ProfileMenu
**Steps** :
1. Home → Cliquer sur une attraction
2. Page Détail : Cliquer sur icône profil
3. Sélectionner **Favoris** dans le menu
4. Vérifier que l'attraction est dans la liste

**Résultat attendu** :
- ✅ ProfileMenu fonctionne sur AttractionDetail
- ✅ Navigation vers Favoris fonctionne
- ✅ Attraction visible dans Favoris si ajoutée

---

### Test 9: Stats Page - Tabs Navigation
**Steps** :
1. ProfileMenu → Statistiques
2. Cliquer sur tab **Tendances** → Graphiques activité visible
3. Cliquer sur tab **Achievements** → Liste badges visible
4. Cliquer sur tab **Comparaison** → Rank card + BarChart visible

**Résultat attendu** :
- ✅ 3 tabs fonctionnent
- ✅ Contenu change à chaque tab
- ✅ Graphiques recharts s'affichent correctement

---

### Test 10: Leaderboard Page - Filtres
**Steps** :
1. ProfileMenu → Classement
2. Filtrer par **Semaine** → Liste top 10 utilisateurs visible
3. Filtrer par **Mois** → Liste change
4. Trier par **Guides Écoutés** → Classement se réorganise

**Résultat attendu** :
- ✅ Filtres timeframe fonctionnent (7d, 30d, all)
- ✅ Tri par métrique fonctionne (visits, guides, reviews)
- ✅ Rank de l'utilisateur actuel est highlighted

---

## 📊 Checklist Validation Finale

| Test | Statut | Notes |
|------|--------|-------|
| 1. Tab bar 3 items | ⬜ |  |
| 2. ProfileMenu visible | ⬜ |  |
| 3. Dropdown menu | ⬜ |  |
| 4. Navigation menu | ⬜ |  |
| 5. Settings toggle | ⬜ |  |
| 6. Déconnexion | ⬜ |  |
| 7. Favorites sync | ⬜ |  |
| 8. AttractionDetail | ⬜ |  |
| 9. Stats tabs | ⬜ |  |
| 10. Leaderboard filtres | ⬜ |  |

---

## ⚠️ Problèmes Potentiels

### Problème 1: ProfileMenu ne s'ouvre pas
**Cause** : User non authentifié
**Solution** : Login d'abord, puis retry

### Problème 2: Routes 404
**Cause** : Routes `/stats`, `/leaderboard`, `/settings` non trouvées
**Solution** : Vérifier App.tsx lignes 156-158

### Problème 3: Back button ne fonctionne pas
**Cause** : `defaultHref` incorrect
**Solution** : Vérifier que chaque `<IonBackButton defaultHref="/tabs/home" />` est correct

### Problème 4: Dark mode ne persiste pas
**Cause** : LocalStorage non synchronisé
**Solution** : Vérifier Settings.tsx ligne 75-85

---

## 🎯 Résultat Attendu Global

### UX Amélioré
- ✅ Tab bar plus épuré (3 items au lieu de 5)
- ✅ Accès rapide aux fonctionnalités secondaires (ProfileMenu)
- ✅ Navigation cohérente sur toutes les pages
- ✅ Back button fonctionne partout

### Performance
- ✅ Build 0 erreurs TypeScript
- ✅ Service Worker précache 19 fichiers (3.3 MB)
- ✅ Pas de régression de performance

### Accessibilité
- ✅ ProfileMenu accessible via touch (mobile)
- ✅ Icônes claires et intuitives
- ✅ Labels en français

---

## 📝 Notes de Test

**Environnement** :
- Device : _______________________
- OS : Android ______ / iOS ______
- Browser (web) : _________________
- Date test : ____________________

**Bugs trouvés** :
```
1. 

2. 

3. 
```

**Suggestions** :
```
1. 

2. 

3. 
```

---

**✅ Tests Complétés le : _________________**

**Testeur : _____________________________**
