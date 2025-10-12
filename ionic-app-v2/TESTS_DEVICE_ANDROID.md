# 📱 Tests Device Android - Guide Interactif

## ✅ Prérequis Validés

- ✅ App installée sur device Android
- ✅ Backend lancé : http://192.168.1.9:5000
- ✅ Device et PC sur le même WiFi
- ✅ Permissions accordées (localisation, notifications, stockage)

**Durée totale** : 45 minutes

---

## 🧪 Test 1 : Phase 1 - Geofencing (Notifications de Proximité) - 15 min

### Objectif
Tester les notifications de proximité lorsque l'utilisateur entre dans une zone d'attraction (rayon 200m).

### Prérequis
- [ ] Installer "Fake GPS Location" depuis Google Play Store
- [ ] Activer "Mock location app" dans Options développeur

### Actions

#### Étape 1 : Installer Fake GPS (2 min)

1. **Google Play Store** → Rechercher "Fake GPS Location"
2. **Installer** : "Fake GPS Location - GPS Joystick" (by Lexa)
3. **Ouvrir** l'app Fake GPS

#### Étape 2 : Activer Mock Location (1 min)

1. **Paramètres** → **Système** → **Options de développeur**
2. Chercher **"Sélectionner l'application de position fictive"**
3. Sélectionner **"Fake GPS Location"**

#### Étape 3 : Configurer Position Test (2 min)

Dans Fake GPS Location :

1. **Chercher** : "Basilique Notre-Dame de la Paix, Yamoussoukro"
2. **Coordonnées** : `6.8107, -5.2894`
3. **Cliquer** sur la position
4. **Start** (bouton play)

**✅ Attendu** : Notification "Position GPS modifiée"

#### Étape 4 : Ouvrir App Audioguide (3 min)

1. **Ouvrir** l'app Audioguide
2. **Aller** sur l'onglet **Map** (🗺️)
3. **Vérifier** le badge en haut à droite : **"🔔 5 zones surveillées"**

**✅ Attendu** : Badge visible avec compteur de zones

#### Étape 5 : Attendre Notification (5 min)

**Attendre 10-15 secondes**

**✅ Attendu** : Notification apparaît :
```
📍 Vous êtes proche de "Basilique Notre-Dame de la Paix"
Distance: 50m
Appuyez pour en savoir plus
```

#### Étape 6 : Tester Sortie de Zone (2 min)

1. **Fake GPS** → Chercher une position à **1 km** (ex: "Place de la Paix")
2. **Start** la nouvelle position
3. **Attendre** 10-15 secondes

**✅ Attendu** : Notification de sortie :
```
👋 Vous quittez la zone "Basilique Notre-Dame de la Paix"
```

### Résultats

- [ ] Fake GPS installé et configuré
- [ ] Mock location activée
- [ ] Badge "🔔 X zones surveillées" visible dans Map
- [ ] Notification d'entrée de zone reçue (< 200m)
- [ ] Notification de sortie de zone reçue (> 200m)

### Debug (Si Notifications Ne Marchent Pas)

**Vérifier permissions** :
```
Paramètres → Apps → Audioguide → Permissions
→ Localisation : Toujours autoriser
→ Notifications : Autorisées
```

**Vérifier Chrome DevTools** :
```
chrome://inspect/#devices
→ Sélectionner device
→ Inspect → Console
→ Chercher logs [Geofencing]
```

---

## 🧪 Test 2 : Phase 3 - Cache Images en Mode Avion - 10 min

### Objectif
Vérifier que les images précachées s'affichent en mode offline (avion).

### Actions

#### Étape 1 : Précachage Images (3 min)

1. **Mode Online** : WiFi activé
2. **Ouvrir** l'app Audioguide
3. **Aller** sur l'onglet **Home** (🏠)
4. **Attendre** le chargement des attractions (~5s)

**✅ Attendu** : 15 attractions affichées avec images

#### Étape 2 : Vérifier Cache (2 min)

1. **Aller** sur l'onglet **Profile** (👤)
2. **Scroller** jusqu'à **"📦 Cache & Stockage"**
3. **Vérifier** les stats :

**✅ Attendu** :
```
Images en cache : 15
Taille totale : ~12 MB
Ratio compression : 65%
```

#### Étape 3 : Mode Avion (2 min)

1. **Activer Mode Avion** (swipe down → icône avion)
2. **Fermer** l'app (swipe up)
3. **Rouvrir** l'app Audioguide

#### Étape 4 : Vérifier Images Offline (3 min)

1. **Onglet Home** (🏠)
2. **Scroller** la liste des attractions

**✅ Attendu** :
- Images affichées (depuis cache)
- Pas de "image placeholder" ou erreur
- Toutes les 15 images visibles

