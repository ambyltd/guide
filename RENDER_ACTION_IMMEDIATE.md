# 🎯 ACTION IMMÉDIATE RENDER.COM

## ⚠️ VOUS AVEZ 2 ERREURS À CORRIGER

### **Erreur 1** : Root Directory incorrect
### **Erreur 2** : Yarn cherche "start" dans mauvais package.json

---

## ✅ SOLUTION RAPIDE (3 MINUTES)

### **ÉTAPE 1 : Aller sur Dashboard Render**
🔗 https://dashboard.render.com

### **ÉTAPE 2 : Sélectionner votre service**
Click sur `audioguide-backend` (ou le nom de votre service)

### **ÉTAPE 3 : Cliquer "Settings" (menu gauche)**

### **ÉTAPE 4 : Modifier "Build & Deploy"**

Scroll jusqu'à la section **Build & Deploy** et modifier :

```
Root Directory:    backend-api        ← EXACTEMENT ça (pas de / ni de ./)
Build Command:     npm install && npm run build
Start Command:     npm start
```

### **ÉTAPE 5 : Modifier "Environment"**

Cliquer sur **Environment** (menu gauche)

Ajouter cette variable (si elle n'existe pas) :

```
Key:    NPM_CONFIG_PRODUCTION
Value:  false
```

Cette variable **force Render à utiliser NPM au lieu de Yarn**.

### **ÉTAPE 6 : Vérifier toutes les variables d'environnement**

Assurez-vous que TOUTES ces variables existent :

```
✓ NODE_ENV = production
✓ PORT = 5000
✓ NPM_CONFIG_PRODUCTION = false
✓ MONGODB_URI = mongodb+srv://ambyltd_db_user:CjQOR7FBM0W4FXRK@ambyl...
✓ FIREBASE_PROJECT_ID = ambyl-fr
✓ FIREBASE_CLIENT_EMAIL = firebase-adminsdk-vmgdb@ambyl-fr.iam.gserviceaccount.com
✓ FIREBASE_PRIVATE_KEY = -----BEGIN PRIVATE KEY----- (tout le contenu)
✓ MAPBOX_ACCESS_TOKEN = pk.eyJ1...
✓ JWT_SECRET = a8f3b7c2e9d4f6a1b8c5e2f9d3a6b4c7e1f8a5b2c9d6e3f7a4b1c8e5f2a9b6c3
```

### **ÉTAPE 7 : Sauvegarder**

Scroll en bas → Click **"Save Changes"**

### **ÉTAPE 8 : Redéployer**

En haut à droite → Click **"Manual Deploy"**
→ Select **"Deploy latest commit"**

---

## ⏱️ ATTENDRE 3-5 MINUTES

Surveiller les logs du déploiement.

### **✅ SUCCÈS si vous voyez :**
```
==> Root directory set to backend-api
==> Running 'npm install'
==> Running 'npm run build'
✓ Build successful
==> Running 'npm start'
Server listening on port 5000
MongoDB connected: ambyl
```

### **❌ ÉCHEC si vous voyez :**
```
yarn run v1.22.22
error Command "start" not found
```
→ Vérifier que `NPM_CONFIG_PRODUCTION=false` est bien ajouté

---

## 🧪 TESTER APRÈS DÉPLOIEMENT

Une fois que le statut est vert :

1. **Copier l'URL de votre service** (ex: `https://audioguide-backend-xxxx.onrender.com`)

2. **Tester dans un navigateur ou terminal :**

```bash
# Test 1: Health check
https://VOTRE-URL.onrender.com/api/health

# Test 2: Features
https://VOTRE-URL.onrender.com/api/features

# Test 3: Attractions
https://VOTRE-URL.onrender.com/api/attractions
```

3. **Résultats attendus :**
   - `/api/health` → JSON avec `{"status":"ok","mongodb":"connected"}`
   - `/api/features` → Array de 7 objets
   - `/api/attractions` → Array de 15 objets

---

## 📊 CHECKLIST COMPLÈTE

Avant de cliquer "Manual Deploy", vérifier :

- [ ] Root Directory = `backend-api` (SANS `/` ni `./`)
- [ ] Build Command = `npm install && npm run build`
- [ ] Start Command = `npm start`
- [ ] NPM_CONFIG_PRODUCTION = `false` dans Environment
- [ ] MONGODB_URI existe et est correct
- [ ] FIREBASE_PRIVATE_KEY existe et est complet (avec BEGIN/END)
- [ ] MAPBOX_ACCESS_TOKEN existe
- [ ] JWT_SECRET existe

Si TOUT est coché ✓, cliquez **"Manual Deploy"** !

---

## 🆘 SI ÇA NE MARCHE TOUJOURS PAS

### **Option Alternative : Railway.app**

Railway est souvent plus simple :

1. Aller sur https://railway.app
2. Sign up with GitHub
3. New Project → Deploy from GitHub
4. Select `ambyltd/guide`
5. Root Directory : `backend-api`
6. Copier les mêmes variables d'environnement
7. Deploy

Railway détecte automatiquement Node.js et NPM.

---

## 📝 DOCUMENTS CRÉÉS

J'ai créé 3 guides complets :

1. **RENDER_CONFIG_FIX.md** - Configuration complète
2. **RENDER_FIX_RAPIDE.md** - Fix en 2 minutes
3. **RENDER_YARN_FIX.md** - Fix Yarn/NPM
4. **RENDER_ACTION_IMMEDIATE.md** (ce fichier) - Checklist

Tous sont sur GitHub : https://github.com/ambyltd/guide

---

## 🎯 PROCHAINES ÉTAPES APRÈS SUCCÈS

1. ✅ Backend déployé sur Render
2. ⏭️ Mettre à jour CMS avec URL Render
3. ⏭️ Mettre à jour mobile app avec URL Render
4. ⏭️ Déployer CMS sur Netlify
5. ⏭️ Tester l'intégration complète

---

## 💡 CONSEIL

**Première fois avec Render** : Le service gratuit s'endort après 15 minutes d'inactivité. Le premier appel après réveil prend ~30 secondes. C'est normal ! ⏰

---

## 🚀 ALLEZ-Y MAINTENANT !

1. Ouvrir https://dashboard.render.com
2. Settings → Build & Deploy → Modifier
3. Environment → Ajouter NPM_CONFIG_PRODUCTION=false
4. Save Changes
5. Manual Deploy
6. Attendre 3-5 min
7. Tester /api/health

**VOUS POUVEZ LE FAIRE !** 💪
