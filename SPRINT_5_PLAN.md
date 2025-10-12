# 🚀 Sprint 5 : CMS Admin Panel & Feature Management

**Objectif** : Intégrer les nouveaux endpoints backend dans le CMS web et créer un panneau d'administration pour gérer les fonctionnalités avancées de l'app mobile.

**Durée estimée** : 4h30  
**Date de début** : 12 octobre 2025

---

## 🎯 Objectifs du Sprint

### 1. Analytics Dashboard (CMS)
- ✅ Intégrer endpoint `GET /api/analytics/dashboard`
- ✅ Afficher statistiques globales (users, attractions, activities)
- ✅ Graphiques : Top attractions, Top users, Activity by type
- ✅ Timeline des activités récentes

### 2. Feature Flags Management (CMS)
- ✅ Créer modèle `FeatureFlag` (backend)
- ✅ Endpoints admin : GET, PATCH pour toggle features
- ✅ Interface CMS : Toggle switches pour activer/désactiver
- ✅ Features gérées :
  - Social Sharing
  - Advanced Stats
  - Geofencing
  - Offline Mode
  - Background Sync
  - Audio Cache
  - Image Cache
  - Push Notifications
  - Dark Mode
  - Beta Features

### 3. Mobile Feature Service
- ✅ Service `featureFlagService.ts` avec cache local
- ✅ Hook `useFeatureFlag()` pour React components
- ✅ Auto-refresh (1h) et fallback enabled
- ✅ Intégration dans composants existants

### 4. Configuration Panel (Bonus)
- ⏸️ Paramètres globaux (cache size, sync interval, etc.)
- ⏸️ Thèmes et branding
- ⏸️ Limites et quotas

---

## 📋 Todo List (10 phases)

### Phase 1 : Backend Admin Endpoints (30 min)
**Tâches** :
1. Créer `backend-api/src/controllers/adminController.ts`
2. Endpoints :
   - `GET /api/admin/features` - Liste feature flags
   - `PATCH /api/admin/features/:id` - Toggle feature
   - `GET /api/admin/config` - Configuration globale
3. Routes dans `backend-api/src/routes/admin.ts`

**Livrables** :
- adminController.ts (200 lignes)
- admin.ts routes (30 lignes)

---

### Phase 2 : Backend Models FeatureFlag (20 min)
**Tâches** :
1. Créer `backend-api/src/models/FeatureFlag.ts`
2. Schema :
   ```typescript
   {
     key: string (unique),
     name: string,
     description: string,
     enabled: boolean,
     requiredVersion: string,
     category: 'core' | 'social' | 'analytics' | 'offline' | 'experimental',
     metadata: object
   }
   ```
3. Indexes : `{ key: 1 }`, `{ category: 1, enabled: 1 }`

**Livrables** :
- FeatureFlag.ts (80 lignes)

---

### Phase 3 : CMS Analytics Dashboard Page (60 min)
**Tâches** :
1. Créer `cms-web/src/pages/Analytics.tsx`
2. Composants :
   - **StatsCards** : Total users, attractions, activities (4 cards)
   - **TopAttractionsChart** : BarChart horizontal (recharts)
   - **TopUsersTable** : Table Material-UI avec ranking
   - **ActivityByTypeChart** : PieChart (recharts)
   - **RecentActivitiesTimeline** : Liste chronologique
3. Styles avec Material-UI (Grid, Card, Typography)

**Livrables** :
- Analytics.tsx (400 lignes)
- AnalyticsCharts.tsx (200 lignes, composants charts)

---

### Phase 4 : CMS Feature Management Page (45 min)
**Tâches** :
1. Créer `cms-web/src/pages/Features.tsx`
2. Liste des 10 feature flags avec :
   - Toggle switch (on/off)
   - Nom + Description
   - Version requise
   - Catégorie (chip coloré)
   - Dernière mise à jour
3. Modal de confirmation avant toggle
4. Filtres par catégorie (tabs)

**Livrables** :
- Features.tsx (350 lignes)
- FeatureCard.tsx (150 lignes, composant card)

---

### Phase 5 : CMS Sidebar Navigation (15 min)
**Tâches** :
1. Modifier `cms-web/src/components/Sidebar.tsx`
2. Ajouter section "Administration" :
   - Analytics (BarChartIcon)
   - Features (ToggleOnIcon)
   - Configuration (SettingsIcon) [bonus]
3. Grouper avec Divider

**Livrables** :
- Sidebar.tsx (+30 lignes)

---

