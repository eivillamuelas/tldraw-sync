import { createServer } from 'http'
import express from 'express'
import { WebSocketServer } from 'ws'
import crypto from 'crypto'
import { makeOrLoadRoom } from './rooms.js'

const PORT = process.env.PORT || 5858
const SESSION_SECRET = process.env.SESSION_SECRET || "lentejas"

function tokenValido(token) {
  if (!token) return false
  const partes = token.split('.')
  if (partes.length !== 3) return false
  const [id, ts, firma] = partes
  const payload = `${id}.${ts}`
  const esperada = crypto.createHmac('sha256', SESSION_SECRET).update(payload).digest('hex')
  if (firma !== esperada) return false
  // caduca a los 60s, solo es para autorizar la conexión inicial
  if (Date.now() - Number(ts) > 60_000) return false
  return true
}

const app = express()
const server = createServer(app)
const wss = new WebSocketServer({ noServer: true })

app.get('/', (req, res) => {
  res.send('tldraw sync server ok')
})

server.on('upgrade', (req, socket, head) => {
  const url = new URL(req.url, 'http://localhost')
  const match = url.pathname.match(/^\/connect\/([^/]+)$/)
  if (!match) {
    socket.destroy()
    return
  }

  wss.handleUpgrade(req, socket, head, (ws) => {
    const roomId = match[1]
    const sessionId = url.searchParams.get('sessionId')
    const token = url.searchParams.get('token')
    const logueado = tokenValido(token)

    try {
      const room = makeOrLoadRoom(roomId)
      room.handleSocketConnect({ sessionId, socket: ws, isReadonly: !logueado })
    } catch (e) {
      console.error(e)
      ws.close()
    }
  })
})

server.listen(PORT, () => {
  console.log(`servidor de sync escuchando en http://localhost:${PORT}`)
})