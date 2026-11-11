/**
 * Printable QR codes for the AR site, as SVG and PNG in qr/.
 *
 * Run: npm run qr -- https://your-deployment.vercel.app
 *      npm run qr -- https://your-deployment.vercel.app station   (opens that model directly)
 */
import { mkdirSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import QRCode from 'qrcode'

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const [base = process.env.AR_URL ?? 'https://rentbrella-ar.vercel.app', model] = process.argv.slice(2)

const url = new URL(base)
if (model) url.searchParams.set('model', model)

const name = model ? `rentbrella-ar-${model}` : 'rentbrella-ar'
const outDir = resolve(root, 'qr')
mkdirSync(outDir, { recursive: true })

const options = { errorCorrectionLevel: 'M', margin: 4, color: { dark: '#000000', light: '#ffffff' } }
await QRCode.toFile(resolve(outDir, `${name}.svg`), url.href, { ...options, type: 'svg' })
await QRCode.toFile(resolve(outDir, `${name}.png`), url.href, { ...options, type: 'png', width: 1200 })

console.log(`QR for ${url.href}\n  ${outDir}/${name}.svg\n  ${outDir}/${name}.png`)
