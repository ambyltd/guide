# 📱 GUIDE COMPLET - BUILD ANDROID APK

**Date**: 19 octobre 2025  
**Projet**: Audioguide Côte d'Ivoire - Ionic App  
**Objectif**: Créer un APK Android pour tester le geofencing sur device

---

## 🎯 PRÉREQUIS

### ✅ Logiciels installés
- [x] **Node.js** (v18+)
- [x] **Android Studio** (Electric Eel ou plus récent)
- [x] **JDK 17** (inclus avec Android Studio)
- [x] **Gradle** (via Android Studio)
- [x] **Capacitor CLI** (`npm install -g @capacitor/cli`)

### ✅ Variables d'environnement
```powershell
# Vérifier ANDROID_HOME
echo $env:ANDROID_HOME
# Devrait afficher: C:\Users\<username>\AppData\Local\Android\Sdk

# Vérifier JAVA_HOME
echo $env:JAVA_HOME
# Devrait afficher: C:\Program Files\Android\Android Studio\jbr

# Si non définis, les ajouter:
[System.Environment]::SetEnvironmentVariable('ANDROID_HOME', 'C:\Users\jpama\AppData\Local\Android\Sdk', 'User')
[System.Environment]::SetEnvironmentVariable('JAVA_HOME', 'C:\Program Files\Android\Android Studio\jbr', 'User')
```

### ✅ Permissions Android
Dans `android/app/src/main/AndroidManifest.xml`, vérifier:
```xml
<uses-permission android:name="android.permission.INTERNET" />
<uses-permission android:name="android.permission.ACCESS_FINE_LOCATION" />
<uses-permission android:name="android.permission.ACCESS_COARSE_LOCATION" />
<uses-permission android:name="android.permission.ACCESS_NETWORK_STATE" />
```

---

## 📋 MÉTHODE 1: BUILD APK DEBUG (RAPIDE)

### Étape 1: Build web production
```bash
cd c:\Users\jpama\Desktop\i\audioguide\ionic-app-v2

# Build Vite (sans TypeScript check)
npm run build:vite

# OU si erreurs TypeScript:
npx vite build
```

**Résultat attendu**:
```
✓ built in 1m 8s
dist/index.html                   0.67 kB │ gzip:  0.40 kB
dist/assets/index-xxx.css       120.45 kB │ gzip: 18.32 kB
dist/assets/index-xxx.js      1,256.78 kB │ gzip: 398.45 kB
```

### Étape 2: Sync Capacitor
```bash
npx cap sync android
```

**Résultat attendu**:
```
✔ Copying web assets from dist to android/app/src/main/assets/public in 650.25ms
✔ Creating capacitor.config.json in android/app/src/main/assets in 2.44ms
✔ copy android in 658.45ms
✔ Updating Android plugins in 8.94ms
[success] sync android in 682.82ms
```

### Étape 3: Ouvrir dans Android Studio
```bash
# Option A: Script batch
.\open-android-studio.bat

# Option B: Commande directe
npx cap open android
```

### Étape 4: Build APK Debug dans Android Studio

#### 4.1 Attendre l'indexation
- Android Studio ouvre automatiquement le projet
- Attendre "Indexing..." dans la status bar (1-2 min)
- Vérifier aucune erreur Gradle dans "Build" tab

#### 4.2 Build APK
**Menu**: `Build > Build Bundle(s) / APK(s) > Build APK(s)`

**OU Terminal Android Studio**:
```bash
cd android
./gradlew assembleDebug
```

#### 4.3 Localiser l'APK
**Chemin**: `android/app/build/outputs/apk/debug/app-debug.apk`

**Taille attendue**: ~15-25 MB

### Étape 5: Installer sur device

#### Option A: Via Android Studio
1. Connecter device USB (activer **USB Debugging** dans Developer Options)
2. Cliquer sur ▶️ Run (Shift+F10)
3. Sélectionner votre device dans la liste
4. Attendre installation automatique

#### Option B: Via ADB
```bash
# Vérifier device connecté
adb devices

# Installer APK
adb install android/app/build/outputs/apk/debug/app-debug.apk

# OU réinstaller (si déjà installé)
adb install -r android/app/build/outputs/apk/debug/app-debug.apk
```

#### Option C: Via cable/Bluetooth
1. Copier `app-debug.apk` sur votre téléphone
2. Ouvrir le fichier APK sur le téléphone
3. Autoriser "Install from Unknown Sources" si demandé
4. Installer

---

## 🏗️ MÉTHODE 2: BUILD APK RELEASE (PRODUCTION)

### Étape 1: Générer Keystore (première fois seulement)

```bash
# Créer dossier keys
mkdir android/keys

# Générer keystore
keytool -genkey -v -keystore android/keys/audioguide-release.keystore -alias audioguide -keyalg RSA -keysize 2048 -validity 10000

# Répondre aux questions:
# Enter keystore password: [choisir un mot de passe fort]
# Re-enter new password: [confirmer]
# What is your first and last name? [Votre nom/société]
# ... autres questions
```

