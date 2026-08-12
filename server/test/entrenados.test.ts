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

describe('GET /entrenados/:atletaId', () => {
  it('devuelve el perfil completo con vinculado desde, objetivo, días y descripción', async () => {
    const trainer = await registrarUsuario('Trainer', 'trainer@test.com', 'ENTRENADOR')
    const athlete = await registrarUsuario('Athlete', 'athlete@test.com')
    await vincular(trainer, athlete)
    await request(app)
      .put(`/entrenados/${athlete.userId}/perfil`)
      .set(autenticar(trainer))
      .send({ objetivoPrincipal: 'Hipertrofia', diasPorSemana: 4, descripcion: 'Ganar masa muscular' })

    const res = await request(app).get(`/entrenados/${athlete.userId}`).set(autenticar(trainer))
    expect(res.status).toBe(200)
    expect(res.body.estado).toBe('Activo')
    expect(res.body.vinculadoDesde).toBeTruthy()
    expect(res.body.objetivoPrincipal).toBe('Hipertrofia')
    expect(res.body.diasPorSemana).toBe(4)
    expect(res.body.descripcion).toBe('Ganar masa muscular')
    expect(res.body.rutinasPendientes).toBe(0)
    expect(res.body.ultimoEntrenamiento).toBeNull()
  })

  it('actualiza rutinas pendientes y último entrenamiento', async () => {
    const trainer = await registrarUsuario('Trainer', 'trainer@test.com', 'ENTRENADOR')
    const athlete = await registrarUsuario('Athlete', 'athlete@test.com')
    await vincular(trainer, athlete)
    const entrenamiento = await asignarRutina(trainer, athlete)

    const pendiente = await request(app).get(`/entrenados/${athlete.userId}`).set(autenticar(trainer))
    expect(pendiente.body.rutinasPendientes).toBe(1)
    expect(pendiente.body.ultimoEntrenamiento).toBeNull()

    await request(app).post(`/entrenamientos/${entrenamiento.id}/completar`).set(autenticar(athlete))
    const completado = await request(app).get(`/entrenados/${athlete.userId}`).set(autenticar(trainer))
    expect(completado.body.rutinasPendientes).toBe(0)
    expect(completado.body.ultimoEntrenamiento).toBeTruthy()
  })

  it('devuelve 404 si el atleta no está vinculado a ese entrenador', async () => {
    const t1 = await registrarUsuario('T1', 't1@test.com', 'ENTRENADOR')
    const t2 = await registrarUsuario('T2', 't2@test.com', 'ENTRENADOR')
    const athlete = await registrarUsuario('Athlete', 'athlete@test.com')
    await vincular(t1, athlete)

    const res = await request(app).get(`/entrenados/${athlete.userId}`).set(autenticar(t2))
    expect(res.status).toBe(404)
  })

  it('devuelve 403 si quien consulta no es entrenador', async () => {
    const athlete = await registrarUsuario('Athlete', 'athlete@test.com')
    const res = await request(app).get(`/entrenados/${athlete.userId}`).set(autenticar(athlete))
    expect(res.status).toBe(403)
  })
})

