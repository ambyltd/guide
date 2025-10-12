# 📱 Guide d'Installation Android - Sprint 3

## ✅ Build Complété

- ✅ **Build production** : 36.15s, 372 modules, 3.29 MB
- ✅ **Service Worker** : sw.js généré, 17 entries precache (3.3 MB)
- ✅ **Capacitor Sync** : 0.49s, 5 plugins détectés
- ✅ **Assets copiés** : `android/app/src/main/assets/public/`

---

## 🚀 Méthode 1 : Android Studio (Recommandé)

### Étapes d'Installation

#### 1. Ouvrir Android Studio
- Lancer **Android Studio** depuis le menu Démarrer
- Ou double-cliquer sur l'icône Android Studio

#### 2. Ouvrir le Projet
- **File** → **Open**
- Naviguer vers :
  ```
  C:\Users\jpama\Desktop\i\audioguide\ionic-app-v2\android
  ```
- Cliquer **OK**

#### 3. Attendre Gradle Sync
- Android Studio va automatiquement synchroniser Gradle (~30 secondes)
- Attendre que la barre de progression en bas disparaisse
- Message attendu : "Gradle sync finished in X.Xs"

#### 4. Clean & Rebuild
- **Build** → **Clean Project** (attendre ~5s)
- **Build** → **Rebuild Project** (attendre ~1-2 min)
- Vérifier que le build réussit : "BUILD SUCCESSFUL"

#### 5. Connecter le Téléphone
- Connecter le téléphone Android via **câble USB**
- Sur le téléphone :
  - Aller dans **Paramètres** → **À propos du téléphone**
  - Taper 7 fois sur **"Numéro de build"** (active Developer Options)
  - Retour → **Options de développeur**
  - Activer **"Débogage USB"**
  - Autoriser le PC sur le téléphone (popup)

#### 6. Vérifier Device Détecté
- En haut d'Android Studio, vérifier le menu déroulant des devices
- Le nom du téléphone devrait apparaître (ex: "Samsung Galaxy S21")
- Si non visible :
  - Ouvrir **Terminal** dans Android Studio (en bas)
  - Taper : `adb devices`
  - Vérifier que le device apparaît avec "device" (pas "unauthorized")

#### 7. Run App
- Cliquer sur le **bouton vert ▶️** (Run 'app') en haut à droite
- Ou **Run** → **Run 'app'**
- Sélectionner le device dans la liste
- Attendre l'installation (~30 secondes)
- L'app se lance automatiquement sur le téléphone

---

## 🔧 Méthode 2 : CLI Capacitor (Plus Rapide)

### Si Android Studio est configuré et adb disponible

```powershell
# Vérifier les devices connectés
adb devices

# Lister les devices pour obtenir l'ID
adb devices -l

# Installer l'app directement
cd C:\Users\jpama\Desktop\i\audioguide\ionic-app-v2
npx cap run android
```

**Si plusieurs devices** :
```powershell
npx cap run android --target <DEVICE_ID>
```

---

## 📦 Méthode 3 : APK Debug (Installation Manuelle)

### Générer l'APK

```powershell
cd C:\Users\jpama\Desktop\i\audioguide\ionic-app-v2\android
.\gradlew assembleDebug
```

L'APK sera généré dans :
```
android/app/build/outputs/apk/debug/app-debug.apk
```

### Installer l'APK

**Option A : Via USB**
```powershell
adb install android/app/build/outputs/apk/debug/app-debug.apk
```

**Option B : Transfert Manuel**
1. Copier `app-debug.apk` sur le téléphone (via USB ou cloud)
2. Sur le téléphone, ouvrir l'APK
3. Autoriser "Sources inconnues" si demandé
4. Installer

---

## 🌐 Configuration Backend pour Device

### 1. Vérifier l'IP de ton PC

```powershell
ipconfig
```

Chercher **IPv4 Address** (ex: `192.168.1.133`)

### 2. Autoriser Port 5000 dans Firewall

