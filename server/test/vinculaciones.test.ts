import { describe, it, expect } from 'vitest'
import request from 'supertest'
import { app } from '../src/index.js'
import { registrarUsuario, autenticar } from './helpers/registrar.js'
import type { UsuarioRegistrado } from './helpers/registrar.js'

const vincular = async (trainer: UsuarioRegistrado, athlete: UsuarioRegistrado) => {
  const res = await request(app).post('/vinculaciones').set(autenticar(trainer)).send({ correo: athlete.correo })
  expect(res.status).toBe(201)
  return res.body
}

describe('POST /vinculaciones', () => {
  it('el entrenador envía una solicitud que queda Pendiente', async () => {
    const trainer = await registrarUsuario('Trainer', 'trainer@test.com', 'ENTRENADOR')
    const athlete = await registrarUsuario('Athlete', 'athlete@test.com')

    const res = await request(app).post('/vinculaciones').set(autenticar(trainer)).send({ correo: athlete.correo })
    expect(res.status).toBe(201)
    expect(res.body.estado).toBe('Pendiente')
    expect(res.body.entrenador.id).toBe(trainer.userId)
    expect(res.body.atleta.id).toBe(athlete.userId)
  })

  it('devuelve 404 si el correo no existe', async () => {
    const trainer = await registrarUsuario('Trainer', 'trainer@test.com', 'ENTRENADOR')
    const res = await request(app).post('/vinculaciones').set(autenticar(trainer)).send({ correo: 'nadie@test.com' })
    expect(res.status).toBe(404)
  })

  it('devuelve 400 si el entrenador intenta vincularse a sí mismo o a otro entrenador', async () => {
    const t1 = await registrarUsuario('T1', 't1@test.com', 'ENTRENADOR')
    const t2 = await registrarUsuario('T2', 't2@test.com', 'ENTRENADOR')

    const self = await request(app).post('/vinculaciones').set(autenticar(t1)).send({ correo: t1.correo })
    expect(self.status).toBe(400)

    const otro = await request(app).post('/vinculaciones').set(autenticar(t1)).send({ correo: t2.correo })
    expect(otro.status).toBe(400)
  })

  it('devuelve 409 si ya hay una solicitud pendiente o una vinculación activa', async () => {
    const trainer = await registrarUsuario('Trainer', 'trainer@test.com', 'ENTRENADOR')
    const athlete = await registrarUsuario('Athlete', 'athlete@test.com')

    const v = await vincular(trainer, athlete)
    const duplicado = await request(app)
      .post('/vinculaciones')
      .set(autenticar(trainer))
      .send({ correo: athlete.correo })
    expect(duplicado.status).toBe(409)

    await request(app).patch(`/vinculaciones/${v.id}/aceptar`).set(autenticar(athlete))
    const activo = await request(app)
      .post('/vinculaciones')
      .set(autenticar(trainer))
      .send({ correo: athlete.correo })
    expect(activo.status).toBe(409)
  })

  it('reabre a Pendiente una vinculación Inactiva', async () => {
    const trainer = await registrarUsuario('Trainer', 'trainer@test.com', 'ENTRENADOR')
    const athlete = await registrarUsuario('Athlete', 'athlete@test.com')
    const v = await vincular(trainer, athlete)

    await request(app).patch(`/vinculaciones/${v.id}/aceptar`).set(autenticar(athlete))
    await request(app).patch(`/vinculaciones/${v.id}/inactivar`).set(autenticar(athlete))

    const res = await request(app).post('/vinculaciones').set(autenticar(trainer)).send({ correo: athlete.correo })
    expect(res.status).toBe(201)
    expect(res.body.estado).toBe('Pendiente')
  })

  it('devuelve 403 si un atleta intenta enviar una solicitud', async () => {
    const a1 = await registrarUsuario('A1', 'a1@test.com')
    const a2 = await registrarUsuario('A2', 'a2@test.com')
    const res = await request(app).post('/vinculaciones').set(autenticar(a1)).send({ correo: a2.correo })
    expect(res.status).toBe(403)
  })

  it('devuelve 400 sin correo y 401 sin token', async () => {
    const trainer = await registrarUsuario('Trainer', 'trainer@test.com', 'ENTRENADOR')
    const sinCorreo = await request(app).post('/vinculaciones').set(autenticar(trainer)).send({})
    expect(sinCorreo.status).toBe(400)

    const sinToken = await request(app).post('/vinculaciones').send({ correo: 'x@test.com' })
    expect(sinToken.status).toBe(401)
  })
})

