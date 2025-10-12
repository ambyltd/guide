import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.cotedivoire.audioguide',
  appName: 'Côte d\'Ivoire Audio Guide',
  webDir: 'dist',
  server: {
    androidScheme: 'https'
  },
  plugins: {
    SplashScreen: {
      launchShowDuration: 2000,
      backgroundColor: '#2F855A',
      showSpinner: false
    },
    StatusBar: {
      style: 'dark'
    },
    PushNotifications: {
      presentationOptions: ['badge', 'sound', 'alert']
    },
    BackgroundMode: {
      enabled: true,
      title: 'Audio Guide en cours',
      text: 'Lecture d\'un guide audio',
      silent: false
    }
  }
};

export default config;
