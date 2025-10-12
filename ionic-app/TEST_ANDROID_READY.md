# ✅ Test Android - Configuration Prête

## 🎉 Build Réussi !

**Date** : 9 octobre 2025  
**Build time** : 1m 20s  
**Capacitor sync** : ✅ Réussi (1.2s)

---

## 📦 Configuration Appliquée

### Variables d'Environnement (.env.production)

```bash
VITE_API_URL=http://10.0.2.2:5000/api  # ← IP émulateur Android
VITE_MAPBOX_TOKEN=pk.eyJ1IjoiYW1ieWwiLCJhIjoiY21nM3kweWh4MDB1ODJsczU1dTFobTlhMyJ9...
VITE_FIREBASE_API_KEY=AIzaSyAWlPL4AOQYx59-cvXssikv ouXCw4ryCXc
```

### Plugins Capacitor Détectés

✅ @capacitor/device@7.0.2  
✅ @capacitor/filesystem@7.1.4  
✅ @capacitor/geolocation@7.1.5 ← **Pour GPS**  
✅ @capacitor/local-notifications@7.0.3 ← **Pour notifications**  
✅ @capacitor/network@7.0.2  

---

## 🚀 Étapes pour Lancer l'App

### 1️⃣ Ouvrir Android Studio (si pas déjà ouvert)

```powershell
npx cap open android
```

### 2️⃣ Dans Android Studio

1. **Attendre la fin de Gradle sync** (barre de progression en bas)
2. **Sélectionner un émulateur** :
   - Dropdown en haut (à côté du ▶️)
   - Si aucun émulateur : Tools > Device Manager > Create Device
   - Recommandé : **Pixel 4** ou **Pixel 6** avec Android 13+
3. **Cliquer sur ▶️ Run** (ou Shift+F10)

### 3️⃣ Premier Lancement (Permissions)

L'app va demander 2 permissions :

1. **📍 Localisation** → Cliquez **"Autoriser"** (Allow)
2. **🔔 Notifications** → Cliquez **"Autoriser"** (Allow)

---

## 🧪 Tests à Effectuer

### Test 1 : Page Home

**Résultat attendu** :
- ✅ Hero section visible avec titre "Découvrez la Côte d'Ivoire"
- ✅ Barre de recherche fonctionnelle
- ✅ Catégories avec emojis (🏛️ Monument, 🏛️ Musée, etc.)
- ✅ Liste attractions avec images (Basilique, Musée, Parc Taï, etc.)
- ✅ Circuits touristiques en bas

**Si images ne chargent pas** : Normal si backend pas lancé (fallback données mockées)

---

### Test 2 : Page Map (Geofencing) 🎯

**Navigation** : Cliquez sur l'onglet **"Map"** en bas

**Résultat attendu** :
1. ✅ Carte Mapbox s'affiche (Abidjan)
2. ✅ Badge 🔔 **vert** visible en haut à droite (geofencing actif)
3. ✅ Markers rouges sur attractions
4. ✅ Barre de recherche fonctionnelle

**Logs Logcat attendus** :
```
I/Capacitor: Geofencing démarré
I/Capacitor: 🎯 Geofencing activé sur Map.tsx
I/Capacitor: Permissions notifications déjà accordées
```

---

### Test 3 : Simuler Déplacement GPS

#### Dans Android Studio :

1. **Ouvrir Extended Controls** :
   - Cliquez sur **⋯** (3 points) sur la barre latérale de l'émulateur
   - Ou raccourci : **Ctrl+Shift+P** puis tapez "Extended Controls"

2. **Aller dans Location** (section GPS)

