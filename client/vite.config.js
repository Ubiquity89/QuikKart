// vite.config.js
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// client/vite.config.js
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5178,
    proxy: {
      '/api': {
        target: 'https://quikkart-1.onrender.com',  // Update this line
        changeOrigin: true,
        secure: true,  // Changed to true for HTTPS
        rewrite: (path) => path.replace(/^\/api/, '')  // Optional: Remove /api prefix if needed
      }
    }
  }
});