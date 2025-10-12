# 🚀 COMMANDES RAPIDES - SPRINT 4

## 🧪 TESTER LES NOUVELLES FONCTIONNALITÉS

### 📱 Lancer l'application web
```bash
cd ionic-app-v2
npm run dev
```
Puis ouvrir : **http://localhost:5173**

### 🔗 Pages à tester

**Page Statistiques** : http://localhost:5173/stats
- Tab Tendances (7j/30j)
- Tab Achievements (12 achievements)
- Tab Comparaison (rank + graphique)

**Page Leaderboard** : http://localhost:5173/leaderboard
- Filtres période (7j, 30j, tout)
- Filtres métrique (Attractions, Guides, Avis, Écoute)
- Classement complet

**Profile** : http://localhost:5173/tabs/profile
- Card "Statistiques Avancées"
- Boutons navigation vers /stats et /leaderboard

---

## 🔧 TESTER BACKEND MODÉRATION

### Vérifier backend running
```bash
curl http://localhost:5000/api/health
```

### Lancer tests modération
```bash
cd backend-api
node test-moderation-simple.js
```

**Tests effectués** (7) :
1. ✅ Premier signalement (reportCount=1)
2. ✅ Deuxième signalement (reportCount=2)
3. ✅ Duplicate detection (reportCount reste à 2)
4. ✅ Auto-flagging 3ème signalement (flagged=true)
5. ✅ Masquage automatique (active=false)
6. ✅ Modération rejection
7. ✅ Modération approbation + clear flagged

---

## 📤 TESTER PARTAGE SOCIAL

### Sur web (test basique)
```javascript
// Dans console navigateur (http://localhost:5173)
import { socialShareService } from './services/socialShareService';

await socialShareService.canShare();
// → true/false selon navigateur

await socialShareService.shareAttraction({
  _id: '123',
  name: 'Test Attraction',
  description: 'Description test'
});
```

### Sur device Android (partage natif)
```bash
# 1. Build
cd ionic-app-v2
npm run build

# 2. Sync
npx cap sync android

# 3. Ouvrir Android Studio
npx cap open android

# 4. Build & Run sur device
# (depuis Android Studio)
```

Puis dans l'app :
- Appeler `socialShareService.shareToWhatsApp(...)`
- Vérifier ouverture WhatsApp avec message pré-rempli
- Tester Facebook, Twitter, Native Share

---

## 📊 VÉRIFIER DONNÉES

### Statistiques utilisateur
```javascript
// Console navigateur
import { userStatsService } from './services/userStatsService';

const stats = await userStatsService.getUserStats();
console.log(stats);
// → { attractionsVisited, audioGuidesListened, reviewCount, ... }
```

### Achievements
```javascript
import { advancedStatsService } from './services/advancedStatsService';

const achievements = await advancedStatsService.getAchievements();
console.log(achievements);
// → Array de 12 achievements avec progression
```

### Leaderboard
```javascript
const leaderboard = await advancedStatsService.getLeaderboard('attractionsVisited', 10, 'all');
console.log(leaderboard);
// → { count, sortBy, timeframe, data: [...] }
```

---

## 🎨 BUILD PRODUCTION

### Web
```bash
cd ionic-app-v2
npm run build
```
Résultat dans `dist/`

### Android APK
```bash
# 1. Build web
npm run build

# 2. Sync Capacitor
npx cap sync android

# 3. Ouvrir Android Studio
npx cap open android

# 4. Build → Build Bundle(s) / APK(s) → Build APK(s)
# Résultat dans android/app/build/outputs/apk/
```

---

## 🔍 DEBUG

### Logs backend
```bash
cd backend-api
npm run dev
# Logs en temps réel
```

### Logs mobile (web)
```bash
cd ionic-app-v2
npm run dev
# Console navigateur : F12 → Console
```

### Logs mobile (Android)
```bash
# Device connecté USB
npx cap run android --livereload

# Ou via Android Studio → Logcat
```

---

## 📦 PACKAGES

### Vérifier installations
```bash
cd ionic-app-v2

# Capacitor Share
npm list @capacitor/share
# → @capacitor/share@7.0.2

# Recharts
npm list recharts
# → recharts@X.X.X
```

