import { describe, it, expect } from 'vitest'
import request from 'supertest'
import { app } from '../src/index.js'
import { registrarUsuario, autenticar } from './helpers/registrar.js'
import type { UsuarioRegistrado } from './helpers/registrar.js'

const cuerpoEjercicio = {
  nombre: 'Press de banca',
  musculoPrincipal: 'Pecho',
  musculoSecundario: 'Tríceps',
  tipoArticular: 'Poliarticular',
  patronMovimiento: 'Empuje',
}

const crearEjercicio = async (u: UsuarioRegistrado, sobreescribir: Record<string, string> = {}) => {
  const res = await request(app)
    .post('/ejercicios')
    .set(autenticar(u))
    .send({ ...cuerpoEjercicio, ...sobreescribir })
  expect(res.status).toBe(201)
  return res.body as { id: string }
}

describe('GET /ejercicios (sin token)', () => {
  it('devuelve 401 en todas las rutas', async () => {
    const rutas = ['/', '/grupos-musculares', '/sugerencias', '/abc']
    for (const ruta of rutas) {
      const res = await request(app).get(`/ejercicios${ruta}`)
      expect(res.status).toBe(401)
    }
  })
})

describe('GET /ejercicios', () => {
  it('lista ejercicios paginados', async () => {
    const u = await registrarUsuario()
    for (let i = 1; i <= 3; i++) {
      await crearEjercicio(u, { nombre: `Ejercicio ${i}` })
    }
    const res = await request(app).get('/ejercicios?pagina=1&limite=2').set(autenticar(u))
    expect(res.status).toBe(200)
    expect(res.body.datos).toHaveLength(2)
    expect(res.body.total).toBe(3)
    expect(res.body.pagina).toBe(1)
    expect(res.body.totalPaginas).toBe(2)
  })

  it('filtra por músculo principal', async () => {
    const u = await registrarUsuario()
    await crearEjercicio(u)
    await crearEjercicio(u, { nombre: 'Sentadilla', musculoPrincipal: 'Cuádriceps', patronMovimiento: 'DominanteRodilla' })
    const res = await request(app).get('/ejercicios').query({ musculoPrincipal: 'Pecho' }).set(autenticar(u))
    expect(res.status).toBe(200)
    expect(res.body.total).toBe(1)
    expect(res.body.datos[0].nombre).toBe('Press de banca')
  })

  it('busca por nombre', async () => {
    const u = await registrarUsuario()
    await crearEjercicio(u)
    await crearEjercicio(u, { nombre: 'Peso muerto' })
    const res = await request(app).get('/ejercicios').query({ buscar: 'peso' }).set(autenticar(u))
    expect(res.body.total).toBe(1)
    expect(res.body.datos[0].nombre).toBe('Peso muerto')
  })

  it('no falla con límite mayor al tope', async () => {
    const u = await registrarUsuario()
    const res = await request(app).get('/ejercicios?limite=500').set(autenticar(u))
    expect(res.status).toBe(200)
    expect(res.body.datos).toHaveLength(0)
  })
})

describe('GET /ejercicios/grupos-musculares', () => {
  it('devuelve grupos distintos', async () => {
    const u = await registrarUsuario()
    await crearEjercicio(u)
    await crearEjercicio(u, { nombre: 'Sentadilla', musculoPrincipal: 'Cuádriceps', patronMovimiento: 'DominanteRodilla' })
    const res = await request(app).get('/ejercicios/grupos-musculares').set(autenticar(u))
    expect(res.status).toBe(200)
    expect(res.body).toEqual(['Cuádriceps', 'Pecho'])
  })
})

describe('GET /ejercicios/:id', () => {
  it('devuelve un ejercicio existente', async () => {
    const u = await registrarUsuario()
    const creado = await crearEjercicio(u)
    const res = await request(app).get(`/ejercicios/${creado.id}`).set(autenticar(u))
    expect(res.status).toBe(200)
    expect(res.body.nombre).toBe('Press de banca')
  })

  it('devuelve 404 si no existe', async () => {
    const u = await registrarUsuario()
    const res = await request(app).get('/ejercicios/inexistente').set(autenticar(u))
    expect(res.status).toBe(404)
  })
})

