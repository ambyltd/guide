/// <reference types="vitest" />

import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react()
    // legacy plugin désactivé pour supporter Mapbox et les fonctionnalités modernes
  ],
  define: {
    'process.env': process.env,
    __BUILD_DATE__: JSON.stringify(new Date().toISOString()),
    __BUNDLE_ANALYZER__: JSON.stringify(process.env.ANALYZE === 'true')
  },
  
  // Advanced bundle optimization
  build: {
    target: 'esnext', // Support des fonctionnalités modernes incluant BigInt
    rollupOptions: {
      output: {
        manualChunks: (id) => {
          // Vendor libraries
          if (id.includes('node_modules')) {
            if (id.includes('firebase')) return 'vendor-auth';
            if (id.includes('@ionic')) return 'vendor-ionic';
            if (id.includes('react') || id.includes('redux')) return 'vendor-react';
            return 'vendor-other';
          }

          // App code chunking
          if (id.includes('/pages/')) return 'pages';
          if (id.includes('/components/Map')) return 'map-components';
          if (id.includes('/components/Audio')) return 'audio-components';
          if (id.includes('/services/')) return 'services';
          if (id.includes('/utils/')) return 'utils';
          
          return undefined;
        },
        
        chunkFileNames: 'chunks/[name]-[hash].js',
        assetFileNames: (assetInfo) => {
          const extType = assetInfo.name?.split('.').pop();
          
          if (/png|jpe?g|svg|gif|tiff|bmp|ico/i.test(extType || '')) {
            return `assets/images/[name]-[hash][extname]`;
          }
          
          if (/woff2?|eot|ttf|otf/i.test(extType || '')) {
            return `assets/fonts/[name]-[hash][extname]`;
          }
          
          if (/mp3|wav|ogg|m4a|aac|flac/i.test(extType || '')) {
            return `assets/audio/[name]-[hash][extname]`;
          }
          
          return `assets/[name]-[hash][extname]`;
        }
      }
    },
    
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: process.env.NODE_ENV === 'production',
        drop_debugger: true,
        pure_funcs: ['console.log', 'console.warn'],
        passes: 2
      },
      mangle: {
        safari10: true
      },
      format: {
        comments: false
      }
    },
    
    chunkSizeWarningLimit: 1000,
    assetsInlineLimit: 4096,
    sourcemap: process.env.NODE_ENV === 'development' ? true : 'hidden',
    cssCodeSplit: true,
    cssMinify: true
  },
  
  // Advanced dependency optimization
  optimizeDeps: {
    include: [
      'react',
      'react-dom',
      '@ionic/react',
      '@ionic/react-router',
      'react-router-dom',
      '@reduxjs/toolkit',
      'react-redux',
      'mapbox-gl'
    ],
    exclude: [
      'firebase/app',
      'firebase/auth'
    ]
  },
  
  cacheDir: 'node_modules/.vite-cache',
  
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: './src/setupTests.ts',
  }
})
