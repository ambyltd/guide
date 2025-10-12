# Debug : Application Android Blanche

## 🔍 Comment Voir les Logs dans Android Studio

### 1️⃣ **Ouvrir Logcat (Vue des logs)**

Dans Android Studio :
- **Menu** : View > Tool Windows > **Logcat** (ou cliquez sur l'onglet en bas)
- Ou raccourci : **Alt+6**

### 2️⃣ **Filtrer les logs de votre app**

Dans la barre de recherche Logcat, tapez :
```
package:io.ionic.starter
```

Ou filtrez par tag :
```
Capacitor
```

### 3️⃣ **Logs à chercher (Erreurs communes)**

#### ❌ Erreur : WebView ne charge pas
```
E/Capacitor: Unable to load URL
E/chromium: [ERROR:ssl_client_socket_impl.cc]
```
**Solution** : Problème réseau ou fichiers dist manquants

#### ❌ Erreur : Permissions refusées
```
E/CapacitorGeolocation: Permission denied
E/CapacitorNotifications: Notification permission denied
```
**Solution** : Accepter les permissions manuellement

#### ❌ Erreur : JavaScript crash
```
E/chromium: [ERROR:console(XXX)] Uncaught Error
```
**Solution** : Erreur dans le code JavaScript

#### ❌ Erreur : index.html introuvable
```
E/Capacitor: Unable to find index.html
```
**Solution** : Build dist manquant ou sync non fait

---

## 🛠️ Solutions Rapides

### Solution 1 : Vérifier que dist/ existe

```powershell
# Dans PowerShell
cd C:\Users\jpama\Desktop\i\audioguide\ionic-app
ls dist
```

Si dist/ n'existe pas ou est vide :
```powershell
npm run build
npx cap sync android
```

### Solution 2 : Vérifier la configuration Capacitor

Vérifiez le fichier `capacitor.config.ts` :

```typescript
// Devrait contenir :
const config: CapacitorConfig = {
  appId: 'io.ionic.starter',
  appName: 'ionic-app-base',
  webDir: 'dist', // ← Important !
  server: {
    androidScheme: 'https'
  }
};
```

### Solution 3 : Clean et Rebuild Android

Dans Android Studio :
1. **Build** > **Clean Project**
2. Attendez que ça finisse
3. **Build** > **Rebuild Project**
4. Relancez l'app (▶️ Run)

### Solution 4 : Vérifier les variables d'environnement

L'app a besoin des clés API. Vérifiez `ionic-app/.env` :

```bash
VITE_MAPBOX_TOKEN=votre_token_mapbox
VITE_API_URL=http://10.0.2.2:5000/api
# 10.0.2.2 = localhost depuis émulateur Android
```

### Solution 5 : Activer le débogage Chrome

1. Dans l'émulateur, ouvrez Chrome sur votre PC
2. Allez sur : `chrome://inspect/#devices`
3. Vous verrez votre app listée
4. Cliquez **"Inspect"**
5. Regardez la **Console** pour les erreurs JavaScript

---

## 📱 Commandes de Diagnostic

### Vérifier l'état du build

```powershell
cd C:\Users\jpama\Desktop\i\audioguide\ionic-app

# Vérifier dist/
ls dist

# Vérifier index.html existe
cat dist/index.html | Select-String "<title>"

# Vérifier taille des assets
ls dist/assets
```

### Forcer un rebuild complet

```powershell
# 1. Nettoyer
rm -r dist -ErrorAction SilentlyContinue
rm -r android/app/build -ErrorAction SilentlyContinue

# 2. Rebuild
npm run build

# 3. Vérifier le build
ls dist/index.html

# 4. Re-sync
npx cap sync android

# 5. Relancer dans Android Studio
npx cap open android
```

---

## 🔧 Vérifications Avancées

### 1. Vérifier AndroidManifest.xml

Fichier : `android/app/src/main/AndroidManifest.xml`

Doit contenir :
```xml
<uses-permission android:name="android.permission.INTERNET" />
<uses-permission android:name="android.permission.ACCESS_NETWORK_STATE" />
<uses-permission android:name="android.permission.ACCESS_FINE_LOCATION" />
<uses-permission android:name="android.permission.POST_NOTIFICATIONS" />
```

### 2. Vérifier MainActivity.java

Fichier : `android/app/src/main/java/io/ionic/starter/MainActivity.java`

Doit contenir :
```java
public class MainActivity extends BridgeActivity {}
```

### 3. Vérifier Gradle sync

Dans Android Studio :
- File > Sync Project with Gradle Files
- Attendez la fin (barre de progression en bas)
- Si erreurs, lisez les messages dans "Build" tab

---

## 🐛 Erreurs Spécifiques Geofencing

### Si l'app crash au démarrage de Map.tsx

**Erreur potentielle** :
```
E/chromium: Uncaught TypeError: Cannot read property 'initialize' of undefined
```

**Cause** : `notificationService` ou `geolocationService` non importé correctement

**Solution** : Vérifier les imports dans `Map.tsx`

### Si les notifications ne s'affichent pas

**Vérifier dans Logcat** :
```
I/CapacitorNotifications: Permission status: granted
```

Si "denied", acceptez manuellement :
- Émulateur > Settings > Apps > Audio Guide > Permissions
- Activez "Location" et "Notifications"

---

## 📊 Test de Base (sans Android Studio)

Si vous voulez tester rapidement sans émulateur :

```powershell
# Test en mode web (pas de notifications natives)
cd C:\Users\jpama\Desktop\i\audioguide\ionic-app
npm run dev
```

Puis ouvrez : `http://localhost:5173`

**Limitations mode web** :
- ❌ Pas de notifications locales (Capacitor)
- ❌ GPS peut être simulé/bloqué
- ✅ Interface fonctionne
- ✅ Logique React fonctionne

---

## 🚨 SOS : Erreur Critique

Si rien ne fonctionne, envoyez-moi :

### Dans Logcat, filtrez et copiez :
```
package:io.ionic.starter
```

### Ou cherchez ces tags :
```
Capacitor
WebView
chromium
```

### Screenshot demandé :
1. Émulateur avec écran blanc
2. Logcat avec filtre "Capacitor"
3. Onglet "Build" dans Android Studio

---

## ✅ Checklist de Vérification

Avant de relancer l'app :

- [ ] `dist/index.html` existe et n'est pas vide
- [ ] `npm run build` terminé sans erreur
- [ ] `npx cap sync android` exécuté avec succès
- [ ] Gradle sync terminé dans Android Studio (barre verte)
- [ ] Permissions dans AndroidManifest.xml
- [ ] `.env` configuré avec VITE_MAPBOX_TOKEN
- [ ] Émulateur démarré et fonctionnel
- [ ] Logcat ouvert et filtré sur "Capacitor"

---

**Prochaine étape** : Partagez les erreurs Logcat pour diagnostic précis ! 🔍