### Phase 6 : CMS Services API (30 min)
**Tâches** :
1. Créer `cms-web/src/services/analyticsService.ts`
   - `getDashboard()` : GET /api/analytics/dashboard
2. Créer `cms-web/src/services/featuresService.ts`
   - `getFeatures()` : GET /api/admin/features
   - `toggleFeature(id)` : PATCH /api/admin/features/:id
   - `updateFeature(id, data)` : PUT /api/admin/features/:id

**Livrables** :
- analyticsService.ts (100 lignes)
- featuresService.ts (120 lignes)

---

### Phase 7 : Seed Feature Flags (20 min)
**Tâches** :
1. Modifier `backend-api/scripts/seed-complete.ts`
2. Ajouter section feature flags (10 features) :
   ```typescript
   const features = [
     {
       key: 'social_sharing',
       name: 'Partage Social',
       description: 'Partager attractions sur WhatsApp, Facebook, Twitter',
       enabled: true,
       category: 'social',
       requiredVersion: '1.4.0'
     },
     // ... 9 autres
   ];
   ```

**Livrables** :
- seed-complete.ts (+80 lignes)

---

### Phase 8 : Mobile Feature Service (45 min)
**Tâches** :
1. Créer `ionic-app-v2/src/services/featureFlagService.ts`
   - `fetchFeatures()` : GET /api/admin/features
   - `isFeatureEnabled(key)` : Check avec cache
   - `refreshFeatures()` : Auto-refresh (1h)
   - Cache localStorage : `feature_flags_cache`
2. Créer hook `useFeatureFlag(key)`
3. Intégration :
   ```typescript
   // Dans AttractionDetail.tsx
   const { isEnabled } = useFeatureFlag('social_sharing');
   {isEnabled && <ShareButton />}
   ```

**Livrables** :
- featureFlagService.ts (300 lignes)
- useFeatureFlag.ts (100 lignes)

---

### Phase 9 : Tests & Documentation (30 min)
**Tâches** :
1. Créer `backend-api/test-admin-sprint5.js` (tests endpoints)
2. Tests CMS (render pages sans erreurs)
3. Créer `SPRINT5_ADMIN_PANEL.md` (documentation)
4. Screenshots dashboard analytics

**Livrables** :
- test-admin-sprint5.js (200 lignes)
- SPRINT5_ADMIN_PANEL.md (500 lignes)

---

### Phase 10 : Build & Deploy (25 min)
**Tâches** :
1. Build backend : `npm run build`
2. Build CMS : `npm run build`
3. Build mobile : `npm run build`
4. Tests manuels : Toggle feature dans CMS → Vérifier mobile

**Livrables** :
- 3 builds sans erreurs
- Test E2E feature toggle

---

## 📊 Résumé des Livrables

### Backend (500 lignes)
- FeatureFlag.ts - 80 lignes
- adminController.ts - 200 lignes
- admin.ts routes - 30 lignes
- seed-complete.ts - +80 lignes
- test-admin-sprint5.js - 200 lignes

### CMS Web (1350 lignes)
- Analytics.tsx - 400 lignes
- AnalyticsCharts.tsx - 200 lignes
- Features.tsx - 350 lignes
- FeatureCard.tsx - 150 lignes
- Sidebar.tsx - +30 lignes
- analyticsService.ts - 100 lignes
- featuresService.ts - 120 lignes

### Mobile (400 lignes)
- featureFlagService.ts - 300 lignes
- useFeatureFlag.ts - 100 lignes

### Documentation (700 lignes)
- SPRINT5_ADMIN_PANEL.md - 500 lignes
- SPRINT5_PLAN.md - 200 lignes

**Total** : **2950+ lignes**

---

## 🎯 Métriques de Succès

| Critère | Objectif |
|---------|----------|
| Durée | 4h30 |
| Code | 2950+ lignes |
| Erreurs compilation | 0 |
| Tests backend | 8/8 PASS |
| Pages CMS | 2 pages (Analytics, Features) |
| Feature flags | 10 flags |
| Intégration mobile | Hook useFeatureFlag |

---

## 🚀 Prochaines Actions

1. **Phase 1** : Backend Admin Endpoints (30 min)
2. **Phase 2** : Backend Models FeatureFlag (20 min)
3. **Phase 3** : CMS Analytics Dashboard (60 min)
4. **Phase 4** : CMS Feature Management (45 min)
5. **Phase 5-10** : Suite...

**Commencer maintenant ?** 🤔

---

**Plan créé le** : 12 octobre 2025  
**Révision** : v1.0
