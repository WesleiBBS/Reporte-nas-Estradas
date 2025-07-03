import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  base: '/Reporte-nas-Estradas/',
  resolve: {
    alias: {
      '@': path.resolve(__dirname, '.'),
    },
  },
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
    rollupOptions: {
      output: {
        // Força nomes únicos para evitar cache
        entryFileNames: 'assets/[name]-[hash].js',
        chunkFileNames: 'assets/[name]-[hash].js',
        assetFileNames: 'assets/[name]-[hash].[ext]'
      }
    },
    // Limpa o diretório dist antes de cada build
    emptyOutDir: true,
    // Força rebuild dos CSS modules
    cssCodeSplit: true,
  },
  server: {
    port: 3000,
    open: true,
    // Força reload quando CSS mudar
    watch: {
      include: ['**/*.css', '**/*.scss', '**/*.sass', '**/*.less']
    }
  },
  // Configurações para CSS
  css: {
    // Força reconstrução do CSS
    postcss: {
      plugins: []
    },
    // Desenvolvimento: não minimiza para debug
    devSourcemap: true
  },
  // Cache busting
  define: {
    __CSS_VERSION__: JSON.stringify(Date.now())
  }
})