**Créer `allow-port-5000.ps1`** :
```powershell
# Autoriser port 5000 dans Windows Firewall
New-NetFirewallRule -DisplayName "Backend API Port 5000" `
  -Direction Inbound `
  -LocalPort 5000 `
  -Protocol TCP `
  -Action Allow
```

**Exécuter en tant qu'Administrateur** :
```powershell
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
.\allow-port-5000.ps1
```

### 3. Vérifier Backend Running

```powershell
cd C:\Users\jpama\Desktop\i\audioguide\backend-api
npm run dev
```

Vérifier console :
```
✅ Connecté à MongoDB Atlas
🚀 Serveur démarré sur le port 5000
```

### 4. Test Connectivité depuis Device

**Sur le téléphone, ouvrir Chrome** et aller sur :
```
http://192.168.1.133:5000/api/health
```

**Réponse attendue** :
```json
{
  "status": "ok",
  "message": "API is running"
}
```

**Si erreur "ERR_CONNECTION_REFUSED"** :
- ✅ PC et téléphone sur le **même WiFi**
- ✅ Firewall autorise port 5000 (voir script ci-dessus)
- ✅ Backend running sur le PC
- ✅ IP correcte dans `capacitor.config.ts`

---

## 📱 Tests Post-Installation

### ✅ Test 1 : Lancement de l'App

**Vérifications** :
- ✅ App s'ouvre sans crash
- ✅ Écran Home avec attractions visibles
- ✅ Navigation tabs en bas (Home, Map, Favorites, Profile)
- ✅ Pas d'erreur visible

**Si crash au lancement** :
- Ouvrir **Logcat** dans Android Studio (filtre : "Chromium")
- Chercher erreurs JavaScript
- Vérifier CORS dans backend (déjà configuré)

---

### ✅ Test 2 : Backend Connectivity

**Étapes** :
1. Ouvrir l'app
2. Page **Home** devrait charger les attractions depuis l'API
3. Si erreur "No backend connection", vérifier :
   - Backend running sur PC
   - Firewall autorise port 5000
   - IP correcte dans `capacitor.config.ts`

**Vérifier API dans Logcat** :
- Filtrer : "API"
- Chercher : "GET http://192.168.1.133:5000/api/attractions"
- Status attendu : 200 OK

---

### ✅ Test 3 : Geofencing (Phase 1)

**Prérequis** :
- Installer **Fake GPS Location** depuis Play Store
- Activer **Developer Options** sur le téléphone
- **Paramètres** → **Options de développeur** → **"Sélectionner application de position fictive"** → **Fake GPS Location**

**Étapes** :
1. Ouvrir **Fake GPS Location**
2. Rechercher coordonnées : **6.8107, -5.2894**
3. Ou rechercher : **"Basilique Notre-Dame de la Paix, Yamoussoukro"**
4. Appuyer sur le marker pour définir la position
5. Cliquer **"Start"** (bouton vert ▶️)
6. Position GPS mockée active ✅

**Tester dans l'App** :
1. Ouvrir **Audioguide CI**
2. Aller sur onglet **Map** 🗺️
3. Vérifier badge vert en haut à droite : **🔔 "5 zones surveillées"**
4. Attendre **10-15 secondes**
5. **Notification attendue** :
   ```
   🎯 Vous êtes arrivé à Basilique Notre-Dame de la Paix !
   Découvrez ce site historique avec nos guides audio
   ```

**Positions GPS des 5 Attractions** :
```
1. Basilique Notre-Dame de la Paix : 6.8107, -5.2894
2. Parc National de Taï : 5.8500, -7.3500
3. Grand-Bassam : 5.2000, -3.7400
4. Abidjan Plateau : 5.3200, -4.0200
5. Man Cascades : 7.4000, -7.5500
```

**Tester Sortie de Zone** :
1. Dans Fake GPS, changer position vers : **6.8200, -5.3000** (200m+)
2. Attendre 10-15s
3. **Notification attendue** :
   ```
   👋 Vous quittez Basilique Notre-Dame de la Paix
   À bientôt !
   ```

---

### ✅ Test 4 : Mode Offline (Phase 2)

