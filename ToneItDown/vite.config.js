import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { viteStaticCopy } from 'vite-plugin-static-copy';

export default defineConfig({
  base: './',
  plugins: [
    react(),
    viteStaticCopy({
      targets: [
        { src: 'assets/**/*', dest: 'assets' },
        { src: 'manifest.json', dest: '.' },
        { src: 'popup.html', dest: '.' },
      ]
    })
  ],
  build: {
    rollupOptions: {
      input: {
        main: 'src/main.jsx',
        background: 'src/background.js',  // Include background.js
        content: 'src/content.js',        // Include content.js
      },
      output: {
        entryFileNames: '[name].js',  // Keeps the original names
        chunkFileNames: '[name].[hash].js',
        assetFileNames: 'assets/[name].[ext]'
      }
    }
  }
});
