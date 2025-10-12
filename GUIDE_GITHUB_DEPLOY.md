# 🚀 Guide : Pousser votre projet sur GitHub

## ✅ Étape 1 : Créer le repo sur GitHub (2 minutes)

### **1.1 Aller sur GitHub**
```
https://github.com/new
```

### **1.2 Remplir le formulaire**
- **Repository name** : `audioguide-cote-ivoire`
- **Description** : `Application de découverte audio guide de la Côte d'Ivoire avec CMS admin et app mobile`
- **Visibility** : 
  - ✅ **Public** (recommandé pour portfolio)
  - ou **Private** (si confidentiel)
- **Initialize** : 
  - ❌ **NE PAS cocher** "Add a README file"
  - ❌ **NE PAS ajouter** .gitignore
  - ❌ **NE PAS ajouter** license

### **1.3 Cliquer "Create repository"**

GitHub vous donnera une URL :
```
https://github.com/VOTRE_USERNAME/audioguide-cote-ivoire.git
```

---

## ✅ Étape 2 : Préparer le projet local (1 minute)

### **2.1 Créer .gitignore (si n'existe pas)**

Vérifier si `.gitignore` existe :
```powershell
Test-Path .gitignore
```

Si **False**, créer le fichier (déjà fait ci-dessous).

### **2.2 Vérifier fichiers sensibles**

**NE JAMAIS COMMIT** :
- ❌ `backend-api/src/config/firebase-service-account.json`
- ❌ `backend-api/.env`
- ❌ `cms-web/.env`
- ❌ `node_modules/`
- ❌ `dist/`
- ❌ `build/`

---

## ✅ Étape 3 : Configurer Git local (30 secondes)

```powershell
# Vérifier votre identité Git
git config user.name
git config user.email

# Si vide, configurer :
git config --global user.name "Votre Nom"
git config --global user.email "votre.email@example.com"
```

---

## ✅ Étape 4 : Ajouter les fichiers (1 minute)

```powershell
# Voir les fichiers modifiés
git status

# Ajouter TOUS les fichiers (sauf .gitignore)
git add .

# Vérifier ce qui sera commité
git status
```

**Résultat attendu** :
```
Changes to be committed:
  (use "git restore --staged <file>..." to unstage)
        new file:   SPRINT5_ADMIN_PANEL.md
        new file:   SPRINT5_RAPPORT_FINAL.json
        new file:   SPRINT5_VALIDATION_GUIDE.md
        new file:   backend-api/src/models/FeatureFlag.ts
        new file:   backend-api/src/controllers/adminController.ts
        ...
        (50+ fichiers)
```

---

## ✅ Étape 5 : Commit (30 secondes)

```powershell
git commit -m "feat: Sprint 5 - CMS Admin Panel & Feature Management

- Backend: 11 endpoints admin + 3 publics (825 lignes)
- CMS: Analytics dashboard + Features management (1580 lignes)
- Mobile: Service cache + hooks React (430 lignes)
- Tests: Script automatisé + documentation (1680 lignes)
- Total: 18 fichiers, 3395+ lignes

10 feature flags créés (7 enabled, 3 disabled)
Build backend 0 erreurs, CMS warnings mineurs
"
```

---

## ✅ Étape 6 : Lier au repo GitHub (30 secondes)

```powershell
# Ajouter le remote (REMPLACER par VOTRE URL)
git remote add origin https://github.com/VOTRE_USERNAME/audioguide-cote-ivoire.git

# Vérifier
git remote -v
```

**Résultat** :
```
origin  https://github.com/VOTRE_USERNAME/audioguide-cote-ivoire.git (fetch)
origin  https://github.com/VOTRE_USERNAME/audioguide-cote-ivoire.git (push)
```

---

## ✅ Étape 7 : Pousser sur GitHub (1 minute)

```powershell
# Renommer la branche en 'main' (si master)
git branch -M main

# Push initial
git push -u origin main
```

**Première fois** : GitHub demandera authentification :
- **Option 1** : Personal Access Token (recommandé)
- **Option 2** : GitHub Desktop
- **Option 3** : SSH key

