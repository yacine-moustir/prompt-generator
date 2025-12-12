import { defineConfig } from 'vite';
import { resolve } from 'path';

export default defineConfig({
  // Dossier racine du projet (où se trouve index.html)
  root: './',
  
  // Dossier de base pour les ressources (JS, CSS, images, etc.)
  publicDir: 'public',
  
  // Configuration du serveur de développement
  server: {
    port: 3000,
    open: true, // Ouvre le navigateur automatiquement
    cors: true,
  },
  
  // Configuration de la construction
  build: {
    // Dossier de sortie pour les fichiers construits
    outDir: 'dist',
    
    // Activation du code splitting pour optimiser le chargement
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'index.html'),
        // Ajoutez d'autres points d'entrée si nécessaire
      },
      output: {
        // Nom des fichiers de sortie
        entryFileNames: 'assets/js/[name]-[hash].js',
        chunkFileNames: 'assets/js/[name]-[hash].js',
        assetFileNames: (assetInfo) => {
          // Organisation des assets par type
          if (assetInfo.name.endsWith('.css')) {
            return 'assets/css/[name]-[hash][extname]';
          }
          if (['.png', '.jpg', '.jpeg', '.gif', '.svg'].some(ext => assetInfo.name.endsWith(ext))) {
            return 'assets/images/[name]-[hash][extname]';
          }
          return 'assets/[name]-[hash][extname]';
        },
      },
    },
    
    // Activation du minification pour la production
    minify: 'terser',
    
    // Génération de sourcemaps pour le débogage
    sourcemap: process.env.NODE_ENV !== 'production',
  },
  
  // Alias pour les imports
  resolve: {
    alias: {
      '@': resolve(__dirname, 'src'),
      '@components': resolve(__dirname, 'src/js/components'),
      '@services': resolve(__dirname, 'src/services'),
      '@utils': resolve(__dirname, 'src/utils'),
      '@styles': resolve(__dirname, 'src/css'),
    },
  },
  
  // Plugins Vite (vous pouvez en ajouter selon vos besoins)
  plugins: [],
  
  // Configuration pour le remplacement de variables d'environnement
  define: {
    'import.meta.env.APP_VERSION': JSON.stringify(process.env.npm_package_version || '1.0.0'),
  },
  
  // Configuration pour le chargement des modules CSS
  css: {
    preprocessorOptions: {
      // Configuration pour les préprocesseurs CSS (Sass, Less, etc.)
      // scss: {
      //   additionalData: `@import "@/styles/variables.scss";`
      // }
    },
    modules: {
      // Configuration pour les modules CSS
      localsConvention: 'camelCaseOnly',
    },
  },
});
