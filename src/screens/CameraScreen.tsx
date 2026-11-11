import { useState } from 'react'
import { Wordmark } from '../components/Wordmark'
import { markCameraStepDone, requestCamera, type CameraResult } from '../lib/camera'

const NOTES: Record<Exclude<CameraResult, 'granted'>, string> = {
  denied:
    'Camera is blocked for this site. You can still continue. Your phone asks again when AR opens.',
  unavailable: 'No camera on this device. You can still look at the model in 3D.',
}

export function CameraScreen({ onDone }: { onDone: () => void }) {
  const [busy, setBusy] = useState(false)
  const [result, setResult] = useState<CameraResult | null>(null)

  const allow = async () => {
    setBusy(true)
    const outcome = await requestCamera()
    setBusy(false)
    markCameraStepDone(outcome)
    if (outcome === 'granted') {
      onDone()
      return
    }
    setResult(outcome)
  }

  const blocked = result === 'denied' || result === 'unavailable'

  return (
    <main className="safe-top safe-bottom mx-auto flex min-h-full max-w-md flex-col px-6">
      <Wordmark />
      <div className="flex flex-1 flex-col justify-center">
        <h1 className="text-[28px] leading-tight font-semibold">Camera access</h1>
        <p className="mt-3 text-[16px] leading-relaxed text-muted">
          AR uses your camera to place the model in the room. Nothing is recorded.
        </p>
        {blocked ? (
          <p role="status" className="mt-6 border-l-2 border-ink pl-3 text-[15px] leading-relaxed">
            {NOTES[result]}
          </p>
        ) : null}
      </div>
      <button
        type="button"
        disabled={busy}
        onClick={blocked ? onDone : allow}
        className="h-13 w-full rounded-xl bg-ink text-[16px] font-semibold text-white active:opacity-80 disabled:opacity-60"
      >
        {busy ? 'Waiting for permission…' : blocked ? 'Continue' : 'Allow camera'}
      </button>
    </main>
  )
}
