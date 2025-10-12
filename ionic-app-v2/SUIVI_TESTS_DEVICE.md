# 📊 Suivi Tests Device Android - Session du 11 octobre 2025

## 📱 Informations Device

**Device** : ___________________________  
**Android Version** : ___________________________  
**Heure Début** : ___________________________  
**Testeur** : ___________________________  

---

## ✅ PRÉPARATION (5 min)

### Checklist Prérequis

- [ ] **Device connecté USB** (cable branché)
- [ ] **Backend lancé** : `npm run dev` (PowerShell)
- [ ] **Test backend** : http://192.168.1.9:5000/api/health ✅
- [ ] **WiFi** : Device et PC sur même réseau
- [ ] **App installée** : Audioguide visible sur device
- [ ] **Fake GPS installé** : Google Play Store
- [ ] **Options développeur** : Activées (7 taps "Numéro de build")
- [ ] **Mock location app** : Fake GPS sélectionné
- [ ] **Permission localisation** : Toujours autoriser
- [ ] **Permission notifications** : Activées
- [ ] **Permission stockage** : Autorisé

**Heure Fin Préparation** : _______________

---

## 🧪 TEST 1 : GEOFENCING (15 min)

**Heure Début** : _______________

### Étapes

- [ ] Ouvrir **Fake GPS Location**
- [ ] Chercher : **"Basilique Notre-Dame de la Paix, Yamoussoukro"**
- [ ] Coordonnées : **6.8107, -5.2894**
- [ ] Cliquer sur position
- [ ] Bouton **"Start"** (play)
- [ ] Ouvrir **App Audioguide**
- [ ] Onglet **Map** (🗺️)
- [ ] Vérifier badge : **"🔔 X zones surveillées"** (nombre : ______)

### Attendre Notification (10-15s)

- [ ] **Notification reçue** : "📍 Vous êtes proche de..."
- [ ] **Nom attraction** : ___________________________
- [ ] **Distance affichée** : _______ m

### Test Sortie de Zone

- [ ] **Fake GPS** → Nouvelle position à **1 km** (ex: Place de la Paix)
- [ ] **Start** nouvelle position
- [ ] **Attendre 10-15s**
- [ ] **Notification sortie** reçue : "👋 Vous quittez la zone..."

### Résultats

- [ ] ✅ Badge zones visible
- [ ] ✅ Notification entrée zone OK
- [ ] ✅ Notification sortie zone OK
- [ ] ❌ Problème : ___________________________

**Heure Fin** : _______________  
**Status** : ☐ RÉUSSI ☐ ÉCHEC

---

## 🧪 TEST 2 : CACHE IMAGES OFFLINE (10 min)

**Heure Début** : _______________

### Étapes Précachage (Mode Online)

- [ ] **WiFi activé**
- [ ] Ouvrir **App Audioguide**
- [ ] Onglet **Home** (🏠)
- [ ] **Attendre chargement** (~5s)
- [ ] **Nombre attractions affichées** : _______ (attendu: 15)

### Vérification Stats Cache

- [ ] Onglet **Profile** (👤)
- [ ] Scroller → **"📦 Cache & Stockage"**
- [ ] **Images en cache** : _______ (attendu: 15)
- [ ] **Taille totale** : _______ MB (attendu: ~12 MB)
- [ ] **Ratio compression** : _______ % (attendu: ~65%)

### Test Mode Avion

- [ ] **Activer Mode Avion** (swipe down → icône avion)
- [ ] **Fermer app** (swipe up)
- [ ] **Rouvrir App Audioguide**
- [ ] **Onglet Home**
- [ ] **Scroller** la liste

### Résultats

- [ ] ✅ 15 images précachées
- [ ] ✅ Stats cache correctes
- [ ] ✅ Images visibles en mode avion
- [ ] ✅ Aucune erreur "image placeholder"
- [ ] ❌ Problème : ___________________________

**Heure Fin** : _______________  
**Status** : ☐ RÉUSSI ☐ ÉCHEC

---

## 🧪 TEST 3 : CACHE AUDIO + LECTURE OFFLINE (15 min)

**Heure Début** : _______________

### Étapes Download (Mode Online)

