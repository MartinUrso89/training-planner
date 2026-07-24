import { Prisma } from '@prisma/client'
import prisma from '../../lib/prisma.js'
import type { DomainWorkout, DomainWorkoutSection, DomainWorkoutExercise, DomainWorkoutExerciseLog } from '../../domain/types/workout.types.js'

const logSelect = {
  id: true,
  workoutExerciseId: true,
  completed: true,
  actualReps: true,
  actualWeight: true,
  actualRpe: true,
  actualDuration: true,
  comment: true,
  completedAt: true,
} as const

const exerciseSelect = {
  id: true,
  name: true,
  muscleGroup: true,
  videoUrl: true,
  description: true,
  createdBy: true,
  createdAt: true,
} as const

const workoutExerciseSelect = {
  id: true,
  workoutSectionId: true,
  exerciseId: true,
  sortOrder: true,
  plannedSets: true,
  plannedReps: true,
  plannedDuration: true,
  plannedWeight: true,
  plannedRpe: true,
  plannedRest: true,
  supersetGroupId: true,
  supersetOrder: true,
  notes: true,
  exercise: { select: exerciseSelect },
  logs: { select: logSelect },
} as const

const workoutSectionSelect = {
  id: true,
  workoutId: true,
  sectionTypeId: true,
  name: true,
  sortOrder: true,
  rounds: true,
  timeCap: true,
  restBetweenExercises: true,
  restBetweenRounds: true,
  exercises: { select: workoutExerciseSelect, orderBy: { sortOrder: 'asc' as const } },
} as const

const workoutSelect = {
  id: true,
  templateId: true,
  userId: true,
  assignedById: true,
  date: true,
  completed: true,
  completedAt: true,
  createdAt: true,
  sections: { select: workoutSectionSelect, orderBy: { sortOrder: 'asc' as const } },
} as const

type WorkoutPayload = Prisma.WorkoutGetPayload<{ select: typeof workoutSelect }>
type SectionPayload = WorkoutPayload['sections'][number]
type ExercisePayload = SectionPayload['exercises'][number]
type LogPayload = ExercisePayload['logs'][number]

const toDomainLog = (l: LogPayload): DomainWorkoutExerciseLog => ({
  id: l.id,
  workoutExerciseId: l.workoutExerciseId,
  completed: l.completed,
  actualReps: l.actualReps,
  actualWeight: l.actualWeight !== null ? Number(l.actualWeight) : null,
  actualRpe: l.actualRpe !== null ? Number(l.actualRpe) : null,
  actualDuration: l.actualDuration,
  comment: l.comment,
  completedAt: l.completedAt,
})

const toDomainExercise = (e: ExercisePayload): DomainWorkoutExercise => ({
  id: e.id,
  workoutSectionId: e.workoutSectionId,
  exerciseId: e.exerciseId,
  sortOrder: e.sortOrder,
  plannedSets: e.plannedSets,
  plannedReps: e.plannedReps,
  plannedDuration: e.plannedDuration,
  plannedWeight: e.plannedWeight !== null ? Number(e.plannedWeight) : null,
  plannedRpe: e.plannedRpe !== null ? Number(e.plannedRpe) : null,
  plannedRest: e.plannedRest,
  supersetGroupId: e.supersetGroupId,
  supersetOrder: e.supersetOrder,
  notes: e.notes,
  exercise: e.exercise,
  logs: e.logs.map(toDomainLog),
})

const toDomainSection = (s: SectionPayload): DomainWorkoutSection => ({
  id: s.id,
  workoutId: s.workoutId,
  sectionTypeId: s.sectionTypeId,
  name: s.name,
  sortOrder: s.sortOrder,
  rounds: s.rounds,
  timeCap: s.timeCap,
  restBetweenExercises: s.restBetweenExercises,
  restBetweenRounds: s.restBetweenRounds,
  exercises: s.exercises.map(toDomainExercise),
})

