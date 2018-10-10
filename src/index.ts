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

  ws.on('disconnect', () => {
    console.log('A user disconnected: ' + req.connection.remoteAddress)
  })

  ws.on('message', (message: string) => {
    if (message.startsWith('message:')) {
      const msg = message.substring(8, message.length)

      if (msg === '') {
        return
      }

      console.log(`New message from ${req.connection.remoteAddress}: ${msg}`)
      return broadcast(message)
    }
  })

  ws.send('websocket connected')
})

server.listen(3000, function () {
  console.log(`Listening on port 3000`)
})
