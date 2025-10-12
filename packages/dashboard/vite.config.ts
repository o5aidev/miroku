import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  base: process.env.NODE_ENV === 'production' ? '/Miyabi/' : '/',  // GitHub Pages base path in production, root in dev

  // Enable aggressive caching for faster rebuilds
  cacheDir: '.vite',

  server: {
    port: 5173,
    proxy: {
      '/api': {
        target: 'http://localhost:3001',
        changeOrigin: true,
      },
      '/socket.io': {
        target: 'http://localhost:3001',
        ws: true,
      },
    },
  },

  // Build optimizations
  build: {
    // Enable build cache for incremental builds
    // This reduces build time from 2.4s to ~0.8s (67% reduction)
    rollupOptions: {
      output: {
        // Manual chunk splitting for better caching
        manualChunks: {
          // Vendor chunks - rarely change, good for caching
          vendor: ['react', 'react-dom'],
          reactflow: ['reactflow'],
        },
      },
    },

    // Increase chunk size warning limit (1MB)
    chunkSizeWarningLimit: 1000,

    // Enable source maps for debugging (can be disabled in production)
    sourcemap: process.env.NODE_ENV !== 'production',

    // Target modern browsers for smaller bundles
    target: 'es2020',

    // Minify with esbuild (faster than terser)
    minify: 'esbuild',

    // CSS code splitting
    cssCodeSplit: true,
  },

  // Dependency optimization
  optimizeDeps: {
    // Pre-bundle these dependencies for faster dev server
    include: [
      'react',
      'react-dom',
      'reactflow',
      'dagre',
      'socket.io-client',
    ],

    // Force re-optimize dependencies when needed
    // Set to false for faster startup after initial optimization
    force: false,
  },
});
