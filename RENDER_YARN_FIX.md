# ⚡ FIX RENDER - Erreur "Command start not found"

## 🚨 Erreur Actuelle
```
warning package.json: No license field
error Command "start" not found.
```

## 🎯 Cause
Render utilise **Yarn** et cherche le script `start` dans le `package.json` **racine** au lieu de `backend-api/package.json`.

## ✅ SOLUTION COMPLÈTE (5 minutes)

### **Option 1 : Forcer NPM au lieu de Yarn** ⭐ RECOMMANDÉ

Dans **Render Dashboard → Settings → Build & Deploy** :

Changer la configuration en :

```yaml
Root Directory: backend-api
Build Command: npm install && npm run build
Start Command: npm start
```

Puis ajouter cette **Environment Variable** :

```
NPM_CONFIG_PRODUCTION=false
```

Cela force Render à utiliser NPM au lieu de Yarn.

---

### **Option 2 : Utiliser cd dans les commandes**

Si Option 1 ne marche pas, utiliser :

```yaml
Root Directory: (laisser vide ou mettre .)
Build Command: cd backend-api && npm install && npm run build
Start Command: cd backend-api && npm start
```

---

### **Option 3 : Créer render.yaml à la racine**

Créer le fichier `render.yaml` à la racine du projet :

```yaml
services:
  - type: web
    name: audioguide-backend
    runtime: node
    region: frankfurt
    plan: free
    rootDir: backend-api
    buildCommand: npm install && npm run build
    startCommand: npm start
    envVars:
      - key: NODE_ENV
        value: production
      - key: PORT
        value: 5000
      - key: NPM_CONFIG_PRODUCTION
        value: "false"
      # ... autres variables
```

Puis dans Render Dashboard :
- Detect render.yaml → Yes
- Auto-Deploy from render.yaml → Yes

---

## 📋 Configuration Complète Step-by-Step

### **Étape 1 : Dashboard Render**

Aller sur : https://dashboard.render.com/web/YOUR-SERVICE-ID/settings

### **Étape 2 : Section Build & Deploy**

Modifier **EXACTEMENT** comme ceci :

| Setting | Valeur |
|---------|--------|
| **Root Directory** | `backend-api` |
| **Build Command** | `npm install && npm run build` |
| **Start Command** | `npm start` |
| **Auto-Deploy** | Yes |

### **Étape 3 : Section Environment**

Ajouter cette variable (si pas déjà fait) :

```
NPM_CONFIG_PRODUCTION=false
```

Cela désactive le mode production de NPM qui peut causer des problèmes.

### **Étape 4 : Toutes les Environment Variables**

Copier-coller TOUTES ces variables :

```bash
# Node
NODE_ENV=production
PORT=5000
NPM_CONFIG_PRODUCTION=false

# MongoDB
MONGODB_URI=mongodb+srv://ambyltd_db_user:CjQOR7FBM0W4FXRK@ambyl.nlafa4d.mongodb.net/ambyl?retryWrites=true&w=majority&ssl=true&authSource=admin

# Firebase (COPIER EXACTEMENT depuis .env)
FIREBASE_PROJECT_ID=ambyl-fr
FIREBASE_CLIENT_EMAIL=firebase-adminsdk-vmgdb@ambyl-fr.iam.gserviceaccount.com
FIREBASE_PRIVATE_KEY=-----BEGIN PRIVATE KEY-----
MIIEvQIBADANBgkqhkiG9w0BAQEFAASCBKcwggSjAgEAAoIBAQC5NhO5Uvi7+U/a
5nnfKT3oHjhLGRT6ZVLHG19QcHpsoevlA532T4v5CcOtkZDlc20+DxzRLJYckiZV
Sbjr3swYCH+oL4ArSU/V59gdxLGs/fcgaSZfJUUL8CPgHdu2h54JH/lpNkQqiCsz
VUsORmhbTWppaYI/wNUlegU8jKEd0fSI5NneHSryPQi1rhKI0reR8HAZMSp3sBsJ
jbbZ8M1zDSAv+ZlO/ic8n0zoRJZ3wsv74DZHJYBLR/gosCz5qJ1InqZGWwfU9SCJ
4L65F0f9KBT2zNyjS7UQjgV00CFP4Dzy9KT/hqWJ7iIrbe21EU88vsRxXooMD7ca
OhmPyzF5AgMBAAECggEACEDOBHM7cQHpMm2UhvKbJvuowcTwe7913rg8KTUX6X0W
Kk581J/jEoICQZrj2GuqNaqd+763QjbrhR+rwTv8f4IqcRvLw/IIgBVMmrf7/GPV
RjEVVAZQwzlMWfVup923d7vgZPU1eKk4dplBhtVxm0bx+9hHJPDidqDvOI1iNRZF
SVKmsGx7HttlcGjPNQT5tpOX6fFEtk5bfA+mKMX7NXRLXCVMskC/sp+NgdZ2LWNQ
YG/PSKd1GTOL/AoY53qURxXus6/wmdupvBI6C0c7u6NVNGXGdHn7GBjr2l4n9H45
p3TWtpCdTTTOuXxz6kliY2e4FmOZv1yrSsg3LPfhgQKBgQD7vQBMshJC/SbuIAZp
s8Z5zvZJChagSQmcAjCwoRmkrkOY81EDvzMhrPsv+VPqRpBWeibRF5HIsdtp+AgB
OkxX217eGbY1HuxtTYj0oMjVjtjCuFAnFVTv269rRSfmlt7XiErEFtyoWt2SKItT
8uf+6BONavUcGWLHs7Zv2FXN+QKBgQC8WMHCpiYkfWVpAKTghbMU5YVsVxFHMUj4
bE2WeSuqP4WY3KKMrnfILW3RciBCfMheA4hDsSOkyEbKYgvP9flbeEEET0HRmaRS
Q2RY+vLrBLqFcz/PNLW1oQpkjoa/ct9kojrManLibi5n5ytHhfp872xPAGQBJ3yt
AJZFwddfgQKBgQCaw6iCfluRyZb8gL3QkFCuJFnvr38Xja+VtRcAEBr2zpgKWVRu
TEcAJhvLc6pudnFYaQKiO65Jx2aQcIdjUdcLkHdzbjVB1UAfNrLDSnIOMSL8G1pT
nN66E8J13W9ZaVmZAlaM1U1VR3++0qRNuSF96mnS4HXOj6DWC5tWiZa+6QKBgCm/
CoNYTE/+M0II0IKrX7wb+2y+B6hd9iyJ5NCbXuBHYBc3oBfKe+Y0m4i24QubmNWt
tsA6PQpDEd29yZx4iqKJju+jmZUZluBc65sFVF5fF/CIUPZeWoA9h44uQROiJH2r
r5irZ3dksIh7Jo6d1Z1ne/wuu/u9gtbdsHEZu+EBAoGAPIGbHYhEhNMmkcpL2uYc
4fhgh4NPLcwybL4FKfGiWuYDC5VI98rgOG+DOZ9D4XIMlbGJme5pIfE0GHeK9knZ
XmpwUJQ7JxRHphEH0s7s7PI+unHux72TUTQtm7LmF2DXBIvHj0k+mmJc/EOuyh5B
rJCmSA2yMl0x20Jb7PxJd8k=
-----END PRIVATE KEY-----

# Mapbox
MAPBOX_ACCESS_TOKEN=pk.eyJ1IjoiYW1ieWwiLCJhIjoiY21ldjNxemlmMDZhcDJxcjFoZ3M5bDl3ZiJ9.WIO_3CUv2WdJSOm3yrttAw

# JWT
JWT_SECRET=a8f3b7c2e9d4f6a1b8c5e2f9d3a6b4c7e1f8a5b2c9d6e3f7a4b1c8e5f2a9b6c3
JWT_EXPIRES_IN=7d

# Upload
MAX_FILE_SIZE=10485760
UPLOAD_PATH=./uploads

# CORS
FRONTEND_URL=http://localhost:3000
MOBILE_APP_URL=exp://localhost:19000
```

