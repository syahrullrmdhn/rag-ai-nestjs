import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'node:path'

export default defineConfig({
  plugins: [react()],
  // Base URL '/' memastikan browser mencari file aset di root (misal: /assets/style.css)
  base: '/', 
  build: {
    // Output langsung ke folder 'public' di root backend (bukan public/app)
    outDir: path.resolve(__dirname, '../public'),
    // Bersihkan folder public sebelum build baru (supaya file lama hilang)
    emptyOutDir: true,
    sourcemap: false
  }
})
