const KEY = 'rentbrella-ar:camera'

export type CameraResult = 'granted' | 'denied' | 'unavailable'

/** True once the camera step has been passed in this browser session. */
export function cameraStepDone() {
  return sessionStorage.getItem(KEY) !== null
}

export function markCameraStepDone(result: CameraResult) {
  sessionStorage.setItem(KEY, result)
}

/** Already allowed on a previous visit, so the prompt can be skipped. */
export async function cameraAlreadyGranted() {
  try {
    const status = await navigator.permissions.query({ name: 'camera' as PermissionName })
    return status.state === 'granted'
  } catch {
    return false
  }
}

/**
 * Ask for the rear camera and release it straight away. This only primes the
 * permission; the phone's AR viewer opens the camera itself.
 */
export async function requestCamera(): Promise<CameraResult> {
  if (!navigator.mediaDevices?.getUserMedia) return 'unavailable'
  try {
    const stream = await navigator.mediaDevices.getUserMedia({
      video: { facingMode: 'environment' },
      audio: false,
    })
    for (const track of stream.getTracks()) track.stop()
    return 'granted'
  } catch (error) {
    const name = error instanceof DOMException ? error.name : ''
    return name === 'NotFoundError' || name === 'OverconstrainedError' ? 'unavailable' : 'denied'
  }
}
