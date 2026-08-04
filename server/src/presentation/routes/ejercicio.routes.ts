import { Router } from 'express'
import { jwtCheck } from '../middleware/auth.middleware.js'
import {
  obtenerEjercicios,
  obtenerEjercicioPorId,
  crearNuevoEjercicio,
  actualizarEjercicioExistente,
  eliminarEjercicioExistente,
  obtenerGruposMusculares,
  sugerirNuevoEjercicio,
  obtenerSugerenciasEjercicio,
} from '../../domain/services/ejercicio.service.js'

const router = Router()
router.use(jwtCheck)

router.get('/', async (req, res, next) => {
  try {
    const { buscar, musculoPrincipal, tipoArticular, patronMovimiento, pagina, limite } = req.query
    const resultado = await obtenerEjercicios(
      {
        buscar: buscar as string | undefined,
        musculoPrincipal: musculoPrincipal as string | undefined,
        tipoArticular: tipoArticular as string | undefined,
        patronMovimiento: patronMovimiento as string | undefined,
      },
      Number(pagina) || 1,
      Number(limite) || 15,
    )
    res.json(resultado)
  } catch (err) {
    next(err)
  }
})

router.get('/grupos-musculares', async (_req, res, next) => {
  try {
    const grupos = await obtenerGruposMusculares()
    res.json(grupos)
  } catch (err) {
    next(err)
  }
})

router.get('/sugerencias', async (_req, res, next) => {
  try {
    const sugerencias = await obtenerSugerenciasEjercicio()
    res.json(sugerencias)
  } catch (err) {
    next(err)
  }
})

router.get('/:id', async (req, res, next) => {
  try {
    const ejercicio = await obtenerEjercicioPorId(req.params.id)
    res.json(ejercicio)
  } catch (err) {
    next(err)
  }
})

router.post('/', async (req, res, next) => {
  try {
    const ejercicio = await crearNuevoEjercicio(req.userId!, req.body)
    res.status(201).json(ejercicio)
  } catch (err) {
    next(err)
  }
})

router.post('/sugerir', async (req, res, next) => {
  try {
    const sugerencia = await sugerirNuevoEjercicio(req.userId!, req.body)
    res.status(201).json(sugerencia)
  } catch (err) {
    next(err)
  }
})

router.put('/:id', async (req, res, next) => {
  try {
    const ejercicio = await actualizarEjercicioExistente(req.params.id, req.userId!, req.body)
    res.json(ejercicio)
  } catch (err) {
    next(err)
  }
})

router.delete('/:id', async (req, res, next) => {
  try {
    await eliminarEjercicioExistente(req.params.id, req.userId!)
    res.status(204).end()
  } catch (err) {
    next(err)
  }
})

export default router
