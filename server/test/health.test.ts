import { describe, it, expect } from 'vitest'
import { app } from '../src/index.js'
import request from 'supertest'

describe('Health', () => {
  it('returns ok', async () => {
    const res = await request(app).get('/health')
    expect(res.status).toBe(200)
    expect(res.body).toEqual({ status: 'ok' })
  })
})
