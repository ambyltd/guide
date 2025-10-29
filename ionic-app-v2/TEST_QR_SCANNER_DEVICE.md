# 📱 Test QR Scanner sur Device Android

## Objectif
Vérifier que la page d'instructions a été complètement supprimée et que le scanner passe directement du spinner à la caméra.

---

## ⚙️ Prérequis

1. **APK installé sur device Android**
   ```bash
   # Dans Android Studio
   Build → Build Bundle(s) / APK(s) → Build APK(s)
   Run 'app' → Sélectionner device
   ```

2. **Chrome DevTools connecté (optionnel mais recommandé)**
   ```
   1. Ouvrir Chrome sur PC: chrome://inspect/#devices
   2. Connecter téléphone en USB
   3. Activer "USB Debugging" dans téléphone
   4. Cliquer "Inspect" sous l'app AudioGuide
   ```

---

## 🧪 Test 1: Comportement Normal (Permissions Acceptées)

### Étapes
1. **Ouvrir l'app** → Page Home
2. **Cliquer** sur le FAB button "Scanner QR" (icône QR code en bas à droite)
3. **Observer** la séquence d'écrans

### ✅ Résultat Attendu
```
[0s]   Modal s'ouvre
[0.2s] Spinner bleu "Initialisation de la caméra..."
       Texte: "Si c'est la première fois, autorisez l'accès à la caméra"
[1s]   Android demande permission caméra (popup)
       User clique "Autoriser" / "Allow"
[1.5s] ✅ Caméra s'ouvre DIRECTEMENT
       ✅ Frame violet animé visible
       ✅ Texte "Positionnez le QR code dans le cadre" en haut
       ✅ Bouton lampe torche en bas
       ✅ Spinner blanc "Scan en cours..." en bas
```

### ❌ Résultat à NE PAS Observer
```
❌ Page blanche avec card "Permission caméra requise"
❌ Icône rouge grande taille
❌ Bouton "Réessayer"
❌ Texte d'aide "Allez dans Paramètres Android..."
❌ N'IMPORTE QUELLE page entre le spinner et la caméra
```

### 🔍 Vérification Console (Chrome DevTools)
```javascript
// Logs attendus dans Console
[QRCodeScanner] Modal ouvert, démarrage automatique du scan...
[QRCodeScanner] Vérification permissions caméra...
[QRCodeScanner] ✅ Permissions accordées
// ❌ PAS de log "Affichage page instructions"
// ❌ PAS de log "permissionDenied set to true"
```

---

## 🧪 Test 2: Permissions Refusées

### Étapes
1. **Désinstaller l'app** (pour reset permissions)
2. **Réinstaller** via Android Studio
3. **Ouvrir l'app** → Page Home
4. **Cliquer** sur FAB "Scanner QR"
5. **Refuser** la permission caméra quand Android demande

### ✅ Résultat Attendu
```
[0s]   Modal s'ouvre
[0.2s] Spinner bleu "Initialisation de la caméra..."
[1s]   Android demande permission caméra
       User clique "Refuser" / "Deny"
[1.2s] ✅ Toast rouge apparaît en haut:
       "⚠️ Permission caméra refusée. Activez-la dans Paramètres > Apps > AudioGuide > Permissions."
[1.2s] ✅ Modal se FERME automatiquement
[1.3s] ✅ User retourne sur page Home
```

### ❌ Résultat à NE PAS Observer
```
❌ Page d'erreur avec card rouge
❌ Bouton "Réessayer" visible
❌ Modal reste ouvert avec page instructions
❌ Spinner qui tourne indéfiniment
```

### 🔍 Vérification Console
```javascript
[QRCodeScanner] Modal ouvert, démarrage automatique du scan...
[QRCodeScanner] Vérification permissions caméra...
[QRCodeScanner] ❌ Permissions refusées
// Toast affiché
// Modal fermé (onClose() appelé)
// ❌ PAS de log "Rendering instructions page"
```

---

## 🧪 Test 3: Scanner un QR Code Réel

