# 📱 Configuration Backend Connectivity pour Device Android

## 🎯 Objectif
Configurer le firewall Windows et le backend pour permettre l'accès depuis un device Android sur le réseau local.

**Durée estimée** : 15 minutes

---

## ✅ Prérequis

- [ ] Dev server lancé : http://localhost:5173/
- [ ] Backend API prêt (code backend-api/)
- [ ] Device Android sur le **même réseau WiFi** que le PC
- [ ] PowerShell avec **privilèges administrateur**

---

## 🔧 Étape 1 : Configuration Firewall (5 min)

### Objectif
Autoriser les connexions entrantes et sortantes sur le port 5000.

### Actions

1. **Ouvrir PowerShell en Administrateur**
   
   ```
   Clic droit sur "Windows PowerShell"
   → "Exécuter en tant qu'administrateur"
   ```

2. **Naviguer vers le dossier du projet**
   
   ```powershell
   cd C:\Users\jpama\Desktop\i\audioguide\ionic-app-v2
   ```

3. **Exécuter le script de configuration**
   
   ```powershell
   .\allow-port-5000.ps1
   ```

4. **Vérifier la sortie**
   
   **✅ Attendu** :
   ```
   ========================================
   Configuration Firewall - Backend API
   Port 5000 - Réseau Local
   ========================================
   
   ✅ Privilèges administrateur détectés
   
   📥 Création de la règle Inbound (port 5000)...
      ✅ Règle Inbound créée avec succès
   
   📤 Création de la règle Outbound (port 5000)...
      ✅ Règle Outbound créée avec succès
   
   ========================================
   Configuration Terminée
   ========================================
   
   🌐 Adresse IP de votre PC :
      IP : 192.168.1.9
   
   ✅ URL pour device Android : http://192.168.1.9:5000
   ```

5. **Noter l'adresse IP du PC**
   
   **Exemple** : `192.168.1.9`
   
   ⚠️ **Important** : Cette IP sera utilisée pour configurer `apiConfig.ts`

### Vérification

```powershell
# Vérifier les règles firewall créées
Get-NetFirewallRule -DisplayName "Backend API - Port 5000*"
```

**✅ Attendu** :
```
DisplayName                   : Backend API - Port 5000 (Inbound)
Direction                     : Inbound
Action                        : Allow

DisplayName                   : Backend API - Port 5000 (Outbound)
Direction                     : Outbound
Action                        : Allow
```

---

## 🚀 Étape 2 : Démarrer le Backend API (2 min)

### Actions

