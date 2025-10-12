# Page d'Enregistrement - Audio Guide Côte d'Ivoire

## 🎯 Description

Cette page d'enregistrement permet aux utilisateurs de créer un compte dans l'application Audio Guide Côte d'Ivoire. Elle intègre **Firebase Authentication** pour la gestion des utilisateurs et se connecte au **backend API** pour sauvegarder les informations utilisateur.

## 🔧 Architecture

### Frontend (Ionic/React)
- **Page**: `src/pages/RegistrationPage.tsx`
- **Styles**: `src/pages/RegistrationPage.css`
- **Service Auth**: `src/services/authService.ts` (étendu pour le backend)
- **API Client**: `src/services/apiClient.ts` (configuré pour les appels REST)

### Backend (Express/MongoDB)
- **Route**: `POST /auth/register`
- **Contrôleur**: `src/controllers/authController.ts`
- **Modèle**: `src/models/User.ts`

## 🚀 Fonctionnalités

### ✅ Authentification Firebase
- Création d'un compte Firebase avec email/mot de passe
- Mise à jour du profil utilisateur (displayName)
- Gestion des erreurs Firebase (email déjà utilisé, mot de passe faible, etc.)

### ✅ Enregistrement Backend
- Sauvegarde des informations utilisateur dans MongoDB
- Association du `firebaseUid` avec l'utilisateur backend
- Génération et sauvegarde d'un token JWT

### ✅ Interface Utilisateur
- **Champs obligatoires**: Email, mot de passe, confirmation, nom d'affichage
- **Champs optionnels**: Prénom, nom, téléphone, nationalité
- **Préférences**: Langue (français/anglais)
- **Validation**: Vérification des formats et correspondances
- **États**: Loading, erreurs, succès

### ✅ Gestion d'État
- Mise à jour du store Redux avec les informations utilisateur
- Navigation automatique vers l'application après inscription
- Sauvegarde du token d'authentification

## 📋 Flux d'Inscription

```mermaid
sequenceDiagram
    participant U as Utilisateur
    participant F as Frontend
    participant FB as Firebase Auth
    participant API as Backend API
    participant DB as MongoDB

    U->>F: Remplit le formulaire
    F->>F: Validation côté client
    F->>FB: createUserWithEmailAndPassword()
    FB-->>F: UserCredential
    F->>FB: updateProfile()
    F->>API: POST /auth/register
    API->>DB: Sauvegarde utilisateur
    DB-->>API: Utilisateur créé
    API-->>F: Token JWT + données
    F->>F: Mise à jour Redux store
    F->>U: Redirection vers l'app
```

## 🛠️ Installation et Démarrage

### Prérequis
- Node.js (v16+)
- MongoDB Atlas ou local
- Firebase project configuré

### Démarrage rapide

#### Option 1: Script automatique (Windows)
```bash
# Avec PowerShell (recommandé)
.\start-dev.ps1

# Ou avec Batch
.\start-dev.bat
```

#### Option 2: Démarrage manuel

**Backend:**
```bash
cd backend-api
npm install
npm run dev
# ➜ http://localhost:5000
```

**Frontend:**
```bash
cd ionic-app
npm install
ionic serve --port=8100
# ➜ http://localhost:8100
```

### Test de la page d'inscription
Naviguez vers: `http://localhost:8100/register`

## 🔒 Configuration de Sécurité

### Variables d'environnement

**Frontend** (`.env`):
```properties
VITE_API_URL=http://localhost:5000/api
VITE_FIREBASE_API_KEY=your_firebase_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your_project_id
```

**Backend** (`.env`):
```properties
PORT=5000
MONGODB_URI=mongodb+srv://user:pass@cluster.mongodb.net/cotedivoire-audioguide
JWT_SECRET=your_jwt_secret
FIREBASE_SERVICE_ACCOUNT_KEY=path/to/serviceAccountKey.json
```

### CORS Configuration
Le backend est configuré pour accepter les requêtes de:
- `http://localhost:8100` (Ionic dev)
- `http://localhost:3000` (React dev)
- `exp://localhost:19000` (Expo dev)

## 🎨 Personnalisation

### Validation des champs
Modifiez la fonction `validateForm()` dans `RegistrationPage.tsx`:

```typescript
const validateForm = (): boolean => {
  const newErrors: Record<string, string> = {};
  
  // Ajoutez vos règles de validation ici
  if (!formData.email.trim()) {
    newErrors.email = 'Email requis';
  }
  
  // ...
}
```

### Styles
Personnalisez l'apparence dans `RegistrationPage.css`:

```css
.registration-card {
  margin: 20px 0;
  border-radius: 12px;
  /* Vos styles personnalisés */
}
```

### Champs supplémentaires
Pour ajouter des champs:

1. Étendre l'interface `RegistrationFormData`
2. Ajouter le champ dans le state `formData`
3. Créer l'élément UI correspondant
4. Mettre à jour la validation si nécessaire

## 🧪 Tests

### Test manuel
1. Démarrez les serveurs
2. Naviguez vers `/register`
3. Remplissez le formulaire avec des données valides
4. Vérifiez que l'utilisateur est créé dans Firebase et MongoDB
5. Confirmez la redirection vers l'application

### Validation des données
- **Email**: Format valide requis
- **Mot de passe**: Minimum 6 caractères
- **Confirmation**: Doit correspondre au mot de passe
- **Nom d'affichage**: Non vide requis
- **Conditions**: Acceptation obligatoire

## 🔍 Débogage

### Erreurs courantes

**1. Erreur CORS**
```
Access to fetch at 'http://localhost:5000/api/auth/register' from origin 'http://localhost:8100' has been blocked by CORS policy
```
**Solution**: Vérifiez que `http://localhost:8100` est dans la liste CORS du backend.

**2. Firebase Auth Error**
```
auth/invalid-email, auth/weak-password, etc.
```
**Solution**: Les erreurs Firebase sont automatiquement traduites et affichées à l'utilisateur.

**3. Backend API Error**
```
TypeError: Failed to fetch
```
**Solution**: Vérifiez que le backend fonctionne sur le port 5000.

### Logs de débogage
- **Frontend**: Console développeur du navigateur
- **Backend**: Terminal du serveur Express
- **Firebase**: Firebase Console > Authentication

## 📁 Structure des fichiers

```
ionic-app/
├── src/
│   ├── pages/
│   │   ├── RegistrationPage.tsx    # Page principale
│   │   └── RegistrationPage.css    # Styles
│   ├── services/
│   │   ├── apiClient.ts           # Client API REST
│   │   └── authService.ts         # Service auth étendu
│   └── App.tsx                    # Configuration des routes

backend-api/
├── src/
│   ├── controllers/
│   │   └── authController.ts      # Logique d'inscription
│   ├── models/
│   │   └── User.ts               # Modèle utilisateur
│   ├── routes/
│   │   └── auth.ts               # Routes d'authentification
│   └── index.ts                  # Configuration CORS
```

## 🚀 Prochaines étapes

- [ ] Tests unitaires avec Jest/React Testing Library
- [ ] Validation côté serveur renforcée
- [ ] Page de confirmation d'email
- [ ] Intégration avec les réseaux sociaux (Google, Facebook)
- [ ] Gestion des préférences utilisateur avancées
- [ ] Migration vers TypeScript strict sur tout le backend