**⚠️ IMPORTANT** : Le Service Worker ne fonctionne **PAS** dans Capacitor (protocole `capacitor://`). Les tests offline se feront via **cache natif Capacitor** uniquement.

**Étapes** :
1. Ouvrir l'app
2. Charger complètement :
   - **Home** : Attendre chargement attractions
   - **Map** : Attendre chargement tuiles Mapbox
   - **AttractionDetail** : Ouvrir une attraction, attendre images
3. **Activer Mode Avion** ✈️ sur le téléphone
4. Naviguer : **Home** → **Map** → **Favorites** → **Profile**
5. **Vérifier** :
   - ✅ Attractions toujours visibles sur Home
   - ✅ Map affiche dernière position
   - ✅ Navigation fluide sans erreur

**Note** : Les fonctionnalités Service Worker (CacheManagement, OfflineIndicator) sont visibles mais **ne fonctionnent que sur le web** (localhost ou déployé HTTPS).

---

### ✅ Test 5 : Audio Guides

**Étapes** :
1. Aller sur **Home**
2. Cliquer sur une attraction (ex: Basilique)
3. Page **AttractionDetail** s'ouvre
4. Section **"Guides Audio"** affichée
5. Cliquer sur un guide audio (FR ou EN)
6. **Lecteur Audio** apparaît en bas
7. Tester :
   - ✅ Play/Pause
   - ✅ Skip ±10s
   - ✅ Vitesse (0.75x, 1x, 1.25x, 1.5x)
   - ✅ Volume
   - ✅ Marque-pages (bookmark)

---

### ✅ Test 6 : Mapbox & Géolocalisation

**Étapes** :
1. Aller sur onglet **Map** 🗺️
2. Vérifier :
   - ✅ Tuiles Mapbox chargées
   - ✅ Markers (pins) des attractions visibles
   - ✅ Position utilisateur (point bleu) si GPS activé
3. Cliquer sur un **marker** :
   - ✅ Popup avec nom + image + bouton "Voir détails"
4. Cliquer **"Voir détails"** :
   - ✅ Navigation vers AttractionDetail

**Si tuiles ne chargent pas** :
- Vérifier connexion Internet
- Vérifier Mapbox token valide dans `capacitor.config.ts`

---

### ✅ Test 7 : Authentification Firebase

**Étapes** :
1. Ouvrir l'app (première fois)
2. Si non connecté, écran **Login/Register** apparaît
3. **S'inscrire** :
   - Email : test@example.com
   - Mot de passe : test123456
   - Cliquer **"Créer un compte"**
4. **Vérifier** :
   - ✅ Connexion réussie
   - ✅ Redirection vers Home
   - ✅ Profile affiche email

**Se déconnecter** :
1. Aller sur **Profile**
2. Cliquer **"Se déconnecter"**
3. Retour à l'écran Login

---

## 🐛 Troubleshooting

### Problème : Gradle Sync Failed

**Erreur** : "Gradle sync failed: ..."

**Solution** :
```powershell
cd C:\Users\jpama\Desktop\i\audioguide\ionic-app-v2\android
.\gradlew clean
```

Relancer sync dans Android Studio.

---

### Problème : Device Non Détecté

**Erreur** : Téléphone non visible dans Android Studio

**Solutions** :
1. Vérifier câble USB (utiliser câble de données, pas juste charge)
2. Sur le téléphone : Activer "Débogage USB"
3. Autoriser le PC sur le téléphone (popup "Autoriser débogage USB")
4. Dans Android Studio terminal :
   ```bash
   adb kill-server
   adb start-server
   adb devices
   ```

---

### Problème : App Crash au Lancement

**Erreur** : App se ferme immédiatement

**Solutions** :
1. Ouvrir **Logcat** dans Android Studio
2. Filtrer : "Chromium" ou "Console"
3. Chercher erreurs JavaScript
4. Vérifier CORS backend (déjà configuré normalement)

