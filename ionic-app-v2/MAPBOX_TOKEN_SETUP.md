# 🗺️ Configuration Token Mapbox - Guide Rapide

## ❌ Problème Actuel

**Erreur**: `401 (Unauthorized)` - Token Mapbox invalide ou expiré

```
https://api.mapbox.com/styles/v1/mapbox/streets-v12?access_token=pk.eyJ1IjoiYW1ieWx0ZCIsImEiOiJjbTRnbXpvZWoxMWcyMmpzZjV1eHZhcjgyIn0.TQxW5dxm-eO7dI0yl5T5qQ
→ 401 (Unauthorized)
```

**Raison**: Le token `pk.eyJ1IjoiYW1ieWx0ZCIsImEiOiJjbTRnbXpvZWoxMWcyMmpzZjV1eHZhcjgyIn0.TQxW5dxm-eO7dI0yl5T5qQ` n'est plus valide.

---

## ✅ Solution: Créer un Nouveau Token Mapbox

### Étape 1: Créer un Compte Mapbox (si nécessaire)

1. Aller sur https://account.mapbox.com/auth/signup/
2. S'inscrire avec email (gratuit jusqu'à 50,000 loads/mois)
3. Vérifier email

### Étape 2: Créer un Token d'Accès

1. Se connecter: https://account.mapbox.com/
2. Aller dans **Tokens** (menu latéral gauche)
3. Cliquer **Create a token**
4. Configuration du token:
   ```
   Token name: audioguide-cote-ivoire
   
   Scopes (cocher):
   ✅ styles:read
   ✅ fonts:read
   ✅ datasets:read
   ✅ vision:read
   
   URL restrictions (optionnel pour dev):
   - Laisser vide pour dev/test
   - Production: http://localhost:*, https://votredomaine.com/*
   ```
5. Cliquer **Create token**
6. **COPIER LE TOKEN** (format: `pk.eyJ1Ijoi...`)

### Étape 3: Mettre à Jour le Fichier .env

Ouvrir `ionic-app-v2/.env` et remplacer:

```bash
# ANCIEN TOKEN (INVALIDE)
VITE_MAPBOX_TOKEN=pk.eyJ1IjoiYW1ieWx0ZCIsImEiOiJjbTRnbXpvZWoxMWcyMmpzZjV1eHZhcjgyIn0.TQxW5dxm-eO7dI0yl5T5qQ

# NOUVEAU TOKEN (à remplacer avec votre token)
VITE_MAPBOX_TOKEN=pk.eyJ1Ijoi[VOTRE_NOUVEAU_TOKEN_ICI]
```

### Étape 4: Redémarrer le Serveur Dev

```bash
# Arrêter le serveur (Ctrl+C)
# Relancer
npm run dev
```

### Étape 5: Vérifier

1. Ouvrir http://localhost:8100/tabs/map
2. Vérifier console: **PAS** d'erreur 401
3. Vérifier carte Mapbox s'affiche correctement

---

## 🔧 Alternative: Utiliser OpenStreetMap (Leaflet)

Si vous ne voulez pas créer de compte Mapbox, revenez à l'ancienne version avec Leaflet/OpenStreetMap:

### Option 1: Rollback vers Map.tsx (ancien)

```bash
# Dans App.tsx, ligne 21
import Map from './pages/Map'; # Au lieu de MapRefactored

# Dans App.tsx, ligne 84
<Route exact path="/tabs/map" component={Map} />
```

### Option 2: Adapter MapRefactored pour Leaflet

Modifier `useMapbox.ts` pour utiliser Leaflet au lieu de Mapbox GL JS (plus complexe, nécessite refactoring).

---

## 📊 Comparaison Mapbox vs OpenStreetMap

| Feature | Mapbox GL JS | OpenStreetMap (Leaflet) |
|---------|--------------|-------------------------|
| **Token requis** | ✅ Oui (gratuit 50k/mois) | ❌ Non (100% gratuit) |
| **Performance** | ⚡ Excellente (GPU) | 🐢 Moyenne (Canvas 2D) |
| **3D Support** | ✅ Oui | ❌ Non |
| **Offline** | ✅ Cache tiles | ✅ Cache tiles |
| **Personnalisation** | ✅✅✅ Très élevée | ✅✅ Moyenne |
| **Bundle Size** | 📦 445 KB gzipped | 📦 45 KB gzipped |

---

## 🚀 Recommandation

**Pour Production**: Utiliser **Mapbox GL JS** (meilleure performance, moderne)
- Créer token Mapbox (5 min)
- 50,000 loads/mois gratuits
- GPU acceleration
- Meilleure UX

**Pour Dev/Test Rapide**: Utiliser **OpenStreetMap** (pas de token)
- Rollback vers `Map.tsx`
- 100% gratuit
- Moins performant mais fonctionnel

---

## 📝 Checklist

- [ ] Créer compte Mapbox
- [ ] Créer token avec scopes `styles:read`, `fonts:read`
- [ ] Copier token (format `pk.eyJ...`)
- [ ] Mettre à jour `ionic-app-v2/.env`
- [ ] Redémarrer serveur dev
- [ ] Vérifier carte fonctionne (pas d'erreur 401)
- [ ] Commit changement: `git add .env && git commit -m "fix: Update Mapbox token"`

---

## ❓ Aide Supplémentaire

**Token perdu?** → Régénérer dans https://account.mapbox.com/access-tokens/

**Limite dépassée?** → Vérifier usage: https://account.mapbox.com/

**Erreur persiste?** → Vérifier:
1. Token copié sans espaces
2. Serveur dev redémarré
3. Cache navigateur vidé (Ctrl+Shift+R)
4. Format token correct: `pk.eyJ...` (pas `sk.eyJ...`)

---

**Temps estimé**: 5 minutes
**Status**: ⏳ En attente de nouveau token Mapbox
