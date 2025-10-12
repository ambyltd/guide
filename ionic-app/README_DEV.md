# 🎧 Audio Guide Côte d'Ivoire - Guide de Démarrage

## 🚀 Démarrage Rapide

### Option 1: Script automatisé
```bash
npm run quick-start
```

### Option 2: Démarrage manuel
```bash
# Installation des dépendances
npm install

# Démarrage du serveur de développement  
npm start

# Ouvrir http://localhost:5173 dans le navigateur
```

## 📱 Développement Mobile

### Android
```bash
# Build et ouvrir Android Studio
npm run cap:android

# Synchroniser seulement
npm run cap:sync
```

### iOS  
```bash
# Build et ouvrir Xcode
npm run cap:ios
```

## 🔧 Commandes Utiles

### Développement
```bash
npm start              # Serveur dev avec hot reload
npm run dev            # Alias pour npm start
npm run build          # Build de production
npm run preview        # Prévisualiser le build
```

### Tests & Qualité
```bash
npm run lint           # ESLint
npm run validate       # Validation complète
npm run demo           # Démonstration du projet
```

### Analyse & Performance
```bash
npm run analyze        # Analyse des performances
npm run optimize       # Optimisations avancées
```

### Déploiement
```bash
npm run deploy         # Déploiement production
npm run deploy:android # Build Android
npm run deploy:ios     # Build iOS
```

## 🏗️ Structure du Projet

```
📦 ionic-app/
├── 🎨 src/
│   ├── 📱 pages/           # Pages principales
│   ├── 🧩 components/      # Composants réutilisables  
│   ├── ⚙️ services/        # Logique métier
│   ├── 🎛️ store/          # Redux state
│   └── 🎨 theme/          # Styles et thèmes
├── 📋 scripts/           # Scripts d'automatisation
├── 🔧 public/            # Assets statiques
└── 📝 Configuration files
```

## 🎯 Fonctionnalités Clés

- ✅ **Audio Géolocalisé**: Audio contextuel basé sur la position
- ✅ **Mode Hors-ligne**: Cache intelligent pour usage sans réseau
- ✅ **Cartographie**: Leaflet avec clustering et geofencing
- ✅ **Analytics**: Monitoring avancé des performances
- ✅ **PWA**: Support complet Progressive Web App
- ✅ **Mobile**: Build natif iOS/Android avec Capacitor

## 🔥 Points d'Entrée Principaux

### Pages
- `HomePage.tsx` - Accueil avec widgets
- `MapPage.tsx` - Carte interactive avec audio
- `AudioGuidesPage.tsx` - Gestion des guides
- `OfflinePage.tsx` - Mode hors-ligne

### Services
- `geolocationAudio.ts` - Audio géolocalisé
- `offlineCache.ts` - Cache intelligent  
- `analytics.ts` - Analytics avancées
- `errorMonitoring.ts` - Monitoring erreurs

## 🌐 URLs de Développement

- **App Web**: http://localhost:5173
- **Vite HMR**: http://localhost:5173/__vite_ping
- **DevTools**: F12 dans le navigateur

## 📊 Scripts de Démonstration

```bash
# Démonstration complète du projet
npm run demo

# Démarrage guidé pour développeurs
npm run quick-start
```

## 🔧 Configuration

### Variables d'Environnement (.env.local)
```env
REACT_APP_API_URL=https://your-api.com
REACT_APP_FIREBASE_API_KEY=your-key
REACT_APP_MAPBOX_TOKEN=your-token
```

### Capacitor (capacitor.config.ts)
```typescript
export default {
  appId: 'com.audioguide.ci',
  appName: 'Audio Guide CI',
  webDir: 'dist',
  // ...
}
```

## 🚨 Troubleshooting

### Problèmes courants
1. **Port 5173 occupé**: Vite utilisera automatiquement le port suivant
2. **Erreurs TypeScript**: Vérifiez avec `npm run lint`
3. **Build échoue**: Nettoyez avec `rm -rf dist node_modules && npm install`
4. **Capacitor sync fail**: Vérifiez que les plateformes sont ajoutées

### Support
- 📧 Issues GitHub pour les bugs
- 📚 Documentation Ionic: https://ionicframework.com/docs
- 🔧 Documentation Capacitor: https://capacitorjs.com/docs

---

**🎊 Projet prêt pour le développement et la production ! 🎊**