import { Router } from 'express'
import { jwtCheck } from '../middleware/auth.middleware.js'
import { getWorkoutsByUser, getWorkoutById, assignTemplateToUser, markWorkoutCompleted, logExerciseResult, updateExerciseResult } from '../../domain/services/workout.service.js'

const router = Router()
router.use(jwtCheck)

router.get('/', async (req, res, next) => {
  try {
    const workouts = await getWorkoutsByUser(req.userId!)
    res.json(workouts)
  } catch (err) {
    next(err)
  }
})

router.get('/:id', async (req, res, next) => {
  try {
    const workout = await getWorkoutById(req.params.id, req.userId!, false)
    res.json(workout)
  } catch (err) {
    next(err)
  }
})

router.post('/assign', async (req, res, next) => {
  try {
    const workout = await assignTemplateToUser(req.userId!, req.body)
    res.status(201).json(workout)
  } catch (err) {
    next(err)
  }
})

router.post('/:id/complete', async (req, res, next) => {
  try {
    await markWorkoutCompleted(req.params.id, req.userId!)
    res.json({ message: 'Entrenamiento completado' })
  } catch (err) {
    next(err)
  }
})

router.post('/exercises/:exerciseId/log', async (req, res, next) => {
  try {
    const log = await logExerciseResult(req.params.exerciseId, req.userId!, req.body)
    res.status(201).json(log)
  } catch (err) {
    next(err)
  }
})

router.put('/logs/:logId', async (req, res, next) => {
  try {
    const log = await updateExerciseResult(req.params.logId, req.userId!, req.body)
    res.json(log)
  } catch (err) {
    next(err)
  }
})

export default router
