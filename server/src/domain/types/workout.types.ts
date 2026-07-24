import type { DomainExercise } from './exercise.types.js'

export interface DomainWorkout {
  id: string
  templateId: string | null
  userId: string
  assignedById: string
  date: Date
  completed: boolean
  completedAt: Date | null
  createdAt: Date
  sections: DomainWorkoutSection[]
}

export interface DomainWorkoutSection {
  id: string
  workoutId: string
  sectionTypeId: string
  name: string | null
  sortOrder: number
  rounds: number | null
  timeCap: number | null
  restBetweenExercises: number | null
  restBetweenRounds: number | null
  exercises: DomainWorkoutExercise[]
}

export interface DomainWorkoutExercise {
  id: string
  workoutSectionId: string
  exerciseId: string
  sortOrder: number
  plannedSets: number | null
  plannedReps: number | null
  plannedDuration: number | null
  plannedWeight: number | null
  plannedRpe: number | null
  plannedRest: number | null
  supersetGroupId: string | null
  supersetOrder: number | null
  notes: string | null
  exercise?: DomainExercise
  logs: DomainWorkoutExerciseLog[]
}

export interface DomainWorkoutExerciseLog {
  id: string
  workoutExerciseId: string
  completed: boolean
  actualReps: number | null
  actualWeight: number | null
  actualRpe: number | null
  actualDuration: number | null
  comment: string | null
  completedAt: Date | null
}

export interface AssignWorkoutInput {
  templateId: string
  userId: string
  date: string
}
