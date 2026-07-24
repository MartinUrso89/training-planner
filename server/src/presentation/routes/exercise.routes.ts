import { Router } from 'express'
import { jwtCheck } from '../middleware/auth.middleware.js'
import { getExercises, getExerciseById, createNewExercise, updateExistingExercise, removeExercise } from '../../domain/services/exercise.service.js'

const router = Router()
router.use(jwtCheck)

router.get('/', async (req, res, next) => {
  try {
    const exercises = await getExercises(req.userId!)
    res.json(exercises)
  } catch (err) {
    next(err)
  }
})

router.get('/:id', async (req, res, next) => {
  try {
    const exercise = await getExerciseById(req.params.id, req.userId!)
    res.json(exercise)
  } catch (err) {
    next(err)
  }
})

router.post('/', async (req, res, next) => {
  try {
    const exercise = await createNewExercise(req.userId!, req.body)
    res.status(201).json(exercise)
  } catch (err) {
    next(err)
  }
})

router.put('/:id', async (req, res, next) => {
  try {
    const exercise = await updateExistingExercise(req.params.id, req.userId!, req.body)
    res.json(exercise)
  } catch (err) {
    next(err)
  }
})

router.delete('/:id', async (req, res, next) => {
  try {
    await removeExercise(req.params.id, req.userId!)
    res.status(204).end()
  } catch (err) {
    next(err)
  }
})

export default router
