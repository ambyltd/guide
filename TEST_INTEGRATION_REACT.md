# 🧪 Guide de Test Rapide - Intégration React Services

**Date**: 12 Octobre 2024  
**Durée estimée**: 10-15 minutes  
**Environnement**: Web (localhost:5173)

---

## 🎯 Objectif

Valider que les 4 composants React intègrent correctement les 3 services backend (`favoritesService`, `reviewsService`, `userStatsService`).

---

## ⚙️ Prérequis

### 1. Backend API en cours d'exécution
```powershell
cd backend-api
npm run dev
```
✅ Vérifier: http://localhost:5000/api/health

### 2. Application Ionic en cours d'exécution
```powershell
cd ionic-app-v2
npm run dev
```
✅ Vérifier: http://localhost:5173

---

## 📋 Tests à Réaliser

### ✅ Test 1: Home.tsx - Toggle Favoris avec Stats (3 min)

**Objectif**: Vérifier que le toggle favoris appelle `favoritesService` et met à jour `userStats`.

**Steps**:
1. Ouvrir http://localhost:5173/tabs/home
2. Cliquer sur le bouton cœur ❤️ d'une attraction
3. **Console attendue**:
   ```
   ✅ Services initialisés: {userId: "user-123", userName: "Utilisateur Test"}
   ✅ Favoris chargés depuis API: 0 (ou X)
   ✅ Favori ajouté avec succès
   ```
4. Vérifier dans l'onglet Network (F12):
   - `POST /api/favorites` → Status 200 ou 201
   - `PATCH /api/users/user-123/stats/increment` → Status 200

**Résultat attendu**: 
- Icône passe de ❤️ outline à ❤️ filled
- Console affiche les logs de succès
- Favoris persistés dans la base de données

---

### ✅ Test 2: AttractionDetail.tsx - Création Review (5 min)

**Objectif**: Vérifier la création d'avis avec `reviewsService` et l'incrémentation de `reviewCount`.

**Steps**:
1. Cliquer sur une attraction depuis Home
2. Aller dans l'onglet "Avis" (4ème segment)
3. Remplir le formulaire:
   - **Note**: Sélectionner 5 étoiles
   - **Commentaire**: "Test avis intégration React - application excellente !"
4. Cliquer sur "Publier mon avis"
5. **Console attendue**:
   ```
   ✅ Services initialisés (AttractionDetail): {userId: "user-123", ...}
   ✅ Reviews chargés: 0 (ou X)
   ✅ Review créée avec succès
   ✅ Reviews chargés: 1 (ou X+1)
   ```
6. Vérifier dans l'onglet Network:
   - `POST /api/reviews` → Status 200 ou 201
   - `PATCH /api/users/user-123/stats/increment` → Status 200
   - `GET /api/reviews?itemId=XXX` → Status 200

**Résultat attendu**:
- Alert "Votre avis a été publié avec succès !"
- Le nouveau review apparaît dans la liste
- Formulaire réinitialisé (commentaire vide, note 5/5)
- Badge compteur "Avis (1)" mis à jour

---

### ✅ Test 3: Favorites.tsx - Liste Favoris API (2 min)

**Objectif**: Vérifier que la page Favorites charge les favoris depuis l'API.

**Steps**:
1. Aller dans l'onglet Favoris (tabs/favorites)
2. **Console attendue**:
   ```
   ✅ Services initialisés (Favorites): {userId: "user-123", ...}
   ✅ Favoris chargés depuis API: 1 (ou X)
   ```
3. Vérifier dans l'onglet Network:
   - `GET /api/favorites?userId=user-123` → Status 200
   - Response contient les attractions complètes (populated)

**Résultat attendu**:
- Liste des attractions favorites affichée avec images
- Compteur "X attraction(s) favorite(s)" affiché
- Cartes d'attractions cliquables

**Test Retrait Favori**:
1. Cliquer sur le bouton poubelle 🗑️ d'une carte
2. **Console attendue**:
   ```
   ✅ Favori retiré avec succès
   ```
3. Vérifier Network:
   - `DELETE /api/favorites/ATTRACTION_ID?userId=user-123` → Status 200
   - `PATCH /api/users/user-123/stats/increment` (favoriteCount -1) → Status 200

**Résultat**: 
- Carte disparaît de la liste immédiatement
- Compteur décrémenté

---

### ✅ Test 4: Profile.tsx - Stats Utilisateur + Badges (5 min)

**Objectif**: Vérifier l'affichage des stats et badges depuis `userStatsService`.

