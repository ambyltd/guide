# 📱 Installation App Android - Guide Rapide

## ✅ Prérequis Validés

- ✅ Build production : 39.29s, 0 errors
- ✅ Capacitor sync : 0.896s, 5 plugins
- ✅ Backend configuré : http://192.168.1.9:5000/api/health
- ✅ Tests web validés

---

## 🚀 Installation en 5 Étapes (10 min)

### Étape 1 : Ouvrir Android Studio (1 min)

**Option A : Script automatique**
```powershell
# Double-cliquer sur le fichier
.\open-android-studio.bat
```

**Option B : Manuellement**
1. Menu Démarrer → "Android Studio"
2. OU chercher l'icône Android Studio sur le bureau

---

### Étape 2 : Ouvrir le Projet (1 min)

1. **File** → **Open**

2. **Naviguer vers** :
   ```
   C:\Users\jpama\Desktop\i\audioguide\ionic-app-v2\android
   ```

3. **Cliquer OK**

4. **Attendre Gradle Sync** (~30 secondes)
   
   **✅ Attendu** :
   - Barre de progression en bas : "Gradle sync in progress..."
   - Puis : "Gradle sync finished in X.Xs"

---

### Étape 3 : Clean & Rebuild (2 min)

1. **Build** → **Clean Project**
   
   Attendre ~5 secondes
   
   **✅ Attendu** : "Build finished in X.Xs"

2. **Build** → **Rebuild Project**
   
   Attendre ~1-2 minutes
   
   **✅ Attendu** :
   ```
   BUILD SUCCESSFUL in 1m 30s
   ```

**⚠️ Si erreur de build** :
- Vérifier que Gradle sync est terminé
- Tools → SDK Manager → Vérifier Android SDK installé
- File → Invalidate Caches → Restart

---

### Étape 4 : Connecter Device Android (3 min)

#### Sur le Téléphone

1. **Activer Mode Développeur**
   ```
   Paramètres → À propos du téléphone
   → Taper 7 fois sur "Numéro de build"
   ```
   
   **✅ Attendu** : Message "Vous êtes maintenant développeur"

2. **Activer Débogage USB**
   ```
   Paramètres → Système → Options de développeur
   → Activer "Débogage USB"
   ```

3. **Connecter Câble USB au PC**

4. **Autoriser le PC**
   
   Popup sur le téléphone :
   ```
   "Autoriser le débogage USB ?"
   → Cocher "Toujours autoriser depuis cet ordinateur"
   → OK
   ```

#### Sur le PC (Android Studio)

1. **Vérifier Device Détecté**
   
   En haut d'Android Studio, menu déroulant des devices
   
   **✅ Attendu** : Nom du téléphone visible (ex: "Samsung Galaxy S21")

2. **Si device non visible** :
   ```powershell
   # Vérifier drivers ADB
   adb devices
   ```
   
   **✅ Attendu** :
   ```
   List of devices attached
   ABC123456789    device
   ```
   
   **❌ Si "unauthorized"** : Réautoriser sur le téléphone
   
   **❌ Si vide** : Installer drivers USB du fabricant

---

### Étape 5 : Run App (3 min)

1. **Sélectionner Device**
   
   Menu déroulant en haut → Sélectionner votre téléphone

2. **Cliquer Run**
   
   Bouton **▶️ vert** en haut à droite
   
   OU : **Run** → **Run 'app'**

3. **Attendre Installation**
   
   **Console Android Studio** :
   ```
   Launching 'app' on [Device Name]
   Installing APK...
   Installed APK in X.Xs
   Launching activity...
   ```
   
   **✅ Attendu** : App se lance automatiquement sur le téléphone (~30s)

4. **Vérifier Launch**
   
   **Sur le téléphone** :
   - App "Audioguide" se lance
   - Page Home s'affiche
   - Attractions visibles

---

## ✅ Checklist de Validation

### Android Studio
- [ ] Projet ouvert : `android/`
- [ ] Gradle sync terminé (X.Xs)
- [ ] Clean Project : OK
- [ ] Rebuild Project : BUILD SUCCESSFUL

### Device Android
- [ ] Mode développeur activé
- [ ] Débogage USB activé
- [ ] Device connecté USB
- [ ] Autorisation débogage accordée
- [ ] Device visible dans Android Studio

### Installation
- [ ] Device sélectionné dans menu déroulant
- [ ] Run 'app' cliqué (▶️)
- [ ] APK installé (console : "Installed APK")
- [ ] App lancée automatiquement
- [ ] Page Home visible sur téléphone

---

## 🧪 Tests Immédiats (5 min)

### Test 1 : Navigation
- [ ] Onglet Home (🏠) fonctionne
- [ ] Onglet Map (🗺️) fonctionne
- [ ] Onglet Favorites (❤️) fonctionne
- [ ] Onglet Profile (👤) fonctionne

### Test 2 : Connexion Backend
- [ ] Page Home → Attractions chargées (depuis backend)
- [ ] Cliquer une attraction → AttractionDetail charge
- [ ] Section "Guides Audio" visible

