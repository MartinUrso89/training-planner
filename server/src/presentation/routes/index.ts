import type { Express } from 'express'

import authRoutes from './auth.routes.js'

export function registerRoutes(app: Express): void {
  app.get('/health', (_req, res) => res.json({ status: 'ok' }))

  app.use('/auth', authRoutes)
}
