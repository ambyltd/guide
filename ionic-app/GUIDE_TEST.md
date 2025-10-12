# 🧪 Guide de Test - Application Ionic AudioGuide

**Date**: 7 octobre 2025  
**Version**: 1.0.0

---

## 🎯 Objectif

Ce guide vous permet de tester toutes les fonctionnalités implémentées dans l'application Ionic.

---

## 📋 Pré-requis

### 1. Backend API démarré
```bash
cd backend-api
npm run dev
# ✅ Vérifier: http://localhost:5000/health
```

### 2. Application Ionic démarrée
```bash
cd ionic-app
npm run dev
# ✅ Ouvrir: http://localhost:8100
```

### 3. Firebase configuré
- ✅ Variables dans `.env`
- ✅ Projet Firebase actif

---

## 🔐 Tests Authentification

### Test 1: Inscription (`/register`)

**Étapes**:
1. Naviguer vers http://localhost:8100/register
2. Remplir le formulaire:
   - Nom: `Test User`
   - Email: `test@example.com`
   - Mot de passe: `Test123!`
   - Confirmer: `Test123!`
   - ✅ Cocher conditions d'utilisation
3. Cliquer "Créer mon compte"

**Résultats attendus**:
- ✅ Toast vert "Inscription réussie"
- ✅ Email de vérification envoyé
- ✅ Redirection vers `/home`
- ✅ Utilisateur créé dans Firebase Auth

**Erreurs à tester**:
- Email vide → "Email requis"
- Email invalide → "Email invalide"
- MDP < 6 caractères → "Minimum 6 caractères"
- MDP faible → Indicateur "Faible" rouge
- MDP différents → "Les mots de passe ne correspondent pas"
- Sans cocher CGU → "Vous devez accepter les conditions"

---

### Test 2: Connexion (`/login`)

**Étapes**:
1. Naviguer vers http://localhost:8100/login
2. Remplir le formulaire:
   - Email: `test@example.com`
   - Mot de passe: `Test123!`
3. Cliquer "Se connecter"

**Résultats attendus**:
- ✅ Toast vert "Connexion réussie"
- ✅ Redirection vers `/home`
- ✅ Token stocké dans localStorage

**Erreurs à tester**:
- Email vide → "Email requis"
- MDP vide → "Mot de passe requis"
- MDP incorrect → "Identifiants invalides"
- Compte inexistant → "Utilisateur non trouvé"

---

### Test 3: Connexion Google

**Étapes**:
1. Sur `/login`, cliquer "Continuer avec Google"
2. Popup Google OAuth
3. Sélectionner compte

**Résultats attendus**:
- ✅ Popup Google s'ouvre
- ✅ Connexion réussie
- ✅ Toast vert
- ✅ Redirection vers `/home`

---

### Test 4: Réinitialisation MDP (`/reset-password`)

**Étapes**:
1. Sur `/login`, cliquer "Mot de passe oublié ?"
2. Naviguer vers `/reset-password`
3. Entrer email: `test@example.com`
4. Cliquer "Envoyer le lien"

**Résultats attendus**:
- ✅ Toast vert "Email envoyé"
- ✅ Écran de confirmation affiché
- ✅ Email Firebase reçu
- ✅ Bouton "Renvoyer" disponible

**Erreurs à tester**:
- Email vide → "Email requis"
- Email invalide → "Email invalide"

---

## 🎧 Tests AudioGuides

### Test 5: Liste des AudioGuides (`/audioguides`)

**Étapes**:
1. Naviguer vers http://localhost:8100/audioguides
2. Attendre le chargement

**Résultats attendus**:
- ✅ Spinner pendant chargement
- ✅ Liste des audioguides affichée
- ✅ Cards avec thumbnail, titre, description
- ✅ Chips langue et durée visibles
- ✅ Boutons "Télécharger" et "Écouter"

**Vérifier**:
- Minimum 1 audioguide affiché
- Thumbnails chargées
- Métadonnées correctes

---

### Test 6: Recherche AudioGuides

**Étapes**:
1. Sur `/audioguides`
2. Cliquer dans la barre de recherche
3. Taper "Abidjan"

