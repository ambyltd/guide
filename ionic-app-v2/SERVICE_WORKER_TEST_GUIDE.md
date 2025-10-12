# Guide de Test - Service Worker & Mode Offline (Sprint 3 Phase 2)

## 🎯 Objectif
Valider le bon fonctionnement du Service Worker et du mode offline complet.

---

## 📋 Pré-requis

### Option A : Test en dev (localhost)
- ✅ Backend API running : `npm run dev` dans `backend-api/`
- ✅ Frontend dev server : `npm run dev` dans `ionic-app-v2/`
- ✅ Browser moderne (Chrome, Edge, Firefox)

### Option B : Test en production (Android device)
- ✅ App installée sur device physique via Android Studio
- ✅ Backend accessible (local network ou Railway.app)
- ✅ WiFi/4G activé initialement

---

## 🧪 Tests à Effectuer

### Test 1 : Enregistrement du Service Worker ✅

**Étapes** :
1. Ouvrir l'app (dev ou production)
2. Ouvrir DevTools (F12) → Tab **Console**
3. Chercher dans les logs :
   ```
   ✅ Service Worker registered successfully
   ```
4. Aller dans DevTools → Tab **Application** → **Service Workers**
5. Vérifier :
   - ✅ Status : **Activated and running**
   - ✅ URL : `/sw.js`
   - ✅ Source : `workbox-...`

**Résultat attendu** :
- Toast vert en bas : **"🚀 Mode offline activé !"**
- Service Worker actif dans DevTools

---

### Test 2 : Précachage Automatique 📦

