# 🚀 Démarrage Rapide - AudioGuide Côte d'Ivoire

**Version**: 1.0.0  
**Date**: 7 octobre 2025  
**Statut**: ✅ Prêt pour développement

---

## ⚡ Démarrage en 3 Minutes

### Option 1: Script Automatique (Recommandé)

#### Windows PowerShell
```powershell
cd C:\Users\jpama\Desktop\i\audioguide
.\start.ps1
```

#### Linux/Mac Bash
```bash
cd /path/to/audioguide
chmod +x start.sh
./start.sh
```

### Option 2: Manuel

#### Terminal 1 - Backend API
```bash
cd backend-api
npm install          # Première fois seulement
npm run dev          # http://localhost:5000
```

#### Terminal 2 - Application Ionic
```bash
cd ionic-app
npm install          # Première fois seulement
npm run dev          # http://localhost:8100
```

#### Terminal 3 (Optionnel) - CMS Web
```bash
cd cms-web
npm install          # Première fois seulement
npm start            # http://localhost:3000
```

---

## 📱 Accès aux Applications

### Backend API
- **URL**: http://localhost:5000
- **Health Check**: http://localhost:5000/health
- **API Docs**: http://localhost:5000/api
- **Endpoints**: 41 routes disponibles

### Application Mobile (Ionic)
- **URL**: http://localhost:8100
- **Pages disponibles**:
  - `/login` - Connexion
  - `/register` - Inscription
  - `/reset-password` - Réinitialisation MDP
  - `/audioguides` - Liste des audioguides
  - `/home` - Accueil (à créer)

### CMS Web (Admin)
- **URL**: http://localhost:3000
- **Pages disponibles**:
  - `/dashboard` - Tableau de bord
  - `/attractions` - Gestion attractions
  - `/audioguides` - Gestion audioguides (à finaliser)
  - `/tours` - Gestion circuits (à finaliser)
  - `/users` - Gestion utilisateurs (à finaliser)

---

## 🔑 Comptes de Test

### Firebase Auth (Mobile App)
```
Email: test@audioguide.ci
Password: Test123!
```

### Admin CMS
```
Email: admin@audioguide.ci
Password: Admin123!
```

---

## ✅ Vérifications Rapides

### Backend API
```bash
# Test health
curl http://localhost:5000/health

# Test audioguides
curl http://localhost:5000/api/audioguides
```

### Application Ionic
1. Ouvrir http://localhost:8100
2. Naviguer vers `/audioguides`
3. Vérifier que la liste charge

### CMS Web
1. Ouvrir http://localhost:3000
2. Connexion avec compte admin
3. Vérifier dashboard

---

## 🐛 Problèmes Courants

### Port déjà utilisé

**Backend (5000)**:
```bash
# Windows
netstat -ano | findstr :5000
taskkill /PID <PID> /F

# Linux/Mac
lsof -i :5000
kill -9 <PID>
```

**Ionic (8100)**:
```bash
# Windows
netstat -ano | findstr :8100
taskkill /PID <PID> /F

# Linux/Mac
lsof -i :8100
kill -9 <PID>
```

### Module non trouvé
```bash
# Supprimer node_modules et réinstaller
rm -rf node_modules package-lock.json
npm install
```

### Backend ne démarre pas
```bash
# Vérifier MongoDB Atlas
# Vérifier .env
# Vérifier variables Firebase
```

### Ionic erreur de compilation
```bash
# Nettoyer le cache
rm -rf node_modules/.cache
npm run dev
```

---

## 📚 Documentation

### Guides Complets
- **Backend**: `backend-api/API_DOCUMENTATION.md`
- **CMS Web**: `cms-web/RAPPORT_CMS_V2.md`
- **Ionic App**: `ionic-app/CONFIG_COMPLETE.md`
- **Statut Projet**: `STATUT_FINAL.md`

### Guides Rapides
- **Installation**: `REGISTRATION_GUIDE.md`
- **Tests Ionic**: `ionic-app/GUIDE_TEST.md`
- **Configuration Ionic**: `ionic-app/RAPPORT_CONFIG_FINAL.md`

---

## 🎯 Prochaines Étapes

### Pour Développer (Ionic App)
1. Créer page Home
2. Intégrer carte Mapbox
3. Ajouter géolocalisation GPS
4. Créer page Profil
5. Système de favoris

### Pour Tester
1. Tester authentification
2. Tester audioguides
3. Tester téléchargement offline
4. Tester lecteur audio

### Pour Déployer
1. Build production
2. Configurer Render (backend)
3. Configurer Netlify (CMS)
4. Build Capacitor (mobile)

---

## 📊 État du Projet

### ✅ Terminé (Production Ready)
- Backend API (41 endpoints)
- CMS Web (Dashboard, Attractions)
- Configuration Ionic (Auth, AudioGuides)
- Documentation complète

### 🟡 En Cours
- Ionic App (Pages restantes)
- Intégration GPS/Mapbox
- Tests E2E

### ⏳ À Faire
- Déploiement production
- Build mobile natif
- Publication App Store/Play Store

---

## 🆘 Support

### Logs
```bash
# Backend
cd backend-api
npm run dev    # Logs dans terminal

# Ionic
cd ionic-app
npm run dev    # Logs dans terminal
```

### DevTools (Browser)
- Console: F12 → Console
- Network: F12 → Network
- Application: F12 → Application (localStorage)

### Contact
- Documentation interne dans chaque dossier
- Rapports techniques disponibles

---

**Bon développement ! 🚀**

*Dernière mise à jour: 7 octobre 2025*
