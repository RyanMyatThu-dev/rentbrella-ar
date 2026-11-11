import type { ModelViewerElement } from '@google/model-viewer'
import { useEffect, useRef, useState } from 'react'
import { formatSize, type ArModel } from '../models'

interface ViewerScreenProps {
  model: ArModel
  onBack: () => void
}

export function ViewerScreen({ model, onBack }: ViewerScreenProps) {
  const viewer = useRef<ModelViewerElement>(null)
  const [defined, setDefined] = useState(() => Boolean(customElements.get('model-viewer')))
  const [progress, setProgress] = useState(0)
  const [canAr, setCanAr] = useState<boolean | null>(null)
  const [arFailed, setArFailed] = useState(false)

  useEffect(() => {
    if (defined) return
    void customElements.whenDefined('model-viewer').then(() => setDefined(true))
  }, [defined])

  useEffect(() => {
    const element = viewer.current
    if (!defined || !element) return
    const onProgress = (event: Event) =>
      setProgress((event as CustomEvent<{ totalProgress: number }>).detail.totalProgress)
    const onLoad = () => setCanAr(element.canActivateAR)
    const onStatus = (event: Event) =>
      setArFailed((event as CustomEvent<{ status: string }>).detail.status === 'failed')
    element.addEventListener('progress', onProgress)
    element.addEventListener('load', onLoad)
    element.addEventListener('ar-status', onStatus)
    return () => {
      element.removeEventListener('progress', onProgress)
      element.removeEventListener('load', onLoad)
      element.removeEventListener('ar-status', onStatus)
    }
  }, [defined])

  const note = arFailed
    ? 'AR could not start. Try again, or update your browser.'
    : canAr === false
      ? 'Open this page on your phone to view in AR.'
      : `Real size ${formatSize(model.size)}. Drag to turn, pinch to zoom.`

  return (
    <div className="fixed inset-0 flex flex-col bg-white">
      <header className="safe-top flex items-center border-b border-line px-4 pb-3">
        <button
          type="button"
          onClick={onBack}
          className="-ml-2 px-2 py-1 text-[15px] font-medium active:opacity-60"
        >
          Back
        </button>
        <h1 className="flex-1 text-center text-[15px] font-semibold">{model.name}</h1>
        <span className="w-12" aria-hidden />
      </header>

      <div className="relative min-h-0 flex-1">
        {defined ? (
          <model-viewer
            ref={viewer}
            src={model.glb}
            ios-src={model.usdz}
            poster={model.poster}
            alt={`3D model of the ${model.name.toLowerCase()}`}
            ar
            ar-modes="webxr scene-viewer quick-look"
            ar-placement="floor"
            ar-scale="fixed"
            camera-controls
            touch-action="pan-y"
            camera-orbit="28deg 76deg auto"
            interaction-prompt="none"
            environment-image="neutral"
            shadow-intensity="1"
            shadow-softness="0.9"
            exposure="1"
          >
            <div slot="progress-bar" aria-hidden>
              {progress < 1 ? (
                <div
                  className="absolute top-0 left-0 h-0.5 bg-ink transition-[width]"
                  style={{ width: `${Math.round(progress * 100)}%` }}
                />
              ) : null}
            </div>
            <button
              slot="ar-button"
              type="button"
              className="absolute bottom-5 left-1/2 h-12 -translate-x-1/2 rounded-full bg-accent px-7 text-[16px] font-semibold text-white active:opacity-80"
            >
              View in AR
            </button>
          </model-viewer>
        ) : (
          <div className="h-full w-full bg-stage" />
        )}
      </div>

      <footer className="safe-bottom border-t border-line px-6 pt-3 text-center text-[13px] leading-snug text-muted">
        {note}
      </footer>
    </div>
  )
}
