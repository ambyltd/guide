# Logs Diagnostics Android - 9 octobre 2025 16:10

## ✅ Status Capacitor

```
✅ App restarted (16:09:46)
✅ App started
✅ App resumed
✅ LocalNotification plugin détecté
✅ NetworkPlugin actif
```

## ⚠️ Observations

1. **Cycles de vie normaux** : started → resumed → paused → stopped
2. **Aucune erreur native Capacitor**
3. **LocalNotification plugin reconnu** : "LocalNotification received: null"
4. **NetworkPlugin événements** : "No listeners found for event networkStatusChange"

## ❌ Logs Manquants

**Logs JavaScript/Console attendus mais absents** :
- `console.log()` de l'application React
- Erreurs JavaScript (Uncaught TypeError, etc.)
- Logs geofencing ("🎯 Geofencing activé")
- Logs Map.tsx, Home.tsx

**Hypothèse** : 
- WebView se charge (pas d'erreur Capacitor)
- Mais JavaScript ne s'exécute pas ou crash silencieusement
- Ou filtre Logcat ne capture pas les logs chromium/Console

## 🔍 Actions de Diagnostic

### 1. Vérifier Logcat avec Filtres Complets

Dans Android Studio Logcat, essayer ces filtres :

```bash
# Filtre complet (recommandé)
chromium|Console|Capacitor|WebView

# Ou regex
chromium.*|Console.*|Capacitor.*

# Ou niveau Error
level:error
```

### 2. Chrome Remote Debugging (URGENT)

1. Ouvrir Chrome sur PC : `chrome://inspect/#devices`
2. Attendre que "com.cotedivoire.audioguide" apparaisse
3. Cliquer "Inspect"
4. Regarder onglet **Console**

**Console attendue (si fonctionne)** :
```
Loading app...
React App mounted
Home component mounted
Geofencing activé
```

**Console si problème** :
```
❌ Uncaught TypeError: Cannot read property...
❌ Failed to fetch: http://10.0.2.2:5000/api
❌ Mapbox GL JS error: Invalid token
```

### 3. Test SplashScreen

Si splash screen ne disparaît pas, l'app est bloquée au démarrage.

**Solution** : Vérifier `src/App.tsx` ou `src/main.tsx` contient :

```typescript
import { SplashScreen } from '@capacitor/splash-screen';

// Au démarrage
SplashScreen.hide();
```

### 4. Test Backend API

Vérifier que le backend est lancé sur le PC :

```powershell
# Vérifier si backend écoute sur port 5000
Test-NetConnection -ComputerName localhost -Port 5000
```

Si backend pas lancé :
```powershell
cd C:\Users\jpama\Desktop\i\audioguide\backend-api
npm start
```

### 5. Test Variables d'Environnement

Vérifier que Vite utilise `.env.production` :

```powershell
cd C:\Users\jpama\Desktop\i\audioguide\ionic-app

# Vérifier contenu dist/assets/index-*.js contient 10.0.2.2
Select-String -Path "dist/assets/index-*.js" -Pattern "10.0.2.2" | Select-Object -First 1
```

Si retourne rien → `.env.production` pas utilisé

**Solution** :
```powershell
# Rebuild avec mode production explicite
npm run build -- --mode production

# Re-sync
npx cap sync android
```

## 📊 Checklist de Vérification

- [ ] Logcat filtre `chromium|Console|Capacitor` appliqué
- [ ] Chrome Inspect ouvert et app visible
- [ ] Console Chrome montre erreurs JavaScript
- [ ] Backend API lancé sur `http://localhost:5000`
- [ ] `.env.production` utilisé (vérifier dist/assets)
- [ ] SplashScreen.hide() appelé dans App.tsx
- [ ] Émulateur a connexion réseau active

## 🎯 Prochaines Actions

### Si Chrome Inspect montre une erreur JavaScript :
→ Partager l'erreur exacte pour correction

### Si Chrome Inspect ne montre rien :
→ WebView ne charge pas, problème Capacitor config

### Si erreur "Failed to fetch API" :
→ Backend pas lancé ou 10.0.2.2 pas accessible

### Si erreur Mapbox :
→ Token invalide ou expiré dans .env.production

## 📸 Screenshots Demandés

Pour diagnostic précis :

1. **Émulateur Android** : Ce qui est affiché à l'écran
2. **Logcat** : Avec filtre `chromium|Console|Capacitor`
3. **Chrome Inspect Console** : Onglet Console complet
4. **Chrome Inspect Network** : Onglet Network (requêtes API)

---

**Status** : ⏳ En attente résultats Chrome Inspect

**Prochaine étape** : Ouvrir `chrome://inspect` et partager logs Console