- [ ] **WiFi activé**
- [ ] **Home** → Cliquer **"Basilique Notre-Dame de la Paix"**
- [ ] Scroller → **"Guides Audio"**
- [ ] **Cliquer "📥 Télécharger"** sur **3 audioguides**

**Audio 1** :
- [ ] Nom : ___________________________
- [ ] Progress : 0% → 100% ✅
- [ ] Badge **"Téléchargé ✓"** visible
- [ ] Temps download : _______ s

**Audio 2** :
- [ ] Nom : ___________________________
- [ ] Progress : 0% → 100% ✅
- [ ] Badge **"Téléchargé ✓"** visible

**Audio 3** :
- [ ] Nom : ___________________________
- [ ] Progress : 0% → 100% ✅
- [ ] Badge **"Téléchargé ✓"** visible

### Vérification Stats Audio

- [ ] **Onglet Profile** (👤)
- [ ] **Cache & Stockage** → Section audios
- [ ] **Audios téléchargés** : _______ (attendu: 3)
- [ ] **Taille totale** : _______ MB (attendu: ~25 MB)
- [ ] **Durée totale** : _______ min (attendu: ~15 min)

### Test Lecture Offline

- [ ] **Activer Mode Avion**
- [ ] **Fermer et rouvrir app**
- [ ] **Home** → **Basilique Notre-Dame de la Paix**
- [ ] **Guides Audio** → Sélectionner audio avec badge ✓
- [ ] **Cliquer "▶️ Écouter maintenant"**

### Test Contrôles Audio Player

