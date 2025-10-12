# 🚂 Guide de Déploiement Backend sur Railway.app

## Étape 1 : Créer MongoDB Atlas (5 minutes)

### 1.1 Inscription MongoDB Atlas
1. Va sur https://www.mongodb.com/cloud/atlas/register
2. Inscris-toi (gratuit)
3. Clique sur **"Build a Database"** → **M0 FREE** (tier gratuit)
4. Choisis **AWS** → **Europe (Paris)** ou **Europe (Frankfurt)**
5. Nom du cluster : `audioguide-cluster`
6. Clique **"Create Cluster"** (attends 3-5 minutes)

### 1.2 Créer un Utilisateur Database
1. Va dans **Database Access** (menu gauche)
2. Clique **"Add New Database User"**
3. Username: `audioguide-admin`
4. Password: **(génère un mot de passe fort et NOTE-LE !)**
5. Database User Privileges: **"Atlas admin"**
6. Clique **"Add User"**

### 1.3 Autoriser les Connexions Réseau
1. Va dans **Network Access** (menu gauche)
2. Clique **"Add IP Address"**
3. Clique **"Allow Access from Anywhere"** → `0.0.0.0/0`
4. Clique **"Confirm"**

### 1.4 Récupérer l'URL de Connexion
1. Retourne dans **Database** (menu gauche)
2. Clique **"Connect"** sur ton cluster
3. Choisis **"Connect your application"**
4. Driver: **Node.js** / Version: **4.0 or later**
5. Copie la **Connection String** (exemple) :
   ```
   mongodb+srv://audioguide-admin:<password>@audioguide-cluster.xxxxx.mongodb.net/?retryWrites=true&w=majority
   ```
6. **REMPLACE `<password>` par ton vrai mot de passe !**
7. **AJOUTE le nom de la base de données** à la fin :
   ```
   mongodb+srv://audioguide-admin:TON_MOT_DE_PASSE@audioguide-cluster.xxxxx.mongodb.net/audioguide-ci?retryWrites=true&w=majority
   ```

---

## Étape 2 : Déployer sur Railway.app (10 minutes)

### 2.1 Inscription Railway
1. Va sur https://railway.app
2. Clique **"Login"** → **"Login with GitHub"**
3. Autorise Railway à accéder à ton compte GitHub

### 2.2 Créer un Nouveau Projet
1. Dashboard Railway → Clique **"New Project"**
2. Choisis **"Deploy from GitHub repo"**
3. **SI le repo backend-api n'apparaît pas** :
   - Sélectionne **"Empty Project"**
   - On utilisera une autre méthode ci-dessous

### 2.3 Option Alternative : Déploiement Dockerfile
1. Railway Dashboard → **"New Project"** → **"Empty Project"**
2. Dans le projet, clique **"+ New"** → **"GitHub Repo"**
3. OU : Clique **"+ New"** → **"Empty Service"**
4. Clique sur le service créé
5. Va dans **"Settings"** tab
6. **Deploy Method** : Change vers **"Dockerfile"**

### 2.4 Push sur GitHub (Méthode Recommandée)

**Dans PowerShell (depuis `audioguide/backend-api`) :**

```powershell
# Créer un nouveau repo GitHub via CLI (si tu as GitHub CLI installé)
gh repo create audioguide-backend-api --public --source=. --remote=origin --push

# OU : Créer manuellement sur GitHub.com
# 1. Va sur https://github.com/new
# 2. Nom du repo : audioguide-backend-api
# 3. Public ou Private (au choix)
# 4. NE coche PAS "Add a README"
# 5. Clique "Create repository"
# 6. Copie les commandes "push an existing repository" :

git remote add origin https://github.com/TON_USERNAME/audioguide-backend-api.git
git branch -M main
git push -u origin main
```

### 2.5 Connecter Railway au Repo GitHub
1. Railway Dashboard → **"New Project"** → **"Deploy from GitHub repo"**
2. Sélectionne **`audioguide-backend-api`**
3. Railway détectera automatiquement le **Dockerfile**
4. Clique **"Deploy Now"**

### 2.6 Configurer les Variables d'Environnement
1. Dans le projet Railway, clique sur le **service déployé**
2. Va dans l'onglet **"Variables"**
3. Ajoute ces variables (clique **"+ New Variable"**) :

