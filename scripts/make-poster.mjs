/**
 * Render a poster image for every model in src/models.ts, using the real GLB
 * in <model-viewer>, and write it to public/posters/<id>.webp.
 *
 * Run: npm run poster
 * CHROMIUM_PATH points at a Chromium binary if Playwright's own is not installed.
 */
import { mkdirSync, writeFileSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { chromium } from 'playwright'
import { createServer } from 'vite'
import { MODELS } from '../src/models.ts'

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const port = 8199

const server = await createServer({
  root,
  logLevel: 'error',
  server: { host: '127.0.0.1', port, strictPort: true },
})
await server.listen()

const browser = await chromium.launch({
  executablePath: process.env.CHROMIUM_PATH || undefined,
  args: ['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist'],
})

try {
  const page = await browser.newPage({ viewport: { width: 720, height: 900 } })
  await page.addInitScript(() => sessionStorage.setItem('rentbrella-ar:camera', 'granted'))

  for (const model of MODELS) {
    await page.goto(`http://127.0.0.1:${port}/?model=${model.id}`)
    await page.waitForFunction(() => document.querySelector('model-viewer')?.loaded === true, null, {
      timeout: 180_000,
    })
    const dataUrl = await page.evaluate(async () => {
      const viewer = document.querySelector('model-viewer')
      viewer.jumpCameraToGoal()
      await new Promise((done) => setTimeout(done, 500))
      const blob = await viewer.toBlob({ mimeType: 'image/webp', qualityArgument: 0.85, idealAspect: true })
      return new Promise((done) => {
        const reader = new FileReader()
        reader.onload = () => done(reader.result)
        reader.readAsDataURL(blob)
      })
    })
    const out = resolve(root, 'public', model.poster.replace(/^\//, ''))
    mkdirSync(dirname(out), { recursive: true })
    writeFileSync(out, Buffer.from(String(dataUrl).split(',')[1], 'base64'))
    console.log(`Wrote ${out}`)
  }
} finally {
  await browser.close()
  await server.close()
}
