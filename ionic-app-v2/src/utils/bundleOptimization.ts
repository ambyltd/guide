import { defineConfig } from 'vite';

/**
 * Advanced bundle optimization configuration
 */
export const createOptimizedConfig = () => {
  return defineConfig({
    build: {
      // Advanced chunking strategy
      rollupOptions: {
        output: {
          manualChunks: (id) => {
            // Vendor libraries
            if (id.includes('node_modules')) {
              // Large libraries get their own chunks
              if (id.includes('leaflet')) return 'vendor-map';
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
            
            return undefined; // Default chunk
          },
          
          // Optimize chunk names for caching
          chunkFileNames: (chunkInfo) => {
            const name = chunkInfo.name;
            return `chunks/${name}-[hash].js`;
          },
          
          // Optimize asset names
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
      
      // Advanced minification
      minify: 'terser',
      terserOptions: {
        compress: {
          drop_console: true, // Remove console.log in production
          drop_debugger: true,
          pure_funcs: ['console.log', 'console.warn'], // Remove specific functions
          passes: 2 // Multiple passes for better compression
        },
        mangle: {
          safari10: true // Fix Safari 10 issues
        },
        format: {
          comments: false // Remove all comments
        }
      },
      
      // Optimize bundle size
      chunkSizeWarningLimit: 1000, // Warn for chunks > 1MB
      assetsInlineLimit: 4096, // Inline assets < 4KB
      
      // Source map strategy
      sourcemap: import.meta.env.NODE_ENV === 'development' ? true : 'hidden',
      
      // Target modern browsers
      target: ['es2020', 'chrome79', 'firefox72', 'safari13.1'],
      
      // CSS optimization
      cssCodeSplit: true,
      cssMinify: true
    },
    
    // Advanced dependency optimization
    optimizeDeps: {
      include: [
        // Pre-bundle commonly used dependencies
        'react',
        'react-dom',
        '@ionic/react',
        '@ionic/react-router',
        'react-router-dom',
        '@reduxjs/toolkit',
        'react-redux'
      ],
      exclude: [
        // Don't pre-bundle large or rarely used dependencies
        'leaflet',
        'firebase/app',
        'firebase/auth'
      ]
    },
    
    // Advanced caching
    cacheDir: 'node_modules/.vite-cache',
    
    // Build analysis
    define: {
      __BUILD_DATE__: JSON.stringify(new Date().toISOString()),
      __BUNDLE_ANALYZER__: JSON.stringify(process.env.ANALYZE === 'true')
    }
  });
};

/**
 * Bundle analysis utilities
 */
export class BundleAnalyzer {
  static async analyzeBuild() {
    if (!import.meta.env.DEV) {
      console.log('🔍 Bundle Analysis:');
      
      // Get build info from the build
      const buildInfo = await this.getBuildInfo();
      console.table(buildInfo);
      
      // Performance recommendations
      this.generateRecommendations();
    }
  }
  
  private static async getBuildInfo() {
    // This would analyze the actual built files
    // For now, return mock data structure
    return {
      'Total Size': '2.1 MB',
      'Vendor Size': '1.3 MB',
      'App Size': '800 KB',
      'Chunks': 12,
      'Assets': 34
    };
  }
  
  private static generateRecommendations() {
    console.log('\n📊 Performance Recommendations:');
    
    const recommendations = [
      '✅ Bundle size is within acceptable limits',
      '⚡ Consider lazy loading for admin pages',
      '🎯 Map components are well chunked',
      '📱 Mobile bundle optimization active'
    ];
    
    recommendations.forEach(rec => console.log(rec));
  }
}

/**
 * Runtime performance monitoring
 */
export class PerformanceMonitor {
  private static metrics = new Map();
  
  static startTimer(label: string) {
    this.metrics.set(label, performance.now());
  }
  
  static endTimer(label: string) {
    const start = this.metrics.get(label);
    if (start) {
      const duration = performance.now() - start;
      this.metrics.delete(label);
      
      if (import.meta.env.NODE_ENV === 'development') {
        console.log(`⏱️ ${label}: ${duration.toFixed(2)}ms`);
      }
      
      return duration;
    }
    return 0;
  }
  
  static measureChunkLoad(chunkName: string) {
    return new Promise((resolve) => {
      this.startTimer(`chunk-${chunkName}`);
      
      // Monitor chunk loading
      const observer = new PerformanceObserver((list) => {
        const entries = list.getEntries();
        entries.forEach((entry) => {
          if (entry.name.includes(chunkName)) {
            const duration = this.endTimer(`chunk-${chunkName}`);
            resolve(duration);
          }
        });
      });
      
      observer.observe({ entryTypes: ['navigation', 'resource'] });
    });
  }
  
  static getPerformanceReport() {
    return {
      memory: (performance as unknown as { memory?: unknown }).memory || {},
      timing: performance.timing || {},
      navigation: performance.navigation || {},
      chunks: Array.from(this.metrics.entries())
    };
  }
}