describe('GET /entrenados/:atletaId/entrenamientos', () => {
  it('lista rutinas completadas con fecha, nombre y comentario, del más reciente al más lejano', async () => {
    const trainer = await registrarUsuario('Trainer', 'trainer@test.com', 'ENTRENADOR')
    const athlete = await registrarUsuario('Athlete', 'athlete@test.com')
    await vincular(trainer, athlete)

    const p1 = await request(app).post('/plantillas-plan').set(autenticar(trainer)).send({ nombre: 'Fuerza' })
    const p2 = await request(app).post('/plantillas-plan').set(autenticar(trainer)).send({ nombre: 'Resistencia' })
    const e1 = await request(app)
      .post('/entrenamientos/asignar')
      .set(autenticar(trainer))
      .send({ plantillaId: p1.body.id, usuarioId: athlete.userId, fecha: '2026-08-04' })
    const e2 = await request(app)
      .post('/entrenamientos/asignar')
      .set(autenticar(trainer))
      .send({ plantillaId: p2.body.id, usuarioId: athlete.userId, fecha: '2026-08-06' })

    await request(app)
      .post(`/entrenamientos/${e1.body.id}/completar`)
      .set(autenticar(athlete))
      .send({ comentario: 'Muy buena sesión.' })
    await request(app).post(`/entrenamientos/${e2.body.id}/completar`).set(autenticar(athlete))

    const res = await request(app).get(`/entrenados/${athlete.userId}/entrenamientos`).set(autenticar(trainer))
    expect(res.status).toBe(200)
    expect(res.body.total).toBe(2)
    expect(res.body.limite).toBe(15)
    expect(res.body.datos).toHaveLength(2)
    expect(res.body.datos[0].completadoEn > res.body.datos[1].completadoEn).toBe(true)
    const conComentario = res.body.datos.find((d: { id: string }) => d.id === e1.body.id)
    expect(conComentario.nombreRutina).toBe('Fuerza')
    expect(conComentario.comentario).toBe('Muy buena sesión.')
    const sinComentario = res.body.datos.find((d: { id: string }) => d.id === e2.body.id)
    expect(sinComentario.nombreRutina).toBe('Resistencia')
    expect(sinComentario.comentario).toBeNull()
  })

  it('solo incluye rutinas completadas asignadas por mí', async () => {
    const t1 = await registrarUsuario('T1', 't1@test.com', 'ENTRENADOR')
    const t2 = await registrarUsuario('T2', 't2@test.com', 'ENTRENADOR')
    const athlete = await registrarUsuario('Athlete', 'athlete@test.com')
    await vincular(t1, athlete)
    await vincular(t2, athlete)

    await asignarRutina(t1, athlete)
    const deOtro = await asignarRutina(t2, athlete)
    await request(app).post(`/entrenamientos/${deOtro.id}/completar`).set(autenticar(athlete))

    const res = await request(app).get(`/entrenados/${athlete.userId}/entrenamientos`).set(autenticar(t1))
    expect(res.status).toBe(200)
    expect(res.body.total).toBe(0)

    const delOtro = await request(app).get(`/entrenados/${athlete.userId}/entrenamientos`).set(autenticar(t2))
    expect(delOtro.body.total).toBe(1)
  })

  it('pagina de a 15 rutinas', async () => {
    const trainer = await registrarUsuario('Trainer', 'trainer@test.com', 'ENTRENADOR')
    const athlete = await registrarUsuario('Athlete', 'athlete@test.com')
    await vincular(trainer, athlete)

    const plantillas = []
    for (let i = 0; i < 16; i++) {
      const p = await request(app).post('/plantillas-plan').set(autenticar(trainer)).send({ nombre: `Plan ${i}` })
      const e = await request(app)
        .post('/entrenamientos/asignar')
        .set(autenticar(trainer))
        .send({ plantillaId: p.body.id, usuarioId: athlete.userId, fecha: `2026-08-${String((i % 28) + 1).padStart(2, '0')}` })
      await request(app).post(`/entrenamientos/${e.body.id}/completar`).set(autenticar(athlete))
      plantillas.push(p.body)
    }

    const p1 = await request(app).get(`/entrenados/${athlete.userId}/entrenamientos?pagina=1`).set(autenticar(trainer))
    expect(p1.body.datos).toHaveLength(15)
    expect(p1.body.total).toBe(16)
    expect(p1.body.pagina).toBe(1)

    const p2 = await request(app).get(`/entrenados/${athlete.userId}/entrenamientos?pagina=2`).set(autenticar(trainer))
    expect(p2.body.datos).toHaveLength(1)
  })

  it('devuelve 404 si el atleta no está vinculado a ese entrenador', async () => {
    const t1 = await registrarUsuario('T1', 't1@test.com', 'ENTRENADOR')
    const t2 = await registrarUsuario('T2', 't2@test.com', 'ENTRENADOR')
    const athlete = await registrarUsuario('Athlete', 'athlete@test.com')
    await vincular(t1, athlete)

    const res = await request(app).get(`/entrenados/${athlete.userId}/entrenamientos`).set(autenticar(t2))
    expect(res.status).toBe(404)
  })
})

