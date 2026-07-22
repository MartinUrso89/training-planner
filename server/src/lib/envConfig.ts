import 'dotenv/config'

const required = [
  'DATABASE_URL',
  'JWT_SECRET',
  'JWT_REFRESH_SECRET',
]

const missing = required.filter((key) => !process.env[key])
if (missing.length > 0) {
  throw new Error(`Missing required environment variables: ${missing.join(', ')}\nCopy .env.example to .env and fill in the values.`)
}

export const env = {
  get PORT() { return process.env.PORT || '3000' },
  get NODE_ENV() { return process.env.NODE_ENV || 'development' },
  get CORS_ORIGIN() { return process.env.CORS_ORIGIN },
  get DATABASE_URL() { return process.env.DATABASE_URL! },
  get JWT_SECRET() { return process.env.JWT_SECRET! },
  get JWT_REFRESH_SECRET() { return process.env.JWT_REFRESH_SECRET! },
  get JWT_ACCESS_EXPIRY() { return process.env.JWT_ACCESS_EXPIRY || '2h' },
  get JWT_REFRESH_EXPIRY() { return process.env.JWT_REFRESH_EXPIRY || '7d' },
}
