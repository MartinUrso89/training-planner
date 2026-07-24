import type { Express } from 'express'
import { jwtCheck } from '../middleware/auth.middleware.js'

import authRoutes from './auth.routes.js'
import exerciseRoutes from './exercise.routes.js'
import planTemplateRoutes from './planTemplate.routes.js'
import workoutRoutes from './workout.routes.js'
import sectionTypeRoutes from './sectionType.routes.js'

export function registerRoutes(app: Express): void {
  app.get('/health', (_req, res) => res.json({ status: 'ok' }))

  app.use('/auth', authRoutes)
  app.use('/section-types', sectionTypeRoutes)
  app.use('/exercises', jwtCheck, exerciseRoutes)
  app.use('/plan-templates', jwtCheck, planTemplateRoutes)
  app.use('/workouts', jwtCheck, workoutRoutes)
}