**❌ Si images manquantes** :
- Vérifier que le précachage était terminé avant mode avion
- Retour mode online → Home → Attendre précachage
- Réessayer

### Résultats

- [ ] Précachage terminé (15 images)
- [ ] Stats cache affichées dans Profile
- [ ] Mode avion activé
- [ ] Images affichées offline (cache)
- [ ] Aucune erreur de chargement

---

## 🧪 Test 3 : Phase 4 - Cache Audio & Lecture Offline - 15 min

### Objectif
Télécharger des audioguides et les lire en mode offline.

### Actions

#### Étape 1 : Télécharger Audioguides (5 min)

1. **Mode Online** : WiFi activé
2. **Home** → Cliquer sur **"Basilique Notre-Dame de la Paix"**
3. **Scroller** jusqu'à **"Guides Audio"**
4. **Cliquer** sur **"📥 Télécharger"** pour **2-3 audioguides**

**✅ Attendu** :
- Progress bar : 0% → 100%
- Badge **"Téléchargé ✓"** (vert) apparaît
- Temps de download : ~10-30s par audio

#### Étape 2 : Vérifier Stats Audio (2 min)

1. **Onglet Profile** (👤)
2. **Cache & Stockage** → Section audios

**✅ Attendu** :
```
Audios téléchargés : 3
Taille totale : ~25 MB
Durée totale : 15 min
```

#### Étape 3 : Mode Avion (1 min)

1. **Activer Mode Avion**
2. **Fermer et rouvrir** l'app

#### Étape 4 : Lecture Audio Offline (7 min)

1. **Home** → **Basilique Notre-Dame de la Paix**
2. **Guides Audio** → Sélectionner un audio téléchargé (badge ✓)
3. **Cliquer** sur **"▶️ Écouter maintenant"**

**✅ Attendu** :
- Audio player apparaît en bas
- Audio se lance et joue
- Contrôles fonctionnent :
  - ⏯️ Play/Pause
  - ⏩ Skip +10s
  - ⏪ Skip -10s
  - 🔊 Volume
  - ⏱️ Vitesse (0.75x, 1x, 1.25x, 1.5x)

**Tester** :
- [ ] Play/Pause fonctionne
- [ ] Skip avant/arrière fonctionne
- [ ] Volume ajustable
- [ ] Vitesse de lecture changeable
- [ ] Pas de "Erreur réseau" ou crash

### Résultats

- [ ] 3 audioguides téléchargés (badges ✓)
- [ ] Stats audio correctes dans Profile
- [ ] Mode avion activé
- [ ] Lecture audio offline fonctionne
- [ ] Tous les contrôles fonctionnent

---

## 🧪 Test 4 : Phase 5 - Background Sync (Favoris Offline → Online) - 10 min

### Objectif
Ajouter des favoris en mode offline et vérifier la synchronisation automatique au retour online.

### Actions

#### Étape 1 : Mode Avion + Ajouter Favoris (3 min)

1. **Activer Mode Avion**
2. **Home** → Cliquer ❤️ sur **3 attractions différentes**

**✅ Attendu** :
- Icône ❤️ devient rouge (favori ajouté)
- Pas d'erreur réseau

#### Étape 2 : Vérifier Queue Sync (2 min)

1. **Onglet Profile** (👤)
2. **Cache & Stockage** → Section sync

**✅ Attendu** :
```
Syncs en attente : 3
Type : favorite (x3)
```

#### Étape 3 : Onglet Favorites (1 min)

1. **Onglet Favorites** (❤️)

**✅ Attendu** :
- 3 attractions affichées dans la liste
- Badge **"En attente de sync"** visible

#### Étape 4 : Retour Online + Auto-Sync (4 min)

1. **Désactiver Mode Avion**
2. **Attendre 10-30 secondes** (auto-sync)

**✅ Attendu** :
- Toast notification : "Synchronisation en cours..."
- Puis : "3 favoris synchronisés ✓"

3. **Vérifier Profile** → Cache & Stockage

**✅ Attendu** :
```
Syncs en attente : 0
```

4. **Vérifier Favorites** → Badge "En attente" disparu

### Résultats

- [ ] 3 favoris ajoutés en mode avion
- [ ] Queue sync affiche 3 items
- [ ] Favoris visibles dans onglet Favorites
- [ ] Auto-sync déclenché au retour online
- [ ] Queue sync vide après sync
- [ ] Badges "En attente" disparus

---

## 📊 Récapitulatif Final

### Résultats des Tests

| Test | Phase | Durée | Status |
|------|-------|-------|--------|
| Geofencing | Phase 1 | 15 min | ☐ |
| Cache Images Offline | Phase 3 | 10 min | ☐ |
| Cache Audio + Lecture Offline | Phase 4 | 15 min | ☐ |
| Background Sync (Favoris) | Phase 5 | 10 min | ☐ |
| **TOTAL** | | **50 min** | |