**Étapes** :
1. Charger la page Home (attendre 3 secondes)
2. Vérifier toast : **"✅ X attractions en cache"** (X = nombre d'attractions)
3. DevTools → Application → **Cache Storage**
4. Vérifier présence des caches :
   - ✅ `workbox-precache-v2-...` (~3.3 MB, 17 entrées)
   - ✅ `api-cache` (optionnel, si requêtes API effectuées)
   - ✅ `images-cache` (optionnel, si images chargées)
   - ✅ `mapbox-tiles` (optionnel, si Map visitée)

**Résultat attendu** :
- Cache créé avec fichiers statiques
- Toast de confirmation du précachage

---

### Test 3 : Stratégie Network First (API) 🌐

**Étapes** :
1. Charger Home → Vérifier attractions affichées
2. DevTools → **Network** tab
3. Filter : `api/attractions`
4. Vérifier :
   - ✅ Requête réseau effectuée (statut 200)
   - ✅ Temps : ~100-500ms (selon backend)
5. DevTools → Application → Cache Storage → `api-cache`
6. Chercher entrée : `http://...api/attractions`
7. Cliquer → Vérifier JSON des attractions en cache

**Résultat attendu** :
- Requête réseau réussit
- Réponse mise en cache automatiquement
- Expiration : 5 minutes

---

### Test 4 : Stratégie Cache First (Images) 🖼️

**Étapes** :
1. Charger Home (avec images d'attractions)
2. DevTools → Network tab
3. Filter : `.png` ou `.jpg`
4. Première charge :
   - ✅ Images chargées depuis le réseau (statut 200)
   - ✅ Size : ~100-500 KB par image
5. Rafraîchir la page (Ctrl+R)
6. Vérifier :
   - ✅ Images chargées depuis Service Worker (from ServiceWorker)
   - ✅ Size : (disk cache)
   - ✅ Temps : <10ms

**Résultat attendu** :
- 1ère charge : Réseau
- 2ème charge : Cache (instantané)

---

### Test 5 : Mode Offline Complet 📡

**Étapes** :
1. Charger l'app complètement :
   - ✅ Home page (attractions)
   - ✅ Map page (tiles Mapbox)
   - ✅ AttractionDetail (1 attraction)
   - ✅ Profile page
2. Activer **mode Avion** (ou déconnecter WiFi/4G)
3. Vérifier bannière en haut :
   - ✅ Chip orange : **"Mode hors ligne • X MB disponible"**
4. Naviguer dans l'app :
   - ✅ Home → Attractions toujours visibles (depuis cache API)
   - ✅ Map → Carte affichée (tiles Mapbox en cache)
   - ✅ AttractionDetail → Détails accessibles
   - ✅ Profile → Stockage Offline visible

**Résultat attendu** :
- App fonctionnelle malgré absence réseau
- Toutes les pages précédemment visitées accessibles
- Bannière "Mode hors ligne" visible

---

### Test 6 : Statistiques Cache (Profile) 📊

**Étapes** :
1. Aller dans **Profile** tab
2. Scroller vers section **"💾 Stockage Offline"**
3. Vérifier affichage :
   - ✅ Status : **"Actif et prêt pour le mode offline"**
   - ✅ **Cache Total** : > 0 MB
   - ✅ **Données API** : > 0 KB (si requêtes effectuées)
   - ✅ **Images** : > 0 MB (si images chargées)
   - ✅ **Fichiers Audio** : 0 B (Phase 4 pas encore)
   - ✅ **Fichiers Statiques** : ~3-4 MB (précache)
4. Vérifier **Espace de Stockage** :
   - ✅ Barre de progression verte/jaune/rouge
   - ✅ Pourcentage < 10% (normalement)
5. Cliquer **"Actualiser"** → Vérifier refresh des stats
6. Cliquer **"Vider le Cache"** → Confirmer
7. Vérifier :
   - ✅ Cache Total passe à ~0 MB
   - ✅ Toast ou indication de succès

**Résultat attendu** :
- Statistiques précises
- Actions fonctionnelles (actualiser, vider)

---

### Test 7 : Offline Indicator (Bannière) 🔔

**Étapes Online** :
1. Connexion active
2. Vérifier bannière en haut :
   - ✅ Chip vert : **"En ligne • X MB en cache"**
   - ✅ Opacité 70% (semi-transparente)

**Étapes Offline** :
1. Activer mode Avion
2. Vérifier bannière :
   - ✅ Chip orange : **"Mode hors ligne • X MB disponible"**
   - ✅ Opacité 100% (bien visible)
   - ✅ Background avec gradient jaune

**Résultat attendu** :
- Bannière réactive au changement online/offline
- Animation slide-down à l'apparition

---

### Test 8 : Mise à Jour Service Worker 🔄

**Étapes** :
1. Noter version actuelle dans `package.json` : `"version": "1.0.0"`
2. Modifier version : `"version": "1.0.1"`
3. Rebuild : `npm run build`
4. Déployer nouveau build (copier `dist/` ou redéployer)
5. Recharger l'app (Ctrl+R)
6. Attendre 5-10 secondes
7. Vérifier toast :
   - ✅ Toast orange : **"🔄 Mise à jour disponible ! Cliquez pour installer."**
   - ✅ Boutons : **"Installer"** | **"Plus tard"**
8. Cliquer **"Installer"**
9. Vérifier :
   - ✅ App redémarre automatiquement
   - ✅ Nouvelle version active

**Résultat attendu** :
- Détection automatique des mises à jour
- Installation sans friction

---

### Test 9 : Précachage Attractions (ServiceWorkerProvider) 📦

**Étapes** :
1. Vider cache : DevTools → Application → Clear storage → **Clear site data**
2. Recharger l'app
3. Attendre 3-5 secondes (délai précachage)
4. Vérifier toast : **"✅ X attractions en cache"**
5. DevTools → Application → Cache Storage → `images-cache`
6. Vérifier présence des premières images d'attractions

**Résultat attendu** :
- Précachage automatique après activation SW
- Toast de confirmation
- Images dans le cache

---

### Test 10 : Badge "Offline Ready" (Profile) ✅

**Étapes Online** :
1. Aller dans **Profile** tab
2. Sous l'email, vérifier badge :
   - ✅ Texte vert : **"✅ Mode offline activé"**

**Étapes Offline** :
1. Activer mode Avion
2. Recharger Profile tab
3. Vérifier badge :
   - ✅ Texte orange : **"📡 Hors ligne"**

**Résultat attendu** :
- Badge visible si SW actif
- Couleur dynamique selon statut réseau

---

## 📈 Checklist de Validation Finale

- [ ] ✅ Service Worker enregistré (DevTools → Application)
- [ ] 📦 Précache de 17 fichiers (~3.3 MB)
- [ ] 🌐 Stratégie Network First pour API (cache après succès)
- [ ] 🖼️ Stratégie Cache First pour images (instantané 2ème charge)
- [ ] 📡 Mode offline fonctionnel (app utilisable sans réseau)
- [ ] 📊 Statistiques cache précises (Profile → Stockage Offline)
- [ ] 🔔 Bannière OfflineIndicator réactive (online/offline)
- [ ] 🔄 Détection mises à jour automatique (toast orange)
- [ ] 📦 Précachage automatique attractions (toast vert)
- [ ] ✅ Badge "Offline Ready" dans Profile (vert/orange)

---

## 🐛 Troubleshooting

### Problème : Service Worker non enregistré

**Symptômes** :
- Pas de toast "Mode offline activé"
- Onglet Application → Service Workers vide

**Solutions** :
1. Vérifier que l'app est servie en HTTPS ou localhost
2. Vérifier `vite.config.ts` → `devOptions.enabled: true`
3. Vider cache navigateur : Ctrl+Shift+Delete
4. Hard reload : Ctrl+Shift+R

### Problème : Cache ne se remplit pas

**Symptômes** :
- Cache Storage vide ou incomplet
- Pas de stratégie appliquée

**Solutions** :
1. Vérifier patterns dans `vite.config.ts` → `workbox.runtimeCaching`
2. Vérifier URLs des requêtes (doivent matcher les regex)
3. DevTools → Network → Vérifier requêtes ont statut 200
4. Désenregistrer SW : `Application → Service Workers → Unregister`
5. Recharger et réenregistrer

### Problème : Mode offline ne fonctionne pas

**Symptômes** :
- Erreurs "Failed to fetch" en offline
- Pages blanches

**Solutions** :
1. Vérifier que les ressources ont été chargées online d'abord
2. Cache Strategy correcte (Network First pour API nécessite 1ère charge)
3. Précache activé et complet (17 fichiers)
4. Vérifier absence de requêtes bloquantes (Firebase Auth, etc.)

### Problème : Toast de mise à jour ne s'affiche pas

**Symptômes** :
- Pas de notification malgré nouvelle version

**Solutions** :
1. Vérifier `registerType: 'autoUpdate'` dans `vite.config.ts`
2. Vérifier intervalle de vérification (1h par défaut)
3. Forcer vérification : `serviceWorkerService.checkForUpdates()`
4. Vérifier événement `updatefound` dans console

---

## 🎉 Résultat Attendu Final

✅ **Application Progressive Web App (PWA) complète** avec :
- Service Worker actif et fonctionnel
- Précache automatique de 3.3 MB
- 3 stratégies de cache optimisées
- Mode offline fonctionnel
- UI de gestion du cache dans Profile
- Bannière de statut online/offline
- Système de mise à jour automatique
- Précachage intelligent des attractions

**Performance** :
- 1ère visite : ~2-3s (chargement réseau)
- 2ème visite : ~0.5s (cache)
- Offline : 100% fonctionnel pour pages visitées
- Consommation données : -99% (2ème visite)

---

**Date** : 10 octobre 2025  
**Version** : Sprint 3 Phase 2 - COMPLÉTÉ  
**Auteur** : GitHub Copilot