describe('GET /vinculaciones', () => {
  it('el entrenador ve a sus atletas y el atleta a sus entrenadores', async () => {
    const trainer = await registrarUsuario('Trainer', 'trainer@test.com', 'ENTRENADOR')
    const athlete = await registrarUsuario('Athlete', 'athlete@test.com')
    await vincular(trainer, athlete)

    const comoEntrenador = await request(app).get('/vinculaciones').set(autenticar(trainer))
    expect(comoEntrenador.status).toBe(200)
    expect(comoEntrenador.body).toHaveLength(1)
    expect(comoEntrenador.body[0].atleta.id).toBe(athlete.userId)

    const comoAtleta = await request(app).get('/vinculaciones').set(autenticar(athlete))
    expect(comoAtleta.status).toBe(200)
    expect(comoAtleta.body[0].entrenador.id).toBe(trainer.userId)
  })

  it('filtra por estado', async () => {
    const trainer = await registrarUsuario('Trainer', 'trainer@test.com', 'ENTRENADOR')
    const athlete = await registrarUsuario('Athlete', 'athlete@test.com')
    await vincular(trainer, athlete)

    const pendientes = await request(app).get('/vinculaciones?estado=Pendiente').set(autenticar(trainer))
    expect(pendientes.body).toHaveLength(1)
    const activas = await request(app).get('/vinculaciones?estado=Activo').set(autenticar(trainer))
    expect(activas.body).toHaveLength(0)
  })
})

describe('PATCH /vinculaciones/:id/aceptar', () => {
  it('el atleta acepta y queda Activo con aceptadoEn', async () => {
    const trainer = await registrarUsuario('Trainer', 'trainer@test.com', 'ENTRENADOR')
    const athlete = await registrarUsuario('Athlete', 'athlete@test.com')
    const v = await vincular(trainer, athlete)

    const res = await request(app).patch(`/vinculaciones/${v.id}/aceptar`).set(autenticar(athlete))
    expect(res.status).toBe(200)
    expect(res.body.estado).toBe('Activo')
    expect(res.body.aceptadoEn).toBeTruthy()
  })

  it('devuelve 403 si lo acepta el entrenador o un tercero', async () => {
    const trainer = await registrarUsuario('Trainer', 'trainer@test.com', 'ENTRENADOR')
    const athlete = await registrarUsuario('Athlete', 'athlete@test.com')
    const otro = await registrarUsuario('Otro', 'otro@test.com')
    const v = await vincular(trainer, athlete)

    const comoEntrenador = await request(app).patch(`/vinculaciones/${v.id}/aceptar`).set(autenticar(trainer))
    expect(comoEntrenador.status).toBe(403)

    const comoOtro = await request(app).patch(`/vinculaciones/${v.id}/aceptar`).set(autenticar(otro))
    expect(comoOtro.status).toBe(403)
  })

  it('devuelve 400 si la vinculación ya está activa y 404 si no existe', async () => {
    const trainer = await registrarUsuario('Trainer', 'trainer@test.com', 'ENTRENADOR')
    const athlete = await registrarUsuario('Athlete', 'athlete@test.com')
    const v = await vincular(trainer, athlete)

    await request(app).patch(`/vinculaciones/${v.id}/aceptar`).set(autenticar(athlete))
    const doble = await request(app).patch(`/vinculaciones/${v.id}/aceptar`).set(autenticar(athlete))
    expect(doble.status).toBe(400)

    const inexistente = await request(app).patch('/vinculaciones/inexistente/aceptar').set(autenticar(athlete))
    expect(inexistente.status).toBe(404)
  })
})

