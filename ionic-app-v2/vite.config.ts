/// <reference types="vitest" />

// import legacy from '@vitejs/plugin-legacy' // Désactivé temporairement pour BigInt
import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'
import path from 'path'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react(),
    // legacy() // Désactivé car incompatible avec BigInt de Mapbox
  ],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src')
    }
  },
  build: {
    target: 'es2020', // Compromise: Support BigInt + Android WebView
    minify: 'terser',
    sourcemap: false,
    commonjsOptions: {
      transformMixedEsModules: true,
      include: [/node_modules/]
    },
    rollupOptions: {
      output: {
        manualChunks: {
          'vendor-react': ['react', 'react-dom', 'react-router-dom'],
          'vendor-ionic': ['@ionic/react', '@ionic/react-router'],
          'vendor-firebase': ['firebase/app', 'firebase/auth'],
          'vendor-mapbox': ['mapbox-gl']
        }
      }
    }
  },
  optimizeDeps: {
    include: ['react', 'react-dom', 'react-router-dom', '@ionic/react', '@ionic/react-router'],
    esbuildOptions: {
      target: 'es2020'
    }
  },
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: './src/setupTests.ts',
  }
})
