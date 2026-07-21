import { WebSocketServer } from 'ws'
import { mkdirSync } from 'node:fs'
import { join } from 'node:path'
import { TLSocketRoom, SQLiteSyncStorage, NodeSqliteWrapper } from '@tldraw/sync-core'
import { createTLSchema, defaultShapeSchemas, defaultBindingSchemas } from '@tldraw/tlschema'
import Database from 'better-sqlite3'
import { randomUUID } from 'node:crypto'

const PORT = Number(process.env.PORT) || 5858
// En Coolify montaremos un volumen persistente en esta ruta.
const DATA_DIR = process.env.DATA_DIR || './data'
mkdirSync(DATA_DIR, { recursive: true })

// De momento solo shapes por defecto. Los custom shapes se añaden aquí más adelante.
const schema = createTLSchema({
  shapes: defaultShapeSchemas,
  bindings: defaultBindingSchemas,
})

// Evita que un roomId malicioso escape del directorio de datos.
function limpiarRoomId(id) {
  return id.replace(/[^a-zA-Z0-9_-]/g, '_')
}

// Rooms abiertas en memoria; solo puede haber una por roomId.
const rooms = new Map()

function abrirRoom(roomId) {
  const existente = rooms.get(roomId)
  if (existente && !existente.isClosed()) return existente

  const db = new Database(join(DATA_DIR, `${roomId}.db`))
  const sql = new NodeSqliteWrapper(db)
  const storage = new SQLiteSyncStorage({ sql })

  const room = new TLSocketRoom({
    schema,
    storage,
    onSessionRemoved(room, args) {
      // Cuando se va el último cliente, cerramos la room y su db.
      if (args.numSessionsRemaining === 0) {
        room.close()
        db.close()
        rooms.delete(roomId)
      }
    },
  })

  rooms.set(roomId, room)
  return room
}

const wss = new WebSocketServer({ port: PORT })

wss.on('connection', (socket, req) => {
  // Conexiones tipo  ws://host:PORT/connect/<roomId>?sessionId=<algo>
  const url = new URL(req.url, 'http://localhost')
  const match = url.pathname.match(/^\/connect\/(.+)$/)
  if (!match) {
    socket.close()
    return
  }

  const roomId = limpiarRoomId(decodeURIComponent(match[1]))
  const sessionId = url.searchParams.get('sessionId') || randomUUID()
  const room = abrirRoom(roomId)

  room.handleSocketConnect({ sessionId, socket })
})

console.log(`croma-sync escuchando en ws://0.0.0.0:${PORT}`)
