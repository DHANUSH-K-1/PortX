import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from 'tailwindcss';
import autoprefixer from 'autoprefixer';

export default defineConfig({
  plugins: [react()],
  css: {
    postcss: {
      plugins: [
        tailwindcss(),
        autoprefixer(),
      ],
    },
  },
  server: {
    proxy: {
      '/api': {
        target: process.env.VITE_API_URL || 'https://resume-portfolio-generator.onrender.com',
        changeOrigin: true,
      },
      '/p': {
        target: process.env.VITE_API_URL || 'https://resume-portfolio-generator.onrender.com',
        changeOrigin: true,
      },
      '/photos': {
        target: process.env.VITE_API_URL || 'https://resume-portfolio-generator.onrender.com',
        changeOrigin: true,
      },
      '/download': {
        target: process.env.VITE_API_URL || 'https://resume-portfolio-generator.onrender.com',
        changeOrigin: true,
      },
    }
  },
  build: {
    chunkSizeWarningLimit: 1000,
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes('node_modules')) {
            if (id.includes('three') || id.includes('@react-three')) {
              return 'vendor-three';
            }
            if (id.includes('framer-motion') || id.includes('motion')) {
              return 'vendor-motion';
            }
            return 'vendor';
          }
        }
      }
    }
  }
});