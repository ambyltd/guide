# 🔥 Guide de Configuration Firebase - Résolution du Problème

## ❌ Problème Actuel
```
Error: Firebase: Error (auth/api-key-not-valid.-please-pass-a-valid-api-key.)
```

La clé API `AIzaSyAWlPL4AOQYx59-cvXssikVouXCw4ryCXc` n'est pas valide ou a été révoquée.

## ✅ Solution 1 : Vérifier et Mettre à Jour la Clé API (Recommandé)

### Étape 1 : Accéder à Firebase Console
1. Ouvrez https://console.firebase.google.com/
2. Connectez-vous avec votre compte Google
3. Sélectionnez le projet **ambyl-fr**

### Étape 2 : Obtenir la Nouvelle Clé API
1. Cliquez sur l'icône **⚙️ (Paramètres)** en haut à gauche
2. Sélectionnez **Paramètres du projet** / **Project Settings**
3. Dans l'onglet **Général** / **General**
4. Trouvez la section **Vos applications** / **Your apps**
5. Cliquez sur l'application Web (icône `</>`)
6. **Copiez la nouvelle clé API Key**

### Étape 3 : Autoriser les Domaines Localhost
1. Dans Firebase Console, allez dans **Authentication**
2. Cliquez sur l'onglet **Settings** (en haut)
3. Descendez jusqu'à **Authorized domains**
4. **Ajoutez ces domaines** :
   - `localhost`
   - `127.0.0.1`
   - `192.168.1.9` (votre IP locale si vous testez sur device)
5. Cliquez sur **Add domain** / **Ajouter un domaine**

### Étape 4 : Mettre à Jour le Fichier .env
Ouvrez le fichier `.env` et remplacez la clé :

```env
# Ancienne clé (invalide)
# VITE_FIREBASE_API_KEY=AIzaSyAWlPL4AOQYx59-cvXssikVouXCw4ryCXc

# Nouvelle clé (à récupérer depuis Firebase Console)
VITE_FIREBASE_API_KEY=VOTRE_NOUVELLE_CLE_ICI
```

### Étape 5 : Redémarrer le Serveur
```powershell
# Arrêter le serveur (Ctrl+C)
# Puis relancer
npm run dev
```

### Étape 6 : Tester
1. Ouvrez http://localhost:8100
2. Essayez de vous connecter avec Google
3. ✅ La connexion devrait fonctionner !

---

## ✅ Solution 2 : Créer un Nouveau Projet Firebase

Si vous n'avez plus accès au projet **ambyl-fr**, créez un nouveau projet :

### Étape 1 : Créer un Nouveau Projet
1. Allez sur https://console.firebase.google.com/
2. Cliquez sur **Ajouter un projet** / **Add project**
3. Nom du projet : `audioguide-ci` (ou autre)
4. Activez Google Analytics (optionnel)
5. Cliquez sur **Créer le projet**

### Étape 2 : Activer Authentication
1. Dans le menu latéral, cliquez sur **Authentication**
2. Cliquez sur **Commencer** / **Get started**
3. Dans l'onglet **Sign-in method**
4. Activez **Google** :
   - Cliquez sur Google
   - Activez le bouton
   - Entrez un email de support (ex: `ambyltd@gmail.com`)
   - Cliquez sur **Save**
5. Activez **Email/Password** :
   - Cliquez sur Email/Password
   - Activez le premier bouton (Email/Password)
   - Cliquez sur **Save**

### Étape 3 : Créer une Application Web
1. Dans **Paramètres du projet** (⚙️)
2. Descendez jusqu'à **Vos applications**
3. Cliquez sur l'icône Web `</>`
4. Nom de l'app : `AudioGuide Web`
5. **NE PAS** cocher "Firebase Hosting"
6. Cliquez sur **Enregistrer l'application**
7. **Copiez toutes les valeurs de configuration** :

```javascript
const firebaseConfig = {
  apiKey: "AIza...",
  authDomain: "audioguide-ci.firebaseapp.com",
  projectId: "audioguide-ci",
  storageBucket: "audioguide-ci.firebasestorage.app",
  messagingSenderId: "123456789",
  appId: "1:123456789:web:abc123"
};
```

### Étape 4 : Autoriser les Domaines
1. **Authentication** → **Settings** → **Authorized domains**
2. Ajoutez :
   - `localhost`
   - `127.0.0.1`
   - Votre domaine de production (ex: `audioguide-ci.netlify.app`)

### Étape 5 : Mettre à Jour .env
```env
VITE_FIREBASE_API_KEY=AIza... (nouvelle clé)
VITE_FIREBASE_AUTH_DOMAIN=audioguide-ci.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=audioguide-ci
VITE_FIREBASE_STORAGE_BUCKET=audioguide-ci.firebasestorage.app
VITE_FIREBASE_MESSAGING_SENDER_ID=123456789
VITE_FIREBASE_APP_ID=1:123456789:web:abc123
```

### Étape 6 : Redémarrer et Tester
```powershell
npm run dev
```

---

## 🔍 Vérification de la Configuration

### Test 1 : Vérifier que les Variables sont Chargées
Ouvrez la console du navigateur (F12) et tapez :
```javascript
console.log(import.meta.env.VITE_FIREBASE_API_KEY);
```
✅ Devrait afficher la nouvelle clé (pas undefined)

### Test 2 : Tester la Connexion Google
1. Cliquez sur le bouton "Google" sur la page de login
2. Une popup Google devrait s'ouvrir
3. Sélectionnez votre compte Google
4. ✅ Vous devriez être redirigé vers `/tabs/home`

### Test 3 : Vérifier le Token
```javascript
console.log(localStorage.getItem('authToken'));
```
✅ Devrait afficher un long token JWT

---

## ⚠️ Problèmes Courants

### Erreur : "auth/unauthorized-domain"
**Solution** : Ajoutez `localhost` dans **Authorized domains**

### Erreur : "auth/popup-blocked"
**Solution** : Autorisez les popups dans votre navigateur pour localhost

### Erreur : "CORS error"
**Solution** : 
1. Vérifiez que vous accédez via `http://localhost:8100` (pas `http://127.0.0.1`)
2. Ajoutez les deux domaines (`localhost` et `127.0.0.1`) dans Firebase

### Les Variables d'Environnement Ne Sont Pas Chargées
**Solution** :
1. Vérifiez que le fichier s'appelle exactement `.env` (pas `.env.local`)
2. Les variables doivent commencer par `VITE_`
3. Redémarrez le serveur après modification du `.env`

---

## 📝 Checklist de Vérification

- [ ] Clé API Firebase mise à jour dans `.env`
- [ ] Domaines autorisés configurés (localhost, 127.0.0.1)
- [ ] Google Auth activé dans Firebase Console
- [ ] Email/Password activé dans Firebase Console
- [ ] Serveur redémarré après modification du `.env`
- [ ] Popups autorisées dans le navigateur
- [ ] Cache du navigateur vidé (Ctrl+Shift+R)

---

## 🆘 Besoin d'Aide ?

Si le problème persiste :
1. Vérifiez les logs de la console Firebase (Authentication → Usage)
2. Consultez la documentation : https://firebase.google.com/docs/auth/web/start
3. Contactez le support Firebase

---

**Dernière mise à jour** : 24 octobre 2025
