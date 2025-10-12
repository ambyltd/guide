# 📱 Guide d'Installation et Test - Audio Guide Géolocalisé

## 🎯 Application : Audio Guide Géolocalisé - Côte d'Ivoire

### Pour Testeurs Beta en Côte d'Ivoire 🇨🇮

---

## 📋 Prérequis pour l'Installation

### 💻 Développeurs/Testeurs Techniques

**Logiciels requis :**
- **Node.js** 18+ : [Télécharger](https://nodejs.org/)
- **Git** : [Télécharger](https://git-scm.com/)
- **Android Studio** (pour tests Android) : [Télécharger](https://developer.android.com/studio)
- **Xcode** (pour tests iOS, Mac uniquement) : [App Store](https://apps.apple.com/app/xcode/id497799835)

**Vérification :**
```bash
node --version  # Doit afficher v18+ 
npm --version   # Doit afficher 9+
git --version   # Doit afficher 2.30+
```

---

## 🚀 Installation Rapide

### 1️⃣ Cloner et Installer

```bash
# Cloner le projet
git clone [URL_DU_REPO]
cd ionic-app

# Installer les dépendances
npm install

# Installer Ionic CLI globalement
npm install -g @ionic/cli
```

### 2️⃣ Configuration Environnement

Créer le fichier `.env.local` :

```env
# Configuration API (backend)
REACT_APP_API_URL=https://your-backend-api.com
REACT_APP_API_VERSION=v1

# Configuration Mapbox
REACT_APP_MAPBOX_TOKEN=pk.your_mapbox_token_here

# Configuration Firebase
REACT_APP_FIREBASE_API_KEY=your_firebase_key
REACT_APP_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
REACT_APP_FIREBASE_PROJECT_ID=your-project-id

# Mode de test (utilise données locales si pas de backend)
REACT_APP_TEST_MODE=true
```

### 3️⃣ Lancer en Mode Développement

```bash
# Démarrer l'app web (navigateur)
npm run dev

# Ou directement avec Ionic
ionic serve
```

L'application s'ouvre sur `http://localhost:3000`

---

## 📱 Installation Mobile (Testeurs sur Terrain)

### 🤖 Android (Recommandé pour tests)

```bash
# Ajouter la plateforme Android
ionic capacitor add android

# Builder l'app
npm run build

# Synchroniser avec Android
ionic capacitor sync android

# Ouvrir dans Android Studio
ionic capacitor open android
```

**Dans Android Studio :**
1. Connecter votre téléphone Android (mode développeur activé)
2. Cliquer sur "Run" (▶️) pour installer sur le téléphone

### 🍎 iOS (Mac uniquement)

```bash
# Ajouter la plateforme iOS
ionic capacitor add ios

# Builder l'app
npm run build

# Synchroniser avec iOS
ionic capacitor sync ios

# Ouvrir dans Xcode
ionic capacitor open ios
```

**Dans Xcode :**
1. Connecter votre iPhone/iPad
2. Configurer le compte développeur Apple
3. Cliquer sur "Run" (▶️) pour installer

---

## 🧪 Guide de Test Utilisateur

### 🎯 Scénarios de Test Prioritaires

#### **Test 1 : Premier Lancement**
1. ✅ Ouvrir l'application
2. ✅ Vérifier que la carte de Côte d'Ivoire s'affiche
3. ✅ Autoriser la géolocalisation quand demandé
4. ✅ Vérifier que votre position apparaît sur la carte

**Résultat attendu :** Carte centrée sur la Côte d'Ivoire avec position utilisateur visible

#### **Test 2 : Navigation et Découverte**
1. ✅ Naviguer sur la carte (zoom, déplacement)
2. ✅ Identifier les marqueurs d'attractions (🏛️ icônes)
3. ✅ Taper sur un marqueur pour voir les détails
4. ✅ Utiliser les boutons de navigation

**Résultat attendu :** Interface fluide, informations claires sur les attractions

#### **Test 3 : Géolocalisation et Audio (TEST CRUCIAL)**
1. ✅ Se déplacer physiquement vers une attraction connue
2. ✅ Activer le bouton "Guidage GPS" dans l'app
3. ✅ Observer les notifications de proximité
4. ✅ Écouter le guide audio qui se déclenche automatiquement

**Résultat attendu :** Audio se déclenche à ~20m de l'attraction, lecture automatique

#### **Test 4 : Fonctionnalités Audio**
1. ✅ Contrôler la lecture (pause/play/stop)
2. ✅ Ajuster le volume
3. ✅ Tester la qualité audio (casque recommandé)
4. ✅ Vérifier la synchronisation avec la position

**Résultat attendu :** Contrôles fonctionnels, audio de qualité, sync position

---

## 🗺️ Zones de Test Recommandées

### 📍 Attractions Testables en Côte d'Ivoire

1. **Abidjan**
   - Musée des Civilisations de Côte d'Ivoire
   - Cathédrale Saint-Paul
   - Marché de Treichville

2. **Yamoussoukro**
   - Basilique Notre-Dame de la Paix (PRIORITY)
   - Palais Présidentiel

3. **Grand-Bassam**
   - Centre historique UNESCO
   - Musée National du Costume

4. **Bouaké**
   - Grande Mosquée
   - Marché Central

### 🎯 Instructions pour Testeurs sur Terrain

**Préparer le test :**
- Charger le téléphone (100%)
- Activer GPS haute précision
- Connecter des écouteurs/casque
- Avoir une connexion internet stable

**Pendant le test :**
- Noter les temps de réponse
- Vérifier la précision GPS (±10m)
- Évaluer la qualité audio
- Tester en déplacement (marche)

---

## 🐛 Rapports de Bugs et Feedback

### 📝 Informations à Fournir

**Pour chaque bug/problème :**
```
📱 Appareil: [iPhone 12 / Samsung Galaxy S21 / etc.]
🔋 OS Version: [iOS 16.1 / Android 13 / etc.]
📍 Localisation: [Nom de l'attraction testée]
🕐 Heure: [HH:MM]
📶 Connexion: [WiFi / 4G / 5G]

🔴 Problème: [Description détaillée]
✅ Résultat attendu: [Ce qui devrait se passer]
🔄 Étapes pour reproduire: [1, 2, 3...]
📎 Capture d'écran: [Si possible]
```

### 📧 Contacts Support

- **Email :** [votre.email@domain.com]
- **WhatsApp :** [+225 XX XX XX XX]
- **Telegram :** [@votre_username]

---

## 🎉 Features Avancées à Tester

### 🔋 Mode Hors-Ligne
- Télécharger les cartes en WiFi
- Tester en mode avion avec GPS activé
- Vérifier que l'audio fonctionne sans internet

### 🌍 Multi-Langues
- Basculer entre Français/Anglais
- Tester les guides audio multilingues

### 🎵 Gestion Audio Avancée
- Test avec Bluetooth (AirPods, etc.)
- Interruptions téléphoniques
- Audio en arrière-plan

---

## 🏆 Objectifs de Test

### ✅ Validation UX Terrain
- Interface intuitive pour touristes européens
- Navigation sans formation préalable
- Expérience immersive et fluide

### ✅ Validation Technique
- Performance en conditions réelles
- Stabilité GPS en déplacement
- Qualité audio en environnement touristique

### ✅ Validation Contenu
- Pertinence des informations culturelles
- Qualité des narrateurs
- Timing et durée des guides

---

**🎯 L'objectif : Valider que l'app révolutionne vraiment l'expérience touristique en Côte d'Ivoire !**

*Merci de contribuer à l'amélioration de cette innovation touristique 🇨🇮✨*