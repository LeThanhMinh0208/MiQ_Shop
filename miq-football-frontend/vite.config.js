import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { visualizer } from 'rollup-plugin-visualizer';

// https://vite.dev/config/
export default defineConfig(({ mode }) => ({
  plugins: [
    react(),
    // Run `npm run build` then open dist/stats.html to inspect bundle sizes
    visualizer({
      filename: 'dist/stats.html',
      open: false,
      gzipSize: true,
      brotliSize: true,
    }),
  ],
  optimizeDeps: {
    include: ['react-window', 'socket.io-client'],
  },
  build: {
    target: 'esnext',
    rollupOptions: {
      output: {
        manualChunks: (id) => {
          if (id.includes('/react/') || id.includes('/react-dom/') || id.includes('/react-router-dom/')) return 'vendor-react';
          if (id.includes('/framer-motion/')) return 'vendor-framer';
          if (id.includes('/recharts/')) return 'vendor-charts';
          if (id.includes('/xlsx/')) return 'vendor-admin';
          if (id.includes('/@tanstack/react-query/')) return 'vendor-query';
        },
      },
    },
    // Warn when a chunk exceeds 500 kB
    chunkSizeWarningLimit: 500,
  },
}));
