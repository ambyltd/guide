# 💾 Guide de Sauvegarde et Restauration des Données

Ce guide explique comment sauvegarder et restaurer les données de l'application Audio Guide Côte d'Ivoire.

## 📤 Exporter/Sauvegarder les Données

### Commande de sauvegarde
```bash
npm run backup
```

Cette commande va :
- Se connecter à MongoDB Atlas
- Exporter toutes les données (attractions, tours, guides audio, utilisateurs)
- Créer un fichier de sauvegarde avec timestamp dans `/backups/`
- Créer un fichier `latest-backup.json` pour faciliter la restauration
- Générer un fichier de statistiques `backup-stats.json`

### Fichiers générés
```
backups/
├── backup-YYYY-MM-DDTHH-mm-ss-sssZ.json  # Sauvegarde avec timestamp
├── latest-backup.json                     # Dernière sauvegarde (pour restauration facile)
└── backup-stats.json                      # Statistiques de la dernière sauvegarde
```

## 📥 Importer/Restaurer les Données

### Restaurer la dernière sauvegarde
```bash
npm run restore
```

### Restaurer un fichier de sauvegarde spécifique
```bash
npm run restore:file backup-2025-09-02T10-30-45-123Z.json
```

### Processus de restauration
1. Connexion à MongoDB
2. Nettoyage complet de la base de données
3. Import des données depuis le fichier de sauvegarde
4. Vérification post-import

## 📊 Structure des Données Sauvegardées

```json
{
  "metadata": {
    "exportDate": "2025-09-02T10:30:45.123Z",
    "version": "1.0.0",
    "description": "Sauvegarde complète de la base de données",
    "counts": {
      "attractions": 15,
      "audioGuides": 15,
      "tours": 8,
      "users": 5
    }
  },
  "data": {
    "attractions": [...],
    "audioGuides": [...],
    "tours": [...],
    "users": [...]
  }
}
```

## 🔄 Workflow Recommandé

### Avant un déploiement
```bash
# 1. Sauvegarder les données actuelles
npm run backup

# 2. Tester les nouvelles fonctionnalités
npm run seed:complete
npm run dev

# 3. En cas de problème, restaurer
npm run restore
```

### Sauvegarde régulière
```bash
# Créer une sauvegarde quotidienne
npm run backup
```

### Migration entre environnements
```bash
# Sur l'environnement source
npm run backup

# Copier le fichier backup-XXXX.json vers l'autre environnement
# Sur l'environnement de destination
npm run restore:file backup-XXXX.json
```

## 🛡️ Sécurité et Bonnes Pratiques

1. **Sauvegardes régulières** : Effectuer une sauvegarde avant chaque modification importante
2. **Versionning** : Les fichiers de sauvegarde incluent un timestamp pour éviter les conflits
3. **Vérification** : Chaque restauration inclut une vérification des données importées
4. **Nettoyage** : La restauration nettoie complètement la base avant l'import

## 📁 Gestion des Fichiers de Sauvegarde

### Localisation
- Tous les fichiers sont dans le dossier `/backups/`
- Le fichier `latest-backup.json` est toujours la dernière sauvegarde
- Les fichiers avec timestamp permettent un historique

### Nettoyage
```bash
# Supprimer les anciennes sauvegardes (garder les 10 dernières)
# (À faire manuellement selon vos besoins)
```

## 🚨 En Cas de Problème

### Base de données corrompue
```bash
npm run restore
```

### Données de test nécessaires
```bash
npm run seed:complete
```

### Retour à un état antérieur
```bash
npm run restore:file backup-YYYY-MM-DD.json
```

## 📋 Commandes Rapides

```bash
# Sauvegarder
npm run backup

# Restaurer la dernière sauvegarde
npm run restore

# Peupler avec des données de test
npm run seed:complete

# Vérifier l'état de la base
node test-seed-complete.js
```
