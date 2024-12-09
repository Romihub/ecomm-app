import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  server: {
    cors: true,
    proxy: {
      '/api/auth': {
        target: 'http://localhost:3001',
        changeOrigin: true,
        rewrite: (path) => path.replace('/api/auth', '')
      },
      '/products': {
        target: 'http://localhost:3002',
        changeOrigin: true,
        rewrite: (path) => path.replace('/api/products', '')
      },
      '/api/payment': {
        target: 'http://localhost:3003',
        changeOrigin: true,
        rewrite: (path) => path.replace('/api/payment', '')
      },
      '/api/orders': {
        target: 'http://localhost:3004',
        changeOrigin: true,
        rewrite: (path) => path.replace('/api/orders', '')
      }
    }
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  }
});
