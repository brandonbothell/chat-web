import { readFileSync } from 'fs'
import * as https from 'https'
import * as Websocket from 'ws'

const server = https.createServer({
  key: readFileSync('/etc/letsencrypt/live/www.macho.ninja/privkey.pem'),
  cert: readFileSync('/etc/letsencrypt/live/www.macho.ninja/cert.pem')
})
const wss = new Websocket.Server({ server })

function broadcast (data: any) {
  wss.clients.forEach(function each (client) {
    if (client.readyState === Websocket.OPEN) {
      client.send(data)
    }
  })
}

wss.on('connection', function (ws, req) {
  console.log('A user connected: ' + req.connection.remoteAddress)

  ws.on('close', () => {
    console.log('A user disconnected: ' + req.connection.remoteAddress)
  })

  ws.on('message', (message: { message: string, nickname: string }) => {
    if (message.message) {
      if (message.message === '' || message.nickname === '') {
        return
      }

      console.log(`New message from ${message.nickname} (${req.connection.remoteAddress}): ${message.message}`)
      return broadcast(message)
    }
  })

  ws.send({ message: 'Socket connected!', nickname: 'Socket' })
})

server.listen(3000, function () {
  console.log(`Listening on port 3000`)
})
