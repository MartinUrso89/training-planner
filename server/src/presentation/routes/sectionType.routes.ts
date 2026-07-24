import { Router } from 'express'
import { getSectionTypes } from '../../domain/services/sectionType.service.js'

const router = Router()

router.get('/', async (_req, res, next) => {
  try {
    const types = await getSectionTypes()
    res.json(types)
  } catch (err) {
    next(err)
  }
})

export default router
