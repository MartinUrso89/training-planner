import { Router } from 'express'
import { registerUser, loginUser, refreshUserTokens, getUserById } from '../../domain/services/auth.service.js'
import { jwtCheck } from '../middleware/auth.middleware.js'

const router = Router()

router.post('/register', async (req, res, next) => {
  try {
    const result = await registerUser(req.body)
    res.status(201).json(result)
  } catch (err) {
    next(err)
  }
})

router.post('/login', async (req, res, next) => {
  try {
    const result = await loginUser(req.body)
    res.json(result)
  } catch (err) {
    next(err)
  }
})

router.post('/refresh', async (req, res, next) => {
  try {
    const { refreshToken } = req.body
    if (!refreshToken) {
      res.status(400).json({ error: 'Refresh token requerido' })
      return
    }
    const result = await refreshUserTokens(refreshToken)
    res.json(result)
  } catch (err) {
    next(err)
  }
})

router.get('/me', jwtCheck, async (req, res, next) => {
  try {
    const user = await getUserById(req.userId!)
    res.json(user)
  } catch (err) {
    next(err)
  }
})

export default router
