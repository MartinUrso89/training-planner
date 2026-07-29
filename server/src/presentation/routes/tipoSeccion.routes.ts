import { Router } from 'express'
import { obtenerTiposSeccion } from '../../domain/services/tipoSeccion.service.js'

const router = Router()

router.get('/', async (_req, res, next) => {
  try {
    const tipos = await obtenerTiposSeccion()
    res.json(tipos)
  } catch (err) {
    next(err)
  }
})

export default router
