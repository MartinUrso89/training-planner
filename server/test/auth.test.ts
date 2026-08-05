import { describe, it, expect } from 'vitest'
import request from 'supertest'
import jwt from 'jsonwebtoken'
import { app } from '../src/index.js'
import { env } from '../src/lib/envConfig.js'
import { registrarUsuario } from './helpers/registrar.js'

describe('POST /auth/register', () => {
  it('crea un usuario y devuelve tokens', async () => {
    const res = await request(app).post('/auth/register').send({
      nombre: 'Nuevo Usuario',
      correo: 'nuevo@test.com',
      contrasena: '123456',
    })
    expect(res.status).toBe(201)
    expect(res.body.accessToken).toBeTruthy()
    expect(res.body.refreshToken).toBeTruthy()
    expect(res.body.user).toMatchObject({ nombre: 'Nuevo Usuario', correo: 'nuevo@test.com', rol: 'ATLETA' })
    expect(res.body.user.contrasena).toBeUndefined()
  })

  it('guarda el rol enviado (ENTRENADOR) y lo devuelve', async () => {
    const res = await request(app).post('/auth/register').send({
      nombre: 'Entrenadora',
      correo: 'entrenadora@test.com',
      contrasena: '123456',
      rol: 'ENTRENADOR',
    })
    expect(res.status).toBe(201)
    expect(res.body.user.rol).toBe('ENTRENADOR')
  })

  it('rechaza un rol inválido', async () => {
    const res = await request(app).post('/auth/register').send({
      nombre: 'Raro',
      correo: 'raro@test.com',
      contrasena: '123456',
      rol: 'SUPERHUMANO',
    })
    expect(res.status).toBe(400)
  })

  it('rechaza datos incompletos o contraseña corta', async () => {
    const casos = [
      { correo: 'a@test.com', contrasena: '123456' },
      { nombre: 'A', contrasena: '123456' },
      { nombre: 'A', correo: 'a@test.com' },
      { nombre: 'A', correo: 'a@test.com', contrasena: '123' },
    ]
    for (const body of casos) {
      const res = await request(app).post('/auth/register').send(body)
      expect(res.status).toBe(400)
      expect(res.body.error).toBeTruthy()
    }
  })

  it('devuelve 409 si el correo ya está registrado', async () => {
    await registrarUsuario('Uno', 'dup@test.com')
    const res = await request(app).post('/auth/register').send({
      nombre: 'Dos',
      correo: 'dup@test.com',
      contrasena: '123456',
    })
    expect(res.status).toBe(409)
  })
})

describe('POST /auth/login', () => {
  it('loguea con credenciales válidas', async () => {
    await registrarUsuario('Login', 'login@test.com')
    const res = await request(app).post('/auth/login').send({ correo: 'login@test.com', contrasena: '123456' })
    expect(res.status).toBe(200)
    expect(res.body.accessToken).toBeTruthy()
    expect(res.body.refreshToken).toBeTruthy()
    expect(res.body.user.correo).toBe('login@test.com')
  })

  it('devuelve 401 con credenciales inválidas', async () => {
    const res = await request(app).post('/auth/login').send({ correo: 'nadie@test.com', contrasena: '123456' })
    expect(res.status).toBe(401)
    expect(res.body.error).toBe('Credenciales inválidas')
  })
})

describe('POST /auth/refresh', () => {
  it('rota el refresh token (no reutilizable)', async () => {
    const usuario = await registrarUsuario()
    const res = await request(app).post('/auth/refresh').send({ refreshToken: usuario.refreshToken })
    expect(res.status).toBe(200)
    expect(res.body.accessToken).toBeTruthy()
    expect(res.body.refreshToken).toBeTruthy()

    const reutilizar = await request(app).post('/auth/refresh').send({ refreshToken: usuario.refreshToken })
    expect(reutilizar.status).toBe(401)
  })

  it('devuelve 401 con token inválido', async () => {
    const res = await request(app).post('/auth/refresh').send({ refreshToken: 'token-invalido' })
    expect(res.status).toBe(401)
  })

  it('devuelve 400 sin refresh token', async () => {
    const res = await request(app).post('/auth/refresh').send({})
    expect(res.status).toBe(400)
  })
})

describe('GET /auth/me', () => {
  it('devuelve el usuario autenticado', async () => {
    const usuario = await registrarUsuario('Me', 'me@test.com', 'ENTRENADOR')
    const res = await request(app).get('/auth/me').set({ Authorization: `Bearer ${usuario.accessToken}` })
    expect(res.status).toBe(200)
    expect(res.body.correo).toBe('me@test.com')
    expect(res.body.rol).toBe('ENTRENADOR')
  })

  it('devuelve 401 sin token', async () => {
    const res = await request(app).get('/auth/me')
    expect(res.status).toBe(401)
    expect(res.body.error).toBe('Token requerido')
  })

  it('devuelve 401 con token expirado', async () => {
    const expirado = jwt.sign({ sub: 'usuario-inexistente' }, env.JWT_SECRET, { expiresIn: '-1s' })
    const res = await request(app).get('/auth/me').set({ Authorization: `Bearer ${expirado}` })
    expect(res.status).toBe(401)
    expect(res.body.error).toBe('Token inválido o expirado')
  })
})