**⚠️ IMPORTANT**: Sauvegarder le fichier `.keystore` et le mot de passe en lieu sûr !

### Étape 2: Configurer Gradle

Créer `android/key.properties`:
```properties
storePassword=VotreMotDePasseKeystore
keyPassword=VotreMotDePasseKey
keyAlias=audioguide
storeFile=../keys/audioguide-release.keystore
```

**⚠️ SÉCURITÉ**: Ajouter `key.properties` au `.gitignore` !

### Étape 3: Modifier `android/app/build.gradle`

Ajouter avant `android {`:
```gradle
def keystorePropertiesFile = rootProject.file("key.properties")
def keystoreProperties = new Properties()
if (keystorePropertiesFile.exists()) {
    keystoreProperties.load(new FileInputStream(keystorePropertiesFile))
}
```

Dans `android { ... }`, ajouter:
```gradle
signingConfigs {
    release {
        keyAlias keystoreProperties['keyAlias']
        keyPassword keystoreProperties['keyPassword']
        storeFile file(keystoreProperties['storeFile'])
        storePassword keystoreProperties['storePassword']
    }
}
buildTypes {
    release {
        signingConfig signingConfigs.release
        minifyEnabled false
        proguardFiles getDefaultProguardFile('proguard-android.txt'), 'proguard-rules.pro'
    }
}
```

### Étape 4: Build APK Release

```bash
cd android
./gradlew assembleRelease
```

**Durée**: 2-5 minutes (première fois)

**APK généré**: `android/app/build/outputs/apk/release/app-release.apk`

**Taille attendue**: ~10-20 MB (optimisé)

---

## 🚀 MÉTHODE 3: BUILD AAB (GOOGLE PLAY STORE)

### AAB vs APK
- **APK**: Installation directe sur devices
- **AAB** (Android App Bundle): Format Google Play Store (optimisé, multi-devices)

### Build AAB Release

```bash
cd android
./gradlew bundleRelease
```

**AAB généré**: `android/app/build/outputs/bundle/release/app-release.aab`

**Upload sur Play Store**: Google Console > Production > Create new release > Upload AAB

---

## 🛠️ SCRIPTS AUTOMATISÉS

### Script PowerShell: `build-android.ps1`

```powershell
# Build Android APK Debug
Write-Host "🚀 BUILD ANDROID APK DEBUG" -ForegroundColor Cyan

# Étape 1: Build web
Write-Host "`n📦 1/4 Building web assets..." -ForegroundColor Yellow
npm run build:vite
if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Build web failed!" -ForegroundColor Red
    exit 1
}

# Étape 2: Sync Capacitor
Write-Host "`n🔄 2/4 Syncing Capacitor..." -ForegroundColor Yellow
npx cap sync android
if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Capacitor sync failed!" -ForegroundColor Red
    exit 1
}

# Étape 3: Build APK
Write-Host "`n🏗️  3/4 Building APK..." -ForegroundColor Yellow
cd android
./gradlew assembleDebug
cd ..
if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ APK build failed!" -ForegroundColor Red
    exit 1
}

# Étape 4: Copier APK
Write-Host "`n📋 4/4 Copying APK..." -ForegroundColor Yellow
$apkPath = "android/app/build/outputs/apk/debug/app-debug.apk"
$destPath = "audioguide-debug.apk"
Copy-Item $apkPath $destPath -Force

# Succès
Write-Host "`n✅ BUILD SUCCESS!" -ForegroundColor Green
Write-Host "APK location: $destPath" -ForegroundColor Cyan
Write-Host "Size: $((Get-Item $destPath).Length / 1MB) MB" -ForegroundColor Cyan

# Afficher commande install
Write-Host "`nInstall on device:" -ForegroundColor Yellow
Write-Host "  adb install -r $destPath" -ForegroundColor White
```

**Utilisation**:
```powershell
.\build-android.ps1
```

### Script Batch: `build-android.bat`

```batch
@echo off
echo 🚀 BUILD ANDROID APK DEBUG

echo.
echo 📦 1/4 Building web assets...
call npm run build:vite
if %errorlevel% neq 0 goto :error

echo.
echo 🔄 2/4 Syncing Capacitor...
call npx cap sync android
if %errorlevel% neq 0 goto :error

echo.
echo 🏗️  3/4 Building APK...
cd android
call gradlew assembleDebug
cd ..
if %errorlevel% neq 0 goto :error

echo.
echo 📋 4/4 Copying APK...
copy android\app\build\outputs\apk\debug\app-debug.apk audioguide-debug.apk

echo.
echo ✅ BUILD SUCCESS!
echo APK location: audioguide-debug.apk
echo.
echo Install on device:
echo   adb install -r audioguide-debug.apk
goto :end

:error
echo.
echo ❌ BUILD FAILED!
exit /b 1

