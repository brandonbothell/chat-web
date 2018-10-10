import { readFileSync } from 'fs'
import * as https from 'https'
import * as Websocket from 'ws'
import * as express from 'express'
import { Route } from './routes'
import { createConnection, getRepository } from 'typeorm'
import { IPBan } from './entity'
import { db } from './config'

const app = express()
const server = https.createServer({
  key: readFileSync('/etc/letsencrypt/live/www.macho.ninja/privkey.pem'),
  cert: readFileSync('/etc/letsencrypt/live/www.macho.ninja/cert.pem')
}, app)
const wss = new Websocket.Server({ server })

function broadcast (data: any) {
  wss.clients.forEach(function each (client) {
    if (client.readyState === Websocket.OPEN) {
      client.send(data)
    }
  })
}

createConnection({
  type: 'postgres',
  host: db.host,
  port: db.port,
  username: db.user,
  password: db.password,
  database: db.database,
  entities: [ './entity/**/*.js' ]
}).then(connection => {
  return connection.synchronize()
}).then(() => {
  Route(app)

  const banRepository = getRepository(IPBan)

  wss.on('connection', function (ws, req) {
    const ip = req.rawHeaders[req.rawHeaders.indexOf(req.rawHeaders.find(header => header.toLowerCase().startsWith('x-forwarded-for'))) + 1]
    const ban = banRepository.findOne({ where: { ip } })

    if (ban) {
      console.log('Banned user attempted connecting: ' + ip)
      return ws.terminate()
    }

    console.log('A user connected: ' + ip)

    ws.on('close', () => {
      console.log('A user disconnected: ' + ip)
    })

    ws.on('message', (message: string) => {
      const msg: { message: string, nickname: string } = JSON.parse(message)

      const ban = banRepository.findOne({ where: { ip } })

      if (ban) {
        console.log('Banned user attempted messaging: ' + ip)
        return ws.terminate()
      }

      if (msg.message) {
        if (msg.message === '' || msg.nickname === null || msg.nickname === '' || msg.nickname === undefined) {
          return ws.send(JSON.stringify({ message: 'Wow, messing with code.', nickname: 'Socket' }))
        }

        if (msg.message.length > 2500) {
          return ws.send(JSON.stringify({ message: 'Please send a message shorter than 2500 characters.', nickname: 'Socket' }))
        }

        if (msg.nickname.toLowerCase() === 'socket') {
          return ws.send(JSON.stringify({ message: 'Nice try.', nickname: 'Socket' }))
        }

        console.log(`New message from ${msg.nickname} (${ip}): ${msg.message}`)
        return broadcast(message)
      }
    })

    ws.send(JSON.stringify({ message: 'Socket connected!', nickname: 'Socket' }))
  })
})

server.listen(3000, function () {
  console.log(`Listening on port 3000`)
})
