import request from 'supertest'
import { app } from '../../src/index.js'

export interface UsuarioRegistrado {
  userId: string
  correo: string
  accessToken: string
  refreshToken: string
}

export const autenticar = (u: UsuarioRegistrado): { Authorization: string } => ({
  Authorization: `Bearer ${u.accessToken}`,
})

export const registrarUsuario = async (
  nombre = 'Usuario Test',
  correo = `usuario-${Date.now()}-${Math.random().toString(36).slice(2, 8)}@test.com`,
  rol: 'ENTRENADOR' | 'ATLETA' = 'ATLETA',
): Promise<UsuarioRegistrado> => {
  const res = await request(app).post('/auth/register').send({
    nombre,
    correo,
    contrasena: '123456',
    rol,
  })
  if (res.status !== 201) {
    throw new Error(`register falló con status ${res.status}: ${JSON.stringify(res.body)}`)
  }
  return {
    userId: res.body.user.id,
    correo: res.body.user.correo,
    accessToken: res.body.accessToken,
    refreshToken: res.body.refreshToken,
  }
}
