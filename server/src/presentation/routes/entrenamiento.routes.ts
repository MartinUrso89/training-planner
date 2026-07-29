import { Router } from 'express'
import { jwtCheck } from '../middleware/auth.middleware.js'
import {
  obtenerEntrenamientosPorUsuario,
  obtenerEntrenamientoPorId,
  asignarPlantillaAUsuario,
  marcarEntrenamientoCompletado,
  registrarResultadoEjercicio,
  actualizarResultadoEjercicio,
} from '../../domain/services/entrenamiento.service.js'

const router = Router()
router.use(jwtCheck)

router.get('/', async (req, res, next) => {
  try {
    const entrenamientos = await obtenerEntrenamientosPorUsuario(req.userId!)
    res.json(entrenamientos)
  } catch (err) {
    next(err)
  }
})

router.get('/:id', async (req, res, next) => {
  try {
    const entrenamiento = await obtenerEntrenamientoPorId(req.params.id, req.userId!, false)
    res.json(entrenamiento)
  } catch (err) {
    next(err)
  }
})

router.post('/asignar', async (req, res, next) => {
  try {
    const entrenamiento = await asignarPlantillaAUsuario(req.userId!, req.body)
    res.status(201).json(entrenamiento)
  } catch (err) {
    next(err)
  }
})

router.post('/:id/completar', async (req, res, next) => {
  try {
    const entrenamiento = await marcarEntrenamientoCompletado(req.params.id, req.userId!)
    res.json(entrenamiento)
  } catch (err) {
    next(err)
  }
})

router.post('/ejercicios/:ejercicioId/log', async (req, res, next) => {
  try {
    const log = await registrarResultadoEjercicio(req.params.ejercicioId, req.userId!, req.body)
    res.status(201).json(log)
  } catch (err) {
    next(err)
  }
})

router.put('/logs/:logId', async (req, res, next) => {
  try {
    const log = await actualizarResultadoEjercicio(req.params.logId, req.userId!, req.body)
    res.json(log)
  } catch (err) {
    next(err)
  }
})

export default router
