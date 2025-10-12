#!/usr/bin/env node

/**
 * Script de déploiement automatisé - Audio Guide CI
 * Gère le build et déploiement pour toutes les plateformes
 */

const { execSync, spawn } = require('child_process');
const fs = require('fs');
const path = require('path');

class DeploymentManager {
  constructor() {
    this.platform = process.platform;
    this.config = this.loadConfig();
  }

  loadConfig() {
    const defaultConfig = {
      app: {
        name: "Audio Guide CI",
        id: "com.audioguide.cotedivoire",
        version: "1.0.0",
        author: "Audio Guide Team"
      },
      build: {
        optimized: true,
        minify: true,
        sourcemap: false
      },
      deployment: {
        android: {
          enabled: true,
          buildType: "debug", // debug | release
          signApp: false,
          keystore: "./android.keystore"
        },
        ios: {
          enabled: this.platform === "darwin", // Mac seulement
          buildType: "debug",
          team: "YOUR_TEAM_ID",
          provision: "iOS Development"
        },
        pwa: {
          enabled: true,
          host: "localhost",
          port: 4173
        }
      }
    };

    // Charger config personnalisée si elle existe
    if (fs.existsSync('deploy.config.json')) {
      const userConfig = JSON.parse(fs.readFileSync('deploy.config.json', 'utf8'));
      return { ...defaultConfig, ...userConfig };
    }

    return defaultConfig;
  }

  log(message, type = 'info') {
    const timestamp = new Date().toLocaleTimeString();
    const icons = {
      info: 'ℹ️',
      success: '✅',
      warning: '⚠️',
      error: '❌',
      build: '🔨',
      deploy: '🚀'
    };
    
    console.log(`[${timestamp}] ${icons[type] || 'ℹ️'} ${message}`);
  }

  async runCommand(command, options = {}) {
    return new Promise((resolve, reject) => {
      this.log(`Exécution: ${command}`, 'build');
      
      const child = spawn(command, [], {
        shell: true,
        stdio: options.silent ? 'pipe' : 'inherit',
        ...options
      });

      let output = '';
      if (options.silent) {
        child.stdout.on('data', (data) => {
          output += data.toString();
        });
        child.stderr.on('data', (data) => {
          output += data.toString();
        });
      }

      child.on('close', (code) => {
        if (code === 0) {
          resolve(output);
        } else {
          reject(new Error(`Command failed with code ${code}: ${command}`));
        }
      });
    });
  }

  async checkPrerequisites() {
    this.log('Vérification des prérequis...', 'info');
    
    const checks = [
      { cmd: 'node --version', name: 'Node.js' },
      { cmd: 'npm --version', name: 'NPM' },
      { cmd: 'npx cap --version', name: 'Capacitor' }
    ];

    for (const check of checks) {
      try {
        const version = await this.runCommand(check.cmd, { silent: true });
        this.log(`${check.name}: ${version.trim()}`, 'success');
      } catch (error) {
        this.log(`${check.name}: Non installé`, 'error');
        throw new Error(`${check.name} est requis mais non installé`);
      }
    }

    // Vérifications spécifiques Android
    if (this.config.deployment.android.enabled) {
      try {
        await this.runCommand('adb version', { silent: true });
        this.log('Android Debug Bridge: Disponible', 'success');
      } catch (error) {
        this.log('ADB: Non disponible (Android Studio requis)', 'warning');
      }
    }

    // Vérifications spécifiques iOS
    if (this.config.deployment.ios.enabled && this.platform === 'darwin') {
      try {
        await this.runCommand('xcode-select --version', { silent: true });
        this.log('Xcode Command Line Tools: Disponible', 'success');
      } catch (error) {
        this.log('Xcode: Non disponible', 'warning');
      }
    }
  }

  async buildApp() {
    this.log('Construction de l\'application...', 'build');
    
    // Nettoyage
    if (fs.existsSync('dist')) {
      this.log('Nettoyage du dossier dist...', 'info');
      execSync('rmdir /s /q dist', { shell: true });
    }

    // Build optimisé ou standard
    const buildCommand = this.config.build.optimized 
      ? 'npm run build:optimized' 
      : 'npm run build';
    
    try {
      await this.runCommand(buildCommand);
      this.log('Build terminé avec succès', 'success');
    } catch (error) {
      this.log(`Erreur de build: ${error.message}`, 'error');
      throw error;
    }
  }

  async setupCapacitor() {
    this.log('Configuration de Capacitor...', 'build');
    
    // Vérifier si les plateformes sont installées
    const platforms = ['android', 'ios'].filter(platform => {
      const platformEnabled = this.config.deployment[platform].enabled;
      const platformExists = fs.existsSync(platform);
      
      if (platformEnabled && !platformExists) {
        this.log(`Ajout de la plateforme ${platform}...`, 'info');
        try {
          execSync(`npx cap add ${platform}`, { stdio: 'inherit' });
          return true;
        } catch (error) {
          this.log(`Erreur lors de l'ajout de ${platform}: ${error.message}`, 'error');
          return false;
        }
      }
      
      return platformEnabled && platformExists;
    });

    // Synchronisation Capacitor
    if (platforms.length > 0) {
      this.log('Synchronisation Capacitor...', 'build');
      await this.runCommand('npx cap sync');
      this.log('Synchronisation terminée', 'success');
    }

    return platforms;
  }

