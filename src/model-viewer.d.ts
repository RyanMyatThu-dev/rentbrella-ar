import type { ModelViewerElement } from '@google/model-viewer'
import type { DetailedHTMLProps, HTMLAttributes } from 'react'

interface ModelViewerAttributes
  extends DetailedHTMLProps<HTMLAttributes<ModelViewerElement>, ModelViewerElement> {
  src?: string
  poster?: string
  alt?: string
  ar?: boolean
  exposure?: string
}

declare module 'react' {
  namespace JSX {
    interface IntrinsicElements {
      'model-viewer': ModelViewerAttributes
    }
  }
}
