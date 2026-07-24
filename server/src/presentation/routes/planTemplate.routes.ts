import { Router } from 'express'
import { jwtCheck } from '../middleware/auth.middleware.js'
import { getTemplates, getTemplateById, createNewTemplate, removeTemplate, addSectionToTemplate, removeSectionFromTemplate, addExerciseToTemplateSection, removeExerciseFromTemplateSection, updateTemplateExercise } from '../../domain/services/planTemplate.service.js'

const router = Router()
router.use(jwtCheck)

router.get('/', async (req, res, next) => {
  try {
    const templates = await getTemplates(req.userId!)
    res.json(templates)
  } catch (err) {
    next(err)
  }
})

router.get('/:id', async (req, res, next) => {
  try {
    const template = await getTemplateById(req.params.id, req.userId!)
    res.json(template)
  } catch (err) {
    next(err)
  }
})

router.post('/', async (req, res, next) => {
  try {
    const template = await createNewTemplate(req.userId!, req.body)
    res.status(201).json(template)
  } catch (err) {
    next(err)
  }
})

router.delete('/:id', async (req, res, next) => {
  try {
    await removeTemplate(req.params.id, req.userId!)
    res.status(204).end()
  } catch (err) {
    next(err)
  }
})

router.post('/:templateId/sections', async (req, res, next) => {
  try {
    const section = await addSectionToTemplate(req.params.templateId, req.userId!, req.body)
    res.status(201).json(section)
  } catch (err) {
    next(err)
  }
})

router.delete('/:templateId/sections/:sectionId', async (req, res, next) => {
  try {
    await removeSectionFromTemplate(req.params.sectionId, req.params.templateId, req.userId!)
    res.status(204).end()
  } catch (err) {
    next(err)
  }
})

router.post('/:templateId/sections/:sectionId/exercises', async (req, res, next) => {
  try {
    const exercise = await addExerciseToTemplateSection(req.params.sectionId, req.params.templateId, req.userId!, req.body)
    res.status(201).json(exercise)
  } catch (err) {
    next(err)
  }
})

router.put('/:templateId/sections/:sectionId/exercises/:exerciseId', async (req, res, next) => {
  try {
    const exercise = await updateTemplateExercise(req.params.exerciseId, req.params.templateId, req.userId!, req.body)
    res.json(exercise)
  } catch (err) {
    next(err)
  }
})

router.delete('/:templateId/sections/:sectionId/exercises/:exerciseId', async (req, res, next) => {
  try {
    await removeExerciseFromTemplateSection(req.params.exerciseId, req.params.templateId, req.userId!)
    res.status(204).end()
  } catch (err) {
    next(err)
  }
})

export default router
