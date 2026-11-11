export interface ArModel {
  id: string
  name: string
  description: string
  /** Android (WebXR / Scene Viewer) and in-page preview. */
  glb: string
  /** iPhone and iPad (Quick Look). */
  usdz: string
  poster: string
  /** Real-world size in meters. */
  size: { width: number; height: number; depth: number }
}

/**
 * Every model the site can show. Add an entry and drop the matching
 * files into public/models and public/posters to list a new one.
 */
export const MODELS: ArModel[] = [
  {
    id: 'station',
    name: 'Umbrella station',
    description: 'Twelve-dock rental station with locking rails.',
    glb: '/models/station.glb',
    usdz: '/models/station.usdz',
    poster: '/posters/station.webp',
    size: { width: 1.2, height: 1.42, depth: 0.62 },
  },
]

export function findModel(id: string | null) {
  return MODELS.find((model) => model.id === id) ?? null
}

export function formatSize({ width, height, depth }: ArModel['size']) {
  return `${width.toFixed(2)} × ${height.toFixed(2)} × ${depth.toFixed(2)} m`
}
