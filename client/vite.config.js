import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  base: './', // Changed from '/' to './' for proper static asset paths
  server: {
    port: 5178,
    proxy: {
      '/api': {
        target: 'https://quikkart-1.onrender.com',
        changeOrigin: true,
        secure: true,
        rewrite: (path) => path.replace(/^\/api/, '')
      }
    }
  }
});