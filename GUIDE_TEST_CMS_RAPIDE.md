# 🧪 Guide Test Rapide - CMS Dashboard avec Backend Local

**Durée**: 5 minutes  
**Prérequis**: Backend local démarré (localhost:5000)

---

## 🚀 Étape 1: Démarrer le CMS (30 secondes)

```powershell
cd c:\Users\jpama\Desktop\i\audioguide\cms-web
npm start
```

**Attendu**:
- ✅ Compilation React successful
- ✅ Server écoute sur `http://localhost:3000` (ou autre port)
- ✅ Navigateur s'ouvre automatiquement

Si le port 3000 est occupé, React utilisera 3001, 3002, etc.

---

## 🔐 Étape 2: Se Connecter (1 minute)

### Page Login

**URL**: http://localhost:3000 (ou port affiché)

**Credentials Admin**:
```
Email: admin@ambyl.fr
Password: Admin123!
```

**Actions**:
1. Entrer email: `admin@ambyl.fr`
2. Entrer mot de passe: `Admin123!`
3. Cliquer "Se connecter"

**Attendu**:
- ✅ Aucune erreur auth/invalid-credential
- ✅ Redirection vers Dashboard
- ✅ Header affiche "Administrateur" ou email

---

## 📊 Étape 3: Vérifier Dashboard (2 minutes)

### Stats Cards (Haut de page)

**Attendu**:
- ✅ Card "Total Attractions" affiche un nombre (ex: 15)
- ✅ Card "Circuits Touristiques" affiche un nombre (ex: 8)
- ✅ Card "Audio Guides" affiche un nombre (ex: 30+)
- ✅ Card "Utilisateurs" affiche un nombre (ex: 2)

**Si 0 partout**: Backend non connecté ou données manquantes

### Console Browser (F12)

**Vérifier logs**:
```javascript
✅ Réponse API reçue: /attractions
✅ Réponse API reçue: /tours
✅ Réponse API reçue: /audio-guides
✅ Réponse API reçue: /users
```

**Si erreurs**:
- ❌ `GET http://localhost:5000/api/... Failed to fetch`
  → Backend pas démarré, relancer `npm run dev` dans backend-api
  
- ❌ `GET http://localhost:5000/api/users 403 Forbidden`
  → Custom claim 'role: admin' manquant, relancer `npm run create:admin`

---

## 📄 Étape 4: Tester Pages CMS (1 minute)

### Page Attractions

**Navigation**: Sidebar → "Attractions"

**Attendu**:
- ✅ Liste des attractions (ex: Basilique Notre-Dame de la Paix, etc.)
- ✅ Boutons "Modifier" et "Supprimer" visibles
- ✅ Bouton "Ajouter une attraction" en haut

**Actions Test**:
1. Cliquer sur une attraction → Voir détails
2. Essayer "Modifier" → Formulaire s'ouvre
3. Annuler → Retour liste

### Page Circuits Touristiques

**Navigation**: Sidebar → "Circuits Touristiques"

**Attendu**:
- ✅ Liste des tours (ex: Circuit Historique Yamoussoukro, etc.)
- ✅ Nombre d'attractions par tour affiché
- ✅ Boutons actions fonctionnels

### Page Utilisateurs

**Navigation**: Sidebar → "Utilisateurs"

**Attendu**:
- ✅ Au moins 2 utilisateurs (admin@ambyl.fr, ambyltd@gmail.com)
- ✅ Rôles affichés (admin/user)
- ✅ Status actif/inactif

**Si erreur 403**: Custom claims manquants, voir section Dépannage

---

## 🧪 Étape 5: Test API HTML (1 minute)

### Ouvrir Fichier Test

```powershell
Start-Process "c:\Users\jpama\Desktop\i\audioguide\backend-api\test-cms-api.html"
```

**Ou**: Double-clic sur `backend-api/test-cms-api.html`

### Tests Endpoints

1. **Connexion**:
   - Email: `admin@ambyl.fr`
   - Password: `Admin123!`
   - Cliquer "Se connecter"
   
   **Attendu**: 
   - ✅ Message "Connexion réussie"
   - ✅ Token affiché (50 premiers caractères)
   - ✅ Rôle: admin

2. **Tester GET /api/users**:
   - Cliquer bouton "Tester GET /api/users"
   
   **Attendu**:
   - ✅ Status 200 OK
   - ✅ Nombre d'utilisateurs: 2
   - ✅ Données JSON affichées

3. **Tester GET /api/attractions**:
   - Cliquer bouton "Tester GET /api/attractions"
   
   **Attendu**:
   - ✅ Status 200 OK
   - ✅ Nombre d'attractions: 15 (ou autre)
   - ✅ Données JSON affichées

---

## 🔧 Dépannage

### Erreur: Backend pas démarré

**Symptôme**: `Failed to fetch` dans console

**Solution**:
```powershell
cd c:\Users\jpama\Desktop\i\audioguide\backend-api
npm run dev
```

**Vérifier**: 
- ✅ Message "Serveur démarré sur le port 5000"
- ✅ "Connecté à MongoDB Atlas"

---

### Erreur: 403 Forbidden sur /api/users

**Symptôme**: Dashboard charge mais page Utilisateurs erreur 403

**Solution**: Custom claims manquants, recréer admin
```powershell
cd c:\Users\jpama\Desktop\i\audioguide\backend-api
npm run create:admin
```

