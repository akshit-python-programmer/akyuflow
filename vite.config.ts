import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// base: './' keeps every asset URL relative, so the built site works unchanged at
// https://<user>.github.io/<repo>/, at a user/org root site, or on a custom domain.
export default defineConfig({
  base: './',
  plugins: [react()],
  build: {
    // The one big chunk is three.js for the 3D ghost. It is loaded on demand,
    // after the page is already usable, so its size is expected.
    chunkSizeWarningLimit: 1000,
  },
})
