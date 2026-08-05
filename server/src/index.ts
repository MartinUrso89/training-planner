import { logger } from './lib/logger.js'

process.on('unhandledRejection', (reason) => {
  logger.fatal({ err: reason instanceof Error ? reason : new Error(String(reason)) }, 'Unhandled rejection')
})

import express from 'express'
import cors from 'cors'
import morgan from 'morgan'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { env } from './lib/envConfig.js'
import { registerRoutes } from './presentation/routes/index.js'
import { errorHandler } from './presentation/middleware/error.middleware.js'

export const app = express()
const PORT = env.PORT

const __dirname = path.dirname(fileURLToPath(import.meta.url))

app.use(cors({ origin: env.CORS_ORIGIN }))
app.use(express.json())
if (env.NODE_ENV !== 'test') app.use(morgan('dev'))
app.use('/static', express.static(path.join(__dirname, '../public')))

registerRoutes(app)
app.use(errorHandler)

if (env.NODE_ENV !== 'test') {
  app.listen(PORT, () => {
    logger.info({ port: PORT }, `Server running on port ${PORT}`)
  })
}
