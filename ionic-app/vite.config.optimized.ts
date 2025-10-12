import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import legacy from '@vitejs/plugin-legacy';
import { resolve } from 'path';

// Configuration optimisée pour performances mobile
export default defineConfig({
  plugins: [
    react(),
    legacy({
      targets: ['defaults', 'not IE 11'],
      additionalLegacyPolyfills: ['regenerator-runtime/runtime'],
      renderLegacyChunks: true,
      polyfills: [
        'es.promise.finally',
        'es/map',
        'es/set',
        'es.array.flat',
        'es.array.flat-map',
        'es.object.from-entries',
        'web.dom-collections.for-each'
      ]
    })
  ],
  
  resolve: {
    alias: {
      '@': resolve(__dirname, 'src'),
      '@components': resolve(__dirname, 'src/components'),
      '@pages': resolve(__dirname, 'src/pages'),
      '@services': resolve(__dirname, 'src/services'),
      '@hooks': resolve(__dirname, 'src/hooks'),
      '@store': resolve(__dirname, 'src/store'),
      '@data': resolve(__dirname, 'src/data'),
      '@assets': resolve(__dirname, 'src/assets')
    }
  },

  // Optimisation du build
  build: {
    target: 'es2015',
    cssTarget: 'chrome80',
    outDir: 'dist',
    assetsDir: 'assets',
    sourcemap: false, // Désactiver en production pour réduire la taille
    
    rollupOptions: {
      output: {
        // Chunking manuel pour optimiser le chargement
        manualChunks: {
          // Vendor chunks (bibliothèques externes)
          'vendor-react': ['react', 'react-dom', 'react-router-dom'],
          'vendor-ionic': ['@ionic/react', '@ionic/react-router'],
          'vendor-maps': ['leaflet', 'react-leaflet'],
          'vendor-redux': ['@reduxjs/toolkit', 'react-redux'],
          'vendor-capacitor': ['@capacitor/core', '@capacitor/geolocation', '@capacitor/device'],
          
          // App chunks (code applicatif)
          'services': [
            'src/services/api.ts',
            'src/services/geolocationAudio.ts',
            'src/services/simpleAudio.ts',
            'src/services/testDataService.ts'
          ],
          'components-core': [
            'src/components/MapView.tsx',
            'src/components/MapWithAudio.tsx',
            'src/components/ProtectedRoute.tsx'
          ],
          'components-ui': [
            'src/components/SimpleAudioPlayer.tsx'
          ],
          'pages': [
            'src/pages/HomePage.tsx',
            'src/pages/MapPage.tsx',
            'src/pages/AudioGuidesPage.tsx'
          ]
        },
        
        // Nommage optimisé des chunks
        chunkFileNames: () => {
          return `js/[name]-[hash].js`;
        },
        assetFileNames: (assetInfo) => {
          const info = assetInfo.name?.split('.') || [];
          const extType = info[info.length - 1];
          
          if (/png|jpe?g|svg|gif|tiff|bmp|ico/i.test(extType || '')) {
            return `images/[name]-[hash][extname]`;
          }
          if (/woff2?|eot|ttf|otf/i.test(extType || '')) {
            return `fonts/[name]-[hash][extname]`;
          }
          if (/mp3|wav|ogg|m4a|aac/i.test(extType || '')) {
            return `audio/[name]-[hash][extname]`;
          }
          return `assets/[name]-[hash][extname]`;
        }
      }
    },

    // Compression et optimisation
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: true, // Supprimer console.log en production
        drop_debugger: true,
        pure_funcs: ['console.log', 'console.info', 'console.debug']
      },
      mangle: {
        safari10: true
      }
    },

    // Taille limite des chunks (avertissement à 400kb au lieu de 500kb)
    chunkSizeWarningLimit: 400,
    
    // Optimisation CSS
    cssCodeSplit: true
  },

  // Optimisation des assets
  assetsInclude: ['**/*.mp3', '**/*.wav', '**/*.ogg'],

  // Configuration du serveur de développement
  server: {
    port: 3000,
    host: true,
    open: true,
    cors: true,
    hmr: {
      overlay: false
    }
  },

  // Preview server
  preview: {
    port: 4173,
    host: true,
    cors: true
  },

  // Variables d'environnement
  define: {
    __APP_VERSION__: JSON.stringify(process.env.npm_package_version),
    __BUILD_TIME__: JSON.stringify(new Date().toISOString())
  },

  // Optimisation des dépendances
  optimizeDeps: {
    include: [
      'react',
      'react-dom',
      'react-router-dom',
      '@ionic/react',
      '@ionic/react-router',
      '@reduxjs/toolkit',
      'react-redux',
      'leaflet',
      'react-leaflet'
    ],
    exclude: [
      '@capacitor/core',
      '@capacitor/geolocation',
      '@capacitor/device'
    ]
  }
});