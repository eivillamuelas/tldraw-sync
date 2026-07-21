import { createTLSchema, defaultShapeSchemas, defaultBindingSchemas } from '@tldraw/tlschema'
import { T } from '@tldraw/validate'

// Mismo props que ChromaVideoShapeUtil en el cliente (components/croma/ChromaVideoShape.js)
const chromaVideoProps = {
  w: T.number,
  h: T.number,
}

// Props compartidas por los shapes simples de /sistema (Servidor, Algoritmo, Empresa,
// Dataset, Institucion, Web, Estudio): todos son título + texto editable
const tarjetaProps = {
  w: T.number,
  h: T.number,
  title: T.string,
  text: T.string,
}

// Persona añade además una imagen de perfil opcional (components/sistema/personas/Persona.js)
const personaProps = {
  w: T.number,
  h: T.number,
  title: T.string,
  text: T.string,
  imageAssetId: T.string.optional(),
}

export const schema = createTLSchema({
  shapes: {
    ...defaultShapeSchemas,
    'chroma-video': { props: chromaVideoProps },
    servidor: { props: tarjetaProps },
    algoritmo: { props: tarjetaProps },
    empresa: { props: tarjetaProps },
    dataset: { props: tarjetaProps },
    institucion: { props: tarjetaProps },
    web: { props: tarjetaProps },
    estudio: { props: tarjetaProps },
    persona: { props: personaProps },
  },
  bindings: defaultBindingSchemas,
})