const toDomainWorkout = (w: WorkoutPayload): DomainWorkout => ({
  id: w.id,
  templateId: w.templateId,
  userId: w.userId,
  assignedById: w.assignedById,
  date: w.date,
  completed: w.completed,
  completedAt: w.completedAt,
  createdAt: w.createdAt,
  sections: w.sections.map(toDomainSection),
})

export const listWorkoutsByUser = (userId: string): Promise<DomainWorkout[]> =>
  prisma.workout
    .findMany({
      where: { userId },
      select: workoutSelect,
      orderBy: { date: 'desc' },
    })
    .then((raw) => raw.map(toDomainWorkout))

export const findWorkoutById = (id: string): Promise<DomainWorkout | null> =>
  prisma.workout
    .findUnique({ where: { id }, select: workoutSelect })
    .then((raw) => (raw ? toDomainWorkout(raw) : null))

export const assignWorkout = async (
  templateId: string,
  userId: string,
  assignedById: string,
  date: Date,
): Promise<DomainWorkout> => {
  const template = await prisma.planTemplate.findUnique({
    where: { id: templateId },
    include: {
      sections: {
        include: { exercises: true },
        orderBy: { sortOrder: 'asc' },
      },
    },
  })

  if (!template) throw new Error('Template not found')

  const workout = await prisma.workout.create({
    data: {
      templateId,
      userId,
      assignedById,
      date,
      sections: {
        create: template.sections.map((s) => ({
          sectionTypeId: s.sectionTypeId,
          name: s.name,
          sortOrder: s.sortOrder,
          rounds: s.rounds,
          timeCap: s.timeCap,
          restBetweenExercises: s.restBetweenExercises,
          restBetweenRounds: s.restBetweenRounds,
          exercises: {
            create: s.exercises.map((e) => ({
              exerciseId: e.exerciseId,
              sortOrder: e.sortOrder,
              plannedSets: e.sets,
              plannedReps: e.reps,
              plannedDuration: e.durationSeconds,
              plannedWeight: e.weight,
              plannedRpe: e.rpe,
              plannedRest: e.restBetweenSets,
              supersetGroupId: e.supersetGroupId,
              supersetOrder: e.supersetOrder,
              notes: e.notes,
            })),
          },
        })),
      },
    },
    select: workoutSelect,
  })

  return toDomainWorkout(workout)
}

export const completeWorkout = (id: string): Promise<void> =>
  prisma.workout.update({
    where: { id },
    data: { completed: true, completedAt: new Date() },
  }).then(() => undefined)

export const createExerciseLog = (
  workoutExerciseId: string,
  data: {
    completed?: boolean
    actualReps?: number
    actualWeight?: number
    actualRpe?: number
    actualDuration?: number
    comment?: string
  },
): Promise<DomainWorkoutExerciseLog> =>
  prisma.workoutExerciseLog
    .create({
      data: {
        workoutExerciseId,
        completed: data.completed ?? false,
        actualReps: data.actualReps ?? null,
        actualWeight: data.actualWeight ?? null,
        actualRpe: data.actualRpe ?? null,
        actualDuration: data.actualDuration ?? null,
        comment: data.comment ?? null,
        completedAt: data.completed ? new Date() : null,
      },
      select: logSelect,
    })
    .then(toDomainLog)

export const updateExerciseLog = (
  logId: string,
  data: {
    completed?: boolean
    actualReps?: number
    actualWeight?: number
    actualRpe?: number
    actualDuration?: number
    comment?: string
  },
): Promise<DomainWorkoutExerciseLog> =>
  prisma.workoutExerciseLog
    .update({
      where: { id: logId },
      data: {
        ...(data.completed !== undefined && { completed: data.completed, completedAt: data.completed ? new Date() : null }),
        ...(data.actualReps !== undefined && { actualReps: data.actualReps }),
        ...(data.actualWeight !== undefined && { actualWeight: data.actualWeight }),
        ...(data.actualRpe !== undefined && { actualRpe: data.actualRpe }),
        ...(data.actualDuration !== undefined && { actualDuration: data.actualDuration }),
        ...(data.comment !== undefined && { comment: data.comment }),
      },
      select: logSelect,
    })
    .then(toDomainLog)
