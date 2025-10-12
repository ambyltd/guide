import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.cotedivoire.audioguidetest',
  appName: 'Audioguide CI Test',
  webDir: 'dist',
  server: {
    // Autoriser les requêtes HTTP en développement (Mixed Content)
    cleartext: true,
    // Autoriser les connexions depuis n'importe quelle source
    allowNavigation: ['*']
  },
  android: {
    // Autoriser le trafic HTTP non sécurisé en développement
    allowMixedContent: true
  }
};

export default config;
