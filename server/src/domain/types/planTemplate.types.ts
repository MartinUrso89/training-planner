import type { DomainExercise } from './exercise.types.js'

export interface DomainSectionType {
  id: string
  name: string
}

export interface DomainPlanTemplate {
  id: string
  name: string
  description: string | null
  userId: string
  createdAt: Date
  updatedAt: Date
  sections: DomainTemplateSection[]
}

export interface DomainTemplateSection {
  id: string
  templateId: string
  sectionTypeId: string
  name: string | null
  sortOrder: number
  rounds: number | null
  timeCap: number | null
  restBetweenExercises: number | null
  restBetweenRounds: number | null
  exercises: DomainTemplateExercise[]
}

export interface DomainTemplateExercise {
  id: string
  templateSectionId: string
  exerciseId: string
  sortOrder: number
  sets: number | null
  reps: number | null
  durationSeconds: number | null
  weight: number | null
  rpe: number | null
  restBetweenSets: number | null
  supersetGroupId: string | null
  supersetOrder: number | null
  notes: string | null
  exercise?: DomainExercise
}

export interface CreatePlanTemplateInput {
  name: string
  description?: string
}

export interface CreateTemplateSectionInput {
  sectionTypeId: string
  name?: string
  sortOrder: number
  rounds?: number
  timeCap?: number
  restBetweenExercises?: number
  restBetweenRounds?: number
}

export interface CreateTemplateExerciseInput {
  exerciseId: string
  sortOrder: number
  sets?: number
  reps?: number
  durationSeconds?: number
  weight?: number
  rpe?: number
  restBetweenSets?: number
  supersetGroupId?: string
  supersetOrder?: number
  notes?: string
}
