// src/rooms.js
import { mkdirSync } from 'fs'
import { join } from 'path'
import { NodeSqliteWrapper, SQLiteSyncStorage, TLSocketRoom } from '@tldraw/sync-core'
import Database from 'better-sqlite3'
import { schema } from './schema.js'

const DIR = './.rooms'
mkdirSync(DIR, { recursive: true })

const SALAS_VALIDAS = ['croma', 'basededatos', 'sistema']

const rooms = new Map()

export function makeOrLoadRoom(roomId) {
  if (!SALAS_VALIDAS.includes(roomId)) {
    throw new Error(`sala no permitida: ${roomId}`)
  }

  const existente = rooms.get(roomId)
  if (existente && !existente.isClosed()) {
    return existente
  }

  console.log('cargando sala', roomId)
  const db = new Database(join(DIR, `${roomId}.db`))
  const sql = new NodeSqliteWrapper(db)
  const storage = new SQLiteSyncStorage({ sql })

  const room = new TLSocketRoom({
    schema,
    storage,
    onSessionRemoved(room, args) {
      console.log('cliente desconectado', args.sessionId, roomId)
      if (args.numSessionsRemaining === 0) {
        console.log('cerrando sala', roomId)
        room.close()
        db.close()
        rooms.delete(roomId)
      }
    },
  })

  rooms.set(roomId, room)
  return room
}