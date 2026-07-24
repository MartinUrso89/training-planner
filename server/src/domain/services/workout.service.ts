import { createHttpError } from '../../lib/errors.js'
import { listWorkoutsByUser, findWorkoutById, assignWorkout as dbAssignWorkout, completeWorkout, createExerciseLog, updateExerciseLog } from '../../infrastructure/database/workout.database.js'
import { findTemplateById } from '../../infrastructure/database/planTemplate.database.js'
import type { DomainWorkout, DomainWorkoutExerciseLog, AssignWorkoutInput } from '../types/workout.types.js'

export const getWorkoutsByUser = (userId: string): Promise<DomainWorkout[]> =>
  listWorkoutsByUser(userId)

export const getWorkoutById = async (id: string, userId: string, isCoach: boolean): Promise<DomainWorkout> => {
  const workout = await findWorkoutById(id)
  if (!workout) throw createHttpError(404, 'Entrenamiento no encontrado')
  if (workout.userId !== userId && workout.assignedById !== userId && !isCoach) {
    throw createHttpError(403, 'No tienes permiso para ver este entrenamiento')
  }
  return workout
}

export const assignTemplateToUser = async (
  assignedById: string,
  data: AssignWorkoutInput,
): Promise<DomainWorkout> => {
  if (!data.templateId) throw createHttpError(400, 'La plantilla es obligatoria')
  if (!data.userId) throw createHttpError(400, 'El usuario es obligatorio')
  if (!data.date) throw createHttpError(400, 'La fecha es obligatoria')

  const template = await findTemplateById(data.templateId)
  if (!template) throw createHttpError(404, 'Plantilla no encontrada')

  return dbAssignWorkout(data.templateId, data.userId, assignedById, new Date(data.date))
}

export const markWorkoutCompleted = async (id: string, userId: string): Promise<void> => {
  const workout = await findWorkoutById(id)
  if (!workout) throw createHttpError(404, 'Entrenamiento no encontrado')
  if (workout.userId !== userId) throw createHttpError(403, 'Solo el entrenado puede marcar como completado')
  await completeWorkout(id)
}

export const logExerciseResult = async (
  workoutExerciseId: string,
  _userId: string,
  data: {
    completed?: boolean
    actualReps?: number
    actualWeight?: number
    actualRpe?: number
    actualDuration?: number
    comment?: string
  },
): Promise<DomainWorkoutExerciseLog> =>
  createExerciseLog(workoutExerciseId, data)

export const updateExerciseResult = async (
  logId: string,
  _userId: string,
  data: {
    completed?: boolean
    actualReps?: number
    actualWeight?: number
    actualRpe?: number
    actualDuration?: number
    comment?: string
  },
): Promise<DomainWorkoutExerciseLog> =>
  updateExerciseLog(logId, data)