describe('PATCH /vinculaciones/:id/inactivar', () => {
  it('entrenador o atleta pueden inactivar una vinculación activa', async () => {
    const trainer = await registrarUsuario('Trainer', 'trainer@test.com', 'ENTRENADOR')
    const athlete = await registrarUsuario('Athlete', 'athlete@test.com')
    const v = await vincular(trainer, athlete)
    await request(app).patch(`/vinculaciones/${v.id}/aceptar`).set(autenticar(athlete))

    const porAtleta = await request(app).patch(`/vinculaciones/${v.id}/inactivar`).set(autenticar(athlete))
    expect(porAtleta.status).toBe(200)
    expect(porAtleta.body.estado).toBe('Inactivo')

    const v2 = await vincular(trainer, athlete)
    await request(app).patch(`/vinculaciones/${v2.id}/aceptar`).set(autenticar(athlete))
    const porEntrenador = await request(app).patch(`/vinculaciones/${v2.id}/inactivar`).set(autenticar(trainer))
    expect(porEntrenador.status).toBe(200)
    expect(porEntrenador.body.estado).toBe('Inactivo')
  })

  it('devuelve 403 a un tercero y 400 si está pendiente', async () => {
    const trainer = await registrarUsuario('Trainer', 'trainer@test.com', 'ENTRENADOR')
    const athlete = await registrarUsuario('Athlete', 'athlete@test.com')
    const otro = await registrarUsuario('Otro', 'otro@test.com')
    const v = await vincular(trainer, athlete)

    const tercero = await request(app).patch(`/vinculaciones/${v.id}/inactivar`).set(autenticar(otro))
    expect(tercero.status).toBe(403)

    const pendiente = await request(app).patch(`/vinculaciones/${v.id}/inactivar`).set(autenticar(athlete))
    expect(pendiente.status).toBe(400)
  })
})

describe('DELETE /vinculaciones/:id', () => {
  it('cancela o rechaza una solicitud pendiente', async () => {
    const trainer = await registrarUsuario('Trainer', 'trainer@test.com', 'ENTRENADOR')
    const athlete = await registrarUsuario('Athlete', 'athlete@test.com')
    const v = await vincular(trainer, athlete)

    const porEntrenador = await request(app).delete(`/vinculaciones/${v.id}`).set(autenticar(trainer))
    expect(porEntrenador.status).toBe(204)

    const v2 = await vincular(trainer, athlete)
    const porAtleta = await request(app).delete(`/vinculaciones/${v2.id}`).set(autenticar(athlete))
    expect(porAtleta.status).toBe(204)

    const lista = await request(app).get('/vinculaciones').set(autenticar(trainer))
    expect(lista.body).toHaveLength(0)
  })

  it('devuelve 400 si está activa y 403 a un tercero', async () => {
    const trainer = await registrarUsuario('Trainer', 'trainer@test.com', 'ENTRENADOR')
    const athlete = await registrarUsuario('Athlete', 'athlete@test.com')
    const otro = await registrarUsuario('Otro', 'otro@test.com')
    const v = await vincular(trainer, athlete)
    await request(app).patch(`/vinculaciones/${v.id}/aceptar`).set(autenticar(athlete))

    const activa = await request(app).delete(`/vinculaciones/${v.id}`).set(autenticar(trainer))
    expect(activa.status).toBe(400)

    await request(app).patch(`/vinculaciones/${v.id}/inactivar`).set(autenticar(athlete))
    await vincular(trainer, athlete)
    const tercero = await request(app).delete(`/vinculaciones/${v.id}`).set(autenticar(otro))
    expect(tercero.status).toBe(403)
  })
})
