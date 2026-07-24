import { createHttpError } from '../../lib/errors.js'
import { listExercises, findExerciseById, createExercise, updateExercise, deleteExercise } from '../../infrastructure/database/exercise.database.js'
import type { DomainExercise, CreateExerciseInput, UpdateExerciseInput } from '../types/exercise.types.js'

export const getExercises = (userId: string): Promise<DomainExercise[]> =>
  listExercises(userId)

export const getExerciseById = async (id: string, userId: string): Promise<DomainExercise> => {
  const exercise = await findExerciseById(id)
  if (!exercise) throw createHttpError(404, 'Ejercicio no encontrado')
  if (exercise.createdBy !== userId) throw createHttpError(403, 'No tienes permiso para ver este ejercicio')
  return exercise
}

export const createNewExercise = (userId: string, data: CreateExerciseInput): Promise<DomainExercise> => {
  if (!data.name?.trim()) throw createHttpError(400, 'El nombre es obligatorio')
  if (!data.muscleGroup?.trim()) throw createHttpError(400, 'El grupo muscular es obligatorio')
  return createExercise(userId, data)
}

export const updateExistingExercise = async (id: string, userId: string, data: UpdateExerciseInput): Promise<DomainExercise> => {
  const existing = await findExerciseById(id)
  if (!existing) throw createHttpError(404, 'Ejercicio no encontrado')
  if (existing.createdBy !== userId) throw createHttpError(403, 'No tienes permiso para modificar este ejercicio')
  return updateExercise(id, data)
}

export const removeExercise = async (id: string, userId: string): Promise<void> => {
  const existing = await findExerciseById(id)
  if (!existing) throw createHttpError(404, 'Ejercicio no encontrado')
  if (existing.createdBy !== userId) throw createHttpError(403, 'No tienes permiso para eliminar este ejercicio')
  await deleteExercise(id)
}
