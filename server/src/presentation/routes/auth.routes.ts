import { Router } from 'express'
import { createHttpError } from '../../lib/errors.js'
import { registerUser, loginUser, refreshUserTokens, getUserById } from '../../domain/services/auth.service.js'
import { jwtCheck } from '../middleware/auth.middleware.js'

const router = Router()

router.post('/register', async (req, res, next) => {
  try {
    const { name, email, password } = req.body
    if (!name?.trim()) throw createHttpError(400, 'El nombre es obligatorio')
    if (!email?.trim()) throw createHttpError(400, 'El correo electrónico es obligatorio')
    if (!password) throw createHttpError(400, 'La contraseña es obligatoria')

    const result = await registerUser(req.body)
    res.status(201).json(result)
  } catch (err) {
    next(err)
  }
})

router.post('/login', async (req, res, next) => {
  try {
    const { email, password } = req.body
    if (!email?.trim()) throw createHttpError(400, 'El correo electrónico es obligatorio')
    if (!password) throw createHttpError(400, 'La contraseña es obligatoria')

    const result = await loginUser(req.body)
    res.json(result)
  } catch (err) {
    next(err)
  }
})

router.post('/refresh', async (req, res, next) => {
  try {
    const { refreshToken } = req.body
    if (!refreshToken) throw createHttpError(400, 'Refresh token requerido')

    const result = await refreshUserTokens(refreshToken)
    res.json(result)
  } catch (err) {
    next(err)
  }
})

router.use(jwtCheck)

router.get('/me', async (req, res, next) => {
  try {
    const userId = req.userId!
    const user = await getUserById(userId)
    res.json(user)
  } catch (err) {
    next(err)
  }
})

export default router
