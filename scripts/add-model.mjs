/**
 * Add a USDZ model to the site: copy it for iPhone (Quick Look) and convert it
 * to an Android-safe GLB (WebXR / Scene Viewer) next to it in public/models.
 *
 * Run: npm run add-model -- path/to/model.usdz <id>
 * Then add the entry to src/models.ts and run `npm run poster`.
 *
 * Needs Blender on PATH, or BLENDER=/path/to/blender.
 */
import { spawnSync } from 'node:child_process'
import { copyFileSync, existsSync, mkdtempSync, statSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { NodeIO } from '@gltf-transform/core'
import { ALL_EXTENSIONS } from '@gltf-transform/extensions'
import { dedup, getBounds, join, prune, simplify, weld } from '@gltf-transform/functions'
import { MeshoptSimplifier } from 'meshoptimizer'

// Scene Viewer rejects any other glTF extension, and cannot decode compressed meshes.
const SCENE_VIEWER_EXTENSIONS = new Set(['KHR_materials_unlit', 'KHR_texture_transform'])
// Relative to each mesh's size; about 1 mm on a 2 m model.
const SIMPLIFY_ERROR = 0.0004

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const [src, id] = process.argv.slice(2)
if (!src || !id || !existsSync(src)) {
  console.error('Usage: npm run add-model -- path/to/model.usdz <id>')
  process.exit(1)
}

const usdzOut = resolve(root, 'public/models', `${id}.usdz`)
const glbOut = resolve(root, 'public/models', `${id}.glb`)
const raw = resolve(mkdtempSync(resolve(tmpdir(), 'rb-model-')), 'raw.glb')

copyFileSync(src, usdzOut)

// Blender links the system Python; a version manager's python on PATH (mise, pyenv) breaks it.
const blender = spawnSync(
  process.env.BLENDER ?? 'blender',
  ['-b', '--factory-startup', '--python', resolve(root, 'scripts/usdz-to-glb.py'), '--', src, raw],
  { env: { ...process.env, PATH: '/usr/local/bin:/usr/bin:/bin' }, encoding: 'utf8' },
)
if (blender.status !== 0 || !existsSync(raw)) {
  console.error(blender.stdout, blender.stderr)
  throw new Error('Blender could not convert the model')
}

await MeshoptSimplifier.ready
const io = new NodeIO().registerExtensions(ALL_EXTENSIONS)
const document = await io.read(raw)
await document.transform(
  dedup(),
  join(),
  weld(),
  simplify({ simplifier: MeshoptSimplifier, ratio: 0, error: SIMPLIFY_ERROR }),
  prune(),
)
for (const extension of document.getRoot().listExtensionsUsed()) {
  if (!SCENE_VIEWER_EXTENSIONS.has(extension.extensionName)) extension.dispose()
}
await io.write(glbOut, document)

let triangles = 0
for (const mesh of document.getRoot().listMeshes()) {
  for (const primitive of mesh.listPrimitives()) {
    triangles += (primitive.getIndices()?.getCount() ?? primitive.getAttribute('POSITION').getCount()) / 3
  }
}
const { min, max } = getBounds(document.getRoot().getDefaultScene() ?? document.getRoot().listScenes()[0])
const mb = (file) => `${(statSync(file).size / 1024 / 1024).toFixed(2)} MB`

console.log(
  [
    `${id}.usdz ${mb(usdzOut)} (copied as is)`,
    `${id}.glb  ${mb(glbOut)}, ${Math.round(triangles).toLocaleString()} triangles, ${document.getRoot().listMaterials().length} materials`,
    `Size (m): ${(max[0] - min[0]).toFixed(2)} W × ${(max[1] - min[1]).toFixed(2)} H × ${(max[2] - min[2]).toFixed(2)} D, floor at y = ${min[1].toFixed(3)}`,
  ].join('\n'),
)