### Prérequis
Utiliser le fichier `test-qr.html` pour générer des QR codes:
```html
<!-- Ouvrir ionic-app-v2/scripts/test-qr.html dans un navigateur -->
<!-- Générer QR pour attraction: 67890f1234567890abcdef05 -->
```

### Étapes
1. **Ouvrir test-qr.html** dans Chrome sur PC
2. **Cliquer** "Générer QR Code" pour une attraction
3. **Afficher** le QR code en plein écran (F11)
4. **Sur device Android:**
   - Ouvrir app
   - Cliquer FAB "Scanner QR"
   - Autoriser caméra
   - **Scanner** le QR code affiché sur l'écran PC

### ✅ Résultat Attendu
```
[0s]   Scanner s'ouvre → Caméra active
[2s]   QR code détecté
[2.1s] Toast vert: "🎵 Ouverture de l'attraction..."
[2.2s] ✅ Navigation vers /attraction/67890f1234567890abcdef05
[2.3s] ✅ Page AttractionDetail s'ouvre
[2.5s] ✅ Audio player démarre automatiquement (autoplay=true)
```

### 🔍 Vérification Console
```javascript
[QRCodeScanner] QR scanné: audioguide://attraction/67890f1234567890abcdef05?lang=fr&autoplay=true
[QRCodeScanner] Navigation: {attractionId: "67890f1234567890abcdef05", lang: "fr", autoplay: true}
// Navigation vers AttractionDetail
```

---

## 🧪 Test 4: QR Code Invalide

### Étapes
1. Scanner un QR code aléatoire (ex: URL website, texte quelconque)
2. Ou utiliser test-qr.html avec "Générer QR Invalide"

### ✅ Résultat Attendu
```
[0s]   Scanner actif
[2s]   QR détecté (ex: https://google.com)
[2.1s] ✅ Toast orange: "QR Code invalide. Scannez un QR code d'attraction."
[2.2s] ✅ Scanner reste OUVERT (caméra active)
[2.3s] User peut réessayer avec un autre QR
```

---

## 🧪 Test 5: Lampe Torche (Torch)

### Étapes
1. Ouvrir scanner (caméra active)
2. Cliquer sur bouton lampe torche (en bas, icône éclair)
3. Observer comportement

### ✅ Résultat Attendu
```
[0s]   Caméra active, bouton lampe blanc
[1s]   User clique bouton lampe
[1.1s] ✅ Bouton devient orange (torchOn = true)
[1.1s] ✅ Flash LED du téléphone s'allume
[2s]   User re-clique bouton
[2.1s] ✅ Bouton redevient blanc (torchOn = false)
[2.1s] ✅ Flash LED s'éteint
```

---

## 🧪 Test 6: Navigation Retour

### Étapes
1. Ouvrir scanner (caméra active)
2. Cliquer flèche retour (← en haut à gauche du header)
3. Observer comportement

### ✅ Résultat Attendu
```
[0s]   Scanner actif (caméra visible)
[1s]   User clique flèche ←
[1.1s] ✅ Caméra se ferme (BarcodeScanner.stopScan())
[1.2s] ✅ Modal se ferme
[1.3s] ✅ Retour sur page Home
```

### 🔍 Vérification Console
```javascript
// Au clic sur flèche retour
handleClose() called
stopScan() → BarcodeScanner.stopScan()
document.body.classList.remove('qr-scanner-active')
onClose() → modal ferme
```

---

## 🧪 Test 7: Bouton Close (X)

### Étapes
1. Ouvrir scanner
2. Cliquer X (en haut à droite)

### ✅ Résultat Attendu
Identique au Test 6 (même fonction `handleClose()`)

---

## 📊 Checklist de Validation Globale

### États Observés (doit être SEULEMENT 2)
- [x] **État 1:** Spinner bleu "Initialisation de la caméra..."
- [x] **État 2:** Caméra active avec frame violet
- [ ] ❌ **État 3 (SUPPRIMÉ):** Page instructions avec card et bouton "Réessayer"