---

## 🔐 Authentification GitHub (si demandée)

### **Option 1 : Personal Access Token** ⭐ Recommandé

1. Aller sur : https://github.com/settings/tokens
2. **Generate new token** → **Classic**
3. **Note** : "Audioguide Deploy"
4. **Expiration** : 90 days (ou No expiration)
5. **Scopes** : 
   - ✅ `repo` (full control)
   - ✅ `workflow` (si CI/CD)
6. **Generate token**
7. **COPIER** le token (affiché 1 seule fois !)

**Utilisation** :
```powershell
git push -u origin main
# Username: VOTRE_USERNAME
# Password: COLLER_LE_TOKEN (pas votre mot de passe !)
```

### **Option 2 : GitHub Desktop** (Plus simple)

1. Télécharger : https://desktop.github.com
2. Installer et login
3. File → Add Local Repository → Sélectionner `audioguide`
4. Publish repository → Push origin

---

## ✅ Étape 8 : Vérifier sur GitHub (30 secondes)

Aller sur :
```
https://github.com/VOTRE_USERNAME/audioguide-cote-ivoire
```

**Vérifications** :
- [ ] README.md visible
- [ ] 18 fichiers Sprint 5 visibles
- [ ] .gitignore présent
- [ ] Pas de fichiers sensibles (firebase-service-account.json, .env)

---

## 🎯 Commandes Git Futures

### **Commit régulier**
```powershell
git add .
git commit -m "fix: correction bug XYZ"
git push
```

### **Créer une branche**
```powershell
git checkout -b feature/sprint6
git push -u origin feature/sprint6
```

### **Voir l'historique**
```powershell
git log --oneline --graph --all
```

---

## 🚨 Troubleshooting

### **Problème : "fatal: remote origin already exists"**
```powershell
git remote remove origin
git remote add origin https://github.com/VOTRE_USERNAME/audioguide-cote-ivoire.git
```

### **Problème : "Permission denied (publickey)"**
→ Utiliser Personal Access Token (voir ci-dessus)

### **Problème : "fatal: refusing to merge unrelated histories"**
```powershell
git pull origin main --allow-unrelated-histories
git push -u origin main
```

### **Problème : Fichiers sensibles déjà commités**

```powershell
# Retirer du Git (garde le fichier local)
git rm --cached backend-api/src/config/firebase-service-account.json

# Ajouter au .gitignore
echo "backend-api/src/config/firebase-service-account.json" >> .gitignore

# Commit
git commit -m "chore: remove sensitive files"
git push
```

---

## 📝 .gitignore Recommandé

Le fichier `.gitignore` a déjà été créé avec les exclusions nécessaires.

**Inclut** :
- node_modules/
- dist/, build/
- .env files
- Firebase service account
- Logs
- OS files (.DS_Store, Thumbs.db)

---

## ✅ Checklist Complète

- [ ] Repo créé sur GitHub
- [ ] .gitignore créé
- [ ] Git config (name, email) défini
- [ ] `git add .` exécuté
- [ ] `git commit` avec message descriptif
- [ ] Remote origin ajouté
- [ ] `git push -u origin main` réussi
- [ ] Repo visible sur GitHub
- [ ] Pas de fichiers sensibles visibles
- [ ] README.md lisible

---

## 🎉 Après le Push

### **1. Ajouter un README.md riche**

Votre README actuel est basique. Créez un README complet :
- Description du projet
- Screenshots
- Technologies utilisées
- Instructions installation
- Architecture
- Roadmap

### **2. Configurer GitHub Actions (CI/CD)**

```yaml
# .github/workflows/ci.yml
name: CI
on: [push, pull_request]
jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
      - run: cd backend-api && npm install
      - run: cd backend-api && npm run build
```

### **3. Connecter à Render.com**

Une fois sur GitHub :
1. Dashboard Render → New Web Service
2. Connect repository → Sélectionner `audioguide-cote-ivoire`
3. Auto-deploy activé ✅

---

**Besoin d'aide pour une étape spécifique ?** 🚀