**Si erreur CORS** :
```typescript
// backend-api/src/index.ts (déjà fait)
app.use(cors({
  origin: [
    'capacitor://localhost',
    'ionic://localhost',
    'http://localhost',
    'http://localhost:5173',
    'http://192.168.1.133:5000',
  ],
  credentials: true,
}));
```

---

### Problème : Backend Unreachable

**Erreur** : "Network Error" ou "ERR_CONNECTION_REFUSED"

**Solutions** :
1. **Vérifier PC et téléphone sur même WiFi**
2. **Vérifier IP du PC** :
   ```powershell
   ipconfig
   ```
3. **Autoriser port 5000** (script firewall ci-dessus)
4. **Vérifier backend running** :
   ```powershell
   cd C:\Users\jpama\Desktop\i\audioguide\backend-api
   npm run dev
   ```
5. **Tester depuis téléphone** :
   - Chrome → `http://192.168.1.133:5000/api/health`
   - Attendu : JSON `{"status":"ok"}`

---

### Problème : Service Worker Non Fonctionnel sur Device

**Note** : C'est **NORMAL** ! Le Service Worker ne fonctionne **QUE sur HTTPS ou localhost**.

Sur Capacitor (`capacitor://` protocol), le Service Worker n'est **pas supporté**.

**Solutions pour Offline** :
- ✅ Capacitor utilise son propre cache natif
- ✅ Les assets (HTML, JS, CSS) sont déjà embarqués dans l'APK
- ✅ Les données API sont mises en cache automatiquement par Capacitor

**Pour tester Service Worker** :
- Ouvrir navigateur web sur : `http://localhost:5173`
- Ou déployer sur HTTPS (Netlify, Vercel, etc.)

---

## 📊 Checklist Finale

Avant de valider l'installation, vérifier :

- [ ] ✅ Build production réussi (36.15s, 0 erreurs)
- [ ] ✅ Capacitor sync réussi (0.49s, 5 plugins)
- [ ] ✅ App installée sur device Android
- [ ] ✅ App se lance sans crash
- [ ] ✅ Home charge attractions depuis backend
- [ ] ✅ Map affiche tuiles Mapbox + markers
- [ ] ✅ Géolocalisation fonctionne (point bleu)
- [ ] ✅ Geofencing détecte entrée/sortie zone (200m)
- [ ] ✅ Notifications affichées (proximité)
- [ ] ✅ Audio player fonctionne (play/pause/skip)
- [ ] ✅ Navigation tabs fluide (Home/Map/Favorites/Profile)
- [ ] ✅ Mode offline : navigation sans réseau OK
- [ ] ✅ Authentification Firebase OK
- [ ] ✅ Backend accessible depuis device

---

## 🎯 Prochaines Étapes

**Une fois l'installation validée** :

### Sprint 3 - Phases Restantes

1. **Phase 3 : Cache Intelligent Images**
   - Préchargement images prioritaires
   - Compression automatique
   - Lazy loading avec placeholder
   - Nettoyage auto images >30j

2. **Phase 4 : Cache Audio (IndexedDB)**
   - Téléchargement audios en background
   - Stockage IndexedDB
   - Mode offline complet pour audios
   - UI "Téléchargé" vs "Streaming"

3. **Phase 5 : Background Sync**
   - Synchronisation auto des favoris
   - Upload reviews en différé
   - Statistiques utilisateur offline

### Sprint 4 - Social & Reviews

1. Système de notation (1-5 étoiles)
2. Commentaires avec modération
3. Partage social (WhatsApp, Facebook, Twitter)
4. Statistiques utilisateur avancées

---

## 📞 Support

**En cas de problème** :
- Consulter **Logcat** dans Android Studio
- Vérifier **Console** dans Chrome DevTools (pour web)
- Tester connectivité backend : `http://192.168.1.133:5000/api/health`

**Fichiers de debug** :
- `SERVICE_WORKER_TEST_GUIDE.md` (tests offline)
- `GEOFENCING_TEST_GUIDE.md` (tests géolocalisation)
- `SPRINT3_RAPPORT_FINAL.md` (documentation technique)

---

🚀 **Bon test sur Android !**
