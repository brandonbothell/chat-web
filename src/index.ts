import * as express from 'express'
import { readFileSync } from 'fs'
import * as https from 'https'
import * as socketio from 'socket.io'
import * as path from 'path'

const app = express()
const server = https.createServer({
  key: readFileSync('/etc/letsencrypt/live/www.macho.ninja/privkey.pem'),
  cert: readFileSync('/etc/letsencrypt/live/www.macho.ninja/cert.pem')
}, app).listen(3000, function () {
  console.log(`Listening on port 3000`)
})
const io = socketio.listen(server)

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
