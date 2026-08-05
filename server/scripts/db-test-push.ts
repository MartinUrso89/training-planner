import { config } from 'dotenv'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { spawnSync } from 'node:child_process'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const envPath = path.join(__dirname, '..', '.env.test')
config({ path: envPath, override: true, quiet: true })

const url = process.env.DATABASE_URL
if (!url) {
  console.error('DATABASE_URL no encontrada en .env.test')
  process.exit(1)
}

const match = url.match(/^mysql:\/\/([^:]+):([^@]+)@([^:]+):(\d+)\/([^?]+)/)
if (match) {
  const [, user, pass, host, port, db] = match
  const crear = spawnSync('mysql', [`-u${user}`, `-p${pass}`, `-h${host}`, `-P${port}`, '-e', `CREATE DATABASE IF NOT EXISTS \`${db}\``], {
    stdio: 'inherit',
    encoding: 'utf-8',
  })
  if (crear.status !== 0) {
    console.warn('No se pudo crear la base con la CLI mysql (¿está en PATH?). Si el push falla, creala manualmente.')
  }
}

const comando = process.platform === 'win32' ? 'pnpm.cmd prisma db push' : 'pnpm prisma db push'
const resultado = spawnSync(comando, { stdio: 'inherit', env: process.env, encoding: 'utf-8', shell: process.platform === 'win32' })
process.exit(resultado.status ?? 1)