3. **Entrer ces coordonnées** (attractions en Côte d'Ivoire) :

| Attraction | Latitude | Longitude | Action |
|------------|----------|-----------|--------|
| **Basilique Notre-Dame** | 6.8107 | -5.2894 | Send |
| **Musée des Civilisations** | 5.3160 | -4.0305 | Send |
| **Parc National de Taï** | 5.8664 | -7.3538 | Send |

4. **Pour chaque position** :
   - Entrez Latitude et Longitude
   - Cliquez **"Send"**
   - Attendez 2-3 secondes
   - Regardez l'app

**Résultats attendus** :

✅ **Quand distance < 200m** :
- Notification : "🎯 **Vous êtes arrivé !**"
- Badge compteur augmente (ex: 1, 2, 3...)
- Son de notification (si activé sur émulateur)

✅ **Quand distance > 200m** (éloignement) :
- Notification : "👋 **Au revoir !**"
- Badge compteur diminue

---

### Test 4 : Clic sur Notification

**Étapes** :
1. Simulez GPS près d'une attraction (ex: Basilique)
2. Notification "🎯 Vous êtes arrivé !" s'affiche
3. **Cliquez sur la notification**

**Résultat attendu** :
- ✅ L'app s'ouvre (si était en arrière-plan)
- ✅ Navigation vers **AttractionDetail** de la Basilique
- ✅ Page détail s'affiche avec galerie, audioguides, map preview

---

### Test 5 : AttractionDetail

**Navigation** : Home > Cliquez sur une attraction

**Résultat attendu** :
- ✅ Hero image en haut (fullscreen swipeable)
- ✅ Titre attraction + catégorie + note
- ✅ Description complète
- ✅ Liste audioguides (FR + EN) avec bouton Play
- ✅ Map preview Mapbox en bas
- ✅ Bouton favoris ❤️ fonctionnel

**Test AudioPlayer** :
1. Cliquez sur un audioguide
2. Modal s'ouvre avec lecteur
3. ✅ Play/Pause fonctionne
4. ✅ Contrôles vitesse (0.75x - 1.5x)
5. ✅ Volume slider
6. ✅ Skip ±10s
7. ✅ Onglet Bookmarks

---

### Test 6 : Page Favorites

**Navigation** : Onglet **"Favoris"** en bas

**Résultat attendu** :
- ✅ Liste des attractions favorites
- ✅ Possibilité de retirer (bouton ❌)
- ✅ Clic ouvre AttractionDetail

---

### Test 7 : Page Profile

**Navigation** : Onglet **"Profil"** en bas

**Résultat attendu** :
- ✅ Avatar + nom utilisateur (si connecté Firebase)
- ✅ Statistiques : attractions visitées, favoris, temps écoute
- ✅ Préférences : langue, notifications, mode sombre
- ✅ Bouton Déconnexion

---

## 🔍 Debugging avec Logcat

### Ouvrir Logcat dans Android Studio

1. **Vue Logcat** : Alt+6 ou View > Tool Windows > Logcat
2. **Filtrer** : Tapez dans la barre de recherche

### Filtres Utiles

```bash
# Tous les logs Capacitor
Capacitor

# Logs geofencing spécifiques
Geofencing|notificationService

# Erreurs uniquement
level:error

# Package app spécifique
package:com.cotedivoire.audioguide
```

### Logs Attendus (Succès)

```log
I/Capacitor: Loading app at capacitor://localhost
I/Capacitor: ✅ Permissions notifications déjà accordées
I/Capacitor: ✅ Geofencing démarré
I/Capacitor: 🎯 Geofencing activé sur Map.tsx
I/Capacitor: 📍 Position: 5.3599517, -4.0082563 (±1000m)
I/Capacitor: 📍 Entrée zone: Basilique Notre-Dame de la Paix (150m)
I/Capacitor: 🔔 Notification envoyée: Vous êtes arrivé !
```

### Logs Erreurs Potentielles

```log
# Si API backend pas lancé
E/Capacitor: [ERROR:fetch] Failed to fetch: http://10.0.2.2:5000/api
→ Normal si backend pas lancé, app utilise données mockées

# Si permissions refusées
E/CapacitorGeolocation: Permission denied
→ Accepter manuellement : Settings > Apps > Audio Guide > Permissions

# Si Mapbox token invalide
E/Mapbox: Invalid token
→ Vérifier VITE_MAPBOX_TOKEN dans .env.production
```

---

## 🐛 Dépannage

### Problème 1 : Écran blanc persiste

**Solutions** :
1. Dans Android Studio : **Build > Clean Project**
2. Attendre fin, puis **Build > Rebuild Project**
3. Relancer (▶️)

### Problème 2 : Notifications ne s'affichent pas

**Vérifications** :
1. Logcat : Chercher `CapacitorNotifications`
2. Si "permission denied" :
   - Émulateur > Settings > Apps > Audio Guide > Permissions
   - Activer **Location** et **Notifications**
3. Relancer l'app

### Problème 3 : GPS ne fonctionne pas

**Solutions** :
1. Extended Controls > Location
2. Vérifier que "Location" est **ON** dans l'émulateur
3. Essayer coordonnées Abidjan : `5.3160, -4.0305`

### Problème 4 : Badge geofencing pas visible

**Cause** : `geofencingState.isActive` = false

**Solutions** :
1. Vérifier Logcat : "🎯 Geofencing activé"
2. Si absent, vérifier imports dans Map.tsx
3. Vérifier permissions géolocalisation

---

## 📊 Checklist Finale

Avant de valider que tout fonctionne :

### Build & Déploiement
- [x] npm run build réussi (1m 20s)
- [x] npx cap sync android réussi (1.2s)
- [x] .env.production créé avec 10.0.2.2
- [x] Android Studio ouvert
- [ ] Gradle sync terminé
- [ ] Émulateur lancé
- [ ] App installée et lancée

### Permissions
- [ ] Permission Localisation accordée
- [ ] Permission Notifications accordée
- [ ] Logcat confirme permissions OK

### Fonctionnalités de Base
- [ ] Page Home s'affiche correctement
- [ ] Navigation tabs fonctionne (Home, Map, Favorites, Profile)
- [ ] Images attractions chargent (ou fallback)
- [ ] Recherche fonctionne

### Geofencing (Sprint 3 Phase 1)
- [ ] Badge 🔔 vert visible dans Map
- [ ] Simulation GPS fonctionne (Extended Controls)
- [ ] Notification "🎯 Vous êtes arrivé !" s'affiche quand < 200m
- [ ] Badge compteur augmente (1, 2, 3...)
- [ ] Notification "👋 Au revoir !" quand > 200m
- [ ] Clic notification → AttractionDetail

### Fonctionnalités Avancées
- [ ] AudioPlayer s'ouvre et fonctionne
- [ ] Favoris peuvent être ajoutés/retirés
- [ ] Map Mapbox s'affiche avec markers

---

## 🎯 Objectif Phase 1

**✅ VALIDÉ si** :

1. App lance sans écran blanc ✅
2. Badge geofencing 🔔 vert visible ✅
3. Notification proximité fonctionne ✅
4. Navigation notification → detail fonctionne ✅

**Status actuel** : 🟢 **PRÊT POUR TESTS**

---

## 📱 Commande Finale

Si vous devez relancer Android Studio :

```powershell
cd C:\Users\jpama\Desktop\i\audioguide\ionic-app
npx cap open android
```

---

**🚀 L'application est maintenant prête pour les tests Android !**

**Partagez vos résultats / screenshots / logs Logcat si besoin d'aide ! 📸**
