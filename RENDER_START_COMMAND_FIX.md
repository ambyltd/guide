# 🚨 FIX URGENT - Start Command Erreur

## ❌ Erreur Actuelle
```
> audioguide-cote-ivoire@1.0.0 start
> echo 'Use npm start in backend-api, cms-web, or ionic-app-v2' && exit 1
```

## 🎯 Cause
Render exécute `npm start` à la **racine** au lieu de dans `backend-api/`.

## ✅ SOLUTION IMMÉDIATE (1 MINUTE)

### **Dashboard Render → Settings → Build & Deploy**

Modifier **UNIQUEMENT** le Start Command :

```yaml
Root Directory:  backend-api
Build Command:   npm install && npm run build
Start Command:   cd /opt/render/project/src/backend-api && npm start
```

**OU PLUS SIMPLE** :

```yaml
Root Directory:  backend-api
Build Command:   npm install && npm run build
Start Command:   node dist/index.js
```

⭐ **RECOMMANDÉ** : Utilisez `node dist/index.js` directement (pas besoin de npm start).

---

## 📋 Configuration Finale Complète

### **Build & Deploy Section**

| Setting | Valeur |
|---------|--------|
| **Root Directory** | `backend-api` |
| **Build Command** | `npm install && npm run build` |
| **Start Command** | `node dist/index.js` |

### **Environment Variables**

Toutes les variables doivent déjà être là. Vérifier :

```
NODE_ENV=production
PORT=5000
NPM_CONFIG_PRODUCTION=false
MONGODB_URI=mongodb+srv://...
FIREBASE_PROJECT_ID=ambyl-fr
FIREBASE_CLIENT_EMAIL=firebase-adminsdk-vmgdb@...
FIREBASE_PRIVATE_KEY=-----BEGIN PRIVATE KEY-----...
MAPBOX_ACCESS_TOKEN=pk.eyJ1...
JWT_SECRET=a8f3b7c2e9d4f6a1b8c5e2f9d3a6b4c7e1f8a5b2c9d6e3f7a4b1c8e5f2a9b6c3
JWT_EXPIRES_IN=7d
MAX_FILE_SIZE=10485760
UPLOAD_PATH=./uploads
FRONTEND_URL=http://localhost:3000
MOBILE_APP_URL=exp://localhost:19000
```

---

## 🎯 Actions Immédiates

### **Étape 1** : Dashboard Render
Aller sur : https://dashboard.render.com/web/YOUR-SERVICE-ID/settings

### **Étape 2** : Modifier Start Command
Changer en : `node dist/index.js`

### **Étape 3** : Save Changes
Click en bas de page

### **Étape 4** : Manual Deploy
Click en haut à droite → "Deploy latest commit"

---

## ✅ Résultat Attendu

Logs doivent montrer :
```
==> Running 'node dist/index.js'
Server listening on port 5000
MongoDB connected: ambyl
Firebase Admin initialized
✓ Health check endpoint: /api/health
```

---

## 🔧 Alternative : Modifier package.json Racine

Si vous préférez garder `npm start`, on peut aussi modifier le package.json racine :

```json
{
  "scripts": {
    "start": "cd backend-api && npm start"
  }
}
```

Mais la solution `node dist/index.js` est **plus simple et directe**.

---

## 📊 Pourquoi Ce Problème ?

1. Render a bien utilisé `Root Directory: backend-api`
2. Build s'est fait dans `backend-api/` ✅
3. Mais au démarrage, Render remonte à la racine
4. Et exécute `npm start` qui trouve le package.json racine
5. Ce package.json a un script start qui fait juste echo + exit 1

**Solution** : Utiliser `node dist/index.js` directement (pas de npm start).

---

## 🚀 FAITES ÇA MAINTENANT

1. Dashboard Render
2. Settings → Build & Deploy
3. Start Command → `node dist/index.js`
4. Save Changes
5. Manual Deploy

**Temps : 1 minute** ⏱️

---

## 🧪 Test Après Succès

```bash
curl https://VOTRE-URL.onrender.com/api/health
```

Doit retourner :
```json
{
  "status": "ok",
  "mongodb": "connected",
  "database": "ambyl",
  "firebase": "initialized"
}
```

---

**C'EST LA DERNIÈRE CORRECTION !** 💪

Une fois fait, votre backend sera en production ! 🎉
