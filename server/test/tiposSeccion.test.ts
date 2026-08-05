import { describe, it, expect } from 'vitest'
import request from 'supertest'
import { app } from '../src/index.js'

describe('GET /tipos-seccion', () => {
  it('devuelve los 5 tipos de sección (ruta pública)', async () => {
    const res = await request(app).get('/tipos-seccion')
    expect(res.status).toBe(200)
    expect(res.body).toHaveLength(5)
    expect(res.body.map((t: { id: string }) => t.id).sort()).toEqual(['amrap', 'circuit', 'normal', 'technique', 'warmup'])
    const amrap = res.body.find((t: { id: string }) => t.id === 'amrap')
    expect(amrap.configuracion.usaTiempoLimite).toBe(true)
    expect(amrap.configuracion.usaRondas).toBe(false)
  })
})
