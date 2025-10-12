# ✅ Checklist d'Installation Android - Sprint 3

## 📦 Prérequis Complétés

- [x] ✅ Build production : 36.15s, 372 modules, 3.29 MB
- [x] ✅ Service Worker : sw.js généré, 17 entries (3.3 MB precache)
- [x] ✅ Capacitor sync : 0.49s, 5 plugins détectés
- [x] ✅ Assets copiés : android/app/src/main/assets/public/

---

## 🚀 Installation Rapide (Méthode Recommandée)

### Étape 1 : Ouvrir Android Studio

**Option A : Double-cliquer sur le fichier** :
```
open-android-studio.bat
```

**Option B : Manuellement** :
1. Lancer Android Studio
2. File → Open
3. Sélectionner : `C:\Users\jpama\Desktop\i\audioguide\ionic-app-v2\android`

---

### Étape 2 : Gradle Sync
- ⏳ Attendre automatiquement (~30 secondes)
- ✅ Message attendu : "Gradle sync finished in X.Xs"

---

### Étape 3 : Clean & Rebuild
1. Build → Clean Project (~5s)
2. Build → Rebuild Project (~1-2 min)
3. ✅ Vérifier : "BUILD SUCCESSFUL"

---

### Étape 4 : Connecter Device Android
1. Connecter téléphone via USB
2. Sur le téléphone :
   - Paramètres → À propos → Taper 7x sur "Numéro de build"
   - Options de développeur → Activer "Débogage USB"
   - Autoriser PC (popup)
3. ✅ Device visible en haut d'Android Studio

---

### Étape 5 : Run App
1. Cliquer bouton vert ▶️ (Run 'app')
2. Sélectionner device
3. ⏳ Attendre installation (~30s)
4. ✅ App se lance automatiquement

---

## 🔧 Configuration Backend (IMPORTANT)

### 1. Autoriser Port 5000 dans Firewall

**Exécuter en tant qu'Administrateur** :
```powershell
# Clic droit PowerShell → Exécuter en tant qu'Administrateur
cd C:\Users\jpama\Desktop\i\audioguide\ionic-app-v2
.\allow-port-5000.ps1
```

✅ Port 5000 autorisé pour connexions Android

---

### 2. Vérifier IP du PC

```powershell
ipconfig
```

Chercher **IPv4 Address** (ex: `192.168.1.133`)

---

### 3. Lancer Backend

```powershell
cd C:\Users\jpama\Desktop\i\audioguide\backend-api
npm run dev
```

✅ Backend running sur port 5000

---

### 4. Tester depuis Device

**Sur le téléphone, ouvrir Chrome** :
```
http://192.168.1.133:5000/api/health
```

**Réponse attendue** :
```json
{"status":"ok","message":"API is running"}
```

---

## 📱 Tests Post-Installation

### ✅ Test 1 : Lancement App
- [ ] App s'ouvre sans crash
- [ ] Home affiche attractions
- [ ] Navigation tabs visible (Home/Map/Favorites/Profile)

---

### ✅ Test 2 : Backend Connectivity
- [ ] Home charge attractions depuis API
- [ ] Pas d'erreur "No backend connection"

---

### ✅ Test 3 : Geofencing (Phase 1)

**Installer Fake GPS Location** (Play Store)

**Activer Mock Locations** :
- Paramètres → Options de développeur → "Sélectionner app position fictive" → Fake GPS Location

**Test** :
1. Fake GPS → Position : **6.8107, -5.2894**
2. Start (▶️)
3. Ouvrir Audioguide CI → Map
4. ✅ Badge vert : "🔔 5 zones surveillées"
5. ⏳ Attendre 10-15s
6. ✅ Notification : "🎯 Vous êtes arrivé à Basilique Notre-Dame de la Paix !"

**Positions GPS des 5 Attractions** :
```
1. Basilique : 6.8107, -5.2894
2. Parc Taï : 5.8500, -7.3500
3. Grand-Bassam : 5.2000, -3.7400
4. Abidjan : 5.3200, -4.0200
5. Man Cascades : 7.4000, -7.5500
```

---

### ✅ Test 4 : Mode Offline (Phase 2)

1. Charger : Home + Map + AttractionDetail
2. **Activer Mode Avion** ✈️
3. Naviguer : Home → Map → Favorites → Profile
4. ✅ Navigation fluide sans erreur

**Note** : Service Worker ne fonctionne que sur web (localhost/HTTPS), pas sur Capacitor. Le cache natif Capacitor gère l'offline.

---

### ✅ Test 5 : Audio Player
1. Home → Cliquer attraction
2. Section "Guides Audio"
3. Cliquer guide audio
4. ✅ Lecteur apparaît en bas
5. Tester : Play/Pause, Skip ±10s, Vitesse, Volume

---

### ✅ Test 6 : Map & Géolocalisation
1. Map tab
2. ✅ Tuiles Mapbox chargées
3. ✅ Markers attractions visibles
4. ✅ Position utilisateur (point bleu)
5. Cliquer marker → ✅ Popup
6. "Voir détails" → ✅ Navigation AttractionDetail

---

### ✅ Test 7 : Authentification Firebase
1. Première ouverture → Écran Login
2. S'inscrire : test@example.com / test123456
3. ✅ Connexion réussie
4. ✅ Redirection Home
5. Profile → ✅ Email affiché
6. "Se déconnecter" → ✅ Retour Login

---

## 🐛 Troubleshooting Rapide

### Device Non Détecté
```bash
adb kill-server
adb start-server
adb devices
```

---

### Backend Unreachable
1. PC et téléphone sur même WiFi ✓
2. Firewall autorise port 5000 (script ci-dessus) ✓
3. Backend running : `npm run dev` ✓
4. IP correcte : `ipconfig` ✓

---

### App Crash
1. Logcat dans Android Studio
2. Filtrer : "Chromium"
3. Chercher erreurs JavaScript

---

## 📊 Validation Finale

**Avant de passer au Sprint 4, vérifier** :

- [ ] ✅ Build production (0 erreurs)
- [ ] ✅ App installée sur device
- [ ] ✅ App se lance sans crash
- [ ] ✅ Backend accessible depuis device
- [ ] ✅ Home charge attractions
- [ ] ✅ Map affiche tuiles + markers
- [ ] ✅ Géolocalisation fonctionne
- [ ] ✅ Geofencing détecte zones (200m)
- [ ] ✅ Notifications affichées
- [ ] ✅ Audio player fonctionne
- [ ] ✅ Navigation fluide
- [ ] ✅ Mode offline : navigation OK
- [ ] ✅ Authentification Firebase OK

---

## 🎯 Prochaines Étapes

**Une fois validation OK** :

### Sprint 3 - Phases Restantes
- [ ] Phase 3 : Cache intelligent images
- [ ] Phase 4 : Cache audio (IndexedDB)
- [ ] Phase 5 : Background Sync

### Sprint 4 - Social & Reviews
- [ ] Système de notation (1-5 étoiles)
- [ ] Commentaires avec modération
- [ ] Partage social (WhatsApp, Facebook, Twitter)
- [ ] Statistiques utilisateur avancées

---

## 📚 Documentation

- `INSTALLATION_ANDROID_GUIDE.md` : Guide complet
- `SERVICE_WORKER_TEST_GUIDE.md` : Tests offline (web uniquement)
- `GEOFENCING_TEST_GUIDE.md` : Tests géolocalisation
- `SPRINT3_RAPPORT_FINAL.md` : Documentation technique

---

🚀 **Installation prête ! Lance `open-android-studio.bat` pour commencer.**
