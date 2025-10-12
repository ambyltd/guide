#!/usr/bin/env node

/**
 * Script de démarrage rapide pour développement
 * Audio Guide Côte d'Ivoire
 */

const { execSync, spawn } = require('child_process');
const fs = require('fs');

const COLORS = {
  RESET: '\x1b[0m',
  BRIGHT: '\x1b[1m',
  RED: '\x1b[31m',
  GREEN: '\x1b[32m',
  YELLOW: '\x1b[33m',
  BLUE: '\x1b[34m',
  MAGENTA: '\x1b[35m',
  CYAN: '\x1b[36m'
};

function colorLog(color, message) {
  console.log(`${color}${message}${COLORS.RESET}`);
}

function header(title) {
  console.log('\n' + '='.repeat(50));
  colorLog(COLORS.CYAN + COLORS.BRIGHT, `🎧 ${title}`);
  console.log('='.repeat(50));
}

function success(message) {
  colorLog(COLORS.GREEN, `✅ ${message}`);
}

function info(message) {
  colorLog(COLORS.BLUE, `ℹ️  ${message}`);
}

function warning(message) {
  colorLog(COLORS.YELLOW, `⚠️  ${message}`);
}

function error(message) {
  colorLog(COLORS.RED, `❌ ${message}`);
}

async function checkPrerequisites() {
  header('VÉRIFICATION DES PRÉREQUIS');
  
  const checks = [
    ['node --version', 'Node.js'],
    ['npm --version', 'npm'],
    ['npx --version', 'npx']
  ];
  
  for (const [command, name] of checks) {
    try {
      const version = execSync(command, { encoding: 'utf8' }).trim();
      success(`${name}: ${version}`);
    } catch {
      error(`${name} non disponible`);
      return false;
    }
  }
  
  return true;
}

async function setupEnvironment() {
  header('CONFIGURATION ENVIRONNEMENT');
  
  // Vérifier les fichiers de configuration
  const configFiles = [
    ['.env.local', 'Variables d\'environnement locales'],
    ['capacitor.config.ts', 'Configuration Capacitor'],
    ['vite.config.ts', 'Configuration Vite']
  ];
  
  for (const [file, desc] of configFiles) {
    if (fs.existsSync(file)) {
      success(`${desc} - OK`);
    } else {
      warning(`${desc} - Manquant: ${file}`);
    }
  }
  
  // Vérifier les dépendances
  if (!fs.existsSync('node_modules')) {
    info('Installation des dépendances...');
    try {
      execSync('npm install', { stdio: 'inherit' });
      success('Dépendances installées');
    } catch {
      error('Échec installation des dépendances');
      return false;
    }
  } else {
    success('Dépendances déjà installées');
  }
  
  return true;
}

function showDevMenu() {
  header('MENU DÉVELOPPEMENT');
  
  console.log(`
${COLORS.CYAN}Commandes disponibles:${COLORS.RESET}

${COLORS.GREEN}🚀 DÉMARRAGE${COLORS.RESET}
  npm start              - Serveur de développement
  npm run dev            - Mode développement avec hot reload
  
${COLORS.BLUE}🔨 BUILD${COLORS.RESET}
  npm run build          - Build de production
  npm run preview        - Prévisualiser le build
  
${COLORS.YELLOW}🧪 TESTS${COLORS.RESET}
  npm run lint           - Vérification du code
  npm run demo           - Démonstration complète
  
${COLORS.MAGENTA}📱 MOBILE${COLORS.RESET}
  npm run cap:android    - Build et ouvrir Android Studio
  npm run cap:ios        - Build et ouvrir Xcode
  npm run cap:sync       - Synchroniser les plugins Capacitor
  
${COLORS.CYAN}📊 ANALYSE${COLORS.RESET}
  npm run analyze        - Analyse des performances
  npm run validate       - Validation complète
  
${COLORS.RED}🚀 DÉPLOIEMENT${COLORS.RESET}
  npm run deploy         - Déploiement production
  
${COLORS.GREEN}💡 RACCOURCIS UTILES${COLORS.RESET}
  - Ctrl+C pour arrêter le serveur
  - Le serveur sera accessible sur http://localhost:5173
  - Hot reload activé automatiquement
  - Ouvrir http://localhost:5173 dans votre navigateur
`);
}

function startDevServer() {
  header('DÉMARRAGE DU SERVEUR DE DÉVELOPPEMENT');
  
  info('Démarrage en cours...');
  info('URL: http://localhost:5173');
  info('Appuyez sur Ctrl+C pour arrêter');
  
  console.log('\n' + '-'.repeat(50));
  
  // Démarrer le serveur de développement
  const devServer = spawn('npm', ['start'], {
    stdio: 'inherit',
    shell: true
  });
  
  devServer.on('close', (code) => {
    if (code !== 0) {
      error(`Serveur arrêté avec le code ${code}`);
    } else {
      info('Serveur arrêté normalement');
    }
  });
  
  // Gestion propre de l'arrêt
  process.on('SIGINT', () => {
    info('\\nArrêt du serveur...');
    devServer.kill('SIGINT');
    process.exit(0);
  });
}

async function quickStart() {
  try {
    colorLog(COLORS.CYAN + COLORS.BRIGHT, '\\n🎧 AUDIO GUIDE - DÉMARRAGE RAPIDE 🎧\\n');
    
    // Vérifications préalables
    const prereqsOk = await checkPrerequisites();
    if (!prereqsOk) {
      error('Prérequis manquants - installation impossible');
      process.exit(1);
    }
    
    // Configuration environnement
    const envOk = await setupEnvironment();
    if (!envOk) {
      error('Échec de la configuration');
      process.exit(1);
    }
    
    // Afficher le menu
    showDevMenu();
    
    // Proposer de démarrer le serveur
    info('Voulez-vous démarrer le serveur de développement ? (y/n)');
    
    process.stdin.setRawMode(true);
    process.stdin.resume();
    process.stdin.setEncoding('utf8');
    
    process.stdin.on('data', (key) => {
      if (key === 'y' || key === 'Y' || key === '\\r') {
        process.stdin.setRawMode(false);
        startDevServer();
      } else if (key === 'n' || key === 'N') {
        process.stdin.setRawMode(false);
        info('Utilisez "npm start" pour démarrer le serveur plus tard');
        process.exit(0);
      } else if (key === '\\u0003') { // Ctrl+C
        process.stdin.setRawMode(false);
        process.exit(0);
      }
    });
    
  } catch (err) {
    error(`Erreur: ${err.message}`);
    process.exit(1);
  }
}

// Exécution
if (require.main === module) {
  quickStart().catch(console.error);
}

module.exports = { quickStart };