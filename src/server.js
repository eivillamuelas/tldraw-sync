// src/server.js
import { createServer } from 'http'
import express from 'express'
import { WebSocketServer } from 'ws'
import { makeOrLoadRoom } from './rooms.js'

const PORT = process.env.PORT || 5858

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
    try {
      const room = makeOrLoadRoom(roomId)
      room.handleSocketConnect({ sessionId, socket: ws })
    } catch (e) {
      console.error(e)
      ws.close()
    }
  })
})

server.listen(PORT, () => {
  console.log(`servidor de sync escuchando en http://localhost:${PORT}`)
})