import { describe, it, expect } from 'vitest'
import request from 'supertest'
import { app } from '../src/index.js'
import { registrarUsuario, autenticar } from './helpers/registrar.js'
import type { UsuarioRegistrado } from './helpers/registrar.js'

const vincular = async (trainer: UsuarioRegistrado, athlete: UsuarioRegistrado) => {
  const res = await request(app).post('/vinculaciones').set(autenticar(trainer)).send({ correo: athlete.correo })
  expect(res.status).toBe(201)
  await request(app).patch(`/vinculaciones/${res.body.id}/aceptar`).set(autenticar(athlete))
}

const asignarRutina = async (trainer: UsuarioRegistrado, athlete: UsuarioRegistrado) => {
  const plantilla = await request(app).post('/plantillas-plan').set(autenticar(trainer)).send({ nombre: 'Plan' })
  const res = await request(app)
    .post('/entrenamientos/asignar')
    .set(autenticar(trainer))
    .send({ plantillaId: plantilla.body.id, usuarioId: athlete.userId, fecha: '2026-08-04' })
  expect(res.status).toBe(201)
  return res.body
}

describe('GET /entrenados', () => {
  it('lista los atletas vinculados con objetivo, días, rutinas pendientes y último entrenamiento', async () => {
    const trainer = await registrarUsuario('Trainer', 'trainer@test.com', 'ENTRENADOR')
    const athlete = await registrarUsuario('Athlete', 'athlete@test.com')
    const otro = await registrarUsuario('Otro', 'otro@test.com')
    await vincular(trainer, athlete)
    await vincular(trainer, otro)

    const res = await request(app).get('/entrenados').set(autenticar(trainer))
    expect(res.status).toBe(200)
    expect(res.body.datos).toHaveLength(2)
    expect(res.body.total).toBe(2)
    const fila = res.body.datos.find((d: { atleta: { id: string } }) => d.atleta.id === athlete.userId)
    expect(fila.objetivoPrincipal).toBeNull()
    expect(fila.diasPorSemana).toBeNull()
    expect(fila.rutinasPendientes).toBe(0)
    expect(fila.ultimoEntrenamiento).toBeNull()
  })

  it('cuenta rutinas pendientes asignadas por mí y el último entrenamiento completado', async () => {
    const trainer = await registrarUsuario('Trainer', 'trainer@test.com', 'ENTRENADOR')
    const athlete = await registrarUsuario('Athlete', 'athlete@test.com')
    await vincular(trainer, athlete)
    const entrenamiento = await asignarRutina(trainer, athlete)

    const pendiente = await request(app).get('/entrenados').set(autenticar(trainer))
    const filaPendiente = pendiente.body.datos[0]
    expect(filaPendiente.rutinasPendientes).toBe(1)
    expect(filaPendiente.ultimoEntrenamiento).toBeNull()

    await request(app).post(`/entrenamientos/${entrenamiento.id}/completar`).set(autenticar(athlete))
    const completado = await request(app).get('/entrenados').set(autenticar(trainer))
    const filaCompletado = completado.body.datos[0]
    expect(filaCompletado.rutinasPendientes).toBe(0)
    expect(filaCompletado.ultimoEntrenamiento).toBeTruthy()
  })

  it('no cuenta las rutinas de otro entrenador como pendientes', async () => {
    const t1 = await registrarUsuario('T1', 't1@test.com', 'ENTRENADOR')
    const t2 = await registrarUsuario('T2', 't2@test.com', 'ENTRENADOR')
    const athlete = await registrarUsuario('Athlete', 'athlete@test.com')
    await vincular(t1, athlete)
    await vincular(t2, athlete)

    await asignarRutina(t2, athlete)

    const res = await request(app).get('/entrenados').set(autenticar(t1))
    expect(res.body.datos[0].rutinasPendientes).toBe(0)
  })

  it('filtra por nombre, estado y rutinas pendientes', async () => {
    const trainer = await registrarUsuario('Trainer', 'trainer@test.com', 'ENTRENADOR')
    const a1 = await registrarUsuario('Lucía', 'lucia@test.com')
    const a2 = await registrarUsuario('Martín', 'martin@test.com')
    await vincular(trainer, a1)
    await vincular(trainer, a2)
    await asignarRutina(trainer, a1)

    const porNombre = await request(app).get('/entrenados?busqueda=luc').set(autenticar(trainer))
    expect(porNombre.body.total).toBe(1)
    expect(porNombre.body.datos[0].atleta.nombre).toBe('Lucía')

    const porEstado = await request(app).get('/entrenados?estado=Pendiente').set(autenticar(trainer))
    expect(porEstado.body.total).toBe(0)

    const conPendientes = await request(app).get('/entrenados?tienePendientes=true').set(autenticar(trainer))
    expect(conPendientes.body.total).toBe(1)
    expect(conPendientes.body.datos[0].atleta.id).toBe(a1.userId)
  })

  it('pagina de a 8 atletas', async () => {
    const trainer = await registrarUsuario('Trainer', 'trainer@test.com', 'ENTRENADOR')
    for (let i = 0; i < 9; i++) {
      const athlete = await registrarUsuario(`Atleta ${i}`, `atleta${i}@test.com`)
      await vincular(trainer, athlete)
    }

    const p1 = await request(app).get('/entrenados?pagina=1').set(autenticar(trainer))
    expect(p1.body.datos).toHaveLength(8)
    expect(p1.body.total).toBe(9)
    expect(p1.body.pagina).toBe(1)

    const p2 = await request(app).get('/entrenados?pagina=2').set(autenticar(trainer))
    expect(p2.body.datos).toHaveLength(1)
  })

  it('devuelve 403 si quien consulta no es entrenador', async () => {
    const athlete = await registrarUsuario('Athlete', 'athlete@test.com')
    const res = await request(app).get('/entrenados').set(autenticar(athlete))
    expect(res.status).toBe(403)
  })
})

