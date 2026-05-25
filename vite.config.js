import { defineConfig } from 'vite'
import { fileURLToPath, URL } from 'url'

export default defineConfig({
  root: 'website',
  build: {
    outDir: '../dist',
    emptyOutDir: true,
    rollupOptions: {
      input: {
        index:    fileURLToPath(new URL('website/index.html',    import.meta.url)),
        about:    fileURLToPath(new URL('website/about.html',    import.meta.url)),
        services: fileURLToPath(new URL('website/services.html', import.meta.url)),
        contact:  fileURLToPath(new URL('website/contact.html',  import.meta.url)),
      },
    },
  },
})
