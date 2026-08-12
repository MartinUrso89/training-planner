import { describe, it, expect } from 'vitest'
import request from 'supertest'
import { app } from '../src/index.js'
import { registrarUsuario, autenticar } from './helpers/registrar.js'
import type { UsuarioRegistrado } from './helpers/registrar.js'

const vincular = async (trainer: UsuarioRegistrado, athlete: UsuarioRegistrado): Promise<void> => {
  const solicitud = await request(app)
    .post('/vinculaciones')
    .set(autenticar(trainer))
    .send({ correo: athlete.correo })
  expect(solicitud.status).toBe(201)
  const aceptar = await request(app)
    .patch(`/vinculaciones/${solicitud.body.id}/aceptar`)
    .set(autenticar(athlete))
  expect(aceptar.status).toBe(200)
}

const construirEntrenamiento = async (trainer: UsuarioRegistrado, athlete: UsuarioRegistrado) => {
  await vincular(trainer, athlete)
  const plantilla = await request(app).post('/plantillas-plan').set(autenticar(trainer)).send({ nombre: 'Plan Semanal' })
  const plantillaId = plantilla.body.id

  const seccion = await request(app)
    .post(`/plantillas-plan/${plantillaId}/secciones`)
    .set(autenticar(trainer))
    .send({ tipoSeccionId: 'normal', nombre: 'Fuerza', orden: 1, descansoEntreSecciones: 300 })
  const seccionId = seccion.body.id

  const ejercicio = await request(app).post('/ejercicios').set(autenticar(trainer)).send({
    nombre: 'Press de banca',
    musculoPrincipal: 'Pecho',
    tipoArticular: 'Poliarticular',
    patronMovimiento: 'Empuje',
  })

  await request(app)
    .post(`/plantillas-plan/${plantillaId}/secciones/${seccionId}/ejercicios`)
    .set(autenticar(trainer))
    .send({ ejercicioId: ejercicio.body.id, orden: 1, series: 4, repeticiones: 8 })

  const asignado = await request(app)
    .post('/entrenamientos/asignar')
    .set(autenticar(trainer))
    .send({ plantillaId, usuarioId: athlete.userId, fecha: '2026-08-04T00:00:00.000Z' })
  expect(asignado.status).toBe(201)
  return asignado.body
}

describe('GET /entrenamientos', () => {
  it('lista entrenamientos del usuario', async () => {
    const trainer = await registrarUsuario('Trainer', 'trainer@test.com', 'ENTRENADOR')
    const athlete = await registrarUsuario('Athlete', 'athlete@test.com')
    await construirEntrenamiento(trainer, athlete)

    const res = await request(app).get('/entrenamientos').set(autenticar(athlete))
    expect(res.status).toBe(200)
    expect(res.body).toHaveLength(1)
    expect(res.body[0].usuarioId).toBe(athlete.userId)
  })
})

describe('GET /entrenamientos/:id', () => {
  it('devuelve el entrenamiento con sus secciones y ejercicios', async () => {
    const trainer = await registrarUsuario('Trainer', 'trainer@test.com', 'ENTRENADOR')
    const athlete = await registrarUsuario('Athlete', 'athlete@test.com')
    const entrenamiento = await construirEntrenamiento(trainer, athlete)

    const res = await request(app).get(`/entrenamientos/${entrenamiento.id}`).set(autenticar(athlete))
    expect(res.status).toBe(200)
    expect(res.body.secciones).toHaveLength(1)
    expect(res.body.secciones[0].ejercicios[0].ejercicio.nombre).toBe('Press de banca')
    expect(res.body.secciones[0].descansoEntreSecciones).toBe(300)
    expect(res.body.secciones[0].rondasCompletadas).toBeNull()
    expect(res.body.secciones[0].tiempoTotalReal).toBeNull()
  })

  it('devuelve 403 si el entrenamiento es de otro usuario', async () => {
    const trainer = await registrarUsuario('Trainer', 'trainer@test.com', 'ENTRENADOR')
    const athlete = await registrarUsuario('Athlete', 'athlete@test.com')
    const otro = await registrarUsuario('Otro', 'otro@test.com')
    const entrenamiento = await construirEntrenamiento(trainer, athlete)

    const res = await request(app).get(`/entrenamientos/${entrenamiento.id}`).set(autenticar(otro))
    expect(res.status).toBe(403)
  })

  it('devuelve 404 si no existe', async () => {
    const u = await registrarUsuario()
    const res = await request(app).get('/entrenamientos/inexistente').set(autenticar(u))
    expect(res.status).toBe(404)
  })
})