**Puis**: 
1. Se déconnecter du CMS
2. Se reconnecter avec admin@ambyl.fr

---

### Erreur: auth/invalid-credential

**Symptôme**: Login CMS refuse credentials

**Cause**: Utilisateur pas créé ou mot de passe incorrect

**Solution 1**: Vérifier credentials
```
Email: admin@ambyl.fr
Password: Admin123!
```

**Solution 2**: Recréer utilisateur
```powershell
cd backend-api
npm run create:admin
```

---

### Erreur: Stats à 0 dans Dashboard

**Symptôme**: Toutes les cards affichent 0

**Cause**: Base de données vide

**Solution**: Seed données
```powershell
cd backend-api
npm run seed:complete
```

**Attendu**:
- ✅ 15 attractions créées
- ✅ 30+ audio guides créés
- ✅ 8 circuits touristiques créés
- ✅ 10 feature flags créées

**Puis**: Rafraîchir Dashboard CMS (F5)

---

### Erreur: CMS ne démarre pas

**Symptôme**: Erreurs compilation React

**Solution 1**: Réinstaller dépendances
```powershell
cd cms-web
Remove-Item node_modules -Recurse -Force
Remove-Item package-lock.json
npm install
npm start
```

**Solution 2**: Vérifier .env
```bash
# cms-web/.env
REACT_APP_API_URL=http://localhost:5000/api
```

---

## ✅ Checklist Validation

### Backend Local
- [ ] Backend démarré (npm run dev)
- [ ] Port 5000 écoute
- [ ] Firebase Admin SDK initialized
- [ ] MongoDB Atlas connectée

### CMS Web
- [ ] CMS démarré (npm start)
- [ ] Page login accessible
- [ ] Login admin@ambyl.fr successful
- [ ] Dashboard affiche stats > 0
- [ ] Page Attractions charge liste
- [ ] Page Users charge liste (pas 403)

### Fichier Test HTML
- [ ] Fichier ouvert dans navigateur
- [ ] Login Firebase successful
- [ ] Token affiché
- [ ] GET /api/users retourne 200 OK
- [ ] GET /api/attractions retourne 200 OK

---

## 📸 Screenshots Attendus

### Dashboard CMS

```
╔════════════════════════════════════════════════╗
║  Dashboard - Audio Guide Côte d'Ivoire        ║
╠════════════════════════════════════════════════╣
║  [Total Attractions: 15] [Circuits: 8]        ║
║  [Audio Guides: 30]     [Utilisateurs: 2]     ║
║                                                ║
║  Graphique activité...                         ║
║  Liste récente attractions...                  ║
╚════════════════════════════════════════════════╝
```

### Page Utilisateurs

```
╔════════════════════════════════════════════════╗
║  Utilisateurs                                  ║
╠════════════════════════════════════════════════╣
║  admin@ambyl.fr     | Rôle: admin  | Actif    ║
║  ambyltd@gmail.com  | Rôle: admin  | Actif    ║
╚════════════════════════════════════════════════╝
```

### Test HTML

```
╔════════════════════════════════════════════════╗
║  Test Backend API - CMS Dashboard             ║
╠════════════════════════════════════════════════╣
║  ✅ Connecté: admin@ambyl.fr                  ║
║  👤 UID: gFI1dHVmSSMMzt0CtmoZ6WMmnMn1         ║
║  🔑 Rôle: admin                                ║
║  🎫 Token: eyJhbGciOiJSUzI1NiIsImtpZCI6...    ║
║                                                ║
║  [Tester GET /api/users] ✅ SUCCESS (200)     ║
║  Nombre d'utilisateurs: 2                      ║
║  Données reçues: {"success": true, ...}        ║
╚════════════════════════════════════════════════╝
```

---

## 🚀 Prochaines Actions (Après Tests)

### Si Tout Fonctionne ✅

1. **Attendre déploiement Render** (5-10 min)
   - https://dashboard.render.com/
   - Vérifier "Deploy live" dans Events

2. **Tester production**
   ```bash
   curl https://audio-guide-w8ww.onrender.com/api/users
   ```

3. **Mettre à jour CMS .env vers production**
   ```bash
   # cms-web/.env
   REACT_APP_API_URL=https://audio-guide-w8ww.onrender.com/api
   ```

4. **Rebuild + Deploy CMS**
   ```bash
   cd cms-web
   npm run build
   # Deploy vers Netlify
   ```

### Si Problèmes ❌

1. **Vérifier logs backend**
   ```powershell
   # Terminal backend-api (npm run dev)
   # Chercher erreurs rouges
   ```

2. **Vérifier logs CMS**
   ```javascript
   // Console navigateur (F12)
   // Chercher erreurs fetch API
   ```

3. **Consulter rapport**
   - `BACKEND_CMS_CORRECTIONS.md` (section Dépannage)
   - Ou demander assistance

---

## 📞 Support

**Documentation**:
- Rapport complet: `BACKEND_CMS_CORRECTIONS.md`
- Checklist projet: `.github/copilot-instructions.md`

**Logs**:
- Backend: Terminal `npm run dev` dans backend-api
- CMS: Console navigateur (F12) + Terminal npm start
- MongoDB: Logs Atlas sur https://cloud.mongodb.com/

**Credentials Rappel**:
```
admin@ambyl.fr / Admin123!
ambyltd@gmail.com / Ambyl2024!
```

---

**Bonne chance! Le système est prêt pour les tests.** 🎉
