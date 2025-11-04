import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  // Use root path for Netlify deployment
  base: '/',
  optimizeDeps: {
    exclude: ['lucide-react'],
  },
  define: {
    global: 'globalThis',
  },
});
