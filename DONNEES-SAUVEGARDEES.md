# 📊 Données Sauvegardées - Application Audio Guide Côte d'Ivoire

**Date de sauvegarde**: 3 septembre 2025  
**Version**: 1.0.0 - Base de données complète

## 🗂️ Contenu de la Sauvegarde

### 📍 Attractions (15 total)

#### Par Ville

- **Abidjan** (4) : Musée des Civilisations, Cathédrale Saint-Paul, Parc du Banco, Marché de Treichville
- **Yamoussoukro** (2) : Basilique Notre-Dame de la Paix, Maison du Parti
- **Bouaké** (2) : Mosquée de Bouaké, Marché Central
- **San-Pédro** (2) : Port de San-Pédro, Plage de Grand-Béréby
- **Korhogo** (2) : Musée Régional, Artisanat Sénoufo
- **Man** (2) : Cascades de Man, Mont Tonkpi
- **Grand-Bassam** (1) : Centre Historique UNESCO

#### Par Catégorie

- **Museums** (4) : Musées et centres culturels
- **Religious** (3) : Sites religieux (Basilique, Cathédrale, Mosquée)
- **Nature** (4) : Parcs, cascades, montagnes
- **Monument** (2) : Sites historiques et patrimoniaux
- **Cultural** (2) : Centres culturels et artisanaux

#### Par Région

- **Lagunes** (4) : Région d'Abidjan
- **Lacs** (2) : Région de Yamoussoukro
- **Vallée du Bandama** (2) : Région de Bouaké
- **Bas-Sassandra** (2) : Région de San-Pédro
- **Savanes** (2) : Région de Korhogo
- **Montagnes** (2) : Région de Man
- **Sud-Comoé** (1) : Région de Grand-Bassam

### 🎯 Circuits Touristiques (8 total)

1. **Découverte d'Abidjan** - Circuit urbain (4 attractions)
2. **Nord Historique** - Patrimoine culturel (3 attractions)
3. **Parcs Naturels** - Écotourisme (3 attractions)
4. **Sites Religieux** - Patrimoine religieux (3 attractions)
5. **Côte Ouest** - Littoral et ports (2 attractions)
6. **Montagnes de l'Ouest** - Nature et paysages (2 attractions)
7. **Patrimoine Colonial** - Histoire coloniale (2 attractions)
8. **Artisanat Traditionnel** - Culture locale (2 attractions)

### 🎧 Guides Audio (15 total)

Chaque attraction dispose d'un guide audio avec :

- **Audio français et anglais**
- **Durée** : 3-8 minutes
- **Format** : MP3 haute qualité
- **Contenu** : Histoire, culture, informations pratiques
- **Navigation** : Points d'intérêt géolocalisés

### 👥 Utilisateurs de Test (5 total)

- **Administrateurs** : 2 comptes admin
- **Éditeurs** : 2 comptes éditeur  
- **Utilisateurs** : 1 compte utilisateur standard

## 🎨 Caractéristiques des Données

### 🌍 Couverture Géographique

- **7 villes** représentatives de la Côte d'Ivoire
- **7 régions** administratives couvertes
- **Coordonnées GPS** précises pour chaque attraction
- **Adresses complètes** et informations d'accès

### 🏷️ Métadonnées Riches

- **Descriptions bilingues** (français/anglais)
- **Horaires d'ouverture** détaillés
- **Tarifs d'entrée** en francs CFA
- **Évaluations et avis** (ratings 3.8-4.9/5)
- **Photos haute résolution** (2-4 par attraction)

### 🔍 Fonctionnalités de Recherche

- **Tags multilingues** pour la recherche
- **Filtrage avancé** par catégorie, ville, région
- **Recommandations** basées sur les ratings
- **Géolocalisation** pour le tri par proximité

## 📈 Statistiques de Contenu

### Volume de Données

- **Content textuel** : ~50,000 caractères
- **Images référencées** : 45 URLs Unsplash
- **Fichiers audio** : 15 guides (URLs de démo)
- **Données géographiques** : 15 points GPS
- **Métadonnées** : Horaires, tarifs, contacts

### Qualité des Données

- **Données réalistes** basées sur de vrais lieux
- **Informations touristiques** authentiques
- **Contenu éditorial** professionnel
- **Géolocalisation** précise
- **Multilingue** (FR/EN)

## 🔄 Utilisation de la Sauvegarde

### Pour le Développement

```bash
# Restaurer les données de développement
npm run restore

# Vérifier le contenu
node test-seed-complete.js
```

### Pour la Production

```bash
# Utiliser un fichier de sauvegarde spécifique
npm run restore:file backup-2025-09-03.json
```

### Pour les Tests

```bash
# Peupler avec ces données complètes
npm run seed:complete

# Tester tous les endpoints
node test-all-new-endpoints.js
```

## 📦 Fichiers de Sauvegarde

- **backup-[timestamp].json** : Sauvegarde horodatée
- **latest-backup.json** : Dernière sauvegarde (pour restauration rapide)
- **backup-stats.json** : Statistiques et métadonnées

## 🎯 Cas d'Usage

Cette sauvegarde permet de :

1. **Développer le CMS** avec des données réalistes
2. **Tester l'application mobile** avec du contenu varié
3. **Démontrer les fonctionnalités** aux parties prenantes
4. **Valider les performances** avec un volume de données représentatif
5. **Former les utilisateurs** sur du contenu authentique

---

**Cette sauvegarde constitue une base solide pour le développement complet de l'application Audio Guide Côte d'Ivoire** 🚀
