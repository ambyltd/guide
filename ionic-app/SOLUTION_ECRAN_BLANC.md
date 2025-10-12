# 🚨 SOLUTION RAPIDE : Écran Blanc Android

## Problème Identifié

**Cause probable** : L'application essaie de se connecter à `http://localhost:5000/api` mais depuis l'émulateur Android, `localhost` ne fonctionne pas.

**Solution** : Utiliser `10.0.2.2` (IP spéciale émulateur Android pour accéder au PC hôte)

---

## ✅ Solution en 3 Étapes

### Étape 1 : Créer un fichier .env.production

```powershell
cd C:\Users\jpama\Desktop\i\audioguide\ionic-app

# Créer .env.production avec l'IP émulateur
@"
VITE_APP_NAME="Côte d'Ivoire Audio Guide"
VITE_APP_VERSION=1.0.0
VITE_APP_ENVIRONMENT=production
VITE_DEBUG_MODE=true
VITE_LOG_LEVEL=debug
VITE_API_URL=http://10.0.2.2:5000/api
VITE_FIREBASE_API_KEY=AIzaSyAWlPL4AOQYx59-cvXssikv ouXCw4ryCXc
VITE_FIREBASE_AUTH_DOMAIN=ambyl-fr.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=ambyl-fr
VITE_FIREBASE_STORAGE_BUCKET=ambyl-fr.firebasestorage.app
VITE_FIREBASE_MESSAGING_SENDER_ID=283024094411
VITE_FIREBASE_APP_ID=1:283024094411:web:1ce3f672c4e1cc8aa5974e
VITE_MAPBOX_TOKEN=pk.eyJ1IjoiYW1ieWwiLCJhIjoiY21nM3kweWh4MDB1ODJsczU1dTFobTlhMyJ9.cbCC7l02iaEkCqnMY8yKug
VITE_MAPBOX_ACCESS_TOKEN=pk.eyJ1IjoiYW1ieWwiLCJhIjoiY21nM3kweWh4MDB1ODJsczU1dTFobTlhMyJ9.cbCC7l02iaEkCqnMY8yKug
"@ | Out-File -FilePath .env.production -Encoding utf8
```

### Étape 2 : Rebuild avec mode production

```powershell
# Nettoyer
rm -r dist -ErrorAction SilentlyContinue

# Rebuild en mode production
npm run build

# Re-sync Capacitor
npx cap sync android
```

### Étape 3 : Relancer dans Android Studio

```powershell
# Ouvrir Android Studio (si pas déjà ouvert)
npx cap open android

# Dans Android Studio :
# 1. File > Sync Project with Gradle Files
# 2. Cliquez ▶️ Run
```

---

## 🔍 Alternative : Tester en Mode Web d'Abord

Si vous voulez vérifier que l'app fonctionne avant d'aller sur Android :

```powershell
cd C:\Users\jpama\Desktop\i\audioguide\ionic-app

# Démarrer en mode dev
npm run dev
```

Ouvrez : `http://localhost:5173`

**Ce qui devrait s'afficher** :
- ✅ Page Home avec attractions
- ✅ Onglet Map avec carte Mapbox
- ✅ Navigation entre tabs

**Limitations mode web** :
- ❌ Notifications natives (Capacitor LocalNotifications)
- ⚠️ Géolocalisation peut demander permissions browser

---

## 🐛 Si le Problème Persiste

### Vérifier les logs Logcat dans Android Studio

1. Ouvrir **Logcat** (Alt+6)
2. Filtrer par : `Capacitor`
3. Chercher ces erreurs :

```
❌ "Unable to load URL"
❌ "ERR_CONNECTION_REFUSED"
❌ "Failed to fetch"
❌ "Uncaught TypeError"
```

### Activer le Remote Debugging Chrome

1. Dans Chrome sur votre PC, allez sur : `chrome://inspect/#devices`
2. Attendez que votre app apparaisse
3. Cliquez **"Inspect"**
4. Regardez la **Console** pour erreurs JavaScript

---

## 📋 Checklist Complète

Avant de relancer Android :

- [ ] `.env.production` créé avec `10.0.2.2`
- [ ] `npm run build` terminé sans erreur
- [ ] `dist/index.html` existe
- [ ] `npx cap sync android` exécuté
- [ ] Backend API lancé sur `http://localhost:5000` (sur votre PC)
- [ ] Gradle sync terminé dans Android Studio
- [ ] Émulateur démarré

---

## 🚀 Commandes Complètes (Copy-Paste)

```powershell
# Se positionner dans ionic-app
cd C:\Users\jpama\Desktop\i\audioguide\ionic-app

# Créer .env.production (copier tout le bloc)
@"
VITE_APP_NAME="Côte d'Ivoire Audio Guide"
VITE_APP_VERSION=1.0.0
VITE_APP_ENVIRONMENT=production
VITE_DEBUG_MODE=true
VITE_LOG_LEVEL=debug
VITE_API_URL=http://10.0.2.2:5000/api
VITE_FIREBASE_API_KEY=AIzaSyAWlPL4AOQYx59-cvXssikv ouXCw4ryCXc
VITE_FIREBASE_AUTH_DOMAIN=ambyl-fr.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=ambyl-fr
VITE_FIREBASE_STORAGE_BUCKET=ambyl-fr.firebasestorage.app
VITE_FIREBASE_MESSAGING_SENDER_ID=283024094411
VITE_FIREBASE_APP_ID=1:283024094411:web:1ce3f672c4e1cc8aa5974e
VITE_MAPBOX_TOKEN=pk.eyJ1IjoiYW1ieWwiLCJhIjoiY21nM3kweWh4MDB1ODJsczU1dTFobTlhMyJ9.cbCC7l02iaEkCqnMY8yKug
VITE_MAPBOX_ACCESS_TOKEN=pk.eyJ1IjoiYW1ieWwiLCJhIjoiY21nM3kweWh4MDB1ODJsczU1dTFobTlhMyJ9.cbCC7l02iaEkCqnMY8yKug
"@ | Out-File -FilePath .env.production -Encoding utf8

# Clean + Rebuild
rm -r dist -ErrorAction SilentlyContinue
npm run build

# Sync Capacitor
npx cap sync android

# Ouvrir Android Studio
npx cap open android
```

---

## ✅ Résultat Attendu

Après ces étapes, l'app devrait :

1. ✅ Afficher la page **Home** avec hero section
2. ✅ Afficher les **attractions** (avec images)
3. ✅ Onglet **Map** fonctionnel avec Mapbox
4. ✅ Badge 🔔 vert dans Map (geofencing actif)
5. ✅ Demander permissions (Localisation + Notifications)

---

**Si l'écran reste blanc, partagez les logs Logcat avec le filtre "Capacitor" ! 📋**
