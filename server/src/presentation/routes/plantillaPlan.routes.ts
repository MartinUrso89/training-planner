import { Router } from 'express'
import { jwtCheck } from '../middleware/auth.middleware.js'
import {
  obtenerPlantillas,
  obtenerPlantillaPorId,
  crearNuevaPlantilla,
  eliminarPlantillaExistente,
  agregarSeccionAPlantilla,
  eliminarSeccionDePlantilla,
  agregarEjercicioASeccionPlantilla,
  eliminarEjercicioDeSeccionPlantilla,
  actualizarEjercicioEnSeccionPlantilla,
} from '../../domain/services/plantillaPlan.service.js'

const router = Router()
router.use(jwtCheck)

router.get('/', async (req, res, next) => {
  try {
    const plantillas = await obtenerPlantillas(req.userId!)
    res.json(plantillas)
  } catch (err) {
    next(err)
  }
})

router.get('/:id', async (req, res, next) => {
  try {
    const plantilla = await obtenerPlantillaPorId(req.params.id, req.userId!)
    res.json(plantilla)
  } catch (err) {
    next(err)
  }
})

router.post('/', async (req, res, next) => {
  try {
    const plantilla = await crearNuevaPlantilla(req.userId!, req.body)
    res.status(201).json(plantilla)
  } catch (err) {
    next(err)
  }
})

router.delete('/:id', async (req, res, next) => {
  try {
    await eliminarPlantillaExistente(req.params.id, req.userId!)
    res.status(204).end()
  } catch (err) {
    next(err)
  }
})

router.post('/:plantillaId/secciones', async (req, res, next) => {
  try {
    const seccion = await agregarSeccionAPlantilla(req.params.plantillaId, req.userId!, req.body)
    res.status(201).json(seccion)
  } catch (err) {
    next(err)
  }
})

router.delete('/:plantillaId/secciones/:seccionId', async (req, res, next) => {
  try {
    await eliminarSeccionDePlantilla(req.params.plantillaId, req.params.seccionId, req.userId!)
    res.status(204).end()
  } catch (err) {
    next(err)
  }
})

router.post('/:plantillaId/secciones/:seccionId/ejercicios', async (req, res, next) => {
  try {
    const ejercicio = await agregarEjercicioASeccionPlantilla(
      req.params.plantillaId,
      req.params.seccionId,
      req.userId!,
      req.body,
    )
    res.status(201).json(ejercicio)
  } catch (err) {
    next(err)
  }
})

router.put('/:plantillaId/secciones/:seccionId/ejercicios/:ejercicioId', async (req, res, next) => {
  try {
    const ejercicio = await actualizarEjercicioEnSeccionPlantilla(
      req.params.plantillaId,
      req.params.ejercicioId,
      req.userId!,
      req.body,
    )
    res.json(ejercicio)
  } catch (err) {
    next(err)
  }
})

router.delete('/:plantillaId/secciones/:seccionId/ejercicios/:ejercicioId', async (req, res, next) => {
  try {
    await eliminarEjercicioDeSeccionPlantilla(req.params.plantillaId, req.params.ejercicioId, req.userId!)
    res.status(204).end()
  } catch (err) {
    next(err)
  }
})

export default router