| Variable Name | Value |
|---------------|-------|
| `MONGODB_URI` | `mongodb+srv://audioguide-admin:TON_MOT_DE_PASSE@audioguide-cluster.xxxxx.mongodb.net/audioguide-ci?retryWrites=true&w=majority` |
| `PORT` | `5000` |
| `NODE_ENV` | `production` |

4. Clique **"Deploy"** (redéploiement automatique)

### 2.7 Seed la Base de Données

**Attends que le déploiement soit terminé (2-3 minutes)**

1. Dans Railway, va dans l'onglet **"Settings"**
2. Copie l'**URL publique** (exemple: `https://audioguide-backend-api-production.up.railway.app`)
3. **Option 1 : Via Script Local**

```powershell
# Depuis audioguide/backend-api
# Modifie .env pour pointer vers Railway
echo "MONGODB_URI=mongodb+srv://audioguide-admin:TON_MOT_DE_PASSE@audioguide-cluster.xxxxx.mongodb.net/audioguide-ci?retryWrites=true&w=majority" > .env.production

# Lance le seed
npm run seed-complete
```

4. **Option 2 : Via Railway CLI (si installée)**

```powershell
npm install -g @railway/cli
railway login
railway link
railway run npm run seed-complete
```

---

## Étape 3 : Tester le Backend

### 3.1 Test API avec curl (PowerShell)

```powershell
# Remplace par ton URL Railway
$API_URL = "https://audioguide-backend-api-production.up.railway.app"

# Test health check
curl "$API_URL/api/health"
# Attendu: {"status":"ok","message":"API is running"}

# Test attractions
curl "$API_URL/api/attractions"
# Attendu: [{"_id":"...","name":"Basilique Notre-Dame de la Paix",...}]
```

### 3.2 Test dans l'App Mobile

1. Modifie `ionic-app-v2/.env.production` :
   ```
   VITE_API_URL=https://audioguide-backend-api-production.up.railway.app/api
   ```

2. Rebuild l'app mobile :
   ```powershell
   cd ionic-app-v2
   npm run build
   npx cap sync android
   ```

3. Relance l'app sur Android
4. Les attractions devraient se charger depuis Railway ! 🎉

---

## 🎯 Résumé des URLs

**MongoDB Atlas** :
```
mongodb+srv://audioguide-admin:TON_MOT_DE_PASSE@audioguide-cluster.xxxxx.mongodb.net/audioguide-ci?retryWrites=true&w=majority
```

**Railway Backend** :
```
https://audioguide-backend-api-production.up.railway.app
```

**Endpoints Disponibles** :
- GET `/api/health` - Health check
- GET `/api/attractions` - Liste des attractions
- GET `/api/attractions/:id` - Détail d'une attraction
- GET `/api/audio-guides?attractionId=XXX` - Guides audio
- GET `/api/tours` - Circuits touristiques
- POST `/api/auth/register` - Inscription
- POST `/api/auth/login` - Connexion

---

## 🆘 Troubleshooting

### Erreur : "Cannot connect to MongoDB"
- Vérifie que le mot de passe dans `MONGODB_URI` est correct (pas de `<>`)
- Vérifie que `0.0.0.0/0` est autorisé dans **Network Access**
- Vérifie que l'utilisateur a les permissions **Atlas admin**

### Erreur : "Application failed to start"
- Vérifie les logs dans Railway : Dashboard → Service → **"Logs"** tab
- Vérifie que `MONGODB_URI` est bien défini dans **"Variables"** tab
- Vérifie que le **Dockerfile** est détecté (Settings → Deploy Method = Dockerfile)

### Erreur : "Empty array []" sur `/api/attractions`
- La base de données est vide, il faut la seeder :
  ```powershell
  npm run seed-complete
  ```

---

## 📊 Limites du Tier Gratuit

**MongoDB Atlas M0** :
- 512 MB de stockage
- Connexions partagées
- Régions limitées
- ✅ Suffisant pour le développement !

**Railway Free** :
- 500 heures d'exécution/mois
- 100 GB de bande passante/mois
- 1 GB de RAM
- ✅ Suffisant pour les tests !

---

## 🎉 Prochaines Étapes

Une fois le backend en ligne :
1. ✅ Tester les 4 tabs de l'app mobile
2. ✅ Valider le chargement des attractions depuis Railway
3. ✅ Tester le geofencing Sprint 3 Phase 1
4. ✅ Tester les audioguides et AudioPlayer
5. 🚀 Passer au Sprint 3 Phase 2 (Service Worker offline)
