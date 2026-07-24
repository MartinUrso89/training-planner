import prisma from '../../lib/prisma.js'
import type { DomainExercise, CreateExerciseInput, UpdateExerciseInput } from '../../domain/types/exercise.types.js'

const selectFields = {
  id: true,
  name: true,
  muscleGroup: true,
  videoUrl: true,
  description: true,
  createdBy: true,
  createdAt: true,
} as const

export const listExercises = (userId: string): Promise<DomainExercise[]> =>
  prisma.exercise.findMany({
    where: { createdBy: userId },
    select: selectFields,
    orderBy: { name: 'asc' },
  })

export const findExerciseById = (id: string): Promise<DomainExercise | null> =>
  prisma.exercise.findUnique({ where: { id }, select: selectFields })

export const createExercise = (userId: string, data: CreateExerciseInput): Promise<DomainExercise> =>
  prisma.exercise.create({
    data: {
      name: data.name,
      muscleGroup: data.muscleGroup,
      videoUrl: data.videoUrl ?? null,
      description: data.description ?? null,
      createdBy: userId,
    },
    select: selectFields,
  })

export const updateExercise = (id: string, data: UpdateExerciseInput): Promise<DomainExercise> =>
  prisma.exercise.update({
    where: { id },
    data: {
      ...(data.name !== undefined && { name: data.name }),
      ...(data.muscleGroup !== undefined && { muscleGroup: data.muscleGroup }),
      ...(data.videoUrl !== undefined && { videoUrl: data.videoUrl }),
      ...(data.description !== undefined && { description: data.description }),
    },
    select: selectFields,
  })

export const deleteExercise = (id: string): Promise<void> =>
  prisma.exercise.delete({ where: { id } }).then(() => undefined)
