import { logger } from './lib/logger.js'

process.on('unhandledRejection', (reason) => {
  logger.fatal({ err: reason instanceof Error ? reason : new Error(String(reason)) }, 'Unhandled rejection')
})

import express from 'express'
import cors from 'cors'
import morgan from 'morgan'
import { env } from './lib/envConfig.js'
import { registerRoutes } from './presentation/routes/index.js'
import { errorHandler } from './presentation/middleware/error.middleware.js'

export const app = express()
const PORT = env.PORT

app.use(cors({ origin: env.CORS_ORIGIN }))
app.use(express.json())
app.use(morgan('dev'))

registerRoutes(app)
app.use(errorHandler)

if (env.NODE_ENV !== 'test') {
  app.listen(PORT, () => {
    logger.info({ port: PORT }, `Server running on port ${PORT}`)
  })
}