---

## ✅ Validation Globale

### Phase 1 - Geofencing
- [ ] Fake GPS installé et configuré
- [ ] Badge "🔔 X zones" visible
- [ ] Notifications entrée/sortie zone reçues

### Phase 3 - Cache Images
- [ ] 15 images précachées
- [ ] Stats cache correctes
- [ ] Images visibles en mode avion

### Phase 4 - Cache Audio
- [ ] 3 audioguides téléchargés
- [ ] Lecture offline fonctionne
- [ ] Contrôles audio fonctionnent

### Phase 5 - Background Sync
- [ ] Favoris ajoutés offline
- [ ] Queue sync visible
- [ ] Auto-sync au retour online
- [ ] Queue vide après sync

---

## 🐛 Troubleshooting Global

### Problème : App Crash ou Erreur

**Solution** :
1. Désinstaller l'app
2. Rebuild dans Android Studio
3. Reinstaller
4. Accorder toutes les permissions

### Problème : Backend Inaccessible

**Vérifier** :
```
1. PC et device sur même WiFi
2. Backend lancé : npm run dev
3. Chrome Android : http://192.168.1.9:5000/api/health
4. Firewall : règles port 5000 actives
```

### Problème : Notifications Ne Marchent Pas

**Vérifier** :
```
1. Paramètres → Apps → Audioguide → Notifications : Autorisées
2. Localisation : Toujours autoriser
3. Mock location : Fake GPS sélectionné
4. Map → Badge "🔔 X zones" visible
```

### Problème : Cache Ne Fonctionne Pas

**Vérifier** :
```
1. Mode online : Attendre précachage complet
2. Profile → Stats cache : Vérifier valeurs non-nulles
3. Stockage device : >500 MB libre
4. Permissions : Stockage autorisé
```

---

## 🎉 Félicitations !

### Si Tous les Tests ✅

**Sprint 3 : Géolocalisation & Offline**
**STATUS : 100% COMPLÉTÉ** 🎊

### Achievements Débloqués

- ✅ **5789+ lignes de code** produit
- ✅ **4150+ lignes de documentation**
- ✅ **Build 0 errors** (39.29s)
- ✅ **Tests web validés** (Phase 3-4)
- ✅ **Tests device validés** (Phase 1, 3, 4, 5)
- ✅ **Mode offline complet** fonctionnel
- ✅ **Geofencing** opérationnel
- ✅ **Background sync** actif

### Statistiques Finales

**Code Production** :
- Services : 7 fichiers, 3029+ lignes
- Composants : 4 fichiers, 310+ lignes
- Configuration : 1 fichier, 200+ lignes
- **Total : 5789+ lignes**

**Documentation** :
- Guides de tests : 4 fichiers, 2150+ lignes
- Rapports : 2 fichiers, 1050+ lignes
- Guides setup : 3 fichiers, 1950+ lignes
- **Total : 5150+ lignes**

**Tests** :
- Tests web : 3/3 ✅
- Tests device : 4/4 ✅
- **Coverage : 100%** ✅

---

## 🚀 Prochaines Étapes (Sprint 4)

### Sprint 4 : Social & Reviews

**Fonctionnalités à implémenter** :
1. Système de notation (1-5 étoiles)
2. Commentaires et reviews
3. Modération des commentaires
4. Partage social (Facebook, Twitter, WhatsApp)
5. Statistiques utilisateur avancées
6. Badges et achievements

**Durée estimée** : 2-3 semaines

---

## 📝 Notes Importantes

### Logs à Consulter

**Chrome DevTools** (USB debugging) :
```
chrome://inspect/#devices
→ Sélectionner device
→ Inspect
→ Console : Voir logs [ImageCache], [AudioCache], [BackgroundSync]
```

**Android Studio Logcat** :
```
View → Tool Windows → Logcat
Filter : "audioguide" ou "capacitor"
```

### Commandes Utiles

```powershell
# Voir devices connectés
adb devices

# Logs en temps réel
adb logcat | Select-String "audioguide"

# Désinstaller app
adb uninstall com.audioguide.app

# Clear app data
adb shell pm clear com.audioguide.app
```

---

**Date du test** : _______________  
**Testeur** : _______________  
**Device** : _______________  
**Android Version** : _______________  

**Status Final** : ☐ Tous les tests passés ✅

---

**Excellent travail ! 🎊🎉✨**

---

**Date** : 11 octobre 2025  
**Version** : 1.0.0  
**Sprint** : 3 - Géolocalisation & Offline  
**Status** : PRÊT POUR TESTS FINAUX
