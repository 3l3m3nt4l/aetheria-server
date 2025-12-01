import express from 'express'
import { createServer } from 'http'
import { Server } from 'socket.io'
import cors from 'cors'

const app = express()
app.use(cors())

const server = createServer(app)
const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"]
  }
})

const players = {}

io.on('connection', (socket) => {
  console.log('Player connected:', socket.id)

  // Нов играч влиза
  players[socket.id] = { x: 0, y: 5, z: 0, rotY: 0 }
  socket.emit('currentPlayers', players)
  socket.broadcast.emit('newPlayer', { id: socket.id, ...players[socket.id] })

  // Движение
  socket.on('move', (data) => {
    if (players[socket.id]) {
      players[socket.id] = { ...players[socket.id], ...data }
      socket.broadcast.emit('playerMoved', { id: socket.id, ...data })
    }
  })

  // Излизане
  socket.on('disconnect', () => {
    console.log('Player disconnected:', socket.id)
    delete players[socket.id]
    io.emit('playerLeft', socket.id)
  })
})

app.get('/', (req, res) => {
  res.send(`AETHERIA SERVER RUNNING | Players online: ${Object.keys(players).length}`)
})

const PORT = process.env.PORT || 3001
server.listen(PORT, () => {
  console.log(`AETHERIA server running on port ${PORT}`)
})
