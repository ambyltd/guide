# 🔍 Guide Rapide : Chrome Remote Debugging

## Objectif
Voir exactement ce qui se passe dans l'application Android (logs JavaScript, erreurs, réseau)

---

## 📋 Étapes Simples

### 1. Ouvrir Chrome sur votre PC

Copiez-collez dans la barre d'adresse :
```
chrome://inspect/#devices
```

### 2. Attendre que l'App Apparaisse

Vous devriez voir après quelques secondes :

```
Remote Target #LOCALHOST

com.cotedivoire.audioguide
  capacitor://localhost
  [Inspect]
```

### 3. Cliquer sur "Inspect"

Une nouvelle fenêtre DevTools s'ouvre.

### 4. Aller dans l'onglet "Console"

C'est là que tous les `console.log()` JavaScript apparaissent.

---

## ✅ Si l'App Fonctionne, Vous Verrez

```javascript
Loading app at capacitor://localhost
React App mounted
Home component mounted
✅ Geofencing démarré
🎯 Geofencing activé sur Map.tsx
📍 Position: 5.3599517, -4.0082563
Home - Chargement attractions: 5
Map - Filtrage: 5/5 attractions
```

**Action** : Prendre screenshot et tester geofencing !

---

## ❌ Si l'App a un Problème, Vous Verrez

### Erreur 1 : API Backend

```javascript
❌ Failed to fetch: http://10.0.2.2:5000/api/attractions
❌ Network request failed
```

**Cause** : Backend API pas lancé sur le PC

**Solution** :
```powershell
# Dans un terminal sur PC
cd C:\Users\jpama\Desktop\i\audioguide\backend-api
npm start
```

---

### Erreur 2 : Mapbox Token

```javascript
❌ Mapbox GL JS: Invalid token
❌ Token expired or malformed
```

**Cause** : Token Mapbox invalide dans `.env.production`

**Solution** : Vérifier le token sur https://account.mapbox.com/

---

### Erreur 3 : JavaScript Crash

```javascript
❌ Uncaught TypeError: Cannot read property 'map' of undefined
   at Home.tsx:123
❌ Uncaught ReferenceError: React is not defined
```

**Cause** : Erreur code JavaScript

**Solution** : Partager l'erreur exacte avec le numéro de ligne

---

### Erreur 4 : Vite Build Problem

```javascript
❌ Failed to load module script
❌ [vite] Error loading
```

**Cause** : Build Vite incomplet ou corrompu

**Solution** :
```powershell
cd C:\Users\jpama\Desktop\i\audioguide\ionic-app
rm -r dist
npm run build
npx cap sync android
```

---

## 🌐 Onglet "Network" (Requêtes API)

Cliquez sur l'onglet **Network** pour voir :

### Si Backend Fonctionne

```
✅ GET http://10.0.2.2:5000/api/attractions  Status: 200 OK
✅ GET http://10.0.2.2:5000/api/audioguides  Status: 200 OK
```

### Si Backend Pas Lancé

```
❌ GET http://10.0.2.2:5000/api/attractions  Status: (failed)
   Error: net::ERR_CONNECTION_REFUSED
```

---

## 📱 Onglet "Elements" (DOM HTML)

Cliquez sur l'onglet **Elements** pour voir :

### Si l'App Charge

```html
<body>
  <div id="root">
    <ion-app class="md hydrated">
      <ion-router-outlet>
        <div class="ion-page">
          <!-- Contenu Home.tsx ou Map.tsx -->
        </div>
      </ion-router-outlet>
    </ion-app>
  </div>
</body>
```

### Si l'App Ne Charge Pas

```html
<body>
  <div id="root"></div>
  <!-- Vide, rien ne s'affiche -->
</body>
```

**Cause** : React ne monte pas, problème JavaScript

---

## 🎯 Checklist Rapide

- [ ] Chrome ouvert sur `chrome://inspect`
- [ ] App "com.cotedivoire.audioguide" visible
- [ ] Cliqué sur "Inspect"
- [ ] Onglet Console ouvert
- [ ] Logs JavaScript visibles (ou erreurs visibles)

---

## 📸 Screenshots à Partager

Si besoin d'aide :

1. **Console** : Screenshot complet avec tous les logs/erreurs
2. **Network** : Liste des requêtes API (succès ou échec)
3. **Elements** : HTML `<div id="root">` et son contenu

---

**Prochaine étape** : Ouvrir `chrome://inspect` maintenant et partager ce que vous voyez !