**Steps**:
1. Aller dans l'onglet Profil (tabs/profile)
2. **Console attendue**:
   ```
   ✅ userStatsService initialisé (Profile): {userId: "user-123", ...}
   📊 Stats utilisateur chargées: {
     attractionsVisited: 0,
     audioGuidesListened: 0,
     favoriteCount: 1,
     reviewCount: 1,
     badges: 0 ou plus
   }
   🏆 Nouveaux badges attribués: [] (ou [badge names])
   ```
3. Vérifier dans Network:
   - `GET /api/users/user-123/stats` → Status 200
   - Response contient userStats complet

**Résultat attendu**:
- Section "📊 Mes Statistiques" affichée avec 6 métriques:
  - Attractions visitées: 0
  - Favoris: 1 (après Test 1)
  - Guides écoutés: 0
  - Avis publiés: 1 (après Test 2)
  - Circuits terminés: 0
  - Temps d'écoute: 0h 0min

- Section "🏆 Mes Badges (X)" affichée si au moins 1 badge débloqué:
  - Badge "🎯 Premier Favori" débloqué si favoriteCount >= 1
  - Badge "✍️ Premier Critique" débloqué si reviewCount >= 1
  - Autres badges avec 🔒 (locked)

---

## 📊 Résumé des Vérifications

| Test | Composant | Service(s) testé(s) | Endpoints API | Durée |
|------|-----------|---------------------|---------------|-------|
| 1 | Home.tsx | favoritesService, userStatsService | POST /favorites, PATCH /users/stats/increment | 3 min |
| 2 | AttractionDetail.tsx | reviewsService, userStatsService | POST /reviews, PATCH /users/stats/increment, GET /reviews | 5 min |
| 3 | Favorites.tsx | favoritesService, userStatsService | GET /favorites, DELETE /favorites/:id | 2 min |
| 4 | Profile.tsx | userStatsService | GET /users/:userId/stats | 5 min |
| **Total** | **4** | **3 services** | **7 endpoints** | **15 min** |

---

## 🐛 Troubleshooting

### Erreur "Network Error" ou "CORS Error"
**Cause**: Backend API non lancé ou CORS mal configuré  
**Solution**: 
```powershell
cd backend-api
npm run dev
```
Vérifier que le serveur démarre sur http://localhost:5000

### Erreur "userId not initialized"
**Cause**: Service non initialisé avant appel API  
**Solution**: Vérifier dans la console que les logs "✅ Services initialisés" apparaissent bien au chargement de la page

### Reviews/Favorites ne s'affichent pas
**Cause**: Problème de populate MongoDB ou userId incorrect  
**Solution**: 
1. Vérifier dans Network la response de l'API
2. Vérifier que `userId = 'user-123'` est utilisé partout
3. Tester manuellement l'endpoint dans Postman:
   ```
   GET http://localhost:5000/api/favorites?userId=user-123
   GET http://localhost:5000/api/reviews?itemId=ATTRACTION_ID&active=true
   ```

### Stats non mises à jour
**Cause**: Endpoint PATCH /users/stats/increment échoue silencieusement  
**Solution**: 
1. Ouvrir Network tab et filtrer sur "stats"
2. Vérifier le status code (doit être 200)
3. Tester manuellement:
   ```
   PATCH http://localhost:5000/api/users/user-123/stats/increment
   Body: { "field": "favoriteCount", "value": 1 }
   ```

---

## ✅ Checklist de Validation

Après avoir complété les 4 tests, vérifier:

- [ ] **Home.tsx**: Toggle favori fonctionne (icône change, API appelée)
- [ ] **Home.tsx**: Stats favoriteCount incrémentées après toggle
- [ ] **AttractionDetail.tsx**: Onglet Reviews visible
- [ ] **AttractionDetail.tsx**: Formulaire création review fonctionnel
- [ ] **AttractionDetail.tsx**: Reviews affichés après création
- [ ] **AttractionDetail.tsx**: reviewCount incrémenté après création review
- [ ] **Favorites.tsx**: Liste favoris chargée depuis API
- [ ] **Favorites.tsx**: Retrait favori fonctionne (carte disparaît)
- [ ] **Favorites.tsx**: favoriteCount décrémenté après retrait
- [ ] **Profile.tsx**: Stats utilisateur affichées (6 métriques)
- [ ] **Profile.tsx**: Badges affichés (si au moins 1 badge débloqué)
- [ ] **Console**: Aucune erreur rouge (warnings orange acceptables)
- [ ] **Network**: Tous les appels API retournent 200/201

---

## 🎉 Validation Complète

Si tous les checkboxes sont cochés ✅, l'intégration React Services est **VALIDÉE** !

**Prochaine étape**: 
1. Intégrer backgroundSyncService avec les nouveaux services (10 min)
2. Build production + sync Android (3 min)
3. Tests device (50 min)

---

**Guide créé le**: 12 Octobre 2024  
**Version**: 1.0  
**Durée totale**: 15 minutes
