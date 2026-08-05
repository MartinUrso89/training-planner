import { Router } from 'express'
import { jwtCheck } from '../middleware/auth.middleware.js'
import { obtenerEntrenados, actualizarPerfilAtleta } from '../../domain/services/entrenados.service.js'

const router = Router()
router.use(jwtCheck)

router.get('/', async (req, res, next) => {
  try {
    const estado = req.query.estado as 'Pendiente' | 'Activo' | 'Inactivo' | undefined
    const resultado = await obtenerEntrenados(req.userId!, {
      busqueda: typeof req.query.busqueda === 'string' ? req.query.busqueda : undefined,
      estado,
      tienePendientes: req.query.tienePendientes === 'true',
      pagina: req.query.pagina ? Number(req.query.pagina) : undefined,
      limite: req.query.limite ? Number(req.query.limite) : undefined,
    })
    res.json(resultado)
  } catch (err) {
    next(err)
  }
})

router.put('/:atletaId/perfil', async (req, res, next) => {
  try {
    await actualizarPerfilAtleta(req.userId!, req.params.atletaId, req.body)
    res.json({ ok: true })
  } catch (err) {
    next(err)
  }
})

export default router
