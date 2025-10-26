# 🎵 Guide de Test QR Code Scanner

**Date**: 26 octobre 2025  
**Version**: 1.0  
**Durée estimée**: 55-70 minutes  
**Statut**: ✅ Implémentation complète (Backend + Mobile)

---

## 📋 Table des Matières

1. [Vue d'ensemble](#vue-densemble)
2. [Architecture QR Code](#architecture-qr-code)
3. [Prérequis](#prérequis)
4. [Tests Backend](#tests-backend)
5. [Tests Web (localhost)](#tests-web-localhost)
6. [Tests Device Android](#tests-device-android)
7. [Résolution des Problèmes](#résolution-des-problèmes)
8. [Checklist de Validation](#checklist-de-validation)

---

## Vue d'ensemble

### Fonctionnalité QR Code Scanner

Permet aux utilisateurs de **scanner un QR code à l'entrée d'une attraction** pour déclencher automatiquement la lecture audio dans la langue de leur choix (Français ou Anglais).

### Workflow Utilisateur

```
1. Utilisateur arrive devant une attraction (panneau avec QR code)
   ↓
2. Ouvre l'app mobile → Appuie sur bouton QR scanner (FAB violet)
   ↓
3. Accorde permissions caméra (si première utilisation)
   ↓
4. Scanne le QR code → Validation format automatique
   ↓
5. Navigation vers AttractionDetail → URL: /attraction/{id}?autoplay=true&language=fr
   ↓
6. Sélection audioguide par langue → Ouverture AudioPlayer automatique
   ↓
7. 🎵 Audio démarre immédiatement → Expérience fluide sans clic manuel
```

---

## Architecture QR Code

### Format Deep Link

```
audioguide://attraction/{attractionId}?lang={fr|en}&autoplay=true
```

**Exemple**:
```
audioguide://attraction/68ebc2e68ac7906eba6138ce?lang=fr&autoplay=true
```

### Parsing QR Code

**Regex de validation**:
```typescript
/^audioguide:\/\/attraction\/([a-f0-9]{24})(\?.*)?$/i
```

**Extraction des paramètres**:
- `attractionId`: 24 caractères hexadécimaux (MongoDB ObjectId)
- `lang`: `fr` ou `en` (défaut: `fr`)
- `autoplay`: `true` ou `false` (défaut: `true`)

### Endpoints Backend

| Méthode | Endpoint | Description |
|---------|----------|-------------|
| POST | `/api/qr/generate/:attractionId` | Générer QR code (PNG/SVG/DataURL) |
| GET | `/api/qr/scan?content={qr}` | Valider QR et retourner données attraction |
| GET | `/api/qr/batch-generate` | Générer tous les QR codes (CMS) |

**Query Parameters** (generate):
- `format`: `dataURL` (default), `buffer`, `svg`
- `size`: `300` (default), min: 100, max: 1000
- `preferredLang`: `fr` (default), `en`

**Exemple cURL**:
```bash
curl -X POST "http://localhost:5000/api/qr/generate/68ebc2e68ac7906eba6138ce?format=dataURL&size=300&preferredLang=fr"
```

**Réponse**:
```json
{
  "success": true,
  "data": {
    "qrCode": "data:image/png;base64,iVBORw0KGgoAAAANS...",
    "attractionId": "68ebc2e68ac7906eba6138ce",
    "qrContent": "audioguide://attraction/68ebc2e68ac7906eba6138ce?lang=fr&autoplay=true",
    "format": "dataURL",
    "size": 300,
    "generatedAt": "2025-10-26T14:30:00.000Z"
  }
}
```

---

## Prérequis

### Backend

```bash
# 1. MongoDB en cours d'exécution (local ou Atlas)
mongod --version  # Vérifier installation

# 2. Backend démarré sur port 5000
cd backend-api
npm run dev

# 3. Vérifier santé API
curl http://localhost:5000/api/health
# Réponse attendue: {"status": "ok", "timestamp": "..."}
```

### Mobile App

```bash
# 1. Dépendances installées
cd ionic-app-v2
npm install

# 2. Build réussi
npm run build
# Vérifier: ✓ built in ~27s, 21 entries precached

# 3. Android Studio installé (pour tests device)
# Télécharger: https://developer.android.com/studio
```

### Données de Test

**Option A - Utiliser les IDs existants**:
```bash
# Lister les attractions de votre DB
mongosh audioguide_db
> db.attractions.find({}, {_id: 1, name: 1}).pretty()
```

**Option B - Seed complet**:
```bash
cd backend-api
npm run seed:complete
# Génère 15 attractions + 30 audioguides (FR+EN)
```

---

## Tests Backend

### Test 1: Génération QR Code (2 min)

**Objectif**: Vérifier que l'endpoint génère un QR code valide

```bash
# Terminal 1: Démarrer backend
cd backend-api
npm run dev

# Terminal 2: Test API
curl -X POST "http://localhost:5000/api/qr/generate/68ebc2e68ac7906eba6138ce?format=dataURL&size=300&preferredLang=fr" | jq
```

**Résultat attendu**:
```json
{
  "success": true,
  "data": {
    "qrCode": "data:image/png;base64,iVBOR...",  // Base64 string
    "attractionId": "68ebc2e68ac7906eba6138ce",
    "qrContent": "audioguide://attraction/68ebc2e68ac7906eba6138ce?lang=fr&autoplay=true",
    "format": "dataURL",
    "size": 300
  }
}
```

✅ **Validation**: `success: true` + `qrCode` commence par `data:image/png;base64`

### Test 2: Scan QR Code (2 min)

**Objectif**: Vérifier la validation du format et retour des données

```bash
# Encoder le QR content
QR_CONTENT="audioguide://attraction/68ebc2e68ac7906eba6138ce?lang=fr&autoplay=true"
ENCODED=$(echo -n "$QR_CONTENT" | jq -sRr @uri)

# Test scan
curl "http://localhost:5000/api/qr/scan?content=$ENCODED" | jq
```

**Résultat attendu**:
```json
{
  "success": true,
  "data": {
    "attraction": {
      "_id": "68ebc2e68ac7906eba6138ce",
      "name": "Basilique Notre-Dame de la Paix",
      "description": "...",
      "location": { "type": "Point", "coordinates": [...] },
      "category": "religious"
    },
    "audioGuides": [
      {
        "_id": "...",
        "title": "Histoire de la Basilique",
        "language": "fr",
        "duration": 300,
        "audioUrl": "https://..."
      }
    ],
    "defaultAudioGuide": { ... },  // Premier audio en français
    "scanMetadata": {
      "scannedAt": "2025-10-26T14:35:00.000Z",
      "requestedLang": "fr",
      "autoplay": true
    }
  }
}
```

✅ **Validation**: 
- `success: true`
- `attraction` contient toutes les données
- `audioGuides` array non vide
- `defaultAudioGuide` correspond à la langue `fr`

### Test 3: QR Code Invalide (1 min)

**Objectif**: Vérifier la gestion d'erreur

```bash
# Test avec format invalide
curl "http://localhost:5000/api/qr/scan?content=invalid-qr-code" | jq
```

**Résultat attendu**:
```json
{
  "success": false,
  "error": "Invalid QR code format",
  "message": "Le QR code scanné n'est pas un code valide pour cette application"
}
```

✅ **Validation**: `success: false` + message d'erreur explicite

---

## Tests Web (localhost)

### Test 4: Page HTML de Test (5 min)

**Objectif**: Générer et afficher QR codes pour test mobile

```bash
# 1. Ouvrir le fichier test-qr.html
cd backend-api/public
# Modifier les IDs d'attractions (lignes 253-265)

# 2. Démarrer backend
cd ../../backend-api
npm run dev

# 3. Ouvrir test-qr.html dans navigateur
# Firefox/Chrome: Drag & drop le fichier dans le navigateur
# OU
# Utiliser extension Live Server dans VSCode
```

**Instructions**:
1. Le fichier HTML va charger automatiquement
2. Appel API pour générer 4 QR codes (2 attractions × 2 langues)
3. Status devrait passer à: `✅ 4 QR codes générés avec succès !`
4. Chaque QR code affiche:
   - Titre attraction
   - Badge langue (🇫🇷 Français / 🇬🇧 English)
   - Image QR scannable (300x300px)
   - Boutons: "💾 Télécharger PNG" + "📋 Copier URL"

**Actions de test**:
```javascript
// Test 4a: Télécharger QR code
// Cliquer sur "💾 Télécharger PNG"
// Vérifier: Fichier .png téléchargé (ex: qr-basilique-notre-dame-fr.png)

// Test 4b: Copier URL
// Cliquer sur "📋 Copier URL"
// Coller dans éditeur de texte
// Vérifier: audioguide://attraction/{id}?lang=fr&autoplay=true

// Test 4c: Imprimer QR codes
// Cliquer sur "🖨️ Imprimer les QR Codes"
// Vérifier: Aperçu impression montre uniquement les QR codes (sans instructions)
```

✅ **Validation**:
- Page charge sans erreur console
- 4 QR codes générés et affichés
- QR codes téléchargeables en PNG
- URLs copiables dans presse-papiers
- Print layout propre (sans boutons/instructions)

**Screenshot Attendu**:

```
┌─────────────────────────────────────────────────────────┐
│ 🎵 Test QR Code Scanner                                 │
│ Côte d'Ivoire Audio Guide - Mode Test                   │
│                                                          │
│ ┌────────────────────────────────────────────────────┐ │
│ │ 📱 Instructions d'utilisation                      │ │
│ │ 1. Ouvrez l'application mobile...                  │ │
│ └────────────────────────────────────────────────────┘ │
│                                                          │
│ ✅ 4 QR codes générés avec succès !                     │
│                                                          │
│ ┌──────────────────┐  ┌──────────────────┐             │
│ │ Basilique...     │  │ Basilique...     │             │
│ │ 🇫🇷 Français      │  │ 🇬🇧 English       │             │
│ │ ┌──────────────┐ │  │ ┌──────────────┐ │             │
│ │ │   QR CODE    │ │  │ │   QR CODE    │ │             │
│ │ │  [Image PNG] │ │  │ │  [Image PNG] │ │             │
│ │ └──────────────┘ │  │ └──────────────┘ │             │
│ │ 💾 Télécharger   │  │ 💾 Télécharger   │             │
│ │ 📋 Copier URL    │  │ 📋 Copier URL    │             │
│ └──────────────────┘  └──────────────────┘             │
└─────────────────────────────────────────────────────────┘
```

---

## Tests Device Android

### Préparation Device (10 min)

```bash
# 1. Build production
cd ionic-app-v2
npm run build

# 2. Sync Android
npx cap sync android

# 3. Ouvrir Android Studio
npx cap open android

# 4. Build & Install APK
# Android Studio:
# - Build > Build Bundle(s) / APK(s) > Build APK(s)
# - Attendre ~2 minutes (build Gradle)
# - Localiser APK: ionic-app-v2/android/app/build/outputs/apk/debug/app-debug.apk
# - Installer sur device: adb install app-debug.apk
# OU
# - Run > Run 'app' (installe et lance automatiquement)
```

**Configuration Backend pour Device**:

```powershell
# Trouver IP locale (Windows PowerShell)
ipconfig | Select-String "IPv4"
# Exemple résultat: 192.168.1.9

# Mettre à jour apiConfig.ts
# Fichier: ionic-app-v2/src/config/apiConfig.ts
# Ligne 15: const DEV_IP = '192.168.1.9';  // Votre IP locale
```

**Configurer Firewall** (autoriser port 5000):
```powershell
# Lancer le script (en Administrateur)
.\scripts\allow-port-5000.ps1

# Vérifier règle créée
netsh advfirewall firewall show rule name="Node Backend API Port 5000"
```

**Vérifier connectivité**:
```bash
# Depuis device Android (navigateur)
# Ouvrir: http://192.168.1.9:5000/api/health

# Réponse attendue:
{"status": "ok", "timestamp": "2025-10-26T14:45:00.000Z"}
```

### Test 5: Camera Permission (5 min)

**Objectif**: Vérifier permission caméra et UI scanner

**Steps**:
1. Ouvrir app sur device
2. Naviguer vers page Home (onglet Home)
3. Repérer **2 FAB buttons** en bas à droite:
   - Bouton violet (QR scanner) - En bas
   - Bouton bleu (Map) - Au-dessus
4. Appuyer sur bouton QR scanner (violet)
5. **Premier lancement**: Popup permission caméra apparaît
   - Message: "Audio Guide souhaite utiliser l'appareil photo"
   - Appuyer sur "Autoriser"
6. Scanner UI apparaît:
   - Caméra arrière active (vue transparente)
   - Overlay semi-transparent
   - Frame carré blanc animé (280x280px)
   - Bouton torche (icône flashlight) en haut à gauche
   - Bouton fermer (X) en haut à droite

**Vérifications**:
- ✅ Permission accordée (pas de message d'erreur)
- ✅ Caméra active (preview temps réel)
- ✅ Frame carré visible avec animation pulse
- ✅ Boutons torche et fermer cliquables
- ✅ Pas de crash ou freeze

**Troubleshooting**:
- **Permission refusée**: Paramètres > Apps > Audio Guide > Permissions > Activer Caméra
- **Caméra noire**: Redémarrer app ou vérifier autre app utilise caméra
- **Pas de frame visible**: Vérifier luminosité écran ou fond transparent

### Test 6: QR Scan Français (5 min)

**Objectif**: Scanner QR code et vérifier auto-play audio FR

**Steps**:
1. **Préparer QR code**:
   - Ouvrir `backend-api/public/test-qr.html` sur écran PC
   - OU imprimer QR code Basilique (Français)
   - Taille minimum: 5×5 cm pour scan optimal
2. Device: Ouvrir QR scanner (FAB violet)
3. Pointer caméra vers QR code Basilique (🇫🇷 Français)
4. Scanner automatique (pas de bouton)
5. Attendre 1-2 secondes (validation + navigation)

**Résultat attendu**:
```
1. Toast notification: "🎵 Ouverture de l'attraction..."
2. Navigation vers AttractionDetail (transition slide)
3. Page charge: Titre "Basilique Notre-Dame de la Paix"
4. Console log: "🎵 QR Code Auto-play détecté: { preferredLang: 'fr', audioGuides: 2 }"
5. Console log: "▶️ Ouverture AudioPlayer automatique: Histoire de la Basilique"
6. AudioPlayer modal s'ouvre (slide up animation)
7. Onglet "Guides Audio" sélectionné automatiquement
8. Audio français démarre automatiquement (▶️ Play)
9. Progress bar commence à avancer
10. Titre audio: "Histoire de la Basilique" (ou équivalent FR)
```

**Vérifications**:
- ✅ QR scanné en < 3 secondes
- ✅ Navigation vers AttractionDetail réussie
- ✅ AudioPlayer s'ouvre automatiquement (pas de clic manuel)
- ✅ Audio français sélectionné (pas EN)
- ✅ Lecture démarre automatiquement (bouton pause visible)
- ✅ URL nettoyée (pas de `?autoplay=true` visible dans historique)

**Chrome DevTools Mobile** (debugging):
```bash
# 1. Connecter device en USB (mode développeur activé)
# 2. Ouvrir Chrome desktop: chrome://inspect
# 3. Cliquer sur "Inspect" sous "Audio Guide"
# 4. Onglet Console: Vérifier logs
#    🎵 QR Code Auto-play détecté
#    ▶️ Ouverture AudioPlayer automatique
# 5. Onglet Network: Vérifier requêtes API
#    GET /api/attractions/{id} → 200 OK
#    GET /api/audio-guides?attractionId={id} → 200 OK
```

### Test 7: QR Scan Anglais (5 min)

**Objectif**: Vérifier sélection audioguide EN au lieu de FR

**Steps**:
1. Retour à page Home (bouton back ou onglet Home)
2. Ouvrir QR scanner
3. Scanner QR code Basilique (🇬🇧 English)
4. Attendre navigation et auto-play

**Résultat attendu**:
```
1. Toast: "🎵 Ouverture de l'attraction..."
2. Navigation vers AttractionDetail (même attraction)
3. AudioPlayer s'ouvre automatiquement
4. Audio ANGLAIS sélectionné: "Basilica History" (titre EN)
5. Lecture démarre en anglais
```

**Vérifications**:
- ✅ Audio EN joué (pas FR cette fois)
- ✅ Titre audioguide en anglais
- ✅ Description en anglais
- ✅ Pas de switch manuel de langue nécessaire

### Test 8: Torch Control (2 min)

**Objectif**: Tester activation/désactivation torche

**Steps**:
1. Ouvrir QR scanner
2. Réduire luminosité de l'écran test (ou aller dans pièce sombre)
3. Appuyer sur bouton torche (flashlight icon, haut gauche)
4. Vérifier LED flash allumée
5. Appuyer à nouveau
6. Vérifier LED flash éteinte

**Vérifications**:
- ✅ Torche s'allume au premier clic
- ✅ Torche s'éteint au deuxième clic
- ✅ Bouton change de couleur (light → warning/jaune)
- ✅ Pas d'impact sur scan QR

### Test 9: QR Invalide (3 min)

**Objectif**: Vérifier gestion erreur QR code invalide

**Steps**:
1. Ouvrir QR scanner
2. Scanner un QR code aléatoire (URL website, contact vCard, etc.)
3. Attendre validation

**Résultat attendu**:
```
1. Toast notification: "⚠️ QR Code invalide - Ce code n'est pas un code valide pour cette application"
2. Scanner reste ouvert (pas de fermeture)
3. Caméra active (possibilité de rescanner)
```

**Vérifications**:
- ✅ Message erreur affiché
- ✅ Scanner ne crash pas
- ✅ Caméra reste active
- ✅ Pas de navigation (reste sur scanner)

### Test 10: Map Page Scanner (5 min)

**Objectif**: Vérifier QR scanner accessible depuis page Map

**Steps**:
1. Naviguer vers page Map (onglet Map)
2. Repérer **2 FAB buttons** en bas à droite:
   - Bouton violet (QR scanner) - En bas
   - Bouton bleu (Ma position) - Au-dessus (70px)
3. Appuyer sur bouton QR scanner (violet)
4. Scanner QR code attraction
5. Vérifier navigation vers AttractionDetail

**Vérifications**:
- ✅ FAB buttons visibles sur Map page
- ✅ QR scanner s'ouvre depuis Map
- ✅ Scan et navigation fonctionnent identiquement à Home
- ✅ Retour à Map après fermeture attraction

### Test 11: Auto-play Edge Cases (10 min)

**Objectif**: Tester comportements limites

**Test 11a - Pas d'audioguides disponibles**:
```
Scénario: Attraction sans audioguides (DB)
Résultat attendu:
- Navigation vers AttractionDetail OK
- Onglet "Guides Audio" vide
- Message: "Aucun guide audio disponible"
- Pas de crash ou erreur
```

**Test 11b - Audioguide langue demandée inexistant**:
```
Scénario: Scanner QR FR mais attraction n'a que EN
Résultat attendu:
- Auto-play démarre avec premier audioguide disponible (EN)
- Pas d'erreur
- Console log: "🎵 QR Code Auto-play détecté: audioguides: 1"
- Lecture EN démarre (fallback)
```

**Test 11c - Navigation back**:
```
Scénario: Scanner QR → Auto-play → Bouton back
Résultat attendu:
- Retour à page précédente (Home ou Map)
- URL propre (pas de ?autoplay=true dans historique)
- Re-navigation vers même attraction NE déclenche PAS auto-play
```

**Test 11d - Scan multiple rapide**:
```
Scénario: Scanner QR1 → Immédiatement scanner QR2
Résultat attendu:
- Navigation vers attraction 1 s'annule
- Navigation vers attraction 2 réussit
- Auto-play démarre sur attraction 2
- Pas de double lecture audio
```

**Vérifications**:
- ✅ Pas de crash dans tous les scénarios
- ✅ Fallback audio fonctionne (langue alternative)
- ✅ URL cleanup empêche re-trigger auto-play
- ✅ Scan multiple ne cause pas conflit

---

## Résolution des Problèmes

### Problème 1: QR Code ne scanne pas

**Symptômes**:
- Caméra active mais QR code non détecté après 10+ secondes
- Pas de toast ou navigation

**Causes possibles**:
1. **QR code trop petit**: Minimum 5×5 cm
2. **Distance incorrecte**: Tenir à 15-30 cm de la caméra
3. **Luminosité faible**: Utiliser torche ou augmenter éclairage
4. **QR code endommagé**: Coins flous ou pixels manquants
5. **Format invalide**: QR code ne commence pas par `audioguide://`

**Solutions**:
```bash
# Vérifier format QR code
# Utiliser outil décodeur: https://zxing.org/w/decode.jspx
# Uploader image PNG QR code
# Vérifier résultat décodé: audioguide://attraction/{id}?lang=fr&autoplay=true

# Régénérer QR code plus grand
curl -X POST "http://localhost:5000/api/qr/generate/{id}?size=500&format=buffer" -o qr-large.png

# Tester QR code sur autre device (vérifier si problème hardware caméra)
```

### Problème 2: Permission caméra refusée

**Symptômes**:
- Toast: "Permission caméra refusée. Veuillez activer..."
- Scanner ne s'ouvre pas

**Solution**:
```
1. Paramètres Android > Apps > Audio Guide
2. Permissions > Caméra
3. Activer "Autoriser uniquement pendant l'utilisation"
4. Relancer app
5. Ouvrir scanner → Devrait fonctionner
```

**Alternative** (reset permissions):
```bash
# ADB reset permissions
adb shell pm reset-permissions com.audioguide.app
# Relancer app → Redemande permissions
```

### Problème 3: Auto-play ne démarre pas

**Symptômes**:
- Navigation vers AttractionDetail OK
- AudioPlayer ne s'ouvre pas automatiquement
- Pas de lecture audio

**Diagnostic**:
```javascript
// Chrome DevTools (chrome://inspect)
// Console logs attendus:
🎵 QR Code Auto-play détecté: {preferredLang: 'fr', audioGuides: 2}
▶️ Ouverture AudioPlayer automatique: Histoire de la Basilique

// Si logs manquants:
// Vérifier Network tab:
GET /api/audio-guides?attractionId={id}&active=true
// Status: 200 OK
// Response: [{...}, {...}]  (array non vide)
```

**Causes possibles**:
1. **Audioguides vides**: DB n'a pas d'audioguides pour cette attraction
2. **Backend déconnecté**: Device ne peut pas joindre API
3. **Query params manquants**: URL ne contient pas `?autoplay=true`
4. **useEffect hook non déclenché**: Bug React (rare)

**Solutions**:
```bash
# 1. Vérifier audioguides en DB
mongosh audioguide_db
> db.audioguides.find({ attractionId: ObjectId("68ebc2e68ac7906eba6138ce") }).count()
# Si 0 → Créer audioguides ou seed DB

# 2. Vérifier backend connectivity
# Device browser: http://192.168.1.9:5000/api/health
# Si timeout → Vérifier firewall/IP

# 3. Vérifier URL après scan
# Console: window.location.search
# Attendu: "?autoplay=true&language=fr"
# Si vide → Bug navigation, vérifier QRCodeScanner.tsx ligne 160-170

# 4. Force reload app
# Android: Settings > Apps > Audio Guide > Force Stop
# Relancer app
```

### Problème 4: Mauvaise langue audio

**Symptômes**:
- Scanner QR FR → Audio EN démarre
- Ou vice versa

**Diagnostic**:
```javascript
// Console logs:
🎵 QR Code Auto-play détecté: {preferredLang: 'fr', audioGuides: 2}
▶️ Ouverture AudioPlayer automatique: Basilica History  // ❌ Titre EN au lieu de FR

// Vérifier audioguides DB:
GET /api/audio-guides?attractionId={id}
[
  { "_id": "...", "language": "fr", "title": "Histoire..." },  // ✅ Existe
  { "_id": "...", "language": "en", "title": "Basilica..." }   // ✅ Existe
]
```

**Cause**: Bug dans sélection audioguide (AttractionDetail.tsx ligne 190)

**Solution**:
```typescript
// Vérifier ligne 190 dans AttractionDetail.tsx:
const audioGuide = audioGuides.find(ag => ag.language === preferredLang) || audioGuides[0];

// Si bug persiste:
// 1. Console log audioGuides array:
console.log('All audioGuides:', audioGuides.map(ag => ({ lang: ag.language, title: ag.title })));

// 2. Console log sélection:
console.log('Selected audioGuide:', audioGuide.language, audioGuide.title);

// 3. Vérifier query param:
console.log('Preferred lang from URL:', preferredLang);
```

### Problème 5: Crash app après scan

**Symptômes**:
- Scanner QR code → App crash (écran noir ou retour accueil Android)
- Logcat error

**Diagnostic**:
```bash
# Connecter device en USB
# Lancer logcat filter:
adb logcat | grep -i "audioguide\|capacitor\|crash"

# Chercher:
# - NullPointerException
# - FATAL EXCEPTION
# - Capacitor: Error
```

**Causes possibles**:
1. **Memory overflow**: Images lourdes non libérées
2. **Navigation loop**: useEffect infinite loop
3. **Plugin crash**: Barcode scanner bug
4. **Backend error 500**: API endpoint crash

**Solutions**:
```bash
# 1. Clear app cache
adb shell pm clear com.audioguide.app

# 2. Rebuild app
cd ionic-app-v2
npm run build
npx cap sync android
npx cap open android
# Rebuild APK

# 3. Vérifier backend logs
cd backend-api
npm run dev
# Chercher errors dans console lors du scan

# 4. Update plugin
cd ionic-app-v2
npm update @capacitor-community/barcode-scanner
npx cap sync android
```

---

## Checklist de Validation

### Backend (3/3)

- [x] **Endpoint `/api/qr/generate/:attractionId`**
  - [x] Format `dataURL` retourne base64 PNG
  - [x] Format `buffer` télécharge fichier PNG
  - [x] Format `svg` retourne SVG string
  - [x] Query params `size` et `preferredLang` fonctionnent
  - [x] QR content format: `audioguide://attraction/{id}?lang={fr|en}&autoplay=true`

- [x] **Endpoint `/api/qr/scan?content={qr}`**
  - [x] Validation format QR code (regex)
  - [x] Retourne attraction complète
  - [x] Retourne audioguides actifs
  - [x] Retourne defaultAudioGuide (langue préférée)
  - [x] Gestion erreur QR invalide (status 400)

- [x] **Endpoint `/api/qr/batch-generate`**
  - [x] Génère QR codes pour toutes attractions
  - [x] Formats multiples supportés
  - [x] Pagination (optionnel)

### Mobile Components (4/4)

- [x] **QRCodeScanner Component**
  - [x] Modal fullscreen avec caméra
  - [x] Permission caméra gérée
  - [x] Animation frame scanner (pulse)
  - [x] Bouton torch (flashlight) fonctionnel
  - [x] Bouton fermer (X)
  - [x] Validation format QR code
  - [x] Navigation avec query params
  - [x] Toast notifications (succès/erreur)

- [x] **qrCodeService API Client**
  - [x] Méthode `generateQRCode()`
  - [x] Méthode `scanQRCode()`
  - [x] Méthode `parseQRContent()` (offline)
  - [x] Méthode `batchGenerateQRCodes()`
  - [x] Error handling

- [x] **Home Page Integration**
  - [x] FAB button QR scanner (violet, bottom)
  - [x] FAB button Map (bleu, 70px above)
  - [x] QRCodeScanner modal
  - [x] State management (`isQRScannerOpen`)

- [x] **Map Page Integration**
  - [x] FAB button QR scanner (violet, bottom)
  - [x] FAB button Ma position (bleu, 70px above)
  - [x] QRCodeScanner modal
  - [x] State management (`isQRScannerOpen`)

### Auto-play Logic (1/1)

- [x] **AttractionDetail Auto-play**
  - [x] useLocation hook pour query params
  - [x] useEffect détection `?autoplay=true&language={fr|en}`
  - [x] Sélection audioguide par langue
  - [x] Fallback premier audioguide si langue inexistante
  - [x] Ouverture AudioPlayer automatique
  - [x] Switch onglet "Guides Audio"
  - [x] Nettoyage URL (history.replace)
  - [x] Console logs pour debugging
  - [x] Gestion cas pas d'audioguides

### Tests Device (11/11)

- [ ] **Test 5**: Camera permission accordée et scanner UI visible
- [ ] **Test 6**: QR scan FR → Navigation + Auto-play audio FR
- [ ] **Test 7**: QR scan EN → Auto-play audio EN
- [ ] **Test 8**: Torch control ON/OFF
- [ ] **Test 9**: QR invalide → Message erreur
- [ ] **Test 10**: QR scanner depuis Map page
- [ ] **Test 11a**: Pas d'audioguides → Pas de crash
- [ ] **Test 11b**: Fallback langue alternative
- [ ] **Test 11c**: Navigation back → Pas de re-trigger auto-play
- [ ] **Test 11d**: Scan multiple → Dernière attraction prioritaire

### Tests Web (2/2)

- [ ] **Test 4**: Page test-qr.html génère 4 QR codes
- [ ] **Test 4a**: Téléchargement PNG fonctionnel
- [ ] **Test 4b**: Copie URL fonctionnelle
- [ ] **Test 4c**: Print layout propre

### Production Readiness (0/4)

- [ ] **Backend déployé** (Render.com)
  - [ ] URL production: `https://audioguide-backend.onrender.com`
  - [ ] Endpoint `/api/qr` accessible publiquement
  - [ ] CORS configuré pour mobile app
  - [ ] SSL/HTTPS activé

- [ ] **Mobile app config production**
  - [ ] `apiConfig.ts` pointe vers backend production
  - [ ] Build release APK (signé)
  - [ ] Test QR scan avec backend production
  - [ ] Upload Google Play Store (optionnel)

- [ ] **QR Codes physiques**
  - [ ] Générer QR codes haute résolution (600×600px)
  - [ ] Imprimer sur panneaux attraction (A4, plastifié)
  - [ ] Installer à entrée de chaque attraction
  - [ ] Vérifier scannabilité en conditions réelles (soleil, pluie)

- [ ] **Documentation utilisateur**
  - [ ] Guide d'utilisation QR scanner (français/anglais)
  - [ ] Instructions panneau attraction
  - [ ] Troubleshooting permissions caméra
  - [ ] Vidéo démo (30 secondes)

---

## Métriques de Succès

### Performance

| Métrique | Cible | Mesuré |
|----------|-------|--------|
| Temps scan QR | < 3s | __ s |
| Temps navigation | < 1s | __ s |
| Temps auto-play | < 2s | __ s |
| **Total (scan → audio)** | **< 6s** | **__ s** |

### Fiabilité

| Métrique | Cible | Mesuré |
|----------|-------|--------|
| Taux succès scan QR | > 95% | __ % |
| Taux auto-play réussi | > 99% | __ % |
| Taux crash | < 0.1% | __ % |
| Gestion erreur QR invalide | 100% | __ % |

### Expérience Utilisateur

| Critère | Objectif | Statut |
|---------|----------|--------|
| Facilité découverte bouton QR | Visible immédiatement (2 FAB buttons) | ✅ / ❌ |
| Clarté permissions caméra | Message explicite | ✅ / ❌ |
| Feedback scan (toast) | Message succès visible | ✅ / ❌ |
| Fluidité navigation | Transition smooth sans lag | ✅ / ❌ |
| Auto-play audio | Démarrage sans clic manuel | ✅ / ❌ |

---

## Prochaines Étapes

### Phase 1: Tests Complets (Actuel)
- ✅ Backend endpoints opérationnels
- ✅ Mobile components intégrés
- ⏳ Tests device Android (en cours)
- ⏳ Validation checklist

### Phase 2: Production (À venir)
- [ ] Déploiement backend Render.com
- [ ] Configuration mobile app production
- [ ] Génération QR codes haute résolution
- [ ] Impression panneaux attractions

### Phase 3: CMS Integration (Optionnel)
- [ ] Page CMS "Gestion QR Codes"
- [ ] Génération QR codes par attraction
- [ ] Batch download ZIP (tous QR codes)
- [ ] Historique scans (analytics)

### Phase 4: Analytics (Futur)
- [ ] Tracking scans QR (Firebase Analytics)
- [ ] Heatmap attractions populaires
- [ ] Taux conversion scan → écoute complète
- [ ] A/B testing tailles QR code

---

## Ressources

### Documentation

- **QR Code Library**: https://www.npmjs.com/package/qrcode
- **Capacitor Barcode Scanner**: https://github.com/capacitor-community/barcode-scanner
- **Ionic React Docs**: https://ionicframework.com/docs/react

### Outils

- **QR Code Decoder**: https://zxing.org/w/decode.jspx
- **QR Code Generator**: https://www.qr-code-generator.com/
- **Chrome DevTools Mobile**: chrome://inspect

### Contacts Support

- **Backend Issues**: Vérifier logs `backend-api/logs/`
- **Mobile Issues**: Chrome DevTools (chrome://inspect)
- **Barcode Scanner Plugin**: https://github.com/capacitor-community/barcode-scanner/issues

---

**Dernière mise à jour**: 26 octobre 2025  
**Auteur**: GitHub Copilot  
**Version**: 1.0
