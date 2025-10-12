#!/usr/bin/env node

/**
 * Script d'analyse des performances - Audio Guide CI
 * Compare les builds standard vs optimisé
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('📊 ANALYSE DES PERFORMANCES - Audio Guide CI');
console.log('===========================================\n');

function formatSize(bytes) {
  const sizes = ['B', 'KB', 'MB', 'GB'];
  if (bytes === 0) return '0 B';
  const i = Math.floor(Math.log(bytes) / Math.log(1024));
  return Math.round(bytes / Math.pow(1024, i) * 100) / 100 + ' ' + sizes[i];
}

function analyzeBuild(buildDir, configName) {
  console.log(`📈 Analyse du build ${configName}:`);
  console.log('─'.repeat(40));
  
  if (!fs.existsSync(buildDir)) {
    console.log(`❌ Dossier ${buildDir} introuvable`);
    return null;
  }

  const stats = {
    totalSize: 0,
    jsSize: 0,
    cssSize: 0,
    assetsSize: 0,
    fileCount: 0,
    chunks: []
  };

  function analyzeDirectory(dir, prefix = '') {
    const items = fs.readdirSync(dir);
    
    for (const item of items) {
      const fullPath = path.join(dir, item);
      const stat = fs.statSync(fullPath);
      
      if (stat.isDirectory()) {
        analyzeDirectory(fullPath, prefix + item + '/');
      } else {
        const size = stat.size;
        stats.totalSize += size;
        stats.fileCount++;
        
        const ext = path.extname(item).toLowerCase();
        const relativePath = prefix + item;
        
        if (ext === '.js') {
          stats.jsSize += size;
          stats.chunks.push({ name: relativePath, size, type: 'JS' });
        } else if (ext === '.css') {
          stats.cssSize += size;
          stats.chunks.push({ name: relativePath, size, type: 'CSS' });
        } else {
          stats.assetsSize += size;
          stats.chunks.push({ name: relativePath, size, type: 'Asset' });
        }
      }
    }
  }

  analyzeDirectory(buildDir);

  // Trier les chunks par taille
  stats.chunks.sort((a, b) => b.size - a.size);

  console.log(`📦 Taille totale: ${formatSize(stats.totalSize)}`);
  console.log(`📄 JavaScript: ${formatSize(stats.jsSize)}`);
  console.log(`🎨 CSS: ${formatSize(stats.cssSize)}`);
  console.log(`🖼️ Assets: ${formatSize(stats.assetsSize)}`);
  console.log(`📊 Nombre de fichiers: ${stats.fileCount}`);
  
  console.log('\n🏆 Top 10 des plus gros fichiers:');
  stats.chunks.slice(0, 10).forEach((chunk, i) => {
    const icon = chunk.type === 'JS' ? '📄' : chunk.type === 'CSS' ? '🎨' : '🖼️';
    console.log(`  ${i + 1}. ${icon} ${chunk.name} - ${formatSize(chunk.size)}`);
  });
  
  console.log('');
  return stats;
}

async function runPerformanceAnalysis() {
  console.log('🔨 Génération des builds pour comparaison...\n');

  try {
    // Build standard
    console.log('⚡ Build standard...');
    execSync('npm run build', { stdio: 'pipe' });
    const standardStats = analyzeBuild('dist', 'Standard');
    
    if (fs.existsSync('dist-standard')) {
      execSync('rmdir /s /q dist-standard', { shell: true });
    }
    execSync('move dist dist-standard', { shell: true });

    // Build optimisé
    console.log('🚀 Build optimisé...');
    execSync('npx vite build --config vite.config.optimized.ts', { stdio: 'pipe' });
    const optimizedStats = analyzeBuild('dist', 'Optimisé');

    // Comparaison
    if (standardStats && optimizedStats) {
      console.log('📊 COMPARAISON DES PERFORMANCES');
      console.log('═'.repeat(45));
      
      const improvement = {
        total: ((standardStats.totalSize - optimizedStats.totalSize) / standardStats.totalSize * 100),
        js: ((standardStats.jsSize - optimizedStats.jsSize) / standardStats.jsSize * 100),
        css: ((standardStats.cssSize - optimizedStats.cssSize) / standardStats.cssSize * 100)
      };

      console.log(`📦 Taille totale:`);
      console.log(`   Standard: ${formatSize(standardStats.totalSize)}`);
      console.log(`   Optimisé: ${formatSize(optimizedStats.totalSize)}`);
      console.log(`   🎯 Amélioration: ${improvement.total > 0 ? '-' : '+'}${Math.abs(improvement.total).toFixed(1)}%\n`);

      console.log(`📄 JavaScript:`);
      console.log(`   Standard: ${formatSize(standardStats.jsSize)}`);
      console.log(`   Optimisé: ${formatSize(optimizedStats.jsSize)}`);
      console.log(`   🎯 Amélioration: ${improvement.js > 0 ? '-' : '+'}${Math.abs(improvement.js).toFixed(1)}%\n`);

      console.log(`🎨 CSS:`);
      console.log(`   Standard: ${formatSize(standardStats.cssSize)}`);
      console.log(`   Optimisé: ${formatSize(optimizedStats.cssSize)}`);
      console.log(`   🎯 Amélioration: ${improvement.css > 0 ? '-' : '+'}${Math.abs(improvement.css).toFixed(1)}%\n`);

      // Recommandations
      console.log('💡 RECOMMANDATIONS');
      console.log('─'.repeat(20));
      
      if (improvement.total > 5) {
        console.log('✅ Excellente optimisation ! Bundle size réduit significativement.');
      } else if (improvement.total > 0) {
        console.log('👍 Bonne optimisation, amélioration modérée du bundle size.');
      } else {
        console.log('⚠️ L\'optimisation a augmenté la taille. Vérifiez la configuration.');
      }

      // Analyse des chunks
      const largeChunks = optimizedStats.chunks.filter(c => c.size > 500 * 1024 && c.type === 'JS');
      if (largeChunks.length > 0) {
        console.log('\n⚠️ Chunks volumineux détectés (>500KB):');
        largeChunks.forEach(chunk => {
          console.log(`   📄 ${chunk.name} - ${formatSize(chunk.size)}`);
        });
        console.log('   💡 Considérez un chunking plus fin pour ces fichiers.');
      }

      // Score de performance mobile
      const mobileScore = calculateMobileScore(optimizedStats);
      console.log(`\n📱 Score Performance Mobile: ${mobileScore}/100`);
      
      if (mobileScore >= 90) {
        console.log('🏆 Excellent pour mobile !');
      } else if (mobileScore >= 75) {
        console.log('👍 Bon pour mobile');
      } else if (mobileScore >= 60) {
        console.log('⚠️ Acceptable pour mobile, optimisations recommandées');
      } else {
        console.log('❌ Problématique pour mobile, optimisations nécessaires');
      }
    }

  } catch (error) {
    console.error('❌ Erreur lors de l\'analyse:', error.message);
  }
}

function calculateMobileScore(stats) {
  let score = 100;
  
  // Pénalité pour taille totale (>1MB = -20 points)
  if (stats.totalSize > 1024 * 1024) {
    score -= 20;
  } else if (stats.totalSize > 512 * 1024) {
    score -= 10;
  }
  
  // Pénalité pour gros chunks JS (>200KB = -15 points)
  const largeJSChunks = stats.chunks.filter(c => c.type === 'JS' && c.size > 200 * 1024);
  score -= largeJSChunks.length * 15;
  
  // Pénalité pour nombre excessif de fichiers (>50 = -10 points)
  if (stats.fileCount > 50) {
    score -= 10;
  }
  
  // Bonus pour chunking (plus de 5 chunks JS = +5 points)
  const jsChunks = stats.chunks.filter(c => c.type === 'JS');
  if (jsChunks.length >= 5) {
    score += 5;
  }
  
  return Math.max(0, Math.min(100, score));
}

// Générer un rapport complet
function generateReport() {
  const report = {
    timestamp: new Date().toISOString(),
    analysis: 'Performance analysis completed',
    recommendations: [
      'Utiliser la configuration optimisée pour la production',
      'Implémenter le lazy loading pour les pages non-critiques',
      'Optimiser les images et assets',
      'Considérer la compression Brotli sur le serveur',
      'Mettre en place un CDN pour les assets statiques'
    ]
  };

  fs.writeFileSync('performance-report.json', JSON.stringify(report, null, 2));
  console.log('\n📄 Rapport détaillé sauvegardé: performance-report.json');
}

// Exécution
console.log('🚀 Démarrage de l\'analyse...\n');
runPerformanceAnalysis()
  .then(() => {
    generateReport();
    console.log('\n✅ Analyse terminée avec succès !');
  })
  .catch(error => {
    console.error('\n❌ Erreur:', error.message);
    process.exit(1);
  });