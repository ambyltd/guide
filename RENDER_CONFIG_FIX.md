# 🚀 Configuration Render.com - Backend API

## 📋 Configuration du Service Render

### **Dans le Dashboard Render :**

1. **Service Settings** :
   - Name : `audioguide-backend`
   - Environment : `Node`
   - Region : `Frankfurt (EU Central)` ou le plus proche
   - Branch : `main`
   
2. **Build & Deploy Settings** :
   ```yaml
   Root Directory: backend-api
   Build Command: npm install && npm run build
   Start Command: npm start
   ```

3. **Environment Variables** (à ajouter dans Render Dashboard) :

```bash
# MongoDB
MONGODB_URI=mongodb+srv://ambyltd_db_user:CjQOR7FBM0W4FXRK@ambyl.nlafa4d.mongodb.net/ambyl?retryWrites=true&w=majority&ssl=true&authSource=admin

# Node Environment
NODE_ENV=production
PORT=5000

# Firebase Admin SDK
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

# Upload/Storage
MAX_FILE_SIZE=10485760
UPLOAD_PATH=./uploads

# CORS Origins (à modifier après déploiement CMS)
FRONTEND_URL=http://localhost:3000
MOBILE_APP_URL=exp://localhost:19000
```

---

## ⚠️ **IMPORTANT : Problème Actuel**

Le déploiement échoue avec :
```
Error: Cannot find module '/opt/render/project/src/backend-api/dist/index.js'
```

**Raison** : Render cherche dans un mauvais chemin.

---

## ✅ **Solutions**

### **Solution 1 : Vérifier Root Directory dans Render Dashboard** ⭐ RECOMMANDÉ

1. Aller sur Render Dashboard : https://dashboard.render.com
2. Sélectionner votre service `audioguide-backend`
3. Settings → Build & Deploy
4. **Root Directory** : Doit être exactement `backend-api` (pas `./backend-api` ni `/backend-api`)
5. **Build Command** : `npm install && npm run build`
6. **Start Command** : `npm start`
7. Sauvegarder → Manual Deploy → Deploy latest commit

### **Solution 2 : Créer render.yaml** (Configuration automatique)

Créer le fichier `render.yaml` à la racine du repo avec cette configuration :

```yaml
services:
  - type: web
    name: audioguide-backend
    env: node
    region: frankfurt
    plan: free
    buildCommand: cd backend-api && npm install && npm run build
    startCommand: cd backend-api && npm start
    envVars:
      - key: NODE_ENV
        value: production
      - key: PORT
        value: 5000
      - key: MONGODB_URI
        sync: false
      - key: FIREBASE_PROJECT_ID
        sync: false
      - key: FIREBASE_CLIENT_EMAIL
        sync: false
      - key: FIREBASE_PRIVATE_KEY
        sync: false
      - key: MAPBOX_ACCESS_TOKEN
        sync: false
      - key: JWT_SECRET
        sync: false
```

---

## 🔧 **Étapes de Correction Render**

### **Étape 1 : Corriger la Configuration** (2 min)

1. Dashboard Render → Votre service
2. **Settings**
3. **Build & Deploy** :
   - Root Directory : `backend-api`
   - Build Command : `npm install && npm run build`
   - Start Command : `npm start`
4. **Save Changes**

### **Étape 2 : Redéployer** (1 min)

1. **Manual Deploy** (en haut à droite)
2. **Deploy latest commit**
3. Attendre 3-5 minutes

### **Étape 3 : Vérifier les Logs** (1 min)

Surveiller les logs pour voir :
```
✓ npm install completed
✓ npm run build completed
✓ tsc compilation successful
✓ dist/ folder created
✓ Starting server with npm start
✓ Server listening on port 5000
✓ MongoDB connected successfully
```

---

## 🧪 **Tests Après Déploiement**

Une fois le service déployé avec succès, tester :

```bash
# Récupérer l'URL Render (ex: https://audioguide-backend.onrender.com)

# 1. Health check
curl https://VOTRE-URL.onrender.com/api/health

# 2. Features publics
curl https://VOTRE-URL.onrender.com/api/features

# 3. Attractions
curl https://VOTRE-URL.onrender.com/api/attractions

# 4. Audio guides
curl https://VOTRE-URL.onrender.com/api/audio-guides
```

**Réponses attendues** :
- `/api/health` : `{"status":"ok","mongodb":"connected",...}`
- `/api/features` : Array de 7 feature flags enabled
- `/api/attractions` : Array de 15 attractions
- `/api/audio-guides` : Array de 10+ audioguides

---

## 🚨 **Troubleshooting**

### **Problème 1 : "Cannot find module"**
✅ **Solution** : Root Directory = `backend-api` (pas de `/` ou `./`)

### **Problème 2 : "MongoDB connection failed"**
✅ **Solution** : Vérifier MONGODB_URI dans Environment Variables

### **Problème 3 : "Firebase error"**
✅ **Solution** : Vérifier FIREBASE_PRIVATE_KEY (doit inclure `\n` pour les retours à la ligne)

### **Problème 4 : "Port already in use"**
✅ **Solution** : Render utilise automatiquement process.env.PORT (déjà géré dans le code)

---

## 📊 **Métriques de Succès**

| Métrique | Cible | Vérification |
|----------|-------|--------------|
| **Build Time** | < 3 min | Logs Render |
| **Start Time** | < 30s | Logs "Server listening" |
| **Health Check** | 200 OK | `curl /api/health` |
| **MongoDB** | Connected | Health check response |
| **Endpoints** | 20+ actifs | Test API |
| **CORS** | Configured | Headers response |

---

## 🎯 **Prochaines Étapes Après Correction**

1. ✅ Corriger Root Directory dans Render
2. ✅ Redéployer
3. ✅ Tester les endpoints
4. ✅ Mettre à jour CMS avec URL production
5. ✅ Mettre à jour mobile app avec URL production
6. ✅ Seed production data (optionnel)

---

## 📝 **Notes Importantes**

- **Free Tier Render** : Service s'endort après 15 min d'inactivité (1er appel prend ~30s)
- **MongoDB Atlas** : Whitelist IP `0.0.0.0/0` pour autoriser Render
- **Firebase** : Pas besoin de fichier JSON, les env vars suffisent
- **CORS** : Mettre à jour FRONTEND_URL après déploiement CMS

---

**Besoin d'aide pour corriger dans le Dashboard Render ?** 🚀
