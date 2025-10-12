# 🔗 Guide de Test ShareSheet (Web) - Sprint 4 Phase 4

**Date**: 2025-01-XX  
**Durée**: 10 minutes  
**URL**: http://localhost:5173/  
**Status**: ✅ Build compilé sans erreurs (42.82s)

---

## 📋 Checklist de Test

### ✅ Étape 1 : Accéder à une Attraction (2 min)

1. **Ouvrir navigateur** : http://localhost:5173/
2. **Onglet Home** : Attendre chargement des attractions
3. **Cliquer** sur une attraction (ex: "Basilique Notre-Dame de la Paix")
4. **Vérifier** : Page `AttractionDetail` se charge

**Résultat attendu** :
- ✅ Page détail attraction affichée
- ✅ Header avec bouton partage (icône `shareOutline`) visible

---

### ✅ Étape 2 : Ouvrir le ShareSheet Modal (2 min)

1. **Cliquer** sur le **bouton Partage** (header, à droite du bouton favori ❤️)
2. **Observer** : Modal ShareSheet s'ouvre depuis le bas (animation slideUp)

**Résultat attendu** :
- ✅ Modal avec titre "Partager cette attraction"
- ✅ 4 options visibles :
  - **WhatsApp** (vert #25D366) - Logo WhatsApp
  - **Facebook** (bleu #1877F2) - Logo Facebook
  - **Twitter** (bleu #1DA1F2) - Logo Twitter
  - **Plus d'options** (bleu #3880ff) - Icône partage natif
- ✅ Message info : "Partagez cette attraction avec vos amis et gagnez des points !"
- ✅ Bouton "Annuler" (ferme modal)

**Screenshot attendu** :
```
┌────────────────────────────────┐
│ Partager cette attraction      │
│ Partagez... et gagnez des pts! │
├────────────────────────────────┤
│ [🟢] WhatsApp                   │
│ [🔵] Facebook                   │
│ [🔵] Twitter                    │
│ [🔵] Plus d'options             │
├────────────────────────────────┤
│        [Annuler]               │
└────────────────────────────────┘
```

---

### ✅ Étape 3 : Tester Partage WhatsApp (2 min)

1. **Cliquer** sur **WhatsApp**
2. **Observer** : 
   - Console logs : `"✅ Partagé avec succès sur whatsapp"`
   - Modal se ferme automatiquement
   - ⚠️ **Web** : Ouvre popup "WhatsApp Web" ou nouvelle fenêtre (peut être bloquée par navigateur)

**Console attendue** :
```
[socialShareService] 🟢 shareToWhatsApp() called with:
  text: "Basilique Notre-Dame de la Paix - La plus grande basilique au monde..."
  url: "http://localhost:5173/tabs/attraction/..."
[socialShareService] Opening WhatsApp with URL: whatsapp://send?text=...
✅ Partagé avec succès sur whatsapp
```

**Vérifications** :
- ✅ Console log success
- ✅ URL WhatsApp générée avec `whatsapp://send?text=...`
- ✅ Popup/fenêtre ouverte (si navigateur autorise)

---

### ✅ Étape 4 : Tester Partage Facebook (2 min)

1. **Rouvrir** ShareSheet modal (clic bouton partage)
2. **Cliquer** sur **Facebook**
3. **Observer** :
   - Console logs : `"✅ Partagé avec succès sur facebook"`
   - Nouvelle fenêtre Facebook Dialog (ou popup bloquée)

**Console attendue** :
```
[socialShareService] 🔵 shareToFacebook() called with:
  url: "http://localhost:5173/tabs/attraction/..."
[socialShareService] Opening Facebook share dialog
✅ Partagé avec succès sur facebook
```

**Vérifications** :
- ✅ Console log success
- ✅ URL Facebook générée : `https://www.facebook.com/sharer/sharer.php?u=...`
- ✅ Fenêtre popup Facebook (ou bloquée par navigateur)

---

### ✅ Étape 5 : Tester Partage Twitter (2 min)

1. **Rouvrir** ShareSheet modal
2. **Cliquer** sur **Twitter**
3. **Observer** :
   - Console logs : `"✅ Partagé avec succès sur twitter"`
   - Nouvelle fenêtre Twitter (X) avec texte pré-rempli

**Console attendue** :
```
[socialShareService] 🔵 shareToTwitter() called with:
  text: "Basilique Notre-Dame de la Paix - La plus grande basilique au monde..."
  url: "http://localhost:5173/tabs/attraction/..."
[socialShareService] Opening Twitter with tweet
✅ Partagé avec succès sur twitter
```

**Vérifications** :
- ✅ Console log success
- ✅ URL Twitter générée : `https://twitter.com/intent/tweet?text=...&url=...`
- ✅ Fenêtre popup Twitter (ou bloquée)

---

### ✅ Étape 6 : Tester Partage Natif (Web Share API) (2 min)

1. **Rouvrir** ShareSheet modal
2. **Cliquer** sur **Plus d'options**
3. **Observer** :
   - Console logs : `"✅ Partagé avec succès sur native"`
   - ⚠️ **Desktop** : Peut afficher erreur "Share not supported" (normal)
   - ⚠️ **Mobile Web** : Ouvre partage natif système (WhatsApp, Email, Copier, etc.)

**Console attendue (Desktop)** :
```
[socialShareService] 📱 shareAttraction() called with:
  attractionId: "..."
  attractionName: "Basilique Notre-Dame de la Paix"
  description: "..."
  imageUrl: "..."
  rating: 4.8
[socialShareService] Capacitor Share not available, using Web Share API
[socialShareService] ❌ Error sharing: Share not supported on desktop
✅ Partagé avec succès sur native (ou erreur catchée)
```

**Vérifications** :
- ✅ Console log présent
- ✅ Tentative d'utiliser `navigator.share()` (Web Share API)
- ✅ **Desktop** : Peut échouer (normal, pas de partage natif)
- ✅ **Mobile** : Ouvre système share sheet

---

## 🎯 Résumé des Tests

| **Plateforme**      | **Méthode**                | **Comportement Web**                           | **Status** |
|---------------------|----------------------------|------------------------------------------------|------------|
| **WhatsApp**        | `shareToWhatsApp()`        | Ouvre `whatsapp://send` ou popup WhatsApp Web | ✅         |
| **Facebook**        | `shareToFacebook()`        | Ouvre `facebook.com/sharer` popup              | ✅         |
| **Twitter**         | `shareToTwitter()`         | Ouvre `twitter.com/intent/tweet` popup         | ✅         |
| **Natif**           | `shareAttraction()` → Web Share API | Desktop: Erreur / Mobile: Partage système | ✅         |

---

## 🐛 Troubleshooting

### Problème : Popups bloquées par navigateur

**Symptôme** : Aucune fenêtre ne s'ouvre, console affiche "Popup blocked"

**Solution** :
1. Autoriser popups pour `localhost:5173` dans paramètres navigateur
2. Chrome : Icône "popup bloquée" dans barre d'adresse → Toujours autoriser
3. Firefox : Préférences → Autorisations → Popups → Ajouter exception

---

### Problème : Erreur "Share not supported"

**Symptôme** : Console affiche erreur sur partage natif

**Explication** : Normal sur desktop, Web Share API nécessite :
- HTTPS (sauf localhost)
- Navigateur compatible (Chrome 89+, Safari 12.1+)
- Contexte sécurisé

**Solution** : Tester sur mobile ou ignorer (fonctionnera sur device Android)

---

### Problème : Modal ne s'ouvre pas

**Symptôme** : Clic bouton partage ne fait rien

**Vérifications** :
1. **Console Browser** : Chercher erreurs JavaScript
2. **React DevTools** : Vérifier `showShareSheet` state = `true`
3. **Recharger page** : Ctrl+Shift+R (cache reload)
4. **Vérifier imports** : `ShareSheet`, `socialShareService` présents

**Debug** :
```javascript
// Dans console browser
document.querySelector('ion-button[onClick*="handleShare"]')?.click()
// Devrait ouvrir modal si code OK
```

---

## ✅ Validation Finale

**Checklist de succès** :
- [x] Build compilé sans erreurs TypeScript (42.82s)
- [x] Serveur dev lancé : http://localhost:5173/
- [ ] ShareSheet modal s'ouvre au clic bouton partage
- [ ] 4 options de partage visibles (WhatsApp, Facebook, Twitter, Natif)
- [ ] Console logs "✅ Partagé avec succès sur {platform}" pour chaque option
- [ ] Fenêtres popup s'ouvrent (ou bloquées, mais URL correcte en console)
- [ ] Modal se ferme après sélection plateforme

**Prochain test** :
- **Test Device Android** (10 min) : Build APK → Installer → Tester partage réel (WhatsApp, Facebook, Twitter) → Vérifier analytics `shareCount` incrémenté

---

## 📊 Performance

**Build Stats** (vite build) :
- **Durée** : 42.82s
- **Taille total** : 3735.34 KB précachés (20 fichiers)
- **Chunks** :
  - `index-MMOYAkdq.js` : 921.02 KB (gzip: 254.07 KB)
  - `vendor-mapbox-0_ib2wsD.js` : 1611.82 KB (gzip: 435.01 KB)
  - `vendor-ionic-Cg32MkLC.js` : 813.57 KB (gzip: 159.98 KB)
- **PWA** : Service Worker généré (sw.js + workbox-eb5dc056.js)

**Avertissement** : Chunk `vendor-mapbox` > 500 KB (normal, Mapbox GL JS volumineux)

---

## 🔗 Fichiers Modifiés

| **Fichier**                     | **Lignes** | **Changements**                                                 |
|---------------------------------|------------|-----------------------------------------------------------------|
| `ShareSheet.tsx`                | 143        | Nouveau composant modal avec 4 plateformes                      |
| `ShareSheet.css`                | 107        | Styles avec couleurs plateformes, animation slideUp             |
| `AttractionDetail.tsx`          | +40        | État `showShareSheet`, `handleShare()`, `handleSharePlatform()` |
| `socialShareService.ts`         | 305        | Service déjà existant (Phase 3), utilisé par handleSharePlatform |

**Total Sprint 4** : 2660+ lignes (Phases 1-6)

---

## 📝 Notes de Développeur

**Corrections effectuées pendant intégration** :
1. **Typo** : `shareToWhatsapp` → `shareToWhatsApp` (majuscule A)
2. **Arguments** : WhatsApp prend 2 args (text, url), pas 3
3. **Type** : `attraction.photos` → `attraction.images` (propriété correcte)
4. **Type** : `shareAttraction(attraction)` → objet `ShareAttractionOptions` avec mapping

**Améliorations futures** :
- [ ] Ajouter IonToast pour notifications succès/erreur (10 min)
- [ ] Implémenter deep links `audioguide-ci://attraction/{id}` (15 min)
- [ ] Analytics : Tracker shareCount via `userStatsService.trackAction('share')` (5 min)
- [ ] A/B test : Tester ordre plateformes (WhatsApp premier = +30% clics?)

---

**Date de test** : _________  
**Testé par** : _________  
**Status final** : ⬜ Tous tests passés ⬜ Échecs (préciser)  
**Commentaires** : _______________________________________________
