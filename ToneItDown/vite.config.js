import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { viteStaticCopy } from 'vite-plugin-static-copy';
import { NodeModulesPolyfillPlugin } from '@esbuild-plugins/node-modules-polyfill';


export default defineConfig({
  base: './',
  plugins: [
    react(),
    viteStaticCopy({
      targets: [
        { src: 'assets/**/*', dest: 'assets' },
        { src: 'manifest.json', dest: '.' },
        { src: 'popup.html', dest: '.' },
        { src: 'popup.css', dest: '.' },
        {src: 'models',dest: '.'} 
      ]
    }),
    // Ensures polyfills for Node.js modules like fs, path, etc.
    {
      ...NodeModulesPolyfillPlugin(),
      apply: 'build',
    },
    // Ensures manifest.json and other static files are copied correctly
    viteStaticCopy({
      targets: [{ src: 'manifest.json', dest: '.' }],
    }),
  ],
  resolve: {
    alias: {
      stream: 'stream-browserify',
      util: 'util/',
    },
  },
  build: {
    rollupOptions: {
      input: {
        main: 'src/main.jsx',
        background: 'src/background.js',
        content: 'src/content.js',
      },
      output: {
        entryFileNames: '[name].js',
        chunkFileNames: '[name].[hash].js',
        assetFileNames: 'assets/[name].[ext]'
      }
    }
  }
});
