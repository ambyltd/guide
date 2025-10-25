import mongoose from 'mongoose';
import dotenv from 'dotenv';
import FeatureFlag from '../src/models/FeatureFlag';

dotenv.config();

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/cotedivoire-audioguide';

/**
 * Script pour seed uniquement les feature flags
 * Utilisation: npx ts-node scripts/seed-feature-flags.ts
 */
async function seedFeatureFlags() {
  try {
    console.log('🎛️  Démarrage du seed des feature flags...');
    
    // Connexion à MongoDB
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Connecté à MongoDB');

    // Suppression des feature flags existants
    await FeatureFlag.deleteMany({});
    console.log('🗑️  Feature flags existants supprimés');

    // Données des 10 feature flags
    const featureFlags = [
      {
        key: 'social_sharing',
        name: 'Partage Social',
        description: 'Permet aux utilisateurs de partager des attractions sur WhatsApp, Facebook, Twitter et autres plateformes sociales.',
        enabled: true,
        requiredVersion: '1.4.0',
        category: 'social',
        metadata: {
          icon: 'ShareIcon',
          color: '#1DA1F2',
          priority: 1,
          platforms: ['whatsapp', 'facebook', 'twitter', 'native']
        }
      },
      {
        key: 'advanced_stats',
        name: 'Statistiques Avancées',
        description: 'Affiche des statistiques détaillées avec graphiques (tendances, achievements, comparaison avec pairs).',
        enabled: true,
        requiredVersion: '1.4.0',
        category: 'analytics',
        metadata: {
          icon: 'BarChartIcon',
          color: '#7C3AED',
          priority: 2,
          charts: ['line', 'bar', 'pie']
        }
      },
      {
        key: 'geofencing',
        name: 'Notifications de Proximité',
        description: 'Envoie des notifications lorsque l\'utilisateur entre ou sort d\'une zone géographique proche d\'une attraction.',
        enabled: true,
        requiredVersion: '1.3.0',
        category: 'core',
        metadata: {
          icon: 'LocationOnIcon',
          color: '#10B981',
          priority: 3,
          radius: 200,
          notificationTypes: ['entry', 'exit', 'nearby']
        }
      },
      {
        key: 'offline_mode',
        name: 'Mode Hors Ligne',
        description: 'Permet l\'utilisation de l\'application sans connexion internet grâce au cache local (Service Worker).',
        enabled: true,
        requiredVersion: '1.3.0',
        category: 'offline',
        metadata: {
          icon: 'CloudOffIcon',
          color: '#F59E0B',
          priority: 4,
          cacheSize: '50MB'
        }
      },
      {
        key: 'background_sync',
        name: 'Synchronisation en Arrière-Plan',
        description: 'Synchronise automatiquement les favoris, avis et statistiques lorsque la connexion est rétablie.',
        enabled: true,
        requiredVersion: '1.3.0',
        category: 'offline',
        metadata: {
          icon: 'SyncIcon',
          color: '#3B82F6',
          priority: 5,
          syncInterval: 30,
          dependencies: ['offline_mode']
        }
      },
      {
        key: 'audio_cache',
        name: 'Cache Audio',
        description: 'Télécharge et stocke les fichiers audio localement pour une lecture hors ligne (IndexedDB).',
        enabled: true,
        requiredVersion: '1.3.0',
        category: 'offline',
        metadata: {
          icon: 'AudiotrackIcon',
          color: '#8B5CF6',
          priority: 6,
          maxSize: '100MB',
          dependencies: ['offline_mode']
        }
      },
      {
        key: 'image_cache',
        name: 'Cache Images',
        description: 'Précache et compresse les images pour un chargement rapide et une utilisation hors ligne (Capacitor Filesystem).',
        enabled: true,
        requiredVersion: '1.3.0',
        category: 'offline',
        metadata: {
          icon: 'ImageIcon',
          color: '#EC4899',
          priority: 7,
          maxSize: '200MB',
          compression: 0.8,
          dependencies: ['offline_mode']
        }
      },
      {
        key: 'push_notifications',
        name: 'Notifications Push',
        description: 'Envoie des notifications push pour les nouveaux contenus, achievements débloqués et promotions.',
        enabled: false,
        requiredVersion: '1.5.0',
        category: 'experimental',
        metadata: {
          icon: 'NotificationsIcon',
          color: '#EF4444',
          priority: 8,
          types: ['achievement', 'content', 'promo', 'reminder']
        }
      },
      {
        key: 'dark_mode',
        name: 'Mode Sombre',
        description: 'Interface en mode sombre pour réduire la fatigue oculaire et économiser la batterie sur écrans OLED.',
        enabled: false,
        requiredVersion: '1.5.0',
        category: 'experimental',
        metadata: {
          icon: 'DarkModeIcon',
          color: '#64748B',
          priority: 9,
          autoSwitch: true
        }
      },
      {
        key: 'beta_features',
        name: 'Fonctionnalités Beta',
        description: 'Active les fonctionnalités expérimentales en cours de développement (réalité augmentée, IA, etc.).',
        enabled: false,
        requiredVersion: '1.6.0',
        category: 'experimental',
        metadata: {
          icon: 'ScienceIcon',
          color: '#F97316',
          priority: 10,
          features: ['ar_preview', 'ai_recommendations', 'voice_commands']
        }
      }
    ];

    // Insertion dans MongoDB
    const created = await FeatureFlag.insertMany(featureFlags);
    
    console.log(`\n✅ ${created.length} feature flags créés avec succès!`);
    console.log(`   🟢 Activés: ${created.filter(f => f.enabled).length}`);
    console.log(`   🔴 Désactivés: ${created.filter(f => !f.enabled).length}`);
    
    // Statistiques par catégorie
    console.log('\n📊 Répartition par catégorie:');
    const categories = ['core', 'social', 'analytics', 'offline', 'experimental'];
    for (const category of categories) {
      const count = created.filter(f => f.category === category).length;
      if (count > 0) {
        console.log(`   ${getCategoryEmoji(category)} ${category}: ${count}`);
      }
    }

    // Liste des feature flags créés
    console.log('\n📋 Feature flags créés:');
    created.forEach((flag, index) => {
      const status = flag.enabled ? '🟢' : '🔴';
      console.log(`   ${status} ${index + 1}. ${flag.name} (${flag.key}) - v${flag.requiredVersion}`);
    });

    console.log('\n🎉 Seed des feature flags terminé avec succès!');

  } catch (error) {
    console.error('❌ Erreur lors du seed:', error);
    throw error;
  } finally {
    await mongoose.disconnect();
    console.log('🔌 Déconnecté de MongoDB');
  }
}

function getCategoryEmoji(category: string): string {
  const emojis: Record<string, string> = {
    core: '🔧',
    social: '🤝',
    analytics: '📊',
    offline: '💾',
    experimental: '🧪'
  };
  return emojis[category] || '📦';
}

// Exécution
seedFeatureFlags();
