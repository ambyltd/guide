# 🚀 DÉMARRER LES TESTS DEVICE - Guide Express

## ⚡ Lancement Rapide (5 min de préparation)

### ✅ Prérequis Validés

- ✅ App installée sur device Android
- ✅ Backend lancé (http://192.168.1.9:5000)
- ✅ Device et PC sur même WiFi

---

## 🎯 ÉTAPE 1 : Préparation Device (5 min)

### Action 1 : Installer Fake GPS (2 min)

**Google Play Store** :
1. Rechercher : **"Fake GPS Location"**
2. Installer : **"Fake GPS Location - GPS Joystick"** (by Lexa)
3. Ouvrir l'app

### Action 2 : Activer Mock Location (1 min)

**Paramètres Android** :
1. **Paramètres** → **Système** → **À propos du téléphone**
2. Taper **7 fois** sur **"Numéro de build"** → Options développeur activées
3. **Retour** → **Options de développeur**
4. Chercher **"Sélectionner l'application de position fictive"**
5. Sélectionner → **"Fake GPS Location"**

### Action 3 : Vérifier Permissions App (2 min)

**Paramètres** → **Applications** → **Audioguide** :
- ✅ **Localisation** : "Toujours autoriser"
- ✅ **Notifications** : Activées
- ✅ **Stockage** : Autorisé

---

## 🧪 ÉTAPE 2 : Lancer les Tests (50 min)

### 📱 Guide Complet : `TESTS_DEVICE_ANDROID.md`

**Ordre des Tests** :

```
1️⃣ TEST GEOFENCING (15 min)
   └─ Fake GPS → Position Basilique → Notifications

2️⃣ TEST CACHE IMAGES (10 min)
   └─ Précachage → Mode Avion → Vérification

3️⃣ TEST CACHE AUDIO (15 min)
   └─ Download → Mode Avion → Lecture Offline

4️⃣ TEST BACKGROUND SYNC (10 min)
   └─ Favoris Offline → Retour Online → Auto-Sync
```

---

## 📋 Checklist Tests Rapide

### Test 1 : Geofencing ✅

**Fake GPS** → Coordonnées : `6.8107, -5.2894`  
**Map** → Badge "🔔 5 zones" visible  
**Attendre 15s** → Notification "📍 Vous êtes proche..."

- [ ] Badge visible
- [ ] Notification entrée zone
- [ ] Notification sortie zone

### Test 2 : Cache Images ✅

**Home** → 15 attractions chargées  
**Profile** → Stats "15 images en cache"  
**Mode Avion** → Images visibles

- [ ] 15 images précachées
- [ ] Stats cache OK
- [ ] Images offline OK

### Test 3 : Cache Audio ✅

**AttractionDetail** → Download 3 audios  
**Progress 0→100%** → Badges "Téléchargé ✓"  
**Mode Avion** → Lecture audio OK

- [ ] 3 audios téléchargés
- [ ] Stats audio OK
- [ ] Lecture offline OK
- [ ] Contrôles (play/pause/skip/volume) OK

### Test 4 : Background Sync ✅

**Mode Avion** → Ajouter 3 favoris  
**Profile** → Queue "3 syncs en attente"  
**Retour Online** → Auto-sync automatique

- [ ] 3 favoris ajoutés offline
- [ ] Queue sync visible
- [ ] Auto-sync OK
- [ ] Queue vide après sync

---

## 🎉 APRÈS LES TESTS

### Si Tous les Tests ✅

**SPRINT 3 : 100% COMPLÉTÉ** 🎊

**Achievements** :
- 🏆 5789+ lignes de code
- 📚 5100+ lignes de documentation
- 🧪 100% tests validés (web + device)
- 🚀 Mode offline complet fonctionnel
- 📱 Geofencing opérationnel
- 🔄 Background sync actif

---

## 🐛 Troubleshooting Express

### ❌ Fake GPS ne marche pas

```
Options développeur → Mock location app → Fake GPS
```

### ❌ Pas de notifications

```
Paramètres → Apps → Audioguide
→ Localisation : Toujours autoriser
→ Notifications : Activées
```

### ❌ Backend inaccessible

```powershell
# Terminal PowerShell
cd "C:\Users\jpama\Desktop\i\audioguide\backend-api"
npm run dev

# Chrome Android
http://192.168.1.9:5000/api/health
```

### ❌ Cache ne fonctionne pas

```
1. Mode online : Attendre précachage complet
2. Profile → Vérifier stats cache non-nulles
3. Stockage : >500 MB libre
```

---

## 📞 Support Chrome DevTools

### Voir Logs Device en Temps Réel

**Chrome Desktop** :
1. Ouvrir : `chrome://inspect/#devices`
2. Sélectionner votre device
3. Cliquer **"Inspect"**
4. **Console** → Voir logs `[Geofencing]`, `[ImageCache]`, `[AudioCache]`

---

## ⏱️ Timeline Tests

| Temps | Action |
|-------|--------|
| 0:00 | Installer Fake GPS |
| 0:02 | Activer mock location |
| 0:05 | **START TEST 1** : Geofencing |
| 0:20 | **START TEST 2** : Cache Images |
| 0:30 | **START TEST 3** : Cache Audio |
| 0:45 | **START TEST 4** : Background Sync |
| 0:55 | **VALIDATION FINALE** ✅ |
| 1:00 | **SPRINT 3 : 100% COMPLÉTÉ** 🎉 |

---

## 🚀 COMMENCEZ MAINTENANT !

### Étape Suivante

1. **Ouvrir** : `TESTS_DEVICE_ANDROID.md` (guide détaillé 500+ lignes)
2. **Préparer** device (5 min)
3. **Lancer** Test 1 : Geofencing (15 min)
4. **Continuer** Tests 2-3-4 (35 min)
5. **Valider** : Cocher toutes les checkboxes ✅

---

**Temps Total** : **55 minutes** (5 min préparation + 50 min tests)

**Résultat** : **Sprint 3 à 100%** 🎊

---

**Prêt ? C'est parti ! 🚀🎉✨**

---

**Date** : 11 octobre 2025  
**Guide Détaillé** : TESTS_DEVICE_ANDROID.md  
**Support** : INTEGRATION_TEST_GUIDE.md  
**Status** : PRÊT POUR LANCEMENT