describe('GET /entrenados/:atletaId/rutinas-pendientes', () => {
  it('lista rutinas sin completar asignadas por mí, de la más próxima a la más lejana', async () => {
    const trainer = await registrarUsuario('Trainer', 'trainer@test.com', 'ENTRENADOR')
    const athlete = await registrarUsuario('Athlete', 'athlete@test.com')
    await vincular(trainer, athlete)

    const p1 = await request(app).post('/plantillas-plan').set(autenticar(trainer)).send({ nombre: 'Empuje' })
    const p2 = await request(app).post('/plantillas-plan').set(autenticar(trainer)).send({ nombre: 'Tirón' })
    await request(app)
      .post('/entrenamientos/asignar')
      .set(autenticar(trainer))
      .send({ plantillaId: p1.body.id, usuarioId: athlete.userId, fecha: '2026-08-06' })
    await request(app)
      .post('/entrenamientos/asignar')
      .set(autenticar(trainer))
      .send({ plantillaId: p2.body.id, usuarioId: athlete.userId, fecha: '2026-08-04' })
    const completado = await request(app)
      .post('/entrenamientos/asignar')
      .set(autenticar(trainer))
      .send({ plantillaId: p1.body.id, usuarioId: athlete.userId, fecha: '2026-08-02' })
    await request(app).post(`/entrenamientos/${completado.body.id}/completar`).set(autenticar(athlete))

    const res = await request(app).get(`/entrenados/${athlete.userId}/rutinas-pendientes`).set(autenticar(trainer))
    expect(res.status).toBe(200)
    expect(res.body.total).toBe(2)
    expect(res.body.limite).toBe(15)
    expect(res.body.datos).toHaveLength(2)
    expect(res.body.datos[0].nombreRutina).toBe('Tirón')
    expect(res.body.datos[0].fecha).toBe('2026-08-04T00:00:00.000Z')
    expect(res.body.datos[1].nombreRutina).toBe('Empuje')
  })

  it('no cuenta las pendientes asignadas por otro entrenador', async () => {
    const t1 = await registrarUsuario('T1', 't1@test.com', 'ENTRENADOR')
    const t2 = await registrarUsuario('T2', 't2@test.com', 'ENTRENADOR')
    const athlete = await registrarUsuario('Athlete', 'athlete@test.com')
    await vincular(t1, athlete)
    await vincular(t2, athlete)

    await asignarRutina(t2, athlete)

    const res = await request(app).get(`/entrenados/${athlete.userId}/rutinas-pendientes`).set(autenticar(t1))
    expect(res.body.total).toBe(0)
  })

  it('devuelve 404 si el atleta no está vinculado a ese entrenador', async () => {
    const t1 = await registrarUsuario('T1', 't1@test.com', 'ENTRENADOR')
    const t2 = await registrarUsuario('T2', 't2@test.com', 'ENTRENADOR')
    const athlete = await registrarUsuario('Athlete', 'athlete@test.com')
    await vincular(t1, athlete)

    const res = await request(app).get(`/entrenados/${athlete.userId}/rutinas-pendientes`).set(autenticar(t2))
    expect(res.status).toBe(404)
  })
})

