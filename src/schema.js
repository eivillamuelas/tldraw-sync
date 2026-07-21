import { createTLSchema, defaultShapeSchemas, defaultBindingSchemas } from '@tldraw/tlschema'
import { T } from '@tldraw/validate'

// Mismo props que ChromaVideoShapeUtil en el cliente (components/croma/ChromaVideoShape.js)
const chromaVideoProps = {
  w: T.number,
  h: T.number,
}

export const schema = createTLSchema({
  shapes: {
    ...defaultShapeSchemas,
    'chroma-video': { props: chromaVideoProps },
  },
  bindings: defaultBindingSchemas,
})