1. **Ouvrir un nouveau terminal PowerShell** (pas besoin d'être admin)

2. **Naviguer vers backend-api**
   
   ```powershell
   cd C:\Users\jpama\Desktop\i\audioguide\backend-api
   ```

3. **Vérifier le fichier .env**
   
   ```powershell
   cat .env
   ```
   
   **✅ Attendu** :
   ```
   MONGODB_URI=mongodb://localhost:27017/audioguide
   PORT=5000
   JWT_SECRET=your-secret-key
   ```

4. **Démarrer le backend**
   
   ```powershell
   npm run dev
   ```
   
   **✅ Attendu** :
   ```
   [nodemon] starting `ts-node src/index.ts`
   Server running on port 5000
   MongoDB connected successfully
   ```

### Vérification

```powershell
# Dans un autre terminal
curl http://localhost:5000/api/health
```

**✅ Attendu** :
```json
{"status":"ok","message":"API is running"}
```

---

## 🌐 Étape 3 : Vérifier l'Accès Réseau (3 min)

### Test depuis PC

1. **Tester avec l'IP locale**
   
   ```powershell
   curl http://192.168.1.9:5000/api/health
   ```
   
   **✅ Attendu** : `{"status":"ok","message":"API is running"}`

2. **Tester avec un navigateur**
   
   Ouvrir Chrome : http://192.168.1.9:5000/api/health
   
   **✅ Attendu** : Page JSON affichée

### Test depuis Android Chrome

⚠️ **Prérequis** : Device Android connecté au **même WiFi**

1. **Ouvrir Chrome sur Android**

2. **Naviguer vers l'URL**
   
   ```
   http://192.168.1.9:5000/api/health
   ```

3. **Vérifier la réponse**
   
   **✅ Attendu** : `{"status":"ok","message":"API is running"}`
   
   **❌ Si erreur** :
   - Vérifier que le device est sur le même WiFi
   - Vérifier que le backend est lancé
   - Vérifier les règles firewall (Étape 1)

---

## 🔧 Étape 4 : Mettre à Jour apiConfig.ts (2 min)

### Objectif
Mettre à jour l'IP locale dans la configuration de l'app.

### Actions

1. **Ouvrir le fichier**
   
   ```
   ionic-app-v2/src/config/apiConfig.ts
   ```

2. **Vérifier la ligne LOCAL_IP**
   
   ```typescript
   const LOCAL_IP = '192.168.1.9'; // Votre IP détectée
   ```
   
   ✅ **Si l'IP est correcte** : Rien à faire
   
   ⚠️ **Si l'IP est différente** : Remplacer par l'IP détectée à l'Étape 1

3. **Vérifier la fonction getApiBaseUrl()**
   
   ```typescript
   export function getApiBaseUrl(): string {
     const isProduction = import.meta.env.PROD;
     const platform = Capacitor.getPlatform();
     const isNative = platform === 'android' || platform === 'ios';
   
     if (isProduction && !isNative) {
       return PRODUCTION_API_URL;
     }
   
     if (isNative) {
       return `http://${LOCAL_IP}:${LOCAL_PORT}`;
     }
   
     return `http://localhost:${LOCAL_PORT}`;
   }
   ```
   
   ✅ Logique attendue :
   - Web dev : `http://localhost:5000`
   - Android/iOS : `http://192.168.1.9:5000`
   - Production : `https://your-backend.onrender.com`

4. **Rebuild l'app** (si déjà installée sur device)
   
   ```powershell
   cd C:\Users\jpama\Desktop\i\audioguide\ionic-app-v2
   npm run build
   npx cap sync android
   ```

---

## 🧪 Étape 5 : Tests de Validation (3 min)

### Test 1 : Backend Health Check

```powershell
# Depuis PC
curl http://192.168.1.9:5000/api/health

# Depuis Android Chrome
# http://192.168.1.9:5000/api/health
```

**✅ Attendu** : `{"status":"ok","message":"API is running"}`

---

### Test 2 : Endpoint Attractions

```powershell
# Depuis PC
curl http://192.168.1.9:5000/api/attractions

# Depuis Android Chrome
# http://192.168.1.9:5000/api/attractions
```

**✅ Attendu** : JSON array avec attractions

---

### Test 3 : apiConfig Logs

Dans Chrome DevTools (web) ou via logcat (Android) :

```javascript
import { logApiConfig } from './config/apiConfig';
logApiConfig();
```

**✅ Attendu** :
```
[API Config] Environment: development
[API Config] Platform: web (ou android)
[API Config] Is Native: false (ou true)
[API Config] Is Production: false
[API Config] Base URL: http://localhost:5000 (ou http://192.168.1.9:5000)
```

---

## 🐛 Troubleshooting

### Problème 1 : Firewall Script Échoue

**Symptôme** :
```
❌ ERREUR : Ce script nécessite des privilèges administrateur
```

**Solution** :
1. Fermer PowerShell
2. Clic droit sur PowerShell → "Exécuter en tant qu'administrateur"
3. Relancer le script

---

### Problème 2 : Backend Ne Démarre Pas

**Symptôme** :
```
[nodemon] starting `ts-node src/index.ts`
(Pas de "Server running on port 5000")
```

**Solutions** :

1. **Vérifier MongoDB**
   ```powershell
   Get-Process mongod
   ```
   Si pas de résultat, démarrer MongoDB (selon votre installation)

