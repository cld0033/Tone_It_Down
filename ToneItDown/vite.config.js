import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { viteStaticCopy } from 'vite-plugin-static-copy';

export default defineConfig({
  base: './',
  plugins: [
    react(),
    viteStaticCopy({
      targets: [
        {
          src: 'assets/**/*',  // Copy all files in assets folder
          dest: 'assets'       // Place them in dist/assets folder
        },
        {
          src: 'manifest.json',  // Copy the manifest.json file
          dest: '.'              // Place it in the root of dist
        },
        {
          src: 'popup.html',     // Copy popup.html file
          dest: '.'              // Place it in the root of dist
        }
      ]
    })
  ],
  build: {
    rollupOptions: {
      input: {
        main: 'index.html'
      }
    }
  }
});


