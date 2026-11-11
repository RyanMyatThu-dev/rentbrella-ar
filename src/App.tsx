import { useEffect, useState } from 'react'
import { cameraAlreadyGranted, cameraStepDone, markCameraStepDone } from './lib/camera'
import { findModel, type ArModel } from './models'
import { CameraScreen } from './screens/CameraScreen'
import { PickerScreen } from './screens/PickerScreen'
import { ViewerScreen } from './screens/ViewerScreen'

type Screen = { name: 'camera' } | { name: 'pick' } | { name: 'view'; model: ArModel }

/** `?model=station` opens that model straight after the camera step (e.g. from a model-specific QR). */
function modelFromUrl() {
  return findModel(new URLSearchParams(window.location.search).get('model'))
}

function screenAfterCamera(): Screen {
  const model = modelFromUrl()
  return model ? { name: 'view', model } : { name: 'pick' }
}

function initialScreen(): Screen {
  return cameraStepDone() ? screenAfterCamera() : { name: 'camera' }
}

export default function App() {
  const [screen, setScreen] = useState<Screen>(initialScreen)

  useEffect(() => {
    void import('@google/model-viewer')
  }, [])

  useEffect(() => {
    if (screen.name !== 'camera') return
    let cancelled = false
    void cameraAlreadyGranted().then((granted) => {
      if (!granted || cancelled) return
      markCameraStepDone('granted')
      setScreen(screenAfterCamera())
    })
    return () => {
      cancelled = true
    }
  }, [screen.name])

  useEffect(() => {
    const onPop = () => {
      if (cameraStepDone()) setScreen(screenAfterCamera())
    }
    window.addEventListener('popstate', onPop)
    return () => window.removeEventListener('popstate', onPop)
  }, [])

  const openModel = (model: ArModel) => {
    window.history.pushState({ fromPicker: true }, '', `?model=${model.id}`)
    setScreen({ name: 'view', model })
  }

  const backToPicker = () => {
    if (window.history.state?.fromPicker) {
      window.history.back()
      return
    }
    window.history.replaceState(null, '', window.location.pathname)
    setScreen({ name: 'pick' })
  }

  if (screen.name === 'camera') {
    return <CameraScreen onDone={() => setScreen(screenAfterCamera())} />
  }
  if (screen.name === 'pick') {
    return <PickerScreen onPick={openModel} />
  }
  return <ViewerScreen key={screen.model.id} model={screen.model} onBack={backToPicker} />
}