2. **Vérifier le port 5000**
   ```powershell
   netstat -ano | findstr :5000
   ```
   Si occupé, tuer le processus ou changer de port

3. **Vérifier les dépendances**
   ```powershell
   cd backend-api
   npm install
   ```

---

### Problème 3 : Device Ne Peut Pas Accéder au Backend

**Symptôme** :
```
ERR_CONNECTION_REFUSED sur Android Chrome
```

**Solutions** :

1. **Vérifier que le device est sur le même WiFi**
   - Paramètres Android → WiFi
   - Comparer le nom du réseau avec le PC

2. **Vérifier l'IP du PC**
   ```powershell
   ipconfig | Select-String "IPv4"
   ```
   Comparer avec l'IP dans `apiConfig.ts`

3. **Vérifier les règles firewall**
   ```powershell
   Get-NetFirewallRule -DisplayName "Backend API - Port 5000*"
   ```
   Si pas de résultat, relancer le script `allow-port-5000.ps1`

4. **Tester depuis PC d'abord**
   ```powershell
   curl http://192.168.1.9:5000/api/health
   ```
   Si ça ne marche pas depuis PC, c'est un problème local (firewall, backend)

5. **Désactiver temporairement le pare-feu Windows** (debug only)
   ```
   Paramètres Windows → Mise à jour et sécurité
   → Sécurité Windows → Pare-feu
   → Désactiver (temporairement)
   ```
   ⚠️ **À réactiver après les tests !**

---

### Problème 4 : IP Change Après Redémarrage PC

**Symptôme** :
L'IP détectée à l'Étape 1 change après redémarrage du PC (DHCP).

**Solution 1** : Configurer IP statique

1. Paramètres Windows → Réseau et Internet
2. WiFi → Propriétés de votre réseau
3. Paramètres IP → Modifier
4. Manuel → IPv4 activé
5. Entrer l'IP fixe : `192.168.1.9`

**Solution 2** : Détecter l'IP dynamiquement (déjà implémenté)

Le script `allow-port-5000.ps1` détecte automatiquement l'IP à chaque exécution.

---

## 📋 Checklist de Validation

### Configuration Firewall
- [ ] Script `allow-port-5000.ps1` exécuté sans erreur
- [ ] Règles Inbound et Outbound créées
- [ ] IP du PC détectée (ex: 192.168.1.9)

### Backend API
- [ ] Backend démarre : "Server running on port 5000"
- [ ] MongoDB connecté : "MongoDB connected successfully"
- [ ] Health check OK depuis PC : `curl http://localhost:5000/api/health`
- [ ] Health check OK avec IP : `curl http://192.168.1.9:5000/api/health`

### Accès Device
- [ ] Device sur le même WiFi que le PC
- [ ] Health check OK depuis Android Chrome : `http://192.168.1.9:5000/api/health`
- [ ] Endpoints attractions accessibles : `http://192.168.1.9:5000/api/attractions`

### Configuration App
- [ ] `apiConfig.ts` → LOCAL_IP correcte
- [ ] Build + sync Capacitor : `npm run build && npx cap sync android`

---

## 🎉 Validation Finale

### Test Complet

1. **PC** : Backend lancé sur port 5000 ✅
2. **PC** : `curl http://192.168.1.9:5000/api/health` → OK ✅
3. **Android Chrome** : `http://192.168.1.9:5000/api/health` → OK ✅
4. **apiConfig.ts** : LOCAL_IP = `192.168.1.9` ✅

### Prochaine Étape

✅ **Configuration terminée !**

🚀 **Prochaine étape** : Installation de l'app sur device Android

**Guide** : `INSTALLATION_ANDROID_GUIDE.md`

---

**Date** : 11 octobre 2025  
**Version** : 1.0.0  
**Sprint** : 3 - Géolocalisation & Offline  
**Étape** : Configuration Backend Device
