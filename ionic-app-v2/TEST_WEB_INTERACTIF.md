# 🧪 Guide de Test Web Interactif - Sprint 3

## 🎯 Objectif
Tester toutes les intégrations des Phases 3, 4, et 5 en mode web (localhost:5173)

**Durée estimée** : 30 minutes  
**Prérequis** : Dev server lancé sur http://localhost:5173/

---

## ✅ Checklist de Test

### 📋 **Préparation (2 min)**

- [ ] Dev server lancé : http://localhost:5173/
- [ ] Backend API lancé : http://localhost:5000/ (optionnel pour Phase 5)
- [ ] Chrome DevTools ouvert (F12)
- [ ] Console visible (onglet Console)
- [ ] Network tab visible (pour tests offline)

---

## 🧪 **Test 1 : Phase 3 - Précachage Images (5 min)**

### Objectif
Vérifier que les images des attractions sont précachées automatiquement au chargement de la page Home.

### Étapes

1. **Ouvrir la page Home**
   ```
   URL: http://localhost:5173/
   ```

2. **Ouvrir la Console DevTools (F12 → Console)**

3. **Vérifier les logs de précachage**
   
   **✅ Attendu** :
   ```
   [ImageCache] Précachage de 15 images avec priorité high
   [ImageCache] Précachage: 1/15 images
   [ImageCache] Précachage: 2/15 images
   [ImageCache] Précachage: 3/15 images
   ...
   [ImageCache] Précachage: 15/15 images
   [ImageCache] Précachage terminé en X.Xs
   ```

4. **Tester les statistiques cache**
   
   Dans la console, taper :
   ```javascript
   import('./services/imageCacheService').then(m => m.imageCacheService.getStats().then(console.log))
   ```
   
   **✅ Attendu** :
   ```javascript
   {
     totalImages: 15,
     totalSize: 12458752, // ~12 MB
     compressedCount: 15,
     averageCompressionRatio: 0.65,
     oldestImage: 1728662400000,
     newestImage: 1728662450000
   }
   ```

5. **Vérifier la compression**
   
   Les logs doivent afficher des ratios de compression :
   ```
   [ImageCache] Image compressée: 2.5 MB → 1.6 MB (64% de l'original)
   ```

### ✅ Résultat

- [ ] Logs de précachage visibles (1/15 → 15/15)
- [ ] Temps de précachage raisonnable (<10s)
- [ ] Stats cache accessibles
- [ ] Ratio compression entre 0.5 et 0.8

---

## 🧪 **Test 2 : Phase 3 - Lazy Loading Images (3 min)**

### Objectif
Vérifier que les images ne se chargent que lorsqu'elles deviennent visibles (IntersectionObserver).

### Étapes

1. **Ouvrir Network tab (F12 → Network)**

2. **Filtrer les images**
   ```
   Filter: "images" ou "img"
   ```

3. **Recharger la page** (Ctrl+R)

4. **Scroller lentement vers le bas**

5. **Observer les requêtes d'images**
   
   **✅ Attendu** :
   - Images chargées **uniquement** quand elles entrent dans le viewport
   - Pas de chargement massif au départ
   - Chargement progressif au scroll

### ✅ Résultat

- [ ] Images chargées au scroll (lazy loading actif)
- [ ] Pas de chargement inutile d'images hors viewport

---

## 🧪 **Test 3 : Phase 4 - Téléchargement Audio avec Progress (10 min)**

### Objectif
Tester le téléchargement d'audioguides avec barre de progression et badges "Téléchargé".

### Étapes

1. **Aller sur AttractionDetail**
   ```
   Page Home → Cliquer sur une attraction (ex: Basilique Notre-Dame de la Paix)
   ```

2. **Localiser la section "Guides Audio"**

3. **Cliquer sur le bouton "📥 Télécharger" d'un audioguide**

4. **Observer la progress bar**
   
   **✅ Attendu** :
   - Barre de progression de 0% → 100%
   - Pourcentage affiché (ex: "45%")
   - Bouton change en "❌ Annuler" pendant le download