### Réinstaller si nécessaire
```bash
npm install @capacitor/share recharts
npx cap sync android
```

---

## 🧹 CLEANUP

### Reset node_modules
```bash
cd ionic-app-v2
rm -rf node_modules package-lock.json
npm install
```

### Reset Capacitor
```bash
npx cap sync android
```

### Vider cache navigateur
- Chrome : F12 → Application → Clear storage
- Ou Ctrl+Shift+Delete → Cocher "Cached images"

---

## 🚨 TROUBLESHOOTING

### Graphiques ne s'affichent pas
```bash
# Vérifier recharts
npm list recharts

# Réinstaller si manquant
npm install recharts

# Relancer dev server
npm run dev
```

### Social sharing ne fonctionne pas
```bash
# Vérifier plugin
npm list @capacitor/share

# Sync Android
npx cap sync android

# Vérifier dans Android Studio :
# android/app/src/main/java/.../MainActivity.java
# → add(Share.class) présent
```

### Backend modération 404
```bash
# Vérifier backend running
curl http://localhost:5000/api/health

# Redémarrer si nécessaire
cd backend-api
npm run dev
```

### Routes /stats ou /leaderboard 404
```bash
# Vérifier App.tsx contient :
# <Route exact path="/stats"><StatsPage /></Route>
# <Route exact path="/leaderboard"><LeaderboardPage /></Route>

# Relancer dev server
npm run dev
```

---

## 📋 CHECKLIST TESTS COMPLETS

### Web (30 min)
- [ ] Lancer app http://localhost:5173
- [ ] Tester page /stats (3 tabs)
- [ ] Tester page /leaderboard (filtres)
- [ ] Tester navigation depuis Profile
- [ ] Vérifier graphiques Recharts affichés
- [ ] Tester pull-to-refresh
- [ ] Tester responsive (mobile view)

### Backend (15 min)
- [ ] Backend running http://localhost:5000
- [ ] Lancer test-moderation-simple.js
- [ ] Vérifier 7 tests passent ✅
- [ ] Tester endpoint report manuellement
- [ ] Tester endpoint moderate manuellement

### Device Android (45 min)
- [ ] Build production npm run build
- [ ] Sync npx cap sync android
- [ ] Installer sur device via Android Studio
- [ ] Tester page /stats sur device
- [ ] Tester page /leaderboard sur device
- [ ] Tester social sharing (WhatsApp, Facebook, Twitter)
- [ ] Vérifier analytics tracking (shareCount increment)
- [ ] Tester performance graphiques (scroll, zoom)

---

## 🎯 COMMANDES ESSENTIELLES

```bash
# Lancer app web
cd ionic-app-v2 && npm run dev

# Lancer backend
cd backend-api && npm run dev

# Build production
cd ionic-app-v2 && npm run build

# Sync Android
cd ionic-app-v2 && npx cap sync android

# Ouvrir Android Studio
cd ionic-app-v2 && npx cap open android

# Tests modération
cd backend-api && node test-moderation-simple.js

# Health check backend
curl http://localhost:5000/api/health
```

---

## 📚 DOCUMENTATION

- `SPRINT_4_RAPPORT_FINAL.md` - Documentation technique (1500+ lignes)
- `SPRINT_4_SYNTHESE_FINALE.md` - Synthèse exécutive
- `CE_QUI_FONCTIONNE_MAINTENANT.md` - Guide utilisateur
- `.github/copilot-instructions.md` - Checklist projet complète

---

## ✅ VALIDATION FINALE

### Prêt pour démo ✅
- ✅ StatsPage fonctionnelle (3 tabs avec graphiques)
- ✅ LeaderboardPage fonctionnelle (filtres dynamiques)
- ✅ Navigation depuis Profile opérationnelle
- ✅ Backend modération opérationnel (7 tests passent)
- ✅ Service socialShareService créé et sync Android OK
- ✅ 12 achievements calculés automatiquement
- ✅ Documentation complète disponible

### Prêt pour production ⏳
- ⏳ Tests device Android à effectuer
- ⏳ Performance graphiques à valider (grand dataset)
- ✅ Build production fonctionnel (npm run build OK)

---

**Total Sprint 4** : ~2160 lignes de code | 4h30 de développement | 80% complété 🚀