describe('PUT /entrenados/:atletaId/notas', () => {
  it('el entrenador vinculado guarda notas y el perfil las devuelve', async () => {
    const trainer = await registrarUsuario('Trainer', 'trainer@test.com', 'ENTRENADOR')
    const athlete = await registrarUsuario('Athlete', 'athlete@test.com')
    await vincular(trainer, athlete)

    const res = await request(app)
      .put(`/entrenados/${athlete.userId}/notas`)
      .set(autenticar(trainer))
      .send({ notas: 'Busca ganar fuerza en sentadilla.' })
    expect(res.status).toBe(200)

    const perfil = await request(app).get(`/entrenados/${athlete.userId}`).set(autenticar(trainer))
    expect(perfil.body.notasEntrenador).toBe('Busca ganar fuerza en sentadilla.')
  })

  it('sobreescribe las notas y las vacía con un texto en blanco', async () => {
    const trainer = await registrarUsuario('Trainer', 'trainer@test.com', 'ENTRENADOR')
    const athlete = await registrarUsuario('Athlete', 'athlete@test.com')
    await vincular(trainer, athlete)
    await request(app)
      .put(`/entrenados/${athlete.userId}/notas`)
      .set(autenticar(trainer))
      .send({ notas: 'Primera versión' })

    await request(app)
      .put(`/entrenados/${athlete.userId}/notas`)
      .set(autenticar(trainer))
      .send({ notas: 'Nueva versión' })
    const editada = await request(app).get(`/entrenados/${athlete.userId}`).set(autenticar(trainer))
    expect(editada.body.notasEntrenador).toBe('Nueva versión')

    await request(app)
      .put(`/entrenados/${athlete.userId}/notas`)
      .set(autenticar(trainer))
      .send({ notas: '   ' })
    const vaciada = await request(app).get(`/entrenados/${athlete.userId}`).set(autenticar(trainer))
    expect(vaciada.body.notasEntrenador).toBeNull()
  })

  it('cada entrenador tiene sus propias notas', async () => {
    const t1 = await registrarUsuario('T1', 't1@test.com', 'ENTRENADOR')
    const t2 = await registrarUsuario('T2', 't2@test.com', 'ENTRENADOR')
    const athlete = await registrarUsuario('Athlete', 'athlete@test.com')
    await vincular(t1, athlete)
    await vincular(t2, athlete)

    await request(app)
      .put(`/entrenados/${athlete.userId}/notas`)
      .set(autenticar(t1))
      .send({ notas: 'Notas de T1' })
    await request(app)
      .put(`/entrenados/${athlete.userId}/notas`)
      .set(autenticar(t2))
      .send({ notas: 'Notas de T2' })

    const p1 = await request(app).get(`/entrenados/${athlete.userId}`).set(autenticar(t1))
    expect(p1.body.notasEntrenador).toBe('Notas de T1')
    const p2 = await request(app).get(`/entrenados/${athlete.userId}`).set(autenticar(t2))
    expect(p2.body.notasEntrenador).toBe('Notas de T2')
  })

  it('devuelve 400 si las notas superan los 2000 caracteres', async () => {
    const trainer = await registrarUsuario('Trainer', 'trainer@test.com', 'ENTRENADOR')
    const athlete = await registrarUsuario('Athlete', 'athlete@test.com')
    await vincular(trainer, athlete)

    const res = await request(app)
      .put(`/entrenados/${athlete.userId}/notas`)
      .set(autenticar(trainer))
      .send({ notas: 'a'.repeat(2001) })
    expect(res.status).toBe(400)
  })

  it('devuelve 403 si el entrenador no está vinculado activamente', async () => {
    const t1 = await registrarUsuario('T1', 't1@test.com', 'ENTRENADOR')
    const t2 = await registrarUsuario('T2', 't2@test.com', 'ENTRENADOR')
    const athlete = await registrarUsuario('Athlete', 'athlete@test.com')
    await vincular(t1, athlete)

    const res = await request(app)
      .put(`/entrenados/${athlete.userId}/notas`)
      .set(autenticar(t2))
      .send({ notas: 'Sin acceso' })
    expect(res.status).toBe(403)
  })

  it('devuelve 403 si quien guarda no es entrenador', async () => {
    const athlete = await registrarUsuario('Athlete', 'athlete@test.com')
    const res = await request(app)
      .put(`/entrenados/${athlete.userId}/notas`)
      .set(autenticar(athlete))
      .send({ notas: 'Hola' })
    expect(res.status).toBe(403)
  })
})
