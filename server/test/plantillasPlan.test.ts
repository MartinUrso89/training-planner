import { describe, it, expect } from 'vitest'
import request from 'supertest'
import { app } from '../src/index.js'
import { registrarUsuario, autenticar } from './helpers/registrar.js'
import type { UsuarioRegistrado } from './helpers/registrar.js'

const crearPlantilla = async (u: UsuarioRegistrado, nombre = 'Plan Push') => {
  const res = await request(app).post('/plantillas-plan').set(autenticar(u)).send({ nombre })
  expect(res.status).toBe(201)
  return res.body as { id: string }
}

describe('CRUD de plantillas', () => {
  it('crea y lista plantillas del usuario', async () => {
    const u = await registrarUsuario()
    const creada = await crearPlantilla(u)
    const lista = await request(app).get('/plantillas-plan').set(autenticar(u))
    expect(lista.status).toBe(200)
    expect(lista.body).toHaveLength(1)
    expect(lista.body[0].id).toBe(creada.id)
    expect(lista.body[0].usuarioId).toBe(u.userId)
  })

  it('valida el nombre obligatorio', async () => {
    const u = await registrarUsuario()
    const res = await request(app).post('/plantillas-plan').set(autenticar(u)).send({})
    expect(res.status).toBe(400)
  })

  it('obtiene una plantilla por id', async () => {
    const u = await registrarUsuario()
    const creada = await crearPlantilla(u)
    const res = await request(app).get(`/plantillas-plan/${creada.id}`).set(autenticar(u))
    expect(res.status).toBe(200)
    expect(res.body.nombre).toBe('Plan Push')
  })

  it('devuelve 404 si la plantilla no existe', async () => {
    const u = await registrarUsuario()
    const res = await request(app).get('/plantillas-plan/inexistente').set(autenticar(u))
    expect(res.status).toBe(404)
  })

  it('devuelve 403 si la plantilla es de otro usuario', async () => {
    const u1 = await registrarUsuario('Uno', 'uno@test.com')
    const u2 = await registrarUsuario('Dos', 'dos@test.com')
    const creada = await crearPlantilla(u1)
    const res = await request(app).get(`/plantillas-plan/${creada.id}`).set(autenticar(u2))
    expect(res.status).toBe(403)
  })

  it('elimina una plantilla propia', async () => {
    const u = await registrarUsuario()
    const creada = await crearPlantilla(u)
    const del = await request(app).delete(`/plantillas-plan/${creada.id}`).set(autenticar(u))
    expect(del.status).toBe(204)
    const get = await request(app).get(`/plantillas-plan/${creada.id}`).set(autenticar(u))
    expect(get.status).toBe(404)
  })

  it('devuelve 403 al eliminar una plantilla ajena', async () => {
    const u1 = await registrarUsuario('Uno', 'uno@test.com')
    const u2 = await registrarUsuario('Dos', 'dos@test.com')
    const creada = await crearPlantilla(u1)
    const res = await request(app).delete(`/plantillas-plan/${creada.id}`).set(autenticar(u2))
    expect(res.status).toBe(403)
  })

  it('devuelve 404 al eliminar una plantilla inexistente', async () => {
    const u = await registrarUsuario()
    const res = await request(app).delete('/plantillas-plan/inexistente').set(autenticar(u))
    expect(res.status).toBe(404)
  })
})

describe('Secciones de plantilla', () => {
  it('agrega y elimina una sección', async () => {
    const u = await registrarUsuario()
    const plantilla = await crearPlantilla(u)
    const crear = await request(app)
      .post(`/plantillas-plan/${plantilla.id}/secciones`)
      .set(autenticar(u))
      .send({ tipoSeccionId: 'normal', nombre: 'Fuerza', orden: 1 })
    expect(crear.status).toBe(201)
    expect(crear.body.tipoSeccionId).toBe('normal')

    const del = await request(app).delete(`/plantillas-plan/${plantilla.id}/secciones/${crear.body.id}`).set(autenticar(u))
    expect(del.status).toBe(204)
  })

  it('devuelve 404 si la plantilla no existe', async () => {
    const u = await registrarUsuario()
    const res = await request(app)
      .post('/plantillas-plan/inexistente/secciones')
      .set(autenticar(u))
      .send({ tipoSeccionId: 'normal', orden: 1 })
    expect(res.status).toBe(404)
  })

  it('devuelve 403 al modificar una plantilla ajena', async () => {
    const u1 = await registrarUsuario('Uno', 'uno@test.com')
    const u2 = await registrarUsuario('Dos', 'dos@test.com')
    const plantilla = await crearPlantilla(u1)
    const res = await request(app)
      .post(`/plantillas-plan/${plantilla.id}/secciones`)
      .set(autenticar(u2))
      .send({ tipoSeccionId: 'normal', orden: 1 })
    expect(res.status).toBe(403)
  })
})

describe('Ejercicios en secciones de plantilla', () => {
  it('agrega, actualiza y elimina un ejercicio de sección', async () => {
    const u = await registrarUsuario()
    const plantilla = await crearPlantilla(u)
    const seccion = await request(app)
      .post(`/plantillas-plan/${plantilla.id}/secciones`)
      .set(autenticar(u))
      .send({ tipoSeccionId: 'normal', orden: 1 })
    const ejercicio = await request(app).post('/ejercicios').set(autenticar(u)).send({
      nombre: 'Press de banca',
      musculoPrincipal: 'Pecho',
      tipoArticular: 'Poliarticular',
      patronMovimiento: 'Empuje',
    })

    const agregar = await request(app)
      .post(`/plantillas-plan/${plantilla.id}/secciones/${seccion.body.id}/ejercicios`)
      .set(autenticar(u))
      .send({ ejercicioId: ejercicio.body.id, orden: 1, series: 4, repeticiones: 8 })
    expect(agregar.status).toBe(201)
    expect(agregar.body.ejercicio.nombre).toBe('Press de banca')

    const actualizar = await request(app)
      .put(`/plantillas-plan/${plantilla.id}/secciones/${seccion.body.id}/ejercicios/${agregar.body.id}`)
      .set(autenticar(u))
      .send({ series: 5 })
    expect(actualizar.status).toBe(200)
    expect(actualizar.body.series).toBe(5)

    const eliminar = await request(app)
      .delete(`/plantillas-plan/${plantilla.id}/secciones/${seccion.body.id}/ejercicios/${agregar.body.id}`)
      .set(autenticar(u))
    expect(eliminar.status).toBe(204)
  })

  it('devuelve 403 al tocar la plantilla de otro usuario', async () => {
    const u1 = await registrarUsuario('Uno', 'uno@test.com')
    const u2 = await registrarUsuario('Dos', 'dos@test.com')
    const plantilla = await crearPlantilla(u1)
    const seccion = await request(app)
      .post(`/plantillas-plan/${plantilla.id}/secciones`)
      .set(autenticar(u1))
      .send({ tipoSeccionId: 'normal', orden: 1 })
    const res = await request(app)
      .post(`/plantillas-plan/${plantilla.id}/secciones/${seccion.body.id}/ejercicios`)
      .set(autenticar(u2))
      .send({ ejercicioId: 'cualquiera', orden: 1 })
    expect(res.status).toBe(403)
  })

  it('devuelve 404 si la plantilla no existe', async () => {
    const u = await registrarUsuario()
    const res = await request(app)
      .post('/plantillas-plan/inexistente/secciones/inexistente/ejercicios')
      .set(autenticar(u))
      .send({ ejercicioId: 'cualquiera', orden: 1 })
    expect(res.status).toBe(404)
  })
})