- [ ] ✅ Audio player apparaît (bas de l'écran)
- [ ] ✅ Audio se lance et joue
- [ ] ✅ **Play/Pause** fonctionne
- [ ] ✅ **Skip +10s** fonctionne
- [ ] ✅ **Skip -10s** fonctionne
- [ ] ✅ **Volume** ajustable
- [ ] ✅ **Vitesse** (0.75x, 1x, 1.25x, 1.5x) fonctionne
- [ ] ✅ Pas d'erreur réseau ou crash

### Résultats

- [ ] ✅ 3 audios téléchargés (badges ✓)
- [ ] ✅ Stats audio correctes
- [ ] ✅ Lecture offline fonctionne
- [ ] ✅ Tous les contrôles fonctionnent
- [ ] ❌ Problème : ___________________________

**Heure Fin** : _______________  
**Status** : ☐ RÉUSSI ☐ ÉCHEC

---

## 🧪 TEST 4 : BACKGROUND SYNC FAVORIS (10 min)

**Heure Début** : _______________

### Étapes Ajout Favoris (Mode Offline)

- [ ] **Activer Mode Avion**
- [ ] **Onglet Home**
- [ ] **Cliquer ❤️** sur attraction 1 : ___________________________
- [ ] **Icône ❤️ devient rouge** ✅
- [ ] **Cliquer ❤️** sur attraction 2 : ___________________________
- [ ] **Icône ❤️ devient rouge** ✅
- [ ] **Cliquer ❤️** sur attraction 3 : ___________________________
- [ ] **Icône ❤️ devient rouge** ✅

### Vérification Queue Sync

- [ ] **Onglet Profile** (👤)
- [ ] **Cache & Stockage** → Section sync
- [ ] **Syncs en attente** : _______ (attendu: 3)
- [ ] **Type** : favorite (x3)

### Vérification Onglet Favorites

- [ ] **Onglet Favorites** (❤️)
- [ ] **Nombre attractions** : _______ (attendu: 3)
- [ ] **Badge "En attente de sync"** visible

### Test Auto-Sync (Retour Online)

- [ ] **Désactiver Mode Avion**
- [ ] **Attendre 10-30 secondes**
- [ ] **Toast notification** : "Synchronisation en cours..." ✅
- [ ] **Toast notification** : "3 favoris synchronisés ✓" ✅

### Vérification Post-Sync

- [ ] **Profile** → **Cache & Stockage**
- [ ] **Syncs en attente** : _______ (attendu: 0)
- [ ] **Onglet Favorites**
- [ ] **Badge "En attente"** disparu ✅

### Résultats

- [ ] ✅ 3 favoris ajoutés en mode avion
- [ ] ✅ Queue sync affiche 3 items
- [ ] ✅ Favoris visibles dans onglet Favorites
- [ ] ✅ Auto-sync déclenché au retour online
- [ ] ✅ Queue vide après sync
- [ ] ✅ Badges "En attente" disparus
- [ ] ❌ Problème : ___________________________

**Heure Fin** : _______________  
**Status** : ☐ RÉUSSI ☐ ÉCHEC

---

## 📊 RÉSULTATS GLOBAUX

**Heure Fin Tests** : _______________  
**Durée Totale** : _______ min (attendu: 50 min)

### Récapitulatif

| Test | Durée | Status |
|------|-------|--------|
| Préparation | _____ min | ☐ ✅ ☐ ❌ |
| Test 1 : Geofencing | _____ min | ☐ ✅ ☐ ❌ |
| Test 2 : Cache Images | _____ min | ☐ ✅ ☐ ❌ |
| Test 3 : Cache Audio | _____ min | ☐ ✅ ☐ ❌ |
| Test 4 : Background Sync | _____ min | ☐ ✅ ☐ ❌ |

### Status Final

**Tests Réussis** : _____ / 4  
**Tests Échoués** : _____ / 4  
**Taux de Réussite** : _____ %

---

## ✅ VALIDATION GLOBALE

### Phase 1 - Geofencing
- [ ] Fake GPS configuré
- [ ] Badge "🔔 X zones" visible
- [ ] Notifications entrée/sortie reçues

### Phase 3 - Cache Images
- [ ] 15 images précachées
- [ ] Stats cache correctes
- [ ] Images visibles en mode avion

### Phase 4 - Cache Audio
- [ ] 3 audioguides téléchargés
- [ ] Lecture offline fonctionne
- [ ] Contrôles audio fonctionnent

### Phase 5 - Background Sync
- [ ] Favoris ajoutés offline
- [ ] Queue sync visible
- [ ] Auto-sync au retour online
- [ ] Queue vide après sync

---

## 🎉 SPRINT 3 : STATUS FINAL

☐ **TOUS LES TESTS RÉUSSIS** → **SPRINT 3 : 100% COMPLÉTÉ** ✅🎊

☐ **PROBLÈMES DÉTECTÉS** → Voir section Bugs ci-dessous

---

## 🐛 BUGS & PROBLÈMES RENCONTRÉS

### Bug 1
**Test** : ___________________________  
**Description** : ___________________________  
**Gravité** : ☐ Critique ☐ Majeur ☐ Mineur  
**Solution tentée** : ___________________________

### Bug 2
**Test** : ___________________________  
**Description** : ___________________________  
**Gravité** : ☐ Critique ☐ Majeur ☐ Mineur  
**Solution tentée** : ___________________________

### Bug 3
**Test** : ___________________________  
**Description** : ___________________________  
**Gravité** : ☐ Critique ☐ Majeur ☐ Mineur  
**Solution tentée** : ___________________________

---

## 📝 NOTES & OBSERVATIONS

**Performances** :  
___________________________  
___________________________  
___________________________

**UX/UI** :  
___________________________  
___________________________  
___________________________

**Suggestions d'amélioration** :  
___________________________  
___________________________  
___________________________

---

## 📸 CAPTURES D'ÉCRAN

- [ ] Screenshot Test 1 : Notification geofencing
- [ ] Screenshot Test 2 : Stats cache images
- [ ] Screenshot Test 3 : Audio player offline
- [ ] Screenshot Test 4 : Queue sync + auto-sync

**Dossier** : ___________________________

---

## 🎯 PROCHAINES ÉTAPES

### Si Tous les Tests ✅

- [ ] Marquer todo "Tests device" comme complété
- [ ] Mettre à jour checklist projet (100%)
- [ ] Créer rapport final Sprint 3
- [ ] Préparer Sprint 4 : Social & Reviews

### Si Problèmes Détectés

- [ ] Analyser logs (Chrome DevTools + Logcat)
- [ ] Corriger bugs critiques
- [ ] Re-tester fonctionnalités affectées
- [ ] Valider corrections

---

**Signature Testeur** : ___________________________  
**Date** : 11 octobre 2025  
**Version App** : 1.0.0  
**Sprint** : 3 - Géolocalisation & Offline

---

**Excellent travail ! 🎉🎊✨**
