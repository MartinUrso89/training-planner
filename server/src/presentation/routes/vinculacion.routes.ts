import { Router } from 'express'
import { jwtCheck } from '../middleware/auth.middleware.js'
import {
  crearVinculacion,
  listarVinculaciones,
  aceptarVinculacion,
  inactivarVinculacion,
  eliminarVinculacion,
} from '../../domain/services/vinculacion.service.js'

const router = Router()
router.use(jwtCheck)

router.post('/', async (req, res, next) => {
  try {
    const vinculacion = await crearVinculacion(req.userId!, req.body)
    res.status(201).json(vinculacion)
  } catch (err) {
    next(err)
  }
})

router.get('/', async (req, res, next) => {
  try {
    const estado = req.query.estado as 'Pendiente' | 'Activo' | 'Inactivo' | undefined
    const vinculaciones = await listarVinculaciones(req.userId!, estado)
    res.json(vinculaciones)
  } catch (err) {
    next(err)
  }
})

router.patch('/:id/aceptar', async (req, res, next) => {
  try {
    const vinculacion = await aceptarVinculacion(req.params.id, req.userId!)
    res.json(vinculacion)
  } catch (err) {
    next(err)
  }
})

router.patch('/:id/inactivar', async (req, res, next) => {
  try {
    const vinculacion = await inactivarVinculacion(req.params.id, req.userId!)
    res.json(vinculacion)
  } catch (err) {
    next(err)
  }
})

router.delete('/:id', async (req, res, next) => {
  try {
    await eliminarVinculacion(req.params.id, req.userId!)
    res.status(204).end()
  } catch (err) {
    next(err)
  }
})

export default router
