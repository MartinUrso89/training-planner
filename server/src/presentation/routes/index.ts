import type { Express } from 'express'
import { jwtCheck } from '../middleware/auth.middleware.js'

import authRoutes from './auth.routes.js'
import ejercicioRoutes from './ejercicio.routes.js'
import plantillaPlanRoutes from './plantillaPlan.routes.js'
import entrenamientoRoutes from './entrenamiento.routes.js'
import tipoSeccionRoutes from './tipoSeccion.routes.js'

export function registerRoutes(app: Express): void {
  app.get('/health', (_req, res) => res.json({ status: 'ok' }))

  app.use('/auth', authRoutes)
  app.use('/tipos-seccion', tipoSeccionRoutes)
  app.use('/ejercicios', jwtCheck, ejercicioRoutes)
  app.use('/plantillas-plan', jwtCheck, plantillaPlanRoutes)
  app.use('/entrenamientos', jwtCheck, entrenamientoRoutes)
}