5. **Vérifier la console pour les logs**
   ```
   [AudioCache] Téléchargement audio: audio123
   [AudioCache] Progress: 25% (2.5 MB / 10 MB) - Speed: 500 KB/s - Remaining: 15s
   [AudioCache] Progress: 50% (5.0 MB / 10 MB) - Speed: 520 KB/s - Remaining: 10s
   [AudioCache] Progress: 100% (10 MB / 10 MB) - Download complete
   [AudioCache] Audio stocké dans IndexedDB
   ```

6. **Vérifier le badge "Téléchargé ✓"**
   
   **✅ Attendu** :
   - Badge vert "Téléchargé ✓" apparaît après 100%
   - Bouton devient "🗑️ Supprimer"

7. **Tester les statistiques audio**
   
   Console :
   ```javascript
   import('./services/audioCacheService').then(m => m.audioCacheService.getStats().then(console.log))
   ```
   
   **✅ Attendu** :
   ```javascript
   {
     totalAudios: 1,
     totalSize: 10485760, // ~10 MB
     totalDuration: 300, // 5 min
     availableSpace: 89514240, // ~90 MB
     cacheUsagePercent: 10.5
   }
   ```

8. **Télécharger 2-3 autres audioguides**

9. **Vérifier IndexedDB**
   
   DevTools → Application tab → IndexedDB → audioguide_cache → audios
   
   **✅ Attendu** :
   - Entries pour chaque audio téléchargé
   - Blob stocké avec metadata (size, duration, attractionId)

### ✅ Résultat

- [ ] Progress bar fonctionne (0% → 100%)
- [ ] Logs de progression visibles dans console
- [ ] Badge "Téléchargé ✓" apparaît après download
- [ ] Stats audio correctes
- [ ] IndexedDB contient les audios

---

## 🧪 **Test 4 : Phase 4 - Lecture Audio Offline (5 min)**

### Objectif
Vérifier que les audios téléchargés peuvent être lus en mode offline.

### Étapes

1. **Télécharger 1 audioguide** (si pas déjà fait)

2. **Activer le mode offline**
   
   DevTools → Network tab → Cocher "Offline"

3. **Recharger la page** (Ctrl+R)

4. **Aller sur AttractionDetail** (même attraction)

5. **Cliquer sur "▶️ Écouter maintenant" pour l'audio téléchargé**

6. **Vérifier la lecture**
   
   **✅ Attendu** :
   - Audio se lance sans erreur
   - Pas de requête réseau (Network tab vide)
   - Lecture depuis IndexedDB (Object URL)

7. **Vérifier la console**
   ```
   [AudioCache] Lecture audio offline: audio123
   [AudioCache] Object URL créé: blob:http://localhost:5173/abc-def-ghi
   ```

### ✅ Résultat

- [ ] Audio joue en mode offline
- [ ] Aucune requête réseau
- [ ] Object URL généré depuis IndexedDB

---

## 🧪 **Test 5 : Phase 5 - Favoris Online (3 min)**

### Objectif
Tester l'ajout de favoris en mode online avec sync immédiat.

### Prérequis
⚠️ Backend API doit être lancé sur http://localhost:5000/

**Si backend non lancé** :
```bash
cd C:\Users\jpama\Desktop\i\audioguide\backend-api
npm run dev
```

### Étapes

1. **S'assurer d'être en mode ONLINE**
   
   DevTools → Network tab → Décocher "Offline"

2. **Page Home → Cliquer sur ❤️ (favori) d'une attraction**

3. **Vérifier la console**
   
   **✅ Attendu** :
   ```
   [BackgroundSync] addFavorite: attr123 pour user456
   [BackgroundSync] Item ajouté à la queue: favorite
   [BackgroundSync] Sync: 1 items en queue
   [BackgroundSync] POST /api/favorites - Tentative 1/5
   [BackgroundSync] POST /api/favorites - SUCCESS
   [BackgroundSync] Item synchronisé et retiré de la queue
   [BackgroundSync] Queue vide après sync
   ```

4. **Vérifier Network tab**
   
   **✅ Attendu** :
   - Requête POST vers `/api/favorites`
   - Status: 200 OK (si backend lancé) OU 404/500 (si backend non lancé)

5. **Tester les stats sync**
   
   Console :
   ```javascript
   import('./services/backgroundSyncService').then(m => console.log(m.backgroundSyncService.getStats()))
   ```
   
   **✅ Attendu** :
   ```javascript
   {
     totalPending: 0, // Si sync réussi
     byType: {},
     oldestItem: null,
     isOnline: true
   }
   ```

