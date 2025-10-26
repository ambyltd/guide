.\# 🔧 Vider Cache WebView Android

**Problème** : Version web ≠ Version Android (même après rebuild)  
**Cause** : WebView Android conserve ancien cache JS/CSS  
**Solution** : Vider cache app + rebuild

---

## 🎯 Solution Rapide (Sur Device Android)

### Option 1 : Désinstaller/Réinstaller l'App

**Le plus efficace** :

1. **Sur le téléphone** :
   - Paramètres → Applications → Audio Guide Test
   - Désinstaller
   - Confirmer

2. **Dans Android Studio** :
   - Run → Run 'app' (▶️)
   - L'app se réinstalle proprement

**Résultat** : Cache WebView complètement vidé ✅

---

### Option 2 : Vider Cache via Paramètres Android

**Si vous voulez garder les données** :

1. **Sur le téléphone** :
   - Paramètres → Applications → Audio Guide Test
   - Stockage
   - **Vider le cache** (PAS "Effacer les données")

2. **Relancer l'app**
   - Force-close puis rouvrir

**Résultat** : Cache vidé, données conservées ✅

---

## 🛠️ Solution Développeur : Version Cache Busting

### Ajouter Version dans index.html

Pour forcer le rechargement automatique, modifiez `ionic-app-v2/index.html` :

```html
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <title>Audio Guide Côte d'Ivoire</title>
    
    <!-- Cache Busting: Force reload on new version -->
    <meta http-equiv="Cache-Control" content="no-cache, no-store, must-revalidate" />
    <meta http-equiv="Pragma" content="no-cache" />
    <meta http-equiv="Expires" content="0" />
    
    <base href="/" />
    <!-- ... reste du fichier ... -->
  </head>
</html>
```

Puis rebuild :
```bash
npm run build
npx cap sync android
# Rebuild Android Studio
```

---

## 🔍 Vérifier Quelle Version Tourne

### Dans le Code (Pour Debug)

Ajoutez dans `src/App.tsx` :

```tsx
useEffect(() => {
  console.log('🚀 APP VERSION:', new Date().toISOString());
  console.log('🗺️ MapWithGeofencing:', typeof MapWithGeofencing);
}, []);
```

### Logcat Android Studio

1. Android Studio → Logcat (en bas)
2. Chercher "APP VERSION"
3. Vérifier timestamp = nouveau build

---

## 📋 Checklist Mise à Jour Android

Pour chaque modification du code web :

- [ ] **1. Build Vite**
  ```bash
  npm run build
  ```

- [ ] **2. Sync Capacitor**
  ```bash
  npx cap sync android
  ```

- [ ] **3. Rebuild Android Studio**
  - Build → Clean Project
  - Build → Rebuild Project

- [ ] **4. Vider Cache WebView**
  - **Option A** : Désinstaller app sur device → Réinstaller
  - **Option B** : Paramètres → App → Vider cache

- [ ] **5. Vérifier Version**
  - Logcat → Chercher logs "APP VERSION"
  - Vérifier fonctionnalités nouvelles présentes

---

## 🎯 Script Automatisé (TODO)

Pour automatiser tout :

```powershell
# update-android-full.ps1
npm run build
npx cap sync android

Write-Host "IMPORTANT: Desinstaller app sur device avant rebuild!" -ForegroundColor Yellow
Write-Host "Parametres > Applications > Audio Guide Test > Desinstaller" -ForegroundColor Cyan

$continue = Read-Host "App desinstallee? (o/n)"
if ($continue -eq "o") {
    cmd /c "open-android-studio.bat"
    Write-Host "Faire: Build > Clean > Rebuild > Run" -ForegroundColor Green
}
```

---

## ✅ Test de Validation

Après désinstallation/réinstallation, vérifiez :

- [ ] Tab 'info' **SANS carte** (nouvelle version)
- [ ] Tab 'audioguides' **AVEC carte MapWithGeofencing** (nouvelle version)
- [ ] Filtres sur page Map (nouvelle version)

Si ✅ → Cache vidé et nouvelle version active  
Si ❌ → Vérifier `dist/` contient les nouveaux fichiers

---

**ACTION IMMÉDIATE** : Désinstaller l'app sur votre téléphone avant de la rebuild ! 🚀
