import { Application } from 'express'
import { IPBan } from '../entity'
import { getRepository } from 'typeorm'
import { code } from '../config'

export async function BanRoutes (app: Application) {
  const banRepository = getRepository(IPBan)

  app.post('/api/ban', async (req, res) => {
    const reqCode = req.query.code

    if (reqCode !== code) {
      return res.send({ error: 'invalid_code', success: false })
    }

    const ban = new IPBan(req.body)

    const response = await banRepository.save(ban).catch(error => {
      console.log(error)
      return error
    })

    res.statusCode = 201
    res.send(response)
  })

  app.delete('/api/ban', async (req, res) => {
    const reqCode = req.query.code

    if (reqCode !== code) {
      return res.send({ error: 'invalid_code', success: false })
    }

    const id = req.query.id
    const response = await banRepository.delete({ id }).catch(error => {
      console.log(error)
      return error
    })

    res.send(response)
  })

  app.get('/api/ban/:id', async (req, res) => {
    const reqCode = req.query.code

    if (reqCode !== code) {
      return res.send({ error: 'invalid_code', success: false })
    }

    const id: number = req.params.id
    const ban = await banRepository.findOne(id)

    res.send(ban)
  })

  app.get('/api/search/ban', async (req, res) => {
    const reqCode = req.query.code

    if (reqCode !== code) {
      return res.send({ error: 'invalid_code', success: false })
    }

    const ip = req.query.ip
    const ban = await banRepository.findOne({ where: { ip } })

    res.send(ban)
  })
}