### ✅ Résultat

- [ ] Logs de sync visibles
- [ ] Requête POST /api/favorites visible dans Network
- [ ] Queue vide après sync (si backend OK)

---

## 🧪 **Test 6 : Phase 5 - Favoris Offline → Auto-sync (7 min)**

### Objectif
Tester l'ajout de favoris en mode offline et la synchronisation automatique au retour online.

### Étapes

1. **Activer le mode OFFLINE**
   
   DevTools → Network tab → Cocher "Offline"

2. **Page Home → Cliquer sur ❤️ de 3 attractions différentes**

3. **Vérifier la console**
   
   **✅ Attendu** :
   ```
   [BackgroundSync] addFavorite - MODE OFFLINE détecté
   [BackgroundSync] Item ajouté à la queue (pending sync)
   [BackgroundSync] Queue: 1 items en attente
   [BackgroundSync] addFavorite - MODE OFFLINE détecté
   [BackgroundSync] Queue: 2 items en attente
   [BackgroundSync] addFavorite - MODE OFFLINE détecté
   [BackgroundSync] Queue: 3 items en attente
   ```

4. **Vérifier localStorage**
   
   DevTools → Application tab → Local Storage → http://localhost:5173 → backgroundSyncQueue
   
   **✅ Attendu** :
   ```json
   [
     { "type": "favorite", "data": {...}, "attempts": 0, "priority": "high" },
     { "type": "favorite", "data": {...}, "attempts": 0, "priority": "high" },
     { "type": "favorite", "data": {...}, "attempts": 0, "priority": "high" }
   ]
   ```

5. **RETOUR ONLINE**
   
   DevTools → Network tab → Décocher "Offline"

6. **Attendre 5-10 secondes** (auto-sync périodique 30s ou network listener)

7. **Vérifier la console**
   
   **✅ Attendu** :
   ```
   [BackgroundSync] Network status changed: online
   [BackgroundSync] Déclenchement auto-sync
   [BackgroundSync] Sync: 3 items en queue
   [BackgroundSync] POST /api/favorites - Tentative 1/5
   [BackgroundSync] POST /api/favorites - SUCCESS
   [BackgroundSync] POST /api/favorites - Tentative 1/5
   [BackgroundSync] POST /api/favorites - SUCCESS
   [BackgroundSync] POST /api/favorites - Tentative 1/5
   [BackgroundSync] POST /api/favorites - SUCCESS
   [BackgroundSync] Queue vide après sync
   ```

8. **Vérifier localStorage → backgroundSyncQueue**
   
   **✅ Attendu** : Array vide `[]`

### ✅ Résultat

- [ ] 3 favoris ajoutés en mode offline
- [ ] Queue localStorage contient 3 items
- [ ] Auto-sync déclenché au retour online
- [ ] 3 requêtes POST /api/favorites envoyées
- [ ] Queue vide après sync

---

## 🧪 **Test 7 : Phase 5 - Retry avec Exponential Backoff (5 min)**

### Objectif
Tester la logique de retry avec exponential backoff en cas d'échec.

### Prérequis
⚠️ Backend API doit être **arrêté** pour simuler les erreurs.

### Étapes

1. **Arrêter le backend** (si lancé)
   
   Terminal backend → Ctrl+C

2. **Mode ONLINE** (Network tab → Offline décoché)

3. **Cliquer sur ❤️ d'une attraction**

4. **Observer la console**
   
   **✅ Attendu** :
   ```
   [BackgroundSync] addFavorite: attr123
   [BackgroundSync] Sync: 1 items
   [BackgroundSync] POST /api/favorites - Tentative 1/5
   [BackgroundSync] POST /api/favorites - FAILED (Network error)
   [BackgroundSync] Retry in 1000ms (exponential backoff: attempt 1)
   
   [BackgroundSync] POST /api/favorites - Tentative 2/5
   [BackgroundSync] POST /api/favorites - FAILED
   [BackgroundSync] Retry in 2000ms (exponential backoff: attempt 2)
   
   [BackgroundSync] POST /api/favorites - Tentative 3/5
   [BackgroundSync] POST /api/favorites - FAILED
   [BackgroundSync] Retry in 4000ms (exponential backoff: attempt 3)
   
   [BackgroundSync] POST /api/favorites - Tentative 4/5
   [BackgroundSync] POST /api/favorites - FAILED
   [BackgroundSync] Retry in 8000ms (exponential backoff: attempt 4)
   
   [BackgroundSync] POST /api/favorites - Tentative 5/5
   [BackgroundSync] POST /api/favorites - FAILED
   [BackgroundSync] Max attempts reached (5/5) - Item removed from queue
   ```

