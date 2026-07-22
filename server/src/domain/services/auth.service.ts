import bcrypt from 'bcrypt'
import jwt from 'jsonwebtoken'
import { logger } from '../../lib/logger.js'
import { env } from '../../lib/envConfig.js'
import { createHttpError } from '../../lib/errors.js'
import { findByEmail, createUser, findUserById, saveRefreshToken, findRefreshToken, deleteRefreshToken } from '../../infrastructure/database/user.database.js'
import type { DomainUser } from '../types/user.types.js'

const SALT_ROUNDS = 10

export interface RegisterInput {
  name: string
  email: string
  password: string
}

export interface LoginResponse {
  accessToken: string
  refreshToken: string
  user: DomainUser
}

function generateTokens(userId: string): { accessToken: string; refreshToken: string } {
  const accessToken = jwt.sign({ sub: userId }, env.JWT_SECRET, {
    expiresIn: env.JWT_ACCESS_EXPIRY as string & jwt.SignOptions['expiresIn'],
  })
  const refreshToken = jwt.sign({ sub: userId }, env.JWT_REFRESH_SECRET, {
    expiresIn: env.JWT_REFRESH_EXPIRY as string & jwt.SignOptions['expiresIn'],
  })
  return { accessToken, refreshToken }
}

export const registerUser = async (input: RegisterInput): Promise<LoginResponse> => {
  const { name, email, password } = input

  if (!name?.trim()) throw createHttpError(400, 'El nombre es obligatorio')
  if (!email?.trim()) throw createHttpError(400, 'El correo electrónico es obligatorio')
  if (!password) throw createHttpError(400, 'La contraseña es obligatoria')

  const normalizedEmail = email.trim().toLowerCase()

  const existing = await findByEmail(normalizedEmail)
  if (existing) throw createHttpError(409, 'El correo electrónico ya está registrado')

  const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS)

  const user = await createUser({ name: name.trim(), email: normalizedEmail, password: hashedPassword })

  const tokens = generateTokens(user.id)
  await saveRefreshToken(user.id, tokens.refreshToken)

  logger.info({ userId: user.id, email: normalizedEmail, action: 'auth.user.registered' }, 'User registered')

  return { ...tokens, user }
}

export const loginUser = async (input: { email: string; password: string }): Promise<LoginResponse> => {
  const { email, password } = input

  if (!email?.trim()) throw createHttpError(400, 'El correo electrónico es obligatorio')
  if (!password) throw createHttpError(400, 'La contraseña es obligatoria')

  const normalizedEmail = email.trim().toLowerCase()

  const user = await findByEmail(normalizedEmail)
  if (!user) throw createHttpError(401, 'Credenciales inválidas')

  const passwordMatch = await bcrypt.compare(password, user.password)
  if (!passwordMatch) throw createHttpError(401, 'Credenciales inválidas')

  const tokens = generateTokens(user.id)
  await saveRefreshToken(user.id, tokens.refreshToken)

  logger.info({ userId: user.id, email: normalizedEmail, action: 'auth.user.loggedIn' }, 'User logged in')

  const safeUser = { id: user.id, name: user.name, email: user.email, createdAt: user.createdAt }
  return { ...tokens, user: safeUser }
}

export const refreshUserTokens = async (refreshToken: string): Promise<LoginResponse> => {
  if (!refreshToken) throw createHttpError(400, 'Refresh token requerido')

  let payload: { sub: string }
  try {
    payload = jwt.verify(refreshToken, env.JWT_REFRESH_SECRET) as { sub: string }
  } catch {
    throw createHttpError(401, 'Refresh token inválido o expirado')
  }

  const stored = await findRefreshToken(payload.sub, refreshToken)
  if (!stored) throw createHttpError(401, 'Refresh token no reconocido')

  const user = await findUserById(payload.sub)
  if (!user) throw createHttpError(404, 'Usuario no encontrado')

  await deleteRefreshToken(refreshToken)

  const tokens = generateTokens(user.id)
  await saveRefreshToken(user.id, tokens.refreshToken)

  return { ...tokens, user }
}

export const getUserById = async (id: string): Promise<DomainUser> => {
  const user = await findUserById(id)
  if (!user) throw createHttpError(404, 'Usuario no encontrado')
  return user
}