**Résultats attendus**:
- ✅ Filtrage en temps réel
- ✅ Seuls les résultats correspondants affichés
- ✅ Si aucun résultat: icône + message "Aucun audioguide trouvé"

**Tester**:
- Recherche vide → Tous affichés
- Recherche avec résultats → Filtrage correct
- Recherche sans résultats → Message vide

---

### Test 7: Filtre par Langue

**Étapes**:
1. Sur `/audioguides`
2. Cliquer sur segment "FR"

**Résultats attendus**:
- ✅ Seuls audioguides FR affichés
- ✅ Segment "FR" actif (highlighted)

**Tester**:
- "Toutes" → Tous affichés
- "FR" → Français uniquement
- "EN" → Anglais uniquement

---

### Test 8: Pull-to-Refresh

**Étapes**:
1. Sur `/audioguides`
2. Glisser vers le bas (pull down)
3. Relâcher

**Résultats attendus**:
- ✅ Spinner de rafraîchissement
- ✅ Données rechargées
- ✅ Spinner disparaît

---

### Test 9: Téléchargement AudioGuide

**Étapes**:
1. Sur `/audioguides`
2. Trouver un audioguide
3. Cliquer bouton "Télécharger" (icône download)
4. Attendre fin téléchargement

**Résultats attendus**:
- ✅ Toast "Téléchargement en cours..."
- ✅ Toast "Téléchargé avec succès !"
- ✅ Icône ✓ verte apparaît
- ✅ Bouton télécharger disparaît
- ✅ Audio stocké en localStorage

**Vérifier localStorage**:
```javascript
// Dans DevTools Console
localStorage.getItem('audio_<AUDIOGUIDE_ID>');
// Doit retourner une URL blob: "blob:http://..."
```

---

### Test 10: Lecture Audio En Ligne

**Étapes**:
1. Sur `/audioguides`
2. Cliquer bouton "Écouter" sur un audioguide
3. Modal du lecteur s'ouvre

**Résultats attendus**:
- ✅ Modal fullscreen
- ✅ Cover image affichée
- ✅ Titre et description
- ✅ Audio démarre automatiquement
- ✅ Bouton Pause visible
- ✅ Barre de progression se met à jour
- ✅ Temps écoulé change (0:00 → 0:01, etc.)
- ✅ Durée totale affichée

---

### Test 11: Contrôles Lecteur Audio

**Étapes**:
1. Lecteur audio ouvert
2. Tester chaque contrôle:

**a) Pause/Play**:
- Cliquer Pause → Audio s'arrête
- Cliquer Play → Audio reprend
- ✅ Icône change (play ↔ pause)

**b) Seek (Barre de progression)**:
- Glisser le curseur
- ✅ Position audio change
- ✅ Temps affiché correspond

**c) Volume**:
- Glisser le slider volume
- ✅ Volume audio change
- ✅ Valeur 0 = muet, 1 = max

**d) Fermer**:
- Cliquer icône fermer (X)
- ✅ Modal se ferme
- ✅ Audio s'arrête
- ✅ Retour à la liste

---

### Test 12: Lecture Audio Offline

**Pré-requis**: Avoir téléchargé un audioguide (Test 9)

**Étapes**:
1. Couper la connexion internet (DevTools → Network → Offline)
2. Sur `/audioguides`
3. Cliquer "Écouter" sur l'audioguide téléchargé
4. Lecteur s'ouvre

**Résultats attendus**:
- ✅ Lecteur s'ouvre
- ✅ Audio joue depuis cache local
- ✅ Tous les contrôles fonctionnent
- ✅ Pas d'erreur réseau

**Tester**:
- Audioguide téléchargé → Joue offline
- Audioguide non téléchargé → Erreur si offline

---

## 🐛 Tests d'Erreurs

### Test 13: Backend Offline

**Étapes**:
1. Arrêter le backend (`Ctrl+C` dans terminal backend)
2. Sur `/audioguides`, rafraîchir (F5)

**Résultats attendus**:
- ✅ Toast rouge "Pas de réponse du serveur"
- ✅ Ou "Erreur de connexion"
- ✅ Liste vide ou état de chargement