5. **Vérifier les délais de retry**
   
   **✅ Attendu** :
   - Attempt 1: Immédiat
   - Attempt 2: +1s
   - Attempt 3: +2s
   - Attempt 4: +4s
   - Attempt 5: +8s
   - Total: ~15s

6. **Redémarrer le backend**
   ```bash
   cd C:\Users\jpama\Desktop\i\audioguide\backend-api
   npm run dev
   ```

7. **Ajouter un nouveau favori**

8. **Vérifier que le sync réussit maintenant**

### ✅ Résultat

- [ ] 5 tentatives de retry observées
- [ ] Délais exponentiels corrects (1s, 2s, 4s, 8s)
- [ ] Item retiré après 5 échecs
- [ ] Sync réussit après redémarrage backend

---

## 🧪 **Test 8 : Stats Cache dans Profile (2 min)**

### Objectif
Vérifier l'affichage des statistiques de cache dans la page Profile.

### Étapes

1. **Aller sur la page Profile**
   
   Navigation → Onglet "Profile" (👤)

2. **Localiser la section "Cache & Stockage"**

3. **Vérifier les statistiques affichées**
   
   **✅ Attendu** :
   ```
   📦 Cache & Stockage
   
   Images en cache : 15
   Taille totale : 12.5 MB
   Ratio compression : 65%
   
   Audios téléchargés : 3
   Taille totale : 25.8 MB
   Durée totale : 15 min 30s
   
   Syncs en attente : 0
   ```

4. **Cliquer sur "🔄 Actualiser les statistiques"**

5. **Vérifier que les stats se mettent à jour**

6. **Tester en mode offline**
   
   - Ajouter 2 favoris en mode offline
   - Retourner sur Profile
   - Vérifier "Syncs en attente : 2"

### ✅ Résultat

- [ ] Section "Cache & Stockage" visible
- [ ] Stats images correctes
- [ ] Stats audios correctes
- [ ] Stats syncs en attente correctes
- [ ] Bouton actualiser fonctionne

---

## 📊 **Récapitulatif Final**

### Résultats des Tests

| Test | Phase | Status | Durée |
|------|-------|--------|-------|
| Précachage images | Phase 3 | ☐ | 5 min |
| Lazy loading images | Phase 3 | ☐ | 3 min |
| Download audio + progress | Phase 4 | ☐ | 10 min |
| Lecture audio offline | Phase 4 | ☐ | 5 min |
| Favoris online | Phase 5 | ☐ | 3 min |
| Favoris offline → sync | Phase 5 | ☐ | 7 min |
| Retry exponential backoff | Phase 5 | ☐ | 5 min |
| Stats cache Profile | Toutes | ☐ | 2 min |
| **TOTAL** | | | **40 min** |

---

## ✅ Validation Globale

### Phase 3 - Cache Images
- [ ] Précachage automatique fonctionne
- [ ] Lazy loading actif
- [ ] Compression Canvas API (50-80%)
- [ ] Stats cache accessibles

### Phase 4 - Cache Audio
- [ ] Téléchargement avec progress bar
- [ ] Badges "Téléchargé ✓" visibles
- [ ] Lecture offline depuis IndexedDB
- [ ] Stats audio correctes

### Phase 5 - Background Sync
- [ ] Favoris online → sync immédiat
- [ ] Favoris offline → queue persistante
- [ ] Auto-sync au retour online
- [ ] Exponential backoff sur erreur
- [ ] Stats queue accessibles

---

## 🐛 Problèmes Rencontrés

### Problème 1
**Description** : 
**Solution** : 

### Problème 2
**Description** : 
**Solution** : 

---

## 🎉 Conclusion

**Status global** : ☐ Tous les tests passés  

**Prochaine étape** : Configuration backend device + Installation Android

---

**Date du test** : _______________  
**Testeur** : _______________  
**Navigateur** : Chrome  
**Version** : _______________
