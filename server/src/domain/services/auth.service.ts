import jwt from 'jsonwebtoken'
import bcrypt from 'bcrypt'
import { createHttpError } from '../../lib/errors.js'
import { env } from '../../lib/envConfig.js'
import {
  buscarPorCorreo,
  buscarUsuarioPorId,
  crearUsuario,
  guardarTokenRefresco,
  buscarTokenRefresco,
  eliminarTokenRefresco,
} from '../../infrastructure/database/usuario.database.js'
import type { Usuario } from '../types/usuario.types.js'

interface RegisterInput {
  nombre: string
  correo: string
  contrasena: string
}

interface LoginResponse {
  accessToken: string
  refreshToken: string
  user: Usuario
}

const generateTokens = async (userId: string): Promise<LoginResponse> => {
  const accessToken = jwt.sign({ sub: userId }, env.JWT_SECRET, { expiresIn: '2h' })
  const refreshToken = jwt.sign({ sub: userId }, env.JWT_SECRET, { expiresIn: '7d' })

  await guardarTokenRefresco(userId, refreshToken)

  const user = await buscarUsuarioPorId(userId)
  if (!user) throw createHttpError(500, 'Error al obtener el usuario')

  return { accessToken, refreshToken, user }
}

export const registerUser = async (input: RegisterInput): Promise<LoginResponse> => {
  if (!input.nombre?.trim()) throw createHttpError(400, 'El nombre es obligatorio')
  if (!input.correo?.trim()) throw createHttpError(400, 'El correo es obligatorio')
  if (!input.contrasena?.trim() || input.contrasena.length < 6) throw createHttpError(400, 'La contraseña debe tener al menos 6 caracteres')

  const exists = await buscarPorCorreo(input.correo)
  if (exists) throw createHttpError(409, 'El correo ya está registrado')

  const hashed = await bcrypt.hash(input.contrasena, 10)
  const user = await crearUsuario({ nombre: input.nombre, correo: input.correo, contrasena: hashed })

  return generateTokens(user.id)
}

export const loginUser = async (input: { correo: string; contrasena: string }): Promise<LoginResponse> => {
  if (!input.correo?.trim()) throw createHttpError(400, 'El correo es obligatorio')
  if (!input.contrasena?.trim()) throw createHttpError(400, 'La contraseña es obligatoria')

  const user = await buscarPorCorreo(input.correo)
  if (!user) throw createHttpError(401, 'Credenciales inválidas')

  const match = await bcrypt.compare(input.contrasena, user.contrasena)
  if (!match) throw createHttpError(401, 'Credenciales inválidas')

  return generateTokens(user.id)
}

export const refreshUserTokens = async (refreshToken: string): Promise<LoginResponse> => {
  try {
    const payload = jwt.verify(refreshToken, env.JWT_SECRET) as { sub: string }
    const stored = await buscarTokenRefresco(payload.sub, refreshToken)
    if (!stored) throw createHttpError(401, 'Refresh token inválido')

    await eliminarTokenRefresco(refreshToken)
    return generateTokens(payload.sub)
  } catch (err) {
    if ((err as Error & { status?: number }).status) throw err
    throw createHttpError(401, 'Refresh token inválido o expirado')
  }
}

export const getUserById = async (id: string): Promise<Usuario> => {
  const user = await buscarUsuarioPorId(id)
  if (!user) throw createHttpError(404, 'Usuario no encontrado')
  return user
}