describe('POST /entrenamientos/asignar', () => {
  it('asigna una plantilla a un usuario', async () => {
    const trainer = await registrarUsuario('Trainer', 'trainer@test.com', 'ENTRENADOR')
    const athlete = await registrarUsuario('Athlete', 'athlete@test.com')
    const entrenamiento = await construirEntrenamiento(trainer, athlete)
    expect(entrenamiento.asignadoPorId).toBe(trainer.userId)
    expect(entrenamiento.usuarioId).toBe(athlete.userId)
    expect(entrenamiento.completado).toBe(false)
  })

  it('valida campos obligatorios', async () => {
    const trainer = await registrarUsuario('Trainer', 'trainer@test.com', 'ENTRENADOR')
    const athlete = await registrarUsuario('Athlete', 'athlete@test.com')
    const casos = [
      { usuarioId: athlete.userId, fecha: '2026-08-04' },
      { plantillaId: 'x', fecha: '2026-08-04' },
      { plantillaId: 'x', usuarioId: athlete.userId },
    ]
    for (const body of casos) {
      const res = await request(app).post('/entrenamientos/asignar').set(autenticar(trainer)).send(body)
      expect(res.status).toBe(400)
    }
  })

  it('devuelve 404 si la plantilla no existe', async () => {
    const trainer = await registrarUsuario('Trainer', 'trainer@test.com', 'ENTRENADOR')
    const athlete = await registrarUsuario('Athlete', 'athlete@test.com')
    const res = await request(app)
      .post('/entrenamientos/asignar')
      .set(autenticar(trainer))
      .send({ plantillaId: 'inexistente', usuarioId: athlete.userId, fecha: '2026-08-04' })
    expect(res.status).toBe(404)
  })

  it('devuelve 403 si el atleta no está vinculado activamente', async () => {
    const trainer = await registrarUsuario('Trainer', 'trainer@test.com', 'ENTRENADOR')
    const athlete = await registrarUsuario('Athlete', 'athlete@test.com')
    const plantilla = await request(app).post('/plantillas-plan').set(autenticar(trainer)).send({ nombre: 'Plan' })

    const res = await request(app)
      .post('/entrenamientos/asignar')
      .set(autenticar(trainer))
      .send({ plantillaId: plantilla.body.id, usuarioId: athlete.userId, fecha: '2026-08-04' })
    expect(res.status).toBe(403)
  })

  it('devuelve 403 si quien asigna no es entrenador', async () => {
    const atletaA = await registrarUsuario('Atleta A', 'a@test.com')
    const atletaB = await registrarUsuario('Atleta B', 'b@test.com')
    const plantilla = await request(app).post('/plantillas-plan').set(autenticar(atletaA)).send({ nombre: 'Plan' })

    const res = await request(app)
      .post('/entrenamientos/asignar')
      .set(autenticar(atletaA))
      .send({ plantillaId: plantilla.body.id, usuarioId: atletaB.userId, fecha: '2026-08-04' })
    expect(res.status).toBe(403)
  })
})

describe('POST /entrenamientos/:id/completar', () => {
  it('marca como completado el entrenado', async () => {
    const trainer = await registrarUsuario('Trainer', 'trainer@test.com', 'ENTRENADOR')
    const athlete = await registrarUsuario('Athlete', 'athlete@test.com')
    const entrenamiento = await construirEntrenamiento(trainer, athlete)

    const res = await request(app).post(`/entrenamientos/${entrenamiento.id}/completar`).set(autenticar(athlete))
    expect(res.status).toBe(200)
    expect(res.body.completado).toBe(true)
    expect(res.body.completadoEn).toBeTruthy()
  })

  it('guarda el comentario del atleta al completar', async () => {
    const trainer = await registrarUsuario('Trainer', 'trainer@test.com', 'ENTRENADOR')
    const athlete = await registrarUsuario('Athlete', 'athlete@test.com')
    const entrenamiento = await construirEntrenamiento(trainer, athlete)

    const res = await request(app)
      .post(`/entrenamientos/${entrenamiento.id}/completar`)
      .set(autenticar(athlete))
      .send({ comentario: 'Muy buena sesión, termina fuerte.' })
    expect(res.status).toBe(200)
    expect(res.body.comentario).toBe('Muy buena sesión, termina fuerte.')

    const detalle = await request(app).get(`/entrenamientos/${entrenamiento.id}`).set(autenticar(trainer))
    expect(detalle.body.comentario).toBe('Muy buena sesión, termina fuerte.')
  })

  it('devuelve 403 si no es el entrenado', async () => {
    const trainer = await registrarUsuario('Trainer', 'trainer@test.com', 'ENTRENADOR')
    const athlete = await registrarUsuario('Athlete', 'athlete@test.com')
    const entrenamiento = await construirEntrenamiento(trainer, athlete)

    const res = await request(app).post(`/entrenamientos/${entrenamiento.id}/completar`).set(autenticar(trainer))
    expect(res.status).toBe(403)
  })

  it('devuelve 404 si no existe', async () => {
    const u = await registrarUsuario()
    const res = await request(app).post('/entrenamientos/inexistente/completar').set(autenticar(u))
    expect(res.status).toBe(404)
  })
})

describe('Registros de ejercicios', () => {
  it('crea y actualiza un registro de ejercicio', async () => {
    const trainer = await registrarUsuario('Trainer', 'trainer@test.com', 'ENTRENADOR')
    const athlete = await registrarUsuario('Athlete', 'athlete@test.com')
    const entrenamiento = await construirEntrenamiento(trainer, athlete)
    const ejercicioEntrenamientoId = entrenamiento.secciones[0].ejercicios[0].id

    const crear = await request(app)
      .post(`/entrenamientos/ejercicios/${ejercicioEntrenamientoId}/log`)
      .set(autenticar(athlete))
      .send({ completado: true, repeticionesReales: 10, pesoReal: 60, comentario: 'Fue duro' })
    expect(crear.status).toBe(201)
    expect(crear.body.completado).toBe(true)
    expect(crear.body.completadoEn).toBeTruthy()

    const actualizar = await request(app)
      .put(`/entrenamientos/logs/${crear.body.id}`)
      .set(autenticar(athlete))
      .send({ repeticionesReales: 12, comentario: 'Mejor' })
    expect(actualizar.status).toBe(200)
    expect(actualizar.body.repeticionesReales).toBe(12)
    expect(actualizar.body.comentario).toBe('Mejor')
  })
})
