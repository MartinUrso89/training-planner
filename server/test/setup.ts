import './env.js'
import prisma from '../src/lib/prisma.js'
import { beforeEach, afterAll } from 'vitest'
import { limpiarBaseDeDatos, sembrarTiposSeccion } from './helpers/baseDeDatos.js'

beforeEach(async () => {
  await limpiarBaseDeDatos()
  await sembrarTiposSeccion()
})

afterAll(async () => {
  await prisma.$disconnect()
})