:end
```

**Utilisation**:
```cmd
build-android.bat
```

---

## 🧪 TESTS POST-BUILD

### Test 1: Vérifier APK intégrité

```bash
# Analyser APK
npx cap run android --list

# OU
aapt dump badging android/app/build/outputs/apk/debug/app-debug.apk
```

**Vérifier**:
- `package: name='io.ionic.starter'` (ou votre package)
- `versionCode='1'`
- `versionName='1.0'`
- Permissions présentes

### Test 2: Installer et tester

```bash
# Désinstaller version précédente
adb uninstall io.ionic.starter

# Installer nouvelle version
adb install android/app/build/outputs/apk/debug/app-debug.apk

# Lancer app
adb shell am start -n io.ionic.starter/.MainActivity
```

### Test 3: Vérifier logs

```bash
# Logs temps réel
adb logcat | grep -i "Capacitor\|Ionic\|Geofencing"

# OU avec tag spécifique
adb logcat -s "CapacitorGeolocation:*"
```

---

## 🐛 TROUBLESHOOTING

### Erreur: "ANDROID_HOME not set"
```powershell
[System.Environment]::SetEnvironmentVariable('ANDROID_HOME', 'C:\Users\jpama\AppData\Local\Android\Sdk', 'User')
# Redémarrer terminal
```

### Erreur: "Gradle build failed"
```bash
# Clean gradle cache
cd android
./gradlew clean

# Rebuild
./gradlew assembleDebug --stacktrace
```

### Erreur: "No connected devices"
```bash
# Vérifier connexion
adb devices

# Si vide, activer USB Debugging sur téléphone:
# Settings > Developer Options > USB Debugging
```

### Erreur: "INSTALL_FAILED_UPDATE_INCOMPATIBLE"
```bash
# Désinstaller ancienne version
adb uninstall io.ionic.starter

# Réinstaller
adb install android/app/build/outputs/apk/debug/app-debug.apk
```

### Erreur: "Task :app:processDebugResources FAILED"
```bash
# Vérifier AndroidManifest.xml syntaxe
# Vérifier permissions duplicates
# Clean + rebuild
cd android
./gradlew clean assembleDebug
```

### App crash au lancement
```bash
# Vérifier logs
adb logcat | grep -E "AndroidRuntime|FATAL"

# Souvent: permissions manquantes ou plugins Capacitor non installés
```

---

## 📊 CHECKLIST BUILD

### Avant le build
- [ ] `npm install` exécuté
- [ ] `.env` ou variables d'env configurées (VITE_MAPBOX_TOKEN, etc.)
- [ ] `capacitor.config.ts` correct (appId, appName)
- [ ] `AndroidManifest.xml` permissions OK
- [ ] Backend API accessible (si tests réseau)

### Pendant le build
- [ ] `npm run build:vite` → 0 erreurs
- [ ] `npx cap sync android` → Success
- [ ] Android Studio indexation terminée
- [ ] Gradle build → Success

### Après le build
- [ ] APK généré dans `android/app/build/outputs/apk/debug/`
- [ ] Taille APK raisonnable (15-25 MB debug)
- [ ] Installation sur device → Success
- [ ] App lance sans crash
- [ ] Permissions demandées (Location, etc.)
- [ ] Fonctionnalités testées (Map, Geofencing, Audio)

---

## 🚀 COMMANDES RAPIDES

```bash
# Build complet en une commande
npm run build:vite && npx cap sync android && cd android && ./gradlew assembleDebug && cd ..

# OU avec scripts
.\build-android.ps1

# Installer directement après build
adb install -r android/app/build/outputs/apk/debug/app-debug.apk

# Lancer app
adb shell am start -n io.ionic.starter/.MainActivity

# Logs live
adb logcat -c && adb logcat | Select-String "Capacitor|Geofencing"
```

---

## 📱 CONFIGURATION DEVICE

### Activer USB Debugging
1. **Settings** > **About Phone**
2. Taper 7 fois sur **Build Number**
3. Retour > **Developer Options**
4. Activer **USB Debugging**
5. Connecter USB et autoriser ordinateur

### Installer Fake GPS (pour tests geofencing)
1. Play Store > "Fake GPS Location"
2. Installer app (ex: "Fake GPS Location - GPS Joystick")
3. **Settings** > **Developer Options** > **Select mock location app** > Fake GPS
4. Lancer Fake GPS > Définir position sur carte

---

## 📚 RÉFÉRENCES

### Documentation officielle
- [Capacitor Android](https://capacitorjs.com/docs/android)
- [Android Studio](https://developer.android.com/studio)
- [Gradle Build](https://developer.android.com/studio/build)

### Commandes utiles
```bash
# Capacitor
npx cap --help
npx cap doctor
npx cap ls

# ADB
adb devices
adb logcat
adb shell
adb install
adb uninstall

# Gradle
./gradlew tasks
./gradlew clean
./gradlew assembleDebug
./gradlew assembleRelease
./gradlew bundleRelease
```

---

**✨ FIN DU GUIDE - PRÊT POUR LE BUILD ! 🚀**
