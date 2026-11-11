import basicSsl from '@vitejs/plugin-basic-ssl'
import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'
import { defineConfig, type Connect, type Plugin } from 'vite'

// Camera and AR only work on HTTPS (or localhost), so phone testing uses `npm run dev:phone`.
const https = process.env.HTTPS === '1'

const MODEL_TYPES: Record<string, string> = {
  '.usdz': 'model/vnd.usdz+zip',
  '.glb': 'model/gltf-binary',
}

/** Quick Look only opens USDZ served with its own content type. */
function modelContentTypes(): Plugin {
  const middleware: Connect.NextHandleFunction = (req, res, next) => {
    const path = req.url?.split('?')[0] ?? ''
    const ext = Object.keys(MODEL_TYPES).find((suffix) => path.endsWith(suffix))
    if (ext) res.setHeader('Content-Type', MODEL_TYPES[ext])
    next()
  }
  return {
    name: 'model-content-types',
    configureServer: (server) => void server.middlewares.use(middleware),
    configurePreviewServer: (server) => void server.middlewares.use(middleware),
  }
}

export default defineConfig({
  plugins: [react(), tailwindcss(), modelContentTypes(), ...(https ? [basicSsl()] : [])],
  server: {
    host: https ? true : '127.0.0.1',
    port: 8100,
    strictPort: true,
  },
  build: {
    // model-viewer bundles three.js; it is lazy-loaded after the first screen.
    chunkSizeWarningLimit: 1100,
  },
  preview: {
    host: https ? true : '127.0.0.1',
    port: 8100,
    strictPort: true,
  },
})
