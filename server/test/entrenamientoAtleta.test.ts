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

const asignarPlantilla = async (trainer: UsuarioRegistrado, athlete: UsuarioRegistrado, fecha: string) => {
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
    .send({ plantillaId, usuarioId: athlete.userId, fecha })
  expect(asignado.status).toBe(201)
  return asignado.body
}

const construirEntrenamiento = async (trainer: UsuarioRegistrado, athlete: UsuarioRegistrado, fecha = '2026-08-04T00:00:00.000Z') => {
  await vincular(trainer, athlete)
  return asignarPlantilla(trainer, athlete, fecha)
}

describe('GET /entrenamientos/mios', () => {
  it('lista las rutinas del atleta con paginación y filtro', async () => {
    const trainer = await registrarUsuario('Trainer', 'trainer@test.com', 'ENTRENADOR')
    const athlete = await registrarUsuario('Athlete', 'athlete@test.com')
    const entrenamiento = await construirEntrenamiento(trainer, athlete)

    const pendientes = await request(app)
      .get('/entrenamientos/mios?completado=false')
      .set(autenticar(athlete))
    expect(pendientes.status).toBe(200)
    expect(pendientes.body.datos).toHaveLength(1)
    expect(pendientes.body.total).toBe(1)
    expect(pendientes.body.datos[0].id).toBe(entrenamiento.id)
    expect(pendientes.body.datos[0].nombreRutina).toBe('Plan Semanal')
    expect(pendientes.body.datos[0].asignadoPor.nombre).toBe('Trainer')

    const realizadas = await request(app)
      .get('/entrenamientos/mios?completado=true')
      .set(autenticar(athlete))
    expect(realizadas.status).toBe(200)
    expect(realizadas.body.total).toBe(0)
  })

  it('filtra por rango de fechas', async () => {
    const trainer = await registrarUsuario('Trainer', 'trainer@test.com', 'ENTRENADOR')
    const athlete = await registrarUsuario('Athlete', 'athlete@test.com')
    await vincular(trainer, athlete)
    await asignarPlantilla(trainer, athlete, '2026-08-04T00:00:00.000Z')
    await asignarPlantilla(trainer, athlete, '2026-09-10T00:00:00.000Z')

    const res = await request(app)
      .get('/entrenamientos/mios?desde=2026-09-01T00:00:00.000Z&hasta=2026-09-30T00:00:00.000Z')
      .set(autenticar(athlete))
    expect(res.status).toBe(200)
    expect(res.body.total).toBe(1)
    expect(res.body.datos[0].fecha).toContain('2026-09-10')
  })

  it('devuelve 400 si desde es posterior a hasta', async () => {
    const athlete = await registrarUsuario('Athlete', 'athlete@test.com')
    const res = await request(app)
      .get('/entrenamientos/mios?desde=2026-09-01&hasta=2026-08-01')
      .set(autenticar(athlete))
    expect(res.status).toBe(400)
  })
})

describe('Completar con doble envío', () => {
  it('devuelve 409 si el entrenamiento ya está completado', async () => {
    const trainer = await registrarUsuario('Trainer', 'trainer@test.com', 'ENTRENADOR')
    const athlete = await registrarUsuario('Athlete', 'athlete@test.com')
    const entrenamiento = await construirEntrenamiento(trainer, athlete)

    const primero = await request(app).post(`/entrenamientos/${entrenamiento.id}/completar`).set(autenticar(athlete))
    expect(primero.status).toBe(200)

    const segundo = await request(app).post(`/entrenamientos/${entrenamiento.id}/completar`).set(autenticar(athlete))
    expect(segundo.status).toBe(409)
  })
})

describe('Registros de ejercicios: permisos', () => {
  it('devuelve 403 si un atleta loguea en un entrenamiento ajeno', async () => {
    const trainer = await registrarUsuario('Trainer', 'trainer@test.com', 'ENTRENADOR')
    const athlete = await registrarUsuario('Athlete', 'athlete@test.com')
    const otro = await registrarUsuario('Otro', 'otro@test.com')
    const entrenamiento = await construirEntrenamiento(trainer, athlete)
    const ejercicioEntrenamientoId = entrenamiento.secciones[0].ejercicios[0].id

    const res = await request(app)
      .post(`/entrenamientos/ejercicios/${ejercicioEntrenamientoId}/log`)
      .set(autenticar(otro))
      .send({ completado: true, repeticionesReales: 10 })
    expect(res.status).toBe(403)
  })

  it('devuelve 404 si el ejercicio de entrenamiento no existe', async () => {
    const athlete = await registrarUsuario('Athlete', 'athlete@test.com')
    const res = await request(app)
      .post('/entrenamientos/ejercicios/inexistente/log')
      .set(autenticar(athlete))
      .send({ completado: true })
    expect(res.status).toBe(404)
  })

  it('devuelve 409 si el entrenamiento ya está completado', async () => {
    const trainer = await registrarUsuario('Trainer', 'trainer@test.com', 'ENTRENADOR')
    const athlete = await registrarUsuario('Athlete', 'athlete@test.com')
    const entrenamiento = await construirEntrenamiento(trainer, athlete)
    const ejercicioEntrenamientoId = entrenamiento.secciones[0].ejercicios[0].id

    await request(app).post(`/entrenamientos/${entrenamiento.id}/completar`).set(autenticar(athlete))

    const res = await request(app)
      .post(`/entrenamientos/ejercicios/${ejercicioEntrenamientoId}/log`)
      .set(autenticar(athlete))
      .send({ completado: true })
    expect(res.status).toBe(409)
  })

  it('devuelve 403 si otro usuario actualiza un registro ajeno', async () => {
    const trainer = await registrarUsuario('Trainer', 'trainer@test.com', 'ENTRENADOR')
    const athlete = await registrarUsuario('Athlete', 'athlete@test.com')
    const otro = await registrarUsuario('Otro', 'otro@test.com')
    const entrenamiento = await construirEntrenamiento(trainer, athlete)
    const ejercicioEntrenamientoId = entrenamiento.secciones[0].ejercicios[0].id

    const crear = await request(app)
      .post(`/entrenamientos/ejercicios/${ejercicioEntrenamientoId}/log`)
      .set(autenticar(athlete))
      .send({ completado: true, repeticionesReales: 10 })
    expect(crear.status).toBe(201)

    const res = await request(app)
      .put(`/entrenamientos/logs/${crear.body.id}`)
      .set(autenticar(otro))
      .send({ repeticionesReales: 12 })
    expect(res.status).toBe(403)
  })

  it('permite limpiar un campo enviando null', async () => {
    const trainer = await registrarUsuario('Trainer', 'trainer@test.com', 'ENTRENADOR')
    const athlete = await registrarUsuario('Athlete', 'athlete@test.com')
    const entrenamiento = await construirEntrenamiento(trainer, athlete)
    const ejercicioEntrenamientoId = entrenamiento.secciones[0].ejercicios[0].id

    const crear = await request(app)
      .post(`/entrenamientos/ejercicios/${ejercicioEntrenamientoId}/log`)
      .set(autenticar(athlete))
      .send({ repeticionesReales: 10, pesoReal: 60 })
    expect(crear.status).toBe(201)

    const limpiar = await request(app)
      .put(`/entrenamientos/logs/${crear.body.id}`)
      .set(autenticar(athlete))
      .send({ repeticionesReales: null })
    expect(limpiar.status).toBe(200)
    expect(limpiar.body.repeticionesReales).toBeNull()
    expect(limpiar.body.pesoReal).toBe(60)
  })
})
