# ⚡ CORRECTION RAPIDE - Déploiement Render ÉCHOUE

## 🚨 Erreur Actuelle
```
Error: Cannot find module '/opt/render/project/src/backend-api/dist/index.js'
```

## 🎯 Solution Immédiate (2 minutes)

### **Dans le Dashboard Render :**

1. **Ouvrir** : https://dashboard.render.com/web/YOUR-SERVICE-ID/settings

2. **Modifier Build & Deploy** :

```yaml
Root Directory: backend-api
Build Command: npm install && npm run build
Start Command: npm start
```

3. **Cliquer "Save Changes"**

4. **Manual Deploy** → **Deploy latest commit**

---

## ✅ Configuration Correcte

| Setting | Valeur Correcte |
|---------|----------------|
| **Name** | audioguide-backend |
| **Environment** | Node |
| **Region** | Frankfurt (EU Central) |
| **Branch** | main |
| **Root Directory** | `backend-api` ⚠️ PAS DE SLASH |
| **Build Command** | `npm install && npm run build` |
| **Start Command** | `npm start` |
| **Auto-Deploy** | Yes |

---

## 🔑 Environment Variables à Ajouter

**Dashboard → Environment**

```bash
NODE_ENV=production
PORT=5000

MONGODB_URI=mongodb+srv://ambyltd_db_user:CjQOR7FBM0W4FXRK@ambyl.nlafa4d.mongodb.net/ambyl?retryWrites=true&w=majority&ssl=true&authSource=admin

FIREBASE_PROJECT_ID=ambyl-fr
FIREBASE_CLIENT_EMAIL=firebase-adminsdk-vmgdb@ambyl-fr.iam.gserviceaccount.com

# ⚠️ FIREBASE_PRIVATE_KEY : Copier TOUT le contenu depuis .env (avec les \n)

MAPBOX_ACCESS_TOKEN=pk.eyJ1IjoiYW1ieWwiLCJhIjoiY21ldjNxemlmMDZhcDJxcjFoZ3M5bDl3ZiJ9.WIO_3CUv2WdJSOm3yrttAw

JWT_SECRET=a8f3b7c2e9d4f6a1b8c5e2f9d3a6b4c7e1f8a5b2c9d6e3f7a4b1c8e5f2a9b6c3
JWT_EXPIRES_IN=7d

MAX_FILE_SIZE=10485760
UPLOAD_PATH=./uploads

FRONTEND_URL=http://localhost:3000
MOBILE_APP_URL=exp://localhost:19000
```

---

## 📋 Checklist de Vérification

Avant de redéployer, vérifier :

- [ ] Root Directory = `backend-api` (exactement, sans `/` ni `./`)
- [ ] Build Command = `npm install && npm run build`
- [ ] Start Command = `npm start`
- [ ] MONGODB_URI ajouté dans Environment Variables
- [ ] FIREBASE_PRIVATE_KEY ajouté (avec `\n` pour les retours ligne)
- [ ] Tous les autres env vars ajoutés

---

## 🚀 Après Redéploiement (3-5 min)

### **Surveiller les Logs**

Doit afficher :
```
✓ Running 'npm install'
✓ Running 'npm run build'
✓ Compiled successfully
✓ Running 'npm start'
✓ Server listening on port 5000
✓ MongoDB connected: ambyl
✓ Firebase Admin initialized
```

### **Tester les Endpoints**

Récupérer l'URL Render (ex: `https://audioguide-backend-xxxx.onrender.com`)

```bash
# Health check
curl https://VOTRE-URL.onrender.com/api/health

# Features (public)
curl https://VOTRE-URL.onrender.com/api/features

# Attractions (public)
curl https://VOTRE-URL.onrender.com/api/attractions
```

---

## 🔧 Si Ça Ne Marche Toujours Pas

### **Vérifier le Build Command**

Dans les logs Render, chercher :
```
==> Cloning from https://github.com/ambyltd/guide...
==> Checking out commit XXXXXXX in branch main
```

Si vous voyez `cd backend-api`, c'est bon.

### **Vérifier le package.json**

```bash
# Localement
cd backend-api
npm run build
ls -la dist/
```

Doit montrer `dist/index.js` créé.

---

## 📞 Alternative : Déployer avec GitHub Actions

Si Render continue d'échouer, on peut déployer via :
- Railway.app
- Fly.io
- Heroku (payant)
- DigitalOcean App Platform

**Voulez-vous essayer une alternative ?**

---

## 🎯 Résumé

**Problème** : Root Directory mal configuré
**Solution** : Mettre exactement `backend-api`
**Durée** : 2 min configuration + 3 min build

**L'erreur est dans le Dashboard Render, pas dans le code !** ✅