  async deployAndroid() {
    if (!this.config.deployment.android.enabled) {
      this.log('Déploiement Android désactivé', 'info');
      return;
    }

    this.log('Déploiement Android...', 'deploy');
    
    try {
      // Ouvrir Android Studio
      this.log('Ouverture d\'Android Studio...', 'info');
      await this.runCommand('npx cap open android');
      
      this.log('Android Studio ouvert', 'success');
      this.log('📱 Instructions:', 'info');
      this.log('  1. Connecter votre téléphone Android (USB Debugging activé)', 'info');
      this.log('  2. Cliquer sur "Run" (▶️) dans Android Studio', 'info');
      this.log('  3. Sélectionner votre téléphone dans la liste', 'info');
      
    } catch (error) {
      this.log(`Erreur Android: ${error.message}`, 'error');
      throw error;
    }
  }

  async deployIOS() {
    if (!this.config.deployment.ios.enabled) {
      this.log('Déploiement iOS désactivé', 'info');
      return;
    }

    if (this.platform !== 'darwin') {
      this.log('Déploiement iOS disponible uniquement sur Mac', 'warning');
      return;
    }

    this.log('Déploiement iOS...', 'deploy');
    
    try {
      // Ouvrir Xcode
      this.log('Ouverture de Xcode...', 'info');
      await this.runCommand('npx cap open ios');
      
      this.log('Xcode ouvert', 'success');
      this.log('📱 Instructions:', 'info');
      this.log('  1. Connecter votre iPhone/iPad', 'info');
      this.log('  2. Configurer votre Team ID dans Xcode', 'info');
      this.log('  3. Cliquer sur "Run" (▶️) dans Xcode', 'info');
      
    } catch (error) {
      this.log(`Erreur iOS: ${error.message}`, 'error');
      throw error;
    }
  }

  async deployPWA() {
    if (!this.config.deployment.pwa.enabled) {
      this.log('Déploiement PWA désactivé', 'info');
      return;
    }

    this.log('Déploiement PWA...', 'deploy');
    
    try {
      const { host, port } = this.config.deployment.pwa;
      
      this.log('Démarrage du serveur preview...', 'info');
      this.log(`🌐 PWA disponible sur: http://${host}:${port}`, 'success');
      this.log('💡 Testez la PWA dans Chrome/Edge avec les Dev Tools mobile', 'info');
      
      // Démarrer le serveur preview (non-bloquant)
      spawn('npm', ['run', 'preview'], {
        stdio: 'inherit',
        shell: true,
        detached: true
      });
      
    } catch (error) {
      this.log(`Erreur PWA: ${error.message}`, 'error');
    }
  }

  async generateDeploymentReport() {
    const report = {
      timestamp: new Date().toISOString(),
      config: this.config,
      platform: this.platform,
      deployment: {
        android: this.config.deployment.android.enabled,
        ios: this.config.deployment.ios.enabled && this.platform === 'darwin',
        pwa: this.config.deployment.pwa.enabled
      },
      buildInfo: {
        optimized: this.config.build.optimized,
        version: this.config.app.version
      }
    };

    fs.writeFileSync('deployment-report.json', JSON.stringify(report, null, 2));
    this.log('Rapport de déploiement sauvegardé: deployment-report.json', 'success');
  }

  async deploy(targets = []) {
    try {
      this.log(`🚀 Démarrage du déploiement - ${this.config.app.name}`, 'info');
      this.log(`Version: ${this.config.app.version}`, 'info');
      this.log('─'.repeat(50), 'info');

      // Vérifications préalables
      await this.checkPrerequisites();

      // Build de l'application
      await this.buildApp();

      // Configuration Capacitor
      const availablePlatforms = await this.setupCapacitor();

      // Déploiement selon les cibles
      const deployTargets = targets.length > 0 ? targets : ['android', 'ios', 'pwa'];
      
      for (const target of deployTargets) {
        switch (target) {
          case 'android':
            if (availablePlatforms.includes('android')) {
              await this.deployAndroid();
            }
            break;
          case 'ios':
            if (availablePlatforms.includes('ios')) {
              await this.deployIOS();
            }
            break;
          case 'pwa':
            await this.deployPWA();
            break;
          default:
            this.log(`Cible de déploiement inconnue: ${target}`, 'warning');
        }
      }

      // Génération du rapport
      await this.generateDeploymentReport();

      this.log('🎉 Déploiement terminé avec succès !', 'success');
      
    } catch (error) {
      this.log(`💥 Erreur de déploiement: ${error.message}`, 'error');
      process.exit(1);
    }
  }
}

// Interface en ligne de commande
function main() {
  const args = process.argv.slice(2);
  const deployer = new DeploymentManager();

  if (args.includes('--help') || args.includes('-h')) {
    console.log(`
📱 Script de Déploiement - Audio Guide CI
═══════════════════════════════════════

Usage: node deploy.cjs [options] [targets]

Targets:
  android    Déploiement Android (via Android Studio)
  ios        Déploiement iOS (via Xcode, Mac uniquement)
  pwa        Déploiement PWA (serveur local)

Options:
  --help, -h     Afficher cette aide
  --config       Afficher la configuration actuelle
  --init         Créer un fichier de configuration

Exemples:
  node deploy.cjs                    # Déployer toutes les plateformes
  node deploy.cjs android            # Déployer Android seulement
  node deploy.cjs android ios        # Déployer Android et iOS
  node deploy.cjs pwa                # Déployer PWA seulement
`);
    return;
  }

  if (args.includes('--config')) {
    console.log('Configuration actuelle:');
    console.log(JSON.stringify(deployer.config, null, 2));
    return;
  }

  if (args.includes('--init')) {
    fs.writeFileSync('deploy.config.json', JSON.stringify(deployer.config, null, 2));
    console.log('✅ Fichier de configuration créé: deploy.config.json');
    return;
  }

  // Extraire les cibles de déploiement
  const validTargets = ['android', 'ios', 'pwa'];
  const targets = args.filter(arg => validTargets.includes(arg));

  // Démarrer le déploiement
  deployer.deploy(targets);
}

main();