### Test 3 : Permissions
Popup de permissions :
- [ ] Localisation : Autoriser
- [ ] Notifications : Autoriser
- [ ] Stockage : Autoriser (si demandé)

---

## 🐛 Troubleshooting

### Problème 1 : Device Non Détecté

**Symptôme** : Menu déroulant vide ou "No devices"

**Solutions** :

1. **Vérifier cable USB**
   - Essayer un autre câble
   - Essayer un autre port USB

2. **Vérifier drivers ADB**
   ```powershell
   adb devices
   ```
   Si vide, installer drivers USB du fabricant :
   - Samsung : Samsung USB Driver
   - Google Pixel : Google USB Driver
   - Xiaomi : Mi USB Driver

3. **Redémarrer ADB**
   ```powershell
   adb kill-server
   adb start-server
   adb devices
   ```

4. **Vérifier Débogage USB**
   - Paramètres téléphone → Options développeur
   - Désactiver puis réactiver "Débogage USB"

---

### Problème 2 : Build Échoue

**Symptôme** : "BUILD FAILED" dans Android Studio

**Solutions** :

1. **Vérifier Gradle version**
   ```
   File → Project Structure
   → Project → Gradle version: 8.x
   ```

2. **Clean Gradle Cache**
   ```
   Build → Clean Project
   File → Invalidate Caches → Restart
   ```

3. **Vérifier SDK Android**
   ```
   Tools → SDK Manager
   → SDK Platforms : Android 13+ installé
   → SDK Tools : Android SDK Build-Tools installé
   ```

4. **Vérifier capacitor.config.ts**
   ```typescript
   appId: 'com.audioguide.app'
   appName: 'Audioguide'
   ```

---

### Problème 3 : App Crash au Lancement

**Symptôme** : App s'installe mais crash immédiatement

**Solutions** :

1. **Vérifier Logcat (Android Studio)**
   ```
   View → Tool Windows → Logcat
   Filtrer par "Error" ou "Exception"
   ```

2. **Vérifier Permissions**
   ```
   android/app/src/main/AndroidManifest.xml
   ```
   Permissions requises :
   - ACCESS_FINE_LOCATION
   - ACCESS_COARSE_LOCATION
   - POST_NOTIFICATIONS
   - INTERNET

3. **Rebuild & Reinstall**
   ```powershell
   # Désinstaller app du téléphone
   # Puis dans Android Studio :
   Build → Clean Project
   Build → Rebuild Project
   Run → Run 'app'
   ```

---

### Problème 4 : Backend Non Accessible

**Symptôme** : Attractions ne chargent pas, erreur réseau

**Solutions** :

1. **Vérifier même WiFi**
   - PC et téléphone sur le même réseau WiFi

2. **Tester backend depuis téléphone**
   - Ouvrir Chrome sur Android
   - Naviguer : `http://192.168.1.9:5000/api/health`
   - Attendu : `{"status":"ok","message":"API is running"}`

3. **Vérifier apiConfig.ts**
   ```typescript
   const LOCAL_IP = '192.168.1.9'; // Votre IP PC
   ```

4. **Vérifier firewall**
   ```powershell
   Get-NetFirewallRule -DisplayName "Backend API - Port 5000*"
   ```
   Si vide, relancer `.\allow-port-5000.ps1`

---

## 📊 Résumé des Commandes

### PowerShell (PC)

```powershell
# Vérifier devices ADB
adb devices

# Redémarrer ADB
adb kill-server
adb start-server

# Voir logs en temps réel
adb logcat

# Désinstaller app
adb uninstall com.audioguide.app

# Installer APK manuellement
adb install -r android/app/build/outputs/apk/debug/app-debug.apk
```

### Android Studio

```
# Clean
Build → Clean Project

# Rebuild
Build → Rebuild Project

# Run
Run → Run 'app'

# Logs
View → Tool Windows → Logcat

# Devices
View → Tool Windows → Device Manager
```

---

## 🎯 Prochaine Étape

**Après installation réussie** :

### Tests Device Complets (45 min)

**Tests à effectuer** :
1. Phase 1 : Geofencing (Fake GPS)
2. Phase 3 : Cache images (mode avion)
3. Phase 4 : Cache audio (mode avion + lecture)
4. Phase 5 : Background sync (offline → online)

**Guide** : `INTEGRATION_TEST_GUIDE.md` (section "Tests Device Android")

---

## ✅ Validation Finale

### Checklist Installation

- [ ] Android Studio ouvert
- [ ] Projet `android/` ouvert
- [ ] Gradle sync terminé
- [ ] Clean + Rebuild : SUCCESS
- [ ] Device connecté et autorisé
- [ ] App installée sur téléphone
- [ ] App se lance et fonctionne
- [ ] Navigation entre onglets OK
- [ ] Attractions chargées (backend)
- [ ] Permissions accordées

### Si Tous les Checks ✅

🎉 **Installation RÉUSSIE !**

**Next** : Tests device complets (45 min)

**Guide** : `INTEGRATION_TEST_GUIDE.md`

---

**Date** : 11 octobre 2025  
**Version** : 1.0.0  
**Sprint** : 3 - Géolocalisation & Offline  
**Étape** : Installation Device Android