---

### Test 14: Token Expiré

**Étapes**:
1. Connecté
2. Supprimer le token manuellement:
   ```javascript
   localStorage.removeItem('auth_token');
   ```
3. Recharger `/audioguides`

**Résultats attendus**:
- ✅ Requête échoue (401)
- ✅ Event `auth:expired` émis
- ✅ Redirection vers `/login` (si implémenté)

---

### Test 15: Audio URL Invalide

**Étapes**:
1. Modifier un audioguide dans MongoDB pour avoir une URL invalide
2. Tenter de jouer cet audioguide

**Résultats attendus**:
- ✅ Toast rouge "Erreur de lecture audio"
- ✅ Lecteur ne démarre pas

---

## 📱 Tests Responsive

### Test 16: Mobile (320px)

**Étapes**:
1. DevTools → Toggle device toolbar (Ctrl+Shift+M)
2. Sélectionner "iPhone SE" ou largeur 320px
3. Naviguer dans l'app

**Vérifier**:
- ✅ Pages lisibles
- ✅ Boutons cliquables
- ✅ Textes pas coupés
- ✅ Images redimensionnées
- ✅ Modaux fullscreen

---

### Test 17: Tablette (768px)

**Étapes**:
1. DevTools → iPad
2. Naviguer dans l'app

**Vérifier**:
- ✅ Mise en page adaptée
- ✅ Espacement correct
- ✅ Lecteur audio centré

---

### Test 18: Desktop (1920px)

**Étapes**:
1. Naviguer en plein écran desktop

**Vérifier**:
- ✅ Contenu centré (max-width)
- ✅ Pas d'éléments étirés
- ✅ Lisibilité optimale

---

## ⚡ Tests de Performance

### Test 19: Temps de Chargement

**Mesure**:
1. DevTools → Network → Clear
2. Recharger `/audioguides`
3. Vérifier temps de chargement

**Attendu**:
- ✅ < 2 secondes pour la liste
- ✅ < 1 seconde pour le cache

---

### Test 20: Téléchargement Multiples

**Étapes**:
1. Télécharger 3 audioguides rapidement
2. Observer les toasts

**Vérifier**:
- ✅ Téléchargements simultanés
- ✅ Pas de blocage UI
- ✅ Tous réussissent

---

## ✅ Checklist Complète

### Authentification
- [ ] Inscription email/password
- [ ] Connexion email/password
- [ ] Connexion Google
- [ ] Réinitialisation MDP
- [ ] Validation formulaires
- [ ] Indicateur force MDP

### AudioGuides - Liste
- [ ] Chargement liste
- [ ] Affichage cards
- [ ] Recherche
- [ ] Filtre langue
- [ ] Pull-to-refresh
- [ ] État vide

### AudioGuides - Téléchargement
- [ ] Télécharger un audioguide
- [ ] Icône téléchargé
- [ ] Cache localStorage
- [ ] Suppression téléchargement

### AudioGuides - Lecteur
- [ ] Ouvrir lecteur
- [ ] Lecture auto
- [ ] Play/Pause
- [ ] Seek
- [ ] Volume
- [ ] Affichage temps
- [ ] Lecture online
- [ ] Lecture offline
- [ ] Fermer lecteur

### Erreurs
- [ ] Backend offline
- [ ] Token expiré
- [ ] Audio invalide
- [ ] Formulaires invalides

### Responsive
- [ ] Mobile 320px
- [ ] Tablette 768px
- [ ] Desktop 1920px

---

## 📊 Résultats Attendus

### Tous les tests passent ✅
- ✅ 20 tests fonctionnels
- ✅ 6 catégories testées
- ✅ 0 erreurs critiques

### Si échec
1. Consulter console DevTools (F12)
2. Vérifier network requests
3. Vérifier backend logs
4. Consulter `RAPPORT_CONFIG_FINAL.md` section "Résolution de Problèmes"

---

## 🎊 Conclusion

Une fois tous les tests validés, l'application est prête pour :
- ✅ Développement features avancées
- ✅ Intégration pages restantes
- ✅ Build production
- ✅ Déploiement mobile

---

**Bon test ! 🚀**