describe('POST /ejercicios', () => {
  it('crea un ejercicio', async () => {
    const u = await registrarUsuario()
    const res = await request(app).post('/ejercicios').set(autenticar(u)).send(cuerpoEjercicio)
    expect(res.status).toBe(201)
    expect(res.body).toMatchObject({ nombre: 'Press de banca', musculoPrincipal: 'Pecho' })
    expect(res.body.creadoPor).toBe(u.userId)
  })

  it('valida campos obligatorios', async () => {
    const u = await registrarUsuario()
    const casos = [
      { musculoPrincipal: 'Pecho', tipoArticular: 'Poliarticular', patronMovimiento: 'Empuje' },
      { nombre: 'X', tipoArticular: 'Poliarticular', patronMovimiento: 'Empuje' },
      { nombre: 'X', musculoPrincipal: 'Pecho', patronMovimiento: 'Empuje' },
      { nombre: 'X', musculoPrincipal: 'Pecho', tipoArticular: 'Poliarticular' },
    ]
    for (const body of casos) {
      const res = await request(app).post('/ejercicios').set(autenticar(u)).send(body)
      expect(res.status).toBe(400)
      expect(res.body.error).toBeTruthy()
    }
  })
})

describe('PUT /ejercicios/:id', () => {
  it('actualiza el ejercicio propio', async () => {
    const u = await registrarUsuario()
    const creado = await crearEjercicio(u)
    const res = await request(app).put(`/ejercicios/${creado.id}`).set(autenticar(u)).send({ nombre: 'Press inclinado' })
    expect(res.status).toBe(200)
    expect(res.body.nombre).toBe('Press inclinado')
  })

  it('devuelve 403 si el ejercicio es de otro usuario', async () => {
    const u1 = await registrarUsuario('Uno', 'uno@test.com')
    const u2 = await registrarUsuario('Dos', 'dos@test.com')
    const creado = await crearEjercicio(u1)
    const res = await request(app).put(`/ejercicios/${creado.id}`).set(autenticar(u2)).send({ nombre: 'Hackeado' })
    expect(res.status).toBe(403)
  })

  it('devuelve 404 si no existe', async () => {
    const u = await registrarUsuario()
    const res = await request(app).put('/ejercicios/inexistente').set(autenticar(u)).send({ nombre: 'X' })
    expect(res.status).toBe(404)
  })
})

describe('DELETE /ejercicios/:id', () => {
  it('elimina el ejercicio propio', async () => {
    const u = await registrarUsuario()
    const creado = await crearEjercicio(u)
    const res = await request(app).delete(`/ejercicios/${creado.id}`).set(autenticar(u))
    expect(res.status).toBe(204)
    const get = await request(app).get(`/ejercicios/${creado.id}`).set(autenticar(u))
    expect(get.status).toBe(404)
  })

  it('devuelve 403 si el ejercicio es de otro usuario', async () => {
    const u1 = await registrarUsuario('Uno', 'uno@test.com')
    const u2 = await registrarUsuario('Dos', 'dos@test.com')
    const creado = await crearEjercicio(u1)
    const res = await request(app).delete(`/ejercicios/${creado.id}`).set(autenticar(u2))
    expect(res.status).toBe(403)
  })

  it('devuelve 404 si no existe', async () => {
    const u = await registrarUsuario()
    const res = await request(app).delete('/ejercicios/inexistente').set(autenticar(u))
    expect(res.status).toBe(404)
  })
})

describe('Sugerencias de ejercicio', () => {
  it('crea y lista una sugerencia', async () => {
    const u = await registrarUsuario()
    const creada = await request(app).post('/ejercicios/sugerir').set(autenticar(u)).send(cuerpoEjercicio)
    expect(creada.status).toBe(201)
    expect(creada.body).toMatchObject({ nombre: 'Press de banca', estado: 'Pendiente' })
    expect(creada.body.sugeridoPor).toBe(u.userId)

    const lista = await request(app).get('/ejercicios/sugerencias').set(autenticar(u))
    expect(lista.status).toBe(200)
    expect(lista.body).toHaveLength(1)
    expect(lista.body[0].nombre).toBe('Press de banca')
  })

  it('valida campos obligatorios', async () => {
    const u = await registrarUsuario()
    const res = await request(app).post('/ejercicios/sugerir').set(autenticar(u)).send({})
    expect(res.status).toBe(400)
    expect(res.body.error).toBeTruthy()
  })
})