### Transitions Observées
- [x] Modal ouvert → Spinner (0.2s)
- [x] Spinner → Permission popup (1s)
- [x] Permission acceptée → Caméra (0.5s)
- [x] Permission refusée → Toast + fermeture (0.2s)
- [x] QR scanné → Navigation (0.3s)
- [ ] ❌ Spinner → Page instructions (NE DOIT JAMAIS SE PRODUIRE)
- [ ] ❌ Page instructions → Caméra (NE DOIT JAMAIS SE PRODUIRE)

### Éléments UI Jamais Visibles
- [ ] ❌ IonCard avec couleur "danger"
- [ ] ❌ Icône QR code grande taille (120px)
- [ ] ❌ Titre "Permission caméra requise"
- [ ] ❌ Bouton "Réessayer"
- [ ] ❌ Texte "Allez dans Paramètres Android → Apps → AudioGuide..."

### Console Logs Attendus
```javascript
✅ [QRCodeScanner] Modal ouvert, démarrage automatique du scan...
✅ [QRCodeScanner] Vérification permissions caméra...
✅ [QRCodeScanner] ✅ Permissions accordées
✅ [QRCodeScanner] QR scanné: audioguide://attraction/...

❌ PAS: [QRCodeScanner] Affichage page instructions
❌ PAS: [QRCodeScanner] permissionDenied = true
❌ PAS: Rendering qr-scanner-instructions div
```

---

## 🎯 Critères de Succès

### ✅ Test RÉUSSI si:
1. Scanner passe **directement** du spinner à la caméra (aucune page intermédiaire)
2. Permissions refusées → Toast + fermeture (pas de page d'erreur)
3. QR code scanné → Navigation vers attraction (autoplay fonctionne)
4. Lampe torche fonctionne (bouton change de couleur)
5. Boutons retour/close ferment le scanner correctement
6. **AUCUNE** page instructions visible à aucun moment

### ❌ Test ÉCHOUÉ si:
1. Une page blanche/card rouge apparaît entre spinner et caméra
2. Bouton "Réessayer" visible quelque part
3. Modal reste ouvert après refus de permissions
4. Texte "Permission caméra requise" affiché
5. Console logs mentionnent "instructions" ou "permissionDenied"

---

## 🐛 Dépannage

### Problème: Page instructions encore visible
```bash
# Vérifier build
cd ionic-app-v2
npm run build
npx cap sync android

# Rebuild APK dans Android Studio
Build → Clean Project
Build → Rebuild Project
Build → Build APK(s)

# Réinstaller sur device
Run 'app'
```

### Problème: Caméra ne s'ouvre pas
```javascript
// Vérifier permissions dans Android
Settings → Apps → AudioGuide → Permissions → Camera → Allow

// Vérifier logs
chrome://inspect/#devices
Console → chercher "[QRCodeScanner]"
```

### Problème: QR code non détecté
```javascript
// Vérifier format QR code
Format attendu: audioguide://attraction/{24-char-hex-id}?lang=fr&autoplay=true
Exemple: audioguide://attraction/67890f1234567890abcdef05?lang=fr&autoplay=true

// Tester avec test-qr.html
Générer QR → Afficher plein écran → Scanner
```

---

## 📝 Rapport de Test

**Testeur:** __________  
**Date:** __________  
**Device:** __________ (modèle, Android version)

| Test | Résultat | Notes |
|------|----------|-------|
| Test 1: Comportement normal | ✅ ❌ | |
| Test 2: Permissions refusées | ✅ ❌ | |
| Test 3: Scanner QR réel | ✅ ❌ | |
| Test 4: QR invalide | ✅ ❌ | |
| Test 5: Lampe torche | ✅ ❌ | |
| Test 6: Navigation retour | ✅ ❌ | |
| Test 7: Bouton close | ✅ ❌ | |

**Conclusion:**  
✅ Tous les tests passent - Page instructions confirmée supprimée  
❌ Échecs détectés - Voir section Notes

**Signature:** __________
