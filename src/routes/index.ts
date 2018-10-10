import { BanRoutes } from './Ban'
import { Application } from 'express'

export function Route (app: Application) {
  BanRoutes(app)
}
