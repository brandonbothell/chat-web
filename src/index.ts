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
  const ip = req.rawHeaders[req.rawHeaders.indexOf(req.rawHeaders.find(header => header.toLowerCase().startsWith('x-forwarded-for'))) + 1]
  console.log('A user connected: ' + ip)

  ws.on('close', () => {
    console.log('A user disconnected: ' + ip)
  })

  ws.on('message', (message: string) => {
    const msg: { message: string, nickname: string } = JSON.parse(message)

    if (msg.message) {
      if (msg.message === '' || msg.nickname === '') {
        return
      }

      console.log(`New message from ${msg.nickname} (${ip}): ${msg.message}`)
      return broadcast(message)
    }
  })

  ws.send(JSON.stringify({ message: 'Socket connected!', nickname: 'Socket' }))
})

server.listen(3000, function () {
  console.log(`Listening on port 3000`)
})
