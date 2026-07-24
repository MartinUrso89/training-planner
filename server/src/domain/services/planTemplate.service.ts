import { createHttpError } from '../../lib/errors.js'
import { listTemplates, findTemplateById, createTemplate, deleteTemplate, addSection, removeSection, addExerciseToSection, removeExerciseFromSection, updateExerciseInSection } from '../../infrastructure/database/planTemplate.database.js'
import { findExerciseById } from '../../infrastructure/database/exercise.database.js'
import type { DomainPlanTemplate, DomainTemplateSection, DomainTemplateExercise } from '../types/planTemplate.types.js'
import type { CreatePlanTemplateInput, CreateTemplateSectionInput, CreateTemplateExerciseInput } from '../types/planTemplate.types.js'

export const getTemplates = (userId: string): Promise<DomainPlanTemplate[]> =>
  listTemplates(userId)

export const getTemplateById = async (id: string, userId: string): Promise<DomainPlanTemplate> => {
  const template = await findTemplateById(id)
  if (!template) throw createHttpError(404, 'Plantilla no encontrada')
  if (template.userId !== userId) throw createHttpError(403, 'No tienes permiso para ver esta plantilla')
  return template
}

export const createNewTemplate = (userId: string, data: CreatePlanTemplateInput): Promise<DomainPlanTemplate> => {
  if (!data.name?.trim()) throw createHttpError(400, 'El nombre es obligatorio')
  return createTemplate(userId, data)
}

export const removeTemplate = async (id: string, userId: string): Promise<void> => {
  const template = await findTemplateById(id)
  if (!template) throw createHttpError(404, 'Plantilla no encontrada')
  if (template.userId !== userId) throw createHttpError(403, 'No tienes permiso para eliminar esta plantilla')
  await deleteTemplate(id)
}

export const addSectionToTemplate = async (
  templateId: string,
  userId: string,
  data: CreateTemplateSectionInput,
): Promise<DomainTemplateSection> => {
  const template = await findTemplateById(templateId)
  if (!template) throw createHttpError(404, 'Plantilla no encontrada')
  if (template.userId !== userId) throw createHttpError(403, 'No tienes permiso para modificar esta plantilla')
  return addSection(templateId, data)
}

export const removeSectionFromTemplate = async (
  sectionId: string,
  templateId: string,
  userId: string,
): Promise<void> => {
  const template = await findTemplateById(templateId)
  if (!template) throw createHttpError(404, 'Plantilla no encontrada')
  if (template.userId !== userId) throw createHttpError(403, 'No tienes permiso para modificar esta plantilla')
  await removeSection(sectionId)
}

export const addExerciseToTemplateSection = async (
  sectionId: string,
  templateId: string,
  userId: string,
  data: CreateTemplateExerciseInput,
): Promise<DomainTemplateExercise> => {
  const template = await findTemplateById(templateId)
  if (!template) throw createHttpError(404, 'Plantilla no encontrada')
  if (template.userId !== userId) throw createHttpError(403, 'No tienes permiso para modificar esta plantilla')

  const exercise = await findExerciseById(data.exerciseId)
  if (!exercise) throw createHttpError(404, 'Ejercicio no encontrado')

  return addExerciseToSection(sectionId, data)
}

export const removeExerciseFromTemplateSection = async (
  exerciseId: string,
  templateId: string,
  userId: string,
): Promise<void> => {
  const template = await findTemplateById(templateId)
  if (!template) throw createHttpError(404, 'Plantilla no encontrada')
  if (template.userId !== userId) throw createHttpError(403, 'No tienes permiso para modificar esta plantilla')
  await removeExerciseFromSection(exerciseId)
}

export const updateTemplateExercise = async (
  exerciseId: string,
  templateId: string,
  userId: string,
  data: Partial<CreateTemplateExerciseInput>,
): Promise<DomainTemplateExercise> => {
  const template = await findTemplateById(templateId)
  if (!template) throw createHttpError(404, 'Plantilla no encontrada')
  if (template.userId !== userId) throw createHttpError(403, 'No tienes permiso para modificar esta plantilla')
  return updateExerciseInSection(exerciseId, data)
}
