import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  base: './', // Changed from '/' to './' for proper static asset paths
  build: {
    outDir: 'dist'
  },
  server: {
    port: 5178,
    proxy: {
      '/api': {
        target: process.env.VITE_API_URL || 'https://quikkart-1.onrender.com',
        changeOrigin: true,
        secure: true,
        rewrite: (path) => path.replace(/^\/api/, '')
      }
    }
  },
  define: {
    'process.env': {}
  }
});