⚠️ **ATTENTION** : Pour `FIREBASE_PRIVATE_KEY`, coller TOUT le contenu (y compris les retours à la ligne).

### **Étape 5 : Sauvegarder et Redéployer**

1. **Save Changes** (en bas de page)
2. **Manual Deploy** (en haut à droite)
3. **Deploy latest commit**
4. Attendre 3-5 minutes

---

## 🔍 Vérifier les Logs

Pendant le déploiement, surveiller les logs :

✅ **Ce que vous devez voir** :
```
==> Cloning from https://github.com/ambyltd/guide...
==> Checking out commit in branch main
==> Root directory set to backend-api
==> Running 'npm install'
...
==> Running 'npm run build'
...
==> Build successful
==> Running 'npm start'
Server listening on port 5000
MongoDB connected: ambyl
Firebase Admin initialized
```

❌ **Ce que vous NE devez PAS voir** :
```
yarn run v1.22.22
error Command "start" not found
```

---

## 🧪 Tests Post-Déploiement

Une fois le déploiement réussi :

```bash
# Récupérer l'URL Render (ex: https://audioguide-backend-xxxx.onrender.com)

# Test 1: Health check
curl https://VOTRE-URL.onrender.com/api/health

# Expected response:
{
  "status": "ok",
  "mongodb": "connected",
  "database": "ambyl",
  "timestamp": "2025-10-13T..."
}

# Test 2: Features
curl https://VOTRE-URL.onrender.com/api/features

# Expected: Array de 7 feature flags

# Test 3: Attractions
curl https://VOTRE-URL.onrender.com/api/attractions

# Expected: Array de 15 attractions
```

---

## 🔧 Alternative : Railway.app

Si Render continue de poser problème, **Railway.app** est une excellente alternative :

1. Aller sur : https://railway.app
2. Sign up with GitHub
3. New Project → Deploy from GitHub repo
4. Select `ambyltd/guide`
5. Root Directory : `backend-api`
6. Variables : Copier les mêmes
7. Deploy

Railway est souvent plus simple et plus rapide.

---

## 📊 Checklist Finale

Avant de redéployer, vérifier :

- [ ] Root Directory = `backend-api` (exactement)
- [ ] Build Command = `npm install && npm run build`
- [ ] Start Command = `npm start`
- [ ] NPM_CONFIG_PRODUCTION=false dans Environment
- [ ] MONGODB_URI ajouté
- [ ] FIREBASE_PRIVATE_KEY complet ajouté
- [ ] Tous les env vars copiés

---

## 🎯 Résumé

**Problème** : Yarn cherche `start` dans package.json racine
**Solution** : Forcer NPM + Root Directory correct
**Durée** : 5 min configuration + 3 min build

---

**Allez corriger dans Render maintenant !** 🚀

Une fois le déploiement réussi, vous aurez votre backend API en production ! 💪
