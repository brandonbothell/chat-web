import * as express from 'express'
import { readFileSync } from 'fs'
import * as https from 'https'
import * as socketio from 'socket.io'
import * as Websocket from 'ws'
import * as path from 'path'

const app = express()
const server = https.createServer({
  key: readFileSync('/etc/letsencrypt/live/www.macho.ninja/privkey.pem'),
  cert: readFileSync('/etc/letsencrypt/live/www.macho.ninja/cert.pem')
}, app).listen(3000, function () {
  console.log(`Listening on port 3000`)
})
const wss = new Websocket.Server({ server })

/* app.get('/', function (req, res) {
  res.sendFile(path.resolve('public', 'index.html'))
}) */

wss.on('connection', function (ws, req) {
  console.log('A user connected: ' + req.connection.remoteAddress)

  ws.on('disconnect', () => {
    console.log('A user disconnected: ' + req.connection.remoteAddress)
  })

  ws.on('chatMessage', (message: string) => {
    if (message === '') {
      return
    }

    console.log(`New message from ${req.connection.remoteAddress}: ${message}`)
    wss.emit('chatMessage', message)
  })

  ws.send('websocket connected')
})
