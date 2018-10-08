import * as express from 'express'
import { Server } from 'http'
import * as socketio from 'socket.io'
import * as path from 'path'

const app = express()
const http = new Server(app)
const io = socketio(http)

app.get('/', function (req, res) {
  res.sendFile(path.resolve('public', 'index.html'))
})

io.on('connection', function (socket) {
  console.log('A user connected: ' + socket.client.conn.remoteAddress)

  socket.on('disconnect', () => {
    console.log('A user disconnected: ' + socket.client.conn.remoteAddress)
  })

  socket.on('chatMessage', (message: string) => {
    if (message === '') {
      return
    }

    console.log(`New message from ${socket.client.conn.remoteAddress}: ${message}`)
    io.emit('chatMessage', message)
  })
})

http.listen(3000, function () {
  console.log('Listening on *:3000')
})