describe('PUT /entrenados/:atletaId/perfil', () => {
  it('el entrenador vinculado guarda objetivo, días y descripción', async () => {
    const trainer = await registrarUsuario('Trainer', 'trainer@test.com', 'ENTRENADOR')
    const athlete = await registrarUsuario('Athlete', 'athlete@test.com')
    await vincular(trainer, athlete)

    const res = await request(app)
      .put(`/entrenados/${athlete.userId}/perfil`)
      .set(autenticar(trainer))
      .send({ objetivoPrincipal: 'Hipertrofia', diasPorSemana: 4, descripcion: 'Ganar masa muscular' })
    expect(res.status).toBe(200)

    const listado = await request(app).get('/entrenados').set(autenticar(trainer))
    const fila = listado.body.datos[0]
    expect(fila.objetivoPrincipal).toBe('Hipertrofia')
    expect(fila.diasPorSemana).toBe(4)
    expect(fila.descripcion).toBe('Ganar masa muscular')
  })

  it('devuelve 400 con objetivo inválido o días fuera de rango', async () => {
    const trainer = await registrarUsuario('Trainer', 'trainer@test.com', 'ENTRENADOR')
    const athlete = await registrarUsuario('Athlete', 'athlete@test.com')
    await vincular(trainer, athlete)

    const malObjetivo = await request(app)
      .put(`/entrenados/${athlete.userId}/perfil`)
      .set(autenticar(trainer))
      .send({ objetivoPrincipal: 'Magia' })
    expect(malObjetivo.status).toBe(400)

    const malDias = await request(app)
      .put(`/entrenados/${athlete.userId}/perfil`)
      .set(autenticar(trainer))
      .send({ diasPorSemana: 9 })
    expect(malDias.status).toBe(400)
  })

  it('devuelve 403 si el entrenador no está vinculado activamente', async () => {
    const t1 = await registrarUsuario('T1', 't1@test.com', 'ENTRENADOR')
    const t2 = await registrarUsuario('T2', 't2@test.com', 'ENTRENADOR')
    const athlete = await registrarUsuario('Athlete', 'athlete@test.com')
    await vincular(t1, athlete)

    const res = await request(app)
      .put(`/entrenados/${athlete.userId}/perfil`)
      .set(autenticar(t2))
      .send({ objetivoPrincipal: 'Fuerza' })
    expect(res.status).toBe(403)
  })
})
